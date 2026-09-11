# -*- coding: utf-8 -*-
"""Align senior-path SQL leaves to constitution lesson template + shared sample."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

SENIOR = {}

SENIOR["sql-exists-subq"] = """
### 课前

- **场景**：只要「存在明细行」的订单头，不要把 `order_items` 展开进结果。  
- **目标**：把 EXISTS 当半连接工具；对比 JOIN+DISTINCT。  
- **先修**：中级 EXISTS → **下一课**：相关子查询

### 样例输入

orders 与 order_items：101 有 2 行明细，107 无明细。

### 是什么

- **一句话定义**：外层每行用子查询探测「是否存在匹配」。  
- **高级点**：优化器常改写为 semi-join；语义上不放大外层行。  
- **写法**：相关键必须出现在子查询 WHERE。

### 怎么写

```sql
SELECT o.order_id, o.user_id, o.amount, o.status
FROM orders o
WHERE EXISTS (
  SELECT 1 FROM order_items i WHERE i.order_id = o.order_id
);

-- 反例：JOIN 再 DISTINCT（行曾爆炸）
SELECT DISTINCT o.order_id, o.amount
FROM orders o
JOIN order_items i ON i.order_id = o.order_id;
```

### 查询结果

含 101、102、105、106；**不含** 104/107/108（无 items）。

### 用在哪

1. 资格过滤（有明细/有事件）  
2. 权限：用户是否拥有某资源  
3. 替代危险的大 IN 列表

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| JOIN 明细再聚合头指标 | 指标翻倍 | EXISTS 或先聚合 |
| 子查询无相关条件 | 恒真 | 写 `i.order_id=o.order_id` |

### 动手

`NOT EXISTS` 找出没有任何 `order_events` 的订单。
"""

SENIOR["sql-corr-subq"] = """
### 课前

- **场景**：每笔订单旁标注「该用户自己的平均支付额」。  
- **目标**：写相关子查询；知道大表上常应改写为 JOIN/窗口。  
- **先修**：EXISTS 子查询 → **下一课**：递归 CTE

### 样例输入

user_id=1 的 paid 非空均值为 (80+120+120+30)/4=**87.5**。

### 是什么

- **一句话定义**：子查询引用外层列，**逐行相关**执行（逻辑上）。  
- **直觉**：对当前行临时算一个依赖它的值。  
- **性能**：数据量大时优先窗口或预聚合 JOIN。

### 怎么写

```sql
SELECT
  o.order_id,
  o.user_id,
  o.amount,
  (
    SELECT AVG(o2.amount)
    FROM orders o2
    WHERE o2.user_id = o.user_id
      AND o2.status = 'paid'
      AND o2.amount IS NOT NULL
  ) AS user_avg_paid
FROM orders o
WHERE o.status = 'paid'
ORDER BY o.user_id, o.order_id;

-- 常改写：窗口
SELECT order_id, user_id, amount,
  AVG(amount) OVER (PARTITION BY user_id) AS user_avg_paid
FROM orders
WHERE status = 'paid' AND amount IS NOT NULL;
```

### 查询结果（Ada 节选）

| order_id | amount | user_avg_paid |
|---:|---:|---:|
| 101 | 80.00 | 87.5 |
| 102 | 120.00 | 87.5 |

### 用在哪

1. 行级与「本组统计」对比  
2. 复杂存在性条件  
3. 教学理解后改为集合化写法

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 相关子查询返回多行 | 报错 | 聚合或 LIMIT 1 |
| 大表死扛相关子查询 | 超时 | 窗口/JOIN |

### 动手

标出 `amount > 该用户平均` 的支付单（相关标量 + 比较）。
"""

SENIOR["sql-recursive-cte"] = """
### 课前

- **场景**：生成连续日期骨架，或展开「分类父子」树（教学用日期更安全）。  
- **目标**：掌握递归 CTE 的锚点 + 递归成员 + 终止条件。  
- **先修**：CTE 流水线 → **下一课**：NTILE

### 样例输入

用日期递归生成 2024-01-01 … 2024-01-07，再左连 `orders`。

### 是什么

- **一句话定义**：CTE 引用自身，逐层展开直到条件结束。  
- **两段**：锚点（种子行）∪ 递归成员（引用 CTE 名）。  
- **风险**：无终止条件 → 无限递归（引擎有深度限制）。

### 怎么写

```sql
WITH RECURSIVE days AS (
  SELECT DATE('2024-01-01') AS dt
  UNION ALL
  SELECT DATE_ADD(dt, INTERVAL 1 DAY)   -- PG: dt + 1
  FROM days
  WHERE dt < DATE('2024-01-07')
)
SELECT d.dt, COUNT(o.order_id) AS order_cnt
FROM days d
LEFT JOIN orders o ON DATE(o.created_at) = d.dt
GROUP BY d.dt
ORDER BY d.dt;
```

### 查询结果（示意）

| dt | order_cnt |
|---|---:|
| 2024-01-01 | 2（101,104） |
| 2024-01-02 | 1（102） |
| … | … |
| 2024-01-07 | 1（108） |

### 用在哪

1. 日历/数字序列生成  
2. 组织树/账单爆炸（慎用）  
3. 图的有限深度遍历

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 忘记 WHERE 终止 | 超深度报错 | 写清上界 |
| 递归列类型不稳 | 隐式转换 | 显式 CAST |
| 深树一次展开 | 内存爆 | 限深度或迭代表 |

### 动手

递归生成 1..5 的整数表，再 `CROSS JOIN users` 做 5 天骨架（仅 user_id=1）。
"""

SENIOR["sql-ntile"] = """
### 课前

- **场景**：把支付用户按 GMV 均分成 2 桶（高/低）做对照实验。  
- **目标**：会用 `NTILE(n)`；理解桶大小可能差 1 行。  
- **先修**：RANK 系 → **下一课**：FIRST_VALUE

