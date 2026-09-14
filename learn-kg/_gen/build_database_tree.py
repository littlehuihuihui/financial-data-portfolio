# -*- coding: utf-8 -*-
"""Build expanded database lesson tree → lessons/database.json and wire HTML."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PATCH = Path(__file__).resolve().parent / "patch_database_kg.py"
OUT = Path(__file__).resolve().parent / "lessons" / "database.json"
HTML = ROOT / "数据知识图谱.html"
INJECT = Path(__file__).resolve().parent / "inject_lessons.py"


def lesson(s: str) -> str:
    return s.strip()


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="sql"):
    fence = "sql" if lang == "sql" else lang
    return lesson(
        f"""
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
"""
    )


def load_base_tree() -> dict:
    """Exec patch helpers + DB_TREE without touching HTML I/O."""
    src = PATCH.read_text(encoding="utf-8")
    cut = src.find("\ndef extract_object")
    if cut < 0:
        raise SystemExit("cannot find extract_object cut in patch")
    # Drop Path/html read at top; keep imports + lesson/gold/DB_* 
    start = src.find("\ndef lesson")
    if start < 0:
        raise SystemExit("cannot find def lesson")
    preamble = "from __future__ import annotations\n\n" + src[start:cut]
    ns: dict = {}
    exec(compile(preamble, str(PATCH), "exec"), ns, ns)
    tree = ns.get("DB_TREE")
    if not isinstance(tree, dict):
        raise SystemExit("DB_TREE not loaded")
    return json.loads(json.dumps(tree))  # deep copy via JSON


def find_node(n: dict, eid: str):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find_node(c, eid)
        if hit:
            return hit
    return None


def L(id_, title, level, content):
    return {"id": id_, "title": title, "level": level, "content": content.strip() + "\n", "children": []}


def C(id_, title, level, intro, children):
    return {
        "id": id_,
        "title": title,
        "level": level,
        "content": intro.strip() + "\n",
        "lessonParent": True,
        "children": children,
    }


def expand(tree: dict) -> dict:
    """Add missing leaves / chapters while keeping broad→narrow."""

    # --- 学习路径：补中高级练习 + 更新清单 ---
    practice = find_node(tree, "db-practice-field")
    assert practice is not None
    practice["children"].extend(
        [
            L(
                "db-drill-mid",
                "中级练习",
                "??",
                gold(
                    "隔离、锁顺序、读写分离策略要能讲清并小实验。",
                    "完成隔离可见性观察、死锁预防改写、读主/读从清单。",
                    "中级清单叶子",
                    "统一四表；建议开两个 SQL 会话。",
                    "- **练习场（中级）**：并发与运维直觉。",
                    """-- Q1 查看/设置隔离（MySQL）
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Q2 按主键升序加锁，改写双边更新（防死锁）
START TRANSACTION;
  UPDATE orders SET amount=amount WHERE order_id IN (101,105) ORDER BY order_id;
COMMIT;

-- Q3 列出必须读主的 3 个接口（支付结果/余额/库存扣减确认）
-- 思考题，写在笔记""",
                    "| 题 | 要点 |\n|---|---|\n| Q2 | 两侧统一升序 |\n| Q3 | 写后读一致要读主 |",
                    "1. 中级结业  2. 与 SQL 隔离金课互证",
                    "| 错法 | 纠正 |\n|---|---|\n| 锁顺序随输入 | 排序主键 |\n| 写后读从 | 关键读主 |",
                    "用双会话演示 RC 下不可重复读是否出现（对照 RR）。",
                ),
            ),
            L(
                "db-drill-senior",
                "高级练习",
                "???",
                gold(
                    "按负载给订单真相、会话缓存、明细看板选引擎。",
                    "输出一页选型说明 + 同步链路草图。",
                    "高级清单 / 多引擎叶子",
                    "统一样例放大想象。",
                    "- **练习场（高级）**：多引擎与容量。",
                    """-- 真相：MySQL/PG orders
-- 缓存：Redis order:{id}:status TTL
-- 看板：同步 → ClickHouse 日聚合

