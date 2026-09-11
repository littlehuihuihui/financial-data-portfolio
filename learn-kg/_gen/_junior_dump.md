## sql-insert | INSERT | ??

### 是什么

- **一句话定义**：向表追加一行或多行数据。
- **常见形态**：单行 VALUES、批量 VALUES、`INSERT … SELECT`。

### 怎么写

```sql
INSERT INTO orders (order_id, user_id, amount, status)
VALUES (1001, 42, 99.00, 'created');

-- 批量 / 从查询插入
INSERT INTO orders_archive
SELECT * FROM orders WHERE created_at < '2024-01-01';
```

### 用在哪

1. **补数回填**：历史分区补录。
2. **结果落地**：把清洗后的结果写入目标表。
3. **测试造数**：临时表灌入样例。

### 注意啥

- 显式写列名，避免表结构变更导致错位。
- 注意主键/唯一约束冲突与事务回滚。
- 大批量插入关注锁与日志膨胀。

---

## sql-update-delete | UPDATE/DELETE | ??

### 是什么

- **一句话定义**：按条件修改或删除已有行。
- **风险点**：漏写 `WHERE` 会改/删全表。

### 怎么写

```sql
-- 先 SELECT 确认影响行
SELECT COUNT(*) FROM orders WHERE status = 'pending' AND created_at < CURRENT_DATE - INTERVAL 30 DAY;

UPDATE orders
SET status = 'cancelled'
WHERE status = 'pending' AND created_at < CURRENT_DATE - INTERVAL 30 DAY;

DELETE FROM sessions WHERE expired_at < NOW();
```

### 用在哪

1. **状态机流转**：订单取消、会话过期。
2. **纠错**：修脏数据或回填字段。
3. **合规清理**：到期删除个人数据。

### 注意啥

- 生产更新前先 `SELECT` 同一条件。
- 大范围更新分批 + 事务，避免长锁。
- 优先软删除（状态位）若业务需要可追溯。

---

## sql-where-order | WHERE/ORDER | ??

### 是什么

- **一句话定义**：`WHERE` 过滤行，`ORDER BY` 决定结果顺序。
- **执行直觉**：多数引擎先过滤再排序（视计划而定）。

### 怎么写

```sql
SELECT user_id, SUM(amount) AS gmv
FROM orders
WHERE status = 'paid'
  AND created_at >= '2024-01-01'
GROUP BY user_id
ORDER BY gmv DESC;
```

### 用在哪

1. **看板筛选**：时间窗 + 状态。
2. **排行榜**：按指标降序。
3. **抽样质检**：按时间倒序看最新。

### 注意啥

- 对过滤列建合适索引；避免对列套函数导致无法用索引。
- `ORDER BY` 无索引时可能 filesort。
- `NULL` 排序行为因引擎而异，需显式处理。

---

## sql-group-by | GROUP BY | ??

### 是什么

- **一句话定义**：按键折叠行，并对组内做聚合（`COUNT`/`SUM`/`AVG` 等）。
- **与窗口区别**：`GROUP BY` 合并行；窗口保留明细。

### 怎么写

```sql
SELECT
  DATE(created_at) AS dt,
  COUNT(*) AS orders,
  SUM(amount) AS gmv
FROM orders
WHERE status = 'paid'
GROUP BY DATE(created_at)
HAVING SUM(amount) > 1000
ORDER BY dt;
```

### 用在哪

1. **日报指标**：按日 GMV / 订单数。
2. **用户汇总**：每用户消费次数。
3. **漏斗粗算**：按步骤计数。

### 注意啥

- `SELECT` 非聚合列必须在 `GROUP BY`（严格模式）。
- `HAVING` 过滤聚合结果；行过滤用 `WHERE`。
- 高基数 `GROUP BY` 注意内存与倾斜。

---

## sql-having | HAVING | ??

### 是什么

- **一句话定义**：对 `GROUP BY` 之后的聚合结果再过滤；`WHERE` 过滤行，`HAVING` 过滤组。
- **记忆**：先分组聚合，再用 HAVING 卡阈值/阈值。

### 怎么写

```sql
SELECT
  user_id,
  COUNT(*) AS order_cnt,
  SUM(amount) AS gmv
FROM orders
WHERE status = 'paid'          -- 行级过滤
GROUP BY user_id
HAVING SUM(amount) >= 1000     -- 组级过滤
   AND COUNT(*) >= 3
ORDER BY gmv DESC;
```

### 用在哪

