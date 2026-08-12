@echo off
chcp 65001 >nul
cd /d "%~dp0\..\manufacturing-analytics"
echo.
echo [制造业 API] 端口 5002
echo UI 请开: http://127.0.0.1:5100/industries/manufacturing/manufacturing_dashboard.html
echo.
"%~dp0venv\Scripts\python.exe" app.py
pause
