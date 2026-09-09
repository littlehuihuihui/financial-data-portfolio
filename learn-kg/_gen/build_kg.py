# -*- coding: utf-8 -*-
"""Assemble DATA NEXUS knowledge graph HTML."""
import json
from pathlib import Path

OUT = Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html")
HEAD = Path(r"D:\cursor\多行业数据平台\portfolio\learn-kg\_gen\part1_head.html").read_text(encoding="utf-8")

def n(name, text="", children=None, methods=None, code=None):
    d = {"name": name, "text": text}
    if children: d["children"] = children
    if methods: d["methods"] = methods
    if code: d["code"] = code
    return d

# Shared deep fragments
sql_topics = [
  n("增删改查 CRUD", "DML 是日常读写的核心；注意事务边界与幂等。", [
    n("INSERT 写入", "单行/批量插入；UPSERT（ON CONFLICT / ON DUPLICATE KEY）处理幂等。",
      methods=["INSERT INTO t (...) VALUES (...)", "INSERT ... SELECT ...", "ON CONFLICT DO UPDATE（PG）"],
      code="INSERT INTO orders(order_id,user_id,amount,created_at)\nVALUES (1001,88,199.00,NOW());"),
    n("SELECT 查询", "投影、过滤、排序、分页；优先谓词下推与索引列。",
      methods=["WHERE / AND / OR", "ORDER BY / LIMIT", "DISTINCT / GROUP BY"]),
    n("UPDATE / DELETE", "必须带 WHERE；生产常用软删除；TRUNCATE 更快但不可回滚部分引擎。",
      methods=["UPDATE ... SET ... WHERE ...", "DELETE FROM ... WHERE ...", "软删除：status='deleted'"]),
  ]),
  n("DDL 建表与约束", "结构决定后续查询与数据质量上限。", [
    n("列类型与主键", "整数/小数/时间/字符串；主键稳定不可变。",
      methods=["CREATE TABLE", "PRIMARY KEY", "SERIAL / BIGSERIAL / IDENTITY"]),
    n("约束", "UNIQUE / FOREIGN KEY / CHECK / NOT NULL；约束是数据契约。",
      code="CREATE TABLE orders (\n  order_id BIGINT PRIMARY KEY,\n  amount DECIMAL(18,2) CHECK (amount>=0),\n  user_id BIGINT NOT NULL\n);"),
    n("索引", "B-Tree 默认；覆盖索引；避免低选择性列单独建索引。",
      methods=["CREATE INDEX", "复合索引最左前缀", "EXPLAIN 验证是否走索引"]),
  ]),
  n("视图与对象", "封装复杂度与权限边界。", [
    n("逻辑视图 VIEW", "不存数据，每次查底层；适合权限与口径封装。"),
    n("物化视图", "预计算结果；需刷新策略（定时/触发）。"),
    n("CTE 公共表表达式", "WITH ... AS 提升可读性；部分引擎可物化 CTE。",
      code="WITH paid AS (\n  SELECT * FROM orders WHERE status='paid'\n)\nSELECT user_id, SUM(amount) FROM paid GROUP BY 1;"),
  ]),
  n("窗口函数", "在结果集上做排序/累计/前后行对比，不必自连接。", [
    n("排名类", "ROW_NUMBER / RANK / DENSE_RANK",
      methods=["PARTITION BY 分组", "ORDER BY 排序键"]),
    n("分析类", "SUM() OVER / LAG / LEAD / 移动平均",
      code="SELECT user_id, amount,\n  RANK() OVER (PARTITION BY user_id ORDER BY amount DESC) rnk,\n  LAG(amount) OVER (PARTITION BY user_id ORDER BY created_at) prev_amt\nFROM orders;"),
  ]),
  n("优化与执行计划", "先看计划再改 SQL。", [
    n("EXPLAIN / EXPLAIN ANALYZE", "看扫描类型、连接方式、行数估计、实际耗时。",
      methods=["Seq Scan vs Index Scan", "Hash Join / Nested Loop / Merge Join", "代价与行数偏差"]),
    n("常见优化手法", "避免 SELECT *；避免对索引列函数；分区裁剪；谓词下推；统计信息更新。"),
    n("统计与维护", "ANALYZE；重建膨胀索引；大表分区。"),
  ]),
]

# Continue building in the script - engines etc.
print("building...")

# I'll embed the full JS as a big string after defining data structures in Python and json-encoding them.
import json

def detail(subtitle, l1, l2, l3):
    return {"subtitle": subtitle, "l1": l1, "l2": l2, "l3": l3}

def L1(definition, why, source):
    return {"definition": definition, "why": why, "source": source}

def L2(principles, terms, topics, deps, source):
    return {"principles": principles, "terms": terms, "topics": topics, "deps": deps, "source": source}

def L3(tools, code, resources, source):
    return {"tools": tools, "code": code, "resources": resources, "source": source}

def eng(eid, name, tagline, compare, detail_obj):
    return {"id": eid, "name": name, "tagline": tagline, "compare": compare, "detail": detail_obj}

