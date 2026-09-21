# -*- coding: utf-8 -*-
"""把 BI 域补全：8 个「单叶空壳」章节展开为 3 节子课，并补上学习路径。

数据流：_gen/lessons/bi.json（master）→ kg-data 三处（bi.json / hub-viz.json / embed-bi.js）
"""
import json, os, re, importlib

ROOT = r'D:\cursor\数据学习平台'
MASTER = os.path.join(ROOT, '_gen', 'lessons', 'bi.json')
BASES = [os.path.join(ROOT, 'kg-data'),
         r'D:\cursor\多行业数据平台\portfolio\pages\kg-data',
         r'D:\cursor\financial-data-portfolio-publish\pages\kg-data']
HTMLS = [os.path.join(ROOT, '数据知识图谱.html'),
         r'D:\cursor\多行业数据平台\portfolio\pages\learn.html',
         r'D:\cursor\financial-data-portfolio-publish\pages\learn.html']
NEW_VER = '20260921f'
LEVELS = {'?': '入门', '??': '进阶', '???': '高阶'}
SAMPLE_NOTE = "> 统一样例：Superstore 或同源订单表（维度：品类 / 子类别 / 地区 / 订单日期；度量：销售额 / 数量 / 利润）。"

FIELDS = ('id', 'title', 'level', 'parent', 'prev', 'nxt', 'scene', 'goal', 'prereq',
          'sample', 'what', 'steps', 'code', 'result', 'uses', 'upstream', 'errors',
          'deep', 'drill')


DEFAULT_SAMPLE = ('Superstore / 同源订单表的常用字段：Category 品类、Sub-Category 子类别、'
                  'Region 地区、Order Date 订单日期；Sales 销售额、Profit 利润、Quantity 数量。')
DEFAULT_UPSTREAM = '上游见「先修」；下游是同一章的后续小节与仪表板交付。'
DEFAULT_PREREQ = '「统一样例与课模板」'


TUPLE_KEYS = ('id', 'title', 'level', 'parent', 'prev', 'nxt', 'scene', 'goal', 'prereq',
              'sample', 'what', 'steps', 'code', 'result', 'uses', 'upstream', 'errors',
              'deep', 'drill')


def norm(spec):
    """兼容 dict 与 19 元组两种写法。"""
    return spec if isinstance(spec, dict) else dict(zip(TUPLE_KEYS, spec))


def build_lesson(spec, chap_title, prev, nxt, level):
    s = norm(spec)
    return to_node(s, chap_title, s.get('prev') or prev, s.get('nxt') or nxt,
                   s.get('level') or level)


def to_node(spec, chap_title, prev, nxt, level):
    """把精简 spec（dict）展开为完整课节点。"""
    g = lambda k, d='': spec.get(k, d)
    steps = g('steps')
    stp = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(steps))
    err = "\n".join("| %s |" % " | ".join(x.strip() for x in e.split("|"))
                    for e in g('errors'))
    use = "\n".join("%d. %s" % (i + 1, s) for i, s in enumerate(g('uses')))
    content = (
        "### 课前\n\n"
        "- **场景**：%s\n- **目标**：%s\n- **先修**：%s\n- **难度**：%s\n"
        "- **学完标准**：能复述定义、独立做出等价视图、指出至少两个翻车点。\n\n"
        "### 样例输入\n\n%s\n\n%s\n\n"
        "### 是什么\n\n%s\n\n"
        "### 怎么做\n\n**建议步骤**\n\n%s\n\n```text\n%s\n```\n\n"
        "### 看到什么\n\n%s\n\n"
        "### 用在哪\n\n%s\n\n**上下游**：%s\n\n"
        "### 易错对照\n\n| 错法 | 现象 | 纠正 |\n|---|---|---|\n%s\n\n"
        "### 教义深讲\n\n%s\n\n"
        "### 动手\n\n%s\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：%s\n- 下一节：%s\n"
        % (g('scene'), g('goal'), g('prereq', DEFAULT_PREREQ), LEVELS.get(level, level),
           g('sample', DEFAULT_SAMPLE), SAMPLE_NOTE,
           g('what'), stp, g('code'), g('result'), use,
           g('upstream', DEFAULT_UPSTREAM), err, g('deep'), g('drill'),
           chap_title, prev, nxt)
    )
    return {'id': spec['id'], 'title': spec['title'], 'level': level,
            'content': content, 'children': []}


