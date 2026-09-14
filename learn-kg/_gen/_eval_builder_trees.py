# -*- coding: utf-8 -*-
"""Check lengths of gold content inside expand builders."""
import re
import ast
from pathlib import Path

GEN = Path(__file__).resolve().parent


def extract_tree_literal(src: str, assign_name: str):
    # Find TREE = { ... } at module level via brace matching from assignment
    m = re.search(rf"^{assign_name}\s*=\s*\{{", src, re.M)
    if not m:
        return None
    i = m.end() - 1
    depth = 0
    for j in range(i, len(src)):
        ch = src[j]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return src[i : j + 1]
    return None


def leaves(n, acc=None):
    acc = [] if acc is None else acc
    if not n.get("children"):
        acc.append(n)
    for c in n.get("children") or []:
        leaves(c, acc)
    return acc


def try_eval_tree(path: Path, name: str):
    src = path.read_text(encoding="utf-8")
    # Execute module in sandbox-ish dict to get TREE
    ns = {}
    try:
        exec(compile(src, str(path), "exec"), ns, ns)
    except Exception as e:
        print(path.name, "exec fail", type(e).__name__, e)
        return
    tree = ns.get(name) or ns.get("TREE") or ns.get("DB_TREE") or ns.get("ML_TREE")
    if not tree:
        print(path.name, "no tree var", [k for k in ns if k.isupper()][:20])
        return
    ls = leaves(tree)
    lens = sorted(len(x.get("content") or "") for x in ls)
    print(path.name, "leaves", len(ls), "min", lens[0], "med", lens[len(lens)//2], "max", lens[-1])


for f, var in [
    ("patch_python_expand.py", "TREE"),
    ("build_database_tree.py", "TREE"),
    ("build_ml_tree.py", "TREE"),
    ("patch_database_kg.py", "DB_TREE"),
]:
    try_eval_tree(GEN / f, var)
