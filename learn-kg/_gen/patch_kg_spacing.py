# -*- coding: utf-8 -*-
"""Normalize KG satellite spacing: equal edge lengths, adaptive fan by layer/count."""
from pathlib import Path

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

OLD_FAN = '''        /** 对齐行业百科：扇面紧凑（百科为 min(0.9, 0.18*n)） */
        function sectorFanSpread(n) {
          if (n <= 1) return 0;
          // 略宽于百科一点，留给中文标签；仍远小于旧版 0.7~1.95
          return Math.min(1.0, 0.20 * Math.max(n, 1));
        }'''

NEW_FAN = '''        /** 按层级 + 兄弟数计算统一边长（同父同长，消除长短不一） */
        function kgEdgeLen(layer, n) {
          const count = Math.max(1, n || 1);
          // 层越深越短；兄弟越多略加长，但有上限避免空旷
          if (layer <= 2) return Math.min(118, 92 + Math.max(0, count - 2) * 5);
          if (layer === 3) return Math.min(78, 58 + Math.max(0, count - 2) * 4);
          return Math.min(64, 46 + Math.max(0, count - 2) * 3);
        }

        /** 扇角随节点数与边长自适应：保证弦长 ≥ 2*节点半径+间距 */
        function kgFanSpread(n, edgeLen, nodeR) {
          if (n <= 1) return 0;
          const pad = 14;
          const minChord = 2 * (nodeR || 18) + pad;
          const r = Math.max(edgeLen || 60, 1);
          const ratio = Math.min(0.98, minChord / (2 * r));
          const step = 2 * Math.asin(ratio);
          const need = step * (n - 1);
          const soft = 0.18 * n;
          return Math.min(1.15, Math.max(soft, need));
        }

        function sectorFanSpread(n) {
          return kgFanSpread(n, kgEdgeLen(2, n), 26);
        }'''

# --- settleSatPositions: replace springs + force block (portfolio-style and platform-style) ---
SETTLE_MARKERS = [
    (
        '''          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => {
              const p = byId.get(d.parentId);
              return {
                source: p,
                target: d,
                dist: Math.max(72, Math.min(120, Math.hypot(d.tx - p.tx, d.ty - p.ty) || 96))
              };
            });

          // 参数刻意贴近 vis-network barnesHut（百科 knowledge-graph-app.js）
          kgLiveSim = d3.forceSimulation(items)
            .force("charge", d3.forceManyBody().strength(-1600).distanceMax(480))
            .force("center", d3.forceCenter(hub.x, hub.y).strength(0.045))
            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + (d.layer === 2 ? 10 : 7))
              .strength(0.7)
              .iterations(2))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.05))
            .force("x", d3.forceX(d => d.tx).strength(0.12))
            .force("y", d3.forceY(d => d.ty).strength(0.12))
            .velocityDecay(0.48)
            .alpha(1)
            .alphaDecay(0.026)
            .alphaMin(0.001);''',
    ),
    (
        '''          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => {
              const p = byId.get(d.parentId);
              return {
                source: p,
                target: d,
                dist: Math.max(52, Math.min(88, Math.hypot(d.tx - p.tx, d.ty - p.ty) || 66))
              };
            });

          // 参数刻意贴近 vis-network barnesHut（百科 knowledge-graph-app.js）
          kgLiveSim = d3.forceSimulation(items)
            .force("charge", d3.forceManyBody().strength(-900).distanceMax(320))
            .force("center", d3.forceCenter(hub.x, hub.y).strength(0.045))
            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + (d.layer === 2 ? 18 : 12))
              .strength(0.72)
              .iterations(2))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.05))
            .force("x", d3.forceX(d => d.tx).strength(0.12))
            .force("y", d3.forceY(d => d.ty).strength(0.12))
            .velocityDecay(0.48)
            .alpha(1)
            .alphaDecay(0.026)
            .alphaMin(0.001);''',
    ),
]

