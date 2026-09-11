const t={
  "id": "sql-root",
  "title": "SQL",
  "level": "?",
  "content": "### SQL 知识图谱\n\n四层结构：**领域 → 主题 → 知识点**。\n\n- 再点中心展开领域扇区\n- 点主题层层下钻（弧线一对多）\n- **倒数第二层**打开章节导读 + 子课列表\n- **叶节点**打开完整讲义（是什么 / 怎么写 / 用在哪 / 注意啥）",
  "children": [
    {
      "id": "sql-dml-query",
      "title": "DML & 查询",
      "level": "?",
      "content": "### DML & 查询\n\n读写与查询表达：**CRUD → 过滤聚合**。先点主题展开，再学叶节点讲义。",
      "children": [
        {
          "id": "sql-crud",
          "title": "CRUD基础",
          "level": "??",
          "content": "### CRUD 基础 · 章节导读\n\n**学习目标**：能独立完成增删改查，并养成生产安全习惯。\n\n**先修**：表与列的基本概念。\n\n点下方绿色叶节点进入各讲义。",
          "children": [
            {
              "id": "sql-select",
              "title": "SELECT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：从一张或多张表中投影列、过滤行，得到结果集。\n- **核心要素**：`SELECT` 列清单、`FROM` 数据源、可选 `WHERE`/`JOIN`/`GROUP BY`。\n\n### 怎么写\n\n```sql\nSELECT user_id, amount, created_at\nFROM orders\nWHERE status = 'paid'\nORDER BY created_at DESC\nLIMIT 100;\n```\n\n### 用在哪\n\n1. **明细抽样**：先看样本再写复杂逻辑。\n2. **报表取数**：固定口径字段列表。\n3. **下游 ETL**：作为中间结果写入临时表。\n\n### 注意啥\n\n- 避免 `SELECT *` 上线到宽表。\n- `LIMIT` 不保证全局顺序，需配合 `ORDER BY`。\n- 大表先过滤再投影，减少 IO。",
              "children": []
            },
            {
              "id": "sql-insert",
              "title": "INSERT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：向表追加一行或多行数据。\n- **常见形态**：单行 VALUES、批量 VALUES、`INSERT … SELECT`。\n\n### 怎么写\n\n```sql\nINSERT INTO orders (order_id, user_id, amount, status)\nVALUES (1001, 42, 99.00, 'created');\n\n-- 批量 / 从查询插入\nINSERT INTO orders_archive\nSELECT * FROM orders WHERE created_at < '2024-01-01';\n```\n\n### 用在哪\n\n1. **补数回填**：历史分区补录。\n2. **结果落地**：把清洗后的结果写入目标表。\n3. **测试造数**：临时表灌入样例。\n\n### 注意啥\n\n- 显式写列名，避免表结构变更导致错位。\n- 注意主键/唯一约束冲突与事务回滚。\n- 大批量插入关注锁与日志膨胀。",
              "children": []
            },
            {
              "id": "sql-update-delete",
              "title": "UPDATE/DELETE",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按条件修改或删除已有行。\n- **风险点**：漏写 `WHERE` 会改/删全表。\n\n### 怎么写\n\n```sql\n-- 先 SELECT 确认影响行\nSELECT COUNT(*) FROM orders WHERE status = 'pending' AND created_at < CURRENT_DATE - INTERVAL 30 DAY;\n\nUPDATE orders\nSET status = 'cancelled'\nWHERE status = 'pending' AND created_at < CURRENT_DATE - INTERVAL 30 DAY;\n\nDELETE FROM sessions WHERE expired_at < NOW();\n```\n\n### 用在哪\n\n1. **状态机流转**：订单取消、会话过期。\n2. **纠错**：修脏数据或回填字段。\n3. **合规清理**：到期删除个人数据。\n\n### 注意啥\n\n- 生产更新前先 `SELECT` 同一条件。\n- 大范围更新分批 + 事务，避免长锁。\n- 优先软删除（状态位）若业务需要可追溯。",
              "children": []
            },
            {
              "id": "sql-upsert",
              "title": "UPSERT",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：插入或在冲突时更新（幂等写入）。\n- **方言**：MySQL `ON DUPLICATE KEY UPDATE`；PG/DuckDB `ON CONFLICT`。\n\n### 怎么写\n\n```sql\n-- MySQL 8+\nINSERT INTO users (user_id, email, updated_at)\nVALUES (42, 'a@x.com', NOW())\nON DUPLICATE KEY UPDATE\n  email = VALUES(email),\n  updated_at = NOW();\n\n-- PostgreSQL / DuckDB 风格\nINSERT INTO users (user_id, email, updated_at)\nVALUES (42, 'a@x.com', CURRENT_TIMESTAMP)\nON CONFLICT (user_id) DO UPDATE\nSET email = EXCLUDED.email,\n    updated_at = CURRENT_TIMESTAMP;\n```\n\n### 用在哪\n\n1. **维表同步**：上游重复推送同一主键。\n2. **配置覆盖**：按自然键幂等写入。\n3. **计数累加**：冲突时 `cnt = cnt + 1`。\n\n### 注意啥\n\n- 必须有主键或唯一索引，否则冲突检测无效。\n- 分清「覆盖」与「忽略」（`DO NOTHING`）。\n- 高并发下注意死锁与更新列集合最小化。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-filter-agg",
          "title": "过滤与聚合",
          "level": "??",
          "content": "### 过滤与聚合 · 章节导读\n\n**学习目标**：用 WHERE/ORDER/GROUP BY 把明细收成指标。\n\n**先修**：SELECT 基础。",
          "children": [
            {
              "id": "sql-where-order",
              "title": "WHERE/ORDER",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：`WHERE` 过滤行，`ORDER BY` 决定结果顺序。\n- **执行直觉**：多数引擎先过滤再排序（视计划而定）。\n\n### 怎么写\n\n```sql\nSELECT user_id, SUM(amount) AS gmv\nFROM orders\nWHERE status = 'paid'\n  AND created_at >= '2024-01-01'\nGROUP BY user_id\nORDER BY gmv DESC;\n```\n\n### 用在哪\n\n1. **看板筛选**：时间窗 + 状态。\n2. **排行榜**：按指标降序。\n3. **抽样质检**：按时间倒序看最新。\n\n### 注意啥\n\n- 对过滤列建合适索引；避免对列套函数导致无法用索引。\n- `ORDER BY` 无索引时可能 filesort。\n- `NULL` 排序行为因引擎而异，需显式处理。",
              "children": []
            },
            {
              "id": "sql-group-by",
              "title": "GROUP BY",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按键折叠行，并对组内做聚合（`COUNT`/`SUM`/`AVG` 等）。\n- **与窗口区别**：`GROUP BY` 合并行；窗口保留明细。\n\n### 怎么写\n\n```sql\nSELECT\n  DATE(created_at) AS dt,\n  COUNT(*) AS orders,\n  SUM(amount) AS gmv\nFROM orders\nWHERE status = 'paid'\nGROUP BY DATE(created_at)\nHAVING SUM(amount) > 1000\nORDER BY dt;\n```\n\n### 用在哪\n\n1. **日报指标**：按日 GMV / 订单数。\n2. **用户汇总**：每用户消费次数。\n3. **漏斗粗算**：按步骤计数。\n\n### 注意啥\n\n- `SELECT` 非聚合列必须在 `GROUP BY`（严格模式）。\n- `HAVING` 过滤聚合结果；行过滤用 `WHERE`。\n- 高基数 `GROUP BY` 注意内存与倾斜。",
              "children": []
            },
            {
              "id": "sql-having",
              "title": "HAVING",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：对 `GROUP BY` 之后的聚合结果再过滤；`WHERE` 过滤行，`HAVING` 过滤组。\n- **记忆**：先分组聚合，再用 HAVING 卡阈值/阈值。\n\n### 怎么写\n\n```sql\nSELECT\n  user_id,\n  COUNT(*) AS order_cnt,\n  SUM(amount) AS gmv\nFROM orders\nWHERE status = 'paid'          -- 行级过滤\nGROUP BY user_id\nHAVING SUM(amount) >= 1000     -- 组级过滤\n   AND COUNT(*) >= 3\nORDER BY gmv DESC;\n```\n\n### 用在哪\n\n1. **高价值用户**：GMV/频次门槛。\n2. **异常组**：某类目订单数暴增。\n3. **质量门禁**：分组后校验完整性。\n\n### 注意啥\n\n- 能在 `WHERE` 做的过滤不要拖到 `HAVING`（更早裁剪更省）。\n- `HAVING` 可引用聚合或分组列；别引擎对别名支持不一。\n- 窗口函数结果过滤通常放外层 `WHERE`，不是 HAVING。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-expr-null",
          "title": "表达式与空值",
          "level": "??",
          "content": "### 表达式与空值 · 章节导读\n\n**学习目标**：正确处理 NULL、分支与常用函数。\n\n**先修**：SELECT / WHERE。\n\n点下方叶节点进入讲义。",
          "children": [
            {
              "id": "sql-null",
              "title": "NULL处理",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：`NULL` 表示「未知/缺失」，不是 0、空串或 False。\n- **要点**：与 `NULL` 的比较要用 `IS NULL` / `IS NOT NULL`，三值逻辑会影响 `WHERE`/`JOIN`。\n\n### 怎么写\n\n```sql\n-- 样例：补全金额缺失、过滤未知状态\nSELECT\n  order_id,\n  user_id,\n  COALESCE(amount, 0) AS amount_filled,\n  NULLIF(status, '') AS status_clean,\n  IFNULL(note, '无备注') AS note_cn   -- MySQL\nFROM orders\nWHERE amount IS NULL\n   OR status IS NOT NULL;\n```\n\n### 用在哪\n\n1. **脏数据清洗**：缺失金额用默认值。\n2. **外连接结果**：右表无匹配时列为 NULL。\n3. **可选字段**：备注、扩展属性未填。\n\n### 注意啥\n\n- `WHERE col = NULL` 永远不是 TRUE，要用 `IS NULL`。\n- `NOT IN (…含 NULL…)` 结果常为未知，慎用。\n- 聚合时 `COUNT(col)` 忽略 NULL，`COUNT(*)` 计行。",
              "children": []
            },
            {
              "id": "sql-case",
              "title": "CASE WHEN",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按条件分支返回值，相当于 SQL 里的 if-else。\n- **两种写法**：简单 CASE（等值）与搜索 CASE（任意条件）。\n\n### 怎么写\n\n```sql\nSELECT\n  order_id,\n  amount,\n  CASE\n    WHEN amount >= 500 THEN 'VIP'\n    WHEN amount >= 100 THEN 'NORMAL'\n    ELSE 'LOW'\n  END AS tier,\n  CASE status\n    WHEN 'paid' THEN 1\n    WHEN 'refunded' THEN -1\n    ELSE 0\n  END AS status_flag\nFROM orders;\n```\n\n### 用在哪\n\n1. **分档打标**：用户层级、订单区间。\n2. **宽表透视**：把行值映射成多列指标。\n3. **兼容映射**：状态码转可读标签。\n\n### 注意啥\n\n- 条件按书写顺序匹配，先写更具体的分支。\n- `ELSE` 省略时未匹配返回 NULL。\n- 复杂逻辑可拆 CTE，避免嵌套 CASE 难读。",
              "children": []
            },
            {
              "id": "sql-functions",
              "title": "常用函数",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：内置标量/聚合函数做类型转换、字符串、日期与数值计算。\n- **原则**：优先引擎内置函数，注意方言差异。\n\n### 怎么写\n\n```sql\nSELECT\n  order_id,\n  UPPER(TRIM(status)) AS status_norm,\n  ROUND(amount, 2) AS amount_2,\n  DATE_FORMAT(created_at, '%Y-%m-%d') AS dt,          -- MySQL\n  CAST(user_id AS CHAR) AS user_id_str,\n  CONCAT('U', user_id) AS user_code\nFROM orders\nWHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY);\n```\n\n### 用在哪\n\n1. **清洗**：去空格、统一大小写。\n2. **报表**：日期截断、金额四舍五入。\n3. **对接**：类型转换喂给下游系统。\n\n### 注意啥\n\n- 函数包列会导致索引难用（见「索引失效」）。\n- MySQL / PG / DuckDB 日期函数名不同，写可移植 SQL 时封装。\n- 聚合函数与窗口函数语义不同，勿混用。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-set-page",
          "title": "集合与分页",
          "level": "??",
          "content": "### 集合与分页 · 章节导读\n\n**学习目标**：去重、纵向合并与稳定分页。\n\n**先修**：SELECT / ORDER BY。",
          "children": [
            {
              "id": "sql-distinct",
              "title": "DISTINCT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：去掉结果集中的重复行（或按指定列去重投影）。\n- **对比**：业务「最新一条」去重更常用窗口 `ROW_NUMBER`。\n\n### 怎么写\n\n```sql\n-- 去重用户（有过支付）\nSELECT DISTINCT user_id\nFROM orders\nWHERE status = 'paid';\n\n-- 多列组合去重\nSELECT DISTINCT user_id, DATE(created_at) AS dt\nFROM orders;\n```\n\n### 用在哪\n\n1. **维表去重**：源系统重复维度键。\n2. **快速探查**：有哪些取值。\n3. **集合运算前**：先压扁再 UNION。\n\n### 注意啥\n\n- `DISTINCT` + 大宽表很贵，先缩小列与过滤。\n- 与 `GROUP BY` 可互换场景下，聚合意图更清晰时用 GROUP BY。\n- 「每组留一行」用窗口函数，不要滥用 DISTINCT。",
              "children": []
            },
            {
              "id": "sql-union",
              "title": "UNION系",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：纵向合并多个查询结果；`UNION` 去重，`UNION ALL` 保留全部。\n- **要求**：列数、类型兼容，列名以第一段为准。\n\n### 怎么写\n\n```sql\n-- 合并正式单与历史归档（保留重复用 ALL）\nSELECT order_id, user_id, amount, 'live' AS src\nFROM orders\nWHERE status = 'paid'\nUNION ALL\nSELECT order_id, user_id, amount, 'archive' AS src\nFROM orders_archive\nWHERE status = 'paid';\n\n-- 需要唯一集合时用 UNION（隐式去重，更慢）\nSELECT user_id FROM orders\nUNION\nSELECT user_id FROM users WHERE is_staff = 1;\n```\n\n### 用在哪\n\n1. **多源汇总**：直播表 + 归档表。\n2. **白名单合并**：多规则命中用户并集。\n3. **对照集**：A/B 两组样本拼接。\n\n### 注意啥\n\n- 默认优先 `UNION ALL`，确认需要去重再用 `UNION`。\n- 各段 `ORDER BY` 无效于整体，整体排序放最外层。\n- 列对齐失败是常见报错，用 `NULL`/`CAST` 补齐。",
              "children": []
            },
            {
              "id": "sql-limit-page",
              "title": "分页LIMIT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：用 `LIMIT`/`OFFSET`（或键集分页）截取结果页。\n- **要点**：无 `ORDER BY` 的分页不稳定。\n\n### 怎么写\n\n```sql\n-- 偏移分页（简单但深分页慢）\nSELECT order_id, user_id, amount, created_at\nFROM orders\nWHERE status = 'paid'\nORDER BY created_at DESC, order_id DESC\nLIMIT 20 OFFSET 40;   -- 第 3 页，每页 20\n\n-- 键集分页（推荐深翻页）\nSELECT order_id, user_id, amount, created_at\nFROM orders\nWHERE status = 'paid'\n  AND (created_at, order_id) < ('2024-06-01 12:00:00', 9000)\nORDER BY created_at DESC, order_id DESC\nLIMIT 20;\n```\n\n### 用在哪\n\n1. **列表接口**：订单/消息分页。\n2. **批处理**：按页扫描大表。\n3. **导出预览**：先看前 N 行。\n\n### 注意啥\n\n- 深 `OFFSET` 会扫描并丢弃大量行，改用键集。\n- 排序键建议唯一，避免同值页抖动。\n- MySQL 8 / DuckDB 均支持 `LIMIT/OFFSET`；PG 还可用 `FETCH`。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-ddl",
      "title": "DDL 与对象",
      "level": "?",
      "content": "### DDL 与对象\n\n表、约束、视图与索引——库内对象骨架。",
      "children": [
        {
          "id": "sql-table-constraint",
          "title": "表与约束",
          "level": "??",
          "content": "### 表与约束 · 章节导读\n\n**学习目标**：用 DDL 定义结构与完整性约束。\n\n**先修**：CRUD 读写。",
          "children": [
            {
              "id": "sql-create-table",
              "title": "CREATE TABLE",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：声明表名、列类型、默认值与约束。\n- **目标**：让数据「有形状」，下游可依赖。\n\n### 怎么写\n\n```sql\nCREATE TABLE users (\n  user_id    BIGINT PRIMARY KEY,\n  email      VARCHAR(255) NOT NULL UNIQUE,\n  status     VARCHAR(16) NOT NULL DEFAULT 'active',\n  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n);\n```\n\n### 用在哪\n\n1. **建主题表**：用户/订单落库。\n2. **临时建模**：分析沙箱建表验证。\n3. **分区表**：大表按日/月分区（引擎相关）。\n\n### 注意啥\n\n- 选对类型与长度，避免隐式转换。\n- 主键与业务键策略要想清（代理键 vs 自然键）。\n- 变更用迁移脚本，禁止线上裸改。",
              "children": []
            },
            {
              "id": "sql-constraints",
              "title": "主键/外键/唯一",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：约束保证完整性——主键唯一非空、外键引用合法、唯一防重复。\n- **实务**：数仓常弱化外键，用质量校验代替。\n\n### 怎么写\n\n```sql\nALTER TABLE orders\n  ADD CONSTRAINT pk_orders PRIMARY KEY (order_id),\n  ADD CONSTRAINT uq_orders_biz UNIQUE (biz_no),\n  ADD CONSTRAINT fk_orders_user\n    FOREIGN KEY (user_id) REFERENCES users(user_id);\n```\n\n### 用在哪\n\n1. **防脏写**：业务库保证引用完整。\n2. **去重口径**：唯一约束兜底。\n3. **建模评审**：约束即文档。\n\n### 注意啥\n\n- OLAP/数仓批量装载时外键可能拖慢，需权衡。\n- 软删除与外键并存时注意「逻辑删除行仍被引用」。\n- 约束名要可读，方便报错定位。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-view-index-skel",
          "title": "视图与索引骨架",
          "level": "??",
          "content": "### 视图与索引骨架 · 章节导读\n\n**学习目标**：理解逻辑封装与物理加速入口。",
          "children": [
            {
              "id": "sql-view",
              "title": "VIEW",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：把查询存成虚拟表，简化复用与权限隔离。\n- **形态**：普通视图 / 物化视图（引擎相关）。\n\n### 怎么写\n\n```sql\nCREATE VIEW v_paid_orders AS\nSELECT order_id, user_id, amount, created_at\nFROM orders\nWHERE status = 'paid';\n\nSELECT * FROM v_paid_orders WHERE created_at >= CURRENT_DATE;\n```\n\n### 用在哪\n\n1. **口径封装**：统一「已支付订单」定义。\n2. **权限**：只授视图不授基表。\n3. **复杂 SQL 分层**：下层视图拼装。\n\n### 注意啥\n\n- 视图嵌套过深难优化，注意下推。\n- 普通视图不存数据，基表变更即可见。\n- 物化视图要关心刷新策略与延迟。",
              "children": []
            },
            {
              "id": "sql-index-intro",
              "title": "INDEX 入门",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：索引是辅助结构，用空间换查找/排序时间。\n- **常见**：B-Tree 适合等值与范围；注意最左前缀。\n\n### 怎么写\n\n```sql\nCREATE INDEX idx_orders_user_time\nON orders (user_id, created_at);\n\n-- 覆盖查询示例（视引擎）\nSELECT order_id, amount\nFROM orders\nWHERE user_id = 42\n  AND created_at >= '2024-01-01';\n```\n\n### 用在哪\n\n1. **点查加速**：按用户取订单。\n2. **关联键**：JOIN 列建索引。\n3. **排序优化**：匹配 `ORDER BY`。\n\n### 注意啥\n\n- 索引不是越多越好：拖慢写入、占空间。\n- 低选择性列（如性别）单独索引收益低。\n- 先看 `EXPLAIN`，再决定加不加。",
              "children": []
            },
            {
              "id": "sql-matview",
              "title": "物化视图",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：物化视图把查询结果持久化存储，查询读快照而非每次重算（视引擎）。\n- **对比**：普通 VIEW 只是保存 SQL 定义。\n\n### 怎么写\n\n```sql\n-- PostgreSQL 示例\nCREATE MATERIALIZED VIEW mv_user_gmv AS\nSELECT user_id, SUM(amount) AS gmv, COUNT(*) AS cnt\nFROM orders\nWHERE status = 'paid'\nGROUP BY user_id;\n\nREFRESH MATERIALIZED VIEW mv_user_gmv;\n\nSELECT * FROM mv_user_gmv WHERE gmv >= 1000;\n\n-- DuckDB 可用 CREATE TABLE AS 模拟物化\nCREATE TABLE mv_user_gmv AS\nSELECT user_id, SUM(amount) AS gmv\nFROM orders WHERE status = 'paid'\nGROUP BY user_id;\n```\n\n### 用在哪\n\n1. **重报表加速**：复杂聚合结果复用。\n2. **数仓层**：轻度汇总表。\n3. **只读副本对外**：稳定接口。\n\n### 注意啥\n\n- MySQL 无原生物化视图，常用汇总表 + 调度刷新。\n- 刷新策略（全量/增量）决定数据新鲜度。\n- 注意存储与源表一致性窗口。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-type-alter",
          "title": "类型与变更",
          "level": "??",
          "content": "### 类型与变更 · 章节导读\n\n**学习目标**：选对类型，安全变更表结构。\n\n**先修**：CREATE TABLE。",
          "children": [
            {
              "id": "sql-datatypes",
              "title": "数据类型",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：列的存储类型决定精度、范围与运算符行为。\n- **常用**：整数、小数、字符串、时间、布尔/枚举。\n\n### 怎么写\n\n```sql\nCREATE TABLE orders (\n  order_id    BIGINT PRIMARY KEY,\n  user_id     BIGINT NOT NULL,\n  amount      DECIMAL(12,2) NOT NULL,\n  status      VARCHAR(32) NOT NULL,\n  created_at  TIMESTAMP NOT NULL,\n  meta_json   JSON                  -- MySQL 8 / 部分仓支持\n);\n\n-- 探查类型（MySQL）\n-- SHOW COLUMNS FROM orders;\n```\n\n### 用在哪\n\n1. **建表选型**：金额用 DECIMAL 而非 FLOAT。\n2. **对接契约**：与上游字段对齐。\n3. **存储治理**：过长 VARCHAR 浪费与截断风险。\n\n### 注意啥\n\n- 浮点勿存钱；时间注意时区。\n- 隐式转换会导致索引失效或精度丢失。\n- 仓引擎类型名可能不同（STRING/VARCHAR）。",
              "children": []
            },
            {
              "id": "sql-alter",
              "title": "ALTER TABLE",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：在不重建整表业务的前提下变更表结构（列、索引、约束）。\n- **风险**：大表 DDL 可能锁表或长时间复制。\n\n### 怎么写\n\n```sql\nALTER TABLE orders\n  ADD COLUMN pay_channel VARCHAR(16) NULL,\n  MODIFY COLUMN amount DECIMAL(14,2) NOT NULL;   -- MySQL\n\nALTER TABLE orders\n  ADD INDEX idx_orders_user_time (user_id, created_at);\n\n-- 谨慎删除\n-- ALTER TABLE orders DROP COLUMN obsolete_flag;\n```\n\n### 用在哪\n\n1. **迭代加字段**：新业务属性。\n2. **补索引**：上线后按慢查询加。\n3. **约束加固**：补 NOT NULL / 唯一键。\n\n### 注意啥\n\n- 生产 DDL 选低峰，关注锁与复制延迟。\n- 先加可空列再回填，再改 NOT NULL。\n- 与「在线 DDL / gh-ost」等工具策略配合。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-join",
      "title": "JOIN 关联",
      "level": "?",
      "content": "### JOIN 关联\n\n多表拼装是分析与建模日常；先懂语义，再防爆炸。",
      "children": [
        {
          "id": "sql-join-types",
          "title": "连接类型",
          "level": "??",
          "content": "### 连接类型 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-inner-join",
              "title": "INNER",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：只保留两表匹配成功的行。\n- **结果行数**：≤ 两边匹配组合数。\n\n### 怎么写\n\n```sql\nSELECT o.order_id, u.email, o.amount\nFROM orders o\nINNER JOIN users u ON u.user_id = o.user_id\nWHERE o.status = 'paid';\n```\n\n### 用在哪\n\n1. **事实+维度**：订单拼用户属性。\n2. **必须两边都有**：缺维就丢掉。\n3. **质量排查**：对比 INNER vs LEFT 行数差。\n\n### 注意啥\n\n- 关联键类型不一致会导致隐式转换、索引失效。\n- 一对多会放大行数，先想清粒度。\n- `ON` 写错成恒真条件会笛卡尔积。",
              "children": []
            },
            {
              "id": "sql-left-join",
              "title": "LEFT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：保留左表全部行，右表无匹配则填 NULL。\n- **典型用途**：主表完整，维表可缺。\n\n### 怎么写\n\n```sql\nSELECT u.user_id, u.email, o.order_id\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.user_id\nWHERE o.order_id IS NULL;  -- 无订单用户\n```\n\n### 用在哪\n\n1. **主数据完整清单**：用户列表+是否下单。\n2. **反连接**：找「没有」的一侧。\n3. **宽表拼装**：事实保留，维可空。\n\n### 注意啥\n\n- 过滤右表列时，条件放 `ON` 还是 `WHERE` 语义不同。\n- `WHERE right.key IS NULL` 才是反连接写法。\n- 多段 LEFT JOIN 链式放大，注意粒度。",
              "children": []
            },
            {
              "id": "sql-self-join",
              "title": "SELF JOIN",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：同一张表别名两次，关联比较行与行（层级、配对、前后）。\n- **本质**：普通 JOIN，只是左右都来自同一表。\n\n### 怎么写\n\n```sql\n-- 同一用户的「上一单」配对（简化示例）\nSELECT\n  a.order_id AS curr_id,\n  b.order_id AS prev_id,\n  a.user_id,\n  a.created_at AS curr_at,\n  b.created_at AS prev_at\nFROM orders a\nJOIN orders b\n  ON a.user_id = b.user_id\n AND b.created_at < a.created_at\nWHERE a.status = 'paid';\n-- 生产更推荐窗口 LAG；SELF JOIN 适合教学与特定配对\n```\n\n### 用在哪\n\n1. **组织树**：员工-经理（邻接表）。\n2. **配对比较**：同实体两版本。\n3. **教学**：理解别名与笛卡尔风险。\n\n### 注意啥\n\n- 易产生行爆炸，必须写紧连接条件。\n- 多数「上一行」场景优先窗口函数。\n- 别名务必清晰（`emp`/`mgr`）。",
              "children": []
            },
            {
              "id": "sql-cross-join",
              "title": "CROSS JOIN",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：笛卡尔积，左表每行配右表每行；无 ON 条件。\n- **用途**：生成日期骨架、维表组合，而非随意连大表。\n\n### 怎么写\n\n```sql\n-- 用户 × 日期骨架（示意：用小维表）\nWITH days AS (\n  SELECT DATE('2024-01-01') AS dt\n  UNION ALL SELECT DATE('2024-01-02')\n  UNION ALL SELECT DATE('2024-01-03')\n)\nSELECT u.user_id, d.dt\nFROM users u\nCROSS JOIN days d\nWHERE u.user_id IN (1, 2);\n```\n\n### 用在哪\n\n1. **补全日历**：活跃用户每日一行。\n2. **参数网格**：实验配置笛卡尔。\n3. **小维表展开**：币种 × 渠道。\n\n### 注意啥\n\n- 大表 CROSS JOIN 会爆炸，必须限制两侧基数。\n- 有意为之再写；误写成隐式逗号连接很危险。\n- 补零场景常再 `LEFT JOIN` 事实表。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-join-traps",
          "title": "关联陷阱",
          "level": "??",
          "content": "### 关联陷阱 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-join-explode",
              "title": "JOIN爆炸",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：一对多/多对多 JOIN 使行数成倍放大，聚合被重复计算。\n- **识别**：JOIN 后 `COUNT(*)` 远大于主表。\n\n### 怎么写\n\n```sql\n-- 危险：用户×订单明细再 SUM，GMV 被放大\n-- 正确：先按用户聚合订单，再 JOIN 用户维\nWITH order_agg AS (\n  SELECT user_id, SUM(amount) AS gmv\n  FROM orders\n  WHERE status = 'paid'\n  GROUP BY user_id\n)\nSELECT u.user_id, u.email, COALESCE(a.gmv, 0) AS gmv\nFROM users u\nLEFT JOIN order_agg a ON a.user_id = u.user_id;\n```\n\n### 用在哪\n\n1. **指标复核**：JOIN 前后行数对比。\n2. **宽表建设**：先聚合到目标粒度。\n3. **面试高频**：解释为什么 GMV 翻倍。\n\n### 注意啥\n\n- 维表业务键必须唯一，否则当多对多。\n- 一对多：先 `GROUP BY` 再 JOIN。\n- 用 `COUNT(*)` / 抽样核对关联前后。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-semi-join",
          "title": "半开连接",
          "level": "??",
          "content": "### 半开连接 · 章节导读\n\n**学习目标**：用 EXISTS / IN 做半连接与反半连接。\n\n**先修**：INNER / LEFT。",
          "children": [
            {
              "id": "sql-exists",
              "title": "EXISTS",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：半连接——主查询行在子查询中「存在」匹配即保留，不展开右表列。\n- **特点**：找到一条即可短路，适合「是否有过…」。\n\n### 怎么写\n\n```sql\nSELECT u.user_id, u.email\nFROM users u\nWHERE EXISTS (\n  SELECT 1\n  FROM orders o\n  WHERE o.user_id = u.user_id\n    AND o.status = 'paid'\n    AND o.amount >= 100\n);\n```\n\n### 用在哪\n\n1. **过滤父集**：有过支付的用户。\n2. **权限/标记**：是否存在违规事件。\n3. **替代 IN**：大结果集时更稳。\n\n### 注意啥\n\n- `SELECT 1` 即可，不必 `SELECT *`。\n- 相关列要能走索引（`orders.user_id`）。\n- `NOT EXISTS` 通常比 `NOT IN` 更安全（NULL）。",
              "children": []
            },
            {
              "id": "sql-in-notin",
              "title": "IN与NOT IN",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：`IN` 判断值是否落在列表/子查询集合；`NOT IN` 排除集合。\n- **陷阱**：子查询含 NULL 时 `NOT IN` 逻辑易全空。\n\n### 怎么写\n\n```sql\n-- IN 列表\nSELECT * FROM orders\nWHERE status IN ('paid', 'shipped');\n\n-- IN 子查询\nSELECT * FROM users\nWHERE user_id IN (\n  SELECT user_id FROM orders WHERE amount >= 500\n);\n\n-- 更推荐 NOT EXISTS 表达「从未支付」\nSELECT u.*\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.user_id AND o.status = 'paid'\n);\n```\n\n### 用在哪\n\n1. **枚举过滤**：状态白名单。\n2. **集合成员**：落在高价值用户集。\n3. **反选**：不在黑名单（小心 NULL）。\n\n### 注意啥\n\n- 列表很长时改临时表/`JOIN`。\n- `NOT IN` + NULL → 意外空结果。\n- 与半连接（EXISTS）语义接近但优化器路径不同。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-window",
      "title": "窗口函数",
      "level": "?",
      "content": "### 窗口函数\n\n不折叠行的排序与累计分析。",
      "children": [
        {
          "id": "sql-window-rank",
          "title": "排名类",
          "level": "??",
          "content": "### 排名类窗口\n\nROW_NUMBER / RANK / DENSE_RANK。",
          "children": [
            {
              "id": "sql-row-number",
              "title": "ROW_NUMBER",
              "level": "??",
              "content": "### ?? 是什么\n\n- **一句话定义**：按排序为分区内每一行生成唯一连续序号。\n- **核心语法结构图**：\n\n```sql\nROW_NUMBER() OVER (\n  [PARTITION BY 分组列...]\n  ORDER BY 排序列 [ASC|DESC]...\n)\n```\n\n### ?? 怎么写\n\n可复制模板（MySQL 8.0+ / DuckDB 均可直接运行）：\n\n```sql\n-- 1) 准备示例表\nCREATE TEMPORARY TABLE orders_demo (\n  order_id   INT,\n  user_id    INT,\n  amount     DECIMAL(10,2),\n  created_at TIMESTAMP\n);\n\nINSERT INTO orders_demo VALUES\n  (101, 1, 80.00,  '2024-01-01 10:00:00'),\n  (102, 1, 120.00, '2024-01-02 11:00:00'),\n  (103, 1, 120.00, '2024-01-03 09:00:00'),  -- 与上一单金额并列\n  (104, 2, 50.00,  '2024-01-01 12:00:00'),\n  (105, 2, 90.00,  '2024-01-04 08:00:00');\n\n-- 2) 每个用户按金额降序、时间升序编号（并列也保证唯一）\nSELECT\n  order_id,\n  user_id,\n  amount,\n  created_at,\n  ROW_NUMBER() OVER (\n    PARTITION BY user_id          -- 每个用户单独编号\n    ORDER BY amount DESC,         -- 金额高者靠前\n             created_at ASC       -- 金额相同时，更早的订单靠前\n  ) AS rn\nFROM orders_demo\nORDER BY user_id, rn;\n```\n\n**输入表 `orders_demo`：**\n\n| order_id | user_id | amount | created_at |\n|---:|---:|---:|---|\n| 101 | 1 | 80.00 | 2024-01-01 10:00:00 |\n| 102 | 1 | 120.00 | 2024-01-02 11:00:00 |\n| 103 | 1 | 120.00 | 2024-01-03 09:00:00 |\n| 104 | 2 | 50.00 | 2024-01-01 12:00:00 |\n| 105 | 2 | 90.00 | 2024-01-04 08:00:00 |\n\n**查询结果示例：**\n\n| order_id | user_id | amount | rn | 说明 |\n|---:|---:|---:|---:|---|\n| 102 | 1 | 120.00 | 1 | 金额最高；与 103 并列时因时间更早得 1 |\n| 103 | 1 | 120.00 | 2 | 并列金额，序号仍连续且唯一 |\n| 101 | 1 | 80.00 | 3 | |\n| 105 | 2 | 90.00 | 1 | 用户 2 重新从 1 起编 |\n| 104 | 2 | 50.00 | 2 | |\n\n### ?? 用在哪\n\n**场景 1：每用户 Top-N 订单（去重取样）**\n\n- **场景描述**：运营要「每个用户金额最高的 2 笔订单」做召回样本，要求行不重复、口径稳定。\n- **SQL 片段**：\n\n```sql\nSELECT *\nFROM (\n  SELECT\n    o.*,\n    ROW_NUMBER() OVER (\n      PARTITION BY user_id\n      ORDER BY amount DESC, order_id ASC\n    ) AS rn\n  FROM orders_demo o\n) t\nWHERE rn <= 2;\n```\n\n- **为什么用 ROW_NUMBER 而非 RANK**：`RANK` 在金额并列时会给出相同名次，过滤 `rank<=2` 可能取出超过 2 行；`ROW_NUMBER` 强制唯一序号，Top-N 行数可控。\n\n**场景 2：明细去重——保留最新一条**\n\n- **场景描述**：同一 `order_id` 因重放出现多条变更日志，分析只要最新快照。\n- **SQL 片段**：\n\n```sql\nCREATE TEMPORARY TABLE order_events (\n  order_id INT,\n  status   VARCHAR(16),\n  updated_at TIMESTAMP\n);\nINSERT INTO order_events VALUES\n  (101, 'created', '2024-01-01 10:00:00'),\n  (101, 'paid',    '2024-01-01 10:05:00'),\n  (101, 'paid',    '2024-01-01 10:05:00'); -- 重复事件\n\nSELECT order_id, status, updated_at\nFROM (\n  SELECT\n    e.*,\n    ROW_NUMBER() OVER (\n      PARTITION BY order_id\n      ORDER BY updated_at DESC, status DESC\n    ) AS rn\n  FROM order_events e\n) t\nWHERE rn = 1;\n```\n\n- **为什么用 ROW_NUMBER 而非 DENSE_RANK**：去重要「恰好一行」；`DENSE_RANK` 在排序键完全相同时仍可能并列并列值，无法用 `=1` 稳定压成单行（除非排序键能严格区分）。`ROW_NUMBER` 即使排序键相同也会任意但确定地保留一行。\n\n### ?? 注意啥\n\n- **性能陷阱**：`ROW_NUMBER` 需要对每个分区做排序。大表上 `PARTITION BY` 高基数列 + 宽 `ORDER BY` 会触发大量内存/磁盘排序。实务建议：① 先 `WHERE` 缩小集合再窗口；② 分区键、排序键尽量有索引支撑（视引擎）；③ Top-N 可考虑引擎专用语法（如部分库的 `QUALIFY`）或预聚合表。\n- **与其他函数的区别**：\n\n| 函数 | 并列值（金额相同） | 名次是否连续 | 典型用途 |\n|---|---|---|---|\n| ROW_NUMBER | 强制不同序号（1,2,3…） | 是 | Top-N、去重留一行 |\n| RANK | 同名次，下一值跳号（1,1,3） | 否 | 「并列第 1，下一名第 3」的竞赛排名 |\n| DENSE_RANK | 同名次，下一值不跳号（1,1,2） | 是 | 需要并列但不跳号的层级 |\n\n- **面试高频追问**\n\n**Q1：`ORDER BY` 键完全相同，`ROW_NUMBER` 谁先谁后？**  \nA：标准不保证哪一行更靠前，只保证序号唯一。生产环境应追加稳定决胜列（如主键 `order_id`），否则同键重跑结果可能漂移。\n\n**Q2：为什么 `WHERE ROW_NUMBER() OVER(...) = 1` 常报错？**  \nA：窗口函数在 `SELECT` 列表阶段计算，不能直接出现在同一层 `WHERE`。正确写法是子查询/`CTE` 包一层，再过滤 `rn = 1`（或在支持 `QUALIFY` 的引擎里用 `QUALIFY`）。",
              "children": []
            },
            {
              "id": "sql-rank",
              "title": "RANK",
              "level": "??",
              "content": "### 排名类窗口 · 章节导读\n\n**学习目标**：分清 ROW_NUMBER / RANK / DENSE_RANK 的选用。",
              "children": [],
              "lessonParent": true
            },
            {
              "id": "sql-dense-rank",
              "title": "DENSE_RANK",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：并列同名次，但下一值不跳号（1,1,2）。\n- **场景**：需要层级连续、允许并列。\n\n### 怎么写\n\n```sql\nSELECT\n  product_id, score,\n  DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rnk\nFROM product_scores;\n```\n\n### 用在哪\n\n1. **等级分层**：连续档位。\n2. **并列进档**：同分同档且档位紧凑。\n3. **与 RANK 对比讲解**。\n\n### 注意啥\n\n- 仍不能保证「恰好 N 行」。\n- 去重要单行时优先 ROW_NUMBER。\n- 注意分区键是否符合业务口径。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-window-analytic",
          "title": "分析类",
          "level": "??",
          "content": "### 分析类 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-lag-lead",
              "title": "LAG/LEAD",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：取当前行之前/之后第 N 行的值，常用于环比。\n- **要点**：必须有 `ORDER BY` 定义「前后」。\n\n### 怎么写\n\n```sql\nSELECT\n  dt, gmv,\n  LAG(gmv, 1) OVER (ORDER BY dt) AS gmv_yesterday,\n  gmv - LAG(gmv, 1) OVER (ORDER BY dt) AS dod\nFROM daily_gmv;\n```\n\n### 用在哪\n\n1. **日环比 / 周环比**。\n2. **会话内上一步事件**。\n3. **缺口检测**：与上一状态对比。\n\n### 注意啥\n\n- 分区边界上 `LAG` 为 NULL，需 `COALESCE`。\n- 偏移 N 要与业务粒度一致。\n- 不要在无序集合上使用。",
              "children": []
            },
            {
              "id": "sql-sum-over",
              "title": "SUM OVER",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：在窗口帧内累计求和，保留明细行。\n- **帧**：常用 `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`。\n\n### 怎么写\n\n```sql\nSELECT\n  dt, gmv,\n  SUM(gmv) OVER (\n    ORDER BY dt\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS gmv_cumsum\nFROM daily_gmv;\n```\n\n### 用在哪\n\n1. **累计 GMV / 完成度**。\n2. **分区内累计**：按用户累计消费。\n3. **滚动窗口**：近 N 日求和（改帧）。\n\n### 注意啥\n\n- `RANGE` vs `ROWS` 语义不同，并列值要小心。\n- 大窗口耗内存，先缩小集合。\n- 与 `GROUP BY` 选：要明细就窗口，要折叠就分组。",
              "children": []
            },
            {
              "id": "sql-window-frame",
              "title": "窗口帧ROWS",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：窗口帧（ROWS/RANGE）限定聚合在分区排序后的行范围，如「近 3 行」。\n- **默认**：许多累计函数默认从分区起点到当前行。\n\n### 怎么写\n\n```sql\nSELECT\n  user_id,\n  created_at,\n  amount,\n  SUM(amount) OVER (\n    PARTITION BY user_id\n    ORDER BY created_at\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS amt_last_3_rows,\n  SUM(amount) OVER (\n    PARTITION BY user_id\n    ORDER BY created_at\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_amt\nFROM orders\nWHERE status = 'paid';\n```\n\n### 用在哪\n\n1. **滑动窗口**：近 N 单金额。\n2. **累计值**：running total。\n3. **去毛刺**：邻域平均。\n\n### 注意啥\n\n- `ROWS` 按物理行，`RANGE` 按值边界，语义不同。\n- 帧写错会导致「整分区」被聚进来。\n- 必须有明确 `ORDER BY` 才谈得上帧。",
              "children": []
            },
            {
              "id": "sql-ntile",
              "title": "NTILE",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：把分区内有序行尽量均匀切成 N 桶，返回桶号 1…N。\n- **场景**：分层抽样、分位粗分（非精确百分位）。\n\n### 怎么写\n\n```sql\nSELECT\n  user_id,\n  gmv,\n  NTILE(4) OVER (ORDER BY gmv DESC) AS gmv_quartile\nFROM (\n  SELECT user_id, SUM(amount) AS gmv\n  FROM orders\n  WHERE status = 'paid'\n  GROUP BY user_id\n) t;\n```\n\n### 用在哪\n\n1. **用户分层**：RFM 粗分四档。\n2. **抽样**：每桶抽固定比例。\n3. **对照实验**：分桶后再随机。\n\n### 注意啥\n\n- 行数不能整除时桶大小可差 1。\n- 需要精确百分位用 `PERCENTILE`/`CUME_DIST` 等。\n- 排序键决定分层含义。",
              "children": []
            },
            {
              "id": "sql-first-value",
              "title": "FIRST_VALUE",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：在窗口帧内取按排序的第一个值；常配 `IGNORE NULLS`（视引擎）。\n- **配对**：`LAST_VALUE` 需小心默认帧。\n\n### 怎么写\n\n```sql\nSELECT\n  user_id,\n  order_id,\n  amount,\n  created_at,\n  FIRST_VALUE(order_id) OVER (\n    PARTITION BY user_id\n    ORDER BY created_at\n    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n  ) AS first_order_id,\n  FIRST_VALUE(amount) OVER (\n    PARTITION BY user_id\n    ORDER BY created_at\n  ) AS first_amount\nFROM orders;\n```\n\n### 用在哪\n\n1. **首单属性**：首次下单渠道/金额。\n2. **会话起点**：会话内第一事件。\n3. **基准对照**：相对首值的变化。\n\n### 注意啥\n\n- `LAST_VALUE` 默认帧只到当前行，常要显式扩帧。\n- 与 `MIN_BY`/`任意值+排序` 方案择优。\n- NULL 是否参与「第一」看引擎选项。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-window-practice",
          "title": "综合练习",
          "level": "??",
          "content": "### 窗口综合练习 · 章节导读\n\n**学习目标**：TopN、去重、环比三类高频题。\n\n**先修**：ROW_NUMBER / LAG。",
          "children": [
            {
              "id": "sql-ex-topn",
              "title": "TopN练习",
              "level": "???",
              "content": "### 是什么\n\n- **题目**：每个用户取支付金额最高的 Top 2 订单（金额相同取更早）。\n- **要求**：结果含 `user_id, order_id, amount, rn`。\n\n### 怎么写\n\n```sql\n-- 题：TopN\n-- 答：\nSELECT user_id, order_id, amount, rn\nFROM (\n  SELECT\n    user_id, order_id, amount,\n    ROW_NUMBER() OVER (\n      PARTITION BY user_id\n      ORDER BY amount DESC, created_at ASC\n    ) AS rn\n  FROM orders\n  WHERE status = 'paid'\n) t\nWHERE rn <= 2\nORDER BY user_id, rn;\n```\n\n### 用在哪\n\n1. **排行榜**：品类 TopN 商品。\n2. **抽样质检**：每组看最大几笔。\n3. **限流展示**：个人主页展示。\n\n### 注意啥\n\n- TopN 必须 `ROW_NUMBER`（或等价），`RANK` 可能超过 N 行。\n- 排序并列规则要写进 `ORDER BY`。\n- 先过滤 `status` 再窗口，减少计算。",
              "children": []
            },
            {
              "id": "sql-ex-dedupe",
              "title": "去重练习",
              "level": "???",
              "content": "### 是什么\n\n- **题目**：`order_events` 按 `event_id` 可能重复，保留 `event_time` 最新一条。\n- **要求**：输出去重后事件明细。\n\n### 怎么写\n\n```sql\n-- 假设表 order_events(event_id, order_id, event_type, event_time, payload)\n-- 题：去重留最新\n-- 答：\nSELECT event_id, order_id, event_type, event_time, payload\nFROM (\n  SELECT\n    e.*,\n    ROW_NUMBER() OVER (\n      PARTITION BY event_id\n      ORDER BY event_time DESC\n    ) AS rn\n  FROM order_events e\n) t\nWHERE rn = 1;\n```\n\n### 用在哪\n\n1. **日志去重**：Exactly-once 近似。\n2. **拉链前清洗**：同一业务键多版本。\n3. **CDC 合并**：保留最新镜像。\n\n### 注意啥\n\n- 分区键=业务去重键，排序键=新旧判定。\n- 大表去重考虑先按日分区再合并。\n- `QUALIFY`（部分仓）可少一层子查询。",
              "children": []
            },
            {
              "id": "sql-ex-dod",
              "title": "环比练习",
              "level": "???",
              "content": "### 是什么\n\n- **题目**：按日汇总支付 GMV，并计算日环比（今日 - 昨日）。\n- **要求**：`dt, gmv, gmv_yesterday, dod`。\n\n### 怎么写\n\n```sql\n-- 题：环比\n-- 答：\nWITH daily AS (\n  SELECT DATE(created_at) AS dt, SUM(amount) AS gmv\n  FROM orders\n  WHERE status = 'paid'\n  GROUP BY DATE(created_at)\n)\nSELECT\n  dt,\n  gmv,\n  LAG(gmv, 1) OVER (ORDER BY dt) AS gmv_yesterday,\n  gmv - LAG(gmv, 1) OVER (ORDER BY dt) AS dod\nFROM daily\nORDER BY dt;\n```\n\n### 用在哪\n\n1. **经营日报**：GMV/订单环比。\n2. **告警**：环比跌破阈值。\n3. **复盘**：活动日对比。\n\n### 注意啥\n\n- 缺日会导致「环比」对到非相邻日，先补日历骨架。\n- 同比用 `LAG(..., 7)` 或日期对齐。\n- 比率环比注意分母为 0。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-cte",
      "title": "CTE 与子查询",
      "level": "?",
      "content": "### CTE 与子查询\n\n用 WITH 把复杂逻辑分层。",
      "children": [
        {
          "id": "sql-with-style",
          "title": "WITH写法",
          "level": "??",
          "content": "### WITH写法 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-cte-pipeline",
              "title": "CTE流水线",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：`WITH` 命名中间结果，把长 SQL 拆成步骤。\n- **价值**：可读、可测、易复用同层引用（视引擎）。\n\n### 怎么写\n\n```sql\nWITH paid AS (\n  SELECT * FROM orders WHERE status = 'paid'\n),\nuser_gmv AS (\n  SELECT user_id, SUM(amount) AS gmv\n  FROM paid\n  GROUP BY user_id\n)\nSELECT u.email, g.gmv\nFROM user_gmv g\nJOIN users u ON u.user_id = g.user_id\nORDER BY g.gmv DESC\nLIMIT 20;\n```\n\n### 用在哪\n\n1. **复杂报表**：过滤→聚合→关联→排序。\n2. **替代深层嵌套子查询**。\n3. **团队协作**：每步可单独解释。\n\n### 注意啥\n\n- 某些引擎 CTE 物化/内联策略不同，看计划。\n- 递归 CTE 另算，注意终止条件。\n- 步骤不宜过多导致优化器放弃。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-subquery",
          "title": "子查询",
          "level": "??",
          "content": "### 子查询 · 章节导读\n\n**学习目标**：标量 / EXISTS / 相关子查询及改写意识。\n\n**先修**：JOIN / CTE流水线。",
          "children": [
            {
              "id": "sql-scalar-subq",
              "title": "标量子查询",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：子查询返回单个标量，嵌入 `SELECT`/`WHERE` 表达式。\n- **约束**：最多一行一列，否则报错。\n\n### 怎么写\n\n```sql\nSELECT\n  o.order_id,\n  o.amount,\n  (SELECT AVG(amount) FROM orders WHERE status = 'paid') AS global_avg_paid\nFROM orders o\nWHERE o.amount > (\n  SELECT AVG(amount) FROM orders WHERE status = 'paid'\n);\n```\n\n### 用在哪\n\n1. **相对阈值**：高于全局均价的订单。\n2. **打标**：附加一个全局指标列。\n3. **简易校验**：`SELECT (SELECT COUNT(*))`。\n\n### 注意啥\n\n- 相关标量子查询可能变成逐行执行，注意计划。\n- 多行时改 `JOIN`/窗口。\n- 空结果标量为 NULL，注意三值逻辑。",
              "children": []
            },
            {
              "id": "sql-exists-subq",
              "title": "EXISTS子查询",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：用 `EXISTS` 子查询表达半连接过滤（见半开连接主题，此处强调写法套路）。\n- **模式**：外层行驱动，内层相关匹配。\n\n### 怎么写\n\n```sql\nSELECT o.*\nFROM orders o\nWHERE EXISTS (\n  SELECT 1 FROM users u\n  WHERE u.user_id = o.user_id\n    AND u.email LIKE '%@example.com'\n)\nAND o.status = 'paid';\n```\n\n### 用在哪\n\n1. **跨表条件**：订单侧过滤用户属性。\n2. **反连**：`NOT EXISTS` 找孤儿行。\n3. **权限**：仅存在授权记录时可查。\n\n### 注意啥\n\n- 相关列索引是关键。\n- 与 `IN (SELECT id …)` 择优看基数与计划。\n- 避免在子查询内做无谓聚合。",
              "children": []
            },
            {
              "id": "sql-corr-subq",
              "title": "相关子查询",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：子查询引用外层列，对外层每一行（概念上）求值。\n- **利弊**：表达力强，但易写成相关慢查询。\n\n### 怎么写\n\n```sql\nSELECT\n  u.user_id,\n  u.email,\n  (\n    SELECT MAX(o.amount)\n    FROM orders o\n    WHERE o.user_id = u.user_id AND o.status = 'paid'\n  ) AS max_paid_amount\nFROM users u;\n-- 等价窗口/JOIN 聚合往往更快：\n-- SELECT u.*, x.max_paid_amount FROM users u\n-- LEFT JOIN (\n--   SELECT user_id, MAX(amount) max_paid_amount FROM orders\n--   WHERE status='paid' GROUP BY user_id\n-- ) x ON x.user_id = u.user_id;\n```\n\n### 用在哪\n\n1. **按行取关联指标**：每用户最大单。\n2. **教学**：理解相关 vs 非相关。\n3. **小外表**：外表很小时尚可接受。\n\n### 注意啥\n\n- 大外表相关子查询优先改写为 JOIN 聚合。\n- 看 `EXPLAIN` 是否依赖循环执行。\n- 确保相关谓词可索引。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-recursive",
          "title": "递归",
          "level": "??",
          "content": "### 递归 · 章节导读\n\n**学习目标**：读懂并写出带护栏的递归 CTE。\n\n**先修**：WITH 流水线。",
          "children": [
            {
              "id": "sql-recursive-cte",
              "title": "递归CTE入门",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：`WITH RECURSIVE` 用锚点 + 递归成员展开层级/图路径，直到不产生新行。\n- **结构**：非递归种子 ∪ 递归步进，需终止条件。\n\n### 怎么写\n\n```sql\n-- 邻接表组织树：id, parent_id, name\nWITH RECURSIVE org AS (\n  SELECT user_id, manager_id, email, 1 AS lvl\n  FROM users\n  WHERE manager_id IS NULL          -- 锚点：根\n  UNION ALL\n  SELECT u.user_id, u.manager_id, u.email, org.lvl + 1\n  FROM users u\n  JOIN org ON u.manager_id = org.user_id\n  WHERE org.lvl < 10                -- 护栏，防环\n)\nSELECT * FROM org ORDER BY lvl, user_id;\n```\n\n### 用在哪\n\n1. **组织树/类目树**。\n2. **账单拆分层级**。\n3. **图可达性**（小规模）。\n\n### 注意啥\n\n- 必须设深度上限或访问集合，防环死循环。\n- 大图递归代价高，考虑闭包表。\n- MySQL 8+ / PG / DuckDB 均支持，语法细节略有差异。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-index-plan",
      "title": "索引与执行计划",
      "level": "?",
      "content": "### 索引与执行计划\n\n先看计划再改 SQL。",
      "children": [
        {
          "id": "sql-read-plan",
          "title": "读懂计划",
          "level": "??",
          "content": "### 读懂计划 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-explain",
              "title": "EXPLAIN",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：让引擎说明将如何执行查询（访问路径、连接、排序等）。\n- **目标**：找到全表扫、坏连接顺序、临时表/文件排序。\n\n### 怎么写\n\n```sql\nEXPLAIN\nSELECT *\nFROM orders\nWHERE user_id = 42\n  AND created_at >= '2024-01-01';\n\n-- 部分引擎\nEXPLAIN ANALYZE SELECT ...;\n```\n\n### 用在哪\n\n1. **慢查询诊断**。\n2. **上线前评审**。\n3. **验证索引是否被使用**。\n\n### 注意啥\n\n- 不同引擎输出字段不同，抓关键：type/rows/key/Extra。\n- `EXPLAIN` 是估计；`ANALYZE` 带实际耗时（若支持）。\n- 统计信息过期会导致离谱计划。",
              "children": []
            },
            {
              "id": "sql-composite-index",
              "title": "复合索引",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：多列组成的索引，遵循最左前缀匹配。\n- **设计**：等值列在前，范围列靠后；覆盖常用投影。\n\n### 怎么写\n\n```sql\nCREATE INDEX idx_orders_uid_status_time\nON orders (user_id, status, created_at);\n\n-- 可较好利用：(user_id) / (user_id,status) / 三者都等值或前缀+范围\nSELECT order_id, amount\nFROM orders\nWHERE user_id = 42 AND status = 'paid'\n  AND created_at >= '2024-01-01';\n```\n\n### 用在哪\n\n1. **高频组合过滤**。\n2. **覆盖索引减少回表**。\n3. **对齐 ORDER BY 前缀**。\n\n### 注意啥\n\n- 跳过最左列会导致索引无法完整使用。\n- 列顺序比「感觉上重要」更重要。\n- 用 `EXPLAIN` 验证，不要凭猜测加索引。",
              "children": []
            },
            {
              "id": "sql-index-fail",
              "title": "索引失效",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：谓词写法导致优化器无法有效使用索引（函数包列、隐式转换、前导模糊等）。\n- **对策**：改写条件，保持「列在左侧原样」。\n\n### 怎么写\n\n```sql\n-- 失效示例 → 改写\n-- BAD: 函数包列\n-- WHERE DATE(created_at) = '2024-06-01'\n-- GOOD:\nWHERE created_at >= '2024-06-01'\n  AND created_at <  '2024-06-02';\n\n-- BAD: 类型隐式转换（user_id 为数字却比字符串）\n-- WHERE user_id = '42'\n-- GOOD: WHERE user_id = 42\n\n-- BAD: 前导通配\n-- WHERE email LIKE '%@example.com'\n-- → 难用 btree；可考虑倒排/专用方案\n```\n\n### 用在哪\n\n1. **慢查询治理**：条件改写即加速。\n2. **Code Review**：ORM 生成 SQL 检查。\n3. **培训**：索引可用前提。\n\n### 注意啥\n\n- `OR`、否定、非前缀 `LIKE` 也常破坏范围扫描。\n- 复合索引要满足最左前缀。\n- 用 `EXPLAIN` 验证是否 `ref`/`range`。",
              "children": []
            },
            {
              "id": "sql-covering-index",
              "title": "覆盖索引",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：索引已包含查询所需全部列，可只扫索引不必回表（Index Only Scan）。\n- **做法**：把过滤列 + 投影列纳入复合索引（权衡写入）。\n\n### 怎么写\n\n```sql\n-- 高频查询：按用户取近期订单号与金额\n-- SELECT order_id, amount FROM orders\n-- WHERE user_id = ? AND status = 'paid'\n-- ORDER BY created_at DESC LIMIT 20;\n\n-- 覆盖倾向索引（示例）\nCREATE INDEX idx_orders_covering\nON orders (user_id, status, created_at, order_id, amount);\n\nEXPLAIN\nSELECT order_id, amount\nFROM orders\nWHERE user_id = 42 AND status = 'paid'\nORDER BY created_at DESC\nLIMIT 20;\n```\n\n### 用在哪\n\n1. **热点列表**：个人订单页。\n2. **计数类**：只读索引列。\n3. **降 IO**：宽表避免回表。\n\n### 注意啥\n\n- 索引过宽损害写入与缓存。\n- 覆盖随 `SELECT` 列表变化，勿盲目加列。\n- 统计信息过期会影响是否选中。",
              "children": []
            },
            {
              "id": "sql-analyze-stats",
              "title": "ANALYZE统计",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：`ANALYZE`（或等效）收集表/索引统计，供优化器估算基数与选计划。\n    - **时机**：大批导入、倾斜变化、计划突然变差后。\n\n### 怎么写\n\n```sql\n-- MySQL 8\nANALYZE TABLE orders;\nANALYZE TABLE users;\n\n-- PostgreSQL\nANALYZE orders;\n\n-- DuckDB\nANALYZE;\n\nEXPLAIN\nSELECT user_id, SUM(amount)\nFROM orders\nWHERE status = 'paid'\nGROUP BY user_id;\n```\n\n### 用在哪\n\n1. **计划回归**：同样 SQL 变慢时先看统计。\n2. **ETL 后**：灌数完成立即分析。\n3. **调优闭环**：改索引前后对比。\n\n### 注意啥\n\n- 过期统计 → 错误连接顺序/索引选择。\n- 抽样分析与全量成本权衡。\n- 与直方图/扩展统计（PG）配合处理倾斜。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-tx-lock",
      "title": "事务与锁",
      "level": "?",
      "content": "### 事务与锁\n\nACID 与显式事务边界。",
      "children": [
        {
          "id": "sql-acid",
          "title": "ACID基础",
          "level": "??",
          "content": "### ACID 入门 · 章节导读\n\n**学习目标**：理解事务边界与提交/回滚。",
          "children": [
            {
              "id": "sql-begin-commit",
              "title": "BEGIN/COMMIT",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：事务把多步读写变成原子单元——全成或全撤。\n- **ACID**：原子性、一致性、隔离性、持久性。\n\n### 怎么写\n\n```sql\nBEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;\n-- 出错则 ROLLBACK;\n```\n\n### 用在哪\n\n1. **转账/库存**：多表必须同成同败。\n2. **批量订正**：可回滚的数据修复。\n3. **读写一致**：报表会话快照（视隔离级别）。\n\n### 注意啥\n\n- 长事务拖锁、拖回收，尽快提交。\n- 隔离级别影响脏读/幻读，按业务选。\n- DDL 在部分引擎会隐式提交。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-isolation",
          "title": "隔离与并发",
          "level": "??",
          "content": "### 隔离与并发 · 章节导读\n\n**学习目标**：隔离级别与读异常。\n\n**先修**：BEGIN/COMMIT。",
          "children": [
            {
              "id": "sql-isolation-levels",
              "title": "隔离级别",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：事务隔离级别规定并发下「能看到何种中间状态」。\n- **常见四级**：读未提交 → 读已提交 → 可重复读 → 串行化。\n\n### 怎么写\n\n```sql\n-- MySQL\nSET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;\nSTART TRANSACTION;\nSELECT SUM(amount) FROM orders WHERE user_id = 42;\nCOMMIT;\n\n-- 查看\n-- SELECT @@transaction_isolation;\n```\n\n### 用在哪\n\n1. **报表会话**：倾向快照/可重复读。\n2. **高并发写**：常选读已提交降锁冲突。\n3. **资金强一致**：更高隔离或显式锁。\n\n### 注意啥\n\n- 级别越高并发吞吐通常越低。\n- InnoDB 默认 RR，与 PG 默认 RC 不同。\n- 应用重试与幂等要配套。",
              "children": []
            },
            {
              "id": "sql-anomaly-reads",
              "title": "脏读幻读",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：脏读、不可重复读、幻读是并发读异常的经典分类。\n- **对照**：隔离级别就是为抑制这些异常。\n\n### 怎么写\n\n```sql\n-- 概念演示（两会话，勿在生产随意试）\n-- 会话A: BEGIN; UPDATE orders SET amount = 1 WHERE order_id = 1;  -- 未提交\n-- 会话B: 在 READ UNCOMMITTED 下可能读到 1 → 脏读\n-- 提交/回滚后，RC 下两次读中间被别人改 → 不可重复读\n-- RR/串行化下插入满足条件的新行可见性差异 → 幻读\n\nSELECT order_id, amount FROM orders WHERE order_id = 1;\n```\n\n### 用在哪\n\n1. **故障复盘**：对账不一致归因。\n2. **选型讨论**：业务能否容忍幻读。\n3. **面试/培训**：理论打底。\n\n### 注意啥\n\n- 引擎实现（MVCC/锁）会影响「理论上的」异常是否出现。\n- 不要只调隔离，也要看事务边界长短。\n- 写写冲突另论（丢更新），需乐观锁版本号等。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-locks",
          "title": "锁",
          "level": "??",
          "content": "### 锁 · 章节导读\n\n**学习目标**：行锁/表锁与死锁重试。\n\n**先修**：事务基础。",
          "children": [
            {
              "id": "sql-row-table-lock",
              "title": "行锁表锁",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：行锁锁住行级记录；表锁锁住整表（或元数据）。\n- **InnoDB**：DML 多为行锁；特定 DDL/操作为表锁。\n\n### 怎么写\n\n```sql\nBEGIN;\n-- 行锁：锁住匹配行（加锁读示例）\nSELECT * FROM orders WHERE order_id = 1001 FOR UPDATE;\nUPDATE orders SET status = 'shipped' WHERE order_id = 1001;\nCOMMIT;\n\n-- 避免：无索引条件的大范围更新导致大量行锁甚至升级\n-- UPDATE orders SET note = 'x' WHERE DATE(created_at) = CURRENT_DATE;\n```\n\n### 用在哪\n\n1. **库存扣减**：对单行 `FOR UPDATE`。\n2. **避免表锁**：批量更新拆批 + 走索引。\n3. **DDL 窗口**：理解表锁影响。\n\n### 注意啥\n\n- 锁粒度越粗，冲突概率越高。\n- 长事务持锁是雪崩温床。\n- 看 `SHOW ENGINE INNODB STATUS` / 性能_schema 定位。",
              "children": []
            },
            {
              "id": "sql-deadlock",
              "title": "死锁重试",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：两个以上事务互相等待对方持有的锁，引擎选择回滚其一。\n- **应用侧**：捕获死锁错误并幂等重试。\n\n### 怎么写\n\n```sql\n-- 预防：统一加锁顺序（先锁 user 再锁 order）\n-- 事务内按主键升序更新多行\nBEGIN;\nUPDATE accounts SET balance = balance - 10 WHERE id = 1;\nUPDATE accounts SET balance = balance + 10 WHERE id = 2;\nCOMMIT;\n\n-- 应用伪代码：catch deadlock → backoff → retry N times\n-- MySQL errno 1213；PG SQLSTATE 40P01\n```\n\n### 用在哪\n\n1. **转账/库存**：多行更新。\n2. **热点商品**：秒杀减库存。\n3. **对账任务**：并发修数。\n\n### 注意啥\n\n- 缩小事务、固定顺序、降隔离或拆分热点。\n- 重试必须幂等，限制次数与抖动。\n- 死锁日志要采集，便于调顺序。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-tune",
      "title": "SQL 调优",
      "level": "?",
      "content": "### SQL 调优\n\n复现 → 计划 → 改写 → 回归。",
      "children": [
        {
          "id": "sql-tune-loop",
          "title": "调优闭环",
          "level": "??",
          "content": "### 调优闭环 · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。",
          "children": [
            {
              "id": "sql-tune-checklist",
              "title": "调优检查清单",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按固定清单缩小慢查询原因，避免盲目加索引。\n- **闭环**：复现 → 计划 → 改写/索引 → 回归验证。\n\n### 怎么写\n\n```sql\n-- 1) 复现并限制代价\nEXPLAIN ANALYZE\nSELECT ...;\n\n-- 2) 先过滤再关联/窗口\nWITH base AS (\n  SELECT * FROM orders\n  WHERE created_at >= CURRENT_DATE - INTERVAL 7 DAY\n)\nSELECT ... FROM base b JOIN ...;\n```\n\n### 用在哪\n\n1. **线上慢查询周报**。\n2. **上线评审**：复杂 SQL 必过清单。\n3. **教学**：把调优步骤标准化。\n\n### 注意啥\n\n- 清单要点：① 过滤是否可推前 ② 是否 JOIN 爆炸 ③ 是否选错索引\n  ④ 是否必要排序/临时表 ⑤ 统计信息是否新鲜 ⑥ 结果粒度是否正确。\n- 先正确后更快；口径错了再快也没用。\n- 改完用同等数据量回归，防「测快线慢」。",
              "children": []
            },
            {
              "id": "sql-rewrite-patterns",
              "title": "常见改写",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：在语义等价前提下改写 SQL，使优化器选更好计划。\n- **常见**：子查询→JOIN、OR→UNION、函数包列→范围、DISTINCT→EXISTS。\n\n### 怎么写\n\n```sql\n-- 相关标量 → JOIN 聚合\n-- BEFORE: SELECT u.*, (SELECT MAX(amount) FROM orders o WHERE o.user_id=u.user_id)\n-- AFTER:\nSELECT u.user_id, u.email, x.max_amt\nFROM users u\nLEFT JOIN (\n  SELECT user_id, MAX(amount) AS max_amt\n  FROM orders GROUP BY user_id\n) x ON x.user_id = u.user_id;\n\n-- OR 两侧难用索引 → UNION ALL 再去重/聚合\n```\n\n### 用在哪\n\n1. **慢查询榜单**第一条手段。\n2. **ORM 生成 SQL**人工改写。\n3. **数仓 SQL**下推过滤。\n\n### 注意啥\n\n- 改写后用同一数据集做结果对比。\n- 以 `EXPLAIN ANALYZE` 验证，不凭感觉。\n- 注意 NULL 与重复行语义是否保持。",
              "children": []
            },
            {
              "id": "sql-partition-prune",
              "title": "分区裁剪",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：分区表上谓词能让引擎只扫相关分区，跳过其它分区数据。\n- **关键**：过滤条件命中分区键且不被函数包裹。\n\n### 怎么写\n\n```sql\n-- 假设 orders 按 RANGE (DATE(created_at)) 或 toYYYYMM 分区（示意）\nSELECT user_id, SUM(amount) AS gmv\nFROM orders\nWHERE created_at >= '2024-06-01'\n  AND created_at <  '2024-07-01'\n  AND status = 'paid'\nGROUP BY user_id;\n\n-- BAD: WHERE DATE(created_at) = '2024-06-15' 可能无法裁剪\n```\n\n### 用在哪\n\n1. **明细大表**：按日/月分区查询。\n2. **生命周期**：冷分区归档。\n3. **仓扫描费**：只扫必要分区降本。\n\n### 注意啥\n\n- 分区键选择要贴合查询模式。\n- 跨太多分区等于几乎不裁剪。\n- 与聚簇/排序键（仓）概念区分。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-tune-cases",
          "title": "场景案例",
          "level": "??",
          "content": "### 场景案例 · 章节导读\n\n**学习目标**：慢报表与大 JOIN 的排查套路。\n\n**先修**：EXPLAIN / 改写。",
          "children": [
            {
              "id": "sql-slow-report",
              "title": "慢报表案例",
              "level": "???",
              "content": "### 是什么\n\n- **案例**：日报「每用户 GMV + 近 7 日环比」跑数超时。\n- **思路**：预聚合、减少重复扫、窗口一次算完。\n\n### 怎么写\n\n```sql\n-- 优化后形态示意\nWITH daily AS (\n  SELECT user_id, DATE(created_at) AS dt, SUM(amount) AS gmv\n  FROM orders\n  WHERE status = 'paid'\n    AND created_at >= CURRENT_DATE - INTERVAL 14 DAY\n  GROUP BY user_id, DATE(created_at)\n)\nSELECT\n  user_id, dt, gmv,\n  LAG(gmv, 1) OVER (PARTITION BY user_id ORDER BY dt) AS gmv_yday\nFROM daily;\n-- 进一步：落地 daily 汇总表，报表只读汇总\n```\n\n### 用在哪\n\n1. **经营看板**。\n2. **邮件日报**。\n3. **自助分析加速**。\n\n### 注意啥\n\n- 先 EXPLAIN 找全表扫/大排序。\n- 同一明细被扫多次 → CTE/中间表。\n- 报表可接受 T+1 则物化。",
              "children": []
            },
            {
              "id": "sql-big-join",
              "title": "大JOIN案例",
              "level": "???",
              "content": "### 是什么\n\n- **案例**：`orders` 亿级 JOIN `users` + 多维表导致内存/时间爆。\n- **思路**：先过滤事实表、广播小维、避免扇出后再聚合。\n\n### 怎么写\n\n```sql\n-- 先压事实再维表\nWITH o AS (\n  SELECT user_id, amount\n  FROM orders\n  WHERE status = 'paid'\n    AND created_at >= '2024-06-01'\n    AND created_at <  '2024-07-01'\n)\nSELECT u.channel, SUM(o.amount) AS gmv\nFROM o\nJOIN users u ON u.user_id = o.user_id\nGROUP BY u.channel;\n```\n\n### 用在哪\n\n1. **大宽表关联**。\n2. **多维下钻报表**。\n3. **反范式前的临时关联**。\n\n### 注意啥\n\n- 检查 JOIN 键类型一致与空值。\n- 防一对多扇出导致指标放大（先聚合再 JOIN）。\n- 仓上注意 shuffle 与广播选择。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-warehouse-patterns",
          "title": "数仓SQL模式",
          "level": "??",
          "content": "### 数仓 SQL 模式 · 章节导读\n\n**学习目标**：增量去重与 SCD2 拉链。\n\n**先修**：窗口去重 / UPSERT。",
          "children": [
            {
              "id": "sql-incremental-dedupe",
              "title": "增量去重",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：增量任务只处理新到达数据，并与历史合并去重（常按业务键留最新）。\n- **模式**：增量切片 + `ROW_NUMBER`/`MERGE`/`UPSERT`。\n\n### 怎么写\n\n```sql\n-- 当日增量事件去重后合并入目标（示意）\nWITH inc AS (\n  SELECT *\n  FROM order_events\n  WHERE event_time >= CURRENT_DATE\n    AND event_time <  CURRENT_DATE + INTERVAL 1 DAY\n),\ndedup AS (\n  SELECT * FROM (\n    SELECT i.*, ROW_NUMBER() OVER (\n      PARTITION BY event_id ORDER BY event_time DESC\n    ) rn FROM inc i\n  ) t WHERE rn = 1\n)\nINSERT INTO order_events_curated (\n  event_id, order_id, event_type, event_time, payload\n)\nSELECT event_id, order_id, event_type, event_time, payload FROM dedup\nON DUPLICATE KEY UPDATE\n  event_type = VALUES(event_type),\n  event_time = VALUES(event_time),\n  payload = VALUES(payload);\n```\n\n### 用在哪\n\n1. **近实时入仓**。\n2. **Kafka/CDC 落地**。\n3. **日增量 ETL**。\n\n### 注意啥\n\n- 迟到数据要有回刷窗口。\n- 目标表唯一键必须对齐去重键。\n- 与全量对账定期校验。",
              "children": []
            },
            {
              "id": "sql-scd2",
              "title": "拉链SCD2",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：缓慢变化维 Type 2——保留历史版本，用生效/失效时间拉链。\n- **字段**：`valid_from, valid_to, is_current`。\n\n### 怎么写\n\n```sql\n-- 查询某时刻用户邮箱（拉链）\nSELECT user_id, email\nFROM dim_users_scd2\nWHERE user_id = 42\n  AND valid_from <= '2024-06-15'\n  AND (valid_to IS NULL OR valid_to > '2024-06-15');\n\n-- 关闭旧链 + 插入新版本（示意，需事务）\nUPDATE dim_users_scd2\nSET valid_to = NOW(), is_current = 0\nWHERE user_id = 42 AND is_current = 1;\n\nINSERT INTO dim_users_scd2 (user_id, email, valid_from, valid_to, is_current)\nVALUES (42, 'new@x.com', NOW(), NULL, 1);\n```\n\n### 用在哪\n\n1. **用户属性史**。\n2. **价格/类目变更追溯**。\n3. **点-in-time 分析**。\n\n### 注意啥\n\n- 时间边界半开区间约定要统一。\n- 并发更新需事务，防双 current。\n- 与 SCD1（覆盖）选型按分析需求。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-security",
          "title": "安全",
          "level": "??",
          "content": "### 安全 · 章节导读\n\n**学习目标**：认清注入并坚持参数化。\n\n**先修**：基础 DML。",
          "children": [
            {
              "id": "sql-injection",
              "title": "注入与参数化",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：把不可信字符串拼进 SQL，导致语义被篡改（删表、越权读）。\n- **正解**：参数化/预编译绑定，永不拼接用户输入。\n\n### 怎么写\n\n```sql\n-- 危险（示意，勿写）：\n-- \"SELECT * FROM users WHERE email = '\" + userInput + \"'\"\n\n-- MySQL 预编译思想：使用占位符由驱动绑定\n-- PREPARE stmt FROM 'SELECT * FROM users WHERE email = ?';\n-- SET @e = ?; EXECUTE stmt USING @e;\n\n-- 应用层（伪代码）：\n-- db.query('SELECT * FROM orders WHERE user_id = ?', [userId])\n```\n\n### 用在哪\n\n1. **登录/搜索框**。\n2. **动态排序字段**白名单校验。\n3. **管理后台**高危。\n\n### 注意啥\n\n- 即使用 ORM，原生 SQL 拼接同样危险。\n- 标识符（表名/列名）不能绑参，必须白名单。\n- 最小权限账号 + WAF 是纵深，不能替代参数化。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "sql-learning-path",
      "title": "学习路径",
      "level": "?",
      "content": "### 学习路径\n\n按初级→中级→高级推进，配合练习场与方言对照。",
      "children": [
        {
          "id": "sql-roadmap",
          "title": "路线图",
          "level": "??",
          "content": "### 路线图 · 章节导读\n\n**学习目标**：按清单顺序覆盖图谱叶节点。",
          "children": [
            {
              "id": "sql-path-junior",
              "title": "初级清单",
              "level": "?",
              "content": "### 是什么\n\n- **定位**：能独立完成单表查询、基础改写与简单聚合。\n- **建议顺序（对照本图谱叶标题）**：\n\n### 怎么写\n\n```text\n1. SELECT\n2. INSERT\n3. UPDATE/DELETE\n4. WHERE/ORDER\n5. GROUP BY\n6. HAVING\n7. NULL处理\n8. CASE WHEN\n9. 常用函数\n10. DISTINCT\n11. 分页LIMIT\n12. INNER\n13. LEFT\n14. CREATE TABLE\n15. 主键/外键/唯一\n```\n\n### 用在哪\n\n1. **入职首周**：跑通样例库。\n2. **数据分析新人**：取数自助。\n3. **后端新人**：CRUD 与安全更新。\n\n### 注意啥\n\n- 每课至少手敲一遍「怎么写」。\n- 先保证正确，再谈性能。\n- 同步建立 `orders`/`users` 练习库。",
              "children": []
            },
            {
              "id": "sql-path-mid",
              "title": "中级清单",
              "level": "??",
              "content": "### 是什么\n\n- **定位**：多表关联、窗口、CTE、执行计划入门，能写常见报表 SQL。\n- **建议顺序**：\n\n### 怎么写\n\n```text\n1. UNION系\n2. SELF JOIN\n3. CROSS JOIN\n4. EXISTS\n5. IN与NOT IN\n6. UPSERT\n7. VIEW\n8. INDEX 入门\n9. 数据类型\n10. ALTER TABLE\n11. ROW_NUMBER\n12. RANK\n13. DENSE_RANK\n14. LAG/LEAD\n15. SUM OVER\n16. 窗口帧ROWS\n17. CTE流水线\n18. 标量子查询\n19. EXPLAIN\n20. 复合索引\n```\n\n### 用在哪\n\n1. **数仓初级**。\n2. **业务数据分析师进阶**。\n3. **后端复杂报表**。\n\n### 注意啥\n\n- 窗口三课（TopN/去重/环比）务必完成。\n- 开始养成看 `EXPLAIN` 的习惯。\n- 对照「索引失效」检查自己的 WHERE。",
              "children": []
            },
            {
              "id": "sql-path-senior",
              "title": "高级清单",
              "level": "???",
              "content": "### 是什么\n\n- **定位**：并发、调优、仓模式与复杂改写，能主导慢 SQL 治理。\n- **建议顺序**：\n\n### 怎么写\n\n```text\n1. EXISTS子查询 / 相关子查询\n2. 递归CTE入门\n3. NTILE / FIRST_VALUE\n4. 物化视图\n5. 覆盖索引 / 索引失效 / ANALYZE统计\n6. BEGIN/COMMIT\n7. 隔离级别 / 脏读幻读\n8. 行锁表锁 / 死锁重试\n9. 调优检查清单\n10. 常见改写 / 分区裁剪\n11. 慢报表案例 / 大JOIN案例\n12. 增量去重 / 拉链SCD2\n13. 注入与参数化\n14. MySQL与PG差异 / 仓SQL注意点\n```\n\n### 用在哪\n\n1. **DBA/后端资深**。\n2. **数仓建模**。\n3. **性能专项**。\n\n### 注意啥\n\n- 结合生产慢日志做真实案例。\n- 隔离与锁建议在测试环境验证。\n- 安全课为上线硬门槛。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-practice-field",
          "title": "练习场",
          "level": "??",
          "content": "### 练习场 · 章节导读\n\n**学习目标**：用同一套 orders/users 完成分级习题。",
          "children": [
            {
              "id": "sql-drill-junior",
              "title": "初级练习",
              "level": "?",
              "content": "### 是什么\n\n- **练习场（初级）**：共用 `users(user_id,email)`、`orders(order_id,user_id,amount,status,created_at)`。\n- **作答**：先自写，再对答案。\n\n### 怎么写\n\n```sql\n-- Q1 查询最近 10 笔 paid 订单\n-- A1\nSELECT order_id, user_id, amount, created_at\nFROM orders WHERE status='paid'\nORDER BY created_at DESC LIMIT 10;\n\n-- Q2 统计每个用户订单数\n-- A2\nSELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id;\n\n-- Q3 找出从未下单的用户\n-- A3\nSELECT u.user_id, u.email FROM users u\nLEFT JOIN orders o ON o.user_id=u.user_id\nWHERE o.order_id IS NULL;\n\n-- Q4 金额缺失视为 0 后求和\n-- A4\nSELECT user_id, SUM(COALESCE(amount,0)) AS s\nFROM orders GROUP BY user_id;\n\n-- Q5 支付用户按 GMV 分档\n-- A5\nSELECT user_id, SUM(amount) AS gmv,\n  CASE WHEN SUM(amount)>=1000 THEN 'H' WHEN SUM(amount)>=100 THEN 'M' ELSE 'L' END AS tier\nFROM orders WHERE status='paid' GROUP BY user_id;\n```\n\n### 用在哪\n\n1. **课堂作业**。\n2. **面试热身**。\n3. **自学打卡**。\n\n### 注意啥\n\n- 先建临时表灌入几行样例再跑。\n- 注意 `LEFT JOIN` 判空用右表主键。\n- 聚合与 CASE 顺序：先 SUM 再分档。",
              "children": []
            },
            {
              "id": "sql-drill-mid",
              "title": "中级练习",
              "level": "??",
              "content": "### 是什么\n\n- **练习场（中级）**：加入窗口与半连接；表同上，可加 `order_events`。\n- **作答**：对照窗口/EXISTS 课。\n\n### 怎么写\n\n```sql\n-- Q1 每用户金额 Top1 订单\n-- A1\nSELECT * FROM (\n  SELECT o.*, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY amount DESC) rn\n  FROM orders o WHERE status='paid'\n) t WHERE rn=1;\n\n-- Q2 日 GMV 与昨日环比\n-- A2\nWITH d AS (\n  SELECT DATE(created_at) dt, SUM(amount) gmv FROM orders\n  WHERE status='paid' GROUP BY DATE(created_at)\n)\nSELECT dt, gmv, gmv-LAG(gmv) OVER(ORDER BY dt) AS dod FROM d;\n\n-- Q3 有过退款事件的用户\n-- A3\nSELECT DISTINCT o.user_id FROM orders o\nWHERE EXISTS (\n  SELECT 1 FROM order_events e\n  WHERE e.order_id=o.order_id AND e.event_type='refund'\n);\n\n-- Q4 CTE：paid→user_gmv→Top20\n-- A4\nWITH paid AS (SELECT * FROM orders WHERE status='paid'),\nug AS (SELECT user_id, SUM(amount) gmv FROM paid GROUP BY user_id)\nSELECT * FROM ug ORDER BY gmv DESC LIMIT 20;\n\n-- Q5 事件按 event_id 去重留最新\n-- A5\nSELECT * FROM (\n  SELECT e.*, ROW_NUMBER() OVER(PARTITION BY event_id ORDER BY event_time DESC) rn\n  FROM order_events e\n) t WHERE rn=1;\n```\n\n### 用在哪\n\n1. **进阶作业**。\n2. **报表模拟**。\n3. **窗口专项**。\n\n### 注意啥\n\n- TopN 用 ROW_NUMBER。\n- 环比缺日需补齐（加分项）。\n- EXISTS 不要 `SELECT *`。",
              "children": []
            },
            {
              "id": "sql-drill-senior",
              "title": "高级练习",
              "level": "???",
              "content": "### 是什么\n\n- **练习场（高级）**：改写、增量、并发意识与安全。\n- **作答**：关注计划与幂等。\n\n### 怎么写\n\n```sql\n-- Q1 改写相关子查询为 JOIN 聚合（每用户最大支付额）\n-- A1\nSELECT u.user_id, u.email, x.max_amt\nFROM users u\nLEFT JOIN (\n  SELECT user_id, MAX(amount) max_amt FROM orders\n  WHERE status='paid' GROUP BY user_id\n) x ON x.user_id=u.user_id;\n\n-- Q2 增量去重合并（当日 event）\n-- A2 见「增量去重」课 UPSERT 模板\n\n-- Q3 解释为何 WHERE YEAR(created_at)=2024 可能索引失效并改写\n-- A3\n-- WHERE created_at>='2024-01-01' AND created_at<'2025-01-01'\n\n-- Q4 死锁重试原则（文字）\n-- A4 捕获 1213/40P01 → 抖动退避 → 幂等重试；事务内统一加锁顺序\n\n-- Q5 参数化查询（伪代码）\n-- A5 db.query('SELECT * FROM orders WHERE user_id=?', [uid])  -- 禁止字符串拼接\n```\n\n### 用在哪\n\n1. **调优演练**。\n2. **数仓作业**。\n3. **安全验收**。\n\n### 注意啥\n\n- 改写前后结果集对比。\n- 结合 EXPLAIN ANALYZE。\n- 安全题零容忍拼接。",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "sql-dialect",
          "title": "方言",
          "level": "??",
          "content": "### 方言 · 章节导读\n\n**学习目标**：知道 MySQL/PG/仓 SQL 的关键差异。",
          "children": [
            {
              "id": "sql-mysql-pg",
              "title": "MySQL与PG差异",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：MySQL 与 PostgreSQL 在分页、UPSERT、字符串/日期函数、布尔与 DDL 上差异明显。\n- **迁移**：先锁方言清单，再谈自动改写。\n\n### 怎么写\n\n```sql\n-- 分页：两者均 LIMIT/OFFSET；PG 另有 FETCH FIRST n ROWS ONLY\n-- UPSERT：\n-- MySQL: ON DUPLICATE KEY UPDATE ...\n-- PG:    ON CONFLICT (pk) DO UPDATE SET ...\n\n-- 字符串拼接：MySQL CONCAT()；PG 可用 ||\n-- 布尔：PG 真布尔；MySQL 常用 TINYINT\n\nSELECT VERSION(); -- 两边都有，含义不同\n```\n\n### 用在哪\n\n1. **跨库开发**。\n2. **迁移评估**。\n3. **ORM 方言配置**。\n\n### 注意啥\n\n- 同一业务在两边默认隔离级别不同。\n- JSON/窗口/CTE 支持版本要核对。\n- 保留字与反引号/`\"` 引用规则不同。",
              "children": []
            },
            {
              "id": "sql-warehouse-dialect",
              "title": "仓SQL注意点",
              "level": "???",
              "content": "### 是什么\n\n- **一句话定义**：仓引擎（BigQuery/Snowflake/DuckDB/Hive 等）SQL 偏分析，强调分区、列存与代价模型。\n- **注意**：临时函数名、QUALIFY、半结构化类型各异。\n\n### 怎么写\n\n```sql\n-- DuckDB / 多数仓：CTAS 物化\nCREATE TABLE user_gmv AS\nSELECT user_id, SUM(amount) AS gmv\nFROM orders\nWHERE status = 'paid'\nGROUP BY user_id;\n\n-- 有 QUALIFY 的引擎可写：\n-- SELECT * FROM (\n--   SELECT *, ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY amount DESC) rn\n--   FROM orders\n-- ) WHERE rn=1;\n-- → QUALIFY ROW_NUMBER() OVER(...) = 1\n```\n\n### 用在哪\n\n1. **数仓建模 SQL**。\n2. **交互分析**。\n3. **跨引擎迁移**。\n\n### 注意啥\n\n- 慎用行式思维的逐行相关子查询。\n- 分区/聚类键决定扫描成本。\n- 时间函数与时区配置先对齐。",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    }
  ]
};

    const ML_KNOWLEDGE_TREE = {
  "id": "ml-root",
  "title": "机器学习/算法",
  "level": "?",
  "content": "### 机器学习任务地图\n\n再点中心展开任务扇区；进入「核心任务」章节后选择具体讲义。",
  "children": [
    {
      "id": "ml-tasks",
      "title": "核心任务",
      "level": "?",
      "content": "### 机器学习核心任务 · 章节导读\n\n**学习目标**：分清分类 / 预测 / 聚类 / 推荐 / 异常检测的适用边界。\n\n点下方子课进入各任务讲义。",
      "children": [
        {
          "id": "ml-classify",
          "title": "分类",
          "level": "??",
          "content": "### 是什么\n- **一句话定义**：根据已有标签，把样本分到离散类别（如作弊/正常、流失/留存）。\n- **核心要素**：特征 \\(X\\)、类别标签 \\(y\\)、分类器 \\(f(X)\\to y\\)、评估指标（准确率/精确率/召回/F1/AUC）。\n\n### 概念要点\n- **二分类 vs 多分类**：两个类或多于两个类；多分类可用 OvR 或原生多类模型。\n- **概率输出**：`predict_proba` 可设业务阈值，不必死用 0.5。\n- **类别不平衡**：少数类更重要时看 PR-AUC、F1，并考虑 class_weight / 重采样。\n\n### 怎么用\n```python\nimport pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import classification_report, roc_auc_score\n\n# 示例：用消费与活跃预测「是否次月留存」\ndf = pd.DataFrame({\n    \"pay_30d\": [120, 0, 80, 200, 15, 0, 90, 40],\n    \"active_days\": [20, 2, 12, 25, 5, 1, 18, 7],\n    \"retained\": [1, 0, 1, 1, 0, 0, 1, 0],\n})\nX = df[[\"pay_30d\", \"active_days\"]]\ny = df[\"retained\"]\nXtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, shuffle=False)\n\nclf = Pipeline([\n    (\"sc\", StandardScaler()),\n    (\"lr\", LogisticRegression(class_weight=\"balanced\", max_iter=1000)),\n])\nclf.fit(Xtr, ytr)\nproba = clf.predict_proba(Xte)[:, 1]\npred = (proba >= 0.5).astype(int)\nprint(classification_report(yte, pred))\nprint(\"AUC =\", roc_auc_score(yte, proba))\n```\n\n表格模型主力也可换：`HistGradientBoostingClassifier` / LightGBM / XGBoost。\n\n### 用在哪\n1. **风控审核**：交易是否欺诈 → 输出风险概率，驱动人工复核队列。\n2. **用户分层运营**：是否高意向转化 → 对高分人群发券。\n3. **内容审核**：文本/图像是否违规（常接深度学习分类器）。\n\n### 注意啥\n- **时间切分**：按时间划分训练/测试，禁止随机打乱造成穿越。\n- **阈值要贴业务**：召回优先还是精确率优先，决定阈值与成本。\n- **与聚类区别**：分类有标签；聚类无标签，只做分组。",
          "children": []
        },
        {
          "id": "ml-predict",
          "title": "预测",
          "level": "??",
          "content": "### 是什么\n- **一句话定义**：用历史特征估计未来连续值或事件结果（销量、时长、概率趋势等）。\n- **常见形态**：回归（连续值）、时序预测、生存/转化概率预测。\n\n### 概念要点\n- **回归**：\\(y\\in\\mathbb{R}\\)，指标 MAE / RMSE / MAPE。\n- **预测不等于因果**：模型拟合相关，上线策略要小心混淆因素。\n- **预测视界**：预测未来 1 天还是 30 天，特征可用截止时间必须对齐。\n\n### 怎么用\n```python\nimport numpy as np\nimport pandas as pd\nfrom sklearn.ensemble import GradientBoostingRegressor\nfrom sklearn.metrics import mean_absolute_error, mean_squared_error\n\n# 示例：用近7日销量与价格预测次日销量\nhist = pd.DataFrame({\n    \"sales_7d_avg\": [20, 22, 18, 30, 28, 25, 21, 35],\n    \"price\": [9.9, 9.9, 12.0, 8.5, 8.5, 10.0, 11.0, 7.9],\n    \"promo\": [0, 0, 0, 1, 1, 0, 0, 1],\n    \"sales_next\": [21, 19, 17, 40, 36, 24, 20, 44],\n})\nX = hist[[\"sales_7d_avg\", \"price\", \"promo\"]]\ny = hist[\"sales_next\"]\n# 时间序：前6训、后2测\nXtr, Xte, ytr, yte = X.iloc[:6], X.iloc[6:], y.iloc[:6], y.iloc[6:]\n\nreg = GradientBoostingRegressor(random_state=42)\nreg.fit(Xtr, ytr)\npred = reg.predict(Xte)\nprint(\"MAE\", mean_absolute_error(yte, pred))\nprint(\"RMSE\", mean_squared_error(yte, pred) ** 0.5)\nprint(list(np.round(pred, 2)))\n```\n\n时序场景可再学：Prophet、ARIMA、或仓内按日聚合后用树模型。\n\n### 用在哪\n1. **需求预测**：备货/运力，预测仓或 SKU 销量。\n2. **收入预测**：根据管道与季节性估计 GMV。\n3. **SLA / 耗时预测**：预估配送时长，驱动超时预警。\n\n### 注意啥\n- **泄漏**：特征里不能包含「预测时刻之后」才知道的信息。\n- **评估要对齐业务**：库存场景更关心高估/低估的不对称成本。\n- **与分类关系**：二分类概率也可视为「事件发生预测」，但指标与阈值策略不同。",
          "children": []
        },
        {
          "id": "ml-cluster",
          "title": "聚类",
          "level": "??",
          "content": "### 是什么\n- **一句话定义**：在无标签情况下，按相似度把样本自动分成若干组。\n- **目标**：组内相似、组间差异大，用于发现结构而非预测既定标签。\n\n### 概念要点\n- **K-Means**：指定 K，适合球状簇；对尺度敏感，需标准化。\n- **层次聚类 / DBSCAN**：不预知 K 或存在噪声时更合适。\n- **评估**：轮廓系数、业务可解释性（看每簇画像），无统一「准确率」。\n\n### 怎么用\n```python\nimport pandas as pd\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.cluster import KMeans\nfrom sklearn.metrics import silhouette_score\n\n# 示例：用户价值分群（RFM 简化）\nusers = pd.DataFrame({\n    \"recency_days\": [5, 40, 7, 60, 3, 90, 12, 55],\n    \"freq_90d\": [12, 2, 10, 1, 15, 1, 8, 2],\n    \"monetary\": [800, 50, 600, 30, 1200, 20, 450, 40],\n})\nX = StandardScaler().fit_transform(users)\nkm = KMeans(n_clusters=3, n_init=10, random_state=42)\nlabels = km.fit_predict(X)\nusers[\"cluster\"] = labels\nprint(users.groupby(\"cluster\")[[\"recency_days\", \"freq_90d\", \"monetary\"]].mean())\nprint(\"silhouette\", round(silhouette_score(X, labels), 3))\n```\n\n### 用在哪\n1. **用户分群运营**：高活高消 / 沉睡 / 新客，匹配不同策略。\n2. **商品/内容聚类**：相似品集合，支撑承接与排查。\n3. **异常初筛**：远离主簇的点进入人工核查（也可专用异常检测）。\n\n### 注意啥\n- **K 要业务可解释**：不要只看肘部法则，要能讲清每簇是谁。\n- **特征尺度**：金额与次数量纲不同，必须标准化。\n- **与分类区别**：聚类无标准答案；若已有标签应走分类。",
          "children": []
        },
        {
          "id": "ml-recommend",
          "title": "推荐",
          "level": "??",
          "content": "### 是什么\n- **一句话定义**：在海量候选中，为用户排序「下一步最可能感兴趣」的物品（商品/内容/广告）。\n- **经典链路**：召回（粗选几百）→ 排序（精排打分）→ 重排（打散/多样性/业务规则）。\n\n### 概念要点\n- **协同过滤**：人与人 / 物与物的行为相似。\n- **内容/画像**：用标签与属性推荐，冷启动更稳。\n- **排序学习**：用点击/转化当标签训练精排模型（树模型或深度模型）。\n- **评估**：离线 AUC/NDCG；在线 CTR、时长、GMV、留存做 A/B。\n\n### 怎么用\n```python\nimport pandas as pd\nfrom sklearn.metrics.pairwise import cosine_similarity\n\n# 示例：基于物品共现的简易协同（演示）\n# 用户-物品隐式反馈（是否点击）\nmatrix = pd.DataFrame(\n    [\n        [1, 1, 0, 0],\n        [1, 0, 1, 0],\n        [0, 1, 1, 0],\n        [0, 0, 1, 1],\n    ],\n    columns=[\"item_A\", \"item_B\", \"item_C\", \"item_D\"],\n    index=[\"u1\", \"u2\", \"u3\", \"u4\"],\n)\nsim = cosine_similarity(matrix.T)\nsim_df = pd.DataFrame(sim, index=matrix.columns, columns=matrix.columns)\nprint(\"物品相似度:\\n\", sim_df.round(2))\n\n# 用户 u1 已消费 A/B，对未消费 C 的推荐分 = 与已消费品相似度之和\nliked = [\"item_A\", \"item_B\"]\nscores = sim_df.loc[liked, [\"item_C\", \"item_D\"]].sum(axis=0).sort_values(ascending=False)\nprint(\"给 u1 的候选排序:\\n\", scores)\n```\n\n工业界精排常见：`LightGBM`/`深度学习排序` + 特征平台（用户/物品/交叉特征）。\n\n### 用在哪\n1. **电商首页/商详**：猜你喜欢、随手购。\n2. **内容 Feed**：短视频/图文分发。\n3. **交叉销售**：购物车「经常一起买」。\n\n### 注意啥\n- **反馈闭环**：只推热门会越来越窄，需要探索与打散。\n- **冷启动**：新用户/新物品要靠内容与热门兜底。\n- **业务约束**：库存、合规、品牌安全要在重排硬过滤。",
          "children": []
        },
        {
          "id": "ml-anomaly",
          "title": "异常检测",
          "level": "??",
          "content": "### 是什么\n- **一句话定义**：识别偏离正常模式的样本或时间点（欺诈、故障、刷量、指标突刺）。\n- **两种范式**：有少量标签的半监督/监督；无标签的无监督（孤立森林、统计阈值）。\n\n### 概念要点\n- **点异常 / 上下文异常 / 集体异常**：单点离谱、相对时段离谱、一群点共同离谱。\n- **阈值与告警**：检测要接到值班，控制误报率。\n- **解释**：业务要知道「为什么被打成异常」。\n\n### 怎么用\n```python\nimport numpy as np\nimport pandas as pd\nfrom sklearn.ensemble import IsolationForest\n\n# 示例：接口耗时异常点\nrng = np.random.default_rng(42)\nlatency = np.concatenate([rng.normal(120, 15, 80), [400, 520, 80, 600]])\nX = latency.reshape(-1, 1)\nclf = IsolationForest(contamination=0.05, random_state=42)\npred = clf.fit_predict(X)  # -1 异常，1 正常\nout = pd.DataFrame({\"latency_ms\": latency, \"is_outlier\": pred == -1})\nprint(out[out[\"is_outlier\"]].head(10))\nprint(\"异常占比\", out[\"is_outlier\"].mean())\n```\n\n指标类异常也可：同比/环比 + 3σ，或 Prophet 残差告警。\n\n### 用在哪\n1. **风控与反作弊**：异常登录、刷单。\n2. **数仓质量**：分区行数暴跌、空值率突增。\n3. **系统可观测**：延迟、错误率尖刺。\n\n### 注意啥\n- **污染率 contamination** 要按业务调，不是固定 5%。\n- **概念漂移**：大促期间「异常」可能是新常态，模型要重训或调阈值。\n- **与分类**：有可靠标签时，监督分类往往强于纯无监督。",
          "children": []
        }
      ],
      "lessonParent": true
    }
  ]
};

    const PYTHON_KNOWLEDGE_TREE = {
  "id": "python-root",
  "title": "Python",
  "level": "?",
  "content": "### Python 数据学习路径\n\n从读写表到可视化与脚本化清洗。再点中心展开领域。",
  "children": [
    {
      "id": "py-pandas",
      "title": "pandas 数据表",
      "level": "?",
      "content": "### pandas\n\n表格数据处理主力。",
      "children": [
        {
          "id": "py-io",
          "title": "读写与选型",
          "level": "?",
          "content": "### 读写与选型 · 章节导读\n\n掌握 CSV/Excel/SQL 读写与 dtypes。",
          "children": [
            {
              "id": "py-read-csv",
              "title": "read_csv",
              "level": "?",
              "content": "### 是什么\n\n- **一句话定义**：用 pandas 把平面文件读成 DataFrame。\n- **核心要素**：路径、分隔符、编码、dtype、parse_dates。\n\n### 怎么写\n\n```python\nimport pandas as pd\ndf = pd.read_csv('orders.csv', parse_dates=['created_at'])\nprint(df.dtypes)\nprint(df.head())\n```\n\n### 用在哪\n\n1. 探索分析起步\n2. ETL 落地前质检\n3. 报表取数脚本\n\n### 注意啥\n\n- 大文件用 chunksize\n- 先抽样再全量\n- 显式指定 dtype 防混型\n",
              "children": []
            },
            {
              "id": "py-to-sql",
              "title": "to_sql / read_sql",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：DataFrame 与数据库互转。\n- **核心要素**：SQLAlchemy engine、chunksize、if_exists。\n\n### 怎么写\n\n```python\nfrom sqlalchemy import create_engine\nimport pandas as pd\neng = create_engine('sqlite:///demo.db')\ndf = pd.read_sql('SELECT * FROM orders LIMIT 100', eng)\ndf.to_sql('orders_stg', eng, if_exists='replace', index=False)\n```\n\n### 用在哪\n\n1. 沙箱落表\n2. 指标回写\n3. 联表前拉维表\n\n### 注意啥\n\n- 生产写入注意权限与幂等\n- 分块写入防内存爆\n- 类型映射因引擎而异\n",
              "children": []
            }
          ],
          "lessonParent": true
        },
        {
          "id": "py-agg",
          "title": "清洗与聚合",
          "level": "??",
          "content": "### 清洗与聚合 · 章节导读\n\n过滤、缺失、groupby 是日常三板斧。",
          "children": [
            {
              "id": "py-group",
              "title": "groupby 聚合",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按键折叠行并聚合。\n- **核心要素**：by 键、agg 字典、reset_index。\n\n### 怎么写\n\n```python\ngmv = (\n  df[df.status=='paid']\n  .groupby('user_id', as_index=False)\n  .agg(gmv=('amount','sum'), orders=('order_id','count'))\n)\nprint(gmv.head())\n```\n\n### 用在哪\n\n1. 用户汇总\n2. 日报指标\n3. 训练样本标签表\n\n### 注意啥\n\n- 聚合前后核对行数\n- 多键 groupby 注意空值\n- 大数据优先下推到 SQL\n",
              "children": []
            },
            {
              "id": "py-na",
              "title": "缺失与类型",
              "level": "?",
              "content": "### 是什么\n\n- **一句话定义**：处理 NA 并校正类型，避免脏分析。\n- **核心要素**：isna、fillna、astype、to_datetime。\n\n### 怎么写\n\n```python\ndf['amount'] = pd.to_numeric(df['amount'], errors='coerce')\ndf['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')\ndf = df.dropna(subset=['user_id'])\ndf['channel'] = df['channel'].fillna('unknown')\n```\n\n### 用在哪\n\n1. 入模前清洗\n2. 报表口径统一\n3. 质检脚本\n\n### 注意啥\n\n- 不要盲目 dropna 全表\n- 填充要有业务含义\n- 时间时区要显式\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "py-viz",
      "title": "可视化入门",
      "level": "??",
      "content": "### 可视化\n\n用图讲清分布与趋势。",
      "children": [
        {
          "id": "py-plot",
          "title": "常用图",
          "level": "??",
          "content": "### 常用图 · 章节导读\n\n柱状/折线/分布是分析起步三件套。",
          "children": [
            {
              "id": "py-line",
              "title": "折线趋势",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：按时间展示指标走势。\n- **核心要素**：x 时间、y 指标、分组 hue。\n\n### 怎么写\n\n```python\nimport matplotlib.pyplot as plt\ndaily = df.groupby('dt')['gmv'].sum()\ndaily.plot(figsize=(8,3), title='Daily GMV')\nplt.tight_layout(); plt.show()\n```\n\n### 用在哪\n\n1. 日报复盘\n2. 异常尖刺定位\n3. 实验观察窗\n\n### 注意啥\n\n- 先聚合再画\n- 注意缺失日\n- 双轴慎用\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    }
  ]
};

    const ETL_KNOWLEDGE_TREE = {
  "id": "etl-root",
  "title": "ETL",
  "level": "?",
  "content": "### ETL / 数据集成\n\n抽取 → 转换 → 装载。再点中心展开。",
  "children": [
    {
      "id": "etl-batch",
      "title": "批次 ETL",
      "level": "?",
      "content": "### 批次 ETL\n\n按天/小时调度的经典管道。",
      "children": [
        {
          "id": "etl-pattern",
          "title": "常见模式",
          "level": "?",
          "content": "### 常见模式 · 章节导读\n\n全量、增量、拉链是三种底座。",
          "children": [
            {
              "id": "etl-incr",
              "title": "增量抽取",
              "level": "?",
              "content": "### 是什么\n\n- **一句话定义**：只拉取自上次成功以来的变化数据。\n- **核心要素**：水位线 watermark、业务时间、幂等写入。\n\n### 怎么写\n\n```sql\nSELECT *\nFROM ods.orders\nWHERE updated_at > TIMESTAMP '{{ prev_success }}'\n  AND updated_at <= TIMESTAMP '{{ data_interval_end }}';\n```\n\n### 用在哪\n\n1. 日更明细入仓\n2. 维表缓慢变化\n3. 下游重跑窗口\n\n### 注意啥\n\n- 时钟回拨与乱序\n- 软删要覆盖\n- 失败重跑必须幂等\n",
              "children": []
            },
            {
              "id": "etl-scd",
              "title": "SCD 拉链",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：保留维度历史版本（生效/失效时间）。\n- **核心要素**：surrogate key、valid_from/to、is_current。\n\n### 怎么写\n\n```sql\n-- 简化：关闭旧版 + 插入新版\nUPDATE dim_user SET valid_to = CURRENT_DATE, is_current = 0\nWHERE user_biz_id = :id AND is_current = 1;\nINSERT INTO dim_user (...)\nVALUES (..., CURRENT_DATE, DATE '9999-12-31', 1);\n```\n\n### 用在哪\n\n1. 用户属性历史\n2. 商品类目变更\n3. 组织架构演进\n\n### 注意啥\n\n- 业务键必须稳定\n- 同日多变要注意\n- 查询要带时间点\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "etl-quality",
      "title": "过程质量",
      "level": "??",
      "content": "### 过程质量\n\n装载前后校验，防止脏数据扩散。",
      "children": [
        {
          "id": "etl-checks",
          "title": "校验清单",
          "level": "??",
          "content": "### 校验清单 · 章节导读",
          "children": [
            {
              "id": "etl-rowcount",
              "title": "行数与空值",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：对比源/目标行数与关键空值率。\n- **核心要素**：count、null_rate、主键唯一。\n\n### 怎么写\n\n```sql\nSELECT COUNT(*) AS cnt,\n       AVG(user_id IS NULL) AS null_user\nFROM dwd.orders\nWHERE dt = '{{ ds }}';\n```\n\n### 用在哪\n\n1. 日任务门禁\n2. 回刷验证\n3. 事故定位\n\n### 注意啥\n\n- 阈值要按表分级\n- 只告警不阻断会堆债\n- 与分区裁剪一起看\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    }
  ]
};

    const DWH_KNOWLEDGE_TREE = {
  "id": "dwh-root",
  "title": "数据仓库",
  "level": "?",
  "content": "### 数据仓库\n\n分层、主题域与可复用指标底座。",
  "children": [
    {
      "id": "dwh-layer",
      "title": "数仓分层",
      "level": "?",
      "content": "### 数仓分层\n\nODS → DWD → DWS → ADS 的职责边界。",
      "children": [
        {
          "id": "dwh-layers",
          "title": "层级职责",
          "level": "?",
          "content": "### 层级职责 · 章节导读",
          "children": [
            {
              "id": "dwh-ods",
              "title": "ODS 贴源",
              "level": "?",
              "content": "### 是什么\n\n- **一句话定义**：尽量原样落入的操作数据层。\n- **核心要素**：保留源字段、分区、装载时间。\n\n### 怎么写\n\n```sql\nCREATE TABLE ods.orders_di (\n  order_id BIGINT, user_id BIGINT, amount DECIMAL(18,2),\n  status STRING, updated_at TIMESTAMP, dt STRING\n) PARTITIONED BY (dt);\n```\n\n### 用在哪\n\n1. 溯源对账\n2. 重跑原料\n3. 源系统变更缓冲\n\n### 注意啥\n\n- 不要在 ODS 做重业务加工\n- 敏感字段脱敏\n- 分区与生命周期\n",
              "children": []
            },
            {
              "id": "dwh-dwd",
              "title": "DWD 明细",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：清洗后的业务明细事实，统一口径字段。\n- **核心要素**：标准化码值、时区、主键、轻度维退化。\n\n### 怎么写\n\n```sql\nINSERT OVERWRITE TABLE dwd.trade_order_di PARTITION (dt='{{ ds }}')\nSELECT order_id, user_id, amount, status_code, created_at\nFROM ods.orders_di WHERE dt='{{ ds }}' AND is_deleted=0;\n```\n\n### 用在哪\n\n1. 分析取数底座\n2. 指标可回溯\n3. 特征明细来源\n\n### 注意啥\n\n- 粒度必须声明\n- 与维表关联键稳定\n- 避免过早宽表爆炸\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "dwh-model",
      "title": "主题与建模",
      "level": "??",
      "content": "### 主题与建模\n\n按业务过程建事实，按实体建维度。",
      "children": [
        {
          "id": "dwh-star",
          "title": "星型入门",
          "level": "??",
          "content": "### 星型入门 · 章节导读",
          "children": [
            {
              "id": "dwh-fact",
              "title": "事实表",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：记录业务过程的度量与外键。\n- **核心要素**：粒度、度量、退化维、分区。\n\n### 怎么写\n\n```sql\n-- 粒度：一笔支付\nSELECT pay_id, order_id, user_id, pay_amount, pay_at, dt\nFROM dwd.pay_di WHERE dt='{{ ds }}';\n```\n\n### 用在哪\n\n1. 交易主题\n2. 流量主题\n3. 履约主题\n\n### 注意啥\n\n- 先定粒度再加字段\n- 事实尽量瘦\n- 避免双计数\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    }
  ]
};

    const BI_KNOWLEDGE_TREE = {
  "id": "bi-root",
  "title": "BI",
  "level": "?",
  "content": "### BI / 可视化分析\n\n从指标到看板的表达与治理。",
  "children": [
    {
      "id": "bi-metric",
      "title": "指标设计",
      "level": "?",
      "content": "### 指标设计\n\n先定义口径，再绑可视化。",
      "children": [
        {
          "id": "bi-define",
          "title": "口径要素",
          "level": "?",
          "content": "### 口径要素 · 章节导读",
          "children": [
            {
              "id": "bi-atomic",
              "title": "原子指标",
              "level": "?",
              "content": "### 是什么\n\n- **一句话定义**：不可再拆的业务度量（如支付金额）。\n- **核心要素**：业务过程、度量字段、聚合方式。\n\n### 怎么写\n\n```sql\n-- 原子：支付金额\nSELECT SUM(pay_amount) AS pay_amt\nFROM dws.pay_1d\nWHERE dt BETWEEN '{{ start }}' AND '{{ end }}';\n```\n\n### 用在哪\n\n1. GMV/支付\n2. 订单量\n3. 活跃账号数\n\n### 注意啥\n\n- 聚合方式写进文档\n- 时区与删单规则\n- 与主题域 Owner 对齐\n",
              "children": []
            },
            {
              "id": "bi-derived",
              "title": "派生指标",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：在原子指标上加时间/修饰/运算。\n- **核心要素**：时间周期、业务限定、四则/比率。\n\n### 怎么写\n\n```sql\n-- 派生：近7日支付转化率\nSELECT pay_uv_7d * 1.0 / NULLIF(visit_uv_7d, 0) AS pay_cvr_7d\nFROM dws.traffic_pay_1d WHERE dt='{{ ds }}';\n```\n\n### 用在哪\n\n1. 转化率\n2. 客单价\n3. 留存率\n\n### 注意啥\n\n- 分母为 0\n- 修饰词要可枚举\n- 避免同名异义\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    },
    {
      "id": "bi-board",
      "title": "看板表达",
      "level": "??",
      "content": "### 看板表达\n\n一张看板只讲清一个决策问题。",
      "children": [
        {
          "id": "bi-layout",
          "title": "布局原则",
          "level": "??",
          "content": "### 布局原则 · 章节导读",
          "children": [
            {
              "id": "bi-northstar",
              "title": "北极星与下钻",
              "level": "??",
              "content": "### 是什么\n\n- **一句话定义**：顶栏放北极星，下方按维度下钻解释波动。\n- **核心要素**：主指标、对比、拆解维度、异常注释。\n\n### 怎么写\n\n```text\n布局：\n1) 顶：北极星 + 同比/环比\n2) 中：渠道/地区拆解\n3) 下：明细或漏斗\n交互：点维度 → 过滤全局\n```\n\n### 用在哪\n\n1. 经营周会\n2. 业务值班大屏\n3. 实验看版\n\n### 注意啥\n\n- 避免首屏堆满卡片\n- 过滤条件要可见\n- 口径角标常驻\n",
              "children": []
            }
          ],
          "lessonParent": true
        }
      ]
    }
  ]
};
console.log('kids', t.children.length);
t.children.forEach(c=>console.log('-', c.id, c.title, c.level));
