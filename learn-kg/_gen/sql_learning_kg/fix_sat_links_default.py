# -*- coding: utf-8 -*-
from pathlib import Path

targets = [
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

old_css = """    /* 焦点下钻：子节点连线默认隐藏，开启 .kg-sat-links-on 后显示 */
    body.kg-focus-on:not(.kg-sat-links-on) .sat-links,
    body.kg-focus-on:not(.kg-sat-links-on) .sat-sparks {
      display: none !important;
    }"""

new_css = """    /* 焦点下钻：子节点连线默认显示；关闭「连线」时去掉 .kg-sat-links-on 后隐藏 */
    body.kg-focus-on:not(.kg-sat-links-on) .sat-links,
    body.kg-focus-on:not(.kg-sat-links-on) .sat-sparks {
      display: none !important;
    }"""

old_btn = (
    '<button type="button" id="kgSatLinks" title="显示子节点连线" '
    'aria-pressed="false" aria-label="子节点连线">连线</button>'
)
new_btn = (
    '<button type="button" id="kgSatLinks" class="active" title="隐藏子节点连线" '
    'aria-pressed="true" aria-label="子节点连线">连线</button>'
)

old_js_tail = (
    "      let on = false;\n"
    '      try { on = localStorage.getItem(KEY) === "1"; } catch (_) {}\n'
    "      apply(on, false);"
)
new_js_tail = (
    "      let on = true;\n"
    "      try {\n"
    "        const v = localStorage.getItem(KEY);\n"
    '        if (v === "0") on = false;\n'
    '        else if (v === "1") on = true;\n'
    "      } catch (_) {}\n"
    "      apply(on, false);"
)

for p in targets:
    t = p.read_text(encoding="utf-8")
    n = 0
    if old_css in t:
        t = t.replace(old_css, new_css)
        n += 1
    elif "子节点连线默认隐藏，开启" in t:
        t = t.replace(
            "焦点下钻：子节点连线默认隐藏，开启 .kg-sat-links-on 后显示",
            "焦点下钻：子节点连线默认显示；关闭「连线」时去掉 .kg-sat-links-on 后隐藏",
        )
        n += 1
    if old_btn in t:
        t = t.replace(old_btn, new_btn)
        n += 1
    if old_js_tail in t:
        t = t.replace(old_js_tail, new_js_tail)
        n += 1
    if "子节点连线：默认隐藏" in t:
        t = t.replace("子节点连线：默认隐藏", "子节点连线：默认显示")
        n += 1
    p.write_text(t, encoding="utf-8")
    print(
        p.name,
        "n",
        n,
        "on=true",
        "let on = true" in t,
        "btn.active",
        'id="kgSatLinks" class="active"' in t,
    )
