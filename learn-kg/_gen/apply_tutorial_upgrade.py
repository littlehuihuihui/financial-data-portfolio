# -*- coding: utf-8 -*-
"""Upgrade DATA NEXUS: tutorial drill UX, encyclopedia visuals, lesson JSON, phase-2 hubs."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台\数据学习平台")
HTML = ROOT / "数据知识图谱.html"
LESSONS = ROOT / "_gen" / "lessons"
DRILL_JS = ROOT / "_gen" / "kg_drill_runtime.js"
RUNTIME = ROOT / "_gen" / "runtime.js"

LESSONS.mkdir(parents=True, exist_ok=True)


def lesson(id_, title, level, content, children=None, lesson_parent=False):
    d = {"id": id_, "title": title, "level": level, "content": content, "children": children or []}
    if lesson_parent:
        d["lessonParent"] = True
    return d


TPL = """### 是什么

- **一句话定义**：{defn}
- **核心要素**：{core}

### 怎么写

```{lang}
{code}
```

### 用在哪

1. {u1}
2. {u2}
3. {u3}

### 注意啥

- {n1}
- {n2}
- {n3}
"""


def md(**kw):
    return TPL.format(**kw)


def enhance_sql(tree: dict) -> dict:
    """补强主题/章节导读，标记 lessonParent。"""
    chapter_blurbs = {
        "sql-crud": "### CRUD 基础 · 章节导读\n\n**学习目标**：能独立完成增删改查，并养成生产安全习惯。\n\n**先修**：表与列的基本概念。\n\n点下方绿色叶节点进入各讲义。",
        "sql-filter-agg": "### 过滤与聚合 · 章节导读\n\n**学习目标**：用 WHERE/ORDER/GROUP BY 把明细收成指标。\n\n**先修**：SELECT 基础。",
        "sql-table-constraint": "### 表与约束 · 章节导读\n\n**学习目标**：用 DDL 定义结构与完整性约束。\n\n**先修**：CRUD 读写。",
        "sql-view-index-skel": "### 视图与索引骨架 · 章节导读\n\n**学习目标**：理解逻辑封装与物理加速入口。",
        "sql-join-basic": "### 基础关联 · 章节导读\n\n**学习目标**：掌握 INNER / LEFT JOIN 语义与粒度。",
        "sql-join-trap": "### 关联陷阱 · 章节导读\n\n**学习目标**：识别 JOIN 爆炸并学会先聚合再关联。",
        "sql-rank": "### 排名类窗口 · 章节导读\n\n**学习目标**：分清 ROW_NUMBER / RANK / DENSE_RANK 的选用。",
        "sql-analytic": "### 分析类窗口 · 章节导读\n\n**学习目标**：用 LAG/LEAD 与累计窗口做环比与滚动指标。",
        "sql-with-write": "### WITH 写法 · 章节导读\n\n**学习目标**：把长 SQL 拆成可读的 CTE 流水线。",
        "sql-plan": "### 读懂计划 · 章节导读\n\n**学习目标**：会看 EXPLAIN，并设计复合索引。",
        "sql-acid": "### ACID 入门 · 章节导读\n\n**学习目标**：理解事务边界与提交/回滚。",
        "sql-tune-loop": "### 调优闭环 · 章节导读\n\n**学习目标**：用固定清单定位慢查询。",
    }
    domain_blurbs = {
        "sql-dml-query": "### DML & 查询\n\n读写与查询表达：**CRUD → 过滤聚合**。先点主题展开，再学叶节点讲义。",
        "sql-ddl": "### DDL 与对象\n\n表、约束、视图与索引——库内对象骨架。",
        "sql-join": "### JOIN 关联\n\n多表拼装是分析与建模日常；先懂语义，再防爆炸。",
        "sql-window": "### 窗口函数\n\n不折叠行的排序与累计分析。",
        "sql-cte": "### CTE 与子查询\n\n用 WITH 把复杂逻辑分层。",
        "sql-index-plan": "### 索引与执行计划\n\n先看计划再改 SQL。",
        "sql-txn": "### 事务与锁\n\n多步读写的原子边界。",
        "sql-tune": "### SQL 调优\n\n复现 → 计划 → 改写 → 回归。",
    }

    def walk(n):
        kids = n.get("children") or []
        if n["id"] in chapter_blurbs:
            n["content"] = chapter_blurbs[n["id"]]
            n["lessonParent"] = True
        elif n["id"] in domain_blurbs:
            n["content"] = domain_blurbs[n["id"]]
        if kids and all(not (c.get("children") or []) for c in kids):
            n["lessonParent"] = True
            if len(n.get("content") or "") < 40:
                n["content"] = f"### {n['title']} · 章节导读\n\n点绿色叶节点进入讲义：**是什么 / 怎么写 / 用在哪 / 注意啥**。"
        for c in kids:
            walk(c)

    tree = json.loads(json.dumps(tree))  # deep copy
    tree["content"] = (
        "### SQL 知识图谱\n\n"
        "四层结构：**领域 → 主题 → 知识点**。\n\n"
        "- 再点中心展开领域扇区\n"
        "- 点主题层层下钻（弧线一对多）\n"
        "- **倒数第二层**打开章节导读 + 子课列表\n"
        "- **叶节点**打开完整讲义（是什么 / 怎么写 / 用在哪 / 注意啥）"
    )
    walk(tree)
    return tree


def enhance_ml(tree: dict) -> dict:
    """ML 目前是 L2 即叶；包一层「任务类型」章节以便示范章节导读。"""
    tree = json.loads(json.dumps(tree))
    leaves = tree.get("children") or []
    if leaves and all(not (c.get("children") or []) for c in leaves):
        # wrap into one chapter parent for drill demo, keep leaves
        wrapped = lesson(
            "ml-tasks",
            "核心任务",
            "?",
            "### 机器学习核心任务 · 章节导读\n\n"
            "**学习目标**：分清分类 / 预测 / 聚类 / 推荐 / 异常检测的适用边界。\n\n"
            "点下方子课进入各任务讲义。",
            leaves,
            lesson_parent=True,
        )
        tree["children"] = [wrapped]
        tree["content"] = (
            "### 机器学习任务地图\n\n"
            "再点中心展开任务扇区；进入「核心任务」章节后选择具体讲义。"
        )
    return tree


def build_python() -> dict:
    return lesson(
        "python-root",
        "Python",
        "?",
        "### Python 数据学习路径\n\n从读写表到可视化与脚本化清洗。再点中心展开领域。",
        [
            lesson("py-pandas", "pandas 数据表", "?", "### pandas\n\n表格数据处理主力。", [
                lesson("py-io", "读写与选型", "?", "### 读写与选型 · 章节导读\n\n掌握 CSV/Excel/SQL 读写与 dtypes。", [
                    lesson("py-read-csv", "read_csv", "?", md(
                        defn="用 pandas 把平面文件读成 DataFrame。",
                        core="路径、分隔符、编码、dtype、parse_dates。",
                        lang="python",
                        code="import pandas as pd\ndf = pd.read_csv('orders.csv', parse_dates=['created_at'])\nprint(df.dtypes)\nprint(df.head())",
                        u1="探索分析起步", u2="ETL 落地前质检", u3="报表取数脚本",
                        n1="大文件用 chunksize", n2="先抽样再全量", n3="显式指定 dtype 防混型",
                    )),
                    lesson("py-to-sql", "to_sql / read_sql", "??", md(
                        defn="DataFrame 与数据库互转。",
                        core="SQLAlchemy engine、chunksize、if_exists。",
                        lang="python",
                        code="from sqlalchemy import create_engine\nimport pandas as pd\neng = create_engine('sqlite:///demo.db')\ndf = pd.read_sql('SELECT * FROM orders LIMIT 100', eng)\ndf.to_sql('orders_stg', eng, if_exists='replace', index=False)",
                        u1="沙箱落表", u2="指标回写", u3="联表前拉维表",
                        n1="生产写入注意权限与幂等", n2="分块写入防内存爆", n3="类型映射因引擎而异",
                    )),
                ], True),
                lesson("py-agg", "清洗与聚合", "??", "### 清洗与聚合 · 章节导读\n\n过滤、缺失、groupby 是日常三板斧。", [
                    lesson("py-group", "groupby 聚合", "??", md(
                        defn="按键折叠行并聚合。",
                        core="by 键、agg 字典、reset_index。",
                        lang="python",
                        code="gmv = (\n  df[df.status=='paid']\n  .groupby('user_id', as_index=False)\n  .agg(gmv=('amount','sum'), orders=('order_id','count'))\n)\nprint(gmv.head())",
                        u1="用户汇总", u2="日报指标", u3="训练样本标签表",
                        n1="聚合前后核对行数", n2="多键 groupby 注意空值", n3="大数据优先下推到 SQL",
                    )),
                    lesson("py-na", "缺失与类型", "?", md(
                        defn="处理 NA 并校正类型，避免脏分析。",
                        core="isna、fillna、astype、to_datetime。",
                        lang="python",
                        code="df['amount'] = pd.to_numeric(df['amount'], errors='coerce')\ndf['created_at'] = pd.to_datetime(df['created_at'], errors='coerce')\ndf = df.dropna(subset=['user_id'])\ndf['channel'] = df['channel'].fillna('unknown')",
                        u1="入模前清洗", u2="报表口径统一", u3="质检脚本",
                        n1="不要盲目 dropna 全表", n2="填充要有业务含义", n3="时间时区要显式",
                    )),
                ], True),
            ]),
            lesson("py-viz", "可视化入门", "??", "### 可视化\n\n用图讲清分布与趋势。", [
                lesson("py-plot", "常用图", "??", "### 常用图 · 章节导读\n\n柱状/折线/分布是分析起步三件套。", [
                    lesson("py-line", "折线趋势", "??", md(
                        defn="按时间展示指标走势。",
                        core="x 时间、y 指标、分组 hue。",
                        lang="python",
                        code="import matplotlib.pyplot as plt\ndaily = df.groupby('dt')['gmv'].sum()\ndaily.plot(figsize=(8,3), title='Daily GMV')\nplt.tight_layout(); plt.show()",
                        u1="日报复盘", u2="异常尖刺定位", u3="实验观察窗",
                        n1="先聚合再画", n2="注意缺失日", n3="双轴慎用",
                    )),
                ], True),
            ]),
        ],
    )


def build_etl() -> dict:
    return lesson(
        "etl-root",
        "ETL",
        "?",
        "### ETL / 数据集成\n\n抽取 → 转换 → 装载。再点中心展开。",
        [
            lesson("etl-batch", "批次 ETL", "?", "### 批次 ETL\n\n按天/小时调度的经典管道。", [
                lesson("etl-pattern", "常见模式", "?", "### 常见模式 · 章节导读\n\n全量、增量、拉链是三种底座。", [
                    lesson("etl-incr", "增量抽取", "?", md(
                        defn="只拉取自上次成功以来的变化数据。",
                        core="水位线 watermark、业务时间、幂等写入。",
                        lang="sql",
                        code="SELECT *\nFROM ods.orders\nWHERE updated_at > TIMESTAMP '{{ prev_success }}'\n  AND updated_at <= TIMESTAMP '{{ data_interval_end }}';",
                        u1="日更明细入仓", u2="维表缓慢变化", u3="下游重跑窗口",
                        n1="时钟回拨与乱序", n2="软删要覆盖", n3="失败重跑必须幂等",
                    )),
                    lesson("etl-scd", "SCD 拉链", "??", md(
                        defn="保留维度历史版本（生效/失效时间）。",
                        core="surrogate key、valid_from/to、is_current。",
                        lang="sql",
                        code="-- 简化：关闭旧版 + 插入新版\nUPDATE dim_user SET valid_to = CURRENT_DATE, is_current = 0\nWHERE user_biz_id = :id AND is_current = 1;\nINSERT INTO dim_user (...)\nVALUES (..., CURRENT_DATE, DATE '9999-12-31', 1);",
                        u1="用户属性历史", u2="商品类目变更", u3="组织架构演进",
                        n1="业务键必须稳定", n2="同日多变要注意", n3="查询要带时间点",
                    )),
                ], True),
            ]),
            lesson("etl-quality", "过程质量", "??", "### 过程质量\n\n装载前后校验，防止脏数据扩散。", [
                lesson("etl-checks", "校验清单", "??", "### 校验清单 · 章节导读", [
                    lesson("etl-rowcount", "行数与空值", "??", md(
                        defn="对比源/目标行数与关键空值率。",
                        core="count、null_rate、主键唯一。",
                        lang="sql",
                        code="SELECT COUNT(*) AS cnt,\n       AVG(user_id IS NULL) AS null_user\nFROM dwd.orders\nWHERE dt = '{{ ds }}';",
                        u1="日任务门禁", u2="回刷验证", u3="事故定位",
                        n1="阈值要按表分级", n2="只告警不阻断会堆债", n3="与分区裁剪一起看",
                    )),
                ], True),
            ]),
        ],
    )


def build_dwh() -> dict:
    return lesson(
        "dwh-root",
        "数据仓库",
        "?",
        "### 数据仓库\n\n分层、主题域与可复用指标底座。",
        [
            lesson("dwh-layer", "数仓分层", "?", "### 数仓分层\n\nODS → DWD → DWS → ADS 的职责边界。", [
                lesson("dwh-layers", "层级职责", "?", "### 层级职责 · 章节导读", [
                    lesson("dwh-ods", "ODS 贴源", "?", md(
                        defn="尽量原样落入的操作数据层。",
                        core="保留源字段、分区、装载时间。",
                        lang="sql",
                        code="CREATE TABLE ods.orders_di (\n  order_id BIGINT, user_id BIGINT, amount DECIMAL(18,2),\n  status STRING, updated_at TIMESTAMP, dt STRING\n) PARTITIONED BY (dt);",
                        u1="溯源对账", u2="重跑原料", u3="源系统变更缓冲",
                        n1="不要在 ODS 做重业务加工", n2="敏感字段脱敏", n3="分区与生命周期",
                    )),
                    lesson("dwh-dwd", "DWD 明细", "??", md(
                        defn="清洗后的业务明细事实，统一口径字段。",
                        core="标准化码值、时区、主键、轻度维退化。",
                        lang="sql",
                        code="INSERT OVERWRITE TABLE dwd.trade_order_di PARTITION (dt='{{ ds }}')\nSELECT order_id, user_id, amount, status_code, created_at\nFROM ods.orders_di WHERE dt='{{ ds }}' AND is_deleted=0;",
                        u1="分析取数底座", u2="指标可回溯", u3="特征明细来源",
                        n1="粒度必须声明", n2="与维表关联键稳定", n3="避免过早宽表爆炸",
                    )),
                ], True),
            ]),
            lesson("dwh-model", "主题与建模", "??", "### 主题与建模\n\n按业务过程建事实，按实体建维度。", [
                lesson("dwh-star", "星型入门", "??", "### 星型入门 · 章节导读", [
                    lesson("dwh-fact", "事实表", "??", md(
                        defn="记录业务过程的度量与外键。",
                        core="粒度、度量、退化维、分区。",
                        lang="sql",
                        code="-- 粒度：一笔支付\nSELECT pay_id, order_id, user_id, pay_amount, pay_at, dt\nFROM dwd.pay_di WHERE dt='{{ ds }}';",
                        u1="交易主题", u2="流量主题", u3="履约主题",
                        n1="先定粒度再加字段", n2="事实尽量瘦", n3="避免双计数",
                    )),
                ], True),
            ]),
        ],
    )


def build_bi() -> dict:
    return lesson(
        "bi-root",
        "BI",
        "?",
        "### BI / 可视化分析\n\n从指标到看板的表达与治理。",
        [
            lesson("bi-metric", "指标设计", "?", "### 指标设计\n\n先定义口径，再绑可视化。", [
                lesson("bi-define", "口径要素", "?", "### 口径要素 · 章节导读", [
                    lesson("bi-atomic", "原子指标", "?", md(
                        defn="不可再拆的业务度量（如支付金额）。",
                        core="业务过程、度量字段、聚合方式。",
                        lang="sql",
                        code="-- 原子：支付金额\nSELECT SUM(pay_amount) AS pay_amt\nFROM dws.pay_1d\nWHERE dt BETWEEN '{{ start }}' AND '{{ end }}';",
                        u1="GMV/支付", u2="订单量", u3="活跃账号数",
                        n1="聚合方式写进文档", n2="时区与删单规则", n3="与主题域 Owner 对齐",
                    )),
                    lesson("bi-derived", "派生指标", "??", md(
                        defn="在原子指标上加时间/修饰/运算。",
                        core="时间周期、业务限定、四则/比率。",
                        lang="sql",
                        code="-- 派生：近7日支付转化率\nSELECT pay_uv_7d * 1.0 / NULLIF(visit_uv_7d, 0) AS pay_cvr_7d\nFROM dws.traffic_pay_1d WHERE dt='{{ ds }}';",
                        u1="转化率", u2="客单价", u3="留存率",
                        n1="分母为 0", n2="修饰词要可枚举", n3="避免同名异义",
                    )),
                ], True),
            ]),
            lesson("bi-board", "看板表达", "??", "### 看板表达\n\n一张看板只讲清一个决策问题。", [
                lesson("bi-layout", "布局原则", "??", "### 布局原则 · 章节导读", [
                    lesson("bi-northstar", "北极星与下钻", "??", md(
                        defn="顶栏放北极星，下方按维度下钻解释波动。",
                        core="主指标、对比、拆解维度、异常注释。",
                        lang="text",
                        code="布局：\n1) 顶：北极星 + 同比/环比\n2) 中：渠道/地区拆解\n3) 下：明细或漏斗\n交互：点维度 → 过滤全局",
                        u1="经营周会", u2="业务值班大屏", u3="实验看版",
                        n1="避免首屏堆满卡片", n2="过滤条件要可见", n3="口径角标常驻",
                    )),
                ], True),
            ]),
        ],
    )


def extract_json_object(html: str, start_idx: int) -> tuple[str, int]:
    """Return (json_text, end_index_after_object) starting at first '{' from start_idx."""
    i = html.find("{", start_idx)
    if i < 0:
        raise SystemExit("no JSON object start")
    depth = 0
    in_str = False
    esc = False
    for j in range(i, len(html)):
        ch = html[j]
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
                return html[i : j + 1], j + 1
    raise SystemExit("unbalanced JSON object")


def extract_trees(html: str):
    sql_key = "const SQL_KNOWLEDGE_TREE = "
    ml_key = "const ML_KNOWLEDGE_TREE = "
    kg_key = "const KG_TREES = "
    si = html.find(sql_key)
    mi = html.find(ml_key)
    ki = html.find(kg_key)
    if min(si, mi, ki) < 0:
        raise SystemExit("Cannot find SQL/ML/KG_TREES markers")
    sql_txt, _ = extract_json_object(html, si + len(sql_key))
    ml_txt, _ = extract_json_object(html, mi + len(ml_key))
    sql = json.loads(sql_txt)
    ml = json.loads(ml_txt)
    # span from SQL const through KG_TREES object for later replace helpers
    _, kg_end = extract_json_object(html, ki + len(kg_key))
    # include trailing semicolon if present
    if kg_end < len(html) and html[kg_end] == ";":
        kg_end += 1
    class Span:
        def start(self_inner):
            return si
        def end(self_inner):
            return kg_end
    return Span(), sql, ml


def dump_lessons(sql, ml, python, etl, dwh, bi):
    mapping = {
        "sql.json": sql,
        "ml.json": ml,
        "python.json": python,
        "etl.json": etl,
        "dwh.json": dwh,
        "bi.json": bi,
    }
    for name, tree in mapping.items():
        (LESSONS / name).write_text(
            json.dumps(tree, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print("wrote", name, "nodes≈", json.dumps(tree).count('"id"'))


CSS_EXTRA = r"""
    /* 行业百科式：弧线卫星边 + 章节卡片 + 氛围 */
    #graph.kg-canvas {
      background:
        radial-gradient(ellipse 50% 45% at 50% 42%, rgba(168,85,247,0.10), transparent 65%),
        radial-gradient(ellipse 40% 35% at 20% 70%, rgba(34,211,238,0.06), transparent 60%),
        transparent;
    }
    #graph .kg-particles {
      position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 0;
    }
    #graph .kg-particles span {
      position: absolute; width: 2px; height: 2px; border-radius: 50%;
      background: rgba(148,163,184,0.55);
      animation: kgfloat 18s linear infinite;
    }
    @keyframes kgfloat {
      0% { transform: translateY(0); opacity: 0.15; }
      40% { opacity: 0.55; }
      100% { transform: translateY(-120px); opacity: 0; }
    }
    .sat-link {
      fill: none; stroke-opacity: 0.55; stroke-width: 2.2;
      marker-end: url(#arrow-sat);
    }
    .sat-link.layer-3, .sat-link.layer-4 {
      stroke-width: 1.45; stroke-opacity: 0.4;
    }
    .sat-link.dashed {
      stroke-dasharray: 5 4;
    }
    .sat-node circle {
      stroke: rgba(255,255,255,0.4); stroke-width: 2; cursor: pointer;
      filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.45));
    }
    .sat-node text.sat-label {
      font-family: "Noto Sans SC", var(--font); font-size: 10px; font-weight: 700; fill: #f8fafc;
      pointer-events: none; text-anchor: middle; dominant-baseline: central;
      paint-order: stroke; stroke: rgba(7,11,22,0.85); stroke-width: 3px;
    }
    .sat-node.selected circle {
      stroke: #fff; stroke-width: 3;
      filter: drop-shadow(0 0 16px rgba(255,255,255,0.35));
    }
    .sat-node.is-chapter circle {
      stroke: rgba(251, 191, 36, 0.9); stroke-width: 2.4;
      filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.45));
    }
    .sat-node.is-leaf circle {
      stroke: rgba(52, 211, 153, 0.9); stroke-width: 2.5;
      filter: drop-shadow(0 0 14px rgba(52, 211, 153, 0.55));
    }
    .sat-node.is-branch circle {
      stroke: #fff; stroke-width: 2.8;
      filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.6));
    }
    body.kg-focus-on .node.kg-focus-hub circle {
      stroke: #e9d5ff;
      stroke-width: 3.5;
      fill: #a855f7 !important;
    }
    .chapter-lessons { margin-top: 18px; }
    .chapter-lessons-title {
      font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent);
      margin: 0 0 10px; letter-spacing: 0.04em;
    }
    .lesson-card-list { display: flex; flex-direction: column; gap: 8px; }
    .lesson-card {
      text-align: left; cursor: pointer;
      border: 1px solid rgba(34,211,238,0.28);
      background: rgba(34,211,238,0.06);
      border-radius: 10px; padding: 10px 12px;
      color: var(--text); display: flex; flex-direction: column; gap: 4px;
    }
    .lesson-card:hover { border-color: var(--accent); background: rgba(34,211,238,0.12); }
    .lesson-card.learned { border-color: rgba(52,211,153,0.55); }
    .lesson-card-title { font-weight: 700; font-size: 0.95rem; }
    .lesson-card-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); }
