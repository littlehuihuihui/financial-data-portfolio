@echo off
chcp 65001 >nul
cd /d "%~dp0\..\internet-analytics"
echo.
echo [互联网 API] 端口 5001
echo UI 请开: http://127.0.0.1:5100/industries/internet/internet_dashboard.html
echo.
"%~dp0venv\Scripts\python.exe" app.py
pause
