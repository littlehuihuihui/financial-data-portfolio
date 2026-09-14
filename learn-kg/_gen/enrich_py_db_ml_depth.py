# -*- coding: utf-8 -*-
"""
Deepen Python / Database / ML leaf lessons to gold depth.

Reads _gen/lessons/{python,database,ml}.json, rewrites leaf content to the
constitution template (课前→样例→是什么→怎么写→结果→用在哪→易错→动手),
writes JSON back, and can inject via inject_lessons.py.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LESSONS = ROOT / "lessons"

SHARED_SAMPLE = {
    "python": (
        "与教程宪法同源四表（`users` / `orders` / `order_items` / `order_events`）。\n"
        "本课默认已在 notebook 中执行过宪法构造代码。"
    ),
    "database": (
        "与 SQL/数据库教程宪法同源四表：`users`、`orders`、`order_items`、`order_events`。\n"
        "可在 MySQL 8+ / PostgreSQL / DuckDB 上对照练习。"
    ),
    "ml": (
        "业务侧仍用同源订单样例构造特征；模型侧用 sklearn 玩具矩阵演示 API。\n"
        "约定：按时间切分训练/验证，禁止随机打乱造成穿越。"
    ),
}

HUB_LANG = {"python": "python", "database": "sql", "ml": "python"}


def lesson(s: str) -> str:
    return s.strip() + "\n"


def deepen_tail(hub: str, title: str) -> str:
    t = title or ""
    if hub == "python":
        contrast = (
            f"| 维度 | 「{t}」常见做法 | 易混替代 |\n"
            "|---|---|---|\n"
            "| 计算位置 | pandas 内存表 | SQL/DuckDB 下推 |\n"
            "| 写法 | 向量化/`assign` | 行循环 `iterrows` |\n"
            "| 验收 | 与 SQL 同口径 diff | 只看 head 几行 |"
        )
        experiment = (
            "1. 用宪法四表跑通主路径代码\n"
            "2. 改一个过滤条件，预测 shape 再验证\n"
            "3. 把结果和等价 SQL 各算一遍做 diff"
        )
        checklist = (
            "- [ ] 空值/类型已声明处理策略\n"
            "- [ ] 无链式赋值警告\n"
            "- [ ] 关键指标可与数仓口径对齐\n"
            "- [ ] 代码可在新环境 import 后复现"
        )
        ask = (
            f"- 若数据量再大 10 倍，「{t}」还应留在 pandas 吗？阈值是什么？\n"
            "- 和 SQL 同学对口径时，你用哪 3 个字段做 join key / 过滤条件？\n"
            "- 写出一个会让结果静默错误的写法（不是报错那种）。"
        )
    elif hub == "database":
        if any(k in t for k in ("ACID", "事务", "隔离", "锁", "MVCC", "WAL", "脏读", "幻读")):
            contrast = (
                f"| 维度 | 「{t}」 | 易混说法 |\n"
                "|---|---|---|\n"
                "| 正确性 | 事务边界 + 约束 | 「应用保证就行」 |\n"
                "| 并发 | 隔离级别/锁/MVCC | 「开了事务就无并发问题」 |\n"
                "| 持久 | WAL/刷盘/备份 | 「提交了就永不丢」忽略介质故障 |"
            )
            experiment = (
                "1. 两会话演练：提交/回滚/并发读\n"
                "2. 故意制造冲突或长事务，观察阻塞\n"
                "3. 用官方文档核对你使用的隔离级别默认值"
            )
            checklist = (
                "- [ ] 能画出事务成功/失败两条路径\n"
                "- [ ] 知道默认隔离级别\n"
                "- [ ] 长事务风险说得清\n"
                "- [ ] 备份与 binlog/WAL 角色不混淆"
            )
        elif any(k in t for k in ("索引", "EXPLAIN", "覆盖", "统计")):
            contrast = (
                f"| 维度 | 「{t}」 | 易混说法 |\n"
                "|---|---|---|\n"
                "| 验证 | EXPLAIN/ANALYZE | 凭感觉加索引 |\n"
                "| 设计 | 按查询建组合索引 | 每列一个索引 |\n"
                "| 代价 | 写放大与空间 | 「索引越多越快」 |"
            )
            experiment = (
                "1. 无索引 vs 有索引各跑一次 EXPLAIN\n"
                "2. 写一个索引失效条件并验证\n"
                "3. 估算 rows 与真实行数差距"
            )
            checklist = (
                "- [ ] 关键 SQL 有执行计划截图/文字\n"
                "- [ ] 最左前缀说得清\n"
                "- [ ] 知道如何避免函数包裹索引列\n"
                "- [ ] 变更有回滚方案"
            )
        else:
            contrast = (
                f"| 维度 | 「{t}」 | 易混概念 |\n"
                "|---|---|---|\n"
                "| 负载 | OLTP vs OLAP 放对地方 | 主库硬扛分析 |\n"
                "| 模型 | 约束与类型选对 | 全用 VARCHAR/FLOAT |\n"
                "| 运维 | 备份/复制/池化 | 只关注功能正确 |"
            )
            experiment = (
                "1. 在样例库写出最小可运行示例\n"
                "2. 做一次故意失败并记录报错\n"
                "3. 用一句话向非 DBA 解释本课价值"
            )
            checklist = (
                "- [ ] 失败可回滚或报错可定位\n"
                "- [ ] 与业务口径（状态机/金额）一致\n"
                "- [ ] 性能与正确性都有验收点\n"
                "- [ ] 术语与团队文档对齐"
            )
        ask = (
            f"- 生产上「{t}」配错时，用户侧最先看到什么症状？\n"
            "- 你如何用一张图向后端解释本课？\n"
            "- 写出回滚/降级策略的一句话版本。"
        )
    else:
        contrast = (
            f"| 维度 | 「{t}」 | 易混替代 |\n"
            "|---|---|---|\n"
            "| 切分 | 时间切分/业务切分 | 随机打乱造成穿越 |\n"
            "| 指标 | 与业务代价对齐 | 只报准确率 |\n"
            "| 复杂度 | 先强基线 | 一上来深度网络 |"
        )
        experiment = (
            "1. 固定种子跑通主路径\n"
            "2. 对比「正确切分」vs「泄漏切分」指标差\n"
            "3. 抽 5 个坏例做误差分析并记录"
        )
        checklist = (
            "- [ ] 标签定义成文\n"
            "- [ ] 无未来信息进特征\n"
            "- [ ] 验证/测试职责分离\n"
            "- [ ] 模型与数据版本可追溯"
        )
        ask = (
            f"- 若业务说「只要准确率」，你如何把「{t}」翻译成代价语言？\n"
            "- 上线一周指标掉了，你先查数据、特征还是模型？\n"
            "- 什么情况下应停用本方法，换更简单/更复杂方案？"
        )
    return (
        f"### 对照辨析\n\n{contrast}\n\n"
        f"### 最小实验\n\n{experiment}\n\n"
        f"### 交付检查单\n\n{checklist}\n\n"
        f"### 常见追问\n\n{ask}"
    )


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="python"):
    return lesson(
        f"""### 课前

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

