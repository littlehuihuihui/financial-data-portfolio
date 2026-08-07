window.ER_DIAGRAM = {
  title: "跃动体育 · 实体关系图",
  description:
    "sql6 星型+宽表模型（<code>sql6_portfolio_model/</code>）：按层拆成三张图，避免一张图实体过多导致表名挤在一起。可切换「DIM→宽表 / ODS→DWD / DWS→ADS」。",
  legend: [
    "<strong>星型核心</strong>：dim_* → dwd_*_wide",
    "<strong>ETL 链路</strong>：ods_* → dwd_*_wide",
    "<strong>汇总出口</strong>：dwd → dws → v_*",
  ],
  views: [
    {
      id: "dim_dwd",
      name: "① DIM→宽表",
      mermaid: `
erDiagram
    dim_brand ||--o{ dwd_sales_wide : brand_code
    dim_channel ||--o{ dwd_sales_wide : channel_code
    dim_category ||--o{ dwd_sales_wide : category_code
    dim_store ||--o{ dwd_sales_wide : store_code
    dim_date ||--o{ dwd_sales_wide : order_date
    dim_brand ||--o{ dwd_expense_wide : brand_code
    dim_channel ||--o{ dwd_expense_wide : channel_code
    dim_date ||--o{ dwd_expense_wide : expense_date
    dim_brand ||--o{ dwd_inventory_wide : brand_code
    dim_category ||--o{ dwd_inventory_wide : category_code
    dim_store ||--o{ dwd_inventory_wide : store_code
    dim_date ||--o{ dwd_inventory_wide : snapshot_date
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DWD",
      mermaid: `
erDiagram
    ods_orders ||--o{ dwd_sales_wide : ETL
    ods_payment ||--o{ dwd_sales_wide : ETL
    ods_expense ||--o{ dwd_expense_wide : ETL
    ods_inventory ||--o{ dwd_inventory_wide : ETL
    ods_purchase ||--o{ dwd_inventory_wide : ETL
`,
    },
    {
      id: "dws_ads",
      name: "③ DWS→ADS",
      mermaid: `
erDiagram
    dwd_sales_wide ||--o{ dws_sales_daily : aggregate
    dwd_sales_wide ||--o{ dws_sales_monthly : aggregate
    dwd_expense_wide ||--o{ dws_expense_monthly : aggregate
    dwd_inventory_wide ||--o{ dws_inventory_daily : aggregate
    dwd_sales_wide ||--o{ dws_store_daily : aggregate
    dws_sales_monthly ||--o{ v_overview : ADS
    dws_sales_monthly ||--o{ v_dupont : ADS
    dws_expense_monthly ||--o{ v_budget : ADS
    dws_inventory_daily ||--o{ v_inventory : ADS
`,
    },
  ],
  mermaid: `
erDiagram
    dim_brand ||--o{ dwd_sales_wide : brand_code
    dim_channel ||--o{ dwd_sales_wide : channel_code
    dim_category ||--o{ dwd_sales_wide : category_code
    dim_store ||--o{ dwd_sales_wide : store_code
    dim_date ||--o{ dwd_sales_wide : order_date
`,
};
