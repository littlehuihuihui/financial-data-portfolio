#!/usr/bin/env python3
"""初始化 portfolio_metadata 元数据库。用法: python scripts/init_metadata_db.py"""
from __future__ import annotations

import sys
from pathlib import Path

import pymysql
from pymysql.constants import CLIENT

ROOT = Path(__file__).resolve().parent.parent
DDL_DIR = ROOT / "portfolio_metadata" / "ddl"
SQL_FILES = [
    "01_industry_catalog.sql",
    "02_version_history.sql",
    "03_change_log.sql",
    "04_sync_log.sql",
    "05_views.sql",
    "06_stored_procedures.sql",
    "07_init_data.sql",
    "08_search_index.sql",
    "09_alter_version_history_config.sql",
    "10_system_config.sql",
]

sys.path.insert(0, str(ROOT.parent / "retail-finance-analysis"))
from db_utils import _db_config  # noqa: E402


def read_sql(path: Path) -> str:
    raw = path.read_bytes()
    if raw.startswith(b"\xef\xbb\xbf"):
        raw = raw[3:]
    return raw.decode("utf-8")


def run_file(cur, path: Path) -> None:
    sql = read_sql(path)
    if path.name == "06_stored_procedures.sql":
        cur.execute(sql)
        while cur.nextset():
            pass
        return
    for stmt in sql.split(";"):
        s = stmt.strip()
        if not s or s.startswith("--"):
            continue
        cur.execute(s)
        if cur.description:
            for row in cur.fetchall():
                print(" ", row)


def main() -> None:
    cfg = _db_config()
    cfg["database"] = None
    cfg["client_flag"] = CLIENT.MULTI_STATEMENTS
    conn = pymysql.connect(**cfg)
    try:
        with conn.cursor() as cur:
            for name in SQL_FILES:
                path = DDL_DIR / name
                print(f"Running {name}...")
                run_file(cur, path)
        conn.commit()
        print("portfolio_metadata 初始化完成。")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
