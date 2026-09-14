# -*- coding: utf-8 -*-
"""Sync lesson JSON from HTML trees."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
OUT = Path(__file__).resolve().parent / "lessons"

MARKERS = {
    "python": "const PYTHON_KNOWLEDGE_TREE = ",
    "database": "const DATABASE_KNOWLEDGE_TREE = ",
    "ml": "const ML_KNOWLEDGE_TREE = ",
    "sql": "const SQL_KNOWLEDGE_TREE = ",
    "etl": "const ETL_KNOWLEDGE_TREE = ",
    "dwh": "const DWH_KNOWLEDGE_TREE = ",
    "bi": "const BI_KNOWLEDGE_TREE = ",
}


def extract_json_object(text: str, start_idx: int) -> str:
    i = text.find("{", start_idx)
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(text)):
        ch = text[j]
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
                return text[i : j + 1]
    raise SystemExit("unbalanced")


def leaves(n, acc=None):
    acc = acc if acc is not None else []
    kids = n.get("children") or []
    if not kids:
        acc.append(n)
    for c in kids:
        leaves(c, acc)
    return acc


def main(names=("python", "database", "ml")):
    html = HTML.read_text(encoding="utf-8")
    for name in names:
        marker = MARKERS[name]
        idx = html.find(marker)
        if idx < 0:
            print("MISSING", name)
            continue
        raw = extract_json_object(html, idx + len(marker))
        tree = json.loads(raw)
        path = OUT / f"{name}.json"
        path.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
        ls = leaves(tree)
        lens = sorted(len(x.get("content") or "") for x in ls)
        print(f"{name}: leaves={len(ls)} min={lens[0]} med={lens[len(lens)//2]} max={lens[-1]} -> {path.name}")


if __name__ == "__main__":
    main()