def chapter(nid, title, level, scene, why, rows, order, parent, nxt, prev='（本节起）'):
    tbl = "\n".join("| %d | %s | %s | %s |" % (i + 1, r[0], LEVELS.get(r[2], r[2]), r[1])
                    for i, r in enumerate(rows))
    content = (
        "### 课前 · 章节导读\n\n"
        "- **场景**：%s\n- **章节**：%s\n- **为什么学**：%s\n"
        "- **学完能做什么**：按顺序完成下面每一节的「动手」，并能讲清本节边界。\n"
        "- **纪律**：使用全平台统一样例（订单 / 用户 / Superstore），不要每节换一套数据。\n\n"
        "### 本节地图\n\n| # | 节点 | 难度 | 一句话 |\n|---|---|---|---|\n%s\n\n"
        "### 推荐顺序\n\n```text\n%s\n```\n\n"
        "### 怎么学\n\n"
        "1. 先看地图，知道有哪些节点。\n"
        "2. 按顺序打开，每节做完「动手」再往下。\n"
        "3. 换成你自己的数据源，重做一次最小版本。\n\n"
        "### 验收\n\n| 检查 | 标准 |\n|---|---|\n"
        "| 主路径 | 每节视图能重做 |\n"
        "| 易错 | 至少能举出 2 个反例 |\n"
        "| 口述 | 不看笔记讲清「%s」解决什么 |\n\n"
        "### 下一动\n\n从第 1 个节点开始。本章共 **%d** 个直接下级。\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：%s\n- 下一节：%s\n"
        % (scene, title, why, tbl, order, title, len(rows), parent, prev, nxt)
    )
    return {'id': nid, 'title': title, 'level': level, 'content': content, 'children': []}


def find(n, i):
    if n.get('id') == i:
        return n
    for c in n.get('children') or []:
        r = find(c, i)
        if r:
            return r
    return None


def index_nodes(n, out=None):
    out = out if out is not None else {}
    out[n['id']] = n
    for c in n.get('children') or []:
        index_nodes(c, out)
    return out


# =====================================================================
# 组装 + 部署
# =====================================================================

def load_module(name):
    import importlib
    return importlib.import_module(name)


def mk_chapter(mod, chap):
    """输入模块（含 CHAPTER / LESSONS），输出章节节点（含子课）。"""
    kids = []
    n = len(mod.LESSONS)
    for i, s in enumerate(mod.LESSONS):
        prev = '（本节起）' if i == 0 else mod.LESSONS[i - 1]['title']
        nxt = '（本节完）' if i == n - 1 else mod.LESSONS[i + 1]['title']
        kids.append(build_lesson(s, chap['title'], prev, nxt, chap['level']))
    ch = chapter(chap['id'], chap['title'], chap['level'], chap['scene'], chap['why'],
                 chap['rows'], chap['order'], chap['parent'], chap['nxt'], chap['prev'])
    ch['lessonParent'] = True
    ch['children'] = kids
    return ch


