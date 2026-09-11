# -*- coding: utf-8 -*-
from pathlib import Path
import re, subprocess, tempfile, os
html = Path("数据知识图谱.html").read_text(encoding="utf-8")
m = re.search(r"const SQL_KNOWLEDGE_TREE = (\{.*?\});\s*\n\s*const KG_TREES", html, re.S)
print("match", bool(m), "len", len(m.group(1)) if m else 0)
js = Path("_gen/tmp_tree.js")
js.write_text(
    "const t=" + m.group(1) + ";\n"
    "console.log('kids', t.children.length);\n"
    "t.children.forEach(c=>console.log('-', c.id, c.title, c.level));\n",
    encoding="utf-8",
)
subprocess.check_call(["node", str(js)])
