# Create empty public repos on GitHub first (browser), then run this script.
#   https://github.com/new  Name: data-analyst-gallery   (Public, NO README)
#   https://github.com/new  Name: industry-data-encyclopedia (Public, NO README)
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\push-both-to-github.ps1

$ErrorActionPreference = "Continue"

function Push-Repo($dir, $repo) {
  Write-Host "==> $repo"
  Set-Location $dir
  if (-not (Test-Path ".git")) { git init -b main }
  # commit latest if dirty
  git add -A
  $pending = git status --porcelain
  if ($pending) {
    git -c user.email="littlehuihuihui@users.noreply.github.com" -c user.name="littlehuihuihui" commit -m "Update site content and cross-links."
  }
  git remote remove origin 2>$null
  git remote add origin "git@github.com:littlehuihuihui/$repo.git"
  $sshOut = cmd /c "ssh -T git@github.com 2>&1"
  Write-Host $sshOut
  if ("$sshOut" -match "Permission denied") {
    Write-Host "SSH key missing on GitHub. Abort."
    exit 1
  }
  git push -u origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed. Create empty public repo first: https://github.com/new"
    Write-Host "Name must be exactly: $repo (no README/license)"
    exit $LASTEXITCODE
  }
  Write-Host "OK https://github.com/littlehuihuihui/$repo"
  Write-Host "Enable Pages: Settings -> Pages -> Branch main / (root)"
  Write-Host "Site: https://littlehuihuihui.github.io/$repo/"
}

Push-Repo "D:\cursor\数据产品作品集" "data-analyst-gallery"
Push-Repo "D:\cursor\行业百科" "industry-data-encyclopedia"
Write-Host "All done."
