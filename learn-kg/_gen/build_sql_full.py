# -*- coding: utf-8 -*-
"""把 SQL 域补全到与其他 6 个域同等水位。

补齐三件事：
  1) 结构：新增「学习路径」（教程宪法 / 路线清单 / 练习场）
  2) 主题：新增「函数与表达式」「数据操作」，并把 3 个单叶章节拆为子课
  3) 内容：所有叶子统一升到金标准课模板（课前/样例输入/是什么/怎么写/结果/用在哪/易错对照/教义深讲/动手/导航）
"""
import json, os, re

ROOT = r'D:\cursor\数据学习平台'
MASTER = os.path.join(ROOT, '_gen', 'lessons', 'sql.json')
BT = "```"
SAMPLE_NOTE = "> 同源四表：`users` / `orders` / `order_items` / `order_events`（与 SQL/ETL/DWH 一致）。"

LEVELS = {'?': '入门', '??': '进阶', '???': '高阶'}


def leaf_md(title, level, scene, goal, prereq, sample, what, steps, code,
            result, uses, upstream, errors, deep, drill, parent, prev, nxt):
    """生成金标准课模板叶子内容（Markdown）。"""
    stp = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(steps))
    err = "\n".join("| %s |" % " | ".join(x.strip() for x in e.split("|")) for e in errors)
    use = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(uses))
    return (
        "### 课前\n\n"
        "- **场景**：%s\n"
        "- **目标**：%s\n"
        "- **先修**：%s\n"
        "- **难度**：%s\n"
        "- **学完标准**：能复述定义、独立写出等价实现、指出至少两个翻车点。\n\n"
        "### 样例输入\n\n%s\n\n%s\n\n"
        "### 是什么\n\n%s\n\n"
        "### 怎么写\n\n**建议步骤**\n\n%s\n\n```sql\n%s\n```\n\n"
        "### 查询结果\n\n%s\n\n"
        "### 用在哪\n\n%s\n\n**上下游**：%s\n\n"
        "### 易错对照\n\n| 错法 | 现象 | 纠正 |\n|---|---|---|\n%s\n\n"
        "### 教义深讲\n\n%s\n\n"
        "### 动手\n\n%s\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：%s\n- 下一节：%s\n"
        % (scene, goal, prereq, LEVELS.get(level, level), sample, SAMPLE_NOTE,
           what, stp, code, result, use, upstream, err, deep, drill,
           parent, prev, nxt)
    )


def chapter(title, scene, why, rows, order, parent, nxt):
    """生成章节导读（非叶子）内容。"""
    tbl = "\n".join("| %d | %s | %s | %s |" % (i + 1, r[0], LEVELS.get(r[2], r[2]), r[1])
                    for i, r in enumerate(rows))
    return (
        "### 课前 · 章节导读\n\n"
        "- **场景**：%s\n"
        "- **章节**：%s\n"
        "- **为什么学**：%s\n"
        "- **学完能做什么**：按顺序完成下面每一节的「动手」，并能讲清本节边界。\n"
        "- **纪律**：使用全平台统一样例（订单 / 用户 / Superstore），不要每节换一套数据。\n\n"
        "### 本节地图\n\n| # | 节点 | 难度 | 一句话 |\n|---|---|---|---|\n%s\n\n"
        "### 推荐顺序\n\n```text\n%s\n```\n\n"
        "### 怎么学\n\n"
        "1. 先看地图，知道有哪些节点。\n"
        "2. 按顺序打开，每节做完「动手」再往下。\n"
        "3. 用自己的表名替换样例，做一次小样本迁移。\n\n"
        "### 验收\n\n| 检查 | 标准 |\n|---|---|\n"
        "| 主路径 | 每节示例能重做 |\n"
        "| 易错 | 至少能举出 2 个反例 |\n"
        "| 口述 | 不看笔记讲清「%s」解决什么 |\n\n"
        "### 下一动\n\n从第 1 个节点开始。本章共 **%d** 个直接下级。\n\n"
        "### 导航\n\n- 上级：`%s`\n- 下一节：%s\n"
        % (scene, title, why, tbl, order, title, len(rows), parent, nxt)
    )


def node(nid, title, level, content, lesson_parent=False):
    n = {'id': nid, 'title': title, 'level': level,
         'content': content, 'children': []}
    if lesson_parent:
        n['lessonParent'] = True
    return n


# 标题 -> 稳定 id（leaf() 据此产出节点）
TITLE2ID = {
    '统一样例与课模板': 'SQL.学习路径.教程宪法.统一样例与课模板',
    '初级清单': 'SQL.学习路径.路线清单.初级清单',
    '中级清单': 'SQL.学习路径.路线清单.中级清单',
    '高级清单': 'SQL.学习路径.路线清单.高级清单',
    '初级练习': 'SQL.学习路径.练习场.初级练习',
    '中级练习': 'SQL.学习路径.练习场.中级练习',
    '高级练习': 'SQL.学习路径.练习场.高级练习',
    'CASE WHEN 条件逻辑': 'SQL.函数与表达式.CASE WHEN 条件逻辑',
    '字符串与日期函数': 'SQL.函数与表达式.字符串与日期函数',
    'NULL 语义与 COALESCE': 'SQL.函数与表达式.NULL 语义与 COALESCE',
    '类型与精度': 'SQL.数据定义.类型与精度',
    '建表与约束': 'SQL.数据定义.建表与约束',
    '视图与 CTE': 'SQL.数据定义.视图与 CTE',
    'INSERT 与批量写入': 'SQL.数据操作.INSERT 与批量写入',
    'UPDATE 与 DELETE 安全': 'SQL.数据操作.UPDATE 与 DELETE 安全',
    'UPSERT 与幂等': 'SQL.数据操作.UPSERT 与幂等',
    '执行计划入门': 'SQL.性能优化.执行计划入门',
    '索引怎么用上': 'SQL.性能优化.索引怎么用上',
    '慢查询定位与改写': 'SQL.性能优化.慢查询定位与改写',
    '事务与隔离级别': 'SQL.事务与安全.事务与隔离级别',
    '锁与并发': 'SQL.事务与安全.锁与并发',
    '权限与注入防护': 'SQL.事务与安全.权限与注入防护',
}


def leaf(title, level, *a, **kw):
    """按标题查表得到 id，返回可直接挂树的节点。"""
    if title not in TITLE2ID:
        raise KeyError('未登记标题: %s' % title)
    return node(TITLE2ID[title], title, level, leaf_md(title, level, *a, **kw))


# =====================================================================
# 学习路径：教程宪法 / 路线清单 / 练习场
# =====================================================================

def path_constitution():
    c = ("### 课前 · 这是什么\n\n"
         "本页是 **SQL 教程公约**：全平台的查询课共用同一业务域，与 Python / ETL / DWH / 数据库 "
         "**同源样例**（`users` / `orders` / `order_items` / `order_events`）。先读本页，再按学习路径推进；"
         "金课里的验收数字以本页为准。\n\n"
         "### 统一业务域\n\n"
         "| 表 | 一行代表 | 关键列 | 口径要点 |\n|---|---|---|---|\n"
         "| `users` | 一个用户 | `user_id`, `city` | 城市可能为 NULL |\n"
         "| `orders` | 一笔订单 | `order_id`, `user_id`, `amount`, `status`, `created_at` | 金额可能为 NULL |\n"
         "| `order_items` | 订单里一个 SKU | `order_id`, `sku`, `qty`, `price` | 与订单头一对多 |\n"
         "| `order_events` | 一次状态变更 | `order_id`, `event_type`, `event_time` | 同键可能多条 |\n\n"
         "**验收种子**：`users=4`，`orders=8`，`order_events=7`，`order_items=5`。  \n"
         "**支付口径**：`status='paid'` + `SUM(COALESCE(amount,0))`；Ada 的支付 GMV = **350**。\n\n"
         "### 三条铁律\n\n"
         "1. **先定粒度再写 SQL**：一行代表什么业务事件，写不清就先别写 `GROUP BY`。  \n"
         "2. **口径写在注释里**：金额含不含税、状态算不算退款，必须在 SQL 注释中声明。  \n"
         "3. **NULL 永远要显式处理**：`COALESCE` / `IS NULL`，不要让聚合静默丢行。\n\n"
         "### 金标准课模板\n\n"
         "课前 → 样例输入 → 是什么 → 怎么写 → 查询结果 → 用在哪 → 易错对照 → 教义深讲 → 动手。\n\n"
         "### 学习主线\n\n"
         "```text\n"
         "宪法 → 路线清单 → 初级练习\n"
         "→ SELECT/WHERE/ORDER BY/LIMIT\n"
         "→ JOIN/子查询/UNION\n"
         "→ GROUP BY/HAVING/窗口函数\n"
         "→ 函数与表达式 → 数据定义 → 数据操作\n"
         "→ 性能优化 → 事务与安全 → 中级/高级练习\n"
         "```\n")
    return node('SQL.学习路径.教程宪法.统一样例与课模板', '统一样例与课模板', '?', c)


def build_learning_path():
    cons = path_constitution()
    cons_sec = node('SQL.学习路径.教程宪法', '教程宪法', '?',
                    chapter('教程宪法',
                            '各域教程口径不一，指标对不上。',
                            '先把样例与模板钉死，后面每一课都复用同一份数据。',
                            [('统一样例与课模板', '本页是 SQL 教程公约：四表同源、口径一致。', '?')],
                            '统一样例与课模板',
                            '学习路径', '路线清单'),
                    lesson_parent=True)
    cons_sec['children'] = [cons]

    roadmap = node('SQL.学习路径.路线清单', '路线清单', '?',
                   chapter('路线清单',
                           '不知道先学哪一课、学到什么程度算过关。',
                           '用初/中/高三张清单把「会写」翻译成可验收的动作。',
                           [('初级清单', '会读会写四类基础查询。', '?'),
                            ('中级清单', '会多表、会聚合、会控 NULL。', '??'),
                            ('高级清单', '看得懂计划、写得出安全更新。', '???')],
                           '初级清单 → 中级清单 → 高级清单',
                           '学习路径', '练习场'),
                   lesson_parent=True)

    roadmap['children'] = [list_junior(), list_mid(), list_senior()]

    pf = node('SQL.学习路径.练习场', '练习场', '??',
              chapter('练习场',
                      '看完课不动手，进了项目仍然写不出来。',
                      '用三组递进练习把「读懂」变成「写对」。',
                      [('初级练习', '单表投影/过滤/排序/分页。', '?'),
                       ('中级练习', '多表 + 聚合 + NULL 治理。', '??'),
                       ('高级练习', '计划阅读 + 安全更新。', '???')],
                      '初级练习 → 中级练习 → 高级练习',
                      '学习路径', '基础查询'),
              lesson_parent=True)
    pf['children'] = [drill_junior(), drill_mid(), drill_senior()]
    return [cons_sec, roadmap, pf]


# ---------- 路线清单三张 ----------

