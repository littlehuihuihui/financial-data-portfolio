# -*- coding: utf-8 -*-
"""Align mid-path SQL leaves to constitution lesson template + shared sample."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

MID = {}

MID["sql-union"] = """
### 课前

- **场景**：要把「在售订单」与「已取消归档视角」拼成一张统一明细，并标来源。  
- **目标**：分清 `UNION`（去重）与 `UNION ALL`（保留）；对齐列数与类型。  
- **先修**：SELECT / 初级 JOIN → **下一课**：SELF JOIN

### 样例输入

用统一库两段查询模拟「多源」——不必真有 archive 表：

| 段 | 条件 | 行数（种子） |
|---|---|---:|
| live_paid | status='paid' | 6 |
| live_cancelled | status='cancelled' | 1（107） |

### 是什么

- **一句话定义**：纵向合并多个查询的结果集。  
- **区别**：`UNION` 去重；`UNION ALL` 原样拼接（通常更快）。  
- **要求**：各段列数相同、类型可兼容；列名以第一段为准。

### 怎么写

```sql
SELECT order_id, user_id, amount, status, 'paid_bucket' AS src
FROM orders
WHERE status = 'paid'
UNION ALL
SELECT order_id, user_id, amount, status, 'cancel_bucket' AS src
FROM orders
WHERE status = 'cancelled'
ORDER BY order_id;   -- 整段排序放最外（有的引擎需包一层）

-- 只要去重后的 user_id（两段合并）
SELECT user_id FROM orders WHERE status = 'paid'
UNION
SELECT user_id FROM orders WHERE status = 'cancelled';
```

### 查询结果（UNION ALL 节选）

| order_id | user_id | amount | status | src |
|---:|---:|---:|---|---|
| 101 | 1 | 80.00 | paid | paid_bucket |
| … | … | … | paid | paid_bucket |
| 107 | 3 | 200.00 | cancelled | cancel_bucket |

### 用在哪

1. **多源拼接**：在线表 + 历史分区。  
2. **标签人群合并**：多规则用户 ID 汇总。  
3. **对比实验**：A/B 结果纵向堆叠。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 默认写 UNION | 无意义去重、更慢 | 不需要去重就用 ALL |
| 列顺序/类型不一致 | 报错或隐式转换 | 显式 CAST，对齐顺序 |
| 每段各自 ORDER BY | 无效或语法错 | 最外层统一排序 |

### 动手

用 `UNION ALL` 把 `created` 与 `paid` 拼在一起，并加 `src` 列；数一下总行数是否等于两段之和。
"""

MID["sql-self-join"] = """
### 课前

- **场景**：对同一用户，想看「当前订单」与「该用户更早的一笔订单」如何对齐（教学版）。  
- **目标**：会给同表起两个别名做 SELF JOIN；知道一对多会爆炸，生产常改用 LAG。  
- **先修**：UNION → **下一课**：CROSS JOIN

### 样例输入（user_id=1 的 paid）

| order_id | amount | created_at |
|---:|---:|---|
| 101 | 80.00 | 2024-01-01 10:00:00 |
| 102 | 120.00 | 2024-01-02 11:00:00 |
| 103 | 120.00 | 2024-01-03 09:00:00 |
| 108 | 30.00 | 2024-01-07 09:30:00 |

### 是什么

- **一句话定义**：同一张表关联两次，比较行与行。  
- **直觉**：把表复印一份，左右对照。  
- **典型**：组织树（员工-经理）、版本对比、前后单。

### 怎么写

```sql
-- 教学：当前单 × 同用户更早的单（会多行）
SELECT
  a.order_id AS curr_id,
  b.order_id AS earlier_id,
  a.user_id,
  a.created_at AS curr_at,
  b.created_at AS earlier_at
FROM orders a
JOIN orders b
  ON a.user_id = b.user_id
 AND b.created_at < a.created_at
 AND a.status = 'paid'
 AND b.status = 'paid'
WHERE a.user_id = 1
ORDER BY a.order_id, b.order_id;

-- 生产更常用：LAG（见窗口课）
SELECT
  order_id,
  LAG(order_id) OVER (PARTITION BY user_id ORDER BY created_at) AS prev_order_id
FROM orders
WHERE status = 'paid' AND user_id = 1;
```

### 查询结果（直觉）

对 `curr_id=103`，`earlier_id` 可出现 101、102——行数被放大。  
`LAG` 则每行只给出**紧邻**上一笔。

### 用在哪

1. **组织树**：`emp JOIN emp mgr`。  
2. **教学对比**：先理解自关联，再换窗口。  
3. **特殊匹配**：非「上一行」的复杂条件。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 缺少时间/不等条件 | 笛卡尔爆炸 | 写清 `<` / `<>` |
| 用 SELF JOIN 硬找「上一笔」 | 难写且慢 | 优先 LAG/LEAD |
| 忘别名 | 列歧义报错 | `a`/`b` 必须区分 |

### 动手

只保留「上一笔」（每个 curr 只配 created_at 最大的 earlier）——可用子查询或改用 `LAG` 对照。
"""

MID["sql-cross-join"] = """
### 课前

- **场景**：要做「用户 × 日期」骨架，再左连事实，避免某天无单就从报表消失。  
- **目标**：有意识使用 `CROSS JOIN`；控制维表基数。  
- **先修**：SELF JOIN → **下一课**：EXISTS

### 样例输入

users：1–4；日期维用 3 天演示。

### 是什么

- **一句话定义**：两表每一行两两组合（笛卡尔积），无匹配条件。  
- **正用**：小维表骨架、参数展开。  
- **误用**：大表互叉 → 行数爆炸。

### 怎么写

