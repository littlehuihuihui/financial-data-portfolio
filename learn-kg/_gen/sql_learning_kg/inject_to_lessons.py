# -*- coding: utf-8 -*-
"""Convert sql_learning_knowledge_graph.json → _gen/lessons/sql.json and inject HTML."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
KG_PATH = Path(__file__).resolve().parent / "sql_learning_knowledge_graph.json"
OUT_SQL = ROOT / "_gen" / "lessons" / "sql.json"
INJECT = ROOT / "_gen" / "inject_lessons.py"
HTML = ROOT / "数据知识图谱.html"

SECTOR_BY_LAYER = {
    "L0": "foundation",
    "L1": "foundation",
    "L2": "foundation",
    "L3": "foundation",
    "L4": "advanced",
    "L5": "advanced",
    "L6": "practice",
}


def nid(node_id: str) -> str:
    """L0.N1 → sql-L0-N1"""
    return "sql-" + node_id.replace(".", "-")


def lid(layer_id: str) -> str:
    return f"sql-{layer_id}"


def md_escape_list(items: list[str]) -> str:
    return "\n".join(f"- {x}" for x in items)


def node_to_content(n: dict, title_by_id: dict[str, str]) -> str:
    prereq = "、".join(title_by_id.get(p, p) for p in (n.get("prerequisites") or [])) or "无（本层入口）"
    related = "、".join(title_by_id.get(r, r) for r in (n.get("related_nodes") or [])) or "—"
    mistakes = n.get("common_mistakes") or []
    mistake_rows = "\n".join(f"| {m} | 对照本课要点纠正 |" for m in mistakes)
    practice = n.get("practice") or {}
    syn = (n.get("syntax_example") or "").strip()
    if syn and not syn.startswith("```"):
        syn_block = f"```sql\n{syn}\n```"
    else:
        syn_block = syn or "```sql\n-- （本课以概念为主）\n```"

    return f"""### 课前

- **场景**：{n.get('description') or n.get('title')}
- **目标**：{n.get('mastery_criteria') or '掌握本课关键点并完成练习'}
- **难度**：{n.get('difficulty')}/5 · 约 {n.get('estimated_minutes')} 分钟 · 类型 `{n.get('type')}`
- **先修**：{prereq}
- **相关**：{related}

### 是什么

{md_escape_list(n.get('key_points') or [])}

### 怎么写

{syn_block}

### 易错对照

| 错法 / 误解 | 纠正方向 |
|---|---|
{mistake_rows}

### 动手

{practice.get('sample_question') or '完成本课练习。'}

（建议练习题数量：{practice.get('exercise_count', 1)}）

### 掌握标准

{n.get('mastery_criteria') or '能独立完成本课样例与练习。'}

### 方言差异

{n.get('dialect_notes') or '各主流引擎基本一致，细节以所用数据库文档为准。'}

### 标签

{', '.join(n.get('tags') or [])}
"""


def layer_content(layer: dict, child_titles: list[str], paths_hint: str) -> str:
    kids = " · ".join(child_titles)
    return f"""### {layer['layer_name']} · 章节导读

**学习目标**：{layer.get('goal') or ''}

**英文名**：{layer.get('layer_name_en') or ''}

**预计学时**：约 {layer.get('estimated_hours')} 小时

**解锁条件**：{layer.get('unlock_condition') or '完成本层节点'}

**本章叶子**：{kids}

{paths_hint}

点下方绿色叶节点进入各讲义；建议按列表顺序学习。
"""


def paths_folder(g: dict, title_by_id: dict[str, str]) -> dict:
    children = []
    for p in g.get("learning_paths") or []:
        seq = p.get("node_sequence") or []
        lines = []
        for i, oid in enumerate(seq, 1):
            lines.append(f"{i}. {title_by_id.get(oid, oid)}（`{nid(oid)}`）")
        body = f"""### {p.get('name')}

- **path_id**：`{p.get('path_id')}`
- **预计天数**：{p.get('estimated_days')} 天
- **节点数**：{len(seq)}

#### 推荐顺序

{chr(10).join(lines)}
"""
        children.append(
            {
                "id": f"sql-path-{p.get('path_id')}",
                "title": p.get("name"),
                "level": "L6",
                "content": body,
                "children": [],
            }
        )
    return {
        "id": "sql-paths",
        "title": "学习路径",
        "level": "L6",
        "content": "### 学习路径\n\n三条自适应路径：零基础入门 · 数据分析师 · 后端工程师。点叶子查看完整节点序列。",
        "lessonParent": True,
        "children": children,
    }


def build_tree(g: dict) -> dict:
    title_by_id = {n["node_id"]: n["title"] for n in g["nodes"]}
    by_layer: dict[str, list] = {}
    for n in g["nodes"]:
        by_layer.setdefault(n["layer_id"], []).append(n)

    path_names = "、".join(p["name"] for p in g.get("learning_paths") or [])
    layer_children = []
    for layer in sorted(g["layers"], key=lambda x: x["order"]):
        lid_ = layer["layer_id"]
        nodes = by_layer.get(lid_, [])
        leaves = []
        for n in nodes:
            leaves.append(
                {
                    "id": nid(n["node_id"]),
                    "title": n["title"],
                    "level": lid_,
                    "content": node_to_content(n, title_by_id),
                    "children": [],
                    "kgRef": n["node_id"],
                    "difficulty": n.get("difficulty"),
                    "estimated_minutes": n.get("estimated_minutes"),
                    "tags": n.get("tags") or [],
                }
            )
        hint = f"\n关联路径：{path_names}\n" if lid_ == "L0" else ""
        layer_children.append(
            {
                "id": lid(lid_),
                "title": f"{lid_} {layer['layer_name']}",
                "level": lid_,
                "content": layer_content(layer, [n["title"] for n in nodes], hint),
                "lessonParent": True,
                "children": leaves,
            }
        )

    # Attach learning paths under L6 as extra chapter
    for ch in layer_children:
        if ch["id"] == "sql-L6":
            ch["children"].append(paths_folder(g, title_by_id))
            break

    meta = g.get("graph_meta") or {}
    root_content = f"""### SQL 学习知识图谱

