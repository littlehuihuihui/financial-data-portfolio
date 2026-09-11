# -*- coding: utf-8 -*-
import json
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


def walk(n, depth=0, acc=None):
    acc = acc if acc is not None else {"leaves": 0, "pre": 0, "short": 0}
    kids = n.get("children") or []
    c = n.get("content") or ""
    if not kids:
        acc["leaves"] += 1
        if "课前" in c:
            acc["pre"] += 1
        if len(c) < 350:
            acc["short"] += 1
        print("  " * depth + f"LEAF {n.get('id')} | {n.get('title')} | {len(c)}")
    else:
        print("  " * depth + f"{n.get('id')} | {n.get('title')} | kids={len(kids)}")
    for x in kids:
        walk(x, depth + 1, acc)
    return acc


for name in ["BI", "ETL"]:
    print("\n====", name, "====")
    tr = extract(f"const {name}_KNOWLEDGE_TREE = ")
    acc = walk(tr)
    print(acc)
    blob = json.dumps(tr, ensure_ascii=False)
    for kw in ["宪法", "练习", "帆软", "Tableau", "指标", "DataX", "Airbyte", "血缘"]:
        print(kw, "YES" if kw in blob else "NO")
