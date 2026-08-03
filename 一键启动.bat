@echo off

chcp 65001 >nul

echo 正在启动四个服务（会弹出四个黑色窗口，请勿关闭）...

start "零售API-5000" cmd /k "%~dp0启动零售API.bat"

timeout /t 2 /nobreak >nul

start "互联网API-5001" cmd /k "%~dp0启动互联网API.bat"

timeout /t 2 /nobreak >nul

start "制造业API-5002" cmd /k "%~dp0启动制造业API.bat"

timeout /t 2 /nobreak >nul

start "多行业平台-5100" cmd /k "%~dp0启动多行业平台.bat"

echo.

echo 已启动。请在浏览器打开: http://127.0.0.1:5100/

echo 制造业看板: http://127.0.0.1:5100/industries/manufacturing/manufacturing_dashboard.html

echo.

pause

