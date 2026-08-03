"""
多行业数据平台 · 元数据 API + 静态资源服务
本地: python portfolio_app.py
"""

from __future__ import annotations

import os
from pathlib import Path

import pymysql
import requests
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymysql.cursors import DictCursor

ROOT = Path(__file__).resolve().parent
RETAIL_API_BASE = os.getenv("RETAIL_API_BASE", "http://127.0.0.1:5000")
INTERNET_API_BASE = os.getenv("INTERNET_API_BASE", "http://127.0.0.1:5001")
MANUFACTURING_API_BASE = os.getenv("MANUFACTURING_API_BASE", "http://127.0.0.1:5002")
# 仅放各行业「无冲突」的 API 根路径；跨行业同名接口（如 dashboard_channel /
# dashboard_quality / dashboard_overview）必须靠 Referer 分流，不可写入下方集合。
INTERNET_API_ROOTS = frozenset({
    "dashboard_launcher", "dashboard_vod", "dashboard_live",
    "dashboard_series", "dashboard_episode", "dashboard_device",
    "dashboard_lifecycle", "dashboard_retention", "dashboard_funnel",
    "dashboard_order", "dashboard_path", "dashboard_revenue",
    "dashboard_activity", "dashboard_activity_detail", "dashboard_health",
    "dashboard_tags", "dashboard_tag_detail",
})
MANUFACTURING_API_ROOTS = frozenset({
    "dashboard_production", "dashboard_delivery", "dashboard_supply",
    "dashboard_equipment", "dashboard_cost", "dashboard_capacity",
    "dashboard_defect", "dashboard_material", "dashboard_labor",
    "dashboard_mfg_finance",
    "dashboard_scrap_rework", "dashboard_process_yield", "dashboard_downtime",
    "dashboard_bom_variance", "dashboard_supplier_score",
})


def _resolve_api_base(subpath: str) -> str:
    """按 Referer 优先解析行业后端，避免同名 dashboard_* 路由串台。"""
    referer = request.headers.get("Referer", "")
    root = subpath.split("/")[0] if subpath else ""
    if "/industries/manufacturing/" in referer:
        return MANUFACTURING_API_BASE
    if "/industries/internet/" in referer:
        return INTERNET_API_BASE
    if "/industries/retail/" in referer:
        return RETAIL_API_BASE
    if root in MANUFACTURING_API_ROOTS:
        return MANUFACTURING_API_BASE
    if root in INTERNET_API_ROOTS:
        return INTERNET_API_BASE
    return RETAIL_API_BASE
app = Flask(__name__, static_folder=str(ROOT), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})


def _metadata_config() -> dict:
    return {
        "host": os.getenv("DB_HOST", "127.0.0.1"),
        "port": int(os.getenv("DB_PORT", "3306")),
        "user": os.getenv("DB_USER", "root"),
        "password": os.getenv("DB_PASSWORD", "123456"),
        "database": os.getenv("DB_METADATA_NAME", "portfolio_metadata"),
        "charset": "utf8mb4",
        "cursorclass": DictCursor,
        "connect_timeout": int(os.getenv("DB_CONNECT_TIMEOUT", "10")),
    }


def _ok(data):
    return jsonify({"ok": True, "error": None, "data": data})


def _error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message, "data": None}), status


def _fetch_all(sql: str, params=None):
    conn = pymysql.connect(**_metadata_config())
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.fetchall()
    finally:
        conn.close()


@app.get("/api/health")
def health():
    try:
        rows = _fetch_all("SELECT 1 AS ok")
        return _ok({"database": "portfolio_metadata", "connected": bool(rows)})
    except Exception as exc:
        return _error(f"Metadata DB unavailable: {exc}", 503)


@app.get("/api/industries")
def industries():
    sql = """
        SELECT
            industry_id, industry_code, industry_name, database_name,
            folder_path, entry_file, current_version, industry_status,
            active_version_tag, last_change_at, pending_sync_count,
            latest_sync_status, updated_at
        FROM v_industry_status
        WHERE industry_status = 'active'
        ORDER BY industry_id
    """
    try:
        rows = _fetch_all(sql)
        for row in rows:
            folder = (row.get("folder_path") or "").strip("/")
            entry = row.get("entry_file") or "index.html"
            row["entry_url"] = f"/{folder}/{entry}" if folder else f"/{entry}"
        return _ok(rows)
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


