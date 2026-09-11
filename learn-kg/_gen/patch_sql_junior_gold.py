# -*- coding: utf-8 -*-
"""Align junior-path SQL leaves to constitution lesson template + shared sample."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

JUNIOR = {}

JUNIOR["sql-insert"] = """
### 课前

- **场景**：测试环境要补一笔「新创建」订单，并批量把历史 cancelled 单归档。  
- **目标**：掌握单行/批量 `INSERT` 与 `INSERT … SELECT`；养成写列名的习惯。  
- **先修**：NULL处理 → **下一课**：UPDATE/DELETE

### 样例输入（写入前 orders 已有 8 行）

| order_id | user_id | amount | status | created_at |
|---:|---:|---:|---|---|
| 108 | 1 | 30.00 | paid | 2024-01-07 09:30:00 |
| … | … | … | … | （其余见教程宪法） |

本课会**追加** `109`，并演示从查询插入（归档表可临时建）。

### 是什么

- **一句话定义**：向表追加一行或多行。  
- **三种形态**：单行 VALUES、多行 VALUES、`INSERT … SELECT`。  
- **直觉**：往 Excel 末尾加行，但受主键/约束约束。

### 怎么写

```sql
-- 1) 单行：显式列名（推荐）
INSERT INTO orders (order_id, user_id, amount, status, created_at)
VALUES (109, 2, 66.00, 'created', '2024-01-08 10:00:00');

-- 2) 批量 VALUES
INSERT INTO orders (order_id, user_id, amount, status, created_at) VALUES
  (110, 4, 15.00, 'created', '2024-01-08 11:00:00'),
  (111, 4, NULL,  'created', '2024-01-08 11:05:00');  -- amount 允许 NULL

-- 3) INSERT … SELECT（归档 cancelled）
CREATE TABLE IF NOT EXISTS orders_archive LIKE orders;  -- MySQL；DuckDB 可用 CTAS
INSERT INTO orders_archive
SELECT * FROM orders WHERE status = 'cancelled';
```

### 查询结果

插入后抽查：

| order_id | user_id | amount | status |
|---:|---:|---:|---|
| 109 | 2 | 66.00 | created |
| 110 | 4 | 15.00 | created |
| 111 | 4 | NULL | created |

```sql
SELECT COUNT(*) AS n FROM orders;           -- 原 8 + 本课插入行数
SELECT * FROM orders_archive;               -- 至少含 107
```

### 用在哪

1. **补数/造数**：联调、单元测试灌样例。  
2. **结果落地**：清洗后写入目标表。  
3. **归档搬迁**：`INSERT … SELECT` + 后续删除源表行。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 不写列名只写 VALUES | 表加列后错位/报错 | 永远显式列名 |
| 主键重复插入 101 | Duplicate key | 换新 id 或 `INSERT IGNORE`/`ON DUPLICATE`（另课） |
| 类型不匹配 | 截断或报错 | 对齐 DECIMAL/时间字面量 |

### 动手

插入一笔 `user_id=3, status='paid', amount=55` 的订单，再 `SELECT` 确认；**不要**改动已有 101–108（或先备份）。
"""

JUNIOR["sql-update-delete"] = """
### 课前

- **场景**：把长期停留在 `created` 的订单标为 `cancelled`；清理误造的测试行。  
- **目标**：会写带 `WHERE` 的 UPDATE/DELETE；养成「先 SELECT 再改」的习惯。  
- **先修**：INSERT → **下一课**：WHERE/ORDER

### 样例输入

| order_id | user_id | amount | status | created_at |
|---:|---:|---:|---|---|
| 104 | 2 | 50.00 | created | 2024-01-01 12:00:00 |
| 107 | 3 | 200.00 | cancelled | 2024-01-06 16:00:00 |

统一库里 `created` 仅 104（若你刚做完 INSERT 课，可能还有 109+）。

### 是什么

- **一句话定义**：按条件修改或删除已有行。  
- **最大风险**：漏写 `WHERE` → 全表被改/删。  
- **安全顺序**：同一条件先 `SELECT` → 看行数 → 再 UPDATE/DELETE → 再 `SELECT` 验收。

### 怎么写

