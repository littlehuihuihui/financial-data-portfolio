# -*- coding: utf-8 -*-
"""Expand DWH_KNOWLEDGE_TREE to match main-graph warehouse curriculum."""
from __future__ import annotations

import json
from pathlib import Path

p = Path(r"D:\cursor\数据学习平台\数据知识图谱.html")
text = p.read_text(encoding="utf-8")


def lesson(s: str) -> str:
    return s.strip()


def gold(scene, goal, prereq, sample, what, code, result, uses, traps, drill, lang="sql"):
    return lesson(f"""
### 课前

- **场景**：{scene}
- **目标**：{goal}
- **先修**：{prereq}
- **学完标准**：能复述定义、独立写出等价实现、指出至少两个翻车点。

### 样例输入

{sample}

> 同源四表：`users` / `orders` / `order_items` / `order_events`（与 SQL/ETL 一致）。

### 是什么

{what}

**教义锚点**：仓内每一层都要能回答「一行代表什么、口径谁负责、重跑是否安全」。

### 怎么写

**建议步骤**

1. 先写清粒度与分区（dt）  
2. 按下述 SQL/DDL 改到你的主题域  
3. 用「查询结果」与源或上一层做闭合  
4. 对照易错表，确认没有把口径写进错误的层  

```{lang}
{code}
```

### 查询结果

{result}

### 用在哪

{uses}

**上下游**：ODS/DWD 服务可复用明细；DWS/ADS 服务指标与产品；ETL 负责按时按质送数。

### 易错对照

{traps}

### 动手

{drill}
""")


CONST = lesson("""
### 课前 · 这是什么

本页是 **数据仓库教程公约**：分层、建模、增量与质量课共用同一业务域——与 SQL / Python / ETL / 数据库 **同源样例**（`users` / `orders` / `order_items` / `order_events`）。先读本页，再按学习路径推进；金课里的验收数字以本页为准。

### 统一业务域（贴到仓分层）

| 源表（OLTP/样例） | 仓中典型落点 | 教义要点 |
|---|---|---|
| `orders` / `order_items` / `order_events` | ODS → DWD 订单/支付事实 | 先定粒度，防 JOIN 爆炸 |
| `users` | ODS → DIM 用户维（可 SCD2） | 历史属性用拉链表 |
| 按日 GMV / 用户汇总 | DWS → ADS 看板接口 | 指标下沉，看板少写私有 SQL |

**验收种子**：users=4，orders=8，order_events=7，order_items=5。  
**支付口径**：`status='paid'` + `SUM(COALESCE(amount,0))`。

### 分层一句话

```text
ODS 尽量像源  →  DWD 干净可复用明细  →  DWS 按主题汇总  →  ADS 直接服务应用
```

### 三条铁律

1. **粒度写在表名前**：一行代表什么业务事件，写不清就不建表。  
2. **口径沉在可复用层**：SSOT 在 DWD/DWS，不在每个看板私有 SQL。  
3. **重跑必须安全**：分区覆盖 / 幂等装载，和 ETL 课同一纪律。

### 金标准课模板

课前 → 样例输入 → 是什么 → 怎么写 → 结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
宪法 → 仓是什么/SSOT → 主题域/集市
→ ODS→DWD→DWS→ADS → 粒度/总线
→ 星型/雪花/星系 → Kimball·Inmon·Vault
→ 事实/维度/代理键/SCD → 增量分区对账 → 练习场
```
""")

