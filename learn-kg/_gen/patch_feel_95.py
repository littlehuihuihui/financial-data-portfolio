# -*- coding: utf-8 -*-
"""Polish DATA NEXUS focus UX toward encyclopedia 95% feel."""
from pathlib import Path
import re

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- fonts ----------
OLD_FONT = '''  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Orbitron:wght@500;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />'''
NEW_FONT = '''  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&family=Orbitron:wght@500;700&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet" />'''
if "Noto+Sans+SC" not in text:
    text = text.replace(OLD_FONT, NEW_FONT, 1)
    print("font link ok")

text = text.replace(
    '--font: "Rajdhani", "PingFang SC", "Microsoft YaHei", sans-serif;',
    '--font: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Rajdhani", sans-serif;',
    1,
)

# ---------- CSS polish block ----------
CSS = r'''
    /* ===== 95% 手感打磨：对齐行业百科 ===== */
    body.kg-focus-on {
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    body.kg-focus-on #graph.kg-canvas {
      background:
        radial-gradient(ellipse 60% 50% at 50% 30%, rgba(99, 102, 241, 0.14), transparent 70%),
        radial-gradient(ellipse 40% 40% at 15% 70%, rgba(249, 115, 22, 0.07), transparent 60%),
        radial-gradient(ellipse 40% 40% at 85% 65%, rgba(16, 185, 129, 0.07), transparent 60%),
        #0a0e1a;
    }
    body.kg-focus-on #graph.kg-canvas::before {
      content: "";
      position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        linear-gradient(rgba(30, 41, 59, 0.28) 1px, transparent 1px),
        linear-gradient(90deg, rgba(30, 41, 59, 0.28) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, #000 20%, transparent 75%);
      opacity: 0.45;
    }
    .kg-focus-side {
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
    }
    .kg-search-mini { position: relative; margin-top: 4px; }
    .kg-search-mini input {
      width: 100%; box-sizing: border-box;
      padding: 8px 10px; border-radius: 8px;
      border: 1px solid rgba(148,163,184,0.22);
      background: rgba(15,22,40,0.85); color: #e2e8f0;
      font-size: 0.82rem; outline: none;
    }
    .kg-search-mini input:focus { border-color: rgba(168,85,247,0.55); }
    .kg-search-drop {
      display: none; position: absolute; left: 0; right: 0; top: 100%;
      z-index: 20; max-height: 220px; overflow: auto;
      margin-top: 4px; border-radius: 8px;
      border: 1px solid rgba(148,163,184,0.2);
      background: rgba(10,14,26,0.96);
    }
    .kg-search-drop.open { display: block; }
    .kg-search-drop button {
      display: block; width: 100%; text-align: left;
      padding: 8px 10px; border: none; background: transparent;
      color: #e2e8f0; cursor: pointer; font-size: 0.8rem;
    }
    .kg-search-drop button:hover { background: rgba(168,85,247,0.15); }
    .kg-search-drop .meta { color: #94a3b8; font-size: 0.68rem; }
    .kg-more-btns { display: flex; flex-direction: column; gap: 6px; }
    .kg-more-btns button {
      font-size: 0.72rem; padding: 7px 10px; border-radius: 8px; cursor: pointer;
      border: 1px solid rgba(148,163,184,0.25);
      background: rgba(255,255,255,0.03); color: #cbd5e1; text-align: left;
    }
    .kg-more-btns button:hover { border-color: rgba(34,211,238,0.45); color: #22d3ee; }
    .kg-canvas-wrap { position: relative; flex: 1; min-width: 0; height: 100%; }
    body.kg-focus-on .kg-workspace > .layout { position: relative; }
    .kg-ctrl {
      position: absolute; right: 16px; bottom: 18px; z-index: 12;
      display: none; flex-direction: column; gap: 6px;
    }
    body.kg-focus-on .kg-ctrl { display: flex; }
    .kg-ctrl button {
      width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
      border: 1px solid rgba(148,163,184,0.28);
      background: rgba(10,14,26,0.88); color: #e2e8f0; font-size: 1rem;
    }
    .kg-ctrl button:hover { border-color: #a855f7; color: #e9d5ff; }
    .kg-rail-btn {
      position: absolute; top: 50%; transform: translateY(-50%);
      z-index: 14; width: 28px; height: 56px; border-radius: 10px;
      border: 1px solid rgba(148,163,184,0.28);
      background: rgba(10,14,26,0.9); color: #cbd5e1; cursor: pointer;
      display: none; align-items: center; justify-content: center;
    }
    body.kg-focus-on .kg-rail-btn { display: flex; }
    .kg-rail-left { left: 8px; }
    .kg-rail-right { right: 8px; }
    body.kg-focus-on.is-side-collapsed .kg-focus-side {
      width: 0 !important; flex: 0 0 0 !important; padding: 0 !important;
      opacity: 0; overflow: hidden; border: none !important; pointer-events: none;
    }
    body.kg-focus-on.is-panel-collapsed #panel.side-mode {
      width: 0 !important; flex: 0 0 0 !important; max-width: 0 !important;
      opacity: 0; overflow: hidden; border: none !important; pointer-events: none;
    }
    .kg-canvas-hint {
      position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%);
      z-index: 11; display: none;
      font-size: 0.72rem; color: #94a3b8;
      background: rgba(10,14,26,0.82); border: 1px solid rgba(148,163,184,0.2);
      padding: 6px 12px; border-radius: 8px; white-space: nowrap;
      pointer-events: none;
    }
    body.kg-focus-on .kg-canvas-hint { display: block; }
    body.kg-focus-on .sql-drill-hint { bottom: 52px; }
    .sat-node { cursor: grab; }
    .sat-node:active { cursor: grabbing; }
    .sat-node circle {
      transition: r 0.18s ease, filter 0.18s ease, stroke-width 0.18s ease;
    }
    .sat-node.entering { opacity: 0; }
    .sat-link {
      transition: stroke-opacity 0.25s ease;
    }
    body.kg-focus-on #panel.side-mode .panel-inner {
      transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.22,1,0.36,1);
    }
    body.kg-focus-on #panel.side-mode:not(.open) .panel-inner {
      opacity: 0; transform: translateX(12px);
    }
    body.kg-focus-on #panel.side-mode.open .panel-inner {
      opacity: 1; transform: none;
    }
    .sat-node.selected circle {
      stroke: #fff !important; stroke-width: 3.2 !important;
      filter: drop-shadow(0 0 18px rgba(255,255,255,0.4)) !important;
    }
    .kg-focus-side-head h3 {
      background: linear-gradient(90deg, #e2e8f0, #a855f7);
      -webkit-background-clip: text; background-clip: text;
      color: transparent;
    }
'''

