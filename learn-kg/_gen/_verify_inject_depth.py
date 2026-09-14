# -*- coding: utf-8 -*-
"""Verify injected HTML leaf medians for py/db/ml."""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
html = Path(__file__).resolve().parent.parent.joinpath("数据知识图谱.html").read_text(encoding="utf-8")


def extract(marker):
    i = html.find(marker)
    j = html.find("{", i)
    depth = 0
    in_str = esc = False
    for k in range(j, len(html)):
        ch = html[k]
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
                return json.loads(html[j : k + 1])


def leaves(n, a=None):
    a = [] if a is None else a
    if not n.get("children"):
        a.append(n)
    for c in n.get("children") or []:
        leaves(c, a)
    return a


for name, marker in [
    ("python", "const PYTHON_KNOWLEDGE_TREE = "),
    ("database", "const DATABASE_KNOWLEDGE_TREE = "),
    ("ml", "const ML_KNOWLEDGE_TREE = "),
]:
    t = extract(marker)
    ls = leaves(t)
    lens = sorted(len(x.get("content") or "") for x in ls)
    has_tail = sum(1 for x in ls if "对照辨析" in (x.get("content") or ""))
    has_gold = sum(1 for x in ls if "### 课前" in (x.get("content") or ""))
    print(f"{name}: n={len(ls)} med={lens[len(lens)//2]} min={lens[0]} max={lens[-1]} gold={has_gold} tail={has_tail}")
