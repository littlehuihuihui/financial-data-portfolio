# -*- coding: utf-8 -*-
"""One-off audit: DWH/ETL knowledge tree lesson quality."""
import json
import re
from collections import Counter
from pathlib import Path

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")


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
    return None


def walk(n, d=0, path=None, rows=None):
    rows = rows if rows is not None else []
    path = (path or []) + [n.get("title", "")]
    ch = n.get("children") or []
    rows.append(
        {
            "depth": d,
            "id": n.get("id"),
            "title": n.get("title"),
            "level": n.get("level"),
            "lessonParent": bool(n.get("lessonParent")),
            "kids": len(ch),
            "leaf": len(ch) == 0 and d > 0,
            "content_len": len(n.get("content") or ""),
            "keys": sorted(n.keys()),
            "path": path,
            "node": n,
        }
    )
    for c in ch:
        walk(c, d + 1, path, rows)
    return rows


SECTION_TAGS = [
    "课前",
    "统一样例",
    "样例",
    "是什么",
    "怎么写",
    "查询结果",
    "用在哪",
    "注意啥",
    "易错",
    "动手",
    "对照辨析",
    "最小实验",
    "交付检查单",
    "知识要点",
    "推荐顺序",
    "阶段结束",
]


def analyze_content(content):
    if not content:
        return {"h3": [], "tags": [], "len": 0}
    heads = re.findall(r"^###\s+(.+)$", content, re.M)
    tags = [p for p in SECTION_TAGS if p in content]
    return {"h3": heads, "tags": tags, "len": len(content)}


def field_lens(node):
    out = {}
    for k in ("content", "body", "summary", "subtitle"):
        if k in node and isinstance(node[k], str):
            out[k] = len(node[k])
    if "sections" in node:
        secs = node["sections"]
        if isinstance(secs, list):
            out["sections_count"] = len(secs)
            out["sections_total_chars"] = sum(
                len(json.dumps(s, ensure_ascii=False)) for s in secs
            )
            out["section_titles"] = [
                s.get("title") or s.get("name") or s.get("heading")
                if isinstance(s, dict)
                else str(type(s))
                for s in secs
            ]
        elif isinstance(secs, dict):
            out["sections_keys"] = list(secs.keys())
            out["sections_field_lens"] = {
                k: len(v) if isinstance(v, str) else len(json.dumps(v, ensure_ascii=False))
                for k, v in secs.items()
            }
    if "drills" in node:
        drills = node["drills"]
        out["drills_count"] = len(drills) if isinstance(drills, list) else 1
        out["drills_chars"] = len(json.dumps(drills, ensure_ascii=False))
    return out


out_path = Path(r"D:\cursor\数据学习平台\_gen\_audit_dwh_etl_out.txt")
lines = []


def P(*a):
    lines.append(" ".join(str(x) for x in a))


# Sample references
for name in ("SQL_SAMPLE", "DWH_SAMPLE", "ETL_SAMPLE", "BI_SAMPLE", "DB_SAMPLE"):
    P(f"const {name} present:", f"const {name} =" in html)

# sharedWith near trees
for m in re.finditer(r'"sharedWith"\s*:\s*"([^"]+)"', html):
    # only first few near sample blocks — dump all unique
    pass
shared = sorted(set(re.findall(r'"sharedWith"\s*:\s*"([^"]+)"', html)))
P("sharedWith values:", shared)

# DWH/ETL content mentioning sample tables
for var in ("DWH_KNOWLEDGE_TREE", "ETL_KNOWLEDGE_TREE"):
    t = extract(f"const {var} = ")
    blob = json.dumps(t, ensure_ascii=False)
    for tbl in ("users", "orders", "order_items", "order_events", "SQL_SAMPLE", "DWH_SAMPLE", "ETL_SAMPLE"):
        P(f"{var} mentions '{tbl}':", blob.count(tbl))

