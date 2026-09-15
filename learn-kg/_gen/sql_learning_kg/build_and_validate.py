# -*- coding: utf-8 -*-
"""Build and validate SQL Learning Knowledge Graph."""
from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent
JSON_PATH = OUT_DIR / "sql_learning_knowledge_graph.json"
SUMMARY_PATH = OUT_DIR / "SUMMARY.md"
CHECKLIST_PATH = OUT_DIR / "CHECKLIST.md"

REQUIRED_NODE_FIELDS = [
    "node_id",
    "layer_id",
    "title",
    "title_en",
    "type",
    "difficulty",
    "estimated_minutes",
    "description",
    "key_points",
    "syntax_example",
    "common_mistakes",
    "prerequisites",
    "related_nodes",
    "practice",
    "mastery_criteria",
    "tags",
    "dialect_notes",
]
VALID_TYPES = {"concept", "syntax", "skill", "pattern", "tool"}
VALID_EDGE_TYPES = {"prerequisite", "related", "extends", "contrasts"}
LAYER_BOUNDS = {f"L{i}": (3, 8) for i in range(7)}


def node(
    node_id: str,
    layer_id: str,
    title: str,
    title_en: str,
    type_: str,
    difficulty: int,
    estimated_minutes: int,
    description: str,
    key_points: list[str],
    syntax_example: str,
    common_mistakes: list[str],
    prerequisites: list[str],
    related_nodes: list[str],
    exercise_count: int,
    sample_question: str,
    mastery_criteria: str,
    tags: list[str],
    dialect_notes: str,
) -> dict:
    assert 3 <= len(key_points) <= 5
    assert 2 <= len(common_mistakes) <= 4
    assert exercise_count >= 1
    return {
        "node_id": node_id,
        "layer_id": layer_id,
        "title": title,
        "title_en": title_en,
        "type": type_,
        "difficulty": difficulty,
        "estimated_minutes": estimated_minutes,
        "description": description,
        "key_points": key_points,
        "syntax_example": syntax_example,
        "common_mistakes": common_mistakes,
        "prerequisites": prerequisites,
        "related_nodes": related_nodes,
        "practice": {
            "exercise_count": exercise_count,
            "sample_question": sample_question,
        },
        "mastery_criteria": mastery_criteria,
        "tags": tags,
        "dialect_notes": dialect_notes,
    }


def edge(edge_id: str, source: str, target: str, edge_type: str, description: str) -> dict:
    return {
        "edge_id": edge_id,
        "source": source,
        "target": target,
        "type": edge_type,
        "description": description,
    }


