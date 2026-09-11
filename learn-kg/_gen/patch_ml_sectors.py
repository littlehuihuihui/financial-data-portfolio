# -*- coding: utf-8 -*-
"""Patch KG_SECTOR_BY_ID and ML search aliases after expanding ml.json."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
ML = Path(__file__).resolve().parent / "lessons" / "ml.json"


def collect_sectors(n, sector=None, out=None):
    if out is None:
        out = {}
    sec = n.get("sector") or sector
    if n["id"] != "ml-root" and sec:
        out[n["id"]] = sec
    for c in n.get("children") or []:
        collect_sectors(c, sec, out)
    return out


def main():
    tree = json.loads(ML.read_text(encoding="utf-8"))
    mp = collect_sectors(tree)
    items = [f'"{k}": "{v}"' for k, v in mp.items()]
    lines = []
    for i in range(0, len(items), 4):
        chunk = ", ".join(items[i : i + 4])
        lines.append("      " + chunk + ",")
    ml_block = "\n".join(lines).rstrip(",")

    html = HTML.read_text(encoding="utf-8")
    m = re.search(r"(const KG_SECTOR_BY_ID = \{)(.*?)(\n    \};)", html, re.S)
    if not m:
        raise SystemExit("KG_SECTOR_BY_ID not found")
    body = m.group(2)
    body2 = re.sub(r'\n\s*"ml-[^"]+": "[^"]+",?', "", body)
    body2 = re.sub(r",\s*,", ",", body2).rstrip().rstrip(",")
    new_body = body2 + ",\n" + ml_block
    html = html[: m.start()] + m.group(1) + new_body + m.group(3) + html[m.end() :]

    extra_aliases = """
          "文本": ["nlp", "tfidf", "情感", "分词"],
          nlp: ["文本", "tfidf", "情感分析"],
          "时序": ["timeseries", "滞后", "预测", "forecast"],
          forecast: ["时序", "销量预测"],
          "深度学习": ["mlp", "embedding", "神经网络", "deep"],
          embedding: ["嵌入", "向量", "双塔"],
          "校准": ["calibration", "概率校准"],
          "冷启动": ["cold start", "冷启"],
          "协同过滤": ["cf", "itemcf", "usercf"]"""

    # insert before closing of KG_SEARCH_ALIASES if keys missing
    if '"文本"' not in html:
        html = html.replace(
            '          ml: ["机器学习", "算法", "模型"]\n        };',
            '          ml: ["机器学习", "算法", "模型"],'
            + extra_aliases
            + "\n        };",
        )

    HTML.write_text(html, encoding="utf-8")
    print(f"patched {len(mp)} ml sector entries")


if __name__ == "__main__":
    main()