```sql
-- 0) 先确认影响面
SELECT order_id, user_id, status, created_at
FROM orders
WHERE status = 'created'
  AND created_at < '2024-01-03';

-- 1) 状态流转
UPDATE orders
SET status = 'cancelled'
WHERE status = 'created'
  AND created_at < '2024-01-03';
-- 期望：至少命中 104

-- 2) 删除误造测试行（示例：order_id>=200 的沙箱行）
-- DELETE FROM orders WHERE order_id >= 200;

-- 3) 软删除思路（生产更常见）：改状态而非物理删
-- UPDATE orders SET status='cancelled' WHERE …;
```

### 查询结果

UPDATE 后：

| order_id | status |
|---:|---|
| 104 | cancelled |

```sql
SELECT status, COUNT(*) n FROM orders GROUP BY status;
```

### 用在哪

1. **状态机**：支付成功、取消、关闭。  
2. **纠错回填**：修脏字段。  
3. **合规清理**：到期数据删除（常配分批）。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `UPDATE orders SET status='cancelled';` 无 WHERE | 全表变 cancelled | 永远带条件；事务里可先试再 COMMIT |
| 条件写反 | 误伤 paid 单 | 先 SELECT 同一 WHERE |
| 大范围一次提交 | 长锁、复制延迟 | 按主键分批 |

### 动手

把 104 改回 `created`（若你愿意还原），或新建 `order_id=201` 再 DELETE 掉，验证「先 SELECT 再删」。
"""

JUNIOR["sql-where-order"] = """
### 课前

- **场景**：运营要「上海用户、已支付、按时间倒序」的订单列表。  
- **目标**：组合 `WHERE` 多条件与 `ORDER BY`；知道过滤在排序前的业务意义。  
- **先修**：UPDATE/DELETE → **下一课**：GROUP BY

### 样例输入

**users（城市）**

| user_id | user_name | city |
|---:|---|---|
| 1 | Ada | 上海 |
| 2 | Bob | 北京 |
| 3 | Cara | 上海 |
| 4 | Dan | NULL |

**orders（支付单摘要）**：101/102/103/105/106/108 为 paid。

### 是什么

- **一句话定义**：`WHERE` 决定留下哪些行；`ORDER BY` 决定呈现顺序。  
- **直觉**：先筛表格行，再按某列排序。  
- **注意**：没有 `ORDER BY` 时，`LIMIT` 的「前 N 行」无业务含义。

### 怎么写

```sql
SELECT
  o.order_id,
  o.user_id,
  u.user_name,
  u.city,
  o.amount,
  o.created_at
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid'
  AND u.city = '上海'                 -- Dan 的 city 是 NULL，不会进来
ORDER BY o.created_at DESC;
```

### 查询结果（期望）

| order_id | user_id | user_name | city | amount |
|---:|---:|---|---|---:|
| 106 | 3 | Cara | 上海 | NULL |
| 108 | 1 | Ada | 上海 | 30.00 |
| 103 | 1 | Ada | 上海 | 120.00 |
| 102 | 1 | Ada | 上海 | 120.00 |
| 101 | 1 | Ada | 上海 | 80.00 |

（具体排序以 `created_at` 为准；106 最晚。）

### 用在哪

1. **列表页筛选**：状态 + 时间窗。  
2. **排行/最新**：`ORDER BY` 指标或时间。  
3. **质检抽查**：倒序看最新脏数据。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `WHERE city = NULL` | 永远空 | 用 `IS NULL`（见 NULL 金课） |
| 只 LIMIT 不 ORDER | 「最新」不稳定 | 必写 ORDER BY |
| 对列套函数过滤 | 索引难用 | 写成范围：`created_at >= …` |

### 动手

查出「北京用户」的全部订单（含非 paid），按 `amount DESC`，`NULL` 排最后（可用 `ORDER BY amount IS NULL, amount DESC`）。
"""

JUNIOR["sql-group-by"] = """
### 课前

- **场景**：要「每用户支付订单数与 GMV」做简报。  
- **目标**：写出正确的 `GROUP BY` + 聚合；分清合并行与明细行。  
- **先修**：WHERE/ORDER → **下一课**：HAVING

### 样例输入（paid 行）

| order_id | user_id | amount | status |
|---:|---:|---:|---|
| 101 | 1 | 80.00 | paid |
| 102 | 1 | 120.00 | paid |
| 103 | 1 | 120.00 | paid |
| 105 | 2 | 90.00 | paid |
| 106 | 3 | NULL | paid |
| 108 | 1 | 30.00 | paid |

### 是什么

