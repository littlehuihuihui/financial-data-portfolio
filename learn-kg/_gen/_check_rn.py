# -*- coding: utf-8 -*-
import json, re
from pathlib import Path

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")
print("html size", len(html))
print("sql-row-number count", html.count('"id": "sql-row-number"'))

def extract(marker):
    i = html.find(marker)
    i = html.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(html)):
        ch = html[j]
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
                return json.loads(html[i : j + 1])

def walk(n, path=""):
    yield n, path
    for c in n.get("children") or []:
        yield from walk(c, path + "/" + (n.get("id") or ""))

sql = extract("const SQL_KNOWLEDGE_TREE = ")
hits = [(n, p) for n, p in walk(sql) if n.get("id") == "sql-row-number"]
print("tree hits", len(hits))
for n, p in hits:
    c = n.get("content") or ""
    print("path", p, "len", len(c), "keys", sorted(n.keys()), "kids", len(n.get("children") or []))
    print("h3", re.findall(r"^###\s+(.+)$", c, re.M))
    # section lens
    parts = re.split(r"(?=^### )", c, flags=re.M)
    for part in parts:
        if not part.strip():
            continue
        m = re.match(r"^###\s+(.+)$", part, re.M)
        print(f"  [{m.group(1) if m else '?'}] {len(part)}")

# also print raw occurrence contexts
idx = 0
while True:
    i = html.find('"id": "sql-row-number"', idx)
    if i < 0:
        break
    snippet = html[i : i + 80]
    # nearby content start
    j = html.find('"content": "', i)
    preview = html[j : j + 60] if 0 < j - i < 200 else "content far"
    print("occurrence at", i, "snippet", snippet.replace("\n", " "), "->", preview[:60].replace("\n", " "))
    idx = i + 1