db_engines = [
  eng("postgresql", "PostgreSQL", "开放标准关系库 · OLTP/扩展强",
    {"type":"关系型 RDBMS","workload":"OLTP（亦可轻度分析）","storage":"行存为主；磁盘 + WAL","language":"标准 SQL + PL/pgSQL；扩展丰富","data":"业务表、JSONB、地理、向量(pgvector)","pros":"标准合规、约束严谨、扩展生态（PostGIS/pgvector）","cons":"超大规模分析不如专用列存；运维需掌握 vacuum","scenario":"核心业务库、复杂查询、地理/向量入门"},
    detail("对象关系型数据库 · 扩展生态之王",
      L1("PostgreSQL 是功能完备的开源对象关系型数据库，强调 SQL 标准与可扩展性。","适合作为「真相来源」主库：事务、约束、复杂查询与 JSONB/地理/向量扩展可同库演进。","PostgreSQL 官方文档；《数据库系统概念》"),
      L2(
        ["MVCC 实现高并发读写","WAL 保证崩溃恢复与复制","优化器基于代价选择计划","扩展机制把能力塞进同一引擎"],
        ["MVCC","WAL / PITR","JSONB","扩展 Extensions","EXPLAIN ANALYZE"],
        [
          n("存什么", "结构化业务表为主；JSONB 半结构化；PostGIS 地理；pgvector 向量。"),
          n("语法特点", "高度贴近标准 SQL；窗口函数、CTE、UPSERT（ON CONFLICT）成熟。",
            code="BEGIN;\nUPDATE accounts SET balance=balance-100 WHERE id=1;\nUPDATE accounts SET balance=balance+100 WHERE id=2;\nCOMMIT;"),
          n("快在哪 / 适用", "复杂查询、约束完整性、扩展能力；中大型 OLTP。",
            children=[n("不适用", "百亿行即席 OLAP 宽表扫描——应同步到 ClickHouse/数仓。")]),
          n("运维要点", "autovacuum、连接池（PgBouncer）、主从/Patroni、备份 PITR。"),
        ],
        {"upstream":[],"downstream":["SQL","ETL","数据建模"]},
        "https://www.postgresql.org/docs/"),
      L3(["psql","PgBouncer","PostGIS","pgvector"],
        "CREATE INDEX idx_orders_user_dt ON orders(user_id, created_at);\nEXPLAIN ANALYZE SELECT * FROM orders WHERE user_id=88;",
        [{"name":"PostgreSQL Docs","note":"官方文档"},{"name":"《PostgreSQL 修炼之道》","note":"运维与优化"}],
        "PostgreSQL Documentation"))),
  eng("mysql", "MySQL", "互联网 OLTP 主力 · InnoDB",
    {"type":"关系型 RDBMS","workload":"OLTP 高并发","storage":"InnoDB 行存 + redo/undo","language":"SQL（方言：LIMIT、部分函数差异）","data":"业务二维表、部分 JSON","pros":"生态成熟、运维资料多、主从与分库分表方案多","cons":"复杂分析/窗口函数历史弱于 PG；大表 DDL 需谨慎","scenario":"Web/App 主库、订单账户、高并发读写"},
    detail("开源关系库 · Web 时代默认选项",
      L1("MySQL（InnoDB）是广泛使用的开源关系型数据库，擅长高并发短事务。","互联网业务存量最大；招聘与运维经验丰富，分库分表生态完善。","MySQL 官方文档；《高性能 MySQL》"),
      L2(
        ["InnoDB 聚簇索引组织表","主从复制扩展读","用分库分表水平扩展写"],
        ["InnoDB","Binlog","聚簇索引","MVCC","半同步复制"],
        [
          n("存什么", "业务表（用户/订单/库存）；避免当分析仓。"),
          n("语法与差异", "LIMIT 分页；部分函数名与 PG 不同；JSON 支持逐渐增强。",
            code="UPDATE stock SET qty=qty-1 WHERE sku='A' AND qty>=1;\nSELECT * FROM orders WHERE user_id=88 ORDER BY id DESC LIMIT 20;"),
          n("适用 / 不适用", "适用：高并发 OLTP。不适用：重分析、复杂递归 CTE 场景可评估 PG。"),
          n("优化要点", "最左前缀、覆盖索引、避免回表；大事务拆分；pt-osc 做在线 DDL。"),
        ],
        {"upstream":[],"downstream":["SQL","ETL","实时数据"]},
        "https://dev.mysql.com/doc/"),
      L3(["mysql CLI","ProxySQL","Vitess / ShardingSphere"],
        "EXPLAIN SELECT * FROM orders WHERE user_id=88 AND created_at>='2024-01-01';",
        [{"name":"《高性能 MySQL》","note":"电子工业出版社"},{"name":"MySQL Reference Manual","note":"官方"}],
        "MySQL Reference Manual"))),
  eng("mongodb", "MongoDB", "文档型 · 灵活 Schema",
    {"type":"文档型 NoSQL","workload":"灵活读写 / 中等事务","storage":"BSON 文档；WiredTiger","language":"MQL（find/aggregate），非 SQL","data":"嵌套 JSON 文档、数组、半结构化","pros":"Schema 灵活、水平分片、聚合管道强","cons":"多文档强一致关联弱于 RDBMS；易堆出失控文档","scenario":"内容中台、画像草稿、快速迭代业务对象"},
    detail("文档数据库 · BSON 为中心",
      L1("MongoDB 以 BSON 文档存储数据，用查询语言 MQL 与聚合管道操作。","字段多变、嵌套结构多的业务用关系表会很痛苦时，文档模型更自然。","MongoDB Manual"),
      L2(
        ["面向文档而非范式表","聚合管道 = 声明式变换流","副本集高可用 + 分片扩展"],
        ["BSON","Replica Set","Shard Key","Aggregation Pipeline","事务（多文档有限）"],
        [
          n("存什么", "一篇文档可嵌订单行、标签数组；适合内容/配置/事件型对象。"),
          n("语法", "db.col.find / updateOne / aggregate；不是 SQL。",
            code='db.orders.find({status:"paid",amount:{$gte:100}})\ndb.orders.aggregate([\n  {$match:{status:"paid"}},\n  {$group:{_id:"$region",gmv:{$sum:"$amount"}}}\n])'),
          n("适用 / 不适用", "适用：灵活文档。不适用：强范式多表事务（账务核心仍建议 RDBMS）。"),
        ],
        {"upstream":[],"downstream":["ETL","Python"]},
        "https://www.mongodb.com/docs/"),
      L3(["mongosh","Compass","Atlas"],
        '// update\ndb.users.updateOne({_id:88},{$set:{vip:true}})',
        [{"name":"MongoDB Manual","note":"官方"},{"name":"Aggregation 教程","note":"官方"}],
        "MongoDB Documentation"))),
  eng("redis", "Redis", "内存结构 · 微秒级缓存/队列",
    {"type":"内存键值 / 结构服务","workload":"超低延迟缓存与协作","storage":"内存为主；RDB/AOF 可选持久化","language":"Redis 命令协议 / 客户端 SDK","data":"String/Hash/List/Set/ZSet/Stream","pros":"极快、结构丰富、适合锁/限流/排行榜","cons":"内存成本高；不能当唯一真相库；大数据集需拆分","scenario":"Session、热点缓存、分布式锁、排行榜、轻量队列"},
    detail("内存数据结构服务器",
      L1("Redis 将丰富数据结构放在内存中提供微秒～毫秒级访问，并可配置持久化。","它是速度层而非账本：真相仍在 PG/MySQL，热点与协作状态进 Redis。","Redis 官方文档；《Redis 设计与实现》"),
      L2(
        ["单线程命令执行（简化并发）+ IO 多路","一切皆 key + 结构","过期与淘汰策略管理内存"],
        ["RDB / AOF","淘汰策略 LRU/LFU","Pub/Sub / Stream","Cluster 分片"],
        [
          n("存什么", "缓存对象、计数器、会话、排行榜分数、消息 Stream——不是全量历史订单明细。"),
          n("语法（命令）", "GET/SET、HGET、ZADD、XADD…",
            code="SET user:88:profile '{\"vip\":1}' EX 3600\nZADD rank:game 99.5 user:88\nHSET session:abc user_id 88"),
          n("快在哪", "内存寻址 + 高效结构；适合热点与协作。"),
          n("不适用", "大范围分析扫描、强持久唯一真相、超大 value 滥用。"),
        ],
        {"upstream":["数据库"],"downstream":["实时数据","机器学习/算法"]},
        "https://redis.io/docs/"),
      L3(["redis-cli","RedisInsight","Lettuce/Jedis"],
        "SETNX lock:order:1001 1 EX 10\nINCR rate:api:88",
        [{"name":"Redis Commands","note":"https://redis.io/commands/"},{"name":"《Redis 设计与实现》","note":"机械工业出版社"}],
        "Redis Documentation"))),
  eng("clickhouse", "ClickHouse", "列式 OLAP · 海量聚合",
    {"type":"列式分析库","workload":"OLAP 大批量扫描聚合","storage":"列存压缩；MergeTree 家族","language":"SQL（分析方言）","data":"事件/日志/订单明细宽表","pros":"扫描与聚合极快、压缩比高、物化视图强","cons":"高频点更新/重事务弱；运维与表引擎需学习","scenario":"实时数仓、行为分析、看板加速层"},
    detail("面向分析的列式 DBMS",
      L1("ClickHouse 是为 OLAP 设计的列式数据库，擅长对海量明细做聚合。","MySQL 扛不住的明细即席分析，常同步到 CH 做加速。","ClickHouse 官方文档"),
      L2(
        ["列存只读需要的列","MergeTree 分区+排序键决定性能","尽量追加写入，少做行级更新"],
        ["MergeTree","分区键 / ORDER BY","物化视图","投影 Projection"],
        [
          n("存什么", "点击流、日志、交易明细等追加型事实。"),
          n("语法", "SQL；注意引擎与类型（DateTime64 等）。",
            code="SELECT toDate(event_time) dt, region, sum(amount) gmv\nFROM events\nWHERE event_time >= today()-7\nGROUP BY dt, region;"),
          n("适用 / 不适用", "适用：聚合分析。不适用：作为下单主库、频繁单行 UPDATE。"),
        ],
        {"upstream":["Kafka","ETL"],"downstream":["BI","指标/语义层"]},
        "https://clickhouse.com/docs"),
      L3(["clickhouse-client","Kafka Engine","物化视图"],
        "CREATE TABLE events (...) ENGINE=MergeTree PARTITION BY toYYYYMM(event_time) ORDER BY (region, event_time);",
        [{"name":"ClickHouse Docs","note":"官方"}],
        "ClickHouse Documentation"))),
  eng("milvus", "Milvus", "向量库 · ANN 相似度检索",
    {"type":"向量数据库","workload":"近似最近邻检索 ANN","storage":"向量索引（IVF/HNSW 等）+ 标量","language":"SDK/API（集合、search）","data":"Embedding 向量 + 元数据","pros":"专为大规模向量检索优化","cons":"不是通用事务库；需配合 Embedding 管线","scenario":"推荐召回、语义搜索、RAG"},
    detail("开源向量数据库",
      L1("Milvus 存储高维向量并提供近似最近邻搜索，服务语义检索与推荐召回。","LLM/推荐把内容变成向量后，需要专用检索引擎。","Milvus 官方文档；《智能数据工程》"),
      L2(
        ["索引类型权衡召回与延迟","标量过滤 + 向量检索","与 Embedding 模型流水线解耦"],
        ["Embedding","IVF / HNSW","Collection / Partition","召回率 Recall"],
        [
          n("存什么", "文本/图像/用户表征向量及商品 ID 等标量字段。"),
          n("语法", "Python/Java SDK：create_collection → insert → search。"),
          n("适用 / 不适用", "适用：相似度检索。不适用：替代业务 OLTP。"),
        ],
        {"upstream":["Python","机器学习/算法"],"downstream":["BI"]},
        "https://milvus.io/docs"),
      L3(["pymilvus","Attu","Zilliz Cloud"],
        "# search(collection, data=[vec], limit=5, param={...})",
        [{"name":"Milvus Docs","note":"官方"}],
        "Milvus Documentation"))),
  eng("pgvector", "pgvector", "PG 内向量扩展 · SQL 检索",
    {"type":"关系库扩展（向量）","workload":"中小规模向量 + 事务同库","storage":"PostgreSQL 表内 vector 列","language":"SQL（<=> 等距离运算符）","data":"向量列 + 业务表同库关联","pros":"与业务数据同事务/同 SQL；运维统一","cons":"超大规模向量不如专用库","scenario":"RAG 入门、同库关联检索、中小语料"},
    detail("PostgreSQL 向量扩展",
      L1("pgvector 为 PostgreSQL 增加 vector 类型与相似度运算符/索引。","不想引入独立向量集群时，先用 pgvector 验证业务。","pgvector GitHub / PostgreSQL 生态"),
      L2(
        ["向量即列，可 JOIN 业务表","ivfflat/hnsw 索引加速","仍受 PG 单集群规模约束"],
        ["vector 类型","<=> 余弦/L2","ivfflat / hnsw"],
        [
          n("语法示例", "ORDER BY embedding <=> query_vec LIMIT k",
            code="SELECT id, content FROM docs\nORDER BY embedding <=> '[0.12,0.03]'::vector\nLIMIT 5;"),
          n("适用 / 不适用", "适用：百万级内。不适用：十亿级向量——迁 Milvus 等。"),
        ],
        {"upstream":["PostgreSQL","Python"],"downstream":["机器学习/算法"]},
        "https://github.com/pgvector/pgvector"),
      L3(["CREATE EXTENSION vector","hnsw 索引"],
        "CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);",
        [{"name":"pgvector README","note":"GitHub"}],
        "pgvector project"))),
  eng("elasticsearch", "Elasticsearch", "倒排检索 · 日志与搜索",
    {"type":"搜索引擎 / 文档检索","workload":"全文检索与日志分析","storage":"倒排索引（Lucene）","language":"Query DSL（JSON）；ES|QL 演进中","data":"文档、日志、商品文本","pros":"全文检索强、聚合分析、生态（ELK）","cons":"不是事务库；集群运维复杂；近实时非强一致","scenario":"站内搜索、日志检索、可观测性"},
    detail("基于 Lucene 的分布式搜索引擎",
      L1("Elasticsearch 用倒排索引提供全文搜索与日志分析能力。","数据库 LIKE 扛不住的搜索与日志排查，交给 ES。","Elastic 官方文档"),
      L2(
        ["倒排索引加速词项查找","近实时刷新（refresh）","分片副本分布"],
        ["Index / Shard","倒排索引","Query DSL","ILM 生命周期"],
        [
          n("存什么", "商品标题描述、日志行、文章——文本检索为主。"),
          n("语法", "JSON Query DSL；match/term/bool/aggs。"),
          n("适用 / 不适用", "适用：搜索与日志。不适用：订单账务真相库。"),
        ],
        {"upstream":["ETL","实时数据"],"downstream":["BI"]},
        "https://www.elastic.co/guide/"),
      L3(["Kibana","Logstash / Beats","OpenSearch（兼容分支）"],
        'GET /products/_search\n{"query":{"match":{"title":"无线耳机"}}}',
        [{"name":"Elastic Docs","note":"官方"}],
        "Elastic Documentation"))),
]