TREE = {
    "id": "dwh-root",
    "title": "数据仓库",
    "level": "?",
    "content": "### 数据仓库知识图谱\n\n1. 先打开 **学习路径 → 教程宪法**，对齐统一交易样例\n2. 吃透分层 ODS→ADS，再学星型建模与 SCD\n3. 最后做增量、对账与练习场\n\n交互：再点中心展开领域；叶子打开讲义。",
    "children": [
        {
            "id": "dwh-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初/中/高清单 → 练习场**。样例与 SQL 同源。",
            "children": [
                {
                    "id": "dwh-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读\n\n统一样例如何映射到仓分层。点下方叶子打开全文。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": CONST,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "dwh-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线清单",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：能讲清仓与业务库区别，画出 ODS→ADS，写清一层明细事实粒度。
- **学完标准**：用同源样例说出每一层「放什么 / 不放什么」。

### 必学顺序

1. 教程宪法  
2. 仓是什么 → SSOT  
3. ODS → DWD → DWS → ADS  
4. 粒度 → 事实 / 维度入门  
5. 初级练习场

### 验收口令

- 能解释：为何 BI 不直连生产库  
- 能指出：GMV 权威口径应落在哪一层  
- 能写出：paid 明细与按用户汇总的两段 SQL
"""),
                            "children": [],
                        },
                        {
                            "id": "dwh-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：星型/总线、代理键、SCD2、增量分区、对账。
- **学完标准**：能画星型示意，并完成维表历史与日批幂等设计。

### 必学顺序

1. 总线矩阵 → **星型 / 雪花 / 星系**  
2. Kimball · Inmon · Data Vault 选型感  
3. 代理键 → 事实类型 → 一致性维度  
4. SCD1/2/3（重点 SCD2）  
5. 增量 / 分区 / 装载顺序 / 回刷  
6. 对账质检 → 中级练习场

### 验收口令

- 星型与雪花各说一个适用场景  
- SCD2 变更日能口述闭链 + 插入  
- DWS.gmv 合计能与 DWD 闭合
"""),
                            "children": [],
                        },
                        {
                            "id": "dwh-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：主题域治理、指标下沉、湖仓一体边界、回刷策略。
- **注意**：与 BI 指标口径、ETL 调度 / 血缘 / 发布课交叉学习。

### 必学顺序

1. 主题域 vs 集市边界  
2. 宽表 vs 指标下沉取舍  
3. 回刷 / 重述与分区策略  
4. 与 ETL 契约、SLA、发布回滚对齐  
5. 与 BI 语义层 / 认证数据集对齐

### 验收口令

- 能画「域 → 总线 → 集市 → 看板」责任图  
- 能说明何时不该上雪花、何时不该上 Vault  
- 能写出一次口径变更的回刷影响面
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "dwh-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "用统一样例搭一条最小「贴源→明细→汇总」链路。",
                                "写出 ODS/DWD/DWS 三层表意 SQL，并核对 GMV。",
                                "初级清单",
                                "orders / users 种子数据。",
                                "- **练习场（初级）**：分层 + 粒度 + 汇总口径。",
                                """-- Q1 ODS：贴源（示意加 dt）
-- SELECT *, '2024-01-07' AS dt FROM orders;

-- Q2 DWD：支付成功明细（粒度=一笔订单支付）
SELECT order_id, user_id, amount, created_at AS pay_at, status
FROM orders WHERE status='paid';

-- Q3 DWS：用户日 GMV（示例忽略日，按用户）
SELECT user_id, SUM(COALESCE(amount,0)) AS gmv, COUNT(*) AS pay_cnt
FROM orders WHERE status='paid'
GROUP BY user_id;

-- Q4 对账：DWS.gmv 合计 == DWD.amount 合计（fillna）
-- 两边都应接近 440（非空金额之和；含 106→0 则为 440）""",
                                "| 题 | 要点 |\n|---|---|\n| Q2 | 含 106（amount NULL） |\n| Q3 | Ada 350 |\n| Q4 | 口径一致才算过 |",
                                "1. 入职搭建  2. 与 SQL 聚合金课对照",
                                "| 错法 | 纠正 |\n|---|---|\n| DWS 直接 JOIN items 后 SUM(amount) | 先按订单粒度再汇总 |\n| ODS 里改业务口径 | 口径放 DWD/DWS |",
                                "加一张 ADS：输出 tier=H/M/L 的用户清单（阈值同 SQL 初级）。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-drill-mid",
                            "title": "中级练习",
                            "level": "??",
                            "content": gold(
                                "用户城市变更要可时光旅行；事件要去重后入仓。",
                                "完成 SCD2 闭链思维 + 事件去重 + 防爆炸汇总。",
                                "中级清单 / SCD2 / 增量去重",
                                "users、order_events、order_items。",
                                "- **练习场（中级）**：维表历史 + 事实质量。",
                                """-- Q1 事件权威行（同 SQL 增量去重）
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

-- Q3 SCD2 文字题：Dan city NULL→上海，写出闭链+插入步骤""",
                                "Q1：102 paid 只留一行；Q2：101 amount 不被放大。",
                                "1. 维表变更  2. 明细质量门禁",
                                "| 错法 | 纠正 |\n|---|---|\n| 多条 is_current=1 | 先闭链再插入 |\n| 事实直接 JOIN 多行维 | 点时间取维 |",
                                "写出 2024-01-15 查询 Dan 城市的谓词。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "dwh-why",
            "title": "仓是什么",
            "level": "?",
            "content": "### 仓是什么\n\nSSOT、与业务库边界、谁在用仓。",
            "children": [
                {
                    "id": "dwh-ssot-sec",
                    "title": "定位与边界",
                    "level": "?",
                    "content": "### 定位与边界 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-what",
                            "title": "仓是干什么的",
                            "level": "?",
                            "content": gold(
                                "业务库里也能 SELECT GMV，为什么还要数仓？",
                                "一句话说清仓的职责：面向主题、集成、相对稳定、反映历史。",
                                "教程宪法 → 下一课：SSOT",
                                "统一样例的「支付 GMV」需求。",
                                "- **一句话定义**：面向分析的集成数据集合，强调主题、整合、稳定与历史。\n- **对比业务库**：业务库答「当前订单状态」；仓答「历史经营过程」。\n- **价值**：口径可复用、与交易负载隔离、可时光旅行。",
                                """-- 业务库视角：当前状态（OLTP）
SELECT status FROM orders WHERE order_id=104;

-- 仓/分析视角：可复用的支付事实（示意 DWD）
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at
FROM orders WHERE status='paid';""",
                                "104 看状态；paid 集合支撑 GMV/漏斗等多下游。",
                                "1. 向业务解释「为何不直连生产库」  2. 立项边界",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| BI 直连生产库 | 拖垮交易 | 走仓/只读副本 |\n| 仓内保留全部交易过程态无设计 | 混乱 | 分层+粒度 |",
                                "用两句话向运营解释：为什么 GMV 以仓口径为准。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-ssot",
                            "title": "SSOT 单一事实来源",
                            "level": "?",
                            "content": gold(
                                "营销、财务、数据三套 GMV 对不上。",
                                "理解 SSOT：同一指标应追溯到同一层定义。",
                                "仓是什么 → 下一课：ODS",
                                "paid GMV 应用户汇总。",
                                "- **SSOT**：Single Source of Truth——可审计的权威口径落点。\n- **实践**：原子指标沉在 DWD/DWS，ADS 只做取用与展示。\n- **不是**：强行只留一张物理表，而是**治理上的权威定义**。",
                                """-- 权威口径示意（DWS）
CREATE VIEW dws_user_pay_gmv AS
SELECT user_id,
       SUM(COALESCE(amount,0)) AS gmv,
       COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id;

-- ADS/看板应读视图，而不是各自重写 WHERE""",
                                "三方都读 `dws_user_pay_gmv` 时 Ada=350 对齐。",
                                "1. 指标治理  2. 口径争议仲裁  3. 与 BI 课衔接",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 每个看板私有 SQL | 数不一致 | 下沉公共汇总 |\n| 把 ODS 当 SSOT | 源脏/无业务清洗 | SSOT 在清洗后层 |",
                                "列出你们公司一个「必须 SSOT」的指标，并说它应落在哪一层。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "dwh-layer",
            "title": "数仓分层",
            "level": "?",
            "content": "### 数仓分层\n\nODS → DWD → DWS → ADS 职责边界。",
            "children": [
                {
                    "id": "dwh-layers",
                    "title": "层级职责",
                    "level": "?",
                    "content": "### 层级职责 · 章节导读\n\n一层只做一类事，爆炸时好回放。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-ods",
                            "title": "ODS 贴源",
                            "level": "?",
                            "content": gold(
                                "源库订单变更要先落一份可追溯快照/流水。",
                                "知道 ODS 尽量保真，不做重业务加工。",
                                "SSOT → 下一课：DWD",
                                "OLTP `orders` 作为源。",
                                "- **一句话定义**：操作数据存储，贴源落地，便于重跑与对账。\n- **保留**：源字段名、源更新时间、装载时间、分区 dt。\n- **禁止**：在 ODS 改 GMV 口径或做复杂维退化。",
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
-- 装载示意
INSERT INTO ods_orders_di
SELECT order_id, user_id, amount, status, created_at,
       created_at, CURRENT_TIMESTAMP, '2024-01-07'
FROM orders;""",
                                "ODS 行数与源当日映像一致（全量日则 8 行）。",
                                "1. 源系统解耦  2. 重跑原料  3. 审计追溯",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| ODS 里写 CASE 分档 | 口径难追 | 放到 DWD/DWS |\n| 无分区/无装载时间 | 无法回放 | dt + etl_time |",
                                "为 `users` 设计一张 `ods_users_di` 字段清单。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-dwd",
                            "title": "DWD 明细",
                            "level": "??",
                            "content": gold(
                                "分析师要稳定的「支付成功订单明细」，不要源库脏状态。",
                                "写出清洗后的明细事实：统一码值、空值策略、业务时间。",
                                "ODS → 下一课：DWS",
                                "ods/orders 中的 paid 行。",
                                "- **一句话定义**：清洗一致后的明细事实/明细维，可被多方复用。\n- **动作**：标准码、空值、去重、时区、轻度退化维。\n- **粒度**：必须写清（如一笔支付订单一行）。",
                                """-- 粒度：一笔 paid 订单一行
INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-07')
SELECT
  order_id,
  user_id,
  COALESCE(amount, 0) AS pay_amt,
  created_at AS pay_at,
  status
FROM orders
WHERE status = 'paid';
-- 生产中通常 FROM ods_orders_di WHERE dt=...""",
                                "含 Ada/Bob/Cara 的支付单；106 的 pay_amt=0（若选 fill）。",
                                "1. 自助取数底座  2. 指标原子层  3. 机器学习样本明细",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 粒度不清 | JOIN 爆炸 | 先写「一行代表什么」 |\n| 与源字段同名但语义已变 | 误解 | 重命名+词典 |",
                                "若粒度改成「一笔订单一行 SKU」，表名/主键会怎么变？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-dws",
                            "title": "DWS 汇总",
                            "level": "??",
                            "content": gold(
                                "看板每天都算「用户 GMV、支付笔数」，不想每次扫明细。",
                                "按主题建轻度汇总；保持与 DWD 可对账。",
                                "DWD → 下一课：ADS",
                                "dwd 支付明细或直接 orders paid。",
                                "- **一句话定义**：面向主题的汇总数据层（用户/商品/渠道等）。\n- **原则**：公共汇总下沉；与明细可对上。\n- **注意**：汇总键与时间周期（日/周）写进表名或字段。",
                                """-- 用户支付汇总（示意 DWS）
SELECT
  user_id,
  SUM(COALESCE(amount,0)) AS gmv,
  COUNT(*) AS pay_cnt
FROM orders
WHERE status='paid'
GROUP BY user_id
ORDER BY gmv DESC;""",
                                "| user_id | gmv | pay_cnt |\n|---:|---:|---:|\n| 1 | 350 | 4 |\n| 2 | 90 | 1 |\n| 3 | 0 | 1 |",
                                "1. 高频看板  2. 主题宽表  3. 减少重复计算",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 汇总后无法还原争议 | 扯皮 | 保留 DWD 对账路径 |\n| 主题混杂一张上帝表 | 难维护 | 按域拆分 |",
                                "加一列 `gmv_nonnull`：只对 amount IS NOT NULL 求和，与 fill 0 对比。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-ads",
                            "title": "ADS 应用",
                            "level": "??",
                            "content": gold(
                                "运营只要「高价值用户名单」，不要自己写汇总 SQL。",
                                "在 ADS 提供接近产品的接口表/视图。",
                                "DWS → 下一课：粒度",
                                "DWS 用户 GMV。",
                                "- **一句话定义**：面向应用/报表的数据服务层。\n- **特点**：强业务语义、可含展示字段、可适度冗余。\n- **纪律**：尽量读 DWS/DWD，不直连 ODS 拼口径。",
                                """SELECT user_id, gmv,
  CASE WHEN gmv>=300 THEN 'H' WHEN gmv>=100 THEN 'M' ELSE 'L' END AS tier
FROM (
  SELECT user_id, SUM(COALESCE(amount,0)) AS gmv
  FROM orders WHERE status='paid' GROUP BY user_id
) t
ORDER BY gmv DESC;""",
                                "Ada=H，Bob=L，Cara=L。",
                                "1. 看板数据集  2. 服务 API 表  3. 运营圈选",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| ADS 各自算原子指标 | 口径漂移 | 原子在 DWD/DWS |\n| ADS 很重又被多人改 | 不稳定 | 权限+发布 |",
                                "设计一张 ADS：近 7 日每日 GMV（用样例日期）。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "dwh-model",
            "title": "维度建模",
            "level": "??",
            "content": "### 维度建模\n\n粒度、总线、**星型/雪花/星系**、事实维、代理键、SCD、流派对比。",
            "children": [
                {
                    "id": "dwh-grain-bus",
                    "title": "粒度与总线",
                    "level": "??",
                    "content": "### 粒度与总线 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-grain",
                            "title": "事实粒度",
                            "level": "??",
                            "content": gold(
                                "「订单事实」到底一行是订单头还是订单行？搞错就 JOIN 爆炸。",
                                "能先写清粒度再建模；用样例对比两种粒度。",
                                "ADS → 下一课：总线矩阵",
                                "orders vs order_items。",
                                "- **粒度**：事实表一行代表的业务事件。\n- **法则**：粒度定错，后面指标全歪。\n- **检查**：主键/唯一键能否表达该粒度。",
                                """-- 粒度 A：订单头（1 行=1 单）
SELECT order_id, user_id, amount FROM orders;

-- 粒度 B：订单行（1 行=1 SKU）
SELECT order_id, sku_id, qty FROM order_items;

-- 错误：在 B 上直接 SUM(A.amount) 会放大
SELECT SUM(o.amount) AS wrong_gmv
FROM orders o JOIN order_items i ON i.order_id=o.order_id
WHERE o.status='paid';""",
                                "wrong_gmv 大于真实订单头 GMV（101 被算两次）。",
                                "1. 建模评审第一问  2. 对接 SQL JOIN 爆炸金课",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 不写粒度文档 | 下游误解 | 表注释写清 |\n| 混粒度进一表 | 无法聚合 | 拆表 |",
                                "为 `order_events` 选粒度并写出唯一键。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-bus-matrix",
                            "title": "总线矩阵",
                            "level": "??",
                            "content": gold(
                                "交易、流量、客服多主题都要用「用户」「日期」维，如何避免各建各的？",
                                "用总线矩阵对齐公共维度与事实过程。",
                                "粒度 → 下一课：星型模型（形态）",
                                "过程：支付；维：用户、日期、状态。",
                                "- **总线矩阵**：行=业务过程，列=公共维度，打勾表示关联。\n- **目的**：一致性维度（Conformed Dimensions）。\n- **收益**：主题可拼接、指标可对比。",
                                """-- 示意矩阵（文本）
--               用户  日期  商品  渠道
-- 支付成功订单    ✓    ✓    △     ·
-- 加购           ✓    ✓    ✓     ✓

-- 公共用户维键在事实中统一
SELECT o.order_id, o.user_id, DATE(o.created_at) AS dt
FROM orders o WHERE o.status='paid';""",
                                "支付过程挂上用户与日期；商品维对订单头可选（经 items）。",
                                "1. 多主题规划  2. 主数据对齐  3. 评审材料",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 每主题自建 user 维 | 对不齐 | 公共维一张 |\n| 矩阵只画不落地 | 仍混乱 | 维表真有主人 |",
                                "补一行「退款」过程，标它需要哪些维。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "dwh-schema-styles",
                    "title": "模型形态",
                    "level": "??",
                    "content": "### 模型形态 · 章节导读\n\n星型、雪花、星系（星座）怎么选；并对照 Kimball/Inmon/Data Vault。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-star-schema",
                            "title": "星型模型",
                            "level": "??",
                            "content": gold(
                                "支付主题要让分析师少 JOIN、好理解。",
                                "画出「事实居中、维度一层环绕」的星型；对照样例表。",
                                "总线矩阵 → 下一课：雪花模型",
                                "事实：支付订单；维：用户、日期（可用退化/日期维）。",
                                "- **星型（Star）**：一张事实表 + 一组**反范式**维度表，维表通常一层直接连事实。\n- **直觉**：太阳=事实，行星=维度。\n- **优点**：查询路径短、对 BI 友好；**代价**：维表有冗余。",
                                """-- 星型查询：事实直接连用户维（一层）
SELECT
  COALESCE(u.city, '未知') AS city,
  SUM(COALESCE(o.amount, 0)) AS gmv
FROM orders o                    -- 事实（支付）
JOIN users u ON u.user_id = o.user_id   -- 维度（用户，扁平）
WHERE o.status = 'paid'
GROUP BY COALESCE(u.city, '未知');

-- 形态示意
--          dim_user
--             \\
--  dim_date — fact_pay — dim_status
--             /
--        (其它维…)""",
                                "按城市汇总 GMV；JOIN 次数少（事实↔维）。",
                                "1. 主题集市默认形态  2. 看板数据集  3. Kimball 维度建模主流",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 维表再拆很多层却叫星型 | 实际已是雪花 | 正名或扁平化 |\n| 多个事实硬塞一张 | 粒度崩溃 | 一事一事实，用星系 |",
                                "用文本画出本样例「支付」星型：列出事实与至少 2 个维。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-snowflake",
                            "title": "雪花模型",
                            "level": "??",
                            "content": gold(
                                "用户维里城市还要挂「城市→省份→大区」层级，想省存储、强约束。",
                                "理解雪花=维度再规范化分层；会算多一跳 JOIN 的代价。",
                                "星型模型 → 下一课：星系模型",
                                "把 users.city 扩展为地区层级（示意表）。",
                                "- **雪花（Snowflake）**：维度表继续拆成子维，呈雪花状。\n- **相对星型**：更省空间、更易维护层级；**查询多 JOIN**，对分析师不友好。\n- **现代实践**：很多团队仍用星型，层级用桥接表/扁平属性折中。",
                                """-- 雪花示意：用户 → 城市 → 省份
-- dim_user(user_id, user_name, city_id)
-- dim_city(city_id, city_name, province_id)
-- dim_province(province_id, province_name)

-- 等价查询（比星型多一跳）
-- SELECT p.province_name, SUM(f.pay_amt)
-- FROM fact_pay f
-- JOIN dim_user u ON u.user_sk = f.user_sk
-- JOIN dim_city c ON c.city_id = u.city_id
-- JOIN dim_province p ON p.province_id = c.province_id
-- GROUP BY p.province_name;

-- 样例库扁平写法（星型友好）：城市直接挂在 users
SELECT COALESCE(city,'未知') city, COUNT(*) 
FROM users GROUP BY 1;""",
                                "雪花路径更长；本教程样例用扁平 city 模拟星型侧。",
                                "1. 深层级地理/组织  2. 存储敏感  3. 规范化要求高的场景",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 无必要全面雪花化 | SQL 又长又慢 | 默认星型，热点层级再拆 |\n| 雪花与星型混叫 | 沟通混乱 | 评审写明形态 |",
                                "若「SKU→品类→大类」三层，画雪花与「品类属性打平进商品维」两种方案。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-constellation",
                            "title": "星系/星座模型",
                            "level": "???",
                            "content": gold(
                                "支付事实与加购事实都要连同一张用户维、日期维。",
                                "理解多事实共享维的星系（星座）模型；对接总线矩阵。",
                                "雪花 → 下一课：何时用哪种",
                                "过程：支付 +（想象）加购；共享 users。",
                                "- **星系/星座（Fact Constellation）**：多张事实表共享一致性维度。\n- **与总线**：总线矩阵正是规划「哪些过程共享哪些维」。\n- **注意**：不同事实粒度不同，不可随意 UNION 度量。",
                                """-- 事实1：支付（订单头粒度）
-- fact_pay(order_id, user_id, dt, pay_amt)

-- 事实2：订单行（SKU 粒度）——同构样例 order_items
-- fact_order_item(order_id, sku_id, user_id, dt, qty)

-- 共享维：users / 日期
SELECT u.user_name,
       SUM(COALESCE(o.amount,0)) AS gmv,
       SUM(i.qty) AS qty_sum
FROM users u
LEFT JOIN orders o
  ON o.user_id=u.user_id AND o.status='paid'
LEFT JOIN order_items i ON i.order_id=o.order_id
GROUP BY u.user_name;
-- 注意：qty 与 gmv 同查时要防 amount 被 items 放大（应分事实分别汇总再外连）""",
                                "星系允许多过程并存；混粒度 JOIN 仍可能爆炸——分过程汇总是纪律。",
                                "1. 企业级多主题  2. 总线落地  3. 跨过程对比分析",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 多事实直接互 JOIN 再 SUM | 放大 | 各事实先聚合到维键 |\n| 维表各主题翻版 | 对不齐 | 一致性维 |",
                                "用总线矩阵为「支付」「退款」打两行，标共享维。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-schema-choose",
                            "title": "何时用星型/雪花/星系",
                            "level": "??",
                            "content": gold(
                                "评审会上有人坚持雪花省空间，有人坚持星型好查。",
                                "能按场景选型并一句话说清取舍。",
                                "星系 → 下一课：事实表（构件）或 Kimball/Inmon",
                                "统一交易样例的分析需求。",
                                "| 形态 | 优先场景 | 主要代价 |\n|---|---|---|\n| 星型 | 集市/BI 自助、查询简单 | 维冗余 |\n| 雪花 | 深层级、强规范化 | 多 JOIN |\n| 星系 | 多业务过程共存 | 治理与粒度纪律 |\n\n- **默认建议**：主题集市用**星型**；多过程用**星系+总线**；雪花只在层级痛点处局部使用。",
                                """-- 决策清单（文字）
-- 1) 几个业务过程？→ 1 个星型 / 多个星系
-- 2) 维是否深层级且频繁变更？→ 局部雪花或桥接
-- 3) 主力消费方是 BI 还是 ETL？→ BI 偏星型""",
                                "对本样例「支付 GMV 看板」：选星型即可。",
                                "1. 建模评审  2. 培训对齐语言",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 为炫技全面雪花 | 分析师不会写 | 回到星型 |\n| 只有星型却塞多过程 | 表膨胀 | 拆事实成星系 |",
                                "写 3 条：你们域里各举一个适合星型/雪花/星系的例子。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-kimball-inmon",
                            "title": "Kimball 与 Inmon",
                            "level": "???",
                            "content": gold(
                                "有人说先建企业仓再下发集市，有人说先总线集市再整合。",
                                "分清 Kimball（维度/总线）与 Inmon（范式企业仓）的路线差异。",
                                "形态选型 → 下一课：Data Vault 直觉",
                                "概念课；用「支付 GMV」想象两种落地顺序。",
                                "- **Kimball**：维度建模、总线矩阵、**自下而上**集市→整合；星型为主。\n- **Inmon**：企业级 EDW **范式（3NF）**、自上而下，集市从 EDW 衍生。\n- **现实**：多数互联网/零售偏 Kimball 或混合；金融核心常更 Inmon/Vault。",
                                """-- Kimball 路径（本教程主线）
-- ODS → DWD 明细事实(星型) → DWS/ADS

-- Inmon 路径（示意）
-- ODS → 范式 EDW（集成实体） → 主题集市（再星型化）

-- 同一指标：用户 GMV
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid' GROUP BY user_id;""",
                                "口径结果可相同；组织与表形态不同。",
                                "1. 架构选型讨论  2. 读经典著作时不迷路",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 把两种对立成宗教 | 项目撕逼 | 按组织与数据成熟度混合 |\n| 范式 EDW 直接给分析师 | 不会用 | 集市层星型化 |",
                                "用一句话说明：本平台数仓课为什么更贴近 Kimball。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-datavault",
                            "title": "Data Vault 直觉",
                            "level": "???",
                            "content": gold(
                                "源系统多、变更频繁，既要审计历史又要可扩展。",
                                "建立 Hub/Link/Satellite 直觉；知道它偏集成层而非直接 BI。",
                                "Kimball/Inmon → 下一课：事实表构件",
                                "订单-用户关系可映射 Vault 构件。",
                                "- **Hub**：业务键（user、order）。\n- **Link**：业务键之间的关系（user-order）。\n- **Satellite**：描述属性与历史（城市、状态时间线）。\n- **位置**：常作原始集成层，之上再出维度集市。",
                                """-- 概念映射（非完整 DV 实现）
-- Hub_User(user_hk, user_id, load_dts)
-- Hub_Order(order_hk, order_id, load_dts)
-- Link_User_Order(link_hk, user_hk, order_hk, load_dts)
-- Sat_Order_Detail(order_hk, amount, status, load_dts, hash_diff)

-- 分析层仍可能回到星型：
SELECT user_id, SUM(COALESCE(amount,0)) FROM orders WHERE status='paid' GROUP BY 1;""",
                                "Vault 强调可审计可扩展；BI 仍常读星型集市。",
                                "1. 多源整合  2. 强审计  3. 敏捷加源",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 让业务直接查 Vault | 难用 | 上再建模集市 |\n| 与雪花混为一谈 | 概念错 | Vault≠雪花 |",
                                "把 `order_events` 想成某种 Satellite 更新，写一句理由。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "dwh-star",
                    "title": "星型构件",
                    "level": "??",
                    "content": "### 星型构件 · 章节导读\n\n事实表、维度表、代理键——星型里的零件。",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-fact",
                            "title": "事实表",
                            "level": "??",
                            "content": gold(
                                "要把支付过程沉淀为可累加指标表。",
                                "区分事务事实；度量可加；外键连维。",
                                "形态选型 / 总线 → 下一课：维度表",
                                "paid 订单。",
                                "- **事实表**：记录业务过程，含外键 + 可加度量。\n- **类型**：事务事实、周期快照、累计快照（先掌握事务）。\n- **度量**：`pay_amt`、`pay_cnt`（常为 1）。",
                                """-- 事务事实：支付成功
SELECT
  order_id AS pay_id,
  user_id,
  DATE(created_at) AS dt,
  COALESCE(amount,0) AS pay_amt,
  1 AS pay_cnt
FROM orders
WHERE status='paid';""",
                                "每笔支付一行；Ada 四笔度量可 SUM。",
                                "1. 主题明细  2. 汇总来源  3. 对账",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 把不可加指标当度量乱 SUM | 比率错误 | 比率放 ADS/计算 |\n| 事实表塞大量文本 | 膨胀 | 进维表 |",
                                "说明：订单「状态」更适合当维属性还是度量？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-dim",
                            "title": "维度表",
                            "level": "??",
                            "content": gold(
                                "报表要按城市看 GMV，需要用户维。",
                                "会设计维表字段；理解退化维。",
                                "事实表 → 下一课：代理键",
                                "users + 支付事实。",
                                "- **维度表**：描述「谁/何处/何时/何物」的上下文。\n- **退化维**：订单号等可直接放事实的短码。\n- **查询**：事实 JOIN 维再按维属性 GROUP。",
                                """SELECT
  COALESCE(u.city, '未知') AS city,
  SUM(COALESCE(o.amount,0)) AS gmv
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status='paid'
GROUP BY COALESCE(u.city, '未知');""",
                                "上海 / 北京 等城市 GMV；Dan 无支付不出现。",
                                "1. 下钻分析  2. 一致性维  3. 标签来源",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 维表无主键 | 一对多放大 | 用户一行（或 SCD 版本行） |\n| 城市在事实里重复字符串 | 难变更历史 | 维表+键 |",
                                "把 `status` 做成退化维还是小维表？写你的选择理由。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-surrogate-key",
                            "title": "代理键",
                            "level": "???",
                            "content": gold(
                                "源系统 user_id 可能复用/合并，维表历史版本如何稳定关联？",
                                "理解代理键（仓库生成）与自然键（业务键）分工。",
                                "维度表 → 下一课：SCD2",
                                "users 自然键 user_id。",
                                "- **自然键**：源业务主键（user_id）。\n- **代理键**：仓内无意义整型键，标识维行版本。\n- **事实存代理键**：SCD2 时点关联才稳。",
                                """-- 维表示意
-- user_sk | user_id | city | valid_from | valid_to | is_current
-- 1001   | 4       | NULL | 2024-01-10 | 2024-02-01 | 0
-- 1002   | 4       | 上海 | 2024-02-01 | 9999-12-31 | 1

-- 事实持有 user_sk=1001/1002，而不是只存 user_id+后期城市""",
                                "同一自然键多行版本；事实按事件时间选 sk。",
                                "1. SCD2 落地  2. 源键不稳定  3. 多源整合",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 事实只存自然键且维无历史 | 无法时光旅行 | SCD2+代理键 |\n| 代理键用业务编码 | 冲突 | 仓内序列 |",
                                "说明支付事实应存 `user_id` 还是 `user_sk`，或两者都存的理由。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "dwh-scd-sec",
                    "title": "缓慢变化维",
                    "level": "???",
                    "content": "### 缓慢变化维 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-scd1",
                            "title": "SCD1 覆盖",
                            "level": "??",
                            "content": gold(
                                "用户改名，历史报表不需要旧名。",
                                "掌握 SCD1：直接覆盖，不保留历史。",
                                "代理键 → 下一课：SCD2",
                                "users.user_name 变更场景。",
                                "- **SCD1**：新值覆盖旧值，无历史。\n- **适用**：纠错、不关心历史属性。\n- **代价**：无法回答「当时叫什么」。",
                                """-- SCD1 示意
UPDATE users SET user_name = 'Ada Lovelace' WHERE user_id=1;
SELECT * FROM users WHERE user_id=1;""",
                                "只见新名；旧名消失。",
                                "1. 主数据纠错  2. 不需要历史的属性",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 该留历史却用 SCD1 | 审计失败 | 改 SCD2 |\n| 全字段 SCD1 | 误覆盖关键史 | 按字段策略 |",
                                "判断：手机号纠错 vs 会员等级变迁，谁更适合 SCD1？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-scd2",
                            "title": "SCD2 拉链表",
                            "level": "???",
                            "content": gold(
                                "Dan 城市从空变为上海，下单时城市要可回放。",
                                "会闭链旧行 + 插入新行；点时间查询。",
                                "SCD1 → 下一课：增量策略",
                                "users_scd2 练习表（勿破坏分析用 users 主数据时可另建）。",
                                "- **SCD2**：保留历史版本（valid_from/to, is_current）。\n- **动作**：变更时闭链，再插新版本。\n- **关联**：事实按事件时间找维版本。",
                                """CREATE TABLE IF NOT EXISTS users_scd2 (
  user_id INT, user_name VARCHAR(32), city VARCHAR(32),
  valid_from TIMESTAMP, valid_to TIMESTAMP, is_current INT,
  PRIMARY KEY(user_id, valid_from)
);
-- 初始 + 变更步骤见 SQL「拉链表 SCD2」金课同构写法
UPDATE users_scd2 SET valid_to='2024-02-01', is_current=0
WHERE user_id=4 AND is_current=1;
-- INSERT 新版本 city='上海' ...

SELECT * FROM users_scd2
WHERE user_id=4
  AND valid_from <= '2024-01-15'
  AND valid_to   >  '2024-01-15';""",
                                "点 2024-01-15 得到旧城市；当前行是上海。",
                                "1. 地址/等级历史  2. 价格维  3. 合规审计",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 不闭链 | 多个 current | 先闭链 |\n| 用 NULL 当无限终点 | 比较别扭 | 远未来哨兵 |",
                                "为 Ada 模拟一次城市变更，并查她 2024-01-02 的城市。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "dwh-pipeline",
            "title": "加工与质量",
            "level": "???",
            "content": "### 加工与质量\n\n增量、分区、对账。",
            "children": [
                {
                    "id": "dwh-incr-sec",
                    "title": "增量与分区",
                    "level": "???",
                    "content": "### 增量与分区 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-incremental",
                            "title": "增量策略",
                            "level": "???",
                            "content": gold(
                                "每天重刷全年订单太贵，只要昨天变更。",
                                "分清全量、增量、CDC；设计水位与幂等。",
                                "SCD2 → 下一课：分区裁剪",
                                "orders / order_events。",
                                "- **全量**：简单但贵。\n- **增量**：按时间/水位拉新变。\n- **CDC**：基于日志的变更捕获。\n- **幂等**：同一天重跑结果一致（常用覆盖分区）。",
                                """-- 增量：昨日新支付（示意）
SELECT *
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-07'
  AND created_at <  '2024-01-08';

-- 事件去重后再入 DWD（权威行）
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id
  ) rn FROM order_events e
) t WHERE rn=1;""",
                                "增量窗口内行可重复跑；去重后 102 paid 一行。",
                                "1. 日批作业  2. 近实时入仓  3. 成本治理",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 无水位乱抽 | 漏数/重数 | 明确水位+补数 |\n| 追加不覆盖 | 重复事实 | 分区覆盖或 merge |",
                                "为 orders 设计一个「迟到数据」补数策略（一句话）。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "dwh-partition",
                            "title": "分区与裁剪",
                            "level": "???",
                            "content": gold(
                                "查一个月 GMV 却扫了三年分区。",
                                "分区键放时间；谓词写成可裁剪范围。",
                                "增量策略 → 下一课：对账质检",
                                "按 dt 分区的思维套在 orders.created_at。",
                                "- **分区**：物理切分，利裁剪与生命周期。\n- **裁剪**：WHERE 能定位分区才省扫。\n- **常见**：按日 dt。",
                                """-- 可裁剪
SELECT SUM(COALESCE(amount,0))
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-01'
  AND created_at <  '2024-02-01';

-- 风险：对分区键套函数
-- WHERE DATE(created_at)=...  （视引擎可能无法裁剪）""",
                                "一月支付金额汇总；扫描应落在一月范围。",
                                "1. 大表 SQL  2. 生命周期掉数  3. 成本",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 分区过碎 | 小文件/元数据炸 | 合理粒度 |\n| 谓词不带分区键 | 全扫 | 强制模板带 dt |",
                                "解释 HASH(user_id) 分区能否靠时间谓词裁剪。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "dwh-dq-sec",
                    "title": "质量与对账",
                    "level": "???",
                    "content": "### 质量与对账 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "dwh-reconcile",
                            "title": "对账质检",
                            "level": "???",
                            "content": gold(
                                "DWS 上线后财务说 GMV 少了 8%。",
                                "建立层间对账与基础 DQ（唯一、空值、波动）。",
                                "分区 → 练习场",
                                "DWD 明细 vs DWS 汇总。",
                                "- **对账**：同源不同层的指标闭合。\n- **DQ**：主键唯一、空值率、行数波动、枚举合法。\n- **门禁**：失败阻断下游 ADS。",
                                """-- 层间对账
SELECT 'dwd' AS layer, SUM(COALESCE(amount,0)) AS gmv
FROM orders WHERE status='paid'
UNION ALL
SELECT 'dws', SUM(gmv) FROM (
  SELECT user_id, SUM(COALESCE(amount,0)) gmv
  FROM orders WHERE status='paid' GROUP BY user_id
) t;

-- 唯一性
SELECT order_id, COUNT(*) c FROM orders GROUP BY order_id HAVING COUNT(*)>1;

-- 空值率
SELECT AVG(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS null_rate
FROM orders WHERE status='paid';""",
                                "两层 gmv 应一致；order_id 无重复；paid 空值率=1/6。",
                                "1. 上线验收  2. 晨检  3. 事故定位",
                                "| 错法 | 现象 | 纠正 |\n|---|---|---|\n| 只看行数不对金额 | 漏口径 | 金额+笔数双对 |\n| 质检不阻断 | 脏数进看板 | 门禁 |",
                                "为 order_items 写一条「孤儿订单行」质检 SQL。",
                            ),
                            "children": [],
                        }
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


s, e, _ = extract_object(text, "const DWH_KNOWLEDGE_TREE = ")
for m in ["const ETL_KNOWLEDGE_TREE", "const BI_KNOWLEDGE_TREE", "const PYTHON_KNOWLEDGE_TREE"]:
    if m not in text:
        raise SystemExit("precheck missing " + m)

text = text[:s] + json.dumps(TREE, ensure_ascii=False, indent=2) + text[e:]
print("OK DWH tree leaves", len(walk_leaves(TREE)))

import re

text, n_pref = re.subn(
    r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?null;",
    """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "dwh" ? "dwh-constitution" : null;""",
    text,
    count=1,
)
print("OK prefer", n_pref)

sec_zone = text[text.find("KG_SECTOR_BY_ID") : text.find("KG_SECTOR_BY_ID") + 2500]
if "dwh-snowflake" not in sec_zone:
    text = text.replace(
        '"dwh-layer": "foundation", "dwh-model": "advanced",',
        '"dwh-layer": "foundation", "dwh-model": "advanced", "dwh-learning-path": "practice",'
        ' "dwh-why": "foundation", "dwh-pipeline": "practice",'
        ' "dwh-schema-styles": "advanced", "dwh-star-schema": "advanced", "dwh-snowflake": "advanced",'
        ' "dwh-constellation": "practice", "dwh-kimball-inmon": "practice",'
        ' "dwh-ods": "foundation", "dwh-dwd": "foundation", "dwh-dws": "advanced", "dwh-ads": "advanced",'
        ' "dwh-grain": "advanced", "dwh-fact": "advanced", "dwh-scd2": "practice",'
        ' "dwh-constitution": "practice",',
        1,
    )
    print("OK sectors")

if "const DWH_SAMPLE" not in text:
    sample = {
        "tables": ["users", "orders", "order_events", "order_items"],
        "sharedWith": "SQL_SAMPLE",
        "constitutionId": "dwh-constitution",
        "hubId": "dwh",
        "layers": ["ODS", "DWD", "DWS", "ADS"],
        "schemas": ["star", "snowflake", "constellation"],
    }
    insert_at = "const DB_SAMPLE = " if "const DB_SAMPLE" in text else "const SQL_SAMPLE = "
    text = text.replace(
        insert_at,
        "const DWH_SAMPLE = " + json.dumps(sample, ensure_ascii=False, indent=2) + ";\n\n    " + insert_at,
        1,
    )
    print("OK DWH_SAMPLE")
else:
    try:
        s0, s1, sample = extract_object(text, "const DWH_SAMPLE = ")
        sample["schemas"] = ["star", "snowflake", "constellation"]
        text = text[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text[s1:]
        print("OK DWH_SAMPLE schemas")
    except Exception:
        print("SKIP sample refresh")

p.write_text(text, encoding="utf-8")

t2 = p.read_text(encoding="utf-8")
for marker in [
    "const SQL_KNOWLEDGE_TREE = ",
    "const PYTHON_KNOWLEDGE_TREE = ",
    "const ETL_KNOWLEDGE_TREE = ",
    "const DWH_KNOWLEDGE_TREE = ",
    "const BI_KNOWLEDGE_TREE = ",
]:
    extract_object(t2, marker)
if "const DATABASE_KNOWLEDGE_TREE = " in t2:
    extract_object(t2, "const DATABASE_KNOWLEDGE_TREE = ")

_, _, tree = extract_object(t2, "const DWH_KNOWLEDGE_TREE = ")
leaves = walk_leaves(tree)
for eid in [
    "dwh-constitution",
    "dwh-ads",
    "dwh-star-schema",
    "dwh-snowflake",
    "dwh-constellation",
    "dwh-schema-choose",
    "dwh-kimball-inmon",
    "dwh-datavault",
]:
    assert find_node(tree, eid), eid
assert "雪花" in find_node(tree, "dwh-snowflake")["content"]
print("VALIDATED", len(leaves), "leaves")
print("DONE", p.stat().st_size)
