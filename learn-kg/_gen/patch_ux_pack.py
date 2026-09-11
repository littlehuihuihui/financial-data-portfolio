# -*- coding: utf-8 -*-
"""UX pack: hotkeys, empty panel, search aliases, dblclick collapse, hub collapse."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- CSS empty + hint chip ----------
CSS = r'''
    /* UX 增强：空状态 / 快捷键提示 */
    .kg-panel-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; gap: 10px;
      min-height: 52vh; padding: 28px 18px;
      color: #94a3b8;
    }
    .kg-panel-empty .orb {
      width: 56px; height: 56px; border-radius: 50%;
      background:
        radial-gradient(circle at 35% 35%, #e9d5ff, transparent 42%),
        radial-gradient(circle at 70% 70%, #22d3ee, transparent 50%),
        rgba(124, 58, 237, 0.35);
      box-shadow: 0 0 28px rgba(168, 85, 247, 0.35);
      margin-bottom: 6px;
      animation: emptyOrb 3.2s ease-in-out infinite;
    }
    @keyframes emptyOrb {
      0%, 100% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.06); filter: brightness(1.12); }
    }
    .kg-panel-empty h3 {
      margin: 0; font-size: 1rem; color: #e2e8f0; font-weight: 700;
    }
    .kg-panel-empty p {
      margin: 0; font-size: 0.82rem; line-height: 1.65; max-width: 16em;
    }
    .kg-panel-empty .keys {
      display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 8px;
    }
    .kg-panel-empty kbd,
    .kg-hotkey-chip kbd {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      padding: 3px 7px;
      border-radius: 6px;
      border: 1px solid rgba(148,163,184,0.28);
      background: rgba(15,22,40,0.85);
      color: #cbd5e1;
    }
    .kg-hotkey-chip {
      position: absolute; left: 14px; bottom: 14px; z-index: 11;
      display: none; gap: 8px; align-items: center; flex-wrap: wrap;
      font-size: 0.68rem; color: #64748b;
      padding: 6px 10px; border-radius: 999px;
      background: rgba(8,12,26,0.72); border: 1px solid rgba(148,163,184,0.16);
      backdrop-filter: blur(8px); pointer-events: none;
    }
    body.kg-focus-on .kg-hotkey-chip { display: flex; }
    body.kg-focus-on .kg-canvas-hint { bottom: 48px; }
    @media (prefers-reduced-motion: reduce) {
      .kg-panel-empty .orb { animation: none !important; }
    }

'''

if "kg-panel-empty" not in text:
    text = text.replace("    </style>\n</head>", CSS + "    </style>\n</head>", 1)
    print("css ok")
else:
    print("css already")

# ---------- HTML hotkey chip ----------
OLD_HINT = '''        <div class="kg-canvas-hint" id="kgCanvasHint">先点一级展开其二级 · 再点二级打开讲义 · 可拖拽 ·「« »」腾出画布</div>'''
NEW_HINT = '''        <div class="kg-canvas-hint" id="kgCanvasHint">先点一级展开其二级 · 再点二级打开讲义 · 可拖拽 ·「« »」腾出画布</div>
        <div class="kg-hotkey-chip" aria-hidden="true"><kbd>Esc</kbd> 回退 <kbd>/</kbd> 搜索 <kbd>F</kbd> 适配 · 双击空白收起二级</div>'''
if "kg-hotkey-chip" not in text:
    if OLD_HINT not in text:
        raise SystemExit("canvas hint missing")
    text = text.replace(OLD_HINT, NEW_HINT, 1)
    print("hotkey chip html ok")
else:
    print("hotkey chip already")

# ---------- Helpers + search aliases + empty panel + collapse + hotkeys ----------
HELPERS = r'''
        const KG_SEARCH_ALIASES = {
          join: ["连接", "关联", "inner", "left", "right"],
          "连接": ["join", "关联"],
          "窗口": ["window", "over", "row_number", "rank"],
          window: ["窗口", "over", "开窗"],
          "索引": ["index", "执行计划", "explain"],
          index: ["索引", "btree"],
          cte: ["with", "子查询", "公共表表达式"],
          "事务": ["transaction", "锁", "隔离"],
          "锁": ["lock", "事务", "死锁"],
          "聚合": ["group by", "count", "sum", "avg"],
          "过滤": ["where", "having", "筛选"],
          sql: ["查询", "语句", "select"]
        };

        function kgSearchTerms(q) {
          const raw = String(q || "").trim().toLowerCase();
          if (!raw) return [];
          const terms = new Set([raw]);
          Object.keys(KG_SEARCH_ALIASES).forEach(k => {
            const key = k.toLowerCase();
            if (raw.includes(key) || key.includes(raw)) {
              terms.add(key);
              (KG_SEARCH_ALIASES[k] || []).forEach(a => terms.add(String(a).toLowerCase()));
            }
          });
          return [...terms];
        }

        function showKgEmptyPanel() {
          if (!kgDrill.active) return;
          const hub = nodeById[kgDrill.hubId];
          const hubName = (hub && hub.name) || "课程";
          panel.classList.add("side-mode", "open");
          panel.classList.remove("sec-foundation", "sec-advanced", "sec-practice");
          panel.setAttribute("aria-hidden", "false");
          if (panelCard) panelCard.classList.remove("sql-kg-wide");
          panelCat.textContent = hubName + " · 导览";
          panelCat.style.background = (hub && CATEGORIES[hub.category]) ? CATEGORIES[hub.category].color : "#a855f7";
          panelTitle.textContent = "选择知识点";
          panelSub.textContent = "点一级展开二级 · 再点二级打开讲义";
          panelBody.innerHTML = `
            <div class="kg-panel-empty">
              <div class="orb" aria-hidden="true"></div>
              <h3>从画布开始探索</h3>
              <p>先点某个<strong>一级领域</strong>展开其二级主题，再点主题或叶节点查看讲义。</p>
              <div class="keys">
                <kbd>Esc</kbd><kbd>/</kbd><kbd>F</kbd>
              </div>
            </div>`;
          kgDrill.panelMode = "empty";
          kgDrill.selectedLeafId = null;
          syncLearnedUI();
        }

        function collapseKgToL1() {
          if (!kgDrill.active) return;
          kgDrill.expandedL2 = null;
          kgDrill.expandedL3 = null;
          kgDrill.selectedLeafId = null;
          kgDrill.panelMode = null;
          hideKgNodeTip();
          showKgEmptyPanel();
          redrawKgDrill();
          updateKgDrillHint();
          setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 80);
        }

        function handleKgEscape() {
          if (!kgDrill.active) return;
          const drop = document.getElementById("kgFocusSearchDrop");
          if (drop && drop.classList.contains("open")) {
            drop.classList.remove("open");
            return;
          }
          if (panel.classList.contains("open") && kgDrill.panelMode && kgDrill.panelMode !== "empty") {
            showKgEmptyPanel();
            kgDrill.selectedLeafId = null;
            redrawKgDrill();
            updateKgDrillHint();
            return;
          }
          if (kgDrill.expandedL2 || kgDrill.expandedL3) {
            collapseKgToL1();
            return;
          }
          if (kgFocusHistory.length) {
            popKgFocusHistory();
            return;
          }
          exitKgDrill();
        }

        function wireKgHotkeys() {
          if (document._kgHotkeysBound) return;
          document._kgHotkeysBound = true;
          document.addEventListener("keydown", (e) => {
            if (!kgDrill || !kgDrill.active) return;
            const tag = (e.target && e.target.tagName) || "";
            const typing = tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable);
            if (e.key === "Escape") {
              e.preventDefault();
              handleKgEscape();
              return;
            }
            if (typing) return;
            if (e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
              e.preventDefault();
              const input = document.getElementById("kgFocusSearch");
              if (input) { input.focus(); input.select(); }
              return;
            }
            if (e.key === "f" || e.key === "F") {
              e.preventDefault();
              fitKgFocusView(420);
              return;
            }
            if (e.key === "Backspace" && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              if (kgFocusHistory.length) popKgFocusHistory();
              else handleKgEscape();
            }
          });
        }

'''

# Insert helpers before wireKgFocusSearch
if "KG_SEARCH_ALIASES" not in text:
    marker = "        function wireKgFocusSearch() {"
    if marker not in text:
        raise SystemExit("wireKgFocusSearch missing")
    text = text.replace(marker, HELPERS + marker, 1)
    print("helpers ok")
else:
    print("helpers already")

# ---------- Search with aliases ----------
OLD_SEARCH = '''            const all = [];
            collectSearchNodes(tree, [], all);
            const qq = q.trim().toLowerCase();
            const hits = all.filter(x => x.title.toLowerCase().includes(qq) || x.path.toLowerCase().includes(qq)).slice(0, 12);'''

NEW_SEARCH = '''            const all = [];
            collectSearchNodes(tree, [], all);
            const qq = q.trim().toLowerCase();
            const terms = kgSearchTerms(qq);
            const hits = all.filter(x => {
              const blob = (x.title + " " + x.path).toLowerCase();
              return terms.some(t => blob.includes(t));
            }).slice(0, 12);'''

if "kgSearchTerms(qq)" not in text:
    if OLD_SEARCH not in text:
        raise SystemExit("search filter missing")
    text = text.replace(OLD_SEARCH, NEW_SEARCH, 1)
    print("search alias ok")
else:
    print("search alias already")

# wire hotkeys at end of wireKgFocusSearch
OLD_WIRE_END = '''          input.addEventListener("input", () => renderDrop(input.value));
          input.addEventListener("focus", () => { if (input.value) renderDrop(input.value); });
          document.addEventListener("click", () => drop.classList.remove("open"));
        }'''
NEW_WIRE_END = '''          input.addEventListener("input", () => renderDrop(input.value));
          input.addEventListener("focus", () => { if (input.value) renderDrop(input.value); });
          document.addEventListener("click", () => drop.classList.remove("open"));
          wireKgHotkeys();
        }'''
if "wireKgHotkeys();" not in text.split("function wireKgFocusSearch")[1][:2000]:
    if OLD_WIRE_END not in text:
        raise SystemExit("wire end missing")
    text = text.replace(OLD_WIRE_END, NEW_WIRE_END, 1)
    print("wire hotkeys call ok")
else:
    print("wire hotkeys call already")

# ---------- closePanelSoft -> empty when focus ----------
OLD_CLOSE = '''        function closePanelSoft() {
          panel.classList.remove("open");
          panel.classList.remove("side-mode");
          panel.setAttribute("aria-hidden", "true");
          if (panelCard) panelCard.classList.remove("sql-kg-wide");
          kgDrill.panelMode = null;
        }'''
NEW_CLOSE = '''        function closePanelSoft() {
          if (panelCard) panelCard.classList.remove("sql-kg-wide");
          if (kgDrill && kgDrill.active) {
            // 焦点模式保持右栏壳，显示空状态引导
            showKgEmptyPanel();
            return;
          }
          panel.classList.remove("open");
          panel.classList.remove("side-mode");
          panel.setAttribute("aria-hidden", "true");
          kgDrill.panelMode = null;
        }'''
if "焦点模式保持右栏壳" not in text:
    if OLD_CLOSE not in text:
        raise SystemExit("closePanelSoft missing")
    text = text.replace(OLD_CLOSE, NEW_CLOSE, 1)
    print("empty on close ok")
else:
    print("empty on close already")

# enterKgDrill already calls closePanelSoft which will now show empty - good

# ---------- Hub click: collapse to L1 if already expanded ----------
OLD_HUB = '''        if (kgDrill.active && kgDrill.hubId === d.id) {
          if (!kgDrill.revealed) {
            kgDrill.revealed = true;
            redrawKgDrill();
          }
          updateKgDrillHint();
          syncKgHubSize();
        } else {
          enterKgDrill(d.id);
        }'''
NEW_HUB = '''        if (kgDrill.active && kgDrill.hubId === d.id) {
          if (!kgDrill.revealed) {
            kgDrill.revealed = true;
            redrawKgDrill();
          } else if (kgDrill.expandedL2 || kgDrill.expandedL3 || (kgDrill.panelMode && kgDrill.panelMode !== "empty")) {
            collapseKgToL1();
          }
          updateKgDrillHint();
          syncKgHubSize();
        } else {
          enterKgDrill(d.id);
        }'''
if "collapseKgToL1()" not in text.split("kgDrill.active && kgDrill.hubId === d.id")[1][:500]:
    if OLD_HUB not in text:
        raise SystemExit("hub click missing")
    text = text.replace(OLD_HUB, NEW_HUB, 1)
    print("hub collapse ok")
else:
    print("hub collapse already")

# ---------- svg click / dblclick ----------
OLD_SVG = '''    svg.on("click", () => { clearSatellites(); closePanel(); });'''
NEW_SVG = '''    svg.on("click", (event) => {
      // 焦点模式：单击空白不退出（避免误触）；双击收起二级
      if (kgDrill && kgDrill.active) return;
      clearSatellites();
      closePanel();
    });
    svg.on("dblclick", (event) => {
      if (!(kgDrill && kgDrill.active)) return;
      event.preventDefault();
      event.stopPropagation();
      collapseKgToL1();
    });'''
if 'svg.on("dblclick"' not in text:
    if OLD_SVG not in text:
        raise SystemExit("svg click missing")
    text = text.replace(OLD_SVG, NEW_SVG, 1)
    print("svg dblclick ok")
else:
    print("svg dblclick already")

# ---------- Stronger pop-out: slightly longer settle alpha for new nodes ----------
# bump enter transition for layer-3
OLD_ENTER_G = '''                g.transition().duration(420).ease(d3.easeCubicOut).attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(520).ease(d3.easeBackOut.overshoot(1.35))
                  .attr("r", d => baseSatRadius(d));'''
NEW_ENTER_G = '''                g.transition().duration(d => d.layer >= 3 ? 520 : 380).ease(d3.easeCubicOut).attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(d => d.layer >= 3 ? 580 : 460).ease(d3.easeBackOut.overshoot(1.55))
                  .attr("r", d => baseSatRadius(d));'''
if "d.layer >= 3 ? 520" not in text:
    if OLD_ENTER_G not in text:
        print("WARN enter transition")
    else:
        text = text.replace(OLD_ENTER_G, NEW_ENTER_G, 1)
        print("enter motion ok")
else:
    print("enter motion already")

# Also call wireKgHotkeys from updateKgFocusChrome
OLD_CHROME = '''          wireKgFocusSearch();
          wireKgRailsAndZoom();
          updateKgMoreButtons();'''
NEW_CHROME = '''          wireKgFocusSearch();
          wireKgRailsAndZoom();
          wireKgHotkeys();
          updateKgMoreButtons();'''
if "wireKgHotkeys();\n          updateKgMoreButtons" not in text:
    if OLD_CHROME not in text:
        print("WARN chrome")
    else:
        text = text.replace(OLD_CHROME, NEW_CHROME, 1)
        print("chrome hotkeys ok")
else:
    print("chrome hotkeys already")

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
