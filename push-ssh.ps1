# SSH push (no gh auth / no HTTPS). Run AFTER adding SSH key on GitHub.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File .\push-ssh.ps1

$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot

Write-Host "==> Test SSH to GitHub (port 443)..."
# GitHub prints success on stderr: "Hi USER! You've successfully authenticated..."
$sshOut = cmd /c "ssh -T git@github.com 2>&1"
Write-Host $sshOut
if ("$sshOut" -match "Permission denied") {
  Write-Host ""
  Write-Host "SSH key is NOT on your GitHub account yet."
  Write-Host "1) Open https://github.com/settings/ssh/new"
  Write-Host "2) Add your public key, then re-run this script"
  exit 1
}
if ("$sshOut" -notmatch "successfully authenticated") {
  Write-Host "SSH test did not confirm authentication. Output above."
  exit 1
}
Write-Host "SSH OK."

Write-Host "==> Set remote to SSH..."
git remote remove origin 2>$null
git remote add origin "git@github.com:littlehuihuihui/financial-data-portfolio.git"

Write-Host "==> Push main..."
git push -u origin main
if ($LASTEXITCODE -ne 0) {
  Write-Host "git push failed. Create empty repo first: https://github.com/new"
  Write-Host "Name: financial-data-portfolio (Public, no README)"
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Done. Repo: https://github.com/littlehuihuihui/financial-data-portfolio"
Write-Host "Enable Pages: Settings -> Pages -> Branch main / Folder / (root)"
Write-Host "Site: https://littlehuihuihui.github.io/financial-data-portfolio/"
