#!/usr/bin/env python3
"""执行单条 DDL 文件。用法: python scripts/run_ddl.py portfolio_metadata/ddl/10_system_config.sql"""
from __future__ import annotations

import sys
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT.parent / "retail-finance-analysis"))
from db_utils import _db_config  # noqa: E402


def main() -> None:
    rel = sys.argv[1] if len(sys.argv) > 1 else "portfolio_metadata/ddl/10_system_config.sql"
    sql = (ROOT / rel).read_text(encoding="utf-8-sig")
    cfg = _db_config()
    cfg["database"] = "portfolio_metadata"
    conn = pymysql.connect(**cfg)
    try:
        with conn.cursor() as cur:
            for stmt in sql.split(";"):
                s = stmt.strip()
                if not s or s.startswith("--"):
                    continue
                cur.execute(s)
            cur.execute("SHOW TABLES LIKE 'system_config'")
            print("OK:", cur.fetchone())
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