### 运行结果

{result}

### 用在哪

{uses}

### 易错对照

{traps}

### 动手

{drill}
"""
    )


def ensure_tail(content: str, hub: str, title: str) -> str:
    if "### 对照辨析" in (content or ""):
        return content
    return (content or "").rstrip() + "\n\n" + deepen_tail(hub, title) + "\n"


def walk_leaves(n, acc=None):
    acc = [] if acc is None else acc
    kids = n.get("children") or []
    if not kids:
        acc.append(n)
    for c in kids:
        walk_leaves(c, acc)
    return acc


def parse_sections(content: str) -> dict[str, str]:
    content = (content or "").strip()
    if not content:
        return {}
    parts = re.split(r"(?=^### )", content, flags=re.M)
    out: dict[str, str] = {}
    for p in parts:
        p = p.strip()
        if not p.startswith("###"):
            continue
        first, _, rest = p.partition("\n")
        title = first.lstrip("#").strip()
        # normalize aliases
        key = title
        for a, b in [
            ("课前 · 这是什么", "课前"),
            ("查询结果", "运行结果"),
            ("注意啥", "易错对照"),
        ]:
            if title.startswith(a) or title == a:
                key = b
                break
        if title.startswith("课前"):
            key = "课前"
        elif "是什么" in title:
            key = "是什么"
        elif "怎么写" in title:
            key = "怎么写"
        elif title.startswith("样例"):
            key = "样例输入"
        elif "结果" in title:
            key = "运行结果"
        elif "用在哪" in title:
            key = "用在哪"
        elif "易错" in title or "注意" in title:
            key = "易错对照"
        elif "动手" in title:
            key = "动手"
        out[key] = rest.strip()
    return out


def extract_code(how: str) -> tuple[str, str]:
    """Return (code, prose_around)."""
    if not how:
        return "", ""
    m = re.search(r"```(?:\w+)?\n(.*?)```", how, re.S)
    if not m:
        return how.strip(), ""
    code = m.group(1).strip()
    prose = (how[: m.start()] + how[m.end() :]).strip()
    return code, prose


def bullets_to_traps(text: str) -> str:
    lines = []
    for ln in (text or "").splitlines():
        s = ln.strip()
        if s.startswith("- "):
            s = s[2:].strip()
            s = re.sub(r"^\*\*[^*]+\*\*[：:]\s*", "", s)
            lines.append(s)
        elif re.match(r"^\d+\.", s):
            lines.append(re.sub(r"^\d+\.\s*", "", s))
    if not lines and text.strip().startswith("|"):
        return text.strip()
    if not lines:
        lines = ["只背定义不写样例", "把训练集分数当上线指标", "漏掉验收步骤"]
    rows = ["| 错法 | 现象/风险 | 纠正 |", "|---|---|---|"]
    for i, ln in enumerate(lines[:6]):
        # split on ： or —
        if "→" in ln:
            a, b = ln.split("→", 1)
            rows.append(f"| {a.strip()} | 结果偏离 | {b.strip()} |")
        elif "：" in ln or ":" in ln:
            a, b = re.split(r"[：:]", ln, 1)
            rows.append(f"| {a.strip()} | 常见踩坑 | {b.strip()} |")
        else:
            fix = ["对照样例复现", "补验证集/验收SQL", "写清边界条件"][i % 3]
            rows.append(f"| {ln[:48]} | 口径/效果偏差 | {fix} |")
    return "\n".join(rows)


def uses_block(text: str) -> str:
    if not text:
        return "1. **课堂练习**：对照样例复现\n2. **业务落地**：接到真实表后先小样本验证\n3. **评审沟通**：用本课术语对齐预期"
    if text.strip()[0].isdigit() or text.strip().startswith("1."):
        # already numbered — expand slightly if short
        lines = [ln for ln in text.splitlines() if ln.strip()]
        while len(lines) < 3:
            lines.append(f"{len(lines)+1}. 对照相邻课做对比练习")
        return "\n".join(lines[:6])
    return text


def scene_for(hub: str, title: str, lid: str) -> str:
    bank = {
        "python": f"分析师要用 pandas 完成「{title}」，并与 SQL 同学口径对齐。",
        "database": f"业务库上线前要弄清「{title}」，避免性能/一致性事故。",
        "ml": f"建模同学在订单转化/风控场景里要用到「{title}」。",
    }
    return bank[hub]


def goal_for(hub: str, title: str) -> str:
    return f"吃透「{title}」的定义、可运行写法、适用边界与常见翻车点；能独立在样例上复现。"


def prereq_for(hub: str, lid: str) -> str:
    if "path" in lid or "constitution" in lid:
        return "无（入口课）"
    if hub == "python":
        return "教程宪法（已构造四表）"
    if hub == "database":
        return "数据库教程宪法 / 对应路径清单"
    return "监督学习基础 + 训练/验证切分意识"


def expand_what(what: str, title: str, hub: str) -> str:
    base = what.strip() if what else f"- **一句话定义**：本课讲解「{title}」。"
    extras = [
        f"- **直觉**：把「{title}」想成工作流里的一个可复用积木——输入明确、输出可验收。",
        "- **边界**：能说清「什么时候不该用」比背 API 更重要；本课易错表会反复强调。",
        "- **对照**：学完后应能向同事用业务语言解释「为什么选它而不是相邻方案」。",
    ]
    # avoid duplicating if already long
    if len(base) > 400 and "直觉" in base:
        return base
    return base + "\n" + "\n".join(extras)


def expand_code(code: str, prose: str, hub: str, title: str, lang: str) -> str:
    code = (code or "").strip()
    if not code:
        if hub == "database":
            code = f"-- {title}：在样例库上验证概念\nSELECT 1 AS ok;"
        elif hub == "ml":
            code = (
                f"# {title}：最小可运行骨架（接你的 X/y）\n"
                "from sklearn.model_selection import train_test_split\n"
                "# X_train, X_test, y_train, y_test = train_test_split(...)\n"
                "print('wire your estimator here')"
            )
        else:
            code = f"# {title}\nprint(orders.head())"
    header = f"# === {title}：主路径（先跑通）===\n" if lang != "sql" else f"-- === {title}：主路径 ===\n"
    if not code.lstrip().startswith(("#", "--")):
        code = header + code
    # second block: checklist
    if lang == "sql":
        footer = (
            "\n\n-- === 验收清单 ===\n"
            "-- 1) EXPLAIN / 行数是否符合预期\n"
            "-- 2) 与业务口径（paid / 去重键）是否一致\n"
            "-- 3) 失败路径是否有 ROLLBACK / 约束报错可理解"
        )
    elif hub == "ml":
        footer = (
            "\n\n# === 验收清单 ===\n"
            "# 1) 仅在训练集 fit 预处理\n"
            "# 2) 验证集指标 + 业务分层切片\n"
            "# 3) 固定 random_state，记录数据版本"
        )
    else:
        footer = (
            "\n\n# === 验收清单 ===\n"
            "# 1) shape / dtypes / 空值率\n"
            "# 2) 与 SQL 同学同一过滤条件下指标一致\n"
            "# 3) 禁止链式赋值；优先 assign / loc"
        )
    body = code
    if prose:
        body = f"# 说明：{prose[:120]}\n" + body if lang != "sql" else f"-- 说明：{prose[:120]}\n" + body
    if "验收清单" not in body:
        body = body + footer
    return body


def result_for(hub: str, title: str, existing: str) -> str:
    if existing and len(existing) > 40:
        return existing.strip() + "\n\n**验收口令**：能向同伴口述「输入→变换→输出」三步，并指出一个反例。"
    if hub == "database":
        return (
            "对照样例应能指出：访问路径（是否走索引）、影响行数、事务是否同成同败。\n\n"
            "| 检查项 | 期望 |\n|---|---|\n"
            "| 结果行数 | 与手算/子查询一致 |\n"
            "| 约束冲突 | 报错信息可定位 |\n"
            "| 性能直觉 | rows / key 说得清 |"
        )
    if hub == "ml":
        return (
            "跑通后至少打印：训练集大小、验证指标、一个失败案例分析。\n\n"
            "| 检查项 | 期望 |\n|---|---|\n"
            "| 无穿越 | 时间切分严格 |\n"
            "| 可复现 | 固定种子+版本 |\n"
            "| 可解释 | 能说出主驱动特征/规则 |"
        )
    return (
        "输出与手算一致；`shape`/空值率符合预期；与 SQL 同口径时指标对齐。\n\n"
        "| 检查项 | 期望 |\n|---|---|\n"
        "| 行数 | 过滤后可手算 |\n"
        "| 类型 | datetime/category 正确 |\n"
        "| 空值 | 策略与文档一致 |"
    )


def drill_for(hub: str, title: str, existing: str) -> str:
    if existing and len(existing) > 20:
        return existing.strip() + "\n\n写一句「什么情况下我不用这个方法」。"
    if hub == "database":
        return f"在样例库实现「{title}」最小演示，并故意制造一个失败用例，记录报错与纠正。"
    if hub == "ml":
        return f"用时间切分重跑「{title}」；对比随机切分的指标差异，写下你会如何向业务解释。"
    return f"用宪法四表独立复现「{title}」；把结果导出与 SQL 同学 diff 一次。"


# ── curated deep overrides (priority) ─────────────────────────────────────
# Keep these meaty; generic expander fills the rest.


def curated() -> dict[str, str]:
    C: dict[str, str] = {}

    # —— Python core ——
    C["py-dataframe"] = gold(
        "刚构造完宪法四表，要确认表结构再开始清洗。",
        "熟练使用 shape/dtypes/head/describe；分清 loc（标签）与 iloc（位置）。",
        "py-constitution → 下一课：筛选与赋值",
        SHARED_SAMPLE["python"],
        "- **一句话定义**：带行列标签的二维表，是 pandas 的核心对象。\n"
        "- **核心能力**：体检（shape/dtypes/空值）、定位（loc/iloc）、拷贝意识。\n"
        "- **直觉**：把 DataFrame 当「带表头的 SQL 结果集」，但索引语义更强。\n"
        "- **边界**：超大表优先下推 SQL/DuckDB；pandas 适合中小灵活分析。",
        """import pandas as pd
