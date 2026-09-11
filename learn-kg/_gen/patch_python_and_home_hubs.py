# -*- coding: utf-8 -*-
"""1) Home: pick SQL/Python/… hubs  2) Expand Python KG with constitution template."""
from __future__ import annotations

import json
import re
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")

# ---------- A. Home hub picker ----------
old_home_const = """    const HOME_HUB_ID = "sql";
    const HOME_HERO_ONLY = true;"""
new_home_const = """    const HOME_HUB_ID = "sql";
    const HOME_HERO_ONLY = true;
    /** 首页可见的学科大节点（均可点进 KG_TREES 教程） */
    const HOME_HERO_HUBS = ["sql", "python", "ml", "etl", "dwh", "bi"];
    const HOME_HERO_SUB = {
      sql: "查询与建模",
      python: "分析与脚本",
      ml: "模型与任务",
      etl: "集成与调度",
      dwh: "分层与建模",
      bi: "指标与看板"
    };"""
if old_home_const not in text:
    raise SystemExit("HOME_HUB_ID block missing")
text = text.replace(old_home_const, new_home_const, 1)
print("OK home constants")

old_place = """      if (HOME_HERO_ONLY && !(kgDrill && kgDrill.active)) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        nodes.forEach(n => {
          if (n.id === HOME_HUB_ID) {
            n.x = n.fx = cx;
            n.y = n.fy = cy;
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }"""

new_place = """      if (HOME_HERO_ONLY && !(kgDrill && kgDrill.active)) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        const hubs = (typeof HOME_HERO_HUBS !== "undefined" && HOME_HERO_HUBS.length)
          ? HOME_HERO_HUBS : [HOME_HUB_ID];
        const R = Math.min(
          (typeof width === "function" ? width() : m.w),
          (typeof height === "function" ? height() : m.h)
        ) * 0.26;
        const hubSet = new Set(hubs);
        nodes.forEach(n => {
          const i = hubs.indexOf(n.id);
          if (i >= 0) {
            const ang = -Math.PI / 2 + (i * 2 * Math.PI / hubs.length);
            n.x = n.fx = cx + (hubs.length === 1 ? 0 : R * Math.cos(ang));
            n.y = n.fy = cy + (hubs.length === 1 ? 0 : R * Math.sin(ang));
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }"""
if old_place not in text:
    raise SystemExit("placeNodes home block missing")
text = text.replace(old_place, new_place, 1)
print("OK placeNodes ring")

# hero node class / size / sublabel
text = text.replace(
    'node.classed("home-hero-node", d => d.id === HOME_HUB_ID);',
    'node.classed("home-hero-node", d => (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID));',
    1,
)
text = text.replace(
    'if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return 46;',
    'if (HOME_HERO_ONLY && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID)) return 40;',
    1,
)
# there may be two similar size lines
text = text.replace(
    'if (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID) return 46;',
    'if (HOME_HERO_ONLY && !kgDrill.active && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID)) return 40;',
    1,
)
text = text.replace(
    'const isHub = (kgDrill.active && d.id === kgDrill.hubId) || (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID);',
    'const isHub = (kgDrill.active && d.id === kgDrill.hubId) || (HOME_HERO_ONLY && !kgDrill.active && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID));',
    1,
)

# font-size ternary for home
text = text.replace(
    '.style("font-size", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? "13px" : (d.catalog ? "12px" : "11px"))',
    '.style("font-size", d => (HOME_HERO_ONLY && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID)) ? "12px" : (d.catalog ? "12px" : "11px"))',
    1,
)
text = text.replace(
    'node.append("text").attr("class", "sublabel").attr("dy", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? 38 : 34)',
    'node.append("text").attr("class", "sublabel").attr("dy", d => (HOME_HERO_ONLY && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID)) ? 34 : 34)',
    1,
)

old_sub = '''        if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return "点击展开一级";
        if (KG_TREES && KG_TREES[d.id]) return "点击学教程";
        return d.catalog ? "点击展开" : (d.name.length > 5 ? d.name : "");'''