bi_engines = [
  eng("tableau", "Tableau", "交互可视分析标杆",
    {"type":"商业 BI","workload":"可视化探索 / 仪表盘","storage":"活查询或抽取 Extract","language":"VizQL + 计算字段","data":"仓表、文件、语义模型","pros":"交互与视觉编码强、企业治理成熟","cons":"授权成本；复杂指标需建模配合","scenario":"分析师探索、高管看板"},
    detail("交互式视觉分析平台",
      L1("Tableau 通过拖拽维度度量生成可视化，底层是 VizQL。","适合专业分析师做深度探索与叙事看板。","Tableau 帮助文档；Few《Now You See It》"),
      L2(["先数据模型后图表","聚合在数据源侧尽量下推","仪表盘应一屏一主题"],
        ["Extract","计算字段","LOD 表达式","行级安全"],
        [n("连接与建模", "活连接 vs 抽取；关系模型/联合。"),
         n("计算与 LOD", "FIXED/INCLUDE/EXCLUDE 控制聚合粒度。"),
         n("发布与权限", "Server/Cloud；项目权限与认证。")],
        {"upstream":["数据仓库","指标/语义层"],"downstream":[]},
        "Tableau Help"),
      L3(["Tableau Desktop/Server","Prep"],"-- 语义：paid_gmv = SUM(amount) WHERE status=paid",
        [{"name":"Tableau Docs","note":"官方"}],"Tableau Documentation"))),
  eng("powerbi", "Power BI", "微软生态自助 BI",
    {"type":"商业 BI","workload":"自助报表 / 企业门户","storage":"Import / DirectQuery / 复合","language":"DAX + Power Query(M)","data":"Excel到仓湖的广泛连接","pros":"Office365 集成、DAX 指标灵活、性价比","cons":"大数据 DirectQuery 需建模功力；容量规划","scenario":"企业报表中心、部门自助"},
    detail("微软商业智能套件",
      L1("Power BI 用 Power Query 取数变换，用 DAX 定义指标与模型。","微软栈企业默认选择；与 Azure/Fabric 集成深。","Microsoft Learn · Power BI"),
      L2(["星型模型是性能关键","Import 与 DirectQuery 取舍","度量值集中管理"],
        ["DAX","Power Query","数据集 Dataset","工作区"],
        [n("模型设计", "维度表+事实表；避免雪花过度。"),
         n("DAX 度量", "CALCULATE、时间智能、迭代函数。",
           code="Paid GMV := CALCULATE(SUM(Orders[Amount]), Orders[Status]=\"paid\")"),
         n("分发", "工作区、应用、行级安全 RLS。")],
        {"upstream":["数据仓库","数据建模"],"downstream":[]},
        "Microsoft Learn"),
      L3(["Power BI Desktop","Fabric","Gateway"],"Paid GMV := CALCULATE(SUM(Orders[Amount]), Orders[Status]=\"paid\")",
        [{"name":"Microsoft Learn","note":"Power BI"}],"Microsoft Documentation"))),
  eng("superset", "Apache Superset", "开源 BI · SQL Lab",
    {"type":"开源 BI","workload":"SQL 探索 + 仪表盘","storage":"依赖后端仓/引擎","language":"SQL + 虚拟数据集","data":"任意 SQL 引擎","pros":"免费、可二次开发、SQL Lab 友好","cons":"企业治理/视觉精致度弱于商业产品","scenario":"数据团队内部分析门户"},
    detail("Apache 开源可视化平台",
      L1("Superset 提供 SQL Lab、图表与仪表盘，对接多种 SQL 引擎。","开源栈与大数据引擎搭配常见。","Apache Superset Documentation"),
      L2(["数据集 Dataset 抽象","缓存与异步查询","角色权限"],
        ["SQL Lab","Virtual Dataset","Cache warmup","RBAC"],
        [n("对接引擎", "Presto/Trino、Hive、PG、ClickHouse 等。"),
         n("仪表盘", "过滤器作用域、下钻、CSS 模板。")],
        {"upstream":["数据仓库","大数据平台"],"downstream":[]},
        "https://superset.apache.org/docs/"),
      L3(["Docker Compose 部署","Celery worker"],"SELECT region, SUM(amount) FROM dws.order_1d GROUP BY 1;",
        [{"name":"Superset Docs","note":"官方"}],"Apache Superset"))),
  eng("metabase", "Metabase", "轻量问答式 BI",
    {"type":"开源/商业 BI","workload":"业务自助问答","storage":"依赖源库","language":"图形查询 + SQL","data":"仓表/业务库只读","pros":"上手极快、问题式探索友好","cons":"超复杂语义层弱于 Looker","scenario":"创业团队、业务自助轻量报表"},
    detail("面向业务的简洁 BI",
      L1("Metabase 强调「提问」式探索与简易仪表盘。","让业务少写 SQL 也能取数。","Metabase 文档"),
      L2(["基于表的图形查询构建器","可嵌入","简单权限"],
        ["Question","Dashboard","Pulse 订阅","Sandboxing"],
        [n("模型与指标", "用 Model 固化常用表；指标可用 SQL 保存。"),
         n("嵌入", "把图表嵌进产品后台。")],
        {"upstream":["数据库","数据仓库"],"downstream":[]},
        "https://www.metabase.com/docs/"),
      L3(["Metabase Cloud/OSS"],"-- saved question SQL",
        [{"name":"Metabase Docs","note":"官方"}],"Metabase Documentation"))),
  eng("looker", "Looker", "LookML 语义层 BI",
    {"type":"语义层驱动 BI","workload":"受控自助 + 嵌入","storage":"直连仓（无抽取为主）","language":"LookML 建模语言","data":"仓内受控视图","pros":"指标口径代码化、Git 协作、治理强","cons":"学习曲线；绑定建模投入","scenario":"中大型企业统一口径与嵌入分析"},
    detail("面向开发者的语义层 BI",
      L1("Looker 用 LookML 定义维度度量与探索模型，再生成 SQL。","把指标治理做成代码评审流程。","Looker / Google Cloud 文档；Kimball"),
      L2(["Explore 基于 view/model","Git 版本管理 LookML","PDT 持久派生表"],
        ["LookML","Explore","PDT","内容访问控制"],
        [n("LookML 核心", "view、dimension、measure、explore。"),
         n("与指标平台关系", "语义层思想与独立指标平台相通。")],
        {"upstream":["数据仓库","指标/语义层","数据建模"],"downstream":[]},
        "Google Cloud Looker Docs"),
      L3(["LookML IDE","Content Validator"],"measure: paid_gmv { type: sum sql: ${amount};; filters: [status: paid] }",
        [{"name":"Looker Docs","note":"Google Cloud"}],"Looker Documentation"))),
]

