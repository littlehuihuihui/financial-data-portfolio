@echo off
chcp 65001 >nul
cd /d "%~dp0\..\internet-analytics"
echo.
echo [互联网] API + 看板页面  端口 5001
echo 浏览器打开: http://127.0.0.1:5001/
echo 请保持本窗口运行
echo.
"%~dp0venv\Scripts\python.exe" app.py
pause