new_sub = '''        if (HOME_HERO_ONLY && (typeof HOME_HERO_HUBS !== "undefined" ? HOME_HERO_HUBS.includes(d.id) : d.id === HOME_HUB_ID)) {
          return (typeof HOME_HERO_SUB !== "undefined" && HOME_HERO_SUB[d.id]) ? HOME_HERO_SUB[d.id] : "点击学教程";
        }
        if (KG_TREES && KG_TREES[d.id]) return "点击学教程";
        return d.catalog ? "点击展开" : (d.name.length > 5 ? d.name : "");'''
if old_sub not in text:
    raise SystemExit("sublabel block missing")
text = text.replace(old_sub, new_sub, 1)
print("OK hero labels")

# caption
text = text.replace(
    '<div class="hint home-caption">点击中心节点 · 或点上方热门入口直达</div>',
    '<div class="hint home-caption">点上方学科入口 · 或点画布大节点进入教程</div>',
    1,
)

old_hot = """    function wireHomeHotEntries() {
      const box = document.getElementById("homeHot");
      if (!box || box._bound) return;
      box._bound = true;
      const entries = [
        { id: "sql-constitution", label: "教程宪法" },
        { id: "sql-select", label: "SELECT·金课" },
        { id: "sql-null", label: "NULL·金课" },
        { id: "sql-join-explode", label: "JOIN爆炸·金课" },
        { id: "sql-row-number", label: "ROW_NUMBER·金课" }
      ];
      box.innerHTML = entries.map(e =>
        `<button type="button" data-hot="${e.id}">${e.label}</button>`
      ).join("");
      box.querySelectorAll("[data-hot]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.getAttribute("data-hot");
          if (!KG_TREES.sql) return;
          enterKgDrill("sql");
          // 等焦点舞台就绪后再跳转
          setTimeout(() => {
            const n = findKgNode(id);
            if (n) jumpToKgLesson(n);
            else showKgToast("未找到该知识点");
          }, 380);
        });
      });
    }"""

new_hot = """    function wireHomeHotEntries() {
      const box = document.getElementById("homeHot");
      if (!box || box._bound) return;
      box._bound = true;
      const hubEntries = [
        { hub: "sql", label: "SQL" },
        { hub: "python", label: "Python" },
        { hub: "ml", label: "机器学习" },
        { hub: "etl", label: "ETL" },
        { hub: "dwh", label: "数据仓库" },
        { hub: "bi", label: "BI" }
      ];
      box.innerHTML = hubEntries.map(e =>
        `<button type="button" data-hub="${e.hub}">${e.label}</button>`
      ).join("");
      box.querySelectorAll("[data-hub]").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const hub = btn.getAttribute("data-hub");
          if (!KG_TREES[hub]) {
            showKgToast("该学科教程尚未挂载");
            return;
          }
          enterKgDrill(hub);
          showKgToast("已进入「" + (btn.textContent || hub) + "」教程");
          // Python / SQL：若有宪法叶，自动打开
          setTimeout(() => {
            const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution" : null;
            if (!prefer || typeof findKgNode !== "function") return;
            const n = findKgNode(prefer);
            if (n && typeof jumpToKgLesson === "function") jumpToKgLesson(n);
          }, 420);
        });
      });
    }"""
if old_hot not in text:
    raise SystemExit("wireHomeHotEntries missing")
text = text.replace(old_hot, new_hot, 1)
print("OK home hot hubs")

# CSS comment
text = text.replace(
    "/* 首屏：只保留一个课程大节点 */",
    "/* 首屏：只显示可学教程的学科大节点（环状） */",
    1,
)

# ---------- B. Python knowledge tree ----------
def lesson(body: str) -> str:
    return body.strip()


