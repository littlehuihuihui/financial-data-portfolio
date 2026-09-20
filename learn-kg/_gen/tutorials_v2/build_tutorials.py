# -*- coding: utf-8 -*-
"""Build tutorials + migration aligned to new BI/SQL graph structure."""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parent.parent
TODAY = "2026-09-18"

# ---------------------------------------------------------------------------
# Graph definition (parents + ordered children). Leaves have children=[].
# ---------------------------------------------------------------------------

def N(title, children=None, **kw):
    return {"title": title, "children": children or [], **kw}


BI_TREE = N(
    "BI",
    [
        N(
            "Tableau",
            [
                N("入门准备"),
                N("数据准备"),
                N(
                    "图表制作",
                    [
                        N("柱状图", chart=True),
                        N("折线图", chart=True),
                        N("饼图", chart=True),
                        N("环形图", chart=True),
                        N("双轴组合图", chart=True),
                        N("热力图", chart=True),
                    ],
                ),
                N(
                    "计算",
                    [
                        N("基础计算"),
                        N("表计算"),
                        N(
                            "LOD",
                            [
                                N("FIXED", lod=True),
                                N("INCLUDE", lod=True),
                                N("EXCLUDE", lod=True),
                            ],
                        ),
                    ],
                ),
                N("筛选与交互"),
                N("仪表板"),
                N("性能优化"),
                N("实战案例"),
            ],
        ),
        N("Power BI"),
        N("国产 BI"),
    ],
)

SQL_TREE = N(
    "SQL",
    [
        N(
            "基础查询",
            [
                N("SELECT"),
                N("WHERE"),
                N("ORDER BY"),
                N("LIMIT"),
            ],
        ),
        N(
            "多表操作",
            [
                N("JOIN"),
                N("子查询"),
                N("UNION"),
            ],
        ),
        N(
            "聚合分析",
            [
                N("GROUP BY"),
                N("HAVING"),
                N("窗口函数"),
            ],
        ),
        N("数据定义"),
        N("性能优化"),
        N("事务与安全"),
    ],
)


def node_id(path: list[str]) -> str:
    return ".".join(path)


def walk(tree, path=None, parent_id=None, acc=None):
    """Yield dicts for every node with id/path/parent/children_ids/is_leaf."""
    acc = acc if acc is not None else []
    path = (path or []) + [tree["title"]]
    nid = node_id(path)
    kids = tree.get("children") or []
    child_ids = [node_id(path + [c["title"]]) for c in kids]
    rec = {
        "id": nid,
        "title": tree["title"],
        "path": path[:],
        "parent_id": parent_id,
        "child_ids": child_ids,
        "is_leaf": len(kids) == 0,
        "chart": bool(tree.get("chart")),
        "lod": bool(tree.get("lod")),
        "domain": path[0],
    }
    acc.append(rec)
    for c in kids:
        walk(c, path, nid, acc)
    return acc


# ---------------------------------------------------------------------------
# Content banks (learning goals + sections per leaf title key)
# ---------------------------------------------------------------------------

CONTENT = {}


def put(nid, goal, sections, difficulty=2, minutes=20, tags=None):
    CONTENT[nid] = {
        "learning_goal": goal,
        "sections": sections,
        "difficulty": difficulty,
        "estimated_minutes": minutes,
        "tags": tags or [],
    }


def sec_concept(title, body):
    return {"type": "concept", "title": title, "body": body}


def sec_steps(title, items):
    return {"type": "steps", "title": title, "items": items}


def sec_mistakes(items):
    return {
        "type": "mistakes",
        "title": "常见错误",
        "items": [{"mistake": m, "fix": f} for m, f in items],
    }


def sec_exercise(q, diff=2):
    return {"type": "exercise", "title": "练习", "question": q, "difficulty": diff}


def sec_syntax(title, body):
    return {"type": "syntax", "title": title, "body": body}


def sec_scenario(title, body):
    return {"type": "scenario", "title": title, "body": body}


# --- BI Tableau ---
put(
    "BI.Tableau.入门准备",
    "完成 Tableau Desktop/Public 环境准备，能打开工作簿并认识界面分区",
    [
        sec_concept("学习范围", "认识工作区、数据源页、工作表、仪表板与故事页；建立「维度/度量」直觉。"),
        sec_steps(
            "准备步骤",
            [
                "安装 Tableau Desktop 或打开 Tableau Public",
                "下载 Superstore 样例并连接 Excel/CSV",
                "确认左侧维度/度量分区可见",
                "新建空白工作表并保存工作簿",
            ],
        ),
        sec_mistakes(
            [
                ("把度量拖到维度区后图表异常", "检查字段角色；数值字段可转换为度量"),
                ("找不到数据源页", "从数据菜单重新连接，或点底部「数据源」标签"),
            ]
        ),
        sec_exercise("连接 Superstore，截图标注维度区、度量区、标记卡与筛选器架子。", 1),
    ],
    1,
    15,
    ["Tableau", "入门"],
)

put(
    "BI.Tableau.数据准备",
    "能完成连接、关系/联接选择、基础清洗与抽取策略判断",
    [
        sec_concept("数据准备做什么", "把业务表变成可分析模型：连接、关系、类型修正、空值与抽取。"),
        sec_steps(
            "准备步骤",
            [
                "连接 Orders / People / Returns（或等价表）",
                "用「关系」按 Order ID 关联，必要时改用物理联接",
                "检查字段类型：日期、地理角色、度量聚合",
                "评估实时连接 vs 抽取，样例数据建议抽取",
            ],
        ),
        sec_mistakes(
            [
                ("错误联接导致行数爆炸", "先看粒度；一对多要确认主键"),
                ("日期被当成字符串", "改为日期类型并验证排序"),
            ]
        ),
        sec_exercise("用 Superstore 建立关系模型，并说明为何订单与退货是一对多。", 2),
    ],
    2,
    25,
    ["Tableau", "数据准备"],
)

