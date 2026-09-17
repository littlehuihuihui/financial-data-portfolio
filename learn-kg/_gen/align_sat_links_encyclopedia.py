# -*- coding: utf-8 -*-
"""Align sat links/layout to 行业百科 curvedCW + concentric fan."""
from pathlib import Path
import re

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

OLD_ARC = """        /** 二次贝塞尔弧线：从父圆边缘到子圆边缘（不穿心、不压在圆上） */
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
        }"""

NEW_ARC = """        /** 行业百科同款 curvedCW：统一顺时针弯，一对多不交叉乱麻 */
        function satArcPath(px, py, x, y, layer, siblingIndex, siblingTotal, parentR, childR) {
          const dx = x - px, dy = y - py;
          const dist = Math.hypot(dx, dy) || 1;
          const pr = parentR != null ? parentR : (layer <= 2 ? hubFocusRadius() : 22);
          const cr = childR != null ? childR : (layer >= 4 ? 15 : layer === 3 ? 17 : 20);
          const gap = 2.5;
          const sx = px + (dx / dist) * (pr + gap);
          const sy = py + (dy / dist) * (pr + gap);
          const tx = x - (dx / dist) * (cr + gap);
          const ty = y - (dy / dist) * (cr + gap);
          const mx = (sx + tx) / 2;
          const my = (sy + ty) / 2;
          // curvedCW：相对父→子方向取顺时针法向（SVG y 向下）
          const nx = dy / dist;
          const ny = -dx / dist;
          const roundness = layer <= 2 ? 0.28 : 0.35;
          const bend = Math.min(layer <= 2 ? 48 : 36, dist * roundness);
          return `M${sx},${sy}Q${mx + nx * bend},${my + ny * bend} ${tx},${ty}`;
        }"""

OLD_SETTLE_START = """        /** 弹簧 + 软持续物理（对齐百科 BarnesHut 稳定后不关死） */
        function settleSatPositions(items, hub, animate) {
          if (!items.length || typeof d3 === "undefined" || !d3.forceSimulation) return items;
          stopKgLiveSim();"""

NEW_SETTLE = """        /** 百科风：几何扇形锁定，轻量防重叠后停物理（避免线被弹簧搅乱） */
        function settleSatPositions(items, hub, animate) {
          if (!items.length) return items;
          stopKgLiveSim();
          // 先钉回目标扇形坐标
          items.forEach(d => {
            if (d.tx == null) d.tx = d.x;
            if (d.ty == null) d.ty = d.y;
            d.x = d.tx;
            d.y = d.ty;
            d._r = baseSatRadius(d);
          });
          if (typeof d3 === "undefined" || !d3.forceSimulation) {
            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));
            }
            return items;
          }
"""

# We'll replace from settle start through the early part - actually easier to replace the whole settle function by matching until return items before baseSatRadius of paint.

# Layout: L2 even ring, L3 concentric from hub
OLD_L2_PLACE = """                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                // 同扇区节点错开半径；实战扇区略收半径，避免沉到屏幕底栏
                const ringBoost = key === "practice" ? -16 : 0;
                const baseR = 168 + ringBoost + (i % 2) * 44 + Math.floor(i / 2) * 10;
                const off = polarOffset(ang, baseR);"""

NEW_L2_PLACE = """                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                // 百科同款：同扇区共圆半径，仅极角扇开（避免锯齿半径把线搅乱）
                const ringBoost = key === "practice" ? -12 : 0;
                const baseR = 175 + ringBoost + Math.min(28, Math.max(0, n - 4) * 6);
                const off = polarOffset(ang, baseR);"""

L2_SNAP_OLD = """                const l2Node = items[items.length - 1];
                // 仅 expandedL2 对应一级带出二级主题
                if (expanded && canExpand) {"""

L2_SNAP_NEW = """                const l2Node = items[items.length - 1];
                l2Node.tx = placed.x; l2Node.ty = placed.y;
                l2Node.x = placed.x; l2Node.y = placed.y;
                l2Node.homeX = placed.x; l2Node.homeY = placed.y;
                l2Node.ang = placed.ang; l2Node.r = placed.r;
                // 仅 expandedL2 对应一级带出二级主题
                if (expanded && canExpand) {"""

OLD_L3 = """                if (expanded && canExpand) {
                  const l3All = filterKgChildren(c.children || []);
                  const l3s = l3All.slice(0, kgShowMoreL3 || l3All.length);
                  l3s.forEach((c3, j) => {
                    const p3 = pushFan(c3, l2Node.x, l2Node.y, 3, 108, j, l3s.length, l2Node.ang, sec.color, key, sec.glow, l2Node.learnId);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      l4s.forEach((c4, k) => {
                        pushFan(c4, p3.x, p3.y, 4, 82, k, l4s.length, p3.ang, sec.color, key, sec.glow, p3.learnId);
                      });
                    }
                  });
                }"""

