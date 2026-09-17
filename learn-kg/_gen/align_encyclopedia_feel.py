# -*- coding: utf-8 -*-
"""Encyclopedia feel: click-to-open panel + elastic node pop."""
from pathlib import Path

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

OLD_FINISH = """          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            // 强制卫星可见（防止进场 attr 被打断）
            if (satNodeSel) satNodeSel.attr("opacity", 1).classed("entering", false);
            if (typeof openKgHubOverview === "function") openKgHubOverview();
            else if (typeof showKgEmptyPanel === "function") showKgEmptyPanel();
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(kgAnimMs(320)); }, 80);
          };"""

NEW_FINISH = """          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();
            syncKgHubSize();
            // 百科手感：进场不自动弹右侧内容，等用户点击节点
            kgPanelCollapsed = true;
            document.body.classList.add("is-panel-collapsed");
            closePanelSoft({ hard: true });
            const panelBtn = document.getElementById("kgTogglePanel");
            if (panelBtn) {
              panelBtn.textContent = "«";
              panelBtn.title = "展开右侧详情";
            }
            if (typeof showKgToast === "function") showKgToast("点击节点展开 / 查看内容");
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(kgAnimMs(420)); }, 100);
          };"""

# Also fix enter: start with panel collapsed intent
OLD_PANEL_FLAG = """          kgPanelCollapsed = false;
          document.body.classList.toggle("is-side-collapsed", kgSideCollapsed);
          document.body.classList.remove("is-panel-collapsed");
          document.body.classList.remove("home-hero");"""

NEW_PANEL_FLAG = """          kgPanelCollapsed = true;
          document.body.classList.toggle("is-side-collapsed", kgSideCollapsed);
          document.body.classList.add("is-panel-collapsed");
          document.body.classList.remove("home-hero");"""

OLD_ENTER_COMMENT = """          // 进场先软关旧面板；finishEnter 再打开学科总览（避免空白/总览跳闪）
          closePanelSoft({ hard: true });"""

NEW_ENTER_COMMENT = """          // 进场关闭面板：百科同款「先看图，点了再出内容」
          closePanelSoft({ hard: true });"""

OLD_SETTLE = None  # replace whole function by marker

SETTLE_FN = r'''        function settleSatPositions(items, hub, animate) {
          if (!items.length) return items;
          stopKgLiveSim();
          const byId = new Map(items.map(d => [d.learnId, d]));
          items.forEach(d => {
            if (d.tx == null) d.tx = d.x;
            if (d.ty == null) d.ty = d.y;
            d._r = baseSatRadius(d);
            // 新弹出节点：从父点弹出再弹性落到目标（百科弹簧手感）
            if (!d._kept && d.parentX != null && animate) {
              d.x = d.parentX;
              d.y = d.parentY;
              d.vx = 0;
              d.vy = 0;
            } else if (!animate) {
              d.x = d.tx;
              d.y = d.ty;
            }
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
            if (typeof updateSatSparks === "function") updateSatSparks();
          };
          paint();
          if (typeof d3 === "undefined" || !d3.forceSimulation) return items;
          if (!animate) return items;

          // 对齐行业百科 barnesHut：先强弹，再软阻尼
          const springs = items
            .filter(d => d.parentId && byId.has(d.parentId))
            .map(d => {
              const p = byId.get(d.parentId);
              const px = p.tx != null ? p.tx : p.x;
              const py = p.ty != null ? p.ty : p.y;
              return {
                source: p,
                target: d,
                dist: Math.max(80, Math.hypot(d.tx - px, d.ty - py) * 0.92)
              };
            });

          kgLiveSim = d3.forceSimulation(items)
            .force("charge", d3.forceManyBody().strength(d => d.layer === 2 ? -420 : -160))
            .force("collide", d3.forceCollide().radius(d => (d._r || 20) + (d.layer === 2 ? 14 : 10)).strength(0.85).iterations(2))
            .force("x", d3.forceX(d => d.tx).strength(0.18))
            .force("y", d3.forceY(d => d.ty).strength(0.18))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.35))
            .velocityDecay(0.38)
            .alpha(1)
            .alphaDecay(0.022)
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
              // 软约束：别砸进中心核
              const dx = d.x - hub.x, dy = d.y - hub.y;
              const dist = Math.hypot(dx, dy) || 1;
              const minR = d.layer === 2 ? 95 : 70;
              if (dist < minR) {
                d.x = hub.x + (dx / dist) * minR;
                d.y = hub.y + (dy / dist) * minR;
              }
            });
            paint();
            // 阶段切换：强弹 → 软阻尼（像百科 stabilizationIterationsDone）
            if (ticks === 42) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-80));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.08));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.08));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.16));
              kgLiveSim.velocityDecay(0.55);
              kgLiveSim.alphaDecay(0.04);
              kgLiveSim.alphaTarget(0.02);
            }
            if (ticks > 110) {
              kgLiveSim.alphaTarget(0);
              if (kgLiveSim.alpha() < 0.015) kgLiveSim.stop();
            }
          });
          return items;
        }
'''

OLD_ENTER_NODES = """              enter => {
                const g = enter.append("g").attr("class", "sat-node entering").attr("opacity", 0);
                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-check");
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);
                g.transition().duration(d => kgAnimMs(d.layer >= 3 ? 240 : 180)).ease(d3.easeCubicOut).attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(d => kgAnimMs(d.layer >= 3 ? 260 : 200)).ease(d3.easeCubicOut)
                  .attr("r", d => baseSatRadius(d));
                return g;
              },"""