print(orders.shape)          # (8, 5)
print(orders.dtypes)
print(orders.head(3))
print(orders.isna().mean().round(3))

# loc：标签；iloc：位置
print(orders.loc[0, "order_id"], orders.iloc[0, 0])

# 安全改列：用 assign，避免链式赋值
orders2 = orders.assign(amount_filled=lambda d: d["amount"].fillna(0))
print(orders2[["order_id", "amount", "amount_filled"]].head())""",
        "`shape=(8,5)`；`amount` 为 float（因含 NaN）；`users.city` 有 1 个空值。",
        "1. **读数体检**：任何新表先 shape/dtypes/空值率\n"
        "2. **对接 SQL**：同一 SELECT 拉到 pandas 后对齐口径\n"
        "3. **单元测试**：断言关键列非空、主键唯一",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 混用 loc/iloc | 取错行或 KeyError | 标签→loc，位置→iloc |\n"
        "| `df[col][mask]=` 链式赋值 | SettingWithCopyWarning / 没写上 | `loc` 或 `assign` |\n"
        "| 改视图当拷贝 | 源表被意外修改 | 明确 `copy()` |",
        "统计 `users.city` 空值个数，并用一句话解释为什么 `amount` 是 float 而不是 int。",
        "python",
    )

    C["py-filter"] = gold(
        "只要「上海用户」的支付订单明细。",
        "掌握布尔筛选、`query`、多条件组合与 `assign` 派生列。",
        "DataFrame 基础 → 下一课：缺失与类型",
        SHARED_SAMPLE["python"],
        "- **一句话定义**：按条件留下需要的行，并可派生新列。\n"
        "- **骨架**：`df[cond]` / `df.query(...)` / `df.loc[cond, cols]`。\n"
        "- **直觉**：等价于 SQL `WHERE` + `SELECT` 新列。\n"
        "- **边界**：复杂逻辑优先可读的 `query` 或中间布尔变量，避免一行里塞五个 `&`。",
        """paid = orders.query("status == 'paid'")