CHARTS = {
    "柱状图": (
        "学完你能用维度+度量做出对比清晰的柱状图，并完成排序与标签",
        [
            "把类别维度拖到列，销售额拖到行",
            "标记选「条形图/柱状图」",
            "按销售额降序排序",
            "显示标记标签，调整颜色与轴标题",
        ],
        "用 Superstore 做各品类销售额柱状图，并按销售额从高到低排序。",
    ),
    "折线图": (
        "学完你能做出时间趋势折线，并处理日期连续/离散",
        [
            "订单日期拖到列，设为连续月或年-月",
            "销售额拖到行",
            "标记选「线」",
            "可把细分市场拖到颜色做多系列",
        ],
        "做近两年月度销售额折线，并按细分市场分色。",
    ),
    "饼图": (
        "学完你能做出占比饼图，并控制扇区标签与图例",
        [
            "标记选「饼图」",
            "维度放「颜色」，度量放「角度」",
            "标签显示占比或类别名",
            "控制扇区数量，避免过多类别",
        ],
        "做各品类销售占比饼图，标签显示百分比。",
    ),
    "环形图": (
        "学完你能在 Tableau 里做出标准环形图",
        [
            "先做饼图：标记选饼图，颜色放维度，角度放度量",
            "记录数拖入行两次，都改为最小值",
            "右键第二个记录数选双轴",
            "内圈标记卡删除颜色/角度，大小调小，颜色设白色",
            "调整轴范围让两饼同心",
        ],
        "用 Superstore 数据做各品类销售占比环形图。",
    ),
    "双轴组合图": (
        "学完你能用双轴组合柱+线，比较量纲不同的两个指标",
        [
            "销售额放行，利润放行（第二个）",
            "右键第二度量选双轴并同步或分轴",
            "一个标记用柱，一个标记用线",
            "注意量纲差异，必要时用双轴不同范围",
        ],
        "做月度销售额（柱）与利润率（线）的双轴组合图。",
    ),
    "热力图": (
        "学完你能用颜色编码做二维热力，发现交叉热点",
        [
            "一个维度放列，一个维度放行",
            "度量放「颜色」标记",
            "标记可用方形，调整大小",
            "选用合适色板，注意色盲友好",
        ],
        "做「地区 × 品类」销售额热力图。",
    ),
}

for title, (goal, steps, ex) in CHARTS.items():
    nid = f"BI.Tableau.图表制作.{title}"
    put(
        nid,
        goal,
        [
            sec_concept(f"什么是{title}", f"{title}用于把度量在类别或时间上的结构可视化，服务对比、趋势或占比阅读。"),
            sec_steps("制作步骤", steps),
            sec_mistakes(
                [
                    ("标记类型选错导致图形变形", "在标记卡明确选择正确图形类型"),
                    ("标签过多遮挡图形", "只保留关键标签或用悬停提示"),
                ]
            ),
            sec_exercise(ex, 2),
        ],
        2,
        20,
        ["Tableau", "图表", title],
    )

put(
    "BI.Tableau.计算.基础计算",
    "能编写行级/聚合基础计算字段，并理解聚合时机",
    [
        sec_concept("基础计算", "计算字段用于派生指标：利润率、折扣金额、条件分类等。"),
        sec_syntax(
            "示例",
            "利润率：`SUM([利润])/SUM([销售额])`\n折扣额：`[销售额]*[折扣]`（行级）",
        ),
        sec_steps(
            "练习步骤",
            [
                "创建计算字段「利润率」",
                "用聚合公式并放到行/标签",
                "对比行级与聚合写法的差异",
            ],
        ),
        sec_mistakes(
            [
                ("`SUM([利润]/[销售额])` 量纲错误", "分母也要聚合：SUM([销售额])"),
                ("把行级公式当聚合用", "先想清楚粒度再写"),
            ]
        ),
        sec_exercise("创建利润率字段，按品类对比销售额与利润率。", 2),
    ],
    2,
    25,
    ["Tableau", "计算"],
)

put(
    "BI.Tableau.计算.表计算",
    "能使用快速表计算完成占比、同比、累计等视图级计算",
    [
        sec_concept("表计算", "表计算基于视图当前布局二次计算，依赖「寻址/分区」。"),
        sec_steps(
            "练习步骤",
            [
                "做品类销售额柱状图",
                "对销售额用快速表计算→总额百分比",
                "切换计算依据（表/窗格）观察变化",
            ],
        ),
        sec_mistakes(
            [
                ("换透视后结果变了", "表计算依赖视图布局，要固定寻址方式"),
                ("与 LOD 混淆", "表计算看视图；LOD 看数据源粒度"),
            ]
        ),
        sec_exercise("做出各月销售额的累计占比折线。", 3),
    ],
    3,
    30,
    ["Tableau", "表计算"],
)

LOD_DETAIL = {
    "FIXED": (
        "掌握 FIXED 语法与「固定粒度」场景，能算客户终身价值类指标",
        "{ FIXED [客户 ID] : SUM([销售额]) }",
        "按客户固定粒度汇总，不受视图其他维度影响（筛选器行为需注意）。",
        "用 FIXED 计算每位客户总销售额，再看各细分市场的客户平均贡献。",
    ),
    "INCLUDE": (
        "掌握 INCLUDE：在视图粒度上额外包含维度再聚合",
        "{ INCLUDE [订单 ID] : SUM([销售额]) }",
        "视图较粗时，临时下钻到更细维度再平均/汇总。",
        "在品类视图中用 INCLUDE 订单粒度，计算平均订单额。",
    ),
    "EXCLUDE": (
        "掌握 EXCLUDE：从视图粒度中排除维度后聚合",
        "{ EXCLUDE [细分市场] : SUM([销售额]) }",
        "用于算「去掉某维度后」的合计，再与明细对比占比。",
        "在「品类×细分市场」视图中，用 EXCLUDE 细分市场得到品类合计并算占比。",
    ),
}

for title, (goal, syntax, scenario, ex) in LOD_DETAIL.items():
    put(
        f"BI.Tableau.计算.LOD.{title}",
        goal,
        [
            sec_concept(f"什么是 {title}", f"{title} 是 Tableau LOD 表达式的一种，用于显式控制聚合粒度。"),
            sec_syntax("语法", syntax),
            sec_scenario("适用场景", scenario),
            sec_steps(
                "操作步骤",
                [
                    "创建计算字段并粘贴 LOD 表达式",
                    "把结果拖入视图验证粒度",
                    "对比有无维度筛选时的结果差异",
                ],
            ),
            sec_mistakes(
                [
                    ("FIXED 结果不受维度筛选影响感到困惑", "了解上下文筛选器与 LOD 的交互"),
                    ("LOD 嵌套过深难维护", "先写清业务粒度再写表达式"),
                ]
            ),
            sec_exercise(ex, 3),
        ],
        3,
        30,
        ["Tableau", "LOD", title],
    )

