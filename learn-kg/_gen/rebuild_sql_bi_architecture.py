# -*- coding: utf-8 -*-
"""Rebuild SQL & BI knowledge trees per learning-path architecture spec."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(r"D:\cursor\多行业数据平台\portfolio")
OUT_ARCH = ROOT / "pages" / "kg-data" / "sql-bi-architecture.json"
OUT_SUMMARY = ROOT / "pages" / "kg-data" / "sql-bi-architecture-SUMMARY.md"
KG = ROOT / "pages" / "kg-data"

nodes_flat: list[dict] = []
pages: list[dict] = []


def nid(*parts: str) -> str:
    return ".".join(parts)


def page_url(node_id: str) -> str:
    return f"/knowledge/{node_id}"


def md_from_page(p: dict) -> str:
    c = p["content"]
    lines = [
        f"### {p['title']}",
        "",
        f"**学习目标**：{c.get('learning_goal', '')}",
        "",
        "### 概念",
        "",
    ]
    for x in c.get("concept") or []:
        lines.append(f"- {x}")
    if c.get("syntax"):
        lines += ["", "### 语法", "", "```", c["syntax"], "```"]
    if c.get("scenario"):
        lines += ["", "### 场景", "", c["scenario"]]
    if c.get("how_to_make"):
        lines += ["", "### 制作步骤（how_to_make）", ""]
        for i, s in enumerate(c["how_to_make"], 1):
            lines.append(f"{i}. {s}")
    if c.get("common_mistakes"):
        lines += ["", "### 常见坑", "", "| 错法 | 说明 |", "|---|---|"]
        for m in c["common_mistakes"]:
            lines.append(f"| {m.get('mistake','')} | {m.get('explanation','')} |")
    if c.get("exercises"):
        lines += ["", "### 练习", ""]
        for i, e in enumerate(c["exercises"], 1):
            lines.append(f"{i}. （难度 {e.get('difficulty',2)}）{e.get('question','')}")
    nav = p.get("navigation") or {}
    if nav.get("related_links"):
        lines += ["", "### 相关", ""]
        for r in nav["related_links"]:
            lines.append(f"- {r.get('label') or r.get('node_id')}")
    return "\n".join(lines) + "\n"


def add_leaf(
    domain_id: str,
    path: list[str],
    node_id: str,
    title: str,
    parent_id: str,
    summary: str,
    content: dict,
    difficulty: int = 2,
    minutes: int = 20,
    tags: list | None = None,
    related: list | None = None,
    level: str = "??",
):
    depth = len(path) - 1
    page = {
        "page_id": node_id,
        "node_id": node_id,
        "title": title,
        "domain_id": domain_id,
        "content": content,
        "navigation": {
            "back_to_graph": f"/graph?highlight={node_id}",
            "parent": parent_id,
            "related_links": related or [],
        },
    }
    pages.append(page)
    nodes_flat.append(
        {
            "node_id": node_id,
            "domain_id": domain_id,
            "path": path,
            "depth": depth,
            "type": "concept",
            "title": title,
            "summary": summary,
            "is_leaf": True,
            "page_url": page_url(node_id),
            "parent_id": parent_id,
            "difficulty": difficulty,
            "estimated_minutes": minutes,
            "tags": tags or [domain_id],
        }
    )
    return {
        "node_id": node_id,
        "title": title,
        "type": "concept",
        "is_leaf": True,
        "page_url": page_url(node_id),
        "summary": summary,
        "difficulty": difficulty,
        "estimated_minutes": minutes,
        # platform fields
        "id": node_id.replace(".", "-").replace(" ", "-"),
        "level": level,
        "content": md_from_page(page),
        "children": [],
    }


def module(node_id: str, title: str, children: list, intro: str, level: str = "??"):
    nodes_flat.append(
        {
            "node_id": node_id,
            "domain_id": node_id.split(".")[0],
            "path": node_id.split("."),
            "depth": node_id.count("."),
            "type": "module",
            "title": title,
            "summary": intro,
            "is_leaf": False,
            "page_url": None,
            "parent_id": ".".join(node_id.split(".")[:-1]) if "." in node_id else None,
            "difficulty": None,
            "estimated_minutes": None,
            "tags": [node_id.split(".")[0], "module"],
        }
    )
    leaf_titles = " · ".join(c["title"] for c in children)
    return {
        "node_id": node_id,
        "title": title,
        "type": "module",
        "is_leaf": False,
        "children": children,
        "id": node_id.replace(".", "-").replace(" ", "-"),
        "level": level,
        "content": f"### {title}\n\n{intro}\n\n**本模块知识点**：{leaf_titles}\n",
        "lessonParent": True,
    }


def tool(node_id: str, title: str, children: list, intro: str, level: str = "?"):
    nodes_flat.append(
        {
            "node_id": node_id,
            "domain_id": node_id.split(".")[0],
            "path": node_id.split("."),
            "depth": node_id.count("."),
            "type": "tool",
            "title": title,
            "summary": intro,
            "is_leaf": False,
            "page_url": None,
            "parent_id": node_id.split(".")[0],
            "difficulty": None,
            "estimated_minutes": None,
            "tags": [node_id.split(".")[0], "tool"],
        }
    )
    return {
        "node_id": node_id,
        "title": title,
        "type": "tool",
        "is_leaf": False,
        "children": children,
        "id": node_id.replace(".", "-").replace(" ", "-"),
        "level": level,
        "content": f"### {title}\n\n{intro}\n",
    }


def container(node_id: str, title: str, children: list, intro: str, typ: str = "concept_group", level: str = "???"):
    """Non-leaf concept group such as LOD."""
    nodes_flat.append(
        {
            "node_id": node_id,
            "domain_id": node_id.split(".")[0],
            "path": node_id.split("."),
            "depth": node_id.count("."),
            "type": typ,
            "title": title,
            "summary": intro,
            "is_leaf": False,
            "page_url": None,
            "parent_id": ".".join(node_id.split(".")[:-1]),
            "difficulty": None,
            "estimated_minutes": None,
            "tags": [node_id.split(".")[0]],
        }
    )
    return {
        "node_id": node_id,
        "title": title,
        "type": typ,
        "is_leaf": False,
        "children": children,
        "id": node_id.replace(".", "-").replace(" ", "-"),
        "level": level,
        "content": f"### {title}\n\n{intro}\n",
        "lessonParent": True,
    }


# ───────────────────────── SQL ─────────────────────────

def build_sql():
    D = "SQL"

    def L(mod, title, summary, content, **kw):
        mid = nid(D, mod)
        return add_leaf(D, [D, mod, title], nid(D, mod, title), title, mid, summary, content, tags=["SQL", mod], **kw)

    basic = module(
        nid(D, "基础查询"),
        "基础查询",
        [
            L("基础查询", "SELECT", "投影列与表达式", {
                "learning_goal": "能写出带别名与表达式的 SELECT",
                "concept": ["SELECT 指定要返回的列或表达式", "可用 AS 起别名", "SELECT * 仅适合探索"],
                "how_to_make": ["写出 FROM 表", "列出需要的列", "必要时加表达式与别名", "用 LIMIT 抽样验数"],
                "common_mistakes": [{"mistake": "滥用 SELECT *", "explanation": "生产查询应显式列清单"}],
                "exercises": [{"question": "从 orders 选出 order_id, user_id, amount 并起别名", "difficulty": 1}],
            }, difficulty=1, minutes=15, level="?"),
            L("基础查询", "WHERE", "行过滤", {
                "learning_goal": "能用 WHERE 做等值、范围与空值过滤",
                "concept": ["WHERE 在聚合前过滤行", "注意 NULL 要用 IS NULL", "AND/OR 注意括号"],
                "how_to_make": ["确定过滤字段", "写比较条件", "组合 AND/OR", "用抽样核对行数"],
                "common_mistakes": [{"mistake": "用 = NULL", "explanation": "应写 IS NULL / IS NOT NULL"}],
                "exercises": [{"question": "筛选 status='paid' 且 amount>=100 的订单", "difficulty": 1}],
            }, difficulty=1, minutes=20, level="?"),
            L("基础查询", "ORDER BY", "排序", {
                "learning_goal": "能按单列/多列升降序排序",
                "concept": ["ORDER BY 控制结果顺序", "默认 ASC", "可多键排序"],
                "how_to_make": ["选定排序键", "指定 ASC/DESC", "必要时二次排序键", "与 LIMIT 组合取 TopN"],
                "common_mistakes": [{"mistake": "排序列不在 SELECT 却期望稳定输出", "explanation": "部分引擎允许，但应显式写清"}],
                "exercises": [{"question": "按 amount 降序取前 10 单", "difficulty": 1}],
            }, difficulty=1, minutes=15, level="?"),
            L("基础查询", "LIMIT", "限制返回行数", {
                "learning_goal": "会用 LIMIT/OFFSET 做分页与抽样",
                "concept": ["LIMIT 限制行数", "OFFSET 跳过行", "深分页有性能问题"],
                "how_to_make": ["先 ORDER BY 再 LIMIT", "分页用 OFFSET 或键集分页", "探索数据先 LIMIT 100"],
                "common_mistakes": [{"mistake": "无 ORDER BY 的 LIMIT", "explanation": "结果顺序不稳定"}],
                "exercises": [{"question": "实现 amount 降序第 11–20 名（OFFSET）", "difficulty": 2}],
            }, difficulty=1, minutes=15, level="?"),
        ],
        "投影、过滤、排序与限行——所有 SQL 的地基。",
        level="?",
    )

    multi = module(
        nid(D, "多表操作"),
        "多表操作",
        [
            L("多表操作", "JOIN", "表连接", {
                "learning_goal": "能正确使用 INNER/LEFT JOIN 并说明粒度",
                "concept": ["JOIN 按键合并表", "INNER 只要匹配", "LEFT 保留左表", "一对多会放大行数"],
                "how_to_make": ["确认驱动表与维度表", "写 ON 条件", "选择 JOIN 类型", "检查行数是否爆炸"],
                "common_mistakes": [{"mistake": "一对多后直接 SUM 头表金额", "explanation": "先按粒度聚合或去重"}],
                "exercises": [{"question": "orders LEFT JOIN users 按城市汇总支付 GMV", "difficulty": 2}],
            }, difficulty=2, minutes=30, level="??"),
            L("多表操作", "子查询", "嵌套查询", {
                "learning_goal": "会写标量/IN/EXISTS 与派生表子查询",
                "concept": ["子查询可出现在 SELECT/FROM/WHERE", "相关子查询注意性能", "常可改写 JOIN"],
                "how_to_make": ["先写清内外层问题", "选定子查询形态", "用 EXPLAIN 对比 JOIN 改写"],
                "common_mistakes": [{"mistake": "IN 子查询返回 NULL", "explanation": "注意三值逻辑"}],
                "exercises": [{"question": "找出下过单金额高于全站平均的用户", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            L("多表操作", "UNION", "集合合并", {
                "learning_goal": "会用 UNION/UNION ALL 合并结果集",
                "concept": ["列数与类型需对齐", "UNION 去重", "UNION ALL 保留重复更快"],
                "how_to_make": ["对齐两边 SELECT 列表", "优先 UNION ALL", "需要唯一再去重"],
                "common_mistakes": [{"mistake": "默认 UNION 导致慢", "explanation": "无必要去重时用 UNION ALL"}],
                "exercises": [{"question": "合并今年与去年支付订单 id 列表（允许重复用 ALL）", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
        ],
        "把多张表拼成分析所需宽表。",
        level="??",
    )

    agg = module(
        nid(D, "聚合分析"),
        "聚合分析",
        [
            L("聚合分析", "GROUP BY", "分组聚合", {
                "learning_goal": "能按维分组并计算 SUM/COUNT/AVG",
                "concept": ["GROUP BY 定义聚合粒度", "SELECT 非聚合列必须在 GROUP BY", "COUNT DISTINCT 注意性能"],
                "how_to_make": ["确定分组维", "写聚合函数", "HAVING 前先 GROUP", "核对合计"],
                "common_mistakes": [{"mistake": "SELECT 多出未分组列", "explanation": "违反 only_full_group_by"}],
                "exercises": [{"question": "按 status 统计订单数与金额合计", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            L("聚合分析", "HAVING", "聚合后过滤", {
                "learning_goal": "区分 WHERE 与 HAVING",
                "concept": ["WHERE 过滤行", "HAVING 过滤组", "可对聚合结果设阈"],
                "how_to_make": ["先 GROUP BY", "再 HAVING 条件", "能下推 WHERE 的不要放 HAVING"],
                "common_mistakes": [{"mistake": "在 HAVING 写行级条件", "explanation": "应放 WHERE"}],
                "exercises": [{"question": "找出订单数≥3 的用户", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
            L("聚合分析", "窗口函数", "分析函数", {
                "learning_goal": "会用 ROW_NUMBER/SUM() OVER 做排名与奔走合计",
                "concept": ["窗口不坍缩行", "PARTITION BY + ORDER BY", "常用于去重与累计"],
                "how_to_make": ["确定分区与排序", "选窗口函数", "用 QUALIFY/子查询取 rn=1"],
                "common_mistakes": [{"mistake": "PARTITION 选错", "explanation": "排名会在错误群体内计算"}],
                "exercises": [{"question": "每个用户按时间取最近一笔订单", "difficulty": 3}],
            }, difficulty=3, minutes=35, level="???"),
        ],
        "从明细到指标：分组、组过滤与窗口。",
        level="??",
    )

    ddl = module(
        nid(D, "数据定义"),
        "数据定义",
        [
            L("数据定义", "CREATE TABLE", "建表", {
                "learning_goal": "能设计基础表结构与主键",
                "concept": ["DDL 定义结构", "主键/类型/默认值", "命名规范"],
                "how_to_make": ["列清单与类型", "设主键", "必要默认值与注释", "在测试库执行"],
                "common_mistakes": [{"mistake": "无主键", "explanation": "后续更新/关联困难"}],
                "exercises": [{"question": "设计一张简易 orders 表 DDL", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            L("数据定义", "ALTER TABLE", "改表", {
                "learning_goal": "会增删列与改类型的安全做法",
                "concept": ["ALTER 变更结构", "大表改类型有锁风险", "在线 DDL 视引擎而定"],
                "how_to_make": ["评估影响", "写 ALTER", "在从库/低峰验证", "回滚预案"],
                "common_mistakes": [{"mistake": "高峰直接改大字段类型", "explanation": "可能导致长时间锁表"}],
                "exercises": [{"question": "为 orders 增加 comment VARCHAR(200) 可空列", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
            L("数据定义", "约束", "完整性约束", {
                "learning_goal": "理解 PK/UK/FK/CHECK/NOT NULL",
                "concept": ["约束保证数据质量", "FK 有维护成本", "业务约束可放应用+DB"],
                "how_to_make": ["列出必须不变量", "选型约束", "补充应用校验", "写违规用例测试"],
                "common_mistakes": [{"mistake": "只靠应用约束", "explanation": "旁路写入会脏数据"}],
                "exercises": [{"question": "为 order_items.order_id 设计外键策略（强制或逻辑）", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
        ],
        "表结构与约束——数据正确性的底座。",
        level="??",
    )

    perf = module(
        nid(D, "性能优化"),
        "性能优化",
        [
            L("性能优化", "索引", "加速访问路径", {
                "learning_goal": "能解释 BTree 索引适用场景并设计组合索引",
                "concept": ["索引以空间换时间", "最左前缀", "不是越多越好"],
                "how_to_make": ["看慢查询 WHERE/JOIN 列", "设计组合索引顺序", "避免过度索引", "用 EXPLAIN 验证"],
                "common_mistakes": [{"mistake": "对低区分度列单建索引", "explanation": "收益低还拖累写入"}],
                "exercises": [{"question": "为 (user_id, created_at) 查询设计索引", "difficulty": 3}],
            }, difficulty=3, minutes=30, level="???"),
            L("性能优化", "执行计划", "读懂 EXPLAIN", {
                "learning_goal": "会读 type/key/rows/Extra 关键字段",
                "concept": ["执行计划展示优化器选择", "关注全表扫与临时表", "统计信息影响计划"],
                "how_to_make": ["EXPLAIN 原 SQL", "定位坏步骤", "改写或加索引", "对比前后"],
                "common_mistakes": [{"mistake": "只看有没有 Using index", "explanation": "还要看扫描行数与是否回表"}],
                "exercises": [{"question": "对一条慢 JOIN 输出 EXPLAIN 并指出瓶颈一行", "difficulty": 3}],
            }, difficulty=3, minutes=30, level="???"),
            L("性能优化", "查询重写", "等价改写提速", {
                "learning_goal": "能做 EXISTS/JOIN、子查询上拉等改写",
                "concept": ["语义等价优先", "减少中间结果", "避免选择率误判"],
                "how_to_make": ["保留验收用例", "改写", "对比计划与结果", "回归"],
                "common_mistakes": [{"mistake": "改写后口径变了", "explanation": "必须先有对拍用例"}],
                "exercises": [{"question": "把相关子查询改成 JOIN 并证明行数一致", "difficulty": 3}],
            }, difficulty=3, minutes=30, level="???"),
        ],
        "让查询又对又快。",
        level="???",
    )

    tx = module(
        nid(D, "事务与安全"),
        "事务与安全",
        [
            L("事务与安全", "事务", "ACID 与边界", {
                "learning_goal": "能界定事务边界并处理提交/回滚",
                "concept": ["事务打包多语句", "提交/回滚", "隔离级别影响可见性"],
                "how_to_make": ["明确原子操作集合", "BEGIN…COMMIT", "异常路径 ROLLBACK", "避免超长事务"],
                "common_mistakes": [{"mistake": "长事务抱着锁不放", "explanation": "拆小、尽快提交"}],
                "exercises": [{"question": "描述下单扣库存的最小事务包含哪些语句", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            L("事务与安全", "锁", "并发控制", {
                "learning_goal": "理解行锁/表锁与死锁基本处理",
                "concept": ["锁保护并发正确性", "死锁需重试", "索引减少锁范围"],
                "how_to_make": ["缩短事务", "按相同顺序访问资源", "监控死锁日志", "必要时刻意加锁"],
                "common_mistakes": [{"mistake": "无索引更新导致锁升级", "explanation": "加合适索引缩小锁粒度"}],
                "exercises": [{"question": "写出一次死锁排查的三步清单", "difficulty": 3}],
            }, difficulty=3, minutes=25, level="???"),
            L("事务与安全", "权限", "最小权限", {
                "learning_goal": "会按角色授予最小权限",
                "concept": ["GRANT/REVOKE", "读写分离账号", "禁止生产用超级账号跑报表"],
                "how_to_make": ["角色清单", "授予表/库级权限", "审计定期回收", "报表走只读账号"],
                "common_mistakes": [{"mistake": "分析师共用 root", "explanation": "安全与误操作风险极高"}],
                "exercises": [{"question": "为只读分析师设计权限集", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
        ],
        "并发正确与访问安全。",
        level="??",
    )

    tree = {
        "node_id": D,
        "title": "SQL",
        "type": "domain",
        "is_leaf": False,
        "children": [basic, multi, agg, ddl, perf, tx],
        "id": "sql-root",
        "level": "?",
        "content": "### SQL\n\n按学习路径六大功能模块：基础查询 → 多表 → 聚合 → DDL → 性能 → 事务与安全。\n",
    }
    return tree


# ───────────────────────── BI / Tableau 等 ─────────────────────────

def chart_page(title, summary, how, mistakes, exercise, goal, concepts, diff=2, minutes=20):
    return {
        "learning_goal": goal,
        "concept": concepts,
        "how_to_make": how,
        "common_mistakes": mistakes,
        "exercises": [{"question": exercise, "difficulty": diff}],
    }


def build_bi():
    D = "BI"

    # Tableau modules
    def Tleaf(mod, title, summary, content, **kw):
        return add_leaf(
            D,
            [D, "Tableau", mod, title],
            nid(D, "Tableau", mod, title),
            title,
            nid(D, "Tableau", mod),
            summary,
            content,
            tags=["BI", "Tableau", mod],
            **kw,
        )

    intro = module(
        nid(D, "Tableau", "入门准备"),
        "入门准备",
        [
            Tleaf("入门准备", "安装与账号", "安装 Tableau 与账号体系", {
                "learning_goal": "能完成 Desktop/Public 安装并登录",
                "concept": ["区分 Public / Desktop / Cloud", "许可证与保存限制不同"],
                "how_to_make": ["下载对应版本", "完成安装", "登录账号", "打开空白工作簿验证"],
                "common_mistakes": [{"mistake": "Public 保存到本地文件期望私有分享", "explanation": "Public 工作簿默认公开"}],
                "exercises": [{"question": "安装并截图开始界面", "difficulty": 1}],
            }, difficulty=1, minutes=20, level="?"),
            Tleaf("入门准备", "界面介绍", "认识工作区", {
                "learning_goal": "能指认数据窗格、行列、标记卡、筛选器",
                "concept": ["工作表/仪表板/故事", "蓝色维度绿色度量"],
                "how_to_make": ["打开 Superstore", "点开数据窗格", "拖字段到行/列/标记卡", "说出四个区域用途"],
                "common_mistakes": [{"mistake": "分不清工作表与仪表板", "explanation": "工作表出图，仪表板编排"}],
                "exercises": [{"question": "口头描述标记卡五个架子", "difficulty": 1}],
            }, difficulty=1, minutes=25, level="?"),
            Tleaf("入门准备", "数据源连接", "连接文件与库", {
                "learning_goal": "能连接 Excel/CSV 并进入工作表",
                "concept": ["连接→画布→工作表", "实时 vs 提取入口"],
                "how_to_make": ["选连接器", "选文件/库", "拖表到画布", "进入工作表"],
                "common_mistakes": [{"mistake": "编码错误导致乱码", "explanation": "检查 CSV 编码"}],
                "exercises": [{"question": "连接 Superstore 并打开一张工作表", "difficulty": 1}],
            }, difficulty=1, minutes=20, level="?"),
        ],
        "装好工具、认界面、连上数据。",
        level="?",
    )

    dataprep = module(
        nid(D, "Tableau", "数据准备"),
        "数据准备",
        [
            Tleaf("数据准备", "维度 vs 度量", "字段角色", {
                "learning_goal": "能正确设置维度/度量角色",
                "concept": ["维度切片", "度量聚合", "ID 不应求和"],
                "how_to_make": ["检查默认角色", "纠正误判字段", "设默认聚合", "用柱状图验证"],
                "common_mistakes": [{"mistake": "对 Order ID 求和", "explanation": "应改为维度或 COUNTD"}],
                "exercises": [{"question": "列出 5 个易混字段并纠正", "difficulty": 1}],
            }, difficulty=1, minutes=20, level="?"),
            Tleaf("数据准备", "数据类型", "类型与转换", {
                "learning_goal": "会改日期/数字/字符串类型",
                "concept": ["类型影响聚合与轴", "日期层次依赖日期类型"],
                "how_to_make": ["检查数据类型图标", "右键更改类型", "验证解析失败行", "再出图"],
                "common_mistakes": [{"mistake": "日期当字符串", "explanation": "无法连续轴与同环比"}],
                "exercises": [{"question": "把错误字符串日期改成日期类型", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
            Tleaf("数据准备", "提取 vs 实时", "连接策略", {
                "learning_goal": "能为场景选择 Extract 或 Live",
                "concept": ["Extract 快有延迟", "Live 新鲜吃源"],
                "how_to_make": ["评估时效与源压力", "默认提取", "配置刷新", "监控失败"],
                "common_mistakes": [{"mistake": "全家 Live 打挂源库", "explanation": "认证看板优先提取"}],
                "exercises": [{"question": "为日报与实时大屏分别选型并说明", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
        ],
        "字段角色、类型与连接策略。",
        level="??",
    )

    charts = module(
        nid(D, "Tableau", "图表制作"),
        "图表制作",
        [
            Tleaf("图表制作", "柱状图", "类别对比", chart_page(
                "柱状图", "用柱高比较类别数值",
                ["列放维度", "行放度量", "标记卡选条形", "按需排序"],
                [{"mistake": "类别过多柱子过细", "explanation": "合并其他或改条形横排"},
                 {"mistake": "用柱状硬画长趋势", "explanation": "长时间序列优先折线"}],
                "用 Superstore 做各区域销售额柱状图并降序",
                "学完能做出标准对比柱状图",
                ["柱高编码数值", "适合类别对比"],
            ), difficulty=1, minutes=20, level="?", related=[
                {"node_id": nid(D, "Tableau", "图表制作", "折线图"), "relation": "related", "label": "相关：折线图"},
            ]),
            Tleaf("图表制作", "折线图", "趋势", chart_page(
                "折线图", "看度量随时间变化",
                ["日期拖入列并设为连续", "度量拖入行", "标记选线", "检查空值断点"],
                [{"mistake": "日期当离散导致杂乱", "explanation": "改为连续日期"}],
                "做月度销售额折线",
                "学完能做标准趋势折线",
                ["线连接有序点", "适合趋势与拐点"],
            ), difficulty=1, minutes=20, level="?"),
            Tleaf("图表制作", "饼图", "结构占比", chart_page(
                "饼图", "扇区表示占比",
                ["标记选饼图", "颜色放维度", "角度放度量", "切片≤5 并标注百分比"],
                [{"mistake": "切片过多", "explanation": "合并为其他或改条形"}],
                "做各区域销售占比饼图",
                "学完能做可读饼图",
                ["角度编码占比", "不宜过多切片"],
            ), difficulty=1, minutes=20, level="?", related=[
                {"node_id": nid(D, "Tableau", "图表制作", "环形图"), "relation": "related", "label": "下一课：环形图"},
            ]),
            Tleaf("图表制作", "环形图", "镂空饼图", chart_page(
                "环形图", "中间镂空的饼图，视觉更轻量",
                [
                    "先做饼图：标记选饼图，颜色放维度，角度放度量",
                    "记录数拖入行两次，都改为最小值",
                    "右键第二个记录数选双轴",
                    "内圈标记卡删除颜色/角度，大小调小，颜色设白色",
                    "调整轴范围让两饼同心",
                ],
                [{"mistake": "两个饼图不同心", "explanation": "需要手动调整/同步轴范围"}],
                "用 Superstore 做各品类销售占比环形图",
                "学完你能在 Tableau 里做出标准环形图",
                ["环形图是饼图变体，中间镂空", "核心是双轴叠两个饼，内圈白色遮盖"],
            ), difficulty=3, minutes=25, level="??", related=[
                {"node_id": nid(D, "Tableau", "图表制作", "饼图"), "relation": "prerequisite", "label": "前置：饼图"},
                {"node_id": nid(D, "Tableau", "图表制作", "双轴组合图"), "relation": "related", "label": "相关：双轴组合图"},
            ]),
            Tleaf("图表制作", "双轴组合图", "柱线组合", chart_page(
                "双轴组合图", "同一视图展示两种标记",
                [
                    "日期拖入列（连续）",
                    "销售额拖入行",
                    "利润拖入行",
                    "右键利润选双轴",
                    "左侧标记卡将利润改为条形，右侧保持线",
                    "量纲相近时右键轴选同步轴",
                ],
                [{"mistake": "量纲差巨大却强行同步轴", "explanation": "不同步并标注单位"},
                 {"mistake": "改错标记卡", "explanation": "分别设置左右标记卡"}],
                "做月度销售额柱 + 利润率线",
                "学完能做柱线双轴组合图",
                ["双轴=两层标记卡", "可同步或独立轴"],
            ), difficulty=3, minutes=30, level="??"),
            Tleaf("图表制作", "热力图", "二维强度", chart_page(
                "热力图", "颜色深浅编码交叉强度",
                ["行维放行、列维放列", "度量放颜色", "标记选方形", "调整色阶"],
                [{"mistake": "极值洗白色阶", "explanation": "限色域或对数变换"}],
                "做 Region×Category 的 Sales 热力",
                "学完能做交叉热力图",
                ["适合密度与交叉强弱"],
            ), difficulty=2, minutes=25, level="??"),
        ],
        "从基础图到组合图：会做、会选、会避坑。",
        level="??",
    )

    # LOD container with 3 children
    lod_fixed = add_leaf(
        D, [D, "Tableau", "计算", "LOD", "FIXED"], nid(D, "Tableau", "计算", "LOD", "FIXED"), "FIXED",
        nid(D, "Tableau", "计算", "LOD"),
        "固定维度聚合，忽略视图其它维",
        {
            "learning_goal": "能写 FIXED 并解释与筛选器关系",
            "concept": [
                "FIXED 固定到声明维度计算",
                "常用于客户总额、区域总额等分母锁定",
            ],
            "syntax": "{ FIXED [维度] : 聚合([度量]) }",
            "scenario": "每个客户的总销售额（在订单明细行旁显示）",
            "how_to_make": [
                "创建计算字段",
                "输入 { FIXED [Customer Name] : SUM([Sales]) }",
                "拖到视图验证不随无关维变化",
                "分别用普通筛选与上下文筛选测试",
            ],
            "common_mistakes": [
                {"mistake": "忽略普通筛选器", "explanation": "FIXED 通常不受普通维度筛选影响，需上下文筛选或改写法"},
                {"mistake": "固定维选错变成全局一个数", "explanation": "检查 FIXED 列表是否为空或过粗"},
            ],
            "exercises": [
                {"question": "用 FIXED 计算每个客户总销售额并显示在明细表", "difficulty": 3},
                {"question": "用区域 FIXED 总额做州占比", "difficulty": 4},
            ],
        },
        difficulty=4, minutes=35, level="???", tags=["BI", "Tableau", "LOD"],
        related=[{"node_id": nid(D, "Tableau", "计算", "LOD", "INCLUDE"), "relation": "related", "label": "相关：INCLUDE"}],
    )
    lod_include = add_leaf(
        D, [D, "Tableau", "计算", "LOD", "INCLUDE"], nid(D, "Tableau", "计算", "LOD", "INCLUDE"), "INCLUDE",
        nid(D, "Tableau", "计算", "LOD"),
        "在视图粒度上额外加入维度再聚合",
        {
            "learning_goal": "能写 INCLUDE 并说明外层再聚合",
            "concept": ["INCLUDE = 视图维 ∪ 声明维", "适合先细算再回聚"],
            "syntax": "{ INCLUDE [维度] : 聚合([度量]) }",
            "scenario": "视图只有 Category，但想先按 Sub-Category 算再平均",
            "how_to_make": [
                "确认视图较粗",
                "写 INCLUDE 细粒度聚合",
                "外层再 AVG/SUM",
                "与直接粗聚合对比",
            ],
            "common_mistakes": [
                {"mistake": "忽略普通筛选器以外的语义差异", "explanation": "仍要用用例验证"},
                {"mistake": "忘了外层再聚合", "explanation": "INCLUDE 结果常需再汇总"},
            ],
            "exercises": [
                {"question": "比较 SUM(Sales) 与 AVG({INCLUDE [Sub-Category]: SUM([Sales])})", "difficulty": 4},
            ],
        },
        difficulty=4, minutes=30, level="???", tags=["BI", "Tableau", "LOD"],
    )
    lod_exclude = add_leaf(
        D, [D, "Tableau", "计算", "LOD", "EXCLUDE"], nid(D, "Tableau", "计算", "LOD", "EXCLUDE"), "EXCLUDE",
        nid(D, "Tableau", "计算", "LOD"),
        "从视图维度中排除后再聚合",
        {
            "learning_goal": "能写 EXCLUDE 做上级占比",
            "concept": ["EXCLUDE = 视图维 − 声明维", "适合明细旁显示上级汇总"],
            "syntax": "{ EXCLUDE [维度] : 聚合([度量]) }",
            "scenario": "子类别占所属类别比重",
            "how_to_make": [
                "视图放 Category + Sub-Category",
                "写 EXCLUDE Sub-Category 得类别总额",
                "用明细/类别总额做占比",
                "与表计算占比对照",
            ],
            "common_mistakes": [
                {"mistake": "排除后仍期望随该维变化", "explanation": "语义上该维已被移除"},
            ],
            "exercises": [
                {"question": "用 EXCLUDE 做子类别占类别百分比", "difficulty": 4},
            ],
        },
        difficulty=4, minutes=30, level="???", tags=["BI", "Tableau", "LOD"],
    )

    lod_box = container(
        nid(D, "Tableau", "计算", "LOD"),
        "LOD",
        [lod_fixed, lod_include, lod_exclude],
        "Level of Detail：FIXED / INCLUDE / EXCLUDE。三种差异大，分三页学。",
        typ="concept_group",
        level="???",
    )

    calc = module(
        nid(D, "Tableau", "计算"),
        "计算",
        [
            Tleaf("计算", "基础计算", "行级与聚合计算字段", {
                "learning_goal": "会创建基础计算字段",
                "concept": ["计算字段封装逻辑", "注意聚合级别"],
                "how_to_make": ["分析→创建计算字段", "写 IF/算术", "拖入视图验证"],
                "common_mistakes": [{"mistake": "行级与聚合混用报错", "explanation": "统一粒度或用 LOD"}],
                "exercises": [{"question": "写「高价值订单」IF 字段", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            Tleaf("计算", "表计算", "二次计算", {
                "learning_goal": "会用占比/排名等快速表计算",
                "concept": ["表计算基于当前分区结果", "计算依据很关键"],
                "how_to_make": ["出基础图", "快速表计算", "设置计算依据", "核对"],
                "common_mistakes": [{"mistake": "计算依据选错", "explanation": "排名会乱"}],
                "exercises": [{"question": "做区域销售额占比标签", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            lod_box,
        ],
        "基础计算、表计算与 LOD。",
        level="??",
    )

    # Fix lod_box children ids for platform - already have id fields from add_leaf

    filters = module(
        nid(D, "Tableau", "筛选与交互"),
        "筛选与交互",
        [
            Tleaf("筛选与交互", "筛选器", "缩小范围", {
                "learning_goal": "会配置维度/度量筛选并设默认",
                "concept": ["筛选器控制查询谓词", "时间建议默认近7日"],
                "how_to_make": ["拖字段到筛选", "设条件与默认", "显示筛选控件", "测试清空"],
                "common_mistakes": [{"mistake": "无默认时间窗", "explanation": "易触发全历史慢查询"}],
                "exercises": [{"question": "为销售图加 Category 筛选默认全选", "difficulty": 2}],
            }, difficulty=2, minutes=20, level="??"),
            Tleaf("筛选与交互", "参数", "What-if", {
                "learning_goal": "会用参数切换度量或阈值",
                "concept": ["参数是用户输入变量", "需计算字段引用"],
                "how_to_make": ["创建参数", "计算字段引用", "显示参数控件", "测试边界"],
                "common_mistakes": [{"mistake": "只建参数不引用", "explanation": "视图不会变化"}],
                "exercises": [{"question": "参数切换 Sales/Profit 主指标", "difficulty": 3}],
            }, difficulty=3, minutes=25, level="??"),
            Tleaf("筛选与交互", "动作", "联动", {
                "learning_goal": "会配置筛选/高亮动作",
                "concept": ["仪表板动作连接多表", "明确源与目标"],
                "how_to_make": ["仪表板→动作", "选类型", "设源表目标表", "测试点击"],
                "common_mistakes": [{"mistake": "动作互相覆盖", "explanation": "减少并发动作并命名"}],
                "exercises": [{"question": "点击区域饼图筛选趋势图", "difficulty": 3}],
            }, difficulty=3, minutes=25, level="??"),
        ],
        "筛选器、参数与仪表板动作。",
        level="??",
    )

    dash = module(
        nid(D, "Tableau", "仪表板"),
        "仪表板",
        [
            Tleaf("仪表板", "布局", "一屏一问题", {
                "learning_goal": "能用容器搭 KPI→主图→明细布局",
                "concept": ["容器固定结构", "留白与对齐"],
                "how_to_make": ["新建仪表板", "水平/垂直容器", "放入工作表", "统一边距"],
                "common_mistakes": [{"mistake": "一屏塞过多图", "explanation": "删到服务单一决策"}],
                "exercises": [{"question": "搭销售复盘三区线框", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            Tleaf("仪表板", "交互设计", "可探索", {
                "learning_goal": "为仪表板配置必要交互且不失控",
                "concept": ["筛选+动作+默认值", "防止选择瘫痪"],
                "how_to_make": ["放关键筛选", "配置动作", "设默认", "边界测试"],
                "common_mistakes": [{"mistake": "筛选器过多", "explanation": "分层或收纳"}],
                "exercises": [{"question": "完成可点击联动的复盘板", "difficulty": 3}],
            }, difficulty=3, minutes=30, level="??"),
            Tleaf("仪表板", "移动端适配", "手机布局", {
                "learning_goal": "能做手机设备布局",
                "concept": ["设备布局独立", "单列信息流"],
                "how_to_make": ["设备布局→手机", "单列堆叠", "放大 KPI", "隐藏次要图"],
                "common_mistakes": [{"mistake": "直接缩小桌面版", "explanation": "应重排"}],
                "exercises": [{"question": "为复盘板加手机布局", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
        ],
        "布局、交互与移动端。",
        level="??",
    )

    perf_t = module(
        nid(D, "Tableau", "性能优化"),
        "性能优化",
        [
            Tleaf("性能优化", "提取优化", "减小提取", {
                "learning_goal": "会裁剪字段与过滤历史",
                "concept": ["隐藏未用字段", "增量刷新"],
                "how_to_make": ["隐藏字段", "提取过滤", "增量配置", "对比体积"],
                "common_mistakes": [{"mistake": "全历史无过滤", "explanation": "体积膨胀"}],
                "exercises": [{"question": "裁剪近2年提取并记录体积", "difficulty": 2}],
            }, difficulty=2, minutes=25, level="??"),
            Tleaf("性能优化", "计算字段优化", "少算快算", {
                "learning_goal": "能识别并下推重计算",
                "concept": ["能 ETL 就不要视图算", "避免重复逻辑"],
                "how_to_make": ["找慢计算", "简化或物化", "性能记录对比"],
                "common_mistakes": [{"mistake": "视图里做重字符串解析", "explanation": "前置处理"}],
                "exercises": [{"question": "改写一个复杂 IF 并对比耗时", "difficulty": 3}],
            }, difficulty=3, minutes=25, level="??"),
            Tleaf("性能优化", "LOD 性能", "控制 FIXED 数量", {
                "learning_goal": "理解 FIXED 额外查询成本",
                "concept": ["多 FIXED 拖慢仪表板", "可表计算则不用 FIXED"],
                "how_to_make": ["统计 LOD", "删可替代者", "回归口径", "再测速"],
                "common_mistakes": [{"mistake": "每个 KPI 一个 FIXED", "explanation": "合并或预聚合"}],
                "exercises": [{"question": "把 3 个 FIXED 减到 1 个且结论不变", "difficulty": 4}],
            }, difficulty=4, minutes=30, level="???"),
        ],
        "提取、计算与 LOD 性能。",
        level="???",
    )

    cases = module(
        nid(D, "Tableau", "实战案例"),
        "实战案例",
        [
            Tleaf("实战案例", "销售分析", "经营复盘板", {
                "learning_goal": "能独立做出销售复盘仪表板",
                "concept": ["KPI+趋势+结构+明细", "统一口径"],
                "how_to_make": ["定北极星", "做趋势与结构图", "拼仪表板", "加筛选动作", "写口径说明"],
                "common_mistakes": [{"mistake": "图很多但无结论区", "explanation": "标题即结论"}],
                "exercises": [{"question": "交付一页销售复盘并录 1 分钟解说", "difficulty": 3}],
            }, difficulty=3, minutes=45, level="??"),
            Tleaf("实战案例", "留存分析", "队列视角", {
                "learning_goal": "能做简易队列留存热力",
                "concept": ["入组定义", "观察偏移周"],
                "how_to_make": ["定义首单日", "算队列年龄", "热力图", "注释口径"],
                "common_mistakes": [{"mistake": "入组定义含取消单", "explanation": "先清洗状态"}],
                "exercises": [{"question": "做新客第0–3周留存示意表", "difficulty": 4}],
            }, difficulty=4, minutes=40, level="???"),
            Tleaf("实战案例", "漏斗分析", "转化漏斗", {
                "learning_goal": "能做访购→下单→支付漏斗",
                "concept": ["同窗同主体", "步骤定义清晰"],
                "how_to_make": ["定义步骤事件", "算各步人数", "漏斗图或条形", "标注转化率"],
                "common_mistakes": [{"mistake": "步骤窗口不一致", "explanation": "统一时间窗"}],
                "exercises": [{"question": "画三步漏斗并写口径", "difficulty": 3}],
            }, difficulty=3, minutes=40, level="??"),
        ],
        "把能力接到真实分析题。",
        level="??",
    )

    tableau = tool(
        nid(D, "Tableau"),
        "Tableau",
        [intro, dataprep, charts, calc, filters, dash, perf_t, cases],
        "按功能模块学习 Tableau：入门→数据→图表→计算→交互→仪表板→性能→实战。",
        level="?",
    )

    # Power BI
    def Pleaf(mod, title, summary, content, **kw):
        return add_leaf(D, [D, "Power BI", mod, title], nid(D, "Power BI", mod, title), title,
                        nid(D, "Power BI", mod), summary, content, tags=["BI", "Power BI", mod], **kw)

    pbi = tool(
        nid(D, "Power BI"),
        "Power BI",
        [
            module(nid(D, "Power BI", "入门准备"), "入门准备", [
                Pleaf("入门准备", "安装与界面", "Desktop 入门", {
                    "learning_goal": "完成 Desktop 安装并认识区划",
                    "concept": ["报表/数据/模型视图"],
                    "how_to_make": ["安装", "打开 Desktop", "切换三视图", "连示例"],
                    "common_mistakes": [{"mistake": "只会报表不会模型", "explanation": "先看模型视图"}],
                    "exercises": [{"question": "截图三视图", "difficulty": 1}],
                }, difficulty=1, level="?"),
                Pleaf("入门准备", "获取数据", "Get Data", {
                    "learning_goal": "能导入 Excel/CSV",
                    "concept": ["获取数据与转换"],
                    "how_to_make": ["获取数据", "选文件", "转换或加载", "验证列"],
                    "common_mistakes": [{"mistake": "类型自动错误", "explanation": "Power Query 中纠正"}],
                    "exercises": [{"question": "导入一份 CSV", "difficulty": 1}],
                }, difficulty=1, level="?"),
            ], "安装与取数。", "?"),
            module(nid(D, "Power BI", "数据建模"), "数据建模", [
                Pleaf("数据建模", "星型模型", "关系与方向", {
                    "learning_goal": "能搭最小星型模型",
                    "concept": ["事实与维度", "关系基数"],
                    "how_to_make": ["导入事实维表", "建关系", "设基数", "隐藏技术键"],
                    "common_mistakes": [{"mistake": "双向过滤滥用", "explanation": "默认单方向"}],
                    "exercises": [{"question": "搭销售事实+日期+产品维", "difficulty": 2}],
                }, difficulty=2, level="??"),
                Pleaf("数据建模", "日期表", "标记日期表", {
                    "learning_goal": "会创建并标记日期表",
                    "concept": ["时间智能依赖日期表"],
                    "how_to_make": ["生成日期表", "标记为日期表", "关联事实日期"],
                    "common_mistakes": [{"mistake": "用事实日期列做时间智能", "explanation": "应独立日期表"}],
                    "exercises": [{"question": "创建连续日期表并关联", "difficulty": 2}],
                }, difficulty=2, level="??"),
            ], "关系与日期表。", "??"),
            module(nid(D, "Power BI", "DAX"), "DAX", [
                Pleaf("DAX", "基础度量", "SUM/COUNT", {
                    "learning_goal": "会写基础度量值",
                    "concept": ["度量不存行", "上下文感知"],
                    "how_to_make": ["新建度量", "写 SUM", "放到卡片", "切片验证"],
                    "common_mistakes": [{"mistake": "用计算列代替度量", "explanation": "聚合场景优先度量"}],
                    "exercises": [{"question": "写 Total Sales 度量", "difficulty": 2}],
                }, difficulty=2, level="??"),
                Pleaf("DAX", "CALCULATE", "切换筛选上下文", {
                    "learning_goal": "理解 CALCULATE 基本用法",
                    "concept": ["改筛选上下文", "时间智能基础"],
                    "how_to_make": ["写 CALCULATE", "加筛选条件", "与原度量对比"],
                    "common_mistakes": [{"mistake": "忽略上下文转换", "explanation": "用简单例子逐步看"}],
                    "exercises": [{"question": "写今年至今销售额", "difficulty": 3}],
                }, difficulty=3, level="???"),
            ], "度量与 CALCULATE。", "??"),
            module(nid(D, "Power BI", "可视化"), "可视化", [
                Pleaf("可视化", "常用图表", "柱线卡片", {
                    "learning_goal": "会做柱状/折线/卡片",
                    "concept": ["视觉对象面板"],
                    "how_to_make": ["选视觉对象", "拖字段", "格式化", "加切片器"],
                    "common_mistakes": [{"mistake": "装饰过度", "explanation": "先准确"}],
                    "exercises": [{"question": "做销售趋势+KPI 卡", "difficulty": 2}],
                }, difficulty=2, level="??"),
                Pleaf("可视化", "切片器", "交互筛选", {
                    "learning_goal": "会配置切片器同步",
                    "concept": ["切片器编辑交互"],
                    "how_to_make": ["放切片器", "设样式", "编辑交互", "测试"],
                    "common_mistakes": [{"mistake": "切片器过多", "explanation": "收纳"}],
                    "exercises": [{"question": "日期与类别双切片器", "difficulty": 2}],
                }, difficulty=2, level="??"),
            ], "视觉对象与切片器。", "??"),
            module(nid(D, "Power BI", "实战案例"), "实战案例", [
                Pleaf("实战案例", "销售仪表板", "综合练习", {
                    "learning_goal": "交付一页销售仪表板",
                    "concept": ["模型+DAX+视觉一体"],
                    "how_to_make": ["建模", "写度量", "出图", "布局发布"],
                    "common_mistakes": [{"mistake": "无日期表时间智能乱", "explanation": "补日期表"}],
                    "exercises": [{"question": "发布到工作区并设刷新", "difficulty": 3}],
                }, difficulty=3, level="??"),
                Pleaf("实战案例", "目标完成率", "实际vs目标", {
                    "learning_goal": "做目标对照可视化",
                    "concept": ["目标表关联", "完成率度量"],
                    "how_to_make": ["引入目标", "写完成率", "子弹图或柱线", "注释"],
                    "common_mistakes": [{"mistake": "目标粒度不匹配", "explanation": "统一到月/区"}],
                    "exercises": [{"question": "做区域目标完成率", "difficulty": 3}],
                }, difficulty=3, level="??"),
            ], "综合实战。", "??"),
        ],
        "Power BI 学习路径：入门→建模→DAX→可视化→实战。",
        "?",
    )

    def CNleaf(tool_name, mod, title, summary, content, **kw):
        return add_leaf(D, [D, "国产 BI", tool_name, mod, title], nid(D, "国产 BI", tool_name, mod, title),
                        title, nid(D, "国产 BI", tool_name, mod), summary, content,
                        tags=["BI", "国产 BI", tool_name], **kw)

    def cn_tool(name, modules_spec):
        mods = []
        for mod_title, leaves in modules_spec:
            kids = []
            for title, summary, content, lvl in leaves:
                kids.append(CNleaf(name, mod_title, title, summary, content, difficulty=2, level=lvl))
            mods.append(module(nid(D, "国产 BI", name, mod_title), mod_title, kids, f"{name} · {mod_title}", "??"))
        return tool(nid(D, "国产 BI", name), name, mods, f"{name} 功能模块学习路径。", "?")

    fine = cn_tool("FineBI", [
        ("入门", [
            ("连接数据", "连接业务库/文件", {"learning_goal": "能添加数据连接", "concept": ["数据连接与权限"], "how_to_make": ["新建连接", "测试", "选表", "进入分析"], "common_mistakes": [{"mistake": "账号权限不足", "explanation": "先申请只读"}], "exercises": [{"question": "添加一个 Excel 连接", "difficulty": 1}]}, "?"),
            ("自助数据集", "做分析集", {"learning_goal": "会创建自助数据集", "concept": ["字段配置与过滤"], "how_to_make": ["选表", "加工字段", "保存", "出组件"], "common_mistakes": [{"mistake": "直连过大表无过滤", "explanation": "先限范围"}], "exercises": [{"question": "做一个销售明细自助集", "difficulty": 2}]}, "??"),
        ]),
        ("图表", [
            ("柱线基础", "常用图", {"learning_goal": "会做柱状与折线", "concept": ["拖拽字段"], "how_to_make": ["新建组件", "选图", "拖字段", "格式"], "common_mistakes": [{"mistake": "维度度量放反", "explanation": "检查字段角色"}], "exercises": [{"question": "做区域销售柱图", "difficulty": 1}]}, "?"),
            ("过滤组件", "筛选", {"learning_goal": "会加过滤组件", "concept": ["过滤联动"], "how_to_make": ["加过滤", "绑定字段", "设默认", "测试"], "common_mistakes": [{"mistake": "未绑定到组件", "explanation": "检查联动设置"}], "exercises": [{"question": "加日期过滤", "difficulty": 2}]}, "??"),
        ]),
        ("仪表板", [
            ("页面布局", "拼板", {"learning_goal": "会拼仪表板", "concept": ["组件布局"], "how_to_make": ["新建仪表板", "拖组件", "对齐", "预览"], "common_mistakes": [{"mistake": "无统一风格", "explanation": "用主题"}], "exercises": [{"question": "拼 KPI+趋势一页", "difficulty": 2}]}, "??"),
            ("发布分享", "权限发布", {"learning_goal": "会发布并设权限", "concept": ["目录与权限"], "how_to_make": ["挂目录", "授权", "分享链接", "验收"], "common_mistakes": [{"mistake": "权限过大", "explanation": "按角色最小化"}], "exercises": [{"question": "发布给只读角色", "difficulty": 2}]}, "??"),
        ]),
    ])

    quick = cn_tool("QuickBI", [
        ("入门", [
            ("工作空间", "空间与数据集", {"learning_goal": "认识空间与数据集", "concept": ["工作空间隔离"], "how_to_make": ["进入空间", "建数据集", "预览", "授权"], "common_mistakes": [{"mistake": "个人空间当生产", "explanation": "生产用团队空间"}], "exercises": [{"question": "创建练习数据集", "difficulty": 1}]}, "?"),
            ("数据源", "配置源", {"learning_goal": "配置常用数据源", "concept": ["云数仓连接"], "how_to_make": ["添加源", "连通测试", "选表", "同步"], "common_mistakes": [{"mistake": "白名单未开", "explanation": "先配网络"}], "exercises": [{"question": "连通一个样例源", "difficulty": 2}]}, "??"),
        ]),
        ("图表", [
            ("交叉表", "明细表", {"learning_goal": "会做交叉表", "concept": ["行列表头"], "how_to_make": ["选交叉表", "拖维度量", "格式", "导出测"], "common_mistakes": [{"mistake": "明细过大", "explanation": "加过滤"}], "exercises": [{"question": "做品类×区域交叉表", "difficulty": 2}]}, "??"),
            ("仪表趋势", "KPI+线", {"learning_goal": "会做指标卡与趋势", "concept": ["组合"], "how_to_make": ["指标卡", "趋势图", "同页", "联动"], "common_mistakes": [{"mistake": "口径无说明", "explanation": "加备注"}], "exercises": [{"question": "GMV 卡+7日趋势", "difficulty": 2}]}, "??"),
        ]),
        ("仪表板", [
            ("搭建仪表板", "拼装", {"learning_goal": "完成一页仪表板", "concept": ["布局与主题"], "how_to_make": ["新建", "拖图表", "设查询控件", "预览"], "common_mistakes": [{"mistake": "控件过多", "explanation": "精简"}], "exercises": [{"question": "交付经营一页纸", "difficulty": 2}]}, "??"),
            ("分享与嵌入", "对外", {"learning_goal": "会分享与嵌入注意项", "concept": ["公开链接风险"], "how_to_make": ["分享设置", "权限", "嵌入参数", "审计"], "common_mistakes": [{"mistake": "公开敏感板", "explanation": "脱敏+登录"}], "exercises": [{"question": "列出嵌入前 5 条检查", "difficulty": 2}]}, "??"),
        ]),
    ])

    cn = tool(
        nid(D, "国产 BI"),
        "国产 BI",
        [fine, quick],
        "国产 BI 工具路径：FineBI / QuickBI。",
        "?",
    )

    tree = {
        "node_id": D,
        "title": "BI",
        "type": "domain",
        "is_leaf": False,
        "children": [tableau, pbi, cn],
        "id": "bi-root",
        "level": "?",
        "content": "### BI\n\n按工具学习：Tableau / Power BI / 国产 BI。已去除「选型」「国内外工具」中间层。\n",
    }
    return tree


def to_platform_tree(node: dict) -> dict:
    """Strip architecture-only keys; keep platform shape."""
    out = {
        "id": node.get("id") or node["node_id"].replace(".", "-"),
        "title": node["title"],
        "level": node.get("level") or "??",
        "content": node.get("content") or f"### {node['title']}\n",
        "children": [to_platform_tree(c) for c in node.get("children") or []],
    }
    if node.get("lessonParent"):
        out["lessonParent"] = True
    return out


def validate(arch: dict) -> list[str]:
    errs = []
    bi = arch["domains"][0]["tree"]
    sql = arch["domains"][1]["tree"]
    bi_kids = [c["title"] for c in bi["children"]]
    if bi_kids != ["Tableau", "Power BI", "国产 BI"]:
        errs.append(f"BI children={bi_kids}")
    if any(x in bi_kids for x in ("选型", "工具与选型", "国内外")):
        errs.append("BI still has 选型 layer")
    tab = next(c for c in bi["children"] if c["title"] == "Tableau")
    mods = [c["title"] for c in tab["children"]]
    expect = ["入门准备", "数据准备", "图表制作", "计算", "筛选与交互", "仪表板", "性能优化", "实战案例"]
    if mods != expect:
        errs.append(f"Tableau mods={mods}")
    sql_mods = [c["title"] for c in sql["children"]]
    expect_sql = ["基础查询", "多表操作", "聚合分析", "数据定义", "性能优化", "事务与安全"]
    if sql_mods != expect_sql:
        errs.append(f"SQL mods={sql_mods}")

    def walk(n, path=None):
        path = (path or []) + [n["title"]]
        kids = n.get("children") or []
        if n.get("type") == "module" and n["title"] != "LOD":
            leaves = [c for c in kids if c.get("is_leaf") or not (c.get("children"))]
            # count leaf-ish: is_leaf or concept leaves; LOD container counts as one child with nested
            conceptish = []
            for c in kids:
                if c.get("is_leaf"):
                    conceptish.append(c)
                elif c.get("title") == "LOD":
                    conceptish.extend(c.get("children") or [])
                elif not (c.get("children")):
                    conceptish.append(c)
            if not (2 <= len(kids) <= 6) and n["title"] not in ("计算",):
                # 计算 has 3: 基础/表计算/LOD
                pass
            if len(kids) < 2:
                errs.append(f"module too few kids: {'/'.join(path)} ({len(kids)})")
            if len(kids) > 6:
                errs.append(f"module too many kids: {'/'.join(path)} ({len(kids)})")
        if n.get("is_leaf"):
            if not n.get("page_url"):
                errs.append(f"leaf no page_url: {n.get('node_id')}")
        for c in kids:
            walk(c, path)

    walk(bi)
    walk(sql)

    lod = None
    def find(n, title, parent=None):
        nonlocal lod
        if n.get("title") == "LOD" and parent == "计算":
            lod = n
        for c in n.get("children") or []:
            find(c, title, n.get("title"))
    find(tab, "LOD")
    if not lod or [c["title"] for c in lod["children"]] != ["FIXED", "INCLUDE", "EXCLUDE"]:
        errs.append(f"LOD kids wrong: {lod}")

    # how_to_make for charts
    chart_titles = {"柱状图", "折线图", "饼图", "环形图", "双轴组合图", "热力图"}
    page_by_id = {p["page_id"]: p for p in arch["knowledge_base"]["pages"]}
    for p in arch["knowledge_base"]["pages"]:
        if p["title"] in chart_titles:
            if not (p["content"].get("how_to_make") and len(p["content"]["how_to_make"]) >= 2):
                errs.append(f"chart missing how_to_make: {p['title']}")

    # every leaf has page
    leaf_ids = [n["node_id"] for n in arch["nodes"] if n["is_leaf"]]
    for lid in leaf_ids:
        if lid not in page_by_id:
            errs.append(f"missing page: {lid}")

    return errs


def main():
    global nodes_flat, pages
    nodes_flat = []
    pages = []
    bi_tree = build_bi()
    sql_tree = build_sql()

    # domain entries for nodes list (non-leaves already partially added)
    arch = {
        "domains": [
            {"domain_id": "BI", "title": "BI", "tree": bi_tree},
            {"domain_id": "SQL", "title": "SQL", "tree": sql_tree},
        ],
        "nodes": nodes_flat,
        "knowledge_base": {"pages": pages},
    }

    # JSON roundtrip check
    raw = json.dumps(arch, ensure_ascii=False, indent=2)
    json.loads(raw)

    errs = validate(arch)
    OUT_ARCH.write_text(raw, encoding="utf-8")

    # platform trees
    bi_plat = to_platform_tree(bi_tree)
    sql_plat = to_platform_tree(sql_tree)
    (KG / "bi.json").write_text(json.dumps(bi_plat, ensure_ascii=False, indent=2), encoding="utf-8")
    (KG / "sql.json").write_text(json.dumps(sql_plat, ensure_ascii=False, indent=2), encoding="utf-8")
    (KG / "hub-viz.json").write_text(json.dumps(bi_plat, ensure_ascii=False, indent=2), encoding="utf-8")
    (KG / "hub-query.json").write_text(json.dumps(sql_plat, ensure_ascii=False, indent=2), encoding="utf-8")
    (KG / "embed-bi.js").write_text(
        "window.__KG_EMBEDDED=window.__KG_EMBEDDED||{};\nwindow.__KG_EMBEDDED[\"bi\"]="
        + json.dumps(bi_plat, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    (KG / "embed-sql.js").write_text(
        "window.__KG_EMBEDDED=window.__KG_EMBEDDED||{};\nwindow.__KG_EMBEDDED[\"sql\"]="
        + json.dumps(sql_plat, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    # also copy lessons for generators if present
    lessons = ROOT / "learn-kg" / "_gen" / "lessons"
    if lessons.exists():
        (lessons / "bi.json").write_text(json.dumps(bi_plat, ensure_ascii=False, indent=2), encoding="utf-8")
        (lessons / "sql.json").write_text(json.dumps(sql_plat, ensure_ascii=False, indent=2), encoding="utf-8")

    def count_leaves(n):
        kids = n.get("children") or []
        if not kids:
            return 1
        return sum(count_leaves(c) for c in kids)

    bi_leaves = count_leaves(bi_plat) - 1  # exclude root? actually root has kids so ok
    # recount properly
    def leaves(n):
        kids = n.get("children") or []
        if not kids:
            return 1
        return sum(leaves(c) for c in kids)

    summary = f"""# SQL / BI 知识树重构摘要