if "95% 手感打磨" not in text:
    style_end = text.find("  </style>\n</head>")
    text = text[:style_end] + CSS + "\n  " + text[style_end:]
    print("polish CSS ok")

# ---------- HTML shell upgrade ----------
OLD_SIDE = '''    <aside id="kgFocusSide" class="kg-focus-side" aria-label="焦点导航" hidden>
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
        <div class="hint">点击 SQL 大节点 → 展开一级领域 + 二级主题 · 再点主题学讲义</div>
        <div class="sql-drill-hint" id="sqlDrillHint" hidden></div>
      </div>
    </div>'''

NEW_SIDE = '''    <aside id="kgFocusSide" class="kg-focus-side" aria-label="焦点导航" hidden>
      <div class="kg-focus-side-head">
        <h3 id="kgFocusSideTitle">课程焦点</h3>
        <button type="button" class="kg-back-btn" id="btnKgFocusBack">← 返回</button>
      </div>
      <div class="kg-search-mini">
        <input id="kgFocusSearch" type="search" placeholder="搜索知识点…" autocomplete="off" />
        <div class="kg-search-drop" id="kgFocusSearchDrop"></div>
      </div>
      <div class="kg-focus-legend" id="kgFocusLegend"></div>
      <div class="kg-more-btns" id="kgMoreBtns"></div>
      <div>
        <div class="kg-focus-path-label">探索路径 <span class="kg-hist-meta" id="kgHistMeta"></span></div>
        <div id="kgFocusPath" class="kg-focus-path-body">—</div>
      </div>
      <p class="kg-focus-side-hint" id="kgFocusSideHint">拖拽节点微调 · 搜索定位 · « » 收起侧栏</p>
    </aside>
    <div class="layout" id="kgLayout">
      <div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>
        <button type="button" class="kg-rail-btn kg-rail-left" id="kgToggleSide" title="收起左侧栏">«</button>
        <button type="button" class="kg-rail-btn kg-rail-right" id="kgTogglePanel" title="收起右侧详情">»</button>
        <div class="kg-ctrl" id="kgZoomCtrl" aria-label="画布缩放">
          <button type="button" id="kgZoomIn" title="放大">＋</button>
          <button type="button" id="kgZoomOut" title="缩小">－</button>
          <button type="button" id="kgFit" title="适配">◎</button>
        </div>
        <div class="kg-canvas-hint" id="kgCanvasHint">点击二级主题打开讲义 · 可拖拽节点 · 左右「« »」腾出画布</div>
        <div class="toolbar" id="depthToolbar" role="group" aria-label="内容深度">
          <button type="button" id="btnDepthJunior" title="初级：仅入门级(?)知识点">初级</button>
          <button type="button" id="btnDepthMid" class="active" title="中级：入门 + 进阶(??)">中级</button>
          <button type="button" id="btnDepthSenior" title="高级：入门 + 进阶 + 高阶(???)">高级</button>
        </div>
        <div class="hint">点击 SQL 大节点 → 展开一级领域 + 二级主题 · 再点主题学讲义</div>
        <div class="sql-drill-hint" id="sqlDrillHint" hidden></div>
      </div>
    </div>'''

