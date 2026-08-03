"""广东移动 OTT 视频活跃分析 · Flask API + 看板静态页 · 端口 5001"""
from __future__ import annotations

import os
from datetime import datetime, timedelta
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

import queries as q
from db_utils import fetch_all, fetch_one, ping_db

ROOT = Path(__file__).resolve().parent
DASHBOARD_ROOT = ROOT.parent / "portfolio" / "industries" / "internet"

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})


def _ok(data):
    return jsonify({"ok": True, "error": None, "data": data})


def _error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message, "data": None}), status


def _month():
    return q.parse_month_id(request.args.get("month"))


def _windows(month_id: int):
    """返回多时间窗口 (name, start, end)。"""
    aod = q.as_of(month_id)
    ms, me = q.month_bounds(month_id)
    wk_start = aod - timedelta(days=aod.weekday())
    return {
        "today": ("本日", aod, aod),
        "week": ("本周", wk_start, aod),
        "month": ("本月", ms, me),
        "last7": ("近7天", aod - timedelta(days=6), aod),
        "last30": ("近30天", aod - timedelta(days=29), aod),
    }


def _s(d):
    return d.isoformat()


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "db_connected": ping_db(), "industry": "ott",
                    "time": datetime.utcnow().isoformat() + "Z"})


@app.get("/api/meta")
def meta():
    return _ok({"default_month": 202607, "data_min": _s(q.DATA_MIN), "data_max": _s(q.DATA_MAX)})


# ---------------- 01 活跃总览 ----------------
@app.get("/api/dashboard_overview")
def dashboard_overview():
    m = _month()
    w = _windows(m)
    aod = q.as_of(m)
    ms, me = q.month_bounds(m)
    try:
        by_type = fetch_all(q.SQL_MAU_BY_TYPE, (_s(ms), _s(me)))
        mau_map = {r["device_type"]: r["mau"] for r in by_type}
        mau_total = fetch_one(q.SQL_UNIQUE_MAC, (_s(ms), _s(me))) or {}
        # 多窗口活跃用户数
        windows = []
        for key in ["today", "week", "month", "last7", "last30"]:
            name, s, e = w[key]
            uv = (fetch_one(q.SQL_UNIQUE_MAC, (_s(s), _s(e))) or {}).get("uv", 0)
            windows.append({"name": name, "users": uv})
        dau_trend = fetch_all(q.SQL_DAU_TREND, (_s(aod - timedelta(days=29)), _s(aod)))
        compose = fetch_one(q.SQL_ACTIVE_COMPOSE, (_s(aod),)) or {}
        mau_trend = fetch_all(q.SQL_MAU_TREND)
        return _ok({
            "month_id": m,
            "mau": {"stb": mau_map.get("STB", 0), "speaker": mau_map.get("Speaker", 0),
                    "total": mau_total.get("uv", 0)},
            "windows": windows, "dau_trend": dau_trend, "compose": compose, "mau_trend": mau_trend,
        })
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 02 开机活跃 ----------------
@app.get("/api/dashboard_launcher")
def dashboard_launcher():
    m = _month()
    w = _windows(m)
    ms, me = q.month_bounds(m)
    aod = q.as_of(m)
    try:
        kpi = fetch_one(q.SQL_LAUNCHER_KPI, (_s(ms), _s(me))) or {}
        by_type = fetch_all(q.SQL_LAUNCHER_BY_TYPE, (_s(ms), _s(me)))
        trend = fetch_all(q.SQL_LAUNCHER_TREND, (_s(aod - timedelta(days=29)), _s(aod)))
        windows = []
        for key in ["today", "week", "month", "last7", "last30"]:
            name, s, e = w[key]
            r = fetch_one(q.SQL_LAUNCHER_KPI, (_s(s), _s(e))) or {}
            windows.append({"name": name, "boot_users": r.get("boot_users", 0), "boot_cnt": r.get("boot_cnt", 0)})
        return _ok({"month_id": m, "kpi": kpi, "by_type": by_type, "trend": trend, "windows": windows})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 03 点播活跃 ----------------
@app.get("/api/dashboard_vod")
def dashboard_vod():
    m = _month()
    w = _windows(m)
    ms, me = q.month_bounds(m)
    aod = q.as_of(m)
    try:
        kpi = fetch_one(q.SQL_VOD_KPI, (_s(ms), _s(me))) or {}
        by_type = fetch_all(q.SQL_VOD_BY_TYPE, (_s(ms), _s(me)))
        trend = fetch_all(q.SQL_VOD_TREND, (_s(aod - timedelta(days=29)), _s(aod)))
        windows = []
        for key in ["today", "week", "month", "last7", "last30"]:
            name, s, e = w[key]
            r = fetch_one(q.SQL_VOD_KPI, (_s(s), _s(e))) or {}
            windows.append({"name": name, "uv": r.get("uv", 0), "vv": r.get("vv", 0),
                            "play_hours": r.get("play_hours", 0)})
        return _ok({"month_id": m, "kpi": kpi, "by_type": by_type, "trend": trend, "windows": windows})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 04 直播活跃 ----------------
