# -*- coding: utf-8 -*-
"""SQL Layered Learning Graph v2.0 — 8 topics × 3 levels."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "sql_layered_learning_graph_v2.json"
SUMMARY = ROOT / "sql_layered_learning_graph_v2.SUMMARY.md"

TOPICS = ["SELECT", "WHERE", "JOIN", "GROUP BY", "子查询", "窗口函数", "索引", "事务"]
LEVELS = ["Low", "Mid", "High"]

# topic -> level -> content
CONTENT = {
    "SELECT": {
        "Low": {
            "title": "SELECT：从一张表里取出你要的列",
            "description": "SELECT 是查询的起点，用来声明「要看哪些列、来自哪张表」。初级只需要掌握选列、别名和 LIMIT，能独立完成单表取数。",
            "key_points": [
                "写法：SELECT 列名 FROM 表名",
                "可用 * 选全部列，但练习时尽量写明确列名",
                "AS 给列起别名；LIMIT 限制返回行数便于预览",
            ],
            "example": "SELECT order_id, amount AS gmv FROM orders LIMIT 20;",
            "mastery_criteria": "能写出指定列、带别名和 LIMIT 的单表查询",
            "prerequisites": [],
        },
        "Mid": {
            "title": "SELECT：投影、表达式与可读结果集设计",
            "description": "在会写基础 SELECT 之后，要会选投影策略：何时用表达式列、DISTINCT、CASE 分桶，并设计下游可读的结果集列契约。",
            "key_points": [
                "投影可含表达式：amount * 1.0、CONCAT、日期截断",
                "DISTINCT 去重，但成本高，需明确去重粒度",
                "CASE WHEN 做条件度量与分档；列名稳定便于对接 BI",
            ],
            "example": "SELECT user_id, CASE WHEN amount >= 100 THEN 'H' ELSE 'L' END AS tier FROM orders;",
            "mastery_criteria": "能为分析需求设计清晰投影，正确使用 DISTINCT/CASE/表达式",
            "prerequisites": [],
        },
        "High": {
            "title": "SELECT：投影下推、列裁剪与执行代价",
            "description": "从引擎视角理解 SELECT 列表如何影响列裁剪、物化与网络传输；避免 SELECT *，掌握投影下推与宽表扫描的性能含义，并用计划验证优化效果。",
            "key_points": [
                "列存/宽表场景下少选列可显著降 IO",
                "SELECT * 阻碍列裁剪，契约也不稳定",
                "复杂表达式可能阻止下推，需用 EXPLAIN 验证",
            ],
            "example": "EXPLAIN SELECT order_id, amount FROM orders WHERE status = 'paid';  -- 对比 SELECT *",
            "mastery_criteria": "能用执行计划判断投影是否成为瓶颈，并提出改写",
            "prerequisites": ["High.索引"],
        },
    },
    "WHERE": {
        "Low": {
            "title": "WHERE：用条件筛出你要的行",
            "description": "WHERE 用来声明「保留哪些行」。初级要会写比较与逻辑组合，能完成按状态、时间、金额的简单筛选。",
            "key_points": [
                "比较：=、<、>、BETWEEN、IN、LIKE",
                "组合：AND / OR，注意括号优先级",
                "NULL 不能用 =，要用 IS NULL / IS NOT NULL",
            ],
            "example": "SELECT * FROM orders WHERE status = 'paid' AND amount >= 100;",
            "mastery_criteria": "能独立写出多条件 AND/OR 的单表筛选",
            "prerequisites": ["Low.SELECT"],
        },
        "Mid": {
            "title": "WHERE：谓词设计、可选择性与语义陷阱",
            "description": "中级不仅会写条件，还要会选「过滤时机与写法」：高选择性谓词前置、避免隐式转换，并分清 WHERE（聚合前）与 HAVING（聚合后）。",
            "key_points": [
                "先过滤再关联/聚合，减少中间结果",
                "对列包函数（如 DATE(col)）常导致索引失效",
                "OR / 非等值条件可能改变优化器路径",
            ],
            "example": "SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';",
            "mastery_criteria": "能改写有利于索引的时间范围条件，并解释 WHERE vs HAVING",
            "prerequisites": ["Mid.SELECT", "Mid.GROUP BY"],
        },
        "High": {
            "title": "WHERE：谓词下推、裁剪与优化器选择",
            "description": "理解谓词下推、分区裁剪与统计信息如何决定过滤路径；能识别「条件写对了但跑很慢」的计划层原因并优化。",
            "key_points": [
                "分区键/排序键对齐过滤可触发裁剪",
                "可下推谓词 vs 必须后置过滤",
                "选择性估计错误会导致错误索引或全表扫",
            ],
            "example": "EXPLAIN SELECT * FROM orders WHERE toDate(created_at) = today();  -- 常无法裁剪，应改范围",
            "mastery_criteria": "能结合 EXPLAIN 判断谓词是否下推/裁剪，并给出改写",
            "prerequisites": ["High.SELECT", "High.索引"],
        },
    },
    "JOIN": {
        "Low": {
            "title": "JOIN：把两张表拼起来",
            "description": "JOIN 用于把分散在多张表里的数据按某个共同字段拼成一张宽表。初学者只需要掌握 INNER JOIN 的写法。",
            "key_points": [
                "两张表通过 ON 后面的条件关联",
                "INNER JOIN 只保留两边都匹配的行",
                "语法：SELECT ... FROM a INNER JOIN b ON a.id = b.id",
            ],
            "example": "SELECT u.name, o.amount FROM users u INNER JOIN orders o ON u.id = o.user_id;",
            "mastery_criteria": "能写出两表 INNER JOIN 查询",
            "prerequisites": ["Low.SELECT", "Low.WHERE"],
        },
        "Mid": {
            "title": "JOIN：五种连接类型与选择",
            "description": "在 INNER JOIN 基础上，理解 LEFT/RIGHT/FULL/CROSS JOIN 的语义差异，能根据业务需求选择正确的连接类型。",
            "key_points": [
                "LEFT JOIN 保留左表全部行，右表无匹配则填 NULL",
                "FULL JOIN 保留两边全部行",
                "CROSS JOIN 产生笛卡尔积，慎用",
                "自连接用于处理层级或对比期数据",
            ],
            "example": "SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name;",
            "mastery_criteria": "能根据业务场景选择正确的 JOIN 类型，能解释 NULL 产生的原因",
            "prerequisites": ["Mid.SELECT", "Mid.WHERE", "Mid.GROUP BY"],
        },
        "High": {
            "title": "JOIN：执行算法与性能影响",
            "description": "理解数据库执行 JOIN 的三种算法（Nested Loop / Hash Join / Merge Join），知道优化器如何选择，以及如何通过索引和查询重写影响 JOIN 性能。",
            "key_points": [
                "Nested Loop：小表驱动大表，适合内表有索引",
                "Hash Join：大表对大表，内存换时间",
                "Merge Join：两边有序时高效",
                "JOIN 顺序与统计信息影响计划，用 EXPLAIN 验证",
            ],
            "example": "EXPLAIN SELECT * FROM large_table a JOIN small_table b ON a.id = b.id;",
            "mastery_criteria": "能读懂 JOIN 的执行计划，能判断 JOIN 是否为性能瓶颈",
            "prerequisites": ["High.WHERE", "High.索引"],
        },
    },
    "GROUP BY": {
        "Low": {
            "title": "GROUP BY：按维度把多行收成指标",
            "description": "GROUP BY 用来按某个（些）字段分组，再配合 COUNT/SUM/AVG 算出每个组的指标。初级要会「按一列分组 + 一个聚合函数」。",
            "key_points": [
                "先想清分组维度，再选聚合函数",
                "常见：COUNT(*)、SUM(amount)、AVG(amount)",
                "SELECT 中的非聚合列一般要出现在 GROUP BY 里",
            ],
            "example": "SELECT status, COUNT(*) AS cnt FROM orders GROUP BY status;",
            "mastery_criteria": "能按单一维度统计行数或金额合计",
            "prerequisites": ["Low.SELECT", "Low.WHERE"],
        },
        "Mid": {
            "title": "GROUP BY：多维聚合、HAVING 与粒度控制",
            "description": "中级要会多列分组、HAVING 过滤组、以及控制结果粒度；能区分「明细过滤 WHERE」与「组后过滤 HAVING」，避免粒度错误导致指标失真。",
            "key_points": [
                "多维：GROUP BY city, status",
                "HAVING 过滤聚合后的组（如 COUNT(*) > 10）",
                "先聚合到正确粒度，再 JOIN 维表，防止爆炸",
            ],
            "example": "SELECT user_id, SUM(amount) AS gmv FROM orders WHERE status='paid' GROUP BY user_id HAVING SUM(amount) >= 500;",
            "mastery_criteria": "能完成多维聚合并用 HAVING 过滤，能说明粒度是否正确",
            "prerequisites": ["Mid.SELECT", "Mid.WHERE", "Mid.JOIN"],
        },
        "High": {
            "title": "GROUP BY：Hash/Sort 聚合与物化策略",
            "description": "理解聚合的物理实现（Hash Aggregate / GroupAggregate）、内存与 spill，以及何时用预聚合/物化视图替代在线大 GROUP BY。",
            "key_points": [
                "Hash 聚合吃内存；Sort 聚合依赖有序输入",
                "高基数字段 GROUP BY 代价陡增",
                "固定报表优先 DWS/物化，避免线上扫明细狂聚合",
            ],
            "example": "EXPLAIN (ANALYZE) SELECT dt, SUM(amount) FROM orders GROUP BY dt;",
            "mastery_criteria": "能读懂聚合节点类型并提出预聚合或改写方案",
            "prerequisites": ["High.JOIN", "High.索引"],
        },
    },
    "子查询": {
        "Low": {
            "title": "子查询：在查询里再嵌一套查询",
            "description": "子查询是写在括号里的「查询结果当条件或数据源」。初级先掌握 WHERE IN / 标量比较 两种最直观写法。",
            "key_points": [
                "IN (SELECT ...)：用子结果做名单过滤",
                "标量子查询返回单值，可与 =、> 比较",
                "先把子查询单独跑通，再嵌进去",
            ],
            "example": "SELECT * FROM orders WHERE user_id IN (SELECT user_id FROM users WHERE city = '上海');",
            "mastery_criteria": "能写出 WHERE IN 子查询完成简单筛选",
            "prerequisites": ["Low.SELECT", "Low.WHERE"],
        },
        "Mid": {
            "title": "子查询：相关/非相关、EXISTS 与 CTE 选型",
            "description": "中级要分清相关子查询与非相关子查询，会用 EXISTS 表达存在性，并在可读性上用 CTE 替代深层嵌套。",
            "key_points": [
                "非相关：子查询可独立执行；相关：依赖外层行",
                "EXISTS 常比 IN+DISTINCT 更贴合「是否存在」",
                "复杂逻辑用 WITH CTE 分层，便于验收",
            ],
            "example": "SELECT u.* FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.status='paid');",
            "mastery_criteria": "能在 IN/EXISTS/CTE/JOIN 之间按场景选型并说明理由",
            "prerequisites": ["Mid.JOIN", "Mid.WHERE"],
        },
        "High": {
            "title": "子查询：解相关、半连接与计划形态",
            "description": "理解优化器如何把子查询改写为半连接/反连接或物化；能判断相关子查询是否成为性能陷阱并做等价重写。",
            "key_points": [
                "IN/EXISTS 常被改写为 Semi Join",
                "NOT EXISTS 对应 Anti Join",
                "强制物化或相关执行可能导致次数爆炸",
            ],
            "example": "EXPLAIN SELECT * FROM users u WHERE u.id IN (SELECT user_id FROM orders WHERE amount > 100);",
            "mastery_criteria": "能读懂子查询在计划中的形态，并给出等价高性能改写",
            "prerequisites": ["High.JOIN", "High.索引"],
        },
    },
    "窗口函数": {
        "Low": {
            "title": "窗口函数：在明细行上附加「组内计算结果」",
            "description": "窗口函数是在不合并行的前提下，为每一行附加组内计算结果的写法。初级先建立直觉：它和 GROUP BY 不同——行还在，只是多了排名/累计等列。",
            "key_points": [
                "结果行数通常与输入明细一致（不像 GROUP BY 压行）",
                "最常见入门：ROW_NUMBER() 排名",
                "写法含 OVER (PARTITION BY ... ORDER BY ...)",
            ],
            "example": "SELECT user_id, amount, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn FROM orders;",
            "mastery_criteria": "能解释窗口与 GROUP BY 的区别，并写出 ROW_NUMBER 示例",
            "prerequisites": ["Low.SELECT", "Low.WHERE", "Low.GROUP BY"],
        },
        "Mid": {
            "title": "窗口函数：排名、累计、占比与去重场景",
            "description": "中级要会选对窗口函数：ROW_NUMBER/RANK/DENSE_RANK、SUM() OVER 累计、以及用 rn=1 做组内取最新；能解决 TopN、留存辅助列等分析题。",
            "key_points": [
                "ROW_NUMBER 唯一序号；RANK 可并列跳号",
                "SUM(x) OVER (PARTITION BY ... ORDER BY ... ) 做累计",
                "组内最新：按时间倒序 ROW_NUMBER 再滤 rn=1",
            ],
            "example": "SELECT * FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) rn FROM orders) t WHERE rn = 1;",
            "mastery_criteria": "能用窗口完成 TopN/组内最新/累计至少两类分析",
            "prerequisites": ["Mid.GROUP BY", "Mid.子查询"],
        },
        "High": {
            "title": "窗口函数：帧定义、排序成本与执行策略",
            "description": "深入窗口帧（ROWS/RANGE）、多次排序代价与溢出；知道如何减少窗口计算成本，以及何时改回聚合预计算。",
            "key_points": [
                "帧边界决定累计/滑动窗口语义",
                "多窗口不同 ORDER BY 可能多次排序",
                "超大分区窗口吃内存，需限制分区基数或预聚合",
            ],
            "example": "EXPLAIN SELECT SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) FROM orders;",
            "mastery_criteria": "能解释帧语义，能用计划评估窗口代价并提出优化",
            "prerequisites": ["High.GROUP BY", "High.索引"],
        },
    },
    "索引": {
        "Low": {
            "title": "索引：让查找更快的「目录」",
            "description": "索引像书的目录，帮助数据库快速定位行，而不必每次从头扫整张表。初级要理解「为什么建索引」以及最常见的主键/单列索引直觉。",
            "key_points": [
                "有索引：按条件快速定位；无索引：可能全表扫描",
                "主键通常自带索引",
                "不是列越多越好，索引会占空间并拖慢写入",
            ],
            "example": "CREATE INDEX idx_orders_status ON orders(status);  -- 概念：为常筛选列建目录",
            "mastery_criteria": "能用目录类比解释索引作用，并说出主键与普通索引的直观区别",
            "prerequisites": ["Low.WHERE"],
        },
        "Mid": {
            "title": "索引：组合索引、最左前缀与是否命中",
            "description": "中级要会为查询设计组合索引，理解最左前缀，并用 EXPLAIN 判断是否 type/index range 命中，避免无效索引。",
            "key_points": [
                "组合索引 (a,b,c) 遵循最左前缀",
                "等值列在前、范围列靠后是常见经验",
                "对索引列包函数、隐式类型转换会导致不走索引",
            ],
            "example": "EXPLAIN SELECT * FROM orders WHERE status='paid' AND created_at >= '2024-01-01';",
            "mastery_criteria": "能设计组合索引并用 EXPLAIN 验证是否命中",
            "prerequisites": ["Mid.WHERE", "Mid.JOIN"],
        },
        "High": {
            "title": "索引：B+Tree/结构选择、覆盖与维护代价",
            "description": "理解主流 B+Tree 结构、回表与覆盖索引、以及写入放大与碎片；能在读写之间权衡索引方案，并处理统计信息与倾斜。",
            "key_points": [
                "二级索引可能回表；覆盖索引只扫索引",
                "过多索引拖慢 INSERT/UPDATE，需定期审计",
                "统计信息过期会导致优化器选错索引",
            ],
            "example": "EXPLAIN SELECT order_id FROM orders WHERE status='paid';  -- 若索引含 order_id,status 可能覆盖",
            "mastery_criteria": "能设计覆盖索引方案，能解释回表与维护代价",
            "prerequisites": ["High.WHERE", "High.JOIN"],
        },
    },
    "事务": {
        "Low": {
            "title": "事务：一堆操作要么全成功要么全失败",
            "description": "事务把多步读写捆成一个单元，保证中途失败可以一起撤销。初级要建立「转账不能只扣一边」的直觉，并认识 BEGIN/COMMIT/ROLLBACK。",
            "key_points": [
                "原子性：同成同败",
                "基本语句：START TRANSACTION / COMMIT / ROLLBACK",
                "查询分析常用自动提交的只读，但要理解写操作风险",
            ],
            "example": "START TRANSACTION; UPDATE accounts SET bal=bal-10 WHERE id=1; UPDATE accounts SET bal=bal+10 WHERE id=2; COMMIT;",
            "mastery_criteria": "能解释事务是什么，并能写出最小的提交/回滚示例",
            "prerequisites": ["Low.SELECT"],
        },
        "Mid": {
            "title": "事务：隔离级别与并发异常的选择",
            "description": "中级要知道脏读、不可重复读、幻读，以及读已提交/可重复读等隔离级别的取舍，能在业务正确性与并发性能之间做基本选择。",
            "key_points": [
                "隔离级别越高，异常越少，并发可能越差",
                "脏读/不可重复读/幻读的业务含义",
                "长事务会拖住锁与版本，报表勿塞进写事务",
            ],
            "example": "SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- 按引擎与业务选择",
            "mastery_criteria": "能描述至少两种并发异常，并说明一种隔离级别适用场景",
            "prerequisites": ["Mid.WHERE"],
        },
        "High": {
            "title": "事务：MVCC、锁与分布式边界",
            "description": "深入 MVCC 与锁（行锁/间隙锁等）如何实现隔离；理解分布式事务/跨库场景下本地 ACID 的边界与常见替代模式。",
            "key_points": [
                "MVCC：读写通过版本共存，减少锁冲突",
                "当前读 vs 快照读；死锁检测与重试",
                "跨库需 Saga/本地消息表等，不能假设单机事务自动覆盖",
            ],
            "example": "分析死锁日志：两事务互锁顺序相反 → 统一加锁顺序",
            "mastery_criteria": "能结合锁/MVCC 解释一种并发问题，并提出规避设计",
            "prerequisites": ["High.索引"],
        },
    },
}


def nid(level: str, topic: str) -> str:
    return f"{level}.{topic}"


def build():
    nodes = []
    for topic in TOPICS:
        for level in LEVELS:
            c = CONTENT[topic][level]
            li = LEVELS.index(level)
            next_up = nid(LEVELS[li + 1], topic) if li < 2 else None
            nodes.append(
                {
                    "node_id": nid(level, topic),
                    "topic": topic,
                    "level": level,
                    "title": c["title"],
                    "description": c["description"],
                    "key_points": c["key_points"],
                    "example": c["example"],
                    "mastery_criteria": c["mastery_criteria"],
                    "next_level_up": next_up,
                    "prerequisites": c["prerequisites"],
                }
            )

    edges = []
    # level_up × 16
    for topic in TOPICS:
        edges.append(
            {
                "from": nid("Low", topic),
                "to": nid("Mid", topic),
                "type": "level_up",
                "description": _level_up_desc(topic, "Low", "Mid"),
            }
        )
        edges.append(
            {
                "from": nid("Mid", topic),
                "to": nid("High", topic),
                "type": "level_up",
                "description": _level_up_desc(topic, "Mid", "High"),
            }
        )

    # prerequisite edges
    for n in nodes:
        for p in n["prerequisites"]:
            edges.append(
                {
                    "from": p,
                    "to": n["node_id"],
                    "type": "prerequisite",
                    "description": f"先掌握 {p}，再学习 {n['node_id']}",
                }
            )

    paths = [
        {
            "path_id": "full",
            "name": "完整路径：同层铺开再整体升级",
            "description": "每个 Level 内按依赖学完 8 个 topic，再升到下一 Level",
            "sequence": (
                [nid("Low", t) for t in ["SELECT", "WHERE", "JOIN", "GROUP BY", "子查询", "窗口函数", "索引", "事务"]]
                + [nid("Mid", t) for t in ["SELECT", "WHERE", "GROUP BY", "JOIN", "子查询", "窗口函数", "索引", "事务"]]
                + [nid("High", t) for t in ["SELECT", "WHERE", "索引", "JOIN", "GROUP BY", "子查询", "窗口函数", "事务"]]
            ),
            "estimated_days": 60,
        },
        {
            "path_id": "by_topic_vertical",
            "name": "按 Topic 纵向爬升",
            "description": "每学一个 topic 就 Low→Mid→High 打穿，适合有一定基础者",
            "sequence": [nid(lv, t) for t in TOPICS for lv in LEVELS],
            "estimated_days": 45,
        },
        {
            "path_id": "query_track",
            "name": "查询主线（先会写再会快）",
            "description": "聚焦取数能力：SELECT→WHERE→JOIN→GROUP BY→子查询→窗口，索引与事务稍后补齐",
            "sequence": [
                "Low.SELECT",
                "Low.WHERE",
                "Low.JOIN",
                "Low.GROUP BY",
                "Low.子查询",
                "Low.窗口函数",
                "Mid.SELECT",
                "Mid.WHERE",
                "Mid.JOIN",
                "Mid.GROUP BY",
                "Mid.子查询",
                "Mid.窗口函数",
                "Mid.索引",
                "High.JOIN",
                "High.索引",
                "High.窗口函数",
            ],
            "estimated_days": 35,
        },
    ]

    graph = {
        "graph_meta": {
            "name": "SQL Layered Learning Graph",
            "version": "2.0",
            "dimensions": {"levels": LEVELS, "topics": TOPICS},
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "level_up_edges": 16,
            "prerequisite_edges": sum(1 for e in edges if e["type"] == "prerequisite"),
        },
        "nodes": nodes,
        "edges": edges,
        "learning_paths": paths,
    }
    return graph


def _level_up_desc(topic: str, a: str, b: str) -> str:
    table = {
        ("SELECT", "Low", "Mid"): "从「会选列」升级到「会设计投影与表达式」",
        ("SELECT", "Mid", "High"): "从「会写投影」升级到「懂列裁剪与执行代价」",
        ("WHERE", "Low", "Mid"): "从「会写条件」升级到「会设计可选择性谓词」",
        ("WHERE", "Mid", "High"): "从「会优化写法」升级到「懂下推与裁剪」",
        ("JOIN", "Low", "Mid"): "从「会写 INNER JOIN」升级到「会选择 JOIN 类型」",
        ("JOIN", "Mid", "High"): "从「会选型」升级到「懂 JOIN 算法与计划」",
        ("GROUP BY", "Low", "Mid"): "从「会单维聚合」升级到「会多维与 HAVING」",
        ("GROUP BY", "Mid", "High"): "从「会控粒度」升级到「懂聚合算子与物化」",
        ("子查询", "Low", "Mid"): "从「会写 IN 子查询」升级到「会选 EXISTS/CTE」",
        ("子查询", "Mid", "High"): "从「会选型」升级到「懂解相关与半连接」",
        ("窗口函数", "Low", "Mid"): "从「知道是什么」升级到「会做排名/累计/取最新」",
        ("窗口函数", "Mid", "High"): "从「会分析用法」升级到「懂帧与排序成本」",
        ("索引", "Low", "Mid"): "从「知道目录类比」升级到「会设计组合索引并验证」",
        ("索引", "Mid", "High"): "从「会命中判断」升级到「懂结构与维护代价」",
        ("事务", "Low", "Mid"): "从「理解同成同败」升级到「会选隔离级别」",
        ("事务", "Mid", "High"): "从「懂并发异常」升级到「懂 MVCC/锁与分布式边界」",
    }
    return table[(topic, a, b)]


def validate(graph: dict) -> None:
    nodes = graph["nodes"]
    edges = graph["edges"]
    ids = [n["node_id"] for n in nodes]
    assert len(nodes) == 24
    assert len(set(ids)) == 24
    for t in TOPICS:
        for lv in LEVELS:
            assert nid(lv, t) in ids
    for n in nodes:
        assert n["description"].strip() and "..." not in n["description"]
        assert n["title"].strip() and n["example"].strip()
        assert len(n["key_points"]) >= 3
        assert "next_level_up" in n
        text = n["description"]
        if n["level"] == "Low":
            assert len(n["description"]) > 40 and n["example"], n["node_id"]
        if n["level"] == "Mid":
            assert any(k in text for k in ("几种", "选择", "选", "分清", "会用", "要会", "选型", "策略")), n["node_id"]
        if n["level"] == "High":
            assert any(k in text for k in ("理解", "算法", "引擎", "原理", "优化", "计划", "物理", "MVCC", "结构", "代价")), n["node_id"]
        # depth: Low/Mid/High descriptions must differ for same topic
    for t in TOPICS:
        dlow = next(n["description"] for n in nodes if n["node_id"] == nid("Low", t))
        dmid = next(n["description"] for n in nodes if n["node_id"] == nid("Mid", t))
        dhigh = next(n["description"] for n in nodes if n["node_id"] == nid("High", t))
        assert dlow != dmid != dhigh and dlow != dhigh
    level_ups = [e for e in edges if e["type"] == "level_up"]
    assert len(level_ups) == 16
    raw = json.dumps(graph, ensure_ascii=False)
    assert "以此类推" not in raw
    json.loads(raw)


def write_summary(graph: dict) -> None:
    lines = [
        "# SQL Layered Learning Graph v2.0 — 摘要\n",
        f"- 文件：`{OUT.name}`\n",
        f"- 节点：**{graph['graph_meta']['total_nodes']}**；边：**{graph['graph_meta']['total_edges']}**"
        f"（level_up={graph['graph_meta']['level_up_edges']}，prerequisite={graph['graph_meta']['prerequisite_edges']}）\n\n",
        "## 24 节点清单（按 Topic 分组）\n\n",
    ]
    for t in TOPICS:
        lines.append(f"### {t}\n\n")
        lines.append("| Level | node_id | title |\n|---|---|---|\n")
        for lv in LEVELS:
            n = next(x for x in graph["nodes"] if x["node_id"] == nid(lv, t))
            lines.append(f"| {lv} | `{n['node_id']}` | {n['title']} |\n")
        lines.append("\n**三层差异**\n\n")
        lines.append("| | Low | Mid | High |\n|---|---|---|---|\n")
        row = []
        for lv in LEVELS:
            n = next(x for x in graph["nodes"] if x["node_id"] == nid(lv, t))
            row.append(n["description"][:60] + "…")
        lines.append(f"| 焦点 | 是什么+怎么写 | 哪几种+怎么选 | 底层+怎么优化 |\n")
        lines.append(
            f"| 掌握标准 | {next(x['mastery_criteria'] for x in graph['nodes'] if x['node_id']==nid('Low',t))} | "
            f"{next(x['mastery_criteria'] for x in graph['nodes'] if x['node_id']==nid('Mid',t))} | "
            f"{next(x['mastery_criteria'] for x in graph['nodes'] if x['node_id']==nid('High',t))} |\n\n"
        )
    lines.append("## 质量校验\n\n")
    for item in [
        "8 个 topic 都有 Low/Mid/High 三层节点",
        "Low 层每个节点都有实质内容，不是占位",
        "Mid 和 High 的节点 description 明显不同",
        "有 16 条 level_up 边",
        "没有省略号占位或「以此类推」",
        "JSON 可被 JSON.parse() / json.loads 解析",
    ]:
        lines.append(f"- [x] {item}\n")
    SUMMARY.write_text("".join(lines), encoding="utf-8")


def main():
    graph = build()
    validate(graph)
    text = json.dumps(graph, ensure_ascii=False, indent=2)
    OUT.write_text(text, encoding="utf-8")
    write_summary(graph)
    print(f"Wrote {OUT} nodes={graph['graph_meta']['total_nodes']} edges={graph['graph_meta']['total_edges']}")
    print(f"Wrote {SUMMARY}")


if __name__ == "__main__":
    main()
