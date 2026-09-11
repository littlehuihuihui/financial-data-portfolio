# -*- coding: utf-8 -*-
"""Continue polish: toast, next lesson, click pulse, home hot entries."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- CSS ----------
CSS = r'''
    /* 继续优化：Toast / 下一课 / 热门入口 / 点击波纹 */
    .kg-toast-host {
      position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%);
      z-index: 200; display: flex; flex-direction: column; gap: 8px;
      pointer-events: none; align-items: center;
    }
    .kg-toast {
      min-width: 160px; max-width: min(420px, 88vw);
      padding: 10px 16px; border-radius: 999px;
      background: rgba(10, 14, 28, 0.92);
      border: 1px solid rgba(46, 230, 255, 0.28);
      color: #e2e8f0; font-size: 0.82rem;
      box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      backdrop-filter: blur(12px);
      animation: toastIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
    }
    .kg-toast.ok { border-color: rgba(52, 211, 153, 0.45); }
    .kg-toast.out { animation: toastOut 0.22s ease forwards; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(10px) scale(0.96); }
      to { opacity: 1; transform: none; }
    }
    @keyframes toastOut {
      to { opacity: 0; transform: translateY(6px) scale(0.98); }
    }
    .panel-actions {
      display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
    }
    #btnNextLesson {
      display: none;
      font-family: var(--font-mono); font-size: 0.72rem;
      padding: 7px 14px; border-radius: 9px; cursor: pointer;
      border: 1px solid rgba(46, 230, 255, 0.4);
      background: rgba(46, 230, 255, 0.1);
      color: #67e8f9;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
    }
    #btnNextLesson:hover {
      background: rgba(46, 230, 255, 0.18);
      transform: translateY(-1px);
    }
    body.kg-focus-on #btnNextLesson.is-on { display: inline-flex; align-items: center; gap: 4px; }
    .home-hot {
      position: absolute; left: 50%; top: 18%; transform: translateX(-50%);
      z-index: 6; display: none; flex-wrap: wrap; gap: 8px; justify-content: center;
      max-width: min(560px, 92vw); pointer-events: auto;
    }
    body.home-hero:not(.kg-focus-on) .home-hot { display: flex; }
    .home-hot button {
      font-family: "Noto Sans SC", var(--font);
      font-size: 0.78rem; padding: 8px 14px; border-radius: 999px; cursor: pointer;
      border: 1px solid rgba(167, 139, 250, 0.35);
      background: rgba(10, 14, 28, 0.72);
      color: #e2e8f0;
      backdrop-filter: blur(10px);
      transition: border-color 0.2s, background 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .home-hot button:hover {
      border-color: rgba(46, 230, 255, 0.55);
      background: rgba(46, 230, 255, 0.1);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(46, 230, 255, 0.12);
    }
    .sat-node.is-pulse circle {
      animation: satClickPulse 0.42s ease-out;
    }
    @keyframes satClickPulse {
      0% { filter: drop-shadow(0 0 4px rgba(255,255,255,0.2)); }
      40% { filter: drop-shadow(0 0 18px rgba(255,255,255,0.65)); }
      100% { filter: drop-shadow(0 0 8px rgba(46, 230, 255, 0.35)); }
    }
    @media (prefers-reduced-motion: reduce) {
      .kg-toast, .sat-node.is-pulse circle { animation: none !important; }
    }

'''

if ".kg-toast-host" not in text:
    text = text.replace("    </style>\n</head>", CSS + "    </style>\n</head>", 1)
    print("css ok")
else:
    print("css already")

# ---------- HTML ----------
if 'id="kgToastHost"' not in text:
    text = text.replace(
        "  </div>\n  <script>",
        '  </div>\n  <div class="kg-toast-host" id="kgToastHost" aria-live="polite"></div>\n  <script>',
        1,
    )
    print("toast host ok")
else:
    print("toast host already")

if 'id="btnNextLesson"' not in text:
    text = text.replace(
        '<button type="button" id="btnLearned" title="写入浏览器 localStorage">标记已学习</button>',
        '<button type="button" id="btnLearned" title="写入浏览器 localStorage">标记已学习</button>\n'
        '          <button type="button" id="btnNextLesson" title="跳转到下一课">下一课 →</button>',
        1,
    )
    print("next btn ok")
else:
    print("next btn already")

if 'id="homeHot"' not in text:
    old = '<div class="hint home-caption">点击中心节点 · 展开一级领域 · 再点某一级查看二级</div>'
    new = '''<div class="home-hot" id="homeHot" aria-label="热门入口"></div>
        <div class="hint home-caption">点击中心节点 · 或点上方热门入口直达</div>'''
    if old not in text:
        raise SystemExit("home caption missing")
    text = text.replace(old, new, 1)
    print("home hot html ok")
else:
    print("home hot html already")

# ---------- Toast + toggleLearned toast ----------
OLD_TOGGLE = '''    function toggleLearned(id) {
      if (!id) return;
      if (learnedSet.has(id)) learnedSet.delete(id);
      else learnedSet.add(id);
      saveLearned(learnedSet);
      syncLearnedUI();
      if (typeof redrawSatellites === "function") redrawSatellites();
    }'''
NEW_TOGGLE = '''    function showKgToast(msg, kind) {
      const host = document.getElementById("kgToastHost");
      if (!host || !msg) return;
      const el = document.createElement("div");
      el.className = "kg-toast" + (kind === "ok" ? " ok" : "");
      el.textContent = msg;
      host.appendChild(el);
      setTimeout(() => {
        el.classList.add("out");
        setTimeout(() => el.remove(), 220);
      }, 1600);
    }
    function toggleLearned(id) {
      if (!id) return;
      if (learnedSet.has(id)) {
        learnedSet.delete(id);
        showKgToast("已取消学习标记");
      } else {
        learnedSet.add(id);
        showKgToast("已标记为学过", "ok");
      }
      saveLearned(learnedSet);
      syncLearnedUI();
      if (typeof redrawSatellites === "function") redrawSatellites();
      if (typeof updateNextLessonBtn === "function") updateNextLessonBtn();
    }'''
if "function showKgToast" not in text:
    if OLD_TOGGLE not in text:
        raise SystemExit("toggleLearned missing")
    text = text.replace(OLD_TOGGLE, NEW_TOGGLE, 1)
    print("toast fn ok")
else:
    print("toast fn already")

# ---------- Next lesson helpers (near openKgSidePanel area) ----------
NEXT_FN = r'''
        function flattenKgLeaves(root, out) {
          if (!root) return out || [];
          const acc = out || [];
          const kids = filterKgChildren(root.children || []);
          if (!kids.length) {
            acc.push(root);
            return acc;
          }
          kids.forEach(c => flattenKgLeaves(c, acc));
          return acc;
        }

        function findNextKgLesson(fromId) {
          const tree = currentKgTree();
          if (!tree) return null;
          const leaves = flattenKgLeaves(tree, []);
          if (!leaves.length) return null;
          const idx = leaves.findIndex(n => n.id === fromId);
          // 优先下一未学；否则顺序下一课
          for (let i = Math.max(0, idx + 1); i < leaves.length; i++) {
            const id = "kg:" + kgDrill.hubId + ":" + leaves[i].id;
            if (!isLearned(id)) return leaves[i];
          }
          for (let i = 0; i < leaves.length; i++) {
            const id = "kg:" + kgDrill.hubId + ":" + leaves[i].id;
            if (!isLearned(id) && leaves[i].id !== fromId) return leaves[i];
          }
          if (idx >= 0 && idx + 1 < leaves.length) return leaves[idx + 1];
          return null;
        }

        function jumpToKgLesson(node) {
          if (!node || !kgDrill.active) return;
          pushKgFocusHistory();
          const pathIds = [];
          (function dfs(n, trail) {
            const t = trail.concat(n);
            if (n.id === node.id) { pathIds.push(...t.map(x => x.id)); return true; }
            for (const c of (n.children || [])) if (dfs(c, t)) return true;
            return false;
          })(currentKgTree(), []);
          if (pathIds.length >= 2) kgDrill.expandedL2 = pathIds[1];
          if (pathIds.length >= 3) kgDrill.expandedL3 = pathIds[2];
          kgDrill.selectedLeafId = node.id;
          redrawKgDrill();
          openKgSidePanel(node, isLessonParent(node) ? "chapter" : (kgNodeKids(node).length ? "chapter" : "lesson"));
          updateKgDrillHint();
          setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 100);
          showKgToast("已跳转 · " + node.title);
        }

        function updateNextLessonBtn() {
          const btn = document.getElementById("btnNextLesson");
          if (!btn) return;
          if (!kgDrill.active || !kgDrill.selectedLeafId || kgDrill.panelMode === "empty") {
            btn.classList.remove("is-on");
            btn._nextId = null;
            return;
          }
          const next = findNextKgLesson(kgDrill.selectedLeafId);
          if (!next || next.id === kgDrill.selectedLeafId) {
            btn.classList.remove("is-on");
            btn._nextId = null;
            btn.title = "本课已学完或无下一课";
            return;
          }
          btn.classList.add("is-on");
          btn._nextId = next.id;
          btn.textContent = "下一课 · " + (next.title.length > 8 ? next.title.slice(0, 7) + "…" : next.title) + " →";
          btn.title = "下一课：" + next.title;
        }

        function wireNextLessonBtn() {
          const btn = document.getElementById("btnNextLesson");
          if (!btn || btn._bound) return;
          btn._bound = true;
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!btn._nextId) return;
            const n = findKgNode(btn._nextId);
            if (n) jumpToKgLesson(n);
          });
        }

'''

if "function findNextKgLesson" not in text:
    marker = "        function openKgSidePanel(kgNode, mode) {"
    if marker not in text:
        raise SystemExit("openKgSidePanel missing")
    text = text.replace(marker, NEXT_FN + marker, 1)
    print("next lesson fns ok")
else:
    print("next lesson fns already")

# Call updateNextLessonBtn at end of openKgSidePanel
OLD_OPEN_END = '''          syncLearnedUI();
          updateKgDrillHint();
        }
    
        /** 百科同款极角：y 轴向下时用 -sin，使 135°=左上、45°=右上、270°=正下 */'''
NEW_OPEN_END = '''          syncLearnedUI();
          updateKgDrillHint();
          wireNextLessonBtn();
          updateNextLessonBtn();
        }
    
        /** 百科同款极角：y 轴向下时用 -sin，使 135°=左上、45°=右上、270°=正下 */'''
if "wireNextLessonBtn();\n          updateNextLessonBtn();" not in text:
    if OLD_OPEN_END not in text:
        raise SystemExit("open end missing")
    text = text.replace(OLD_OPEN_END, NEW_OPEN_END, 1)
    print("open next wire ok")
else:
    print("open next wire already")

# showKgEmptyPanel should hide next btn - updateNextLessonBtn handles panelMode empty

# Toast on collapse
OLD_COLLAPSE = '''        function collapseKgToL1() {
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
        }'''
NEW_COLLAPSE = '''        function collapseKgToL1() {
          if (!kgDrill.active) return;
          const had = !!(kgDrill.expandedL2 || kgDrill.expandedL3);
          kgDrill.expandedL2 = null;
          kgDrill.expandedL3 = null;
          kgDrill.selectedLeafId = null;
          kgDrill.panelMode = null;
          hideKgNodeTip();
          showKgEmptyPanel();
          redrawKgDrill();
          updateKgDrillHint();
          updateNextLessonBtn();
          setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 80);
          if (had) showKgToast("已收起至一级");
        }'''
if "已收起至一级" not in text:
    if OLD_COLLAPSE not in text:
        raise SystemExit("collapse missing")
    text = text.replace(OLD_COLLAPSE, NEW_COLLAPSE, 1)
    print("collapse toast ok")
else:
    print("collapse toast already")

# Click pulse on sat click
OLD_CLICK = '''          satNodeSel.on("click", (event, d) => {
            event.stopPropagation();
            onKgDrillClick(d);
          });'''
NEW_CLICK = '''          satNodeSel.on("click", (event, d) => {
            event.stopPropagation();
            const g = d3.select(event.currentTarget);
            g.classed("is-pulse", false);
            void event.currentTarget.offsetWidth;
            g.classed("is-pulse", true);
            setTimeout(() => g.classed("is-pulse", false), 450);
            onKgDrillClick(d);
          });'''
if "is-pulse" not in text.split("satNodeSel.on(\"click\"")[1][:400]:
    if OLD_CLICK not in text:
        raise SystemExit("sat click missing")
    text = text.replace(OLD_CLICK, NEW_CLICK, 1)
    print("click pulse ok")
else:
    print("click pulse already")

# ---------- Home hot entries ----------
HOT_FN = r'''
    function wireHomeHotEntries() {
      const box = document.getElementById("homeHot");
      if (!box || box._bound) return;
      box._bound = true;
      const entries = [
        { id: "sql-select", label: "SELECT 查询" },
        { id: "sql-join", label: "JOIN 关联" },
        { id: "sql-window", label: "窗口函数" },
        { id: "sql-group-by", label: "GROUP BY" },
        { id: "sql-index-intro", label: "索引入门" }
      ];
      box.innerHTML = entries.map(e =>
        `<button type="button" data-hot="${e.id}">${e.label}</button>`
      ).join("");
      box.querySelectorAll("[data-hot]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-hot");
          if (!KG_TREES.sql) return;
          enterKgDrill("sql");
          // 等焦点舞台就绪后再跳转
          setTimeout(() => {
            const n = findKgNode(id);
            if (n) jumpToKgLesson(n);
            else showKgToast("未找到该知识点");
          }, 380);
        });
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", wireHomeHotEntries);
    } else {
      // deferred: call after KG fns exist — hooked near relayout end
    }

'''

# findKgNode and enterKgDrill / jumpToKgLesson are defined later - wireHomeHotEntries must be called at end of script
# Insert call before final relayout()

if "function wireHomeHotEntries" not in text:
    # insert before btnLearned listener area is too early for findKgNode
    # put function near end before relayout, and call it
    marker = "    window.addEventListener(\"resize\", () => relayout());"
    if marker not in text:
        raise SystemExit("resize marker missing")
    text = text.replace(
        marker,
        HOT_FN + "    wireHomeHotEntries();\n" + marker,
        1,
    )
    print("home hot wire ok")
else:
    print("home hot wire already")

# Problem: wireHomeHotEntries uses enterKgDrill, findKgNode, jumpToKgLesson, showKgToast
# jumpToKgLesson is nested inside the drill block - might not be global!
# enterKgDrill and findKgNode - check if nested

# Looking at indentation - findKgNode and enterKgDrill and jumpToKgLesson are at 8 spaces inside... 
# Actually in this file many functions are oddly indented but at script level.
# jumpToKgLesson is inserted before openKgSidePanel with 8 spaces - script level if not inside another function.

# enterKgDrill is nested? Looking at "        function enterKgDrill" - 8 spaces
# If they're inside an IIFE or function, wireHomeHotEntries at end won't see them.

# From earlier context, the SQL kg functions appear to be at top-level with extra indent (not wrapped).
# findKgNode is `        function findKgNode` 
# So they're global function declarations - hoisted. Good.

# But wait - are they inside another function block that started somehow?
# Grep for wrapping... The conversation showed they're siblings under script. OK.

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
