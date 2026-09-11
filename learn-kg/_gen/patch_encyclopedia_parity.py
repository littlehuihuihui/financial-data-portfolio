# -*- coding: utf-8 -*-
"""Patch DATA NEXUS toward encyclopedia look: tri-sector, left chrome, collide settle."""
from pathlib import Path

HTML = Path(r"D:\cursor\数据学习平台\数据学习平台\数据知识图谱.html")
text = HTML.read_text(encoding="utf-8")

CSS = r"""
    /* 焦点左栏（对齐行业百科双栏仪器台的左侧迷你壳） */
    .kg-focus-side {
      position: absolute; left: 14px; top: 58px; bottom: 72px;
      width: min(240px, 32vw); z-index: 8;
      display: none; flex-direction: column; gap: 12px;
      padding: 14px 14px 16px;
      border-radius: 14px;
      border: 1px solid rgba(168, 85, 247, 0.28);
      background: rgba(10, 14, 26, 0.88);
      backdrop-filter: blur(10px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
      overflow: auto;
      pointer-events: auto;
    }
    body.kg-focus-on .kg-focus-side { display: flex; }
    body.kg-focus-on .hint { opacity: 0; pointer-events: none; }
    body.kg-focus-on .toolbar {
      opacity: 1; pointer-events: auto;
      left: auto; right: 16px;
    }
    .kg-focus-side-head {
      display: flex; flex-direction: column; gap: 8px;
    }
    .kg-focus-side-head h3 {
      font-family: "Noto Sans SC", var(--font);
      font-size: 0.95rem; font-weight: 700; color: #f8fafc; margin: 0;
    }
    .kg-focus-side-head button,
    .kg-focus-side .kg-back-btn {
      font-family: var(--font-mono); font-size: 0.72rem;
      padding: 7px 10px; border-radius: 8px; cursor: pointer;
      border: 1px solid rgba(168, 85, 247, 0.45);
      background: rgba(168, 85, 247, 0.12); color: #e9d5ff;
      text-align: left;
    }
    .kg-focus-side-head button:hover { background: rgba(168, 85, 247, 0.22); }
    .kg-focus-legend {
      display: flex; flex-direction: column; gap: 8px;
      padding: 10px; border-radius: 10px;
      border: 1px dashed rgba(148, 163, 184, 0.25);
    }
    .kg-focus-legend-title {
      font-family: var(--font-mono); font-size: 0.68rem; color: #94a3b8;
      letter-spacing: 0.06em; text-transform: uppercase;
    }
    .kg-focus-leg-item {
      display: flex; align-items: center; gap: 8px;
      font-size: 0.82rem; color: #e2e8f0;
    }
    .kg-focus-leg-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 8px currentColor;
    }
    .kg-focus-path-label {
      font-family: var(--font-mono); font-size: 0.68rem; color: #94a3b8;
      margin-bottom: 6px; letter-spacing: 0.06em;
    }
    .kg-focus-path-body {
      font-family: "Noto Sans SC", var(--font);
      font-size: 0.82rem; line-height: 1.55; color: #f1f5f9;
      padding: 10px; border-radius: 10px;
      background: rgba(34, 211, 238, 0.06);
      border: 1px solid rgba(34, 211, 238, 0.18);
      min-height: 3.2em;
    }
    .kg-focus-side-hint {
      font-family: var(--font-mono); font-size: 0.68rem; color: #64748b;
      line-height: 1.45; margin: 0;
    }
    @media (max-width: 720px) {
      .kg-focus-side {
        left: 8px; right: 8px; width: auto; bottom: auto; top: 52px;
        max-height: 28vh;
      }
    }
"""

if ".kg-focus-side {" not in text:
    text = text.replace("    .lesson-card-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); }\n",
                        "    .lesson-card-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--muted); }\n" + CSS + "\n",
                        1)
    print("CSS inserted")
else:
    print("CSS already present")

