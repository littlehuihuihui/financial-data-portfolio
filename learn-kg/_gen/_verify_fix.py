# -*- coding: utf-8 -*-
import json, re, os
KG = r'D:\cursor\数据学习平台\kg-data'

def init_ok(name):
    s = open(os.path.join(KG, name), encoding='utf-8').read()
    return s.startswith('window.__KG_EMBEDDED=window.__KG_EMBEDDED||{};')

def read(name):
    s = open(os.path.join(KG, name), encoding='utf-8').read()
    m = re.search(r'window\.__KG_EMBEDDED\["[^"]+"\]\s*=\s*(\{.*\})\s*;?\s*$', s, re.S)
    return json.loads(m.group(1))

def find(n, i):
    if n.get('id') == i:
        return n
    for c in n.get('children') or []:
        r = find(c, i)
        if r:
            return r
    return None

print('sql init ok:', init_ok('embed-sql.js'))
print('bi  init ok:', init_ok('embed-bi.js'))

bt = read('embed-bi.js')
for t in ['入门准备', '数据准备', '筛选与交互', '仪表板', '性能优化', '实战案例']:
    n = find(bt, 'BI.Tableau.' + t)
    print('Tableau.' + t, '-> children', len(n['children']), 'lp', n.get('lessonParent'))

# 与 hub 一致性
bt2 = json.loads(open(os.path.join(KG, 'hub-viz.json'), encoding='utf-8').read())
st = read('embed-sql.js')
st2 = json.loads(open(os.path.join(KG, 'hub-query.json'), encoding='utf-8').read())
print('bi sink:', bt == bt2, 'sql sink:', st == st2)

# 无空内容叶子
bad = []
def walk(n):
    if not (n.get('children') or []) and len((n.get('content') or '').strip()) < 40:
        bad.append(n.get('id'))
    for c in n.get('children') or []:
        walk(c)
for name in ['embed-bi.js', 'embed-sql.js']:
    walk(read(name))
print('no-content leaves:', bad)

st = read('embed-sql.js')
bt = read('embed-bi.js')
for tid in ['SQL.基础查询.SELECT', 'SQL.多表操作.JOIN', 'SQL.聚合分析.窗口函数']:
    print(tid, 'len', len(find(st, tid)['content']))
for tid in ['BI.Tableau.图表制作.柱状图', 'BI.Tableau.计算.LOD.FIXED', 'BI.Tableau.计算.表计算']:
    print(tid, 'len', len(find(bt, tid)['content']))
