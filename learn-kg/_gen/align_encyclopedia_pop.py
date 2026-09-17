# -*- coding: utf-8 -*-
"""Recreate 行业百科 pop feel: barnesHut-like re-stabilize + stronger node glow."""
from pathlib import Path

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

SETTLE = r'''        /** 对齐行业百科：重建后 Barnes-Hut 式再稳定（整图弹一下再软阻尼） */
        function settleSatPositions(items, hub, animate) {
          if (!items.length) return items;
          stopKgLiveSim();
          const byId = new Map(items.map(d => [d.learnId, d]));
          const reduce = typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion;

          items.forEach(d => {
            if (d.tx == null) d.tx = d.x;
            if (d.ty == null) d.ty = d.y;
            d._r = baseSatRadius(d);
            if (d.parentId && byId.has(d.parentId)) {
              const p = byId.get(d.parentId);
              d.parentX = p.x; d.parentY = p.y;
            } else {
              d.parentX = hub.x; d.parentY = hub.y;
            }
            if (!animate || reduce) {
              d.x = d.tx; d.y = d.ty; d.vx = 0; d.vy = 0;
              return;
            }
            const px = d.parentX != null ? d.parentX : hub.x;
            const py = d.parentY != null ? d.parentY : hub.y;
            if (!d._kept) {
              // 新节点：偏父侧出现 + 向外初速度（像百科新边弹入）
              d.x = px * 0.42 + d.tx * 0.58;
              d.y = py * 0.42 + d.ty * 0.58;
              const ox = d.tx - px, oy = d.ty - py;
              const olen = Math.hypot(ox, oy) || 1;
              d.vx = (ox / olen) * 10;
              d.vy = (oy / olen) * 10;
            } else {
              // 旧节点：轻微扰动，参与整图再稳定（百科 clear+add 后的晃动）
              d.vx = (Math.random() - 0.5) * 3.2;
              d.vy = (Math.random() - 0.5) * 3.2;
            }
          });

          const paint = () => {
            if (satNodeSel) satNodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
            if (satLinkSel) {
              satLinkSel.attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal, d.parentR, d._r || baseSatRadius(d)));
            }
            if (typeof updateSatSparks === "function") updateSatSparks();
          };
          paint();
          if (!animate || reduce || typeof d3 === "undefined" || !d3.forceSimulation) return items;

          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => {
              const p = byId.get(d.parentId);
              return {
                source: p,
                target: d,
                dist: Math.max(100, Math.min(160, Math.hypot(d.tx - p.tx, d.ty - p.ty) || 120))
              };
            });

          // 参数刻意贴近 vis-network barnesHut（百科 knowledge-graph-app.js）
          kgLiveSim = d3.forceSimulation(items)
            .force("charge", d3.forceManyBody().strength(-1600).distanceMax(480))
            .force("center", d3.forceCenter(hub.x, hub.y).strength(0.045))
            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + (d.layer === 2 ? 16 : 11))
              .strength(0.72)
              .iterations(2))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.045))
            .force("x", d3.forceX(d => d.tx).strength(0.055))
            .force("y", d3.forceY(d => d.ty).strength(0.055))
            .velocityDecay(0.48)
            .alpha(1)
            .alphaDecay(0.026)
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
              const minR = d.layer === 2 ? 88 : 62;
              if (dist < minR) {
                d.x = hub.x + (dx / dist) * minR;
                d.y = hub.y + (dy / dist) * minR;
              }
            });
            paint();
            // 百科 stabilizationIterationsDone ≈ 软阻尼，不停死
            if (ticks === 55) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-720).distanceMax(420));
              kgLiveSim.force("center", d3.forceCenter(hub.x, hub.y).strength(0.02));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.022));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.04));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.04));
              kgLiveSim.velocityDecay(0.7);
              kgLiveSim.alphaTarget(0.06);
            }
            if (ticks === 120) {
              kgLiveSim.alphaTarget(0.018);
            }
            if (ticks > 220) {
              kgLiveSim.alphaTarget(0);
              if (kgLiveSim.alpha() < 0.012) kgLiveSim.stop();
            }
          });
          return items;
        }
'''

ENTER = r'''              enter => {
                const g = enter.append("g").attr("class", "sat-node entering").attr("opacity", 0);
                g.append("circle").attr("r", 0).attr("stroke", "rgba(255,255,255,0.35)").attr("stroke-width", 2);
                g.append("text").attr("class", "sat-check");
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);
                const reduce = typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion;
                const easePop = (!reduce && typeof d3.easeBackOut === "function")
                  ? d3.easeBackOut.overshoot(2.05)
                  : d3.easeCubicOut;
                // 错开进场：兄弟姐妹依次弹出，更有「爆开」感
                g.transition()
                  .delay(d => reduce ? 0 : Math.min(220, (d.sibIdx || 0) * 28))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 560 : 480))
                  .ease(d3.easeCubicOut)
                  .attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition()
                  .delay(d => reduce ? 0 : Math.min(220, (d.sibIdx || 0) * 28))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 640 : 560))
                  .ease(easePop)
                  .attr("r", d => baseSatRadius(d) * (d.isBranch ? 1.08 : 1));
                return g;
              },'''

