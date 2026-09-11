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


# main dwh node topics
m = re.search(r'"id":\s*"dwh".{0,2000}?"topics":\s*(\[.*?\])\s*,\s*"deps"', text, re.S)
print("dwh topics search", bool(m))

# find dwh in nodes - print name keys from detail
idx = text.find('"id": "dwh"')
print(text[idx : idx + 2500][:2000])

tree = extract("const DWH_KNOWLEDGE_TREE = ")
print("\n=== TREE ===")
print(json.dumps(tree, ensure_ascii=False, indent=2)[:4000])


def walk(n, depth=0):
    kids = n.get("children") or []
    c = n.get("content") or ""
    print("  " * depth + f"{n.get('id')} | {n.get('title')} | L={n.get('level')} | chars={len(c)} | kids={len(kids)}")
    for x in kids:
        walk(x, depth + 1)


print("\nstructure:")
walk(tree)