"""


def patch_css(html: str) -> str:
    # Replace old sat-link / sat-node block start markers with enhanced rules by inserting before sql-drill-hint
    if "lesson-card-list" in html:
        print("CSS already patched")
        return html
    anchor = "    .sql-drill-hint {"
    idx = html.find(anchor)
    if idx < 0:
        raise SystemExit("css anchor missing")
    # Also soften duplicate .sat-link rules: leave old ones, new rules override later — insert near end of style
    style_end = html.find("</style>")
    html = html[:style_end] + CSS_EXTRA + "\n  " + html[style_end:]
    return html


def patch_graph_shell(html: str) -> str:
    if 'id="kgParticles"' in html:
        return html
    html = html.replace(
        '<div id="graph">',
        '<div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>',
        1,
    )
    return html


def patch_learn_id(html: str) -> str:
    old = '''    function currentLearnId(hubId) {
      if (hubId && panelState.engineId) return hubId + ":" + panelState.engineId;
      return selectedId;
    }'''
    new = '''    function currentLearnId(hubId) {
      if (kgDrill && kgDrill.active && kgDrill.selectedLeafId) {
        return "kg:" + kgDrill.hubId + ":" + kgDrill.selectedLeafId;
      }
      if (hubId && panelState.engineId) return hubId + ":" + panelState.engineId;
      return selectedId;
    }'''
    if old not in html:
        if "kgDrill && kgDrill.active && kgDrill.selectedLeafId" in html:
            return html
        raise SystemExit("currentLearnId block not found")
    return html.replace(old, new, 1)


def patch_depth_label(html: str) -> str:
    old = '''    function depthLabel() {
      return depthLevel === "junior" ? "初级 · 仅 L1 概念"
        : depthLevel === "senior" ? "高级 · L1–L3 全量"
        : "中级 · L1 概念 + L2 理解";
    }'''
    new = '''    function depthLabel() {
      return depthLevel === "junior" ? "初级 · 仅入门(?)"
        : depthLevel === "senior" ? "高级 · 入门+进阶+高阶"
        : "中级 · 入门+进阶(??)";
    }'''
    if old in html:
        html = html.replace(old, new, 1)
    return html


def patch_set_depth(html: str) -> str:
    """深度切换时若在焦点模式则重绘环。"""
    old = '''    function setDepth(level) {
      depthLevel = level;
      document.getElementById("btnDepthJunior").classList.toggle("active", level === "junior");
      document.getElementById("btnDepthMid").classList.toggle("active", level === "mid");
      document.getElementById("btnDepthSenior").classList.toggle("active", level === "senior");
      if (selectedId) {
        const n = nodes.find(x => x.id === selectedId);
        if (n) renderPanel(n);
      }
    }'''
    new = '''    function setDepth(level) {
      depthLevel = level;
      document.getElementById("btnDepthJunior").classList.toggle("active", level === "junior");
      document.getElementById("btnDepthMid").classList.toggle("active", level === "mid");
      document.getElementById("btnDepthSenior").classList.toggle("active", level === "senior");
      if (kgDrill && kgDrill.active) {
        // 深度过滤知识树可见节点；已展开但被滤掉的分支自动收起
        redrawKgDrill();
        if (kgDrill.selectedLeafId) {
          const cur = findKgNode(kgDrill.selectedLeafId);
          if (cur) openKgSidePanel(cur, kgDrill.panelMode || (isLessonParent(cur) ? "chapter" : "lesson"));
        }
        return;
      }
      if (selectedId) {
        const n = nodes.find(x => x.id === selectedId);
        if (n) renderPanel(n);
      }
    }'''
    if old not in html:
        if "kgDrill && kgDrill.active" in html and "redrawKgDrill();" in html:
            return html
        raise SystemExit("setDepth block not found")
    return html.replace(old, new, 1)


def patch_svg_defs(html: str) -> str:
    if 'id="arrow-sat"' in html:
        return html
    needle = '''    defs.append("marker").attr("id", "arrow-active").attr("viewBox", "0 -4 8 8")
      .attr("refX", 10).attr("refY", 0).attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto")
      .append("path").attr("d", "M0,-4L8,0L0,4").attr("fill", "#22d3ee");'''
    add = needle + '''

    defs.append("marker").attr("id", "arrow-sat").attr("viewBox", "0 -4 8 8")
      .attr("refX", 8).attr("refY", 0).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto")
      .append("path").attr("d", "M0,-3.2L7,0L0,3.2").attr("fill", "#94a3b8");

    // 氛围粒子
    (function spawnParticles() {
      const box = document.getElementById("kgParticles");
      if (!box) return;
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("span");
        s.style.left = (Math.random() * 100) + "%";
        s.style.top = (40 + Math.random() * 60) + "%";
        s.style.animationDelay = (Math.random() * 16) + "s";
        s.style.opacity = String(0.2 + Math.random() * 0.5);
        box.appendChild(s);
      }
    })();'''
    if needle not in html:
        raise SystemExit("arrow-active defs not found")
    return html.replace(needle, add, 1)


def replace_drill_block(html: str, drill_js: str) -> str:
    start = html.find("    /* —— SQL/ML 画布焦点下钻")
    if start < 0:
        start = html.find("    let kgDrill = {")
    if start < 0:
        raise SystemExit("drill block start not found")
    end = html.find("    function clearSatellites()")
    if end < 0:
        raise SystemExit("clearSatellites not found")
    # keep clearSatellites onward; ensure exitKgDrill stop pulse in clearSatellites path via exitKgDrill
    return html[:start] + drill_js.rstrip() + "\n\n    " + html[end:]


def replace_trees(html: str, trees: dict) -> str:
    block = (
        "    const SQL_KNOWLEDGE_TREE = "
        + json.dumps(trees["sql"], ensure_ascii=False, indent=2)
        + ";\n\n    const ML_KNOWLEDGE_TREE = "
        + json.dumps(trees["ml"], ensure_ascii=False, indent=2)
        + ";\n\n    const PYTHON_KNOWLEDGE_TREE = "
        + json.dumps(trees["python"], ensure_ascii=False, indent=2)
        + ";\n\n    const ETL_KNOWLEDGE_TREE = "
        + json.dumps(trees["etl"], ensure_ascii=False, indent=2)
        + ";\n\n    const DWH_KNOWLEDGE_TREE = "
        + json.dumps(trees["dwh"], ensure_ascii=False, indent=2)
        + ";\n\n    const BI_KNOWLEDGE_TREE = "
        + json.dumps(trees["bi"], ensure_ascii=False, indent=2)
        + ";\n\n    const KG_TREES = {\n"
        "      sql: SQL_KNOWLEDGE_TREE,\n"
        "      ml: ML_KNOWLEDGE_TREE,\n"
        "      python: PYTHON_KNOWLEDGE_TREE,\n"
        "      etl: ETL_KNOWLEDGE_TREE,\n"
        "      dwh: DWH_KNOWLEDGE_TREE,\n"
        "      bi: BI_KNOWLEDGE_TREE\n"
        "    };"
    )
    si = html.find("    const SQL_KNOWLEDGE_TREE = ")
    ki = html.find("    const KG_TREES = ")
    if si < 0 or ki < 0:
        raise SystemExit("trees block not found for replace")
    _, kg_end = extract_json_object(html, ki + len("    const KG_TREES = "))
    if kg_end < len(html) and html[kg_end] == ";":
        kg_end += 1
    return html[:si] + block + html[kg_end:]


def patch_hint_text(html: str) -> str:
    html = html.replace(
        "点击大节点展开子环 · SQL/ML 层层下钻 · 末端右侧出详情 · 治理/血缘见节点详情",
        "点击课程节点进入焦点扇区 · 弧线一对多下钻 · 章节导读 / 叶节点讲义 · SQL·Python·ETL·数仓·BI·ML",
        1,
    )
    return html


def write_inject_builder():
    path = ROOT / "_gen" / "inject_lessons.py"
    path.write_text(
        '''# -*- coding: utf-8 -*-
"""Inject _gen/lessons/*.json into 数据知识图谱.html KG_TREES block."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "数据知识图谱.html"
LESSONS = Path(__file__).resolve().parent / "lessons"

ORDER = ["sql", "ml", "python", "etl", "dwh", "bi"]
VAR = {
    "sql": "SQL_KNOWLEDGE_TREE",
    "ml": "ML_KNOWLEDGE_TREE",
    "python": "PYTHON_KNOWLEDGE_TREE",
    "etl": "ETL_KNOWLEDGE_TREE",
    "dwh": "DWH_KNOWLEDGE_TREE",
    "bi": "BI_KNOWLEDGE_TREE",
}

def main():
    trees = {k: json.loads((LESSONS / f"{k}.json").read_text(encoding="utf-8")) for k in ORDER}
    parts = []
    for k in ORDER:
        parts.append(f"    const {VAR[k]} = " + json.dumps(trees[k], ensure_ascii=False, indent=2) + ";")
    kg = "    const KG_TREES = {\\n" + "".join(f"      {k}: {VAR[k]},\\n" for k in ORDER)
    kg = kg.rstrip(",\\n") + "\\n    };"
    block = "\\n\\n".join(parts) + "\\n\\n" + kg
    html = HTML.read_text(encoding="utf-8")
    m = re.search(
        r"    const SQL_KNOWLEDGE_TREE = \\{.*?\\};\\s*\\n\\s*const ML_KNOWLEDGE_TREE = \\{.*?\\};"
        r"(?:\\s*\\n\\s*const PYTHON_KNOWLEDGE_TREE = \\{.*?\\};)?"
        r"(?:\\s*\\n\\s*const ETL_KNOWLEDGE_TREE = \\{.*?\\};)?"
        r"(?:\\s*\\n\\s*const DWH_KNOWLEDGE_TREE = \\{.*?\\};)?"
        r"(?:\\s*\\n\\s*const BI_KNOWLEDGE_TREE = \\{.*?\\};)?"
        r"\\s*\\n\\s*const KG_TREES = \\{.*?\\};",
        html,
        re.S,
    )
    if not m:
        raise SystemExit("KG trees block not found")
    HTML.write_text(html[: m.start()] + block + html[m.end() :], encoding="utf-8")
    print("injected lessons into", HTML)

if __name__ == "__main__":
    main()
''',
        encoding="utf-8",
    )
    print("wrote inject_lessons.py")


def sync_runtime_note():
    """Append pointer in runtime.js so build path knows drill lives in HTML / kg_drill_runtime.js."""
    note = (
        "\n/* NOTE: Focus-drill runtime is maintained in kg_drill_runtime.js "
        "and applied into 数据知识图谱.html by apply_tutorial_upgrade.py / inject_lessons.py */\n"
    )
    text = RUNTIME.read_text(encoding="utf-8")
    if "kg_drill_runtime.js" not in text:
        RUNTIME.write_text(text + note, encoding="utf-8")


