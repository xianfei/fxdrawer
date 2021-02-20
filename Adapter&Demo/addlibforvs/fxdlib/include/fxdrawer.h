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

// �رջ�ͼ��
int closeDrawer();

// ��ʼ�������ڳ�ʼ����ͼ�������ܲ���Ϊ��ͼ���ڵĿ�Ⱥ͸߶ȡ�
// width : �������ڿ��
// height : �������ڸ߶�
int initDrawer(int width, int height);

// ������ɫ���������û�ͼ����Ҫ��ͼ����ɫ��RGBa��ʽ������ɫ�ʷ���RGB��Χ0-255��͸����a��Χ0-1��
// r : ��ɫ����������Ϊ0-255
// g : ��ɫ����������Ϊ0-255
// b : ��ɫ����������Ϊ0-255
// a : ͸���ȣ�����Ϊ0.0-1.0��0.0Ϊȫ͸����1.0Ϊ��͸��
void setColor(int r, int g, int b, double a);

// ������ɫ���������û�ͼ����Ҫ��ͼ����ɫ��Web��ʽ��
// color : web��ʽɫ�ʣ���ʹ���ڽ���fxColor��ͷ��ɫ�ʳ������������'ɫ�ʳ���'
void setColorW(const char* color);

// ���������ɫ���������û�ͼ����Ҫ����ͼ�β���ߣ�����draw��ͷ�Ļ��ƺ���ʹ�ã���RGBa��ʽ������ɫ�ʷ���RGB��Χ0-255��͸����a��Χ0-1��width����߿�ȡ������ʱ�ɽ�������ֵ������һ������Ϊ0.0���ɡ�
// r : ��ɫ����������Ϊ0-255
// g : ��ɫ����������Ϊ0-255
// b : ��ɫ����������Ϊ0-255
// a : ͸���ȣ�����Ϊ0.0-1.0��0.0Ϊȫ͸����1.0Ϊ��͸��
// width : ��߿�ȣ���λΪ����
void setStroke(int r, int g, int b, double a, double width);

// ���������ɫ���������û�ͼ����Ҫ����ͼ�β���ߣ�����draw��ͷ�Ļ��ƺ���ʹ�ã���Web��ʽ��width����߿�ȡ������ʱ�ɽ�������ֵ������һ������Ϊ0.0���ɡ�
// color : web��ʽɫ�ʣ���ʹ���ڽ���fxColor��ͷ��ɫ�ʳ������������'ɫ�ʳ���'
// width : ��߿�ȣ���λΪ����
void setStrokeW(const char* color, double width);

// ����һ��Բ������Ϊ���꼰�뾶�����ض��������ID��
// x : Բ�ĺ�����
// y : Բ��������
// radius : Բ�İ뾶
// ����ֵ��objID
objID drawCircle(int x, int y, int radius);

// ����һ���㣬����Ϊ���꼰�뾶�Լ�ƽ����ֵ
// x : Բ�ĺ�����
// y : Բ��������
// radius : Բ�İ뾶
// smooth�� ƽ����ֵ��0Ϊ�رգ�������Ϊ����ƽ���������롣�������г������һ��
void drawPoint(int x, int y, double radius, int smooth);

// ����һ�����Σ�����Ϊ���꼰��ߣ����ض��������ID��
// x : ���εĺ�����
// y : ���ε�������
// weidth : ���εĿ�
// height : ���εĸ�
// ����ֵ��objID
objID drawRectangle(int x, int y, int width, int height);

// ����һ������Σ�����Ϊ������������x / y�������飬���ض��������ID��
// numberOfPoints : ����ζ�����
// xArray : ����x��������
// yArray : ����y��������
// ����ֵ��objID
objID drawPolygon(int numberOfPoints, int *xArray, int *yArray);

// �ڸ��������괦����һ�����֣�����sizeΪ�����С�����ض��������ID��
// x : �������ֵĺ�����
// y : �������ֵ�������
// stringContext : ���������ֵ��ַ���
// size : �������ֵ������С
// ����ֵ��objID
objID putText(int x,int y,const char* stringContext,double size);

