# -*- coding: utf-8 -*-
"""SQL tutorial constitution + gold lessons on shared sample tables."""
from __future__ import annotations

import json
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

# ---------- Shared sample (MySQL 8+ / DuckDB friendly) ----------
SAMPLE_DDL = """-- ===== SQL 教程统一样例库（全课共用）=====
-- 引擎：MySQL 8.0+ 或 DuckDB；一次性执行即可

CREATE TABLE users (
  user_id   INT PRIMARY KEY,
  user_name VARCHAR(32) NOT NULL,
  city      VARCHAR(32),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE orders (
  order_id   INT PRIMARY KEY,
  user_id    INT NOT NULL,
  amount     DECIMAL(10,2),          -- 允许 NULL，用于练空值
  status     VARCHAR(16) NOT NULL,   -- created / paid / cancelled
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE order_events (
  event_id   INT PRIMARY KEY,
  order_id   INT NOT NULL,
  event_type VARCHAR(16) NOT NULL,  -- created / paid / refund
  event_time TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
  order_id  INT NOT NULL,
  sku_id    VARCHAR(16) NOT NULL,
  qty       INT NOT NULL,
  PRIMARY KEY (order_id, sku_id)
);"""

SAMPLE_SEED = """INSERT INTO users VALUES
  (1, 'Ada',   '上海', '2023-12-01 09:00:00'),
  (2, 'Bob',   '北京', '2023-12-05 10:00:00'),
  (3, 'Cara',  '上海', '2024-01-02 11:00:00'),
  (4, 'Dan',   NULL,  '2024-01-10 12:00:00');  -- city 缺失

INSERT INTO orders VALUES
  (101, 1, 80.00,  'paid',      '2024-01-01 10:00:00'),
  (102, 1, 120.00, 'paid',      '2024-01-02 11:00:00'),
  (103, 1, 120.00, 'paid',      '2024-01-03 09:00:00'),  -- 与 102 金额并列
  (104, 2, 50.00,  'created',   '2024-01-01 12:00:00'),
  (105, 2, 90.00,  'paid',      '2024-01-04 08:00:00'),
  (106, 3, NULL,   'paid',      '2024-01-05 14:00:00'),  -- amount 缺失
  (107, 3, 200.00, 'cancelled', '2024-01-06 16:00:00'),
  (108, 1, 30.00,  'paid',      '2024-01-07 09:30:00');

INSERT INTO order_events VALUES
  (1, 101, 'created', '2024-01-01 09:55:00'),
  (2, 101, 'paid',    '2024-01-01 10:00:00'),
  (3, 102, 'paid',    '2024-01-02 11:00:00'),
  (4, 102, 'paid',    '2024-01-02 11:00:00'),  -- 重复事件
  (5, 106, 'paid',    '2024-01-05 14:00:00'),
  (6, 107, 'created', '2024-01-06 15:00:00'),
  (7, 107, 'refund',  '2024-01-06 17:00:00');

INSERT INTO order_items VALUES
  (101, 'SKU-A', 1),
  (101, 'SKU-B', 2),   -- 一单多行 → JOIN 爆炸素材
  (102, 'SKU-A', 1),
  (105, 'SKU-C', 3),
  (106, 'SKU-A', 1);"""

