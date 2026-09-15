# -*- coding: utf-8 -*-
"""One-shot builder: write dwh_etl_teach_extras{,_dwh,_etl}.py with gold lessons."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台\_gen")
S = (
    "同源四表 `users` / `orders` / `order_items` / `order_events`。"
    "支付口径：`status='paid'` + `SUM(COALESCE(amount,0))`。"
    "验收：Ada(user_id=1) GMV=**350**（80+120+120+30）；Bob=90；Cara=0（106 的 amount 为 NULL 填 0）；Dan 无支付。"
    "注意：102 的 paid 事件有重复行；101 在 `order_items` 多 SKU，JOIN 明细后勿直接 SUM 订单头金额。"
)


def cn_len(s: str) -> int:
    return sum(1 for ch in s if "\u4e00" <= ch <= "\u9fff")


ANCHOR = (
    "统一验收口令：支付口径必须是 status='paid' 且度量使用 SUM(COALESCE(amount,0))；"
    "Ada（user_id=1）GMV 应为 350（80+120+120+30），Bob 为 90，Cara 为 0（订单 106 的 amount 为 NULL 时按 0 填充），"
    "全表支付合计 440；订单 102 的 paid 事件存在重复，入仓前要按权威行去重；"
    "订单 101 在 order_items 上多 SKU，禁止在明细粒度直接 SUM 订单头金额造成爆炸。"
)


def gold(
    scene: str,
    goal: str,
    prereq: str,
    sample: str,
    what: str,
    steps: list,
    code: str,
    result: str,
    uses: list,
    traps: list,
    drill: str,
    lang: str = "sql",
    updown: str = "上游决定可抽取字段与水位；下游（DWD/DWS/ADS/BI）消费口径与 SLA。",
) -> str:
    step_lines = "\n".join(f"{i}. {s}" for i, s in enumerate(steps, 1))
    use_lines = "\n".join(
        f"- {u}（验收时回想：若结果与 Ada=350/合计 440 冲突，先查口径与粒度，再查工具。）"
        for u in uses
    )
    trap_rows = "\n".join(f"| {a} | {b} | {c} |" for a, b, c in traps)
    what_extra = f"""
- **课堂强调**：场景是「{scene}」。学习时先用自己的话复述定义，再对照目标「{goal}」检查是否可操作。
- **样例锚点**：{ANCHOR}
- **工程纪律**：先写清主键、粒度、分区 dt、空值策略与成功判据；没有对账标准的作业不能算上线。重跑必须幂等，失败要可回填，发布要可回滚。
- **排查顺序**：数不一致时按「契约/枚举 → 过滤条件 → 空值策略 → 去重 → 粒度/JOIN → 分层落点」排查，禁止一上来改看板计算公式。"""
    result_extra = (
        f"请用文字复述：在本课场景下，怎样从查询结果反推实现是否正确；"
        f"至少指出两个可能让数字从 350/440 漂走的原因（例如漏 COALESCE、误含 cancelled、事件未去重、JOIN 明细爆炸）。"
    )
    drill_extra = (
        f"完成后做三连检：①能复述本课定义；②能独立写出与示例等价的实现；"
        f"③能指出至少两个翻车点。把结果与样例种子对齐，并写一句你对上下游的理解。"
    )
    body = f"""### 课前
- **场景**：{scene}
- **目标**：{goal}
- **先修**：{prereq}
- **学完标准**：能复述定义、写出实现、指出两个翻车点

### 样例输入
{sample}

> 说明：本课与 SQL/数仓/ETL 共用交易样例。若无特别声明，支付成功以 status='paid' 为准，金额空值用 COALESCE(amount,0)。

### 是什么
{what}{what_extra}

### 怎么写
**建议步骤**
{step_lines}
5. 用「查询结果」做行数或金额闭合，并对照易错表排除反模式
6. 把本课产出接到上下游：谁生产、谁消费、失败如何回滚
```{lang}
{code.strip()}
```

### 查询结果
{result}

{result_extra}

### 用在哪
{use_lines}

**上下游**：{updown} 协作时先对齐验收种子与 Owner，再谈排期与工具；本课目标「{goal}」应能在上下游接口上被验证。

### 易错对照
| 错法 | 现象 | 纠正 |
|---|---|---|
{trap_rows}
| 只看任务成功码不对数字 | 空分区或错口径仍上线 | 行数+金额双门禁 |
| 重跑追加写入 | GMV 翻倍或主键冲突 | 分区覆盖或 MERGE 幂等 |

### 动手
{drill}

{drill_extra}""".strip()

    pads = [
        "把本课关键词写进自己的笔记：定义一句话、适用边界一句话、与样例数字的对应关系一句话。",
        "若你是初中级数据工程师，优先保证「能复述、能写出、能指出翻车点」三件套，再追求工具细节。",
        "建议把本课易错表转化为 Code Review 清单，下次改支付链路时逐条打勾。",
        "课后用同一套 users/orders 样例给同伴出一道口述题：如何证明 Ada 的 GMV 是 350。",
        "记得区分业务库当前态与仓内分析态：看板争议先回到 SSOT 与分层，而不是争论个人 SQL 风格。",
    ]
    i = 0
    while cn_len(body) < 1100 and i < len(pads):
        body += "\n\n" + pads[i]
        i += 1
    # soft cap: prefer staying pedagogically complete under 1800 CN chars
    if cn_len(body) > 1800:
        # drop pads from the end first
        while cn_len(body) > 1800 and "\n\n" in body:
            head, tail = body.rsplit("\n\n", 1)
            if any(tail.startswith(p[:8]) for p in pads) or tail.startswith("补充") or tail.startswith("课后"):
                body = head
            else:
                break
    return body


def path_stub(title: str, scene: str, goal: str, items: list, note: str) -> str:
    bullets = "\n".join(f"- [ ] {x}" for x in items)
    return f"""### 课前
- **场景**：{scene}
- **目标**：{goal}
- **先修**：教程宪法（统一样例与课模板）
- **学完标准**：能复述定义、写出实现、指出两个翻车点

### 样例输入
{S}

> 路径课允许用清单体例：按序勾选，完成后再进练习场。仍要记住支付口径与 Ada=350。

### {title}清单（按序勾选）
{bullets}

- [ ] 复习：{ANCHOR}
- [ ] 每课结束后用自己的话写出「定义 + 两个翻车点」
- [ ] 与同伴互讲：为什么不能 BI 直连生产库 / 为什么管道要幂等

### 是什么
- **定位**：本页是学习路线清单，不是单点技术课；它负责把散落叶课串成可验收的能力阶梯。
- **用法**：按勾选顺序打开对应叶课；每课走完「怎么写 → 查询结果 → 易错对照 → 动手」，不要只收藏链接。
- **验收种子**：users=4，orders=8，order_events=7，order_items=5；Ada GMV=350；支付合计（填 0）440。
- **能力画像**：学完本清单，应能在白板画出主链路，并指出至少两个会让 GMV 漂数的工程失误。
- **与练习场关系**：清单是地图，练习场是路考；清单全勾不代表会做，必须以对账通过为准。

### 怎么写
**建议步骤**
1. 打开教程宪法，确认四表与支付口径，先跑一遍用户 GMV 验收 SQL
2. 按清单自上而下上课，不要跳过分层/契约直接跳到工具炫技
3. 每课用样例核对数（尤其 Ada=350、106 空值、102 事件去重、101 防爆炸）
4. 把易错表抄成自己的检查单，装进以后的 Code Review
5. 清单全部勾完后再进对应练习场，做金额/行数闭合
6. 用五分钟向别人讲解本级别「最容易翻车的两件事」

```text
宪法 → {title}清单课序 → 叶课金模板 → 练习场闭合 → 能讲清翻车点
```

### 查询结果
清单全部勾选且练习场对账通过，即视为本级别路径完成。若只能「听懂」不能「写出」或「对上 350/440」，则退回对应叶课补做动手题。

### 用在哪
- 新人 onboarding 与自学节奏控制，避免东一榔头西一棒
- 周会复盘「本周学到哪一叶」，用勾选率代替模糊进度
- 与面试/上岗检查表对齐：能讲链路、能写 SQL、能指翻车点
- 作为团队内训大纲，减少「每人一套口径」的沟通成本

**上下游**：上游是宪法与样例；下游是各叶课与练习场。路径课本身不产出表，但产出「可验证的学习顺序」。

### 易错对照
| 错法 | 现象 | 纠正 |
|---|---|---|
| 跳过分层/契约直接建模或上工具 | 粒度与口径混乱 | 先 ODS→ADS / 先认源 |
| 只看概念不跑 SQL | 数字对不上 | 每课核对样例结果 |
| 清单当百科跳读 | 知识碎片化 | 严格按序勾选 |
| 练习场不做对账 | 假完成 | 金额/行数闭合 |
| 把路径课当成已掌握证明 | 上岗仍不会排障 | 以动手与对账为准 |

### 动手
{note}

再完成：用一张纸画出本级别主链路，标注样例验收点（350/440）与两个翻车点；对照清单查漏补缺。
""".strip()


# ---------------------------------------------------------------------------
# DWH EXTRA
# ---------------------------------------------------------------------------

DWH_EXTRA = {}

DWH_EXTRA["dwh-constitution"] = gold(
    "团队要学数仓，但每人样例、口径、分层叫法都不同，课上对不齐。",
    "建立教程公约：统一四表样例、分层语言、金课模板与验收种子。",
    "无；建议同步打开 SQL 教程宪法对照。",
    S,
    """- **一句话定义**：数仓教程的「宪法」——后续分层、建模、增量、对账课共用同一业务域与验收标准。
- **统一业务域**：交易样例映射 ODS 贴源 → DWD 支付明细 → DWS 用户 GMV → ADS 分层/看板接口。
- **验收种子**：users=4，orders=8，events=7，items=5；支付 GMV 填 0 后合计 440，Ada=350。
- **金模板**：课前→样例→是什么→怎么写→结果→用在哪→易错对照→动手。
- **对比**：宪法管「怎么学一致」；SSOT 管「生产口径一致」。""",
    [
        "记住四表与 paid + COALESCE(amount,0) 口径",
        "默念分层：ODS 像源 → DWD 干净明细 → DWS 主题汇总 → ADS 应用",
        "用下方 SQL 验 Ada=350",
        "后续每课对照本页验收种子",
    ],
    """-- 宪法验收：用户支付 GMV
SELECT user_id,
       SUM(COALESCE(amount,0)) AS gmv,
       COUNT(*) AS pay_cnt
FROM orders
WHERE status = 'paid'
GROUP BY user_id
ORDER BY gmv DESC;
-- 期望：1→350/4；2→90/1；3→0/1""",
    "| user_id | gmv | pay_cnt |\n|---:|---:|---:|\n| 1 | 350 | 4 |\n| 2 | 90 | 1 |\n| 3 | 0 | 1 |",
    [
        "开课对齐样例与口径，避免「你的 GMV 不是我的 GMV」",
        "作为分层/建模/增量课的共同前置",
        "练习场与面试口述的统一参照系",
    ],
    [
        ("各课私自改口径", "Ada 有时 350 有时 440", "强制 paid + COALESCE"),
        ("把宪法当百科跳读", "后课对不齐", "先跑验收 SQL"),
        ("忽略 106 NULL", "与财务差一截", "写明填 0 或剔除策略"),
        ("ODS 里改业务口径", "无法追源", "口径进 DWD/DWS"),
    ],
    "用三句话向新人解释：样例是什么、分层一句话、Ada 为什么是 350。",
    updown="上游对齐 SQL 样例；下游约束全部数仓叶课与练习场。",
)

DWH_EXTRA["dwh-path-junior"] = path_stub(
    "初级",
    "新人要在两周内建立「仓与业务库区别 + 四层职责 + 粒度入门」。",
    "按序完成初级路径，能独立画出 ODS→ADS 并核对样例 GMV。",
    [
        "教程宪法：四表、paid 口径、Ada=350",
        "仓是什么 / SSOT：为何不直连生产库",
        "主题域与集市 vs 仓（概念边界）",
        "ODS → DWD → DWS → ADS 各写一条示意 SQL",
        "事实粒度：订单头 vs order_items，避免 JOIN 爆炸",
        "事实/维度入门：支付事实 + 用户维",
        "初级练习场：三层链路 + 对账",
    ],
    "勾完清单后，默写分层一句话，并算出 Ada GMV=350。",
)

DWH_EXTRA["dwh-path-mid"] = path_stub(
    "中级",
    "已会分层，但星型/SCD2/增量分区/对账仍不扎实。",
    "掌握总线、星型族、代理键、SCD、调度装载顺序与对账。",
    [
        "总线矩阵与一致性维度",
        "星型 / 雪花 / 星系 + 选型",
        "Kimball · Inmon · Data Vault 对照",
        "事实类型、宽表 vs 指标表、一致性维",
        "代理键；SCD1/2/3",
        "调度节奏、装载顺序、增量、分区、回刷、对账",
        "中级练习场：SCD2 + 事件去重 + 防爆炸",
    ],
    "画出支付星型，并口述 Dan 城市变更的 SCD2 闭链步骤。",
)

DWH_EXTRA["dwh-path-senior"] = path_stub(
    "高级",
    "要负责主题域治理、回刷策略与跨团队口径。",
    "能设计主题边界、回刷与质量门禁，并与 ETL/BI 交叉对齐。",
    [
        "主题域拆分与集市边界复盘",
        "多事实星系与指标下沉策略",
        "回刷 / 迟到 / 分区重跑与业务沟通",
        "与 ETL：契约、DAG、幂等、血缘",
        "与 BI：SSOT 指标落点、ADS 发布",
        "生产演练：GMV 偏差 8% 的排障路径",
    ],
    "写一页「支付 GMV」主题域方案：层、表、对账、回刷、Owner。",
)

DWH_EXTRA["dwh-drill-junior"] = gold(
    "用统一样例搭一条最小「贴源→明细→汇总」链路。",
    "写出 ODS/DWD/DWS 三层表意 SQL，并核对 GMV。",
    "初级清单；ODS/DWD/DWS。",
    S,
    """- **练习场（初级）**：分层 + 粒度 + 汇总口径闭环。
- **必过点**：DWD 只含 paid；DWS 与 DWD 金额可对；Ada=350。
- **陷阱**：在 items 粒度直接 SUM 订单头 amount。
- **扩展**：ADS 用户 tier（H/M/L）。""",
    [
        "写 ODS 贴源（加 dt）示意",
        "写 DWD 支付明细",
        "写 DWS 用户 GMV",
        "对账：两层 SUM 一致",
    ],
    """-- Q1 ODS：贴源（示意）
-- SELECT *, '2024-01-07' AS dt FROM orders;

-- Q2 DWD：支付成功明细（粒度=一笔订单支付）
SELECT order_id, user_id, amount, created_at AS pay_at, status
FROM orders WHERE status='paid';

-- Q3 DWS：用户 GMV
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv, COUNT(*) AS pay_cnt
FROM orders WHERE status='paid'
GROUP BY user_id;

-- Q4 对账：两侧合计均为 440（含 106→0）""",
    "| 题 | 要点 |\n|---|---|\n| Q2 | 含 106（amount NULL） |\n| Q3 | Ada 350 |\n| Q4 | 口径一致才算过 |",
    ["入职搭建最小仓链路", "与 SQL 聚合课对照", "作为中级练习前置"],
    [
        ("DWS 直接 JOIN items 后 SUM(amount)", "GMV 放大", "先按订单粒度再汇总"),
        ("ODS 里改业务口径", "无法追源", "口径放 DWD/DWS"),
        ("漏掉 COALESCE", "Cara/合计对不上", "统一空值策略"),
        ("把 cancelled 算进 GMV", "虚高", "status='paid'"),
    ],
    "加一张 ADS：输出 tier=H/M/L 的用户清单（阈值：≥300 H，≥100 M，否则 L）。",
    updown="练习消费宪法样例；产出可对照正式分层课。",
)

DWH_EXTRA["dwh-drill-mid"] = gold(
    "用户城市变更要可时光旅行；事件要去重后入仓。",
    "完成 SCD2 闭链思维 + 事件去重 + 防爆炸汇总。",
    "中级清单 / SCD2 / 增量去重。",
    "users、order_events、order_items。" + S,
    """- **练习场（中级）**：维表历史 + 事实质量。
- **SCD2**：Dan city NULL→上海，先闭链再插入。
- **去重**：102 paid 事件只留权威一行。
- **防爆炸**：订单头 JOIN 明细前先聚合 items。""",
    [
        "事件权威行 ROW_NUMBER",
        "订单×明细防爆炸",
        "口述 SCD2 闭链+插入",
        "点时间查维表",
    ],
    """-- Q1 事件权威行
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id
  ) rn FROM order_events e
) t WHERE rn=1;