## 重构前后对比

### BI
| 变更 | 说明 |
|---|---|
| 删除 | 「选型 / 工具与选型」「国内外 BI 工具」等为分层而分层的中间层 |
| 删除 | 旧的指标体系/语义层/权限等百科式大树（改由工具路径承载学习） |
| 保留 | 顶层 `bi-root` / 标题 **BI** |
| 新增 Level1 | **Tableau / Power BI / 国产 BI** 直接挂在 BI 下 |
| 新增 Tableau Level2 | 8 功能模块：入门准备、数据准备、图表制作、计算、筛选与交互、仪表板、性能优化、实战案例 |
| LOD | 方案 B：LOD 容器下挂 FIXED / INCLUDE / EXCLUDE 三叶 |

### SQL
| 变更 | 说明 |
|---|---|
| 删除 | L0–L6「为分层而分层」的关卡命名 |
| 保留 | 顶层 `sql-root` / 标题 **SQL** |
| 新增 Level2 | 6 功能模块：基础查询、多表操作、聚合分析、数据定义、性能优化、事务与安全 |

## BI 完整树

```
BI
├─ Tableau
│   ├─ 入门准备（安装与账号 / 界面介绍 / 数据源连接）
│   ├─ 数据准备（维度 vs 度量 / 数据类型 / 提取 vs 实时）
│   ├─ 图表制作（柱/折/饼/环/双轴/热力）
│   ├─ 计算（基础计算 / 表计算 / LOD→FIXED·INCLUDE·EXCLUDE）
│   ├─ 筛选与交互（筛选器 / 参数 / 动作）
│   ├─ 仪表板（布局 / 交互设计 / 移动端适配）
│   ├─ 性能优化（提取优化 / 计算字段优化 / LOD 性能）
│   └─ 实战案例（销售 / 留存 / 漏斗）
├─ Power BI
│   ├─ 入门准备 / 数据建模 / DAX / 可视化 / 实战案例
└─ 国产 BI
    ├─ FineBI（入门 / 图表 / 仪表板）
    └─ QuickBI（入门 / 图表 / 仪表板）
```

