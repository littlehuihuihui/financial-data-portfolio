# -*- coding: utf-8 -*-
import re
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")

# Find alter / scalar / cte / rank related
for pat in [
    r'"id":\s*"(sql-[^"]*alter[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
    r'"id":\s*"(sql-[^"]*scalar[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
    r'"id":\s*"(sql-[^"]*cte[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
    r'"id":\s*"(sql-[^"]*rank[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
    r'"id":\s*"(sql-[^"]*subquery[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
    r'"id":\s*"(sql-[^"]*data[^"]*)"[^,]*,\s*"title":\s*"([^"]+)"',
]:
    hits = re.findall(pat, text, flags=re.I)
    print(pat[:40], "->", hits[:20])

# Dump short content nodes that need full rewrite
ids = [
    "sql-union",
    "sql-self-join",
    "sql-cross-join",
    "sql-exists",
    "sql-in-notin",
    "sql-upsert",
    "sql-view",
    "sql-index-intro",
    "sql-datatypes",
    "sql-rank",
    "sql-dense-rank",
    "sql-lag-lead",
    "sql-sum-over",
    "sql-window-frame",
    "sql-cte",
    "sql-explain",
    "sql-composite-index",
    "sql-drill-mid",
]
out = []
for mid in ids:
    mm = re.search(
        rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"level":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
        text,
    )
    if not mm:
        out.append(f"## {mid} MISSING\n")
        continue
    title, level, content = mm.group(1), mm.group(2), mm.group(3)
    c = content.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")
    kids = []
    # peek children ids after this node roughly
    out.append(f"## {mid} | {title} | {level} | chars={len(c)}\n\n{c}\n\n---\n")

Path(r"D:\cursor\数据学习平台\数据学习平台\_gen\_mid_dump.md").write_text(
    "\n".join(out), encoding="utf-8"
)
print("dumped", len(out))
