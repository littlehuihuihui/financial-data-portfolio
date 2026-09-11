# -*- coding: utf-8 -*-
"""Fix L1 invisible + smaller tech hub + edge-aware tech links."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# ---------- 1) placeNodes: keep hub centered in focus ----------
OLD_PLACE = '''    function placeNodes() {
      const m = layoutMetrics();
      if (HOME_HERO_ONLY && !(kgDrill && kgDrill.active)) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        nodes.forEach(n => {
          if (n.id === HOME_HUB_ID) {
            n.x = n.fx = cx;
            n.y = n.fy = cy;
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }
      nodes.forEach(n => {'''

NEW_PLACE = '''    function placeNodes() {
      const m = layoutMetrics();
      if (HOME_HERO_ONLY && !(kgDrill && kgDrill.active)) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        nodes.forEach(n => {
          if (n.id === HOME_HUB_ID) {
            n.x = n.fx = cx;
            n.y = n.fy = cy;
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }
      // 焦点模式：中心锁定 hub，其它节点移出视野（避免流水线坐标把一级卫星挤没）
      if (kgDrill && kgDrill.active && kgDrill.hubId) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        nodes.forEach(n => {
          if (n.id === kgDrill.hubId) {
            n.x = n.fx = cx;
            n.y = n.fy = cy;
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }
      nodes.forEach(n => {'''

if "焦点模式：中心锁定 hub" not in text:
    if OLD_PLACE not in text:
        raise SystemExit("placeNodes missing")
    text = text.replace(OLD_PLACE, NEW_PLACE, 1)
    print("placeNodes ok")
else:
    print("placeNodes already")

# ---------- 2) tick: no full redraw in focus ----------
OLD_TICK = '''    function tick() {
      link.attr("d", linkPath);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      if ((kgDrill && kgDrill.active) || expandedHubId) redrawSatellites();
    }'''

NEW_TICK = '''    function tick() {
      link.attr("d", linkPath);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      // 焦点模式下禁止整图重绘（会把卫星 opacity 卡死 / 打断进场）
      if (kgDrill && kgDrill.active) return;
      if (expandedHubId) redrawSatellites();
    }'''

if "焦点模式下禁止整图重绘" not in text:
    if OLD_TICK not in text:
        raise SystemExit("tick missing")
    text = text.replace(OLD_TICK, NEW_TICK, 1)
    print("tick ok")
else:
    print("tick already")

# ---------- 3) relayout: focus-safe zoom ----------
OLD_RELAYOUT = '''    function relayout() {
      const m = placeNodes();
      drawStages(m);
      tick();
      const scale = Math.min(1, width() / m.w, height() / m.h);
      const tx = (width() - m.w * scale) / 2;
      const ty = (height() - m.h * scale) / 2;
      svg.call(zoom.transform, d3.zoomIdentity.translate(Math.max(0, tx), Math.max(0, ty)).scale(scale < 1 ? scale : 1));
    }'''

NEW_RELAYOUT = '''    function relayout() {
      const m = placeNodes();
      drawStages(m);
      tick();
      if (kgDrill && kgDrill.active) {
        svg.call(zoom.transform, d3.zoomIdentity);
        if (typeof fitKgFocusView === "function" && satData && satData.length) {
          fitKgFocusView(0);
        }
        return;
      }
      const scale = Math.min(1, width() / m.w, height() / m.h);
      const tx = (width() - m.w * scale) / 2;
      const ty = (height() - m.h * scale) / 2;
      svg.call(zoom.transform, d3.zoomIdentity.translate(Math.max(0, tx), Math.max(0, ty)).scale(scale < 1 ? scale : 1));
    }'''

if "fitKgFocusView === \"function\" && satData" not in text and 'fitKgFocusView === "function" && satData' not in text:
    if OLD_RELAYOUT not in text:
        raise SystemExit("relayout missing")
    text = text.replace(OLD_RELAYOUT, NEW_RELAYOUT, 1)
    print("relayout ok")
else:
    # check
    if "kgDrill && kgDrill.active) {\n        svg.call(zoom.transform, d3.zoomIdentity)" in text:
        print("relayout already")
    elif OLD_RELAYOUT in text:
        text = text.replace(OLD_RELAYOUT, NEW_RELAYOUT, 1)
        print("relayout ok2")
    else:
        print("WARN relayout")

# ---------- 4) opacity / entering CSS ----------
text = text.replace(
    "    .sat-node.entering { opacity: 0; }\n",
    "    .sat-node.entering { /* 进场用 JS attr，避免 CSS opacity 卡死 */ }\n",
    1,
)

# ---------- 5) paintSatLayer: force opacity 1 on update ----------
OLD_JOIN_UPDATE = '''              update => update,
              exit => exit.transition().duration(140).attr("opacity", 0).remove()
            )
            .attr("transform", d => `translate(${d.x},${d.y})`)'''

NEW_JOIN_UPDATE = '''              update => update.attr("opacity", 1).classed("entering", false),
              exit => exit.transition().duration(140).attr("opacity", 0).remove()
            )
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("opacity", 1)'''

if "update.attr(\"opacity\", 1).classed(\"entering\", false)" not in text:
    if OLD_JOIN_UPDATE not in text:
        raise SystemExit("join update missing")
    text = text.replace(OLD_JOIN_UPDATE, NEW_JOIN_UPDATE, 1)
    print("opacity update ok")
else:
    print("opacity update already")

# ---------- 6) satArcPath: edge to edge ----------
OLD_ARC = '''        /** 二次贝塞尔弧线（顺时针弯，模拟百科 curvedCW） */
        function satArcPath(px, py, x, y, layer, siblingIndex, siblingTotal) {
          const dx = x - px, dy = y - py;
          const dist = Math.hypot(dx, dy) || 1;
          const pad = layer >= 4 ? 16 : layer === 3 ? 18 : 22;
          const tx = x - (dx / dist) * pad;
          const ty = y - (dy / dist) * pad;
          const mx = (px + tx) / 2;
          const my = (py + ty) / 2;
          const nx = -dy / dist, ny = dx / dist;
          const roundness = layer <= 2 ? 0.28 : 0.35;
          const bend = Math.min(48, dist * roundness) * (siblingTotal > 1 ? 1 : 0.7);
          const sign = 1;
          return `M${px},${py}Q${mx + nx * bend * sign},${my + ny * bend * sign} ${tx},${ty}`;
        }'''

NEW_ARC = '''        /** 二次贝塞尔弧线：从父圆边缘到子圆边缘（不穿心、不压在圆上） */
        function satArcPath(px, py, x, y, layer, siblingIndex, siblingTotal, parentR, childR) {
          const dx = x - px, dy = y - py;
          const dist = Math.hypot(dx, dy) || 1;
          const pr = parentR != null ? parentR : (layer <= 2 ? hubFocusRadius() : 22);
          const cr = childR != null ? childR : (layer >= 4 ? 15 : layer === 3 ? 17 : 20);
          const gap = 3;
          const sx = px + (dx / dist) * (pr + gap);
          const sy = py + (dy / dist) * (pr + gap);
          const tx = x - (dx / dist) * (cr + gap);
          const ty = y - (dy / dist) * (cr + gap);
          const mx = (sx + tx) / 2;
          const my = (sy + ty) / 2;
          const nx = -dy / dist, ny = dx / dist;
          const roundness = layer <= 2 ? 0.32 : 0.38;
          const bend = Math.min(56, dist * roundness) * (siblingTotal > 1 ? 1 : 0.75);
          const sign = ((siblingIndex || 0) % 2 === 0) ? 1 : -1;
          return `M${sx},${sy}Q${mx + nx * bend * sign},${my + ny * bend * sign} ${tx},${ty}`;
        }

        function hubFocusRadius() {
          return 36;
        }'''

if "从父圆边缘到子圆边缘" not in text:
    if OLD_ARC not in text:
        raise SystemExit("arc missing")
    text = text.replace(OLD_ARC, NEW_ARC, 1)
    print("arc ok")
else:
    print("arc already")

# Update link d= calls to pass radii - use helper wrapper in tick paths
# satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal)
# -> add parent/child radius from data

def patch_arc_calls(t):
    old = "satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal)"
    new = "satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d))"
    c = t.count(old)
    t = t.replace(old, new)
    old2 = "satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal)"
    new2 = "satArcPath(n.parentX, n.parentY, n.x, n.y, n.layer, n.sibIdx, n.sibTotal, n.parentR, n._r || baseSatRadius(n))"
    c2 = t.count(old2)
    t = t.replace(old2, new2)
    print("arc calls", c, c2)
    return t

text = patch_arc_calls(text)

# When building items, set parentR
# In L2 push: parentR: hubFocusRadius()
# In pushFan: parentR from parent or baseSatRadius

OLD_L2_FIELDS = '''                  parentId: null,
                  layer: 2,'''
NEW_L2_FIELDS = '''                  parentId: null,
                  parentR: hubFocusRadius(),
                  layer: 2,'''
if "parentR: hubFocusRadius()" not in text:
    text = text.replace(OLD_L2_FIELDS, NEW_L2_FIELDS, 1)
    print("L2 parentR ok")
else:
    print("L2 parentR already")

OLD_PUSH_FIELDS = '''              parentId: parentLearnId || null,
              layer,'''
NEW_PUSH_FIELDS = '''              parentId: parentLearnId || null,
              parentR: (layer <= 3 ? 22 : 18),
              layer,'''
if "parentR: (layer <= 3 ? 22 : 18)" not in text:
    text = text.replace(OLD_PUSH_FIELDS, NEW_PUSH_FIELDS, 1)
    print("push parentR ok")
else:
    print("push parentR already")

# After items built in settle, set _r and parentR for hub children
# already sets _r = baseSatRadius

# ---------- 7) Hub size smaller + tech rings ----------
# home hero 78 -> 46, focus 62 -> 36, pulse accordingly
text = text.replace(
    'if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return 78;',
    'if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return 46;',
    1,
)
text = text.replace(
    'if (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID) return 78;',
    'if (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID) return 46;',
    1,
)
text = text.replace(
    'if (kgDrill.active && d.id === kgDrill.hubId) return 62;',
    'if (kgDrill.active && d.id === kgDrill.hubId) return hubFocusRadius();',
    1,
)
text = text.replace(
    'const r = 62 + t * 5;\n            const blur = 28 + t * 10;',
    'const r = hubFocusRadius() + t * 2.2;\n            const blur = 16 + t * 6;',
    1,
)
# sublabel dy for hero
text = text.replace(
    'node.append("text").attr("class", "sublabel").attr("dy", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? 56 : 40)',
    'node.append("text").attr("class", "sublabel").attr("dy", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? 38 : 34)',
    1,
)
text = text.replace(
    '.style("font-size", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? "18px" : (d.catalog ? "12px" : "11px"))',
    '.style("font-size", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? "13px" : (d.catalog ? "12px" : "11px"))',
    1,
)
print("hub size ok")

# Add hub rings after node is created - find node.append circle pattern
# Inject syncHubTechRings in syncKgHubSize
OLD_SYNC_HUB = '''        function syncKgHubSize() {
          if (typeof node === "undefined" || !node) return;
          node.select("circle").attr("r", d => {
            if (kgDrill.active && d.id === kgDrill.hubId) return hubFocusRadius();
            if (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID) return 46;
            if (KG_TREES[d.id] || d.catalog) return 32;
            return 26;
          });'''

# Maybe hubFocusRadius not yet in scope at first replace - it's nested inside. syncKgHubSize is also nested. Good.

# Check if sync already uses hubFocusRadius after our replace
if "function syncKgHubSize" in text and "hubFocusRadius()" in text[text.find("function syncKgHubSize"):text.find("function syncKgHubSize")+400]:
    print("sync already uses hubFocusRadius")
else:
    print("WARN check syncKgHubSize")

# Insert tech rings painting into syncKgHubSize after circle r set
RING_HOOK = '''          node.classed("hub-expanded", d => (kgDrill.active && d.id === kgDrill.hubId) || d.id === expandedHubId);'''
RING_CODE = '''          // 科技感双环
          node.each(function (d) {
            const g = d3.select(this);
            const isHub = (kgDrill.active && d.id === kgDrill.hubId) || (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID);
            let ring = g.select("circle.hub-ring");
            let ring2 = g.select("circle.hub-ring-dash");
            if (isHub) {
              const rr = kgDrill.active && d.id === kgDrill.hubId ? hubFocusRadius() : 46;
              if (ring.empty()) ring = g.insert("circle", "circle").attr("class", "hub-ring");
              if (ring2.empty()) ring2 = g.insert("circle", "circle").attr("class", "hub-ring-dash");
              ring.attr("r", rr + 8).attr("fill", "none");
              ring2.attr("r", rr + 14).attr("fill", "none");
            } else {
              ring.remove();
              ring2.remove();
            }
          });
          node.classed("hub-expanded", d => (kgDrill.active && d.id === kgDrill.hubId) || d.id === expandedHubId);'''

if "hub-ring-dash" not in text:
    if RING_HOOK not in text:
        raise SystemExit("ring hook missing")
    text = text.replace(RING_HOOK, RING_CODE, 1)
    print("hub rings ok")
else:
    print("hub rings already")

# ---------- 8) CSS tech hub + links ----------
CSS = r'''
    /* 科技感：中心核 + 连线 */
    .node.home-hero-node circle,
    .node.kg-focus-hub circle {
      fill: url(#hubCoreGrad) #7c3aed !important;
      stroke: #c4b5fd !important;
      stroke-width: 1.6 !important;
      filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.7));
    }
    .hub-ring {
      stroke: rgba(168, 85, 247, 0.45);
      stroke-width: 1.2;
      pointer-events: none;
    }
    .hub-ring-dash {
      stroke: rgba(34, 211, 238, 0.55);
      stroke-width: 1;
      stroke-dasharray: 3 7;
      pointer-events: none;
      animation: hubSpin 12s linear infinite;
      transform-origin: center;
      transform-box: fill-box;
    }
    @keyframes hubSpin {
      to { stroke-dashoffset: -120; }
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node circle {
      stroke: #c4b5fd !important;
      stroke-width: 1.8 !important;
      fill: #7c3aed !important;
      filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.75));
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node text {
      font-size: 13px !important;
    }
    .sat-link {
      fill: none;
      stroke-linecap: round;
      stroke-opacity: 0.72;
      stroke-width: 1.35;
      filter: drop-shadow(0 0 3px rgba(34, 211, 238, 0.35));
      marker-end: none;
    }
    .sat-link.layer-2 {
      stroke-width: 1.5;
      stroke-dasharray: 1 0;
    }
    .sat-link.layer-3, .sat-link.layer-4 {
      stroke-width: 1.15;
      stroke-opacity: 0.55;
      stroke-dasharray: 4 5;
      filter: drop-shadow(0 0 2px rgba(148, 163, 184, 0.25));
    }
    .sat-link.dashed {
      stroke-dasharray: 3 6;
    }

'''

if "hubSpin" not in text:
    anchor = "    </style>\n</head>"
    text = text.replace(anchor, CSS + "    </style>\n</head>", 1)
    print("tech css ok")
else:
    print("tech css already")

# Add SVG gradient def for hub if missing
OLD_DEFS = '''    defs.append("marker").attr("id", "arrow-sat")'''
# find actual defs block
if 'id", "hubCoreGrad"' not in text and "hubCoreGrad" not in text:
    # after const defs
    marker = '    const defs = svg.append("defs");'
    if marker not in text:
        # try alternate
        idx = text.find('svg.append("defs")')
        print("defs idx", idx)
    else:
        insert = '''    const defs = svg.append("defs");
    const hubGrad = defs.append("radialGradient").attr("id", "hubCoreGrad");
    hubGrad.append("stop").attr("offset", "0%").attr("stop-color", "#e9d5ff");
    hubGrad.append("stop").attr("offset", "45%").attr("stop-color", "#a855f7");
    hubGrad.append("stop").attr("offset", "100%").attr("stop-color", "#4c1d95");
'''
        text = text.replace(marker, insert, 1)
        print("hub grad ok")
else:
    print("hub grad already")

# Remove marker-end from sat-link CSS earlier duplicates - we set marker-end:none in new CSS
# Also bump showMore so all 9 L1 show
text = text.replace(
    "let kgShowMore = { foundation: 4, advanced: 4, practice: 4 };",
    "let kgShowMore = { foundation: 8, advanced: 8, practice: 8 };",
    1,
)
text = text.replace(
    "kgShowMore = { foundation: 4, advanced: 4, practice: 4 };",
    "kgShowMore = { foundation: 8, advanced: 8, practice: 8 };",
)
print("showMore bump ok")

# enterKgDrill: after redraw, ensure opacity and one fit
OLD_FINISH = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            if (typeof tick === "function") tick();
            // settle 几帧后再 fit，避免挤在边缘
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(520); }, 280);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(380); }, 720);
          };'''

NEW_FINISH = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            // 强制卫星可见（防止进场 attr 被打断）
            if (satNodeSel) satNodeSel.attr("opacity", 1).classed("entering", false);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(480); }, 120);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 520);
          };'''

if "强制卫星可见" not in text:
    if OLD_FINISH not in text:
        raise SystemExit("finishEnter missing")
    text = text.replace(OLD_FINISH, NEW_FINISH, 1)
    print("finishEnter ok")
else:
    print("finishEnter already")

# L2 orbit radius a bit closer for smaller hub
text = text.replace(
    "const baseR = 200 + (i % 3) * 24;",
    "const baseR = 155 + (i % 3) * 18;",
    1,
)
print("orbit ok")

HTML.write_text(text, encoding="utf-8")
print("wrote", HTML.stat().st_size)