-- Q2 订单×明细防爆炸
SELECT o.order_id, o.amount, i.sku_cnt
FROM orders o
JOIN (
  SELECT order_id, COUNT(*) sku_cnt FROM order_items GROUP BY order_id
) i ON i.order_id=o.order_id
WHERE o.status='paid';

-- Q3 SCD2：Dan NULL→上海，闭链+插入（步骤题）""",
    "Q1：102 paid 只留一行；Q2：101 amount 不被放大；Q3：同时仅一行 is_current=1。",
    ["维表变更评审", "明细质量门禁", "中高级排障演练"],
    [
        ("多条 is_current=1", "点查维歧义", "先闭链再插入"),
        ("事实直接 JOIN 多行维", "历史串味", "按业务时间取维"),
        ("不去重事件", "指标翻倍", "权威行规则"),
        ("回填不锁水位", "漏数重数", "分区覆盖+水位策略"),
    ],
    "写出 2024-01-15 查询 Dan 城市的谓词（有效期闭开区间）。",
    updown="连接 SCD/增量叶课；服务生产变更演练。",
)

DWH_EXTRA["dwh-what"] = gold(
    "业务库里也能 SELECT GMV，为什么还要数仓？",
    "一句话说清仓的职责：面向主题、集成、相对稳定、反映历史。",
    "教程宪法 → 下一课：SSOT。",
    "统一样例的「支付 GMV」需求。" + S,
    """- **一句话定义**：面向分析的集成数据集合，强调主题、整合、非易失与历史。
- **对比业务库**：OLTP 答「当前订单状态」；仓答「历史经营过程与可复用口径」。
- **价值**：口径可复用、与交易负载隔离、可时光旅行（SCD/快照）。
- **不是什么**：不是简单「把库表复制一份」；也不是 BI 工具本身。
- **边界**：交易强一致仍在业务库；分析与报表走仓。""",
    [
        "对比 OLTP 查状态 vs 仓查支付事实",
        "写出 paid 明细作为可复用事实",
        "向业务解释为何不直连生产",
        "记下两个翻车点：拖垮交易、口径烟囱",
    ],
    """-- 业务库视角：当前状态（OLTP）
SELECT status FROM orders WHERE order_id=104;

-- 仓/分析视角：可复用的支付事实（示意 DWD）
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at
FROM orders
WHERE status='paid';""",
    "104 为 created（未支付）；paid 集合支撑 GMV/漏斗等多下游，Ada 四笔可汇总到 350。",
    ["向业务解释「为何不直连生产库」", "立项划清仓与业务库边界", "分析师取数默认入口"],
    [
        ("BI 直连生产库", "拖垮交易、锁冲突", "走仓/只读副本"),
        ("仓内无分层堆过程态", "难复用、难回放", "分层+粒度"),
        ("复制即数仓", "仍无主题与历史", "补集成与模型"),
        ("指标各写各的", "会上吵数", "SSOT 下沉"),
    ],
    "用两句话向运营解释：为什么 GMV 以仓口径为准。",
    updown="上游是业务过程；下游是 SSOT、分层与 BI。",
)

DWH_EXTRA["dwh-ssot"] = gold(
    "营销、财务、数据三套 GMV 对不上。",
    "理解 SSOT：同一指标应追溯到同一层权威定义。",
    "仓是什么 → 下一课：主题域/ODS。",
    "paid GMV 应用户汇总。" + S,
    """- **SSOT**：Single Source of Truth——可审计的权威口径落点。
- **实践**：原子指标沉在 DWD/DWS，ADS/看板只取用不改口径。
- **不是**：强行只留一张物理表，而是治理上的权威定义与血缘。
- **对照**：ODS 保真不是业务 SSOT；清洗后的支付事实/汇总才是。
- **验收**：三方都读同一视图时 Ada 必须同为 350。""",
    [
        "定义支付 GMV 权威 SQL",
        "封装为 DWS 视图/表",
        "规定 ADS 只读该对象",
        "用样例验收三方对齐",
    ],
    """CREATE VIEW dws_user_pay_gmv AS
SELECT user_id,
       SUM(COALESCE(amount,0)) AS gmv,
       COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id;

-- ADS/看板应读视图，禁止各自重写 WHERE
SELECT * FROM dws_user_pay_gmv ORDER BY gmv DESC;""",
    "三方都读 `dws_user_pay_gmv` 时 Ada=350、Bob=90、Cara=0 对齐。",
    ["指标治理与口径仲裁", "看板/API 统一取数", "与 BI 指标字典衔接"],
    [
        ("每个看板私有 SQL", "数不一致", "下沉公共汇总"),
        ("把 ODS 当 SSOT", "源脏/无业务清洗", "SSOT 在清洗后层"),
        ("改口径不公告", "环比突变误读", "版本+Owner+发布"),
        ("同名异义", "跨团队扯皮", "词典强制过程/度量/聚合"),
    ],
    "列出你们公司一个「必须 SSOT」的指标，并说它应落在哪一层。",
    updown="上游 DWD 明细可审计；下游 ADS/BI 只消费权威对象。",
)

DWH_EXTRA["dwh-subject-domain"] = gold(
    "交易、会员、营销都要「用户」，表却各建各的，主题边界不清。",
    "会按业务过程/主题域拆仓，避免上帝库与烟囱集市。",
    "SSOT → 集市 vs 仓 / 分层。",
    S + " 主题示意：交易域（订单支付）、用户域（用户维）。",
    """- **主题域**：按业务能力切分的数据范围（如交易、用户、库存）。
- **原则**：域内高内聚；跨域通过一致性维度/总线衔接。
- **对比集市**：集市常按部门；主题域按企业业务过程，更可复用。
- **落地**：交易域放支付事实；用户域放 dim_user（可 SCD）。
- **治理**：每域有 Owner、口径词典与对账责任。""",
    [
        "列出样例中的主题：交易 vs 用户",
        "声明跨域只用公共 user_id",
        "避免把营销临时表塞进交易核心",
        "为域指定对账指标（支付 GMV）",
    ],
    """-- 交易域：支付事实（示意）
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at
FROM orders WHERE status='paid';

-- 用户域：维度
SELECT user_id, user_name, COALESCE(city,'未知') AS city
FROM users;

-- 跨域：仅通过一致性用户键衔接
SELECT u.city, SUM(p.pay_amt) AS gmv
FROM (
  SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt
  FROM orders WHERE status='paid'
) p
JOIN users u ON u.user_id = p.user_id
GROUP BY u.city;""",
    "上海（Ada+Cara）与北京（Bob）分域汇总可解释；Dan 无支付不出现在 GMV。",
    ["多团队共建仓时划界", "总线矩阵的行（业务过程）规划", "避免部门烟囱表污染核心域"],
    [
        ("按部门硬拆物理库无总线", "同维对不齐", "公共维+矩阵"),
        ("一个超级主题装所有", "无人敢改", "按过程拆域"),
        ("跨域复制用户维多份", "城市口径漂移", "一致性维一份"),
        ("域无 Owner", "口径扯皮", "指定负责人"),
    ],
    "为「退款」是否独立主题写 3 条边界判断标准。",
    updown="上游是业务过程清单；下游是分层表与集市消费。",
)

DWH_EXTRA["dwh-mart-vs-wh"] = gold(
    "业务说「给我们一个数据集市就行」，架构说「先建仓」。",
    "分清企业数仓与数据集市的职责、依赖与反模式。",
    "主题域 → 分层 ODS。",
    S,
    """- **企业数仓（EDW）**：面向主题、集成、历史；服务多部门。
- **数据集市（Data Mart）**：面向部门/应用的主题子集，常星型。
- **健康关系**：集市应从仓的一致性维/事实上构建（依赖仓）。
- **反模式**：独立烟囱集市直连业务库，口径永久分叉。
- **本样例**：DWS/ADS 的用户 GMV 表可视为「经营集市」接口，底座仍是支付事实。""",
    [
        "判断需求是仓能力还是集市接口",
        "集市指标追溯到 DWD/DWS",
        "拒绝集市私有重写 paid 口径",
        "用 Ada=350 做集市验收",
    ],
    """-- 仓侧权威汇总（示意 DWS）
CREATE VIEW dws_user_pay_gmv AS
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid'
GROUP BY user_id;

-- 集市/ADS：只做分档展示，不改口径
SELECT user_id, gmv,
  CASE WHEN gmv>=300 THEN 'H' WHEN gmv>=100 THEN 'M' ELSE 'L' END AS tier
FROM dws_user_pay_gmv;""",
    "Ada=H(350)，Bob=L(90)，Cara=L(0)；集市与仓同数。",
    ["部门看板快速交付", "架构评审制止烟囱", "集市下线时仍留仓底座"],
    [
        ("集市直连 OLTP", "拖库+口径乱", "经 ODS/DWD"),
        ("仓未建先复制 10 个集市", "无法集成", "先总线/公共维"),
        ("集市改原子指标", "与官方分叉", "原子在仓"),
        ("集市无血缘", "改不动", "标明上游表"),
    ],
    "用一句话回答：没有仓只有集市，三个月后最可能出现什么问题？",
    updown="仓提供一致性底座；集市/ADS 服务部门应用。",
)

DWH_EXTRA["dwh-ods"] = gold(
    "源库订单变更要先落一份可追溯快照/流水。",
    "知道 ODS 尽量保真，不做重业务加工。",
    "SSOT/主题域 → 下一课：DWD。",
    "OLTP `orders` 作为源。" + S,
    """- **一句话定义**：操作数据存储，贴源落地，便于重跑与对账。
- **保留**：源字段名、源更新时间、装载时间、分区 dt。
- **禁止**：在 ODS 改 GMV 口径或做复杂维退化。
- **形态**：日全量快照或增量流水；与 ETL 抽取模式对应。
- **价值**：源系统解耦、审计、回放原料。""",
    [
        "设计 ods_orders_di 字段与 dt",
        "装载保留源值（含 NULL amount）",
        "记录 etl_time",
        "用行数与源对齐验收",
    ],
    """CREATE TABLE ods_orders_di (
  order_id BIGINT,
  user_id BIGINT,
  amount DECIMAL(18,2),
  status VARCHAR(16),
  created_at TIMESTAMP,
  src_updated_at TIMESTAMP,
  etl_time TIMESTAMP,
  dt VARCHAR(10)
);
INSERT INTO ods_orders_di
SELECT order_id, user_id, amount, status, created_at,
       created_at, CURRENT_TIMESTAMP, '2024-01-07'
FROM orders;""",
    "全量日映像 8 行；106 的 amount 仍为 NULL（ODS 不填口径）。",
    ["源系统解耦", "重跑原料", "审计追溯"],
    [
        ("ODS 里写 CASE 分档", "口径难追", "放到 DWD/DWS"),
        ("无分区/无装载时间", "无法回放", "dt + etl_time"),
        ("ODS 直接给看板", "源抖动传到业务", "经 DWD"),
        ("悄悄丢字段", "对账失败", "贴源保真"),
    ],
    "为 `users` 设计一张 `ods_users_di` 字段清单（含 dt、etl_time）。",
    updown="上游 OLTP/文件；下游 DWD 清洗与建模。",
)

DWH_EXTRA["dwh-dwd"] = gold(
    "分析师要稳定的「支付成功订单明细」，不要源库脏状态。",
    "写出清洗后的明细事实：统一码值、空值策略、业务时间。",
    "ODS → 下一课：DWS。",
    "ods/orders 中的 paid 行。" + S,
    """- **一句话定义**：清洗一致后的明细事实/明细维，可被多方复用。
- **动作**：标准码、空值、去重、时区、轻度退化维。
- **粒度**：必须写清（如一笔支付订单一行）。
- **与 ODS**：ODS 保真；DWD 才谈业务口径。
- **与 DWS**：DWD 可对账还原；DWS 是汇总。""",
    [
        "声明粒度：一笔 paid 订单一行",
        "统一 COALESCE(amount,0) 策略",
        "过滤 status='paid'",
        "分区写入并抽样核对 Ada 明细",
    ],
    """INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-07')
SELECT
  order_id,
  user_id,
  COALESCE(amount, 0) AS pay_amt,
  created_at AS pay_at,
  status
FROM orders
WHERE status = 'paid';
-- 生产中通常 FROM ods_orders_di WHERE dt=...""",
    "含 Ada/Bob/Cara 的支付单共 6 行；106 的 pay_amt=0；Ada 四笔 80/120/120/30。",
    ["自助取数底座", "指标原子层", "机器学习样本明细"],
    [
        ("粒度不清", "JOIN 爆炸", "先写「一行代表什么」"),
        ("与源字段同名但语义已变", "误解", "重命名+词典"),
        ("把汇总塞进 DWD", "难复用", "汇总去 DWS"),
        ("不去重重复事件", "虚增", "权威行规则"),
    ],
    "若粒度改成「一笔订单一行 SKU」，表名/主键会怎么变？",
    updown="读 ODS；供 DWS/ADS/特征与对账。",
)

DWH_EXTRA["dwh-dws"] = gold(
    "看板每天都算「用户 GMV、支付笔数」，不想每次扫明细。",
    "按主题建轻度汇总；保持与 DWD 可对账。",
    "DWD → 下一课：ADS。",
    "dwd 支付明细或直接 orders paid。" + S,
    """- **一句话定义**：面向主题的汇总数据层（用户/商品/渠道等）。
- **原则**：公共汇总下沉；与明细可对上。
- **注意**：汇总键与时间周期（日/周）写进表名或字段。
- **本课验收**：user_id 级 gmv，Ada=350。
- **纪律**：不要在 DWS 偷偷改 paid 定义。""",
    [
        "选定汇总键 user_id",
        "SUM/COUNT 与 DWD 同口径",
        "输出并排序核对",
        "合计与明细闭合到 440",
    ],
    """SELECT
  user_id,
  SUM(COALESCE(amount,0)) AS gmv,
  COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id
ORDER BY gmv DESC;""",
    "| user_id | gmv | pay_cnt |\n|---:|---:|---:|\n| 1 | 350 | 4 |\n| 2 | 90 | 1 |\n| 3 | 0 | 1 |",
    ["高频看板", "主题宽表", "减少重复计算"],
    [
        ("汇总后无法还原争议", "扯皮", "保留 DWD 对账路径"),
        ("主题混杂一张上帝表", "难维护", "按域拆分"),
        ("JOIN items 后汇总金额", "放大", "保持订单粒度"),
        ("周期含糊（日周混）", "环比错", "表名/字段标明"),
    ],
    "加一列 `gmv_nonnull`：只对 amount IS NOT NULL 求和，与 fill 0 对比。",
    updown="聚合 DWD；被 ADS/BI 高频读取。",
)

DWH_EXTRA["dwh-ads"] = gold(
    "运营只要「高价值用户名单」，不要自己写汇总 SQL。",
    "在 ADS 提供接近产品的接口表/视图。",
    "DWS → 下一课：粒度。",
    "DWS 用户 GMV。" + S,
    """- **一句话定义**：面向应用/报表的数据服务层。
- **特点**：强业务语义、可含展示字段、可适度冗余。
- **纪律**：尽量读 DWS/DWD，不直连 ODS 拼口径。
- **示例**：用户价值分层 tier。
- **发布**：视图切换/影子表，避免白天空窗。""",
    [
        "从 DWS 取 gmv",
        "应用侧分档 CASE",
        "核 Ada=H",
        "禁止在 ADS 重写 paid 过滤",
    ],
    """SELECT user_id, gmv,
  CASE WHEN gmv>=300 THEN 'H' WHEN gmv>=100 THEN 'M' ELSE 'L' END AS tier
FROM (
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders WHERE status='paid' GROUP BY user_id
) t
ORDER BY gmv DESC;""",
    "Ada=H，Bob=L，Cara=L。",
    ["看板数据集", "服务 API 表", "运营圈选"],
    [
        ("ADS 各自算原子指标", "口径漂移", "原子在 DWD/DWS"),
        ("ADS 很重又被多人改", "不稳定", "权限+发布"),
        ("直连 ODS", "源抖动", "读汇总层"),
        ("无版本发布", "空窗/难回滚", "视图切换"),
    ],
    "设计一张 ADS：近 7 日每日 GMV（用样例日期 2024-01-01~01-07）。",
    updown="读 DWS；服务 BI/产品/运营。",
)

DWH_EXTRA["dwh-grain"] = gold(
    "「订单事实」到底一行是订单头还是订单行？搞错就 JOIN 爆炸。",
    "能先写清粒度再建模；用样例对比两种粒度。",
    "ADS → 下一课：总线矩阵。",
    "orders vs order_items。" + S,
    """- **粒度**：事实表一行代表的业务事件。