def list_junior():
    return leaf('初级清单', '?',
        '刚接手报表，只会 `SELECT *`，不敢改线上 SQL。',
        '列清入门必会的四组能力，并能独立写出通过验收的查询。',
        '建议先读「统一样例与课模板」',
        '用统一样例四表；验收数字见宪法页。',
        '初级清单回答「会写查询」这一层：投影、过滤、排序、取数。它不含多表和聚合。',
        ['投影：显式列名 + 业务别名（`amount AS gmv`）',
         '过滤：`WHERE` 组合条件，NULL 用 `IS NULL`',
         '排序：`ORDER BY` 稳定排序键，配 `LIMIT` 取 TopN',
         '取数：分页用 `LIMIT/OFFSET`，深分页改键集分页'],
        "-- 初级自测：已支付订单号、用户、金额，按金额倒序取前 5\n"
        "SELECT o.order_id, o.user_id, o.amount AS gmv\n"
        "FROM orders AS o\n"
        "WHERE o.status = 'paid'\n"
        "ORDER BY o.amount DESC\n"
        "LIMIT 5;",
        '`orders` 共 8 行；`paid` 命中的行按金额倒序，前 5 行即答案。',
        ['日报取数：只要订单号与金额',
         '临时排查：按状态 / 时间窗筛选',
         '接口分页：稳定排序 + 游标'],
        '上游是「基础查询」四节课；下游是「多表操作」，别提前 JOIN。',
        ['未排序就 LIMIT|前 N 行不确定|先 ORDER BY 再 LIMIT',
         '`amount = NULL`|永远不命中|写成 `IS NULL`',
         '`SELECT *` 进报表|上游加列撑爆下游|显式列名'],
        '入门阶段只做 **单表投影与过滤**。多表、聚合、窗口一律先放下——'
        '一次只引入一个新的自由度，出错的时侯才定位得出来。',
        '不看笔记写出上面那条查询，并指出如果不加 `ORDER BY` 会有什么风险。',
        '学习路径', '（本节起）', '中级清单')


def list_mid():
    return leaf('中级清单', '??',
        '报表要按用户、按状态出指标，单表已经不够用。',
        '掌握多表关联、聚合与 NULL 治理，能独立交付一张指标表。',
        '完成初级清单全部动手',
        '`order_items` 与订单头一对多，是本课的主角。',
        '中级清单回答「会算指标」：把明细折叠成业务看的数字，同时不被粒度陷阱咬到。',
        ['关联：先确认两表粒度与关联键，验证 INNER 命中行数',
         '保留未匹配：用 `LEFT JOIN`，且保留侧的过滤条件写在 `ON`',
         '防爆炸：一对多先按主键聚合，再与表头关联',
         '聚合：`GROUP BY` 与 `SELECT` 非聚合列严格对齐',
         '聚合后过滤：明细条件放 `WHERE`，聚合条件放 `HAVING`',
         'NULL 治理：金额用 `COALESCE(amount,0)` 求和'],
        "-- 中级自测：每个用户的支付订单数与 GMV，保留无订单用户\n"
        "SELECT u.user_id,\n"
        "       COUNT(o.order_id) AS pay_cnt,\n"
        "       SUM(COALESCE(o.amount, 0)) AS gmv\n"
        "FROM users AS u\n"
        "LEFT JOIN orders AS o\n"
        "  ON o.user_id = u.user_id\n"
        " AND o.status = 'paid'\n"
        "GROUP BY u.user_id;",
        '无订单用户 `pay_cnt=0`、`gmv=0`；Ada 的 `gmv=350`，与其支付订单金额之和一致。',
        ['用户级指标表', '品类 / 状态维度汇总', '漏斗各环节计数'],
        '上游是「多表操作」与「聚合分析」；下游是「窗口函数」和「数据操作」。',
        ['先 JOIN 明细再 SUM 金额|表头金额被放大|先聚合明细再加表头',
         '过滤写进 WHERE|`LEFT` 退化成 `INNER`|保留侧条件放 `ON`',
         '`COUNT(amount)` 当订单数|漏掉 NULL 金额的行|订单数用 `COUNT(*)`'],
        '中级的分水岭是 **粒度**。写任何 `SUM` 之前先问：当前结果集一行代表什么？'
        '一旦一行不再代表一笔订单，金额类指标就必然翻倍。',
        '把上面的查询改成「按 city 输出 GMV」，并说明城市的 NULL 被算进了哪一组。',
        '学习路径', '初级清单', '高级清单')


def list_senior():
    return leaf('高级清单', '???',
        '查询能跑但很慢，或者不敢在生产上改数据。',
        '会看执行计划、会用索引、会用事务与权限保护数据。',
        '完成中级清单全部动手',
        '慢查询样例：对大表做函数包裹过滤。',
        '高级清单回答「跑得动又跑得安全」：性能与安全是生产 SQL 的两条生命线。',
        ['读计划：`EXPLAIN` 看扫描方式、预估行数、是否回表',
         '用索引：谓词保持「列裸用」，避免对索引列包函数',
         '定位慢查询：先量级（扫了多少行）再看算子（排序 / 哈希）',
         '安全更新：`UPDATE / DELETE` 先 `SELECT` 验证，再包事务',
         '事务与隔离：知道脏读 / 不可重复读 / 幻读分别由什么隔离级别挡住',
         '权限最小化：只给需要的库表只读，参数化防注入'],
        "-- 高级自测：先验证影响面，再更新（务必包事务）\n"
        "SELECT COUNT(*) FROM orders\n"
        "WHERE status = 'pending' AND created_at < '2024-01-01';\n\n"
        "-- 确认行数无误后\n"
        "BEGIN;\n"
        "UPDATE orders SET status = 'expired'\n"
        "WHERE status = 'pending' AND created_at < '2024-01-01';\n"
        "-- 核对后再 COMMIT，否则 ROLLBACK\n"
        "COMMIT;",
        '先跑 `SELECT COUNT(*)` 得到待改行数，`UPDATE` 的受影响行数必须与之一致。',
        ['慢查询优化', '历史数据订正', '权限与合规审计'],
        '上游是「性能优化」与「事务与安全」两章；下游是实战与面试深挖。',
        ['直接在生产跑 UPDATE|误伤全表|先 SELECT 验证 + 事务包裹',
         '对索引列包函数|索引失效全表扫|改写为范围比较',
         '用字符串拼 SQL|SQL 注入|参数化绑定'],
        '高级阶段的核心不是写出更花哨的 SQL，而是 **在动手前就知道代价**：'
        '这次扫描多少行、锁了多少行、失败能否回滚。',
        '对一个你手边的表，先用 `EXPLAIN` 读一遍计划，写出「扫描方式 + 预估行数」两行结论。',
        '学习路径', '中级清单', '（本节完）')


# ---------- 练习场三组 ----------

def drill_junior():
    return leaf('初级练习', '?',
        '需要用一组小练习把基础查询练成手感。',
        '独立完成 5 道单表题，全部对照样例数字自查。',
        '「基础查询」四节课',
        '统一样例四表；种子行数见宪法页。',
        '初级练习只考单表：投影、过滤、排序、去重、分页。每题都给出自查口径。',
        ['投影 + 别名：输出订单号、用户、金额（`gmv`）',
         '过滤：`paid` 且金额在 100~500',
         'NULL：找出金额为空的订单',
         '排序 + TopN：金额最高 3 笔',
         '去重：枚举所有出现过的状态'],
        "-- Q1\nSELECT order_id, user_id, amount AS gmv FROM orders;\n\n"
        "-- Q2\nSELECT * FROM orders\nWHERE status = 'paid' AND amount BETWEEN 100 AND 500;\n\n"
        "-- Q3\nSELECT order_id, amount FROM orders WHERE amount IS NULL;\n\n"
        "-- Q4\nSELECT order_id, amount FROM orders\nORDER BY amount DESC NULLS LAST LIMIT 3;\n\n"
        "-- Q5\nSELECT DISTINCT status FROM orders;",
        'Q3 应命中样例中金额为 NULL 的订单；Q4 的 NULL 金额必须排在最后，不能污染 TopN。',
        ['日报取数', '数据质量巡检', '接口分页'],
        '上游是基础查询；下游是中级练习。',
        ['用 `= NULL`|Q3 返回 0 行|改 `IS NULL`',
         '`BETWEEN` 边界写反|区间取空|按小到大写',
         '`DISTINCT` 掩盖重复|看不出脏数据|先查重复根因'],
        '初级练习的重点是把 **NULL** 变成肌肉记忆。绝大多数「查询结果不对」的初级事故，'
        '根因都是某处 `NULL` 没被显式处理。',
        '把 Q4 改成「取每个状态金额最高的一笔」，如果写不出来，说明还没到中级——先回去看窗口函数。',
        '练习场', '（本节起）', '中级练习')


def drill_mid():
    return leaf('中级练习', '??',
        '业务要按用户、按渠道出指标，需要多表与聚合。',
        '独立完成 5 道多表 / 聚合题，且能解释每道题的粒度。',
        '「多表操作」「聚合分析」',
        '`order_items` 与订单头一对多，防爆炸是本组重点。',
        '中级练习考三件事：关联不丢行、聚合不放大、NULL 不静默。',
        ['左连接：保留无订单用户',
         '防爆炸：订单头金额不被明细行数放大',
         '聚合过滤：金额合计 ≥ 阈值的用户',
         '窗口：每用户最近一笔订单',
         '半连接：存在 `paid` 事件的订单'],
        "-- Q1 保留无订单用户\n"
        "SELECT u.user_id, COUNT(o.order_id) AS cnt\n"
        "FROM users u\n"
        "LEFT JOIN orders o ON o.user_id = u.user_id AND o.status = 'paid'\n"
        "GROUP BY u.user_id;\n\n"
        "-- Q2 防爆炸：先聚合明细，再关联订单头\n"
        "SELECT o.order_id, o.amount, i.sku_cnt\n"
        "FROM orders o\n"
        "JOIN (SELECT order_id, COUNT(*) AS sku_cnt\n"
        "      FROM order_items GROUP BY order_id) i\n"
        "  ON i.order_id = o.order_id\n"
        "WHERE o.status = 'paid';\n\n"
        "-- Q3 聚合后过滤\n"
        "SELECT user_id, SUM(COALESCE(amount,0)) AS gmv\n"
        "FROM orders WHERE status = 'paid'\n"
        "GROUP BY user_id\n"
        "HAVING SUM(COALESCE(amount,0)) >= 200;\n\n"
        "-- Q4 每用户最近一笔\n"
        "SELECT * FROM (\n"
        "  SELECT o.*, ROW_NUMBER() OVER (\n"
        "    PARTITION BY user_id ORDER BY created_at DESC) rn\n"
        "  FROM orders o\n"
        ") t WHERE rn = 1;\n\n"
        "-- Q5 半连接\n"
        "SELECT o.* FROM orders o\n"
        "WHERE EXISTS (SELECT 1 FROM order_events e\n"
        "              WHERE e.order_id = o.order_id\n"
        "                AND e.event_type = 'paid');",
        'Q2 中 `o.amount` 与不做聚合前完全一致，说明没有被明细放大；Q3 里 Ada 因 `gmv=350 ≥ 200` 命中。',
        ['用户级指标', '订单明细核对', '行为漏斗'],
        '上游是初级练习；下游是高级练习与「数据操作」。',
        ['`LEFT JOIN` 后 `WHERE o.status`|无订单用户被过滤|条件放 `ON`',
         '`COUNT(*)` 与 `COUNT(o.order_id)` 混用|计数虚高|按「有没有订单」选',
         '窗口与 `GROUP BY` 同层|语法报错|先派生表再开窗'],
        '中级的核心心法是 **先定粒度，再选算子**。Q2 如果直接把 `order_items` 并进 `FROM`，'
        '同一笔订单会出现多行，`SUM(amount)` 立刻翻倍——这就是最经典的指标事故。',
        '给 Q3 加上 `city` 维度（通过 `users`），并回答：城市为 NULL 的用户会被分到哪一组？',
        '练习场', '初级练习', '高级练习')


