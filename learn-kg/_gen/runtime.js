    const CATEGORIES = {
      storage: { label: "STORAGE 存储", color: "#4da3ff" },
      process: { label: "PROCESS 加工", color: "#f59e0b" },
      analyze: { label: "ANALYZE 分析", color: "#34d399" },
      govern:  { label: "GOVERN 治理",  color: "#a78bfa" },
      intel:   { label: "INTEL 智能",   color: "#fb7185" }
    };

    const COMPARE_FIELDS = [
      { key: "type", label: "类型" },
      { key: "workload", label: "负载" },
      { key: "storage", label: "存储" },
      { key: "language", label: "语言/语法" },
      { key: "data", label: "典型数据" },
      { key: "pros", label: "优点" },
      { key: "cons", label: "缺点" },
      { key: "scenario", label: "典型场景" }
    ];

    const STAGES = [
      { key: "src", label: "01 源头" },
      { key: "lang", label: "02 语言" },
      { key: "proc", label: "03 加工" },
      { key: "store", label: "04 存储" },
      { key: "ana", label: "05 分析" },
      { key: "ai", label: "06 智能" }
    ];

    const nodes = __NODES__;
    const LAYOUT = __LAYOUT__;
    const links = __LINKS__;

    const legendEl = document.getElementById("legend");
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      const item = document.createElement("div");
      item.className = "legend-item";
      item.innerHTML = `<span class="legend-dot" style="background:${cat.color};color:${cat.color}"></span>${(cat.label.split(" ")[1] || cat.label)}`;
      legendEl.appendChild(item);
    });

    const neighbors = {};
    nodes.forEach(n => { neighbors[n.id] = new Set(); });
    links.forEach(l => {
      neighbors[l.source].add(l.target);
      neighbors[l.target].add(l.source);
    });

    const panel = document.getElementById("panel");
    const panelCat = document.getElementById("panelCat");
    const panelTitle = document.getElementById("panelTitle");
    const panelSub = document.getElementById("panelSub");
    const panelBody = document.getElementById("panelBody");
    const btnClose = document.getElementById("btnClose");
    let selectedId = null;
    let panelState = { mode: "overview", engineId: null, compareOn: false, compareIds: [] };

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function renderDeepNode(node) {
      const methods = (node.methods && node.methods.length)
        ? `<ul class="method-list">${node.methods.map(m => {
            const parts = String(m).split(" — ");
            if (parts.length > 1) {
              return `<li><strong>${escapeHtml(parts[0])}</strong> — ${escapeHtml(parts.slice(1).join(" — "))}</li>`;
            }
            return `<li>${escapeHtml(m)}</li>`;
          }).join("")}</ul>`
        : "";
      const code = node.code ? `<div class="code-block">${escapeHtml(node.code)}</div>` : "";
      const kids = (node.children && node.children.length)
        ? node.children.map(renderDeepNode).join("")
        : "";
      return `<details>
          <summary>${escapeHtml(node.name)}</summary>
          <div class="deep-body">
            ${node.text ? `<p>${escapeHtml(node.text)}</p>` : ""}
            ${methods}${code}${kids}
          </div>
        </details>`;
    }

    function renderTopics(topics) {
      if (!topics || !topics.length) return "";
      const tree = topics.map(t => {
        if (!t.children && !t.methods && !t.code) {
          return `<div class="topic-block"><div class="topic-name">${escapeHtml(t.name)}</div><p>${escapeHtml(t.text || "")}</p></div>`;
        }
        return renderDeepNode(t);
      }).join("");
      return `<h4>知识细分（可逐层展开）</h4>
        <p class="deep-hint">// 点击 + 下钻：主题 → 子题 → 方法 → 示例</p>
        <div class="deep-tree">${tree}</div>`;
    }

    function renderLayers(d, openL3) {
      const depUp = (d.l2.deps.upstream || []).map(n => `<span class="dep-tag">${escapeHtml(n)}</span>`).join("")
        || "<span class='source' style='border:none;padding:0;margin:0'>// 源头模块</span>";
      const depDown = (d.l2.deps.downstream || []).map(n => `<span class="dep-tag">${escapeHtml(n)}</span>`).join("") || "—";
      const resources = (d.l3.resources || []).map(r =>
        `<li><span class="resource-link">${escapeHtml(r.name)}</span> — ${escapeHtml(r.note)}</li>`).join("");
      return `
        <div class="layer open" data-layer="l1">
          <button class="layer-toggle" type="button">
            <span class="layer-level">L1</span><span class="layer-title">概念 CONCEPT</span><span class="layer-chevron">▼</span>
          </button>
          <div class="layer-content">
            <h4>一句话定义</h4><p>${escapeHtml(d.l1.definition)}</p>
            <h4>为什么重要</h4><p>${escapeHtml(d.l1.why)}</p>
            <span class="source">${escapeHtml(d.l1.source)}</span>
          </div>
        </div>
        <div class="layer open" data-layer="l2">
          <button class="layer-toggle" type="button">
            <span class="layer-level">L2</span><span class="layer-title">理解 UNDERSTAND</span><span class="layer-chevron">▼</span>
          </button>
          <div class="layer-content">
            <h4>核心原理</h4><ul>${d.l2.principles.map(p => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
            <h4>关键术语</h4><ul>${d.l2.terms.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
            ${renderTopics(d.l2.topics)}
            <h4>上游依赖</h4><div class="dep-tags">${depUp}</div>
            <h4>下游影响</h4><div class="dep-tags">${depDown}</div>
            <span class="source">${escapeHtml(d.l2.source)}</span>
          </div>
        </div>
        <div class="layer${openL3 ? " open" : ""}" data-layer="l3">
          <button class="layer-toggle" type="button">
            <span class="layer-level">L3</span><span class="layer-title">实操 PRACTICE</span><span class="layer-chevron">▼</span>
          </button>
          <div class="layer-content">
            <h4>常用工具</h4><ul>${d.l3.tools.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
            <h4>代码示例</h4><div class="code-block">${escapeHtml(d.l3.code)}</div>
            <h4>学习资源</h4><ul>${resources}</ul>
            <span class="source">${escapeHtml(d.l3.source)}</span>
          </div>
        </div>`;
    }

    function bindLayerToggles() {
      panelBody.querySelectorAll(".layer-toggle").forEach(btn => {
        btn.addEventListener("click", () => btn.parentElement.classList.toggle("open"));
      });
    }

    function renderCompareTable(engines, ids) {
      const cols = engines.filter(e => ids.includes(e.id));
      if (cols.length < 2) return `<p class="deep-hint">// 请勾选 2～3 个引擎生成对比表</p>`;
      const head = `<tr><th>维度</th>${cols.map(c => `<th>${escapeHtml(c.name)}</th>`).join("")}</tr>`;
      const body = COMPARE_FIELDS.map(f => {
        const tds = cols.map(c => `<td>${escapeHtml((c.compare && c.compare[f.key]) || "—")}</td>`).join("");
        return `<tr><td class="row-label">${escapeHtml(f.label)}</td>${tds}</tr>`;
      }).join("");
      return `<div class="compare-table-wrap"><table class="compare-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
    }

    function renderCatalogPanel(node) {
      const engines = node.engines || [];
      const label = node.catalogLabel || "列表";

      if (panelState.mode === "engine" && panelState.engineId) {
        const eng = engines.find(e => e.id === panelState.engineId);
        if (!eng) { panelState.mode = "list"; return renderCatalogPanel(node); }
        panelTitle.textContent = eng.name;
        panelSub.textContent = eng.tagline || node.detail.subtitle;
        panelBody.innerHTML = `
          <div class="crumb"><a data-act="back-list">← ${escapeHtml(label)}</a> / ${escapeHtml(eng.name)}</div>
          ${renderLayers(eng.detail, false)}`;
        bindLayerToggles();
        panelBody.querySelector("[data-act=back-list]").addEventListener("click", () => {
          panelState.mode = "list"; panelState.engineId = null; renderPanel(node);
        });
        return;
      }

      panelTitle.textContent = node.name;
      panelSub.textContent = node.detail.subtitle;

      if (panelState.mode === "overview") {
        panelBody.innerHTML = `
          <div class="mode-tabs">
            <button type="button" class="active" data-mode="overview">概览</button>
            <button type="button" data-mode="list">${escapeHtml(label)}</button>
          </div>
          ${renderLayers(node.detail, false)}`;
        bindLayerToggles();
        panelBody.querySelectorAll(".mode-tabs button").forEach(b => {
          b.addEventListener("click", () => {
            panelState.mode = b.getAttribute("data-mode");
            panelState.compareOn = false;
            panelState.compareIds = [];
            renderPanel(node);
          });
        });
        return;
      }

      const compareClass = panelState.compareOn ? " compare-mode" : "";
      const cards = engines.map(e => {
        const checked = panelState.compareIds.includes(e.id);
        return `<div class="engine-card${checked ? " selected" : ""}" data-eid="${escapeHtml(e.id)}">
          <div class="ename">${escapeHtml(e.name)}</div>
          <div class="etag">${escapeHtml(e.tagline || "")}</div>
          <div class="echeck">${checked ? "✓ 已选对比" : "点击勾选对比"}</div>
        </div>`;
      }).join("");

      panelBody.innerHTML = `
        <div class="mode-tabs">
          <button type="button" data-mode="overview">概览</button>
          <button type="button" class="active" data-mode="list">${escapeHtml(label)}</button>
          <button type="button" data-mode="compare" class="${panelState.compareOn ? "active" : ""}">对比</button>
        </div>
        <div class="compare-bar">
          <span>${panelState.compareOn ? "对比模式：勾选 2～3 个引擎" : "点卡片查看详情；或切换「对比」"} · 已选 ${panelState.compareIds.length}</span>
          <button type="button" id="btnDoCompare" ${(!panelState.compareOn || panelState.compareIds.length < 2 || panelState.compareIds.length > 3) ? "disabled" : ""}>生成对比表</button>
        </div>
        <div class="engine-grid${compareClass}" id="engineGrid">${cards}</div>
        <div id="compareResult"></div>`;

      panelBody.querySelectorAll(".mode-tabs button").forEach(b => {
        b.addEventListener("click", () => {
          const m = b.getAttribute("data-mode");
          if (m === "compare") {
            panelState.mode = "list";
            panelState.compareOn = true;
          } else {
            panelState.mode = m;
            panelState.compareOn = false;
            panelState.compareIds = [];
          }
          renderPanel(node);
        });
      });

      panelBody.querySelectorAll(".engine-card").forEach(card => {
        card.addEventListener("click", () => {
          const eid = card.getAttribute("data-eid");
          if (panelState.compareOn) {
            const idx = panelState.compareIds.indexOf(eid);
            if (idx >= 0) panelState.compareIds.splice(idx, 1);
            else if (panelState.compareIds.length < 3) panelState.compareIds.push(eid);
            renderPanel(node);
          } else {
            panelState.mode = "engine";
            panelState.engineId = eid;
            renderPanel(node);
          }
        });
      });

      const btn = panelBody.querySelector("#btnDoCompare");
      if (btn) {
        btn.addEventListener("click", () => {
          panelBody.querySelector("#compareResult").innerHTML =
            `<h4>差异对比</h4>` + renderCompareTable(engines, panelState.compareIds);
        });
      }
    }

    function renderPanel(node) {
      const cat = CATEGORIES[node.category];
      panelCat.textContent = cat.label;
      panelCat.style.background = cat.color;

      if (node.catalog && node.engines && node.engines.length) {
        renderCatalogPanel(node);
        panel.classList.add("open");
        return;
      }

      panelTitle.textContent = node.name;
      panelSub.textContent = node.detail.subtitle;
      panelBody.innerHTML = renderLayers(node.detail, false);
      bindLayerToggles();
      panel.classList.add("open");
    }

    function closePanel() {
      selectedId = null;
      panel.classList.remove("open");
      panelState = { mode: "overview", engineId: null, compareOn: false, compareIds: [] };
      resetHighlight();
    }
    btnClose.addEventListener("click", closePanel);

    const graphEl = document.getElementById("graph");
    const width = () => graphEl.clientWidth;
    const height = () => graphEl.clientHeight;
    let showAllLinks = false;

    const svg = d3.select("#graph").append("svg");
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "node-glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    defs.append("marker").attr("id", "arrow").attr("viewBox", "0 -4 8 8")
      .attr("refX", 10).attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
      .append("path").attr("d", "M0,-4L8,0L0,4").attr("fill", "#475569");
    defs.append("marker").attr("id", "arrow-active").attr("viewBox", "0 -4 8 8")
      .attr("refX", 10).attr("refY", 0).attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto")
      .append("path").attr("d", "M0,-4L8,0L0,4").attr("fill", "#22d3ee");

    const gRoot = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.4, 2.2]).on("zoom", (event) => {
      gRoot.attr("transform", event.transform);
    });
    svg.call(zoom);

    const stageG = gRoot.append("g").attr("class", "stages");
    const linkG = gRoot.append("g").attr("class", "links");
    const nodeG = gRoot.append("g").attr("class", "nodes");
    const laneG = gRoot.append("g").attr("class", "lanes");

    function layoutMetrics() {
      const w = Math.max(width(), 980);
      const h = Math.max(height(), 600);
      const padX = 60, padTop = 58, padBottom = 28, govBand = 110;
      const mainH = h - padTop - padBottom - govBand;
      const colW = (w - padX * 2) / STAGES.length;
      return { w, h, padX, padTop, padBottom, govBand, mainH, colW };
    }

    function placeNodes() {
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
    }

    function drawStages(m) {
      stageG.selectAll("*").remove();
      laneG.selectAll("*").remove();
      STAGES.forEach((s, i) => {
        const x = m.padX + i * m.colW;
        stageG.append("rect").attr("class", "stage-band")
          .attr("x", x + 6).attr("y", m.padTop - 28)
          .attr("width", m.colW - 12).attr("height", m.mainH + 20).attr("rx", 10);
        stageG.append("text").attr("class", "stage-label")
          .attr("x", x + m.colW / 2).attr("y", m.padTop - 10).text(s.label);
      });
      laneG.append("rect").attr("class", "stage-band")
        .attr("x", m.padX + m.colW * 1.6).attr("y", m.padTop + m.mainH + 8)
        .attr("width", m.colW * 3.2).attr("height", m.govBand - 16).attr("rx", 10)
        .attr("fill", "rgba(167, 139, 250, 0.06)").attr("stroke", "rgba(167, 139, 250, 0.2)");
      laneG.append("text").attr("class", "lane-label")
        .attr("x", m.padX + m.colW * 3.2).attr("y", m.padTop + m.mainH + 28)
        .attr("text-anchor", "middle").attr("fill", "#a78bfa")
        .text("GOVERNANCE  治理横贯层（血缘 · 治理 · 质量）");
    }

    function linkPath(d) {
      const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
      const dx = tx - sx, dy = ty - sy;
      const dist = Math.hypot(dx, dy) || 1;
      const pad = 32;
      const x2 = tx - (dx / dist) * pad, y2 = ty - (dy / dist) * pad;
      const mx = (sx + x2) / 2, my = (sy + y2) / 2;
      const nx = -dy / dist, ny = dx / dist;
      const bend = Math.min(36, dist * 0.12) * (d.trunk ? 0.35 : 0.9);
      return `M${sx},${sy}Q${mx + nx * bend},${my + ny * bend} ${x2},${y2}`;
    }

    placeNodes();
    drawStages(layoutMetrics());

    const link = linkG.selectAll("path").data(links).join("path")
      .attr("class", d => d.trunk ? "link" : "link secondary")
      .attr("marker-end", "url(#arrow)");

    const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]));
    links.forEach(l => { l.source = nodeById[l.source]; l.target = nodeById[l.target]; });

    const node = nodeG.selectAll("g").data(nodes).join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on("start", (event) => event.sourceEvent.stopPropagation())
        .on("drag", (event, d) => { d.x = d.fx = event.x; d.y = d.fy = event.y; tick(); }));

    node.append("circle").attr("r", 28)
      .attr("fill", d => CATEGORIES[d.category].color)
      .attr("filter", "url(#node-glow)");
    node.append("text").text(d => shortLabel(d.name));
    node.append("text").attr("class", "sublabel").attr("dy", 40)
      .text(d => d.catalog ? "CATALOG" : (d.name.length > 5 ? d.name : ""));

    node.on("click", (event, d) => {
      event.stopPropagation();
      panelState = { mode: d.catalog ? "list" : "overview", engineId: null, compareOn: false, compareIds: [] };
      selectNode(d);
    });
    svg.on("click", () => closePanel());

    function tick() {
      link.attr("d", linkPath);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
      applyLinkVisibility();
    }

    function applyLinkVisibility() {
      link.classed("hidden", d => {
        if (selectedId) return false;
        return !showAllLinks && !d.trunk;
      });
      if (!selectedId) {
        link.classed("active", false).classed("dimmed", false)
          .attr("marker-end", d => (!showAllLinks && !d.trunk) ? null : "url(#arrow)");
      }
    }

    function shortLabel(name) {
      const map = {
        "实时数据": "实时", "机器学习/算法": "ML", "大数据平台": "大数据",
        "数据仓库": "数仓", "数据建模": "建模", "数据治理": "治理",
        "数据血缘": "血缘", "调度编排": "调度", "指标/语义层": "指标",
        "数据质量": "质量", "特征工程": "特征", "数据湖": "数据湖", "数据库": "数据库"
      };
      return map[name] || name;
    }

    function selectNode(d) {
      selectedId = d.id;
      const related = neighbors[d.id];
      node.classed("selected", n => n.id === d.id)
        .classed("related", n => related.has(n.id))
        .classed("dimmed", n => n.id !== d.id && !related.has(n.id));
      link.classed("hidden", false)
        .classed("active", l => l.source.id === d.id || l.target.id === d.id)
        .classed("dimmed", l => l.source.id !== d.id && l.target.id !== d.id)
        .attr("marker-end", l =>
          (l.source.id === d.id || l.target.id === d.id) ? "url(#arrow-active)" : "url(#arrow)");
      renderPanel(d);
    }

    function resetHighlight() {
      selectedId = null;
      node.classed("selected", false).classed("related", false).classed("dimmed", false);
      applyLinkVisibility();
      tick();
    }

    document.getElementById("btnTrunk").addEventListener("click", () => {
      showAllLinks = false;
      document.getElementById("btnTrunk").classList.add("active");
      document.getElementById("btnAll").classList.remove("active");
      if (!selectedId) applyLinkVisibility();
    });
    document.getElementById("btnAll").addEventListener("click", () => {
      showAllLinks = true;
      document.getElementById("btnAll").classList.add("active");
      document.getElementById("btnTrunk").classList.remove("active");
      if (!selectedId) applyLinkVisibility();
    });

    function relayout() {
      const m = placeNodes();
      drawStages(m);
      tick();
      const scale = Math.min(1, width() / m.w, height() / m.h);
      const tx = (width() - m.w * scale) / 2;
      const ty = (height() - m.h * scale) / 2;
      svg.call(zoom.transform, d3.zoomIdentity.translate(Math.max(0, tx), Math.max(0, ty)).scale(scale < 1 ? scale : 1));
    }

    window.addEventListener("resize", () => relayout());
    tick();
    relayout();

/* NOTE: Focus-drill runtime is maintained in kg_drill_runtime.js and applied into 数据知识图谱.html by apply_tutorial_upgrade.py / inject_lessons.py */
