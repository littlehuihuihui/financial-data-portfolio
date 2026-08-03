"""
跃动体育 · 财务看板 Flask API
部署: Render / Railway / PythonAnywhere
本地: python app.py
"""

from __future__ import annotations

import io
import os
from datetime import datetime

import pandas as pd
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

import queries as q
import warehouse_queries as wq
import dashboard_queries as dq
from db_utils import fetch_all, fetch_one, get_cursor, ping_db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})

DOCS_ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")


def _error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message, "data": None}), status


def _ok(data, extra: dict | None = None):
    payload = {"ok": True, "data": data}
    if extra:
        payload.update(extra)
    return jsonify(payload)


def _month_from_request() -> int:
    return q.parse_month_id(request.args.get("month"))


def _month_label_from_request() -> str:
    return q.month_label(_month_from_request())


def _month_range_labels(month_id: int, months: int = 12) -> tuple[str, str]:
    return q.month_window_labels(month_id, months)


@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "db_connected": ping_db(),
        "time": datetime.utcnow().isoformat() + "Z",
    })


@app.get("/api/meta")
def meta():
    brands = fetch_all(
        "SELECT brand_name FROM retail_finance.dim_brand WHERE brand_id > 0 ORDER BY brand_id"
    )
    channels = fetch_all(
        "SELECT channel_name FROM retail_finance.dim_channel WHERE channel_id > 0 ORDER BY channel_id"
    )
    categories = fetch_all(
        "SELECT category_name FROM retail_finance.dim_category ORDER BY category_id"
    )
    return _ok({
        "brands": ["全部"] + [r["brand_name"] for r in brands],
        "channels": ["全部"] + [r["channel_name"] for r in channels],
        "categories": ["全部"] + [r["category_name"] for r in categories],
        "default_month": 202606,
    })


@app.get("/api/dashboard_overview")
def dashboard_overview():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))

    prev_id = q.shift_month(month_id, -1)
    yoy_id = q.shift_month(month_id, -12)
    start_label, end_label = q.month_window_labels(month_id, 12)
    month_lbl = q.month_label(month_id)
    yoy_lbl = q.month_label(yoy_id)

    try:
        kpi_cards = fetch_all(q.SQL_KPI_CARDS, q.kpi_params(month_id))
        monthly_trend = fetch_all(q.SQL_MONTHLY_TREND, (start_label, end_label))
        channel_structure = fetch_all(q.SQL_CHANNEL_STRUCTURE, (month_lbl,))
        brand_ranking = fetch_all(q.SQL_BRAND_RANKING, (month_lbl, yoy_lbl))
        store_top5 = fetch_all(q.SQL_STORE_TOP5, (month_lbl,))
    except Exception as exc:
        return _error(f"Database query failed: {exc}", 500)

    return _ok({
        "month_id": month_id,
        "month_label": q.month_label(month_id),
        "kpi_cards": kpi_cards,
        "monthly_trend": monthly_trend,
        "channel_structure": channel_structure,
        "brand_ranking": brand_ranking,
        "store_top5": store_top5,
    })


@app.get("/api/dashboard_brand")
def dashboard_brand():
    brand = request.args.get("brand", "跃动Pro")
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))

    yoy_id = q.shift_month(month_id, -12)
    start_label, end_label = q.month_window_labels(month_id, 12)
    month_lbl = q.month_label(month_id)
    yoy_lbl = q.month_label(yoy_id)

    try:
        brand_kpi = fetch_one(
            q.SQL_BRAND_KPI,
            (month_lbl, brand, yoy_lbl, brand, month_lbl),
        )
        channel_revenue = fetch_all(q.SQL_BRAND_CHANNEL_REVENUE, (month_lbl, brand))
        category_margin = fetch_all(q.SQL_BRAND_CATEGORY_MARGIN, (month_lbl, brand))
        monthly_trend = fetch_all(q.SQL_BRAND_MONTHLY_TREND, (start_label, end_label, brand))
    except Exception as exc:
        return _error(f"Database query failed: {exc}", 500)

    return _ok({
        "brand": brand,
        "month_id": month_id,
        "brand_kpi": brand_kpi or {},
        "channel_revenue": channel_revenue,
        "category_margin": category_margin,
        "monthly_trend": monthly_trend,
    })


