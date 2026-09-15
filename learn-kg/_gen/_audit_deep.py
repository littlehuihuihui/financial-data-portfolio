# -*- coding: utf-8 -*-
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
root = Path(r"D:\cursor\数据学习平台")
html = (root / "数据知识图谱.html").read_text(encoding="utf-8")
sql = json.loads((root / "_gen/lessons/sql.json").read_text(encoding="utf-8"))


def find(n, i):
    if n.get("id") == i:
        return n
    for c in n.get("children") or []:
        r = find(c, i)
        if r:
            return r


n = find(sql, "sql-rank")
print("sql-rank lessonParent=", n.get("lessonParent"), "children=", n.get("children"))
print("content_len", len(n.get("content") or ""))


def all_ids(t, a=None):
    a = set() if a is None else a
    if t.get("id"):
        a.add(t["id"])
    for c in t.get("children") or []:
        all_ids(c, a)
    return a


mounted = all_ids(sql)
for key in ["juniorAligned", "midAligned", "seniorAligned"]:
    mm = re.search(rf'"{key}"\s*:\s*\[(.*?)\]', html, re.S)
    if not mm:
        print(key, "NOT FOUND")
        continue
    ids = re.findall(r'"([^"]+)"', mm.group(1))
    missing = [i for i in ids if i not in mounted]
    print(key, "listed", len(ids), "missing", len(missing), missing[:15])

bi = json.loads((root / "_gen/lessons/bi.json").read_text(encoding="utf-8"))
leaves = []


def walk(n):
    if not n.get("children"):
        leaves.append(n)
    for c in n.get("children") or []:
        walk(c)


walk(bi)
lens = sorted(len(x.get("content") or "") for x in leaves)
print("BI n", len(leaves), "min", lens[0], "p25", lens[len(lens) // 4], "med", lens[len(lens) // 2], "max", lens[-1])
coded = sum(1 for x in leaves if "```" in (x.get("content") or ""))
print("BI code fences", coded, "/", len(leaves))
# sample shortest
short = sorted(leaves, key=lambda x: len(x.get("content") or ""))[:3]
for x in short:
    print(" short", x["id"], len(x.get("content") or ""), (x.get("content") or "")[:120].replace("\n", " | "))

# prefer auto open
idx = html.find("该学科教程尚未挂载")
print("--- toast area ---")
print(html[idx : idx + 1100])

# home hubs count
m = re.search(r"HOME_VISIBLE|homeHubs|学科大节点", html)
print("home marker", bool(m))
# count id: "sql" style in graph nodes near top
nodes = re.findall(r'id:\s*"(sql|python|database|ml|etl|dwh|bi)"', html)
print("hub id mentions in first pass", sorted(set(nodes)))
