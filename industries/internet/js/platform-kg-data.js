/** 平台知识图谱数据 · 自动生成 gen_platform_kg_data.py */
window.PLATFORM_KG_DATA = {
  "meta": {
    "industry": "internet",
    "industryName": "互联网通用",
    "title": "互联网通用 · 平台知识图谱",
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
      "nodes": 145,
      "edges": 245,
      "leaves": 125,
      "dashboards": 17,
      "playbooks": 28,
      "metrics": 50,
      "warehouseTables": 30
    }
  },
  "nodes": [
    {
      "id": "root_dashboard",
      "name": "看板",
      "type": "dashboard",
      "category": "internet",
      "categoryName": "互联网通用",
      "description": "互联网通用 · 看板",
      "isRoot": true,
      "icon": "📊",
      "childrenIds": [
        "cat_dashboard_all"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "互联网通用平台「看板」模块入口"
      }
    },
    {
      "id": "root_methodology",
      "name": "分析方法",
      "type": "methodology",
      "category": "internet",
      "categoryName": "互联网通用",
      "description": "互联网通用 · 分析方法",
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
        "definition": "互联网通用平台「分析方法」模块入口"
      }
    },
    {
      "id": "root_warehouse",
      "name": "五层数仓",
      "type": "warehouse",
      "category": "internet",
      "categoryName": "互联网通用",
      "description": "互联网通用 · 五层数仓",
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
        "definition": "互联网通用平台「五层数仓」模块入口"
      }
    },
    {
      "id": "root_metric",
      "name": "指标",
      "type": "metric",
      "category": "internet",
      "categoryName": "互联网通用",
      "description": "互联网通用 · 指标",
      "isRoot": true,
      "icon": "📈",
      "childrenIds": [
        "cat_metric_用户增长指标",
        "cat_metric_营销策略指标",
        "cat_metric_商业变现指标",
        "cat_metric_产品分析指标"
      ],
      "crossRefs": [],
      "detail": {
        "definition": "互联网通用平台「指标」模块入口"
      }
    },
    {
      "id": "cat_dashboard_all",
      "name": "主题看板",
      "type": "dashboard",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_dashboard",
      "childrenIds": [
        "dash:overview",
        "dash:launcher",
        "dash:vod",
        "dash:live",
        "dash:series",
        "dash:episode",
        "dash:quality",
        "dash:lifecycle",
        "dash:retention",
        "dash:device",
        "dash:funnel",
        "dash:order",
        "dash:path",
        "dash:revenue",
        "dash:activity",
        "dash:health",
        "dash:tags"
      ],
      "detail": {
        "definition": "数据展示主题看板"
      },
      "crossRefs": []
    },
    {
      "id": "dash:overview",
      "name": "活跃总览",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "有效MAU(STB/Speaker/合计) · DAU/WAU/MAU · 多时间窗",
      "href": "../internet_dashboard.html#overview",
      "detail": {
        "definition": "有效MAU(STB/Speaker/合计) · DAU/WAU/MAU · 多时间窗",
        "notes": "API: /api/dashboard_overview"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q01",
        "pb:q02",
        "pb:q07",
        "pb:q14",
        "metric:活跃率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:launcher",
      "name": "开机活跃",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "开机次数/设备数/时长 · 端对比 · 只开机占比",
      "href": "../internet_dashboard.html#launcher",
      "detail": {
        "definition": "开机次数/设备数/时长 · 端对比 · 只开机占比",
        "notes": "API: /api/dashboard_launcher"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q04",
        "metric:活跃率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:vod",
      "name": "点播活跃",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "VV/UV/时长 · 人均VV/人均时长 · 多时间窗",
      "href": "../internet_dashboard.html#vod",
      "detail": {
        "definition": "VV/UV/时长 · 人均VV/人均时长 · 多时间窗",
        "notes": "API: /api/dashboard_vod"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q04",
        "pb:q21",
        "pb:q26",
        "metric:活跃率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:live",
      "name": "直播活跃",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "观看次数/人数/时长 · 频道分布",
      "href": "../internet_dashboard.html#live",
      "detail": {
        "definition": "观看次数/人数/时长 · 频道分布",
        "notes": "API: /api/dashboard_live"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q04",
        "pb:q26",
        "metric:活跃率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:series",
      "name": "内容·剧集",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "剧集 VV/UV/时长/完播率 · 题材渗透",
      "href": "../internet_dashboard.html#series",
      "detail": {
        "definition": "剧集 VV/UV/时长/完播率 · 题材渗透",
        "notes": "API: /api/dashboard_series"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q06",
        "pb:q13",
        "pb:q21",
        "pb:q26"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:episode",
      "name": "内容·单集与行为",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "单集排名 · 播放行为分布(action/完成度)",
      "href": "../internet_dashboard.html#episode",
      "detail": {
        "definition": "单集排名 · 播放行为分布(action/完成度)",
        "notes": "API: /api/dashboard_episode"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q23"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:quality",
      "name": "完播与QoS",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "完播率/完成度/首帧/卡顿 · 内容质量榜",
      "href": "../internet_dashboard.html#quality",
      "detail": {
        "definition": "完播率/完成度/首帧/卡顿 · 内容质量榜",
        "notes": "API: /api/dashboard_quality"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q13",
        "pb:q23"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:lifecycle",
      "name": "用户生命周期",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "开户/激活/沉默/流失/净增",
      "href": "../internet_dashboard.html#lifecycle",
      "detail": {
        "definition": "开户/激活/沉默/流失/净增",
        "notes": "API: /api/dashboard_lifecycle"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q05",
        "pb:q11",
        "pb:q17",
        "pb:q25",
        "metric:用户渗透率",
        "metric:用户生命周期"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:retention",
      "name": "用户留存",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "次留/7留/30留 · 同期群矩阵",
      "href": "../internet_dashboard.html#retention",
      "detail": {
        "definition": "次留/7留/30留 · 同期群矩阵",
        "notes": "API: /api/dashboard_retention"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q08",
        "metric:用户渗透率",
        "metric:用户生命周期"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:device",
      "name": "设备流转",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "STB↔Speaker · 型号/固件 · 双端用户",
      "href": "../internet_dashboard.html#device",
      "detail": {
        "definition": "STB↔Speaker · 型号/固件 · 双端用户",
        "notes": "API: /api/dashboard_device"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q07"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:funnel",
      "name": "商业化漏斗",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "曝光→点击→验证→确认 · 误触监控",
      "href": "../internet_dashboard.html#funnel",
      "detail": {
        "definition": "曝光→点击→验证→确认 · 误触监控",
        "notes": "API: /api/dashboard_funnel"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q10",
        "pb:q16",
        "pb:q20",
        "pb:q24",
        "metric:漏斗转化率"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:order",
      "name": "订购与分成",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "订购/退订 · 收费结构 · MAU结算(演示)+CP分成(演示30%)",
      "href": "../internet_dashboard.html#order",
      "detail": {
        "definition": "订购/退订 · 收费结构 · MAU结算(演示)+CP分成(演示30%)",
        "notes": "API: /api/dashboard_order"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "pb:q03",
        "pb:q09",
        "pb:q12",
        "pb:q15",
        "pb:q18",
        "pb:q19",
        "pb:q22",
        "pb:q24",
        "pb:q27",
        "pb:q28"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:path",
      "name": "用户行为路径",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "Sankey路径图 · 页面流转 · 步骤流失 · 转化链路",
      "href": "../internet_dashboard.html#path",
      "detail": {
        "definition": "Sankey路径图 · 页面流转 · 步骤流失 · 转化链路",
        "notes": "API: /api/dashboard_path"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "metric:用户渗透率",
        "metric:用户生命周期"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:revenue",
      "name": "收入结构深度分析",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "套餐LTV · ARPU/ARPPU · 退订/续费率 · 收入结构",
      "href": "../internet_dashboard.html#revenue",
      "detail": {
        "definition": "套餐LTV · ARPU/ARPPU · 退订/续费率 · 收入结构",
        "notes": "API: /api/dashboard_revenue"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:activity",
      "name": "营销活动复盘",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "活动ROI · 触达→参与→转化 · 全周期效果",
      "href": "../internet_dashboard.html#activity",
      "detail": {
        "definition": "活动ROI · 触达→参与→转化 · 全周期效果",
        "notes": "API: /api/dashboard_activity"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "metric:活动参与率",
        "metric:活动转化率",
        "metric:活动roi"
      ],
      "childrenIds": []
    },
    {
      "id": "dash:health",
      "name": "业务健康度",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "红黄绿灯 · 综合健康分 · 基线对比 · 一页纸",
      "href": "../internet_dashboard.html#health",
      "detail": {
        "definition": "红黄绿灯 · 综合健康分 · 基线对比 · 一页纸",
        "notes": "API: /api/dashboard_health"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "dash:tags",
      "name": "用户标签画像",
      "type": "dashboard",
      "category": "internet",
      "parentId": "cat_dashboard_all",
      "description": "5类标签体系 · 人群覆盖 · 画像分析 · 规则来源",
      "href": "../internet_dashboard.html#tags",
      "detail": {
        "definition": "5类标签体系 · 人群覆盖 · 画像分析 · 规则来源",
        "notes": "API: /api/dashboard_tags"
      },
      "tags": [
        "看板"
      ],
      "crossRefs": [
        "metric:用户渗透率",
        "metric:用户生命周期"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_method_l1",
      "name": "L1 描述",
      "type": "methodology",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q01",
        "pb:q02",
        "pb:q03",
        "pb:q04",
        "pb:q05",
        "pb:q06"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q07",
        "pb:q08",
        "pb:q09",
        "pb:q10",
        "pb:q11",
        "pb:q12",
        "pb:q13"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q14",
        "pb:q15",
        "pb:q16",
        "pb:q17",
        "pb:q18"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q19",
        "pb:q20",
        "pb:q21",
        "pb:q22",
        "pb:q23"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_methodology",
      "childrenIds": [
        "pb:q24",
        "pb:q25",
        "pb:q26",
        "pb:q27",
        "pb:q28"
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
      "category": "internet",
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
      "name": "DAU/MAU 趋势总览",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "掌握 OTT 整体活跃水位、端型结构与月度波动",
      "href": "methodology.html#playbook/q01",
      "detail": {
        "definition": "这个月日活和月活怎么样？",
        "notes": "掌握 OTT 整体活跃水位、端型结构与月度波动",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:overview"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q02",
      "name": "用户画像（端/地市）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "STB/Speaker 端型与广东各地市用户分布",
      "href": "methodology.html#playbook/q02",
      "detail": {
        "definition": "我们的核心用户是谁？",
        "notes": "STB/Speaker 端型与广东各地市用户分布",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:overview"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q03",
      "name": "渠道获客分布（入口 launcher/video）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "收银台入口来源（launcher/video）的订购量与金额占比",
      "href": "methodology.html#playbook/q03",
      "detail": {
        "definition": "用户主要从哪个入口来？",
        "notes": "收银台入口来源（launcher/video）的订购量与金额占比",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q04",
      "name": "产品功能使用（点播/直播/开机）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "开机、点播、直播三大功能的使用深度与渗透",
      "href": "methodology.html#playbook/q04",
      "detail": {
        "definition": "用户在产品里做什么？",
        "notes": "开机、点播、直播三大功能的使用深度与渗透",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:launcher",
        "dash:vod",
        "dash:live"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q05",
      "name": "活跃结构分析",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "高/中/低活跃、沉默与流失用户的结构占比",
      "href": "methodology.html#playbook/q05",
      "detail": {
        "definition": "活跃用户结构健康吗？",
        "notes": "高/中/低活跃、沉默与流失用户的结构占比",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:lifecycle"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q06",
      "name": "内容题材分布",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l1",
      "description": "剧集题材/品类的 VV、UV 与完播率分布",
      "href": "methodology.html#playbook/q06",
      "detail": {
        "definition": "用户在看什么内容？",
        "notes": "剧集题材/品类的 VV、UV 与完播率分布",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:series"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q07",
      "name": "DAU 下滑诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "定位 DAU 下降的主因：端型、地市还是功能渗透",
      "href": "methodology.html#playbook/q07",
      "detail": {
        "definition": "为什么日活下降了？",
        "notes": "定位 DAU 下降的主因：端型、地市还是功能渗透",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:overview",
        "dash:device"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q08",
      "name": "留存下降诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "D1/D7/D30 留存偏离历史基线，分端型拆解",
      "href": "methodology.html#playbook/q08",
      "detail": {
        "definition": "为什么留存变差了？",
        "notes": "D1/D7/D30 留存偏离历史基线，分端型拆解",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:retention"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q09",
      "name": "CAC/获客效率上升诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "订购金额/单成本上升，定位花费效率恶化的入口",
      "href": "methodology.html#playbook/q09",
      "detail": {
        "definition": "为什么获客越来越贵？",
        "notes": "订购金额/单成本上升，定位花费效率恶化的入口",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q10",
      "name": "付费转化下降诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "收银台曝光→点击→验证→确认各环节转化率",
      "href": "methodology.html#playbook/q10",
      "detail": {
        "definition": "转化卡在哪一步？",
        "notes": "收银台曝光→点击→验证→确认各环节转化率",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:funnel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q11",
      "name": "用户流失诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "沉默与流失用户的规模、特征与迁移路径",
      "href": "methodology.html#playbook/q11",
      "detail": {
        "definition": "用户为什么走了？",
        "notes": "沉默与流失用户的规模、特征与迁移路径",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:lifecycle"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q12",
      "name": "渠道质量下降诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "各入口的留存、LTV 与转化质量综合对比",
      "href": "methodology.html#playbook/q12",
      "detail": {
        "definition": "哪个入口带来的用户质量差了？",
        "notes": "各入口的留存、LTV 与转化质量综合对比",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q13",
      "name": "完播率异常诊断",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l2",
      "description": "剧集/单集完播率偏离基线，定位内容或 QoS 问题",
      "href": "methodology.html#playbook/q13",
      "detail": {
        "definition": "为什么完播率下降了？",
        "notes": "剧集/单集完播率偏离基线，定位内容或 QoS 问题",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:quality",
        "dash:series"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q14",
      "name": "下月 DAU 预测",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l3",
      "description": "基于近 3 月 DAU 趋势外推下月日活区间",
      "href": "methodology.html#playbook/q14",
      "detail": {
        "definition": "下个月日活大概多少？",
        "notes": "基于近 3 月 DAU 趋势外推下月日活区间",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:overview"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q15",
      "name": "LTV/ARPU 预测（订购客单）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l3",
      "description": "按入口 Cohort + 客单外推用户终身价值",
      "href": "methodology.html#playbook/q15",
      "detail": {
        "definition": "这批用户长期值多少钱？",
        "notes": "按入口 Cohort + 客单外推用户终身价值",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "metric:arpu",
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q16",
      "name": "渠道效果预测",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l3",
      "description": "基于历史入口转化与留存外推下月渠道贡献",
      "href": "methodology.html#playbook/q16",
      "detail": {
        "definition": "各入口下月能带来多少订购？",
        "notes": "基于历史入口转化与留存外推下月渠道贡献",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:funnel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q17",
      "name": "用户流失预测",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l3",
      "description": "基于沉默趋势与 RFM 分层预测下月流失规模",
      "href": "methodology.html#playbook/q17",
      "detail": {
        "definition": "下个月大概流失多少人？",
        "notes": "基于沉默趋势与 RFM 分层预测下月流失规模",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:lifecycle"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q18",
      "name": "分成收入预测",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l3",
      "description": "基于订购量与分成比例外推下月爱奇艺分成收入",
      "href": "methodology.html#playbook/q18",
      "detail": {
        "definition": "下月分成收入大概多少？",
        "notes": "基于订购量与分成比例外推下月爱奇艺分成收入",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q19",
      "name": "渠道获客效率评估",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l4",
      "description": "LTV/CAC 比率评估各入口长期 ROI",
      "href": "methodology.html#playbook/q19",
      "detail": {
        "definition": "各入口投放划不划算？",
        "notes": "LTV/CAC 比率评估各入口长期 ROI",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q20",
      "name": "A/B 测试效果评估",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l4",
      "description": "收银台入口改版/引导实验的显著性检验",
      "href": "methodology.html#playbook/q20",
      "detail": {
        "definition": "改版实验有没有效？",
        "notes": "收银台入口改版/引导实验的显著性检验",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:funnel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q21",
      "name": "产品功能效果评估（内容）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l4",
      "description": "评估内容上线/推荐策略对 VV、完播与渗透的影响",
      "href": "methodology.html#playbook/q21",
      "detail": {
        "definition": "这次内容/功能改版效果好吗？",
        "notes": "评估内容上线/推荐策略对 VV、完播与渗透的影响",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:series",
        "dash:vod"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q22",
      "name": "活动 ROI 评估（订购分成）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l4",
      "description": "评估促销/活动期间的订购量、金额与分成 ROI",
      "href": "methodology.html#playbook/q22",
      "detail": {
        "definition": "这次活动 ROI 怎么样？",
        "notes": "评估促销/活动期间的订购量、金额与分成 ROI",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q23",
      "name": "用户满意度评估（完播/QoS 代理）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l4",
      "description": "用完播率、完成度与播放行为代理用户满意度",
      "href": "methodology.html#playbook/q23",
      "detail": {
        "definition": "用户满意度怎么样？",
        "notes": "用完播率、完成度与播放行为代理用户满意度",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:quality",
        "dash:episode"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q24",
      "name": "投放预算分配优化（入口流量）",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l5",
      "description": "按 LTV/CAC 与边际 ROI 重分配 launcher/video 入口流量",
      "href": "methodology.html#playbook/q24",
      "detail": {
        "definition": "预算应该怎么分配？",
        "notes": "按 LTV/CAC 与边际 ROI 重分配 launcher/video 入口流量",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order",
        "dash:funnel"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q25",
      "name": "用户挽回策略优化",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l5",
      "description": "RFM 分层制定差异化沉默/流失用户触达策略",
      "href": "methodology.html#playbook/q25",
      "detail": {
        "definition": "怎么挽回流失用户？",
        "notes": "RFM 分层制定差异化沉默/流失用户触达策略",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:lifecycle"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q26",
      "name": "产品优先级优化",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l5",
      "description": "基于 VV/完播/渗透确定内容与功能迭代优先级",
      "href": "methodology.html#playbook/q26",
      "detail": {
        "definition": "先做哪个功能/内容？",
        "notes": "基于 VV/完播/渗透确定内容与功能迭代优先级",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:series",
        "dash:vod",
        "dash:live"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q27",
      "name": "渠道组合优化",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l5",
      "description": "launcher + video 入口的最优组合与协同策略",
      "href": "methodology.html#playbook/q27",
      "detail": {
        "definition": "入口怎么组合最优？",
        "notes": "launcher + video 入口的最优组合与协同策略",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "pb:q28",
      "name": "定价策略优化",
      "type": "methodology",
      "category": "internet",
      "parentId": "cat_method_l5",
      "description": "连续包月/单月/包年套餐的定价与结构优化",
      "href": "methodology.html#playbook/q28",
      "detail": {
        "definition": "套餐价格怎么定？",
        "notes": "连续包月/单月/包年套餐的定价与结构优化",
        "steps": []
      },
      "tags": [],
      "crossRefs": [
        "dash:order"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_wh_ods",
      "name": "ODS 贴源层",
      "type": "warehouse",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:ods_device_info_df",
        "tbl:ods_content_series_df",
        "tbl:ods_content_episode_df",
        "tbl:ods_live_channel_df"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dim_region",
        "tbl:dim_content_genre",
        "tbl:dim_content_category",
        "tbl:dim_content_cp"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dwd_act_launcher_di",
        "tbl:dwd_vod_play_di",
        "tbl:dwd_live_play_di",
        "tbl:dwd_trade_cashier_di"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:dws_act_user_active_1d",
        "tbl:dws_content_series_play_1d",
        "tbl:dws_content_episode_play_1d",
        "tbl:dws_content_live_play_1d",
        "tbl:dws_trade_cashier_funnel_1d",
        "tbl:dws_trade_order_1d",
        "tbl:dws_user_lifecycle_1d",
        "tbl:dws_user_retention_1d"
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
      "category": "internet",
      "isCategory": true,
      "parentId": "root_warehouse",
      "childrenIds": [
        "tbl:v_dau_overview",
        "tbl:v_lifecycle",
        "tbl:v_user_lifecycle",
        "tbl:v_retention_decomposition",
        "tbl:v_user_retention",
        "tbl:v_user_segment",
        "tbl:v_channel_attribution",
        "tbl:v_ab_experiment",
        "tbl:v_funnel",
        "tbl:v_ltv"
      ],
      "detail": {
        "definition": "ADS 应用层"
      },
      "crossRefs": []
    },
    {
      "id": "tbl:ods_device_info_df",
      "name": "ods_device_info_df",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/ods_device_info_df",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_content_series_df",
      "name": "ods_content_series_df",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/ods_content_series_df",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_content_episode_df",
      "name": "ods_content_episode_df",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/ods_content_episode_df",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:ods_live_channel_df",
      "name": "ods_live_channel_df",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ods",
      "description": "ODS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/ods_live_channel_df",
      "detail": {
        "definition": "ODS 表/视图",
        "notes": "分层：ODS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ods"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_region",
      "name": "dim_region",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dim_region",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_content_genre",
      "name": "dim_content_genre",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dim_content_genre",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_content_category",
      "name": "dim_content_category",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dim_content_category",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dim_content_cp",
      "name": "dim_content_cp",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dim",
      "description": "DIM",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dim_content_cp",
      "detail": {
        "definition": "DIM 表/视图",
        "notes": "分层：DIM · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dim"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_act_launcher_di",
      "name": "dwd_act_launcher_di",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dwd_act_launcher_di",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_vod_play_di",
      "name": "dwd_vod_play_di",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dwd_vod_play_di",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_live_play_di",
      "name": "dwd_live_play_di",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dwd_live_play_di",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dwd_trade_cashier_di",
      "name": "dwd_trade_cashier_di",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dwd",
      "description": "DWD",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dwd_trade_cashier_di",
      "detail": {
        "definition": "DWD 表/视图",
        "notes": "分层：DWD · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dwd"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_act_user_active_1d",
      "name": "dws_act_user_active_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_act_user_active_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_content_series_play_1d",
      "name": "dws_content_series_play_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_content_series_play_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_content_episode_play_1d",
      "name": "dws_content_episode_play_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_content_episode_play_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_content_live_play_1d",
      "name": "dws_content_live_play_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_content_live_play_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_trade_cashier_funnel_1d",
      "name": "dws_trade_cashier_funnel_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_trade_cashier_funnel_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_trade_order_1d",
      "name": "dws_trade_order_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_trade_order_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_user_lifecycle_1d",
      "name": "dws_user_lifecycle_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_user_lifecycle_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:dws_user_retention_1d",
      "name": "dws_user_retention_1d",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_dws",
      "description": "DWS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/dws_user_retention_1d",
      "detail": {
        "definition": "DWS 表/视图",
        "notes": "分层：DWS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "dws"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_dau_overview",
      "name": "v_dau_overview",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_dau_overview",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_lifecycle",
      "name": "v_lifecycle",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_lifecycle",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_user_lifecycle",
      "name": "v_user_lifecycle",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_user_lifecycle",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_retention_decomposition",
      "name": "v_retention_decomposition",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_retention_decomposition",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_user_retention",
      "name": "v_user_retention",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_user_retention",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_user_segment",
      "name": "v_user_segment",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_user_segment",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_channel_attribution",
      "name": "v_channel_attribution",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_channel_attribution",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_ab_experiment",
      "name": "v_ab_experiment",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_ab_experiment",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_funnel",
      "name": "v_funnel",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_funnel",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "tbl:v_ltv",
      "name": "v_ltv",
      "type": "warehouse",
      "category": "internet",
      "parentId": "cat_wh_ads",
      "description": "ADS",
      "href": "platform-graph.html",
      "dictHref": "dictionary.html#dict/v_ltv",
      "detail": {
        "definition": "ADS 表/视图",
        "notes": "分层：ADS · 详表字段见数据字典；可在平台知识图谱辐射图中定位"
      },
      "tags": [
        "ads"
      ],
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_用户增长指标",
      "name": "用户增长指标",
      "type": "metric",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:dau_日活跃用户",
        "metric:mau_月活跃用户",
        "metric:新增用户",
        "metric:活跃率",
        "metric:用户渗透率",
        "metric:次日留存_d1",
        "metric:7日留存_d7",
        "metric:30日留存_d30",
        "metric:月流失率",
        "metric:沉默用户数",
        "metric:人均使用时长",
        "metric:人均启动次数",
        "metric:会话时长",
        "metric:页面浏览量_pv",
        "metric:人均pv"
      ],
      "detail": {
        "definition": "用户增长指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:dau_日活跃用户",
      "name": "DAU 日活跃用户",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "当日有任意有效行为的去重用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "当日有任意有效行为的去重用户数",
        "formula": "COUNT(DISTINCT user_id) WHERE 当日有事件",
        "notes": "来源表：dwd_user_event_fact · 刷新：日/实时"
      },
      "tags": [
        "dau_日活跃用户",
        "DAU 日活跃用户"
      ],
      "source_table": "dwd_user_event_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:mau_月活跃用户",
      "name": "MAU 月活跃用户",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "当月有任意有效行为的去重用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "当月有任意有效行为的去重用户数",
        "formula": "COUNT(DISTINCT user_id) WHERE 当月有事件",
        "notes": "来源表：dws_user_monthly · 刷新：月"
      },
      "tags": [
        "mau_月活跃用户",
        "MAU 月活跃用户"
      ],
      "source_table": "dws_user_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:新增用户",
      "name": "新增用户",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "当日首次注册/首次使用产品的用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "当日首次注册/首次使用产品的用户数",
        "formula": "COUNT(DISTINCT user_id) WHERE register_date = 当日",
        "notes": "来源表：dim_user · 刷新：日"
      },
      "tags": [
        "新增用户",
        "新增用户"
      ],
      "source_table": "dim_user",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:活跃率",
      "name": "活跃率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "DAU / 累计注册用户数 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "DAU / 累计注册用户数 × 100%",
        "formula": "DAU / 累计注册用户数 × 100",
        "notes": "来源表：dws_user_daily · 刷新：日"
      },
      "tags": [
        "活跃率",
        "活跃率"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [
        "dash:overview",
        "dash:launcher",
        "dash:vod",
        "dash:live"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:用户渗透率",
      "name": "用户渗透率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "使用某功能的用户 / DAU × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "使用某功能的用户 / DAU × 100%",
        "formula": "功能用户数 / NULLIF(DAU, 0) × 100",
        "notes": "来源表：dws_feature_daily · 刷新：日"
      },
      "tags": [
        "用户渗透率",
        "用户渗透率"
      ],
      "source_table": "dws_feature_daily",
      "crossRefs": [
        "dash:lifecycle",
        "dash:retention",
        "dash:path",
        "dash:tags"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:次日留存_d1",
      "name": "次日留存 D1",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "新增用户第2天回来的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "新增用户第2天回来的比例",
        "formula": "第N天新增且第N+1天活跃 / 第N天新增 × 100",
        "notes": "来源表：dws_cohort_daily · 刷新：T+1"
      },
      "tags": [
        "次日留存_d1",
        "次日留存 D1"
      ],
      "source_table": "dws_cohort_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:7日留存_d7",
      "name": "7日留存 D7",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "新增用户第7天回来的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "新增用户第7天回来的比例",
        "formula": "第N天新增且第N+7天活跃 / 第N天新增 × 100",
        "notes": "来源表：dws_cohort_daily · 刷新：T+7"
      },
      "tags": [
        "7日留存_d7",
        "7日留存 D7"
      ],
      "source_table": "dws_cohort_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:30日留存_d30",
      "name": "30日留存 D30",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "新增用户第30天回来的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "新增用户第30天回来的比例",
        "formula": "第N天新增且第N+30天活跃 / 第N天新增 × 100",
        "notes": "来源表：dws_cohort_monthly · 刷新：T+30"
      },
      "tags": [
        "30日留存_d30",
        "30日留存 D30"
      ],
      "source_table": "dws_cohort_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:月流失率",
      "name": "月流失率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "上月活跃本月不活跃的用户占比",
      "href": "dictionary.html",
      "detail": {
        "definition": "上月活跃本月不活跃的用户占比",
        "formula": "(上月活跃 - 本月仍活跃) / 上月活跃 × 100",
        "notes": "来源表：dws_user_monthly · 刷新：月"
      },
      "tags": [
        "月流失率",
        "月流失率"
      ],
      "source_table": "dws_user_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:沉默用户数",
      "name": "沉默用户数",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "连续N天未活跃的用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "连续N天未活跃的用户数",
        "formula": "COUNT(user_id) WHERE last_active_date < 今日 - 30天",
        "notes": "来源表：dim_user · 刷新：日"
      },
      "tags": [
        "沉默用户数",
        "沉默用户数"
      ],
      "source_table": "dim_user",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:人均使用时长",
      "name": "人均使用时长",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "平均每个用户每日使用时长",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每个用户每日使用时长",
        "formula": "总使用时长 / DAU",
        "notes": "来源表：dws_user_daily · 刷新：日"
      },
      "tags": [
        "人均使用时长",
        "人均使用时长"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:人均启动次数",
      "name": "人均启动次数",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "平均每个用户每日启动次数",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每个用户每日启动次数",
        "formula": "总启动次数 / DAU",
        "notes": "来源表：dws_user_daily · 刷新：日"
      },
      "tags": [
        "人均启动次数",
        "人均启动次数"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:会话时长",
      "name": "会话时长",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "平均每次会话持续时间",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每次会话持续时间",
        "formula": "总会话时长 / 总会话数",
        "notes": "来源表：dws_session_daily · 刷新：日"
      },
      "tags": [
        "会话时长",
        "会话时长"
      ],
      "source_table": "dws_session_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:页面浏览量_pv",
      "name": "页面浏览量 PV",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "当日页面浏览总次数",
      "href": "dictionary.html",
      "detail": {
        "definition": "当日页面浏览总次数",
        "formula": "SUM(page_view事件数)",
        "notes": "来源表：dwd_user_event_fact · 刷新：日/实时"
      },
      "tags": [
        "页面浏览量_pv",
        "页面浏览量 PV"
      ],
      "source_table": "dwd_user_event_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:人均pv",
      "name": "人均PV",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_用户增长指标",
      "description": "平均每个用户每日浏览页面数",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每个用户每日浏览页面数",
        "formula": "PV / DAU",
        "notes": "来源表：dws_user_daily · 刷新：日"
      },
      "tags": [
        "人均pv",
        "人均PV"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_营销策略指标",
      "name": "营销策略指标",
      "type": "metric",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:渠道新增用户",
        "metric:cac_获客成本",
        "metric:channel_roi",
        "metric:点击率_ctr",
        "metric:转化率_cvr",
        "metric:活动参与率",
        "metric:活动转化率",
        "metric:活动roi",
        "metric:触达到达率",
        "metric:打开率",
        "metric:分流均匀性",
        "metric:统计显著性",
        "metric:置信区间",
        "metric:实验功效"
      ],
      "detail": {
        "definition": "营销策略指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:渠道新增用户",
      "name": "渠道新增用户",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "各渠道带来的新增注册用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "各渠道带来的新增注册用户数",
        "formula": "COUNT(DISTINCT user_id) GROUP BY channel",
        "notes": "来源表：dim_user · 刷新：日"
      },
      "tags": [
        "渠道新增用户",
        "渠道新增用户"
      ],
      "source_table": "dim_user",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:cac_获客成本",
      "name": "CAC 获客成本",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "获取一个新增用户的成本",
      "href": "dictionary.html",
      "detail": {
        "definition": "获取一个新增用户的成本",
        "formula": "渠道投放费用 / 渠道新增用户数",
        "notes": "来源表：dws_channel_daily · 刷新：日/月"
      },
      "tags": [
        "cac_获客成本",
        "CAC 获客成本"
      ],
      "source_table": "dws_channel_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:channel_roi",
      "name": "渠道ROI",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "渠道带来的收入 / 渠道投入费用",
      "href": "dictionary.html",
      "detail": {
        "definition": "渠道带来的收入 / 渠道投入费用",
        "formula": "渠道LTV收入 / NULLIF(渠道费用, 0)",
        "notes": "来源表：dws_channel_monthly · 刷新：月"
      },
      "tags": [
        "channel_roi",
        "渠道ROI"
      ],
      "source_table": "dws_channel_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:点击率_ctr",
      "name": "点击率 CTR",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "点击数 / 曝光数 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "点击数 / 曝光数 × 100%",
        "formula": "点击数 / NULLIF(曝光数, 0) × 100",
        "notes": "来源表：dwd_click_fact / dwd_exposure_fact · 刷新：小时"
      },
      "tags": [
        "点击率_ctr",
        "点击率 CTR"
      ],
      "source_table": "dwd_click_fact / dwd_exposure_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:转化率_cvr",
      "name": "转化率 CVR",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "转化数 / 点击数 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "转化数 / 点击数 × 100%",
        "formula": "转化数 / NULLIF(点击数, 0) × 100",
        "notes": "来源表：dws_campaign_daily · 刷新：日"
      },
      "tags": [
        "转化率_cvr",
        "转化率 CVR"
      ],
      "source_table": "dws_campaign_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:活动参与率",
      "name": "活动参与率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "参与活动用户 / 触达用户 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "参与活动用户 / 触达用户 × 100%",
        "formula": "参与用户数 / NULLIF(触达用户数, 0) × 100",
        "notes": "来源表：dws_activity_daily · 刷新：日"
      },
      "tags": [
        "活动参与率",
        "活动参与率"
      ],
      "source_table": "dws_activity_daily",
      "crossRefs": [
        "dash:activity"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:活动转化率",
      "name": "活动转化率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "活动完成目标转化 / 参与用户 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "活动完成目标转化 / 参与用户 × 100%",
        "formula": "转化用户数 / NULLIF(参与用户数, 0) × 100",
        "notes": "来源表：dws_activity_daily · 刷新：日"
      },
      "tags": [
        "活动转化率",
        "活动转化率"
      ],
      "source_table": "dws_activity_daily",
      "crossRefs": [
        "dash:activity"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:活动roi",
      "name": "活动ROI",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "活动带来的增量收益 / 活动投入",
      "href": "dictionary.html",
      "detail": {
        "definition": "活动带来的增量收益 / 活动投入",
        "formula": "(活动组收益 - 对照组收益) / 活动成本",
        "notes": "来源表：dws_activity_result · 刷新：活动结束"
      },
      "tags": [
        "活动roi",
        "活动ROI"
      ],
      "source_table": "dws_activity_result",
      "crossRefs": [
        "dash:activity"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:触达到达率",
      "name": "触达到达率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "成功触达用户 / 目标用户 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "成功触达用户 / 目标用户 × 100%",
        "formula": "到达数 / NULLIF(发送数, 0) × 100",
        "notes": "来源表：dws_push_daily · 刷新：日"
      },
      "tags": [
        "触达到达率",
        "触达到达率"
      ],
      "source_table": "dws_push_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:打开率",
      "name": "打开率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "点击打开推送 / 成功触达 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "点击打开推送 / 成功触达 × 100%",
        "formula": "打开数 / NULLIF(到达数, 0) × 100",
        "notes": "来源表：dws_push_daily · 刷新：日"
      },
      "tags": [
        "打开率",
        "打开率"
      ],
      "source_table": "dws_push_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:分流均匀性",
      "name": "分流均匀性",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "实验组和对照组用户特征分布一致",
      "href": "dictionary.html",
      "detail": {
        "definition": "实验组和对照组用户特征分布一致",
        "formula": "卡方检验/KS检验，P值>0.05",
        "notes": "来源表：ab_test_config · 刷新："
      },
      "tags": [
        "分流均匀性",
        "分流均匀性"
      ],
      "source_table": "ab_test_config",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:统计显著性",
      "name": "统计显著性",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "指标差异是否由实验导致而非随机",
      "href": "dictionary.html",
      "detail": {
        "definition": "指标差异是否由实验导致而非随机",
        "formula": "P值<0.05为统计显著",
        "notes": "来源表：ab_test_result · 刷新："
      },
      "tags": [
        "统计显著性",
        "统计显著性"
      ],
      "source_table": "ab_test_result",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:置信区间",
      "name": "置信区间",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "指标提升的可能范围",
      "href": "dictionary.html",
      "detail": {
        "definition": "指标提升的可能范围",
        "formula": "均值 ± 1.96×标准误",
        "notes": "来源表：ab_test_result · 刷新："
      },
      "tags": [
        "置信区间",
        "置信区间"
      ],
      "source_table": "ab_test_result",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:实验功效",
      "name": "实验功效",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_营销策略指标",
      "description": "实验能检测出差异的概率",
      "href": "dictionary.html",
      "detail": {
        "definition": "实验能检测出差异的概率",
        "formula": "Power > 0.8 为合格",
        "notes": "来源表：ab_test_config · 刷新："
      },
      "tags": [
        "实验功效",
        "实验功效"
      ],
      "source_table": "ab_test_config",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "cat_metric_商业变现指标",
      "name": "商业变现指标",
      "type": "metric",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:总营收_gmv",
        "metric:付费用户数",
        "metric:付费率",
        "metric:arpu",
        "metric:arppu",
        "metric:复购率",
        "metric:ltv_用户生命周期价值",
        "metric:ltv_cac_比值",
        "metric:回本周期",
        "metric:gross_margin",
        "metric:用户生命周期"
      ],
      "detail": {
        "definition": "商业变现指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:总营收_gmv",
      "name": "总营收 GMV",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "当期总交易额（含退款）",
      "href": "dictionary.html",
      "detail": {
        "definition": "当期总交易额（含退款）",
        "formula": "SUM(订单金额)",
        "notes": "来源表：dwd_order_fact · 刷新：日"
      },
      "tags": [
        "总营收_gmv",
        "总营收 GMV"
      ],
      "source_table": "dwd_order_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:付费用户数",
      "name": "付费用户数",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "当期有付费行为的去重用户数",
      "href": "dictionary.html",
      "detail": {
        "definition": "当期有付费行为的去重用户数",
        "formula": "COUNT(DISTINCT user_id) WHERE 有支付成功订单",
        "notes": "来源表：dwd_order_fact · 刷新：日"
      },
      "tags": [
        "付费用户数",
        "付费用户数"
      ],
      "source_table": "dwd_order_fact",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:付费率",
      "name": "付费率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "付费用户 / 活跃用户 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "付费用户 / 活跃用户 × 100%",
        "formula": "付费用户数 / NULLIF(DAU, 0) × 100",
        "notes": "来源表：dws_user_daily · 刷新：日"
      },
      "tags": [
        "付费率",
        "付费率"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:arpu",
      "name": "ARPU",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "平均每活跃用户收入",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每活跃用户收入",
        "formula": "总营收 / DAU",
        "notes": "来源表：dws_user_daily · 刷新：日/月"
      },
      "tags": [
        "arpu",
        "ARPU"
      ],
      "source_table": "dws_user_daily",
      "crossRefs": [
        "pb:q15"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:arppu",
      "name": "ARPPU",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "平均每付费用户收入",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每付费用户收入",
        "formula": "总营收 / 付费用户数",
        "notes": "来源表：dws_payment_daily · 刷新：日/月"
      },
      "tags": [
        "arppu",
        "ARPPU"
      ],
      "source_table": "dws_payment_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:复购率",
      "name": "复购率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "当期付费2次及以上用户占比",
      "href": "dictionary.html",
      "detail": {
        "definition": "当期付费2次及以上用户占比",
        "formula": "付费≥2次用户数 / 总付费用户数 × 100",
        "notes": "来源表：dws_user_monthly · 刷新：月"
      },
      "tags": [
        "复购率",
        "复购率"
      ],
      "source_table": "dws_user_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:ltv_用户生命周期价值",
      "name": "LTV 用户生命周期价值",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "用户从注册到流失的总贡献价值",
      "href": "dictionary.html",
      "detail": {
        "definition": "用户从注册到流失的总贡献价值",
        "formula": "按Cohort累计付费，生存分析预测全周期",
        "notes": "来源表：dws_ltv_cohort · 刷新："
      },
      "tags": [
        "ltv_用户生命周期价值",
        "LTV 用户生命周期价值"
      ],
      "source_table": "dws_ltv_cohort",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:ltv_cac_比值",
      "name": "LTV/CAC 比值",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "用户价值 / 获客成本，判断渠道健康度",
      "href": "dictionary.html",
      "detail": {
        "definition": "用户价值 / 获客成本，判断渠道健康度",
        "formula": "LTV / NULLIF(CAC, 0)",
        "notes": "来源表：dws_channel_monthly · 刷新："
      },
      "tags": [
        "ltv_cac_比值",
        "LTV/CAC 比值"
      ],
      "source_table": "dws_channel_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:回本周期",
      "name": "回本周期",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "获客成本多少天能收回来",
      "href": "dictionary.html",
      "detail": {
        "definition": "获客成本多少天能收回来",
        "formula": "CAC / 日均ARPU",
        "notes": "来源表：dws_channel_monthly · 刷新："
      },
      "tags": [
        "回本周期",
        "回本周期"
      ],
      "source_table": "dws_channel_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:gross_margin",
      "name": "毛利率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "(营收 - 成本) / 营收 × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "(营收 - 成本) / 营收 × 100%",
        "formula": "(营收 - 可变成本) / 营收 × 100",
        "notes": "来源表：dws_finance_monthly · 刷新："
      },
      "tags": [
        "gross_margin",
        "毛利率"
      ],
      "source_table": "dws_finance_monthly",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:用户生命周期",
      "name": "用户生命周期",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_商业变现指标",
      "description": "用户从注册到流失的平均天数",
      "href": "dictionary.html",
      "detail": {
        "definition": "用户从注册到流失的平均天数",
        "formula": "流失日期 - 注册日期",
        "notes": "来源表：dws_user_lifecycle · 刷新："
      },
      "tags": [
        "用户生命周期",
        "用户生命周期"
      ],
      "source_table": "dws_user_lifecycle",
      "crossRefs": [
        "dash:lifecycle",
        "dash:retention",
        "dash:path",
        "dash:tags"
      ],
      "childrenIds": []
    },
    {
      "id": "cat_metric_产品分析指标",
      "name": "产品分析指标",
      "type": "metric",
      "category": "internet",
      "isCategory": true,
      "parentId": "root_metric",
      "childrenIds": [
        "metric:功能渗透率",
        "metric:功能使用频次",
        "metric:漏斗转化率",
        "metric:步骤流失率",
        "metric:核心行为完成率",
        "metric:崩溃率",
        "metric:anr率",
        "metric:启动时长",
        "metric:接口成功率",
        "metric:nps_净推荐值"
      ],
      "detail": {
        "definition": "产品分析指标"
      },
      "crossRefs": []
    },
    {
      "id": "metric:功能渗透率",
      "name": "功能渗透率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "使用过某功能的用户 / DAU × 100%",
      "href": "dictionary.html",
      "detail": {
        "definition": "使用过某功能的用户 / DAU × 100%",
        "formula": "功能用户数 / NULLIF(DAU, 0) × 100",
        "notes": "来源表：dws_feature_daily · 刷新：日"
      },
      "tags": [
        "功能渗透率",
        "功能渗透率"
      ],
      "source_table": "dws_feature_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:功能使用频次",
      "name": "功能使用频次",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "平均每个用户每日使用该功能次数",
      "href": "dictionary.html",
      "detail": {
        "definition": "平均每个用户每日使用该功能次数",
        "formula": "功能使用总次数 / 功能用户数",
        "notes": "来源表：dws_feature_daily · 刷新：日"
      },
      "tags": [
        "功能使用频次",
        "功能使用频次"
      ],
      "source_table": "dws_feature_daily",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:漏斗转化率",
      "name": "漏斗转化率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "从漏斗起点到终点的转化比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "从漏斗起点到终点的转化比例",
        "formula": "终点人数 / NULLIF(起点人数, 0) × 100",
        "notes": "来源表：dws_funnel_analysis · 刷新：日"
      },
      "tags": [
        "漏斗转化率",
        "漏斗转化率"
      ],
      "source_table": "dws_funnel_analysis",
      "crossRefs": [
        "dash:funnel"
      ],
      "childrenIds": []
    },
    {
      "id": "metric:步骤流失率",
      "name": "步骤流失率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "漏斗每一步的流失比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "漏斗每一步的流失比例",
        "formula": "(上一步人数 - 当前步人数) / 上一步人数 × 100",
        "notes": "来源表：dws_funnel_analysis · 刷新：日"
      },
      "tags": [
        "步骤流失率",
        "步骤流失率"
      ],
      "source_table": "dws_funnel_analysis",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:核心行为完成率",
      "name": "核心行为完成率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "新用户完成核心Aha行为的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "新用户完成核心Aha行为的比例",
        "formula": "完成核心行为新用户 / 新增用户 × 100",
        "notes": "来源表：dws_newuser_activation · 刷新：日"
      },
      "tags": [
        "核心行为完成率",
        "核心行为完成率"
      ],
      "source_table": "dws_newuser_activation",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:崩溃率",
      "name": "崩溃率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "发生崩溃的启动次数占比",
      "href": "dictionary.html",
      "detail": {
        "definition": "发生崩溃的启动次数占比",
        "formula": "崩溃启动数 / 总启动数 × 100",
        "notes": "来源表：dwd_crash_log · 刷新：小时/日"
      },
      "tags": [
        "崩溃率",
        "崩溃率"
      ],
      "source_table": "dwd_crash_log",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:anr率",
      "name": "ANR率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "应用无响应的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "应用无响应的比例",
        "formula": "ANR次数 / 启动数 × 100",
        "notes": "来源表：dwd_crash_log · 刷新：日"
      },
      "tags": [
        "anr率",
        "ANR率"
      ],
      "source_table": "dwd_crash_log",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:启动时长",
      "name": "启动时长",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "从点击图标到首页加载完成的时间",
      "href": "dictionary.html",
      "detail": {
        "definition": "从点击图标到首页加载完成的时间",
        "formula": "P50/P90/P99启动时长",
        "notes": "来源表：dwd_performance_log · 刷新：日"
      },
      "tags": [
        "启动时长",
        "启动时长"
      ],
      "source_table": "dwd_performance_log",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:接口成功率",
      "name": "接口成功率",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "网络接口请求成功的比例",
      "href": "dictionary.html",
      "detail": {
        "definition": "网络接口请求成功的比例",
        "formula": "成功请求数 / 总请求数 × 100",
        "notes": "来源表：dwd_api_log · 刷新：分钟/日"
      },
      "tags": [
        "接口成功率",
        "接口成功率"
      ],
      "source_table": "dwd_api_log",
      "crossRefs": [],
      "childrenIds": []
    },
    {
      "id": "metric:nps_净推荐值",
      "name": "NPS 净推荐值",
      "type": "metric",
      "category": "internet",
      "parentId": "cat_metric_产品分析指标",
      "description": "用户推荐意愿得分",
      "href": "dictionary.html",
      "detail": {
        "definition": "用户推荐意愿得分",
        "formula": "推荐者占比 - 贬损者占比",
        "notes": "来源表：user_survey · 刷新：季度"
      },
      "tags": [
        "nps_净推荐值",
        "NPS 净推荐值"
      ],
      "source_table": "user_survey",
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
      "target": "dash:launcher",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:vod",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:live",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:series",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:episode",
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
      "target": "dash:lifecycle",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:retention",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:device",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:funnel",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:order",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:path",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:revenue",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:activity",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:health",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_dashboard_all",
      "target": "dash:tags",
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
      "source": "cat_method_l2",
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
      "source": "cat_method_l3",
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
      "source": "cat_method_l4",
      "target": "pb:q19",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_method_l4",
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
      "source": "cat_method_l5",
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
      "target": "tbl:ods_device_info_df",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_content_series_df",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_content_episode_df",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ods",
      "target": "tbl:ods_live_channel_df",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_region",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_content_genre",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_content_category",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dim",
      "target": "tbl:dim_content_cp",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_act_launcher_di",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_vod_play_di",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_live_play_di",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dwd",
      "target": "tbl:dwd_trade_cashier_di",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_act_user_active_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_content_series_play_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_content_episode_play_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_content_live_play_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_trade_cashier_funnel_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_trade_order_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_user_lifecycle_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_dws",
      "target": "tbl:dws_user_retention_1d",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_dau_overview",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_lifecycle",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_user_lifecycle",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_retention_decomposition",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_user_retention",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_user_segment",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_channel_attribution",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_ab_experiment",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_funnel",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_wh_ads",
      "target": "tbl:v_ltv",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_用户增长指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:dau_日活跃用户",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:mau_月活跃用户",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:新增用户",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:活跃率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:用户渗透率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:次日留存_d1",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:7日留存_d7",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:30日留存_d30",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:月流失率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:沉默用户数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:人均使用时长",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:人均启动次数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:会话时长",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:页面浏览量_pv",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_用户增长指标",
      "target": "metric:人均pv",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_营销策略指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:渠道新增用户",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:cac_获客成本",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:channel_roi",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:点击率_ctr",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:转化率_cvr",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:活动参与率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:活动转化率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:活动roi",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:触达到达率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:打开率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:分流均匀性",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:统计显著性",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:置信区间",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_营销策略指标",
      "target": "metric:实验功效",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_商业变现指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:总营收_gmv",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:付费用户数",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:付费率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:arpu",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:arppu",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:复购率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:ltv_用户生命周期价值",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:ltv_cac_比值",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:回本周期",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:gross_margin",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_商业变现指标",
      "target": "metric:用户生命周期",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "root_metric",
      "target": "cat_metric_产品分析指标",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:功能渗透率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:功能使用频次",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:漏斗转化率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:步骤流失率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:核心行为完成率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:崩溃率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:anr率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:启动时长",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:接口成功率",
      "style": "solid",
      "cross": false,
      "label": ""
    },
    {
      "source": "cat_metric_产品分析指标",
      "target": "metric:nps_净推荐值",
      "style": "solid",
      "cross": false,
      "label": ""
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
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q01",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
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
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q03",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q03",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:launcher",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:launcher",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:live",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q04",
      "target": "dash:live",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q05",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q05",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q05",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q06",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q06",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q06",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "dash:device",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q07",
      "target": "dash:device",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "dash:retention",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "dash:retention",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "dash:retention",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q08",
      "target": "dash:retention",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q09",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q09",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q10",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q10",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q10",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q11",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q12",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q12",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q13",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q14",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q14",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q14",
      "target": "dash:overview",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q15",
      "target": "metric:arpu",
      "style": "dashed",
      "cross": true,
      "label": "用到指标"
    },
    {
      "source": "pb:q15",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q15",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q16",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q16",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q16",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q17",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q17",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q17",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q18",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q19",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q19",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q20",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q20",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q21",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q22",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q22",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q22",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q23",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q23",
      "target": "dash:quality",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q23",
      "target": "dash:episode",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q23",
      "target": "dash:episode",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q24",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q24",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q24",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q24",
      "target": "dash:funnel",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q25",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q25",
      "target": "dash:lifecycle",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:series",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:vod",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:live",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q26",
      "target": "dash:live",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q27",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q27",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "pb:q28",
      "target": "dash:order",
      "style": "dashed",
      "cross": true,
      "label": "相关看板"
    },
    {
      "source": "dash:overview",
      "target": "metric:活跃率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:launcher",
      "target": "metric:活跃率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:vod",
      "target": "metric:活跃率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:live",
      "target": "metric:活跃率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:lifecycle",
      "target": "metric:用户渗透率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:lifecycle",
      "target": "metric:用户生命周期",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:retention",
      "target": "metric:用户渗透率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:retention",
      "target": "metric:用户生命周期",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:funnel",
      "target": "metric:漏斗转化率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:path",
      "target": "metric:用户渗透率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:path",
      "target": "metric:用户生命周期",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:activity",
      "target": "metric:活动参与率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:activity",
      "target": "metric:活动转化率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:activity",
      "target": "metric:活动roi",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:tags",
      "target": "metric:用户渗透率",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    },
    {
      "source": "dash:tags",
      "target": "metric:用户生命周期",
      "style": "dashed",
      "cross": true,
      "label": "相关指标"
    }
  ]
};