- **一句话定义**：按键把多行折成一组，并对组内做 `COUNT`/`SUM`/`AVG` 等。  
- **与窗口区别**：`GROUP BY` **减少行数**；窗口函数保留明细。  
- **规则**：`SELECT` 里非聚合列必须出现在 `GROUP BY`（严格模式）。

### 怎么写

```sql
SELECT
  user_id,
  COUNT(*)                    AS order_cnt,   -- 计行，含 amount NULL
  COUNT(amount)               AS amt_cnt,     -- 忽略 NULL
  SUM(amount)                 AS gmv_raw,     -- NULL 不参与求和
  SUM(COALESCE(amount, 0))    AS gmv_filled
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY gmv_filled DESC;
```

### 查询结果

| user_id | order_cnt | amt_cnt | gmv_raw | gmv_filled |
|---:|---:|---:|---:|---:|
| 1 | 4 | 4 | 350.00 | 350.00 |
| 2 | 1 | 1 | 90.00 | 90.00 |
| 3 | 1 | 0 | NULL | 0.00 |

### 用在哪

1. **日报/周报**：按日、按渠道汇总。  
2. **用户画像粗指标**：频次与金额。  
3. **对账**：按主键聚合后比对。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `SELECT user_id, amount, COUNT(*)` 无分组 amount | 报错或不确定 | 聚合或加入 GROUP BY |
| 用 `COUNT(amount)` 当订单数 | 漏计金额缺失单 | 订单数用 `COUNT(*)` |
| JOIN 明细后再 SUM 头表金额 | GMV 翻倍 | 见 JOIN 爆炸金课 |

### 动手

按 `status` 分组，输出各状态订单数与 `SUM(COALESCE(amount,0))`。
"""

JUNIOR["sql-having"] = """
### 课前

- **场景**：只要「支付订单 ≥2 笔」的用户做召回，而不是全部用户。  
- **目标**：分清 `WHERE`（行）与 `HAVING`（组）；会写阈值过滤。  
- **先修**：GROUP BY → **下一课**：CASE WHEN

### 样例输入

同 GROUP BY 课的 paid 明细；user_id=1 有 4 笔，2 与 3 各 1 笔。

### 是什么

- **一句话定义**：在 `GROUP BY` 聚合之后，对**组**再过滤。  
- **记忆**：`WHERE` 管行，`HAVING` 管组。  
- **性能直觉**：能 `WHERE` 掉的行，不要留到 `HAVING`。

### 怎么写

```sql
SELECT
  user_id,
  COUNT(*) AS order_cnt,
  SUM(COALESCE(amount, 0)) AS gmv
FROM orders
WHERE status = 'paid'              -- 先丢掉非支付行
GROUP BY user_id
HAVING COUNT(*) >= 2               -- 再按组门槛
ORDER BY gmv DESC;
```

### 查询结果

| user_id | order_cnt | gmv |
|---:|---:|---:|
| 1 | 4 | 350.00 |

（user 2、3 被 HAVING 滤掉。）

### 用在哪

1. **高活/高价值用户**：频次或 GMV 门槛。  
2. **异常组**：某类目订单数异常高。  
3. **质量门禁**：分组后校验条数。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `WHERE COUNT(*)>=2` | 语法错 | 聚合条件放 HAVING |
| `HAVING status='paid'` | 本可提前过滤 | 状态过滤放 WHERE |
| 引擎不认 HAVING 别名 | 报错 | 写 `HAVING COUNT(*)>=2` 而非别名 |

### 动手

找出 `gmv_filled >= 100` 的支付用户（`HAVING SUM(COALESCE(amount,0)) >= 100`）。
"""

JUNIOR["sql-case"] = """
### 课前

- **场景**：要把支付用户打成 H/M/L 档，方便运营分层触达。  
- **目标**：会写搜索型 `CASE WHEN`；理解它在 `SELECT`/`聚合` 中的位置。  
- **先修**：HAVING → **下一课**：常用函数

### 样例输入

按用户汇总后的 GMV（与 GROUP BY 课一致）：

| user_id | gmv_filled |
|---:|---:|
| 1 | 350.00 |
| 2 | 90.00 |
| 3 | 0.00 |

### 是什么

- **一句话定义**：按条件分支返回值，SQL 里的 if-else。  
- **两种写法**：搜索 CASE（`WHEN 条件`）与简单 CASE（等值匹配）。  
- **落点**：可出现在 `SELECT`、`ORDER BY`、聚合参数里。

