# -*- coding: utf-8 -*-
"""Survey non-leaf vs leaf content depth for py/db/ml."""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
LESSONS = Path(__file__).resolve().parent / "lessons"


def walk(n, depth=0, parent=None):
    kids = n.get("children") or []
    kind = "leaf" if not kids else ("chapter" if n.get("lessonParent") else ("domain" if depth == 1 else "mid"))
    yield {
        "id": n.get("id"),
        "title": n.get("title"),
        "depth": depth,
        "kind": kind,
        "len": len(n.get("content") or ""),
        "lessonParent": bool(n.get("lessonParent")),
    }
    for c in kids:
        yield from walk(c, depth + 1, n)


for hub in ("python", "database", "ml"):
    t = json.loads((LESSONS / f"{hub}.json").read_text(encoding="utf-8"))
    rows = list(walk(t, 0))
    print(f"\n## {hub}")
    for kind in ("domain", "chapter", "mid", "leaf"):
        xs = [r for r in rows if r["kind"] == kind and r["depth"] > 0]
        if not xs:
            continue
        lens = sorted(x["len"] for x in xs)
        print(f"  {kind}: n={len(xs)} min={lens[0]} med={lens[len(lens)//2]} max={lens[-1]}")
    thin = [r for r in rows if r["depth"] > 0 and r["kind"] != "leaf" and r["len"] < 800]
    print(f"  thin non-leaf <800: {len(thin)}")
    for r in thin[:12]:
        print(f"    [{r['kind']}] {r['id']} {r['title']} len={r['len']}")
    if len(thin) > 12:
        print(f"    ... +{len(thin)-12} more")
