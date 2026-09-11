# -*- coding: utf-8 -*-
import json
import re

path = r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html"
text = open(path, encoding="utf-8").read()

# Extract KG_TREES.sql via rough JSON-ish: find "sql": { ... } inside KG_TREES
# Simpler: walk with regex for each leaf id

ids = [
    "sql-select",
    "sql-null",
    "sql-insert",
    "sql-update",
    "sql-update-delete",
    "sql-delete",
    "sql-where",
    "sql-where-order",
    "sql-order-by",
    "sql-group-by",
    "sql-having",
    "sql-case-when",
    "sql-case",
    "sql-funcs",
    "sql-functions",
    "sql-common-funcs",
    "sql-distinct",
    "sql-limit",
    "sql-limit-page",
    "sql-pagination",
    "sql-inner",
    "sql-inner-join",
    "sql-left",
    "sql-left-join",
    "sql-join-explode",
    "sql-create-table",
    "sql-constraints",
    "sql-constraint",
    "sql-path-junior",
    "sql-drill-junior",
]

# Find all sql-* ids with titles near learning path / DML
all_ids = re.findall(r'"id":\s*"(sql-[a-z0-9-]+)"', text)
print("total sql-* ids:", len(set(all_ids)))

# Print DML / DDL / JOIN related titles
for mid in sorted(set(all_ids)):
    m = re.search(
        rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"level":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
        text,
    )
    if not m:
        m = re.search(
            rf'"id":\s*"{re.escape(mid)}"\s*,\s*"title":\s*"([^"]+)"\s*,\s*"content":\s*"((?:\\.|[^"\\])*)"',
            text,
        )
        if not m:
            continue
        title, content = m.group(1), m.group(2)
        level = "?"
    else:
        title, level, content = m.group(1), m.group(2), m.group(3)

    # unescape common JS string escapes for inspection
    c = (
        content.replace("\\n", "\n")
        .replace('\\"', '"')
        .replace("\\\\", "\\")
    )
    keywords = ("insert", "update", "delete", "where", "order", "group", "having", "case", "func", "distinct", "limit", "page", "inner", "left", "create", "constraint", "null", "select", "junior", "drill")
    if any(k in mid for k in keywords) or any(k in title.lower() for k in ("insert", "update", "where", "group", "having", "case", "函数", "distinct", "limit", "分页", "inner", "left", "create", "约束")):
        print(f"{mid} | {title} | L={level} | chars={len(c)} | 课前={'课前' in c} | 易错={'易错' in c}")
