# -*- coding: utf-8 -*-
"""修复 embed 初始化行，并完整补齐 BI.Tableau 教程（章节 → 子课）。"""
import json, re, os

KG = r'D:\cursor\数据学习平台\kg-data'
INIT = 'window.__KG_EMBEDDED=window.__KG_EMBEDDED||{};\n'

def read_tree(name):
    txt = open(os.path.join(KG, name), encoding='utf-8').read()
    m = re.search(r'(\{.*\})\s*;?\s*$', txt, re.S)
    return json.loads(m.group(1))

def write_embed(name, key, tree):
    open(os.path.join(KG, name), 'w', encoding='utf-8').write(
        INIT + 'window.__KG_EMBEDDED["%s"]=%s;\n' % (key, json.dumps(tree, ensure_ascii=False)))

def find(node, nid):
    if node.get('id') == nid:
        return node
    for c in node.get('children') or []:
        r = find(c, nid)
        if r:
            return r
    return None

BT = "```"

def lesson_md(title, goal, what, syntax, lang, steps, errors, drill, parent, prev, nxt):
    errs = "\n".join("| %s | %s |" % e for e in errors)
    stp = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(steps))
    return ("### 课前\n\n- **目标**：%s\n\n### %s\n\n%s\n\n### 示例\n\n%s%s\n%s\n%s\n\n"
            "### 练习步骤\n\n%s\n\n### 常见误区\n\n| 误区 | 建议 |\n|---|---|\n%s\n\n"
            "### 动手\n\n%s\n\n### 导航\n\n- 上级：`%s`\n- 上一节：`%s`\n- 下一节：`%s`\n"
            % (goal, title, what, BT, lang, syntax, BT, stp, errs, drill, parent, prev, nxt))

def leaf(nid, title, level, content):
    return {"id": nid, "title": title, "level": level, "content": content, "children": []}

def chapter_md(title, nodes):
    return ("### %s · 章节导读\n\n**路径**：BI / Tableau / %s\n\n**本章节点**：%s\n\n点下方节点继续学习。\n"
            % (title, title, " · ".join(nodes)))