### 样例输入

用户 GMV（paid，COALESCE）：1→350，2→90，3→0。

### 是什么

- **一句话定义**：把分区内有序行尽量均匀切成 n 桶，返回桶号 1..n。  
- **直觉**：发牌到 n 堆。  
- **注意**：行数不能整除时，前几桶会多 1 行。

### 怎么写

```sql
WITH per AS (
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders WHERE status='paid'
  GROUP BY user_id
)
SELECT
  user_id,
  gmv,
  NTILE(2) OVER (ORDER BY gmv DESC) AS bucket2
FROM per
ORDER BY gmv DESC;
```

### 查询结果

| user_id | gmv | bucket2 |
|---:|---:|---:|
| 1 | 350 | 1 |
| 2 | 90 | 1 或 2（视分配） |
| 3 | 0 | 2 |

（3 行切 2 桶时，桶 1 会有 2 行。）

### 用在哪

1. A/B 或分层抽样粗分桶  
2. 评分四分为（NTILE(4)）  
3. 报表色阶

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 当精确百分位 | 桶边界含糊 | 要精确用 PERCENT_RANK 等 |
| 无 ORDER BY | 无意义 | 必写排序键 |

### 动手

对 paid 订单按金额 `NTILE(3)`，看 120 并列如何分桶。
"""

SENIOR["sql-first-value"] = """
### 课前

- **场景**：明细上保留「该用户第一笔支付订单号/金额」做归因。  
- **目标**：会用 `FIRST_VALUE`/`LAST_VALUE`；注意帧对 LAST_VALUE 的影响。  
- **先修**：NTILE → **下一课**：物化视图

### 样例输入（user_id=1）

时间序：101(80) → 102(120) → 103(120) → 108(30)。首笔 101。

### 是什么

- **一句话定义**：取窗口帧内按排序的第一个（或最后一个）值，广播到各行。  
- **直觉**：每行都能看到组内「冠军/首单」。  
- **坑**：`LAST_VALUE` 默认帧到当前行，常需显式 `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`。

### 怎么写

```sql
SELECT
  order_id,
  user_id,
  amount,
  created_at,
  FIRST_VALUE(order_id) OVER (
    PARTITION BY user_id
    ORDER BY created_at, order_id
  ) AS first_order_id,
  FIRST_VALUE(amount) OVER (
    PARTITION BY user_id
    ORDER BY created_at, order_id
  ) AS first_amount
FROM orders
WHERE status = 'paid' AND user_id = 1
ORDER BY created_at;
```

### 查询结果

每行 `first_order_id=101`，`first_amount=80.00`。

### 用在哪

1. 首单归因 / 末单状态  
2. 会话边界值  
3. 与 LAG 互补（LAG 看上一条，FIRST 看第一条）

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| LAST_VALUE 总像当前行 | 默认帧 | 扩大帧到分区末 |
| 排序不稳 | 首单抖动 | 加 order_id 决胜 |

### 动手

写出每用户「金额最高的那笔」的 order_id（可用 FIRST_VALUE + ORDER BY amount DESC）。
"""

SENIOR["sql-matview"] = """
### 课前

- **场景**：看板反复查「每用户支付 GMV」，希望预计算加速。  
- **目标**：理解物化视图=存结果的视图；知道刷新策略。  
- **先修**：VIEW → **下一课**：覆盖索引

### 样例输入

统一库很小，本课用 PostgreSQL 语法示意；MySQL 8 无内置 matview，可用总结表代替。

### 是什么

- **一句话定义**：把查询结果**物化存储**，查询读快照/表，需刷新才追新。  
- **对比**：普通视图每次重算；物化用空间换时间。  
- **代价**：刷新窗口、数据新鲜度、存储。

### 怎么写

```sql
-- PostgreSQL 示意
-- CREATE MATERIALIZED VIEW mv_user_paid_gmv AS
-- SELECT user_id, SUM(COALESCE(amount,0)) AS gmv, COUNT(*) AS cnt
-- FROM orders WHERE status='paid'
-- GROUP BY user_id;
-- REFRESH MATERIALIZED VIEW mv_user_paid_gmv;

-- MySQL / 通用替代：总结表
CREATE TABLE IF NOT EXISTS agg_user_paid_gmv (
  user_id INT PRIMARY KEY,
  gmv DECIMAL(12,2) NOT NULL,
  cnt INT NOT NULL,
  refreshed_at TIMESTAMP NOT NULL
);

REPLACE INTO agg_user_paid_gmv (user_id, gmv, cnt, refreshed_at)
SELECT user_id,
       SUM(COALESCE(amount,0)),
       COUNT(*),
       NOW()
FROM orders WHERE status='paid'
GROUP BY user_id;

SELECT * FROM agg_user_paid_gmv ORDER BY gmv DESC;
```

### 查询结果

| user_id | gmv | cnt |
|---:|---:|---:|
| 1 | 350.00 | 4 |
| 2 | 90.00 | 1 |
| 3 | 0.00 | 1 |

### 用在哪

1. 高频看板指标  
2. 昂贵多表 JOIN 预聚合  
3. 仓内汇总层

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 当实时表用 | 数字滞后 | SLA + 刷新调度 |
| 无唯一键乱刷 | 重复行 | PK/刷新事务 |

### 动手

改一笔订单金额后，不刷新直接查汇总表，观察「陈旧」；再跑 REPLACE 对齐。
"""

SENIOR["sql-covering-index"] = """
### 课前

- **场景**：列表只查 `order_id, user_id, created_at` 且过滤 `status='paid'`，想避免回表。  
- **目标**：理解覆盖索引；用 EXPLAIN 看 Using index。  
- **先修**：复合索引 → **下一课**：索引失效

### 样例输入

查询：