def drill_senior():
    return leaf('高级练习', '???',
        '要交付生产可用的 SQL，慢一点、错一次都是事故。',
        '能读计划、能定位慢点、能安全地改数据。',
        '「性能优化」「事务与安全」',
        '慢查询样例：大表 + 函数包裹谓词。',
        '高级练习考「代价意识」：说得出扫了多少行、锁了什么、失败怎么退。',
        ['计划阅读：给出 `EXPLAIN` 里扫描方式与预估行数',
         '索引改写：把函数包裹谓词改成范围比较',
         '深分页改写：`OFFSET` 改键集分页',
         '安全更新：`SELECT` 验证 → 事务 → 核对 → 提交',
         '隔离级别：说出三种读异常的挡法'],
        "-- Q1 函数包裹导致索引失效（反例）\n"
        "SELECT * FROM orders WHERE DATE(created_at) = '2024-01-07';\n"
        "-- 改写为范围比较，能用上索引\n"
        "SELECT * FROM orders\n"
        "WHERE created_at >= '2024-01-07'\n"
        "  AND created_at <  '2024-01-08';\n\n"
        "-- Q2 深分页 → 键集分页\n"
        "SELECT order_id, amount FROM orders\n"
        "WHERE order_id > 102 ORDER BY order_id LIMIT 10;\n\n"
        "-- Q3 安全订正\n"
        "BEGIN;\n"
        "SELECT COUNT(*) FROM orders WHERE status = 'pending';\n"
        "UPDATE orders SET status = 'expired' WHERE status = 'pending';\n"
        "COMMIT;  -- 行数不符则 ROLLBACK",
        'Q1 改写后计划从全表扫描变为索引范围扫描；Q3 的 `UPDATE` 行数必须等于前一条 `SELECT COUNT(*)`。',
        ['慢查询治理', '大数据量分页', '生产数据订正'],
        '上游是中级练习；下游是实战项目与面试。',
        ['对索引列包函数|全表扫，慢一个量级|改写成范围比较',
         '大 `OFFSET`|越翻越慢|键集 / 游标分页',
         '无事务直接改|无法回滚|`BEGIN` + 核对 + `COMMIT`'],
        '高级的差别不在语法，而在 **你知道自己在花多少代价**。同一条业务语义的查询，'
        '写法不同可能差两个数量级——这就是为什么要先读计划再动手。',
        '给 Q1 写出改写前后两版，并用一句话说明「为什么原写法用不上索引」。',
        '练习场', '中级练习', '（本节完）')




# =====================================================================
# 新增章节：函数与表达式
# =====================================================================

def build_funcs():
    ch = node('SQL.函数与表达式', '函数与表达式', '??',
              chapter('函数与表达式',
                      '查出来的原始值业务看不懂：状态是英文、NULL 显示为空、时间要对齐到月。',
                      '用表达式把原始列翻译成业务口径，同时守住 NULL 与精度。',
                      [('CASE WHEN 条件逻辑', '把状态 / 分档翻译成业务标签。', '??'),
                       ('字符串与日期函数', '清洗、拼接、按时间粒度汇总。', '??'),
                       ('NULL 语义与 COALESCE', '三值逻辑与聚合静默丢行。', '??')],
                      'CASE WHEN → 字符串与日期 → NULL 语义',
                      '聚合分析', '数据定义'),
              lesson_parent=True)
    ch['children'] = [fn_case(), fn_strdate(), fn_null()]
    return ch


def fn_case():
    return leaf('CASE WHEN 条件逻辑', '??',
        '报表要展示「已支付 / 待支付 / 已取消」，而库里只有英文状态码。',
        '能用 `CASE WHEN` 做标签映射、分档与条件聚合，并说清与 `IF` 的差别。',
        '「基础查询」WHERE 与「聚合分析」GROUP BY',
        '`orders.status` 取值：`paid` / `pending` / `cancelled`，其中可能有 NULL。',
        '`CASE WHEN` 是 SQL 里唯一的条件表达式：它按顺序命中第一个为真的分支，'
        '所以 **顺序即语义**，一旦命中就短路。它既能翻译标签，也能把「行」转成「列」。',
        ['先写 `ELSE` 兜底，避免出现 NULL 标签',
         '分支顺序：把最特殊、最窄的条件放前面',
         '要做分档时用区间判断（`>= 1000`）而不是等值列举',
         '要把类别变列时，把 `CASE` 塞进 `SUM` 做条件聚合'],
        "-- 1) 标签映射：翻译状态，并处理 NULL\n"
        "SELECT order_id,\n"
        "       CASE status\n"
        "         WHEN 'paid'      THEN '已支付'\n"
        "         WHEN 'pending'   THEN '待支付'\n"
        "         WHEN 'cancelled' THEN '已取消'\n"
        "         ELSE '未知'\n"
        "       END AS status_cn\n"
        "FROM orders;\n\n"
        "-- 2) 分档：按金额切段（条件从窄到宽）\n"
        "SELECT order_id, amount,\n"
        "       CASE WHEN amount IS NULL   THEN '空值'\n"
        "            WHEN amount >= 1000   THEN '高'\n"
        "            WHEN amount >= 300    THEN '中'\n"
        "            ELSE '低' END AS tier\n"
        "FROM orders;\n\n"
        "-- 3) 条件聚合：把「行」转成「列」\n"
        "SELECT user_id,\n"
        "       SUM(CASE WHEN status = 'paid'    THEN COALESCE(amount,0) ELSE 0 END) AS gmv_paid,\n"
        "       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_cnt\n"
        "FROM orders\n"
        "GROUP BY user_id;",
        '`paid` 映射为「已支付」；金额 NULL 的行落到「空值」而不是被 `ELSE` 吞掉；'
        '条件聚合里 `gmv_paid` 与非条件写法结果一致（Ada = 350）。',
        ['状态翻译供业务看板展示',
         '金额 / 活跃度分档做分布统计',
         '一张表同时输出多个口径的指标'],
        '上游是过滤与聚合；下游是「数据定义」里把口径固化到视图。',
        ['忘了 `ELSE`|出现 NULL 标签|补 `ELSE` 兜底',
         '分档顺序从宽到窄|所有值都落进第一档|条件从窄到宽排',
         '`CASE` 里写聚合函数|语法报错|聚合包 `CASE` 而非反过来'],
        '`CASE` 的执行模型是 **从上到下短路**。写分档时，`WHEN amount >= 300` 若放在 '
        '`WHEN amount >= 1000` 之前，所有大于 300 的值都会被判成「中」，'
        '这与你想要的分档完全相反。',
        '写一条 SQL 输出每个用户「已支付 / 待支付 / 已取消」三个计数列，'
        '要求 NULL 状态单独一列。',
        '函数与表达式', '（本节起）', '字符串与日期函数')


def fn_strdate():
    return leaf('字符串与日期函数', '??',
        '明细表里的 `created_at` 是时间戳，报表要按月汇总；用户姓名有前后空格。',
        '能用字符串与日期函数清洗与聚合，并知道「函数会打断索引」。',
        '「CASE WHEN 条件逻辑」',
        '`orders.created_at` 为 TIMESTAMP；`users.user_name` 可能有前后空格。',
        '字符串函数负责 **清洗**（去空格、大小写、拼接、截取）；'
        '日期函数负责 **对齐粒度**（截断到日 / 周 / 月，做差值）。'
        '两者的共同风险是：把函数写在 WHERE 的列上会让索引失效。',
        ['清洗：`TRIM` 去空格、`UPPER / LOWER` 统一大小写',
         '拼接：`CONCAT`（注意 NULL 会传染，用 `COALESCE` 兜住）',
         '对齐粒度：`DATE_TRUNC(\'month\', ts)` 用于分组',
         '区间过滤：**不要**对列包函数，改写成范围比较',
         '日期差值：交付周期 = 完成时间 − 创建时间'],
        "-- 1) 清洗\n"
        "SELECT user_id, TRIM(user_name) AS name, UPPER(city) AS city_u\n"
        "FROM users;\n\n"
        "-- 2) 按月汇总（对齐粒度）\n"
        "SELECT DATE_TRUNC('month', created_at) AS mon,\n"
        "       COUNT(*) AS pay_cnt,\n"
        "       SUM(COALESCE(amount,0)) AS gmv\n"
        "FROM orders\n"
        "WHERE status = 'paid'\n"
        "GROUP BY DATE_TRUNC('month', created_at)\n"
        "ORDER BY mon;\n\n"
        "-- 3) 过滤：反例 vs 正例\n"
        "-- 反例（列被包函数，索引用不上）\n"
        "SELECT * FROM orders WHERE DATE(created_at) = '2024-01-07';\n"
        "-- 正例（范围比较，能走索引）\n"
        "SELECT * FROM orders\n"
        "WHERE created_at >= '2024-01-07'\n"
        "  AND created_at <  '2024-01-08';",
        '按月汇总能直接得到每月的 `pay_cnt / gmv`；同一业务语义下正例与反例结果一致，'
        '但正例的执行计划是索引范围扫描而非全表扫描。',
        ['经营月报 / 周报',
         '用户资料清洗后入库',
         '交付时效（下单到支付时长）'],
        '上游是 `CASE` 与聚合；下游是「数据定义」里把月度口径固化成视图。',
        ['在 `WHERE` 里包 `DATE()`|索引失效全表扫|改范围比较',
         '`CONCAT` 遇 NULL 返回 NULL|整列拼出来是空|`COALESCE(col2, \'\')`',
         '按字符串比较日期|格式不同导致比较错|先转成日期类型'],
        '日期函数最容易踩的坑是 **在过滤列上做加工**。'
        '`WHERE DATE(created_at) = ...` 语义完全正确，但它让 B 树索引无法定位范围，'
        '在大表上就是全表扫描。改写方式是保持列「裸用」，把加工放到常量一侧。',
        '把 `orders` 按「月份 + 状态」输出订单数与 GMV，并说明为什么过滤条件用范围比较更快。',
        '函数与表达式', 'CASE WHEN 条件逻辑', 'NULL 语义与 COALESCE')


def fn_null():
    return leaf('NULL 语义与 COALESCE', '??',
        '报表 GMV 比明细手工加总少了一截，追查发现是金额为空的行被静默丢掉。',
        '掌握三值逻辑与 NULL 处理函数，能解释聚合为何丢行。',
        '「CASE WHEN 条件逻辑」',
        '`orders.amount` 与 `users.city` 都可能为 NULL。',
        'NULL 不是 0，也不是空字符串，它表示「未知」。因此：与它做任何比较都得到 UNKNOWN，'
        '`WHERE` 只保留 TRUE，于是行被过滤；聚合函数则 **跳过** NULL 输入。'
        '这两条就是绝大多数「数对不上」事故的根源。',
        ['判断：只用 `IS NULL` / `IS NOT NULL`，永不用 `= NULL`',
         '求和：`SUM(COALESCE(amount, 0))` 把「未知」按业务口径当 0',
         '取默认：`COALESCE(a, b, c)` 返回第一个非 NULL',
         '防除零：`NULLIF(x, 0)` 把 0 变成 NULL 再当分母',
         '反连接：`NOT IN` 遇 NULL 会返回空集，改 `NOT EXISTS`'],
        "-- 1) 错误写法 vs 正确写法\n"
        "SELECT * FROM orders WHERE amount = NULL;   -- 永远 0 行\n"
        "SELECT * FROM orders WHERE amount IS NULL;   -- 正确\n\n"
        "-- 2) 求和口径：把 NULL 当 0\n"
        "SELECT SUM(amount) AS gmv_raw,                -- 跳过 NULL，偏小\n"
        "       SUM(COALESCE(amount, 0)) AS gmv_biz    -- 业务口径\n"
        "FROM orders WHERE status = 'paid';\n\n"
        "-- 3) 防除零\n"
        "SELECT user_id,\n"
        "       SUM(COALESCE(amount,0)) AS gmv,\n"
        "       SUM(COALESCE(amount,0))\n"
        "         / NULLIF(COUNT(*), 0) AS aov\n"
        "FROM orders GROUP BY user_id;\n\n"
        "-- 4) NOT IN 陷阱\n"
        "SELECT * FROM users u\n"
        "WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.user_id);",
        '`gmv_raw` 会小于 `gmv_biz`，差额正好等于金额为 NULL 的那部分；'
        '若 `users.city` 含 NULL，用 `NOT IN` 反连接会返回空集，而 `NOT EXISTS` 正常返回。',
        ['口径对齐：与业务确认「空金额算不算 0」',
         '北极星指标计算',
         '反连接找「从没下单的用户」'],
        '上游是聚合与 `CASE`；下游是「数据操作」里更新空值。',
        ['`col = NULL`|条件永假|改 `IS NULL`',
         '`SUM(amount)` 直接交付|指标偏小且无人发现|显式 `COALESCE` 并注释口径',
         '`NOT IN (子查询含 NULL)`|结果为空|改 `NOT EXISTS`'],
        '把 NULL 理解成 **「未知」** 而不是「没有」，很多反直觉行为就都说得通了：'
        '未知 + 100 仍是未知（NULL 传染），未知和任何值比较都不成立（UNKNOWN），'
        '而 `COUNT(*)` 数的是行、`COUNT(col)` 数的是 **非空** 的列值。',
        '分别用 `SUM(amount)` 和 `SUM(COALESCE(amount,0))` 跑一遍，写出两者的差额，'
        '并解释这个差额在业务上代表什么。',
        '函数与表达式', '字符串与日期函数', '（本节完）')



