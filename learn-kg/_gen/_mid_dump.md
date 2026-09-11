## sql-union | UNION系 | ?? | chars=618

### 是什么

- **一句话定义**：纵向合并多个查询结果；`UNION` 去重，`UNION ALL` 保留全部。
- **要求**：列数、类型兼容，列名以第一段为准。

### 怎么写

```sql
-- 合并正式单与历史归档（保留重复用 ALL）
SELECT order_id, user_id, amount, 'live' AS src
FROM orders
WHERE status = 'paid'
UNION ALL
SELECT order_id, user_id, amount, 'archive' AS src
FROM orders_archive
WHERE status = 'paid';

-- 需要唯一集合时用 UNION（隐式去重，更慢）
SELECT user_id FROM orders
UNION
SELECT user_id FROM users WHERE is_staff = 1;
```

### 用在哪

1. **多源汇总**：直播表 + 归档表。
2. **白名单合并**：多规则命中用户并集。
3. **对照集**：A/B 两组样本拼接。

### 注意啥

- 默认优先 `UNION ALL`，确认需要去重再用 `UNION`。
- 各段 `ORDER BY` 无效于整体，整体排序放最外层。
- 列对齐失败是常见报错，用 `NULL`/`CAST` 补齐。

---

## sql-self-join | SELF JOIN | ??? | chars=537

### 是什么

- **一句话定义**：同一张表别名两次，关联比较行与行（层级、配对、前后）。
- **本质**：普通 JOIN，只是左右都来自同一表。

### 怎么写

```sql
-- 同一用户的「上一单」配对（简化示例）
SELECT
  a.order_id AS curr_id,
  b.order_id AS prev_id,
  a.user_id,
  a.created_at AS curr_at,
  b.created_at AS prev_at
FROM orders a
JOIN orders b
  ON a.user_id = b.user_id
 AND b.created_at < a.created_at
WHERE a.status = 'paid';
-- 生产更推荐窗口 LAG；SELF JOIN 适合教学与特定配对
```

### 用在哪

1. **组织树**：员工-经理（邻接表）。
2. **配对比较**：同实体两版本。
3. **教学**：理解别名与笛卡尔风险。

### 注意啥

- 易产生行爆炸，必须写紧连接条件。
- 多数「上一行」场景优先窗口函数。
- 别名务必清晰（`emp`/`mgr`）。

---

## sql-cross-join | CROSS JOIN | ??? | chars=489

### 是什么

- **一句话定义**：笛卡尔积，左表每行配右表每行；无 ON 条件。
- **用途**：生成日期骨架、维表组合，而非随意连大表。

### 怎么写

```sql
-- 用户 × 日期骨架（示意：用小维表）
WITH days AS (
  SELECT DATE('2024-01-01') AS dt
  UNION ALL SELECT DATE('2024-01-02')
  UNION ALL SELECT DATE('2024-01-03')
)
SELECT u.user_id, d.dt
FROM users u
CROSS JOIN days d
WHERE u.user_id IN (1, 2);
```

### 用在哪

1. **补全日历**：活跃用户每日一行。
2. **参数网格**：实验配置笛卡尔。
3. **小维表展开**：币种 × 渠道。

### 注意啥

- 大表 CROSS JOIN 会爆炸，必须限制两侧基数。
- 有意为之再写；误写成隐式逗号连接很危险。
- 补零场景常再 `LEFT JOIN` 事实表。

---

## sql-exists | EXISTS | ??? | chars=452

### 是什么

- **一句话定义**：半连接——主查询行在子查询中「存在」匹配即保留，不展开右表列。
- **特点**：找到一条即可短路，适合「是否有过…」。

### 怎么写

```sql
SELECT u.user_id, u.email
FROM users u
WHERE EXISTS (
  SELECT 1
  FROM orders o
  WHERE o.user_id = u.user_id
    AND o.status = 'paid'
    AND o.amount >= 100
);
```

### 用在哪

1. **过滤父集**：有过支付的用户。
2. **权限/标记**：是否存在违规事件。
3. **替代 IN**：大结果集时更稳。