```sql
SELECT order_id, user_id, created_at
FROM orders WHERE status='paid'
ORDER BY created_at DESC LIMIT 5;
```

### 是什么

- **一句话定义**：索引叶子已包含查询所需全部列，无需回主键表。  
- **直觉**：目录里直接有答案。  
- **设计**：把 WHERE/ORDER/SELECT 列纳入组合索引（注意宽度）。

### 怎么写

```sql
-- 覆盖：过滤+排序+输出
CREATE INDEX idx_orders_covering_paid
  ON orders (status, created_at, order_id, user_id);

EXPLAIN
SELECT order_id, user_id, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;
-- MySQL Extra 常见：Using index
```

### 查询结果

业务结果同 SELECT 金课；计划侧争取 **Using index** / Index Only Scan。

### 用在哪

1. 高 QPS 列表接口  
2. 计数：`COUNT(*)` 有时也可被索引满足  
3. 覆盖与选择性的权衡

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| SELECT * 仍想覆盖 | 必回表 | 减列或接受回表 |
| 索引列过多 | 写放大 | 只覆盖热点查询 |

### 动手

对比「只建 (status,created_at)」与「覆盖四列」的 EXPLAIN Extra。
"""

SENIOR["sql-index-fail"] = """
### 课前

- **场景**：明明建了 `created_at` 索引，写成 `DATE(created_at)=?` 却全表扫。  
- **目标**：识别常见索引失效写法；改成可走索引的谓词。  
- **先修**：覆盖索引 → **下一课**：ANALYZE 统计

### 样例输入

统一库 + `idx_orders_status_created(status, created_at)`（若已建）。

### 是什么

- **一句话定义**：谓词形态让优化器无法用 BTree 有序性做查找/范围。  
- **典型**：对列套函数、隐式类型转换、前导模糊 `%xx`、错误最左前缀。  
- **目标**：改写条件，而不是盲目加索引。

### 怎么写

```sql
-- 失效风险
SELECT * FROM orders WHERE DATE(created_at) = '2024-01-02';

-- 可走范围（推荐）
SELECT * FROM orders
WHERE created_at >= '2024-01-02'
  AND created_at <  '2024-01-03';

-- 最左前缀：只有后列
SELECT * FROM orders WHERE created_at >= '2024-01-02';
-- 对 (status,created_at) 往往用不满；宜带 status='paid' 或调索引序

-- 隐式转换风险（列是 VARCHAR 状态时）
-- WHERE status = 1 可能导致转换；保持字面量类型一致
```

### 查询结果

改写后结果应与 `DATE(...)=` 等价（注意时区边界）；计划上 rows/type 更优。

### 用在哪

1. 慢查询复盘清单  
2. Code Review 谓词检查  
3. 与复合索引课联用

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `WHERE YEAR(col)=2024` | 失效 | 范围谓词 |
| `LIKE '%paid'` | 难用 BTree | 全文/倒排或其他 |
| 在索引列上表达式 | 同上 | 把计算移到常量侧 |

### 动手

对 `status` 与 `DATE(created_at)` 组合查询，改写成双条件范围，并 EXPLAIN。
"""

SENIOR["sql-analyze-stats"] = """
### 课前

- **场景**：数据分布变了，优化器仍选坏计划（低估/高估行数）。  
- **目标**：知道统计信息是计划的燃料；会触发 ANALYZE/更新统计。  
- **先修**：EXPLAIN → **下一课**：BEGIN/COMMIT

### 样例输入

样例库太小，**数字不明显**；记住命令与时机。

### 是什么

- **一句话定义**：优化器用表/索引统计估计基数，选择 JOIN 与索引。  
- **过期统计**：插入百万行后不 ANALYZE → 计划可能仍按旧分布。  
- **方言**：MySQL `ANALYZE TABLE`；PG `ANALYZE`；仓系统各有 `COMPUTE STATS`。

### 怎么写

```sql
-- MySQL
ANALYZE TABLE orders;
ANALYZE TABLE order_items;

EXPLAIN SELECT o.order_id, i.sku_id
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'paid';

-- PostgreSQL
-- ANALYZE orders;
-- EXPLAIN (ANALYZE, BUFFERS) SELECT ...
```

### 查询结果

关注 EXPLAIN 的 **rows 估计**是否合理；刷新统计后对比前后计划。

### 用在哪

1. 大批量导入后  
2. 计划「突然变慢」排查  
3. 升级/迁移后基线

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 只加索引不更新统计 | 仍选错 | ANALYZE |
| 生产频繁全库 ANALYZE | 压力 | 针对脏表/窗口期 |

### 动手

记下当前 `EXPLAIN` 的 rows；（若可）多插一批再 ANALYZE，观察估计变化。
"""

SENIOR["sql-begin-commit"] = """
### 课前

- **场景**：扣减逻辑要「读金额 → 更新状态」同成同败，避免只做了一半。  
- **目标**：会用事务边界 `START TRANSACTION` / `COMMIT` / `ROLLBACK`。  
- **先修**：隔离级别金课可并行 → **下一课**：脏读幻读

### 样例输入

把订单 104（created）改为 paid，并写一条 `order_events`——必须同事务。

### 是什么

- **一句话定义**：把多句 SQL 绑成原子单元：全成或全撤。  
- **ACID 直觉**：原子性靠事务边界；隔离靠隔离级别。  
- **自动提交**：许多客户端默认 autocommit=1，需显式开事务。

### 怎么写

```sql
START TRANSACTION;
  UPDATE orders
  SET status = 'paid'
  WHERE order_id = 104 AND status = 'created';

  INSERT INTO order_events (event_id, order_id, event_type, event_time)
  VALUES (8, 104, 'paid', '2024-01-01 12:05:00');
COMMIT;
-- 中途失败则 ROLLBACK;

-- 验证
SELECT status FROM orders WHERE order_id = 104;
SELECT * FROM order_events WHERE order_id = 104;
```

