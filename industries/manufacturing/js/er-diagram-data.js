window.ER_DIAGRAM = {
  title: "制造业 · 实体关系图",
  description:
    "雪花+宽表模型（<code>database/01_ods.sql</code>～<code>05_ads.sql</code>）：生产/质量/供应链三主题 DWD 宽表冗余 dim 主数据，DWS 按日/月预聚合，14 个主题看板 API 对接 Web 看板与 PDF。",
  legend: [
    "<strong>主题宽表</strong>：dim → dwd_*_wide",
    "<strong>工单质检</strong>：dwd_production → dwd_quality",
    "<strong>看板出口</strong>：dws → v_*",
  ],
  mermaid: `
erDiagram
    dim_date ||--o{ dwd_production_wide : order_date
    dim_production_line ||--o{ dwd_production_wide : line_code
    dim_product ||--o{ dwd_production_wide : product_code
    dim_date ||--o{ dwd_quality_wide : inspect_date
    dim_production_line ||--o{ dwd_quality_wide : line_code
    dim_product ||--o{ dwd_quality_wide : product_code
    dwd_production_wide ||--o{ dwd_quality_wide : order_id
    dim_material ||--o{ dwd_supply_wide : material_code
    dim_supplier ||--o{ dwd_supply_wide : supplier_code
    dim_date ||--o{ dwd_supply_wide : snapshot_date
    ods_production_order ||--o{ dwd_production_wide : ETL
    ods_quality_inspection ||--o{ dwd_quality_wide : ETL
    ods_inventory_material ||--o{ dwd_supply_wide : ETL
    ods_material ||--o{ dim_material : master
    ods_supplier ||--o{ dim_supplier : master
    ods_production_line ||--o{ dim_production_line : master
    dwd_production_wide ||--o{ dws_production_daily : aggregate
    dwd_quality_wide ||--o{ dws_quality_daily : aggregate
    dwd_supply_wide ||--o{ dws_supply_daily : aggregate
    dwd_production_wide ||--o{ dws_cost_monthly : aggregate
    dws_production_daily ||--o{ v_production_overview : ADS
    dws_quality_daily ||--o{ v_quality_analysis : ADS
    dws_supply_daily ||--o{ v_supply_chain : ADS
    dws_production_daily ||--o{ v_capacity_utilization : ADS
    dws_quality_daily ||--o{ v_defect_analysis : ADS
`,
};
