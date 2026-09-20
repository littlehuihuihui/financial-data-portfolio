# -*- coding: utf-8 -*-
"""按 SQL 的「章节 → 子课」框架，为 SQL 三个空章节与 BI 的 Power BI / 国产 BI 补充子课。"""
import json, re, os

KG = r'D:\cursor\数据学习平台\kg-data'

def load_embed(name):
    txt = open(os.path.join(KG, name), encoding='utf-8').read()
    m = re.search(r'(window\.__KG_EMBEDDED\[\s*"[^"]+"\s*\]\s*=\s*)(\{.*\})(\s*;?\s*)$', txt, re.S)
    return json.loads(m.group(2)), m.group(1), m.group(3)

def save_embed(name, tree, pre, post):
    open(os.path.join(KG, name), 'w', encoding='utf-8').write(pre + json.dumps(tree, ensure_ascii=False) + post)

def find(node, nid):
    if node.get('id') == nid:
        return node
    for c in node.get('children') or []:
        r = find(c, nid)
        if r:
            return r
    return None

BT = "```"

def lesson_md(title, goal, what, syntax, steps, errors, drill, parent, prev, nxt, lang="sql"):
    err_rows = "\n".join("| %s | %s |" % (w, f) for w, f in errors)
    step_rows = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(steps))
    return (
        "### 课前\n\n- **目标**：%s\n\n"
        "### %s\n\n%s\n\n"
        "### 语法示例\n\n%s%s\n%s\n%s\n\n"
        "### 练习步骤\n\n%s\n\n"
        "### 常见错误\n\n| 错法 | 纠正 |\n|---|---|\n%s\n\n"
        "### 动手\n\n%s\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：`%s`\n- 下一节：`%s`\n"
    ) % (goal, title, what, BT, lang, syntax, BT, step_rows, err_rows, drill, parent, prev, nxt)

def chapter_md(title, root, nodes):
    return ("### %s · 章节导读\n\n**路径**：%s / %s\n\n**本章节点**：%s\n\n点下方节点继续学习。\n"
            % (title, root, title, " · ".join(nodes)))

def leaf(nid, title, level, content):
    return {"id": nid, "title": title, "level": level, "content": content, "children": []}

