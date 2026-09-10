# -*- coding: utf-8 -*-
"""Sync lesson JSON files from current HTML KG trees."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
LESSONS = Path(__file__).resolve().parent / "lessons"

MAPPING = [
    ("SQL_KNOWLEDGE_TREE", "sql"),
    ("ML_KNOWLEDGE_TREE", "ml"),
    ("PYTHON_KNOWLEDGE_TREE", "python"),
    ("ETL_KNOWLEDGE_TREE", "etl"),
    ("DWH_KNOWLEDGE_TREE", "dwh"),
    ("BI_KNOWLEDGE_TREE", "bi"),
]


def extract_json_object(html: str, start_idx: int):
    i = html.find("{", start_idx)
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
                return html[i : j + 1], j + 1
    raise SystemExit("unbalanced")


def main():
    html = HTML.read_text(encoding="utf-8")
    for var, name in MAPPING:
        key = f"const {var} = "
        i = html.find(key)
        if i < 0:
            raise SystemExit(f"missing {var}")
        txt, _ = extract_json_object(html, i + len(key))
        tree = json.loads(txt)
        (LESSONS / f"{name}.json").write_text(
            json.dumps(tree, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print("synced", name)


if __name__ == "__main__":
    main()
