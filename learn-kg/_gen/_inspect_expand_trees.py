# -*- coding: utf-8 -*-
"""Inspect TREE objects inside expand patch scripts."""
import ast
import json
from pathlib import Path

def load_tree_from_script(path: Path):
    src = path.read_text(encoding="utf-8")
    # exec only up to TREE = {...} assignment by compiling with restricted run
    # Safer: find TREE = and parse with ast for Assign
    mod = ast.parse(src)
    tree_node = None
    for node in mod.body:
        if isinstance(node, ast.Assign):
            for t in node.targets:
                if isinstance(t, ast.Name) and t.id == "TREE":
                    tree_node = node.value
                    break
    if tree_node is None:
        raise SystemExit(f"no TREE in {path}")
    tree = ast.literal_eval(tree_node)
    return tree

def summarize(tree, name):
    rows = []
    def walk(n, d=0):
        ch = n.get("children") or []
        rows.append((d, n.get("id"), n.get("title"), len(ch), bool(n.get("lessonParent")), bool(ch)==False and d>0))
        for c in ch:
            walk(c, d+1)
    walk(tree)
    L1 = [r for r in rows if r[0]==1]
    leaves = [r for r in rows if r[5]]
    print(f"==== {name} L1={len(L1)} leaves={len(leaves)} ====")
    for d,i,t,k,ch,leaf in rows:
        if d==0: continue
        print("  "*d + f"{t} [{i}] kids={k}" + (" CH" if ch else "") + (" LEAF" if leaf else ""))

root = Path(r"D:\cursor\数据学习平台\_gen")
for fn, name in [("patch_python_expand.py", "python-patch"), ("patch_dwh_expand.py", "dwh-patch")]:
    summarize(load_tree_from_script(root/fn), name)

# also current lessons
for name in ["python", "dwh"]:
    t = json.loads((root/"lessons"/f"{name}.json").read_text(encoding="utf-8"))
    def walk(n,d=0,a=None):
        a=a or {"L1":0,"leaf":0,"titles":[]}
        ch=n.get("children") or []
        if d==1:
            a["L1"]+=1
            a["titles"].append(n["title"])
        if d>0 and not ch: a["leaf"]+=1
        for c in ch: walk(c,d+1,a)
        return a
    print("lessons", name, walk(t))
