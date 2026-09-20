# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

def write_embed(hub_id, data, out):
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    out.write_text(
        'window.__KG_EMBEDDED = window.__KG_EMBEDDED || {};\n'
        'window.__KG_EMBEDDED["%s"]=%s\n' % (hub_id, raw),
        encoding="utf-8",
    )

sql = json.loads(Path(r"D:\cursor\数据学习平台\kg-data\sql.json").read_text(encoding="utf-8"))
bi = json.loads(Path(r"D:\cursor\数据学习平台\kg-data\bi.json").read_text(encoding="utf-8"))

bases = [
    Path(r"D:\cursor\数据学习平台\kg-data"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
]

for base in bases:
    if not base.exists():
        continue
    compact_sql = json.dumps(sql, ensure_ascii=False, separators=(",", ":"))
    compact_bi = json.dumps(bi, ensure_ascii=False, separators=(",", ":"))
    (base / "sql.json").write_text(compact_sql, encoding="utf-8")
    (base / "bi.json").write_text(compact_bi, encoding="utf-8")
    (base / "hub-query.json").write_text(compact_sql, encoding="utf-8")
    (base / "hub-viz.json").write_text(compact_bi, encoding="utf-8")
    write_embed("sql", sql, base / "embed-sql.js")
    write_embed("bi", bi, base / "embed-bi.js")
    print("synced", base)

for lp in [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]:
    t = lp.read_text(encoding="utf-8")
    t2 = re.sub(r'const KG_DATA_VER = "[^"]+"', 'const KG_DATA_VER = "20260920b"', t, count=1)
    lp.write_text(t2, encoding="utf-8")
    print(lp.name, "ver bumped", "20260920b" in t2)

# quick check embed level
emb = (Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data") / "embed-sql.js").read_text(encoding="utf-8")
print("embed has junior", '"level":"?"' in emb and "SQL.基础查询.SELECT" in emb)