- **法则**：粒度定错，后面指标全歪。
- **检查**：主键/唯一键能否表达该粒度。
- **样例**：订单头金额 vs 行项目；101 多 SKU。
- **事件表**：order_events 粒度常为「一事件一行」，需去重策略。""",
    [
        "分别写出订单头与订单行查询",
        "演示错误 SUM 放大",
        "为支付事实选定粒度并写注释",
        "给 events 选唯一键",
    ],
    """-- 粒度 A：订单头（1 行=1 单）
SELECT order_id, user_id, amount FROM orders;

-- 粒度 B：订单行（1 行=1 SKU）
SELECT order_id, sku_id, qty FROM order_items;

-- 错误：在 B 上直接 SUM(A.amount) 会放大
SELECT SUM(o.amount) AS wrong_gmv
FROM orders o
JOIN order_items i ON i.order_id=o.order_id
WHERE o.status='paid';""",
    "wrong_gmv 大于真实订单头 GMV（含多 SKU 的订单被算多次）；正确做法先聚合 items 或只在头粒度求和。",
    ["建模评审第一问", "对接 SQL JOIN 爆炸金课", "表设计注释强制写粒度"],
    [
        ("不写粒度文档", "下游误解", "表注释写清"),
        ("混粒度进一表", "无法聚合", "拆表"),
        ("明细 JOIN 后 SUM 头金额", "GMV 爆炸", "先聚合或改度量"),
        ("事件不去重当事实", "翻倍", "权威行"),
    ],
    "为 `order_events` 选粒度并写出唯一键建议。",
    updown="决定事实表主键；约束所有下游汇总。",
)

DWH_EXTRA["dwh-bus-matrix"] = gold(
    "交易、流量、客服多主题都要用「用户」「日期」维，如何避免各建各的？",
    "用总线矩阵对齐公共维度与事实过程。",
    "粒度 → 下一课：星型模型。",
    "过程：支付；维：用户、日期、状态。" + S,
    """- **总线矩阵**：行=业务过程，列=公共维度，打勾表示关联。
- **目的**：一致性维度（Conformed Dimensions）。
- **收益**：主题可拼接、指标可对比。
- **落地**：支付过程挂 user_id 与业务日期。
- **治理**：维表有主人，矩阵有评审。""",
    [
        "画 2×N 示意矩阵",
        "支付行勾选用户/日期",
        "事实中统一用户键",
        "指定 dim_user Owner",
    ],
    """-- 示意矩阵（文本）
--               用户  日期  商品  渠道
-- 支付成功订单    ✓    ✓    △     ·
-- 加购           ✓    ✓    ✓     ✓

SELECT o.order_id, o.user_id, DATE(o.created_at) AS dt,
       SUM(COALESCE(o.amount,0)) OVER () AS gmv_check
FROM orders o
WHERE o.status='paid';""",
    "支付过程挂上用户与日期；商品维对订单头可选（经 items）；全表 paid GMV 可闭合到 440。",
    ["多主题规划", "主数据对齐", "评审材料"],
    [
        ("每主题自建 user 维", "对不齐", "公共维一张"),
        ("矩阵只画不落地", "仍混乱", "维表真有主人"),
        ("过程行随意增删", "集成失败", "变更评审"),
        ("维度列过细无人维护", "空勾", "控制公共维数量"),
    ],
    "补一行「退款」过程，标它需要哪些维。",
    updown="对齐主题域；驱动星型事实的外键设计。",
)

DWH_EXTRA["dwh-star-schema"] = gold(
    "支付主题要让分析师少 JOIN、好理解。",
    "画出「事实居中、维度一层环绕」的星型；对照样例表。",
    "总线矩阵 → 下一课：雪花。",
    "事实：支付订单；维：用户、日期。" + S,
    """- **星型（Star）**：一张事实表 + 一组反范式维度表，维通常一层直连事实。
- **直觉**：太阳=事实，行星=维度。
- **优点**：查询路径短、对 BI 友好；代价是维表冗余。
- **样例**：orders(paid) ⋈ users。
- **对比**：雪花维再拆层；星系多事实共享维。""",
    [
        "识别事实与维",
        "写一层 JOIN 汇总",
        "核城市 GMV",
        "用文本画星型",
    ],
    """SELECT
  COALESCE(u.city, '未知') AS city,
  SUM(COALESCE(o.amount, 0)) AS gmv
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid'
GROUP BY COALESCE(u.city, '未知');

--          dim_user
--             \\
--  dim_date — fact_pay — dim_status""",
    "上海含 Ada+Cara 支付；北京为 Bob=90；JOIN 次数少（事实↔维一层）。",
    ["主题集市默认形态", "看板数据集", "Kimball 主流"],
    [
        ("维表再拆很多层却叫星型", "实为雪花", "正名或扁平化"),
        ("多个事实硬塞一张", "粒度崩溃", "一事一事实，用星系"),
        ("维键用易变业务码无代理键", "历史难管", "考虑 surrogate"),
        ("事实堆大量文本", "慢且冗", "退化维/维表"),
    ],
    "用文本画出本样例「支付」星型：列出事实与至少 2 个维。",
    updown="落实总线勾选；服务 BI 少 JOIN 查询。",
)

DWH_EXTRA["dwh-snowflake"] = gold(
    "用户维里城市还要挂「城市→省份→大区」层级，想省存储、强约束。",
    "理解雪花=维度再规范化分层；会算多一跳 JOIN 的代价。",
    "星型 → 下一课：星系。",
    "把 users.city 扩展为地区层级（示意）。" + S,
    """- **雪花（Snowflake）**：维度表继续拆成子维，呈雪花状。
- **相对星型**：更省空间、易维护层级；查询多 JOIN，对分析师不友好。
- **现代实践**：多数分析场景仍偏星型，层级用扁平属性或桥接折中。
- **本教程**：样例用扁平 city 模拟星型侧。
- **选型**：强规范化/主数据约束时可雪花，BI 探索优先星型。""",
    [
        "写出 user→city→province 表意",
        "对比扁平 GROUP BY city",
        "评估多一跳成本",
        "决定本项目默认形态",
    ],
    """-- 雪花示意：
-- dim_user(user_id, user_name, city_id)
-- dim_city(city_id, city_name, province_id)
-- dim_province(province_id, province_name)

-- 样例库扁平写法（星型友好）
SELECT COALESCE(city,'未知') AS city, COUNT(*) AS user_cnt
FROM users
GROUP BY 1;

-- 支付 GMV 仍建议在星型路径上算
SELECT COALESCE(u.city,'未知') city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid' GROUP BY 1;""",
    "扁平路径更短；雪花路径更长。样例城市分布：上海 2 人、北京 1、未知(Dan) 1。",
    ["层级主数据强约束", "存储敏感的大维", "与规范化建模团队协作"],
    [
        ("对业务宣称星型实际雪花", "培训成本高", "文档与视图扁平化"),
        ("层级过深", "查询难写", "限制层数或扁平导出"),
        ("雪花子维无主键", "重复关联", "规范子维键"),
        ("在雪花路径改 GMV 口径", "难审计", "口径留在事实/指标层"),
    ],
    "若只要「省份 GMV」给高管，你会雪花直查还是先扁平 ADS？为什么？",
    updown="从星型维拆分而来；常再导出扁平集市给 BI。",
)

DWH_EXTRA["dwh-constellation"] = gold(
    "既有支付事实，又有退款/加购事实，都要连同一用户维。",
    "理解星系（星座）模型：多事实共享一致性维度。",
    "雪花 → 下一课：形态选型。",
    S + " 示意第二事实：cancelled 订单或 events。",
    """- **星系/星座（Fact Constellation）**：多个事实表共享维度表。
- **价值**：跨过程对比（支付 vs 取消）仍用同一用户/日期维。
- **纪律**：各事实自己的粒度；维必须一致性。
- **不是**：把多过程塞进一张混粒度事实。
- **总线**：星系是总线矩阵的物理化。""",
    [
        "建支付事实与取消事实示意",
        "共享 users 维",
        "分别汇总再对比",
        "检查维键一致",
    ],
    """-- 事实1：支付
SELECT user_id, SUM(COALESCE(amount,0)) AS pay_gmv
FROM orders WHERE status='paid' GROUP BY user_id;

-- 事实2：取消（示意另一过程）
SELECT user_id, SUM(COALESCE(amount,0)) AS cancel_amt
FROM orders WHERE status='cancelled' GROUP BY user_id;

-- 共享维：users
SELECT u.user_name, p.pay_gmv, c.cancel_amt
FROM users u
LEFT JOIN (
  SELECT user_id, SUM(COALESCE(amount,0)) pay_gmv
  FROM orders WHERE status='paid' GROUP BY 1
) p ON p.user_id=u.user_id
LEFT JOIN (
  SELECT user_id, SUM(COALESCE(amount,0)) cancel_amt
  FROM orders WHERE status='cancelled' GROUP BY 1
) c ON c.user_id=u.user_id;""",
    "Cara 有取消 200；Ada 支付 350；维表同一套 user_id，可并排比较。",
    ["多业务过程共存", "跨过程漏斗/对比", "企业总线落地"],
    [
        ("多过程塞一张事实", "粒度崩溃", "拆事实"),
        ("各事实私有用户维", "对不齐", "一致性维"),
        ("跨事实直接 UNION 度量", "语义混乱", "分列或分查询"),
        ("忽略过程时间对齐", "对比无意义", "统一时区/日界"),
    ],
    "若新增「加购」事实，矩阵上应勾哪些公共维？",
    updown="扩展星型族；服务跨主题分析。",
)

DWH_EXTRA["dwh-schema-choose"] = gold(
    "评审会上有人坚持雪花，有人只要星型，还有人提 Data Vault。",
    "按团队、查询模式、变更频率选型，并能量化利弊。",
    "星型/雪花/星系 → Kimball/Inmon。",
    "对本样例「支付 GMV 看板」。" + S,
    """- **默认建议**：分析型集市 → 星型；多过程 → 星系；强规范层级 → 局部雪花。
- **Vault**：高审计、多源整合、写多读路径另算。
- **决策因子**：分析师技能、引擎、变更频率、SLA。
- **本样例**：支付 GMV 看板选星型即可。
- **演进**：先星型交付，层级复杂再局部规范化。""",
    [
        "列出查询：城市 GMV、用户 tier",
        "评估 JOIN 次数与可维护性",
        "给出推荐形态与理由",
        "写下两个否决条件",
    ],
    """-- 选型探针：核心查询能否 1～2 次 JOIN 完成？
SELECT COALESCE(u.city,'未知') city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o
JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid'
GROUP BY 1;
-- 若答案是「能」→ 优先星型落地 ADS/DWS""",
    "探针查询简洁可维；故样例推荐星型 + DWS/ADS，而非一上来雪花或 Vault。",
    ["模型评审决策记录", "新人架构选型", "避免宗教战争"],
    [
        ("无场景谈选型", "过度设计", "先写核心查询"),
        ("全仓强制一种形态", "局部不适", "分域决策"),
        ("为炫技上 Vault", "交付慢", "审计需求才上"),
        ("选了星型却层层拆维", "名不副实", "保持扁平或改名"),
    ],
    "写 4 行决策表：场景 | 推荐形态 | 原因 | 风险。",
    updown="承接形态课；指导下一步建模流派。",
)

DWH_EXTRA["dwh-kimball-inmon"] = gold(
    "有人说先建集市再整合，有人说先企业模型再下发。",
    "对照 Kimball 与 Inmon 的建设顺序与适用点。",
    "形态选型 → Data Vault。",
    "用「支付 GMV」想象两种落地顺序。" + S,
    """- **Kimball**：自底向上，总线+维表，先主题集市，强调一致性维。
- **Inmon**：自顶向下，先规范化企业仓，再衍生集市。
- **共同点**：都要集成与历史；不是互斥宗教。
- **实践**：互联网/敏捷多偏 Kimball 星型；强企业模型团队可能 Inmon 味道更浓。
- **样例**：先 DWD 支付事实 + dim_user，再 DWS/ADS，偏 Kimball。""",
    [
        "用同一指标写两种想象路径",
        "标出总线/规范化落点",
        "选本团队主路径",
        "记下混用时的风险",
    ],
    """-- 同一指标：用户 GMV（Kimball 味道：集市/星型友好）
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid' GROUP BY user_id;

-- Inmon 味道示意：先规范化明细再汇总（逻辑顺序）
-- 3NF 企业模型 → 再派生 mart_user_gmv
-- 结果数字必须同为 Ada=350，否则集成失败""",
    "无论路径，验收仍是 Ada=350；路径差在工程顺序与规范程度，不在业务对错。",
    ["架构路线图沟通", "厂商/顾问方案翻译", "团队方法论对齐"],
    [
        ("只站队不落地总线", "集市对不齐", "先一致性维"),
        ("Inmon 未完成就承诺全部集市", "遥遥无期", "增量主题交付"),
        ("Kimball 不做集成", "烟囱", "总线矩阵"),
        ("用流派名替代对账", "数仍不对", "数字验收优先"),
    ],
    "用两列对比写：本团队更像谁？给出一个证据。",
    updown="影响分层与集市依赖；与 Vault 课对照。",
)

DWH_EXTRA["dwh-datavault"] = gold(
    "多源用户主数据冲突，又要强审计「谁何时说了什么」。",
    "理解 Hub/Link/Satellite 职责与适用边界。",
    "Kimball/Inmon → 事实表。",
    S + " 把 orders 想成业务链接，users 想成 Hub。",
    """- **Data Vault**：Hub（业务键）、Link（关系）、Satellite（描述属性+历史）。
- **优点**：审计友好、多源整合、写入并行。
- **代价**：表多，分析前常需信息mart。
- **不是**：替代指标口径；Vault 之上仍要集市/指标。
- **样例直觉**：user_id→Hub；订单参与→Link；城市属性→Satellite 历史。""",
    [
        "识别业务键 user_id / order_id",
        "想象 Satellite 存 city 变更",
        "说明仍需 mart 算出 GMV",
        "判断本项目是否需要 Vault",
    ],
    """-- Vault 并不直接给业务 GMV；信息集市仍要：
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid' GROUP BY 1;

-- Satellite 历史直觉（非严格 DV DDL）：
-- hub_user(user_hk, user_id)
-- sat_user_geo(user_hk, city, load_dts, hash_diff)
-- Dan city NULL→上海 体现为新 Satellite 行，而非覆盖""",
    "业务验收仍看 mart 的 Ada=350；Vault 价值在多源与审计，不在替代汇总。",
    ["强合规审计", "多源主数据整合", "高频结构变更的写入层"],
    [
        ("Vault 原始层直接给 BI", "难用", "建信息 mart"),
        ("无业务键设计", "Hub 坍塌", "先稳业务键"),
        ("与星型对立化", "团队内耗", "分层分工"),
        ("忽略 hash_diff/负载时间", "历史不可靠", "按 DV 标准字段"),
    ],
    "把 `order_events` 想成某种 Satellite 更新，写一句理由。",
    updown="常作企业整合层；下游仍出星型集市。",
)

DWH_EXTRA["dwh-fact"] = gold(
    "要把「支付成功」落成事实表，不知道放哪些列。",
    "会设计事实表：粒度、外键、可加度量、退化维。",
    "建模流派 → 维度表。",
    S,
    """- **事实表**：记录业务过程度量，粒度一行一事件（或一快照）。
- **组成**：维外键 + 可加/半可加度量 + 可选退化维（如 order_id）。
- **本课**：支付事实，度量 pay_amt，键 user_id、日期。
- **可加性**：金额一般可加；库存水位半可加。
- **验收**：每笔支付一行；Ada 四笔可 SUM→350。""",
    [
        "写清粒度与主键",
        "列出外键与度量",
        "插入 paid 行示意",
        "SUM 校验 Ada",
    ],
    """-- 事实：支付成功（退化维保留 order_id）
SELECT
  order_id,              -- 退化维/业务键
  user_id,               -- 维外键
  DATE(created_at) AS dt,
  COALESCE(amount,0) AS pay_amt,
  1 AS pay_cnt
FROM orders
WHERE status='paid';

SELECT user_id, SUM(pay_amt) gmv, SUM(pay_cnt) cnt
FROM (
  SELECT user_id, COALESCE(amount,0) pay_amt, 1 pay_cnt
  FROM orders WHERE status='paid'
) f GROUP BY user_id;""",
    "每笔支付一行；Ada 四笔度量可 SUM 得 350。",
    ["星型中心", "指标原子来源", "对账明细"],
    [
        ("把城市名冗余巨量进事实又不做维", "难变难管", "维表+键"),
        ("不可加指标当可加", "乱加总", "标注可加性"),
        ("无粒度主键", "重复装载", "唯一键/幂等"),
        ("含未支付状态却叫支付事实", "虚高", "过滤 paid"),
    ],
    "为退款过程设计事实：粒度、度量、与支付事实如何关联。",
    updown="连接维度外键；被 DWS 聚合。",
)