-- 验收问题：
-- 1) 误删谁能救？复制够不够？
-- 2) 缓存与 DB 不一致时以谁为准？
-- 3) CH 能否承接支付扣款？""",
                    "| 题 | 期望 |\n|---|---|\n| 1 | 要真备份 |\n| 2 | DB 权威 |\n| 3 | 否，OLTP 仍关系库 |",
                    "1. 架构评审  2. 高级结业",
                    "| 错法 | 纠正 |\n|---|---|\n| Redis 当账本 | DB 权威 |\n| CH 当主库 | 分析副本/仓 |",
                    "补画：下单→binlog/CDC→CH→看板，标出 RPO。",
                ),
            ),
        ]
    )

    path_mid = find_node(tree, "db-path-mid")
    path_mid["content"] = lesson(
        """
### 课前

- **定位**：隔离级别、异常读、锁与死锁、WAL/MVCC 直觉、复制与备份、方言差异。
- **先修**：初级清单

### 建议顺序

```text
1. 隔离级别要点 → 2. 异常读现象
3. 行锁与死锁 → 4. WAL 与持久化 → 5. MVCC 直觉
6. 覆盖索引 / 索引失效 → 7. 统计信息
8. 复制与读写分离 → 9. 备份与恢复
10. MySQL 与 PostgreSQL → 11. 中级练习
```
"""
    )

    path_senior = find_node(tree, "db-path-senior")
    path_senior["content"] = lesson(
        """
### 课前

- **定位**：连接池与容量、分区表、多引擎（Redis/Mongo/CH/ES/向量）、高级练习。
- **注意**：生产变更与压测只在测试环境做。

### 建议顺序

```text
1. 连接池直觉 → 2. 分区表直觉
3. Redis → 4. 文档模型 → 5. 列存 OLAP
6. Elasticsearch → 7. 向量检索直觉
8. 高级练习
```
"""
    )

    # --- 核心概念：持久化内核 + 表约束加叶 ---
    concepts = find_node(tree, "db-concepts")
    schema = find_node(tree, "db-schema")
    schema["children"].extend(
        [
            L(
                "db-datatypes",
                "类型与精度",
                "?",
                gold(
                    "金额用 FLOAT，对账总差一分钱。",
                    "会为金额/时间/字符串选合适类型。",
                    "主键与约束 → 下一课：外键取舍",
                    "orders.amount / status / created_at。",
                    "- **DECIMAL**：金额精确十进制。\n- **INT/BIGINT**：代理键。\n- **时间**：TIMESTAMP/TIMESTAMPTZ 注意时区。\n- **避免**：FLOAT/DOUBLE 做钱。",
                    """-- 推荐
-- amount DECIMAL(10,2)
-- 反例：FLOAT 累加误差

SELECT SUM(amount) FROM orders WHERE status='paid';
-- 生产用 DECIMAL 保证分位稳定""",
                    "样例库若已是 DECIMAL，SUM 稳定；FLOAT 会现毛刺。",
                    "1. 建模规范  2. 对账  3. 迁移评审",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 钱用 FLOAT | 对不齐 | DECIMAL |\n| 过短 VARCHAR | 截断 | 按业务留余量 |",
                    "解释 `status` 用 ENUM 还是 VARCHAR 的取舍。",
                ),
            ),
            L(
                "db-fk-tradeoff",
                "外键取舍",
                "??",
                gold(
                    "OLTP 要不要强制 `orders.user_id → users`？数仓为何常去掉外键？",
                    "能说明外键的完整性收益与批量装载代价。",
                    "类型与精度 → 索引章",
                    "统一样例逻辑外键。",
                    "- **外键**：数据库强制引用完整。\n- **OLTP**：常保留，防脏引用。\n- **数仓/批量**：常取消，改质量校验，避免装载锁与顺序束缚。",
                    """-- OLTP 示意
-- ALTER TABLE orders ADD CONSTRAINT fk_user
--   FOREIGN KEY (user_id) REFERENCES users(user_id);

