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
    use_lines = "\n".join(f"- {u}" for u in uses)
    trap_rows = "\n".join(f"| {a} | {b} | {c} |" for a, b, c in traps)
    body = f"""### 课前
- **场景**：{scene}
- **目标**：{goal}
- **先修**：{prereq}
- **学完标准**：能复述定义、写出实现、指出两个翻车点

### 样例输入
{sample}

### 是什么
{what}

### 怎么写
**建议步骤**
{step_lines}
```{lang}
{code.strip()}
```

### 查询结果
{result}

### 用在哪
{use_lines}

**上下游**：{updown}

### 易错对照
| 错法 | 现象 | 纠正 |
|---|---|---|
{trap_rows}

### 动手
{drill}""".strip()
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

### {title}清单（按序勾选）
{bullets}

### 是什么
- **定位**：本页是学习路线清单，不是单点技术课。
- **用法**：按勾选顺序打开对应叶课；每课走完「怎么写 → 查询结果 → 易错对照 → 动手」。
- **验收种子**：users=4，orders=8，order_events=7，order_items=5；Ada GMV=350。

### 怎么写
**建议步骤**
1. 打开教程宪法，确认四表与支付口径
2. 按清单自上而下上课，不要跳层
3. 每课用样例核对数（尤其 Ada=350、106 空值）
4. 清单全部勾完后再进练习场

```text
宪法 → 清单课序 → 叶课金模板 → 练习场闭合
```

### 查询结果
清单全部勾选且练习场对账通过，即视为本级别路径完成。

### 用在哪
- 新人 onboarding 与自学节奏控制
- 周会复盘「本周学到哪一叶」
- 与面试/上岗检查表对齐

**上下游**：上游是宪法与样例；下游是各叶课与练习场。

### 易错对照
| 错法 | 现象 | 纠正 |
|---|---|---|
| 跳过分层直接建模 | 粒度与口径混乱 | 先 ODS→ADS |
| 只看概念不跑 SQL | 数字对不上 | 每课核对样例结果 |
| 清单当百科跳读 | 知识碎片化 | 严格按序 |
| 练习场不做对账 | 假完成 | 金额/行数闭合 |

### 动手
{note}
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

# write continues in part 2 for ETL - see below
print("DWH keys", len(DWH_EXTRA))
