# -*- coding: utf-8 -*-
"""DQ: add DEFAULT -1 to dim/fact surrogate keys lacking default (retail kimball)."""
from pathlib import Path
import re

dim = Path(__file__).resolve().parents[1] / "industries/retail/database/kimball_design/02_dim.sql"
text = dim.read_text(encoding="utf-8")

def fix_sk(m):
    col, mid, rest = m.group(1), m.group(2), m.group(3)
    if "DEFAULT" in mid.upper() or "DEFAULT" in rest.upper()[:40]:
        return m.group(0)
    return f"{col}{mid}DEFAULT -1 {rest}"

text2 = re.sub(
    r"(\w+_sk\s+BIGINT\s+NOT NULL\s+)(?!DEFAULT)(COMMENT)",
    r"\1DEFAULT -1 \2",
    text,
)
dim.write_text(text2, encoding="utf-8")
print("fixed", dim)

# internet money types
inet = Path(__file__).resolve().parents[1] / "industries/internet/database/01_ddl.sql"
it = inet.read_text(encoding="utf-8")
# amount-like columns should be DECIMAL(15,2); leave rates/seconds as-is
replacements = [
    ("pay_amount          DECIMAL(12,2)", "pay_amount          DECIMAL(15,2)"),
    ("budget_amount       DECIMAL(14,2)", "budget_amount       DECIMAL(15,2)"),
    ("total_pay_amount    DECIMAL(14,2)", "total_pay_amount    DECIMAL(15,2)"),
    ("pay_amount          DECIMAL(14,2)", "pay_amount          DECIMAL(15,2)"),
    ("spend_amount        DECIMAL(14,2)", "spend_amount        DECIMAL(15,2)"),
    ("cac                 DECIMAL(12,2)", "cac                 DECIMAL(15,2)"),
]
for a, b in replacements:
    it = it.replace(a, b)
# nullable cac -> default 0
it = it.replace(
    "cac                 DECIMAL(15,2) COMMENT '获客成本'",
    "cac                 DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT '获客成本'",
)
inet.write_text(it, encoding="utf-8")
print("fixed internet amounts")
