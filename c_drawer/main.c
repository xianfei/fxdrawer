#include "drawer.h"

int main() {
    initDrawer(700, 400);
    setColor(24, 138, 255, 0.5);
    objID label1ID = putText(400, 50, "Hello 你好😆\n这是一个图形库的Demo", 16);
    setColor(255, 0, 0, 0.3);
    objID circleID = drawCircle(150, 150, 50);
    setColor(0, 255, 0, 0.3);
    objID label2ID = putText(400, 300, "Hello 你好😆\n这是一个图形库的Demo", 16);
    objID rectID = drawRectangle(120, 150, 40, 80);
    setColor(0, 0, 255, 0.3);
    int xPoints[] = {200, 200, 400}; int yPoints[] = {200, 300, 300}; // 顶点坐标数组
    objID triaID = drawPolygon(3, xPoints, yPoints); // 三角形
    changeText(label1ID, "点击按钮十次退出程序\n点击三次删除圆形\n点击五次删除矩形\n点击七次删除三角形");
    objID butID = putButton(400, 220, 100, 50, "click here");
    while (1) {
        static int counter = 0;
        char str[32];
        if (waitForClick() == butID) {
            sprintf(str, "您点击了按钮%d次", ++counter);
            changeText(label2ID, str);
        }
        if (counter == 10)break;
        if (counter == 3)removeByID(circleID);
        if (counter == 5)removeByID(rectID);
        if (counter == 7)removeByID(triaID);
    }
    closeDrawer();
    return 0;
}
