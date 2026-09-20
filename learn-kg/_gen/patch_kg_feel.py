# -*- coding: utf-8 -*-
"""Patch feel: no viewport pop after manual zoom; springier node enter; junior levels on trees."""
from pathlib import Path
import json
import re
import shutil

LEARN_FILES = [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]
PLATFORM_HTML = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")


def assign_level(nid: str, title: str, is_leaf: bool, path: list) -> str:
    """Map node id/path to ? / ?? / ??? for depth filter."""
    p = " / ".join(path or [])
    s = nid or ""

    # SQL
    if s.startswith("SQL.基础查询") or "基础查询" in p:
        return "?"
    if s.startswith("SQL.多表操作") or s.startswith("SQL.聚合分析"):
        return "??"
    if s in ("SQL.数据定义", "SQL.性能优化", "SQL.事务与安全") or any(
        x in s for x in ("数据定义", "性能优化", "事务与安全")
    ):
        return "???"
    if s == "SQL" or s.endswith("-root") and "sql" in s.lower():
        return "?"

    # BI
    if s in ("BI.Tableau.入门准备", "BI.Tableau.数据准备"):
        return "?"
    if "图表制作" in s:
        if any(x in s for x in ("双轴", "热力", "LOD")):
            return "??"
        return "?"
    if "计算.基础计算" in s:
        return "?"
    if "计算.表计算" in s:
        return "??"
    if ".LOD" in s or "计算.LOD" in s:
        return "???"
    if s in ("BI.Tableau.筛选与交互", "BI.Tableau.仪表板"):
        return "??"
    if s in ("BI.Tableau.性能优化", "BI.Tableau.实战案例"):
        return "???"
    if s in ("BI.Power BI", "BI.国产 BI"):
        return "??"
    if s == "BI.Tableau":
        return "?"
    if s == "BI" or (s.endswith("-root") and "bi" in s.lower()):
        return "?"

    return "??"


def patch_levels_in_tree(node, path=None):
    path = (path or []) + [node.get("title", "")]
    nid = node.get("id", "")
    kids = node.get("children") or []
    is_leaf = not kids
    node["level"] = assign_level(nid, node.get("title", ""), is_leaf, path)
    for c in kids:
        patch_levels_in_tree(c, path)
    return node


def sync_kg_trees():
    src_dir = Path(r"D:\cursor\数据学习平台\kg-data")
    targets = [
        Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
        Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
    ]
    for name in ("sql.json", "bi.json"):
        src = src_dir / name
        if not src.exists():
            continue
        data = json.loads(src.read_text(encoding="utf-8"))
        patch_levels_in_tree(data)
        text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        src.write_text(text, encoding="utf-8")
        # also lessons
        lesson = Path(r"D:\cursor\数据学习平台\_gen\lessons") / name
        if lesson.parent.exists():
            lesson.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        for tdir in targets:
            if tdir.exists():
                (tdir / name).write_text(text, encoding="utf-8")
        print("leveled", name)


OLD_REDRAW_SMART = '''          const redrawSmart = () => {
            const topologyChanged = (kgDrill.expandedL2 !== prevL2) || (kgDrill.expandedL3 !== prevL3);
            // 仅拓扑变化时弹开子节点；纯切内容/选中不整图弹开（含手动缩放后）
            redrawKgDrill({ animatePop: topologyChanged });
          };'''

NEW_REDRAW_SMART = '''          const redrawSmart = () => {
            const topologyChanged = (kgDrill.expandedL2 !== prevL2) || (kgDrill.expandedL3 !== prevL3);
            // 手动缩放后：只更新拓扑/内容，禁止整图弹开与镜头 fit
            // 未手动缩放时：拓扑变化才做弹性弹出
            const doPop = topologyChanged && !kgManualZoom;
            redrawKgDrill({ animatePop: doPop });
          };'''

# Soften depth filter for trees that still lack junior marks (belt and suspenders)
OLD_DEPTH = '''        function depthAllows(level) {
          const need = levelRank(level);
          if (depthLevel === "junior") return need <= 1;
          if (depthLevel === "mid") return need <= 2;
          return true;
        }'''

NEW_DEPTH = '''        function depthAllows(level) {
          const need = levelRank(level);
          if (depthLevel === "junior") return need <= 1;
          if (depthLevel === "mid") return need <= 2;
          return true;
        }

        /** 初级下若过滤后整支无可见子节点，回退显示全部，避免「有节点无内容」 */
        function filterKgChildrenSafe(kids) {
          const all = kids || [];
          const filtered = filterKgChildren(all);
          if (depthLevel === "junior" && all.length && !filtered.length) return all;
          return filtered;
        }'''

# Replace filterKgChildren calls in drill layout with Safe version? 
# Actually if we assign levels properly, junior will show ? nodes. Safe fallback is still good.
# But replacing all filterKgChildren might break intentional empty. Only use Safe in redrawKgDrill and openKgSidePanel visible kids.

