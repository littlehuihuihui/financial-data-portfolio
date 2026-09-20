# -*- coding: utf-8 -*-
"""完善 SQL 与 BI(Tableau) 已有子课的教程内容（统一课模板，embed 与 hub 同步）。"""
import json, re, os

KG = r'D:\cursor\数据学习平台\kg-data'
INIT = 'window.__KG_EMBEDDED=window.__KG_EMBEDDED||{};\n'
BT = "```"

def read_tree(name):
    s = open(os.path.join(KG, name), encoding='utf-8').read()
    return json.loads(re.search(r'window\.__KG_EMBEDDED\["[^"]+"\]\s*=\s*(\{.*\})\s*;?\s*$', s, re.S).group(1))

def write_embed(name, key, tree):
    open(os.path.join(KG, name), 'w', encoding='utf-8').write(
        INIT + 'window.__KG_EMBEDDED["%s"]=%s;\n' % (key, json.dumps(tree, ensure_ascii=False)))

def find(n, i):
    if n.get('id') == i:
        return n
    for c in n.get('children') or []:
        r = find(c, i)
        if r:
            return r
    return None

def md(title, goal, what, syntax, lang, steps, errors, drill, parent, prev, nxt):
    errs = "\n".join("| %s | %s |" % e for e in errors)
    stp = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(steps))
    return ("### 课前\n\n- **目标**：%s\n\n### %s\n\n%s\n\n### 语法示例\n\n%s%s\n%s\n%s\n\n"
            "### 练习步骤\n\n%s\n\n### 常见错误\n\n| 错法 | 纠正 |\n|---|---|\n%s\n\n"
            "### 动手\n\n%s\n\n### 导航\n\n- 上级：`%s`\n- 上一节：`%s`\n- 下一节：`%s`\n"
            % (goal, title, what, BT, lang, syntax, BT, stp, errs, drill, parent, prev, nxt))

