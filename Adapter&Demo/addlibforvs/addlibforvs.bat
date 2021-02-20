@echo off
@ echo.
ver|findstr "5\.[0-9]\.[0-9][0-9]*">nul && (echo.&echo 如果当前使用的是 Windows XP 系统，将跳过以管理员身份运行...)  && goto skip
>NUL 2>&1 REG.exe query "HKU\S-1-5-19" || (
    ECHO SET UAC = CreateObject^("Shell.Application"^) > "%TEMP%\Getadmin.vbs"
    ECHO UAC.ShellExecute "%~f0", "%1", "", "runas", 1 >> "%TEMP%\Getadmin.vbs"
    "%TEMP%\Getadmin.vbs"
    DEL /f /q "%TEMP%\Getadmin.vbs" 2>NUL
    Exit /b
)
:skip
%~d0
cd %~dp0
setlocal enabledelayedexpansion

for /f "usebackq tokens=*" %%i in (`%~dp0vswhere.exe -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
  set InstallDir=%%i
)

if exist "%InstallDir%\VC\Auxiliary\Build\Microsoft.VCToolsVersion.default.txt" (
  set /p Version=<"%InstallDir%\VC\Auxiliary\Build\Microsoft.VCToolsVersion.default.txt"
  set Version=!Version: =!
)

echo 安装路径：%InstallDir%\VC\Tools\MSVC\%Version%\

if not "%Version%"=="" (
  xcopy %~dp0fxdlib\*.* "%InstallDir%\VC\Tools\MSVC\%Version%\" /s /h /y
)
