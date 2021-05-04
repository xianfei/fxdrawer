![](RenderApp/fxdrawer/img/fxdrawerh5.jpg)

跨平台适用于不同语言的图形库。目前适配C/C++、Python语言，在macOS/Windows平台下的CLion 2020/Visual Studio 2019、Pycharm 2020通过测试。

### 0. 项目简介

在软件开发中往往编写用户图形界面时不同语言不同平台需要使用不同语法进行编写。而该项目将Web前后端分离技术引入桌面应用程序开发，实现在不同语言不同平台使用同一套语法编写GUI应用，语法与之前在C/C++课上所学习的EGE相似，并且可以将桌面应用无需改动及重新编译即可转换为Web应用，真正实现打通平台、语言以及桌面和Web应用的隔阂，大大提升了程序编写效率，简化了开发者学习。此外该图形库还附带了先进的开发者工具，并支持H5/CSS/JS编写控件等。该项目现已应用到软件工程专业的大一C++教学之中。

### 1. 特色功能

- 支持高分屏、抗锯齿、触摸屏、键盘触摸条等炫酷功能

- 跨平台、跨语言

- 模仿ege/easyx进行开发，但比他们更简单更好用

- 打通桌面GUI程序/Web程序，无需修改及重新编译即可将桌面程序转换为Web程序

### 2. 使用手册

[点击查看使用手册](RenderApp/fxdrawer/readme.md)

当您安装好fxDrawer后，可在程序内查看使用手册。

### 3. 安装

在[Release页面](https://github.com/xianfei/fxdrawer/releases/)中下载对应系统的程序包，解压后放置到任意喜欢位置（macOS中建议将程序拖拽至 应用程序 文件夹），运行程序（Windows下为fxdrawer.exe）并按照程序提示添加PATH目录，编程时可将libs文件夹中对应语言的库复制到您的项目中。

### 4. 编译

依赖：NodeJS环境

1. 克隆该项目(或下载代码压缩包并解压)并进入文件夹内

2. `cd RenderApp/fxdrawer`

3. 解决依赖 `npm i`

4. 编译`npm run package`(如果只想编译某一平台可进行指定，如`npm run package:win64`)

5. 生成的文件在RenderApp/fxdrawer/OutApp下

### 5. 附录

该项目为2020-2021北京邮电大学大学生创新创业大赛项目。

北京邮电大学第十二届大学生创新创业实践成果展示交流会 宣传展板：

![](fxd-bupt.jpg)
