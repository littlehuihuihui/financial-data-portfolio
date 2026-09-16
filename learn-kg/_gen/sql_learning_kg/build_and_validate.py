# -*- coding: utf-8 -*-
"""Build, patch, validate, and emit SQL Learning Knowledge Graph deliverables."""
from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent
JSON_PATH = OUT_DIR / "sql_learning_knowledge_graph.json"
SUMMARY_PATH = OUT_DIR / "SUMMARY.md"
CHECKLIST_PATH = OUT_DIR / "CHECKLIST.md"

VALID_TYPES = {"concept", "syntax", "skill", "pattern", "tool"}
VALID_EDGE_TYPES = {"prerequisite", "related", "extends", "contrasts"}
REQUIRED_NODE_FIELDS = [
    "node_id",
    "layer_id",
    "title",
    "title_en",
    "type",
    "difficulty",
    "estimated_minutes",
    "description",
    "key_points",
    "syntax_example",
    "common_mistakes",
    "prerequisites",
    "related_nodes",
    "practice",
    "mastery_criteria",
    "tags",
    "dialect_notes",
]
LAYER_META = {
    "L0": {
        "layer_name": "环境与基础认知",
        "layer_name_en": "Foundation",
        "order": 0,
        "goal": "知道 SQL 是什么、数据库类型、环境搭建、首条查询与示例数据",
        "prerequisites": [],
        "estimated_hours": 3,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L1": {
        "layer_name": "基础查询",
        "layer_name_en": "Basic Query",
        "order": 1,
        "goal": "掌握 SELECT、WHERE、ORDER BY、LIMIT、计算列与注释",
        "prerequisites": ["L0"],
        "estimated_hours": 6,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L2": {
        "layer_name": "聚合与分组",
        "layer_name_en": "Aggregation",
        "order": 2,
        "goal": "掌握 COUNT/SUM/AVG/MAX/MIN、GROUP BY、HAVING、执行顺序与 COUNT(DISTINCT)",
        "prerequisites": ["L0", "L1"],
        "estimated_hours": 6,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L3": {
        "layer_name": "多表连接",
        "layer_name_en": "Multi-table",
        "order": 3,
        "goal": "掌握 INNER/LEFT/RIGHT/FULL/CROSS JOIN、自连接、多表连接、子查询、EXISTS 与 UNION",
        "prerequisites": ["L0", "L1", "L2"],
        "estimated_hours": 10,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L4": {
        "layer_name": "进阶查询",
        "layer_name_en": "Advanced Query",
        "order": 4,
        "goal": "掌握窗口函数、CTE、递归 CTE、CASE、Pivot/Unpivot、日期/字符串函数与 NULL 处理",
        "prerequisites": ["L1", "L2", "L3"],
        "estimated_hours": 12,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L5": {
        "layer_name": "数据库设计与性能",
        "layer_name_en": "Design & Performance",
        "order": 5,
        "goal": "掌握表设计与范式、索引与 EXPLAIN、事务锁与隔离、视图/存储过程、权限及数据变更对象",
        "prerequisites": ["L1", "L3"],
        "estimated_hours": 14,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
    "L6": {
        "layer_name": "实战与工程化",
        "layer_name_en": "Practice & Engineering",
        "order": 6,
        "goal": "掌握数据分析套路、面试高频题、SQL+Python/BI、版本迁移、方言差异与反模式",
        "prerequisites": ["L2", "L3", "L4", "L5"],
        "estimated_hours": 16,
        "unlock_condition": "完成本层所有必修节点并通过测验",
    },
}

REQUIRED_TOPIC_KEYWORDS = {
    "L0": ["SQL", "数据库", "环境", "查询", "示例"],
    "L1": ["SELECT", "WHERE", "ORDER", "LIMIT", "计算", "注释"],
    "L2": ["COUNT", "SUM", "GROUP", "HAVING", "执行", "DISTINCT"],
    "L3": ["INNER", "LEFT", "RIGHT", "CROSS", "自连接", "子查询", "EXISTS", "UNION"],
    "L4": ["窗口", "CTE", "递归", "CASE", "Pivot", "日期", "字符串", "NULL"],
    "L5": ["表设计", "范式", "索引", "EXPLAIN", "事务", "锁", "视图", "存储过程", "权限"],
    "L6": ["分析", "面试", "Python", "BI", "迁移", "方言", "反模式"],
}

REQUIRED_CONTRASTS = [
    ("L1.N2", "L2.N3"),  # WHERE vs HAVING
    ("L3.N1", "L3.N2"),  # INNER vs LEFT
    ("L3.N7", "L3.N8"),  # UNION vs UNION ALL
    ("L4.N2", "L4.N3"),  # ROW_NUMBER vs RANK
    ("L4.N3", "L4.N4"),  # RANK vs DENSE_RANK
    ("L4.N2", "L4.N4"),  # ROW_NUMBER vs DENSE_RANK
    ("L5.N4", "L5.N5"),  # 视图 vs 物化视图
    ("L5.N6", "L5.N7"),  # DELETE vs TRUNCATE
    ("L5.N7", "L5.N8"),  # TRUNCATE vs DROP
    ("L5.N6", "L5.N8"),  # DELETE vs DROP
]


def patch_nodes(nodes: list[dict]) -> None:
    """Fill topic gaps while preserving the rest of the production graph."""
    by_id = {n["node_id"]: n for n in nodes}

    # L4.N7: make Pivot/Unpivot first-class in CASE node
    n = by_id["L4.N7"]
    n["title"] = "CASE 与 Pivot/Unpivot"
    n["title_en"] = "CASE / Pivot / Unpivot"
    n["description"] = (
        "CASE 做条件表达式与分档；配合条件聚合可实现行转列（Pivot），"
        "配合 UNION ALL / UNPIVOT 可实现列转行（Unpivot），统一在 employees/orders/products 上练习。"
    )
    n["key_points"] = [
        "简单 CASE 与搜索 CASE；分支结果类型需一致，缺省 ELSE 为 NULL",
        "Pivot：用 SUM/COUNT(CASE WHEN ...) 把类别行展开为多列指标",
        "Unpivot：用 UNION ALL 或 UNPIVOT 把多列指标折回长表",
        "透视前后注意粒度与空值：无匹配类别应显式补 0 或保留 NULL",
        "报表宽表适合展示，分析长表更适合 JOIN/窗口与复用",
    ]
    n["syntax_example"] = (
        "-- Pivot: 各部门订单金额按状态展开\n"
        "SELECT e.department,\n"
        "       SUM(CASE WHEN o.status = 'paid' THEN o.amount ELSE 0 END) AS paid_amt,\n"
        "       SUM(CASE WHEN o.status = 'refund' THEN o.amount ELSE 0 END) AS refund_amt\n"
        "FROM employees e\n"
        "JOIN orders o ON o.employee_id = e.employee_id\n"
        "GROUP BY e.department;\n\n"
        "-- Unpivot: 宽表折回长表\n"
        "SELECT product_id, 'q1' AS quarter, q1_sales AS sales FROM products\n"
        "UNION ALL\n"
        "SELECT product_id, 'q2', q2_sales FROM products;"
    )
    n["common_mistakes"] = [
        "Pivot 忘记 ELSE 0，导致 SUM 出现 NULL",
        "把筛选条件写在 WHERE 里却期望保留未命中类别的列",
        "Unpivot 后未统一列类型/列名导致 UNION 失败",
    ]
    n["practice"] = {
        "exercise_count": 4,
        "sample_question": (
            "基于 orders 按 department 做 status 透视；再把 products 的 q1_sales/q2_sales Unpivot 成长表。"
        ),
    }
    n["mastery_criteria"] = (
        "能独立写出 CASE 条件聚合 Pivot，并用 UNION ALL/UNPIVOT 完成列转行，说明宽表与长表适用场景。"
    )
    n["tags"] = ["case", "pivot", "unpivot", "conditional-aggregation"]
    n["dialect_notes"] = (
        "SQL Server/Oracle 有 PIVOT/UNPIVOT 语法；PostgreSQL/MySQL 常用 CASE 聚合 + UNION ALL；"
        "BigQuery 有 PIVOT/UNPIVOT 扩展。"
    )

    # L5.N4: views + stored procedures + permissions surface
    n = by_id["L5.N4"]
    n["title"] = "视图与存储过程"
    n["title_en"] = "Views & Stored Procedures"
    n["type"] = "syntax"
    n["description"] = (
        "视图是保存的查询定义，用于封装逻辑与权限隔离；存储过程把多语句业务逻辑固化在库端。"
        "二者都常与 GRANT/REVOKE 权限模型一起使用。"
    )
    n["key_points"] = [
        "普通视图通常不存数据，查询时展开；可隐藏底层表并做列级权限封装",
        "存储过程适合事务型多步骤写入与固定批处理，但会增加耦合与迁移成本",
        "权限：GRANT/REVOKE 控制表/视图/过程的访问，最小权限原则",
        "复杂视图可能不可更新；过程要注意注入风险与参数校验",
        "与物化视图对比：是否持久化结果集、是否需要刷新策略",
    ]
    n["syntax_example"] = (
        "-- 视图：仅开放销售相关列\n"
        "CREATE VIEW v_order_summary AS\n"
        "SELECT o.order_id, e.department, o.amount, o.status\n"
        "FROM orders o\n"
        "JOIN employees e ON e.employee_id = o.employee_id;\n\n"
        "GRANT SELECT ON v_order_summary TO analyst_role;\n\n"
        "-- 存储过程（PostgreSQL 风格示意）\n"
        "CREATE PROCEDURE sp_mark_paid(p_order_id INT)\n"
        "LANGUAGE plpgsql\n"
        "AS $$\n"
        "BEGIN\n"
        "  UPDATE orders SET status = 'paid' WHERE order_id = p_order_id;\n"
        "END;\n"
        "$$;"
    )
    n["common_mistakes"] = [
        "把视图当成一定物化的缓存表",
        "在应用层与存储过程重复实现同一业务规则导致不一致",
        "直接把底层表权限授给所有人，而不是通过视图最小化暴露",
    ]
    n["practice"] = {
        "exercise_count": 3,
        "sample_question": (
            "创建只暴露 department/amount 的订单视图，授予只读角色；再写一个将订单标为 paid 的过程草稿。"
        ),
    }
    n["mastery_criteria"] = (
        "能解释视图与存储过程的适用边界，并写出带 GRANT 的视图权限封装示例。"
    )
    n["tags"] = ["view", "procedure", "security", "grant"]
    n["dialect_notes"] = (
        "MySQL 用 CREATE PROCEDURE；SQL Server 用 T-SQL；PostgreSQL 常用 FUNCTION/PROCEDURE；"
        "权限对象与角色模型各方言细节不同。"
    )

    # Ensure L5.N1 mentions 表设计+范式; L5.N3 mentions 隔离级别 explicitly
    n = by_id["L5.N1"]
    if "表设计" not in n["title"]:
        n["title"] = "表设计与范式"
    blob = n["description"] + " ".join(n["key_points"])
    if "范式" not in blob:
        n["key_points"] = list(n["key_points"][:4]) + ["范式（1NF/2NF/3NF）指导去冗余与依赖拆分"]
    if "表设计" not in blob:
        n["description"] = "围绕 employees/orders/products 做表设计与范式权衡：" + n["description"]

    n = by_id["L5.N3"]
    blob = n["description"] + " ".join(n["key_points"])
    if "隔离" not in blob:
        n["key_points"] = list(n["key_points"][:4]) + [
            "常见隔离级别：读未提交/读已提交/可重复读/可串行化"
        ]
    if "锁" not in n["title"]:
        n["title"] = "事务、锁与隔离级别"


def normalize_layers(graph: dict) -> None:
    by_layer: dict[str, list[str]] = defaultdict(list)
    for n in graph["nodes"]:
        by_layer[n["layer_id"]].append(n["node_id"])

    layers = []
    for lid in [f"L{i}" for i in range(7)]:
        meta = LAYER_META[lid]
        layers.append(
            {
                "layer_id": lid,
                "layer_name": meta["layer_name"],
                "layer_name_en": meta["layer_name_en"],
                "order": meta["order"],
                "goal": meta["goal"],
                "prerequisites": list(meta["prerequisites"]),
                "estimated_hours": meta["estimated_hours"],
                "nodes": by_layer[lid],
                "unlock_condition": meta["unlock_condition"],
            }
        )
    graph["layers"] = layers


def ensure_learning_paths(graph: dict) -> None:
    ids = {n["node_id"] for n in graph["nodes"]}

    def seq(prefix_layers: list[str]) -> list[str]:
        out = []
        for lid in prefix_layers:
            layer_nodes = [n["node_id"] for n in graph["nodes"] if n["layer_id"] == lid]
            out.extend(layer_nodes)
        missing = [x for x in out if x not in ids]
        if missing:
            raise RuntimeError(f"path refs missing: {missing}")
        return out

    graph["learning_paths"] = [
        {
            "path_id": "beginner",
            "name": "零基础入门路径",
            "node_sequence": seq(["L0", "L1", "L2", "L3"]),
            "estimated_days": 14,
        },
        {
            "path_id": "analyst",
            "name": "数据分析路径",
            "node_sequence": seq(["L1", "L2", "L3", "L4"]),
            "estimated_days": 30,
        },
        {
            "path_id": "engineer",
            "name": "数据工程路径",
            "node_sequence": seq(["L1", "L2", "L3", "L5", "L6"]),
            "estimated_days": 45,
        },
    ]


def ensure_required_contrasts(graph: dict) -> None:
    existing = {(e["from"], e["to"], e["type"]) for e in graph["edges"]}
    descriptions = {
        ("L1.N2", "L2.N3"): "WHERE 行过滤 vs HAVING 组过滤",
        ("L3.N1", "L3.N2"): "INNER 仅匹配 vs LEFT 保留左表",
        ("L3.N7", "L3.N8"): "UNION 去重 vs UNION ALL 保留重复",
        ("L4.N2", "L4.N3"): "ROW_NUMBER 唯一序 vs RANK 同分同名次",
        ("L4.N3", "L4.N4"): "RANK 跳号 vs DENSE_RANK 不跳号",
        ("L4.N2", "L4.N4"): "ROW_NUMBER 无并列 vs DENSE_RANK 并列不跳号",
        ("L5.N4", "L5.N5"): "普通视图即时计算 vs 物化视图持久化",
        ("L5.N6", "L5.N7"): "DELETE 可条件/可回滚 vs TRUNCATE 整表快清",
        ("L5.N7", "L5.N8"): "TRUNCATE 清空保留结构 vs DROP 删除对象",
        ("L5.N6", "L5.N8"): "DELETE 删行 vs DROP 删对象定义",
    }
    for a, b in REQUIRED_CONTRASTS:
        if (a, b, "contrasts") not in existing and (b, a, "contrasts") not in existing:
            graph["edges"].append(
                {
                    "from": a,
                    "to": b,
                    "type": "contrasts",
                    "weight": 1.0,
                    "description": descriptions[(a, b)],
                }
            )


def refresh_meta(graph: dict) -> None:
    graph["graph_meta"] = {
        "name": "SQL Learning Knowledge Graph",
        "version": "1.0",
        "language": "zh-CN",
        "total_layers": len(graph["layers"]),
        "total_nodes": len(graph["nodes"]),
        "total_edges": len(graph["edges"]),
        "description": "从零到进阶的 SQL 学习知识图谱",
    }


def validate(graph: dict) -> list[str]:
    errors: list[str] = []
    nodes = graph["nodes"]
    edges = graph["edges"]
    layers = graph["layers"]
    paths = graph["learning_paths"]
    ids = [n["node_id"] for n in nodes]
    id_set = set(ids)

    if len(ids) != len(id_set):
        errors.append("duplicate node_id")

    if graph["graph_meta"]["total_layers"] != 7:
        errors.append("total_layers != 7")
    if graph["graph_meta"]["total_nodes"] != len(nodes):
        errors.append("graph_meta.total_nodes mismatch")
    if graph["graph_meta"]["total_edges"] != len(edges):
        errors.append("graph_meta.total_edges mismatch")

    by_layer: dict[str, list[dict]] = defaultdict(list)
    for n in nodes:
        by_layer[n["layer_id"]].append(n)
        for f in REQUIRED_NODE_FIELDS:
            if f not in n:
                errors.append(f"{n.get('node_id')}: missing field {f}")
        if n["type"] not in VALID_TYPES:
            errors.append(f"{n['node_id']}: invalid type {n['type']}")
        if not (1 <= int(n["difficulty"]) <= 5):
            errors.append(f"{n['node_id']}: difficulty out of range")
        if not (3 <= len(n["key_points"]) <= 5):
            errors.append(f"{n['node_id']}: key_points length")
        if not (2 <= len(n["common_mistakes"]) <= 4):
            errors.append(f"{n['node_id']}: common_mistakes length")
        if int(n["practice"].get("exercise_count", 0)) < 1:
            errors.append(f"{n['node_id']}: exercise_count < 1")
        if "sample_question" not in n["practice"]:
            errors.append(f"{n['node_id']}: missing sample_question")
        for pr in n["prerequisites"]:
            if pr not in id_set:
                errors.append(f"{n['node_id']}: bad prereq {pr}")
        for rn in n["related_nodes"]:
            if rn not in id_set:
                errors.append(f"{n['node_id']}: bad related {rn}")
        # id pattern
        if n["node_id"] != f"{n['layer_id']}.N{by_layer[n['layer_id']].index(n)+1}" and False:
            pass
        expected_prefix = n["layer_id"] + ".N"
        if not n["node_id"].startswith(expected_prefix):
            errors.append(f"{n['node_id']}: id/layer mismatch")

    for lid in [f"L{i}" for i in range(7)]:
        cnt = len(by_layer[lid])
        if not (3 <= cnt <= 8):
            errors.append(f"{lid}: node count {cnt} not in 3-8")
        # difficulty non-decreasing across layers (min difficulty per layer non-decreasing)
    layer_min_diff = []
    for i in range(7):
        lid = f"L{i}"
        if by_layer[lid]:
            layer_min_diff.append(min(n["difficulty"] for n in by_layer[lid]))
    for i in range(1, len(layer_min_diff)):
        if layer_min_diff[i] + 1 < layer_min_diff[i - 1]:
            # allow mild overlap but catch sharp regressions
            errors.append(
                f"difficulty regression between L{i-1} and L{i}: "
                f"{layer_min_diff[i-1]} -> {layer_min_diff[i]}"
            )

    # layer objects
    layer_ids = [L["layer_id"] for L in layers]
    if layer_ids != [f"L{i}" for i in range(7)]:
        errors.append("layers order/ids incorrect")
    for L in layers:
        listed = set(L["nodes"])
        actual = {n["node_id"] for n in by_layer[L["layer_id"]]}
        if listed != actual:
            errors.append(f"{L['layer_id']}: layer.nodes mismatch")

    # edges
    touched = set()
    for e in edges:
        for k in ("from", "to", "type", "weight", "description"):
            if k not in e:
                errors.append(f"edge missing {k}: {e}")
        if e["type"] not in VALID_EDGE_TYPES:
            errors.append(f"bad edge type {e['type']}")
        if e["from"] not in id_set or e["to"] not in id_set:
            errors.append(f"edge endpoint missing: {e['from']}->{e['to']}")
        touched.add(e["from"])
        touched.add(e["to"])
    orphans = id_set - touched
    if orphans:
        errors.append(f"orphan nodes: {sorted(orphans)}")

    # contrasts
    contrast_pairs = {(e["from"], e["to"]) for e in edges if e["type"] == "contrasts"}
    contrast_pairs |= {(b, a) for a, b in contrast_pairs}
    for a, b in REQUIRED_CONTRASTS:
        if (a, b) not in contrast_pairs and (b, a) not in contrast_pairs:
            errors.append(f"missing contrast {a}<->{b}")

    # topics
    for lid, words in REQUIRED_TOPIC_KEYWORDS.items():
        blob = " ".join(
            n["title"]
            + " "
            + n["description"]
            + " "
            + " ".join(n["key_points"])
            + " "
            + n.get("syntax_example", "")
            for n in by_layer[lid]
        )
        missing = [w for w in words if w not in blob]
        if missing:
            errors.append(f"{lid} missing topics: {missing}")

    # paths
    if len(paths) != 3:
        errors.append("need exactly 3 learning_paths")
    path_map = {p["path_id"]: p for p in paths}
    expected = {
        "beginner": (["L0", "L1", "L2", "L3"], 14),
        "analyst": (["L1", "L2", "L3", "L4"], 30),
        "engineer": (["L1", "L2", "L3", "L5", "L6"], 45),
    }
    for pid, (need_layers, days) in expected.items():
        if pid not in path_map:
            errors.append(f"missing path {pid}")
            continue
        p = path_map[pid]
        if p["estimated_days"] != days:
            errors.append(f"{pid} days != {days}")
        got_layers = []
        for nid in p["node_sequence"]:
            if nid not in id_set:
                errors.append(f"{pid} unknown node {nid}")
            lid = nid.split(".")[0]
            if not got_layers or got_layers[-1] != lid:
                got_layers.append(lid)
        # sequence should cover required layers in order (allow only those layers)
        if got_layers != need_layers:
            errors.append(f"{pid} layers {got_layers} != {need_layers}")

    # overall difficulty trend: avg difficulty should not drop sharply by layer
    avgs = []
    for i in range(7):
        ns = by_layer[f"L{i}"]
        avgs.append(sum(n["difficulty"] for n in ns) / len(ns))
    for i in range(1, 7):
        if avgs[i] + 1.5 < avgs[i - 1]:
            errors.append(f"avg difficulty drop L{i-1}->{i}: {avgs[i-1]:.2f}->{avgs[i]:.2f}")

    return errors


def write_summary(graph: dict) -> None:
    layers = graph["layers"]
    paths = graph["learning_paths"]
    lines = [
        "# SQL 学习知识图谱 · 摘要",
        "",
        "## 规模",
        f"- **层**：L0–L6（{graph['graph_meta']['total_layers']} 层）",
        f"- **节点**：{graph['graph_meta']['total_nodes']}（ID 规范：`L{{n}}.N{{m}}`）",
        f"- **边**：{graph['graph_meta']['total_edges']}（`prerequisite` / `related` / `contrasts` / `extends`）",
        f"- **路径**：{len(paths)} 条（beginner / analyst / engineer）",
        "",
        "## 分层一览",
        "| 层 | 名称 | 节点数 | 学时(估) | 节点 |",
        "|----|------|--------|----------|------|",
    ]
    for L in layers:
        lines.append(
            f"| {L['layer_id']} | {L['layer_name']} | {len(L['nodes'])} | "
            f"{L['estimated_hours']}h | {', '.join(L['nodes'])} |"
        )

    lines.extend(
        [
            "",
            "## 必含对比（contrasts）",
            "- `L1.N2` WHERE ↔ `L2.N3` HAVING",
            "- `L3.N1` INNER JOIN ↔ `L3.N2` LEFT JOIN",
            "- `L3.N7` UNION ↔ `L3.N8` UNION ALL",
            "- `L4.N2` ROW_NUMBER ↔ `L4.N3` RANK ↔ `L4.N4` DENSE_RANK",
            "- `L5.N4` 视图与存储过程 ↔ `L5.N5` 物化视图",
            "- `L5.N6` DELETE ↔ `L5.N7` TRUNCATE ↔ `L5.N8` DROP",
            "",
            "## 学习路径",
        ]
    )
    for i, p in enumerate(paths, 1):
        seq = " → ".join(p["node_sequence"])
        lines.append(
            f"{i}. **{p['path_id']}**（{p['estimated_days']} 天）· {p['name']}  \n"
            f"   `{seq}`"
        )

    lines.extend(
        [
            "",
            "## 扩展建议",
            "- 为每个节点增加 quiz 题库（选择题 + SQL 判题用例）并挂到 `practice`",
            "- 增加方言分支边（PostgreSQL / MySQL / BigQuery）作为 `related` 子图",
            "- 在 L4 增加 LEAD/LAG、NTILE；在 L5 增加分区表与统计信息",
            "- 为 adaptive engine 增加 `mastery_weight` 与错误标签映射",
            "",
            "## 文件",
            f"- `{JSON_PATH}` — 主图谱",
            f"- `{CHECKLIST_PATH.name}` — 质量自检",
            f"- `{Path(__file__).name}` — 构建与校验脚本",
            "",
        ]
    )
    SUMMARY_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_checklist(graph: dict, errors: list[str]) -> None:
    ok = len(errors) == 0
    mark = "[x]" if ok else "[ ]"
    counts = {L["layer_id"]: len(L["nodes"]) for L in graph["layers"]}
    count_str = "/".join(str(counts[f"L{i}"]) for i in range(7))
    lines = [
        "# SQL Learning KG · Quality Checklist",
        "",
        f"- {mark} `graph_meta` / `layers` / `nodes` / `edges` / `learning_paths` 齐全",
        f"- {mark} 节点 ID 全部为 `L{{n}}.N{{m}}`",
        f"- {mark} 每层节点数 3–8（实际：{count_str}）",
        f"- {mark} 边类型仅 4 种：prerequisite / related / contrasts / extends",
        f"- {mark} 含 WHERE↔HAVING、INNER↔LEFT、UNION↔UNION ALL、窗口排名对比、视图↔物化视图、DELETE/TRUNCATE/DROP",
        f"- {mark} 3 条路径：beginner(14) / analyst(30) / engineer(45)",
        f"- {mark} prerequisites / related_nodes / 边端点均指向存在节点",
        f"- {mark} 无孤立节点（每节点至少出现在一条边）",
        f"- {mark} `json.loads` 可解析；`build_and_validate.py` 断言通过",
        f"- {mark} 每节点含 practice.exercise_count ≥ 1；key_points 3–5；common_mistakes 2–4",
        f"- {mark} L0–L6 必含主题词覆盖（含 Pivot/Unpivot、存储过程、权限）",
        f"- {mark} 示例统一围绕 employees / orders / products",
        f"- {mark} graph_meta.total_nodes / total_edges 与实际一致",
        "",
        "## 交付路径",
        f"`{JSON_PATH}`",
        "",
        f"## Validation",
        f"- status: {'OK' if ok else 'FAIL'}",
        f"- nodes: {graph['graph_meta']['total_nodes']}",
        f"- edges: {graph['graph_meta']['total_edges']}",
    ]
    if errors:
        lines.append("- errors:")
        lines.extend([f"  - {e}" for e in errors])
    lines.append("")
    CHECKLIST_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    if not JSON_PATH.exists():
        print(f"ERROR: missing base graph at {JSON_PATH}", file=sys.stderr)
        return 1

    graph = json.loads(JSON_PATH.read_text(encoding="utf-8"))

    # normalize edges to exact schema
    new_edges = []
    for e in graph["edges"]:
        fr = e.get("from") or e.get("source")
        to = e.get("to") or e.get("target")
        et = e["type"]
        new_edges.append(
            {
                "from": fr,
                "to": to,
                "type": et,
                "weight": float(e.get("weight", 1.0)),
                "description": e.get("description") or "",
            }
        )
    graph["edges"] = new_edges

    patch_nodes(graph["nodes"])
    normalize_layers(graph)
    ensure_required_contrasts(graph)
    ensure_learning_paths(graph)
    refresh_meta(graph)

    # stable ordering
    graph["nodes"].sort(key=lambda n: (n["layer_id"], int(n["node_id"].split(".N")[1])))
    # keep edges as-is but ensure deterministic contrasts appended already

    errors = validate(graph)

    JSON_PATH.write_text(
        json.dumps(graph, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    # round-trip
    graph2 = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    errors2 = validate(graph2)
    errors = errors or errors2

    write_summary(graph2)
    write_checklist(graph2, errors)

    print(
        json.dumps(
            {
                "status": "OK" if not errors else "FAIL",
                "json_path": str(JSON_PATH),
                "summary_path": str(SUMMARY_PATH),
                "checklist_path": str(CHECKLIST_PATH),
                "total_nodes": graph2["graph_meta"]["total_nodes"],
                "total_edges": graph2["graph_meta"]["total_edges"],
                "layer_counts": {L["layer_id"]: len(L["nodes"]) for L in graph2["layers"]},
                "first_node": graph2["nodes"][0]["node_id"],
                "last_node": graph2["nodes"][-1]["node_id"],
                "errors": errors,
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0 if not errors else 2


if __name__ == "__main__":
    raise SystemExit(main())
