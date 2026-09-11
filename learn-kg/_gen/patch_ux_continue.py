# -*- coding: utf-8 -*-
"""Continue UX: rebound, link sparks, learned marks, mobile chrome."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- CSS ----------
CSS = r'''
    /* 继续优化：回弹/光点/已学/移动端 */
    .sat-spark {
      pointer-events: none;
      opacity: 0.85;
      filter: drop-shadow(0 0 4px rgba(255,255,255,0.55));
    }
    .sat-node text.sat-check {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      fill: #6ee7b7;
      text-anchor: middle;
      dominant-baseline: central;
      pointer-events: none;
      paint-order: stroke;
      stroke: rgba(5,8,20,0.85);
      stroke-width: 3px;
      filter: drop-shadow(0 0 6px rgba(52,211,153,0.65));
    }
    .sat-node.learned circle {
      stroke: #6ee7b7 !important;
      stroke-width: 2.4 !important;
    }
    .kg-focus-leg-item .leg-prog {
      margin-left: auto;
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: #94a3b8;
    }
    .kg-focus-leg-item .leg-prog.is-done { color: #6ee7b7; }
    .kg-focus-leg-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }
    @media (max-width: 900px) {
      body.kg-focus-on .kg-rail-btn {
        width: 36px;
        height: 64px;
      }
      body.kg-focus-on .kg-ctrl button {
        width: 44px !important;
        height: 44px !important;
      }
      body.kg-focus-on .toolbar button {
        padding: 8px 12px;
        min-height: 36px;
      }
      body.kg-focus-on .kg-hotkey-chip { display: none; }
      .sat-node circle { stroke-width: 2.2 !important; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sat-spark { display: none !important; }
    }

'''

if ".sat-spark" not in text:
    text = text.replace("    </style>\n</head>", CSS + "    </style>\n</head>", 1)
    print("css ok")
else:
    print("css already")

# ---------- satSparkG layer ----------
OLD_G = '''    const satLinkG = gRoot.append("g").attr("class", "sat-links");
    const satNodeG = gRoot.append("g").attr("class", "sat-nodes");'''
NEW_G = '''    const satLinkG = gRoot.append("g").attr("class", "sat-links");
    const satSparkG = gRoot.append("g").attr("class", "sat-sparks");
    const satNodeG = gRoot.append("g").attr("class", "sat-nodes");'''
if "satSparkG" not in text:
    if OLD_G not in text:
        raise SystemExit("sat groups missing")
    text = text.replace(OLD_G, NEW_G, 1)
    print("spark g ok")
else:
    print("spark g already")

OLD_VARS = '''    let satData = [];
    let satNodeSel = null;
    let satLinkSel = null;'''
NEW_VARS = '''    let satData = [];
    let satNodeSel = null;
    let satLinkSel = null;
    let satSparkSel = null;'''
if "satSparkSel" not in text:
    text = text.replace(OLD_VARS, NEW_VARS, 1)
    print("spark var ok")
else:
    print("spark var already")

# clearSparks in clearSatellites
OLD_CLEAR = '''      satLinkG.selectAll("*").remove();
      satNodeG.selectAll("*").remove();
      satNodeSel = null;
      satLinkSel = null;'''
NEW_CLEAR = '''      satLinkG.selectAll("*").remove();
      if (typeof satSparkG !== "undefined") satSparkG.selectAll("*").remove();
      satNodeG.selectAll("*").remove();
      satNodeSel = null;
      satLinkSel = null;
      satSparkSel = null;'''
if "satSparkG.selectAll" not in text:
    if OLD_CLEAR not in text:
        raise SystemExit("clear sats missing")
    text = text.replace(OLD_CLEAR, NEW_CLEAR, 1)
    print("clear sparks ok")
else:
    print("clear sparks already")

# ---------- applyPrev keep homeX/homeY ----------
OLD_PREV = '''          function applyPrev(item) {
            const p = prevPos.get(item.learnId);
            if (p) {
              item.x = p.x; item.y = p.y;
              item.tx = p.tx != null ? p.tx : p.x;
              item.ty = p.ty != null ? p.ty : p.y;
              item._kept = true;
            } else {
              // 新节点：从父点弹出再 settle 到扇区目标位
              item.tx = item.x; item.ty = item.y;
              if (item.parentX != null && item.parentY != null) {
                item.x = item.parentX;
                item.y = item.parentY;
              }
              item._kept = false;
            }
            return item;
          }'''
NEW_PREV = '''          function applyPrev(item) {
            const p = prevPos.get(item.learnId);
            if (p) {
              item.x = p.x; item.y = p.y;
              item.tx = p.tx != null ? p.tx : p.x;
              item.ty = p.ty != null ? p.ty : p.y;
              item.homeX = p.homeX != null ? p.homeX : item.tx;
              item.homeY = p.homeY != null ? p.homeY : item.ty;
              item._kept = true;
            } else {
              // 新节点：从父点弹出再 settle 到扇区目标位
              item.tx = item.x; item.ty = item.y;
              item.homeX = item.tx;
              item.homeY = item.ty;
              if (item.parentX != null && item.parentY != null) {
                item.x = item.parentX;
                item.y = item.parentY;
              }
              item._kept = false;
            }
            return item;
          }'''
if "item.homeX = p.homeX" not in text:
    if OLD_PREV not in text:
        raise SystemExit("applyPrev missing")
    text = text.replace(OLD_PREV, NEW_PREV, 1)
    print("home pos ok")
else:
    print("home pos already")

# prevPos map include home
text = text.replace(
    "const prevPos = new Map((satData || []).map(d => [d.learnId, { x: d.x, y: d.y, tx: d.tx, ty: d.ty }]));",
    "const prevPos = new Map((satData || []).map(d => [d.learnId, { x: d.x, y: d.y, tx: d.tx, ty: d.ty, homeX: d.homeX, homeY: d.homeY }]));",
    1,
)
print("prevPos home ok")

# ---------- settle tick: sparks ----------
OLD_TICK_BODY = '''            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));
            }
            if (ticks === 50) {'''
NEW_TICK_BODY = '''            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));
            }
            if (typeof updateSatSparks === "function") updateSatSparks();
            if (ticks === 50) {'''
if "updateSatSparks()" not in text.split("function settleSatPositions")[1][:2500]:
    if OLD_TICK_BODY not in text:
        raise SystemExit("settle tick missing")
    text = text.replace(OLD_TICK_BODY, NEW_TICK_BODY, 1)
    print("tick sparks ok")
else:
    print("tick sparks already")

# ---------- paintSparks + learned check + drag rebound ----------
# Insert updateSatSparks before paintSatLayer
SPARK_FN = r'''
        function updateSatSparks() {
          if (!satSparkSel || !satLinkSel) return;
          const pathById = {};
          satLinkSel.each(function (d) { pathById[d.learnId] = this; });
          satSparkSel.each(function (d) {
            const el = pathById[d.learnId];
            if (!el || typeof el.getTotalLength !== "function") return;
            let len = 0;
            try { len = el.getTotalLength(); } catch (e) { return; }
            if (!len) return;
            d._sparkT = ((d._sparkT == null ? Math.random() : d._sparkT) + 0.0075) % 1;
            const pt = el.getPointAtLength(d._sparkT * len);
            d3.select(this).attr("cx", pt.x).attr("cy", pt.y);
          });
        }

        function paintSatSparks(items) {
          if (typeof satSparkG === "undefined") return;
          const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const sparks = reduce ? [] : items.filter(d => d.layer === 2 || (d.layer === 3 && d.sibIdx < 2)).slice(0, 16);
          satSparkSel = satSparkG.selectAll("circle.sat-spark").data(sparks, d => "sp:" + d.learnId)
            .join(
              enter => enter.append("circle")
                .attr("class", "sat-spark")
                .attr("r", 0)
                .attr("fill", d => d.color || "#67e8f9")
                .call(s => s.transition().duration(400).attr("r", 2.3)),
              update => update.attr("fill", d => d.color || "#67e8f9"),
              exit => exit.transition().duration(120).attr("r", 0).remove()
            );
          updateSatSparks();
        }

'''

if "function updateSatSparks" not in text:
    marker = "        function paintSatLayer(items) {"
    if marker not in text:
        raise SystemExit("paintSatLayer missing")
    text = text.replace(marker, SPARK_FN + marker, 1)
    print("spark fns ok")
else:
    print("spark fns already")

# After sat links painted, call paintSatSparks - add after link join block ends with .attr("d"...
OLD_AFTER_LINKS = '''            .attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));

          satNodeSel = satNodeG.selectAll("g").data(satData, d => d.learnId)'''
NEW_AFTER_LINKS = '''            .attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));

          paintSatSparks(items);

          satNodeSel = satNodeG.selectAll("g").data(satData, d => d.learnId)'''
if "paintSatSparks(items)" not in text:
    if OLD_AFTER_LINKS not in text:
        raise SystemExit("after links missing")
    text = text.replace(OLD_AFTER_LINKS, NEW_AFTER_LINKS, 1)
    print("paint sparks call ok")
else:
    print("paint sparks call already")

# Add sat-check on enter
OLD_ENTER_NODE = '''                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);'''
NEW_ENTER_NODE = '''                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-check");
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);'''
if 'attr("class", "sat-check")' not in text:
    if OLD_ENTER_NODE not in text:
        raise SystemExit("enter node missing")
    text = text.replace(OLD_ENTER_NODE, NEW_ENTER_NODE, 1)
    print("check mark enter ok")
else:
    print("check mark enter already")

# After sat-sub text update, add check mark update
OLD_SUB = '''          satNodeSel.select("text.sat-sub")
            .text(d => {
              if (d.isLeaf) return "讲义";
              if (d.isChapter && d.isBranch) return "导读";
              if (d.isChapter) return "章节";
              if (d.isBranch) return "已展开";
              return "展开";
            });'''
NEW_SUB = '''          satNodeSel.select("text.sat-sub")
            .text(d => {
              if (d.isLeaf) return "讲义";
              if (d.isChapter && d.isBranch) return "导读";
              if (d.isChapter) return "章节";
              if (d.isBranch) return "已展开";
              return "展开";
            });
          satNodeSel.select("text.sat-check")
            .text(d => isLearned(d.learnId) ? "✓" : "")
            .attr("dy", d => -(baseSatRadius(d) + 4));'''
if 'select("text.sat-check")' not in text:
    if OLD_SUB not in text:
        raise SystemExit("sat-sub missing")
    text = text.replace(OLD_SUB, NEW_SUB, 1)
    print("check mark update ok")
else:
    print("check mark update already")

# ---------- Drag: don't overwrite home; rebound on end ----------
OLD_DRAG = '''            .on("drag", (event, d) => {
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
                satLinkSel.attr("d", n => satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal, n.parentR, n._r || baseSatRadius(n)));
              }
            })
            .on("end", (event, d) => {
              d.fx = null; d.fy = null;
              (d._dragKids || []).forEach(k => { k.fx = null; k.fy = null; });
              d._dragKids = null;
              if (kgLiveSim) kgLiveSim.alphaTarget(0.018);
            }));'''

NEW_DRAG = '''            .on("drag", (event, d) => {
              d.fx = d.x = event.x;
              d.fy = d.y = event.y;
              // 不改 homeX/homeY，松手后回弹到扇区位
              (d._dragKids || []).forEach(k => {
                k.fx = k.x = d.x + (k._ox || 0);
                k.fy = k.y = d.y + (k._oy || 0);
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
                satLinkSel.attr("d", n => satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal, n.parentR, n._r || baseSatRadius(n)));
              }
              if (typeof updateSatSparks === "function") updateSatSparks();
            })
            .on("end", (event, d) => {
              d.fx = null; d.fy = null;
              d.tx = d.homeX != null ? d.homeX : d.tx;
              d.ty = d.homeY != null ? d.homeY : d.ty;
              (d._dragKids || []).forEach(k => {
                k.fx = null; k.fy = null;
                k.tx = k.homeX != null ? k.homeX : k.tx;
                k.ty = k.homeY != null ? k.homeY : k.ty;
              });
              d._dragKids = null;
              if (kgLiveSim) {
                kgLiveSim.force("x", d3.forceX(n => n.tx).strength(0.32));
                kgLiveSim.force("y", d3.forceY(n => n.ty).strength(0.32));
                kgLiveSim.alpha(0.55).alphaTarget(0.35).restart();
                setTimeout(() => {
                  if (!kgLiveSim) return;
                  kgLiveSim.force("x", d3.forceX(n => n.tx).strength(0.035));
                  kgLiveSim.force("y", d3.forceY(n => n.ty).strength(0.035));
                  kgLiveSim.alphaTarget(0.018);
                }, 650);
              }
            }));'''

if "松手后回弹到扇区位" not in text:
    if OLD_DRAG not in text:
        raise SystemExit("drag block missing")
    text = text.replace(OLD_DRAG, NEW_DRAG, 1)
    print("rebound ok")
else:
    print("rebound already")

# ---------- Sector progress in legend ----------
OLD_LEG = '''          if (legEl) {
            legEl.innerHTML = `<div class="kg-focus-legend-title">扇区图例</div>` + KG_SECTOR_ORDER.map(k => {
              const s = KG_SECTORS[k];
              return `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:${s.color};color:${s.color}"></span>${escapeHtml(s.label)} · ${s.angDeg}°</div>`;
            }).join("") +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#34d399;color:#34d399"></span>叶节点讲义</div>` +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#f59e0b;color:#f59e0b"></span>已展开分支</div>`;
          }'''

NEW_LEG = '''          if (legEl) {
            const secStats = { foundation: { t: 0, d: 0 }, advanced: { t: 0, d: 0 }, practice: { t: 0, d: 0 } };
            const tree = currentKgTree();
            if (tree) {
              const l2s = filterKgChildren(tree.children || []);
              const keys = assignSectorKeySmart(l2s);
              const walk = (n, key) => {
                const kids = n.children || [];
                if (!kids.length) {
                  secStats[key].t += 1;
                  if (isLearned("kg:" + kgDrill.hubId + ":" + n.id)) secStats[key].d += 1;
                  return;
                }
                kids.forEach(c => walk(c, key));
              };
              l2s.forEach((c, i) => {
                const key = keys[i] || "advanced";
                if (secStats[key]) walk(c, key);
              });
            }
            legEl.innerHTML = `<div class="kg-focus-legend-title">扇区进度</div>` + KG_SECTOR_ORDER.map(k => {
              const s = KG_SECTORS[k];
              const st = secStats[k] || { t: 0, d: 0 };
              const doneCls = st.t && st.d >= st.t ? " is-done" : "";
              return `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:${s.color};color:${s.color}"></span>${escapeHtml(s.label)}<span class="leg-prog${doneCls}">${st.d}/${st.t}</span></div>`;
            }).join("") +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#34d399;color:#34d399"></span>已学叶节点<span class="leg-prog">✓</span></div>`;
          }'''

if "扇区进度" not in text:
    if OLD_LEG not in text:
        raise SystemExit("legend missing")
    text = text.replace(OLD_LEG, NEW_LEG, 1)
    print("sector progress ok")
else:
    print("sector progress already")

# ---------- Mobile: collapse side on enter ----------
OLD_ENTER_FLAGS = '''          kgSideCollapsed = false;
          kgPanelCollapsed = false;
          document.body.classList.remove("is-side-collapsed", "is-panel-collapsed");
          document.body.classList.remove("home-hero");'''
NEW_ENTER_FLAGS = '''          const narrow = (typeof window !== "undefined" && window.innerWidth < 900);
          kgSideCollapsed = !!narrow;
          kgPanelCollapsed = false;
          document.body.classList.toggle("is-side-collapsed", kgSideCollapsed);
          document.body.classList.remove("is-panel-collapsed");
          document.body.classList.remove("home-hero");'''
if "const narrow = (typeof window" not in text:
    if OLD_ENTER_FLAGS not in text:
        raise SystemExit("enter flags missing")
    text = text.replace(OLD_ENTER_FLAGS, NEW_ENTER_FLAGS, 1)
    print("mobile side ok")
else:
    print("mobile side already")

# Sync rail button text after enter - in finishEnter
OLD_FINISH = '''            if (satNodeSel) satNodeSel.attr("opacity", 1).classed("entering", false);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(480); }, 120);'''
NEW_FINISH = '''            if (satNodeSel) satNodeSel.attr("opacity", 1).classed("entering", false);
            const sideBtn = document.getElementById("kgToggleSide");
            if (sideBtn) {
              sideBtn.textContent = kgSideCollapsed ? "»" : "«";
              sideBtn.title = kgSideCollapsed ? "展开左侧栏" : "收起左侧栏";
            }
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(480); }, 120);'''
if "sideBtn.textContent = kgSideCollapsed" not in text:
    if OLD_FINISH not in text:
        print("WARN finishEnter")
    else:
        text = text.replace(OLD_FINISH, NEW_FINISH, 1)
        print("rail sync ok")
else:
    print("rail sync already")

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
