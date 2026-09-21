# -*- coding: utf-8 -*-
"""Thicken SQL/BI leaf lessons and short chapter nodes, then sync kg-data."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(r"D:\cursor\数据学习平台")
KG = ROOT / "kg-data"
LESSONS = ROOT / "_gen" / "lessons"
TUTORIALS = ROOT / "_gen" / "tutorials_v2" / "tutorials_bi_sql_v2.json"

MIRRORS = [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
]

HTMLS = [
    ROOT / "数据知识图谱.html",
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

# id -> (goal, what, how, where, mistakes[(wrong, fix)], exercise, level_note)
BANK = {}


def add(nid, goal, what, how, where, mistakes, exercise, note="统一样例：users / orders / order_items。"):
    BANK[nid] = dict(goal=goal, what=what, how=how, where=where, mistakes=mistakes, exercise=exercise, note=note)


add(
    "SQL.基础查询.SELECT",
    "能写出显式列、别名、表达式与 DISTINCT，并说清结果集是什么。",
    "SELECT 决定「返回哪些列」。它不负责过滤（WHERE）也不负责排序（ORDER BY）。`SELECT *` 只适合探查，生产查询应写列名，避免上游加列把下游报表撑爆。",
    """```sql
SELECT
  o.order_id,
  o.user_id,
  o.amount AS gmv,
  o.amount * 0.06 AS tax_est
FROM orders AS o
WHERE o.status = 'paid';

SELECT DISTINCT status FROM orders;
```""",
    "1. 日报只要订单号与金额，不要整行。\n2. 给指标起业务别名（gmv），避免下游猜 amount 含不含税。\n3. 枚举状态用 DISTINCT，先看有哪些取值再写过滤。",
    [("SELECT * 进生产报表", "显式列名，并在注释里写口径"), ("把过滤写进 SELECT", "过滤放 WHERE；SELECT 只投影"), ("别名用了中文空格又没加引号", "用 AS gmv 这种标识符")],
    "查询已支付订单的 order_id、user_id、amount（别名 gmv）。不要用 SELECT *。",
)
add(
    "SQL.基础查询.WHERE",
    "能组合 AND/OR/NOT、区间与 NULL 判断，并知道 WHERE 在分组前执行。",
    "WHERE 按行过滤。`NULL` 不是空字符串，`= NULL` 永远未知，必须用 `IS NULL`。OR 与 AND 混用时加括号。",
    """```sql
SELECT order_id, amount, status
FROM orders
WHERE status = 'paid'
  AND amount >= 100
  AND created_at >= DATE '2024-01-01'
  AND amount IS NOT NULL;
```""",
    "1. 看板只看已支付且金额有效的订单。\n2. 排除测试城市或空城市用户。\n3. 先过滤再 JOIN，减少参与关联的行。",
    [("写成 amount = NULL", "改为 amount IS NULL / IS NOT NULL"), ("AND/OR 没加括号", "先写括号再填条件"), ("在 WHERE 里用聚合函数", "聚合后过滤用 HAVING")],
    "找出 2024-01 之后、状态为 paid、金额不为空且 ≥ 50 的订单。",
)
add(
    "SQL.基础查询.ORDER BY",
    "能按一列或多列排序，并处理 NULL 与并列名次。",
    "ORDER BY 在 SELECT 之后执行，可以用别名。不写 ORDER BY 时，数据库不保证行顺序，「最新一条」没有定义。",
    """```sql
SELECT order_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, order_id ASC;
```""",
    "1. 订单时间线从新到旧。\n2. 金额相同再按订单号稳定排序，方便对账。\n3. 给 LIMIT 提供确定的「前 N」。",
    [("只 ORDER BY 一列，并列行每次顺序不同", "再加唯一键如 order_id"), ("以为 SELECT 里的顺序就是结果顺序", "展示顺序只看 ORDER BY"), ("对未过滤的大表全表排序", "先 WHERE 再排序")],
    "按支付时间倒序列出 paid 订单，时间相同则按 order_id 升序。",
)
add(
    "SQL.基础查询.LIMIT",
    "能安全取前 N 行，并知道必须先 ORDER BY。",
    "LIMIT 只截断已经排好的结果。没有 ORDER BY 的 LIMIT 取出的是任意 N 行。分页用 LIMIT + OFFSET 时，大偏移会变慢，深分页应改用「上次最大 id」。",
    """```sql
SELECT order_id, amount, created_at
FROM orders
WHERE status = 'paid'
ORDER BY created_at DESC, order_id DESC
LIMIT 5;
```""",
    "1. 首页只展示最近 5 笔支付。\n2. 抽样探查表结构，不要一次拉全表。\n3. 和 ORDER BY 一起定义「Top N 客户」。",
    [("LIMIT 5 却没有 ORDER BY", "先定义排序键再截断"), ("OFFSET 很大当成分页方案", "改用 keyset：WHERE id < :last_id"), ("LIMIT 写在 WHERE 前面", "子句顺序：WHERE → ORDER BY → LIMIT")],
    "取最近 3 笔已支付订单（时间倒序，并列用 order_id）。",
)
add(
    "SQL.多表操作.JOIN",
    "能按粒度选择 INNER / LEFT JOIN，并避免一对多把金额加爆。",
    "JOIN 把两张表按键对齐。INNER 丢掉对不上的行；LEFT 保留左表。订单对明细是一对多，先按订单汇总明细再 JOIN 订单，否则 SUM(orders.amount) 会被明细行放大。",
    """```sql
SELECT o.order_id, o.amount, u.user_name, u.city
FROM orders AS o
LEFT JOIN users AS u ON u.user_id = o.user_id
WHERE o.status = 'paid';

-- 明细先聚合再回订单
SELECT o.order_id, o.amount, s.item_amt
FROM orders AS o
LEFT JOIN (
  SELECT order_id, SUM(price * qty) AS item_amt
  FROM order_items
  GROUP BY order_id
) AS s ON s.order_id = o.order_id;
```""",
    "1. 给订单补用户城市。\n2. 找出没有订单的用户（LEFT JOIN + 右表键 IS NULL）。\n3. 对账：订单金额 vs 明细合计。",
    [("一对多之后直接 SUM(订单金额)", "先聚合到订单粒度再加总"), ("只用 INNER，把没匹配的用户悄悄丢掉", "需要保留时用 LEFT，并检查 NULL"), ("JOIN 条件写成 WHERE 里的过滤，把 LEFT 变成 INNER", "对右表的过滤放 ON，或明确接受 INNER")],
    "列出每个用户的姓名、城市，以及 paid 订单数。没有订单的用户也要出现，订单数为 0。",
)
add(
    "SQL.多表操作.子查询",
    "能区分标量子查询、IN 列表与派生表，并知道何时改写成 JOIN。",
    "子查询是嵌在查询里的查询。标量子查询必须只返回一行一列。IN 适合小集合；大表关联优先 JOIN。派生表要有别名。",
    """```sql
SELECT user_id, user_name
FROM users
WHERE user_id IN (
  SELECT user_id FROM orders WHERE status = 'paid'
);

SELECT u.user_name, t.gmv
FROM users AS u
JOIN (
  SELECT user_id, SUM(amount) AS gmv
  FROM orders
  WHERE status = 'paid'
  GROUP BY user_id
) AS t ON t.user_id = u.user_id;
```""",
    "1. 找出至少有一笔支付的用户。\n2. 把「用户 GMV」做成派生表再补姓名。\n3. 用标量子查询取全表最大金额做对比。",
    [("标量子查询返回多行", "加聚合或 LIMIT 1，或改 JOIN"), ("相关子查询在大表上逐行执行", "改成先 GROUP BY 再 JOIN"), ("派生表忘记别名", "FROM ( ... ) AS t")],
    "查询 GMV 高于「全体 paid 订单平均金额」的订单号与金额。",
)
add(
    "SQL.多表操作.UNION",
    "能用 UNION / UNION ALL 叠结果，并说清何时不能去重。",
    "UNION 上下拼接列数、类型必须兼容，按位置对齐而不是按列名。UNION 会去重（多一次排序）；UNION ALL 保留重复，日志拼接应优先 ALL。",
    """```sql
SELECT order_id, 'paid' AS src, amount
FROM orders
WHERE status = 'paid'
UNION ALL
SELECT order_id, 'item' AS src, price * qty
FROM order_items;
```""",
    "1. 把两个渠道的订单叠成一张投放表。\n2. 事件流与订单流按同一列结构拼接再统一清洗。\n3. 明确要去重时才用 UNION。",
    [("列顺序不一致导致金额和 ID 对调", "两边 SELECT 列顺序、含义逐列对齐"), ("该保留重复却用了 UNION", "日志用 UNION ALL"), ("试图用 UNION 代替 JOIN", "左右补列用 JOIN，上下叠行用 UNION")],
    "把 status='paid' 与 status='cancelled' 的订单叠在一起，多加一列 bucket 标记来源，保留重复行。",
)
add(
    "SQL.聚合分析.GROUP BY",
    "能按维度聚合，并遵守「SELECT 的非聚合列必须出现在 GROUP BY」。",
    "GROUP BY 把行折成组，组内用 COUNT/SUM/AVG。选了 user_name 却只按 user_id 分组，在严格模式下会报错；宽松模式下会随机挑一个名字。",
    """```sql
SELECT
  user_id,
  COUNT(*) AS order_cnt,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS gmv
FROM orders
GROUP BY user_id;
```""",
    "1. 每个用户的支付 GMV。\n2. 每个城市的用户数。\n3. 用条件聚合一次算出支付额和取消额。",
    [("SUM 前没过滤或没 CASE，把取消单算进 GMV", "SUM(CASE WHEN status='paid' THEN amount END)"), ("GROUP BY 漏了维度，人数被并错", "分组键与 SELECT 维度一致"), ("COUNT(*) 与 COUNT(amount) 混用", "COUNT(*) 计行，COUNT(列) 忽略 NULL")],
    "按 user_id 统计 paid 订单数与 GMV，GMV 为空时显示 0。",
)
add(
    "SQL.聚合分析.HAVING",
    "能在分组之后过滤组，而不是把条件和 WHERE 混在一起。",
    "WHERE 过滤行，HAVING 过滤组。`HAVING SUM(amount) >= 100` 不能写进 WHERE。能在 WHERE 做的过滤不要推到 HAVING，否则会先把不该参与的行算进聚合。",
    """```sql
SELECT user_id, SUM(amount) AS gmv
FROM orders
WHERE status = 'paid'
GROUP BY user_id
HAVING SUM(amount) >= 200;
```""",
    "1. 只要 GMV 达到门槛的用户。\n2. 找出订单数大于 1 的复购用户。\n3. 和 WHERE 配合：先丢掉未支付，再按汇总门槛筛人。",
    [("把 HAVING 条件写进 WHERE", "聚合条件只能 HAVING"), ("只写 HAVING 不过滤 status", "行级条件放 WHERE，减少进组的行"), ("HAVING 里用了没聚合也没分组的列", "要么进 GROUP BY，要么套聚合")],
    "找出 paid GMV ≥ 150 的 user_id，并给出 GMV。",
)
add(
    "SQL.聚合分析.窗口函数",
    "能写 OVER(PARTITION BY … ORDER BY …)，区分它和 GROUP BY。",
    "窗口函数在不折叠行的前提下做排名、累计、前后值。`ROW_NUMBER` 每个分区从 1 编号；`RANK` 会并列跳号。累计金额用 `SUM() OVER (ORDER BY …)`。",
    """```sql
SELECT
  order_id,
  user_id,
  amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at, order_id) AS rn,
  SUM(amount) OVER (
    PARTITION BY user_id ORDER BY created_at, order_id
  ) AS running_gmv
FROM orders
WHERE status = 'paid';
```""",
    "1. 每个用户按时间的第 N 笔订单。\n2. 用户内累计 GMV。\n3. 取每个用户最近一笔（rn = 1 且时间倒序）。",
    [("窗口写成 GROUP BY，明细行没了", "要保留明细就用 OVER，不要分组"), ("ORDER BY 不稳定导致 rn 抖动", "排序键加上主键"), ("把窗口结果又和原表错误 JOIN 翻倍", "窗口直接写在同一层 SELECT")],
    "给每个用户的 paid 订单按时间编号，并计算该用户截至该单的累计金额。",
)
add(
    "SQL.数据定义",
    "能用 CREATE TABLE 声明类型、主键和非空，并知道 DDL 是结构而不是查询。",
    "数据定义（DDL）描述表、列、约束。类型决定能不能排序和聚合；主键保证一行一个订单。分析库里建表前先写清粒度：一行是什么。",
    """```sql
CREATE TABLE orders (
  order_id    BIGINT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  amount      DECIMAL(12, 2),
  status      VARCHAR(16) NOT NULL,
  created_at  TIMESTAMP NOT NULL
);
```""",
    "1. 为教程样例建订单表。\n2. 给状态、时间加非空，避免脏数据进仓。\n3. 和 BI 同学对齐：金额用 DECIMAL 而不是浮点。",
    [("金额用 FLOAT", "用 DECIMAL，避免 0.1 二进制误差"), ("没有主键，重复订单进表", "业务主键或代理键必须声明"), ("先插数据再改类型", "先定契约再灌数")],
    "写出 users 表的 CREATE TABLE：user_id 主键，user_name 非空，city 可空，created_at 非空。",
)
add(
    "SQL.性能优化",
    "能用过滤、列裁剪和索引思路判断一条查询为什么慢。",
    "慢查询先看：是不是 `SELECT *`、是不是没过滤、是不是 JOIN 前没聚合、是不是在列上套函数导致索引用不上。先把口径写对，再谈索引。EXPLAIN 用来看访问方式，而不是背一个「最优计划」。",
    """```sql
EXPLAIN
SELECT order_id, amount
FROM orders
WHERE status = 'paid'
  AND created_at >= DATE '2024-01-01';
```
可考虑索引 `(status, created_at)`，让过滤和范围扫描走在一起。""",
    "1. 日报只扫支付订单，不要全表。\n2. 大明细先按订单聚合再关联。\n3. 深分页改成按主键续页。",
    [("先加一堆索引再看 SQL", "先改写查询，确认过滤列"), ("在 WHERE 里对列做函数", "把函数挪到常量一侧，或建表达式索引"), ("SELECT * 拉回几十列再在 BI 里丢", "SQL 里就只取需要的列")],
    "把「每个用户最近一笔 paid 订单」写成先过滤、再窗口或分组的查询，并说明哪一列适合做索引。",
)
add(
    "SQL.事务与安全",
    "能说明事务的提交/回滚，以及分析账号为什么不能要写权限。",
    "事务把多步改动变成全成或全不成。分析查询通常只读，不要包在长事务里锁表。账号按最小权限：报表用户只有 SELECT。拼接 SQL 字符串会注入，条件必须用参数。",
    """```sql
BEGIN;
UPDATE orders SET status = 'paid' WHERE order_id = 101 AND status = 'created';
INSERT INTO order_events(order_id, event_type) VALUES (101, 'pay');
COMMIT;
-- 出错则 ROLLBACK;
```""",
    "1. 支付状态与事件日志必须一起成功。\n2. BI 连接使用只读账号。\n3. 应用层用参数化查询，不把用户输入拼进 SQL。",
    [("报表连接用了管理员账号", "单独只读账号"), ("长事务里跑大查询", "只读短查询，写事务尽量短"), ("字符串拼接 WHERE 条件", "使用绑定参数")],
    "写出一段事务：把订单 102 标为 cancelled，并插入一条 cancel 事件；任一步失败则回滚。说明报表账号至少不该有哪类权限。",
)

NOTE_BI = "样例用 Superstore 或订单表：品类、订单日期、销售额、数量、地区。"

add("BI.Tableau.入门准备", "完成 Tableau 环境准备，能指出维度区、度量区、标记卡和工作表。",
    "维度是分类（品类、地区），度量是可聚合的数（销售额）。工作表画一张图，仪表板才是多图组合。先连接样例再认识界面，不要空着画布猜。",
    "1. 打开 Tableau Desktop 或 Public。\n2. 连接 Superstore 样例（或 orders CSV）。\n3. 确认左侧维度/度量已分开。\n4. 新建工作表并保存工作簿。",
    "1. 第一次打开时确认数据源页和表名。\n2. 把「订单日期」拖出来看是日期而不是字符串。\n3. 截图标注五个区域，作为后续课的坐标系。",
    [("把度量拖进维度后图表变成计数", "看字段图标，数值应留在度量"), ("找不到数据源", "底部点「数据源」标签重新连接")],
    "连接样例后，截图标出维度区、度量区、列行功能区、标记卡。", NOTE_BI)
add("BI.Tableau.数据准备", "能建立关系模型，处理类型，并判断抽取还是实时。",
    "关系（Relationship）按键在查询时匹配，适合订单与客户这种不同粒度。物理联接会提前把行乘开。退货往往是订单的一对多或一对零，先确认主键再关联。",
    "1. 连接订单、人员、退货。\n2. 用订单号建立关系，而不是盲目内连接。\n3. 把日期改成日期类型，地理字段设置地理角色。\n4. 样例数据做成抽取，保证刷新稳定。",
    "1. 订单金额与退货原因放在同一模型里。\n2. 检查行数：关联前后订单数不应无故翻倍。\n3. 向同事说明为什么不用内连接丢未退货订单。",
    [("内连接后订单变少", "改关系或左连接，保留未匹配订单"), ("日期是字符串，折线按字典序排", "改为日期类型")],
    "用样例把订单和退货按订单号关联，写出关联前后的行数，并解释是否发生粒度放大。", NOTE_BI)
add("BI.Tableau.图表制作.柱状图", "能做出按度量排序的柱状图，用于类别对比。",
    "柱状图比的是柱的长短。类别放在一个轴，度量放在另一个轴。类别很多时用条形图（横向）更易读名字。",
    "1. 品类放到列，销售额放到行。\n2. 标记确认为条形图。\n3. 按销售额降序排序。\n4. 打开标签，改掉默认轴标题。",
    "1. 各品类销售额对比。\n2. 各地区销量对比。\n3. 排序后一眼看到头部品类。",
    [("柱子太多挤成一团", "筛选 Top N 或改为条形图"), ("用柱状图表示时间趋势", "时间趋势改折线图")],
    "做各品类销售额柱状图，按销售额从高到低排序并显示标签。", NOTE_BI)
add("BI.Tableau.图表制作.折线图", "能按连续日期画出趋势，并处理缺失日期。",
    "折线图的横轴必须是连续时间。离散的「年月」会变成很多列。断点通常是该日没有数据，不一定是销量为零，要在数据里补零或在图上说明。",
    "1. 订单日期放到列，点开选「月（连续）」。\n2. 销售额放到行。\n3. 标记改为线。\n4. 需要对比时把地区放颜色。",
    "1. 月销售额趋势。\n2. 两条线对比华东/华北。\n3. 向业务说明缺口是没数据还是真为 0。",
    [("日期被当成离散，图变成一排点", "选连续月份或精确日期"), ("双轴刻度没对齐就解读交叉", "先统一口径再考虑双轴")],
    "做连续月份的销售额折线，并写出样例里哪几个月可能没有点。", NOTE_BI)
add("BI.Tableau.图表制作.饼图", "能做占比饼图，并知道类别一多就不要用饼图。",
    "饼图表达部分占整体。类别超过 5 个时，人眼比不清角度，应改柱状图。角度放度量，颜色放维度。",
    "1. 标记选饼图。\n2. 品类放颜色，销售额放角度。\n3. 标签显示百分比。\n4. 类别过多时先分组为「其他」。",
    "1. 品类销售占比。\n2. 渠道订单占比。\n3. 只在少数类别的汇报页使用。",
    [("六个以上扇区还硬做饼图", "保留前 4 名，其余合并"), ("用饼图比绝对大小", "绝对大小用柱状图")],
    "做品类销售占比饼图，显示百分比；若品类超过 5 个，说明你打算如何合并。", NOTE_BI)
add("BI.Tableau.图表制作.环形图", "能在饼图基础上做成同心环形图。",
    "环形图是饼图中间挖空，做法是两个饼叠成双轴：外圈保留颜色和角度，内圈改成白色小圆。两轴范围必须手动对齐，否则不同心。",
    "1. 先按饼图放好品类和销售额。\n2. 记录数拖到行两次，都设为最小值。\n3. 第二个记录数选双轴。\n4. 内圈去掉颜色/角度，调小并设为白色。\n5. 同步两个轴的范围。",
    "1. 占比图需要中间写总数。\n2. 仪表板空间紧、又要保留占比。",
    [("两个饼不同心", "手动把两个轴固定成同一范围"), ("内圈仍带着颜色", "内圈标记卡清除颜色和角度")],
    "用样例做品类销售占比环形图，中间留白能放下总销售额文字。", NOTE_BI)
add("BI.Tableau.图表制作.双轴组合图", "能把柱和线画在同一视图，并核对两套刻度。",
    "双轴用来同时看规模（柱，销售额）和比率或另一量纲（线，利润率）。两轴刻度不同，不能把交叉点当成「相等」。同步轴只在单位相同时使用。",
    "1. 月放到列。\n2. 销售额放到行，利润率再放到行。\n3. 右键第二个度量选双轴。\n4. 一个标记改柱，一个改线。\n5. 分别命名左右轴。",
    "1. 销售额柱 + 利润率线。\n2. 订单量柱 + 客单价线。",
    [("两轴不同步却说交叉点是达标", "只比较各自趋势，不解释交点"), ("两个度量单位相同却做成双轴", "同单位放同一轴更诚实")],
    "做「月销售额柱 + 月利润率线」组合图，并写出左右轴分别代表什么。", NOTE_BI)
add("BI.Tableau.图表制作.热力图", "能用两个维度 + 颜色深浅做热力表。",
    "热力图看的是交叉格里的强弱，不是精确读数。行、列各放一个维度，颜色放度量。颜色要连续、并标出中点，否则深浅没有比较基准。",
    "1. 地区放行，品类放列。\n2. 标记改为方块。\n3. 销售额放颜色，选择连续色带。\n4. 需要时再把销售额放标签。",
    "1. 地区 × 品类的销售强弱。\n2. 星期 × 小时的订单密度。",
    [("用太多分类色，深浅失去顺序", "度量用连续色"), ("格子太多无法读", "先筛选主要地区或品类")],
    "做地区 × 品类销售额热力图，指出颜色最深的三格。", NOTE_BI)
add("BI.Tableau.计算.基础计算", "能写行级公式：加减、IF、日期差。",
    "基础计算逐行运算，不看整张表的其他行。利润率是 `SUM([利润])/SUM([销售额])`，不要先写 `[利润]/[销售额]` 再让 Tableau 去平均比率。",
    """```text
利润率: SUM([利润]) / SUM([销售额])
高额: IF SUM([销售额]) >= 10000 THEN "高" ELSE "低" END
```""",
    "1. 派生利润率指标。\n2. 把订单分成高/低额两档。\n3. 计算发货与下单的天数差。",
    [("对比率再平均", "分子分母分别求和再相除"), ("空值参与除法得到空白", "分母为零或空时用 IF 或 ZN")],
    "创建「利润率」字段，并做一个按品类展示利润率的文本表。", NOTE_BI)
add("BI.Tableau.计算.表计算", "能使用合计百分比、排名、环比等表计算，并说清「计算依据」。",
    "表计算发生在查询结果的窗口里，依赖当前视图的行列。同一公式，计算依据改成「表向下」或「区」，结果会变。排名和占比都要先问：相对谁。",
    "1. 做好品类销售额柱状图。\n2. 快速表计算选「总额百分比」。\n3. 编辑计算依据，改成相对整个表。\n4. 再做一个排名，确认排序方向。",
    "1. 各品类占全部销售的比例。\n2. 每月相对上月的差异。\n3. 视图里的名次。",
    [("筛选后百分比仍按未筛选总体", "看计算依据是否包含筛选后的分区"), ("换了行列布局但没改计算依据", "布局一变就复查「计算依据」")],
    "在品类销售额上加「总额百分比」，并写出你选择的计算依据。", NOTE_BI)
add("BI.Tableau.计算.LOD.FIXED", "能用 FIXED 在指定维度上聚合，不受视图维度影响。",
    "FIXED 先按你写的维度算出一个数，再把这个数接到每一行。`{ FIXED [客户] : SUM([销售额]) }` 是该客户的总销售额，即使当前图只画了某个品类，这个总数仍是客户全量（除非固定了筛选上下文）。",
    """```text
客户销售额:
{ FIXED [客户名称] : SUM([销售额]) }
```
再算 `SUM([销售额]) / SUM([客户销售额])` 得到该视图占客户总额的比例。""",
    "1. 客户总销售额，再在品类视图里看贡献。\n2. 不受行列拆分影响的基准值。",
    [("该用 FIXED 却用了表计算", "基准不随视图变时用 FIXED"), ("忘记上下文筛选会作用在 FIXED 上", "需要忽略筛选时再考虑表计算或筛选设置")],
    "用 FIXED 计算每位客户的总销售额，并在「客户 × 品类」视图里显示该总数。", NOTE_BI)
add("BI.Tableau.计算.LOD.INCLUDE", "能用 INCLUDE 在视图维度之外临时多加一个维度再聚合。",
    "INCLUDE 是在当前视图维度上再加更细的维度算完，然后按视图聚合回来。典型用途：视图只有地区，但要先按「地区+客户」算出客户销售额，再对客户取平均。",
    """```text
地区内客户平均销售额:
{ INCLUDE [客户名称] : SUM([销售额]) }
```
视图只放地区时，再对这个字段取 AVG。""",
    "1. 地区的平均客户销售额，而不是销售额除以订单数。\n2. 视图不想拆到客户，但计算必须到客户。",
    [("把 INCLUDE 当成 FIXED", "INCLUDE 仍跟随视图已有维度"), ("外层又 SUM 了一次，把平均变回总额", "外层用 AVG")],
    "只显示地区，但指标是「该地区每个客户销售额的平均值」。写出 INCLUDE 公式。", NOTE_BI)
add("BI.Tableau.计算.LOD.EXCLUDE", "能用 EXCLUDE 忽略视图里的某个维度。",
    "EXCLUDE 从当前视图去掉指定维度再聚合，用来算「如果没有这个拆分，总数是多少」。例如视图有品类和子类，排除子类后得到品类合计，便于做占品类比。",
    """```text
品类合计:
{ EXCLUDE [子类] : SUM([销售额]) }
```""",
    "1. 子类行上仍然能看到所属品类的总额。\n2. 计算子类占品类的比例。",
    [("视图里没有该维度却写 EXCLUDE", "EXCLUDE 只能排除视图中存在的维度"), ("和 FIXED 写出了同一个数却说不清差别", "FIXED 指定保留谁，EXCLUDE 指定丢掉谁")],
    "在「品类-子类」文本表中，用 EXCLUDE 给出品类合计，并计算子类占比。", NOTE_BI)
add("BI.Tableau.筛选与交互", "能配置筛选器作用范围，并做高亮或操作驱动别的图。",
    "筛选器可以只作用当前工作表，也可以作用到数据源或相关工作表。日期筛选看的是连续范围还是离散成员。仪表板上的交互要事先定：点地图是过滤柱图，还是只高亮。",
    "1. 把地区筛选放到工作表。\n2. 选择「应用于工作表」为仪表板上的相关图。\n3. 添加一个高亮操作，而不是把所有图都过滤掉。\n4. 检查筛选后标题是否还写着「全部」。",
    "1. 地区切换同时更新销售额和利润。\n2. 点某个品类只高亮、不隐藏其他品类。",
    [("筛选只改了一张图，其他图仍是全国", "设置应用于选定工作表"), ("动作设成排除，点一下全空白", "改成筛选保留或高亮")],
    "做地区筛选，让柱状图和折线图同时变化，并说明作用范围。", NOTE_BI)
add("BI.Tableau.仪表板", "能把 2–4 张图组成可读的仪表板，并加上标题与筛选。",
    "仪表板不是图的仓库。一张板回答一个问题：例如「本月卖得怎么样」。布局用容器对齐，手机和桌面分开考虑。每张图必须有标题，筛选器放在预期位置。",
    "1. 新建仪表板，定尺寸。\n2. 放入销售额柱、月趋势线、可选的占比。\n3. 加上地区筛选与总标题。\n4. 检查对齐、图例是否重复。",
    "1. 品类销售回顾页。\n2. 给业务一周会用的单页。",
    [("十二张图挤在一页", "拆成两页或删到回答一个问题"), ("没有标题，只剩轴", "每图一句结论式标题")],
    "用柱状图和折线图做一页「品类与趋势」仪表板，包含一个地区筛选。", NOTE_BI)
add("BI.Tableau.性能优化", "能从抽取、筛选和标记数量判断工作簿为什么慢。",
    "慢通常是因为标记太多、快速筛选开得太宽、或实时连接在大表上做了高基数关系。能做抽取就先抽取；筛选尽量用上下文或数据源提取时的条件；少在视图里堆高基数维度。",
    "1. 打开性能记录，看哪一步慢。\n2. 把样例改成抽取再比较打开时间。\n3. 减少「显示所有筛选值」。\n4. 视图里不要同时放订单号这种明细维度。",
    "1. 仪表板打开超过数秒时的排查。\n2. 发布前的检查清单。",
    [("实时连着明细大表还做复杂 LOD", "先抽取或先在库里聚合"), ("一张图几万个标记", "聚合到品类/月份再可视化")],
    "列出你会检查的 4 项：连接方式、标记数、筛选、是否在库内预聚合。", NOTE_BI)
add("BI.Tableau.实战案例", "能独立完成一张从数据到仪表板的小案例。",
    "案例把前面的连接、图、计算和筛选串起来。交付物是一页板加三句结论，不是一堆未命名工作表。口径写在标题或注释里：销售额是否含退货。",
    "1. 连接样例并确认订单粒度。\n2. 做品类柱、月份线、地区筛选。\n3. 增加利润率基础计算。\n4. 拼成仪表板，写三条发现。",
    "1. 课程结业小作业。\n2. 作品集里的一页 Tableau。",
    [("只有图没有结论", "每张图用一句话写发现"), ("口径没写，销售额和财务对不上", "在板脚注明是否含退货、是否含税")],
    "完成一页仪表板：品类销售额、月趋势、地区筛选、利润率，并写 3 条结论。", NOTE_BI)
add("BI.Power BI", "能说出 Power BI 与 Tableau 的对应关系，并完成一个最小模型。",
    "Power BI 用 Power Query 清洗，用模型视图建关系，用 DAX 写度量，用报表画布排版。度量应使用 SUM 等聚合，不要把列直接丢进「隐式度量」后忘记口径。",
    """```text
销售额 = SUM(Orders[Amount])
利润率 = DIVIDE(SUM(Orders[Profit]), SUM(Orders[Amount]))
```
在模型里用订单号连接订单与明细前，先把明细聚合到订单，或接受星型模型的一对多。""",
    "1. 已有 Tableau 经验、需要迁到 Power BI。\n2. 和微软报表体系共存的团队。",
    [("在列上写行级比率再平均", "用 DIVIDE 包住两个 SUM"), ("多对多关系不处理", "加桥表或先聚合")],
    "在 Power BI 中建立订单表，写销售额与利润率两个度量，并做一个柱状图。", NOTE_BI)
add("BI.国产 BI", "能按「取数、模型、图表、权限」比较常见国产 BI，而不是背产品名。",
    "国产 BI（如 FineBI、观远、DataWind 等）大多覆盖：直连数仓、自助取数、可视化和行列权限。选型看三点：能不能复用现有口径、权限能不能到行、刷新能不能进调度。",
    "1. 确认数据源是数仓还是 Excel。\n2. 把本课的品类销售额做成一张图。\n3. 检查能否把地区筛选绑到登录人。\n4. 记录和 Tableau 术语的对应：维度/度量/筛选。",
    "1. 团队已经采购国产 BI，要把教程迁移过去。\n2. 评估是否还要单独学一套点击路径。",
    [("每个工具重写一套口径", "指标定义留在数仓，BI 只展示"), ("忽略行级权限", "地区负责人只能看自己的地区")],
    "选一个你能打开的国产 BI 或用表格模拟，列出它的「数据、图表、筛选、权限」分别对应本课哪一节。", NOTE_BI)


def render_leaf(nid: str, title: str, nav_parent: str, prev_t: str, next_t: str) -> str:
    b = BANK[nid]
    rows = "\n".join(f"| {a} | {c} |" for a, c in b["mistakes"])
    return f"""### 课前