# =====================================================================
# 拆解章节：数据定义（原为单叶，现拆 3 节）
# =====================================================================

def build_ddl():
    ch = node('SQL.数据定义', '数据定义', '??',
              chapter('数据定义',
                      '要建一张订单表，但不知道金额该用什么类型、约束要不要加。',
                      '把「一行代表什么」翻译成类型、约束与视图，让下游少踩坑。',
                      [('类型与精度', '数值 / 字符串 / 时间怎么选。', '?'),
                       ('建表与约束', '主键、非空、默认值与改表。', '??'),
                       ('视图与 CTE', '把口径固化成可复用对象。', '??')],
                      '类型与精度 → 建表与约束 → 视图与 CTE',
                      '函数与表达式', '数据操作'),
              lesson_parent=True)
    ch['children'] = [ddl_type(), ddl_table(), ddl_view()]
    return ch


def ddl_type():
    return leaf('类型与精度', '?',
        '金额用浮点存，月末对账差了几分钱；时间用字符串存，没法做区间查询。',
        '能为每类业务字段选对类型，并解释精度与范围的取舍。',
        '「统一样例与课模板」',
        '样例字段：`order_id`、`user_id`、`amount`、`status`、`created_at`。',
        '类型决定了三件事：**能存什么**（范围）、**能算什么**（可比较 / 可聚合）、'
        '**要花多少**（存储与索引大小）。选错类型造成的误差往往是「事后无法修正」的，'
        '所以它是建模里最不该省的一步。',
        ['整数标识：`BIGINT` 而不是 `INT`（避免 ID 溢出）',
         '金额：`DECIMAL(p, s)`，**永远不要用 FLOAT / DOUBLE**',
         '定长枚举：`VARCHAR(n)` 并配 CHECK 或字典表',
         '时间：`TIMESTAMP` / `DATE`，不要用字符串',
         '可空性：能确定非空就加 `NOT NULL`'],
        "CREATE TABLE orders (\n"
        "  order_id    BIGINT        PRIMARY KEY,\n"
        "  user_id     BIGINT        NOT NULL,\n"
        "  amount      DECIMAL(12,2) NULL,      -- 金额：定点，禁止 FLOAT\n"
        "  status      VARCHAR(16)   NOT NULL,  -- paid/pending/cancelled\n"
        "  created_at  TIMESTAMP     NOT NULL\n"
        ");\n\n"
        "-- 反例：浮点金额会产生二进制误差\n"
        "-- amount FLOAT  →  0.1 + 0.2 = 0.30000000000000004",
        '`DECIMAL(12,2)` 能精确保存到分；用 `FLOAT` 时多行求和会出现 '
        '0.30000000000000004 这类尾差，对账必然暴露。',
        ['财务 / 金额类字段',
         '时间维度做区间与分组',
         '主键选型（自增 vs 业务键）'],
        '上游是「函数与表达式」；下游是「建表与约束」与 ETL 的落地层。',
        ['金额用 FLOAT / DOUBLE|月末对账差几分|改`DECIMAL(p,s)`',
         '主键用 `INT`|量级上来后溢出|用 `BIGINT`',
         '时间存字符串|无法做范围查询与排序|用 `TIMESTAMP` / `DATE`'],
        '类型选择的判断标准是 **「这个字段最坏情况下要表示什么」**：'
        '金额要精确到分，时间要能比较，ID 要能扛住十年增长。'
        '凡是「事后无法修正」的决策，都值得在建表前多花五分钟。',
        '为 `order_items` 设计字段类型：`order_id`、`sku`、`qty`、`price`，'
        '并说明 `price` 为什么不能用 `FLOAT`。',
        '数据定义', '（本节起）', '建表与约束')



def ddl_table():
    return leaf('建表与约束', '??',
        '重复订单进了表，报表订单数虚高；上线后才想加约束，历史数据已经脏了。',
        '能用主键、唯一键、非空、默认值与外键把业务规则写进表结构。',
        '「类型与精度」',
        '`orders.order_id` 是业务主键；`order_items` 与订单头一对多。',
        '约束是 **写入时的护栏**：它把「不该出现的状态」挡在数据库门口，'
        '而不是等到报表出错才靠人巡检。代价是每次写入都要校验，'
        '所以要在「保护价值」和「写入成本」之间选，而不是一律加满。',
        ['主键：唯一标识一行，同时是该表默认的聚簇 / 索引依据',
         '唯一键：业务唯一（如 `(order_id, sku)` 防重复明细）',
         '非空：确定非空的列一律加 `NOT NULL`，减少下游 NULL 分支',
         '默认值：`DEFAULT` 给状态 / 时间兜底',
         '外键：强一致场景才加；数仓常省略以换取装载速度',
         '改表：`ALTER TABLE ... ADD COLUMN` 先加可空列，回填后再收紧'],
        "-- 建表：把业务规则写进结构\n"
        "CREATE TABLE order_items (\n"
        "  order_id  BIGINT       NOT NULL,\n"
        "  sku       VARCHAR(64)  NOT NULL,\n"
        "  qty       INT          NOT NULL DEFAULT 1,\n"
        "  price     DECIMAL(12,2) NOT NULL,\n"
        "  PRIMARY KEY (order_id, sku),          -- 一单一 SKU 只一行\n"
        "  CHECK (qty > 0)\n"
        ");\n\n"
        "-- 改表：先加可空列，回填后再收紧（三步走）\n"
        "ALTER TABLE orders ADD COLUMN channel VARCHAR(32) NULL;\n"
        "UPDATE orders SET channel = 'unknown' WHERE channel IS NULL;\n"
        "ALTER TABLE orders ALTER COLUMN channel SET NOT NULL;",
        '`PRIMARY KEY (order_id, sku)` 后，同一订单重复插入同一 SKU 会被拒绝，'
        '明细行数与样例种子 `order_items=5` 保持一致。',
        ['防重复写入',
         '状态与时间字段兜底',
         '在线改表而不锁表'],
        '上游是「类型与精度」；下游是「数据操作」里的写入与 UPSERT。',
        ['没有主键|重复行静默进表|声明业务主键',
         '直接给大表加 `NOT NULL`|回填失败或长时间锁表|三步走：加 → 回填 → 收紧',
         '无脑加外键|装载变慢、批量导入失败|按场景取舍'],
        '约束的价值在于 **把错误提前**。数据在门口被挡住，成本是毫秒级；'
        '等它流到报表被业务发现，成本是「查一周、改一批、再解释」。'
        '但数仓的装载层常故意省掉外键——因为上游已经被约束过了，重复校验只是浪费。',
        '给 `order_events` 设计主键，并说明为什么不能只用 `order_id` 做主键。',
        '数据定义', '类型与精度', '视图与 CTE')


def ddl_view():
    return leaf('视图与 CTE', '??',
        '三个报表各写了一份「已支付 GMV」的 SQL，口径已经开始漂移。',
        '能用视图与 CTE 把口径固化、把复杂查询拆成可读的步骤。',
        '「建表与约束」',
        '口径统一为 `status=\'paid\'` + `SUM(COALESCE(amount,0))`。',
        '`VIEW` 是 **持久化的命名查询**，把口径变成所有人都能引用的对象；'
        '`CTE`（`WITH`）是 **一次查询内的临时命名步骤**，把嵌套子查询拉平成可读的流水线。'
        '前者治「口径漂移」，后者治「SQL 读不懂」。',
        ['把重复出现的口径抽成视图（如 `v_paid_orders`）',
         '把复杂查询按「清洗 → 关联 → 聚合」拆成多个 CTE',
         'CTE 之间可以互相引用，最后一条负责输出',
         '需要递归时用 `WITH RECURSIVE` 展开层级',
         '明确边界：视图不存数据（除非物化），复杂视图会拖慢查询'],
        "-- 1) 视图：把支付口径固化成一个对象\n"
        "CREATE VIEW v_paid_orders AS\n"
        "SELECT order_id, user_id, created_at,\n"
        "       COALESCE(amount, 0) AS amount\n"
        "FROM orders\n"
        "WHERE status = 'paid';\n\n"
        "-- 之后所有报表都引用它，口径只有一处\n"
        "SELECT user_id, SUM(amount) AS gmv\n"
        "FROM v_paid_orders\n"
        "GROUP BY user_id;\n\n"
        "-- 2) CTE：把嵌套拉平成流水线\n"
        "WITH paid AS (\n"
        "  SELECT * FROM orders WHERE status = 'paid'\n"
        "),\n"
        "items AS (\n"
        "  SELECT order_id, COUNT(*) AS sku_cnt\n"
        "  FROM order_items GROUP BY order_id\n"
        ")\n"
        "SELECT p.user_id, COUNT(*) AS cnt, SUM(COALESCE(p.amount,0)) AS gmv,\n"
        "       SUM(COALESCE(i.sku_cnt,0)) AS sku_total\n"
        "FROM paid p\n"
        "LEFT JOIN items i ON i.order_id = p.order_id\n"
        "GROUP BY p.user_id;",
        '`v_paid_orders` 的行数等于 `orders` 中 `paid` 的行数；'
        'CTE 版本与直接写嵌套子查询的结果完全一致，但每一步都能单独调试。',
        ['口径治理：一份视图被多个报表引用',
         '复杂取数：ETL 前置清洗',
         '层级展开：组织树 / 类目树'],
        '上游是「建表与约束」；下游是「性能优化」里 CTE 与物化的取舍。',
        ['每个报表各写一份口径|指标开始漂移|抽公共视图',
         '把所有逻辑塞进一个 `SELECT`|无法调试、无人敢改|拆成多个 CTE',
         '在视图上再叠视图很多层|查询越来越慢|控制层数或用物化视图'],
        '视图与 CTE 解决的是两个不同的问题：**视图管一致性，CTE 管可读性**。'
        '实际项目里常见组合是「底层物化视图保证口径 → 中层 CTE 做加工 → 最外层输出」，'
        '这样口径只有一处、调试又足够细。',
        '把「每个用户的支付订单数、GMV、SKU 总数」写成一个视图，'
        '并解释为什么下游报表不应该再自己写 `status` 过滤。',
        '数据定义', '建表与约束', '（本节完）')



# =====================================================================
# 新增章节：数据操作（DML）
# =====================================================================

def build_dml():
    ch = node('SQL.数据操作', '数据操作', '??',
              chapter('数据操作',
                      '要在报表库里补数据、订正状态、重跑装载，但怕改错。',
                      '掌握安全的写入三件套：批量插入、条件更新、幂等重跑。',
                      [('INSERT 与批量写入', '多行插入与从查询插入。', '??'),
                       ('UPDATE 与 DELETE 安全', '先验证影响面，再包事务。', '??'),
                       ('UPSERT 与幂等', '重跑不变形：MERGE / ON CONFLICT。', '???')],
                      'INSERT → UPDATE / DELETE 安全 → UPSERT 与幂等',
                      '数据定义', '性能优化'),
              lesson_parent=True)
    ch['children'] = [dml_insert(), dml_update(), dml_upsert()]
    return ch


