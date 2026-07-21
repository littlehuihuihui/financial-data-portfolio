#!/usr/bin/env python3
import json
import os
import pymysql

conn = pymysql.connect(
    host=os.getenv("DB_HOST", "127.0.0.1"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "123456"),
    database="portfolio_metadata",
    charset="utf8mb4",
)
cur = conn.cursor()
cur.execute(
    """
    SELECT vh.version_tag, vh.status, vh.release_notes, vh.config_json, ic.current_version
    FROM version_history vh
    JOIN industry_catalog ic ON ic.industry_id = vh.industry_id
    WHERE ic.industry_code = 'retail' AND vh.version_tag = 'v2.0'
    """
)
row = cur.fetchone()
cfg = json.loads(row[3]) if isinstance(row[3], str) else row[3]
print("version:", row[0], "status:", row[1], "notes:", row[2], "current:", row[4])
print("statistics:", cfg.get("statistics"))
print("dashboards:", len(cfg.get("dashboards", [])))
print("playbooks:", len(cfg.get("analysis_framework", {}).get("playbooks", [])))
print("toolbox:", cfg.get("analysis_framework", {}).get("layer6_toolbox", {}).get("method_count"))
conn.close()