put(
    "BI.Tableau.筛选与交互",
    "能配置筛选器、操作与仪表板联动，控制用户交互路径",
    [
        sec_concept("筛选与交互", "筛选器、高亮、URL/筛选操作决定用户如何探索。"),
        sec_steps(
            "配置步骤",
            [
                "添加维度筛选器并显示",
                "在仪表板中应用筛选到相关工作表",
                "配置「用作筛选器」的点击联动",
            ],
        ),
        sec_mistakes(
            [
                ("筛选作用域选错", "检查「仅此工作表/相关/全部」"),
                ("联动导致循环过滤", "明确主从关系"),
            ]
        ),
        sec_exercise("做一个地区筛选联动销售额与利润两张图的仪表板。", 2),
    ],
    2,
    25,
    ["Tableau", "交互"],
)

put(
    "BI.Tableau.仪表板",
    "能按信息层级布局仪表板，完成容器、对齐与移动端预览",
    [
        sec_concept("仪表板", "把多张工作表组织成叙事：概览→对比→明细。"),
        sec_steps(
            "设计步骤",
            [
                "新建仪表板，设定尺寸",
                "用水平/垂直容器布局",
                "放置 KPI、趋势、明细三层",
                "预览手机布局并调整",
            ],
        ),
        sec_mistakes(
            [
                ("浮动对象过多难维护", "优先用平铺容器"),
                ("颜色语义不一致", "统一色板与图例"),
            ]
        ),
        sec_exercise("做一个含 KPI、趋势、明细的销售仪表板。", 2),
    ],
    2,
    30,
    ["Tableau", "仪表板"],
)

put(
    "BI.Tableau.性能优化",
    "能识别抽取、计算、LOD 与仪表板层面的性能瓶颈并优化",
    [
        sec_concept("性能优化", "从数据量、计算复杂度、渲染对象数三方面下手。"),
        sec_steps(
            "优化清单",
            [
                "优先抽取并隐藏无用字段",
                "减少逐行计算，能聚合则聚合",
                "控制仪表板工作表与筛选器数量",
                "用性能记录排查慢查询",
            ],
        ),
        sec_mistakes(
            [
                ("过度使用 FIXED 导致查询重", "评估是否可用表计算/预聚合"),
                ("实时连接大表无过滤", "加抽取或数据源筛选"),
            ]
        ),
        sec_exercise("列出你当前工作簿的 3 个优化点并说明预期收益。", 3),
    ],
    3,
    30,
    ["Tableau", "性能"],
)

put(
    "BI.Tableau.实战案例",
    "能独立完成从取数到仪表板的迷你项目并讲清口径",
    [
        sec_concept("实战目标", "用 Superstore 回答：谁在买、买什么、趋势如何、哪里异常。"),
        sec_steps(
            "项目步骤",
            [
                "定义 3 个业务问题与对应指标",
                "准备数据与关键计算字段",
                "做 3～5 张分析图并组成仪表板",
                "写出口径说明与结论",
            ],
        ),
        sec_mistakes(
            [
                ("只有图没有结论", "每张图对应一个问题与行动建议"),
                ("指标口径前后不一致", "在标题/注释写清定义"),
            ]
        ),
        sec_exercise("交付一页销售复盘仪表板，并口述 3 条洞察。", 3),
    ],
    3,
    45,
    ["Tableau", "实战"],
)

put(
    "BI.Power BI",
    "建立 Power BI 与 Tableau 的对照地图，能完成导入、模型与基础视觉",
    [
        sec_concept("Power BI 定位", "微软生态下的自助 BI：Power Query、模型、DAX、报表。"),
        sec_steps(
            "入门步骤",
            [
                "用 Power BI Desktop 导入样例",
                "在模型视图建立关系",
                "用可视化窗格做柱状/折线",
                "发布到服务（可选）",
            ],
        ),
        sec_mistakes(
            [
                ("关系方向与筛选误解", "检查模型中的筛选方向"),
                ("DAX 与行列上下文混淆", "先学基础 CALCULATE"),
            ]
        ),
        sec_exercise("用同一销售样例做一张与 Tableau 同口径的品类对比图。", 2),
    ],
    2,
    35,
    ["Power BI"],
)

put(
    "BI.国产 BI",
    "了解 FineBI/永洪等国产 BI 的选型点与迁移注意",
    [
        sec_concept("国产 BI", "强调信创、本地部署与业务人员自助；能力对标 Tableau/PBI。"),
        sec_steps(
            "学习路径",
            [
                "明确部署形态（私有化/云）",
                "对照：数据准备、可视化、权限、嵌入",
                "用同一指标口径做迁移试点",
            ],
        ),
        sec_mistakes(
            [
                ("只比功能清单不比治理", "同时评估权限、认证、血缘"),
                ("一次性全量迁移", "先迁 1～2 个高价值看板"),
            ]
        ),
        sec_exercise("写一份面向你们团队的国产 BI 选型对比表（至少 5 维）。", 2),
    ],
    2,
    25,
    ["国产BI", "选型"],
)

# --- SQL ---
SQL_BASIC = {
    "SELECT": (
        "能写出投影、别名与去重的 SELECT，并理解结果集",
        "```sql\nSELECT order_id, amount AS gmv\nFROM orders;\n```",
        "查询 orders 中已支付订单的 order_id 与 amount，amount 别名为 gmv。",
    ),
    "WHERE": (
        "能组合多条件过滤，正确处理 NULL 与区间",
        "```sql\nSELECT *\nFROM orders\nWHERE status = 'paid' AND amount >= 100;\n```",
        "查出 status=paid 且 amount≥100 的订单。",
    ),
    "ORDER BY": (
        "能按一列或多列排序，并理解与 LIMIT 的关系",
        "```sql\nSELECT *\nFROM orders\nORDER BY created_at DESC, amount DESC;\n```",
        "按创建时间倒序、金额倒序列出订单。",
    ),
    "LIMIT": (
        "能用 LIMIT/OFFSET 做分页或 TopN（注意必须有 ORDER BY）",
        "```sql\nSELECT *\nFROM orders\nORDER BY amount DESC\nLIMIT 10;\n```",
        "取出金额最高的 10 笔订单。",
    ),
}

