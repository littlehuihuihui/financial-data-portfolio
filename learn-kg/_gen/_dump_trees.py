# -*- coding: utf-8 -*-
from pathlib import Path
import re
import json

ROOT = Path(r"D:\cursor\数据学习平台")
html_path = ROOT / "数据知识图谱.html"
print("html exists", html_path.exists(), "size", html_path.stat().st_size if html_path.exists() else 0)

html = html_path.read_text(encoding="utf-8")

def extract(var):
    marker = f"const {var} = "
    i = html.find(marker)
    if i < 0:
        return None
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
    return None

def walk(n, d=0, rows=None):
    rows = rows if rows is not None else []
    ch = n.get("children") or []
    rows.append({
        "depth": d,
        "id": n.get("id"),
        "title": n.get("title"),
        "level": n.get("level"),
        "sector": n.get("sector"),
        "lessonParent": bool(n.get("lessonParent")),
        "kids": len(ch),
        "leaf": len(ch) == 0 and d > 0,
        "content_len": len(n.get("content") or ""),
    })
    for c in ch:
        walk(c, d + 1, rows)
    return rows

for var, label in [
    ("DWH_KNOWLEDGE_TREE", "dwh"),
    ("PYTHON_KNOWLEDGE_TREE", "python"),
    ("SQL_KNOWLEDGE_TREE", "sql"),
    ("ML_KNOWLEDGE_TREE", "ml"),
]:
    t = extract(var)
    if not t:
        print(label, "NOT FOUND")
        continue
    rows = walk(t)
    print("====", label, "====")
    print("L1", sum(1 for r in rows if r["depth"] == 1),
          "L2", sum(1 for r in rows if r["depth"] == 2),
          "L3", sum(1 for r in rows if r["depth"] == 3),
          "L4", sum(1 for r in rows if r["depth"] == 4),
          "leaves", sum(1 for r in rows if r["leaf"]),
          "maxDepth", max(r["depth"] for r in rows))
    for r in rows:
        if r["depth"] == 0:
            continue
        ind = "  " * r["depth"]
        tags = []
        if r["lessonParent"]:
            tags.append("CH")
        if r["leaf"]:
            tags.append("LEAF")
        if r.get("sector"):
            tags.append("sec=" + r["sector"])
        print(f"{ind}{r['title']}  {{{r['id']}}} L={r['level']} kids={r['kids']} {' '.join(tags)}")
    print()
