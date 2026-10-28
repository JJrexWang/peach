@echo off
rem 注销 peachvlc:// 协议（当前用户）。
reg delete "HKCU\Software\Classes\peachvlc" /f
echo peachvlc 协议已注销。
pause
