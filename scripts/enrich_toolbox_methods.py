# -*- coding: utf-8 -*-
"""Enrich ANALYSIS_TOOLBOX methods with what/when/purpose/how fields."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(r"d:\cursor\财务数据分析")

CATALOG: dict[str, dict[str, str]] = {
    "pareto": {
        "what": "帕累托分析（又称二八定律）是一种优先级排序方法：把贡献度从高到低排列，并画出累计占比曲线，用来找出「少数关键项」。经验上约 20% 的对象往往贡献约 80% 的结果。",
        "when": "需要在品牌、渠道、SKU、门店、费用科目、退货原因等对象中做资源取舍时使用；常见于经营复盘、预算分配、库存与促销优先级讨论。",
        "purpose": "把有限资源（预算、人力、库存、管理注意力）集中到贡献最大的少数对象上，避免平均用力，提高投入产出比。",
        "how": "①确定分析对象与指标（如品牌×净收入）；②按指标从高到低排序；③计算累计占比并画柱线组合图；④标出累计约 80% 的分界；⑤对头部对象制定加投/重点监控策略，对尾部制定控投、清仓或收缩策略。",
    },
    "abc": {
        "what": "ABC 分类是把管理对象按价值贡献分成 A（核心）、B（重要）、C（一般）三类，并配套不同管理强度的重点管理方法，是帕累托思想在日常运营中的落地版本。",
        "when": "SKU、门店、客户、供应商等数量多、无法一视同仁管理时使用；适合库存策略、巡店频率、审批权限设计。",
        "purpose": "用差异化管理规则把精力花在真正影响业绩与风险的对象上，降低管理成本并控住关键风险。",
        "how": "①选价值指标并排序累计占比；②按经验阈值切分（如 A≈累计 70–80%，B≈至 90–95%，其余为 C）；③为每类写清监控频率、补货/审批/促销政策；④写入看板预警字段并定期复核分类。",
    },
    "bcg": {
        "what": "波士顿矩阵以「市场增长率」和「相对市场份额」两个维度，把业务单元划入明星、金牛、问题、瘦狗四个象限，并对应不同资源配置策略。",
        "when": "多品牌、多渠道组合需要决定加投、维持、培育或退出时使用；适合年度/半年度战略与渠道组合评审。",
        "purpose": "用统一框架比较业务单元位置，避免凭感觉投放，明确「养谁、收谁、砍谁」。",
        "how": "①选定业务单元（如品牌×渠道）；②计算增长率与相对份额并落点到四象限；③对照策略：明星加投、金牛收割现金流、问题择优培育、瘦狗收缩；④与财务/运营对齐行动清单。",
    },
    "rca": {
        "what": "根因分析（RCA）是从结果现象逐层追问原因，直到找到可采取行动的根本原因，而不是停在表面结果描述。常用 5 Why、鱼骨图、假设树。",
        "when": "指标异常（毛利率、退货率、转化率等）已确认，但还不知道「到底该改什么」时使用。",
        "purpose": "把问题定位到可执行动作，避免只报数不闭环，防止反复在症状上打补丁。",
        "how": "①写清异常事实与影响金额；②按维度下钻缩小范围；③连续追问为什么并验证假设；④区分直接原因与根因；⑤给出可落地的纠正措施与验证指标。",
    },
    "attribution": {
        "what": "归因分析是在结果由多个因素共同驱动时，量化各因素对变动的贡献度（如量、价、结构、退货），回答「涨跌各是谁造成的」。",
        "when": "收入、利润、DAU、订购量等发生明显环比/同比变动，需要写经营复盘或向管理层解释原因时使用。",
        "purpose": "把「总变化」拆成可解释的因子贡献，支持针对性决策而不是笼统归因。",
        "how": "①选定基期与本期；②列出候选因子并保证口径一致；③用差额分解/桥接（瀑布图）量化各因子；④标注最大正负贡献；⑤对头部因子继续下钻验证。",
    },
    "drilldown": {
        "what": "下钻分析是从汇总指标按维度层层展开（品牌→渠道→品类→SKU 等），定位异常落在哪一个交叉格子。",
        "when": "总指标异常，但不知道是局部问题还是全局问题时使用；是诊断类分析的标准第一步。",
        "purpose": "快速缩小问题范围，把「公司整体不好」变成「具体哪一块不好」。",
        "how": "①从总指标出发；②按预设维度路径逐层展开；③每层对比贡献与变化率；④停在可行动层级；⑤输出异常格子清单并衔接下一步根因/归因。",
    },
    "correlation": {
        "what": "相关性分析衡量两个指标是否同向/反向变动（如相关系数 r），用于发现伴随关系；相关不等于因果。",
        "when": "怀疑广告费与收入、折扣与退货、时长与留存等存在联动，需要先做探索验证时使用。",
        "purpose": "筛选值得深入验证的关系，避免在无关联指标上浪费诊断时间。",
        "how": "①选成对指标与同期样本；②画散点并计算相关系数；③结合业务判断是否可能因果；④对高相关对做控制变量或实验验证；⑤写入分析结论时明确「相关≠因果」。",
    },
    "funnel": {
        "what": "漏斗分析把用户/订单路径拆成有序步骤，计算每步转化率与流失率，找出流失最严重的环节。",
        "when": "转化链路长（浏览→下单→支付→签收，或曝光→点击→验证→确认）且整体转化不达标时使用。",
        "purpose": "把优化火力对准流失最大的一步，而不是平均优化整条链路。",
        "how": "①定义步骤与口径；②统计各步人数/单量；③算步间转化与流失；④对比渠道/端型/活动拆解；⑤对瓶颈步做专项实验或流程改造。",
    },
    "cohort": {
        "what": "同期群（Cohort）分析按首次行为时间把用户分成批次，跟踪各批在后续时期的留存/复购表现。",
        "when": "评估获客质量变化、产品改版或大促对新客长期价值的影响时使用。",
        "purpose": "区分「整体变好」是老客拉动还是新客质量提升，避免被总量指标误导。",
        "how": "①定义 cohort 起点（首购/首活日期）；②选留存窗口（D1/D7/D30 或月复购）；③做热力图或曲线对比；④拆端型/渠道；⑤对差 cohort 回溯获客来源与首单体验。",
    },
    "yoy-extrapolation": {
        "what": "同比/环比外推是用近期增速假设在短期内延续，快速得到基准预测与简单区间。",
        "when": "需要快速回答「按当前趋势下季度能否达标」且没有复杂模型条件时使用。",
        "purpose": "用低成本得到可沟通的短期预测基线，作为目标管理与预案起点。",
        "how": "①取可靠历史增速；②设定延续假设与情景（乐观/基准/保守）；③外推目标期；④叠加已知事件修正（大促/淡季）；⑤跟踪预测偏差并迭代。",
    },
    "ma": {
        "what": "移动平均用最近若干期的均值平滑短期波动，估计「常态水平」。",
        "when": "序列噪音大、大促扰动多，需要看清趋势中枢时使用。",
        "purpose": "剔除偶发尖峰后估计常态，作为排产、备货与基线对比的参考。",
        "how": "①选窗口（如 3 个月）；②计算滚动均值；③与实际值对比识别异常；④用最新 MA 作为短期基线；⑤大促月可单独标注或剔除。",
    },
    "wma": {
        "what": "加权移动平均给近期数据更高权重，比简单移动平均更贴近最新趋势。",
        "when": "业务正在转向（增速变化），希望预测更跟近期而不是平均历史时使用。",
        "purpose": "在平滑噪音的同时提高对近期变化的敏感度。",
        "how": "①设定权重（近高远低且和为 1）；②计算加权均值；③与 MA/实际对比；④用于短期预测；⑤定期回顾权重是否仍合理。",
    },
    "es": {
        "what": "指数平滑用平滑系数 α 对历史做指数衰减加权，越近的数据影响越大。",
        "when": "需要可持续更新的平滑预测，且希望参数少、易解释时使用。",
        "purpose": "得到可滚动刷新的短期预测值，兼顾稳定与跟新。",
        "how": "①选 α（常用 0.2–0.4）；②递推 S_t=α·Y_t+(1-α)·S_{t-1}；③用 S_t 预测下一期；④用回测误差调 α；⑤大促可用事件调整。",
    },
    "seasonal": {
        "what": "季节性指数法用历史同期结构计算各月（或周）相对均值的指数，旺季>1、淡季<1。",
        "when": "业务有明显淡旺季（大促、春节、开学季等），预测与备货必须考虑季节时使用。",
        "purpose": "把「平均月」预测还原成符合淡旺季的计划量，减少旺季缺货与淡季积压。",
        "how": "①用多年同月数据算季节指数；②得到去季节化趋势预测；③预测×季节指数；④结合今年特殊事件微调；⑤季后复盘指数是否漂移。",
    },
    "dupont": {
        "what": "杜邦分析把 ROE 拆成净利率×资产周转×权益乘数，定位盈利能力、运营效率与杠杆哪一层在变化。",
        "when": "ROE 或净资产回报异常，需要向管理层解释财务结构驱动时使用。",
        "purpose": "把一个综合指标拆成可行动的财务杠杆点，明确该改善利润率、周转还是资本结构。",
        "how": "①计算三因子及 ROE；②做同比/环比桥接；③定位主拖累因子；④下钻到品牌/费用/库存天数等；⑤形成财务与经营改进动作。",
    },
    "roi": {
        "what": "ROI 分析比较投入与回报（回报/投入），用于评估营销、项目或渠道是否划算。",
        "when": "需要比较不同投放、活动、项目的效率，或决定是否加投时使用。",
        "purpose": "用统一尺子比较投入产出，支持预算向高 ROI 倾斜。",
        "how": "①定义投入与回报口径；②计算 ROI 并与基准对比；③分渠道/活动排名；④结合边际 ROI 判断加投边界；⑤低 ROI 项优化或收缩。",
    },
    "cvp": {
        "what": "本量利（CVP）分析研究成本、销量与利润关系，计算盈亏平衡点与安全边际。",
        "when": "定价、开店、促销折扣、产能扩张等决策需要知道「卖多少才不亏」时使用。",
        "purpose": "量化保本门槛与安全垫，降低决策拍脑袋风险。",
        "how": "①拆分固定/变动成本与单价；②算保本销量/收入；③算安全边际；④做价格/成本敏感性；⑤把结论用于促销深度与开店评估。",
    },
    "sensitivity": {
        "what": "敏感性分析改变关键假设（价格、成本、转化率等），观察结果指标的变化幅度，找出最敏感因子。",
        "when": "方案依赖多个假设，需要回答「哪个假设错了影响最大」时使用。",
        "purpose": "识别高风险假设，优先监控与对冲最敏感变量。",
        "how": "①列关键假设与基准情景；②单因子±变动看结果；③画龙卷风图排序影响；④对头部因子设预警与预案；⑤必要时做多因子情景。",
    },
    "marginal": {
        "what": "边际分析比较「多做一单位」带来的增量收入与增量成本，判断是否值得继续加码。",
        "when": "考虑加投、加库存、加班、加流量，需要判断是否已进入收益递减区时使用。",
        "purpose": "避免总 ROI 还好看但边际已经亏钱的过度投入。",
        "how": "①定义增量行动；②估算增量收入与增量成本；③算边际贡献/边际 ROI；④找收益递减拐点；⑤把预算停在拐点之前。",
    },
    "persona": {
        "what": "用户画像分析按端型、地市、设备等属性交叉描述用户是谁、规模多大、行为偏好如何。",
        "when": "制定内容、运营或投放策略前，需要明确核心人群时使用。",
        "purpose": "让策略对准真实主力用户，避免「为平均用户」设计产品与活动。",
        "how": "①选定画像维度；②拉最新活跃快照交叉统计；③对比渗透与贡献；④定义核心人群包；⑤把画像结论同步到运营与投放。",
    },
    "lifecycle": {
        "what": "生命周期分析把用户划入新注册→激活→活跃→沉默→流失等阶段，观察规模与迁移。",
        "when": "净增转负、激活变差或沉默堆积时，需要看增长卡在哪一阶段时使用。",
        "purpose": "定位增长瓶颈阶段，匹配拉新、促活或挽回动作。",
        "how": "①定义阶段规则；②统计各阶段人数与日净增；③看迁移流向；④对瓶颈阶段定策略；⑤用看板跟踪阶段占比变化。",
    },
    "segment": {
        "what": "用户分群把用户按状态、价值或行为分成可运营的群组，并配套差异化动作。",
        "when": "运营资源有限，不能对所有用户同一套策略时使用。",
        "purpose": "提高触达效率，把预算与内容推给最合适的人群。",
        "how": "①选分群维度与规则；②计算各群规模与价值；③为每群写策略；④落地触达与实验；⑤复盘转化与成本。",
    },
    "retention": {
        "what": "留存分析按首次活跃批次跟踪用户在后续第 N 日/周是否回访，评估获客与产品粘性。",
        "when": "拉新很多但活跃不稳，或改版后需要看长期质量时使用。",
        "purpose": "判断增长是「进来就走」还是「留下来」，指导获客与体验优化。",
        "how": "①定义首活与回访口径；②做 cohort 留存曲线/热力图；③拆端型渠道；④定位掉队节点；⑤对低留存来源降权或改体验。",
    },
    "rfm": {
        "what": "RFM 用最近活跃（R）、频次（F）、金额（M）三维给用户分层，区分高价值与流失风险人群。",
        "when": "需要做精准运营、挽回或会员分层时使用。",
        "purpose": "把运营动作对准价值与风险，提高 ROI。",
        "how": "①计算 R/F/M 并分箱；②合成层级标签；③统计各层规模；④制定触达策略；⑤跟踪挽回率与复购。",
    },
    "ltv": {
        "what": "LTV 估算用户生命周期内的订购/分成贡献，并常与 CAC 比较长期是否回本。",
        "when": "评估渠道质量、定价或会员策略是否长期划算时使用。",
        "purpose": "避免只看短期转化，忽略用户长期价值。",
        "how": "①定义生命周期与收入口径；②按入口/套餐估 LTV；③对比 CAC 得 LTV/CAC；④低比值入口收缩；⑤高价值人群加码运营。",
    },
    "northstar": {
        "what": "北极星拆解把核心指标拆成可管理的子指标树，定位增长到底靠哪一根树枝。",
        "when": "北极星波动但团队对驱动因素说法不一、需要对齐目标时使用。",
        "purpose": "把组织目标拆到可执行的子指标与责任人。",
        "how": "①确认北极星定义；②画出乘法/加法拆解；③量化各分支贡献；④找主驱动与主拖累；⑤把子指标纳入例会监控。",
    },
    "ab": {
        "what": "A/B 测试通过随机分组对比实验组与对照组，用统计显著性判断改动是否真有效。",
        "when": "产品/运营改版准备全量前，需要证据而不是体感时使用。",
        "purpose": "降低错误全量风险，用数据决定推或不推。",
        "how": "①写假设与成功标准；②算样本量与周期；③随机分流并埋点；④对比核心指标与 p 值；⑤达标全量，不达标迭代。",
    },
    "experiment-design": {
        "what": "增长实验设计是在开跑前明确假设、指标、样本、周期与成功线，保证实验可判定。",
        "when": "想法很多但实验资源有限，或历史上做过无效实验时使用。",
        "purpose": "提高实验命中率，避免「做了但说不清有没有用」。",
        "how": "①一句话假设；②定唯一核心指标与护栏指标；③估算样本量；④写成功/失败标准；⑤评审通过后再上线。",
    },
    "churn": {
        "what": "流失预警用沉默天数、行为衰减等信号给用户打流失风险分，提前提取将流失人群。",
        "when": "沉默池扩大、续订下滑，需要主动挽回而不是等流失后再拉时使用。",
        "purpose": "把挽回窗口前移，提高挽回成功率并降低获客替代成本。",
        "how": "①定义风险规则；②每日/每周出风险名单；③分风险等级配策略；④触达并记录结果；⑤回测规则精度并调参。",
    },
    "marginal-roi": {
        "what": "边际 ROI 看「再多投一点」带来的增量回报，识别收益递减拐点。",
        "when": "总 ROI 仍可接受，但怀疑继续加流量已经不划算时使用。",
        "purpose": "防止在递减区盲目加投，把预算停在有效区间。",
        "how": "①按流量分位估算分段 ROI；②画边际曲线；③标出 ROI<1 或明显下降的区间；④设投放上限；⑤定期重估。",
    },
    "channel-scorecard": {
        "what": "渠道评分卡把 CAC、LTV、留存、转化、ROI 等加权合成综合分，用于入口/渠道排名。",
        "when": "多入口并行，需要月度/周度做投放取舍时使用。",
        "purpose": "用一张表对齐渠道质量，减少单指标片面决策。",
        "how": "①选指标与权重；②标准化打分；③汇总排名；④对低分项诊断；⑤调整预算并复盘。",
    },
    "path": {
        "what": "行为路径分析追踪用户关键动作序列，识别高频路径与主要流失节点。",
        "when": "转化差但漏斗步太粗，需要看「中间怎么走丢的」时使用。",
        "purpose": "找到可改的页面/交互节点，而不是只知道总转化低。",
        "how": "①定义关键事件；②统计 Top 路径与转移概率；③标流失最大边；④对节点做改版实验；⑤对比路径变化。",
    },
    "fishbone": {
        "what": "鱼骨图（因果图）从人、机、料、法、环等维度系统列举可能原因，再收敛到关键根因。",
        "when": "质量/效率问题原因候选多、讨论发散时使用。",
        "purpose": "结构化穷尽原因，避免只盯一个表象因素。",
        "how": "①写清问题结果；②按 5M1E 开脑暴；③用数据验证分支；④标出主因；⑤制定纠正与预防措施。",
    },
    "spc": {
        "what": "统计过程控制用控制图监控过程是否稳定，区分正常波动与异常波动。",
        "when": "需要判断产线过程是否失控、是否该停机排查时使用。",
        "purpose": "早发现异常，减少大批量不良流出。",
        "how": "①选关键质量特性；②建控制限；③日常描点；④出界/链规则触发预警；⑤查原料/设备并闭环。",
    },
    "fivewhy": {
        "what": "5Why 通过连续追问「为什么」层层深入，直到找到可制度化解决的根因。",
        "when": "同类不良反复出现，表面措施无效时使用。",
        "purpose": "把问题从「灭火」推进到「建制度/改流程」。",
        "how": "①描述问题；②连续追问并取证；③停在可行动根因；④制定对策与责任人；⑤验证不再复发。",
    },
    "oee": {
        "what": "OEE（设备综合效率）= 时间开动率 × 性能开动率 × 良品率，用来拆解设备损失在哪里。",
        "when": "产能不足或设备效率投诉多，需要定位损失结构时使用。",
        "purpose": "把「设备不行」拆成停机、速度损失或质量损失，便于对症改进。",
        "how": "①采集可用/性能/质量数据；②计算 OEE 三因子；③对短板因子下钻原因；④排改善优先级；⑤跟踪 OEE 回升。",
    },
    "bottleneck": {
        "what": "产能瓶颈分析识别整条价值链中约束产出的最慢环节。",
        "when": "总产能上不去、在制品堆积或交期不稳时使用。",
        "purpose": "把改善资源投到真正限制系统产出的工序。",
        "how": "①测各工序产能/利用率；②找最低环节与堆积点；③评估扩能/排程/并行；④实施后复核系统产出；⑤防止瓶颈转移。",
    },
    "unitcost": {
        "what": "单位成本趋势分析跟踪单位产品成本随时间的变化，并拆到材料、人工、制造费用。",
        "when": "成本上涨或报价承压，需要解释涨因时使用。",
        "purpose": "定位成本上升来源，支持降本与定价。",
        "how": "①统一单位成本口径；②做月度趋势；③结构拆解；④对照产量与单价；⑤形成降本动作清单。",
    },
    "supplier_score": {
        "what": "供应商评分卡从质量、交付、价格等维度综合打分，支持准入、续约与份额分配。",
        "when": "多供应商并行、需要续约或份额调整决策时使用。",
        "purpose": "用客观分数替代纯关系/纯低价采购。",
        "how": "①定指标与权重；②按期打分汇总；③分级（战略/可替/淘汰）；④谈份额与整改；⑤下期复评。",
    },
}

OVERRIDES: dict[str, dict[str, dict[str, str]]] = {
    "manufacturing": {
        "pareto": {
            "what": "柏拉图（帕累托图）把不良原因按发生次数或损失从高到低排列，并叠加累计百分比曲线，用来找出造成大部分不良的少数原因。",
            "when": "良品率下降、客诉增加，或质量改善资源有限、需要决定「先改哪几类不良」时使用。",
            "purpose": "把改善优先级对准贡献最大的不良类型，用最小投入快速拉回良品率。",
            "how": "①从质量明细按缺陷类型汇总数量/损失；②降序排序并算累计占比；③画柏拉图标出累计约 80% 的 TOP 项；④对 TOP 原因开 RCA/5Why；⑤改善后对比不良结构是否下移。",
        },
    },
}


def fields_for(method_id: str, industry: str) -> dict[str, str] | None:
    return OVERRIDES.get(industry, {}).get(method_id) or CATALOG.get(method_id)


def js_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def find_matching_brace(text: str, open_idx: int) -> int:
    depth = 0
    i = open_idx
    in_str = False
    escape = False
    while i < len(text):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def inject_fields(block: str, fields: dict[str, str]) -> str:
    if re.search(r"\bwhat\s*:", block):
        for k, v in fields.items():
            block = re.sub(
                rf'({k}\s*:\s*)"(?:[^"\\]|\\.)*"',
                lambda m, val=v: m.group(1) + js_str(val),
                block,
                count=1,
            )
        return block

    insert = (
        f"what: {js_str(fields['what'])},\n"
        f"        when: {js_str(fields['when'])},\n"
        f"        purpose: {js_str(fields['purpose'])},\n"
        f"        how: {js_str(fields['how'])},\n        "
    )
    if re.search(r"\bbusinessQuestion\s*:", block):
        return re.sub(r"(businessQuestion\s*:)", insert + r"\1", block, count=1)
    m = re.search(r'(explain\s*:\s*"(?:[^"\\]|\\.)*")\s*,', block)
    if m:
        return block[: m.end()] + "\n        " + insert + block[m.end() :]
    return block


def object_start_before(text: str, pos: int) -> int:
    """Find '{' that starts the object containing text[pos], skipping strings."""
    i = pos
    depth = 0
    in_str = False
    escape = False
    while i >= 0:
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "}":
                depth += 1
            elif ch == "{":
                if depth == 0:
                    return i
                depth -= 1
        i -= 1
    return -1


def patch_file(path: Path, industry: str) -> int:
    text = path.read_text(encoding="utf-8")
    start = text.find("window.ANALYSIS_TOOLBOX")
    if start < 0:
        print(f"SKIP {path}")
        return 0

    head, body = text[:start], text[start:]
    id_re = re.compile(r'\bid\s*:\s*"([^"]+)"')
    selected: list[tuple[int, int, str]] = []
    seen_spans: set[tuple[int, int]] = set()

    for m in id_re.finditer(body):
        mid = m.group(1)
        obj_start = object_start_before(body, m.start())
        if obj_start < 0:
            continue
        obj_end = find_matching_brace(body, obj_start)
        if obj_end < 0:
            continue
        span = (obj_start, obj_end + 1)
        if span in seen_spans:
            continue
        block = body[obj_start : obj_end + 1]
        if "methods:" in block:
            continue
        if re.search(r"\blayer\s*:", block):
            continue
        if "explain" not in block and "businessQuestion" not in block:
            continue
        first_id = id_re.search(block)
        if not first_id or first_id.group(1) != mid:
            continue
        seen_spans.add(span)
        selected.append((obj_start, obj_end + 1, mid))

    selected.sort(key=lambda x: x[0], reverse=True)
    count = 0
    for obj_start, obj_end, mid in selected:
        fields = fields_for(mid, industry)
        if not fields:
            print(f"  no catalog for {mid}")
            continue
        block = body[obj_start:obj_end]
        new_block = inject_fields(block, fields)
        body = body[:obj_start] + new_block + body[obj_end:]
        count += 1

    path.write_text(head + body, encoding="utf-8")
    print(f"OK {path} -> {count} methods (candidates={len(selected)})")
    return count


def main() -> None:
    files = [
        (ROOT / "portfolio/industries/retail/js/analysis-toolbox-data.js", "retail"),
        (ROOT / "retail-finance-analysis/docs/shared/analysis-toolbox-data.js", "retail"),
        (ROOT / "portfolio/industries/internet/js/methodology-playbook-data.js", "internet"),
        (ROOT / "portfolio/industries/manufacturing/js/methodology-playbook-data.js", "manufacturing"),
    ]
    total = 0
    for p, ind in files:
        if p.exists():
            total += patch_file(p, ind)
        else:
            print("MISSING", p)
    print("TOTAL", total)


if __name__ == "__main__":
    main()