for var, label in [("DWH_KNOWLEDGE_TREE", "DWH"), ("ETL_KNOWLEDGE_TREE", "ETL")]:
    t = extract(f"const {var} = ")
    rows = walk(t)
    leaves = [r for r in rows if r["leaf"]]
    lens = sorted(r["content_len"] for r in leaves)
    P("=" * 70)
    P(label, "root id", t.get("id"), "title", t.get("title"))
    P(
        "counts L1/L2/L3/L4/leaves/maxDepth:",
        sum(1 for r in rows if r["depth"] == 1),
        sum(1 for r in rows if r["depth"] == 2),
        sum(1 for r in rows if r["depth"] == 3),
        sum(1 for r in rows if r["depth"] == 4),
        len(leaves),
        max(r["depth"] for r in rows),
    )
    P(
        "leaf content_len min/med/max/avg:",
        lens[0],
        lens[len(lens) // 2],
        lens[-1],
        round(sum(lens) / len(lens)),
    )
    key_counter = Counter()
    for r in leaves:
        for k in r["keys"]:
            key_counter[k] += 1
    P("leaf key frequencies:", dict(key_counter))

    P("--- FULL OUTLINE (depth>=1) ---")
    for r in rows:
        if r["depth"] == 0:
            continue
        ind = "  " * r["depth"]
        tag = "LEAF" if r["leaf"] else ("CH" if r["lessonParent"] else "NODE")
        P(f"{ind}L{r['depth']} {r['title']} | id={r['id']} | len={r['content_len']} | {tag}")

    # Sample 5 leaves: constitution-like, short, mid, long, with drills if any
    candidates = []
    # pick by position diversity + length diversity
    by_len = sorted(leaves, key=lambda r: r["content_len"])
    picks = []
    # shortest, 25%, median, 75%, longest (unique)
    idxs = [0, len(by_len) // 4, len(by_len) // 2, 3 * len(by_len) // 4, len(by_len) - 1]
    for i in idxs:
        if by_len[i]["id"] not in {p["id"] for p in picks}:
            picks.append(by_len[i])
    # also prefer one with drills / sections if any exist beyond picks
    for r in leaves:
        n = r["node"]
        if ("drills" in n or "sections" in n or "body" in n) and r["id"] not in {
            p["id"] for p in picks
        }:
            picks.append(r)
            break

    P("--- SAMPLE LEAVES ---")
    for r in picks[:6]:
        n = r["node"]
        a = analyze_content(n.get("content") or "")
        fl = field_lens(n)
        P("LEAF", r["id"], "|", r["title"], "| path:", " > ".join(r["path"][1:]))
        P("  keys:", r["keys"])
        P("  content_len:", a["len"], "h3:", a["h3"])
        P("  tags_present:", a["tags"])
        P("  field_lens:", fl)
        # show first 200 chars of content for structure peek
        c = n.get("content") or ""
        P("  content_preview:", repr(c[:220].replace("\n", "\\n")))

# Gold SQL leaf: prefer one with rich sections (constitution or ROW_NUMBER gold)
sql = extract("const SQL_KNOWLEDGE_TREE = ")
sql_rows = walk(sql)
sql_leaves = [r for r in sql_rows if r["leaf"]]
# find richest by content_len
gold = max(sql_leaves, key=lambda r: r["content_len"])
# also find junior gold-ish with 课前
gold_pre = None
for r in sql_leaves:
    c = r["node"].get("content") or ""
    if "课前" in c and "查询结果" in c and "怎么写" in c:
        gold_pre = r
        break
P("=" * 70)
P("SQL GOLD (longest leaf):", gold["id"], gold["title"], "len=", gold["content_len"])
ga = analyze_content(gold["node"].get("content") or "")
P("  h3:", ga["h3"])
P("  tags:", ga["tags"])
P("  keys:", gold["keys"])
P("  field_lens:", field_lens(gold["node"]))

if gold_pre:
    P("SQL GOLD (with 课前+查询结果):", gold_pre["id"], gold_pre["title"], "len=", gold_pre["content_len"])
    ga2 = analyze_content(gold_pre["node"].get("content") or "")
    P("  h3:", ga2["h3"])
    P("  tags:", ga2["tags"])
    P("  keys:", gold_pre["keys"])

# SQL leaf length distribution for comparison
sl = sorted(r["content_len"] for r in sql_leaves)
P(
    "SQL leaf content_len min/med/max/avg/count:",
    sl[0],
    sl[len(sl) // 2],
    sl[-1],
    round(sum(sl) / len(sl)),
    len(sl),
)

# Rendering: search for how content/drills/sections used
P("=" * 70)
P("RENDER SNIPPETS")
for pat in [
    r"kgNode\.content",
    r"node\.content",
    r"\.drills",
    r"\.sections",
    r"\.body",
    r"renderMdBlock",
    r"sqlKgDrawer",
]:
    hits = list(re.finditer(pat, html))
    P(f"  pattern {pat}: {len(hits)} hits")

# Check DWH_SAMPLE / ETL_SAMPLE content briefly
for sample_name in ("SQL_SAMPLE", "DWH_SAMPLE", "ETL_SAMPLE"):
    obj = extract(f"const {sample_name} = ")
    if obj is None:
        P(sample_name, "NOT FOUND as object")
        continue
    P(sample_name, "top keys:", list(obj.keys())[:20])
    P(sample_name, "json chars:", len(json.dumps(obj, ensure_ascii=False)))

out_path.write_text("\n".join(lines), encoding="utf-8")
print("Wrote", out_path, "lines", len(lines))