DWH_EXTRA["dwh-dim"] = gold(
    "报表要按城市看 GMV，需要用户维。",
    "会设计维度表属性、主键，并与事实 JOIN。",
    "事实表 → 代理键。",
    S,
    """- **维度表**：描述性上下文（谁/何处/何时），供切片切块。
- **属性**：user_name、city 等；宜扁平（星型）。
- **键**：业务键 user_id；历史场景加代理键。
- **与事实**：事实存维键，不堆长文本。
- **样例**：Dan 无支付，城市维仍保留此人。""",
    [
        "设计 dim_user 列",
        "与支付事实 JOIN",
        "按城市汇总",
        "解释 Dan 不出现在 GMV",
    ],
    """SELECT
  COALESCE(u.city, '未知') AS city,
  u.user_name,
  SUM(COALESCE(o.amount,0)) AS gmv
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status='paid'
GROUP BY COALESCE(u.city,'未知'), u.user_name
ORDER BY gmv DESC;""",
    "上海 / 北京 等城市 GMV；Dan 无支付不出现在该汇总（但维表可单独存在）。",
    ["切片分析", "一致性总线", "SCD 历史载体"],
    [
        ("维表无稳定键", "对不上", "业务键+代理键"),
        ("维属性巨变无 SCD 策略", "历史失真", "选 SCD 类型"),
        ("事实存城市长文本副本多处", "不一致", "单维表"),
        ("NULL 城市未处理", "分组黑洞", "COALESCE('未知')"),
    ],
    "为日期维列出至少 5 个有用属性（年季月周节日）。",
    updown="被事实引用；可 SCD 演进。",
)

DWH_EXTRA["dwh-surrogate-key"] = gold(
    "用户业务键可能复用/合并，历史事实不能被新含义污染。",
    "理解代理键（surrogate key）与业务键分工。",
    "维度 → 事实类型/SCD。",
    S + " 想象 user_id 合并或重号风险。",
    """- **代理键**：仓内无意义整数/哈希，标识维行版本。
- **业务键**：源系统自然键（user_id）。
- **用途**：SCD2 多版本、多源整合、解耦源编号策略。
- **事实**：存 user_sk 而非仅依赖易变属性。
- **注意**：代理键不替代业务审计字段。""",
    [
        "为 dim_user 增加 user_sk",
        "SCD2 新版本新 sk",
        "事实指向 sk",
        "点时间解释为何需要 sk",
    ],
    """-- 示意：同一业务键两版代理键
-- user_sk | user_id | city  | valid_from | valid_to   | is_current
-- 1001    | 4       | NULL  | 2024-01-10 | 2024-01-20 | 0
-- 1002    | 4       | 上海  | 2024-01-20 | 9999-12-31 | 1

-- 事实应按下单时刻选 sk，而不是永远 join is_current=1
SELECT 1002 AS user_sk, 108 AS order_id, 30.00 AS pay_amt;""",
    "Dan 变更后新订单指向新 sk；旧事实仍挂旧 sk，历史城市可回放。",
    ["SCD2 必备", "多源用户整合", "防止业务键重用污染"],
    [
        ("只用业务键当主键且覆盖更新", "丢历史", "SCD2+代理键"),
        ("代理键有业务含义", "难变", "无意义序号"),
        ("事实总 join 当前维", "时光旅行失败", "按时间取版本"),
        ("sk 映射表无管理", "孤儿事实", "装载顺序先维后事"),
    ],
    "说明：若只做 SCD1，还要不要代理键？给出你的取舍。",
    updown="服务 SCD 与装载顺序；事实外键依赖。",
)

DWH_EXTRA["dwh-fact-types"] = gold(
    "有人把「用户当前余额」和「支付流水」塞进同一类事实表。",
    "分清事务事实、周期快照、累积快照等类型。",
    "代理键 → 宽表 vs 指标。",
    S,
    """- **事务事实**：一笔支付一行（本样例主型）。
- **周期快照**：每日账户余额/库存一行。
- **累积快照**：订单生命周期里程碑多日期列。
- **选择**：过程是事件流→事务；状态截面→快照。
- **度量**：事务多可加；快照常半可加。""",
    [
        "把 paid 订单归为事务事实",
        "设想用户日活快照",
        "设想订单从 created→paid 的累积快照",
        "选错类型的后果写一句",
    ],
    """-- 事务事实（支付）
SELECT order_id, user_id, COALESCE(amount,0) pay_amt, created_at
FROM orders WHERE status='paid';

-- 周期快照示意：用户截至某日支付累计
SELECT '2024-01-07' AS dt, user_id,
       SUM(COALESCE(amount,0)) AS gmv_td
FROM orders
WHERE status='paid' AND created_at < '2024-01-08'
GROUP BY user_id;""",
    "事务明细可还原；快照便于「截至日」查询。Ada 截至 01-07 的 gmv_td=350。",
    ["建模选型", "库存/余额类指标", "订单履约跟踪"],
    [
        ("用事务表硬查「当日余额」无快照", "贵且易错", "周期快照"),
        ("快照当流水 SUM", "无意义", "标可加性"),
        ("累积快照日期列无更新规则", "里程碑错", "定义状态机"),
        ("混类型同表", "粒度崩", "拆表"),
    ],
    "订单 104 一直是 created：更适合事务事实还是累积快照跟踪？简述。",
    updown="决定装载频率与度量可加性；影响 DWS 设计。",
)

DWH_EXTRA["dwh-wide-vs-metric"] = gold(
    "有人要一张「超级宽表」拖所有字段，有人只要指标服务。",
    "权衡宽表集市与指标表/指标平台两种服务形态。",
    "事实类型 → 一致性维。",
    S,
    """- **宽表**：多维退化/多指标同表，取数快、易爆炸、口径耦合。
- **指标表/指标平台**：原子/派生指标受管，维度组合查询。
- **组合**：DWS 可有适度主题宽表；原子仍可审计。
- **样例**：user_id+gmv+pay_cnt 是薄汇总，不是百列上帝宽表。
- **原则**：越宽越要强 Owner 与版本。""",
    [
        "写薄 DWS 汇总",
        "对比「再拼 20 个属性」的风险",
        "说明指标服务如何复用 gmv",
        "给出团队默认策略",
    ],
    """-- 推荐：薄汇总（可对账）
SELECT user_id,
       SUM(COALESCE(amount,0)) AS gmv,
       COUNT(*) AS pay_cnt
FROM orders WHERE status='paid'
GROUP BY user_id;

-- 反例直觉：把 city/sku/渠道/设备全打进一行宽表再给所有人
-- → 改一个口径全表重跑，且易混粒度""",
    "薄表 Ada=350 清晰；宽表若不控粒度，101 多 SKU 场景极易再炸。",
    ["主题 DWS 设计", "指标平台立项", "制止上帝宽表"],
    [
        ("百列宽表无粒度说明", "取数踩坑", "拆主题+写粒度"),
        ("指标只存在于宽表列", "难治理", "指标字典"),
        ("宽表直出 ODS 字段", "脏", "经 DWD"),
        ("每人一张宽表", "烟囱", "公共 DWS/指标"),
    ],
    "列出 3 个适合进宽表的字段与 3 个应留在维/指标服务的字段。",
    updown="消费 DWD/维；服务 ADS/BI。",
)

DWH_EXTRA["dwh-conformed-dim"] = gold(
    "交易集市与营销集市的「用户城市」对不上。",
    "落地一致性维度：跨过程同一维表、同一键、同一属性语义。",
    "宽表/指标 → SCD1。",
    S,
    """- **一致性维（Conformed Dimension）**：被多个事实/集市复用的标准维。
- **要求**：键、属性定义、变更策略一致。
- **来源**：总线矩阵的列。
- **样例**：users 作为支付与（假想）加购事实的公共用户维。
- **治理**：单一 Owner，禁止集市私改 city 口径。""",
    [
        "指定 dim_user 为一致性维",
        "两过程都引用 user_id",
        "禁止集市复制改写",
        "用城市 GMV 验收",
    ],
    """-- 过程 A：支付
SELECT u.city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid' GROUP BY u.city;

-- 过程 B：取消（共享同一 users）
SELECT u.city, COUNT(*) cancel_cnt
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='cancelled' GROUP BY u.city;""",
    "两边城市语义同源；上海/北京可比。私建维会导致「上海」编码不一致。",
    ["总线落地", "跨集市对比分析", "主数据协同"],
    [
        ("集市复制维并改名", "不可比", "共享真维表"),
        ("属性同名异义", "误对比", "词典统一"),
        ("无 Owner", "私改", "指定负责人"),
        ("SCD 策略各集市不同", "历史乱", "维级统一策略"),
    ],
    "若营销坚持「城市=收货城市」交易是「注册城市」，如何一致性设计？",
    updown="来自总线；被多事实引用。",
)

DWH_EXTRA["dwh-scd1"] = gold(
    "用户改名，业务只要最新名，不要历史。",
    "掌握 SCD1：覆盖更新，简单但不保留历史。",
    "一致性维 → SCD2。",
    S,
    """- **SCD1**：慢变维类型 1——用新值覆盖旧值。
- **适用**：纠错、或业务明确不需要历史。
- **代价**：失去时光旅行；旧报表重跑会变。
- **样例**：Ada 改名为 Ada Lovelace 后只见新名。
- **对比**：要历史用 SCD2；保留少数旧值可用 SCD3。""",
    [
        "定位目标行",
        "UPDATE 覆盖",
        "确认无历史行",
        "评估对旧报表影响",
    ],
    """UPDATE users SET user_name = 'Ada Lovelace' WHERE user_id=1;
SELECT * FROM users WHERE user_id=1;

-- 支付汇总仍按 user_id，不受改名影响
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' AND user_id=1
GROUP BY user_id;""",
    "user_name 变为 Ada Lovelace；GMV 仍 350（按键汇总）。历史旧名不可查。",
    ["属性纠错", "不需要历史的展示名", "简单维维护"],
    [
        ("本需历史却用 SCD1", "无法回放", "改 SCD2"),
        ("覆盖时无审计日志", "难追责", "记变更日志"),
        ("把度量当 SCD1 覆盖", "事实被改写", "事实只追加/分区重跑"),
        ("多系统乱序覆盖", "旧值盖新", "水位/时间戳比较"),
    ],
    "举一个你们业务里必须 SCD1 的属性，说明为何不需要历史。",
    updown="维表装载策略之一；影响重跑报表。",
)

DWH_EXTRA["dwh-scd2"] = gold(
    "Dan 城市从空变为上海，下单时城市要可回放。",
    "掌握 SCD2：闭链旧版+插入新版，按时间取维。",
    "SCD1 → SCD3 / 调度。",
    S,
    """- **SCD2**：保留历史版本行；有效期 + is_current。
- **步骤**：关闭当前行（valid_to/is_current）→ 插入新版本。
- **查询**：事实业务时间落在 [valid_from, valid_to)。
- **代理键**：每版本新 sk。
- **验收**：同时仅一行 is_current=1。""",
    [
        "闭链当前行",
        "插入新版本",
        "点时间查询",
        "防双 current",
    ],
    """-- 闭链
UPDATE dim_user SET valid_to='2024-01-20', is_current=0
WHERE user_id=4 AND is_current=1;

-- 插入新版
INSERT INTO dim_user(user_sk,user_id,city,valid_from,valid_to,is_current)
VALUES (1002,4,'上海','2024-01-20','9999-12-31',1);

-- 点时间：2024-01-15 的城市
SELECT city FROM dim_user
WHERE user_id=4
  AND valid_from <= '2024-01-15'
  AND valid_to > '2024-01-15';""",
    "变更前查得 NULL/空；变更后当前为上海；旧事实可挂旧 sk。",
    ["用户地理历史", "价格/等级历史", "合规审计"],
    [
        ("只插入不闭链", "多 current", "先闭后插"),
        ("事实总 join is_current=1", "历史串味", "按时间取维"),
        ("闭开区间写反", "边界日错城", "统一半开区间"),
        ("无代理键覆盖业务键", "版本粘连", "每版新 sk"),
    ],
    "为 Ada 模拟一次城市变更，并查她 2024-01-02 的城市。",
    updown="依赖代理键与先维后事装载；服务时光旅行分析。",
)

DWH_EXTRA["dwh-scd3"] = gold(
    "只要「当前城市 + 上一次城市」，不要完整历史链。",
    "掌握 SCD3：有限历史列，简单但只保留少量旧值。",
    "SCD2 → 调度节奏。",
    S,
    """- **SCD3**：在同行增加 previous_city / current_city 等有限历史列。
- **适用**：只要对比「前值/现值」，不要多版本链。
- **限制**：第三次变更会丢掉更早值（除非加更多列）。
- **对比**：完整历史→SCD2；完全不要历史→SCD1。
- **样例**：Dan previous=NULL，current=上海。""",
    [
        "加 previous/current 列",
        "变更时平移赋值",
        "查询现值与前值",
        "说明第三次变更风险",
    ],
    """-- 示意 SCD3 更新
UPDATE dim_user_scd3
SET previous_city = city,
    city = '上海',
    city_updated_at = '2024-01-20'
WHERE user_id = 4;

SELECT user_id, previous_city, city
FROM dim_user_scd3
WHERE user_id = 4;""",
    "previous_city 为旧值（NULL），city 为上海；再变更一次将覆盖 previous。",
    ["只要前后对比的属性", "报表展示「较上次」", "实现成本受限时"],
    [
        ("本需完整历史却用 SCD3", "丢版本", "改 SCD2"),
        ("忘记平移 previous", "前值错", "先复制再覆盖"),
        ("多属性各玩各的 SCD3", "难维护", "统一策略"),
        ("与事实时间无关取用", "分析错位", "明确仅展示用"),
    ],
    "写清：会员等级若一年变 5 次，为何 SCD3 不够。",
    updown="维装载的轻量选项；复杂历史让位 SCD2。",
)

DWH_EXTRA["dwh-schedule"] = gold(
    "GMV 看板要在每天 09:00 前就绪，任务却互相抢跑。",
    "设计调度节奏：日批窗口、依赖、失败重跑策略。",
    "SCD → 装载顺序。",
    S,
    """- **调度**：按时间触发的任务编排（常与 Airflow DAG 对应）。
- **节奏**：日批 T+1、小时微批、或流式；与 SLA 绑定。
- **依赖**：先维后事、先 ODS 后 DWD。
- **样例**：09:00 前产出 dws_user_pay_gmv。
- **原则**：可重跑、有告警、有数据时间（dt）。""",
    [
        "定义业务日与 SLA",
        "列出任务依赖链",
        "设定失败重试",
        "用 Ada 验收窗口产出",
    ],
    """-- 伪调度：dt=业务日
-- 09:00 SLA 前完成：
-- 1) ods_orders_di(dt)
-- 2) dim_user（SCD）
-- 3) dwd_trade_pay_di(dt)
-- 4) dws_user_pay_gmv(dt)
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid'
GROUP BY user_id;  -- 验收 Ada=350""",
    "窗口内任务成功且 Ada=350，视为日批达标；否则告警不发布 ADS。",
    ["日仓作业", "SLA 管理", "与 ETL DAG 对齐"],
    [
        ("无依赖乱序跑", "空维/缺数", "显式依赖"),
        ("失败静默", "看板空白", "告警+门禁"),
        ("用墙上时钟当业务日", "日界错", "统一业务时区"),
        ("与回填抢同一水位", "重数漏数", "锁策略"),
    ],
    "写出支付链路四步任务名与预计时长（可假想）。",
    updown="驱动装载顺序；受 SLA/契约约束。",
)

DWH_EXTRA["dwh-load-order"] = gold(
    "事实先跑完了，维表还是旧的，城市全是未知。",
    "掌握经典装载顺序：先维度（含 SCD）后事实，再汇总。",
    "调度 → 回刷。",
    S,
    """- **顺序**：ODS → 维度(SCD) → 事实(映射 sk) → DWS/ADS → DQ。
- **原因**：事实外键依赖维代理键/当前映射。
- **并发**：无依赖的维可并行；事实等维。
- **样例**：先更新 Dan 城市，再装当日支付事实。
- **失败**：维失败则事实不应发布。""",
    [
        "画出依赖箭头",
        "维成功后再触发事实",
        "汇总最后",
        "DQ 门禁",
    ],
    """-- 1) 维（示意 SCD1/2）
-- MERGE dim_user ...

-- 2) 事实：拿到 user_sk 再插入
SELECT o.order_id, d.user_sk, COALESCE(o.amount,0) pay_amt
FROM orders o
JOIN dim_user d ON d.user_id=o.user_id AND d.is_current=1
WHERE o.status='paid';

-- 3) 汇总
SELECT user_sk, SUM(pay_amt) FROM fact_pay GROUP BY 1;""",
    "顺序正确时城市属性可解释；维未就绪就装事实会出现未知/孤儿键。",
    ["DAG 依赖设计", "SCD 日装", "发布门禁"],
    [
        ("先事实后维", "未知城市/孤儿", "先维后事"),
        ("维失败仍推 ADS", "错数外溢", "门禁阻断"),
        ("汇总早于事实", "空或旧", "依赖边"),
        ("忽略跨域维共用", "抢锁", "调度协调"),
    ],
    "若 dim_date 静态、dim_user 日更，哪些可并行？",
    updown="落实调度边；保障 SCD 与事实一致性。",
)

