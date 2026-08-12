/**
 * 增强版实体关系图（ECharts 力导向图）
 * 兼容 er-diagram-data.js 中的 window.ER_DIAGRAM 数据格式
 *
 * 交互特性：
 * - 力导向布局，节点可拖拽
 * - 点击节点查看详情（层级、中文名、上下游、关联键）
 * - 搜索定位表
 * - 按数仓分层筛选（DIM/ODS/DWD/DWS/ADS）
 * - 高亮关联路径，非关联节点淡化
 * - 鼠标悬停显示信息
 * - 缩放、平移、重置视图
 * - 多视图切换（兼容 cfg.views）
 */
(function (global) {
  const ECHARTS_CDNS = [
    "https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js",
    "https://unpkg.com/echarts@5.5.0/dist/echarts.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js",
    "https://cdn.bootcdn.net/ajax/libs/echarts/5.5.0/echarts.min.js",
  ];

  // 数仓分层配色
  const LAYER_CONFIG = {
    dim: { label: "DIM", name: "维度层", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
    ods: { label: "ODS", name: "原始层", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
    dwd: { label: "DWD", name: "明细层", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
    dws: { label: "DWS", name: "汇总层", color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
    ads: { label: "ADS", name: "应用层", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
    fact: { label: "FACT", name: "事实表", color: "#2dd4bf", bg: "rgba(45,212,191,0.15)" },
    default: { label: "TABLE", name: "表", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  };

  function detectLayer(tableName) {
    const name = (tableName || "").toLowerCase().trim();
    if (name.startsWith("dim_")) return "dim";
    if (name.startsWith("ods_")) return "ods";
    if (name.startsWith("dwd_")) return "dwd";
    if (name.startsWith("dws_")) return "dws";
    if (name.startsWith("v_") || name.startsWith("ads_")) return "ads";
    if (name.startsWith("fact_")) return "fact";
    return "default";
  }

  function getLayerConfig(tableName) {
    return LAYER_CONFIG[detectLayer(tableName)] || LAYER_CONFIG.default;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve(src);
      s.onerror = () => reject(new Error("script load failed: " + src));
      document.head.appendChild(s);
    });
  }

  let echartsReady = null;
  function loadECharts() {
    if (!echartsReady) {
      echartsReady = (async () => {
        if (!global.echarts) {
          let lastErr = null;
          for (const src of ECHARTS_CDNS) {
            try {
              await loadScript(src);
              if (global.echarts) break;
            } catch (err) {
              lastErr = err;
            }
          }
          if (!global.echarts) {
            throw lastErr || new Error("ECharts CDN load failed (all mirrors)");
          }
        }
        return global.echarts;
      })();
    }
    return echartsReady;
  }

  /**
   * 解析 mermaid flowchart 源码，提取节点和连线
   */
  function parseMermaidFlowchart(source) {
    const nodes = new Map();
    const links = [];
    const lines = (source || "").split("\n");

    // 先提取所有节点定义：xxx["yyy"] 或 xxx["yyy<br/>zzz"]
    const nodeDefRe = /([A-Za-z_][\w]*)\s*\[\s*"([^"]+)"\s*\]/g;
    let m;
    for (const line of lines) {
      nodeDefRe.lastIndex = 0;
      while ((m = nodeDefRe.exec(line))) {
        const id = m[1];
        const rawLabel = m[2];
        const parts = rawLabel.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
        const label = parts[0] || id;
        const cn = parts[1] || "";
        if (!nodes.has(id)) {
          nodes.set(id, { id, label, cn, layer: detectLayer(id) });
        }
      }
    }

    // 提取连线：A -->|label| B  或  A --> B
    const linkRe = /([A-Za-z_][\w]*)\s*-->\s*(?:\|([^|]+)\|)?\s*([A-Za-z_][\w]*)/g;
    for (const line of lines) {
      if (/^\s*subgraph/i.test(line)) continue;
      linkRe.lastIndex = 0;
      while ((m = linkRe.exec(line))) {
        const source = m[1];
        const label = (m[2] || "").trim();
        const target = m[3];
        if (!nodes.has(source)) {
          nodes.set(source, { id: source, label: source, cn: "", layer: detectLayer(source) });
        }
        if (!nodes.has(target)) {
          nodes.set(target, { id: target, label: target, cn: "", layer: detectLayer(target) });
        }
        links.push({ source, target, label });
      }
    }

    return { nodes: Array.from(nodes.values()), links };
  }

  // 合并多个视图的数据
  function mergeViews(views) {
    const allNodes = new Map();
    const allLinks = [];
    for (const view of views) {
      const parsed = parseMermaidFlowchart(view.mermaid);
      for (const node of parsed.nodes) {
        if (!allNodes.has(node.id)) {
          allNodes.set(node.id, node);
        }
      }
      allLinks.push(...parsed.links);
    }
    const seen = new Set();
    const uniqueLinks = allLinks.filter((l) => {
      const key = `${l.source}->${l.target}:${l.label}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return { nodes: Array.from(allNodes.values()), links: uniqueLinks };
  }

  // 构建上下游关系索引
  function buildRelations(nodes, links) {
    const incoming = new Map();
    const outgoing = new Map();
    for (const n of nodes) {
      incoming.set(n.id, []);
      outgoing.set(n.id, []);
    }
    for (const l of links) {
      if (outgoing.has(l.source)) {
        outgoing.get(l.source).push({ to: l.target, label: l.label });
      }
      if (incoming.has(l.target)) {
        incoming.get(l.target).push({ from: l.source, label: l.label });
      }
    }
    return { incoming, outgoing };
  }

  async function render(containerId) {
    const cfg = global.ER_DIAGRAM;
    const root = document.getElementById(containerId);
    if (!cfg || !root) return;

    const tableCn = cfg.tableCn || {};

    const views = Array.isArray(cfg.views) && cfg.views.length
      ? cfg.views
      : [{ id: "default", name: cfg.title || "ER", mermaid: cfg.mermaid }];

    const parsedViews = views.map((v) => ({
      ...v,
      ...parseMermaidFlowchart(v.mermaid),
    }));

    const merged = mergeViews(views);

    // 构建HTML结构
    root.innerHTML = `
      ${cfg.description ? `<p class="er-diagram-desc">${cfg.description}</p>` : ""}
      <div class="er-v2-toolbar">
        <div class="er-v2-toolbar-left">
          <div class="er-v2-view-tabs" role="tablist">
            <button type="button" class="er-v2-view-tab active" data-view="__all__" role="tab">全量血缘</button>
            ${parsedViews.map((v) =>
              `<button type="button" class="er-v2-view-tab" data-view="${v.id}" role="tab">${v.name}</button>`
            ).join("")}
          </div>
        </div>
        <div class="er-v2-toolbar-right">
          <div class="er-v2-search">
            <input type="text" class="er-v2-search-input" placeholder="搜索表名/中文名..." id="er-v2-search-input">
          </div>
          <div class="er-v2-layer-filter" id="er-v2-layer-filter">
            <span class="er-v2-filter-label">分层：</span>
            ${Object.entries(LAYER_CONFIG).filter(([k]) => k !== "default").map(([key, conf]) =>
              `<label class="er-v2-layer-check">
                <input type="checkbox" value="${key}" checked>
                <span class="er-v2-layer-dot" style="background:${conf.color}"></span>
                <span>${conf.label}</span>
              </label>`
            ).join("")}
          </div>
          <div class="er-v2-zoom-controls">
            <button type="button" class="er-v2-zoom-btn" data-action="zoomIn" title="放大">+</button>
            <button type="button" class="er-v2-zoom-btn" data-action="zoomOut" title="缩小">−</button>
            <button type="button" class="er-v2-zoom-btn" data-action="reset" title="重置视图">⟲</button>
          </div>
        </div>
      </div>
      <div class="er-v2-workspace">
        <div class="er-v2-chart-wrap" id="er-v2-chart"></div>
        <aside class="er-v2-detail-panel" id="er-v2-detail">
          <div class="er-v2-detail-empty">
            <div class="er-v2-empty-icon">🔍</div>
            <p>点击图中的表节点查看详情</p>
            <p class="er-v2-empty-hint">支持拖拽节点 · 滚轮缩放 · 搜索定位</p>
          </div>
        </aside>
      </div>
      <div class="er-v2-legend">
        ${Object.entries(LAYER_CONFIG).filter(([k]) => k !== "default").map(([key, conf]) =>
          `<span class="er-v2-legend-item">
            <span class="er-v2-legend-dot" style="background:${conf.color}"></span>
            ${conf.label} ${conf.name}
          </span>`
        ).join("")}
      </div>
    `;

    injectStyles();

    const chartDom = document.getElementById("er-v2-chart");
    const detailPanel = document.getElementById("er-v2-detail");
    const searchInput = document.getElementById("er-v2-search-input");
    const layerFilter = document.getElementById("er-v2-layer-filter");

    const echarts = await loadECharts();
    const chart = echarts.init(chartDom, "dark", { renderer: "canvas" });

    let currentData = merged;
    let currentRelations = buildRelations(merged.nodes, merged.links);
    let activeLayers = new Set(["dim", "ods", "dwd", "dws", "ads", "fact"]);
    let selectedNode = null;

    // 根据节点数量动态调整力导向布局参数
    function getForceParams(nodeCount) {
      if (nodeCount <= 10) {
        return { repulsion: 600, gravity: 0.1, edgeLength: [100, 160] };
      } else if (nodeCount <= 20) {
        return { repulsion: 800, gravity: 0.08, edgeLength: [120, 200] };
      } else if (nodeCount <= 35) {
        return { repulsion: 1200, gravity: 0.06, edgeLength: [150, 250] };
      } else {
        return { repulsion: 1600, gravity: 0.05, edgeLength: [180, 300] };
      }
    }

    function buildOption(data, highlightNodeId) {
      const { incoming, outgoing } = buildRelations(data.nodes, data.links);
      const forceParams = getForceParams(data.nodes.length);

      const relatedIds = new Set();
      if (highlightNodeId) {
        relatedIds.add(highlightNodeId);
        (incoming.get(highlightNodeId) || []).forEach((e) => relatedIds.add(e.from));
        (outgoing.get(highlightNodeId) || []).forEach((e) => relatedIds.add(e.to));
      }

      const nodes = data.nodes
        .filter((n) => activeLayers.has(n.layer))
        .map((n) => {
          const conf = getLayerConfig(n.id);
          const cn = tableCn[n.id] || n.cn || "";
          const isSelected = highlightNodeId && n.id === highlightNodeId;
          const isRelated = relatedIds.has(n.id);
          const isDimmed = highlightNodeId && !relatedIds.has(n.id);

          return {
            id: n.id,
            name: n.id,
            category: n.layer,
            symbolSize: isSelected ? 65 : 52,
            value: cn || n.label,
            itemStyle: {
              color: conf.bg,
              borderColor: conf.color,
              borderWidth: isSelected ? 3 : 2,
              shadowBlur: isSelected ? 20 : isRelated ? 12 : 6,
              shadowColor: conf.color,
              opacity: isDimmed ? 0.25 : 1,
            },
            label: {
              show: true,
              position: "inside",
              formatter: (params) => {
                const name = params.name;
                const cn2 = tableCn[name] || "";
                if (cn2) {
                  return `{name|${name}}\n{cn|${cn2}}`;
                }
                return `{name|${name}}`;
              },
              rich: {
                name: { fontSize: 11, fontWeight: "bold", color: "#e2e8f0", lineHeight: 16 },
                cn: { fontSize: 10, color: "#94a3b8", lineHeight: 14 },
              },
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 25,
                shadowColor: conf.color,
                borderWidth: 3,
              },
            },
          };
        });

      const nodeIds = new Set(nodes.map((n) => n.id));
      const links = data.links
        .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
        .map((l) => {
          const isHighlighted = highlightNodeId && (l.source === highlightNodeId || l.target === highlightNodeId);
          return {
            source: l.source,
            target: l.target,
            value: l.label,
            lineStyle: {
              color: isHighlighted ? "#fbbf24" : "#475569",
              width: isHighlighted ? 2.5 : 1.5,
              opacity: highlightNodeId && !isHighlighted ? 0.15 : 0.7,
              curveness: 0.1,
            },
            label: {
              show: isHighlighted,
              formatter: l.label,
              fontSize: 10,
              color: "#94a3b8",
              backgroundColor: "rgba(15,23,42,0.9)",
              padding: [2, 6],
              borderRadius: 4,
            },
          };
        });

      const categories = Object.entries(LAYER_CONFIG)
        .filter(([k]) => k !== "default")
        .map(([key, conf]) => ({
          name: key,
          itemStyle: { color: conf.bg, borderColor: conf.color },
        }));

      return {
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(15,23,42,0.95)",
          borderColor: "#334155",
          textStyle: { color: "#e2e8f0", fontSize: 12 },
          formatter: (params) => {
            if (params.dataType === "node") {
              const conf = getLayerConfig(params.name);
              const cn = tableCn[params.name] || "";
              const inCount = (incoming.get(params.name) || []).length;
              const outCount = (outgoing.get(params.name) || []).length;
              return `
                <div style="font-weight:bold;font-size:13px;margin-bottom:4px;">${params.name}</div>
                ${cn ? `<div style="color:#94a3b8;margin-bottom:6px;">${cn}</div>` : ""}
                <div><span style="color:${conf.color};">●</span> ${conf.label} ${conf.name}</div>
                <div style="margin-top:4px;color:#94a3b8;">上游: ${inCount} | 下游: ${outCount}</div>
              `;
            } else if (params.dataType === "edge") {
              return `<div style="font-size:12px;">${params.data.source} → ${params.data.target}<br>${params.data.value || ""}</div>`;
            }
            return "";
          },
        },
        legend: [{ show: false, data: categories.map((c) => c.name) }],
        series: [
          {
            type: "graph",
            layout: "force",
            roam: true,
            draggable: true,
            focusNodeAdjacency: false,
            force: {
              repulsion: forceParams.repulsion,
              gravity: forceParams.gravity,
              edgeLength: forceParams.edgeLength,
              layoutAnimation: true,
            },
            edgeSymbol: ["none", "arrow"],
            edgeSymbolSize: [0, 8],
            data: nodes,
            links: links,
            categories: categories,
            lineStyle: { curveness: 0.1 },
            label: { position: "inside" },
            emphasis: {
              focus: "adjacency",
              lineStyle: { width: 3 },
            },
          },
        ],
      };
    }

    function renderChart(highlightId) {
      const option = buildOption(currentData, highlightId || selectedNode);
      chart.setOption(option, true);
    }

    function showDetail(nodeId) {
      const node = currentData.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const conf = getLayerConfig(nodeId);
      const cn = tableCn[nodeId] || node.cn || "";
      const incoming = currentRelations.incoming.get(nodeId) || [];
      const outgoing = currentRelations.outgoing.get(nodeId) || [];

      const renderList = (items, dir) => {
        if (!items.length) return `<p class="er-v2-detail-none">无${dir}</p>`;
        return `<ul class="er-v2-detail-list">${items
          .map((item) => {
            const peer = dir === "上游" ? item.from : item.to;
            const peerCn = tableCn[peer] || "";
            const lab = item.label ? `<code class="er-v2-link-label">${item.label}</code>` : "";
            return `<li>
              <button type="button" class="er-v2-jump-btn" data-jump="${peer}">
                <span class="er-v2-jump-name">${peer}</span>
                ${peerCn ? `<span class="er-v2-jump-cn">${peerCn}</span>` : ""}
              </button>
              ${lab}
            </li>`;
          })
          .join("")}</ul>`;
      };

      detailPanel.innerHTML = `
        <div class="er-v2-detail-header">
          <span class="er-v2-detail-badge" style="background:${conf.color}">${conf.label}</span>
          <div class="er-v2-detail-title">
            <div class="er-v2-detail-name">${nodeId}</div>
            ${cn ? `<div class="er-v2-detail-cn">${cn}</div>` : ""}
          </div>
          <button type="button" class="er-v2-detail-close" id="er-v2-detail-close">×</button>
        </div>
        <div class="er-v2-detail-body">
          <div class="er-v2-detail-section">
            <h5 class="er-v2-section-title">
              <span class="er-v2-section-icon">⬆️</span>
              上游表（${incoming.length}）
            </h5>
            ${renderList(incoming, "上游")}
          </div>
          <div class="er-v2-detail-section">
            <h5 class="er-v2-section-title">
              <span class="er-v2-section-icon">⬇️</span>
              下游表（${outgoing.length}）
            </h5>
            ${renderList(outgoing, "下游")}
          </div>
        </div>
      `;

      detailPanel.querySelectorAll("[data-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-jump");
          selectedNode = target;
          renderChart(target);
          showDetail(target);
        });
      });

      document.getElementById("er-v2-detail-close").addEventListener("click", () => {
        selectedNode = null;
        renderChart(null);
        detailPanel.innerHTML = `
          <div class="er-v2-detail-empty">
            <div class="er-v2-empty-icon">🔍</div>
            <p>点击图中的表节点查看详情</p>
            <p class="er-v2-empty-hint">支持拖拽节点 · 滚轮缩放 · 搜索定位</p>
          </div>
        `;
      });
    }

    // 节点点击事件
    chart.on("click", (params) => {
      if (params.dataType === "node") {
        selectedNode = params.name;
        renderChart(params.name);
        showDetail(params.name);
      }
    });

    // 视图切换
    root.querySelectorAll(".er-v2-view-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll(".er-v2-view-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const viewId = btn.getAttribute("data-view");
        if (viewId === "__all__") {
          currentData = merged;
        } else {
          const view = parsedViews.find((v) => v.id === viewId);
          if (view) {
            currentData = { nodes: view.nodes, links: view.links };
          }
        }
        currentRelations = buildRelations(currentData.nodes, currentData.links);
        selectedNode = null;
        renderChart(null);
        detailPanel.innerHTML = `
          <div class="er-v2-detail-empty">
            <div class="er-v2-empty-icon">🔍</div>
            <p>点击图中的表节点查看详情</p>
            <p class="er-v2-empty-hint">支持拖拽节点 · 滚轮缩放 · 搜索定位</p>
          </div>
        `;
      });
    });

    // 搜索
    let searchTimer = null;
    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        const keyword = searchInput.value.trim().toLowerCase();
        if (!keyword) {
          selectedNode = null;
          renderChart(null);
          return;
        }
        const matched = currentData.nodes.find(
          (n) =>
            n.id.toLowerCase().includes(keyword) ||
            (tableCn[n.id] || "").toLowerCase().includes(keyword) ||
            (n.cn || "").toLowerCase().includes(keyword)
        );
        if (matched) {
          selectedNode = matched.id;
          renderChart(matched.id);
          showDetail(matched.id);
        }
      }, 200);
    });

    // 分层筛选
    layerFilter.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        activeLayers.clear();
        layerFilter.querySelectorAll('input[type="checkbox"]:checked').forEach((c) => {
          activeLayers.add(c.value);
        });
        renderChart(null);
      });
    });

    // 缩放控制（用ECharts的dispatchAction）
    root.querySelectorAll(".er-v2-zoom-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        if (action === "zoomIn") {
          chart.dispatchAction({ type: "zoom", zoomScale: 1.2 });
        } else if (action === "zoomOut") {
          chart.dispatchAction({ type: "zoom", zoomScale: 0.8 });
        } else if (action === "reset") {
          chart.dispatchAction({ type: "restore" });
        }
      });
    });

    // 窗口resize
    window.addEventListener("resize", () => chart.resize());

    // 初始渲染
    renderChart(null);
  }

  // 注入CSS样式
  function injectStyles() {
    if (document.getElementById("er-v2-styles")) return;
    const style = document.createElement("style");
    style.id = "er-v2-styles";
    style.textContent = `
      .er-v2-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 12px;
        padding: 10px 14px;
        background: rgba(30,41,59,0.5);
        border: 1px solid rgba(71,85,105,0.4);
        border-radius: 10px;
      }
      .er-v2-toolbar-left, .er-v2-toolbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .er-v2-view-tabs {
        display: flex;
        gap: 4px;
        background: rgba(15,23,42,0.6);
        padding: 4px;
        border-radius: 8px;
      }
      .er-v2-view-tab {
        padding: 6px 14px;
        border: none;
        background: transparent;
        color: #94a3b8;
        font-size: 12px;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;
        font-family: inherit;
      }
      .er-v2-view-tab:hover { color: #e2e8f0; background: rgba(71,85,105,0.4); }
      .er-v2-view-tab.active {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: #fff;
        font-weight: 600;
      }
      .er-v2-search-input {
        padding: 7px 12px;
        background: rgba(15,23,42,0.8);
        border: 1px solid rgba(71,85,105,0.5);
        border-radius: 8px;
        color: #e2e8f0;
        font-size: 12px;
        width: 180px;
        outline: none;
        transition: border-color 0.2s;
        font-family: inherit;
      }
      .er-v2-search-input:focus { border-color: #3b82f6; }
      .er-v2-layer-filter {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .er-v2-filter-label { font-size: 12px; color: #94a3b8; }
      .er-v2-layer-check {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        font-size: 11px;
        color: #cbd5e1;
      }
      .er-v2-layer-check input { cursor: pointer; }
      .er-v2-layer-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .er-v2-zoom-controls {
        display: flex;
        gap: 4px;
      }
      .er-v2-zoom-btn {
        width: 30px;
        height: 30px;
        border: 1px solid rgba(71,85,105,0.5);
        background: rgba(15,23,42,0.8);
        color: #cbd5e1;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-family: inherit;
      }
      .er-v2-zoom-btn:hover { border-color: #3b82f6; color: #fff; }
      .er-v2-workspace {
        display: flex;
        gap: 12px;
        height: calc(100vh - 220px);
        min-height: 500px;
      }
      .er-v2-chart-wrap {
        flex: 1;
        background: radial-gradient(ellipse at center, rgba(30,41,59,0.3) 0%, rgba(15,23,42,0.6) 100%);
        border: 1px solid rgba(71,85,105,0.3);
        border-radius: 12px;
        min-height: 0;
      }
      .er-v2-detail-panel {
        width: 300px;
        flex-shrink: 0;
        background: rgba(30,41,59,0.5);
        border: 1px solid rgba(71,85,105,0.4);
        border-radius: 12px;
        overflow-y: auto;
        padding: 16px;
      }
      .er-v2-detail-empty {
        text-align: center;
        padding: 40px 20px;
        color: #64748b;
      }
      .er-v2-empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.5; }
      .er-v2-detail-empty p { margin: 4px 0; font-size: 13px; }
      .er-v2-empty-hint { font-size: 11px !important; color: #475569 !important; }
      .er-v2-detail-header {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(71,85,105,0.3);
      }
      .er-v2-detail-badge {
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .er-v2-detail-title { flex: 1; min-width: 0; }
      .er-v2-detail-name {
        font-size: 14px;
        font-weight: 700;
        color: #f1f5f9;
        font-family: "JetBrains Mono", Consolas, monospace;
        word-break: break-all;
      }
      .er-v2-detail-cn { font-size: 12px; color: #94a3b8; margin-top: 2px; }
      .er-v2-detail-close {
        background: none;
        border: none;
        color: #64748b;
        font-size: 20px;
        cursor: pointer;
        padding: 0 4px;
        line-height: 1;
      }
      .er-v2-detail-close:hover { color: #f87171; }
      .er-v2-detail-section { margin-bottom: 18px; }
      .er-v2-section-title {
        font-size: 12px;
        color: #cbd5e1;
        margin: 0 0 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .er-v2-section-icon { font-size: 12px; }
      .er-v2-detail-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .er-v2-detail-list li {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .er-v2-jump-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: rgba(15,23,42,0.6);
        border: 1px solid rgba(71,85,105,0.4);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
        flex: 1;
        min-width: 0;
      }
      .er-v2-jump-btn:hover {
        border-color: #3b82f6;
        background: rgba(59,130,246,0.1);
      }
      .er-v2-jump-name {
        font-size: 11px;
        color: #e2e8f0;
        font-family: "JetBrains Mono", Consolas, monospace;
      }
      .er-v2-jump-cn { font-size: 10px; color: #94a3b8; }
      .er-v2-link-label {
        font-size: 10px;
        color: #fbbf24;
        background: rgba(251,191,36,0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: "JetBrains Mono", Consolas, monospace;
      }
      .er-v2-detail-none {
        font-size: 11px;
        color: #475569;
        margin: 0;
        padding: 8px;
        text-align: center;
      }
      .er-v2-legend {
        display: flex;
        gap: 16px;
        margin-top: 12px;
        padding: 10px 14px;
        background: rgba(30,41,59,0.4);
        border-radius: 8px;
        flex-wrap: wrap;
      }
      .er-v2-legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: #94a3b8;
      }
      .er-v2-legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      .er-diagram-desc {
        color: #94a3b8;
        font-size: 13px;
        margin: 0 0 12px;
        line-height: 1.6;
      }
      .er-diagram-desc code {
        background: rgba(59,130,246,0.15);
        color: #93c5fd;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
      .er-diagram-desc strong { color: #cbd5e1; }
    `;
    document.head.appendChild(style);
  }

  global.ERDiagramInteractive = { render };
})(window);
