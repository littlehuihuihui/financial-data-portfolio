# -*- coding: utf-8 -*-
import json, re
from pathlib import Path
from collections import Counter

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")

def extract(marker):
    i = html.find(marker)
    i = html.find("{", i)
    depth = 0; in_str = False; esc = False
    for j in range(i, len(html)):
        ch = html[j]
        if in_str:
            if esc: esc = False
            elif ch == "\\": esc = True
            elif ch == '"': in_str = False
            continue
        if ch == '"': in_str = True
        elif ch == "{": depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return json.loads(html[i:j+1])
    return None

def leaves(n, acc=None):
    acc = acc if acc is not None else []
    ch = n.get("children") or []
    if not ch:
        acc.append(n)
    for c in ch:
        leaves(c, acc)
    return acc

GOLD8 = ["课前", "样例输入", "是什么", "怎么写", "查询结果", "用在哪", "易错对照", "动手"]
SHORT4 = ["是什么", "怎么写", "用在哪", "注意啥"]

def h3s(c):
    return re.findall(r"^###\s+(.+)$", c or "", re.M)

def classify(c):
    heads = h3s(c)
    # normalize strip emoji/spaces
    norm = [re.sub(r"^[^\w\u4e00-\u9fff]+", "", h).strip() for h in heads]
    has_gold = all(any(g in h for h in norm) for g in GOLD8)
    has_short = all(any(g in h for h in norm) for g in SHORT4) and "课前" not in (c or "")
    return heads, norm, has_gold, has_short, len(c or "")

out = []
def P(*a):
    out.append(" ".join(str(x) for x in a))

for var, label in [("DWH_KNOWLEDGE_TREE","DWH"), ("ETL_KNOWLEDGE_TREE","ETL"), ("SQL_KNOWLEDGE_TREE","SQL")]:
    t = extract(f"const {var} = ")
    ls = leaves(t)
    gold_n = short_n = other_n = 0
    for n in ls:
        heads, norm, hg, hs, ln = classify(n.get("content"))
        if hg: gold_n += 1
        elif hs: short_n += 1
        else: other_n += 1
    P(label, "leaves", len(ls), "gold8", gold_n, "short4", short_n, "other", other_n)
    # list other ids
    others = []
    for n in ls:
        heads, norm, hg, hs, ln = classify(n.get("content"))
        if not hg and not hs:
            others.append((n["id"], n["title"], ln, heads))
    P("  other samples:", others[:8])

# Dump exact gold SQL headings with char lengths per section for sql-row-number and sql-constitution if exists
sql = extract("const SQL_KNOWLEDGE_TREE = ")
ls = leaves(sql)
for want in ["sql-row-number", "sql-constitution", "sql-inner-join", "sql-select"]:
    n = next((x for x in ls if x["id"]==want), None)
    if not n:
        P(want, "MISSING")
        continue
    c = n.get("content") or ""
    P("="*50, want, n["title"], "total", len(c))
    parts = re.split(r"(?=^### )", c, flags=re.M)
    for p in parts:
        if not p.strip(): continue
        m = re.match(r"^###\s+(.+)$", p, re.M)
        title = m.group(1) if m else "(no h3)"
        P(f"  section [{title}] chars={len(p)}")

# DWH section lengths for one gold leaf
dwh = extract("const DWH_KNOWLEDGE_TREE = ")
for want in ["dwh-snowflake", "dwh-constitution", "dwh-ods", "dwh-path-senior"]:
    n = next((x for x in leaves(dwh) if x["id"]==want), None)
    c = n.get("content") or ""
    P("="*50, want, n["title"], "total", len(c))
    parts = re.split(r"(?=^### )", c, flags=re.M)
    for p in parts:
        if not p.strip(): continue
        m = re.match(r"^###\s+(.+)$", p, re.M)
        title = m.group(1) if m else "(no h3)"
        P(f"  section [{title}] chars={len(p)}")

# ETL section lengths
etl = extract("const ETL_KNOWLEDGE_TREE = ")
for want in ["etl-scd", "etl-incr", "etl-classic", "etl-keys-watermark", "etl-constitution"]:
    n = next((x for x in leaves(etl) if x["id"]==want), None)
    if not n:
        P(want, "MISSING")
        continue
    c = n.get("content") or ""
    P("="*50, want, n["title"], "total", len(c))
    parts = re.split(r"(?=^### )", c, flags=re.M)
    for p in parts:
        if not p.strip(): continue
        m = re.match(r"^###\s+(.+)$", p, re.M)
        title = m.group(1) if m else "(no h3)"
        P(f"  section [{title}] chars={len(p)}")

# Check nested path
nested = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
root = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
P("write path nested exists:", nested.exists(), "size", nested.stat().st_size if nested.exists() else None)
P("workspace html exists:", root.exists(), "size", root.stat().st_size)

# sample object blobs
for name in ["DWH_SAMPLE", "ETL_SAMPLE"]:
    obj = extract(f"const {name} = ")
    P(name, json.dumps(obj, ensure_ascii=False, indent=2))

Path(r"D:\cursor\数据学习平台\_gen\_audit_dwh_etl_out2.txt").write_text("\n".join(out), encoding="utf-8")
print("done", len(out))
