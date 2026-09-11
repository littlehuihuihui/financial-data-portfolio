# -*- coding: utf-8 -*-
"""Rebuild & expand PYTHON_KNOWLEDGE_TREE to match main-graph Python curriculum."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")


def lesson(s: str) -> str:
    return s.strip()


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill):
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


CONST = lesson("""
### 课前 · 这是什么

本页是 **Python 数据教程公约**：与 SQL / 数据库 / 数仓共用同一业务样例（`users` / `orders` / `order_items` / `order_events`）。本侧用 pandas DataFrame 表达；先读本页再上课。

### 统一样例（一次性构造）

```python
import pandas as pd
import numpy as np

users = pd.DataFrame({
    "user_id": [1, 2, 3, 4],
    "user_name": ["Ada", "Bob", "Cara", "Dan"],
    "city": ["上海", "北京", "上海", None],
    "created_at": pd.to_datetime([
        "2023-12-01 09:00:00", "2023-12-05 10:00:00",
        "2024-01-02 11:00:00", "2024-01-10 12:00:00"]),
})
orders = pd.DataFrame({
    "order_id": [101, 102, 103, 104, 105, 106, 107, 108],
    "user_id": [1, 1, 1, 2, 2, 3, 3, 1],
    "amount": [80.0, 120.0, 120.0, 50.0, 90.0, np.nan, 200.0, 30.0],
    "status": ["paid", "paid", "paid", "created", "paid", "paid", "cancelled", "paid"],
    "created_at": pd.to_datetime([
        "2024-01-01 10:00:00", "2024-01-02 11:00:00", "2024-01-03 09:00:00",
        "2024-01-01 12:00:00", "2024-01-04 08:00:00", "2024-01-05 14:00:00",
        "2024-01-06 16:00:00", "2024-01-07 09:30:00"]),
})
order_items = pd.DataFrame({
    "order_id": [101, 101, 102, 105, 106],
    "sku_id": ["SKU-A", "SKU-B", "SKU-A", "SKU-C", "SKU-A"],
    "qty": [1, 2, 1, 3, 1],
})
order_events = pd.DataFrame({
    "event_id": list(range(1, 8)),
    "order_id": [101, 101, 102, 102, 106, 107, 107],
    "event_type": ["created", "paid", "paid", "paid", "paid", "created", "refund"],
    "event_time": pd.to_datetime([
        "2024-01-01 09:55:00", "2024-01-01 10:00:00",
        "2024-01-02 11:00:00", "2024-01-02 11:00:00",
        "2024-01-05 14:00:00", "2024-01-06 15:00:00", "2024-01-06 17:00:00"]),
})
assert len(users)==4 and len(orders)==8 and len(order_items)==5 and len(order_events)==7
```

### 金标准课模板