NEW_SETTLE = '''          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => {
              const p = byId.get(d.parentId);
              const homeDist = Math.hypot(
                (d.tx != null ? d.tx : d.x) - (p.tx != null ? p.tx : p.x),
                (d.ty != null ? d.ty : d.y) - (p.ty != null ? p.ty : p.y)
              );
              return {
                source: p,
                target: d,
                dist: d._edgeLen != null ? d._edgeLen : (homeDist || kgEdgeLen(d.layer || 3, d.sibTotal || 1))
              };
            });

          // 强钉目标位 + 等长弹簧：保边长一致、防重叠，避免力导向把线拉长短不一
          kgLiveSim = d3.forceSimulation(items)
            .force("charge", d3.forceManyBody().strength(-220).distanceMax(200))
            .force("center", d3.forceCenter(hub.x, hub.y).strength(0.02))
            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + 11)
              .strength(0.95)
              .iterations(3))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.62))
            .force("x", d3.forceX(d => d.tx).strength(0.48))
            .force("y", d3.forceY(d => d.ty).strength(0.48))
            .velocityDecay(0.55)
            .alpha(0.85)
            .alphaDecay(0.04)
            .alphaMin(0.001);'''

# Soften mid-sim charge/link too
OLD_TICK_55_VARIANTS = [
    '''            if (ticks === 55) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-450).distanceMax(300));
              kgLiveSim.force("center", d3.forceCenter(hub.x, hub.y).strength(0.02));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.022));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.09));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.09));
              kgLiveSim.velocityDecay(0.7);
              kgLiveSim.alphaTarget(0.06);
            }''',
]

# portfolio might have different mid values - search flexibly
NEW_TICK_55 = '''            if (ticks === 55) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-120).distanceMax(180));
              kgLiveSim.force("center", d3.forceCenter(hub.x, hub.y).strength(0.01));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.45));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.55));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.55));
              kgLiveSim.velocityDecay(0.72);
              kgLiveSim.alphaTarget(0.04);
            }'''

# pushFan jitter removal
OLD_PUSHFAN_ANG = '''            } else if (parentAng != null && layer > 2) {
              const fan = Math.min(0.95, 0.20 * Math.max(total, 1));
              ang = parentAng - fan / 2 + (fan * idx) / Math.max(total - 1, 1);
            } else if (parentAng != null) {
              const spread = sectorFanSpread(total);
              ang = total === 1 ? parentAng : parentAng - spread / 2 + (spread * idx) / Math.max(total - 1, 1);
            } else {
              ang = -Math.PI / 2;
            }
            const jitter = (layer >= 3) ? (idx % 2) * 8 : 0;
            const r = baseR + jitter;'''

NEW_PUSHFAN_ANG = '''            } else if (parentAng != null) {
              const edge = (typeof kgEdgeLen === "function") ? kgEdgeLen(layer, total) : baseR;
              const nodeR = layer <= 2 ? 26 : (layer === 3 ? 18 : 16);
              const fan = (typeof kgFanSpread === "function")
                ? kgFanSpread(total, edge, nodeR)
                : sectorFanSpread(total);
              ang = total === 1 ? parentAng : parentAng - fan / 2 + (fan * idx) / Math.max(total - 1, 1);
            } else {
              ang = -Math.PI / 2;
            }
            const r = (typeof kgEdgeLen === "function") ? kgEdgeLen(layer, total) : baseR;'''

# L2 / L3 / L4 placement blocks — two variants (tight vs wide)
L2_OLD_PATTERNS = [
    '''              const spread = sectorFanSpread(n);
              list.forEach((entry, i) => {
                const c = entry.node;
                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                // 百科同款更紧凑：半径约 148，扇内微错层
                const ringBoost = key === "practice" ? -8 : 0;
                const baseR = 148 + ringBoost + (i % 3) * 14;''',
    '''              const spread = sectorFanSpread(n);
              list.forEach((entry, i) => {
                const c = entry.node;
                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                // 百科同款更紧凑：半径约 148，扇内微错层
                const ringBoost = key === "practice" ? -4 : 0;
                const baseR = 104 + ringBoost + (i % 3) * 10;''',
]

