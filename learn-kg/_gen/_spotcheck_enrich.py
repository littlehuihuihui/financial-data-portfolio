# -*- coding: utf-8 -*-
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent
for hub, lid in [("ml", "ml-supervised"), ("database", "db-acid"), ("python", "py-merge")]:
    t = json.loads((ROOT / "lessons" / f"{hub}.json").read_text(encoding="utf-8"))

    def find(n, i):
        if n.get("id") == i:
            return n
        for c in n.get("children") or []:
            r = find(c, i)
            if r:
                return r

    n = find(t, lid)
    c = n["content"]
    print("=" * 60, lid, "len=", len(c))
    print(c[:1800])
    print("...\n")