if 'id="kgFocusSearch"' not in text:
    if OLD_SIDE not in text:
        raise SystemExit("OLD_SIDE missing")
    text = text.replace(OLD_SIDE, NEW_SIDE, 1)
    print("HTML chrome ok")
else:
    print("HTML chrome exists")

# ---------- JS: state + live settle + drag + search + showMore + rails ----------
# Add state after kgFocusHistory
if "let kgShowMore" not in text:
    text = text.replace(
        "    let kgFocusHistory = [];",
        """    let kgFocusHistory = [];
    let kgShowMore = { foundation: 4, advanced: 4, practice: 4 };
    let kgShowMoreL3 = 6;
    let kgSideCollapsed = false;
    let kgPanelCollapsed = false;
    let kgLiveSim = null;
    let kgHoverId = null;""",
        1,
    )
    print("state vars ok")

# Replace settleSatPositions + paintSatLayer with live version
# Find and replace from settleSatPositions through end of paintSatLayer (before redrawKgDrill)

marker_start = text.find("        /** 短时 forceCollide，保留扇区目标位（百科 BarnesHut settle 的轻量版） */")
if marker_start < 0:
    marker_start = text.find("        function settleSatPositions(items, hub) {")
marker_end = text.find("        function redrawKgDrill() {")
if marker_start < 0 or marker_end < 0:
    raise SystemExit(f"settle/paint markers missing {marker_start} {marker_end}")

