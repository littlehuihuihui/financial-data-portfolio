#!/usr/bin/env python3
"""教材靶场执行器。

  python learn/lab/run_lab.py              # DAU 靶场
  python learn/lab/run_lab.py --suite vod  # 点播完播率靶场
  python learn/lab/run_lab.py --suite all

成功时打印 LAB_TOKEN，粘贴到教材页解锁「已学」。
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parent
SUITES = {
    "dau": {
        "dir": ROOT,
        "db": "learn_lab_dau",
        "token": "dnexus-lab-dau-v1-PASS",
        "files": {
            "schema": "00_create_lab_schema.sql",
            "seed": "01_seed_dirty.sql",
            "broken": "02_etl_broken.sql",
            "dq": "03_dq_checks.sql",
            "fixed": "04_etl_fixed.sql",
            "verify": "05_verify.sql",
        },
    },
    "vod": {
        "dir": ROOT / "vod",
        "db": "learn_lab_vod",
        "token": "dnexus-lab-vod-v1-PASS",
        "files": {
            "schema": "00_create_lab_schema.sql",
            "seed": "01_seed_dirty.sql",
            "broken": "02_etl_broken.sql",
            "dq": "03_dq_checks.sql",
            "fixed": "04_etl_fixed.sql",
            "verify": "05_verify.sql",
        },
    },
    "funnel": {
        "dir": ROOT / "funnel",
        "db": "learn_lab_funnel",
        "token": "dnexus-lab-funnel-v1-PASS",
        "files": {
            "schema": "00_create_lab_schema.sql",
            "seed": "01_seed_dirty.sql",
            "broken": "02_etl_broken.sql",
            "dq": "03_dq_checks.sql",
            "fixed": "04_etl_fixed.sql",
            "verify": "05_verify.sql",
        },
    },
}


def connect():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        charset="utf8mb4",
        autocommit=True,
        cursorclass=pymysql.cursors.DictCursor,
    )


def run_sql_file(cur, path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    buf: list[str] = []
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("--") or not s:
            continue
        buf.append(line)
        if s.endswith(";"):
            stmt = "\n".join(buf).strip().rstrip(";")
            buf = []
            if stmt:
                cur.execute(stmt)
                if cur.description:
                    rows = cur.fetchall()
                    print(f"-- {path.name} :: {len(rows)} row(s)")
                    for r in rows[:25]:
                        print(r)


def gate_status(cur) -> str:
    cur.execute(
        "SELECT CASE WHEN SUM(passed)=COUNT(*) THEN 'PASS' ELSE 'FAIL' END AS lab_gate "
        "FROM lab_dq_result"
    )
    row = cur.fetchone()
    return (row or {}).get("lab_gate", "UNKNOWN")


def run_suite(name: str, phase: str) -> int:
    cfg = SUITES[name]
    lab = cfg["dir"]
    files = cfg["files"]
    print(f"\n######## SUITE {name} · db={cfg['db']} ########")
    print("Lab dir:", lab)
    conn = connect()
    try:
        cur = conn.cursor()
        run_sql_file(cur, lab / files["schema"])
        run_sql_file(cur, lab / files["seed"])

        if phase in ("all", "broken"):
            print("\n=== BROKEN ETL ===")
            run_sql_file(cur, lab / files["broken"])
            run_sql_file(cur, lab / files["dq"])
            g = gate_status(cur)
            print("GATE(broken) =", g)
            if g != "FAIL":
                print("ERROR: broken should FAIL", file=sys.stderr)
                return 2

        if phase in ("all", "fixed"):
            print("\n=== FIXED ETL ===")
            run_sql_file(cur, lab / files["fixed"])
            run_sql_file(cur, lab / files["dq"])
            run_sql_file(cur, lab / files["verify"])
            g = gate_status(cur)
            print("GATE(fixed) =", g)
            if g != "PASS":
                print("ERROR: fixed should PASS", file=sys.stderr)
                return 3
            print(f"\nLAB_TOKEN={cfg['token']}")
            print("将 TOKEN 粘贴到对应靶场课文页解锁「已学」。")
        return 0
    finally:
        conn.close()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--suite", choices=["dau", "vod", "funnel", "all"], default="dau")
    ap.add_argument("--phase", choices=["all", "broken", "fixed"], default="all")
    args = ap.parse_args()
    suites = ["dau", "vod", "funnel"] if args.suite == "all" else [args.suite]
    for s in suites:
        code = run_suite(s, args.phase)
        if code:
            return code
    print("\nAll requested suites finished OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
