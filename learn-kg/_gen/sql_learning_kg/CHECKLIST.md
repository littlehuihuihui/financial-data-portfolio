# SQL Learning KG · Quality Checklist

- [x] `graph_meta` / `layers` / `nodes` / `edges` / `learning_paths` 齐全
- [x] 节点 ID 全部为 `L{n}.N{m}`（如 `L0.N1`）
- [x] 每层节点数 3–8（实际：5/6/5/8/8/8/7）
- [x] 边类型仅 4 种：prerequisite / related / contrasts / extends
- [x] 含 WHERE↔HAVING、INNER↔LEFT、UNION↔UNION ALL、窗口排名对比、DELETE/TRUNCATE/DROP 等 contrasts
- [x] 3 条路径：beginner / analyst / engineer
- [x] prerequisites / related_nodes / 边端点均指向存在节点
- [x] 无孤立节点（每节点至少出现在一条边）
- [x] `json.loads` 可解析；`remap_ids.py` 断言通过
- [x] 每节点含 practice.exercise_count ≥ 1

## 交付路径
`D:\cursor\数据学习平台\_gen\sql_learning_kg\sql_learning_knowledge_graph.json`