def dml_insert():
    return leaf('INSERT 与批量写入', '??',
        '要往报表表里灌一批数据，逐条插入太慢，写错一行还得回滚。',
        '能用多值与 `INSERT ... SELECT` 高效写入，并知道提交粒度的影响。',
        '「建表与约束」',
        '从 `orders` 灌入报表表 `rpt_orders`。',
        '写入有两条路径：**多值 `INSERT`** 适合少量手工数据；'
        '**`INSERT ... SELECT`** 适合从别的表批量搬数，它让数据库在一次语句内完成扫描与写入，'
        '比在应用层循环快一个数量级。',
        ['确认目标表的约束（主键 / 非空 / 默认值），避免插入即失败',
         '少量数据用多值 `INSERT`，一条语句插入多行',
         '批量搬数用 `INSERT ... SELECT`，不要应用层循环',
         '大表分批提交（如每 1 万行），避免超长事务撑爆日志',
         '写入后立刻用行数或金额做闭合校验'],
        "-- 1) 多值插入\n"
        "INSERT INTO rpt_orders (order_id, user_id, amount, status, created_at)\n"
        "VALUES (101, 1, 120.00, 'paid',    '2024-01-07 10:00:00'),\n"
        "       (102, 2, 230.00, 'paid',    '2024-01-07 11:00:00'),\n"
        "       (103, 3, NULL,   'pending', '2024-01-07 12:00:00');\n\n"
        "-- 2) 从查询批量插入（推荐）\n"
        "INSERT INTO rpt_orders (order_id, user_id, amount, status, created_at)\n"
        "SELECT order_id, user_id, COALESCE(amount, 0), status, created_at\n"
        "FROM orders\n"
        "WHERE status = 'paid';\n\n"
        "-- 3) 写入后闭合校验：源与目标行数必须一致\n"
        "SELECT (SELECT COUNT(*) FROM orders    WHERE status='paid') AS src_cnt,\n"
        "       (SELECT COUNT(*) FROM rpt_orders)                    AS dst_cnt;",
        '`src_cnt` 与 `dst_cnt` 必须相等；样例中 `paid` 的行数即期望写入行数。',
        ['初始化报表表',
         '重跑某一天的分区数据',
         '把明细搬进宽表'],
        '上游是「建表与约束」；下游是「UPSERT 与幂等」。',
        ['应用层循环单条插入|慢且事务冗长|改 `INSERT ... SELECT`',
         '忘了 `COALESCE`|NULL 违反非空约束|写入前统一转换',
         '一次提交一百万行|日志暴涨 / 锁表|分批提交'],
        '写入的核心纪律是 **闭合**：写完立刻用行数或金额与来源对一次。'
        '没有闭合的写入等于没有验收——数据一旦流到下游，追责成本会高得多。',
        '把 `orders` 中 `paid` 的行插入 `rpt_orders`（金额空值转 0），'
        '并写出你的行数闭合校验 SQL。',
        '数据操作', '（本节起）', 'UPDATE 与 DELETE 安全')



def dml_update():
    return leaf('UPDATE 与 DELETE 安全', '??',
        '要订正一批历史状态，一条 `UPDATE` 少写了条件，误伤几千行。',
        '养成「先 SELECT 验证影响面 → 包事务 → 核对 → 提交」的固定动作。',
        '「INSERT 与批量写入」',
        '把超期未支付的订单从 `pending` 改成 `expired`。',
        '`UPDATE / DELETE` 的语法极简，但风险极高：**没有 `WHERE` 就是全表**，'
        '`WHERE` 写宽一点就是误伤。所以专业做法是把它当成「有副作用的实验」——'
        '先用 `SELECT` 在同一个条件下确认行数，再执行，再核对受影响行数。',
        ['用与 `UPDATE` **完全相同的 `WHERE`** 跑一次 `SELECT COUNT(*)`',
         '确认影响行数符合预期（不符就停下来）',
         '开启事务 `BEGIN`',
         '执行 `UPDATE / DELETE`，核对受影响行数',
         '两边一致再 `COMMIT`，否则 `ROLLBACK`',
         '注意：`DELETE` 是物理删除，生产上优先用软删（`deleted_at`）'],
        "-- 第 1 步：先验证影响面（与 UPDATE 同条件）\n"
        "SELECT COUNT(*) AS affected\n"
        "FROM orders\n"
        "WHERE status = 'pending' AND created_at < '2024-01-01';\n\n"
        "-- 第 2 步：包事务执行\n"
        "BEGIN;\n"
        "UPDATE orders\n"
        "   SET status = 'expired'\n"
        " WHERE status = 'pending'\n"
        "   AND created_at < '2024-01-01';\n"
        "-- 第 3 步：核对受影响行数与 affected 一致后\n"
        "COMMIT;   -- 不一致则 ROLLBACK;\n\n"
        "-- 软删：生产更推荐\n"
        "UPDATE orders SET deleted_at = CURRENT_TIMESTAMP\n"
        "WHERE order_id = 108 AND deleted_at IS NULL;",
        '`SELECT COUNT(*)` 的 `affected` 与 `UPDATE` 的受影响行数必须相等；'
        '不一致说明条件在两次执行之间发生了变化，应回滚排查。',
        ['历史状态订正', '脏数据清理', '逻辑删除替代物理删除'],
        '上游是「INSERT 与批量写入」；下游是「事务与安全」。',
        ['忘记 `WHERE`|全表被改|先 SELECT 验证 + 事务',
         '`WHERE` 条件与验证时不一致|误伤行数不同|复制粘贴同一条条件',
         '直接物理删除|无法追溯|改软删字段'],
        '把「验证 → 事务 → 核对 → 提交」当成肌肉记忆，而不是可选项。'
        '真正的生产事故往往不是不会写 SQL，而是 **少做了一次验证**。',
        '写出「把 2024 年之前的 `cancelled` 订单标记为已归档」的完整安全流程，'
        '要包含验证 SQL 和事务边界。',
        '数据操作', 'INSERT 与批量写入', 'UPSERT 与幂等')


def dml_upsert():
    return leaf('UPSERT 与幂等', '???',
        '任务失败重跑一次，数据就多了一份；用户维表的新属性没更新进去。',
        '能用 `MERGE` / `ON CONFLICT` 实现「有则更新、无则插入」，让重跑安全。',
        '「建表与约束」「UPDATE 与 DELETE 安全」',
        '把 `orders` 的最新状态同步到 `rpt_orders`，允许重复执行。',
        '幂等 = **同一输入跑 N 次，结果与跑 1 次相同**。它是调度重试的前提：'
        '做不到幂等，就不该开自动重试。UPSERT 是达成幂等的标准手段——'
        '按业务键判断存在性，再决定插入还是更新。',
        ['确定业务键（唯一标识一行的列组合）',
         '先建唯一约束，否则 UPSERT 无法判断「冲突」',
         '用 `MERGE`（标准 SQL）、`ON CONFLICT`（PostgreSQL）'
         '或 `ON DUPLICATE KEY UPDATE`（MySQL）',
         '只更新 **可能变化** 的列，主键与创建时间不动',
         '重跑两遍验证：行数与指标都不应变化'],
        "-- PostgreSQL：ON CONFLICT（最常用）\n"
        "INSERT INTO rpt_orders (order_id, user_id, amount, status, created_at)\n"
        "SELECT order_id, user_id, COALESCE(amount,0), status, created_at\n"
        "FROM orders\n"
        "ON CONFLICT (order_id) DO UPDATE\n"
        "   SET status = EXCLUDED.status,\n"
        "       amount = EXCLUDED.amount;   -- 只更新可能变的列\n\n"
        "-- 标准 SQL：MERGE\n"
        "MERGE INTO rpt_orders AS t\n"
        "USING (SELECT order_id, user_id, COALESCE(amount,0) AS amount,\n"
        "              status, created_at\n"
        "       FROM orders) AS s\n"
        "   ON t.order_id = s.order_id\n"
        "WHEN MATCHED THEN\n"
        "  UPDATE SET status = s.status, amount = s.amount\n"
        "WHEN NOT MATCHED THEN\n"
        "  INSERT (order_id, user_id, amount, status, created_at)\n"
        "  VALUES (s.order_id, s.user_id, s.amount, s.status, s.created_at);",
        '连续执行两次后，`rpt_orders` 的行数与「仅执行一次」完全相同，'
        '且每笔订单的 `status / amount` 等于源表最新值。',
        ['每日增量同步', '维表属性更新（SCD1）', '调度失败后安全重跑'],
        '上游是「INSERT」与「安全更新」；下游是 ETL 的幂等装载与回填。',
        ['没有唯一约束就 UPSERT|冲突判断失效|先建唯一键',
         '重跑一次就多一批|重复数据|改 UPSERT 而非追加',
         '更新了主键 / 创建时间|历史被改写|只更新可变列'],
        '幂等是 **数据平台的底线能力**：调度会重试、上游会重发、人也会手抖。'
        '只要写入是幂等的，这些意外就都退化成「多跑一次而已」。'
        '反过来，非幂等的任务一旦重试，往往需要人工去清理数据。',
        '把「把 `orders` 同步到 `rpt_orders`」写成 UPSERT，'
        '并说明连续跑两次与跑一次的差别在哪里。',
        '数据操作', 'UPDATE 与 DELETE 安全', '（本节完）')



# =====================================================================
# 拆解章节：性能优化（原为单叶，现拆 3 节）
# =====================================================================

def build_perf():
    ch = node('SQL.性能优化', '性能优化', '???',
              chapter('性能优化',
                      '同一条业务查询，有人跑 0.1 秒，有人跑 30 秒。',
                      '学会读执行计划、判断索引是否生效、定位慢点并改写。',
                      [('执行计划入门', '看懂扫描方式与预估行数。', '??'),
                       ('索引怎么用上', '为什么我的索引没生效。', '???'),
                       ('慢查询定位与改写', '从慢日志到改写方案。', '???')],
                      '执行计划入门 → 索引怎么用上 → 慢查询定位与改写',
                      '数据操作', '事务与安全'),
              lesson_parent=True)
    ch['children'] = [perf_plan(), perf_index(), perf_slow()]
    return ch


def perf_plan():
    return leaf('执行计划入门', '??',
        '查询突然变慢，不知道该改 SQL 还是该加索引。',
        '能读 `EXPLAIN` 的关键几列：扫描方式、预估行数、访问方式，并据此下判断。',
        '「基础查询」「多表操作」',
        '对 `orders` 做一次条件查询与 `GROUP BY`。',
        '执行计划是数据库 **打算怎么执行** 这条 SQL 的说明书。它把「你写的 SQL」翻译成'
        '「扫哪张表、走不走索引、怎么连接、怎么排序」。读懂它，性能问题就从玄学变成推理。',
        ['先看 **扫描方式**：全表扫描（Seq Scan / ALL）还是索引扫描（Index / ref / range）',
         '再看 **预估行数**：数量级偏离实际，说明统计信息过期',
         '看 **连接方式**：小表驱动用 Nested Loop，大表用 Hash / Merge Join',
         '看是否出现 **排序 / 临时表**（Sort / Using temporary / Using filesort）',
         '提出假设 → 改一处 → 重新看计划，一次只动一个变量'],
        "-- MySQL\n"
        "EXPLAIN SELECT user_id, SUM(COALESCE(amount,0)) AS gmv\n"
        "FROM orders\n"
        "WHERE status = 'paid' AND created_at >= '2024-01-01'\n"
        "GROUP BY user_id;\n\n"
        "-- PostgreSQL\n"
        "EXPLAIN ANALYZE\n"
        "SELECT user_id, SUM(COALESCE(amount,0)) AS gmv\n"
        "FROM orders\n"
        "WHERE status = 'paid' AND created_at >= '2024-01-01'\n"
        "GROUP BY user_id;",
        '重点关注三行信息：`type`（访问方式）、`rows`（预估行数）、`Extra`（是否用到索引 / 是否排序）。'
        '`type=ALL` 或 `Extra=Using filesort / Using temporary` 都是可优化的信号。',
        ['慢查询首次定位',
         '上线前评估 SQL 代价',
         '验证索引是否被使用'],
        '上游是「多表操作」「聚合分析」；下游是「索引怎么用上」。',
        ['只看耗时不看计划|不知道瓶颈在哪|先读 scans 与 rows',
         '把 `EXPLAIN` 当 `EXPLAIN ANALYZE`|没跑就没真实耗时|按需选择',
         '一次改多处|无法归因|一次只动一个变量'],
        '性能优化的通用流程是 **量 → 假设 → 验证**：先量出扫描行数，'
        '再提出「因为没走索引」这类假设，最后用计划验证假设。'
        '跳过任何一步都会退化成「凭感觉调参」。',
        '对上面那条查询跑一次 `EXPLAIN`，写出你看到的扫描方式与预估行数两行结论。',
        '性能优化', '（本节起）', '索引怎么用上')