def build_path():
    p1, p2 = load_module('bi_p1'), load_module('bi_p2')

    def leaves(mod, title):
        return [build_lesson(s, title, '', '', norm(s).get('level') or '?')
                for s in mod.SPECS]

    cons_sec = chapter('BI.学习路径.教程宪法', '教程宪法', '?',
                       '各人手里一套数据，同一张图两个人做出来数字不一样。',
                       '先钉死样例与指标口径，后面每一课都复用同一份数据。',
                       [('统一样例与课模板', 'BI 教程公约：样例、指标口径、课模板。', '?')],
                       '统一样例与课模板', '学习路径', '路线清单', '（本节起）')
    cons_sec['lessonParent'] = True
    cons_sec['children'] = leaves(p1, '教程宪法')[:1]

    roadmap = chapter('BI.学习路径.路线清单', '路线清单', '?',
                      '不知道该先学哪个功能、学到什么程度算过关。',
                      '用初 / 中 / 高三张清单把「会做图」翻译成可验收的动作。',
                      [('初级清单', '会连数据、认字段、做四张基本图。', '?'),
                       ('中级清单', '会写计算字段、做同比与交互。', '??'),
                       ('高级清单', '能优化性能、治理口径、交付分析。', '???')],
                      '初级清单 → 中级清单 → 高级清单', '学习路径', '练习场', '教程宪法')
    roadmap['lessonParent'] = True
    roadmap['children'] = leaves(p1, '路线清单')[1:]

    pf = chapter('BI.学习路径.练习场', '练习场', '??',
                 '看完课不动手，进了项目仍然做不出来。',
                 '用三组递进练习把「看懂」变成「做得出」。',
                 [('初级练习', '单视图：排序、趋势、构成、矩阵。', '?'),
                  ('中级练习', '计算、LOD、筛选范围与联动。', '??'),
                  ('高级练习', '性能基线、口径治理、交付。', '???')],
                 '初级练习 → 中级练习 → 高级练习', '学习路径', 'Tableau', '路线清单')
    pf['lessonParent'] = True
    pf['children'] = leaves(p2, '练习场')

    path = chapter('BI.学习路径', '学习路径', '?',
                   '不知道从哪开始、学到什么程度算过关。',
                   '先读公约，再看清单，最后进练习场。',
                   [('教程宪法', '样例与口径的唯一来源。', '?'),
                    ('路线清单', '初 / 中 / 高三张能力清单。', '?'),
                    ('练习场', '三组递进练习。', '??')],
                   '教程宪法 → 路线清单 → 练习场', 'BI', 'Tableau', '（本节起）')
    path['lessonParent'] = True
    path['children'] = [cons_sec, roadmap, pf]
    return path



def build():
    old = json.load(open(MASTER, encoding='utf-8'))
    idx = index_nodes(old)
    apply_upgrades(idx, old)

    new_ch = {}
    for mn in ['bi_c1', 'bi_c2', 'bi_c3', 'bi_c4', 'bi_c5', 'bi_c6', 'bi_c7', 'bi_c8']:
        m = load_module(mn)
        new_ch[m.CHAPTER['id']] = mk_chapter(m, m.CHAPTER)

    # Tableau：8 个子章（6 个新建 + 图表制作 / 计算 保留原内容）
    tab_children = []
    for cid in ['BI.Tableau.入门准备', 'BI.Tableau.数据准备', 'BI.Tableau.图表制作',
                'BI.Tableau.计算', 'BI.Tableau.筛选与交互', 'BI.Tableau.仪表板',
                'BI.Tableau.性能优化', 'BI.Tableau.实战案例']:
        tab_children.append(new_ch.get(cid) or idx[cid])
    tab = chapter('BI.Tableau', 'Tableau', '?',
                  '要用一个工具走完从数据到仪表板的完整链路。',
                  '八个小节按「准备 → 出图 → 计算 → 交互 → 交付 → 提速 → 实战」推进。',
                  [('入门准备', '界面、维度度量、图表选型。', '?'),
                   ('数据准备', '关系、抽取、类型清洗。', '?'),
                   ('图表制作', '六种常用图形。', '?'),
                   ('计算', '基础计算、表计算、LOD。', '??'),
                   ('筛选与交互', '作用范围、参数与集、联动。', '??'),
                   ('仪表板', '布局、叙事、移动端。', '??'),
                   ('性能优化', '定位瓶颈、数据源与视图优化。', '???'),
                   ('实战案例', '复盘、漏斗、交付讲故事。', '???')],
                  '入门准备 → 数据准备 → 图表制作 → 计算 → 筛选与交互 → 仪表板 → 性能优化 → 实战案例',
                  'BI', 'Power BI', '（本节起）')
    tab['lessonParent'] = True
    tab['children'] = tab_children

    root = chapter('bi-root', 'BI', '?',
                   '业务要数据，但你手上只有一堆表和一张空白画布。',
                   'BI 是把数据变成「能被决策用的图」的最后一公里。',
                   [('学习路径', '公约、清单、练习场。', '?'),
                    ('Tableau', '完整链路：数据 → 图 → 计算 → 交互 → 仪表板。', '?'),
                    ('Power BI', '模型、DAX、发布刷新。', '??'),
                    ('国产 BI', '选型、自助取数、权限调度。', '??')],
                   '学习路径 → Tableau → Power BI → 国产 BI',
                   '（根节点）', '学习路径', '')
    root['source'] = old.get('source', 'tutorials_v2_graph')
    root['children'] = [build_path(), tab, new_ch['BI.Power BI'], new_ch['BI.国产 BI']]
    return root


