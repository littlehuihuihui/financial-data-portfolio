/**
 * 数仓分层全景图 · 制造业 · 智能工厂（同步自字典）
 */
window.DW_ARCHITECTURE_DATA = {
  manufacturing: {
    name: "制造业 · 智能工厂",
    description: "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS",
    layers: [
  {
    "id": "ods",
    "name": "ODS",
    "fullName": "操作数据层",
    "color": "#64748b",
    "desc": "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS"
  },
  {
    "id": "dim",
    "name": "DIM",
    "fullName": "维度层",
    "color": "#6366f1",
    "desc": "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS"
  },
  {
    "id": "dwd",
    "name": "DWD",
    "fullName": "明细宽表层",
    "color": "#14b8a6",
    "desc": "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS"
  },
  {
    "id": "dws",
    "name": "DWS",
    "fullName": "汇总数据层",
    "color": "#f59e0b",
    "desc": "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS"
  },
  {
    "id": "ads",
    "name": "ADS",
    "fullName": "应用数据层",
    "color": "#8b5cf6",
    "desc": "生产/质量/设备/供应链/成本 · MES/QMS/ERP/WMS"
  }
],
    tables: [
  {
    "id": "ods_production_order",
    "name": "ods_production_order",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_production_order",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_production_line",
    "name": "ods_production_line",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_production_line",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_quality_inspection",
    "name": "ods_quality_inspection",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_quality_inspection",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_material",
    "name": "ods_material",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_material",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_inventory_material",
    "name": "ods_inventory_material",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_inventory_material",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_supplier",
    "name": "ods_supplier",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_supplier",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_equipment",
    "name": "ods_equipment",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_equipment",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_labor",
    "name": "ods_labor",
    "layer": "ods",
    "type": "table",
    "purpose": "ods_labor",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "dim_product",
    "name": "dim_product",
    "layer": "dim",
    "type": "table",
    "purpose": "dim_product",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dim_production_line",
    "name": "dim_production_line",
    "layer": "dim",
    "type": "table",
    "purpose": "dim_production_line",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dim_supplier",
    "name": "dim_supplier",
    "layer": "dim",
    "type": "table",
    "purpose": "dim_supplier",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dim_material",
    "name": "dim_material",
    "layer": "dim",
    "type": "table",
    "purpose": "dim_material",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dim_date",
    "name": "dim_date",
    "layer": "dim",
    "type": "table",
    "purpose": "dim_date",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dwd_production_wide",
    "name": "dwd_production_wide",
    "layer": "dwd",
    "type": "table",
    "purpose": "dwd_production_wide",
    "fieldCount": 8,
    "category": "DWD"
  },
  {
    "id": "dwd_quality_wide",
    "name": "dwd_quality_wide",
    "layer": "dwd",
    "type": "table",
    "purpose": "dwd_quality_wide",
    "fieldCount": 8,
    "category": "DWD"
  },
  {
    "id": "dwd_supply_wide",
    "name": "dwd_supply_wide",
    "layer": "dwd",
    "type": "table",
    "purpose": "dwd_supply_wide",
    "fieldCount": 8,
    "category": "DWD"
  },
  {
    "id": "dws_production_daily",
    "name": "dws_production_daily",
    "layer": "dws",
    "type": "table",
    "purpose": "dws_production_daily",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_quality_daily",
    "name": "dws_quality_daily",
    "layer": "dws",
    "type": "table",
    "purpose": "dws_quality_daily",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_supply_daily",
    "name": "dws_supply_daily",
    "layer": "dws",
    "type": "table",
    "purpose": "dws_supply_daily",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_equipment_daily",
    "name": "dws_equipment_daily",
    "layer": "dws",
    "type": "table",
    "purpose": "dws_equipment_daily",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_cost_monthly",
    "name": "dws_cost_monthly",
    "layer": "dws",
    "type": "table",
    "purpose": "dws_cost_monthly",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "v_production_overview",
    "name": "v_production_overview",
    "layer": "ads",
    "type": "view",
    "purpose": "v_production_overview",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_quality_analysis",
    "name": "v_quality_analysis",
    "layer": "ads",
    "type": "view",
    "purpose": "v_quality_analysis",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_supply_chain",
    "name": "v_supply_chain",
    "layer": "ads",
    "type": "view",
    "purpose": "v_supply_chain",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_equipment_oee",
    "name": "v_equipment_oee",
    "layer": "ads",
    "type": "view",
    "purpose": "v_equipment_oee",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_cost_analysis",
    "name": "v_cost_analysis",
    "layer": "ads",
    "type": "view",
    "purpose": "v_cost_analysis",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_capacity_utilization",
    "name": "v_capacity_utilization",
    "layer": "ads",
    "type": "view",
    "purpose": "v_capacity_utilization",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_defect_analysis",
    "name": "v_defect_analysis",
    "layer": "ads",
    "type": "view",
    "purpose": "v_defect_analysis",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_material_turnover",
    "name": "v_material_turnover",
    "layer": "ads",
    "type": "view",
    "purpose": "v_material_turnover",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_labor_efficiency",
    "name": "v_labor_efficiency",
    "layer": "ads",
    "type": "view",
    "purpose": "v_labor_efficiency",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_manufacturing_finance",
    "name": "v_manufacturing_finance",
    "layer": "ads",
    "type": "view",
    "purpose": "v_manufacturing_finance",
    "fieldCount": 8,
    "category": "ADS"
  }
],
    flows: [
  {
    "from": "ods_production_order",
    "to": "dwd_production_wide",
    "label": "ETL清洗"
  },
  {
    "from": "ods_quality_inspection",
    "to": "dwd_quality_wide",
    "label": "ETL清洗"
  },
  {
    "from": "ods_inventory_material",
    "to": "dwd_supply_wide",
    "label": "ETL清洗"
  },
  {
    "from": "dim_product",
    "to": "dwd_production_wide",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_production_line",
    "to": "dwd_production_wide",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dwd_production_wide",
    "to": "dws_production_daily",
    "label": "日聚合"
  },
  {
    "from": "dwd_quality_wide",
    "to": "dws_quality_daily",
    "label": "日聚合"
  },
  {
    "from": "dwd_supply_wide",
    "to": "dws_supply_daily",
    "label": "日聚合"
  },
  {
    "from": "ods_equipment",
    "to": "dws_equipment_daily",
    "label": "日聚合"
  },
  {
    "from": "dws_production_daily",
    "to": "v_production_overview",
    "label": "指标封装"
  },
  {
    "from": "dws_quality_daily",
    "to": "v_quality_analysis",
    "label": "指标封装"
  },
  {
    "from": "dws_supply_daily",
    "to": "v_supply_chain",
    "label": "指标封装"
  },
  {
    "from": "dws_equipment_daily",
    "to": "v_equipment_oee",
    "label": "指标封装"
  },
  {
    "from": "dws_production_daily",
    "to": "v_cmei_daily",
    "label": "指标封装"
  }
],
    dashboards: [
  {
    "id": "production",
    "name": "生产总览",
    "api": "/api/dashboard_production",
    "tables": []
  },
  {
    "id": "delivery",
    "name": "交付分析",
    "api": "/api/dashboard_delivery",
    "tables": []
  },
  {
    "id": "quality",
    "name": "质量分析",
    "api": "/api/dashboard_quality",
    "tables": []
  },
  {
    "id": "scrap-rework",
    "name": "报废与返工",
    "api": "/api/dashboard_scrap_rework",
    "tables": []
  },
  {
    "id": "process-yield",
    "name": "工序良率",
    "api": "/api/dashboard_process_yield",
    "tables": []
  },
  {
    "id": "equipment",
    "name": "设备OEE",
    "api": "/api/dashboard_equipment",
    "tables": []
  },
  {
    "id": "downtime",
    "name": "停机损失",
    "api": "/api/dashboard_downtime",
    "tables": []
  },
  {
    "id": "capacity",
    "name": "产能负荷",
    "api": "/api/dashboard_capacity",
    "tables": []
  },
  {
    "id": "cost",
    "name": "成本分析",
    "api": "/api/dashboard_cost",
    "tables": []
  },
  {
    "id": "supply",
    "name": "供应链分析",
    "api": "/api/dashboard_supply",
    "tables": []
  },
  {
    "id": "supplier-score",
    "name": "供应商评分",
    "api": "/api/dashboard_supplier_score",
    "tables": []
  },
  {
    "id": "material",
    "name": "物料周转",
    "api": "/api/dashboard_material",
    "tables": []
  },
  {
    "id": "bom-variance",
    "name": "领料差异",
    "api": "/api/dashboard_bom_variance",
    "tables": []
  },
  {
    "id": "labor",
    "name": "人工效率",
    "api": "/api/dashboard_labor",
    "tables": []
  }
]
  }
};