### 怎么写

```sql
SELECT
  user_id,
  SUM(COALESCE(amount, 0)) AS gmv,
  CASE
    WHEN SUM(COALESCE(amount, 0)) >= 300 THEN 'H'
    WHEN SUM(COALESCE(amount, 0)) >= 100 THEN 'M'
    ELSE 'L'
  END AS tier
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY gmv DESC;

-- 行级标签（不聚合）
SELECT
  order_id,
  status,
  CASE status
    WHEN 'paid' THEN '已支付'
    WHEN 'created' THEN '待支付'
    WHEN 'cancelled' THEN '已取消'
    ELSE status
  END AS status_cn
FROM orders;
```

### 查询结果（分档）

| user_id | gmv | tier |
|---:|---:|---|
| 1 | 350.00 | H |
| 2 | 90.00 | L |
| 3 | 0.00 | L |

### 用在哪

1. **分层运营**：用户/订单分档。  
2. **宽表指标**：一行多条件计数（`SUM(CASE WHEN … THEN 1 END)`）。  
3. **字典映射**：状态码 → 中文。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 阈值顺序写反 | 全进错误档 | 从高到低写 WHEN |
| `CASE` 里再聚合与外层冲突 | 报错 | 聚合与 CASE 同层或外层套一层 |
| ELSE 省略且无匹配 | 得 NULL | 关键写 ELSE |

### 动手

用 `SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END)` 按 `user_id` 统计支付笔数，与 `COUNT`+`WHERE` 对照。
"""

JUNIOR["sql-functions"] = """
### 课前

- **场景**：报表要「下单日期、金额文本、城市缺失填未知」。  
- **目标**：会用日期截取、字符串、`COALESCE`/`NULLIF` 等常用函数。  
- **先修**：CASE WHEN → **下一课**：DISTINCT

### 样例输入

| order_id | amount | created_at | user_id |
|---:|---:|---|---:|
| 106 | NULL | 2024-01-05 14:00:00 | 3 |
| 101 | 80.00 | 2024-01-01 10:00:00 | 1 |

users：Dan 的 `city` 为 NULL。

### 是什么

- **一句话定义**：对列值做转换/计算的内置能力（日期、字符串、数值、空值）。  
- **原则**：优先标准函数；注意方言差异（`DATE_FORMAT` vs `TO_CHAR`）。  
- **与业务**：函数常用于展示层；过滤时慎对索引列套函数。

### 怎么写

```sql
SELECT
  o.order_id,
  DATE(o.created_at)                         AS order_dt,      -- MySQL/DuckDB
  COALESCE(CAST(o.amount AS CHAR), '缺失')   AS amount_txt,
  COALESCE(u.city, '未知')                   AS city_filled,
  NULLIF(u.city, '北京')                     AS city_null_if_bj, -- 北京→NULL 演示
  ROUND(COALESCE(o.amount, 0), 1)            AS amt_1
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.order_id IN (101, 106)
ORDER BY o.order_id;
```

### 查询结果（示意）

| order_id | order_dt | amount_txt | city_filled |
|---:|---|---|---|
| 101 | 2024-01-01 | 80.00 | 上海 |
| 106 | 2024-01-05 | 缺失 | 上海 |

### 用在哪

1. **报表展示**：日期截断、金额格式。  
2. **空值兜底**：`COALESCE` 填默认。  
3. **轻度清洗**：`TRIM`/`UPPER`/`NULLIF`。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `WHERE DATE(created_at)='2024-01-01'` | 难走索引 | 用时间范围谓词 |
| 混用方言函数 | 换引擎报错 | 教程优先 DATE/COALESCE |
| `COALESCE` 类型不一致 | 隐式转换怪异 | 显式 CAST |

### 动手

列出所有用户：`city` 用 `COALESCE` 显示「未知」，并增加一列 `name_len = LENGTH(user_name)`。
"""

JUNIOR["sql-distinct"] = """
### 课前

- **场景**：要「有过支付订单的用户 ID 列表」，不要重复。  
- **目标**：会用 `DISTINCT` / `GROUP BY` 去重；知道去重成本。  
- **先修**：常用函数 → **下一课**：分页 LIMIT

### 样例输入（paid 的 user_id）

`1,1,1,2,3,1` → 去重后 `1,2,3`。