# ---------------- SQL 三个空章节 ----------------
SQL_SPEC = [
    ("SQL.数据定义", "数据定义", [
        ("CREATE TABLE 建表", "??", "能按业务需求写 CREATE TABLE，选对类型与主键",
         "DDL 用 CREATE TABLE 定义表结构：列、类型、主键、默认值。类型决定精度与存储。",
         "CREATE TABLE daily_gmv (\n  dt  DATE PRIMARY KEY,\n  gmv DECIMAL(12,2) NOT NULL DEFAULT 0\n);",
         ["列出字段、类型与是否可空", "确定主键（业务键或代理键）", "执行建表并用 \\d 查看结构"],
         [("金额用 FLOAT", "金额用 DECIMAL 保证精确"), ("无主键", "明确主键防重复行")],
         "创建 orders_stage 表：order_id 主键、user_id 非空、amount DECIMAL(12,2)、status VARCHAR(16)。"),
        ("约束与类型对齐", "??", "能用 NOT NULL/CHECK/UNIQUE 守住数据质量",
         "约束是数据库层的质量门禁：非空、唯一、范围、外键。",
         "CREATE TABLE users (\n  user_id INT PRIMARY KEY,\n  email   VARCHAR(64) UNIQUE,\n  age     INT CHECK (age >= 0)\n);",
         ["为必填列加 NOT NULL", "用 CHECK 限制取值范围", "插入非法数据验证约束生效"],
         [("只在应用层校验", "关键约束下沉到数据库"), ("外键滥用影响写入", "按需取舍外键")],
         "为 orders 增加 CHECK(amount >= 0) 并插入 -1 观察报错。"),
        ("ALTER 变更与视图", "??", "能安全地加列/改类型，并用视图封装常用查询",
         "ALTER TABLE 修改结构；视图把复杂查询保存为虚拟表。",
         "ALTER TABLE orders ADD COLUMN channel VARCHAR(16);\nCREATE VIEW v_paid AS\nSELECT * FROM orders WHERE status='paid';",
         ["加列选择默认值避免重写", "在从库先验证改表", "用视图封装口径"],
         [("高峰期直接改大表", "评估锁与复制延迟"), ("视图嵌套过深", "保持视图扁平可读")],
         "给 orders 加 channel 列，并建 v_paid 视图只含已支付订单。"),
    ]),
    ("SQL.性能优化", "性能优化", [
        ("索引设计原则", "??", "能按查询模式设计复合索引并理解最左前缀",
         "索引加速定位；复合索引的列顺序决定能否命中。",
         "CREATE INDEX idx_orders_user_dt\nON orders(user_id, created_at);",
         ["列出高频 WHERE/JOIN/ORDER 列", "等值列在前、范围列在后", "用 EXPLAIN 验证命中索引"],
         [("对每列都建单列索引", "合并为高价值复合索引"), ("索引列套函数", "改写为范围比较")],
         "为「按 user_id + created_at 范围查订单」设计索引并说明列顺序。"),
        ("读懂 EXPLAIN", "??", "能读基础执行计划，识别全表扫描与估算偏差",
         "EXPLAIN 展示优化器如何扫描、连接与聚合，是调优的起点。",
         "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders\nWHERE user_id = 88;",
         ["对慢 SQL 执行 EXPLAIN ANALYZE", "关注 Scan 类型与实际行数", "检查缓冲命中与估算偏差"],
         [("只看耗时不看计划", "从最贵节点定位"), ("忽略统计信息过期", "定期 ANALYZE")],
         "对一条按 user_id 过滤的查询做 EXPLAIN，判断是否走索引。"),
        ("慢查询改写", "??", "能通过谓词下推、去函数化与预聚合加快查询",
         "改写往往比加硬件更有效：减少扫描行、避免大结果集再过滤。",
         "-- 函数包列导致无法用索引\nWHERE DATE(created_at) = '2024-01-01'\n-- 改为范围比较\nWHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'",
         ["定位最贵节点", "改写谓词让索引可用", "对比改写前后计划与耗时"],
         [("盲目加索引", "先改写与看计划"), ("过早优化", "以度量证据驱动")],
         "把一条用函数包列过滤的慢查询改写为范围比较并对比计划。"),
    ]),
    ("SQL.事务与安全", "事务与安全", [
        ("事务与 ACID", "??", "理解事务原子性并会写 BEGIN/COMMIT/ROLLBACK",
         "事务把多步读写绑成原子单元，保证一致性。",
         "BEGIN;\nUPDATE accounts SET bal = bal - 100 WHERE id = 1;\nUPDATE accounts SET bal = bal + 100 WHERE id = 2;\nCOMMIT;",
         ["把转账步骤放入事务", "出错时 ROLLBACK", "保持事务短小"],
         [("长事务锁表", "缩小事务范围"), ("忘记提交", "确认 COMMIT/ROLLBACK")],
         "写一个转账事务，并模拟余额不足时回滚。"),
        ("隔离级别直觉", "??", "能区分脏读/不可重复读/幻读并选择合适隔离级别",
         "隔离级别决定并发事务之间的可见性。",
         "SHOW transaction_isolation;\nSET TRANSACTION ISOLATION LEVEL REPEATABLE READ;",
         ["理解三种读异常的成因", "按一致性要求选择级别", "避免在事务内做远程调用"],
         [("一刀切用串行化", "按需权衡一致性与并发"), ("忽略锁等待", "监控锁与死锁")],
         "说明 READ COMMITTED 与 REPEATABLE READ 在一个转账场景下的差异。"),
        ("权限与注入防护", "??", "能按最小权限授权并理解参数化查询防注入",
         "最小权限原则降低风险；参数化查询避免 SQL 注入。",
         "GRANT SELECT ON orders TO analyst;\n-- 应用侧：\nSELECT * FROM orders WHERE user_id = ?;",
         ["为不同角色分配最小权限", "禁止应用层拼接 SQL", "用绑定参数替代字符串拼接"],
         [("应用用高权限账号", "分析账号只读"), ("直接拼接用户输入", "使用参数化/预编译")],
         "给出只读分析账号授权语句，并说明为何用 `?` 占位符防注入。"),
    ]),
]