// ����ѡ��Ի���: ���ڴ���һ��ѡ��Ի��򣬽��ܲ���Ϊ���⡢���ݼ�ѡ�����ѡ��֮����|�ָ�������ֵΪѡ��ı��-1����0��ʼ��ֱ�ӹر�Ҳ����0��
// stringContext: ��ʾ�ı�
// options: ѡ���|�ָ���������ѡ��ɴ���NULL��մ�
// ����ֵ��ѡ��
int showChooseDialog(const char* stringContext,const char* options);

// �����ļ�ѡ�񴰿�: ����ѡ���ļ������ܲ���Ϊ����ļ�·���ַ���������ָ�롣
//  stringBuffer : ����Ϊ����ֵ�� �ļ�Ŀ¼�ַ���
void chooseFile(char* stringBuffer);

// �����ļ����洰��: ���ڱ����ļ������ܲ���Ϊ����ļ�·���ַ���������ָ�롣
//  stringBuffer : ����Ϊ����ֵ�� �ļ�Ŀ¼�ַ���
void chooseSaveFile(char* stringBuffer);

// ��������Ի���: ��������һ�л�����ı�
// hintContext: ��ʾ�ַ���
// stringBuffer: ����Ϊ����ֵ�����ڴ�����������
void showInputDialog(const char* hintContext, char* stringBuffer);

// ���ڸı��ı���������ť���ı����ݣ����ܲ���Ϊ��Ҫ�ı�Ķ�������ID�����֡�
// id : ��Ҫ�ı��ı��Ķ���id
// stringContext : �޸ĺ��ı����ַ���
void changeText(objID id,const char* stringContext);

// ���ڸı�ͼƬ��ʾ���ļ�·�������ܲ���Ϊ��Ҫ�ı�Ķ�������ID���ļ�·����
// id : ��Ҫ�ı�Ķ���id
// stringContext : �޸ĺ�·�����ַ���
void changePath(objID id,const char* stringContext);

//���ڸı�����λ�ã����ڻ��Ƶ�ͼ�θı�������λ�ã����ڷ��õĿؼ��ı���Ǿ���λ�ã��Լ����Ծ�֪���ˣ���
// id : ��Ҫ�ı�λ�õ�ͼƬ��id
// x : Ŀ�������
// y : Ŀ��������
void changePosition(objID id,int x,int y);

//��ȡ���� ���ڻ�ȡ�ı���/���õ�����/��ť�е����֣����ܲ���Ϊ����ID��������ֵ��ַ���������ָ�롣
// id: ����ID
// stringBuffer: ����Ϊ����ֵ���ļ�Ŀ¼�ַ���
void getText(objID id,char* stringBuffer);

// ���ڵ�ȡfxDrawer���õ�JavaScript��������codeΪJS���룬stringBufferΪ����ֵ��ԭ���������ַ�����ʽ��������Json��ʽ�����������JS���������֡�
// code: JavaScript���
// stringBuffer : ����Ϊ����ֵ��ΪJavaScript���ִ�н��������eval������ԭ���������ַ�����ʽ��������Json��ʽ��
void executeJs(const char* code, char* stringBuffer);

//ɾ������ ����ɾ�������ϵ�һ�����󣬽��ܲ���Ϊ��Ҫɾ���Ķ�������ID��
void removeByID(objID id);

// ��ջ�ͼ��������ɾ���ؼ�
void clearDraw();

// �ȴ�����/ͼƬ�ĵ����Ӧ
// ����ֵ: ��������ڰ�ť��/�����޸ģ�����input����id
objID waitForClick();

// �ȴ��հ״��ĵ����Ӧ
// x,y : ���������
void waitForClickXy(int* x, int* y);

// �ȴ�������Ӧ
// stringBuffer : ����Ϊ����ֵ��: �������ؼ���ı�inputֵ�����ַ���  id:�ؼ�id  ����հ״�����  xy:x����,y����  ���¼��̷���  kb:��ֵ
void waitForAny(char* stringBuffer);