rt_engines = [
  eng("kafka", "Apache Kafka", "分布式日志 · 事件总线",
    {"type":"消息 / 事件流平台","workload":"高吞吐发布订阅","storage":"磁盘追加日志（Topic-Partition）","language":"Producer/Consumer API；Kafka Streams DSL","data":"事件、CDC、日志、指标流","pros":"高吞吐、可回放、生态成熟（Connect）","cons":"不是数据库；语义与顺序需设计；运维有门槛","scenario":"服务解耦、CDC、实时管道缓冲"},
    detail("分布式提交日志",
      L1("Kafka 以追加日志形式存储事件流，支持多消费者独立进度回放。","实时链路的「总线」：上游写入、下游 Flink/ETL 消费。","Kafka 官方文档；《Kafka 权威指南》"),
      L2(
        ["Partition 并行与顺序（分区内）","Consumer Group 负载均衡","磁盘顺序写换吞吐"],
        ["Topic / Partition / Offset","ISR","Exactly-once（幂等+事务）","Kafka Connect"],
        [
          n("存什么", "变更事件、埋点、CDC 行镜像——保留策略按时间/大小。"),
          n("关键设计", "分区键（避免热点）、压缩主题、Schema Registry。",
            methods=["key 选择影响顺序与倾斜","retention.ms","acks / idempotence"]),
          n("适用 / 不适用", "适用：流缓冲与解耦。不适用：随意点查替代 DB。"),
        ],
        {"upstream":["数据库"],"downstream":["Flink","ETL","数据湖"]},
        "https://kafka.apache.org/documentation/"),
      L3(["Kafka Connect","Schema Registry","kcat"],
        "# 生产/消费概念：topic orders.cdc\n# 消费者组独立提交 offset",
        [{"name":"Kafka Docs","note":"官方"},{"name":"《Kafka 权威指南》","note":"人民邮电出版社"}],
        "Apache Kafka Documentation"))),
  eng("flink", "Apache Flink", "有状态流计算引擎",
    {"type":"流处理引擎","workload":"低延迟有状态计算","storage":"状态后端（RocksDB 等）+ Checkpoint","language":"DataStream API / SQL / CEP","data":"无界事件流上的聚合、连接、窗口","pros":"精确一次、事件时间、状态与窗口强大","cons":"运维与调优复杂；反压与状态膨胀需治理","scenario":"实时指标、风控特征、CDC 入湖入仓"},
    detail("有状态大规模流处理",
      L1("Flink 在无界数据流上做有状态计算，支持事件时间与 Exactly-once 语义。","把「分钟级/秒级」指标与特征从批处理中解放出来。","Flink 官方文档；《流式系统》"),
      L2(
        ["事件时间 vs 处理时间","Checkpoint 实现容错","窗口与水位线 Watermark"],
        ["Watermark","Checkpoint / Savepoint","Keyed State","Flink SQL"],
        [
          n("核心能力", "窗口聚合、双流 JOIN、CEP、CDC（Flink CDC）。",
            code="SELECT user_id, TUMBLE_END(ts, INTERVAL '1' MINUTE) AS w,\n       SUM(amount) AS gmv\nFROM orders GROUP BY user_id, TUMBLE(ts, INTERVAL '1' MINUTE);"),
          n("状态与运维", "RocksDB 状态、增量 Checkpoint、反压监控。"),
          n("适用 / 不适用", "适用：实时管道。简单定时批可用调度+SQL 更省。"),
        ],
        {"upstream":["Kafka"],"downstream":["数据仓库","特征工程","数据湖"]},
        "https://flink.apache.org/docs/"),
      L3(["Flink SQL","Flink CDC","PyFlink"],
        "-- Flink SQL 窗口聚合见上",
        [{"name":"Flink Docs","note":"官方"},{"name":"《流式系统》","note":"O'Reilly / 中译"}],
        "Apache Flink Documentation"))),
  eng("pulsar", "Apache Pulsar", "存算分离流平台（可选）",
    {"type":"消息流平台","workload":"发布订阅 / 队列统一","storage":"BookKeeper 存算分离","language":"Client API；Functions","data":"事件流、多租户主题","pros":"多租户、存算分离、地理复制","cons":"生态与人才相对 Kafka 少","scenario":"云原生多租户消息、需强隔离的流平台"},
    detail("云原生分布式消息流",
      L1("Pulsar 将计算（Broker）与存储（BookKeeper）分离，强调多租户。","在多团队共享流平台时可评估。","Apache Pulsar 文档"),
      L2(["Topic 多租户命名空间","Cursor 消费位点","与 Kafka API 兼容层"],
        ["Tenant / Namespace","BookKeeper","Function"],
        [n("对比 Kafka", "运维模型不同；选型看隔离与云原生需求。")],
        {"upstream":["数据库"],"downstream":["Flink"]},
        "https://pulsar.apache.org/docs/"),
      L3(["pulsar-admin","Pulsar Functions"],"# pulsar-client produce ...",
        [{"name":"Pulsar Docs","note":"官方"}],"Apache Pulsar"))),
]

# Python topics - preserve depth
python_topics = [
  n("A. 用 Python 做数据分析的标准流程", "不是「打开 IDE 就写模型」，而是固定闭环。", [
    n("A1 提出问题与指标", "先写清业务问题、成功指标、时间范围与人群口径。"),
    n("A2 取数 Ingest", "SQLAlchemy/read_sql、仓、Parquet、API；大表下推过滤。"),
    n("A3 探查 EDA", "shape/dtypes/缺失率/分布；info、value_counts、isna().mean()。"),
    n("A4 清洗与变换", "类型、时间、去重、缺失、melt/pivot、merge；产出分析就绪表。"),
    n("A5 聚合与可视化", "groupby；matplotlib/seaborn/plotly；指标+对比+归因。"),
    n("A6 固化与复用", "函数/模块；写回表；需要时包 Streamlit。"),
  ]),
  n("B. 数据分析常用库地图", "掌握「库干什么 + 高频方法」比背全 API 重要。", [
    n("B1 pandas", "内存表 DataFrame：读写清洗合并聚合。",
      methods=["read_csv/parquet/sql — 读入","head/info/describe — 探查","isna/fillna/dropna — 缺失",
               "astype/to_datetime — 类型","loc/iloc/query — 筛选","merge/concat — 关联",
               "groupby().agg() — 聚合","pivot_table/melt — 透视","drop_duplicates — 去重","to_parquet/to_sql — 写出"],
      code="import pandas as pd\ndf=pd.read_parquet('orders.parquet')\ndf['dt']=pd.to_datetime(df['created_at']).dt.date\ngmv=(df.query(\"status=='paid'\").groupby('dt',as_index=False)['amount'].sum())"),
    n("B2 NumPy", "ndarray 向量化；分位、掩码、广播。",
      methods=["np.mean/std/percentile","np.where","broadcasting"]),
    n("B3 matplotlib", "底层绑图：plot/bar/scatter/hist。",
      methods=["plt.subplots OO 接口","savefig"]),
    n("B4 seaborn", "统计图：分布、类别对比、热力。",
      methods=["histplot/boxplot/barplot/lineplot/heatmap"]),
    n("B5 plotly", "交互图；适合塞进 Streamlit。",
      methods=["px.line/bar/scatter","write_html"]),
    n("B6 SciPy / statsmodels", "检验与回归摘要。",
      methods=["ttest_ind","chi2_contingency","OLS.summary()"]),
    n("B7 scikit-learn", "划分、预处理、Pipeline、评估。",
      methods=["train_test_split","StandardScaler","Pipeline","roc_auc_score"]),
    n("B8 SQLAlchemy", "create_engine + read_sql / to_sql。"),
    n("B9 requests", "拉 API JSON；timeout 与重试。"),
    n("B10 Polars / PySpark", "更大表：Polars 单机加速；Spark 分布式。"),
  ]),
  n("C. Python 图形界面三类（易混）", "IDE ≠ Notebook ≠ 业务 GUI。", [
    n("C1 Jupyter 家族", "分析师实验台：单元格+图+说明。"),
    n("C2 IDE", "PyCharm / VS Code / Spyder —— 写代码的 GUI。"),
    n("C3 Web 小应用", "Streamlit / Gradio / Dash 给别人点选。",
      code="import streamlit as st\ndf=...  # 数据\nregion=st.selectbox('地区', df['region'].unique())\nst.line_chart(df.query('region==@region').set_index('dt')['gmv'])"),
    n("C4 桌面 GUI", "Tkinter/PyQt；数据岗更常用 Streamlit。"),
  ]),
  n("D. 高频代码模式", "模板化提速。", [
    n("D1 日聚合", "to_datetime → date → groupby → sum/count。"),
    n("D2 漏斗", "分步 merge 或 pivot；步转化率。"),
    n("D3 留存", "cohort × day_n 透视。",
      methods=["首日 min(event_time)","间隔 dt.days","pivot_table nunique"]),
    n("D4 与 SQL 协作", "大聚合下推仓；Python 做灵活分析与可视化。"),
  ]),
  n("E. 工程与质量底线", "脚本也要能复跑。", [
    n("E1 环境", "venv/conda + requirements/lock。"),
    n("E2 结构", "config/io/transform/analyze/main；密钥不进 Git。"),
    n("E3 校验", "主键唯一、行数、空值率；GE / assert。"),
  ]),
]

nodes = []

def add(node):
    nodes.append(node)