def perf_index():
    return leaf('索引怎么用上', '???',
        '明明建了索引，查询还是全表扫描。',
        '能说清索引生效的前提，并识别最常见的五类「索引失效」写法。',
        '「执行计划入门」',
        '`orders` 上有 `created_at` 索引；对比函数包裹与范围比较。',
        '索引是一棵有序结构（通常是 B 树），只有当你给出的条件 **能在有序结构上定位区间** 时，'
        '它才能被用上。任何破坏「有序可比」的写法都会让它失效——'
        '这就是「索引失效」的全部本质。',
        ['保持 **列裸用**：条件左侧只放列本身，不包函数、不做运算',
         '模糊匹配只在 **前缀** 才能用索引：`LIKE \'2024%\'` 可以，`LIKE \'%2024\'` 不行',
         '注意类型隐式转换：字符串列用数字比较会让索引失效',
         '最左前缀：联合索引 `(a, b)` 能服务 `a` 与 `a AND b`，不能只服务 `b`',
         '避免 `OR` 跨不同列，必要时拆成 `UNION ALL`'],
        "-- 反例：列被包函数 → 索引失效\n"
        "SELECT * FROM orders WHERE DATE(created_at) = '2024-01-07';\n\n"
        "-- 正例：范围比较 → 走索引\n"
        "SELECT * FROM orders\n"
        "WHERE created_at >= '2024-01-07'\n"
        "  AND created_at <  '2024-01-08';\n\n"
        "-- 反例：前置通配 → 无法定位区间\n"
        "SELECT * FROM users WHERE user_name LIKE '%a%';\n\n"
        "-- 正例：前缀匹配 → 可用索引\n"
        "SELECT * FROM users WHERE user_name LIKE 'Ada%';\n\n"
        "-- 反例：隐式类型转换（user_id 是 BIGINT，却传了字符串）\n"
        "SELECT * FROM orders WHERE user_id = '1';",
        '同一条业务语义下，正例的 `EXPLAIN` 显示 `type=range`（或 Index Scan），'
        '反例显示 `type=ALL`（全表扫描）。',
        ['慢查询改写',
         '索引设计评审',
         '大表条件查询'],
        '上游是「执行计划入门」；下游是「慢查询定位与改写」。',
        ['对索引列包函数|全表扫，慢一个量级|改写成范围比较',
         '前置通配 `LIKE \'%x\'`|索引用不上|改后缀搜索或全文索引',
         '联合索引顺序写反|只服务了后半段|按最左前缀设计'],
        '判断索引能否生效只需要问一句话：**数据库能不能靠这个条件把搜索范围缩小到一个区间？**'
        '能，就用得上；不能（比如前置通配、函数包裹），就只能全扫。',
        '把你的一个日常查询跑一次 `EXPLAIN`，如果 `type=ALL`，'
        '写出至少一种改写方式让它走索引。',
        '性能优化', '执行计划入门', '慢查询定位与改写')



def perf_slow():
    return leaf('慢查询定位与改写', '???',
        '收到「报表打不开」的反馈，但不知道是哪条 SQL、慢在哪里。',
        '能从慢日志定位到具体 SQL，按固定套路改写并验证提速。',
        '「索引怎么用上」',
        '两类典型慢查询：函数包裹谓词、深分页 `OFFSET`。',
        '慢查询治理是一套 **固定流程**，不是灵感：定位 → 量级 → 假设 → 改写 → 验证。'
        '把流程走完，绝大多数慢查询都能收敛到一个已知模式上。',
        ['定位：从慢日志 / 监控按「耗时 × 频次」排序，优先治高频',
         '量级：跑 `EXPLAIN`，先看扫了多少行（不是看耗时）',
         '归因：常见四类——无索引、索引失效、深分页、大排序 / 临时表',
         '改写：范围比较、键集分页、减少返回列、先过滤再排序',
         '验证：改写后重新 `EXPLAIN`，行数或耗时应有数量级改善'],
        "-- 模式一：函数包裹 → 改范围比较\n"
        "SELECT * FROM orders WHERE DATE(created_at) = '2024-01-07';\n"
        "SELECT * FROM orders\n"
        "WHERE created_at >= '2024-01-07' AND created_at < '2024-01-08';\n\n"
        "-- 模式二：深分页 OFFSET → 改键集分页\n"
        "SELECT * FROM orders ORDER BY order_id LIMIT 10 OFFSET 100000;\n"
        "SELECT * FROM orders\n"
        "WHERE order_id > 100000 ORDER BY order_id LIMIT 10;\n\n"
        "-- 模式三：先过滤再排序，别让大结果集进排序\n"
        "SELECT order_id, amount FROM orders\n"
        "WHERE status = 'paid'\n"
        "ORDER BY created_at DESC LIMIT 20;\n\n"
        "-- 模式四：只取需要的列，避免回表\n"
        "SELECT order_id, amount FROM orders WHERE user_id = 1;",
        '深分页用 `OFFSET 100000` 时数据库仍要扫描并丢弃前 10 万行；'
        '键集分页直接定位到游标位置，扫描行数与 `LIMIT` 同量级。',
        ['报表打开变慢', '定时任务超时', '接口 P99 抖动'],
        '上游是「索引怎么用上」；下游是索引设计与缓存 / 预聚合。',
        ['只看耗时不看扫描行数|改不动|先量 rows',
         '深分页不优化|越翻越慢|键集 / 游标分页',
         '返回 `SELECT *`|回表 + 传输放大|只取需要的列'],
        '慢查询优化的收益往往来自 **改写**，而不是加机器。'
        '同一条业务语义的查询，写对了可能快两个数量级；'
        '而多数「加索引」的尝试之所以失败，是因为 SQL 里的写法根本没给索引机会。',
        '举出一个你遇到过的慢查询，写出：扫描行数、归因、改写后的 SQL 三部分。',
        '性能优化', '索引怎么用上', '（本节完）')



# =====================================================================
# 拆解章节：事务与安全（原为单叶，现拆 3 节）
# =====================================================================

def build_txn():
    ch = node('SQL.事务与安全', '事务与安全', '???',
              chapter('事务与安全',
                      '两个人同时改同一笔订单，结果变成了谁都没想要的样子。',
                      '掌握事务边界、隔离级别、锁与权限，让改动可控可回滚。',
                      [('事务与隔离级别', 'BEGIN / COMMIT 与三种读异常。', '??'),
                       ('锁与并发', '谁在等谁、怎么避免死锁。', '???'),
                       ('权限与注入防护', '最小权限与参数化绑定。', '???')],
                      '事务与隔离级别 → 锁与并发 → 权限与注入防护',
                      '性能优化', '（本章末）'),
              lesson_parent=True)
    ch['children'] = [txn_isolation(), txn_lock(), txn_security()]
    return ch


def txn_isolation():
    return leaf('事务与隔离级别', '??',
        '转账扣了一边没加另一边，中间失败后数据就永久错了。',
        '能用事务把多步改动绑成原子操作，并说清四种隔离级别各挡哪种异常。',
        '「UPDATE 与 DELETE 安全」',
        '把 `orders.status` 从 `pending` 改成 `paid`，同时写一条 `order_events`。',
        '事务提供 **原子性（要么都做，要么都不做）** 与 **隔离性（并发互不干扰）**。'
        '隔离性越强越安全，但并发度越低——所以要按业务选级别，而不是一律用最高级。',
        ['写清事务边界：`BEGIN` 到 `COMMIT / ROLLBACK` 之间只放必须原子的语句',
         '多步改动（改状态 + 写事件）放同一个事务',
         '异常就 `ROLLBACK`，不要「先提交再看」',
         '隔离级别按需选：READ COMMITTED 遮挡脏读，'
         'REPEATABLE READ 再挡不可重复读，SERIALIZABLE 才挡幻读',
         '事务要短：事务里不要做网络调用或等待人工输入'],
        "-- 多步改动必须原子\n"
        "BEGIN;\n"
        "UPDATE orders SET status = 'paid'\n"
        " WHERE order_id = 101 AND status = 'pending';   -- 条件更新防并发覆盖\n\n"
        "INSERT INTO order_events (order_id, event_type, event_time)\n"
        "VALUES (101, 'paid', CURRENT_TIMESTAMP);\n\n"
        "SELECT COUNT(*) FROM order_events\n"
        " WHERE order_id = 101 AND event_type = 'paid';  -- 核对\n"
        "COMMIT;\n\n"
        "-- 隔离级别：读已提交（最常用）\n"
        "SET TRANSACTION ISOLATION LEVEL READ COMMITTED;",
        '若 `UPDATE` 受影响行数为 0（订单已不是 `pending`），说明并发已先行一步，'
        '此时应 `ROLLBACK` 整笔事务，而不是继续写事件。',
        ['扣款 / 退款等多步操作',
         '状态流转 + 事件落库',
         '库存扣减'],
        '上游是「安全更新」；下游是「锁与并发」。',
        ['多步改动不包事务|一半成功一半失败|`BEGIN` 包住全部步骤',
         '事务里做远程调用|长时间持锁、连接被占满|把 IO 移出事务',
         '一律用最高隔离级别|并发急剧下降|按业务选级别'],
        '事务的边界应该由 **业务原子性** 决定：问「这几步能不能只做一半？」'
        '不能，就必须在同一个事务里。反过来，把不相关的东西塞进事务只会拉长持锁时间。',
        '写出「把订单从 `pending` 改成 `paid` 并记录事件」的事务，'
        '并说明如果第二步失败你希望发生什么。',
        '事务与安全', '（本节起）', '锁与并发')