def main():
    html = HTML.read_text(encoding="utf-8")
    m, sql_raw, ml_raw = extract_trees(html)
    sql = enhance_sql(sql_raw)
    ml = enhance_ml(ml_raw)
    python = build_python()
    etl = build_etl()
    dwh = build_dwh()
    bi = build_bi()
    dump_lessons(sql, ml, python, etl, dwh, bi)

    trees = {"sql": sql, "ml": ml, "python": python, "etl": etl, "dwh": dwh, "bi": bi}
    html = replace_trees(html, trees)
    html = patch_css(html)
    html = patch_graph_shell(html)
    html = patch_hint_text(html)
    html = patch_learn_id(html)
    html = patch_depth_label(html)
    html = patch_set_depth(html)
    html = patch_svg_defs(html)

    drill = DRILL_JS.read_text(encoding="utf-8")
    # ensure marker comment at top for future replaces
    if not drill.lstrip().startswith("/*"):
        drill = "/* —— SQL/ML 画布焦点下钻（对齐行业百科） —— */\n" + drill
    else:
        # normalize start marker expected by replace_drill_block
        drill = "/* —— SQL/ML 画布焦点下钻（行业百科式扇形弧线 + 章节/讲义侧栏） —— */\n" + re.sub(
            r"^/\*.*?\*/\s*", "", drill.lstrip(), count=1, flags=re.S
        )
    html = replace_drill_block(html, "    " + drill.replace("\n", "\n    ").rstrip() + "\n")

    # Fix clearSatellites to stop pulse
    html = html.replace(
        """    function clearSatellites() {
      expandedHubId = null;
      if (kgDrill && kgDrill.active) exitKgDrill();""",
        """    function clearSatellites() {
      expandedHubId = null;
      if (typeof stopKgPulse === "function") stopKgPulse();
      if (kgDrill && kgDrill.active) exitKgDrill();""",
        1,
    )

    HTML.write_text(html, encoding="utf-8")
    write_inject_builder()
    sync_runtime_note()
    print("HTML updated:", HTML)
    print("lines:", HTML.read_text(encoding="utf-8").count("\n") + 1)


if __name__ == "__main__":
    main()
