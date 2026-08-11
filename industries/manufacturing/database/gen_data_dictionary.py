#!/usr/bin/env python3
"""从 manufacturing DDL 生成 data-dictionary-data.js（含中文表名与字段）。"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / "js" / "data-dictionary-data.js"

SQL_FILES = [
    "01_ods.sql",
    "02_dim.sql",
    "03_dwd.sql",
    "04_dws.sql",
    "05_ads.sql",
    "07_fact_aliases.sql",
    "08_enhance.sql",
]


FIELD_CN = {
    "order_id": "工单号", "order_sk": "工单代理键", "order_date": "开工日期", "due_date": "交付日期",
    "factory_code": "工厂编码", "factory_name": "工厂名称", "line_code": "产线编码", "line_name": "产线名称",
    "product_code": "产品编码", "product_name": "产品名称", "product_sk": "产品代理键",
    "plan_qty": "计划产量", "actual_qty": "实际产量", "output_qty": "产出数量",
    "plan_hours": "计划工时", "actual_hours": "实际工时", "labor_hours": "工时",
    "delivered_on_time": "是否准时交付", "order_status": "工单状态",
    "source_system": "来源系统", "etl_batch_id": "ETL批次",
    "design_capacity_daily": "日设计产能", "line_status": "产线状态", "shift_count": "班次数",
    "process_type": "工艺类型", "inspect_id": "质检单号", "inspect_date": "质检日期",
    "total_qty": "检验总数", "pass_qty": "合格数", "defect_qty": "不良数", "scrap_qty": "报废数",
    "defect_type": "缺陷类型", "inspect_type": "检验类型", "is_rework": "是否返工",
    "inspector_id": "质检员", "material_code": "物料编码", "material_name": "物料名称",
    "material_sk": "物料代理键", "material_type": "物料类型", "standard_price": "标准单价",
    "unit": "单位", "category_code": "品类编码", "abc_class": "ABC分类",
    "material_status": "物料状态", "snapshot_date": "快照日", "warehouse_code": "仓库编码",
    "on_hand_qty": "现存量", "safety_stock": "安全库存", "daily_usage": "日均用量",
    "on_hand_amount": "库存金额", "inbound_qty": "入库量", "outbound_qty": "出库量",
    "inventory_status": "库存状态", "supplier_code": "供应商编码", "supplier_name": "供应商名称",
    "supplier_sk": "供应商代理键", "region": "区域", "supplier_level": "供应商等级",
    "contact_name": "联系人", "lead_time_days": "交期天数", "supplier_status": "供应商状态",
    "equipment_code": "设备编码", "equipment_name": "设备名称", "equipment_sk": "设备代理键",
    "equipment_type": "设备类型", "rated_capacity": "额定产能", "equipment_status": "设备状态",
    "install_date": "安装日期", "labor_id": "工时记录ID", "work_date": "作业日期",
    "worker_id": "员工ID", "shift_code": "班次", "labor_cost": "人工成本", "labor_status": "工时状态",
    "product_category": "产品品类", "standard_unit_cost": "标准单位成本", "product_status": "产品状态",
    "launch_date": "上市日期", "is_unknown": "是否未知维", "date_id": "日期", "date_sk": "日期代理键",
    "year_num": "年", "month_num": "月", "day_num": "日", "week_of_year": "周序号",
    "is_weekend": "是否周末", "month_label": "年月标签", "quarter_num": "季度", "day_name": "星期",
    "yield_rate": "良品率", "yield_rate_pct": "良品率%", "defect_rate_pct": "不良率%",
    "scrap_rate_pct": "报废率%", "first_pass_pct": "一次通过率%", "fpy_pct": "FPY%",
    "capacity_util_pct": "产能利用率%", "on_time_delivery_pct": "准时交付率%",
    "oee_pct": "OEE%", "availability_pct": "可用率%", "performance_pct": "性能率%",
    "quality_pct": "质量率%", "downtime_hours": "停机小时", "downtime_min": "停机分钟",
    "failure_count": "故障次数", "downtime_reason": "停机原因",
    "purchase_amount": "采购金额", "inventory_turnover_days": "库存周转天数",
    "supplier_otd_pct": "供应商OTD%", "snapshot_month": "年月",
    "total_cost": "总成本", "unit_cost": "单位成本", "material_cost": "材料成本",
    "overhead_cost": "制造费用", "material_pct": "材料成本占比%", "labor_pct": "人工成本占比%",
    "overhead_pct": "制造费用占比%", "unit_material": "单位材料成本", "unit_labor": "单位人工成本",
    "line_sk": "产线代理键",
    "hours_achievement_pct": "工时达成率%",
    "worker_count": "工人数",
    "order_count": "工单数",
    "inspect_count": "质检次数",
    "turnover_days": "周转天数",
    "max_on_hand": "最高库存",
}

# 血缘（用于字典展示 / 跳转）
LINEAGE_EDGES = [
    ("ods_production_order", "dwd_production_wide"),
    ("ods_quality_inspection", "dwd_quality_wide"),
    ("ods_inventory_material", "dwd_supply_wide"),
    ("ods_labor", "dwd_labor_wide"),
    ("ods_labor", "dws_labor_monthly"),
    ("dwd_labor_wide", "dws_labor_monthly"),
    ("ods_inventory_material", "dws_material_daily"),
    ("ods_quality_inspection", "dws_defect_daily"),
    ("dwd_production_wide", "dws_production_daily"),
    ("dwd_quality_wide", "dws_quality_daily"),
    ("dwd_supply_wide", "dws_supply_daily"),
    ("ods_equipment", "dws_equipment_daily"),
    ("dwd_equipment_run", "dws_equipment_daily"),
    ("dws_labor_monthly", "v_labor_efficiency"),
    ("dws_material_daily", "v_material_turnover"),
    ("dws_defect_daily", "v_defect_analysis"),
    ("dws_production_daily", "v_production_overview"),
    ("dws_quality_daily", "v_quality_analysis"),
    ("dws_supply_daily", "v_supply_chain"),
    ("dws_equipment_daily", "v_equipment_oee"),
    ("dws_cost_monthly", "v_cost_analysis"),
    ("dws_cost_monthly", "v_manufacturing_finance"),
    ("dws_production_daily", "v_capacity_utilization"),
    ("dws_production_daily", "v_cmei_daily"),
]


def layer_of(name: str) -> str:
    if name.startswith("ods_"):
        return "ODS"
    if name.startswith("dim_"):
        return "DIM"
    if name.startswith("dwd_") or name.startswith("fact_"):
        return "DWD"
    if name.startswith("dws_"):
        return "DWS"
    if name.startswith("v_") or name.startswith("ads_"):
        return "ADS"
    return "ADS"


def field_label(name: str, comment: str | None) -> str:
    if comment and comment.strip() and comment.strip() != name:
        return comment.strip()
    return FIELD_CN.get(name, name)


def name_cn_from_comment(comment: str, name: str) -> str:
    """从表 COMMENT 提取中文名，如 ODS·生产工单·增量表 → 生产工单。"""
    c = (comment or "").strip()
    if not c:
        return name
    # 去掉层前缀与类型后缀
    parts = re.split(r"[·•\|\-_/]", c)
    parts = [p.strip() for p in parts if p.strip()]
    skip = {
        "ODS", "DIM", "DWD", "DWS", "ADS",
        "增量表", "全量表", "快照表", "拉链表", "增量", "全量", "快照", "拉链",
        "日快照表", "日快照", "视图",
    }
    meaningful = [p for p in parts if p not in skip and not re.fullmatch(r"[A-Za-z0-9_]+", p)]
    if meaningful:
        return meaningful[0]
    # 退化为去掉 ODS· 前缀
    m = re.search(r"[·•]([^·•]+)", c)
    return m.group(1).strip() if m else c


def parse_fields_from_body(body: str) -> list[dict]:
    fields = []
    for line in body.splitlines():
        line = line.strip().rstrip(",")
        if not line:
            continue
        up = line.upper()
        if up.startswith(("PRIMARY", "KEY", "UNIQUE", "CONSTRAINT", "INDEX", "FOREIGN", "CHECK")):
            continue
        fm = re.match(r"`?(\w+)`?\s+([A-Za-z]+(?:\([^)]*\))?)", line)
        if not fm:
            continue
        fn, ft = fm.group(1), fm.group(2)
        if fn.upper() in {"PRIMARY", "UNIQUE", "KEY", "CONSTRAINT"}:
            continue
        desc_m = re.search(r"COMMENT\s+'([^']*)'", line, re.I)
        desc = field_label(fn, desc_m.group(1) if desc_m else None)
        role = "attr"
        if "PRIMARY KEY" in up or re.search(r"\bPRIMARY\b", up):
            role = "pk"
        elif fn.endswith("_id") or fn.endswith("_sk") or fn.endswith("_code"):
            role = "fk" if not fn.endswith("_sk") else "bk"
            if fn.endswith("_id") and ("PRIMARY" in up or fn == "id"):
                role = "pk"
        elif any(x in fn for x in ("_qty", "_amount", "_pct", "_rate", "_cost", "_hours", "_count")):
            role = "measure"
        name_cn = desc if any("\u4e00" <= ch <= "\u9fff" for ch in desc) else FIELD_CN.get(fn, fn)
        fields.append({
            "name": fn,
            "name_cn": name_cn,
            "type": ft[:24],
            "desc": desc,
            "business": desc,
            "role": role,
        })
    return fields


def parse_view_fields(select_body: str) -> list[dict]:
    """粗解析 VIEW SELECT 列表别名。"""
    # 去掉 FROM 之后
    m = re.search(r"\bFROM\b", select_body, re.I)
    head = select_body[: m.start()] if m else select_body
    fields = []
    # 按逗号拆（忽略函数内逗号的简化：按 AS alias / 末尾标识符）
    for part in re.split(r",\s*(?![^()]*\))", head):
        part = part.strip()
        if not part:
            continue
        am = re.search(r"\bAS\s+`?(\w+)`?\s*$", part, re.I)
        if am:
            fn = am.group(1)
        else:
            # 裸列名
            bm = re.search(r"`?(\w+)`?\s*$", part)
            if not bm:
                continue
            fn = bm.group(1)
            if fn.upper() in {"SELECT", "DISTINCT"}:
                continue
        label = field_label(fn, None)
        fields.append({
            "name": fn,
            "name_cn": label,
            "type": "EXPR",
            "desc": label,
            "business": label,
            "role": "measure" if any(x in fn for x in ("_qty", "_pct", "_amount", "_cost", "_rate", "_hours")) else "attr",
        })
    return fields


FACT_CN = {
    "fact_production": "生产事实",
    "fact_quality": "质量事实",
    "fact_supply": "供应事实",
    "fact_labor": "人工事实",
    "fact_equipment_run": "设备运行事实",
}


def parse_ddl(sql: str) -> list[dict]:
    objs: list[dict] = []
    seen: set[str] = set()
    by_name: dict[str, dict] = {}

    # TABLE ... ) COMMENT '...'
    for m in re.finditer(
        r"CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\((.*?)\)\s*COMMENT\s+'([^']*)'",
        sql,
        re.S | re.I,
    ):
        name, body, comment = m.group(1), m.group(2), m.group(3)
        if name in seen:
            continue
        seen.add(name)
        fields = parse_fields_from_body(body)
        cn = name_cn_from_comment(comment, name)
        obj = {
            "name": name,
            "name_cn": cn,
            "layer": layer_of(name),
            "type": "table",
            "purpose": comment,
            "summary": comment,
            "source": "manufacturing_analytics/database",
            "downstream": ["Web看板"],
            "lineage": [name],
            "field_count": len(fields),
            "fields": fields,
        }
        objs.append(obj)
        by_name[name] = obj

    # TABLE without trailing COMMENT
    for m in re.finditer(
        r"CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\((.*?)\)\s*;",
        sql,
        re.S | re.I,
    ):
        name, body = m.group(1), m.group(2)
        if name in seen:
            continue
        seen.add(name)
        fields = parse_fields_from_body(body)
        obj = {
            "name": name,
            "name_cn": name,
            "layer": layer_of(name),
            "type": "table",
            "purpose": name,
            "summary": name,
            "source": "manufacturing_analytics/database",
            "downstream": ["Web看板"],
            "lineage": [name],
            "field_count": len(fields),
            "fields": fields,
        }
        objs.append(obj)
        by_name[name] = obj

    # VIEWS
    cn_map = {
        "v_production_overview": "生产总览",
        "v_quality_analysis": "质量分析",
        "v_supply_chain": "供应链",
        "v_equipment_oee": "设备OEE",
        "v_cost_analysis": "成本分析",
        "v_capacity_utilization": "产能利用率",
        "v_manufacturing_finance": "制造财务",
        "v_cmei_daily": "综合效能CMEI",
        "v_defect_analysis": "缺陷分析",
        "v_material_turnover": "物料周转",
        "v_labor_efficiency": "人效分析",
        **FACT_CN,
    }
    for m in re.finditer(
        r"CREATE OR REPLACE VIEW\s+(\w+)\s+AS\s+(SELECT\b.*?)(?=;|\Z)",
        sql,
        re.S | re.I,
    ):
        name, select_sql = m.group(1), m.group(2)
        if name in seen:
            continue
        seen.add(name)
        # SELECT * FROM src → 复用源表字段
        star = re.search(r"SELECT\s+\*\s+FROM\s+(\w+)", select_sql, re.I)
        if star and star.group(1) in by_name:
            src = by_name[star.group(1)]
            fields = [dict(f) for f in src["fields"]]
            lineage = [star.group(1), name]
        else:
            fields = parse_view_fields(select_sql)
            lineage = [name]
        cn = cn_map.get(name) or name_cn_from_comment("", name)
        if name.startswith("fact_"):
            layer, typ, purpose = "DWD", "view", f"DWD·{cn}（同义视图）"
        else:
            layer, typ, purpose = "ADS", "view", f"ADS·{cn}"
            if cn == name:
                cn = name.replace("v_", "").replace("_", " ")
                purpose = f"ADS·{cn}"
        obj = {
            "name": name,
            "name_cn": cn if cn != name else cn_map.get(name, cn),
            "layer": layer,
            "type": typ,
            "purpose": purpose,
            "summary": purpose,
            "source": "manufacturing_analytics/database",
            "downstream": ["Web看板"],
            "lineage": lineage,
            "field_count": len(fields),
            "fields": fields,
        }
        objs.append(obj)
        by_name[name] = obj

    return objs


def apply_lineage(objs: list[dict]) -> None:
    by = {o["name"]: o for o in objs}
    ups: dict[str, list[str]] = {}
    downs: dict[str, list[str]] = {}
    for a, b in LINEAGE_EDGES:
        if a not in by or b not in by:
            continue
        ups.setdefault(b, []).append(a)
        downs.setdefault(a, []).append(b)
    for o in objs:
        name = o["name"]
        up = ups.get(name, [])
        down = [d for d in downs.get(name, []) if d != "Web看板"]
        chain = [*up, name, *down]
        # 去重保序
        seen = set()
        o["lineage"] = [x for x in chain if not (x in seen or seen.add(x))]
        o["downstream"] = down or ["Web看板"]


def main() -> None:
    sql = "\n".join(
        (ROOT / f).read_text(encoding="utf-8")
        for f in SQL_FILES
        if (ROOT / f).exists()
    )
    objs = parse_ddl(sql)
    apply_lineage(objs)
    # 稳定排序：按层序再按名
    order = {"ODS": 0, "DIM": 1, "DWD": 2, "DWS": 3, "ADS": 4}
    objs.sort(key=lambda o: (order.get(o["layer"], 9), o["name"]))

    empty = sum(1 for o in objs if not o["fields"])
    ov = [
        {
            "layer": o["layer"],
            "table_name": o["name"],
            "field_count": o["field_count"],
            "target_range": "8-25",
            "quality_status": "达标" if o["field_count"] >= 5 else "待补",
        }
        for o in objs
    ]
    OUT.write_text(
        "/** manufacturing_analytics 数据字典 · 由 database/gen_data_dictionary.py 生成 */\n"
        f"window.DATA_DICTIONARY={json.dumps(objs, ensure_ascii=False, indent=2)};\n"
        f"window.WAREHOUSE_FIELD_OVERVIEW={json.dumps(ov, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(objs)} objects ({empty} empty-field) -> {OUT}")


if __name__ == "__main__":
    main()