```sql
WITH days AS (
  SELECT DATE('2024-01-01') AS dt UNION ALL
  SELECT DATE('2024-01-02') UNION ALL
  SELECT DATE('2024-01-03')
)
SELECT u.user_id, u.user_name, d.dt
FROM users u
CROSS JOIN days d
WHERE u.user_id IN (1, 2)    -- 先缩小用户
ORDER BY u.user_id, d.dt;

-- 骨架左连当天订单数
SELECT
  s.user_id,
  s.dt,
  COUNT(o.order_id) AS order_cnt
FROM (
  SELECT u.user_id, d.dt
  FROM users u
  CROSS JOIN days d
  WHERE u.user_id IN (1, 2)
) s
LEFT JOIN orders o
  ON o.user_id = s.user_id
 AND DATE(o.created_at) = s.dt
GROUP BY s.user_id, s.dt
ORDER BY s.user_id, s.dt;
```

### 查询结果（骨架）

| user_id | user_name | dt |
|---:|---|---|
| 1 | Ada | 2024-01-01 |
| 1 | Ada | 2024-01-02 |
| 1 | Ada | 2024-01-03 |
| 2 | Bob | 2024-01-01 |
| … | … | … |

共 2×3=6 行。

### 用在哪

1. **补全日历**：活跃用户每日一行。  
2. **参数组合**：币种 × 渠道等小维。  
3. **造数**：测试网格。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 大表 CROSS JOIN | 内存/磁盘炸 | 必须先过滤维 |
| 漏写 JOIN 条件变相叉乘 | 同上 | 审查 ON；显式写 CROSS |
| 骨架后用 INNER 连事实 | 无单日又消失 | 用 LEFT JOIN |

### 动手

对 `user_id IN (1,3)` × 上面 3 天，算出每天 `SUM(COALESCE(amount,0))`（无单为 0）。
"""

MID["sql-exists"] = """
### 课前

- **场景**：找出「至少有一笔 paid 订单」的用户，不要展开订单明细。  
- **目标**：会写相关子查询 `EXISTS` / `NOT EXISTS`；对比 IN。  
- **先修**：CROSS JOIN → **下一课**：IN 与 NOT IN

### 样例输入

users 1–4；有 paid 的用户为 1、2、3；Dan(4) 无订单。

**order_events** 中 101/102/106 有 paid 事件（102 重复）。

### 是什么

- **一句话定义**：判断子查询是否**至少存在一行**；找到即可短路。  
- **直觉**：问「有没有」，不求「有哪些行」。  
- **优势**：相关子查询、半连接场景清晰；`NOT EXISTS` 对 NULL 比 `NOT IN` 安全。

### 怎么写

```sql
-- 有过支付的用户
SELECT u.user_id, u.user_name, u.city
FROM users u
WHERE EXISTS (
  SELECT 1
  FROM orders o
  WHERE o.user_id = u.user_id
    AND o.status = 'paid'
);

-- 从未支付（含从未下单）
SELECT u.user_id, u.user_name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.user_id AND o.status = 'paid'
);

-- 用事件表：是否出现过 paid 事件
SELECT DISTINCT o.order_id
FROM orders o
WHERE EXISTS (
  SELECT 1 FROM order_events e
  WHERE e.order_id = o.order_id AND e.event_type = 'paid'
);
```

### 查询结果

**有支付**：Ada、Bob、Cara。  
**未支付**：Dan。

### 用在哪

1. **资格过滤**：是否下过单/是否违规。  
2. **半连接**：主表留行，不展开右表。  
3. **替代危险 NOT IN**：右表可能含 NULL。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `SELECT *` 执念 | 无必要 | `SELECT 1` 即可 |
| 相关键漏写 | 恒真/恒假 | `o.user_id = u.user_id` |
| 用 JOIN 去重代替 | 行膨胀再 DISTINCT | 优先 EXISTS |

### 动手

写出「有 `order_items` 明细的订单」：`EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.order_id)`。
"""

MID["sql-in-notin"] = """
### 课前

- **场景**：按用户名单筛订单；或排除某批用户——却踩了 `NOT IN` + NULL。  
- **目标**：会用 `IN`；深刻理解 `NOT IN` 遇 NULL 的陷阱。  
- **先修**：EXISTS → **下一课**：UPSERT

### 样例输入

| user_id | city |
|---:|---|
| 1 | 上海 |
| 4 | NULL |

子查询 `SELECT city FROM users` 含 NULL。

### 是什么

- **一句话定义**：`IN` 判断值是否落在列表/子查询集合中。  
- **陷阱**：`x NOT IN (1, NULL)` 整式为 UNKNOWN → WHERE 滤掉所有行。  
- **替代**：排除用 `NOT EXISTS` 或 `NOT IN` 前确保集合无 NULL。

### 怎么写

```sql
-- 安全：名单 IN
SELECT order_id, user_id, amount
FROM orders
WHERE user_id IN (1, 2)
  AND status = 'paid';

-- 危险演示：NOT IN 含 NULL
SELECT user_id, user_name
FROM users
WHERE user_id NOT IN (
  SELECT user_id FROM orders WHERE amount > 1000
  UNION ALL
  SELECT NULL   -- 人为引入 NULL
);
-- 结果常常是空集！

-- 推荐排除法
SELECT u.user_id, u.user_name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.user_id AND o.status = 'cancelled'
);
```

### 查询结果

`user_id IN (1,2)` 的 paid：101,102,103,105,108。  
含 NULL 的 `NOT IN` 演示：应看到**空结果**，并记住这个坑。

### 用在哪

1. **固定枚举**：`status IN ('paid','created')`。  
2. **名单圈选**：运营给的 ID 列表。  
3. **排除**：优先 `NOT EXISTS`。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `NOT IN (子查询含 NULL)` | 结果全空 | `NOT EXISTS` 或过滤 NULL |
| 超长 IN 列表 | 难维护/计划差 | 改临时表 JOIN |
| `IN` 多列方言不一 | 移植失败 | 用行构造或 EXISTS |

