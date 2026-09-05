"""
数仓与分析实战教材 · 独立入口（第 5 服务）
本地: python learn_app.py  →  http://127.0.0.1:5101/pages/learn.html

与 Portfolio Platform(5100) 共用同一套 portfolio/ 静态资源；
本进程只负责教材入口与静态托管，不代理行业 API。
"""

from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, redirect, send_from_directory

ROOT = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=str(ROOT), static_url_path="")


@app.get("/")
def index_page():
    return redirect("/pages/learn.html")


@app.get("/<path:asset>")
def static_asset(asset: str):
    target = ROOT / asset
    if target.is_file():
        return send_from_directory(ROOT, asset)
    return ("Not found", 404)


if __name__ == "__main__":
    port = int(os.getenv("LEARN_PORT", "5101"))
    print(f"Learn textbook: http://127.0.0.1:{port}/pages/learn.html")
    app.run(host="0.0.0.0", port=port, debug=True)
