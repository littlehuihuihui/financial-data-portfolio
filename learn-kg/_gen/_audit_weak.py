# -*- coding: utf-8 -*-
"""扫描所有 hub-*.json，找出内容薄弱/缺失的节点。"""
import json, glob, os, re
from collections import Counter

KG = r'D:\cursor\数据学习平台\kg-data'
GOLD8 = ["课前", "样例", "是什么", "怎么写", "查询结果", "用在哪", "易错", "动手"]

rows_all = []

def walk(n, domain, depth=0, parent=None, out=None):
    out = out if out is not None else []
    kids = n.get('children') or []
    c = n.get('content') or ''
    heads = re.findall(r'^#{2,4}\s+(.+)$', c, re.M)
    joined = " | ".join(heads)
    gold = sum(1 for g in GOLD8 if g in joined)
    out.append({
        'domain': domain, 'depth': depth, 'id': n.get('id'), 'title': n.get('title'),
        'kids': len(kids), 'len': len(c), 'gold': gold, 'heads': len(heads),
        'lp': bool(n.get('lessonParent')), 'parent': parent,
        'isLeaf': len(kids) == 0 and depth > 0,
    })
    for k in kids:
        walk(k, domain, depth + 1, n.get('id'), out)
    return out

for f in sorted(glob.glob(os.path.join(KG, 'embed-*.js'))):
    name = os.path.basename(f)
    domain = re.sub(r'^embed-|\.js$', '', name)
    s = open(f, encoding='utf-8').read()
    m = re.search(r'window\.__KG_EMBEDDED\["[^"]+"\]\s*=\s*(\{.*\})\s*;?\s*$', s, re.S)
    if not m:
        print('SKIP', name)
        continue
    tree = json.loads(m.group(1))
    rows_all += walk(tree, domain)

lines = []
def P(*a):
    lines.append(" ".join(str(x) for x in a))

# 按 domain 汇总
for dom in sorted(set(r['domain'] for r in rows_all)):
    rows = [r for r in rows_all if r['domain'] == dom]
    leaves = [r for r in rows if r['isLeaf']]
    nonleaf = [r for r in rows if not r['isLeaf']]
    empty_nonleaf = [r for r in nonleaf if r['len'] == 0]
    thin_leaf = [r for r in leaves if r['len'] < 300]
    P("=" * 70)
    P("DOMAIN", dom, "| nodes", len(rows), "| leaves", len(leaves), "| nonleaf", len(nonleaf))
    P("  maxDepth", max(r['depth'] for r in rows),
      "| leaf len avg", round(sum(r['len'] for r in leaves) / max(1, len(leaves))),
      "| nonleaf len avg", round(sum(r['len'] for r in nonleaf) / max(1, len(nonleaf))))
    P("  empty-content nonleaf:", len(empty_nonleaf))
    P("  thin leaves (<300):", len(thin_leaf))
    P("  leaf gold8 distribution:", dict(Counter(r['gold'] for r in leaves)))
    if thin_leaf:
        P("  --- THIN LEAVES ---")
        for r in sorted(thin_leaf, key=lambda x: x['len']):
            P("   ", r['len'], "|", r['id'], "|", r['title'], "| gold", r['gold'], "| heads", r['heads'])
    if empty_nonleaf:
        P("  --- EMPTY NONLEAF (缺章节导语) ---")
        for r in empty_nonleaf[:40]:
            P("   ", "d%d" % r['depth'], "| kids", r['kids'], "|", r['id'], "|", r['title'])

P("")
P("=" * 70)
P("GLOBAL THIN LEAVES (all domains, len<400):")
for r in sorted([x for x in rows_all if x['isLeaf'] and x['len'] < 400], key=lambda x: x['len']):
    P(" ", r['len'], "|", r['domain'], "|", r['id'], "|", r['title'], "| gold", r['gold'])

open(r'D:\cursor\数据学习平台\_gen\_audit_weak.txt', 'w', encoding='utf-8').write("\n".join(lines))
print("wrote _audit_weak.txt lines", len(lines))
print("total nodes", len(rows_all), "leaves", sum(1 for r in rows_all if r['isLeaf']))
