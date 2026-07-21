@echo off

chcp 65001 >nul

cd /d "%~dp0\..\manufacturing-analytics"

echo.

echo [制造业] API + 看板页面  端口 5002

echo 浏览器打开: http://127.0.0.1:5002/

echo 请保持本窗口运行

echo.

"%~dp0venv\Scripts\python.exe" app.py

pause