for title, (goal, syntax, ex) in SQL_BASIC.items():
    put(
        f"SQL.基础查询.{title}",
        goal,
        [
            sec_concept(f"{title} 是什么", f"{title} 是 SQL 基础查询的核心子句之一。"),
            sec_syntax("语法示例", syntax),
            sec_steps(
                "练习步骤",
                [
                    "在样例库执行语法示例",
                    "改写条件/列观察结果变化",
                    "记录易错点",
                ],
            ),
            sec_mistakes(
                [
                    ("SELECT * 滥用", "生产查询显式列名"),
                    ("LIMIT 无 ORDER BY", "「前 N」无定义，先排序"),
                ]
            ),
            sec_exercise(ex, 1),
        ],
        1,
        20,
        ["SQL", "基础查询", title],
    )

put(
    "SQL.多表操作.JOIN",
    "能正确使用 INNER/LEFT JOIN，并避免粒度爆炸",
    [
        sec_concept("JOIN", "按键把多表横向拼接；类型决定匹配不上的行如何保留。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT o.order_id, u.user_name\nFROM orders o\nJOIN users u ON u.user_id = o.user_id;\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "先确认两表粒度与键",
                "写 INNER JOIN 验证匹配行",
                "改 LEFT JOIN 观察未匹配",
                "对一对多先聚合再连接防爆炸",
            ],
        ),
        sec_mistakes(
            [
                ("明细 JOIN 后再 SUM 头表金额翻倍", "先按键聚合一侧"),
                ("ON 写成 WHERE 导致 LEFT 变 INNER", "过滤左表请放 ON/慎用"),
            ]
        ),
        sec_exercise("关联 users 与 orders，统计每用户已支付订单数与 GMV。", 2),
    ],
    2,
    30,
    ["SQL", "JOIN"],
)

put(
    "SQL.多表操作.子查询",
    "能写标量子查询、IN/EXISTS 与派生表，并判断何时改 JOIN",
    [
        sec_concept("子查询", "查询嵌套查询；可用于过滤、计算列或派生表。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT *\nFROM orders\nWHERE user_id IN (\n  SELECT user_id FROM users WHERE city = '上海'\n);\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "用 IN 子查询过滤上海用户订单",
                "改写为 JOIN 对比计划",
                "试用 EXISTS 判断半连接场景",
            ],
        ),
        sec_mistakes(
            [
                ("相关子查询无索引导致慢", "检查关联键与执行计划"),
                ("子查询返回多行用于标量位置", "用聚合或 IN/EXISTS"),
            ]
        ),
        sec_exercise("找出下单次数高于全体平均的用户。", 2),
    ],
    2,
    30,
    ["SQL", "子查询"],
)

put(
    "SQL.多表操作.UNION",
    "能区分 UNION 与 UNION ALL，并保证列类型对齐",
    [
        sec_concept("UNION", "纵向合并结果集；UNION 去重，UNION ALL 保留重复。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT user_id FROM orders WHERE status='paid'\nUNION ALL\nSELECT user_id FROM orders WHERE status='cancelled';\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "合并两段查询并对比 UNION/UNION ALL 行数",
                "检查列数与类型一致",
            ],
        ),
        sec_mistakes(
            [
                ("列顺序不一致导致错位", "显式列并注释对齐"),
                ("大结果误用 UNION 去重很慢", "能 ALL 则 ALL"),
            ]
        ),
        sec_exercise("合并「已支付用户」与「取消用户」列表，分别用 UNION 与 UNION ALL。", 2),
    ],
    2,
    20,
    ["SQL", "UNION"],
)

put(
    "SQL.聚合分析.GROUP BY",
    "能按键聚合指标，理解 SELECT 与 GROUP BY 对齐规则",
    [
        sec_concept("GROUP BY", "按键折叠行，并对组内做 COUNT/SUM/AVG 等。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT user_id, COUNT(*) cnt, SUM(amount) gmv\nFROM orders\nWHERE status='paid'\nGROUP BY user_id;\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "按 user_id 聚合订单数与 GMV",
                "增加 status 维度观察分组变化",
            ],
        ),
        sec_mistakes(
            [
                ("SELECT 非聚合列未出现在 GROUP BY", "严格模式会报错"),
                ("COUNT(amount) 当订单数", "订单数用 COUNT(*)"),
            ]
        ),
        sec_exercise("按 status 分组统计订单数与 SUM(COALESCE(amount,0))。", 2),
    ],
    2,
    25,
    ["SQL", "GROUP BY"],
)

put(
    "SQL.聚合分析.HAVING",
    "能区分 WHERE 与 HAVING，对聚合结果再过滤",
    [
        sec_concept("HAVING", "分组后过滤；WHERE 在分组前过滤明细。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT user_id, SUM(amount) gmv\nFROM orders\nWHERE status='paid'\nGROUP BY user_id\nHAVING SUM(amount) >= 200;\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "先 GROUP BY 出每用户 GMV",
                "用 HAVING 留下 GMV≥200 的用户",
                "对比把条件写在 WHERE 是否可行",
            ],
        ),
        sec_mistakes(
            [
                ("在 WHERE 里写 SUM(amount)", "聚合条件用 HAVING"),
                ("HAVING 过滤非聚合明细列", "先弄清执行顺序"),
            ]
        ),
        sec_exercise("找出支付订单数≥2 的用户。", 2),
    ],
    2,
    25,
    ["SQL", "HAVING"],
)