NEW_PAINT = r'''        function stopKgLiveSim() {
          if (kgLiveSim) {
            kgLiveSim.stop();
            kgLiveSim = null;
          }
          stopKgSettle();
        }

        /** 动画 settle + 可继续轻物理（百科 BarnesHut 手感） */
        function settleSatPositions(items, hub, animate) {
          if (!items.length || typeof d3 === "undefined" || !d3.forceSimulation) return items;
          stopKgLiveSim();
          items.forEach(d => {
            d.tx = d.x; d.ty = d.y;
            d._r = d.isLeaf ? 17 : (d.isBranch ? 28 : (d.layer === 2 ? 26 : 20));
          });
          const minDist = 78;
          kgLiveSim = d3.forceSimulation(items)
            .force("collide", d3.forceCollide().radius(d => (d._r || 20) + 6).strength(0.8).iterations(2))
            .force("x", d3.forceX(d => d.tx).strength(0.12))
            .force("y", d3.forceY(d => d.ty).strength(0.12))
            .force("charge", d3.forceManyBody().strength(-28))
            .velocityDecay(0.35)
            .alpha(0.9)
            .alphaDecay(0.04);

          let ticks = 0;
          kgLiveSim.on("tick", () => {
            ticks += 1;
            items.forEach(d => {
              const dx = d.x - hub.x, dy = d.y - hub.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < minDist) {
                d.x = hub.x + (dx / dist) * minDist;
                d.y = hub.y + (dy / dist) * minDist;
              }
            });
            if (satNodeSel) {
              satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            }
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal));
            }
            // 稳定后降物理强度，保留轻微活动感
            if (ticks === 45) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-8));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.04));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.04));
              kgLiveSim.alphaDecay(0.02);
            }
            if (ticks > 160) {
              kgLiveSim.alphaTarget(0).stop();
            }
          });
          if (!animate) {
            for (let i = 0; i < 36; i++) kgLiveSim.tick();
            kgLiveSim.stop();
            items.forEach(d => {
              const dx = d.x - hub.x, dy = d.y - hub.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < minDist) {
                d.x = hub.x + (dx / dist) * minDist;
                d.y = hub.y + (dy / dist) * minDist;
              }
            });
          }
          return items;
        }

        function baseSatRadius(d) {
          if (d.isLeaf) return 17;
          if (d.isBranch) return 28;
          if (d.isChapter) return 24;
          if (d.layer === 2) return 26;
          return 20;
        }

        function paintSatLayer(items) {
          satData = items;
          satLinkSel = satLinkG.selectAll("path").data(satData, d => d.learnId)
            .join(
              enter => enter.append("path")
                .attr("class", d => `sat-link layer-${d.layer}${d.layer >= 3 ? " dashed" : ""}`)
                .attr("stroke", d => d.color)
                .attr("opacity", 0)
                .call(s => s.transition().duration(420).attr("opacity", 1)),
              update => update
                .attr("class", d => `sat-link layer-${d.layer}${d.layer >= 3 ? " dashed" : ""}`)
                .attr("stroke", d => d.color),
              exit => exit.transition().duration(180).attr("opacity", 0).remove()
            )
            .attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal));

          satNodeSel = satNodeG.selectAll("g").data(satData, d => d.learnId)
            .join(
              enter => {
                const g = enter.append("g").attr("class", "sat-node entering");
                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 20);
                g.transition().duration(480).ease(d3.easeCubicOut)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(480).ease(d3.easeBackOut.overshoot(1.4))
                  .attr("r", d => baseSatRadius(d));
                return g;
              },
              update => update,
              exit => exit.transition().duration(160).attr("opacity", 0).remove()
            )
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("class", d => {
              let cls = `sat-node layer-${d.layer}`;
              if (d.isLeaf) cls += " is-leaf";
              if (d.isChapter) cls += " is-chapter";
              if (d.isBranch) cls += " is-branch";
              return cls;
            })
            .classed("selected", d => d.kgId === kgDrill.selectedLeafId)
            .classed("learned", d => isLearned(d.learnId));

          satNodeSel.select("circle")
            .attr("fill", d => d.color)
            .style("filter", d => d.sectorGlow
              ? `drop-shadow(0 0 14px ${d.sectorGlow})`
              : null);
          // 非 enter 节点同步半径
          satNodeSel.filter(function () { return !d3.select(this).classed("entering"); })
            .select("circle")
            .attr("r", d => {
              if (kgHoverId && d.learnId === kgHoverId) return baseSatRadius(d) * 1.2;
              return baseSatRadius(d);
            });

          satNodeSel.select("text.sat-label")
            .text(d => d.name.length > 7 ? d.name.slice(0, 6) + "…" : d.name);
          satNodeSel.select("text.sat-sub")
            .text(d => {
              if (d.isLeaf) return "讲义";
              if (d.isChapter && d.isBranch) return "导读";
              if (d.isChapter) return "章节";
              if (d.isBranch) return "已展开";
              return "展开";
            });

          satNodeSel.on("click", (event, d) => {
            event.stopPropagation();
            onKgDrillClick(d);
          });

          satNodeSel.on("mouseenter", function (event, d) {
            kgHoverId = d.learnId;
            d3.select(this).select("circle")
              .transition().duration(160)
              .attr("r", baseSatRadius(d) * 1.2);
          });
          satNodeSel.on("mouseleave", function (event, d) {
            if (kgHoverId === d.learnId) kgHoverId = null;
            d3.select(this).select("circle")
              .transition().duration(160)
              .attr("r", baseSatRadius(d));
          });

          // 可拖拽微调（百科拖节点手感）
          satNodeSel.call(d3.drag()
            .on("start", (event, d) => {
              event.sourceEvent.stopPropagation();
              if (kgLiveSim) kgLiveSim.alphaTarget(0.25).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = d.x = event.x;
              d.fy = d.y = event.y;
              d.tx = d.x; d.ty = d.y;
              if (satNodeSel) satNodeSel.attr("transform", n => `translate(${n.x},${n.y})`);
              if (satLinkSel) {
                satLinkSel.attr("d", n => satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal));
              }
            })
            .on("end", (event, d) => {
              d.fx = null; d.fy = null;
              if (kgLiveSim) kgLiveSim.alphaTarget(0);
            }));
        }

'''