### 动手

比较：`city NOT IN (SELECT city FROM users WHERE user_id=1)` 与对 Dan 的行为；再改成 `NOT EXISTS`。
"""

MID["sql-upsert"] = """
### 课前

- **场景**：用户标签表要「有则更新分数、无则插入」，重复跑脚本不报主键错。  
- **目标**：掌握 upsert 思路；会写 MySQL / PostgreSQL 常见语法之一。  
- **先修**：INSERT / 约束 → **下一课**：VIEW

### 样例输入

先建练习表（勿改宪法四表）：

```sql
CREATE TABLE IF NOT EXISTS user_tags (
  user_id INT NOT NULL,
  tag     VARCHAR(32) NOT NULL,
  score   DECIMAL(5,2),
  PRIMARY KEY (user_id, tag)
);
INSERT INTO user_tags VALUES (1, 'high_gmv', 0.80)
  ON DUPLICATE KEY UPDATE score = score; -- MySQL 可先普通 INSERT
```

若环境无 upsert，先 `DELETE` 再 `INSERT` 理解语义即可。

### 是什么

- **一句话定义**：插入时若冲突则改为更新（update or insert）。  
- **直觉**：同一业务键只保留一行最新状态。  
- **方言**：MySQL `ON DUPLICATE KEY UPDATE`；PG `ON CONFLICT … DO UPDATE`。

### 怎么写

```sql
-- MySQL 8
INSERT INTO user_tags (user_id, tag, score) VALUES (1, 'high_gmv', 0.90)
ON DUPLICATE KEY UPDATE score = VALUES(score);

INSERT INTO user_tags (user_id, tag, score) VALUES (2, 'new_user', 0.40)
ON DUPLICATE KEY UPDATE score = VALUES(score);

-- PostgreSQL
-- INSERT INTO user_tags (user_id, tag, score) VALUES (1, 'high_gmv', 0.90)
-- ON CONFLICT (user_id, tag) DO UPDATE SET score = EXCLUDED.score;

SELECT * FROM user_tags ORDER BY user_id, tag;
```

### 查询结果

| user_id | tag | score |
|---:|---|---:|
| 1 | high_gmv | 0.90 |
| 2 | new_user | 0.40 |

再执行同一条 upsert，行数不变，分数保持/更新为你写入值。

### 用在哪

1. **维表同步**：每日覆盖标签。  
2. **幂等任务**：重跑不炸主键。  
3. **计数器**：冲突则 `cnt = cnt + 1`。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 无唯一/主键 | upsert 无法判定冲突 | 先建好约束 |
| 冲突更新写错列 | 静默更新错字段 | 明确 SET 列表 |
| 多会话无事务设计 | 仍可能竞态 | 业务幂等 + 事务 |

### 动手

对 Ada 的 `high_gmv` 再 upsert 为 `0.95`，确认只有一行且分数变化。
"""

MID["sql-view"] = """
### 课前

- **场景**：分析师总要写「paid 订单 + 用户名」；希望封装成稳定接口。  
- **目标**：会创建/查询视图；知道视图通常不存数据（逻辑视图）。  
- **先修**：UPSERT → **下一课**：INDEX 入门

### 样例输入

基于统一库 `orders` ⋈ `users`，过滤 `status='paid'`。

### 是什么

- **一句话定义**：把查询存成虚拟表，供反复引用。  
- **直觉**：命名过的 SELECT。  
- **注意**：权限、性能、可更新性因引擎而异；物化视图是另一话题。

### 怎么写

```sql
CREATE OR REPLACE VIEW v_paid_orders AS
SELECT
  o.order_id,
  o.user_id,
  u.user_name,
  u.city,
  o.amount,
  o.created_at
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid';

SELECT order_id, user_name, amount
FROM v_paid_orders
WHERE city = '上海'
ORDER BY created_at DESC;
```

### 查询结果（示意）

| order_id | user_name | amount |
|---:|---|---:|
| 106 | Cara | NULL |
| 108 | Ada | 30.00 |
| 103 | Ada | 120.00 |
| … | … | … |

### 用在哪

1. **语义层**：统一「支付订单」口径。  
2. **权限脱敏**：只暴露部分列。  
3. **简化报表**：业务方只查视图。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 把视图当缓存 | 基表一变结果变（逻辑视图） | 要缓存看物化/表 |
| 视图套视图过深 | 难优化、难排错 | 控制层数 |
| 口径写死在多处 SQL | 不一致 | 收敛到视图/CTE 规范 |

### 动手

创建 `v_user_order_cnt`：每用户 `COUNT(*)`，并查出 Dan 是否为 0。
"""

MID["sql-index-intro"] = """
### 课前

- **场景**：`WHERE status='paid' ORDER BY created_at DESC LIMIT 20` 在数据变大后变慢。  
- **目标**：理解 BTree 索引是「有序目录」；会为过滤/排序列建索引。  
- **先修**：VIEW → **下一课**：数据类型 / 复合索引

### 样例输入

统一库很小，**计划差异不明显**；本课重在语句与思想，用 `EXPLAIN` 观察是否出现索引相关访问（引擎不同显示不一）。

### 是什么

- **一句话定义**：额外维护的查找结构，用空间换时间。  
- **直觉**：书的目录，不必全表翻。  
- **代价**：加速读；拖慢写；占磁盘。

### 怎么写

```sql
-- 为常用过滤+排序建组合索引（详见复合索引课）
CREATE INDEX idx_orders_status_created
  ON orders (status, created_at);

-- 查询形态与索引对齐
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;

-- 观察计划（MySQL）
EXPLAIN
SELECT order_id FROM orders WHERE status = 'paid';
```

### 查询结果

业务结果仍是 paid 的 Top 时间序列；  
计划侧关注：是否 `ref`/`range`/`index`，避免无必要的全表扫描（数据量大时）。