sh_ids = users.loc[users["city"] == "上海", "user_id"]
out = (
    paid.loc[paid["user_id"].isin(sh_ids)]
    .assign(gmv=lambda d: d["amount"].fillna(0))
    .sort_values("created_at")
)
print(out[["order_id", "user_id", "gmv", "created_at"]])

# 多条件：括号 + & | ~
hi = orders.loc[(orders["status"] == "paid") & (orders["amount"].fillna(0) >= 100)]
print(hi["order_id"].tolist())""",
        "上海支付订单含 Ada/Cara 的 paid 单；高额 paid 至少含 102、103、107（视过滤）。",
        "1. **漏斗明细**  2. **异常单排查**  3. **特征表预过滤**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 用 `and` 代替 `&` | 报错 | 用 `&`/`|` 并加括号 |\n"
        "| 先 merge 再滤大表 | 内存爆 | 先滤再关联 |\n"
        "| 比较 NaN 用 `==` | 永假 | `isna()` / `fillna` |",
        "筛出 `cancelled` 或 `amount` 为空的订单，输出 order_id 列表。",
        "python",
    )

    C["py-group"] = gold(
        "要按用户汇总支付 GMV，并与用户维表合并展示。",
        "掌握 groupby 聚合、`agg` 多指标、`as_index=False` 习惯。",
        "缺失与类型 → 下一课：merge",
        SHARED_SAMPLE["python"],
        "- **一句话定义**：按键分组后做汇总（等价 SQL GROUP BY）。\n"
        "- **核心**：分组键、聚合函数、多列 `agg`、排序。\n"
        "- **直觉**：先压缩成「每组一行」，再谈排名与分层。\n"
        "- **边界**：明细字段不要进 GROUP BY；一对多先聚合再 join。",
        """gmv = (
    orders.query("status=='paid'")
    .assign(amount=lambda d: d["amount"].fillna(0))
    .groupby("user_id", as_index=False)
    .agg(gmv=("amount", "sum"), orders=("order_id", "nunique"))
    .sort_values("gmv", ascending=False)
)
print(gmv)
print(users.merge(gmv, on="user_id", how="left").fillna({"gmv": 0, "orders": 0}))""",
        "Ada GMV 较高；Dan 无订单则左连接后为 0。",
        "1. **用户价值分层**  2. **日报聚合**  3. **防 JOIN 爆炸的预聚合**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 对明细 sum 后再与 items join | GMV 放大 | 先按订单聚合 items |\n"
        "| `groupby` 后忘记 reset | 索引难 merge | `as_index=False` |\n"
        "| 用 `count` 当 `nunique` | 重复行虚高 | 分清计数语义 |",
        "按 `status` 统计订单数与金额合计（空金额当 0）。",
        "python",
    )

    C["py-merge"] = gold(
        "用户表要挂上「是否下过单」与 GMV，且不能因为明细行爆炸。",
        "掌握 how=left/inner、indicator、防爆炸（先聚合再 merge）。",
        "groupby → 下一课：透视",
        SHARED_SAMPLE["python"],
        "- **一句话定义**：按键把两张表横着拼起来（SQL JOIN）。\n"
        "- **核心**：连接键、how、一对多爆炸、`validate`/`indicator`。\n"
        "- **直觉**：维表 left join 事实聚合结果，而不是 left join 明细再 sum。\n"
        "- **边界**：多键关联写全；后缀 `_x/_y` 要立刻 rename。",
        """# 正确：先聚合订单，再挂用户
agg = (
    orders.query("status=='paid'")
    .assign(amount=lambda d: d["amount"].fillna(0))
    .groupby("user_id", as_index=False)["amount"].sum()
    .rename(columns={"amount": "gmv"})
)
u = users.merge(agg, on="user_id", how="left").fillna({"gmv": 0})
print(u)

