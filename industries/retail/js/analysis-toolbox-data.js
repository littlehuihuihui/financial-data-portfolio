/** 第六层·分析方法工具箱 · 跃动体育作品集（2026-06） */
window.ANALYSIS_TOOLBOX = {
  layerTitle: "第六层：分析方法工具箱",
  layerQuestion: "用什么方法？",
  opening: "",
  intro:
    "分析方法工具箱是前五层分析的补充，提供19种可复用的定量与结构化分析手法，按6个小类组织，帮助业务方快速定位适合当前问题的分析方法。同时通过\"人话解释\"模块，让非技术背景的业务人员也能理解每种方法的适用场景。",
  categories: [
    {
      id: "priority",
      name: "优先级分析类",
      tagline: "",
      methods: [
        {
          id: "pareto",
          title: "帕累托分析",
          aliases: "二八定律 / 80-20 法则",
          explain:
            "按贡献度将分析对象从高到低排序，绘制累计占比曲线，识别少数关键项。通常约20%的对象贡献80%的结果，用于资源聚焦与优先级决策。",
          businessQuestion: "哪些品牌、渠道或SKU对业绩贡献最大？应优先投入哪些对象？",
          portfolio:
            "2026-06 品牌收入：跃动Pro 占净收入 52%，Pro+Life 合计 83%，验证二八；月度经营会将营销预算向 Pro 倾斜 15%，Life 维持、Go 控投。数据来自 dws_sales_daily → dws_sales_monthly。",
          chartType: "pareto",
          data: {
            labels: ["跃动Pro", "跃动Life", "跃动Go", "其他"],
            values: [4920, 3180, 1850, 420],
            cumulative: [52, 86, 95, 100],
          },
        },
        {
          id: "abc",
          title: "ABC 分类",
          aliases: "ABC 分析法 / 重点管理分类",
          explain:
            "按价值贡献将管理对象划分为A（核心）、B（重要）、C（一般）三类，并配套差异化的监控频率、库存策略与审批权限。是帕累托分析在管理落地中的标准应用。",
          businessQuestion: "在资源有限的情况下，哪些SKU或门店应重点监控，哪些可例行审视？",
          portfolio:
            "品牌 ABC：A=跃动Pro/Life（日监控、优先补货），B=跃动Go（周复盘），C=配件（月审视、清仓优先）；A 类 SKU 占库存资金 68%。规则写在库存看板 v_inventory_monitor 的 alert_level。",
          chartType: "abc-table",
          data: {
            rows: [
              { item: "跃动Pro", share: 52, cls: "A", policy: "日监控 · 优先补货" },
              { item: "跃动Life", share: 34, cls: "A", policy: "日监控 · 促销联动" },
              { item: "跃动Go", share: 10, cls: "B", policy: "周复盘 · 控库存" },
              { item: "配件/其他", share: 4, cls: "C", policy: "月审视 · 清仓优先" },
            ],
          },
        },
        {
          id: "bcg",
          title: "波士顿矩阵",
          aliases: "BCG 矩阵 / 四象限分析 / 增长-份额矩阵",
          explain:
            "以市场增长率和相对市场份额为两个维度，将业务单元划分至明星、金牛、问题、瘦狗四个象限，分别对应加大投入、维持收割、选择性培育与收缩退出等策略。",
          businessQuestion: "各品牌与渠道组合应加大投入、维持运营还是收缩退出？",
          portfolio:
            "品牌×渠道落点：抖音×Pro=明星（高增高份额，加投），天猫×Life=金牛（份额高增速放缓，稳现金流），线下×Go=瘦狗（坪效低于盈亏平衡，纳入关店评估）。见渠道分析看板与 P2 资源配置类路径。",
          chartType: "bcg",
          data: {
            points: [
              { name: "抖音·Pro", x: 38, y: 22, quadrant: "明星" },
              { name: "天猫·Life", x: 32, y: 8, quadrant: "金牛" },
              { name: "抖音·Go", x: 12, y: 18, quadrant: "问题" },
              { name: "线下·Go", x: 6, y: -5, quadrant: "瘦狗" },
              { name: "天猫·Pro", x: 28, y: 12, quadrant: "金牛" },
            ],
          },
        },
      ],
    },
    {
      id: "diagnosis",
      name: "诊断分析类",
      tagline: "",
      methods: [
        {
          id: "rca",
          title: "根因分析",
          aliases: "RCA / Root Cause Analysis / 5 Why",
          explain:
            "从表面现象逐层追问原因，直至定位可执行的根本原因，而非停留在结果描述。常用方法包括5 Why、鱼骨图与假设验证树。",
          businessQuestion: "毛利率下降的直接原因与根本原因分别是什么？涉及折扣、成本、结构还是退货？",
          portfolio:
            "Life 毛利率 52%→48%：品牌→渠道（抖音）→品类（鞋类）→根因大促折扣率 25%→42%，影响毛利约 -1,400 万。完整路径见 P2 第二层利润类 playbook，SQL 下钻 dwd_sales_wide + dim_channel。",
          chartType: "rca-tree",
          data: {
            nodes: [
              "毛利率下降 4pct",
              "→ 跃动Life 拖累",
              "→ 抖音渠道",
              "→ 鞋类折扣 42%",
              "→ 根因：6·18 满减叠加达人券",
            ],
          },
        },
        {
          id: "attribution",
          title: "归因分析",
          aliases: "因素分解 / 贡献度分析 / Shapley 近似",
          explain:
            "当结果由多个因素共同驱动时，量化各因素对变动的贡献度，例如收入变动中价格、销量、结构与退货的分别影响。可采用差额分解或回归系数等方法。",
          businessQuestion: "本期收入变动中，销量、均价、退货与结构变化各贡献多少？",
          portfolio:
            "2026-06 净收入环比 +2.1%（+220 万）分解：销量 +310 万、均价 -90 万、退货拖累 -40 万、结构变化 +40 万。写入月度经营会变动桥接附件，数据源 dws_sales_daily 的 revenue_mom_pct 与订单量拆解。",
          chartType: "waterfall",
          data: {
            steps: [
              { name: "上月", value: 10280 },
              { name: "销量", value: 310 },
              { name: "均价", value: -90 },
              { name: "退货", value: -40 },
              { name: "结构", value: 40 },
              { name: "本月", value: 10500 },
            ],
          },
        },
        {
          id: "drilldown",
          title: "下钻分析",
          aliases: "多维下钻 / OLAP Drill-down / 维度拆解",
          explain:
            "从汇总指标出发，按时间、品牌、渠道、品类、SKU等维度逐层展开，定位异常所在的具体维度组合。是财务BP定位问题的基础方法。",
          businessQuestion: "整体退货率偏高时，异常集中在哪些品牌、渠道与品类？",
          portfolio:
            "退货率下钻：全公司 18% → 跃动Life 22% → 抖音 26% → 服装 31%。触发 P2 退货类路径，用 dws_sales_daily 按 brand_id/channel_id/category_id 聚合，再回 dwd_sales_wide 抽 200 单复核。",
          chartType: "drill-table",
          data: {
            rows: [
              { level: "全公司", dim: "—", metric: "退货率 18.0%" },
              { level: "品牌", dim: "跃动Life", metric: "22.0%" },
              { level: "渠道", dim: "抖音", metric: "26.0%" },
              { level: "品类", dim: "服装", metric: "31.0%" },
            ],
          },
        },
        {
          id: "correlation",
          title: "相关性分析",
          aliases: "相关分析 / Pearson 相关 / 散点相关",
          explain:
            "检验两个指标是否同向变动，以相关系数 r 衡量（-1 至 +1）。|r| 接近 1 表示关系较强，但相关不等于因果，需结合业务逻辑判断。",
          businessQuestion: "广告投入与收入是否存在显著相关？库存天数与现金流的关系如何？",
          portfolio:
            "2026-06 各渠道广告费 vs 净收入 r=0.87（强正相关）；但抖音 ROAS 从 3.0→2.1 时，优先查投放结构而非收入口径。散点图建在渠道分析看板，数据 ods_ad_cost + dws_sales_daily。",
          chartType: "scatter",
          data: {
            r: 0.87,
            points: [
              { channel: "抖音", ad: 1850, revenue: 5200 },
              { channel: "天猫", ad: 920, revenue: 3100 },
              { channel: "线下直营", ad: 180, revenue: 2800 },
              { channel: "其他", ad: 320, revenue: 870 },
            ],
          },
        },
      ],
    },
    {
      id: "conversion",
      name: "转化分析类",
      tagline: "",
      methods: [
        {
          id: "funnel",
          title: "漏斗分析",
          aliases: "转化漏斗 / AARRR 漏斗 / 步骤流失分析",
          explain:
            "将业务过程的关键步骤绘制为漏斗，分析各步骤留存率与流失率，识别流失最显著的环节。零售场景常用于订单、支付、发货、签收与退货全流程。",
          businessQuestion: "从下单到成交的哪个环节流失率最高？是引流质量、支付还是履约问题？",
          portfolio:
            "订单履约漏斗（2026-06）：下单 12.8 万单 → 支付 12.1 万（94.5%）→ 发货 11.6 万（95.9%）→ 签收 11.2 万（96.6%）→ 无退货 9.8 万（87.5%）。签收→无退货环节流失最大，联动退货类下钻与客服质检报表。",
          chartType: "funnel",
          data: {
            steps: [
              { name: "下单", value: 128000, rate: 100 },
              { name: "支付", value: 121000, rate: 94.5 },
              { name: "发货", value: 116000, rate: 95.9 },
              { name: "签收", value: 112000, rate: 96.6 },
              { name: "无退货", value: 98000, rate: 87.5 },
            ],
          },
        },
        {
          id: "cohort",
          title: "同期群分析",
          aliases: "队列分析 / Cohort Analysis / 分群留存",
          explain:
            "按首次发生时间将用户或客户分组，跟踪各组在后续期间的复购、客单价与留存表现，用于评估获客质量变化。",
          businessQuestion: "不同批次新客的复购与留存表现如何？哪类获客渠道留存更优？",
          portfolio:
            "按首购月份分群：2025-11 新客 3 个月复购率 28%，2026-03 新客 3 个月复购率 35%，说明近期抖音内容种草质量提升。同期群表挂在会员运营附录，订单来源 dwd_sales_wide.customer_id + dim_date。",
          chartType: "cohort-heatmap",
          data: {
            cohorts: ["2025-11", "2026-01", "2026-03"],
            months: ["M0", "M1", "M2", "M3"],
            values: [
              [100, 42, 31, 28],
              [100, 45, 33, 30],
              [100, 48, 38, 35],
            ],
          },
        },
      ],
    },
    {
      id: "forecast",
      name: "时间序列预测类",
      tagline: "",
      methods: [
        {
          id: "yoy-extrapolation",
          title: "同比/环比增长率外推法",
          aliases: "趋势外推 / 增长率法 / Run-rate",
          explain:
            "基于最近一期的同比或环比增速，假设未来延续相同趋势，快速得到短期预测区间。适用于经营计划的初步估算，需明确标注假设条件。",
          businessQuestion: "按当前增速，下季度能否完成目标？全年 run-rate 大致是多少？",
          portfolio:
            "2026-06 净收入同比 +12.3%、环比 +2.1%；基准情景假设同比增速维持 → Q3 预测 2.7 亿（区间 2.5–2.9 亿）。写入 P2 第三层收入预测类产出物，对照 dws_sales_daily.revenue_yoy_pct。",
          chartType: "compare-table",
          data: {
            metric: "净收入（万元）",
            current: 10500,
            yoy: 12.3,
            mom: 2.1,
            baseRatio: 168,
            basePeriod: "2024-01",
          },
        },
        {
          id: "ma",
          title: "移动平均法",
          aliases: "MA / Simple Moving Average / N 期均线",
          explain:
            "取最近 N 期（如3个月）的算术平均值作为下一期预测，可平滑单月波动。N 越大曲线越平稳，但对拐点响应越慢。",
          businessQuestion: "剔除大促波动后，近几个月的常态收入水平是多少？",
          portfolio:
            "净收入 3 个月移动平均：2026-07 预测值 1.026 亿（基于 4–6 月均值），作为 Q3 经营会基准情景下限；与指数平滑结果交叉验证。",
          chartType: "ma",
          data: {
            months: ["2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07(F)"],
            actual: [9200, 8800, 10200, 9500, 8900, 9800, 10100, 10300, 10500, null],
            ma3: [null, null, 9400, 9500, 9067, 9400, 9733, 10067, 10300, 10267],
            wma3: [null, null, 9350, 9480, 9020, 9380, 9700, 10020, 10280, 10290],
            es: [9200, 9080, 9416, 9441, 9279, 9435, 9635, 9835, 10035, 10175],
          },
        },
        {
          id: "wma",
          title: "加权移动平均法",
          aliases: "WMA / Weighted MA",
          explain:
            "在移动平均基础上为近期数据赋予更高权重（如3:2:1），兼顾噪声平滑与趋势响应，适用于短期动能明显的业务。",
          businessQuestion: "近期回暖趋势能否在预测中更快体现，而不被前期淡季数据过度拉低？",
          portfolio:
            "3 期加权 MA（权重 3:2:1）：2026-07 预测 1.029 亿，高于简单 MA 的 1.026 亿，反映 5–6 月回暖；用于乐观情景上限参考。",
          chartType: "wma",
          data: {
            months: ["2026-04", "2026-05", "2026-06", "2026-07(F)"],
            actual: [10100, 10300, 10500, null],
            wma: [null, null, null, 10290],
            weights: "3:2:1",
          },
        },
        {
          id: "es",
          title: "指数平滑法",
          aliases: "指数加权移动平均 / EWMA / Holt 平滑",
          explain:
            "对历史数据按指数递减赋权，近期观测权重更高，公式为 ŷₜ = α·yₜ + (1-α)·ŷₜ₋₁。α 越大对最新数据越敏感，越小则越平稳。",
          businessQuestion: "如何在跟踪最新走势的同时，降低单月大促对预测的干扰？",
          portfolio:
            "净收入指数平滑（α=0.3）：2026-07 预测 1.0175 亿，介于 MA 与 WMA 之间；α 敏感性见第六层敏感性分析。预测结果同步到现金流看板滚动 13 周。",
          chartType: "es",
          data: {
            months: ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07(F)"],
            actual: [9500, 8900, 9800, 10100, 10300, 10500, null],
            es: [9500, 9320, 9464, 9655, 9849, 10044, 10175],
            alpha: 0.3,
          },
        },
        {
          id: "seasonal",
          title: "季节性指数法",
          aliases: "季节因子 / Seasonal Index / 旺淡季系数",
          explain:
            "以各月均值除以全年月均得到12个月的季节性指数，大于1为旺季，小于1为淡季。预测时将趋势值乘以当月季节因子。",
          businessQuestion: "春节淡季收入通常下降多少？大促月份应如何配置备货与预算？",
          portfolio:
            "历史季节指数：11–12 月 1.25（双11/年货节），2 月 0.72（春节淡季）。2026-07 基准预测 1.02 亿 × 7 月指数 0.92 ≈ 0.94 亿。排产与营销预算按指数分配，见库存分析看板。",
          chartType: "seasonal",
          data: {
            months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            index: [0.88, 0.72, 0.95, 0.98, 1.02, 1.05, 0.92, 0.90, 1.08, 1.12, 1.25, 1.13],
          },
        },
      ],
    },
    {
      id: "finance",
      name: "财务评估类",
      tagline: "",
      methods: [
        {
          id: "dupont",
          title: "杜邦分析",
          aliases: "杜邦恒等式 / ROE 拆解 / DuPont Analysis",
          explain:
            "将净资产收益率 ROE 分解为净利率、资产周转率与权益乘数三个因子，用于识别 ROE 变动的主要驱动因素。",
          businessQuestion: "ROE 下降是净利率、资产周转还是杠杆变化所致？",
          portfolio:
            "2026-06 杜邦：ROE 15.2% = 净利率 8.1% × 资产周转 1.42 × 权益乘数 1.32；同比下滑主因净利率 -1.2pct（Life 折扣）。见 v_dupont 与杜邦看板 shell.html#dupont。",
          chartType: "dupont",
          data: {
            roe: 15.2,
            margin: 8.1,
            turnover: 1.42,
            leverage: 1.32,
            drag: "净利率 -1.2pct",
          },
        },
        {
          id: "roi",
          title: "ROI 分析",
          aliases: "投资回报率 / Return on Investment / ROAS（广告场景）",
          explain:
            "衡量单位投入对应的回报水平，ROI =（收益 - 成本）/ 成本。营销场景常用 ROAS = 收入/广告费，用于评估渠道、活动与门店的投入价值。",
          businessQuestion: "各渠道广告投入的回报水平如何？是否应调整投放规模？",
          portfolio:
            "2026-06 渠道 ROI：天猫 3.5（行业基准 2.8，建议加投 10%），抖音 ROAS 2.1（从 3.0 下滑，暂停放量）、线下 8.2（自然流量为主）。结论写入 P2 第四层营销效果类。",
          chartType: "roi-bar",
          data: {
            items: [
              { name: "天猫", roi: 3.5, bench: 2.8 },
              { name: "抖音", roi: 2.1, bench: 2.5 },
              { name: "线下", roi: 8.2, bench: 4.0 },
            ],
          },
        },
        {
          id: "cvp",
          title: "盈亏平衡分析",
          aliases: "CVP 分析 / 本量利分析 / Break-even Analysis",
          explain:
            "计算盈亏平衡点 = 固定成本 /（单价 - 单位变动成本），并评估安全边际，即当前收入相对保本点的距离。",
          businessQuestion: "门店或业务单元达到盈亏平衡所需的收入规模是多少？促销对保本量的影响如何？",
          portfolio:
            "线下 Go 店 CVP：月固定成本 45 万，毛利率 38%，保本收入 118 万/月；当前 92 万，安全边际 -22%。关店/缩租决策见 dws_sales_monthly + dws_expense_monthly（本量利推导） 与本量利看板 shell.html#cvp。",
          chartType: "cvp",
          data: {
            fixed: 45,
            marginPct: 38,
            breakEven: 118,
            actual: 92,
            safetyPct: -22,
          },
        },
      ],
    },
    {
      id: "optimization",
      name: "优化决策类",
      tagline: "",
      methods: [
        {
          id: "sensitivity",
          title: "敏感性分析",
          aliases: "What-if 分析 / 情景分析 / 单因素敏感度",
          explain:
            "在固定其他条件的前提下，单独改变一个变量（如折扣率、广告费、退货率），观察结果指标的变化幅度，识别对结果最敏感的杠杆因素。",
          businessQuestion: "退货率、广告费或折扣率变动对利润的影响程度如何？",
          portfolio:
            "敏感性矩阵（净利润）：退货率 +2pct → 利润 -680 万；广告费 -10% → 收入 -4.2%、利润 -320 万；折扣率 +5pct → 毛利 -1,100 万。退货最敏感，优先 P2 退货类根因。见预算执行 What-if 附件。",
          chartType: "tornado",
          data: {
            base: 3200,
            factors: [
              { name: "折扣率+5pct", impact: -1100 },
              { name: "退货率+2pct", impact: -680 },
              { name: "广告费-10%", impact: -320 },
              { name: "成本+3%", impact: -280 },
            ],
          },
        },
        {
          id: "marginal",
          title: "边际分析",
          aliases: "边际贡献 / Marginal Analysis / 增量决策",
          explain:
            "关注增量投入或增量销售带来的边际收益与边际成本，而非仅看平均水平。边际贡献为正时具备执行价值，直至边际收益等于边际成本。",
          businessQuestion: "追加广告投入或新增门店的增量收益是否覆盖增量成本？",
          portfolio:
            "边际投放：抖音减投 100 万（边际 ROAS 1.6 < 2.0 阈值）挪天猫（边际 ROAS 4.2），预计月利润 +180 万。写入 P2 第五层资源配置类建议，对照渠道边际 ROAS 曲线。",
          chartType: "marginal",
          data: {
            scenarios: [
              { action: "维持现状", deltaProfit: 0 },
              { action: "抖音+100万", deltaProfit: -40 },
              { action: "天猫+100万", deltaProfit: 220 },
              { action: "抖音-100万→天猫+100万", deltaProfit: 180 },
            ],
          },
        },
      ],
    },
  ],
};