@app.get("/api/industry/<code>/status")
def industry_status(code: str):
    sql = """
        SELECT * FROM v_industry_status
        WHERE industry_code = %s
        LIMIT 1
    """
    try:
        rows = _fetch_all(sql, (code,))
        if not rows:
            return _error(f"Industry not found: {code}", 404)
        return _ok(rows[0])
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


@app.get("/api/search")
def search():
    q = (request.args.get("q") or "").strip()
    industry = request.args.get("industry", "retail")
    if not q:
        return _ok([])
    sql = """
        SELECT category, title, subtitle, target_url, anchor_id, field_key
        FROM search_index
        WHERE industry_code = %s
          AND (title LIKE %s OR subtitle LIKE %s OR keywords LIKE %s)
        ORDER BY
          CASE category
            WHEN 'dashboard' THEN 1 WHEN 'metric' THEN 2 WHEN 'table' THEN 3
            WHEN 'field' THEN 4 WHEN 'lineage' THEN 5 ELSE 6 END,
          title
        LIMIT 30
    """
    like = f"%{q}%"
    try:
        rows = _fetch_all(sql, (industry, like, like, like))
        industry_prefix = {
            "retail": "/industries/retail",
            "internet": "/industries/internet",
            "manufacturing": "/industries/manufacturing",
        }.get(industry, "/industries/retail")
        # 兼容历史短名；未命中则按行业前缀拼接相对路径
        entry = {
            "retail": "retail_dashboard.html",
            "internet": "internet_dashboard.html",
            "manufacturing": "manufacturing_dashboard.html",
        }.get(industry, "retail_dashboard.html")
        report_path = (
            f"{industry_prefix}/pages/report.html"
            if industry == "retail"
            else f"{industry_prefix}/pdf/report.html"
        )
        legacy_map = {
            "shell.html": f"{industry_prefix}/{entry}",
            "retail_dashboard.html": "/industries/retail/retail_dashboard.html",
            "internet_dashboard.html": "/industries/internet/internet_dashboard.html",
            "manufacturing_dashboard.html": "/industries/manufacturing/manufacturing_dashboard.html",
            "architecture.html": f"{industry_prefix}/pages/architecture.html",
            "anomaly.html": "/industries/retail/pages/anomaly.html",
            "methodology.html": f"{industry_prefix}/pages/methodology.html",
            "erp.html": "/industries/retail/pages/erp.html",
            "report.html": report_path,
        }
        for row in rows:
            tu = (row.get("target_url") or "").strip()
            if tu in legacy_map:
                base = legacy_map[tu]
            elif tu.startswith("/"):
                base = tu
            elif tu.startswith("industries/"):
                base = f"/{tu}"
            elif tu.startswith("pages/") or tu.startswith("pdf/") or tu.startswith("dashboard"):
                base = f"{industry_prefix}/{tu}"
            else:
                base = f"{industry_prefix}/{tu}"
            row["url"] = base + (f"#{row['anchor_id']}" if row.get("anchor_id") else "")
        return _ok(rows)
    except Exception as exc:
        return _error(f"Search failed: {exc}", 500)


@app.get("/")
def index_page():
    return send_from_directory(ROOT, "index.html")


@app.route("/api/<path:subpath>", methods=["GET", "POST"])
def proxy_industry_api(subpath: str):
    """将行业业务 API 代理到对应后端（5100 → 5000 零售 / 5001 互联网）。"""
    industry_base = _resolve_api_base(subpath)
    url = f"{industry_base}/api/{subpath}"
    if request.query_string:
        url = f"{url}?{request.query_string.decode()}"
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() != "host"},
            data=request.get_data(),
            timeout=30,
        )
        excluded = {"content-encoding", "content-length", "transfer-encoding", "connection"}
        headers = [(k, v) for k, v in resp.headers.items() if k.lower() not in excluded]
        return resp.content, resp.status_code, headers
    except requests.RequestException as exc:
        return _error(f"Industry API proxy failed ({industry_base}): {exc}", 502)


@app.get("/<path:asset>")
def static_asset(asset: str):
    target = ROOT / asset
    if target.is_file():
        return send_from_directory(ROOT, asset)
    return _error("Not found", 404)


if __name__ == "__main__":
    port = int(os.getenv("PORTFOLIO_PORT", "5100"))
    print(f"Portfolio platform: http://127.0.0.1:{port}/")
    app.run(host="0.0.0.0", port=port, debug=True)
