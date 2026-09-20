# -*- coding: utf-8 -*-
import json, glob, os

lines = []
for f in sorted(glob.glob(r'D:\cursor\数据学习平台\kg-data\hub-*.json')):
    r = json.load(open(f, encoding='utf-8'))
    lines.append("=" * 20 + " " + os.path.basename(f))
    def walk(node, depth, path):
        kids = node.get('children') or []
        content = node.get('content') or ''
        p = path + "/" + node.get('title', '')
        if len(kids) == 0:
            flag = "NO-CONTENT" if len(content.strip()) < 40 else "ok"
            lines.append("  " * depth + "- [leaf] %s | id=%s | content=%d | %s" % (p, node.get('id'), len(content), flag))
        for c in kids:
            walk(c, depth + 1, p)
    walk(r, 0, "")
    lines.append("")
open(r'D:\cursor\数据学习平台\_gen\_empty_dump.txt', 'w', encoding='utf-8').write("\n".join(lines))
print("ok", len(lines))