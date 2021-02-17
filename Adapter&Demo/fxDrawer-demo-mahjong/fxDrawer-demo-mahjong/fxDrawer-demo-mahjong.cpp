#include <iostream>
#include <vector>
#include <queue>
#include <deque>
#include <random>
#include <map>
#include <array>
#include <stdexcept>
#include <cassert>
#include <thread>
#include <chrono>
#include <string>
#include <sstream>
#include <algorithm>

#define HUMAN_PLAY

// #define _VERBOSE_MODE

using namespace std::chrono_literals;
using namespace std::string_literals;

#include "fxdrawer.h"

typedef int MahjongType;

const std::string magjongName[2][10]{ {"条", "万", "筒", "东风", "南风", "西风", "北风", "红中", "发财", "白板"},
                                     {"",  "一", "二", "三",  "四",  "五",  "六",  "七",  "八",  "九"} };

const std::string fileName[10]{ "bamboo", "man", "pin", "wind-east", "wind-south", "wind-west", "wind-north",
                               "dragon-chun",
                               "dragon-green", "dragon-haku" };

class Mahjong {
    MahjongType type;
    int dot;
    int priority; // 优先级 用于洗牌
public:
    Mahjong() : type(-1), dot(-1), priority(0) {}

    Mahjong(MahjongType type, int dot, int priority) : type(type), dot(dot), priority(priority) {}

    MahjongType getType() const { return type; }

    int getDot() const { return dot; }

    int getPriority() const { return priority; }

    bool operator==(const Mahjong& mj) const {
        if (type < 3) {
            if (type == mj.type) {
                return dot == mj.dot;
            }
            else {
                return false;
            }
        }
        else return type == mj.type;
    }

    bool operator<(const Mahjong& mj) const {
        return dot < mj.dot;
    }

    friend std::ostream& operator<<(std::ostream& os, const Mahjong& mahjong) {
        os << magjongName[1][mahjong.dot] << magjongName[0][(int)mahjong.type];
        return os;
    }

    std::string toString() {
        std::string str;
        str += magjongName[1][dot];
        str += magjongName[0][type];
        return str;
    }

    std::string toFileName() {
        std::string str = "./imgs/";
        str += fileName[type];
        if (dot != 0)str += std::to_string(dot);
        str += ".png";
        return str;
    }
};

std::deque<Mahjong> mahjongs; // 存储摸排麻将的双端队列，其中一端用于开杠

std::map<Mahjong, int> throwed; // 用于记录扔出去的每张麻将有多少个

int turn = 0;

Mahjong humanThrow(-1, -1, 0);

void initMahjong() {
    // 创建用于洗牌的优先队列
    auto cmpPriority = [](Mahjong m1, Mahjong m2) -> auto { return m1.getPriority() < m2.getPriority(); };
    std::priority_queue<Mahjong, std::vector<Mahjong>, decltype(cmpPriority)> priorityQueue(cmpPriority);
    // 创建随机数生成器
    std::random_device rd;  // 将用于为随机数引擎获得种子
    std::mt19937 gen(rd()); // 以播种标准 mersenne_twister_engine
    std::uniform_int_distribution<> dis(1, 1024);
    for (int i = 0; i < 10; i++)
        for (int j = (i < 3 ? 1 : 0); j < (i < 3 ? 10 : 1); j++)
            for (int k = 0; k < 4; k++)
                priorityQueue.emplace(static_cast<MahjongType>(i), j, dis(gen));
    while (!priorityQueue.empty()) {
        mahjongs.push_back(priorityQueue.top());
        priorityQueue.pop();
    }
}

std::vector<objID> buts;
std::vector<Mahjong> mjs;

objID rect;

class Player {
    std::array<std::array<int, 10>, 4> ownUnuse{ 0 };
    std::array<std::array<int, 10>, 4> ownUse{ 0 };
    int ownNum = 0, ownUnuseNum = 0, ownUseNum = 0;
    std::vector<Mahjong> pairs;
    std::vector<Mahjong> fixed;
    int counter = 0;