NEW_L3 = """                if (expanded && canExpand) {
                  const l3All = filterKgChildren(c.children || []);
                  const l3s = l3All.slice(0, kgShowMoreL3 || l3All.length);
                  const n3 = l3s.length;
                  // 百科：L3 挂在更大同心环上，绕父节点极角扇出（一对多弧线）
                  const fan3 = Math.min(1.1, 0.22 * Math.max(n3, 1));
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const r3 = l2Node.r + 118 + (j % 2) * 16;
                    const off3 = polarOffset(ang3, r3);
                    const x3 = hub.x + off3.dx;
                    const y3 = hub.y + off3.dy;
                    const p3 = pushFanAt(c3, l2Node.x, l2Node.y, x3, y3, ang3, r3, 3, j, n3, sec.color, key, sec.glow, l2Node.learnId);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      const n4 = l4s.length;
                      const fan4 = Math.min(0.9, 0.2 * Math.max(n4, 1));
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const r4 = r3 + 88 + (k % 2) * 12;
                        const off4 = polarOffset(ang4, r4);
                        pushFanAt(c4, x3, y3, hub.x + off4.dx, hub.y + off4.dy, ang4, r4, 4, k, n4, sec.color, key, sec.glow, p3.learnId);
                      });
                    }
                  });
                }"""

# Insert pushFanAt before pushFan
PUSH_FAN_AT = """
          function pushFanAt(c, px, py, x, y, ang, r, layer, idx, total, color, sectorKey, sectorGlow, parentLearnId) {
            const rawKids = kgNodeKids(c);
            const canExpand = filterKgChildren(rawKids).length > 0;
            const isL2Exp = layer === 2 && kgDrill.expandedL2 === c.id;
            const isL3Exp = layer === 3 && kgDrill.expandedL3 === c.id;
            const expanded = isL2Exp || isL3Exp;
            const leaf = !rawKids.length;
            const chapter = isLessonParent(c);
            const sec = KG_SECTORS[sectorKey] || null;
            const fill = leaf
              ? "#34d399"
              : (expanded ? "#f59e0b" : (color || (sec ? sec.color : "#38bdf8")));
            const item = applyPrev({
              learnId: "kg:" + kgDrill.hubId + ":" + c.id,
              kgId: c.id,
              name: c.title,
              x, y,
              parentX: px,
              parentY: py,
              parentId: parentLearnId || null,
              parentR: (layer <= 3 ? 22 : 18),
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
            // 百科：固定目标位，避免 applyPrev 残留旧坐标
            item.tx = x; item.ty = y; item.x = x; item.y = y;
            item.homeX = x; item.homeY = y;
            items.push(item);
            return { x: item.x, y: item.y, ang, r, hasKids: canExpand, expanded, leaf, chapter, learnId: item.learnId };
          }
"""

CSS_BLOCK_OLD = """    .sat-link {
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
    }"""

CSS_BLOCK_NEW = """    .sat-link {
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-opacity: 0.55;
      stroke-width: 2.2;
      filter: none;
      marker-end: url(#arrow-sat);
    }
    .sat-link.layer-2 {
      stroke-width: 2.4;
      stroke-opacity: 0.55;
      stroke-dasharray: none;
    }
    .sat-link.layer-3, .sat-link.layer-4 {
      stroke-width: 1.4;
      stroke-opacity: 0.35;
      stroke-dasharray: 5 6;
      filter: none;
    }
    .sat-link.dashed {
      stroke-dasharray: 5 6;
    }
    .sat-link.is-hot {
      stroke-opacity: 0.92 !important;
      stroke-width: 2.6;
    }"""

CSS_OVERRIDE_OLD = """    .sat-link {
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
    }"""

CSS_OVERRIDE_NEW = """    .sat-link {
      stroke-opacity: 0.55 !important;
      stroke-width: 2.2 !important;
      filter: none !important;
    }
    .sat-link.layer-2 {
      stroke-width: 2.4 !important;
      stroke-opacity: 0.55 !important;
      animation: none !important;
    }
    .sat-link.layer-3, .sat-link.layer-4, .sat-link.dashed {
      stroke-dasharray: 5 6 !important;
      stroke-opacity: 0.35 !important;
      stroke-width: 1.4 !important;
      animation: none !important;
    }"""