// ����һ����ť������Ϊ���꼰��߼���ť�ϵ����֣����ض��������ID��
// x : ���ð�ť�ĺ�����
// y : ���ð�ť��������
// width : ���ð�ť�Ŀ��
// height : ���ð�ť�ĳ���
// stringContext : ��Ű�ť�ϵ����ֵ��ַ���
// ����ֵ��objID
objID putButton(int x, int y, int width, int height,const char* stringContext);

// ����һ��ͼƬ������Ϊ���꼰��߼�ͼƬ��·�������ض��������ID��
// x : ����ͼƬ�ĺ�����
// y : ����ͼƬ��������
// width : ����ͼƬ�Ŀ��
// height : ����ͼƬ�ĳ���
// pathString : ���ͼƬ��·��
// ����ֵ��objID
objID putImage(int x, int y, int width, int height,const char* pathString);

// ����һ������򣬲���Ϊ���꼰��ߣ����ض��������ID��
// x : ���������ĺ�����
// y : ����������������
// width : ���������Ŀ��
// height : ���������ĳ���
// ����ֵ��objID
objID putInputBox(int x, int y, int width, int height, const char* type);

// ����Ҫ���ӵ�fxDrawer�˿ںţ�Ĭ��6666
void fxSetPort(int port);

// ����Ҫ���ӵ�fxDrawer�˿ںţ�Ĭ��127.0.0.1
void fxSetHost(const char* host);

// ���õ�ǰʹ�õ�Socket�����ţ�Ĭ����initDrawer������ֵ�����ڶര��ʱʹ��
void fxSetSd(int sd);

// �����Ƿ��ڴ��ڹرպ�ɱ�������� Ĭ��Ϊtrue��1
void fxSetKillAfterCloseWindow(int isIt);

// �����Ƿ��ڵ����߶Ͽ����Ӻ󴰿ڹر� Ĭ��Ϊfalse��0
void fxSetCloseOnBroke(int isIt);


#ifdef __cplusplus
}
#endif

