#!/usr/bin/env python3
"""制造业 · 样例数据灌入 2024-01 ~ 2026-07"""
from __future__ import annotations

import random
from calendar import monthrange
from datetime import date, timedelta
from pathlib import Path

import pymysql

DDL_DIR = Path(__file__).resolve().parent
BATCH = "MFG202607"
START = date(2024, 1, 1)
END = date(2026, 7, 31)

FACTORIES = [("F01", "华南工厂"), ("F02", "华东工厂"), ("F03", "华北工厂")]
LINES = []
for fc, fn in FACTORIES:
    for i in range(1, 5):
        LINES.append((f"{fc}-L{i:02d}", f"{fn}{i}号线", fc, 120 + i * 10))

PRODUCTS = [
    ("P01", "精密齿轮箱", "传动件", 128.0),
    ("P02", "液压阀体", "液压件", 95.0),
    ("P03", "电机外壳", "结构件", 72.0),
    ("P04", "控制面板", "电子件", 156.0),
    ("P05", "连接器组件", "电子件", 48.0),
    ("P06", "支架总成", "结构件", 88.0),
]

DEFECT_TYPES = ["尺寸偏差", "表面划伤", "材料缺陷", "装配不良", "焊接气孔", "涂装不良"]

SUPPLIERS = [(f"S{i:02d}", f"供应商{i:02d}", random.choice(["华东", "华南", "华北"])) for i in range(1, 13)]

MATERIALS = [(f"M{i:02d}", f"原材料{i:02d}", random.choice(["钢材", "铝材", "塑料", "铜材"]),
              round(random.uniform(8, 120), 2)) for i in range(1, 26)]

EQUIPMENT = []
for lc, ln, fc, cap in LINES:
    EQUIPMENT.append((f"EQ-{lc}", f"{ln}主设备", lc))


def db_config():
    return {"host": "127.0.0.1", "port": 3306, "user": "root", "password": "123456",
            "charset": "utf8mb4", "autocommit": False}


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


def daterange(start: date, end: date):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def seed_dims(cur):
    cur.executemany(
        "INSERT IGNORE INTO dim_product (product_code,product_name,product_category,standard_unit_cost) VALUES (%s,%s,%s,%s)",
        PRODUCTS)
    cur.executemany(
        "INSERT IGNORE INTO dim_production_line (line_code,line_name,factory_code,factory_name,design_capacity_daily) VALUES (%s,%s,%s,%s,%s)",
        [(lc, ln, fc, dict(FACTORIES)[fc], cap) for lc, ln, fc, cap in LINES])
    cur.executemany("INSERT IGNORE INTO dim_supplier (supplier_code,supplier_name,region) VALUES (%s,%s,%s)", SUPPLIERS)
    cur.executemany("INSERT IGNORE INTO dim_material (material_code,material_name,material_type,standard_price) VALUES (%s,%s,%s,%s)", MATERIALS)
    rows = [(d, d.year, d.month, d.day, d.isocalendar()[1], 1 if d.weekday() >= 5 else 0, d.strftime("%Y-%m")) for d in daterange(START, END)]
    cur.executemany(
        "INSERT IGNORE INTO dim_date (date_id,year_num,month_num,day_num,week_of_year,is_weekend,month_label) VALUES (%s,%s,%s,%s,%s,%s,%s)", rows)
    cur.executemany("INSERT IGNORE INTO ods_production_line (line_code,line_name,factory_code,design_capacity_daily,etl_batch_id) VALUES (%s,%s,%s,%s,%s)",
                    [(lc, ln, fc, cap, BATCH) for lc, ln, fc, cap in LINES])
    cur.executemany("INSERT IGNORE INTO ods_material (material_code,material_name,material_type,standard_price,unit,etl_batch_id) VALUES (%s,%s,%s,%s,'件',%s)",
                    [(m[0], m[1], m[2], m[3], BATCH) for m in MATERIALS])
    cur.executemany("INSERT IGNORE INTO ods_supplier (supplier_code,supplier_name,region,etl_batch_id) VALUES (%s,%s,%s,%s)",
                    [(s[0], s[1], s[2], BATCH) for s in SUPPLIERS])
    cur.executemany("INSERT IGNORE INTO ods_equipment (equipment_code,equipment_name,line_code,etl_batch_id) VALUES (%s,%s,%s,%s)",
                    [(e[0], e[1], e[2], BATCH) for e in EQUIPMENT])


