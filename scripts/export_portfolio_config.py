#!/usr/bin/env python3
"""
从作品集源码导出完整配置 JSON，并生成 version_history INSERT。
用法:
  python scripts/export_portfolio_config.py --industry retail --version v3.2 --notes "..."
  python scripts/export_portfolio_config.py --industry manufacturing --version v1.2 --notes "..."
  python scripts/export_portfolio_config.py --industry internet --version v2.1 --notes "..."
  python scripts/export_portfolio_config.py --industry all --version v3.2 --notes "..."
"""
from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "portfolio_metadata" / "config"
SQL_DIR = ROOT / "portfolio_metadata" / "sql"

INDUSTRY_META = {
    "retail": {
        "industry_code": "retail",
        "industry_name": "零售财务",
        "database_name": "retail_finance",
        "folder_path": "/industries/retail/",
        "entry_file": "retail_dashboard.html",
        "company_name": "跃动体育",
        "api_ports": {"retail_api": 5000, "portfolio_platform": 5100},
        "warehouse_models": ["sql6_portfolio_model"],
        "dashboard_count_expected": 14,  # 13 主题 + PDF
        "theme_dashboard_count": 13,
        "report_file": "pages/report.html",
        "report_core_content": "体系总览 + P0b监控五层(北极星/围栏) + 13 主题看板摘要 + 六层方法论 + 31 问清单 + sql6 数仓架构 PDF",
        "nav_tabs": [
            {"id": "dashboard", "label": "数据展示", "path": "retail_dashboard.html", "description": "13 个主题看板 + 角色切换"},
            {"id": "methodology", "label": "分析方法论", "path": "pages/anomaly.html", "description": "六层分析框架 · 31 问 · 第六层工具箱（右侧详情）"},
            {"id": "architecture", "label": "数仓架构", "path": "pages/architecture.html", "description": "数据源选型 · ERP 映射对账 · sql6 字典与血缘"},
            {"id": "report", "label": "导出 PDF", "path": "pages/report.html", "description": "P0-P3 完整报告"},
        ],
        "docs_playbook": ROOT.parent / "retail-finance-analysis" / "docs" / "shared" / "methodology-playbook-data.js",
        "docs_toolbox": ROOT.parent / "retail-finance-analysis" / "docs" / "shared" / "analysis-toolbox-data.js",
        "local_playbook": ROOT / "industries" / "retail" / "js" / "methodology-playbook-data.js",
        "local_toolbox": ROOT / "industries" / "retail" / "js" / "analysis-toolbox-data.js",
        "config_dir": ROOT / "industries" / "retail" / "config",
        "schema_version": "2.2",
    },
    "manufacturing": {
        "industry_code": "manufacturing",
        "industry_name": "制造业",
        "database_name": "manufacturing_analytics",
        "folder_path": "/industries/manufacturing/",
        "entry_file": "manufacturing_dashboard.html",
        "company_name": "智能制造样例",
        "api_ports": {"manufacturing_api": 5002, "portfolio_platform": 5100},
        "warehouse_models": ["manufacturing_analytics"],
        "dashboard_count_expected": 15,  # 14 主题 + PDF
        "theme_dashboard_count": 14,
        "report_file": "pdf/report.html",
        "report_core_content": "体系总览 + P0b监控五层(CMEI/围栏) + 14 主题看板摘要 + 六层方法论 + 工具箱 + 数仓架构 PDF",
        "nav_tabs": [
            {"id": "dashboard", "label": "数据展示", "path": "manufacturing_dashboard.html", "description": "14 个主题看板 + 角色切换"},
            {"id": "methodology", "label": "分析方法论", "path": "pages/methodology.html", "description": "六层分析框架 · 制造场景 · 第六层工具箱"},
            {"id": "architecture", "label": "数仓架构", "path": "pages/architecture.html", "description": "ODS→ADS · 数据字典与血缘"},
            {"id": "report", "label": "导出 PDF", "path": "pdf/report.html", "description": "P0-P3 完整报告（14 看板）"},
        ],
        "docs_playbook": None,
        "docs_toolbox": None,
        "local_playbook": ROOT / "industries" / "manufacturing" / "js" / "methodology-playbook-data.js",
        "local_toolbox": None,  # toolbox 嵌在 playbook 文件
        "config_dir": ROOT / "industries" / "manufacturing" / "config",
        "schema_version": "1.2",
    },
    "internet": {
        "industry_code": "internet",
        "industry_name": "互联网通用",
        "database_name": "internet_analytics",
        "folder_path": "/industries/internet/",
        "entry_file": "internet_dashboard.html",
        "company_name": "广东移动 OTT",
        "api_ports": {"internet_api": 5001, "portfolio_platform": 5100},
        "warehouse_models": ["internet_analytics"],
        "dashboard_count_expected": 18,  # 17 主题 + PDF
        "theme_dashboard_count": 17,
        "report_file": "pdf/report.html",
        "report_core_content": "体系总览 + P0b监控五层(有效MAU/围栏) + 17 主题看板摘要 + 六层方法论 + 工具箱 + 数仓架构 PDF",
        "nav_tabs": [
            {"id": "dashboard", "label": "数据展示", "path": "internet_dashboard.html", "description": "17 个主题看板 + 角色切换"},
            {"id": "methodology", "label": "分析方法论", "path": "pages/methodology.html", "description": "六层分析框架 · OTT 场景 · 第六层工具箱"},
            {"id": "architecture", "label": "数仓架构", "path": "pages/architecture.html", "description": "OTT 雪花模型 · 数据字典"},
            {"id": "report", "label": "导出 PDF", "path": "pdf/report.html", "description": "P0-P3 完整报告（17 看板）"},
        ],
        "docs_playbook": None,
        "docs_toolbox": None,
        "local_playbook": ROOT / "industries" / "internet" / "js" / "methodology-playbook-data.js",
        "local_toolbox": None,
        "config_dir": ROOT / "industries" / "internet" / "config",
        "schema_version": "2.1",
    },
}


