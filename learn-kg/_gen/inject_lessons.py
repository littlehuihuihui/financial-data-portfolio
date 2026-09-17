# -*- coding: utf-8 -*-
"""Inject lessons as external kg-data JSON (lazy) + keep HTML stubs.

Legacy full-inline inject removed for performance. Run optimize_kg_perf.py
or this script after editing _gen/lessons/*.json.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORDER = ["sql", "python", "database", "ml", "etl", "dwh", "bi"]
LESSONS = Path(__file__).resolve().parent / "lessons"
OUT_DIRS = [
    ROOT / "kg-data",
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\kg-data"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\kg-data"),
]


def main():
    trees = {k: json.loads((LESSONS / f"{k}.json").read_text(encoding="utf-8")) for k in ORDER}
    for out in OUT_DIRS:
        out.mkdir(parents=True, exist_ok=True)
        for k, tree in trees.items():
            (out / f"{k}.json").write_text(
                json.dumps(tree, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
        print("wrote", out)
    # Prefer full optimizer if present (keeps HTML loader intact)
    opt = Path(__file__).resolve().parent / "optimize_kg_perf.py"
    if opt.exists():
        # only re-export via optimize's export — avoid re-bloating HTML
        print("HTML uses lazy kg-data; skipped inline inject. OK")
    print("hubs", ORDER)


if __name__ == "__main__":
    main()
