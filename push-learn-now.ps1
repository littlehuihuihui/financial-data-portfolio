# One-shot: sync 数据学习平台 → portfolio learn path → publish → commit → push
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\push-learn-now.ps1
# Or from agent: run this single script after user says ready.

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$srcRoot = "D:\cursor\数据学习平台\数据学习平台"
$srcKg   = Join-Path $srcRoot "数据知识图谱.html"
$port    = "D:\cursor\多行业数据平台\portfolio"
$pub     = "D:\cursor\financial-data-portfolio-publish"

if (-not (Test-Path $srcKg)) { throw "Missing source: $srcKg" }
if (-not (Test-Path $port))  { throw "Missing portfolio: $port" }
if (-not (Test-Path $pub))   { throw "Missing publish: $pub" }

Write-Host "==> 1/4 Copy KG + _gen into portfolio"
New-Item -ItemType Directory -Force -Path "$port\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "$port\learn-kg\_gen" | Out-Null
Copy-Item -Force $srcKg "$port\pages\learn.html"
Copy-Item -Force $srcKg "$port\pages\数据知识图谱.html"
if (Test-Path "$srcRoot\_gen") {
  Copy-Item -Force -Recurse "$srcRoot\_gen\*" "$port\learn-kg\_gen\"
}

Write-Host "==> 2/4 Patch platform back-link + title (idempotent)"
$learnPath = "$port\pages\learn.html"
$html = [System.IO.File]::ReadAllText($learnPath, [System.Text.Encoding]::UTF8)
$html = $html -replace '<title>数据知识图谱 · DATA NEXUS</title>', '<title>数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS</title>'
if ($html -notmatch '返回平台') {
  # Prefer structured brand block
  $old1 = @'
  <header>
    <div class="brand">
      <div class="brand-mark" aria-hidden="true"></div>
      <div class="brand-copy">
        <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
        <span class="brand-tag">点击中心节点展开知识树</span>
      </div>
    </div>
    <div class="legend" id="legend"></div>
  </header>
'@
  $new1 = @'
  <header>
    <div class="brand">
      <a href="../index.html" style="font-family:var(--font-mono);font-size:0.78rem;color:var(--muted);text-decoration:none;margin-right:10px;white-space:nowrap;align-self:center;">← 返回平台</a>
      <div class="brand-mark" aria-hidden="true"></div>
      <div class="brand-copy">
        <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
        <span class="brand-tag">学习路径 · 点击中心节点展开知识树</span>
      </div>
    </div>
    <div class="legend" id="legend"></div>
  </header>
'@
  $old2 = @'
  <header>
    <div class="brand">
      <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
      <span>数据学习教程 · 点击 SQL 展开知识树</span>
    </div>
    <div class="legend" id="legend"></div>
  </header>
'@
  $new2 = @'
  <header>
    <div class="brand">
      <a href="../index.html" style="font-family:var(--font-mono);font-size:0.78rem;color:var(--muted);text-decoration:none;margin-right:10px;white-space:nowrap;">← 返回平台</a>
      <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
      <span>学习路径 · 数据学习教程 · 点击 SQL 展开知识树</span>
    </div>
    <div class="legend" id="legend"></div>
  </header>
'@
  if ($html.Contains($old1.Trim())) {
    $html = $html.Replace($old1.Trim(), $new1.Trim())
  } elseif ($html.Contains($old2.Trim())) {
    $html = $html.Replace($old2.Trim(), $new2.Trim())
  } elseif ($html -match '(?s)(<div class="brand">)') {
    $html = $html -replace '(<div class="brand">)', ('$1' + "`n      <a href=`"../index.html`" style=`"font-family:var(--font-mono);font-size:0.78rem;color:var(--muted);text-decoration:none;margin-right:10px;white-space:nowrap;align-self:center;`">← 返回平台</a>")
  }
}
[System.IO.File]::WriteAllText($learnPath, $html, [System.Text.UTF8Encoding]::new($false))
Copy-Item -Force $learnPath "$port\pages\数据知识图谱.html"

Write-Host "==> 3/4 Sync into publish working tree"
New-Item -ItemType Directory -Force -Path "$pub\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "$pub\learn-kg\_gen" | Out-Null
Copy-Item -Force "$port\pages\learn.html" "$pub\pages\learn.html"
Copy-Item -Force "$port\pages\数据知识图谱.html" "$pub\pages\数据知识图谱.html"
Copy-Item -Force -Recurse "$port\learn-kg\_gen\*" "$pub\learn-kg\_gen\"

Write-Host "==> 4/4 Commit + push"
Set-Location $pub
git add pages/learn.html "pages/数据知识图谱.html" learn-kg
$short = git status --short
if (-not $short) {
  Write-Host "Nothing to commit (already up to date)."
  git status -sb
  exit 0
}
git -c user.name='littlehuihuihui' -c user.email='littlehuihuihui@users.noreply.github.com' commit -m "Sync latest learn platform knowledge graph to GitHub Pages."
git push origin HEAD
Write-Host "DONE: $(git log -1 --oneline)"
git status -sb
Write-Host "Live: https://littlehuihuihui.github.io/financial-data-portfolio/pages/learn.html"