def _node_json(script: str) -> str:
    for cmd in ("node", r"D:\tools\nodejs\node.exe"):
        try:
            return subprocess.check_output([cmd, "-e", script], text=True, encoding="utf-8")
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    raise RuntimeError("未找到可用的 Node.js，请安装 node 或配置 PATH")


def load_analysis_toolbox(js_path: Path) -> dict:
    script = f"""
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync({json.dumps(str(js_path.resolve()))}, 'utf8');
const ctx = {{ window: {{}} }};
vm.runInNewContext(code, ctx);
process.stdout.write(JSON.stringify(ctx.window.ANALYSIS_TOOLBOX || null));
"""
    raw = _node_json(script)
    data = json.loads(raw)
    return data or {}


def load_methodology_data(js_path: Path) -> tuple[list, list, dict]:
    """从 methodology-playbook-data.js 读取 LAYERS / PLAYBOOKS / ANALYSIS_TOOLBOX。"""
    script = f"""
const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync({json.dumps(str(js_path.resolve()))}, 'utf8');
const ctx = {{ window: {{}} }};
vm.runInNewContext(code, ctx);
process.stdout.write(JSON.stringify({{
  layers: ctx.window.LAYERS || [],
  playbooks: ctx.window.PLAYBOOKS || [],
  toolbox: ctx.window.ANALYSIS_TOOLBOX || null,
}}));
"""
    data = json.loads(_node_json(script))
    return data.get("layers", []), data.get("playbooks", []), data.get("toolbox") or {}


