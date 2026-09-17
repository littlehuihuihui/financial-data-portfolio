# -*- coding: utf-8 -*-
from pathlib import Path

files = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

FALLBACK = '(KG_TREES && KG_TREES.sql) || { id: "sql-root", title: "SQL", children: [] }'

for p in files:
    t = p.read_text(encoding="utf-8")
    t = t.replace(
        "function findSqlKgNode(id, node = SQL_KNOWLEDGE_TREE) {\n      if (node.id === id) return node;",
        "function findSqlKgNode(id, node) {\n"
        f"      if (!node) node = {FALLBACK};\n"
        "      if (node.id === id) return node;",
    )
    t = t.replace(
        "dfs(SQL_KNOWLEDGE_TREE, []);",
        f"dfs({FALLBACK}, []);",
    )
    t = t.replace(
        "tree.innerHTML = `<ul>${renderSqlKgTree(SQL_KNOWLEDGE_TREE)}</ul>`;",
        "tree.innerHTML = `<ul>${renderSqlKgTree(" + FALLBACK + ")}</ul>`;",
    )
    t = t.replace(
        "if (KG_TREES[node.id]) {\n        return;\n      }",
        'if ((typeof hasKgCurriculum === "function" ? hasKgCurriculum(node.id) : KG_TREES[node.id])) {\n        return;\n      }',
    )
    p.write_text(t, encoding="utf-8")
    print(p.name, "SQL_REF", "SQL_KNOWLEDGE_TREE" in t)