### 用在哪

1. **列表查询**：等值过滤 + 时间排序。  
2. **JOIN 键**：`user_id` / `order_id` 外键列。  
3. **唯一约束**：UNIQUE 也是索引。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 每列都建单列索引 | 写慢、优化器仍选错 | 按查询建组合索引 |
| 对索引列套函数 | 索引失效 | 改写范围条件 |
| 小表执念加索引 | 无收益 | 以慢查询为准 |

### 动手

对 `order_events(order_id, event_type)` 建索引，并用 `EXISTS` 查询对照 `EXPLAIN`。
"""

MID["sql-datatypes"] = """
### 课前

- **场景**：订单金额用 FLOAT 对账对不齐；手机号存 INT 丢前导零。  
- **目标**：能按宪法四表的选型说明「为什么这样选」。  
- **先修**：CREATE TABLE → **下一课**：ALTER TABLE

### 样例输入（宪法类型）

| 列 | 类型 | 原因 |
|---|---|---|
| amount | DECIMAL(10,2) | 钱不能用浮点 |
| status | VARCHAR(16) | 枚举短串 |
| city | VARCHAR 可空 | 允许未知 |
| created_at | TIMESTAMP | 事件时间 |
| order_id | INT PK | 代理键 |

### 是什么

- **一句话定义**：类型决定存储、精度、比较与索引行为。  
- **原则**：钱用 DECIMAL；ID 慎用浮点；文本长度按真实分布。  
- **方言**：`STRING`/`TEXT`/`TIMESTAMPTZ` 等需查引擎。

### 怎么写

```sql
-- 看表现：DECIMAL 相加
SELECT
  SUM(amount) AS sum_raw,
  SUM(COALESCE(amount,0)) AS sum_filled
FROM orders
WHERE status = 'paid';

-- 反例思维（不要在生产真改宪法表）
-- amount FLOAT  → 0.1+0.2 类误差
-- phone INT     → 010 前导零丢失
```

### 查询结果

`sum_raw` 对 user 全量 paid 时，种子数据下非空金额之和为 **440.00**（80+120+120+90+30；106 的 NULL 不计入）。  
`sum_filled` 同为 440.00（NULL→0）。

### 用在哪

1. **建模评审**：选类型即选约束。  
2. **跨系统对接**：避免隐式转换。  
3. **索引设计**：前缀索引、整型键更友好。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 钱用 FLOAT/DOUBLE | 对账差一分 | DECIMAL |
| 日期存字符串 | 无法比大小/索引差 | DATE/TIMESTAMP |
| VARCHAR 过长盲目 | 浪费与排序成本 | 按业务定长 |

### 动手

解释：为何 `order_items.qty` 用 INT 而不是 DECIMAL；何种情况下要用 DECIMAL。
"""

MID["sql-alter"] = """
### 课前

- **场景**：`user_tags` 要增加 `updated_at`，或加非空默认值。  
- **目标**：会 `ADD COLUMN` / 简单修改；知道在线 DDL 有风险。  
- **先修**：数据类型 → **下一课**：ROW_NUMBER（金课）或窗口系

### 样例输入

在练习表上操作（**不要**随意 ALTER 宪法四表，以免后续课错位）：

```sql
CREATE TABLE IF NOT EXISTS user_tags (
  user_id INT NOT NULL,
  tag VARCHAR(32) NOT NULL,
  score DECIMAL(5,2),
  PRIMARY KEY (user_id, tag)
);
```

### 是什么

- **一句话定义**：在已存在的表上变更结构。  
- **常见**：加列、加索引、改默认值、改类型。  
- **风险**：锁表、重建、复制延迟——生产要评估。

### 怎么写

```sql
ALTER TABLE user_tags
  ADD COLUMN updated_at TIMESTAMP NULL;

UPDATE user_tags
SET updated_at = '2024-01-08 12:00:00'
WHERE updated_at IS NULL;

-- 再收紧（示例；大表慎用）
-- ALTER TABLE user_tags MODIFY updated_at TIMESTAMP NOT NULL;

SELECT * FROM user_tags;
```

### 查询结果

结构上多出 `updated_at` 列；旧行可先 NULL 再回填。

### 用在哪

1. **迭代建模**：业务加字段。  
2. **加索引**：`ALTER TABLE … ADD INDEX`。  
3. **约束演进**：逐步 NOT NULL。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 直接改宪法样例表 | 后面金课对不上 | 用练习表 |
| 大表改类型一次到位 | 长时间锁 | 灰度/gh-ost 等工具 |
| 加 NOT NULL 无默认无回填 | 失败 | 先可空→回填→再约束 |

### 动手

给 `user_tags` 增加 `src VARCHAR(16) DEFAULT 'manual'`，插入一行看默认值。
"""

MID["sql-rank"] = """
### 课前

- **场景**：支付金额排行要「并列同名次」，并列后跳号（1,2,2,4）。  
- **目标**：掌握 `RANK`；对比 `ROW_NUMBER` / `DENSE_RANK`。  
- **先修**：ROW_NUMBER（金课）→ **下一课**：DENSE_RANK

### 样例输入（全局 paid 按金额）

| order_id | amount |
|---:|---:|
| 102 | 120.00 |
| 103 | 120.00 |
| 105 | 90.00 |
| 101 | 80.00 |
| 108 | 30.00 |
| 106 | NULL |

### 是什么

- **一句话定义**：排序名次；**并列同名次，之后跳号**。  
- **对比**：`ROW_NUMBER` 强制唯一序号；`DENSE_RANK` 并列不跳号。  
- **骨架**：`RANK() OVER (ORDER BY …)`，可加 `PARTITION BY`。

### 怎么写

