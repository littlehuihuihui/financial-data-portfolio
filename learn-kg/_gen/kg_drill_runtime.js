    /* —— SQL/ML 画布焦点下钻（行业百科式扇形弧线 + 章节/讲义侧栏） —— */
    /* 三扇区（对齐行业百科：左上 / 右上 / 正下） */
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
    let kgSettleTimer = null;

        function currentKgTree() {
          if (!kgDrill.hubId) return null;
          return KG_TREES[kgDrill.hubId] || null;
        }
    
        function findKgNode(id, node) {
          const root = node || currentKgTree();
          if (!root) return null;
          if (root.id === id) return root;
          for (const c of (root.children || [])) {
            const hit = findKgNode(id, c);
            if (hit) return hit;
          }
          return null;
        }
    
        function kgNodeKids(n) {
          return (n && n.children) ? n.children : [];
        }
    
        function isKgLeaf(n) {
          return !kgNodeKids(n).length;
        }
    
        /** 倒数第二层：有子节点且子节点全部为叶，或显式 lessonParent */
        function isLessonParent(n) {
          if (!n) return false;
          const kids = kgNodeKids(n);
          if (!kids.length) return false;
          if (n.lessonParent === true) return true;
          return kids.every(isKgLeaf);
        }
    
        function levelRank(level) {
          if (level === "?" || level === "1" || level === "junior") return 1;
          if (level === "???" || level === "3" || level === "senior") return 3;
          return 2; // ?? / mid / default
        }
    
        function depthAllows(level) {
          const need = levelRank(level);
          if (depthLevel === "junior") return need <= 1;
          if (depthLevel === "mid") return need <= 2;
          return true;
        }
    
        function filterKgChildren(kids) {
          return (kids || []).filter(c => depthAllows(c.level || "??"));
        }
    
        function kgPathTitles(id) {
          const root = currentKgTree();
          if (!root || !id) return [];
          const trail = [];
          function dfs(node) {
            trail.push(node.title);
            if (node.id === id) return true;
            for (const c of (node.children || [])) {
              if (dfs(c)) return true;
            }
            trail.pop();
            return false;
          }
          return dfs(root) ? trail.slice() : [];
        }
    
        function kgFocusPathTitles() {
          const parts = [];
          const root = currentKgTree();
          if (!root) return parts;
          parts.push(root.title);
          if (kgDrill.expandedL2) {
            const n = findKgNode(kgDrill.expandedL2);
            if (n) parts.push(n.title);
          }
          if (kgDrill.expandedL3) {
            const n = findKgNode(kgDrill.expandedL3);
            if (n) parts.push(n.title);
          }
          if (kgDrill.selectedLeafId) {
            const n = findKgNode(kgDrill.selectedLeafId);
            if (n && (!parts.length || parts[parts.length - 1] !== n.title)) parts.push(n.title);
          }
          return parts;
        }
    
        function exitFocusToOverview() {
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
        }
    
        function stopKgPulse() {
          if (kgPulseTimer) {
            clearInterval(kgPulseTimer);
            kgPulseTimer = null;
          }
        }
    
        function startKgPulse() {
          stopKgPulse();
          if (!kgDrill.active || !kgDrill.hubId) return;
          let t = 0;
          kgPulseTimer = setInterval(() => {
            if (!kgDrill.active || typeof node === "undefined" || !node) return;
            t += 1;
            const r = 58 + Math.sin(t / 8) * 3.2;
            const blur = 22 + Math.sin(t / 8) * 8;
            node.filter(d => d.id === kgDrill.hubId).select("circle")
              .attr("r", r)
              .style("filter", `drop-shadow(0 0 ${blur}px rgba(168, 85, 247, 0.85))`);
          }, 50);
        }
    
        function syncKgHubSize() {
          if (typeof node === "undefined" || !node) return;
          node.select("circle").attr("r", d => {
            if (kgDrill.active && d.id === kgDrill.hubId) return 62;
            if (KG_TREES[d.id] || d.catalog) return 32;
            return 26;
          });
          node.classed("hub-expanded", d => (kgDrill.active && d.id === kgDrill.hubId) || d.id === expandedHubId);
          node.classed("kg-focus-hub", d => kgDrill.active && d.id === kgDrill.hubId);
          node.select(".sublabel").text(d => {
            if (kgDrill.active && d.id === kgDrill.hubId) {
              return kgDrill.revealed ? "领域已展开" : "再点展开";
            }
            if (KG_TREES[d.id]) return "点击学教程";
            if (d.catalog) return "点击展开";
            return d.name.length > 5 ? d.name : "";
          });
          if (kgDrill.active) startKgPulse();
          else stopKgPulse();
        }
    
        function enterKgDrill(hubId) {
          const tree = KG_TREES[hubId];
          const hub = nodeById[hubId];
          if (!tree || !hub) return;
    
          if (kgDrill.active && kgDrill.hubId && kgDrill.hubId !== hubId && kgDrill.savedPos) {
            const prev = nodeById[kgDrill.hubId];
            if (prev) {
              prev.x = prev.fx = kgDrill.savedPos.x;
              prev.y = prev.fy = kgDrill.savedPos.y;
            }
          }
    
          kgDrill = {
            active: true,
            hubId,
            revealed: false,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: { x: hub.x, y: hub.y }
          };
    
          const cx = width() / 2;
          const cy = height() / 2;
          hub.x = hub.fx = cx;
          hub.y = hub.fy = cy;
    
          document.body.classList.add("kg-focus-on");
          expandedHubId = null;
          closePanelSoft();
          redrawKgDrill();
          updateKgDrillHint();
          syncKgHubSize();
          if (typeof tick === "function") tick();
        }
    
        function exitKgDrill() {
          stopKgPulse();
          if (typeof stopKgSettle === "function") stopKgSettle();
          if (kgDrill.active && kgDrill.hubId && kgDrill.savedPos) {
            const hub = nodeById[kgDrill.hubId];
            if (hub) {
              hub.x = hub.fx = kgDrill.savedPos.x;
              hub.y = hub.fy = kgDrill.savedPos.y;
            }
          }
          kgDrill = {
            active: false,
            hubId: null,
            revealed: false,
            expandedL2: null,
            expandedL3: null,
            selectedLeafId: null,
            panelMode: null,
            savedPos: null
          };
          document.body.classList.remove("kg-focus-on");
          if (typeof node !== "undefined" && node) {
            node.classed("kg-focus-hub", false);
            node.select("circle").style("filter", null);
          }
          closePanelSoft();
          updateKgDrillHint();
          syncKgHubSize();
          if (typeof tick === "function") tick();
        }
    
        function closePanelSoft() {
          panel.classList.remove("open");
          panel.classList.remove("side-mode");
          panel.setAttribute("aria-hidden", "true");
          if (panelCard) panelCard.classList.remove("sql-kg-wide");
          kgDrill.panelMode = null;
        }
    
        function renderMdBlock(md) {
          const raw = md || "_暂无内容_";
          let html;
          if (window.marked) {
            marked.setOptions({ breaks: true, gfm: true });
            html = marked.parse(raw);
          } else {
            html = `<pre>${escapeHtml(raw)}</pre>`;
          }
          return html;
        }
    
        function highlightPanelCode() {
          panelBody.querySelectorAll("pre code").forEach((block) => {
            if (!block.className) block.classList.add("language-sql");
            if (window.hljs) hljs.highlightElement(block);
          });
        }
    
        function openKgSidePanel(kgNode, mode) {
          const hub = nodeById[kgDrill.hubId];
          const kids = kgNodeKids(kgNode);
          const resolved = mode || (isLessonParent(kgNode) ? "chapter" : "lesson");
          kgDrill.panelMode = resolved;
          kgDrill.selectedLeafId = kgNode.id;
    
          panel.classList.add("side-mode");
          if (panelCard) panelCard.classList.remove("sql-kg-wide");
          const cat = hub && CATEGORIES[hub.category] ? CATEGORIES[hub.category] : CATEGORIES.process;
          panelCat.textContent = (hub ? hub.name : "知识") + (resolved === "chapter" ? " · 章节" : " · 讲义");
          panelCat.style.background = cat.color;
          panelTitle.textContent = kgNode.title;
          const path = kgPathTitles(kgNode.id).join(" / ");
          panelSub.textContent = path + (kgNode.level ? " · " + sqlKgLevelLabel(kgNode.level) : "");
    
          let bodyHtml = `<div class="sql-kg-drawer-body" id="sqlSideMd">${renderMdBlock(kgNode.content)}</div>`;
          if (resolved === "chapter") {
            const visibleKids = filterKgChildren(kids);
            const cards = visibleKids.map(c => {
              const learnId = "kg:" + kgDrill.hubId + ":" + c.id;
              const done = isLearned(learnId) ? " learned" : "";
              return `<button type="button" class="lesson-card${done}" data-lesson-id="${escapeHtml(c.id)}">
                <span class="lesson-card-title">${escapeHtml(c.title)}</span>
                <span class="lesson-card-meta">${escapeHtml(sqlKgLevelLabel(c.level || "??"))}${isLearned(learnId) ? " · 已学" : ""}</span>
              </button>`;
            }).join("");
            bodyHtml += `<div class="chapter-lessons">
              <h4 class="chapter-lessons-title">本章子课</h4>
              <div class="lesson-card-list">${cards || "<p class='depth-note'>当前深度下暂无可见子课，可切换「高级」。</p>"}</div>
            </div>`;
          }
    
          panelBody.innerHTML = bodyHtml;
          highlightPanelCode();
          panelBody.querySelectorAll("[data-lesson-id]").forEach(btn => {
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              const id = btn.getAttribute("data-lesson-id");
              const leaf = findKgNode(id);
              if (!leaf) return;
              kgDrill.selectedLeafId = leaf.id;
              if (kgDrill.expandedL3) {
                /* keep */
              } else if (kgDrill.expandedL2 && isLessonParent(findKgNode(kgDrill.expandedL2))) {
                /* L2 chapter */
              }
              redrawKgDrill();
              openKgSidePanel(leaf, "lesson");
            });
          });
    
          selectedId = kgDrill.hubId;
          panel.classList.add("open");
          panel.setAttribute("aria-hidden", "false");
          syncLearnedUI();
          updateKgDrillHint();
        }
    
        /** 百科同款极角：y 轴向下时用 -sin，使 135°=左上、45°=右上、270°=正下 */
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

        function onKgDrillClick(sat) {
          const kg = findKgNode(sat.kgId);
          if (!kg) return;
          const kids = filterKgChildren(kgNodeKids(kg));
          const rawKids = kgNodeKids(kg);
    
          // 叶节点 → 讲义
          if (!rawKids.length) {
            kgDrill.selectedLeafId = kg.id;
            redrawKgDrill();
            openKgSidePanel(kg, "lesson");
            return;
          }
    
          if (sat.layer === 2) {
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
          }
    
          if (sat.layer === 3) {
            if (!kids.length && rawKids.length) {
              // 深度过滤后无可见子节点：当作章节导读
              kgDrill.expandedL3 = kg.id;
              kgDrill.selectedLeafId = kg.id;
              redrawKgDrill();
              openKgSidePanel(kg, "chapter");
              return;
            }
            if (isLessonParent(kg)) {
              if (kgDrill.expandedL3 !== kg.id) kgDrill.expandedL3 = kg.id;
              kgDrill.selectedLeafId = kg.id;
              redrawKgDrill();
              openKgSidePanel(kg, "chapter");
              return;
            }
            if (kgDrill.expandedL3 === kg.id) {
              kgDrill.expandedL3 = null;
              kgDrill.selectedLeafId = null;
              closePanelSoft();
            } else {
              kgDrill.expandedL3 = kg.id;
              kgDrill.selectedLeafId = null;
              closePanelSoft();
            }
            redrawKgDrill();
            return;
          }
    
          // L4+
          kgDrill.selectedLeafId = kg.id;
          redrawKgDrill();
          openKgSidePanel(kg, isLessonParent(kg) ? "chapter" : "lesson");
        }

    