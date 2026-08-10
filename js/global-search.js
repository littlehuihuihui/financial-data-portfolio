/**
 * 全局搜索 · 顶部导航搜索框
 * Step2：表/字段命中优先走字典 navigateTo / dictNav
 */
(function () {
  "use strict";

  const CATEGORY_LABELS = {
    page: "页面",
    dashboard: "看板",
    table: "表",
    field: "字段",
    lineage: "血缘路径",
    metric: "指标",
    playbook: "分析问题",
    method: "分析方法",
  };

  function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function parseDictTarget(href, fieldKey) {
    let table = null;
    let field = null;
    const hash = (href || "").split("#")[1] || "";
    if (hash.startsWith("dict/")) {
      const parts = hash.slice(5).split("/");
      table = parts[0] || null;
      field = parts[1] || null;
    } else if (hash.startsWith("dd-")) {
      table = hash.slice(3) || null;
    }
    if (fieldKey && fieldKey.includes(".")) {
      const parts = fieldKey.split(".");
      table = table || parts[0];
      field = field || parts[1];
    }
    return { table, field };
  }

  function isArchitecturePage() {
    return !!document.getElementById("data-dictionary-root")
      || /architecture\.html/i.test(location.pathname);
  }

  function mount(slotId) {
    const slot = document.getElementById(slotId);
    if (!slot || slot.dataset.gsMounted) return;
    slot.dataset.gsMounted = "1";

    slot.innerHTML = `
      <div class="global-search-wrap">
        <input type="search" id="global-search-input" placeholder="搜索看板、表、字段、指标、血缘…" autocomplete="off" aria-label="全局搜索">
        <div class="global-search-results" id="global-search-results"></div>
      </div>`;

    const input = slot.querySelector("#global-search-input");
    const results = slot.querySelector("#global-search-results");

    function search(q) {
      const kw = q.trim().toLowerCase();
      if (!kw) {
        results.classList.remove("open");
        return;
      }
      const index = window.SEARCH_INDEX || [];
      const hits = index.filter((it) => it.keywords.toLowerCase().includes(kw)).slice(0, 24);
      if (!hits.length) {
        results.innerHTML = '<div class="gs-empty">无匹配结果</div>';
        results.classList.add("open");
        return;
      }
      const groups = {};
      hits.forEach((h) => {
        if (!groups[h.category]) groups[h.category] = [];
        groups[h.category].push(h);
      });
      let html = "";
      Object.keys(groups).forEach((cat) => {
        html += `<div class="gs-group-title">${CATEGORY_LABELS[cat] || cat}</div>`;
        groups[cat].forEach((h) => {
          const href = h.url + (h.anchor ? `#${h.anchor}` : "");
          const fk = h.fieldKey ? ` data-field-key="${esc(h.fieldKey)}"` : "";
          html += `<a class="gs-item" href="${esc(href)}"${fk} data-category="${esc(h.category)}"><strong>${esc(h.title)}</strong><span class="gs-sub">${esc(h.subtitle)}</span></a>`;
        });
      });
      results.innerHTML = html;
      results.classList.add("open");

      results.querySelectorAll(".gs-item").forEach((a) => {
        a.addEventListener("click", (e) => {
          const cat = a.dataset.category;
          const fk = a.dataset.fieldKey || "";
          const href = a.getAttribute("href") || "";
          const { table, field } = parseDictTarget(href, fk);

          if ((cat === "table" || cat === "field" || cat === "lineage") && table) {
            if (isArchitecturePage() && window.DataDictionaryUI?.navigateTo) {
              e.preventDefault();
              window.DataDictionaryUI.navigateTo(table, field || undefined);
              results.classList.remove("open");
              return;
            }
            sessionStorage.setItem("dictNav", JSON.stringify({ table, field: field || null }));
            if (fk) sessionStorage.setItem("highlightFieldKey", fk);
          } else if (fk) {
            sessionStorage.setItem("highlightFieldKey", fk);
          }
        });
      });
    }

    input.addEventListener("input", () => search(input.value));
    input.addEventListener("focus", () => { if (input.value) search(input.value); });
    document.addEventListener("click", (e) => {
      if (!slot.contains(e.target)) results.classList.remove("open");
    });
  }

  function consumePendingNav() {
    const ui = window.DataDictionaryUI;
    if (!ui) return;

    try {
      const raw = sessionStorage.getItem("dictNav");
      if (raw) {
        const { table, field } = JSON.parse(raw);
        sessionStorage.removeItem("dictNav");
        sessionStorage.removeItem("highlightFieldKey");
        if (table && ui.navigateTo) {
          ui.navigateTo(table, field || undefined);
          return;
        }
        if (table && ui.selectTable) {
          ui.selectTable(table);
          if (field && ui.selectField) ui.selectField(table, field);
          return;
        }
      }
    } catch (_) { /* ignore */ }

    const fk = sessionStorage.getItem("highlightFieldKey");
    if (fk) {
      sessionStorage.removeItem("highlightFieldKey");
      if (ui.navigateTo && fk.includes(".")) {
        const [t, f] = fk.split(".");
        ui.navigateTo(t, f);
      } else if (ui.highlightField) {
        ui.highlightField(fk);
      }
    }
  }

  function init() {
    mount("global-search-slot");
    // 等 architecture 页暴露 DataDictionaryUI.navigateTo
    setTimeout(consumePendingNav, 0);
    setTimeout(consumePendingNav, 400);
  }

  window.GlobalSearch = { mount, init, consumePendingNav };
  document.addEventListener("DOMContentLoaded", init);
})();