# ---------------- BI：Power BI 与 国产 BI ----------------
BI_SPEC = [
    ("BI.Power BI", "Power BI", [
        ("入门与界面", "??", "熟悉 Power BI Desktop 界面、导入数据与基础报表流程",
         "Power BI 用 Power Query 取数、用模型与 DAX 分析、用画布出图。",
         "# 连接数据\nHome > Get data > Text/CSV 或 SQL Server\n# 关系视图建立模型关系",
         ["导入样例表 users/orders", "在关系视图建立 user_id 关系", "拖动字段生成表格与图表"],
         [("每张表各自出图", "先建关系模型"), ("数据源堆叠不清理", "先在 Power Query 清洗")],
         "导入 orders 并生成按日期的 GMV 折线。"),
        ("数据建模", "??", "能设计星型模型并管理关系与层次",
         "模型是 Power BI 性能与正确性的关键：事实表 + 维度表 + 关系。",
         "-- 关系：orders[user_id] -> users[user_id] (1:*)\n-- 日期表标记为 Date table",
         ["建立事实/维度关系", "创建日期表并标记", "设置行列级别安全的前置模型"],
         [("雪花过度", "优先星型"), ("关系方向错误", "明确一对多方向")],
         "为 orders 建 users、日期两个维度关系并说明基数。"),
        ("DAX 度量", "??", "能用 DAX 写基础度量与时间智能",
         "DAX 是 Power BI 的表达式语言，度量值在查询时按上下文计算。",
         "Paid GMV = CALCULATE(SUM(orders[amount]), orders[status] = \"paid\")\nYTD GMV = TOTALYTD([Paid GMV], 'Date'[Date])",
         ["写 SUM/COUNT 基础度量", "用 CALCULATE 改筛选上下文", "用时间智能函数做同比/累计"],
         [("用计算列替代度量", "优先用度量"), ("忽略筛选上下文", "理解行/筛选上下文")],
         "写一个 Paid GMV 度量并做按月累计。"),
        ("可视化与图表", "??", "能按分析目的选择合适图表并优化视觉编码",
         "不同图表承载不同信息：趋势、对比、构成、分布。",
         "// 折线=趋势，柱状=对比，饼/环=构成，散点=相关\n// 位置与长度优先于面积与颜色",
         ["按问题选图表类型", "对数据排序突出重点", "减少装饰与冗余颜色"],
         [("三维饼图", "用条形/环形更易比较"), ("颜色过多", "控制系列数量")],
         "用折线+柱状组合展示 GMV 与订单数趋势。"),
        ("仪表板与交互", "??", "能组合多视觉对象并用切片器实现联动下钻",
         "仪表板通过切片器、交叉筛选实现一屏一主题的交互分析。",
         "// 添加 Slicer(日期/渠道)，设置 Edit interactions\n// 使用 drill-through 下钻到明细",
         ["规划一屏一主题布局", "加切片器与联动", "配置下钻与钻取页"],
         [("视觉对象过多", "聚焦北极星指标"), ("缺少筛选", "提供切片器与联动")],
         "做一个含日期切片器、联动卡片与趋势图的仪表板。"),
        ("发布与权限", "??", "能发布到服务并配置工作区与行级安全 RLS",
         "发布后通过工作区、应用与 RLS 控制访问。",
         "// Publish to Power BI Service\n// Model > Manage roles: [region] = USERPRINCIPALNAME()",
         ["发布到工作区", "创建应用分发", "配置角色实现行级安全"],
         [("全量开放", "按角色最小授权"), ("忘记刷新计划", "设置数据集刷新")],
         "为「仅看本区域」配置一条 RLS 角色规则。"),
    ]),
    ("BI.国产 BI", "国产 BI", [
        ("FineBI 自助分析", "??", "能用 FineBI 建公共数据集与自助仪表板",
         "帆软 FineBI 面向业务自助分析，常与 FineReport 搭配。",
         "// 管理员接入数仓 -> 发布公共数据 -> 分析师做仪表板\n// 组件联动与行列权限",
         ["接入数仓发布公共数据集", "拖拽做可视化与仪表板", "配置组件联动与权限"],
         [("在 BI 里堆业务逻辑", "口径沉到仓/dbt"), ("权限全开", "按行列授权")],
         "用 FineBI 做一个按渠道的 GMV 仪表板并配置联动。"),
        ("FineReport 固定报表", "??", "能用 FineReport 设计中国式固定报表与填报",
         "FineReport 擅长像素级套打、填报与导出打印。",
         "<!-- 模板 + 参数 SQL -->\nSELECT * FROM ads_finance WHERE month = '${month}'",
         ["设计器建模板绑数据集", "配置参数与单元格扩展", "预览并导出 Excel/PDF"],
         [("把报表逻辑写死", "模板与数据分离"), ("填报无校验", "加校验与权限")],
         "设计一张按月份参数的财务套表并支持导出。"),
        ("Datart 开源可视化", "??", "能用 Datart 建 SQL 视图与仪表板并私有化部署",
         "Datart 是开源可视化平台，支持多数据源与 SQL 视图。",
         "-- 视图 SQL 示例\nSELECT dt, region, SUM(gmv) gmv FROM ads_gmv GROUP BY 1,2",
         ["配置 JDBC 数据源", "写 SQL 视图", "组仪表板并分享"],
         [("直接连生产库", "连只读/数仓"), ("视图无参数", "用参数化视图")],
         "用 Datart 建一个按 dt 汇总 GMV 的视图并做柱状图。"),
        ("永洪 BI", "??", "了解永洪 BI 的敏捷分析与大屏场景",
         "永洪 BI 面向国内企业敏捷分析与可视化大屏。",
         "// 建议：仓内先出 ADS/指标表，BI 做展示与联动",
         ["接入仓/大数据源", "模型先行做数据集", "做分析页与大屏"],
         [("大屏与分析混用", "场景分离"), ("BI 内堆重逻辑", "指标下沉")],
         "描述永洪 BI 在大屏与分析两种场景的侧重点。"),
        ("国产 BI 选型对比", "???", "能在 FineBI/FineReport/Datart/永洪 间按场景选型",
         "选型看交付、报表复杂度、开源可控与信创要求。",
         "// 自助分析 -> FineBI/永洪\n// 中国式固定报表/填报 -> FineReport\n// 开源私有化 -> Datart/Superset/Metabase",
         ["列出需求：自助/固定/开源/信创", "对比交付与生态", "小场景 POC 验证"],
         [("唯功能论", "结合交付与维护成本"), ("忽略数据治理", "与指标层协同")],
         "给出一个「财务固定报表 + 业务自助」场景的组合选型建议。"),
    ]),
]

