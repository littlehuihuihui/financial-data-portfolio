# -*- coding: utf-8 -*-
import json
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
t = HTML.read_text(encoding="utf-8")


def extract(src, marker):
    i = src.find(marker)
    if i < 0:
        return None
    s = src.find("{", i)
    d = 0
    ins = False
    esc = False
    for k in range(s, len(src)):
        ch = src[k]
        if ins:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                ins = False
            continue
        if ch == '"':
            ins = True
        elif ch == "{":
            d += 1
        elif ch == "}":
            d -= 1
            if d == 0:
                return json.loads(src[s : k + 1])


def leaves(n, acc=None):
    acc = [] if acc is None else acc
    if not (n.get("children") or []):
        acc.append(n["id"])
    for c in n.get("children") or []:
        leaves(c, acc)
    return acc


sql = extract(t, "const SQL_KNOWLEDGE_TREE = ")
dwh = extract(t, "const DWH_KNOWLEDGE_TREE = ")
print("sql leaves", len(leaves(sql)) if sql else None)
print("sql-constitution in html text", "sql-constitution" in t)
print("sql ids sample", [x for x in leaves(sql) if "const" in x or "path" in x][:20])
print("ALL dwh leaves:")
for i in leaves(dwh):
    print(" ", i)
# prefer line
idx = t.find("const prefer")
print("prefer snippet:", t[idx : idx + 350].replace("\n", " | "))
