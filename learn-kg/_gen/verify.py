# -*- coding: utf-8 -*-
from pathlib import Path
import subprocess
import shutil

p = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
t = p.read_text(encoding="utf-8")
print("size", p.stat().st_size)
print("DOCTYPE", t.startswith("<!DOCTYPE html>"))
print("end", repr(t.strip()[-30:]))
print("script tags", t.count("<script"), t.count("</script>"))
print("placeholders left", "__NODES__" in t or "__LAYOUT__" in t)
print("catalog true", t.count('"catalog": true'))
print("PostgreSQL", "PostgreSQL" in t)
for x in ["调度编排", "数据湖", "指标/语义层", "数据质量", "特征工程", "DATA NEXUS", "Orbitron"]:
    print("has", x, x in t)
print("panel-w", "--panel-w: 540px" in t)
print("compare keys", all(k in t for k in ['"type"', '"workload"', '"storage"', '"language"', '"pros"', '"cons"', '"scenario"']))

idx = t.rfind("<script>")
js = t[idx + 8 : t.rfind("</script>")]
check = Path(r"D:\cursor\数据学习平台\数据学习平台\_gen\check.js")
check.write_text(js, encoding="utf-8")

node = shutil.which("node")
if node:
    r = subprocess.run([node, "--check", str(check)], capture_output=True, text=True)
    print("node --check exit", r.returncode)
    if r.stderr:
        print(r.stderr[:2000])
else:
    print("node not found; skip JS parse check")

# brace balance rough
print("brace delta", js.count("{") - js.count("}"))
print("paren delta", js.count("(") - js.count(")"))
print("backtick delta", js.count("`") % 2)