CONSTITUTION = f"""### 课前 · 这是什么

本页是 SQL 教程的**唯一公约**：所有示范课、练习场共用同一套样例表；每节叶子课按同一课模板书写。先读本页，再建表灌数，再按「学习路径」上课。

### 统一样例库（必须先跑通）

**表职责**

| 表 | 粒度 | 用途 |
|---|---|---|
| `users` | 用户 | 维表、LEFT JOIN、NULL(city) |
| `orders` | 订单 | CRUD、聚合、窗口、金额 NULL |
| `order_events` | 订单事件 | 去重、EXISTS、状态流转 |
| `order_items` | 订单行 | **JOIN 爆炸**（一单多 SKU） |

```sql
{SAMPLE_DDL}

{SAMPLE_SEED}
```

**验收**

```sql
SELECT 'users' t, COUNT(*) n FROM users
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_events', COUNT(*) FROM order_events
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
-- 期望：4 / 8 / 7 / 5
```

### 金标准课模板（每节叶子必须对齐）

```text
### 课前
- 场景（一句话业务问题）
- 目标（学完能独立完成什么）
- 先修 → 下一课

### 样例输入
- 用 Markdown 表展示本课用到的行（从统一库截取，勿另造表名）

### 是什么
- ≤30 字定义 + 2～3 条直觉

### 怎么写
- 可复制完整 SQL（基于统一库）
- 关键注释说明「为什么这样写」

### 查询结果
- Markdown 结果表（与上面 SQL 一致）

### 用在哪
- ≥2 个真实场景（描述 + 为何用它）

### 易错对照
- 错写法 → 现象 → 正写法（至少 1 组）

### 动手
- 1 道小练习（不给完整答案，或只给要点）
```

### 学习主线（框架）

1. **建库**：本页样例 → 验收 COUNT  
2. **初级**：SELECT → NULL → WHERE/GROUP → CASE/函数 → INNER/LEFT → DDL  
3. **中级**：JOIN 爆炸 → 窗口（ROW_NUMBER）→ CTE/子查询 → EXPLAIN  
4. **高级**：隔离级别 → 锁/死锁 → 调优改写 → 仓模式  

示范金课（本版已精修）：**SELECT · NULL处理 · JOIN爆炸 · ROW_NUMBER · 隔离级别**。其余叶子后续按本模板批量对齐。

### 用在哪

1. **自学**：先宪法 → 五堂金课 → 初级清单。  
2. **教研**：新课 PR 必须贴「课模板」自检清单。  
3. **练习场**：题目默认假设本库已加载。

### 注意啥

- **禁止**在单课里改表名/列名（会切断练习场）。  
- 方言差异写在「注意啥」，默认 SQL 保持 MySQL 8 / DuckDB 可跑。  
- `amount`、`city` 刻意保留 NULL，不要「清洗干净再教学」。
"""

# ---------- Gold lessons ----------
GOLD = {}

GOLD["sql-select"] = """### 课前

- **场景**：运营要看「最近支付成功的订单明细」，先摸清有哪些字段。  
- **目标**：写出带过滤、排序、限流的 SELECT，并看懂结果。  
- **先修**：教程宪法（统一样例）→ **下一课**：NULL处理

### 样例输入（orders 截取）

| order_id | user_id | amount | status | created_at |
|---:|---:|---:|---|---|
| 101 | 1 | 80.00 | paid | 2024-01-01 10:00:00 |
| 102 | 1 | 120.00 | paid | 2024-01-02 11:00:00 |
| 104 | 2 | 50.00 | created | 2024-01-01 12:00:00 |
| 105 | 2 | 90.00 | paid | 2024-01-04 08:00:00 |
| 106 | 3 | NULL | paid | 2024-01-05 14:00:00 |

### 是什么

- **一句话定义**：从一张表中**投影列、过滤行、排序限流**，得到结果集。  
- **直觉**：Excel「筛选 + 选列 + 排序」，但在库内完成。  
- **固定骨架**：`SELECT … FROM … WHERE … ORDER BY … LIMIT …`

### 怎么写

```sql
-- 最近 5 笔「已支付」订单（统一样例库）
SELECT
  order_id,
  user_id,
  amount,
  created_at
FROM orders
WHERE status = 'paid'                 -- 先过滤，缩小集合
ORDER BY created_at DESC              -- 没有 ORDER BY，LIMIT 无业务意义
LIMIT 5;
```

### 查询结果

| order_id | user_id | amount | created_at |
|---:|---:|---:|---|
| 108 | 1 | 30.00 | 2024-01-07 09:30:00 |
| 106 | 3 | NULL | 2024-01-05 14:00:00 |
| 105 | 2 | 90.00 | 2024-01-04 08:00:00 |
| 103 | 1 | 120.00 | 2024-01-03 09:00:00 |
| 102 | 1 | 120.00 | 2024-01-02 11:00:00 |

（若你本地灌数与宪法一致，应得到上述 5 行；`106` 的 `amount` 为 NULL 是刻意的。）

### 用在哪

1. **明细摸底**：写复杂 SQL 前，先 SELECT 样本确认口径。  
2. **列表接口**：后台订单列表 = WHERE + ORDER + LIMIT。  
3. **为何不用 SELECT \\***：宽表拖慢网络与下游，列变更易静默出错。

### 易错对照

| 错写法 | 现象 | 正写法 |
|---|---|---|
| `SELECT * FROM orders LIMIT 5` | 列过多；缺排序则「最近」无定义 | 显式列 + `ORDER BY created_at DESC` |
| `WHERE status = paid` | 语法错（标识符当字符串） | `WHERE status = 'paid'` |
| 先 `SELECT *` 再应用层过滤 | 全表拉回，慢且危险 | 过滤下推到 `WHERE` |

### 动手

列出 `user_id = 1` 且 `status = 'paid'` 的订单，按金额降序。  
提示：`WHERE user_id = 1 AND status = 'paid' ORDER BY amount DESC`（注意 NULL 排序因引擎而异）。
"""