put(
    "SQL.聚合分析.窗口函数",
    "能使用 ROW_NUMBER/SUM() OVER 做排序编号与累计，不塌缩行",
    [
        sec_concept("窗口函数", "在保留明细行的同时做分区排序或累计聚合。"),
        sec_syntax(
            "语法示例",
            "```sql\nSELECT order_id, user_id, amount,\n       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) AS rn,\n       SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) AS running_gmv\nFROM orders;\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "为每用户订单按时间编号",
                "计算每用户累计 GMV",
                "对比 GROUP BY 的行数差异",
            ],
        ),
        sec_mistakes(
            [
                ("窗口与 GROUP BY 混用导致报错", "先派生表再聚合或分开写"),
                ("FRAME 子句默认误解", "查引擎默认窗口范围"),
            ]
        ),
        sec_exercise("取出每用户最近一笔订单（可用 ROW_NUMBER）。", 3),
    ],
    3,
    35,
    ["SQL", "窗口函数"],
)

put(
    "SQL.数据定义",
    "能编写基础 DDL：建表、约束与必要的 ALTER",
    [
        sec_concept("DDL", "定义库对象结构：表、列、主键、索引等。"),
        sec_syntax(
            "语法示例",
            "```sql\nCREATE TABLE user_tags (\n  user_id INT NOT NULL,\n  tag VARCHAR(32) NOT NULL,\n  PRIMARY KEY (user_id, tag)\n);\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "设计一张练习表并创建",
                "加入主键/非空约束",
                "插入合法与非法数据验证约束",
            ],
        ),
        sec_mistakes(
            [
                ("金额用 FLOAT", "用 DECIMAL"),
                ("无主键导致重复行", "明确业务键或代理键"),
            ]
        ),
        sec_exercise("创建 daily_gmv(dt DATE PRIMARY KEY, gmv DECIMAL(12,2)) 并从 orders 灌入一天。", 2),
    ],
    2,
    30,
    ["SQL", "DDL"],
)

put(
    "SQL.性能优化",
    "能读基础执行计划、设计合适索引，并避免常见慢查询写法",
    [
        sec_concept("性能优化", "从过滤、连接、索引与结果集大小入手。"),
        sec_syntax(
            "语法示例",
            "```sql\nEXPLAIN\nSELECT *\nFROM orders\nWHERE user_id = 1 AND status = 'paid';\n```",
        ),
        sec_steps(
            "优化步骤",
            [
                "对慢 SQL 做 EXPLAIN",
                "检查是否全表扫描",
                "为高频过滤/连接键加索引",
                "避免在索引列上套函数",
            ],
        ),
        sec_mistakes(
            [
                ("盲目加索引", "先看选择性与写入成本"),
                ("SELECT * 拉宽表", "只取需要列"),
            ]
        ),
        sec_exercise("给「按 user_id+status 查订单」设计索引并说明理由。", 3),
    ],
    3,
    35,
    ["SQL", "性能"],
)

put(
    "SQL.事务与安全",
    "理解事务 ACID 与隔离级别直觉，并会做基础权限控制",
    [
        sec_concept("事务与安全", "事务保证一致性；权限与注入防护保证安全。"),
        sec_syntax(
            "语法示例",
            "```sql\nSTART TRANSACTION;\nUPDATE accounts SET bal = bal - 100 WHERE id = 1;\nUPDATE accounts SET bal = bal + 100 WHERE id = 2;\nCOMMIT;\n```",
        ),
        sec_steps(
            "练习步骤",
            [
                "在事务中做两步更新并提交/回滚",
                "阅读隔离级别与脏读/不可重复读概念",
                "用参数化查询避免注入",
            ],
        ),
        sec_mistakes(
            [
                ("长事务锁表", "缩小事务范围"),
                ("应用层拼接 SQL", "使用绑定参数"),
            ]
        ),
        sec_exercise("描述转账场景如何用事务保证两边余额一致。", 2),
    ],
    2,
    30,
    ["SQL", "事务", "安全"],
)


# ---------------------------------------------------------------------------
# Build pages + navigation
# ---------------------------------------------------------------------------

def build_domain(tree):
    nodes = walk(tree)
    by_id = {n["id"]: n for n in nodes}
    leaves = [n for n in nodes if n["is_leaf"]]
    # edges: parent-child + sibling sequence + prerequisites heuristically
    edges = []
    for n in nodes:
        if n["parent_id"]:
            edges.append({"from": n["parent_id"], "to": n["id"], "type": "parent"})
        for i, cid in enumerate(n["child_ids"]):
            if i + 1 < len(n["child_ids"]):
                edges.append({"from": cid, "to": n["child_ids"][i + 1], "type": "next_sibling"})

    pages = []
    for i, leaf in enumerate(leaves):
        nid = leaf["id"]
        if nid not in CONTENT:
            raise SystemExit(f"missing content for {nid}")
        c = CONTENT[nid]
        prev_id = leaves[i - 1]["id"] if i > 0 else None
        next_id = leaves[i + 1]["id"] if i + 1 < len(leaves) else None
        # related: prev sibling as prerequisite when same parent; else previous leaf
        related = []
        parent = by_id.get(leaf["parent_id"])
        if parent:
            sibs = parent["child_ids"]
            # only leaf siblings for related
            leaf_sibs = [s for s in sibs if by_id[s]["is_leaf"]]
            if nid in leaf_sibs:
                si = leaf_sibs.index(nid)
                if si > 0:
                    related.append(
                        {
                            "node_id": leaf_sibs[si - 1],
                            "relation": "prerequisite",
                            "label": f"前置：{by_id[leaf_sibs[si - 1]]['title']}",
                        }
                    )
                if si + 1 < len(leaf_sibs):
                    related.append(
                        {
                            "node_id": leaf_sibs[si + 1],
                            "relation": "related",
                            "label": f"相关：{by_id[leaf_sibs[si + 1]]['title']}",
                        }
                    )
        # LOD parent link
        if leaf["lod"] and leaf["parent_id"]:
            related.insert(
                0,
                {
                    "node_id": leaf["parent_id"],
                    "relation": "parent",
                    "label": "上级：LOD",
                },
            )

        page = {
            "tutorial_id": nid,
            "node_id": nid,
            "title": leaf["title"],
            "domain_id": leaf["domain"],
            "path": leaf["path"],
            "content": {
                "learning_goal": c["learning_goal"],
                "sections": c["sections"],
            },
            "navigation": {
                "parent": leaf["parent_id"],
                "prev": prev_id,
                "next": next_id,
                "related": related,
            },
            "metadata": {
                "difficulty": c["difficulty"],
                "estimated_minutes": c["estimated_minutes"],
                "tags": c["tags"],
                "last_updated": TODAY,
            },
        }
        pages.append(page)
    return pages, leaves, nodes, edges


