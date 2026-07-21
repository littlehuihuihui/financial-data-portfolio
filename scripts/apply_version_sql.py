#!/usr/bin/env python3
"""将导出的配置 JSON 写入 portfolio_metadata.version_history。"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import pymysql

ROOT = Path(__file__).resolve().parent.parent


def connect():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database="portfolio_metadata",
        charset="utf8mb4",
        autocommit=False,
    )


def ensure_config_json_column(conn) -> None:
    with conn.cursor() as cur:
        cur.execute("SHOW COLUMNS FROM version_history LIKE 'config_json'")
        if cur.fetchone():
            return
        cur.execute(
            "ALTER TABLE version_history "
            "ADD COLUMN config_json JSON NULL COMMENT '版本配置快照（看板/方法论/导航等）' "
            "AFTER release_notes"
        )


def apply_version(conn, industry: str, version: str, notes: str, config: dict) -> None:
    payload = json.dumps(config, ensure_ascii=False)
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE version_history vh
            INNER JOIN industry_catalog ic ON ic.industry_id = vh.industry_id
            SET vh.status = 'stable'
            WHERE ic.industry_code = %s AND vh.status = 'active' AND vh.version_tag <> %s
            """,
            (industry, version),
        )
        cur.execute(
            """
            INSERT INTO version_history (industry_id, version_tag, release_notes, status, config_json)
            SELECT ic.industry_id, %s, %s, 'active', CAST(%s AS JSON)
            FROM industry_catalog ic WHERE ic.industry_code = %s
            ON DUPLICATE KEY UPDATE
                release_notes = VALUES(release_notes),
                status = VALUES(status),
                config_json = VALUES(config_json),
                created_at = CURRENT_TIMESTAMP
            """,
            (version, notes, payload, industry),
        )
        cur.execute(
            "UPDATE industry_catalog SET current_version = %s, updated_at = CURRENT_TIMESTAMP "
            "WHERE industry_code = %s",
            (version, industry),
        )
        cur.execute("SHOW TABLES LIKE 'system_config'")
        if cur.fetchone():
            cur.execute(
                """
                INSERT INTO system_config (industry_id, config_key, config_json, version_tag, updated_at)
                SELECT ic.industry_id, 'portfolio_snapshot', CAST(%s AS JSON), %s, NOW()
                FROM industry_catalog ic WHERE ic.industry_code = %s
                ON DUPLICATE KEY UPDATE
                    config_json = VALUES(config_json),
                    version_tag = VALUES(version_tag),
                    updated_at = CURRENT_TIMESTAMP
                """,
                (payload, version, industry),
            )
        cur.execute(
            """
            INSERT INTO change_log (industry_id, component_type, component_name, change_type, new_value, change_reason)
            SELECT ic.industry_id, 'config', 'portfolio_snapshot', 'modify', %s, %s
            FROM industry_catalog ic WHERE ic.industry_code = %s
            """,
            (version, notes, industry),
        )
        cur.execute(
            """
            SELECT vh.version_tag, vh.status, vh.release_notes,
                   JSON_LENGTH(vh.config_json) AS top_keys,
                   ic.current_version
            FROM version_history vh
            JOIN industry_catalog ic ON ic.industry_id = vh.industry_id
            WHERE ic.industry_code = %s AND vh.version_tag = %s
            """,
            (industry, version),
        )
        print("Applied:", cur.fetchone())


def resolve_json_path(industry: str, version: str) -> Path:
    suffix = "" if industry == "retail" else f"_{industry}"
    return ROOT / "portfolio_metadata" / "config" / f"portfolio_config{suffix}_{version}.json"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--industry", default="retail",
                        choices=["retail", "manufacturing", "internet"])
    parser.add_argument("--version", default="v2.0")
    parser.add_argument("--notes", default="完整版作品集配置")
    args = parser.parse_args()

    json_path = resolve_json_path(args.industry, args.version)
    if not json_path.exists():
        print(f"Missing {json_path}. Run export_portfolio_config.py first.", file=sys.stderr)
        return 1

    config = json.loads(json_path.read_text(encoding="utf-8"))
    conn = connect()
    try:
        ensure_config_json_column(conn)
        apply_version(conn, args.industry, args.version, args.notes, config)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
