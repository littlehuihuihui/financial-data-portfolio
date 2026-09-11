# -*- coding: utf-8 -*-
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")
print("size", len(text), "bytes", Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").stat().st_size)
for m in [
    "SQL_KNOWLEDGE_TREE",
    "PYTHON_KNOWLEDGE_TREE",
    "DATABASE_KNOWLEDGE_TREE",
    "DWH_KNOWLEDGE_TREE",
    "KG_TREES",
    "HOME_HERO_HUBS",
    "dwh-constitution",
    "sql-constitution",
    "db-constitution",
    "dwh-reconcile",
    "dwh-bus-matrix",
]:
    print(m, "OK" if m in text else "MISSING")
idx = text.find('hub === "dwh"')
print("prefer wire", "YES" if idx >= 0 else "NO", text[idx : idx + 80] if idx >= 0 else "")
# count dwh leaf ids roughly
import re
ids = re.findall(r'"id":\s*"(dwh-[a-z0-9-]+)"', text)
print("dwh-* id count", len(set(ids)), sorted(set(ids))[:30], "... total unique", len(set(ids)))