# 找从未下单用户
flag = users.merge(orders[["user_id"]].drop_duplicates(), on="user_id", how="left", indicator=True)
print(flag.loc[flag["_merge"] == "left_only", ["user_id", "user_name"]])""",
        "从未下单用户为 Dan；Ada 有 GMV。",
        "1. **宽表特征**  2. **完整性审计（孤儿行）**  3. **与 SQL JOIN 口径对齐**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| users⋈order_items 后 sum 金额 | GMV 放大 | 先按 order 聚合 |\n"
        "| 默念 inner 丢维表用户 | 名单不全 | 报表常用 left |\n"
        "| 键类型一边 int 一边 str | 匹配为空 | 统一类型 |",
        "用 merge 统计每个 sku 被多少不同用户买过（经 orders 关联）。",
        "python",
    )

    C["py-sklearn"] = gold(
        "要用订单行为做一个是否高价值用户的基线分类，并保证可复现。",
        "用 Pipeline + 时间切分意识搭一条最小 sklearn 基线。",
        "pandas 聚合能力；建议先读 ML「训练流水线」",
        SHARED_SAMPLE["python"] + "\n特征示例：用户历史 paid GMV、订单数。",
        "- **一句话定义**：sklearn 提供统一的 fit/predict API 与 Pipeline 组合。\n"
        "- **核心**：`Pipeline`、`train_test_split`（或时间切）、指标、随机种子。\n"
        "- **直觉**：先有可复现基线，再谈复杂模型。\n"
        "- **边界**：大数据特征工程仍常在 SQL/Spark；sklearn 适合中小表与原型。",
        """import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score

feat = (
    orders.assign(amount=lambda d: d["amount"].fillna(0),
                  paid=lambda d: (d["status"] == "paid").astype(int))
    .groupby("user_id", as_index=False)
    .agg(gmv=("amount", "sum"), n=("order_id", "count"), paid_n=("paid", "sum"))
)
# 玩具标签：gmv>=100 视为高价值（真实业务请换标准）
feat["y"] = (feat["gmv"] >= 100).astype(int)
X, y = feat[["gmv", "n", "paid_n"]], feat["y"]
# 小样本仅演示 API；真实请按时间切分
pipe = Pipeline([
    ("sc", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000, random_state=42)),
])
pipe.fit(X, y)
print("auc_on_train_demo", roc_auc_score(y, pipe.predict_proba(X)[:, 1]))""",
        "管道可 fit；玩具 AUC 仅作 API 验收，不能当上线指标。",
        "1. **建模原型**  2. **与特征表联调**  3. **进 ML 树深化评估**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 随机切分时序业务 | 穿越虚高 | 时间切分 |\n"
        "| 先全表标准化再切分 | 泄漏 | Pipeline 内 fit |\n"
        "| 只看训练准确率 | 过拟合幻觉 | 留验证/测试 |",
        "把标签改成「是否有过 cancelled」，重跑管道并解释特征是否合理。",
        "python",
    )

    # —— Database core ——
    C["db-oltp-olap"] = gold(
        "订单库又要支撑下单，又有人直接扫全表算日报，系统开始抖。",
        "分清 OLTP 与 OLAP 的负载画像，知道什么该进仓/副本。",
        "db-constitution → ACID / 引擎",
        SHARED_SAMPLE["database"],
        "- **一句话定义**：OLTP 服务短事务点查更新；OLAP 服务大范围扫描聚合分析。\n"
        "- **核心差异**：延迟 vs 吞吐、行存 vs 列存、索引点查 vs 批扫。\n"
        "- **直觉**：收银台（OLTP）和经分报表（OLAP）不要抢同一条结账通道。\n"
        "- **边界**：小型团队可同库分时段；规模上来必须读写分离或进仓。",
        """-- OLTP 画像：按主键/状态点查
SELECT * FROM orders WHERE order_id = 101;
UPDATE orders SET status='paid' WHERE order_id=104 AND status='created';

-- OLAP 画像：大范围聚合（应落到副本/仓/列存）
SELECT DATE(created_at) AS d, SUM(amount) AS gmv
FROM orders
WHERE status='paid'
GROUP BY DATE(created_at);""",
        "点查走主键；日报聚合若在主库长扫，易拖垮 OLTP。",
        "1. **架构评审**  2. **慢查询归因**  3. **选型（MySQL vs CH）**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 在主库跑巨大 GROUP BY | 抖动/锁等待 | 进仓或只读副本 |\n"
        "| 给 OLAP 表狂建点查索引 | 写入变慢 | 列存/投影 |\n"
        "| 用缓存硬扛分析 | 口径不一致 | 明确数仓链路 |",
        "列出你们环境里 3 条 SQL，标注各自更像 OLTP 还是 OLAP，并给出放置建议。",
        "sql",
    )

    C["db-acid"] = gold(
        "支付成功必须同时写订单状态与事件表，不允许只成功一半。",
        "理解原子性/一致性/隔离性/持久性在业务事务中的含义。",
        "OLTP vs OLAP → 事务边界",
        SHARED_SAMPLE["database"],
        "- **一句话定义**：事务把多步读写捆成「要么全成要么全败」的单元，并保证并发与落盘语义。\n"
        "- **拆解**：A 原子 · C 约束始终成立 · I 隔离级别 · D 提交后不怕宕机（WAL）。\n"
        "- **直觉**：转账不是两条 UPDATE，而是一个事务。\n"
        "- **边界**：跨库/跨服务需要额外模式（本地消息表、Saga），不是单机 ACID 自动覆盖。",
        """START TRANSACTION;
  UPDATE orders SET status='paid'
   WHERE order_id=104 AND status='created';
  INSERT INTO order_events(event_id, order_id, event_type, event_time)
  VALUES (8, 104, 'paid', '2024-01-01 12:05:00');
