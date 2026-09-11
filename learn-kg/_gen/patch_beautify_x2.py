# -*- coding: utf-8 -*-
"""Two consecutive visual polish passes for DATA NEXUS."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- HTML brand: stronger first-viewport signal ----------
OLD_BRAND = '''  <header>
    <div class="brand">
      <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
      <span>数据学习教程 · 点击 SQL 展开知识树</span>
    </div>
    <div class="legend" id="legend"></div>
  </header>'''

NEW_BRAND = '''  <header>
    <div class="brand">
      <div class="brand-mark" aria-hidden="true"></div>
      <div class="brand-copy">
        <h1><span class="mono-prefix">&gt;_</span>DATA NEXUS</h1>
        <span class="brand-tag">数据学习教程 · 点击中心节点展开知识树</span>
      </div>
    </div>
    <div class="legend" id="legend"></div>
  </header>'''

if "brand-mark" not in text:
    if OLD_BRAND not in text:
        raise SystemExit("brand html missing")
    text = text.replace(OLD_BRAND, NEW_BRAND, 1)
    print("brand html ok")
else:
    print("brand html already")

# Soften home hint into atmosphere caption
text = text.replace(
    '<div class="hint">点击 SQL → 展开全部一级 · 再点某一级查看其二级讲义</div>',
    '<div class="hint home-caption">点击中心节点 · 展开一级领域 · 再点某一级查看二级</div>',
    1,
)

PASS1 = r'''
    /* ========== 美化第 1 轮：全局壳层 / 首屏品牌 / 氛围 ========== */
    :root {
      --bg: #050814;
      --bg-elevated: #0b1224;
      --bg-panel: rgba(11, 18, 36, 0.92);
      --border: rgba(56, 80, 120, 0.45);
      --text: #eef3fb;
      --muted: #8b97ab;
      --accent: #2ee6ff;
      --accent-2: #5babff;
      --accent-soft: rgba(46, 230, 255, 0.12);
      --violet: #b794ff;
      --glow-cyan: rgba(46, 230, 255, 0.45);
      --glow-violet: rgba(168, 85, 247, 0.5);
      --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    }
    body {
      background-color: var(--bg);
      background-image:
        radial-gradient(ellipse 90% 55% at 50% -15%, rgba(46, 230, 255, 0.16), transparent 55%),
        radial-gradient(ellipse 55% 45% at 8% 85%, rgba(124, 58, 237, 0.14), transparent 55%),
        radial-gradient(ellipse 45% 40% at 92% 70%, rgba(34, 211, 238, 0.08), transparent 50%),
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: auto, auto, auto, 56px 56px, 56px 56px;
      animation: pageGlow 14s ease-in-out infinite alternate;
    }
    @keyframes pageGlow {
      from { background-position: 0 0, 0 0, 0 0, 0 0, 0 0; }
      to { background-position: 0 0, 12px -8px, -10px 6px, 0 0, 0 0; }
    }
    header {
      padding: 14px 28px;
      background: linear-gradient(180deg, rgba(8, 12, 28, 0.92), rgba(5, 8, 20, 0.78));
      border-bottom: 1px solid rgba(46, 230, 255, 0.12);
      box-shadow: 0 10px 40px rgba(0,0,0,0.35);
    }
    header::after {
      height: 2px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(46, 230, 255, 0.15) 15%,
        rgba(46, 230, 255, 0.85) 50%,
        rgba(167, 139, 250, 0.55) 75%,
        transparent 100%);
      opacity: 0.9;
    }
    .brand {
      align-items: center;
      gap: 14px;
    }
    .brand-mark {
      width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
      background:
        radial-gradient(circle at 30% 30%, #e9d5ff, transparent 45%),
        radial-gradient(circle at 70% 70%, #22d3ee, transparent 50%),
        linear-gradient(135deg, #7c3aed, #0e7490);
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.12) inset,
        0 0 22px rgba(46, 230, 255, 0.35),
        0 0 36px rgba(124, 58, 237, 0.35);
      position: relative;
      animation: markPulse 3.6s ease-in-out infinite;
    }
    .brand-mark::after {
      content: "";
      position: absolute; inset: 7px;
      border-radius: 6px;
      border: 1px solid rgba(255,255,255,0.35);
      opacity: 0.7;
    }
    @keyframes markPulse {
      0%, 100% { filter: brightness(1); transform: scale(1); }
      50% { filter: brightness(1.12); transform: scale(1.04); }
    }
    .brand-copy { display: flex; flex-direction: column; gap: 2px; }
    .brand h1 {
      font-size: 1.35rem;
      letter-spacing: 0.12em;
      background: linear-gradient(92deg, #67e8f9 0%, #e9d5ff 55%, #a78bfa 100%);
      -webkit-background-clip: text; background-clip: text;
      color: transparent;
      text-shadow: none;
      filter: drop-shadow(0 0 18px rgba(46, 230, 255, 0.25));
    }
    .brand .mono-prefix {
      background: none; -webkit-background-clip: initial; background-clip: initial;
      color: #67e8f9;
      margin-right: 4px;
    }
    .brand-tag, .brand span.brand-tag {
      font-size: 0.78rem;
      color: #9aa8bc;
      letter-spacing: 0.04em;
    }
    .legend {
      gap: 12px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(148,163,184,0.12);
    }
    .legend-item { opacity: 0.85; transition: opacity 0.2s, color 0.2s; }
    .legend-item:hover { opacity: 1; color: var(--text); }
    .home-caption, .hint.home-caption {
      left: 50%; bottom: 28px; transform: translateX(-50%);
      font-size: 0.76rem;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid rgba(46, 230, 255, 0.22);
      background: rgba(8, 12, 28, 0.72);
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.35);
      color: #b6c2d4;
      animation: captionIn 0.8s var(--ease-out) both;
    }
    .hint.home-caption::before { content: ""; }
    @keyframes captionIn {
      from { opacity: 0; transform: translateX(-50%) translateY(10px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    body.home-hero:not(.kg-focus-on) #graph.kg-canvas {
      background:
        radial-gradient(ellipse 42% 38% at 50% 46%, rgba(124, 58, 237, 0.22), transparent 70%),
        radial-gradient(ellipse 70% 55% at 50% 48%, rgba(46, 230, 255, 0.08), transparent 72%),
        #050814;
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node {
      animation: heroEnter 0.85s var(--ease-out) both;
    }
    @keyframes heroEnter {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node circle {
      stroke: #d8b4fe !important;
      stroke-width: 1.5 !important;
      filter:
        drop-shadow(0 0 16px rgba(168, 85, 247, 0.7))
        drop-shadow(0 0 34px rgba(46, 230, 255, 0.28)) !important;
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node text {
      font-family: var(--font-display) !important;
      font-size: 14px !important;
      letter-spacing: 0.08em;
      fill: #f8fafc !important;
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node .sublabel {
      font-size: 10px !important;
      fill: #a5b4fc !important;
      letter-spacing: 0.06em;
    }
    .toolbar button {
      border-radius: 8px;
      border: 1px solid rgba(148,163,184,0.22);
      background: rgba(10, 14, 28, 0.82);
      backdrop-filter: blur(8px);
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .toolbar button:hover {
      transform: translateY(-1px);
      border-color: rgba(46, 230, 255, 0.5);
      color: #67e8f9;
    }
    .toolbar button.active {
      border-color: rgba(46, 230, 255, 0.7);
      color: #67e8f9;
      background: rgba(46, 230, 255, 0.12);
      box-shadow: 0 0 16px rgba(46, 230, 255, 0.18);
    }

'''

PASS2 = r'''
    /* ========== 美化第 2 轮：焦点台 / 卫星 / 侧栏 / 讲义 ========== */
    body.kg-focus-on .kg-workspace {
      background:
        radial-gradient(ellipse 50% 40% at 50% 20%, rgba(99, 102, 241, 0.1), transparent 60%),
        #050814;
    }
    body.kg-focus-on .kg-focus-side {
      background: linear-gradient(180deg, rgba(12, 16, 34, 0.96), rgba(7, 10, 22, 0.94));
      border-right: 1px solid rgba(167, 139, 250, 0.28) !important;
      box-shadow: 8px 0 32px rgba(0,0,0,0.25);
      gap: 14px;
      padding: 16px 14px 18px;
    }
    body.kg-focus-on .kg-focus-side-head h3 {
      font-size: 1.02rem;
      letter-spacing: 0.02em;
      background: linear-gradient(90deg, #f1f5f9, #c4b5fd 70%, #67e8f9);
      -webkit-background-clip: text; background-clip: text;
      color: transparent;
    }
    .kg-back-btn {
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    .kg-back-btn:hover { transform: translateX(-2px); }
    .kg-search-mini input {
      border-radius: 10px !important;
      border: 1px solid rgba(148,163,184,0.2) !important;
      background: rgba(8, 12, 26, 0.9) !important;
      padding: 9px 12px !important;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .kg-search-mini input:focus {
      border-color: rgba(167, 139, 250, 0.65) !important;
      box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.18) !important;
    }
    .kg-progress {
      border-radius: 12px;
      border: 1px solid rgba(167, 139, 250, 0.22);
      background:
        linear-gradient(135deg, rgba(168,85,247,0.08), transparent 50%),
        rgba(10, 14, 28, 0.7);
      padding: 10px 12px;
    }
    .kg-progress-track {
      height: 7px;
      background: rgba(15, 23, 42, 0.95);
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
    }
    .kg-progress-bar {
      background: linear-gradient(90deg, #7c3aed, #22d3ee 70%, #67e8f9);
      box-shadow: 0 0 10px rgba(46, 230, 255, 0.45);
    }
    .kg-focus-legend {
      border-style: solid;
      border-color: rgba(148,163,184,0.16);
      background: rgba(255,255,255,0.02);
      border-radius: 12px;
    }
    .kg-focus-path-body {
      border-radius: 12px;
      background: linear-gradient(160deg, rgba(46,230,255,0.08), rgba(15,22,40,0.4));
      border: 1px solid rgba(46, 230, 255, 0.2);
    }
    .kg-more-btns button {
      border-radius: 10px;
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .kg-more-btns button:hover {
      transform: translateY(-1px);
      background: rgba(46, 230, 255, 0.06);
    }
    .kg-rail-btn {
      border-radius: 12px;
      backdrop-filter: blur(10px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.35);
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .kg-rail-btn:hover {
      transform: translateY(-50%) scale(1.05);
      border-color: #22d3ee;
      color: #a5f3fc;
    }
    .kg-ctrl button {
      border-radius: 12px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    .kg-canvas-hint {
      border-radius: 999px !important;
      border-color: rgba(46, 230, 255, 0.2) !important;
      background: rgba(8, 12, 26, 0.78) !important;
      backdrop-filter: blur(10px);
      letter-spacing: 0.02em;
    }
    body.kg-focus-on #graph.kg-canvas {
      background:
        radial-gradient(ellipse 48% 42% at 50% 38%, rgba(124, 58, 237, 0.16), transparent 68%),
        radial-gradient(ellipse 35% 35% at 18% 72%, rgba(249, 115, 22, 0.06), transparent 60%),
        radial-gradient(ellipse 35% 35% at 82% 68%, rgba(16, 185, 129, 0.07), transparent 60%),
        #050814 !important;
    }
    .sat-node circle {
      stroke: rgba(255,255,255,0.42) !important;
      stroke-width: 1.6 !important;
      filter: drop-shadow(0 0 10px rgba(46, 230, 255, 0.35));
      transition: filter 0.2s, stroke 0.2s !important;
    }
    .sat-node.layer-2 circle {
      filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.4));
    }
    .sat-node.is-branch circle {
      stroke: #fde68a !important;
      filter: drop-shadow(0 0 14px rgba(251, 191, 36, 0.55)) !important;
    }
    .sat-node.is-leaf circle {
      stroke: #6ee7b7 !important;
      filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.5)) !important;
    }
    .sat-node.selected circle {
      stroke: #fff !important;
      stroke-width: 2.8 !important;
      filter: drop-shadow(0 0 16px rgba(255,255,255,0.4)) !important;
    }
    .sat-node text.sat-label {
      font-size: 11px !important;
      fill: #f8fafc !important;
      paint-order: stroke;
      stroke: rgba(5, 8, 20, 0.85);
      stroke-width: 3px;
    }
    .sat-link {
      stroke-opacity: 0.78 !important;
      stroke-width: 1.4 !important;
      filter: drop-shadow(0 0 4px rgba(46, 230, 255, 0.4)) !important;
    }
    .sat-link.layer-2 {
      stroke-width: 1.55 !important;
      animation: linkGlow 3.2s ease-in-out infinite;
    }
    @keyframes linkGlow {
      0%, 100% { stroke-opacity: 0.55; }
      50% { stroke-opacity: 0.9; }
    }
    .sat-link.layer-3, .sat-link.layer-4, .sat-link.dashed {
      stroke-dasharray: 2 7 !important;
      stroke-opacity: 0.5 !important;
      animation: dashFlow 10s linear infinite;
    }
    @keyframes dashFlow {
      to { stroke-dashoffset: -80; }
    }
    .hub-ring {
      stroke: rgba(196, 181, 253, 0.55) !important;
      stroke-width: 1.15 !important;
    }
    .hub-ring-dash {
      stroke: rgba(46, 230, 255, 0.7) !important;
      stroke-dasharray: 2 8 !important;
      animation: hubSpin 9s linear infinite !important;
    }
    .node.home-hero-node circle,
    .node.kg-focus-hub circle {
      stroke: #ddd6fe !important;
      filter:
        drop-shadow(0 0 14px rgba(168, 85, 247, 0.65))
        drop-shadow(0 0 28px rgba(46, 230, 255, 0.22)) !important;
    }
    body.kg-focus-on #panel.side-mode {
      background: linear-gradient(180deg, rgba(10, 14, 28, 0.98), rgba(6, 9, 20, 0.98)) !important;
      border-left: 1px solid rgba(46, 230, 255, 0.22) !important;
      box-shadow: -12px 0 40px rgba(0,0,0,0.35);
    }
    body.kg-focus-on #panel.side-mode .panel-header {
      background: linear-gradient(180deg, rgba(46, 230, 255, 0.1), transparent 85%);
      border-bottom: 1px solid rgba(148,163,184,0.12);
    }
    body.kg-focus-on #panel.side-mode .panel-header h2 {
      font-family: "Noto Sans SC", var(--font);
      font-size: 1.2rem;
      letter-spacing: 0.01em;
    }
    .lesson-card {
      border-radius: 12px !important;
      transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.18s !important;
    }
    .lesson-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(46, 230, 255, 0.12);
    }
    .kg-node-tip {
      border-radius: 12px;
      border: 1px solid rgba(167, 139, 250, 0.4);
      box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(168, 85, 247, 0.12);
      backdrop-filter: blur(12px);
    }
    .panel-actions button {
      border-radius: 8px;
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .panel-actions button:hover { transform: translateY(-1px); }
    .sql-drill-hint {
      border-radius: 999px !important;
      border-color: rgba(46, 230, 255, 0.28) !important;
      background: rgba(8, 12, 26, 0.85) !important;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    @media (prefers-reduced-motion: reduce) {
      body, .brand-mark, .sat-link.layer-2, .sat-link.layer-3,
      .sat-link.layer-4, .hub-ring-dash, .home-caption {
        animation: none !important;
      }
    }

'''

if "美化第 1 轮" not in text:
    anchor = "    </style>\n</head>"
    if anchor not in text:
        raise SystemExit("style end missing")
    text = text.replace(anchor, PASS1 + PASS2 + "    </style>\n</head>", 1)
    print("pass1+2 css ok")
else:
    print("beautify css already")

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
