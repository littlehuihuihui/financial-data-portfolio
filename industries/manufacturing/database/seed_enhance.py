#!/usr/bin/env python3
"""制造业数仓增强 · 造数（P0+P1）
- 建新表（08_enhance.sql）
- 灌维度：dim_factory / dim_equipment / dim_defect_type
- 灌事实：dwd_equipment_run / fact_material_consumption / fact_process_operation / dwd_labor_wide
数据均基于现有 ods/dim/dws 派生，保持口径一致。
"""
from __future__ import annotations

import random
from pathlib import Path

import pymysql

DDL_DIR = Path(__file__).resolve().parent
BATCH = "MFG_ENH_202607"

FACTORY_META = {
    "F01": ("华南工厂", "华南", "佛山"),
    "F02": ("华东工厂", "华东", "苏州"),
    "F03": ("华北工厂", "华北", "天津"),
}

DEFECT_META = [
    ("DF01", "尺寸偏差", "尺寸", "一般", "刀具磨损/定位误差"),
    ("DF02", "表面划伤", "外观", "轻微", "搬运磕碰/夹具毛刺"),
    ("DF03", "材料缺陷", "材料", "严重", "来料不良/批次异常"),
    ("DF04", "装配不良", "装配", "一般", "工装误差/操作不规范"),
    ("DF05", "焊接气孔", "功能", "严重", "焊接参数/母材含油"),
    ("DF06", "涂装不良", "外观", "轻微", "喷涂环境/前处理不足"),
]
DEFECT_NAME_TO_CODE = {n: c for c, n, *_ in DEFECT_META}

EQUIP_TYPES = ["CNC加工中心", "注塑机", "焊接机器人", "装配线", "涂装线", "冲压机"]
VENDORS = ["发那科", "西门子", "库卡", "海天", "大隈"]
PROCESS_STEPS = [(1, "下料"), (2, "加工"), (3, "装配"), (4, "检验"), (5, "包装")]


def db_config():
    return {"host": "127.0.0.1", "port": 3306, "user": "root", "password": "123456",
            "database": "manufacturing_analytics", "charset": "utf8mb4", "autocommit": False}


def run_sql_file(cur, path: Path):
    buf, stmts = [], []
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if s.startswith("--"):
            continue
        buf.append(line)
        if s.endswith(";"):
            stmt = "\n".join(buf).strip()
            if stmt:
                stmts.append(stmt)
            buf = []
    for stmt in stmts:
        cur.execute(stmt)


