// force encode chinese as utf-8
#ifdef _MSC_VER
#pragma execution_character_set("utf-8")
#endif

#ifndef XIANFEI_DRAWER_H
#define XIANFEI_DRAWER_H

#ifndef _XKEYCHECK_H
#define _XKEYCHECK_H
#endif


#ifdef _MSC_VER
#pragma execution_character_set("utf-8")
#ifdef _WIN64 
#pragma comment(lib,"fxdLib64.lib")
#else
#pragma comment(lib,"fxdLib86.lib")
#endif
#endif

#ifdef __cplusplus
extern "C"
{
#endif

typedef int objID; // Object ID -  a descriptor referencing the fx object

// 关闭绘图器
int closeDrawer();

// 初始化：用于初始化绘图器，接受参数为绘图窗口的宽度和高度。
// width : 创建窗口宽度
// height : 创建窗口高度
int initDrawer(int width, int height);

// 设置颜色：用于设置绘图器将要绘图的颜色，RGBa格式，其中色彩分量RGB范围0-255，透明度a范围0-1。
// r : 红色分量，区间为0-255
// g : 绿色分量，区间为0-255
// b : 蓝色分量，区间为0-255
// a : 透明度，区间为0.0-1.0，0.0为全透明，1.0为不透明
void setColor(int r, int g, int b, double a);

// 设置颜色：用于设置绘图器将要绘图的颜色，Web格式。
// color : web格式色彩，可使用内建的fxColor开头的色彩常量。详情请见'色彩常量'
void setColorW(const char* color);

// 设置描边颜色：用于设置绘图器将要绘制图形并描边（仅限draw打头的绘制函数使用），RGBa格式，其中色彩分量RGB范围0-255，透明度a范围0-1，width是描边宽度。不描边时可将后两个值的任意一个设置为0.0即可。
// r : 红色分量，区间为0-255
// g : 绿色分量，区间为0-255
// b : 蓝色分量，区间为0-255
// a : 透明度，区间为0.0-1.0，0.0为全透明，1.0为不透明
// width : 描边宽度，单位为像素
void setStroke(int r, int g, int b, double a, double width);

// 设置描边颜色：用于设置绘图器将要绘制图形并描边（仅限draw打头的绘制函数使用），Web格式，width是描边宽度。不描边时可将后两个值的任意一个设置为0.0即可。
// color : web格式色彩，可使用内建的fxColor开头的色彩常量。详情请见'色彩常量'
// width : 描边宽度，单位为像素
void setStrokeW(const char* color, double width);

// 绘制一个圆，参数为坐标及半径，返回对象的引用ID。
// x : 圆的横坐标
// y : 圆的纵坐标
// radius : 圆的半径
// 返回值：objID
objID drawCircle(int x, int y, int radius);

// 绘制一个点，参数为坐标及半径以及平滑阈值
// x : 圆的横坐标
// y : 圆的纵坐标
// radius : 圆的半径
// smooth： 平滑阈值，0为关闭，此设置为用来平滑的最大距离。可以自行尝试体会一下
void drawPoint(int x, int y, double radius, int smooth);

// 绘制一个矩形，参数为坐标及宽高，返回对象的引用ID。
// x : 矩形的横坐标
// y : 矩形的纵坐标
// weidth : 矩形的宽
// height : 矩形的高
// 返回值：objID
objID drawRectangle(int x, int y, int width, int height);

// 绘制一个多边形，参数为顶点数、顶点x / y坐标数组，返回对象的引用ID。
// numberOfPoints : 多边形定点数
// xArray : 顶点x坐标数组
// yArray : 顶点y坐标数组
// 返回值：objID
objID drawPolygon(int numberOfPoints, int *xArray, int *yArray);

// 在给定的坐标处放置一段文字，其中size为字体大小，返回对象的引用ID。
// x : 放置文字的横坐标
// y : 放置文字的纵坐标
// stringContext : 待放置文字的字符串
// size : 放置文字的字体大小
// 返回值：objID
objID putText(int x,int y,const char* stringContext,double size);

// 弹出选择对话框: 用于创建一个选择对话框，接受参数为标题、内容及选项，其中选项之间用|分隔。返回值为选项的编号-1，从0开始，直接关闭也返回0。
// stringContext: 提示文本
// options: 选项，用|分隔，如无需选项可传入NULL或空串
// 返回值：选项
int showChooseDialog(const char* stringContext,const char* options);

// 弹出文件选择窗口: 用于选择文件，接受参数为存放文件路径字符串缓冲区指针。
//  stringBuffer : （作为返回值） 文件目录字符串
void chooseFile(char* stringBuffer);

// 弹出文件保存窗口: 用于保存文件，接受参数为存放文件路径字符串缓冲区指针。
//  stringBuffer : （作为返回值） 文件目录字符串
void chooseSaveFile(char* stringBuffer);

// 弹出输入对话框: 可以输入一行或多行文本
// hintContext: 提示字符串
// stringBuffer: （作为返回值）用于存放输入的内容
void showInputDialog(const char* hintContext, char* stringBuffer);

// 用于改变文本框、输入框或按钮的文本内容，接受参数为需要改变的对象引用ID及文字。
// id : 需要改变文本的对象id
// stringContext : 修改后文本的字符串
void changeText(objID id,const char* stringContext);

// 用于改变图片显示的文件路径，接受参数为需要改变的对象引用ID及文件路径。
// id : 需要改变的对象id
// stringContext : 修改后路径的字符串
void changePath(objID id,const char* stringContext);

//用于改变对象的位置，对于绘制的图形改变的是相对位置，对于放置的控件改变的是绝对位置（自己试试就知道了）。
// id : 需要改变位置的图片的id
// x : 目标横坐标
// y : 目标纵坐标
void changePosition(objID id,int x,int y);

//获取文字 用于获取文本框/放置的文字/按钮中的文字，接受参数为对象ID及存放文字的字符串缓冲区指针。
// id: 对象ID
// stringBuffer: （作为返回值）文件目录字符串
void getText(objID id,char* stringBuffer);

// 用于调取fxDrawer内置的JavaScript解释器，code为JS代码，stringBuffer为返回值（原生类型以字符串形式，对象以Json形式）。详情请见JS解释器部分。
// code: JavaScript语句
// stringBuffer : （作为返回值）为JavaScript语句执行结果，调用eval函数，原生类型以字符串形式，对象以Json形式。
void executeJs(const char* code, char* stringBuffer);

//删除对象 用于删除窗口上的一个对象，接受参数为需要删除的对象引用ID。
void removeByID(objID id);

// 清空绘图区，不会删除控件
void clearDraw();

// 等待按键/图片的点击响应
// 返回值: 点击（对于按钮）/发生修改（对于input）的id
objID waitForClick();

// 等待空白处的点击响应
// x,y : 点击的坐标
void waitForClickXy(int* x, int* y);

// 等待各种响应
// stringBuffer : （作为返回值）: 如果点击控件或改变input值返回字符串  id:控件id  点击空白处返回  xy:x坐标,y坐标  按下键盘返回  kb:键值
void waitForAny(char* stringBuffer);

// 放置一个按钮，参数为坐标及宽高及按钮上的文字，返回对象的引用ID。
// x : 放置按钮的横坐标
// y : 放置按钮的纵坐标
// width : 放置按钮的宽度
// height : 放置按钮的长度
// stringContext : 存放按钮上的文字的字符串
// 返回值：objID
objID putButton(int x, int y, int width, int height,const char* stringContext);

// 放置一张图片，参数为坐标及宽高及图片的路径，返回对象的引用ID。
// x : 放置图片的横坐标
// y : 放置图片的纵坐标
// width : 放置图片的宽度
// height : 放置图片的长度
// pathString : 存放图片的路径
// 返回值：objID
objID putImage(int x, int y, int width, int height,const char* pathString);

// 放置一个输入框，参数为坐标及宽高，返回对象的引用ID。
// x : 放置输入框的横坐标
// y : 放置输入框的纵坐标
// width : 放置输入框的宽度
// height : 放置输入框的长度
// 返回值：objID
objID putInputBox(int x, int y, int width, int height, const char* type);

// 设置要连接的fxDrawer端口号，默认6666
void fxSetPort(int port);

// 设置要连接的fxDrawer端口号，默认127.0.0.1
void fxSetHost(const char* host);

// 设置当前使用的Socket描述号，默认由initDrawer函数赋值，可在多窗口时使用
void fxSetSd(int sd);

// 设置是否在窗口关闭后杀死调用者 默认为true或1
void fxSetKillAfterCloseWindow(int isIt);

// 设置是否在调用者断开连接后窗口关闭 默认为false或0
void fxSetCloseOnBroke(int isIt);


#ifdef __cplusplus
}
#endif