课前 → 样例输入 → 是什么 → 怎么写 → 结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
宪法 → DataFrame/筛选/缺失 → groupby/merge/透视
→ 读写 CSV·SQL·Parquet → 可视化
→ NumPy/向量化 → DuckDB·Polars 直觉 → sklearn 基线 → Streamlit
→ 性能与可复现 → 练习场
```
""")

TREE = {
    "id": "python-root",
    "title": "Python",
    "level": "?",
    "content": "### Python 数据教程\n\n1. 先打开 **学习路径 → 教程宪法**，构造同源 DataFrame\n2. 初级：表操作；中级：可视化与加速；高级：工程化\n3. 再点中心展开领域\n\n与 SQL 对照同一指标，口径应一致。",
    "children": [
        {
            "id": "py-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初/中/高清单 → 练习场**。",
            "children": [
                {
                    "id": "py-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读\n\n统一样例 + 课模板。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": CONST,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "py-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线清单",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：pandas 完成筛选、清洗、聚合、合并、基础读写与折线图。
- **顺序**：宪法 → DataFrame → 筛选 → 缺失 → groupby → merge → CSV/SQL → 折线 → 初级练习
"""),
                            "children": [],
                        },
                        {
                            "id": "py-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：透视/窗口感、时间索引、Seaborn、NumPy 向量化、DuckDB/Polars 直觉。
- **顺序**：pivot → transform/rolling → 时间序列 → 柱状/分布图 → NumPy → DuckDB → 中级练习
"""),
                            "children": [],
                        },
                        {
                            "id": "py-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：sklearn Pipeline 基线、Streamlit 交付、性能（chunk/parquet/类别类型）、可复现环境。
- **原则**：大计算优先下推 SQL/Spark；Python 做灵活层。
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "验收 pandas 初级闭环。",
                                "独立完成筛选、填充、聚合、防爆炸合并、分档。",
                                "初级清单",
                                "教程宪法四表。",
                                "- **练习场（初级）**：与 SQL 初级题口径对齐。",
                                """q1 = (orders.query("status=='paid'")
      .sort_values('created_at', ascending=False).head(5))
q2 = orders.groupby('user_id', as_index=False).size().rename(columns={'size':'cnt'})
q3 = users.merge(orders[['user_id']].drop_duplicates(), on='user_id', how='left', indicator=True)
q3 = q3.loc[q3['_merge']=='left_only', ['user_id','user_name','city']]
q4 = (orders.query("status=='paid'").assign(amount=lambda d: d['amount'].fillna(0))
      .groupby('user_id', as_index=False)['amount'].sum())
q5 = q4.assign(tier=lambda d: pd.cut(d['amount'], [-0.1,100,300,1e9], labels=['L','M','H']))""",
                                "Q3=Dan；Q4 中 user3=0；Q5 中 Ada=H。",
                                "1. 课堂作业  2. 对照 SQL 练习",
                                "| 错法 | 纠正 |\n|---|---|\n| merge items 后 sum 头金额 | 先聚合 items |\n| 链式赋值警告 | assign/`loc` |",
                                "统计每个 paid 订单的 sku_cnt，确认 101=2。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-drill-mid",
                            "title": "中级练习",
                            "level": "??",
                            "content": gold(
                                "做用户×状态透视、累计 GMV、事件去重。",
                                "完成 pivot、cumsum、去重、rolling 直觉。",
                                "中级清单",
                                "orders / order_events。",
                                "- **练习场（中级）**：表变形 + 窗口感。",
                                """# Q1 透视：用户×状态订单数
pt = (orders.pivot_table(index='user_id', columns='status',
                         values='order_id', aggfunc='count', fill_value=0))

# Q2 Ada 累计支付 GMV
ada = (orders.query("user_id==1 and status=='paid'")
       .sort_values('created_at')
       .assign(amount=lambda d: d['amount'].fillna(0),
               running=lambda d: d['amount'].cumsum()))

# Q3 事件去重
ev = (order_events.sort_values(['order_id','event_type','event_time','event_id'])
      .drop_duplicates(['order_id','event_type'], keep='first'))""",
                                "Ada running 最终 350；102 paid 事件只留一行。",
                                "1. 报表变形  2. 质量去重",
                                "| 错法 | 纠正 |\n|---|---|\n| cumsum 前未排序 | 先按时间排 |\n| drop_duplicates 无排序 | 决胜列不稳定 |",
                                "对 Ada 支付金额做 `rolling(2).sum()` 并解读。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "py-pandas",
            "title": "pandas 数据表",
            "level": "?",
            "content": "### pandas\n\n数分第一库：表结构、清洗、聚合、合并、变形。",
            "children": [
                {
                    "id": "py-frame",
                    "title": "表结构与筛选",
                    "level": "?",
                    "content": "### 表结构与筛选 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-dataframe",
                            "title": "DataFrame 基础",
                            "level": "?",
                            "content": gold(
                                "刚构造样例，要确认形状与类型。",
                                "会用 shape/dtypes/head；分清 loc/iloc。",
                                "教程宪法 → 下一课：筛选赋值",
                                "`orders` 全表。",
                                "- **一句话定义**：带列标签的二维表。\n- **核心**：`shape`、`dtypes`、`loc`/`iloc`。",
                                """print(orders.shape, orders.dtypes)
print(orders.head(3))
print(orders.loc[0, 'order_id'], orders.iloc[0, 0])""",
                                "`(8,5)`；`amount` 为 float（含 NaN）。",
                                "1. 读入体检  2. 对接 SQL 结果",
                                "| 错法 | 纠正 |\n|---|---|\n| 混用 loc/iloc | 标签用 loc |\n| 改视图当拷贝 | `copy()`/assign |",
                                "统计 `users.city` 空值个数。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-filter",
                            "title": "筛选与赋值",
                            "level": "?",
                            "content": gold(
                                "只要上海用户的支付订单。",
                                "掌握布尔筛选、`query`、`assign`。",
                                "DataFrame → 下一课：缺失",
                                "users + orders。",
                                "- **骨架**：`df[cond]` / `query` / `assign`。",
                                """paid = orders.query("status == 'paid'")
sh = users.loc[users['city']=='上海', 'user_id']
out = (paid.loc[paid['user_id'].isin(sh)]
       .sort_values('created_at', ascending=False)
       .merge(users[['user_id','user_name','city']], on='user_id'))
print(out[['order_id','user_name','amount']])""",
                                "含 Ada/Cara 支付单；Dan 不出现。",
                                "1. EDA 切片  2. 特征过滤",
                                "| 错法 | 纠正 |\n|---|---|\n| `city==None` | `isna()` |\n| 链式 `df[][]=` | `loc`/assign |",
                                "筛出 amount 缺失的支付单（106）。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-clean-agg",
                    "title": "清洗与聚合",
                    "level": "??",
                    "content": "### 清洗与聚合 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-na",
                            "title": "缺失与类型",
                            "level": "?",
                            "content": gold(
                                "金额与城市有空，汇总前要处理。",
                                "会用 isna/fillna/to_numeric；分清删除与填充。",
                                "筛选 → 下一课：groupby",
                                "orders.amount / users.city。",
                                "- **原则**：填充要有业务含义；主键缺失才 drop。",
                                """print(orders['amount'].isna().sum())
orders = orders.assign(amount_filled=orders['amount'].fillna(0))
users2 = users.assign(city=users['city'].fillna('未知'))
orders['amount'] = pd.to_numeric(orders['amount'], errors='coerce')""",
                                "缺失金额 1 行（106）；Dan city→未知。",
                                "1. 入模清洗  2. 报表口径",
                                "| 错法 | 纠正 |\n|---|---|\n| 无脑 dropna 全表 | 指定 subset |\n| 城市填 0 | 用「未知」 |",
                                "对比 paid 的 sum(amount) 与 sum(fillna(0))。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-group",
                            "title": "groupby 聚合",
                            "level": "??",
                            "content": gold(
                                "每用户支付笔数与 GMV。",
                                "写出 groupby+agg；核对行数。",
                                "缺失 → 下一课：merge",
                                "orders paid。",
                                "- **对比 SQL**：`GROUP BY` + `SUM/COUNT`。",
                                """gmv = (orders.query("status=='paid'")
  .assign(amount=lambda d: d['amount'].fillna(0))
  .groupby('user_id', as_index=False)
  .agg(order_cnt=('order_id','count'), gmv=('amount','sum'))
  .sort_values('gmv', ascending=False))
print(gmv)""",
                                "1→350/4；2→90/1；3→0/1。",
                                "1. 用户汇总  2. 日报  3. 标签表",
                                "| 错法 | 纠正 |\n|---|---|\n| count(amount) | 对 order_id count |\n| 忘记 as_index=False | 索引难用 |",
                                "按 status 聚合订单数与金额和。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-merge",
                            "title": "merge 关联",
                            "level": "??",
                            "content": gold(
                                "订单关联明细后 GMV 被放大。",
                                "会用 how；一对多先聚合再 merge。",
                                "groupby → 下一课：透视",
                                "orders ⋈ order_items。",
                                "- **对比 SQL JOIN**；防爆炸同金课。",
                                """bad = orders.merge(order_items, on='order_id')
print('bad paid sum', bad.query("status=='paid'")['amount'].sum())
items_agg = order_items.groupby('order_id', as_index=False).agg(
    sku_cnt=('sku_id','count'), qty_sum=('qty','sum'))
good = orders.merge(items_agg, on='order_id', how='left')
print(good.query("status=='paid'")[['order_id','amount','sku_cnt']])""",
                                "101：amount=80 且 sku_cnt=2；坏写法金额被放大。",
                                "1. 补维  2. 对照 SQL JOIN 爆炸",
                                "| 错法 | 纠正 |\n|---|---|\n| 直接 sum 头指标 | 先聚合 |\n| 默认 inner 丢名单 | left |",
                                "left merge 找出从未下单用户。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-pivot",
                            "title": "透视与变形",
                            "level": "??",
                            "content": gold(
                                "要把「用户×状态」做成宽表给运营。",
                                "会用 pivot_table / melt。",
                                "merge → 下一课：transform",
                                "orders。",
                                "- **透视**：长表变宽；**melt**：宽变长。",
                                """wide = orders.pivot_table(
    index='user_id', columns='status', values='order_id',
    aggfunc='count', fill_value=0)
print(wide)
long = wide.reset_index().melt(id_vars='user_id', var_name='status', value_name='cnt')
print(long.head())""",
                                "宽表每用户各状态计数；melt 还原长表。",
                                "1. 报表  2. 特征宽表  3. Excel 互通",
                                "| 错法 | 纠正 |\n|---|---|\n| 重复索引未聚合 | 必写 aggfunc |\n| 列名乱 | reset_index 后处理 |",
                                "透视用户×是否 paid（可先造 is_paid 列）。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-transform",
                            "title": "transform 与 rolling",
                            "level": "???",
                            "content": gold(
                                "明细旁要挂「该用户总 GMV」且保留每一行。",
                                "区分 agg（少行）与 transform（保行）；会 rolling。",
                                "透视 → 下一课：时间索引",
                                "paid 订单。",
                                "- **transform**：结果对齐原索引。\n- **rolling**：滑动窗口（需排序）。",
                                """paid = (orders.query("status=='paid'")
         .assign(amount=lambda d: d['amount'].fillna(0))
         .sort_values(['user_id','created_at']))
paid = paid.assign(
    user_total=lambda d: d.groupby('user_id')['amount'].transform('sum'),
    rolling2=lambda d: d.groupby('user_id')['amount']
                        .transform(lambda s: s.rolling(2, min_periods=1).sum())
)
print(paid.query("user_id==1")[['order_id','amount','user_total','rolling2']])""",
                                "Ada 每行 user_total=350；rolling2 为近两笔和。",
                                "1. 占比特征  2. 近 N 笔  3. 对照 SQL 窗口",
                                "| 错法 | 纠正 |\n|---|---|\n| 用 agg 还想保明细 | 改 transform |\n| rolling 未排序 | 先 sort |",
                                "算 amount / user_total 占比列。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-datetime",
                            "title": "时间索引",
                            "level": "??",
                            "content": gold(
                                "按日重采样支付 GMV，补齐无单日。",
                                "会 to_datetime、dt 访问器、resample/reindex。",
                                "transform → 下一课：读写",
                                "orders.created_at。",
                                "- **时间列**：先保证 datetime64。\n- **重采样**：需要 DatetimeIndex。",
                                """s = (orders.query("status=='paid'")
     .assign(amount=lambda d: d['amount'].fillna(0))
     .set_index('created_at')
     .resample('D')['amount'].sum())
idx = pd.date_range(s.index.min().floor('D'), s.index.max().floor('D'), freq='D')
daily = s.reindex(idx, fill_value=0)
print(daily)""",
                                "每日 GMV；无单日为 0。",
                                "1. 日报  2. 时序特征  3. 异常日定位",
                                "| 错法 | 纠正 |\n|---|---|\n| 字符串当时间比大小 | to_datetime |\n| 时区混乱 | 显式 tz |",
                                "按周 `W-MON` 重采样支付笔数。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-io",
                    "title": "读写与落地",
                    "level": "?",
                    "content": "### 读写与落地 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-read-csv",
                            "title": "read_csv / to_csv",
                            "level": "?",
                            "content": gold(
                                "把订单样例落盘再读回。",
                                "会指定 parse_dates/dtype；大文件想得起 chunk。",
                                "时间索引 → 下一课：SQL 互转",
                                "orders。",
                                "- **平面文件** ↔ DataFrame。",
                                """orders.to_csv('orders_sample.csv', index=False)
df = pd.read_csv('orders_sample.csv', parse_dates=['created_at'])
print(df.dtypes, len(df))
# 大文件：pd.read_csv(..., chunksize=100_000)""",
                                "8 行；created_at 为 datetime。",
                                "1. 交换样例  2. 质检抽样",
                                "| 错法 | 纠正 |\n|---|---|\n| 巨文件一次读入 | chunksize |\n| 混型静默 | 显式 dtype |",
                                "导出 users 读回，确认 city 空值仍在。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-to-sql",
                            "title": "to_sql / read_sql",
                            "level": "??",
                            "content": gold(
                                "汇总写回 SQLite，供 SQL 课继续查。",
                                "会用 SQLAlchemy；注意 if_exists 与权限。",
                                "CSV → 下一课：Parquet",
                                "orders/users。",
                                "- **互转** DataFrame ↔ 表。",
                                """from sqlalchemy import create_engine
eng = create_engine('sqlite:///data_nexus_sample.db')
orders.to_sql('orders', eng, if_exists='replace', index=False)
users.to_sql('users', eng, if_exists='replace', index=False)
df = pd.read_sql(
  "SELECT user_id, SUM(COALESCE(amount,0)) gmv FROM orders "
  "WHERE status='paid' GROUP BY user_id", eng)
print(df)""",
                                "与 pandas groupby 一致：350/90/0。",
                                "1. 沙箱  2. 指标回写  3. 联调 SQL",
                                "| 错法 | 纠正 |\n|---|---|\n| append 无去重 | replace/先删 |\n| 一次写爆 | chunksize |",
                                "read_sql 查从未下单用户，对照 merge。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-parquet",
                            "title": "Parquet 列存文件",
                            "level": "???",
                            "content": gold(
                                "中间结果要压缩快读，不想用 CSV。",
                                "会 to_parquet/read_parquet；知道列裁剪优势。",
                                "SQL 互转 → 下一课：可视化",
                                "orders。",
                                "- **Parquet**：列式文件，分析友好。\n- **场景**：湖/仓落地、pandas 中间层。",
                                """# 需 pyarrow 或 fastparquet
orders.to_parquet('orders.parquet', index=False)
df = pd.read_parquet('orders.parquet', columns=['order_id','user_id','amount','status'])
print(df.head())""",
                                "读回指定列；体积通常小于 CSV。",
                                "1. 流水线中间态  2. 与 Spark/仓交换",
                                "| 错法 | 纠正 |\n|---|---|\n| 小样例执念 parquet | CSV 也可 |\n| 类型不稳 | 写前定好 dtype |",
                                "比较 csv 与 parquet 文件大小（本机）。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "py-viz",
            "title": "可视化",
            "level": "??",
            "content": "### 可视化\n\n先聚合再画；讲清趋势与分布。",
            "children": [
                {
                    "id": "py-plot",
                    "title": "常用图",
                    "level": "??",
                    "content": "### 常用图 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-line",
                            "title": "折线趋势",
                            "level": "??",
                            "content": gold(
                                "看每日支付 GMV。",
                                "先按日聚合再 plot。",
                                "读写 → 下一课：柱状图",
                                "orders paid。",
                                "- **要点**：先聚合；注意缺失日。",
                                """import matplotlib.pyplot as plt
daily = (orders.query("status=='paid'")
  .assign(dt=lambda d: d['created_at'].dt.floor('D'),
          amount=lambda d: d['amount'].fillna(0))
  .groupby('dt')['amount'].sum().sort_index())
daily.plot(figsize=(8,3), marker='o', title='Daily paid GMV')
plt.tight_layout(); plt.show()""",
                                "按日折线；可与 reindex 补 0 对照。",
                                "1. 日报  2. 尖刺排查",
                                "| 错法 | 纠正 |\n|---|---|\n| 明细直接 plot | 先 groupby |\n| 滥用双轴 | 少用 |",
                                "再画每日订单数折线。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-bar",
                            "title": "柱状对比",
                            "level": "??",
                            "content": gold(
                                "对比各用户 GMV。",
                                "会用 bar；注意排序与标签。",
                                "折线 → 下一课：分布图",
                                "用户 GMV 汇总。",
                                "- **柱状**：类别对比。",
                                """import matplotlib.pyplot as plt
gmv = (orders.query("status=='paid'")
       .assign(amount=lambda d: d['amount'].fillna(0))
       .groupby('user_id')['amount'].sum().sort_values(ascending=False))
gmv.plot(kind='bar', title='User GMV', figsize=(6,3))
plt.tight_layout(); plt.show()""",
                                "Ada 柱最高。",
                                "1. 排行  2. 主题对比",
                                "| 错法 | 纠正 |\n|---|---|\n| 类别过多柱状 | 改 TopN 或交互图 |",
                                "画各 status 订单数柱状图。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-seaborn",
                            "title": "Seaborn 分布",
                            "level": "??",
                            "content": gold(
                                "看支付金额分布是否偏斜。",
                                "会用 histplot/boxplot 做 EDA。",
                                "柱状 → 下一课：NumPy",
                                "paid.amount。",
                                "- **Seaborn**：统计图形语法更省事。",
                                """import seaborn as sns
import matplotlib.pyplot as plt
pay = orders.query("status=='paid'").dropna(subset=['amount'])
sns.histplot(pay['amount'], bins=5)
plt.title('Paid amount distribution'); plt.show()
sns.boxplot(x=pay['amount']); plt.show()""",
                                "见分布与箱线；样例点少仅作手法练习。",
                                "1. EDA  2. 异常点直觉",
                                "| 错法 | 纠正 |\n|---|---|\n| 未处理 NaN | dropna/填充 |\n| 把探索图直接上报告 | 精简标注 |",
                                "按 user_id 画 amount 的 boxplot（hue/ x）。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "py-stack",
            "title": "生态与加速",
            "level": "???",
            "content": "### 生态与加速\n\nNumPy、DuckDB/Polars、sklearn、Streamlit、性能。",
            "children": [
                {
                    "id": "py-core-libs",
                    "title": "核心库",
                    "level": "???",
                    "content": "### 核心库 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-numpy",
                            "title": "NumPy 向量化",
                            "level": "??",
                            "content": gold(
                                "循环逐行算折扣太慢，想向量化。",
                                "理解 ndarray 与向量化；知道 pandas 底层常用 NumPy。",
                                "可视化 → 下一课：DuckDB",
                                "amount 数组。",
                                "- **向量化**：整列运算，避免 Python for。\n- **原则**：能列运算就列运算。",
                                """import numpy as np
amt = orders['amount'].fillna(0).to_numpy()
discount = np.where(amt >= 100, amt * 0.9, amt)
print(discount)
# 慢：for x in amt: ...
# 快：上面的 where""",
                                "≥100 的金额打 9 折后的数组。",
                                "1. 特征变换  2. 性能敏感循环",
                                "| 错法 | 纠正 |\n|---|---|\n| 大量 iterrows | 向量化/ apply 慎用 |\n| 类型反复转换 | 固定 dtype |",
                                "用向量化生成 is_high = amount>=100 的 0/1 列。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-duckdb",
                            "title": "DuckDB 内嵌 SQL",
                            "level": "???",
                            "content": gold(
                                "pandas 上想写 SQL，或本地加速聚合。",
                                "会用 duckdb.sql 查询 DataFrame。",
                                "NumPy → 下一课：Polars",
                                "orders DataFrame。",
                                "- **DuckDB**：进程内 OLAP，可直接查 DF/Parquet。\n- **价值**：SQL 技能复用 + 本地加速。",
                                """import duckdb
print(duckdb.sql('''
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders
  WHERE status='paid'
  GROUP BY user_id
  ORDER BY gmv DESC
''').df())""",
                                "与 pandas groupby 一致。",
                                "1. 本地分析  2. 查 parquet  3. 原型仓 SQL",
                                "| 错法 | 纠正 |\n|---|---|\n| 当远程仓用 | 它是内嵌引擎 |\n| 忘记注册/作用域 | 同进程 DF 名可直接用 |",
                                "用 DuckDB 写出从未下单用户。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-polars",
                            "title": "Polars 直觉",
                            "level": "???",
                            "content": gold(
                                "数据更大，pandas 内存吃紧，听说 Polars 更快。",
                                "知道懒执行/表达式 API 直觉；能写等价聚合。",
                                "DuckDB → 下一课：sklearn",
                                "同构订单数据。",
                                "- **Polars**：Rust 实现的 DataFrame，强调懒查询与并行。\n- **何时**：单机大数据帧；语法与 pandas 不同。",
                                """# import polars as pl
# df = pl.DataFrame({...同字段...})
# (df.filter(pl.col('status')=='paid')
#    .group_by('user_id')
#    .agg(pl.col('amount').fill_null(0).sum().alias('gmv')))
print('安装 polars 后取消注释跑通；口径应对齐 350/90/0')""",
                                "口径与 pandas 一致即过关。",
                                "1. 单机加速  2. 管道懒执行",
                                "| 错法 | 纠正 |\n|---|---|\n| API 当 pandas 用 | 读表达式文档 |\n| 小表强行迁移 | 无收益 |",
                                "列出 3 个仍更适合 pandas 的场景。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-sklearn",
                            "title": "sklearn 基线",
                            "level": "???",
                            "content": gold(
                                "用消费与频次粗预测是否「高 GMV 用户」。",
                                "搭最小 Pipeline：划分→标准化→逻辑回归。",
                                "Polars → 下一课：Streamlit",
                                "由 orders 构造用户特征。",
                                "- **基线**：先简单模型跑通评估，再谈复杂。\n- **纪律**：时间切分，防穿越。",
                                """import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

feat = (orders.assign(amount=lambda d: d['amount'].fillna(0))
        .groupby('user_id', as_index=False)
        .agg(pay_sum=('amount','sum'), pay_cnt=('order_id','count')))
feat['high'] = (feat['pay_sum'] >= 100).astype(int)
# 样例极少，仅演示管道；生产要用更多行+时间切分
X, y = feat[['pay_sum','pay_cnt']], feat['high']
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.5, shuffle=False)
clf = Pipeline([('sc', StandardScaler()),
                ('lr', LogisticRegression(max_iter=1000))])
clf.fit(Xtr, ytr)
print(classification_report(yte, clf.predict(Xte), zero_division=0))""",
                                "管道可 fit/predict；样例行少指标仅供手法。",
                                "1. 建模起步  2. 接 ML 教程树",
                                "| 错法 | 纠正 |\n|---|---|\n| 随机切分时序 | 按时间 |\n| 未标准化就 LR | Pipeline |",
                                "把阈值改成 predict_proba>=0.6 再评估。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-streamlit",
                            "title": "Streamlit 小应用",
                            "level": "???",
                            "content": gold(
                                "要把用户 GMV 表交给运营点选，不想做重前端。",
                                "知道 Streamlit 快速交付内部工具。",
                                "sklearn → 下一课：性能",
                                "gmv 汇总表。",
                                "- **定位**：数据脚本 → 可分享 Web。\n- **适合**：内部看板、参数探索。",
                                """# app.py
# import streamlit as st
# st.title('User GMV')
# gmv = ... # 同 groupby 结果
# st.dataframe(gmv)
# user = st.selectbox('user', gmv['user_id'])
# st.metric('GMV', float(gmv.loc[gmv.user_id==user, 'gmv']))
# 运行：streamlit run app.py
print('写出 app.py 后本地启动即可')""",
                                "页面可选用户并显示 GMV。",
                                "1. 内部工具  2. Demo 交付",
                                "| 错法 | 纠正 |\n|---|---|\n| 当高并发生产站 | 仅内部/原型 |\n| 密钥写进代码 | 环境变量 |",
                                "加一个 status 多选过滤后再聚合。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "py-eng",
                    "title": "工程化",
                    "level": "???",
                    "content": "### 工程化 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "py-perf",
                            "title": "性能与内存",
                            "level": "???",
                            "content": gold(
                                "CSV 上亿行 pandas 爆内存。",
                                "掌握 chunk、类别类型、下推计算的优先级。",
                                "Streamlit → 下一课：可复现",
                                "大文件思维；样例上演示手法。",
                                "- **顺序**：能 SQL/DuckDB/Spark 下推 → 再 Polars → 再 pandas 优化。\n- **手段**：chunksize、categorical、只用需要的列。",
                                """# 分块聚合示意
# total = {}
# for chunk in pd.read_csv('big.csv', usecols=['user_id','amount','status'], chunksize=200_000):
#     chunk = chunk.query("status=='paid'")
#     g = chunk.groupby('user_id')['amount'].sum()
#     for k,v in g.items():
#         total[k] = total.get(k,0)+v

orders['status'] = orders['status'].astype('category')
print(orders.memory_usage(deep=True))""",
                                "status 改 category 后内存占用下降（大表更明显）。",
                                "1. 单机瓶颈  2. 作业化脚本",
                                "| 错法 | 纠正 |\n|---|---|\n| 先上分布式 | 先下推/列裁剪 |\n| 全程 object 字符串 | category/枚举 |",
                                "写出：本样例 GMV 为何应优先在 SQL/DuckDB 算？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "py-repro",
                            "title": "可复现环境",
                            "level": "???",
                            "content": gold(
                                "同事跑你的笔记本结果不一致。",
                                "会冻结依赖、固定随机种子、分离探素与生产。",
                                "性能 → 练习场",
                                "任意分析脚本。",
                                "- **可复现**：同一代码+数据+环境 → 同一结果。\n- **工具**：venv/conda、requirements/lock、seed。",
                                """import random, numpy as np
random.seed(42)
np.random.seed(42)
# pip freeze > requirements.txt
# python -m venv .venv && source .venv/bin/activate
print('seed fixed; freeze your deps before sharing')""",
                                "随机性固定；依赖可安装复现。",
                                "1. 协作  2. 实验归档  3. 上线门禁",
                                "| 错法 | 纠正 |\n|---|---|\n| 全局乱装包 | 虚拟环境 |\n| 笔记本即生产 | 抽成函数/作业 |",
                                "为本教程样例列一份最小 requirements（pandas/numpy/…).",
                            ),
                            "children": [],
                        },
                    ],
                },
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


# Safety: snapshot neighbors exist before replace
for m in ["const SQL_KNOWLEDGE_TREE", "const ML_KNOWLEDGE_TREE", "const ETL_KNOWLEDGE_TREE"]:
    if m not in text:
        raise SystemExit(f"precheck fail {m}")

s, e, old = extract_object(text, "const PYTHON_KNOWLEDGE_TREE = ")
old_leaves = walk_leaves(old)
print("old leaves", len(old_leaves), old_leaves)

new_json = json.dumps(TREE, ensure_ascii=False, indent=2)
text2 = text[:s] + new_json + text[e:]

# post-check neighbors still present and parseable
for marker in [
    "const SQL_KNOWLEDGE_TREE = ",
    "const ML_KNOWLEDGE_TREE = ",
    "const PYTHON_KNOWLEDGE_TREE = ",
    "const ETL_KNOWLEDGE_TREE = ",
]:
    extract_object(text2, marker)
print("OK neighbor trees still parse")

# sectors
old_sec = '"py-pandas": "foundation", "py-viz": "advanced"'
# may already have longer form
if "py-learning-path" not in text2[text2.find("KG_SECTOR_BY_ID") : text2.find("KG_SECTOR_BY_ID") + 1200]:
    text2 = text2.replace(
        '"py-pandas": "foundation", "py-viz": "advanced"',
        '"py-pandas": "foundation", "py-viz": "advanced", "py-learning-path": "practice", '
        '"py-stack": "practice", "py-dataframe": "foundation", "py-merge": "advanced", '
        '"py-sklearn": "practice", "py-constitution": "practice", "py-duckdb": "practice"',
        1,
    )
    print("OK sectors")

# PYTHON_SAMPLE refresh
sample = {
    "tables": ["users", "orders", "order_events", "order_items"],
    "sharedWith": "SQL_SAMPLE",
    "constitutionId": "py-constitution",
    "hubId": "python",
    "leafCount": len(walk_leaves(TREE)),
}
if "const PYTHON_SAMPLE = " in text2:
    s0, s1, _ = extract_object(text2, "const PYTHON_SAMPLE = ")
    text2 = text2[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text2[s1:]
    print("OK PYTHON_SAMPLE refresh")
else:
    text2 = text2.replace(
        "const SQL_SAMPLE = ",
        "const PYTHON_SAMPLE = " + json.dumps(sample, ensure_ascii=False, indent=2) + ";\n\n    const SQL_SAMPLE = ",
        1,
    )
    print("OK PYTHON_SAMPLE insert")

# prefer already has py-constitution from earlier

p.write_text(text2, encoding="utf-8")

t3 = p.read_text(encoding="utf-8")
_, _, tree = extract_object(t3, "const PYTHON_KNOWLEDGE_TREE = ")
leaves = walk_leaves(tree)
assert find_node(tree, "py-constitution")
assert find_node(tree, "py-merge")
assert find_node(tree, "py-sklearn")
assert find_node(tree, "py-duckdb")
assert "易错对照" in find_node(tree, "py-pivot")["content"]
# ensure SQL not broken
_, _, sql = extract_object(t3, "const SQL_KNOWLEDGE_TREE = ")
assert sql.get("id") == "sql-root"
print("VALIDATED python leaves", len(leaves))
print("DONE", p.stat().st_size)
