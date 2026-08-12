window.ER_DIAGRAM = {
  tableCn: {
    dim_date: "日期维",
    dim_production_line: "产线维",
    dim_product: "产品维",
    dim_material: "物料维",
    dim_supplier: "供应商维",
    dwd_production_wide: "生产宽表",
    dwd_quality_wide: "质量宽表",
    dwd_supply_wide: "供应宽表",
    dws_production_daily: "生产日汇总",
    dws_quality_daily: "质量日汇总",
    dws_supply_daily: "供应日汇总",
    dws_cost_monthly: "成本月汇总",
    v_production_overview: "生产总览",
    v_quality_analysis: "质量分析",
    v_supply_chain: "供应链",
    v_capacity_utilization: "产能利用率",
    v_defect_analysis: "缺陷分析",
    ods_production_order: "生产工单",
    ods_quality_inspection: "质检贴源",
    ods_inventory_material: "物料库存",
    ods_material: "物料主数据",
    ods_supplier: "供应商主数据",
    ods_production_line: "产线主数据"
  },
  title: "制造业 · 实体关系图",
  description:
    "雪花+宽表模型（<code>database/01_ods.sql</code>～<code>05_ads.sql</code>）：按数仓分层<strong>自左而右</strong>排布，拆成「生产质量 / ODS→DIM·DWD / DWS→ADS」三张图。",
  legend: [
    "<strong>布局</strong>：左→右分层列（DIM/ODS → DWD → DWS → ADS）",
    "<strong>主题宽表</strong>：dim → dwd_*_wide",
    "<strong>看板出口</strong>：dws → v_*",
  ],
  views: [
    {
      id: "prod_quality",
      name: "① 生产·质量·供应",
      mermaid: `
flowchart LR
  subgraph DIM["DIM 维度层"]
    direction TB
    dim_date["dim_date<br/>日期维"]
    dim_production_line["dim_production_line<br/>产线维"]
    dim_product["dim_product<br/>产品维"]
    dim_material["dim_material<br/>物料维"]
    dim_supplier["dim_supplier<br/>供应商维"]
  end
  subgraph DWD["DWD 主题宽表"]
    direction TB
    dwd_production_wide["dwd_production_wide<br/>生产宽表"]
    dwd_quality_wide["dwd_quality_wide<br/>质量宽表"]
    dwd_supply_wide["dwd_supply_wide<br/>供应宽表"]
  end
  dim_date -->|order_date| dwd_production_wide
  dim_production_line -->|line_code| dwd_production_wide
  dim_product -->|product_code| dwd_production_wide
  dim_date -->|inspect_date| dwd_quality_wide
  dim_production_line -->|line_code| dwd_quality_wide
  dim_product -->|product_code| dwd_quality_wide
  dwd_production_wide -->|order_id| dwd_quality_wide
  dim_material -->|material_code| dwd_supply_wide
  dim_supplier -->|supplier_code| dwd_supply_wide
  dim_date -->|snapshot_date| dwd_supply_wide
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DIM·DWD",
      mermaid: `
flowchart LR
  subgraph ODS["ODS 原始层"]
    direction TB
    ods_production_order["ods_production_order<br/>生产工单"]
    ods_quality_inspection["ods_quality_inspection<br/>质检贴源"]
    ods_inventory_material["ods_inventory_material<br/>物料库存"]
    ods_material["ods_material<br/>物料主数据"]
    ods_supplier["ods_supplier<br/>供应商主数据"]
    ods_production_line["ods_production_line<br/>产线主数据"]
  end
  subgraph DIM["DIM 主数据"]
    direction TB
    dim_material["dim_material<br/>物料维"]
    dim_supplier["dim_supplier<br/>供应商维"]
    dim_production_line["dim_production_line<br/>产线维"]
  end
  subgraph DWD["DWD 主题宽表"]
    direction TB
    dwd_production_wide["dwd_production_wide<br/>生产宽表"]
    dwd_quality_wide["dwd_quality_wide<br/>质量宽表"]
    dwd_supply_wide["dwd_supply_wide<br/>供应宽表"]
  end
  ods_production_order -->|ETL| dwd_production_wide
  ods_quality_inspection -->|ETL| dwd_quality_wide
  ods_inventory_material -->|ETL| dwd_supply_wide
  ods_material -->|master| dim_material
  ods_supplier -->|master| dim_supplier
  ods_production_line -->|master| dim_production_line
`,
    },
    {
      id: "dws_ads",
      name: "③ DWS→ADS",
      mermaid: `
flowchart LR
  subgraph DWD["DWD 主题宽表"]
    direction TB
    dwd_production_wide["dwd_production_wide<br/>生产宽表"]
    dwd_quality_wide["dwd_quality_wide<br/>质量宽表"]
    dwd_supply_wide["dwd_supply_wide<br/>供应宽表"]
  end
  subgraph DWS["DWS 汇总层"]
    direction TB
    dws_production_daily["dws_production_daily<br/>生产日汇总"]
    dws_quality_daily["dws_quality_daily<br/>质量日汇总"]
    dws_supply_daily["dws_supply_daily<br/>供应日汇总"]
    dws_cost_monthly["dws_cost_monthly<br/>成本月汇总"]
  end
  subgraph ADS["ADS 应用层"]
    direction TB
    v_production_overview["v_production_overview<br/>生产总览"]
    v_quality_analysis["v_quality_analysis<br/>质量分析"]
    v_supply_chain["v_supply_chain<br/>供应链"]
    v_capacity_utilization["v_capacity_utilization<br/>产能利用率"]
    v_defect_analysis["v_defect_analysis<br/>缺陷分析"]
  end
  dwd_production_wide -->|aggregate| dws_production_daily
  dwd_quality_wide -->|aggregate| dws_quality_daily
  dwd_supply_wide -->|aggregate| dws_supply_daily
  dwd_production_wide -->|aggregate| dws_cost_monthly
  dws_production_daily -->|ADS| v_production_overview
  dws_quality_daily -->|ADS| v_quality_analysis
  dws_supply_daily -->|ADS| v_supply_chain
  dws_production_daily -->|ADS| v_capacity_utilization
  dws_quality_daily -->|ADS| v_defect_analysis
`,
    },
  ],
  mermaid: `
flowchart LR
  subgraph DIM["DIM 维度层"]
    direction TB
    dim_date["dim_date<br/>日期维"]
    dim_production_line["dim_production_line<br/>产线维"]
    dim_product["dim_product<br/>产品维"]
  end
  subgraph DWD["DWD 主题宽表"]
    dwd_production_wide["dwd_production_wide<br/>生产宽表"]
  end
  dim_date --> dwd_production_wide
  dim_production_line --> dwd_production_wide
  dim_product --> dwd_production_wide
`,
};