def seed_dims(cur):
    # dim_factory
    cur.execute("SELECT factory_code, COUNT(*) FROM dim_production_line GROUP BY factory_code")
    line_cnt = {fc: n for fc, n in cur.fetchall()}
    frows = []
    for i, (fc, (fn, region, city)) in enumerate(FACTORY_META.items(), start=1):
        frows.append((i, fc, fn, region, city, "综合制造", line_cnt.get(fc, 0),
                      random.randint(280, 620), round(random.uniform(12000, 38000), 2), "启用", 0, BATCH))
    cur.execute("DELETE FROM dim_factory")
    cur.executemany("""INSERT INTO dim_factory
        (factory_sk,factory_code,factory_name,region,city,factory_type,line_count,employee_count,floor_area_sqm,factory_status,is_unknown,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", frows)
    cur.execute("INSERT IGNORE INTO dim_factory (factory_sk,factory_code,factory_name,is_unknown) VALUES (-1,'-1','未知工厂',1)")

    # dim_equipment（从 ods_equipment + dim_production_line 派生）
    cur.execute("""SELECT e.equipment_code, e.equipment_name, e.line_code, dl.factory_code, dl.factory_name, dl.design_capacity_daily
                   FROM ods_equipment e LEFT JOIN dim_production_line dl ON e.line_code=dl.line_code""")
    erows = []
    for i, (ec, en, lc, fc, fn, cap) in enumerate(cur.fetchall(), start=1):
        fc = fc or "-1"
        fn = fn or "未知"
        erows.append((i, ec, en, lc, "", fc, fn, random.choice(EQUIP_TYPES),
                      round((cap or 100) / 8.0, 2), random.choice(VENDORS),
                      f"20{random.randint(18,23)}-0{random.randint(1,9)}-1{random.randint(0,9)}",
                      "运行", 0, BATCH))
    cur.execute("DELETE FROM dim_equipment")
    cur.executemany("""INSERT INTO dim_equipment
        (equipment_sk,equipment_code,equipment_name,line_code,line_name,factory_code,factory_name,equipment_type,rated_capacity,vendor,install_date,equipment_status,is_unknown,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", erows)
    # 回填 line_name
    cur.execute("""UPDATE dim_equipment de JOIN dim_production_line dl ON de.line_code=dl.line_code
                   SET de.line_name=dl.line_name""")
    cur.execute("INSERT IGNORE INTO dim_equipment (equipment_sk,equipment_code,equipment_name,is_unknown) VALUES (-1,'-1','未知设备',1)")

    # dim_defect_type
    cur.execute("DELETE FROM dim_defect_type")
    cur.executemany("""INSERT INTO dim_defect_type
        (defect_type_sk,defect_type_code,defect_type_name,defect_category,severity,typical_cause,is_unknown,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(i, c, n, cat, sev, cause, 0, BATCH) for i, (c, n, cat, sev, cause) in enumerate(DEFECT_META, start=1)])
    cur.execute("INSERT IGNORE INTO dim_defect_type (defect_type_sk,defect_type_code,defect_type_name,is_unknown) VALUES (-1,'-1','未知缺陷',1)")


def seed_equipment_run(cur):
    """基于 dws_equipment_daily 明细化为 dwd_equipment_run（1 行/日·设备，班次D）。"""
    cur.execute("""SELECT d.snapshot_date, d.equipment_code, d.line_code, de.factory_code, de.equipment_name,
                          d.availability_pct, d.performance_pct, d.quality_pct, d.oee_pct, d.downtime_hours,
                          d.failure_count, d.downtime_reason
                   FROM dws_equipment_daily d
                   LEFT JOIN dim_equipment de ON d.equipment_code=de.equipment_code""")
    rows = cur.fetchall()
    ins = []
    for (sd, ec, lc, fc, en, avail, perf, qual, oee, dth, fcnt, reason) in rows:
        fc = fc or "-1"
        en = en or "未知"
        planned = 1440.0  # 全天分钟
        downtime_min = round(float(dth or 0) * 60, 2)
        run_min = round(max(0.0, planned - downtime_min) * float(avail or 0) / 100.0, 2)
        output = int(run_min / 60.0 * random.uniform(45, 75))
        good = int(output * float(qual or 0) / 100.0)
        ins.append((sd, ec, en, lc, fc, "D", planned, run_min, downtime_min, reason or "正常",
                    output, good, int(fcnt or 0), avail, perf, qual, oee, BATCH))
    cur.execute("DELETE FROM dwd_equipment_run")
    cur.executemany("""INSERT INTO dwd_equipment_run
        (run_date,equipment_code,equipment_name,line_code,factory_code,shift_code,planned_time_min,run_time_min,downtime_min,downtime_reason,
         output_qty,good_qty,failure_count,availability_pct,performance_pct,quality_pct,oee_pct,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ins)
    return len(ins)


def seed_material_consumption(cur):
    """每工单领用 2-3 种物料，量随工单实际产量变化。"""
    cur.execute("SELECT material_code, material_name, standard_price FROM dim_material")
    materials = cur.fetchall()
    cur.execute("SELECT order_id, order_date, factory_code, line_code, product_code, actual_qty FROM ods_production_order")
    orders = cur.fetchall()
    ins = []
    for (oid, od, fc, lc, pc, aqty) in orders:
        for mat in random.sample(materials, random.randint(2, 3)):
            mc, mn, price = mat
            price = float(price or 0)
            bom = round(random.uniform(0.5, 2.5), 2)
            plan_q = round((aqty or 0) * bom, 2)
            actual_q = round(plan_q * random.uniform(0.98, 1.08), 2)
            amount = round(actual_q * price, 2)
            ins.append((od, oid, mc, mn, fc, lc, pc, plan_q, actual_q, price, amount, round(actual_q - plan_q, 2), BATCH))
    cur.execute("DELETE FROM fact_material_consumption")
    cur.executemany("""INSERT INTO fact_material_consumption
        (consume_date,order_id,material_code,material_name,factory_code,line_code,product_code,plan_qty,actual_qty,unit_price,consume_amount,variance_qty,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ins)
    return len(ins)


def seed_process_operation(cur):
    """每工单展开 5 道工序；近月少量在制。"""
    cur.execute("""SELECT o.order_id, o.order_date, o.factory_code, o.line_code, o.product_code, o.actual_qty,
                          o.plan_hours, o.order_status, e.equipment_code
                   FROM ods_production_order o
                   LEFT JOIN dim_equipment e ON e.line_code=o.line_code""")
    orders = cur.fetchall()
    ins = []
    for (oid, od, fc, lc, pc, aqty, phours, ostatus, eq) in orders:
        aqty = aqty or 0
        eq = eq or "-1"
        in_progress = random.random() < 0.05  # 5% 工单在制
        carry = aqty
        for seq, step in PROCESS_STEPS:
            input_q = carry
            # 各工序良率
            good = int(input_q * random.uniform(0.95, 0.995))
            defect = input_q - good
            if in_progress and seq >= 4:
                op_status = "在制" if seq == 4 else "待产"
                output_q = 0 if seq == 5 else good
                wip = input_q
                good_q = 0 if seq == 5 else good
            else:
                op_status = "完成"
                output_q = good
                wip = 0
                good_q = good
            plan_h = round(float(phours or 0) / 5.0, 2)
            act_h = round(plan_h * random.uniform(0.9, 1.15), 2)
            ins.append((oid, seq, step, od, fc, lc, eq, pc, input_q, output_q, good_q, defect, wip,
                        plan_h, act_h, op_status, BATCH))
            carry = good
    cur.execute("DELETE FROM fact_process_operation")
    cur.executemany("""INSERT INTO fact_process_operation
        (order_id,step_seq,process_step,report_date,factory_code,line_code,equipment_code,product_code,
         input_qty,output_qty,good_qty,defect_qty,wip_qty,plan_hours,actual_hours,op_status,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ins)
    return len(ins)


def seed_labor_wide(cur):
    """从 ods_labor 派生人工事实宽表，回填工厂/产线/产品维度。"""
    cur.execute("""SELECT l.labor_id, l.order_id, l.work_date, dl.factory_code, dl.factory_name,
                          l.line_code, dl.line_name, o.product_code, l.plan_hours, l.actual_hours, l.labor_cost
                   FROM ods_labor l
                   LEFT JOIN dim_production_line dl ON l.line_code=dl.line_code
                   LEFT JOIN ods_production_order o ON l.order_id=o.order_id""")
    rows = cur.fetchall()
    ins = []
    for (lid, oid, wd, fc, fn, lc, ln, pc, ph, ah, cost) in rows:
        ph = float(ph or 0); ah = float(ah or 0)
        ach = round(ah / ph * 100, 2) if ph else 0
        ins.append((lid, oid, wd, fc or "-1", fn or "未知", lc, ln or "未知", pc or "-1", "D",
                    ph, ah, ach, float(cost or 0), BATCH))
    cur.execute("DELETE FROM dwd_labor_wide")
    cur.executemany("""INSERT INTO dwd_labor_wide
        (labor_id,order_id,work_date,factory_code,factory_name,line_code,line_name,product_code,shift_code,
         plan_hours,actual_hours,hours_achievement_pct,labor_cost,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ins)
    return len(ins)


def main():
    random.seed(202607)
    conn = pymysql.connect(**db_config())
    try:
        cur = conn.cursor()
        run_sql_file(cur, DDL_DIR / "08_enhance.sql")
        seed_dims(cur)
        n_run = seed_equipment_run(cur)
        n_mat = seed_material_consumption(cur)
        n_op = seed_process_operation(cur)
        n_lab = seed_labor_wide(cur)
        conn.commit()
        print("enhance seeded OK:",
              f"equipment_run={n_run}, material_consumption={n_mat}, process_operation={n_op}, labor_wide={n_lab}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