@app.get("/api/dashboard_channel")
def dashboard_channel():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))

    month_lbl = q.month_label(month_id)

    try:
        channel_kpi = fetch_all(q.SQL_CHANNEL_KPI, (month_lbl, month_lbl))
        scatter = fetch_all(q.SQL_CHANNEL_SCATTER, (month_lbl,))
        expense_breakdown = fetch_all(q.SQL_EXPENSE_BREAKDOWN, (month_lbl,))
        budget = fetch_one(q.SQL_BUDGET_EXECUTION, (month_lbl, month_lbl, month_lbl))
        daily_trend = fetch_all(dq.SQL_CHANNEL_DAILY_TREND, (month_lbl,))
        ad_efficiency = fetch_all(dq.SQL_CHANNEL_AD_EFFICIENCY, (month_lbl, month_lbl))
    except Exception as exc:
        return _error(f"Database query failed: {exc}", 500)

    return _ok({
        "month_id": month_id,
        "channel_kpi": channel_kpi,
        "channel_scatter": scatter,
        "expense_breakdown": expense_breakdown,
        "budget_execution": budget or {},
        "daily_trend": daily_trend,
        "ad_efficiency": ad_efficiency,
    })


def _detail_query_args():
    date_from = request.args.get("date_from", "2026-06-01")
    date_to = request.args.get("date_to", "2026-06-30")
    brand = request.args.get("brand", "全部")
    channel = request.args.get("channel", "全部")
    category = request.args.get("category", "全部")
    detail_type = request.args.get("type", "orders")
    returns_only = detail_type == "returns"
    return date_from, date_to, brand, channel, category, returns_only


@app.get("/api/query_detail")
def query_detail():
    date_from, date_to, brand, channel, category, returns_only = _detail_query_args()
    extra_sql, extra_params = q.build_detail_filters(brand, channel, category, returns_only)

    sql = q.DETAIL_BASE_SQL + extra_sql + " ORDER BY v.order_date DESC, v.order_id LIMIT 100"
    count_sql = q.DETAIL_COUNT_SQL + extra_sql

    params = [date_from, date_to] + extra_params
    try:
        rows = fetch_all(sql, tuple(params))
        total = fetch_one(count_sql, tuple(params))
    except Exception as exc:
        return _error(f"Database query failed: {exc}", 500)

    return _ok({
        "rows": rows,
        "preview_count": len(rows),
        "total_count": total["total_count"] if total else 0,
        "filters": {
            "date_from": date_from,
            "date_to": date_to,
            "brand": brand,
            "channel": channel,
            "category": category,
            "type": "returns" if returns_only else "orders",
        },
    })


@app.get("/api/export_csv")
def export_csv():
    date_from, date_to, brand, channel, category, returns_only = _detail_query_args()
    extra_sql, extra_params = q.build_detail_filters(brand, channel, category, returns_only)

    sql = q.DETAIL_BASE_SQL + extra_sql + " ORDER BY v.order_date DESC, v.order_id"
    params = [date_from, date_to] + extra_params

    try:
        rows = fetch_all(sql, tuple(params))
    except Exception as exc:
        return _error(f"Database query failed: {exc}", 500)

    df = pd.DataFrame(rows)
    if df.empty:
        df = pd.DataFrame(columns=[
            "order_id", "order_date", "brand_name", "channel_name", "category_name",
            "payment_amount", "cost", "profit", "return_flag", "customer_region", "sku_id",
        ])

    buf = io.BytesIO()
    df.to_csv(buf, index=False, encoding="utf-8-sig")
    buf.seek(0)

    prefix = "returns" if returns_only else "orders"
    filename = f"yuedong_{prefix}_{date_from}_{date_to}.csv"
    return send_file(
        buf,
        mimetype="text/csv",
        as_attachment=True,
        download_name=filename,
    )