PY_CONSTITUTION = lesson("""
### 课前 · 这是什么

本页是 **Python 数据教程公约**：与 SQL 教程共用同一业务样例（users / orders / …）；本侧用 pandas DataFrame 表达。先读本页，再按学习路径上课。

### 统一样例（与 SQL 同源）

在笔记本里一次性构造（也可先把 SQL 样例导出 CSV 再 `read_csv`）：

```python
import pandas as pd
import numpy as np

users = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "user_name": ["Ada", "Bob", "Cara", "Dan"],
    "city": ["上海", "北京", "上海", None],
    "created_at": pd.to_datetime([
        "2023-12-01 09:00:00", "2023-12-05 10:00:00",
        "2024-01-02 11:00:00", "2024-01-10 12:00:00"
    ]),
})

orders = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106, 107, 108],
    "user_id": [1, 1, 1, 2, 2, 3, 3, 1],
    "amount": [80.0, 120.0, 120.0, 50.0, 90.0, np.nan, 200.0, 30.0],
    "status": ["paid", "paid", "paid", "created", "paid", "paid", "cancelled", "paid"],
    "created_at": pd.to_datetime([
        "2024-01-01 10:00:00", "2024-01-02 11:00:00", "2024-01-03 09:00:00",
        "2024-01-01 12:00:00", "2024-01-04 08:00:00", "2024-01-05 14:00:00",
        "2024-01-06 16:00:00", "2024-01-07 09:30:00"
    ]),
})

order_items = pd.DataFrame({
    "order_id": [101, 101, 102, 105, 106],
    "sku_id": ["SKU-A", "SKU-B", "SKU-A", "SKU-C", "SKU-A"],
    "qty": [1, 2, 1, 3, 1],
})

order_events = pd.DataFrame({
    "event_id": [1, 2, 3, 4, 5, 6, 7],
    "order_id": [101, 101, 102, 102, 106, 107, 107],
    "event_type": ["created", "paid", "paid", "paid", "paid", "created", "refund"],
    "event_time": pd.to_datetime([
        "2024-01-01 09:55:00", "2024-01-01 10:00:00",
        "2024-01-02 11:00:00", "2024-01-02 11:00:00",
        "2024-01-05 14:00:00", "2024-01-06 15:00:00", "2024-01-06 17:00:00"
    ]),
})
```

**验收**：`len(users)==4`，`len(orders)==8`，`len(order_items)==5`，`len(order_events)==7`。

### 金标准课模板

与 SQL 相同：课前 → 样例输入 → 是什么 → 怎么写 → 查询/运行结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
教程宪法 → DataFrame/筛选 → 缺失 → groupby → merge(防爆炸) → 读写SQL/CSV → 可视化 → 练习场
```
""")


