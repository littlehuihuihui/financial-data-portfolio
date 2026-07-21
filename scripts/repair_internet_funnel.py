"""修复 dim_event_action 列错位并刷新 DWD 宽表与 ADS 视图（无需全量重灌）。"""
from __future__ import annotations

import sys
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "industries" / "internet" / "database"))

from seed_internet_data import EVENT_ACTIONS, db_config, etl_dwd, run_ddl  # noqa: E402


def main() -> None:
    conn = pymysql.connect(**db_config())
    try:
        with conn.cursor() as cur:
            cur.execute("USE internet_analytics")
            print(">> 修复 dim_event_action")
            cur.execute("DELETE FROM dim_event_action")
            cur.executemany(
                """INSERT INTO dim_event_action
                   (event_action, product_line, event_action_name, event_category, funnel_step, is_conversion)
                   VALUES (%s,%s,%s,%s,%s,%s)""",
                EVENT_ACTIONS,
            )
            print(">> 重跑 DWD ETL")
            etl_dwd(cur)
            print(">> 刷新 ADS 视图")
            run_ddl(cur, views_only=True)
            cur.execute(
                "SELECT funnel_step, COUNT(*) FROM dwd_device_operation_wide "
                "WHERE DATE_FORMAT(event_date,'%%Y-%%m')='2026-07' GROUP BY funnel_step"
            )
            print("funnel_step 分布:", cur.fetchall())
            cur.execute("SELECT * FROM v_funnel WHERE snapshot_month='2026-07'")
            print("v_funnel 2026-07:", cur.fetchall())
        conn.commit()
        print("修复完成。")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
