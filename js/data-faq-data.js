/**
 * 数据分析答疑 · 常见问题合集（跨行业共用）
 * window.DATA_FAQ_DATA = { categories, faqs, examples, version }
 */
(function () {
  "use strict";

  const categories = [
    { id: "all", label: "全部问题" },
    { id: "build", label: "作品集怎么做的" },
    { id: "layer", label: "数仓分层" },
    { id: "tech", label: "落地技术栈" },
    { id: "analysis", label: "分析与看板" },
    { id: "interview", label: "面试高频" },
  ];

  const faqs = [
    /* ========== 作品集怎么做的 ========== */
    {
      id: "build-overview",
      cat: "build",
      q: "这个作品集是怎么做出来的？一句话怎么介绍？",
      a: [
        "不是「AI 一键生成的展示站」，而是人定目标与口径、AI 加速结构草稿、人验收可执行产物的协同交付。",
        "交付物要求：可跑数仓（ODS→ADS）+ 可验收方法论（SQL smoke）+ 可演示看板（API 或静态 demo）+ 可追溯版本与血缘。",
      ],
      list: [
        "人对结果负责：北极星、粒度、指标口径、对外叙事由作者拍板",
        "AI 负责增效：场景卡、样板页、跨行业对齐、文档与回归脚本",
        "禁止把未跑通 SQL、未对账指标、未声明粒度的宽表当「已交付真理」",
      ],
      exampleKey: "overview",
    },
    {
      id: "build-framework",
      cat: "build",
      q: "分析框架基于什么生成？AI 在其中做什么？",
      a: "框架先由人定骨架，再让 AI 按骨架扩写，而不是反过来让模型「发明业务」。",
      list: [
        "建模底座：Kimball 四步 + ODS/DIM/DWD/DWS/ADS，禁止 ADS 直读 ODS",
        "分析骨架：六层方法论（描述→诊断→预测→评估→优化→工具箱）与监控五层（北极星/围栏/核心/先导/诊断）",
        "AI 角色：扩写场景卡、PLAYBOOKS、样例 SQL、页面结构；不擅自改粒度与业务定义",
        "人审定：北极星分阶段、门禁规则、表粒度、指标口径最终拍板",
      ],
    },
    {
      id: "build-trust",
      cat: "build",
      q: "知识可信度怎么控制？怎么证明不是「只有故事」？",
      a: "用可执行验收代替口头自信：能跑、能对账、能回溯。",
      list: [
        "方法论 SQL 对库 smoke；看板优先读 DWS/ADS",
        "DQC 门禁（对象/阈值/BLOCK·WARN）与 ETL SLA；失败不宣称「看板就绪」",
        "表级血缘 A→B、代码路径、调度依赖可回查",
        "配置写入 portfolio_metadata.version_history，改动可回溯",
      ],
    },
    {
      id: "build-hitl",
      cat: "build",
      q: "人机协同怎么定位？面试怎么讲？",
      a: [
        "人对结果负责：业务问题、指标定义、对外口径、演示叙事的最终责任人是作者，不是模型。",
        "AI 负责增效：草稿生成、重复样板、跨行业对齐、回归脚本与文档同步。",
      ],
      list: [
        "能说清：哪一层是人定的、哪一层是 AI 扩写的、用什么手段验过",
        "姊妹站可参考行业百科「人机协同」章节；本平台强调可跑数仓 + 可验收方法论",
      ],
    },
    {
      id: "build-structure",
      cat: "build",
      q: "作品集整体结构是怎样的？从哪进门？",
      a: "平台首页选行业 → 看板 SPA / 方法论 / 数仓架构（字典·全景·图谱·答疑）。三行业库与 API 端口隔离，共享组件在 portfolio/js。",
      list: [
        "零售 :5000 · 互联网 :5001 · 制造 :5002 · 平台入口 :5100",
        "无库时可走 data/demo JSON，GitHub Pages 也能演示",
        "架构页按需懒加载字典/图谱，减轻首屏",
      ],
      exampleKey: "overview",
    },
    {
      id: "build-deliverables",
      cat: "build",
      q: "做完一个行业模块，最低要交付哪些东西？",
      list: [
        "分层 DDL + seed/ETL 可复跑",
        "DWS/ADS（或兼容视图）+ Flask API 或 demo JSON",
        "主题看板 + 角色导航配置",
        "方法论场景（含可跑 SQL）与数据字典",
        "血缘/版本快照（便于改动影响面检查）",
      ],
      a: "缺一项都可以演示「好看的图」，但不构成可验收的数据分析作品集。",
    },

    /* ========== 数仓分层 ========== */
    {
      id: "layer-overview",
      cat: "layer",
      q: "数仓为什么要分 ODS→DIM→DWD→DWS→ADS 五层？",
      a: [
        "分层不是为了「看起来专业」，而是为了把不同职责隔开：贴源可追溯、维度可复用、明细可分析、汇总可加速、应用可交付。",
        "用工厂类比：ODS 是原料仓（尽量原样）；DIM 是标准件库（品牌/渠道/用户等统一编码）；DWD 是加工后的明细工件（一行业务事件说得清）；DWS 是按常用规格预装的半成品（日×品牌等）；ADS 是摆上货架的成品组合（某个看板要的一包指标）。",
        "记忆口诀：ODS 存原始 → DIM 定口径 → DWD 宽表洗 → DWS 先算好 → ADS 给业务用。",
      ],
      list: [
        "作品集硬约定：看板 / 方法论 SQL 只读 DWS 或 ADS",
        "禁止 ADS 直读 ODS：否则清洗、对账、口径会全堆进报表 SQL，源表一改全家崩",
        "中间层还是质量门禁：DQC 通常卡在进入明细/汇总之前",
      ],
      exampleKey: "overview",
      alsoInterview: true,
    },
    {
      id: "layer-ods",
      cat: "layer",
      q: "ODS 是干什么的？和业务库有什么区别？",
      a: [
        "ODS（操作数据层）把源系统数据「搬进仓库边界」保存，核心原则是贴源：字段含义尽量跟源一致，方便对账和回放，不做强业务改写。",
        "和业务库的区别：业务库服务交易/应用（要高可用、要事务）；ODS 服务分析链路的上游缓冲（要可追溯、可重跑、可与源对账）。作品集里 ODS 常来自 CSV seed 或贴源表结构。",
        "一行通常对应一张原始单据或一条日志。这里可以有金额、数量，但它们还不是「指标口径」，只是源系统当时怎么记。",
      ],
      list: [
        "允许补充：ETL 批次号、入库时间、软删标记",
        "增量频繁，常按日保留分区；命名多为 ods_*",
        "质量：进入 DWD 前常做行数/主键/空值门禁",
      ],
      exampleKey: "ods",
    },
    {
      id: "layer-dim",
      cat: "layer",
      q: "DIM 维度层放什么？为什么说一般没有度量？",
      a: "描述「是谁/在哪/什么类」的主数据与一致性维度，供多个事实/汇总表引用。金额、次数等可聚合数字应在事实或汇总层。",
      list: [
        "变化缓慢（SCD）：全量快照或拉链",
        "同一 brand_code 在销售/费用/库存中含义必须一致",
        "维度 NULL 常用 -1 代理键约定",
      ],
      exampleKey: "dim",
    },
    {
      id: "layer-dwd",
      cat: "layer",
      q: "DWD 明细层最重要的是什么？",
      a: [
        "最重要的是粒度一句话能说清：例如「一行 = 一笔已支付订单行」或「一行 = 一次有效播放」。粒度没声明，后面 SUM/COUNT 都会失去业务含义。",
        "DWD 是清洗后的分析明细：统一编码、处理脏值、挂上维度键（或宽表冗余名称），并带上可加总度量（金额、数量、时长等）。",
        "相对 ODS：ODS 可脏、可贴源冗余；DWD 必须可分析、可复用。相对 DWS：DWD 仍是明细或明细宽表，不是按看板粒度预聚合后的结果。",
      ],
      list: [
        "命名优先 fact_* / dwd_* / dwd_*_wide",
        "作品集常用宽表减少看板 JOIN",
        "可追溯来自哪批 ODS，但不回写污染贴源层",
      ],
      exampleKey: "dwd",
      alsoInterview: true,
    },
    {
      id: "layer-dws",
      cat: "layer",
      q: "DWS 和 ADS 怎么划分？",
      a: "DWS 是公共粒度预聚合（大家都会用的日/月×品牌/渠道等）；ADS 是面向具体看板/场景的指标拼装与口径封装。",
      list: [
        "比率宜存分子分母，展示时再除，避免加权错误",
        "看板消费优先 DWS/ADS，不要每个页面从明细重算",
      ],
      exampleKey: "dws",
      alsoInterview: true,
    },
    {
      id: "layer-ads",
      cat: "layer",
      q: "ADS 用视图还是表？指标口径放哪？",
      a: [
        "原型期视图（v_*）改口径快；生产高并发可物化。关键是口径单一出口。",
        "定义写在字典/元数据；计算落在 ADS/DWS SQL；禁止前端各算各的。",
      ],
      exampleKey: "ads",
    },
    {
      id: "layer-wide",
      cat: "layer",
      q: "为什么作品集常用宽表？和星型模型怎么选？",
      a: "DWD 宽表冗余品牌/渠道名，换取看板少 JOIN。代价是存储与维度变更同步成本。属性极多、变更极频繁时，星型 + 视图可能更干净；生产可混合。",
      exampleKey: "wide",
    },
    {
      id: "layer-kimball",
      cat: "layer",
      q: "Kimball 四步是什么？为什么强调先声明粒度？",
      a: "① 选业务过程 ② 声明粒度 ③ 定维度 ④ 定事实。未声明粒度就禁止拼宽表——否则无法解释一行代表什么，指标无法对账。",
      alsoInterview: true,
    },
    {
      id: "layer-no-skip",
      cat: "layer",
      q: "为什么禁止 ADS/看板直读 ODS？",
      a: "会把清洗、对账、口径锁定绑死在报表 SQL 上，源表一改全家崩；中间层是质量门禁与复用边界。例外必须文档说明。",
      alsoInterview: true,
    },

    /* ========== 落地技术栈 ========== */
    {
      id: "tech-stack-map",
      cat: "tech",
      q: "作品集落地技术栈一张图怎么讲？",
      a: [
        "可以按「数据怎么来 → 怎么存 → 怎么算 → 怎么给页面」四步讲，而不是报一串名词。",
        "① 源数据（CSV/业务库/埋点）经 Python seed 或 SQL ETL 写入 MySQL。② MySQL 里用命名约定模拟 ODS→DIM→DWD→DWS→ADS 五层。③ 看板与方法论只读 DWS/ADS（或兼容视图），经 Flask 变成 JSON；没有库时读 data/demo。④ 前端 HTML/JS + ECharts 展示；需要探索分析时再用 Tableau 连同一套汇总层。",
      ],
      list: [
        "本地选型理由：MySQL 零运维、SQL 好讲、能完整演示分层闭环",
        "生产对照（诚实说）：离线仓常见 Hive/MaxCompute；行为明细常见 ClickHouse；实时常见 Kafka + Flink",
        "面试重点：强调「建模与口径可迁移」，不要假装本地已经是大数据集群",
      ],
      exampleKey: "mysql",
    },
    {
      id: "tech-mysql",
      cat: "tech",
      q: "MySQL 在作品集里到底扮演什么角色？",
      a: [
        "先澄清一件事：这里的 MySQL 同时扮演「仓库载体」和「教学沙盘」，不是生产级海量数仓引擎。",
        "三套独立库：retail_finance（零售）、internet_analytics（互联网）、manufacturing_analytics（制造）。每套库内部用表名前缀/分层目录体现 ODS、DIM、DWD、DWS、ADS，看板禁止跨层直读 ODS。",
        "两条工作流要分开讲：① 灌数流：seed 脚本 / ETL SQL 负责 INSERT、按分区覆盖、重建视图；② 分析流：看板 API、方法论 PLAYBOOKS 几乎全是 SELECT。面试时如果说「我用 MySQL 做分析」，要马上补一句「写入在 ETL，查询在汇总层」。",
      ],
      list: [
        "DDL：各行业 database/*.sql 或零售 sql6_portfolio_model/",
        "查询入口：ADS 视图（v_*）与 DWS 表；前端不直连库",
        "验收：方法论 SQL smoke、行数/金额对账、DQC 门禁",
      ],
      exampleKey: "mysql",
    },
    {
      id: "tech-mysql-types",
      cat: "tech",
      q: "作品集里 MySQL 字段类型和空值怎么约定？为什么要统一？",
      a: [
        "类型和空值约定是为了「同一指标在不同表、不同人手里算出来一致」，不是为了炫规范。",
        "金额一律 DECIMAL(15,2)，注释标明单位（元）。不要用 FLOAT/DOUBLE 存钱：二进制浮点会造成对不上账的「毛刺」。",
        "业务主键/代理键优先 BIGINT；源系统若是字符串单号，在注释里说明，DIM/DWD 里仍建议有稳定关联键。",
        "日期用 DATE，或 STRING 且固定 YYYY-MM-DD；月份常用 YYYYMM 或 YYYY-MM，全仓统一一种，避免 JOIN 时隐式转换导致索引失效。",
      ],
      list: [
        "维度缺失：用约定代理键（常见 -1）表示「未知/未映射」，不要到处留 NULL 导致 JOIN 丢行",
        "指标缺失：聚合前常用 0；比率要存分子分母，展示时再除，避免预存率在汇总时加权错误",
        "状态字段：STRING（或小枚举表），并在字典写清合法取值",
      ],
      sql: {
        title: "金额与空值处理示意",
        code: `SELECT
  COALESCE(brand_sk, -1) AS brand_sk,
  COALESCE(gmv, 0) AS gmv,
  COALESCE(order_cnt, 0) AS order_cnt
FROM dws_sales_daily
WHERE dt = '2024-06-01';`,
      },
      note: "看到 NULL 先问：这是「没发生」还是「发生了但未知」？两种语义不能用同一种填充策略。",
      exampleKey: "mysql",
    },
    {
      id: "tech-mysql-join",
      cat: "tech",
      q: "事实表 JOIN 维度时，度量为什么会被放大？怎么避免？",
      a: [
        "根因：一对多。例如订单事实一行对应一个 order_id，若错误地 JOIN 到「订单行明细」或重复的维度映射，一行事实会变成多行，SUM(gmv) 就会翻倍。",
        "正确姿势：① 先确认两边粒度；② 维度侧保证关联键唯一（或先对维度 DISTINCT/聚合）；③ 需要「先算指标再补名称」时，先按键 GROUP BY，再 LEFT JOIN 维表取名称。",
        "作品集宽表思路：在 DWD 就把 brand_name、channel_name 冗余进去，看板少 JOIN，也减少放大风险；代价是维度改名要同步刷宽表。",
      ],
      sql: [
        {
          title: "❌ 危险：维度不唯一时直接 JOIN 再 SUM",
          code: `-- 若 dim_brand 同一 brand_code 有多行，gmv 会被放大
SELECT b.brand_name, SUM(f.gmv) AS gmv
FROM dws_sales_daily f
LEFT JOIN dim_brand b ON f.brand_code = b.brand_code
GROUP BY b.brand_name;`,
        },
        {
          title: "✅ 稳妥：先聚合事实，再取维度名称",
          code: `SELECT b.brand_name, x.gmv
FROM (
  SELECT brand_code, SUM(gmv) AS gmv
  FROM dws_sales_daily
  WHERE dt BETWEEN '2024-06-01' AND '2024-06-30'
  GROUP BY brand_code
) x
LEFT JOIN dim_brand b ON x.brand_code = b.brand_code;`,
        },
      ],
      note: "排查「数突然大了一圈」：先 COUNT(*) 看行数是否异常膨胀，再查维表关联键是否唯一。",
      exampleKey: "mysql",
      alsoInterview: true,
    },
    {
      id: "tech-mysql-query",
      cat: "tech",
      q: "看板 SQL 一般怎么写？过滤、聚合、排序的推荐顺序是什么？",
      a: [
        "推荐心智模型：先缩小扫描范围，再关联，再聚合，最后排序截断。这样 EXPLAIN 里 rows 更可控，也更贴近「看板只要一小张结果表」。",
        "WHERE 优先贴分区/月份/品牌等过滤条件；需要维表属性时再 JOIN；GROUP BY 对齐展示粒度（日×渠道、月×品牌）；窗口函数若只做环比，优先在「已经汇总后的结果」上做。",
        "SELECT 只取页面要的列，避免 SELECT *。大结果导出另说，交互看板通常几十到几百行足够。",
      ],
      list: [
        "过滤：dt / month_id / brand_code / channel_code / factory_id",
        "关联：事实 LEFT JOIN 维度；一对多先处理唯一性",
        "聚合：SUM/COUNT/COUNT(DISTINCT)；比率用分子分母",
        "窗口：环比、排名、占比（见「窗口函数」专题）",
        "截断：ORDER BY + LIMIT；深翻页用 keyset，不用大 OFFSET",
      ],
      sql: {
        title: "零售经营总览常见骨架（示意）",
        code: `SELECT
  month_id,
  brand_name,
  SUM(gmv) AS gmv,
  SUM(profit) AS profit,
  SUM(profit) / NULLIF(SUM(gmv), 0) AS profit_rate
FROM dws_sales_monthly
WHERE month_id BETWEEN '202401' AND '202412'
  AND brand_code <> '-1'
GROUP BY month_id, brand_name
ORDER BY month_id, gmv DESC;`,
      },
      exampleKey: "mysql",
    },
    {
      id: "tech-mysql-view",
      cat: "tech",
      q: "ADS 为什么常用视图（v_*）？视图和表怎么选？",
      a: [
        "视图是「口径的单一出口」：净利率怎么算、是否含退货、是否含税，写在 CREATE VIEW 里，看板/API/方法论都读同一个名字。改口径改一处，避免前端、Flask、Tableau 各写各的。",
        "视图不负责存数据，每次查询重算（或依赖优化器合并）。原型期、口径还在打磨时非常合适。",
        "改成物理表（物化）的时机：同一视图被高频打、计算重、要稳定的历史快照、或要建更合适的索引。物化后要配套刷新任务，否则又变成「另一套真相」。",
      ],
      list: [
        "作品集：大量 v_overview / v_dupont / v_dau_overview 等",
        "兼容层：methodology_compat_views 一类，用来对齐旧 SQL 名字",
        "规范：视图内部仍然只读 DWS/DWD 合法对象，不直读 ODS",
      ],
      sql: {
        title: "口径封装示意",
        code: `CREATE OR REPLACE VIEW v_overview AS
SELECT
  month_id,
  SUM(gmv) AS gmv,
  SUM(profit) AS profit,
  SUM(profit) / NULLIF(SUM(gmv), 0) AS profit_rate
FROM dws_sales_monthly
GROUP BY month_id;`,
      },
      exampleKey: "mysql",
    },
    {
      id: "tech-mysql-explain",
      cat: "tech",
      q: "怎么用 EXPLAIN 判断这条分析 SQL 是否健康？",
      a: [
        "目标不是背术语，而是回答三个问题：有没有合理用索引/分区？预估扫描行数是否过大？有没有临时表/文件排序炸性能？",
        "先看 type：const/ref/range 通常好于 ALL（全表扫）。再看 key 是否命中你期望的索引；rows 是否离谱；Extra 里 Using filesort / Using temporary 是否出现在超大集合上。",
        "分析场景的常见优化：把过滤条件改成「能用上索引的形式」、先聚合再 JOIN、把 COUNT(DISTINCT) 下沉到 DWS 预计算、避免对索引列套函数。",
      ],
      list: [
        "WHERE DATE(dt)=... → 改成 dt >= ... AND dt < ...",
        "隐式转换：字符列不要和数字直接比",
        "SELECT * 加大回表成本；看板只取需要列",
        "OR 条件、前导 %like 容易放弃索引——用 EXPLAIN 验证，不要只靠感觉",
      ],
      sql: {
        title: "查看计划",
        code: `EXPLAIN
SELECT brand_code, SUM(gmv)
FROM dws_sales_daily
WHERE dt >= '2024-06-01' AND dt < '2024-07-01'
GROUP BY brand_code;`,
      },
      note: "EXPLAIN 是估算；真正慢再上 EXPLAIN ANALYZE（版本允许时）或对比执行时间。作品集数据量不大，重点是展示你有这套排查习惯。",
      exampleKey: "mysql",
      alsoInterview: true,
    },
    {
      id: "tech-window",
      cat: "tech",
      q: "窗口函数和 GROUP BY 有什么区别？什么场景用窗口？",
      a: [
        "用同一句话对比：GROUP BY 会「把多行合成更少的行」；窗口函数会「保留原来的行数，再额外算一列」。",
        "语法拆开看：FUNC() OVER (PARTITION BY 分组键 ORDER BY 排序键 [ROWS/RANGE 帧])。PARTITION BY 像分组；ORDER BY 决定排名方向、累计方向、LAG/LEAD 的「上一行」；不写 PARTITION 就是对当前结果集全部开窗。",
        "选型规则：页面只要「每个品牌一行合计」→ GROUP BY。页面要「每个品牌每月一行，还要看相对上月的变化」→ 先按月×品牌汇总，再对结果做 LAG。页面要「明细还在，但要标每组第几名」→ ROW_NUMBER/RANK。",
        "和 MySQL 聚合函数的关系：SUM() 出现在 SELECT 且带 GROUP BY 时是聚合；写成 SUM() OVER(...) 时是窗口。两者可以出现在同一条 SQL 的不同层（子查询先聚合，外层再开窗）。",
      ],
      list: [
        "ROW_NUMBER()：组内唯一序号；常用于去重取最新、TopN",
        "RANK()：并列同名次，下一排名跳号；DENSE_RANK() 并列不跳号",
        "SUM/AVG/COUNT() OVER(...)：组内总量或累计；占比 = 当前值 / 组内 SUM",
        "LAG(x,n) / LEAD(x,n)：取前/后 n 行，做环比、状态变化",
        "FIRST_VALUE / LAST_VALUE：组内首末值（务必注意默认窗口帧）",
      ],
      sql: [
        {
          title: "对照：只要汇总 → GROUP BY",
          code: `SELECT brand_code, SUM(gmv) AS gmv
FROM dws_sales_daily
WHERE dt >= '2024-06-01' AND dt < '2024-07-01'
GROUP BY brand_code;`,
        },
        {
          title: "① 去重取最新（明细仍在，先编号再筛）",
          code: `SELECT *
FROM (
  SELECT t.*,
         ROW_NUMBER() OVER (
           PARTITION BY device_id
           ORDER BY event_time DESC
         ) AS rn
  FROM dwd_device_operation_wide t
) x
WHERE rn = 1;`,
        },
        {
          title: "② 环比：先有月汇总，再 LAG（不要在最细流水上硬做）",
          code: `SELECT
  month_id,
  gmv,
  LAG(gmv, 1) OVER (ORDER BY month_id) AS gmv_prev,
  gmv / NULLIF(LAG(gmv, 1) OVER (ORDER BY month_id), 0) - 1 AS gmv_mom
FROM dws_sales_monthly
WHERE brand_code = 'B001';`,
        },
        {
          title: "③ 组内占比：行还在，挂上「占当月比例」",
          code: `SELECT
  month_id,
  channel_name,
  gmv,
  gmv / SUM(gmv) OVER (PARTITION BY month_id) AS channel_share
FROM dws_sales_monthly;`,
        },
      ],
      note: "坑位清单：① WHERE 不能直接写 rn=1 与窗口同层，要外包查询；② 开窗粒度错了会出现「看起来像环比其实在比别的组」；③ 大表先开窗很贵，优先 DWS 预聚合；④ 默认窗口帧可能不是整分区，LAST_VALUE 尤其容易踩坑。",
      exampleKey: "mysql",
      alsoInterview: true,
    },
    {
      id: "tech-flask",
      cat: "tech",
      q: "为什么要有 Flask API？为什么前端不直连数据库？",
      a: [
        "把链路画清楚：浏览器 → Flask → MySQL（通常是 DWS/ADS 或视图）→ JSON → ECharts/KPI。Flask 是「把已经算好的口径运送给页面」的层，不是第二个仓库。",
        "若前端直连 MySQL：账号会进浏览器侧风险面；每个页面私写 SQL，净利率很容易各算各的；PDF、Tableau、外部系统也无法稳定复用同一出口。",
        "作品集额外做了降级：API 不可用或 GitHub Pages 无库时，读 data/demo JSON，页脚标明静态演示。面试可以讲「可交付的降级策略」，而不是「只能在我电脑上跑」。",
      ],
      list: [
        "API 负责：参数校验、角色可见范围、执行查询、统一 {ok,data,error}、数字/日期格式化",
        "API 不负责：重清洗、跨天全量重算、私自改指标定义（回 ETL 与 SQL 视图）",
        "端口：零售 5000 / 互联网 5001 / 制造 5002 / 平台入口 5100",
      ],
      exampleKey: "python_flask",
      alsoInterview: true,
    },
    {
      id: "tech-etl",
      cat: "tech",
      q: "ETL 链路和 DQC 门禁怎么设计才算「看板就绪」？",
      a: [
        "链路按层推进：源/CSV → ODS（尽量贴源）→ DWD（声明粒度并清洗）→ DWS（公共汇总）→ ADS（应用口径）→ 看板消费。",
        "「脚本跑完」只说明进程退出码是 0，不说明数是对的。作品集把「看板就绪」定义成：目标分区有数据 + 阻断级 DQC 通过 + 关键对账指标在阈值内。",
        "幂等是底线：同一天的任务跑两遍，结果应与跑一遍相同。常用手法是按分区 DELETE 再 INSERT，或 REPLACE。只插不删，是指标翻倍的高发原因。",
      ],
      list: [
        "DQC 例子：主键唯一、空值率、ODS↔DWD 行数/金额差异、枚举是否落在维表、分区是否产出",
        "表 COMMENT 写清：增量 / 全量 / 快照 / 拉链",
        "血缘：改一张 DWD，要能说出影响哪些 ADS 与看板",
        "时效：财务对账偏 T+1；行为活跃可近实时——先谈业务能容忍多晚，再谈技术",
      ],
      exampleKey: "etl",
      alsoInterview: true,
    },
    {
      id: "tech-viz",
      cat: "tech",
      q: "ECharts 和 Tableau 各自扮演什么角色？",
      a: [
        "ECharts 是作品集页内主可视化：KPI 卡、趋势、结构图必须与同一 API/demo 同源，避免「卡片一个数、图另一个数」。为了首屏性能，ECharts 按需加载，而不是在 head 同步塞进约 1MB。",
        "Tableau 用于连接同一套 DWS/ADS 做探索分析或面试加分演示。正式口径仍以数据字典和 ADS 为准；不要在 Tableau 里另起一套公式当第二真相。",
      ],
      list: [
        "重计算放仓库；前端只渲染小结果集",
        "下钻必须带月份/品牌/产线等过滤条件",
        "数字不一致时：先看页脚数据源 → ADS 口径 → 筛选与粒度 → ETL 分区",
      ],
      exampleKey: "viz",
    },
    {
      id: "tech-frontend",
      cat: "tech",
      q: "前端作品集如何体现工程化？",
      a: [
        "信息架构：平台首页选行业 → 看板 SPA / 方法论 / 架构页（字典、全景、图谱、答疑）。共享逻辑在 portfolio/js，行业差异在 industries/*/js。",
        "所谓工程化，看的是改动能不能控、演示能不能降级、口径能不能对上，而不是有没有上某个时髦前端框架。",
      ],
      list: [
        "静态资源带 ?v= 版本号；改文案必须 bump，避免旧缓存",
        "ECharts、字典、图谱懒加载；壳内可缓存 HTML 与 API，点刷新可清空",
        "角色、月份、北极星阶段可写入 localStorage",
        "Impact Sync：改数仓要同步检查看板、PDF、方法论、Tableau SQL",
        "version_history 快照可回溯配置",
      ],
      exampleKey: "frontend",
    },
    {
      id: "tech-prod",
      cat: "tech",
      q: "只有 MySQL 算数仓经验吗？什么时候该换引擎？",
      a: [
        "算「数仓建模与分析工程」经验：你会分层、定粒度、锁口径、做 DQC、讲调度与可迁移 SQL。这些能力不绑定 Hive。",
        "不算完整的「海量分布式运维」经验。面试要主动拆开讲，并给出生产对照，避免被理解成「只会单机报表」。",
        "换引擎通常不是因为「MySQL 不高级」，而是数据量与查询模式变了：明细过亿且频繁扫全表、并发分析把 CPU 打满、需要列存压缩与高吞吐。先做汇总下沉和索引，再评估 ClickHouse / Hive / ODPS。",
      ],
      list: [
        "可带走：Kimball 四步、五层职责、禁止跳层、指标单一出口、分区幂等",
        "需适配：SQL 方言、分区实现、文件/列存格式、资源队列与权限",
        "粗分：零售财务偏 T+1 离线；互联网行为常加 ClickHouse/实时；制造 MES 可近实时，经营汇总仍可批处理",
      ],
      exampleKey: "prod_stack",
      alsoInterview: true,
    },

    /* ========== 分析与看板 ========== */
    {
      id: "analysis-six-layers",
      cat: "analysis",
      q: "六层分析方法论是什么？和数仓五层是一回事吗？",
      a: [
        "不是一回事，也常被面试混为一谈。",
        "数仓五层（ODS→ADS）回答数据「放哪、怎么加工、谁能读」；六层方法论回答分析「怎么提问、怎么下钻、怎么给建议」。",
        "作品集里：场景卡/PLAYBOOKS 按方法论组织，但 SQL 仍然只读 DWS/ADS，不会因为「第五层优化」就去直查 ODS。",
      ],
      list: [
        "方法论大致：描述发生了什么 → 诊断为什么 → 预测会怎样 → 评估做得如何 → 优化该怎么做 → 工具箱沉淀可复用方法",
        "监控五层（北极星/围栏/核心/先导/诊断）又是另一套「指标治理」语言，可与方法论配合，仍不是表分层",
      ],
    },
    {
      id: "analysis-northstar",
      cat: "analysis",
      q: "北极星指标和阶段切换在作品集里怎么体现？",
      a: "各行业定义北极星与分阶段焦点；看板工具条可切换阶段，联动主看板与 KPI 角色标签，并跳转平台知识图谱。避免战略叙事和图表脱节。",
      exampleKey: "overview",
    },
    {
      id: "analysis-roles",
      cat: "analysis",
      q: "多角色看数为啥要做？怎么实现？",
      a: "roles.json 控制可见看板；壳与 API 可叠加行级过滤（渠道/品牌）。演示「同一数仓、不同职责看到不同切片」，贴近真实治理。",
    },
    {
      id: "analysis-demo",
      cat: "analysis",
      q: "没有数据库时作品集还能演示吗？",
      a: "可以。前端检测演示模式或 API 失败后加载 data/demo；页脚标明「静态演示数据」。面试可讲降级策略与同源口径。",
      alsoInterview: true,
    },
    {
      id: "analysis-dict-lineage",
      cat: "analysis",
      q: "数据字典、血缘、答疑分别解决什么问题？",
      list: [
        "字典：表/字段/指标口径「是什么」",
        "血缘：数据「从哪来到哪去」、改动影响谁",
        "答疑（本页）：分层与技术栈「为什么这样设计」、面试怎么答",
      ],
      a: "三者一起构成「能讲清、能查到、能验收」的作品集叙事。",
    },
    {
      id: "analysis-mismatch",
      cat: "analysis",
      q: "看板数字和 SQL 对不上怎么排查？",
      a: [
        "先定「单一真相」：以 ADS/数据字典口径为准，不以某张截图或前端临时计算为准。",
        "再按层排查，避免一上来重写 SQL。",
      ],
      list: [
        "1) 页脚数据源：MySQL 还是静态 demo？demo 与库本来就可能差一批",
        "2) 筛选是否一致：月份、品牌、角色行级过滤",
        "3) 粒度是否一致：日 vs 月、订单 vs 订单行",
        "4) ETL：分区是否跑完、DQC 是否阻断、是否重复灌数",
        "5) 前端：是否格式化/单位换算（万/亿）造成「看起来不同」",
      ],
      alsoInterview: true,
    },

    /* ========== 面试高频（汇总入口；部分与上文交叉，此处给标准答法） ========== */
    {
      id: "iv-introduce",
      cat: "interview",
      q: "请用 1 分钟介绍你的数据分析作品集。",
      a: [
        "我做了多行业数据平台：零售财务 / 互联网 OTT / 制造，各自独立数仓与 API，统一入口。",
        "按 Kimball + 五层建模，看板只读汇总层；配六层方法论、字典、血缘与版本快照。",
        "人定口径与粒度，AI 加速扩写，SQL smoke 与 DQC 做验收；无库时可静态演示。",
      ],
    },
    {
      id: "iv-etl-story",
      cat: "interview",
      q: "讲一条端到端 ETL（面试标准结构）。",
      a: [
        "按固定结构答，比堆技术名词更重要：业务过程 → 粒度 → 源表 → 主键/增量字段 → 清洗规则 → 目标层 → 对账指标 → 失败重跑策略。",
        "每一步都要能用业务话解释「一行是什么、错了怎么发现、重跑会不会翻倍」。",
      ],
      list: [
        "例（零售）：订单 ODS → dwd_sales_wide（订单行粒度）→ dws_sales_daily → v_overview",
        "对账：订单数与 GMV；与财务/源系统差异率超阈则阻断",
        "重跑：按日分区覆盖，保证幂等",
      ],
      exampleKey: "etl",
    },
    {
      id: "iv-index",
      cat: "interview",
      q: "索引为什么会失效？深分页怎么优化？",
      a: [
        "先建立正确预期：索引帮助「快速找到满足条件的行」。若条件写法让优化器无法利用索引，或它估算「全表扫更便宜」，就会表现为「索引失效/没用上」。",
        "分析场景里更常见的不是「完全没用索引」，而是「过滤条件不够贴索引，导致扫描行数仍然很大」。所以要结合 EXPLAIN 看 key 与 rows，而不是只看有没有建索引。",
        "深分页：LIMIT 100000,20 的代价是先读过大量行再丢掉。看板/明细翻页应改用 keyset：记住上一页最后一条的排序键，下一页用 WHERE id > :last_id ORDER BY id LIMIT 20。",
      ],
      list: [
        "对索引列套函数：WHERE DATE(dt)='2024-06-01' → 改成 dt >= '2024-06-01' AND dt < '2024-06-02'",
        "隐式类型转换：varchar 列与数字比较，可能导致无法用索引",
        "前导模糊：name LIKE '%abc' 通常难用 BTree 索引；'abc%' 才可能",
        "最左前缀：组合索引 (a,b) 只查 b，往往用不上完整索引",
        "选择性差或表很小：优化器可能主动选全表——用 EXPLAIN 验证，不要只背口诀",
      ],
      sql: [
        {
          title: "范围条件代替函数包裹",
          code: `-- 更利于走 dt 索引/分区
SELECT COUNT(*) FROM dwd_sales_wide
WHERE dt >= '2024-06-01' AND dt < '2024-06-02';`,
        },
        {
          title: "keyset 翻页",
          code: `-- 上一页最后 id = 100020
SELECT * FROM dwd_sales_wide
WHERE id > 100020
ORDER BY id
LIMIT 20;`,
        },
      ],
      note: "作品集数据量不大，面试官听的是你的排查习惯：先 EXPLAIN，再改写法，再考虑加索引或预聚合。",
    },
    {
      id: "iv-scd",
      cat: "interview",
      q: "缓慢变化维（SCD）怎么处理？",
      a: [
        "维度属性会变，但变化频率远低于事实。处理方式决定「历史报表看到的是当时值还是当前值」。",
      ],
      list: [
        "Type 1：直接覆盖。实现简单，丢失历史，适合错别字修正",
        "Type 2：拉链/多版本（生效日、失效日或 is_current）。能回答「去年下单时用户在哪个城市」",
        "Type 3：加一列存「曾用值」。只留有限历史，用得少",
      ],
      note: "作品集演示里维度常以全量快照或宽表冗余名称落地；面试要能讲清 Type2 场景与代价（表更大、关联要带时间）。",
    },
    {
      id: "iv-t1-realtime",
      cat: "interview",
      q: "T+1 和实时怎么选？",
      a: [
        "看业务问题的「迟到代价」和「一致性要求」，不是技术炫技。",
        "财务对账、跨系统口径、日经营复盘：迟到几小时可接受，错数不可接受 → T+1 批处理更合适。",
        "风控告警、在线人数、秒杀库存：晚一分钟就有损失 → 才上分钟级/流式。",
      ],
      list: [
        "还要权衡：成本、回补难度、重复计算、值班复杂度",
        "作品集财务/经营看板以 T+1 叙事；互联网活跃类可对照说明生产会加实时链路",
      ],
    },
    {
      id: "iv-fact-types",
      cat: "interview",
      q: "事实表有哪些类型？",
      a: [
        "先定业务过程与粒度，再选事实类型——类型是建模结果，不是先贴标签。",
      ],
      list: [
        "事务事实：一行一次业务事件（下单、支付、一次播放）。可加总，增长快",
        "周期快照：固定周期末状态（每日库存、每月账户余额）。适合「时点存量」",
        "累积快照：一条单据生命周期多节点时间（下单→发货→签收）。适合漏斗时效",
      ],
      note: "零售订单偏事务；日结库存偏周期快照；制造工单从开工到完工可用累积快照思路。",
    },
    {
      id: "iv-only-mysql",
      cat: "interview",
      q: "面试官说「你这不就是 MySQL 报表」怎么回应？",
      a: [
        "承认引擎是单机 MySQL，同时指出交付的是分层建模、口径治理、质量门禁、调度叙事与可迁移 SQL。",
        "对照说明生产会按量换 Hive/ClickHouse 等；并展示血缘、版本、方法论 SQL 验收，而不是只秀图。",
      ],
    },
  ];

  /** 行业例子：挂在答案底部 */
  const examples = {
    retail: {
      overview: "零售库 retail_finance；API :5000；看板只读 DWS/ADS；权威 DDL 见 sql6_portfolio_model/。",
      ods: "例：ods_orders / ods_payment / ods_inventory — 贴源 ERP/CSV。",
      dim: "例：dim_brand、dim_channel、dim_store。",
      dwd: "例：dwd_sales_wide 冗余品牌渠道名。",
      dws: "例：dws_sales_daily、dws_expense_monthly。",
      ads: "例：v_overview、v_dupont、v_cashflow。",
      wide: "brand_code → dim_brand；channel_code → dim_channel。",
      mysql: "库 retail_finance；金额 DECIMAL；看板查汇总层视图。",
      python_flask: "Flask :5000；Pages 降级 data/demo；roles.json 控可见看板。",
      etl: "seed_sql6_from_csv.py + 日调度思路；DQC 不过不开看板。",
      viz: "14 主题看板 + PDF 同源指标。",
      frontend: "retail_dashboard.html；北极星阶段联动主看板。",
      prod_stack: "财务对账偏 T+1 离线仓，不必强行实时。",
    },
    internet: {
      overview: "库 internet_analytics；API :5001；有效 MAU 叙事。",
      ods: "例：ods_device_operation_log — 一行一次操作。",
      dim: "例：dim_video_info / dim_user。",
      dwd: "例：dwd_device_operation_wide、dwd_user_wide。",
      dws: "例：活跃/留存/漏斗日汇总。",
      ads: "例：v_dau_overview、v_retention_*、v_funnel、v_ltv。",
      wide: "user_id → dim_user；channel_code → dim_channel。",
      mysql: "窗口函数常用于留存/漏斗；生产行为明细对照 ClickHouse。",
      python_flask: "Flask :5001；口径在 ADS 视图。",
      etl: "seed_internet_data.py；日志分区与幂等很关键。",
      viz: "DAU/留存/漏斗与 API 同源；DISTINCT 类指标宜预聚合。",
      frontend: "internet_dashboard.html + 增长方法论页。",
      prod_stack: "生产常 Hive/ODPS + ClickHouse + Kafka/Flink。",
    },
    manufacturing: {
      overview: "库 manufacturing_analytics；API :5002；CMEI 北极星。",
      ods: "例：ods_production_order、ods_quality_inspection。",
      dim: "例：dim_product、dim_production_line。",
      dwd: "例：dwd_production_wide、dwd_quality_wide。",
      dws: "产量/质量/设备日汇总 → OEE、FPY、OTD。",
      ads: "例：v_production_overview、v_equipment_oee、v_cmei_daily。",
      wide: "line_id → dim_production_line；product_id → dim_product。",
      mysql: "OEE/良率分子分母分存再算。",
      python_flask: "Flask :5002；CMEI 在 ADS 组装。",
      etl: "seed_manufacturing_data.py；产线日结与质检对账。",
      viz: "产量/质量/设备看板，产线下钻。",
      frontend: "manufacturing_dashboard.html；CMEI 阶段联动。",
      prod_stack: "MES 可近实时；经营汇总仍可 T+1。",
    },
  };

  window.DATA_FAQ_DATA = { categories, faqs, examples, version: "2.2" };
})();