### 查询结果

成功后：104 为 paid；事件表多一行 paid。若故意让 INSERT 主键冲突并 ROLLBACK，则 UPDATE 也应撤回。

### 用在哪

1. 下单/支付多表写  
2. 转账、库存  
3. 批量作业「全有或全无」段

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 多写无事务 | 中间态可见 | 显式 BEGIN |
| 长事务不提交 | 锁等待、版本堆积 | 缩小事务 |
| DDL 隐式提交 | 边界意外 | 查引擎文档 |

### 动手

开事务更新 104 后**不提交**，另开会话看是否可见（依赖隔离级别）；再 ROLLBACK。
"""

SENIOR["sql-anomaly-reads"] = """
### 课前

- **场景**：报表事务里两次读 GMV 不一致；或读到未提交金额。  
- **目标**：能用业务语言解释脏读/不可重复读/幻读；对应隔离级别。  
- **先修**：BEGIN/COMMIT、隔离级别金课 → **下一课**：行锁表锁

### 样例输入

会话实验（两窗口）针对 `orders` 中 106（amount NULL）或 105。

### 是什么

| 现象 | 含义 | 典型隔离 |
|---|---|---|
| 脏读 | 读到他事务未提交写 | RU 可能 |
| 不可重复读 | 同事务两次读同行值变化 | RC 可能 |
| 幻读 | 同条件第二次多/少行 | RR 下写范围仍可能需注意 |

- **一句话定义**：并发下「看见了不该看的变化」。  
- **练习**：用统一库做最小复现，再对照隔离级别课。

### 怎么写

```sql
-- 会话 A
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- 仅演示
START TRANSACTION;
UPDATE orders SET amount = 999 WHERE order_id = 106;
-- 先不 COMMIT

-- 会话 B（RU 下可能脏读到 999）
SELECT amount FROM orders WHERE order_id = 106;

-- 会话 A
ROLLBACK;  -- 恢复
```

可重复读演示：A 两次 `SUM` 之间，B 提交新 paid 插入，观察 A 第二次是否变化（RC vs RR）。

### 查询结果

把观察填表：

| 隔离 | 是否脏读到 999 | 两次 SUM 是否变化 |
|---|---|---|
| RU | ? | ? |
| RC | ? | ? |
| RR | ? | ? |

### 用在哪

1. 事故复盘（数字跳变）  
2. 选型：报表 vs 高并发写  
3. 面试并发题

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 把 RR 当成绝对无幻读 | 误解 | 结合引擎间隙锁/快照 |
| 生产开 RU | 脏数据 | 禁止 |

### 动手

在测试库完成上表，并把结论写回隔离级别课「动手」对照。
"""

SENIOR["sql-row-table-lock"] = """
### 课前

- **场景**：更新一笔订单却感觉「整表卡住」；或库存行锁等待。  
- **目标**：区分行锁与表锁直觉；知道扫描范围决定锁范围。  
- **先修**：脏读幻读 → **下一课**：死锁预防

### 样例输入

`UPDATE orders SET status='cancelled' WHERE order_id=104;`（点查主键）  
vs 无索引条件的大范围 UPDATE。

### 是什么

- **一句话定义**：锁保护并发写；行锁粒度细、表锁粗。  
- **直觉**：摸一张小票 vs 封锁整本账。  
- **关键点**：条件能否走索引 → 锁住的行集合大小。

### 怎么写

```sql
START TRANSACTION;
  -- 点更新：通常行锁（InnoDB）
  UPDATE orders SET status = 'cancelled'
  WHERE order_id = 104;

  -- 观察（MySQL）
  -- SHOW ENGINE INNODB STATUS\\G
  -- 或 performance_schema.data_locks
COMMIT;

-- 危险形态：锁更多行
-- UPDATE orders SET status='cancelled' WHERE DATE(created_at)='2024-01-01';
```

### 查询结果

本课结果是锁行为：点查应只阻塞触及 104 的会话；无索引大更新可能阻塞更多。

### 用在哪

1. 热点行（库存 SKU）设计  
2. 批量更新分批 + 主键区间  
3. DDL 表锁窗口评估

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 大事务拖很久 | 锁等待链 | 缩小事务 |
| 用函数条件更新 | 锁升级/更多行 | 可索引范围 |
| 误以为「有索引就不锁」 | 仍有行锁 | 锁是写保护，不是零成本 |

### 动手

会话 A 更新 104 不提交；会话 B 更新 105 应可成功；B 再更新 104 应等待——亲手感受行锁。
"""

SENIOR["sql-deadlock"] = """
### 课前

- **场景**：两事务互相等待对方持有的行锁，最终一方被回滚。  
- **目标**：能构造最小死锁；掌握预防：固定加锁顺序、减小事务。  
- **先修**：行锁表锁 → **下一课**：调优检查清单

### 样例输入

订单 101 与 105 两行。

### 是什么

- **一句话定义**：等待环——A 等 B，B 等 A。  
- **引擎**：InnoDB 检测死锁并回滚成本较低的一方。  
- **应用**：重试幂等；从根上避免环。

### 怎么写

```sql
-- 会话 A
START TRANSACTION;
UPDATE orders SET amount = amount WHERE order_id = 101;  -- 锁 101

-- 会话 B
START TRANSACTION;
UPDATE orders SET amount = amount WHERE order_id = 105;  -- 锁 105
UPDATE orders SET amount = amount WHERE order_id = 101;  -- 等 A
-- 回到 A：
UPDATE orders SET amount = amount WHERE order_id = 105;  -- 死锁
-- 一方 ERROR：Deadlock found；事务回滚
```

**预防**：所有事务按 `order_id` 升序加锁；或单行改写减少交叉。

### 查询结果

一方成功、一方死锁回滚；业务层应对回滚码重试。

### 用在哪