DWH_EXTRA["dwh-backfill"] = gold(
    "发现 1 月 2 日口径错了，要重跑历史分区且不影响今日增量。",
    "设计回刷：按分区重跑、锁定水位、发布切换。",
    "装载顺序 → 增量。",
    S,
    """- **回刷（Backfill）**：对历史 dt 重新计算并覆盖。
- **关键**：分区隔离、幂等、与增量作业互不脏写。
- **策略**：只重跑受损链路；先影子后切换。
- **样例**：重算 2024-01-02 支付 DWD/DWS。
- **沟通**：告知 BI 历史可能变数。""",
    [
        "定位错误 dt 与下游表",
        "分区 overwrite 重跑",
        "对账该 dt",
        "再开放增量",
    ],
    """-- 回刷某一天分区（示意）
INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-02')
SELECT order_id, user_id, COALESCE(amount,0) pay_amt, created_at, status
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-02' AND created_at < '2024-01-03';

SELECT SUM(pay_amt) FROM dwd_trade_pay_di WHERE dt='2024-01-02';""",
    "01-02 分区含 Ada 的 102（120）；重跑后结果稳定（幂等）。",
    ["口径修复", "漏数补算", "历史重陈述"],
    [
        ("回填无锁与增量打架", "丢数重数", "隔离窗口/锁"),
        ("整表 truncate 回填", "空窗", "按分区"),
        ("不通知下游", "环比惊吓", "公告"),
        ("不对账", "错上加错", "金额行数闭合"),
    ],
    "列出回刷 2024-01-02 的检查单 4 条。",
    updown="与增量/分区策略配合；触发 BI 重刷新。",
)

DWH_EXTRA["dwh-incremental"] = gold(
    "每天全量抽 8 行没问题，百万行就不能全量了。",
    "设计增量：水位字段、窗口半开区间、与去重配合。",
    "回刷 → 分区。",
    S + " orders.created_at / events。",
    """- **增量**：只抽取变更窗口数据。
- **水位**：高水位时间戳/自增 id；半开区间 [start,end)。
- **风险**：迟到数据、时钟回拨、重复投递。
- **配合**：目标分区覆盖或 MERGE，保证幂等。
- **事件**：先增量再按权威行去重。""",
    [
        "选水位字段",
        "写半开窗口",
        "落地后去重/覆盖",
        "与昨日水位衔接",
    ],
    """SELECT *
FROM orders
WHERE created_at >= '2024-01-07'
  AND created_at <  '2024-01-08';

-- 事件增量后去重
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id) rn
  FROM order_events e
  WHERE event_time >= '2024-01-02' AND event_time < '2024-01-03'
) t WHERE rn=1;""",
    "01-07 窗口含订单 108；102 窗口事件去重后 paid 一行。",
    ["日批 ETL", "降源压", "与 CDC 对照"],
    [
        ("闭区间导致边界重复", "重数", "统一半开"),
        ("无迟到回看", "漏数", "lookback"),
        ("追加写入不幂等", "重复事实", "覆盖/MERGE"),
        ("水位不持久化", "窗口漂移", "存状态表"),
    ],
    "若源只有 updated_at，如何设计订单增量？写要点。",
    updown="依赖源契约水位；写入分区/MERGE。",
)

DWH_EXTRA["dwh-partition"] = gold(
    "查一个月 GMV 却扫了三年分区。",
    "会按 dt 分区设计、裁剪查询，并支撑回刷。",
    "增量 → 对账。",
    S,
    """- **分区**：按 dt/月等物理拆分，利于裁剪与覆盖重跑。
- **查询**：WHERE dt 必须可裁剪，避免函数包列。
- **装载**：INSERT OVERWRITE PARTITION。
- **样例**：支付事实按支付日 dt。
- **注意**：分区过细（小时）小文件；过粗难回刷。""",
    [
        "选 dt=业务日",
        "写入指定分区",
        "查询带 dt 谓词",
        "演示回刷单分区",
    ],
    """SELECT SUM(COALESCE(amount,0)) AS gmv
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-01'
  AND created_at <  '2024-01-08';
-- 生产表应有 PARTITION (dt)
-- SELECT SUM(pay_amt) FROM dwd_trade_pay_di
-- WHERE dt BETWEEN '2024-01-01' AND '2024-01-07';""",
    "样例窗口合计 440（含 106→0）；生产靠 dt 裁剪避免全表扫。",
    ["大表管理", "回刷隔离", "成本治理"],
    [
        ("WHERE 对分区列套函数", "无法裁剪", "写范围谓词"),
        ("不分区却天天全删全插", "贵且危险", "按 dt 覆盖"),
        ("分区键选错（用装载日当业务日）", "分析错位", "业务时间分区"),
        ("过细分区", "小文件", "按日/月权衡"),
    ],
    "说明：为什么回刷更喜欢分区表而不是单堆表。",
    updown="支撑增量覆盖与回刷；查询成本关键。",
)

DWH_EXTRA["dwh-reconcile"] = gold(
    "DWS 上线后财务说 GMV 少了 8%。",
    "建立源-仓、层-层金额/行数对账，定位偏差。",
    "分区 → 练习场。",
    S,
    """- **对账**：用同一口径比较两侧总量/分类总量。
- **层次**：源 vs ODS；ODS vs DWD；DWD vs DWS；DWS vs ADS。
- **样例**：DWD SUM=DWS SUM=440；Ada=350。
- **空值**：对账前统一 COALESCE 策略。
- **门禁**：对账失败不发布。""",
    [
        "定义口径",
        "算两侧指标",
        "差分分类（状态/空值/重复）",
        "修数后回归",
    ],
    """-- 层对账
SELECT 'dwd' AS layer, SUM(COALESCE(amount,0)) gmv, COUNT(*) cnt
FROM orders WHERE status='paid'
UNION ALL
SELECT 'dws', SUM(gmv), SUM(pay_cnt) FROM (
  SELECT user_id, SUM(COALESCE(amount,0)) gmv, COUNT(*) pay_cnt
  FROM orders WHERE status='paid' GROUP BY user_id
) t;

-- 空值率
SELECT AVG(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_rate
FROM orders WHERE status='paid';""",
    "两层 gmv 同为 440、cnt 同为 6；paid 中 106 空值率 1/6。财务差 8% 时常查状态过滤与重复。",
    ["上线门禁", "事故排障", "财务月结"],
    [
        ("只对行数不对金额", "漏金额问题", "两者都对"),
        ("口径两侧不一致", "永不对", "先锁口径"),
        ("对账通过仍发错 ADS", "展示层又算一遍", "ADS 只读"),
        ("无分类差分", "难定位", "按状态/源分区拆"),
    ],
    "若 DWS=430、DWD=440，列出你最先检查的 3 个假设。",
    updown="承接全链路质量；阻断错误发布。",
)

assert len(DWH_EXTRA) == 37, len(DWH_EXTRA)

# ---------------------------------------------------------------------------
# ETL EXTRA
# ---------------------------------------------------------------------------

ETL_EXTRA = {}

ETL_EXTRA["etl-constitution"] = gold(
    "团队写管道时源表、水位、成功标准各说各话，作业无法交接。",
    "建立 ETL 公约：同源样例、主链路、验收种子与金课模板。",
    "无；建议对照数仓宪法。",
    S,
    """- **一句话定义**：ETL 教程公约——认源→抽取→转换→装载→校验→调度共用同一交易样例。
- **落点示意**：ODS 贴源、DWD 支付明细、DIM 用户、DQ 对账。
- **验收种子**：users=4，orders=8，events=7，items=5；Ada GMV=350。
- **金模板**：与数仓一致的八段结构。
- **现代补充**：ELT（先落地再仓内变换）仍服从同一口径与幂等。""",
    [
        "记住四表与 paid 口径",
        "默念主链路六段",
        "跑 GMV 验收 SQL",
        "后续叶课对照本页",
    ],
    """SELECT user_id, SUM(COALESCE(amount,0)) AS gmv, COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id
ORDER BY gmv DESC;
-- 1→350/4；2→90/1；3→0/1""",
    "| user_id | gmv | pay_cnt |\n|---:|---:|---:|\n| 1 | 350 | 4 |\n| 2 | 90 | 1 |\n| 3 | 0 | 1 |",
    ["开课对齐", "管道评审共同语言", "练习场统一参照"],
    [
        ("无验收标准就上线", "无法判成败", "先写对账"),
        ("私改 paid 口径", "与仓分叉", "跟宪法"),
        ("跳过认源直接编码", "主键/水位不清", "先清单"),
        ("把工具当目标", "堆 Airflow 无质量", "链路+DQ 优先"),
    ],
    "用五步画出样例订单从 OLTP 到 ADS 的 ETL 路径。",
    updown="对齐 SQL/数仓样例；约束全部 ETL 叶课。",
)

ETL_EXTRA["etl-path-junior"] = path_stub(
    "初级",
    "新人要会「增量抽→清洗→覆盖→对账」最小闭环。",
    "按序完成初级路径，独立写出水位抽取与金额对账。",
    [
        "教程宪法：样例与模板",
        "源表清单 / 主键与水位",
        "数据契约与 SLA 入门",
        "全量快照 vs 增量抽取",
        "类型空值规范化、去重",
        "分区覆盖装载、行数对账",
        "初级练习场",
    ],
    "勾完后默写半开窗口增量 SQL，并核对 paid GMV=440。",
)

ETL_EXTRA["etl-path-mid"] = path_stub(
    "中级",
    "已会批处理，要补 CDC、SCD、MERGE 幂等与 DAG 回填。",
    "掌握中级链路：变更捕获→维历史→幂等写→编排运维。",
    [
        "CDC 与批增量对比",
        "维关联、SCD、PII 脱敏",
        "覆盖 / MERGE / 幂等写",
        "唯一键与源仓对账",
        "DAG、重试告警、回填、迟到数据",
        "经典 ETL vs 现代 ELT",
        "中级练习场",
    ],
    "口述：Dan 城市 SCD2 + 订单 MERGE 幂等 + 回填隔离。",
)

ETL_EXTRA["etl-path-senior"] = path_stub(
    "高级",
    "要负责契约治理、工具选型与发布回滚。",
    "能做端到端方案：契约→工具→血缘→发布→高级演练。",
    [
        "契约/SLA 深化与迟到策略",
        "工具：Airflow/dbt/DataX/Airbyte/Flink CDC",
        "血缘与发布回滚",
        "与数仓分层、BI 口径联调",
        "高级练习场端到端口述",
    ],
    "写一页订单状态变更的完整 ETL 方案（含失败与回滚）。",
)

ETL_EXTRA["etl-drill-junior"] = gold(
    "用统一样例跑通「增量抽→清洗→覆盖→对账」。",
    "写出水位抽取、去重、分区覆盖与金额对账 SQL。",
    "初级清单。",
    "orders / order_events。" + S,
    """- **练习场（初级）**：批处理最小闭环。
- **必过**：半开窗口、事件权威行、GMV 闭合。
- **陷阱**：无水位全表抽、追加写入致重复。""",
    ["增量窗口", "事件去重", "DWD+对账", "记录翻车点"],
    """-- Q1 增量：昨日以来（示意）
SELECT * FROM orders
WHERE created_at >= '2024-01-07' AND created_at < '2024-01-08';

-- Q2 事件去重权威行
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id) rn
  FROM order_events e
) t WHERE rn=1;

-- Q3 对账
SELECT SUM(COALESCE(amount,0)) gmv FROM orders WHERE status='paid';""",
    "Q1 含 108；Q2：102 paid 一行；Q3：两层 gmv 可闭合到 440。",
    ["入职作业", "对照数仓初级练习", "批管道验收"],
    [
        ("无水位全表抽", "拖垮源库", "水位+窗口"),
        ("追加写入不覆盖", "重复事实", "分区覆盖/MERGE"),
        ("不去重事件", "指标翻倍", "ROW_NUMBER 权威行"),
        ("对账口径不一致", "永不平", "同 COALESCE/paid"),
    ],
    "为 users 设计主键与增量字段（若只有 created_at 怎么办？）。",
)

ETL_EXTRA["etl-drill-mid"] = gold(
    "维表变更要历史；装载要幂等；任务失败要可回填。",
    "完成 SCD2 步骤口述、MERGE 语义、回填注意点。",
    "中级清单。",
    "users / orders。" + S,
    """- **练习场（中级）**：历史 + 幂等 + 运维。
- **SCD2**：闭链+插入。
- **MERGE**：按 order_id 更新否则插入。
- **回填**：同 dt 重跑结果不变。""",
    ["SCD2 步骤题", "MERGE 语义", "回填与增量隔离", "画 DAG"],
    """-- Q1 SCD2：Dan 城市变更（闭链+插入）——步骤题
-- Q2 MERGE：按 order_id 更新 status/amount，否则插入
-- Q3 回填 dt='2024-01-02' 时如何保证不与增量打架？
MERGE INTO dwd_orders t
USING staged_orders s ON t.order_id=s.order_id
WHEN MATCHED THEN UPDATE SET status=s.status, amount=s.amount
WHEN NOT MATCHED THEN INSERT *;""",
    "Q3：按分区覆盖或合并策略，同一 dt 重跑结果不变。",
    ["上线评审", "故障演练", "中级上岗考核"],
    [
        ("回填无锁水位", "漏数/重数", "锁或隔离窗口"),
        ("SCD 不闭链", "多 current", "先闭后插"),
        ("MERGE 无唯一键", "匹配乱", "业务主键"),
        ("DAG 无依赖", "空维", "先维后事"),
    ],
    "画出 DAG：抽orders→抽users→转DWD→测DQ→出ADS。",
)

ETL_EXTRA["etl-drill-senior"] = gold(
    "端到端验收：契约→CDC/增量→SCD→幂等→DQ→血缘。",
    "口述一条订单状态变更的完整链路。",
    "高级清单。",
    "统一四表。" + S,
    """- **练习场（高级）**：设计题为主，强调失败处理与发布。
- **必含**：契约枚举、捕获、去重合并、SCD、幂等写、对账、血缘、告警 SLA。
- **验收**：能在一页纸画清，并指出两个翻车点。""",
    [
        "写 status 契约",
        "选增量或 CDC",
        "去重/MERGE/SCD",
        "DQ+血缘+告警",
    ],
    """-- 1) 契约：status ∈ {created,paid,cancelled}
-- 2) 捕获：增量窗口或 CDC binlog
-- 3) 去重/合并权威状态
-- 4) 用户维若城市变 → SCD2
-- 5) OVERWRITE/MERGE 幂等
-- 6) 对账 Ada=350 + 血缘登记
SELECT SUM(COALESCE(amount,0)) FROM orders WHERE status='paid';""",
    "链路可画在一页纸；每步有失败处理；金额闭合 440。",
    ["架构面试", "方案评审", "生产演练脚本"],
    [
        ("跳过 DQ", "错数外溢", "必门禁"),
        ("无迟到策略", "漏数", "lookback"),
        ("无回滚", "发布翻车", "视图切换/旧版"),
        ("工具选型替代设计", "无法运维", "先链路后工具"),
    ],
    "补画：告警接到谁、SLA 几点前必须成功。",
)

ETL_EXTRA["etl-source-list"] = gold(
    "新主题要上线，却不知道源在哪个库、谁负责、能否抽。",
    "建立源表清单：系统、表、主键、增量字段、负责人、敏感级。",
    "宪法 → 主键水位。",
    S,
    """- **源表清单**：管道的输入资产目录。
- **最小字段**：库表、主键、水位、刷新方式、Owner、PII。
- **样例**：orders / users / order_events / order_items。
- **用途**：影响分析、权限、抽取选型。
- **维护**：变更走评审，禁止口头传说。""",
    [
        "登记四表",
        "标主键与增量列",
        "标 Owner 与敏感级",
        "选批或 CDC",
    ],
    """-- 源清单（文档示意，可落表）
-- system | table        | pk        | watermark   | mode
-- oltp   | users        | user_id   | created_at  | 日全量/SCD
-- oltp   | orders       | order_id  | created_at  | 增量
-- oltp   | order_events | event_id  | event_time  | 增量/近实时
-- oltp   | order_items  | order_id+sku_id | —   | 随订单
SELECT 'orders' AS src, COUNT(*) AS cnt FROM orders;""",
    "清单行数与种子一致：orders=8 等；events 适合批或 CDC 需单独标注。",
    ["立项认源", "权限申请", "抽取模式决策"],
    [
        ("无主键登记", "去重失败", "先定 pk"),
        ("清单过期", "抽错表", "变更评审"),
        ("忽略 PII", "合规风险", "标敏感级"),
        ("多环境表名混乱", "抽到测试库", "环境列"),
    ],
    "给 order_events 标：批还是 CDC 更合适？为什么。",
)

