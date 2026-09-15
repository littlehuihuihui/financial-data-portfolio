# -*- coding: utf-8 -*-
import json
from pathlib import Path
from collections import defaultdict

src = Path(__file__).resolve().parent / "sql_learning_knowledge_graph.json"
g = json.loads(src.read_text(encoding="utf-8"))

layer_order = ["L0", "L1", "L2", "L3", "L4", "L5", "L6"]
by_layer = defaultdict(list)
for n in g["nodes"]:
    by_layer[n["layer_id"]].append(n)

id_map = {}
for lid in layer_order:
    for i, n in enumerate(by_layer[lid], 1):
        id_map[n["node_id"]] = f"{lid}.N{i}"

TYPE_MAP = {
    "prerequisite": "prerequisite",
    "related": "related",
    "contrasts": "contrasts",
    "extends": "extends",
}

LAYER_META = {
    "L0": ("环境与基础认知", "Foundation", "知道 SQL 是什么、在哪里用、怎么跑起来", [], 3),
    "L1": ("基础查询", "Basic Query", "掌握单表查询：投影、过滤、排序、限流与表达式", ["L0"], 6),
    "L2": ("聚合与分组", "Aggregation", "用聚合与分组把明细收成指标，并理解执行顺序", ["L0", "L1"], 6),
    "L3": ("多表连接", "Multi-table", "掌握连接、子查询与集合操作，正确控制粒度", ["L0", "L1", "L2"], 10),
    "L4": ("进阶查询", "Advanced Query", "窗口、CTE、条件表达式与常用函数", ["L1", "L2", "L3"], 12),
    "L5": ("数据库设计与性能", "Design & Performance", "表设计、索引计划、事务并发与对象权限", ["L1", "L3"], 14),
    "L6": ("实战与工程化", "Practice & Engineering", "分析套路、面试、跨系统集成与反模式治理", ["L2", "L3", "L4", "L5"], 16),
}


def map_list(xs):
    return [id_map[x] for x in xs]


new_nodes = []
for lid in layer_order:
    for n in by_layer[lid]:
        nn = dict(n)
        nn["node_id"] = id_map[n["node_id"]]
        nn["prerequisites"] = map_list(n.get("prerequisites") or [])
        nn["related_nodes"] = map_list(n.get("related_nodes") or [])
        pr = dict(nn.get("practice") or {})
        pr["exercise_count"] = max(1, int(pr.get("exercise_count") or 3))
        pr.setdefault("sample_question", f"完成与「{nn['title']}」相关的练习题")
        nn["practice"] = pr
        new_nodes.append(nn)

new_edges = []
for i, e in enumerate(g["edges"], 1):
    src_id = e.get("from") or e.get("source")
    dst_id = e.get("to") or e.get("target")
    et = TYPE_MAP.get(e["type"], e["type"])
    new_edges.append(
        {
            "from": id_map[src_id],
            "to": id_map[dst_id],
            "type": et,
            "weight": float(e.get("weight", 0.8 if et == "prerequisite" else 0.6)),
            "description": e.get("description") or "",
        }
    )

layers = []
for i, lid in enumerate(layer_order):
    name, name_en, goal, prep, hours = LAYER_META[lid]
    layers.append(
        {
            "layer_id": lid,
            "layer_name": name,
            "layer_name_en": name_en,
            "order": i,
            "goal": goal,
            "prerequisites": prep,
            "estimated_hours": hours,
            "nodes": [id_map[n["node_id"]] for n in by_layer[lid]],
            "unlock_condition": "完成本层所有必修节点并通过测验",
        }
    )

path_specs = [
    ("beginner", "零基础入门路径", 14, ["L0", "L1", "L2", "L3"]),
    ("analyst", "数据分析师路径", 30, ["L1", "L2", "L3", "L4"]),
    ("engineer", "后端工程师路径", 45, ["L1", "L2", "L3", "L5", "L6"]),
]
old_paths = {p.get("path_id"): p for p in g.get("learning_paths", [])}
paths = []
for pid, name, days, lids in path_specs:
    old = old_paths.get(pid) or {}
    seq = old.get("node_sequence") or old.get("node_ids") or old.get("nodes") or []
    if seq and all(x in id_map for x in seq):
        node_sequence = [id_map[x] for x in seq]
    else:
        node_sequence = []
        for lid in lids:
            node_sequence.extend(id_map[n["node_id"]] for n in by_layer[lid])
    paths.append(
        {
            "path_id": pid,
            "name": name,
            "node_sequence": node_sequence,
            "estimated_days": int(old.get("duration_days") or old.get("estimated_days") or days),
        }
    )

out = {
    "graph_meta": {
        "name": "SQL Learning Knowledge Graph",
        "version": "1.0",
        "language": "zh-CN",
        "total_layers": 7,
        "total_nodes": len(new_nodes),
        "total_edges": len(new_edges),
        "description": "从零到进阶的 SQL 学习知识图谱",
    },
    "layers": layers,
    "nodes": new_nodes,
    "edges": new_edges,
    "learning_paths": paths,
}

ids = {n["node_id"] for n in new_nodes}
assert len(ids) == len(new_nodes)
for n in new_nodes:
    for p in n["prerequisites"]:
        assert p in ids, (n["node_id"], p)
    for r in n["related_nodes"]:
        assert r in ids, (n["node_id"], r)
conn = set()
for e in new_edges:
    assert e["from"] in ids and e["to"] in ids
    assert e["type"] in {"prerequisite", "related", "contrasts", "extends"}
    conn.add(e["from"])
    conn.add(e["to"])
orphans = ids - conn
assert not orphans, orphans
for lid in layer_order:
    c = sum(1 for n in new_nodes if n["layer_id"] == lid)
    assert 3 <= c <= 8, (lid, c)
assert len(paths) == 3
contrasts = [e for e in new_edges if e["type"] == "contrasts"]
assert len(contrasts) >= 3

src.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
title = {n["node_id"]: n["title"] for n in new_nodes}
print("OK nodes", len(new_nodes), "edges", len(new_edges))
print("per_layer", {lid: sum(1 for n in new_nodes if n["layer_id"] == lid) for lid in layer_order})
print("contrasts:")
for e in contrasts:
    print(f"  {e['from']} {title[e['from']]} <-> {e['to']} {title[e['to']]}")