text = text[:marker_start] + NEW_PAINT + text[marker_end:]
print("live settle + drag paint ok")

# Update settleSatPositions call to animate
text = text.replace(
    "          settleSatPositions(items, hub);\n          paintSatLayer(items);",
    "          paintSatLayer(items);\n          settleSatPositions(items, hub, true);",
    1,
)

# showMore slicing in redrawKgDrill — patch the groups.forEach list usage
OLD_LIST = '''            KG_SECTOR_ORDER.forEach((key) => {
              const list = groups[key] || [];
              if (!list.length) return;
              const sec = KG_SECTORS[key];
              const base = sectorAngleRad(key);
              const n = list.length;
              const spread = Math.min(0.9, 0.18 * Math.max(n, 1));
              list.forEach((entry, i) => {'''

NEW_LIST = '''            KG_SECTOR_ORDER.forEach((key) => {
              const full = groups[key] || [];
              if (!full.length) return;
              const limit = (kgShowMore && kgShowMore[key]) || full.length;
              const list = full.slice(0, Math.min(limit, full.length));
              const sec = KG_SECTORS[key];
              const base = sectorAngleRad(key);
              const n = list.length;
              const spread = Math.min(0.9, 0.18 * Math.max(n, 1));
              list.forEach((entry, i) => {'''

if "const full = groups[key]" not in text:
    if OLD_LIST not in text:
        print("WARN: sector list block missing")
    else:
        text = text.replace(OLD_LIST, NEW_LIST, 1)
        print("showMore slice ok")

# Limit L3 children when expand
OLD_L3 = '''                  const l3s = filterKgChildren(c.children || []);
                  l3s.forEach((c3, j) => {
                    const p3 = pushFan(c3, placed.x, placed.y, 3, 108, j, l3s.length, placed.ang, sec.color, key, sec.glow);'''

NEW_L3 = '''                  const l3All = filterKgChildren(c.children || []);
                  const l3s = l3All.slice(0, kgShowMoreL3 || l3All.length);
                  l3s.forEach((c3, j) => {
                    const p3 = pushFan(c3, placed.x, placed.y, 3, 108, j, l3s.length, placed.ang, sec.color, key, sec.glow);'''

if "l3All.slice" not in text:
    text = text.replace(OLD_L3, NEW_L3, 1)
    print("L3 showMore ok")

# Enhance updateKgFocusChrome with search wire + more buttons + rails
# Insert functions before updateKgFocusChrome and patch updateKgFocusChrome end