def txn_lock():
    return leaf('锁与并发', '???',
        '两个任务互相等对方的锁，数据库报 deadlock；或者一条更新把整张表锁住了。',
        '能解释行锁与表锁的区别、死锁的成因，并给出规避写法。',
        '「事务与隔离级别」',
        '两个事务以不同顺序更新 `orders` 与 `order_items`。',
        '锁是并发控制的实现手段：**读要一致，写要互斥**。'
        '死锁的本质是「两个事务以不同顺序申请同一批资源」，'
        '所以规避死锁最有效的办法不是加超时，而是 **统一加锁顺序**。',
        ['缩小锁范围：`WHERE` 命中越精确，锁的行越少',
         '统一访问顺序：多个表 / 多行按同一顺序（如按 `order_id` 升序）更新',
         '缩短事务：事务里不做慢操作，尽快 `COMMIT`',
         '避免大范围更新：`UPDATE ... WHERE status=\'pending\'`（无索引）可能锁大量行',
         '识别等待：查锁等待视图，找出「谁在等谁」'],
        "-- 统一加锁顺序：两个会话都先 orders 后 order_items\n"
        "-- 会话 A\n"
        "BEGIN;\n"
        "UPDATE orders      SET status='paid' WHERE order_id = 101;\n"
        "UPDATE order_items SET qty = qty   WHERE order_id = 101;\n"
        "COMMIT;\n\n"
        "-- 会话 B（同样顺序，不会与 A 形成环）\n"
        "BEGIN;\n"
        "UPDATE orders      SET status='paid' WHERE order_id = 102;\n"
        "UPDATE order_items SET qty = qty   WHERE order_id = 102;\n"
        "COMMIT;\n\n"
        "-- 反例：原子性缺失，A/B 顺序相反就会死锁\n"
        "-- A: orders → order_items\n"
        "-- B: order_items → orders    ← 环形成，Deadlock",
        '顺序一致时两个会话只会短暂排队；顺序相反时才可能形成等待环并被数据库判定为死锁'
        '（其中一个事务被强制回滚）。',
        ['高并发下单 / 扣库存',
         '批量任务与在线查询相互影响',
         '死锁排查'],
        '上游是「事务与隔离级别」；下游是「权限与注入防护」。',
        ['无索引 `WHERE` 做更新|锁大量行甚至表锁|补索引缩小命中',
         '事务顺序随机|死锁频发|统一加锁顺序',
         '长事务不提交|后续请求全部排队|事务尽量短'],
        '死锁不是「数据库的 bug」，而是 **并发编程的必然现象**：只要有两个事务'
        '以不同顺序申请资源，就存在形成环的可能。应用侧能做的是把环打破——'
        '统一顺序、缩短事务、缩小锁范围。',
        '设计两个并发会话，让它们 **不会** 死锁；说明你用了哪条规避策略。',
        '事务与安全', '事务与隔离级别', '权限与注入防护')



def txn_security():
    return leaf('权限与注入防护', '???',
        '应用用了一个超级账号连库；同事用字符串拼 SQL，被注入删了表。',
        '能按最小权限分配账号，并用参数化绑定杜绝注入。',
        '「锁与并发」',
        '应用只读查询用 `report_ro` 账号，只授 `SELECT`。',
        '安全有两个层面：**谁能做什么**（权限）与 **输入能否改变语义**（注入）。'
        '权限决定事故的爆炸半径，参数化决定输入能否被当成代码执行。'
        '两者都比「事后审计」便宜得多。',
        ['按用途分账号：报表只读、ETL 读写、运维独立，**不要共用超级账号**',
         '最小授权：`GRANT SELECT ON ...` 到具体表，避免 `ON *.*`',
         '禁止对外暴露的账号有 `DROP / ALTER` 权限',
         '应用侧一律 **参数化绑定**，绝不字符串拼接 SQL',
         '确需动态排序字段时，用白名单映射，不要直接拼列名',
         '敏感字段脱敏后再给分析使用'],
        "-- 1) 最小权限：报表账号只读\n"
        "CREATE ROLE report_ro;\n"
        "GRANT USAGE ON SCHEMA public TO report_ro;\n"
        "GRANT SELECT ON orders, order_items, users TO report_ro;\n"
        "GRANT report_ro TO bi_user;\n\n"
        "-- 2) 注入对照\n"
        "-- 危险：字符串拼接（输入 ' OR 1=1 -- 会改变语义）\n"
        "-- sql = \"SELECT * FROM users WHERE name = '\" + name + \"'\"\n\n"
        "-- 安全：参数化绑定，输入只当值，不当代码\n"
        "SELECT * FROM users WHERE user_name = :name;   -- :name 由驱动绑定\n\n"
        "-- 3) 动态排序白名单（列名不能参数化，只能白名单）\n"
        "SELECT order_id, amount FROM orders\n"
        "ORDER BY created_at DESC;   -- 允许列：created_at / amount",
        '注入字符串 `\' OR 1=1 --` 在拼接写法下会返回全表；'
        '在参数化写法下被当成普通字符串值，查询返回 0 行。',
        ['应用连库账号设计',
         '对外查询接口安全评审',
         '敏感数据合规交付'],
        '上游是「锁与并发」；下游是数据平台的安全审计与合规。',
        ['应用共用超级账号|一次注入全库受损|按用途拆分账号 + 最小授权',
         '字符串拼接 SQL|注入可执行|参数化绑定',
         '动态拼列名|无法用参数化兜住|白名单映射'],
        '安全的默认姿势应该是 **「默认拒绝」**：账号默认没有权限，'
        '需要什么才授什么；输入默认不可信，能当值就绝不当代码。'
        '绝大多数数据事故，都源自某处图省事的「先给全权限 / 先拼一下试试」。',
        '列出你项目里应用连库账号当前拥有的权限，'
        '写出一个更小的权限方案，并说明削减了哪些风险。',
        '事务与安全', '锁与并发', '（本节完）')



# =====================================================================
# 已有 10 节课的内容升级（保留原「是什么/怎么做/用在哪/动手」，补齐缺失段落）
# =====================================================================

UPGRADE = {
    'SQL.基础查询.SELECT': dict(
        level='?', scene='日报只需要订单号与金额，却拿回一整行几十个字段。',
        prereq='「统一样例与课模板」', sample='`orders` 的 `order_id`、`user_id`、`amount`、`status`。',
        result='结果集只包含显式列出的几列（含 `gmv` 别名）；`paid` 命中的行数等于样例种子里的支付单数。',
        upstream='上游是「统一样例与课模板」；下游是 WHERE 的过滤与 ORDER BY 的排序。',
        errors=['`SELECT *` 进生产报表|上游加字段把下游报表撑爆|显式列名并在注释写口径',
                '把过滤写进 `SELECT`|过滤失效、全表返回|过滤放 `WHERE`',
                '别名带中文空格且未加引号|下游引用报错|用 `AS gmv` 这类标识符'],
        deep='投影是 SQL 里唯一 **只影响列、不影响行** 的算子。'
             '因此它最安全，也最容易随手写坏：`SELECT *` 让查询与表结构隐式耦合，'
             '上游一次加列就可能让下游报表崩掉。',
        prev='（本节起）', nxt='WHERE'),
    'SQL.基础查询.WHERE': dict(
        level='?', scene='要按状态和时间窗捞一批订单，条件一多就写错。',
        prereq='「SELECT」', sample='`orders.status` 与 `orders.created_at`。',
        result='只返回同时满足「已支付 + 金额区间 + 未删除」的行；NULL 金额不会被误判为命中。',
        upstream='上游是 SELECT 的投影；下游是 ORDER BY 的排序。',
        errors=['`amount = NULL`|条件永假，返回 0 行|改 `IS NULL`',
                '`AND` / `OR` 不加括号|优先级导致条件失效|用括号显式分组',
                '对索引列包函数|全表扫描|改写为范围比较'],
        deep='`WHERE` 在 **分组之前** 过滤明细，所以它决定了后面聚合看到的数据范围。'
             '记住「WHERE 管行、SELECT 管列、ORDER BY 管顺序」这三句，就不会把算子放错位置。',
        prev='SELECT', nxt='ORDER BY'),
    'SQL.基础查询.ORDER BY': dict(
        level='?', scene='分页接口翻到第二页，出现了第一页已经看过的记录。',
        prereq='「WHERE」', sample='`orders.created_at` 与 `orders.amount`。',
        result='按创建时间倒序、金额倒序输出；金额为 NULL 的行排在最后。',
        upstream='上游是 WHERE 的过滤；下游是 LIMIT 的截断。',
        errors=['排序键不唯一|同值行顺序随机、分页重复|追加唯一键做次序键',
                '忽略 NULL 位置|NULL 混进 TopN|显式 `NULLS LAST`',
                '对函数结果排序|用不上索引|尽量对原始列排序'],
        deep='排序是 **不稳定的**：只写一个可能有重复值的排序键，同值行的顺序就由数据库自行决定。'
             '分页场景必须补一个唯一键做次序键，否则「翻页丢数据」是必然的。',
        prev='WHERE', nxt='LIMIT'),
    'SQL.基础查询.LIMIT': dict(
        level='?', scene='要出 Top10 榜单，或者给接口做分页。',
        prereq='「ORDER BY」', sample='`orders.amount` 用于 TopN；`orders.order_id` 用于键集分页。',
        result='TopN 返回金额最高的 N 行；键集分页每页行数固定且不重复。',
        upstream='上游是 ORDER BY；下游是「多表操作」的 JOIN。',
        errors=['`LIMIT` 前不排序|「前 N 行」不确定|先 ORDER BY 再 LIMIT',
                '大 `OFFSET` 深分页|越翻越慢|改键集 / 游标分页',
                '把 `LIMIT` 当过滤条件|以为过滤掉了数据|它只截断结果'],
        deep='`LIMIT` 只回答「要几行」，不回答「哪几行」——'
             '后者完全由 `ORDER BY` 决定。没有排序的 `LIMIT` 在结果上是随机的，'
             '这是分页 bug 最常见的来源。',
        prev='ORDER BY', nxt='多表操作'),
    'SQL.多表操作.JOIN': dict(
        level='??', scene='要按用户出指标，订单在另一张表里。',
        prereq='「基础查询」四节课',
        sample='`users` 与 `orders` 通过 `user_id` 一对多。',
        result='无订单用户的 `cnt=0`；Ada 的支付 GMV 为 350，与明细加总一致。',
        upstream='上游是基础查询；下游是子查询与聚合分析。',
        errors=['先 JOIN 明细再 SUM 金额|表头金额被行数放大|先按主键聚合再关联',
                '保留侧过滤写进 `WHERE`|`LEFT` 退化成 `INNER`|条件放 `ON`',
                '用逗号做交叉连接|产生笛卡尔积|显式 `JOIN ... ON`'],
        deep='JOIN 的全部难点都在 **粒度**：连接不会创造信息，但会改变「一行代表什么」。'
             '只要一行不再代表一笔订单，所有金额类指标都会失真。',
        prev='LIMIT', nxt='子查询'),
    'SQL.多表操作.子查询': dict(
        level='??', scene='要过滤出「满足另一个条件的」行，或用到另一个查询的结果。',
        prereq='「JOIN」', sample='`orders` 与 `users.city`、`order_events.event_type`。',
        result='`EXISTS` 只输出订单侧的行，且不会因为事件表多条而放大。',
        upstream='上游是 JOIN；下游是 UNION 与聚合分析。',
        errors=['标量位置用了多行子查询|运行时报错|改 `IN` / `EXISTS` 或先聚合',
                '`NOT IN` 遇 NULL|结果为空|改 `NOT EXISTS`',
                '相关子查询关联键无索引|逐行扫描极慢|补索引或改 JOIN'],
        deep='子查询按 **位置** 分三类：过滤位置（`IN` / `EXISTS`）、计算列位置（标量）、'
             '来源位置（派生表）。位置决定了它必须返回几行——'
             '这也是最容易被忽略的约束。',
        prev='JOIN', nxt='UNION'),
}