def deploy(tree):
    compact = json.dumps(tree, ensure_ascii=False, separators=(",", ":"))
    for b in BASES:
        if not os.path.isdir(b):
            print('skip (missing)', b)
            continue
        open(os.path.join(b, 'bi.json'), 'w', encoding='utf-8').write(compact)
        open(os.path.join(b, 'hub-viz.json'), 'w', encoding='utf-8').write(compact)
        open(os.path.join(b, 'embed-bi.js'), 'w', encoding='utf-8').write(
            'window.__KG_EMBEDDED = window.__KG_EMBEDDED || {};\n'
            'window.__KG_EMBEDDED["bi"]=%s\n' % compact)
        print('deployed', b)
    open(MASTER, 'w', encoding='utf-8').write(json.dumps(tree, ensure_ascii=False, indent=1))
    print('master written', MASTER)
    for h in HTMLS:
        if not os.path.exists(h):
            print('skip html', h)
            continue
        t = open(h, encoding='utf-8').read()
        t2, n = re.subn(r'const KG_DATA_VER = "[^"]+"',
                        'const KG_DATA_VER = "%s"' % NEW_VER, t, count=1)
        if n:
            open(h, 'w', encoding='utf-8').write(t2)
            print('ver bumped', os.path.basename(h))


# （__main__ 入口已移至文件末尾）


# =====================================================================
# 既有 11 节课升级：保留原「是什么 / 怎么做 / 用在哪 / 动手」，补齐缺失段落
# =====================================================================

import bi_up


def parse_sections(md):
    out = {}
    for p in re.split(r'(?=^### )', md or '', flags=re.M):
        m = re.match(r'^###\s+(.+?)\s*$', p, flags=re.M)
        if m:
            out[m.group(1).strip()] = p[m.end():].strip('\n')
    return out


def upgrade_node(n, spec, chap_title, prev, nxt):
    sec = parse_sections(n.get('content'))
    goal = ''
    m = re.search(r'\*\*目标\*\*[：:]\s*(.+)', sec.get('课前') or '')
    if m:
        goal = m.group(1).strip()
    sample = ''
    m2 = re.search(r'\*\*样例\*\*[：:]\s*(.+)', sec.get('课前') or '')
    if m2:
        sample = m2.group(1).strip()
    err = "\n".join("| %s |" % " | ".join(x.strip() for x in e.split("|"))
                    for e in spec['errors'])
    lv = n.get('level') or '?'
    n['content'] = (
        "### 课前\n\n"
        "- **场景**：%s\n- **目标**：%s\n- **先修**：%s\n- **难度**：%s\n"
        "- **学完标准**：能复述定义、独立做出等价视图、指出至少两个翻车点。\n\n"
        "### 样例输入\n\n%s\n\n%s\n\n"
        "### 是什么\n\n%s\n\n"
        "### 怎么做\n\n%s\n\n"
        "### 看到什么\n\n%s\n\n"
        "### 用在哪\n\n%s\n\n**上下游**：上游见「先修」；下游是同一章的后续小节与仪表板交付。\n\n"
        "### 易错对照\n\n| 错法 | 现象 | 纠正 |\n|---|---|---|\n%s\n\n"
        "### 教义深讲\n\n%s\n\n"
        "### 动手\n\n%s\n\n"
        "### 导航\n\n- 上级：`%s`\n- 上一节：%s\n- 下一节：%s\n"
        % (spec['scene'], goal or '掌握本节的核心操作与边界', spec['prereq'],
           LEVELS.get(lv, lv), sample or DEFAULT_SAMPLE, SAMPLE_NOTE,
           sec.get('是什么', ''), sec.get('怎么做', ''), spec['result'],
           sec.get('用在哪', ''), err, spec['deep'],
           sec.get('动手', ''), chap_title, prev, nxt)
    )
    return n