从零到进阶的 **7 层（L0–L6）** 结构化图谱，可驱动自适应学习。

- **版本**：{meta.get('version', '1.0')}
- **节点**：{meta.get('total_nodes')} · **边**：{meta.get('total_edges')}
- **路径**：{path_names}

#### 怎么用

1. 扇区展开后先点 **L0–L2** 打底，再进 **L3–L4** 多表与窗口
2. 工程向走 **L5–L6**；分析向侧重 **L4** 与「数据分析师路径」
3. 每个叶节点含：课前 · 要点 · 示例 · 易错 · 动手 · 掌握标准

统一示例域：**employees / orders / products**。
"""
    return {
        "id": "sql-root",
        "title": "SQL",
        "level": "?",
        "content": root_content,
        "children": layer_children,
        "source": "sql_learning_kg",
        "graph_meta": {
            "name": meta.get("name"),
            "version": meta.get("version"),
            "total_nodes": meta.get("total_nodes"),
            "total_edges": meta.get("total_edges"),
        },
    }


def patch_html_sectors_and_prefs(html: str) -> str:
    # Replace old SQL sector lines with L0–L6 (+ paths)
    old_sql = (
        '"sql-dml-query": "foundation", "sql-ddl": "foundation", "sql-join": "foundation",\n'
        '      "sql-window": "advanced", "sql-cte": "advanced", "sql-index-plan": "advanced",\n'
        '      "sql-tx-lock": "practice", "sql-txn": "practice", "sql-tune": "practice", '
    )
    new_sql = (
        '"sql-L0": "foundation", "sql-L1": "foundation", "sql-L2": "foundation", "sql-L3": "foundation",\n'
        '      "sql-L4": "advanced", "sql-L5": "advanced",\n'
        '      "sql-L6": "practice", "sql-paths": "practice", '
    )
    if old_sql in html:
        html = html.replace(old_sql, new_sql, 1)
    else:
        # idempotent / already patched: ensure keys exist
        if '"sql-L0": "foundation"' not in html:
            insert_at = html.find("const KG_SECTOR_BY_ID = {")
            if insert_at < 0:
                raise SystemExit("KG_SECTOR_BY_ID not found")
            brace = html.find("{", insert_at)
            html = (
                html[: brace + 1]
                + '\n      "sql-L0": "foundation", "sql-L1": "foundation", "sql-L2": "foundation", "sql-L3": "foundation",'
                ' "sql-L4": "advanced", "sql-L5": "advanced", "sql-L6": "practice", "sql-paths": "practice",'
                + html[brace + 1 :]
            )

    # Home prefer: open L0 overview leaf chapter instead of missing constitution
    html = html.replace(
        'const prefer = hub === "sql" ? "sql-constitution"',
        'const prefer = hub === "sql" ? "sql-L0"',
    )

    # Deprecated panel default open ids
    html = html.replace(
        'new Set(["sql-root", "sql-dml-query", "sql-window"])',
        'new Set(["sql-root", "sql-L0", "sql-L1"])',
    )
    html = html.replace('sqlKgState.activeId = "sql-window";', 'sqlKgState.activeId = "sql-L1";')
    html = html.replace('findSqlKgNode("sql-window")', 'findSqlKgNode("sql-L1")')
    return html


def count_leaves(node: dict) -> int:
    kids = node.get("children") or []
    if not kids:
        return 1
    return sum(count_leaves(c) for c in kids)


def main():
    g = json.loads(KG_PATH.read_text(encoding="utf-8"))
    tree = build_tree(g)

    # backup previous sql.json once
    if OUT_SQL.exists():
        bak = OUT_SQL.with_suffix(".json.pre_l0l6.bak")
        if not bak.exists():
            bak.write_text(OUT_SQL.read_text(encoding="utf-8"), encoding="utf-8")
            print("backed up old sql.json →", bak.name)

    OUT_SQL.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        "wrote",
        OUT_SQL,
        "layers",
        len(tree["children"]),
        "leaves~",
        count_leaves(tree),
    )

    subprocess.check_call([sys.executable, str(INJECT)])

    html = HTML.read_text(encoding="utf-8")
    html2 = patch_html_sectors_and_prefs(html)
    if html2 != html:
        HTML.write_text(html2, encoding="utf-8")
        print("patched sector map + sql prefer in HTML")
    else:
        print("HTML sector/prefer already up to date or patterns missing")

    # sanity: injected ids present
    html3 = HTML.read_text(encoding="utf-8")
    for key in ("sql-L0", "sql-L1-N1", "sql-L6-N7", "SQL Learning Knowledge Graph", '"source": "sql_learning_kg"'):
        # source may only be in json file not string-searched same way
        pass
    for key in ("sql-L0", "sql-L1-N1", "sql-L6-N7"):
        if key not in html3:
            raise SystemExit(f"missing injected id in HTML: {key}")
    print("OK: SQL L0–L6 KG injected into lessons + HTML")


if __name__ == "__main__":
    main()