### 是什么

- **一句话定义**：对结果集按所选列组合去掉重复行。  
- **等价思路**：单列去重常可用 `GROUP BY` 表达。  
- **代价**：通常要排序或哈希，大数据慎用。

### 怎么写

```sql
-- 支付过的用户（去重）
SELECT DISTINCT user_id
FROM orders
WHERE status = 'paid'
ORDER BY user_id;

-- 多列：城市 × 状态 组合
SELECT DISTINCT u.city, o.status
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE u.city IS NOT NULL
ORDER BY u.city, o.status;

-- 计数去重
SELECT COUNT(DISTINCT user_id) AS paid_users
FROM orders
WHERE status = 'paid';
```

### 查询结果

| user_id |
|---:|
| 1 |
| 2 |
| 3 |

`COUNT(DISTINCT user_id)` → **3**。

### 用在哪

1. **维值枚举**：有哪些状态/城市。  
2. **去重人头**：UV 粗算。  
3. **探查数据**：看组合基数。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `COUNT(DISTINCT *)` | 不支持/无意义 | 指定列 |
| DISTINCT 多列却只想去重一列 | 行仍多 | 看清「组合」语义 |
| 用 DISTINCT 修 JOIN 爆炸 | 指标仍可能错 | 先聚合再 JOIN（金课） |

### 动手

`SELECT DISTINCT city FROM users`——观察 NULL 是否单独成一行。
"""

JUNIOR["sql-limit-page"] = """
### 课前

- **场景**：订单列表第 2 页，每页 3 条，按时间倒序。  
- **目标**：掌握 `LIMIT/OFFSET` 分页；知道深分页问题。  
- **先修**：DISTINCT → **下一课**：INNER JOIN

### 样例输入

paid 订单按 `created_at DESC` 的顺序（统一库）：

108 → 106 → 105 → 103 → 102 → 101（再考虑你插入的新行）。

### 是什么

- **一句话定义**：限制返回行数；`OFFSET` 跳过前 N 行做翻页。  
- **骨架**：`ORDER BY … LIMIT page_size OFFSET (page-1)*page_size`。  
- **陷阱**：大 OFFSET 越翻越慢；稳定排序必须有决胜列。

### 怎么写

```sql
-- 第 1 页（每页 3 条）
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, order_id DESC
LIMIT 3 OFFSET 0;

-- 第 2 页
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, order_id DESC
LIMIT 3 OFFSET 3;

-- 深分页更稳：寻键（keyset）示意——上一页最后一条时间之后
-- SELECT … WHERE status='paid' AND (created_at, order_id) < (?, ?)
-- ORDER BY created_at DESC, order_id DESC LIMIT 3;
```

### 查询结果（第 1 页示意）

| order_id | user_id | amount | created_at |
|---:|---:|---:|---|
| 108 | 1 | 30.00 | 2024-01-07 … |
| 106 | 3 | NULL | 2024-01-05 … |
| 105 | 2 | 90.00 | 2024-01-04 … |

### 用在哪

1. **后台列表**：订单/日志翻页。  
2. **TopN**：`ORDER BY … LIMIT N`（无 OFFSET）。  
3. **抽样**：先排序再限流。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| LIMIT 无 ORDER BY | 每页内容飘忽 | 必写稳定 ORDER BY |
| `OFFSET 100000` | 越来越慢 | 改用寻键分页 |
| page 从 0/1 搞混 | 漏行/重行 | 统一 `(page-1)*size` |

### 动手

写出「每页 2 条」时第 3 页的 `LIMIT/OFFSET`，并跑一遍核对行。
"""

JUNIOR["sql-inner-join"] = """
### 课前

- **场景**：订单明细要带上用户名，只要「有匹配用户」的订单。  
- **目标**：写清 `INNER JOIN` 与连接条件；理解未匹配行被丢弃。  
- **先修**：分页 LIMIT → **下一课**：LEFT JOIN

### 样例输入

**orders** 的 `user_id` ∈ {1,2,3}；**users** 有 1–4。  
若存在「孤儿订单」（user_id 不在 users），INNER 会丢掉它——本库种子无孤儿。

### 是什么

- **一句话定义**：只保留两表**键匹配成功**的行。  
- **直觉**：交集。  
- **写法**：`FROM a JOIN b ON …`（INNER 可省略写）。

### 怎么写