COMMIT;
-- 任一步失败：ROLLBACK；不要默默吞错""",
        "104 变为 paid，且事件表有对应 paid；中途失败则两者都不变。",
        "1. **资金/库存**  2. **状态机流转**  3. **审计事件同事务**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 两表分两次自动提交 | 半成功 | 显式事务 |\n"
        "| 长事务塞报表 | 锁膨胀 | 短事务+拆分 |\n"
        "| 以为 ACID=不需备份 | 误删难回 | 备份/binlog |",
        "设计「取消订单」事务：改 status + 写事件；写出失败时如何回滚。",
        "sql",
    )

    C["db-btree-index"] = gold(
        "列表页按 status + created_at 筛选开始变慢。",
        "理解 BTree 索引如何加速等值/范围查询，以及组合索引最左前缀。",
        "主键与约束 → EXPLAIN",
        SHARED_SAMPLE["database"],
        "- **一句话定义**：BTree（常见为 B+Tree）把键有序组织，支持快速定位与范围扫。\n"
        "- **核心**：最左前缀、选择性、回表、覆盖索引。\n"
        "- **直觉**：书的目录——先定位章节再翻页；目录本身也占空间。\n"
        "- **边界**：低基数列（如只有几个 status）单独建索引收益有限，常组合进时间列。",
        """-- 组合索引：等值列在前，范围/排序列在后（常见经验）
CREATE INDEX idx_orders_status_created ON orders (status, created_at);

EXPLAIN
SELECT order_id, amount
FROM orders
WHERE status='paid' AND created_at >= '2024-01-01'
ORDER BY created_at
LIMIT 50;""",
        "EXPLAIN 中应能看到可能使用 `idx_orders_status_created`；关注 key/rows/Extra。",
        "1. **列表/检索接口**  2. **后台筛选**  3. **关联键加速**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 在索引列包函数 | 索引失效 | 改写条件 |\n"
        "| 每列一个单列索引 | 优化器难选/写放大 | 按查询建组合 |\n"
        "| 只建索引不看 EXPLAIN | 主观感觉 | 用计划验证 |",
        "给「按 user_id 查最近订单」设计索引，并写一条 EXPLAIN 验证思路。",
        "sql",
    )

    C["db-mvcc"] = gold(
        "报表事务跑很久，同时还有人在改订单，却希望读到稳定快照。",
        "建立 MVCC 直觉：读不一定阻塞写，写通过版本/undo 共存。",
        "WAL → 隔离级别",
        SHARED_SAMPLE["database"],
        "- **一句话定义**：多版本并发控制让读写通过行版本共存，减少锁冲突。\n"
        "- **核心**：快照、undo/版本链、读视图、与隔离级别的关系。\n"
        "- **直觉**：每人看到自己开启时的「照片」，而不是抢同一支笔。\n"
        "- **边界**：不是魔法——长事务拖住版本清理；写写冲突仍要锁。",
        """-- 概念演示（会话 A/B 口述演练）
-- A: START TRANSACTION; SELECT SUM(amount) FROM orders WHERE status='paid';
-- B: 同时 UPDATE 某行 amount
-- A: 再次 SELECT——在 RR/快照读下常仍见开启时快照（以引擎为准）
-- 课后对照：脏读/不可重复读/幻读 专课""",
        "能画出「读快照 vs 当前读（锁读）」两条路径。",
        "1. **长查询与短更新并存**  2. **解释锁等待**  3. **隔离级别选型**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 超长未提交事务 | 版本膨胀/清理慢 | 缩短事务 |\n"
        "| 把 MVCC 当成无锁 | 写冲突仍死锁 | 区分读写 |\n"
        "| 忽略引擎差异 | MySQL/PG 细节不同 | 查文档对照 |",
        "用两会话演练：A 快照读期间 B 更新，记录两次读是否变化，并对照隔离级别。",
        "sql",
    )

    # —— ML core ——
    C["ml-supervised"] = gold(
        "风控要用历史案件标签预测新订单是否欺诈。",
        "能判断业务是否适合监督学习，并搭最小训练-评估闭环。",
        "无 → 训练/验证/测试",
        SHARED_SAMPLE["ml"],
        "- **一句话定义**：用带标签样本学习映射 \\(f(X)\\to y\\)，服务分类或回归。\n"
        "- **核心要素**：特征 \\(X\\)、标签 \\(y\\)、模型、损失、泛化评估。\n"
        "- **直觉**：考试有标准答案，先做历年卷再上考场。\n"
        "- **边界**：标签贵/稀缺时考虑半监督；无标签结构发现走无监督；长期决策可考虑 RL。\n"
        "- **标签纪律**：标签定义必须与业务动作一致（「欺诈」含不含羊毛党？）。",
        """from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# 时序业务请改用按时间切分，下方仅演示 API
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
print(classification_report(y_test, clf.predict(X_test)))""",
        "输出 precision/recall/f1；关注少数类（欺诈）召回是否可接受。",
        "1. **风控打标**  2. **转化/留存预测**  3. **销量/时长回归**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 标签含糊 | 模型学错任务 | 写清正负样本定义 |\n"
        "| 随机打乱时序 | 穿越虚高 | 时间切分 |\n"
        "| 无可靠标签硬上无监督 | 无法验收 | 先搞定标注 |",
        "为「7 日是否复购」写标签 SQL/pandas 伪代码，并说明观察窗口与空白期。",
        "python",
    )

    C["ml-leakage"] = gold(
        "验证 AUC 漂亮，上线后一塌糊涂——怀疑用了未来信息。",
        "识别并切断常见数据泄露路径。",
        "特征工程总览 → 时间切分评估",
        SHARED_SAMPLE["ml"],
        "- **一句话定义**：训练时用了预测时点不可用的信息，导致离线虚高。\n"
        "- **常见源**：未来聚合、先全表编码/标准化再切分、把标签衍生列当特征、随机切时序。\n"
        "- **直觉**：考试时偷看了答案解析。\n"
        "- **边界**：允许用「截止预测时刻」的历史；不允许用「之后才产生」的字段。",
        """# 反例：先 fit 全数据再切分 → 泄漏
