# -*- coding: utf-8 -*-
"""Dump current content of junior leaves for rewrite."""
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

ids = [
    "sql-insert",
    "sql-update-delete",
    "sql-where-order",
    "sql-group-by",
    "sql-having",
    "sql-case",
    "sql-functions",
    "sql-distinct",
    "sql-limit-page",
    "sql-inner-join",
    "sql-left-join",
    "sql-create-table",
    "sql-constraints",
    "sql-drill-junior",
]

out = Path(r"D:\cursor\数据学习平台\数据学习平台\_gen\_junior_dump.md")
parts = []
for mid in ids:
    m = re.search(
        rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"level":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
        text,
    )
    if not m:
        parts.append(f"## {mid}\nMISSING\n")
        continue
    title, level, content = m.group(1), m.group(2), m.group(3)
    c = content.replace("\\n", "\n").replace('\\"', '"').replace("\\\\", "\\")
    parts.append(f"## {mid} | {title} | {level}\n\n{c}\n\n---\n")

out.write_text("\n".join(parts), encoding="utf-8")
print("wrote", out, "chars", sum(len(x) for x in parts))