add({
  "id":"database","name":"数据库","category":"storage","catalog":True,"catalogLabel":"引擎列表",
  "detail": detail("事务与分析的持久化系统 · 多引擎选型目录",
    L1("数据库按数据模型组织存储并提供查询/事务能力：关系、文档、键值、列式、向量、搜索等。","是业务真相来源，也是 ETL/实时/仓的上游；选错引擎会把成本与性能问题带进整条链路。","《数据库系统概念》（机械工业出版社）；《智能数据工程》（清华大学出版社）"),
    L2(
      ["先分负载：OLTP vs OLAP vs HTAP","模型决定语法与存法","可靠三件套：WAL/复制、索引计划、备份恢复"],
      ["OLTP","OLAP","ACID","WAL","MVCC","列式存储"],
      [
        n("OLTP vs OLAP", "OLTP：少量行、事务、低延迟（PG/MySQL）。OLAP：大批量扫描聚合（ClickHouse/仓）。"),
        n("多引擎组合", "主库 + 缓存 Redis + 分析 CH + 搜索 ES + 向量 Milvus/pgvector 是常态。"),
        n("怎么选型", "强一致交易→PG/MySQL；灵活文档→Mongo；热点→Redis；海量聚合→CH；语义检索→向量；全文→ES。"),
      ],
      {"upstream":[],"downstream":["SQL","ETL","实时数据","数据仓库","数据建模"]},
      "各引擎官方文档；机械工业出版社《数据库系统概念》"),
    L3(["PostgreSQL","MySQL","MongoDB","Redis","ClickHouse","Milvus","pgvector","Elasticsearch"],
      "-- 见各引擎 L3 示例；先选型再深挖语法",
      [{"name":"《数据库系统概念》","note":"机械工业出版社"},{"name":"各引擎官方文档","note":"PG/MySQL/Redis/CH/..."}],
      "官方文档 + 教材")),
  "engines": db_engines
})

add({
  "id":"sql","name":"SQL","category":"process",
  "detail": detail("结构化查询语言 · 数据读写与建模的通用接口",
    L1("SQL 是管理关系型数据的标准化语言，覆盖查询、定义、操纵、控制与事务。","仓表、报表与特征生产几乎都落在 SQL；是数据从业者的「普通话」。","ISO/IEC 9075；《数据库系统概念》"),
    L2(
      ["声明式：描述结果，优化器选计划","集合思维：JOIN/子查询/窗口","分层：DDL→DML→DQL→优化"],
      ["DDL/DML/DQL/DCL/TCL","EXPLAIN","覆盖索引","窗口函数","物化视图"],
      sql_topics,
      {"upstream":["数据库","数据仓库"],"downstream":["BI","ETL","数据建模","机器学习/算法","指标/语义层"]},
      "Codd 关系模型；PostgreSQL / MySQL 文档"),
    L3(["PostgreSQL","MySQL","ClickHouse","Hive/Spark SQL","BigQuery/Doris"],
      "CREATE TABLE orders (\n  order_id BIGINT PRIMARY KEY,\n  user_id BIGINT NOT NULL,\n  amount DECIMAL(18,2) CHECK (amount>=0),\n  status VARCHAR(16) DEFAULT 'created',\n  created_at TIMESTAMP NOT NULL\n);\nCREATE INDEX idx_user_dt ON orders(user_id, created_at);\nINSERT INTO orders VALUES (1001,88,199.00,'created',NOW());\nUPDATE orders SET status='paid' WHERE order_id=1001;\nCREATE VIEW v_paid AS SELECT * FROM orders WHERE status='paid';\nEXPLAIN\nSELECT user_id, amount,\n  RANK() OVER (PARTITION BY user_id ORDER BY amount DESC) rnk\nFROM orders\nWHERE created_at >= CURRENT_DATE - INTERVAL '30' DAY;",
      [{"name":"PostgreSQL Docs","note":"https://www.postgresql.org/docs/"},{"name":"《SQL 必知必会》","note":"人民邮电出版社"},{"name":"Use The Index, Luke","note":"索引专题"}],
      "PostgreSQL Documentation；《SQL 必知必会》"))
})

add({
  "id":"python","name":"Python","category":"process",
  "detail": detail("数据分析 / 工程编排的通用语言 · 可下钻知识树",
    L1("Python 高可读；数据领域覆盖探索（Notebook+pandas）、生产流水线与轻量 GUI（Streamlit）。","一份技能覆盖取数→清洗→分析→出图→建模→部署。","PSF 文档；《利用 Python 进行数据分析》（机械工业出版社）"),
    L2(
      ["向量化优先，少写行循环","探索与生产分离","环境可复现","出入有边界：幂等写仓、密钥走环境变量"],
      ["DataFrame","Series","向量化","Jupyter","IDE","Streamlit/Gradio"],
      python_topics,
      {"upstream":["数据库","ETL","大数据平台","实时数据"],"downstream":["BI","机器学习/算法","特征工程","数据建模"]},
      "《利用 Python 进行数据分析》；pandas/NumPy/seaborn/Streamlit 文档；PEP 8"),
    L3(["pandas/NumPy","matplotlib/seaborn/plotly","SciPy/statsmodels","scikit-learn","SQLAlchemy","Jupyter/VS Code/PyCharm","Streamlit/Dash","Polars/PySpark","Airflow/Prefect"],
      "import pandas as pd\nimport seaborn as sns\nfrom sqlalchemy import create_engine\nengine=create_engine('postgresql+psycopg2://readonly:@localhost/dw')\ndf=pd.read_sql(\"SELECT user_id,region,amount,created_at,status FROM dwd.orders WHERE created_at>=CURRENT_DATE-INTERVAL '30 day'\",con=engine)\ndf['created_at']=pd.to_datetime(df['created_at']); df['dt']=df['created_at'].dt.date\npaid=df.query(\"status=='paid' and amount>0\").drop_duplicates()\ndaily=paid.groupby(['dt','region'],as_index=False).agg(gmv=('amount','sum'),orders=('amount','size'))\nsns.lineplot(data=daily,x='dt',y='gmv',hue='region')",
      [{"name":"《利用 Python 进行数据分析》","note":"机械工业出版社"},{"name":"pandas 用户指南","note":"官方"},{"name":"Streamlit Docs","note":"https://docs.streamlit.io/"}],
      "机械工业出版社；pandas / Streamlit 官方文档"))
})

add({
  "id":"etl","name":"ETL","category":"process",
  "detail": detail("Extract-Transform-Load · 数据集成流水线",
    L1("ETL/ELT 将多源数据抽取、转换后加载到仓/湖，是分析与智能的原料产线。","没有稳定集成，就没有可信报表与特征；它是「脏数据→可用表」的工厂。","《数据仓库工具箱》；Airbyte/dbt 文档"),
    L2(
      ["批与流互补：日批打底，流补新鲜度","ELT 流行：先入湖/仓再 SQL/dbt 变换","幂等与回补是生产生命线"],
      ["抽取 CDC/全量","缓慢变化维 SCD","幂等写入","数据契约","回填 Backfill"],
      [
        n("抽取 Extract", "JDBC 全量、增量时间戳、CDC（Debezium）日志解析。", [
          n("全量 vs 增量", "全量简单；增量要水位与乱序。"),
          n("CDC", "基于 binlog/WAL，低侵入近实时。"),
        ]),
        n("转换 Transform", "清洗、标准化、关联、轻度聚合；质量规则嵌入。", [
          n("dbt 模式", "SELECT 模型分层 staging→intermediate→mart。",
            methods=["ref()/source()","测试 unique/not_null","文档生成"]),
          n("业务规则", "币种、时区、主键、枚举映射。"),
        ]),
        n("加载 Load", "覆盖、追加、合并（MERGE）；分区覆盖保证幂等。"),
        n("运维", "失败重试、告警、血缘登记、SLA。"),
      ],
      {"upstream":["数据库","SQL","Python","实时数据","调度编排"],"downstream":["大数据平台","数据仓库","数据湖","数据血缘","数据质量"]},
      "Kimball；dbt Docs；Debezium"),
    L3(["Airflow/Dagster","dbt","Airbyte/Fivetran","Spark","Flink CDC","DataX"],
      "-- dbt model example\n-- models/marts/fct_orders.sql\nSELECT o.order_id, o.user_id, o.amount, o.status, o.created_at\nFROM {{ ref('stg_orders') }} o\nWHERE o.amount >= 0",
      [{"name":"dbt Documentation","note":"官方"},{"name":"Kimball Toolkit","note":"维度建模与ETL"}],
      "dbt Labs；Kimball Group"))
})

add({
  "id":"realtime","name":"实时数据","category":"process","catalog":True,"catalogLabel":"引擎列表",
  "detail": detail("流式采集与计算 · Kafka / Flink 等",
    L1("实时数据体系用事件流承载变更，用流引擎做低延迟计算与同步。","支撑风控、实时看板、在线特征；补齐批处理的新鲜度缺口。","《流式系统》；Kafka/Flink 官方文档"),
    L2(
      ["日志总线解耦生产消费","事件时间与水位线处理乱序","端到端语义：至少一次/精确一次"],
      ["Topic","Consumer Group","Watermark","Checkpoint","CDC"],
      [
        n("架构分层", "采集→总线（Kafka）→计算（Flink）→服务/仓表。"),
        n("批流一体", "同一套 SQL/语义覆盖历史回放与实时。"),
        n("常见陷阱", "乱序、重复投递、状态膨胀、热点分区。"),
      ],
      {"upstream":["数据库"],"downstream":["ETL","数据湖","数据仓库","特征工程","机器学习/算法"]},
      "Kafka / Flink Documentation；O'Reilly《流式系统》"),
    L3(["Kafka","Flink","Pulsar","Flink CDC","Spark Structured Streaming"],
      "-- 见 Kafka / Flink 引擎专页",
      [{"name":"Kafka Docs","note":"官方"},{"name":"Flink Docs","note":"官方"}],
      "Apache 官方文档")),
  "engines": rt_engines
})

