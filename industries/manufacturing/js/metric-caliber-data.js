/**
 * 指标口径字典 · 自动生成
 * 来源：industries/manufacturing/docs/04_指标口径字典.md
 * 数量：39 个指标
 * 生成：portfolio/scripts/export_metric_caliber.py
 */
window.METRIC_CALIBER = {
  "cmei_综合制造效能指数": {
    "label": "CMEI 综合制造效能指数",
    "category": "二、质量指标",
    "subcategory": "2.2 质量分析指标",
    "business": "FPY×40%+OEE×35%+OTD×25%",
    "technical": "加权合成",
    "source_table": "`v_cmei_daily`（已落地最小视图）",
    "exclude_rules": "",
    "refresh": "日"
  },
  "当日产量": {
    "label": "当日产量",
    "category": "一、生产运营指标",
    "subcategory": "1.1 产出与效率指标",
    "business": "当日实际产出的合格产品数量",
    "technical": "SUM(actual_qty) WHERE 生产日期=当日",
    "source_table": "dwd_production_fact",
    "exclude_rules": "排除试生产、报废品",
    "refresh": "小时/日"
  },
  "计划产量": {
    "label": "计划产量",
    "category": "一、生产运营指标",
    "subcategory": "1.1 产出与效率指标",
    "business": "当日计划产出的产品数量",
    "technical": "SUM(plan_qty) WHERE 生产日期=当日",
    "source_table": "dwd_production_fact",
    "exclude_rules": "排除已取消工单",
    "refresh": "日"
  },
  "计划达成率": {
    "label": "计划达成率",
    "category": "一、生产运营指标",
    "subcategory": "1.1 产出与效率指标",
    "business": "实际产量 / 计划产量 × 100%",
    "technical": "实际产量 / NULLIF(计划产量, 0) × 100",
    "source_table": "dws_production_daily",
    "exclude_rules": "计划为0返回NULL",
    "refresh": "日"
  },
  "工单完成率": {
    "label": "工单完成率",
    "category": "一、生产运营指标",
    "subcategory": "1.1 产出与效率指标",
    "business": "已完工工单 / 总开工工单 × 100%",
    "technical": "完工工单数 / NULLIF(开工工单数, 0) × 100",
    "source_table": "dws_order_daily",
    "exclude_rules": "排除取消工单",
    "refresh": "日"
  },
  "wip_在制品数量": {
    "label": "WIP 在制品数量",
    "category": "一、生产运营指标",
    "subcategory": "1.1 产出与效率指标",
    "business": "生产线上正在加工的在制品数量",
    "technical": "SUM(在制数量) WHERE 工单状态=生产中",
    "source_table": "dwd_production_fact",
    "exclude_rules": "-",
    "refresh": "实时/小时"
  },
  "otd_准时交付率": {
    "label": "OTD 准时交付率",
    "category": "一、生产运营指标",
    "subcategory": "1.2 交付与节拍指标",
    "business": "按承诺时间交付的订单占比",
    "technical": "准时交付工单数 / 应交付总工单数 × 100",
    "source_table": "dws_delivery_daily",
    "exclude_rules": "排除客户延期的订单",
    "refresh": "日/周"
  },
  "生产节拍": {
    "label": "生产节拍",
    "category": "一、生产运营指标",
    "subcategory": "1.2 交付与节拍指标",
    "business": "平均产出一件产品的时间",
    "technical": "当班生产时长 / 当班产量",
    "source_table": "dws_production_shift",
    "exclude_rules": "排除停机时间",
    "refresh": "班/日"
  },
  "标准工时达成率": {
    "label": "标准工时达成率",
    "category": "一、生产运营指标",
    "subcategory": "1.2 交付与节拍指标",
    "business": "标准工时 / 实际工时 × 100%",
    "technical": "SUM(标准工时) / NULLIF(SUM(实际工时), 0) × 100",
    "source_table": "dws_operation_daily",
    "exclude_rules": "排除异常返工工时",
    "refresh": "日"
  },
  "人均产出": {
    "label": "人均产出",
    "category": "一、生产运营指标",
    "subcategory": "1.2 交付与节拍指标",
    "business": "平均每个工人每班产量",
    "technical": "总产量 / 平均出勤人数",
    "source_table": "dws_labor_daily",
    "exclude_rules": "排除管理人员、辅助人员",
    "refresh": "班/日"
  },
  "工单周期": {
    "label": "工单周期",
    "category": "一、生产运营指标",
    "subcategory": "1.2 交付与节拍指标",
    "business": "工单从开工到完工的平均时长",
    "technical": "AVG(完工时间 - 开工时间)",
    "source_table": "dwd_production_fact",
    "exclude_rules": "取消/暂停工单",
    "refresh": "日"
  },
  "fpy_一次合格率": {
    "label": "FPY 一次合格率",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "第一次就合格的产品占比（不包含返工后合格）",
    "technical": "一次合格数 / 总检验数 × 100",
    "source_table": "dwd_quality_fact",
    "exclude_rules": "返工后合格不算FPY",
    "refresh": "小时/日"
  },
  "最终合格率": {
    "label": "最终合格率",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "最终合格产品占比（含返工后合格）",
    "technical": "最终合格数 / 总投入数 × 100",
    "source_table": "dwd_quality_fact",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "不良率": {
    "label": "不良率",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "不良品占总检验数的比例",
    "technical": "不良数 / 总检验数 × 100",
    "source_table": "dwd_quality_fact",
    "exclude_rules": "-",
    "refresh": "小时/日"
  },
  "返工率": {
    "label": "返工率",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "需要返工的产品占比",
    "technical": "返工数 / 总检验数 × 100",
    "source_table": "dwd_quality_fact",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "报废率": {
    "label": "报废率",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "直接报废的产品占比",
    "technical": "报废数 / 总投入数 × 100",
    "source_table": "dwd_quality_fact",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "质量损失成本": {
    "label": "质量损失成本",
    "category": "二、质量指标",
    "subcategory": "2.1 良率与不良指标",
    "business": "不良、返工、报废造成的损失金额",
    "technical": "返工成本 + 报废成本 + 质量索赔",
    "source_table": "dws_quality_cost",
    "exclude_rules": "-",
    "refresh": "日/月"
  },
  "柏拉图top3不良": {
    "label": "柏拉图TOP3不良",
    "category": "二、质量指标",
    "subcategory": "2.2 质量分析指标",
    "business": "占80%不良的前3种不良类型",
    "technical": "按不良数量降序，累计占比80%的前N类",
    "source_table": "dws_defect_daily",
    "exclude_rules": "",
    "refresh": "日/周"
  },
  "spc_cpk_过程能力指数": {
    "label": "SPC CPK 过程能力指数",
    "category": "二、质量指标",
    "subcategory": "2.2 质量分析指标",
    "business": "生产过程的稳定性能力",
    "technical": "(规格上限 - 规格下限) / (6×标准差)",
    "source_table": "dws_spc_analysis（规划中，未建表）",
    "exclude_rules": "",
    "refresh": "班/日"
  },
  "客诉率": {
    "label": "客诉率",
    "category": "二、质量指标",
    "subcategory": "2.2 质量分析指标",
    "business": "客户投诉订单占总交付订单比例",
    "technical": "客诉工单数 / 总交付工单数 × 10000 PPM",
    "source_table": "dws_customer_quality",
    "exclude_rules": "",
    "refresh": "月"
  },
  "来料合格率": {
    "label": "来料合格率",
    "category": "四、供应链与物料指标",
    "subcategory": "4.2 采购与交付指标",
    "business": "来料检验合格的批次占比",
    "technical": "合格批次 / 总检验批次 × 100",
    "source_table": "dws_incoming_quality",
    "exclude_rules": "",
    "refresh": "日/周"
  },
  "oee_设备综合效率": {
    "label": "OEE 设备综合效率",
    "category": "三、设备OEE指标",
    "subcategory": "3.1 OEE核心指标",
    "business": "可用率 × 性能率 × 质量率",
    "technical": "availability * performance * quality",
    "source_table": "dws_oee_daily",
    "exclude_rules": "",
    "refresh": "小时/班/日"
  },
  "可用率_availability": {
    "label": "可用率 Availability",
    "category": "三、设备OEE指标",
    "subcategory": "3.1 OEE核心指标",
    "business": "设备实际运行时间 / 计划生产时间",
    "technical": "运行时间 / NULLIF(计划时间, 0) × 100",
    "source_table": "dws_device_daily",
    "exclude_rules": "",
    "refresh": "班/日"
  },
  "性能率_performance": {
    "label": "性能率 Performance",
    "category": "三、设备OEE指标",
    "subcategory": "3.1 OEE核心指标",
    "business": "实际产出 / 理论产出 × 100%",
    "technical": "实际产量 / (运行时间 × 标准节拍) × 100",
    "source_table": "dws_oee_daily",
    "exclude_rules": "",
    "refresh": "班/日"
  },
  "质量率_quality": {
    "label": "质量率 Quality",
    "category": "三、设备OEE指标",
    "subcategory": "3.1 OEE核心指标",
    "business": "合格产品 / 总产品 × 100%",
    "technical": "合格数 / NULLIF(总产量, 0) × 100",
    "source_table": "dws_oee_daily",
    "exclude_rules": "",
    "refresh": "班/日"
  },
  "mtbf_平均故障间隔": {
    "label": "MTBF 平均故障间隔",
    "category": "三、设备OEE指标",
    "subcategory": "3.2 设备可靠性指标",
    "business": "两次故障之间的平均运行时间",
    "technical": "总运行时间 / 故障次数",
    "source_table": "dws_device_failure",
    "exclude_rules": "",
    "refresh": "周/月"
  },
  "mttr_平均修复时间": {
    "label": "MTTR 平均修复时间",
    "category": "三、设备OEE指标",
    "subcategory": "3.2 设备可靠性指标",
    "business": "故障后平均修复恢复时间",
    "technical": "总修复时长 / 故障次数",
    "source_table": "dws_device_failure",
    "exclude_rules": "",
    "refresh": "周/月"
  },
  "设备利用率": {
    "label": "设备利用率",
    "category": "三、设备OEE指标",
    "subcategory": "3.2 设备可靠性指标",
    "business": "设备实际运行时间 / 总日历时间",
    "technical": "运行时间 / 24小时 × 100",
    "source_table": "dws_device_daily",
    "exclude_rules": "",
    "refresh": "日"
  },
  "停机时长": {
    "label": "停机时长",
    "category": "三、设备OEE指标",
    "subcategory": "3.2 设备可靠性指标",
    "business": "当日设备累计停机时间",
    "technical": "SUM(停机时长)",
    "source_table": "dwd_device_fact",
    "exclude_rules": "",
    "refresh": "小时/日"
  },
  "故障停机占比": {
    "label": "故障停机占比",
    "category": "三、设备OEE指标",
    "subcategory": "3.2 设备可靠性指标",
    "business": "故障停机时间 / 总停机时间 × 100%",
    "technical": "故障停机时长 / NULLIF(总停机时长, 0) × 100",
    "source_table": "dws_oee_daily",
    "exclude_rules": "",
    "refresh": "日"
  },
  "inventory_value": {
    "label": "库存金额",
    "category": "四、供应链与物料指标",
    "subcategory": "4.1 库存与周转指标",
    "business": "期末原材料+在制品+成品库存总金额",
    "technical": "SUM(库存数量 × 单位成本)",
    "source_table": "dws_inventory_daily",
    "exclude_rules": "排除寄售库存",
    "refresh": "日"
  },
  "inventory_turnover_days": {
    "label": "库存周转天数",
    "category": "四、供应链与物料指标",
    "subcategory": "4.1 库存与周转指标",
    "business": "库存平均多少天周转一次",
    "technical": "平均库存金额 / 当期销售成本 × 天数",
    "source_table": "dws_inventory_monthly",
    "exclude_rules": "销售成本为0返回NULL",
    "refresh": "月"
  },
  "原材料周转天数": {
    "label": "原材料周转天数",
    "category": "四、供应链与物料指标",
    "subcategory": "4.1 库存与周转指标",
    "business": "原材料库存周转天数",
    "technical": "平均原材料库存 / 当期材料耗用 × 天数",
    "source_table": "dws_material_monthly",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "成品周转天数": {
    "label": "成品周转天数",
    "category": "四、供应链与物料指标",
    "subcategory": "4.1 库存与周转指标",
    "business": "成品库存周转天数",
    "technical": "平均成品库存 / 当期销售成本 × 天数",
    "source_table": "dws_finished_goods",
    "exclude_rules": "-",
    "refresh": "月"
  },
  "库存准确率": {
    "label": "库存准确率",
    "category": "四、供应链与物料指标",
    "subcategory": "4.1 库存与周转指标",
    "business": "账实一致的SKU占比",
    "technical": "盘点一致SKU数 / 总盘点SKU数 × 100",
    "source_table": "dws_stocktake",
    "exclude_rules": "盘点后统计",
    "refresh": "月/季"
  },
  "到货准时率": {
    "label": "到货准时率",
    "category": "四、供应链与物料指标",
    "subcategory": "4.2 采购与交付指标",
    "business": "供应商按约定时间到货的批次占比",
    "technical": "准时到货批次 / 总到货批次 × 100",
    "source_table": "dws_purchase_daily",
    "exclude_rules": "",
    "refresh": "日/周"
  },
  "供应商准交率": {
    "label": "供应商准交率",
    "category": "四、供应链与物料指标",
    "subcategory": "4.2 采购与交付指标",
    "business": "各供应商的准时交付率",
    "technical": "准时交付数 / 应交付总数 × 100",
    "source_table": "dws_supplier_score",
    "exclude_rules": "",
    "refresh": "月"
  },
  "缺料停线时长": {
    "label": "缺料停线时长",
    "category": "四、供应链与物料指标",
    "subcategory": "4.2 采购与交付指标",
    "business": "因缺料导致的生产线停机时间",
    "technical": "SUM(停机时长) WHERE 停机原因='缺料'",
    "source_table": "dws_device_fact",
    "exclude_rules": "",
    "refresh": "日/周"
  },
  "bom准确率": {
    "label": "BOM准确率",
    "category": "四、供应链与物料指标",
    "subcategory": "4.2 采购与交付指标",
    "business": "物料清单准确率",
    "technical": "正确BOM行数 / 总BOM行数 × 100",
    "source_table": "dim_bom",
    "exclude_rules": "",
    "refresh": "季度"
  }
};