// 以下为色彩常量
#define fxColorLightPink "#FFB6C1" // 浅粉红
#define fxColorPink "#FFC0CB" // 粉红
#define fxColorCrimson "#DC143C" // 深红(猩红)
#define fxColorLavenderBlush "#FFF0F5" // 淡紫红
#define fxColorPaleVioletRed "#DB7093" // 弱紫罗兰红
#define fxColorHotPink "#FF69B4" // 热情的粉红
#define fxColorDeepPink "#FF1493" // 深粉红
#define fxColorMediumVioletRed "#C71585" // 中紫罗兰红
#define fxColorOrchid "#DA70D6" // 暗紫色(兰花紫)
#define fxColorThistle "#D8BFD8" // 蓟色
#define fxColorPlum "#DDA0DD" // 洋李色(李子紫)
#define fxColorViolet "#EE82EE" // 紫罗兰
#define fxColorMagenta "#FF00FF" // 洋红(玫瑰红)
#define fxColorFuchsia "#FF00FF" // 紫红(灯笼海棠)
#define fxColorDarkMagenta "#8B008B" // 深洋红
#define fxColorPurple "#800080" // 紫色
#define fxColorMediumOrchid "#BA55D3" // 中兰花紫
#define fxColorDarkViolet "#9400D3" // 暗紫罗兰
#define fxColorDarkOrchid "#9932CC" // 暗兰花紫
#define fxColorIndigo "#4B0082" // 靛青/紫兰色
#define fxColorBlueViolet "#8A2BE2" // 蓝紫罗兰
#define fxColorMediumPurple "#9370DB" // 中紫色
#define fxColorMediumSlateBlue "#7B68EE" // 中暗蓝色(中板岩蓝)
#define fxColorSlateBlue "#6A5ACD" // 石蓝色(板岩蓝)
#define fxColorDarkSlateBlue "#483D8B" // 暗灰蓝色(暗板岩蓝)
#define fxColorLavender "#E6E6FA" // 淡紫色(熏衣草淡紫)
#define fxColorGhostWhite "#F8F8FF" // 幽灵白
#define fxColorBlue "#0000FF" // 纯蓝
#define fxColorMediumBlue "#0000CD" // 中蓝色
#define fxColorMidnightBlue "#191970" // 午夜蓝
#define fxColorDarkBlue "#00008B" // 暗蓝色
#define fxColorNavy "#000080" // 海军蓝
#define fxColorRoyalBlue "#4169E1" // 皇家蓝/宝蓝
#define fxColorCornflowerBlue "#6495ED" // 矢车菊蓝
#define fxColorLightSteelBlue "#B0C4DE" // 亮钢蓝
#define fxColorLightSlateGray "#778899" // 亮蓝灰(亮石板灰)
#define fxColorSlateGray "#708090" // 灰石色(石板灰)
#define fxColorDodgerBlue "#1E90FF" // 闪兰色(道奇蓝)
#define fxColorAliceBlue "#F0F8FF" // 爱丽丝蓝
#define fxColorSteelBlue "#4682B4" // 钢蓝/铁青
#define fxColorLightSkyBlue "#87CEFA" // 亮天蓝色
#define fxColorSkyBlue "#87CEEB" // 天蓝色
#define fxColorDeepSkyBlue "#00BFFF" // 深天蓝
#define fxColorLightBlue "#ADD8E6" // 亮蓝
#define fxColorPowderBlue "#B0E0E6" // 粉蓝色(火药青)
#define fxColorCadetBlue "#5F9EA0" // 军兰色(军服蓝)
#define fxColorAzure "#F0FFFF" // 蔚蓝色
#define fxColorLightCyan "#E0FFFF" // 淡青色
#define fxColorPaleTurquoise "#AFEEEE" // 弱绿宝石
#define fxColorCyan "#00FFFF" // 青色
#define fxColorAqua "#00FFFF" // 浅绿色(水色)
#define fxColorDarkTurquoise "#00CED1" // 暗绿宝石
#define fxColorDarkSlateGray "#2F4F4F" // 暗瓦灰色(暗石板灰)
#define fxColorDarkCyan "#008B8B" // 暗青色
#define fxColorTeal "#008080" // 水鸭色
#define fxColorMediumTurquoise "#48D1CC" // 中绿宝石
#define fxColorLightSeaGreen "#20B2AA" // 浅海洋绿
#define fxColorTurquoise "#40E0D0" // 绿宝石
#define fxColorAquamarine "#7FFFD4" // 宝石碧绿
#define fxColorMediumAquamarine "#66CDAA" // 中宝石碧绿
#define fxColorMediumSpringGreen "#00FA9A" // 中春绿色
#define fxColorMintCream "#F5FFFA" // 薄荷奶油
#define fxColorSpringGreen "#00FF7F" // 春绿色
#define fxColorMediumSeaGreen "#3CB371" // 中海洋绿
#define fxColorSeaGreen "#2E8B57" // 海洋绿
#define fxColorHoneydew "#F0FFF0" // 蜜色(蜜瓜色)
#define fxColorLightGreen "#90EE90" // 淡绿色
#define fxColorPaleGreen "#98FB98" // 弱绿色
#define fxColorDarkSeaGreen "#8FBC8F" // 暗海洋绿
#define fxColorLimeGreen "#32CD32" // 闪光深绿
#define fxColorLime "#00FF00" // 闪光绿
#define fxColorForestGreen "#228B22" // 森林绿
#define fxColorGreen "#008000" // 纯绿
#define fxColorDarkGreen "#006400" // 暗绿色
#define fxColorChartreuse "#7FFF00" // 黄绿色(查特酒绿)
#define fxColorLawnGreen "#7CFC00" // 草绿色(草坪绿_
#define fxColorGreenYellow "#ADFF2F" // 绿黄色
#define fxColorDarkOliveGreen "#556B2F" // 暗橄榄绿
#define fxColorYellowGreen "#9ACD32" // 黄绿色
#define fxColorOliveDrab "#6B8E23" // 橄榄褐色
#define fxColorBeige "#F5F5DC" // 米色/灰棕色
#define fxColorLightGoldenrodYellow "#FAFAD2" // 亮菊黄
#define fxColorIvory "#FFFFF0" // 象牙色
#define fxColorLightYellow "#FFFFE0" // 浅黄色
#define fxColorYellow "#FFFF00" // 纯黄
#define fxColorOlive "#808000" // 橄榄
#define fxColorDarkKhaki "#BDB76B" // 暗黄褐色(深卡叽布)
#define fxColorLemonChiffon "#FFFACD" // 柠檬绸
#define fxColorPaleGoldenrod "#EEE8AA" // 灰菊黄(苍麒麟色)
#define fxColorKhaki "#F0E68C" // 黄褐色(卡叽布)
#define fxColorGold "#FFD700" // 金色
#define fxColorCornsilk "#FFF8DC" // 玉米丝色
#define fxColorGoldenrod "#DAA520" // 金菊黄
#define fxColorDarkGoldenrod "#B8860B" // 暗金菊黄
#define fxColorFloralWhite "#FFFAF0" // 花的白色
#define fxColorOldLace "#FDF5E6" // 老花色(旧蕾丝)
#define fxColorWheat "#F5DEB3" // 浅黄色(小麦色)
#define fxColorMoccasin "#FFE4B5" // 鹿皮色(鹿皮靴)
#define fxColorOrange "#FFA500" // 橙色
#define fxColorPapayaWhip "#FFEFD5" // 番木色(番木瓜)
#define fxColorBlanchedAlmond "#FFEBCD" // 白杏色
#define fxColorNavajoWhite "#FFDEAD" // 纳瓦白(土著白)
#define fxColorAntiqueWhite "#FAEBD7" // 古董白
#define fxColorTan "#D2B48C" // 茶色
#define fxColorBurlyWood "#DEB887" // 硬木色
#define fxColorBisque "#FFE4C4" // 陶坯黄
#define fxColorDarkOrange "#FF8C00" // 深橙色
#define fxColorLinen "#FAF0E6" // 亚麻布
#define fxColorPeru "#CD853F" // 秘鲁色
#define fxColorPeachPuff "#FFDAB9" // 桃肉色
#define fxColorSandyBrown "#F4A460" // 沙棕色
#define fxColorChocolate "#D2691E" // 巧克力色
#define fxColorSaddleBrown "#8B4513" // 重褐色(马鞍棕色)
#define fxColorSeashell "#FFF5EE" // 海贝壳
#define fxColorSienna "#A0522D" // 黄土赭色
#define fxColorLightSalmon "#FFA07A" // 浅鲑鱼肉色
#define fxColorCoral "#FF7F50" // 珊瑚
#define fxColorOrangeRed "#FF4500" // 橙红色
#define fxColorDarkSalmon "#E9967A" // 深鲜肉/鲑鱼色
#define fxColorTomato "#FF6347" // 番茄红
#define fxColorMistyRose "#FFE4E1" // 浅玫瑰色(薄雾玫瑰)
#define fxColorSalmon "#FA8072" // 鲜肉/鲑鱼色
#define fxColorSnow "#FFFAFA" // 雪白色
#define fxColorLightCoral "#F08080" // 淡珊瑚色
#define fxColorRosyBrown "#BC8F8F" // 玫瑰棕色
#define fxColorIndianRed "#CD5C5C" // 印度红
#define fxColorRed "#FF0000" // 纯红
#define fxColorBrown "#A52A2A" // 棕色
#define fxColorFireBrick "#B22222" // 火砖色(耐火砖)
#define fxColorDarkRed "#8B0000" // 深红色
#define fxColorMaroon "#800000" // 栗色
#define fxColorWhite "#FFFFFF" // 纯白
#define fxColorWhiteSmoke "#F5F5F5" // 白烟
#define fxColorGainsboro "#DCDCDC" // 淡灰色(庚斯博罗灰)
#define fxColorLightGrey "#D3D3D3" // 浅灰色
#define fxColorSilver "#C0C0C0" // 银灰色
#define fxColorDarkGray "#A9A9A9" // 深灰色
#define fxColorGray "#808080" // 灰色
#define fxColorDimGray "#696969" // 暗淡的灰色
#define fxColorBlack "#000000" // 纯黑

#endif