1. **高价值用户**：GMV/频次门槛。
2. **异常组**：某类目订单数暴增。
3. **质量门禁**：分组后校验完整性。

### 注意啥

- 能在 `WHERE` 做的过滤不要拖到 `HAVING`（更早裁剪更省）。
- `HAVING` 可引用聚合或分组列；别引擎对别名支持不一。
- 窗口函数结果过滤通常放外层 `WHERE`，不是 HAVING。

---

## sql-case | CASE WHEN | ??

### 是什么

- **一句话定义**：按条件分支返回值，相当于 SQL 里的 if-else。
- **两种写法**：简单 CASE（等值）与搜索 CASE（任意条件）。

### 怎么写

```sql
SELECT
  order_id,
  amount,
  CASE
    WHEN amount >= 500 THEN 'VIP'
    WHEN amount >= 100 THEN 'NORMAL'
    ELSE 'LOW'
  END AS tier,
  CASE status
    WHEN 'paid' THEN 1
    WHEN 'refunded' THEN -1
    ELSE 0
  END AS status_flag
FROM orders;
```

### 用在哪

1. **分档打标**：用户层级、订单区间。
2. **宽表透视**：把行值映射成多列指标。
3. **兼容映射**：状态码转可读标签。

### 注意啥

- 条件按书写顺序匹配，先写更具体的分支。
- `ELSE` 省略时未匹配返回 NULL。
- 复杂逻辑可拆 CTE，避免嵌套 CASE 难读。

---

## sql-functions | 常用函数 | ??

### 是什么

- **一句话定义**：内置标量/聚合函数做类型转换、字符串、日期与数值计算。
- **原则**：优先引擎内置函数，注意方言差异。

### 怎么写

```sql
SELECT
  order_id,
  UPPER(TRIM(status)) AS status_norm,
  ROUND(amount, 2) AS amount_2,
  DATE_FORMAT(created_at, '%Y-%m-%d') AS dt,          -- MySQL
  CAST(user_id AS CHAR) AS user_id_str,
  CONCAT('U', user_id) AS user_code
FROM orders
WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY);
```

### 用在哪

1. **清洗**：去空格、统一大小写。
2. **报表**：日期截断、金额四舍五入。
3. **对接**：类型转换喂给下游系统。

### 注意啥

- 函数包列会导致索引难用（见「索引失效」）。
- MySQL / PG / DuckDB 日期函数名不同，写可移植 SQL 时封装。
- 聚合函数与窗口函数语义不同，勿混用。

---

## sql-distinct | DISTINCT | ??

### 是什么

- **一句话定义**：去掉结果集中的重复行（或按指定列去重投影）。
- **对比**：业务「最新一条」去重更常用窗口 `ROW_NUMBER`。

### 怎么写

```sql
-- 去重用户（有过支付）
SELECT DISTINCT user_id
FROM orders
WHERE status = 'paid';

-- 多列组合去重
SELECT DISTINCT user_id, DATE(created_at) AS dt
FROM orders;
```

### 用在哪

1. **维表去重**：源系统重复维度键。
2. **快速探查**：有哪些取值。
3. **集合运算前**：先压扁再 UNION。

### 注意啥

- `DISTINCT` + 大宽表很贵，先缩小列与过滤。
- 与 `GROUP BY` 可互换场景下，聚合意图更清晰时用 GROUP BY。
- 「每组留一行」用窗口函数，不要滥用 DISTINCT。

---

## sql-limit-page | 分页LIMIT | ??

### 是什么

- **一句话定义**：用 `LIMIT`/`OFFSET`（或键集分页）截取结果页。
- **要点**：无 `ORDER BY` 的分页不稳定。

### 怎么写

```sql
-- 偏移分页（简单但深分页慢）
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, order_id DESC
LIMIT 20 OFFSET 40;   -- 第 3 页，每页 20

-- 键集分页（推荐深翻页）
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
  AND (created_at, order_id) < ('2024-06-01 12:00:00', 9000)
ORDER BY created_at DESC, order_id DESC
LIMIT 20;
```

### 用在哪

1. **列表接口**：订单/消息分页。
2. **批处理**：按页扫描大表。
3. **导出预览**：先看前 N 行。

### 注意啥

- 深 `OFFSET` 会扫描并丢弃大量行，改用键集。
- 排序键建议唯一，避免同值页抖动。
- MySQL 8 / DuckDB 均支持 `LIMIT/OFFSET`；PG 还可用 `FETCH`。

