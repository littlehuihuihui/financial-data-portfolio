# SQL 学习知识图谱 · 摘要

## 规模
- **层**：L0–L6（7 层）
- **节点**：47（ID 规范：`L{n}.N{m}`，如 `L3.N5`）
- **边**：94（`prerequisite` / `related` / `contrasts` / `extends`）
- **路径**：3 条（beginner / analyst / engineer）

## 分层一览
| 层 | 名称 | 节点数 | 学时(估) |
|----|------|--------|----------|
| L0 | 环境与基础认知 | 5 | 3h |
| L1 | 基础查询 | 6 | 6h |
| L2 | 聚合与分组 | 5 | 6h |
| L3 | 多表连接 | 8 | 10h |
| L4 | 进阶查询 | 8 | 12h |
| L5 | 数据库设计与性能 | 8 | 14h |
| L6 | 实战与工程化 | 7 | 16h |

## 必含对比（contrasts）
- `L1.N2` WHERE ↔ `L2.N3` HAVING
- `L3.N1` INNER JOIN ↔ `L3.N2` LEFT JOIN
- `L3.N7` UNION ↔ `L3.N8` UNION ALL
- `L4.N2` ROW_NUMBER ↔ `L4.N3` RANK ↔ `L4.N4` DENSE_RANK
- `L5.N4` 视图 ↔ `L5.N5` 物化视图
- `L5.N6` DELETE ↔ `L5.N7` TRUNCATE ↔ `L5.N8` DROP

## 学习路径
1. **beginner**（14 天）：L0→L3，从环境到 JOIN/集合
2. **analyst**（30 天）：偏 L1–L4，窗口/CTE/分析套路
3. **engineer**（45 天）：偏 L1–L3 + L5–L6，设计/性能/工程化

## 文件
- `sql_learning_knowledge_graph.json` — 主图谱（已规范 ID）
- `CHECKLIST.md` — 质量自检
- `remap_ids.py` — ID 规范化脚本