L2_NEW = '''              const edge2 = kgEdgeLen(2, n);
              const spread = kgFanSpread(n, edge2, 26);
              list.forEach((entry, i) => {
                const c = entry.node;
                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                // 同扇区同半径：边长统一，无错层 jitter
                const baseR = edge2;'''

L3_OLD_PATTERNS = [
    '''                  const n3 = l3s.length;
                  // 百科：L3 挂在更大同心环上，绕父节点极角扇出（一对多弧线）
                  const fan3 = Math.min(0.95, 0.20 * Math.max(n3, 1));
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const r3 = l2Node.r + 96 + (j % 2) * 12;
                    const off3 = polarOffset(ang3, r3);
                    const x3 = hub.x + off3.dx;
                    const y3 = hub.y + off3.dy;
                    const p3 = pushFanAt(c3, l2Node.x, l2Node.y, x3, y3, ang3, r3, 3, j, n3, sec.color, key, sec.glow, l2Node.learnId);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      const n4 = l4s.length;
                      const fan4 = Math.min(0.75, 0.18 * Math.max(n4, 1));
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const r4 = r3 + 72 + (k % 2) * 10;
                        const off4 = polarOffset(ang4, r4);
                        pushFanAt(c4, x3, y3, hub.x + off4.dx, hub.y + off4.dy, ang4, r4, 4, k, n4, sec.color, key, sec.glow, p3.learnId);
                      });
                    }
                  });''',
    '''                  const n3 = l3s.length;
                  // 百科：L3 挂在更大同心环上，绕父节点极角扇出（一对多弧线）
                  const fan3 = Math.min(0.95, 0.20 * Math.max(n3, 1));
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const r3 = l2Node.r + 52 + (j % 2) * 8;
                    const off3 = polarOffset(ang3, r3);
                    const x3 = hub.x + off3.dx;
                    const y3 = hub.y + off3.dy;
                    const p3 = pushFanAt(c3, l2Node.x, l2Node.y, x3, y3, ang3, r3, 3, j, n3, sec.color, key, sec.glow, l2Node.learnId);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      const n4 = l4s.length;
                      const fan4 = Math.min(0.75, 0.18 * Math.max(n4, 1));
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const r4 = r3 + 38 + (k % 2) * 7;
                        const off4 = polarOffset(ang4, r4);
                        pushFanAt(c4, x3, y3, hub.x + off4.dx, hub.y + off4.dy, ang4, r4, 4, k, n4, sec.color, key, sec.glow, p3.learnId);
                      });
                    }
                  });''',
]

L3_NEW = '''                  const n3 = l3s.length;
                  // 相对父节点等长扇出：同父边长一致，扇角随节点数自适应
                  const edge3 = kgEdgeLen(3, n3);
                  const fan3 = kgFanSpread(n3, edge3, 18);
                  const l2x = l2Node.homeX != null ? l2Node.homeX : l2Node.tx;
                  const l2y = l2Node.homeY != null ? l2Node.homeY : l2Node.ty;
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const off3 = polarOffset(ang3, edge3);
                    const x3 = l2x + off3.dx;
                    const y3 = l2y + off3.dy;
                    const p3 = pushFanAt(c3, l2x, l2y, x3, y3, ang3, edge3, 3, j, n3, sec.color, key, sec.glow, l2Node.learnId);
                    const l3Item = items[items.length - 1];
                    if (l3Item) l3Item._edgeLen = edge3;
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      const n4 = l4s.length;
                      const edge4 = kgEdgeLen(4, n4);
                      const fan4 = kgFanSpread(n4, edge4, 16);
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const off4 = polarOffset(ang4, edge4);
                        const x4 = x3 + off4.dx;
                        const y4 = y3 + off4.dy;
                        pushFanAt(c4, x3, y3, x4, y4, ang4, edge4, 4, k, n4, sec.color, key, sec.glow, p3.learnId);
                        const l4Item = items[items.length - 1];
                        if (l4Item) l4Item._edgeLen = edge4;
                      });
                    }
                  });'''

