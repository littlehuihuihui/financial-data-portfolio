# -*- coding: utf-8 -*-
import json
from pathlib import Path

t = json.loads(Path(r"D:\cursor\数据学习平台\kg-data\bi.json").read_text(encoding="utf-8"))


def walk(n, acc=None):
    acc = [] if acc is None else acc
    kids = n.get("children") or []
    if not kids:
        acc.append(n)
    for c in kids:
        walk(c, acc)
    return acc


lab = next(c for c in t["children"] if c["id"] == "bi-tableau-lab")
leaves = walk(lab)
titles = [x["title"] for x in leaves]
out = Path(r"D:\cursor\数据学习平台\_gen\_bi_tab_titles.txt")
out.write_text("\n".join(titles), encoding="utf-8")
print("leaves", len(leaves))
for need in ["柱状图", "环形图", "FIXED", "INCLUDE", "EXCLUDE", "双轴组合图（柱状+折线）", "桑基图"]:
    print(need, need in titles)

# sector tip: optional patch HTML
html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
text = html.read_text(encoding="utf-8")
needle = '"bi-tool-finebi": "practice", "bi-tool-datart": "practice",'
insert = (
    '"bi-tool-finebi": "practice", "bi-tool-datart": "practice", '
    '"bi-tableau-lab": "practice", "bi-tab-图表基础": "foundation", '
    '"bi-tab-LOD表达式": "advanced",'
)
if "bi-tableau-lab" not in text[text.find("KG_SECTOR_BY_ID") : text.find("KG_SECTOR_BY_ID") + 4000]:
    if needle in text:
        text = text.replace(needle, insert, 1)
        html.write_text(text, encoding="utf-8")
        print("OK sector map")
    else:
        print("WARN sector needle missing")
else:
    print("sector already present")
