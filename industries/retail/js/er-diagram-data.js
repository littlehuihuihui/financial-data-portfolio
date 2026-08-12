window.ER_DIAGRAM = {
  tableCn: {
    dim_brand: "品牌维",
    dim_channel: "渠道维",
    dim_category: "品类维",
    dim_store: "门店维",
    dim_date: "日期维",
    ods_orders: "订单贴源",
    ods_payment: "支付贴源",
    ods_expense: "费用贴源",
    ods_inventory: "库存贴源",
    ods_purchase: "采购贴源",
    dwd_sales_wide: "销售宽表",
    dwd_expense_wide: "费用宽表",
    dwd_inventory_wide: "库存宽表",
    dws_sales_daily: "销售日汇总",
    dws_sales_monthly: "销售月汇总",
    dws_expense_monthly: "费用月汇总",
    dws_inventory_daily: "库存日汇总",
    dws_store_daily: "门店日汇总",
    v_overview: "经营总览",
    v_dupont: "杜邦分析",
    v_budget: "预算分析",
    v_inventory: "库存分析"
  },
  title: "跃动体育 · 实体关系图",
  description:
    "sql6 星型+宽表模型（<code>sql6_portfolio_model/</code>）：按数仓分层<strong>自左而右</strong>排布（DIM/ODS → DWD → DWS → ADS），拆成三张图避免拥挤。",
  legend: [
    "<strong>布局</strong>：左→右分层列（DIM/ODS → DWD → DWS → ADS）；点击节点看上下游",
    "<strong>星型核心</strong>：dim_* → dwd_*_wide",
    "<strong>汇总出口</strong>：dwd → dws → v_*",
  ],
  views: [
    {
      id: "dim_dwd",
      name: "① DIM→宽表",
      mermaid: `
flowchart LR
  subgraph DIM["DIM 维度层"]
    direction TB
    dim_brand["dim_brand<br/>品牌维"]
    dim_channel["dim_channel<br/>渠道维"]
    dim_category["dim_category<br/>品类维"]
    dim_store["dim_store<br/>门店维"]
    dim_date["dim_date<br/>日期维"]
  end
  subgraph DWD["DWD 明细宽表"]
    direction TB
    dwd_sales_wide["dwd_sales_wide<br/>销售宽表"]
    dwd_expense_wide["dwd_expense_wide<br/>费用宽表"]
    dwd_inventory_wide["dwd_inventory_wide<br/>库存宽表"]
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
flowchart LR
  subgraph ODS["ODS 原始层"]
    direction TB
    ods_orders["ods_orders<br/>订单贴源"]
    ods_payment["ods_payment<br/>支付贴源"]
    ods_expense["ods_expense<br/>费用贴源"]
    ods_inventory["ods_inventory<br/>库存贴源"]
    ods_purchase["ods_purchase<br/>采购贴源"]
  end
  subgraph DWD["DWD 明细宽表"]
    direction TB
    dwd_sales_wide["dwd_sales_wide<br/>销售宽表"]
    dwd_expense_wide["dwd_expense_wide<br/>费用宽表"]
    dwd_inventory_wide["dwd_inventory_wide<br/>库存宽表"]
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
flowchart LR
  subgraph DWD["DWD 明细宽表"]
    direction TB
    dwd_sales_wide["dwd_sales_wide<br/>销售宽表"]
    dwd_expense_wide["dwd_expense_wide<br/>费用宽表"]
    dwd_inventory_wide["dwd_inventory_wide<br/>库存宽表"]
  end
  subgraph DWS["DWS 汇总层"]
    direction TB
    dws_sales_daily["dws_sales_daily<br/>销售日汇总"]
    dws_sales_monthly["dws_sales_monthly<br/>销售月汇总"]
    dws_expense_monthly["dws_expense_monthly<br/>费用月汇总"]
    dws_inventory_daily["dws_inventory_daily<br/>库存日汇总"]
    dws_store_daily["dws_store_daily<br/>门店日汇总"]
  end
  subgraph ADS["ADS 应用层"]
    direction TB
    v_overview["v_overview<br/>经营总览"]
    v_dupont["v_dupont<br/>杜邦分析"]
    v_budget["v_budget<br/>预算分析"]
    v_inventory["v_inventory<br/>库存分析"]
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
flowchart LR
  subgraph DIM["DIM 维度层"]
    direction TB
    dim_brand["dim_brand<br/>品牌维"]
    dim_channel["dim_channel<br/>渠道维"]
    dim_category["dim_category<br/>品类维"]
    dim_store["dim_store<br/>门店维"]
    dim_date["dim_date<br/>日期维"]
  end
  subgraph DWD["DWD 明细宽表"]
    dwd_sales_wide["dwd_sales_wide<br/>销售宽表"]
  end
  dim_brand --> dwd_sales_wide
  dim_channel --> dwd_sales_wide
  dim_category --> dwd_sales_wide
  dim_store --> dwd_sales_wide
  dim_date --> dwd_sales_wide
`,
};