OLD_FILTER_FN = '''        function filterKgChildren(kids) {
          return (kids || []).filter(c => depthAllows(c.level || "??"));
        }'''

NEW_FILTER_FN = '''        function filterKgChildren(kids) {
          return (kids || []).filter(c => depthAllows(c.level || "?"));
        }

        /** 初级下若过滤后整支无可见子节点，回退显示全部，避免空白 */
        function filterKgChildrenSafe(kids) {
          const all = kids || [];
          const filtered = filterKgChildren(all);
          if (depthLevel === "junior" && all.length && !filtered.length) return all.slice();
          return filtered;
        }'''

# Note: default level "?" instead of "??" means unmarked = junior visible. Good for incomplete trees.

OLD_PANEL_KIDS = '''            const visibleKids = filterKgChildren(kids);'''
NEW_PANEL_KIDS = '''            const visibleKids = filterKgChildrenSafe(kids);'''

# Enhance spring in settle - find overshoot block
OLD_OVERSHOOT = '''            if (!d._kept) {
              // 新节点：贴近父点弹出，初速度更大，先冲过目标再回弹
              const ox = d.tx - px, oy = d.ty - py;
              const olen = Math.hypot(ox, oy) || 1;
              d._restX = d.tx; d._restY = d.ty;
              d.tx = px + (ox / olen) * olen * 1.28;
              d.ty = py + (oy / olen) * olen * 1.28;
              d.x = px * 0.9 + d._restX * 0.1;
              d.y = py * 0.9 + d._restY * 0.1;
              d.vx = (ox / olen) * 34;
              d.vy = (oy / olen) * 34;
            } else {
              // 旧节点保持原位，不跟着整图晃
              d.x = d.tx; d.y = d.ty;
              d.vx = 0; d.vy = 0;
            }'''

NEW_OVERSHOOT = '''            if (!d._kept) {
              // 新节点：从父点弹出，过冲更大、初速更高，回弹更弹
              const ox = d.tx - px, oy = d.ty - py;
              const olen = Math.hypot(ox, oy) || 1;
              d._restX = d.tx; d._restY = d.ty;
              d.tx = px + (ox / olen) * olen * 1.48;
              d.ty = py + (oy / olen) * olen * 1.48;
              d.x = px * 0.96 + d._restX * 0.04;
              d.y = py * 0.96 + d._restY * 0.04;
              d.vx = (ox / olen) * 52;
              d.vy = (oy / olen) * 52;
            } else {
              // 旧节点保持原位，不跟着整图晃
              d.x = d.tx; d.y = d.ty;
              d.vx = 0; d.vy = 0;
            }'''

OLD_EASE = '''                const easePop = (!reduce && typeof d3.easeBackOut === "function")
                  ? d3.easeBackOut.overshoot(3.35)
                  : d3.easeCubicOut;
                // 错开进场 + 更强回弹：兄弟姐妹依次弹出
                g.transition()
                  .delay(d => reduce ? 0 : Math.min(260, (d.sibIdx || 0) * 36))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 820 : 740))
                  .ease(easePop)
                  .attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition()
                  .delay(d => reduce ? 0 : Math.min(260, (d.sibIdx || 0) * 36))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 780 : 700))
                  .ease(easePop)
                  .attr("r", d => baseSatRadius(d) * (d.isBranch ? 1.1 : 1));'''

NEW_EASE = '''                const easePop = (!reduce && typeof d3.easeBackOut === "function")
                  ? d3.easeBackOut.overshoot(4.6)
                  : d3.easeCubicOut;
                // 错开进场 + 更强回弹：兄弟姐妹依次弹出
                g.transition()
                  .delay(d => reduce ? 0 : Math.min(300, (d.sibIdx || 0) * 42))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 920 : 860))
                  .ease(easePop)
                  .attr("opacity", 1)
                  .on("end", function () { d3.select(this).classed("entering", false); });
                g.select("circle").transition()
                  .delay(d => reduce ? 0 : Math.min(300, (d.sibIdx || 0) * 42))
                  .duration(d => reduce ? 0 : (d.layer >= 3 ? 880 : 820))
                  .ease(easePop)
                  .attr("r", d => baseSatRadius(d) * (d.isBranch ? 1.18 : 1.06));'''

# velocityDecay softer early
OLD_VD = '''            .force("link", d3.forceLink(springs).distance(d => d.dist * 1.18).strength(0.18))
            .force("x", d3.forceX(d => d.tx).strength(0.14))
            .force("y", d3.forceY(d => d.ty).strength(0.14))
            .velocityDecay(0.28)
            .alpha(1)
            .alphaDecay(0.022)
            .alphaMin(0.001);'''

NEW_VD = '''            .force("link", d3.forceLink(springs).distance(d => d.dist * 1.22).strength(0.12))
            .force("x", d3.forceX(d => d.tx).strength(0.08))
            .force("y", d3.forceY(d => d.ty).strength(0.08))
            .velocityDecay(0.18)
            .alpha(1)
            .alphaDecay(0.018)
            .alphaMin(0.001);'''

