# -*- coding: utf-8 -*-
import json, re
from pathlib import Path

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")

def extract(marker):
    i = html.find(marker)
    i = html.find("{", i)
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
                return json.loads(html[i : j + 1])

def leaves(n, a=None):
    a = a if a is not None else []
    ch = n.get("children") or []
    if not ch:
        a.append(n)
    for c in ch:
        leaves(c, a)
    return a

out = []
sql = extract("const SQL_KNOWLEDGE_TREE = ")
for n in leaves(sql):
    c = n.get("content") or ""
    if any(x in c for x in ["课前", "易错对照", "查询结果", "样例输入"]):
        heads = re.findall(r"^###\s+(.+)$", c, re.M)
        out.append(f"SQL rich {n['id']} {n['title']} {len(c)} {heads}")

n = next(x for x in leaves(sql) if x["id"] == "sql-row-number")
out.append("ROW_NUMBER headings:")
for h in re.findall(r"^###\s+(.+)$", n["content"], re.M):
    out.append("  " + repr(h))
out.append(f"total {len(n['content'])}")

# also find longest mid/junior gold from patch names
for n in sorted(leaves(sql), key=lambda x: -len(x.get("content") or ""))[:5]:
    out.append(f"SQL top {n['id']} {n['title']} {len(n.get('content') or '')}")

dwh = extract("const DWH_KNOWLEDGE_TREE = ")
out.append("DWH leaves:")
for n in leaves(dwh):
    out.append(f"  {n['id']}\t{len(n.get('content') or '')}\t{n['title']}")

etl = extract("const ETL_KNOWLEDGE_TREE = ")
out.append("ETL leaves:")
for n in leaves(etl):
    out.append(f"  {n['id']}\t{len(n.get('content') or '')}\t{n['title']}")

# SQL_SAMPLE tables / goldLessons
sample = extract("const SQL_SAMPLE = ")
out.append("SQL_SAMPLE.tables=" + str(sample.get("tables")))
out.append("SQL_SAMPLE.goldLessons=" + str(sample.get("goldLessons")))

Path(r"D:\cursor\数据学习平台\_gen\_audit_dwh_etl_out3.txt").write_text("\n".join(out), encoding="utf-8")
print("ok", len(out))