# After L2 item created, set _edgeLen
L2_EDGE_MARK = '''                l2Node.tx = placed.x; l2Node.ty = placed.y;
                l2Node.homeX = placed.x; l2Node.homeY = placed.y;
                l2Node.ang = placed.ang; l2Node.r = placed.r;'''

L2_EDGE_NEW = '''                l2Node.tx = placed.x; l2Node.ty = placed.y;
                l2Node.homeX = placed.x; l2Node.homeY = placed.y;
                l2Node.ang = placed.ang; l2Node.r = placed.r;
                l2Node._edgeLen = baseR;'''


def patch_one(path):
    text = path.read_text(encoding="utf-8")
    done = []

    if "function kgEdgeLen(layer, n)" not in text:
        if OLD_FAN not in text:
            raise SystemExit(f"fan block missing in {path}")
        text = text.replace(OLD_FAN, NEW_FAN, 1)
        done.append("fan/edge helpers")
    else:
        done.append("fan/edge helpers (skip)")

    settled = False
    for old in SETTLE_MARKERS:
        old_s = old[0]
        if old_s in text:
            text = text.replace(old_s, NEW_SETTLE, 1)
            settled = True
            done.append("settle forces")
            break
    if not settled:
        if "强钉目标位 + 等长弹簧" in text:
            done.append("settle forces (skip)")
        else:
            raise SystemExit(f"settle block missing in {path}")

    # tick 55 — replace any charge mid-sim block that still weakens link heavily
    import re
    tick_pat = re.compile(
        r"if \(ticks === 55\) \{.*?kgLiveSim\.alphaTarget\([^)]+\);\s*\}",
        re.S,
    )
    m = tick_pat.search(text)
    if m and "strength(0.55)" not in m.group(0):
        text = tick_pat.sub(NEW_TICK_55.strip(), text, count=1)
        done.append("tick55")
    else:
        done.append("tick55 (ok/skip)")

    if OLD_PUSHFAN_ANG in text:
        text = text.replace(OLD_PUSHFAN_ANG, NEW_PUSHFAN_ANG, 1)
        done.append("pushFan")
    elif "const r = (typeof kgEdgeLen === \"function\") ? kgEdgeLen(layer, total) : baseR;" in text:
        done.append("pushFan (skip)")
    else:
        # try without exact match - warn
        done.append("pushFan WARN")

    l2_ok = False
    for old in L2_OLD_PATTERNS:
        if old in text:
            text = text.replace(old, L2_NEW, 1)
            l2_ok = True
            done.append("L2 equal radius")
            break
    if not l2_ok:
        if "同扇区同半径：边长统一" in text:
            done.append("L2 equal radius (skip)")
        else:
            raise SystemExit(f"L2 block missing in {path}")

    l3_ok = False
    for old in L3_OLD_PATTERNS:
        if old in text:
            text = text.replace(old, L3_NEW, 1)
            l3_ok = True
            done.append("L3/L4 parent-relative")
            break
    if not l3_ok:
        if "相对父节点等长扇出" in text:
            done.append("L3/L4 parent-relative (skip)")
        else:
            raise SystemExit(f"L3 block missing in {path}")

    if L2_EDGE_MARK in text and "l2Node._edgeLen = baseR;" not in text:
        text = text.replace(L2_EDGE_MARK, L2_EDGE_NEW, 1)
        done.append("L2 _edgeLen")
    elif "l2Node._edgeLen = baseR;" in text:
        done.append("L2 _edgeLen (skip)")
    else:
        done.append("L2 _edgeLen WARN")

    path.write_text(text, encoding="utf-8")
    return done


def main():
    for f in FILES:
        if not f.exists():
            print("MISSING", f)
            continue
        done = patch_one(f)
        print(f.name, "=>", ", ".join(done))


if __name__ == "__main__":
    main()