-- 数仓替代：装载后跑
SELECT COUNT(*) FROM orders o
LEFT JOIN users u ON u.user_id=o.user_id
WHERE u.user_id IS NULL;""",
                    "孤儿订单计数应为 0（样例满足）。",
                    "1. 建模评审  2. ETL 装载  3. 多系统同步",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 仓表硬套外键 | 装载极慢 | 校验任务 |\n| OLTP 全靠应用 | 脚本脏写 | 关键路径加 FK |",
                    "给「支付库」和「ADS 日报表」分别选择：保留 FK / 校验替代。",
                ),
            ),
        ]
    )

    concepts["children"].append(
        C(
            "db-persistence",
            "持久化与并发内核",
            "??",
            "### 持久化与并发内核 · 章节导读\n\nWAL、MVCC、缓冲池——理解「提交为何不丢、读为何不堵」。",
            [
                L(
                    "db-wal",
                    "WAL 与持久化",
                    "??",
                    gold(
                        "进程崩溃后，已 COMMIT 的支付还在吗？",
                        "建立 WAL（预写日志）→ 刷盘 → 崩溃恢复的直觉。",
                        "ACID 持久性 → 下一课：MVCC",
                        "概念课；对照事务提交。",
                        "- **WAL**：先记日志再落数据页（或按引擎策略）。\n- **提交**：保证日志持久后才对客户端返回成功。\n- **恢复**：重启用日志重放/回滚未完成事务。",
                        """-- 思考实验（勿在生产关盘）
START TRANSACTION;
  UPDATE orders SET status='paid' WHERE order_id=104;
COMMIT;
-- 若 COMMIT 返回后立刻断电：恢复后 104 仍应为 paid

-- 对照：未 COMMIT 的更改恢复后消失""",
                        "已提交必须在；未提交必须不在——这是 Durability + Atomicity。",
                        "1. 事故复盘  2. 同步/复制原理  3. 性能（刷盘策略）",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 以为写内存即安全 | 掉电丢数 | 理解刷盘/WAL |\n| 随意关 fsync | 假提交 | 清楚 RPO 代价 |",
                        "用自己的话解释：复制延迟与 WAL 的关系。",
                    ),
                ),
                L(
                    "db-mvcc",
                    "MVCC 直觉",
                    "???",
                    gold(
                        "写订单时，报表会话为何还能读到一致快照？",
                        "理解多版本并发：读不阻塞写的常见实现思路。",
                        "WAL → 下一课：缓冲池",
                        "双会话：一写一读。",
                        "- **MVCC**：行保留多版本，读看快照。\n- **收益**：普通 SELECT 少阻塞写。\n- **代价**：版本链、清理（vacuum/purge）。",
                        """-- 会话 R：长时间只读事务
START TRANSACTION;
  SELECT SUM(amount) FROM orders WHERE status='paid';
  -- 保持未提交，观察写会话更新后本快照是否不变（视隔离）

-- 会话 W：
UPDATE orders SET amount=81 WHERE order_id=101;
COMMIT;""",
                        "RC/RR 下可见性不同；重点建立「版本/快照」词汇。",
                        "1. 长报表  2. 高并发点更  3. 与锁模型对比",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 长事务不关 | 版本堆积 | 缩短只读事务 |\n| 当成无锁 | 写写仍可能锁 | 区分读写 |",
                        "对照隔离课：RR 与快照读的关系（按引擎文档）。",
                    ),
                ),
                L(
                    "db-buffer-pool",
                    "缓冲池与脏页",
                    "??",
                    gold(
                        "为什么刚写完的热点行第二次读特别快？宕机又如何不丢？",
                        "建立缓冲池、脏页、刷盘与 WAL 的分工。",
                        "MVCC → 索引章",
                        "概念课。",
                        "- **缓冲池**：内存中的页缓存。\n- **脏页**：内存已改、磁盘未跟上的页。\n- **安全**：靠 WAL；性能：靠缓存命中。",
                        """-- 观察类（引擎各异）