def month_iter():
    y, m = START.year, START.month
    while (y, m) <= (END.year, END.month):
        yield y, m
        m += 1
        if m > 12:
            m, y = 1, y + 1


def seed_transactions(cur):
    random.seed(42)
    order_seq = 0
    inspect_seq = 0
    labor_seq = 0
    orders, inspects, labors = [], [], []
    inv_rows, supply_rows, equip_rows = [], [], []
    prod_daily, qual_daily = {}, {}
    cost_monthly = {}

    for y, m in month_iter():
        ml = f"{y:04d}-{m:02d}"
        n_orders = random.randint(120, 200)
        month_yield_base = 0.96
        if y == 2025 and m == 4:  # 异常：华东工厂良品率下降
            month_yield_base = 0.88
        for _ in range(n_orders):
            order_seq += 1
            oid = f"WO{y}{m:02d}{order_seq:04d}"
            lc, ln, fc, cap = random.choice(LINES)
            pc, pn, cat, std_cost = random.choice(PRODUCTS)
            day = random.randint(1, monthrange(y, m)[1])
            od = date(y, m, day)
            due = od + timedelta(days=random.randint(5, 20))
            plan_q = random.randint(80, 200)
            actual_q = int(plan_q * random.uniform(0.85, 1.05))
            plan_h = round(plan_q / random.uniform(18, 28), 2)
            actual_h = round(plan_h * random.uniform(0.9, 1.15), 2)
            on_time = 1 if due <= END and random.random() > 0.08 else 0
            mat_c = round(actual_q * std_cost * 0.45, 2)
            lab_c = round(actual_h * random.uniform(35, 55), 2)
            ovh_c = round(actual_q * std_cost * 0.18, 2)
            orders.append((oid, od, due, fc, lc, pc, plan_q, actual_q, plan_h, actual_h, on_time, "完工", BATCH))
            yield_r = month_yield_base if fc != "F02" or not (y == 2025 and m == 4) else random.uniform(0.86, 0.90)
            if fc == "F02" and y == 2025 and m == 4:
                yield_r = random.uniform(0.86, 0.90)
            else:
                yield_r = random.uniform(0.92, 0.98)
            total_q = actual_q
            pass_q = int(total_q * yield_r)
            defect_q = total_q - pass_q - random.randint(0, max(1, int(total_q * 0.01)))
            scrap_q = total_q - pass_q - defect_q
            defect_q = max(defect_q, 0)
            scrap_q = max(scrap_q, 0)
            inspect_seq += 1
            inspects.append((oid, od, lc, pc, total_q, pass_q, defect_q, scrap_q,
                             random.choice(DEFECT_TYPES), 1 if random.random() < 0.12 else 0, BATCH))
            is_rw = inspects[-1][9]
            labor_seq += 1
            labors.append((oid, od, lc, plan_h, actual_h, lab_c, BATCH))
            key = (od, fc, lc)
            prod_daily[key] = prod_daily.get(key, 0) + actual_q
            qk = (od, lc, pc)
            qual_daily[qk] = qual_daily.get(qk, [0, 0, 0, 0, 0])  # t,p,d,s,first_pass_qty
            qual_daily[qk][0] += total_q
            qual_daily[qk][1] += pass_q
            qual_daily[qk][2] += defect_q
            qual_daily[qk][3] += scrap_q
            qual_daily[qk][4] += pass_q if is_rw == 0 else 0
            ck = (ml, fc, pc)
            if ck not in cost_monthly:
                cost_monthly[ck] = [0, 0.0, 0.0, 0.0, 0.0]
            cost_monthly[ck][0] += actual_q
            cost_monthly[ck][1] += mat_c + lab_c + ovh_c
            cost_monthly[ck][2] += mat_c
            cost_monthly[ck][3] += lab_c
            cost_monthly[ck][4] += ovh_c

        for sup in SUPPLIERS:
            for d in range(1, 4):
                day = min(random.randint(1, 28), monthrange(y, m)[1])
                sd = date(y, m, day)
                otd = random.uniform(0.85, 0.98)
                if random.random() > otd:
                    otd_pct = random.uniform(82, 90)
                else:
                    otd_pct = random.uniform(92, 99)
                supply_rows.append((sd, sup[0], round(random.uniform(50000, 280000), 2),
                                    random.uniform(18, 42), otd_pct))

    cur.executemany("""INSERT INTO ods_production_order
        (order_id,order_date,due_date,factory_code,line_code,product_code,plan_qty,actual_qty,plan_hours,actual_hours,delivered_on_time,order_status,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", orders)
    cur.executemany("""INSERT INTO ods_quality_inspection
        (order_id,inspect_date,line_code,product_code,total_qty,pass_qty,defect_qty,scrap_qty,defect_type,is_rework,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", inspects)
    cur.executemany("""INSERT INTO ods_labor (order_id,work_date,line_code,plan_hours,actual_hours,labor_cost,etl_batch_id) VALUES (%s,%s,%s,%s,%s,%s,%s)""", labors)

    for d in daterange(START, END):
        for mat in MATERIALS:
            usage = random.uniform(5, 40)
            on_hand = usage * random.uniform(15, 55)
            inv_rows.append((d, mat[0], round(on_hand, 2), round(usage * 8, 2), round(usage, 2), BATCH))
    cur.executemany("""INSERT INTO ods_inventory_material (snapshot_date,material_code,on_hand_qty,safety_stock,daily_usage,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s)""", inv_rows)

    for d in daterange(START, END):
        for eq, en, lc in EQUIPMENT:
            oee_base = random.uniform(78, 88)
            if eq == "EQ-F02-L02" and d >= date(2025, 4, 1):  # OEE 连续下降异常
                oee_base = random.uniform(68, 74)
            avail = random.uniform(88, 96)
            perf = random.uniform(90, 98)
            qual = random.uniform(94, 99)
            oee = round(avail * perf * qual / 10000, 2)
            if eq == "EQ-F02-L02" and d >= date(2025, 4, 1):
                oee = round(oee_base * 0.85, 2)
            dt = random.choice(["故障", "换型", "待料", "维护", "正常"])
            dh = round(random.uniform(0, 3), 1) if dt != "正常" else 0
            fc = 1 if dt == "故障" and random.random() < 0.15 else 0
            equip_rows.append((d, eq, lc, round(avail, 2), round(perf, 2), round(qual, 2), oee, dh, fc, dt))
    cur.executemany("""INSERT INTO dws_equipment_daily
        (snapshot_date,equipment_code,line_code,availability_pct,performance_pct,quality_pct,oee_pct,downtime_hours,failure_count,downtime_reason)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", equip_rows)

    # DWD
    cur.execute("TRUNCATE dwd_production_wide")
    cur.execute("""
        INSERT INTO dwd_production_wide
        SELECT o.order_id,o.order_date,o.due_date,o.factory_code,dl.factory_name,o.line_code,dl.line_name,
            o.product_code,dp.product_name,o.plan_qty,o.actual_qty,o.plan_hours,o.actual_hours,o.delivered_on_time,
            ROUND(o.actual_qty*dp.standard_unit_cost*0.45,2), ROUND(o.actual_hours*42,2),
            ROUND(o.actual_qty*dp.standard_unit_cost*0.18,2),
            ROUND(o.actual_qty*dp.standard_unit_cost*0.65,2)
        FROM ods_production_order o
        JOIN dim_production_line dl ON o.line_code=dl.line_code
        JOIN dim_product dp ON o.product_code=dp.product_code
    """)
    cur.execute("TRUNCATE dwd_quality_wide")
    cur.execute("""
        INSERT INTO dwd_quality_wide
        SELECT q.inspect_id,q.order_id,q.inspect_date,q.line_code,dl.line_name,q.product_code,dp.product_name,
            q.total_qty,q.pass_qty,q.defect_qty,q.scrap_qty,q.defect_type,q.is_rework,
            ROUND(q.pass_qty/NULLIF(q.total_qty,0),4)
        FROM ods_quality_inspection q
        JOIN dim_production_line dl ON q.line_code=dl.line_code
        JOIN dim_product dp ON q.product_code=dp.product_code
    """)
    cur.execute("TRUNCATE dwd_supply_wide")
    for sd, sc, amt, turn, otd in supply_rows[:2000]:
        mat = random.choice(MATERIALS)
        cur.execute("""INSERT INTO dwd_supply_wide (snapshot_date,material_code,material_name,supplier_code,supplier_name,
            on_hand_qty,daily_usage,purchase_qty,purchase_amount,actual_price,standard_price,on_time_delivery)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (sd, mat[0], mat[1], sc, next((s[1] for s in SUPPLIERS if s[0] == sc), sc), random.uniform(100, 800), random.uniform(5, 20),
             random.uniform(50, 200), amt, mat[3] * random.uniform(0.95, 1.08), mat[3], 1 if otd > 90 else 0))

    # DWS production daily
    dws_p = []
    cap_map = {lc: cap for lc, ln, fc, cap in LINES}
    # 产线日 OTD：按订单日×厂×线汇总
    otd_line = {}
    for oid, od, due, fc, lc, pc, plan_q, actual_q, plan_h, actual_h, on_time, st, batch in orders:
        k = (od, fc, lc)
        a = otd_line.setdefault(k, [0, 0])
        a[1] += 1
        a[0] += int(on_time or 0)
    for (sd, fc, lc), qty in prod_daily.items():
        cap = cap_map.get(lc, 100)
        util = min(105, round(qty / cap * 100, 2))
        ot = otd_line.get((sd, fc, lc), [0, 1])
        otd_pct = round(ot[0] / max(1, ot[1]) * 100, 2)
        dws_p.append((sd, fc, lc, qty, qty, util, 0, otd_pct))
    cur.executemany("""INSERT INTO dws_production_daily (snapshot_date,factory_code,line_code,output_qty,plan_qty,capacity_util_pct,labor_hours,on_time_delivery_pct)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", dws_p)
    # 日汇总 ALL：产量加权利用率/OTD
    day_agg = {}
    for (sd, fc, lc), qty in prod_daily.items():
        day_agg.setdefault(sd, {"qty": 0, "util_w": 0.0, "otd_w": 0.0})
        util = min(105, round(qty / cap_map.get(lc, 100) * 100, 2))
        ot = otd_line.get((sd, fc, lc), [0, 1])
        otd_pct = round(ot[0] / max(1, ot[1]) * 100, 2)
        day_agg[sd]["qty"] += qty
        day_agg[sd]["util_w"] += util * qty
        day_agg[sd]["otd_w"] += otd_pct * qty
    for sd, v in day_agg.items():
        cur.execute("""INSERT INTO dws_production_daily (snapshot_date,factory_code,line_code,output_qty,plan_qty,capacity_util_pct,on_time_delivery_pct)
            VALUES (%s,'ALL','ALL',%s,%s,%s,%s)""", (
            sd, v["qty"], v["qty"],
            round(v["util_w"] / max(1, v["qty"]), 2),
            round(v["otd_w"] / max(1, v["qty"]), 2),
        ))

    dws_q = []
    for (sd, lc, pc), v in qual_daily.items():
        t, p, d, s, fp_qty = v
        yld = round(p / t * 100, 2) if t else 0
        fpy = round(fp_qty / t * 100, 2) if t else 0
        dws_q.append((sd, lc, pc, t, p, d, s, yld, round(d / t * 100, 2) if t else 0, round(s / t * 100, 2) if t else 0, fpy))
    cur.executemany("""INSERT INTO dws_quality_daily
        (snapshot_date,line_code,product_code,total_qty,pass_qty,defect_qty,scrap_qty,yield_rate_pct,defect_rate_pct,scrap_rate_pct,first_pass_pct)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", dws_q)
    cur.execute("""
        INSERT INTO dws_quality_daily (snapshot_date,line_code,product_code,total_qty,pass_qty,defect_qty,scrap_qty,yield_rate_pct,defect_rate_pct,scrap_rate_pct,first_pass_pct)
        SELECT snapshot_date,'ALL','ALL',SUM(total_qty),SUM(pass_qty),SUM(defect_qty),SUM(scrap_qty),
            ROUND(SUM(pass_qty)/NULLIF(SUM(total_qty),0)*100,2),ROUND(SUM(defect_qty)/NULLIF(SUM(total_qty),0)*100,2),
            ROUND(SUM(scrap_qty)/NULLIF(SUM(total_qty),0)*100,2),
            ROUND(SUM(first_pass_pct * total_qty)/NULLIF(SUM(total_qty),0),2)
        FROM dws_quality_daily WHERE line_code<>'ALL' GROUP BY snapshot_date
    """)

    supply_agg = {}
    for sd, sc, amt, turn, otd in supply_rows:
        k = (sd, sc)
        if k not in supply_agg:
            supply_agg[k] = [0.0, [], []]
        supply_agg[k][0] += amt
        supply_agg[k][1].append(turn)
        supply_agg[k][2].append(otd)
    supply_ins = [(k[0], k[1], v[0], round(sum(v[1]) / len(v[1]), 2), round(sum(v[2]) / len(v[2]), 2)) for k, v in supply_agg.items()]
    cur.executemany("""INSERT INTO dws_supply_daily (snapshot_date,supplier_code,purchase_amount,inventory_turnover_days,supplier_otd_pct)
        VALUES (%s,%s,%s,%s,%s)""", supply_ins)

    cur.executemany("""INSERT INTO dws_cost_monthly (snapshot_month,factory_code,product_code,output_qty,total_cost,material_cost,labor_cost,overhead_cost,unit_cost)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(ml, fc, pc, q, tc, mc, lc, oc, round(tc / q, 2) if q else 0) for (ml, fc, pc), (q, tc, mc, lc, oc) in cost_monthly.items()])
    cur.execute("""
        INSERT INTO dws_cost_monthly (snapshot_month,factory_code,product_code,output_qty,total_cost,material_cost,labor_cost,overhead_cost,unit_cost)
        SELECT snapshot_month,'ALL','ALL',SUM(output_qty),SUM(total_cost),SUM(material_cost),SUM(labor_cost),SUM(overhead_cost),
            ROUND(SUM(total_cost)/NULLIF(SUM(output_qty),0),2) FROM dws_cost_monthly WHERE factory_code<>'ALL' GROUP BY snapshot_month
    """)

    # DWS 物料/人工/缺陷（供 ADS，禁止 ADS 直读 ODS）
    cur.execute("DELETE FROM dws_material_daily")
    cur.execute("""
        INSERT INTO dws_material_daily
        (snapshot_date, material_code, material_name, on_hand_qty, daily_usage, turnover_days,
         max_on_hand, safety_stock, on_hand_amount, etl_batch_id)
        SELECT i.snapshot_date, i.material_code, IFNULL(m.material_name, '未知'),
               i.on_hand_qty, i.daily_usage,
               ROUND(i.on_hand_qty / NULLIF(i.daily_usage, 0), 1),
               i.on_hand_qty, i.safety_stock,
               ROUND(i.on_hand_qty * IFNULL(m.standard_price, 0), 2),
               'seed'
        FROM ods_inventory_material i
        LEFT JOIN dim_material m ON i.material_code = m.material_code
    """)
    cur.execute("DELETE FROM dws_labor_monthly")
    cur.execute("""
        INSERT INTO dws_labor_monthly
        (snapshot_month, factory_code, line_code, plan_hours, actual_hours, hours_achievement_pct,
         labor_cost, order_count, worker_count, etl_batch_id)
        SELECT DATE_FORMAT(work_date,'%Y-%m'), 'ALL', 'ALL',
               SUM(plan_hours), SUM(actual_hours),
               ROUND(SUM(actual_hours)/NULLIF(SUM(plan_hours),0)*100, 2),
               SUM(labor_cost), COUNT(DISTINCT order_id), COUNT(*),
               'seed'
        FROM ods_labor
        GROUP BY DATE_FORMAT(work_date,'%Y-%m')
    """)
    cur.execute("DELETE FROM dws_defect_daily")
    cur.execute("""
        INSERT INTO dws_defect_daily
        (snapshot_date, defect_type, defect_qty, scrap_qty, total_qty, defect_rate_pct, inspect_count, line_code, etl_batch_id)
        SELECT inspect_date, IFNULL(NULLIF(defect_type,''), '未知'),
               SUM(defect_qty), SUM(scrap_qty), SUM(total_qty),
               ROUND(SUM(defect_qty)/NULLIF(SUM(total_qty),0)*100, 2),
               COUNT(*), 'ALL', 'seed'
        FROM ods_quality_inspection
        GROUP BY inspect_date, IFNULL(NULLIF(defect_type,''), '未知')
    """)


def main():
    conn = pymysql.connect(**db_config())
    try:
        cur = conn.cursor()
        for f in ["01_ods.sql", "02_dim.sql", "03_dwd.sql", "04_dws.sql"]:
            run_sql_file(cur, DDL_DIR / f)
        for t in ["ods_production_order", "ods_quality_inspection", "ods_labor", "ods_inventory_material",
                  "dwd_production_wide", "dwd_quality_wide", "dwd_supply_wide",
                  "dws_production_daily", "dws_quality_daily", "dws_supply_daily", "dws_equipment_daily", "dws_cost_monthly",
                  "dws_material_daily", "dws_labor_monthly", "dws_defect_daily"]:
            try:
                cur.execute(f"DELETE FROM {t}")
            except Exception:
                pass
        seed_dims(cur)
        seed_transactions(cur)
        run_sql_file(cur, DDL_DIR / "05_ads.sql")
        try:
            run_sql_file(cur, DDL_DIR / "07_fact_aliases.sql")
        except Exception as e:
            print("fact aliases warn:", e)
        conn.commit()
        print("manufacturing_analytics seeded OK")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