### 注意啥

- `SELECT 1` 即可，不必 `SELECT *`。
- 相关列要能走索引（`orders.user_id`）。
- `NOT EXISTS` 通常比 `NOT IN` 更安全（NULL）。

---

## sql-in-notin | IN与NOT IN | ?? | chars=594

### 是什么

- **一句话定义**：`IN` 判断值是否落在列表/子查询集合；`NOT IN` 排除集合。
- **陷阱**：子查询含 NULL 时 `NOT IN` 逻辑易全空。

### 怎么写

```sql
-- IN 列表
SELECT * FROM orders
WHERE status IN ('paid', 'shipped');

-- IN 子查询
SELECT * FROM users
WHERE user_id IN (
  SELECT user_id FROM orders WHERE amount >= 500
);

-- 更推荐 NOT EXISTS 表达「从未支付」
SELECT u.*
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.user_id AND o.status = 'paid'
);
```

### 用在哪

1. **枚举过滤**：状态白名单。
2. **集合成员**：落在高价值用户集。
3. **反选**：不在黑名单（小心 NULL）。

### 注意啥

- 列表很长时改临时表/`JOIN`。
- `NOT IN` + NULL → 意外空结果。
- 与半连接（EXISTS）语义接近但优化器路径不同。

---

## sql-upsert | UPSERT | ??? | chars=668

### 是什么

- **一句话定义**：插入或在冲突时更新（幂等写入）。
- **方言**：MySQL `ON DUPLICATE KEY UPDATE`；PG/DuckDB `ON CONFLICT`。

### 怎么写

```sql
-- MySQL 8+
INSERT INTO users (user_id, email, updated_at)
VALUES (42, 'a@x.com', NOW())
ON DUPLICATE KEY UPDATE
  email = VALUES(email),
  updated_at = NOW();

-- PostgreSQL / DuckDB 风格
INSERT INTO users (user_id, email, updated_at)
VALUES (42, 'a@x.com', CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    updated_at = CURRENT_TIMESTAMP;
```

### 用在哪

1. **维表同步**：上游重复推送同一主键。
2. **配置覆盖**：按自然键幂等写入。
3. **计数累加**：冲突时 `cnt = cnt + 1`。

### 注意啥

- 必须有主键或唯一索引，否则冲突检测无效。
- 分清「覆盖」与「忽略」（`DO NOTHING`）。
- 高并发下注意死锁与更新列集合最小化。

---

## sql-view | VIEW | ?? | chars=407

### 是什么

- **一句话定义**：把查询存成虚拟表，简化复用与权限隔离。
- **形态**：普通视图 / 物化视图（引擎相关）。

### 怎么写

```sql
CREATE VIEW v_paid_orders AS
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid';

SELECT * FROM v_paid_orders WHERE created_at >= CURRENT_DATE;
```

### 用在哪

1. **口径封装**：统一「已支付订单」定义。
2. **权限**：只授视图不授基表。
3. **复杂 SQL 分层**：下层视图拼装。

### 注意啥

- 视图嵌套过深难优化，注意下推。
- 普通视图不存数据，基表变更即可见。
- 物化视图要关心刷新策略与延迟。

---

## sql-index-intro | INDEX 入门 | ?? | chars=420

### 是什么

- **一句话定义**：索引是辅助结构，用空间换查找/排序时间。
- **常见**：B-Tree 适合等值与范围；注意最左前缀。

### 怎么写

```sql
CREATE INDEX idx_orders_user_time
ON orders (user_id, created_at);

-- 覆盖查询示例（视引擎）
SELECT order_id, amount
FROM orders
WHERE user_id = 42
  AND created_at >= '2024-01-01';
```

### 用在哪

1. **点查加速**：按用户取订单。
2. **关联键**：JOIN 列建索引。
3. **排序优化**：匹配 `ORDER BY`。

### 注意啥

- 索引不是越多越好：拖慢写入、占空间。
- 低选择性列（如性别）单独索引收益低。
- 先看 `EXPLAIN`，再决定加不加。

---