```sql
SELECT
  o.order_id,
  o.amount,
  o.status,
  u.user_name,
  u.city
FROM orders o
INNER JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid'
ORDER BY o.order_id;
```

### 查询结果（节选）

| order_id | amount | status | user_name | city |
|---:|---:|---|---|---|
| 101 | 80.00 | paid | Ada | 上海 |
| 105 | 90.00 | paid | Bob | 北京 |
| 106 | NULL | paid | Cara | 上海 |

Dan（user_id=4）无支付单，不会出现在结果中。

### 用在哪

1. **事实+维度**：订单关联用户/商品维。  
2. **必须两端都有**：支付成功且用户有效。  
3. **多表流水线**：先 INNER 缩小集合。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `JOIN` 写成笛卡尔再 WHERE | 慢且易错 | 条件写在 ON |
| 连接键类型不一致 | 隐式转换/丢索引 | 统一类型 |
| 一对多未察觉 | 行数膨胀 | 下一课 LEFT + 爆炸金课 |

### 动手

`orders INNER JOIN order_items`，看 101 是否变成两行——这就是爆炸的预告。
"""

JUNIOR["sql-left-join"] = """
### 课前

- **场景**：要「全部用户及是否下过单」；找出从未下单的用户。  
- **目标**：掌握 `LEFT JOIN`；用右表主键 `IS NULL` 找未匹配。  
- **先修**：INNER → **下一课**：JOIN 爆炸（金课）

### 样例输入

users：1 Ada, 2 Bob, 3 Cara, 4 Dan。  
Dan 在种子数据中**没有任何订单**。

### 是什么

- **一句话定义**：保留左表全部行；右表无匹配时右列填 NULL。  
- **直觉**：左表是主名单，右表信息能贴上就贴，贴不上留空。  
- **找差集**：`LEFT JOIN` + `WHERE 右表.key IS NULL`。

### 怎么写

```sql
-- 全用户 + 订单数（含 0）
SELECT
  u.user_id,
  u.user_name,
  COUNT(o.order_id) AS order_cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
GROUP BY u.user_id, u.user_name
ORDER BY u.user_id;

-- 从未下单的用户
SELECT u.user_id, u.user_name, u.city
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;
```

### 查询结果

**订单数**

| user_id | user_name | order_cnt |
|---:|---|---:|
| 1 | Ada | 4 |
| 2 | Bob | 2 |
| 3 | Cara | 2 |
| 4 | Dan | 0 |

**从未下单**

| user_id | user_name | city |
|---:|---|---|
| 4 | Dan | NULL |

### 用在哪

1. **名单驱动报表**：以用户/门店为主保留全量。  
2. **反选**：无订单、无支付、无埋点。  
3. **补维**：事实表左连维度，维缺失时仍留事实。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| `WHERE o.status='paid'` 写在 LEFT 后 | 把无单用户滤掉，变成 INNER | 条件放 ON，或先子查询 |
| `WHERE o.user_id IS NULL` | 不稳 | 用右表**主键** `order_id IS NULL` |
| `COUNT(*)` 计未下单 | Dan 也变 1 | 用 `COUNT(o.order_id)` |

### 动手

`LEFT JOIN` 出每个用户最近一笔订单时间（可用子查询或窗口，先试 `MAX(o.created_at)`）。
"""

JUNIOR["sql-create-table"] = """
### 课前

- **场景**：要新建一张「用户标签」表，供后续练习写入。  
- **目标**：会写 `CREATE TABLE`（列类型、主键、非空）；理解与统一样例库的关系。  
- **先修**：教程宪法中的建表脚本 → **下一课**：约束

### 样例输入

本课**新建**表，不改 `users/orders` 结构。对照宪法中的 `users` 定义学习类型选择。

### 是什么

- **一句话定义**：声明表名、列、类型与基本完整性，创建空表。  
- **直觉**：先画好表格表头，再往里填数。  
- **方言**：`INT`/`VARCHAR`/`DECIMAL`/`TIMESTAMP` 为跨库常用子集。

### 怎么写

```sql
CREATE TABLE user_tags (
  user_id    INT         NOT NULL,
  tag        VARCHAR(32) NOT NULL,
  score      DECIMAL(5,2),
  updated_at TIMESTAMP   NOT NULL,
  PRIMARY KEY (user_id, tag)
);

-- 灌两行玩
INSERT INTO user_tags VALUES
  (1, 'high_gmv', 0.90, '2024-01-08 12:00:00'),
  (2, 'new_user', 0.40, '2024-01-08 12:00:00');

SELECT * FROM user_tags;
```

