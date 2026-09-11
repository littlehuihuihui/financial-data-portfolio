# -*- coding: utf-8 -*-
import json
from pathlib import Path

text = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")


def extract(marker):
    i = text.find(marker)
    if i < 0:
        raise SystemExit("missing " + marker)
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
                return start, k + 1, json.loads(text[start : k + 1])


def leaves(n, a=None):
    a = [] if a is None else a
    if not n.get("children"):
        a.append((n["id"], n.get("title"), len(n.get("content") or "")))
    for c in n.get("children") or []:
        leaves(c, a)
    return a


_, _, tree = extract("const DWH_KNOWLEDGE_TREE = ")
ls = leaves(tree)
print("leaf count", len(ls))
for x in ls:
    print(x)
print("has constitution", any(i[0] == "dwh-constitution" for i in ls))
print("has snowflake", any("snow" in i[0] or "雪花" in (i[1] or "") for i in ls))
print("file size", Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html").stat().st_size)