SHELL = '''    <div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>
      <aside id="kgFocusSide" class="kg-focus-side" aria-label="焦点导航">
        <div class="kg-focus-side-head">
          <h3 id="kgFocusSideTitle">课程焦点</h3>
          <button type="button" class="kg-back-btn" id="btnKgFocusBack">← 返回总览</button>
        </div>
        <div class="kg-focus-legend" id="kgFocusLegend"></div>
        <div>
          <div class="kg-focus-path-label">探索路径</div>
          <div id="kgFocusPath" class="kg-focus-path-body">—</div>
        </div>
        <p class="kg-focus-side-hint" id="kgFocusSideHint">再点中心展开三扇区 · 弧线一对多下钻</p>
      </aside>
      <div class="toolbar" id="depthToolbar" role="group" aria-label="内容深度">'''

if 'id="kgFocusSide"' not in text:
    old = '''    <div id="graph" class="kg-canvas"><div class="kg-particles" id="kgParticles" aria-hidden="true"></div>
      <div class="toolbar" id="depthToolbar" role="group" aria-label="内容深度">'''
    if old not in text:
        raise SystemExit("graph shell anchor missing")
    text = text.replace(old, SHELL, 1)
    print("left chrome HTML inserted")
else:
    print("left chrome already present")

# --- Replace L2_SECTOR_COLORS + add sector system, rewrite redrawKgDrill placement ---
OLD_COLORS = '''    const L2_SECTOR_COLORS = ["#38bdf8", "#f59e0b", "#34d399", "#a78bfa", "#fb7185", "#4da3ff", "#fbbf24", "#22d3ee"];'''

NEW_SECTORS = '''    /* 三扇区（对齐行业百科：左上 / 右上 / 正下） */
    const KG_SECTORS = {
      foundation: { key: "foundation", label: "基础", color: "#f97316", glow: "rgba(249,115,22,0.55)", angDeg: 135 },
      advanced:   { key: "advanced",   label: "进阶", color: "#22c55e", glow: "rgba(34,197,94,0.5)",  angDeg: 45 },
      practice:   { key: "practice",   label: "实战", color: "#3b82f6", glow: "rgba(59,130,246,0.5)", angDeg: 270 }
    };
    const KG_SECTOR_ORDER = ["foundation", "advanced", "practice"];
    /** 已知领域显式扇区；其余按索引三等分或 level */
    const KG_SECTOR_BY_ID = {
      "sql-dml-query": "foundation", "sql-ddl": "foundation", "sql-join": "foundation",
      "sql-window": "advanced", "sql-cte": "advanced", "sql-index-plan": "advanced",
      "sql-tx-lock": "practice", "sql-txn": "practice", "sql-tune": "practice",
      "py-pandas": "foundation", "py-viz": "advanced",
      "etl-batch": "foundation", "etl-quality": "practice",
      "dwh-layer": "foundation", "dwh-model": "advanced",
      "bi-metric": "foundation", "bi-board": "advanced",
      "ml-tasks": "advanced", "ml-classify": "foundation", "ml-predict": "advanced",
      "ml-cluster": "advanced", "ml-recommend": "practice", "ml-anomaly": "practice"
    };
    let kgSettleTimer = null;'''

if "KG_SECTORS" not in text:
    if OLD_COLORS not in text:
        raise SystemExit("L2_SECTOR_COLORS not found")
    text = text.replace(OLD_COLORS, NEW_SECTORS, 1)
    print("sectors const inserted")
else:
    print("sectors already present")

# Replace from satArcPath through end of redrawKgDrill (before onKgDrillClick)
start = text.find("        /** 二次贝塞尔弧线（顺时针弯，模拟百科 curvedCW） */")
if start < 0:
    start = text.find("        function satArcPath(")
end = text.find("        function onKgDrillClick(sat)")
if start < 0 or end < 0:
    raise SystemExit(f"redraw block markers missing start={start} end={end}")

