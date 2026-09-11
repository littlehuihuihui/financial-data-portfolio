# -*- coding: utf-8 -*-
"""Expand BI (full gold rebuild) + deepen ETL (extra tools/lineage/drills)."""
from __future__ import annotations

import json
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")


def lesson(s: str) -> str:
    return s.strip()


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="sql"):
    return lesson(f"""
### 课前

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

{drill}
""")


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


def find_node(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find_node(c, eid)
        if hit:
            return hit
    return None


def walk_leaves(n, acc=None):
    acc = acc if acc is not None else []
    if not (n.get("children") or []):
        acc.append(n["id"])
    for c in n.get("children") or []:
        walk_leaves(c, acc)
    return acc


BI_CONST = lesson("""
### 课前 · 这是什么

本页是 **BI 教程公约**：指标口径、语义层与看板设计共用与 SQL/数仓同源的交易样例（`users` / `orders` …）。先读本页，再按清单上课。

### 统一指标沙盒

| 指标 | 口径（权威） |
|---|---|
| 支付 GMV | `status='paid'` 的 `SUM(COALESCE(amount,0))` |
| 支付笔数 | paid 订单 `COUNT(*)` |
| 支付用户数 | paid 的 `COUNT(DISTINCT user_id)` |

Ada GMV=350，Bob=90，Cara=0（空金额当 0）。

### 金标准课模板

课前 → 样例 → 是什么 → 怎么写 → 结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
宪法 → 原子/派生/修饰词 → 词典与同名冲突
→ 语义模型 → 看板布局/图表 → 预聚合与缓存
→ 受控自助 → 订阅/嵌入/RLS → 工具（含帆软/Datart/永洪）→ 练习场
```
""")

BI_TREE = {
    "id": "bi-root",
    "title": "BI",
    "level": "?",
    "content": "### BI 知识图谱\n\n1. 先打开 **学习路径 → 教程宪法**\n2. 指标治理 → 语义层 → 看板 → 性能 → 交付与工具\n3. 口径与数仓 DWS/ADS、SQL 聚合课对齐",
    "children": [
        {
            "id": "bi-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初/中/高清单 → 练习场**。",
            "children": [
                {
                    "id": "bi-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": BI_CONST,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "bi-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线清单",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：会写清原子/派生指标；能做一页「北向+对比」看板。
- **顺序**：宪法 → 原子/派生/修饰 → 词典 → 北向布局 → 图表选择 → 初级练习
"""),
                            "children": [],
                        },
                        {
                            "id": "bi-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：语义模型、下钻切片、预聚合/缓存、受控自助。
- **顺序**：语义层 → 度量计算 → 下钻 → 预聚合 → 认证数据集 → 中级练习
"""),
                            "children": [],
                        },
                        {
                            "id": "bi-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：RLS/嵌入、订阅告警、查询护栏、多工具选型（含国产 BI）。
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "bi-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "给运营出「支付 GMV」口径说明 + 一页看板骨架。",
                                "写出原子/派生定义，并列出北向与对比图。",
                                "初级清单",
                                "统一支付口径。",
                                "- **练习场（初级）**：口径 + 版式。",
                                """-- 原子：支付 GMV
SELECT SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid';

-- 派生：客单价 = GMV / 支付笔数
SELECT SUM(COALESCE(amount,0)) / COUNT(*) AS aov
FROM orders WHERE status='paid';

-- 看板骨架：北向 KPI = GMV；对比 = 用户 GMV 柱状""",
                                "GMV 合计与用户分解可对上（350+90+0）。",
                                "1. 需求评审  2. 对照数仓 ADS",
                                "| 错法 | 纠正 |\n|---|---|\n| 看板各写各的 WHERE | 沉到词典/语义层 |\n| 一屏堆 20 图 | 北向优先 |",
                                "加修饰词：近 7 日支付 GMV 如何写时间窗。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-drill-mid",
                            "title": "中级练习",
                            "level": "??",
                            "content": gold(
                                "同名「GMV」营销与财务不一致；要语义层 + 认证数据集。",
                                "设计词典字段、同名冲突处理、下钻路径。",
                                "中级清单",
                                "支付 GMV vs 含未支付的「下单 GMV」冲突。",
                                "- **练习场（中级）**：治理 + 探索路径。",
                                """-- 词典两条
-- gmv_pay: status='paid' SUM amount
-- gmv_order: 全部 status SUM amount（禁止再叫 GMV）

-- 下钻：总 GMV → 城市 → 用户
SELECT COALESCE(u.city,'未知') city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid' GROUP BY 1;""",
                                "命名区分后冲突可解释；城市下钻可定位。",
                                "1. 指标评审  2. 自助治理",
                                "| 错法 | 纠正 |\n|---|---|\n| 强制一个词覆盖两口径 | 拆名 |\n| 无认证集 | 人人连明细 |",
                                "写出该下钻在语义模型里需要的维度。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "bi-metric",
            "title": "指标体系",
            "level": "?",
            "content": "### 指标体系\n\n原子、派生、修饰词与目标映射。",
            "children": [
                {
                    "id": "bi-define",
                    "title": "口径要素",
                    "level": "?",
                    "content": "### 口径要素 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-atomic",
                            "title": "原子指标",
                            "level": "?",
                            "content": gold(
                                "先定义「支付 GMV」再谈同比。",
                                "原子指标=不可再拆的业务统计。",
                                "宪法 → 下一课：派生指标",
                                "orders paid。",
                                "- **原子指标**：明确业务过程 + 度量 + 聚合。\n- **例子**：支付金额求和、支付笔数计数。",
                                """SELECT SUM(COALESCE(amount,0)) AS gmv_pay,
       COUNT(*) AS pay_cnt
FROM orders WHERE status='paid';""",
                                "样例 gmv_pay=440（含 106→0）或按非空策略说明。",
                                "1. 指标词典底座  2. 语义层 measure",
                                "| 错法 | 纠正 |\n|---|---|\n| 原子里塞同比 | 同比是派生/修饰 |\n| 过程含糊 | 写清 paid |",
                                "再写一个原子：支付用户数。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-derived",
                            "title": "派生指标",
                            "level": "?",
                            "content": gold(
                                "要客单价、支付转化率。",
                                "派生=原子经四则/比率得到。",
                                "原子 → 下一课：修饰词",
                                "GMV 与笔数。",
                                "- **派生指标**：基于原子计算。\n- **注意**：比率不要二次错误平均。",
                                """SELECT SUM(COALESCE(amount,0)) / NULLIF(COUNT(*),0) AS aov
FROM orders WHERE status='paid';""",
                                "AOV=总 GMV/总笔数（不能先人均再平均）。",
                                "1. 看板 KPI  2. 目标拆解",
                                "| 错法 | 纠正 |\n|---|---|\n| 对比率再 AVG | 先汇总再除 |\n| 分母为 0 | NULLIF |",
                                "定义「付费率」需要哪些原子。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-modifier",
                            "title": "时间与修饰词",
                            "level": "??",
                            "content": gold(
                                "「近 7 日 GMV」与「昨日 GMV」是同一原子不同修饰。",
                                "用修饰词表达时间/对象范围，不复制指标名。",
                                "派生 → 下一课：目标映射",
                                "created_at 窗口。",
                                "- **修饰词**：时间、地区、平台等约束。\n- **组合**：原子 + 修饰 = 可消费指标。",
                                """SELECT SUM(COALESCE(amount,0)) AS gmv_7d
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-01'
  AND created_at <  '2024-01-08';""",
                                "窗口内支付 GMV。",
                                "1. 多时间看板  2. 词典复用",
                                "| 错法 | 纠正 |\n|---|---|\n| 每个窗口一个新原子名爆炸 | 修饰词体系 |\n| 闭开区间不一致 | 统一半开 |",
                                "写出「上海用户支付 GMV」的修饰组合。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-goal-map",
                            "title": "目标到指标",
                            "level": "??",
                            "content": gold(
                                "老板要「提升盈利」，看板却只堆无关图表。",
                                "从北向目标拆到可行动指标。",
                                "修饰词 → 下一课：指标词典",
                                "目标：提升支付 GMV。",
                                "- **映射**：目标 → 驱动指标 → 分析维度。\n- **北向**：一页一个主问题。",
                                """-- 北向：GMV
-- 驱动：支付用户数 × AOV
SELECT COUNT(DISTINCT user_id) AS pay_uv,
       SUM(COALESCE(amount,0))/COUNT(*) AS aov
FROM orders WHERE status='paid';""",
                                "可讨论是拉新支付用户还是提客单。",
                                "1. 经营例会  2. 看板立项",
                                "| 错法 | 纠正 |\n|---|---|\n| 指标与目标脱节 | 先写目标句 |\n| 太多北向 | 一页一个 |",
                                "为「降低取消率」写 1 北向 + 2 驱动指标。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-governance",
            "title": "指标治理",
            "level": "??",
            "content": "### 指标治理\n\n词典与同名冲突。",
            "children": [
                {
                    "id": "bi-dict",
                    "title": "指标词典",
                    "level": "??",
                    "content": "### 指标词典 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-metric-dict",
                            "title": "词典字段",
                            "level": "??",
                            "content": gold(
                                "新人不知道 GMV 含不含取消单。",
                                "词典至少含：业务含义、口径 SQL、负责人、刷新 SLA。",
                                "目标映射 → 下一课：同名冲突",
                                "gmv_pay。",
                                "- **词典**：指标的元数据与权威定义。\n- **字段**：名称、口径、维度、Owner、SLA、版本。",
                                """-- metric_id: gmv_pay
-- meaning: 支付成功订单金额合计
-- sql: SUM(COALESCE(amount,0)) WHERE status='paid'
-- owner: data-platform
-- sla: T+1 08:30""",
                                "查阅即可复现 Ada 等分解。",
                                "1. 入职  2. 争议仲裁  3. 对接数仓 SSOT",
                                "| 错法 | 纠正 |\n|---|---|\n| 只有中文名无 SQL | 不可审计 |\n| 无 Owner | 无人更新 |",
                                "给 pay_uv 补全一条词典记录。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-same-name",
                            "title": "同名不同义",
                            "level": "??",
                            "content": gold(
                                "营销 GMV 含未支付，财务 GMV 仅 paid。",
                                "拆名或加命名空间，禁止静默混用。",
                                "词典 → 下一课：语义模型",
                                "两口径冲突。",
                                "- **冲突类型**：同名异义、异名同义。\n- **治理**：改名、别名表、认证集只暴露一种。",
                                """-- gmv_pay vs gmv_created（禁止都叫 GMV）
SELECT SUM(COALESCE(amount,0)) FILTER (WHERE status='paid') AS gmv_pay,
       SUM(COALESCE(amount,0)) AS gmv_all
FROM orders;""",
                                "数值不同必须不同名。",
                                "1. 口径评审  2. 看板改名",
                                "| 错法 | 纠正 |\n|---|---|\n| 口头「你们懂的」 | 书面拆名 |\n| 强制统一伤害业务 | 保留别名映射 |",
                                "写一封短说明：为何看板标题要改成「支付 GMV」。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-semantic",
            "title": "语义层",
            "level": "??",
            "content": "### 语义层\n\n模型、度量、与仓衔接。",
            "children": [
                {
                    "id": "bi-semantic-core",
                    "title": "模型与计算",
                    "level": "??",
                    "content": "### 模型与计算 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-semantic-model",
                            "title": "语义模型",
                            "level": "??",
                            "content": gold(
                                "业务要拖拽城市看 GMV，不想写 JOIN。",
                                "语义模型=表关系 + 维度 + 度量的业务视图。",
                                "同名冲突 → 下一课：度量计算",
                                "orders ⋈ users。",
                                "- **语义层**：BI/指标服务消费的逻辑模型。\n- **内容**：实体、关系、度量、层级。",
                                """-- 逻辑：fact_pay(user_id, amount, dt) * dim_user(user_id, city)
SELECT u.city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid' GROUP BY u.city;""",
                                "拖 city 即可出图；JOIN 封在模型里。",
                                "1. LookML/Power BI Model/帆软数据集  2. 指标平台",
                                "| 错法 | 纠正 |\n|---|---|\n| 语义层直连 ODS 脏表 | 接 DWS/认证集 |\n| 无关系乱笛卡尔 | 明确键 |",
                                "列出该模型最少 1 事实 2 维度。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-measure-calc",
                            "title": "度量与计算",
                            "level": "??",
                            "content": gold(
                                "同比、占比要在工具里可复用。",
                                "区分库内预计算与 BI 端计算；注意过滤上下文。",
                                "语义模型 → 下一课：北向布局",
                                "用户 GMV 占比。",
                                "- **度量**：聚合计算。\n- **计算字段**：占比/同比依赖筛选上下文。",
                                """SELECT user_id,
       SUM(COALESCE(amount,0)) AS gmv,
       SUM(COALESCE(amount,0)) * 1.0 /
         SUM(SUM(COALESCE(amount,0))) OVER () AS gmv_share
FROM orders WHERE status='paid'
GROUP BY user_id;""",
                                "Ada 份额最高。",
                                "1. DAX/表计算  2. 语义层 measure",
                                "| 错法 | 纠正 |\n|---|---|\n| 忽略筛选上下文 | 用官方时间智能 |\n| 重计算打爆明细 | 预聚合 |",
                                "写出「城市 GMV 占全国」在语义层应挂哪一层。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-board",
            "title": "看板设计",
            "level": "??",
            "content": "### 看板设计\n\n布局、对比、下钻、选图。",
            "children": [
                {
                    "id": "bi-layout",
                    "title": "布局原则",
                    "level": "??",
                    "content": "### 布局原则 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-northstar",
                            "title": "北向指标置顶",
                            "level": "?",
                            "content": gold(
                                "领导打开看板先找「今天好不好」。",
                                "顶部放 1 个北向 KPI + 简短对比。",
                                "度量计算 → 下一课：对比与趋势",
                                "北向=支付 GMV。",
                                "- **北向**：回答主问题的单一指标。\n- **版式**：上 KPI，下驱动/下钻。",
                                """SELECT SUM(COALESCE(amount,0)) AS northstar_gmv
FROM orders WHERE status='paid';""",
                                "大数字置顶；细节下沉。",
                                "1. 经营看板首页  2. 移动端摘要",
                                "| 错法 | 纠正 |\n|---|---|\n| 首屏十个同级 KPI | 分主次 |\n| 无时间范围 | 标题写清窗口 |",
                                "为取消率看板设计北向一句话标题。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-compare",
                            "title": "对比与趋势",
                            "level": "??",
                            "content": gold(
                                "只有绝对值说不清好坏。",
                                "提供同比/环比或分组对比与趋势。",
                                "北向 → 下一课：下钻切片",
                                "用户间对比；按日趋势。",
                                "- **对比**：类别/时间对照。\n- **趋势**：时间序列。",
                                """SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1 ORDER BY 2 DESC;

SELECT DATE(created_at) dt, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1 ORDER BY 1;""",
                                "柱状比用户；折线看趋势。",
                                "1. 例会材料  2. 异常发现",
                                "| 错法 | 纠正 |\n|---|---|\n| 双轴乱比 | 谨慎双轴 |\n| 趋势未聚合 | 先按日 |",
                                "补充「城市对比」应放在北向下第几层。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-drill-slice",
                            "title": "下钻与切片",
                            "level": "??",
                            "content": gold(
                                "GMV 跌了，要按城市/用户定位。",
                                "设计维度层级与切片器。",
                                "对比 → 下一课：图表选择",
                                "city → user。",
                                "- **下钻**：层级从汇总到明细。\n- **切片**：过滤维度。",
                                """SELECT COALESCE(u.city,'未知') city, u.user_name,
       SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid'
GROUP BY 1,2 ORDER BY 1,3 DESC;""",
                                "可从城市切到用户。",
                                "1. 自助分析  2. 根因定位",
                                "| 错法 | 纠正 |\n|---|---|\n| 下钻到无认证明细 | 权限+性能 |\n| 层级不在模型 | 先建层级 |",
                                "加一个 status 切片会怎样影响北向定义？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-chart-choice",
                            "title": "图表怎么选",
                            "level": "?",
                            "content": gold(
                                "用饼图比较 20 个用户 GMV，看不清。",
                                "按问题选图：比较→柱，趋势→线，构成→少类饼/条。",
                                "下钻 → 下一课：预聚合",
                                "用户 GMV。",
                                "| 问题 | 图 |\n|---|---|\n| 类别比较 | 柱/条 |\n| 时间趋势 | 折线 |\n| 占比（少类） | 堆叠/饼 |",
                                """-- 数据仍是聚合结果；图在 BI 中绑定
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1;""",
                                "柱状优于多类饼图。",
                                "1. 视觉规范  2. 评审",
                                "| 错法 | 纠正 |\n|---|---|\n| 3D 饼 | 禁用 |\n| 明细散点当经营图 | 先聚合 |",
                                "日 GMV 选折线还是柱？为什么。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-perf",
            "title": "性能与取数",
            "level": "???",
            "content": "### 性能与取数\n\n预聚合、缓存、护栏。",
            "children": [
                {
                    "id": "bi-perf-core",
                    "title": "加速手段",
                    "level": "???",
                    "content": "### 加速手段 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-preagg",
                            "title": "预聚合",
                            "level": "??",
                            "content": gold(
                                "每次打开看板都扫明细，超时。",
                                "把高频汇总沉到 DWS/物化，看板读汇总。",
                                "图表 → 下一课：缓存提取",
                                "用户 GMV 日更。",
                                "- **预聚合**：按常用维度先算好。\n- **对接**：数仓 DWS/ADS。",
                                """-- ADS/DWS
SELECT user_id, SUM(COALESCE(amount,0)) gmv, COUNT(*) pay_cnt
FROM orders WHERE status='paid' GROUP BY user_id;""",
                                "看板直接读该表。",
                                "1. 大盘  2. 移动端",
                                "| 错法 | 纠正 |\n|---|---|\n| 预聚合无刷新 SLA | 数过期 |\n| 维度组合爆炸 | 按北向裁剪 |",
                                "哪些下钻仍必须回明细？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-cache-extract",
                            "title": "缓存与提取",
                            "level": "???",
                            "content": gold(
                                "早高峰人人刷新同一 SQL。",
                                "用 BI 提取/缓存降低重复查询。",
                                "预聚合 → 下一课：查询护栏",
                                "同一 GMV 查询。",
                                "- **提取**：定时物化到 BI 引擎。\n- **缓存**：结果短时复用。\n- **权衡**：新鲜度 vs 速度。",
                                """-- 刷新策略示意：每天 08:40 提取认证数据集
-- 看板读提取；明细探索走限流直连""",
                                "高峰走缓存/提取。",
                                "1. Tableau Extract  2. Power BI Import  3. 帆软结果缓存",
                                "| 错法 | 纠正 |\n|---|---|\n| 全直连无护栏 | 打爆仓 |\n| 缓存当真相 | 标刷新时间 |",
                                "为北向 KPI 选 Import 还是 DirectQuery？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-query-guard",
                            "title": "查询护栏",
                            "level": "???",
                            "content": gold(
                                "有人拖一年明细导致集群挂。",
                                "限制返回行、强制时间过滤、禁无索引扫。",
                                "缓存 → 下一课：受控自助",
                                "自助 SQL/拖拽。",
                                "- **护栏**：行数/时间窗/队列/超时。\n- **认证集**：默认可拖范围。",
                                """-- 强制模板
SELECT ... FROM ads_pay
WHERE dt >= CURRENT_DATE - INTERVAL '30' DAY
LIMIT 100000;""",
                                "超限被拒或改走汇总。",
                                "1. 自助平台  2. SQL Lab",
                                "| 错法 | 纠正 |\n|---|---|\n| 只靠自觉 | 平台强制 |\n| 护栏过严无法分析 | 分级权限 |",
                                "写 3 条护栏规则给支付主题。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-self-serve",
            "title": "自助与治理",
            "level": "???",
            "content": "### 自助与治理\n\n效率与口径安全之间。",
            "children": [
                {
                    "id": "bi-govern-modes",
                    "title": "治理模式",
                    "level": "???",
                    "content": "### 治理模式 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-controlled-self",
                            "title": "受控自助",
                            "level": "??",
                            "content": gold(
                                "业务要自己出图，但怕口径乱。",
                                "只开放认证数据集与受控维度。",
                                "护栏 → 下一课：认证数据集",
                                "支付主题。",
                                "- **受控自助**：在治理边界内探索。\n- **开放**：维度/度量；**关闭**：随意改口径 SQL。",
                                """-- 业务可见：ads_user_pay_gmv(user_id, city, gmv, pay_cnt)
-- 不可见：ods 原始 orders""",
                                "自助不出「第二种 GMV」。",
                                "1. FineBI 公共数据  2. Tableau Certified",
                                "| 错法 | 纠正 |\n|---|---|\n| 完全锁死 | 影子 Excel |\n| 完全放开明细 | 口径灾难 |",
                                "列 2 个可开放字段、2 个不可开放字段。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-certified",
                            "title": "认证数据集",
                            "level": "??",
                            "content": gold(
                                "同一主题十个「私有数据源」。",
                                "发布认证集，标注 Owner 与刷新时间。",
                                "受控自助 → 下一课：订阅告警",
                                "ads 支付汇总。",
                                "- **认证**：官方背书可复用。\n- **元数据**：口径链接到词典。",
                                """-- certified.ads_pay_gmv
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1;""",
                                "默认搜索优先认证集。",
                                "1. 治理运营  2. 减少重复建模",
                                "| 错法 | 纠正 |\n|---|---|\n| 认证但不维护 | 定期评审 |\n| 名称不清 | 与词典同名 |",
                                "设计认证集的命名规范一行。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "bi-embed",
            "title": "交付与权限",
            "level": "???",
            "content": "### 交付与权限\n\n订阅、嵌入、RLS、工具。",
            "children": [
                {
                    "id": "bi-delivery",
                    "title": "交付方式",
                    "level": "???",
                    "content": "### 交付方式 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-subscribe",
                            "title": "订阅与告警",
                            "level": "??",
                            "content": gold(
                                "GMV 异常要自动推送，而不是等人打开看板。",
                                "配置邮件/IM 订阅与阈值告警。",
                                "认证集 → 下一课：嵌入与 RLS",
                                "北向 GMV。",
                                "- **订阅**：定时推送快照。\n- **告警**：条件触发。",
                                """-- 规则示意：日 GMV < 昨日 * 0.7 → 告警
SELECT SUM(COALESCE(amount,0)) FROM orders
WHERE status='paid' AND DATE(created_at)=CURRENT_DATE;""",
                                "异常日触达负责人。",
                                "1. 值班  2. 业务订阅",
                                "| 错法 | 纠正 |\n|---|---|\n| 告警风暴 | 收敛阈值 |\n| 推送无口径说明 | 附词典链接 |",
                                "为支付笔数设一个合理告警条件。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-embed-rls",
                            "title": "嵌入与 RLS",
                            "level": "???",
                            "content": gold(
                                "商家后台只能看自己的订单。",
                                "行级安全（RLS）按用户属性过滤；嵌入注意鉴权。",
                                "订阅 → 下一课：工具地图",
                                "按 user_id/城市隔离。",
                                "- **RLS**：同一报表不同行可见。\n- **嵌入**：Token/单点登录，防越权。",
                                """-- RLS 示意：会话城市 = 行城市
SELECT o.* FROM orders o
JOIN users u ON u.user_id=o.user_id
WHERE u.city = CURRENT_SETTING('app.city'); -- 示意""",
                                "上海账号看不到北京明细。",
                                "1. SaaS 嵌入  2. 组织权限",
                                "| 错法 | 纠正 |\n|---|---|\n| 只藏 UI 不滤数据 | 必 RLS/视图 |\n| Token 长期有效 | 短时签发 |",
                                "运营「看全部」与商家「看自己」如何两套角色。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-map",
                            "title": "BI 工具地图",
                            "level": "??",
                            "content": gold(
                                "团队要在 Tableau / Power BI / Superset / 帆软 / Datart / 永洪间选型。",
                                "按场景匹配：治理、嵌入、国产信创、开源。",
                                "RLS → 下一课：分工具叶子",
                                "能力对照。",
                                "| 工具 | 更适合 |\n|---|---|\n| Tableau | 视觉分析、企业治理 |\n| Power BI | 微软生态、DAX 模型 |\n| Superset | 开源 SQL 仓直连 |\n| 帆软 FineBI/Report | 国内企、填报+自助 |\n| Datart | 开源可视化/嵌入 |\n| 永洪 | 国内分析与大屏 |",
                                """-- 选型与口径无关：先统一 gmv_pay
SELECT SUM(COALESCE(amount,0)) FROM orders WHERE status='paid';""",
                                "工具可换，口径不可散。",
                                "1. 采购选型  2. 多工具并存治理",
                                "| 错法 | 纠正 |\n|---|---|\n| 先买工具后定口径 | 倒置 |\n| 每工具一套私有指标 | 词典统一 |",
                                "你们若已有数仓 SQL，优先开源还是商业？写 2 条理由。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "bi-tools-detail",
                    "title": "工具要点",
                    "level": "???",
                    "content": "### 工具要点 · 章节导读\n\n国际主流 + 国产常见。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "bi-tool-tableau",
                            "title": "Tableau",
                            "level": "???",
                            "content": gold(
                                "要强视觉分析与企业认证数据源。",
                                "知道 Extract/Live、计算字段与治理思路。",
                                "工具地图 → Power BI",
                                "连认证支付集。",
                                "- **特点**：VizQL、视觉分析强。\n- **取数**：Live 直连 / Extract 提取。",
                                """-- 发布前用认证 SQL
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1;""",
                                "工作簿应指向认证数据源。",
                                "1. 分析师探索  2. 企业门户",
                                "| 错法 | 纠正 |\n|---|---|\n| 每人私有 Extract 口径 | Certified |\n| Live 无护栏 | 限时限行 |",
                                "何时必须 Extract？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-powerbi",
                            "title": "Power BI",
                            "level": "???",
                            "content": gold(
                                "微软栈里要做模型和 DAX 指标。",
                                "区分 Import/DirectQuery；度量放模型。",
                                "Tableau → Superset",
                                "星型：支付事实+用户维。",
                                "- **模型**：关系 + DAX。\n- **Power Query**：取数变换。",
                                """-- 模型度量口径仍应对齐
-- GMV = SUM(amount) 筛选 paid""",
                                "度量与词典同名同义。",
                                "1. 企业 Office 生态  2. 部门自助",
                                "| 错法 | 纠正 |\n|---|---|\n| 视觉层改口径 | 沉到度量 |\n| DirectQuery 滥用 | 预聚合 |",
                                "AOV 应用 DAX 还是上游 ADS？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-superset",
                            "title": "Superset",
                            "level": "???",
                            "content": gold(
                                "开源对接数仓，要 SQL Lab + 仪表盘。",
                                "Dataset/Chart/Dashboard 分层；虚拟度量谨慎。",
                                "Power BI → 帆软",
                                "SQL 引擎上的 ads。",
                                "- **定位**：开源 BI，偏 SQL 用户。\n- **注意**：权限与缓存配置。",
                                """SELECT DATE(created_at) dt, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1;""",
                                "图表绑定该数据集。",
                                "1. 数据团队内部  2. 湖仓可视化",
                                "| 错法 | 纠正 |\n|---|---|\n| SQL Lab 无审计 | 开日志+护栏 |\n| 指标写死在图表 | Dataset 复用 |",
                                "Superset 与指标平台如何分工？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-finebi",
                            "title": "帆软 FineBI",
                            "level": "???",
                            "content": gold(
                                "国内企业要业务自助，常已有帆软报表。",
                                "公共数据/自助数据集受控；与 FineReport 分工。",
                                "Superset → FineReport",
                                "认证支付集。",
                                "- **FineBI**：自助分析。\n- **搭配**：固定报表/填报用 FineReport。\n- **治理**：公共数据口径统一。",
                                """-- 公共数据来源建议 ADS
SELECT user_id, city, gmv FROM ads_user_pay; -- 示意""",
                                "业务在公共数据上拖拽，不直连 ODS。",
                                "1. 国内甲方  2. 业务分析师",
                                "| 错法 | 纠正 |\n|---|---|\n| 每人Excel上传当源 | 推公共数据 |\n| BI与Report指标两套 | 词典统一 |",
                                "什么需求应 FineReport 而不是 FineBI？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-finereport",
                            "title": "帆软 FineReport",
                            "level": "???",
                            "content": gold(
                                "要像素级固定报表、填报、打印导出。",
                                "区分自助探索 vs 固定制表。",
                                "FineBI → Datart",
                                "日报 PDF。",
                                "- **定位**：企业级报表/填报。\n- **指标**：同样应从词典/ADS 取。",
                                """-- 报表数据集
SELECT DATE(created_at) dt, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY 1;""",
                                "版式固定、可调度推送。",
                                "1. 监管报送  2. 财务固定表",
                                "| 错法 | 纠正 |\n|---|---|\n| 在报表单元格改口径 | 上游改 |\n| 与 FineBI 各算各的 | 同源 |",
                                "填报回写数据是否应进数仓？原则是什么？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-datart",
                            "title": "Datart",
                            "level": "???",
                            "content": gold(
                                "要开源可视化且可嵌入业务系统。",
                                "了解 Datart 仪表盘/可视化与权限思路。",
                                "FineReport → 永洪",
                                "嵌入商家后台。",
                                "- **定位**：开源数据可视化平台。\n- **场景**：嵌入、定制化前端。",
                                """-- 嵌入前仍用同一口径
SELECT SUM(COALESCE(amount,0)) FROM orders WHERE status='paid';""",
                                "嵌入视图与门户 KPI 一致。",
                                "1. 产品内嵌分析  2. 开源栈",
                                "| 错法 | 纠正 |\n|---|---|\n| 嵌入不做 RLS | 必鉴权过滤 |\n| 前端重算指标 | 读认证 API/集 |",
                                "Datart 与 Superset 如何分工（若并存）？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "bi-tool-yonghong",
                            "title": "永洪 BI",
                            "level": "???",
                            "content": gold(
                                "国内项目招标常见永洪，要大屏与分析。",
                                "同样先口径后工具；注意与仓分层对接。",
                                "Datart → 练习场",
                                "经营大屏 GMV。",
                                "- **定位**：国内商业 BI，分析/大屏常见。\n- **原则**：读 ADS/认证集，不堆 ODS。",
                                """SELECT COALESCE(u.city,'未知') city, SUM(COALESCE(o.amount,0)) gmv
FROM orders o JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid' GROUP BY 1;""",
                                "大屏城市 GMV 与明细可对账。",
                                "1. 国内交付  2. 展厅大屏",
                                "| 错法 | 纠正 |\n|---|---|\n| 为大屏单独一套口径 | 禁止 |\n| 实时直连生产库 | 走仓/缓存 |",
                                "大屏刷新 5s 一次时，数据应来自哪里？",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
    ],
}


# ---- ETL extra leaves to merge ----
ETL_EXTRAS = {
    "etl-tool-datax": gold(
        "要把 MySQL 订单批同步到 Hive/仓。",
        "知道 DataX 以 Reader/Writer 插件做批同步。",
        "工具地图 → Airbyte",
        "orders 增量窗。",
        "- **DataX**：阿里开源批数据同步框架。\n- **形态**：job.json 配 reader/writer。\n- **适合**：库表/文件窗口批跑。",
        """-- Reader 侧 SQL（示意）
SELECT order_id, user_id, amount, status, created_at
FROM orders
WHERE created_at >= :start AND created_at < :end;
-- 仍要：分区覆盖 + 对账""",
        "窗口数据进入目标表；重跑靠覆盖/幂等。",
        "1. 传统数仓装载  2. 异构库同步",
        "| 错法 | 纠正 |\n|---|---|\n| 当实时 CDC | 改 Debezium/Flink |\n| 无脏数据策略 | 加 DQ |",
        "DataX 与「仓内 dbt」如何分工？",
    ),
    "etl-tool-airbyte": gold(
        "要快速接 SaaS/库表，少写连接器。",
        "理解 Airbyte Source/Destination 与 ELT 搭配。",
        "DataX → Flink CDC",
        "标准化连接。",
        "- **Airbyte**：开源数据移动，偏 ELT。\n- **落地**：原始层再 dbt。",
        """-- 同步后变换仍用口径
SELECT SUM(COALESCE(amount,0)) FROM orders WHERE status='paid';""",
        "连接器跑通 ≠ 指标正确；要契约与测试。",
        "1. 快速接入  2. 中小团队",
        "| 错法 | 纠正 |\n|---|---|\n| 同步即数仓 | 仍要分层 |\n| 密钥进仓库 | 密文配置 |",
        "何时选 Airbyte 而不是自研 DataX 作业？",
    ),
    "etl-tool-flink-cdc": gold(
        "订单状态要秒级入湖/仓。",
        "Flink CDC 读 binlog/WAL 做流式入湖。",
        "Airbyte → 血缘",
        "order 变更流。",
        "- **Flink CDC**：流式变更捕获与处理。\n- **注意**：恰好一次、schema 变更、回压。",
        """-- 落地后仍按事件去重/合并
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time DESC, event_id DESC) rn
  FROM order_events e
) t WHERE rn=1;""",
        "流上压缩为最新状态；批对账兜底。",
        "1. 近实时数仓  2. 微服务同步",
        "| 错法 | 纠正 |\n|---|---|\n| 无批对账 | 漂数 |\n| 直写 ADS | 经 ODS/DWD |",
        "流任务失败 10 分钟，如何补齐缺口？",
    ),
    "etl-lineage": gold(
        "GMV 错了，要追是哪条管道、哪张上游表。",
        "建立表/列级血缘；与调度、词典打通。",
        "Flink CDC → 发布策略",
        "ads_gmv ← dwd_pay ← ods_orders ← oltp.orders。",
        "- **血缘**：数据从哪来到哪去。\n- **价值**：影响分析、问责、合规。",
        """-- 文档/元数据示意
-- oltp.orders -> ods_orders_di -> dwd_trade_pay_di -> ads_user_gmv
SELECT 'ods_orders_di' AS upstream, 'dwd_trade_pay_di' AS downstream;""",
        "改 orders.status 枚举可评估下游清单。",
        "1. 事故定位  2. 变更评审  3. OpenLineage",
        "| 错法 | 纠正 |\n|---|---|\n| 只有任务名无表级 | 落到表/列 |\n| 血缘不更新 | 随发布采集 |",
        "列出 gmv_pay 的最小 3 跳血缘。",
    ),
    "etl-publish": gold(
        "新口径要上线，不能让看板白天空窗。",
        "用影子表/蓝绿或分区切换做发布。",
        "血缘 → 高级练习",
        "替换 ads 用户 GMV。",
        "- **发布**：原子切换对消费者可见版本。\n- **手段**：交换表名、视图切分、分区上线。",
        """-- 写新表再切视图
-- CREATE TABLE ads_user_gmv_v2 AS SELECT ...;
-- CREATE OR REPLACE VIEW ads_user_gmv AS SELECT * FROM ads_user_gmv_v2;""",
        "切换瞬时完成；失败可回滚视图。",
        "1. 口径变更  2. 大表更换",
        "| 错法 | 纠正 |\n|---|---|\n| 白天 truncate 真表 | 空窗 |\n| 无回滚 | 预留旧版 |",
        "设计一次「AOV 口径变更」的发布检查单 3 条。",
    ),
    "etl-drill-senior": gold(
        "端到端验收：契约→CDC/增量→SCD→幂等→DQ→血缘。",
        "口述一条订单状态变更的完整链路。",
        "高级清单",
        "统一四表。",
        "- **练习场（高级）**：设计题为主。",
        """-- 1) 契约：status 枚举
-- 2) 捕获：增量或 CDC
-- 3) 去重/合并
-- 4) SCD 用户维若城市变
-- 5) OVERWRITE/MERGE 幂等
-- 6) 对账 + 血缘登记""",
        "链路可画在一页纸；每步有失败处理。",
        "1. 架构面试  2. 方案评审",
        "| 错法 | 纠正 |\n|---|---|\n| 跳过 DQ | 必门禁 |\n| 无迟到策略 | 加 lookback |",
        "补画：告警接到谁、SLA 几点。",
    ),
}


def leaf(eid, title, level, body):
    return {
        "id": eid,
        "title": title,
        "level": level,
        "content": body.strip(),
        "children": [],
    }


# ========== Apply BI ==========
for m in ["const ETL_KNOWLEDGE_TREE", "const DWH_KNOWLEDGE_TREE", "const SQL_KNOWLEDGE_TREE"]:
    if m not in text:
        raise SystemExit("precheck " + m)

s, e, _ = extract_object(text, "const BI_KNOWLEDGE_TREE = ")
text = text[:s] + json.dumps(BI_TREE, ensure_ascii=False, indent=2) + text[e:]
print("OK BI leaves", len(walk_leaves(BI_TREE)))

# ========== Deepen ETL ==========
s, e, etl = extract_object(text, "const ETL_KNOWLEDGE_TREE = ")
tools = find_node(etl, "etl-tool-map")
if tools is not None:
    have = {c["id"] for c in tools.get("children") or []}
    for eid, title, lv in [
        ("etl-tool-datax", "批同步 DataX", "???"),
        ("etl-tool-airbyte", "连接器 Airbyte", "???"),
        ("etl-tool-flink-cdc", "流 CDC Flink", "???"),
    ]:
        if eid not in have:
            tools.setdefault("children", []).append(leaf(eid, title, lv, ETL_EXTRAS[eid]))
            print("add", eid)

# add lineage/publish section under root if missing
if not find_node(etl, "etl-meta"):
    etl.setdefault("children", []).append(
        {
            "id": "etl-meta",
            "title": "血缘与发布",
            "level": "???",
            "content": "### 血缘与发布\n\n可追溯、可回滚上线。",
            "children": [
                {
                    "id": "etl-meta-core",
                    "title": "元数据闭环",
                    "level": "???",
                    "content": "### 元数据闭环 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        leaf("etl-lineage", "数据血缘", "???", ETL_EXTRAS["etl-lineage"]),
                        leaf("etl-publish", "发布与回滚", "???", ETL_EXTRAS["etl-publish"]),
                    ],
                }
            ],
        }
    )
    print("add etl-meta")

prac = find_node(etl, "etl-practice-field")
if prac and not find_node(etl, "etl-drill-senior"):
    prac.setdefault("children", []).append(
        leaf("etl-drill-senior", "高级练习", "???", ETL_EXTRAS["etl-drill-senior"])
    )
    print("add etl-drill-senior")

# enrich senior path text
sp = find_node(etl, "etl-path-senior")
if sp:
    sp["content"] = lesson("""
### 课前

- **定位**：契约治理、迟到数据、脱敏、血缘发布、工具选型（Airflow/dbt/DataX/Airbyte/Flink CDC）。
- **原则**：幂等可重跑；质量门禁在下游前；发布可回滚。
""")

text = text[:s] + json.dumps(etl, ensure_ascii=False, indent=2) + text[e:]
print("OK ETL leaves", len(walk_leaves(etl)))

# prefer
text, n = re.subn(
    r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?null;",
    """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "dwh" ? "dwh-constitution"
              : hub === "etl" ? "etl-constitution"
              : hub === "bi" ? "bi-constitution" : null;""",
    text,
    count=1,
)
print("prefer", n)

# sectors for BI
zone = text[text.find("KG_SECTOR_BY_ID") : text.find("KG_SECTOR_BY_ID") + 3500]
if "bi-constitution" not in zone:
    text = text.replace(
        '"bi-metric": "foundation", "bi-board": "advanced",',
        '"bi-metric": "foundation", "bi-board": "advanced", "bi-learning-path": "practice", '
        '"bi-constitution": "practice", "bi-governance": "advanced", "bi-semantic": "advanced", '
        '"bi-tool-finebi": "practice", "bi-tool-datart": "practice",',
        1,
    )
    print("OK bi sectors")

# BI_SAMPLE / refresh ETL_SAMPLE extras
bi_sample = {
    "tables": ["users", "orders", "order_events", "order_items"],
    "sharedWith": "SQL_SAMPLE",
    "constitutionId": "bi-constitution",
    "hubId": "bi",
    "metrics": ["gmv_pay", "pay_cnt", "pay_uv", "aov"],
}
if "const BI_SAMPLE" in text:
    s0, s1, _ = extract_object(text, "const BI_SAMPLE = ")
    text = text[:s0] + json.dumps(bi_sample, ensure_ascii=False, indent=2) + text[s1:]
else:
    insert_at = "const ETL_SAMPLE = " if "const ETL_SAMPLE" in text else "const SQL_SAMPLE = "
    text = text.replace(
        insert_at,
        "const BI_SAMPLE = " + json.dumps(bi_sample, ensure_ascii=False, indent=2) + ";\n\n    " + insert_at,
        1,
    )
print("OK BI_SAMPLE")

p.write_text(text, encoding="utf-8")

t2 = p.read_text(encoding="utf-8")
for marker in [
    "const SQL_KNOWLEDGE_TREE = ",
    "const ETL_KNOWLEDGE_TREE = ",
    "const BI_KNOWLEDGE_TREE = ",
    "const DWH_KNOWLEDGE_TREE = ",
]:
    extract_object(t2, marker)

_, _, bi = extract_object(t2, "const BI_KNOWLEDGE_TREE = ")
_, _, etl2 = extract_object(t2, "const ETL_KNOWLEDGE_TREE = ")
assert find_node(bi, "bi-constitution")
assert find_node(bi, "bi-tool-finebi")
assert find_node(bi, "bi-tool-yonghong")
assert "易错对照" in find_node(bi, "bi-atomic")["content"]
assert find_node(etl2, "etl-tool-datax")
assert find_node(etl2, "etl-lineage")
assert find_node(etl2, "etl-constitution")
print(
    "VALIDATED BI",
    len(walk_leaves(bi)),
    "ETL",
    len(walk_leaves(etl2)),
    "size",
    p.stat().st_size,
)
