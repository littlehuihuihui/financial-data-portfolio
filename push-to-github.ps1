# Run in a network that can reach GitHub.
# From publish dir:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\push-to-github.ps1

$ErrorActionPreference = "Stop"
$publish = "d:\cursor\financial-data-portfolio-publish"
# 源工程：D:\cursor\多行业数据平台\portfolio

if (-not (Test-Path $publish)) {
  Write-Error "Publish dir not found: $publish"
}
Set-Location $publish

Write-Host "==> GitHub login (browser)..."
gh auth login --hostname github.com --git-protocol https --web

Write-Host "==> Create/link repo littlehuihuihui/financial-data-portfolio ..."
gh repo view littlehuihuihui/financial-data-portfolio 2>$null
if ($LASTEXITCODE -ne 0) {
  gh repo create littlehuihuihui/financial-data-portfolio --public --source=. --remote=origin --push
} else {
  git remote remove origin 2>$null
  git remote add origin https://github.com/littlehuihuihui/financial-data-portfolio.git
  git push -u origin main
}

Write-Host "==> Enable GitHub Pages (main / root) ..."
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
Write-Host "Done. Repo: https://github.com/littlehuihuihui/financial-data-portfolio"
Write-Host "Site: https://littlehuihuihui.github.io/financial-data-portfolio/"
Write-Host "If Pages is not live yet, open Settings -> Pages and set Source to main / root."