# Tableau 6 个空章节 → 子课（18 节）
TABLEAU = [
    ("BI.Tableau.入门准备", "入门准备", [
        ("界面与安装", "熟悉 Tableau Desktop 界面与工作区",
         "Tableau 桌面端分为数据源、工作表、仪表板、故事四类标签，可视化在「工作表」上完成。",
         "// 顶部：数据/分析 菜单\n// 左侧：维度(Dimension) 与 度量(Measure)\n// 右上：Show Me 推荐图形", "text",
         ["安装并打开 Tableau Desktop", "连接样例数据源", "认识维度/度量与 Show Me"],
         [("维度度量混淆", "蓝=维度离散，绿=度量连续"), ("不看数据类型", "先修正字段类型")],
         "连接 users/orders 并区分维度与度量。"),
        ("连接数据源", "能连接本地文件与数据库并预览数据",
         "支持 CSV/Excel、SQL 数据库、云仓库等；连接后进入数据源页整理字段。",
         "// Data > New Data Source > Text file / Microsoft SQL Server\n// 连接后可 Preview 与命名关系", "text",
         ["新建数据源连接 CSV", "设置字段类型与别名", "保存为 .twb 工作簿"],
         [("连接生产库直查", "分析用只读/抽取"), ("字段类型脏", "先改类型再分析")],
         "连接 orders.csv 并把 created_at 设为日期。"),
        ("首张工作表", "能拖拽生成柱状/折线并保存",
         "把维度拖到列、度量拖到行即可出图；双击字段自动放置。",
         "// 列：DATE(created_at)  行：SUM(amount)\n// 标记卡选「线」得到趋势图", "text",
         ["拖日期到列、金额到行", "标记卡切换图形", "保存并命名工作表"],
         [("拖错区域", "列/行/标记卡各司其职"), ("未聚合", "确认 SUM/AVG 度量")],
         "用日期与金额做一张每日 GMV 折线。"),
    ]),
    ("BI.Tableau.数据准备", "数据准备", [
        ("字段类型与别名", "能修正数据类型、重命名与默认属性",
         "分析前先确保字段类型正确、命名可读，数字与日期格式一致。",
         "// 右键字段 > Change Data Type / Default Properties > Number Format", "text",
         ["检查所有字段类型", "统一金额为数值、日期为日期", "设置默认数字格式"],
         [("日期被当字符串", "改为日期类型"), ("口径不统一", "统一字段命名")],
         "把 amount 设为数值、created_at 设为日期。"),
        ("关系 vs 联接", "能区分逻辑关系(Relationship)与物理联接(Join)",
         "关系在分析时按需连接（推荐），联接在数据源层物理合并（会产生行放大）。",
         "// 关系：拖入第二张表，按 user_id 建立逻辑关系\n// 联接：双击关系 > Join 需指定类型与键", "text",
         ["用关系连接 users 与 orders", "对比改用 Join 后的行数", "体会一对多放大"],
         [("一对多直接 Join", "优先逻辑关系"), ("关系键错误", "核对粒度与键")],
         "分别用关系与 Join 统计 GMV，观察结果差异。"),
        ("提取 Extract", "能用抽取加速并控制数据量",
         "抽取(Extract)把数据快照为 .hyper，显著提速并可离线分析。",
         "// Data > Extract Data > 筛选与聚合选项\n// 或右键数据源 > Extract", "text",
         ["创建全量抽取", "加数据源筛选减少行", "对比 Live 与 Extract 速度"],
         [("直连大表很慢", "用抽取或聚合"), ("抽取未刷新", "设置刷新计划")],
         "对 orders 创建抽取并限制近一年数据。"),
    ]),
    ("BI.Tableau.筛选与交互", "筛选与交互", [
        ("维度与度量筛选", "能对维度/度量做基础筛选",
         "筛选器按维度保留类别、按度量保留范围，影响视图结果。",
         "// 拖字段到 Filters，选择类别或范围\n// 右键 > Apply to Worksheets", "text",
         ["对 status 做类别筛选", "对 amount 做范围筛选", "观察标记数变化"],
         [("筛选顺序错误", "理解维度/度量/上下文顺序"), ("全局误用", "区分本表与应用范围")],
         "筛选出 status=paid 且 amount≥100 的订单。"),
        ("上下文与集合", "能用上下文筛选与集合做分组高亮",
         "上下文筛选先执行，集合可保存一组标记用于高亮/分组。",
         "// Filters > Add to Context\n// 选中标记 > Create Set", "text",
         ["把渠道筛选加入上下文", "创建 Top 客户集合", "用集合做 in/out 高亮"],
         [("上下文滥用", "仅在大筛选时使用"), ("集合难维护", "命名清晰")],
         "用集合高亮 Top10 客户。"),
        ("操作与联动 Actions", "能用筛选/高亮/跳转操作实现交互联动",
         "操作(Action)让点击一图联动其它图，实现下钻与联动。",
         "// Worksheet > Actions > Add Action\n// 类型：Filter / Highlight / Go to URL", "text",
         ["添加高亮操作", "添加筛选操作做联动", "配置参数操作的跳转"],
         [("操作过多", "只保留必要联动"), ("筛选覆盖", "明确作用范围")],
         "做一个「点渠道→联动趋势图」的操作。"),
    ]),
    ("BI.Tableau.仪表板", "仪表板", [
        ("布局与容器", "能用容器搭建规整的仪表板布局",
         "仪表板用水平/垂直容器组织视图，固定大小与浮动对象各有用途。",
         "// Dashboard > 拖入容器 > 放入工作表\n// 使用 Blank 与 Padding 控制间距", "text",
         ["用垂直容器分上中下三区", "放入 KPI 卡片与趋势图", "统一边框与留白"],
         [("对象随意浮动", "优先容器排版"), ("信息过载", "一屏一主题")],
         "搭一个「上 KPI、中趋势、下明细」的仪表板。"),
        ("故事 Story", "能用 Story 讲数据叙事",
         "Story 把多个工作表/仪表板串成带说明的叙事。",
         "// Story > New Story Point > 拖入仪表板并写说明", "text",
         ["新建 Story", "添加故事点", "为每点写结论说明"],
         [("把 Story 当报表", "Story 用于叙事汇报"), ("无结论", "每点给出一句结论")],
         "做一个三点式的经营分析 Story。"),
        ("设备与自适应", "能配置桌面/平板/手机布局",
         "设备设计器为不同尺寸定义布局，保证移动端可用。",
         "// Dashboard > Device Preview > Phone/Tablet", "text",
         ["切换设备预览", "为手机重排视图", "隐藏次要对象"],
         [("只做桌面", "兼顾移动端"), ("元素过密", "精简移动布局")],
         "为仪表板配置手机端布局。"),
    ]),
    ("BI.Tableau.性能优化", "性能优化", [
        ("抽取与聚合", "能用抽取与预聚合减少数据量",
         "优先抽取、在数据源层聚合、避免拉取明细。",
         "// Extract + Aggregate visible dimensions\n// 或数据源层先出 ADS 汇总表", "text",
         ["对比 Live/Extract 性能", "开启可见维度聚合", "在仓侧预聚合"],
         [("直连大明细", "抽取+预聚合"), ("重复计算", "用计算字段缓存")],
         "将 GMV 分析改为基于预聚合表。"),
        ("减少标记数量", "能通过筛选与粒度控制标记数",
         "标记(Marks)越多越慢；用筛选、降低粒度或改用聚合图形。",
         "// Filters 减少行\n// 用 SUM 聚合替代逐行标记", "text",
         ["查看表内标记数", "加筛选降低标记", "必要时改聚合视图"],
         [("散点百万点", "抽样或聚合"), ("明细表过宽", "限制列数")],
         "把一个百万点散点改为聚合视图。"),
        ("数据源筛选", "能在数据源层过滤与限制查询",
         "数据源筛选在查询前生效，比表内筛选更高效。",
         "// Data Source > Filters > Add", "text",
         ["添加数据源筛选", "对比表内筛选性能", "用参数控制筛选"],
         [("表内大筛选", "下推到数据源"), ("硬编码时间", "用参数/相对日期")],
         "用数据源筛选只保留近 90 天数据。"),
    ]),
    ("BI.Tableau.实战案例", "实战案例", [
        ("销售看板", "能端到端做经营销售看板",
         "整合 GMV、订单数、客单价与趋势，做一屏经营看板。",
         "// KPI：SUM(amount) / COUNTD(order_id) / AOV\n// 趋势：日期折线 + 同比", "text",
         ["建 3 个 KPI 卡片", "做 GMV 趋势与渠道对比", "加筛选联动"],
         [("指标无口径", "先定义口径"), ("缺乏对比", "加入同比/目标")],
         "做一个含 GMV/订单数/AOV 的销售看板。"),
        ("留存分析", "能用首购月队列分析留存",
         "用首购时间做队列，按活跃月份计算留存率。",
         "// 首购月 = {FIXED [user_id]:MIN(MONTH(created_at))}\n// 留存 = COUNTD(user_id) by 队列×活跃月", "text",
         ["计算每用户首购月", "做队列×活跃月矩阵", "计算留存率热力图"],
         [("随机切分", "用时间队列"), ("分母错误", "以队列首日人数为基")],
         "做一张首购月维度的留存热力图。"),
        ("漏斗分析", "能用事件表做转化漏斗",
         "按事件顺序计算各步人数与转化率。",
         "// 步骤：created→paid→refund\n// 转化率 = 当前步人数 / 首步人数", "text",
         ["用 order_events 排序步骤", "计算每步人数", "画漏斗/阶梯图"],
         [("步骤乱序", "按事件时间排序"), ("重复计数", "用 COUNTD(order_id)")],
         "用 order_events 做 created→paid 漏斗。"),
    ]),
]