# ---------------------------------------------------------------------------
# Migration maps
# ---------------------------------------------------------------------------

MIGRATION_MAP = [
    {"old_id": "tutorial/join", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "tutorial/inner-join", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "tutorial/left-join", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "tutorial/subquery", "new_id": "SQL.多表操作.子查询"},
    {"old_id": "tutorial/union", "new_id": "SQL.多表操作.UNION"},
    {"old_id": "tutorial/select", "new_id": "SQL.基础查询.SELECT"},
    {"old_id": "tutorial/where", "new_id": "SQL.基础查询.WHERE"},
    {"old_id": "tutorial/order-by", "new_id": "SQL.基础查询.ORDER BY"},
    {"old_id": "tutorial/limit", "new_id": "SQL.基础查询.LIMIT"},
    {"old_id": "tutorial/group-by", "new_id": "SQL.聚合分析.GROUP BY"},
    {"old_id": "tutorial/having", "new_id": "SQL.聚合分析.HAVING"},
    {"old_id": "tutorial/window", "new_id": "SQL.聚合分析.窗口函数"},
    {"old_id": "tutorial/window-function", "new_id": "SQL.聚合分析.窗口函数"},
    {"old_id": "tutorial/ddl", "new_id": "SQL.数据定义"},
    {"old_id": "tutorial/create-table", "new_id": "SQL.数据定义"},
    {"old_id": "tutorial/index", "new_id": "SQL.性能优化"},
    {"old_id": "tutorial/explain", "new_id": "SQL.性能优化"},
    {"old_id": "tutorial/transaction", "new_id": "SQL.事务与安全"},
    {"old_id": "tutorial/lod", "new_id": "BI.Tableau.计算.LOD.FIXED"},
    {"old_id": "tutorial/lod-fixed", "new_id": "BI.Tableau.计算.LOD.FIXED"},
    {"old_id": "tutorial/lod-include", "new_id": "BI.Tableau.计算.LOD.INCLUDE"},
    {"old_id": "tutorial/lod-exclude", "new_id": "BI.Tableau.计算.LOD.EXCLUDE"},
    {"old_id": "tutorial/ring-chart", "new_id": "BI.Tableau.图表制作.环形图"},
    {"old_id": "tutorial/donut-chart", "new_id": "BI.Tableau.图表制作.环形图"},
    {"old_id": "tutorial/dual-axis", "new_id": "BI.Tableau.图表制作.双轴组合图"},
    {"old_id": "tutorial/bar-chart", "new_id": "BI.Tableau.图表制作.柱状图"},
    {"old_id": "tutorial/line-chart", "new_id": "BI.Tableau.图表制作.折线图"},
    {"old_id": "tutorial/pie-chart", "new_id": "BI.Tableau.图表制作.饼图"},
    {"old_id": "tutorial/heatmap", "new_id": "BI.Tableau.图表制作.热力图"},
    {"old_id": "tutorial/tableau-calc", "new_id": "BI.Tableau.计算.基础计算"},
    {"old_id": "tutorial/table-calc", "new_id": "BI.Tableau.计算.表计算"},
    {"old_id": "tutorial/tableau-dashboard", "new_id": "BI.Tableau.仪表板"},
    {"old_id": "tutorial/tableau-filter", "new_id": "BI.Tableau.筛选与交互"},
    {"old_id": "tutorial/tableau-performance", "new_id": "BI.Tableau.性能优化"},
    {"old_id": "tutorial/power-bi", "new_id": "BI.Power BI"},
    {"old_id": "tutorial/finebi", "new_id": "BI.国产 BI"},
    # platform legacy leaf ids
    {"old_id": "sql-select", "new_id": "SQL.基础查询.SELECT"},
    {"old_id": "sql-L1-N1", "new_id": "SQL.基础查询.SELECT"},
    {"old_id": "sql-L1-N2", "new_id": "SQL.基础查询.WHERE"},
    {"old_id": "sql-L1-N3", "new_id": "SQL.基础查询.ORDER BY"},
    {"old_id": "sql-L1-N4", "new_id": "SQL.基础查询.LIMIT"},
    {"old_id": "sql-L2-N2", "new_id": "SQL.聚合分析.GROUP BY"},
    {"old_id": "sql-L2-N3", "new_id": "SQL.聚合分析.HAVING"},
    {"old_id": "sql-L3-N1", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "sql-L3-N5", "new_id": "SQL.多表操作.子查询"},
    {"old_id": "sql-L3-N7", "new_id": "SQL.多表操作.UNION"},
    {"old_id": "sql-L4-N1", "new_id": "SQL.聚合分析.窗口函数"},
    {"old_id": "sql-L4-N2", "new_id": "SQL.聚合分析.窗口函数"},
    {"old_id": "sql-inner-join", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "sql-left-join", "new_id": "SQL.多表操作.JOIN"},
    {"old_id": "sql-group-by", "new_id": "SQL.聚合分析.GROUP BY"},
    {"old_id": "sql-having", "new_id": "SQL.聚合分析.HAVING"},
    {"old_id": "sql-union", "new_id": "SQL.多表操作.UNION"},
    {"old_id": "sql-row-number", "new_id": "SQL.聚合分析.窗口函数"},
    {"old_id": "bi-tab-图表制作-环形图", "new_id": "BI.Tableau.图表制作.环形图"},
    {"old_id": "bi-tab-图表制作-双轴组合图-柱状-折线", "new_id": "BI.Tableau.图表制作.双轴组合图"},
    {"old_id": "bi-tab-图表制作-柱状图", "new_id": "BI.Tableau.图表制作.柱状图"},
    {"old_id": "bi-tab-图表制作-折线图", "new_id": "BI.Tableau.图表制作.折线图"},
    {"old_id": "bi-tab-图表制作-饼图", "new_id": "BI.Tableau.图表制作.饼图"},
    {"old_id": "bi-tab-图表制作-热力图", "new_id": "BI.Tableau.图表制作.热力图"},
    {"old_id": "bi-tab-LOD-表达式-FIXED", "new_id": "BI.Tableau.计算.LOD.FIXED"},
    {"old_id": "bi-tab-LOD-表达式-INCLUDE", "new_id": "BI.Tableau.计算.LOD.INCLUDE"},
    {"old_id": "bi-tab-LOD-表达式-EXCLUDE", "new_id": "BI.Tableau.计算.LOD.EXCLUDE"},
    {"old_id": "bi-tab-LOD-表达式-LOD-是什么", "new_id": "BI.Tableau.计算.LOD.FIXED"},
    {"old_id": "bi-tool-pbi", "new_id": "BI.Power BI"},
    {"old_id": "bi-tool-fine", "new_id": "BI.国产 BI"},
]

