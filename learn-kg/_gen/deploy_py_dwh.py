# -*- coding: utf-8 -*-
"""Deploy expanded Python + DWH trees into lessons/*.json and inject HTML."""
from __future__ import annotations

import json
import re
import subprocess
import sys
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GEN = Path(__file__).resolve().parent
LESSONS = GEN / "lessons"
HTML = ROOT / "数据知识图谱.html"


def exec_tree(script_name: str):
    src = (GEN / script_name).read_text(encoding="utf-8")
    # Stop before HTML mutation section
    cuts = [
        src.find("\n# Safety:"),
        src.find("\ns, e, old = extract_object"),
        src.find("\ns, e, _ = extract_object"),
        src.find("\np.write_text"),
    ]
    cuts = [c for c in cuts if c > 0]
    cut = min(cuts) if cuts else len(src)
    chunk = src[:cut]
    # Neutralize hard-coded nested HTML path reads so TREE can be built offline
    chunk = re.sub(
        r'^p = Path\(r?"[^"]+"\)\s*$',
        "p = None",
        chunk,
        count=1,
        flags=re.M,
    )
    chunk = re.sub(
        r"^text = p\.read_text\(encoding=\"utf-8\"\)\s*$",
        "text = ''",
        chunk,
        count=1,
        flags=re.M,
    )
    ns: dict = {}
    exec(compile(chunk, script_name, "exec"), ns, ns)
    if "TREE" not in ns:
        raise SystemExit(f"TREE missing in {script_name}")
    return ns["TREE"]


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="sql"):
    return f"""### 课前

- **场景**：{scene}
- **目标**：{goal}
- **先修**：{prereq}

### 样例输入

{sample}

### 是什么

{what}

### 怎么写

```{lang}
{code}
```

### 查询结果

{result}

### 用在哪

{uses}

### 易错对照

{traps}

### 动手

{drill}""".strip()


def leaf(id_, title, level, content):
    return {
        "id": id_,
        "title": title,
        "level": level,
        "content": content,
        "children": [],
    }


def chapter(id_, title, level, blurb, kids):
    return {
        "id": id_,
        "title": title,
        "level": level,
        "content": blurb if blurb.startswith("###") else f"### {title} · 章节导读\n\n{blurb}",
        "lessonParent": True,
        "children": kids,
    }


def find(node, id_):
    if node.get("id") == id_:
        return node
    for c in node.get("children") or []:
        hit = find(c, id_)
        if hit:
            return hit
    return None


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    if not (n.get("children") or []):
        if n.get("id") and n.get("id") != n.get("id"):  # noqa keep
            pass
        if n.get("children") == [] or n.get("children") is None:
            if "children" in n and not n["children"]:
                acc.append(n["id"])
    for c in n.get("children") or []:
        walk_leaves(c, acc)
    # fix: only count true leaves
    return acc


def count_leaves(n):
    ch = n.get("children") or []
    if not ch:
        return 1 if n.get("id") else 0
    return sum(count_leaves(c) for c in ch)