```sql
SELECT
  order_id,
  amount,
  RANK() OVER (ORDER BY amount DESC) AS rnk,
  DENSE_RANK() OVER (ORDER BY amount DESC) AS drnk,
  ROW_NUMBER() OVER (ORDER BY amount DESC, order_id ASC) AS rn
FROM orders
WHERE status = 'paid'
  AND amount IS NOT NULL
ORDER BY amount DESC, order_id;
```

### 查询结果（节选）

| order_id | amount | rnk | drnk | rn |
|---:|---:|---:|---:|---:|
| 102 | 120.00 | 1 | 1 | 1 |
| 103 | 120.00 | 1 | 1 | 2 |
| 105 | 90.00 | 3 | 2 | 3 |

注意：`RANK` 在两个第 1 后，下一个是 **3**。

### 用在哪

1. **竞赛排名**：并列并列，名次跳号。  
2. **分位粗分**：按 rank 切桶。  
3. **与 ROW_NUMBER**：要固定 N 行用 RN；要名次语义用 RANK。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 用 RANK 取 Top1 每组 | 并列多行 | 要唯一用 ROW_NUMBER |
| ORDER BY 无决胜列 | 仅影响 RN 稳定性 | 名次并列是特性 |
| NULL 参与排序 | 引擎相关 | 先过滤或 COALESCE |

### 动手

按 `user_id` 分区写 `RANK() OVER (PARTITION BY user_id ORDER BY amount DESC)`，看 Ada 的 102/103。
"""

MID["sql-dense-rank"] = """
### 课前

- **场景**：只要「金额档次」连续编号（1,2,2,3），不要跳号。  
- **目标**：掌握 `DENSE_RANK`；能向业务解释与 RANK 的差异。  
- **先修**：RANK → **下一课**：LAG/LEAD

### 样例输入

同 RANK 课：120,120,90,80,30。

### 是什么

- **一句话定义**：并列同名次，**之后不跳号**。  
- **记忆**：dense = 名次稠密。  
- **用法**：档位、级别编码。

### 怎么写

```sql
SELECT
  order_id,
  amount,
  DENSE_RANK() OVER (ORDER BY amount DESC) AS drnk
FROM orders
WHERE status = 'paid' AND amount IS NOT NULL
ORDER BY drnk, order_id;
```

### 查询结果（节选）

| order_id | amount | drnk |
|---:|---:|---:|
| 102 | 120 | 1 |
| 103 | 120 | 1 |
| 105 | 90 | 2 |
| 101 | 80 | 3 |

### 用在哪

1. **连续等级**：钻石/金/银编码。  
2. **去重档位数**：有多少种不同金额档。  
3. **可视化轴**：不希望轴上出现空洞名次。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 业务要跳号却用 DENSE | 与竞赛规则不符 | 改 RANK |
| 与 ROW_NUMBER 混淆 | 并列被拆开 | 看要不要唯一行 |

### 动手

`SELECT COUNT(DISTINCT DENSE_RANK …)` 不合法时，改用子查询：有多少个不同 `drnk`。
"""

MID["sql-lag-lead"] = """
### 课前

- **场景**：算同一用户「本单金额 − 上一单金额」的变化。  
- **目标**：会用 `LAG`/`LEAD`；写清分区与排序。  
- **先修**：DENSE_RANK → **下一课**：SUM OVER

### 样例输入（user_id=1）

101:80 → 102:120 → 103:120 → 108:30。

### 是什么

- **一句话定义**：取分区内向前/向后第 n 行的列值（默认 n=1）。  
- **直觉**：当前行看一眼上一条/下一条。  
- **替代**：比 SELF JOIN 找「上一笔」更干净。

### 怎么写

```sql
SELECT
  order_id,
  user_id,
  amount,
  created_at,
  LAG(amount, 1) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS prev_amount,
  amount - LAG(amount, 1) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS delta_amt,
  LEAD(order_id, 1) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS next_order_id
FROM orders
WHERE status = 'paid' AND user_id = 1
ORDER BY created_at;
```

### 查询结果

| order_id | amount | prev_amount | delta_amt |
|---:|---:|---:|---:|
| 101 | 80.00 | NULL | NULL |
| 102 | 120.00 | 80.00 | 40.00 |
| 103 | 120.00 | 120.00 | 0.00 |
| 108 | 30.00 | 120.00 | -90.00 |

### 用在哪

1. **环比/会话**：上一次活跃、上一单。  
2. **埋点路径**：下一跳页面。  
3. **变更检测**：状态是否变化。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 漏 PARTITION | 跨用户取到别人的上一单 | 必写用户/实体键 |
| 排序不稳定 | delta 抖动 | 加决胜列 order_id |
| 首行当 0 | 掩盖「无上期」 | 保留 NULL 或显式 COALESCE 并注释 |

### 动手

对所有 paid 用户算 `delta_amt`，筛出 `|delta| >= 50` 的行。
"""

MID["sql-sum-over"] = """
### 课前

- **场景**：要每笔订单旁展示「该用户截至本单的累计 GMV」，且保留明细行。  
- **目标**：会写 `SUM() OVER (PARTITION … ORDER BY …)` 累计。  
- **先修**：LAG/LEAD → **下一课**：窗口帧 ROWS

### 样例输入（user_id=1 金额）

80 → 120 → 120 → 30；累计 80,200,320,350。

### 是什么

- **一句话定义**：窗口版聚合——**不合并行**，为每行挂上聚合结果。  
- **对比**：`GROUP BY` 会少行；`SUM OVER` 保明细。  
- **默认帧**：带 `ORDER BY` 时多数引擎为「从分区开头到当前行」（详帧课）。

### 怎么写