add({
  "id":"orchestrate","name":"调度编排","category":"process",
  "detail": detail("工作流调度 · DAG 依赖与 SLA",
    L1("调度编排按依赖图定时/事件触发任务（ETL、质检、模型、报表），管理重试与告警。","是数据生产的「操作系统」：没有编排就只有手工脚本。","Airflow 官方文档；《数据密集型应用系统设计》中的批处理讨论"),
    L2(
      ["DAG 表达依赖，避免隐藏顺序","幂等任务 + 清晰执行日期","失败可观测：重试、告警、SLA"],
      ["DAG","Operator/Task","Backfill","Sensor","SLA / SLA miss"],
      [
        n("编排模式", "时间驱动 cron；传感器等待上游；事件驱动（数据集就绪）。", [
          n("Airflow", "Python DAG；丰富 Operator；Worker 水平扩展。",
            methods=["BashOperator/PythonOperator","TaskFlow API","XCom 慎用","Dataset 调度"]),
          n("Dagster / Prefect", "软件定义资产 / 动态流；偏开发体验。"),
          n("云原生", "Argo Workflows、云厂商 Data Pipeline。"),
        ]),
        n("设计原则", "任务粒度适中；配置与代码分离；禁止巨型上帝 DAG。", [
          n("分区与执行日期", "ds/logical_date 贯穿回补。"),
          n("并发与队列", "池化限制打爆源库。"),
        ]),
        n("与质量/血缘", "质检任务挂在关键节点后；运行元数据写入血缘。"),
      ],
      {"upstream":["ETL","Python"],"downstream":["数据仓库","数据质量","机器学习/算法","BI"]},
      "Apache Airflow Docs；Dagster Docs"),
    L3(["Apache Airflow","Dagster","Prefect","DolphinScheduler","Argo"],
      "from airflow import DAG\nfrom airflow.operators.bash import BashOperator\nwith DAG('daily_etl', schedule='@daily', catchup=False) as dag:\n    extract = BashOperator(task_id='extract', bash_command='python extract.py')\n    transform = BashOperator(task_id='transform', bash_command='dbt run')\n    extract >> transform",
      [{"name":"Airflow Documentation","note":"官方"},{"name":"Dagster Docs","note":"资产编排"}],
      "Apache Airflow；相关编排工具文档"))
})

add({
  "id":"bigdata","name":"大数据平台","category":"storage",
  "detail": detail("分布式计算与存储平台 · Hadoop/Spark 生态",
    L1("大数据平台用分布式存储与计算处理单机难以下咽的数据量与复杂度。","仓/湖的计算底座；批处理、交互 SQL、ML 训练常跑在其上。","《Hadoop 权威指南》；Spark 官方文档"),
    L2(
      ["数据本地性与并行分区","存算分离渐成主流","统一 SQL 层降低使用门槛"],
      ["HDFS/对象存储","YARN/K8s","Spark Job","分区裁剪","Catalyst/Tungsten"],
      [
        n("存储层", "HDFS 或 S3/OSS 对象存储；表格式 Iceberg/Hudi/Delta。", [
          n("文件格式", "Parquet/ORC 列式；压缩与谓词下推。"),
        ]),
        n("计算层 Spark", "RDD/DataFrame/Spark SQL；批流 API。", [
          n("优化", "广播连接、AQE、分区数、缓存慎用。",
            methods=["repartition/coalesce","broadcast join","EXPLAIN"]),
        ]),
        n("交互 SQL", "Hive/Presto/Trino/Spark Thrift；与 BI 对接。"),
        n("平台治理", "队列配额、小文件治理、成本账单。"),
      ],
      {"upstream":["ETL","调度编排","实时数据"],"downstream":["数据仓库","数据湖","机器学习/算法","数据血缘"]},
      "Spark Docs；Hadoop 生态文献"),
    L3(["Spark","Hive","Trino/Presto","HDFS/S3","YARN/K8s","Iceberg"],
      "from pyspark.sql import SparkSession\nspark=SparkSession.builder.appName('gmv').getOrCreate()\ndf=spark.read.parquet('s3a://lake/orders')\ndf.filter(\"status='paid'\").groupBy('region').sum('amount').show()",
      [{"name":"Apache Spark Docs","note":"官方"},{"name":"《Hadoop 权威指南》","note":"清华大学出版社相关引进版"}],
      "Apache Spark Documentation"))
})

add({
  "id":"dwh","name":"数据仓库","category":"storage",
  "detail": detail("面向主题的分析型存储 · 单一事实来源",
    L1("数据仓库按主题整合历史数据，支持管理决策与报表，强调一致性与可追溯。","BI/指标/特征的可信底座；与业务库解耦分析负载。","Inmon；Kimball《数据仓库工具箱》"),
    L2(
      ["主题导向与历史可追溯","分层：ODS/DWD/DWS/ADS","维度建模或范式仓库选型"],
      ["事实表/维度表","缓慢变化维 SCD","总线矩阵","数据金层"],
      [
        n("分层架构", "贴源→明细清洗→汇总→应用。", [
          n("ODS", "贴源，少变换，保真。"),
          n("DWD", "一致性清洗、统一枚举与时区。"),
          n("DWS/ADS", "轻度汇总与强应用指标。"),
        ]),
        n("建模方法", "Kimball 星型/雪花；Data Vault 等。", [
          n("事实类型", "事务事实、周期快照、累积快照。"),
          n("维度设计", "代理键、退化维、角色扮演维。"),
        ]),
        n("与湖关系", "仓管高价值结构化；湖存原始与多样；湖仓一体融合。"),
      ],
      {"upstream":["ETL","大数据平台","数据湖","数据建模"],"downstream":["BI","指标/语义层","机器学习/算法","数据治理"]},
      "Kimball Group；Inmon"),
    L3(["Snowflake/BigQuery/Redshift","Doris/StarRocks","Hive+Iceberg","dbt"],
      "-- 星型：fct_sales + dim_date + dim_customer\nSELECT d.month, c.region, SUM(f.amount) gmv\nFROM fct_sales f\nJOIN dim_date d ON f.date_key=d.date_key\nJOIN dim_customer c ON f.customer_key=c.customer_key\nGROUP BY 1,2;",
      [{"name":"《数据仓库工具箱》","note":"电子工业出版社"},{"name":"dbt Best Practices","note":"官方指南"}],
      "Kimball Toolkit；云仓官方文档"))
})

add({
  "id":"lake","name":"数据湖","category":"storage",
  "detail": detail("原始与多样数据的低成本存储 · 开放表格式",
    L1("数据湖在廉价对象存储上保存原始/半结构化/结构化数据，用开放表格式提供事务与时间旅行。","解决「先落再建」与多引擎共用同一份数据；是湖仓一体的底座。","Databricks Delta；Apache Iceberg/Hudi 文档；《智能数据工程》"),
    L2(
      ["Schema-on-read 与演进治理并存","表格式解决一致性与小文件","多引擎（Spark/Trino/Flink）共享"],
      ["对象存储","Iceberg/Delta/Hudi","时间旅行 Time Travel","ACID 表","数据湖仓 Lakehouse"],
      [
        n("为什么需要湖", "源多且原始价值高；仓无法廉价承载全量原始。", [
          n("青铜/银/金分层", "Medallion：Bronze 原始→Silver 清洗→Gold 产品。"),
        ]),
        n("开放表格式", "在 Parquet 上加元数据层：快照、分区演化、UPSERT。", [
          n("Iceberg", "隐式分区、隐藏分区演进、丰富生态。"),
          n("Delta Lake", "与 Databricks/Spark 紧密；日志事务。"),
          n("Hudi", "近实时 upsert、增量消费强。"),
        ]),
        n("治理挑战", "变成数据沼泽：无目录、无质量、无权限。需目录+DQ+治理。",
          methods=["数据目录 Catalog","生命周期冷热分层","列级权限"]),
        n("湖仓一体", "同一表既服务 BI SQL 又服务科学计算。"),
      ],
      {"upstream":["ETL","实时数据","大数据平台"],"downstream":["数据仓库","特征工程","机器学习/算法","数据治理"]},
      "Apache Iceberg Docs；Delta Lake Docs；清华《智能数据工程》"),
    L3(["Apache Iceberg","Delta Lake","Apache Hudi","AWS S3/OSS","Spark/Flink/Trino"],
      "-- Iceberg SQL 示意\nCREATE TABLE lake.orders (...) USING iceberg PARTITIONED BY (days(ts));\nCALL system.snapshot(...); -- 时间旅行查询历史快照",
      [{"name":"Iceberg Documentation","note":"官方"},{"name":"Delta Lake Docs","note":"官方"},{"name":"《智能数据工程》","note":"清华大学出版社"}],
      "Iceberg/Delta/Hudi 官方文档"))
})

