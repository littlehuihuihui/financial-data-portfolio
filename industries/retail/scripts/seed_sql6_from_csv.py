#!/usr/bin/env python3
"""将 data/raw_csv 样例数据灌入 sql6 数仓（DIM → ODS → DWD → DWS）。"""
from __future__ import annotations

import csv
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "raw_csv"
sys.path.insert(0, str(ROOT))

from db_utils import _db_config  # noqa: E402

import pymysql

BATCH = 1000
ETL_BATCH = "SEED202606"

BRANDS = {
    "跃动Pro": ("B001", "高端"),
    "跃动Life": ("B002", "中端"),
    "跃动Go": ("B003", "入门"),
}

CHANNEL_DIM = [
    ("CH01", "抖音", "线上"),
    ("CH02", "天猫", "线上"),
    ("CH03", "线下直营", "线下"),
    ("CH04", "京东", "线上"),
    ("CH05", "拼多多", "线上"),
    ("CH06", "线下经销", "线下"),
    ("CH07", "全渠道", "线上"),
]

CHANNEL_ALIASES = {
    "抖音": "CH01",
    "天猫": "CH02",
    "线下直营": "CH03",
    "线下": "CH03",
    "京东": "CH04",
    "拼多多": "CH05",
    "线下经销": "CH06",
    "全渠道": "CH07",
}

CHANNEL_NAMES = {code: name for code, name, _ in CHANNEL_DIM}


def channel_code(name: str) -> tuple[str, str]:
    code = CHANNEL_ALIASES.get(name, "CH07")
    return code, CHANNEL_NAMES.get(code, name)

CATEGORY_CODE = {
    "鞋类": ("CAT01", "鞋类"),
    "服装": ("CAT02", "服装"),
    "上衣": ("CAT02", "服装"),
    "裤装": ("CAT02", "服装"),
    "配件": ("CAT03", "配件"),
}

EXPENSE_BRAND = {
    "天猫": "跃动Pro",
    "京东": "跃动Pro",
    "抖音": "跃动Life",
    "拼多多": "跃动Go",
    "线下直营": "跃动Pro",
    "线下经销": "跃动Go",
    "全渠道": "跃动Life",
}

TRUNCATE_TABLES = [
    "dws_store_daily",
    "dws_inventory_daily",
    "dws_expense_monthly",
    "dws_sales_monthly",
    "dws_sales_daily",
    "dwd_inventory_wide",
    "dwd_expense_wide",
    "dwd_sales_wide",
    "ods_budget",
    "ods_ad_cost",
    "ods_store_pnl",
    "ods_expense",
    "ods_inventory",
    "ods_payment",
    "ods_purchase",
    "ods_orders",
    "dim_store",
    "dim_category",
    "dim_channel",
    "dim_brand",
]


def connect():
    cfg = {k: v for k, v in _db_config().items() if k != "cursorclass"}
    return pymysql.connect(**cfg)


def read_csv(name: str) -> list[dict[str, str]]:
    path = DATA_DIR / name
    if not path.is_file():
        raise FileNotFoundError(f"缺少 CSV: {path}，请先运行 python data/data_generator.py")
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def chunked(rows: list, size: int = BATCH):
    for i in range(0, len(rows), size):
        yield rows[i : i + size]


def is_returned(val: str) -> int:
    return 1 if str(val).strip() in ("是", "1", "Y", "TRUE", "true") else 0


def channel_for_expense(platform: str) -> tuple[str, str]:
    if platform.startswith("STORE"):
        return "CH03", "线下直营"
    code = CHANNEL_ALIASES.get(platform, "CH07")
    return code, CHANNEL_NAMES.get(code, platform or "全渠道")


def expense_brand_name(platform: str) -> str:
    if platform.startswith("STORE"):
        return "跃动Pro"
    return EXPENSE_BRAND.get(platform, "跃动Pro")