```sql
SELECT
  order_id,
  user_id,
  COALESCE(amount, 0) AS amt,
  SUM(COALESCE(amount, 0)) OVER (
    PARTITION BY user_id
    ORDER BY created_at, order_id
  ) AS running_gmv,
  SUM(COALESCE(amount, 0)) OVER (
    PARTITION BY user_id
  ) AS user_total_gmv
FROM orders
WHERE status = 'paid'
ORDER BY user_id, created_at;
```

### 查询结果（user_id=1）

| order_id | amt | running_gmv | user_total_gmv |
|---:|---:|---:|---:|
| 101 | 80 | 80 | 350 |
| 102 | 120 | 200 | 350 |
| 103 | 120 | 320 | 350 |
| 108 | 30 | 350 | 350 |

### 用在哪

1. **累计收入**：用户/门店 running total。  
2. **占比**：`amt / SUM OVER (PARTITION …)`。  
3. **明细+汇总**：一行看全局。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 与 GROUP BY 混用不当 | 报错/粒度乱 | 窗口与分组分层 |
| 忘记 COALESCE | NULL 传染 | 累计前处理空值 |
| 不理解帧 | 累计变整组相同 | 看下一课 ROWS |

### 动手

算每笔订单金额占该用户总 GMV 的比例 `pct`。
"""

MID["sql-window-frame"] = """
### 课前

- **场景**：要「最近 2 笔订单金额之和」（滑动窗口），不是从开头累计。  
- **目标**：理解 `ROWS BETWEEN`；区分与默认累计帧。  
- **先修**：SUM OVER → **下一课**：CTE 流水线

### 样例输入（user_id=1）

顺序：101(80), 102(120), 103(120), 108(30)。

### 是什么

- **一句话定义**：窗口函数在分区内取哪些行参与计算，由**帧**决定。  
- **常用**：`ROWS BETWEEN n PRECEDING AND CURRENT ROW`。  
- **注意**：`RANGE` 按值边界，并列金额时与 `ROWS` 不同（进阶）。

### 怎么写

```sql
SELECT
  order_id,
  COALESCE(amount, 0) AS amt,
  SUM(COALESCE(amount, 0)) OVER (
    PARTITION BY user_id
    ORDER BY created_at, order_id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS from_start,          -- 显式「从头累计」
  SUM(COALESCE(amount, 0)) OVER (
    PARTITION BY user_id
    ORDER BY created_at, order_id
    ROWS BETWEEN 1 PRECEDING AND CURRENT ROW
  ) AS last2_sum            -- 当前行+上一行
FROM orders
WHERE status = 'paid' AND user_id = 1
ORDER BY created_at;
```

### 查询结果

| order_id | amt | from_start | last2_sum |
|---:|---:|---:|---:|
| 101 | 80 | 80 | 80 |
| 102 | 120 | 200 | 200 |
| 103 | 120 | 320 | 240 |
| 108 | 30 | 350 | 150 |

### 用在哪

1. **滑动指标**：近 N 笔、近 N 日（日需配合日期维）。  
2. **显式累计**：写清帧，避免默认误解。  
3. **异常检测**：近窗均值对比。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 以为 OVER 总是全分区 | 带 ORDER 后变累计 | 读默认帧规则 |
| ROWS vs RANGE 混淆 | 并列行结果怪 | TopN/滑动优先 ROWS |
| 帧与 PARTITION 反了 | 逻辑错 | 先分区再帧 |

### 动手

改成 `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`（最多 3 行），写出 103、108 的期望值。
"""

MID["sql-cte-pipeline"] = """
### 课前

- **场景**：先筛支付单，再按用户汇总，再只留 GMV≥100 的用户——希望一步步可读。  
- **目标**：用多层 CTE 搭流水线；知道 CTE 多为逻辑层（非一定物化）。  
- **先修**：窗口帧 → **下一课**：标量子查询

### 样例输入

统一库 paid 订单；最终应含 user_id=1（350），可能含 2（90）取决于阈值。

### 是什么

- **一句话定义**：`WITH` 命名中间结果，供后续步骤引用。  
- **直觉**：把子查询拉平、起名字。  
- **价值**：复杂报表可读、可测；递归 CTE 另课。

### 怎么写

```sql
WITH paid AS (
  SELECT order_id, user_id, COALESCE(amount, 0) AS amt, created_at
  FROM orders
  WHERE status = 'paid'
),
per_user AS (
  SELECT
    user_id,
    COUNT(*) AS order_cnt,
    SUM(amt) AS gmv
  FROM paid
  GROUP BY user_id
),
qualified AS (
  SELECT * FROM per_user WHERE gmv >= 100
)
SELECT
  q.user_id,
  u.user_name,
  q.order_cnt,
  q.gmv
FROM qualified q
JOIN users u ON u.user_id = q.user_id
ORDER BY q.gmv DESC;
```

### 查询结果（阈值 100）

| user_id | user_name | order_cnt | gmv |
|---:|---|---:|---:|
| 1 | Ada | 4 | 350.00 |

（若阈值改为 80，则 Bob 的 90 也会进入。）

### 用在哪

1. **复杂报表**：多段转换。  
2. **同一中间结果复用**：避免复制子查询。  
3. **教学拆解**：每层可单独 SELECT 调试。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 以为 CTE 一定物化 | 性能预期错 | 看引擎；必要时落临时表 |
| 一层写完巨型 SELECT | 难维护 | 拆 3～5 个命名步骤 |
| CTE 里引用未定义名 | 报错 | 注意定义顺序 |

### 动手

在流水线末加一层：给 qualified 用户打 `tier`（CASE），输出 H/M/L。
"""

MID["sql-scalar-subq"] = """
### 课前

- **场景**：每笔订单旁标注「是否高于全体支付订单平均金额」。  
- **目标**：会写返回单值的标量子查询；避免返回多行报错。  
- **先修**：CTE 流水线 → **下一课**：EXPLAIN

### 样例输入

paid 非空金额：80,120,120,90,30 → 均值 = 440/5 = **88.00**。