# ===== SQL 已有子课：补全为完整讲义 =====
# (id, 上级, 上一节, 下一节, (目标, 概念, 语法, 步骤[], 错误[], 动手))
SQL = [
 ("SQL.基础查询.SELECT", "SQL.基础查询", "None", "SQL.基础查询.WHERE",
  ("能写投影、别名、去重与计算的 SELECT，并理解结果集",
   "SELECT 描述要返回的列与表达式；结果是与表同构的结果集，列由投影决定。",
   "SELECT order_id, amount AS gmv, amount * 0.9 AS net\nFROM orders\nWHERE status='paid'\nLIMIT 100;",
   ["先写 FROM 明确数据来源", "列出需要的列并起可读别名", "避免 SELECT *，用 DISTINCT 仅在需要去重时"],
   [("SELECT * 滥用", "显式列名，减少 IO 与耦合"), ("别名写了中文/空格", "别名用下划线或驼峰"),
    ("用 DISTINCT 掩盖重复", "先查重复根因再决定是否去重")],
   "查询 orders：order_id、amount 别名 gmv、金额的九折 net，仅已支付。")),
 ("SQL.基础查询.WHERE", "SQL.基础查询", "SQL.基础查询.SELECT", "SQL.基础查询.ORDER BY",
  ("能组合多条件过滤，正确处理 NULL 与区间",
   "WHERE 在分组前过滤明细；AND/OR/NOT 组合，NULL 需用 IS NULL 判断。",
   "SELECT *\nFROM orders\nWHERE status = 'paid'\n  AND amount BETWEEN 100 AND 500\n  AND deleted_at IS NULL;",
   ["按粒度写出主过滤条件", "区间用 BETWEEN 或 >=/<", "NULL 判断用 IS NULL / IS NOT NULL"],
   [("写 amount = NULL", "空值用 IS NULL"), ("忘了括号导致 AND/OR 优先级错", "用括号显式分组"),
    ("对索引列包函数", "改写为范围比较")],
   "查出 status=paid、amount 在 100~500、且未删除的订单。")),
 ("SQL.基础查询.ORDER BY", "SQL.基础查询", "SQL.基础查询.WHERE", "SQL.基础查询.LIMIT",
  ("能按一列或多列排序，并理解与 LIMIT 的关系",
   "ORDER BY 决定结果顺序；多列时前一列相同时按后一列排序。",
   "SELECT order_id, amount, created_at\nFROM orders\nORDER BY created_at DESC, amount DESC NULLS LAST;",
   ["确定唯一且稳定的排序键", "必要时加次序键避免同值乱序", "配合 LIMIT 才谈得上 TopN"],
   [("ORDER BY 随机键", "用业务稳定键"), ("忽略了 NULL 排序位置", "用 NULLS FIRST/LAST 明确"),
    ("对函数结果排序无法用索引", "尽量对原始列排序")],
   "按创建时间倒序、金额倒序列出订单（NULL 金额排最后）。")),
 ("SQL.基础查询.LIMIT", "SQL.基础查询", "SQL.基础查询.ORDER BY", "SQL.多表操作.JOIN",
  ("能用 LIMIT/OFFSET 做分页或 TopN，并理解深分页代价",
   "LIMIT 截断返回行数；没有 ORDER BY 时「前 N」没有定义。",
   "SELECT *\nFROM orders\nORDER BY amount DESC\nLIMIT 10 OFFSET 20;",
   ["先排序再截断", "TopN 用 LIMIT，分页用 LIMIT+OFFSET", "深分页改用键集分页（WHERE id > last）"],
   [("LIMIT 无 ORDER BY", "先排序再截断"), ("大 OFFSET 深分页很慢", "改用键集/游标分页"),
    ("把 LIMIT 当过滤条件", "LIMIT 只截断结果")],
   "取金额最高的 10 笔订单；再写一个键集分页示例。")),
 ("SQL.多表操作.JOIN", "SQL.多表操作", "SQL.基础查询.LIMIT", "SQL.多表操作.子查询",
  ("能正确使用 INNER/LEFT JOIN 并避免粒度爆炸",
   "JOIN 按键把多表横向拼接；连接类型决定匹配不上的行如何保留。",
   "SELECT u.user_id, COUNT(*) cnt, SUM(o.amount) gmv\nFROM users u\nLEFT JOIN orders o\n  ON o.user_id = u.user_id AND o.status='paid'\nGROUP BY u.user_id;",
   ["先确认两表粒度与关联键", "先用 INNER JOIN 验证匹配行", "改 LEFT 保留未匹配；过滤条件放 ON 以免退化为 INNER"],
   [("一对多先 JOIN 再 SUM 头表金额翻倍", "先按键聚合一侧再关联"), ("ON 写进 WHERE 使 LEFT 变 INNER", "保留侧的过滤放 ON"),
    ("用逗号交叉连接", "显式 JOIN ... ON")],
   "统计每个用户的已支付订单数与 GMV，保留无订单用户。")),
 ("SQL.多表操作.子查询", "SQL.多表操作", "SQL.多表操作.JOIN", "SQL.多表操作.UNION",
  ("能写标量子查询、IN/EXISTS 与派生表，并判断何时改 JOIN",
   "子查询把查询嵌套进过滤、计算列或派生表；EXISTS 用于半连接判断存在。",
   "SELECT *\nFROM orders o\nWHERE EXISTS (\n  SELECT 1 FROM users u\n  WHERE u.user_id = o.user_id AND u.city='上海'\n);",
   ["用 IN/EXISTS 过滤集合", "标量子查询注意只返回一行", "相关子查询确认关联键有索引"],
   [("子查询返回多行用于标量位置", "改用 IN/EXISTS 或聚合"), ("相关子查询无索引导致慢", "检查计划与关联键"),
    ("NOT IN 遇 NULL 结果为空", "改用 NOT EXISTS")],
   "找出下单次数高于全体平均的用户。")),
 ("SQL.多表操作.UNION", "SQL.多表操作", "SQL.多表操作.子查询", "SQL.聚合分析.GROUP BY",
  ("能区分 UNION 与 UNION ALL 并保证列类型对齐",
   "UNION 纵向合并结果集：UNION 去重（有成本），UNION ALL 保留重复。",
   "SELECT user_id, 'paid' AS src FROM orders WHERE status='paid'\nUNION ALL\nSELECT user_id, 'cancelled' FROM orders WHERE status='cancelled';",
   ["两段列数与类型对齐", "能不去重就用 ALL", "合并后如需排序放最后统一 ORDER BY"],
   [("列顺序不一致导致错位", "显式列并注释对齐"), ("大结果误用 UNION 去重很慢", "优先 UNION ALL"),
    ("在分支里写 ORDER BY", "排序放到最外层")],
   "合并「已支付用户」与「取消用户」，分别用 UNION 与 UNION ALL 对比行数。")),
 ("SQL.聚合分析.GROUP BY", "SQL.聚合分析", "SQL.多表操作.UNION", "SQL.聚合分析.HAVING",
  ("能按键聚合指标，理解 SELECT 与 GROUP BY 对齐规则",
   "GROUP BY 按键折叠行，并对组内做 COUNT/SUM/AVG 等聚合。",
   "SELECT status, COUNT(*) cnt, SUM(COALESCE(amount,0)) total\nFROM orders\nGROUP BY status;",
   ["先想清分组键（粒度）", "SELECT 的非聚合列必须出现在 GROUP BY", "用 COALESCE 处理空值求和"],
   [("非聚合列未出现在 GROUP BY", "严格模式会报错"), ("COUNT(amount) 当订单数", "订单数用 COUNT(*)"),
    ("分组键含高基数列导致爆结果", "收敛维度或先过滤")],
   "按 status 分组统计订单数与金额合计。")),
 ("SQL.聚合分析.HAVING", "SQL.聚合分析", "SQL.聚合分析.GROUP BY", "SQL.聚合分析.窗口函数",
  ("能区分 WHERE 与 HAVING，对聚合结果再过滤",
   "WHERE 在分组前过滤明细；HAVING 在分组后过滤聚合结果。",
   "SELECT user_id, SUM(amount) gmv\nFROM orders\nWHERE status='paid'\nGROUP BY user_id\nHAVING SUM(amount) >= 200;",
   ["明细条件写 WHERE", "聚合条件写 HAVING", "对比把条件移入 WHERE 是否等价"],
   [("在 WHERE 里写 SUM()", "聚合条件用 HAVING"), ("HAVING 过滤明细列", "先理解执行顺序"),
    ("HAVING 条件无索引可用", "尽量把可下推条件放 WHERE")],
   "找出支付金额合计 ≥ 200 的用户。")),
 ("SQL.聚合分析.窗口函数", "SQL.聚合分析", "SQL.聚合分析.HAVING", "SQL.数据定义",
  ("能用 ROW_NUMBER/SUM() OVER 做编号与累计，不塌缩行",
   "窗口函数在保留明细行的同时做分区排序或累计聚合。",
   "SELECT order_id, user_id, amount,\n  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) rn,\n  SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at) running_gmv\nFROM orders;",
   ["用 PARTITION BY 分组、ORDER BY 定序", "用 FRAME 控制累计范围", "先过滤再窗口以减小排序集"],
   [("窗口与 GROUP BY 混用报错", "先派生表再聚合"), ("误解默认帧范围", "查引擎默认窗口"),
    ("窗口前不过滤导致大排序", "先 WHERE 再开窗")],
   "取出每个用户最近一笔订单（使用 ROW_NUMBER）。")),
]