def build_graph() -> dict:
    layers = [
        {
            "layer_id": "L0",
            "name": "入门基础",
            "name_en": "Foundations",
            "description": "理解 SQL 与数据库基本概念，完成环境搭建与首条查询。",
            "order": 0,
        },
        {
            "layer_id": "L1",
            "name": "单表查询",
            "name_en": "Single-table Queries",
            "description": "掌握 SELECT / WHERE / ORDER BY / LIMIT 与计算列。",
            "order": 1,
        },
        {
            "layer_id": "L2",
            "name": "聚合分组",
            "name_en": "Aggregation & Grouping",
            "description": "学习聚合函数、GROUP BY、HAVING 与逻辑执行顺序。",
            "order": 2,
        },
        {
            "layer_id": "L3",
            "name": "多表与集合",
            "name_en": "Joins & Set Operations",
            "description": "掌握各类 JOIN、子查询、EXISTS 与 UNION 系列。",
            "order": 3,
        },
        {
            "layer_id": "L4",
            "name": "进阶分析",
            "name_en": "Advanced Analytics",
            "description": "窗口函数、CTE、CASE 与常用函数处理。",
            "order": 4,
        },
        {
            "layer_id": "L5",
            "name": "工程与对象",
            "name_en": "Engineering & Objects",
            "description": "表设计、索引与执行计划、事务、视图与数据变更对象。",
            "order": 5,
        },
        {
            "layer_id": "L6",
            "name": "实战与生态",
            "name_en": "Practice & Ecosystem",
            "description": "分析套路、面试、工具链、方言差异与反模式。",
            "order": 6,
        },
    ]

    nodes = [
        # ---------- L0 ----------
        node(
            "L0_what_is_sql",
            "L0",
            "SQL是什么",
            "What is SQL",
            "concept",
            1,
            25,
            "SQL（Structured Query Language）是与关系型数据库交互的标准语言，用于查询、写入与管理结构化数据。",
            [
                "SQL 面向集合，一次处理多行而非逐行循环",
                "声明式：描述要什么，而非怎么取",
                "常见操作分 DDL / DML / DQL / DCL",
                "学习路径以查询（DQL）为主，再扩展到建模与事务",
            ],
            "-- 概念节点：先理解再写查询\nSELECT 'SQL is declarative' AS idea;",
            [
                "把 SQL 当成过程式语言一行行循环写",
                "混淆 Excel 筛选与 SQL 集合运算",
            ],
            [],
            ["L0_db_types", "L0_first_query"],
            2,
            "用一句话说明 SQL 与命令式编程语言的核心区别。",
            "能区分 DDL/DML/DQL，并说明声明式查询的含义。",
            ["foundation", "concept"],
            "标准由 ANSI/ISO 定义；各厂商（PostgreSQL、MySQL、SQL Server、SQLite）有方言扩展。",
        ),
        node(
            "L0_db_types",
            "L0",
            "数据库类型",
            "Database Types",
            "concept",
            1,
            30,
            "关系型数据库用表、行、列与键表达实体关系；本课程以 OLTP/OLAP 中的 SQL 数据库为主。",
            [
                "关系型：表结构固定，强调一致性与 JOIN",
                "NoSQL：文档/键值/图等，不替代 SQL 场景",
                "本课程示例库：employees / orders / products",
                "选型看事务、查询复杂度与一致性需求",
            ],
            "SELECT 'relational' AS db_family, 'employees/orders/products' AS sample_domain;",
            [
                "认为 NoSQL 一定比 SQL 更快",
                "把 Excel 工作簿直接等同于数据库",
            ],
            ["L0_what_is_sql"],
            ["L0_env_setup", "L0_sample_schema"],
            2,
            "列出关系型与文档型数据库各两个典型产品，并说明何时优先选关系型。",
            "能说明关系型数据库的表/键概念，并解释本课程为何用示例业务模型。",
            ["foundation", "database"],
            "PostgreSQL/MySQL 偏通用 OLTP；BigQuery/Snowflake 等偏分析，SQL 语法仍高度相似。",
        ),
        node(
            "L0_env_setup",
            "L0",
            "环境搭建",
            "Environment Setup",
            "tool",
            1,
            40,
            "安装本地或云端数据库，配置客户端（psql、DBeaver、VS Code 插件等），确认能连接并执行语句。",
            [
                "准备 PostgreSQL/MySQL/SQLite 任一环境即可开练",
                "客户端需支持执行多语句与查看结果集",
                "建议固定一个 schema/database 存放示例表",
                "先跑通 SELECT 1 再导入示例数据",
            ],
            "SELECT 1 AS connection_ok;",
            [
                "端口/账号配错却只看 GUI 报错不读日志",
                "混用多个数据库连接导致表找不到",
            ],
            ["L0_what_is_sql"],
            ["L0_first_query", "L0_sample_schema"],
            2,
            "完成一次数据库连接，并执行 SELECT 1 返回一行。",
            "能独立安装或连接数据库，并在客户端成功执行简单查询。",
            ["tooling", "setup"],
            "SQLite 零配置适合入门；生产常用 PostgreSQL/MySQL。连接串与权限模型因方言而异。",
        ),
        node(
            "L0_first_query",
            "L0",
            "首条查询",
            "First Query",
            "syntax",
            1,
            20,
            "写出第一条可执行查询：选择列、给结果起别名，并理解结果集是一张临时表。",
            [
                "SELECT 指定投影列，FROM 指定数据来源",
                "别名用 AS 提高可读性",
                "分号结束语句是常见约定",
                "先查通再加过滤与排序",
            ],
            "SELECT employee_id, full_name AS name\nFROM employees\nLIMIT 5;",
            [
                "忘记 FROM 子句就指望出结果",
                "列名拼写错误却不看报错信息",
            ],
            ["L0_env_setup", "L0_sample_schema"],
            ["L1_select", "L0_what_is_sql"],
            3,
            "查询 employees 表前 5 名员工的 employee_id 与 full_name。",
            "能独立写出带 FROM 与别名的 SELECT，并解释结果集含义。",
            ["syntax", "select"],
            "LIMIT 在 PostgreSQL/MySQL/SQLite 通用；SQL Server 常用 TOP 或 OFFSET/FETCH。",
        ),
        node(
            "L0_sample_schema",
            "L0",
            "示例数据模型",
            "Sample Data Model",
            "concept",
            2,
            35,
            "本图谱统一使用 employees（员工）、orders（订单）、products（商品）三表业务场景，贯穿后续练习。",
            [
                "employees：员工主数据（部门、入职日、薪资）",
                "products：商品与价格库存",
                "orders：订单头，关联员工与商品",
                "主键/外键是 JOIN 与约束的基础",
            ],
            """CREATE TABLE employees (
  employee_id INT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  department VARCHAR(50),
  hire_date DATE,
  salary NUMERIC(10,2)
);
CREATE TABLE products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit_price NUMERIC(10,2),
  stock_qty INT
);
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  employee_id INT REFERENCES employees(employee_id),
  product_id INT REFERENCES products(product_id),
  order_date DATE,
  quantity INT,
  amount NUMERIC(12,2)
);
INSERT INTO employees VALUES
  (1,'Alice Chen','Sales','2021-03-01',9000),
  (2,'Bob Li','Engineering','2020-07-15',12000),
  (3,'Carol Wang','Sales','2022-01-10',8500);
INSERT INTO products VALUES
  (101,'Laptop Pro','Electronics',6999,50),
  (102,'Office Chair','Furniture',899,120),
  (103,'USB Hub','Electronics',129,300);
INSERT INTO orders VALUES
  (1001,1,101,'2024-01-05',2,13998),
  (1002,1,103,'2024-01-08',5,645),
  (1003,2,102,'2024-02-01',1,899),
  (1004,3,101,'2024-02-11',1,6999);""",
            [
                "不看外键关系就乱 JOIN",
                "金额字段用浮点导致精度问题（应用 NUMERIC/DECIMAL）",
            ],
            ["L0_db_types"],
            ["L0_first_query", "L3_inner_join", "L5_table_design"],
            3,
            "根据三表画出 ER 关系，并写出创建 至少各插入一行的语句。",
            "能默画出三表关系，并解释主键/外键在示例业务中的作用。",
            ["schema", "sample-data"],
            "类型名略有差异：PostgreSQL 用 NUMERIC；MySQL 常用 DECIMAL；SQLite 类型亲和较松。",
        ),
        # ---------- L1 ----------
        node(
            "L1_select",
            "L1",
            "SELECT",
            "SELECT Basics",
            "syntax",
            1,
            30,
            "SELECT 用于投影需要的列；可选取全部列、指定列、表达式与别名。",
            [
                "避免生产环境滥用 SELECT *",
                "列顺序由 SELECT 列表决定",
                "DISTINCT 去重基于整行投影结果",
                "别名只影响结果展示，不改表结构",
            ],
            "SELECT employee_id, full_name, department\nFROM employees;",
            [
                "无脑 SELECT * 导致带宽与耦合问题",
                "在别名未定义阶段就在 WHERE 中引用别名",
            ],
            ["L0_first_query"],
            ["L1_where", "L1_computed_columns"],
            3,
            "查询所有 Sales 部门员工的姓名与薪资（先写出 SELECT，过滤在下一节点完善）。",
            "能按需投影列并正确使用别名，解释 DISTINCT 作用范围。",
            ["select", "projection"],
            "SELECT * 行为各库一致；列别名大小写折叠规则因库而异。",
        ),
        node(
            "L1_where",
            "L1",
            "WHERE",
            "WHERE Filtering",
            "syntax",
            2,
            35,
            "WHERE 在分组前按行过滤；支持比较、逻辑、IN、BETWEEN、LIKE 与 NULL 判断。",
            [
                "WHERE 作用于行级条件，不能直接用聚合结果",
                "NULL 比较用 IS NULL / IS NOT NULL",
                "AND 优先级高于 OR，复杂条件建议加括号",
                "字符串匹配注意大小写与通配符",
            ],
            "SELECT employee_id, full_name, salary\nFROM employees\nWHERE department = 'Sales' AND salary >= 8500;",
            [
                "用 = NULL 判断空值",
                "把聚合条件写进 WHERE（应使用 HAVING）",
            ],
            ["L1_select"],
            ["L1_order_by", "L2_having"],
            4,
            "查出 Electronics 类且单价不低于 100 的商品。",
            "能组合多条件过滤，并正确处理 NULL 与括号优先级。",
            ["filter", "where"],
            "字符串比较的排序规则（collation）影响大小写敏感性，MySQL 默认常不区分大小写。",
        ),
        node(
            "L1_order_by",
            "L1",
            "ORDER BY",
            "ORDER BY Sorting",
            "syntax",
            2,
            25,
            "ORDER BY 对结果集排序；可多列、升序/降序，并可引用列位置或别名。",
            [
                "未 ORDER BY 时结果顺序不稳定",
                "多列排序按优先级从左到右",
                "NULL 排序位置因方言而异",
                "大表排序可能触发磁盘临时文件",
            ],
            "SELECT product_name, unit_price\nFROM products\nORDER BY unit_price DESC, product_name ASC;",
            [
                "假设无 ORDER BY 时结果永远按插入顺序",
                "对超大结果无限制地全量排序",
            ],
            ["L1_select"],
            ["L1_limit", "L1_where"],
            3,
            "按订单金额从高到低列出 orders，金额相同再按 order_date。",
            "能写出多列排序，并说明未排序时顺序不可依赖。",
            ["sort", "order-by"],
            "NULLS FIRST/LAST 在 PostgreSQL 支持较好；MySQL/SQLite 需用表达式模拟。",
        ),
        node(
            "L1_limit",
            "L1",
            "LIMIT",
            "LIMIT / Pagination",
            "syntax",
            2,
            20,
            "LIMIT（或等价语法）限制返回行数，常与 ORDER BY 组合做 Top-N 与分页。",
            [
                "Top-N 必须配合确定性 ORDER BY",
                "分页常用 LIMIT n OFFSET m",
                "深分页性能差，可改用键集分页",
                "不同方言分页语法不同",
            ],
            "SELECT full_name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 3;",
            [
                "只用 LIMIT 不做 ORDER BY 就宣称“最高薪”",
                "OFFSET 很大时性能急剧下降仍硬分页",
            ],
            ["L1_order_by"],
            ["L1_select", "L4_row_number"],
            3,
            "返回金额最高的 2 笔订单（含 order_id 与 amount）。",
            "能正确实现 Top-N，并知道分页语法的方言差异。",
            ["limit", "pagination"],
            "PostgreSQL/MySQL/SQLite: LIMIT/OFFSET；SQL Server: OFFSET/FETCH 或 TOP。",
        ),
        node(
            "L1_computed_columns",
            "L1",
            "计算列",
            "Computed Columns",
            "skill",
            2,
            30,
            "在 SELECT 中用表达式生成派生列，如金额计算、税率、拼接字段等。",
            [
                "表达式结果类型由运算决定",
                "可用括号控制运算优先级",
                "派生列可再被外层查询引用",
                "注意整数除法截断问题",
            ],
            "SELECT\n  order_id,\n  quantity,\n  amount,\n  ROUND(amount * 1.13, 2) AS amount_with_tax\nFROM orders;",
            [
                "整数相除期望得到小数却得到截断结果",
                "把业务计算散落在多处且口径不一致",
            ],
            ["L1_select"],
            ["L1_comments", "L4_case_expr"],
            3,
            "为 products 增加一列折扣价 = unit_price * 0.9，保留两位小数。",
            "能用表达式生成业务派生列，并处理舍入与类型。",
            ["expression", "select"],
            "ROUND 参数与银行家舍入行为因库而异；类型转换函数名也不同（CAST/CONVERT）。",
        ),
        node(
            "L1_comments",
            "L1",
            "注释",
            "SQL Comments",
            "syntax",
            1,
            15,
            "使用单行 -- 与块注释 /* */ 记录意图、口径与临时排查信息。",
            [
                "注释写清业务口径比写废话更重要",
                "提交前清理调试用注释与死代码",
                "不要在注释里放密钥",
                "块注释勿嵌套不当导致语法错误",
            ],
            "-- 查询销售部高薪员工\nSELECT full_name, salary\nFROM employees\nWHERE department = 'Sales' /* 含海外销售 */;",
            [
                "用注释掩盖错误逻辑而不修复",
                "块注释未闭合导致后续语句被吞掉",
            ],
            ["L1_select"],
            ["L1_computed_columns"],
            2,
            "给一条查询加上说明过滤口径的单行注释与块注释。",
            "能规范使用两种注释，并保持脚本可读。",
            ["comments", "style"],
            "几乎所有方言支持 -- 与 /* */；部分工具对嵌套块注释支持不一致。",
        ),
        # ---------- L2 ----------
        node(
            "L2_aggregate_funcs",
            "L2",
            "聚合函数",
            "Aggregate Functions",
            "syntax",
            2,
            35,
            "COUNT/SUM/AVG/MIN/MAX 将多行折叠为标量；常与 GROUP BY 联用。",
            [
                "COUNT(*) 计行，COUNT(col) 忽略 NULL",
                "AVG 忽略 NULL，分母是非空个数",
                "无 GROUP BY 时整表视为一组",
                "聚合后不能直接回表取未分组明细列",
            ],
            "SELECT\n  COUNT(*) AS order_cnt,\n  SUM(amount) AS total_amount,\n  AVG(amount) AS avg_amount\nFROM orders;",
            [
                "误以为 COUNT(col) 与 COUNT(*) 总相同",
                "对已聚合结果再套错误嵌套导致语义混乱",
            ],
            ["L1_where"],
            ["L2_group_by", "L2_count_distinct"],
            4,
            "统计 orders 的订单数、总金额与平均金额。",
            "能正确选择聚合函数并解释 NULL 对计数与均值的影响。",
            ["aggregate", "analytics"],
            "FILTER (WHERE ...) 为 PostgreSQL 特性；其他库常用 CASE 模拟条件聚合。",
        ),
        node(
            "L2_group_by",
            "L2",
            "GROUP BY",
            "GROUP BY",
            "syntax",
            3,
            40,
            "GROUP BY 按键分组后对每组做聚合；SELECT 中非聚合列必须出现在分组键中。",
            [
                "分组键决定“一行代表什么”",
                "多列 GROUP BY 形成组合维度",
                "仅选择分组键与聚合结果",
                "可先 WHERE 缩小行集再分组",
            ],
            "SELECT department, COUNT(*) AS emp_cnt, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;",
            [
                "SELECT 中出现既未分组又未聚合的列",
                "把明细需求硬写成一次 GROUP BY",
            ],
            ["L2_aggregate_funcs"],
            ["L2_having", "L2_exec_order"],
            4,
            "按 category 统计 products 的商品数与平均单价。",
            "能写出正确的多列分组，并解释“仅分组键+聚合”规则。",
            ["group-by", "aggregate"],
            "MySQL 在非 ONLY_FULL_GROUP_BY 模式下可能放宽规则，但不可依赖。",
        ),
        node(
            "L2_having",
            "L2",
            "HAVING",
            "HAVING Filtering",
            "syntax",
            3,
            35,
            "HAVING 在分组与聚合之后过滤组；WHERE 不能直接引用聚合结果。",
            [
                "WHERE 滤行，HAVING 滤组",
                "HAVING 可使用聚合表达式",
                "能下推到 WHERE 的条件优先放 WHERE",
                "与 GROUP BY 成对理解执行顺序",
            ],
            "SELECT employee_id, SUM(amount) AS total_sales\nFROM orders\nGROUP BY employee_id\nHAVING SUM(amount) > 1000;",
            [
                "在 WHERE 中写 SUM(amount) > 1000",
                "把本可预过滤的行条件塞进 HAVING",
            ],
            ["L2_group_by"],
            ["L1_where", "L2_exec_order"],
            4,
            "找出订单总金额超过 1000 的员工及其总销售额。",
            "能明确区分 WHERE 与 HAVING，并写出组级过滤。",
            ["having", "aggregate"],
            "语义标准一致；优化器是否重写 HAVING 为 WHERE 因引擎而异。",
        ),
        node(
            "L2_exec_order",
            "L2",
            "执行顺序",
            "Logical Execution Order",
            "concept",
            3,
            30,
            "理解 SQL 逻辑处理顺序有助于解释别名可见性与 WHERE/HAVING 差异。",
            [
                "常见逻辑顺序：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
                "因此 SELECT 别名通常不能用于 WHERE",
                "窗口函数在 SELECT 列表阶段计算",
                "物理执行计划可能重排但语义等价",
            ],
            "-- 演示：别名在 WHERE 不可用（应使用表达式或子查询）\nSELECT department, COUNT(*) AS cnt\nFROM employees\nWHERE salary >= 8000\nGROUP BY department\nHAVING COUNT(*) >= 1\nORDER BY cnt DESC;",
            [
                "按书写顺序理解执行导致别名误用",
                "把物理计划与逻辑顺序完全等同",
            ],
            ["L2_group_by", "L2_having"],
            ["L1_where", "L4_window_intro"],
            3,
            "解释为什么 WHERE 里不能写 SELECT 列表中的别名 cnt。",
            "能按逻辑顺序逐步推演一条含分组与排序的查询。",
            ["execution-order", "concept"],
            "逻辑顺序是教学模型；各引擎优化器会改写，但必须保持结果语义。",
        ),
        node(
            "L2_count_distinct",
            "L2",
            "COUNT DISTINCT",
            "COUNT DISTINCT",
            "skill",
            3,
            25,
            "COUNT(DISTINCT col) 统计非空唯一值个数，常用于去重人数、去重商品数等指标。",
            [
                "NULL 不计入 DISTINCT 计数",
                "多列去重需用拼接或方言扩展",
                "大数据量时可能昂贵，注意性能",
                "可与 GROUP BY 组合做分维度去重",
            ],
            "SELECT COUNT(DISTINCT employee_id) AS active_sellers\nFROM orders;",
            [
                "用 COUNT(*) 误当去重人数",
                "忽略 NULL 对去重计数的影响",
            ],
            ["L2_aggregate_funcs"],
            ["L2_group_by", "L4_row_number"],
            3,
            "统计下过单的去重员工数，以及每个 category 下的去重商品数。",
            "能正确使用 COUNT(DISTINCT)，并说明其代价与空值语义。",
            ["distinct", "aggregate"],
            "COUNT(DISTINCT a, b) 在 MySQL 支持，在 PostgreSQL 需用其他写法。",
        ),
        # ---------- L3 ----------
        node(
            "L3_inner_join",
            "L3",
            "INNER JOIN",
            "INNER JOIN",
            "syntax",
            3,
            40,
            "INNER JOIN 只返回两表匹配成功的行；是多表关联的默认首选。",
            [
                "匹配键通常是主键-外键",
                "一对多会产生行膨胀",
                "JOIN 条件写在 ON，过滤条件优先 WHERE",
                "多表 INNER JOIN 可链式连接",
            ],
            "SELECT o.order_id, e.full_name, p.product_name, o.amount\nFROM orders o\nINNER JOIN employees e ON o.employee_id = e.employee_id\nINNER JOIN products p ON o.product_id = p.product_id;",
            [
                "漏写 ON 条件导致笛卡尔积",
                "在 ON 中塞业务过滤导致语义难读",
            ],
            ["L1_where", "L0_sample_schema"],
            ["L3_left_join", "L3_self_multi_join"],
            4,
            "列出每笔订单的员工姓名、商品名与金额。",
            "能正确写出多表 INNER JOIN，并识别一对多膨胀。",
            ["join", "inner-join"],
            "JOIN 与 INNER JOIN 等价；旧式逗号连接不推荐。",
        ),
        node(
            "L3_left_join",
            "L3",
            "LEFT JOIN",
            "LEFT JOIN / LEFT OUTER JOIN",
            "syntax",
            3,
            40,
            "LEFT JOIN 保留左表全部行，右表无匹配时填充 NULL；常用于“找出未匹配”场景。",
            [
                "左表驱动，右表可空",
                "对右表列 IS NULL 可找未关联实体",
                "WHERE 过滤右表列可能把 LEFT 变成实质 INNER",
                "与 INNER 的核心差异是是否保留未匹配行",
            ],
            "SELECT e.employee_id, e.full_name, o.order_id\nFROM employees e\nLEFT JOIN orders o ON e.employee_id = o.employee_id\nWHERE o.order_id IS NULL;",
            [
                "LEFT JOIN 后又在 WHERE 写右表非空条件，意外丢掉未匹配行",
                "误以为 LEFT JOIN 一定比 INNER 慢或快",
            ],
            ["L3_inner_join"],
            ["L3_right_full_cross", "L3_inner_join"],
            4,
            "找出从未下过单的员工。",
            "能用 LEFT JOIN + IS NULL 找差集，并避免把 LEFT 写成伪 INNER。",
            ["join", "left-join"],
            "LEFT OUTER JOIN 与 LEFT JOIN 同义；各库均广泛支持。",
        ),
        node(
            "L3_right_full_cross",
            "L3",
            "RIGHT/FULL/CROSS",
            "RIGHT / FULL / CROSS JOIN",
            "syntax",
            3,
            35,
            "RIGHT JOIN 对称于 LEFT；FULL OUTER 保留两侧未匹配；CROSS JOIN 生成笛卡尔积。",
            [
                "RIGHT 可用交换表顺序的 LEFT 改写",
                "FULL OUTER 适合对账找双边差异",
                "CROSS JOIN 行数=两边行数乘积，慎用",
                "明确业务再选择连接类型",
            ],
            "SELECT e.full_name, p.product_name\nFROM employees e\nCROSS JOIN products p\nWHERE e.department = 'Sales'\nLIMIT 10;",
            [
                "忘记 ON 条件误写出 CROSS",
                "在不支持 FULL 的库硬写导致失败",
            ],
            ["L3_left_join"],
            ["L3_inner_join", "L3_self_multi_join"],
            3,
            "说明 CROSS JOIN 的结果行数如何计算，并举一个合法业务用例。",
            "能区分 RIGHT/FULL/CROSS，并知道用 LEFT 改写 RIGHT。",
            ["join", "cross-join"],
            "MySQL 传统上不支持 FULL OUTER JOIN，需用 UNION 模拟；PostgreSQL 完整支持。",
        ),
        node(
            "L3_self_multi_join",
            "L3",
            "自连接与多表",
            "Self Join & Multi-table Join",
            "skill",
            3,
            40,
            "自连接把同一表别名成两份以比较行间关系；多表连接串联业务实体。",
            [
                "自连接必须使用不同别名",
                "组织树/找同组同伴是经典场景",
                "多表连接注意中间表粒度",
                "先画关系再写 ON 条件",
            ],
            "SELECT a.full_name AS employee, b.full_name AS colleague, a.department\nFROM employees a\nINNER JOIN employees b\n  ON a.department = b.department\n AND a.employee_id < b.employee_id;",
            [
                "自连接忘记排除自己与自己匹配",
                "多表 JOIN 键接错导致静默错误结果",
            ],
            ["L3_inner_join"],
            ["L3_subquery", "L3_left_join"],
            3,
            "列出同一部门内两两员工组合（不含自己与自己）。",
            "能书写自连接与三表以上关联，并校验结果粒度。",
            ["self-join", "multi-join"],
            "语法标准；深度递归层级更推荐递归 CTE（见 L4）。",
        ),
        node(
            "L3_subquery",
            "L3",
            "子查询",
            "Subqueries",
            "syntax",
            3,
            40,
            "子查询可出现在 WHERE/FROM/SELECT；标量子查询、IN 子查询与派生表是常见形态。",
            [
                "相关子查询依赖外层行，可能较慢",
                "派生表必须起别名（多数方言）",
                "能改写为 JOIN 时常更清晰",
                "注意单行/多行子查询运算符差异",
            ],
            "SELECT full_name, salary\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary) FROM employees\n);",
            [
                "标量子查询实际返回多行导致运行期错误",
                "过度嵌套子查询难以维护",
            ],
            ["L1_where", "L2_aggregate_funcs"],
            ["L3_exists", "L4_cte"],
            4,
            "查出薪资高于全公司平均薪资的员工。",
            "能编写非相关与相关子查询，并判断何时改为 JOIN/CTE。",
            ["subquery"],
            "派生表别名在 MySQL/PostgreSQL 均为必须；SQL Server 同样要求。",
        ),
        node(
            "L3_exists",
            "L3",
            "EXISTS",
            "EXISTS Semi-join",
            "syntax",
            3,
            35,
            "EXISTS 判断子查询是否至少有一行；常用于半连接与“是否存在关联”判定。",
            [
                "EXISTS 只关心有无行，不关心返回列",
                "NOT EXISTS 常用于反连接",
                "相比 IN，对 NULL 行为更直观",
                "相关 EXISTS 可被优化为半连接",
            ],
            "SELECT e.employee_id, e.full_name\nFROM employees e\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.employee_id = e.employee_id\n    AND o.amount >= 1000\n);",
            [
                "在 EXISTS 子查询里做无必要的重计算",
                "用 IN + 含 NULL 的列表导致逻辑陷阱",
            ],
            ["L3_subquery"],
            ["L3_left_join", "L3_subquery"],
            3,
            "用 EXISTS 找出至少有一笔金额 ≥ 1000 订单的员工。",
            "能用 EXISTS/NOT EXISTS 表达存在性，并对比 IN/LEFT JOIN。",
            ["exists", "semi-join"],
            "语义标准；优化器对 EXISTS vs IN 的选择因版本与统计信息而异。",
        ),
        node(
            "L3_union",
            "L3",
            "UNION",
            "UNION",
            "syntax",
            3,
            30,
            "UNION 合并多个查询结果并去重；列数与类型需兼容，最终列名取自首个查询。",
            [
                "UNION 隐含去重，成本高于 UNION ALL",
                "各分支列数必须一致",
                "ORDER BY 通常放在最外层",
                "去重基于整行比较",
            ],
            "SELECT full_name AS name, 'employee' AS source FROM employees\nUNION\nSELECT product_name, 'product' FROM products;",
            [
                "不需要去重时仍用 UNION 造成额外排序/哈希",
                "各分支列类型不兼容",
            ],
            ["L1_select"],
            ["L3_union_all", "L3_subquery"],
            3,
            "把员工姓名与商品名称合并为一列 name，并标记来源（需去重）。",
            "能正确使用 UNION，并说明其去重语义与代价。",
            ["set-op", "union"],
            "各库均支持；去重实现可能是排序或哈希。",
        ),
        node(
            "L3_union_all",
            "L3",
            "UNION ALL",
            "UNION ALL",
            "syntax",
            3,
            25,
            "UNION ALL 合并结果且保留重复行，通常比 UNION 更快，是日志拼接与分区合并的首选。",
            [
                "保留重复，不做隐式去重",
                "性能通常优于 UNION",
                "列数与类型兼容规则同 UNION",
                "需要去重时再显式 DISTINCT/聚合",
            ],
            "SELECT employee_id, order_date, amount FROM orders WHERE order_date < '2024-02-01'\nUNION ALL\nSELECT employee_id, order_date, amount FROM orders WHERE order_date >= '2024-02-01';",
            [
                "误用 UNION ALL 却期望结果唯一",
                "分支过滤条件重叠导致重复计数未察觉",
            ],
            ["L1_select"],
            ["L3_union", "L6_antipatterns"],
            3,
            "合并两段日期范围的订单明细，允许重复行存在。",
            "能在合适场景选择 UNION ALL，并解释与 UNION 的差异。",
            ["set-op", "union-all"],
            "标准支持广泛；与 UNION 的选择是正确性与性能的权衡。",
        ),
        # ---------- L4 ----------
        node(
            "L4_window_intro",
            "L4",
            "窗口入门",
            "Window Functions Intro",
            "concept",
            4,
            40,
            "窗口函数在保留明细行的同时计算分区内聚合/排序号；核心是 OVER(PARTITION BY ... ORDER BY ...)。",
            [
                "窗口不折叠行，与 GROUP BY 不同",
                "PARTITION BY 类似分组键",
                "帧子句控制聚合窗口范围",
                "常用于排名、累计、同比环比",
            ],
            "SELECT\n  order_id,\n  employee_id,\n  amount,\n  SUM(amount) OVER (PARTITION BY employee_id) AS emp_total\nFROM orders;",
            [
                "用 GROUP BY 硬做需要保留明细的排名",
                "忘记 ORDER BY 导致排名函数结果不稳定",
            ],
            ["L2_group_by", "L3_inner_join"],
            ["L4_row_number", "L4_rank", "L4_dense_rank"],
            3,
            "为每笔订单附加该员工的订单金额合计（保留明细行）。",
            "能解释窗口与分组的区别，并写出基本 OVER 子句。",
            ["window", "analytics"],
            "窗口函数在现代 PostgreSQL/MySQL 8+/SQL Server/SQLite 3.25+ 均可用，帧默认可能不同。",
        ),
        node(
            "L4_row_number",
            "L4",
            "ROW_NUMBER",
            "ROW_NUMBER",
            "syntax",
            4,
            35,
            "ROW_NUMBER 为分区内每行分配唯一序号，即使排序键相同也不重复。",
            [
                "同名次也不共享号，序号严格唯一",
                "常用于去重保留一行、Top-N per group",
                "必须有明确 ORDER BY 才有业务意义",
                "与 RANK/DENSE_RANK 在并列时不同",
            ],
            "SELECT employee_id, order_id, amount,\n       ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY amount DESC) AS rn\nFROM orders;",
            [
                "用 ROW_NUMBER 却期望并列名次相同",
                "ORDER BY 不稳定列导致每次 rn 变化",
            ],
            ["L4_window_intro"],
            ["L4_rank", "L4_dense_rank", "L1_limit"],
            4,
            "取出每位员工金额最高的一笔订单。",
            "能用 ROW_NUMBER 做分组 Top-N，并说明其唯一编号特性。",
            ["window", "row-number"],
            "语法高度一致；并行计划下仍需确定性 ORDER BY。",
        ),
        node(
            "L4_rank",
            "L4",
            "RANK",
            "RANK",
            "syntax",
            4,
            30,
            "RANK 允许并列，并列后会跳号（1,2,2,4）。",
            [
                "并列共享名次",
                "跳号：并列占用后续名次空位",
                "适合竞赛排名展示",
                "与 DENSE_RANK、ROW_NUMBER 对比记忆",
            ],
            "SELECT product_name, unit_price,\n       RANK() OVER (ORDER BY unit_price DESC) AS price_rank\nFROM products;",
            [
                "需要连续名次时误用 RANK",
                "需要唯一行号时误用 RANK",
            ],
            ["L4_window_intro"],
            ["L4_row_number", "L4_dense_rank"],
            3,
            "按单价对商品做 RANK 排名，并指出若两件同价会发生什么。",
            "能说出 RANK 的跳号规则，并在业务中正确选用。",
            ["window", "rank"],
            "标准窗口函数；各主流库支持良好。",
        ),
        node(
            "L4_dense_rank",
            "L4",
            "DENSE_RANK",
            "DENSE_RANK",
            "syntax",
            4,
            30,
            "DENSE_RANK 允许并列且不跳号（1,2,2,3）。",
            [
                "并列共享名次",
                "不跳号，名次连续",
                "适合需要连续等级的分档",
                "与 RANK 仅差在跳号与否",
            ],
            "SELECT product_name, unit_price,\n       DENSE_RANK() OVER (ORDER BY unit_price DESC) AS dense_price_rank\nFROM products;",
            [
                "把 DENSE_RANK 当成唯一行号",
                "与 RANK 混用导致报表口径不一致",
            ],
            ["L4_window_intro"],
            ["L4_rank", "L4_row_number"],
            3,
            "用 DENSE_RANK 按薪资给员工分档排名，对比 RANK 结果差异。",
            "能区分 DENSE_RANK 与 RANK，并说明不跳号场景。",
            ["window", "dense-rank"],
            "标准支持；注意与业务“名次”口径对齐。",
        ),
        node(
            "L4_cte",
            "L4",
            "CTE",
            "Common Table Expressions",
            "syntax",
            4,
            35,
            "WITH 子句定义命名临时结果集，提升可读性，便于分层计算与复用。",
            [
                "CTE 提高复杂查询可读性",
                "可在同一语句内引用多次（语义上）",
                "非递归 CTE 常可与子查询互换",
                "不要误以为 CTE 一定物化提速",
            ],
            "WITH sales AS (\n  SELECT employee_id, SUM(amount) AS total_sales\n  FROM orders\n  GROUP BY employee_id\n)\nSELECT e.full_name, s.total_sales\nFROM sales s\nJOIN employees e ON e.employee_id = s.employee_id\nORDER BY s.total_sales DESC;",
            [
                "把 CTE 当永久表反复假设其已存在",
                "过深 CTE 链反而难调试",
            ],
            ["L3_subquery", "L2_group_by"],
            ["L4_recursive_cte", "L3_subquery"],
            3,
            "用 CTE 先汇总员工销售额，再关联姓名排序输出。",
            "能把多层子查询重构为清晰 CTE。",
            ["cte", "with"],
            "PostgreSQL/SQL Server/MySQL 8+/SQLite 均支持；物化提示（MATERIALIZED）因库而异。",
        ),
        node(
            "L4_recursive_cte",
            "L4",
            "递归CTE",
            "Recursive CTE",
            "syntax",
            5,
            45,
            "递归 CTE 由锚点成员与递归成员组成，适合树形结构、层级展开与序列生成。",
            [
                "必须有终止条件避免无限递归",
                "锚点 + UNION ALL + 递归部分",
                "注意最大递归深度限制",
                "层级组织/账单拆分是典型场景",
            ],
            "WITH RECURSIVE nums AS (\n  SELECT 1 AS n\n  UNION ALL\n  SELECT n + 1 FROM nums WHERE n < 5\n)\nSELECT n FROM nums;",
            [
                "缺少 WHERE 终止条件导致引擎报错或挂起",
                "误用 UNION 去重影响递归语义",
            ],
            ["L4_cte"],
            ["L4_cte", "L3_self_multi_join"],
            3,
            "用递归 CTE 生成 1 到 5 的整数序列。",
            "能写出带终止条件的递归 CTE，并解释锚点与递归成员。",
            ["cte", "recursive"],
            "语法为 WITH RECURSIVE；SQL Server 不写 RECURSIVE 关键字但支持递归 CTE。",
        ),
        node(
            "L4_case_expr",
            "L4",
            "CASE",
            "CASE Expression",
            "syntax",
            3,
            30,
            "CASE 在 SQL 中做条件表达式，用于分档、映射与条件聚合。",
            [
                "简单 CASE 与搜索 CASE 两种形式",
                "必须有结果类型一致的分支",
                "ELSE 缺省则为 NULL",
                "常与 SUM(CASE...) 做透视",
            ],
            "SELECT full_name, salary,\n  CASE\n    WHEN salary >= 11000 THEN 'senior'\n    WHEN salary >= 9000 THEN 'mid'\n    ELSE 'junior'\n  END AS salary_band\nFROM employees;",
            [
                "分支重叠导致不符合预期的命中顺序",
                "忘记 ELSE 导致大量 NULL 分档",
            ],
            ["L1_computed_columns"],
            ["L2_aggregate_funcs", "L4_null_date_str"],
            3,
            "把商品按单价分为 high/mid/low 三档。",
            "能用 CASE 做分档与条件聚合。",
            ["case", "expression"],
            "标准 CASE；部分库另有 IIF/DECODE 等方言函数。",
        ),
        node(
            "L4_null_date_str",
            "L4",
            "NULL/日期/字符串函数",
            "NULL / Date / String Functions",
            "skill",
            3,
            40,
            "掌握 COALESCE/NULLIF、日期加减截断、字符串拼接与截取，是清洗与报表的基础。",
            [
                "COALESCE 取首个非空",
                "日期函数用于统计周期对齐",
                "字符串函数注意字符集与长度单位",
                "NULL 参与运算结果常为 NULL",
            ],
            "SELECT\n  e.full_name,\n  COALESCE(e.department, 'Unknown') AS dept,\n  UPPER(p.category) AS category_code,\n  o.order_date,\n  CAST(o.order_date AS VARCHAR(10)) AS order_date_text\nFROM orders o\nJOIN employees e ON e.employee_id = o.employee_id\nJOIN products p ON p.product_id = o.product_id;",
            [
                "用 '' 与 NULL 混用导致过滤遗漏",
                "跨库照搬日期函数名",
            ],
            ["L1_where", "L1_computed_columns"],
            ["L4_case_expr", "L6_dialect_diff"],
            4,
            "把 department 为空的员工显示为 Unknown，并输出其姓名大写形式。",
            "能熟练处理 NULL、日期与字符串的常见转换。",
            ["null", "date", "string"],
            "函数名差异大：PostgreSQL 用 || / DATE_TRUNC；MySQL 用 CONCAT / DATE_FORMAT；SQL Server 用 + / DATEADD。",
        ),
        # ---------- L5 ----------
        node(
            "L5_table_design",
            "L5",
            "表设计与范式",
            "Table Design & Normalization",
            "concept",
            4,
            45,
            "通过主键、外键、范式与合理冗余设计稳定的表结构，服务查询与一致性。",
            [
                "1NF/2NF/3NF 降低冗余与更新异常",
                "主键稳定、外键表达关系",
                "适度反范式服务分析查询",
                "约束比应用层校验更可靠",
            ],
            "CREATE TABLE employees (\n  employee_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  department VARCHAR(50),\n  hire_date DATE NOT NULL,\n  salary NUMERIC(10,2) CHECK (salary > 0)\n);",
            [
                "无键表导致无法唯一定位行",
                "过度范式化导致分析查询过度 JOIN",
            ],
            ["L0_sample_schema"],
            ["L5_index_explain", "L5_view"],
            3,
            "为 orders 补充合理外键与非空约束，并说明是否需要冗余 product_name。",
            "能按范式评估表设计，并权衡冗余与查询性能。",
            ["ddl", "modeling"],
            "约束语法大体标准；部分 MySQL 引擎对 CHECK 的强制程度因版本而异。",
        ),
        node(
            "L5_index_explain",
            "L5",
            "索引与EXPLAIN",
            "Indexes & EXPLAIN",
            "tool",
            4,
            50,
            "索引加速查找与排序；用 EXPLAIN 观察访问路径，验证是否合理使用索引。",
            [
                "B-Tree 索引服务等值与范围查询",
                "最左前缀原则影响复合索引效用",
                "EXPLAIN 看扫描类型、键与行估计",
                "索引不是越多越好，影响写入",
            ],
            "CREATE INDEX idx_orders_employee ON orders(employee_id);\nEXPLAIN SELECT * FROM orders WHERE employee_id = 1;",
            [
                "在低区分度列上盲目建索引",
                "看不懂 EXPLAIN 却大幅改 SQL",
            ],
            ["L3_inner_join", "L1_where"],
            ["L5_tx_locks", "L6_antipatterns"],
            3,
            "为 orders(employee_id) 建索引，并用 EXPLAIN 查看按员工过滤的计划。",
            "能解释基础索引原理，并读懂简单执行计划要点。",
            ["index", "explain"],
            "EXPLAIN 输出格式差异大：PostgreSQL 有 EXPLAIN ANALYZE；MySQL 为 EXPLAIN；SQL Server 多用实际执行计划。",
        ),
        node(
            "L5_tx_locks",
            "L5",
            "事务与锁",
            "Transactions & Locking",
            "concept",
            5,
            50,
            "事务以 ACID 保证一致性；隔离级别与锁机制决定并发异常与性能权衡。",
            [
                "BEGIN/COMMIT/ROLLBACK 控制事务边界",
                "脏读/不可重复读/幻读与隔离级别相关",
                "长事务持锁易拖垮系统",
                "业务上保持事务短小",
            ],
            "BEGIN;\nUPDATE products SET stock_qty = stock_qty - 1 WHERE product_id = 101;\nINSERT INTO orders(order_id, employee_id, product_id, order_date, quantity, amount)\nVALUES (1005, 1, 101, DATE '2024-03-01', 1, 6999);\nCOMMIT;",
            [
                "在事务中做远程调用导致长事务",
                "误以为默认隔离级别能避免所有异常",
            ],
            ["L5_table_design"],
            ["L5_delete", "L5_index_explain"],
            3,
            "用一个事务完成扣减库存并写入订单，失败则回滚。",
            "能说明 ACID 与常见隔离级别，并写出基本事务块。",
            ["transaction", "locking"],
            "默认隔离级别不同：PostgreSQL 常用 Read Committed；MySQL InnoDB 亦然；SQL Server 历史默认偏 READ COMMITTED。",
        ),
        node(
            "L5_view",
            "L5",
            "视图",
            "View",
            "syntax",
            3,
            30,
            "视图是保存的查询定义，查询时展开；用于封装逻辑、权限控制与简化接口。",
            [
                "普通视图通常不存数据",
                "可隐藏底层表结构变化",
                "复杂视图可能不可更新",
                "与物化视图的差异在于是否持久化结果",
            ],
            "CREATE VIEW v_employee_sales AS\nSELECT e.employee_id, e.full_name, COALESCE(SUM(o.amount), 0) AS total_sales\nFROM employees e\nLEFT JOIN orders o ON e.employee_id = o.employee_id\nGROUP BY e.employee_id, e.full_name;\nSELECT * FROM v_employee_sales;",
            [
                "把视图当成一定物化的缓存",
                "嵌套过深视图导致性能黑盒",
            ],
            ["L3_left_join", "L2_group_by"],
            ["L5_mview", "L4_cte"],
            3,
            "创建员工销售汇总视图并查询。",
            "能创建与使用视图，并说明其非物化特性。",
            ["view", "ddl"],
            "各库支持 CREATE VIEW；可更新视图规则差异较大。",
        ),
        node(
            "L5_mview",
            "L5",
            "物化视图",
            "Materialized View",
            "syntax",
            4,
            35,
            "物化视图持久化查询结果，通过刷新更新；适合昂贵聚合的加速，但有陈旧数据风险。",
            [
                "结果真实落盘，读更快",
                "需要刷新策略（定时/按需）",
                "占用存储，存在数据延迟",
                "与普通视图是“实时定义 vs 快照结果”",
            ],
            "-- PostgreSQL 示例\nCREATE MATERIALIZED VIEW mv_category_sales AS\nSELECT p.category, SUM(o.amount) AS total_amount\nFROM orders o\nJOIN products p ON p.product_id = o.product_id\nGROUP BY p.category;\nREFRESH MATERIALIZED VIEW mv_category_sales;\nSELECT * FROM mv_category_sales;",
            [
                "不刷新却当实时报表使用",
                "在不支持的引擎照搬语法",
            ],
            ["L5_view", "L2_group_by"],
            ["L5_view", "L5_index_explain"],
            3,
            "说明物化视图相对普通视图的两个优点与两个代价。",
            "能解释物化视图的刷新与一致性权衡。",
            ["materialized-view", "performance"],
            "PostgreSQL/Oracle 原生支持；MySQL 可用汇总表模拟；SQL Server 有索引视图近似。",
        ),
        node(
            "L5_delete",
            "L5",
            "DELETE",
            "DELETE",
            "syntax",
            3,
            25,
            "DELETE 按条件删除行，可事务回滚（在支持事务的引擎中），可触发触发器与外键检查。",
            [
                "务必带 WHERE，否则删全表",
                "可与事务结合，支持回滚",
                "受外键与触发器影响",
                "大批量删除可分批进行",
            ],
            "BEGIN;\nDELETE FROM orders WHERE order_id = 1004;\n-- ROLLBACK;  -- 如需撤销\nCOMMIT;",
            [
                "忘记 WHERE 删除全部数据",
                "在无备份情况下对生产直接 DELETE",
            ],
            ["L5_tx_locks", "L1_where"],
            ["L5_truncate", "L5_drop"],
            3,
            "删除 order_id = 1004 的订单，并说明如何在事务中回滚。",
            "能安全使用带条件的 DELETE，并理解其日志与回滚特性。",
            ["dml", "delete"],
            "事务性 DELETE 依赖引擎；MyISAM 等非事务引擎行为不同。",
        ),
        node(
            "L5_truncate",
            "L5",
            "TRUNCATE",
            "TRUNCATE",
            "syntax",
            3,
            25,
            "TRUNCATE 快速清空表数据，通常是 DDL 或特殊批量操作，多数情况下不可逐行回滚到删除前镜像。",
            [
                "整表清空，速度快",
                "一般不能带 WHERE",
                "重置身份列/序列的行为因库而异",
                "与 DELETE 的日志与回滚语义不同",
            ],
            "-- 慎用：清空整表\n-- TRUNCATE TABLE orders;",
            [
                "把 TRUNCATE 当可条件删除",
                "在有外键引用时直接 TRUNCATE 失败却强行禁用约束",
            ],
            ["L5_delete"],
            ["L5_delete", "L5_drop"],
            2,
            "对比 DELETE 全表与 TRUNCATE 在回滚与性能上的差异。",
            "能说明 TRUNCATE 的适用场景与风险。",
            ["ddl", "truncate"],
            "PostgreSQL 中 TRUNCATE 可事务回滚；MySQL 中行为与版本/引擎相关，需查阅文档。",
        ),
        node(
            "L5_drop",
            "L5",
            "DROP",
            "DROP",
            "syntax",
            3,
            20,
            "DROP 删除数据库对象（表/视图/索引等）及其定义，数据与结构一并移除。",
            [
                "删除的是对象定义，不只是数据",
                "依赖对象可能导致级联或失败",
                "生产环境需权限与变更流程",
                "与 TRUNCATE/DELETE 目标层级不同",
            ],
            "-- 慎用：删除表定义\n-- DROP TABLE IF EXISTS temp_orders;",
            [
                "DROP 错表且无备份",
                "忽略依赖对象导致级联删除",
            ],
            ["L5_table_design"],
            ["L5_truncate", "L5_delete"],
            2,
            "说明 DROP TABLE 与 TRUNCATE TABLE、DELETE 的本质区别。",
            "能安全使用 DROP IF EXISTS，并评估依赖影响。",
            ["ddl", "drop"],
            "IF EXISTS 在现代库广泛支持；级联选项（CASCADE）语义需按方言确认。",
        ),
        # ---------- L6 ----------
        node(
            "L6_analysis_patterns",
            "L6",
            "分析套路",
            "Analytics Patterns",
            "pattern",
            4,
            45,
            "沉淀漏斗、留存、复购、同比环比、RFM 等可复用 SQL 分析模板。",
            [
                "先定义指标口径再写 SQL",
                "用 CTE 拆解多步指标",
                "注意时间区与时区",
                "用窗口函数做序列分析",
            ],
            "WITH monthly AS (\n  SELECT DATE_TRUNC('month', order_date) AS month, SUM(amount) AS revenue\n  FROM orders\n  GROUP BY 1\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_revenue\nFROM monthly;",
            [
                "口径未对齐就对比多个报表",
                "忽略退单/取消状态导致虚高",
            ],
            ["L4_window_intro", "L4_cte"],
            ["L6_sql_bi", "L6_interview"],
            3,
            "计算每月销售额及环比差额（可用示例日期）。",
            "能把业务指标拆成可测试的 SQL 步骤并复用模板。",
            ["analytics", "pattern"],
            "DATE_TRUNC 为 PostgreSQL 风格；其他库用 DATE_FORMAT/DATETRUNC 等替代。",
        ),
        node(
            "L6_interview",
            "L6",
            "面试题",
            "Interview Questions",
            "skill",
            4,
            50,
            "覆盖去重、连续登录、Top-N per group、缺口查找等高频 SQL 面试题型。",
            [
                "先澄清输入输出与边界",
                "优先正确性，再谈优化",
                "窗口函数是面试高频工具",
                "能口述执行思路加分",
            ],
            "SELECT employee_id, order_id, amount\nFROM (\n  SELECT employee_id, order_id, amount,\n         ROW_NUMBER() OVER (PARTITION BY employee_id ORDER BY amount DESC) AS rn\n  FROM orders\n) t\nWHERE rn <= 2;",
            [
                "一上来写超长嵌套却说不清思路",
                "忽略并列名次等边界条件",
            ],
            ["L4_row_number", "L3_exists"],
            ["L6_analysis_patterns", "L6_antipatterns"],
            4,
            "写出每位员工金额最高的两笔订单。",
            "能在限定时间内完成常见题型并解释复杂度。",
            ["interview", "practice"],
            "面试官可能限定某一方言，注意分页与日期函数差异。",
        ),
        node(
            "L6_sql_python",
            "L6",
            "SQL+Python",
            "SQL with Python",
            "tool",
            3,
            40,
            "通过 DB-API/pandas/SQLAlchemy 在 Python 中参数化执行 SQL，完成取数与后处理。",
            [
                "永远使用参数化查询防注入",
                "大数据集注意分批拉取",
                "口径计算能在 SQL 完成的尽量下推",
                "notebook 与脚本要分离凭证",
            ],
            "-- 在 SQL 侧先聚合，再交给 Python\nSELECT employee_id, SUM(amount) AS total_sales\nFROM orders\nGROUP BY employee_id;",
            [
                "字符串拼接 SQL 造成注入风险",
                "把全部明细拉到 Python 再聚合",
            ],
            ["L2_group_by", "L0_env_setup"],
            ["L6_sql_bi", "L6_dialect_diff"],
            2,
            "描述如何用参数化查询按 department 过滤 employees。",
            "能说明 SQL 与 Python 的职责边界与安全取数方式。",
            ["python", "integration"],
            "驱动不同：psycopg/asyncpg、mysqlclient、pyodbc、sqlite3。",
        ),
        node(
            "L6_sql_bi",
            "L6",
            "SQL+BI",
            "SQL with BI Tools",
            "tool",
            3,
            35,
            "在 BI 工具中使用语义层/数据集 SQL，控制粒度、权限与可复用指标。",
            [
                "数据集粒度要稳定",
                "指标定义集中管理避免各看板不一致",
                "行级权限常靠视图或策略",
                "避免在 BI 中复制粘贴巨型 SQL",
            ],
            "CREATE VIEW v_daily_sales AS\nSELECT order_date, SUM(amount) AS revenue, COUNT(*) AS orders_cnt\nFROM orders\nGROUP BY order_date;",
            [
                "看板直接查超大事实表无聚合",
                "同一指标多个 SQL 口径漂移",
            ],
            ["L5_view", "L2_group_by"],
            ["L6_analysis_patterns", "L6_sql_python"],
            2,
            "为 BI 准备日销售额视图，并说明粒度为“日”。",
            "能设计面向 BI 的稳定数据集与指标口径。",
            ["bi", "semantic-layer"],
            "Looker/Power BI/Metabase 等对 SQL 方言与参数语法支持不同。",
        ),
        node(
            "L6_version_migration",
            "L6",
            "版本迁移",
            "Version Migration",
            "skill",
            4,
            40,
            "数据库与 SQL 版本升级时处理弃用语法、行为变更与兼容性验证。",
            [
                "先读发行说明中的 breaking changes",
                "用回归查询对比关键指标",
                "预发环境演练迁移",
                "关注排序规则、时间函数与保留字",
            ],
            "-- 兼容写法示例：显式 CAST，避免隐式转换依赖\nSELECT CAST(order_id AS VARCHAR(20)) AS order_id_text, amount\nFROM orders;",
            [
                "生产直接升级无回滚方案",
                "依赖未文档化的隐式转换",
            ],
            ["L5_table_design", "L0_env_setup"],
            ["L6_dialect_diff", "L5_index_explain"],
            2,
            "列出升级前至少三类需要回归验证的 SQL 行为。",
            "能制定基本的 SQL/数据库升级验证清单。",
            ["migration", "ops"],
            "大版本如 MySQL 5.7→8.0、PostgreSQL 主版本升级都有行为变更清单。",
        ),
        node(
            "L6_dialect_diff",
            "L6",
            "方言差异",
            "SQL Dialect Differences",
            "concept",
            3,
            35,
            "掌握分页、字符串、日期、Upsert、布尔与限流等跨方言差异，写出更可移植的 SQL。",
            [
                "分页：LIMIT vs OFFSET/FETCH vs TOP",
                "字符串拼接与正则函数名不同",
                "Upsert：ON CONFLICT vs ON DUPLICATE KEY",
                "类型与布尔表示不同",
            ],
            "-- 可移植分页思路：标准 OFFSET/FETCH（若目标库支持）\nSELECT full_name, salary\nFROM employees\nORDER BY salary DESC\nOFFSET 0 ROWS FETCH NEXT 3 ROWS ONLY;",
            [
                "把某一方言私有函数当标准",
                "迁移时只改连接串不改 SQL",
            ],
            ["L1_limit", "L4_null_date_str"],
            ["L6_version_migration", "L6_sql_python"],
            3,
            "写出至少三种方言下的 Top-3 员工薪资查询差异要点。",
            "能识别常见方言陷阱并选择可移植写法。",
            ["dialect", "portability"],
            "以 PostgreSQL/MySQL/SQL Server/SQLite 对照学习收益最高。",
        ),
        node(
            "L6_antipatterns",
            "L6",
            "反模式",
            "SQL Antipatterns",
            "pattern",
            4,
            40,
            "识别并避免 SELECT *、隐式转换、相关子查询滥用、在循环中查库、错误使用 UNION 等反模式。",
            [
                "SELECT * 与应用列耦合",
                "函数包住索引列导致无法用索引",
                "N+1 查询应改为集合化 JOIN",
                "用代码循环替代集合运算",
            ],
            "-- 反模式：对索引列包函数\n-- SELECT * FROM orders WHERE YEAR(order_date) = 2024;\n-- 改进：范围条件\nSELECT order_id, order_date, amount\nFROM orders\nWHERE order_date >= DATE '2024-01-01'\n  AND order_date < DATE '2025-01-01';",
            [
                "用 OR 拼接大量条件导致优化器放弃索引",
                "先查全表再在应用过滤",
            ],
            ["L5_index_explain", "L3_union"],
            ["L6_interview", "L3_union_all"],
            3,
            "改写一条对日期列使用 YEAR() 的过滤为可走索引的范围条件。",
            "能点名至少五种反模式并给出改写思路。",
            ["antipattern", "performance"],
            "反模式通用；具体执行计划表现仍取决于引擎与统计信息。",
        ),
    ]

    edges = [
        # prerequisite edges (from node.prerequisites)
        edge("E_prereq_001", "L0_what_is_sql", "L0_db_types", "prerequisite", "先理解 SQL 再看数据库类型"),
        edge("E_prereq_002", "L0_what_is_sql", "L0_env_setup", "prerequisite", "概念后再搭建环境"),
        edge("E_prereq_003", "L0_db_types", "L0_sample_schema", "prerequisite", "认识库类型后导入模型"),
        edge("E_prereq_004", "L0_env_setup", "L0_first_query", "prerequisite", "环境就绪后写首条查询"),
        edge("E_prereq_005", "L0_sample_schema", "L0_first_query", "prerequisite", "有表示例才能查询"),
        edge("E_prereq_006", "L0_first_query", "L1_select", "prerequisite", "首条查询过渡到系统 SELECT"),
        edge("E_prereq_007", "L1_select", "L1_where", "prerequisite", "投影后再过滤"),
        edge("E_prereq_008", "L1_select", "L1_order_by", "prerequisite", "投影后再排序"),
        edge("E_prereq_009", "L1_select", "L1_computed_columns", "prerequisite", "掌握 SELECT 后写表达式"),
        edge("E_prereq_010", "L1_select", "L1_comments", "prerequisite", "会写查询再规范注释"),
        edge("E_prereq_011", "L1_order_by", "L1_limit", "prerequisite", "排序后做 Top-N"),
        edge("E_prereq_012", "L1_where", "L2_aggregate_funcs", "prerequisite", "过滤后再聚合"),
        edge("E_prereq_013", "L2_aggregate_funcs", "L2_group_by", "prerequisite", "聚合函数配合分组"),
        edge("E_prereq_014", "L2_aggregate_funcs", "L2_count_distinct", "prerequisite", "基础聚合后学去重计数"),
        edge("E_prereq_015", "L2_group_by", "L2_having", "prerequisite", "分组后才能滤组"),
        edge("E_prereq_016", "L2_group_by", "L2_exec_order", "prerequisite", "结合分组理解执行顺序"),
        edge("E_prereq_017", "L2_having", "L2_exec_order", "prerequisite", "结合 HAVING 理解顺序"),
        edge("E_prereq_018", "L1_where", "L3_inner_join", "prerequisite", "过滤基础后学连接"),
        edge("E_prereq_019", "L0_sample_schema", "L3_inner_join", "prerequisite", "多表模型支撑 JOIN"),
        edge("E_prereq_020", "L3_inner_join", "L3_left_join", "prerequisite", "先 INNER 再 LEFT"),
        edge("E_prereq_021", "L3_left_join", "L3_right_full_cross", "prerequisite", "理解外连接后再扩展"),
        edge("E_prereq_022", "L3_inner_join", "L3_self_multi_join", "prerequisite", "多表连接建立在 INNER 上"),
        edge("E_prereq_023", "L1_where", "L3_subquery", "prerequisite", "条件查询后学子查询"),
        edge("E_prereq_024", "L2_aggregate_funcs", "L3_subquery", "prerequisite", "聚合子查询常见"),
        edge("E_prereq_025", "L3_subquery", "L3_exists", "prerequisite", "子查询后再学 EXISTS"),
        edge("E_prereq_026", "L1_select", "L3_union", "prerequisite", "会 SELECT 才能集合并"),
        edge("E_prereq_027", "L1_select", "L3_union_all", "prerequisite", "会 SELECT 才能 UNION ALL"),
        edge("E_prereq_028", "L2_group_by", "L4_window_intro", "prerequisite", "理解分组后再学窗口"),
        edge("E_prereq_029", "L3_inner_join", "L4_window_intro", "prerequisite", "多表结果上做窗口分析"),
        edge("E_prereq_030", "L4_window_intro", "L4_row_number", "prerequisite", "窗口入门后学编号"),
        edge("E_prereq_031", "L4_window_intro", "L4_rank", "prerequisite", "窗口入门后学 RANK"),
        edge("E_prereq_032", "L4_window_intro", "L4_dense_rank", "prerequisite", "窗口入门后学 DENSE_RANK"),
        edge("E_prereq_033", "L3_subquery", "L4_cte", "prerequisite", "子查询重构为 CTE"),
        edge("E_prereq_034", "L2_group_by", "L4_cte", "prerequisite", "CTE 中常含聚合"),
        edge("E_prereq_035", "L4_cte", "L4_recursive_cte", "prerequisite", "普通 CTE 后学递归"),
        edge("E_prereq_036", "L1_computed_columns", "L4_case_expr", "prerequisite", "表达式基础上学 CASE"),
        edge("E_prereq_037", "L1_where", "L4_null_date_str", "prerequisite", "过滤场景常遇 NULL"),
        edge("E_prereq_038", "L1_computed_columns", "L4_null_date_str", "prerequisite", "计算列常用函数"),
        edge("E_prereq_039", "L0_sample_schema", "L5_table_design", "prerequisite", "示例模型引申设计"),
        edge("E_prereq_040", "L3_inner_join", "L5_index_explain", "prerequisite", "连接查询需要索引思维"),
        edge("E_prereq_041", "L1_where", "L5_index_explain", "prerequisite", "过滤条件与索引相关"),
        edge("E_prereq_042", "L5_table_design", "L5_tx_locks", "prerequisite", "有表结构再谈事务"),
        edge("E_prereq_043", "L3_left_join", "L5_view", "prerequisite", "视图定义常含连接"),
        edge("E_prereq_044", "L2_group_by", "L5_view", "prerequisite", "视图常封装聚合"),
        edge("E_prereq_045", "L5_view", "L5_mview", "prerequisite", "先视图再物化视图"),
        edge("E_prereq_046", "L2_group_by", "L5_mview", "prerequisite", "物化视图多为聚合"),
        edge("E_prereq_047", "L5_tx_locks", "L5_delete", "prerequisite", "删除应在事务认知下进行"),
        edge("E_prereq_048", "L1_where", "L5_delete", "prerequisite", "DELETE 依赖条件过滤"),
        edge("E_prereq_049", "L5_delete", "L5_truncate", "prerequisite", "理解 DELETE 后对比 TRUNCATE"),
        edge("E_prereq_050", "L5_table_design", "L5_drop", "prerequisite", "理解对象后再 DROP"),
        edge("E_prereq_051", "L4_window_intro", "L6_analysis_patterns", "prerequisite", "分析套路依赖窗口"),
        edge("E_prereq_052", "L4_cte", "L6_analysis_patterns", "prerequisite", "分析套路常用 CTE"),
        edge("E_prereq_053", "L4_row_number", "L6_interview", "prerequisite", "面试高频窗口题"),
        edge("E_prereq_054", "L3_exists", "L6_interview", "prerequisite", "面试常考 EXISTS"),
        edge("E_prereq_055", "L2_group_by", "L6_sql_python", "prerequisite", "Python 取数常先聚合"),
        edge("E_prereq_056", "L0_env_setup", "L6_sql_python", "prerequisite", "需要可连接环境"),
        edge("E_prereq_057", "L5_view", "L6_sql_bi", "prerequisite", "BI 常基于视图/数据集"),
        edge("E_prereq_058", "L2_group_by", "L6_sql_bi", "prerequisite", "BI 指标多聚合"),
        edge("E_prereq_059", "L5_table_design", "L6_version_migration", "prerequisite", "迁移涉及结构变更"),
        edge("E_prereq_060", "L0_env_setup", "L6_version_migration", "prerequisite", "迁移依赖环境"),
        edge("E_prereq_061", "L1_limit", "L6_dialect_diff", "prerequisite", "分页是方言差异典型"),
        edge("E_prereq_062", "L4_null_date_str", "L6_dialect_diff", "prerequisite", "函数方言差异大"),
        edge("E_prereq_063", "L5_index_explain", "L6_antipatterns", "prerequisite", "反模式多与性能相关"),
        edge("E_prereq_064", "L3_union", "L6_antipatterns", "prerequisite", "错误使用 UNION 是反模式"),
        # related
        edge("E_rel_001", "L0_what_is_sql", "L0_first_query", "related", "概念与实践呼应"),
        edge("E_rel_002", "L0_env_setup", "L0_sample_schema", "related", "环境与示例数据配套"),
        edge("E_rel_003", "L1_where", "L1_order_by", "related", "过滤与排序常一起用"),
        edge("E_rel_004", "L1_computed_columns", "L1_comments", "related", "可读性相关实践"),
        edge("E_rel_005", "L2_count_distinct", "L2_group_by", "related", "分组去重计数"),
        edge("E_rel_006", "L3_exists", "L3_left_join", "related", "存在性可用多种写法"),
        edge("E_rel_007", "L3_subquery", "L4_cte", "related", "可读性重构关系"),
        edge("E_rel_008", "L4_case_expr", "L4_null_date_str", "related", "表达式与函数配合"),
        edge("E_rel_009", "L5_view", "L4_cte", "related", "逻辑复用的不同载体"),
        edge("E_rel_010", "L6_sql_python", "L6_sql_bi", "related", "取数链路上下游"),
        edge("E_rel_011", "L6_analysis_patterns", "L6_interview", "related", "套路与考题同源"),
        edge("E_rel_012", "L1_limit", "L4_row_number", "related", "Top-N 的两种实现"),
        # extends
        edge("E_ext_001", "L1_select", "L1_where", "extends", "SELECT 扩展过滤"),
        edge("E_ext_002", "L2_aggregate_funcs", "L2_group_by", "extends", "聚合扩展到分组"),
        edge("E_ext_003", "L3_inner_join", "L3_self_multi_join", "extends", "连接扩展到自连接/多表"),
        edge("E_ext_004", "L4_window_intro", "L4_row_number", "extends", "窗口扩展到编号函数"),
        edge("E_ext_005", "L4_cte", "L4_recursive_cte", "extends", "CTE 扩展到递归"),
        edge("E_ext_006", "L5_view", "L5_mview", "extends", "视图扩展到物化"),
        edge("E_ext_007", "L6_analysis_patterns", "L6_interview", "extends", "分析能力延伸到面试"),
        edge("E_ext_008", "L5_table_design", "L5_index_explain", "extends", "设计后进入性能诊断"),
        # REQUIRED contrasts
        edge("E_ctr_001", "L1_where", "L2_having", "contrasts", "WHERE 滤行 vs HAVING 滤组"),
        edge("E_ctr_002", "L3_inner_join", "L3_left_join", "contrasts", "INNER 仅匹配 vs LEFT 保留左表"),
        edge("E_ctr_003", "L3_union", "L3_union_all", "contrasts", "UNION 去重 vs UNION ALL 保留重复"),
        edge("E_ctr_004", "L4_row_number", "L4_rank", "contrasts", "ROW_NUMBER 唯一号 vs RANK 并列跳号"),
        edge("E_ctr_005", "L4_rank", "L4_dense_rank", "contrasts", "RANK 跳号 vs DENSE_RANK 不跳号"),
        edge("E_ctr_006", "L4_row_number", "L4_dense_rank", "contrasts", "ROW_NUMBER 不并列 vs DENSE_RANK 并列连续"),
        edge("E_ctr_007", "L5_view", "L5_mview", "contrasts", "普通视图即时定义 vs 物化视图快照"),
        edge("E_ctr_008", "L5_delete", "L5_truncate", "contrasts", "DELETE 可条件行删 vs TRUNCATE 整表清空"),
        edge("E_ctr_009", "L5_truncate", "L5_drop", "contrasts", "TRUNCATE 清数据留结构 vs DROP 删对象"),
        edge("E_ctr_010", "L5_delete", "L5_drop", "contrasts", "DELETE 删行 vs DROP 删对象定义"),
    ]

    learning_paths = [
        {
            "path_id": "beginner",
            "name": "初学者路径",
            "name_en": "Beginner Path",
            "audience": "零基础到能写单表/分组/基础多表查询的学习者",
            "duration_days": 14,
            "layer_range": ["L0", "L1", "L2", "L3"],
            "node_ids": [
                "L0_what_is_sql",
                "L0_db_types",
                "L0_env_setup",
                "L0_sample_schema",
                "L0_first_query",
                "L1_select",
                "L1_where",
                "L1_order_by",
                "L1_limit",
                "L1_computed_columns",
                "L1_comments",
                "L2_aggregate_funcs",
                "L2_group_by",
                "L2_having",
                "L2_exec_order",
                "L2_count_distinct",
                "L3_inner_join",
                "L3_left_join",
                "L3_right_full_cross",
                "L3_self_multi_join",
                "L3_subquery",
                "L3_exists",
                "L3_union",
                "L3_union_all",
            ],
            "milestones": [
                {"day": 3, "goal": "完成环境搭建并跑通示例三表查询"},
                {"day": 7, "goal": "独立完成 WHERE/ORDER BY/聚合分组练习"},
                {"day": 14, "goal": "掌握 INNER/LEFT JOIN 与 UNION 基础"},
            ],
            "description": "14 天覆盖 L0–L3：从概念到多表与集合运算。",
        },
        {
            "path_id": "analyst",
            "name": "分析师路径",
            "name_en": "Analyst Path",
            "audience": "业务分析师、数据运营，需独立取数与指标口径",
            "duration_days": 30,
            "layer_range": ["L1", "L2", "L3", "L4"],
            "node_ids": [
                "L1_select",
                "L1_where",
                "L1_order_by",
                "L1_limit",
                "L1_computed_columns",
                "L2_aggregate_funcs",
                "L2_group_by",
                "L2_having",
                "L2_exec_order",
                "L2_count_distinct",
                "L3_inner_join",
                "L3_left_join",
                "L3_self_multi_join",
                "L3_subquery",
                "L3_exists",
                "L3_union",
                "L3_union_all",
                "L4_window_intro",
                "L4_row_number",
                "L4_rank",
                "L4_dense_rank",
                "L4_cte",
                "L4_recursive_cte",
                "L4_case_expr",
                "L4_null_date_str",
            ],
            "milestones": [
                {"day": 7, "goal": "熟练单表过滤排序与聚合"},
                {"day": 15, "goal": "完成多表取数与 EXISTS/子查询"},
                {"day": 30, "goal": "掌握窗口函数、CTE 与分档分析"},
            ],
            "description": "30 天覆盖 L1–L4：面向取数分析与窗口/CTE 进阶。",
        },
        {
            "path_id": "engineer",
            "name": "工程师路径",
            "name_en": "Engineer Path",
            "audience": "后端/数据工程师，需建模、性能、事务与生态集成",
            "duration_days": 45,
            "layer_range": ["L1", "L2", "L3", "L5", "L6"],
            "node_ids": [
                "L1_select",
                "L1_where",
                "L1_order_by",
                "L1_limit",
                "L1_computed_columns",
                "L2_aggregate_funcs",
                "L2_group_by",
                "L2_having",
                "L2_exec_order",
                "L2_count_distinct",
                "L3_inner_join",
                "L3_left_join",
                "L3_right_full_cross",
                "L3_self_multi_join",
                "L3_subquery",
                "L3_exists",
                "L3_union",
                "L3_union_all",
                "L5_table_design",
                "L5_index_explain",
                "L5_tx_locks",
                "L5_view",
                "L5_mview",
                "L5_delete",
                "L5_truncate",
                "L5_drop",
                "L6_analysis_patterns",
                "L6_interview",
                "L6_sql_python",
                "L6_sql_bi",
                "L6_version_migration",
                "L6_dialect_diff",
                "L6_antipatterns",
            ],
            "milestones": [
                {"day": 10, "goal": "巩固查询与多表基础"},
                {"day": 25, "goal": "完成表设计、索引、事务与对象管理"},
                {"day": 45, "goal": "掌握生态集成、方言差异与反模式治理"},
            ],
            "description": "45 天覆盖 L1–L3 与 L5–L6：工程化 SQL 能力。",
        },
    ]

    graph = {
        "graph_meta": {
            "title": "SQL 学习知识图谱",
            "title_en": "SQL Learning Knowledge Graph",
            "version": "1.0.0",
            "language": "zh-CN",
            "description": "面向 employees / orders / products 示例业务的分层 SQL 学习知识图谱（L0–L6）。",
            "sample_business": {
                "domain": "retail_ops",
                "tables": ["employees", "orders", "products"],
                "description": "员工下单销售商品的经典三表模型，贯穿语法示例与练习。",
            },
            "layers_count": 7,
            "total_nodes": 0,
            "total_edges": 0,
            "created_for": "数据学习平台",
        },
        "layers": layers,
        "nodes": nodes,
        "edges": edges,
        "learning_paths": learning_paths,
    }
    graph["graph_meta"]["total_nodes"] = len(nodes)
    graph["graph_meta"]["total_edges"] = len(edges)
    return graph


