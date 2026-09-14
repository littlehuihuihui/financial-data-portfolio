# -*- coding: utf-8 -*-
from pathlib import Path
import json

ROOT = Path(r"D:\cursor\数据学习平台")
html = (ROOT / "数据知识图谱.html").read_text(encoding="utf-8")
out = ROOT / "_gen" / "_review_dwh_python.md"

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

def dump(t, lines, d=0):
    ch = t.get("children") or []
    pad = "  " * d
    tags = []
    if t.get("lessonParent"):
        tags.append("章节")
    if d > 0 and not ch:
        tags.append("叶")
    if t.get("sector"):
        tags.append("扇区:" + t["sector"])
    tag = (" · " + " ".join(tags)) if tags else ""
    if d == 0:
        lines.append(f"# {t.get('title')} (`{t.get('id')}`)\n")
    else:
        level = t.get("level") or ""
        lines.append(f"{pad}- **{t.get('title')}** `{t.get('id')}` [{level}]{tag}")
    for c in ch:
        dump(c, lines, d + 1)

parts = []
for var, name in [("DWH_KNOWLEDGE_TREE", "数仓 DWH"), ("PYTHON_KNOWLEDGE_TREE", "Python")]:
    t = extract(var)
    lines = [f"## {name}\n"]
    if not t:
        lines.append("未找到\n")
    else:
        dump(t, lines)
        # stats
        def walk(n, d=0, acc=None):
            acc = acc or {"depths": set(), "leaves": 0, "L1": 0, "L2": 0}
            ch = n.get("children") or []
            acc["depths"].add(d)
            if d == 1: acc["L1"] += 1
            if d == 2: acc["L2"] += 1
            if d > 0 and not ch: acc["leaves"] += 1
            for c in ch: walk(c, d+1, acc)
            return acc
        a = walk(t)
        lines.append(f"\n**统计**: L1={a['L1']} 章节L2={a['L2']} 叶={a['leaves']} 最大深度={max(a['depths'])}\n")
    parts.append("\n".join(lines))

out.write_text("\n---\n\n".join(parts), encoding="utf-8")
print("wrote", out)