# jumpToKgLesson: don't fit if manual zoom
OLD_JUMP_FIT = '''          setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 100);
          showKgToast("已跳转 · " + node.title);'''
NEW_JUMP_FIT = '''          setTimeout(() => { if (kgDrill.active && !kgManualZoom) fitKgFocusView(360); }, 100);
          showKgToast("已跳转 · " + node.title);'''

OLD_COLLAPSE_FIT = '''          setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 80);'''
NEW_COLLAPSE_FIT = '''          setTimeout(() => { if (kgDrill.active && !kgManualZoom) fitKgFocusView(360); }, 80);'''

# Use Safe in redraw for l2s
REPLACEMENTS_FILTER_USE = [
    ("const l2s = filterKgChildren(tree.children || []);", "const l2s = filterKgChildrenSafe(tree.children || []);"),
    ("const l3All = filterKgChildren(c.children || []);", "const l3All = filterKgChildrenSafe(c.children || []);"),
    ("const l4s = filterKgChildren(c3.children || []);", "const l4s = filterKgChildrenSafe(c3.children || []);"),
    ("const kids = filterKgChildren(kgNodeKids(kg));", "const kids = filterKgChildrenSafe(kgNodeKids(kg));"),
    ("const canExpand = filterKgChildren(rawKids).length > 0;", "const canExpand = filterKgChildrenSafe(rawKids).length > 0;"),
]


def patch_learn(path: Path):
    t = path.read_text(encoding="utf-8")
    n = 0
    pairs = [
        (OLD_REDRAW_SMART, NEW_REDRAW_SMART),
        (OLD_FILTER_FN, NEW_FILTER_FN),
        (OLD_PANEL_KIDS, NEW_PANEL_KIDS),
        (OLD_OVERSHOOT, NEW_OVERSHOOT),
        (OLD_EASE, NEW_EASE),
        (OLD_VD, NEW_VD),
        (OLD_JUMP_FIT, NEW_JUMP_FIT),
        (OLD_COLLAPSE_FIT, NEW_COLLAPSE_FIT),
    ]
    for a, b in pairs:
        if a in t:
            t = t.replace(a, b, 1)
            n += 1
        else:
            print("  MISS", a[:48].replace("\n", " "))
    for a, b in REPLACEMENTS_FILTER_USE:
        c = t.count(a)
        if c:
            t = t.replace(a, b)
            n += c
    path.write_text(t, encoding="utf-8")
    print(path.name, "replacements", n)


def patch_build_script():
    p = Path(r"D:\cursor\数据学习平台\_gen\tutorials_v2\build_tutorials.py")
    t = p.read_text(encoding="utf-8")
    old = '''        node = {
            "id": nid,
            "title": n["title"],
            "level": "??",
            "content": content,
            "children": kids,
        }'''
    new = '''        node = {
            "id": nid,
            "title": n["title"],
            "level": _lesson_level_for(nid, n.get("path") or []),
            "content": content,
            "children": kids,
        }'''
    helper = '''
def _lesson_level_for(nid: str, path) -> str:
    """Assign ? / ?? / ??? so 初级/中级/高级深度过滤有内容可学."""
    s = nid or ""
    if s.startswith("SQL.基础查询") or s == "SQL":
        return "?"
    if s.startswith("SQL.多表操作") or s.startswith("SQL.聚合分析"):
        return "??"
    if s in ("SQL.数据定义", "SQL.性能优化", "SQL.事务与安全"):
        return "???"
    if s in ("BI.Tableau.入门准备", "BI.Tableau.数据准备", "BI.Tableau") or s == "BI":
        return "?"
    if "图表制作" in s:
        return "?" if not any(x in s for x in ("双轴", "热力")) else "??"
    if "计算.基础计算" in s:
        return "?"
    if "计算.表计算" in s or s in ("BI.Tableau.筛选与交互", "BI.Tableau.仪表板", "BI.Power BI", "BI.国产 BI"):
        return "??"
    if ".LOD" in s or s in ("BI.Tableau.性能优化", "BI.Tableau.实战案例"):
        return "???"
    if "计算" in s and "BI.Tableau" in s:
        return "??"
    return "??"

'''
    if "_lesson_level_for" not in t:
        # insert before tree_to_lesson_json
        t = t.replace("def tree_to_lesson_json(", helper + "def tree_to_lesson_json(", 1)
    if old in t:
        t = t.replace(old, new, 1)
        p.write_text(t, encoding="utf-8")
        print("build_tutorials.py leveled")
    else:
        print("build_tutorials.py already patched or miss")


def main():
    sync_kg_trees()
    patch_build_script()
    for f in LEARN_FILES:
        if f.exists():
            patch_learn(f)
        else:
            print("missing", f)


if __name__ == "__main__":
    main()