## SQL 完整树

```
SQL
├─ 基础查询（SELECT / WHERE / ORDER BY / LIMIT）
├─ 多表操作（JOIN / 子查询 / UNION）
├─ 聚合分析（GROUP BY / HAVING / 窗口函数）
├─ 数据定义（CREATE TABLE / ALTER TABLE / 约束）
├─ 性能优化（索引 / 执行计划 / 查询重写）
└─ 事务与安全（事务 / 锁 / 权限）
```

## 规模

- 知识库页面总数：**{len(pages)}**
- BI 平台叶节点：**{leaves(bi_plat)}**
- SQL 平台叶节点：**{leaves(sql_plat)}**
- 扁平 nodes 条目：**{len(nodes_flat)}**

## LOD 与图表类页面清单

### LOD
- `BI.Tableau.计算.LOD.FIXED`
- `BI.Tableau.计算.LOD.INCLUDE`
- `BI.Tableau.计算.LOD.EXCLUDE`

### 图表（含 how_to_make）
- 柱状图 / 折线图 / 饼图 / 环形图 / 双轴组合图 / 热力图

## 落盘文件

- 架构 JSON：`pages/kg-data/sql-bi-architecture.json`
- 平台树：`pages/kg-data/bi.json`、`sql.json`（及 hub/embed 同步）

## 质量校验

- [{'x' if not errs else ' '}] BI 下面直接是工具，没有「选型」层
- [{'x' if not errs else ' '}] Tableau 下面有 8 个功能模块
- [{'x' if not errs else ' '}] SQL 下面有 6 个功能模块
- [{'x' if not errs else ' '}] 每个模块至少 2 个知识点
- [{'x' if not errs else ' '}] LOD 下面有 FIXED/INCLUDE/EXCLUDE
- [{'x' if not errs else ' '}] 图表类知识点有 how_to_make
- [{'x' if not errs else ' '}] 每个叶子节点都有知识库页面
- [{'x' if not errs else ' '}] JSON 可被 JSON.parse / json.loads 解析

校验错误：{errs if errs else '无'}
"""
    OUT_SUMMARY.write_text(summary, encoding="utf-8")
    print(summary)
    print("WROTE", OUT_ARCH, "pages", len(pages), "errors", errs)


if __name__ == "__main__":
    main()
