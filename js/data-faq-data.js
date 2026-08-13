/**
 * 数仓分层 + 技术栈答疑（跨行业共用）
 * window.DATA_FAQ_DATA
 */
(function () {
  "use strict";

  const layers = [
    {
      id: "overview",
      kind: "layer",
      label: "五层总览",
      title: "ODS → DIM → DWD → DWS → ADS",
      tagline: "先存原样，再定口径，再洗明细，再预聚合，最后给业务用。",
      beginner: [
        { h: "一句话", p: "五层像工厂流水线：原料入库（ODS）→ 标准件库（DIM）→ 加工明细（DWD）→ 半成品汇总（DWS）→ 成品货架（ADS）。" },
        { h: "记忆口诀", p: "ODS 存原始 → DIM 定口径 → DWD 宽表洗 → DWS 先算好 → ADS 给业务用。" },
        { h: "看板读哪层", p: "作品集约定：看板 / 方法论 SQL 只读 DWS 或 ADS，禁止 ADS 直读 ODS。" },
      ],
      advanced: [
        { h: "为什么禁止跳层", p: "ADS 直读 ODS 会把清洗、对账、口径锁定绑死在报表 SQL 上，一改源表全家崩；中间层是质量门禁与复用边界。" },
        { h: "Kimball 四步", p: "先选业务过程 → 声明粒度 → 定维度 → 定事实；粒度没声明就禁止拼宽表。" },
      ],
      interview: [
        { q: "你们数仓几层？各自干什么？", a: "ODS 贴源；DIM 一致性维度；DWD 明细事实/宽表；DWS 公共汇总；ADS 面向应用的指标切片。看板消费 DWS/ADS。" },
        { q: "为什么不直接 ODS 出报表？", a: "脏数据、口径漂移、重复计算；没有复用层与 DQC 门禁，面试要强调「可验收」而不是「能查出数」。" },
      ],
    },
    {
      id: "ods",
      kind: "layer",
      label: "ODS",
      title: "ODS · 操作数据层（贴源）",
      tagline: "尽量按源系统原样落库，一行通常对应一张原始单据或一条日志。",
      beginner: [
        { h: "用途", p: "把 ERP/埋点/MES 等源数据「搬进来」保存，方便回溯与对账，不做强业务改写。" },
        { h: "有没有度量", p: "有原始金额、数量、时长等字段，但这里不以「指标口径」为准，只是源系统怎么记就怎么存。" },
        { h: "变化快慢", p: "增量频繁：每天都有新订单、新日志；历史分区一般按日保留。" },
        { h: "命名", p: "通常以 ods_ 开头，如 ods_orders、ods_device_operation_log。" },
      ],
      advanced: [
        { h: "与源系统差异", p: "允许补 ETL 批次号、入库时间、软删标记；核心业务字段应可与源对账（行数/金额）。" },
        { h: "质量门禁", p: "ODS↔DWD 行数差异率、主键唯一性、空值率等常放在进入明细层前的 DQC。" },
      ],
      interview: [
        { q: "ODS 和 DWD 差别？", a: "ODS 贴源、可脏、可冗余源字段；DWD 已清洗、统一编码、明确粒度，面向分析过程。" },
        { q: "ODS 要不要做维度退化？", a: "一般不做；维度统一放 DIM，明细宽表再冗余名称是 DWD 的事。" },
      ],
    },
    {
      id: "dim",
      kind: "layer",
      label: "DIM",
      title: "DIM · 维度层",
      tagline: "主数据与一致性维度：描述「是谁/在哪/什么类」，而不是「发生了多少」。",
      beginner: [
        { h: "用途", p: "维度表描述业务实体属性，供多个事实/汇总表引用，统一编码与名称。" },
        { h: "有没有度量", p: "一般不包含度量值——没有 sum/count 这类可聚合的数字作为主内容；金额、次数应在事实或汇总层。" },
        { h: "变化快慢", p: "变化缓慢（SCD）：视频分类不会每天变，用户地区也不会频繁改；常用全量快照或拉链。" },
        { h: "复用", p: "被多个事实表复用：同一个 dim_video_info 可被播放、收藏、点赞等多个 DWD/DWS 表引用。" },
        { h: "命名", p: "通常以 dim_ 开头，如 dim_user、dim_product、dim_date、dim_area。" },
      ],
      advanced: [
        { h: "一致性维度", p: "同一 brand_code 在销售、费用、库存中含义必须一致，否则 ADS 指标对不上。" },
        { h: "代理键", p: "可用 surrogate key；业务码放业务字段。维度 NULL 常用 -1 代理键约定。" },
      ],
      interview: [
        { q: "什么是维度表？和事实表区别？", a: "维度回答 who/what/where/when；事实回答 how many/how much。维度慢变、低基数；事实高增长、带度量。" },
        { q: "缓慢变化维怎么处理？", a: "Type1 覆盖、Type2 拉链（生效/失效日）、Type3 加列。面试能举用户地址变更例子即可。" },
      ],
    },
    {
      id: "dwd",
      kind: "layer",
      label: "DWD",
      title: "DWD · 明细数据层",
      tagline: "清洗后的业务过程明细：一行代表一次明确发生的事件或单据。",
      beginner: [
        { h: "用途", p: "把 ODS 洗成可分析的明细事实（或明细宽表），粒度必须说清：「一行是什么」。" },
        { h: "有没有度量", p: "有：金额、数量、时长、次数等可加总字段；同时挂上维度外键或冗余维度名。" },
        { h: "变化快慢", p: "随业务增长快速追加；通常按日分区增量。" },
        { h: "命名", p: "优先 fact_* 或 dwd_* / dwd_*_wide，如 dwd_sales_wide、dwd_vod_play_di。" },
      ],
      advanced: [
        { h: "宽表优先", p: "作品集常把品牌/渠道名冗余进宽表，减少看板 JOIN；代价是存储与一致性维护。" },
        { h: "禁止回写 ODS", p: "DWD 可追溯来自哪批 ODS，但不反向污染贴源层。" },
      ],
      interview: [
        { q: "如何声明粒度？", a: "用一句人话：「一行 = 一笔已支付订单行」或「一行 = 一次有效播放」。粒度错了指标必炸。" },
        { q: "事实表类型？", a: "事务事实、周期快照、累积快照。零售订单偏事务；库存日结偏快照。" },
      ],
    },
    {
      id: "dws",
      kind: "layer",
      label: "DWS",
      title: "DWS · 汇总数据层",
      tagline: "公共粒度上的预聚合，给多人复用，避免每个看板自己从明细重算。",
      beginner: [
        { h: "用途", p: "按日/月 × 品牌/渠道/产线等固定维度先算好指标，提升查询速度与口径一致。" },
        { h: "有没有度量", p: "全是度量（或派生率）：销售额、活跃设备数、良品率分子分母等。" },
        { h: "变化快慢", p: "每日/每月 ETL 刷新对应分区；历史分区一般不变。" },
        { h: "命名", p: "常以 dws_ 开头，如 dws_sales_daily、dws_act_user_active_1d。" },
      ],
      advanced: [
        { h: "公共 vs 个性化", p: "DWS 放「大家都会用」的汇总；个性化 KPI 组合放到 ADS。" },
        { h: "比率怎么存", p: "可存分子分母，展示时再除，避免预存率导致加权错误。" },
      ],
      interview: [
        { q: "DWS 和 ADS 怎么切？", a: "DWS 公共汇总可复用；ADS 面向具体看板/场景的指标拼装与口径封装。" },
        { q: "汇总层粒度怎么选？", a: "对齐最高频下钻维（日×渠道）；过细浪费，过粗又逼人回明细。" },
      ],
    },
    {
      id: "ads",
      kind: "layer",
      label: "ADS",
      title: "ADS · 应用数据层",
      tagline: "面向看板、报表、方法论的「即用指标」切片。",
      beginner: [
        { h: "用途", p: "把 DWS（偶有 DWD）组装成页面要的 KPI、排行、漏斗结果，减少前端拼 SQL。" },
        { h: "有没有度量", p: "有，且已是业务口径（净利率、有效 MAU、CMEI 等）。" },
        { h: "形态", p: "作品集多用视图（v_*），改口径改视图即可，不一定落物理表。" },
        { h: "命名", p: "常以 v_ 或 ads_ 开头，如 v_overview、v_dupont、v_dau_overview。" },
      ],
      advanced: [
        { h: "禁止直读 ODS", p: "规范强制：ADS/看板不得跳过 DWD/DWS 直查 ODS；例外须文档说明。" },
        { h: "与 API", p: "Flask API 读 ADS/DWS，前端 ECharts 只消费 JSON，不写库。" },
      ],
      interview: [
        { q: "ADS 用视图还是表？", a: "原型期视图快；生产高并发可物化。关键是口径单一出口。" },
        { q: "指标口径放哪？", a: "定义写在字典/元数据；计算落在 ADS/DWS SQL，避免前端各算各的。" },
      ],
    },
    {
      id: "wide",
      kind: "layer",
      label: "宽表思路",
      title: "宽表建模（作品集常用）",
      tagline: "明细层冗余维度名称，换取查询少 JOIN。",
      beginner: [
        { h: "做法", p: "DWD 宽表同时保留 brand_code 与 brand_name；看板按名称展示不必再查 dim。" },
        { h: "代价", p: "存储变大；维度改名要同步刷宽表或接受短暂不一致。" },
      ],
      advanced: [
        { h: "何时不用宽表", p: "维度属性极多、变更极频繁时，星型 + 视图可能更干净。" },
      ],
      interview: [
        { q: "宽表和星型怎么选？", a: "看查询模式与团队规范；作品集演示宽表优先，生产可混合。" },
      ],
    },
  ];

  const tech = [
    {
      id: "mysql",
      kind: "tech",
      label: "MySQL",
      title: "MySQL 8 · 作品集数仓载体",
      tagline: "本地用 MySQL 模拟分层数仓；生产可换 Hive/ClickHouse，SQL 思路可迁移。",
      beginner: [
        { h: "增删改查", p: "INSERT / SELECT / UPDATE / DELETE；分析场景以 SELECT + 聚合为主，生产写入由 ETL 完成。" },
        { h: "常用聚合", p: "SUM / COUNT / AVG / MAX；GROUP BY 维度列；WHERE 过滤分区日。" },
        { h: "连接", p: "事实 LEFT JOIN 维度：用业务键对齐；注意一对多导致度量放大。" },
        { h: "窗口函数入门", p: "ROW_NUMBER()、SUM() OVER(PARTITION BY …)、LAG/LEAD 做环比与去重排序。" },
      ],
      advanced: [
        { h: "查询优化", p: "让过滤条件命中索引/分区；避免 SELECT *；大表先缩小再 JOIN；用 EXPLAIN 看 type/rows/Extra。" },
        { h: "索引直觉", p: "等值、排序、分组字段可考虑组合索引；对低选择性列（性别）建索引收益差。" },
        { h: "视图 vs 表", p: "ADS 视图改口径快；热点可物化成表 + 定时刷新。" },
      ],
      interview: [
        { q: "索引为什么会失效？", a: "对索引列做函数/隐式转换、前导模糊 %like、不等条件、优化器判断全表更便宜等。" },
        { q: "深分页怎么优化？", a: "避免 LIMIT 100000,20；改用「记下上次最大 id」的 keyset 分页。" },
        { q: "窗口函数和 GROUP BY 区别？", a: "GROUP BY 行变少；窗口函数保留明细行并附加排名/累计列。" },
      ],
    },
    {
      id: "python_flask",
      kind: "tech",
      label: "Python / Flask",
      title: "Python 3.9+ · Flask API",
      tagline: "各行业独立端口（5000/5001/5002）提供看板 JSON；平台 5100 做入口与元数据。",
      beginner: [
        { h: "角色", p: "读 MySQL（DWS/ADS）→ 组装 KPI/图表序列 → 返回 JSON；前端不直连库。" },
        { h: "静态演示", p: "GitHub Pages / file 协议下走 data/demo JSON，保证无库也能演示。" },
      ],
      advanced: [
        { h: "职责边界", p: "复杂口径放在 SQL/视图；API 只做参数校验、权限角色过滤与格式化。" },
      ],
      interview: [
        { q: "为什么前后端分离？", a: "同一 ADS 可服务看板、PDF、外部 BI；口径改一处。" },
        { q: "如何保证演示可离线？", a: "DEMO_MODE + 预置 JSON；面试可讲降级策略。" },
      ],
    },
    {
      id: "etl",
      kind: "tech",
      label: "ETL / SQL",
      title: "ETL：SQL DDL + Python 灌数",
      tagline: "分层表靠脚本重建与日调度思路；作品集强调可跑通与门禁。",
      beginner: [
        { h: "典型链路", p: "seed/ODS 落地 → DWD 清洗 → DWS 汇总 → ADS 视图；失败要能复跑。" },
        { h: "DQC", p: "阻断级规则（行数、主键、空值）不过则不算「看板就绪」。" },
      ],
      advanced: [
        { h: "幂等", p: "按分区 DELETE+INSERT 或 REPLACE，避免重复跑翻倍。" },
        { h: "血缘", p: "表级 A→B 与代码路径可回查，支撑面试「你怎么保证改动影响可知」。" },
      ],
      interview: [
        { q: "说说你做的一条 ETL？", a: "说清源、粒度、主键、增量字段、失败重跑、对账指标。" },
        { q: "T+1 和实时怎么选？", a: "财务对账偏 T+1；行为 DAU 可分钟级；作品集财务看板以 T+1 叙事为主。" },
      ],
    },
    {
      id: "viz",
      kind: "tech",
      label: "ECharts / Tableau",
      title: "可视化：ECharts + Tableau",
      tagline: "作品集页内用 ECharts；Tableau 用于连接同一套数仓 SQL 的扩展演示。",
      beginner: [
        { h: "ECharts", p: "折线/柱/饼/散点吃 API 数组；KPI 卡片与图表同源，避免两套数。" },
        { h: "Tableau", p: "直连 DWS/ADS 视图做探索；口径仍以仓库定义为准。" },
      ],
      advanced: [
        { h: "性能", p: "重计算放仓库；前端只渲染结果集。大数据下钻要带过滤条件。" },
      ],
      interview: [
        { q: "看板指标和 SQL 不一致怎么办？", a: "以 ADS/字典为准回溯；禁止前端私自换公式。" },
      ],
    },
    {
      id: "frontend",
      kind: "tech",
      label: "前端作品集",
      title: "HTML / CSS / JS 作品集壳",
      tagline: "行业 SPA 壳 + 架构页组件（字典/全景/图谱/答疑）静态可部署。",
      beginner: [
        { h: "结构", p: "platform index → 行业 dashboard / methodology / architecture；共享 js 在 portfolio/js。" },
        { h: "状态", p: "角色、月份、北极星阶段等可落 localStorage，刷新不丢。" },
      ],
      advanced: [
        { h: "缓存", p: "静态资源 ?v= 版本号；改文案要 bump 避免 CDN/浏览器旧缓存。" },
      ],
      interview: [
        { q: "作品集如何体现工程化？", a: "分层规范、DQC、血缘、版本快照、smoke 脚本，而不只是好看的图。" },
      ],
    },
    {
      id: "prod_stack",
      kind: "tech",
      label: "生产对照",
      title: "作品集 MySQL vs 生产栈",
      tagline: "本地 MySQL = 分层与 SQL 原型；生产常见 Hive/MaxCompute + ClickHouse + Kafka/Flink。",
      beginner: [
        { h: "对照", p: "业务库仍可 MySQL；离线数仓上 Hive/ODPS；行为 OLAP 上 ClickHouse；实时用 Kafka + Flink。" },
        { h: "迁移思路", p: "表分层与粒度设计可带走；引擎语法与分区策略需适配。" },
      ],
      advanced: [
        { h: "为何作品集用 MySQL", p: "零运维、SQL 教学友好、能完整演示 ODS→ADS；不假装已经上了大数据集群。" },
      ],
      interview: [
        { q: "只有 MySQL 算数仓经验吗？", a: "强调分层建模、口径、质量、调度与可迁移 SQL；并诚实说明生产引擎差异。" },
      ],
    },
  ];

  /** 行业例子：挂在弹框底部 */
  const examples = {
    retail: {
      ods: "例：ods_orders / ods_payment / ods_inventory — 贴源 ERP/CSV 单据。",
      dim: "例：dim_brand、dim_channel、dim_store 被销售宽表与费用宽表共同引用。",
      dwd: "例：dwd_sales_wide 一行偏订单/销售明细，冗余品牌渠道名。",
      dws: "例：dws_sales_daily、dws_expense_monthly 供经营总览与预算复用。",
      ads: "例：v_overview、v_dupont、v_cashflow 直接喂零售看板 API。",
      wide: "brand_code → dim_brand；channel_code → dim_channel。",
      overview: "库名 retail_finance；API :5000；看板只读 DWS/ADS。",
      mysql: "库 retail_finance，DDL 见 sql6_portfolio_model/。",
      python_flask: "零售 Flask API 默认端口 5000。",
      etl: "seed_sql6_from_csv.py + 日调度脚本思路。",
    },
    internet: {
      ods: "例：ods_device_operation_log — 一行一次开机/点击/播放/支付操作。",
      dim: "例：dim_video_info / dim_user 可被播放、收藏、点赞等多条明细链路引用。",
      dwd: "例：dwd_device_operation_wide、dwd_user_wide 宽表洗日志。",
      dws: "例：dws_act_user_active_1d、留存/漏斗日汇总。",
      ads: "例：v_dau_overview、v_retention_*、v_funnel、v_ltv。",
      wide: "user_id → dim_user；channel_code → dim_channel。",
      overview: "库名 internet_analytics；API :5001；有效 MAU 叙事。",
      mysql: "库 internet_analytics；生产对照 ClickHouse 做行为 OLAP。",
      python_flask: "互联网 Flask API 默认端口 5001。",
      etl: "seed_internet_data.py + ADS 视图脚本。",
      prod_stack: "埋点量大时生产偏 Hive + ClickHouse + Kafka/Flink。",
    },
    manufacturing: {
      ods: "例：ods_production_order、ods_quality_inspection — MES/QMS 贴源。",
      dim: "例：dim_product、dim_production_line 被产量与质量宽表复用。",
      dwd: "例：dwd_production_wide、dwd_quality_wide。",
      dws: "例：产量/质量/设备日汇总，支撑 OEE、FPY、OTD。",
      ads: "例：v_production_overview、v_equipment_oee、v_cmei_daily。",
      wide: "line_id → dim_production_line；product_id → dim_product。",
      overview: "库名 manufacturing_analytics；API :5002；CMEI 北极星。",
      mysql: "库 manufacturing_analytics。",
      python_flask: "制造 Flask API 默认端口 5002。",
      etl: "seed_manufacturing_data.py。",
    },
  };

  window.DATA_FAQ_DATA = { layers, tech, examples, version: "1.0" };
})();