def strip_chart_data(toolbox: dict) -> dict:
    out = {
        "layerTitle": toolbox.get("layerTitle"),
        "layerQuestion": toolbox.get("layerQuestion"),
        "opening": toolbox.get("opening"),
        "intro": toolbox.get("intro"),
        "categories": [],
    }
    for cat in toolbox.get("categories", []):
        methods = []
        for m in cat.get("methods", []):
            methods.append({k: v for k, v in m.items() if k != "data"})
        out["categories"].append({
            "id": cat.get("id"),
            "name": cat.get("name"),
            "tagline": cat.get("tagline"),
            "methods": methods,
        })
    return out


def toolbox_to_layer6(toolbox: dict) -> tuple[dict, list]:
    categories = [cat.get("name", "") for cat in toolbox.get("categories", [])]
    layer_meta = {
        "id": "l6",
        "name": "分析方法工具箱",
        "short": "第六层",
        "question": toolbox.get("layerQuestion", "用什么手法？"),
        "color": "#f472b6",
        "categories": categories,
    }
    methods = []
    for cat in toolbox.get("categories", []):
        for m in cat.get("methods", []):
            methods.append({
                "id": m.get("id"),
                "layer": "l6",
                "category": cat.get("name", ""),
                "title": m.get("title"),
                "aliases": m.get("aliases", ""),
                "desc": m.get("explain", ""),
                "bizQuestion": m.get("businessQuestion", ""),
                "portfolio": m.get("portfolio", ""),
            })
    toolbox_section = {
        "layer": layer_meta,
        "opening": toolbox.get("opening", ""),
        "intro": toolbox.get("intro", ""),
        "methods": methods,
        "method_count": len(methods),
    }
    return layer_meta, toolbox_section


def build_dashboards(dashboards_cfg: dict, roles_cfg: dict, meta: dict) -> list:
    role_map: dict[str, list[str]] = {}
    for role_id, role in roles_cfg.get("roles", {}).items():
        for did in role.get("dashboards", []):
            role_map.setdefault(did, []).append(role.get("label", role_id))

    dashboards = []
    for d in dashboards_cfg.get("dashboards", []):
        dashboards.append({
            "id": d["id"],
            "title": d["title"],
            "icon": d.get("icon", ""),
            "roles": role_map.get(d["id"], []),
            "core_content": d.get("description", ""),
            "api": d.get("api", ""),
            "filters": d.get("filters", []),
            "file": d.get("file", ""),
        })

    dashboards.append({
        "id": "report-export",
        "title": "报告导出（P0-P3）",
        "icon": "📄",
        "roles": list({lab for labs in role_map.values() for lab in labs})[:6] or ["管理层"],
        "core_content": meta["report_core_content"],
        "api": None,
        "filters": [],
        "file": meta["report_file"],
    })
    return dashboards


def build_navigation(meta: dict) -> dict:
    return {
        "platform_entry": {
            "label": "多行业平台入口",
            "path": "/index.html",
        },
        f"{meta['industry_code']}_tabs": meta["nav_tabs"],
        "methodology_sidebar_layers": ["l1", "l2", "l3", "l4", "l5"],
        "global_search": True,
    }


def build_industry(meta: dict) -> dict:
    return {
        "industry_code": meta["industry_code"],
        "industry_name": meta["industry_name"],
        "database_name": meta["database_name"],
        "metadata_database": "portfolio_metadata",
        "folder_path": meta["folder_path"],
        "entry_file": meta["entry_file"],
        "company_name": meta.get("company_name", ""),
        "status": "active",
        "warehouse_models": meta.get("warehouse_models", []),
        "api_ports": meta.get("api_ports", {}),
    }


def resolve_playbook_toolbox(meta: dict) -> tuple[list, list, dict]:
    playbook_js = meta.get("docs_playbook")
    if not playbook_js or not Path(playbook_js).exists():
        playbook_js = meta["local_playbook"]
    layers, playbooks, toolbox_from_playbook = load_methodology_data(Path(playbook_js))

    toolbox_raw = toolbox_from_playbook
    toolbox_js = meta.get("docs_toolbox") or meta.get("local_toolbox")
    if toolbox_js and Path(toolbox_js).exists():
        toolbox_raw = load_analysis_toolbox(Path(toolbox_js)) or toolbox_raw
    if not toolbox_raw:
        toolbox_raw = {"categories": [], "layerQuestion": "用什么手法？"}
    return layers, playbooks, toolbox_raw


