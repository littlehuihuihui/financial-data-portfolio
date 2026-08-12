/**
 * 实体关系图渲染（Mermaid erDiagram）
 * 依赖：er-diagram-data.js 中的 window.ER_DIAGRAM
 * 支持 cfg.views[] 多图切换；无 views 时回退 cfg.mermaid
 * 支持缩放控件，避免 SVG 被压进窄栏导致表名看不清
 *
 * 美化特性：
 * - 按表类型分层配色（dim/ods/dwd/dws/ads 不同色系）
 * - 实体框圆角 + 渐变背景 + 发光阴影
 * - 关系线样式优化（渐变 + 箭头美化）
 * - 实体类型标签（左上角小徽章）
 */
(function (global) {
  // jsDelivr 在部分网络会失败；按序回退国内/备用 CDN
  const MERMAID_CDNS = [
    "https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js",
    "https://unpkg.com/mermaid@10.9.1/dist/mermaid.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js",
    "https://cdn.bootcdn.net/ajax/libs/mermaid/10.9.1/mermaid.min.js",
  ];
  const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2];
  const DEFAULT_ZOOM = 1; // LR 布局默认 100%，横向空间更大
  // 字号档位：标签 + 缩放比例
  const FONT_SCALES = [
    { label: "小", scale: 0.85 },
    { label: "标准", scale: 1 },
    { label: "大", scale: 1.18 },
    { label: "特大", scale: 1.4 },
  ];
  const DEFAULT_FONT_IDX = 1; // 默认"标准"档
  let mermaidReady = null;
  let currentFontIdx = DEFAULT_FONT_IDX;

  const TABLE_CN = {
    dim_brand: "品牌维",
    dim_channel: "渠道维",
    dim_category: "品类维",
    dim_store: "门店维",
    dim_date: "日期维",
    ods_orders: "订单贴源",
    ods_payment: "支付贴源",
    ods_expense: "费用贴源",
    ods_inventory: "库存贴源",
    ods_purchase: "采购贴源",
    dwd_sales_wide: "销售宽表",
    dwd_expense_wide: "费用宽表",
    dwd_inventory_wide: "库存宽表",
    dws_sales_daily: "销售日汇总",
    dws_sales_monthly: "销售月汇总",
    dws_expense_monthly: "费用月汇总",
    dws_inventory_daily: "库存日汇总",
    dws_store_daily: "门店日汇总",
    v_overview: "经营总览",
    v_dupont: "杜邦分析",
    v_budget: "预算分析",
    v_inventory: "库存分析",
  };

  function tableCn(name) {
    const extra = (global.ER_DIAGRAM && global.ER_DIAGRAM.tableCn) || {};
    return extra[name] || TABLE_CN[name] || "";
  }

  // ===== 表类型配色方案 =====
  const LAYER_COLORS = {
    dim: {
      label: "DIM",
      fill: "rgba(56, 189, 248, 0.12)",
      stroke: "#38bdf8",
      glow: "rgba(56, 189, 248, 0.35)",
      text: "#e0f2fe",
      badgeBg: "#0ea5e9",
      badgeText: "#fff",
    },
    ods: {
      label: "ODS",
      fill: "rgba(148, 163, 184, 0.10)",
      stroke: "#94a3b8",
      glow: "rgba(148, 163, 184, 0.25)",
      text: "#e2e8f0",
      badgeBg: "#64748b",
      badgeText: "#fff",
    },
    dwd: {
      label: "DWD",
      fill: "rgba(52, 211, 153, 0.12)",
      stroke: "#34d399",
      glow: "rgba(52, 211, 153, 0.35)",
      text: "#d1fae5",
      badgeBg: "#10b981",
      badgeText: "#fff",
    },
    dws: {
      label: "DWS",
      fill: "rgba(167, 139, 250, 0.12)",
      stroke: "#a78bfa",
      glow: "rgba(167, 139, 250, 0.35)",
      text: "#ede9fe",
      badgeBg: "#8b5cf6",
      badgeText: "#fff",
    },
    ads: {
      label: "ADS",
      fill: "rgba(251, 191, 36, 0.12)",
      stroke: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.35)",
      text: "#fef3c7",
      badgeBg: "#f59e0b",
      badgeText: "#fff",
    },
    fact: {
      label: "FACT",
      fill: "rgba(45, 212, 191, 0.12)",
      stroke: "#2dd4bf",
      glow: "rgba(45, 212, 191, 0.35)",
      text: "#ccfbf1",
      badgeBg: "#14b8a6",
      badgeText: "#fff",
    },
    default: {
      label: "TABLE",
      fill: "rgba(71, 85, 105, 0.15)",
      stroke: "#64748b",
      glow: "rgba(71, 85, 105, 0.25)",
      text: "#e2e8f0",
      badgeBg: "#475569",
      badgeText: "#fff",
    },
  };

  // 根据表名判断类型
  function detectLayer(tableName) {
    const name = tableName.toLowerCase().trim();
    if (name.startsWith("dim_")) return "dim";
    if (name.startsWith("ods_")) return "ods";
    if (name.startsWith("dwd_")) return "dwd";
    if (name.startsWith("dws_")) return "dws";
    if (name.startsWith("v_") || name.startsWith("ads_")) return "ads";
    if (name.startsWith("fact_")) return "fact";
    return "default";
  }

  function getLayerColor(tableName) {
    return LAYER_COLORS[detectLayer(tableName)] || LAYER_COLORS.default;
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

  function loadMermaid() {
    if (!mermaidReady) {
      mermaidReady = (async () => {
        if (!global.mermaid) {
          let lastErr = null;
          for (const src of MERMAID_CDNS) {
            try {
              await loadScript(src);
              if (global.mermaid) break;
            } catch (err) {
              lastErr = err;
            }
          }
          if (!global.mermaid) {
            throw lastErr || new Error("Mermaid CDN load failed (all mirrors)");
          }
        }
        const mermaid = global.mermaid;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          themeVariables: {
            fontSize: "18px",
            fontFamily: "JetBrains Mono, Consolas, Microsoft YaHei, monospace",
            primaryTextColor: "#e2e8f0",
            lineColor: "#64748b",
            primaryColor: "#1e293b",
            primaryBorderColor: "#475569",
            secondaryColor: "#0f172a",
            tertiaryColor: "#1e293b",
          },
          er: {
            diagramPadding: 50,
            layoutDirection: "LR",
            minEntityWidth: 240,
            minEntityHeight: 80,
            entityPadding: 24,
            useMaxWidth: false,
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 28,
            nodeSpacing: 28,
            rankSpacing: 88,
            useMaxWidth: false,
          },
        });
        return mermaid;
      })();
    }
    return mermaidReady;
  }

  /** 解析 mermaid flowchart 边：A -->|label| B */
  function parseMermaidGraph(source) {
    const outgoing = new Map();
    const incoming = new Map();
    const ensure = (m, k) => {
      if (!m.has(k)) m.set(k, []);
      return m.get(k);
    };
    const re = /([A-Za-z_][\w]*)\s*-->\s*(?:\|([^|]+)\|)?\s*([A-Za-z_][\w]*)/g;
    let m;
    while ((m = re.exec(source || ""))) {
      const from = m[1];
      const label = (m[2] || "").trim();
      const to = m[3];
      ensure(outgoing, from).push({ to, label });
      ensure(incoming, to).push({ from, label });
    }
    return { outgoing, incoming };
  }

  // ===== SVG 滤镜定义（发光效果） =====
  function ensureSvgDefs(svgEl) {
    let defs = svgEl.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svgEl.insertBefore(defs, svgEl.firstChild);
    }

    // 检查是否已有滤镜
    if (defs.querySelector("#er-glow-filter")) return defs;

    // 发光滤镜
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "er-glow-filter");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    feGaussianBlur.setAttribute("stdDeviation", "3");
    feGaussianBlur.setAttribute("result", "coloredBlur");

    const feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
    const feMergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    feMergeNode1.setAttribute("in", "coloredBlur");
    const feMergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    feMergeNode2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);

    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);

    return defs;
  }

  function extractTableName(node) {
    const SKIP = new Set([
      "TABLE", "PK", "FK", "UK", "DIM", "ODS", "DWD", "DWS", "ADS", "FACT",
    ]);
    const fromId = (node.getAttribute("id") || "")
      .replace(/^flowchart-/, "")
      .replace(/-\d+$/, "");
    if (/^(dim_|ods_|dwd_|dws_|ads_|fact_|v_)/i.test(fromId)) return fromId;

    const texts = node.querySelectorAll("text, .nodeLabel, span");
    let tableName = "";
    texts.forEach((t) => {
      const content = (t.textContent || "").trim();
      if (!content || content.includes(":") || SKIP.has(content)) return;
      if (/层$/.test(content) || content.includes(" ")) return; // 跳过 subgraph 标题
      if (/^(dim_|ods_|dwd_|dws_|ads_|fact_|v_)/i.test(content) || content.includes("_")) {
        tableName = content;
      } else if (!tableName) {
        tableName = content;
      }
    });
    if (!tableName || SKIP.has(tableName)) return "";
    return tableName;
  }

  // ===== 美化实体框（兼容 erDiagram + flowchart） =====
  function beautifyEntities(svgEl) {
    ensureSvgDefs(svgEl);
    const processed = new Set();
    const candidates = svgEl.querySelectorAll("g.node, g.er.entityBox, g[id^='entity-']");
    const nodes = candidates.length ? candidates : svgEl.querySelectorAll("g");

    nodes.forEach((parent) => {
      if (!parent || processed.has(parent)) return;
      if (parent.classList && parent.classList.contains("cluster")) return;
      const shape = parent.querySelector("rect") || parent.querySelector("polygon");
      if (!shape) return;

      const tableName = extractTableName(parent);
      if (!tableName) return;
      processed.add(parent);

      const colors = getLayerColor(tableName);
      const texts = parent.querySelectorAll("text");
      parent.dataset.erTable = tableName;
      parent.style.cursor = "pointer";
      parent.classList.add("er-node");

      shape.setAttribute("fill", colors.fill);
      shape.setAttribute("stroke", colors.stroke);
      shape.setAttribute("stroke-width", "2");
      if (shape.tagName.toLowerCase() === "rect") {
        shape.setAttribute("rx", "10");
        shape.setAttribute("ry", "10");
      }
      shape.style.filter = `drop-shadow(0 0 8px ${colors.glow})`;

      texts.forEach((t) => {
        t.setAttribute("fill", colors.text);
        t.style.fontWeight = "600";
      });

      const x = parseFloat(shape.getAttribute("x") || "0");
      const y = parseFloat(shape.getAttribute("y") || "0");
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const badgeRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      badgeRect.setAttribute("x", x + 8);
      badgeRect.setAttribute("y", y - 10);
      badgeRect.setAttribute("width", "48");
      badgeRect.setAttribute("height", "20");
      badgeRect.setAttribute("rx", "4");
      badgeRect.setAttribute("ry", "4");
      badgeRect.setAttribute("fill", colors.badgeBg);
      badgeRect.style.filter = `drop-shadow(0 1px 3px ${colors.glow})`;

      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", x + 32);
      badgeText.setAttribute("y", y + 4);
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("fill", colors.badgeText);
      badgeText.setAttribute("font-size", "11");
      badgeText.setAttribute("font-weight", "700");
      badgeText.setAttribute("font-family", '"JetBrains Mono", Consolas, monospace');
      badgeText.textContent = colors.label;

      parent.insertBefore(badgeRect, shape.nextSibling);
      parent.insertBefore(badgeText, badgeRect.nextSibling);
    });
  }

  // ===== 美化关系线 =====
  function beautifyRelations(svgEl) {
    // 美化关系线（path 和 line 元素）
    const paths = svgEl.querySelectorAll("path");
    paths.forEach((path) => {
      const stroke = path.getAttribute("stroke");
      // 只处理看起来像关系线的路径（有 stroke 且不是透明的）
      if (stroke && stroke !== "none" && stroke !== "transparent") {
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        // 给线条添加一点透明度渐变效果
        path.style.opacity = "0.85";
      }
    });

    // 美化关系标签
    const relationLabels = svgEl.querySelectorAll(".er.relationshipLabel, .relationshipLabel");
    relationLabels.forEach((label) => {
      const texts = label.querySelectorAll("text");
      texts.forEach((t) => {
        t.setAttribute("fill", "#94a3b8");
        t.setAttribute("font-size", "12");
        t.style.fontWeight = "500";
      });
    });
  }

  function enhanceSvgReadability(svgEl) {
    if (!svgEl) return;

    const vb = (svgEl.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
    const vbW = vb.length === 4 && vb[2] > 0 ? vb[2] : 0;
    const vbH = vb.length === 4 && vb[3] > 0 ? vb[3] : 0;

    // LR 布局偏宽：按 viewBox 放大，保证可读
    const targetW = vbW ? Math.max(Math.round(vbW * 1.25), 1600) : 2000;

    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    svgEl.style.maxWidth = "none";
    svgEl.style.width = targetW + "px";
    svgEl.style.minWidth = targetW + "px";
    svgEl.style.height = "auto";
    svgEl.setAttribute("width", String(targetW));
    if (vbH) {
      const targetH = Math.max(Math.round(vbH * 1.15), 480);
      svgEl.setAttribute("height", String(targetH));
    }

    // 美化实体和关系（失败不影响主图显示）
    try {
      beautifyEntities(svgEl);
      beautifyRelations(svgEl);
    } catch (err) {
      console.warn("ER beautify skipped", err);
    }

    const fontScale = FONT_SCALES[currentFontIdx].scale;
    const baseSize = 16 * fontScale;
    const entitySize = 18 * fontScale;
    const badgeSize = 12 * fontScale;
    svgEl.querySelectorAll("text").forEach((t) => {
      const current = parseFloat(t.getAttribute("font-size") || "12");
      const next = Math.max(current, baseSize);
      t.setAttribute("font-size", String(next));
      t.style.fontSize = next + "px";
      t.style.fontFamily = '"JetBrains Mono", Consolas, "Microsoft YaHei", monospace';
    });
    svgEl.querySelectorAll(".entityLabel text, g.entityLabel text, .label text, .nodeLabel, foreignObject div").forEach((t) => {
      if (t.tagName && t.tagName.toLowerCase() === "text") {
        t.setAttribute("font-size", String(entitySize));
        t.style.fontSize = entitySize + "px";
        t.style.fontWeight = "700";
      }
    });
    svgEl.querySelectorAll("text").forEach((t) => {
      const content = (t.textContent || "").trim();
      if (["DIM", "ODS", "DWD", "DWS", "ADS", "FACT"].includes(content)) {
        t.setAttribute("font-size", String(badgeSize));
        t.style.fontSize = badgeSize + "px";
      }
    });
    svgEl.style.background = "radial-gradient(ellipse at center, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%)";
    svgEl.style.borderRadius = "12px";
  }

  function attachNodeInteraction(svgEl, source, panelEl) {
    if (!svgEl || !panelEl) return;
    const graph = parseMermaidGraph(source);
    const nodeMap = new Map();
    svgEl.querySelectorAll("g.node, g.er-node, g[data-er-table]").forEach((g) => {
      const name = g.dataset.erTable || extractTableName(g);
      if (!name) return;
      g.dataset.erTable = name;
      g.style.cursor = "pointer";
      nodeMap.set(name, g);
    });

    const emptyHtml =
      '<div class="er-detail-empty">点击左侧节点查看：层级、中文名、上游 / 下游与关联键。ESC 或点空白取消。</div>';

    function clearFocus() {
      svgEl.classList.remove("er-has-focus");
      nodeMap.forEach((g) => {
        g.classList.remove("er-node-active", "er-node-related", "er-node-dimmed");
      });
      panelEl.innerHTML = emptyHtml;
    }

    function listHtml(rows, dir) {
      if (!rows.length) return `<p class="er-detail-none">无${dir}</p>`;
      return `<ul class="er-detail-list">${rows
        .map((r) => {
          const peer = dir === "上游" ? r.from : r.to;
          const cn = tableCn(peer);
          const lab = r.label ? `<code>${r.label}</code>` : "";
          return `<li><button type="button" class="er-detail-jump" data-er-jump="${peer}">${peer}${cn ? ` · ${cn}` : ""}</button> ${lab}</li>`;
        })
        .join("")}</ul>`;
    }

    function focusTable(name) {
      if (!nodeMap.has(name)) return;
      const layer = detectLayer(name);
      const colors = getLayerColor(name);
      const ups = graph.incoming.get(name) || [];
      const downs = graph.outgoing.get(name) || [];
      const related = new Set([name, ...ups.map((e) => e.from), ...downs.map((e) => e.to)]);
      svgEl.classList.add("er-has-focus");
      nodeMap.forEach((g, n) => {
        g.classList.remove("er-node-active", "er-node-related", "er-node-dimmed");
        if (n === name) g.classList.add("er-node-active");
        else if (related.has(n)) g.classList.add("er-node-related");
        else g.classList.add("er-node-dimmed");
      });
      const cn = tableCn(name);
      panelEl.innerHTML = `
        <div class="er-detail-head">
          <span class="er-detail-badge" style="background:${colors.badgeBg}">${colors.label}</span>
          <div>
            <div class="er-detail-name">${name}</div>
            ${cn ? `<div class="er-detail-cn">${cn}</div>` : ""}
          </div>
        </div>
        <div class="er-detail-section"><h5>上游（${ups.length}）</h5>${listHtml(ups, "上游")}</div>
        <div class="er-detail-section"><h5>下游（${downs.length}）</h5>${listHtml(downs, "下游")}</div>
        <p class="er-detail-hint">点上下游名称可跳转焦点；「全量血缘」在架构页 ETL 区可继续溯源。</p>
      `;
      panelEl.querySelectorAll("[data-er-jump]").forEach((btn) => {
        btn.addEventListener("click", () => focusTable(btn.getAttribute("data-er-jump")));
      });
    }

    clearFocus();
    svgEl.addEventListener("click", (e) => {
      const g = e.target.closest("g.node, g[data-er-table]");
      if (!g || !g.dataset.erTable) {
        clearFocus();
        return;
      }
      e.stopPropagation();
      focusTable(g.dataset.erTable);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") clearFocus();
    });
  }

  async function renderMermaidInto(mermaidRoot, source, title, panelEl) {
    const mermaid = await loadMermaid();
    const id = "er-svg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    try {
      const { svg } = await mermaid.render(id, source.trim());
      mermaidRoot.innerHTML = svg;
      const svgEl = mermaidRoot.querySelector("svg");
      if (svgEl) {
        svgEl.setAttribute("role", "img");
        svgEl.setAttribute("aria-label", title || "实体关系图");
        enhanceSvgReadability(svgEl);
        attachNodeInteraction(svgEl, source, panelEl);
      }
    } catch (err) {
      const msg = (err && err.message) ? String(err.message) : String(err);
      mermaidRoot.innerHTML =
        `<p class="er-diagram-fallback">ER 图加载失败：${msg}<br>` +
        `若提示 CDN / network，请换网络或关闭拦截后刷新（已自动尝试多个镜像）。` +
        `<details><summary>查看 Mermaid 源码</summary><pre>${source}</pre></details></p>`;
      console.error("ER diagram render failed", err);
    }
  }

  function attachPanZoom(viewport, stage) {
    let zoom = DEFAULT_ZOOM;
    const label = viewport.parentElement.querySelector("[data-er-zoom-label]");
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    function apply() {
      stage.style.transform = `scale(${zoom})`;
      if (label) label.textContent = Math.round(zoom * 100) + "%";
    }

    function setZoom(next) {
      const clamped = Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], next));
      zoom = ZOOM_STEPS.reduce((best, step) =>
        Math.abs(step - clamped) < Math.abs(best - clamped) ? step : best
      );
      apply();
    }

    viewport.parentElement.querySelectorAll("[data-er-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-er-zoom");
        const idx = ZOOM_STEPS.indexOf(zoom);
        if (action === "in") setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, idx + 1)]);
        else if (action === "out") setZoom(ZOOM_STEPS[Math.max(0, idx - 1)]);
        else if (action === "reset") setZoom(DEFAULT_ZOOM);
      });
    });

    viewport.addEventListener(
      "wheel",
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const idx = ZOOM_STEPS.indexOf(zoom);
        if (e.deltaY < 0) setZoom(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, idx + 1)]);
        else setZoom(ZOOM_STEPS[Math.max(0, idx - 1)]);
      },
      { passive: false }
    );

    // 按住左键拖动画布（平移滚动）
    viewport.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (e.target.closest("a, button, input, textarea, select, g.node, g[data-er-table]")) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      viewport.classList.add("is-panning");
      try {
        viewport.setPointerCapture(e.pointerId);
      } catch (_) {}
      e.preventDefault();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      viewport.scrollLeft = startLeft - dx;
      viewport.scrollTop = startTop - dy;
    });

    function endPan(e) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-panning");
      try {
        if (e && e.pointerId != null) viewport.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    viewport.addEventListener("pointerup", endPan);
    viewport.addEventListener("pointercancel", endPan);
    viewport.addEventListener("pointerleave", (e) => {
      if (dragging && e.buttons === 0) endPan(e);
    });

    // 拖动时避免误选中文字
    viewport.addEventListener("dragstart", (e) => e.preventDefault());
    viewport.addEventListener("click", (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);

    apply();
    return { setZoom };
  }

  // ===== 字号调节 =====
  function attachFontSize(root, onFontChange) {
    const label = root.querySelector("[data-er-font-label]");

    function apply() {
      if (label) label.textContent = FONT_SCALES[currentFontIdx].label;
    }

    function setFontIdx(idx) {
      const clamped = Math.min(FONT_SCALES.length - 1, Math.max(0, idx));
      if (clamped === currentFontIdx) return;
      currentFontIdx = clamped;
      apply();
      if (onFontChange) onFontChange();
    }

    root.querySelectorAll("[data-er-font]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-er-font");
        if (action === "in") setFontIdx(currentFontIdx + 1);
        else if (action === "out") setFontIdx(currentFontIdx - 1);
      });
    });

    apply();
    return { setFontIdx };
  }

  // ===== 生成分层配色图例 =====
  function renderLayerLegend() {
    const layers = [
      { key: "dim", label: "DIM 维度层" },
      { key: "ods", label: "ODS 原始层" },
      { key: "dwd", label: "DWD 明细层" },
      { key: "dws", label: "DWS 汇总层" },
      { key: "ads", label: "ADS 应用层" },
      { key: "fact", label: "FACT 事实表" },
    ];

    const badges = layers
      .map(
        (l) =>
          `<span class="er-layer-badge er-layer-badge-${l.key}">${l.label}</span>`
      )
      .join("");

    return `
      <div class="er-diagram-layer-legend">
        <span class="er-layer-legend-title">分层配色：</span>
        ${badges}
      </div>
    `;
  }

  async function render(containerId) {
    const cfg = global.ER_DIAGRAM;
    const root = document.getElementById(containerId);
    if (!cfg || !root) return;

    const legendHtml = (cfg.legend || [])
      .map((item) => `<span class="er-legend-item">${item}</span>`)
      .join("");

    const views = Array.isArray(cfg.views) && cfg.views.length
      ? cfg.views
      : [{ id: "default", name: cfg.title || "ER", mermaid: cfg.mermaid }];

    const tabsHtml =
      views.length > 1
        ? `<div class="er-view-tabs" role="tablist">${views
            .map(
              (v, i) =>
                `<button type="button" class="er-view-tab${i === 0 ? " active" : ""}" data-er-view="${v.id}" role="tab" aria-selected="${i === 0}">${v.name}</button>`
            )
            .join("")}</div>`
        : "";

    root.innerHTML = `
      ${cfg.description ? `<p class="er-diagram-desc">${cfg.description}</p>` : ""}
      ${renderLayerLegend()}
      ${legendHtml ? `<div class="er-diagram-legend">${legendHtml}</div>` : ""}
      ${tabsHtml}
      <div class="er-diagram-toolbar">
        <p class="er-diagram-tip">左→右分层列；点击表节点查看上下游与关联键；按住拖动平移；Ctrl+滚轮缩放。</p>
        <div class="er-toolbar-right">
          <div class="er-font-controls" role="group" aria-label="字号调节">
            <button type="button" class="er-font-btn" data-er-font="out" title="减小字号">A−</button>
            <span class="er-font-label" data-er-font-label>${FONT_SCALES[DEFAULT_FONT_IDX].label}</span>
            <button type="button" class="er-font-btn" data-er-font="in" title="增大字号">A+</button>
          </div>
          <div class="er-zoom-controls" role="group" aria-label="ER 图缩放">
            <button type="button" class="er-zoom-btn" data-er-zoom="out" title="缩小">−</button>
            <span class="er-zoom-label" data-er-zoom-label>100%</span>
            <button type="button" class="er-zoom-btn" data-er-zoom="in" title="放大">+</button>
            <button type="button" class="er-zoom-btn er-zoom-reset" data-er-zoom="reset" title="重置">重置</button>
          </div>
        </div>
      </div>
      <div class="er-diagram-workspace">
        <div class="er-diagram-viewport" id="er-mermaid-viewport">
          <div class="er-diagram-stage" id="er-mermaid-stage">
            <div class="er-diagram-mermaid" id="er-mermaid-svg-root"></div>
          </div>
        </div>
        <aside class="er-diagram-detail" id="er-detail-panel" aria-live="polite">
          <div class="er-detail-empty">点击节点查看：层级、中文名、上游 / 下游与关联键。</div>
        </aside>
      </div>
    `;

    const viewport = document.getElementById("er-mermaid-viewport");
    const stage = document.getElementById("er-mermaid-stage");
    const mermaidRoot = document.getElementById("er-mermaid-svg-root");
    const panelEl = document.getElementById("er-detail-panel");
    const byId = Object.fromEntries(views.map((v) => [v.id, v]));
    attachPanZoom(viewport, stage);

    let currentViewId = views[0].id;

    async function show(viewId) {
      currentViewId = viewId;
      const view = byId[viewId] || views[0];
      root.querySelectorAll(".er-view-tab").forEach((btn) => {
        const on = btn.getAttribute("data-er-view") === view.id;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      await renderMermaidInto(mermaidRoot, view.mermaid, view.name || cfg.title, panelEl);
    }

    // 字号改变时重新渲染当前视图
    attachFontSize(root, () => show(currentViewId));

    root.querySelectorAll(".er-view-tab").forEach((btn) => {
      btn.addEventListener("click", () => show(btn.getAttribute("data-er-view")));
    });

    await show(views[0].id);
  }

  global.ERDiagramUI = { render };
})(window);
