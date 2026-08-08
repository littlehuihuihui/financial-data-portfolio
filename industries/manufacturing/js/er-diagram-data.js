window.ER_DIAGRAM = {
  title: "制造业 · 实体关系图",
  description:
    "雪花+宽表模型（<code>database/01_ods.sql</code>～<code>05_ads.sql</code>）：按数仓分层<strong>自上而下</strong>排布，拆成「生产质量 / ODS→DIM·DWD / DWS→ADS」三张图。",
  legend: [
    "<strong>布局</strong>：上层维度/原始 → 中层宽表 → 下层汇总/看板",
    "<strong>主题宽表</strong>：dim → dwd_*_wide",
    "<strong>看板出口</strong>：dws → v_*",
  ],
  views: [
    {
      id: "prod_quality",
      name: "① 生产·质量·供应",
      mermaid: `
flowchart TB
  subgraph DIM["DIM 维度层"]
    direction LR
    dim_date["dim_date"]
    dim_production_line["dim_production_line"]
    dim_product["dim_product"]
    dim_material["dim_material"]
    dim_supplier["dim_supplier"]
  end
  subgraph DWD["DWD 主题宽表"]
    direction LR
    dwd_production_wide["dwd_production_wide"]
    dwd_quality_wide["dwd_quality_wide"]
    dwd_supply_wide["dwd_supply_wide"]
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
flowchart TB
  subgraph ODS["ODS 原始层"]
    direction LR
    ods_production_order["ods_production_order"]
    ods_quality_inspection["ods_quality_inspection"]
    ods_inventory_material["ods_inventory_material"]
    ods_material["ods_material"]
    ods_supplier["ods_supplier"]
    ods_production_line["ods_production_line"]
  end
  subgraph DIM["DIM 主数据"]
    direction LR
    dim_material["dim_material"]
    dim_supplier["dim_supplier"]
    dim_production_line["dim_production_line"]
  end
  subgraph DWD["DWD 主题宽表"]
    direction LR
    dwd_production_wide["dwd_production_wide"]
    dwd_quality_wide["dwd_quality_wide"]
    dwd_supply_wide["dwd_supply_wide"]
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
flowchart TB
  subgraph DWD["DWD 主题宽表"]
    direction LR
    dwd_production_wide["dwd_production_wide"]
    dwd_quality_wide["dwd_quality_wide"]
    dwd_supply_wide["dwd_supply_wide"]
  end
  subgraph DWS["DWS 汇总层"]
    direction LR
    dws_production_daily["dws_production_daily"]
    dws_quality_daily["dws_quality_daily"]
    dws_supply_daily["dws_supply_daily"]
    dws_cost_monthly["dws_cost_monthly"]
  end
  subgraph ADS["ADS 应用层"]
    direction LR
    v_production_overview["v_production_overview"]
    v_quality_analysis["v_quality_analysis"]
    v_supply_chain["v_supply_chain"]
    v_capacity_utilization["v_capacity_utilization"]
    v_defect_analysis["v_defect_analysis"]
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
flowchart TB
  subgraph DIM["DIM 维度层"]
    direction LR
    dim_date["dim_date"]
    dim_production_line["dim_production_line"]
    dim_product["dim_product"]
  end
  subgraph DWD["DWD 主题宽表"]
    dwd_production_wide["dwd_production_wide"]
  end
  dim_date --> dwd_production_wide
  dim_production_line --> dwd_production_wide
  dim_product --> dwd_production_wide
`,
};