def gold(title_scene, goals, prereq, sample, what, code, result, uses, traps, drill):
    return lesson(f"""
### 课前

- **场景**：{title_scene}
- **目标**：{goals}
- **先修**：{prereq}

### 样例输入

{sample}

### 是什么

{what}

### 怎么写

```python
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


PY_TREE = {
    "id": "python-root",
    "title": "Python",
    "level": "?",
    "content": "### Python 数据教程\n\n1. 先打开 **学习路径 → 教程宪法**，构造与 SQL 同源的 DataFrame\n2. 按初级清单推进：筛选 / 缺失 / 聚合 / 合并 / IO / 作图\n3. 再点中心展开领域\n\n交互：再点中心展开；叶子打开讲义。",
    "children": [
        {
            "id": "py-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初级清单 → 练习场**。样例与 SQL 共用 users/orders/…",
            "children": [
                {
                    "id": "py-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读\n\n统一样例 DataFrame + 课模板。点下方叶子打开全文。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": PY_CONSTITUTION,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "py-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线\n\n初级打底，中级补 merge/窗口感，高级对接工程化。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：能用 pandas 完成筛选、清洗、聚合、简单合并与出图。
- **先修**：教程宪法（必须先构造样例 DataFrame）

### 建议顺序

```text
0. 统一样例与课模板
1. DataFrame 基础 / 筛选赋值
2. 缺失与类型
3. groupby 聚合
4. merge 关联（防爆炸）
5. read_csv / to_sql
6. 折线趋势
7. 初级练习场
```

### 用在哪

1. 分析师日常脚本  2. SQL 结果二次处理

### 注意啥

- 与 SQL 课对照同一指标，口径应一致。
"""),
                            "children": [],
                        },
                        {
                            "id": "py-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：多表合并策略、apply 边界、时间索引、可视化分层。
- **建议**：merge 校验行数、`transform`、`pivot`、分面图。

### 注意啥

- 能下推 SQL 的聚合优先下推。
"""),
                            "children": [],
                        },
                        {
                            "id": "py-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：性能（向量化/类别类型）、可复现环境、作业化脚本。
- **建议**：chunk 读写、parquet、类型下调、测试断言。
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场\n\n用统一样例自测。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "验收 pandas 初级能力。",
                                "独立完成筛选、缺失填充、聚合、合并计数。",
                                "初级清单叶子课",
                                "使用教程宪法中的 `users` / `orders` / `order_items`。",
                                "- **练习场（初级）**：与 SQL 初级题口径对齐。",
                                """# Q1 最近 5 笔 paid
q1 = (orders.query("status=='paid'")
      .sort_values('created_at', ascending=False)
      .head(5))

# Q2 每用户订单数
q2 = orders.groupby('user_id', as_index=False).size().rename(columns={'size':'cnt'})

# Q3 从未下单用户
q3 = users.merge(orders[['user_id']].drop_duplicates(), on='user_id', how='left', indicator=True)
q3 = q3.loc[q3['_merge']=='left_only', ['user_id','user_name','city']]

# Q4 paid GMV（缺失当 0）
q4 = (orders.query("status=='paid'")
      .assign(amount=lambda d: d['amount'].fillna(0))
      .groupby('user_id', as_index=False)['amount'].sum())

# Q5 分档
q5 = q4.assign(tier=lambda d: pd.cut(
    d['amount'], bins=[-0.1, 100, 300, 10_000], labels=['L','M','H']))""",
                                "| 题 | 要点 |\n|---|---|\n| Q3 | Dan |\n| Q4 | user 3 为 0 |\n| Q5 | Ada 为 H（350） |",
                                "1. 课堂作业  2. 与 SQL 练习对照",
                                "| 错法 | 纠正 |\n|---|---|\n| merge 后直接 sum 头表金额 | 先按 order 聚合 items |\n| `df.amount = 0` 链式警告 | 用 assign/`loc` |",
                                "加分：统计每个 paid 订单的 SKU 行数，标出 101。",
                            ),
                            "children": [],
                        }
                    ],
                },
            ],
        },
        {
            "id": "py-pandas",
            "title": "pandas 数据表",
            "level": "?",
            "content": "### pandas\n\n表格数据处理主力。先宪法，再 IO / 变换 / 聚合。",
            "children": [
                {
                    "id": "py-frame",
                    "title": "表结构与筛选",
                    "level": "?",
                    "content": "### 表结构与筛选 · 章节导读\n\nDataFrame 基础与布尔筛选。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-dataframe",
                            "title": "DataFrame 基础",
                            "level": "?",
                            "content": gold(
                                "刚构造完样例，想确认列类型与形状。",
                                "会查看 shape/dtypes/head，理解索引与列。",
                                "教程宪法 → 下一课：筛选赋值",
                                "`orders` 全表（8 行）。",
                                "- **一句话定义**：带列标签的二维表（索引 × 列）。\n- **直觉**：Excel 表，但是可编程。\n- **核心属性**：`shape`、`dtypes`、`columns`、`index`。",
                                """print(orders.shape)          # (8, 5)
print(orders.dtypes)
print(orders.head(3))
print(orders.columns.tolist())
print(orders.loc[0, 'order_id'])   # 标签索引
print(orders.iloc[0, 0])           # 位置索引""",
                                "`shape=(8,5)`；`amount` 为 float（含 NaN）；`status` 为 object。",
                                "1. 读入后体检  2. 对接 SQL 结果自检",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 混淆 loc/iloc | 取错行 | 标签用 loc，位置用 iloc |\n| 改视图当拷贝 | SettingWithCopy | 用 `copy()`/`assign` |",
                                "打印 `users` 中 `city` 的 dtype，并数出空值个数。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-filter",
                            "title": "筛选与赋值",
                            "level": "?",
                            "content": gold(
                                "只要上海用户的支付订单明细。",
                                "掌握布尔筛选、`query`、派生列。",
                                "DataFrame 基础 → 下一课：缺失与类型",
                                "users + orders；城市与 status 条件。",
                                "- **一句话定义**：按条件保留行，并按需新增列。\n- **骨架**：`df[cond]` / `df.query(...)` / `assign`。",
                                """paid = orders.query("status == 'paid'")
shanghai_users = users.loc[users['city'] == '上海', 'user_id']
out = (
  paid.loc[paid['user_id'].isin(shanghai_users)]
      .sort_values('created_at', ascending=False)
      .merge(users[['user_id','user_name','city']], on='user_id', how='left')
)
print(out[['order_id','user_name','city','amount']])""",
                                "含 Ada/Cara 的支付单；Dan 因 city 空且非上海不出现。",
                                "1. 探索分析切片  2. 特征表过滤",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| `city == None` | 匹配不到 | `city.isna()` |\n| 链式 `df[df.a>1]['b']=0` | 警告/无效 | `loc` 或 assign |",
                                "筛出 `amount.isna()` 的支付单（应含 106）。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-agg",
                    "title": "清洗与聚合",
                    "level": "??",
                    "content": "### 清洗与聚合 · 章节导读\n\n缺失、groupby、merge。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-na",
                            "title": "缺失与类型",
                            "level": "?",
                            "content": gold(
                                "金额与城市有空值，汇总前要处理。",
                                "会用 `isna`/`fillna`/`to_numeric`，并分清「删除 vs 填充」。",
                                "筛选赋值 → 下一课：groupby",
                                "orders.amount 含 NaN；users.city 含 None。",
                                "- **一句话定义**：识别并处置缺失，校正列类型。\n- **原则**：填充要有业务含义；主键缺失才 drop。",
                                """orders = orders.copy()
orders['amount_filled'] = orders['amount'].fillna(0)
print(orders['amount'].isna().sum())          # 1
print(orders.loc[orders['amount'].isna(), ['order_id','status']])

users2 = users.assign(city=users['city'].fillna('未知'))
print(users2[['user_id','city']])

# 类型
orders['amount'] = pd.to_numeric(orders['amount'], errors='coerce')""",
                                "缺失金额订单为 106；Dan 的 city 显示「未知」。",
                                "1. 入模前清洗  2. 报表口径",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| `dropna()` 无 subset | 误删大量行 | 指定关键列 |\n| 用 0 填城市 | 语义错 | 用『未知』或保留 NA |",
                                "计算 paid 的 `sum(amount)` 与 `sum(fillna(0))` 差值。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-group",
                            "title": "groupby 聚合",
                            "level": "??",
                            "content": gold(
                                "要每用户支付订单数与 GMV。",
                                "写出正确的 groupby + agg；核对行数。",
                                "缺失与类型 → 下一课：merge",
                                "orders 中 status=paid 的行。",
                                "- **一句话定义**：按键折叠行并聚合。\n- **对比 SQL**：`GROUP BY` + `SUM/COUNT`。",
                                """gmv = (
  orders.query("status=='paid'")
    .assign(amount=lambda d: d['amount'].fillna(0))
    .groupby('user_id', as_index=False)
    .agg(order_cnt=('order_id','count'), gmv=('amount','sum'))
    .sort_values('gmv', ascending=False)
)
print(gmv)""",
                                "| user_id | order_cnt | gmv |\n|---:|---:|---:|\n| 1 | 4 | 350 |\n| 2 | 1 | 90 |\n| 3 | 1 | 0 |",
                                "1. 用户汇总  2. 日报  3. 标签表",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 聚合后忘记 reset/as_index | 索引难用 | `as_index=False` |\n| count 用 amount | 漏计空金额单 | 对 order_id count |",
                                "按 status 聚合订单数与金额和。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-merge",
                            "title": "merge 关联",
                            "level": "??",
                            "content": gold(
                                "订单关联明细后 GMV 被放大——经典 JOIN 爆炸。",
                                "会用 how=left/inner；合并前先聚合一对多表。",
                                "groupby → 下一课：read_csv",
                                "orders ⋈ order_items；101 有 2 行明细。",
                                "- **一句话定义**：按键横向合并表（SQL JOIN）。\n- **防爆炸**：多端先 `groupby` 再 merge。",
                                """# 爆炸：金额被复制
bad = orders.merge(order_items, on='order_id', how='inner')
print('rows', len(bad), 'sum amount', bad.query("status=='paid'")['amount'].sum())

# 正确：先聚合 items
items_agg = order_items.groupby('order_id', as_index=False).agg(
    sku_cnt=('sku_id','count'), qty_sum=('qty','sum')
)
good = orders.merge(items_agg, on='order_id', how='left')
print(good.query("status=='paid'")[['order_id','amount','sku_cnt']])""",
                                "101 的 `sku_cnt=2` 且 `amount` 仍为 80；坏写法 paid 金额之和会被放大。",
                                "1. 事实补维  2. 宽表拼接  3. 对照 SQL JOIN 爆炸金课",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 一对多直接 sum 头指标 | 翻倍 | 先聚合 |\n| 默认 inner 丢掉无匹配 | 用户消失 | 名单用 left |",
                                "left merge 出从未下单的用户（indicator）。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-io",
                    "title": "读写与落地",
                    "level": "?",
                    "content": "### 读写与落地 · 章节导读\n\nCSV 与 SQL 互转。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-read-csv",
                            "title": "read_csv",
                            "level": "?",
                            "content": gold(
                                "把订单样例落成 CSV 再读回。",
                                "会写 `to_csv`/`read_csv`，指定解析日期与类型。",
                                "merge → 下一课：to_sql",
                                "内存中的 `orders` DataFrame。",
                                "- **一句话定义**：平面文件 ↔ DataFrame。\n- **关键参数**：encoding、parse_dates、dtype。",
                                """orders.to_csv('orders_sample.csv', index=False)
df = pd.read_csv('orders_sample.csv', parse_dates=['created_at'])
print(df.dtypes)
print(len(df))""",
                                "读回 8 行；`created_at` 为 datetime64。",
                                "1. 探索起步  2. 交换样例  3. 质检抽样",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 大文件一次读入 | 内存爆 | chunksize |\n| 混型静默 | 分析错 | 显式 dtype |",
                                "导出 `users` 再读回，确认 city 空值仍在。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-to-sql",
                            "title": "to_sql / read_sql",
                            "level": "??",
                            "content": gold(
                                "把 pandas 汇总写回 SQLite，供 SQL 课继续查。",
                                "会用 SQLAlchemy engine 读写；注意 if_exists。",
                                "read_csv → 下一课：折线趋势",
                                "gmv 汇总表或整表 orders。",
                                "- **一句话定义**：DataFrame 与数据库表互转。\n- **风险**：生产写入权限与幂等。",
                                """from sqlalchemy import create_engine
eng = create_engine('sqlite:///data_nexus_sample.db')
orders.to_sql('orders', eng, if_exists='replace', index=False)
users.to_sql('users', eng, if_exists='replace', index=False)

df = pd.read_sql(
  \"\"\"SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
     FROM orders WHERE status='paid' GROUP BY user_id\"\"\",
  eng
)
print(df)""",
                                "Ada/Bob/Cara 的 gmv 与 pandas groupby 一致（350/90/0）。",
                                "1. 沙箱落表  2. 指标回写  3. 与 SQL 教程联调",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| if_exists='append' 无去重 | 重复行 | replace/先删 |\n| 一次写巨表 | 锁/内存 | chunksize |",
                                "用 read_sql 查出从未下单用户，与 merge 结果对照。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "py-viz",
            "title": "可视化入门",
            "level": "??",
            "content": "### 可视化\n\n用图讲清分布与趋势。",
            "children": [
                {
                    "id": "py-plot",
                    "title": "常用图",
                    "level": "??",
                    "content": "### 常用图 · 章节导读\n\n先聚合再画。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-line",
                            "title": "折线趋势",
                            "level": "??",
                            "content": gold(
                                "看每日支付 GMV 走势。",
                                "先按日聚合再 `plot`；处理空日。",
                                "to_sql → 练习场",
                                "orders paid 行。",
                                "- **一句话定义**：按时间展示指标走势。\n- **要点**：先聚合；注意缺失日。",
                                """import matplotlib.pyplot as plt

daily = (
  orders.query("status=='paid'")
    .assign(
      dt=lambda d: d['created_at'].dt.floor('D'),
      amount=lambda d: d['amount'].fillna(0),
    )
    .groupby('dt')['amount'].sum()
    .sort_index()
)
ax = daily.plot(figsize=(8, 3), marker='o', title='Daily paid GMV')
ax.set_xlabel('date'); ax.set_ylabel('gmv')
plt.tight_layout(); plt.show()
print(daily)""",
                                "2024-01-01..07 各日 GMV（无单日可不出现，进阶可用 reindex 补 0）。",
                                "1. 日报复盘  2. 异常尖刺  3. 实验窗",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 未聚合直接 plot 明细 | 乱线 | 先 groupby |\n| 双轴堆砌 | 误导 | 少用双轴 |",
                                "画出每日订单数折线，与 GMV 对照。",
                            ),
                            "children": [],
                        }
                    ],
                }
            ],
        },
    ],
}


def extract_object(src: str, marker: str):
    i = src.find(marker)
    if i < 0:
        raise SystemExit(f"missing {marker}")
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


s, e, _old = extract_object(text, "const PYTHON_KNOWLEDGE_TREE = ")
text = text[:s] + json.dumps(PY_TREE, ensure_ascii=False, indent=2) + text[e:]
print("OK PYTHON_KNOWLEDGE_TREE leaves", end=" ")

# count leaves
def walk(n, acc):
    kids = n.get("children") or []
    if not kids:
        acc.append(n["id"])
    for c in kids:
        walk(c, acc)
    return acc

leaves = walk(PY_TREE, [])
print(len(leaves), leaves)

# PYTHON_SAMPLE constant near SQL_SAMPLE if exists
if "const PYTHON_SAMPLE" not in text and "const SQL_SAMPLE" in text:
    sample = {
        "tables": ["users", "orders", "order_events", "order_items"],
        "sharedWith": "SQL_SAMPLE",
        "constitutionId": "py-constitution",
        "juniorLeaves": [
            "py-dataframe",
            "py-filter",
            "py-na",
            "py-group",
            "py-merge",
            "py-read-csv",
            "py-to-sql",
            "py-line",
            "py-drill-junior",
        ],
    }
    text = text.replace(
        "const SQL_SAMPLE = ",
        "const PYTHON_SAMPLE = "
        + json.dumps(sample, ensure_ascii=False, indent=2)
        + ";\n\n    const SQL_SAMPLE = ",
        1,
    )
    print("OK PYTHON_SAMPLE")

p.write_text(text, encoding="utf-8")

# validate
t2 = p.read_text(encoding="utf-8")
assert "HOME_HERO_HUBS" in t2
assert 'data-hub="python"' in t2
assert "py-constitution" in t2
assert "py-merge" in t2
_, _, py = extract_object(t2, "const PYTHON_KNOWLEDGE_TREE = ")

def find_node(n, eid):
    if n.get("id") == eid:
        return n
    for c in n.get("children") or []:
        hit = find_node(c, eid)
        if hit:
            return hit
    return None

c = find_node(py, "py-constitution")
assert c and "统一样例" in c["content"]
m = find_node(py, "py-merge")
assert m and "易错对照" in m["content"]
print("VALIDATED size", p.stat().st_size)