@app.get("/api/dashboard_live")
def dashboard_live():
    m = _month()
    ms, me = q.month_bounds(m)
    aod = q.as_of(m)
    try:
        kpi = fetch_one(q.SQL_LIVE_KPI, (_s(ms), _s(me))) or {}
        channels = fetch_all(q.SQL_LIVE_CHANNEL, (_s(ms), _s(me)))
        trend = fetch_all(q.SQL_LIVE_TREND, (_s(aod - timedelta(days=29)), _s(aod)))
        return _ok({"month_id": m, "kpi": kpi, "channels": channels, "trend": trend})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 05 内容·剧集 ----------------
@app.get("/api/dashboard_series")
def dashboard_series():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        top = fetch_all(q.SQL_SERIES_TOP, (_s(ms), _s(me)))
        by_cat = fetch_all(q.SQL_SERIES_BY_CATEGORY, (_s(ms), _s(me)))
        by_genre = fetch_all(q.SQL_SERIES_BY_GENRE, (_s(ms), _s(me), _s(ms), _s(me)))
        return _ok({"month_id": m, "top": top, "by_category": by_cat, "by_genre": by_genre})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 06 内容·单集与行为 ----------------
@app.get("/api/dashboard_episode")
def dashboard_episode():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        top = fetch_all(q.SQL_EPISODE_TOP, (_s(ms), _s(me)))
        action = fetch_all(q.SQL_ACTION_DIST)
        complete = fetch_all(q.SQL_COMPLETE_DIST)
        return _ok({"month_id": m, "top": top, "action_dist": action, "complete_dist": complete})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 07 完播与 QoS ----------------
@app.get("/api/dashboard_quality")
def dashboard_quality():
    try:
        kpi = fetch_one(q.SQL_QOS_KPI) or {}
        by_type = fetch_all(q.SQL_QOS_BY_TYPE)
        series = fetch_all(q.SQL_QOS_SERIES)
        return _ok({"kpi": kpi, "by_type": by_type, "series": series})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 08 用户生命周期 ----------------
@app.get("/api/dashboard_lifecycle")
def dashboard_lifecycle():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        kpi = fetch_one(q.SQL_LIFECYCLE_KPI, (_s(ms), _s(me))) or {}
        trend = fetch_all(q.SQL_LIFECYCLE_TREND, (_s(ms), _s(me)))
        status = fetch_all(q.SQL_USER_STATUS_DIST)
        return _ok({"month_id": m, "kpi": kpi, "trend": trend, "status": status})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 09 留存 ----------------
@app.get("/api/dashboard_retention")
def dashboard_retention():
    m = _month()
    ms, _ = q.month_bounds(m)
    try:
        trend = fetch_all(q.SQL_RETENTION_TREND)
        matrix = fetch_all(q.SQL_RETENTION_MATRIX, (_s(q.DATA_MIN),))
        return _ok({"month_id": m, "trend": trend, "matrix": matrix})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 10 设备流转 ----------------
@app.get("/api/dashboard_device")
def dashboard_device():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        type_dist = fetch_all(q.SQL_DEVICE_TYPE_DIST)
        model_dist = fetch_all(q.SQL_DEVICE_MODEL_DIST)
        fw_dist = fetch_all(q.SQL_DEVICE_FW_DIST)
        dual = fetch_one(q.SQL_DUAL_DEVICE) or {}
        region = fetch_all(q.SQL_ACTIVE_BY_REGION, (_s(ms), _s(me)))
        return _ok({"month_id": m, "type_dist": type_dist, "model_dist": model_dist,
                    "fw_dist": fw_dist, "dual": dual, "region": region})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 11 商业化漏斗 ----------------
@app.get("/api/dashboard_funnel")
def dashboard_funnel():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        funnel = fetch_one(q.SQL_FUNNEL, (_s(ms), _s(me))) or {}
        by_src = fetch_all(q.SQL_FUNNEL_BY_SRC, (_s(ms), _s(me)))
        trend = fetch_all(q.SQL_FUNNEL_TREND, (_s(ms), _s(me)))
        return _ok({"month_id": m, "funnel": funnel, "by_src": by_src, "trend": trend})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 12 订购与分成 ----------------