def enhance_dwh(tree: dict) -> dict:
    t = deepcopy(tree)

    # --- split 模型形态 vs 方法论选型 ---
    model = find(t, "dwh-model")
    styles = find(t, "dwh-schema-styles")
    if model and styles:
        method_ids = {"dwh-schema-choose", "dwh-kimball-inmon", "dwh-datavault"}
        morph_kids = [c for c in styles["children"] if c["id"] not in method_ids]
        method_kids = [c for c in styles["children"] if c["id"] in method_ids]
        styles["title"] = "模型形态"
        styles["content"] = "### 模型形态 · 章节导读\n\n**学习目标**：分清星型 / 雪花 / 星系（星座）三种物理形态。\n\n**先修**：总线矩阵。\n\n点下方绿色叶节点进入各讲义。"
        styles["children"] = morph_kids
        # insert methodology chapter after styles
        method_ch = chapter(
            "dwh-method-styles",
            "方法论与选型",
            "???",
            "### 方法论与选型 · 章节导读\n\n**学习目标**：会在星型/雪花/星系之间选型，并理解 Kimball / Inmon / Data Vault 的定位差异。\n\n**先修**：三种模型形态。",
            method_kids,
        )
        kids = model["children"]
        idx = next((i for i, c in enumerate(kids) if c["id"] == "dwh-schema-styles"), 1)
        # avoid duplicate insert
        if not find(model, "dwh-method-styles"):
            kids.insert(idx + 1, method_ch)

    # --- fact types + wide vs metric into 星型构件 ---
    star = find(t, "dwh-star")
    if star and not find(t, "dwh-fact-types"):
        star["children"].extend(
            [
                leaf(
                    "dwh-fact-types",
                    "事实表类型",
                    "??",
                    gold(
                        "支付要留每笔明细，库存只要每日快照，履约要看累计状态。",
                        "分清事务事实 / 周期快照 / 累积快照，并选对粒度。",
                        "事实表 → 下一课：宽表与指标表",
                        "orders 支付；想象库存日终、订单履约里程碑。",
                        "- **事务事实**：每笔事件一行（支付、点击）。\n- **周期快照**：固定周期末状态一行（日库存）。\n- **累积快照**：生命周期里程碑列（下单/支付/发货/签收时间）。",
                        """-- 事务：支付成功一行
SELECT order_id, user_id, DATE(created_at) dt, amount AS pay_amt
FROM orders WHERE status='paid';

-- 周期快照示意：每日用户累计支付（日终）
-- dt, user_id, pay_amt_td, order_cnt_td

-- 累积快照示意：订单进度
-- order_id, created_at, paid_at, shipped_at, signed_at""",
                        "三种事实服务不同问题；不要混在一张无说明粒度的表里。",
                        "1. 明细对账用事务  2. 库存/余额用周期快照  3. 履约漏斗用累积快照",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 用事务表硬算「日终余额」 | 重算成本高且易错 | 单独周期快照 |\n| 累积快照乱改历史里程碑 | 不可复现 | 只追加/校正并留痕 |",
                        "判断：退款事件更适合进事务事实还是改累积快照上的列？",
                    ),
                ),
                leaf(
                    "dwh-wide-vs-metric",
                    "宽表与指标表",
                    "??",
                    gold(
                        "分析师想要一张「用户日」大宽表；看板只要 GMV/UV 几个指标。",
                        "分清明细宽表（多维属性打平）与指标/汇总表（少列可加总）。",
                        "事实表类型 → 下一课：维度表",
                        "支付事实 + 用户维。",
                        "- **宽表**：一行主体+大量属性/标签，便于探索，易膨胀。\n- **指标表（汇总）**：按固定维度预聚合，服务看板与 SLA。\n- **原则**：可加总指标进汇总；高基数明细留 DWD/DWS。",
                        """-- 指标表示意：城市日 GMV
SELECT DATE(o.created_at) AS dt,
       COALESCE(u.city,'未知') AS city,
       SUM(COALESCE(o.amount,0)) AS gmv,
       COUNT(*) AS pay_cnt
FROM orders o
JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid'
GROUP BY 1,2;

-- 宽表示意：订单行打平用户城市（仍是明细粒度）
SELECT o.*, u.user_name, u.city
FROM orders o JOIN users u ON u.user_id=o.user_id;""",
                        "指标表行少、口径稳定；宽表灵活但贵。",
                        "1. ADS 看板接口  2. 特征宽表（谨慎）  3. 即席分析出口",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 把宽表当唯一真相 | 口径漂移 | 指标字典+认证汇总 |\n| 宽表无限加列 | 任务变慢 | 分层：热列 ADS，冷列明细 |",
                        "写出「用户日」宽表主键，并列出 3 个不该进宽表的字段。",
                    ),
                ),
                leaf(
                    "dwh-conformed-dim",
                    "一致性维度",
                    "??",
                    gold(
                        "交易主题与流量主题都要按「用户」拼接，但两边 user 维字段不一致。",
                        "理解一致性维（Conformed Dimension）：跨主题可共享的公共维。",
                        "总线矩阵 → 可与代理键对照",
                        "users 作为公共用户维。",
                        "- **一致性维**：同一含义、同一键、同一属性定义，被多事实复用。\n- **来源**：总线矩阵里的公共列。\n- **治理**：有 Owner；变更要公告。",
                        """-- 支付与（示意）加购都用同一 user_id / 用户维
SELECT u.user_id, u.city,
       SUM(COALESCE(o.amount,0)) AS gmv
FROM users u
LEFT JOIN orders o ON o.user_id=u.user_id AND o.status='paid'
GROUP BY u.user_id, u.city;""",
                        "跨过程对比城市 GMV 才有意义。",
                        "1. 多主题拼接  2. 企业指标对齐  3. 主数据落地",
                        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 每主题复制 user 维 | 对不齐 | 公共维一张 |\n| 同名不同义 | 吵口径 | 字典登记 |",
                        "列出本样例里至少 2 个可做一致性维的候选。",
                    ),
                ),
            ]
        )

    # --- SCD3 ---
    scd = find(t, "dwh-scd-sec")
    if scd and not find(t, "dwh-scd3"):
        scd["children"].append(
            leaf(
                "dwh-scd3",
                "SCD3 保留前值",
                "???",
                gold(
                    "只要「当前城市 + 上一次城市」，不要完整历史链。",
                    "掌握 SCD3：有限历史（通常一列 previous）。",
                    "SCD2 → 选型：字段要不要完整时光旅行",
                    "users.city 变更。",
                    "- **SCD3**：在同行保留当前值与前值（或有限 N 次）。\n- **适用**：只要对比「新旧」，不要任意时点回放。\n- **对比**：SCD1 无历史；SCD2 全历史；SCD3 折中。",
                    """-- SCD3 示意
-- user_id | city | city_prev | city_updated_at
-- 4       | 上海 | NULL      | 2024-02-01

UPDATE users_scd3
SET city_prev = city,
    city = '上海',
    city_updated_at = '2024-02-01'
WHERE user_id = 4;""",
                    "可回答「现在哪、以前哪」；不能回答任意历史日。",
                    "1. 简单新旧对比  2. 存储敏感  3. 不需审计全链",
                    "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 用 SCD3 做合规追溯 | 证据不足 | SCD2 |\n| 所有字段 SCD3 | 列爆炸 | 仅关键属性 |",
                    "会员等级只要「当前+上次」，选 SCD1/2/3 哪个？",
                ),
            )
        )

    # --- pipeline: schedule / backfill / load order ---
    pipe = find(t, "dwh-pipeline")
    if pipe and not find(t, "dwh-schedule-sec"):
        pipe["children"].insert(
            0,
            chapter(
                "dwh-schedule-sec",
                "调度与回刷",
                "???",
                "### 调度与回刷 · 章节导读\n\n**学习目标**：理解 DAG 依赖、装载顺序与回刷窗口。\n\n**先修**：分层职责、增量策略。",
                [
                    leaf(
                        "dwh-schedule",
                        "调度与依赖",
                        "???",
                        gold(
                            "DWS 依赖 DWD，DWD 依赖 ODS；ODS 晚到会导致下游空跑。",
                            "用 DAG 表达依赖；失败重试与告警要可行动。",
                            "分层 → 下一课：装载顺序",
                            "日批：ODS→DWD→DWS→ADS。",
                            "- **调度**：按时间/事件触发任务。\n- **依赖**：上游成功才跑下游（DAG）。\n- **SLA**：最晚产出时间；超时告警。",
                            """# 伪 DAG
# ods_orders_di  -> dwd_fact_pay_di -> dws_user_day -> ads_gmv_board
#                 \\-> dwd_dim_user_scd2（可并行）

# 规则：下游 set_upstream(上游成功)
# 分区 ds='{{ ds }}' 全链路透传""",
                            "依赖清晰后，空跑与脏读显著下降。",
                            "1. 日批链路  2. 小时级近实时  3. 质量门禁插在关键边",
                            "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 全点时间齐发无依赖 | 下游读到半成品 | 显式 upstream |\n| 失败只重跑最末 | 口径错 | 从断裂点下游级联 |",
                            "画出本教程四层任务的最小 DAG（4～6 个节点）。",
                            lang="text",
                        ),
                    ),
                    leaf(
                        "dwh-load-order",
                        "装载顺序",
                        "???",
                        gold(
                            "先灌事实再灌维，或维未就绪就关联，会出现未知维。",
                            "掌握「维先于事实 / 贴源先于清洗」等常见顺序。",
                            "调度与依赖 → 下一课：回刷与重跑",
                            "dim_user + fact_pay。",
                            "- **常见顺序**：ODS 贴源 → 维表（SCD）→ 事实明细 → 汇总 → ADS。\n- **未知维**：事实先到维后到时进「未知成员」稍后修补。\n- **幂等**：同分区重跑结果一致。",
                            """-- 日批示意顺序
-- 1) ODS.orders_di / ODS.users_di
-- 2) DIM.user（SCD2 闭链+插入）
-- 3) DWD.fact_pay（映射 user_sk）
-- 4) DWS / ADS 汇总""",
                            "按序装载后，事实维键可解析。",
                            "1. 日批编排  2. 维晚到兜底  3. 重跑设计",
                            "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 事实先写死业务键无代理键 | SCD2 无法时光旅行 | 映射 sk |\n| 汇总与明细并行无门禁 | 对不上 | 汇总等明细成功 |",
                            "若用户维延迟 2 小时，支付事实怎么落？写一种兜底策略。",
                            lang="text",
                        ),
                    ),
                    leaf(
                        "dwh-backfill",
                        "回刷与重跑",
                        "???",
                        gold(
                            "口径改了，要重算过去 30 天 DWS；或某天 ODS 晚到需补数。",
                            "会设计回刷窗口、幂等覆盖与影响面评估。",
                            "装载顺序 → 下一课：增量策略",
                            "按 dt 分区的汇总表。",
                            "- **回刷**：对历史分区重新计算并覆盖。\n- **补数**：上游迟到后的定向重跑。\n- **纪律**：先评估下游消费方；保留变更说明。",
                            """-- 回刷 2024-01-01..2024-01-30
-- for ds in range:
--   rerun dwd_fact_pay_di(ds)
--   rerun dws_user_day(ds)
-- 要求：目标分区 DELETE/OVERWRITE 后再写，保证幂等""",
                            "历史分区与线上口径重新对齐。",
                            "1. 口径变更  2. 故障补数  3. 活动复盘重算",
                            "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只回刷 ADS 不回刷 DWD | 治标不治本 | 从正确层开始 |\n| 无窗口无限回刷 | 成本爆炸 | 定窗口+采样验收 |",
                            "列出回刷前要通知的 3 类下游（看板/模型/导出）。",
                            lang="text",
                        ),
                    ),
                ],
            ),
        )

    # --- subject domain + mart vs wh under dwh-why ---
    why = find(t, "dwh-why")
    if why and not find(t, "dwh-domain-sec"):
        why["children"].append(
            chapter(
                "dwh-domain-sec",
                "主题域与集市",
                "??",
                "### 主题域与集市 · 章节导读\n\n**学习目标**：会按主题域划分责任，并分清仓库与集市。\n\n**先修**：仓是什么 / SSOT。",
                [
                    leaf(
                        "dwh-subject-domain",
                        "主题域划分",
                        "??",
                        gold(
                            "交易、用户、流量、财务各搞一套表，同名指标对不上。",
                            "按业务过程/数据域划分主题，明确 Owner 与公共维。",
                            "SSOT → 下一课：仓库与集市",
                            "交易样例（订单/用户）。",
                            "- **主题域**：围绕业务能力划分的数据责任边界（交易、用户……）。\n- **产出**：域内明细/汇总 + 供给公共维。\n- **协作**：跨域指标走总线与字典。",
                            """-- 域责任示意
-- 用户域：DIM 用户、注册事实
-- 交易域：支付/退款事实、订单明细
-- 公共：日期维、日历、汇率

-- 跨域取数：用一致性维键拼接，而不是复制用户属性进每张事实""",
                            "边界清晰后，重复建设与口径冲突下降。",
                            "1. 数仓规划  2. 团队分工  3. 指标治理入口",
                            "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 按系统源划分域 | 业务说不清 | 按业务过程 |\n| 域墙过死 | 取数极难 | 公共维+发布接口 |",
                            "给本样例切两个主题域，并各列 1 张核心事实。",
                            lang="text",
                        ),
                    ),
                    leaf(
                        "dwh-mart-vs-wh",
                        "仓库与集市",
                        "??",
                        gold(
                            "业务要快速出「营销集市」，平台要建企业仓。",
                            "分清 EDW 与 Data Mart：范围、粒度、治理强度不同。",
                            "主题域划分 → 分层",
                            "企业支付主题 vs 单部门看板。",
                            "- **仓库（EDW）**：企业级、可复用、强治理。\n- **集市（Mart）**：部门/主题级、交付快，可基于仓或独立。\n- **建议**：集市消费仓的一致性维与认证明细，避免烟囱。",
                            """-- 集市表可以是 ADS 薄层
-- ads_mkt_user_day(dt, user_id, gmv, coupon_cnt)
-- 其来源应能追溯到 DWD/DWS，而不是直连生产库""",
                            "集市快，但不该绕过 SSOT。",
                            "1. 部门敏捷交付  2. 平台化沉淀  3. 烟囱系统治理",
                            "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 集市直连生产 | 把库打挂/口径乱 | 经 ODS/DWD |\n| 只有集市无仓 | 重复建设 | 逐步沉淀公共层 |",
                            "举一个「该做集市」和一个「该沉淀进仓」的需求。",
                            lang="text",
                        ),
                    ),
                ],
            )
        )

    # sector tags on L1
    sector_map = {
        "dwh-learning-path": "practice",
        "dwh-why": "foundation",
        "dwh-layer": "foundation",
        "dwh-model": "advanced",
        "dwh-pipeline": "practice",
    }
    for c in t.get("children") or []:
        if c["id"] in sector_map:
            c["sector"] = sector_map[c["id"]]

    # refresh root blurb
    t["content"] = """### 数据仓库知识图谱

四层结构：**领域 → 主题 → 知识点**（对齐 SQL）。

1. **学习路径**：宪法与清单  
2. **数仓是什么**：SSOT、主题域与集市  
3. **数仓分层**：ODS→DWD→DWS→ADS  
4. **维度建模**：粒度/形态/方法论/事实维/SCD  
5. **加工与调度**：依赖、装载顺序、回刷、增量、对账  

建议：先宪法与分层，再建模，最后调度与质量。"""
    return t