### 查询结果

| user_id | tag | score | updated_at |
|---:|---|---:|---|
| 1 | high_gmv | 0.90 | 2024-01-08 … |
| 2 | new_user | 0.40 | 2024-01-08 … |

### 用在哪

1. **建模建表**：主题表、中间表、临时结果表。  
2. **练习沙箱**：与统一库并列的个人练习表。  
3. **CTAS**：`CREATE TABLE t AS SELECT …`（另见进阶）。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 金额用 FLOAT | 对账对不齐 | 用 DECIMAL |
| 无主键 | 重复行难治 | 业务键或代理主键 |
| 随意改宪法四表结构 | 后续课对不上 | 练习用新表名 |

### 动手

建 `daily_gmv(dt DATE PRIMARY KEY, gmv DECIMAL(12,2))`，用 `INSERT … SELECT` 从 `orders` 聚合灌入一天。
"""

JUNIOR["sql-constraints"] = """
### 课前

- **场景**：误插入重复主键或订单指向不存在用户，库应拒绝。  
- **目标**：理解主键/非空/唯一/外键在防脏上的作用。  
- **先修**：CREATE TABLE → **下一课**：INNER/LEFT 或练习场

### 样例输入

统一库：`users.user_id`、`orders.order_id` 已是主键；`orders.amount` 可空，`user_name` 非空。

### 是什么

- **一句话定义**：约束是数据库对数据合法性的强制规则。  
- **常见**：`PRIMARY KEY`、`NOT NULL`、`UNIQUE`、`FOREIGN KEY`、`CHECK`。  
- **直觉**：表格的「数据验证」，写错直接报错而非默默脏下去。

### 怎么写

```sql
-- 1) 主键冲突（应失败）
-- INSERT INTO users VALUES (1, 'X', '广州', '2024-01-01 00:00:00');

-- 2) NOT NULL 冲突（应失败）
-- INSERT INTO users (user_id, user_name, city, created_at)
-- VALUES (5, NULL, '深圳', '2024-01-01 00:00:00');

-- 3) 演示 UNIQUE（新建）
CREATE TABLE user_email (
  user_id INT PRIMARY KEY,
  email   VARCHAR(64) NOT NULL UNIQUE
);
INSERT INTO user_email VALUES (1, 'ada@example.com');
-- INSERT INTO user_email VALUES (2, 'ada@example.com');  -- 应失败

-- 4) 外键（MySQL 需引擎支持；DuckDB/部分环境可跳过）
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_user
--   FOREIGN KEY (user_id) REFERENCES users(user_id);
```

### 查询结果

本课「结果」是**报错或拒绝写入**，属正确行为：

| 操作 | 期望 |
|---|---|
| 重复 PK | Duplicate / unique violation |
| user_name NULL | NOT NULL violation |
| 重复 email | UNIQUE violation |

### 用在哪

1. **防脏数据**：主键与唯一保证实体不重复。  
2. **引用完整**：外键避免孤儿订单（视仓库规范而定）。  
3. **业务规则**：CHECK 限制状态枚举（方言支持不一）。

### 易错对照

| 错法 | 现象 | 纠正 |
|---|---|---|
| 只靠应用校验 | 导入/脚本绕过产生脏数 | 关键约束兜底 |
| 数仓盲目上全 FK | 装载变慢、环依赖 | 按分层策略取舍 |
| 把可空业务键当 PK | 多 NULL 争议 | PK 必须非空且唯一 |

### 动手

对 `user_tags`（若已建）再插一行相同 `(user_id, tag)`，确认主键拒绝；再插不同 tag 应成功。
"""

JUNIOR["sql-drill-junior"] = """
### 课前

- **场景**：在统一样例库上自测初级能力。  
- **目标**：独立完成下列题目；先自写再对答案。  
- **先修**：初级清单叶子课（尤其五堂相关基础课）

### 样例输入

使用教程宪法中的 `users` / `orders` / `order_events` / `order_items`（字段以教程宪法为准）。

### 是什么

- **练习场（初级）**：单表查询、空值、聚合、简单 JOIN、分档。

### 怎么写