-- MySQL: SHOW ENGINE INNODB STATUS\\G  -- 缓冲/日志片段
-- 业务直觉：热点 order_id 点查命中内存；冷历史扫盘""",
                        "思维模型：读多命中缓存；提交先保证日志。",
                        "1. 容量规划  2. 慢查询冷热分析  3. 参数调优入门",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只加内存不看命中 | 浪费 | 看命中率/慢查询 |\n| 忽略检查点 | 恢复很久 | 了解 checkpoint |",
                        "画出：UPDATE → 缓冲池脏页 → WAL → 刷脏 的顺序。",
                    ),
                ),
            ],
        )
    )

    # --- 索引章加叶 ---
    index_sec = find_node(tree, "db-index-sec")
    index_sec["children"].extend(
        [
            L(
                "db-covering-index",
                "覆盖索引",
                "??",
                gold(
                    "列表只要 order_id/amount，能否不回表？",
                    "理解覆盖索引：索引叶子已含所需列。",
                    "EXPLAIN 直觉 → 下一课：索引失效",
                    "orders (status, created_at, …)。",
                    "- **回表**：索引定位后再回聚簇/堆取整行。\n- **覆盖**：查询列都在索引内，免回表。",
                    """-- 组合索引若包含投影列更易覆盖（示意）
-- CREATE INDEX idx_paid_list ON orders (status, created_at, order_id, amount);

EXPLAIN
SELECT order_id, amount, created_at
FROM orders
WHERE status='paid'
ORDER BY created_at DESC
LIMIT 5;""",
                    "关注 Extra 是否 Using index（视引擎与索引是否覆盖）。",
                    "1. 热点列表  2. 计数优化  3. 与宽表权衡",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 索引塞过多列 | 写放大 | 只盖高频查询 |\n| SELECT * | 难覆盖 | 列清单最小化 |",
                    "为 `WHERE user_id=? AND status=?` 设计覆盖索引列。",
                ),
            ),
            L(
                "db-index-fail",
                "索引失效常见因",
                "??",
                gold(
                    "明明建了索引，EXPLAIN 仍 type=ALL。",
                    "识别函数包裹、隐式转换、左右模糊、低选择性等失效因。",
                    "覆盖索引 → 下一课：统计信息",
                    "orders.status / created_at。",
                    "- **失效常见**：对列套函数；类型不一致；`LIKE '%xx'`；优化器估行不准。\n- **选择性**：区分度太低可能宁扫表。",
                    """-- 反例：函数包裹列
EXPLAIN SELECT * FROM orders
WHERE DATE(created_at)='2024-01-01';

-- 正例：范围
EXPLAIN SELECT * FROM orders
WHERE created_at>='2024-01-01' AND created_at<'2024-01-02';

-- 反例：隐式转换（status 数字 vs 字符串视定义）
-- WHERE status=0 而 status 为 VARCHAR""",
                    "范围写法更容易用上 (created_at) 或组合索引。",
                    "1. 慢 SQL 首诊  2. 代码生成 SQL 审查",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| DATE(col) | 索引废 | 改范围 |\n| 前导模糊 LIKE | 难用 BTree | 搜索引擎/后缀结构 |",
                    "检查业务里三条最热 SQL 是否对列套了函数。",
                ),
            ),
            L(
                "db-stats",
                "统计信息直觉",
                "???",
                gold(
                    "数据量暴涨后计划突变，以前走索引现在全表扫。",
                    "知道优化器依赖统计信息；过期统计会选错计划。",
                    "索引失效 → 事务章",
                    "概念 + 引擎命令示意。",
                    "- **统计信息**：表行数、直方图、索引基数等。\n- **过期**：导入大批数据后未更新 → 误估。\n- **动作**：ANALYZE / 自动收集。",
                    """-- PostgreSQL
-- ANALYZE orders;
-- MySQL
-- ANALYZE TABLE orders;

