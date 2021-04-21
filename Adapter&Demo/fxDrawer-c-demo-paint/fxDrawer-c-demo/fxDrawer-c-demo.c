// fxDrawer-c-demo.cpp : 此文件包含 "main" 函数。程序执行将在此处开始并结束。
//

#include <stdio.h>
#include <stdlib.h>
#include "fxdrawer.h"
 // #pragma comment( linker, "/subsystem:\"windows\" /entry:\"mainCRTStartup\"" )

int main() {	
	initDrawer(600, 400);
	int x, y, width = 1.5;
	objID butClr = putButton(500, 300, 80, 20, "清空");
	objID inputColor = putInputBox(500, 50, 80, 20, "color");
	objID inputLineWidth = putInputBox(500, 80, 80, 20, "range\" min='0' max='10' value='1.5' step=\"0.5");
	setColorW(fxColorLightPink);
	char str[20];
	// 如果不在VS环境下运行请将sscanf_s改为sscanf
	while (1) {
		waitForAny(str);
		if(sscanf_s(str,"xy:%d,%d",&x,&y))
			drawPoint(x, y, width,50); 
		else if (sscanf_s(str, "id:%d", &x))
			if(x==butClr)clearDraw();
			else if (x == inputColor) {
				getText(inputColor, str);
				setColorW(str);
			} else if (x == inputLineWidth) {
				getText(inputLineWidth, str);
				width = atof(str);
			}
	}
}

// 运行程序: Ctrl + F5 或调试 >“开始执行(不调试)”菜单
// 调试程序: F5 或调试 >“开始调试”菜单

// 入门使用技巧: 
//   1. 使用解决方案资源管理器窗口添加/管理文件
//   2. 使用团队资源管理器窗口连接到源代码管理
//   3. 使用输出窗口查看生成输出和其他消息
//   4. 使用错误列表窗口查看错误
//   5. 转到“项目”>“添加新项”以创建新的代码文件，或转到“项目”>“添加现有项”以将现有代码文件添加到项目
//   6. 将来，若要再次打开此项目，请转到“文件”>“打开”>“项目”并选择 .sln 文件