def enhance_python(tree: dict) -> dict:
    t = deepcopy(tree)
    sector_map = {
        "py-learning-path": "practice",
        "py-pandas": "foundation",
        "py-viz": "advanced",
        "py-stack": "advanced",
        "py-engine": "practice",
        "py-ml-lite": "practice",
        "py-app": "practice",
    }
    # soft-assign if ids exist
    for c in t.get("children") or []:
        if c["id"] in sector_map:
            c["sector"] = sector_map[c["id"]]
        elif c["id"] == "py-pandas":
            c["sector"] = "foundation"
        elif c["id"] == "py-viz":
            c["sector"] = "advanced"
        elif c["id"] == "py-learning-path":
            c["sector"] = "practice"
    t["content"] = """### Python 数据教程

四层结构：**领域 → 主题 → 知识点**（对齐 SQL）。

1. 先打开 **学习路径 → 教程宪法**，构造同源 DataFrame  
2. 表操作（筛选/清洗/聚合/合并/变形）→ 可视化  
3. 进阶：时间、向量化、DuckDB/Polars、sklearn 基线与交付  

与 SQL 对照同一指标，口径应一致。"""
    return t


def collect_ids(n, sector=None, out=None):
    if out is None:
        out = {}
    sec = n.get("sector") or sector
    if n.get("id") and sec and not str(n["id"]).endswith("-root"):
        out[n["id"]] = sec
    for c in n.get("children") or []:
        collect_ids(c, sec, out)
    return out


