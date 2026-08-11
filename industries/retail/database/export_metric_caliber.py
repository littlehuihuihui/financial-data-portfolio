#!/usr/bin/env python3
"""兼容入口：请改用 portfolio/scripts/export_metric_caliber.py"""
from pathlib import Path
import runpy
import sys

TARGET = Path(__file__).resolve().parents[3] / "scripts" / "export_metric_caliber.py"
sys.argv = [str(TARGET), "--industry", "retail"] + sys.argv[1:]
runpy.run_path(str(TARGET), run_name="__main__")
