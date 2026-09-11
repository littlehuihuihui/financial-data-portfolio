# -*- coding: utf-8 -*-
"""Home hero: only SQL on first screen; click expands L1 + L2 together."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

# --- CSS ---
CSS = r'''
    /* 首屏：只保留一个课程大节点 */
    body.home-hero:not(.kg-focus-on) .link,
    body.home-hero:not(.kg-focus-on) .stages,
    body.home-hero:not(.kg-focus-on) .stage-band,
    body.home-hero:not(.kg-focus-on) .stage-label,
    body.home-hero:not(.kg-focus-on) .lane-label {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    body.home-hero:not(.kg-focus-on) .node:not(.home-hero-node) {
      opacity: 0 !important;
      pointer-events: none !important;
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node circle {
      stroke: #e9d5ff;
      stroke-width: 4;
      fill: #a855f7 !important;
      filter: drop-shadow(0 0 32px rgba(168, 85, 247, 0.85));
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node text {
      font-size: 18px !important;
      fill: #fff;
    }
    body.home-hero:not(.kg-focus-on) .node.home-hero-node .sublabel {
      font-size: 12px !important;
      fill: #c4b5fd;
      opacity: 1 !important;
    }
    body.home-hero:not(.kg-focus-on) .toolbar { opacity: 0.35; }
'''

if "body.home-hero:not(.kg-focus-on) .node.home-hero-node" not in text:
    style_end = text.find("  </style>\n</head>")
    text = text[:style_end] + CSS + "\n  " + text[style_end:]
    print("home-hero CSS ok")
else:
    print("home-hero CSS exists")

# hint text
text = text.replace(
    '<div class="hint">点击课程节点进入焦点舞台 · 三扇区辐射 · 章节导读 / 叶节点讲义</div>',
    '<div class="hint">点击 SQL 大节点 → 展开一级领域 + 二级主题 · 再点主题学讲义</div>',
    1,
)

# --- JS constants after CATEGORIES ---
if "const HOME_HUB_ID" not in text:
    text = text.replace(
        """    const CATEGORIES = {
      storage: { label: "STORAGE 存储", color: "#4da3ff" },
      process: { label: "PROCESS 加工", color: "#f59e0b" },
      analyze: { label: "ANALYZE 分析", color: "#34d399" },
      govern:  { label: "GOVERN 治理",  color: "#a78bfa" },
      intel:   { label: "INTEL 智能",   color: "#fb7185" }
    };""",
        """    const CATEGORIES = {
      storage: { label: "STORAGE 存储", color: "#4da3ff" },
      process: { label: "PROCESS 加工", color: "#f59e0b" },
      analyze: { label: "ANALYZE 分析", color: "#34d399" },
      govern:  { label: "GOVERN 治理",  color: "#a78bfa" },
      intel:   { label: "INTEL 智能",   color: "#fb7185" }
    };

    /** 首屏只展示一个课程入口；点击后展开其一级 + 二级 */
    const HOME_HUB_ID = "sql";
    const HOME_HERO_ONLY = true;""",
        1,
    )
    print("HOME_HUB_ID ok")

# --- placeNodes hero centering ---
OLD_PLACE = '''    function placeNodes() {
      const m = layoutMetrics();
      nodes.forEach(n => {
        const L = LAYOUT[n.id] || { col: 0, row: 0 };
        const x = m.padX + (L.col + 0.5) * m.colW;
        let y;
        if (L.row >= 2) {
          y = m.padTop + m.mainH + m.govBand * 0.55;
        } else if (L.row === 0.5) {
          y = m.padTop + m.mainH * 0.48;
        } else {
          const t = Math.min(1.15, Math.max(0, L.row)) / 1.15;
          y = m.padTop + m.mainH * (0.22 + t * 0.56);
        }
        n.x = x; n.y = y; n.fx = x; n.fy = y;
      });
      return m;
    }'''

NEW_PLACE = '''    function placeNodes() {
      const m = layoutMetrics();
      if (HOME_HERO_ONLY && !(kgDrill && kgDrill.active)) {
        const cx = (typeof width === "function" ? width() : m.w) / 2;
        const cy = (typeof height === "function" ? height() : m.h) / 2;
        nodes.forEach(n => {
          if (n.id === HOME_HUB_ID) {
            n.x = n.fx = cx;
            n.y = n.fy = cy;
          } else {
            n.x = n.fx = -4000;
            n.y = n.fy = -4000;
          }
        });
        return m;
      }
      nodes.forEach(n => {
        const L = LAYOUT[n.id] || { col: 0, row: 0 };
        const x = m.padX + (L.col + 0.5) * m.colW;
        let y;
        if (L.row >= 2) {
          y = m.padTop + m.mainH + m.govBand * 0.55;
        } else if (L.row === 0.5) {
          y = m.padTop + m.mainH * 0.48;
        } else {
          const t = Math.min(1.15, Math.max(0, L.row)) / 1.15;
          y = m.padTop + m.mainH * (0.22 + t * 0.56);
        }
        n.x = x; n.y = y; n.fx = x; n.fy = y;
      });
      return m;
    }'''

if "HOME_HERO_ONLY && !(kgDrill && kgDrill.active)" not in text:
    if OLD_PLACE not in text:
        raise SystemExit("placeNodes block missing")
    text = text.replace(OLD_PLACE, NEW_PLACE, 1)
    print("placeNodes hero ok")

# --- after node creation: class + body class + size ---
OLD_NODE_APPEND = '''    node.append("circle").attr("r", d => d.catalog ? 32 : 26)
      .attr("fill", d => CATEGORIES[d.category].color)
      .attr("filter", "url(#node-glow)");
    node.append("text")
      .style("font-size", d => d.catalog ? "12px" : "11px")
      .text(d => shortLabel(d.name));
    node.append("text").attr("class", "learned-mark").attr("dx", 22).attr("dy", -22)
      .text(d => isLearned(d.id) ? "✓" : "");
    node.append("text").attr("class", "sublabel").attr("dy", 40)
      .text(d => d.catalog ? "点击展开" : (d.name.length > 5 ? d.name : ""));'''

NEW_NODE_APPEND = '''    node.classed("home-hero-node", d => d.id === HOME_HUB_ID);
    node.append("circle").attr("r", d => {
        if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return 78;
        return d.catalog ? 32 : 26;
      })
      .attr("fill", d => CATEGORIES[d.category].color)
      .attr("filter", "url(#node-glow)");
    node.append("text")
      .style("font-size", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? "18px" : (d.catalog ? "12px" : "11px"))
      .text(d => shortLabel(d.name));
    node.append("text").attr("class", "learned-mark").attr("dx", 22).attr("dy", -22)
      .text(d => isLearned(d.id) ? "✓" : "");
    node.append("text").attr("class", "sublabel").attr("dy", d => (HOME_HERO_ONLY && d.id === HOME_HUB_ID) ? 56 : 40)
      .text(d => {
        if (HOME_HERO_ONLY && d.id === HOME_HUB_ID) return "点击展开一级 + 二级";
        if (KG_TREES && KG_TREES[d.id]) return "点击学教程";
        return d.catalog ? "点击展开" : (d.name.length > 5 ? d.name : "");
      });
    if (HOME_HERO_ONLY) document.body.classList.add("home-hero");'''

# KG_TREES may not exist yet at this point in the file - node append is BEFORE KG_TREES definition!
# Looking at file order: nodes drawn at 8820, KG_TREES is later around SQL tree... Actually KG_TREES is defined BEFORE placeNodes? 
# From earlier: SQL trees are embedded in script before the graph code. Let me check order.
# nodes = [...] early, then later JUMP, then SQL_KNOWLEDGE_TREE, KG_TREES, then placeNodes.
# So at node.append time KG_TREES exists. Good.

if 'classed("home-hero-node"' not in text:
    if OLD_NODE_APPEND not in text:
        raise SystemExit("node append block missing")
    text = text.replace(OLD_NODE_APPEND, NEW_NODE_APPEND, 1)
    print("node hero chrome ok")
else:
    print("node hero exists")

# --- enterKgDrill: expandAllL2 ---
OLD_ENTER = '''          kgDrill = {
            active: true,
            hubId,
            revealed: true,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: { x: hub.x, y: hub.y }
          };
          kgFocusHistory = [];'''

NEW_ENTER = '''          kgDrill = {
            active: true,
            hubId,
            revealed: true,
            expandAllL2: true,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: { x: hub.x, y: hub.y }
          };
          kgFocusHistory = [];
          document.body.classList.remove("home-hero");'''

if "expandAllL2: true" not in text:
    if OLD_ENTER not in text:
        raise SystemExit("enterKgDrill state missing")
    text = text.replace(OLD_ENTER, NEW_ENTER, 1)
    print("enter expandAllL2 ok")

# exitKgDrill restore home-hero + expandAllL2 null
OLD_EXIT_STATE = '''          kgDrill = {
            active: false,
            hubId: null,
            revealed: false,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: null
          };
          document.body.classList.remove("kg-focus-on");'''

NEW_EXIT_STATE = '''          kgDrill = {
            active: false,
            hubId: null,
            revealed: false,
            expandAllL2: false,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: null
          };
          document.body.classList.remove("kg-focus-on");
          if (HOME_HERO_ONLY) document.body.classList.add("home-hero");'''

if "expandAllL2: false" not in text:
    if OLD_EXIT_STATE not in text:
        raise SystemExit("exitKgDrill state missing")
    text = text.replace(OLD_EXIT_STATE, NEW_EXIT_STATE, 1)
    print("exit restore home-hero ok")

# initial kgDrill state may need expandAllL2 - the early let kgDrill
text = text.replace(
    """    let kgDrill = {
      active: false,
      hubId: null,
      revealed: false,
      expandedL2: null,
      expandedL3: null,
      selectedLeafId: null,
      panelMode: null,
      savedPos: null
    };""",
    """    let kgDrill = {
      active: false,
      hubId: null,
      revealed: false,
      expandAllL2: false,
      expandedL2: null,
      expandedL3: null,
      selectedLeafId: null,
      panelMode: null,
      savedPos: null
    };""",
    1,
)

# --- redrawKgDrill: show L3 for all L2 when expandAllL2 ---
OLD_EXPAND = '''                const expanded = kgDrill.expandedL2 === c.id;
                const leaf = !rawKids.length;
                const chapter = isLessonParent(c);
                items.push({
                  learnId: "kg:" + kgDrill.hubId + ":" + c.id,
                  kgId: c.id,
                  name: c.title,
                  x: placed.x,
                  y: placed.y,
                  parentX: hub.x,
                  parentY: hub.y,
                  layer: 2,
                  ang: placed.ang,
                  r: placed.r,
                  sibIdx: i,
                  sibTotal: n,
                  isLeaf: leaf,
                  isChapter: chapter && !leaf,
                  isBranch: canExpand && expanded,
                  color: leaf ? "#34d399" : (expanded ? "#f59e0b" : sec.color),
                  sectorKey: key,
                  sectorGlow: sec.glow
                });
                if (kgDrill.expandedL2 === c.id && canExpand) {
                  const l3s = filterKgChildren(c.children || []);
                  l3s.forEach((c3, j) => {
                    const p3 = pushFan(c3, placed.x, placed.y, 3, 108, j, l3s.length, placed.ang, sec.color, key, sec.glow);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      l4s.forEach((c4, k) => {
                        pushFan(c4, p3.x, p3.y, 4, 82, k, l4s.length, p3.ang, sec.color, key, sec.glow);
                      });
                    }
                  });
                }'''

NEW_EXPAND = '''                const expanded = kgDrill.expandAllL2 || kgDrill.expandedL2 === c.id;
                const leaf = !rawKids.length;
                const chapter = isLessonParent(c);
                items.push({
                  learnId: "kg:" + kgDrill.hubId + ":" + c.id,
                  kgId: c.id,
                  name: c.title,
                  x: placed.x,
                  y: placed.y,
                  parentX: hub.x,
                  parentY: hub.y,
                  layer: 2,
                  ang: placed.ang,
                  r: placed.r,
                  sibIdx: i,
                  sibTotal: n,
                  isLeaf: leaf,
                  isChapter: chapter && !leaf,
                  isBranch: canExpand && expanded,
                  color: leaf ? "#34d399" : (expanded ? "#f59e0b" : sec.color),
                  sectorKey: key,
                  sectorGlow: sec.glow
                });
                // 一级领域展开后立刻带出二级主题（expandAllL2 或单选 expandedL2）
                if (expanded && canExpand) {
                  const l3s = filterKgChildren(c.children || []);
                  l3s.forEach((c3, j) => {
                    const p3 = pushFan(c3, placed.x, placed.y, 3, 108, j, l3s.length, placed.ang, sec.color, key, sec.glow);
                    if (kgDrill.expandedL3 === c3.id && p3.hasKids) {
                      const l4s = filterKgChildren(c3.children || []);
                      l4s.forEach((c4, k) => {
                        pushFan(c4, p3.x, p3.y, 4, 82, k, l4s.length, p3.ang, sec.color, key, sec.glow);
                      });
                    }
                  });
                }'''

if "kgDrill.expandAllL2 || kgDrill.expandedL2 === c.id" not in text:
    if OLD_EXPAND not in text:
        raise SystemExit("expand L2 block missing")
    text = text.replace(OLD_EXPAND, NEW_EXPAND, 1)
    print("redraw expandAllL2 ok")

# --- onKgDrillClick layer 2: when expandAllL2, clicking L2 shouldn't collapse all — select/focus that branch for L3 leaves ---
OLD_L2_CLICK = '''          if (sat.layer === 2) {
            if (kgDrill.expandedL2 === kg.id) {
              // 已展开：若是章节父级，再次点击打开/刷新导读；否则收起
              if (isLessonParent(kg)) {
                kgDrill.selectedLeafId = kg.id;
                redrawKgDrill();
                openKgSidePanel(kg, "chapter");
                return;
              }
              kgDrill.expandedL2 = null;
              kgDrill.expandedL3 = null;
              kgDrill.selectedLeafId = null;
              closePanelSoft();
              redrawKgDrill();
              return;
            }
            kgDrill.expandedL2 = kg.id;
            kgDrill.expandedL3 = null;
            if (isLessonParent(kg)) {
              kgDrill.selectedLeafId = kg.id;
              redrawKgDrill();
              openKgSidePanel(kg, "chapter");
            } else {
              kgDrill.selectedLeafId = null;
              closePanelSoft();
              redrawKgDrill();
            }
            return;
          }'''

NEW_L2_CLICK = '''          if (sat.layer === 2) {
            // 一级领域：保持全部二级可见；点领域可打开章节导读或聚焦该支
            kgDrill.expandedL2 = kg.id;
            kgDrill.expandedL3 = null;
            if (isLessonParent(kg)) {
              kgDrill.selectedLeafId = kg.id;
              redrawKgDrill();
              openKgSidePanel(kg, "chapter");
            } else {
              // 非章节父：仅聚焦，二级主题已由 expandAllL2 展示
              kgDrill.selectedLeafId = null;
              closePanelSoft();
              redrawKgDrill();
            }
            return;
          }'''

if "保持全部二级可见" not in text:
    if OLD_L2_CLICK not in text:
        print("WARN: L2 click block not exact — trying softer match")
    else:
        text = text.replace(OLD_L2_CLICK, NEW_L2_CLICK, 1)
        print("L2 click ok")

# syncKgHubSize for home hero radius when not in focus
OLD_SYNC = '''          node.select("circle").attr("r", d => {
            if (kgDrill.active && d.id === kgDrill.hubId) return 62;
            if (KG_TREES[d.id] || d.catalog) return 32;
            return 26;
          });'''

NEW_SYNC = '''          node.select("circle").attr("r", d => {
            if (kgDrill.active && d.id === kgDrill.hubId) return 62;
            if (HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID) return 78;
            if (KG_TREES[d.id] || d.catalog) return 32;
            return 26;
          });'''

if "HOME_HERO_ONLY && !kgDrill.active && d.id === HOME_HUB_ID" not in text:
    if OLD_SYNC in text:
        text = text.replace(OLD_SYNC, NEW_SYNC, 1)
        print("syncKgHubSize hero r ok")

# hint in focus chrome
text = text.replace(
    "else hintEl.textContent = \"三扇区已展开 · 点主题下钻 · 点路径面包屑回退\";",
    "else hintEl.textContent = \"一级领域 + 二级主题已展开 · 点二级学讲义 · 路径可回退\";",
    1,
)

# brand subtitle
text = text.replace(
    "<span>数据知识图谱 · 流水线分层 · 目录引擎对比 · 深度下钻</span>",
    "<span>数据学习教程 · 点击 SQL 展开知识树</span>",
    1,
)

# after exit, relayout to recenter hero
if "if (HOME_HERO_ONLY) document.body.classList.add(\"home-hero\");" in text:
    text = text.replace(
        """          if (HOME_HERO_ONLY) document.body.classList.add("home-hero");
          if (typeof node !== "undefined" && node) {
            node.classed("kg-focus-hub", false);
            node.select("circle").style("filter", null);
          }
          closePanelSoft();
          updateKgDrillHint();
          syncKgHubSize();
          if (typeof tick === "function") tick();
        }""",
        """          if (HOME_HERO_ONLY) document.body.classList.add("home-hero");
          if (typeof node !== "undefined" && node) {
            node.classed("kg-focus-hub", false);
            node.select("circle").style("filter", null);
          }
          closePanelSoft();
          updateKgDrillHint();
          syncKgHubSize();
          if (typeof relayout === "function") relayout();
          else if (typeof tick === "function") tick();
        }""",
        1,
    )
    print("exit relayout ok")

HTML.write_text(text, encoding="utf-8")
print("done", HTML.stat().st_size)