@app.get("/api/erp/mapping")
def erp_mapping():
    try:
        stats = fetch_all(wq.ODS_STATS_SQL)
    except Exception:
        stats = []
    return _ok({"mapping": wq.ERP_MAPPING, "ods_stats": stats})


@app.get("/api/erp/reconciliation")
def erp_reconciliation():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start = q.shift_month(month_id, -5)
    month_lbl = q.month_label(month_id)
    try:
        current = fetch_all(wq.RECON_SUMMARY_SQL, (month_lbl,))
        trend = fetch_all(wq.RECON_TREND_SQL, (start, month_id))
        abnormal = sum(1 for r in current if r.get("status") == "异常")
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({
        "month_id": month_id,
        "overall_status": "异常" if abnormal else "正常",
        "items": current,
        "trend": trend,
    })


@app.get("/api/erp/export_gl")
def erp_export_gl():
    date_from = request.args.get("date_from", "2026-06-01")
    date_to = request.args.get("date_to", "2026-06-30")
    try:
        rows = fetch_all(wq.GL_EXPORT_SQL, (date_from, date_to, date_from, date_to))
    except Exception as exc:
        return _error(f"Export failed: {exc}", 500)
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False, encoding="utf-8-sig")
    buf.seek(0)
    return send_file(buf, mimetype="text/csv", as_attachment=True,
                     download_name=f"erp_gl_{date_from}_{date_to}.csv")


@app.get("/api/erp/export_balance")
def erp_export_balance():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start = q.shift_month(month_id, -5)
    try:
        rows = fetch_all(wq.BALANCE_EXPORT_SQL, (start, month_id))
    except Exception as exc:
        return _error(f"Export failed: {exc}", 500)
    df = pd.DataFrame(rows)
    buf = io.BytesIO()
    df.to_csv(buf, index=False, encoding="utf-8-sig")
    buf.seek(0)
    return send_file(buf, mimetype="text/csv", as_attachment=True,
                     download_name=f"erp_account_balance_{start}_{month_id}.csv")


@app.get("/api/dashboard_tax")
def dashboard_tax():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start = q.shift_month(month_id, -11)
    start_lbl = q.month_label(start)
    month_lbl = q.month_label(month_id)
    try:
        items = fetch_all(wq.TAX_ANALYSIS_SQL, (month_lbl,))
        trend = fetch_all(dq.SQL_TAX_TREND, (start_lbl,))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "items": items, "trend": trend})


@app.get("/api/dashboard_fund")
def dashboard_fund():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    date_from = f"{month_lbl}-01"
    try:
        daily = fetch_all(wq.FUND_DASHBOARD_SQL, (date_from, date_from))
        forecast = fetch_all(wq.FUND_FORECAST_SQL)
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    latest = daily[0] if daily else {}
    return _ok({"month_id": month_id, "daily": daily, "forecast": forecast, "latest": latest})


@app.get("/api/dashboard_benchmark")
def dashboard_benchmark():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    brand = request.args.get("brand", "跃动Life")
    month_lbl = q.month_label(month_id)
    try:
        items = fetch_all(
            wq.BENCHMARK_SQL,
            (month_lbl, brand, month_lbl, brand, month_lbl, brand),
        )
        radar = fetch_all(
            wq.BENCHMARK_RADAR_SQL,
            (month_lbl, brand, month_lbl, brand, month_lbl, brand),
        )
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "brand": brand, "items": items, "radar": radar})


@app.get("/api/metric_definitions")
def metric_definitions():
    return _ok(wq.METRIC_DEFINITIONS)