### 是什么

- **一句话定义**：出现在表达式位置、**恰好返回一个值**的子查询。  
- **位置**：`SELECT` 列表、`WHERE`、`SET`。  
- **风险**：返回多行 → 运行期错误；无行 → NULL。

### 怎么写

```sql
SELECT
  order_id,
  user_id,
  amount,
  (SELECT AVG(amount) FROM orders WHERE status = 'paid' AND amount IS NOT NULL) AS avg_paid,
  CASE
    WHEN amount > (SELECT AVG(amount) FROM orders WHERE status = 'paid' AND amount IS NOT NULL)
    THEN 'above'
    WHEN amount IS NULL THEN 'unknown'
    ELSE 'below_or_eq'
  END AS vs_avg
FROM orders
WHERE status = 'paid'
ORDER BY order_id;

-- WHERE 中的标量
SELECT user_id, user_name
FROM users
WHERE (
  SELECT COUNT(*) FROM orders o WHERE o.user_id = users.user_id AND o.status = 'paid'
) >= 2;
```

### 查询结果（节选）

| order_id | amount | avg_paid | vs_avg |
|---:|---:|---:|---|
| 101 | 80.00 | 88.00 | below_or_eq |
| 102 | 120.00 | 88.00 | above |
| 106 | NULL | 88.00 | unknown |

### 用在哪

1. **与全局阈值比较**。  
2. **参数表取值**：`WHERE x = (SELECT … LIMIT 1)`。  
3. **简单相关计数**（大数据慎用，可改 JOIN）。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 子查询返回多行 | 报错 | 聚合/`LIMIT 1`/改 IN |
| 相关标量在大表反复执行 | 慢 | 改 JOIN / 窗口 |
| 忽略 NULL 均值 | 语义不清 | 明确是否排除 NULL |

### 动手

用标量子查询标出金额等于「该用户自己平均支付金额」的订单（相关子查询）。
"""

MID["sql-explain"] = """
### 课前

- **场景**：同样查 paid 订单，想知道有没有走全表扫描、预估多少行。  
- **目标**：会跑 `EXPLAIN`；认识 type/rows/key 等基本字段（MySQL 视角）。  
- **先修**：INDEX 入门 → **下一课**：复合索引

### 样例输入

```sql
CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON orders (status, created_at);  -- 若上节已建可跳过
```

（DuckDB/PG 用 `EXPLAIN` / `EXPLAIN ANALYZE`，列名不同，思想相同。）

### 是什么

- **一句话定义**：让优化器打印「打算怎么执行」的计划。  
- **层次**：`EXPLAIN` 估计划；`EXPLAIN ANALYZE`（PG）带真实执行统计。  
- **用途**：验证索引、发现坏 JOIN 顺序、发现临时表/文件排序。

### 怎么写

```sql
EXPLAIN
SELECT order_id, user_id, amount
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;

EXPLAIN
SELECT u.user_name, o.order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE u.city = '上海';
```

### 查询结果

本课结果是**计划表**而非业务表。阅读清单：

| 关注点 | 问什么 |
|---|---|
| type / access | 全表？索引？ |
| key | 用了哪棵索引 |
| rows | 估计扫描行数 |
| Extra | Using filesort / temporary？ |

小样例库 rows 都很小——把习惯练会，换大表才有对比。

### 用在哪

1. **慢 SQL 首诊**。  
2. **上线前**：确认新索引被用到。  
3. **教学**：对照改写前后计划。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 只看 EXPLAIN 不看 ANALYZE | 估计不准 | 关键环境用分析版 |
| 小表结论外推 | 误判 | 用近似生产数据量 |
| 看不懂就加一堆索引 | 写变慢 | 对准 WHERE/JOIN 列 |

### 动手

对「JOIN order_items 后 SUM(amount)」爆炸写法与「先聚合再 JOIN」各 `EXPLAIN` 一次，对比 rows。
"""

MID["sql-composite-index"] = """
### 课前

- **场景**：常查 `status=? AND created_at>=?`，单列索引不够好。  
- **目标**：理解最左前缀；会设计 `(status, created_at)` 这类组合索引。  
- **先修**：EXPLAIN / INDEX 入门 → **下一课**：中级练习场

### 样例输入

查询形态：

```sql
SELECT * FROM orders
WHERE status = 'paid'
  AND created_at >= '2024-01-02'
ORDER BY created_at;
```

### 是什么

- **一句话定义**：多列按顺序组成的一棵 BTree 索引。  
- **最左前缀**：`(a,b,c)` 可支持 `a`、`a+b`、`a+b+c`；一般不能跳过 `a` 只用 `b`。  
- **顺序**：等值列在前，范围列在后（常见经验）。

### 怎么写

```sql
-- 推荐：等值 status + 范围/排序 created_at
CREATE INDEX idx_orders_status_created
  ON orders (status, created_at);

-- 能较好对齐的写法
SELECT order_id, amount, created_at
FROM orders
WHERE status = 'paid'
  AND created_at >= '2024-01-02'
ORDER BY created_at;

-- 最左前缀反例（常难用到组合索引后列）
-- WHERE created_at >= '2024-01-02'  -- 没有 status 等值
```

### 查询结果

业务结果：102,103,105,106,108 等（paid 且时间达标）。  
索引课重点：用 `EXPLAIN` 看 `key=idx_orders_status_created`。

### 用在哪

1. **列表接口**：状态 + 时间。  
2. **覆盖索引**：把 SELECT 列也纳入索引（进阶）。  
3. **JOIN**：`(user_id, status)` 等。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 范围列放最前 | 后续列区分度用不上 | 等值在前 |
| 建 (created_at, status) 却总先滤 status | 利用差 | 按 WHERE 顺序设计 |
| 重复单列+组合 | 冗余 | 能合并则合并 |