def patch_sectors(html: str, py_ids: dict, dwh_ids: dict) -> str:
    m = re.search(r"(const KG_SECTOR_BY_ID = \{)(.*?)(\n    \};)", html, re.S)
    if not m:
        print("WARN: KG_SECTOR_BY_ID not found")
        return html
    body = m.group(2)
    # drop old py-/dwh- entries
    body = re.sub(r'\n\s*"(?:py|dwh)-[^"]+": "[^"]+",?', "", body)
    body = re.sub(r",\s*,", ",", body).rstrip().rstrip(",")
    merged = {}
    merged.update(dwh_ids)
    merged.update(py_ids)
    items = [f'"{k}": "{v}"' for k, v in merged.items()]
    lines = []
    for i in range(0, len(items), 4):
        lines.append("      " + ", ".join(items[i : i + 4]) + ",")
    block = "\n".join(lines).rstrip(",")
    new_body = body + ",\n" + block
    return html[: m.start()] + m.group(1) + new_body + m.group(3) + html[m.end() :]


def patch_prefer(html: str) -> str:
    if 'hub === "dwh" ? "dwh-constitution"' in html and 'hub === "python" ? "py-constitution"' in html:
        return html
    html2, n = re.subn(
        r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?: null;",
        """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "ml" ? "ml-supervised"
              : hub === "dwh" ? "dwh-constitution" : null;""",
        html,
        count=1,
    )
    print("prefer patched", n)
    return html2