def build_chapter(root_title, chap_id, chap_title, lessons):
    node = find_cur  # placeholder
    return lessons

# 写入 SQL
tree, pre, post = load_embed('embed-sql.js')
for chap_id, chap_title, lessons in SQL_SPEC:
    ch = find(tree, chap_id)
    nodes_titles = [l[0] for l in lessons]
    ch['content'] = chapter_md(chap_title, 'SQL', nodes_titles)
    ch.pop('lessonParent', None)
    kids = []
    for i, (title, lvl, goal, what, syntax, steps, errors, drill) in enumerate(lessons):
        nid = chap_id + '.' + title
        prev = chap_id + '.' + lessons[i - 1][0] if i > 0 else "None"
        nxt = chap_id + '.' + lessons[i + 1][0] if i + 1 < len(lessons) else "None"
        md = lesson_md(title, goal, what, syntax, steps, errors, drill, chap_id, prev, nxt, "sql")
        kids.append(leaf(nid, title, lvl, md))
    ch['children'] = kids
    ch['lessonParent'] = True
save_embed('embed-sql.js', tree, pre, post)

# hub-query.json（与 embed 同步）
open(os.path.join(KG, 'hub-query.json'), 'w', encoding='utf-8').write(json.dumps(tree, ensure_ascii=False))

# 写入 BI
btree, bpre, bpost = load_embed('embed-bi.js')
for chap_id, chap_title, lessons in BI_SPEC:
    ch = find(btree, chap_id)
    nodes_titles = [l[0] for l in lessons]
    ch['content'] = chapter_md(chap_title, 'BI', nodes_titles)
    ch.pop('lessonParent', None)
    kids = []
    for i, (title, lvl, goal, what, syntax, steps, errors, drill) in enumerate(lessons):
        nid = chap_id + '.' + title
        prev = chap_id + '.' + lessons[i - 1][0] if i > 0 else "None"
        nxt = chap_id + '.' + lessons[i + 1][0] if i + 1 < len(lessons) else "None"
        md = lesson_md(title, goal, what, syntax, steps, errors, drill, chap_id, prev, nxt, "sql")
        kids.append(leaf(nid, title, lvl, md))
    ch['children'] = kids
    ch['lessonParent'] = True
save_embed('embed-bi.js', btree, bpre, bpost)
open(os.path.join(KG, 'hub-viz.json'), 'w', encoding='utf-8').write(json.dumps(btree, ensure_ascii=False))

print("SQL chapters:", [c[0] for c in SQL_SPEC])
print("BI chapters:", [c[0] for c in BI_SPEC])
print("done")