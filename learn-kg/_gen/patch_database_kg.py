# -*- coding: utf-8 -*-
"""Add DATABASE_KNOWLEDGE_TREE + wire into home hubs / KG_TREES."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")


def lesson(s: str) -> str:
    return s.strip()


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="sql"):
    fence = "sql" if lang == "sql" else lang
    return lesson(f"""
### 课前

- **场景**：{scene}
- **目标**：{goal}
- **先修**：{prereq}

### 样例输入

{sample}

### 是什么

{what}

### 怎么写

```{fence}
{code}
```

### 查询结果

{result}

### 用在哪

{uses}

### 易错对照

{traps}

### 动手

{drill}
""")


DB_CONSTITUTION = lesson("""
### 课前 · 这是什么

本页是 **数据库教程公约**：概念与引擎选型用统一业务样例；表结构与 **SQL / Python** 教程同源（`users` / `orders` / `order_events` / `order_items`）。先读本页，再建库灌数，再按学习路径推进。

### 统一样例库（与 SQL 同源）

在 MySQL 8 / PostgreSQL / SQLite 任一引擎执行（见 SQL「教程宪法」完整 DDL）。验收：

```sql
SELECT 'users' t, COUNT(*) n FROM users
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_events', COUNT(*) FROM order_events
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
-- 期望 4 / 8 / 7 / 5
```

### 本课关注点（相对 SQL 课）

| 层 | 数据库课强调 | SQL 课强调 |
|---|---|---|
| 概念 | OLTP/OLAP、ACID、引擎、复制备份 | 语句写法与口径 |
| 事务 | 隔离/锁/崩溃恢复直觉 | BEGIN 与隔离级别语法 |
| 索引 | BTree/选择性/回表 | EXPLAIN 与改写 |

### 金标准课模板

