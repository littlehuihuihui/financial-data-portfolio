/**
 * 实体关系图渲染（Mermaid erDiagram）
 * 依赖：er-diagram-data.js 中的 window.ER_DIAGRAM
 * 支持 cfg.views[] 多图切换；无 views 时回退 cfg.mermaid
 */
(function (global) {
  const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
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
            fontSize: "15px",
            fontFamily: "JetBrains Mono, Consolas, Microsoft YaHei, monospace",
            primaryTextColor: "#e2e8f0",
            lineColor: "#64748b",
            primaryColor: "#1e293b",
            primaryBorderColor: "#38bdf8",
            secondaryColor: "#0f172a",
            tertiaryColor: "#1e293b",
          },
          er: {
            diagramPadding: 28,
            layoutDirection: "TB",
            minEntityWidth: 140,
            minEntityHeight: 56,
            entityPadding: 18,
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
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    svgEl.style.maxWidth = "none";
    svgEl.style.width = "100%";
    svgEl.style.minWidth = "1080px";
    svgEl.style.height = "auto";

    svgEl.querySelectorAll("text").forEach((t) => {
      const current = parseFloat(t.getAttribute("font-size") || "12");
      const next = Math.max(current, 14);
      t.setAttribute("font-size", String(next));
      t.style.fontSize = next + "px";
      t.style.fontWeight = "600";
      t.style.fontFamily = '"JetBrains Mono", Consolas, "Microsoft YaHei", monospace';
    });
    svgEl.querySelectorAll(".entityLabel text, g.entityLabel text, .label text").forEach((t) => {
      t.setAttribute("font-size", "15");
      t.style.fontSize = "15px";
      t.style.fontWeight = "700";
    });
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
      <p class="er-diagram-tip">提示：可左右滚动查看完整表名；多视图时切换上方标签可降低图密度。</p>
      <div class="er-diagram-mermaid" id="er-mermaid-svg-root"></div>
    `;

    const mermaidRoot = document.getElementById("er-mermaid-svg-root");
    const byId = Object.fromEntries(views.map((v) => [v.id, v]));

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