@app.get("/api/dashboard_quality")
def dashboard_quality():
    try:
        summary = fetch_all(wq.QUALITY_SUMMARY_SQL)
        trend = fetch_all(wq.QUALITY_TREND_SQL)
        open_issues = fetch_all(wq.QUALITY_OPEN_SQL)
        recon = fetch_all(wq.QUALITY_RECON_SQL)
        pass_rates = fetch_all(wq.QUALITY_PASS_RATE_SQL)
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    latest = summary[0] if summary else {}
    open_count = len([x for x in open_issues if x]) if open_issues else 0
    return _ok({
        "summary": summary,
        "latest_score": latest.get("quality_score", 100),
        "pass_rate": latest.get("pass_rate", 100),
        "open_count": open_count,
        "last_check": latest.get("check_date"),
        "trend": trend,
        "open_issues": open_issues,
        "reconciliation": recon,
        "table_pass_rates": pass_rates,
    })


@app.post("/api/quality/resolve")
def quality_resolve():
    log_id = request.json.get("log_id") if request.is_json else request.args.get("log_id")
    if not log_id:
        return _error("log_id required")
    # sql6 无 ods_quality_log 表，质量异常由实时校验生成，标记为已读即可
    return _ok({"log_id": int(log_id), "resolved": True, "note": "实时校验模式，无需持久化"})


def _month_range(month_id: int, months: int = 12) -> tuple[str, str]:
    return _month_range_labels(month_id, months)


@app.get("/api/dashboard_financial")
def dashboard_financial():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    try:
        income = fetch_all(dq.SQL_INCOME_STATEMENT, (month_lbl, month_lbl))
        balance = fetch_all(dq.SQL_BALANCE_SHEET, (month_lbl,))
        cashflow = fetch_all(dq.SQL_CASHFLOW_STATEMENT, (month_lbl, month_lbl, month_lbl))
        recon = fetch_all(dq.SQL_TRIPLE_RECONCILIATION, (month_lbl, month_lbl, month_lbl))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "income": income, "balance": balance, "cashflow": cashflow, "reconciliation": recon})


@app.get("/api/dashboard_dupont")
def dashboard_dupont():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start, end = _month_range(month_id, 12)
    month_lbl = q.month_label(month_id)
    prev_lbl = q.month_label(q.shift_month(month_id, -1))
    try:
        current = fetch_all(dq.SQL_DUPONT_CURRENT, (month_lbl, prev_lbl))
        trend = fetch_all(dq.SQL_DUPONT_TREND, (start, end))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "current": current, "trend": trend})


@app.get("/api/dashboard_cashflow")
def dashboard_cashflow():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start, end = _month_range(month_id, 12)
    month_lbl = q.month_label(month_id)
    try:
        kpi = fetch_one(dq.SQL_CASHFLOW_KPI, (month_lbl, month_lbl, month_lbl)) or {}
        trend = fetch_all(dq.SQL_CASHFLOW_TREND, (start, end, start, end))
        gap = fetch_all(dq.SQL_CASHFLOW_GAP, (month_lbl, month_lbl, month_lbl))
        forecast = fetch_all(dq.SQL_FUND_FORECAST)
        balances = fetch_all(dq.SQL_FUND_BALANCE, (month_lbl, month_lbl))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "kpi": kpi, "trend": trend, "gap_breakdown": gap, "forecast": forecast, "bank_balances": balances})


@app.get("/api/dashboard_inventory")
def dashboard_inventory():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    try:
        kpi = fetch_one(dq.SQL_INVENTORY_KPI, (month_lbl,)) or {}
        age = fetch_all(dq.SQL_INVENTORY_AGE, (month_lbl,))
        brand_turnover = fetch_all(dq.SQL_INVENTORY_BRAND_TURNOVER, (month_lbl,))
        slow_sku = fetch_all(dq.SQL_INVENTORY_SLOW_SKU, (month_lbl,))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "kpi": kpi, "age_structure": age, "brand_turnover": brand_turnover, "slow_sku": slow_sku})