# scaler.fit(X_all)

# 正例：管道内只在训练折 fit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score

pipe = Pipeline([
    ("sc", StandardScaler()),
    ("clf", LogisticRegression(max_iter=1000)),
])
# 时序场景请换 TimeSeriesSplit
print(cross_val_score(pipe, X, y, cv=5, scoring="roc_auc").mean())""",
        "管道 CV 分数应低于「先全表标准化」的虚高分数。",
        "1. **评审查泄露清单**  2. **特征上线可用性审计**  3. **复现实验**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 用当日总 GMV 预测当日转化 | 神准假象 | 只用过去窗口 |\n"
        "| target encoding 未隔离 | 泄漏 | 折内编码 |\n"
        "| 测试集参与选特征 | 偏乐观 | 锁定测试集 |",
        "列出你项目里 5 个字段，标注每个在预测时刻是否可得。",
        "python",
    )

    C["ml-train-val-test"] = gold(
        "要报告一个可对外的模型分数，且还能调参。",
        "分清训练/验证/测试职责，建立一次锁定测试集的纪律。",
        "监督学习 → 偏差与方差",
        SHARED_SAMPLE["ml"],
        "- **一句话定义**：训练集学参数；验证集选模型/超参；测试集最终估泛化。\n"
        "- **核心**：一次切割原则、嵌套/外层测试、时间切分优先。\n"
        "- **直觉**：作业（train）/模拟考（val）/正式高考（test）。\n"
        "- **边界**：数据极少时可 CV 代替固定验证，但最终仍要留盲测。",
        """# 时间切分示意
cut1, cut2 = "2024-01-04", "2024-01-06"
train = df[df["dt"] < cut1]
val   = df[(df["dt"] >= cut1) & (df["dt"] < cut2)]
test  = df[df["dt"] >= cut2]
# 只在 train+val 上调参；test 只动一次""",
        "三份集合互不重叠；测试集指标用于最终汇报。",
        "1. **实验管理**  2. **论文/评审表**  3. **防调参过拟合验证集**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 反复看测试集调参 | 测试变验证 | 锁定 |\n"
        "| 三集分布差巨大 | 分数不可比 | 检查季节/活动 |\n"
        "| 泄漏式预处理 | 虚高 | 管道内 fit |",
        "画一张你业务的时间轴，标出 train/val/test 窗口与标签可见时刻。",
        "python",
    )

    C["ml-gbdt"] = gold(
        "表格数据要做强基线，准备上 GBDT 家族模型。",
        "理解提升树思路，能用 sklearn/HistGBDT 跑通并知道调哪些旋钮。",
        "随机森林 → 特征重要性",
        SHARED_SAMPLE["ml"],
        "- **一句话定义**：串行拟合残差的树集成，表格数据常强于线性模型。\n"
        "- **核心**：学习率、树深、叶子最小样本、早停、类别特征处理。\n"
        "- **直觉**：一棵树纠上一棵树的错，小步迭代。\n"
        "- **边界**：超高维稀疏文本/图可能另选；需要严格线性可解释时慎用。",
        """from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score

clf = HistGradientBoostingClassifier(
    max_depth=6, learning_rate=0.08, max_iter=200, random_state=42
)
clf.fit(X_train, y_train)
print("val_auc", roc_auc_score(y_val, clf.predict_proba(X_val)[:, 1]))""",
        "验证 AUC 相对逻辑回归基线通常有提升（视特征而定）。",
        "1. **风控/增长表格模型**  2. **竞赛强基线**  3. **特征筛选前探**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 树很深 + 高学习率 | 过拟合 | 降深/降 lr + 早停 |\n"
        "| 类别高基数直接当数值 | 怪分裂 | 目标编码/类别列接口 |\n"
        "| 忽略早停监控指标 | 白训 | 与业务相关指标 |",
        "固定其他参数，只扫 `max_depth∈{3,6,9}`，画验证 AUC 曲线并选择。",
        "python",
    )

    C["ml-time-split"] = gold(
        "活动周模型分数很好，下周就崩——切分方式被质疑。",
        "会做时间切分评估，并解释与随机 K 折的差异。",
        "训练/验证/测试 → 监控与漂移",
        SHARED_SAMPLE["ml"],
        "- **一句话定义**：按时间先后切分训练与评估，贴近上线。\n"
        "- **核心**：截止时刻、空白期（label latency）、滚动原点（backtest）。\n"
        "- **直觉**：用昨天的学，考今天的卷。\n"
        "- **边界**：纯 IID 非时序问题仍可用随机切，但电商/风控默认时间切。",
        """from sklearn.model_selection import TimeSeriesSplit
tscv = TimeSeriesSplit(n_splits=3)
for i, (tr, te) in enumerate(tscv.split(X)):
    print(i, tr[-1], te[0], te[-1])  # 检查索引是否递增""",
        "每一折训练下标都在测试之前。",
        "1. **上线前回测**  2. **季节性检验**  3. **与随机切对比揭示穿越**",
        "| 错法 | 现象 | 纠正 |\n|---|---|---|\n"
        "| 未来特征进训练 | 虚高 | 泄露清单 |\n"
        "| 单点切分撞大促 | 结论不稳 | 多原点回测 |\n"
        "| 忽略标签延迟 | 用了未结算标签 | 设空白期 |",
        "设计 3 个回测原点，写出每段 train 结束日与 test 窗口。",
        "python",
    )

    return C


