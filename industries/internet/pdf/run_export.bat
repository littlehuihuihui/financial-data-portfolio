@echo off
cd /d "%~dp0"
echo.
echo 互联网用户增长 · PDF 报告导出
echo 包含：P0 体系总览 + P1 增长看板 + P2 方法论 + P3 数仓架构
echo.
python export_internet.py %*
if errorlevel 1 (
  echo.
  echo 若首次运行，请先安装依赖：
  echo   pip install playwright
  echo   playwright install chromium
  echo.
  echo 也可在浏览器打开 report.html 点击「下载 PDF」
  pause
  exit /b 1
)
echo.
pause