EXPLAIN SELECT * FROM orders WHERE status='paid';""",
                    "ANALYZE 后计划可能变化；样例数据太小，重在流程。",
                    "1. 大导入后  2. 版本升级后  3. 计划回归",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 从不分析 | 计划漂移 | 纳入变更清单 |\n| 盲目 hint | 掩耳盗铃 | 先修统计与 SQL |",
                    "把 ANALYZE 写进「大导入 Runbook」检查项。",
                ),
            ),
        ]
    )

    # --- 事务：异常读 ---
    txn_basic = find_node(tree, "db-txn-basic")
    txn_basic["children"].append(
        L(
            "db-anomaly-reads",
            "脏读不可重复读幻读",
            "???",
            gold(
                "并发下报表数字跳动，或读到别的事务未提交值。",
                "能指认三种读异常，并知道用哪档隔离缓解。",
                "隔离级别要点 → 行锁",
                "双会话实验（引擎默认不同）。",
                "- **脏读**：读到未提交。\n- **不可重复读**：同事务两次读同行变化。\n- **幻读**：同条件多次读行集合变化。\n- **映射**：RU 可脏读；RC 防脏读；RR/Serializable 加强。",
                """-- 会话 A
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; -- 演示用，生产禁止
START TRANSACTION;
  SELECT amount FROM orders WHERE order_id=101;

-- 会话 B：未提交改
START TRANSACTION;
  UPDATE orders SET amount=999 WHERE order_id=101;
-- 回到 A 再 SELECT：RU 可能见 999；提交/回滚后再对比""",
                "理解「现象→隔离」表，不必死记每个引擎细节。",
                "1. 事故定性  2. 选型默认隔离  3. 接 SQL 金课",
                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 生产 RU | 脏读 | 禁止 |\n| 混淆三种异常 | 开错隔离 | 对照表 |",
                "画表：异常 × RU/RC/RR/S 是否可能。",
            ),
        )
    )

    # --- 运维：连接池、分区 ---
    ops = find_node(tree, "db-ops")
    ops["children"].append(
        C(
            "db-capacity",
            "容量与结构",
            "???",
            "### 容量与结构 · 章节导读\n\n连接池与分区——撑住并发与数据量。",
            [
                L(
                    "db-connection-pool",
                    "连接池直觉",
                    "??",
                    gold(
                        "流量一高，数据库报 too many connections。",
                        "理解连接昂贵；应用侧池化与超时。",
                        "备份 → 下一课：分区表",
                        "概念课。",
                        "- **连接**：内存与会话状态成本高。\n- **池**：复用连接，限制上限。\n- **要点**：超时、空闲回收、与 DB max_connections 匹配。",
                        """-- 观察（MySQL）
SHOW VARIABLES LIKE 'max_connections';
SHOW STATUS LIKE 'Threads_connected';

-- 应用侧（示意）：pool_size=20, max_overflow=10, wait_timeout=30s""",
                        "Threads_connected 应远低于盲目「开无限连接」。",
                        "1. 微服务  2. Serverless 冷启  3. 压测",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 每请求新建连接 | 打满 | 池化 |\n| 池无限大 | 拖垮 DB | 限流+排队 |",
                        "估算：QPS 200、事务 50ms，池大概多少连接？",
                    ),
                ),
                L(
                    "db-partition-table",
                    "分区表直觉",
                    "???",
                    gold(
                        "订单按日上亿，删除/查询历史要快。",
                        "理解分区裁剪：大表按范围/列表拆分子表。",
                        "连接池 → 多引擎章",
                        "想象 orders 按 created_at 日分区。",
                        "- **分区**：物理拆分，逻辑仍一张表。\n- **裁剪**：WHERE 命中分区键则少扫。\n- **维护**：丢旧分区 ≈ 快删。",
                        """-- 概念示意（语法引擎各异）
-- CREATE TABLE orders_p (...) PARTITION BY RANGE (TO_DAYS(created_at)) ...

