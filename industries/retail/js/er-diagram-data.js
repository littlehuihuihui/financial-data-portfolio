window.ER_DIAGRAM = {
  title: "跃动体育 · 实体关系图",
  description:
    "sql6 星型+宽表模型（<code>sql6_portfolio_model/</code>）：按数仓分层<strong>自上而下</strong>排布（DIM/ODS → DWD → DWS → ADS），拆成三张图避免拥挤。",
  legend: [
    "<strong>布局</strong>：上层源头 → 下层汇聚（符合 ODS→ADS 流向）",
    "<strong>星型核心</strong>：dim_* → dwd_*_wide",
    "<strong>汇总出口</strong>：dwd → dws → v_*",
  ],
  views: [
    {
      id: "dim_dwd",
      name: "① DIM→宽表",
      mermaid: `
flowchart TB
  subgraph DIM["DIM 维度层"]
    direction LR
    dim_brand["dim_brand"]
    dim_channel["dim_channel"]
    dim_category["dim_category"]
    dim_store["dim_store"]
    dim_date["dim_date"]
  end
  subgraph DWD["DWD 明细宽表"]
    direction LR
    dwd_sales_wide["dwd_sales_wide"]
    dwd_expense_wide["dwd_expense_wide"]
    dwd_inventory_wide["dwd_inventory_wide"]
  end
  dim_brand -->|brand_code| dwd_sales_wide
  dim_channel -->|channel_code| dwd_sales_wide
  dim_category -->|category_code| dwd_sales_wide
  dim_store -->|store_code| dwd_sales_wide
  dim_date -->|order_date| dwd_sales_wide
  dim_brand -->|brand_code| dwd_expense_wide
  dim_channel -->|channel_code| dwd_expense_wide
  dim_date -->|expense_date| dwd_expense_wide
  dim_brand -->|brand_code| dwd_inventory_wide
  dim_category -->|category_code| dwd_inventory_wide
  dim_store -->|store_code| dwd_inventory_wide
  dim_date -->|snapshot_date| dwd_inventory_wide
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DWD",
      mermaid: `
flowchart TB
  subgraph ODS["ODS 原始层"]
    direction LR
    ods_orders["ods_orders"]
    ods_payment["ods_payment"]
    ods_expense["ods_expense"]
    ods_inventory["ods_inventory"]
    ods_purchase["ods_purchase"]
  end
  subgraph DWD["DWD 明细宽表"]
    direction LR
    dwd_sales_wide["dwd_sales_wide"]
    dwd_expense_wide["dwd_expense_wide"]
    dwd_inventory_wide["dwd_inventory_wide"]
  end
  ods_orders -->|ETL| dwd_sales_wide
  ods_payment -->|ETL| dwd_sales_wide
  ods_expense -->|ETL| dwd_expense_wide
  ods_inventory -->|ETL| dwd_inventory_wide
  ods_purchase -->|ETL| dwd_inventory_wide
`,
    },
    {
      id: "dws_ads",
      name: "③ DWS→ADS",
      mermaid: `
flowchart TB
  subgraph DWD["DWD 明细宽表"]
    direction LR
    dwd_sales_wide["dwd_sales_wide"]
    dwd_expense_wide["dwd_expense_wide"]
    dwd_inventory_wide["dwd_inventory_wide"]
  end
  subgraph DWS["DWS 汇总层"]
    direction LR
    dws_sales_daily["dws_sales_daily"]
    dws_sales_monthly["dws_sales_monthly"]
    dws_expense_monthly["dws_expense_monthly"]
    dws_inventory_daily["dws_inventory_daily"]
    dws_store_daily["dws_store_daily"]
  end
  subgraph ADS["ADS 应用层"]
    direction LR
    v_overview["v_overview"]
    v_dupont["v_dupont"]
    v_budget["v_budget"]
    v_inventory["v_inventory"]
  end
  dwd_sales_wide -->|aggregate| dws_sales_daily
  dwd_sales_wide -->|aggregate| dws_sales_monthly
  dwd_expense_wide -->|aggregate| dws_expense_monthly
  dwd_inventory_wide -->|aggregate| dws_inventory_daily
  dwd_sales_wide -->|aggregate| dws_store_daily
  dws_sales_monthly -->|ADS| v_overview
  dws_sales_monthly -->|ADS| v_dupont
  dws_expense_monthly -->|ADS| v_budget
  dws_inventory_daily -->|ADS| v_inventory
`,
    },
  ],
  mermaid: `
flowchart TB
  subgraph DIM["DIM 维度层"]
    direction LR
    dim_brand["dim_brand"]
    dim_channel["dim_channel"]
    dim_category["dim_category"]
    dim_store["dim_store"]
    dim_date["dim_date"]
  end
  subgraph DWD["DWD 明细宽表"]
    dwd_sales_wide["dwd_sales_wide"]
  end
  dim_brand --> dwd_sales_wide
  dim_channel --> dwd_sales_wide
  dim_category --> dwd_sales_wide
  dim_store --> dwd_sales_wide
  dim_date --> dwd_sales_wide
`,
};
