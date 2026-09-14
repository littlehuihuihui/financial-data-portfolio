# -*- coding: utf-8 -*-
import re
from pathlib import Path

GEN = Path(__file__).resolve().parent
for f in ["patch_python_expand.py", "build_database_tree.py", "build_ml_tree.py", "patch_database_kg.py"]:
    p = GEN / f
    if not p.exists():
        print("missing", f)
        continue
    t = p.read_text(encoding="utf-8")
    ids = re.findall(r'\["((?:py|db|ml)-[^"]+)"\]', t)
    print(f, "bytes", len(t), "ids", len(ids), "gold_fn", t.count("def gold"), "keqian", t.count("### 课前"))
    if ids[:8]:
        print("  sample ids", ids[:8])
