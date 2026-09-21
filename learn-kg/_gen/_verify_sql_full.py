# -*- coding: utf-8 -*-
"""校验重建后的 SQL 树：id 唯一、层级、level、段落齐备、三处部署一致。"""
import json, re, os, collections

ROOT = r'D:\cursor\数据学习平台'
BASES = [os.path.join(ROOT, 'kg-data'),
         r'D:\cursor\多行业数据平台\portfolio\pages\kg-data',
         r'D:\cursor\financial-data-portfolio-publish\pages\kg-data']
REQ = ['课前', '样例输入', '是什么', '怎么写', '查询结果', '用在哪', '易错对照', '教义深讲', '动手', '导航']
CHREQ = ['课前 · 章节导读', '本节地图', '推荐顺序', '怎么学', '验收', '下一动', '导航']

out = []
def P(*a):
    out.append(" ".join(str(x) for x in a))

tree = json.load(open(os.path.join(ROOT, '_gen', 'lessons', 'sql.json'), encoding='utf-8'))

ids = []
problems = []
rows = []
def walk(n, d=0):
    ids.append(n.get('id'))
    kids = n.get('children') or []
    c = n.get('content') or ''
    heads = re.findall(r'^###\s+(.+?)\s*$', c, re.M)
    rows.append((d, n.get('id'), n.get('title'), n.get('level'), len(kids), len(c), heads))
    if not kids and d > 0:
        if n.get('id') == 'SQL.学习路径.教程宪法.统一样例与课模板':
            pass  # 宪法页用「公约」模板，与其他域一致
        else:
            miss = [s for s in REQ if s not in heads]
            if miss:
                problems.append('LEAF 缺段落 %s -> %s' % (miss, n.get('id')))
    if kids and n.get('id') != 'sql-root':
        miss = [s for s in CHREQ if s not in heads]
        if miss:
            problems.append('CHAPTER 缺段落 %s -> %s' % (miss, n.get('id')))
    for k in kids:
        walk(k, d + 1)
walk(tree)

dup = [k for k, v in collections.Counter(ids).items() if v > 1]
P('总节点', len(ids), '| 唯一 id', len(set(ids)), '| 重复', dup)
P('层级分布', dict(collections.Counter(d for d, *_ in rows)))
P('level 取值', dict(collections.Counter(r[3] for r in rows)))
P('叶子数', sum(1 for r in rows if r[4] == 0))
P('')
P('=== 结构 ===')
for d, i, t, lv, k, ln, h in rows:
    kind = 'LEAF' if k == 0 else 'CH(%d)' % k
    P('%s%-2d %-42s %-4s %-7s len=%d' % ('  ' * d, d, i, lv, kind, ln))

P('')
P('=== 问题 ===')
P('\n'.join(problems) if problems else '无')

# 三处部署一致性
sig = None
for b in BASES:
    if not os.path.isdir(b):
        P('skip', b)
        continue
    a = open(os.path.join(b, 'sql.json'), encoding='utf-8').read()
    h = open(os.path.join(b, 'hub-query.json'), encoding='utf-8').read()
    e = open(os.path.join(b, 'embed-sql.js'), encoding='utf-8').read()
    ok = (a == h) and ('__KG_EMBEDDED["sql"]' in e) and (json.loads(a) == tree)
    P('deploy ok=%s %s' % (ok, b))
    if sig is None:
        sig = a
    else:
        P('   same as first:', a == sig)

open(os.path.join(ROOT, '_gen', '_verify_sql_full.txt'), 'w', encoding='utf-8').write('\n'.join(out))
print('\n'.join(out[:6]))
print('problems:', len(problems))
