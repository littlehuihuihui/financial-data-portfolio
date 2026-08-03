"""
互联网用户增长监控体系 PDF 导出（对齐零售 export_pdf.py）

用法：
    python export_internet.py
    python export_internet.py --month 202607 --api http://127.0.0.1:5001

依赖（首次）：
    pip install playwright && playwright install chromium

输出：
    output/互联网用户增长监控体系报告_YYYY-MM.pdf
"""

from __future__ import annotations

import argparse
import sys
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "output"
DEFAULT_API = "http://127.0.0.1:5001"
DEFAULT_MONTH = "202607"


def _start_server(port: int) -> HTTPServer:
    import os

    os.chdir(ROOT)
    server = HTTPServer(("127.0.0.1", port), SimpleHTTPRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def export_pdf(port: int = 8771, api_base: str = DEFAULT_API, month: str = DEFAULT_MONTH) -> Path:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit(
            "缺少 playwright。请执行：\n  pip install playwright\n  playwright install chromium"
        ) from exc

    server = _start_server(port)
    time.sleep(0.6)

    month_label = f"{month[:4]}-{month[4:6]}" if len(month) == 6 else month
    url = f"http://127.0.0.1:{port}/report.html?api={api_base}&month={month}"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"互联网OTT视频活跃分析报告_{month_label}.pdf"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 1600})
        page.goto(url, wait_until="networkidle", timeout=90000)
        page.wait_for_function("window.REPORT_READY === true", timeout=45000)
        page.wait_for_timeout(1200)
        month_eval = page.evaluate(
            "() => window.REPORT_DATA?.meta?.current_month || ''"
        )
        if month_eval:
            out_path = OUTPUT_DIR / f"互联网OTT视频活跃分析报告_{month_eval}.pdf"
        page.pdf(
            path=str(out_path),
            format="A4",
            print_background=True,
            margin={"top": "12mm", "bottom": "12mm", "left": "10mm", "right": "10mm"},
        )
        browser.close()

    server.shutdown()
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(description="导出互联网用户增长 PDF 报告")
    parser.add_argument("--port", type=int, default=8771, help="本地报告页服务端口")
    parser.add_argument("--api", default=DEFAULT_API, help="互联网 API 地址")
    parser.add_argument("--month", default=DEFAULT_MONTH, help="分析月份 YYYYMM")
    args = parser.parse_args()

    try:
        out = export_pdf(port=args.port, api_base=args.api, month=args.month)
    except Exception as exc:
        if "Address already in use" in str(exc) or "10048" in str(exc):
            print(f"端口 {args.port} 被占用，请使用 --port 指定其他端口")
        else:
            print(f"导出失败：{exc}")
        return 1

    print(f"PDF 已导出：{out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
