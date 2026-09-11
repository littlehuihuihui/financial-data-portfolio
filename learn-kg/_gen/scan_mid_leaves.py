# -*- coding: utf-8 -*-
"""Scan mid-path related SQL leaves."""
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

# Extract path mid content
m = re.search(
    r'"id":\s*"sql-path-mid"[^}]*?"content":\s*"((?:\\.|[^"\\])*)"',
    text,
)
if m:
    c = m.group(1).replace("\\n", "\n").replace('\\"', '"')
    print("=== sql-path-mid ===\n", c[:2000], "\n")

# Known mid topics from earlier junior path text
ids = [
    "sql-path-mid",
    "sql-drill-mid",
    "sql-union",
    "sql-self-join",
    "sql-cross-join",
    "sql-exists",
    "sql-in-notin",
    "sql-upsert",
    "sql-view",
    "sql-index-intro",
    "sql-datatypes",
    "sql-alter-table",
    "sql-row-number",
    "sql-rank",
    "sql-dense-rank",
    "sql-lag-lead",
    "sql-sum-over",
    "sql-window-frame",
    "sql-cte",
    "sql-scalar-subquery",
    "sql-explain",
    "sql-composite-index",
    "sql-join-explode",
]

for mid in ids:
    mm = re.search(
        rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"level":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
        text,
    )
    if not mm:
        print(mid, "MISSING")
        continue
    title, level, content = mm.group(1), mm.group(2), mm.group(3)
    c = content.replace("\\n", "\n").replace('\\"', '"')
    print(
        f"{mid} | {title} | L={level} | chars={len(c)} | 课前={'课前' in c} | 易错={'易错' in c}"
    )
