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
            layoutDirection: "TB",
            minEntityWidth: 240,
            minEntityHeight: 80,
            entityPadding: 24,
            useMaxWidth: false,
          },
        });
        return mermaid;
      })();
    }
    return mermaidReady;
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

  // ===== 美化实体框 =====
  function beautifyEntities(svgEl) {
    ensureSvgDefs(svgEl);

    // Mermaid erDiagram 中，实体通常是包含 rect 和 text 的 g 元素
    // 我们需要找到所有实体组并美化它们

    // 方法：找到所有 rect 元素，然后找到它们的父级 g 元素
    const rects = svgEl.querySelectorAll("rect");
    const processed = new Set();

    rects.forEach((rect) => {
      const parent = rect.parentElement;
      if (!parent || processed.has(parent)) return;

      // 找到实体名称文本
      const texts = parent.querySelectorAll("text");
      if (texts.length === 0) return;

      // 获取实体名称（优先匹配 dim_/ods_/dwd_/dws_/v_ 等表名；跳过 Mermaid 默认的 TABLE 标签）
      const SKIP_LABELS = new Set(["TABLE", "PK", "FK", "UK", "DIM", "ODS", "DWD", "DWS", "ADS", "FACT"]);
      let tableName = "";
      texts.forEach((t) => {
        const content = (t.textContent || "").trim();
        if (!content || content.includes(":") || SKIP_LABELS.has(content)) return;
        if (/^(dim_|ods_|dwd_|dws_|ads_|fact_|v_)/i.test(content) || content.includes("_")) {
          tableName = content;
        } else if (!tableName) {
          tableName = content;
        }
      });

      if (!tableName || SKIP_LABELS.has(tableName)) return;
      processed.add(parent);

      const colors = getLayerColor(tableName);

      // 美化矩形
      rect.setAttribute("fill", colors.fill);
      rect.setAttribute("stroke", colors.stroke);
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("rx", "10");
      rect.setAttribute("ry", "10");
      rect.style.filter = `drop-shadow(0 0 8px ${colors.glow})`;

      // 美化文本
      texts.forEach((t) => {
        t.setAttribute("fill", colors.text);
        t.style.fontWeight = "600";
      });

      // 添加类型徽章（在实体左上角）
      const x = parseFloat(rect.getAttribute("x") || "0");
      const y = parseFloat(rect.getAttribute("y") || "0");
      const width = parseFloat(rect.getAttribute("width") || "100");

      // 徽章背景
      const badgeRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      badgeRect.setAttribute("x", x + 8);
      badgeRect.setAttribute("y", y - 10);
      badgeRect.setAttribute("width", "48");
      badgeRect.setAttribute("height", "20");
      badgeRect.setAttribute("rx", "4");
      badgeRect.setAttribute("ry", "4");
      badgeRect.setAttribute("fill", colors.badgeBg);
      badgeRect.style.filter = `drop-shadow(0 1px 3px ${colors.glow})`;

      // 徽章文字
      const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      badgeText.setAttribute("x", x + 32);
      badgeText.setAttribute("y", y + 4);
      badgeText.setAttribute("text-anchor", "middle");
      badgeText.setAttribute("fill", colors.badgeText);
      badgeText.setAttribute("font-size", "11");
      badgeText.setAttribute("font-weight", "700");
      badgeText.setAttribute("font-family", '"JetBrains Mono", Consolas, monospace');
      badgeText.textContent = colors.label;

      // 插入到父组中（在 rect 之后，text 之前）
      parent.insertBefore(badgeRect, rect.nextSibling);
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

    // 按 viewBox 放大一档，保证长表名可读；并设下限避免缩回窄栏
    const targetW = vbW ? Math.max(Math.round(vbW * 1.4), 1800) : 2000;

    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    svgEl.style.maxWidth = "none";
    svgEl.style.width = targetW + "px";
    svgEl.style.minWidth = targetW + "px";
    svgEl.style.height = "auto";
    svgEl.setAttribute("width", String(targetW));

    // 美化实体和关系（失败不影响主图显示）
    try {
      beautifyEntities(svgEl);
      beautifyRelations(svgEl);
    } catch (err) {
      console.warn("ER beautify skipped", err);
    }

    // 当前字号缩放比例
    const fontScale = FONT_SCALES[currentFontIdx].scale;
    const baseSize = 16 * fontScale;       // 普通文字基线（原15）
    const entitySize = 18 * fontScale;     // 实体名称（原17）
    const badgeSize = 12 * fontScale;      // 徽章文字（原11）
    const relationSize = 13 * fontScale;   // 关系标签（原12）

    // 统一文字样式
    svgEl.querySelectorAll("text").forEach((t) => {
      const current = parseFloat(t.getAttribute("font-size") || "12");
      const next = Math.max(current, baseSize);
      t.setAttribute("font-size", String(next));
      t.style.fontSize = next + "px";
      t.style.fontFamily = '"JetBrains Mono", Consolas, "Microsoft YaHei", monospace';
    });

    // 实体名称文字加粗加大
    svgEl.querySelectorAll(".entityLabel text, g.entityLabel text, .label text").forEach((t) => {
      t.setAttribute("font-size", String(entitySize));
      t.style.fontSize = entitySize + "px";
      t.style.fontWeight = "700";
    });

    // 徽章文字大小
    svgEl.querySelectorAll("text").forEach((t) => {
      const content = t.textContent.trim();
      if (["DIM", "ODS", "DWD", "DWS", "ADS", "FACT"].includes(content)) {
        t.setAttribute("font-size", String(badgeSize));
        t.style.fontSize = badgeSize + "px";
      }
    });

    // 给 SVG 添加背景渐变效果
    svgEl.style.background = "radial-gradient(ellipse at center, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%)";
    svgEl.style.borderRadius = "12px";
  }

  function attachPanZoom(viewport, stage) {
    let zoom = 1.25;
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
        else if (action === "reset") setZoom(1.25);
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
      if (e.target.closest("a, button, input, textarea, select")) return;
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

  async function renderMermaidInto(mermaidRoot, source, title) {
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
        <p class="er-diagram-tip">💡 提示：按住鼠标左键拖动查看完整表名；+/− 或 Ctrl + 滚轮缩放；A−/A+ 调节字号；多视图时切换上方标签可降低图密度。</p>
        <div class="er-toolbar-right">
          <div class="er-font-controls" role="group" aria-label="字号调节">
            <button type="button" class="er-font-btn" data-er-font="out" title="减小字号">A−</button>
            <span class="er-font-label" data-er-font-label>${FONT_SCALES[DEFAULT_FONT_IDX].label}</span>
            <button type="button" class="er-font-btn" data-er-font="in" title="增大字号">A+</button>
          </div>
          <div class="er-zoom-controls" role="group" aria-label="ER 图缩放">
            <button type="button" class="er-zoom-btn" data-er-zoom="out" title="缩小">−</button>
            <span class="er-zoom-label" data-er-zoom-label>125%</span>
            <button type="button" class="er-zoom-btn" data-er-zoom="in" title="放大">+</button>
            <button type="button" class="er-zoom-btn er-zoom-reset" data-er-zoom="reset" title="重置">重置</button>
          </div>
        </div>
      </div>
      <div class="er-diagram-viewport" id="er-mermaid-viewport">
        <div class="er-diagram-stage" id="er-mermaid-stage">
          <div class="er-diagram-mermaid" id="er-mermaid-svg-root"></div>
        </div>
      </div>
    `;

    const viewport = document.getElementById("er-mermaid-viewport");
    const stage = document.getElementById("er-mermaid-stage");
    const mermaidRoot = document.getElementById("er-mermaid-svg-root");
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
      await renderMermaidInto(mermaidRoot, view.mermaid, view.name || cfg.title);
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
