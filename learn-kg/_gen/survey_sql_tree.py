# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

html = Path(r"D:\cursor\数据学习平台\数据知识图谱.html").read_text(encoding="utf-8")
sql_json = json.loads(Path(r"D:\cursor\数据学习平台\_gen\lessons\sql.json").read_text(encoding="utf-8"))


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


idx = html.find("const SQL_KNOWLEDGE_TREE = ")
tree = json.loads(extract_json_object(html, idx + len("const SQL_KNOWLEDGE_TREE = ")))


def collect_ids(n, out=None):
    out = out if out is not None else []
    out.append(n["id"])
    for c in n.get("children") or []:
        collect_ids(c, out)
    return out


mounted = collect_ids(tree)
print("mounted nodes", len(mounted), "leaves", sum(1 for n in [tree] if False))

leaves = []


def walk(n, path):
    kids = n.get("children") or []
    p = path + [n["title"]]
    if not kids:
        leaves.append({"id": n["id"], "title": n["title"], "path": " / ".join(p[1:]), "level": n.get("level"), "lessonParent": n.get("lessonParent"), "clen": len(n.get("content") or "")})
    for c in kids:
        walk(c, p)


walk(tree, [])
print("leaf count", len(leaves))
for L in leaves:
    flag = ""
    if L["lessonParent"]:
        flag = " !!BAD_lessonParent_on_leaf"
    print(f"- {L['path']} [{L['id']}] len={L['clen']}{flag}")

# SQL_SAMPLE arrays
chunk_start = html.find("SQL_SAMPLE")
chunk = html[chunk_start : chunk_start + 30000]
print("\n=== Aligned arrays ===")
for name in ["juniorAligned", "midAligned", "seniorAligned"]:
    mi = re.search(rf"{name}\s*:\s*\[(.*?)\]", chunk, re.S)
    if not mi:
        print(name, "NOT FOUND")
        continue
    arr = re.findall(r'"(sql-[^"]+)"', mi.group(1))
    print(f"\n{name} ({len(arr)})")
    missing = [x for x in arr if x not in mounted]
    present = [x for x in arr if x in mounted]
    print("  present", len(present), present)
    print("  missing", len(missing), missing)

# all sql- ids near sample
all_planned = sorted(set(re.findall(r'"(sql-[a-z0-9-]+)"', chunk)))
print("\nall quoted sql-* in SQL_SAMPLE chunk", len(all_planned))
not_mounted = [x for x in all_planned if x not in mounted]
print("planned but not mounted", len(not_mounted))
for x in not_mounted:
    print(" ", x)

# structural issues
print("\n=== hierarchy issues ===")


def check(n, depth=0, parent=None):
    kids = n.get("children") or []
    if n.get("lessonParent") and not kids:
        print(f"EMPTY CHAPTER: {n['id']} {n['title']}")
    if n.get("lessonParent") and parent and parent.get("lessonParent"):
        print(f"NESTED CHAPTER: {parent['id']} -> {n['id']}")
    if depth == 1 and not kids:
        print(f"EMPTY DOMAIN: {n['id']}")
    if depth >= 2 and kids and not n.get("lessonParent"):
        # if children are leaves, should be chapter
        if all(not (c.get("children") or []) for c in kids):
            print(f"LEAVES UNDER NON-CHAPTER: {n['id']} {n['title']}")
    # thin domains
    if depth == 1:
        leaf_n = 0

        def lc(x):
            nonlocal leaf_n
            ck = x.get("children") or []
            if not ck:
                leaf_n += 1
            for c in ck:
                lc(c)

        lc(n)
        if leaf_n <= 1:
            print(f"THIN DOMAIN ({leaf_n} leaf): {n['id']} {n['title']}")
    for c in kids:
        check(c, depth + 1, n)


for c in tree["children"]:
    check(c, 1)

# compare json vs html ids
json_ids = set(collect_ids(sql_json))
html_ids = set(mounted)
print("\njson vs html id diff")
print("only html", sorted(html_ids - json_ids)[:20], "count", len(html_ids - json_ids))
print("only json", sorted(json_ids - html_ids)[:20], "count", len(json_ids - html_ids))