def load_dimensions(cur) -> None:
    cur.executemany(
        """
        INSERT INTO dim_brand (brand_code, brand_name, brand_level, status)
        VALUES (%s, %s, %s, 'active')
        """,
        [(code, name, level) for name, (code, level) in BRANDS.items()],
    )
    cur.executemany(
        """
        INSERT INTO dim_channel (channel_code, channel_name, channel_type, status)
        VALUES (%s, %s, %s, 'active')
        """,
        [(code, name, typ) for code, name, typ in CHANNEL_DIM],
    )
    cur.executemany(
        """
        INSERT INTO dim_category (category_code, category_name, category_group, status)
        VALUES (%s, %s, %s, 'active')
        """,
        [
            ("CAT01", "鞋类", "鞋类"),
            ("CAT02", "服装", "服装"),
            ("CAT03", "配件", "配件"),
        ],
    )

    stores: dict[str, dict] = {}
    for row in read_csv("store_pnl.csv"):
        sid = row["store_id"]
        if sid not in stores:
            stores[sid] = row
    cur.executemany(
        """
        INSERT INTO dim_store (store_code, store_name, region, store_type, store_area, status)
        VALUES (%s, %s, %s, '直营', %s, 'active')
        """,
        [
            (sid, s["store_name"], s["region"], float(s["store_area"] or 0))
            for sid, s in sorted(stores.items())
        ],
    )
    print(f"  dim: brand={len(BRANDS)} channel={len(CHANNEL_DIM)} category=3 store={len(stores)}")