# CSS block to inject/replace near .sat-node circle
CSS_BOOST = """
    /* —— 百科级节点质感：更大光晕 / 展开描边 / 标签描边 —— */
    .sat-node circle {
      stroke: rgba(255,255,255,0.38);
      stroke-width: 2.2;
      filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.55));
    }
    .sat-node.layer-2 circle {
      stroke-width: 2.5;
      filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.6));
    }
    .sat-node.layer-3 circle {
      stroke: rgba(255,255,255,0.4);
      stroke-width: 1.6;
      filter: drop-shadow(0 0 12px rgba(148, 163, 184, 0.45));
    }
    .sat-node.is-branch circle {
      stroke: #fff !important;
      stroke-width: 3 !important;
      filter: drop-shadow(0 0 22px rgba(245, 158, 11, 0.75)) !important;
    }
    .sat-node.is-leaf circle {
      filter: drop-shadow(0 0 16px rgba(52, 211, 153, 0.65));
    }
    .sat-node.is-hot circle {
      filter: drop-shadow(0 0 24px rgba(255,255,255,0.45)) !important;
    }
    .sat-node text.sat-label {
      paint-order: stroke fill;
      stroke: rgba(5, 8, 20, 0.85);
      stroke-width: 3px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
"""

BASE_R = r'''        function baseSatRadius(d) {
          if (d.isLeaf) return 18;
          if (d.isBranch) return 32;
          if (d.isChapter) return 24;
          if (d.layer === 2) return 30;
          if (d.layer === 3) return 20;
          return 17;
        }'''


def replace_fn(html: str, name: str, new_fn: str) -> str:
    start = html.find(f"        function {name}(")
    if start < 0:
        raise SystemExit(f"missing {name}")
    # find next function at same indent
    nxt = html.find("\n        function ", start + 10)
    if nxt < 0:
        raise SystemExit(f"no next after {name}")
    return html[:start] + new_fn + html[nxt:]


def patch_paint_enter(html: str) -> str:
    # replace enter callback inside paintSatLayer
    start = html.find("          satNodeSel = satNodeG.selectAll(\"g\").data(satData, d => d.learnId)")
    if start < 0:
        return html
    enter_start = html.find("enter => {", start)
    enter_end = html.find("update => update.attr(\"opacity\", 1).classed(\"entering\", false),", start)
    if enter_start < 0 or enter_end < 0:
        print("enter pattern miss")
        return html
    return html[:enter_start] + ENTER + "\n              " + html[enter_end:]


def patch_opacity_kill(html: str) -> str:
    # Remove merge .attr("opacity", 1) that kills enter transition
    old = """            )
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("opacity", 1)
            .attr("class", d => {"""
    new = """            )
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("class", d => {"""
    if old in html:
        html = html.replace(old, new, 1)
    return html


def patch_base_r(html: str) -> str:
    import re
    html2, n = re.subn(
        r"        function baseSatRadius\(d\) \{[\s\S]*?\n        \}",
        BASE_R.rstrip(),
        html,
        count=1,
    )
    return html2 if n else html


def patch_css(html: str) -> str:
    marker = "    .sat-node { cursor: grab; }"
    if "百科级节点质感" in html:
        return html
    if marker in html:
        return html.replace(marker, CSS_BOOST + "\n" + marker, 1)
    return html


def patch_hover_scale(html: str) -> str:
    old = """          satNodeSel.filter(function () { return !d3.select(this).classed("entering"); })
            .select("circle")
            .attr("r", d => {
              if (kgHoverId && d.learnId === kgHoverId) return baseSatRadius(d) * 1.22;
              if (d.kgId === kgDrill.selectedLeafId) return baseSatRadius(d) * 1.08;
              return baseSatRadius(d);
            });"""
    new = """          satNodeSel.filter(function () { return !d3.select(this).classed("entering"); })
            .select("circle")
            .attr("r", d => {
              // 百科 hover：约 1.2 倍
              if (kgHoverId && d.learnId === kgHoverId) return baseSatRadius(d) * 1.2;
              if (d.isBranch) return baseSatRadius(d);
              if (d.kgId === kgDrill.selectedLeafId) return baseSatRadius(d) * 1.1;
              return baseSatRadius(d);
            })
            .attr("stroke", d => d.isBranch ? "#fff" : (d.kgId === kgDrill.selectedLeafId ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.38)"))
            .attr("stroke-width", d => d.isBranch ? 3 : (d.layer === 2 ? 2.5 : 1.6));"""
    if old in html:
        return html.replace(old, new, 1)
    return html


def main():
    for p in FILES:
        if not p.exists():
            print("skip", p)
            continue
        t = p.read_text(encoding="utf-8")
        t = replace_fn(t, "settleSatPositions", SETTLE)
        t = patch_paint_enter(t)
        t = patch_opacity_kill(t)
        t = patch_base_r(t)
        t = patch_css(t)
        t = patch_hover_scale(t)
        # ensure new nodes start near parent via settle, not locked at target in pushFanAt
        t = t.replace(
            """            if (item._kept) {
              item.x = x; item.y = y;
            } else {
              item.x = px; item.y = py;
            }""",
            """            // 位置交给 settleSatPositions 做弹出；此处只钉目标
            item.x = item._kept ? x : (px * 0.42 + x * 0.58);
            item.y = item._kept ? y : (py * 0.42 + y * 0.58);""",
        )
        t = t.replace(
            """                if (l2Node._kept) {
                  l2Node.x = placed.x; l2Node.y = placed.y;
                } else {
                  l2Node.x = hub.x; l2Node.y = hub.y;
                  l2Node.parentX = hub.x; l2Node.parentY = hub.y;
                }""",
            """                if (l2Node._kept) {
                  l2Node.x = placed.x; l2Node.y = placed.y;
                } else {
                  l2Node.x = hub.x * 0.42 + placed.x * 0.58;
                  l2Node.y = hub.y * 0.42 + placed.y * 0.58;
                  l2Node.parentX = hub.x; l2Node.parentY = hub.y;
                }""",
        )
        p.write_text(t, encoding="utf-8")
        ok = all(s in t for s in ["Barnes-Hut", "overshoot(2.05)", "百科级节点质感", "sibIdx || 0) * 28"])
        print(p.name, "OK" if ok else "CHECK", "size", p.stat().st_size)


if __name__ == "__main__":
    main()
