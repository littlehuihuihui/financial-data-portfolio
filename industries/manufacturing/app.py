"""启动制造业 API（转发到 manufacturing-analytics）。"""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).resolve().parents[2] / "manufacturing-analytics" / "app.py"), run_name="__main__")