```sql
-- Q1 最近 5 笔 paid 订单
-- A1
SELECT order_id, user_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;

-- Q2 每用户订单数
-- A2
SELECT user_id, COUNT(*) AS cnt
FROM orders
GROUP BY user_id
ORDER BY user_id;

-- Q3 从未下单的用户
-- A3
SELECT u.user_id, u.user_name, u.city
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE o.order_id IS NULL;

-- Q4 金额缺失当 0 后按用户求和（仅 paid）
-- A4
SELECT user_id, SUM(COALESCE(amount, 0)) AS s
FROM orders
WHERE status = 'paid'
GROUP BY user_id;

-- Q5 支付用户按 GMV 分档
-- A5
SELECT
  user_id,
  SUM(COALESCE(amount, 0)) AS gmv,
  CASE
    WHEN SUM(COALESCE(amount, 0)) >= 300 THEN 'H'
    WHEN SUM(COALESCE(amount, 0)) >= 100 THEN 'M'
    ELSE 'L'
  END AS tier
FROM orders
WHERE status = 'paid'
GROUP BY user_id;
```

### 查询结果（自检要点）

| 题 | 要点 |
|---|---|
| Q3 | 应得到 Dan（user_id=4） |
| Q4 | user_id=3 的 s 为 0（amount NULL） |
| Q5 | user_id=1 为 H（350） |

### 用在哪

1. 课堂作业  2. 面试热身  3. 自学打卡

### 易错对照

| 错法 | 纠正 |
|---|---|
| 还在用旧版字段名 | 统一库字段是 `user_name` / `city` |
| Q3 用 INNER JOIN | 改 LEFT + `order_id IS NULL` |
| Q4 用 `SUM(amount)` 且忽略 NULL | 用 `COALESCE` 或接受 NULL 语义 |

### 动手

加分题：统计每个 paid 订单关联的 SKU 行数（`orders` ⋈ `order_items`），并标出发生行数放大的 `order_id`。
"""

JUNIOR_PATH = """### 课前

- **定位**：能独立完成单表查询、基础改写、简单聚合与双表 JOIN。  
- **先修**：学习路径 → **教程宪法**（必须先建统一样例库）

### 建议顺序

```text
0. 统一样例与课模板（教程宪法）
1. SELECT / NULL处理           ← 金课
2. INSERT / UPDATE·DELETE     ← 已对齐模板
3. WHERE/ORDER / GROUP BY / HAVING
4. CASE WHEN / 常用函数
5. DISTINCT / 分页LIMIT
6. INNER / LEFT
7. JOIN爆炸                   ← 金课（可先睹）
8. CREATE TABLE / 约束
9. 初级练习场验收
```

### 用在哪

1. 入职首周跑通样例库。  
2. 数据分析新人取数自助。  

### 注意啥

- 每课已按模板：课前 → 输入表 → SQL → 结果 → 易错 → 动手。  
- 做完初级练习场再进中级清单。
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

for eid, body in JUNIOR.items():
    set_content(tree, eid, body)

junior = find_node(tree, "sql-path-junior")
if junior:
    junior["content"] = JUNIOR_PATH.strip()
    print("OK sql-path-junior")

# Replace tree first (indices from original text), then refresh SQL_SAMPLE
new_json = json.dumps(tree, ensure_ascii=False, indent=2)
text = text[:start] + new_json + text[end:]

try:
    s0, s1, sample = extract_object(text, "const SQL_SAMPLE = ")
    sample["juniorAligned"] = list(JUNIOR.keys())
    text = text[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text[s1:]
    print("OK SQL_SAMPLE.juniorAligned")
except SystemExit:
    print("SKIP SQL_SAMPLE")

p.write_text(text, encoding="utf-8")

# Re-read and ensure sample update survives (tree replace used start/end from original; sample patch was on text before tree splice - good if sample is before tree)
t2 = p.read_text(encoding="utf-8")
_, _, tree2 = extract_object(t2, "const SQL_KNOWLEDGE_TREE = ")
for eid in JUNIOR:
    n = find_node(tree2, eid)
    assert n and "课前" in n["content"] and "易错对照" in n["content"], eid
    assert "动手" in n["content"], eid
drill = find_node(tree2, "sql-drill-junior")
assert "user_name" in drill["content"]
assert "u.email" not in drill["content"]
print("VALIDATED", len(JUNIOR), "junior leaves")
print("DONE", p.stat().st_size)