GOLD["sql-null"] = """### 课前

- **场景**：有人用 `WHERE amount = NULL` 查「缺金额订单」，结果永远是空。  
- **目标**：分清 NULL 与 0/空串；会用 `IS NULL` / `COALESCE` / `NULLIF`。  
- **先修**：SELECT → **下一课**：WHERE/ORDER 或 CASE WHEN

### 样例输入

**users**

| user_id | user_name | city |
|---:|---|---|
| 1 | Ada | 上海 |
| 4 | Dan | NULL |

**orders（相关行）**

| order_id | user_id | amount | status |
|---:|---:|---:|---|
| 105 | 2 | 90.00 | paid |
| 106 | 3 | NULL | paid |

### 是什么

- **一句话定义**：`NULL` 表示「未知/缺失」，**不是** 0、空串或 False。  
- **三值逻辑**：比较结果是 TRUE / FALSE / UNKNOWN；`WHERE` 只保留 TRUE。  
- **聚合**：`COUNT(col)` 忽略 NULL；`COUNT(*)` 计行；`SUM` 遇全 NULL 得 NULL。

### 怎么写

```sql
-- 1) 找出金额缺失的支付单
SELECT order_id, user_id, amount
FROM orders
WHERE status = 'paid'
  AND amount IS NULL;          -- 不能写 amount = NULL

-- 2) 汇总时把缺失当 0（报表常用）
SELECT
  user_id,
  SUM(COALESCE(amount, 0)) AS gmv_filled,
  SUM(amount)              AS gmv_raw     -- NULL 不参与求和
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY user_id;

-- 3) 空串与 NULL 归一（清洗）
SELECT
  user_id,
  user_name,
  COALESCE(NULLIF(city, ''), '未知城市') AS city_show
FROM users;
```

### 查询结果（查询 1）

| order_id | user_id | amount |
|---:|---:|---|
| 106 | 3 | NULL |

**查询 2（节选）**：user_id=3 的 `gmv_filled` 含把 NULL 当 0；`gmv_raw` 不含该行金额。

### 用在哪

1. **质检**：监控 `amount IS NULL` 比例。  
2. **LEFT JOIN**：右表无匹配即为 NULL，判存要用 `IS NULL`。  
3. **为何不用 `= NULL`**：语义永远不是 TRUE，会静默查空。

### 易错对照

| 错写法 | 现象 | 正写法 |
|---|---|---|
| `WHERE amount = NULL` | 0 行 | `amount IS NULL` |
| `WHERE user_id NOT IN (SELECT … 含 NULL)` | 意外全空 | 改 `NOT EXISTS` 或先滤 NULL |
| `SUM(amount)` 当「有缺失也当 0」 | 总和偏小 | `SUM(COALESCE(amount,0))` |

### 动手

统计「city 为空」的用户数；再列出这些用户。  
提示：`city IS NULL`（样例里 Dan）。
"""

