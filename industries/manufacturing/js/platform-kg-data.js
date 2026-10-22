/** 平台知识图谱数据 · 自动生成 gen_platform_kg_data.py */
window.PLATFORM_KG_DATA = {
  "meta": {
    "industry": "manufacturing",
    "industryName": "制造业",
    "title": "制造业 · 平台知识图谱",
    "modules": [
      "dashboard",
      "methodology",
      "warehouse",
      "metric"
    ],
    "density": {
      "focusMaxVisible": 35,
      "l2PerTypeDefault": 4,
      "l3PerTypeDefault": 3,
      "l3MaxTotal": 15
    },
    "counts": {
      "nodes": 169,
      "edges": 248,
      "leaves": 149,
      "dashboards": 14,
      "playbooks": 50,
      "metrics": 39,
      "warehouseTables": 46
    }
  },
  "nodes": [
    {
      "id": "root_dashboard",
      "name": "看板",
      "type": "dashboard",
      "category": "manufacturing",
      "categoryName": "制造业",
      "description": "制造业 · 看板",
      "isRoot": true,
      "icon": "📊",
      "childrenIds": [
        "cat_dashboard_all"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "制造业平台「看板」模块入口"
      }
    },
    {
      "id": "root_methodology",
      "name": "分析方法",
      "type": "methodology",
      "category": "manufacturing",
      "categoryName": "制造业",
      "description": "制造业 · 分析方法",
      "isRoot": true,
      "icon": "📐",
      "childrenIds": [
        "cat_method_l1",
        "cat_method_l2",
        "cat_method_l3",
        "cat_method_l4",
        "cat_method_l5",
        "cat_method_l6"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "制造业平台「分析方法」模块入口"
      }
    },
    {
      "id": "root_warehouse",
      "name": "五层数仓",
      "type": "warehouse",
      "category": "manufacturing",
      "categoryName": "制造业",
      "description": "制造业 · 五层数仓",
      "isRoot": true,
      "icon": "🗄️",
      "childrenIds": [
        "cat_wh_ods",
        "cat_wh_dim",
        "cat_wh_dwd",
        "cat_wh_dws",
        "cat_wh_ads"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "制造业平台「五层数仓」模块入口"
      }
    },
    {
      "id": "root_metric",
      "name": "指标",
      "type": "metric",
      "category": "manufacturing",
      "categoryName": "制造业",
      "description": "制造业 · 指标",
      "isRoot": true,
      "icon": "📈",
      "childrenIds": [
        "cat_metric_质量指标",
        "cat_metric_生产运营指标",
        "cat_metric_供应链与物料指标",
        "cat_metric_设备OEE指标"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "制造业平台「指标」模块入口"
      }
    },
    {
      "id": "cat_dashboard_all",
      "name": "主题看板",
      "type": "dashboard",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_dashboard",
      "childrenIds": [
        "dash:production",
        "dash:delivery",
        "dash:quality",
        "dash:scrap-rework",
        "dash:process-yield",
        "dash:equipment",
        "dash:downtime",
        "dash:capacity",
        "dash:cost",
        "dash:supply",
        "dash:supplier-score",
        "dash:material",
        "dash:bom-variance",
        "dash:labor"
      ],
      "detail": {
        "definition": "数据展示主题看板"
      },
      "crossRefs": []
    },
    {
      "id": "dash:production",
      "name": "生产总览",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "产量 · 产能利用率 · 产线明细",
      "href": "../manufacturing_dashboard.html#production",
      "detail": {
        "definition": "产量 · 产能利用率 · 产线明细",
        "notes": "API: /api/dashboard_production"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q01",
        "pb:q06",
        "pb:q22",
        "pb:q27",
        "pb:q39",
        "pb:q42",
        "pb:q46",
        "pb:q49",
        "metric:生产节拍"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:delivery",
      "name": "交付分析",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "准时交付率OTD · 计划达成 · 逾期工单 · 在制品WIP",
      "href": "../manufacturing_dashboard.html#delivery",
      "detail": {
        "definition": "准时交付率OTD · 计划达成 · 逾期工单 · 在制品WIP",
        "notes": "API: /api/dashboard_delivery"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q12",
        "pb:q23",
        "pb:q31",
        "pb:q45",
        "pb:q47"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:quality",
      "name": "质量分析",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "良品率 · FPY · 缺陷帕累托 · 产线质量明细",
      "href": "../manufacturing_dashboard.html#quality",
      "detail": {
        "definition": "良品率 · FPY · 缺陷帕累托 · 产线质量明细",
        "notes": "API: /api/dashboard_quality"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q03",
        "pb:q11",
        "pb:q17",
        "pb:q26",
        "pb:q29",
        "pb:q35",
        "pb:q43",
        "metric:质量损失成本",
        "metric:质量率_quality"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:scrap-rework",
      "name": "报废与返工",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "报废率 · 返工率 · 缺陷类型 · 产线报废",
      "href": "../manufacturing_dashboard.html#scrap-rework",
      "detail": {
        "definition": "报废率 · 返工率 · 缺陷类型 · 产线报废",
        "notes": "API: /api/dashboard_scrap_rework"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q11",
        "pb:q21",
        "pb:q26",
        "metric:返工率",
        "metric:报废率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:process-yield",
      "name": "工序良率",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "工序良率 · 产线工序对比",
      "href": "../manufacturing_dashboard.html#process-yield",
      "detail": {
        "definition": "工序良率 · 产线工序对比",
        "notes": "API: /api/dashboard_process_yield"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q21",
        "pb:q29",
        "pb:q43"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:equipment",
      "name": "设备OEE",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "OEE · 停机原因 · 设备明细",
      "href": "../manufacturing_dashboard.html#equipment",
      "detail": {
        "definition": "OEE · 停机原因 · 设备明细",
        "notes": "API: /api/dashboard_equipment"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q05",
        "pb:q07",
        "pb:q16",
        "pb:q19",
        "pb:q33",
        "pb:q36",
        "pb:q48",
        "metric:oee_设备综合效率",
        "metric:设备利用率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:downtime",
      "name": "停机损失",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "停机时长 · 原因分布 · 设备停机排名",
      "href": "../manufacturing_dashboard.html#downtime",
      "detail": {
        "definition": "停机时长 · 原因分布 · 设备停机排名",
        "notes": "API: /api/dashboard_downtime"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q13",
        "pb:q16",
        "pb:q19",
        "pb:q38",
        "metric:停机时长"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:capacity",
      "name": "产能负荷",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "产能利用率 · 设计产能负荷 · 产线对比",
      "href": "../manufacturing_dashboard.html#capacity",
      "detail": {
        "definition": "产能利用率 · 设计产能负荷 · 产线对比",
        "notes": "API: /api/dashboard_capacity"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:cost",
      "name": "成本分析",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "总成本 · 单位成本 · 结构 · 产品成本明细",
      "href": "../manufacturing_dashboard.html#cost",
      "detail": {
        "definition": "总成本 · 单位成本 · 结构 · 产品成本明细",
        "notes": "API: /api/dashboard_cost"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q04",
        "pb:q17",
        "pb:q20",
        "pb:q28",
        "pb:q34",
        "pb:q41",
        "pb:q44"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:supply",
      "name": "供应链分析",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "采购 · 库存 · 供应商准时率 · 供应商明细",
      "href": "../manufacturing_dashboard.html#supply",
      "detail": {
        "definition": "采购 · 库存 · 供应商准时率 · 供应商明细",
        "notes": "API: /api/dashboard_supply"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q08",
        "pb:q14",
        "pb:q18",
        "pb:q25",
        "pb:q40",
        "pb:q50",
        "metric:供应商准交率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:supplier-score",
      "name": "供应商评分",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "OTD加权评分 · 采购额 · 预警分级",
      "href": "../manufacturing_dashboard.html#supplier-score",
      "detail": {
        "definition": "OTD加权评分 · 采购额 · 预警分级",
        "notes": "API: /api/dashboard_supplier_score"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q18",
        "metric:供应商准交率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:material",
      "name": "物料周转",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "周转天数 · 呆滞物料 · 领料Top",
      "href": "../manufacturing_dashboard.html#material",
      "detail": {
        "definition": "周转天数 · 呆滞物料 · 领料Top",
        "notes": "API: /api/dashboard_material"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:bom-variance",
      "name": "领料差异",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "BOM应领vs实领 · 超领金额 · 产线差异",
      "href": "../manufacturing_dashboard.html#bom-variance",
      "detail": {
        "definition": "BOM应领vs实领 · 超领金额 · 产线差异",
        "notes": "API: /api/dashboard_bom_variance"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q15",
        "pb:q20",
        "pb:q28",
        "pb:q37"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:labor",
      "name": "人工效率",
      "type": "dashboard",
      "category": "manufacturing",
      "parentId": "cat_dashboard_all",
      "description": "工时达成 · 人工成本 · 分产线明细",
      "href": "../manufacturing_dashboard.html#labor",
      "detail": {
        "definition": "工时达成 · 人工成本 · 分产线明细",
        "notes": "API: /api/dashboard_labor"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q24",
        "pb:q27",
        "pb:q34",
        "pb:q42",
        "pb:q46",
        "pb:q49"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_method_l1",
      "name": "L1 描述",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q01",
        "pb:q02",
        "pb:q11",
        "pb:q12",
        "pb:q19",
        "pb:q20",
        "pb:q27",
        "pb:q28",
        "pb:q29",
        "pb:q30",
        "pb:q31",
        "pb:q32"
      ],
      "detail": {
        "definition": "L1 描述"
      },
      "crossRefs": []
    },
    {
      "id": "cat_method_l2",
      "name": "L2 诊断",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q03",
        "pb:q04",
        "pb:q05",
        "pb:q13",
        "pb:q14",
        "pb:q21",
        "pb:q22",
        "pb:q33",
        "pb:q34",
        "pb:q35",
        "pb:q36",
        "pb:q37",
        "pb:q38",
        "pb:q39"
      ],
      "detail": {
        "definition": "L2 诊断"
      },
      "crossRefs": []
    },
    {
      "id": "cat_method_l3",
      "name": "L3 归因/预测",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q06",
        "pb:q15",
        "pb:q16",
        "pb:q23",
        "pb:q40",
        "pb:q41",
        "pb:q42",
        "pb:q43"
      ],
      "detail": {
        "definition": "L3 归因/预测"
      },
      "crossRefs": []
    },
    {
      "id": "cat_method_l4",
      "name": "L4 评估",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q07",
        "pb:q08",
        "pb:q17",
        "pb:q24",
        "pb:q44",
        "pb:q45",
        "pb:q46"
      ],
      "detail": {
        "definition": "L4 评估"
      },
      "crossRefs": []
    },
    {
      "id": "cat_method_l5",
      "name": "L5 决策",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q09",
        "pb:q10",
        "pb:q18",
        "pb:q25",
        "pb:q26",
        "pb:q47",
        "pb:q48",
        "pb:q49",
        "pb:q50"
      ],
      "detail": {
        "definition": "L5 决策"
      },
      "crossRefs": []
    },
    {
      "id": "cat_method_l6",
      "name": "L6 工具箱",
      "type": "methodology",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [],
      "detail": {
        "definition": "L6 工具箱"
      },
      "crossRefs": []
    },
    {
      "id": "pb:q01",
      "name": "生产总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "生产总览看五类指标：产量（规模）、产能利用率（效率）、良品率（质量）、OTIF（交付）、单位成本（成本）。五类分别回答\"做了多少、效率如何、质量如何、交付稳不稳、成本高不高\"。",
      "href": "methodology.html#q01",
      "detail": {
        "definition": "本月生产运营怎么样？",
        "notes": "生产总览看五类指标：产量（规模）、产能利用率（效率）、良品率（质量）、OTIF（交付）、单位成本（成本）。五类分别回答\"做了多少、效率如何、质量如何、交付稳不稳、成本高不高\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "产量",
        "产能",
        "交付",
        "总览",
        "生产总览",
        "生产概况类"
      ],
      "crossRefs": [
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q02",
      "name": "产线/工厂绩效排名",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "产线排名看四类：产量（规模）、产能利用率（效率）、良品率（质量）、单位成本（成本效率）。四类分别回答\"哪条产线大、哪条产线忙、哪条产线好、哪条产线省\"。",
      "href": "methodology.html#q02",
      "detail": {
        "definition": "哪条产线表现最好？哪条拖后腿？",
        "notes": "产线排名看四类：产量（规模）、产能利用率（效率）、良品率（质量）、单位成本（成本效率）。四类分别回答\"哪条产线大、哪条产线忙、哪条产线好、哪条产线省\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "产线",
        "工厂",
        "排名",
        "工厂绩效排名",
        "绩效排名类"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q03",
      "name": "良品率下降诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "良品率下降可分解为：",
      "href": "methodology.html#q03",
      "detail": {
        "definition": "为什么良品率下降了？",
        "notes": "良品率下降可分解为：",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "良品率",
        "不良",
        "根因",
        "良品率下降诊断",
        "质量异常类"
      ],
      "crossRefs": [
        "dash:quality"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q04",
      "name": "单位成本上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "单位成本变化 = 材料成本效应 + 人工成本效应 + 制造费用效应 + 产量规模效应",
      "href": "methodology.html#q04",
      "detail": {
        "definition": "为什么单位成本涨了？",
        "notes": "单位成本变化 = 材料成本效应 + 人工成本效应 + 制造费用效应 + 产量规模效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "单位成本",
        "材料",
        "人工",
        "单位成本上升诊断",
        "成本异常类"
      ],
      "crossRefs": [
        "dash:cost"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q05",
      "name": "设备故障率上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "设备故障率上升 = 设备老化效应 + 维护不足效应 + 操作不当效应 + 备件质量效应",
      "href": "methodology.html#q05",
      "detail": {
        "definition": "为什么设备老出问题？",
        "notes": "设备故障率上升 = 设备老化效应 + 维护不足效应 + 操作不当效应 + 备件质量效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "OEE",
        "故障",
        "停机",
        "设备故障率上升诊断",
        "设备异常类"
      ],
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q06",
      "name": "下月产量预测",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "下月产量预测 = 基线预测（MA3）× 季节因子 + 订单修正",
      "href": "methodology.html#q06",
      "detail": {
        "definition": "下月能产多少？",
        "notes": "下月产量预测 = 基线预测（MA3）× 季节因子 + 订单修正",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "预测",
        "产量",
        "下月产量预测",
        "产量预测类"
      ],
      "crossRefs": [
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q07",
      "name": "设备OEE评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "OEE 评估 = 可用率 × 性能率 × 良品率",
      "href": "methodology.html#q07",
      "detail": {
        "definition": "哪些设备最该优先改善？",
        "notes": "OEE 评估 = 可用率 × 性能率 × 良品率",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "OEE",
        "评估",
        "设备OEE评估",
        "OEE评估类"
      ],
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q08",
      "name": "供应商绩效评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "供应商评估 = 交付准时率 + 质量退货率 + 价格竞争力 + 响应速度（综合评分）",
      "href": "methodology.html#q08",
      "detail": {
        "definition": "哪家供应商最可靠？",
        "notes": "供应商评估 = 交付准时率 + 质量退货率 + 价格竞争力 + 响应速度（综合评分）",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "供应商",
        "准时率",
        "评分卡",
        "供应商绩效评估",
        "供应商评估类"
      ],
      "crossRefs": [
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q09",
      "name": "质量改善优先级优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最大化不良减少量（或最大化质量改善收益）。",
      "href": "methodology.html#q09",
      "detail": {
        "definition": "先改哪个不良？",
        "notes": "目标函数：最大化不良减少量（或最大化质量改善收益）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "柏拉图",
        "改善",
        "优先级",
        "质量改善优先级优化",
        "质量改善类"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q10",
      "name": "生产计划优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最大化产能利用率（或最大化产出）。",
      "href": "methodology.html#q10",
      "detail": {
        "definition": "如何提升产能利用率？",
        "notes": "目标函数：最大化产能利用率（或最大化产出）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "排产",
        "换型",
        "瓶颈",
        "生产计划优化",
        "计划优化类"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q11",
      "name": "质量总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "质量总览看四类：良品率（最终质量）、FPY（一次通过率，过程质量）、报废率（损失）、返工率（隐性成本）。四类分别回答\"最终好不好、一次能不能过、废了多少、返工多少\"。",
      "href": "methodology.html#q11",
      "detail": {
        "definition": "本月质量状况怎么样？",
        "notes": "质量总览看四类：良品率（最终质量）、FPY（一次通过率，过程质量）、报废率（损失）、返工率（隐性成本）。四类分别回答\"最终好不好、一次能不能过、废了多少、返工多少\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "良品率",
        "FPY",
        "报废",
        "质量总览",
        "质量概况类"
      ],
      "crossRefs": [
        "metric:返工率",
        "metric:报废率",
        "dash:quality",
        "dash:scrap-rework"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q12",
      "name": "交付准时率总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "交付总览看四类：OTIF（准时足量）、OTD（准时交付）、欠交（未完成）、提前完工（是否过早占用产能）。四类分别回答\"准时足量率、准时率、欠多少、是否过度提前\"。",
      "href": "methodology.html#q12",
      "detail": {
        "definition": "客户订单交付稳不稳？",
        "notes": "交付总览看四类：OTIF（准时足量）、OTD（准时交付）、欠交（未完成）、提前完工（是否过早占用产能）。四类分别回答\"准时足量率、准时率、欠多少、是否过度提前\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "交付",
        "OTIF",
        "准时率",
        "欠交",
        "交付准时率总览",
        "生产概况类"
      ],
      "crossRefs": [
        "dash:delivery"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q13",
      "name": "产能不足诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "产能不足 = 订单超载 + 产能损失 + 瓶颈工序 + 换型损失",
      "href": "methodology.html#q13",
      "detail": {
        "definition": "为什么产能跟不上订单？",
        "notes": "产能不足 = 订单超载 + 产能损失 + 瓶颈工序 + 换型损失",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "产能",
        "瓶颈",
        "利用率",
        "换型",
        "产能不足诊断",
        "产能异常类"
      ],
      "crossRefs": [
        "dash:downtime"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q14",
      "name": "交期延误诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "交期延误 = 供应商延误 + 物料齐套延误 + 产能不足延误 + 计划变更延误",
      "href": "methodology.html#q14",
      "detail": {
        "definition": "为什么交期延误变多了？",
        "notes": "交期延误 = 供应商延误 + 物料齐套延误 + 产能不足延误 + 计划变更延误",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "交期",
        "齐套",
        "供应商",
        "停待",
        "交期延误诊断",
        "供应链异常类"
      ],
      "crossRefs": [
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q15",
      "name": "物料需求预测",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "物料净需求 = 理论需求 ×（1 + 损耗率） + 安全库存 - 当前库存 - 在途",
      "href": "methodology.html#q15",
      "detail": {
        "definition": "下月关键物料要备多少？",
        "notes": "物料净需求 = 理论需求 ×（1 + 损耗率） + 安全库存 - 当前库存 - 在途",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "物料",
        "BOM",
        "安全库存",
        "MRP",
        "物料需求预测",
        "物料需求类"
      ],
      "crossRefs": [
        "dash:bom-variance"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q16",
      "name": "设备故障风险预警",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "设备故障风险 = 故障频次趋势 + 停机时长趋势 + 设备年龄",
      "href": "methodology.html#q16",
      "detail": {
        "definition": "哪些设备下月最可能出问题？",
        "notes": "设备故障风险 = 故障频次趋势 + 停机时长趋势 + 设备年龄",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "故障预测",
        "停机",
        "维护",
        "预警",
        "设备故障风险预警",
        "设备故障类"
      ],
      "crossRefs": [
        "metric:停机时长",
        "dash:equipment",
        "dash:downtime"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q17",
      "name": "新品导入（NPI）评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "NPI 评估 = 爬坡良品率 + 单位成本达成 + 产能达成 + 质量稳定性",
      "href": "methodology.html#q17",
      "detail": {
        "definition": "这款新品导入达标了吗？",
        "notes": "NPI 评估 = 爬坡良品率 + 单位成本达成 + 产能达成 + 质量稳定性",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "NPI",
        "新品",
        "爬坡",
        "良品率",
        "新品导入",
        "评估",
        "新品导入类"
      ],
      "crossRefs": [
        "dash:quality",
        "dash:cost"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q18",
      "name": "供应商份额优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最小化供应风险（或最大化供应稳定性）。",
      "href": "methodology.html#q18",
      "detail": {
        "definition": "采购份额怎么调更稳？",
        "notes": "目标函数：最小化供应风险（或最大化供应稳定性）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "份额",
        "双源",
        "评分卡",
        "采购",
        "供应商份额优化",
        "供应商优化类"
      ],
      "crossRefs": [
        "dash:supplier-score",
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q19",
      "name": "设备状态总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "设备总览看四类：OEE（综合效率）、可用率（时间维度）、停机时长（损失）、MTBF（可靠性）。四类分别回答\"综合效率如何、多少时间可用、停了多少、多久坏一次\"。",
      "href": "methodology.html#q19",
      "detail": {
        "definition": "本月设备运行状态怎么样？",
        "notes": "设备总览看四类：OEE（综合效率）、可用率（时间维度）、停机时长（损失）、MTBF（可靠性）。四类分别回答\"综合效率如何、多少时间可用、停了多少、多久坏一次\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "设备",
        "OEE",
        "停机",
        "MTBF",
        "设备状态总览",
        "设备概况类"
      ],
      "crossRefs": [
        "metric:停机时长",
        "dash:equipment",
        "dash:downtime"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q20",
      "name": "制造成本总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "成本总览看四类：单位成本（总水平）、材料成本占比、人工成本占比、制造费用占比。四类分别回答\"总成本高不高、材料贵不贵、人工贵不贵、制费高不高\"。",
      "href": "methodology.html#q20",
      "detail": {
        "definition": "本月制造成本处在什么水平？",
        "notes": "成本总览看四类：单位成本（总水平）、材料成本占比、人工成本占比、制造费用占比。四类分别回答\"总成本高不高、材料贵不贵、人工贵不贵、制费高不高\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "单位成本",
        "材料",
        "制费",
        "成本总览",
        "制造成本总览",
        "成本概况类"
      ],
      "crossRefs": [
        "dash:cost",
        "dash:bom-variance"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q21",
      "name": "报废返工上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "报废返工上升 = 产品效应 + 工序效应 + 不良类型效应 + 批次效应",
      "href": "methodology.html#q21",
      "detail": {
        "definition": "为什么报废/返工突然变多？",
        "notes": "报废返工上升 = 产品效应 + 工序效应 + 不良类型效应 + 批次效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "报废",
        "返工",
        "FPY",
        "批次",
        "报废返工上升诊断",
        "质量异常类"
      ],
      "crossRefs": [
        "dash:scrap-rework",
        "dash:process-yield"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q22",
      "name": "在制品（WIP）堆积诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "WIP 堆积 = 瓶颈工序效应 + 节拍不匹配效应 + 停机效应 + 换型效应",
      "href": "methodology.html#q22",
      "detail": {
        "definition": "为什么在制品堆这么多？",
        "notes": "WIP 堆积 = 瓶颈工序效应 + 节拍不匹配效应 + 停机效应 + 换型效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "WIP",
        "在制品",
        "堆积",
        "节拍",
        "堆积诊断",
        "在制品异常类"
      ],
      "crossRefs": [
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q23",
      "name": "订单交付风险预测",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "订单交付风险 = 在制进度 + 瓶颈工序余量 + 供应商齐套",
      "href": "methodology.html#q23",
      "detail": {
        "definition": "哪些订单下周可能延期？",
        "notes": "订单交付风险 = 在制进度 + 瓶颈工序余量 + 供应商齐套",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "交期",
        "风险",
        "在制",
        "承诺",
        "订单交付风险预测",
        "交付预测类"
      ],
      "crossRefs": [
        "dash:delivery"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q24",
      "name": "人工效率评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "人工效率评估 = 人均产出 + 标准工时达成率 + 加班率",
      "href": "methodology.html#q24",
      "detail": {
        "definition": "人员效率达标了吗？哪班偏低？",
        "notes": "人工效率评估 = 人均产出 + 标准工时达成率 + 加班率",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "人均产出",
        "标准工时",
        "班组",
        "加班",
        "人工效率评估",
        "人员效率类"
      ],
      "crossRefs": [
        "metric:标准工时达成率",
        "metric:人均产出",
        "dash:labor"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q25",
      "name": "库存与周转优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最小化库存金额（或最大化库存周转）。",
      "href": "methodology.html#q25",
      "detail": {
        "definition": "库存怎么压又不缺料？",
        "notes": "目标函数：最小化库存金额（或最大化库存周转）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "库存",
        "周转",
        "呆滞",
        "安全库存",
        "库存与周转优化",
        "库存优化类"
      ],
      "crossRefs": [
        "metric:inventory_value",
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q26",
      "name": "客诉 8D / CAPA 闭环",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：彻底关闭客诉问题（防止再发）。",
      "href": "methodology.html#q26",
      "detail": {
        "definition": "这起客诉怎么闭环不再发？",
        "notes": "目标函数：彻底关闭客诉问题（防止再发）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "8D",
        "CAPA",
        "客诉",
        "闭环",
        "质量改善类"
      ],
      "crossRefs": [
        "dash:quality",
        "dash:scrap-rework"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q27",
      "name": "班组绩效排名",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "班组排名看四类：产量（规模）、良品率（质量）、产能利用率（效率）、人均产出（人效）。四类分别回答\"哪个班产量大、质量好、效率高、人效高\"。",
      "href": "methodology.html#q27",
      "detail": {
        "definition": "哪个班表现最好？哪个班拖后腿？",
        "notes": "班组排名看四类：产量（规模）、良品率（质量）、产能利用率（效率）、人均产出（人效）。四类分别回答\"哪个班产量大、质量好、效率高、人效高\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "班组",
        "班次",
        "绩效",
        "排名",
        "班组绩效排名",
        "绩效排名类"
      ],
      "crossRefs": [
        "metric:人均产出",
        "dash:labor",
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q28",
      "name": "产品成本结构分析",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "产品成本结构看三类：单位成本（成本效率）、成本结构（材料/人工/制费占比）、产品间成本排名。三类分别回答“哪款成本高、成本花在哪、谁相对更贵”（收入数据待补，暂不做毛利/盈利）。",
      "href": "methodology.html#q28",
      "detail": {
        "definition": "哪款产品单位成本最高？成本结构如何？",
        "notes": "产品成本结构看三类：单位成本（成本效率）、成本结构（材料/人工/制费占比）、产品间成本排名。三类分别回答“哪款成本高、成本花在哪、谁相对更贵”（收入数据待补，暂不做毛利/盈利）。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "产品",
        "盈利",
        "毛利",
        "产品线",
        "产品成本结构分析",
        "成本概况类"
      ],
      "crossRefs": [
        "dash:cost",
        "dash:bom-variance"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q29",
      "name": "工序良率总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "工序良率看三类：良品率（最终）、FPY（一次通过率）、不良分布（类型 + 数量）。三类分别回答\"哪道工序最终良率低、哪道工序一次通过率低、不良集中在哪\"。",
      "href": "methodology.html#q29",
      "detail": {
        "definition": "哪道工序良率最低？质量瓶颈在哪？",
        "notes": "工序良率看三类：良品率（最终）、FPY（一次通过率）、不良分布（类型 + 数量）。三类分别回答\"哪道工序最终良率低、哪道工序一次通过率低、不良集中在哪\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "工序",
        "良率",
        "FPY",
        "工艺流程",
        "工序良率总览",
        "质量概况类"
      ],
      "crossRefs": [
        "dash:process-yield",
        "dash:quality"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q30",
      "name": "能耗总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "能耗看四类：总能耗（电/气/水）、单位产品能耗（单耗）、能耗结构、能耗趋势。四类分别回答\"总能耗多少、单耗多少、哪类能耗为主、趋势如何\"。",
      "href": "methodology.html#q30",
      "detail": {
        "definition": "本月能耗情况怎么样？单耗达标吗？",
        "notes": "能耗看四类：总能耗（电/气/水）、单位产品能耗（单耗）、能耗结构、能耗趋势。四类分别回答\"总能耗多少、单耗多少、哪类能耗为主、趋势如何\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "能耗",
        "电费",
        "单耗",
        "节能",
        "能耗总览",
        "生产概况类"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q31",
      "name": "客户交付分析",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "客户交付看四类：OTIF（准时足量率）、欠交金额、订单满足率、客户集中度。四类分别回答\"哪些客户准时足量率低、哪些客户欠交多、哪些客户满足率低、交付是否过度依赖大客户\"。",
      "href": "methodology.html#q31",
      "detail": {
        "definition": "哪些客户交付最差？客户满意度风险在哪？",
        "notes": "客户交付看四类：OTIF（准时足量率）、欠交金额、订单满足率、客户集中度。四类分别回答\"哪些客户准时足量率低、哪些客户欠交多、哪些客户满足率低、交付是否过度依赖大客户\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "客户",
        "交付",
        "OTIF",
        "订单满足率",
        "客户交付分析",
        "生产概况类"
      ],
      "crossRefs": [
        "dash:delivery"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q32",
      "name": "安全生产概况",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "安全看四类：事故次数、事故严重度、隐患整改率、培训完成率。四类分别回答\"出了多少次事故、事故多严重、隐患整改如何、培训是否到位\"。",
      "href": "methodology.html#q32",
      "detail": {
        "definition": "本月安全状况怎么样？有哪些风险点？",
        "notes": "安全看四类：事故次数、事故严重度、隐患整改率、培训完成率。四类分别回答\"出了多少次事故、事故多严重、隐患整改如何、培训是否到位\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "判断与标注",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "安全",
        "事故",
        "隐患",
        "培训",
        "安全生产概况",
        "生产概况类"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q33",
      "name": "能耗上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "能耗上升 = 产量规模效应 + 产品结构效应 + 设备效率效应 + 工艺参数效应",
      "href": "methodology.html#q33",
      "detail": {
        "definition": "为什么这个月电费涨了这么多？",
        "notes": "能耗上升 = 产量规模效应 + 产品结构效应 + 设备效率效应 + 工艺参数效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "能耗",
        "电费",
        "单耗",
        "节能",
        "能耗上升诊断",
        "成本异常类"
      ],
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q34",
      "name": "人工成本上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "人工成本上升 = 人数增加效应 + 加班增加效应 + 单价上涨效应 + 人效下降效应",
      "href": "methodology.html#q34",
      "detail": {
        "definition": "为什么人工成本涨了？是加人了还是效率降了？",
        "notes": "人工成本上升 = 人数增加效应 + 加班增加效应 + 单价上涨效应 + 人效下降效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "人工成本",
        "加班",
        "效率",
        "人均产出",
        "人工成本上升诊断",
        "成本异常类"
      ],
      "crossRefs": [
        "metric:人均产出",
        "dash:labor",
        "dash:cost"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q35",
      "name": "客诉上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "客诉上升 = 产品质量效应 + 交付问题效应 + 服务问题效应 + 客户结构效应",
      "href": "methodology.html#q35",
      "detail": {
        "definition": "为什么客诉突然变多了？哪类问题最严重？",
        "notes": "客诉上升 = 产品质量效应 + 交付问题效应 + 服务问题效应 + 客户结构效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "客诉",
        "投诉",
        "客户质量",
        "退货",
        "客诉上升诊断",
        "质量异常类"
      ],
      "crossRefs": [
        "dash:quality"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q36",
      "name": "安全事故根因分析",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "安全事故 = 人的不安全行为 + 物的不安全状态 + 管理缺陷 + 环境因素",
      "href": "methodology.html#q36",
      "detail": {
        "definition": "为什么事故变多了？根因是什么？",
        "notes": "安全事故 = 人的不安全行为 + 物的不安全状态 + 管理缺陷 + 环境因素",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "安全",
        "事故",
        "根因",
        "隐患",
        "安全事故根因分析",
        "设备异常类"
      ],
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q37",
      "name": "物料损耗上升诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "物料损耗上升 = 物料效应 + 工序效应 + 原因效应 + 批次效应",
      "href": "methodology.html#q37",
      "detail": {
        "definition": "为什么物料损耗率超标了？浪费在哪？",
        "notes": "物料损耗上升 = 物料效应 + 工序效应 + 原因效应 + 批次效应",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "物料损耗",
        "报废",
        "领料差异",
        "浪费",
        "物料损耗上升诊断",
        "供应链异常类"
      ],
      "crossRefs": [
        "dash:bom-variance"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q38",
      "name": "换型时间过长诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "换型时间长 = 准备时间 + 拆卸时间 + 安装时间 + 调试时间",
      "href": "methodology.html#q38",
      "detail": {
        "definition": "为什么换型要这么久？时间都花在哪了？",
        "notes": "换型时间长 = 准备时间 + 拆卸时间 + 安装时间 + 调试时间",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "换型",
        "SMED",
        "换模",
        "调机",
        "换型时间过长诊断",
        "产能异常类"
      ],
      "crossRefs": [
        "dash:downtime"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q39",
      "name": "瓶颈工序漂移诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "瓶颈漂移 = 原瓶颈改善 + 新瓶颈出现 + 需求结构变化",
      "href": "methodology.html#q39",
      "detail": {
        "definition": "瓶颈工序是不是变了？现在卡在哪？",
        "notes": "瓶颈漂移 = 原瓶颈改善 + 新瓶颈出现 + 需求结构变化",
        "steps": [
          "前置检查",
          "因果分解框架",
          "诊断步骤",
          "判断与结论",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "瓶颈",
        "漂移",
        "约束",
        "产能",
        "瓶颈工序漂移诊断",
        "产能异常类"
      ],
      "crossRefs": [
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q40",
      "name": "安全库存预警",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "安全库存预警 = 当前库存 / 日均消耗 = 可用天数 vs 采购提前期",
      "href": "methodology.html#q40",
      "detail": {
        "definition": "哪些物料快断货了？需要紧急采购吗？",
        "notes": "安全库存预警 = 当前库存 / 日均消耗 = 可用天数 vs 采购提前期",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "安全库存",
        "缺货",
        "预警",
        "补货",
        "安全库存预警",
        "物料需求类"
      ],
      "crossRefs": [
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q41",
      "name": "能耗预测与预算",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "能耗预测 = 下月产量预测 × 历史单耗（M12）",
      "href": "methodology.html#q41",
      "detail": {
        "definition": "下月能耗预算够不够？需要追加吗？",
        "notes": "能耗预测 = 下月产量预测 × 历史单耗（M12）",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "能耗预测",
        "能源预算",
        "单耗",
        "节能",
        "能耗预测与预算",
        "产量预测类"
      ],
      "crossRefs": [
        "dash:cost"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q42",
      "name": "人力需求预测",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "人力需求 = 产量计划 × 标准工时 / 人均可用工时",
      "href": "methodology.html#q42",
      "detail": {
        "definition": "下月需要多少人？现在的人够吗？",
        "notes": "人力需求 = 产量计划 × 标准工时 / 人均可用工时",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "人力需求",
        "定员",
        "排班",
        "招聘",
        "人力需求预测",
        "产量预测类"
      ],
      "crossRefs": [
        "dash:labor",
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q43",
      "name": "质量风险预测",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l3",
      "description": "质量风险 = 过程能力指数（CPK）趋势 + 历史不良率",
      "href": "methodology.html#q43",
      "detail": {
        "definition": "哪些产品/工序下月质量风险高？",
        "notes": "质量风险 = 过程能力指数（CPK）趋势 + 历史不良率",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "预测结果与判断",
          "回测校验",
          "情景分析与假设"
        ]
      },
      "tags": [
        "质量预测",
        "风险预警",
        "过程能力",
        "SPC",
        "质量风险预测",
        "设备故障类"
      ],
      "crossRefs": [
        "metric:不良率",
        "dash:quality",
        "dash:process-yield"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q44",
      "name": "产品盈利能力评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "产品盈利评估 = 毛利 × 销量 × 周转（BCG 矩阵分类）",
      "href": "methodology.html#q44",
      "detail": {
        "definition": "哪些产品是金牛？哪些是瘦狗？",
        "notes": "产品盈利评估 = 毛利 × 销量 × 周转（BCG 矩阵分类）",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "产品盈利",
        "BCG矩阵",
        "产品组合",
        "SKU优化",
        "产品盈利能力评估",
        "成本/盈利评估类"
      ],
      "crossRefs": [
        "dash:cost"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q45",
      "name": "客户价值评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "客户价值评估 = 收入规模 × 毛利率 × 交付表现 × 增长潜力（综合评分）+ 客户集中度",
      "href": "methodology.html#q45",
      "detail": {
        "definition": "哪些客户是高价值客户？哪些需要策略调整？",
        "notes": "客户价值评估 = 收入规模 × 毛利率 × 交付表现 × 增长潜力（综合评分）+ 客户集中度",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "客户价值",
        "客户分层",
        "RFM",
        "客户盈利",
        "客户价值评估",
        "客户评估类"
      ],
      "crossRefs": [
        "dash:delivery"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q46",
      "name": "班组绩效综合评估",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l4",
      "description": "班组绩效评估 = 产量 + 质量 + 效率 + 安全（四维综合评分）",
      "href": "methodology.html#q46",
      "detail": {
        "definition": "哪个班组综合表现最好？差距在哪？",
        "notes": "班组绩效评估 = 产量 + 质量 + 效率 + 安全（四维综合评分）",
        "steps": [
          "前置检查",
          "评估框架",
          "评估步骤",
          "判断与结论",
          "最小评估法",
          "常见误判"
        ]
      },
      "tags": [
        "班组评估",
        "综合绩效",
        "对标",
        "评优",
        "班组绩效综合评估",
        "人员效率类"
      ],
      "crossRefs": [
        "dash:labor",
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q47",
      "name": "生产排程优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最大化产出（或最大化交期满足率）。",
      "href": "methodology.html#q47",
      "detail": {
        "definition": "怎么排产能让产出最多、交付最好？",
        "notes": "目标函数：最大化产出（或最大化交期满足率）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "排程",
        "APS",
        "换型优化",
        "订单优先级",
        "生产排程优化",
        "计划优化类"
      ],
      "crossRefs": [
        "dash:delivery"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q48",
      "name": "能耗优化方案",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最小化能耗成本（或最大化节能收益）。",
      "href": "methodology.html#q48",
      "detail": {
        "definition": "怎么把能耗降下来？投入产出比怎么样？",
        "notes": "目标函数：最小化能耗成本（或最大化节能收益）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "节能",
        "降耗",
        "能效优化",
        "节能改造",
        "能耗优化方案",
        "质量改善类"
      ],
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q49",
      "name": "人员排班优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最小化人力成本（或最大化人效）。",
      "href": "methodology.html#q49",
      "detail": {
        "definition": "怎么排班既能满足生产又不浪费人力？",
        "notes": "目标函数：最小化人力成本（或最大化人效）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "排班",
        "人员配置",
        "多技能",
        "弹性用工",
        "人员排班优化",
        "计划优化类"
      ],
      "crossRefs": [
        "dash:labor",
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q50",
      "name": "物料配送路径优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "目标函数：最小化配送成本（或最小化配送时间）。",
      "href": "methodology.html#q50",
      "detail": {
        "definition": "怎么送料能又快又省？配送路线怎么优化？",
        "notes": "目标函数：最小化配送成本（或最小化配送时间）。",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "验证与回滚",
          "常见误判"
        ]
      },
      "tags": [
        "配送",
        "物流",
        "路径优化",
        "厂内物流",
        "物料配送路径优化",
        "库存优化类"
      ],
      "crossRefs": [
        "dash:supply"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_wh_ods",
      "name": "ODS 贴源层",
      "type": "warehouse",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:ods_inventory_material",
        "tbl:ods_labor",
        "tbl:ods_material",
        "tbl:ods_production_line",
        "tbl:ods_production_order",
        "tbl:ods_quality_inspection",
        "tbl:ods_supplier"
      ],
      "detail": {
        "definition": "ODS 贴源层"
      },
      "crossRefs": []
    },
    {
      "id": "cat_wh_dim",
      "name": "DIM 维度层",
      "type": "warehouse",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dim_date",
        "tbl:dim_defect_type",
        "tbl:dim_equipment",
        "tbl:dim_factory",
        "tbl:dim_material",
        "tbl:dim_product",
        "tbl:dim_production_line",
        "tbl:dim_supplier"
      ],
      "detail": {
        "definition": "DIM 维度层"
      },
      "crossRefs": []
    },
    {
      "id": "cat_wh_dwd",
      "name": "DWD 明细层",
      "type": "warehouse",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dwd_equipment_run",
        "tbl:dwd_labor_wide",
        "tbl:dwd_production_wide",
        "tbl:dwd_quality_wide",
        "tbl:dwd_supply_wide",
        "tbl:fact_equipment_run",
        "tbl:fact_labor",
        "tbl:fact_material_consumption",
        "tbl:fact_process_operation",
        "tbl:fact_production",
        "tbl:fact_quality",
        "tbl:fact_supply"
      ],
      "detail": {
        "definition": "DWD 明细层"
      },
      "crossRefs": []
    },
    {
      "id": "cat_wh_dws",
      "name": "DWS 汇总层",
      "type": "warehouse",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dws_cost_monthly",
        "tbl:dws_defect_daily",
        "tbl:dws_equipment_daily",
        "tbl:dws_labor_monthly",
        "tbl:dws_material_daily",
        "tbl:dws_production_daily",
        "tbl:dws_quality_daily",
        "tbl:dws_supply_daily"
      ],
      "detail": {
        "definition": "DWS 汇总层"
      },
      "crossRefs": []
    },
    {
      "id": "cat_wh_ads",
      "name": "ADS 应用层",
      "type": "warehouse",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:v_capacity_utilization",
        "tbl:v_cmei_daily",
        "tbl:v_cost_analysis",
        "tbl:v_defect_analysis",
        "tbl:v_equipment_oee",
        "tbl:v_labor_efficiency",
        "tbl:v_manufacturing_finance",
        "tbl:v_material_turnover",
        "tbl:v_production_overview",
        "tbl:v_quality_analysis",
        "tbl:v_supply_chain"
      ],
      "detail": {
        "definition": "ADS 应用层"
      },
      "crossRefs": []
    },
    {
      "id": "tbl:ods_inventory_material",
      "name": "ods_inventory_material",
      "name_cn": "物料库存",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "物料库存",
      "aliases": [
        "物料库存",
        "ODS·物料库存·日快照表"
      ],
      "href": "platform-graph.html?node=tbl:ods_inventory_material",
      "dictHref": "architecture.html#dict/ods_inventory_material",
      "detail": {
        "definition": "ODS·物料库存·日快照表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "物料库存"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_labor",
      "name": "ods_labor",
      "name_cn": "人工工时",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "人工工时",
      "aliases": [
        "人工工时",
        "ODS·人工工时·增量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_labor",
      "dictHref": "architecture.html#dict/ods_labor",
      "detail": {
        "definition": "ODS·人工工时·增量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "人工工时"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_material",
      "name": "ods_material",
      "name_cn": "物料主数据",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "物料主数据",
      "aliases": [
        "物料主数据",
        "ODS·物料主数据·全量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_material",
      "dictHref": "architecture.html#dict/ods_material",
      "detail": {
        "definition": "ODS·物料主数据·全量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "物料主数据"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_production_line",
      "name": "ods_production_line",
      "name_cn": "产线主数据",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "产线主数据",
      "aliases": [
        "产线主数据",
        "ODS·产线主数据·全量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_production_line",
      "dictHref": "architecture.html#dict/ods_production_line",
      "detail": {
        "definition": "ODS·产线主数据·全量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "产线主数据"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_production_order",
      "name": "ods_production_order",
      "name_cn": "生产工单",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "生产工单",
      "aliases": [
        "生产工单",
        "ODS·生产工单·增量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_production_order",
      "dictHref": "architecture.html#dict/ods_production_order",
      "detail": {
        "definition": "ODS·生产工单·增量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "生产工单"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_quality_inspection",
      "name": "ods_quality_inspection",
      "name_cn": "质检记录",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "质检记录",
      "aliases": [
        "质检记录",
        "ODS·质检记录·增量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_quality_inspection",
      "dictHref": "architecture.html#dict/ods_quality_inspection",
      "detail": {
        "definition": "ODS·质检记录·增量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "质检记录"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_supplier",
      "name": "ods_supplier",
      "name_cn": "供应商",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "供应商",
      "aliases": [
        "供应商",
        "ODS·供应商·全量表"
      ],
      "href": "platform-graph.html?node=tbl:ods_supplier",
      "dictHref": "architecture.html#dict/ods_supplier",
      "detail": {
        "definition": "ODS·供应商·全量表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods",
        "供应商"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_date",
      "name": "dim_date",
      "name_cn": "日期",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "日期",
      "aliases": [
        "日期",
        "DIM·日期·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_date",
      "dictHref": "architecture.html#dict/dim_date",
      "detail": {
        "definition": "DIM·日期·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "日期"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_defect_type",
      "name": "dim_defect_type",
      "name_cn": "缺陷类型",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "缺陷类型",
      "aliases": [
        "缺陷类型",
        "DIM·缺陷类型·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_defect_type",
      "dictHref": "architecture.html#dict/dim_defect_type",
      "detail": {
        "definition": "DIM·缺陷类型·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "缺陷类型"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_equipment",
      "name": "dim_equipment",
      "name_cn": "设备",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "设备",
      "aliases": [
        "设备",
        "DIM·设备·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_equipment",
      "dictHref": "architecture.html#dict/dim_equipment",
      "detail": {
        "definition": "DIM·设备·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "设备"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_factory",
      "name": "dim_factory",
      "name_cn": "工厂",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "工厂",
      "aliases": [
        "工厂",
        "DIM·工厂·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_factory",
      "dictHref": "architecture.html#dict/dim_factory",
      "detail": {
        "definition": "DIM·工厂·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "工厂"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_material",
      "name": "dim_material",
      "name_cn": "物料",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "物料",
      "aliases": [
        "物料",
        "DIM·物料·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_material",
      "dictHref": "architecture.html#dict/dim_material",
      "detail": {
        "definition": "DIM·物料·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "物料"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_product",
      "name": "dim_product",
      "name_cn": "产品",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "产品",
      "aliases": [
        "产品",
        "DIM·产品·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_product",
      "dictHref": "architecture.html#dict/dim_product",
      "detail": {
        "definition": "DIM·产品·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "产品"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_production_line",
      "name": "dim_production_line",
      "name_cn": "产线",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "产线",
      "aliases": [
        "产线",
        "DIM·产线·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_production_line",
      "dictHref": "architecture.html#dict/dim_production_line",
      "detail": {
        "definition": "DIM·产线·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "产线"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_supplier",
      "name": "dim_supplier",
      "name_cn": "供应商",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "供应商",
      "aliases": [
        "供应商",
        "DIM·供应商·全量"
      ],
      "href": "platform-graph.html?node=tbl:dim_supplier",
      "dictHref": "architecture.html#dict/dim_supplier",
      "detail": {
        "definition": "DIM·供应商·全量",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim",
        "供应商"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_equipment_run",
      "name": "dwd_equipment_run",
      "name_cn": "设备运行明细事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "设备运行明细事实",
      "aliases": [
        "设备运行明细事实",
        "DWD·设备运行明细事实·增量·粒度=日×设备×班次"
      ],
      "href": "platform-graph.html?node=tbl:dwd_equipment_run",
      "dictHref": "architecture.html#dict/dwd_equipment_run",
      "detail": {
        "definition": "DWD·设备运行明细事实·增量·粒度=日×设备×班次",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "设备运行明细事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_labor_wide",
      "name": "dwd_labor_wide",
      "name_cn": "人工事实宽表",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "人工事实宽表",
      "aliases": [
        "人工事实宽表",
        "DWD·人工事实宽表·增量·粒度=工单×人工记录"
      ],
      "href": "platform-graph.html?node=tbl:dwd_labor_wide",
      "dictHref": "architecture.html#dict/dwd_labor_wide",
      "detail": {
        "definition": "DWD·人工事实宽表·增量·粒度=工单×人工记录",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "人工事实宽表"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_production_wide",
      "name": "dwd_production_wide",
      "name_cn": "生产事实宽表",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "生产事实宽表",
      "aliases": [
        "生产事实宽表",
        "DWD·生产事实宽表·增量·粒度=工单"
      ],
      "href": "platform-graph.html?node=tbl:dwd_production_wide",
      "dictHref": "architecture.html#dict/dwd_production_wide",
      "detail": {
        "definition": "DWD·生产事实宽表·增量·粒度=工单",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "生产事实宽表"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_quality_wide",
      "name": "dwd_quality_wide",
      "name_cn": "质量事实宽表",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "质量事实宽表",
      "aliases": [
        "质量事实宽表",
        "DWD·质量事实宽表·增量·粒度=质检单"
      ],
      "href": "platform-graph.html?node=tbl:dwd_quality_wide",
      "dictHref": "architecture.html#dict/dwd_quality_wide",
      "detail": {
        "definition": "DWD·质量事实宽表·增量·粒度=质检单",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "质量事实宽表"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_supply_wide",
      "name": "dwd_supply_wide",
      "name_cn": "供应链事实宽表",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "供应链事实宽表",
      "aliases": [
        "供应链事实宽表",
        "DWD·供应链事实宽表·快照·粒度=日×物料×供应商"
      ],
      "href": "platform-graph.html?node=tbl:dwd_supply_wide",
      "dictHref": "architecture.html#dict/dwd_supply_wide",
      "detail": {
        "definition": "DWD·供应链事实宽表·快照·粒度=日×物料×供应商",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "供应链事实宽表"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_equipment_run",
      "name": "fact_equipment_run",
      "name_cn": "设备运行事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "设备运行事实",
      "aliases": [
        "设备运行事实",
        "DWD·设备运行事实（同义视图）"
      ],
      "href": "platform-graph.html?node=tbl:fact_equipment_run",
      "dictHref": "architecture.html#dict/fact_equipment_run",
      "detail": {
        "definition": "DWD·设备运行事实（同义视图）",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "设备运行事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_labor",
      "name": "fact_labor",
      "name_cn": "人工事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "人工事实",
      "aliases": [
        "人工事实",
        "DWD·人工事实（同义视图）"
      ],
      "href": "platform-graph.html?node=tbl:fact_labor",
      "dictHref": "architecture.html#dict/fact_labor",
      "detail": {
        "definition": "DWD·人工事实（同义视图）",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "人工事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_material_consumption",
      "name": "fact_material_consumption",
      "name_cn": "工单领料事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "工单领料事实",
      "aliases": [
        "工单领料事实",
        "FACT·工单领料事实·增量·粒度=工单×物料"
      ],
      "href": "platform-graph.html?node=tbl:fact_material_consumption",
      "dictHref": "architecture.html#dict/fact_material_consumption",
      "detail": {
        "definition": "FACT·工单领料事实·增量·粒度=工单×物料",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "工单领料事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_process_operation",
      "name": "fact_process_operation",
      "name_cn": "工序完成事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "工序完成事实",
      "aliases": [
        "工序完成事实",
        "FACT·工序完成事实·增量·粒度=工单×工序"
      ],
      "href": "platform-graph.html?node=tbl:fact_process_operation",
      "dictHref": "architecture.html#dict/fact_process_operation",
      "detail": {
        "definition": "FACT·工序完成事实·增量·粒度=工单×工序",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "工序完成事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_production",
      "name": "fact_production",
      "name_cn": "生产事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "生产事实",
      "aliases": [
        "生产事实",
        "DWD·生产事实（同义视图）"
      ],
      "href": "platform-graph.html?node=tbl:fact_production",
      "dictHref": "architecture.html#dict/fact_production",
      "detail": {
        "definition": "DWD·生产事实（同义视图）",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "生产事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_quality",
      "name": "fact_quality",
      "name_cn": "质量事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "质量事实",
      "aliases": [
        "质量事实",
        "DWD·质量事实（同义视图）"
      ],
      "href": "platform-graph.html?node=tbl:fact_quality",
      "dictHref": "architecture.html#dict/fact_quality",
      "detail": {
        "definition": "DWD·质量事实（同义视图）",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "质量事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:fact_supply",
      "name": "fact_supply",
      "name_cn": "供应事实",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "供应事实",
      "aliases": [
        "供应事实",
        "DWD·供应事实（同义视图）"
      ],
      "href": "platform-graph.html?node=tbl:fact_supply",
      "dictHref": "architecture.html#dict/fact_supply",
      "detail": {
        "definition": "DWD·供应事实（同义视图）",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd",
        "供应事实"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_cost_monthly",
      "name": "dws_cost_monthly",
      "name_cn": "月成本汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "月成本汇总",
      "aliases": [
        "月成本汇总",
        "DWS·月成本汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_cost_monthly",
      "dictHref": "architecture.html#dict/dws_cost_monthly",
      "detail": {
        "definition": "DWS·月成本汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "月成本汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_defect_daily",
      "name": "dws_defect_daily",
      "name_cn": "日缺陷汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日缺陷汇总",
      "aliases": [
        "日缺陷汇总",
        "DWS·日缺陷汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_defect_daily",
      "dictHref": "architecture.html#dict/dws_defect_daily",
      "detail": {
        "definition": "DWS·日缺陷汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日缺陷汇总"
      ],
      "crossRefs": [
        "metric:柏拉图top3不良"
      ],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_equipment_daily",
      "name": "dws_equipment_daily",
      "name_cn": "日设备汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日设备汇总",
      "aliases": [
        "日设备汇总",
        "DWS·日设备汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_equipment_daily",
      "dictHref": "architecture.html#dict/dws_equipment_daily",
      "detail": {
        "definition": "DWS·日设备汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日设备汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_labor_monthly",
      "name": "dws_labor_monthly",
      "name_cn": "月人工效率",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "月人工效率",
      "aliases": [
        "月人工效率",
        "DWS·月人工效率·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_labor_monthly",
      "dictHref": "architecture.html#dict/dws_labor_monthly",
      "detail": {
        "definition": "DWS·月人工效率·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "月人工效率"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_material_daily",
      "name": "dws_material_daily",
      "name_cn": "日物料周转",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日物料周转",
      "aliases": [
        "日物料周转",
        "DWS·日物料周转·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_material_daily",
      "dictHref": "architecture.html#dict/dws_material_daily",
      "detail": {
        "definition": "DWS·日物料周转·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日物料周转"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_production_daily",
      "name": "dws_production_daily",
      "name_cn": "日生产汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日生产汇总",
      "aliases": [
        "日生产汇总",
        "DWS·日生产汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_production_daily",
      "dictHref": "architecture.html#dict/dws_production_daily",
      "detail": {
        "definition": "DWS·日生产汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日生产汇总"
      ],
      "crossRefs": [
        "metric:计划达成率"
      ],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_quality_daily",
      "name": "dws_quality_daily",
      "name_cn": "日质量汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日质量汇总",
      "aliases": [
        "日质量汇总",
        "DWS·日质量汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_quality_daily",
      "dictHref": "architecture.html#dict/dws_quality_daily",
      "detail": {
        "definition": "DWS·日质量汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日质量汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_supply_daily",
      "name": "dws_supply_daily",
      "name_cn": "日供应汇总",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "日供应汇总",
      "aliases": [
        "日供应汇总",
        "DWS·日供应汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_supply_daily",
      "dictHref": "architecture.html#dict/dws_supply_daily",
      "detail": {
        "definition": "DWS·日供应汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "日供应汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_capacity_utilization",
      "name": "v_capacity_utilization",
      "name_cn": "产能利用率",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "产能利用率",
      "aliases": [
        "产能利用率",
        "ADS·产能利用率"
      ],
      "href": "platform-graph.html?node=tbl:v_capacity_utilization",
      "dictHref": "architecture.html#dict/v_capacity_utilization",
      "detail": {
        "definition": "ADS·产能利用率",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "产能利用率"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cmei_daily",
      "name": "v_cmei_daily",
      "name_cn": "综合效能CMEI",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "综合效能CMEI",
      "aliases": [
        "综合效能CMEI",
        "ADS·综合效能CMEI"
      ],
      "href": "platform-graph.html?node=tbl:v_cmei_daily",
      "dictHref": "architecture.html#dict/v_cmei_daily",
      "detail": {
        "definition": "ADS·综合效能CMEI",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "综合效能CMEI"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cost_analysis",
      "name": "v_cost_analysis",
      "name_cn": "成本分析",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "成本分析",
      "aliases": [
        "成本分析",
        "ADS·成本分析"
      ],
      "href": "platform-graph.html?node=tbl:v_cost_analysis",
      "dictHref": "architecture.html#dict/v_cost_analysis",
      "detail": {
        "definition": "ADS·成本分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "成本分析"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_defect_analysis",
      "name": "v_defect_analysis",
      "name_cn": "缺陷分析",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "缺陷分析",
      "aliases": [
        "缺陷分析",
        "ADS·缺陷分析"
      ],
      "href": "platform-graph.html?node=tbl:v_defect_analysis",
      "dictHref": "architecture.html#dict/v_defect_analysis",
      "detail": {
        "definition": "ADS·缺陷分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "缺陷分析"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_equipment_oee",
      "name": "v_equipment_oee",
      "name_cn": "设备OEE",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "设备OEE",
      "aliases": [
        "设备OEE",
        "ADS·设备OEE"
      ],
      "href": "platform-graph.html?node=tbl:v_equipment_oee",
      "dictHref": "architecture.html#dict/v_equipment_oee",
      "detail": {
        "definition": "ADS·设备OEE",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "设备OEE"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_labor_efficiency",
      "name": "v_labor_efficiency",
      "name_cn": "人效分析",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "人效分析",
      "aliases": [
        "人效分析",
        "ADS·人效分析"
      ],
      "href": "platform-graph.html?node=tbl:v_labor_efficiency",
      "dictHref": "architecture.html#dict/v_labor_efficiency",
      "detail": {
        "definition": "ADS·人效分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "人效分析"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_manufacturing_finance",
      "name": "v_manufacturing_finance",
      "name_cn": "制造财务",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "制造财务",
      "aliases": [
        "制造财务",
        "ADS·制造财务"
      ],
      "href": "platform-graph.html?node=tbl:v_manufacturing_finance",
      "dictHref": "architecture.html#dict/v_manufacturing_finance",
      "detail": {
        "definition": "ADS·制造财务",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "制造财务"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_material_turnover",
      "name": "v_material_turnover",
      "name_cn": "物料周转",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "物料周转",
      "aliases": [
        "物料周转",
        "ADS·物料周转"
      ],
      "href": "platform-graph.html?node=tbl:v_material_turnover",
      "dictHref": "architecture.html#dict/v_material_turnover",
      "detail": {
        "definition": "ADS·物料周转",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "物料周转"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_production_overview",
      "name": "v_production_overview",
      "name_cn": "生产总览",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "生产总览",
      "aliases": [
        "生产总览",
        "ADS·生产总览"
      ],
      "href": "platform-graph.html?node=tbl:v_production_overview",
      "dictHref": "architecture.html#dict/v_production_overview",
      "detail": {
        "definition": "ADS·生产总览",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "生产总览"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_quality_analysis",
      "name": "v_quality_analysis",
      "name_cn": "质量分析",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "质量分析",
      "aliases": [
        "质量分析",
        "ADS·质量分析"
      ],
      "href": "platform-graph.html?node=tbl:v_quality_analysis",
      "dictHref": "architecture.html#dict/v_quality_analysis",
      "detail": {
        "definition": "ADS·质量分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "质量分析"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_supply_chain",
      "name": "v_supply_chain",
      "name_cn": "供应链",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "供应链",
      "aliases": [
        "供应链",
        "ADS·供应链"
      ],
      "href": "platform-graph.html?node=tbl:v_supply_chain",
      "dictHref": "architecture.html#dict/v_supply_chain",
      "detail": {
        "definition": "ADS·供应链",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads",
        "供应链"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_质量指标",
      "name": "质量指标",
      "type": "metric",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:cmei_综合制造效能指数",
        "metric:fpy_一次合格率",
        "metric:最终合格率",
        "metric:不良率",
        "metric:返工率",
        "metric:报废率",
        "metric:质量损失成本",
        "metric:柏拉图top3不良",
        "metric:spc_cpk_过程能力指数",
        "metric:客诉率"
      ],
      "detail": {
        "definition": "质量指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:cmei_综合制造效能指数",
      "name": "CMEI 综合制造效能指数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "FPY×40%+OEE×35%+OTD×25%",
      "href": "architecture.html#dict/`v_cmei_daily`（已落地最小视图）",
      "detail": {
        "definition": "FPY×40%+OEE×35%+OTD×25%",
        "formula": "加权合成",
        "notes": "来源表：`v_cmei_daily`（已落地最小视图） · 刷新：日"
      },
      "tags": [
        "cmei_综合制造效能指数",
        "CMEI 综合制造效能指数"
      ],
      "source_table": "`v_cmei_daily`（已落地最小视图）",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_生产运营指标",
      "name": "生产运营指标",
      "type": "metric",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:当日产量",
        "metric:计划产量",
        "metric:计划达成率",
        "metric:工单完成率",
        "metric:wip_在制品数量",
        "metric:otd_准时交付率",
        "metric:生产节拍",
        "metric:标准工时达成率",
        "metric:人均产出",
        "metric:工单周期"
      ],
      "detail": {
        "definition": "生产运营指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:当日产量",
      "name": "当日产量",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "当日实际产出的合格产品数量",
      "href": "architecture.html#dict/dwd_production_fact",
      "detail": {
        "definition": "当日实际产出的合格产品数量",
        "formula": "SUM(actual_qty) WHERE 生产日期=当日",
        "notes": "来源表：dwd_production_fact · 刷新：小时/日"
      },
      "tags": [
        "当日产量",
        "当日产量"
      ],
      "source_table": "dwd_production_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:计划产量",
      "name": "计划产量",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "当日计划产出的产品数量",
      "href": "architecture.html#dict/dwd_production_fact",
      "detail": {
        "definition": "当日计划产出的产品数量",
        "formula": "SUM(plan_qty) WHERE 生产日期=当日",
        "notes": "来源表：dwd_production_fact · 刷新：日"
      },
      "tags": [
        "计划产量",
        "计划产量"
      ],
      "source_table": "dwd_production_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:计划达成率",
      "name": "计划达成率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "实际产量 / 计划产量 × 100%",
      "href": "architecture.html#dict/dws_production_daily",
      "detail": {
        "definition": "实际产量 / 计划产量 × 100%",
        "formula": "实际产量 / NULLIF(计划产量, 0) × 100",
        "notes": "来源表：dws_production_daily · 刷新：日"
      },
      "tags": [
        "计划达成率",
        "计划达成率"
      ],
      "source_table": "dws_production_daily",
      "crossRefs": [
        "tbl:dws_production_daily"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:工单完成率",
      "name": "工单完成率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "已完工工单 / 总开工工单 × 100%",
      "href": "architecture.html#dict/dws_order_daily",
      "detail": {
        "definition": "已完工工单 / 总开工工单 × 100%",
        "formula": "完工工单数 / NULLIF(开工工单数, 0) × 100",
        "notes": "来源表：dws_order_daily · 刷新：日"
      },
      "tags": [
        "工单完成率",
        "工单完成率"
      ],
      "source_table": "dws_order_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:wip_在制品数量",
      "name": "WIP 在制品数量",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "生产线上正在加工的在制品数量",
      "href": "architecture.html#dict/dwd_production_fact",
      "detail": {
        "definition": "生产线上正在加工的在制品数量",
        "formula": "SUM(在制数量) WHERE 工单状态=生产中",
        "notes": "来源表：dwd_production_fact · 刷新：实时/小时"
      },
      "tags": [
        "wip_在制品数量",
        "WIP 在制品数量"
      ],
      "source_table": "dwd_production_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:otd_准时交付率",
      "name": "OTD 准时交付率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "按承诺时间交付的订单占比",
      "href": "architecture.html#dict/dws_delivery_daily",
      "detail": {
        "definition": "按承诺时间交付的订单占比",
        "formula": "准时交付工单数 / 应交付总工单数 × 100",
        "notes": "来源表：dws_delivery_daily · 刷新：日/周"
      },
      "tags": [
        "otd_准时交付率",
        "OTD 准时交付率"
      ],
      "source_table": "dws_delivery_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:生产节拍",
      "name": "生产节拍",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "平均产出一件产品的时间",
      "href": "architecture.html#dict/dws_production_shift",
      "detail": {
        "definition": "平均产出一件产品的时间",
        "formula": "当班生产时长 / 当班产量",
        "notes": "来源表：dws_production_shift · 刷新：班/日"
      },
      "tags": [
        "生产节拍",
        "生产节拍"
      ],
      "source_table": "dws_production_shift",
      "crossRefs": [
        "dash:production"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:标准工时达成率",
      "name": "标准工时达成率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "标准工时 / 实际工时 × 100%",
      "href": "architecture.html#dict/dws_operation_daily",
      "detail": {
        "definition": "标准工时 / 实际工时 × 100%",
        "formula": "SUM(标准工时) / NULLIF(SUM(实际工时), 0) × 100",
        "notes": "来源表：dws_operation_daily · 刷新：日"
      },
      "tags": [
        "标准工时达成率",
        "标准工时达成率"
      ],
      "source_table": "dws_operation_daily",
      "crossRefs": [
        "pb:q24"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:人均产出",
      "name": "人均产出",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "平均每个工人每班产量",
      "href": "architecture.html#dict/dws_labor_daily",
      "detail": {
        "definition": "平均每个工人每班产量",
        "formula": "总产量 / 平均出勤人数",
        "notes": "来源表：dws_labor_daily · 刷新：班/日"
      },
      "tags": [
        "人均产出",
        "人均产出"
      ],
      "source_table": "dws_labor_daily",
      "crossRefs": [
        "pb:q24",
        "pb:q27",
        "pb:q34"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:工单周期",
      "name": "工单周期",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "工单从开工到完工的平均时长",
      "href": "architecture.html#dict/dwd_production_fact",
      "detail": {
        "definition": "工单从开工到完工的平均时长",
        "formula": "AVG(完工时间 - 开工时间)",
        "notes": "来源表：dwd_production_fact · 刷新：日"
      },
      "tags": [
        "工单周期",
        "工单周期"
      ],
      "source_table": "dwd_production_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:fpy_一次合格率",
      "name": "FPY 一次合格率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "第一次就合格的产品占比（不包含返工后合格）",
      "href": "architecture.html#dict/dwd_quality_fact",
      "detail": {
        "definition": "第一次就合格的产品占比（不包含返工后合格）",
        "formula": "一次合格数 / 总检验数 × 100",
        "notes": "来源表：dwd_quality_fact · 刷新：小时/日"
      },
      "tags": [
        "fpy_一次合格率",
        "FPY 一次合格率"
      ],
      "source_table": "dwd_quality_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:最终合格率",
      "name": "最终合格率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "最终合格产品占比（含返工后合格）",
      "href": "architecture.html#dict/dwd_quality_fact",
      "detail": {
        "definition": "最终合格产品占比（含返工后合格）",
        "formula": "最终合格数 / 总投入数 × 100",
        "notes": "来源表：dwd_quality_fact · 刷新：日"
      },
      "tags": [
        "最终合格率",
        "最终合格率"
      ],
      "source_table": "dwd_quality_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:不良率",
      "name": "不良率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "不良品占总检验数的比例",
      "href": "architecture.html#dict/dwd_quality_fact",
      "detail": {
        "definition": "不良品占总检验数的比例",
        "formula": "不良数 / 总检验数 × 100",
        "notes": "来源表：dwd_quality_fact · 刷新：小时/日"
      },
      "tags": [
        "不良率",
        "不良率"
      ],
      "source_table": "dwd_quality_fact",
      "crossRefs": [
        "pb:q43"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:返工率",
      "name": "返工率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "需要返工的产品占比",
      "href": "architecture.html#dict/dwd_quality_fact",
      "detail": {
        "definition": "需要返工的产品占比",
        "formula": "返工数 / 总检验数 × 100",
        "notes": "来源表：dwd_quality_fact · 刷新：日"
      },
      "tags": [
        "返工率",
        "返工率"
      ],
      "source_table": "dwd_quality_fact",
      "crossRefs": [
        "pb:q11",
        "dash:scrap-rework"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:报废率",
      "name": "报废率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "直接报废的产品占比",
      "href": "architecture.html#dict/dwd_quality_fact",
      "detail": {
        "definition": "直接报废的产品占比",
        "formula": "报废数 / 总投入数 × 100",
        "notes": "来源表：dwd_quality_fact · 刷新：日"
      },
      "tags": [
        "报废率",
        "报废率"
      ],
      "source_table": "dwd_quality_fact",
      "crossRefs": [
        "pb:q11",
        "dash:scrap-rework"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:质量损失成本",
      "name": "质量损失成本",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "不良、返工、报废造成的损失金额",
      "href": "architecture.html#dict/dws_quality_cost",
      "detail": {
        "definition": "不良、返工、报废造成的损失金额",
        "formula": "返工成本 + 报废成本 + 质量索赔",
        "notes": "来源表：dws_quality_cost · 刷新：日/月"
      },
      "tags": [
        "质量损失成本",
        "质量损失成本"
      ],
      "source_table": "dws_quality_cost",
      "crossRefs": [
        "dash:quality"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:柏拉图top3不良",
      "name": "柏拉图TOP3不良",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "占80%不良的前3种不良类型",
      "href": "architecture.html#dict/dws_defect_daily",
      "detail": {
        "definition": "占80%不良的前3种不良类型",
        "formula": "按不良数量降序，累计占比80%的前N类",
        "notes": "来源表：dws_defect_daily · 刷新：日/周"
      },
      "tags": [
        "柏拉图top3不良",
        "柏拉图TOP3不良"
      ],
      "source_table": "dws_defect_daily",
      "crossRefs": [
        "tbl:dws_defect_daily"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:spc_cpk_过程能力指数",
      "name": "SPC CPK 过程能力指数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "生产过程的稳定性能力",
      "href": "architecture.html#dict/dws_spc_analysis（规划中，未建表）",
      "detail": {
        "definition": "生产过程的稳定性能力",
        "formula": "(规格上限 - 规格下限) / (6×标准差)",
        "notes": "来源表：dws_spc_analysis（规划中，未建表） · 刷新：班/日"
      },
      "tags": [
        "spc_cpk_过程能力指数",
        "SPC CPK 过程能力指数"
      ],
      "source_table": "dws_spc_analysis（规划中，未建表）",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:客诉率",
      "name": "客诉率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "客户投诉订单占总交付订单比例",
      "href": "architecture.html#dict/dws_customer_quality",
      "detail": {
        "definition": "客户投诉订单占总交付订单比例",
        "formula": "客诉工单数 / 总交付工单数 × 10000 PPM",
        "notes": "来源表：dws_customer_quality · 刷新：月"
      },
      "tags": [
        "客诉率",
        "客诉率"
      ],
      "source_table": "dws_customer_quality",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_供应链与物料指标",
      "name": "供应链与物料指标",
      "type": "metric",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:来料合格率",
        "metric:inventory_value",
        "metric:inventory_turnover_days",
        "metric:原材料周转天数",
        "metric:成品周转天数",
        "metric:库存准确率",
        "metric:到货准时率",
        "metric:供应商准交率",
        "metric:缺料停线时长",
        "metric:bom准确率"
      ],
      "detail": {
        "definition": "供应链与物料指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:来料合格率",
      "name": "来料合格率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "来料检验合格的批次占比",
      "href": "architecture.html#dict/dws_incoming_quality",
      "detail": {
        "definition": "来料检验合格的批次占比",
        "formula": "合格批次 / 总检验批次 × 100",
        "notes": "来源表：dws_incoming_quality · 刷新：日/周"
      },
      "tags": [
        "来料合格率",
        "来料合格率"
      ],
      "source_table": "dws_incoming_quality",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_设备OEE指标",
      "name": "设备OEE指标",
      "type": "metric",
      "category": "manufacturing",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:oee_设备综合效率",
        "metric:可用率_availability",
        "metric:性能率_performance",
        "metric:质量率_quality",
        "metric:mtbf_平均故障间隔",
        "metric:mttr_平均修复时间",
        "metric:设备利用率",
        "metric:停机时长",
        "metric:故障停机占比"
      ],
      "detail": {
        "definition": "设备OEE指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:oee_设备综合效率",
      "name": "OEE 设备综合效率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "可用率 × 性能率 × 质量率",
      "href": "architecture.html#dict/dws_oee_daily",
      "detail": {
        "definition": "可用率 × 性能率 × 质量率",
        "formula": "availability * performance * quality",
        "notes": "来源表：dws_oee_daily · 刷新：小时/班/日"
      },
      "tags": [
        "oee_设备综合效率",
        "OEE 设备综合效率"
      ],
      "source_table": "dws_oee_daily",
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:可用率_availability",
      "name": "可用率 Availability",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "设备实际运行时间 / 计划生产时间",
      "href": "architecture.html#dict/dws_device_daily",
      "detail": {
        "definition": "设备实际运行时间 / 计划生产时间",
        "formula": "运行时间 / NULLIF(计划时间, 0) × 100",
        "notes": "来源表：dws_device_daily · 刷新：班/日"
      },
      "tags": [
        "可用率_availability",
        "可用率 Availability"
      ],
      "source_table": "dws_device_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:性能率_performance",
      "name": "性能率 Performance",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "实际产出 / 理论产出 × 100%",
      "href": "architecture.html#dict/dws_oee_daily",
      "detail": {
        "definition": "实际产出 / 理论产出 × 100%",
        "formula": "实际产量 / (运行时间 × 标准节拍) × 100",
        "notes": "来源表：dws_oee_daily · 刷新：班/日"
      },
      "tags": [
        "性能率_performance",
        "性能率 Performance"
      ],
      "source_table": "dws_oee_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:质量率_quality",
      "name": "质量率 Quality",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "合格产品 / 总产品 × 100%",
      "href": "architecture.html#dict/dws_oee_daily",
      "detail": {
        "definition": "合格产品 / 总产品 × 100%",
        "formula": "合格数 / NULLIF(总产量, 0) × 100",
        "notes": "来源表：dws_oee_daily · 刷新：班/日"
      },
      "tags": [
        "质量率_quality",
        "质量率 Quality"
      ],
      "source_table": "dws_oee_daily",
      "crossRefs": [
        "dash:quality"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:mtbf_平均故障间隔",
      "name": "MTBF 平均故障间隔",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "两次故障之间的平均运行时间",
      "href": "architecture.html#dict/dws_device_failure",
      "detail": {
        "definition": "两次故障之间的平均运行时间",
        "formula": "总运行时间 / 故障次数",
        "notes": "来源表：dws_device_failure · 刷新：周/月"
      },
      "tags": [
        "mtbf_平均故障间隔",
        "MTBF 平均故障间隔"
      ],
      "source_table": "dws_device_failure",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:mttr_平均修复时间",
      "name": "MTTR 平均修复时间",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "故障后平均修复恢复时间",
      "href": "architecture.html#dict/dws_device_failure",
      "detail": {
        "definition": "故障后平均修复恢复时间",
        "formula": "总修复时长 / 故障次数",
        "notes": "来源表：dws_device_failure · 刷新：周/月"
      },
      "tags": [
        "mttr_平均修复时间",
        "MTTR 平均修复时间"
      ],
      "source_table": "dws_device_failure",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:设备利用率",
      "name": "设备利用率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "设备实际运行时间 / 总日历时间",
      "href": "architecture.html#dict/dws_device_daily",
      "detail": {
        "definition": "设备实际运行时间 / 总日历时间",
        "formula": "运行时间 / 24小时 × 100",
        "notes": "来源表：dws_device_daily · 刷新：日"
      },
      "tags": [
        "设备利用率",
        "设备利用率"
      ],
      "source_table": "dws_device_daily",
      "crossRefs": [
        "dash:equipment"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:停机时长",
      "name": "停机时长",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "当日设备累计停机时间",
      "href": "architecture.html#dict/dwd_device_fact",
      "detail": {
        "definition": "当日设备累计停机时间",
        "formula": "SUM(停机时长)",
        "notes": "来源表：dwd_device_fact · 刷新：小时/日"
      },
      "tags": [
        "停机时长",
        "停机时长"
      ],
      "source_table": "dwd_device_fact",
      "crossRefs": [
        "pb:q16",
        "pb:q19",
        "dash:downtime"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:故障停机占比",
      "name": "故障停机占比",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_设备OEE指标",
      "description": "故障停机时间 / 总停机时间 × 100%",
      "href": "architecture.html#dict/dws_oee_daily",
      "detail": {
        "definition": "故障停机时间 / 总停机时间 × 100%",
        "formula": "故障停机时长 / NULLIF(总停机时长, 0) × 100",
        "notes": "来源表：dws_oee_daily · 刷新：日"
      },
      "tags": [
        "故障停机占比",
        "故障停机占比"
      ],
      "source_table": "dws_oee_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_value",
      "name": "库存金额",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "期末原材料+在制品+成品库存总金额",
      "href": "architecture.html#dict/dws_inventory_daily",
      "detail": {
        "definition": "期末原材料+在制品+成品库存总金额",
        "formula": "SUM(库存数量 × 单位成本)",
        "notes": "来源表：dws_inventory_daily · 刷新：日"
      },
      "tags": [
        "inventory_value",
        "库存金额"
      ],
      "source_table": "dws_inventory_daily",
      "crossRefs": [
        "pb:q25"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_turnover_days",
      "name": "库存周转天数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "库存平均多少天周转一次",
      "href": "architecture.html#dict/dws_inventory_monthly",
      "detail": {
        "definition": "库存平均多少天周转一次",
        "formula": "平均库存金额 / 当期销售成本 × 天数",
        "notes": "来源表：dws_inventory_monthly · 刷新：月"
      },
      "tags": [
        "inventory_turnover_days",
        "库存周转天数"
      ],
      "source_table": "dws_inventory_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:原材料周转天数",
      "name": "原材料周转天数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "原材料库存周转天数",
      "href": "architecture.html#dict/dws_material_monthly",
      "detail": {
        "definition": "原材料库存周转天数",
        "formula": "平均原材料库存 / 当期材料耗用 × 天数",
        "notes": "来源表：dws_material_monthly · 刷新：月"
      },
      "tags": [
        "原材料周转天数",
        "原材料周转天数"
      ],
      "source_table": "dws_material_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:成品周转天数",
      "name": "成品周转天数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "成品库存周转天数",
      "href": "architecture.html#dict/dws_finished_goods",
      "detail": {
        "definition": "成品库存周转天数",
        "formula": "平均成品库存 / 当期销售成本 × 天数",
        "notes": "来源表：dws_finished_goods · 刷新：月"
      },
      "tags": [
        "成品周转天数",
        "成品周转天数"
      ],
      "source_table": "dws_finished_goods",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:库存准确率",
      "name": "库存准确率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "账实一致的SKU占比",
      "href": "architecture.html#dict/dws_stocktake",
      "detail": {
        "definition": "账实一致的SKU占比",
        "formula": "盘点一致SKU数 / 总盘点SKU数 × 100",
        "notes": "来源表：dws_stocktake · 刷新：月/季"
      },
      "tags": [
        "库存准确率",
        "库存准确率"
      ],
      "source_table": "dws_stocktake",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:到货准时率",
      "name": "到货准时率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "供应商按约定时间到货的批次占比",
      "href": "architecture.html#dict/dws_purchase_daily",
      "detail": {
        "definition": "供应商按约定时间到货的批次占比",
        "formula": "准时到货批次 / 总到货批次 × 100",
        "notes": "来源表：dws_purchase_daily · 刷新：日/周"
      },
      "tags": [
        "到货准时率",
        "到货准时率"
      ],
      "source_table": "dws_purchase_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:供应商准交率",
      "name": "供应商准交率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "各供应商的准时交付率",
      "href": "architecture.html#dict/dws_supplier_score",
      "detail": {
        "definition": "各供应商的准时交付率",
        "formula": "准时交付数 / 应交付总数 × 100",
        "notes": "来源表：dws_supplier_score · 刷新：月"
      },
      "tags": [
        "供应商准交率",
        "供应商准交率"
      ],
      "source_table": "dws_supplier_score",
      "crossRefs": [
        "dash:supply",
        "dash:supplier-score"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:缺料停线时长",
      "name": "缺料停线时长",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "因缺料导致的生产线停机时间",
      "href": "architecture.html#dict/dws_device_fact",
      "detail": {
        "definition": "因缺料导致的生产线停机时间",
        "formula": "SUM(停机时长) WHERE 停机原因='缺料'",
        "notes": "来源表：dws_device_fact · 刷新：日/周"
      },
      "tags": [
        "缺料停线时长",
        "缺料停线时长"
      ],
      "source_table": "dws_device_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:bom准确率",
      "name": "BOM准确率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "物料清单准确率",
      "href": "architecture.html#dict/dim_bom",
      "detail": {
        "definition": "物料清单准确率",
        "formula": "正确BOM行数 / 总BOM行数 × 100",
        "notes": "来源表：dim_bom · 刷新：季度"
      },
      "tags": [
        "bom准确率",
        "BOM准确率"
      ],
      "source_table": "dim_bom",
      "crossRefs": [],
      "childrenIds": []
    }
  ],
  "edges": [
    {
      "source": "root_dashboard",
      "target": "cat_dashboard_all",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:production",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:delivery",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:quality",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:scrap-rework",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:process-yield",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:equipment",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:downtime",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:capacity",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:cost",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:supply",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:supplier-score",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:material",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:bom-variance",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:labor",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l1",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l2",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l3",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l4",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l5",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_methodology",
      "target": "cat_method_l6",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q01",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q02",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q03",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q04",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q05",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q06",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q07",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q08",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q09",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q10",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q11",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q12",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q13",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q14",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q15",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q16",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q17",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q18",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q19",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q20",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q21",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q22",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q23",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q24",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q25",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q26",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q27",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q28",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q29",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q30",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q31",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q32",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q33",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q34",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q35",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q36",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q37",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q38",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q39",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q40",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q41",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q42",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q43",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q44",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q45",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q46",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q47",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q48",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q49",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q50",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_warehouse",
      "target": "cat_wh_ods",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_warehouse",
      "target": "cat_wh_dim",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_warehouse",
      "target": "cat_wh_dwd",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_warehouse",
      "target": "cat_wh_dws",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_warehouse",
      "target": "cat_wh_ads",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_inventory_material",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_labor",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_material",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_production_line",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_production_order",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_quality_inspection",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_supplier",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_date",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_defect_type",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_equipment",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_factory",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_material",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_product",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_production_line",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_supplier",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_equipment_run",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_labor_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_production_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_quality_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_supply_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_equipment_run",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_labor",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_material_consumption",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_process_operation",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_production",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_quality",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:fact_supply",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_cost_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_defect_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_equipment_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_labor_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_material_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_production_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_quality_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_supply_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_capacity_utilization",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_cmei_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_cost_analysis",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_defect_analysis",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_equipment_oee",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_labor_efficiency",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_manufacturing_finance",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_material_turnover",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_production_overview",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_quality_analysis",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_supply_chain",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_质量指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:cmei_综合制造效能指数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_生产运营指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:当日产量",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:计划产量",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:计划达成率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "metric:计划达成率",
      "target": "tbl:dws_production_daily",
      "style": "dashed",
      "cross": true,
      "label": "来源表"
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:工单完成率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:wip_在制品数量",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:otd_准时交付率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:生产节拍",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:标准工时达成率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:人均产出",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_生产运营指标",
      "target": "metric:工单周期",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:fpy_一次合格率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:最终合格率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:不良率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:返工率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:报废率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:质量损失成本",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:柏拉图top3不良",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "metric:柏拉图top3不良",
      "target": "tbl:dws_defect_daily",
      "style": "dashed",
      "cross": true,
      "label": "来源表"
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:spc_cpk_过程能力指数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_质量指标",
      "target": "metric:客诉率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_供应链与物料指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:来料合格率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_设备OEE指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:oee_设备综合效率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:可用率_availability",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:性能率_performance",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:质量率_quality",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:mtbf_平均故障间隔",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:mttr_平均修复时间",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:设备利用率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:停机时长",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_设备OEE指标",
      "target": "metric:故障停机占比",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:inventory_value",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:inventory_turnover_days",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:原材料周转天数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:成品周转天数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:库存准确率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:到货准时率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:供应商准交率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:缺料停线时长",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_供应链与物料指标",
      "target": "metric:bom准确率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "pb:q01",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q03",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q05",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q06",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "metric:返工率",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q11",
      "target": "metric:报废率",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q11",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:scrap-rework",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q12",
      "target": "dash:delivery",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "dash:downtime",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q14",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q15",
      "target": "dash:bom-variance",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q16",
      "target": "metric:停机时长",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q16",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q16",
      "target": "dash:downtime",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q17",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q17",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:supplier-score",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q19",
      "target": "metric:停机时长",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q19",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q19",
      "target": "dash:downtime",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q20",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q20",
      "target": "dash:bom-variance",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:scrap-rework",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:process-yield",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q22",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q23",
      "target": "dash:delivery",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q24",
      "target": "metric:标准工时达成率",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q24",
      "target": "metric:人均产出",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q24",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q25",
      "target": "metric:inventory_value",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q25",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:scrap-rework",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q27",
      "target": "metric:人均产出",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q27",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q27",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "dash:bom-variance",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q29",
      "target": "dash:process-yield",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q29",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q31",
      "target": "dash:delivery",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q33",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q34",
      "target": "metric:人均产出",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q34",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q34",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q35",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q36",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q37",
      "target": "dash:bom-variance",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q38",
      "target": "dash:downtime",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q39",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q40",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q41",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q42",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q42",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q43",
      "target": "metric:不良率",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q43",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q43",
      "target": "dash:process-yield",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q44",
      "target": "dash:cost",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q45",
      "target": "dash:delivery",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q46",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q46",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q47",
      "target": "dash:delivery",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q48",
      "target": "dash:equipment",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q49",
      "target": "dash:labor",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q49",
      "target": "dash:production",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q50",
      "target": "dash:supply",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "dash:production",
      "target": "metric:生产节拍",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:quality",
      "target": "metric:质量损失成本",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:quality",
      "target": "metric:质量率_quality",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:scrap-rework",
      "target": "metric:返工率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:scrap-rework",
      "target": "metric:报废率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:equipment",
      "target": "metric:oee_设备综合效率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:equipment",
      "target": "metric:设备利用率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:downtime",
      "target": "metric:停机时长",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:supply",
      "target": "metric:供应商准交率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:supplier-score",
      "target": "metric:供应商准交率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    }
  ]
};
