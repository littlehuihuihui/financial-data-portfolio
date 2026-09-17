# -*- coding: utf-8 -*-
"""Optimize KG load/runtime: externalize trees + patch perf hotspots."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台")
LESSONS = ROOT / "_gen" / "lessons"
HTML = ROOT / "数据知识图谱.html"
ORDER = ["sql", "python", "database", "ml", "etl", "dwh", "bi"]
VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "database": "DATABASE_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}

OUT_DIRS = [
    ROOT / "kg-data",
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
]

HTML_TARGETS = [
    HTML,
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

TITLE_BY_PATH = {
    str(Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html")): "数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS",
    str(Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html")): "数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS",
    str(Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html")): "数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS",
}


def extract_json_object(html: str, start_idx: int):
    i = html.find("{", start_idx)
    if i < 0:
        raise SystemExit("no JSON object start")
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(html)):
        ch = html[j]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return html[i : j + 1], j + 1
    raise SystemExit("unbalanced JSON object")


def export_kg_data():
    trees = {}
    for k in ORDER:
        p = LESSONS / f"{k}.json"
        trees[k] = json.loads(p.read_text(encoding="utf-8"))
    for out in OUT_DIRS:
        out.mkdir(parents=True, exist_ok=True)
        for k, tree in trees.items():
            (out / f"{k}.json").write_text(
                json.dumps(tree, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
        meta = {k: {"id": trees[k].get("id"), "title": trees[k].get("title")} for k in ORDER}
        (out / "index.json").write_text(
            json.dumps({"hubs": ORDER, "meta": meta}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        print("exported", out)
    return trees


LAZY_BLOCK = r'''
    /* —— 课树懒加载：首屏不内联 7 棵大树，进入学科时再 fetch —— */
    const KG_TREE_FILES = {
      sql: "kg-data/sql.json",
      python: "kg-data/python.json",
      database: "kg-data/database.json",
      ml: "kg-data/ml.json",
      etl: "kg-data/etl.json",
      dwh: "kg-data/dwh.json",
      bi: "kg-data/bi.json"
    };
    const KG_TREES = {
      sql: null,
      python: null,
      database: null,
      ml: null,
      etl: null,
      dwh: null,
      bi: null
    };
    const KG_TREE_LOADING = {};
    function hasKgCurriculum(hubId) {
      return !!(hubId && (KG_TREES[hubId] || KG_TREE_FILES[hubId]));
    }
    async function ensureKgTree(hubId) {
      if (!hubId) return null;
      if (KG_TREES[hubId]) return KG_TREES[hubId];
      if (KG_TREE_LOADING[hubId]) return KG_TREE_LOADING[hubId];
      const url = KG_TREE_FILES[hubId];
      if (!url) return null;
      KG_TREE_LOADING[hubId] = (async () => {
        const res = await fetch(url, { cache: "force-cache" });
        if (!res.ok) throw new Error("HTTP " + res.status + " " + url);
        const tree = await res.json();
        KG_TREES[hubId] = tree;
        delete KG_TREE_LOADING[hubId];
        return tree;
      })();
      try {
        return await KG_TREE_LOADING[hubId];
      } catch (err) {
        delete KG_TREE_LOADING[hubId];
        throw err;
      }
    }
    function prefetchKgTreesIdle() {
      const run = () => {
        Object.keys(KG_TREE_FILES).forEach((hubId, i) => {
          setTimeout(() => { ensureKgTree(hubId).catch(() => {}); }, 400 + i * 220);
        });
      };
      if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 2500 });
      else setTimeout(run, 1200);
    }
'''.strip(
    "\n"
)

PERF_HELPER = r'''
    /* —— 性能开关：减粒子 / 停死循环物理 / 节流重绘 —— */
    const KG_PERF = {
      reduceMotion: !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      lowPower: false
    };
    try {
      KG_PERF.lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    } catch (_) {}
    function kgAnimMs(base) {
      if (KG_PERF.reduceMotion) return 0;
      if (KG_PERF.lowPower) return Math.round(base * 0.45);
      return base;
    }
'''.strip(
    "\n"
)


def replace_kg_block(html: str) -> str:
    si = html.find("    const SQL_KNOWLEDGE_TREE = ")
    if si < 0:
        # already lazy?
        if "ensureKgTree" in html and "KG_TREE_FILES" in html:
            return html
        raise SystemExit("SQL_KNOWLEDGE_TREE not found")
    ki = html.find("    const KG_TREES = ")
    if ki < 0:
        raise SystemExit("KG_TREES not found")
    _, kg_end = extract_json_object(html, ki + len("    const KG_TREES = "))
    if kg_end < len(html) and html[kg_end] == ";":
        kg_end += 1
    # drop old const VAR trees entirely
    return html[:si] + LAZY_BLOCK + "\n\n" + html[kg_end:]


def patch_runtime(html: str) -> str:
    if "const KG_PERF =" not in html:
        # insert after HOME_HERO or early in script after graphEl
        anchor = "    const graphEl = document.getElementById(\"graph\");"
        if anchor in html:
            html = html.replace(anchor, PERF_HELPER + "\n\n" + anchor, 1)
        else:
            html = html.replace("<script>", "<script>\n" + PERF_HELPER + "\n", 1)

    # particles 40 -> 12 (or 0 if reduce)
    html = html.replace(
        """    (function spawnParticles() {
      const box = document.getElementById("kgParticles");
      if (!box) return;
      for (let i = 0; i < 40; i++) {""",
        """    (function spawnParticles() {
      const box = document.getElementById("kgParticles");
      if (!box) return;
      const n = (typeof KG_PERF !== "undefined" && (KG_PERF.reduceMotion || KG_PERF.lowPower)) ? 0 : 12;
      for (let i = 0; i < n; i++) {""",
    )

    # pulse interval 55 -> 120, smaller DOM churn
    html = html.replace(
        """          kgPulseTimer = setInterval(() => {
            if (!kgDrill.active || typeof node === "undefined" || !node) return;
            breathe = (breathe + 1) % 48;
            const t = Math.sin((breathe / 48) * Math.PI * 2);
            const r = hubFocusRadius() + t * 2.2;
            const blur = 16 + t * 6;
            node.filter(d => d.id === kgDrill.hubId).select("circle")
              .attr("r", r)
              .style("filter", `drop-shadow(0 0 ${blur}px rgba(168, 85, 247, 0.65))`);
          }, 55);""",
        """          if (typeof KG_PERF !== "undefined" && KG_PERF.reduceMotion) return;
          kgPulseTimer = setInterval(() => {
            if (!kgDrill.active || typeof node === "undefined" || !node) return;
            breathe = (breathe + 1) % 48;
            const t = Math.sin((breathe / 48) * Math.PI * 2);
            const r = hubFocusRadius() + t * 1.4;
            const blur = 14 + t * 4;
            node.filter(d => d.id === kgDrill.hubId).select("circle")
              .attr("r", r)
              .style("filter", `drop-shadow(0 0 ${blur}px rgba(168, 85, 247, 0.55))`);
          }, 120);""",
    )

    # stop endless force sim
    old_sim = """            if (ticks === 50) {
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
          }"""
    new_sim = """            if (ticks === 36) {
              kgLiveSim.force("charge", d3.forceManyBody().strength(-8));
              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.08));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.08));
              kgLiveSim.force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.22));
              kgLiveSim.alphaDecay(0.05);
              kgLiveSim.alphaTarget(0);
            }
            // 稳定后停物理，避免持续 tick 卡顿
            if (ticks > 90 || (kgLiveSim.alpha() < 0.02 && ticks > 40)) {
              if (typeof updateSatSparks === "function") updateSatSparks();
              kgLiveSim.stop();
            }
          });
          if (!animate) {
            for (let i = 0; i < 28; i++) kgLiveSim.tick();
            kgLiveSim.alphaTarget(0).stop();
          }"""
    if old_sim in html:
        html = html.replace(old_sim, new_sim)

    # enter: single fit + async tree load wrapper around existing enterKgDrill
    # Patch enterKgDrill signature body start
    old_enter = """        function enterKgDrill(hubId) {
          const tree = KG_TREES[hubId];
          const hub = nodeById[hubId];
          if (!tree || !hub) return;"""
    new_enter = """        async function enterKgDrill(hubId) {
          const hub = nodeById[hubId];
          if (!hub) return;
          if (!KG_TREES[hubId]) {
            if (typeof showKgToast === "function") showKgToast("正在加载「" + (hub.name || hubId) + "」课程…");
            try {
              await ensureKgTree(hubId);
            } catch (err) {
              console.error(err);
              if (typeof showKgToast === "function") showKgToast("课程加载失败，请检查 kg-data 是否可访问");
              return;
            }
          }
          const tree = KG_TREES[hubId];
          if (!tree) return;"""
    if old_enter in html:
        html = html.replace(old_enter, new_enter)

    # double fit -> single
    html = html.replace(
        """            setTimeout(() => { if (kgDrill.active) fitKgFocusView(480); }, 120);
            setTimeout(() => { if (kgDrill.active) fitKgFocusView(360); }, 520);""",
        """            setTimeout(() => { if (kgDrill.active) fitKgFocusView(kgAnimMs(320)); }, 80);""",
    )

    # hasKgCurriculum for radius / tip checks that used KG_TREES[d.id]
    html = html.replace(
        "if (KG_TREES[d.id] || d.catalog) return 32;",
        "if ((typeof hasKgCurriculum === 'function' ? hasKgCurriculum(d.id) : KG_TREES[d.id]) || d.catalog) return 32;",
    )
    html = html.replace(
        "if (KG_TREES[d.id] || d.catalog) return 32;",
        "if ((typeof hasKgCurriculum === 'function' ? hasKgCurriculum(d.id) : KG_TREES[d.id]) || d.catalog) return 32;",
    )
    # more patterns
    for pat, rep in [
        (
            "if (KG_TREES && KG_TREES[d.id]) return \"点击学教程\";",
            "if (KG_TREES && (typeof hasKgCurriculum === 'function' ? hasKgCurriculum(d.id) : KG_TREES[d.id])) return \"点击学教程\";",
        ),
        (
            "if (KG_TREES[d.id]) return \"点击学教程\";",
            "if ((typeof hasKgCurriculum === 'function' ? hasKgCurriculum(d.id) : KG_TREES[d.id])) return \"点击学教程\";",
        ),
        (
            "if (typeof KG_TREES !== \"undefined\" && KG_TREES[hubId] && typeof enterKgDrill === \"function\") {",
            "if (typeof KG_TREES !== \"undefined\" && (typeof hasKgCurriculum === 'function' ? hasKgCurriculum(hubId) : KG_TREES[hubId]) && typeof enterKgDrill === \"function\") {",
        ),
        (
            "if (!KG_TREES[hub]) {",
            "if (!(typeof hasKgCurriculum === 'function' ? hasKgCurriculum(hub) : KG_TREES[hub])) {",
        ),
        (
            "if (KG_TREES[d.id]) {",
            "if ((typeof hasKgCurriculum === 'function' ? hasKgCurriculum(d.id) : KG_TREES[d.id])) {",
        ),
        (
            "if (typeof KG_TREES !== \"undefined\" && hub && KG_TREES[hub.id]) {",
            "if (typeof KG_TREES !== \"undefined\" && hub && (typeof hasKgCurriculum === 'function' ? hasKgCurriculum(hub.id) : KG_TREES[hub.id])) {",
        ),
        (
            "if (typeof KG_TREES !== \"undefined\" && KG_TREES[hub.id] && typeof enterKgDrill === \"function\") {",
            "if (typeof KG_TREES !== \"undefined\" && (typeof hasKgCurriculum === 'function' ? hasKgCurriculum(hub.id) : KG_TREES[hub.id]) && typeof enterKgDrill === \"function\") {",
        ),
    ]:
        html = html.replace(pat, rep)

    # debounce resize
    html = html.replace(
        '    window.addEventListener("resize", () => relayout());',
        '''    let __kgResizeTimer = 0;
    window.addEventListener("resize", () => {
      clearTimeout(__kgResizeTimer);
      __kgResizeTimer = setTimeout(() => { try { relayout(); } catch (_) {} }, 120);
    });''',
    )

    # prefetch idle near end
    if "prefetchKgTreesIdle()" not in html:
        html = html.replace(
            "    applyLinkVisibility();\n",
            "    applyLinkVisibility();\n    if (typeof prefetchKgTreesIdle === \"function\") prefetchKgTreesIdle();\n",
            1,
        )

    # shorten sat enter transitions when many / low power
    html = html.replace(
        ".call(s => s.transition().duration(520).ease(d3.easeCubicOut).attr(\"opacity\", 1)),",
        ".call(s => s.transition().duration(kgAnimMs(220)).ease(d3.easeCubicOut).attr(\"opacity\", 1)),",
    )
    html = html.replace(
        "g.transition().duration(d => d.layer >= 3 ? 520 : 380).ease(d3.easeCubicOut).attr(\"opacity\", 1)",
        "g.transition().duration(d => kgAnimMs(d.layer >= 3 ? 240 : 180)).ease(d3.easeCubicOut).attr(\"opacity\", 1)",
    )
    html = html.replace(
        "g.select(\"circle\").transition().duration(d => d.layer >= 3 ? 580 : 460).ease(d3.easeBackOut.overshoot(1.55))",
        "g.select(\"circle\").transition().duration(d => kgAnimMs(d.layer >= 3 ? 260 : 200)).ease(d3.easeCubicOut)",
    )

    # sparks: fewer
    html = html.replace(
        "const sparks = reduce ? [] : items.filter(d => d.layer === 2 || (d.layer === 3 && d.sibIdx < 2)).slice(0, 16);",
        "const sparks = (reduce || (typeof KG_PERF !== 'undefined' && KG_PERF.lowPower)) ? [] : items.filter(d => d.layer === 2).slice(0, 6);",
    )

    return html


def patch_file(path: Path, base_html: str) -> None:
    html = base_html
    title = TITLE_BY_PATH.get(str(path))
    if title:
        html = re.sub(r"<title>[^<]*</title>", f"<title>{title}</title>", html, count=1)
    path.write_text(html, encoding="utf-8")
    t = path.read_text(encoding="utf-8")
    ok = (
        "ensureKgTree" in t
        and "KG_TREE_FILES" in t
        and "const SQL_KNOWLEDGE_TREE" not in t
        and "kgLiveSim.stop()" in t
    )
    print(path.name, "OK" if ok else "CHECK", "size_mb", round(path.stat().st_size / 1024 / 1024, 2))


def main():
    export_kg_data()
    html = HTML.read_text(encoding="utf-8")
    # if already lazy, still re-read from current after replace attempt
    if "const SQL_KNOWLEDGE_TREE = " in html:
        html = replace_kg_block(html)
    html = patch_runtime(html)
    # write source first
    HTML.write_text(html, encoding="utf-8")
    print("patched source", HTML, "size_mb", round(HTML.stat().st_size / 1024 / 1024, 2))

    src = HTML.read_text(encoding="utf-8")
    for p in HTML_TARGETS:
        if p.resolve() == HTML.resolve():
            continue
        if not p.exists():
            print("skip missing", p)
            continue
        patch_file(p, src)

    # verify kg-data next to learn
    learn_data = Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data\sql.json")
    print("portfolio sql.json", learn_data.exists(), learn_data.stat().st_size if learn_data.exists() else 0)


if __name__ == "__main__":
    main()