    bool tryToEat(Mahjong& mj, Player temp) {
        handleSth();
        temp.fetchMj(mj);
        temp.handleSth();
        if (temp.ownUseNum != ownUseNum) {
            return true;
        }
        return false;
    }

    bool tryToWin(Mahjong& mj, Player temp) {
        handleSth();
        temp.fetchMj(mj);
        try {
            temp.handleSth();
        }
        catch (Mahjong) {
            return true;
        }
        return false;
    }

    Mahjong lastFetch;

    void handleSth() { // 分析牌局面
        // 强制每次放弃之前分析结果 重新分析
        for (int l = 0; l < 4; ++l) {
            for (int i = 0; i < 10; ++i) {
                if (ownUse[l][i] > 0) {
                    ownUnuse[l][i] += ownUse[l][i];
                    ownUse[l][i] = 0;
                }
            }
        }
        ownUnuseNum = ownNum;
        ownUseNum = 0;
        // 风
        for (int i = 3; i < 10; i++) {
            if (ownUnuse[3][i] == 3) {
                ownUnuse[3][i] -= 3;
                ownUse[3][i] += 3;
                ownUnuseNum -= 3;
            }
        }
        // 处理三个连起来的
        for (int j = 0; j < 3; j++)
            for (int i = 1; i < 10 - 2; i++) {
                if (ownUnuse[j][i] >= 1)
                    if (ownUnuse[j][i + 1] >= 1)
                        if (ownUnuse[j][i + 2] >= 1) {
                            if (ownUnuse[j][i] >= 2 && i < 7) {
                                if (ownUnuse[j][i + 1] >= 1 && ownUnuse[j][i + 2] >= 1 && ownUnuse[j][i + 3] >= 1) {
                                    for (int k = 0; k < 3; k++) {
                                        ownUnuse[j][i + 1 + k]--;
                                        ownUse[j][i + 1 + k]++;
                                    }
                                    ownUnuseNum -= 3;
                                    ownUseNum += 3;
                                }
                                else {
                                    for (int k = 0; k < 3; k++) {
                                        ownUnuse[j][i + k]--;
                                        ownUse[j][i + k]++;
                                    }
                                    ownUnuseNum -= 3;
                                    ownUseNum += 3;
                                }
                            }
                            else {
                                for (int k = 0; k < 3; k++) {
                                    ownUnuse[j][i + k]--;
                                    ownUse[j][i + k]++;
                                }
                                ownUnuseNum -= 3;
                                ownUseNum += 3;
                            }
                        }
            }
        // 处理三个一样的
        for (int j = 0; j < 3; j++)
            for (int i = 1; i < 10; i++) {
                if (ownUnuse[j][i] == 3) {
                    ownUnuse[j][i] -= 3;
                    ownUse[j][i] += 3;
                    ownUnuseNum -= 3;
                    ownUseNum += 3;
                }
            }
        pairs.clear();
        for (int j = 0; j < 3; j++) {
            for (int i = 1; i < 10; i++) {
                if (ownUnuse[j][i] == 2) {
                    pairs.emplace_back(static_cast<MahjongType>(j), i, 0);
                }
            }
        }
        for (int i = 3; i < 10; i++) {
            if (ownUnuse[3][i] == 2) {
                pairs.emplace_back(i, 0, 0);
            }
        }

        if (ownUnuseNum == 2)
            if (pairs.size() == 1)
                throw lastFetch;

    }

public:
    bool isAi = true;

    bool canPeng(Mahjong& mj) {
        for (const auto& item : pairs) {
            if (item == mj) {
                // std::cout << "检测到可以碰" << item;
                return true;
            }
        }
        return false;
    }