def validate(graph: dict) -> list[str]:
    errors: list[str] = []

    # meta
    meta = graph.get("graph_meta") or {}
    for k in ("title", "version", "language", "total_nodes", "total_edges", "sample_business"):
        if k not in meta:
            errors.append(f"graph_meta missing {k}")

    layers = graph.get("layers") or []
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    paths = graph.get("learning_paths") or []

    layer_ids = [L["layer_id"] for L in layers]
    if layer_ids != [f"L{i}" for i in range(7)]:
        errors.append(f"layers must be L0-L6 in order, got {layer_ids}")

    node_ids = [n["node_id"] for n in nodes]
    if len(node_ids) != len(set(node_ids)):
        dup = [i for i, c in Counter(node_ids).items() if c > 1]
        errors.append(f"duplicate node_ids: {dup}")

    nodes_by_id = {n["node_id"]: n for n in nodes}
    by_layer = defaultdict(list)
    for n in nodes:
        by_layer[n["layer_id"]].append(n["node_id"])

    for lid, (lo, hi) in LAYER_BOUNDS.items():
        cnt = len(by_layer.get(lid, []))
        if not (lo <= cnt <= hi):
            errors.append(f"{lid} node count {cnt} not in [{lo},{hi}]")

    if meta.get("total_nodes") != len(nodes):
        errors.append(f"total_nodes meta {meta.get('total_nodes')} != {len(nodes)}")
    if meta.get("total_edges") != len(edges):
        errors.append(f"total_edges meta {meta.get('total_edges')} != {len(edges)}")

    for n in nodes:
        for f in REQUIRED_NODE_FIELDS:
            if f not in n:
                errors.append(f"{n.get('node_id')} missing field {f}")
                continue
        if n.get("type") not in VALID_TYPES:
            errors.append(f"{n['node_id']} invalid type {n.get('type')}")
        d = n.get("difficulty")
        if not isinstance(d, int) or not (1 <= d <= 5):
            errors.append(f"{n['node_id']} difficulty must be 1-5")
        kp = n.get("key_points") or []
        if not (3 <= len(kp) <= 5):
            errors.append(f"{n['node_id']} key_points len {len(kp)}")
        cm = n.get("common_mistakes") or []
        if not (2 <= len(cm) <= 4):
            errors.append(f"{n['node_id']} common_mistakes len {len(cm)}")
        pr = n.get("practice") or {}
        if pr.get("exercise_count", 0) < 1 or not pr.get("sample_question"):
            errors.append(f"{n['node_id']} practice invalid")
        for p in n.get("prerequisites") or []:
            if p not in nodes_by_id:
                errors.append(f"{n['node_id']} prereq missing: {p}")
        for r in n.get("related_nodes") or []:
            if r not in nodes_by_id:
                errors.append(f"{n['node_id']} related missing: {r}")
        if n.get("layer_id") not in LAYER_BOUNDS:
            errors.append(f"{n['node_id']} bad layer_id")

    # edges
    edge_ids = [e["edge_id"] for e in edges]
    if len(edge_ids) != len(set(edge_ids)):
        errors.append("duplicate edge_ids")
    for e in edges:
        if e.get("type") not in VALID_EDGE_TYPES:
            errors.append(f"{e.get('edge_id')} bad type")
        if e.get("source") not in nodes_by_id or e.get("target") not in nodes_by_id:
            errors.append(f"{e.get('edge_id')} endpoint missing")

    # required contrasts (undirected check)
    def has_contrast(a: str, b: str) -> bool:
        for e in edges:
            if e["type"] != "contrasts":
                continue
            s, t = e["source"], e["target"]
            if {s, t} == {a, b}:
                return True
        return False

    required_contrasts = [
        ("L1_where", "L2_having"),
        ("L3_inner_join", "L3_left_join"),
        ("L3_union", "L3_union_all"),
        ("L4_row_number", "L4_rank"),
        ("L4_rank", "L4_dense_rank"),
        ("L4_row_number", "L4_dense_rank"),
        ("L5_view", "L5_mview"),
        ("L5_delete", "L5_truncate"),
        ("L5_truncate", "L5_drop"),
        ("L5_delete", "L5_drop"),
    ]
    for a, b in required_contrasts:
        if a not in nodes_by_id or b not in nodes_by_id:
            errors.append(f"contrast endpoints missing: {a} vs {b}")
        elif not has_contrast(a, b):
            errors.append(f"missing contrasts edge: {a} vs {b}")

    # separate nodes asserted
    for nid in (
        "L1_where",
        "L2_having",
        "L3_union",
        "L3_union_all",
        "L4_row_number",
        "L4_rank",
        "L4_dense_rank",
        "L5_view",
        "L5_mview",
        "L5_delete",
        "L5_truncate",
        "L5_drop",
    ):
        if nid not in nodes_by_id:
            errors.append(f"required separate node missing: {nid}")

    # no orphan nodes: every node appears in at least one edge OR is L0 root with outbound via prereq chain
    connected = set()
    for e in edges:
        connected.add(e["source"])
        connected.add(e["target"])
    orphans = [nid for nid in node_ids if nid not in connected]
    if orphans:
        errors.append(f"orphan nodes (no edges): {orphans}")

    # learning paths
    path_by_id = {p["path_id"]: p for p in paths}
    expected_paths = {
        "beginner": (14, ["L0", "L1", "L2", "L3"]),
        "analyst": (30, ["L1", "L2", "L3", "L4"]),
        "engineer": (45, ["L1", "L2", "L3", "L5", "L6"]),
    }
    for pid, (days, layers_exp) in expected_paths.items():
        p = path_by_id.get(pid)
        if not p:
            errors.append(f"missing learning_path {pid}")
            continue
        if p.get("duration_days") != days:
            errors.append(f"{pid} duration_days != {days}")
        if p.get("layer_range") != layers_exp:
            errors.append(f"{pid} layer_range mismatch")
        for nid in p.get("node_ids") or []:
            if nid not in nodes_by_id:
                errors.append(f"{pid} unknown node {nid}")
            else:
                if nodes_by_id[nid]["layer_id"] not in layers_exp:
                    errors.append(f"{pid} node {nid} outside layer_range")

    # sample business mention
    sb = meta.get("sample_business") or {}
    tables = set(sb.get("tables") or [])
    if not {"employees", "orders", "products"}.issubset(tables):
        errors.append("sample_business must include employees/orders/products")

    return errors


