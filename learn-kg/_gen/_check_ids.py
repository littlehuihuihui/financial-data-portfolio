# -*- coding: utf-8 -*-
from pathlib import Path
import re

t = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")
ids = [
    "sql-join-explode",
    "sql-constitution",
    "sql-select",
    "sql-row-number",
    "dwh-scd3",
    "dwh-fact-types",
    "dwh-schedule",
    "dwh-backfill",
    "dwh-subject-domain",
    "etl-constitution",
    "bi-constitution",
]
for i in ids:
    print(i, i in t)
print("sql-id count", len(re.findall(r'"id": "sql-[^"]+"', t)))
m = re.search(r"const prefer = hub === \"sql\"[\s\S]{0,500}?null;", t)
print("PREFER:\n", m.group(0) if m else "NONE")