1. 转账双边账户  
2. 订单+库存多行更新  
3. 链路超时排查

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 加锁顺序随输入变化 | 易成环 | 全局排序 |
| 死锁当「库坏了」 | 乱重启 | 看日志+重试 |
| 长事务放大概率 | 频发 | 缩短临界区 |

### 动手

按固定顺序（先 101 后 105）改写两边事务，确认不再死锁。
"""

SENIOR["sql-tune-checklist"] = """
### 课前

- **场景**：一条报表 SQL 变慢，不知从何下手。  
- **目标**：记住可执行的检查顺序；对照统一库练手感。  
- **先修**：EXPLAIN / 索引课 → **下一课**：谓词下推·改写

### 样例输入

任意慢查询；示例用「paid 列表 + JOIN items」。

### 是什么

- **一句话定义**：调优是假设→验证→改写的闭环，不是堆索引。  
- **清单思维**：先正确，再测量，再改计划。

### 怎么写

```text
1. 复现：固定参数、记录耗时与行数
2. EXPLAIN / ANALYZE：看访问类型、rows、临时表/排序
3. 谓词：能否改成可索引范围？选择性如何？
4. JOIN：谁驱动？一对多是否爆炸？先聚合？
5. 选择性索引 / 覆盖索引 / 统计信息
6. 业务：是否可缓存、预聚合、异步
7. 回归：改写前后结果集对比（校验 SQL）
```

```sql
-- 最小对照
EXPLAIN SELECT … 爆炸写法;
EXPLAIN SELECT … 先聚合再 JOIN;
```

### 查询结果

产出一页「诊断卡」：瓶颈一步、改写一句、验证一行数。

### 用在哪

1. 值班慢查询  
2. Code Review  
3. 上线前性能门禁

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 上来加三四个索引 | 写慢、仍不对症 | 先 EXPLAIN |
| 不校验结果 | 调快但算错 | 结果对比 |

### 动手

对 JOIN 爆炸金课 A/B 两写法填完整诊断卡。
"""

SENIOR["sql-rewrite-patterns"] = """
### 课前

- **场景**：想让过滤尽早发生（谓词下推），或把相关子查询改成 JOIN。  
- **目标**：掌握几类高频改写模式，服务调优清单。  
- **先修**：调优检查清单 → **下一课**：分区裁剪

### 样例输入

统一库；关注「语义等价」优先于「看起来巧」。

### 是什么

- **谓词下推**：过滤条件尽量贴近基表，减少中间行。  
- **常见改写**：`OR`→`UNION ALL`；`NOT IN`→`NOT EXISTS`；标量子查询→窗口；DISTINCT+JOIN→EXISTS/先聚合。

### 怎么写

```sql
-- 1) 下推：先滤 orders 再 JOIN
SELECT o.order_id, i.sku_id
FROM (
  SELECT * FROM orders WHERE status = 'paid'
) o
JOIN order_items i ON i.order_id = o.order_id;
-- 等价且常由优化器自动下推：
SELECT o.order_id, i.sku_id
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'paid';

-- 2) NOT IN → NOT EXISTS（避 NULL）
SELECT u.* FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.user_id
);

-- 3) 爆炸修复：先聚合
SELECT o.order_id, o.amount, x.sku_cnt
FROM orders o
JOIN (
  SELECT order_id, COUNT(*) sku_cnt FROM order_items GROUP BY order_id
) x ON x.order_id = o.order_id;
```

### 查询结果

改写前后：`COUNT(*)` / 关键指标应一致（用校验查询对比）。

### 用在哪

1. 优化器没选好时的人工改写  
2. 方言差异下的可移植写法  
3. 教学：语义 → 计划

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 改写改变 NULL 语义 | 静默错数 | 先对照结果 |
| 过度嵌套子查询 | 更难优化 | 清晰 CTE |

### 动手

把「相关平均」改窗口，核对 Ada 四行的 avg 是否同为 87.5。
"""

SENIOR["sql-partition-prune"] = """
### 课前

- **场景**：订单按月分区后，查询仍扫全年。  
- **目标**：理解分区裁剪：谓词必须能定位分区键。  
- **先修**：谓词改写 → **下一课**：慢报表拆分

### 样例输入

示意表（练习，非宪法四表）：

```sql
-- MySQL 范围分区示意
-- CREATE TABLE orders_p (…, created_at DATETIME, …)
-- PARTITION BY RANGE (TO_DAYS(created_at)) (…);
```

统一库可先用「逻辑分区」理解：按月过滤等价于裁剪。

### 是什么

- **一句话定义**：优化器根据 WHERE 去掉不可能命中的分区。  
- **关键**：条件落在**分区键**上，且可推算边界。  
- **失效**：对分区键套函数、或只用非分区列过滤。

### 怎么写

```sql
-- 逻辑裁剪（统一库）
SELECT order_id, amount, created_at
FROM orders
WHERE created_at >= '2024-01-01'
  AND created_at <  '2024-02-01'
  AND status = 'paid';

-- 失效思维：WHERE DATE(created_at) BETWEEN … 可能妨碍裁剪（视引擎）
-- 推荐始终用半开区间 [start, end)
```

### 查询结果

一月 paid 行：101–108 中落在 1 月的支付单；计划/扫描分区数应减少（真分区表上验证）。

### 用在哪

1. 时序事实表  
2. 生命周期掉数  
3. 仓表按日/月分区

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 分区键表达式包装 | 无法裁剪 | 范围谓词 |
| 分区过多过碎 | 计划/元数据开销 | 合理粒度 |

### 动手

解释：若按 `user_id` HASH 分区，按时间过滤能否裁剪？为何。
"""

SENIOR["sql-slow-report"] = """
### 课前

- **场景**：一张「用户 × 每日 GMV × 明细 Top」超级 SQL 超时。  
- **目标**：会拆报表：预聚合、分层 CTE、异步物化。  
- **先修**：物化/调优清单 → **下一课**：大 JOIN 策略

