# -*- coding: utf-8 -*-
"""Inject _gen/lessons/*.json into 数据知识图谱.html KG_TREES block."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
LESSONS = Path(__file__).resolve().parent / "lessons"

ORDER = ["sql", "ml", "python", "etl", "dwh", "bi"]
VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}


def extract_json_object(html: str, start_idx: int):
    i = html.find("{", start_idx)
    if i < 0:
        raise SystemExit("no JSON object start")
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
    raise SystemExit("unbalanced JSON object")


def main():
    trees = {k: json.loads((LESSONS / f"{k}.json").read_text(encoding="utf-8")) for k in ORDER}
    parts = []
    for k in ORDER:
        parts.append(f"    const {VAR[k]} = " + json.dumps(trees[k], ensure_ascii=False, indent=2) + ";")
    entries = ",\n".join(f"      {k}: {VAR[k]}" for k in ORDER)
    kg = "    const KG_TREES = {\n" + entries + "\n    };"
    block = "\n\n".join(parts) + "\n\n" + kg

    html = HTML.read_text(encoding="utf-8")
    si = html.find("    const SQL_KNOWLEDGE_TREE = ")
    ki = html.find("    const KG_TREES = ")
    if si < 0 or ki < 0:
        raise SystemExit("KG trees block not found")
    _, kg_end = extract_json_object(html, ki + len("    const KG_TREES = "))
    if kg_end < len(html) and html[kg_end] == ";":
        kg_end += 1
    HTML.write_text(html[:si] + block + html[kg_end:], encoding="utf-8")
    print("injected lessons into", HTML)


if __name__ == "__main__":
    main()
