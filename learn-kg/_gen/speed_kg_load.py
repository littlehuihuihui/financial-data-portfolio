# -*- coding: utf-8 -*-
"""Speed KG: drop blocking embeds, cache fetches, skip long force sim, no double redraw."""
from pathlib import Path

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

EMBEDS = """  <script src="kg-data/embed-sql.js"></script>
  <script src="kg-data/embed-python.js"></script>
  <script src="kg-data/embed-database.js"></script>
  <script src="kg-data/embed-ml.js"></script>
  <script src="kg-data/embed-etl.js"></script>
  <script src="kg-data/embed-dwh.js"></script>
  <script src="kg-data/embed-bi.js"></script>
"""

OLD_PREFETCH = '''    function prefetchKgTreesIdle() {
      const run = () => {
        Object.keys(KG_TREE_FILES).forEach((hubId, i) => {
          setTimeout(() => { ensureKgTree(hubId).catch(() => {}); }, 400 + i * 220);
        });
      };
      if (typeof requestIdleCallback === "function") requestIdleCallback(run, { timeout: 2500 });
      else setTimeout(run, 1200);
    }'''

NEW_PREFETCH = '''    function prefetchKgTreesIdle() {
      const ids = Object.keys(KG_TREE_FILES);
      let i = 0;
      const schedule = () => {
        if (i >= ids.length) return;
        const go = () => {
          if (typeof kgDrill !== "undefined" && kgDrill && kgDrill.active) {
            setTimeout(schedule, 1200);
            return;
          }
          const hubId = ids[i++];
          ensureKgTree(hubId).catch(() => {}).then(() => schedule());
        };
        if (typeof requestIdleCallback === "function") requestIdleCallback(go, { timeout: 1800 });
        else setTimeout(go, 700);
      };
      setTimeout(schedule, 900);
    }'''

OLD_FETCH = '''          let res = await fetch(u, { cache: "no-cache" });
          if (!res.ok) res = await fetch(u, { cache: "reload" });'''

NEW_FETCH = '''          let res = await fetch(u);
          if (!res.ok) res = await fetch(u, { cache: "reload" });'''

OLD_SIM_GATE = '''          paint();
          if (!animate || reduce || typeof d3 === "undefined" || !d3.forceSimulation) return items;'''

NEW_SIM_GATE = '''          // 坐标已按等长半径钉死，跳过长力模拟（每帧重绘全部连线是卡顿主因）
          items.forEach(d => { d.x = d.tx; d.y = d.ty; d.vx = 0; d.vy = 0; });
          paint();
          return items;
          if (!animate || reduce || typeof d3 === "undefined" || !d3.forceSimulation) return items;'''

OLD_ENTER = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            redrawKgDrill();
            updateKgDrillHint();'''

NEW_ENTER = '''          const finishEnter = () => {
            if (typeof relayout === "function") relayout();
            updateKgDrillHint();'''

OLD_RELAYOUT_END = '''    applyLinkVisibility();
    syncLearnedUI();
    tick();
    relayout();'''

NEW_RELAYOUT_END = '''    applyLinkVisibility();
    syncLearnedUI();
    tick();
    relayout();
    if (typeof prefetchKgTreesIdle === "function") prefetchKgTreesIdle();'''


def patch(path: Path):
    t = path.read_text(encoding="utf-8")
    n = 0
    if EMBEDS in t:
        t = t.replace(EMBEDS, "", 1)
        n += 1
    else:
        print(path.name, "embeds missing")
    for a, b in (
        (OLD_PREFETCH, NEW_PREFETCH),
        (OLD_FETCH, NEW_FETCH),
        (OLD_SIM_GATE, NEW_SIM_GATE),
        (OLD_ENTER, NEW_ENTER),
        (OLD_RELAYOUT_END, NEW_RELAYOUT_END),
    ):
        if a in t:
            t = t.replace(a, b, 1)
            n += 1
        else:
            print(path.name, "MISS", a[:40].replace("\n", " "))
    t = t.replace('const KG_DATA_VER = "20260918a"', 'const KG_DATA_VER = "20260921c"', 1)
    t = t.replace('const KG_DATA_VER = "20260920b"', 'const KG_DATA_VER = "20260921c"', 1)
    path.write_text(t, encoding="utf-8")
    print(path.name, "ok", n)


if __name__ == "__main__":
    for f in FILES:
        patch(f)