### 样例输入

需求拆解：① 每用户 GMV ② 近几笔明细 —— 不要塞一条 SQL 硬算。

### 是什么

- **一句话定义**：慢报表常因一次计算太多粒度；拆成管道更稳。  
- **策略**：先汇总层，再明细层；或日更汇总表。  
- **产品**：看板可脏读/可延迟，则用物化。

### 怎么写

```sql
-- 步骤1：汇总（可物化）
WITH user_gmv AS (
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders WHERE status='paid'
  GROUP BY user_id
),
-- 步骤2：明细 Top（窗口）
recent AS (
  SELECT * FROM (
    SELECT o.*,
      ROW_NUMBER() OVER (
        PARTITION BY user_id ORDER BY created_at DESC
      ) AS rn
    FROM orders o WHERE status='paid'
  ) t WHERE rn <= 3
)
SELECT g.user_id, u.user_name, g.gmv,
       r.order_id, r.amount, r.created_at
FROM user_gmv g
JOIN users u ON u.user_id = g.user_id
LEFT JOIN recent r ON r.user_id = g.user_id
ORDER BY g.gmv DESC, r.created_at DESC;
```

### 查询结果

Ada 350 + 最近至多 3 笔明细；Dan 不在 paid 汇总中。

### 用在哪

1. 运营周报  
2. 复杂 BI SQL 治理  
3. 超时告警后的拆分

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 单 SQL 堆所有维度 | 超时难调 | 分层 |
| 明细 JOIN 汇总不当 | 爆炸 | 窗口/预聚合 |

### 动手

把 `user_gmv` 落成 `agg_user_paid_gmv`，报表只 JOIN 汇总表。
"""

SENIOR["sql-big-join"] = """
### 课前

- **场景**：订单 × 明细 × 用户 × 事件多表 JOIN，扫行暴涨。  
- **目标**：定驱动顺序直觉；先过滤/先聚合再 JOIN。  
- **先修**：JOIN 爆炸金课 → **下一课**：增量去重

### 样例输入

`orders` ⋈ `order_items` ⋈ `users`；101 明细 2 行。

### 是什么

- **一句话定义**：大 JOIN 的成本≈中间结果行数；策略是压缩中间态。  
- **手段**：谓词下推、半连接、预聚合、广播小表（仓）。  
- **检测**：每加一表就 `COUNT(*)`。

### 怎么写

```sql
-- 坏：先叉出大中间态再滤
-- SELECT … FROM orders o
-- JOIN order_items i ON … JOIN order_events e ON … WHERE o.status='paid';

-- 好：逐步缩小
WITH o AS (
  SELECT * FROM orders WHERE status='paid'
),
i AS (
  SELECT order_id, COUNT(*) sku_cnt, SUM(qty) qty_sum
  FROM order_items GROUP BY order_id
)
SELECT o.order_id, u.user_name, o.amount, i.sku_cnt
FROM o
JOIN users u ON u.user_id = o.user_id
LEFT JOIN i ON i.order_id = o.order_id;
```

### 查询结果

101：`sku_cnt=2`，`amount` 仍为 80 不被放大。

### 用在哪

1. 数仓宽表任务  
2. 实时链路多维补全  
3. 爆炸事故修复

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 多事实表直接互 JOIN | 几何膨胀 | 星型：事实连维；事实间用键对齐 |
| 不看中间 COUNT | 上线才爆 | 逐步验证 |

### 动手

再 JOIN `order_events` 前先按 order_id 去重事件，对比行数。
"""

SENIOR["sql-incremental-dedupe"] = """
### 课前

- **场景**：`order_events` 里 102 的 paid 事件重复，增量同步要幂等去重。  
- **目标**：用窗口/`GROUP BY` 做去重；设计增量水位。  
- **先修**：ROW_NUMBER 金课 → **下一课**：拉链表 SCD2

### 样例输入

order_events：102 有两条相同 paid（event_id 3、4）。

### 是什么

- **一句话定义**：同一业务键只保留一条权威记录，支持反复跑。  
- **增量**：按 `event_time`/`event_id` 水位拉取，再与目标表 merge。  
- **权威规则**：`ROW_NUMBER` 按时间决胜。

### 怎么写

```sql
-- 全量去重权威集
SELECT event_id, order_id, event_type, event_time FROM (
  SELECT e.*,
    ROW_NUMBER() OVER (
      PARTITION BY order_id, event_type
      ORDER BY event_time ASC, event_id ASC
    ) AS rn
  FROM order_events e
) t
WHERE rn = 1;

-- 增量示意：只处理水位之后
-- WHERE event_id > :last_success_id
```

### 查询结果

102+paid 只留 **event_id=3**（较小/较早）；4 被丢掉。

### 用在哪

1. CDC / 消息重复  
2. 埋点去重  
3. 拉数作业幂等

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 无决胜列 | 去重不稳定 | time + id |
| 只 DISTINCT * | 全列不同仍重复业务键 | 按业务键分区 |

### 动手

对 `(order_id, event_type)` 统计重复组：`HAVING COUNT(*)>1`。
"""

SENIOR["sql-scd2"] = """
### 课前

- **场景**：用户城市变更要保留历史（Dan 的 city 从 NULL→上海）。  
- **目标**：理解 SCD2 拉链表：`valid_from/valid_to/is_current`。  
- **先修**：增量去重 → **下一课**：注入与安全

### 样例输入

用练习表模拟维表历史（勿破坏 `users` 主数据课）。

### 是什么

- **一句话定义**：缓慢变化维第 2 类——**闭链旧行、插入新行**保留历史。  
- **查询**：某时刻点查 `valid_from <= ts < valid_to`。  
- **对比**：SCD1 直接覆盖无历史。

### 怎么写

