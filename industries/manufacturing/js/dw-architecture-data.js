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
    "id": "ods_equipment",
    "name": "ods_equipment",
    "name_cn": "设备台账",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·设备台账·全量表",
    "fieldCount": 11,
    "category": "ODS"
  },
  {
    "id": "ods_inventory_material",
    "name": "ods_inventory_material",
    "name_cn": "物料库存",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·物料库存·日快照表",
    "fieldCount": 12,
    "category": "ODS"
  },
  {
    "id": "ods_labor",
    "name": "ods_labor",
    "name_cn": "人工工时",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·人工工时·增量表",
    "fieldCount": 13,
    "category": "ODS"
  },
  {
    "id": "ods_material",
    "name": "ods_material",
    "name_cn": "物料主数据",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·物料主数据·全量表",
    "fieldCount": 11,
    "category": "ODS"
  },
  {
    "id": "ods_production_line",
    "name": "ods_production_line",
    "name_cn": "产线主数据",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·产线主数据·全量表",
    "fieldCount": 11,
    "category": "ODS"
  },
  {
    "id": "ods_production_order",
    "name": "ods_production_order",
    "name_cn": "生产工单",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·生产工单·增量表",
    "fieldCount": 15,
    "category": "ODS"
  },
  {
    "id": "ods_quality_inspection",
    "name": "ods_quality_inspection",
    "name_cn": "质检记录",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·质检记录·增量表",
    "fieldCount": 15,
    "category": "ODS"
  },
  {
    "id": "ods_supplier",
    "name": "ods_supplier",
    "name_cn": "供应商",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·供应商·全量表",
    "fieldCount": 10,
    "category": "ODS"
  },
  {
    "id": "dim_date",
    "name": "dim_date",
    "name_cn": "日期",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·日期·全量",
    "fieldCount": 11,
    "category": "DIM"
  },
  {
    "id": "dim_defect_type",
    "name": "dim_defect_type",
    "name_cn": "缺陷类型",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·缺陷类型·全量",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "dim_equipment",
    "name": "dim_equipment",
    "name_cn": "设备",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·设备·全量",
    "fieldCount": 14,
    "category": "DIM"
  },
  {
    "id": "dim_factory",
    "name": "dim_factory",
    "name_cn": "工厂",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·工厂·全量",
    "fieldCount": 12,
    "category": "DIM"
  },
  {
    "id": "dim_material",
    "name": "dim_material",
    "name_cn": "物料",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·物料·全量",
    "fieldCount": 10,
    "category": "DIM"
  },
  {
    "id": "dim_product",
    "name": "dim_product",
    "name_cn": "产品",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·产品·全量",
    "fieldCount": 10,
    "category": "DIM"
  },
  {
    "id": "dim_production_line",
    "name": "dim_production_line",
    "name_cn": "产线",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·产线·全量",
    "fieldCount": 10,
    "category": "DIM"
  },
  {
    "id": "dim_supplier",
    "name": "dim_supplier",
    "name_cn": "供应商",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·供应商·全量",
    "fieldCount": 10,
    "category": "DIM"
  },
  {
    "id": "dwd_equipment_run",
    "name": "dwd_equipment_run",
    "name_cn": "设备运行明细事实",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·设备运行明细事实·增量·粒度=日×设备×班次",
    "fieldCount": 19,
    "category": "DWD"
  },
  {
    "id": "dwd_labor_wide",
    "name": "dwd_labor_wide",
    "name_cn": "人工事实宽表",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·人工事实宽表·增量·粒度=工单×人工记录",
    "fieldCount": 14,
    "category": "DWD"
  },
  {
    "id": "dwd_production_wide",
    "name": "dwd_production_wide",
    "name_cn": "生产事实宽表",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·生产事实宽表·增量·粒度=工单",
    "fieldCount": 21,
    "category": "DWD"
  },
  {
    "id": "dwd_quality_wide",
    "name": "dwd_quality_wide",
    "name_cn": "质量事实宽表",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·质量事实宽表·增量·粒度=质检单",
    "fieldCount": 18,
    "category": "DWD"
  },
  {
    "id": "dwd_supply_wide",
    "name": "dwd_supply_wide",
    "name_cn": "供应链事实宽表",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·供应链事实宽表·快照·粒度=日×物料×供应商",
    "fieldCount": 17,
    "category": "DWD"
  },
  {
    "id": "fact_equipment_run",
    "name": "fact_equipment_run",
    "name_cn": "设备运行事实",
    "layer": "dwd",
    "type": "view",
    "purpose": "DWD·设备运行事实（同义视图）",
    "fieldCount": 19,
    "category": "DWD"
  },
  {
    "id": "fact_labor",
    "name": "fact_labor",
    "name_cn": "人工事实",
    "layer": "dwd",
    "type": "view",
    "purpose": "DWD·人工事实（同义视图）",
    "fieldCount": 14,
    "category": "DWD"
  },
  {
    "id": "fact_material_consumption",
    "name": "fact_material_consumption",
    "name_cn": "工单领料事实",
    "layer": "dwd",
    "type": "table",
    "purpose": "FACT·工单领料事实·增量·粒度=工单×物料",
    "fieldCount": 14,
    "category": "DWD"
  },
  {
    "id": "fact_process_operation",
    "name": "fact_process_operation",
    "name_cn": "工序完成事实",
    "layer": "dwd",
    "type": "table",
    "purpose": "FACT·工序完成事实·增量·粒度=工单×工序",
    "fieldCount": 18,
    "category": "DWD"
  },
  {
    "id": "fact_production",
    "name": "fact_production",
    "name_cn": "生产事实",
    "layer": "dwd",
    "type": "view",
    "purpose": "DWD·生产事实（同义视图）",
    "fieldCount": 21,
    "category": "DWD"
  },
  {
    "id": "fact_quality",
    "name": "fact_quality",
    "name_cn": "质量事实",
    "layer": "dwd",
    "type": "view",
    "purpose": "DWD·质量事实（同义视图）",
    "fieldCount": 18,
    "category": "DWD"
  },
  {
    "id": "fact_supply",
    "name": "fact_supply",
    "name_cn": "供应事实",
    "layer": "dwd",
    "type": "view",
    "purpose": "DWD·供应事实（同义视图）",
    "fieldCount": 17,
    "category": "DWD"
  },
  {
    "id": "dws_cost_monthly",
    "name": "dws_cost_monthly",
    "name_cn": "月成本汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·月成本汇总·快照表",
    "fieldCount": 10,
    "category": "DWS"
  },
  {
    "id": "dws_defect_daily",
    "name": "dws_defect_daily",
    "name_cn": "日缺陷汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日缺陷汇总·快照表",
    "fieldCount": 9,
    "category": "DWS"
  },
  {
    "id": "dws_equipment_daily",
    "name": "dws_equipment_daily",
    "name_cn": "日设备汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日设备汇总·快照表",
    "fieldCount": 11,
    "category": "DWS"
  },
  {
    "id": "dws_labor_monthly",
    "name": "dws_labor_monthly",
    "name_cn": "月人工效率",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·月人工效率·快照表",
    "fieldCount": 10,
    "category": "DWS"
  },
  {
    "id": "dws_material_daily",
    "name": "dws_material_daily",
    "name_cn": "日物料周转",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日物料周转·快照表",
    "fieldCount": 10,
    "category": "DWS"
  },
  {
    "id": "dws_production_daily",
    "name": "dws_production_daily",
    "name_cn": "日生产汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日生产汇总·快照表",
    "fieldCount": 10,
    "category": "DWS"
  },
  {
    "id": "dws_quality_daily",
    "name": "dws_quality_daily",
    "name_cn": "日质量汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日质量汇总·快照表",
    "fieldCount": 12,
    "category": "DWS"
  },
  {
    "id": "dws_supply_daily",
    "name": "dws_supply_daily",
    "name_cn": "日供应汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·日供应汇总·快照表",
    "fieldCount": 9,
    "category": "DWS"
  },
  {
    "id": "v_capacity_utilization",
    "name": "v_capacity_utilization",
    "name_cn": "产能利用率",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·产能利用率",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_cmei_daily",
    "name": "v_cmei_daily",
    "name_cn": "综合效能CMEI",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·综合效能CMEI",
    "fieldCount": 5,
    "category": "ADS"
  },
  {
    "id": "v_cost_analysis",
    "name": "v_cost_analysis",
    "name_cn": "成本分析",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·成本分析",
    "fieldCount": 7,
    "category": "ADS"
  },
  {
    "id": "v_defect_analysis",
    "name": "v_defect_analysis",
    "name_cn": "缺陷分析",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·缺陷分析",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_equipment_oee",
    "name": "v_equipment_oee",
    "name_cn": "设备OEE",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·设备OEE",
    "fieldCount": 10,
    "category": "ADS"
  },
  {
    "id": "v_labor_efficiency",
    "name": "v_labor_efficiency",
    "name_cn": "人效分析",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·人效分析",
    "fieldCount": 9,
    "category": "ADS"
  },
  {
    "id": "v_manufacturing_finance",
    "name": "v_manufacturing_finance",
    "name_cn": "制造财务",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·制造财务",
    "fieldCount": 10,
    "category": "ADS"
  },
  {
    "id": "v_material_turnover",
    "name": "v_material_turnover",
    "name_cn": "物料周转",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·物料周转",
    "fieldCount": 9,
    "category": "ADS"
  },
  {
    "id": "v_production_overview",
    "name": "v_production_overview",
    "name_cn": "生产总览",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·生产总览",
    "fieldCount": 6,
    "category": "ADS"
  },
  {
    "id": "v_quality_analysis",
    "name": "v_quality_analysis",
    "name_cn": "质量分析",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·质量分析",
    "fieldCount": 6,
    "category": "ADS"
  },
  {
    "id": "v_supply_chain",
    "name": "v_supply_chain",
    "name_cn": "供应链",
    "layer": "ads",
    "type": "view",
    "purpose": "ADS·供应链",
    "fieldCount": 6,
    "category": "ADS"
  }
],
    flows: [
  {
    "from": "ods_equipment",
    "to": "dws_equipment_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_inventory_material",
    "to": "dwd_supply_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_inventory_material",
    "to": "dws_material_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_supply_wide",
    "to": "dws_material_daily",
    "label": "血缘"
  },
  {
    "from": "ods_labor",
    "to": "dwd_labor_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_labor",
    "to": "dws_labor_monthly",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_labor_wide",
    "to": "dws_labor_monthly",
    "label": "血缘"
  },
  {
    "from": "ods_production_order",
    "to": "dwd_production_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_quality_inspection",
    "to": "dwd_quality_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_quality_inspection",
    "to": "dws_defect_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_quality_wide",
    "to": "dws_defect_daily",
    "label": "血缘"
  },
  {
    "from": "dwd_equipment_run",
    "to": "dws_equipment_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_production_wide",
    "to": "dws_production_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_quality_wide",
    "to": "dws_quality_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_supply_wide",
    "to": "dws_supply_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dws_cost_monthly",
    "to": "v_cost_analysis",
    "label": "指标封装"
  },
  {
    "from": "dws_cost_monthly",
    "to": "v_manufacturing_finance",
    "label": "指标封装"
  },
  {
    "from": "v_cost_analysis",
    "to": "v_manufacturing_finance",
    "label": "血缘"
  },
  {
    "from": "dws_defect_daily",
    "to": "v_defect_analysis",
    "label": "指标封装"
  },
  {
    "from": "dws_equipment_daily",
    "to": "v_equipment_oee",
    "label": "指标封装"
  },
  {
    "from": "ods_equipment",
    "to": "dwd_equipment_run",
    "label": "血缘"
  },
  {
    "from": "dws_labor_monthly",
    "to": "v_labor_efficiency",
    "label": "指标封装"
  },
  {
    "from": "dws_material_daily",
    "to": "v_material_turnover",
    "label": "指标封装"
  },
  {
    "from": "dws_production_daily",
    "to": "v_production_overview",
    "label": "指标封装"
  },
  {
    "from": "dws_production_daily",
    "to": "v_capacity_utilization",
    "label": "指标封装"
  },
  {
    "from": "dws_production_daily",
    "to": "v_cmei_daily",
    "label": "指标封装"
  },
  {
    "from": "v_production_overview",
    "to": "v_capacity_utilization",
    "label": "血缘"
  },
  {
    "from": "v_capacity_utilization",
    "to": "v_cmei_daily",
    "label": "血缘"
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
