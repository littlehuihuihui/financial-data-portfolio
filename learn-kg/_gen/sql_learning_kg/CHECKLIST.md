# SQL Learning KG · Quality Checklist

- [x] `graph_meta` / `layers` / `nodes` / `edges` / `learning_paths` 齐全
- [x] 节点 ID 全部为 `L{n}.N{m}`
- [x] 每层节点数 3–8（实际：5/6/5/8/8/8/7）
- [x] 边类型仅 4 种：prerequisite / related / contrasts / extends
- [x] 含 WHERE↔HAVING、INNER↔LEFT、UNION↔UNION ALL、窗口排名对比、视图↔物化视图、DELETE/TRUNCATE/DROP
- [x] 3 条路径：beginner(14) / analyst(30) / engineer(45)
- [x] prerequisites / related_nodes / 边端点均指向存在节点
- [x] 无孤立节点（每节点至少出现在一条边）
- [x] `json.loads` 可解析；`build_and_validate.py` 断言通过
- [x] 每节点含 practice.exercise_count ≥ 1；key_points 3–5；common_mistakes 2–4
- [x] L0–L6 必含主题词覆盖（含 Pivot/Unpivot、存储过程、权限）
- [x] 示例统一围绕 employees / orders / products
- [x] graph_meta.total_nodes / total_edges 与实际一致

## 交付路径
`D:\cursor\数据学习平台\_gen\sql_learning_kg\sql_learning_knowledge_graph.json`

## Validation
- status: OK
- nodes: 47
- edges: 94