def build_config(industry: str) -> dict:
    meta = INDUSTRY_META[industry]
    layers, playbooks, toolbox_raw = resolve_playbook_toolbox(meta)
    toolbox_clean = strip_chart_data(toolbox_raw)
    layer6_meta, layer6_toolbox = toolbox_to_layer6(toolbox_clean)
    all_layers = layers + [layer6_meta]

    cfg_dir = meta["config_dir"]
    dashboards_cfg = json.loads((cfg_dir / "dashboards.json").read_text(encoding="utf-8"))
    roles_cfg = json.loads((cfg_dir / "roles.json").read_text(encoding="utf-8"))
    dashboards = build_dashboards(dashboards_cfg, roles_cfg, meta)
    theme_count = len(dashboards_cfg.get("dashboards", []))

    return {
        "schema_version": meta["schema_version"],
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "industry": build_industry(meta),
        "navigation": build_navigation(meta),
        "dashboards": dashboards,
        "source_dashboards_version": dashboards_cfg.get("version"),
        "analysis_framework": {
            "layers": all_layers,
            "layers_l1_to_l5": layers,
            "layer6_toolbox": layer6_toolbox,
            "playbooks": playbooks,
            "playbook_count": len(playbooks),
            "sidebar_note": "左侧导航展示六层框架（l1-l5 问题列表 + l6 工具箱入口）",
        },
        "statistics": {
            "dashboard_count": len(dashboards),
            "theme_dashboard_count": theme_count,
            "playbook_count": len(playbooks),
            "toolbox_method_count": layer6_toolbox["method_count"],
            "analysis_layers": 6,
        },
    }


def sql_escape_json(obj: dict) -> str:
    return json.dumps(obj, ensure_ascii=False).replace("\\", "\\\\").replace("'", "''")


def write_insert_sql(industry: str, version: str, notes: str, config: dict) -> Path:
    SQL_DIR.mkdir(parents=True, exist_ok=True)
    payload = sql_escape_json(config)
    code = industry
    sql = f"""-- 作品集配置快照 · {code} · {version}
-- 生成: python scripts/export_portfolio_config.py --industry {code} --version {version}
-- 前置: version_history 表需含 config_json 列（见 09_alter_version_history_config.sql）

USE portfolio_metadata;

UPDATE version_history vh
INNER JOIN industry_catalog ic ON ic.industry_id = vh.industry_id
SET vh.status = 'stable'
WHERE ic.industry_code = '{code}' AND vh.status = 'active' AND vh.version_tag <> '{version}';

INSERT INTO version_history (
    industry_id, version_tag, release_notes, status, config_json
)
SELECT
    ic.industry_id,
    '{version}',
    '{notes}',
    'active',
    CAST('{payload}' AS JSON)
FROM industry_catalog ic
WHERE ic.industry_code = '{code}'
ON DUPLICATE KEY UPDATE
    release_notes = VALUES(release_notes),
    status = VALUES(status),
    config_json = VALUES(config_json),
    created_at = CURRENT_TIMESTAMP;

UPDATE industry_catalog
SET current_version = '{version}', updated_at = CURRENT_TIMESTAMP
WHERE industry_code = '{code}';

INSERT INTO change_log (industry_id, component_type, component_name, change_type, new_value, change_reason)
SELECT ic.industry_id, 'config', 'portfolio_snapshot', 'modify', '{version}', '{notes}'
FROM industry_catalog ic WHERE ic.industry_code = '{code}';
"""
    suffix = "" if code == "retail" else f"_{code}"
    path = SQL_DIR / f"insert_version{suffix}_{version.replace('.', '_')}.sql"
    path.write_text(sql, encoding="utf-8")
    return path