- **目标**：{b['goal']}
- **先修**：先看上一节；样例与全平台一致。
- **样例**：{b['note']}

### 是什么

{b['what']}

### 怎么做

{b['how']}

### 用在哪

{b['where']}

### 易错对照

| 错法 | 纠正 |
|---|---|
{rows}

### 动手

{b['exercise']}

### 验收

- [ ] 能不看笔记复述本节目标
- [ ] 示例可以自己重做一遍
- [ ] 能举出一个易错并改对
- [ ] 能说出本节不该用的场景

### 导航

- 上级：`{nav_parent}`
- 上一节：{prev_t}
- 下一节：{next_t}
"""


def first_line(text: str) -> str:
    for raw in (text or "").splitlines():
        s = raw.strip().lstrip("-").strip()
        if not s or s.startswith("#") or s.startswith("|") or s.startswith("```"):
            continue
        s = s.replace("**", "")
        if len(s) > 42:
            s = s[:40] + "…"
        return s
    return "打开本节继续学习"


def render_chapter(node: dict) -> str:
    kids = node.get("children") or []
    title = node.get("title") or "本章"
    rows = []
    for i, c in enumerate(kids, 1):
        rows.append(f"| {i} | {c.get('title')} | {c.get('level') or '?'} | {first_line(c.get('content') or '')} |")
    story = " → ".join(c.get("title") or "" for c in kids)
    return f"""### 课前 · 章节导读

