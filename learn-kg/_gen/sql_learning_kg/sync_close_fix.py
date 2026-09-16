# -*- coding: utf-8 -*-
"""Propagate panel × close fix to portfolio learn pages."""
from pathlib import Path
import re

SRC = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
targets = [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

TITLE = "数仓与分析实战教材 · 数据知识图谱 · DATA NEXUS"

src = SRC.read_text(encoding="utf-8")
# sanity
assert "× 应真正关闭" in src or "应真正关闭" in src
assert "kgPanelCollapsed = false;\n          document.body.classList.remove(\"is-panel-collapsed\");" in src

for p in targets:
    if not p.exists():
        print("skip", p)
        continue
    out = src
    out = re.sub(r"<title>[^<]*</title>", f"<title>{TITLE}</title>", out, count=1)
    p.write_text(out, encoding="utf-8")
    t = p.read_text(encoding="utf-8")
    print(
        p.name,
        "close-fix",
        "应真正关闭" in t,
        "open-expand",
        "kgPanelCollapsed = false" in t and "is-panel-collapsed" in t,
    )