    bool canEat(Mahjong& mj) {
        if (mj.getType() > 2)return false; // 不能吃风
        if (isAi)return tryToEat(mj, *this);
        else {
            // 强制每次放弃之前分析结果 全部放入unuse
            for (int l = 0; l < 4; ++l) {
                for (int i = 0; i < 10; ++i) {
                    if (ownUse[l][i] > 0) {
                        ownUnuse[l][i] += ownUse[l][i];
                        ownUse[l][i] = 0;
                    }
                }
            }
            ownUnuseNum = ownNum;
            ownUseNum = 0;
            //
            std::string str;
            bool type[3] = { false }; // 前 中 后 三种情况
            if (mj.getDot() < 8)
                if (ownUnuse[mj.getType()][mj.getDot() + 1] && ownUnuse[mj.getType()][mj.getDot() + 2])type[0] = true;
            if (mj.getDot() > 1 && mj.getDot() < 9)
                if (ownUnuse[mj.getType()][mj.getDot() - 1] && ownUnuse[mj.getType()][mj.getDot() + 1])type[1] = true;
            if (mj.getDot() > 2)
                if (ownUnuse[mj.getType()][mj.getDot() - 1] && ownUnuse[mj.getType()][mj.getDot() - 2])type[2] = true;
            if (!(type[0] || type[1] || type[2]))return false;
            if (type[0]) {
                str += "使用";
                str += Mahjong(mj.getType(), mj.getDot() + 1, 0).toString();
                str += "和";
                str += Mahjong(mj.getType(), mj.getDot() + 2, 0).toString();
                str += "|";
            }
            if (type[1]) {
                str += "使用";
                str += Mahjong(mj.getType(), mj.getDot() - 1, 0).toString();
                str += "和";
                str += Mahjong(mj.getType(), mj.getDot() + 1, 0).toString();
                str += "|";
            }
            if (type[2]) {
                str += "使用";
                str += Mahjong(mj.getType(), mj.getDot() - 2, 0).toString();
                str += "和";
                str += Mahjong(mj.getType(), mj.getDot() - 1, 0).toString();
                str += "|";
            }
            str.pop_back();
            int choose = showChooseDialog(("玩家"s + std::to_string(turn) + "打了"s +
                mj.toString() + "，你可以吃，你是否要吃？").c_str(), str.c_str());
            if (choose == 0)return false;
            // fetchMj(mj);
            return true;
        }
    }

    bool canWin(Mahjong& mj) {
        if (tryToWin(mj, *this)) {
            return true;
        }
        else return false;
    }

    void fetchMj(Mahjong mj) {
        lastFetch = mj;
        if (static_cast<int>(mj.getType()) < 3)ownUnuse[static_cast<int>(mj.getType())][mj.getDot()]++;
        else ownUnuse[3][static_cast<int>(mj.getType())]++;
        ownNum++;
        ownUnuseNum++;
    }