// ����Ϊɫ�ʳ���
#define fxColorLightPink "#FFB6C1" // ǳ�ۺ�
#define fxColorPink "#FFC0CB" // �ۺ�
#define fxColorCrimson "#DC143C" // ���(�ɺ�)
#define fxColorLavenderBlush "#FFF0F5" // ���Ϻ�
#define fxColorPaleVioletRed "#DB7093" // ����������
#define fxColorHotPink "#FF69B4" // ����ķۺ�
#define fxColorDeepPink "#FF1493" // ��ۺ�
#define fxColorMediumVioletRed "#C71585" // ����������
#define fxColorOrchid "#DA70D6" // ����ɫ(������)
#define fxColorThistle "#D8BFD8" // ��ɫ
#define fxColorPlum "#DDA0DD" // ����ɫ(������)
#define fxColorViolet "#EE82EE" // ������
#define fxColorMagenta "#FF00FF" // ���(õ���)
#define fxColorFuchsia "#FF00FF" // �Ϻ�(��������)
#define fxColorDarkMagenta "#8B008B" // �����
#define fxColorPurple "#800080" // ��ɫ
#define fxColorMediumOrchid "#BA55D3" // ��������
#define fxColorDarkViolet "#9400D3" // ��������
#define fxColorDarkOrchid "#9932CC" // ��������
#define fxColorIndigo "#4B0082" // ����/����ɫ
#define fxColorBlueViolet "#8A2BE2" // ��������
#define fxColorMediumPurple "#9370DB" // ����ɫ
#define fxColorMediumSlateBlue "#7B68EE" // �а���ɫ(�а�����)
#define fxColorSlateBlue "#6A5ACD" // ʯ��ɫ(������)
#define fxColorDarkSlateBlue "#483D8B" // ������ɫ(��������)
#define fxColorLavender "#E6E6FA" // ����ɫ(Ѭ�²ݵ���)
#define fxColorGhostWhite "#F8F8FF" // �����
#define fxColorBlue "#0000FF" // ����
#define fxColorMediumBlue "#0000CD" // ����ɫ
#define fxColorMidnightBlue "#191970" // ��ҹ��
#define fxColorDarkBlue "#00008B" // ����ɫ
#define fxColorNavy "#000080" // ������
#define fxColorRoyalBlue "#4169E1" // �ʼ���/����
#define fxColorCornflowerBlue "#6495ED" // ʸ������
#define fxColorLightSteelBlue "#B0C4DE" // ������
#define fxColorLightSlateGray "#778899" // ������(��ʯ���)
#define fxColorSlateGray "#708090" // ��ʯɫ(ʯ���)
#define fxColorDodgerBlue "#1E90FF" // ����ɫ(������)
#define fxColorAliceBlue "#F0F8FF" // ����˿��
#define fxColorSteelBlue "#4682B4" // ����/����
#define fxColorLightSkyBlue "#87CEFA" // ������ɫ
#define fxColorSkyBlue "#87CEEB" // ����ɫ
#define fxColorDeepSkyBlue "#00BFFF" // ������
#define fxColorLightBlue "#ADD8E6" // ����
#define fxColorPowderBlue "#B0E0E6" // ����ɫ(��ҩ��)
#define fxColorCadetBlue "#5F9EA0" // ����ɫ(������)
#define fxColorAzure "#F0FFFF" // ε��ɫ
#define fxColorLightCyan "#E0FFFF" // ����ɫ
#define fxColorPaleTurquoise "#AFEEEE" // ���̱�ʯ
#define fxColorCyan "#00FFFF" // ��ɫ
#define fxColorAqua "#00FFFF" // ǳ��ɫ(ˮɫ)
#define fxColorDarkTurquoise "#00CED1" // ���̱�ʯ
#define fxColorDarkSlateGray "#2F4F4F" // ���߻�ɫ(��ʯ���)
#define fxColorDarkCyan "#008B8B" // ����ɫ
#define fxColorTeal "#008080" // ˮѼɫ
#define fxColorMediumTurquoise "#48D1CC" // ���̱�ʯ
#define fxColorLightSeaGreen "#20B2AA" // ǳ������
#define fxColorTurquoise "#40E0D0" // �̱�ʯ
#define fxColorAquamarine "#7FFFD4" // ��ʯ����
#define fxColorMediumAquamarine "#66CDAA" // �б�ʯ����
#define fxColorMediumSpringGreen "#00FA9A" // �д���ɫ
#define fxColorMintCream "#F5FFFA" // ��������
#define fxColorSpringGreen "#00FF7F" // ����ɫ
#define fxColorMediumSeaGreen "#3CB371" // �к�����
#define fxColorSeaGreen "#2E8B57" // ������
#define fxColorHoneydew "#F0FFF0" // ��ɫ(�۹�ɫ)
#define fxColorLightGreen "#90EE90" // ����ɫ
#define fxColorPaleGreen "#98FB98" // ����ɫ
#define fxColorDarkSeaGreen "#8FBC8F" // ��������
#define fxColorLimeGreen "#32CD32" // ��������
#define fxColorLime "#00FF00" // ������
#define fxColorForestGreen "#228B22" // ɭ����
#define fxColorGreen "#008000" // ����
#define fxColorDarkGreen "#006400" // ����ɫ
#define fxColorChartreuse "#7FFF00" // ����ɫ(���ؾ���)
#define fxColorLawnGreen "#7CFC00" // ����ɫ(��ƺ��_
#define fxColorGreenYellow "#ADFF2F" // �̻�ɫ
#define fxColorDarkOliveGreen "#556B2F" // �������
#define fxColorYellowGreen "#9ACD32" // ����ɫ
#define fxColorOliveDrab "#6B8E23" // ��魺�ɫ
#define fxColorBeige "#F5F5DC" // ��ɫ/����ɫ
#define fxColorLightGoldenrodYellow "#FAFAD2" // ���ջ�
#define fxColorIvory "#FFFFF0" // ����ɫ
#define fxColorLightYellow "#FFFFE0" // ǳ��ɫ
#define fxColorYellow "#FFFF00" // ����
#define fxColorOlive "#808000" // ���
#define fxColorDarkKhaki "#BDB76B" // ���ƺ�ɫ(�ߴ��)
#define fxColorLemonChiffon "#FFFACD" // ���ʳ�
#define fxColorPaleGoldenrod "#EEE8AA" // �Ҿջ�(������ɫ)
#define fxColorKhaki "#F0E68C" // �ƺ�ɫ(��ߴ��)
#define fxColorGold "#FFD700" // ��ɫ
#define fxColorCornsilk "#FFF8DC" // ����˿ɫ
#define fxColorGoldenrod "#DAA520" // ��ջ�
#define fxColorDarkGoldenrod "#B8860B" // ����ջ�
#define fxColorFloralWhite "#FFFAF0" // ���İ�ɫ
#define fxColorOldLace "#FDF5E6" // �ϻ�ɫ(����˿)
#define fxColorWheat "#F5DEB3" // ǳ��ɫ(С��ɫ)
#define fxColorMoccasin "#FFE4B5" // ¹Ƥɫ(¹Ƥѥ)
#define fxColorOrange "#FFA500" // ��ɫ
#define fxColorPapayaWhip "#FFEFD5" // ��ľɫ(��ľ��)
#define fxColorBlanchedAlmond "#FFEBCD" // ����ɫ
#define fxColorNavajoWhite "#FFDEAD" // ���߰�(������)
#define fxColorAntiqueWhite "#FAEBD7" // �Ŷ���
#define fxColorTan "#D2B48C" // ��ɫ
#define fxColorBurlyWood "#DEB887" // Ӳľɫ
#define fxColorBisque "#FFE4C4" // ������
#define fxColorDarkOrange "#FF8C00" // ���ɫ
#define fxColorLinen "#FAF0E6" // ���鲼
#define fxColorPeru "#CD853F" // ��³ɫ
#define fxColorPeachPuff "#FFDAB9" // ����ɫ
#define fxColorSandyBrown "#F4A460" // ɳ��ɫ
#define fxColorChocolate "#D2691E" // �ɿ���ɫ
#define fxColorSaddleBrown "#8B4513" // �غ�ɫ(����ɫ)
#define fxColorSeashell "#FFF5EE" // ������
#define fxColorSienna "#A0522D" // ������ɫ
#define fxColorLightSalmon "#FFA07A" // ǳ������ɫ
#define fxColorCoral "#FF7F50" // ɺ��
#define fxColorOrangeRed "#FF4500" // �Ⱥ�ɫ
#define fxColorDarkSalmon "#E9967A" // ������/����ɫ
#define fxColorTomato "#FF6347" // ���Ѻ�
#define fxColorMistyRose "#FFE4E1" // ǳõ��ɫ(����õ��)
#define fxColorSalmon "#FA8072" // ����/����ɫ
#define fxColorSnow "#FFFAFA" // ѩ��ɫ
#define fxColorLightCoral "#F08080" // ��ɺ��ɫ
#define fxColorRosyBrown "#BC8F8F" // õ����ɫ
#define fxColorIndianRed "#CD5C5C" // ӡ�Ⱥ�
#define fxColorRed "#FF0000" // ����
#define fxColorBrown "#A52A2A" // ��ɫ
#define fxColorFireBrick "#B22222" // ��שɫ(�ͻ�ש)
#define fxColorDarkRed "#8B0000" // ���ɫ
#define fxColorMaroon "#800000" // ��ɫ
#define fxColorWhite "#FFFFFF" // ����
#define fxColorWhiteSmoke "#F5F5F5" // ����
#define fxColorGainsboro "#DCDCDC" // ����ɫ(��˹���޻�)
#define fxColorLightGrey "#D3D3D3" // ǳ��ɫ
#define fxColorSilver "#C0C0C0" // ����ɫ
#define fxColorDarkGray "#A9A9A9" // ���ɫ
#define fxColorGray "#808080" // ��ɫ
#define fxColorDimGray "#696969" // �����Ļ�ɫ
#define fxColorBlack "#000000" // ����

#endif