NEW_DRAW = r'''        /** 百科同款极角：y 轴向下时用 -sin，使 135°=左上、45°=右上、270°=正下 */
        function polarOffset(ang, r) {
          return { dx: Math.cos(ang) * r, dy: -Math.sin(ang) * r };
        }

        function sectorAngleRad(key) {
          const s = KG_SECTORS[key] || KG_SECTORS.advanced;
          return (s.angDeg * Math.PI) / 180;
        }

        function assignSectorKey(node, index, total) {
          if (node && node.sector && KG_SECTORS[node.sector]) return node.sector;
          if (node && KG_SECTOR_BY_ID[node.id]) return KG_SECTOR_BY_ID[node.id];
          const rank = levelRank(node && node.level);
          const levels = []; // filled by caller when mixed — fallback thirds
          if (total <= 1) return "advanced";
          // 若调用方传入了多样性，优先用 level；此处默认三等分以形成辐射剪影
          const third = Math.ceil(total / 3) || 1;
          if (index < third) return "foundation";
          if (index < third * 2) return "advanced";
          return "practice";
        }

        function assignSectorKeySmart(nodes) {
          const ranks = nodes.map(n => levelRank(n.level || "??"));
          const uniq = new Set(ranks);
          return nodes.map((n, i) => {
            if (n.sector && KG_SECTORS[n.sector]) return n.sector;
            if (KG_SECTOR_BY_ID[n.id]) return KG_SECTOR_BY_ID[n.id];
            if (uniq.size >= 2) {
              const r = levelRank(n.level || "??");
              if (r <= 1) return "foundation";
              if (r >= 3) return "practice";
              return "advanced";
            }
            return assignSectorKey(n, i, nodes.length);
          });
        }

        /** 二次贝塞尔弧线（顺时针弯，模拟百科 curvedCW） */
        function satArcPath(px, py, x, y, layer, siblingIndex, siblingTotal) {
          const dx = x - px, dy = y - py;
          const dist = Math.hypot(dx, dy) || 1;
          const pad = layer >= 4 ? 16 : layer === 3 ? 18 : 22;
          const tx = x - (dx / dist) * pad;
          const ty = y - (dy / dist) * pad;
          const mx = (px + tx) / 2;
          const my = (py + ty) / 2;
          const nx = -dy / dist, ny = dx / dist;
          const roundness = layer <= 2 ? 0.28 : 0.35;
          const bend = Math.min(48, dist * roundness) * (siblingTotal > 1 ? 1 : 0.7);
          const sign = 1;
          return `M${px},${py}Q${mx + nx * bend * sign},${my + ny * bend * sign} ${tx},${ty}`;
        }

        function stopKgSettle() {
          if (kgSettleTimer) {
            clearTimeout(kgSettleTimer);
            kgSettleTimer = null;
          }
        }

        /** 短时 forceCollide，保留扇区目标位（百科 BarnesHut settle 的轻量版） */
        function settleSatPositions(items, hub) {
          if (!items.length || typeof d3 === "undefined" || !d3.forceSimulation) return items;
          const nodes = items.map((d, i) => ({
            index: i,
            x: d.x,
            y: d.y,
            tx: d.x,
            ty: d.y,
            r: d.isLeaf ? 18 : (d.isBranch ? 30 : (d.layer === 2 ? 28 : 22))
          }));
          const sim = d3.forceSimulation(nodes)
            .force("collide", d3.forceCollide().radius(d => d.r + 4).strength(0.85).iterations(2))
            .force("x", d3.forceX(d => d.tx).strength(0.18))
            .force("y", d3.forceY(d => d.ty).strength(0.18))
            .stop();
          for (let i = 0; i < 32; i++) sim.tick();
          const minDist = 78;
          nodes.forEach((n, i) => {
            const dx = n.x - hub.x, dy = n.y - hub.y;
            const dist = Math.hypot(dx, dy) || 1;
            if (dist < minDist) {
              n.x = hub.x + (dx / dist) * minDist;
              n.y = hub.y + (dy / dist) * minDist;
            }
            items[i].x = n.x;
            items[i].y = n.y;
          });
          return items;
        }

        function paintSatLayer(items) {
          satData = items;
          satLinkSel = satLinkG.selectAll("path").data(satData, d => d.learnId)
            .join("path")
            .attr("class", d => `sat-link layer-${d.layer}${d.layer >= 3 ? " dashed" : ""}`)
            .attr("stroke", d => d.color)
            .attr("d", d => satArcPath(d.parentX, d.parentY, d.x, d.y, d.layer, d.sibIdx, d.sibTotal));

          satNodeSel = satNodeG.selectAll("g").data(satData, d => d.learnId)
            .join(enter => {
              const g = enter.append("g").attr("class", "sat-node");
              g.append("circle");
              g.append("text").attr("class", "sat-label");
              g.append("text").attr("class", "sat-sub").attr("dy", 20);
              return g;
            })
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr("class", d => {
              let cls = `sat-node layer-${d.layer}`;
              if (d.isLeaf) cls += " is-leaf";
              if (d.isChapter) cls += " is-chapter";
              if (d.isBranch) cls += " is-branch";
              return cls;
            })
            .classed("selected", d => d.kgId === kgDrill.selectedLeafId)
            .classed("learned", d => isLearned(d.learnId));

          satNodeSel.select("circle")
            .attr("r", d => {
              if (d.isLeaf) return 17;
              if (d.isBranch) return 28;
              if (d.isChapter) return 24;
              if (d.layer === 2) return 26;
              return 20;
            })
            .attr("fill", d => d.color)
            .style("filter", d => d.sectorGlow
              ? `drop-shadow(0 0 12px ${d.sectorGlow})`
              : null);
          satNodeSel.select("text.sat-label")
            .text(d => d.name.length > 7 ? d.name.slice(0, 6) + "…" : d.name);
          satNodeSel.select("text.sat-sub")
            .text(d => {
              if (d.isLeaf) return "讲义";
              if (d.isChapter && d.isBranch) return "导读";
              if (d.isChapter) return "章节";
              if (d.isBranch) return "已展开";
              return "展开";
            });

          satNodeSel.on("click", (event, d) => {
            event.stopPropagation();
            onKgDrillClick(d);
          });
        }

        function redrawKgDrill() {
          if (!kgDrill.active) return;
          const tree = currentKgTree();
          const hub = nodeById[kgDrill.hubId];
          if (!hub || !tree) return;
          const items = [];

          function pushFan(c, px, py, layer, baseR, idx, total, parentAng, color, sectorKey, sectorGlow) {
            let ang;
            if (total <= 1) {
              ang = (parentAng != null) ? parentAng : sectorAngleRad(sectorKey || "advanced");
            } else if (parentAng != null && layer > 2) {
              const fan = Math.min(1.15, 0.22 * Math.max(total, 1));
              ang = parentAng - fan / 2 + (fan * idx) / Math.max(total - 1, 1);
            } else if (parentAng != null) {
              const spread = Math.min(0.9, 0.18 * Math.max(total, 1));
              ang = total === 1 ? parentAng : parentAng - spread / 2 + (spread * idx) / Math.max(total - 1, 1);
            } else {
              ang = -Math.PI / 2;
            }
            const jitter = (idx % 3) * (layer === 2 ? 22 : 14);
            const r = baseR + jitter;
            const off = polarOffset(ang, r);
            const x = px + off.dx;
            const y = py + off.dy;
            const rawKids = kgNodeKids(c);
            const canExpand = filterKgChildren(rawKids).length > 0;
            const isL2Exp = layer === 2 && kgDrill.expandedL2 === c.id;
            const isL3Exp = layer === 3 && kgDrill.expandedL3 === c.id;
            const expanded = isL2Exp || isL3Exp;
            const leaf = !rawKids.length;
            const chapter = isLessonParent(c);
            const sec = KG_SECTORS[sectorKey] || null;
            const fill = leaf
              ? "#34d399"
              : (expanded ? "#f59e0b" : (color || (sec ? sec.color : "#38bdf8")));
            items.push({
              learnId: "kg:" + kgDrill.hubId + ":" + c.id,
              kgId: c.id,
              name: c.title,
              x, y,
              parentX: px,
              parentY: py,
              layer,
              ang,
              r,
              sibIdx: idx,
              sibTotal: total,
              isLeaf: leaf,
              isChapter: chapter && !leaf,
              isBranch: canExpand && expanded,
              color: fill,
              sectorKey: sectorKey || null,
              sectorGlow: sectorGlow || (sec ? sec.glow : null)
            });
            return { x, y, ang, r, hasKids: canExpand, expanded, leaf, chapter };
          }

          if (kgDrill.revealed) {
            const l2s = filterKgChildren(tree.children || []);
            const sectorKeys = assignSectorKeySmart(l2s);
            const groups = { foundation: [], advanced: [], practice: [] };
            l2s.forEach((c, i) => {
              const key = sectorKeys[i] || "advanced";
              groups[key] = groups[key] || [];
              groups[key].push({ node: c, sectorKey: key });
            });
            KG_SECTOR_ORDER.forEach((key) => {
              const list = groups[key] || [];
              if (!list.length) return;
              const sec = KG_SECTORS[key];
              const base = sectorAngleRad(key);
              const n = list.length;
              const spread = Math.min(0.9, 0.18 * Math.max(n, 1));
              list.forEach((entry, i) => {
                const c = entry.node;
                const ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
                const baseR = 200 + (i % 3) * 24;
                const off = polarOffset(ang, baseR);
                const placed = {
                  x: hub.x + off.dx,
                  y: hub.y + off.dy,
                  ang,
                  r: baseR
                };
                // push via shared item builder (manual parent = hub)
                const rawKids = kgNodeKids(c);
                const canExpand = filterKgChildren(rawKids).length > 0;
                const expanded = kgDrill.expandedL2 === c.id;
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
                }
              });
            });
          }

          settleSatPositions(items, hub);
          paintSatLayer(items);
          syncKgHubSize();
          updateKgDrillHint();
          updateKgFocusChrome();
        }

'''

