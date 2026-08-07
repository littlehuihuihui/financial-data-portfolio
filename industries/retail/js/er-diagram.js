/**
 * 实体关系图渲染（Mermaid erDiagram）
 * 依赖：er-diagram-data.js 中的 window.ER_DIAGRAM
 * 支持 cfg.views[] 多图切换；无 views 时回退 cfg.mermaid
 * 支持缩放控件，避免 SVG 被压进窄栏导致表名看不清
 */
(function (global) {
  const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
  const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2];
  let mermaidReady = null;

  function loadMermaid() {
    if (!mermaidReady) {
      mermaidReady = new Promise((resolve, reject) => {
        if (global.mermaid) {
          resolve(global.mermaid);
          return;
        }
        const s = document.createElement("script");
        s.src = MERMAID_CDN;
        s.onload = () => resolve(global.mermaid);
        s.onerror = () => reject(new Error("Mermaid CDN load failed"));
        document.head.appendChild(s);
      }).then((mermaid) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          themeVariables: {
            fontSize: "18px",
            fontFamily: "JetBrains Mono, Consolas, Microsoft YaHei, monospace",
            primaryTextColor: "#e2e8f0",
            lineColor: "#94a3b8",
            primaryColor: "#1e293b",
            primaryBorderColor: "#38bdf8",
            secondaryColor: "#0f172a",
            tertiaryColor: "#1e293b",
          },
          er: {
            diagramPadding: 40,
            layoutDirection: "TB",
            minEntityWidth: 220,
            minEntityHeight: 72,
            entityPadding: 22,
            useMaxWidth: false,
          },
        });
        return mermaid;
      });
    }
    return mermaidReady;
  }

  function enhanceSvgReadability(svgEl) {
    if (!svgEl) return;

    const vb = (svgEl.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
    const vbW = vb.length === 4 && vb[2] > 0 ? vb[2] : 0;
    // 按 viewBox 放大一档，保证长表名可读；并设下限避免缩回窄栏
    const targetW = vbW ? Math.max(Math.round(vbW * 1.35), 1600) : 1800;

    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    svgEl.style.maxWidth = "none";
    svgEl.style.width = targetW + "px";
    svgEl.style.minWidth = targetW + "px";
    svgEl.style.height = "auto";
    svgEl.setAttribute("width", String(targetW));

    svgEl.querySelectorAll("text").forEach((t) => {
      const current = parseFloat(t.getAttribute("font-size") || "12");
      const next = Math.max(current, 16);
      t.setAttribute("font-size", String(next));
      t.style.fontSize = next + "px";
      t.style.fontWeight = "600";
      t.style.fontFamily = '"JetBrains Mono", Consolas, "Microsoft YaHei", monospace';
    });
    svgEl.querySelectorAll(".entityLabel text, g.entityLabel text, .label text").forEach((t) => {
      t.setAttribute("font-size", "18");
      t.style.fontSize = "18px";
      t.style.fontWeight = "700";
    });
  }

  function attachZoom(viewport, stage) {
    let zoom = 1.25;
    const label = viewport.parentElement.querySelector("[data-er-zoom-label]");

    function apply() {
      stage.style.transform = `scale(${zoom})`;
      if (label) label.textContent = Math.round(zoom * 100) + "%";
    }

    function setZoom(next) {
      const clamped = Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], next));
      // snap to nearest step
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

    apply();
    return { setZoom };
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
      mermaidRoot.innerHTML =
        `<p class="er-diagram-fallback">ER 图加载失败，请检查网络后刷新。` +
        `<details><summary>查看 Mermaid 源码</summary><pre>${source}</pre></details></p>`;
      console.error("ER diagram render failed", err);
    }
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
      ${legendHtml ? `<div class="er-diagram-legend">${legendHtml}</div>` : ""}
      ${tabsHtml}
      <div class="er-diagram-toolbar">
        <p class="er-diagram-tip">提示：可拖动滚动条查看完整表名；Ctrl + 滚轮缩放；多视图时切换上方标签可降低图密度。</p>
        <div class="er-zoom-controls" role="group" aria-label="ER 图缩放">
          <button type="button" class="er-zoom-btn" data-er-zoom="out" title="缩小">−</button>
          <span class="er-zoom-label" data-er-zoom-label>125%</span>
          <button type="button" class="er-zoom-btn" data-er-zoom="in" title="放大">+</button>
          <button type="button" class="er-zoom-btn er-zoom-reset" data-er-zoom="reset" title="重置">重置</button>
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
    attachZoom(viewport, stage);

    async function show(viewId) {
      const view = byId[viewId] || views[0];
      root.querySelectorAll(".er-view-tab").forEach((btn) => {
        const on = btn.getAttribute("data-er-view") === view.id;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });
      await renderMermaidInto(mermaidRoot, view.mermaid, view.name || cfg.title);
    }

    root.querySelectorAll(".er-view-tab").forEach((btn) => {
      btn.addEventListener("click", () => show(btn.getAttribute("data-er-view")));
    });

    await show(views[0].id);
  }

  global.ERDiagramUI = { render };
})(window);