- **章节**：{title}
- **为什么学**：把「{title}」拆成可练习的小节，避免只记目录。
- **学完能做什么**：按顺序完成下面每一节的「动手」，并能讲清本节边界。
- **纪律**：使用全平台统一样例（订单 / 用户 / Superstore），不要每节换一套数据。

### 本节地图

| # | 节点 | 难度 | 一句话 |
|---|---|---|---|
{chr(10).join(rows)}

### 推荐顺序

```text
{story}
```

### 怎么学

1. 先看地图，知道有哪些节点。
2. 按顺序打开，每节做完「动手」再往下。
3. 用自己的表名替换样例，做一次小样本迁移。

### 验收

| 检查 | 标准 |
|---|---|
| 主路径 | 每节示例能重做 |
| 易错 | 至少能举出 2 个反例 |
| 口述 | 不看笔记讲清「{title}」解决什么 |

### 下一动

从第 1 个节点开始。本章共 **{len(kids)}** 个直接下级。
"""


def walk_apply(node, parent_title=None, siblings=None, index=0):
    kids = node.get("children") or []
    if not kids and node.get("id") in BANK:
        prev_t = siblings[index - 1]["title"] if siblings and index > 0 else "（本节起）"
        next_t = siblings[index + 1]["title"] if siblings and index + 1 < len(siblings) else "（本节止）"
        parent = parent_title or "根"
        node["content"] = render_leaf(node["id"], node.get("title"), parent, prev_t, next_t)
    elif kids and len(node.get("content") or "") < 450:
        # fill children first so blurbs are real
        for i, c in enumerate(kids):
            walk_apply(c, node.get("title"), kids, i)
        node["content"] = render_chapter(node)
        return
    for i, c in enumerate(kids):
        walk_apply(c, node.get("title"), kids, i)


def sync_file(name: str, data: dict):
    compact = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    pretty = json.dumps(data, ensure_ascii=False, indent=2)
    (KG / f"{name}.json").write_text(compact, encoding="utf-8")
    (LESSONS / f"{name}.json").write_text(pretty, encoding="utf-8")
    hub = {"sql": "hub-query.json", "bi": "hub-viz.json", "etl": "hub-etl.json", "dwh": "hub-dwh.json"}.get(name)
    if hub:
        (KG / hub).write_text(compact, encoding="utf-8")
    if name in ("sql", "bi", "etl", "dwh", "python", "database", "ml"):
        embed = KG / f"embed-{name}.js"
        embed.write_text(
            'window.__KG_EMBEDDED = window.__KG_EMBEDDED || {};\n'
            f'window.__KG_EMBEDDED["{name}"]={compact}\n',
            encoding="utf-8",
        )
    for mirror in MIRRORS:
        if not mirror.exists():
            continue
        (mirror / f"{name}.json").write_text(compact, encoding="utf-8")
        if hub:
            (mirror / hub).write_text(compact, encoding="utf-8")
        if name in ("sql", "bi", "etl", "dwh"):
            (mirror / f"embed-{name}.js").write_text(
                'window.__KG_EMBEDDED = window.__KG_EMBEDDED || {};\n'
                f'window.__KG_EMBEDDED["{name}"]={compact}\n',
                encoding="utf-8",
            )


def refresh_tutorials():
    if not TUTORIALS.exists():
        return
    data = json.loads(TUTORIALS.read_text(encoding="utf-8"))
    pages = data.get("tutorials", {}).get("pages") or []
    by_id = {p.get("tutorial_id"): p for p in pages}
    # pull enriched markdown back into tutorial pages
    for domain in ("sql", "bi"):
        tree = json.loads((KG / f"{domain}.json").read_text(encoding="utf-8"))

        def walk(n):
            page = by_id.get(n.get("id"))
            if page and not (n.get("children") or []):
                b = BANK.get(n["id"])
                if b:
                    page["content"]["learning_goal"] = b["goal"]
                    secs = page["content"].get("sections") or []
                    for s in secs:
                        if s.get("type") == "concept":
                            s["body"] = b["what"]
                        elif s.get("type") == "exercise":
                            s["question"] = b["exercise"]
                    page["content"]["lesson_markdown"] = n.get("content")
            for c in n.get("children") or []:
                walk(c)

        walk(tree)
    TUTORIALS.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    missing = []
    for name in ("sql", "bi", "python", "database", "ml", "etl", "dwh"):
        path = KG / f"{name}.json"
        tree = json.loads(path.read_text(encoding="utf-8"))
        walk_apply(tree)
        # verify bank coverage for sql/bi leaves
        if name in ("sql", "bi"):
            def leaves(n, acc=None):
                acc = acc if acc is not None else []
                if not (n.get("children") or []):
                    acc.append(n["id"])
                for c in n.get("children") or []:
                    leaves(c, acc)
                return acc
            for lid in leaves(tree):
                if lid not in BANK:
                    missing.append(lid)
        sync_file(name, tree)
        print("updated", name)
    refresh_tutorials()
    if missing:
        raise SystemExit("missing bank " + ",".join(missing))
    for html in HTMLS:
        if not html.exists():
            continue
        t = html.read_text(encoding="utf-8")
        t2 = t.replace('const KG_DATA_VER = "20260921c"', 'const KG_DATA_VER = "20260921d"')
        t2 = t2.replace('const KG_DATA_VER = "20260920b"', 'const KG_DATA_VER = "20260921d"')
        t2 = t2.replace('const KG_DATA_VER = "20260918a"', 'const KG_DATA_VER = "20260921d"')
        html.write_text(t2, encoding="utf-8")
    # stats
    sql = json.loads((KG / "sql.json").read_text(encoding="utf-8"))

    def lens(n, acc=None):
        acc = acc if acc is not None else []
        acc.append((n["id"], len(n.get("content") or ""), bool(n.get("children"))))
        for c in n.get("children") or []:
            lens(c, acc)
        return acc

    rows = lens(sql)
    print("sql min", min(r[1] for r in rows), "leaves", min(r[1] for r in rows if not r[2]))


if __name__ == "__main__":
    main()