def apply_to_db(industry: str, version: str, notes: str, config: dict) -> None:
    import os
    import sys

    import pymysql

    payload = json.dumps(config, ensure_ascii=False)
    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "123456"),
        database="portfolio_metadata",
        charset="utf8mb4",
        autocommit=False,
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SHOW COLUMNS FROM version_history LIKE 'config_json'")
            if not cur.fetchone():
                cur.execute(
                    "ALTER TABLE version_history "
                    "ADD COLUMN config_json JSON NULL COMMENT '版本配置快照' AFTER release_notes"
                )
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
                "UPDATE industry_catalog SET current_version = %s, updated_at = CURRENT_TIMESTAMP WHERE industry_code = %s",
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
                SELECT vh.version_tag, vh.status, CHAR_LENGTH(vh.config_json) AS json_len, ic.current_version
                FROM version_history vh
                JOIN industry_catalog ic ON ic.industry_id = vh.industry_id
                WHERE ic.industry_code = %s AND vh.version_tag = %s
                """,
                (industry, version),
            )
            print(f"DB[{industry}]:", cur.fetchone())
        conn.commit()
        print(f"portfolio_metadata 已写入 {industry} {version}")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def export_one(industry: str, version: str, notes: str, apply_db: bool) -> dict:
    config = build_config(industry)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = "" if industry == "retail" else f"_{industry}"
    json_path = OUT_DIR / f"portfolio_config{suffix}_{version}.json"
    json_path.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding="utf-8")
    sql_path = write_insert_sql(industry, version, notes, config)

    stats = config["statistics"]
    print(f"[{industry}] Config: {json_path} ({len(json.dumps(config))} bytes)")
    print(f"[{industry}] SQL:    {sql_path}")
    print(
        f"[{industry}] Stats:  dashboards={stats['dashboard_count']} "
        f"(theme={stats['theme_dashboard_count']}) "
        f"playbooks={stats['playbook_count']} toolbox={stats['toolbox_method_count']}"
    )
    expected_theme = INDUSTRY_META[industry]["theme_dashboard_count"]
    if stats["theme_dashboard_count"] != expected_theme:
        print(
            f"[{industry}] WARN: theme_dashboard_count={stats['theme_dashboard_count']} "
            f"expected={expected_theme}",
            file=__import__("sys").stderr,
        )
    if apply_db:
        apply_to_db(industry, version, notes, config)
    return config


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--industry", default="retail",
                        choices=["retail", "manufacturing", "internet", "all"])
    parser.add_argument("--version", default=None,
                        help="版本号；all 时可省略，将使用各行业默认递增版本")
    parser.add_argument("--notes", default="作品集配置快照")
    parser.add_argument("--apply-db", action="store_true", help="生成后写入 portfolio_metadata 库")
    parser.add_argument("--mfg-version", default="v1.2")
    parser.add_argument("--inet-version", default="v2.1")
    parser.add_argument("--retail-version", default="v3.2")
    args = parser.parse_args()

    default_versions = {
        "retail": args.retail_version,
        "manufacturing": args.mfg_version,
        "internet": args.inet_version,
    }

    industries = list(INDUSTRY_META) if args.industry == "all" else [args.industry]
    for ind in industries:
        ver = args.version if (args.version and args.industry != "all") else default_versions[ind]
        if args.industry == "all" and args.version:
            # 允许 all + 统一 version（较少用）；否则按行业默认
            ver = default_versions[ind] if not args.version else (
                args.version if ind == "retail" else default_versions[ind]
            )
            if args.version and ind != "retail":
                ver = default_versions[ind]
        export_one(ind, ver, args.notes, args.apply_db)


if __name__ == "__main__":
    main()