ETL_EXTRA["etl-keys-watermark"] = gold(
    "增量作业昨天跑过后，今天不知道从哪接着抽。",
    "定义主键、业务时间与水位状态表，使用半开区间。",
    "源清单 → 契约。",
    S,
    """- **主键**：唯一标识一行业务实体/事件。
- **水位**：已成功处理到的进度（时间/id）。
- **半开区间**：`[last, now)` 防边界重复。
- **状态表**：持久化水位，支持重跑。
- **样例**：orders 以 created_at；events 以 event_time。""",
    [
        "为 orders 选 pk+水位",
        "写半开窗口 SQL",
        "成功后更新水位",
        "失败不推进水位",
    ],
    """-- 水位表示意：etl_watermark(job_id, last_ts)
-- last_ts = '2024-01-07 00:00:00'
SELECT *
FROM orders
WHERE created_at >= '2024-01-07 00:00:00'
  AND created_at <  '2024-01-08 00:00:00';

-- 成功后：UPDATE etl_watermark SET last_ts='2024-01-08 00:00:00'
-- WHERE job_id='orders_incr';""",
    "窗口含 108；失败重跑同一窗口应幂等（配合覆盖）。",
    ["增量抽取核心", "CDC 位点对照", "回填起点"],
    [
        ("闭区间", "边界双计", "半开"),
        ("成功前推进水位", "丢数据", "先写后提水位"),
        ("无状态表", "人工估窗口", "持久化"),
        ("主键含糊", "MERGE 乱", "复合键写清"),
    ],
    "若时钟回拨 5 分钟，水位策略如何加 lookback？",
)

ETL_EXTRA["etl-data-contract"] = gold(
    "源把 status 新增值 'partial_paid'，下游全挂。",
    "用数据契约约定字段、类型、枚举、空值与兼容变更。",
    "水位 → SLA。",
    S,
    """- **数据契约**：生产者与消费者对数据结构/语义的协议。
- **内容**：字段、类型、主键、枚举、NULL 规则、兼容策略。
- **样例**：status ∈ {created,paid,cancelled}；amount 可空。
- **变更**：新增枚举要版本/双写/公告。
- **测试**：契约测试挡上线。""",
    [
        "写下 orders 契约要点",
        "列出破坏性变更例",
        "设计兼容策略",
        "加契约测试",
    ],
    """-- 契约校验示意
SELECT status, COUNT(*)
FROM orders
GROUP BY status;
-- 期望仅 created/paid/cancelled

SELECT COUNT(*) AS bad_amount_neg
FROM orders
WHERE amount IS NOT NULL AND amount < 0;
-- 期望 0""",
    "种子状态分布合法；负金额 0 行；106 amount NULL 被契约允许。",
    ["源队与数仓协作", "接口稳定性", "防止静默坏数"],
    [
        ("无契约口头约定", "突然炸", "书面/测试化"),
        ("破坏性变更不公告", "全链路挂", "版本+双读"),
        ("契约只写类型不写枚举", "语义漂", "枚举进约"),
        ("测试不跑", "形同虚设", "CI 门禁"),
    ],
    "为 amount NULL 写契约条款：允许吗？下游如何解释？",
)

ETL_EXTRA["etl-sla"] = gold(
    "看板 9 点开会，数据 9 点半才到。",
    "定义管道 SLA：就绪时间、完整度、质量门禁与升级策略。",
    "契约 → 全量快照。",
    S,
    """- **SLA**：服务级别目标——何时就绪、允许多少延迟、失败如何升级。
- **组成**：时间、完整性、正确性（对账）、通知人。
- **样例**：工作日 09:00 前 ADS 用户 GMV 就绪且对账通过。
- **降级**：延迟公告 / 昨日数标记 stale。
- **关联**：调度重试与告警。""",
    [
        "写就绪时间",
        "写对账门禁",
        "写告警升级",
        "演练延迟公告",
    ],
    """-- SLA 验收查询（09:00 前应成功）
SELECT
  COUNT(*) AS paid_cnt,
  SUM(COALESCE(amount,0)) AS gmv
FROM orders
WHERE status='paid';
-- 期望 paid_cnt=6, gmv=440；Ada 分户 350""",
    "达标：查询成功且 gmv=440；未达：告警并冻结 ADS 发布。",
    ["经营会保障", "管道优先级排序", "值班制度"],
    [
        ("只约定时间不对质量", "准时错数", "加对账"),
        ("SLA 过紧无缓冲", "天天告警", "合理窗口"),
        ("告警无人认领", "空转", "升级路径"),
        ("延迟仍静默发布", "误导决策", "stale 标记"),
    ],
    "为支付链路写一条 SLA（时间+指标+负责人）。",
)

ETL_EXTRA["etl-full-snapshot"] = gold(
    "用户维很小，每天全量更简单。",
    "会做全量快照抽取与目标覆盖，明白适用边界。",
    "SLA → 增量。",
    S,
    """- **全量快照**：每次抽取源表现状完整副本。
- **适用**：小维表、无可靠水位、需要当日全貌。
- **装载**：常配目标表/分区覆盖。
- **代价**：源压与传输随数据量上升。
- **样例**：users 4 行日全量。""",
    [
        "抽全量 users",
        "覆盖 ods/dim",
        "行数对账=4",
        "评估是否改增量",
    ],
    """-- 全量抽取
SELECT user_id, user_name, city, created_at
FROM users;

-- 目标覆盖示意
-- INSERT OVERWRITE TABLE ods_users_di PARTITION (dt='2024-01-07')
-- SELECT *, '2024-01-07' FROM users;""",
    "4 行用户入仓；与源 COUNT 一致。大表勿盲目全量。",
    ["小维表", "日初基准", "无水位兜底"],
    [
        ("大事实表日全量", "拖垮源", "改增量/CDC"),
        ("覆盖前无备份/分区", "难回滚", "分区覆盖"),
        ("全量当增量窗口用", "概念混", "文档标明"),
        ("不对行数", "静默少表", "COUNT 闭合"),
    ],
    "给出：orders 何时可以全量，何时必须增量？",
)

ETL_EXTRA["etl-incr"] = gold(
    "订单表日增，只能抽变更窗口。",
    "实现基于水位的增量抽取并保证可重跑。",
    "全量 → CDC。",
    S,
    """- **增量抽取**：按水位只取变化数据。
- **关键**：半开区间、水位提交、目标幂等。
- **迟到**：窗口回看 lookback。
- **样例**：按 created_at 抽 01-07。
- **与 CDC**：增量是批窗口；CDC 是变更流。""",
    [
        "读水位",
        "抽窗口",
        "落地幂等",
        "提交水位",
    ],
    """SELECT order_id, user_id, amount, status, created_at
FROM orders
WHERE created_at >= '2024-01-07'
  AND created_at <  '2024-01-08';

-- 重跑同一窗口 + OVERWRITE 分区 → 结果不变""",
    "窗口得到订单 108（30, paid）；重跑不加倍。",
    ["日批事实", "降源压", "回填单日"],
    [
        ("抽完就提水位，写失败", "丢数", "写成功再提"),
        ("无幂等落地", "重复", "覆盖/MERGE"),
        ("忽略 updated_at 变更", "漏更新", "双水位或 CDC"),
        ("窗口与业务日不一致", "对账难", "统一 dt"),
    ],
    "设计 orders 同时有 created_at 与 updated_at 时的增量策略。",
)

ETL_EXTRA["etl-cdc"] = gold(
    "订单状态从 created→paid 要尽快进仓，批窗口太慢。",
    "理解 CDC：捕获变更事件，落地后再合并为权威状态。",
    "增量 → 类型规范化。",
    "order_events 可模拟变更流。" + S,
    """- **CDC**：Change Data Capture，基于日志/触发器捕获变更。
- **形态**：插入/更新/删除事件流。
- **落地**：ODS 流水 + 下游合并去重。
- **样例**：用 order_events 模拟 paid 变更；注意重复事件。
- **代价**：恰好一次、schema 变更、回压更复杂。""",
    [
        "用事件表模拟 CDC",
        "按权威行去重",
        "合并到订单状态",
        "批对账兜底",
    ],
    """SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time DESC, event_id DESC) rn
  FROM order_events e
) t WHERE rn=1;

-- 102 的重复 paid 只留一行；再与 orders 对账""",
    "102 paid 权威一行；流上可近实时，仍需批对账防漂。",
    ["近实时数仓", "微服务同步", "状态追踪"],
    [
        ("无批对账", "漂数", "日对账"),
        ("直写 ADS", "难治理", "经 ODS/DWD"),
        ("忽略重复事件", "翻倍", "去重规则"),
        ("删除事件未处理", "幽灵行", "定义 tombstone"),
    ],
    "流任务失败 10 分钟，如何补齐缺口？",
)

ETL_EXTRA["etl-type-normalize"] = gold(
    "源里金额是字符串，状态大小写混乱，NULL 与空串混用。",
    "做类型转换、枚举归一、空值策略，进入 DWD 前干净。",
    "CDC → 去重。",
    S,
    """- **类型规范化**：Cast、trim、统一枚举、时区。
- **空值策略**：amount NULL→0 或保留，必须写进契约。
- **样例**：LOWER(status)、COALESCE(amount,0)。
- **位置**：多在 DWD；ODS 保真。
- **测试**：非法枚举行数=0。""",
    [
        "Cast 金额",
        "归一 status",
        "空值策略",
        "抽样 106",
    ],
    """SELECT
  order_id,
  user_id,
  CAST(amount AS DECIMAL(18,2)) AS amount_raw,
  COALESCE(CAST(amount AS DECIMAL(18,2)), 0) AS pay_amt,
  LOWER(TRIM(status)) AS status_norm,
  created_at
FROM orders
WHERE LOWER(TRIM(status)) = 'paid';""",
    "106 pay_amt=0；状态均为小写 paid；Ada 明细金额可加总 350。",
    ["进 DWD 门槛", "防下游类型炸", "口径前置"],
    [
        ("在 ODS 改口径", "难追源", "DWD 处理"),
        ("静默丢掉非法行", "漏数", "quarantine+告警"),
        ("空串当未知城市未统一", "分组碎", "NULL/'未知'策略"),
        ("时区未转换", "日界错", "统一业务时区"),
    ],
    "写一条：status 非法值进入 quarantine 表的规则。",
)

ETL_EXTRA["etl-dedup"] = gold(
    "同一支付事件进了两次，GMV 翻倍。",
    "用窗口函数或主键约束做权威行去重。",
    "类型规范化 → 维关联。",
    "order_events。" + S,
    """- **去重**：同一业务键只保留权威一行。
- **规则**：PARTITION BY 键 + ORDER BY 时间/ id。
- **样例**：102 双 paid 事件。
- **装载**：去重后再 MERGE/覆盖。
- **预防**：源唯一约束+管道去重双保险。""",
    [
        "定义去重键",
        "ROW_NUMBER",
        "过滤 rn=1",
        "对账笔数",
    ],
    """SELECT * FROM (
  SELECT e.*,
         ROW_NUMBER() OVER (
           PARTITION BY order_id, event_type
           ORDER BY event_time, event_id) AS rn
  FROM order_events e
) t
WHERE rn = 1;""",
    "102 paid 仅一行；事件权威集可用于状态合并。",
    ["事件入仓", "重复投递防护", "CDC 落地"],
    [
        ("无决胜列", "结果不稳", "加 event_id"),
        ("去重键过粗", "误删", "键含 event_type"),
        ("去重后不对账", "仍可能漏", "COUNT 对比"),
        ("只在可视化去重", "底层仍脏", "管道内去重"),
    ],
    "若重复投递整单 orders 行，去重键应是什么？",
)

ETL_EXTRA["etl-dim-join"] = gold(
    "事实要补城市，却把明细 JOIN 炸了或城市全空。",
    "正确关联维度：键匹配、时间点取维、先聚合再算金额。",
    "去重 → SCD。",
    S,
    """- **维关联**：事实外键连接维表属性。
- **当期**：join is_current=1（谨慎）。
- **历史**：按业务时间落在维有效期。
- **防爆炸**：多对多先聚合。
- **样例**：支付 ⋈ 用户城市。""",
    [
        "选 JOIN 键",
        "处理城市 NULL",
        "汇总 GMV",
        "检查 Dan",
    ],
    """SELECT
  COALESCE(u.city, '未知') AS city,
  SUM(COALESCE(o.amount, 0)) AS gmv
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'paid'
GROUP BY COALESCE(u.city, '未知');

-- 错误示范：先 join items 再 sum(amount) 会放大""",
    "上海/北京 GMV 可解释；Dan 无支付不出现。",
    ["事实充实", "集市宽表生成", "SCD 时间点关联"],
    [
        ("总 join 当前维看历史", "串味", "点时间"),
        ("join items 后 sum 头金额", "放大", "先聚合"),
        ("LEFT JOIN 维失败当内连接", "丢事实", "明确策略"),
        ("键类型不一致", "全空", "统一类型"),
    ],
    "写出：2024-01-15 取 Dan 城市再关联当日事实的谓词。",
)

ETL_EXTRA["etl-scd"] = gold(
    "用户城市变更要进维表历史，ETL 如何落地 SCD2。",
    "在管道中实现闭链+插入，并保证幂等。",
    "维关联 → PII。",
    S,
    """- **ETL 中的 SCD**：比较业务键哈希/字段，决定 1/2/3 类动作。
- **SCD2 步骤**：变更检测→闭链→插新版→映射 sk。
- **幂等**：同一变更重跑不产生多 current。
- **样例**：Dan NULL→上海。
- **顺序**：先维 SCD，后事实。""",
    [
        "变更检测",
        "闭链",
        "插入",
        "校验单 current",
    ],
    """-- 伪代码步骤
-- 1) 检出 user_id=4 city 变化
-- 2) UPDATE ... SET is_current=0, valid_to=:ts WHERE user_id=4 AND is_current=1
-- 3) INSERT 新版本 city='上海'
SELECT user_id, COUNT(*) AS current_cnt
FROM dim_user
WHERE is_current=1 AND user_id=4
GROUP BY user_id;
-- 期望 current_cnt=1""",
    "变更后仅一行 current；点时间可回放旧城。",
    ["维日装", "主数据历史", "合规"],
    [
        ("检测用非确定性时间", "乱序", "源更新时间+哈希"),
        ("不闭链", "双 current", "事务化步骤"),
        ("重跑再插一版", "版本爆炸", "幂等检测"),
        ("事实先跑", "sk 旧", "先维后事"),
    ],
    "把 SCD1 与 SCD2 的 ETL 分支画成 if-else 要点。",
)

ETL_EXTRA["etl-pii-mask"] = gold(
    "用户姓名要给分析师，但不能明文出仓到广告团队。",
    "在转换层做脱敏/最小化，按权限输出。",
    "SCD → 覆盖装载。",
    S,
    """- **PII 脱敏**：对个人敏感信息哈希、掩码、令牌化或剔除。
- **原则**：最小必要；分区权限；审计。
- **样例**：user_name 掩码、city 可保留等级更低。
- **位置**：出 ODS 后、进共享层前。
- **注意**：脱敏仍可能准标识，需组合风险控制。""",
    [
        "识别 PII 列",
        "选掩码策略",
        "分权限视图",
        "禁止下游回联明文",
    ],
    """SELECT
  user_id,
  CONCAT(LEFT(user_name,1), '**') AS user_name_mask,
  city
FROM users;

-- 分析集市只暴露 mask；明文仅限受控区
SELECT u.user_id, CONCAT(LEFT(u.user_name,1),'**') AS name_mask,
       SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid'
GROUP BY u.user_id, CONCAT(LEFT(u.user_name,1),'**');""",
    "Ada→A**；GMV 仍可按 user_id 汇总到 350。",
    ["共享集市", "外部协作", "合规审计"],
    [
        ("仅前端隐藏", "库仍明文裸奔", "库内脱敏/权限"),
        ("哈希无盐可撞库", "重识别", "加盐/令牌服务"),
        ("脱敏后当主键乱关联", "断链", "保留内部 sk"),
        ("日志打印明文", "泄漏", "日志脱敏"),
    ],
    "列出 users 表哪些列是 PII，哪些可进公开集市。",
)