def write_summary(graph: dict) -> None:
    by_layer = Counter(n["layer_id"] for n in graph["nodes"])
    lines = [
        "# SQL 学习知识图谱摘要",
        "",
        f"- 标题：{graph['graph_meta']['title']}",
        f"- 版本：{graph['graph_meta']['version']}",
        f"- 语言：{graph['graph_meta']['language']}",
        f"- 示例业务表：employees / orders / products",
        f"- 总节点：{graph['graph_meta']['total_nodes']}",
        f"- 总边：{graph['graph_meta']['total_edges']}",
        "",
        "## 分层节点数",
        "",
    ]
    for i in range(7):
        lid = f"L{i}"
        layer = next(L for L in graph["layers"] if L["layer_id"] == lid)
        lines.append(f"- **{lid} {layer['name']}**：{by_layer[lid]} 个节点")
        for n in graph["nodes"]:
            if n["layer_id"] == lid:
                lines.append(f"  - `{n['node_id']}` {n['title']} ({n['type']}, 难度{n['difficulty']})")
    lines += [
        "",
        "## 学习路径",
        "",
    ]
    for p in graph["learning_paths"]:
        lines.append(
            f"- **{p['name']}** (`{p['path_id']}`)：{p['duration_days']} 天，层级 {', '.join(p['layer_range'])}，{len(p['node_ids'])} 节点"
        )
    lines += [
        "",
        "## 关键对比边（contrasts）",
        "",
        "- WHERE vs HAVING",
        "- INNER JOIN vs LEFT JOIN",
        "- UNION vs UNION ALL",
        "- ROW_NUMBER vs RANK / RANK vs DENSE_RANK / ROW_NUMBER vs DENSE_RANK",
        "- View vs Materialized View",
        "- DELETE vs TRUNCATE / TRUNCATE vs DROP / DELETE vs DROP",
        "",
        "## 文件",
        "",
        f"- JSON：`{JSON_PATH}`",
        f"- 本摘要：`{SUMMARY_PATH}`",
        f"- 校验清单：`{CHECKLIST_PATH}`",
        "",
    ]
    SUMMARY_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_checklist(graph: dict, errors: list[str], json_loads_ok: bool) -> None:
    by_layer = Counter(n["layer_id"] for n in graph["nodes"])
    checks = [
        ("7 layers L0-L6 present", len(graph["layers"]) == 7),
        ("each layer 3-8 nodes", all(3 <= by_layer[f"L{i}"] <= 8 for i in range(7))),
        ("full schema keys", all(k in graph for k in ("graph_meta", "layers", "nodes", "edges", "learning_paths"))),
        ("all node required fields", not any("missing field" in e for e in errors)),
        ("unique node_ids", len({n["node_id"] for n in graph["nodes"]}) == len(graph["nodes"])),
        ("prerequisites exist", not any("prereq missing" in e for e in errors)),
        ("no orphan nodes", not any("orphan" in e for e in errors)),
        ("required contrasts present", not any("missing contrasts" in e or "contrast endpoints" in e for e in errors)),
        ("separate contrast nodes", not any("required separate node" in e for e in errors)),
        ("learning_paths beginner/analyst/engineer", {p["path_id"] for p in graph["learning_paths"]} >= {"beginner", "analyst", "engineer"}),
        ("meta totals match", graph["graph_meta"]["total_nodes"] == len(graph["nodes"]) and graph["graph_meta"]["total_edges"] == len(graph["edges"])),
        ("json.loads passed", json_loads_ok),
        ("validator errors empty", len(errors) == 0),
    ]
    lines = [
        "# SQL Learning KG Validation Checklist",
        "",
        f"Generated for `{JSON_PATH.name}`",
        "",
        "| Check | Status |",
        "| --- | --- |",
    ]
    for name, ok in checks:
        lines.append(f"| {name} | {'PASS' if ok else 'FAIL'} |")
    lines += [
        "",
        "## Counts",
        "",
    ]
    for i in range(7):
        lines.append(f"- L{i}: {by_layer[f'L{i}']}")
    lines += [
        f"- total_nodes: {graph['graph_meta']['total_nodes']}",
        f"- total_edges: {graph['graph_meta']['total_edges']}",
        "",
        "## Validator errors",
        "",
    ]
    if errors:
        for e in errors:
            lines.append(f"- {e}")
    else:
        lines.append("- (none)")
    lines.append("")
    CHECKLIST_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    graph = build_graph()
    errors = validate(graph)

    text = json.dumps(graph, ensure_ascii=False, indent=2)
    JSON_PATH.write_text(text + "\n", encoding="utf-8")

    json_loads_ok = False
    try:
        loaded = json.loads(JSON_PATH.read_text(encoding="utf-8"))
        json_loads_ok = isinstance(loaded, dict) and "nodes" in loaded
        # re-validate loaded
        errors2 = validate(loaded)
        if errors2 and not errors:
            errors = errors2
    except Exception as ex:  # noqa: BLE001
        errors.append(f"json.loads failed: {ex}")

    write_summary(graph)
    write_checklist(graph, errors, json_loads_ok)

    by_layer = Counter(n["layer_id"] for n in graph["nodes"])
    print("=" * 60)
    print("SQL Learning Knowledge Graph — Validation Summary")
    print("=" * 60)
    for i in range(7):
        print(f"  L{i}: {by_layer[f'L{i}']} nodes")
    print(f"  total_nodes: {graph['graph_meta']['total_nodes']}")
    print(f"  total_edges: {graph['graph_meta']['total_edges']}")
    print(f"  learning_paths: {len(graph['learning_paths'])}")
    print(f"  json.loads: {'PASS' if json_loads_ok else 'FAIL'}")
    print(f"  validator: {'PASS' if not errors else 'FAIL'} ({len(errors)} errors)")
    if errors:
        for e in errors:
            print(f"   - {e}")
    print(f"  JSON: {JSON_PATH}")
    print(f"  SUMMARY: {SUMMARY_PATH}")
    print(f"  CHECKLIST: {CHECKLIST_PATH}")
    print("=" * 60)
    return 0 if not errors and json_loads_ok else 1


if __name__ == "__main__":
    sys.exit(main())