@app.get("/api/dashboard_budget")
def dashboard_budget():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    try:
        by_channel = fetch_all(dq.SQL_BUDGET_CHANNEL, (month_lbl,))
        by_brand = fetch_all(dq.SQL_BUDGET_BRAND, (month_lbl,))
        alerts = fetch_all(dq.SQL_BUDGET_ALERTS, (month_lbl,))
        detail = fetch_all(dq.SQL_BUDGET_DETAIL, (month_lbl,))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "by_channel": by_channel, "by_brand": by_brand, "alerts": alerts, "detail": detail})


@app.get("/api/dashboard_store")
def dashboard_store():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    try:
        kpi = fetch_one(dq.SQL_STORE_KPI, (month_lbl,)) or {}
        top10 = fetch_all(dq.SQL_STORE_TOP10, (month_lbl,))
        scatter = fetch_all(dq.SQL_STORE_SCATTER, (month_lbl,))
        alerts = fetch_all(dq.SQL_STORE_ALERTS, (month_lbl,))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "kpi": kpi, "top10": top10, "scatter": scatter, "alerts": alerts})


@app.get("/api/dashboard_profit_quality")
def dashboard_profit_quality():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    start, end = _month_range(month_id, 12)
    month_lbl = q.month_label(month_id)
    try:
        kpi = fetch_one(dq.SQL_PROFIT_QUALITY_KPI, (month_lbl, month_lbl, month_lbl)) or {}
        trend = fetch_all(dq.SQL_PROFIT_QUALITY_TREND, (start, end, start, end))
        by_brand = fetch_all(dq.SQL_PROFIT_QUALITY_BRAND, (month_lbl, month_lbl, month_lbl))
        benchmark = fetch_all(dq.SQL_PROFIT_QUALITY_BENCHMARK, (month_lbl, month_lbl, month_lbl))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "kpi": kpi, "trend": trend, "by_brand": by_brand, "benchmark": benchmark})


@app.get("/api/dashboard_cvp")
def dashboard_cvp():
    try:
        month_id = _month_from_request()
    except ValueError as exc:
        return _error(str(exc))
    month_lbl = q.month_label(month_id)
    try:
        kpi = fetch_one(dq.SQL_CVP_KPI, (month_lbl, month_lbl)) or {}
        by_brand = fetch_all(dq.SQL_CVP_BRAND, (month_lbl, month_lbl))
        by_channel = fetch_all(dq.SQL_CVP_CHANNEL, (month_lbl, month_lbl))
        sensitivity = fetch_all(dq.SQL_CVP_SENSITIVITY, (month_lbl, month_lbl))
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)
    return _ok({"month_id": month_id, "kpi": kpi, "by_brand": by_brand, "by_channel": by_channel, "sensitivity": sensitivity})


@app.get("/")
def index():
    """作品集首页：12看板财务数据展示系统"""
    return send_from_directory(DOCS_ROOT, "shell.html")


@app.get("/<path:filename>")
def docs_static(filename):
    """docs 目录静态资源：anomaly / architecture / report / css / js 等"""
    if filename.startswith("api/"):
        return jsonify({"ok": False, "error": "Not found"}), 404
    safe_path = os.path.join(DOCS_ROOT, filename)
    if os.path.isfile(safe_path):
        return send_from_directory(DOCS_ROOT, filename)
    return jsonify({"ok": False, "error": "Not found"}), 404


@app.get("/api/info")
def api_info():
    return jsonify({
        "service": "跃动体育财务看板 API",
        "health": "/api/health",
        "pages": {
            "dashboard": "/",
            "shell": "/shell.html",
            "legacy_dashboard": "/index.html",
            "erp": "/erp.html",
            "anomaly": "/anomaly.html",
            "architecture": "/architecture.html",
            "report": "/report.html",
        },
        "erp": {
            "mapping": "/api/erp/mapping",
            "reconciliation": "/api/erp/reconciliation?month=202606",
            "export_gl": "/api/erp/export_gl",
            "export_balance": "/api/erp/export_balance",
        },
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
