# SQL 学习知识图谱 · 摘要

## 规模
- **层**：L0–L6（7 层）
- **节点**：47（ID 规范：`L{n}.N{m}`）
- **边**：94（`prerequisite` / `related` / `contrasts` / `extends`）
- **路径**：3 条（beginner / analyst / engineer）

## 分层一览
| 层 | 名称 | 节点数 | 学时(估) | 节点 |
|----|------|--------|----------|------|
| L0 | 环境与基础认知 | 5 | 3h | L0.N1, L0.N2, L0.N3, L0.N4, L0.N5 |
| L1 | 基础查询 | 6 | 6h | L1.N1, L1.N2, L1.N3, L1.N4, L1.N5, L1.N6 |
| L2 | 聚合与分组 | 5 | 6h | L2.N1, L2.N2, L2.N3, L2.N4, L2.N5 |
| L3 | 多表连接 | 8 | 10h | L3.N1, L3.N2, L3.N3, L3.N4, L3.N5, L3.N6, L3.N7, L3.N8 |
| L4 | 进阶查询 | 8 | 12h | L4.N1, L4.N2, L4.N3, L4.N4, L4.N5, L4.N6, L4.N7, L4.N8 |
| L5 | 数据库设计与性能 | 8 | 14h | L5.N1, L5.N2, L5.N3, L5.N4, L5.N5, L5.N6, L5.N7, L5.N8 |
| L6 | 实战与工程化 | 7 | 16h | L6.N1, L6.N2, L6.N3, L6.N4, L6.N5, L6.N6, L6.N7 |

## 必含对比（contrasts）
- `L1.N2` WHERE ↔ `L2.N3` HAVING
- `L3.N1` INNER JOIN ↔ `L3.N2` LEFT JOIN
- `L3.N7` UNION ↔ `L3.N8` UNION ALL
- `L4.N2` ROW_NUMBER ↔ `L4.N3` RANK ↔ `L4.N4` DENSE_RANK
- `L5.N4` 视图与存储过程 ↔ `L5.N5` 物化视图
- `L5.N6` DELETE ↔ `L5.N7` TRUNCATE ↔ `L5.N8` DROP

## 学习路径
1. **beginner**（14 天）· 零基础入门路径  
   `L0.N1 → L0.N2 → L0.N3 → L0.N4 → L0.N5 → L1.N1 → L1.N2 → L1.N3 → L1.N4 → L1.N5 → L1.N6 → L2.N1 → L2.N2 → L2.N3 → L2.N4 → L2.N5 → L3.N1 → L3.N2 → L3.N3 → L3.N4 → L3.N5 → L3.N6 → L3.N7 → L3.N8`
2. **analyst**（30 天）· 数据分析路径  
   `L1.N1 → L1.N2 → L1.N3 → L1.N4 → L1.N5 → L1.N6 → L2.N1 → L2.N2 → L2.N3 → L2.N4 → L2.N5 → L3.N1 → L3.N2 → L3.N3 → L3.N4 → L3.N5 → L3.N6 → L3.N7 → L3.N8 → L4.N1 → L4.N2 → L4.N3 → L4.N4 → L4.N5 → L4.N6 → L4.N7 → L4.N8`
3. **engineer**（45 天）· 数据工程路径  
   `L1.N1 → L1.N2 → L1.N3 → L1.N4 → L1.N5 → L1.N6 → L2.N1 → L2.N2 → L2.N3 → L2.N4 → L2.N5 → L3.N1 → L3.N2 → L3.N3 → L3.N4 → L3.N5 → L3.N6 → L3.N7 → L3.N8 → L5.N1 → L5.N2 → L5.N3 → L5.N4 → L5.N5 → L5.N6 → L5.N7 → L5.N8 → L6.N1 → L6.N2 → L6.N3 → L6.N4 → L6.N5 → L6.N6 → L6.N7`

## 扩展建议
- 为每个节点增加 quiz 题库（选择题 + SQL 判题用例）并挂到 `practice`
- 增加方言分支边（PostgreSQL / MySQL / BigQuery）作为 `related` 子图
- 在 L4 增加 LEAD/LAG、NTILE；在 L5 增加分区表与统计信息
- 为 adaptive engine 增加 `mastery_weight` 与错误标签映射

## 文件
- `D:\cursor\数据学习平台\_gen\sql_learning_kg\sql_learning_knowledge_graph.json` — 主图谱
- `CHECKLIST.md` — 质量自检
- `build_and_validate.py` — 构建与校验脚本
