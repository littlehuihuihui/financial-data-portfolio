@echo off
chcp 65001 >nul
cd /d "%~dp0\..\retail-finance-analysis"
echo.
echo [零售 API] 端口 5000 — 仅数据接口
echo UI 请开: http://127.0.0.1:5100/industries/retail/retail_dashboard.html
echo.
"%~dp0..\retail-finance-analysis\venv\Scripts\python.exe" app.py
pause