### 动手

设计：常查 `WHERE user_id=? AND status=?`，索引列顺序怎么排？写下来并用 EXPLAIN 验证。
"""

MID["sql-drill-mid"] = """
### 课前

- **场景**：在统一样例库验收中级能力。  
- **目标**：先自写再对答案；涉及 EXISTS、窗口、CTE、防爆炸。  
- **先修**：中级清单叶子（含 ROW_NUMBER / JOIN爆炸金课）

### 样例输入

教程宪法四表；勿依赖未写入的 archive/email 字段。

### 是什么

- **练习场（中级）**：半连接、窗口、CTE、计划意识。

### 怎么写

```sql
-- Q1 有过 paid 事件的订单（EXISTS）
-- A1
SELECT o.order_id, o.user_id, o.amount
FROM orders o
WHERE EXISTS (
  SELECT 1 FROM order_events e
  WHERE e.order_id = o.order_id AND e.event_type = 'paid'
);

-- Q2 每用户金额 Top1（ROW_NUMBER）
-- A2
SELECT order_id, user_id, amount FROM (
  SELECT o.*,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY amount DESC, created_at ASC, order_id ASC
    ) AS rn
  FROM orders o WHERE status='paid' AND amount IS NOT NULL
) t WHERE rn = 1;

-- Q3 用户累计 GMV（SUM OVER）
-- A3
SELECT order_id, user_id, amount,
  SUM(COALESCE(amount,0)) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS running_gmv
FROM orders WHERE status='paid';

-- Q4 CTE：GMV>=100 的支付用户
-- A4
WITH per AS (
  SELECT user_id, SUM(COALESCE(amount,0)) gmv
  FROM orders WHERE status='paid' GROUP BY user_id
)
SELECT * FROM per WHERE gmv >= 100;

-- Q5 防爆炸：先聚合 items 再关联订单头
-- A5
SELECT o.order_id, o.amount, i.sku_cnt
FROM orders o
JOIN (
  SELECT order_id, COUNT(*) AS sku_cnt
  FROM order_items GROUP BY order_id
) i ON i.order_id = o.order_id
WHERE o.status='paid';
```

### 查询结果（自检）

| 题 | 要点 |
|---|---|
| Q1 | 含 101、102、106 等 |
| Q2 | Ada 在 102/103 并列时应落到更早的 102 |
| Q4 | 至少 Ada（350） |
| Q5 | 101 的 sku_cnt=2，但 amount 不被放大 |

### 用在哪

1. 阶段测验  2. 面试演练  3. 金课复盘

### 易错对照

| 错法 | 纠正 |
|---|---|
| Q5 直接 JOIN items 再 SUM(o.amount) | 先聚合 items |
| Q2 用 RANK 且 rn=1 | 并列可能多行 |
| NOT IN 含 NULL 排除用户 | 改 NOT EXISTS |

### 动手

加分：用 `LAG` 列出 Ada 每笔相对上一笔的 `delta_amt`。
"""

MID_PATH = """### 课前

- **定位**：多表半连接、窗口、CTE、执行计划入门；能写常见报表 SQL。  
- **先修**：初级清单 + 教程宪法样例库

### 建议顺序

```text
1. UNION系 / SELF JOIN / CROSS JOIN
2. EXISTS / IN·NOT IN
3. UPSERT / VIEW
4. INDEX入门 / 数据类型 / ALTER
5. ROW_NUMBER ← 金课 · RANK · DENSE_RANK
6. LAG/LEAD · SUM OVER · 窗口帧
7. JOIN爆炸 ← 金课（务必做）
8. CTE流水线 · 标量子查询
9. EXPLAIN · 复合索引
10. 中级练习场验收
```

### 用在哪

1. 数仓/分析师进阶  
2. 后端复杂报表  
3. 慢 SQL 初诊

### 注意啥

- 本批叶子已按课模板对齐统一样例库。  
- 窗口三课（TopN / 累计 / 滑动）与 JOIN 爆炸必须手跑。  
- 养成对改写前后各看一次 `EXPLAIN` 的习惯。
"""


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


def set_content(tree, eid, content):
    n = find_node(tree, eid)
    if not n:
        raise SystemExit(f"node not found: {eid}")
    # If node is a section with children and tiny stub, still set content as导读+课体
    n["content"] = content.strip()
    print("OK", eid, "chars", len(n["content"]), "kids", len(n.get("children") or []))


start, end, tree = extract_object(text, "const SQL_KNOWLEDGE_TREE = ")

for eid, body in MID.items():
    set_content(tree, eid, body)

mid_path = find_node(tree, "sql-path-mid")
if mid_path:
    mid_path["content"] = MID_PATH.strip()
    print("OK sql-path-mid")

new_json = json.dumps(tree, ensure_ascii=False, indent=2)
text = text[:start] + new_json + text[end:]

try:
    s0, s1, sample = extract_object(text, "const SQL_SAMPLE = ")
    sample["midAligned"] = list(MID.keys())
    text = text[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text[s1:]
    print("OK SQL_SAMPLE.midAligned")
except SystemExit:
    print("SKIP SQL_SAMPLE")

p.write_text(text, encoding="utf-8")

t2 = p.read_text(encoding="utf-8")
_, _, tree2 = extract_object(t2, "const SQL_KNOWLEDGE_TREE = ")
for eid in MID:
    n = find_node(tree2, eid)
    assert n and "课前" in n["content"] and "易错对照" in n["content"] and "动手" in n["content"], eid
# gold still intact
for eid in ("sql-row-number", "sql-join-explode"):
    n = find_node(tree2, eid)
    assert n and "课前" in n["content"]
path = find_node(tree2, "sql-path-mid")
assert "已按课模板对齐" in path["content"]
print("VALIDATED", len(MID), "mid leaves")
print("DONE", p.stat().st_size)