    Mahjong throwMj() {
        if (isAi) {
            handleSth();
            Mahjong willThrow(-1, -1, 3);
            try {
                for (int i = 3; i < 10; i++) {
                    if (ownUnuse[3][i] == 1) {
                        ownNum--;
                        ownUnuseNum--;
                        ownUnuse[3][i]--;
                        willThrow = Mahjong(i, 0, 0);
                        throw 0;
                    }
                }

                // 创建用于出牌的优先队列
                auto cmpPriority = [](Mahjong m1, Mahjong m2) -> auto { return m1.getPriority() < m2.getPriority(); };
                std::priority_queue<Mahjong, std::vector<Mahjong>, decltype(cmpPriority)> priorityQueue(cmpPriority);

                for (int j = 0; j < 3; j++)
                    for (int i = 1; i < 10; i++)
                        if (ownUnuse[j][i] == 1) {
                            if (i == 1) {
                                if (ownUnuse[j][2] == 0 && ownUnuse[j][3] == 0) priorityQueue.emplace(j, i, 6);
                                else if (ownUnuse[j][2] == 0 || ownUnuse[j][3] == 0) priorityQueue.emplace(j, i, 3);
                                else
                                    priorityQueue.emplace(j, i, 0);
                            }
                            else if (i == 9) {
                                if (ownUnuse[j][8] == 0 && ownUnuse[j][7] == 0) priorityQueue.emplace(j, i, 6);
                                else if (ownUnuse[j][8] == 0 || ownUnuse[j][7] == 0) priorityQueue.emplace(j, i, 3);
                                else
                                    priorityQueue.emplace(j, i, 0);
                            }
                            else if (i == 2 || i == 8) {
                                if (ownUnuse[j][i + 1] == 0 && ownUnuse[j][i - 1] == 0) priorityQueue.emplace(j, i, 5);
                                else if (ownUnuse[j][i + 1] == 0 || ownUnuse[j][i - 1] == 0)
                                    priorityQueue.emplace(j, i, 2);
                                else
                                    priorityQueue.emplace(j, i, 0);
                            }
                            else {
                                if (ownUnuse[j][i + 1] == 0 && ownUnuse[j][i - 1] == 0 && ownUnuse[j][i + 2] == 0 &&
                                    ownUnuse[j][i - 2] == 0)
                                    priorityQueue.emplace(j, i, 4);
                                else if (ownUnuse[j][i + 1] == 1 || ownUnuse[j][i - 1] == 1)
                                    priorityQueue.emplace(j, i, 2);
                                else priorityQueue.emplace(j, i, 3);
                            }
                        }
                for (int j = 0; j < 4; j++)
                    for (int i = 1; i < 10; i++)
                        if (ownUnuse[j][i] == 2) {
                            if (pairs.size() >= 3)priorityQueue.emplace(j, i, 3);
                            if (pairs.size() == 2)priorityQueue.emplace(j, i, 2);
                            if (pairs.size() == 1)priorityQueue.emplace(j, i, 1);
                        }
                willThrow = priorityQueue.top();
                ownUnuse[willThrow.getType()][willThrow.getDot()]--;
                ownUnuseNum--;
                ownNum--;
            }
            catch (...) {}
            if (throwed.find(willThrow) == throwed.end())throwed[willThrow] = 1;
            else throwed[willThrow]++;
            return willThrow;
        }
        else {
            handleSth();
            int i = 0;
            for (auto& item : getMahjongs()) {
                // std::cout<<human.getMahjongs().size();
                if (item == lastFetch && counter != 0) {
                    changePosition(rect, i * 55 + 100, 0);
                }
                changePath(buts[i], item.toFileName().c_str());
                mjs.at(i) = item;
                i++;
            }
            counter++;
            int clked = waitForClick();
            for (int j = 0; j < buts.size(); j++) {
                if (buts[j] == clked) {
                    changePath(buts[j], "./imgs/dragon-blank.png");
                    humanThrow = mjs[j];
                    break;
                }
            }
            if (humanThrow.getType() >= 3) {
                if (ownUnuse[3][humanThrow.getType()] > 0) {
                    ownUnuse[3][humanThrow.getType()]--;
                    ownUnuseNum--;
                }
                else if (ownUse[3][humanThrow.getType()] > 0) {
                    ownUse[3][humanThrow.getType()]--;
                    ownUseNum--;
                }
                else
                    assert(0);
            }
            else {
                if (ownUnuse[humanThrow.getType()][humanThrow.getDot()] > 0) {
                    ownUnuse[humanThrow.getType()][humanThrow.getDot()]--;
                    ownUnuseNum--;
                }
                else if (ownUse[humanThrow.getType()][humanThrow.getDot()] > 0) {
                    ownUse[humanThrow.getType()][humanThrow.getDot()]--;
                    ownUseNum--;
                }
                else
                    assert(0);
            }
            ownNum--;
            changePosition(rect, 0, 0);
            return humanThrow;
        }
    }

    std::vector<Mahjong> getMahjongs() {
        std::array<std::array<int, 10>, 4> show{ 0 };
        std::vector<Mahjong> ret;
        for (int l = 0; l < 4; ++l) {
            for (int i = 0; i < 10; ++i) {
                show[l][i] += ownUse[l][i];
                show[l][i] += ownUnuse[l][i];
            }
        }
        for (int j = 0; j < 3; j++)
            for (int i = 1; i < 10; i++)
                for (int k = show[j][i]; k > 0; k--)
                    ret.emplace_back(j, i, 0);
        for (int i = 3; i < 10; i++)
            for (int k = show[3][i]; k > 0; k--)
                ret.emplace_back(i, 0, 0);
        return ret;
    }

