# -*- coding: utf-8 -*-
"""Fix prefer wiring + restore DWH leaves dropped by thinner expand TREE."""
from __future__ import annotations

import json
import re
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")


def extract_object(src: str, marker: str):
    i = src.find(marker)
    if i < 0:
        raise SystemExit("missing " + marker)
    start = src.find("{", i)
    depth = 0
    in_str = False
    esc = False
    for k in range(start, len(src)):
        ch = src[k]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return start, k + 1, json.loads(src[start : k + 1])
    raise SystemExit("unclosed")


def find(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find(c, eid)
        if hit:
            return hit
    return None


def leaf(eid, title, level, content):
    return {"id": eid, "title": title, "level": level, "content": content.strip(), "children": []}


def gold(title_hint, body_core):
    return f"""
### 课前

- **场景**：{body_core['scene']}
- **目标**：{body_core['goal']}
- **先修**：{body_core['prereq']}
- **学完标准**：能复述定义、独立写出等价实现、指出至少两个翻车点。

### 样例输入

{body_core['sample']}

> 同源四表：`users` / `orders` / `order_items` / `order_events`。

### 是什么

{body_core['what']}

**教义锚点**：仓内每一层都要能回答「一行代表什么、口径谁负责、重跑是否安全」。

### 怎么写

**建议步骤**

1. 先写清粒度与分区（dt）
2. 按下述 SQL/DDL 改到你的主题域
3. 用「查询结果」与源或上一层做闭合
4. 对照易错表，确认没有把口径写进错误的层

```sql
{body_core['code']}
```

### 查询结果

{body_core['result']}

### 用在哪

{body_core['uses']}

**上下游**：与 ETL 调度/对账课、BI 指标课对照学习。

### 易错对照

{body_core['traps']}

### 教义深讲

围绕「{title_hint}」记住：可复现、可重跑、可追溯。支付口径统一 `status='paid'` + `COALESCE(amount,0)`。

### 动手

{body_core['drill']}
""".strip()


text = HTML.read_text(encoding="utf-8")

# --- prefer ---
prefer = """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "dwh" ? "dwh-constitution"
              : hub === "etl" ? "etl-constitution"
              : hub === "bi" ? "bi-constitution" : null;"""
text, n = re.subn(
    r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?null;",
    prefer,
    text,
    count=1,
)
print("prefer patched", n)

s, e, dwh = extract_object(text, "const DWH_KNOWLEDGE_TREE = ")

# Restore domain section under dwh-why
why = find(dwh, "dwh-why")
if why and not find(dwh, "dwh-subject-domain"):
    why.setdefault("children", []).append(
        {
            "id": "dwh-domain-sec",
            "title": "主题域与集市",
            "level": "?",
            "content": "### 主题域与集市 · 章节导读\n\n> **教义提示**：域是治理边界，集市是消费边界，不要混成一张大宽表。\n",
            "lessonParent": True,
            "children": [
                leaf(
                    "dwh-subject-domain",
                    "主题域",
                    "?",
                    gold(
                        "主题域",
                        {
                            "scene": "交易、用户、营销各写各的表，口径无法复用。",
                            "goal": "按业务主题划分可治理边界，明确 Owner 与共用维度。",
                            "prereq": "仓是什么 / SSOT",
                            "sample": "交易域：orders/items/events；用户域：users。",
                            "what": "- **主题域**：按业务能力切分的数据责任边界（如交易、用户、存货）。\n- **不是**：物理库名的同义词；也不是「一张超级宽表」。\n- **价值**：总线矩阵、一致性维度、跨域指标才有谈判桌。",
                            "code": "-- 域清单（文档）\n-- domain | owner | core_tables\n-- trade  | de-a  | orders, order_items, order_events\n-- user   | de-b  | users\nSELECT 'trade' AS domain, COUNT(*) AS orders_n FROM orders;",
                            "result": "域有 Owner；跨域取数走一致性维度，而不是复制私有用户维。",
                            "uses": "1. 立项拆域  2. 总线建模  3. 与组织职责对齐",
                            "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 按团队随便拆表 | 同名不同义 | 按业务能力定域 |\n| 域内私有用户维 | 城市对不上 | 一致性维度 |\n| 域=全部历史明细无治理 | 沼泽 | 分层+粒度 |",
                            "drill": "给本样例画交易域/用户域两框，并标出共用维度。",
                        },
                    ),
                ),
                leaf(
                    "dwh-mart-vs-wh",
                    "集市 vs 仓库",
                    "?",
                    gold(
                        "集市 vs 仓库",
                        {
                            "scene": "业务要「营销专用宽表」，数据团队担心变成烟囱。",
                            "goal": "分清企业仓（可复用）与集市（部门消费）的边界。",
                            "prereq": "主题域",
                            "sample": "ADS 营销看板 vs DWD 支付明细。",
                            "what": "- **仓库**：面向主题、可共享的集成层（DWD/DWS 主力）。\n- **集市**：面向部门/应用的消费集（常落 ADS）。\n- **纪律**：集市可以快，但不能成为第二套 SSOT。",
                            "code": "-- 仓：可复用支付事实\nSELECT order_id, user_id, COALESCE(amount,0) pay_amt\nFROM orders WHERE status='paid';\n-- 集市：营销只要高价值用户清单（ADS）\nSELECT user_id, SUM(COALESCE(amount,0)) gmv\nFROM orders WHERE status='paid'\nGROUP BY user_id HAVING SUM(COALESCE(amount,0))>=200;",
                            "result": "仓侧明细可复用；集市只是过滤/展示，不改支付定义。",
                            "uses": "1. 需求评审  2. 防止烟囱指标  3. 与 BI 工作区治理",
                            "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 集市重定义 GMV | 数对不上 | 读 DWS |\n| 拒绝一切集市 | 交付慢 | ADS 允许、口径下沉 |\n| 集市直连 ODS | 脏口径 | 经 DWD |",
                            "drill": "判断「运营日报」应是仓还是集市，一句话理由。",
                        },
                    ),
                ),
            ],
        }
    )
    print("added domain sec")

# Restore star extras under dwh-star
star = find(dwh, "dwh-star")
if star and not find(dwh, "dwh-fact-types"):
    extras = [
        leaf(
            "dwh-fact-types",
            "事实类型",
            "??",
            gold(
                "事实类型",
                {
                    "scene": "支付、下单、快照库存混在一张「事实」里。",
                    "goal": "区分事务事实、周期快照、累积快照。",
                    "prereq": "事实表 / 粒度",
                    "sample": "orders 支付可作事务事实；若跟踪订单状态流转可作累积快照。",
                    "what": "- **事务事实**：业务事件发生即记一行（支付成功）。\n- **周期快照**：固定时间点切片（每日库存）。\n- **累积快照**：生命周期里程碑列（下单/支付/发货时间）。",
                    "code": "-- 事务事实（支付）\nSELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at AS pay_at\nFROM orders WHERE status='paid';\n-- 累积快照示意：订单里程碑\n-- order_id, created_at, paid_at, cancelled_at",
                    "result": "支付事实一行一事件；不要把库存日快照塞进同一粒度。",
                    "uses": "1. 建模评审  2. 选择分区键  3. 与过程分析",
                    "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 混粒度一张表 | 汇总错 | 拆事实 |\n| 用事务表硬模拟快照 | 补数难 | 独立快照作业 |\n| 累积快照无闭链规则 | 状态乱 | 明确更新列 |",
                    "drill": "order_events 更像哪类事实？为什么。",
                },
            ),
        ),
        leaf(
            "dwh-wide-vs-metric",
            "宽表 vs 指标下沉",
            "??",
            gold(
                "宽表 vs 指标下沉",
                {
                    "scene": "有人要「一张覆盖所有字段的宽表」，有人要指标平台。",
                    "goal": "会在宽出与指标下沉之间做取舍。",
                    "prereq": "DWS / ADS / SSOT",
                    "sample": "用户日 GMV 既可宽表字段，也可指标服务。",
                    "what": "- **宽表**：少 JOIN、取数快，易膨胀与口径漂移。\n- **指标下沉**：原子/派生指标沉在 DWS/语义层，消费方组合。\n- **实践**：明细保粒度；高频指标物化；避免「万能宽表」。",
                    "code": "-- 下沉：可复用汇总\nCREATE VIEW dws_user_pay_gmv AS\nSELECT user_id, SUM(COALESCE(amount,0)) gmv, COUNT(*) pay_cnt\nFROM orders WHERE status='paid' GROUP BY user_id;\n-- 宽出：仅 ADS 组装展示字段，不改 gmv 定义",
                    "result": "Ada gmv=350 来自同一视图，不论几个看板。",
                    "uses": "1. 性能与治理平衡  2. BI 语义层  3. 防止烟囱",
                    "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 万能宽表私有口径 | 对不齐 | 指标下沉 |\n| 只有指标没有明细 | 无法下钻 | 保留 DWD |\n| 宽表当 ODS | 难重跑 | 分层 |",
                    "drill": "列出 2 个该下沉的指标、1 个可留在 ADS 的展示字段。",
                },
            ),
        ),
        leaf(
            "dwh-conformed-dim",
            "一致性维度",
            "??",
            gold(
                "一致性维度",
                {
                    "scene": "交易域与营销域各自有一份 users，城市对不上。",
                    "goal": "理解一致性维度：跨主题可对齐的公共维。",
                    "prereq": "维度 / 总线矩阵",
                    "sample": "users 作为公共用户维。",
                    "what": "- **一致性维度**：多事实/多集市共用、属性同名同义。\n- **手段**：公共 DIM、代理键、变更走 SCD 规范。\n- **总线**：事实挂到同一组一致性维上才能跨域分析。",
                    "code": "-- 两事实都挂同一用户维\nSELECT o.order_id, u.city, COALESCE(o.amount,0) pay_amt\nFROM orders o\nJOIN users u ON u.user_id=o.user_id\nWHERE o.status='paid';",
                    "result": "城市来自同一维，跨报表可比。",
                    "uses": "1. 跨域分析  2. 总线实施  3. 治理争议仲裁",
                    "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 每集市复制维 | 同名不同义 | 公共 DIM |\n| 自然键当唯一真相 | 源合并冲突 | 代理键 |\n| 维属性随意改名 | 报表裂 | 词典治理 |",
                    "drill": "date_dim / user_dim 哪个必须一致性？举例。",
                },
            ),
        ),
    ]
    star["children"].extend(extras)
    print("added star extras")

# SCD3
scd = find(dwh, "dwh-scd-sec")
if scd and not find(dwh, "dwh-scd3"):
    scd["children"].append(
        leaf(
            "dwh-scd3",
            "SCD3 保留前值",
            "??",
            gold(
                "SCD3",
                {
                    "scene": "只要「当前城市 + 上一城市」，不要完整历史。",
                    "goal": "会用 SCD3：有限历史列，而不是无限拉链。",
                    "prereq": "SCD1 / SCD2",
                    "sample": "users.city 与 previous_city。",
                    "what": "- **SCD3**：在行上保留当前值与有限个历史列。\n- **适合**：只要「前值」对比，不要任意时点时光旅行。\n- **对比**：完整审计仍选 SCD2。",
                    "code": "-- SCD3 示意\n-- city='上海', previous_city=NULL → 变更后\n-- city='北京', previous_city='上海'\nSELECT user_id, city AS current_city, previous_city\nFROM users;",
                    "result": "能回答「现在 vs 上一版」，不能回答任意历史日。",
                    "uses": "1. 简单对比报表  2. 存储敏感场景  3. 与 SCD2 搭配",
                    "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 用 SCD3 冒充审计 | 缺历史 | SCD2 |\n| 历史列无限加 | 表很宽 | 改 SCD2 |\n| 与事实点时间混用 | 对不齐 | 选对类型 |",
                    "drill": "手机号纠错、城市变更、会员等级，分别倾向 SCD1/2/3？",
                },
            ),
        )
    )
    print("added scd3")

# schedule / load-order / backfill under pipeline
pipe = find(dwh, "dwh-pipeline")
if pipe and not find(dwh, "dwh-schedule"):
    pipe["children"].insert(
        0,
        {
            "id": "dwh-schedule-sec",
            "title": "调度与回刷",
            "level": "??",
            "content": "### 调度与回刷 · 章节导读\n\n> **教义提示**：仓表依赖有顺序；回刷要按分区幂等。\n",
            "lessonParent": True,
            "children": [
                leaf(
                    "dwh-schedule",
                    "调度依赖",
                    "??",
                    gold(
                        "调度依赖",
                        {
                            "scene": "ADS 跑完了 DWD 还没好，看板先空后跳。",
                            "goal": "按层与表依赖编排：维先于事实，明细先于汇总。",
                            "prereq": "分层 / ETL DAG",
                            "sample": "dim_user → dwd_pay → dws_gmv → ads。",
                            "what": "- **依赖**：下游任务等待上游就绪（分区/标志位）。\n- **仓内顺序**：DIM/ODS → DWD → DWS → ADS。\n- **与 ETL**：编排工具（Airflow）管顺序，仓模型管语义。",
                            "code": "-- 伪依赖\n-- 1) dim_user_dt\n-- 2) dwd_trade_pay_di\n-- 3) dws_user_pay_gmv\n-- 4) ads_ops_daily\nSELECT 'dim' AS step1, 'dwd' AS step2, 'dws' AS step3;",
                            "result": "ADS 读到的是完整日分区，而不是半成品。",
                            "uses": "1. 日批设计  2. SLA  3. 故障定界",
                            "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 定时钟点盲跑 | 空窗 | 传感器/依赖 |\n| 汇总先于明细 | 错数 | 分层依赖 |\n| 维表后到 | 未知成员泛滥 | 维先跑/晚到补 |",
                            "drill": "画出本样例四层任务依赖箭头。",
                        },
                    ),
                ),
                leaf(
                    "dwh-load-order",
                    "装载顺序",
                    "??",
                    gold(
                        "装载顺序",
                        {
                            "scene": "事实先入，维表后到，出现大量 unknown 城市。",
                            "goal": "掌握「维→事实→汇总」装载顺序与晚到维补救。",
                            "prereq": "调度依赖",
                            "sample": "users 与 orders 同日批。",
                            "what": "- **原则**：先保证维度成员存在，再挂事实代理键。\n- **晚到维**：先占位 unknown，次日回补或重述近 N 天。\n- **汇总**：必须在明细稳定后。",
                            "code": "-- 1) 装维\n-- INSERT dim_user ... FROM users\n-- 2) 装事实（找代理键）\nSELECT o.order_id, u.user_id, COALESCE(o.amount,0) pay_amt\nFROM orders o\nLEFT JOIN users u ON u.user_id=o.user_id\nWHERE o.status='paid';",
                            "result": "事实行能关联到维；未知成员可计量。",
                            "uses": "1. 日批  2. 回填  3. 质量门禁",
                            "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 事实先写死自然键不管维 | 报表破洞 | 维优先/占位 |\n| 汇总读未完成分区 | 跳动 | 就绪标志 |\n| 忽略迟到维 | 长期 unknown | lookback 重述 |",
                            "drill": "维晚到 2 小时，给出两种补救策略。",
                        },
                    ),
                ),
                leaf(
                    "dwh-backfill",
                    "回刷历史",
                    "???",
                    gold(
                        "回刷历史",
                        {
                            "scene": "支付口径改了，要重刷 30 天 DWS。",
                            "goal": "按 dt 回刷；控制并发；与增量互斥策略清晰。",
                            "prereq": "分区 / 增量 / ETL 回填",
                            "sample": "历史 dt 列表重跑 dwd/dws。",
                            "what": "- **回刷**：对历史分区按新逻辑重算。\n- **幂等**：分区覆盖或可重跑 MERGE。\n- **风险**：打满集群、与增量冲突、下游未通知。",
                            "code": "-- 对每个 ds:\n-- INSERT OVERWRITE dwd_trade_pay_di PARTITION (dt=ds)\n-- SELECT ... WHERE 业务日=ds;\n-- 然后再刷 dws 对应 dt\nSELECT 'backfill' AS mode, 'overwrite_by_dt' AS strategy;",
                            "result": "历史 dt 新口径一致；增量水位不被打乱。",
                            "uses": "1. 口径变更  2. 修数  3. 补数",
                            "traps": "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 巨型并发回刷 | 打崩 | 限流按日 |\n| 不通知 BI | 对照期混乱 | 变更公告 |\n| 回刷改错分区 | 丢历史 | 参数审查 |",
                            "drill": "回刷时增量任务暂停还是跳过冲突 dt？给方案。",
                        },
                    ),
                ),
            ],
        },
    )
    print("added schedule sec")

text = text[:s] + json.dumps(dwh, ensure_ascii=False, indent=2) + text[e:]

# validate neighbors
for m in [
    "const SQL_KNOWLEDGE_TREE = ",
    "const ETL_KNOWLEDGE_TREE = ",
    "const DWH_KNOWLEDGE_TREE = ",
    "const BI_KNOWLEDGE_TREE = ",
]:
    extract_object(text, m)

_, _, dwh2 = extract_object(text, "const DWH_KNOWLEDGE_TREE = ")
_, _, etl2 = extract_object(text, "const ETL_KNOWLEDGE_TREE = ")


def leaves(n, acc=None):
    acc = [] if acc is None else acc
    if not (n.get("children") or []):
        acc.append(n["id"])
    for c in n.get("children") or []:
        leaves(c, acc)
    return acc


need = [
    "dwh-subject-domain",
    "dwh-mart-vs-wh",
    "dwh-fact-types",
    "dwh-scd3",
    "dwh-schedule",
    "dwh-backfill",
    "etl-constitution",
    "etl-tool-datax",
]
ids = set(leaves(dwh2)) | set(leaves(etl2))
for eid in need:
    assert eid in ids, eid

assert "etl-constitution" in text[text.find("const prefer") : text.find("const prefer") + 400]

HTML.write_text(text, encoding="utf-8")
print("DWH leaves", len(leaves(dwh2)), "ETL leaves", len(leaves(etl2)))
print("size", HTML.stat().st_size)
