# -*- coding: utf-8 -*-
import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")


def extract_object(src, marker):
    i = src.find(marker)
    start = src.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for k in range(start, len(src)):
        ch = src[k]
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
                return start, k + 1, json.loads(src[start : k + 1])
    raise SystemExit("unclosed")


def find_node(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find_node(c, eid)
        if hit:
            return hit
    return None


s, e, tree = extract_object(text, "const SQL_KNOWLEDGE_TREE = ")
n = find_node(tree, "sql-drill-junior")
n["content"] = n["content"].replace("（勿用旧的 email 字段）", "（字段以教程宪法为准）")
# also soften 易错对照 line if any
n["content"] = n["content"].replace("还在写 `u.email`", "还在用旧版字段名")
text = text[:s] + json.dumps(tree, ensure_ascii=False, indent=2) + text[e:]
p.write_text(text, encoding="utf-8")

ids = [
    "sql-insert",
    "sql-update-delete",
    "sql-where-order",
    "sql-group-by",
    "sql-having",
    "sql-case",
    "sql-functions",
    "sql-distinct",
    "sql-limit-page",
    "sql-inner-join",
    "sql-left-join",
    "sql-create-table",
    "sql-constraints",
    "sql-drill-junior",
]
_, _, tree2 = extract_object(p.read_text(encoding="utf-8"), "const SQL_KNOWLEDGE_TREE = ")
for eid in ids:
    node = find_node(tree2, eid)
    assert node and "课前" in node["content"] and "易错对照" in node["content"] and "动手" in node["content"], eid
drill = find_node(tree2, "sql-drill-junior")
assert "user_name" in drill["content"]
assert "u.email" not in drill["content"]
path = find_node(tree2, "sql-path-junior")
assert "已对齐模板" in path["content"]
print("ALL OK", len(ids), "size", p.stat().st_size)