GOLD["sql-join-explode"] = """### 课前

- **场景**：订单 GMV 对上了，但一关联 `order_items`，GMV 莫名翻倍。  
- **目标**：识别一对多导致的行数放大，并掌握「先聚合再关联」修法。  
- **先修**：INNER / LEFT → **下一课**：ROW_NUMBER（明细去重另一路）

### 样例输入

**orders**

| order_id | amount | status |
|---:|---:|---|
| 101 | 80.00 | paid |
| 102 | 120.00 | paid |

**order_items**

| order_id | sku_id | qty |
|---:|---|---:|
| 101 | SKU-A | 1 |
| 101 | SKU-B | 2 |
| 102 | SKU-A | 1 |

订单 101 有 **2 行**明细 → 与订单头 JOIN 后头表金额会被复制。

### 是什么

- **一句话定义**：一对多 JOIN 把左表一行复制成多行，导致 `SUM` 等指标被放大。  
- **直觉**：一张订单贴两张小票，把「订单金额」加了两遍。  
- **检测**：JOIN 前后对同一指标做 `COUNT(*)` / `SUM(amount)` 对比。

### 怎么写

```sql
-- A. 爆炸现场：GMV 被放大
SELECT
  SUM(o.amount) AS gmv_wrong,
  COUNT(*)      AS row_cnt
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'paid';
-- 期望若按订单头：101+102+…；实际 101 被算两次

-- B. 行数体检（养成习惯）
SELECT 'orders_paid' AS t, COUNT(*) AS n
FROM orders WHERE status = 'paid'
UNION ALL
SELECT 'after_join', COUNT(*)
FROM orders o
JOIN order_items i ON i.order_id = o.order_id
WHERE o.status = 'paid';

-- C. 修法 1：只要订单头指标 —— 不要关联明细
SELECT SUM(amount) AS gmv
FROM orders WHERE status = 'paid';

-- D. 修法 2：必须关联时，先把明细聚成「一单一行」再 JOIN
SELECT SUM(o.amount) AS gmv_ok
FROM orders o
JOIN (
  SELECT order_id, SUM(qty) AS qty_sum
  FROM order_items
  GROUP BY order_id          -- 多行收成一行
) i ON i.order_id = o.order_id
WHERE o.status = 'paid';
```

### 查询结果（示意）

| 步骤 | gmv / 行数 |
|---|---|
| 仅 orders paid 的 SUM(amount) | 正确订单头 GMV |
| JOIN items 后 SUM(o.amount) | **偏大**（101 贡献两次 80） |
| 先 GROUP BY order_id 再 JOIN | 与订单头一致 |

### 用在哪

1. **报表翻倍排查**：指标突然 ×N，先查是否一对多。  
2. **宽表拼装**：事实+维度前检查维表业务键唯一。  
3. **为何不用「DISTINCT 抹平」**：常掩盖错误粒度，优先修模型。

### 易错对照

| 错写法 | 现象 | 正写法 |
|---|---|---|
| 订单头直接 JOIN 多行明细后 SUM(头金额) | GMV 翻倍 | 指标在头表算；或明细先聚合 |
| 维表有重复 user_id | 同上 | 维表先 `GROUP BY`/`ROW_NUMBER=1` 去重 |
| 用 SELECT DISTINCT 硬去重 | 偶然「数字对了」 | 明确粒度后再聚合 |

### 动手

只对 `order_id IN (101,102)`：分别算「仅订单头 SUM」与「JOIN items 后 SUM(o.amount)」，写出两个数字并解释差从哪来。
"""

