# -*- coding: utf-8 -*-
"""DWH/ETL teaching extras: leaf_id -> gold markdown; apply_extras walker."""
from __future__ import annotations

from typing import Any, Dict, MutableMapping

from dwh_etl_teach_extras_dwh import DWH_EXTRA
from dwh_etl_teach_extras_etl import ETL_EXTRA

__all__ = ["DWH_EXTRA", "ETL_EXTRA", "apply_extras"]


def apply_extras(tree: MutableMapping[str, Any], extra_dict: Dict[str, str]) -> int:
    """Walk knowledge tree; replace leaf content when node id is in extra_dict.

    Returns number of nodes updated.
    """
    updated = 0

    def walk(node: MutableMapping[str, Any]) -> None:
        nonlocal updated
        nid = node.get("id")
        if isinstance(nid, str) and nid in extra_dict:
            node["content"] = extra_dict[nid]
            updated += 1
        for child in node.get("children") or []:
            if isinstance(child, dict):
                walk(child)

    walk(tree)
    return updated
