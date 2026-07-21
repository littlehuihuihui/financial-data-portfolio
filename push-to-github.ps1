# 在能访问 GitHub 的网络下运行本脚本，完成建库 + 推送 +（可选）开启 Pages
# 用法：在 PowerShell 中执行  .\push-to-github.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> 登录 GitHub（浏览器）..."
gh auth login --hostname github.com --git-protocol https --web

Write-Host "==> 创建/关联仓库 littlehuihuihui/financial-data-portfolio ..."
gh repo view littlehuihuihui/financial-data-portfolio 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create littlehuihuihui/financial-data-portfolio --public --source=. --remote=origin --push
} else {
  git remote remove origin 2>$null
  git remote add origin https://github.com/littlehuihuihui/financial-data-portfolio.git
  git push -u origin main
}

Write-Host "==> 开启 GitHub Pages (main / root) ..."
gh api -X POST "repos/littlehuihuihui/financial-data-portfolio/pages" `
  -f "build_type=legacy" `
  -f "source[branch]=main" `
  -f "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
  gh api -X PUT "repos/littlehuihuihui/financial-data-portfolio/pages" `
    -f "build_type=legacy" `
    -f "source[branch]=main" `
    -f "source[path]=/" 2>$null
}

Write-Host ""
Write-Host "完成。仓库: https://github.com/littlehuihuihui/financial-data-portfolio"
Write-Host "站点:  https://littlehuihuihui.github.io/financial-data-portfolio/"
Write-Host "若 Pages 尚未生效，请到仓库 Settings → Pages 确认 Source 为 main / /（根目录）。"