def load_ods_orders(cur) -> int:
    rows = []
    for row in read_csv("orders.csv"):
        brand = row["brand"]
        channel = row["channel"]
        category = row["category"]
        bcode = BRANDS[brand][0]
        ccode, _ = channel_code(channel)
        cat_code, _ = CATEGORY_CODE.get(category, ("CAT02", "服装"))
        payment = float(row["actual_amount"] or 0)
        cost = float(row["cost"] or 0)
        qty = int(float(row["quantity"] or 1))
        unit_price = float(row["unit_price"] or 0)
        discount = round(qty * unit_price * float(row["discount_rate"] or 0), 2)
        returned = is_returned(row["is_returned"])
        return_amount = payment if returned else 0
        store_code = row.get("store_id") or None
        if store_code == "":
            store_code = None
        rows.append(
            (
                row["order_id"],
                row["order_date"],
                round(payment + discount, 2),
                payment,
                cost,
                discount,
                float(row["shipping_fee"] or 0),
                bcode,
                ccode,
                cat_code,
                store_code,
                None,
                row.get("product_id"),
                "已完成",
                returned,
                return_amount,
                row.get("return_reason") or None,
                ETL_BATCH,
            )
        )
    sql = """
        INSERT INTO ods_orders (
            order_id, order_date, order_amount, payment_amount, cost_amount,
            discount_amount, shipping_fee, brand_code, channel_code, category_code,
            store_code, customer_id, sku_code, order_status, return_flag,
            return_amount, return_reason, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    for batch in chunked(rows):
        cur.executemany(sql, batch)
    print(f"  ods_orders: {len(rows)}")
    return len(rows)


def load_ods_payment(cur) -> int:
    rows = []
    for row in read_csv("orders.csv"):
        if is_returned(row["is_returned"]):
            continue
        brand = row["brand"]
        channel = row["channel"]
        payment = float(row["actual_amount"] or 0)
        rows.append(
            (
                f"PAY-{row['order_id']}",
                row["order_id"],
                f"{row['order_date']} 12:00:00",
                payment,
                "在线支付",
                "成功",
                f"TXN-{row['order_id']}",
                BRANDS[brand][0],
                channel_code(channel)[0],
                ETL_BATCH,
            )
        )
    sql = """
        INSERT INTO ods_payment (
            payment_id, order_id, payment_date, payment_amount, payment_method,
            payment_status, transaction_id, brand_code, channel_code, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    for batch in chunked(rows):
        cur.executemany(sql, batch)
    print(f"  ods_payment: {len(rows)}")
    return len(rows)


def load_ods_expense(cur) -> int:
    rows = []
    for row in read_csv("expenses.csv"):
        platform = row["channel_platform"]
        ch_code, ch_name = channel_for_expense(platform)
        brand_name = expense_brand_name(platform)
        bcode = BRANDS[brand_name][0]
        store_code = platform if platform.startswith("STORE") else None
        rows.append(
            (
                row["expense_id"],
                row["expense_date"],
                row["expense_category"],
                bcode,
                ch_code,
                store_code,
                float(row["amount"] or 0),
                float(row["budget_amount"] or 0),
                row["expense_category"],
                row.get("description") or "",
                ETL_BATCH,
            )
        )
    sql = """
        INSERT INTO ods_expense (
            expense_id, expense_date, expense_type, brand_code, channel_code,
            store_code, expense_amount, budget_amount, cost_center, expense_owner,
            etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    for batch in chunked(rows):
        cur.executemany(sql, batch)
    print(f"  ods_expense: {len(rows)}")
    return len(rows)


def load_ods_inventory(cur) -> int:
    rows = []
    for row in read_csv("inventory.csv"):
        brand = row["brand"]
        category = row["category"]
        bcode = BRANDS[brand][0]
        cat_code, _ = CATEGORY_CODE.get(category, ("CAT02", "服装"))
        qty = int(float(row["inventory_quantity"] or 0))
        amount = float(row["inventory_cost"] or 0)
        unit_cost = round(amount / qty, 4) if qty else 0
        snap = row["snapshot_date"]
        inv_id = f"INV-{snap}-{bcode}-{category}"
        rows.append(
            (
                inv_id,
                snap,
                f"SKU-{bcode}-{cat_code}",
                bcode,
                cat_code,
                None,
                qty,
                amount,
                unit_cost,
                ETL_BATCH,
            )
        )
    sql = """
        INSERT INTO ods_inventory (
            inventory_id, snapshot_date, sku_code, brand_code, category_code,
            store_code, stock_qty, stock_amount, unit_cost, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    for batch in chunked(rows):
        cur.executemany(sql, batch)
    print(f"  ods_inventory: {len(rows)}")
    return len(rows)


def load_ods_store_pnl(cur) -> int:
    latest: dict[str, dict] = {}
    for row in read_csv("store_pnl.csv"):
        month = row["month"]
        sid = row["store_id"]
        if sid not in latest or month > latest[sid]["month"]:
            latest[sid] = row
    rows = [
        (
            sid,
            r["store_name"],
            r["region"],
            None,
            float(r["store_area"] or 0),
            None,
            float(r["revenue"] or 0),
            float(r["profit"] or 0),
            float(r.get("pingxiao") or 0),
            ETL_BATCH,
        )
        for sid, r in sorted(latest.items())
    ]
    cur.executemany(
        """
        INSERT INTO ods_store_pnl (
            store_code, store_name, region, city, store_area, open_date,
            monthly_revenue, monthly_profit, pingsiao, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        rows,
    )
    print(f"  ods_store_pnl: {len(rows)}")
    return len(rows)


def load_ods_budget(cur) -> int:
    rows = []
    for row in read_csv("budget.csv"):
        brand = row["brand"]
        channel = row["channel"]
        if brand == "全部" or channel == "全部":
            continue
        y, m = row["month"].split("-")
        ch_code, _ = channel_code(channel)
        rows.append(
            (
                f"BUD-{row['month']}-{BRANDS[brand][0]}-{ch_code}",
                int(y),
                int(m),
                BRANDS[brand][0],
                ch_code,
                "营销费用",
                float(row["budget_expense"] or 0),
                ETL_BATCH,
            )
        )
    cur.executemany(
        """
        INSERT INTO ods_budget (
            budget_id, budget_year, budget_month, brand_code, channel_code,
            expense_type, budget_amount, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        rows,
    )
    print(f"  ods_budget: {len(rows)}")
    return len(rows)


def load_ods_ad_cost(cur) -> int:
    rows = []
    for row in read_csv("expenses.csv"):
        if row["expense_category"] != "广告投放":
            continue
        platform = row["channel_platform"]
        ch_code, ch_name = channel_for_expense(platform)
        brand_name = expense_brand_name(platform)
        rows.append(
            (
                row["expense_id"],
                row["expense_date"],
                BRANDS[brand_name][0],
                ch_code,
                ch_name,
                float(row["amount"] or 0),
                max(1000, int(float(row["amount"] or 0) / 50)),
                max(10, int(float(row["amount"] or 0) / 5000)),
                max(1, int(float(row["amount"] or 0) / 50000)),
                ETL_BATCH,
            )
        )
    cur.executemany(
        """
        INSERT INTO ods_ad_cost (
            ad_id, ad_date, brand_code, channel_code, platform,
            ad_cost, impressions, clicks, conversions, etl_batch_id
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """,
        rows,
    )
    print(f"  ods_ad_cost: {len(rows)}")
    return len(rows)


def etl_dwd(cur) -> None:
    cur.execute("TRUNCATE TABLE dwd_sales_wide")
    cur.execute(
        """
        INSERT INTO dwd_sales_wide (
            order_id, order_date, brand_name, channel_name, category_name,
            store_name, region, payment_amount, cost_amount, profit_amount,
            discount_amount, shipping_fee, return_flag, return_amount, return_reason,
            customer_id, sku_id, product_name, year, quarter, month, week_of_year,
            etl_batch_id
        )
        SELECT
            o.order_id, o.order_date,
            b.brand_name, c.channel_name, cat.category_name,
            s.store_name, s.region,
            o.payment_amount, o.cost_amount,
            o.payment_amount - o.cost_amount,
            o.discount_amount, o.shipping_fee,
            o.return_flag, o.return_amount, o.return_reason,
            o.customer_id, o.sku_code, o.sku_code,
            YEAR(o.order_date), QUARTER(o.order_date), MONTH(o.order_date),
            WEEKOFYEAR(o.order_date),
            %s
        FROM ods_orders o
        INNER JOIN dim_brand b ON o.brand_code = b.brand_code
        INNER JOIN dim_channel c ON o.channel_code = c.channel_code
        INNER JOIN dim_category cat ON o.category_code = cat.category_code
        LEFT JOIN dim_store s ON o.store_code = s.store_code
        """,
        (ETL_BATCH,),
    )

    cur.execute("TRUNCATE TABLE dwd_expense_wide")
    cur.execute(
        """
        INSERT INTO dwd_expense_wide (
            expense_id, expense_date, brand_name, channel_name, expense_type,
            cost_center, expense_owner, expense_amount, budget_amount,
            year, month, etl_batch_id
        )
        SELECT
            e.expense_id, e.expense_date,
            b.brand_name, c.channel_name, e.expense_type,
            e.cost_center, e.expense_owner, e.expense_amount, e.budget_amount,
            YEAR(e.expense_date), MONTH(e.expense_date),
            %s
        FROM ods_expense e
        INNER JOIN dim_brand b ON e.brand_code = b.brand_code
        INNER JOIN dim_channel c ON e.channel_code = c.channel_code
        """,
        (ETL_BATCH,),
    )

    cur.execute("TRUNCATE TABLE dwd_inventory_wide")
    cur.execute(
        """
        INSERT INTO dwd_inventory_wide (
            inventory_id, snapshot_date, brand_name, category_name, store_name,
            sku_id, product_name, stock_qty, stock_amount, unit_cost,
            year, month, etl_batch_id
        )
        SELECT
            i.inventory_id, i.snapshot_date,
            b.brand_name, cat.category_name, '中央仓',
            i.sku_code, i.sku_code, i.stock_qty, i.stock_amount, i.unit_cost,
            YEAR(i.snapshot_date), MONTH(i.snapshot_date),
            %s
        FROM ods_inventory i
        INNER JOIN dim_brand b ON i.brand_code = b.brand_code
        INNER JOIN dim_category cat ON i.category_code = cat.category_code
        """,
        (ETL_BATCH,),
    )
    print("  dwd: sales / expense / inventory 已装载")


def etl_dws(cur) -> None:
    cur.execute("TRUNCATE TABLE dws_sales_daily")
    cur.execute(
        """
        INSERT INTO dws_sales_daily (
            snapshot_date, brand_name, channel_name, category_name,
            gmv, revenue, profit, order_count, return_amount, return_count
        )
        SELECT
            order_date, brand_name, channel_name, category_name,
            ROUND(SUM(payment_amount + IFNULL(return_amount, 0)), 2),
            ROUND(SUM(CASE WHEN return_flag = 0 THEN payment_amount ELSE 0 END), 2),
            ROUND(SUM(CASE WHEN return_flag = 0 THEN profit_amount ELSE -IFNULL(return_amount, 0) END), 2),
            SUM(CASE WHEN return_flag = 0 THEN 1 ELSE 0 END),
            ROUND(SUM(IFNULL(return_amount, 0)), 2),
            SUM(return_flag)
        FROM dwd_sales_wide
        GROUP BY order_date, brand_name, channel_name, category_name
        """
    )

    cur.execute("TRUNCATE TABLE dws_sales_monthly")
    cur.execute(
        """
        INSERT INTO dws_sales_monthly (
            snapshot_month, brand_name, channel_name, category_name,
            revenue, profit, order_count, return_amount
        )
        SELECT
            DATE_FORMAT(order_date, '%Y-%m'),
            brand_name, channel_name, category_name,
            ROUND(SUM(CASE WHEN return_flag = 0 THEN payment_amount ELSE 0 END), 2),
            ROUND(SUM(CASE WHEN return_flag = 0 THEN profit_amount ELSE -IFNULL(return_amount, 0) END), 2),
            SUM(CASE WHEN return_flag = 0 THEN 1 ELSE 0 END),
            ROUND(SUM(IFNULL(return_amount, 0)), 2)
        FROM dwd_sales_wide
        GROUP BY DATE_FORMAT(order_date, '%Y-%m'), brand_name, channel_name, category_name
        """
    )

    cur.execute("TRUNCATE TABLE dws_expense_monthly")
    cur.execute(
        """
        INSERT INTO dws_expense_monthly (
            snapshot_month, brand_name, channel_name, expense_type,
            expense_amount, budget_amount
        )
        SELECT
            DATE_FORMAT(expense_date, '%Y-%m'),
            brand_name, channel_name, expense_type,
            ROUND(SUM(expense_amount), 2),
            ROUND(SUM(budget_amount), 2)
        FROM dwd_expense_wide
        GROUP BY DATE_FORMAT(expense_date, '%Y-%m'), brand_name, channel_name, expense_type
        """
    )

    cur.execute("TRUNCATE TABLE dws_inventory_daily")
    cur.execute(
        """
        INSERT INTO dws_inventory_daily (
            snapshot_date, brand_name, category_name, store_name,
            stock_amount, stock_qty, turnover_days
        )
        SELECT
            snapshot_date, brand_name, category_name, store_name,
            ROUND(SUM(stock_amount), 2),
            SUM(stock_qty),
            65.0
        FROM dwd_inventory_wide
        GROUP BY snapshot_date, brand_name, category_name, store_name
        """
    )

    cur.execute("TRUNCATE TABLE dws_store_daily")
    cur.execute(
        """
        INSERT INTO dws_store_daily (snapshot_date, store_name, region, revenue, profit, pingsiao)
        SELECT
            w.order_date,
            w.store_name,
            w.region,
            ROUND(SUM(CASE WHEN w.return_flag = 0 THEN w.payment_amount ELSE 0 END), 2),
            ROUND(SUM(CASE WHEN w.return_flag = 0 THEN w.profit_amount ELSE 0 END), 2),
            ROUND(
                SUM(CASE WHEN w.return_flag = 0 THEN w.payment_amount ELSE 0 END)
                / NULLIF(MAX(s.store_area), 0),
                2
            )
        FROM dwd_sales_wide w
        INNER JOIN dim_store s ON w.store_name = s.store_name
        WHERE w.store_name IS NOT NULL
        GROUP BY w.order_date, w.store_name, w.region
        """
    )
    print("  dws: sales_daily / sales_monthly / expense / inventory / store 已装载")


def validate(cur) -> None:
    checks = [
        "ods_orders",
        "ods_payment",
        "ods_expense",
        "dwd_sales_wide",
        "dws_sales_daily",
        "dws_sales_monthly",
        "dim_brand",
    ]
    print("\n=== 行数校验 ===")
    for table in checks:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"  {table}: {cur.fetchone()[0]}")

    cur.execute(
        """
        SELECT ROUND(SUM(revenue), 2)
        FROM dws_sales_monthly
        WHERE snapshot_month = '2026-06'
        """
    )
    june_rev = cur.fetchone()[0] or 0
    print(f"\n  2026-06 月净收入合计: {float(june_rev):,.2f} 元")


def main() -> int:
    print("跃动体育 · sql6 样例数据灌入")
    print(f"CSV 目录: {DATA_DIR}")

    conn = connect()
    try:
        with conn.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS = 0")
            for table in TRUNCATE_TABLES:
                cur.execute(f"TRUNCATE TABLE {table}")
            cur.execute("SET FOREIGN_KEY_CHECKS = 1")

            print("\n>> DIM")
            load_dimensions(cur)

            print("\n>> ODS")
            load_ods_orders(cur)
            load_ods_payment(cur)
            load_ods_expense(cur)
            load_ods_inventory(cur)
            load_ods_store_pnl(cur)
            load_ods_budget(cur)
            load_ods_ad_cost(cur)

            print("\n>> DWD")
            etl_dwd(cur)

            print("\n>> DWS")
            etl_dws(cur)

            validate(cur)
        conn.commit()
        print("\n样例数据灌入完成。")
        return 0
    except Exception as exc:
        conn.rollback()
        print(f"\n错误: {exc}", file=sys.stderr)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
