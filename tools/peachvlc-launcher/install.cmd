@echo off
rem 注册 peachvlc:// 协议到当前用户（不需要管理员权限）。
setlocal
set "HANDLER=%~dp0peachvlc.ps1"
reg add "HKCU\Software\Classes\peachvlc" /ve /d "URL:Peach VLC Launcher" /f >nul
reg add "HKCU\Software\Classes\peachvlc" /v "URL Protocol" /d "" /f >nul
reg add "HKCU\Software\Classes\peachvlc\shell\open\command" /ve /d "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"%HANDLER%\" \"%%1\"" /f >nul
echo peachvlc 协议已注册，处理器：%HANDLER%
echo 在 Peach 详情页选择「VLC 桌面版（需启动器）」后点击「打开」即可。
pause