```sql
CREATE TABLE IF NOT EXISTS users_scd2 (
  user_id INT NOT NULL,
  user_name VARCHAR(32) NOT NULL,
  city VARCHAR(32),
  valid_from TIMESTAMP NOT NULL,
  valid_to   TIMESTAMP NOT NULL,  -- 未闭链可用 '9999-12-31'
  is_current TINYINT NOT NULL,
  PRIMARY KEY (user_id, valid_from)
);

-- 初始：Dan
INSERT INTO users_scd2 VALUES
  (4, 'Dan', NULL, '2024-01-10 12:00:00', '9999-12-31 00:00:00', 1);

-- 变更：闭链 + 新行
UPDATE users_scd2
SET valid_to = '2024-02-01 00:00:00', is_current = 0
WHERE user_id = 4 AND is_current = 1;

INSERT INTO users_scd2 VALUES
  (4, 'Dan', '上海', '2024-02-01 00:00:00', '9999-12-31 00:00:00', 1);

-- 点时光旅行
SELECT * FROM users_scd2
WHERE user_id = 4
  AND valid_from <= '2024-01-15'
  AND valid_to   >  '2024-01-15';
```

### 查询结果

2024-01-15 查到 city=NULL；当前行 city=上海。

### 用在哪

1. 数仓维度历史  
2. 价格/地址变更审计  
3. 事实关联「下单时」维值

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 不闭链就插新行 | 多条 current | 先闭链 |
| 用中间 NULL 当无限 | 比较麻烦 | 用远未来哨兵 |

### 动手

给 Ada 模拟一次城市变更，并查她下单日 2024-01-02 的城市。
"""

SENIOR["sql-injection"] = """
### 课前

- **场景**：界面把用户输入拼进 `WHERE user_name = '…'`，被输入 `' OR 1=1 --` 掏光表。  
- **目标**：坚持参数化；区分动态 SQL 的白名单拼装。  
- **先修**：任意业务 SQL → **下一课**：MySQL vs PG

### 样例输入

危险伪代码：`"SELECT * FROM users WHERE user_name = '" + name + "'"`。

### 是什么

- **一句话定义**：把输入当作代码执行，造成未授权读写。  
- **防御**：预编译绑定参数；绝不信任字符串拼接。  
- **动态列/排序**：只能白名单映射，不能直接拼用户词。

### 怎么写

```sql
-- 应用层伪代码（正确）
-- prep = db.prepare("SELECT user_id, user_name, city FROM users WHERE user_id = ?")
-- prep.execute([user_id])

-- 错误：拼接
-- "… WHERE user_id = " + user_id   -- 即便是数字也可能被玩坏

-- 安全动态排序：白名单
-- sort = {"created":"created_at","amount":"amount"}.get(input, "created_at")
```

统一库自检：只授予报表账号 `SELECT`，禁止随意 DDL/无 WHERE 删除。

### 查询结果

本课「结果」是安全属性：参数化后输入 `' OR 1=1` 只是普通字符串，匹配不到用户。

### 用在哪

1. Web/Admin 查询  
2. 拼接报表导出  
3. 权限最小化

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 手动 escape 当银弹 | 仍可能绕过 | 参数绑定 |
| 把表名也绑定 | 多数驱动不支持 | 白名单 |
| 教程里演示攻击细节当作业 | 误用 | 只讲防御模式 |

### 动手

在应用层把「按 user_id 查用户」改成绑定参数；用非法字符串验证不被执行。
"""

SENIOR["sql-mysql-pg"] = """
### 课前

- **场景**：同一套教程 SQL 在 MySQL 与 PostgreSQL 表现不同（隔离级别、upsert、分页）。  
- **目标**：记住高频差异清单，写可移植或显式分叉。  
- **先修**：隔离级别 / UPSERT → **下一课**：仓 SQL 注意

### 样例输入

统一库 DDL 两边都能建；差异体现在函数与事务默认。

### 是什么

| 点 | MySQL (InnoDB) | PostgreSQL |
|---|---|---|
| 默认隔离 | 常 RR | 常 RC |
| Upsert | ON DUPLICATE KEY | ON CONFLICT |
| 分页 | LIMIT OFFSET | LIMIT OFFSET（深翻页同样差） |
| 字符串 | 排序规则敏感 | 更严格类型 |
| 伪表 | DUAL 少用 | 可 `SELECT 1` |
| 递归 CTE | 8.0+ | 成熟 |

### 怎么写

```sql
-- 查看隔离
-- MySQL: SELECT @@transaction_isolation;
-- PG:    SHOW transaction_isolation;

-- 日期加一天
-- MySQL: DATE_ADD(dt, INTERVAL 1 DAY)
-- PG:    dt + INTERVAL '1 day'

-- 本教程优先：DATE / COALESCE / 标准 JOIN，减少方言函数
```

### 查询结果

在两边跑「验收 COUNT」应同为 4/8/7/5；upsert/隔离实验按各方言分支。

### 用在哪

1. 多引擎产品  
2. 从 MySQL 迁 PG  
3. ORM 方言层

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 假设默认隔离相同 | 并发 bug | 显式 SET |
| 一把 SQL 无注释 | 移植失败 | 标引擎 |

### 动手

列出本教程中 3 处需分叉的语句（upsert、DATE_ADD、EXPLAIN 变体）。
"""

SENIOR["sql-warehouse-dialect"] = """
### 课前

- **场景**：把 MySQL 报表搬到 Hive/BigQuery/Snowflake，半天才发现无事务、类型不同。  
- **目标**：建立「仓 SQL」注意清单：最终一致、分区、半连接、成本模型。  
- **先修**：MySQL vs PG → **下一课**：高级练习场

### 样例输入

同一套统一库语义，在仓中常是**外部表/批处理**；用同等 SELECT 验证口径。

### 是什么