UPGRADE.update({
    'SQL.多表操作.UNION': dict(
        level='??', scene='要把两种口径的结果拼成一张清单，行数比预期少了很多。',
        prereq='「子查询」', sample='`orders` 的 `paid` 与 `cancelled` 两段。',
        result='`UNION ALL` 行数 = 两段之和；`UNION` 行数 ≤ 两段之和（去重导致减少）。',
        upstream='上游是子查询；下游是聚合分析。',
        errors=['默认用 `UNION` 去重|行数莫名变少、性能变差|能不去重就用 `UNION ALL`',
                '两段列顺序不一致|数据错位|显式列名并逐列对齐',
                '在分支里写 `ORDER BY`|语法报错|排序放最外层'],
        deep='`UNION` 的语义是 **集合并**，所以它必须去重——而去重意味着排序或哈希，'
             '这是它比 `UNION ALL` 慢的原因。绝大多数业务场景要的是「拼接」而不是「去重」。',
        prev='子查询', nxt='聚合分析'),
    'SQL.聚合分析.GROUP BY': dict(
        level='??', scene='要看每个状态的订单数与金额合计。',
        prereq='「多表操作」', sample='`orders.status` 与 `orders.amount`。',
        result='每个状态一行；金额合计用 `COALESCE` 后不会因 NULL 而偏小。',
        upstream='上游是多表操作；下游是 HAVING 与窗口函数。',
        errors=['非聚合列不在 `GROUP BY`|严格模式直接报错|补齐分组键或包聚合',
                '`COUNT(amount)` 当订单数|漏数金额为 NULL 的订单|订单数用 `COUNT(*)`',
                '分组键含高基数列|结果行数爆炸|先过滤或换维度'],
        deep='`GROUP BY` 是 **行数发生变化的算子**：N 行进去，K 组出来。'
             '写它之前必须先回答「分组键是什么、一行代表什么」——'
             '分组键就是你最终交付的粒度。',
        prev='UNION', nxt='HAVING'),
    'SQL.聚合分析.HAVING': dict(
        level='??', scene='只想要「消费达到门槛」的用户，而不是全部用户。',
        prereq='「GROUP BY」', sample='`orders.user_id` 与 `orders.amount`。',
        result='只保留 `SUM ≥ 200` 的用户；Ada 因 `gmv=350` 命中。',
        upstream='上游是 GROUP BY；下游是窗口函数。',
        errors=['在 `WHERE` 里写聚合函数|语法报错或语义错|聚合条件放 `HAVING`',
                '`HAVING` 过滤明细列|失去索引、全量分组后再丢|明细条件下推 `WHERE`',
                '搞混两个过滤位置|结果集范围不对|先 WHERE 再 GROUP BY 再 HAVING'],
        deep='`WHERE` 与 `HAVING` 的差别不是「写法」，而是 **执行阶段**：'
             '前者在分组前筛明细，后者在分组后筛组。'
             '同一个条件放错位置，结果和性能都会变。',
        prev='GROUP BY', nxt='窗口函数'),
    'SQL.聚合分析.窗口函数': dict(
        level='??', scene='要取每个用户的最近一笔订单，但不想把明细行数塌缩掉。',
        prereq='「HAVING」', sample='`orders` 的 `user_id` 与 `created_at`。',
        result='每个用户恰好保留 1 行（`rn=1`）；累计列 `running_gmv` 逐行递增。',
        upstream='上游是 HAVING；下游是「函数与表达式」。',
        errors=['窗口与 `GROUP BY` 同层混用|语法报错|先派生表再开窗',
                '误解默认帧范围|累计值不是预期|显式写 `ROWS BETWEEN`',
                '开窗前不过滤|大结果集排序、变慢|先 `WHERE` 再开窗'],
        deep='窗口函数最重要的性质是 **不改变行数**：它在保留明细的同时附加计算结果。'
             '这正是它和 `GROUP BY` 的根本分工——一个折叠行，一个不折叠。',
        prev='HAVING', nxt='（本节完）'),
})


def parse_sections(md):
    out = {}
    for p in re.split(r'(?=^### )', md or '', flags=re.M):
        m = re.match(r'^###\s+(.+?)\s*$', p, flags=re.M)
        if m:
            out[m.group(1).strip()] = p[m.end():].strip('\n')
    return out


def upgrade_existing(node, spec, parent_title):
    sec = parse_sections(node.get('content'))
    before = sec.get('课前') or ''
    goal = ''
    m = re.search(r'\*\*目标\*\*[：:]\s*(.+)', before)
    if m:
        goal = m.group(1).strip()
    err = "\n".join("| %s |" % e for e in spec['errors'])
    node['level'] = spec['level']
    node['content'] = (
        "### 课前\n\n"
        "- **场景**：%s\n- **目标**：%s\n- **先修**：%s\n- **难度**：%s\n"
        "- **学完标准**：能复述定义、独立写出等价实现、指出至少两个翻车点。\n\n"
        "### 样例输入\n\n%s\n\n%s\n\n"
        "### 是什么\n\n%s\n\n"
        "### 怎么写\n\n%s\n\n"
        "### 查询结果\n\n%s\n\n"
        "### 用在哪\n\n%s\n\n**上下游**：%s\n\n"
        "### 易错对照\n\n| 错法 | 现象 | 纠正 |\n|---|---|---|\n%s\n\n"
        "### 教义深讲\n\n%s\n\n"
        "### 动手\n\n%s\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：%s\n- 下一节：%s\n"
        % (spec['scene'], goal or '掌握本节的核心写法与边界', spec['prereq'],
           LEVELS[spec['level']], spec['sample'], SAMPLE_NOTE,
           sec.get('是什么', ''), sec.get('怎么做', ''), spec['result'],
           sec.get('用在哪', ''), spec['upstream'], err,
           spec['deep'], sec.get('动手', ''), parent_title, spec['prev'], spec['nxt'])
    )
    return node



# =====================================================================
# 组装 + 部署
# =====================================================================

BASES = [
    os.path.join(ROOT, 'kg-data'),
    r'D:\cursor\多行业数据平台\portfolio\pages\kg-data',
    r'D:\cursor\financial-data-portfolio-publish\pages\kg-data',
]
HTMLS = [
    os.path.join(ROOT, '数据知识图谱.html'),
    r'D:\cursor\多行业数据平台\portfolio\pages\learn.html',
    r'D:\cursor\financial-data-portfolio-publish\pages\learn.html',
]
NEW_VER = '20260921e'


def root_content():
    return (
        "### 课程定位\n\n"
        "SQL 是数据平台 **唯一的通用语言**：Python、ETL、数仓、BI 最终都要落到一条 SQL 上。"
        "本教程与 Python / ETL / DWH / 数据库 **同源样例**，验收数字全平台一致。\n\n"
        "### 能力地图\n\n"
        "| 阶段 | 章节 | 你会得到 |\n|---|---|---|\n"
        "| 入门 | 基础查询 | 单表投影、过滤、排序、分页 |\n"
        "| 进阶 | 多表操作 · 聚合分析 · 函数与表达式 | 关联不丢行、聚合不放大、口径可翻译 |\n"
        "| 工程 | 数据定义 · 数据操作 | 把规则写进结构，写入可重跑 |\n"
        "| 高阶 | 性能优化 · 事务与安全 | 看得懂计划，改得动生产 |\n\n"
        "### 建议学习顺序\n\n"
        "```text\n"
        "学习路径（宪法 / 清单 / 练习场）\n"
        "→ 基础查询 → 多表操作 → 聚合分析 → 函数与表达式\n"
        "→ 数据定义 → 数据操作 → 性能优化 → 事务与安全\n"
        "```\n\n"
        "### 三条铁律\n\n"
        "1. **先定粒度再写 SQL**：写不清「一行代表什么」就别写 `GROUP BY`。  \n"
        "2. **NULL 必须显式处理**：`COALESCE` / `IS NULL`，聚合会静默跳过 NULL。  \n"
        "3. **动手前先知道代价**：扫多少行、锁多少行、失败能否回滚。\n\n"
        "### 验收种子\n\n"
        "`users=4`，`orders=8`，`order_events=7`，`order_items=5`；"
        "支付口径 `status='paid'` + `SUM(COALESCE(amount,0))`，Ada 的支付 GMV = **350**。\n")


def index_nodes(n, out=None):
    out = out if out is not None else {}
    out[n['id']] = n
    for c in n.get('children') or []:
        index_nodes(c, out)
    return out


def build():
    old = json.load(open(MASTER, encoding='utf-8'))
    idx = index_nodes(old)

    # 1) 升级已有 10 节课
    for nid in [k for k in UPGRADE if k in idx]:
        parent = None
        for cid, cn in idx.items():
            for c in cn.get('children') or []:
                if c['id'] == nid:
                    parent = cn
        upgrade_existing(idx[nid], UPGRADE[nid], (parent or {}).get('title', 'SQL'))

    # 2) 复用已有章节标题下的叶子，重建章节
    def kids_of(chapter_id):
        return list(idx[chapter_id].get('children') or [])

    ch_basic = node('SQL.基础查询', '基础查询', '?',
                    chapter('基础查询',
                            '拿到一张表，先要学会只取要的行和列。',
                            '这四节决定你后面所有查询的地基：投影、过滤、排序、截断。',
                            [('SELECT', '只取要的列，并起业务别名。', '?'),
                             ('WHERE', '组合条件过滤，NULL 用 IS NULL。', '?'),
                             ('ORDER BY', '稳定排序，为 TopN 与分页打底。', '?'),
                             ('LIMIT', 'TopN 与分页，注意深分页代价。', '?')],
                            'SELECT → WHERE → ORDER BY → LIMIT',
                            '学习路径', '多表操作'),
                    lesson_parent=True)
    ch_basic['children'] = kids_of('SQL.基础查询')

    ch_join = node('SQL.多表操作', '多表操作', '??',
                   chapter('多表操作',
                           '指标要靠多张表拼出来，一不小心就翻倍。',
                           '三节课讲清横向拼接、嵌套过滤与纵向合并。',
                           [('JOIN', '横向拼接，连接类型决定保留哪些行。', '??'),
                            ('子查询', '按位置分三类，注意返回行数。', '??'),
                            ('UNION', '纵向合并，UNION 去重有成本。', '??')],
                           'JOIN → 子查询 → UNION',
                           '基础查询', '聚合分析'),
                   lesson_parent=True)
    ch_join['children'] = kids_of('SQL.多表操作')

    ch_agg = node('SQL.聚合分析', '聚合分析', '??',
                  chapter('聚合分析',
                          '明细要变成业务看的指标数字。',
                          '三节课覆盖折叠行、筛组与不折叠的窗口计算。',
                          [('GROUP BY', '按粒度折叠行做聚合。', '??'),
                           ('HAVING', '对聚合结果再过滤。', '??'),
                           ('窗口函数', '保留明细行的同时做排名与累计。', '??')],
                          'GROUP BY → HAVING → 窗口函数',
                          '多表操作', '函数与表达式'),
                  lesson_parent=True)
    ch_agg['children'] = kids_of('SQL.聚合分析')

    root = node('sql-root', 'SQL', '?', root_content())
    root['source'] = old.get('source', 'tutorials_v2_graph')
    root['children'] = build_learning_path() + [ch_basic, ch_join, ch_agg,
                                                 build_funcs(), build_ddl(), build_dml(),
                                                 build_perf(), build_txn()]
    return root


def deploy(tree):
    compact = json.dumps(tree, ensure_ascii=False, separators=(",", ":"))
    pretty = json.dumps(tree, ensure_ascii=False, indent=1)
    for b in BASES:
        if not os.path.isdir(b):
            print('skip (missing)', b)
            continue
        open(os.path.join(b, 'sql.json'), 'w', encoding='utf-8').write(compact)
        open(os.path.join(b, 'hub-query.json'), 'w', encoding='utf-8').write(compact)
        open(os.path.join(b, 'embed-sql.js'), 'w', encoding='utf-8').write(
            'window.__KG_EMBEDDED = window.__KG_EMBEDDED || {};\n'
            'window.__KG_EMBEDDED["sql"]=%s\n' % compact)
        print('deployed', b)
    open(MASTER, 'w', encoding='utf-8').write(pretty)
    print('master written', MASTER)
    for h in HTMLS:
        if not os.path.exists(h):
            print('skip html', h)
            continue
        t = open(h, encoding='utf-8').read()
        t2, n = re.subn(r'const KG_DATA_VER = "[^"]+"', 'const KG_DATA_VER = "%s"' % NEW_VER, t, count=1)
        if n:
            open(h, 'w', encoding='utf-8').write(t2)
            print('ver bumped', os.path.basename(h))


if __name__ == '__main__':
    tree = build()
    leaves, chapters = [], []
    def walk(n, d=0):
        (leaves if not (n.get('children') or []) and d > 0 else chapters).append(n)
        for c in n.get('children') or []:
            walk(c, d + 1)
    walk(tree)
    print('nodes leaves=%d chapters=%d' % (len(leaves), len(chapters)))
    bad = [n['id'] for n in leaves if len(n.get('content') or '') < 600]
    print('thin leaves:', bad)
    deploy(tree)

