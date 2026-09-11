# -*- coding: utf-8 -*-
"""Close remaining encyclopedia gaps: auto-reveal L2, path history, flex L-C-R stage."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- 1) HTML: workspace flex shell, move aside out of #graph ----------
OLD_BODY = '''  <div class="layout">
    <div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>
      <aside id="kgFocusSide" class="kg-focus-side" aria-label="焦点导航">
        <div class="kg-focus-side-head">
          <h3 id="kgFocusSideTitle">课程焦点</h3>
          <button type="button" class="kg-back-btn" id="btnKgFocusBack">← 返回总览</button>
        </div>
        <div class="kg-focus-legend" id="kgFocusLegend"></div>
        <div>
          <div class="kg-focus-path-label">探索路径</div>
          <div id="kgFocusPath" class="kg-focus-path-body">—</div>
        </div>
        <p class="kg-focus-side-hint" id="kgFocusSideHint">再点中心展开三扇区 · 弧线一对多下钻</p>
      </aside>
      <div class="toolbar" id="depthToolbar" role="group" aria-label="内容深度">
        <button type="button" id="btnDepthJunior" title="初级：仅入门级(?)知识点">初级</button>
        <button type="button" id="btnDepthMid" class="active" title="中级：入门 + 进阶(??)">中级</button>
        <button type="button" id="btnDepthSenior" title="高级：入门 + 进阶 + 高阶(???)">高级</button>
      </div>
      <div class="hint">点击课程节点进入焦点扇区 · 弧线一对多下钻 · 章节导读 / 叶节点讲义 · SQL·Python·ETL·数仓·BI·ML</div>
      <div class="sql-drill-hint" id="sqlDrillHint" hidden></div>
    </div>
  </div>
  <div id="panel" aria-hidden="true">'''

NEW_BODY = '''  <div class="kg-workspace" id="kgWorkspace">
    <aside id="kgFocusSide" class="kg-focus-side" aria-label="焦点导航" hidden>
      <div class="kg-focus-side-head">
        <h3 id="kgFocusSideTitle">课程焦点</h3>
        <button type="button" class="kg-back-btn" id="btnKgFocusBack">← 返回</button>
      </div>
      <div class="kg-focus-legend" id="kgFocusLegend"></div>
      <div>
        <div class="kg-focus-path-label">探索路径 <span class="kg-hist-meta" id="kgHistMeta"></span></div>
        <div id="kgFocusPath" class="kg-focus-path-body">—</div>
      </div>
      <p class="kg-focus-side-hint" id="kgFocusSideHint">三扇区辐射 · 弧线一对多下钻 · 点路径可回退</p>
    </aside>
    <div class="layout" id="kgLayout">
      <div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>
        <div class="toolbar" id="depthToolbar" role="group" aria-label="内容深度">
          <button type="button" id="btnDepthJunior" title="初级：仅入门级(?)知识点">初级</button>
          <button type="button" id="btnDepthMid" class="active" title="中级：入门 + 进阶(??)">中级</button>
          <button type="button" id="btnDepthSenior" title="高级：入门 + 进阶 + 高阶(???)">高级</button>
        </div>
        <div class="hint">点击课程节点进入焦点舞台 · 三扇区辐射 · 章节导读 / 叶节点讲义</div>
        <div class="sql-drill-hint" id="sqlDrillHint" hidden></div>
      </div>
    </div>
    <div id="panel" aria-hidden="true">'''

if 'id="kgWorkspace"' not in text:
    if OLD_BODY not in text:
        raise SystemExit("OLD_BODY block not found")
    # also need to close workspace after panel
    text = text.replace(OLD_BODY, NEW_BODY, 1)
    # close panel div then add workspace close — find after panel closing
    old_close = '''      <div class="panel-body" id="panelBody"></div>
    </div>
  </div>
  <script>'''
    new_close = '''      <div class="panel-body" id="panelBody"></div>
    </div>
  </div>
  </div>
  <script>'''
    if old_close not in text:
        raise SystemExit("panel close anchor not found")
    text = text.replace(old_close, new_close, 1)
    print("HTML workspace shell applied")
else:
    print("HTML workspace already present")

# ---------- 2) CSS for flex stage ----------
CSS_STAGE = r'''
    /* 焦点舞台：左栏 | 画布 | 右栏（对齐行业百科 kg2-focus） */
    .kg-workspace {
      display: block;
      height: calc(100vh - 52px);
      position: relative;
    }
    body.kg-focus-on .kg-workspace {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      background: #070b16;
    }
    body.kg-focus-on .kg-workspace > .layout {
      flex: 1 1 auto;
      min-width: 0;
      height: 100%;
    }
    body.kg-focus-on .kg-focus-side {
      display: flex !important;
      position: relative;
      left: auto; top: auto; bottom: auto;
      width: 240px;
      flex: 0 0 240px;
      height: auto;
      max-height: none;
      border-radius: 0;
      border: none;
      border-right: 1px solid rgba(168, 85, 247, 0.28);
      z-index: 8;
    }
    body.kg-focus-on #panel.side-mode {
      position: relative;
      inset: auto;
      flex: 0 0 min(400px, 34vw);
      width: min(400px, 34vw) !important;
      max-width: min(400px, 34vw);
      height: 100%;
      display: none;
      pointer-events: auto;
      background: rgba(10, 14, 26, 0.96);
      border-left: 1px solid rgba(34, 211, 238, 0.28);
      z-index: 9;
    }
    body.kg-focus-on #panel.side-mode.open {
      display: flex;
      align-items: stretch;
      justify-content: stretch;
    }
    body.kg-focus-on #panel.side-mode .panel-inner {
      width: 100% !important;
      max-width: none;
      height: 100%;
      max-height: none;
      border-radius: 0;
      border: none;
      box-shadow: none;
      transform: none;
      background: transparent;
      backdrop-filter: none;
    }
    body.kg-focus-on .stages,
    body.kg-focus-on .stage-band,
    body.kg-focus-on .stage-label,
    body.kg-focus-on .link,
    body.kg-focus-on .node:not(.kg-focus-hub) {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    body.kg-focus-on #graph {
      background:
        radial-gradient(ellipse 50% 45% at 50% 42%, rgba(168,85,247,0.12), transparent 65%),
        #070b16;
    }
    .kg-focus-path-body .kg-crumb {
      display: inline;
      color: var(--accent);
      cursor: pointer;
      border-bottom: 1px dashed rgba(34,211,238,0.35);
    }
    .kg-focus-path-body .kg-crumb:hover { color: #fff; }
    .kg-focus-path-body .kg-crumb.is-current {
      color: #f8fafc; cursor: default; border-bottom: none; font-weight: 700;
    }
    .kg-hist-meta {
      font-size: 0.62rem; color: #64748b; margin-left: 6px;
    }
    @media (max-width: 900px) {
      body.kg-focus-on .kg-workspace { flex-wrap: wrap; }
      body.kg-focus-on .kg-focus-side {
        flex: 1 1 100%; width: 100%; max-height: 28vh;
        border-right: none; border-bottom: 1px solid rgba(168,85,247,0.28);
      }
      body.kg-focus-on #panel.side-mode {
        flex: 1 1 100%; width: 100% !important; max-width: none; height: 42vh;
      }
    }
'''

if "body.kg-focus-on .kg-workspace" not in text:
    # insert before </style> of main - after lesson-card-meta or kg-focus-side block end
    anchor = "    .lesson-card-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); }"
    # better after kg-focus-side media query
    if "@media (max-width: 720px) {\n      .kg-focus-side {" in text:
        # append after the closing of that media and before </style> - find last kg-focus media
        idx = text.find("    /* 焦点左栏（对齐行业百科双栏仪器台的左侧迷你壳） */")
        # insert CSS_STAGE right before </style> that precedes </head>
        style_end = text.find("  </style>\n</head>")
        if style_end < 0:
            raise SystemExit("style end missing")
        text = text[:style_end] + CSS_STAGE + "\n  " + text[style_end:]
        print("flex stage CSS inserted")
    else:
        style_end = text.find("  </style>\n</head>")
        text = text[:style_end] + CSS_STAGE + "\n  " + text[style_end:]
        print("flex stage CSS inserted (fallback)")
else:
    print("flex stage CSS already present")

# Soften absolute left chrome rules that conflict — update body.kg-focus-on .kg-focus-side early rule
# The old rule `body.kg-focus-on .kg-focus-side { display: flex; }` is fine; absolute positioning in .kg-focus-side
# is overridden by relative in focus-on block above.

# ---------- 3) JS: auto-reveal + history ----------
# enterKgDrill: revealed true
text2 = text.replace(
    """          kgDrill = {
            active: true,
            hubId,
            revealed: false,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: { x: hub.x, y: hub.y }
          };""",
    """          kgDrill = {
            active: true,
            hubId,
            revealed: true,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: { x: hub.x, y: hub.y }
          };
          kgFocusHistory = [];""",
    1,
)
if text2 == text:
    print("WARN: enterKgDrill revealed patch missed")
else:
    text = text2
    print("auto-reveal on enter")

# Add kgFocusHistory near kgSettleTimer
if "let kgFocusHistory" not in text:
    text = text.replace(
        "    let kgSettleTimer = null;",
        "    let kgSettleTimer = null;\n    let kgFocusHistory = [];",
        1,
    )
    print("kgFocusHistory declared")

# Replace exitFocusToOverview + updateKgFocusChrome block with history-aware version
OLD_CHROME = '''        function exitFocusToOverview() {
          clearSatellites();
          resetHighlight();
          closePanelSoft();
        }

        function updateKgFocusChrome() {
          const side = document.getElementById("kgFocusSide");
          const titleEl = document.getElementById("kgFocusSideTitle");
          const pathEl = document.getElementById("kgFocusPath");
          const hintEl = document.getElementById("kgFocusSideHint");
          const legEl = document.getElementById("kgFocusLegend");
          const backBtn = document.getElementById("btnKgFocusBack");
          if (!side) return;
          if (!kgDrill.active) {
            side.setAttribute("hidden", "");
            return;
          }
          side.removeAttribute("hidden");
          const hub = nodeById[kgDrill.hubId];
          const hubName = (hub && hub.name) || kgDrill.hubId;
          if (titleEl) titleEl.textContent = hubName + " · 焦点";
          if (pathEl) {
            const titles = kgFocusPathTitles();
            pathEl.textContent = titles.length ? titles.join(" → ") : hubName;
          }
          if (hintEl) {
            if (!kgDrill.revealed) hintEl.textContent = "再点中心：展开基础 / 进阶 / 实战 三扇区";
            else if (kgDrill.panelMode === "chapter") hintEl.textContent = "章节导读已打开 · 点绿色叶节点进入讲义";
            else if (kgDrill.selectedLeafId) hintEl.textContent = "右侧为讲义 · 可标记已学习";
            else hintEl.textContent = "三扇区辐射 · 弧线一对多 · 倒数第二层出导读";
          }
          if (legEl) {
            legEl.innerHTML = `<div class="kg-focus-legend-title">扇区图例</div>` + KG_SECTOR_ORDER.map(k => {
              const s = KG_SECTORS[k];
              return `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:${s.color};color:${s.color}"></span>${escapeHtml(s.label)} · ${s.angDeg}°</div>`;
            }).join("") +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#34d399;color:#34d399"></span>叶节点讲义</div>` +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#f59e0b;color:#f59e0b"></span>已展开分支</div>`;
          }
          if (backBtn && !backBtn._bound) {
            backBtn._bound = true;
            backBtn.addEventListener("click", (event) => {
              event.stopPropagation();
              exitFocusToOverview();
            });
          }
        }

        function updateKgDrillHint() {
          const el = document.getElementById("sqlDrillHint");
          updateKgFocusChrome();
          if (!el) return;
          if (!kgDrill.active) { el.hidden = true; return; }
          const hubName = (nodeById[kgDrill.hubId] && nodeById[kgDrill.hubId].name) || kgDrill.hubId;
          let msg;
          if (!kgDrill.revealed) {
            msg = `焦点模式：<strong>${escapeHtml(hubName)}</strong> · 再点中心展开三扇区`;
          } else if (kgDrill.panelMode === "chapter") {
            const titles = kgFocusPathTitles();
            msg = `章节：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 右侧导读，或点绿色叶节点学讲义`;
          } else if (kgDrill.selectedLeafId) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong>（右侧讲义）`;
          } else if (kgDrill.expandedL2) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 继续点主题 / 知识点`;
          } else {
            msg = `已展开 <strong>${escapeHtml(hubName)}</strong> · 基础/进阶/实战三扇区 · 弧线一对多`;
          }
          el.hidden = false;
          el.innerHTML = `${msg} <button type="button" id="btnExitKgFocus">← 返回总览</button>`;
          const btn = document.getElementById("btnExitKgFocus");
          if (btn) {
            btn.addEventListener("click", (event) => {
              event.stopPropagation();
              exitFocusToOverview();
            });
          }
        }'''

NEW_CHROME = r'''        function snapshotKgFocus() {
          return {
            hubId: kgDrill.hubId,
            revealed: kgDrill.revealed,
            expandedL2: kgDrill.expandedL2,
            expandedL3: kgDrill.expandedL3,
            selectedLeafId: kgDrill.selectedLeafId,
            panelMode: kgDrill.panelMode
          };
        }

        function pushKgFocusHistory() {
          if (!kgDrill.active) return;
          const snap = snapshotKgFocus();
          const last = kgFocusHistory.length ? kgFocusHistory[kgFocusHistory.length - 1] : null;
          if (last &&
              last.expandedL2 === snap.expandedL2 &&
              last.expandedL3 === snap.expandedL3 &&
              last.selectedLeafId === snap.selectedLeafId &&
              last.panelMode === snap.panelMode) return;
          kgFocusHistory.push(snap);
          if (kgFocusHistory.length > 40) kgFocusHistory.shift();
        }

        function restoreKgFocusSnapshot(snap) {
          if (!snap || !kgDrill.active) return;
          kgDrill.revealed = snap.revealed !== false;
          kgDrill.expandedL2 = snap.expandedL2;
          kgDrill.expandedL3 = snap.expandedL3;
          kgDrill.selectedLeafId = snap.selectedLeafId;
          kgDrill.panelMode = snap.panelMode;
          redrawKgDrill();
          if (snap.selectedLeafId) {
            const n = findKgNode(snap.selectedLeafId);
            if (n) openKgSidePanel(n, snap.panelMode || (isLessonParent(n) ? "chapter" : "lesson"));
            else closePanelSoft();
          } else {
            closePanelSoft();
          }
          updateKgDrillHint();
        }

        function popKgFocusHistory() {
          if (!kgFocusHistory.length) {
            exitFocusToOverview();
            return;
          }
          const snap = kgFocusHistory.pop();
          restoreKgFocusSnapshot(snap);
        }

        function jumpKgPathDepth(depthIdx) {
          // depthIdx: 0 = hub only; 1 = L2; 2 = L3; 3 = leaf
          pushKgFocusHistory();
          if (depthIdx <= 0) {
            kgDrill.expandedL2 = null;
            kgDrill.expandedL3 = null;
            kgDrill.selectedLeafId = null;
            closePanelSoft();
            redrawKgDrill();
            updateKgDrillHint();
            return;
          }
          if (depthIdx === 1 && kgDrill.expandedL2) {
            kgDrill.expandedL3 = null;
            const n = findKgNode(kgDrill.expandedL2);
            kgDrill.selectedLeafId = isLessonParent(n) ? n.id : null;
            redrawKgDrill();
            if (n && isLessonParent(n)) openKgSidePanel(n, "chapter");
            else closePanelSoft();
            updateKgDrillHint();
            return;
          }
          if (depthIdx === 2 && kgDrill.expandedL3) {
            const n = findKgNode(kgDrill.expandedL3);
            kgDrill.selectedLeafId = n ? n.id : null;
            redrawKgDrill();
            if (n) openKgSidePanel(n, isLessonParent(n) ? "chapter" : "lesson");
            updateKgDrillHint();
          }
        }

        function exitFocusToOverview() {
          kgFocusHistory = [];
          clearSatellites();
          resetHighlight();
          closePanelSoft();
        }

        function updateKgFocusChrome() {
          const side = document.getElementById("kgFocusSide");
          const titleEl = document.getElementById("kgFocusSideTitle");
          const pathEl = document.getElementById("kgFocusPath");
          const hintEl = document.getElementById("kgFocusSideHint");
          const legEl = document.getElementById("kgFocusLegend");
          const backBtn = document.getElementById("btnKgFocusBack");
          const histMeta = document.getElementById("kgHistMeta");
          if (!side) return;
          if (!kgDrill.active) {
            side.setAttribute("hidden", "");
            return;
          }
          side.removeAttribute("hidden");
          const hub = nodeById[kgDrill.hubId];
          const hubName = (hub && hub.name) || kgDrill.hubId;
          if (titleEl) titleEl.textContent = hubName + " · 焦点";
          if (histMeta) {
            histMeta.textContent = kgFocusHistory.length
              ? "· 可回退 " + kgFocusHistory.length + " 步"
              : "";
          }
          if (pathEl) {
            const titles = kgFocusPathTitles();
            if (!titles.length) {
              pathEl.textContent = hubName;
            } else {
              pathEl.innerHTML = titles.map((t, i) => {
                const last = i === titles.length - 1;
                const cls = last ? "kg-crumb is-current" : "kg-crumb";
                return `<span class="${cls}" data-path-depth="${i}">${escapeHtml(t)}</span>` +
                  (last ? "" : " <span style=\"color:#64748b\">→</span> ");
              }).join("");
              pathEl.querySelectorAll(".kg-crumb:not(.is-current)").forEach(el => {
                el.addEventListener("click", (ev) => {
                  ev.stopPropagation();
                  const depth = parseInt(el.getAttribute("data-path-depth"), 10);
                  jumpKgPathDepth(depth);
                });
              });
            }
          }
          if (hintEl) {
            if (kgDrill.panelMode === "chapter") hintEl.textContent = "章节导读 · 点绿色叶节点进入讲义 · 点路径可回退";
            else if (kgDrill.selectedLeafId) hintEl.textContent = "右侧讲义 · 「返回」先回退历史，空则回总览";
            else hintEl.textContent = "三扇区已展开 · 点主题下钻 · 点路径面包屑回退";
          }
          if (legEl) {
            legEl.innerHTML = `<div class="kg-focus-legend-title">扇区图例</div>` + KG_SECTOR_ORDER.map(k => {
              const s = KG_SECTORS[k];
              return `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:${s.color};color:${s.color}"></span>${escapeHtml(s.label)} · ${s.angDeg}°</div>`;
            }).join("") +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#34d399;color:#34d399"></span>叶节点讲义</div>` +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#f59e0b;color:#f59e0b"></span>已展开分支</div>`;
          }
          if (backBtn) {
            backBtn.textContent = kgFocusHistory.length ? "← 回退一步" : "← 返回总览";
            if (!backBtn._bound) {
              backBtn._bound = true;
              backBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                popKgFocusHistory();
              });
            }
          }
        }

        function updateKgDrillHint() {
          const el = document.getElementById("sqlDrillHint");
          updateKgFocusChrome();
          if (!el) return;
          if (!kgDrill.active) { el.hidden = true; return; }
          const hubName = (nodeById[kgDrill.hubId] && nodeById[kgDrill.hubId].name) || kgDrill.hubId;
          let msg;
          if (kgDrill.panelMode === "chapter") {
            const titles = kgFocusPathTitles();
            msg = `章节：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 右侧导读`;
          } else if (kgDrill.selectedLeafId) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong>（右侧讲义）`;
          } else if (kgDrill.expandedL2) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 继续下钻`;
          } else {
            msg = `<strong>${escapeHtml(hubName)}</strong> · 基础/进阶/实战三扇区已展开`;
          }
          el.hidden = false;
          el.innerHTML = `${msg} <button type="button" id="btnExitKgFocus">← 总览</button>`;
          const btn = document.getElementById("btnExitKgFocus");
          if (btn) {
            btn.addEventListener("click", (event) => {
              event.stopPropagation();
              exitFocusToOverview();
            });
          }
        }'''

if "function pushKgFocusHistory()" not in text:
    if OLD_CHROME not in text:
        raise SystemExit("OLD_CHROME block not found")
    text = text.replace(OLD_CHROME, NEW_CHROME, 1)
    print("history + chrome JS applied")
else:
    print("history JS already present")

# Hook pushKgFocusHistory into onKgDrillClick and openKgSidePanel
# Before state changes in onKgDrillClick - patch the start of onKgDrillClick
OLD_CLICK_START = '''        function onKgDrillClick(sat) {
          const kg = findKgNode(sat.kgId);
          if (!kg) return;
          const kids = filterKgChildren(kgNodeKids(kg));
          const rawKids = kgNodeKids(kg);
    
          // 叶节点 → 讲义
          if (!rawKids.length) {
            kgDrill.selectedLeafId = kg.id;
            redrawKgDrill();
            openKgSidePanel(kg, "lesson");
            return;
          }'''

NEW_CLICK_START = '''        function onKgDrillClick(sat) {
          const kg = findKgNode(sat.kgId);
          if (!kg) return;
          const kids = filterKgChildren(kgNodeKids(kg));
          const rawKids = kgNodeKids(kg);
          pushKgFocusHistory();

          // 叶节点 → 讲义
          if (!rawKids.length) {
            kgDrill.selectedLeafId = kg.id;
            redrawKgDrill();
            openKgSidePanel(kg, "lesson");
            return;
          }'''

if "pushKgFocusHistory();\n\n          // 叶节点" not in text:
    if OLD_CLICK_START not in text:
        print("WARN: onKgDrillClick start not found")
    else:
        text = text.replace(OLD_CLICK_START, NEW_CLICK_START, 1)
        print("onKgDrillClick history push")

# syncKgHubSize sublabel
text = text.replace(
    'return kgDrill.revealed ? "领域已展开" : "再点展开";',
    'return kgDrill.revealed ? "三扇区已展开" : "展开扇区";',
    1,
)

# Hub re-click when already revealed: don't reset — encyclopedia keeps focus
OLD_HUB_CLICK = '''        if (kgDrill.active && kgDrill.hubId === d.id && !kgDrill.revealed) {
          kgDrill.revealed = true;
          redrawKgDrill();
          updateKgDrillHint();
          syncKgHubSize();
        } else {
          enterKgDrill(d.id);
        }'''

# Need exact text from file
import re
m = re.search(
    r"if \(kgDrill\.active && kgDrill\.hubId === d\.id && !kgDrill\.revealed\) \{.*?enterKgDrill\(d\.id\);\s*\}",
    text,
    re.S,
)
if m:
    text = text[: m.start()] + '''if (kgDrill.active && kgDrill.hubId === d.id) {
          // 已在该课程焦点：保持三扇区，不重置
          if (!kgDrill.revealed) {
            kgDrill.revealed = true;
            redrawKgDrill();
          }
          updateKgDrillHint();
          syncKgHubSize();
        } else {
          enterKgDrill(d.id);
        }''' + text[m.end() :]
    print("hub re-click behavior updated")
else:
    print("WARN: hub click pattern not found")

# exitKgDrill clear history
if "kgFocusHistory = [];" not in text.split("function exitKgDrill()")[1][:400]:
    text = text.replace(
        """        function exitKgDrill() {
          stopKgPulse();
          if (typeof stopKgSettle === "function") stopKgSettle();""",
        """        function exitKgDrill() {
          stopKgPulse();
          if (typeof stopKgSettle === "function") stopKgSettle();
          kgFocusHistory = [];""",
        1,
    )
    print("exitKgDrill clears history")

HTML.write_text(text, encoding="utf-8")
print("done, lines", text.count("\n") + 1)