ETL_EXTRA["etl-overwrite"] = gold(
    "同一业务日重跑，必须把旧分区换成新结果。",
    "掌握分区覆盖装载，保证窗口幂等。",
    "PII → MERGE。",
    S,
    """- **覆盖写（Overwrite）**：目标分区/表替换为本次结果。
- **适用**：日批分区、全量小维。
- **幂等**：同输入同输出。
- **风险**：覆盖范围写错（全表）会删光。
- **样例**：dt='2024-01-07' 覆盖支付明细。""",
    [
        "限定分区",
        "INSERT OVERWRITE",
        "重跑验证",
        "对账",
    ],
    """INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-07')
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at, status
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-07' AND created_at < '2024-01-08';

SELECT COUNT(*) FROM dwd_trade_pay_di WHERE dt='2024-01-07';""",
    "该分区含 108 一行；重跑次数与行数无关（仍为 1）。",
    ["日批 DWD", "回刷单日", "小维全量"],
    [
        ("漏写分区覆盖全表", "删光历史", "强制分区语法审查"),
        ("覆盖与增量追加混用无文档", "重复", "模式写清"),
        ("覆盖成功不对账", "空分区上线", "COUNT/金额"),
        ("覆盖中查询无快照隔离", "读到半截", "交换分区/影子表"),
    ],
    "解释：为什么回填某天常用 overwrite 而不是 delete+insert 多语句？",
)

ETL_EXTRA["etl-merge-upsert"] = gold(
    "订单状态会变，目标表要更新已有行并插入新行。",
    "会写 MERGE/UPSERT，并定义匹配键。",
    "覆盖 → 幂等写。",
    S,
    """- **MERGE/UPSERT**：按键匹配则更新，否则插入（可处理删除）。
- **匹配键**：业务主键 order_id。
- **适用**：可变状态表、维 SCD1、CDC 落地。
- **幂等**：同一变更多次 MERGE 结果稳定。
- **引擎**：语法各异，语义对齐。""",
    [
        "准备 staged",
        "ON 匹配键",
        "WHEN MATCHED/NOT",
        "重跑验证",
    ],
    """MERGE INTO dwd_orders t
USING (
  SELECT order_id, user_id, amount, status, created_at FROM orders
) s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET
  amount = s.amount,
  status = s.status
WHEN NOT MATCHED THEN INSERT (order_id, user_id, amount, status, created_at)
VALUES (s.order_id, s.user_id, s.amount, s.status, s.created_at);""",
    "104 保持/更新为 created；支付单状态与金额与源一致；重跑不增行。",
    ["状态事实", "CDC 落地", "SCD1 维"],
    [
        ("匹配键不唯一", "更新风暴", "先去重"),
        ("更新无条件覆盖旧新", "乱序脏写", "比时间戳"),
        ("无 NOT MATCHED BY SOURCE 删策略", "幽灵", "显式定义"),
        ("MERGE 大表无分区裁剪", "极慢", "限制窗口"),
    ],
    "若源删除订单 104，MERGE 如何表达？写要点。",
)

ETL_EXTRA["etl-idempotent-write"] = gold(
    "任务失败重试后，表里出现双倍 GMV。",
    "设计幂等写入：同逻辑日重跑结果不变。",
    "MERGE → 行数校验。",
    S,
    """- **幂等**：同一输入重复执行，效果与一次相同。
- **手段**：分区覆盖、MERGE 按键、去重、事务/两阶段。
- **反例**：裸 append 无去重。
- **验收**：故意跑两遍，Ada 仍 350。
- **水位**：与幂等配合，失败可安全重试。""",
    [
        "选幂等策略",
        "实现覆盖或 MERGE",
        "双跑验证",
        "监控行数",
    ],
    """-- 幂等：分区覆盖
INSERT OVERWRITE TABLE dws_user_pay_gmv PARTITION (dt='2024-01-07')
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv, COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id;

-- 故意理解：再执行一次，结果集不变
SELECT * FROM dws_user_pay_gmv WHERE dt='2024-01-07' AND user_id=1;""",
    "双跑后 Ada 仍 gmv=350、pay_cnt=4。",
    ["重试安全", "回填安全", "SLA 保障"],
    [
        ("append 当重试", "翻倍", "覆盖/MERGE"),
        ("幂等只谈写不谈水位", "窗口漂移", "一起设计"),
        ("依赖『恰好跑一次』调度", "必翻车", "至少一次+幂等"),
        ("无双跑测试", "上线才爆", "演练"),
    ],
    "给事件表写入写一种幂等方案（键+策略）。",
)

ETL_EXTRA["etl-rowcount"] = gold(
    "作业绿了，但今天分区只有 0 行。",
    "做行数校验：源 vs 目标、阈值阈值、空分区告警。",
    "幂等 → 唯一键。",
    S,
    """- **行数校验**：最基本 DQ——两侧 COUNT 对比。
- **阈值**：相对昨日波动阈值。
- **空分区**：零行即失败（除非业务真零）。
- **样例**：paid 明细 6 行；users 4 行。
- **局限**：行数对不等金额对，需组合。""",
    [
        "COUNT 源",
        "COUNT 目标",
        "比差值",
        "设阈值",
    ],
    """SELECT 'src_paid' AS side, COUNT(*) AS cnt
FROM orders WHERE status='paid'
UNION ALL
SELECT 'src_users', COUNT(*) FROM users;

-- 期望：6 与 4；目标表应匹配
-- ASSERT cnt_target = cnt_src""",
    "paid=6，users=4；若目标 paid 分区=0 → 阻断发布。",
    ["上线门禁", "空跑发现", "波动监控"],
    [
        ("只看任务成功码", "空分区漏过", "行数断言"),
        ("阈值过宽", "漏数不警", "按业务校准"),
        ("跨口径比行数", "误报", "同过滤条件"),
        ("忽略删除语义", "源少目标多", "定义软删"),
    ],
    "为 dwd_trade_pay_di 写两条行数规则（绝对+波动）。",
)

ETL_EXTRA["etl-unique-pk"] = gold(
    "目标表 order_id 重复，MERGE 与汇总都乱。",
    "校验主键唯一，重复行进隔离并告警。",
    "行数 → 对账。",
    S,
    """- **唯一性校验**：主键/业务键无重复。
- **方法**：GROUP BY key HAVING COUNT(*)>1。
- **样例**：orders.order_id；events 去重后的 (order_id,event_type)。
- **动作**：隔离重复、修源、阻断下游。
- **与去重**：校验发现问题；去重是修复手段之一。""",
    [
        "定义主键",
        "查重复",
        "隔离",
        "修后回归",
    ],
    """SELECT order_id, COUNT(*) AS cnt
FROM orders
GROUP BY order_id
HAVING COUNT(*) > 1;

SELECT order_id, event_type, COUNT(*) AS cnt
FROM order_events
GROUP BY order_id, event_type
HAVING COUNT(*) > 1;""",
    "orders 主键无重复；events 在 (102,paid) 上 cnt=2，需去重门禁。",
    ["装载前 DQ", "MERGE 前置", "源质量反馈"],
    [
        ("发现重复仍装载", "扩散", "阻断"),
        ("复合键漏列", "误判", "键写全"),
        ("只告警不计量", "无人修", "重复率 KPI"),
        ("用代理键唯一掩盖业务重复", "业务仍脏", "业务键也检"),
    ],
    "为 order_items 写出应唯一的键并给校验 SQL。",
)

ETL_EXTRA["etl-recon"] = gold(
    "源说 GMV 440，仓里 400，开会对峙。",
    "做金额/分类对账，定位状态、空值、重复原因。",
    "唯一键 → DAG。",
    S,
    """- **对账**：同口径比较金额与分类汇总。
- **切面**：状态、dt、渠道、空值策略。
- **样例**：源 paid SUM COALESCE=440；按用户 Ada=350。
- **门禁**：差额超阈不发布。
- **输出**：对账报表给值班。""",
    [
        "锁口径",
        "两侧汇总",
        "分类差分",
        "修数回归",
    ],
    """SELECT
  SUM(COALESCE(amount,0)) AS gmv,
  SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_amt_cnt,
  COUNT(*) AS paid_cnt
FROM orders
WHERE status='paid';

SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid'
GROUP BY user_id;""",
    "gmv=440，null_amt_cnt=1，paid_cnt=6；用户侧 Ada=350。",
    ["日结", "事故定位", "财务协同"],
    [
        ("口径不同硬比", "永不平", "先对齐"),
        ("只对总值不对用户", "掩盖串户", "分类对"),
        ("对平后改 ADS 算法", "再偏", "ADS 只读"),
        ("无阈值", "小差拖成大案", "设阈值"),
    ],
    "若差额正好等于 106 的应填 0 策略差异，如何写进对账说明？",
)

ETL_EXTRA["etl-dag"] = gold(
    "任务手工一个个点，维没好事实就跑了。",
    "用 DAG 表达依赖：边=数据依赖，点=可重试任务。",
    "对账 → 重试告警。",
    S,
    """- **DAG**：有向无环图编排 ETL。
- **边**：成功依赖；禁止环。
- **样例**：抽orders/抽users → SCD维 → DWD → DQ → ADS。
- **并发**：无依赖可并行。
- **工具**：Airflow 等（见工具课）。""",
    [
        "列任务节点",
        "画依赖",
        "标并行点",
        "DQ 作门禁节点",
    ],
    """-- 伪 DAG
-- extract_orders ─┐
-- extract_users  ─┼─> transform_dim_user ─> transform_dwd_pay ─> dq_recon ─> publish_ads
--                 └─────────────────────────┘
SELECT 'dq_recon_ok' AS gate
WHERE (SELECT SUM(COALESCE(amount,0)) FROM orders WHERE status='paid') = 440;""",
    "门禁通过才 publish；依赖保证先维后事。",
    ["调度设计", "失败局部重跑", "团队分工边界"],
    [
        ("隐式依赖靠时间碰运气", "偶发空维", "显式边"),
        ("大环依赖", "死锁", "审查 DAG"),
        ("DQ 不在关键路径", "错数发布", "作上游门禁"),
        ("过细任务难运维", "噪声", "合理聚合"),
    ],
    "把回填画成单独 DAG 还是参数化同一 DAG？写你的选择。",
)

ETL_EXTRA["etl-retry-alert"] = gold(
    "夜间任务失败，早上开会才发现。",
    "配置重试、超时、告警升级与值班认领。",
    "DAG → 回填。",
    S,
    """- **重试**：瞬时失败可自动重试（幂等前提）。
- **告警**：失败/SLA 超时通知到人。
- **升级**：未认领则升级负责人。
- **样例**：DWD 失败重试 2 次后告警，阻断 ADS。
- **忌**：非幂等任务盲目重试。""",
    [
        "标幂等任务可重试",
        "设次数与间隔",
        "告警通道",
        "升级策略",
    ],
    """-- 运维策略示意（非 SQL 引擎）
-- retry=2, backoff=5m, timeout=30m
-- on_failure: page oncall + block downstream
SELECT CASE
  WHEN SUM(COALESCE(amount,0)) FILTER (WHERE status='paid') = 440
  THEN 'ok' ELSE 'alert' END AS dq_status
FROM orders;""",
    "dq_status=ok 则静默；否则告警且不 publish。",
    ["夜间值班", "SLA 守护", "减少晨间突袭"],
    [
        ("非幂等重试", "翻倍", "先幂等"),
        ("告警风暴无人理", "疲劳", "聚合+认领"),
        ("只告成功不告超时", "迟到无感", "SLA 告警"),
        ("下游仍跑", "错数扩散", "失败短路"),
    ],
    "写一条告警文案模板（含 dt、任务、影响、下一动作）。",
)

ETL_EXTRA["etl-backfill"] = gold(
    "要重跑上周三分区，同时今晚增量还要跑。",
    "规划回填作业：范围、优先级、锁水位、验证。",
    "重试 → 迟到数据。",
    S,
    """- **回填**：历史窗口重处理。
- **隔离**：按 dt 覆盖；避免与在线增量写同一冲突区。
- **优先级**：先修关键主题。
- **样例**：回填 2024-01-02 支付分区。
- **沟通**：通知 BI 历史可能变化。""",
    [
        "定 dt 范围",
        "暂停冲突增量或锁",
        "覆盖重跑+对账",
        "恢复增量",
    ],
    """INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-02')
SELECT order_id, user_id, COALESCE(amount,0), created_at, status
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-02' AND created_at < '2024-01-03';

SELECT SUM(COALESCE(amount,0)) FROM orders
WHERE status='paid' AND created_at >= '2024-01-02' AND created_at < '2024-01-03';""",
    "该日含 102 金额 120；回填后稳定。",
    ["口径修复", "漏数补齐", "迁移重算"],
    [
        ("回填撞增量", "丢/重", "锁或错峰"),
        ("大范围无分批", "跑爆", "按日切片"),
        ("不对账", "假完成", "金额闭合"),
        ("不公告", "业务惊吓", "变更通知"),
    ],
    "列回填检查单：范围/锁/对账/通知/恢复。",
)

ETL_EXTRA["etl-late-data"] = gold(
    "支付事件晚到 2 小时，昨日分区已经关账。",
    "处理迟到数据：lookback、可修正分区、水位回退策略。",
    "回填 → 经典 ETL。",
    S,
    """- **迟到数据**：事件时间早于处理时间，越过原窗口。
- **手段**：窗口 lookback、允许小范围重刷、端到端延迟监控。
- **样例**：01-02 事件延至 01-03 才到。
- **权衡**：延迟 vs 完整性。
- **与 SLA**：明确「初步数」与「终态数」。""",
    [
        "定义允许迟到阈值",
        "增量加 lookback",
        "重刷受影响 dt",
        "监控延迟分布",
    ],
    """-- 抽取时回看 2 小时（示意）
-- watermark_start = last_ts - INTERVAL '2' HOUR
SELECT *
FROM order_events
WHERE event_time >= '2024-01-02 00:00:00'
  AND event_time <  '2024-01-03 00:00:00';
-- 若事件迟到进入次日作业，需再次 MERGE 到 01-02 分区或状态表""",
    "迟到 paid 合并后 102 仍保持单行权威；GMV 不因迟到永久缺失。",
    ["近实时管道", "关账后修正", "CDC 场景"],
    [
        ("无 lookback", "永久漏", "回看+重刷"),
        ("无限等待", "无 SLA", "初步/终态双版本"),
        ("迟到直接 append", "重复", "MERGE/去重"),
        ("不监控事件延迟", "盲目", "延迟直方图"),
    ],
    "为支付 GMV 定义 T+1 12:00 终态与 09:00 初步数的规则。",
)

ETL_EXTRA["etl-classic"] = gold(
    "传统项目在专用 ETL 服务器完成转换再装仓。",
    "理解经典 ETL：抽取-转换-装载的顺序与利弊。",
    "迟到 → 现代 ELT。",
    S,
    """- **经典 ETL**：在进入目标仓前完成主要转换。
- **优点**：目标仓干净、可减轻仓计算；工具成熟。
- **代价**：转换层易成黑盒；弹性不如仓内算力。
- **样例**：在作业里滤 paid、COALESCE 后再写入 DWD。
- **对比 ELT**：先载后变。""",
    [
        "画出 ETL 顺序",
        "在作业内完成清洗",
        "装载 DWD",
        "对账",
    ],
    """-- 转换在装载前完成（作业内 SQL/脚本）
SELECT order_id, user_id,
       COALESCE(amount,0) AS pay_amt,
       created_at
FROM orders
WHERE status='paid';
-- 然后写入仓内 dwd_trade_pay_di""",
    "写出即是干净支付明细；Ada 汇总 350。",
    ["传统数仓项目", "目标仓算力弱", "强控落仓质量"],
    [
        ("黑盒脚本无版本", "难审", "代码仓+评审"),
        ("重复造指标", "与仓分叉", "与词典对齐"),
        ("全在 ETL 服务器撑不住", "慢", "评估 ELT"),
        ("无幂等", "重跑翻倍", "覆盖策略"),
    ],
    "列出 2 个适合继续经典 ETL 的理由。",
)