add({
  "id":"modeling","name":"数据建模","category":"analyze",
  "detail": detail("从业务到表结构的抽象 · 维度/范式/指标模型",
    L1("数据建模把业务实体与过程抽象为可存储、可查询、可治理的数据结构。","模型质量决定取数效率、口径一致性与返工成本。","《数据仓库工具箱》；《数据库系统概念》ER 章"),
    L2(
      ["先业务语言后技术落表","粒度是事实表第一决策","一致性维度实现跨主题对齐"],
      ["ER 模型","维度建模","粒度 Grain","总线矩阵","规范化 3NF"],
      [
        n("业务理解", "写清实体、事件、指标口径与生命周期。"),
        n("维度建模实务", "选粒度→识别维度→事实→补齐缓慢变化。", [
          n("总线矩阵", "过程×维度复用，避免烟囱。"),
          n("SCD1/2/3", "覆盖、历史行、有限历史列。"),
        ]),
        n("仓外模型", "操作库 3NF；文档模型；宽表反范仅为加速。"),
        n("与指标层", "原子指标落模型，派生交给语义层。"),
      ],
      {"upstream":["数据库","SQL","数据仓库"],"downstream":["ETL","BI","指标/语义层","机器学习/算法"]},
      "Kimball；Chen ER 模型"),
    L3(["PowerDesigner/dbdiagram","dbt","LookML","ER/Studio"],
      "-- grain: 一张订单行一日\n-- fct_order_item (order_id, item_id, date_key, qty, amount, ...)",
      [{"name":"《数据仓库工具箱》","note":"Kimball"},{"name":"《数据库系统概念》","note":"ER/关系"}],
      "Kimball Group；教材"))
})

add({
  "id":"bi","name":"BI","category":"analyze","catalog":True,"catalogLabel":"工具列表",
  "detail": detail("商业智能 · 指标可视化与自助分析",
    L1("BI 通过语义层、报表与仪表盘，将可信数据转化为可行动洞察。","数据价值的消费面：统一口径下做决策。","Gartner BI；电子工业出版社 BI 相关教材"),
    L2(
      ["先指标后图表","视觉编码：位置长度优先","权限与性能：RLS、预聚合、缓存"],
      ["Dashboard","语义层","OLAP","下钻/切片","RLS"],
      [
        n("指标体系", "原子/派生/维度；避免同名不同义——详见「指标/语义层」。"),
        n("仪表盘设计", "一屏一主题；北向指标+归因；少而精。"),
        n("自助 vs 治理", "受控探索与固定报表平衡。"),
        n("嵌入与订阅", "邮件、告警、嵌入业务系统。"),
      ],
      {"upstream":["数据仓库","数据建模","SQL","数据治理","指标/语义层"],"downstream":["机器学习/算法"]},
      "Kimball；Tableau/Power BI/Superset 文档"),
    L3(["Tableau","Power BI","Superset","Metabase","Looker"],
      "SELECT region, DATE(created_at) dt, SUM(amount) paid_gmv\nFROM dws.order_1d WHERE status='paid' GROUP BY 1,2;",
      [{"name":"Apache Superset","note":"开源 BI"},{"name":"Kimball Toolkit","note":"报表与维"}],
      "各 BI 官方文档；Kimball")),
  "engines": bi_engines
})

add({
  "id":"metrics","name":"指标/语义层","category":"analyze",
  "detail": detail("统一口径的指标定义与消费抽象",
    L1("指标/语义层把业务指标定义为可复用、可版本化的对象，屏蔽底层表差异，供 BI/API/实验共用。","解决「同名不同义」；让取数从抄 SQL 变为消费受控指标。","dbt Semantic Layer；LookML；头条/美团等指标平台实践分享"),
    L2(
      ["原子指标 + 修饰词 + 时间周期 = 派生指标","维度可下钻对齐","定义即代码，可评审可测试"],
      ["原子指标","派生指标","维度","语义层 Semantic Layer","口径版本"],
      [
        n("指标体系设计", "先盘点业务北极星与过程指标，再建技术对象。", [
          n("命名规范", "谁的什么在何时何种条件下的度量。"),
          n("一致性", "同一 amount 在订单/支付主题的边界。"),
        ]),
        n("语义层实现", "LookML、Cube、dbt Metric、自研指标服务。", [
          n("生成 SQL", "根据查询维度自动编译聚合查询。"),
          n("缓存与物化", "热点指标预计算。"),
        ]),
        n("消费方式", "BI 绑定、指标 API、特征派生、实验评估。"),
        n("治理", "负责人、变更评审、废弃策略、血缘到报表。"),
      ],
      {"upstream":["数据仓库","数据建模","数据治理"],"downstream":["BI","机器学习/算法","特征工程"]},
      "dbt Semantic Layer Docs；Looker LookML；公开指标平台实践"),
    L3(["dbt Metrics/Semantic Layer","Cube.dev","LookML","自研指标平台"],
      "-- metric: paid_gmv\n-- type: sum\n-- sql: amount\n-- filters: status = 'paid'\n-- dimensions: dt, region, channel",
      [{"name":"dbt Semantic Layer","note":"官方文档"},{"name":"Cube.dev Docs","note":"语义 API"}],
      "dbt Labs；Cube；Looker"))
})

add({
  "id":"ml","name":"机器学习/算法","category":"intel",
  "detail": detail("从数据学习模式并驱动预测与决策",
    L1("机器学习用算法从数据发现模式，服务预测、推荐、分类、聚类与异常检测。","把沉淀数据变成自动化决策；依赖仓表、实时与特征质量。","《统计学习方法》（清华大学出版社）"),
    L2(
      ["监督/无监督/强化学习","特征质量决定上限","MLOps 闭环：训练-评估-部署-监控"],
      ["损失函数","过拟合/正则","AUC/F1","模型服务","向量检索/RAG"],
      [
        n("经典算法", "线性/逻辑回归、树模型 GBDT、聚类、协同过滤。", [
          n("树模型", "XGBoost/LightGBM 表格数据主力。"),
          n("评估", "离线指标 + 校准；分类注意不平衡。"),
        ]),
        n("样本与泄露", "时间切分；禁止用未来信息。", [
          n("偏差", "选择偏差、标签延迟。"),
        ]),
        n("深度学习 / LLM", "表征学习；RAG 需向量库。"),
        n("上线与监控", "特征漂移、效果衰减、回滚。"),
      ],
      {"upstream":["Python","特征工程","数据仓库","大数据平台","实时数据","SQL"],"downstream":["BI"]},
      "《统计学习方法》；scikit-learn 文档"),
    L3(["scikit-learn","XGBoost/LightGBM","PyTorch","MLflow","Feast"],
      "from sklearn.ensemble import GradientBoostingClassifier\nfrom sklearn.model_selection import train_test_split\nX_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.2,shuffle=False)\nclf=GradientBoostingClassifier().fit(X_train,y_train)\nprint(clf.score(X_test,y_test))",
      [{"name":"《统计学习方法》","note":"李航，清华大学出版社"},{"name":"scikit-learn","note":"官方指南"}],
      "清华大学出版社；scikit-learn Docs"))
})

add({
  "id":"feature","name":"特征工程","category":"intel",
  "detail": detail("把原始数据变成模型可消费的信号",
    L1("特征工程从原始日志/仓表构造、选择与服务化模型输入特征，含离线批量与在线点查。","模型上限常由特征决定；需要与实时、仓、质量体系协同。","《特征工程入门与实践》；Feast 文档；广告/推荐特征平台实践"),
    L2(
      ["训练集与服务一致性（训练-服务偏差）","时间旅行：只用当时可知信息","特征存储与监控漂移"],
      ["特征存储 Feature Store","点查/批量","嵌入 Embedding","交叉特征","训练-服务偏差"],
      [
        n("构造方法", "统计（次数/频次）、时间窗聚合、交叉、文本/图像嵌入。", [
          n("窗口特征", "用户近 1h/1d/7d 行为计数。",
            methods=["SQL 窗口/Flink 窗口","避免泄露：截止事件时间"]),
          n("编码", "One-Hot、Target Encoding（慎防泄露）、Hashing。"),
        ]),
        n("Feature Store", "注册、版本、离线物化、在线 KV 服务。", [
          n("Feast 等", "定义 Entity/FeatureView；物化到 Redis/仓。"),
        ]),
        n("质量与监控", "空值率、分布漂移 PSI、服务延迟。"),
        n("与指标层关系", "部分特征可从原子指标派生，但不等于报表指标。"),
      ],
      {"upstream":["Python","数据仓库","实时数据","数据湖","指标/语义层","数据质量"],"downstream":["机器学习/算法"]},
      "Feast Docs；O'Reilly 特征工程相关；业界特征平台分享"),
    L3(["Feast","Tecton","Redis（在线）","Spark/Flink（离线/近线）","pandas"],
      "# 伪代码：近7日购买次数特征\n# SELECT user_id, COUNT(*) AS buy_7d\n# FROM events WHERE type='buy' AND ts < label_time AND ts >= label_time-7d\n# GROUP BY user_id",
      [{"name":"Feast Documentation","note":"官方"},{"name":"《特征工程入门与实践》","note":"相关译著/教材"}],
      "Feast；特征工程专著"))
})