## sql-datatypes | 数据类型 | ?? | chars=562

### 是什么

- **一句话定义**：列的存储类型决定精度、范围与运算符行为。
- **常用**：整数、小数、字符串、时间、布尔/枚举。

### 怎么写

```sql
CREATE TABLE orders (
  order_id    BIGINT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  status      VARCHAR(32) NOT NULL,
  created_at  TIMESTAMP NOT NULL,
  meta_json   JSON                  -- MySQL 8 / 部分仓支持
);

-- 探查类型（MySQL）
-- SHOW COLUMNS FROM orders;
```

### 用在哪

1. **建表选型**：金额用 DECIMAL 而非 FLOAT。
2. **对接契约**：与上游字段对齐。
3. **存储治理**：过长 VARCHAR 浪费与截断风险。

### 注意啥

- 浮点勿存钱；时间注意时区。
- 隐式转换会导致索引失效或精度丢失。
- 仓引擎类型名可能不同（STRING/VARCHAR）。

---

## sql-rank | RANK | ?? | chars=65

### 排名类窗口 · 章节导读

**学习目标**：分清 ROW_NUMBER / RANK / DENSE_RANK 的选用。

---

## sql-dense-rank | DENSE_RANK | ?? | chars=327

### 是什么

- **一句话定义**：并列同名次，但下一值不跳号（1,1,2）。
- **场景**：需要层级连续、允许并列。

### 怎么写

```sql
SELECT
  product_id, score,
  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rnk
FROM product_scores;
```

### 用在哪

1. **等级分层**：连续档位。
2. **并列进档**：同分同档且档位紧凑。
3. **与 RANK 对比讲解**。

### 注意啥

- 仍不能保证「恰好 N 行」。
- 去重要单行时优先 ROW_NUMBER。
- 注意分区键是否符合业务口径。

---

## sql-lag-lead | LAG/LEAD | ?? | chars=370

### 是什么

- **一句话定义**：取当前行之前/之后第 N 行的值，常用于环比。
- **要点**：必须有 `ORDER BY` 定义「前后」。

### 怎么写

```sql
SELECT
  dt, gmv,
  LAG(gmv, 1) OVER (ORDER BY dt) AS gmv_yesterday,
  gmv - LAG(gmv, 1) OVER (ORDER BY dt) AS dod
FROM daily_gmv;
```

### 用在哪

1. **日环比 / 周环比**。
2. **会话内上一步事件**。
3. **缺口检测**：与上一状态对比。

### 注意啥

- 分区边界上 `LAG` 为 NULL，需 `COALESCE`。
- 偏移 N 要与业务粒度一致。
- 不要在无序集合上使用。

---

## sql-sum-over | SUM OVER | ?? | chars=429

### 是什么

- **一句话定义**：在窗口帧内累计求和，保留明细行。
- **帧**：常用 `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`。

### 怎么写

```sql
SELECT
  dt, gmv,
  SUM(gmv) OVER (
    ORDER BY dt
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS gmv_cumsum
FROM daily_gmv;
```

### 用在哪

1. **累计 GMV / 完成度**。
2. **分区内累计**：按用户累计消费。
3. **滚动窗口**：近 N 日求和（改帧）。

### 注意啥

- `RANGE` vs `ROWS` 语义不同，并列值要小心。
- 大窗口耗内存，先缩小集合。
- 与 `GROUP BY` 选：要明细就窗口，要折叠就分组。

---

## sql-window-frame | 窗口帧ROWS | ??? | chars=629

### 是什么

- **一句话定义**：窗口帧（ROWS/RANGE）限定聚合在分区排序后的行范围，如「近 3 行」。
- **默认**：许多累计函数默认从分区起点到当前行。

### 怎么写

```sql
SELECT
  user_id,
  created_at,
  amount,
  SUM(amount) OVER (
    PARTITION BY user_id
    ORDER BY created_at
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS amt_last_3_rows,
  SUM(amount) OVER (
    PARTITION BY user_id
    ORDER BY created_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_amt
FROM orders
WHERE status = 'paid';
```

