@echo off
@ echo.
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

echo °²×°Â·¾¶£º%InstallDir%\VC\Tools\MSVC\%Version%\

if not "%Version%"=="" (
  xcopy %~dp0fxdlib\*.* "%InstallDir%\VC\Tools\MSVC\%Version%\" /s /h /y
)
