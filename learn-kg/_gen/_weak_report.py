# -*- coding: utf-8 -*-
"""定位真正薄弱的节点：叶长离群、章节子课数塌陷、缺练习/学习路径。"""
import json, glob, os, re, statistics as st

KG = r'D:\cursor\数据学习平台\kg-data'
OUT = r'D:\cursor\数据学习平台\_gen\_weak_report.txt'

def load(f):
    s = open(f, encoding='utf-8').read()
    m = re.search(r'window\.__KG_EMBEDDED\["[^"]+"\]\s*=\s*(\{.*\})\s*;?\s*$', s, re.S)
    return json.loads(m.group(1))

lines = []
def P(*a):
    lines.append(" ".join(str(x) for x in a))

report = {}

for f in sorted(glob.glob(os.path.join(KG, 'embed-*.js'))):
    dom = re.sub(r'^embed-|\.js$', '', os.path.basename(f))
    tree = load(f)

    leaves, chapters = [], []

    def walk(n, depth=0, parent=None):
        kids = n.get('children') or []
        rec = {'id': n.get('id'), 'title': n.get('title'), 'depth': depth,
               'kids': len(kids), 'len': len(n.get('content') or ''), 'parent': parent}
        if not kids and depth > 0:
            leaves.append(rec)
        elif kids:
            chapters.append(rec)
        for k in kids:
            walk(k, depth + 1, n.get('id'))
    walk(tree)

    ls = [r['len'] for r in leaves]
    med = st.median(ls) if ls else 0
    q1 = st.quantiles(ls, n=4)[0] if len(ls) > 3 else min(ls)

    P("=" * 78)
    P("DOMAIN", dom, "| nodes", len(leaves) + len(chapters), "| leaves", len(leaves),
      "| chapters", len(chapters), "| maxDepth", max(r['depth'] for r in leaves))
    P("  leaf len: min=%d q1=%d med=%d max=%d" % (min(ls), q1, med, max(ls)))

    # 1) 叶内容离群偏短（低于域中位数 75%）
    thin = sorted([r for r in leaves if r['len'] < med * 0.75], key=lambda x: x['len'])
    if thin:
        P("  [A] 内容偏短叶 (len < 域中位数*0.75 = %d):" % int(med * 0.75))
        for r in thin:
            P("      %5d  %-34s %s" % (r['len'], r['id'], r['title']))
    report.setdefault(dom, {})['thin'] = thin

    # 2) 章节塌陷：子课数 <= 1 的章节（其他同域章节有 3+）
    multi = [r['kids'] for r in chapters if r['kids'] >= 2]
    typical = st.median(multi) if multi else 0
    collapse = sorted([r for r in chapters if r['kids'] <= 1], key=lambda x: x['depth'])
    if collapse and typical >= 2:
        P("  [B] 章节塌陷 (子课数 <=1，本域典型章节子课数=%d):" % typical)
        for r in collapse:
            P("      d%d kids=%d  %-34s %s" % (r['depth'], r['kids'], r['id'], r['title']))
    report.setdefault(dom, {})['collapse'] = collapse

    # 3) 结构能力缺失
    ids = " ".join(r['id'] or '' for r in leaves + chapters)
    P("  [C] 结构能力：")
    for key in ['learning-path', 'constitution', 'roadmap', 'path-junior', 'path-mid', 'path-senior',
                'practice-field', 'drill-junior', 'drill-mid', 'drill-senior']:
        P("      %-16s %s" % (key, 'YES' if key in ids else 'NO'))

open(OUT, 'w', encoding='utf-8').write("\n".join(lines))
print("wrote", OUT, len(lines), "lines")
