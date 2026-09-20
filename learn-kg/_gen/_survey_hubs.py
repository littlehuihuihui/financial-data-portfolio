# -*- coding: utf-8 -*-
import json, glob, os

lines = []
for f in sorted(glob.glob(r'D:\cursor\数据学习平台\kg-data\hub-*.json')):
    r = json.load(open(f, encoding='utf-8'))
    lines.append("=" * 20 + " " + os.path.basename(f))
    def walk(node, depth):
        kids = node.get('children') or []
        lines.append(("  " * depth) + "- %s | id=%s | lvl=%s | kids=%d | lp=%s" % (
            node.get('title'), node.get('id'), node.get('level', ''), len(kids), node.get('lessonParent', False)))
        if depth >= 3:
            return
        for c in kids:
            walk(c, depth + 1)
    walk(r, 0)
    lines.append("")
open(r'D:\cursor\数据学习平台\_gen\_hubs_dump.txt', 'w', encoding='utf-8').write("\n".join(lines))
print("ok", len(lines))