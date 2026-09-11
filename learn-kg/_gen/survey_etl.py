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


def leaves(n, a=None):
    a = [] if a is None else a
    if not n.get("children"):
        a.append((n.get("id"), n.get("title"), len(n.get("content") or "")))
    for c in n.get("children") or []:
        leaves(c, a)
    return a


tree = extract("const ETL_KNOWLEDGE_TREE = ")
print("ETL leaves", len(leaves(tree)))
for x in leaves(tree):
    print(x)

idx = text.find('"id": "etl"')
chunk = text[idx : idx + 4000]
# engines
eng = re.findall(r'"name":\s*"([^"]+)"', chunk)
print("names near etl", eng[:40])
print("file", Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").stat().st_size)