课前 → 样例输入 → 是什么 → 怎么写 → 结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
宪法 → OLTP/OLAP → ACID → 存储引擎 → 索引 → 事务/隔离
→ 行锁死锁 → 复制/备份 → MySQL·PG → Redis/文档/列存选型 → 练习场
```
""")

DB_TREE = {
    "id": "db-root",
    "title": "数据库",
    "level": "?",
    "content": "### 数据库知识图谱\n\n1. 先打开 **学习路径 → 教程宪法**，建与 SQL 同源样例库\n2. 弄清 OLTP/OLAP 与 ACID，再学索引与事务\n3. 最后做引擎选型（MySQL/PG/Redis/文档/列存）\n\n交互：再点中心展开领域；叶子打开讲义。",
    "children": [
        {
            "id": "db-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初/中/高清单 → 练习场**。样例与 SQL 共用。",
            "children": [
                {
                    "id": "db-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读\n\n统一样例 + 与 SQL 课的分工。点下方叶子打开全文。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": DB_CONSTITUTION,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "db-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线清单 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：能解释库的角色、ACID、基本索引，并在样例库上做简单事务。
- **先修**：教程宪法（建统一样例）

### 建议顺序

```text
0. 统一样例与课模板
1. OLTP vs OLAP
2. ACID
3. 存储引擎直觉
4. 主键与约束
5. BTree 索引入门
6. BEGIN/COMMIT
7. 初级练习
```

### 注意啥

- 语法细节可跳到 SQL 课；本树偏「为什么这样设计」。
"""),
                            "children": [],
                        },
                        {
                            "id": "db-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：隔离级别、锁与死锁、复制与备份、MySQL/PG 差异。
- **建议顺序**：隔离 → 脏读幻读 → 行锁 → 死锁 → 复制 → 备份 → 方言差异
"""),
                            "children": [],
                        },
                        {
                            "id": "db-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：多引擎选型（Redis/Mongo/ClickHouse/向量）、连接池与容量规划。
- **注意**：生产变更与压测只在测试环境做。
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "db-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "用统一样例验收数据库初级概念。",
                                "完成建约束思维、索引选择、最小事务。",
                                "初级清单叶子",
                                "统一四表已存在。",
                                "- **练习场（初级）**：概念 + 可跑 SQL。",
                                """-- Q1 说明：orders 适合 OLTP 还是 OLAP？为什么？
-- A1 明细点查/短更新 → OLTP 画像；若日扫全表聚合可副本/仓。

-- Q2 给「按 status + created_at 列表」选索引
CREATE INDEX idx_orders_status_created ON orders (status, created_at);

-- Q3 事务：把 104 标 paid 并写事件（同成同败）
START TRANSACTION;
  UPDATE orders SET status='paid' WHERE order_id=104 AND status='created';
  INSERT INTO order_events(event_id,order_id,event_type,event_time)
  VALUES (8,104,'paid','2024-01-01 12:05:00');
COMMIT;

-- Q4 从未下单用户（完整性思维）
SELECT u.user_id, u.user_name FROM users u
LEFT JOIN orders o ON o.user_id=u.user_id
WHERE o.order_id IS NULL;""",
                                "| 题 | 要点 |\n|---|---|\n| Q3 | 中途失败应 ROLLBACK |\n| Q4 | Dan |",
                                "1. 结业自测  2. 与 SQL 初级对照",
                                "| 错法 | 纠正 |\n|---|---|\n| 无事务写两表 | 用 START TRANSACTION |\n| 每列都建索引 | 按查询建组合索引 |",
                                "写出：若 amount 用 FLOAT 会有什么业务风险？",
                            ),
                            "children": [],
                        }
                    ],
                },
            ],
        },
        {
            "id": "db-concepts",
            "title": "核心概念",
            "level": "?",
            "content": "### 核心概念\n\n负载类型、事务语义、引擎职责。",
            "children": [
                {
                    "id": "db-workload",
                    "title": "负载与模型",
                    "level": "?",
                    "content": "### 负载与模型 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-oltp-olap",
                            "title": "OLTP vs OLAP",
                            "level": "?",
                            "content": gold(
                                "订单库既要收银更新，又要出日报——是否同一引擎硬扛？",
                                "分清 OLTP/OLAP 特征，并映射到统一样例查询。",
                                "教程宪法 → 下一课：ACID",
                                "点查 `order_id=101` vs `SUM(amount) GROUP BY` 全表。",
                                "- **OLTP**：少量行读写、低延迟、强事务（下单/支付）。\n- **OLAP**：大范围扫描聚合、吞吐优先（日报/漏斗）。\n- **直觉**：柜员窗口 vs 仓库盘点。",
                                """-- OLTP 画像：主键点查 / 短更新
SELECT * FROM orders WHERE order_id = 101;
UPDATE orders SET status='paid' WHERE order_id=104 AND status='created';

-- OLAP 画像：宽扫聚合（样例很小，生产会上副本/仓/列存）
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid'
GROUP BY user_id;""",
                                "点查返回 1 行；聚合得到每用户 GMV（Ada 350…）。",
                                "1. 选型评审  2. 读写分离理由  3. 是否上 ClickHouse/仓",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 主库跑重报表 | 锁/IO 打满 | 分析副本或仓 |\n| 用文档库硬做强一致转账 | 难保证 | 交易走关系库 |",
                                "给「库存扣减」与「近 90 天 GMV 看板」各贴 OLTP 或 OLAP 标签。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-acid",
                            "title": "ACID",
                            "level": "?",
                            "content": gold(
                                "支付成功写了订单，事件表插入失败——钱款状态能否只成功一半？",
                                "能用业务语言解释 A/C/I/D，并用事务保护多样例写。",
                                "OLTP/OLAP → 下一课：存储引擎",
                                "订单 104 + order_events 双写。",
                                "- **Atomicity 原子**：全成或全撤。\n- **Consistency 一致**：约束不被破坏（主键/外键/业务不变量）。\n- **Isolation 隔离**：并发事务互不干扰的程度（见隔离级别）。\n- **Durability 持久**：提交后宕机也不丢（WAL/刷盘）。",
                                """START TRANSACTION;
  UPDATE orders SET status='paid' WHERE order_id=104 AND status='created';
  INSERT INTO order_events(event_id,order_id,event_type,event_time)
  VALUES (8,104,'paid','2024-01-01 12:05:00');
  -- 若这里失败：ROLLBACK;
COMMIT;""",
                                "成功则 104=paid 且事件存在；ROLLBACK 后两者都不变。",
                                "1. 下单/转账  2. 库存与订单  3. 对账任务分段提交",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 默认 autocommit 多句 | 中间态可见 | 显式事务 |\n| 把隔离当成绝对串行 | 误解 | 查隔离级别课 |",
                                "故意让 INSERT 使用重复 event_id，观察 ROLLBACK 后订单状态。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-engine",
                            "title": "存储引擎直觉",
                            "level": "??",
                            "content": gold(
                                "听说 MySQL 要选 InnoDB，不选 MyISAM——为何？",
                                "建立「引擎=存取与事务实现」的直觉；知道行存/列存差异。",
                                "ACID → 下一课：主键约束",
                                "同一逻辑表 `orders`，不同引擎能力不同。",
                                "- **一句话定义**：引擎决定如何落盘、索引、锁与是否支持事务。\n- **行存**：适合点查/更新（InnoDB）。\n- **列存**：适合宽表聚合（ClickHouse 等）。",
                                """-- MySQL：查看表引擎
SHOW TABLE STATUS LIKE 'orders';
-- 创建时指定（示例）
-- CREATE TABLE orders (...) ENGINE=InnoDB;

-- 思考题（不必执行）：
-- 若 orders 无事务引擎，Q3 双写失败时能否自动回滚？""",
                                "InnoDB 下事务可回滚；无事务引擎则需应用层补偿。",
                                "1. 建表规范  2. 迁移动力  3. HTAP/列存选型",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 新表默认不看引擎 | 无事务/无 FK | 规范强制 InnoDB |\n| 行存扛百亿明细报表 | 扫不动 | 列存/仓 |",
                                "用一句话区分：Redis 是「引擎」还是「另一类数据库产品」？",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "db-schema",
                    "title": "表与约束",
                    "level": "?",
                    "content": "### 表与约束 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-pk-constraint",
                            "title": "主键与约束",
                            "level": "?",
                            "content": gold(
                                "重复插入 order_id=101 或 user_name=NULL，库应拒绝。",
                                "理解 PK/NOT NULL/UNIQUE/FK 如何防脏。",
                                "存储引擎 → 下一课：BTree 索引",
                                "统一库已有主键；可另建练习表。",
                                "- **主键**：唯一且非空，定位一行。\n- **约束**：合法性规则，写错即失败。\n- **外键**：引用完整（OLTP 常用；数仓常省略）。",
                                """-- 应失败：重复 PK
-- INSERT INTO orders VALUES (101,1,1.00,'paid',NOW());

CREATE TABLE IF NOT EXISTS user_email (
  user_id INT PRIMARY KEY,
  email VARCHAR(64) NOT NULL UNIQUE
);
INSERT INTO user_email VALUES (1,'ada@example.com');
-- INSERT INTO user_email VALUES (2,'ada@example.com'); -- UNIQUE 失败""",
                                "重复主键/邮箱被拒绝；属于正确行为。",
                                "1. 建模评审  2. 导入质检  3. 与 SQL「约束」课互证",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只靠应用校验 | 脚本绕过脏数 | 库内约束兜底 |\n| 金额用 FLOAT | 对账差一分 | DECIMAL |",
                                "解释为何 `orders.amount` 允许 NULL，而 `status` 不允许。",
                            ),
                            "children": [],
                        }
                    ],
                },
            ],
        },
        {
            "id": "db-access",
            "title": "索引与访问路径",
            "level": "??",
            "content": "### 索引与访问路径\n\n目录如何加速查找；代价是什么。",
            "children": [
                {
                    "id": "db-index-sec",
                    "title": "索引",
                    "level": "??",
                    "content": "### 索引 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-btree-index",
                            "title": "BTree 索引入门",
                            "level": "??",
                            "content": gold(
                                "列表接口：`status='paid' ORDER BY created_at LIMIT 20` 变慢。",
                                "理解 BTree 是有序目录；会为过滤+排序建组合索引。",
                                "主键约束 → 下一课：EXPLAIN 直觉",
                                "统一库 `orders`（数据量小，重在形态）。",
                                "- **一句话定义**：额外维护的有序查找结构，用空间换时间。\n- **最左前缀**：`(status, created_at)` 支持 status 等值 + 时间范围。\n- **代价**：加速读，拖慢写。",
                                """CREATE INDEX idx_orders_status_created
  ON orders (status, created_at);

SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status='paid'
ORDER BY created_at DESC
LIMIT 5;

EXPLAIN SELECT order_id FROM orders WHERE status='paid';""",
                                "业务结果为最近支付单；计划中关注是否使用该索引（大表更明显）。",
                                "1. 列表接口  2. JOIN 键  3. 唯一约束",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 对列套 DATE() 过滤 | 索引难用 | 写成时间范围 |\n| 每列单索引 | 优化器仍差 | 按查询建组合 |",
                                "设计：`WHERE user_id=? AND status=?` 的索引列顺序。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-explain-intro",
                            "title": "EXPLAIN 直觉",
                            "level": "??",
                            "content": gold(
                                "想确认有没有全表扫描。",
                                "会跑 EXPLAIN，认识 access / key / rows 等基本字段。",
                                "BTree 索引 → 下一课：事务边界",
                                "带索引的 paid 查询。",
                                "- **一句话定义**：优化器打印「打算怎么执行」。\n- **用途**：验证索引、发现坏 JOIN、临时排序。",
                                """EXPLAIN
SELECT o.order_id, i.sku_id
FROM orders o
JOIN order_items i ON i.order_id=o.order_id
WHERE o.status='paid';

-- 对照：先过滤再关联的意识（优化器常自动下推）
EXPLAIN
SELECT order_id FROM orders WHERE status='paid';""",
                                "关注 type/key/rows/Extra；小样例 rows 都很小——练习惯。",
                                "1. 慢 SQL 首诊  2. 上线前核对  3. 接 SQL 调优课",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只看 EXPLAIN 不测真实 | 估计偏差 | 有条件用 ANALYZE |\n| 看不懂就狂加索引 | 写变慢 | 对准 WHERE/JOIN |",
                                "对比爆炸 JOIN 与先聚合再 JOIN 的 EXPLAIN rows。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "db-txn",
            "title": "事务与并发",
            "level": "??",
            "content": "### 事务与并发\n\n边界、隔离、锁。细节语法可回 SQL 金课。",
            "children": [
                {
                    "id": "db-txn-basic",
                    "title": "事务基础",
                    "level": "??",
                    "content": "### 事务基础 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-begin-commit",
                            "title": "事务边界",
                            "level": "??",
                            "content": gold(
                                "更新订单状态与写事件必须同成同败。",
                                "会用 START TRANSACTION / COMMIT / ROLLBACK。",
                                "EXPLAIN → 下一课：隔离级别要点",
                                "订单 104（created）。",
                                "- **一句话定义**：多句 SQL 的原子边界。\n- **注意**：客户端常默认 autocommit。",
                                """START TRANSACTION;
  UPDATE orders SET status='cancelled'
  WHERE order_id=104 AND status='created';
  -- 检查行数；不对则 ROLLBACK
COMMIT;""",
                                "104 变为 cancelled；回滚则保持原状。",
                                "1. 支付  2. 库存  3. 批量作业分段",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 长事务 | 锁等待/版本堆 | 缩小临界区 |\n| DDL 混进事务 | 隐式提交（视引擎） | 查文档 |",
                                "开事务更新后不提交，另开会话观察可见性（接隔离课）。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-isolation-brief",
                            "title": "隔离级别要点",
                            "level": "???",
                            "content": gold(
                                "报表两次 SUM 不一致；或读到未提交金额。",
                                "记住四级隔离与脏读/不可重复读/幻读对应关系；细节见 SQL 金课。",
                                "事务边界 → 下一课：行锁与死锁",
                                "统一库；双会话实验。",
                                "- **RU / RC / RR / Serializable**：可见性越来越严，并发度通常下降。\n- **默认**：MySQL InnoDB 常 RR；PostgreSQL 常 RC。\n- **深读**：SQL 树「隔离级别」金课。",
                                """-- MySQL
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
  SELECT user_id, SUM(COALESCE(amount,0)) gmv
  FROM orders WHERE status='paid' GROUP BY user_id;
COMMIT;""",
                                "元数据：看到当前隔离；业务聚合结果本身不变，变的是并发下的稳定性。",
                                "1. 报表会话  2. 高并发写  3. 跨库迁移",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 生产开 RU | 脏读 | 禁止 |\n| 假设默认相同 | 隐性 bug | 显式设置/文档 |",
                                "跳到 SQL 金课「隔离级别」完成双会话表。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "db-lock-sec",
                    "title": "锁",
                    "level": "???",
                    "content": "### 锁 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-row-lock",
                            "title": "行锁与死锁",
                            "level": "???",
                            "content": gold(
                                "两会话互相更新 101 与 105，一方报 Deadlock。",
                                "感受行锁；掌握固定加锁顺序预防死锁。",
                                "隔离级别 → 下一课：复制",
                                "订单 101、105。",
                                "- **行锁**：锁住触及的行（点更友好）。\n- **死锁**：等待环；引擎回滚一方。\n- **预防**：全局按主键排序加锁；缩短事务。",
                                """-- 会话 A
START TRANSACTION;
UPDATE orders SET amount=amount WHERE order_id=101;
-- 会话 B
START TRANSACTION;
UPDATE orders SET amount=amount WHERE order_id=105;
UPDATE orders SET amount=amount WHERE order_id=101;  -- 等 A
-- 回 A：再锁 105 → 可能死锁

-- 预防：两边都按 order_id 升序锁 101 再 105""",
                                "一方成功一方回滚；重试要幂等。",
                                "1. 转账双边  2. 订单+库存  3. 事故复盘",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 加锁顺序随输入变 | 易死锁 | 排序 |\n| 大范围无索引更新 | 锁更多行 | 可索引条件 |",
                                "按升序改写两边事务，确认不再死锁。",
                            ),
                            "children": [],
                        }
                    ],
                },
            ],
        },
        {
            "id": "db-ops",
            "title": "高可用与运维",
            "level": "???",
            "content": "### 高可用与运维\n\n复制、备份、方言。",
            "children": [
                {
                    "id": "db-ha",
                    "title": "复制与备份",
                    "level": "???",
                    "content": "### 复制与备份 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-replication",
                            "title": "复制与读写分离",
                            "level": "???",
                            "content": gold(
                                "主库被报表打满；希望读走副本。",
                                "理解主从复制与只读副本的延迟代价。",
                                "行锁死锁 → 下一课：备份恢复",
                                "概念课；用统一库想象「主写付、从读报」。",
                                "- **复制**：主库变更传到副本。\n- **读写分离**：写主读从；注意**复制延迟**导致读旧。\n- **故障切换**：提升副本为主（需编排/中间件）。",
                                """-- 角色示意（勿在未配置环境盲跑）
-- 主：写
UPDATE orders SET status='paid' WHERE order_id=104;
-- 从：读（可能短暂读到旧值）
SELECT status FROM orders WHERE order_id=104;

-- 应用策略：支付成功页读主；报表读从可接受秒级延迟""",
                                "思维结果：强一致读（支付结果）→ 读主；可延迟分析 → 读从。",
                                "1. 扩读  2. 高可用  3. 备份源",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 写后立刻读从 | 读到旧状态 | 关键读主 |\n| 副本当备份唯一手段 | 误删也会复制 | 要真备份 |",
                                "列出 3 个必须读主的业务接口。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-backup",
                            "title": "备份与恢复",
                            "level": "???",
                            "content": gold(
                                "误 DELETE 了订单，如何回到误操作前？",
                                "分清逻辑备份/物理备份；建立 RPO/RTO 意识。",
                                "复制 → 下一课：MySQL 与 PG",
                                "样例库可练逻辑导出。",
                                "- **逻辑备份**：SQL/CSV 转储（mysqldump/pg_dump）。\n- **物理备份**：数据文件快照。\n- **RPO/RTO**：能丢多久数据 / 多久恢复。",
                                """-- MySQL 逻辑备份示意（shell）
-- mysqldump -u u -p demo users orders > demo.sql
-- mysql -u u -p demo < demo.sql

-- SQLite
-- .backup data_nexus_sample.db.bak""",
                                "恢复后 COUNT 验收仍为 4/8/7/5（若从完好备份回）。",
                                "1. 上线门禁  2. 演练恢复  3. 合规留存",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只复制不备份 | 逻辑删除全网同步 | 定期备份+保留点 |\n| 从不演练恢复 | 真挂时慌 | 定期 drill |",
                                "为「订单库」设一个示例 RPO（如 5 分钟）并说明如何达到。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "db-dialect",
                    "title": "引擎方言",
                    "level": "??",
                    "content": "### 引擎方言 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-mysql-pg",
                            "title": "MySQL 与 PostgreSQL",
                            "level": "??",
                            "content": gold(
                                "同一套样例 SQL 在两边默认隔离与 upsert 语法不同。",
                                "记住高频差异，写可移植或显式分叉。",
                                "备份 → 下一课：多引擎选型",
                                "统一四表两边均可建。",
                                "| 点 | MySQL InnoDB | PostgreSQL |\n|---|---|---|\n| 默认隔离 | 常 RR | 常 RC |\n| Upsert | ON DUPLICATE KEY | ON CONFLICT |\n| 扩展示 | 插件/较少 | 扩展丰富（含向量等） |",
                                """-- 隔离
-- MySQL: SELECT @@transaction_isolation;
-- PG:    SHOW transaction_isolation;

-- 日期+1天
-- MySQL: DATE_ADD(created_at, INTERVAL 1 DAY)
-- PG:    created_at + INTERVAL '1 day'""",
                                "验收 COUNT 两边同为 4/8/7/5；方言语句需分叉。",
                                "1. 双引擎产品  2. 迁移评估  3. ORM 方言层",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 假设默认隔离相同 | 并发 bug | 显式设置 |\n| 无注释一把 SQL | 移植失败 | 标引擎 |",
                                "列出本教程 3 处需分叉的语句。",
                            ),
                            "children": [],
                        }
                    ],
                },
            ],
        },
        {
            "id": "db-polyglot",
            "title": "多引擎选型",
            "level": "???",
            "content": "### 多引擎选型\n\n关系库不是唯一答案；按负载选型。",
            "children": [
                {
                    "id": "db-engines",
                    "title": "典型引擎",
                    "level": "???",
                    "content": "### 典型引擎 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "db-redis",
                            "title": "Redis 缓存/键值",
                            "level": "???",
                            "content": gold(
                                "热点商品库存或会话要极低延迟——是否仍打 MySQL？",
                                "知道 Redis 适合缓存/排行/限流；不是事务真相的替代。",
                                "MySQL·PG → 下一课：文档库",
                                "订单 101 的库存/会话键示意。",
                                "- **定位**：内存键值，微秒～毫秒级。\n- **典型**：缓存、分布式锁、排行榜、限流。\n- **原则**：**真相在 DB**，缓存可丢要能回源。",
                                """# redis-cli 示意
SET order:101:stock 42
GET order:101:stock
INCR order:101:view
EXPIRE session:ada 3600""",
                                "GET 返回 42；缓存未命中时应回源 `orders`/`库存表`。",
                                "1. 热点读  2. 会话  3. 限流计数",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只写 Redis 当账本 | 丢数据 | DB 为权威 |\n| 无过期无淘汰 | 内存爆 | TTL/策略 |",
                                "设计：支付成功后如何让 `order:101:status` 缓存失效？",
                                "bash",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-mongo",
                            "title": "文档模型直觉",
                            "level": "???",
                            "content": gold(
                                "订单详情结构多变（不同业务线字段不同），想少做 DDL。",
                                "理解文档模型灵活处与事务/关联弱处。",
                                "Redis → 下一课：列存 OLAP",
                                "把一笔订单 + items 想成一份文档。",
                                "- **定位**：JSON/BSON 文档存储。\n- **适合**：灵活schema、内容型、目录。\n- **谨慎**：强一致多文档事务、复杂关联报表。",
                                """// MongoDB shell 示意
db.orders.insertOne({
  _id: 101,
  user_id: 1,
  amount: 80,
  status: "paid",
  items: [{sku:"SKU-A", qty:1}, {sku:"SKU-B", qty:2}]
})
db.orders.find({status: "paid", user_id: 1})""",
                                "一份文档内嵌 items，避免关系库那种一单多行；但跨单聚合报表往往不如仓。",
                                "1. 内容元数据  2. 快速迭代业务  3. 目录型",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 用文档库做银行账 | 一致性难 | 交易回关系库 |\n| 无节制嵌套 | 文档巨大 | 边界设计 |",
                                "判断：统一样例的「每日 GMV 报表」更该放哪类引擎？",
                                "javascript",
                            ),
                            "children": [],
                        },
                        {
                            "id": "db-clickhouse",
                            "title": "列存 OLAP 直觉",
                            "level": "???",
                            "content": gold(
                                "百亿行订单明细要做多维聚合，行存主库扛不住。",
                                "理解列存适合宽扫聚合；不适合高频单行更新。",
                                "文档模型 → 练习场/进阶",
                                "把 `orders` 想象放大亿级。",
                                "- **定位**：列式存储，高压缩、向量化执行。\n- **适合**：行为日志、明细分析、实时看板。\n- **不适合**：高频点更新、强事务交叉写。",
                                """-- ClickHouse 示意
-- SELECT user_id, sum(amount) FROM orders WHERE status='paid' GROUP BY user_id;

-- 装载思路：从 OLTP 增量同步到 CH，报表打 CH""",
                                "同类聚合在 CH 上吞吐远高于行存主库（数量级体感）。",
                                "1. 流量分析  2. 经营看板  3. 日志检索聚合",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 当主事务库 | 更新/事务弱 | OLTP 仍用 PG/MySQL |\n| 无分区/无 TTL | 成本爆 | 按日分区 |",
                                "画一条链路：下单写 MySQL → 同步 → CH 出 GMV 看板。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
    ],
}


def extract_object(src: str, marker: str):
    i = src.find(marker)
    if i < 0:
        raise SystemExit(f"missing {marker}")
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


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    kids = n.get("children") or []
    if not kids:
        acc.append(n["id"])
    for c in kids:
        walk_leaves(c, acc)
    return acc


# Insert DATABASE_KNOWLEDGE_TREE before KG_TREES (after BI tree end is messy; put before const KG_TREES)
marker = "    const KG_TREES = {"
if "const DATABASE_KNOWLEDGE_TREE" in text:
    s, e, _ = extract_object(text, "const DATABASE_KNOWLEDGE_TREE = ")
    text = text[:s] + json.dumps(DB_TREE, ensure_ascii=False, indent=2) + text[e:]
    print("OK refreshed DATABASE_KNOWLEDGE_TREE")
else:
    block = (
        "\n    const DATABASE_KNOWLEDGE_TREE = "
        + json.dumps(DB_TREE, ensure_ascii=False, indent=2)
        + ";\n\n"
    )
    if marker not in text:
        raise SystemExit("KG_TREES marker missing")
    text = text.replace(marker, block + marker, 1)
    print("OK inserted DATABASE_KNOWLEDGE_TREE")

# Wire KG_TREES
old_kg = """    const KG_TREES = {
      sql: SQL_KNOWLEDGE_TREE,
      ml: ML_KNOWLEDGE_TREE,
      python: PYTHON_KNOWLEDGE_TREE,
      etl: ETL_KNOWLEDGE_TREE,
      dwh: DWH_KNOWLEDGE_TREE,
      bi: BI_KNOWLEDGE_TREE
    };"""
new_kg = """    const KG_TREES = {
      sql: SQL_KNOWLEDGE_TREE,
      python: PYTHON_KNOWLEDGE_TREE,
      database: DATABASE_KNOWLEDGE_TREE,
      ml: ML_KNOWLEDGE_TREE,
      etl: ETL_KNOWLEDGE_TREE,
      dwh: DWH_KNOWLEDGE_TREE,
      bi: BI_KNOWLEDGE_TREE
    };"""
if old_kg not in text:
    # maybe already patched partially
    if "database: DATABASE_KNOWLEDGE_TREE" not in text:
        raise SystemExit("KG_TREES block mismatch")
else:
    text = text.replace(old_kg, new_kg, 1)
    print("OK KG_TREES.database")

# Home hubs
old_hubs = 'const HOME_HERO_HUBS = ["sql", "python", "ml", "etl", "dwh", "bi"];'
new_hubs = 'const HOME_HERO_HUBS = ["sql", "python", "database", "ml", "etl", "dwh", "bi"];'
if old_hubs in text:
    text = text.replace(old_hubs, new_hubs, 1)
    print("OK HOME_HERO_HUBS")
elif "database" not in text[text.find("HOME_HERO_HUBS") : text.find("HOME_HERO_HUBS") + 120]:
    raise SystemExit("HOME_HERO_HUBS update failed")

old_sub = """    const HOME_HERO_SUB = {
      sql: "查询与建模",
      python: "分析与脚本",
      ml: "模型与任务",
      etl: "集成与调度",
      dwh: "分层与建模",
      bi: "指标与看板"
    };"""
new_sub = """    const HOME_HERO_SUB = {
      sql: "查询与建模",
      python: "分析与脚本",
      database: "事务与引擎",
      ml: "模型与任务",
      etl: "集成与调度",
      dwh: "分层与建模",
      bi: "指标与看板"
    };"""
if old_sub in text:
    text = text.replace(old_sub, new_sub, 1)
    print("OK HOME_HERO_SUB")

# Hot entries
old_hot = """      const hubEntries = [
        { hub: "sql", label: "SQL" },
        { hub: "python", label: "Python" },
        { hub: "ml", label: "机器学习" },
        { hub: "etl", label: "ETL" },
        { hub: "dwh", label: "数据仓库" },
        { hub: "bi", label: "BI" }
      ];"""
new_hot = """      const hubEntries = [
        { hub: "sql", label: "SQL" },
        { hub: "python", label: "Python" },
        { hub: "database", label: "数据库" },
        { hub: "ml", label: "机器学习" },
        { hub: "etl", label: "ETL" },
        { hub: "dwh", label: "数据仓库" },
        { hub: "bi", label: "BI" }
      ];"""
if old_hot in text:
    text = text.replace(old_hot, new_hot, 1)
    print("OK home hot database")

# Auto-open constitution for database
old_prefer = """            const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution" : null;"""
new_prefer = """            const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution" : null;"""
if old_prefer in text:
    text = text.replace(old_prefer, new_prefer, 1)
    print("OK prefer db-constitution")

# Sector map
old_sec = """      "py-to-sql": "advanced", "py-line": "practice", "py-constitution": "practice","""
new_sec = """      "py-to-sql": "advanced", "py-line": "practice", "py-constitution": "practice",
      "db-learning-path": "practice", "db-concepts": "foundation", "db-access": "advanced",
      "db-txn": "advanced", "db-ops": "practice", "db-polyglot": "practice",
      "db-oltp-olap": "foundation", "db-acid": "foundation", "db-btree-index": "advanced",
      "db-constitution": "practice","""
if old_sec in text:
    text = text.replace(old_sec, new_sec, 1)
    print("OK KG_SECTOR_BY_ID")

# DB_SAMPLE near PYTHON_SAMPLE / SQL_SAMPLE
if "const DB_SAMPLE" not in text:
    sample = {
        "tables": ["users", "orders", "order_events", "order_items"],
        "sharedWith": "SQL_SAMPLE",
        "constitutionId": "db-constitution",
        "hubId": "database",
    }
    if "const PYTHON_SAMPLE" in text:
        text = text.replace(
            "const PYTHON_SAMPLE = ",
            "const DB_SAMPLE = "
            + json.dumps(sample, ensure_ascii=False, indent=2)
            + ";\n\n    const PYTHON_SAMPLE = ",
            1,
        )
    else:
        text = text.replace(
            "const SQL_SAMPLE = ",
            "const DB_SAMPLE = "
            + json.dumps(sample, ensure_ascii=False, indent=2)
            + ";\n\n    const SQL_SAMPLE = ",
            1,
        )
    print("OK DB_SAMPLE")

p.write_text(text, encoding="utf-8")

# Validate
t2 = p.read_text(encoding="utf-8")
assert "const DATABASE_KNOWLEDGE_TREE" in t2
assert "database: DATABASE_KNOWLEDGE_TREE" in t2
assert '"database"' in t2[t2.find("HOME_HERO_HUBS") : t2.find("HOME_HERO_HUBS") + 160]
assert "db-constitution" in t2
_, _, tree = extract_object(t2, "const DATABASE_KNOWLEDGE_TREE = ")
leaves = walk_leaves(tree)
assert find_node(tree, "db-constitution")
assert find_node(tree, "db-oltp-olap")
assert "易错对照" in find_node(tree, "db-acid")["content"]
print("VALIDATED leaves", len(leaves))
print("DONE", p.stat().st_size)
