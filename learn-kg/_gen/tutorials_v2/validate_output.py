# -*- coding: utf-8 -*-
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
d = json.loads((ROOT / "tutorials_bi_sql_v2.json").read_text(encoding="utf-8"))
pages = d["tutorials"]["pages"]

assert all(p["tutorial_id"] == p["node_id"] for p in pages)
assert set(d["graph_index"]["bi_leaves"]) == {
    p["tutorial_id"] for p in pages if p["domain_id"] == "BI"
}
assert set(d["graph_index"]["sql_leaves"]) == {
    p["tutorial_id"] for p in pages if p["domain_id"] == "SQL"
}
assert all(
    any(s.get("type") == "exercise" for s in p["content"]["sections"]) for p in pages
)
assert all("learning_goal" in p["content"] for p in pages)
assert all("prev" in p["navigation"] and "next" in p["navigation"] for p in pages)

charts = [
    p
    for p in pages
    if p["tutorial_id"].startswith("BI.Tableau.图表制作.")
    and p["tutorial_id"].count(".") == 3
]
assert charts and all(
    any(s.get("type") == "steps" for s in p["content"]["sections"]) for p in charts
)

lod = [p for p in pages if ".LOD" in p["tutorial_id"]]
assert lod

# round-trip parse
json.loads(json.dumps(d, ensure_ascii=False))

print("VALIDATE OK")
print("total", len(pages), "charts", len(charts), "lod", len(lod))
print(
    "null_prev",
    sum(1 for p in pages if p["navigation"]["prev"] is None),
    "null_next",
    sum(1 for p in pages if p["navigation"]["next"] is None),
)
