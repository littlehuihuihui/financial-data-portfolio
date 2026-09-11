# -*- coding: utf-8 -*-
"""Second pass: kill roughness — position memory, soft live physics, hover focus, smooth chrome."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- CSS: append after 95% block marker ----------
CSS_EXTRA = r'''
    /* ===== 96%：去粗糙 —— 焦点/过渡/弹簧活感 ===== */
    body.kg-focus-on .kg-focus-side {
      transition: width 0.28s ease, flex-basis 0.28s ease, opacity 0.22s ease,
        padding 0.28s ease, border-color 0.22s ease;
    }
    body.kg-focus-on #panel.side-mode {
      transition: width 0.28s ease, flex-basis 0.28s ease, opacity 0.22s ease,
        border-color 0.22s ease, max-width 0.28s ease;
    }
    body.kg-focus-on.is-side-collapsed .kg-rail-left { left: 10px; }
    body.kg-focus-on:not(.is-side-collapsed) .kg-rail-left { left: 10px; }
    .kg-rail-btn:hover {
      border-color: #22d3ee; color: #a5f3fc;
      background: rgba(34, 211, 238, 0.12);
    }
    .kg-ctrl button {
      backdrop-filter: blur(8px);
      transition: border-color 0.2s, color 0.2s, background 0.2s, transform 0.15s;
    }
    .kg-ctrl button:hover { transform: translateY(-1px); }
    .kg-search-mini input {
      transition: box-shadow 0.25s, border-color 0.25s;
    }
    .kg-search-mini input:focus {
      box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.18);
    }
    .kg-search-drop button mark {
      background: rgba(168, 85, 247, 0.35); color: #f5f3ff; border-radius: 2px; padding: 0 2px;
    }
    .sat-node.is-dimmed { opacity: 0.28; }
    .sat-node.is-hot circle {
      stroke: #fff !important; stroke-width: 3 !important;
    }
    .sat-link.is-dimmed { stroke-opacity: 0.12 !important; }
    .sat-link.is-hot {
      stroke-opacity: 0.85 !important; stroke-width: 2.8px !important;
    }
    .sat-node text.sat-label {
      font-size: 11px; letter-spacing: 0.01em;
    }
    .sat-node text.sat-sub {
      font-family: "Noto Sans SC", var(--font); font-size: 8px; fill: #94a3b8;
    }
    .sat-node.layer-2 circle { stroke-width: 2.4; }
    body.kg-focus-on #panel.side-mode.open {
      box-shadow: inset 3px 0 0 rgba(168, 85, 247, 0.55);
    }
    body.kg-focus-on #panel.side-mode.open.sec-foundation {
      box-shadow: inset 3px 0 0 #f97316;
    }
    body.kg-focus-on #panel.side-mode.open.sec-advanced {
      box-shadow: inset 3px 0 0 #10b981;
    }
    body.kg-focus-on #panel.side-mode.open.sec-practice {
      box-shadow: inset 3px 0 0 #3b82f6;
    }
    #panel.side-mode .panel-inner.kg-swap {
      animation: kgPanelSwap 0.32s cubic-bezier(0.22, 1, 0.36, 1);
    }
    @keyframes kgPanelSwap {
      from { opacity: 0; transform: translateX(14px); }
      to { opacity: 1; transform: none; }
    }
    body.kg-focus-on .node.kg-focus-hub circle {
      transition: filter 0.05s linear;
    }
    .kg-canvas-hint {
      transition: opacity 0.4s ease;
      animation: kgHintIn 0.6s ease both;
    }
    @keyframes kgHintIn {
      from { opacity: 0; transform: translateX(-50%) translateY(6px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    body.kg-focus-on #graph .kg-particles span {
      background: rgba(196, 181, 253, 0.45);
    }

'''

marker = "    /* ===== 95% 手感打磨：对齐行业百科 ===== */"
if "96%：去粗糙" not in text:
    # insert before closing of style after 95 block — find last polish rule then </style>
    anchor = "    .kg-focus-side-head h3 {\n      background: linear-gradient(90deg, #e2e8f0, #a855f7);\n      -webkit-background-clip: text; background-clip: text;\n      color: transparent;\n    }\n\n    </style>"
    if anchor not in text:
        raise SystemExit("CSS anchor missing")
    text = text.replace(anchor, "    .kg-focus-side-head h3 {\n      background: linear-gradient(90deg, #e2e8f0, #a855f7);\n      -webkit-background-clip: text; background-clip: text;\n      color: transparent;\n    }\n" + CSS_EXTRA + "\n    </style>", 1)
    print("CSS 96 ok")
else:
    print("CSS 96 already")

# ---------- Replace settleSatPositions with spring + soft live physics ----------
OLD_SETTLE = '''        /** 动画 settle + 可继续轻物理（百科 BarnesHut 手感） */
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
        }'''

NEW_SETTLE = '''        /** 弹簧 + 软持续物理（对齐百科 BarnesHut 稳定后不关死） */
        function settleSatPositions(items, hub, animate) {
          if (!items.length || typeof d3 === "undefined" || !d3.forceSimulation) return items;
          stopKgLiveSim();
          const byId = new Map(items.map(d => [d.learnId, d]));
          items.forEach(d => {
            if (d.tx == null) d.tx = d.x;
            if (d.ty == null) d.ty = d.y;
            d._r = baseSatRadius(d);
            // 同步父子端点：用当前父节点坐标（拖动后仍跟手）
            if (d.parentId && byId.has(d.parentId)) {
              const p = byId.get(d.parentId);
              d.parentX = p.x; d.parentY = p.y;
            } else {
              d.parentX = hub.x; d.parentY = hub.y;
            }
          });
          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => ({
              source: byId.get(d.parentId),
              target: d,
              dist: Math.max(70, (d.r || 100) * 0.55)
            }));
          // hub 虚拟锚：layer2 拉向目标扇区位
          const minDist = 86;
          kgLiveSim = d3.forceSimulation(items)
            .force("collide", d3.forceCollide().radius(d => (d._r || 20) + 8).strength(0.85).iterations(2))
            .force("x", d3.forceX(d => d.tx).strength(0.14))
            .force("y", d3.forceY(d => d.ty).strength(0.14))
            .force("charge", d3.forceManyBody().strength(d => d.layer === 2 ? -42 : -22))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.45).iterations(1))
            .velocityDecay(0.42)
            .alpha(0.85)
            .alphaDecay(0.028)
            .alphaMin(0.001);

          let ticks = 0;
          kgLiveSim.on("tick", () => {
            ticks += 1;
            items.forEach(d => {
              if (d.parentId && byId.has(d.parentId)) {
                const p = byId.get(d.parentId);
                d.parentX = p.x; d.parentY = p.y;
              } else {
                d.parentX = hub.x; d.parentY = hub.y;
              }
              const dx = d.x - hub.x, dy = d.y - hub.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < minDist) {
                d.x = hub.x + (dx / dist) * minDist;
                d.y = hub.y + (dy / dist) * minDist;
              }
            });
            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal));
            }
            if (ticks === 50) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-10));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.035));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.035));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.18));
              kgLiveSim.alphaDecay(0.012);
              // 不 stop：保留极低活感（百科稳定后仍开物理）
              kgLiveSim.alphaTarget(0.018);
            }
          });
          if (!animate) {
            for (let i = 0; i < 48; i++) kgLiveSim.tick();
            kgLiveSim.alphaTarget(0.018);
          }
          return items;
        }'''

if OLD_SETTLE not in text:
    raise SystemExit("settleSatPositions block missing")
text = text.replace(OLD_SETTLE, NEW_SETTLE, 1)
print("settle springs ok")

# ---------- Replace paintSatLayer with hover dim + smarter drag ----------
OLD_PAINT_START = "        function paintSatLayer(items) {"
OLD_PAINT_END = "        function redrawKgDrill() {"
i0 = text.find(OLD_PAINT_START)
i1 = text.find(OLD_PAINT_END)
if i0 < 0 or i1 < 0:
    raise SystemExit("paintSatLayer bounds missing")

NEW_PAINT = r'''        function paintSatLayer(items) {
          satData = items;
          const byId = new Map(items.map(d => [d.learnId, d]));

          function refreshHoverClasses() {
            if (!satNodeSel) return;
            const hot = kgHoverId;
            const hotNode = hot ? byId.get(hot) : null;
            const related = new Set();
            if (hotNode) {
              related.add(hot);
              if (hotNode.parentId) related.add(hotNode.parentId);
              items.forEach(d => { if (d.parentId === hot) related.add(d.learnId); });
            }
            satNodeSel
              .classed("is-hot", d => !!hot && d.learnId === hot)
              .classed("is-dimmed", d => !!hot && !related.has(d.learnId));
            if (satLinkSel) {
              satLinkSel
                .classed("is-hot", d => !!hot && (d.learnId === hot || d.parentId === hot || (hotNode && d.learnId === hotNode.parentId)))
                .classed("is-dimmed", d => {
                  if (!hot) return false;
                  return !(d.learnId === hot || d.parentId === hot || (hotNode && (d.learnId === hotNode.parentId || d.parentId === hotNode.parentId)));
                });
            }
          }

          satLinkSel = satLinkG.selectAll("path").data(satData, d => d.learnId)
            .join(
              enter => enter.append("path")
                .attr("class", d => `sat-link layer-${d.layer}${d.layer >= 3 ? " dashed" : ""}`)
                .attr("stroke", d => d.color)
                .attr("opacity", 0)
                .call(s => s.transition().duration(520).ease(d3.easeCubicOut).attr("opacity", 1)),
              update => update
                .attr("class", d => `sat-link layer-${d.layer}${d.layer >= 3 ? " dashed" : ""}`)
                .attr("stroke", d => d.color),
              exit => exit.transition().duration(160).attr("opacity", 0).remove()
            )
            .attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal));

          satNodeSel = satNodeG.selectAll("g").data(satData, d => d.learnId)
            .join(
              enter => {
                const g = enter.append("g").attr("class", "sat-node entering").attr("opacity", 0);
                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);
                g.transition().duration(420).ease(d3.easeCubicOut).attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(520).ease(d3.easeBackOut.overshoot(1.35))
                  .attr("r", d => baseSatRadius(d));
                return g;
              },
              update => update,
              exit => exit.transition().duration(140).attr("opacity", 0).remove()
            )
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("class", d => {
              let cls = `sat-node layer-${d.layer}`;
              if (d.isLeaf) cls += " is-leaf";
              if (d.isChapter) cls += " is-chapter";
              if (d.isBranch) cls += " is-branch";
              if (d.sectorKey) cls += " sec-" + d.sectorKey;
              return cls;
            })
            .classed("selected", d => d.kgId === kgDrill.selectedLeafId)
            .classed("learned", d => isLearned(d.learnId));

          satNodeSel.select("circle")
            .attr("fill", d => d.color)
            .style("filter", d => d.sectorGlow
              ? `drop-shadow(0 0 14px ${d.sectorGlow})`
              : null);
          satNodeSel.filter(function () { return !d3.select(this).classed("entering"); })
            .select("circle")
            .attr("r", d => {
              if (kgHoverId && d.learnId === kgHoverId) return baseSatRadius(d) * 1.22;
              if (d.kgId === kgDrill.selectedLeafId) return baseSatRadius(d) * 1.08;
              return baseSatRadius(d);
            });

          satNodeSel.select("text.sat-label")
            .text(d => d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name);
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
          });

          satNodeSel.call(d3.drag()
            .on("start", (event, d) => {
              event.sourceEvent.stopPropagation();
              if (kgLiveSim) kgLiveSim.alphaTarget(0.35).restart();
              d.fx = d.x; d.fy = d.y;
              d._dragKids = items.filter(n => n.parentId === d.learnId);
              d._dragKids.forEach(k => {
                k._ox = k.x - d.x; k._oy = k.y - d.y;
                k.fx = k.x; k.fy = k.y;
              });
            })
            .on("drag", (event, d) => {
              const dx = event.x - d.x, dy = event.y - d.y;
              d.fx = d.x = event.x;
              d.fy = d.y = event.y;
              d.tx = d.x; d.ty = d.y;
              (d._dragKids || []).forEach(k => {
                k.fx = k.x = d.x + (k._ox || 0);
                k.fy = k.y = d.y + (k._oy || 0);
                k.tx = k.x; k.ty = k.y;
                k.parentX = d.x; k.parentY = d.y;
              });
              items.forEach(n => {
                if (n.parentId && byId.has(n.parentId)) {
                  const p = byId.get(n.parentId);
                  n.parentX = p.x; n.parentY = p.y;
                }
              });
              if (satNodeSel) satNodeSel.attr("transform", n => `translate(${n.x},${n.y})`);
              if (satLinkSel) {
                satLinkSel.attr("d", n => satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal));
              }
            })
            .on("end", (event, d) => {
              d.fx = null; d.fy = null;
              (d._dragKids || []).forEach(k => { k.fx = null; k.fy = null; });
              d._dragKids = null;
              if (kgLiveSim) kgLiveSim.alphaTarget(0.018);
            }));

          refreshHoverClasses();
        }

'''

text = text[:i0] + NEW_PAINT + text[i1:]
print("paint hover/drag ok")

# ---------- Position memory in redrawKgDrill ----------
OLD_REDRAW_INIT = '''        function redrawKgDrill() {
          if (!kgDrill.active) return;
          const tree = currentKgTree();
          const hub = nodeById[kgDrill.hubId];
          if (!hub || !tree) return;
          const items = [];

          function pushFan(c, px, py, layer, baseR, idx, total, parentAng, color, sectorKey, sectorGlow) {'''

NEW_REDRAW_INIT = '''        function redrawKgDrill() {
          if (!kgDrill.active) return;
          const tree = currentKgTree();
          const hub = nodeById[kgDrill.hubId];
          if (!hub || !tree) return;
          const items = [];
          const prevPos = new Map((satData || []).map(d => [d.learnId, { x: d.x, y: d.y, tx: d.tx, ty: d.ty }]));

          function applyPrev(item) {
            const p = prevPos.get(item.learnId);
            if (p) {
              item.x = p.x; item.y = p.y;
              item.tx = p.tx != null ? p.tx : p.x;
              item.ty = p.ty != null ? p.ty : p.y;
              item._kept = true;
            } else {
              item.tx = item.x; item.ty = item.y;
            }
            return item;
          }

          function pushFan(c, px, py, layer, baseR, idx, total, parentAng, color, sectorKey, sectorGlow, parentLearnId) {'''

if OLD_REDRAW_INIT not in text:
    raise SystemExit("redraw init missing")
text = text.replace(OLD_REDRAW_INIT, NEW_REDRAW_INIT, 1)
print("pos memory header ok")

# Fix items.push in pushFan to include parentId + applyPrev
OLD_PUSH_ITEM = '''            items.push({
              learnId: "kg:" + kgDrill.hubId + ":" + c.id,
              kgId: c.id,
              name: c.title,
              x, y,
              parentX: px,
              parentY: py,
              layer,
              ang,
              r,
              sibIdx: idx,
              sibTotal: total,
              isLeaf: leaf,
              isChapter: chapter && !leaf,
              isBranch: canExpand && expanded,
              color: fill,
              sectorKey: sectorKey || null,
              sectorGlow: sectorGlow || (sec ? sec.glow : null)
            });
            return { x, y, ang, r, hasKids: canExpand, expanded, leaf, chapter };
          }'''

NEW_PUSH_ITEM = '''            applyPrev({
              learnId: "kg:" + kgDrill.hubId + ":" + c.id,
              kgId: c.id,
              name: c.title,
              x, y,
              parentX: px,
              parentY: py,
              parentId: parentLearnId || null,
              layer,
              ang,
              r,
              sibIdx: idx,
              sibTotal: total,
              isLeaf: leaf,
              isChapter: chapter && !leaf,
              isBranch: canExpand && expanded,
              color: fill,
              sectorKey: sectorKey || null,
              sectorGlow: sectorGlow || (sec ? sec.glow : null)
            });
            items.push(arguments[0] && false);
            const _item = items[items.length - 1];
            return { x: (items[items.length - 1] || {}).x || x, y: (items[items.length - 1] || {}).y || y, ang, r, hasKids: canExpand, expanded, leaf, chapter, learnId: "kg:" + kgDrill.hubId + ":" + c.id };
          }'''

# The above is messy - do a cleaner replacement
NEW_PUSH_ITEM = '''            const item = applyPrev({
              learnId: "kg:" + kgDrill.hubId + ":" + c.id,
              kgId: c.id,
              name: c.title,
              x, y,
              parentX: px,
              parentY: py,
              parentId: parentLearnId || null,
              layer,
              ang,
              r,
              sibIdx: idx,
              sibTotal: total,
              isLeaf: leaf,
              isChapter: chapter && !leaf,
              isBranch: canExpand && expanded,
              color: fill,
              sectorKey: sectorKey || null,
              sectorGlow: sectorGlow || (sec ? sec.glow : null)
            });
            items.push(item);
            return { x: item.x, y: item.y, ang, r, hasKids: canExpand, expanded, leaf, chapter, learnId: item.learnId };
          }'''

if OLD_PUSH_ITEM not in text:
    raise SystemExit("pushFan item block missing")
text = text.replace(OLD_PUSH_ITEM, NEW_PUSH_ITEM, 1)
print("pushFan parentId ok")

# L2 items.push block — add parentId hub null, applyPrev
OLD_L2_PUSH = '''                items.push({
                  learnId: "kg:" + kgDrill.hubId + ":" + c.id,
                  kgId: c.id,
                  name: c.title,
                  x: placed.x,
                  y: placed.y,
                  parentX: hub.x,
                  parentY: hub.y,
                  layer: 2,
                  ang: placed.ang,
                  r: placed.r,
                  sibIdx: i,'''

# Read a bit more context from file after first replace - we'll search exact
import re
m = re.search(
    r"items\.push\(\{\s*learnId: \"kg:\" \+ kgDrill\.hubId \+ \":\" \+ c\.id,\s*kgId: c\.id,\s*name: c\.title,\s*x: placed\.x,",
    text,
)
if not m:
    raise SystemExit("L2 push not found")

# Find the full L2 push object ending with sectorGlow: sec.glow\n                });
start = m.start()
end = text.find("sectorGlow: sec.glow\n                });", start)
if end < 0:
    raise SystemExit("L2 push end not found")
end = text.find("});", end) + 3
old_l2 = text[start:end]
new_l2 = '''items.push(applyPrev({
                  learnId: "kg:" + kgDrill.hubId + ":" + c.id,
                  kgId: c.id,
                  name: c.title,
                  x: placed.x,
                  y: placed.y,
                  parentX: hub.x,
                  parentY: hub.y,
                  parentId: null,
                  layer: 2,
                  ang: placed.ang,
                  r: placed.r,
                  sibIdx: i,
                  sibTotal: n,
                  isLeaf: leaf,
                  isChapter: chapter && !leaf,
                  isBranch: canExpand && expanded,
                  color: leaf ? "#34d399" : (expanded ? "#f59e0b" : sec.color),
                  sectorKey: key,
                  sectorGlow: sec.glow
                }))'''
# Wait - need to keep same fields; read old_l2
print("L2 old snippet len", len(old_l2))
# Safer: wrap with applyPrev by regex replace of items.push({ -> items.push(applyPrev({ and add parentId after parentY for the L2 one only

# Re-read the L2 block from current text
old_l2 = text[start:end]
# If already applyPrev skip
if "applyPrev" in old_l2:
    print("L2 already applyPrev")
else:
    new_l2 = old_l2.replace("items.push({", "items.push(applyPrev({", 1)
    new_l2 = new_l2.replace("parentY: hub.y,", "parentY: hub.y,\n                  parentId: null,", 1)
    # closing }); -> }));
    if new_l2.rstrip().endswith("});"):
        new_l2 = new_l2.rstrip()[:-2] + "));"
    text = text[:start] + new_l2 + text[end:]
    print("L2 applyPrev ok")

# Fix pushFan call sites to pass parent learnId
# pushFan(c3, p.x, p.y, 3, ...) should pass p.learnId
# pushFan(c4, p3.x, ...) pass p3.learnId

text2 = text
# Pattern for L3 pushFan from L2
old_l3 = "pushFan(c3, p.x, p.y, 3, 118, j, l3s.length, p.ang, sec.color, key, sec.glow)"
new_l3 = "pushFan(c3, p.x, p.y, 3, 118, j, l3s.length, p.ang, sec.color, key, sec.glow, p.learnId)"
if old_l3 in text2:
    text2 = text2.replace(old_l3, new_l3)
    print("L3 parentId arg ok")
else:
    # try alternate
    alt = re.search(r"pushFan\(c3,\s*p\.x,\s*p\.y,\s*3,[^)]+\)", text2)
    if alt:
        s = alt.group(0)
        if "p.learnId" not in s:
            text2 = text2.replace(s, s[:-1] + ", p.learnId)")
            print("L3 parentId alt ok", s[:60])
        else:
            print("L3 already")
    else:
        print("WARN L3 pushFan not found")

old_l4 = "pushFan(c4, p3.x, p3.y, 4, 82, k, l4s.length, p3.ang, sec.color, key, sec.glow)"
if old_l4 in text2:
    text2 = text2.replace(old_l4, old_l4[:-1] + ", p3.learnId)")
    print("L4 parentId arg ok")
else:
    alt4 = re.search(r"pushFan\(c4,\s*p3\.x,\s*p3\.y,\s*4,[^)]+\)", text2)
    if alt4:
        s = alt4.group(0)
        if "p3.learnId" not in s:
            text2 = text2.replace(s, s[:-1] + ", p3.learnId)")
            print("L4 parentId alt ok")
        else:
            print("L4 already")
    else:
        print("WARN L4 pushFan not found")

# When placing L3, need p.learnId on the L2 placed object - currently:
# const p = { x: ..., learnId missing }
# Find where L2 returns into p for children
# Looking at code after L2 push:
text = text2

# Fix L2 loop to expose learnId on `p`
OLD_P_PLACE = None
# Search for expand L3 after L2 items
snippet = '''                if (kgDrill.expandAllL2 || kgDrill.expandedL2 === c.id) {
                  const l3All = filterKgChildren(c.children || []);
                  const l3s = l3All.slice(0, kgShowMoreL3 || l3All.length);
                  l3s.forEach((c3, j) => {
                    const p = { x: placed.x, y: placed.y, ang: placed.ang };'''

if snippet in text:
    text = text.replace(
        snippet,
        '''                const l2LearnId = "kg:" + kgDrill.hubId + ":" + c.id;
                if (kgDrill.expandAllL2 || kgDrill.expandedL2 === c.id) {
                  const l3All = filterKgChildren(c.children || []);
                  const l3s = l3All.slice(0, kgShowMoreL3 || l3All.length);
                  l3s.forEach((c3, j) => {
                    const p = { x: placed.x, y: placed.y, ang: placed.ang, learnId: l2LearnId };''',
        1,
    )
    print("L2 learnId on p ok")
else:
    # softer search
    if "const p = { x: placed.x, y: placed.y, ang: placed.ang };" in text:
        text = text.replace(
            "const p = { x: placed.x, y: placed.y, ang: placed.ang };",
            'const p = { x: placed.x, y: placed.y, ang: placed.ang, learnId: "kg:" + kgDrill.hubId + ":" + c.id };',
            1,
        )
        print("L2 learnId soft ok")
    else:
        print("WARN L2 p place not found")

# pushFan return used as p3 — already has learnId from NEW_PUSH_ITEM return

# ---------- Panel swap animation + sector accent ----------
OLD_OPEN = '''          selectedId = kgDrill.hubId;
          panel.classList.add("open");
          panel.setAttribute("aria-hidden", "false");
          syncLearnedUI();
          updateKgDrillHint();
        }'''

NEW_OPEN = '''          selectedId = kgDrill.hubId;
          panel.classList.remove("sec-foundation", "sec-advanced", "sec-practice");
          const satHit = (satData || []).find(s => s.kgId === kgNode.id);
          if (satHit && satHit.sectorKey) panel.classList.add("sec-" + satHit.sectorKey);
          panel.classList.add("open");
          panel.setAttribute("aria-hidden", "false");
          if (panelCard) {
            panelCard.classList.remove("kg-swap");
            void panelCard.offsetWidth;
            panelCard.classList.add("kg-swap");
          }
          syncLearnedUI();
          updateKgDrillHint();
        }'''

if OLD_OPEN not in text:
    raise SystemExit("open panel end missing")
text = text.replace(OLD_OPEN, NEW_OPEN, 1)
print("panel swap ok")

# ---------- Soft pulse like encyclopedia ----------
OLD_PULSE = '''        function startKgPulse() {
          stopKgPulse();
          if (!kgDrill.active || !kgDrill.hubId) return;
          let t = 0;
          kgPulseTimer = setInterval(() => {
            if (!kgDrill.active || typeof node === "undefined" || !node) return;
            t += 1;
            const r = 58 + Math.sin(t / 8) * 3.2;
            const blur = 22 + Math.sin(t / 8) * 8;
            node.filter(d => d.id === kgDrill.hubId).select("circle")
              .attr("r", r)
              .style("filter", `drop-shadow(0 0 ${blur}px rgba(168, 85, 247, 0.85))`);
          }, 50);
        }'''

NEW_PULSE = '''        function startKgPulse() {
          stopKgPulse();
          if (!kgDrill.active || !kgDrill.hubId) return;
          let breathe = 0;
          kgPulseTimer = setInterval(() => {
            if (!kgDrill.active || typeof node === "undefined" || !node) return;
            breathe = (breathe + 1) % 48;
            const t = Math.sin((breathe / 48) * Math.PI * 2);
            const r = 62 + t * 5;
            const blur = 28 + t * 10;
            node.filter(d => d.id === kgDrill.hubId).select("circle")
              .attr("r", r)
              .style("filter", `drop-shadow(0 0 ${blur}px rgba(168, 85, 247, 0.65))`);
          }, 55);
        }'''

if OLD_PULSE not in text:
    raise SystemExit("pulse missing")
text = text.replace(OLD_PULSE, NEW_PULSE, 1)
print("pulse ok")

# ---------- Fit zooms to sat bbox ----------
OLD_FIT = '''            fit.addEventListener("click", (e) => {
              e.stopPropagation();
              if (typeof relayout === "function") relayout();
            });'''

NEW_FIT = '''            fit.addEventListener("click", (e) => {
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

if OLD_FIT not in text:
    raise SystemExit("fit handler missing")
text = text.replace(OLD_FIT, NEW_FIT, 1)
print("fit bbox ok")

# ---------- Search highlight ----------
OLD_HIT = '''            drop.innerHTML = hits.map(h =>
              `<button type="button" data-sid="${escapeHtml(h.id)}"><div>${escapeHtml(h.title)}</div><div class="meta">${escapeHtml(h.path)}</div></button>`
            ).join("");'''

NEW_HIT = '''            const hilite = (s) => {
              const i = s.toLowerCase().indexOf(qq);
              if (i < 0) return escapeHtml(s);
              return escapeHtml(s.slice(0, i)) + "<mark>" + escapeHtml(s.slice(i, i + qq.length)) + "</mark>" + escapeHtml(s.slice(i + qq.length));
            };
            drop.innerHTML = hits.map(h =>
              `<button type="button" data-sid="${escapeHtml(h.id)}"><div>${hilite(h.title)}</div><div class="meta">${escapeHtml(h.path)}</div></button>`
            ).join("");'''

if OLD_HIT not in text:
    raise SystemExit("search hit html missing")
text = text.replace(OLD_HIT, NEW_HIT, 1)
print("search mark ok")

# More particles when focus
OLD_SPAWN = '''    (function spawnParticles() {
      const box = document.getElementById("kgParticles");'''
# Read spawn function
idx = text.find(OLD_SPAWN)
if idx > 0:
    chunk = text[idx:idx+500]
    if "for (let i = 0; i < 28;" in chunk or "for (let i = 0; i < 36;" in chunk:
        text = text.replace("for (let i = 0; i < 28; i++)", "for (let i = 0; i < 42; i++)", 1)
        text = text.replace("for (let i = 0; i < 36; i++)", "for (let i = 0; i < 42; i++)", 1)
        print("particles bump ok")
    else:
        print("particles count unknown", chunk[80:200])

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