# 1) 修复并读取 BI 树
btree = read_tree('embed-bi.js')
# 2) 展开 Tableau 章节
for chap_id, chap_title, lessons in TABLEAU:
    ch = find(btree, chap_id)
    titles = [l[0] for l in lessons]
    ch['content'] = chapter_md(chap_title, titles)
    ch['lessonParent'] = True
    kids = []
    for i, (title, goal, what, syntax, lang, steps, errors, drill) in enumerate(lessons):
        nid = chap_id + '.' + title
        prev = chap_id + '.' + lessons[i - 1][0] if i > 0 else "None"
        nxt = chap_id + '.' + lessons[i + 1][0] if i + 1 < len(lessons) else "None"
        kids.append(leaf(nid, title, "??", lesson_md(title, goal, what, syntax, lang, steps, errors, drill, chap_id, prev, nxt)))
    ch['children'] = kids
write_embed('embed-bi.js', 'bi', btree)
open(os.path.join(KG, 'hub-viz.json'), 'w', encoding='utf-8').write(json.dumps(btree, ensure_ascii=False))

# 3) 修复 SQL 初始化行（内容不变）
stree = read_tree('embed-sql.js')
write_embed('embed-sql.js', 'sql', stree)
open(os.path.join(KG, 'hub-query.json'), 'w', encoding='utf-8').write(json.dumps(stree, ensure_ascii=False))

print("tableau expanded:", [c[0] for c in TABLEAU])
print("sql init fixed")
print("done")