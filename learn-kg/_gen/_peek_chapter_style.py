# -*- coding: utf-8 -*-
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
# peek one SQL chapter for style
for hub in ("sql", "bi"):
    p = Path(rf"D:\cursor\数据学习平台\_gen\lessons\{hub}.json")
    if not p.exists():
        continue
    t = json.loads(p.read_text(encoding="utf-8"))

    def find_chapter(n):
        kids = n.get("children") or []
        if n.get("lessonParent") and kids:
            return n
        for c in kids:
            r = find_chapter(c)
            if r:
                return r

    ch = find_chapter(t)
    if ch:
        print("==", hub, ch["id"], "len", len(ch.get("content") or ""))
        print(ch.get("content")[:900])
        print()