GOLD["sql-row-number"] = """### 课前

- **场景**：要「每用户支付金额最高的 1 笔订单」做召回；用 RANK 时并列会取出多行。  
- **目标**：掌握 `ROW_NUMBER` 的分区、排序、外层过滤；对比 RANK。  
- **先修**：SELECT / JOIN 爆炸 → **下一课**：RANK 或 LAG/LEAD

### 样例输入（orders 中 user_id=1 的 paid）

| order_id | user_id | amount | created_at |
|---:|---:|---:|---|
| 101 | 1 | 80.00 | 2024-01-01 10:00:00 |
| 102 | 1 | 120.00 | 2024-01-02 11:00:00 |
| 103 | 1 | 120.00 | 2024-01-03 09:00:00 |
| 108 | 1 | 30.00 | 2024-01-07 09:30:00 |

102 与 103 金额并列；要用**稳定决胜列**决定谁当 rn=1。

### 是什么

- **一句话定义**：在分区内按排序为每一行生成**唯一连续**序号（1,2,3…）。  
- **骨架**：`ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)`  
- **对比**：`RANK` 并列同名次且跳号；Top-N「只要 N 行」优先 `ROW_NUMBER`。

### 怎么写

```sql
-- 每用户支付金额 Top1（并列时取更早下单）
SELECT order_id, user_id, amount, created_at, rn
FROM (
  SELECT
    o.*,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY amount DESC, created_at ASC, order_id ASC   -- 稳定决胜
    ) AS rn
  FROM orders o
  WHERE status = 'paid'
) t
WHERE rn = 1
ORDER BY user_id;
```

**事件去重（order_events）**：同一逻辑，`PARTITION BY order_id, event_type` 或按 `event_id`，`ORDER BY event_time DESC`。

### 查询结果（节选）

| order_id | user_id | amount | rn | 说明 |
|---:|---:|---:|---:|---|
| 102 | 1 | 120.00 | 1 | 与 103 并列，因 created_at 更早胜出 |
| 105 | 2 | 90.00 | 1 | 用户 2 唯一 paid 有金额 |
| 106 | 3 | NULL | 1 | 该用户仅一笔 paid（金额缺失） |

### 用在哪

1. **Top-N 召回**：每用户/每类目取前 N。  
2. **明细去重**：保留最新事件一行。  
3. **为何不用 RANK**：`WHERE rnk<=1` 在并列时可能 >1 行。

### 易错对照

| 错写法 | 现象 | 正写法 |
|---|---|---|
| `WHERE ROW_NUMBER() OVER(...) = 1` | 语法错 | 子查询/CTE 外包一层再滤 |
| `ORDER BY` 只有 amount | 并列不稳定 | 加 `created_at, order_id` |
| 用 RANK 做严格 Top1 | 并列多行 | `ROW_NUMBER` |

### 动手

给出每用户 **Top2** 支付订单（`rn <= 2`）。思考：user_id=1 应包含 102 与 103。
"""