# ===== BI Tableau 已有子课：补全 =====
BI = [
 ("BI.Tableau.图表制作.柱状图", "BI.Tableau.图表制作", "None", "BI.Tableau.图表制作.折线图",
  ("能用柱状图做类别对比并排序突出重点",
   "柱状图用长度编码比较类别；横放条形图更适合长标签。",
   "// 列：Category(地区)  行：SUM(GMV)\n// 按 GMV 降序排序，Top N 用筛选", "text",
   ["把维度放列、度量放行", "按度量降序排序", "限制 Top N 减少噪声"],
   [("用饼图比较类别", "类别多时用柱状/条形"), ("颜色过多", "用单一色+高亮")],
   "用柱状图对比各渠道 GMV 并降序排列。")),
 ("BI.Tableau.图表制作.折线图", "BI.Tableau.图表制作", "BI.Tableau.图表制作.柱状图", "BI.Tableau.图表制作.饼图",
  ("能用折线图看趋势并加同比",
   "折线图用位置编码随时间变化，适合连续趋势。",
   "// 列：DATE(created_at)（连续） 行：SUM(amount)\n// 右键日期>月，双轴加同比", "text",
   ["把日期设为连续放列", "按合适粒度聚合（日/周/月）", "加同比/环比参考线"],
   [("日期被离散化", "用连续日期轴"), ("系列过多", "限制对比系列数")],
   "画每日 GMV 折线，并加一条 7 日均线。")),
 ("BI.Tableau.图表制作.饼图", "BI.Tableau.图表制作", "BI.Tableau.图表制作.折线图", "BI.Tableau.图表制作.环形图",
  ("能用饼图表达构成，但避免过多分片",
   "饼图用角度编码占比，分片多时难以比较。",
   "// 标记卡选「饼图」，颜色=类别，角度=SUM(占比)", "text",
   ["类别控制在 5 个以内", "其余合并为「其他」", "标签显示百分比"],
   [("十几片饼图", "改用条形图"), ("三维饼图", "用平面饼/环")],
   "用饼图展示各渠道 GMV 占比（≤5 类）。")),
 ("BI.Tableau.图表制作.环形图", "BI.Tableau.图表制作", "BI.Tableau.图表制作.饼图", "BI.Tableau.图表制作.双轴组合图",
  ("能用环形图做占比并留中心放 KPI",
   "环形图是空心饼图，中心可放总量 KPI，视觉更轻。",
   "// 双轴：两个饼图，其中一个用白色圆覆盖成环\n// 中心用文本放置合计", "text",
   ["用双轴叠加制作圆环", "中心放置总额文本", "颜色与图例对齐"],
   [("环太细", "控制内圆比例"), ("中心信息过多", "只放一个核心 KPI")],
   "做一个渠道占比环形图，中心显示 GMV 合计。")),
 ("BI.Tableau.图表制作.双轴组合图", "BI.Tableau.图表制作", "BI.Tableau.图表制作.环形图", "BI.Tableau.图表制作.热力图",
  ("能用双轴组合图同屏对比量级不同的指标",
   "双轴把柱状与折线叠加，用于 GMV 与订单数这类量级不同的指标。",
   "// 行：SUM(amount) 与 COUNTD(order_id)\n// 右键第二轴 > Dual Axis，设置同步轴开关", "text",
   ["把两个度量放到行", "设为双轴并调同步轴", "用颜色区分两类标记"],
   [("量级差异误判", "按需关闭同步轴"), ("双轴误读", "图例与单位标注清楚")],
   "用双轴展示 GMV 柱 + 订单数折线。")),
 ("BI.Tableau.图表制作.热力图", "BI.Tableau.图表制作", "BI.Tableau.图表制作.双轴组合图", "BI.Tableau.计算.基础计算",
  ("能用热力图展示二维矩阵的强度分布",
   "热力图用颜色深浅编码数值，适合时段×类别等矩阵。",
   "// 列：星期  行：小时  颜色：AVG(订单量)\n// 或做留存队列热力图", "text",
   ["确定两个维度构成矩阵", "颜色用连续色阶", "加数值标签便于读数"],
   [("色阶对比不足", "用发散/顺序色阶"), ("格子过多", "聚合或缩小维度")],
   "做「星期×小时」订单量热力图。")),
 ("BI.Tableau.计算.基础计算", "BI.Tableau.计算", "BI.Tableau.图表制作.热力图", "BI.Tableau.计算.表计算",
  ("能创建行级/聚合与逻辑计算字段",
   "基础计算分维度/度量级：行级用明细字段，聚合用 SUM/AVG 等。",
   "// Gross Margin = [Revenue] - [Cost]\n// Status CN = IF [status]='paid' THEN '已付' ELSE '其他' END", "text",
   ["创建行级计算字段", "创建逻辑计算字段", "在视图中使用并检查聚合"],
   [("行级与聚合混用报错", "区分明细/聚合"), ("硬编码分类", "用 IF/CASE 规范化")],
   "创建「已付/未付」分类字段并用于筛选。")),
 ("BI.Tableau.计算.表计算", "BI.Tableau.计算", "BI.Tableau.计算.基础计算", "BI.Tableau.计算.LOD",
  ("能用表计算做占比、排名与同比",
   "表计算在查询结果上二次计算，依赖「计算依据」方向。",
   "// 占比 = SUM([GMV]) / TOTAL(SUM([GMV]))\n// 排名 = RANK(SUM([GMV]))；同比 = (本期-上期)/上期", "text",
   ["创建占比表计算", "设置计算依据（表/分区）", "做同比与排名"],
   [("忽略计算依据", "先选方向再算"), ("同比分母为 0", "用 IFNULL/ZN 保护")],
   "计算各渠道 GMV 占比并排序。")),
 ("BI.Tableau.计算.LOD.FIXED", "BI.Tableau.计算.LOD", "None", "BI.Tableau.计算.LOD.INCLUDE",
  ("能用 FIXED 在指定维度上固定计算，脱离视图粒度",
   "FIXED 忽略视图维度，按声明的维度计算，常用于占比分母。",
   "// 渠道总额 = {FIXED [channel]: SUM([GMV])}\n// 店内占比 = SUM([GMV]) / [渠道总额]", "text",
   ["声明固定维度", "用其做占比分母", "对比使用后的粒度变化"],
   [("误以为 FIXED 受筛选影响", "FIXED 在维度筛选之前计算"), ("滥用导致性能差", "按需使用")],
   "用 FIXED 计算各渠道总额并求单店占比。")),
 ("BI.Tableau.计算.LOD.INCLUDE", "BI.Tableau.计算.LOD", "BI.Tableau.计算.LOD.FIXED", "BI.Tableau.计算.LOD.EXCLUDE",
  ("能用 INCLUDE 在视图粒度上再增加维度计算",
   "INCLUDE 在现有视图维度基础上额外加入指定维度。",
   "// 每店日均 = {INCLUDE [order_id]: SUM([amount])} 后再 AVG", "text",
   ["在视图粒度上加入更多维度", "用于均值/去重类计算", "对比 FIXED 的结果差异"],
   [("与视图粒度关系不清", "先看视图维度"), ("多层 LOD 嵌套难读", "拆分为多个字段")],
   "用 INCLUDE 计算「每订单金额」再求平均。")),
 ("BI.Tableau.计算.LOD.EXCLUDE", "BI.Tableau.计算.LOD", "BI.Tableau.计算.LOD.INCLUDE", "None",
  ("能用 EXCLUDE 从视图粒度中排除某些维度",
   "EXCLUDE 在计算时排除指定维度，得到更粗粒度的值。",
   "// 忽略子类别：{EXCLUDE [sub_category]: SUM([sales])}", "text",
   ["从视图维度里排除目标维度", "用于对比粗/细粒度", "配合占比使用"],
   [("与 FIXED 混淆", "EXCLUDE 随视图维度变化"), ("结果不符合预期", "检查视图维度")],
   "用 EXCLUDE 计算「忽略子类别的销售额」并与视图对比。")),
]

st = read_tree('embed-sql.js')
for t in SQL:
    nid, parent, prev, nxt, body = t
    n = find(st, nid)
    goal, what, syntax, steps, errors, drill = body
    n['content'] = md(n['title'], goal, what, syntax, 'sql', steps, errors, drill, parent, prev, nxt)
write_embed('embed-sql.js', 'sql', st)
open(os.path.join(KG, 'hub-query.json'), 'w', encoding='utf-8').write(json.dumps(st, ensure_ascii=False))

bt = read_tree('embed-bi.js')
for t in BI:
    nid, parent, prev, nxt, body = t
    n = find(bt, nid)
    n['content'] = md(n['title'], *body, parent, prev, nxt)
write_embed('embed-bi.js', 'bi', bt)
open(os.path.join(KG, 'hub-viz.json'), 'w', encoding='utf-8').write(json.dumps(bt, ensure_ascii=False))

print('SQL polished:', len(SQL), 'BI polished:', len(BI))
print('done')