text = text[:start] + NEW_DRAW + text[end:]
print("redraw/sector/settle block replaced")

# Patch updateKgDrillHint to also drive left chrome; add updateKgFocusChrome
OLD_HINT_FN = '''        function updateKgDrillHint() {
          const el = document.getElementById("sqlDrillHint");
          if (!el) return;
          if (!kgDrill.active) { el.hidden = true; return; }
          const hubName = (nodeById[kgDrill.hubId] && nodeById[kgDrill.hubId].name) || kgDrill.hubId;
          let msg;
          if (!kgDrill.revealed) {
            msg = `焦点模式：<strong>${escapeHtml(hubName)}</strong> · 再点中心展开领域扇区`;
          } else if (kgDrill.panelMode === "chapter") {
            const titles = kgFocusPathTitles();
            msg = `章节：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 右侧导读，或点绿色叶节点学讲义`;
          } else if (kgDrill.selectedLeafId) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong>（右侧讲义）`;
          } else if (kgDrill.expandedL2) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 继续点主题 / 知识点`;
          } else {
            msg = `已展开 <strong>${escapeHtml(hubName)}</strong> · 扇形一对多下钻 · 倒数第二层出导读 · 叶节点出教程`;
          }
          el.hidden = false;
          el.innerHTML = `${msg} <button type="button" id="btnExitKgFocus">← 返回总览</button>`;
          const btn = document.getElementById("btnExitKgFocus");
          if (btn) {
            btn.addEventListener("click", (event) => {
              event.stopPropagation();
              clearSatellites();
              resetHighlight();
              closePanelSoft();
            });
          }
        }'''

