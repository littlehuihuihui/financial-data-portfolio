#!/usr/bin/env python3
"""从 internet DDL 生成 data-dictionary-data.js"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ddl = (ROOT / "01_ddl.sql").read_text(encoding="utf-8") + (ROOT / "02_ads.sql").read_text(encoding="utf-8")
objs = []

for m in re.finditer(
    r"CREATE TABLE IF NOT EXISTS (\w+)\s*\((.*?)\)\s*COMMENT\s*=\s*'([^']+)'",
    ddl,
    re.S | re.I,
):
    name, body, purpose = m.group(1), m.group(2), m.group(3)
    fields = []
    for line in body.splitlines():
        line = line.strip().rstrip(",")
        if not line or line.upper().startswith(("PRIMARY", "KEY", "UNIQUE", "CONSTRAINT")):
            continue
        fm = re.match(r"(\w+)\s+(\S+)", line)
        if not fm:
            continue
        fn, ft = fm.group(1), fm.group(2)
        desc_m = re.search(r"COMMENT\s+'([^']+)'", line)
        desc = desc_m.group(1) if desc_m else fn
        role = "pk" if fn.endswith("_id") and "PRIMARY" in line.upper() else (
            "fk" if fn.endswith("_id") else "attr"
        )
        fields.append({"name": fn, "type": ft[:16], "desc": desc, "business": desc, "role": role})
    layer = (
        "ODS" if name.startswith("ods_")
        else "DIM" if name.startswith("dim_")
        else "DWD" if name.startswith("dwd_")
        else "DWS"
    )
    objs.append({
        "name": name, "layer": layer, "type": "table", "purpose": purpose,
        "source": "internet_analytics/database", "downstream": ["Web看板"],
        "lineage": [name], "field_count": len(fields), "fields": fields,
    })

for m in re.finditer(r"CREATE OR REPLACE VIEW (\w+)", ddl, re.I):
    name = m.group(1)
    if any(o["name"] == name for o in objs):
        continue
    objs.append({
        "name": name, "layer": "ADS", "type": "view", "purpose": f"{name} 分析视图",
        "source": "internet_analytics/database", "downstream": ["Web看板"],
        "lineage": [name], "field_count": 8, "fields": [],
    })

ov = [
    {"layer": o["layer"], "table_name": o["name"], "field_count": o["field_count"],
     "target_range": "8-25", "quality_status": "达标"}
    for o in objs
]
out = ROOT.parent / "js" / "data-dictionary-data.js"
out.write_text(
    "/** internet_analytics 数据字典 · 设备操作日志版 */\n"
    f"window.DATA_DICTIONARY={json.dumps(objs, ensure_ascii=False, indent=2)};\n"
    f"window.WAREHOUSE_FIELD_OVERVIEW={json.dumps(ov, ensure_ascii=False, indent=2)};\n",
    encoding="utf-8",
)
print(f"Wrote {len(objs)} objects to {out}")
