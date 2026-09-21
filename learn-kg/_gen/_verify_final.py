# -*- coding: utf-8 -*-
"""最终验收：全部 7 个域的结构、段落、id 唯一性、部署一致性、缓存版本号。"""
import json, re, os, collections

ROOT = r'D:\cursor\数据学习平台'
KG = os.path.join(ROOT, 'kg-data')
DOMAINS = ['sql', 'python', 'database', 'ml', 'etl', 'dwh', 'bi']
HUB = {'sql': 'hub-query.json', 'bi': 'hub-viz.json'}
BASES = [KG,
         r'D:\cursor\多行业数据平台\portfolio\pages\kg-data',
         r'D:\cursor\financial-data-portfolio-publish\pages\kg-data']
HTMLS = [os.path.join(ROOT, '数据知识图谱.html'),
         r'D:\cursor\多行业数据平台\portfolio\pages\learn.html',
         r'D:\cursor\financial-data-portfolio-publish\pages\learn.html']
COMMON = ['课前']
CHAP = []

out = []
def P(*a):
    out.append(" ".join(str(x) for x in a))


def _flatten(n, o=None):
    o = o if o is not None else []
    o.append(n)
    for c in n.get('children') or []:
        _flatten(c, o)
    return o


def _depth(n):
    kids = n.get('children') or []
    return 1 + max((_depth(c) for c in kids), default=0)

P('%-9s %6s %7s %6s %8s %8s %-22s %s' %
  ('domain', 'nodes', 'leaves', 'depth', 'minLen', 'avgLen', 'sections', 'issues'))
fail = []
for d in DOMAINS:
    tree = json.load(open(os.path.join(KG, d + '.json'), encoding='utf-8'))
    ids, leaves, chapters, issues = [], [], [], []
    def walk(n, dep=0):
        ids.append(n.get('id'))
        kids = n.get('children') or []
        c = n.get('content') or ''
        heads = re.findall(r'^###\s+(.+?)\s*$', c, re.M)
        if not ids or True:
            pass
        if not kids and dep > 0:
            leaves.append((n['id'], len(c)))
            miss = [s for s in COMMON if s not in heads]
            if miss:
                issues.append('leaf缺%s:%s' % (miss, n['id']))
        elif kids and dep > 0:
            chapters.append((n['id'], len(c)))
            miss = [s for s in CHAP if s not in heads]
            if miss:
                issues.append('chap缺%s:%s' % (miss, n['id']))
        for k in kids:
            walk(k, dep + 1)
    walk(tree)
    dup = [k for k, v in collections.Counter(ids).items() if v > 1]
    if dup:
        issues.append('重复id:%s' % dup)
    lens = [l for _, l in leaves]
    secl = sorted(set(len(re.findall(r'^###\s', (n.get('content') or ''), re.M))
                      for n in _flatten(tree) if not (n.get('children') or [])))
    P('%-9s %6d %7d %6d %8d %8d %-22s %s' %
      (d, len(ids), len(leaves), _depth(tree), min(lens), sum(lens) // len(lens),
       str(secl), (len(issues) and issues[:2]) or 'OK'))
    if issues:
        fail += ['%s: %s' % (d, i) for i in issues[:5]]

P('')
P('=== 部署一致性（sql / bi）===')
for d in ['sql', 'bi']:
    sig = None
    for b in BASES:
        if not os.path.isdir(b):
            P('  skip', b)
            continue
        a = open(os.path.join(b, d + '.json'), encoding='utf-8').read()
        h = open(os.path.join(b, HUB[d]), encoding='utf-8').read()
        e = open(os.path.join(b, 'embed-%s.js' % d), encoding='utf-8').read()
        m = re.search(r'=(\{.*\})\s*$', e, re.S)
        ok = (a == h) and (m is not None) and (json.loads(m.group(1)) == json.loads(a))
        P('  %-5s ok=%-5s %s' % (d, ok, b.split('\\')[-3]))
        if not ok:
            fail.append('deploy mismatch %s %s' % (d, b))
        if sig is None:
            sig = a
        elif a != sig:
            fail.append('cross-repo mismatch %s %s' % (d, b))

P('')
P('=== 缓存版本号 ===')
vers = set()
for h in HTMLS:
    if not os.path.exists(h):
        P('  missing', h)
        continue
    t = open(h, encoding='utf-8').read()
    m = re.search(r'const KG_DATA_VER = "([^"]+)"', t)
    vers.add(m.group(1) if m else None)
    P('  %-34s %s' % (os.path.basename(os.path.dirname(h)) + '/' + os.path.basename(h),
                      m.group(1) if m else 'NONE'))
if len(vers) != 1:
    fail.append('KG_DATA_VER 不一致: %s' % vers)

P('')
P('=== 结论 ===')
P('FAIL: %d' % len(fail))
for f in fail[:20]:
    P('  -', f)

open(os.path.join(ROOT, '_gen', '_verify_final.txt'), 'w', encoding='utf-8').write('\n'.join(out))
print('\n'.join(out))
