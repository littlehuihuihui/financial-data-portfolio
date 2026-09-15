# -*- coding: utf-8 -*-
import json
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")


def extract(src, marker):
    i = src.find(marker)
    s = src.find("{", i)
    d = 0
    ins = False
    esc = False
    for k in range(s, len(src)):
        ch = src[k]
        if ins:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                ins = False
            continue
        if ch == '"':
            ins = True
        elif ch == "{":
            d += 1
        elif ch == "}":
            d -= 1
            if d == 0:
                return json.loads(src[s : k + 1])


def leaves(n, acc=None):
    acc = [] if acc is None else acc
    if not (n.get("children") or []):
        acc.append(n["id"])
    for c in n.get("children") or []:
        leaves(c, acc)
    return acc


def outline(n, depth=0, lines=None):
    lines = [] if lines is None else lines
    lines.append(("  " * depth) + n.get("title", "") + " [" + n.get("id", "") + "]")
    for c in n.get("children") or []:
        outline(c, depth + 1, lines)
    return lines


t = HTML.read_text(encoding="utf-8")
dwh = extract(t, "const DWH_KNOWLEDGE_TREE = ")
etl = extract(t, "const ETL_KNOWLEDGE_TREE = ")
sql = extract(t, "const SQL_KNOWLEDGE_TREE = ")
print("DWH leaves", len(leaves(dwh)))
print("ETL leaves", len(leaves(etl)))
need = [
    "dwh-constitution",
    "dwh-snowflake",
    "dwh-star-schema",
    "dwh-constellation",
    "dwh-scd2",
    "dwh-ods",
    "dwh-kimball-inmon",
    "dwh-datavault",
    "dwh-reconcile",
    "dwh-subject-domain",
    "etl-constitution",
    "etl-tool-datax",
    "etl-lineage",
    "etl-late-data",
    "etl-drill-senior",
    "sql-constitution",
]
dwh_ids = set(leaves(dwh))
etl_ids = set(leaves(etl))
sql_ids = set(leaves(sql))
for eid in need:
    ids = dwh_ids if eid.startswith("dwh") else etl_ids if eid.startswith("etl") else sql_ids
    print(eid, "OK" if eid in ids else "MISSING")
print("--- DWH L1/L2 ---")
for line in outline(dwh):
    if line.startswith("    ") and not line.startswith("      "):
        continue
    if line.count("  ") <= 2:
        print(line)
print("missing sample check", "三条铁律" in (extract(t, "const ETL_KNOWLEDGE_TREE = ") and ""))
# constitution content flags
from copy import deepcopy

def find(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find(c, eid)
        if hit:
            return hit

print("etl const iron", "三条铁律" in find(etl, "etl-constitution")["content"])
print("dwh const iron", "三条铁律" in find(dwh, "dwh-constitution")["content"])
print("etl avg", int(sum(len(find(etl,i)["content"]) for i in list(etl_ids)[:5])/5))
