/** manufacturing_analytics 数据字典 · 由 database/gen_data_dictionary.py 生成 */
window.DATA_DICTIONARY=[
  {
    "name": "ods_equipment",
    "name_cn": "设备台账",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·设备台账·全量表",
    "summary": "ODS·设备台账·全量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_equipment_daily"
    ],
    "lineage": [
      "ods_equipment",
      "dws_equipment_daily"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "VARCHAR(20)",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "pk"
      },
      {
        "name": "equipment_sk",
        "name_cn": "设备代理键",
        "type": "BIGINT",
        "desc": "设备代理键",
        "business": "设备代理键",
        "role": "bk"
      },
      {
        "name": "equipment_name",
        "name_cn": "设备名称",
        "type": "VARCHAR(80)",
        "desc": "设备名称",
        "business": "设备名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "equipment_type",
        "name_cn": "设备类型",
        "type": "VARCHAR(30)",
        "desc": "设备类型",
        "business": "设备类型",
        "role": "attr"
      },
      {
        "name": "rated_capacity",
        "name_cn": "额定产能",
        "type": "DECIMAL(15,2)",
        "desc": "额定产能",
        "business": "额定产能",
        "role": "attr"
      },
      {
        "name": "equipment_status",
        "name_cn": "设备状态",
        "type": "VARCHAR(20)",
        "desc": "设备状态",
        "business": "设备状态",
        "role": "attr"
      },
      {
        "name": "install_date",
        "name_cn": "安装日期",
        "type": "DATE",
        "desc": "安装日期",
        "business": "安装日期",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_inventory_material",
    "name_cn": "物料库存",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·物料库存·日快照表",
    "summary": "ODS·物料库存·日快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dwd_supply_wide",
      "dws_material_daily"
    ],
    "lineage": [
      "ods_inventory_material",
      "dwd_supply_wide",
      "dws_material_daily"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "fk"
      },
      {
        "name": "warehouse_code",
        "name_cn": "仓库编码",
        "type": "VARCHAR(20)",
        "desc": "仓库编码",
        "business": "仓库编码",
        "role": "fk"
      },
      {
        "name": "on_hand_qty",
        "name_cn": "现存量",
        "type": "DECIMAL(15,2)",
        "desc": "现存量",
        "business": "现存量",
        "role": "measure"
      },
      {
        "name": "safety_stock",
        "name_cn": "安全库存",
        "type": "DECIMAL(15,2)",
        "desc": "安全库存",
        "business": "安全库存",
        "role": "attr"
      },
      {
        "name": "daily_usage",
        "name_cn": "日均用量",
        "type": "DECIMAL(15,2)",
        "desc": "日均用量",
        "business": "日均用量",
        "role": "attr"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额·元",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额·元",
        "business": "库存金额·元",
        "role": "measure"
      },
      {
        "name": "inbound_qty",
        "name_cn": "入库量",
        "type": "DECIMAL(15,2)",
        "desc": "入库量",
        "business": "入库量",
        "role": "measure"
      },
      {
        "name": "outbound_qty",
        "name_cn": "出库量",
        "type": "DECIMAL(15,2)",
        "desc": "出库量",
        "business": "出库量",
        "role": "measure"
      },
      {
        "name": "inventory_status",
        "name_cn": "库存状态",
        "type": "VARCHAR(20)",
        "desc": "库存状态",
        "business": "库存状态",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_labor",
    "name_cn": "人工工时",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·人工工时·增量表",
    "summary": "ODS·人工工时·增量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dwd_labor_wide",
      "dws_labor_monthly"
    ],
    "lineage": [
      "ods_labor",
      "dwd_labor_wide",
      "dws_labor_monthly"
    ],
    "field_count": 13,
    "fields": [
      {
        "name": "labor_id",
        "name_cn": "工时记录ID",
        "type": "BIGINT",
        "desc": "工时记录ID",
        "business": "工时记录ID",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "work_date",
        "name_cn": "作业日期",
        "type": "DATE",
        "desc": "作业日期",
        "business": "作业日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "worker_id",
        "name_cn": "员工ID",
        "type": "VARCHAR(32)",
        "desc": "员工ID",
        "business": "员工ID",
        "role": "fk"
      },
      {
        "name": "shift_code",
        "name_cn": "班次",
        "type": "VARCHAR(10)",
        "desc": "班次",
        "business": "班次",
        "role": "fk"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本·元",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本·元",
        "business": "人工成本·元",
        "role": "measure"
      },
      {
        "name": "labor_status",
        "name_cn": "工时状态",
        "type": "VARCHAR(20)",
        "desc": "工时状态",
        "business": "工时状态",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_material",
    "name_cn": "物料主数据",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·物料主数据·全量表",
    "summary": "ODS·物料主数据·全量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_material"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "pk"
      },
      {
        "name": "material_sk",
        "name_cn": "物料代理键",
        "type": "BIGINT",
        "desc": "物料代理键",
        "business": "物料代理键",
        "role": "bk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "material_type",
        "name_cn": "物料类型",
        "type": "VARCHAR(30)",
        "desc": "物料类型",
        "business": "物料类型",
        "role": "attr"
      },
      {
        "name": "standard_price",
        "name_cn": "标准单价·元",
        "type": "DECIMAL(15,2)",
        "desc": "标准单价·元",
        "business": "标准单价·元",
        "role": "attr"
      },
      {
        "name": "unit",
        "name_cn": "单位",
        "type": "VARCHAR(10)",
        "desc": "单位",
        "business": "单位",
        "role": "attr"
      },
      {
        "name": "category_code",
        "name_cn": "品类编码",
        "type": "VARCHAR(20)",
        "desc": "品类编码",
        "business": "品类编码",
        "role": "fk"
      },
      {
        "name": "abc_class",
        "name_cn": "ABC分类",
        "type": "VARCHAR(10)",
        "desc": "ABC分类",
        "business": "ABC分类",
        "role": "attr"
      },
      {
        "name": "material_status",
        "name_cn": "物料状态",
        "type": "VARCHAR(20)",
        "desc": "物料状态",
        "business": "物料状态",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_production_line",
    "name_cn": "产线主数据",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·产线主数据·全量表",
    "summary": "ODS·产线主数据·全量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_production_line"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "pk"
      },
      {
        "name": "line_sk",
        "name_cn": "产线代理键",
        "type": "BIGINT",
        "desc": "产线代理键",
        "business": "产线代理键",
        "role": "bk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "design_capacity_daily",
        "name_cn": "日设计产能",
        "type": "INT",
        "desc": "日设计产能",
        "business": "日设计产能",
        "role": "attr"
      },
      {
        "name": "line_status",
        "name_cn": "产线状态",
        "type": "VARCHAR(20)",
        "desc": "产线状态",
        "business": "产线状态",
        "role": "attr"
      },
      {
        "name": "shift_count",
        "name_cn": "班次数",
        "type": "INT",
        "desc": "班次数",
        "business": "班次数",
        "role": "measure"
      },
      {
        "name": "process_type",
        "name_cn": "工艺类型",
        "type": "VARCHAR(30)",
        "desc": "工艺类型",
        "business": "工艺类型",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_production_order",
    "name_cn": "生产工单",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·生产工单·增量表",
    "summary": "ODS·生产工单·增量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dwd_production_wide"
    ],
    "lineage": [
      "ods_production_order",
      "dwd_production_wide"
    ],
    "field_count": 15,
    "fields": [
      {
        "name": "order_id",
        "name_cn": "工单号·业务键",
        "type": "VARCHAR(32)",
        "desc": "工单号·业务键",
        "business": "工单号·业务键",
        "role": "pk"
      },
      {
        "name": "order_sk",
        "name_cn": "代理键·维度缺省-1",
        "type": "BIGINT",
        "desc": "代理键·维度缺省-1",
        "business": "代理键·维度缺省-1",
        "role": "bk"
      },
      {
        "name": "order_date",
        "name_cn": "开工日期",
        "type": "DATE",
        "desc": "开工日期",
        "business": "开工日期",
        "role": "attr"
      },
      {
        "name": "due_date",
        "name_cn": "交付日期",
        "type": "DATE",
        "desc": "交付日期",
        "business": "交付日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "INT",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "actual_qty",
        "name_cn": "实际产量",
        "type": "INT",
        "desc": "实际产量",
        "business": "实际产量",
        "role": "measure"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "delivered_on_time",
        "name_cn": "是否准时交付",
        "type": "TINYINT(1)",
        "desc": "是否准时交付",
        "business": "是否准时交付",
        "role": "attr"
      },
      {
        "name": "order_status",
        "name_cn": "工单状态",
        "type": "VARCHAR(20)",
        "desc": "工单状态",
        "business": "工单状态",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_quality_inspection",
    "name_cn": "质检记录",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·质检记录·增量表",
    "summary": "ODS·质检记录·增量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dwd_quality_wide",
      "dws_defect_daily"
    ],
    "lineage": [
      "ods_quality_inspection",
      "dwd_quality_wide",
      "dws_defect_daily"
    ],
    "field_count": 15,
    "fields": [
      {
        "name": "inspect_id",
        "name_cn": "质检单号",
        "type": "BIGINT",
        "desc": "质检单号",
        "business": "质检单号",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "inspect_date",
        "name_cn": "质检日期",
        "type": "DATE",
        "desc": "质检日期",
        "business": "质检日期",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "INT",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "pass_qty",
        "name_cn": "合格数",
        "type": "INT",
        "desc": "合格数",
        "business": "合格数",
        "role": "measure"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "INT",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "INT",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "defect_type",
        "name_cn": "缺陷类型",
        "type": "VARCHAR(40)",
        "desc": "缺陷类型",
        "business": "缺陷类型",
        "role": "attr"
      },
      {
        "name": "inspect_type",
        "name_cn": "抽检/终检",
        "type": "VARCHAR(20)",
        "desc": "抽检/终检",
        "business": "抽检/终检",
        "role": "attr"
      },
      {
        "name": "is_rework",
        "name_cn": "是否返工",
        "type": "TINYINT(1)",
        "desc": "是否返工",
        "business": "是否返工",
        "role": "attr"
      },
      {
        "name": "inspector_id",
        "name_cn": "质检员",
        "type": "VARCHAR(32)",
        "desc": "质检员",
        "business": "质检员",
        "role": "fk"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "ods_supplier",
    "name_cn": "供应商",
    "layer": "ODS",
    "type": "table",
    "purpose": "ODS·供应商·全量表",
    "summary": "ODS·供应商·全量表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "ods_supplier"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "supplier_code",
        "name_cn": "供应商编码",
        "type": "VARCHAR(20)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "pk"
      },
      {
        "name": "supplier_sk",
        "name_cn": "供应商代理键",
        "type": "BIGINT",
        "desc": "供应商代理键",
        "business": "供应商代理键",
        "role": "bk"
      },
      {
        "name": "supplier_name",
        "name_cn": "供应商名称",
        "type": "VARCHAR(80)",
        "desc": "供应商名称",
        "business": "供应商名称",
        "role": "attr"
      },
      {
        "name": "region",
        "name_cn": "区域",
        "type": "VARCHAR(30)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "supplier_level",
        "name_cn": "供应商等级",
        "type": "VARCHAR(10)",
        "desc": "A/B/C",
        "business": "A/B/C",
        "role": "attr"
      },
      {
        "name": "contact_name",
        "name_cn": "联系人",
        "type": "VARCHAR(40)",
        "desc": "联系人",
        "business": "联系人",
        "role": "attr"
      },
      {
        "name": "lead_time_days",
        "name_cn": "交期天数",
        "type": "INT",
        "desc": "交期天数",
        "business": "交期天数",
        "role": "attr"
      },
      {
        "name": "supplier_status",
        "name_cn": "供应商状态",
        "type": "VARCHAR(20)",
        "desc": "供应商状态",
        "business": "供应商状态",
        "role": "attr"
      },
      {
        "name": "source_system",
        "name_cn": "来源系统",
        "type": "VARCHAR(32)",
        "desc": "来源系统",
        "business": "来源系统",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_date",
    "name_cn": "日期",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·日期·全量",
    "summary": "DIM·日期·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_date"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "date_id",
        "name_cn": "日期",
        "type": "DATE",
        "desc": "日期",
        "business": "日期",
        "role": "pk"
      },
      {
        "name": "date_sk",
        "name_cn": "日期代理键",
        "type": "BIGINT",
        "desc": "日期代理键",
        "business": "日期代理键",
        "role": "bk"
      },
      {
        "name": "year_num",
        "name_cn": "年",
        "type": "INT",
        "desc": "年",
        "business": "年",
        "role": "attr"
      },
      {
        "name": "month_num",
        "name_cn": "月",
        "type": "INT",
        "desc": "月",
        "business": "月",
        "role": "attr"
      },
      {
        "name": "day_num",
        "name_cn": "日",
        "type": "INT",
        "desc": "日",
        "business": "日",
        "role": "attr"
      },
      {
        "name": "week_of_year",
        "name_cn": "周序号",
        "type": "INT",
        "desc": "周序号",
        "business": "周序号",
        "role": "attr"
      },
      {
        "name": "is_weekend",
        "name_cn": "是否周末",
        "type": "TINYINT(1)",
        "desc": "是否周末",
        "business": "是否周末",
        "role": "attr"
      },
      {
        "name": "month_label",
        "name_cn": "年月标签",
        "type": "VARCHAR(7)",
        "desc": "年月标签",
        "business": "年月标签",
        "role": "attr"
      },
      {
        "name": "quarter_num",
        "name_cn": "季度",
        "type": "INT",
        "desc": "季度",
        "business": "季度",
        "role": "attr"
      },
      {
        "name": "day_name",
        "name_cn": "星期",
        "type": "VARCHAR(10)",
        "desc": "星期",
        "business": "星期",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_defect_type",
    "name_cn": "缺陷类型",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·缺陷类型·全量",
    "summary": "DIM·缺陷类型·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_defect_type"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "defect_type_sk",
        "name_cn": "代理键",
        "type": "BIGINT",
        "desc": "代理键",
        "business": "代理键",
        "role": "bk"
      },
      {
        "name": "defect_type_code",
        "name_cn": "缺陷编码",
        "type": "VARCHAR(20)",
        "desc": "缺陷编码",
        "business": "缺陷编码",
        "role": "pk"
      },
      {
        "name": "defect_type_name",
        "name_cn": "缺陷名称",
        "type": "VARCHAR(40)",
        "desc": "缺陷名称",
        "business": "缺陷名称",
        "role": "attr"
      },
      {
        "name": "defect_category",
        "name_cn": "缺陷大类：外观/尺寸/功能/装配/材料",
        "type": "VARCHAR(20)",
        "desc": "缺陷大类：外观/尺寸/功能/装配/材料",
        "business": "缺陷大类：外观/尺寸/功能/装配/材料",
        "role": "attr"
      },
      {
        "name": "severity",
        "name_cn": "严重度：轻微/一般/严重",
        "type": "VARCHAR(10)",
        "desc": "严重度：轻微/一般/严重",
        "business": "严重度：轻微/一般/严重",
        "role": "attr"
      },
      {
        "name": "typical_cause",
        "name_cn": "典型成因",
        "type": "VARCHAR(80)",
        "desc": "典型成因",
        "business": "典型成因",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_equipment",
    "name_cn": "设备",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·设备·全量",
    "summary": "DIM·设备·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_equipment"
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "equipment_sk",
        "name_cn": "代理键",
        "type": "BIGINT",
        "desc": "代理键",
        "business": "代理键",
        "role": "bk"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "VARCHAR(20)",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "pk"
      },
      {
        "name": "equipment_name",
        "name_cn": "设备名称",
        "type": "VARCHAR(80)",
        "desc": "设备名称",
        "business": "设备名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "所属产线",
        "type": "VARCHAR(20)",
        "desc": "所属产线",
        "business": "所属产线",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "所属工厂",
        "type": "VARCHAR(10)",
        "desc": "所属工厂",
        "business": "所属工厂",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "equipment_type",
        "name_cn": "设备类型",
        "type": "VARCHAR(30)",
        "desc": "设备类型",
        "business": "设备类型",
        "role": "attr"
      },
      {
        "name": "rated_capacity",
        "name_cn": "额定产能·件/时",
        "type": "DECIMAL(15,2)",
        "desc": "额定产能·件/时",
        "business": "额定产能·件/时",
        "role": "attr"
      },
      {
        "name": "vendor",
        "name_cn": "设备厂商",
        "type": "VARCHAR(40)",
        "desc": "设备厂商",
        "business": "设备厂商",
        "role": "attr"
      },
      {
        "name": "install_date",
        "name_cn": "安装日期",
        "type": "DATE",
        "desc": "安装日期",
        "business": "安装日期",
        "role": "attr"
      },
      {
        "name": "equipment_status",
        "name_cn": "设备状态",
        "type": "VARCHAR(20)",
        "desc": "设备状态",
        "business": "设备状态",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_factory",
    "name_cn": "工厂",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·工厂·全量",
    "summary": "DIM·工厂·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_factory"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "factory_sk",
        "name_cn": "代理键",
        "type": "BIGINT",
        "desc": "代理键",
        "business": "代理键",
        "role": "bk"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "pk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "region",
        "name_cn": "所属大区",
        "type": "VARCHAR(30)",
        "desc": "所属大区",
        "business": "所属大区",
        "role": "attr"
      },
      {
        "name": "city",
        "name_cn": "所在城市",
        "type": "VARCHAR(30)",
        "desc": "所在城市",
        "business": "所在城市",
        "role": "attr"
      },
      {
        "name": "factory_type",
        "name_cn": "工厂类型",
        "type": "VARCHAR(30)",
        "desc": "工厂类型",
        "business": "工厂类型",
        "role": "attr"
      },
      {
        "name": "line_count",
        "name_cn": "产线数量",
        "type": "INT",
        "desc": "产线数量",
        "business": "产线数量",
        "role": "measure"
      },
      {
        "name": "employee_count",
        "name_cn": "员工人数",
        "type": "INT",
        "desc": "员工人数",
        "business": "员工人数",
        "role": "measure"
      },
      {
        "name": "floor_area_sqm",
        "name_cn": "厂房面积·㎡",
        "type": "DECIMAL(15,2)",
        "desc": "厂房面积·㎡",
        "business": "厂房面积·㎡",
        "role": "attr"
      },
      {
        "name": "factory_status",
        "name_cn": "factory_status",
        "type": "VARCHAR(20)",
        "desc": "factory_status",
        "business": "factory_status",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_material",
    "name_cn": "物料",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·物料·全量",
    "summary": "DIM·物料·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_material"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "material_sk",
        "name_cn": "物料代理键",
        "type": "BIGINT",
        "desc": "物料代理键",
        "business": "物料代理键",
        "role": "bk"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "pk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "material_type",
        "name_cn": "物料类型",
        "type": "VARCHAR(30)",
        "desc": "物料类型",
        "business": "物料类型",
        "role": "attr"
      },
      {
        "name": "standard_price",
        "name_cn": "标准单价",
        "type": "DECIMAL(15,2)",
        "desc": "标准单价",
        "business": "标准单价",
        "role": "attr"
      },
      {
        "name": "unit",
        "name_cn": "单位",
        "type": "VARCHAR(10)",
        "desc": "单位",
        "business": "单位",
        "role": "attr"
      },
      {
        "name": "abc_class",
        "name_cn": "ABC分类",
        "type": "VARCHAR(10)",
        "desc": "ABC分类",
        "business": "ABC分类",
        "role": "attr"
      },
      {
        "name": "material_status",
        "name_cn": "物料状态",
        "type": "VARCHAR(20)",
        "desc": "物料状态",
        "business": "物料状态",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_product",
    "name_cn": "产品",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·产品·全量",
    "summary": "DIM·产品·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_product"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "product_sk",
        "name_cn": "代理键",
        "type": "BIGINT",
        "desc": "代理键",
        "business": "代理键",
        "role": "bk"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "pk"
      },
      {
        "name": "product_name",
        "name_cn": "产品名称",
        "type": "VARCHAR(80)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "product_category",
        "name_cn": "产品品类",
        "type": "VARCHAR(40)",
        "desc": "产品品类",
        "business": "产品品类",
        "role": "attr"
      },
      {
        "name": "standard_unit_cost",
        "name_cn": "标准单位成本",
        "type": "DECIMAL(15,2)",
        "desc": "标准单位成本",
        "business": "标准单位成本",
        "role": "measure"
      },
      {
        "name": "unit",
        "name_cn": "单位",
        "type": "VARCHAR(10)",
        "desc": "单位",
        "business": "单位",
        "role": "attr"
      },
      {
        "name": "product_status",
        "name_cn": "产品状态",
        "type": "VARCHAR(20)",
        "desc": "产品状态",
        "business": "产品状态",
        "role": "attr"
      },
      {
        "name": "launch_date",
        "name_cn": "上市日期",
        "type": "DATE",
        "desc": "上市日期",
        "business": "上市日期",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_production_line",
    "name_cn": "产线",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·产线·全量",
    "summary": "DIM·产线·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_production_line"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "line_sk",
        "name_cn": "产线代理键",
        "type": "BIGINT",
        "desc": "产线代理键",
        "business": "产线代理键",
        "role": "bk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "pk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "design_capacity_daily",
        "name_cn": "日设计产能",
        "type": "INT",
        "desc": "日设计产能",
        "business": "日设计产能",
        "role": "attr"
      },
      {
        "name": "process_type",
        "name_cn": "工艺类型",
        "type": "VARCHAR(30)",
        "desc": "工艺类型",
        "business": "工艺类型",
        "role": "attr"
      },
      {
        "name": "line_status",
        "name_cn": "产线状态",
        "type": "VARCHAR(20)",
        "desc": "产线状态",
        "business": "产线状态",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dim_supplier",
    "name_cn": "供应商",
    "layer": "DIM",
    "type": "table",
    "purpose": "DIM·供应商·全量",
    "summary": "DIM·供应商·全量",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dim_supplier"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "supplier_sk",
        "name_cn": "供应商代理键",
        "type": "BIGINT",
        "desc": "供应商代理键",
        "business": "供应商代理键",
        "role": "bk"
      },
      {
        "name": "supplier_code",
        "name_cn": "供应商编码",
        "type": "VARCHAR(20)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "pk"
      },
      {
        "name": "supplier_name",
        "name_cn": "供应商名称",
        "type": "VARCHAR(80)",
        "desc": "供应商名称",
        "business": "供应商名称",
        "role": "attr"
      },
      {
        "name": "region",
        "name_cn": "区域",
        "type": "VARCHAR(30)",
        "desc": "区域",
        "business": "区域",
        "role": "attr"
      },
      {
        "name": "supplier_level",
        "name_cn": "供应商等级",
        "type": "VARCHAR(10)",
        "desc": "供应商等级",
        "business": "供应商等级",
        "role": "attr"
      },
      {
        "name": "lead_time_days",
        "name_cn": "交期天数",
        "type": "INT",
        "desc": "交期天数",
        "business": "交期天数",
        "role": "attr"
      },
      {
        "name": "supplier_status",
        "name_cn": "供应商状态",
        "type": "VARCHAR(20)",
        "desc": "供应商状态",
        "business": "供应商状态",
        "role": "attr"
      },
      {
        "name": "is_unknown",
        "name_cn": "是否未知维",
        "type": "TINYINT(1)",
        "desc": "是否未知维",
        "business": "是否未知维",
        "role": "attr"
      },
      {
        "name": "contact_name",
        "name_cn": "联系人",
        "type": "VARCHAR(40)",
        "desc": "联系人",
        "business": "联系人",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_equipment_run",
    "name_cn": "设备运行明细事实",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·设备运行明细事实·增量·粒度=日×设备×班次",
    "summary": "DWD·设备运行明细事实·增量·粒度=日×设备×班次",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_equipment_daily"
    ],
    "lineage": [
      "dwd_equipment_run",
      "dws_equipment_daily"
    ],
    "field_count": 19,
    "fields": [
      {
        "name": "run_id",
        "name_cn": "运行记录ID",
        "type": "BIGINT",
        "desc": "运行记录ID",
        "business": "运行记录ID",
        "role": "pk"
      },
      {
        "name": "run_date",
        "name_cn": "运行日期",
        "type": "DATE",
        "desc": "运行日期",
        "business": "运行日期",
        "role": "attr"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "VARCHAR(20)",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "fk"
      },
      {
        "name": "equipment_name",
        "name_cn": "设备名称",
        "type": "VARCHAR(80)",
        "desc": "设备名称",
        "business": "设备名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "shift_code",
        "name_cn": "班次：D白/N夜",
        "type": "VARCHAR(10)",
        "desc": "班次：D白/N夜",
        "business": "班次：D白/N夜",
        "role": "fk"
      },
      {
        "name": "planned_time_min",
        "name_cn": "计划运行分钟",
        "type": "DECIMAL(15,2)",
        "desc": "计划运行分钟",
        "business": "计划运行分钟",
        "role": "attr"
      },
      {
        "name": "run_time_min",
        "name_cn": "实际运行分钟",
        "type": "DECIMAL(15,2)",
        "desc": "实际运行分钟",
        "business": "实际运行分钟",
        "role": "attr"
      },
      {
        "name": "downtime_min",
        "name_cn": "停机分钟",
        "type": "DECIMAL(15,2)",
        "desc": "停机分钟",
        "business": "停机分钟",
        "role": "attr"
      },
      {
        "name": "downtime_reason",
        "name_cn": "停机原因",
        "type": "VARCHAR(40)",
        "desc": "停机原因",
        "business": "停机原因",
        "role": "attr"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "INT",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "good_qty",
        "name_cn": "良品数量",
        "type": "INT",
        "desc": "良品数量",
        "business": "良品数量",
        "role": "measure"
      },
      {
        "name": "failure_count",
        "name_cn": "故障次数",
        "type": "INT",
        "desc": "故障次数",
        "business": "故障次数",
        "role": "measure"
      },
      {
        "name": "availability_pct",
        "name_cn": "时间开动率%",
        "type": "DECIMAL(15,2)",
        "desc": "时间开动率%",
        "business": "时间开动率%",
        "role": "measure"
      },
      {
        "name": "performance_pct",
        "name_cn": "性能开动率%",
        "type": "DECIMAL(15,2)",
        "desc": "性能开动率%",
        "business": "性能开动率%",
        "role": "measure"
      },
      {
        "name": "quality_pct",
        "name_cn": "合格率%",
        "type": "DECIMAL(15,2)",
        "desc": "合格率%",
        "business": "合格率%",
        "role": "measure"
      },
      {
        "name": "oee_pct",
        "name_cn": "OEE%",
        "type": "DECIMAL(15,2)",
        "desc": "OEE%",
        "business": "OEE%",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_labor_wide",
    "name_cn": "人工事实宽表",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·人工事实宽表·增量·粒度=工单×人工记录",
    "summary": "DWD·人工事实宽表·增量·粒度=工单×人工记录",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_labor_monthly"
    ],
    "lineage": [
      "ods_labor",
      "dwd_labor_wide",
      "dws_labor_monthly"
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "labor_id",
        "name_cn": "人工记录ID",
        "type": "BIGINT",
        "desc": "人工记录ID",
        "business": "人工记录ID",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "work_date",
        "name_cn": "作业日期",
        "type": "DATE",
        "desc": "作业日期",
        "business": "作业日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品",
        "type": "VARCHAR(20)",
        "desc": "产品",
        "business": "产品",
        "role": "fk"
      },
      {
        "name": "shift_code",
        "name_cn": "班次",
        "type": "VARCHAR(10)",
        "desc": "班次",
        "business": "班次",
        "role": "fk"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "hours_achievement_pct",
        "name_cn": "工时达成率%",
        "type": "DECIMAL(15,2)",
        "desc": "工时达成率%",
        "business": "工时达成率%",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本·元",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本·元",
        "business": "人工成本·元",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_production_wide",
    "name_cn": "生产事实宽表",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·生产事实宽表·增量·粒度=工单",
    "summary": "DWD·生产事实宽表·增量·粒度=工单",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_production_daily"
    ],
    "lineage": [
      "ods_production_order",
      "dwd_production_wide",
      "dws_production_daily"
    ],
    "field_count": 21,
    "fields": [
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "pk"
      },
      {
        "name": "order_sk",
        "name_cn": "工单代理键",
        "type": "BIGINT",
        "desc": "工单代理键",
        "business": "工单代理键",
        "role": "bk"
      },
      {
        "name": "order_date",
        "name_cn": "开工日期",
        "type": "DATE",
        "desc": "开工日期",
        "business": "开工日期",
        "role": "attr"
      },
      {
        "name": "due_date",
        "name_cn": "交付日期",
        "type": "DATE",
        "desc": "交付日期",
        "business": "交付日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "product_name",
        "name_cn": "产品名称",
        "type": "VARCHAR(80)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "INT",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "actual_qty",
        "name_cn": "实际产量",
        "type": "INT",
        "desc": "实际产量",
        "business": "实际产量",
        "role": "measure"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "delivered_on_time",
        "name_cn": "是否准时交付",
        "type": "TINYINT(1)",
        "desc": "是否准时交付",
        "business": "是否准时交付",
        "role": "attr"
      },
      {
        "name": "order_status",
        "name_cn": "工单状态",
        "type": "VARCHAR(20)",
        "desc": "工单状态",
        "business": "工单状态",
        "role": "attr"
      },
      {
        "name": "material_cost",
        "name_cn": "材料成本",
        "type": "DECIMAL(15,2)",
        "desc": "材料成本",
        "business": "材料成本",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "overhead_cost",
        "name_cn": "制造费用",
        "type": "DECIMAL(15,2)",
        "desc": "制造费用",
        "business": "制造费用",
        "role": "measure"
      },
      {
        "name": "total_cost",
        "name_cn": "总成本",
        "type": "DECIMAL(15,2)",
        "desc": "总成本",
        "business": "总成本",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_quality_wide",
    "name_cn": "质量事实宽表",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·质量事实宽表·增量·粒度=质检单",
    "summary": "DWD·质量事实宽表·增量·粒度=质检单",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_quality_daily"
    ],
    "lineage": [
      "ods_quality_inspection",
      "dwd_quality_wide",
      "dws_quality_daily"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "inspect_id",
        "name_cn": "质检单号",
        "type": "BIGINT",
        "desc": "质检单号",
        "business": "质检单号",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "inspect_date",
        "name_cn": "质检日期",
        "type": "DATE",
        "desc": "质检日期",
        "business": "质检日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "product_name",
        "name_cn": "产品名称",
        "type": "VARCHAR(80)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "INT",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "pass_qty",
        "name_cn": "合格数",
        "type": "INT",
        "desc": "合格数",
        "business": "合格数",
        "role": "measure"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "INT",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "INT",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "defect_type",
        "name_cn": "缺陷类型",
        "type": "VARCHAR(40)",
        "desc": "缺陷类型",
        "business": "缺陷类型",
        "role": "attr"
      },
      {
        "name": "inspect_type",
        "name_cn": "检验类型",
        "type": "VARCHAR(20)",
        "desc": "检验类型",
        "business": "检验类型",
        "role": "attr"
      },
      {
        "name": "is_rework",
        "name_cn": "是否返工",
        "type": "TINYINT(1)",
        "desc": "是否返工",
        "business": "是否返工",
        "role": "attr"
      },
      {
        "name": "yield_rate",
        "name_cn": "良品率%",
        "type": "DECIMAL(15,2)",
        "desc": "良品率%",
        "business": "良品率%",
        "role": "measure"
      },
      {
        "name": "defect_rate",
        "name_cn": "defect_rate",
        "type": "DECIMAL(15,2)",
        "desc": "defect_rate",
        "business": "defect_rate",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dwd_supply_wide",
    "name_cn": "供应链事实宽表",
    "layer": "DWD",
    "type": "table",
    "purpose": "DWD·供应链事实宽表·快照·粒度=日×物料×供应商",
    "summary": "DWD·供应链事实宽表·快照·粒度=日×物料×供应商",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "dws_supply_daily"
    ],
    "lineage": [
      "ods_inventory_material",
      "dwd_supply_wide",
      "dws_supply_daily"
    ],
    "field_count": 17,
    "fields": [
      {
        "name": "record_id",
        "name_cn": "record_id",
        "type": "BIGINT",
        "desc": "record_id",
        "business": "record_id",
        "role": "pk"
      },
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "fk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "supplier_code",
        "name_cn": "供应商编码",
        "type": "VARCHAR(20)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "fk"
      },
      {
        "name": "supplier_name",
        "name_cn": "供应商名称",
        "type": "VARCHAR(80)",
        "desc": "供应商名称",
        "business": "供应商名称",
        "role": "attr"
      },
      {
        "name": "warehouse_code",
        "name_cn": "仓库编码",
        "type": "VARCHAR(20)",
        "desc": "仓库编码",
        "business": "仓库编码",
        "role": "fk"
      },
      {
        "name": "on_hand_qty",
        "name_cn": "现存量",
        "type": "DECIMAL(15,2)",
        "desc": "现存量",
        "business": "现存量",
        "role": "measure"
      },
      {
        "name": "daily_usage",
        "name_cn": "日均用量",
        "type": "DECIMAL(15,2)",
        "desc": "日均用量",
        "business": "日均用量",
        "role": "attr"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "purchase_qty",
        "name_cn": "purchase_qty",
        "type": "DECIMAL(15,2)",
        "desc": "purchase_qty",
        "business": "purchase_qty",
        "role": "measure"
      },
      {
        "name": "purchase_amount",
        "name_cn": "采购金额",
        "type": "DECIMAL(15,2)",
        "desc": "采购金额",
        "business": "采购金额",
        "role": "measure"
      },
      {
        "name": "actual_price",
        "name_cn": "actual_price",
        "type": "DECIMAL(15,2)",
        "desc": "actual_price",
        "business": "actual_price",
        "role": "attr"
      },
      {
        "name": "standard_price",
        "name_cn": "标准单价",
        "type": "DECIMAL(15,2)",
        "desc": "标准单价",
        "business": "标准单价",
        "role": "attr"
      },
      {
        "name": "on_time_delivery",
        "name_cn": "on_time_delivery",
        "type": "TINYINT(1)",
        "desc": "on_time_delivery",
        "business": "on_time_delivery",
        "role": "attr"
      },
      {
        "name": "turnover_days",
        "name_cn": "周转天数",
        "type": "DECIMAL(15,2)",
        "desc": "周转天数",
        "business": "周转天数",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_equipment_run",
    "name_cn": "设备运行事实",
    "layer": "DWD",
    "type": "view",
    "purpose": "DWD·设备运行事实（同义视图）",
    "summary": "DWD·设备运行事实（同义视图）",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_equipment_run"
    ],
    "field_count": 19,
    "fields": [
      {
        "name": "run_id",
        "name_cn": "运行记录ID",
        "type": "BIGINT",
        "desc": "运行记录ID",
        "business": "运行记录ID",
        "role": "pk"
      },
      {
        "name": "run_date",
        "name_cn": "运行日期",
        "type": "DATE",
        "desc": "运行日期",
        "business": "运行日期",
        "role": "attr"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "VARCHAR(20)",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "fk"
      },
      {
        "name": "equipment_name",
        "name_cn": "设备名称",
        "type": "VARCHAR(80)",
        "desc": "设备名称",
        "business": "设备名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "shift_code",
        "name_cn": "班次：D白/N夜",
        "type": "VARCHAR(10)",
        "desc": "班次：D白/N夜",
        "business": "班次：D白/N夜",
        "role": "fk"
      },
      {
        "name": "planned_time_min",
        "name_cn": "计划运行分钟",
        "type": "DECIMAL(15,2)",
        "desc": "计划运行分钟",
        "business": "计划运行分钟",
        "role": "attr"
      },
      {
        "name": "run_time_min",
        "name_cn": "实际运行分钟",
        "type": "DECIMAL(15,2)",
        "desc": "实际运行分钟",
        "business": "实际运行分钟",
        "role": "attr"
      },
      {
        "name": "downtime_min",
        "name_cn": "停机分钟",
        "type": "DECIMAL(15,2)",
        "desc": "停机分钟",
        "business": "停机分钟",
        "role": "attr"
      },
      {
        "name": "downtime_reason",
        "name_cn": "停机原因",
        "type": "VARCHAR(40)",
        "desc": "停机原因",
        "business": "停机原因",
        "role": "attr"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "INT",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "good_qty",
        "name_cn": "良品数量",
        "type": "INT",
        "desc": "良品数量",
        "business": "良品数量",
        "role": "measure"
      },
      {
        "name": "failure_count",
        "name_cn": "故障次数",
        "type": "INT",
        "desc": "故障次数",
        "business": "故障次数",
        "role": "measure"
      },
      {
        "name": "availability_pct",
        "name_cn": "时间开动率%",
        "type": "DECIMAL(15,2)",
        "desc": "时间开动率%",
        "business": "时间开动率%",
        "role": "measure"
      },
      {
        "name": "performance_pct",
        "name_cn": "性能开动率%",
        "type": "DECIMAL(15,2)",
        "desc": "性能开动率%",
        "business": "性能开动率%",
        "role": "measure"
      },
      {
        "name": "quality_pct",
        "name_cn": "合格率%",
        "type": "DECIMAL(15,2)",
        "desc": "合格率%",
        "business": "合格率%",
        "role": "measure"
      },
      {
        "name": "oee_pct",
        "name_cn": "OEE%",
        "type": "DECIMAL(15,2)",
        "desc": "OEE%",
        "business": "OEE%",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_labor",
    "name_cn": "人工事实",
    "layer": "DWD",
    "type": "view",
    "purpose": "DWD·人工事实（同义视图）",
    "summary": "DWD·人工事实（同义视图）",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_labor"
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "labor_id",
        "name_cn": "人工记录ID",
        "type": "BIGINT",
        "desc": "人工记录ID",
        "business": "人工记录ID",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "work_date",
        "name_cn": "作业日期",
        "type": "DATE",
        "desc": "作业日期",
        "business": "作业日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品",
        "type": "VARCHAR(20)",
        "desc": "产品",
        "business": "产品",
        "role": "fk"
      },
      {
        "name": "shift_code",
        "name_cn": "班次",
        "type": "VARCHAR(10)",
        "desc": "班次",
        "business": "班次",
        "role": "fk"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "hours_achievement_pct",
        "name_cn": "工时达成率%",
        "type": "DECIMAL(15,2)",
        "desc": "工时达成率%",
        "business": "工时达成率%",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本·元",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本·元",
        "business": "人工成本·元",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_material_consumption",
    "name_cn": "工单领料事实",
    "layer": "DWD",
    "type": "table",
    "purpose": "FACT·工单领料事实·增量·粒度=工单×物料",
    "summary": "FACT·工单领料事实·增量·粒度=工单×物料",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_material_consumption"
    ],
    "field_count": 14,
    "fields": [
      {
        "name": "consumption_id",
        "name_cn": "领料记录ID",
        "type": "BIGINT",
        "desc": "领料记录ID",
        "business": "领料记录ID",
        "role": "pk"
      },
      {
        "name": "consume_date",
        "name_cn": "领料日期",
        "type": "DATE",
        "desc": "领料日期",
        "business": "领料日期",
        "role": "attr"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "fk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品",
        "type": "VARCHAR(20)",
        "desc": "产品",
        "business": "产品",
        "role": "fk"
      },
      {
        "name": "plan_qty",
        "name_cn": "应领量·BOM",
        "type": "DECIMAL(15,2)",
        "desc": "应领量·BOM",
        "business": "应领量·BOM",
        "role": "measure"
      },
      {
        "name": "actual_qty",
        "name_cn": "实领量",
        "type": "DECIMAL(15,2)",
        "desc": "实领量",
        "business": "实领量",
        "role": "measure"
      },
      {
        "name": "unit_price",
        "name_cn": "物料单价·元",
        "type": "DECIMAL(15,2)",
        "desc": "物料单价·元",
        "business": "物料单价·元",
        "role": "attr"
      },
      {
        "name": "consume_amount",
        "name_cn": "耗用金额·元",
        "type": "DECIMAL(15,2)",
        "desc": "耗用金额·元",
        "business": "耗用金额·元",
        "role": "measure"
      },
      {
        "name": "variance_qty",
        "name_cn": "超领量（实领-应领）",
        "type": "DECIMAL(15,2)",
        "desc": "超领量（实领-应领）",
        "business": "超领量（实领-应领）",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_process_operation",
    "name_cn": "工序完成事实",
    "layer": "DWD",
    "type": "table",
    "purpose": "FACT·工序完成事实·增量·粒度=工单×工序",
    "summary": "FACT·工序完成事实·增量·粒度=工单×工序",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_process_operation"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "op_id",
        "name_cn": "工序记录ID",
        "type": "BIGINT",
        "desc": "工序记录ID",
        "business": "工序记录ID",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "step_seq",
        "name_cn": "工序顺序",
        "type": "INT",
        "desc": "工序顺序",
        "business": "工序顺序",
        "role": "attr"
      },
      {
        "name": "process_step",
        "name_cn": "工序名：下料/加工/装配/检验/包装",
        "type": "VARCHAR(30)",
        "desc": "工序名：下料/加工/装配/检验/包装",
        "business": "工序名：下料/加工/装配/检验/包装",
        "role": "attr"
      },
      {
        "name": "report_date",
        "name_cn": "报工日期",
        "type": "DATE",
        "desc": "报工日期",
        "business": "报工日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂",
        "type": "VARCHAR(10)",
        "desc": "工厂",
        "business": "工厂",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线",
        "type": "VARCHAR(20)",
        "desc": "产线",
        "business": "产线",
        "role": "fk"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备",
        "type": "VARCHAR(20)",
        "desc": "设备",
        "business": "设备",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品",
        "type": "VARCHAR(20)",
        "desc": "产品",
        "business": "产品",
        "role": "fk"
      },
      {
        "name": "input_qty",
        "name_cn": "投入数量",
        "type": "INT",
        "desc": "投入数量",
        "business": "投入数量",
        "role": "measure"
      },
      {
        "name": "output_qty",
        "name_cn": "完成数量",
        "type": "INT",
        "desc": "完成数量",
        "business": "完成数量",
        "role": "measure"
      },
      {
        "name": "good_qty",
        "name_cn": "合格数量",
        "type": "INT",
        "desc": "合格数量",
        "business": "合格数量",
        "role": "measure"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数量",
        "type": "INT",
        "desc": "不良数量",
        "business": "不良数量",
        "role": "measure"
      },
      {
        "name": "wip_qty",
        "name_cn": "在制品数量",
        "type": "INT",
        "desc": "在制品数量",
        "business": "在制品数量",
        "role": "measure"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "op_status",
        "name_cn": "工序状态：完成/在制/待产",
        "type": "VARCHAR(20)",
        "desc": "工序状态：完成/在制/待产",
        "business": "工序状态：完成/在制/待产",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_production",
    "name_cn": "生产事实",
    "layer": "DWD",
    "type": "view",
    "purpose": "DWD·生产事实（同义视图）",
    "summary": "DWD·生产事实（同义视图）",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_production"
    ],
    "field_count": 21,
    "fields": [
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "pk"
      },
      {
        "name": "order_sk",
        "name_cn": "工单代理键",
        "type": "BIGINT",
        "desc": "工单代理键",
        "business": "工单代理键",
        "role": "bk"
      },
      {
        "name": "order_date",
        "name_cn": "开工日期",
        "type": "DATE",
        "desc": "开工日期",
        "business": "开工日期",
        "role": "attr"
      },
      {
        "name": "due_date",
        "name_cn": "交付日期",
        "type": "DATE",
        "desc": "交付日期",
        "business": "交付日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "factory_name",
        "name_cn": "工厂名称",
        "type": "VARCHAR(40)",
        "desc": "工厂名称",
        "business": "工厂名称",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "product_name",
        "name_cn": "产品名称",
        "type": "VARCHAR(80)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "INT",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "actual_qty",
        "name_cn": "实际产量",
        "type": "INT",
        "desc": "实际产量",
        "business": "实际产量",
        "role": "measure"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "delivered_on_time",
        "name_cn": "是否准时交付",
        "type": "TINYINT(1)",
        "desc": "是否准时交付",
        "business": "是否准时交付",
        "role": "attr"
      },
      {
        "name": "order_status",
        "name_cn": "工单状态",
        "type": "VARCHAR(20)",
        "desc": "工单状态",
        "business": "工单状态",
        "role": "attr"
      },
      {
        "name": "material_cost",
        "name_cn": "材料成本",
        "type": "DECIMAL(15,2)",
        "desc": "材料成本",
        "business": "材料成本",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "overhead_cost",
        "name_cn": "制造费用",
        "type": "DECIMAL(15,2)",
        "desc": "制造费用",
        "business": "制造费用",
        "role": "measure"
      },
      {
        "name": "total_cost",
        "name_cn": "总成本",
        "type": "DECIMAL(15,2)",
        "desc": "总成本",
        "business": "总成本",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_quality",
    "name_cn": "质量事实",
    "layer": "DWD",
    "type": "view",
    "purpose": "DWD·质量事实（同义视图）",
    "summary": "DWD·质量事实（同义视图）",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_quality"
    ],
    "field_count": 18,
    "fields": [
      {
        "name": "inspect_id",
        "name_cn": "质检单号",
        "type": "BIGINT",
        "desc": "质检单号",
        "business": "质检单号",
        "role": "pk"
      },
      {
        "name": "order_id",
        "name_cn": "工单号",
        "type": "VARCHAR(32)",
        "desc": "工单号",
        "business": "工单号",
        "role": "fk"
      },
      {
        "name": "inspect_date",
        "name_cn": "质检日期",
        "type": "DATE",
        "desc": "质检日期",
        "business": "质检日期",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "line_name",
        "name_cn": "产线名称",
        "type": "VARCHAR(60)",
        "desc": "产线名称",
        "business": "产线名称",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "product_name",
        "name_cn": "产品名称",
        "type": "VARCHAR(80)",
        "desc": "产品名称",
        "business": "产品名称",
        "role": "attr"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "INT",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "pass_qty",
        "name_cn": "合格数",
        "type": "INT",
        "desc": "合格数",
        "business": "合格数",
        "role": "measure"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "INT",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "INT",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "defect_type",
        "name_cn": "缺陷类型",
        "type": "VARCHAR(40)",
        "desc": "缺陷类型",
        "business": "缺陷类型",
        "role": "attr"
      },
      {
        "name": "inspect_type",
        "name_cn": "检验类型",
        "type": "VARCHAR(20)",
        "desc": "检验类型",
        "business": "检验类型",
        "role": "attr"
      },
      {
        "name": "is_rework",
        "name_cn": "是否返工",
        "type": "TINYINT(1)",
        "desc": "是否返工",
        "business": "是否返工",
        "role": "attr"
      },
      {
        "name": "yield_rate",
        "name_cn": "良品率%",
        "type": "DECIMAL(15,2)",
        "desc": "良品率%",
        "business": "良品率%",
        "role": "measure"
      },
      {
        "name": "defect_rate",
        "name_cn": "defect_rate",
        "type": "DECIMAL(15,2)",
        "desc": "defect_rate",
        "business": "defect_rate",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "fact_supply",
    "name_cn": "供应事实",
    "layer": "DWD",
    "type": "view",
    "purpose": "DWD·供应事实（同义视图）",
    "summary": "DWD·供应事实（同义视图）",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "fact_supply"
    ],
    "field_count": 17,
    "fields": [
      {
        "name": "record_id",
        "name_cn": "record_id",
        "type": "BIGINT",
        "desc": "record_id",
        "business": "record_id",
        "role": "pk"
      },
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "fk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "supplier_code",
        "name_cn": "供应商编码",
        "type": "VARCHAR(20)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "fk"
      },
      {
        "name": "supplier_name",
        "name_cn": "供应商名称",
        "type": "VARCHAR(80)",
        "desc": "供应商名称",
        "business": "供应商名称",
        "role": "attr"
      },
      {
        "name": "warehouse_code",
        "name_cn": "仓库编码",
        "type": "VARCHAR(20)",
        "desc": "仓库编码",
        "business": "仓库编码",
        "role": "fk"
      },
      {
        "name": "on_hand_qty",
        "name_cn": "现存量",
        "type": "DECIMAL(15,2)",
        "desc": "现存量",
        "business": "现存量",
        "role": "measure"
      },
      {
        "name": "daily_usage",
        "name_cn": "日均用量",
        "type": "DECIMAL(15,2)",
        "desc": "日均用量",
        "business": "日均用量",
        "role": "attr"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "purchase_qty",
        "name_cn": "purchase_qty",
        "type": "DECIMAL(15,2)",
        "desc": "purchase_qty",
        "business": "purchase_qty",
        "role": "measure"
      },
      {
        "name": "purchase_amount",
        "name_cn": "采购金额",
        "type": "DECIMAL(15,2)",
        "desc": "采购金额",
        "business": "采购金额",
        "role": "measure"
      },
      {
        "name": "actual_price",
        "name_cn": "actual_price",
        "type": "DECIMAL(15,2)",
        "desc": "actual_price",
        "business": "actual_price",
        "role": "attr"
      },
      {
        "name": "standard_price",
        "name_cn": "标准单价",
        "type": "DECIMAL(15,2)",
        "desc": "标准单价",
        "business": "标准单价",
        "role": "attr"
      },
      {
        "name": "on_time_delivery",
        "name_cn": "on_time_delivery",
        "type": "TINYINT(1)",
        "desc": "on_time_delivery",
        "business": "on_time_delivery",
        "role": "attr"
      },
      {
        "name": "turnover_days",
        "name_cn": "周转天数",
        "type": "DECIMAL(15,2)",
        "desc": "周转天数",
        "business": "周转天数",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_cost_monthly",
    "name_cn": "月成本汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·月成本汇总·快照表",
    "summary": "DWS·月成本汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_cost_analysis",
      "v_manufacturing_finance"
    ],
    "lineage": [
      "dws_cost_monthly",
      "v_cost_analysis",
      "v_manufacturing_finance"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_month",
        "name_cn": "年月",
        "type": "VARCHAR(7)",
        "desc": "年月",
        "business": "年月",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "INT",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "total_cost",
        "name_cn": "总成本",
        "type": "DECIMAL(15,2)",
        "desc": "总成本",
        "business": "总成本",
        "role": "measure"
      },
      {
        "name": "material_cost",
        "name_cn": "材料成本",
        "type": "DECIMAL(15,2)",
        "desc": "材料成本",
        "business": "材料成本",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "overhead_cost",
        "name_cn": "制造费用",
        "type": "DECIMAL(15,2)",
        "desc": "制造费用",
        "business": "制造费用",
        "role": "measure"
      },
      {
        "name": "unit_cost",
        "name_cn": "单位成本",
        "type": "DECIMAL(15,2)",
        "desc": "单位成本",
        "business": "单位成本",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_defect_daily",
    "name_cn": "日缺陷汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日缺陷汇总·快照表",
    "summary": "DWS·日缺陷汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_defect_analysis"
    ],
    "lineage": [
      "ods_quality_inspection",
      "dws_defect_daily",
      "v_defect_analysis"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "defect_type",
        "name_cn": "缺陷类型",
        "type": "VARCHAR(40)",
        "desc": "缺陷类型",
        "business": "缺陷类型",
        "role": "attr"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "INT",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "INT",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "INT",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "defect_rate_pct",
        "name_cn": "不良率%",
        "type": "DECIMAL(15,2)",
        "desc": "不良率%",
        "business": "不良率%",
        "role": "measure"
      },
      {
        "name": "inspect_count",
        "name_cn": "质检次数",
        "type": "INT",
        "desc": "质检次数",
        "business": "质检次数",
        "role": "measure"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_equipment_daily",
    "name_cn": "日设备汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日设备汇总·快照表",
    "summary": "DWS·日设备汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_equipment_oee"
    ],
    "lineage": [
      "ods_equipment",
      "dwd_equipment_run",
      "dws_equipment_daily",
      "v_equipment_oee"
    ],
    "field_count": 11,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "VARCHAR(20)",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "availability_pct",
        "name_cn": "可用率%",
        "type": "DECIMAL(15,2)",
        "desc": "可用率%",
        "business": "可用率%",
        "role": "measure"
      },
      {
        "name": "performance_pct",
        "name_cn": "性能率%",
        "type": "DECIMAL(15,2)",
        "desc": "性能率%",
        "business": "性能率%",
        "role": "measure"
      },
      {
        "name": "quality_pct",
        "name_cn": "质量率%",
        "type": "DECIMAL(15,2)",
        "desc": "质量率%",
        "business": "质量率%",
        "role": "measure"
      },
      {
        "name": "oee_pct",
        "name_cn": "OEE%",
        "type": "DECIMAL(15,2)",
        "desc": "OEE%",
        "business": "OEE%",
        "role": "measure"
      },
      {
        "name": "downtime_hours",
        "name_cn": "停机小时",
        "type": "DECIMAL(15,2)",
        "desc": "停机小时",
        "business": "停机小时",
        "role": "measure"
      },
      {
        "name": "failure_count",
        "name_cn": "故障次数",
        "type": "INT",
        "desc": "故障次数",
        "business": "故障次数",
        "role": "measure"
      },
      {
        "name": "downtime_reason",
        "name_cn": "停机原因",
        "type": "VARCHAR(40)",
        "desc": "停机原因",
        "business": "停机原因",
        "role": "attr"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_labor_monthly",
    "name_cn": "月人工效率",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·月人工效率·快照表",
    "summary": "DWS·月人工效率·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_labor_efficiency"
    ],
    "lineage": [
      "ods_labor",
      "dwd_labor_wide",
      "dws_labor_monthly",
      "v_labor_efficiency"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_month",
        "name_cn": "年月",
        "type": "VARCHAR(7)",
        "desc": "年月",
        "business": "年月",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "DECIMAL(15,2)",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "DECIMAL(15,2)",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "hours_achievement_pct",
        "name_cn": "工时达成率%",
        "type": "DECIMAL(15,2)",
        "desc": "工时达成率%",
        "business": "工时达成率%",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "DECIMAL(15,2)",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "order_count",
        "name_cn": "工单数",
        "type": "INT",
        "desc": "工单数",
        "business": "工单数",
        "role": "measure"
      },
      {
        "name": "worker_count",
        "name_cn": "工人数",
        "type": "INT",
        "desc": "工人数",
        "business": "工人数",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_material_daily",
    "name_cn": "日物料周转",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日物料周转·快照表",
    "summary": "DWS·日物料周转·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_material_turnover"
    ],
    "lineage": [
      "ods_inventory_material",
      "dws_material_daily",
      "v_material_turnover"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "VARCHAR(20)",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "fk"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "VARCHAR(80)",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "on_hand_qty",
        "name_cn": "现存量",
        "type": "DECIMAL(15,2)",
        "desc": "现存量",
        "business": "现存量",
        "role": "measure"
      },
      {
        "name": "daily_usage",
        "name_cn": "日均用量",
        "type": "DECIMAL(15,2)",
        "desc": "日均用量",
        "business": "日均用量",
        "role": "attr"
      },
      {
        "name": "turnover_days",
        "name_cn": "周转天数",
        "type": "DECIMAL(15,2)",
        "desc": "周转天数",
        "business": "周转天数",
        "role": "attr"
      },
      {
        "name": "max_on_hand",
        "name_cn": "最高库存",
        "type": "DECIMAL(15,2)",
        "desc": "最高库存",
        "business": "最高库存",
        "role": "attr"
      },
      {
        "name": "safety_stock",
        "name_cn": "安全库存",
        "type": "DECIMAL(15,2)",
        "desc": "安全库存",
        "business": "安全库存",
        "role": "attr"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_production_daily",
    "name_cn": "日生产汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日生产汇总·快照表",
    "summary": "DWS·日生产汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_production_overview",
      "v_capacity_utilization",
      "v_cmei_daily"
    ],
    "lineage": [
      "dwd_production_wide",
      "dws_production_daily",
      "v_production_overview",
      "v_capacity_utilization",
      "v_cmei_daily"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "VARCHAR(10)",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "fk"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "INT",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "INT",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "capacity_util_pct",
        "name_cn": "产能利用率%",
        "type": "DECIMAL(15,2)",
        "desc": "产能利用率%",
        "business": "产能利用率%",
        "role": "measure"
      },
      {
        "name": "labor_hours",
        "name_cn": "工时",
        "type": "DECIMAL(15,2)",
        "desc": "工时",
        "business": "工时",
        "role": "measure"
      },
      {
        "name": "on_time_delivery_pct",
        "name_cn": "准时交付率%",
        "type": "DECIMAL(15,2)",
        "desc": "准时交付率%",
        "business": "准时交付率%",
        "role": "measure"
      },
      {
        "name": "order_count",
        "name_cn": "工单数",
        "type": "INT",
        "desc": "工单数",
        "business": "工单数",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_quality_daily",
    "name_cn": "日质量汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日质量汇总·快照表",
    "summary": "DWS·日质量汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_quality_analysis"
    ],
    "lineage": [
      "dwd_quality_wide",
      "dws_quality_daily",
      "v_quality_analysis"
    ],
    "field_count": 12,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "VARCHAR(20)",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "fk"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "VARCHAR(20)",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "fk"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "INT",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "pass_qty",
        "name_cn": "合格数",
        "type": "INT",
        "desc": "合格数",
        "business": "合格数",
        "role": "measure"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "INT",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "INT",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "yield_rate_pct",
        "name_cn": "良品率%",
        "type": "DECIMAL(15,2)",
        "desc": "良品率%",
        "business": "良品率%",
        "role": "measure"
      },
      {
        "name": "defect_rate_pct",
        "name_cn": "不良率%",
        "type": "DECIMAL(15,2)",
        "desc": "不良率%",
        "business": "不良率%",
        "role": "measure"
      },
      {
        "name": "scrap_rate_pct",
        "name_cn": "报废率%",
        "type": "DECIMAL(15,2)",
        "desc": "报废率%",
        "business": "报废率%",
        "role": "measure"
      },
      {
        "name": "first_pass_pct",
        "name_cn": "一次通过率%",
        "type": "DECIMAL(15,2)",
        "desc": "一次通过率%",
        "business": "一次通过率%",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "dws_supply_daily",
    "name_cn": "日供应汇总",
    "layer": "DWS",
    "type": "table",
    "purpose": "DWS·日供应汇总·快照表",
    "summary": "DWS·日供应汇总·快照表",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "v_supply_chain"
    ],
    "lineage": [
      "dwd_supply_wide",
      "dws_supply_daily",
      "v_supply_chain"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "DATE",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "supplier_code",
        "name_cn": "供应商编码",
        "type": "VARCHAR(20)",
        "desc": "供应商编码",
        "business": "供应商编码",
        "role": "fk"
      },
      {
        "name": "purchase_amount",
        "name_cn": "采购金额",
        "type": "DECIMAL(15,2)",
        "desc": "采购金额",
        "business": "采购金额",
        "role": "measure"
      },
      {
        "name": "purchase_qty",
        "name_cn": "purchase_qty",
        "type": "DECIMAL(15,2)",
        "desc": "purchase_qty",
        "business": "purchase_qty",
        "role": "measure"
      },
      {
        "name": "inventory_turnover_days",
        "name_cn": "库存周转天数",
        "type": "DECIMAL(15,2)",
        "desc": "库存周转天数",
        "business": "库存周转天数",
        "role": "attr"
      },
      {
        "name": "supplier_otd_pct",
        "name_cn": "供应商OTD%",
        "type": "DECIMAL(15,2)",
        "desc": "供应商OTD%",
        "business": "供应商OTD%",
        "role": "measure"
      },
      {
        "name": "order_count",
        "name_cn": "工单数",
        "type": "INT",
        "desc": "工单数",
        "business": "工单数",
        "role": "measure"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额",
        "type": "DECIMAL(15,2)",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      },
      {
        "name": "etl_batch_id",
        "name_cn": "ETL批次",
        "type": "VARCHAR(32)",
        "desc": "ETL批次",
        "business": "ETL批次",
        "role": "fk"
      }
    ]
  },
  {
    "name": "v_capacity_utilization",
    "name_cn": "产能利用率",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·产能利用率",
    "summary": "ADS·产能利用率",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_production_daily",
      "v_capacity_utilization"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "EXPR",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "EXPR",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "attr"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "EXPR",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "capacity_util_pct",
        "name_cn": "产能利用率%",
        "type": "EXPR",
        "desc": "产能利用率%",
        "business": "产能利用率%",
        "role": "measure"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "EXPR",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "labor_hours",
        "name_cn": "工时",
        "type": "EXPR",
        "desc": "工时",
        "business": "工时",
        "role": "measure"
      },
      {
        "name": "on_time_delivery_pct",
        "name_cn": "准时交付率%",
        "type": "EXPR",
        "desc": "准时交付率%",
        "business": "准时交付率%",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_cmei_daily",
    "name_cn": "综合效能CMEI",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·综合效能CMEI",
    "summary": "ADS·综合效能CMEI",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_production_daily",
      "v_cmei_daily"
    ],
    "field_count": 5,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "cmei_pct",
        "name_cn": "cmei_pct",
        "type": "EXPR",
        "desc": "cmei_pct",
        "business": "cmei_pct",
        "role": "measure"
      },
      {
        "name": "fpy_pct",
        "name_cn": "FPY%",
        "type": "EXPR",
        "desc": "FPY%",
        "business": "FPY%",
        "role": "measure"
      },
      {
        "name": "oee_pct",
        "name_cn": "OEE%",
        "type": "EXPR",
        "desc": "OEE%",
        "business": "OEE%",
        "role": "measure"
      },
      {
        "name": "otd_pct",
        "name_cn": "otd_pct",
        "type": "EXPR",
        "desc": "otd_pct",
        "business": "otd_pct",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_cost_analysis",
    "name_cn": "成本分析",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·成本分析",
    "summary": "ADS·成本分析",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_cost_monthly",
      "v_cost_analysis"
    ],
    "field_count": 7,
    "fields": [
      {
        "name": "snapshot_month",
        "name_cn": "年月",
        "type": "EXPR",
        "desc": "年月",
        "business": "年月",
        "role": "attr"
      },
      {
        "name": "total_cost",
        "name_cn": "总成本",
        "type": "EXPR",
        "desc": "总成本",
        "business": "总成本",
        "role": "measure"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "EXPR",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "unit_cost",
        "name_cn": "单位成本",
        "type": "EXPR",
        "desc": "单位成本",
        "business": "单位成本",
        "role": "measure"
      },
      {
        "name": "material_pct",
        "name_cn": "材料成本占比%",
        "type": "EXPR",
        "desc": "材料成本占比%",
        "business": "材料成本占比%",
        "role": "measure"
      },
      {
        "name": "labor_pct",
        "name_cn": "人工成本占比%",
        "type": "EXPR",
        "desc": "人工成本占比%",
        "business": "人工成本占比%",
        "role": "measure"
      },
      {
        "name": "overhead_pct",
        "name_cn": "制造费用占比%",
        "type": "EXPR",
        "desc": "制造费用占比%",
        "business": "制造费用占比%",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_defect_analysis",
    "name_cn": "缺陷分析",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·缺陷分析",
    "summary": "ADS·缺陷分析",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_defect_daily",
      "v_defect_analysis"
    ],
    "field_count": 8,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "defect_type",
        "name_cn": "缺陷类型",
        "type": "EXPR",
        "desc": "缺陷类型",
        "business": "缺陷类型",
        "role": "attr"
      },
      {
        "name": "defect_qty",
        "name_cn": "不良数",
        "type": "EXPR",
        "desc": "不良数",
        "business": "不良数",
        "role": "measure"
      },
      {
        "name": "scrap_qty",
        "name_cn": "报废数",
        "type": "EXPR",
        "desc": "报废数",
        "business": "报废数",
        "role": "measure"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "EXPR",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      },
      {
        "name": "defect_rate_pct",
        "name_cn": "不良率%",
        "type": "EXPR",
        "desc": "不良率%",
        "business": "不良率%",
        "role": "measure"
      },
      {
        "name": "inspect_count",
        "name_cn": "质检次数",
        "type": "EXPR",
        "desc": "质检次数",
        "business": "质检次数",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "EXPR",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_equipment_oee",
    "name_cn": "设备OEE",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·设备OEE",
    "summary": "ADS·设备OEE",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_equipment_daily",
      "v_equipment_oee"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "equipment_code",
        "name_cn": "设备编码",
        "type": "EXPR",
        "desc": "设备编码",
        "business": "设备编码",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "EXPR",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "attr"
      },
      {
        "name": "oee_pct",
        "name_cn": "OEE%",
        "type": "EXPR",
        "desc": "OEE%",
        "business": "OEE%",
        "role": "measure"
      },
      {
        "name": "availability_pct",
        "name_cn": "可用率%",
        "type": "EXPR",
        "desc": "可用率%",
        "business": "可用率%",
        "role": "measure"
      },
      {
        "name": "performance_pct",
        "name_cn": "性能率%",
        "type": "EXPR",
        "desc": "性能率%",
        "business": "性能率%",
        "role": "measure"
      },
      {
        "name": "quality_pct",
        "name_cn": "质量率%",
        "type": "EXPR",
        "desc": "质量率%",
        "business": "质量率%",
        "role": "measure"
      },
      {
        "name": "downtime_hours",
        "name_cn": "停机小时",
        "type": "EXPR",
        "desc": "停机小时",
        "business": "停机小时",
        "role": "measure"
      },
      {
        "name": "failure_count",
        "name_cn": "故障次数",
        "type": "EXPR",
        "desc": "故障次数",
        "business": "故障次数",
        "role": "attr"
      },
      {
        "name": "downtime_reason",
        "name_cn": "停机原因",
        "type": "EXPR",
        "desc": "停机原因",
        "business": "停机原因",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_labor_efficiency",
    "name_cn": "人效分析",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·人效分析",
    "summary": "ADS·人效分析",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_labor_monthly",
      "v_labor_efficiency"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_month",
        "name_cn": "年月",
        "type": "EXPR",
        "desc": "年月",
        "business": "年月",
        "role": "attr"
      },
      {
        "name": "factory_code",
        "name_cn": "工厂编码",
        "type": "EXPR",
        "desc": "工厂编码",
        "business": "工厂编码",
        "role": "attr"
      },
      {
        "name": "line_code",
        "name_cn": "产线编码",
        "type": "EXPR",
        "desc": "产线编码",
        "business": "产线编码",
        "role": "attr"
      },
      {
        "name": "plan_hours",
        "name_cn": "计划工时",
        "type": "EXPR",
        "desc": "计划工时",
        "business": "计划工时",
        "role": "measure"
      },
      {
        "name": "actual_hours",
        "name_cn": "实际工时",
        "type": "EXPR",
        "desc": "实际工时",
        "business": "实际工时",
        "role": "measure"
      },
      {
        "name": "hours_achievement_pct",
        "name_cn": "工时达成率%",
        "type": "EXPR",
        "desc": "工时达成率%",
        "business": "工时达成率%",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "EXPR",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "order_count",
        "name_cn": "工单数",
        "type": "EXPR",
        "desc": "工单数",
        "business": "工单数",
        "role": "attr"
      },
      {
        "name": "worker_count",
        "name_cn": "工人数",
        "type": "EXPR",
        "desc": "工人数",
        "business": "工人数",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_manufacturing_finance",
    "name_cn": "制造财务",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·制造财务",
    "summary": "ADS·制造财务",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_cost_monthly",
      "v_manufacturing_finance"
    ],
    "field_count": 10,
    "fields": [
      {
        "name": "snapshot_month",
        "name_cn": "年月",
        "type": "EXPR",
        "desc": "年月",
        "business": "年月",
        "role": "attr"
      },
      {
        "name": "product_code",
        "name_cn": "产品编码",
        "type": "EXPR",
        "desc": "产品编码",
        "business": "产品编码",
        "role": "attr"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "EXPR",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "total_cost",
        "name_cn": "总成本",
        "type": "EXPR",
        "desc": "总成本",
        "business": "总成本",
        "role": "measure"
      },
      {
        "name": "unit_cost",
        "name_cn": "单位成本",
        "type": "EXPR",
        "desc": "单位成本",
        "business": "单位成本",
        "role": "measure"
      },
      {
        "name": "material_cost",
        "name_cn": "材料成本",
        "type": "EXPR",
        "desc": "材料成本",
        "business": "材料成本",
        "role": "measure"
      },
      {
        "name": "labor_cost",
        "name_cn": "人工成本",
        "type": "EXPR",
        "desc": "人工成本",
        "business": "人工成本",
        "role": "measure"
      },
      {
        "name": "overhead_cost",
        "name_cn": "制造费用",
        "type": "EXPR",
        "desc": "制造费用",
        "business": "制造费用",
        "role": "measure"
      },
      {
        "name": "unit_material",
        "name_cn": "单位材料成本",
        "type": "EXPR",
        "desc": "单位材料成本",
        "business": "单位材料成本",
        "role": "attr"
      },
      {
        "name": "unit_labor",
        "name_cn": "单位人工成本",
        "type": "EXPR",
        "desc": "单位人工成本",
        "business": "单位人工成本",
        "role": "attr"
      }
    ]
  },
  {
    "name": "v_material_turnover",
    "name_cn": "物料周转",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·物料周转",
    "summary": "ADS·物料周转",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_material_daily",
      "v_material_turnover"
    ],
    "field_count": 9,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "material_code",
        "name_cn": "物料编码",
        "type": "EXPR",
        "desc": "物料编码",
        "business": "物料编码",
        "role": "attr"
      },
      {
        "name": "material_name",
        "name_cn": "物料名称",
        "type": "EXPR",
        "desc": "物料名称",
        "business": "物料名称",
        "role": "attr"
      },
      {
        "name": "on_hand_qty",
        "name_cn": "现存量",
        "type": "EXPR",
        "desc": "现存量",
        "business": "现存量",
        "role": "measure"
      },
      {
        "name": "daily_usage",
        "name_cn": "日均用量",
        "type": "EXPR",
        "desc": "日均用量",
        "business": "日均用量",
        "role": "attr"
      },
      {
        "name": "turnover_days",
        "name_cn": "周转天数",
        "type": "EXPR",
        "desc": "周转天数",
        "business": "周转天数",
        "role": "attr"
      },
      {
        "name": "max_on_hand",
        "name_cn": "最高库存",
        "type": "EXPR",
        "desc": "最高库存",
        "business": "最高库存",
        "role": "attr"
      },
      {
        "name": "safety_stock",
        "name_cn": "安全库存",
        "type": "EXPR",
        "desc": "安全库存",
        "business": "安全库存",
        "role": "attr"
      },
      {
        "name": "on_hand_amount",
        "name_cn": "库存金额",
        "type": "EXPR",
        "desc": "库存金额",
        "business": "库存金额",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_production_overview",
    "name_cn": "生产总览",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·生产总览",
    "summary": "ADS·生产总览",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_production_daily",
      "v_production_overview"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "output_qty",
        "name_cn": "产出数量",
        "type": "EXPR",
        "desc": "产出数量",
        "business": "产出数量",
        "role": "measure"
      },
      {
        "name": "capacity_util_pct",
        "name_cn": "产能利用率%",
        "type": "EXPR",
        "desc": "产能利用率%",
        "business": "产能利用率%",
        "role": "measure"
      },
      {
        "name": "on_time_delivery_pct",
        "name_cn": "准时交付率%",
        "type": "EXPR",
        "desc": "准时交付率%",
        "business": "准时交付率%",
        "role": "measure"
      },
      {
        "name": "plan_qty",
        "name_cn": "计划产量",
        "type": "EXPR",
        "desc": "计划产量",
        "business": "计划产量",
        "role": "measure"
      },
      {
        "name": "labor_hours",
        "name_cn": "工时",
        "type": "EXPR",
        "desc": "工时",
        "business": "工时",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_quality_analysis",
    "name_cn": "质量分析",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·质量分析",
    "summary": "ADS·质量分析",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_quality_daily",
      "v_quality_analysis"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "yield_rate_pct",
        "name_cn": "良品率%",
        "type": "EXPR",
        "desc": "良品率%",
        "business": "良品率%",
        "role": "measure"
      },
      {
        "name": "defect_rate_pct",
        "name_cn": "不良率%",
        "type": "EXPR",
        "desc": "不良率%",
        "business": "不良率%",
        "role": "measure"
      },
      {
        "name": "scrap_rate_pct",
        "name_cn": "报废率%",
        "type": "EXPR",
        "desc": "报废率%",
        "business": "报废率%",
        "role": "measure"
      },
      {
        "name": "first_pass_pct",
        "name_cn": "一次通过率%",
        "type": "EXPR",
        "desc": "一次通过率%",
        "business": "一次通过率%",
        "role": "measure"
      },
      {
        "name": "total_qty",
        "name_cn": "检验总数",
        "type": "EXPR",
        "desc": "检验总数",
        "business": "检验总数",
        "role": "measure"
      }
    ]
  },
  {
    "name": "v_supply_chain",
    "name_cn": "供应链",
    "layer": "ADS",
    "type": "view",
    "purpose": "ADS·供应链",
    "summary": "ADS·供应链",
    "source": "manufacturing_analytics/database",
    "downstream": [
      "Web看板"
    ],
    "lineage": [
      "dws_supply_daily",
      "v_supply_chain"
    ],
    "field_count": 6,
    "fields": [
      {
        "name": "snapshot_date",
        "name_cn": "快照日",
        "type": "EXPR",
        "desc": "快照日",
        "business": "快照日",
        "role": "attr"
      },
      {
        "name": "purchase_amount",
        "name_cn": "采购金额",
        "type": "EXPR",
        "desc": "采购金额",
        "business": "采购金额",
        "role": "measure"
      },
      {
        "name": "inventory_turnover_days",
        "name_cn": "库存周转天数",
        "type": "EXPR",
        "desc": "库存周转天数",
        "business": "库存周转天数",
        "role": "attr"
      },
      {
        "name": "supplier_otd_pct",
        "name_cn": "供应商OTD%",
        "type": "EXPR",
        "desc": "供应商OTD%",
        "business": "供应商OTD%",
        "role": "measure"
      },
      {
        "name": "supplier_rows",
        "name_cn": "supplier_rows",
        "type": "EXPR",
        "desc": "supplier_rows",
        "business": "supplier_rows",
        "role": "attr"
      },
      {
        "name": "on_hand_amount_proxy",
        "name_cn": "on_hand_amount_proxy",
        "type": "EXPR",
        "desc": "on_hand_amount_proxy",
        "business": "on_hand_amount_proxy",
        "role": "measure"
      }
    ]
  }
];
window.WAREHOUSE_FIELD_OVERVIEW=[
  {
    "layer": "ODS",
    "table_name": "ods_equipment",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_inventory_material",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_labor",
    "field_count": 13,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_material",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_production_line",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_production_order",
    "field_count": 15,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_quality_inspection",
    "field_count": 15,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ODS",
    "table_name": "ods_supplier",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_date",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_defect_type",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_equipment",
    "field_count": 14,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_factory",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_material",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_product",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_production_line",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DIM",
    "table_name": "dim_supplier",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_equipment_run",
    "field_count": 19,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_labor_wide",
    "field_count": 14,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_production_wide",
    "field_count": 21,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_quality_wide",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "dwd_supply_wide",
    "field_count": 17,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_equipment_run",
    "field_count": 19,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_labor",
    "field_count": 14,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_material_consumption",
    "field_count": 14,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_process_operation",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_production",
    "field_count": 21,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_quality",
    "field_count": 18,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWD",
    "table_name": "fact_supply",
    "field_count": 17,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_cost_monthly",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_defect_daily",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_equipment_daily",
    "field_count": 11,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_labor_monthly",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_material_daily",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_production_daily",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_quality_daily",
    "field_count": 12,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "DWS",
    "table_name": "dws_supply_daily",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_capacity_utilization",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_cmei_daily",
    "field_count": 5,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_cost_analysis",
    "field_count": 7,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_defect_analysis",
    "field_count": 8,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_equipment_oee",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_labor_efficiency",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_manufacturing_finance",
    "field_count": 10,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_material_turnover",
    "field_count": 9,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_production_overview",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_quality_analysis",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  },
  {
    "layer": "ADS",
    "table_name": "v_supply_chain",
    "field_count": 6,
    "target_range": "8-25",
    "quality_status": "达标"
  }
];
