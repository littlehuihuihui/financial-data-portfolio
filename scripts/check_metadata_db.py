#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent / "retail-finance-analysis"))
from db_utils import _db_config  # noqa: E402


def main() -> None:
    cfg = _db_config()
    cfg["database"] = "portfolio_metadata"
    cfg["cursorclass"] = pymysql.cursors.DictCursor
    conn = pymysql.connect(**cfg)
    try:
        with conn.cursor() as cur:
            cur.execute("SHOW TABLES")
            print("tables:", [list(r.values())[0] for r in cur.fetchall()])
            cur.execute("SHOW COLUMNS FROM version_history")
            print("version_history cols:", [list(r.values())[0] for r in cur.fetchall()])
            cur.execute(
                "SELECT version_tag, status, CHAR_LENGTH(COALESCE(config_json, '')) "
                "FROM version_history ORDER BY version_id"
            )
            for row in cur.fetchall():
                print("version:", row)
            cur.execute("SELECT industry_code, current_version FROM industry_catalog")
            print("catalog:", cur.fetchall())
    finally:
        conn.close()


if __name__ == "__main__":
    main()