ETL_EXTRA["etl-modern-elt"] = gold(
    "数据先入湖/仓，用 SQL/dbt 在仓内变换。",
    "理解 ELT：先装载原始/贴源，再仓内转换。",
    "经典 ETL → 工具 Airflow。",
    S,
    """- **ELT**：Extract-Load-Transform，转换主要在目标系统。
- **优点**：弹性计算、SQL 可见、与 dbt 匹配。
- **代价**：需管好原始层成本与权限；同样要幂等与测试。
- **样例**：先 ODS 贴源，再 dbt 出 DWD/DWS。
- **不是**：可以不要质量；门禁同样要。""",
    [
        "落地 ODS",
        "仓内建 DWD 模型",
        "测试 Ada=350",
        "文档血缘",
    ],
    """-- ELT：已在仓内的 ODS 上变换
SELECT order_id, user_id,
       COALESCE(amount,0) AS pay_amt,
       created_at AS pay_at
FROM ods_orders_di
WHERE dt='2024-01-07' AND status='paid';

SELECT user_id, SUM(pay_amt) gmv
FROM (
  SELECT user_id, COALESCE(amount,0) pay_amt
  FROM orders WHERE status='paid'
) t GROUP BY user_id;""",
    "仓内模型输出 Ada=350；原始层仍可追源。",
    ["云仓/湖仓", "dbt 团队", "快速迭代指标"],
    [
        ("原始层当集市开放", "脏读", "分层权限"),
        ("无测试", "错数快", "dbt test"),
        ("成本不管分区", "账单炸", "生命周期"),
        ("以为 ELT 不需契约", "源一变全挂", "仍要契约"),
    ],
    "用一句话说明：你们若已有 Hive/BigQuery，为何倾向 ELT。",
)

ETL_EXTRA["etl-tool-airflow"] = gold(
    "要用编排器管理依赖、重试与回填，而不是 crontab 丛林。",
    "理解 Airflow：DAG、operator、执行日期与重试。",
    "ELT → dbt。",
    S,
    """- **Airflow**：工作流编排平台，核心是 DAG。
- **职责**：调度与依赖，不替代变换引擎本身。
- **概念**：dag_id、task、execution_date/data_interval、retry。
- **样例**：编排抽数→dbt→DQ。
- **注意**：把重业务 SQL 塞进 PythonOperator 难维护。""",
    [
        "定义 DAG 节点",
        "设依赖",
        "配重试",
        "用 data_interval 对齐 dt",
    ],
    """# 伪代码示意
# with DAG('pay_daily') as dag:
#   ext = BashOperator(task_id='extract_orders', ...)
#   trn = BashOperator(task_id='dbt_run_dwd', ...)
#   dq  = BashOperator(task_id='recon_gmv', ...)
#   ext >> trn >> dq
print('dt={{ ds }} ensure Ada gmv=350 after dbt')""",
    "DAG 跑通后 DQ 任务断言 GMV；失败则下游 publish 不触发。",
    ["批调度中枢", "回填参数化", "多系统编排"],
    [
        ("Airflow 里写巨型变换", "难测", "变换下沉 dbt/SQL"),
        ("忽略 data_interval", "错日", "dt 对齐"),
        ("sensor 过多", "槽位占满", "事件驱动/数据集"),
        ("无告警回调", "静默失败", "on_failure_callback"),
    ],
    "为支付链路列 4 个 task_id 与依赖箭头。",
    lang="python",
)

ETL_EXTRA["etl-tool-dbt"] = gold(
    "仓内模型要用版本化 SQL、测试与文档管理。",
    "理解 dbt：model、test、ref、分层目录。",
    "Airflow → 摄取工具。",
    S,
    """- **dbt**：仓内变换框架（ELT 搭档）。
- **核心**：SELECT 模型物化成表/视图；ref 管血缘；test 管质量。
- **样例**：stg_orders → fct_pay → 断言 gmv。
- **不是**：摄取工具；源仍靠 ingest/CDC。
- **实践**：与 Airflow 调度结合。""",
    [
        "写 staging 模型",
        "写事实模型",
        "加 unique/not_null 测试",
        "跑并看血缘",
    ],
    """-- models/staging/stg_orders.sql（示意）
SELECT order_id, user_id,
       CAST(amount AS DECIMAL(18,2)) AS amount,
       LOWER(status) AS status,
       created_at
FROM ods_orders_di
WHERE status = 'paid';

-- tests：unique(order_id), not_null(user_id)
-- 下游：SUM(COALESCE(amount,0))=440""",
    "模型通过测试；用户汇总 Ada=350。",
    ["仓内 ELT", "指标/事实版本化", "分析工程师协作"],
    [
        ("dbt 直接打生产 OLTP", "危险", "只打仓"),
        ("无 test", "假安心", "关键键必测"),
        ("模型层层过深", "慢", "合理分层"),
        ("密钥进仓库", "泄漏", "环境变量"),
    ],
    "为 stg_orders 列 3 个 dbt test。",
)

ETL_EXTRA["etl-tool-ingest"] = gold(
    "要把库表/文件先稳定送进 ODS/湖，再谈变换。",
    "认识摄取层职责：连接、窗口、落地格式、基本校验。",
    "dbt → DataX。",
    S,
    """- **摄取（Ingest）**：从源移动到落点的通道。
- **要求**：可靠、可观测、少转换（保真）。
- **样例**：orders 入 ods_orders_di。
- **与变换**：ingest≠数仓完成；还要 DWD/DQ。
- **形态**：批文件、JDBC、CDC connector。""",
    [
        "选连接方式",
        "落 ODS",
        "行数校验",
        "交对接 dbt/SQL",
    ],
    """-- 摄取后的贴源查询
SELECT order_id, user_id, amount, status, created_at, '2024-01-07' AS dt
FROM orders;

SELECT COUNT(*) AS ods_cnt FROM orders;  -- 期望 8""",
    "ODS 行数 8；字段保真（106 仍 NULL）。",
    ["入湖第一站", "多源汇聚", "为 ELT 提供原料"],
    [
        ("摄取时大改口径", "无法追源", "保真"),
        ("无监控延迟", "不知卡住", "lag 指标"),
        ("摄取成功当业务成功", "错数", "继续 DQ"),
        ("凭证硬编码", "风险", "密钥管理"),
    ],
    "写摄取作业的 4 个必选监控项。",
)

ETL_EXTRA["etl-tool-datax"] = gold(
    "要把 MySQL 订单批同步到 Hive/仓。",
    "知道 DataX 以 Reader/Writer 插件做批同步。",
    "摄取 → Airbyte。",
    "orders 增量窗。" + S,
    """- **DataX**：阿里开源批数据同步框架。
- **形态**：job.json 配 reader/writer。
- **适合**：库表/文件窗口批跑。
- **仍要**：分区覆盖 + 对账 + 契约。
- **不适合**：冒充实时 CDC。""",
    [
        "写 Reader SQL 窗口",
        "配 Writer 目标",
        "跑批",
        "对账",
    ],
    """-- Reader 侧 SQL（示意）
SELECT order_id, user_id, amount, status, created_at
FROM orders
WHERE created_at >= :start AND created_at < :end;
-- Writer 落地后：
-- INSERT OVERWRITE ... ; 并对账 SUM(COALESCE(amount,0))""",
    "窗口数据进入目标表；重跑靠覆盖/幂等；paid 口径仍由下游保证。",
    ["传统数仓装载", "异构库同步", "窗口批"],
    [
        ("当实时 CDC", "延迟与语义不符", "改 Flink CDC"),
        ("无脏数据策略", "脏进湖", "加 DQ"),
        ("大窗口无切分", "失败难续", "分片"),
        ("与 dbt 职责不清", "双处变换", "DataX 保真、dbt 变换"),
    ],
    "DataX 与「仓内 dbt」如何分工？",
)

ETL_EXTRA["etl-tool-airbyte"] = gold(
    "要快速接 SaaS/库表，少写连接器。",
    "理解 Airbyte Source/Destination 与 ELT 搭配。",
    "DataX → Flink CDC。",
    "标准化连接。" + S,
    """- **Airbyte**：开源数据移动，偏 ELT。
- **落地**：原始层再 dbt。
- **价值**：连接器生态、快速接入。
- **风险**：同步成功≠指标正确。
- **安全**：密钥与权限。""",
    [
        "选 Source/Dest",
        "同步到原始层",
        "dbt 出支付口径",
        "契约测试",
    ],
    """-- 同步后变换仍用口径
SELECT SUM(COALESCE(amount,0)) AS gmv
FROM orders
WHERE status='paid';
-- 期望 440；连接器只负责搬，不管 GMV 口径""",
    "连接器跑通后，仍需变换与对账使 Ada=350。",
    ["快速接入", "中小团队", "SaaS 源"],
    [
        ("同步即数仓", "无分层", "仍要 ODS/DWD"),
        ("密钥进仓库", "泄漏", "密文配置"),
        ("schema 漂移无检测", "模型挂", "契约/探测"),
        ("全量盲同步大表", "贵", "增量流"),
    ],
    "何时选 Airbyte 而不是自研 DataX 作业？",
)

ETL_EXTRA["etl-tool-flink-cdc"] = gold(
    "订单状态要秒级入湖/仓。",
    "Flink CDC 读 binlog/WAL 做流式入湖。",
    "Airbyte → 血缘。",
    "order 变更流。" + S,
    """- **Flink CDC**：流式变更捕获与处理。
- **注意**：恰好一次语义、schema 变更、回压、状态后端。
- **落地**：ODS 流水 + 下游去重合并。
- **样例**：事件去重模拟。
- **兜底**：批对账。""",
    [
        "对接日志源",
        "入 ODS 流表",
        "去重合并",
        "批对账",
    ],
    """SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time DESC, event_id DESC) rn
  FROM order_events e
) t WHERE rn=1;""",
    "流上压缩为最新事件；批对账兜底防漂。",
    ["近实时数仓", "微服务同步", "运营实时看板原料"],
    [
        ("无批对账", "漂数", "日对账"),
        ("直写 ADS", "难控", "经 ODS/DWD"),
        ("忽略回压", "丢/延迟", "监控与降级"),
        ("schema 变更无演练", "作业挂", "兼容策略"),
    ],
    "流任务失败 10 分钟，如何补齐缺口？",
)

ETL_EXTRA["etl-lineage"] = gold(
    "GMV 错了，要追是哪条管道、哪张上游表。",
    "建立表/列级血缘；与调度、词典打通。",
    "Flink CDC → 发布。",
    "ads_gmv ← dwd_pay ← ods_orders ← oltp.orders。" + S,
    """- **血缘**：数据从哪来到哪去。
- **价值**：影响分析、问责、合规。
- **粒度**：任务级不足，需表/列级。
- **采集**：随发布自动，而非事后补文档。
- **样例**：支付 GMV 三跳。""",
    [
        "登记链路",
        "关联 DAG task",
        "变更时影响分析",
        "事故反查",
    ],
    """-- 文档/元数据示意
-- oltp.orders -> ods_orders_di -> dwd_trade_pay_di -> ads_user_gmv
SELECT 'ods_orders_di' AS upstream, 'dwd_trade_pay_di' AS downstream
UNION ALL
SELECT 'dwd_trade_pay_di', 'ads_user_gmv';""",
    "改 orders.status 枚举可评估下游清单；排障可顺藤摸瓜。",
    ["事故定位", "变更评审", "OpenLineage/数据目录"],
    [
        ("只有任务名无表级", "不够用", "落到表/列"),
        ("血缘不更新", "误导", "随发布采集"),
        ("血缘与词典脱节", "不知口径", "打通指标"),
        ("只画大图无负责人", "推诿", "节点挂 Owner"),
    ],
    "列出 gmv_pay 的最小 3 跳血缘。",
)

ETL_EXTRA["etl-publish"] = gold(
    "新口径要上线，不能让看板白天空窗。",
    "用影子表/蓝绿或分区切换做发布与回滚。",
    "血缘 → 高级练习。",
    "替换 ads 用户 GMV。" + S,
    """- **发布**：原子切换对消费者可见版本。
- **手段**：交换表名、视图切分、分区上线。
- **回滚**：保留旧版对象。
- **门禁**：对账通过才切。
- **样例**：ads_user_gmv 视图切换。""",
    [
        "建 v2 影子表",
        "对账 Ada=350",
        "切换视图",
        "异常回滚",
    ],
    """-- 写新表再切视图
-- CREATE TABLE ads_user_gmv_v2 AS
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid'
GROUP BY user_id;
-- CREATE OR REPLACE VIEW ads_user_gmv AS SELECT * FROM ads_user_gmv_v2;""",
    "切换瞬时完成；失败可回滚视图；用户可见 Ada=350 不中断。",
    ["口径变更", "大表更换", "无空窗发布"],
    [
        ("白天 truncate 真表", "空窗", "影子切换"),
        ("无回滚", "长时间事故", "预留旧版"),
        ("未对账就切", "错数全网", "门禁"),
        ("无公告", "环比误读", "版本说明"),
    ],
    "设计一次「AOV 口径变更」的发布检查单 3 条。",
)

ETL_IDS = [
    "etl-constitution", "etl-path-junior", "etl-path-mid", "etl-path-senior",
    "etl-drill-junior", "etl-drill-mid", "etl-drill-senior",
    "etl-source-list", "etl-keys-watermark", "etl-data-contract", "etl-sla",
    "etl-full-snapshot", "etl-incr", "etl-cdc",
    "etl-type-normalize", "etl-dedup", "etl-dim-join", "etl-scd", "etl-pii-mask",
    "etl-overwrite", "etl-merge-upsert", "etl-idempotent-write",
    "etl-rowcount", "etl-unique-pk", "etl-recon",
    "etl-dag", "etl-retry-alert", "etl-backfill", "etl-late-data",
    "etl-classic", "etl-modern-elt",
    "etl-tool-airflow", "etl-tool-dbt", "etl-tool-ingest",
    "etl-tool-datax", "etl-tool-airbyte", "etl-tool-flink-cdc",
    "etl-lineage", "etl-publish",
]
assert list(ETL_EXTRA.keys()) == ETL_IDS or set(ETL_EXTRA) == set(ETL_IDS), (
    set(ETL_IDS) - set(ETL_EXTRA), set(ETL_EXTRA) - set(ETL_IDS)
)
assert len(ETL_EXTRA) == 39, len(ETL_EXTRA)


def py_str(s: str) -> str:
    return repr(s)


def emit_dict(name: str, d: dict) -> str:
    lines = [f"{name} = {{"]
    for k, v in d.items():
        lines.append(f"    {py_str(k)}: {py_str(v)},")
    lines.append("}")
    return "\n".join(lines)


def main() -> None:
    hdr = (
        "# -*- coding: utf-8 -*-\n"
        '"""Auto-generated teaching extras. Do not edit by hand unless necessary."""\n'
    )
    dwh_body = hdr + '"""DWH leaf_id -> full markdown lesson (Chinese)."""\n\n' + emit_dict(
        "DWH_EXTRA", DWH_EXTRA
    ) + "\n"
    etl_body = hdr + '"""ETL leaf_id -> full markdown lesson (Chinese)."""\n\n' + emit_dict(
        "ETL_EXTRA", ETL_EXTRA
    ) + "\n"
    thin = '''# -*- coding: utf-8 -*-
"""DWH/ETL teaching extras: leaf_id -> gold markdown; apply_extras walker."""
from __future__ import annotations

from typing import Any, Dict, MutableMapping

from dwh_etl_teach_extras_dwh import DWH_EXTRA
from dwh_etl_teach_extras_etl import ETL_EXTRA

__all__ = ["DWH_EXTRA", "ETL_EXTRA", "apply_extras"]


def apply_extras(tree: MutableMapping[str, Any], extra_dict: Dict[str, str]) -> int:
    """Walk knowledge tree; replace leaf content when node id is in extra_dict.

    Returns number of nodes updated.
    """
    updated = 0

    def walk(node: MutableMapping[str, Any]) -> None:
        nonlocal updated
        nid = node.get("id")
        if isinstance(nid, str) and nid in extra_dict:
            node["content"] = extra_dict[nid]
            updated += 1
        for child in node.get("children") or []:
            if isinstance(child, dict):
                walk(child)

    walk(tree)
    return updated
'''
    (ROOT / "dwh_etl_teach_extras_dwh.py").write_text(dwh_body, encoding="utf-8")
    (ROOT / "dwh_etl_teach_extras_etl.py").write_text(etl_body, encoding="utf-8")
    (ROOT / "dwh_etl_teach_extras.py").write_text(thin, encoding="utf-8")

    short = []
    for label, d in ("DWH", DWH_EXTRA), ("ETL", ETL_EXTRA):
        for k, v in d.items():
            n = cn_len(v)
            total = len(v)
            if n < 1100 or n > 1800:
                # path stubs allowed longer; still flag very short
                if k.endswith("-path-junior") or k.endswith("-path-mid") or k.endswith("-path-senior"):
                    if n < 800:
                        short.append((k, n, total, "path-short"))
                else:
                    short.append((k, n, total, "out-of-range"))
        print(label, "leaves", len(d), "cn_min", min(cn_len(x) for x in d.values()),
              "cn_max", max(cn_len(x) for x in d.values()))
    print("out_of_range_count", len(short))
    for row in short[:40]:
        print(" ", row)


if __name__ == "__main__":
    main()