    friend std::ostream& operator<<(std::ostream& os, const Player& player) {
        for (int j = 0; j < 3; j++)
            for (int i = 1; i < 10; i++)
                for (int k = player.ownUnuse[j][i]; k > 0; k--)
                    os << Mahjong(static_cast<MahjongType>(j), i, 0) << ' ';
        for (int i = 3; i < 10; i++)
            for (int k = player.ownUnuse[3][i]; k > 0; k--)
                os << Mahjong(static_cast<MahjongType>(i), 0, 0) << ' ';
        for (int j = 0; j < 3; j++)
            for (int i = 1; i < 10; i++)
                for (int k = player.ownUse[j][i]; k > 0; k--)
                    os << Mahjong(static_cast<MahjongType>(j), i, 0) << ' ';
        for (int i = 3; i < 10; i++)
            for (int k = player.ownUse[3][i]; k > 0; k--)
                os << Mahjong(static_cast<MahjongType>(i), 0, 0) << ' ';
        return os;
    }

};

int main() {

    initDrawer(800, 300);
    setColor(0, 30, 200, 0.5);
    rect = drawRectangle(-88, 197, 56, 85);
    setColor(0, 0, 0, 1);
    changePosition(rect, 10, 10);
    int textBoxID = putText(5, 5, "欢迎打麻将！by xianfei", 18);
    mjs.resize(14);
    int x = 0;
    for (int i = 0; i < 14; ++i) {
        buts.emplace_back(putImage(x, 200, 80, 80, "./imgs/dragon-blank.png"));
        // buts.emplace_back(putButton(x, 80, 50, 100, ""));
        x += 55;
    }

    while (1) {
        initMahjong();
        std::vector<Player> players;
        players.resize(4);
        int humanPlayer = 0;
        players[humanPlayer].isAi = false;

        for (int i = 0; i < 13; i++) {
            for (auto& item : players) {
                item.fetchMj(mahjongs.back());
                mahjongs.pop_back();
            }
        }
        int counter = 0;
        try {
            std::stringstream ss;
            ss << "欢迎打麻将！您是0号玩家。\n by xianfei";
            while (1) {
                std::this_thread::sleep_for(100ms);
                counter++;

                std::cout << "第" << turn << "号玩家：" << std::endl;
                std::cout << "\t\t" << players[turn] << std::endl;
                std::cout << "\t抓了" << mahjongs.back() << std::endl;
                if (turn == humanPlayer && counter != 1)ss << "你抓了" << mahjongs.back() << std::endl;
                if (players[turn].canWin(mahjongs.back()))throw mahjongs.back();
                players[turn].fetchMj(mahjongs.back());
                mahjongs.pop_back();
                std::cout << "\t\t" << players[turn] << std::endl;
                changeText(textBoxID, ss.str().c_str());
                auto lastThrowed = players[turn].throwMj();
                if (turn == humanPlayer) ss.str("");
                ss << "第" << turn << "号玩家：";
                ss << "打了" << lastThrowed << std::endl;
                std::cout << "\t打了" << lastThrowed << std::endl;
                std::cout << "\t\t" << players[turn] << std::endl;
                if (mahjongs.empty()) {
                    throw 1;
                    initMahjong();
                }

                for (int i = 0; i < 4; i++) {
                    if (players[i].canWin(lastThrowed)) {
                        std::stringstream ss;
                        ss << "第" << i << "号玩家赢了！！！" << turn << "玩家点炮！" << "ta打了" << lastThrowed << std::endl;
                        ss << "他的牌是 " << players[i] << std::endl;
                        std::cout << ss.str();
                        players[i].fetchMj(lastThrowed);
#ifdef HUMAN_PLAY
                        changeText(textBoxID, ss.str().c_str());
                        if (i == humanPlayer) {
                            int i = 0;
                            for (auto& item : players[humanPlayer].getMahjongs()) {
                                // std::cout<<human.getMahjongs().size();
                                changePath(buts[i], item.toFileName().c_str());
                                mjs.at(i) = item;
                                i++;
                            }
                        }
#endif
                        std::cout << "\t\t" << players[i] << std::endl;
                        throw 1.1;
                    }
                }
                auto opt = [&](const std::string& str) -> void {
                    std::cout << "第" << turn << "号玩家" << str << lastThrowed << std::endl;
                    std::cout << "\t\t" << players[turn] << std::endl;
                    players[turn].fetchMj(lastThrowed);
                    std::cout << "\t\t" << players[turn] << std::endl;
                    ss << "第" << turn << "号玩家：";
                    ss << str << lastThrowed;
                    changeText(textBoxID, ss.str().c_str());
                    auto tmj = players[turn].throwMj();
                    if (turn == humanPlayer) ss.str("");
                    std::cout << "\t打了" << tmj << std::endl;
                    ss << " 打了" << tmj << std::endl;
                    changeText(textBoxID, ss.str().c_str());
                    std::cout << "\t\t" << players[turn] << std::endl;
                };
                do {
                    if (players[(turn + 1) % 4].canPeng(lastThrowed)) {
                        if ((turn + 1) % 4 == humanPlayer)
                            if (showChooseDialog(("玩家"s + std::to_string(turn) + "打了"s +
                                lastThrowed.toString() + "，你可以碰，你是否要碰？").c_str(), "碰！") == 0)
                                break;
                        turn = (turn + 1) % 4;
                        opt("碰了");
                    }
                    else if (players[(turn + 2) % 4].canPeng(lastThrowed)) {
                        if ((turn + 2) % 4 == humanPlayer)
                            if (showChooseDialog(("玩家"s + std::to_string(turn) + "打了"s +
                                lastThrowed.toString() + "，你可以碰，你是否要碰？").c_str(), "碰！") == 0)
                                break;
                        turn = (turn + 2) % 4;
                        opt("碰了");
                    }
                    else if (players[(turn + 3) % 4].canPeng(lastThrowed)) {
                        if ((turn + 3) % 4 == humanPlayer)
                            if (showChooseDialog(("玩家"s + std::to_string(turn) + "打了"s +
                                lastThrowed.toString() + "，你可以碰，你是否要碰？").c_str(), "碰！") == 0)
                                break;
                        turn = (turn + 3) % 4;
                        opt("碰了");
                    }
                    else if (players[(turn + 1) % 4].canEat(lastThrowed)) {
                        turn = (turn + 1) % 4;
                        opt("吃了");
                    }
                } while (false);
                turn = (turn + 1) % 4;
            }
        }
        catch (int) {
            std::cout << "牌没了！,打了" << counter / 4 << "轮" << std::endl;
            changeText(textBoxID, "牌没了！！！");
        }
        catch (double) {
            std::cout << "打了" << counter / 4 << "轮" << std::endl;
        }
        catch (Mahjong& mj) {
            std::stringstream ss;
            players[turn].fetchMj(mj);
            {
                int i = 0;
                for (auto& item : players[humanPlayer].getMahjongs()) {
                    // std::cout<<human.getMahjongs().size();
                    changePath(buts[i], item.toFileName().c_str());
                    mjs.at(i) = item;
                    i++;
                }
            }
            ss << "第" << turn << "号玩家赢了！！！并且是自摸！！！" << "摸了" << mj.toString() << std::endl;
            ss << "他的牌是 " << players[turn] << std::endl;
            std::cout << ss.str();
#ifdef HUMAN_PLAY
            changeText(textBoxID, ss.str().c_str());
#endif
            std::cout << "打了" << counter / 4 << "轮" << std::endl;
        }
#ifdef HUMAN_PLAY
        if (showChooseDialog("游戏结束, 是否再来一局", "好呀！！！") == 0)break;
        mahjongs.clear();
        throwed.clear();
        turn = 0;
    }
    closeDrawer();
#endif
}
