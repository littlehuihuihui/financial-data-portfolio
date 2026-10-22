/** 平台知识图谱数据 · 自动生成 gen_platform_kg_data.py */
window.PLATFORM_KG_DATA = {
  "meta": {
    "industry": "retail",
    "industryName": "零售财务",
    "title": "零售财务 · 平台知识图谱",
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
      "nodes": 132,
      "edges": 190,
      "leaves": 114,
      "dashboards": 13,
      "playbooks": 31,
      "metrics": 35,
      "warehouseTables": 35
    }
  },
  "nodes": [
    {
      "id": "root_dashboard",
      "name": "看板",
      "type": "dashboard",
      "category": "retail",
      "categoryName": "零售财务",
      "description": "零售财务 · 看板",
      "isRoot": true,
      "icon": "📊",
      "childrenIds": [
        "cat_dashboard_all"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "零售财务平台「看板」模块入口"
      }
    },
    {
      "id": "root_methodology",
      "name": "分析方法",
      "type": "methodology",
      "category": "retail",
      "categoryName": "零售财务",
      "description": "零售财务 · 分析方法",
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
        "definition": "零售财务平台「分析方法」模块入口"
      }
    },
    {
      "id": "root_warehouse",
      "name": "五层数仓",
      "type": "warehouse",
      "category": "retail",
      "categoryName": "零售财务",
      "description": "零售财务 · 五层数仓",
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
        "definition": "零售财务平台「五层数仓」模块入口"
      }
    },
    {
      "id": "root_metric",
      "name": "指标",
      "type": "metric",
      "category": "retail",
      "categoryName": "零售财务",
      "description": "零售财务 · 指标",
      "isRoot": true,
      "icon": "📈",
      "childrenIds": [
        "cat_metric_核心财务指标",
        "cat_metric_业务运营指标"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "零售财务平台「指标」模块入口"
      }
    },
    {
      "id": "cat_dashboard_all",
      "name": "主题看板",
      "type": "dashboard",
      "category": "retail",
      "isCategory": true,
      "parentId": "root_dashboard",
      "childrenIds": [
        "dash:overview",
        "dash:brand",
        "dash:channel",
        "dash:financial",
        "dash:dupont",
        "dash:cashflow",
        "dash:tax",
        "dash:inventory",
        "dash:budget",
        "dash:store",
        "dash:profit-quality",
        "dash:cvp",
        "dash:quality"
      ],
      "detail": {
        "definition": "数据展示主题看板"
      },
      "crossRefs": []
    },
    {
      "id": "dash:overview",
      "name": "经营总览",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "8个核心KPI + 趋势 + 渠道占比 + 品牌排名 + 门店Top5",
      "href": "../retail_dashboard.html#overview",
      "detail": {
        "definition": "8个核心KPI + 趋势 + 渠道占比 + 品牌排名 + 门店Top5",
        "notes": "API: /api/dashboard_overview"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q01",
        "pb:q02",
        "pb:q03",
        "pb:q10",
        "pb:q11"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:brand",
      "name": "品牌分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "品牌KPI + 渠道占比 + 品类毛利率 + 趋势",
      "href": "../retail_dashboard.html#brand",
      "detail": {
        "definition": "品牌KPI + 渠道占比 + 品类毛利率 + 趋势",
        "notes": "API: /api/dashboard_brand"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q04"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:channel",
      "name": "渠道分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "渠道KPI + 日趋势 + 散点图 + 广告效率",
      "href": "../retail_dashboard.html#channel",
      "detail": {
        "definition": "渠道KPI + 日趋势 + 散点图 + 广告效率",
        "notes": "API: /api/dashboard_channel"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q05",
        "pb:q20",
        "metric:channel_sales",
        "metric:channel_share",
        "metric:channel_roi"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:financial",
      "name": "三大报表",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "利润表 + 资产负债表 + 现金流量表 + 三表勾稽",
      "href": "../retail_dashboard.html#financial",
      "detail": {
        "definition": "利润表 + 资产负债表 + 现金流量表 + 三表勾稽",
        "notes": "API: /api/dashboard_financial"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:dupont",
      "name": "杜邦分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "ROE拆解 + 同比归因 + 趋势 + 品牌对比",
      "href": "../retail_dashboard.html#dupont",
      "detail": {
        "definition": "ROE拆解 + 同比归因 + 趋势 + 品牌对比",
        "notes": "API: /api/dashboard_dupont"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q01",
        "pb:q04",
        "pb:q09"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:cashflow",
      "name": "现金流分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "三类型现金流 + 净现比 + 差异拆解 + 资金缺口",
      "href": "../retail_dashboard.html#cashflow",
      "detail": {
        "definition": "三类型现金流 + 净现比 + 差异拆解 + 资金缺口",
        "notes": "API: /api/dashboard_cashflow"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q01",
        "pb:q14",
        "pb:q19",
        "metric:cash_conversion_cycle"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:tax",
      "name": "税务分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "税负KPI + 行业对比 + 风险预警",
      "href": "../retail_dashboard.html#tax",
      "detail": {
        "definition": "税负KPI + 行业对比 + 风险预警",
        "notes": "API: /api/dashboard_tax"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:inventory",
      "name": "库存分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "库存KPI + 库龄结构 + 周转对比 + 滞销SKU",
      "href": "../retail_dashboard.html#inventory",
      "detail": {
        "definition": "库存KPI + 库龄结构 + 周转对比 + 滞销SKU",
        "notes": "API: /api/dashboard_inventory"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q06",
        "pb:q14",
        "pb:q15",
        "pb:q26",
        "pb:q31",
        "metric:inventory_value",
        "metric:inventory_turnover_days",
        "metric:inventory_turnover_ratio"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:budget",
      "name": "预算执行",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "渠道/品牌预算达成 + 超预算预警 + 费用明细",
      "href": "../retail_dashboard.html#budget",
      "detail": {
        "definition": "渠道/品牌预算达成 + 超预算预警 + 费用明细",
        "notes": "API: /api/dashboard_budget"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q02",
        "pb:q11",
        "pb:q18"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:store",
      "name": "门店分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "门店KPI + Top10排名 + 健康度散点 + 异常预警",
      "href": "../retail_dashboard.html#store",
      "detail": {
        "definition": "门店KPI + Top10排名 + 健康度散点 + 异常预警",
        "notes": "API: /api/dashboard_store"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q07",
        "pb:q24"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:profit-quality",
      "name": "利润质量",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "净现比 + 利润vs现金流 + 差异拆解",
      "href": "../retail_dashboard.html#profit-quality",
      "detail": {
        "definition": "净现比 + 利润vs现金流 + 差异拆解",
        "notes": "API: /api/dashboard_profit_quality"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:cvp",
      "name": "本量利分析",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "盈亏平衡 + 安全边际 + 敏感性分析",
      "href": "../retail_dashboard.html#cvp",
      "detail": {
        "definition": "盈亏平衡 + 安全边际 + 敏感性分析",
        "notes": "API: /api/dashboard_cvp"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:quality",
      "name": "数据质量监控大盘",
      "type": "dashboard",
      "category": "retail",
      "parentId": "cat_dashboard_all",
      "description": "DQC门禁 · 每日阻断量 · 脏数据分布 · 对账（数据基建）",
      "href": "../retail_dashboard.html#quality",
      "detail": {
        "definition": "DQC门禁 · 每日阻断量 · 脏数据分布 · 对账（数据基建）",
        "notes": "API: /api/dashboard_quality"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_method_l1",
      "name": "L1 描述",
      "type": "methodology",
      "category": "retail",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q01",
        "pb:q02",
        "pb:q03",
        "pb:q04",
        "pb:q05",
        "pb:q06",
        "pb:q07"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q08",
        "pb:q09",
        "pb:q10",
        "pb:q11",
        "pb:q12",
        "pb:q13",
        "pb:q14",
        "pb:q15"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q16",
        "pb:q17",
        "pb:q18",
        "pb:q19",
        "pb:q20"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q21",
        "pb:q22",
        "pb:q23",
        "pb:q24",
        "pb:q25",
        "pb:q26"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q27",
        "pb:q28",
        "pb:q29",
        "pb:q30",
        "pb:q31"
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
      "category": "retail",
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
      "name": "月度经营概况",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "月度经营概况看四类指标：规模（GMV/净收入）、盈利（毛利/毛利率）、退货（退货率）、现金（净现比）。四类指标分别回答\"卖了多少、赚了多少、退了多少、现金回来没有\"。",
      "href": "anomaly.html#q01",
      "detail": {
        "definition": "这个月业绩怎么样？",
        "notes": "月度经营概况看四类指标：规模（GMV/净收入）、盈利（毛利/毛利率）、退货（退货率）、现金（净现比）。四类指标分别回答\"卖了多少、赚了多少、退了多少、现金回来没有\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "月度",
        "GMV",
        "收入",
        "毛利",
        "净现比",
        "ROE"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin",
        "dash:overview",
        "dash:dupont",
        "dash:cashflow"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q02",
      "name": "年度累计经营概况",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "YTD 看四类：累计规模（GMV/净收入/毛利）、同比增速、预算执行进度、资产负债结构。四类分别回答\"累计做了多少、比去年好还是差、预算花超没超、家底健康不健康\"。",
      "href": "anomaly.html#q02",
      "detail": {
        "definition": "今年到目前为止怎么样了？",
        "notes": "YTD 看四类：累计规模（GMV/净收入/毛利）、同比增速、预算执行进度、资产负债结构。四类分别回答\"累计做了多少、比去年好还是差、预算花超没超、家底健康不健康\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "YTD",
        "累计",
        "预算",
        "达成率",
        "资产负债率"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "dash:overview",
        "dash:budget"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q03",
      "name": "单日经营简报",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "单日看四类：当日规模（GMV/净收入/订单）、波动（vs 近 7 日/30 日均值）、渠道贡献（哪个渠道拉动或拖累）、现金进出（当日净现金流）。",
      "href": "anomaly.html#q03",
      "detail": {
        "definition": "昨天卖了多少？",
        "notes": "单日看四类：当日规模（GMV/净收入/订单）、波动（vs 近 7 日/30 日均值）、渠道贡献（哪个渠道拉动或拖累）、现金进出（当日净现金流）。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "日报",
        "GMV",
        "订单",
        "退货",
        "7日均值"
      ],
      "crossRefs": [
        "dash:overview"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q04",
      "name": "各品牌表现排名",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "品牌排名看四类：规模（收入/毛利）、效率（毛利率）、增速（环比）、综合表现（ROE 拖累项）。四类分别回答\"谁卖得多、谁赚得多、谁在掉队、谁的盈利质量在恶化\"。",
      "href": "anomaly.html#q04",
      "detail": {
        "definition": "哪个品牌卖得好？哪个品牌在掉队？",
        "notes": "品牌排名看四类：规模（收入/毛利）、效率（毛利率）、增速（环比）、综合表现（ROE 拖累项）。四类分别回答\"谁卖得多、谁赚得多、谁在掉队、谁的盈利质量在恶化\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "品牌",
        "排名",
        "集中度",
        "帕累托",
        "ROE"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin",
        "dash:brand",
        "dash:dupont"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q05",
      "name": "各渠道表现排名",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "渠道排名看四类：规模（收入/毛利）、效率（毛利率/费用率）、ROI（广告投入产出）、集中度（单渠道占比）。四类分别回答\"哪个渠道大、哪个渠道赚、哪个渠道投放划算、是否过度依赖单一渠道\"。",
      "href": "anomaly.html#q05",
      "detail": {
        "definition": "哪个渠道最赚钱？哪个渠道在烧钱？",
        "notes": "渠道排名看四类：规模（收入/毛利）、效率（毛利率/费用率）、ROI（广告投入产出）、集中度（单渠道占比）。四类分别回答\"哪个渠道大、哪个渠道赚、哪个渠道投放划算、是否过度依赖单一渠道\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "渠道",
        "费用率",
        "广告ROI",
        "集中度"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin",
        "metric:expense_ratio",
        "metric:channel_share",
        "dash:channel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q06",
      "name": "各品类表现排名",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "品类排名看四类：规模（收入/毛利）、效率（毛利率/收入占比 vs 毛利占比匹配度）、退货（退货率）、库存（周转天数）。四类分别回答\"哪个品类大、哪个品类赚、哪个品类退货多、哪个品类压货\"。",
      "href": "anomaly.html#q06",
      "detail": {
        "definition": "哪个品类是现金牛？哪个品类在拖累？",
        "notes": "品类排名看四类：规模（收入/毛利）、效率（毛利率/收入占比 vs 毛利占比匹配度）、退货（退货率）、库存（周转天数）。四类分别回答\"哪个品类大、哪个品类赚、哪个品类退货多、哪个品类压货\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "品类",
        "退货",
        "周转",
        "长尾"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q07",
      "name": "各门店表现排名",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l1",
      "description": "门店排名看四类：规模（收入/利润）、效率（坪效）、波动（vs 7 日/30 日均值）、异常（亏损、低坪效）。四类分别回答\"哪家店大、哪家店赚、哪家店在掉、哪家店该关\"。",
      "href": "anomaly.html#q07",
      "detail": {
        "definition": "哪家店是标杆？哪家店该关？",
        "notes": "门店排名看四类：规模（收入/利润）、效率（坪效）、波动（vs 7 日/30 日均值）、异常（亏损、低坪效）。四类分别回答\"哪家店大、哪家店赚、哪家店在掉、哪家店该关\"。",
        "steps": [
          "前置检查",
          "核心指标框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判"
        ]
      },
      "tags": [
        "门店",
        "坪效",
        "关停",
        "区域"
      ],
      "crossRefs": [
        "metric:sales_per_sqm",
        "dash:store"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q08",
      "name": "毛利率下滑诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "毛利率下降不是单一原因，而是四类效应叠加。诊断的第一步不是拆品牌，而是先判断\"哪类效应在拖后腿\"：",
      "href": "anomaly.html#q08",
      "detail": {
        "definition": "毛利率为什么下降了？是成本、定价、结构还是退货导致？",
        "notes": "毛利率下降不是单一原因，而是四类效应叠加。诊断的第一步不是拆品牌，而是先判断\"哪类效应在拖后腿\"：",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "毛利率",
        "成本",
        "定价",
        "结构",
        "退货"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q09",
      "name": "净利润下滑诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "净利润变化 = 收入规模效应 + 毛利率效应 + 费用率效应 + 交互项",
      "href": "anomaly.html#q09",
      "detail": {
        "definition": "净利润为什么少了？是收入、毛利还是费用拖累？",
        "notes": "净利润变化 = 收入规模效应 + 毛利率效应 + 费用率效应 + 交互项",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "净利润",
        "费用",
        "杜邦",
        "利润率"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "metric:gross_margin",
        "metric:expense_ratio",
        "metric:net_profit",
        "dash:dupont"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q10",
      "name": "收入下滑诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "收入变化 = 量效应 + 价效应 + 结构效应",
      "href": "anomaly.html#q10",
      "detail": {
        "definition": "收入为什么下降了？是量的问题、价的问题，还是某个维度拖累？",
        "notes": "收入变化 = 量效应 + 价效应 + 结构效应",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "收入",
        "量价",
        "贡献度",
        "结构"
      ],
      "crossRefs": [
        "dash:overview"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q11",
      "name": "收入增长缓慢诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "增长缺口 = 主力品牌/渠道拖累 + 新增长点不足 + 效率下降",
      "href": "anomaly.html#q11",
      "detail": {
        "definition": "收入增长为什么这么慢？瓶颈在哪？",
        "notes": "增长缺口 = 主力品牌/渠道拖累 + 新增长点不足 + 效率下降",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "增速",
        "增长缺口",
        "主力",
        "新增长点"
      ],
      "crossRefs": [
        "dash:overview",
        "dash:budget"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q12",
      "name": "退货率异常诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "整体退货率变化 = 结构效应 + 单品类退货率变化效应",
      "href": "anomaly.html#q12",
      "detail": {
        "definition": "退货率为什么突然升高？是品类、渠道还是品控问题？",
        "notes": "整体退货率变化 = 结构效应 + 单品类退货率变化效应",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "退货率",
        "结构效应",
        "品控",
        "尺码"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q13",
      "name": "费用率异常诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "费用率变化 = 费用结构效应 + 单科目费用率变化效应 + 收入分母效应",
      "href": "anomaly.html#q13",
      "detail": {
        "definition": "费用率为什么高了？哪个科目、哪个渠道超支？",
        "notes": "费用率变化 = 费用结构效应 + 单科目费用率变化效应 + 收入分母效应",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "费用率",
        "预算执行",
        "科目",
        "收入分母"
      ],
      "crossRefs": [
        "metric:expense_ratio"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q14",
      "name": "净现比下降诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "净现比下降 = 利润质量效应 + 营运资本占用效应 + 非经常性项目效应",
      "href": "anomaly.html#q14",
      "detail": {
        "definition": "为什么有利润但现金紧张？净现比为什么下降？",
        "notes": "净现比下降 = 利润质量效应 + 营运资本占用效应 + 非经常性项目效应",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "净现比",
        "营运资本",
        "现金流",
        "利润质量"
      ],
      "crossRefs": [
        "dash:cashflow",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q15",
      "name": "库存周转天数上升诊断",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l2",
      "description": "周转天数变化 = 库存规模效应 + 销售规模效应 + 结构效应",
      "href": "anomaly.html#q15",
      "detail": {
        "definition": "库存为什么越压越多、周转越来越慢？",
        "notes": "周转天数变化 = 库存规模效应 + 销售规模效应 + 结构效应",
        "steps": [
          "因果分解框架",
          "决策树",
          "行动建议",
          "最小判断法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "库存周转",
        "滞销",
        "销存匹配",
        "结构效应"
      ],
      "crossRefs": [
        "metric:inventory_turnover_days",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q16",
      "name": "下月收入预测",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l3",
      "description": "下月收入预测 = 基线预测 × 季节因子 + 趋势修正 + 外生修正",
      "href": "anomaly.html#q16",
      "detail": {
        "definition": "下个月大概能卖多少？区间是多少？",
        "notes": "下月收入预测 = 基线预测 × 季节因子 + 趋势修正 + 外生修正",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "判断与区间",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "预测",
        "下月",
        "MA3",
        "季节因子",
        "MAPE"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q17",
      "name": "下季度品牌/品类收入预测",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l3",
      "description": "下季度品牌/品类预测 = 品牌/品类基线 × 季节因子 × 趋势修正",
      "href": "anomaly.html#q17",
      "detail": {
        "definition": "下季度各品牌/品类分别能卖多少？",
        "notes": "下季度品牌/品类预测 = 品牌/品类基线 × 季节因子 × 趋势修正",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "判断与区间",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "季度",
        "品牌",
        "品类",
        "季节因子",
        "MAPE"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q18",
      "name": "年底目标达成预测",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l3",
      "description": "年底目标达成预测 = YTD 累计 + 剩余月份预测",
      "href": "anomaly.html#q18",
      "detail": {
        "definition": "年底目标还能完成吗？差多少？",
        "notes": "年底目标达成预测 = YTD 累计 + 剩余月份预测",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "判断与区间",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "YTD",
        "目标",
        "剩余月均",
        "达成率"
      ],
      "crossRefs": [
        "dash:budget"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q19",
      "name": "资金缺口预测",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l3",
      "description": "资金缺口 = 未来流入预测 - 未来流出预测 - 当前现金",
      "href": "anomaly.html#q19",
      "detail": {
        "definition": "未来会不会缺钱？缺口有多大？",
        "notes": "资金缺口 = 未来流入预测 - 未来流出预测 - 当前现金",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "判断与区间",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "资金缺口",
        "现金流",
        "流出",
        "净现比"
      ],
      "crossRefs": [
        "dash:cashflow"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q20",
      "name": "渠道 ROI 持续下降预警",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l3",
      "description": "渠道 ROI 持续下降预警 = 滑动窗口 ROI 趋势 + 连续下降判断 + 减投建议",
      "href": "anomaly.html#q20",
      "detail": {
        "definition": "哪个渠道投放越来越不划算？",
        "notes": "渠道 ROI 持续下降预警 = 滑动窗口 ROI 趋势 + 连续下降判断 + 减投建议",
        "steps": [
          "前置检查",
          "预测方法框架",
          "预测步骤",
          "判断与区间",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "渠道ROI",
        "广告",
        "减投",
        "连续下降"
      ],
      "crossRefs": [
        "metric:channel_roi",
        "dash:channel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q21",
      "name": "营销活动ROI评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "活动 ROI 评估 = 增量毛利 / 活动总投入（F26 基线 + F27 效应量）",
      "href": "anomaly.html#q21",
      "detail": {
        "definition": "这场活动值不值得？ROI 多少？",
        "notes": "活动 ROI 评估 = 增量毛利 / 活动总投入（F26 基线 + F27 效应量）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "营销",
        "活动",
        "ROI",
        "评估"
      ],
      "crossRefs": [
        "metric:gross_profit"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q22",
      "name": "渠道投入产出评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "渠道投入产出 = 渠道产出毛利 − 全口径投入（广告+平台佣金+运营分摊）",
      "href": "anomaly.html#q22",
      "detail": {
        "definition": "这个渠道还值得继续投吗？",
        "notes": "渠道投入产出 = 渠道产出毛利 − 全口径投入（广告+平台佣金+运营分摊）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "渠道",
        "投入",
        "产出",
        "评估"
      ],
      "crossRefs": [
        "metric:gross_profit"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q23",
      "name": "促销活动效果评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "促销效果评估 = 促销期 vs 非促销期对比 + 透支检测（F26/F27）",
      "href": "anomaly.html#q23",
      "detail": {
        "definition": "这次促销拉动了多少销量？有没有亏毛利？",
        "notes": "促销效果评估 = 促销期 vs 非促销期对比 + 透支检测（F26/F27）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "促销",
        "折扣",
        "效果",
        "毛利"
      ],
      "crossRefs": [
        "metric:gross_profit"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q24",
      "name": "门店关停评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "门店关停评估 = 90 日表现 + 区域对比 + 关停盈亏（F28/F29）",
      "href": "anomaly.html#q24",
      "detail": {
        "definition": "这家店要不要关？关了能省多少钱？",
        "notes": "门店关停评估 = 90 日表现 + 区域对比 + 关停盈亏（F28/F29）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "门店",
        "关停",
        "坪效",
        "亏损"
      ],
      "crossRefs": [
        "metric:sales_per_sqm",
        "dash:store"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q25",
      "name": "供应商绩效评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "供应商绩效 = 交付准时率 + 质量退货 + 采购价趋势 + 综合评分（F28/F30）",
      "href": "anomaly.html#q25",
      "detail": {
        "definition": "这个供应商表现怎么样？要不要换？",
        "notes": "供应商绩效 = 交付准时率 + 质量退货 + 采购价趋势 + 综合评分（F28/F30）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "供应商",
        "采购",
        "交付",
        "质量"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q26",
      "name": "新品表现评估",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l4",
      "description": "新品表现 = 动销 + 毛利/退货 + 库存周转 + 追单/下架决策（F29/F30）",
      "href": "anomaly.html#q26",
      "detail": {
        "definition": "新品卖得好不好？要不要追单/下架？",
        "notes": "新品表现 = 动销 + 毛利/退货 + 库存周转 + 追单/下架决策（F29/F30）",
        "steps": [
          "评估框架",
          "决策树",
          "行动建议",
          "最小评估法",
          "常见误判",
          "附录指引"
        ]
      },
      "tags": [
        "新品",
        "上市",
        "动销",
        "追单"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q27",
      "name": "预算分配优化",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l5",
      "description": "预算分配优化 = 在总预算约束下，按边际 ROI 倾斜，同时满足依赖度与战略约束",
      "href": "anomaly.html#q27",
      "detail": {
        "definition": "下季度预算应该怎么分？加投哪个、收缩哪个、加多少？",
        "notes": "预算分配优化 = 在总预算约束下，按边际 ROI 倾斜，同时满足依赖度与战略约束",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "预算",
        "分配",
        "边际ROI",
        "约束"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "pb:q28",
      "name": "营销费用优化",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l5",
      "description": "营销费用优化 = 在收入目标约束下，优化费用结构与渠道投放",
      "href": "anomaly.html#q28",
      "detail": {
        "definition": "营销费怎么花更划算？减哪里、加哪里、减多少？",
        "notes": "营销费用优化 = 在收入目标约束下，优化费用结构与渠道投放",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "营销费用",
        "边际弹性",
        "渠道ROI"
      ],
      "crossRefs": [
        "metric:channel_roi"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q29",
      "name": "定价优化分析",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l5",
      "description": "定价优化 = 在毛利与销量约束下，找最优价格带",
      "href": "anomaly.html#q29",
      "detail": {
        "definition": "价格定高了还是低了？怎么调价？",
        "notes": "定价优化 = 在毛利与销量约束下，找最优价格带",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "定价",
        "价格弹性",
        "四象限"
      ],
      "crossRefs": [
        "metric:gross_profit"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q30",
      "name": "折扣策略优化",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l5",
      "description": "折扣策略优化 = 在毛利约束下，优化折扣深度、频率与品类范围",
      "href": "anomaly.html#q30",
      "detail": {
        "definition": "折扣怎么打才能既走量又不亏？",
        "notes": "折扣策略优化 = 在毛利约束下，优化折扣深度、频率与品类范围",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "折扣",
        "弹性",
        "毛利",
        "透支"
      ],
      "crossRefs": [
        "metric:gross_profit"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q31",
      "name": "库存清仓优化",
      "type": "methodology",
      "category": "retail",
      "parentId": "cat_method_l5",
      "description": "库存清仓优化 = 在毛利约束下，优化折扣深度、渠道与节奏，最大化现金回收",
      "href": "anomaly.html#q31",
      "detail": {
        "definition": "滞销库存怎么清？打几折能清掉？现金能回收多少？",
        "notes": "库存清仓优化 = 在毛利约束下，优化折扣深度、渠道与节奏，最大化现金回收",
        "steps": [
          "前置检查",
          "优化框架",
          "优化步骤",
          "判断与方案",
          "回测校验",
          "情景与假设"
        ]
      },
      "tags": [
        "清仓",
        "滞销",
        "现金回收",
        "折扣"
      ],
      "crossRefs": [
        "metric:gross_profit",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_wh_ods",
      "name": "ODS 贴源层",
      "type": "warehouse",
      "category": "retail",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:ods_payment",
        "tbl:ods_purchase",
        "tbl:ods_inventory",
        "tbl:ods_expense",
        "tbl:ods_store_pnl",
        "tbl:ods_ad_cost",
        "tbl:ods_budget"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dim_brand",
        "tbl:dim_channel",
        "tbl:dim_category",
        "tbl:dim_store",
        "tbl:dim_date"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dwd_sales_wide",
        "tbl:dwd_expense_wide",
        "tbl:dwd_inventory_wide"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dws_sales_daily",
        "tbl:dws_sales_monthly",
        "tbl:dws_expense_monthly",
        "tbl:dws_inventory_daily",
        "tbl:dws_store_daily",
        "tbl:dws_asset_monthly",
        "tbl:dws_cashflow_monthly",
        "tbl:dws_tax_monthly",
        "tbl:dws_budget_monthly"
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
      "category": "retail",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:v_overview",
        "tbl:v_brand",
        "tbl:v_channel",
        "tbl:v_income_statement",
        "tbl:v_dupont",
        "tbl:v_balance_sheet",
        "tbl:v_cashflow",
        "tbl:v_cashflow_statement",
        "tbl:v_tax_analysis",
        "tbl:v_budget",
        "tbl:v_inventory"
      ],
      "detail": {
        "definition": "ADS 应用层"
      },
      "crossRefs": []
    },
    {
      "id": "tbl:ods_payment",
      "name": "ods_payment",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "支付流水表",
      "aliases": [
        "支付流水表"
      ],
      "href": "platform-graph.html?node=tbl:ods_payment",
      "dictHref": "architecture.html#dict/ods_payment",
      "detail": {
        "definition": "支付流水表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_purchase",
      "name": "ods_purchase",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "采购表",
      "aliases": [
        "采购表"
      ],
      "href": "platform-graph.html?node=tbl:ods_purchase",
      "dictHref": "architecture.html#dict/ods_purchase",
      "detail": {
        "definition": "采购表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_inventory",
      "name": "ods_inventory",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "库存流水表",
      "aliases": [
        "库存流水表"
      ],
      "href": "platform-graph.html?node=tbl:ods_inventory",
      "dictHref": "architecture.html#dict/ods_inventory",
      "detail": {
        "definition": "库存流水表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_expense",
      "name": "ods_expense",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "费用表",
      "aliases": [
        "费用表"
      ],
      "href": "platform-graph.html?node=tbl:ods_expense",
      "dictHref": "architecture.html#dict/ods_expense",
      "detail": {
        "definition": "费用表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_store_pnl",
      "name": "ods_store_pnl",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "门店损益表",
      "aliases": [
        "门店损益表"
      ],
      "href": "platform-graph.html?node=tbl:ods_store_pnl",
      "dictHref": "architecture.html#dict/ods_store_pnl",
      "detail": {
        "definition": "门店损益表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_ad_cost",
      "name": "ods_ad_cost",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "广告费用表",
      "aliases": [
        "广告费用表"
      ],
      "href": "platform-graph.html?node=tbl:ods_ad_cost",
      "dictHref": "architecture.html#dict/ods_ad_cost",
      "detail": {
        "definition": "广告费用表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_budget",
      "name": "ods_budget",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ods",
      "description": "预算表",
      "aliases": [
        "预算表"
      ],
      "href": "platform-graph.html?node=tbl:ods_budget",
      "dictHref": "architecture.html#dict/ods_budget",
      "detail": {
        "definition": "预算表",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_brand",
      "name": "dim_brand",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dim",
      "description": "品牌维度表",
      "aliases": [
        "品牌维度表"
      ],
      "href": "platform-graph.html?node=tbl:dim_brand",
      "dictHref": "architecture.html#dict/dim_brand",
      "detail": {
        "definition": "品牌维度表",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_channel",
      "name": "dim_channel",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dim",
      "description": "渠道维度表",
      "aliases": [
        "渠道维度表"
      ],
      "href": "platform-graph.html?node=tbl:dim_channel",
      "dictHref": "architecture.html#dict/dim_channel",
      "detail": {
        "definition": "渠道维度表",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_category",
      "name": "dim_category",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dim",
      "description": "品类维度表",
      "aliases": [
        "品类维度表"
      ],
      "href": "platform-graph.html?node=tbl:dim_category",
      "dictHref": "architecture.html#dict/dim_category",
      "detail": {
        "definition": "品类维度表",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_store",
      "name": "dim_store",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dim",
      "description": "门店维度表",
      "aliases": [
        "门店维度表"
      ],
      "href": "platform-graph.html?node=tbl:dim_store",
      "dictHref": "architecture.html#dict/dim_store",
      "detail": {
        "definition": "门店维度表",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_date",
      "name": "dim_date",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dim",
      "description": "日期维度表",
      "aliases": [
        "日期维度表"
      ],
      "href": "platform-graph.html?node=tbl:dim_date",
      "dictHref": "architecture.html#dict/dim_date",
      "detail": {
        "definition": "日期维度表",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_sales_wide",
      "name": "dwd_sales_wide",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dwd",
      "description": "销售宽表",
      "aliases": [
        "销售宽表"
      ],
      "href": "platform-graph.html?node=tbl:dwd_sales_wide",
      "dictHref": "architecture.html#dict/dwd_sales_wide",
      "detail": {
        "definition": "销售宽表",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_expense_wide",
      "name": "dwd_expense_wide",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dwd",
      "description": "费用宽表",
      "aliases": [
        "费用宽表"
      ],
      "href": "platform-graph.html?node=tbl:dwd_expense_wide",
      "dictHref": "architecture.html#dict/dwd_expense_wide",
      "detail": {
        "definition": "费用宽表",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_inventory_wide",
      "name": "dwd_inventory_wide",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dwd",
      "description": "库存宽表",
      "aliases": [
        "库存宽表"
      ],
      "href": "platform-graph.html?node=tbl:dwd_inventory_wide",
      "dictHref": "architecture.html#dict/dwd_inventory_wide",
      "detail": {
        "definition": "库存宽表",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_sales_daily",
      "name": "dws_sales_daily",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "日销售汇总",
      "aliases": [
        "日销售汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_sales_daily",
      "dictHref": "architecture.html#dict/dws_sales_daily",
      "detail": {
        "definition": "日销售汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_sales_monthly",
      "name": "dws_sales_monthly",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "月销售汇总",
      "aliases": [
        "月销售汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_sales_monthly",
      "dictHref": "architecture.html#dict/dws_sales_monthly",
      "detail": {
        "definition": "月销售汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_expense_monthly",
      "name": "dws_expense_monthly",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "月费用汇总",
      "aliases": [
        "月费用汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_expense_monthly",
      "dictHref": "architecture.html#dict/dws_expense_monthly",
      "detail": {
        "definition": "月费用汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_inventory_daily",
      "name": "dws_inventory_daily",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "日库存汇总",
      "aliases": [
        "日库存汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_inventory_daily",
      "dictHref": "architecture.html#dict/dws_inventory_daily",
      "detail": {
        "definition": "日库存汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [
        "metric:inventory_value"
      ],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_store_daily",
      "name": "dws_store_daily",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "日门店汇总·快照表",
      "aliases": [
        "日门店汇总·快照表"
      ],
      "href": "platform-graph.html?node=tbl:dws_store_daily",
      "dictHref": "architecture.html#dict/dws_store_daily",
      "detail": {
        "definition": "日门店汇总·快照表",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_asset_monthly",
      "name": "dws_asset_monthly",
      "name_cn": "资产月汇总",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "资产月汇总",
      "aliases": [
        "资产月汇总",
        "资产/负债月汇总（资产负债表上游）"
      ],
      "href": "platform-graph.html?node=tbl:dws_asset_monthly",
      "dictHref": "architecture.html#dict/dws_asset_monthly",
      "detail": {
        "definition": "资产/负债月汇总（资产负债表上游）",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "资产月汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_cashflow_monthly",
      "name": "dws_cashflow_monthly",
      "name_cn": "现金流月汇总",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "现金流月汇总",
      "aliases": [
        "现金流月汇总",
        "经营/投资/筹资现金流月汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_cashflow_monthly",
      "dictHref": "architecture.html#dict/dws_cashflow_monthly",
      "detail": {
        "definition": "经营/投资/筹资现金流月汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "现金流月汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_tax_monthly",
      "name": "dws_tax_monthly",
      "name_cn": "税务月汇总",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "税务月汇总",
      "aliases": [
        "税务月汇总",
        "销项/进项/应纳税额月汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_tax_monthly",
      "dictHref": "architecture.html#dict/dws_tax_monthly",
      "detail": {
        "definition": "销项/进项/应纳税额月汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "税务月汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_budget_monthly",
      "name": "dws_budget_monthly",
      "name_cn": "预算月汇总",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_dws",
      "description": "预算月汇总",
      "aliases": [
        "预算月汇总",
        "预算执行月汇总"
      ],
      "href": "platform-graph.html?node=tbl:dws_budget_monthly",
      "dictHref": "architecture.html#dict/dws_budget_monthly",
      "detail": {
        "definition": "预算执行月汇总",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws",
        "预算月汇总"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_overview",
      "name": "v_overview",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "经营总览 KPI",
      "aliases": [
        "经营总览 KPI"
      ],
      "href": "platform-graph.html?node=tbl:v_overview",
      "dictHref": "architecture.html#dict/v_overview",
      "detail": {
        "definition": "经营总览 KPI",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_brand",
      "name": "v_brand",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "品牌分析",
      "aliases": [
        "品牌分析"
      ],
      "href": "platform-graph.html?node=tbl:v_brand",
      "dictHref": "architecture.html#dict/v_brand",
      "detail": {
        "definition": "品牌分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_channel",
      "name": "v_channel",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "渠道分析",
      "aliases": [
        "渠道分析"
      ],
      "href": "platform-graph.html?node=tbl:v_channel",
      "dictHref": "architecture.html#dict/v_channel",
      "detail": {
        "definition": "渠道分析",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_income_statement",
      "name": "v_income_statement",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "利润表视图",
      "aliases": [
        "利润表视图"
      ],
      "href": "platform-graph.html?node=tbl:v_income_statement",
      "dictHref": "architecture.html#dict/v_income_statement",
      "detail": {
        "definition": "利润表视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_dupont",
      "name": "v_dupont",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "杜邦 ROE 分解",
      "aliases": [
        "杜邦 ROE 分解"
      ],
      "href": "platform-graph.html?node=tbl:v_dupont",
      "dictHref": "architecture.html#dict/v_dupont",
      "detail": {
        "definition": "杜邦 ROE 分解",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_balance_sheet",
      "name": "v_balance_sheet",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "资产负债表视图",
      "aliases": [
        "资产负债表视图"
      ],
      "href": "platform-graph.html?node=tbl:v_balance_sheet",
      "dictHref": "architecture.html#dict/v_balance_sheet",
      "detail": {
        "definition": "资产负债表视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cashflow",
      "name": "v_cashflow",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "现金流量视图",
      "aliases": [
        "现金流量视图"
      ],
      "href": "platform-graph.html?node=tbl:v_cashflow",
      "dictHref": "architecture.html#dict/v_cashflow",
      "detail": {
        "definition": "现金流量视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_cashflow_statement",
      "name": "v_cashflow_statement",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "现金流量表视图",
      "aliases": [
        "现金流量表视图"
      ],
      "href": "platform-graph.html?node=tbl:v_cashflow_statement",
      "dictHref": "architecture.html#dict/v_cashflow_statement",
      "detail": {
        "definition": "现金流量表视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_tax_analysis",
      "name": "v_tax_analysis",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "税务分析视图",
      "aliases": [
        "税务分析视图"
      ],
      "href": "platform-graph.html?node=tbl:v_tax_analysis",
      "dictHref": "architecture.html#dict/v_tax_analysis",
      "detail": {
        "definition": "税务分析视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_budget",
      "name": "v_budget",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "预算执行",
      "aliases": [
        "预算执行"
      ],
      "href": "platform-graph.html?node=tbl:v_budget",
      "dictHref": "architecture.html#dict/v_budget",
      "detail": {
        "definition": "预算执行",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_inventory",
      "name": "v_inventory",
      "name_cn": "",
      "type": "warehouse",
      "category": "retail",
      "parentId": "cat_wh_ads",
      "description": "库存周转监控",
      "aliases": [
        "库存周转监控"
      ],
      "href": "platform-graph.html?node=tbl:v_inventory",
      "dictHref": "architecture.html#dict/v_inventory",
      "detail": {
        "definition": "库存周转监控",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_核心财务指标",
      "name": "核心财务指标",
      "type": "metric",
      "category": "retail",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:revenue",
        "metric:cost_of_goods_sold",
        "metric:gross_profit",
        "metric:gross_margin",
        "metric:same_store_sales",
        "metric:same_store_sales_growth",
        "metric:selling_expense",
        "metric:administrative_expense",
        "metric:financial_expense",
        "metric:total_period_expense",
        "metric:expense_ratio",
        "metric:operating_profit",
        "metric:net_profit",
        "metric:net_profit_margin",
        "metric:inventory_value",
        "metric:inventory_turnover_days",
        "metric:inventory_turnover_ratio",
        "metric:ar_turnover_days",
        "metric:ap_turnover_days",
        "metric:cash_conversion_cycle",
        "metric:sell_through_rate",
        "metric:roe",
        "metric:roa",
        "metric:equity_multiplier",
        "metric:net_margin",
        "metric:asset_turnover"
      ],
      "detail": {
        "definition": "核心财务指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:revenue",
      "name": "营业收入",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "当期确认的销售收入，不含税",
      "href": "architecture.html#dict/dwd_voucher_fact",
      "detail": {
        "definition": "当期确认的销售收入，不含税",
        "formula": "SUM(CASE WHEN 科目类型='收入' THEN 贷方发生额-借方发生额 ELSE 0 END)",
        "notes": "来源表：dwd_voucher_fact · 刷新：T+1"
      },
      "tags": [
        "revenue",
        "营业收入"
      ],
      "source_table": "dwd_voucher_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:cost_of_goods_sold",
      "name": "营业成本",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "当期销售商品的成本",
      "href": "architecture.html#dict/dwd_voucher_fact",
      "detail": {
        "definition": "当期销售商品的成本",
        "formula": "SUM(CASE WHEN 科目类型='成本' THEN 借方发生额-贷方发生额 ELSE 0 END)",
        "notes": "来源表：dwd_voucher_fact · 刷新：T+1"
      },
      "tags": [
        "cost_of_goods_sold",
        "营业成本"
      ],
      "source_table": "dwd_voucher_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:gross_profit",
      "name": "毛利",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "营业收入 - 营业成本",
      "href": "architecture.html#dict/dws_account_daily",
      "detail": {
        "definition": "营业收入 - 营业成本",
        "formula": "营业收入 - 营业成本",
        "notes": "来源表：dws_account_daily · 刷新：T+1"
      },
      "tags": [
        "gross_profit",
        "毛利"
      ],
      "source_table": "dws_account_daily",
      "crossRefs": [
        "pb:q01",
        "pb:q02",
        "pb:q04",
        "pb:q05",
        "pb:q06",
        "pb:q08",
        "pb:q09",
        "pb:q21",
        "pb:q22",
        "pb:q23",
        "pb:q26",
        "pb:q29",
        "pb:q30",
        "pb:q31"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:gross_margin",
      "name": "毛利率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "毛利 / 营业收入 × 100%",
      "href": "architecture.html#dict/dws_account_daily",
      "detail": {
        "definition": "毛利 / 营业收入 × 100%",
        "formula": "(营业收入 - 营业成本) / NULLIF(营业收入, 0) × 100",
        "notes": "来源表：dws_account_daily · 刷新：T+1"
      },
      "tags": [
        "gross_margin",
        "毛利率"
      ],
      "source_table": "dws_account_daily",
      "crossRefs": [
        "pb:q01",
        "pb:q04",
        "pb:q05",
        "pb:q06",
        "pb:q08",
        "pb:q09"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:same_store_sales",
      "name": "同店销售额",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "开业满12个月的门店当期销售额",
      "href": "architecture.html#dict/dwd_sales_fact",
      "detail": {
        "definition": "开业满12个月的门店当期销售额",
        "formula": "SUM(销售额) WHERE 门店开业日期 < 当期日期 - 365天",
        "notes": "来源表：dwd_sales_fact · 刷新：T+1"
      },
      "tags": [
        "same_store_sales",
        "同店销售额"
      ],
      "source_table": "dwd_sales_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:same_store_sales_growth",
      "name": "同店增长率 SSSG",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "同店销售额同比增长率",
      "href": "architecture.html#dict/dws_store_monthly",
      "detail": {
        "definition": "同店销售额同比增长率",
        "formula": "(本期同店 - 上期同店) / NULLIF(上期同店, 0) × 100",
        "notes": "来源表：dws_store_monthly · 刷新：月"
      },
      "tags": [
        "same_store_sales_growth",
        "同店增长率 SSSG"
      ],
      "source_table": "dws_store_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:selling_expense",
      "name": "销售费用",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "销售环节发生的各项费用",
      "href": "architecture.html#dict/dwd_voucher_fact",
      "detail": {
        "definition": "销售环节发生的各项费用",
        "formula": "SUM(销售费用科目借方发生额)",
        "notes": "来源表：dwd_voucher_fact · 刷新：T+1"
      },
      "tags": [
        "selling_expense",
        "销售费用"
      ],
      "source_table": "dwd_voucher_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:administrative_expense",
      "name": "管理费用",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "管理部门发生的各项费用",
      "href": "architecture.html#dict/dwd_voucher_fact",
      "detail": {
        "definition": "管理部门发生的各项费用",
        "formula": "SUM(管理费用科目借方发生额)",
        "notes": "来源表：dwd_voucher_fact · 刷新：T+1"
      },
      "tags": [
        "administrative_expense",
        "管理费用"
      ],
      "source_table": "dwd_voucher_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:financial_expense",
      "name": "财务费用",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "融资、手续费等财务费用",
      "href": "architecture.html#dict/dwd_voucher_fact",
      "detail": {
        "definition": "融资、手续费等财务费用",
        "formula": "SUM(财务费用科目借方发生额 - 利息收入)",
        "notes": "来源表：dwd_voucher_fact · 刷新：T+1"
      },
      "tags": [
        "financial_expense",
        "财务费用"
      ],
      "source_table": "dwd_voucher_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:total_period_expense",
      "name": "期间费用合计",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "销售+管理+财务费用",
      "href": "architecture.html#dict/dws_account_daily",
      "detail": {
        "definition": "销售+管理+财务费用",
        "formula": "销售费用 + 管理费用 + 财务费用",
        "notes": "来源表：dws_account_daily · 刷新：T+1"
      },
      "tags": [
        "total_period_expense",
        "期间费用合计"
      ],
      "source_table": "dws_account_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:expense_ratio",
      "name": "费用率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "期间费用 / 营业收入 × 100%",
      "href": "architecture.html#dict/dws_account_daily",
      "detail": {
        "definition": "期间费用 / 营业收入 × 100%",
        "formula": "期间费用合计 / NULLIF(营业收入, 0) × 100",
        "notes": "来源表：dws_account_daily · 刷新：T+1"
      },
      "tags": [
        "expense_ratio",
        "费用率"
      ],
      "source_table": "dws_account_daily",
      "crossRefs": [
        "pb:q05",
        "pb:q09",
        "pb:q13"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:operating_profit",
      "name": "营业利润",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "毛利 - 期间费用 + 其他收益",
      "href": "architecture.html#dict/dws_account_daily",
      "detail": {
        "definition": "毛利 - 期间费用 + 其他收益",
        "formula": "毛利 - 期间费用 + 其他收益 + 投资收益",
        "notes": "来源表：dws_account_daily · 刷新：T+1"
      },
      "tags": [
        "operating_profit",
        "营业利润"
      ],
      "source_table": "dws_account_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:net_profit",
      "name": "净利润",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "税后利润，归属于母公司",
      "href": "architecture.html#dict/dws_account_monthly",
      "detail": {
        "definition": "税后利润，归属于母公司",
        "formula": "营业利润 + 营业外收支 - 所得税费用",
        "notes": "来源表：dws_account_monthly · 刷新：月"
      },
      "tags": [
        "net_profit",
        "净利润"
      ],
      "source_table": "dws_account_monthly",
      "crossRefs": [
        "pb:q09"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:net_profit_margin",
      "name": "净利润率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "净利润 / 营业收入 × 100%",
      "href": "architecture.html#dict/dws_account_monthly",
      "detail": {
        "definition": "净利润 / 营业收入 × 100%",
        "formula": "净利润 / NULLIF(营业收入, 0) × 100",
        "notes": "来源表：dws_account_monthly · 刷新：月"
      },
      "tags": [
        "net_profit_margin",
        "净利润率"
      ],
      "source_table": "dws_account_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_value",
      "name": "库存金额",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "期末库存账面价值",
      "href": "architecture.html#dict/dws_inventory_daily",
      "detail": {
        "definition": "期末库存账面价值",
        "formula": "SUM(库存商品科目期末余额)",
        "notes": "来源表：dws_inventory_daily · 刷新：T+1"
      },
      "tags": [
        "inventory_value",
        "库存金额"
      ],
      "source_table": "dws_inventory_daily",
      "crossRefs": [
        "tbl:dws_inventory_daily",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_turnover_days",
      "name": "库存周转天数",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "库存平均多少天周转一次",
      "href": "architecture.html#dict/dws_inventory_monthly",
      "detail": {
        "definition": "库存平均多少天周转一次",
        "formula": "平均库存余额 / 当期销售成本 × 当期天数",
        "notes": "来源表：dws_inventory_monthly · 刷新：月"
      },
      "tags": [
        "inventory_turnover_days",
        "库存周转天数"
      ],
      "source_table": "dws_inventory_monthly",
      "crossRefs": [
        "pb:q15",
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:inventory_turnover_ratio",
      "name": "库存周转率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "当期库存周转次数",
      "href": "architecture.html#dict/dws_inventory_monthly",
      "detail": {
        "definition": "当期库存周转次数",
        "formula": "当期销售成本 / 平均库存余额",
        "notes": "来源表：dws_inventory_monthly · 刷新：月"
      },
      "tags": [
        "inventory_turnover_ratio",
        "库存周转率"
      ],
      "source_table": "dws_inventory_monthly",
      "crossRefs": [
        "dash:inventory"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:ar_turnover_days",
      "name": "应收账款周转天数",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "应收账款平均回款天数",
      "href": "architecture.html#dict/dws_ar_monthly",
      "detail": {
        "definition": "应收账款平均回款天数",
        "formula": "平均应收账款 / 当期营收 × 当期天数",
        "notes": "来源表：dws_ar_monthly · 刷新：月"
      },
      "tags": [
        "ar_turnover_days",
        "应收账款周转天数"
      ],
      "source_table": "dws_ar_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:ap_turnover_days",
      "name": "应付账款周转天数",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "应付账款平均付款天数",
      "href": "architecture.html#dict/dws_ap_monthly",
      "detail": {
        "definition": "应付账款平均付款天数",
        "formula": "平均应付账款 / 当期采购成本 × 当期天数",
        "notes": "来源表：dws_ap_monthly · 刷新：月"
      },
      "tags": [
        "ap_turnover_days",
        "应付账款周转天数"
      ],
      "source_table": "dws_ap_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:cash_conversion_cycle",
      "name": "现金转换周期 CCC",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "从付货款到收货款的天数",
      "href": "architecture.html#dict/dws_cash_monthly",
      "detail": {
        "definition": "从付货款到收货款的天数",
        "formula": "库存周转天数 + 应收周转天数 - 应付周转天数",
        "notes": "来源表：dws_cash_monthly · 刷新：月"
      },
      "tags": [
        "cash_conversion_cycle",
        "现金转换周期 CCC"
      ],
      "source_table": "dws_cash_monthly",
      "crossRefs": [
        "dash:cashflow"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:sell_through_rate",
      "name": "动销率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "有销售的SKU占比",
      "href": "architecture.html#dict/dws_sku_daily",
      "detail": {
        "definition": "有销售的SKU占比",
        "formula": "有销售SKU数 / 总在售SKU数 × 100",
        "notes": "来源表：dws_sku_daily · 刷新：周"
      },
      "tags": [
        "sell_through_rate",
        "动销率"
      ],
      "source_table": "dws_sku_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:roe",
      "name": "ROE 净资产收益率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "净利润 / 平均净资产 × 100%",
      "href": "architecture.html#dict/dws_finance_monthly",
      "detail": {
        "definition": "净利润 / 平均净资产 × 100%",
        "formula": "净利润 / AVG(期初净资产, 期末净资产) × 100",
        "notes": "来源表：dws_finance_monthly · 刷新：月"
      },
      "tags": [
        "roe",
        "ROE 净资产收益率"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:roa",
      "name": "ROA 总资产收益率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "净利润 / 平均总资产 × 100%",
      "href": "architecture.html#dict/dws_finance_monthly",
      "detail": {
        "definition": "净利润 / 平均总资产 × 100%",
        "formula": "净利润 / AVG(期初总资产, 期末总资产) × 100",
        "notes": "来源表：dws_finance_monthly · 刷新：月"
      },
      "tags": [
        "roa",
        "ROA 总资产收益率"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:equity_multiplier",
      "name": "权益乘数",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "总资产 / 净资产（杠杆倍数）",
      "href": "architecture.html#dict/dws_finance_monthly",
      "detail": {
        "definition": "总资产 / 净资产（杠杆倍数）",
        "formula": "平均总资产 / 平均净资产",
        "notes": "来源表：dws_finance_monthly · 刷新：月"
      },
      "tags": [
        "equity_multiplier",
        "权益乘数"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:net_margin",
      "name": "销售净利率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "净利润 / 营业收入 × 100%",
      "href": "architecture.html#dict/dws_finance_monthly",
      "detail": {
        "definition": "净利润 / 营业收入 × 100%",
        "formula": "净利润 / 营业收入 × 100",
        "notes": "来源表：dws_finance_monthly · 刷新：月"
      },
      "tags": [
        "net_margin",
        "销售净利率"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:asset_turnover",
      "name": "总资产周转率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_核心财务指标",
      "description": "营业收入 / 平均总资产",
      "href": "architecture.html#dict/dws_finance_monthly",
      "detail": {
        "definition": "营业收入 / 平均总资产",
        "formula": "营业收入 / 平均总资产",
        "notes": "来源表：dws_finance_monthly · 刷新：月"
      },
      "tags": [
        "asset_turnover",
        "总资产周转率"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_业务运营指标",
      "name": "业务运营指标",
      "type": "metric",
      "category": "retail",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:sales_per_sqm",
        "metric:sales_per_employee",
        "metric:average_order_value",
        "metric:items_per_transaction",
        "metric:transaction_count",
        "metric:channel_sales",
        "metric:channel_share",
        "metric:channel_roi",
        "metric:customer_acquisition_cost"
      ],
      "detail": {
        "definition": "业务运营指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:sales_per_sqm",
      "name": "坪效",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "每平米面积产出的销售额",
      "href": "architecture.html#dict/dws_store_monthly",
      "detail": {
        "definition": "每平米面积产出的销售额",
        "formula": "门店销售额 / 门店营业面积",
        "notes": "来源表：dws_store_monthly · 刷新：月"
      },
      "tags": [
        "sales_per_sqm",
        "坪效"
      ],
      "source_table": "dws_store_monthly",
      "crossRefs": [
        "pb:q07",
        "pb:q24"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:sales_per_employee",
      "name": "人效",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "每个员工产出的销售额",
      "href": "architecture.html#dict/dws_store_monthly",
      "detail": {
        "definition": "每个员工产出的销售额",
        "formula": "门店销售额 / 门店平均人数",
        "notes": "来源表：dws_store_monthly · 刷新：月"
      },
      "tags": [
        "sales_per_employee",
        "人效"
      ],
      "source_table": "dws_store_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:average_order_value",
      "name": "客单价",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "平均每单消费金额",
      "href": "architecture.html#dict/dwd_sales_fact",
      "detail": {
        "definition": "平均每单消费金额",
        "formula": "销售总额 / 订单笔数",
        "notes": "来源表：dwd_sales_fact · 刷新：日"
      },
      "tags": [
        "average_order_value",
        "客单价"
      ],
      "source_table": "dwd_sales_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:items_per_transaction",
      "name": "连带率",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "平均每单购买件数",
      "href": "architecture.html#dict/dwd_sales_fact",
      "detail": {
        "definition": "平均每单购买件数",
        "formula": "销售总件数 / 订单笔数",
        "notes": "来源表：dwd_sales_fact · 刷新：日"
      },
      "tags": [
        "items_per_transaction",
        "连带率"
      ],
      "source_table": "dwd_sales_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:transaction_count",
      "name": "交易笔数",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "当期有效订单数",
      "href": "architecture.html#dict/dwd_sales_fact",
      "detail": {
        "definition": "当期有效订单数",
        "formula": "COUNT(DISTINCT 订单号) WHERE 订单状态='已完成'",
        "notes": "来源表：dwd_sales_fact · 刷新：日"
      },
      "tags": [
        "transaction_count",
        "交易笔数"
      ],
      "source_table": "dwd_sales_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:channel_sales",
      "name": "渠道销售额",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "各渠道贡献的销售收入",
      "href": "architecture.html#dict/dwd_sales_fact",
      "detail": {
        "definition": "各渠道贡献的销售收入",
        "formula": "SUM(销售额) GROUP BY 渠道",
        "notes": "来源表：dwd_sales_fact · 刷新：日"
      },
      "tags": [
        "channel_sales",
        "渠道销售额"
      ],
      "source_table": "dwd_sales_fact",
      "crossRefs": [
        "dash:channel"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:channel_share",
      "name": "渠道占比",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "各渠道销售额占总销售额比例",
      "href": "architecture.html#dict/dws_channel_daily",
      "detail": {
        "definition": "各渠道销售额占总销售额比例",
        "formula": "渠道销售额 / 总销售额 × 100",
        "notes": "来源表：dws_channel_daily · 刷新：日"
      },
      "tags": [
        "channel_share",
        "渠道占比"
      ],
      "source_table": "dws_channel_daily",
      "crossRefs": [
        "pb:q05",
        "dash:channel"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:channel_roi",
      "name": "渠道ROI",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "渠道毛利 / 渠道投放费用",
      "href": "architecture.html#dict/dws_marketing_monthly",
      "detail": {
        "definition": "渠道毛利 / 渠道投放费用",
        "formula": "(渠道毛利 - 渠道费用) / NULLIF(渠道费用, 0)",
        "notes": "来源表：dws_marketing_monthly · 刷新：月"
      },
      "tags": [
        "channel_roi",
        "渠道ROI"
      ],
      "source_table": "dws_marketing_monthly",
      "crossRefs": [
        "pb:q20",
        "pb:q28",
        "dash:channel"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:customer_acquisition_cost",
      "name": "获客成本 CAC",
      "type": "metric",
      "category": "retail",
      "parentId": "cat_metric_业务运营指标",
      "description": "获取一个新客户的成本",
      "href": "architecture.html#dict/dws_channel_monthly",
      "detail": {
        "definition": "获取一个新客户的成本",
        "formula": "渠道投放费用 / 新增客户数",
        "notes": "来源表：dws_channel_monthly · 刷新：月"
      },
      "tags": [
        "customer_acquisition_cost",
        "获客成本 CAC"
      ],
      "source_table": "dws_channel_monthly",
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
      "target": "dash:overview",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:brand",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:channel",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:financial",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:dupont",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:cashflow",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:tax",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:inventory",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:budget",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:store",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:profit-quality",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:cvp",
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
      "source": "cat_method_l1",
      "target": "pb:q03",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q04",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q05",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q06",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l1",
      "target": "pb:q07",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q08",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q09",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q10",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
      "target": "pb:q11",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l2",
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
      "source": "cat_method_l2",
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
      "source": "cat_method_l3",
      "target": "pb:q17",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q18",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q19",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l3",
      "target": "pb:q20",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q21",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q22",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
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
      "source": "cat_method_l4",
      "target": "pb:q25",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
      "target": "pb:q26",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q27",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q28",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q29",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q30",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l5",
      "target": "pb:q31",
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
      "target": "tbl:ods_payment",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_purchase",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_inventory",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_expense",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_store_pnl",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_ad_cost",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_budget",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_brand",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_channel",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_category",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_store",
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
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_sales_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_expense_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_inventory_wide",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_sales_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_sales_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_expense_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_inventory_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_store_daily",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_asset_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_cashflow_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_tax_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_budget_monthly",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_overview",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_brand",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_channel",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_income_statement",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_dupont",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_balance_sheet",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_cashflow",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_cashflow_statement",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_tax_analysis",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_budget",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_inventory",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_核心财务指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:revenue",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:cost_of_goods_sold",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:gross_profit",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:gross_margin",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:same_store_sales",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:same_store_sales_growth",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:selling_expense",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:administrative_expense",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:financial_expense",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:total_period_expense",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:expense_ratio",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:operating_profit",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:net_profit",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:net_profit_margin",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:inventory_value",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "metric:inventory_value",
      "target": "tbl:dws_inventory_daily",
      "style": "dashed",
      "cross": true,
      "label": "来源表"
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:inventory_turnover_days",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:inventory_turnover_ratio",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:ar_turnover_days",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:ap_turnover_days",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:cash_conversion_cycle",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:sell_through_rate",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:roe",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:roa",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:equity_multiplier",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:net_margin",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_核心财务指标",
      "target": "metric:asset_turnover",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_业务运营指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:sales_per_sqm",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:sales_per_employee",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:average_order_value",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:items_per_transaction",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:transaction_count",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:channel_sales",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:channel_share",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:channel_roi",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_业务运营指标",
      "target": "metric:customer_acquisition_cost",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "pb:q01",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q01",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q01",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q01",
      "target": "dash:dupont",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q01",
      "target": "dash:cashflow",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q02",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q02",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q02",
      "target": "dash:budget",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q03",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q04",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q04",
      "target": "dash:brand",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:dupont",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q05",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q05",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q05",
      "target": "metric:expense_ratio",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q05",
      "target": "metric:channel_share",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q05",
      "target": "dash:channel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q06",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q06",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q06",
      "target": "dash:inventory",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "metric:sales_per_sqm",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q07",
      "target": "dash:store",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q08",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q09",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q09",
      "target": "metric:gross_margin",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q09",
      "target": "metric:expense_ratio",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q09",
      "target": "metric:net_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q09",
      "target": "dash:dupont",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q10",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:budget",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "metric:expense_ratio",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q14",
      "target": "dash:cashflow",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q14",
      "target": "dash:inventory",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q15",
      "target": "metric:inventory_turnover_days",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q15",
      "target": "dash:inventory",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:budget",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q19",
      "target": "dash:cashflow",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q20",
      "target": "metric:channel_roi",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q20",
      "target": "dash:channel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q22",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q23",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q24",
      "target": "metric:sales_per_sqm",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q24",
      "target": "dash:store",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q26",
      "target": "dash:inventory",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "metric:channel_roi",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q29",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q30",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q31",
      "target": "metric:gross_profit",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q31",
      "target": "dash:inventory",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "dash:channel",
      "target": "metric:channel_sales",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:channel",
      "target": "metric:channel_share",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:channel",
      "target": "metric:channel_roi",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:cashflow",
      "target": "metric:cash_conversion_cycle",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:inventory",
      "target": "metric:inventory_value",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:inventory",
      "target": "metric:inventory_turnover_days",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:inventory",
      "target": "metric:inventory_turnover_ratio",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    }
  ]
};
