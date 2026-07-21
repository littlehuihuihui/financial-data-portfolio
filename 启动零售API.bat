@echo off
chcp 65001 >nul
cd /d "%~dp0\..\retail-finance-analysis"
echo.
echo [1/2] 零售财务 API  端口 5000
echo 浏览器看板数据依赖本服务，请先保持本窗口运行
echo.
"%~dp0..\retail-finance-analysis\venv\Scripts\python.exe" app.py
pause
