# -*- coding: utf-8 -*-
"""Rebuild ETL_KNOWLEDGE_TREE: constitution + gold lessons + drills on shared sample."""
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


CONST = lesson("""
### 课前 · 这是什么

本页是 **ETL 教程公约**：认源→抽取→转换→装载→校验→调度，与 SQL/数仓/Python **同源样例**（`users` / `orders` / `order_items` / `order_events`）。先读本页，再按清单上课。

### 统一样例（源系统视角）

把四表当成业务库 OLTP；ETL 日作业产出仓表（示意）：

| 层 | 表示意 | 来源 |
|---|---|---|
| ODS | `ods_orders_di` | 贴源 orders + dt |
| DWD | `dwd_trade_pay_di` | 清洗后的 paid 明细 |
| DIM | `dim_user` | users（可 SCD2） |
| DQ | 对账结果 | 行数/金额闭合 |

验收种子：users=4，orders=8，events=7，items=5。

### 金标准课模板

课前 → 样例输入 → 是什么 → 怎么写 → 结果 → 用在哪 → 易错对照 → 动手。

### 学习主线

```text
宪法 → 认源/契约/SLA → 全量/增量/CDC
→ 清洗去重/维关联/SCD → 覆盖·MERGE·幂等
→ 行数唯一对账 → DAG·重试·回填 → ETL vs ELT → 工具选型 → 练习场
```
""")