EXPLAIN SELECT SUM(amount) FROM orders
WHERE created_at>='2024-01-01' AND created_at<'2024-01-02' AND status='paid';
-- 期望：只扫相关分区（大表时）""",
                        "无分区键条件 → 可能扫全部分区。",
                        "1. 日志/订单明细  2. 生命周期管理  3. 与仓分区呼应",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 分区键不在过滤 | 全部分区扫 | 查询带分区键 |\n| 分区过细 | 元数据炸 | 按天/月适中 |",
                        "为统一样例设计：若数据保留 180 天，分区粒度选日还是月？",
                    ),
                ),
            ],
        )
    )

    # --- 多引擎：ES + 向量 ---
    engines = find_node(tree, "db-engines")
    engines["children"].extend(
        [
            L(
                "db-elasticsearch",
                "Elasticsearch 检索",
                "???",
                gold(
                    "要按商品标题关键词搜索并聚合，关系库 LIKE 很痛。",
                    "知道 ES 擅长全文检索与日志分析；不是事务库。",
                    "列存 OLAP → 下一课：向量检索",
                    "把订单备注/商品名想象成文档。",
                    "- **定位**：倒排索引，搜索与日志分析。\n- **适合**：全文、筛选聚合、可观测日志。\n- **不适合**：强事务账本。",
                    """// 示意
// PUT orders/_doc/101 { "order_id":101, "note":"急件 上海", "status":"paid" }
// GET orders/_search { "query": { "match": { "note": "急件" } } }""",
                    "匹配含「急件」的文档；真相订单状态仍以 OLTP 为准。",
                    "1. 站内搜  2. 日志检索  3. 运营筛选",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| ES 当唯一订单库 | 一致/事务弱 | OLTP+同步 |\n| 无映射乱刷 | 性能差 | 设计 mapping |",
                    "写出：订单状态以谁为准，ES 文档如何同步？",
                    "javascript",
                ),
            ),
            L(
                "db-vector",
                "向量检索直觉",
                "???",
                gold(
                    "要用「语义相似」找相关工单/商品，关键词对不上。",
                    "理解向量库/ANN：嵌入向量近似最近邻；可与 PG(pgvector)/Milvus 等落地。",
                    "Elasticsearch → 高级练习",
                    "概念课；与百科引擎卡片对照。",
                    "- **嵌入**：文本/图像 → 高维向量。\n- **ANN**：近似最近邻召回。\n- **形态**：专用库（Milvus）或 PG 扩展（pgvector）。",
                    """-- pgvector 示意
-- CREATE EXTENSION vector;
-- CREATE TABLE items(id INT, embedding vector(768));
-- SELECT id FROM items ORDER BY embedding <-> :q LIMIT 10;

-- Milvus：collection + 相似度搜索（见引擎卡片）""",
                    "返回与查询向量最接近的 TopK；业务仍要回表取属性。",
                    "1. 语义搜索  2. 推荐召回  3. RAG",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 当唯一真相库 | 缺事务/约束 | 属性回 OLTP |\n| 维度/度量混乱 | 结果差 | 统一模型与距离 |",
                    "判断：支付扣款 vs 相似商品召回，各用哪类引擎？",
                ),
            ),
        ]
    )

    # refresh root content slightly
    tree["content"] = lesson(
        """
### 数据库知识图谱

四层：**领域 → 主题 → 知识点**（由大到小）。

1. 先打开 **学习路径 → 教程宪法**，建与 SQL 同源样例库  
2. 弄清 OLTP/OLAP、ACID、WAL/MVCC，再学索引与事务  
3. 复制备份与容量结构后，做多引擎选型（关系/缓存/文档/列存/检索/向量）

交互：再点中心展开领域；叶子打开讲义。
"""
    )
    return tree


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    kids = n.get("children") or []
    if not kids:
        acc.append(n["id"])
    for c in kids:
        walk_leaves(c, acc)
    return acc


def patch_inject_script():
    text = INJECT.read_text(encoding="utf-8")
    if '"database"' in text and "DATABASE_KNOWLEDGE_TREE" in text:
        print("inject_lessons already has database")
        return
    text = text.replace(
        'ORDER = ["sql", "ml", "python", "etl", "dwh", "bi"]',
        'ORDER = ["sql", "python", "database", "ml", "etl", "dwh", "bi"]',
    )
    text = text.replace(
        """VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}""",
        """VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "database": "DATABASE_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}""",
    )
    INJECT.write_text(text, encoding="utf-8")
    print("updated inject_lessons.py")