SPLIT_MAP = [
    {
        "old_id": "tutorial/join-complete-guide",
        "new_ids": [
            "SQL.多表操作.JOIN",
            "SQL.多表操作.子查询",
            "SQL.多表操作.UNION",
        ],
        "note": "旧「JOIN 完全指南」拆成多表操作三篇",
    },
    {
        "old_id": "tutorial/sql-basics",
        "new_ids": [
            "SQL.基础查询.SELECT",
            "SQL.基础查询.WHERE",
            "SQL.基础查询.ORDER BY",
            "SQL.基础查询.LIMIT",
        ],
        "note": "旧 SQL 基础合集拆成四篇",
    },
    {
        "old_id": "tutorial/aggregation-guide",
        "new_ids": [
            "SQL.聚合分析.GROUP BY",
            "SQL.聚合分析.HAVING",
            "SQL.聚合分析.窗口函数",
        ],
        "note": "旧聚合指南拆成三篇",
    },
    {
        "old_id": "tutorial/lod-complete-guide",
        "new_ids": [
            "BI.Tableau.计算.LOD.FIXED",
            "BI.Tableau.计算.LOD.INCLUDE",
            "BI.Tableau.计算.LOD.EXCLUDE",
        ],
        "note": "旧 LOD 长文拆成 FIXED/INCLUDE/EXCLUDE",
    },
    {
        "old_id": "tutorial/tableau-charts-pack",
        "new_ids": [
            "BI.Tableau.图表制作.柱状图",
            "BI.Tableau.图表制作.折线图",
            "BI.Tableau.图表制作.饼图",
            "BI.Tableau.图表制作.环形图",
            "BI.Tableau.图表制作.双轴组合图",
            "BI.Tableau.图表制作.热力图",
        ],
        "note": "旧图表合集拆成六篇单图教程",
    },
    {
        "old_id": "sql-L3",
        "new_ids": [
            "SQL.多表操作.JOIN",
            "SQL.多表操作.子查询",
            "SQL.多表操作.UNION",
        ],
        "note": "旧 L3 多表层映射到新「多表操作」三叶",
    },
]


def sections_to_md(page: dict) -> str:
    c = page["content"]
    lines = [f"### 课前\n\n- **目标**：{c['learning_goal']}\n"]
    for s in c["sections"]:
        t = s.get("type")
        if t == "concept":
            lines.append(f"### {s['title']}\n\n{s['body']}\n")
        elif t == "syntax":
            lines.append(f"### {s['title']}\n\n{s['body']}\n")
        elif t == "scenario":
            lines.append(f"### {s['title']}\n\n{s['body']}\n")
        elif t == "steps":
            lines.append(f"### {s['title']}\n")
            for i, it in enumerate(s["items"], 1):
                lines.append(f"{i}. {it}")
            lines.append("")
        elif t == "mistakes":
            lines.append("### 常见错误\n\n| 错法 | 纠正 |\n|---|---|")
            for it in s["items"]:
                lines.append(f"| {it['mistake']} | {it['fix']} |")
            lines.append("")
        elif t == "exercise":
            lines.append(f"### 动手\n\n{s['question']}\n")
    nav = page["navigation"]
    lines.append(
        f"### 导航\n\n- 上级：`{nav['parent']}`\n- 上一节：`{nav['prev']}`\n- 下一节：`{nav['next']}`\n"
    )
    return "\n".join(lines)



def _lesson_level_for(nid: str, path) -> str:
    """Assign ? / ?? / ??? so 初级/中级/高级深度过滤有内容可学."""
    s = nid or ""
    if s.startswith("SQL.基础查询") or s == "SQL":
        return "?"
    if s.startswith("SQL.多表操作") or s.startswith("SQL.聚合分析"):
        return "??"
    if s in ("SQL.数据定义", "SQL.性能优化", "SQL.事务与安全"):
        return "???"
    if s in ("BI.Tableau.入门准备", "BI.Tableau.数据准备", "BI.Tableau") or s == "BI":
        return "?"
    if "图表制作" in s:
        return "?" if not any(x in s for x in ("双轴", "热力")) else "??"
    if "计算.基础计算" in s:
        return "?"
    if "计算.表计算" in s or s in ("BI.Tableau.筛选与交互", "BI.Tableau.仪表板", "BI.Power BI", "BI.国产 BI"):
        return "??"
    if ".LOD" in s or s in ("BI.Tableau.性能优化", "BI.Tableau.实战案例"):
        return "???"
    if "计算" in s and "BI.Tableau" in s:
        return "??"
    return "??"

def tree_to_lesson_json(tree_title: str, root_title: str, pages_by_id: dict, nodes: list):
    """Build KG_TREES-compatible lesson tree from graph nodes + tutorial markdown."""
    by_id = {n["id"]: n for n in nodes}

    def build(nid: str):
        n = by_id[nid]
        kids = [build(cid) for cid in n["child_ids"]]
        page = pages_by_id.get(nid)
        if n["is_leaf"]:
            content = sections_to_md(page) if page else f"### {n['title']}\n\n内容建设中。\n"
        else:
            titles = " · ".join(by_id[c]["title"] for c in n["child_ids"])
            content = (
                f"### {n['title']} · 章节导读\n\n"
                f"**路径**：{' / '.join(n['path'])}\n\n"
                f"**本章节点**：{titles}\n\n"
                f"点下方节点继续学习。\n"
            )
        node = {
            "id": nid,
            "title": n["title"],
            "level": _lesson_level_for(nid, n.get("path") or []),
            "content": content,
            "children": kids,
        }
        if kids and all(by_id[c]["is_leaf"] for c in n["child_ids"]):
            node["lessonParent"] = True
        return node

    root_id = tree_title  # BI or SQL
    root = build(root_id)
    root["id"] = f"{root_title}-root" if False else f"{root_title.lower()}-root"
    # keep human root id pattern: sql-root / bi-root
    root["id"] = "sql-root" if root_title == "SQL" else "bi-root"
    root["title"] = root_title
    root["source"] = "tutorials_v2_graph"
    return root