NEW_HINT_FN = '''        function exitFocusToOverview() {
          clearSatellites();
          resetHighlight();
          closePanelSoft();
        }

        function updateKgFocusChrome() {
          const side = document.getElementById("kgFocusSide");
          const titleEl = document.getElementById("kgFocusSideTitle");
          const pathEl = document.getElementById("kgFocusPath");
          const hintEl = document.getElementById("kgFocusSideHint");
          const legEl = document.getElementById("kgFocusLegend");
          const backBtn = document.getElementById("btnKgFocusBack");
          if (!side) return;
          if (!kgDrill.active) {
            side.setAttribute("hidden", "");
            return;
          }
          side.removeAttribute("hidden");
          const hub = nodeById[kgDrill.hubId];
          const hubName = (hub && hub.name) || kgDrill.hubId;
          if (titleEl) titleEl.textContent = hubName + " · 焦点";
          if (pathEl) {
            const titles = kgFocusPathTitles();
            pathEl.textContent = titles.length ? titles.join(" → ") : hubName;
          }
          if (hintEl) {
            if (!kgDrill.revealed) hintEl.textContent = "再点中心：展开基础 / 进阶 / 实战 三扇区";
            else if (kgDrill.panelMode === "chapter") hintEl.textContent = "章节导读已打开 · 点绿色叶节点进入讲义";
            else if (kgDrill.selectedLeafId) hintEl.textContent = "右侧为讲义 · 可标记已学习";
            else hintEl.textContent = "三扇区辐射 · 弧线一对多 · 倒数第二层出导读";
          }
          if (legEl) {
            legEl.innerHTML = `<div class="kg-focus-legend-title">扇区图例</div>` + KG_SECTOR_ORDER.map(k => {
              const s = KG_SECTORS[k];
              return `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:${s.color};color:${s.color}"></span>${escapeHtml(s.label)} · ${s.angDeg}°</div>`;
            }).join("") +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#34d399;color:#34d399"></span>叶节点讲义</div>` +
              `<div class="kg-focus-leg-item"><span class="kg-focus-leg-dot" style="background:#f59e0b;color:#f59e0b"></span>已展开分支</div>`;
          }
          if (backBtn && !backBtn._bound) {
            backBtn._bound = true;
            backBtn.addEventListener("click", (event) => {
              event.stopPropagation();
              exitFocusToOverview();
            });
          }
        }

        function updateKgDrillHint() {
          const el = document.getElementById("sqlDrillHint");
          updateKgFocusChrome();
          if (!el) return;
          if (!kgDrill.active) { el.hidden = true; return; }
          const hubName = (nodeById[kgDrill.hubId] && nodeById[kgDrill.hubId].name) || kgDrill.hubId;
          let msg;
          if (!kgDrill.revealed) {
            msg = `焦点模式：<strong>${escapeHtml(hubName)}</strong> · 再点中心展开三扇区`;
          } else if (kgDrill.panelMode === "chapter") {
            const titles = kgFocusPathTitles();
            msg = `章节：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 右侧导读，或点绿色叶节点学讲义`;
          } else if (kgDrill.selectedLeafId) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong>（右侧讲义）`;
          } else if (kgDrill.expandedL2) {
            const titles = kgFocusPathTitles();
            msg = `路径：<strong>${titles.map(escapeHtml).join(" → ")}</strong> · 继续点主题 / 知识点`;
          } else {
            msg = `已展开 <strong>${escapeHtml(hubName)}</strong> · 基础/进阶/实战三扇区 · 弧线一对多`;
          }
          el.hidden = false;
          el.innerHTML = `${msg} <button type="button" id="btnExitKgFocus">← 返回总览</button>`;
          const btn = document.getElementById("btnExitKgFocus");
          if (btn) {
            btn.addEventListener("click", (event) => {
              event.stopPropagation();
              exitFocusToOverview();
            });
          }
        }'''

