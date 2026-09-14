# -*- coding: utf-8 -*-
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
t = json.loads(Path(r"D:\cursor\数据学习平台\_gen\lessons\database.json").read_text(encoding="utf-8"))


def find(n, i):
    if n.get("id") == i:
        return n
    for c in n.get("children") or []:
        r = find(c, i)
        if r:
            return r


for lid in ("db-access", "db-index-sec", "ml-feature"):
    pass

for hub, lid in [
    ("database", "db-access"),
    ("database", "db-index-sec"),
    ("python", "py-pandas"),
    ("ml", "ml-paradigm"),
]:
    tree = json.loads(Path(rf"D:\cursor\数据学习平台\_gen\lessons\{hub}.json").read_text(encoding="utf-8"))
    n = find(tree, lid)
    print("=" * 50, lid, "len=", len(n["content"]))
    print(n["content"][:1100])
    print()
