# -*- coding: utf-8 -*-
"""Final audit snapshot of current HTML."""
import json, re
from pathlib import Path
from collections import Counter

html_path = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
html = html_path.read_text(encoding="utf-8")
print("size", html_path.stat().st_size)

def extract(marker):
    i = html.find(marker)
    if i < 0:
        return None
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

def walk(n, d=0, rows=None):
    rows = rows if rows is not None else []
    ch = n.get("children") or []
    rows.append({
        "d": d, "id": n.get("id"), "title": n.get("title"),
        "lp": bool(n.get("lessonParent")), "kids": len(ch),
        "leaf": len(ch) == 0 and d > 0,
        "len": len(n.get("content") or ""),
        "keys": sorted(n.keys()),
        "content": n.get("content") or "",
        "node": n,
    })
    for c in ch:
        walk(c, d + 1, rows)
    return rows

GOLD8 = ["课前", "样例输入", "是什么", "怎么写", "查询结果", "用在哪", "易错对照", "动手"]
SHORT4 = ["是什么", "怎么写", "用在哪", "注意啥"]

def h3(c):
    return re.findall(r"^###\s+(.+)$", c or "", re.M)

def style(c):
    heads = h3(c)
    gold = all(any(g in (hh or "") for hh in heads) or g in (c or "") for g in ["课前", "是什么", "怎么写", "查询结果", "用在哪", "易错", "动手"]) and ("样例" in (c or ""))
    # stricter: count gold markers in headings
    joined = " | ".join(heads)
    gold8 = all(g in joined or (g == "样例输入" and "样例" in joined) for g in GOLD8)
    short4 = all(g in joined for g in SHORT4) and "课前" not in joined
    return heads, gold8, short4

lines = []
def P(*a):
    lines.append(" ".join(str(x) for x in a))

P("HTML size", html_path.stat().st_size)
for name in ("SQL_SAMPLE", "DWH_SAMPLE", "ETL_SAMPLE"):
    P(name, "present", f"const {name} =" in html)

for var, label in [
    ("DWH_KNOWLEDGE_TREE", "DWH"),
    ("ETL_KNOWLEDGE_TREE", "ETL"),
    ("SQL_KNOWLEDGE_TREE", "SQL"),
]:
    t = extract(f"const {var} = ")
    rows = walk(t)
    leaves = [r for r in rows if r["leaf"]]
    lens = sorted(r["len"] for r in leaves)
    g = s = o = 0
    for r in leaves:
        heads, gold8, short4 = style(r["content"])
        if gold8:
            g += 1
        elif short4:
            s += 1
        else:
            o += 1
    P("=" * 60)
    P(label, "L1/L2/L3/L4/leaves/maxD",
      sum(1 for r in rows if r["d"] == 1),
      sum(1 for r in rows if r["d"] == 2),
      sum(1 for r in rows if r["d"] == 3),
      sum(1 for r in rows if r["d"] == 4),
      len(leaves), max(r["d"] for r in rows))
    P(label, "leaf len min/med/max/avg", lens[0], lens[len(lens)//2], lens[-1], round(sum(lens)/len(lens)))
    P(label, "styles gold8/short4/other", g, s, o)
    keyc = Counter()
    for r in leaves:
        for k in r["keys"]:
            keyc[k] += 1
    P(label, "leaf keys", dict(keyc))
    P(label, "OUTLINE")
    for r in rows:
        if r["d"] == 0:
            continue
        tag = "LEAF" if r["leaf"] else ("CH" if r["lp"] else "NODE")
        P(f"  {'  '*r['d']}L{r['d']} {r['title']} | {r['id']} | {r['len']} | {tag}")

# samples for DWH/ETL
def pick_samples(leaves):
    by = sorted(leaves, key=lambda r: r["len"])
    idxs = [0, len(by)//4, len(by)//2, 3*len(by)//4, len(by)-1]
    out = []
    seen = set()
    for i in idxs:
        if by[i]["id"] not in seen:
            seen.add(by[i]["id"])
            out.append(by[i])
    return out

for var, label in [("DWH_KNOWLEDGE_TREE", "DWH"), ("ETL_KNOWLEDGE_TREE", "ETL")]:
    t = extract(f"const {var} = ")
    leaves = [r for r in walk(t) if r["leaf"]]
    P("=" * 60, label, "SAMPLES")
    for r in pick_samples(leaves):
        heads, gold8, short4 = style(r["content"])
        P(f"LEAF {r['id']} | {r['title']} | len={r['len']} | gold8={gold8} short4={short4}")
        P("  h3:", heads)
        # per-section approx
        parts = re.split(r"(?=^### )", r["content"], flags=re.M)
        for part in parts:
            if not part.strip():
                continue
            m = re.match(r"^###\s+(.+)$", part, re.M)
            P(f"  sec[{m.group(1) if m else '?'}]={len(part)}")

# SQL gold
sql_leaves = [r for r in walk(extract("const SQL_KNOWLEDGE_TREE = ")) if r["leaf"]]
gold = max(sql_leaves, key=lambda r: r["len"])
P("=" * 60, "SQL GOLD", gold["id"], gold["title"], gold["len"])
heads, gold8, short4 = style(gold["content"])
P("  gold8", gold8, "short4", short4, "h3", heads)
parts = re.split(r"(?=^### )", gold["content"], flags=re.M)
for part in parts:
    if not part.strip():
        continue
    m = re.match(r"^###\s+(.+)$", part, re.M)
    P(f"  sec[{m.group(1) if m else '?'}]={len(part)}")

# mentions
for var in ("DWH_KNOWLEDGE_TREE", "ETL_KNOWLEDGE_TREE"):
    blob = json.dumps(extract(f"const {var} = "), ensure_ascii=False)
    P(var, "table mentions", {t: blob.count(t) for t in ("users", "orders", "order_items", "order_events", "SQL_SAMPLE")})

sample = extract("const SQL_SAMPLE = ")
P("SQL_SAMPLE keys", list(sample.keys()))
P("SQL_SAMPLE.tables", sample.get("tables"))
P("SQL_SAMPLE.goldLessons", sample.get("goldLessons"))
P("DWH_SAMPLE", extract("const DWH_SAMPLE = "))
P("ETL_SAMPLE", extract("const ETL_SAMPLE = "))

# etl constitution missing?
etl = extract("const ETL_KNOWLEDGE_TREE = ")
etl_ids = [r["id"] for r in walk(etl)]
P("etl has constitution", "etl-constitution" in etl_ids)
P("etl has learning-path", "etl-learning-path" in etl_ids)

outp = Path(r"D:\cursor\数据学习平台\_gen\_audit_final.txt")
outp.write_text("\n".join(lines), encoding="utf-8")
print("wrote", outp, "lines", len(lines))
