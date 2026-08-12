"""行业 Flask API 静态资源：portfolio/industries/{industry} + 共享 css/js。

5000/5001/5002 仅作 API + 可选直连看板；推荐浏览器入口仍为 5100 portfolio_app。
"""
from __future__ import annotations

from pathlib import Path

from flask import Flask, jsonify, redirect, send_from_directory

PORTFOLIO_ROOT = Path(__file__).resolve().parent

INDUSTRY_ENTRY = {
    "retail": "retail_dashboard.html",
    "internet": "internet_dashboard.html",
    "manufacturing": "manufacturing_dashboard.html",
}

# 旧 docs/ 根路径别名 → portfolio 相对路径
LEGACY_ALIASES: dict[str, dict[str, str]] = {
    "retail": {
        "shell.html": "retail_dashboard.html",
        "index.html": "retail_dashboard.html",
        "anomaly.html": "pages/anomaly.html",
        "architecture.html": "pages/architecture.html",
        "report.html": "pages/report.html",
    },
    "internet": {
        "shell.html": "internet_dashboard.html",
        "architecture.html": "pages/architecture.html",
        "methodology.html": "pages/methodology.html",
        "dictionary.html": "pages/dictionary.html",
    },
    "manufacturing": {
        "shell.html": "manufacturing_dashboard.html",
        "architecture.html": "pages/architecture.html",
        "methodology.html": "pages/methodology.html",
        "dictionary.html": "pages/dictionary.html",
    },
}

ERP_REDIRECT = {
    "retail": "/pages/architecture.html#erp-datasource",
}


def industry_root(industry: str) -> Path:
    return PORTFOLIO_ROOT / "industries" / industry


def register_industry_static(app: Flask, industry: str) -> None:
    """注册 / 与 /<path>，优先行业目录，其次 portfolio 根（css/js）。"""
    root = industry_root(industry)
    entry = INDUSTRY_ENTRY[industry]
    aliases = LEGACY_ALIASES.get(industry, {})

    @app.get("/")
    def _industry_index():
        return send_from_directory(root, entry)

    @app.get("/<path:filename>")
    def _industry_static(filename: str):
        if filename.startswith("api/"):
            return jsonify({"ok": False, "error": "Not found"}), 404

        if filename == "erp.html" and industry in ERP_REDIRECT:
            return redirect(ERP_REDIRECT[industry], code=302)

        resolved = filename
        if filename in aliases:
            resolved = aliases[filename]
            if "#" in resolved:
                path, frag = resolved.split("#", 1)
                return redirect(f"/{path}#{frag}", code=302)

        for base in (root, PORTFOLIO_ROOT):
            target = base / resolved
            if target.is_file():
                return send_from_directory(base, resolved)

        return jsonify({"ok": False, "error": "Not found"}), 404


def portfolio_ui_url(industry: str, page: str = "") -> str:
    """5100 平台入口 URL（文档 / 启动脚本用）。"""
    base = f"http://127.0.0.1:5100/industries/{industry}"
    if not page:
        return f"{base}/{INDUSTRY_ENTRY[industry]}"
    return f"{base}/{page.lstrip('/')}"