### 用在哪

1. **滑动窗口**：近 N 单金额。
2. **累计值**：running total。
3. **去毛刺**：邻域平均。

### 注意啥

- `ROWS` 按物理行，`RANGE` 按值边界，语义不同。
- 帧写错会导致「整分区」被聚进来。
- 必须有明确 `ORDER BY` 才谈得上帧。

---

## sql-cte | CTE 与子查询 | ? | chars=29

### CTE 与子查询

用 WITH 把复杂逻辑分层。

---

## sql-explain | EXPLAIN | ?? | chars=377

### 是什么

- **一句话定义**：让引擎说明将如何执行查询（访问路径、连接、排序等）。
- **目标**：找到全表扫、坏连接顺序、临时表/文件排序。

### 怎么写

```sql
EXPLAIN
SELECT *
FROM orders
WHERE user_id = 42
  AND created_at >= '2024-01-01';

-- 部分引擎
EXPLAIN ANALYZE SELECT ...;
```

### 用在哪

1. **慢查询诊断**。
2. **上线前评审**。
3. **验证索引是否被使用**。

### 注意啥

- 不同引擎输出字段不同，抓关键：type/rows/key/Extra。
- `EXPLAIN` 是估计；`ANALYZE` 带实际耗时（若支持）。
- 统计信息过期会导致离谱计划。

---

## sql-composite-index | 复合索引 | ?? | chars=471

### 是什么

- **一句话定义**：多列组成的索引，遵循最左前缀匹配。
- **设计**：等值列在前，范围列靠后；覆盖常用投影。

### 怎么写

```sql
CREATE INDEX idx_orders_uid_status_time
ON orders (user_id, status, created_at);

-- 可较好利用：(user_id) / (user_id,status) / 三者都等值或前缀+范围
SELECT order_id, amount
FROM orders
WHERE user_id = 42 AND status = 'paid'
  AND created_at >= '2024-01-01';
```

### 用在哪

1. **高频组合过滤**。
2. **覆盖索引减少回表**。
3. **对齐 ORDER BY 前缀**。

### 注意啥

- 跳过最左列会导致索引无法完整使用。
- 列顺序比「感觉上重要」更重要。
- 用 `EXPLAIN` 验证，不要凭猜测加索引。

---

## sql-drill-mid | 中级练习 | ?? | chars=1141

### 是什么

- **练习场（中级）**：加入窗口与半连接；表同上，可加 `order_events`。
- **作答**：对照窗口/EXISTS 课。

### 怎么写

```sql
-- Q1 每用户金额 Top1 订单
-- A1
SELECT * FROM (
  SELECT o.*, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY amount DESC) rn
  FROM orders o WHERE status='paid'
) t WHERE rn=1;

-- Q2 日 GMV 与昨日环比
-- A2
WITH d AS (
  SELECT DATE(created_at) dt, SUM(amount) gmv FROM orders
  WHERE status='paid' GROUP BY DATE(created_at)
)
SELECT dt, gmv, gmv-LAG(gmv) OVER(ORDER BY dt) AS dod FROM d;

-- Q3 有过退款事件的用户
-- A3
SELECT DISTINCT o.user_id FROM orders o
WHERE EXISTS (
  SELECT 1 FROM order_events e
  WHERE e.order_id=o.order_id AND e.event_type='refund'
);

-- Q4 CTE：paid→user_gmv→Top20
-- A4
WITH paid AS (SELECT * FROM orders WHERE status='paid'),
ug AS (SELECT user_id, SUM(amount) gmv FROM paid GROUP BY user_id)
SELECT * FROM ug ORDER BY gmv DESC LIMIT 20;

-- Q5 事件按 event_id 去重留最新
-- A5
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY event_time DESC) rn
  FROM order_events e
) t WHERE rn=1;
```

### 用在哪

1. **进阶作业**。
2. **报表模拟**。
3. **窗口专项**。

### 注意啥

- TopN 用 ROW_NUMBER。
- 环比缺日需补齐（加分项）。
- EXISTS 不要 `SELECT *`。

---
