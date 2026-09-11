# -*- coding: utf-8 -*-
from pathlib import Path
h = Path(__file__).resolve().parent.parent.joinpath("数据知识图谱.html").read_text(encoding="utf-8")
checks = [
    "bi-what-is",
    "bi-funnel-metric",
    "bi-lod-grain",
    "bi-tool-tableau",
    "bi-scene-growth",
    "bi-rls",
    "bi-storytelling",
    "bi-materialize",
    "bi-tool-fine",
]
print({c: (c in h) for c in checks})
print("bi- id count", h.count('"id": "bi-'))
