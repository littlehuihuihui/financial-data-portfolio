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
      "nodes": 129,
      "edges": 173,
      "leaves": 109,
      "dashboards": 14,
      "playbooks": 26,
      "metrics": 39,
      "warehouseTables": 30
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
        "pb:q23"
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
        "pb:q21"
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
        "pb:q20"
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
        "pb:q20"
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
        "pb:q24"
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
        "pb:q20"
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
        "pb:q22"
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
        "pb:q23"
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
        "pb:q24"
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
        "pb:q26"
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
      "description": "产量、产能、良品率、成本、交付",
      "href": "methodology.html#playbook/q01",
      "detail": {
        "definition": "本月生产运营怎么样？",
        "notes": "产量、产能、良品率、成本、交付",
        "steps": []
      },
      "tags": [],
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
      "description": "各产线产量与产能利用率对比",
      "href": "methodology.html#playbook/q02",
      "detail": {
        "definition": "哪条产线表现最好？",
        "notes": "各产线产量与产能利用率对比",
        "steps": []
      },
      "tags": [],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q03",
      "name": "良品率下降诊断",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l2",
      "description": "拆产线→产品→不良类型→根因",
      "href": "methodology.html#playbook/q03",
      "detail": {
        "definition": "为什么良品率下降了？",
        "notes": "拆产线→产品→不良类型→根因",
        "steps": []
      },
      "tags": [],
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
      "description": "拆材料/人工/制造费用",
      "href": "methodology.html#playbook/q04",
      "detail": {
        "definition": "为什么单位成本涨了？",
        "notes": "拆材料/人工/制造费用",
        "steps": []
      },
      "tags": [],
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
      "description": "拆设备→故障类型→停机时长",
      "href": "methodology.html#playbook/q05",
      "detail": {
        "definition": "为什么设备老出问题？",
        "notes": "拆设备→故障类型→停机时长",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "metric:停机时长",
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
      "description": "基于历史产量+订单预测",
      "href": "methodology.html#playbook/q06",
      "detail": {
        "definition": "下月能产多少？",
        "notes": "基于历史产量+订单预测",
        "steps": []
      },
      "tags": [],
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
      "description": "各设备/产线OEE对比",
      "href": "methodology.html#playbook/q07",
      "detail": {
        "definition": "哪些设备最该优先改善？",
        "notes": "各设备/产线OEE对比",
        "steps": []
      },
      "tags": [],
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
      "description": "准时率+质量+价格综合评分",
      "href": "methodology.html#playbook/q08",
      "detail": {
        "definition": "哪家供应商最可靠？",
        "notes": "准时率+质量+价格综合评分",
        "steps": []
      },
      "tags": [],
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
      "description": "柏拉图定位TOP不良",
      "href": "methodology.html#playbook/q09",
      "detail": {
        "definition": "先改哪个不良？",
        "notes": "柏拉图定位TOP不良",
        "steps": []
      },
      "tags": [],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q10",
      "name": "生产计划优化",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l5",
      "description": "排产优化、减少换型",
      "href": "methodology.html#playbook/q10",
      "detail": {
        "definition": "如何提升产能利用率？",
        "notes": "排产优化、减少换型",
        "steps": []
      },
      "tags": [],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q11",
      "name": "质量总览",
      "type": "methodology",
      "category": "manufacturing",
      "parentId": "cat_method_l1",
      "description": "良品率、FPY、报废返工、TOP 不良",
      "href": "methodology.html#playbook/q11",
      "detail": {
        "definition": "本月质量状况怎么样？",
        "notes": "良品率、FPY、报废返工、TOP 不良",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
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
      "description": "OTIF/OTD、欠交、提前完工结构",
      "href": "methodology.html#playbook/q12",
      "detail": {
        "definition": "客户订单交付稳不稳？",
        "notes": "OTIF/OTD、欠交、提前完工结构",
        "steps": []
      },
      "tags": [],
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
      "description": "拆产线利用率→瓶颈工序→停机/换型损失",
      "href": "methodology.html#playbook/q13",
      "detail": {
        "definition": "为什么产能跟不上订单？",
        "notes": "拆产线利用率→瓶颈工序→停机/换型损失",
        "steps": []
      },
      "tags": [],
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
      "description": "拆供应商 OTD→物料齐套→产线停待",
      "href": "methodology.html#playbook/q14",
      "detail": {
        "definition": "为什么交期延误变多了？",
        "notes": "拆供应商 OTD→物料齐套→产线停待",
        "steps": []
      },
      "tags": [],
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
      "description": "按预测产量+BOM 推算关键件需求与安全库存",
      "href": "methodology.html#playbook/q15",
      "detail": {
        "definition": "下月关键物料要备多少？",
        "notes": "按预测产量+BOM 推算关键件需求与安全库存",
        "steps": []
      },
      "tags": [],
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
      "description": "用停机趋势+故障频次预测高风险设备",
      "href": "methodology.html#playbook/q16",
      "detail": {
        "definition": "哪些设备下月最可能出问题？",
        "notes": "用停机趋势+故障频次预测高风险设备",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
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
      "description": "爬坡良品率、单位成本、产能达成 vs 目标",
      "href": "methodology.html#playbook/q17",
      "detail": {
        "definition": "这款新品导入达标了吗？",
        "notes": "爬坡良品率、单位成本、产能达成 vs 目标",
        "steps": []
      },
      "tags": [],
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
      "description": "按评分卡调整份额、双源与淘汰",
      "href": "methodology.html#playbook/q18",
      "detail": {
        "definition": "采购份额怎么调更稳？",
        "notes": "按评分卡调整份额、双源与淘汰",
        "steps": []
      },
      "tags": [],
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
      "description": "OEE、可用率、停机时长、MTBF 快照",
      "href": "methodology.html#playbook/q19",
      "detail": {
        "definition": "本月设备运行状态怎么样？",
        "notes": "OEE、可用率、停机时长、MTBF 快照",
        "steps": []
      },
      "tags": [],
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
      "description": "单位成本、材料/人工/制费结构",
      "href": "methodology.html#playbook/q20",
      "detail": {
        "definition": "本月制造成本处在什么水平？",
        "notes": "单位成本、材料/人工/制费结构",
        "steps": []
      },
      "tags": [],
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
      "description": "拆产品→工序→不良类型→批次",
      "href": "methodology.html#playbook/q21",
      "detail": {
        "definition": "为什么报废/返工突然变多？",
        "notes": "拆产品→工序→不良类型→批次",
        "steps": []
      },
      "tags": [],
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
      "description": "拆工序 WIP→节拍→换型/停机",
      "href": "methodology.html#playbook/q22",
      "detail": {
        "definition": "为什么在制品堆这么多？",
        "notes": "拆工序 WIP→节拍→换型/停机",
        "steps": []
      },
      "tags": [],
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
      "description": "按在制进度+瓶颈产能预估能否按期",
      "href": "methodology.html#playbook/q23",
      "detail": {
        "definition": "哪些订单下周可能延期？",
        "notes": "按在制进度+瓶颈产能预估能否按期",
        "steps": []
      },
      "tags": [],
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
      "description": "人均产出、标准工时达成、加班结构",
      "href": "methodology.html#playbook/q24",
      "detail": {
        "definition": "人员效率达标了吗？哪班偏低？",
        "notes": "人均产出、标准工时达成、加班结构",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
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
      "description": "高周转/呆滞分层，调整安全库存与采购批量",
      "href": "methodology.html#playbook/q25",
      "detail": {
        "definition": "库存怎么压又不缺料？",
        "notes": "高周转/呆滞分层，调整安全库存与采购批量",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
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
      "description": "从遏制到永久措施与横展验证",
      "href": "methodology.html#playbook/q26",
      "detail": {
        "definition": "这起客诉怎么闭环不再发？",
        "notes": "从遏制到永久措施与横展验证",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:quality",
        "dash:scrap-rework"
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
        "tbl:ods_production_line"
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
        "tbl:dim_factory"
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
        "tbl:dwd_quality_wide"
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
        "tbl:v_quality_analysis"
      ],
      "detail": {
        "definition": "ADS 应用层"
      },
      "crossRefs": []
    },
    {
      "id": "tbl:ods_inventory_material",
      "name": "ods_inventory_material",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/ods_inventory_material",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_labor",
      "name": "ods_labor",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/ods_labor",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_material",
      "name": "ods_material",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/ods_material",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_production_line",
      "name": "ods_production_line",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/ods_production_line",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_date",
      "name": "dim_date",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dim_date",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_defect_type",
      "name": "dim_defect_type",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dim_defect_type",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_equipment",
      "name": "dim_equipment",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dim_equipment",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_factory",
      "name": "dim_factory",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dim_factory",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_equipment_run",
      "name": "dwd_equipment_run",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dwd_equipment_run",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_labor_wide",
      "name": "dwd_labor_wide",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dwd_labor_wide",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_production_wide",
      "name": "dwd_production_wide",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dwd_production_wide",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_quality_wide",
      "name": "dwd_quality_wide",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dwd_quality_wide",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_cost_monthly",
      "name": "dws_cost_monthly",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_cost_monthly",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_defect_daily",
      "name": "dws_defect_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_defect_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [
        "metric:柏拉图top3不良"
      ],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_equipment_daily",
      "name": "dws_equipment_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_equipment_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_labor_monthly",
      "name": "dws_labor_monthly",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_labor_monthly",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_material_daily",
      "name": "dws_material_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_material_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_production_daily",
      "name": "dws_production_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_production_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [
        "metric:计划达成率"
      ],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_quality_daily",
      "name": "dws_quality_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_quality_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_supply_daily",
      "name": "dws_supply_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/dws_supply_daily",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_capacity_utilization",
      "name": "v_capacity_utilization",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_capacity_utilization",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cmei_daily",
      "name": "v_cmei_daily",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_cmei_daily",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cost_analysis",
      "name": "v_cost_analysis",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_cost_analysis",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_defect_analysis",
      "name": "v_defect_analysis",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_defect_analysis",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_equipment_oee",
      "name": "v_equipment_oee",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_equipment_oee",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_labor_efficiency",
      "name": "v_labor_efficiency",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_labor_efficiency",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_manufacturing_finance",
      "name": "v_manufacturing_finance",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_manufacturing_finance",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_material_turnover",
      "name": "v_material_turnover",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_material_turnover",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_production_overview",
      "name": "v_production_overview",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_production_overview",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_quality_analysis",
      "name": "v_quality_analysis",
      "type": "warehouse",
      "category": "manufacturing",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "architecture.html#dw-graph-section",
      "dictHref": "dictionary.html#dict/v_quality_analysis",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；血缘见数仓血缘图"
      },
      "tags": [
        "ads"
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:人均产出",
      "name": "人均产出",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_生产运营指标",
      "description": "平均每个工人每班产量",
      "href": "dictionary.html",
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
        "pb:q24"
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:返工率",
      "name": "返工率",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_质量指标",
      "description": "需要返工的产品占比",
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
        "pb:q05",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_turnover_days",
      "name": "库存周转天数",
      "type": "metric",
      "category": "manufacturing",
      "parentId": "cat_metric_供应链与物料指标",
      "description": "库存平均多少天周转一次",
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "href": "dictionary.html",
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
      "target": "metric:停机时长",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
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