WIRE_FN = r'''
        function updateKgMoreButtons() {
          const box = document.getElementById("kgMoreBtns");
          if (!box || !kgDrill.active) return;
          const tree = currentKgTree();
          if (!tree) { box.innerHTML = ""; return; }
          const l2s = filterKgChildren(tree.children || []);
          const keys = assignSectorKeySmart(l2s);
          const counts = { foundation: 0, advanced: 0, practice: 0 };
          l2s.forEach((c, i) => { counts[keys[i] || "advanced"] = (counts[keys[i] || "advanced"] || 0) + 1; });
          box.innerHTML = "";
          KG_SECTOR_ORDER.forEach(key => {
            const total = counts[key] || 0;
            const shown = kgShowMore[key] || 0;
            if (total <= shown) return;
            const sec = KG_SECTORS[key];
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = `显示更多${sec.label}（${Math.min(shown, total)}/${total}）`;
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              kgShowMore[key] = Math.min(total, (kgShowMore[key] || 0) + 3);
              redrawKgDrill();
              updateKgMoreButtons();
            });
            box.appendChild(btn);
          });
          const maxL3 = Math.max(0, ...l2s.map(c => filterKgChildren(c.children || []).length));
          if (maxL3 > kgShowMoreL3) {
            const btn3 = document.createElement("button");
            btn3.type = "button";
            btn3.textContent = `二级主题显示更多（${kgShowMoreL3}/${maxL3}）`;
            btn3.addEventListener("click", (e) => {
              e.stopPropagation();
              kgShowMoreL3 = Math.min(maxL3, kgShowMoreL3 + 4);
              redrawKgDrill();
              updateKgMoreButtons();
            });
            box.appendChild(btn3);
          }
        }

        function collectSearchNodes(root, trail, out) {
          if (!root) return;
          const path = trail.concat(root.title);
          out.push({ id: root.id, title: root.title, path: path.join(" / "), node: root });
          (root.children || []).forEach(c => collectSearchNodes(c, path, out));
        }

        function wireKgFocusSearch() {
          const input = document.getElementById("kgFocusSearch");
          const drop = document.getElementById("kgFocusSearchDrop");
          if (!input || !drop || input._bound) return;
          input._bound = true;
          const renderDrop = (q) => {
            const tree = currentKgTree();
            if (!tree || !q) { drop.classList.remove("open"); drop.innerHTML = ""; return; }
            const all = [];
            collectSearchNodes(tree, [], all);
            const qq = q.trim().toLowerCase();
            const hits = all.filter(x => x.title.toLowerCase().includes(qq) || x.path.toLowerCase().includes(qq)).slice(0, 12);
            if (!hits.length) {
              drop.innerHTML = '<button type="button" disabled>无匹配</button>';
              drop.classList.add("open");
              return;
            }
            drop.innerHTML = hits.map(h =>
              `<button type="button" data-sid="${escapeHtml(h.id)}"><div>${escapeHtml(h.title)}</div><div class="meta">${escapeHtml(h.path)}</div></button>`
            ).join("");
            drop.classList.add("open");
            drop.querySelectorAll("[data-sid]").forEach(btn => {
              btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const id = btn.getAttribute("data-sid");
                const n = findKgNode(id);
                if (!n) return;
                drop.classList.remove("open");
                input.value = n.title;
                // 展开到该节点：找父链
                pushKgFocusHistory();
                const pathIds = [];
                (function dfs(node, trail) {
                  const t = trail.concat(node);
                  if (node.id === id) { pathIds.push(...t.map(x => x.id)); return true; }
                  for (const c of (node.children || [])) if (dfs(c, t)) return true;
                  return false;
                })(currentKgTree(), []);
                // pathIds[0]=root, [1]=L2 domain, [2]=L3, [3]=leaf
                if (pathIds.length >= 2) kgDrill.expandedL2 = pathIds[1];
                if (pathIds.length >= 3) kgDrill.expandedL3 = pathIds[2];
                kgDrill.selectedLeafId = id;
                kgDrill.expandAllL2 = true;
                redrawKgDrill();
                openKgSidePanel(n, isLessonParent(n) ? "chapter" : (kgNodeKids(n).length ? "chapter" : "lesson"));
                updateKgDrillHint();
              });
            });
          };
          input.addEventListener("input", () => renderDrop(input.value));
          input.addEventListener("focus", () => { if (input.value) renderDrop(input.value); });
          document.addEventListener("click", () => drop.classList.remove("open"));
        }

        function wireKgRailsAndZoom() {
          const sideBtn = document.getElementById("kgToggleSide");
          const panelBtn = document.getElementById("kgTogglePanel");
          const zin = document.getElementById("kgZoomIn");
          const zout = document.getElementById("kgZoomOut");
          const fit = document.getElementById("kgFit");
          if (sideBtn && !sideBtn._bound) {
            sideBtn._bound = true;
            sideBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              kgSideCollapsed = !kgSideCollapsed;
              document.body.classList.toggle("is-side-collapsed", kgSideCollapsed);
              sideBtn.textContent = kgSideCollapsed ? "»" : "«";
              sideBtn.title = kgSideCollapsed ? "展开左侧栏" : "收起左侧栏";
              setTimeout(() => { if (typeof relayout === "function") relayout(); redrawKgDrill(); }, 280);
            });
          }
          if (panelBtn && !panelBtn._bound) {
            panelBtn._bound = true;
            panelBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              kgPanelCollapsed = !kgPanelCollapsed;
              document.body.classList.toggle("is-panel-collapsed", kgPanelCollapsed);
              panelBtn.textContent = kgPanelCollapsed ? "«" : "»";
              panelBtn.title = kgPanelCollapsed ? "展开右侧详情" : "收起右侧详情";
              setTimeout(() => { if (typeof relayout === "function") relayout(); redrawKgDrill(); }, 280);
            });
          }
          if (zin && !zin._bound) {
            zin._bound = true;
            zin.addEventListener("click", (e) => {
              e.stopPropagation();
              svg.transition().duration(200).call(zoom.scaleBy, 1.2);
            });
            zout.addEventListener("click", (e) => {
              e.stopPropagation();
              svg.transition().duration(200).call(zoom.scaleBy, 1 / 1.2);
            });
            fit.addEventListener("click", (e) => {
              e.stopPropagation();
              if (typeof relayout === "function") relayout();
            });
          }
        }

'''