if "function updateKgFocusChrome()" not in text:
    if OLD_HINT_FN not in text:
        raise SystemExit("updateKgDrillHint block not found exactly")
    text = text.replace(OLD_HINT_FN, NEW_HINT_FN, 1)
    print("focus chrome JS inserted")
else:
    print("focus chrome JS already present")

# exitKgDrill should hide chrome / stop settle
if "stopKgSettle()" not in text:
    text = text.replace(
        "        function exitKgDrill() {\n          stopKgPulse();",
        "        function exitKgDrill() {\n          stopKgPulse();\n          stopKgSettle();",
        1,
    )
    print("exitKgDrill stopKgSettle hooked")

# clearSatellites stop settle
if "stopKgSettle" in text and "clearSatellites" in text:
    text = text.replace(
        """    function clearSatellites() {
      expandedHubId = null;
      if (typeof stopKgPulse === "function") stopKgPulse();""",
        """    function clearSatellites() {
      expandedHubId = null;
      if (typeof stopKgPulse === "function") stopKgPulse();
      if (typeof stopKgSettle === "function") stopKgSettle();""",
        1,
    )

# Fix focus toolbar CSS conflict: earlier body.kg-focus-on .toolbar { opacity 0.28 } — new CSS overrides with opacity 1 when both apply; ensure order OK.
# Soften old rule by replacing it
text = text.replace(
    """    body.kg-focus-on .hint,
    body.kg-focus-on .toolbar {
      opacity: 0.28;
      pointer-events: none;
    }""",
    """    body.kg-focus-on .hint {
      opacity: 0;
      pointer-events: none;
    }""",
    1,
)

HTML.write_text(text, encoding="utf-8")
print("Wrote", HTML, "lines", text.count("\n") + 1)
