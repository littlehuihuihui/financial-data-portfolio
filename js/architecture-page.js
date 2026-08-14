/**
 * 架构页统一初始化：字典 / 全景 / 图谱 / ER / ETL / 答疑 按需懒加载
 * 首屏只挂搜索与 TOC，避免同步解析 100KB+ 数据脚本。
 */
(function () {
  "use strict";

  const inited = {
    panorama: false,
    graph: false,
    er: false,
    dictionary: false,
    etl: false,
    faq: false,
  };
  const loading = {};
  const cssLoaded = {};

  function getIndustry() {
    return document.body?.dataset?.industry || "retail";
  }

  function scriptBase() {
    return { industry: "../js", shared: "../../../js", cssIndustry: "../css", cssShared: "../../../css" };
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

  function loadCss(href) {
    if (cssLoaded[href] || document.querySelector(`link[data-lazy-href="${href}"]`)) {
      cssLoaded[href] = true;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.dataset.lazyHref = href;
      l.onload = () => {
        cssLoaded[href] = true;
        resolve();
      };
      l.onerror = () => {
        cssLoaded[href] = true;
        resolve();
      };
      document.head.appendChild(l);
    });
  }

  async function ensureScripts(keys) {
    const b = scriptBase();
    const map = {
      echarts: "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js",
      dwArchData: `${b.industry}/dw-architecture-data.js?v=3.34`,
      dwArch: `${b.shared}/dw-architecture.js?v=3.35`,
      dwGraph: `${b.shared}/dw-knowledge-graph.js?v=3.36`,
      erData: `${b.industry}/er-diagram-data.js?v=3.32`,
      er: `${b.shared}/er-diagram-interactive.js?v=1.0`,
      dictData: `${b.industry}/data-dictionary-data.js?v=3.28`,
      metricCaliber: `${b.industry}/metric-caliber-data.js?v=3.28`,
      dashConfig: `${b.industry}/dashboard-config.js?v=3.28`,
      dictCore: `${b.shared}/data-dictionary-core.js?v=3.29`,
      dictUi: `${b.industry}/data-dictionary.js?v=3.28`,
      etlData: `${b.industry}/etl-lineage-data.js?v=3.34`,
      etlUi: `${b.shared}/etl-lineage.js?v=3.35`,
      faqData: `${b.shared}/data-faq-data.js?v=2.2`,
      faqUi: `${b.shared}/data-faq.js?v=2.2`,
    };
    const ready = {
      echarts: () => !!window.echarts,
      dwArchData: () => !!window.DW_ARCHITECTURE_DATA,
      dwArch: () => !!window.DWArchitecture,
      dwGraph: () => !!window.DWKnowledgeGraph,
      erData: () => !!window.ER_DIAGRAM,
      er: () => !!window.ERDiagramInteractive,
      dictData: () => Array.isArray(window.DATA_DICTIONARY),
      metricCaliber: () => !!window.METRIC_CALIBER,
      dashConfig: () => true,
      dictCore: () => !!window.DataDictionaryUI,
      dictUi: () => !!window.DATA_DICTIONARY_INDUSTRY,
      etlData: () => !!window.ETL_LINEAGE,
      etlUi: () => !!window.EtlLineageUI,
      faqData: () => !!window.DATA_FAQ_DATA,
      faqUi: () => !!window.DataFaq,
    };
    const key = keys.join("|");
    if (!loading[key]) {
      loading[key] = (async () => {
        for (const k of keys) {
          if (!map[k]) continue;
          if (ready[k]?.()) continue;
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

  async function ensureDictionaryStack() {
    const b = scriptBase();
    await loadCss(`${b.cssShared}/data-dictionary.css?v=3.28`);
    await ensureScripts(["dictData", "metricCaliber", "dashConfig", "dictCore", "dictUi"]);
  }

  function initDictionary() {
    if (inited.dictionary) return window.DataDictionaryUI?.instance || null;
    const root = document.getElementById("data-dictionary-root");
    if (!root || !window.DataDictionaryUI?.render) return null;
    inited.dictionary = true;
    const inst = window.DataDictionaryUI.render("data-dictionary-root", {
      showOverview: false,
      showAdsApplicationMap: false,
    });
    window.DataDictionaryUI.instance = inst;
    window.DataDictionaryUI.selectTable = (n) => inst.selectTableByName(n);
    window.DataDictionaryUI.selectField = (t, f) => inst.selectFieldByName(t, f);
    window.DataDictionaryUI.highlightField = (k) => inst.highlightField(k);
    window.DataDictionaryUI.navigateTo = (t, f) => inst.navigateTo(t, f);
    return inst;
  }

  async function initDictionaryLazy() {
    await ensureDictionaryStack();
    return initDictionary();
  }

  async function initPanorama() {
    if (inited.panorama) {
      window.__dwArch?.fitView?.();
      window.__dwArch?.drawFlows?.();
      return window.__dwArch;
    }
    const b = scriptBase();
    await loadCss(`${b.cssIndustry}/dw-architecture.css?v=3.38`);
    await ensureScripts(["dwArchData", "dwArch", "metricCaliber", "etlData"]);
    const root = document.getElementById("dw-architecture-root");
    if (!root || !window.DWArchitecture) return null;
    inited.panorama = true;
    window.__dwArch = new DWArchitecture("dw-architecture-root", {
      defaultIndustry: getIndustry(),
      showIndustrySwitch: false,
      flowMode: "layer",
      showDimRail: false,
      dimRailCollapsed: true,
    });
    return window.__dwArch;
  }

  async function initEr() {
    if (inited.er) return;
    await ensureScripts(["erData", "er"]);
    const root = document.getElementById("er-diagram-root");
    if (!root || !window.ERDiagramInteractive?.render) return;
    inited.er = true;
    window.ERDiagramInteractive.render("er-diagram-root");
  }

  async function initEtlLineageLazy() {
    if (inited.etl) return window.EtlLineageUI?.instance || null;
    await ensureScripts(["etlData", "etlUi"]);
    const root = document.getElementById("etl-lineage-root");
    if (!root || !window.EtlLineageUI?.render) return null;
    inited.etl = true;
    const inst = window.EtlLineageUI.render("etl-lineage-root");
    window.EtlLineageUI.instance = inst;
    return inst;
  }

  async function initDataFaqLazy() {
    if (inited.faq) return;
    const b = scriptBase();
    await loadCss(`${b.cssShared}/data-faq.css?v=2.2`);
    await ensureScripts(["faqData", "faqUi"]);
    const root = document.getElementById("data-faq-root");
    if (!root || !window.DataFaq?.mount) return null;
    inited.faq = true;
    return window.DataFaq.mount(root, { industry: getIndustry() });
  }

  async function ensureInteractive(id) {
    if (id === "data-dictionary-section") await initDictionaryLazy();
    else if (id === "dw-architecture-section") await initPanorama();
    else if (id === "er-diagram-section") await initEr();
    else if (id === "etl-lineage-section") await initEtlLineageLazy();
    else if (id === "data-faq-section") await initDataFaqLazy();
    else if (id === "dw-graph-section") {
      // 旧数仓力导向图已移除 → 平台知识图谱
      location.href = "platform-graph.html";
    }
  }

  function bindInteractiveAccordions() {
    document.querySelectorAll(".arch-interactive-accordion, .arch-static-accordion").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        ensureInteractive(details.id).then(() => {
          requestAnimationFrame(() => {
            if (details.id === "dw-architecture-section") {
              window.__dwArch?.fitView?.();
              window.__dwArch?.drawFlows?.();
            } else if (details.id === "er-diagram-section") {
              window.dispatchEvent(new Event("resize"));
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

  function applyLegacyGraphHash() {
    const raw = location.hash.slice(1);
    if (!raw) return;
    const base = raw.split("?")[0];
    if (base !== "dw-graph-section") return;
    const q = raw.includes("?") ? raw.split("?").slice(1).join("?") : "";
    const params = new URLSearchParams(q);
    const focus = params.get("focus") || params.get("table");
    const node = focus
      ? (/^(tbl|dash|metric|pb):/i.test(focus) ? focus : `tbl:${focus}`)
      : "";
    location.replace(node ? `platform-graph.html?node=${encodeURIComponent(node)}` : "platform-graph.html");
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

  function scheduleIdle(fn) {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => fn(), { timeout: 2500 });
    } else {
      setTimeout(fn, 1200);
    }
  }

  async function boot() {
    bindInteractiveAccordions();
    bindTocLinks();
    initStaticAccordions();

    window.GlobalSearch?.mount?.("global-search-slot");
    window.GlobalSearch?.consumePendingNav?.();
    setTimeout(() => window.GlobalSearch?.consumePendingNav?.(), 400);

    // 搜索深链：优先加载字典再消费 dictNav
    try {
      if (sessionStorage.getItem("dictNav") || sessionStorage.getItem("highlightFieldKey")) {
        openDetails("data-dictionary-section");
        initDictionaryLazy().then(() => window.GlobalSearch?.consumePendingNav?.());
      }
    } catch (_) { /* ignore */ }

    applyLegacyGraphHash();
    window.addEventListener("hashchange", applyLegacyGraphHash);
    window.openArchInteractive = openArchInteractive;

    // 空闲时预取字典（首屏不阻塞）
    const hash = (location.hash || "").replace(/^#/, "").split("?")[0];
    if (hash && hash !== "dw-graph-section") {
      ensureInteractive(hash);
    } else {
      scheduleIdle(() => {
        ensureDictionaryStack().catch(() => {});
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot();
  });
})();