if "function updateKgMoreButtons()" not in text:
    text = text.replace("        function updateKgFocusChrome() {", WIRE_FN + "\n        function updateKgFocusChrome() {", 1)
    print("wire helpers ok")

# Call wire + more at end of updateKgFocusChrome — before closing brace of function
# Find distinctive end of updateKgFocusChrome
OLD_CHROME_END = '''          if (backBtn) {
            backBtn.textContent = kgFocusHistory.length ? "← 回退一步" : "← 返回总览";
            if (!backBtn._bound) {
              backBtn._bound = true;
              backBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                popKgFocusHistory();
              });
            }
          }
        }'''

NEW_CHROME_END = '''          if (backBtn) {
            backBtn.textContent = kgFocusHistory.length ? "← 回退一步" : "← 返回总览";
            if (!backBtn._bound) {
              backBtn._bound = true;
              backBtn.addEventListener("click", (event) => {
                event.stopPropagation();
                popKgFocusHistory();
              });
            }
          }
          wireKgFocusSearch();
          wireKgRailsAndZoom();
          updateKgMoreButtons();
          document.body.classList.toggle("is-side-collapsed", !!kgSideCollapsed);
          document.body.classList.toggle("is-panel-collapsed", !!kgPanelCollapsed);
        }'''

if "wireKgFocusSearch();" not in text:
    if OLD_CHROME_END not in text:
        print("WARN chrome end missing")
    else:
        text = text.replace(OLD_CHROME_END, NEW_CHROME_END, 1)
        print("chrome end wired")

# Reset showMore on enterKgDrill
text = text.replace(
    """          kgFocusHistory = [];
          document.body.classList.remove("home-hero");""",
    """          kgFocusHistory = [];
          kgShowMore = { foundation: 4, advanced: 4, practice: 4 };
          kgShowMoreL3 = 6;
          kgSideCollapsed = false;
          kgPanelCollapsed = false;
          document.body.classList.remove("is-side-collapsed", "is-panel-collapsed");
          document.body.classList.remove("home-hero");""",
    1,
)

# stop live sim on exit
text = text.replace(
    """        function exitKgDrill() {
          stopKgPulse();
          if (typeof stopKgSettle === "function") stopKgSettle();
          kgFocusHistory = [];""",
    """        function exitKgDrill() {
          stopKgPulse();
          if (typeof stopKgLiveSim === "function") stopKgLiveSim();
          else if (typeof stopKgSettle === "function") stopKgSettle();
          kgFocusHistory = [];""",
    1,
)

# clearSatellites also stop live
text = text.replace(
    """      if (typeof stopKgSettle === "function") stopKgSettle();""",
    """      if (typeof stopKgLiveSim === "function") stopKgLiveSim();
      else if (typeof stopKgSettle === "function") stopKgSettle();""",
    1,
)

HTML.write_text(text, encoding="utf-8")

# syntax check
import re as _re
html = HTML.read_text(encoding="utf-8")
a = html.find("<script>", html.find("DATA NEXUS"))
b = html.rfind("</script>")
Path(r"D:\cursor\数据学习平台\数据学习平台\_gen\check_upgrade.js").write_text(html[a+8:b], encoding="utf-8")
print("wrote", HTML.stat().st_size)