---

## sql-inner-join | INNER | ??

### 是什么

- **一句话定义**：只保留两表匹配成功的行。
- **结果行数**：≤ 两边匹配组合数。

### 怎么写

```sql
SELECT o.order_id, u.email, o.amount
FROM orders o
INNER JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid';
```

### 用在哪

1. **事实+维度**：订单拼用户属性。
2. **必须两边都有**：缺维就丢掉。
3. **质量排查**：对比 INNER vs LEFT 行数差。

### 注意啥

- 关联键类型不一致会导致隐式转换、索引失效。
- 一对多会放大行数，先想清粒度。
- `ON` 写错成恒真条件会笛卡尔积。

---

## sql-left-join | LEFT | ??

### 是什么

- **一句话定义**：保留左表全部行，右表无匹配则填 NULL。
- **典型用途**：主表完整，维表可缺。

### 怎么写

```sql
SELECT u.user_id, u.email, o.order_id
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;  -- 无订单用户
```

### 用在哪

1. **主数据完整清单**：用户列表+是否下单。
2. **反连接**：找「没有」的一侧。
3. **宽表拼装**：事实保留，维可空。

### 注意啥

- 过滤右表列时，条件放 `ON` 还是 `WHERE` 语义不同。
- `WHERE right.key IS NULL` 才是反连接写法。
- 多段 LEFT JOIN 链式放大，注意粒度。

---

## sql-create-table | CREATE TABLE | ??

### 是什么

- **一句话定义**：声明表名、列类型、默认值与约束。
- **目标**：让数据「有形状」，下游可依赖。

### 怎么写

```sql
CREATE TABLE users (
  user_id    BIGINT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  status     VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 用在哪

1. **建主题表**：用户/订单落库。
2. **临时建模**：分析沙箱建表验证。
3. **分区表**：大表按日/月分区（引擎相关）。

### 注意啥

- 选对类型与长度，避免隐式转换。
- 主键与业务键策略要想清（代理键 vs 自然键）。
- 变更用迁移脚本，禁止线上裸改。

---

## sql-constraints | 主键/外键/唯一 | ??

### 是什么

- **一句话定义**：约束保证完整性——主键唯一非空、外键引用合法、唯一防重复。
- **实务**：数仓常弱化外键，用质量校验代替。

### 怎么写

```sql
ALTER TABLE orders
  ADD CONSTRAINT pk_orders PRIMARY KEY (order_id),
  ADD CONSTRAINT uq_orders_biz UNIQUE (biz_no),
  ADD CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id);
```

### 用在哪

1. **防脏写**：业务库保证引用完整。
2. **去重口径**：唯一约束兜底。
3. **建模评审**：约束即文档。

### 注意啥

- OLAP/数仓批量装载时外键可能拖慢，需权衡。
- 软删除与外键并存时注意「逻辑删除行仍被引用」。
- 约束名要可读，方便报错定位。

---

## sql-drill-junior | 初级练习 | ?

### 是什么

- **练习场（初级）**：共用 `users(user_id,email)`、`orders(order_id,user_id,amount,status,created_at)`。
- **作答**：先自写，再对答案。

### 怎么写

```sql
-- Q1 查询最近 10 笔 paid 订单
-- A1
SELECT order_id, user_id, amount, created_at
FROM orders WHERE status='paid'
ORDER BY created_at DESC LIMIT 10;

-- Q2 统计每个用户订单数
-- A2
SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id;

-- Q3 找出从未下单的用户
-- A3
SELECT u.user_id, u.email FROM users u
LEFT JOIN orders o ON o.user_id=u.user_id
WHERE o.order_id IS NULL;

-- Q4 金额缺失视为 0 后求和
-- A4
SELECT user_id, SUM(COALESCE(amount,0)) AS s
FROM orders GROUP BY user_id;

-- Q5 支付用户按 GMV 分档
-- A5
SELECT user_id, SUM(amount) AS gmv,
  CASE WHEN SUM(amount)>=1000 THEN 'H' WHEN SUM(amount)>=100 THEN 'M' ELSE 'L' END AS tier
FROM orders WHERE status='paid' GROUP BY user_id;
```

### 用在哪

1. **课堂作业**。
2. **面试热身**。
3. **自学打卡**。

### 注意啥

- 先建临时表灌入几行样例再跑。
- 注意 `LEFT JOIN` 判空用右表主键。
- 聚合与 CASE 顺序：先 SUM 再分档。

---