GOLD["sql-isolation-levels"] = """### 课前

- **场景**：报表事务里两次 `SUM` 数字不一致；或库存扣减出现超卖争议。  
- **目标**：理解四级隔离在「能看见什么」上的差别；会查看/设置会话隔离级别。  
- **先修**：BEGIN/COMMIT → **下一课**：脏读幻读 / 行锁表锁

### 样例输入

仍用统一库。本课重在**并发语义**，单会话可先练习设置与查询；完整脏读/幻读演示见下一叶「脏读幻读」。

| 概念 | 用订单库怎么直觉理解 |
|---|---|
| 读未提交 | 别人改了 106 的 amount 未提交，你也能读到 |
| 读已提交 | 只看见已提交；每次语句可能看到新提交 |
| 可重复读 | 同一事务内重复读同一快照更稳（引擎实现有别） |
| 串行化 | 接近排队执行，冲突更多 |

### 是什么

- **一句话定义**：隔离级别规定并发事务之间「可见何种中间状态」。  
- **常见四级**：READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE。  
- **默认差异**：MySQL InnoDB 常为 RR；PostgreSQL 常为 RC——跨库不要假设相同。

### 怎么写

```sql
-- 查看（MySQL 8）
SELECT @@transaction_isolation;

-- 设置当前会话后开事务
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id;
  -- … 业务逻辑 …
COMMIT;

-- PostgreSQL 查看：SHOW transaction_isolation;
-- SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### 查询结果

本课「结果」是元数据与行为，而非一张业务表：

| 检查项 | 期望 |
|---|---|
| `@@transaction_isolation` | 显示你设置后的级别 |
| 同事务两次聚合 | RC 下可能因他事务提交而变化；RR/快照下更稳定（视引擎） |

### 用在哪

1. **报表会话**：倾向快照/可重复读，避免读到一半数字跳变。  
2. **高并发订单写**：常降到 RC 减少锁冲突，并靠业务幂等。  
3. **为何要懂默认值**：同一套 SQL 在 MySQL/PG 表现可能不同。

### 易错对照

| 错认知 | 现象 | 纠正 |
|---|---|---|
| 「有事务就等于串行化」 | 仍可能不可重复读/幻读 | 查当前隔离级别 |
| 全局乱改成 SERIALIZABLE | 吞吐骤降、死锁增多 | 按场景设会话级 |
| 忽略引擎实现差异 | 教材与生产对不上 | 以官方文档+实验为准 |

### 动手

在测试库：会话 A 开事务不提交更新某行；会话 B 分别在 RC 下看是否读到。把观察记到「脏读幻读」课对照。
"""

# ---------- Patch helpers ----------

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
    print("OK gold", eid, "chars", len(n["content"]))


start, end, tree = extract_object(text, "const SQL_KNOWLEDGE_TREE = ")

for eid, body in GOLD.items():
    set_content(tree, eid, body)

# Update root content to point to constitution
tree["content"] = (
    "### SQL 知识图谱\n\n"
    "四层：**领域 → 主题 → 知识点**。\n\n"
    "1. 先打开 **学习路径 → 教程宪法**，建统一样例库\n"
    "2. 精修金课：SELECT / NULL / JOIN爆炸 / ROW_NUMBER / 隔离级别\n"
    "3. 再按初级→中级→高级清单推进\n\n"
    "交互：再点中心展开领域；倒数第二层看章节；叶子打开讲义。"
)

# Inject constitution section as first child of sql-learning-path
path = find_node(tree, "sql-learning-path")
if not path:
    raise SystemExit("sql-learning-path missing")

constitution_sec = {
    "id": "sql-constitution-sec",
    "title": "教程宪法",
    "level": "?",
    "content": "### 教程宪法 · 章节导读\n\n**必读**：统一样例表 + 金课模板 + 学习主线。点下方叶子打开全文。",
    "lessonParent": True,
    "children": [
        {
            "id": "sql-constitution",
            "title": "统一样例与课模板",
            "level": "?",
            "content": CONSTITUTION.strip(),
            "children": [],
        }
    ],
}

# Prepend if not exists
kids = path.get("children") or []
if not any(c.get("id") == "sql-constitution-sec" for c in kids):
    path["children"] = [constitution_sec] + kids
    print("OK inserted constitution section")
else:
    # refresh content
    sec = next(c for c in kids if c["id"] == "sql-constitution-sec")
    sec["children"][0]["content"] = CONSTITUTION.strip()
    print("OK refreshed constitution")

path["content"] = (
    "### 学习路径\n\n"
    "建议顺序：**教程宪法（建库）→ 五堂金课 → 初级/中级/高级清单 → 练习场**。\n"
    "全树共用 `users` / `orders` / `order_events` / `order_items`。"
)

