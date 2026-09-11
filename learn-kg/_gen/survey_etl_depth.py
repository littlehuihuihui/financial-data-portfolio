# -*- coding: utf-8 -*-
import json
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")


def extract(marker):
    i = text.find(marker)
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


def walk(n, depth=0):
    kids = n.get("children") or []
    c = n.get("content") or ""
    flags = []
    if "课前" in c:
        flags.append("课前")
    if "易错" in c:
        flags.append("易错")
    if len(c) < 200:
        flags.append("短")
    print(
        "  " * depth
        + f"{n.get('id')} | {n.get('title')} | chars={len(c)} | {','.join(flags) or '-'}"
    )
    for x in kids:
        walk(x, depth + 1)


tree = extract("const ETL_KNOWLEDGE_TREE = ")
walk(tree)
print("root content:\n", (tree.get("content") or "")[:400])
print("has constitution id", "etl-constitution" in json.dumps(tree))