def apply_upgrades(idx, old):
    """对 图表制作 / 计算 两章的 11 节课做内容升级，并重排导航。"""
    groups = [('BI.Tableau.图表制作', ['柱状图', '折线图', '饼图', '环形图', '双轴组合图', '热力图'],
               '（本节起）', '计算'),
              ('BI.Tableau.计算', ['基础计算', '表计算', 'LOD.FIXED', 'LOD.INCLUDE', 'LOD.EXCLUDE'],
               '图表制作', '筛选与交互')]
    for chap_id, names, chap_prev, chap_nxt in groups:
        chap = idx[chap_id]
        kids = chap.get('children') or []
        # 先递归处理嵌套子章（如 计算 → LOD）
        for k in kids:
            if k.get('children'):
                for i, gk in enumerate(k['children']):
                    if gk['id'] not in bi_up.UP:
                        continue
                    p = '（本节起）' if i == 0 else k['children'][i - 1]['title']
                    nx = '（本节完）' if i == len(k['children']) - 1 else k['children'][i + 1]['title']
                    upgrade_node(gk, bi_up.UP[gk['id']], k['title'], p, nx)
                nk = chapter(k['id'], k['title'], k.get('level') or '?',
                             '把「%s」拆成可练习的小节。' % k['title'],
                             '三个 LOD 的差别只有一句话：谁决定粒度。',
                             [(x['title'], '见本节', x.get('level') or '?') for x in k['children']],
                             ' → '.join(x['title'] for x in k['children']),
                             chap['title'], '（本节完）', '表计算')
                nk['lessonParent'] = True
                nk['children'] = k['children']
                idx[k['id']] = nk
                kids[kids.index(k)] = nk
        for i, kid in enumerate(kids):
            if kid['id'] not in bi_up.UP:
                continue
            prev = '（本节起）' if i == 0 else kids[i - 1]['title']
            nxt = '（本节完）' if i == len(kids) - 1 else kids[i + 1]['title']
            upgrade_node(kid, bi_up.UP[kid['id']], chap['title'], prev, nxt)
        # 章节导读统一为新模板
        rows = [(k['title'], (parse_sections(k['content']).get('课前') or '')
                 .split('**目标**：')[-1].split('\n')[0].strip()[:40] or '见本节',
                 k.get('level') or '?') for k in kids]
        nc = chapter(chap_id, chap['title'], chap.get('level') or '?',
                     '把「%s」拆成可练习的小节，避免只记目录。' % chap['title'],
                     '每一节都能独立复现，串起来就是完整链路。',
                     rows, ' → '.join(k['title'] for k in kids),
                     'Tableau', chap_nxt, chap_prev)
        nc['lessonParent'] = True
        nc['children'] = kids
        idx[chap_id] = nc
    return idx



if __name__ == '__main__':
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    tree = build()
    leaves, chapters = [], []

    def walk(n, d=0):
        (leaves if not (n.get('children') or []) and d > 0 else chapters).append(n)
        for c in n.get('children') or []:
            walk(c, d + 1)
    walk(tree)
    print('nodes leaves=%d chapters=%d' % (len(leaves), len(chapters)))
    print('thin leaves:', [n['id'] for n in leaves
                           if len(n.get('content') or '') < 700])
    deploy(tree)