NEW_ENTER_NODES = """              enter => {
                const g = enter.append("g").attr("class", "sat-node entering").attr("opacity", 0);
                g.append("circle").attr("r", 0);
                g.append("text").attr("class", "sat-check");
                g.append("text").attr("class", "sat-label");
                g.append("text").attr("class", "sat-sub").attr("dy", 22);
                // 百科手感：淡入 + 半径回弹 overshoot
                const easePop = (typeof d3.easeBackOut === "function")
                  ? d3.easeBackOut.overshoot(1.65)
                  : d3.easeCubicOut;
                g.transition().duration(d => {
                    if (typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion) return 0;
                    return d.layer >= 3 ? 520 : 420;
                  }).ease(d3.easeCubicOut).attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition().duration(d => {
                    if (typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion) return 0;
                    return d.layer >= 3 ? 580 : 520;
                  }).ease(easePop)
                  .attr("r", d => baseSatRadius(d));
                return g;
              },"""

OLD_LINK_ENTER = """                .attr("opacity", 0)
                .call(s => s.transition().duration(kgAnimMs(220)).ease(d3.easeCubicOut).attr("opacity", 1)),"""

NEW_LINK_ENTER = """                .attr("opacity", 0)
                .call(s => s.transition().duration(d => (typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion) ? 0 : 380).ease(d3.easeCubicOut).attr("opacity", 1)),"""

# showKgEmptyPanel should NOT auto open overview when soft-closing after click intent
OLD_EMPTY = """        function showKgEmptyPanel() {
          if (!kgDrill.active) return;
          // Prefer hub overview content over blank "选择知识点" shell
          if (typeof openKgHubOverview === "function" && openKgHubOverview()) return;"""

NEW_EMPTY = """        function showKgEmptyPanel() {
          if (!kgDrill.active) return;
          // 百科手感：空态引导即可，不自动灌总览正文"""

# collapse to L1 - don't force overview
OLD_COLLAPSE = """          redrawKgDrill();
          if (typeof openKgHubOverview === "function") openKgHubOverview();
          else showKgEmptyPanel();
          updateKgDrillHint();"""

NEW_COLLAPSE = """          redrawKgDrill();
          // 收起后保持当前选中节点内容；无选中则空态
          if (kgDrill.selectedLeafId) {
            const cur = findKgNode(kgDrill.selectedLeafId);
            if (cur && typeof openKgSidePanel === "function") openKgSidePanel(cur, "chapter");
            else showKgEmptyPanel();
          } else {
            showKgEmptyPanel();
          }
          updateKgDrillHint();"""

# openKgSidePanel should uncollapse panel when user clicks content
# already sets kgPanelCollapsed = false - verify exists


def replace_settle(html: str) -> str:
    start = html.find("        function settleSatPositions(items, hub, animate) {")
    if start < 0:
        raise SystemExit("settle not found")
    end = html.find("\n        function baseSatRadius(", start)
    if end < 0:
        end = html.find("\n        function updateSatSparks(", start)
    if end < 0:
        raise SystemExit("settle end not found")
    return html[:start] + SETTLE_FN + html[end:]


def patch(path: Path) -> None:
    t = path.read_text(encoding="utf-8")
    n = 0
    for old, new in [
        (OLD_FINISH, NEW_FINISH),
        (OLD_PANEL_FLAG, NEW_PANEL_FLAG),
        (OLD_ENTER_COMMENT, NEW_ENTER_COMMENT),
        (OLD_ENTER_NODES, NEW_ENTER_NODES),
        (OLD_LINK_ENTER, NEW_LINK_ENTER),
        (OLD_EMPTY, NEW_EMPTY),
        (OLD_COLLAPSE, NEW_COLLAPSE),
    ]:
        if old in t:
            t = t.replace(old, new)
            n += 1
        else:
            print(path.name, "MISS one pattern")

    t2 = replace_settle(t)
    if t2 != t:
        t = t2
        n += 1

    # Ensure openKgSidePanel expands panel (already may be there)
    if "kgPanelCollapsed = false;\n          document.body.classList.remove(\"is-panel-collapsed\");" not in t:
        needle = "          panel.classList.add(\"open\");\n          panel.setAttribute(\"aria-hidden\", \"false\");"
        insert = """          panel.classList.add("open");
          panel.setAttribute("aria-hidden", "false");
          kgPanelCollapsed = false;
          document.body.classList.remove("is-panel-collapsed");
          {
            const panelBtn = document.getElementById("kgTogglePanel");
            if (panelBtn) { panelBtn.textContent = "»"; panelBtn.title = "收起右侧详情"; }
          }"""
        if needle in t and "kgPanelCollapsed = false;\n          document.body.classList.remove(\"is-panel-collapsed\");\n          {\n            const panelBtn = document.getElementById(\"kgTogglePanel\");" not in t:
            # careful if already has expand block after open
            pass

    path.write_text(t, encoding="utf-8")
    ok = (
        "点击节点展开" in t
        and "easeBackOut" in t
        and "alphaTarget(0.02)" in t
        and "Prefer hub overview" not in t
    )
    print(path.name, "n", n, "ok", ok)


def main():
    for p in FILES:
        if p.exists():
            patch(p)


if __name__ == "__main__":
    main()