@app.get("/api/dashboard_order")
def dashboard_order():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        kpi = fetch_one(q.SQL_ORDER_KPI, (_s(ms), _s(me))) or {}
        mau = (fetch_one(q.SQL_UNIQUE_MAC, (_s(ms), _s(me))) or {}).get("uv", 0) or 0
        unit = (fetch_one(
            "SELECT unit_price FROM cfg_mau_settle WHERE metric_code='mau_unit_price'"
        ) or {}).get("unit_price", 2.5)
        settle_revenue = round(float(mau) * float(unit), 2)
        by_paytype = fetch_all(q.SQL_ORDER_BY_PAYTYPE, (_s(ms), _s(me)))
        by_src = fetch_all(q.SQL_ORDER_BY_SRC, (_s(ms), _s(me)))
        trend = fetch_all(q.SQL_ORDER_TREND, (_s(ms), _s(me)))
        return _ok({
            "month_id": m,
            "kpi": kpi,
            "mau_settle": {
                "mau": mau,
                "unit_price": float(unit),
                "revenue": settle_revenue,
                "source": "cfg_mau_settle.mau_unit_price",
            },
            "by_paytype": by_paytype,
            "by_src": by_src,
            "trend": trend,
        })
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)



# ---------------- 13 用户行为路径（模块1） ----------------
@app.get("/api/dashboard_path")
def dashboard_path():
    m = _month()
    ms, me = q.month_bounds(m)
    try:
        overview = fetch_all(q.SQL_PATH_OVERVIEW, (_s(ms), _s(me)))
        drop_off = fetch_all(q.SQL_PATH_DROP_OFF, (_s(ms), _s(me)))
        # top_chain 查询较重，Sankey 由 overview 拼装；保留字段兼容旧前端
        return _ok({"month_id": m, "overview": overview, "top_chain": [], "drop_off": drop_off})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 14 收入结构深度分析（模块2） ----------------
@app.get("/api/dashboard_revenue")
def dashboard_revenue():
    m = _month()
    ml = q.month_label(m)
    try:
        structure = fetch_all(q.SQL_REVENUE_STRUCTURE, (ml,))
        plan_analysis = fetch_all(q.SQL_PLAN_ANALYSIS, (ml,))
        arpu_trend = fetch_all(q.SQL_ARPU_TREND) or []
        return _ok({"month_id": m, "structure": structure, "plan_analysis": plan_analysis,
                     "arpu_trend": arpu_trend})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 15 营销活动复盘（模块3） ----------------
@app.get("/api/dashboard_activity")
def dashboard_activity():
    try:
        activity_list = fetch_all(q.SQL_ACTIVITY_LIST) or []
        return _ok({"activities": activity_list})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


@app.get("/api/dashboard_activity_detail")
def dashboard_activity_detail():
    name = request.args.get("name", "")
    if not name:
        return _error("name required", 400)
    try:
        detail = fetch_all(q.SQL_ACTIVITY_DETAIL, (name,))
        return _ok({"activity_name": name, "detail": detail})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 16 业务健康度仪表盘（模块4） ----------------
@app.get("/api/dashboard_health")
def dashboard_health():
    try:
        metrics = fetch_all(q.SQL_HEALTH_DASHBOARD) or []
        summary = fetch_all(q.SQL_HEALTH_SUMMARY) or []
        return _ok({"metrics": metrics, "summary": summary})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


# ---------------- 17 用户标签（模块5） ----------------
@app.get("/api/dashboard_tags")
def dashboard_tags():
    try:
        overview = fetch_all(q.SQL_TAG_OVERVIEW) or []
        by_category = fetch_all(q.SQL_TAG_BY_CATEGORY) or []
        return _ok({"overview": overview, "by_category": by_category})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


@app.get("/api/dashboard_tag_detail")
def dashboard_tag_detail():
    try:
        detail = fetch_all(q.SQL_TAG_DETAIL) or []
        return _ok({"detail": detail})
    except Exception as exc:
        return _error(f"Query failed: {exc}", 500)


@app.get("/")
def index_page():
    return send_from_directory(DASHBOARD_ROOT, "internet_dashboard.html")


@app.get("/<path:filename>")
def dashboard_static(filename: str):
    if filename.startswith("api/"):
        return _error("Not found", 404)
    target = DASHBOARD_ROOT / filename
    if target.is_file():
        return send_from_directory(DASHBOARD_ROOT, filename)
    return _error("Not found", 404)


if __name__ == "__main__":
    port = int(os.getenv("INTERNET_API_PORT", "5001"))
    print(f"OTT analytics: http://127.0.0.1:{port}/")
    app.run(host="0.0.0.0", port=port, debug=True)
