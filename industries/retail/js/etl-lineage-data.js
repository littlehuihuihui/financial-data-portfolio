/** retail · ETL 边元数据（sql6 作品集路径） */
window.ETL_LINEAGE = {
  industry: "retail",
  repo: {
    baseUrl: "https://github.com/littlehuihuihui/financial-data-portfolio",
    branch: "main",
    provider: "github",
    stripPrefix: "portfolio/",
    rewrites: {
      "retail-finance-analysis/scripts/": "industries/retail/scripts/",
      "retail-finance-analysis/sql6_portfolio_model/": "industries/retail/sql6_portfolio_model/",
    },
  },
  note: "库 retail_finance · API :5000。重建：python scripts/rebuild_retail_finance.py → python scripts/seed_sql6_from_csv.py。",
  usage: {
    trace: "问题溯源（自下而上）：看板指标异常时，从 ADS 定位月份/品牌/渠道 → 下钻 DWS（dws_sales_daily/monthly 等）→ 回查 dwd_sales_wide 明细 → 对比 ods_orders 等原始单据，逐层锁定口径、清洗或源数据问题。上方「表级变换」可查看 A→B 代码落点。",
    impact: "变更影响（自上而下）：改 ETL 或指标口径前查下游 ADS 与 13+ 主题看板（如改渠道映射会影响 dwd_sales_wide 及销售类 ADS）；变更后按 ODS→DWD→DWS→ADS 重跑灌数并对账（差异≤2%），回归 API :5000。"
  },
  jobs: [
    {
      id: "dim_date",
      name: "dim_date 初始化",
      schedule: "重建时",
      description: "sql6_portfolio_model/02_dim.sql · 2020–2030"
    },
    {
      id: "csv_ods",
      name: "CSV → ODS",
      schedule: "按需",
      description: "retail-finance-analysis/scripts/seed_sql6_from_csv.py"
    },
    {
      id: "ods_dwd",
      name: "ODS → DWD 宽表",
      schedule: "灌入后",
      description: "JOIN dim_* 冗余品牌/渠道/品类/门店名称"
    },
    {
      id: "dwd_dws",
      name: "DWD → DWS 汇总",
      schedule: "灌入后",
      description: "日/月 × 品牌 × 渠道 × 品类预聚合；支付/预算见 07_dws_payment_budget_etl.sql"
    },
    {
      id: "ads_views",
      name: "ADS 视图",
      schedule: "实时",
      description: "sql6_portfolio_model/05_ads.sql 仅读 DWS/DIM"
    }
  ],
  edges: [
    {
      id: "rtl_csv_ods_orders",
      from_table: "CSV/ERP",
      to_table: "ods_orders",
      layer_from: "ODS",
      layer_to: "ODS",
      job_name: "CSV → ODS",
      schedule: "按需",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_ods_orders",
      computation: "从作品集 CSV 解析订单行，写入贴源 ods_orders（金额 DECIMAL、业务键 order_id）。",
      sql_excerpt: "INSERT INTO ods_orders (order_id, order_date, order_amount, ...)",
      grain: "订单行"
    },
    {
      id: "rtl_ods_dwd_sales",
      from_table: "ods_orders",
      to_table: "dwd_sales_wide",
      layer_from: "ODS",
      layer_to: "DWD",
      job_name: "ODS → DWD 宽表",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dwd_sales_wide",
      computation: "订单 JOIN dim_brand/channel/category/store，冗余中文维名；清洗退款与异常金额。",
      sql_excerpt: "INSERT INTO dwd_sales_wide SELECT o.*, b.brand_name, c.channel_name ... FROM ods_orders o JOIN dim_*",
      grain: "销售明细宽表"
    },
    {
      id: "rtl_ods_dwd_exp",
      from_table: "ods_expense",
      to_table: "dwd_expense_wide",
      layer_from: "ODS",
      layer_to: "DWD",
      job_name: "ODS → DWD 宽表",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dwd_expense_wide",
      computation: "费用报销与广告投放合并进费用宽表，冗余品牌/渠道。",
      sql_excerpt: "INSERT INTO dwd_expense_wide ... UNION 广告费口径",
      grain: "费用明细"
    },
    {
      id: "rtl_ods_dwd_inv",
      from_table: "ods_inventory",
      to_table: "dwd_inventory_wide",
      layer_from: "ODS",
      layer_to: "DWD",
      job_name: "ODS → DWD 宽表",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dwd_inventory_wide",
      computation: "库存变动净额按品类/门店展开为库存宽表。",
      sql_excerpt: "INSERT INTO dwd_inventory_wide SELECT ...",
      grain: "库存明细"
    },
    {
      id: "rtl_dwd_dws_daily",
      from_table: "dwd_sales_wide",
      to_table: "dws_sales_daily",
      layer_from: "DWD",
      layer_to: "DWS",
      job_name: "DWD → DWS 汇总",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dws_sales_daily",
      computation: "按日×品牌×渠道×品类 SUM(销售额/成本/订单数)。",
      sql_excerpt: "GROUP BY order_date, brand_name, channel_name, category_name",
      grain: "日×品牌×渠道×品类"
    },
    {
      id: "rtl_dwd_dws_monthly",
      from_table: "dwd_sales_wide",
      to_table: "dws_sales_monthly",
      layer_from: "DWD",
      layer_to: "DWS",
      job_name: "DWD → DWS 汇总",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dws_sales_monthly",
      computation: "按月预聚合销售核心指标，供经营总览与杜邦。",
      sql_excerpt: "GROUP BY DATE_FORMAT(order_date,'%Y-%m'), brand, channel, category",
      grain: "月×品牌×渠道×品类"
    },
    {
      id: "rtl_dwd_dws_exp",
      from_table: "dwd_expense_wide",
      to_table: "dws_expense_monthly",
      layer_from: "DWD",
      layer_to: "DWS",
      job_name: "DWD → DWS 汇总",
      schedule: "灌入后",
      engine: "python",
      code_path: "retail-finance-analysis/scripts/seed_sql6_from_csv.py",
      entry: "load_dws_expense_monthly",
      computation: "费用月汇总，支撑费用结构与预算对比。",
      sql_excerpt: "SUM(expense_amount) GROUP BY month, brand, channel",
      grain: "月×品牌×渠道"
    },
    {
      id: "rtl_pay_dws",
      from_table: "ods_payment",
      to_table: "dws_payment_monthly",
      layer_from: "ODS",
      layer_to: "DWS",
      job_name: "DWD → DWS 汇总",
      schedule: "灌入后",
      engine: "sql",
      code_path: "retail-finance-analysis/sql6_portfolio_model/07_dws_payment_budget_etl.sql",
      entry: "dws_payment_monthly",
      computation: "支付按月×品牌×渠道×支付方式汇总实收。",
      sql_excerpt: "INSERT INTO dws_payment_monthly SELECT month, brand, channel, method, SUM(pay_amount)",
      grain: "月×品牌×渠道×支付方式"
    },
    {
      id: "rtl_budget_dws",
      from_table: "ods_budget",
      to_table: "dws_budget_monthly",
      layer_from: "ODS",
      layer_to: "DWS",
      job_name: "DWD → DWS 汇总",
      schedule: "灌入后",
      engine: "sql",
      code_path: "retail-finance-analysis/sql6_portfolio_model/07_dws_payment_budget_etl.sql",
      entry: "dws_budget_monthly",
      computation: "预算 vs 实际费用：差异额与达成率。",
      sql_excerpt: "budget_amount - actual_amount AS variance; achievement_pct",
      grain: "月×科目"
    },
    {
      id: "rtl_dws_ads_overview",
      from_table: "dws_sales_monthly",
      to_table: "v_overview",
      layer_from: "DWS",
      layer_to: "ADS",
      job_name: "ADS 视图",
      schedule: "实时",
      engine: "view",
      code_path: "retail-finance-analysis/sql6_portfolio_model/05_ads.sql",
      entry: "v_overview",
      computation: "经营总览 ADS：消费 DWS 月销售/费用等预聚合，禁止直读 ODS。",
      sql_excerpt: "CREATE OR REPLACE VIEW v_overview AS SELECT ... FROM dws_sales_monthly",
      grain: "看板切片"
    },
    {
      id: "rtl_dws_ads_brand",
      from_table: "dws_sales_daily",
      to_table: "v_brand_analysis",
      layer_from: "DWS",
      layer_to: "ADS",
      job_name: "ADS 视图",
      schedule: "实时",
      engine: "view",
      code_path: "retail-finance-analysis/sql6_portfolio_model/05_ads.sql",
      entry: "品牌分析相关视图",
      computation: "品牌主题看板读 DWS 日/月销售汇总。",
      sql_excerpt: "SELECT brand_name, SUM(revenue) FROM dws_sales_*",
      grain: "品牌切片"
    }
  ]
};
