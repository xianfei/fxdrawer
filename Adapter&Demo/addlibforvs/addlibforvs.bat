@echo off
@ echo.
ver|findstr "5\.[0-9]\.[0-9][0-9]*">nul && (echo.&echo �����ǰʹ�õ��� Windows XP ϵͳ���������Թ���Ա�������...)  && goto skip
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

echo ��װ·����%InstallDir%\VC\Tools\MSVC\%Version%\

if not "%Version%"=="" (
  xcopy %~dp0fxdlib\*.* "%InstallDir%\VC\Tools\MSVC\%Version%\" /s /h /y
)
