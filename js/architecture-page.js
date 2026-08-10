/**
 * 架构页统一初始化：字典 / 全景 / 图谱 / ER / 搜索 / hash 深链
 * 重脚本（ECharts / 全景 / 图谱 / ER）按需懒加载，减轻首屏卡顿。
 */
(function () {
  "use strict";

  const inited = {
    panorama: false,
    graph: false,
    er: false,
    dictionary: false,
  };

  const loading = {};

  function getIndustry() {
    return document.body?.dataset?.industry || "retail";
  }

  function scriptBase() {
    const ind = getIndustry();
    return {
      industry: `../js`,
      shared: `../../../js`,
      industryAbs: `/industries/${ind}/js`,
      sharedAbs: `/js`,
    };
  }

  function loadScript(src) {
    if (document.querySelector(`script[data-lazy-src="${src}"]`)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.dataset.lazySrc = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.body.appendChild(s);
    });
  }

  async function ensureScripts(keys) {
    const b = scriptBase();
    const map = {
      echarts: `${b.industry}/echarts.min.js`,
      dwArchData: `${b.industry}/dw-architecture-data.js`,
      dwArch: `${b.shared}/dw-architecture.js`,
      dwGraph: `${b.industry}/dw-knowledge-graph.js`,
      erData: `${b.industry}/er-diagram-data.js?v=2.16`,
      er: `${b.industry}/er-diagram.js?v=2.16`,
    };
    const key = keys.join("|");
    if (!loading[key]) {
      loading[key] = (async () => {
        for (const k of keys) {
          if (!map[k]) continue;
          if (k === "echarts" && window.echarts) continue;
          if (k === "dwArch" && window.DWArchitecture) continue;
          if (k === "dwGraph" && window.DWKnowledgeGraph) continue;
          if (k === "er" && window.ERDiagramUI) continue;
          await loadScript(map[k]);
        }
      })();
    }
    return loading[key];
  }

  function openDetails(id) {
    const el = document.getElementById(id);
    if (el && el.tagName === "DETAILS") el.open = true;
    return el;
  }

  function initDictionary() {
    if (inited.dictionary) return window.DataDictionaryUI?.instance || null;
    const root = document.getElementById("data-dictionary-root");
    if (!root || !window.DataDictionaryUI?.render) return null;

    inited.dictionary = true;
    const inst = window.DataDictionaryUI.render("data-dictionary-root", {
      defaultLayerOpen: ["ADS"],
      showOverview: false,
      showAdsApplicationMap: true,
    });
    window.DataDictionaryUI.instance = inst;
    window.DataDictionaryUI.selectTable = (n) => inst.selectTableByName(n);
    window.DataDictionaryUI.selectField = (t, f) => inst.selectFieldByName(t, f);
    window.DataDictionaryUI.highlightField = (k) => inst.highlightField(k);
    window.DataDictionaryUI.navigateTo = (t, f) => inst.navigateTo(t, f);
    return inst;
  }

  async function initPanorama() {
    if (inited.panorama) {
      window.__dwArch?.fitView?.();
      window.__dwArch?.drawFlows?.();
      return window.__dwArch;
    }
    await ensureScripts(["dwArchData", "dwArch"]);
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

  async function initGraph() {
    if (inited.graph) {
      window.__dwGraph?.chart?.resize?.();
      return window.__dwGraph;
    }
    await ensureScripts(["echarts", "dwArchData", "dwGraph"]);
    const root = document.getElementById("dw-graph-root");
    if (!root || !window.DWKnowledgeGraph) return null;
    inited.graph = true;
    window.__dwGraph = new DWKnowledgeGraph("dw-graph-root", {
      defaultIndustry: getIndustry(),
    });
    return window.__dwGraph;
  }

  async function initEr() {
    if (inited.er) return;
    await ensureScripts(["erData", "er"]);
    const root = document.getElementById("er-diagram-root");
    if (!root || !window.ERDiagramUI?.render) return;
    inited.er = true;
    window.ERDiagramUI.render("er-diagram-root");
  }

  async function ensureInteractive(id) {
    if (id === "dw-architecture-section") await initPanorama();
    else if (id === "dw-graph-section") await initGraph();
    else if (id === "er-diagram-section") await initEr();
  }

  function bindInteractiveAccordions() {
    document.querySelectorAll(".arch-interactive-accordion").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        ensureInteractive(details.id).then(() => {
          requestAnimationFrame(() => {
            if (details.id === "dw-architecture-section") {
              window.__dwArch?.fitView?.();
              window.__dwArch?.drawFlows?.();
            } else if (details.id === "dw-graph-section") {
              window.__dwGraph?.chart?.resize?.();
            }
          });
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
    initGraph().then(() => {
      setTimeout(() => {
        window.__dwGraph?.focusNode?.(focus);
        document.getElementById("dw-graph-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 320);
    });
  }

  function openArchInteractive(id) {
    openDetails(id);
    ensureInteractive(id);
  }

  function initStaticAccordions() {
    document.querySelectorAll(".arch-static-accordion[open]").forEach((el) => {
      el.removeAttribute("open");
    });
  }

  function scheduleDictionary() {
    const root = document.getElementById("data-dictionary-root");
    if (!root) return;
    const run = () => initDictionary();
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            run();
          }
        },
        { rootMargin: "120px" }
      );
      io.observe(root);
      // 深链到字典时立即初始化
      if (/^#dict\//.test(location.hash) || location.hash === "#data-dictionary-section") {
        run();
      }
    } else if (window.requestIdleCallback) {
      requestIdleCallback(run, { timeout: 800 });
    } else {
      setTimeout(run, 0);
    }
  }

  function boot() {
    scheduleDictionary();
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
