# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")


def extract(marker):
    i = text.find(marker)
    if i < 0:
        return None
    start = text.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for k in range(start, len(text)):
        ch = text[k]
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
                return json.loads(text[start : k + 1])
    return None


# Main graph L1 nodes near start of DATA
m = re.search(r'const (?:DATA|GRAPH|nodes)\s*=', text)
print("graph marker", bool(m))

# Find catalog hubs in main data - look for "catalog": true or children of root
for mid in ["sql", "python", "ml", "database", "etl", "bi", "bigdata", "dwh", "warehouse"]:
    hit = re.search(rf'"id":\s*"{mid}"\s*,\s*"name":\s*"([^"]+)"', text)
    if hit:
        print(f"MAIN {mid}: {hit.group(1)}")
    else:
        hit2 = re.search(rf'"id":\s*"{mid}"\s*,\s*"title":\s*"([^"]+)"', text)
        print(f"MAIN {mid}:", hit2.group(1) if hit2 else "not as name/title")

# KG_TREES keys
kg = re.search(r"const KG_TREES = \{([^}]+(?:\{[^}]*\}[^}]*)*)\}", text)
# simpler
idx = text.find("const KG_TREES = ")
snippet = text[idx : idx + 800]
print("\nKG_TREES snippet:\n", snippet[:600])

names = [
    "SQL_KNOWLEDGE_TREE",
    "ML_KNOWLEDGE_TREE",
    "PYTHON_KNOWLEDGE_TREE",
    "ETL_KNOWLEDGE_TREE",
    "DWH_KNOWLEDGE_TREE",
    "BI_KNOWLEDGE_TREE",
    "DATABASE_KNOWLEDGE_TREE",
    "DB_KNOWLEDGE_TREE",
]


def walk(n, acc):
    kids = n.get("children") or []
    c = n.get("content") or ""
    if not kids:
        acc["leaves"] += 1
        acc["chars"] += len(c)
        if "课前" in c:
            acc["pre"] += 1
        if "易错对照" in c:
            acc["err"] += 1
        if "教程宪法" in c or "统一样例" in c:
            acc["constitution"] += 1
        if len(c) < 120:
            acc["stub"] += 1
        elif len(c) < 500:
            acc["short"] += 1
        else:
            acc["rich"] += 1
    for x in kids:
        walk(x, acc)
    return acc


def l2(n):
    return [(c.get("id"), c.get("title"), len(c.get("children") or [])) for c in (n.get("children") or [])]


for name in names:
    t = extract(f"const {name} = ")
    if not t:
        print(name, "MISSING")
        continue
    acc = walk(t, {"leaves": 0, "pre": 0, "err": 0, "stub": 0, "short": 0, "rich": 0, "chars": 0, "constitution": 0})
    print(
        f"\n{name} id={t.get('id')} title={t.get('title')}"
        f"\n  leaves={acc['leaves']} 课前={acc['pre']} 易错={acc['err']} stub={acc['stub']} short={acc['short']} rich={acc['rich']}"
        f" avg={acc['chars']//max(acc['leaves'],1)}"
        f"\n  L2: {l2(t)}"
    )
