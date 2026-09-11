# -*- coding: utf-8 -*-
from pathlib import Path
import json

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
t = p.read_text(encoding="utf-8")

def extract(marker):
    i = t.find(marker)
    start = t.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for k in range(start, len(t)):
        ch = t[k]
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
                return json.loads(t[start : k + 1])

checks = [
    "py-constitution",
    "py-merge",
    "py-pivot",
    "py-sklearn",
    "py-duckdb",
    "py-streamlit",
    "DATABASE_KNOWLEDGE_TREE",
    "dwh-constitution",
    "sql-constitution",
]
for c in checks:
    print(c, "OK" if c in t else "MISSING")

# patch sectors if needed
sec_area_start = t.find("KG_SECTOR_BY_ID")
sec_area = t[sec_area_start : sec_area_start + 2000]
if "py-sklearn" not in sec_area:
    needle = '"py-pandas": "foundation", "py-viz": "advanced"'
    if needle in t:
        t = t.replace(
            needle,
            '"py-pandas": "foundation", "py-viz": "advanced", "py-learning-path": "practice", '
            '"py-stack": "practice", "py-dataframe": "foundation", "py-merge": "advanced", '
            '"py-sklearn": "practice", "py-constitution": "practice", "py-duckdb": "practice"',
            1,
        )
        p.write_text(t, encoding="utf-8")
        print("OK sectors patched")
    else:
        print("sectors needle missing; snippet:", sec_area[200:500])
else:
    print("sectors already have py-sklearn")

py = extract("const PYTHON_KNOWLEDGE_TREE = ")

def leaves(n, a=None):
    a = [] if a is None else a
    if not n.get("children"):
        a.append(n["id"])
    for c in n.get("children") or []:
        leaves(c, a)
    return a

print("leaves", len(leaves(py)))
print("size", p.stat().st_size)