def deepen_path_leaf(node: dict, hub: str) -> str:
    title = node.get("title") or node["id"]
    old = node.get("content") or ""
    if len(old) > 900 and "###" in old:
        # already decent — thicken checklist
        return lesson(
            old
            + "\n\n### 验收\n\n- 能按顺序指出下一课是哪一叶\n"
            "- 能说出本阶段结束时应会的 3 个动作\n"
            "- 完成对应练习场后再进入下一阶段\n"
        )
    order = {
        "py-path-junior": "宪法 → DataFrame → 筛选 → 缺失 → groupby → merge → CSV/SQL → 折线 → 初级练习",
        "py-path-mid": "pivot → transform/rolling → 时间索引 → 柱状/分布 → NumPy → DuckDB/Polars → 中级练习",
        "py-path-senior": "sklearn 基线 → Streamlit → Parquet/性能 → 可复现环境 →（对接 ML 树）",
        "db-path-junior": "宪法 → OLTP/OLAP → ACID → 主键约束 → 类型精度 → BTree → 初级练习",
        "db-path-mid": "EXPLAIN → 覆盖索引 → 事务边界 → 隔离要点 → 行锁 → 复制备份 → 中级练习",
        "db-path-senior": "WAL/MVCC/缓冲池 → 统计信息 → 池化分区 → 多引擎直觉 → 高级练习",
    }.get(node["id"], "按章节叶节点自上而下")
    return lesson(
        f"""### 课前

- **定位**：{title}——阶段导航，不替代叶讲义。
- **目标**：按顺序学完本阶段叶节点，再进练习场。
- **先修**：先读教程宪法。

### 推荐顺序

```text
{order}
```

### 阶段结束标准

1. 能独立复现本阶段每课「怎么写」主路径  
2. 易错表里至少踩过并纠正 2 个  
3. 完成对应练习场题目  

### 动手

打开下一叶，开始第一课；不要跳过宪法样例构造。
"""
    )


def deepen_generic(node: dict, hub: str) -> str:
    lid = node["id"]
    title = node.get("title") or lid
    sec = parse_sections(node.get("content") or "")
    lang = HUB_LANG[hub]

    if "path-" in lid:
        return deepen_path_leaf(node, hub)

    # keep constitution if already long
    if "constitution" in lid and len(node.get("content") or "") > 1500:
        return node["content"]

    scene = scene_for(hub, title, lid)
    goal = goal_for(hub, title)
    prereq = prereq_for(hub, lid)
    sample = SHARED_SAMPLE[hub]

    # try extract from 课前 bullets
    if "课前" in sec:
        for ln in sec["课前"].splitlines():
            if "场景" in ln:
                scene = re.sub(r"^[-*]\s*\*\*?场景\*\*?[：:]\s*", "", ln.strip()).strip("* ")
            if "目标" in ln:
                goal = re.sub(r"^[-*]\s*\*\*?目标\*\*?[：:]\s*", "", ln.strip()).strip("* ")
            if "先修" in ln:
                prereq = re.sub(r"^[-*]\s*\*\*?先修\*\*?[：:]\s*", "", ln.strip()).strip("* ")

    if "样例输入" in sec and len(sec["样例输入"]) > 10:
        sample = sec["样例输入"]

    what = expand_what(sec.get("是什么", ""), title, hub)
    code, prose = extract_code(sec.get("怎么写", ""))
    code = expand_code(code, prose, hub, title, lang)
    result = result_for(hub, title, sec.get("运行结果", ""))
    uses = uses_block(sec.get("用在哪", ""))
    traps = sec.get("易错对照", "")
    if not traps or (not traps.strip().startswith("|") and len(traps) < 80):
        traps = bullets_to_traps(traps or sec.get("注意啥", ""))
    elif not traps.strip().startswith("|"):
        traps = bullets_to_traps(traps)
    drill = drill_for(hub, title, sec.get("动手", ""))

    # domain seasoning
    if hub == "ml" and "直觉" not in what:
        what += "\n- **评估提醒**：离线指标必须能映射到业务代价（假阳/假阴谁更贵）。"
    if hub == "database" and "WAL" not in lid:
        what += "\n- **运维提醒**：改结构/加索引前先想清楚锁与回滚方案。"

    return gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang)


def enrich_tree(tree: dict, hub: str, overrides: dict[str, str]) -> tuple[int, int]:
    n_changed = 0
    total_gain = 0
    for leaf in walk_leaves(tree):
        before = len(leaf.get("content") or "")
        title = leaf.get("title") or leaf["id"]
        if leaf["id"] in overrides:
            new_c = overrides[leaf["id"]]
        elif "path-" in leaf["id"]:
            new_c = deepen_path_leaf(leaf, hub)
        elif "constitution" in leaf["id"] and before > 1500:
            new_c = leaf.get("content") or ""
        else:
            new_c = deepen_generic(leaf, hub)
        new_c = ensure_tail(new_c, hub, title)
        if new_c != (leaf.get("content") or ""):
            leaf["content"] = new_c
            n_changed += 1
            total_gain += len(new_c) - before
    return n_changed, total_gain


def stats(tree: dict) -> str:
    ls = walk_leaves(tree)
    lens = sorted(len(x.get("content") or "") for x in ls)
    return f"leaves={len(ls)} min={lens[0]} med={lens[len(lens)//2]} max={lens[-1]}"


def main():
    overrides = curated()
    for hub in ("python", "database", "ml"):
        path = LESSONS / f"{hub}.json"
        tree = json.loads(path.read_text(encoding="utf-8"))
        print(f"BEFORE {hub}: {stats(tree)}")
        n, gain = enrich_tree(tree, hub, overrides)
        path.write_text(json.dumps(tree, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"AFTER  {hub}: {stats(tree)} changed={n} gain_chars={gain}")


if __name__ == "__main__":
    main()