def patch_settle(html: str) -> str:
    """Replace settleSatPositions body to snap-first light collide."""
    start = html.find("        function settleSatPositions(items, hub, animate) {")
    if start < 0:
        return html
    # find next function baseSatRadius or paintSatSparks after settle - settle ends before function baseSatRadius? 
    # Actually settle is before updateSatSparks in some versions. Look for "return items;\n        }\n\n        function baseSatRadius"
    end_markers = [
        "\n        function baseSatRadius(",
        "\n        function updateSatSparks(",
        "\n        function paintSatSparks(",
    ]
    end = -1
    for m in end_markers:
        i = html.find(m, start + 10)
        if i > 0 and (end < 0 or i < end):
            end = i
    if end < 0:
        raise SystemExit("settleSatPositions end not found")
    # walk back to closing brace of settle
    # end points at next function; settle ends with `        }\n`
    new_fn = '''        function settleSatPositions(items, hub, animate) {
          if (!items.length) return items;
          stopKgLiveSim();
          const byId = new Map(items.map(d => [d.learnId, d]));
          items.forEach(d => {
            if (d.tx == null) d.tx = d.x;
            if (d.ty == null) d.ty = d.y;
            // 锁定扇形目标，父子端点跟手
            d.x = d.tx;
            d.y = d.ty;
            d._r = baseSatRadius(d);
            if (d.parentId && byId.has(d.parentId)) {
              const p = byId.get(d.parentId);
              d.parentX = p.x; d.parentY = p.y;
            } else {
              d.parentX = hub.x; d.parentY = hub.y;
            }
          });
          const paint = () => {
            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));
            }
          };
          paint();
          // 轻量碰撞：只沿径向微调，保持极角（线不交叉）
          if (typeof d3 === "undefined" || !d3.forceSimulation || !animate) {
            return items;
          }
          kgLiveSim = d3.forceSimulation(items)
            .force("collide", d3.forceCollide().radius(d => (d._r || 20) + (d.layer === 2 ? 18 : 12)).strength(0.7).iterations(2))
            .force("x", d3.forceX(d => d.tx).strength(0.55))
            .force("y", d3.forceY(d => d.ty).strength(0.55))
            .velocityDecay(0.55)
            .alpha(0.35)
            .alphaDecay(0.08)
            .alphaMin(0.02);
          let ticks = 0;
          kgLiveSim.on("tick", () => {
            ticks += 1;
            items.forEach(d => {
              // 拉回目标角向：按目标半径重投影，抑制横向乱跑
              const tdx = d.tx - hub.x, tdy = d.ty - hub.y;
              const tr = Math.hypot(tdx, tdy) || 1;
              const ang = Math.atan2(-(d.y - hub.y), d.x - hub.x); // unused lock
              const wantAng = Math.atan2(-tdy, tdx);
              const curR = Math.hypot(d.x - hub.x, d.y - hub.y) || tr;
              const mixR = curR * 0.25 + tr * 0.75;
              const off = polarOffset(wantAng, mixR);
              d.x = hub.x + off.dx;
              d.y = hub.y + off.dy;
              if (d.parentId && byId.has(d.parentId)) {
                const p = byId.get(d.parentId);
                d.parentX = p.x; d.parentY = p.y;
              } else {
                d.parentX = hub.x; d.parentY = hub.y;
              }
            });
            paint();
            if (ticks > 28 || kgLiveSim.alpha() < 0.03) kgLiveSim.stop();
          });
          return items;
        }
'''
    return html[:start] + new_fn + html[end:]


def patch_one(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    n = 0
    if OLD_ARC in t:
        t = t.replace(OLD_ARC, NEW_ARC)
        n += 1
    elif "curvedCW：统一顺时针弯" in t:
        pass
    else:
        print(path.name, "WARN: satArcPath pattern mismatch")

    if OLD_L2_PLACE in t:
        t = t.replace(OLD_L2_PLACE, NEW_L2_PLACE)
        n += 1
    if L2_SNAP_OLD in t:
        t = t.replace(L2_SNAP_OLD, L2_SNAP_NEW)
        n += 1
    if OLD_L3 in t:
        t = t.replace(OLD_L3, NEW_L3)
        n += 1
    if "function pushFanAt(" not in t and "function pushFan(" in t:
        t = t.replace("          function pushFan(", PUSH_FAN_AT + "\n          function pushFan(", 1)
        n += 1

    if OLD_SETTLE_START in t or "function settleSatPositions(items, hub, animate)" in t:
        t2 = patch_settle(t)
        if t2 != t:
            t = t2
            n += 1

    if CSS_BLOCK_OLD in t:
        t = t.replace(CSS_BLOCK_OLD, CSS_BLOCK_NEW)
        n += 1
    if CSS_OVERRIDE_OLD in t:
        t = t.replace(CSS_OVERRIDE_OLD, CSS_OVERRIDE_NEW)
        n += 1

    # paintSatLayer: ensure marker-end on paths
    t = t.replace(
        '.attr("stroke", d => d.color)\n                .attr("opacity", 0)',
        '.attr("stroke", d => d.color)\n                .attr("marker-end", "url(#arrow-sat)")\n                .attr("opacity", 0)',
    )

    # pushFan: also set tx/ty lock for L2 via applyPrev - update pushFan jitter
    old_jitter = """            const jitter = (idx % 2) * (layer === 2 ? 40 : 18) + Math.floor(idx / 2) * 8;
            const r = baseR + jitter;"""
    new_jitter = """            const jitter = (layer >= 3) ? (idx % 2) * 12 : 0;
            const r = baseR + jitter;"""
    if old_jitter in t:
        t = t.replace(old_jitter, new_jitter)
        n += 1

    path.write_text(t, encoding="utf-8")
    ok = "curvedCW：统一顺时针弯" in t and "pushFanAt" in t
    print(path.name, "patches", n, "ok", ok)


def main():
    for p in FILES:
        if p.exists():
            patch_one(p)
        else:
            print("missing", p)


if __name__ == "__main__":
    main()
