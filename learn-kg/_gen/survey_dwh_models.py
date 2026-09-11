# -*- coding: utf-8 -*-
import json
import re
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
    title = n.get("title") or ""
    print("  " * depth + f"{n.get('id')} | {title}")
    for c in kids:
        walk(c, depth + 1)


tree = extract("const DWH_KNOWLEDGE_TREE = ")
walk(tree)

# search keywords in dwh contents
blob = json.dumps(tree, ensure_ascii=False)
for kw in ["星型", "雪花", "星座", "Data Vault", "Inmon", "Kimball", "宽表", "范式", "总线", "雪花型"]:
    print(kw, "YES" if kw in blob else "NO")
