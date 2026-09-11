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


def walk(n, depth=0, acc=None):
    acc = acc if acc is not None else []
    kids = n.get("children") or []
    c = n.get("content") or ""
    print("  " * depth + f"{n.get('id')} | {n.get('title')} | chars={len(c)} | kids={len(kids)}")
    if not kids:
        acc.append(n["id"])
    for x in kids:
        walk(x, depth + 1, acc)
    return acc


tree = extract("const PYTHON_KNOWLEDGE_TREE = ")
leaves = walk(tree)
print("LEAF_COUNT", len(leaves))
print(leaves)

# main python node engines / terms
idx = text.find('"id": "python"')
chunk = text[idx : idx + 3500]
terms = re.findall(r'"terms":\s*\[(.*?)\]', chunk, re.S)
print("\nterms block:", (terms[0][:500] if terms else "none"))
# engines names
eng = re.findall(r'"id":\s*"(python:[^"]+)"|"name":\s*"([^"]+)"', chunk)
print("sample near python", chunk[400:1200][:800])
