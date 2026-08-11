/** internet · ETL 边元数据 */
window.ETL_LINEAGE = {
  industry: "internet",
  repo: {
    baseUrl: "https://github.com/littlehuihuihui/financial-data-portfolio",
    branch: "main",
    provider: "github",
    stripPrefix: "portfolio/",
  },
  note: "库 internet_analytics · API :5001。样例：portfolio/industries/internet/database/seed_internet_data.py（及 seed_ott.py）。",
  usage: {
    trace: "日活 / 留存 / 付费 / 漏斗看板异常时：从 ADS（如 v_dau_overview、收入结构视图）定位日期与渠道 → 下钻 DWS（dws_user_daily、dws_payment_daily、dws_funnel_monthly）→ 回查 dwd_device_operation_wide / dwd_user_wide → 对比 ODS 操作日志与订购单。上方「表级变换」可查看 A→B 代码落点。",
    impact: "改行为口径或订购清洗规则前，评估下游日活/漏斗/LTV 等看板；变更后重跑 seed_internet_data.py（或 seed_ott.py）并确认 ADS 视图，回归 API :5001。"
  },
  jobs: [
    {
      id: "dim_init",
      name: "维度初始化",
      schedule: "重建时",
      description: "database/01_ddl.sql · dim_* / ods_*"
    },
    {
      id: "seed_ods",
      name: "样例灌入 ODS",
      schedule: "按需",
      description: "python seed_internet_data.py / seed_ott.py"
    },
    {
      id: "ods_dwd_dws",
      name: "ODS → DWD → DWS",
      schedule: "灌入后",
      description: "seed 内 SQL INSERT 宽表与日/月汇总"
    },
    {
      id: "ads_views",
      name: "ADS 视图",
      schedule: "实时",
      description: "02_ads.sql / 04_ott_ads_views.sql 仅读 DWS/DWD"
    }
  ],
  edges: [
    {
      id: "inet_ods_op_dwd",
      from_table: "ods_device_operation_log",
      to_table: "dwd_device_operation_wide",
      layer_from: "ODS",
      layer_to: "DWD",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dwd_device_operation_wide",
      computation: "开机/点播/直播操作日志 JOIN 设备与用户维，形成行为宽表。",
      sql_excerpt: "INSERT INTO dwd_device_operation_wide SELECT log.*, device.*, user.* ...",
      grain: "一次设备行为"
    },
    {
      id: "inet_ods_user_dwd",
      from_table: "ods_user_profile",
      to_table: "dwd_user_wide",
      layer_from: "ODS",
      layer_to: "DWD",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dwd_user_wide",
      computation: "用户档案宽表；再 UPDATE last_active / is_paid（来自行为与订购）。",
      sql_excerpt: "INSERT INTO dwd_user_wide ...; UPDATE ... JOIN dwd_device_operation_wide",
      grain: "用户"
    },
    {
      id: "inet_dwd_op_session",
      from_table: "dwd_device_operation_wide",
      to_table: "dwd_session_wide",
      layer_from: "DWD",
      layer_to: "DWD",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dwd_session_wide",
      computation: "按 session_id 汇总行为次数与时长。",
      sql_excerpt: "INSERT INTO dwd_session_wide SELECT session_id, user_id, COUNT(*), SUM(duration) ... GROUP BY session_id",
      grain: "会话"
    },
    {
      id: "inet_ods_sub_dws",
      from_table: "ods_subscription_order",
      to_table: "dws_payment_daily",
      layer_from: "ODS",
      layer_to: "DWS",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dws_payment_daily",
      computation: "订购按支付日×渠道×产品线汇总付费用户/金额/ARPU。",
      sql_excerpt: "GROUP BY pay_date, channel_code, product_line; arpu = pay_amount/pay_users",
      grain: "日×渠道×产品线"
    },
    {
      id: "inet_dwd_funnel",
      from_table: "dwd_device_operation_wide",
      to_table: "dws_funnel_monthly",
      layer_from: "DWD",
      layer_to: "DWS",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dws_funnel_monthly",
      computation: "按月统计漏斗各步人数（曝光→点击→转化）。",
      sql_excerpt: "INSERT INTO dws_funnel_monthly SELECT month, step, COUNT(DISTINCT user_id)",
      grain: "月×漏斗步骤"
    },
    {
      id: "inet_dwd_value",
      from_table: "dwd_user_wide",
      to_table: "dws_user_value_snapshot",
      layer_from: "DWD",
      layer_to: "DWS",
      job_name: "ODS → DWD → DWS",
      schedule: "灌入后",
      engine: "python",
      code_path: "portfolio/industries/internet/database/seed_internet_data.py",
      entry: "build_dws_user_value_snapshot",
      computation: "用户价值快照：生命周期阶段、付费标记、活跃分。",
      sql_excerpt: "INSERT INTO dws_user_value_snapshot SELECT user_id, lifecycle_stage, is_paid ...",
      grain: "用户快照"
    },
    {
      id: "inet_dws_ads_dau",
      from_table: "dws_user_daily",
      to_table: "v_dau_overview",
      layer_from: "DWS",
      layer_to: "ADS",
      job_name: "ADS 视图",
      schedule: "实时",
      engine: "view",
      code_path: "portfolio/industries/internet/database/02_ads.sql",
      entry: "v_dau_overview",
      computation: "日活总览视图，消费 DWS 用户日活跃汇总。",
      sql_excerpt: "CREATE OR REPLACE VIEW v_dau_overview AS SELECT ... FROM dws_user_daily",
      grain: "日活切片"
    },
    {
      id: "inet_dws_ads_pay",
      from_table: "dws_payment_daily",
      to_table: "v_revenue_structure",
      layer_from: "DWS",
      layer_to: "ADS",
      job_name: "ADS 视图",
      schedule: "实时",
      engine: "view",
      code_path: "portfolio/industries/internet/database/04_ott_ads_views.sql",
      entry: "收入结构相关视图",
      computation: "收入结构看板读支付日汇总，按渠道/产品线切分。",
      sql_excerpt: "SELECT channel_code, product_line, SUM(pay_amount) FROM dws_payment_daily",
      grain: "收入切片"
    }
  ]
};
