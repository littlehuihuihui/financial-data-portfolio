/**
 * 架构页统一初始化：字典 / 全景 / 图谱 / ER / 搜索 / hash 深链
 * 交互区块（全景 / 图谱 / ER）在 <details> 内懒加载，展开时 resize。
 */
(function () {
  "use strict";

  const inited = {
    panorama: false,
    graph: false,
    er: false,
  };

  function getIndustry() {
    return document.body?.dataset?.industry || "retail";
  }

  function openDetails(id) {
    const el = document.getElementById(id);
    if (el && el.tagName === "DETAILS") el.open = true;
    return el;
  }

  function initDictionary() {
    const root = document.getElementById("data-dictionary-root");
    if (!root || !window.DataDictionaryUI?.render) return null;

    const inst = window.DataDictionaryUI.render("data-dictionary-root", {
      defaultLayerOpen: ["ADS"],
      showOverview: true,
      showAdsApplicationMap: true,
    });
    window.DataDictionaryUI.instance = inst;
    window.DataDictionaryUI.selectTable = (n) => inst.selectTableByName(n);
    window.DataDictionaryUI.selectField = (t, f) => inst.selectFieldByName(t, f);
    window.DataDictionaryUI.highlightField = (k) => inst.highlightField(k);
    window.DataDictionaryUI.navigateTo = (t, f) => inst.navigateTo(t, f);
    return inst;
  }

  function initPanorama() {
    if (inited.panorama) {
      window.__dwArch?.fitView?.();
      window.__dwArch?.drawFlows?.();
      return window.__dwArch;
    }
    const root = document.getElementById("dw-architecture-root");
    if (!root || !window.DWArchitecture) return null;
    inited.panorama = true;
    window.__dwArch = new DWArchitecture("dw-architecture-root", {
      defaultIndustry: getIndustry(),
      showIndustrySwitch: false,
      flowMode: "layer",
      dimRailCollapsed: true,
    });
    return window.__dwArch;
  }

  function initGraph() {
    if (inited.graph) {
      window.__dwGraph?.chart?.resize?.();
      return window.__dwGraph;
    }
    const root = document.getElementById("dw-graph-root");
    if (!root || !window.DWKnowledgeGraph) return null;
    inited.graph = true;
    window.__dwGraph = new DWKnowledgeGraph("dw-graph-root", {
      defaultIndustry: getIndustry(),
    });
    return window.__dwGraph;
  }

  function initEr() {
    if (inited.er) return;
    const root = document.getElementById("er-diagram-root");
    if (!root || !window.ERDiagramUI?.render) return;
    inited.er = true;
    window.ERDiagramUI.render("er-diagram-root");
  }

  function ensureInteractive(id) {
    if (id === "dw-architecture-section") initPanorama();
    else if (id === "dw-graph-section") initGraph();
    else if (id === "er-diagram-section") initEr();
  }

  function bindInteractiveAccordions() {
    document.querySelectorAll(".arch-interactive-accordion").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        ensureInteractive(details.id);
        requestAnimationFrame(() => {
          if (details.id === "dw-architecture-section") {
            window.__dwArch?.fitView?.();
            window.__dwArch?.drawFlows?.();
          } else if (details.id === "dw-graph-section") {
            window.__dwGraph?.chart?.resize?.();
          }
        });
      });
      if (details.open) ensureInteractive(details.id);
    });
  }

  function bindTocLinks() {
    document.querySelectorAll('.arch-toc a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => {
        const id = (a.getAttribute("href") || "").slice(1);
        if (!id) return;
        openDetails(id);
        setTimeout(() => ensureInteractive(id), 0);
      });
    });
  }

  function parseGraphFocusFromHash() {
    const raw = location.hash.slice(1);
    if (!raw) return null;
    const base = raw.split("?")[0];
    if (base && base !== "dw-graph-section") return null;
    const q = raw.includes("?") ? raw.split("?").slice(1).join("?") : "";
    const params = new URLSearchParams(q);
    return params.get("focus") || params.get("table");
  }

  function applyGraphFocus() {
    const focus = parseGraphFocusFromHash();
    if (!focus) return;
    openDetails("dw-graph-section");
    initGraph();
    setTimeout(() => {
      window.__dwGraph?.focusNode?.(focus);
      document.getElementById("dw-graph-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  }

  /** 供全景图 / 字典调用：展开交互折叠区并懒初始化 */
  function openArchInteractive(id) {
    openDetails(id);
    ensureInteractive(id);
  }

  function initStaticAccordions() {
    document.querySelectorAll(".arch-static-accordion[open]").forEach((el) => {
      el.removeAttribute("open");
    });
  }

  function boot() {
    initDictionary();
    bindInteractiveAccordions();
    bindTocLinks();
    initStaticAccordions();

    window.GlobalSearch?.mount?.("global-search-slot");
    window.GlobalSearch?.consumePendingNav?.();
    setTimeout(() => window.GlobalSearch?.consumePendingNav?.(), 400);

    applyGraphFocus();
    window.addEventListener("hashchange", applyGraphFocus);

    window.openArchInteractive = openArchInteractive;
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