TREE = {
    "id": "etl-root",
    "title": "ETL",
    "level": "?",
    "content": "### ETL 知识图谱\n\n1. 先打开 **学习路径 → 教程宪法**\n2. 按「认源→抽→转→装→验→调度」推进\n3. 对照数仓分层与 SQL 增量/SCD 金课\n\n现代常见 **ELT**：先落地再仓内变换（dbt）。",
    "children": [
        {
            "id": "etl-learning-path",
            "title": "学习路径",
            "level": "?",
            "content": "### 学习路径\n\n**教程宪法 → 初/中/高清单 → 练习场**。",
            "children": [
                {
                    "id": "etl-constitution-sec",
                    "title": "教程宪法",
                    "level": "?",
                    "content": "### 教程宪法 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-constitution",
                            "title": "统一样例与课模板",
                            "level": "?",
                            "content": CONST,
                            "children": [],
                        }
                    ],
                },
                {
                    "id": "etl-roadmap",
                    "title": "路线清单",
                    "level": "?",
                    "content": "### 路线清单",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-path-junior",
                            "title": "初级清单",
                            "level": "?",
                            "content": lesson("""
### 课前

- **定位**：能说清端到端步骤；会写增量水位与分区覆盖；会做行数/金额对账。
- **顺序**：宪法 → 源清单/主键水位 → 全量/增量 → 类型空值/去重 → 分区覆盖 → 行数对账 → 初级练习
"""),
                            "children": [],
                        },
                        {
                            "id": "etl-path-mid",
                            "title": "中级清单",
                            "level": "??",
                            "content": lesson("""
### 课前

- **定位**：CDC、SCD、MERGE 幂等、DAG 重试回填、ETL vs ELT。
- **顺序**：CDC → 维关联/SCD → MERGE/幂等 → 唯一与源仓对账 → DAG/告警/回填 → ELT
"""),
                            "children": [],
                        },
                        {
                            "id": "etl-path-senior",
                            "title": "高级清单",
                            "level": "???",
                            "content": lesson("""
### 课前

- **定位**：契约治理、迟到数据、脱敏、工具选型（Airflow/dbt/CDC/DataX）。
- **原则**：幂等可重跑；质量门禁在下游消费前。
"""),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "etl-practice-field",
                    "title": "练习场",
                    "level": "??",
                    "content": "### 练习场",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-drill-junior",
                            "title": "初级练习",
                            "level": "?",
                            "content": gold(
                                "用统一样例跑通「增量抽→清洗→覆盖→对账」。",
                                "写出水位抽取、去重、分区覆盖与金额对账 SQL。",
                                "初级清单",
                                "orders / order_events。",
                                "- **练习场（初级）**：批处理最小闭环。",
                                """-- Q1 增量：昨日以来（示意）
SELECT * FROM orders
WHERE created_at >= '2024-01-07' AND created_at < '2024-01-08';

-- Q2 事件去重权威行
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time, event_id) rn
  FROM order_events e
) t WHERE rn=1;

-- Q3 DWD paid + 对账
SELECT SUM(COALESCE(amount,0)) gmv FROM orders WHERE status='paid';
-- 应与按用户汇总后再 SUM 一致""",
                                "Q2：102 paid 一行；Q3：两层 gmv 闭合。",
                                "1. 入职作业  2. 对照数仓练习",
                                "| 错法 | 纠正 |\n|---|---|\n| 无水位全表抽 | 拖垮源库 |\n| 追加写入不覆盖 | 重复事实 |",
                                "为 users 设计主键与增量字段（若只有 created_at 怎么办？）。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-drill-mid",
                            "title": "中级练习",
                            "level": "??",
                            "content": gold(
                                "维表变更要历史；装载要幂等；任务失败要可回填。",
                                "完成 SCD2 步骤口述、MERGE 语义、回填注意点。",
                                "中级清单",
                                "users / orders。",
                                "- **练习场（中级）**：历史 + 幂等 + 运维。",
                                """-- Q1 SCD2：Dan 城市变更（闭链+插入）——步骤题
-- Q2 MERGE 语义：按 order_id 更新 status/amount，否则插入
-- Q3 回填 dt='2024-01-02' 时如何保证不与增量打架？""",
                                "Q3：按分区覆盖或合并策略，同一 dt 重跑结果不变。",
                                "1. 上线评审  2. 故障演练",
                                "| 错法 | 纠正 |\n|---|---|\n| 回填无锁水位 | 漏数/重数 |\n| SCD 不闭链 | 多 current |",
                                "画出 DAG：抽orders→抽users→转DWD→测DQ→出ADS。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "etl-source-contract",
            "title": "认源与契约",
            "level": "?",
            "content": "### 认源与契约\n\n先有清单与口径，再写管道。",
            "children": [
                {
                    "id": "etl-source-inventory",
                    "title": "源表清单",
                    "level": "?",
                    "content": "### 源表清单 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-source-list",
                            "title": "源表清单",
                            "level": "?",
                            "content": gold(
                                "新主题要接入交易库，不知有哪些表、谁负责。",
                                "产出源表清单：系统、表、Owner、频率、主键。",
                                "教程宪法 → 下一课：主键与水位",
                                "统一四表即最小源清单。",
                                "- **认源**：列出可抽对象与责任人。\n- **字段**：更新频率、是否可增量、敏感级别。",
                                """-- 源清单（文档/表）
-- system | table        | owner | freq | pk
-- oltp   | users        | u-a   |日批  | user_id
-- oltp   | orders       | u-a   |日批  | order_id
-- oltp   | order_items  | u-a   |日批  | (order_id,sku_id)
-- oltp   | order_events | u-a   |近实时| event_id""",
                                "四表齐备且有 Owner；缺表不进入开发。",
                                "1. 立项  2. 交接  3. 影响分析",
                                "| 错法 | 纠正 |\n|---|---|\n| 口头约定无清单 | 丢表 | 书面清单 |\n| 无 Owner | 故障无人认 | 指定人 |",
                                "给 order_events 标：批还是 CDC 更合适？为什么。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-keys-watermark",
                            "title": "主键与水位",
                            "level": "?",
                            "content": gold(
                                "增量任务跑完发现漏单，因为用了错的时间字段。",
                                "选定业务主键与水位字段（updated_at/业务时间）。",
                                "源表清单 → 下一课：数据契约",
                                "orders：主键 order_id；可用 created_at 作示意水位。",
                                "- **主键**：唯一标识一行，去重与 MERGE 依赖它。\n- **水位**：增量窗口上界/下界；成功后推进。\n- **注意**：业务时间 ≠ 入库时间，迟到数据要补数策略。",
                                """-- 水位增量
SELECT *
FROM orders
WHERE created_at >  :last_success_ts
  AND created_at <= :batch_end_ts;

-- 成功后：把 last_success_ts 更新为 batch_end_ts（元数据表）""",
                                "窗口内行可重复抽取；结合目标幂等写入。",
                                "1. 增量抽取  2. 对账切片  3. 回填窗口",
                                "| 错法 | 纠正 |\n|---|---|\n| 用不确定字段当水位 | 漏数 | 选稳定单调字段 |\n| 推进水位早于装载成功 | 丢数 | 先成功再推进 |",
                                "若只有 created_at 无 updated_at，更新单如何捕获？",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "etl-contract-sla",
                    "title": "契约与 SLA",
                    "level": "??",
                    "content": "### 契约与 SLA · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-data-contract",
                            "title": "数据契约",
                            "level": "??",
                            "content": gold(
                                "源端偷偷把 status 改成数字码，下游全挂。",
                                "约定字段类型、枚举、空值语义，变更需通知。",
                                "主键水位 → 下一课：SLA",
                                "orders.status ∈ {created,paid,cancelled}；amount 可空。",
                                "- **数据契约**：生产方与消费方对 schema/语义的协议。\n- **内容**：类型、主键、枚举、空值、兼容策略。",
                                """-- 契约断言（装载后测）
SELECT COUNT(*) AS bad_status
FROM orders
WHERE status NOT IN ('created','paid','cancelled');
-- 期望 0

SELECT COUNT(*) AS null_pk FROM orders WHERE order_id IS NULL;
-- 期望 0""",
                                "样例库 bad_status=0，null_pk=0。",
                                "1. 防静默破坏  2. 跨团队协作  3. Schema Registry",
                                "| 错法 | 纠正 |\n|---|---|\n| 无版本乱改字段 | 下游炸 | 契约+兼容窗口 |\n| 只测类型不测语义 | 口径漂 | 枚举/范围断言 |",
                                "为 amount 写一条契约：类型与空值是否允许。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-sla",
                            "title": "产出 SLA",
                            "level": "??",
                            "content": gold(
                                "运营 9 点要看昨日 GMV，表经常 9:20 才到。",
                                "定义就绪时间与失败升级路径。",
                                "数据契约 → 下一课：全量快照",
                                "T+1 报表依赖 dwd 支付表。",
                                "- **SLA**：最晚就绪时间、完整度、负责人。\n- **联动**：超时告警、降级读昨日。",
                                """-- 就绪检查（示意）
-- SELECT MAX(etl_time) FROM dwd_trade_pay_di WHERE dt='{{ ds }}';
-- 若 NOW()>'09:00' AND 未就绪 → Pager/飞书告警""",
                                "SLA 示例：工作日 08:30 前 dt=昨日分区就绪。",
                                "1. 看板承诺  2. 值班  3. 容量规划",
                                "| 错法 | 纠正 |\n|---|---|\n| 无 SLA 只看「大概好了」 | 扯皮 | 写明时钟点 |\n| 告警无处理人 | 噪声 | on-call |",
                                "为「用户维日更」设一个合理 SLA 并说明依据。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "etl-extract",
            "title": "抽取 Extract",
            "level": "?",
            "content": "### 抽取\n\n全量、增量、CDC。",
            "children": [
                {
                    "id": "etl-extract-modes",
                    "title": "抽取策略",
                    "level": "?",
                    "content": "### 抽取策略 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-full-snapshot",
                            "title": "全量快照",
                            "level": "?",
                            "content": gold(
                                "维表很小，每天全量最简单。",
                                "会做全量导出/查询；知道大表成本。",
                                "SLA → 下一课：增量抽取",
                                "users 仅 4 行。",
                                "- **全量**：每次拉整表快照。\n- **适合**：小维表、无可靠水位。\n- **风险**：大表拖垮源库、窗口长。",
                                """SELECT * FROM users;
-- 落地：ods_users_di PARTITION(dt='2024-01-07')""",
                                "4 行完整镜像。",
                                "1. 小维表  2. 初始化  3. 对账基准",
                                "| 错法 | 纠正 |\n|---|---|\n| 大事实表每日全量 | 源库打满 | 增量/CDC |\n| 全量无 dt | 无法回放 | 分区 |",
                                "估算：orders 若 1 亿行，全量一次的风险点列 3 条。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-incr",
                            "title": "增量抽取",
                            "level": "?",
                            "content": gold(
                                "订单表很大，只要昨天变更。",
                                "按水位窗口抽取；结合目标幂等。",
                                "全量 → 下一课：CDC",
                                "orders.created_at 示意。",
                                "- **增量**：只拉变化切片。\n- **关键**：水位字段 + 成功后推进 + 迟到补数。",
                                """SELECT *
FROM orders
WHERE created_at >= '2024-01-07'
  AND created_at <  '2024-01-08';""",
                                "窗口内含 108 等行。",
                                "1. 日批事实  2. 成本控制",
                                "| 错法 | 纠正 |\n|---|---|\n| 用本地时钟当水位 | 漏数 | 用源字段 |\n| 装载失败仍推进 | 永久漏 | 事务化元数据 |",
                                "设计：更新单只有 updated_at 时的 WHERE。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-cdc",
                            "title": "CDC 变更捕获",
                            "level": "???",
                            "content": gold(
                                "要近实时同步订单状态，又不能轮询整表。",
                                "理解 CDC 读日志（binlog/WAL）；知道排序与去重。",
                                "增量 → 下一课：类型与空值",
                                "order_events 可模拟变更流。",
                                "- **CDC**：从数据库日志捕获增删改。\n- **组件**：Debezium / Flink CDC → Kafka → 装载。\n- **注意**：schema 变更、恰好一次、乱序。",
                                """-- 用事件表模拟「变更流」并取最新
SELECT * FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time DESC, event_id DESC) rn
  FROM order_events e
) t WHERE rn=1;""",
                                "每组事件类型保留最新一条（演示流上的压缩）。",
                                "1. 近实时数仓  2. 微服务同步  3. 审计",
                                "| 错法 | 纠正 |\n|---|---|\n| 当银弹替代建模 | 仍要分层 | CDC+仓模型 |\n| 忽略删事件 | 目标脏 | 处理 DELETE |",
                                "说明：CDC 后为何还要 ODS/DWD，而不是直写看板。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "etl-transform",
            "title": "转换 Transform",
            "level": "??",
            "content": "### 转换\n\n清洗、去重、关联、SCD。",
            "children": [
                {
                    "id": "etl-cleanse",
                    "title": "清洗与标准化",
                    "level": "??",
                    "content": "### 清洗与标准化 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-type-normalize",
                            "title": "类型与空值",
                            "level": "?",
                            "content": gold(
                                "源端 amount 是字符串，status 大小写混乱。",
                                "统一类型、枚举大小写与空值策略。",
                                "CDC → 下一课：去重",
                                "orders。",
                                "- **标准化**：类型、命名、码值、时区。\n- **空值**：保留、填充或拒绝，要写进契约。",
                                """SELECT
  order_id,
  user_id,
  CAST(amount AS DECIMAL(18,2)) AS amount,
  LOWER(status) AS status,
  created_at
FROM orders;""",
                                "类型统一；status 小写。",
                                "1. staging 层  2. dbt staging",
                                "| 错法 | 纠正 |\n|---|---|\n| 静默 CAST 失败变 NULL | 监控坏行 |\n| 随意 fillna(0) | 语义错 | 按指标定 |",
                                "对 city NULL：填「未知」还是保留？写选择。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-dedup",
                            "title": "去重取最新",
                            "level": "??",
                            "content": gold(
                                "事件表 102 的 paid 重复，入仓会双计。",
                                "按业务键 ROW_NUMBER 取权威行。",
                                "类型空值 → 下一课：维表关联",
                                "order_events。",
                                "- **去重**：同一业务键只留一条权威记录。\n- **决胜列**：时间 + 自增 id。",
                                """SELECT event_id, order_id, event_type, event_time FROM (
  SELECT e.*, ROW_NUMBER() OVER (
    PARTITION BY order_id, event_type
    ORDER BY event_time ASC, event_id ASC) rn
  FROM order_events e
) t WHERE rn = 1;""",
                                "102+paid 仅留较早 event_id。",
                                "1. CDC 落地  2. 重复报文  3. 对照 SQL 去重金课",
                                "| 错法 | 纠正 |\n|---|---|\n| DISTINCT * | 业务键仍重 |\n| 无决胜列 | 结果不稳 |",
                                "改成取**最新**事件（ORDER BY DESC）。",
                            ),
                            "children": [],
                        },
                    ],
                },
                {
                    "id": "etl-enrich",
                    "title": "关联与历史",
                    "level": "??",
                    "content": "### 关联与历史 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-dim-join",
                            "title": "维表关联",
                            "level": "??",
                            "content": gold(
                                "事实要带城市，但直接 JOIN 明细会炸 GMV。",
                                "先定粒度；维关联用键；一对多先聚合。",
                                "去重 → 下一课：SCD",
                                "orders ⋈ users；orders ⋈ items。",
                                "- **关联**：补维度属性。\n- **纪律**：防 JOIN 爆炸（先聚合 items）。",
                                """-- 安全：订单头 + 用户
SELECT o.order_id, o.amount, u.city
FROM orders o
LEFT JOIN users u ON u.user_id=o.user_id
WHERE o.status='paid';

-- 危险对照：先 JOIN items 再 SUM(amount)
-- 正确：items 先 COUNT 再关联""",
                                "城市补全；金额不被 items 放大。",
                                "1. DWD 宽出  2. 特征拼接",
                                "| 错法 | 纠正 |\n|---|---|\n| 多事实互 JOIN 再 SUM | 分过程汇总 |\n| 丢失维用 inner | 视需求 left |",
                                "写出 sku_cnt 关联的正确 SQL。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-scd",
                            "title": "SCD 拉链",
                            "level": "???",
                            "content": gold(
                                "用户城市变更，历史报表要旧值。",
                                "掌握 SCD1/SCD2；ETL 日批闭链插入。",
                                "维表关联 → 下一课：分区覆盖",
                                "users / users_scd2。",
                                "- **SCD1** 覆盖；**SCD2** 拉链表保留历史。\n- **ETL 步骤**：比对自然键 → 闭链 → 插新版本。",
                                """-- SCD2 变更日伪代码
-- 1) 今日快照 vs is_current=1
-- 2) 有变化：UPDATE SET valid_to=:ds, is_current=0
-- 3) INSERT 新版本 is_current=1, valid_from=:ds
-- 详见数仓「SCD2」课同构示例""",
                                "点时间可查到变更前城市。",
                                "1. 维表日批  2. 审计  3. 对接数仓 SCD 课",
                                "| 错法 | 纠正 |\n|---|---|\n| 不闭链 | 多 current |\n| 事实未存代理键/版本 | 无法时光旅行 |",
                                "判断手机号纠错用 SCD1 还是 2。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-pii-mask",
                            "title": "脱敏与合规",
                            "level": "???",
                            "content": gold(
                                "手机号不能明文进分析域。",
                                "在变换层哈希/掩码；权限最小化。",
                                "SCD → 装载 或 高级清单",
                                "假设 users 有 phone 字段（示意）。",
                                "- **脱敏**：不可逆哈希或掩码。\n- **位置**：尽早在进入广泛可访问层前处理。",
                                """-- 示意
-- SELECT user_id, SHA2(phone,256) AS phone_hash FROM users;
SELECT user_id, user_name FROM users; -- 样例库无手机号，强调原则""",
                                "分析域不可见明文敏感列。",
                                "1. 合规  2. 出域共享  3. 开发环境",
                                "| 错法 | 纠正 |\n|---|---|\n| 日志打印明文 | 打码 |\n| 可逆加密当脱敏 | 密钥即泄露 |",
                                "列出本样例中若新增身份证号应落在哪一层脱敏。",
                            ),
                            "children": [],
                        },
                    ],
                },
            ],
        },
        {
            "id": "etl-load",
            "title": "装载 Load",
            "level": "??",
            "content": "### 装载\n\n覆盖、MERGE、幂等。",
            "children": [
                {
                    "id": "etl-load-patterns",
                    "title": "写入模式",
                    "level": "??",
                    "content": "### 写入模式 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-overwrite",
                            "title": "分区覆盖",
                            "level": "??",
                            "content": gold(
                                "同一天任务重跑，不能越跑行越多。",
                                "用分区 OVERWRITE 保证日批幂等。",
                                "转换 → 下一课：MERGE",
                                "dt='2024-01-07' 的支付明细。",
                                "- **覆盖**：替换某分区全部内容。\n- **幂等**：同一 dt 多次跑结果相同。",
                                """-- 示意
INSERT OVERWRITE TABLE dwd_trade_pay_di PARTITION (dt='2024-01-07')
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at
FROM orders
WHERE status='paid'
  AND created_at >= '2024-01-07'
  AND created_at <  '2024-01-08';""",
                                "该分区仅含窗口内支付单；重跑不追加。",
                                "1. 日事实表  2. 回填单日",
                                "| 错法 | 纠正 |\n|---|---|\n| INSERT INTO 无分区 | 重复 | OVERWRITE/MERGE |\n| 覆盖错分区 | 丢历史 | 严格 dt 参数 |",
                                "回填 01-02 时，作业参数应如何传？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-merge-upsert",
                            "title": "MERGE/Upsert",
                            "level": "???",
                            "content": gold(
                                "订单状态会变，目标表要按主键更新或插入。",
                                "理解 MERGE 匹配更新/未匹配插入。",
                                "分区覆盖 → 下一课：幂等写入",
                                "orders 主键 order_id。",
                                "- **Upsert**：有则更新，无则插入。\n- **方言**：MERGE INTO / ON DUPLICATE / ON CONFLICT。",
                                """-- SQL 标准示意
-- MERGE INTO dwd_orders t
-- USING staging_orders s ON t.order_id=s.order_id
-- WHEN MATCHED THEN UPDATE SET status=s.status, amount=s.amount
-- WHEN NOT MATCHED THEN INSERT (...);

-- MySQL 教程库近似
INSERT INTO orders (order_id,user_id,amount,status,created_at)
VALUES (104,2,50.00,'paid','2024-01-01 12:00:00')
ON DUPLICATE KEY UPDATE status=VALUES(status), amount=VALUES(amount);""",
                                "104 若存在则状态更新为 paid。",
                                "1. 变更维/快照表  2. CDC 落地",
                                "| 错法 | 纠正 |\n|---|---|\n| 无唯一键 MERGE | 语义乱 | 先建主键 |\n| 更新列写漏 | 静默旧值 | 明确 SET 列表 |",
                                "对比：日分区事实为何更常用 OVERWRITE 而不是 MERGE？",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-idempotent-write",
                            "title": "幂等写入",
                            "level": "???",
                            "content": gold(
                                "任务成功但 ack 丢了，调度重跑一次。",
                                "设计「同一输入多次执行结果不变」。",
                                "MERGE → 下一课：行数波动",
                                "分区覆盖 / 去重装载。",
                                "- **幂等**：重试安全。\n- **手段**：覆盖分区、目标先删后插、幂等键去重。",
                                """-- 模式 A：覆盖分区（见上）
-- 模式 B：写入前删除窗口
-- DELETE FROM dwd_trade_pay_di WHERE dt='2024-01-07';
-- INSERT INTO ... SELECT ...;""",
                                "重跑后 COUNT 不变。",
                                "1. 自动重试  2. 回填  3. Exactly-once 近似",
                                "| 错法 | 纠正 |\n|---|---|\n| 纯追加 | 重复 | 覆盖/去重 |\n| 依赖「刚好跑一次」 | 必炸 | 幂等设计 |",
                                "事件装载如何用 (order_id,event_type) 做幂等？",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "etl-quality",
            "title": "质量门禁",
            "level": "??",
            "content": "### 质量门禁\n\n装载后、消费前。",
            "children": [
                {
                    "id": "etl-checks",
                    "title": "校验清单",
                    "level": "??",
                    "content": "### 校验清单 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-rowcount",
                            "title": "行数与波动",
                            "level": "?",
                            "content": gold(
                                "今日分区行数骤降 80%，可能抽空了。",
                                "做行数阈值/环比检查并告警。",
                                "幂等 → 下一课：主键唯一",
                                "按日计数思维。",
                                "- **波动检测**：相对昨日/上周。\n- **动作**：超阈阻断下游。",
                                """SELECT DATE(created_at) dt, COUNT(*) cnt
FROM orders GROUP BY 1 ORDER BY 1;
-- 规则示意：|cnt_today/cnt_yday - 1| > 0.5 → fail""",
                                "样例各日行数可见；规则在生产配阈值。",
                                "1. 晨检  2. 门禁",
                                "| 错法 | 纠正 |\n|---|---|\n| 大促当异常 | 动态基线 |\n| 只告警不阻断 | 脏数下流 |",
                                "为 paid 金额 SUM 也设一个波动规则。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-unique-pk",
                            "title": "主键唯一",
                            "level": "?",
                            "content": gold(
                                "事实表出现重复 order_id，指标翻倍。",
                                "装载后断言主键唯一。",
                                "行数波动 → 下一课：源仓对账",
                                "orders.order_id。",
                                "- **唯一性**：主键 COUNT=COUNT DISTINCT。",
                                """SELECT order_id, COUNT(*) c
FROM orders
GROUP BY order_id
HAVING COUNT(*) > 1;
-- 期望空""",
                                "样例无重复主键。",
                                "1. dbt unique 测试  2. DQ 平台",
                                "| 错法 | 纠正 |\n|---|---|\n| 复合键漏测 | 整键测试 |\n| 去重掩盖根因 | 先修抽取 |",
                                "为 order_items 写复合主键唯一测试。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-recon",
                            "title": "源仓对账",
                            "level": "??",
                            "content": gold(
                                "财务说 GMV 少了，要证明抽转装没错。",
                                "源与目标金额/笔数闭合。",
                                "主键唯一 → 下一课：DAG",
                                "源 orders vs 目标汇总。",
                                "- **对账**：同源指标在两端一致（允许已知差异清单）。",
                                """SELECT 'source' AS side, SUM(COALESCE(amount,0)) gmv, COUNT(*) cnt
FROM orders WHERE status='paid'
UNION ALL
SELECT 'target', SUM(gmv), SUM(pay_cnt) FROM (
  SELECT user_id, SUM(COALESCE(amount,0)) gmv, COUNT(*) pay_cnt
  FROM orders WHERE status='paid' GROUP BY user_id
) t;""",
                                "两侧 gmv/cnt 一致。",
                                "1. 上线验收  2. 事故定位  3. 对数仓对账课",
                                "| 错法 | 纠正 |\n|---|---|\n| 只对行数不对金额 | 双对 |\n| 时区窗口不一致 | 统一窗口 |",
                                "列出 3 条「允许的差异」例（如时区、剔除测试单）。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "etl-schedule",
            "title": "调度与运维",
            "level": "???",
            "content": "### 调度与运维\n\nDAG、重试、回填。",
            "children": [
                {
                    "id": "etl-orchestrate",
                    "title": "编排基础",
                    "level": "???",
                    "content": "### 编排基础 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-dag",
                            "title": "DAG 依赖",
                            "level": "??",
                            "content": gold(
                                "转换跑在抽取完成前，读到半成品。",
                                "用 DAG 表达依赖：抽→转→装→测。",
                                "对账 → 下一课：重试告警",
                                "订单日批链路。",
                                "- **DAG**：有向无环依赖图。\n- **边**：上游成功才下游。",
                                """# Airflow 示意
# extract_orders >> transform_dwd >> dq_tests >> publish_ads
# extract_users  >> transform_dwd
print('extract_orders, extract_users -> transform_dwd -> dq -> ads')""",
                                "用户与订单都到齐才转换。",
                                "1. Airflow/Dagster  2. 仓内作业依赖",
                                "| 错法 | 纠正 |\n|---|---|\n| 全靠时间碰运气 | 显式依赖 |\n| 环依赖 | 拆层 |",
                                "画：CDC 流与日批对账如何汇合。",
                                "python",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-retry-alert",
                            "title": "重试与告警",
                            "level": "??",
                            "content": gold(
                                "源库抖动导致任务偶发失败。",
                                "配置有限重试 + 失败告警；依赖幂等。",
                                "DAG → 下一课：回填",
                                "任意抽数任务。",
                                "- **重试**：暂时性错误可恢复。\n- **告警**：永久性失败人工介入。",
                                """# retries=2, retry_delay=5min
# on_failure_callback → 飞书/电话
# 前提：写入幂等
print('retry only if idempotent')""",
                                "瞬时失败自动恢复；连续失败叫人。",
                                "1. 夜间批  2. API 限流",
                                "| 错法 | 纠正 |\n|---|---|\n| 非幂等狂重试 | 重复数据 |\n| 告警无路由 | 无人理 |",
                                "哪些错误不该重试？举 2 例。",
                                "python",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-backfill",
                            "title": "回填 Backfill",
                            "level": "???",
                            "content": gold(
                                "口径改了，要重刷过去 30 天分区。",
                                "按 dt 回填；控制并发；冻结水位策略。",
                                "重试 → 下一课：ETL vs ELT",
                                "历史 dt 列表。",
                                "- **回填**：对历史分区重跑。\n- **风险**：与增量并发、打满源/仓。",
                                """-- 对每个 ds in 历史:
-- INSERT OVERWRITE ... PARTITION(dt=ds) SELECT ... WHERE dt窗口=ds;
print('backfill day by day; overwrite per dt')""",
                                "各历史 dt 结果与新口径一致。",
                                "1. 口径变更  2. 修数  3. 补数",
                                "| 错法 | 纠正 |\n|---|---|\n| 巨型并发回填 | 打崩 |\n| 回填改水位乱序 | 锁窗口 |",
                                "回填时增量任务应暂停还是跳过冲突 dt？给方案。",
                                "python",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-late-data",
                            "title": "迟到数据",
                            "level": "???",
                            "content": gold(
                                "订单 1 号创建，3 号才进库，日批已关窗。",
                                "设计补数窗口与重述（restate）策略。",
                                "回填 → 高级/ELT",
                                "水位与业务时间不一致。",
                                "- **迟到**：事件时间晚于处理时间。\n- **策略**：延长 lookback、定期重述近 N 天、流上允许乱序水印。",
                                """-- 每日增量额外 lookback 2 天
SELECT * FROM orders
WHERE created_at >= :batch_end - INTERVAL 2 DAY
  AND created_at <  :batch_end;
-- 目标仍按 dt 覆盖，吸收迟到""",
                                "迟到单在后续日被覆盖进正确业务日或修订日（按口径定）。",
                                "1. 跨时区  2. 源延迟  3. 流批一体",
                                "| 错法 | 纠正 |\n|---|---|\n| lookback=0 | 永久漏 |\n| 无限 lookback | 成本爆 |",
                                "为支付 GMV 选 lookback=1 还是 3？说明业务理由。",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "etl-elt",
            "title": "ETL vs ELT",
            "level": "??",
            "content": "### ETL vs ELT\n\n算力与合规决定形态。",
            "children": [
                {
                    "id": "etl-vs-elt",
                    "title": "形态对比",
                    "level": "??",
                    "content": "### 形态对比 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-classic",
                            "title": "经典 ETL",
                            "level": "??",
                            "content": gold(
                                "源端不能出明文，必须先脱敏再入仓。",
                                "理解源外/中间层先变换再加载。",
                                "调度 → 下一课：现代 ELT",
                                "合规约束场景。",
                                "- **ETL**：Extract → Transform → Load。\n- **适合**：强脱敏、目标仓弱、传统数仓工具链。",
                                """-- 中间层清洗后再装
-- staging_clean = transform(extract(source))
-- load(warehouse, staging_clean)
SELECT order_id, user_id, COALESCE(amount,0) amount, status
FROM orders WHERE status='paid';""",
                                "入仓已是干净可消费结构。",
                                "1. 合规前置  2. DataX 清洗  3. 老数仓",
                                "| 错法 | 纠正 |\n|---|---|\n| 变换逻辑散落脚本 | 难测 | 版本化 |\n| 与 ELT 对立宗教化 | 按约束选 |",
                                "举一个必须 ETL 不能 ELT 的合规例子。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-modern-elt",
                            "title": "现代 ELT",
                            "level": "??",
                            "content": gold(
                                "云仓算力强，分析师要用 SQL 迭代模型。",
                                "先近原始落地，再用 dbt/SQL 变换。",
                                "经典 ETL → 下一课：工具选型",
                                "ODS 贴源 + dbt staging/mart。",
                                "- **ELT**：Extract → Load → Transform（仓内）。\n- **适合**：Snowflake/BQ/Doris 等；dbt 测试文档。",
                                """-- Load 近原始后
-- dbt: staging → intermediate → mart
SELECT user_id, SUM(COALESCE(amount,0)) gmv
FROM orders WHERE status='paid'
GROUP BY user_id;""",
                                "变换在仓内完成；版本与测试可放在 git。",
                                "1. 云仓  2. 分析师自助  3. 快速迭代",
                                "| 错法 | 纠正 |\n|---|---|\n| 原始层无治理 | 湖变沼泽 | 分层+DQ |\n| 忽略成本 | 扫爆 | 分区/物化 |",
                                "本教程样例用 ELT 时，ODS 与 DWD 分别谁写？",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
        {
            "id": "etl-tools",
            "title": "工具选型",
            "level": "???",
            "content": "### 工具选型\n\n编排、变换、抽取各司其职。",
            "children": [
                {
                    "id": "etl-tool-map",
                    "title": "选型地图",
                    "level": "???",
                    "content": "### 选型地图 · 章节导读",
                    "lessonParent": True,
                    "children": [
                        {
                            "id": "etl-tool-airflow",
                            "title": "编排 Airflow",
                            "level": "???",
                            "content": gold(
                                "要用依赖、重试、回填管住日批。",
                                "知道 Airflow 管调度不是变换引擎。",
                                "ELT → 下一课：dbt",
                                "DAG：抽→转→测。",
                                "- **定位**：编排与运维。\n- **不负责**：替代 SQL 引擎。",
                                """# from airflow import DAG
# with DAG('etl_orders', schedule='@daily') as dag:
#     extract >> transform >> dq
print('Airflow = orchestrate')""",
                                "按时触发且依赖正确。",
                                "1. 批调度  2. 回填  3. SLA 传感器",
                                "| 错法 | 纠正 |\n|---|---|\n| 在 Operator 里写巨逻辑 | 下沉脚本/dbt |\n| 不管幂等 | 重试翻倍 |",
                                "Airflow 与仓内定时哪个做「抽数」更合适？",
                                "python",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-tool-dbt",
                            "title": "变换 dbt",
                            "level": "???",
                            "content": gold(
                                "希望 SQL 模型有测试、文档与血缘。",
                                "理解 dbt：仓内 ELT 变换框架。",
                                "Airflow → 下一课：CDC 工具",
                                "staging/mart 模型。",
                                "- **定位**：Transform as Code。\n- **能力**：ref、test、docs、建血缘。",
                                """-- models/marts/fct_pay.sql 示意
SELECT order_id, user_id, COALESCE(amount,0) AS pay_amt, created_at
FROM {{ ref('stg_orders') }}
WHERE status = 'paid';
-- schema.yml: unique order_id / not_null user_id""",
                                "模型可编译运行；测试失败阻断。",
                                "1. ELT 主力  2. 指标下沉  3. 协作",
                                "| 错法 | 纠正 |\n|---|---|\n| 当抽取工具 | 配 Airbyte/CDC |\n| 无测试 | 补 unique/not_null |",
                                "为 gmv mart 写两条 dbt test 点子。",
                            ),
                            "children": [],
                        },
                        {
                            "id": "etl-tool-ingest",
                            "title": "同步与 CDC 工具",
                            "level": "???",
                            "content": gold(
                                "要把 MySQL 同步到仓/湖，可选 DataX / Airbyte / Debezium。",
                                "按批/流与运维成本选型。",
                                "dbt → 练习场",
                                "orders 源。",
                                "| 类型 | 例子 | 适合 |\n|---|---|---|\n| 批同步 | DataX / 仓库 COPY | 文件/大表窗口 |\n| 标准连接器 | Airbyte / Fivetran | SaaS/快速接入 |\n| 日志 CDC | Debezium / Flink CDC | 近实时 |",
                                """-- 批：增量 SQL 抽（DataX reader 亦可）
SELECT * FROM orders WHERE created_at >= :wm;
-- 流：CDC 订阅 binlog（工具侧配置）""",
                                "选对工具后仍要分层与 DQ。",
                                "1. 接入加速  2. 实时  3. 异构源",
                                "| 错法 | 纠正 |\n|---|---|\n| 只买工具不建模 | 湖沼泽 |\n| CDC 直写 ADS | 跳层 |",
                                "本样例「订单状态近实时」优先哪类工具？",
                            ),
                            "children": [],
                        },
                    ],
                }
            ],
        },
    ],
}


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


for m in ["const PYTHON_KNOWLEDGE_TREE", "const DWH_KNOWLEDGE_TREE", "const BI_KNOWLEDGE_TREE"]:
    if m not in text:
        raise SystemExit("precheck " + m)

s, e, old = extract_object(text, "const ETL_KNOWLEDGE_TREE = ")
print("old leaves", len(walk_leaves(old)))
text = text[:s] + json.dumps(TREE, ensure_ascii=False, indent=2) + text[e:]
print("new leaves", len(walk_leaves(TREE)))

text, n = re.subn(
    r"const prefer = hub === \"sql\" \? \"sql-constitution\"[\s\S]*?null;",
    """const prefer = hub === "sql" ? "sql-constitution"
              : hub === "python" ? "py-constitution"
              : hub === "database" ? "db-constitution"
              : hub === "dwh" ? "dwh-constitution"
              : hub === "etl" ? "etl-constitution" : null;""",
    text,
    count=1,
)
print("prefer", n)

# sectors
zone = text[text.find("KG_SECTOR_BY_ID") : text.find("KG_SECTOR_BY_ID") + 3000]
if "etl-constitution" not in zone:
    text = text.replace(
        '"etl-batch": "foundation", "etl-quality": "practice",',
        '"etl-batch": "foundation", "etl-quality": "practice", '
        '"etl-learning-path": "practice", "etl-source-contract": "foundation", '
        '"etl-extract": "foundation", "etl-transform": "advanced", "etl-load": "advanced", '
        '"etl-schedule": "practice", "etl-constitution": "practice", "etl-cdc": "practice",',
        1,
    )
    # fallback if old keys absent
    if "etl-constitution" not in text[text.find("KG_SECTOR_BY_ID") : text.find("KG_SECTOR_BY_ID") + 3000]:
        text = text.replace(
            "const KG_SECTOR_BY_ID = {",
            "const KG_SECTOR_BY_ID = {\n"
            '      "etl-learning-path": "practice", "etl-constitution": "practice", '
            '"etl-extract": "foundation", "etl-transform": "advanced", "etl-cdc": "practice",',
            1,
        )
    print("OK sectors")

sample = {
    "tables": ["users", "orders", "order_events", "order_items"],
    "sharedWith": "SQL_SAMPLE",
    "constitutionId": "etl-constitution",
    "hubId": "etl",
    "pipeline": ["source", "extract", "transform", "load", "quality", "schedule"],
}
if "const ETL_SAMPLE" in text:
    s0, s1, _ = extract_object(text, "const ETL_SAMPLE = ")
    text = text[:s0] + json.dumps(sample, ensure_ascii=False, indent=2) + text[s1:]
else:
    insert_at = "const DWH_SAMPLE = " if "const DWH_SAMPLE" in text else "const SQL_SAMPLE = "
    text = text.replace(
        insert_at,
        "const ETL_SAMPLE = " + json.dumps(sample, ensure_ascii=False, indent=2) + ";\n\n    " + insert_at,
        1,
    )
print("OK ETL_SAMPLE")

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

_, _, tree = extract_object(t2, "const ETL_KNOWLEDGE_TREE = ")
for eid in [
    "etl-constitution",
    "etl-incr",
    "etl-cdc",
    "etl-scd",
    "etl-overwrite",
    "etl-recon",
    "etl-modern-elt",
    "etl-tool-dbt",
    "etl-late-data",
]:
    assert find_node(tree, eid), eid
assert "易错对照" in find_node(tree, "etl-incr")["content"]
# dwh still has snowflake
_, _, dwh = extract_object(t2, "const DWH_KNOWLEDGE_TREE = ")
assert find_node(dwh, "dwh-snowflake")
print("VALIDATED", len(walk_leaves(tree)), "etl leaves; size", p.stat().st_size)
