# -*- coding: utf-8 -*-
"""Add tip, enter auto-fit, learning progress."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- HTML: progress + tip ----------
OLD_ASIDE = '''      <div class="kg-focus-legend" id="kgFocusLegend"></div>
      <div class="kg-more-btns" id="kgMoreBtns"></div>'''
NEW_ASIDE = '''      <div class="kg-progress" id="kgProgress" aria-label="学习进度">
        <div class="kg-progress-head">
          <span>本课进度</span>
          <span id="kgProgressMeta">0 / 0</span>
        </div>
        <div class="kg-progress-track"><div class="kg-progress-bar" id="kgProgressBar"></div></div>
      </div>
      <div class="kg-focus-legend" id="kgFocusLegend"></div>
      <div class="kg-more-btns" id="kgMoreBtns"></div>'''
if "id=\"kgProgress\"" not in text:
    if OLD_ASIDE not in text:
        raise SystemExit("aside progress anchor missing")
    text = text.replace(OLD_ASIDE, NEW_ASIDE, 1)
    print("progress html ok")
else:
    print("progress html already")

OLD_HINT = '''        <div class="kg-canvas-hint" id="kgCanvasHint">点击二级主题打开讲义 · 可拖拽节点 · 左右「« »」腾出画布</div>'''
NEW_HINT = '''        <div class="kg-node-tip" id="kgNodeTip" hidden></div>
        <div class="kg-canvas-hint" id="kgCanvasHint">点击二级主题打开讲义 · 可拖拽节点 · 左右「« »」腾出画布</div>'''
if "id=\"kgNodeTip\"" not in text:
    if OLD_HINT not in text:
        raise SystemExit("canvas hint missing")
    text = text.replace(OLD_HINT, NEW_HINT, 1)
    print("tip html ok")
else:
    print("tip html already")

# ---------- CSS ----------
CSS = r'''
    /* Tip + 学习进度 */
    .kg-node-tip {
      position: absolute; z-index: 20; pointer-events: none;
      max-width: 240px; padding: 8px 10px; border-radius: 10px;
      background: rgba(10, 14, 26, 0.94);
      border: 1px solid rgba(168, 85, 247, 0.35);
      box-shadow: 0 10px 28px rgba(0,0,0,0.45);
      color: #e2e8f0; font-size: 0.78rem; line-height: 1.45;
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
      transform: translate(-50%, calc(-100% - 12px));
      backdrop-filter: blur(8px);
    }
    .kg-node-tip .tip-title { font-weight: 700; color: #f8fafc; margin-bottom: 2px; }
    .kg-node-tip .tip-meta { color: #94a3b8; font-size: 0.7rem; }
    .kg-node-tip .tip-meta .ok { color: #34d399; }
    .kg-progress {
      display: flex; flex-direction: column; gap: 6px;
      padding: 8px 10px; border-radius: 10px;
      border: 1px solid rgba(148,163,184,0.18);
      background: rgba(15,22,40,0.55);
    }
    .kg-progress-head {
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.72rem; color: #94a3b8;
    }
    .kg-progress-head #kgProgressMeta { color: #e2e8f0; font-weight: 600; font-variant-numeric: tabular-nums; }
    .kg-progress-track {
      height: 6px; border-radius: 999px; overflow: hidden;
      background: rgba(30,41,59,0.9);
    }
    .kg-progress-bar {
      height: 100%; width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg, #a855f7, #22d3ee);
      transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
    }

'''

if ".kg-node-tip {" not in text:
    anchor = "    </style>\n</head>"
    if anchor not in text:
        raise SystemExit("style end missing")
    text = text.replace(anchor, CSS + "    </style>\n</head>", 1)
    print("css ok")
else:
    print("css already")

# ---------- Extract fitKgFocusView + reuse in wire + enter ----------
FIT_FN = r'''
        function fitKgFocusView(duration) {
          if (!kgDrill.active || !satData || !satData.length || typeof zoom === "undefined") return;
          const pad = 88;
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          const hubN = nodeById[kgDrill.hubId];
          if (hubN) {
            minX = maxX = hubN.x; minY = maxY = hubN.y;
          }
          satData.forEach(d => {
            minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x);
            minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y);
          });
          const bw = Math.max(140, maxX - minX + pad * 2);
          const bh = Math.max(140, maxY - minY + pad * 2);
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          const scale = Math.min(1.85, Math.max(0.42, Math.min(width() / bw, height() / bh) * 0.9));
          const dur = duration == null ? 420 : duration;
          const t = d3.zoomIdentity.translate(width() / 2, height() / 2).scale(scale).translate(-cx, -cy);
          if (dur <= 0) svg.call(zoom.transform, t);
          else svg.transition().duration(dur).ease(d3.easeCubicInOut).call(zoom.transform, t);
        }

        function countKgLessonStats(root) {
          let total = 0, done = 0;
          function walk(n) {
            if (!n) return;
            const kids = n.children || [];
            if (!kids.length) {
              total += 1;
              if (isLearned("kg:" + kgDrill.hubId + ":" + n.id)) done += 1;
              return;
            }
            kids.forEach(walk);
          }
          walk(root);
          return { total, done };
        }

        function showKgNodeTip(d, event) {
          const tip = document.getElementById("kgNodeTip");
          const graph = document.getElementById("graph");
          if (!tip || !graph || !d) return;
          const kg = findKgNode(d.kgId);
          const level = kg && kg.level ? sqlKgLevelLabel(kg.level) : "";
          let kind = "主题";
          if (d.isLeaf) kind = "讲义";
          else if (d.isChapter) kind = "章节";
          else if (d.layer === 2) kind = "一级领域";
          const learned = isLearned(d.learnId);
          tip.innerHTML = `<div class="tip-title">${escapeHtml(d.name)}</div>` +
            `<div class="tip-meta">${escapeHtml(kind)}${level ? " · " + escapeHtml(level) : ""}` +
            `${learned ? ' · <span class="ok">已学</span>' : ""}</div>`;
          tip.hidden = false;
          const rect = graph.getBoundingClientRect();
          const x = (event && event.clientX != null) ? event.clientX - rect.left : 0;
          const y = (event && event.clientY != null) ? event.clientY - rect.top : 0;
          tip.style.left = Math.max(60, Math.min(rect.width - 60, x)) + "px";
          tip.style.top = Math.max(28, y - 8) + "px";
        }

        function hideKgNodeTip() {
          const tip = document.getElementById("kgNodeTip");
          if (tip) tip.hidden = true;
        }

        function updateKgProgress() {
          const meta = document.getElementById("kgProgressMeta");
          const bar = document.getElementById("kgProgressBar");
          if (!meta || !bar) return;
          if (!kgDrill.active) {
            meta.textContent = "0 / 0";
            bar.style.width = "0%";
            return;
          }
          const stats = countKgLessonStats(currentKgTree());
          meta.textContent = stats.done + " / " + stats.total;
          const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
          bar.style.width = pct + "%";
          bar.title = pct + "%";
        }

'''

if "function fitKgFocusView" not in text:
    marker = "        function wireKgRailsAndZoom() {"
    if marker not in text:
        raise SystemExit("wireKgRailsAndZoom missing")
    text = text.replace(marker, FIT_FN + marker, 1)
    print("helpers ok")
else:
    print("helpers already")

# Simplify fit button to call fitKgFocusView
OLD_FIT_BODY = '''            fit.addEventListener("click", (e) => {
              e.stopPropagation();
              if (kgDrill.active && satData && satData.length && typeof zoom !== "undefined") {
                const pad = 80;
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                const hubN = nodeById[kgDrill.hubId];
                if (hubN) {
                  minX = maxX = hubN.x; minY = maxY = hubN.y;
                }
                satData.forEach(d => {
                  minX = Math.min(minX, d.x); maxX = Math.max(maxX, d.x);
                  minY = Math.min(minY, d.y); maxY = Math.max(maxY, d.y);
                });
                const bw = Math.max(120, maxX - minX + pad * 2);
                const bh = Math.max(120, maxY - minY + pad * 2);
                const cx = (minX + maxX) / 2;
                const cy = (minY + maxY) / 2;
                const scale = Math.min(2.0, Math.max(0.45, Math.min(width() / bw, height() / bh) * 0.92));
                svg.transition().duration(420).ease(d3.easeCubicInOut).call(
                  zoom.transform,
                  d3.zoomIdentity
                    .translate(width() / 2, height() / 2)
                    .scale(scale)
                    .translate(-cx, -cy)
                );
              } else if (typeof relayout === "function") {
                relayout();
              }
            });'''

NEW_FIT_BODY = '''            fit.addEventListener("click", (e) => {
              e.stopPropagation();
              if (kgDrill.active) fitKgFocusView(420);
              else if (typeof relayout === "function") relayout();
            });'''

if OLD_FIT_BODY in text:
    text = text.replace(OLD_FIT_BODY, NEW_FIT_BODY, 1)
    print("fit wire ok")
elif "fitKgFocusView(420)" in text:
    print("fit wire already")
else:
    raise SystemExit("fit body missing")

# updateKgFocusChrome: call updateKgProgress
OLD_CHROME_END = '''          wireKgFocusSearch();
          wireKgRailsAndZoom();
          updateKgMoreButtons();
          document.body.classList.toggle("is-side-collapsed", !!kgSideCollapsed);
          document.body.classList.toggle("is-panel-collapsed", !!kgPanelCollapsed);
        }'''
NEW_CHROME_END = '''          wireKgFocusSearch();
          wireKgRailsAndZoom();
          updateKgMoreButtons();
          if (typeof updateKgProgress === "function") updateKgProgress();
          document.body.classList.toggle("is-side-collapsed", !!kgSideCollapsed);
          document.body.classList.toggle("is-panel-collapsed", !!kgPanelCollapsed);
        }'''
if "updateKgProgress()" not in text.split("function updateKgFocusChrome")[1][:2500]:
    if OLD_CHROME_END not in text:
        raise SystemExit("chrome end missing")
    text = text.replace(OLD_CHROME_END, NEW_CHROME_END, 1)
    print("chrome progress ok")
else:
    print("chrome progress already")

# enterKgDrill finishEnter auto fit
OLD_ENTER = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            if (typeof tick === "function") tick();
          };'''
NEW_ENTER = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            if (typeof tick === "function") tick();
            // settle 几帧后再 fit，避免挤在边缘
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(520); }, 280);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(380); }, 720);
          };'''
if "fitKgFocusView(520)" not in text:
    if OLD_ENTER not in text:
        raise SystemExit("finishEnter missing")
    text = text.replace(OLD_ENTER, NEW_ENTER, 1)
    print("enter fit ok")
else:
    print("enter fit already")

# Tip on hover in paintSatLayer
OLD_HOVER = '''          satNodeSel.on("mouseenter", function (event, d) {
            kgHoverId = d.learnId;
            refreshHoverClasses();
            d3.select(this).select("circle")
              .transition().duration(140)
              .attr("r", baseSatRadius(d) * 1.22);
          });
          satNodeSel.on("mouseleave", function (event, d) {
            if (kgHoverId === d.learnId) kgHoverId = null;
            refreshHoverClasses();
            d3.select(this).select("circle")
              .transition().duration(160)
              .attr("r", d.kgId === kgDrill.selectedLeafId ? baseSatRadius(d) * 1.08 : baseSatRadius(d));
          });'''

NEW_HOVER = '''          satNodeSel.on("mouseenter", function (event, d) {
            kgHoverId = d.learnId;
            refreshHoverClasses();
            showKgNodeTip(d, event);
            d3.select(this).select("circle")
              .transition().duration(140)
              .attr("r", baseSatRadius(d) * 1.22);
          });
          satNodeSel.on("mousemove", function (event, d) {
            showKgNodeTip(d, event);
          });
          satNodeSel.on("mouseleave", function (event, d) {
            if (kgHoverId === d.learnId) kgHoverId = null;
            refreshHoverClasses();
            hideKgNodeTip();
            d3.select(this).select("circle")
              .transition().duration(160)
              .attr("r", d.kgId === kgDrill.selectedLeafId ? baseSatRadius(d) * 1.08 : baseSatRadius(d));
          });'''

if "showKgNodeTip(d, event)" not in text:
    if OLD_HOVER not in text:
        raise SystemExit("hover handlers missing")
    text = text.replace(OLD_HOVER, NEW_HOVER, 1)
    print("tip hover ok")
else:
    print("tip hover already")

# Hide tip on drag start
OLD_DRAG_START = '''            .on("start", (event, d) => {
              event.sourceEvent.stopPropagation();
              if (kgLiveSim) kgLiveSim.alphaTarget(0.35).restart();'''
NEW_DRAG_START = '''            .on("start", (event, d) => {
              event.sourceEvent.stopPropagation();
              hideKgNodeTip();
              if (kgLiveSim) kgLiveSim.alphaTarget(0.35).restart();'''
if "hideKgNodeTip();\n              if (kgLiveSim)" not in text:
    if OLD_DRAG_START not in text:
        raise SystemExit("drag start missing")
    text = text.replace(OLD_DRAG_START, NEW_DRAG_START, 1)
    print("drag hide tip ok")
else:
    print("drag hide tip already")

# syncLearnedUI refresh progress
OLD_SYNC = '''    function syncLearnedUI() {
      if (typeof node !== "undefined" && node) {
        node.classed("learned", d => isLearned(d.id));
        node.selectAll(".learned-mark").text(d => isLearned(d.id) ? "✓" : "");
      }
      if (typeof satNodeSel !== "undefined" && satNodeSel) {
        satNodeSel.classed("learned", d => isLearned(d.learnId));
      }'''
NEW_SYNC = '''    function syncLearnedUI() {
      if (typeof node !== "undefined" && node) {
        node.classed("learned", d => isLearned(d.id));
        node.selectAll(".learned-mark").text(d => isLearned(d.id) ? "✓" : "");
      }
      if (typeof satNodeSel !== "undefined" && satNodeSel) {
        satNodeSel.classed("learned", d => isLearned(d.learnId));
      }
      if (typeof updateKgProgress === "function" && kgDrill && kgDrill.active) updateKgProgress();'''
if "updateKgProgress === \"function\" && kgDrill" not in text and "typeof updateKgProgress === \"function\" && kgDrill" not in text:
    # check
    if "typeof updateKgProgress === \"function\" && kgDrill && kgDrill.active" in text:
        print("sync progress already")
    elif OLD_SYNC not in text:
        raise SystemExit("syncLearnedUI missing")
    else:
        text = text.replace(OLD_SYNC, NEW_SYNC, 1)
        print("sync progress ok")
else:
    print("sync progress already")

# exit hide tip
OLD_EXIT = '''        function exitKgDrill() {
          stopKgPulse();'''
NEW_EXIT = '''        function exitKgDrill() {
          hideKgNodeTip();
          stopKgPulse();'''
if "function exitKgDrill() {\n          hideKgNodeTip();" not in text:
    if OLD_EXIT not in text:
        raise SystemExit("exitKgDrill missing")
    text = text.replace(OLD_EXIT, NEW_EXIT, 1)
    print("exit tip ok")
else:
    print("exit tip already")

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