add({
  "id":"lineage","name":"数据血缘","category":"govern",
  "detail": detail("数据从哪来到哪去 · 影响分析与审计",
    L1("数据血缘记录字段/表/任务级的来源与去向，支持影响分析、问题追溯与合规。","改一张表前能看见下游报表/模型；事故时可快速定位上游。","W3C PROV；OpenLineage；DataHub/Atlas"),
    L2(
      ["自动采集优于手工维护","粒度：表级→字段级→任务运行级","与调度/质检元数据打通"],
      ["OpenLineage","PROV-O","影响分析","字段级血缘","元数据仓库"],
      [
        n("采集方式", "解析 SQL、监听 Spark/Flink OpenLineage、调度钩子。", [
          n("OpenLineage", "标准化 Job/Dataset facet。"),
        ]),
        n("应用场景", "变更影响、故障溯源、合规审计、成本归集。"),
        n("可视化", "图导航；与目录、治理平台同屏。"),
        n("挑战", "动态 SQL、临时表、BI 抽取导致断链。"),
      ],
      {"upstream":["ETL","调度编排","大数据平台"],"downstream":["数据治理","数据质量","BI"]},
      "W3C PROV-O；OpenLineage Spec；DataHub"),
    L3(["OpenLineage","DataHub","Apache Atlas","Amundsen","自研解析器"],
      "// OpenLineage 事件概念：run + job + inputs/outputs datasets",
      [{"name":"OpenLineage","note":"https://openlineage.io/"},{"name":"W3C PROV","note":"溯源模型"}],
      "OpenLineage；W3C PROV"))
})

add({
  "id":"governance","name":"数据治理","category":"govern",
  "detail": detail("政策、角色与流程 · 让数据可用、可信、安全",
    L1("数据治理是组织内关于数据资产的决策权、标准、质量、安全与生命周期的制度与工具集合。","技术栈再强，没有治理也会口径混乱与合规风险。","DAMA-DMBOK；国家标准数据管理相关；《数据治理》实践书"),
    L2(
      ["治理是产品+组织，不只是工具","先主数据与指标标准，再铺开","安全与可用平衡"],
      ["数据责任人 Steward","主数据 MDM","数据分类分级","生命周期","合规"],
      [
        n("组织与角色", "Owner/Steward/Consumer；委员会决策。"),
        n("标准与主数据", "客户/商品等实体唯一标识与权威源。"),
        n("安全合规", "分类分级、脱敏、权限审批、审计日志。", [
          n("隐私", "最小化采集；用途限定。"),
        ]),
        n("生命周期", "创建→使用→归档→销毁；湖上冷热分层。"),
        n("工具落地", "目录、质量、血缘、权限中心协同。"),
      ],
      {"upstream":["数据血缘","数据质量","数据仓库"],"downstream":["BI","指标/语义层","ETL"]},
      "DAMA-DMBOK；相关国标与实践"),
    L3(["DataHub/Collibra","Ranger/统一权限","主数据系统","政策知识库"],
      "-- 策略示例：PII 列默认脱敏视图；申请制访问生产明细",
      [{"name":"DAMA-DMBOK","note":"数据管理知识体系"},{"name":"DataHub","note":"开源治理平台"}],
      "DAMA；开源治理工具文档"))
})

add({
  "id":"dq","name":"数据质量","category":"govern",
  "detail": detail("完整性、准确性、一致性、及时性的度量与管控",
    L1("数据质量通过规则、度量与闭环工单，保证数据满足约定用途的可信度。","质量差的数据会污染报表、特征与治理信誉；要「可测、可告警、可归因」。","DAMA 质量维度；Great Expectations；《数据质量实践》相关"),
    L2(
      ["质量维度可度量","规则即代码，进调度","事故要归因到表/字段/任务"],
      ["完整性","准确性","一致性","及时性 Timeliness","唯一性","GE / Soda"],
      [
        n("质量维度", "完整、准确、一致、及时、唯一、有效。", [
          n("完整性", "非空、必需字段覆盖率。"),
          n("一致性", "跨系统同一实体对齐；枚举合法。"),
          n("及时性", "到达 SLA；水位延迟。"),
        ]),
        n("规则实现", "SQL assert、GE expectation、仓内约束。", [
          n("示例规则", "主键唯一、外键孤儿率、金额>=0、日环比波动。",
            methods=["unique","not_null","row_count 波动","分布上下界"]),
        ]),
        n("闭环", "告警→工单→修复→回归；与血缘定位上游。"),
        n("嵌入流水线", "关键 DAG 节点后强制质检门禁。"),
      ],
      {"upstream":["ETL","调度编排","数据血缘"],"downstream":["数据治理","BI","特征工程","指标/语义层"]},
      "DAMA-DMBOK Quality；Great Expectations Docs；Soda"),
    L3(["Great Expectations","Soda","dbt tests","自定义 SQL 监控"],
      "# Great Expectations 概念\n# expect_column_values_to_not_be_null\n# expect_column_values_to_be_unique\n# expect_table_row_count_to_be_between",
      [{"name":"Great Expectations","note":"官方文档"},{"name":"dbt tests","note":"schema.yml"}],
      "GX Docs；dbt；DAMA"))
})

LAYOUT = {
  "database": {"col": 0, "row": 0.5},
  "sql": {"col": 1, "row": 0},
  "python": {"col": 1, "row": 1},
  "etl": {"col": 2, "row": 0},
  "realtime": {"col": 2, "row": 0.55},
  "orchestrate": {"col": 2, "row": 1.1},
  "bigdata": {"col": 3, "row": 0},
  "dwh": {"col": 3, "row": 0.55},
  "lake": {"col": 3, "row": 1.1},
  "modeling": {"col": 4, "row": 0},
  "bi": {"col": 4, "row": 0.55},
  "metrics": {"col": 4, "row": 1.1},
  "ml": {"col": 5, "row": 0.25},
  "feature": {"col": 5, "row": 0.9},
  "lineage": {"col": 2.0, "row": 2},
  "governance": {"col": 3.2, "row": 2},
  "dq": {"col": 4.4, "row": 2},
}

links = [
  {"source":"database","target":"sql","trunk":True},
  {"source":"database","target":"etl","trunk":True},
  {"source":"database","target":"realtime","trunk":True},
  {"source":"sql","target":"etl","trunk":True},
  {"source":"python","target":"etl","trunk":True},
  {"source":"python","target":"orchestrate","trunk":True},
  {"source":"realtime","target":"etl","trunk":True},
  {"source":"orchestrate","target":"etl","trunk":True},
  {"source":"etl","target":"bigdata","trunk":True},
  {"source":"etl","target":"dwh","trunk":True},
  {"source":"etl","target":"lake","trunk":True},
  {"source":"bigdata","target":"dwh","trunk":True},
  {"source":"lake","target":"dwh","trunk":True},
  {"source":"dwh","target":"modeling","trunk":True},
  {"source":"modeling","target":"bi","trunk":True},
  {"source":"dwh","target":"metrics","trunk":True},
  {"source":"metrics","target":"bi","trunk":True},
  {"source":"dwh","target":"ml","trunk":True},
  {"source":"python","target":"feature","trunk":True},
  {"source":"feature","target":"ml","trunk":True},
  {"source":"etl","target":"lineage","trunk":True},
  {"source":"lineage","target":"governance","trunk":True},
  {"source":"dq","target":"governance","trunk":True},
  {"source":"orchestrate","target":"dq","trunk":True},
  # secondary
  {"source":"database","target":"modeling","trunk":False},
  {"source":"sql","target":"bi","trunk":False},
  {"source":"sql","target":"metrics","trunk":False},
  {"source":"sql","target":"ml","trunk":False},
  {"source":"realtime","target":"lake","trunk":False},
  {"source":"realtime","target":"feature","trunk":False},
  {"source":"realtime","target":"bigdata","trunk":False},
  {"source":"lake","target":"feature","trunk":False},
  {"source":"lake","target":"ml","trunk":False},
  {"source":"bigdata","target":"ml","trunk":False},
  {"source":"bigdata","target":"python","trunk":False},
  {"source":"metrics","target":"feature","trunk":False},
  {"source":"modeling","target":"etl","trunk":False},
  {"source":"governance","target":"bi","trunk":False},
  {"source":"governance","target":"etl","trunk":False},
  {"source":"dq","target":"etl","trunk":False},
  {"source":"lineage","target":"dq","trunk":False},
  {"source":"ml","target":"bi","trunk":False},
]

# Serialize + assemble final HTML
nodes_js = json.dumps(nodes, ensure_ascii=False, indent=2)
layout_js = json.dumps(LAYOUT, ensure_ascii=False, indent=2)
links_js = json.dumps(links, ensure_ascii=False, indent=2)

RUNTIME = Path(r"D:\cursor\数据学习平台\数据学习平台\_gen\runtime.js").read_text(encoding="utf-8")
runtime = (RUNTIME
  .replace("__NODES__", nodes_js)
  .replace("__LAYOUT__", layout_js)
  .replace("__LINKS__", links_js))

html = HEAD + runtime + "\n  </script>\n</body>\n</html>\n"
OUT.write_text(html, encoding="utf-8")
print("Wrote", OUT, "bytes", OUT.stat().st_size)
print("nodes", len(nodes), "links", len(links))
ids = [n["id"] for n in nodes]
print("ids", ids)
for req in ["lake","orchestrate","metrics","dq","feature","database","sql","python","bi","etl","bigdata","modeling","dwh","realtime","governance","lineage","ml"]:
  assert req in ids, req
for n in nodes:
  if n.get("catalog"):
    assert n.get("engines"), n["id"]
    for e in n["engines"]:
      assert "compare" in e, e["id"]
      for k in ["type","workload","storage","language","data","pros","cons","scenario"]:
        assert k in e["compare"], (e["id"], k)
print("catalog/compare OK")

