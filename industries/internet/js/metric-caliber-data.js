/**
 * 指标口径字典 · 自动生成
 * 来源：industries/internet/docs/04_指标口径字典.md
 * 数量：50 个指标
 * 生成：portfolio/scripts/export_metric_caliber.py
 */
window.METRIC_CALIBER = {
  "dau_日活跃用户": {
    "label": "DAU 日活跃用户",
    "category": "一、用户增长指标",
    "subcategory": "1.1 用户规模指标",
    "business": "当日有任意有效行为的去重用户数",
    "technical": "COUNT(DISTINCT user_id) WHERE 当日有事件",
    "source_table": "dwd_user_event_fact",
    "exclude_rules": "排除测试账号、爬虫、未登录游客",
    "refresh": "日/实时"
  },
  "mau_月活跃用户": {
    "label": "MAU 月活跃用户",
    "category": "一、用户增长指标",
    "subcategory": "1.1 用户规模指标",
    "business": "当月有任意有效行为的去重用户数",
    "technical": "COUNT(DISTINCT user_id) WHERE 当月有事件",
    "source_table": "dws_user_monthly",
    "exclude_rules": "排除测试账号、爬虫",
    "refresh": "月"
  },
  "新增用户": {
    "label": "新增用户",
    "category": "一、用户增长指标",
    "subcategory": "1.1 用户规模指标",
    "business": "当日首次注册/首次使用产品的用户数",
    "technical": "COUNT(DISTINCT user_id) WHERE register_date = 当日",
    "source_table": "dim_user",
    "exclude_rules": "排除测试账号、重复注册",
    "refresh": "日"
  },
  "活跃率": {
    "label": "活跃率",
    "category": "一、用户增长指标",
    "subcategory": "1.1 用户规模指标",
    "business": "DAU / 累计注册用户数 × 100%",
    "technical": "DAU / 累计注册用户数 × 100",
    "source_table": "dws_user_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "用户渗透率": {
    "label": "用户渗透率",
    "category": "一、用户增长指标",
    "subcategory": "1.1 用户规模指标",
    "business": "使用某功能的用户 / DAU × 100%",
    "technical": "功能用户数 / NULLIF(DAU, 0) × 100",
    "source_table": "dws_feature_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "次日留存_d1": {
    "label": "次日留存 D1",
    "category": "一、用户增长指标",
    "subcategory": "1.2 留存流失指标",
    "business": "新增用户第2天回来的比例",
    "technical": "第N天新增且第N+1天活跃 / 第N天新增 × 100",
    "source_table": "dws_cohort_daily",
    "exclude_rules": "排除测试用户",
    "refresh": "T+1"
  },
  "7日留存_d7": {
    "label": "7日留存 D7",
    "category": "一、用户增长指标",
    "subcategory": "1.2 留存流失指标",
    "business": "新增用户第7天回来的比例",
    "technical": "第N天新增且第N+7天活跃 / 第N天新增 × 100",
    "source_table": "dws_cohort_daily",
    "exclude_rules": "排除测试用户",
    "refresh": "T+7"
  },
  "30日留存_d30": {
    "label": "30日留存 D30",
    "category": "一、用户增长指标",
    "subcategory": "1.2 留存流失指标",
    "business": "新增用户第30天回来的比例",
    "technical": "第N天新增且第N+30天活跃 / 第N天新增 × 100",
    "source_table": "dws_cohort_monthly",
    "exclude_rules": "排除测试用户",
    "refresh": "T+30"
  },
  "月流失率": {
    "label": "月流失率",
    "category": "一、用户增长指标",
    "subcategory": "1.2 留存流失指标",
    "business": "上月活跃本月不活跃的用户占比",
    "technical": "(上月活跃 - 本月仍活跃) / 上月活跃 × 100",
    "source_table": "dws_user_monthly",
    "exclude_rules": "排除新用户",
    "refresh": "月"
  },
  "沉默用户数": {
    "label": "沉默用户数",
    "category": "一、用户增长指标",
    "subcategory": "1.2 留存流失指标",
    "business": "连续N天未活跃的用户数",
    "technical": "COUNT(user_id) WHERE last_active_date < 今日 - 30天",
    "source_table": "dim_user",
    "exclude_rules": "排除已注销",
    "refresh": "日"
  },
  "人均使用时长": {
    "label": "人均使用时长",
    "category": "一、用户增长指标",
    "subcategory": "1.3 用户行为指标",
    "business": "平均每个用户每日使用时长",
    "technical": "总使用时长 / DAU",
    "source_table": "dws_user_daily",
    "exclude_rules": "排除后台运行时长",
    "refresh": "日"
  },
  "人均启动次数": {
    "label": "人均启动次数",
    "category": "一、用户增长指标",
    "subcategory": "1.3 用户行为指标",
    "business": "平均每个用户每日启动次数",
    "technical": "总启动次数 / DAU",
    "source_table": "dws_user_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "会话时长": {
    "label": "会话时长",
    "category": "一、用户增长指标",
    "subcategory": "1.3 用户行为指标",
    "business": "平均每次会话持续时间",
    "technical": "总会话时长 / 总会话数",
    "source_table": "dws_session_daily",
    "exclude_rules": "排除超过1小时异常会话",
    "refresh": "日"
  },
  "页面浏览量_pv": {
    "label": "页面浏览量 PV",
    "category": "一、用户增长指标",
    "subcategory": "1.3 用户行为指标",
    "business": "当日页面浏览总次数",
    "technical": "SUM(page_view事件数)",
    "source_table": "dwd_user_event_fact",
    "exclude_rules": "排除自动刷新、重复加载",
    "refresh": "日/实时"
  },
  "人均pv": {
    "label": "人均PV",
    "category": "一、用户增长指标",
    "subcategory": "1.3 用户行为指标",
    "business": "平均每个用户每日浏览页面数",
    "technical": "PV / DAU",
    "source_table": "dws_user_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "渠道新增用户": {
    "label": "渠道新增用户",
    "category": "二、营销策略指标",
    "subcategory": "2.1 渠道获客指标",
    "business": "各渠道带来的新增注册用户数",
    "technical": "COUNT(DISTINCT user_id) GROUP BY channel",
    "source_table": "dim_user",
    "exclude_rules": "排除自然流量、内部渠道",
    "refresh": "日"
  },
  "cac_获客成本": {
    "label": "CAC 获客成本",
    "category": "二、营销策略指标",
    "subcategory": "2.1 渠道获客指标",
    "business": "获取一个新增用户的成本",
    "technical": "渠道投放费用 / 渠道新增用户数",
    "source_table": "dws_channel_daily",
    "exclude_rules": "排除自然流量用户",
    "refresh": "日/月"
  },
  "channel_roi": {
    "label": "渠道ROI",
    "category": "二、营销策略指标",
    "subcategory": "2.1 渠道获客指标",
    "business": "渠道带来的收入 / 渠道投入费用",
    "technical": "渠道LTV收入 / NULLIF(渠道费用, 0)",
    "source_table": "dws_channel_monthly",
    "exclude_rules": "费用为0返回NULL",
    "refresh": "月"
  },
  "点击率_ctr": {
    "label": "点击率 CTR",
    "category": "二、营销策略指标",
    "subcategory": "2.1 渠道获客指标",
    "business": "点击数 / 曝光数 × 100%",
    "technical": "点击数 / NULLIF(曝光数, 0) × 100",
    "source_table": "dwd_click_fact / dwd_exposure_fact",
    "exclude_rules": "-",
    "refresh": "小时"
  },
  "转化率_cvr": {
    "label": "转化率 CVR",
    "category": "二、营销策略指标",
    "subcategory": "2.1 渠道获客指标",
    "business": "转化数 / 点击数 × 100%",
    "technical": "转化数 / NULLIF(点击数, 0) × 100",
    "source_table": "dws_campaign_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "活动参与率": {
    "label": "活动参与率",
    "category": "二、营销策略指标",
    "subcategory": "2.2 活动运营指标",
    "business": "参与活动用户 / 触达用户 × 100%",
    "technical": "参与用户数 / NULLIF(触达用户数, 0) × 100",
    "source_table": "dws_activity_daily",
    "exclude_rules": "排除测试用户",
    "refresh": "日"
  },
  "活动转化率": {
    "label": "活动转化率",
    "category": "二、营销策略指标",
    "subcategory": "2.2 活动运营指标",
    "business": "活动完成目标转化 / 参与用户 × 100%",
    "technical": "转化用户数 / NULLIF(参与用户数, 0) × 100",
    "source_table": "dws_activity_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "活动roi": {
    "label": "活动ROI",
    "category": "二、营销策略指标",
    "subcategory": "2.2 活动运营指标",
    "business": "活动带来的增量收益 / 活动投入",
    "technical": "(活动组收益 - 对照组收益) / 活动成本",
    "source_table": "dws_activity_result",
    "exclude_rules": "需A/B测试计算增量",
    "refresh": "活动结束"
  },
  "触达到达率": {
    "label": "触达到达率",
    "category": "二、营销策略指标",
    "subcategory": "2.2 活动运营指标",
    "business": "成功触达用户 / 目标用户 × 100%",
    "technical": "到达数 / NULLIF(发送数, 0) × 100",
    "source_table": "dws_push_daily",
    "exclude_rules": "排除无效设备",
    "refresh": "日"
  },
  "打开率": {
    "label": "打开率",
    "category": "二、营销策略指标",
    "subcategory": "2.2 活动运营指标",
    "business": "点击打开推送 / 成功触达 × 100%",
    "technical": "打开数 / NULLIF(到达数, 0) × 100",
    "source_table": "dws_push_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "分流均匀性": {
    "label": "分流均匀性",
    "category": "二、营销策略指标",
    "subcategory": "2.3 A/B测试指标",
    "business": "实验组和对照组用户特征分布一致",
    "technical": "卡方检验/KS检验，P值>0.05",
    "source_table": "ab_test_config",
    "exclude_rules": "",
    "refresh": ""
  },
  "统计显著性": {
    "label": "统计显著性",
    "category": "二、营销策略指标",
    "subcategory": "2.3 A/B测试指标",
    "business": "指标差异是否由实验导致而非随机",
    "technical": "P值<0.05为统计显著",
    "source_table": "ab_test_result",
    "exclude_rules": "",
    "refresh": ""
  },
  "置信区间": {
    "label": "置信区间",
    "category": "二、营销策略指标",
    "subcategory": "2.3 A/B测试指标",
    "business": "指标提升的可能范围",
    "technical": "均值 ± 1.96×标准误",
    "source_table": "ab_test_result",
    "exclude_rules": "",
    "refresh": ""
  },
  "实验功效": {
    "label": "实验功效",
    "category": "二、营销策略指标",
    "subcategory": "2.3 A/B测试指标",
    "business": "实验能检测出差异的概率",
    "technical": "Power > 0.8 为合格",
    "source_table": "ab_test_config",
    "exclude_rules": "",
    "refresh": ""
  },
  "总营收_gmv": {
    "label": "总营收 GMV",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "当期总交易额（含退款）",
    "technical": "SUM(订单金额)",
    "source_table": "dwd_order_fact",
    "exclude_rules": "排除测试订单、取消订单",
    "refresh": "日"
  },
  "付费用户数": {
    "label": "付费用户数",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "当期有付费行为的去重用户数",
    "technical": "COUNT(DISTINCT user_id) WHERE 有支付成功订单",
    "source_table": "dwd_order_fact",
    "exclude_rules": "排除测试账号、退款全额用户",
    "refresh": "日"
  },
  "付费率": {
    "label": "付费率",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "付费用户 / 活跃用户 × 100%",
    "technical": "付费用户数 / NULLIF(DAU, 0) × 100",
    "source_table": "dws_user_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "arpu": {
    "label": "ARPU",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "平均每活跃用户收入",
    "technical": "总营收 / DAU",
    "source_table": "dws_user_daily",
    "exclude_rules": "-",
    "refresh": "日/月"
  },
  "arppu": {
    "label": "ARPPU",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "平均每付费用户收入",
    "technical": "总营收 / 付费用户数",
    "source_table": "dws_payment_daily",
    "exclude_rules": "-",
    "refresh": "日/月"
  },
  "复购率": {
    "label": "复购率",
    "category": "三、商业变现指标",
    "subcategory": "3.1 营收付费指标",
    "business": "当期付费2次及以上用户占比",
    "technical": "付费≥2次用户数 / 总付费用户数 × 100",
    "source_table": "dws_user_monthly",
    "exclude_rules": "排除首充当月",
    "refresh": "月"
  },
  "ltv_用户生命周期价值": {
    "label": "LTV 用户生命周期价值",
    "category": "三、商业变现指标",
    "subcategory": "3.2 LTV与单位经济",
    "business": "用户从注册到流失的总贡献价值",
    "technical": "按Cohort累计付费，生存分析预测全周期",
    "source_table": "dws_ltv_cohort",
    "exclude_rules": "",
    "refresh": ""
  },
  "ltv_cac_比值": {
    "label": "LTV/CAC 比值",
    "category": "三、商业变现指标",
    "subcategory": "3.2 LTV与单位经济",
    "business": "用户价值 / 获客成本，判断渠道健康度",
    "technical": "LTV / NULLIF(CAC, 0)",
    "source_table": "dws_channel_monthly",
    "exclude_rules": "",
    "refresh": ""
  },
  "回本周期": {
    "label": "回本周期",
    "category": "三、商业变现指标",
    "subcategory": "3.2 LTV与单位经济",
    "business": "获客成本多少天能收回来",
    "technical": "CAC / 日均ARPU",
    "source_table": "dws_channel_monthly",
    "exclude_rules": "",
    "refresh": ""
  },
  "gross_margin": {
    "label": "毛利率",
    "category": "三、商业变现指标",
    "subcategory": "3.2 LTV与单位经济",
    "business": "(营收 - 成本) / 营收 × 100%",
    "technical": "(营收 - 可变成本) / 营收 × 100",
    "source_table": "dws_finance_monthly",
    "exclude_rules": "",
    "refresh": ""
  },
  "用户生命周期": {
    "label": "用户生命周期",
    "category": "三、商业变现指标",
    "subcategory": "3.2 LTV与单位经济",
    "business": "用户从注册到流失的平均天数",
    "technical": "流失日期 - 注册日期",
    "source_table": "dws_user_lifecycle",
    "exclude_rules": "",
    "refresh": ""
  },
  "功能渗透率": {
    "label": "功能渗透率",
    "category": "四、产品分析指标",
    "subcategory": "4.1 功能与转化指标",
    "business": "使用过某功能的用户 / DAU × 100%",
    "technical": "功能用户数 / NULLIF(DAU, 0) × 100",
    "source_table": "dws_feature_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "功能使用频次": {
    "label": "功能使用频次",
    "category": "四、产品分析指标",
    "subcategory": "4.1 功能与转化指标",
    "business": "平均每个用户每日使用该功能次数",
    "technical": "功能使用总次数 / 功能用户数",
    "source_table": "dws_feature_daily",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "漏斗转化率": {
    "label": "漏斗转化率",
    "category": "四、产品分析指标",
    "subcategory": "4.1 功能与转化指标",
    "business": "从漏斗起点到终点的转化比例",
    "technical": "终点人数 / NULLIF(起点人数, 0) × 100",
    "source_table": "dws_funnel_analysis",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "步骤流失率": {
    "label": "步骤流失率",
    "category": "四、产品分析指标",
    "subcategory": "4.1 功能与转化指标",
    "business": "漏斗每一步的流失比例",
    "technical": "(上一步人数 - 当前步人数) / 上一步人数 × 100",
    "source_table": "dws_funnel_analysis",
    "exclude_rules": "-",
    "refresh": "日"
  },
  "核心行为完成率": {
    "label": "核心行为完成率",
    "category": "四、产品分析指标",
    "subcategory": "4.1 功能与转化指标",
    "business": "新用户完成核心Aha行为的比例",
    "technical": "完成核心行为新用户 / 新增用户 × 100",
    "source_table": "dws_newuser_activation",
    "exclude_rules": "定义产品魔法数字",
    "refresh": "日"
  },
  "崩溃率": {
    "label": "崩溃率",
    "category": "四、产品分析指标",
    "subcategory": "4.2 产品健康度指标",
    "business": "发生崩溃的启动次数占比",
    "technical": "崩溃启动数 / 总启动数 × 100",
    "source_table": "dwd_crash_log",
    "exclude_rules": "",
    "refresh": "小时/日"
  },
  "anr率": {
    "label": "ANR率",
    "category": "四、产品分析指标",
    "subcategory": "4.2 产品健康度指标",
    "business": "应用无响应的比例",
    "technical": "ANR次数 / 启动数 × 100",
    "source_table": "dwd_crash_log",
    "exclude_rules": "",
    "refresh": "日"
  },
  "启动时长": {
    "label": "启动时长",
    "category": "四、产品分析指标",
    "subcategory": "4.2 产品健康度指标",
    "business": "从点击图标到首页加载完成的时间",
    "technical": "P50/P90/P99启动时长",
    "source_table": "dwd_performance_log",
    "exclude_rules": "",
    "refresh": "日"
  },
  "接口成功率": {
    "label": "接口成功率",
    "category": "四、产品分析指标",
    "subcategory": "4.2 产品健康度指标",
    "business": "网络接口请求成功的比例",
    "technical": "成功请求数 / 总请求数 × 100",
    "source_table": "dwd_api_log",
    "exclude_rules": "",
    "refresh": "分钟/日"
  },
  "nps_净推荐值": {
    "label": "NPS 净推荐值",
    "category": "四、产品分析指标",
    "subcategory": "4.2 产品健康度指标",
    "business": "用户推荐意愿得分",
    "technical": "推荐者占比 - 贬损者占比",
    "source_table": "user_survey",
    "exclude_rules": "",
    "refresh": "季度"
  }
};