def stats(tree):
    L1 = tree.get("children") or []
    L2 = sum(len(c.get("children") or []) for c in L1)
    return {
        "L1": len(L1),
        "L2": L2,
        "leaves": count_leaves(tree) - 1,  # subtract root? root has children so count_leaves is sum of leaves only
    }


def count_leaves_fixed(n):
    ch = n.get("children") or []
    if not ch:
        return 1
    return sum(count_leaves_fixed(c) for c in ch)


def main():
    LESSONS.mkdir(parents=True, exist_ok=True)
    py = enhance_python(exec_tree("patch_python_expand.py"))
    dwh = enhance_dwh(exec_tree("patch_dwh_expand.py"))

    (LESSONS / "python.json").write_text(json.dumps(py, ensure_ascii=False, indent=2), encoding="utf-8")
    (LESSONS / "dwh.json").write_text(json.dumps(dwh, ensure_ascii=False, indent=2), encoding="utf-8")

    def summarize(name, t):
        L1 = [(c["id"], c["title"], c.get("sector")) for c in t["children"]]
        leaves = count_leaves_fixed(t)
        # root is not leaf
        print(f"{name}: L1={len(L1)} leaves={leaves}")
        for i, title, sec in L1:
            print(f"  - {title} [{i}] sec={sec}")

    summarize("python", py)
    summarize("dwh", dwh)

    # ensure other lesson jsons exist for inject
    for k in ["sql", "ml", "etl", "bi"]:
        p = LESSONS / f"{k}.json"
        if not p.exists():
            raise SystemExit(f"missing {p}")

    r = subprocess.run([sys.executable, str(GEN / "inject_lessons.py")], cwd=str(ROOT))
    if r.returncode != 0:
        raise SystemExit("inject failed")

    html = HTML.read_text(encoding="utf-8")
    html = patch_prefer(html)
    html = patch_sectors(html, collect_ids(py), collect_ids(dwh))
    HTML.write_text(html, encoding="utf-8")
    print("DONE", HTML, "size", HTML.stat().st_size)

    # validate presence
    for eid in ["py-constitution", "py-merge", "py-dataframe", "dwh-fact-types", "dwh-schedule", "dwh-method-styles", "dwh-scd3"]:
        assert eid in html, eid
    print("validated key ids in HTML")


if __name__ == "__main__":
    main()
