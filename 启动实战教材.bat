@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo [实战教材] 端口 5101
echo 浏览器: http://127.0.0.1:5101/pages/learn.html
echo.
"%~dp0venv\Scripts\python.exe" learn_app.py
pause
