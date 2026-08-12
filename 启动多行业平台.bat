@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo [多行业平台] 端口 5100
echo 浏览器: http://127.0.0.1:5100/
echo.
"%~dp0venv\Scripts\python.exe" portfolio_app.py
pause