- **一句话定义**：分析型引擎面向扫表与吞吐，事务/约束弱于 OLTP。  
- **注意**：DML 语义、NULL 排序、近似函数、分区裁剪、小文件。  
- **实践**：口径 SQL 与引擎优化分离。

### 怎么写

```sql
-- 口径层（尽量标准）
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders
WHERE status = 'paid'
GROUP BY user_id;

-- 仓上额外：
-- * 扫描加分区谓词
-- * 大 JOIN 注意广播/shuffle
-- * 慎用相关子查询；改窗口
-- * INSERT OVERWRITE 分区代替行级事务
```

### 查询结果

口径结果应与 OLTP 教程一致（350/90/0）；物理计划完全不同可接受。

### 用在哪

1. 数仓迁移  
2. 湖仓一体报表  
3. 成本治理（扫描字节）

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 在仓里追求行级锁思维 | 无此模型 | 批处理幂等 |
| SELECT * 大分区 | 账单爆炸 | 列裁剪+分区 |

### 动手

把 JOIN 爆炸修复写法标成「仓友好」：先聚合 items 再关联。
"""

SENIOR["sql-drill-senior"] = """
### 课前

- **场景**：高级清单验收：事务边界、去重、防爆炸、窗口、安全意识。  
- **目标**：自写后对答案；并发题以双会话描述为准。  
- **先修**：高级清单叶子 + 隔离级别金课

### 样例输入

教程宪法四表；事件表含 102 重复 paid。

### 是什么

- **练习场（高级）**：并发语义、去重、改写、SCD 思维。

### 怎么写

```sql
-- Q1 事件去重权威行
-- A1
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id
  ) rn FROM order_events e
) t WHERE rn=1;

-- Q2 先聚合再 JOIN，输出 paid 订单 sku_cnt
-- A2
SELECT o.order_id, o.amount, i.sku_cnt
FROM orders o
JOIN (
  SELECT order_id, COUNT(*) sku_cnt FROM order_items GROUP BY order_id
) i ON i.order_id=o.order_id
WHERE o.status='paid';

-- Q3 每用户首笔支付 order_id
-- A3
SELECT DISTINCT user_id,
  FIRST_VALUE(order_id) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS first_order_id
FROM orders WHERE status='paid';

-- Q4 事务骨架（文字题）：更新订单状态+写事件须同一事务
-- A4 START TRANSACTION; UPDATE …; INSERT INTO order_events …; COMMIT;

-- Q5 安全：说明为何不能拼接 user 输入进 SQL
-- A5 使用绑定参数；动态排序走白名单
```

### 查询结果（自检）

| 题 | 要点 |
|---|---|
| Q1 | 102+paid 仅一行 |
| Q2 | 101 的 amount=80 且 sku_cnt=2 |
| Q3 | Ada 首笔 101 |

### 用在哪

1. 高级结业  2. 线上事故复盘演练

### 易错对照

| 错法 | 纠正 |
|---|---|
| Q2 直接 JOIN items 再选 amount | 爆炸 |
| 用 NOT IN 排除含 NULL 集合 | NOT EXISTS |

### 动手

双会话复现：固定 order_id 顺序更新 101/105，证明可避免死锁。
"""

SENIOR_PATH = """### 课前

- **定位**：事务并发、索引与计划、改写模式与仓/方言；能独立处理复杂报表与线上 SQL 问题。  
- **先修**：中级清单 + 教程宪法样例库 + 隔离级别金课

### 建议顺序

```text
1. EXISTS子查询 / 相关子查询
2. 递归CTE / NTILE / FIRST_VALUE
3. 物化视图（总结表）
4. 覆盖索引 / 索引失效 / ANALYZE
5. BEGIN·COMMIT → 隔离级别金课 → 脏读幻读
6. 行锁表锁 / 死锁预防
7. 调优检查清单 / 谓词改写 / 分区裁剪
8. 慢报表拆分 / 大JOIN策略
9. 增量去重 / 拉链表SCD2
10. 注入与安全 / MySQL·PG / 仓SQL注意
11. 高级练习场验收
```

### 用在哪

1. DBA / 后端攻坚  
2. 数仓建模  
3. 性能专项

### 注意啥

- 本批已按课模板对齐；并发课务必双会话实验。  
- 隔离级别金课精读，勿只背定义。  
- 生产改结构/锁实验只在测试库。
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
    n["content"] = content.strip()
    print("OK", eid, "chars", len(n["content"]))


start, end, tree = extract_object(text, "const SQL_KNOWLEDGE_TREE = ")

for eid, body in SENIOR.items():
    set_content(tree, eid, body)

path = find_node(tree, "sql-path-senior")
if path:
    path["content"] = SENIOR_PATH.strip()
    print("OK sql-path-senior")

new_json = json.dumps(tree, ensure_ascii=False, indent=2)
text = text[:start] + new_json + text[end:]

try:
    s0, s1, sample = extract_object(text, "const SQL_SAMPLE = ")
    sample["seniorAligned"] = list(SENIOR.keys())
    text = text[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text[s1:]
    print("OK SQL_SAMPLE.seniorAligned")
except SystemExit:
    print("SKIP SQL_SAMPLE")

p.write_text(text, encoding="utf-8")

t2 = p.read_text(encoding="utf-8")
_, _, tree2 = extract_object(t2, "const SQL_KNOWLEDGE_TREE = ")
for eid in SENIOR:
    n = find_node(tree2, eid)
    assert n and "课前" in n["content"] and "易错对照" in n["content"] and "动手" in n["content"], eid
iso = find_node(tree2, "sql-isolation-levels")
assert iso and "课前" in iso["content"]
path2 = find_node(tree2, "sql-path-senior")
assert "隔离级别金课" in path2["content"]
print("VALIDATED", len(SENIOR), "senior leaves")
print("DONE", p.stat().st_size)
