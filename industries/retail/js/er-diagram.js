/**
 * 实体关系图渲染（Mermaid erDiagram）
 * 依赖：er-diagram-data.js 中的 window.ER_DIAGRAM
 */
(function (global) {
  const MERMAID_CDN = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";

  function loadMermaid() {
    return new Promise((resolve, reject) => {
      if (global.mermaid) {
        resolve(global.mermaid);
        return;
      }
      const s = document.createElement("script");
      s.src = MERMAID_CDN;
      s.onload = () => resolve(global.mermaid);
      s.onerror = () => reject(new Error("Mermaid CDN load failed"));
      document.head.appendChild(s);
    });
  }

  async function render(containerId) {
    const cfg = global.ER_DIAGRAM;
    const root = document.getElementById(containerId);
    if (!cfg || !root) return;

    const legendHtml = (cfg.legend || [])
      .map((item) => `<span class="er-legend-item">${item}</span>`)
      .join("");

    root.innerHTML = `
      ${cfg.description ? `<p class="er-diagram-desc">${cfg.description}</p>` : ""}
      ${legendHtml ? `<div class="er-diagram-legend">${legendHtml}</div>` : ""}
      <div class="er-diagram-mermaid" id="er-mermaid-svg-root"></div>
    `;

    const mermaidRoot = document.getElementById("er-mermaid-svg-root");
    try {
      const mermaid = await loadMermaid();
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        er: { diagramPadding: 20, layoutDirection: "TB" },
      });
      const id = "er-svg-" + Date.now();
      const { svg } = await mermaid.render(id, cfg.mermaid.trim());
      mermaidRoot.innerHTML = svg;
      const svgEl = mermaidRoot.querySelector("svg");
      if (svgEl) {
        svgEl.setAttribute("role", "img");
        svgEl.setAttribute("aria-label", cfg.title || "实体关系图");
      }
    } catch (err) {
      mermaidRoot.innerHTML =
        `<p class="er-diagram-fallback">ER 图加载失败，请检查网络后刷新。` +
        `<details><summary>查看 Mermaid 源码</summary><pre>${cfg.mermaid}</pre></details></p>`;
      console.error("ER diagram render failed", err);
    }
  }

  global.ERDiagramUI = { render };
})(window);