def wire_html_extras(html: str) -> str:
    """prefer jump / DB_SAMPLE / sectors / hot entries if missing."""
    # prefer
    if 'hub === "database" ? "db-constitution"' not in html:
        old = """            const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution" : null;"""
        new = """            const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution" : null;"""
        if old in html:
            html = html.replace(old, new, 1)
            print("wired prefer db-constitution")
        else:
            # try looser
            m = re.search(
                r'const prefer = hub === "sql" \? "sql-constitution"\s*;?\s*'
                r'(?:\n\s*: hub === "python" \? "py-constitution"\s*)?'
                r'(?:\n\s*: hub === "python" \? "py-constitution" : null;)?',
                html,
            )
            # fallback replace null pattern
            old2 = ': hub === "python" ? "py-constitution" : null;'
            new2 = ': hub === "python" ? "py-constitution"\n              : hub === "database" ? "db-constitution" : null;'
            if old2 in html and 'hub === "database"' not in html[html.find("const prefer") : html.find("const prefer") + 250]:
                html = html.replace(old2, new2, 1)
                print("wired prefer (loose)")
            else:
                print("WARN prefer pattern not found")

    if "const DB_SAMPLE" not in html:
        sample = {
            "tables": ["users", "orders", "order_events", "order_items"],
            "sharedWith": "SQL_SAMPLE",
            "constitutionId": "db-constitution",
            "hubId": "database",
        }
        blob = "    const DB_SAMPLE = " + json.dumps(sample, ensure_ascii=False, indent=2) + ";\n\n"
        if "const SQL_SAMPLE = " in html:
            html = html.replace("const SQL_SAMPLE = ", blob + "    const SQL_SAMPLE = ", 1)
            print("wired DB_SAMPLE")
        else:
            print("WARN SQL_SAMPLE missing")

    # sector map snippets
    needle = '"db-learning-path": "practice"'
    if needle not in html:
        anchor = '"py-constitution": "practice",'
        add = (
            '"py-constitution": "practice",\n'
            '      "db-learning-path": "practice", "db-concepts": "foundation", "db-access": "advanced",\n'
            '      "db-txn": "advanced", "db-ops": "practice", "db-polyglot": "practice",\n'
            '      "db-oltp-olap": "foundation", "db-acid": "foundation", "db-btree-index": "advanced",\n'
            '      "db-constitution": "practice", "db-wal": "advanced", "db-mvcc": "advanced",\n'
            '      "db-vector": "practice",'
        )
        if anchor in html:
            html = html.replace(anchor, add, 1)
            print("wired KG_SECTOR_BY_ID db keys")
        else:
            print("WARN sector anchor missing")

    # hot entries
    if '{ hub: "database", label: "数据库" }' not in html:
        old_hot = '{ hub: "python", label: "Python" },'
        new_hot = '{ hub: "python", label: "Python" },\n        { hub: "database", label: "数据库" },'
        if old_hot in html:
            html = html.replace(old_hot, new_hot, 1)
            print("wired hot database")

    return html


def main():
    base = load_base_tree()
    tree = expand(base)
    OUT.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
    leaves = walk_leaves(tree)
    domains = len(tree.get("children") or [])
    print(f"wrote {OUT} domains={domains} leaves={len(leaves)}")

    patch_inject_script()

    # run inject
    import runpy

    runpy.run_path(str(INJECT), run_name="__main__")

    html = HTML.read_text(encoding="utf-8")
    html = wire_html_extras(html)
    HTML.write_text(html, encoding="utf-8")

    html2 = HTML.read_text(encoding="utf-8")
    assert "const DATABASE_KNOWLEDGE_TREE" in html2
    assert "database: DATABASE_KNOWLEDGE_TREE" in html2
    assert "db-wal" in html2 and "db-vector" in html2
    assert "db-constitution" in html2
    print("VALIDATED: database tree mounted, expanded leaves present")
    print("sample leaves:", ", ".join(leaves[:8]), "...", f"total {len(leaves)}")


if __name__ == "__main__":
    main()
