# -*- coding: utf-8 -*-
"""Build expanded BI knowledge tree into lessons/bi.json."""
from __future__ import annotations

import json
from pathlib import Path

OUT = Path(__file__).resolve().parent / "lessons" / "bi.json"


def L(id: str, title: str, level: str, content: str) -> dict:
    return {"id": id, "title": title, "level": level, "content": content.strip() + "\n", "children": []}


def C(id: str, title: str, level: str, intro: str, children: list) -> dict:
    return {
        "id": id,
        "title": title,
        "level": level,
        "content": intro.strip() + "\n",
        "children": children,
        "lessonParent": True,
    }


def D(id: str, title: str, level: str, intro: str, children: list) -> dict:
    return {
        "id": id,
        "title": title,
        "level": level,
        "content": intro.strip() + "\n",
        "children": children,
    }


def lesson(what: str, how: str, where: str, care: str) -> str:
    return (
        f"### 是什么\n\n{what}\n\n"
        f"### 怎么写\n\n{how}\n\n"
        f"### 用在哪\n\n{where}\n\n"
        f"### 注意啥\n\n{care}"
    )


def build() -> dict:
    tree = {
        "id": "bi-root",
        "title": "BI",
        "level": "?",
        "content": (
            "### BI 知识图谱\n\n"
            "四层结构：**领域 → 主题 → 知识点**。\n\n"
            "- 再点中心展开领域扇区\n"
            "- 点主题层层下钻\n"
            "- **倒数第二层**打开章节导读 + 子课列表\n"
            "- **叶节点**打开完整讲义（是什么 / 怎么写 / 用在哪 / 注意啥）\n\n"
            "主线：定位 → 指标与维度 → 语义层 → 取数建模 → 可视化与看板 → "
            "交互 OLAP → 性能 → 治理权限 → 交付 → 工具与场景。"
        ),
        "children": [],
    }

    tree["children"].append(
        D(
            "bi-orient",
            "BI 定位",
            "?",
            "### BI 定位\n\n搞清 BI 在数据链路中的位置，以及和报表/取数/数仓的边界。",
            [
                C(
                    "bi-orient-basics",
                    "是什么与边界",
                    "??",
                    "### 是什么与边界 · 章节导读\n\n**学习目标**：能一句话说清 BI 解决什么、不解决什么。",
                    [
                        L(
                            "bi-what-is",
                            "BI 是什么",
                            "??",
                            lesson(
                                "- **一句话定义**：用统一口径的数据，通过语义层、报表与仪表盘，把数变成可行动的决策洞察。\n"
                                "- **关键词**：指标、维度、可视化、自助、治理。",
                                "```text\n业务问题 → 指标口径 → 取数/语义层 → 图表/看板 → 决策/行动\n```",
                                "1. **经营看数**。\n2. **业务自助探索**。\n3. **嵌入业务系统的数据面**。",
                                "- BI 不是 ETL，也不是数仓建模本身。\n"
                                "- 「能出图」不等于「口径可信」。\n"
                                "- 先指标后图表，避免装饰性可视化。",
                            ),
                        ),
                        L(
                            "bi-vs-report",
                            "BI vs 报表 vs 取数",
                            "??",
                            lesson(
                                "- **一句话定义**：固定报表强调认证发布；BI 强调交互探索；取数强调一次性 SQL/导出。\n"
                                "- **边界**：三者常共存，职责不同。",
                                "```text\n认证报表：周会 GMV 看板（评审+版本）\n"
                                "BI 探索：按渠道下钻找异常\n"
                                "临时取数：分析师一次 SQL 拉明细\n```",
                                "1. **分工**：谁维护官方数、谁探索、谁救急。\n"
                                "2. **工具选型**。\n3. **治理制度设计**。",
                                "- 探索结果默认非认证，勿直接进高管会。\n"
                                "- 临时取数频发 → 应收口成指标/看板。\n"
                                "- 报表工具与探索工具可以是同一产品的不同模式。",
                            ),
                        ),
                        L(
                            "bi-value-chain",
                            "消费链路",
                            "??",
                            lesson(
                                "- **一句话定义**：仓表/指标 → 语义层 → 看板/订阅/嵌入 → 人的决策。\n"
                                "- **上游依赖**：DWH、指标、治理、SQL。",
                                "```text\nODS/DWD/DWS/ADS → 语义模型/指标平台 → Dashboard/订阅/嵌入\n```",
                                "1. **规划 BI 项目范围**。\n"
                                "2. **排故障**：图错了先查口径还是查缓存。\n"
                                "3. **对业务讲清「数从哪来」**。",
                                "- 下游再炫，上游口径错则全错。\n"
                                "- 缓存/抽取会引入新鲜度问题。\n"
                                "- 血缘要能从图表追到表与指标。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-metric",
            "指标体系",
            "?",
            "### 指标体系\n\n原子 / 派生 / 复合 / 修饰；北极星、漏斗与队列。",
            [
                C(
                    "bi-define",
                    "口径要素",
                    "??",
                    "### 口径要素 · 章节导读\n\n**学习目标**：拆出业务过程、度量、聚合、时间与修饰。",
                    [
                        L(
                            "bi-atomic",
                            "原子指标",
                            "??",
                            lesson(
                                "- **一句话定义**：不可再拆的业务度量（如支付金额）。\n"
                                "- **核心要素**：业务过程、度量字段、聚合方式。",
                                "```sql\nSELECT SUM(pay_amount) AS pay_amt\n"
                                "FROM dws.pay_1d\n"
                                "WHERE dt BETWEEN '{{start}}' AND '{{end}}';\n```",
                                "1. **GMV / 支付额**。\n2. **订单量**。\n3. **活跃账号数**。",
                                "- 聚合方式写进字典。\n- 时区与退款规则明示。\n- 与主题域 Owner 对齐。",
                            ),
                        ),
                        L(
                            "bi-derived",
                            "派生指标",
                            "??",
                            lesson(
                                "- **一句话定义**：原子 + 时间/修饰/运算。\n"
                                "- **核心**：周期、限定、比率或四则。",
                                "```sql\nSELECT pay_uv_7d * 1.0 / NULLIF(visit_uv_7d, 0) AS pay_cvr_7d\n"
                                "FROM dws.traffic_pay_1d WHERE dt='{{ds}}';\n```",
                                "1. **转化率**。\n2. **客单价**。\n3. **留存率**。",
                                "- 分母为 0。\n- 修饰可枚举。\n- 避免同名异义。",
                            ),
                        ),
                        L(
                            "bi-composite",
                            "复合指标",
                            "???",
                            lesson(
                                "- **一句话定义**：多个派生/原子按业务公式组合（贡献度、加权分）。\n"
                                "- **风险**：公式变更影响面大。",
                                "```sql\nSELECT channel,\n"
                                "  ch_gmv * 1.0 / NULLIF(SUM(ch_gmv) OVER (), 0) AS gmv_share\n"
                                "FROM channel_gmv_1d WHERE dt='{{ds}}';\n```",
                                "1. **贡献拆解**。\n2. **健康分**。\n3. **综合评分看板**。",
                                "- 公式进版本管理。\n- 权重变更要公告。\n- 能下沉 mart 就别只放前端。",
                            ),
                        ),
                        L(
                            "bi-modifier",
                            "时间与修饰",
                            "??",
                            lesson(
                                "- **一句话定义**：把近7日/已支付/App 等拆成标准修饰。\n"
                                "- **价值**：同一原子可组合可管理。",
                                "```text\n原子：支付金额 + 时间7d + 修饰paid/app → app_paid_amt_7d\n```",
                                "1. **指标平台**。\n2. **语义层参数**。\n3. **筛选器联动**。",
                                "- 修饰白名单，防爆炸。\n- 含不含当天写清。\n- 命名规范优先。",
                            ),
                        ),
                    ],
                ),
                C(
                    "bi-northstar-chapter",
                    "目标与过程",
                    "??",
                    "### 目标与过程 · 章节导读\n\n**学习目标**：北极星、过程指标、漏斗与队列。",
                    [
                        L(
                            "bi-goal-map",
                            "目标到指标",
                            "??",
                            lesson(
                                "- **一句话定义**：业务目标 → 北极星 → 过程指标 → 诊断维。",
                                "```text\n目标：提升付费收入\n北极星：paid_gmv_1d\n"
                                "过程：转化、客单、复购\n诊断维：渠道/类目/新老\n```",
                                "1. **经营周会**。\n2. **OKR**。\n3. **实验主指标**。",
                                "- 多个北极星等于没有。\n- 过程指标要能解释主指标。\n- 口号不可计算就别进树。",
                            ),
                        ),
                        L(
                            "bi-funnel-metric",
                            "漏斗指标",
                            "??",
                            lesson(
                                "- **一句话定义**：多步骤转化的人数/次数与逐步转化率。\n"
                                "- **关键**：同一批人、同一时间窗、步骤定义一致。",
                                "```sql\nSELECT step, COUNT(DISTINCT user_id) AS uv\n"
                                "FROM dws.funnel_1d\n"
                                "WHERE dt='{{ds}}' AND funnel_name='pay'\n"
                                "GROUP BY step ORDER BY step_no;\n```",
                                "1. **增长漏斗**。\n2. **注册转化**。\n3. **下单支付**。",
                                "- 步骤口径变更会让历史不可比。\n"
                                "- 分母用谁（进入漏斗 vs 上一步）。\n"
                                "- 跨天漏斗要定归因窗。",
                            ),
                        ),
                        L(
                            "bi-cohort-metric",
                            "留存与队列",
                            "??",
                            lesson(
                                "- **一句话定义**：按首次行为日期分队列，观察后续回访/复购。",
                                "```sql\nSELECT cohort_dt, period_n,\n"
                                "  retained_uv * 1.0 / NULLIF(cohort_uv, 0) AS retain_rate\n"
                                "FROM dws.retention_cohort\n"
                                "WHERE cohort_dt BETWEEN '{{start}}' AND '{{end}}';\n```",
                                "1. **新客质量**。\n2. **活动效果**。\n3. **产品粘性**。",
                                "- 队列定义（首单/首访）必须统一。\n"
                                "- 未满期队列不要和满期比。\n"
                                "- 展示样本量，防小样本噪声。",
                            ),
                        ),
                    ],
                ),
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-dimension",
            "维度与 OLAP",
            "?",
            "### 维度与 OLAP\n\n切片、钻取、上卷、旋转——交互分析的操作原语。",
            [
                C(
                    "bi-dim-basics",
                    "维度基础",
                    "??",
                    "### 维度基础 · 章节导读\n\n**学习目标**：分清维度类型与时间维。",
                    [
                        L(
                            "bi-dim-types",
                            "维度类型",
                            "??",
                            lesson(
                                "- **一句话定义**：观察指标的角度：谁、在哪、何时、什么渠道。\n"
                                "- **类型**：普通维、时间维、退化维；历史维见 ETL/DWH 的 SCD。",
                                "```text\n事实：订单支付\n维度：用户、商品、渠道、支付时间、城市\n退化维：订单号\n```",
                                "1. **筛选器设计**。\n2. **语义字段分类**。\n3. **下钻路径**。",
                                "- 高基数维慎作默认下钻。\n- 维未就绪会出现大量「未知」。\n- 维与指标合法组合要约束。",
                            ),
                        ),
                        L(
                            "bi-date-dim",
                            "时间维度",
                            "??",
                            lesson(
                                "- **一句话定义**：标准日期维支持日/周/月/财年与同比环比。",
                                "```sql\nSELECT d.week_start, SUM(f.amount) AS gmv\n"
                                "FROM dws.order_1d f\nJOIN dim_date d ON f.dt = d.dt\n"
                                "WHERE f.status='paid'\nGROUP BY d.week_start;\n```",
                                "1. **周会聚合**。\n2. **年同周对比**。\n3. **节假日注释**。",
                                "- 自然周 vs 业务周。\n- 时区切日边界。\n- 财年与自然年并存时标注。",
                            ),
                        ),
                    ],
                ),
                C(
                    "bi-olap-ops",
                    "分析操作",
                    "??",
                    "### 分析操作 · 章节导读\n\n**学习目标**：slice / dice / drill / rollup / pivot。",
                    [
                        L(
                            "bi-slice-dice",
                            "切片切块",
                            "??",
                            lesson(
                                "- **一句话定义**：切片固定某些维取值；切块取多维子集。",
                                "```text\n切片：dt=昨天 AND channel=App\n切块：华东 × 数码 × 近7日\n```",
                                "1. **日常聚焦**。\n2. **只看投放渠道**。\n3. **区域经营**。",
                                "- 筛选条件要在看板可见。\n- 多筛选可能空结果。\n- 默认筛选勿藏太深。",
                            ),
                        ),
                        L(
                            "bi-drill-slice",
                            "下钻上卷",
                            "??",
                            lesson(
                                "- **一句话定义**：下钻到更细粒度；上卷到更粗汇总。",
                                "```text\n路径：全国 GMV → 省份 → 城市 → 订单明细\n```",
                                "1. **异常归因**。\n2. **区域经营**。\n3. **抽查明细**。",
                                "- 路径要有层级。\n- 明细层必须 RLS。\n- 下钻要有性能护栏。",
                            ),
                        ),
                        L(
                            "bi-pivot",
                            "旋转透视",
                            "??",
                            lesson(
                                "- **一句话定义**：行列互换或交叉表展示多维交叉。",
                                "```text\n行：渠道 | 列：设备 | 值：SUM(GMV)\n```",
                                "1. **渠道×端对比**。\n2. **类目×城市**。\n3. **Excel 习惯用户**。",
                                "- 交叉维基数相乘会很宽。\n- 空单元格 ≠ 0，要约定。\n- 导出注意权限。",
                            ),
                        ),
                    ],
                ),
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-governance",
            "指标治理",
            "?",
            "### 指标治理\n\n字典、Owner、版本、同名不同义、生命周期。",
            [
                C(
                    "bi-dict",
                    "字典与权责",
                    "??",
                    "### 字典与权责 · 章节导读",
                    [
                        L(
                            "bi-metric-dict",
                            "指标字典",
                            "??",
                            lesson(
                                "- **一句话定义**：名称、口径、维度、负责人、刷新 SLA 的权威档案。",
                                "```text\n名称：支付GMV | 定义：完成支付订单金额合计\n"
                                "表达式：SUM(pay_amount) WHERE status=paid\n"
                                "维度：dt,channel,city | Owner：增长 | SLA：T+1 06:30\n```",
                                "1. **新人上手**。\n2. **角标跳转**。\n3. **口径评审**。",
                                "- 与语义层同源。\n- 废弃标记勿物理删。\n- 禁止口头口径。",
                            ),
                        ),
                        L(
                            "bi-owner-sla",
                            "Owner 与 SLA",
                            "??",
                            lesson(
                                "- **一句话定义**：每个核心指标有人负责，并承诺就绪时间。",
                                "```text\n指标：paid_gmv_1d\nOwner：数据分析-张三 | 备份：李四\n"
                                "就绪：工作日 06:30 | 升级：值班群\n```",
                                "1. **故障找人**。\n2. **变更评审**。\n3. **值班制度**。",
                                "- Owner 空窗要交接。\n- SLA 含大促。\n- 跑批成功 ≠ 口径正确。",
                            ),
                        ),
                        L(
                            "bi-same-name",
                            "同名不同义",
                            "??",
                            lesson(
                                "- **一句话定义**：同一中文名多套计算，对账永远不齐。\n"
                                "- **典型**：下单/支付/入账 GMV。",
                                "```sql\nSELECT SUM(order_amount), SUM(pay_amount), SUM(settle_amount)\n"
                                "FROM dws.trade_1d WHERE dt='{{ds}}';\n```",
                                "1. **财务 vs 运营**。\n2. **改版审计**。\n3. **治理专项**。",
                                "- 冲突先改名或加前缀。\n- 材料标注口径版本。\n- 用对账 SQL 固化结论。",
                            ),
                        ),
                        L(
                            "bi-metric-version",
                            "口径版本",
                            "???",
                            lesson(
                                "- **一句话定义**：口径变更用版本号，历史可复现。",
                                "```text\npaid_gmv@v1：含运费\n"
                                "paid_gmv@v2：不含运费（2024-07-01 起）\n"
                                "看板角标显示 v2，并链到变更说明\n```",
                                "1. **重大口径切换**。\n2. **审计复现**。\n3. **评估可比性**。",
                                "- 生效日与重刷范围写清。\n- 旧版只读保留。\n- 通知认证看板 Owner。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-semantic",
            "语义层",
            "?",
            "### 语义层\n\n维度、度量、关系、可见性——业务语言连到物理表。",
            [
                C(
                    "bi-semantic-core",
                    "模型核心",
                    "??",
                    "### 模型核心 · 章节导读",
                    [
                        L(
                            "bi-semantic-model",
                            "语义模型",
                            "??",
                            lesson(
                                "- **一句话定义**：在物理表之上定义维、度量、关系与可见性。",
                                "```text\nModel: sales\nDims: dt, region, channel\n"
                                "Measures: paid_gmv = SUM(amount) FILTER paid\n```",
                                "1. **Looker/PBI/指标平台**。\n2. **受控自助**。\n3. **嵌入统一出口**。",
                                "- 关系基数错会导致重复计算。\n- 隐藏技术字段。\n- 变更走评审。",
                            ),
                        ),
                        L(
                            "bi-measure-calc",
                            "度量计算",
                            "??",
                            lesson(
                                "- **一句话定义**：在语义层声明聚合与派生，避免每张报表手写 SQL。",
                                "```sql\nSELECT region, SUM(amount) AS paid_gmv,\n"
                                "  SUM(amount)*1.0/NULLIF(COUNT(DISTINCT user_id),0) AS arpu\n"
                                "FROM dws.order_1d WHERE status='paid'\nGROUP BY region;\n```",
                                "1. **多看板复用**。\n2. **拖拽出图**。\n3. **字段级权限裁剪**。",
                                "- 比率勿二次平均。\n- 复杂口径下沉 mart。\n- 同比需完整时间维。",
                            ),
                        ),
                        L(
                            "bi-relationships",
                            "表关系与粒度",
                            "???",
                            lesson(
                                "- **一句话定义**：声明事实与维的连接及基数，决定聚合是否正确。",
                                "```text\norders many→one users\norders many→one dim_date\n"
                                "order_items many→one orders（先聚到订单再算用户指标）\n```",
                                "1. **星型语义**。\n2. **防 JOIN 爆炸**。\n3. **复合模型**。",
                                "- 多对多要桥接或预聚合。\n- 测关联前后行数。\n- 明细与汇总表勿混用乱连。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-data-prep",
            "取数与建模",
            "?",
            "### 取数与建模\n\n活连接 vs 抽取、BI 内关联、计算字段与粒度。",
            [
                C(
                    "bi-connect",
                    "连接方式",
                    "??",
                    "### 连接方式 · 章节导读",
                    [
                        L(
                            "bi-live-vs-extract",
                            "活连接 vs 抽取",
                            "??",
                            lesson(
                                "- **一句话定义**：活连接每次查源；抽取把数据拉到 BI 引擎加速。",
                                "```text\n活连接：要新鲜度、源扛得住\n抽取：日会看板、源压力大、离线可用\n```",
                                "1. **Tableau Extract**。\n2. **Power BI Import**。\n3. **大促护仓**。",
                                "- 抽取失败勿把过期当今日。\n- 增量抽取注意删除同步。\n- 抽取后仍要 RLS。",
                            ),
                        ),
                        L(
                            "bi-bi-join",
                            "BI 内关联",
                            "??",
                            lesson(
                                "- **一句话定义**：在 BI 工具内把多表/多源拼成分析集。",
                                "```text\n关系模型：按键关联，按粒度查询\n物理 JOIN：固化宽表（易炸行）\n```",
                                "1. **多源拼接**。\n2. **维事实组合**。\n3. **原型验证**。",
                                "- 优先仓内建好再给 BI。\n- 跨源 JOIN 性能差。\n- 关联键类型一致。",
                            ),
                        ),
                    ],
                ),
                C(
                    "bi-calc",
                    "计算字段",
                    "??",
                    "### 计算字段 · 章节导读",
                    [
                        L(
                            "bi-calc-field",
                            "计算字段基础",
                            "??",
                            lesson(
                                "- **一句话定义**：在 BI 里用表达式生成新维/度量。",
                                "```text\nIF [status]=\"paid\" THEN [amount] END\n"
                                "SUM([paid_amount]) / COUNTD([user_id])\n```",
                                "1. **快速派生**。\n2. **分组分桶**。\n3. **条件着色**。",
                                "- 复杂逻辑下沉语义层/仓。\n- 聚合与行级计算别混。\n- 命名进规范。",
                            ),
                        ),
                        L(
                            "bi-lod-grain",
                            "粒度与 LOD",
                            "???",
                            lesson(
                                "- **一句话定义**：控制计算发生在哪个粒度（Tableau LOD / 等价子查询）。",
                                "```text\nFIXED [user_id]: SUM([amount])  -- 先按用户汇总再进视图\n```\n"
                                "```sql\nSELECT v.*, u.user_gmv\nFROM view_grain v\n"
                                "JOIN (SELECT user_id, SUM(amount) user_gmv FROM orders GROUP BY 1) u\n"
                                "USING (user_id);\n```",
                                "1. **客户价值进明细**。\n2. **占比**。\n3. **排除筛选影响**。",
                                "- LOD 滥用难维护。\n- 先画清粒度。\n- 与筛选器交互要测。",
                            ),
                        ),
                    ],
                ),
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-viz",
            "可视化基础",
            "?",
            "### 可视化基础\n\n视觉编码、图表选型、颜色与注释。",
            [
                C(
                    "bi-encoding",
                    "视觉编码",
                    "??",
                    "### 视觉编码 · 章节导读",
                    [
                        L(
                            "bi-visual-encoding",
                            "位置长度优先",
                            "??",
                            lesson(
                                "- **一句话定义**：人最易感知位置与长度，其次角度/面积/颜色。",
                                "```text\n比较数值 → 条形\n趋势 → 折线\n慎用：3D、过多扇区饼图、误导双轴\n```",
                                "1. **组件库规范**。\n2. **设计评审**。\n3. **自助培训**。",
                                "- 面积难精确比较。\n- 颜色类别 ≤6。\n- 装饰图无信息增益。",
                            ),
                        ),
                        L(
                            "bi-chart-choice",
                            "图表怎么选",
                            "??",
                            lesson(
                                "- **一句话定义**：按问题选图：比较/趋势/构成/分布/关系。",
                                "```text\n比较→柱/条 | 趋势→线 | 构成→堆叠(≤5)\n"
                                "分布→直方图 | 关系→散点 | 地理→地图(慎)\n```",
                                "1. **看板组件**。\n2. **打回依据**。\n3. **业务指南**。",
                                "- 饼图扇区过多改条形。\n- 地图≠分析完成。\n- 空状态要设计。",
                            ),
                        ),
                        L(
                            "bi-color-anno",
                            "颜色与注释",
                            "??",
                            lesson(
                                "- **一句话定义**：颜色传达类别或顺序；注释解释异常与口径。",
                                "```text\n顺序色：浅→深\n发散色：低于/高于目标\n注释：大促、故障、口径切换日\n```",
                                "1. **目标达成**。\n2. **异常解释**。\n3. **色觉友好**。",
                                "- 红绿考虑色觉。\n- 颜色必有图例。\n- 关键角标链到字典。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-board",
            "看板设计",
            "?",
            "### 看板设计\n\n一屏一主题；总览→归因→明细；叙事与大屏。",
            [
                C(
                    "bi-layout",
                    "布局与叙事",
                    "??",
                    "### 布局与叙事 · 章节导读",
                    [
                        L(
                            "bi-northstar",
                            "北极星与下钻",
                            "??",
                            lesson(
                                "- **一句话定义**：顶栏北极星，下方拆解波动。",
                                "```text\n顶：主指标+同比环比 | 中：渠道/地区 | 下：明细/漏斗\n```",
                                "1. **经营周会**。\n2. **值班大屏**。\n3. **实验看板**。",
                                "- 首屏勿堆卡。\n- 过滤可见。\n- 口径角标常驻。",
                            ),
                        ),
                        L(
                            "bi-compare",
                            "对比与趋势",
                            "??",
                            lesson(
                                "- **一句话定义**：时间对比与维度并列回答「变好了吗」。",
                                "```sql\nSELECT dt, SUM(amount) gmv,\n"
                                "  LAG(SUM(amount)) OVER (ORDER BY dt) gmv_prev\n"
                                "FROM dws.order_1d WHERE status='paid' GROUP BY dt;\n```",
                                "1. **日报**。\n2. **渠道对比**。\n3. **活动前后**。",
                                "- 双轴慎用。\n- 目标线更有决策感。\n- 节假日注释。",
                            ),
                        ),
                        L(
                            "bi-storytelling",
                            "数据叙事",
                            "??",
                            lesson(
                                "- **一句话定义**：按「结论→证据→行动」组织，而不是图表堆砌。",
                                "```text\n1.结论：华东 GMV -18%\n2.证据：渠道A掉量 + 客单降\n3.行动：加投放 / 排查履约\n```",
                                "1. **述职**。\n2. **复盘**。\n3. **高管简报**。",
                                "- 先写结论再贴图。\n- 每页一个问题。\n- 行动项可指派。",
                            ),
                        ),
                        L(
                            "bi-big-screen",
                            "大屏与移动",
                            "??",
                            lesson(
                                "- **一句话定义**：大屏重态势与刷新；移动重关键 KPI 与告警。",
                                "```text\n大屏：少字大字号、自动轮播、暗底\n移动：竖屏单列、2~4 主指标、下钻少而深\n```",
                                "1. **作战室**。\n2. **管理层 App**。\n3. **门店看板**。",
                                "- 大屏避免密表。\n- 刷新与缓存策略。\n- 移动触控热区。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-interact",
            "交互分析",
            "?",
            "### 交互分析\n\n筛选、参数、联动、明细按需。",
            [
                C(
                    "bi-interact-core",
                    "交互组件",
                    "??",
                    "### 交互组件 · 章节导读",
                    [
                        L(
                            "bi-filters",
                            "筛选与参数",
                            "??",
                            lesson(
                                "- **一句话定义**：筛选裁剪数据；参数驱动计算与切换视图。",
                                "```text\n筛选：时间、渠道、城市（作用域：整页/单图）\n"
                                "参数：TopN、目标值、度量切换（GMV/订单）\n```",
                                "1. **自助探索**。\n2. **What-if**。\n3. **一套板多度量**。",
                                "- 作用域混乱会导致图不对。\n- 默认值要有业务意义。\n- 参数不是权限。",
                            ),
                        ),
                        L(
                            "bi-cross-filter",
                            "联动高亮",
                            "??",
                            lesson(
                                "- **一句话定义**：点选一图过滤/高亮其他图，形成分析闭环。",
                                "```text\n点渠道柱 → 趋势与明细只显示该渠道\n```",
                                "1. **归因**。\n2. **探索演示**。\n3. **会议互动**。",
                                "- 提供重置筛选。\n- 避免滤到空。\n- 联动勿触发全表扫描。",
                            ),
                        ),
                        L(
                            "bi-detail-on-demand",
                            "明细按需",
                            "??",
                            lesson(
                                "- **一句话定义**：汇总够用时不拉明细；需要时再下钻或限流导出。",
                                "```text\n汇总看板 → 点击异常点 → 限流明细（Top 1000）\n```",
                                "1. **客服核查**。\n2. **审计抽样**。\n3. **异常订单**。",
                                "- 明细强制 RLS。\n- 导出审计。\n- 禁止百万行前端加载。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-perf",
            "性能与取数",
            "?",
            "### 性能与取数\n\n预聚合、缓存、物化、查询护栏。",
            [
                C(
                    "bi-perf-core",
                    "加速手段",
                    "??",
                    "### 加速手段 · 章节导读",
                    [
                        L(
                            "bi-preagg",
                            "预聚合",
                            "??",
                            lesson(
                                "- **一句话定义**：按常用维提前汇总，看板读汇总表。",
                                "```sql\nSELECT region, DATE(created_at) dt, SUM(amount) paid_gmv\n"
                                "FROM dws.order_1d WHERE status='paid' GROUP BY 1,2;\n```",
                                "1. **日会看板**。\n2. **大屏**。\n3. **高并发自助**。",
                                "- 覆盖外下钻回明细或次级汇总。\n- 口径变更重刷。\n- 表数量收敛。",
                            ),
                        ),
                        L(
                            "bi-cache-extract",
                            "缓存与抽取",
                            "??",
                            lesson(
                                "- **一句话定义**：结果缓存或抽到 BI 本地，换速度。",
                                "```text\n低实时：日抽取 | 准实时：1~5min 缓存 | 高实时：直连+预聚合+限流\n```",
                                "1. **抽取数据集**。\n2. **结果缓存**。\n3. **护仓**。",
                                "- 击穿要降级。\n- 过期要标识。\n- RLS 仍生效。",
                            ),
                        ),
                        L(
                            "bi-materialize",
                            "物化与加速层",
                            "???",
                            lesson(
                                "- **一句话定义**：物化视图/ADS/OLAP 加速层服务高频查询。",
                                "```sql\nINSERT OVERWRITE ads.kpi_sales_1d PARTITION (dt='{{ds}}')\nSELECT ...;\n```",
                                "1. **核心 KPI**。\n2. **并发高峰**。\n3. **多 BI 共用**。",
                                "- 新鲜度与成本平衡。\n- 加速层也要质量门禁。\n- 避免每板一表失控。",
                            ),
                        ),
                        L(
                            "bi-query-guard",
                            "查询护栏",
                            "???",
                            lesson(
                                "- **一句话定义**：强制时间窗、超时、行数与并发上限。",
                                "```sql\nWHERE dt >= DATE_SUB(CURRENT_DATE, 90)\n-- + statement_timeout / max rows\n```",
                                "1. **开放自助**。\n2. **防误扫**。\n3. **成本治理**。",
                                "- 提示可读。\n- 管理员独立队列。\n- Top 慢查询治理。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-self-serve",
            "自助与认证",
            "?",
            "### 自助与认证\n\n受控探索、认证发布、工作区流转。",
            [
                C(
                    "bi-govern-modes",
                    "两种模式",
                    "??",
                    "### 两种模式 · 章节导读",
                    [
                        L(
                            "bi-controlled-self",
                            "受控自助",
                            "??",
                            lesson(
                                "- **一句话定义**：语义层白名单内拖拽；禁止随意连生产库。",
                                "```text\n允许：官方字段+时间宏\n禁止：任意 SQL 打生产；未审批全量导出\n```",
                                "1. **运营探索**。\n2. **区域看数**。\n3. **原型**。",
                                "- 默认非认证。\n- 培训优于一味封禁。\n- 热门错误口径回收官方。",
                            ),
                        ),
                        L(
                            "bi-certified",
                            "认证报表",
                            "??",
                            lesson(
                                "- **一句话定义**：关键看板经评审与门禁，标记官方可信。",
                                "```text\n[ ] 字典 [ ] 对账 [ ] Owner [ ] SLA [ ] 权限 [ ] 版本可见\n```",
                                "1. **公司经营板**。\n2. **财务辅助**。\n3. **对外页**。",
                                "- 改口径必公告。\n- 个人副本不冒充。\n- 下线流程。",
                            ),
                        ),
                        L(
                            "bi-workspace",
                            "工作区与发布",
                            "??",
                            lesson(
                                "- **一句话定义**：个人草稿 → 项目评审 → 生产认证。",
                                "```text\nDev（个人）→ Review（项目）→ Prod（认证目录）\n```",
                                "1. **多人协作**。\n2. **环境隔离**。\n3. **回滚**。",
                                "- 生产改数权限最小化。\n- 发布可追溯。\n- 依赖数据集一并版本化。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-security",
            "权限与安全",
            "?",
            "### 权限与安全\n\n行列权限、SSO、脱敏与审计。",
            [
                C(
                    "bi-acl",
                    "访问控制",
                    "??",
                    "### 访问控制 · 章节导读",
                    [
                        L(
                            "bi-rls",
                            "行级权限 RLS",
                            "???",
                            lesson(
                                "- **一句话定义**：按用户属性裁剪可见行，必须在数据侧强制。",
                                "```text\n用户属性 region=华东\nRLS: WHERE region = current_user.region\n```",
                                "1. **区域经理**。\n2. **商家看己数**。\n3. **多租户**。",
                                "- 勿只藏 UI。\n- 属性源要可信。\n- 管理员破窗要审计。",
                            ),
                        ),
                        L(
                            "bi-cls",
                            "列级与脱敏",
                            "??",
                            lesson(
                                "- **一句话定义**：隐藏或脱敏敏感列（手机、证件、成本）。",
                                "```text\n角色 analyst：可见 GMV，不可见 cost\n角色 finance：可见 cost\n手机：mask 展示\n```",
                                "1. **合规**。\n2. **外包账号**。\n3. **演示环境**。",
                                "- 计算字段可能绕过，需引擎支持。\n- 导出同样脱敏。\n- 与数据分级对齐。",
                            ),
                        ),
                        L(
                            "bi-sso-audit",
                            "SSO 与审计",
                            "??",
                            lesson(
                                "- **一句话定义**：统一登录；记录谁看了/导出了什么。",
                                "```text\nSSO → 角色映射 → 访问/导出日志 → 定期抽查\n```",
                                "1. **企业账号**。\n2. **合规审计**。\n3. **事故追责**。",
                                "- 离职即时禁用。\n- 嵌入 token 短时。\n- 日志留存周期。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-embed",
            "交付与运营",
            "?",
            "### 交付与运营\n\n订阅、告警、嵌入。",
            [
                C(
                    "bi-delivery",
                    "触达",
                    "??",
                    "### 触达 · 章节导读",
                    [
                        L(
                            "bi-subscribe",
                            "订阅推送",
                            "??",
                            lesson(
                                "- **一句话定义**：按频率推送链接/PDF/图片，减少刷屏。",
                                "```text\n日报 08:00 → 认证看板链接\n周报 → PDF 摘要 + 关键图\n```",
                                "1. **管理层早报**。\n2. **例会材料**。\n3. **渠道同步**。",
                                "- 推送也要鉴权。\n- 退订与收敛。\n- 失败重试与兜底。",
                            ),
                        ),
                        L(
                            "bi-alert",
                            "阈值告警",
                            "??",
                            lesson(
                                "- **一句话定义**：指标超阈触发通知，优于无脑定时刷图。",
                                "```text\npaid_gmv 环比 < -20% → 值班群\n连续 3 小时无数据 → 数据任务告警\n```",
                                "1. **值班**。\n2. **大促盯盘**。\n3. **质量异常**。",
                                "- 阈值防抖。\n- 告警带链接与口径。\n- 与数据质量告警分工。",
                            ),
                        ),
                        L(
                            "bi-embed-rls",
                            "嵌入与 Token",
                            "???",
                            lesson(
                                "- **一句话定义**：图表嵌进业务系统；SSO + 短时 token + RLS。",
                                "```text\n业务登录 → 签发 5min embed token → iframe\nRLS 与母系统租户一致\n```",
                                "1. **商家后台**。\n2. **CRM 侧栏**。\n3. **SaaS 多租户**。",
                                "- 数据侧强制 RLS。\n- token 短时+刷新。\n- 权限模型对齐。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-tools",
            "工具与选型",
            "?",
            "### 工具与选型\n\n商业、开源、国产——按场景匹配（画布另有工具卡片）。",
            [
                C(
                    "bi-tool-commercial",
                    "商业探索",
                    "??",
                    "### 商业探索 · 章节导读",
                    [
                        L(
                            "bi-tool-tableau",
                            "Tableau",
                            "??",
                            lesson(
                                "- **一句话定义**：交互可视分析标杆，VizQL + 计算/LOD 强。",
                                "```text\n擅长：分析师探索、叙事看板、企业治理\n连接：Live / Extract；聚合尽量下推\n```",
                                "1. **专业分析**。\n2. **高管看板**。\n3. **Server/Cloud 发布**。",
                                "- 授权成本。\n- 复杂指标需建模配合。\n- LOD 需规范。",
                            ),
                        ),
                        L(
                            "bi-tool-pbi",
                            "Power BI",
                            "??",
                            lesson(
                                "- **一句话定义**：微软生态 BI；星型模型 + DAX 度量。",
                                "```text\nImport / DirectQuery / 混合\nDAX：CALCULATE、时间智能\n```",
                                "1. **Office 生态**。\n2. **自助+IT 治理**。\n3. **嵌入 Power Platform**。",
                                "- DirectQuery 取决于源。\n- 模型关系与基数。\n- 网关与刷新。",
                            ),
                        ),
                        L(
                            "bi-tool-looker",
                            "Looker/语义",
                            "??",
                            lesson(
                                "- **一句话定义**：LookML 等强语义层，指标即代码。",
                                "```text\nview/explore → 维度度量 → 受控 SQL 生成\n```",
                                "1. **指标即代码**。\n2. **受控自助**。\n3. **与仓 ELT 协同**。",
                                "- 学习曲线。\n- 建模质量决定体验。\n- 与 dbt/仓分层对齐。",
                            ),
                        ),
                    ],
                ),
                C(
                    "bi-tool-oss-cn",
                    "开源与国产",
                    "??",
                    "### 开源与国产 · 章节导读",
                    [
                        L(
                            "bi-tool-superset",
                            "Superset",
                            "??",
                            lesson(
                                "- **一句话定义**：开源 BI，SQL Lab + Dashboard，适合自建。",
                                "```text\n连接 → Dataset → Chart → Dashboard\n```",
                                "1. **团队自建**。\n2. **成本敏感**。\n3. **云原生部署**。",
                                "- 行列安全要自行夯实。\n- 注意虚拟数据集性能。\n- 升级要回归。",
                            ),
                        ),
                        L(
                            "bi-tool-metabase",
                            "Metabase",
                            "??",
                            lesson(
                                "- **一句话定义**：轻量开源，问答/简单仪表盘上手快。",
                                "```text\nQuestion → Visualization → Dashboard → 订阅\n```",
                                "1. **中小团队**。\n2. **业务快速自助**。\n3. **简易内嵌**。",
                                "- 复杂语义弱于强建模工具。\n- 大数据量要预聚合。\n- 权限模型相对简单。",
                            ),
                        ),
                        L(
                            "bi-tool-fine",
                            "FineBI/报表",
                            "??",
                            lesson(
                                "- **一句话定义**：FineBI 偏自助分析；FineReport 偏复杂中国式报表。",
                                "```text\nFineBI：主题模型 + 自助仪表板\nFineReport：复杂表头/填报/打印导出\n```",
                                "1. **国内企业**。\n2. **复杂报表**。\n3. **填报场景**。",
                                "- 指标治理仍要自建。\n- 报表与分析职责拆分。\n- 画布另有 Datart/永洪可对照。",
                            ),
                        ),
                        L(
                            "bi-tool-map",
                            "怎么选型",
                            "??",
                            lesson(
                                "- **一句话定义**：按人群、语义、嵌入、成本、生态选型，而非跟风。",
                                "```text\n探索强 → Tableau/PBI\n语义即代码 → Looker 类\n自建开源 → Superset/Metabase/Datart\n复杂报表/填报 → FineReport 等\n```",
                                "1. **选型评审**。\n2. **多工具分工**。\n3. **迁移评估**。",
                                "- 工具不能替代治理。\n- 先统一口径再换工具。\n- 许可证与数据出境单列。",
                            ),
                        ),
                    ],
                ),
            ],
        )
    )

    tree["children"].append(
        D(
            "bi-scenarios",
            "分析场景",
            "?",
            "### 分析场景\n\n把指标+看板落到经营、增长、质量等常见题。",
            [
                C(
                    "bi-scene-biz",
                    "业务场景",
                    "??",
                    "### 业务场景 · 章节导读",
                    [
                        L(
                            "bi-scene-ops",
                            "经营日报",
                            "??",
                            lesson(
                                "- **一句话定义**：日更核心经营指标 + 异常归因，服务早会。",
                                "```text\n大盘KPI → 同比环比 → 渠道/类目拆解 → 异常注释\n数据：ADS 日表，06:30 前认证\n```",
                                "1. **早会**。\n2. **值班交接**。\n3. **老板简报**。",
                                "- 指标少而稳。\n- 未就绪显示状态而非错数。\n- 与财务口径差异有脚注。",
                            ),
                        ),
                        L(
                            "bi-scene-growth",
                            "增长看板",
                            "??",
                            lesson(
                                "- **一句话定义**：获客-激活-留存-收入等漏斗一体化。",
                                "```text\n漏斗 + 渠道 ROI + 新客队列留存 + 实验入口\n```",
                                "1. **增长周会**。\n2. **投放优化**。\n3. **产品评估**。",
                                "- 渠道归因模型写清。\n- 成本数据权限。\n- 实验指标与经营指标对齐。",
                            ),
                        ),
                        L(
                            "bi-scene-qa",
                            "数据质量看板",
                            "??",
                            lesson(
                                "- **一句话定义**：监控就绪、行数波动、对账差异、失败任务。",
                                "```text\n表就绪绿灯 | 核心指标对账差 | 失败DAG | 空值率\n```",
                                "1. **数据值班**。\n2. **信任建设**。\n3. **SLA 管理**。",
                                "- 质量板本身也要认证。\n- 告警可行动。\n- 与业务看板分开。",
                            ),
                        ),
                    ],
                )
            ],
        )
    )

    return tree


def main() -> None:
    tree = build()
    OUT.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
    domains = len(tree["children"])
    chapters = leaves = 0

    def rec(n: dict) -> None:
        nonlocal chapters, leaves
        if n.get("lessonParent"):
            chapters += 1
        kids = n.get("children") or []
        if not kids:
            leaves += 1
        for c in kids:
            rec(c)

    for d in tree["children"]:
        rec(d)
    print(f"wrote {OUT}")
    print(f"domains={domains} chapters={chapters} leaves={leaves}")
    for d in tree["children"]:
        def lc(n: dict) -> int:
            kids = n.get("children") or []
            if not kids:
                return 1
            return sum(lc(c) for c in kids)

        print(f"  - {d['title']}: {lc(d)} leaves")


if __name__ == "__main__":
    main()