# Update junior path to mention constitution first
junior = find_node(tree, "sql-path-junior")
if junior:
    junior["content"] = """### 课前

- **定位**：能独立完成单表查询、基础改写与简单聚合。  
- **先修**：学习路径 → **教程宪法**（必须先建统一样例库）

### 建议顺序

```text
0. 统一样例与课模板（教程宪法）
1. SELECT          ← 金课
2. NULL处理        ← 金课
3. INSERT / UPDATE·DELETE
4. WHERE/ORDER / GROUP BY / HAVING
5. CASE WHEN / 常用函数
6. DISTINCT / 分页LIMIT
7. INNER / LEFT
8. JOIN爆炸        ← 金课（中级关卡，可先睹）
9. CREATE TABLE / 约束
```

### 用在哪

1. 入职首周跑通样例库。  
2. 数据分析新人取数自助。  

### 注意啥

- 每课按「课模板」：输入表 → SQL → 结果表 → 易错。  
- 金课精修过的优先精读，其余叶子逐步对齐模板。
"""
    print("OK junior path")

new_json = json.dumps(tree, ensure_ascii=False, indent=2)
# Keep indentation style - tree currently starts with weird indent; dump is fine
text = text[:start] + new_json + text[end:]

# Inject SQL_SAMPLE constant before SQL_KNOWLEDGE_TREE for reuse / documentation in JS
sample_js = {
    "ddl": SAMPLE_DDL,
    "seed": SAMPLE_SEED,
    "tables": ["users", "orders", "order_events", "order_items"],
    "goldLessons": ["sql-select", "sql-null", "sql-join-explode", "sql-row-number", "sql-isolation-levels"],
}
sample_block = (
    "\n    const SQL_SAMPLE = "
    + json.dumps(sample_js, ensure_ascii=False, indent=2)
    + ";\n\n    "
)

marker = "const SQL_KNOWLEDGE_TREE = "
if "const SQL_SAMPLE = " not in text:
    text = text.replace(marker, sample_block + marker, 1)
    print("OK SQL_SAMPLE constant")
else:
    # refresh SQL_SAMPLE object
    s0, s1, _ = extract_object(text, "const SQL_SAMPLE = ")
    text = text[:s0] + json.dumps(sample_js, ensure_ascii=False, indent=2) + text[s1:]
    print("OK refreshed SQL_SAMPLE")

# Wire home hot to include constitution / gold entry
old_hot = """      const entries = [
        { id: "sql-select", label: "SELECT 查询" },
        { id: "sql-join", label: "JOIN 关联" },
        { id: "sql-window", label: "窗口函数" },
        { id: "sql-group-by", label: "GROUP BY" },
        { id: "sql-index-intro", label: "索引入门" }
      ];"""
new_hot = """      const entries = [
        { id: "sql-constitution", label: "教程宪法" },
        { id: "sql-select", label: "SELECT·金课" },
        { id: "sql-null", label: "NULL·金课" },
        { id: "sql-join-explode", label: "JOIN爆炸·金课" },
        { id: "sql-row-number", label: "ROW_NUMBER·金课" }
      ];"""
if old_hot in text:
    text = text.replace(old_hot, new_hot, 1)
    print("OK home hot entries")

p.write_text(text, encoding="utf-8")

# Validate
t2 = p.read_text(encoding="utf-8")
assert "const SQL_SAMPLE" in t2
assert "sql-constitution" in t2
assert "order_items" in t2
for eid in GOLD:
    assert eid in t2
# ensure gold content markers
assert "易错对照" in t2 and "课前" in t2 and "查询结果" in t2
_, _, tree2 = extract_object(t2, "const SQL_KNOWLEDGE_TREE = ")
for eid in GOLD:
    n = find_node(tree2, eid)
    assert n and "易错对照" in n["content"] and len(n["content"]) > 800, eid
c = find_node(tree2, "sql-constitution")
assert c and "统一样例库" in c["content"]
print("VALIDATED constitution chars", len(c["content"]))
print("DONE", p.stat().st_size)