def validate(pages, leaves):
    leaf_ids = {l["id"] for l in leaves}
    page_ids = {p["node_id"] for p in pages}
    assert leaf_ids == page_ids, (leaf_ids - page_ids, page_ids - leaf_ids)
    for p in pages:
        assert p["tutorial_id"] == p["node_id"]
        assert p["content"]["learning_goal"]
        assert any(s["type"] == "exercise" for s in p["content"]["sections"])
        # chart must have steps
        if p["node_id"].startswith("BI.Tableau.图表制作.") and p["node_id"].count(".") == 3:
            assert any(s["type"] == "steps" for s in p["content"]["sections"]), p["node_id"]
        # LOD must have syntax + scenario
        if ".LOD." in p["node_id"]:
            types = {s["type"] for s in p["content"]["sections"]}
            assert "syntax" in types and "scenario" in types, p["node_id"]
        # first/last may have None prev/next — user asked every page has prev/next;
        # use null only at ends; checklist says 都有 — for ends we keep null OR self-skip.
        # Spec: 每篇教程都有 navigation.prev / next keys (can be null at ends)
        assert "prev" in p["navigation"] and "next" in p["navigation"]
        assert p["navigation"]["parent"]


def main():
    bi_pages, bi_leaves, bi_nodes, _ = build_domain(BI_TREE)
    sql_pages, sql_leaves, sql_nodes, _ = build_domain(SQL_TREE)
    pages = bi_pages + sql_pages
    leaves = bi_leaves + sql_leaves
    validate(pages, leaves)

    payload = {
        "tutorials": {
            "meta": {
                "total_tutorials": len(pages),
                "domains": ["BI", "SQL"],
                "bi_count": len(bi_pages),
                "sql_count": len(sql_pages),
                "generated_on": TODAY,
            },
            "pages": pages,
        },
        "migration": {
            "migration_map": MIGRATION_MAP,
            "split_map": SPLIT_MAP,
        },
        "graph_index": {
            "bi_leaves": [l["id"] for l in bi_leaves],
            "sql_leaves": [l["id"] for l in sql_leaves],
        },
    }

    # validate JSON roundtrip
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    json.loads(text)

    out_json = OUT / "tutorials_bi_sql_v2.json"
    out_json.write_text(text, encoding="utf-8")
    (OUT / "tutorials_bi_sql_v2.min.json").write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    # Sync lesson trees
    pages_by_id = {p["node_id"]: p for p in pages}
    sql_lesson = tree_to_lesson_json("SQL", "SQL", pages_by_id, sql_nodes)
    bi_lesson = tree_to_lesson_json("BI", "BI", pages_by_id, bi_nodes)
    lessons_dir = ROOT / "_gen" / "lessons"
    # backup once
    for name, obj in [("sql", sql_lesson), ("bi", bi_lesson)]:
        path = lessons_dir / f"{name}.json"
        bak = lessons_dir / f"{name}.json.pre_v2_graph.bak"
        if path.exists() and not bak.exists():
            bak.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
        path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
        print("wrote lesson tree", path)

    # kg-data copies
    for kg_dir in [
        ROOT / "kg-data",
        Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
        Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
    ]:
        if not kg_dir.exists():
            continue
        for name, obj in [("sql", sql_lesson), ("bi", bi_lesson)]:
            (kg_dir / f"{name}.json").write_text(
                json.dumps(obj, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
            )
        print("synced kg-data", kg_dir)

    # summary + checklist
    summary = f"""# 教程同步摘要（BI + SQL v2）

## 规模
- **教程总数**：{len(pages)}
- **BI**：{len(bi_pages)} 篇
- **SQL**：{len(sql_pages)} 篇

## BI 叶子（{len(bi_leaves)}）
{chr(10).join(f'- `{x}`' for x in [l['id'] for l in bi_leaves])}

## SQL 叶子（{len(sql_leaves)}）
{chr(10).join(f'- `{x}`' for x in [l['id'] for l in sql_leaves])}

## 迁移映射（节选）
| 旧 ID | 新 ID |
|---|---|
{chr(10).join(f'| `{m["old_id"]}` | `{m["new_id"]}` |' for m in MIGRATION_MAP[:15])}
| … | 共 {len(MIGRATION_MAP)} 条，见 JSON |

## 拆分映射
{chr(10).join(f'- `{s["old_id"]}` → {len(s["new_ids"])} 篇：' + ', '.join(f'`{i}`' for i in s['new_ids']) for s in SPLIT_MAP)}

## 文件
- `{out_json}`
- `_gen/lessons/sql.json` / `bi.json`（已同步）
- `kg-data/sql.json` / `bi.json`（已同步）
"""
    (OUT / "SUMMARY.md").write_text(summary, encoding="utf-8")

    checklist = """# 质量校验清单

- [x] 每个图谱叶子节点都有对应教程
- [x] tutorial_id 等于 node_id
- [x] 每篇教程都有 navigation.prev / next 字段（首尾可为 null）
- [x] 每篇教程都有 exercise
- [x] 图表类教程有 steps
- [x] LOD 教程含 syntax + scenario
- [x] 迁移映射覆盖常见旧教程与平台旧叶 ID
- [x] JSON 可被 JSON.parse() / json.loads 解析
- [x] 课树 sql.json / bi.json 已与新图谱对齐
"""
    (OUT / "CHECKLIST.md").write_text(checklist, encoding="utf-8")

    print("OK tutorials", len(pages), "bi", len(bi_pages), "sql", len(sql_pages))
    print("wrote", out_json)


if __name__ == "__main__":
    main()
