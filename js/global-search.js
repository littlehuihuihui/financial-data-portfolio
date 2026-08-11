/**
 * 全局搜索 · 顶部导航搜索框
 * 支持 SEARCH_INDEX + DATA_DICTIONARY 全文（字段业务含义等）
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
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  function dictPageUrl() {
    if (/dictionary\.html/i.test(location.pathname)) return null;
    if (/architecture\.html/i.test(location.pathname)) return "dictionary.html";
    if (/\/pages\//i.test(location.pathname)) return "dictionary.html";
    return "pages/dictionary.html";
  }

  function searchDictionaryFulltext(kw) {
    const tables = window.DATA_DICTIONARY || [];
    const hits = [];
    const seen = new Set();
    tables.forEach((t) => {
      const tableBlob = [t.name, t.purpose, t.summary, t.source, ...(t.lineage || [])]
        .filter(Boolean).join(" ").toLowerCase();
      if (tableBlob.includes(kw) && !seen.has(t.name)) {
        seen.add(t.name);
        hits.push({
          category: "table",
          title: t.name,
          subtitle: t.purpose || t.layer || "表",
          url: "",
          anchor: `dict/${t.name}`,
          fieldKey: "",
          keywords: tableBlob,
        });
      }
      (t.fields || []).forEach((f) => {
        const fieldBlob = [f.name, f.desc, f.business, f.technical, f.type, f.role]
          .filter(Boolean).join(" ").toLowerCase();
        if (!fieldBlob.includes(kw)) return;
        const key = t.name + "." + f.name;
        if (seen.has(key)) return;
        seen.add(key);
        hits.push({
          category: "field",
          title: `${t.name}.${f.name}`,
          subtitle: f.business || f.desc || t.purpose || "字段",
          url: "",
          anchor: `dict/${t.name}/${f.name}`,
          fieldKey: key,
          keywords: fieldBlob,
        });
      });
    });
    return hits;
  }

  function mount(slotId) {
    const id = String(slotId || "").replace(/^#/, "");
    const slot = document.getElementById(id);
    if (!slot || slot.dataset.gsMounted) return;
    slot.dataset.gsMounted = "1";

    slot.innerHTML = `
      <div class="global-search-wrap">
        <input type="search" id="global-search-input" placeholder="全文搜索：看板、表、字段、业务含义…" autocomplete="off" aria-label="全局搜索">
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
      const fromIndex = index.filter((it) => (it.keywords || "").toLowerCase().includes(kw));
      const fromDict = searchDictionaryFulltext(kw);
      const seen = new Set();
      const hits = [];
      [...fromIndex, ...fromDict].forEach((h) => {
        const key = (h.fieldKey || h.anchor || h.title || "") + "|" + (h.category || "");
        if (seen.has(key)) return;
        seen.add(key);
        hits.push(h);
      });
      const limited = hits.slice(0, 28);
      if (!limited.length) {
        results.innerHTML = '<div class="gs-empty">无匹配结果</div>';
        results.classList.add("open");
        return;
      }
      const groups = {};
      limited.forEach((h) => {
        if (!groups[h.category]) groups[h.category] = [];
        groups[h.category].push(h);
      });
      let html = "";
      Object.keys(groups).forEach((cat) => {
        html += `<div class="gs-group-title">${CATEGORY_LABELS[cat] || cat}</div>`;
        groups[cat].forEach((h) => {
          let href = h.url || "";
          if (h.anchor) {
            if (!href && (cat === "table" || cat === "field" || cat === "lineage")) {
              const page = dictPageUrl();
              href = page ? `${page}#${h.anchor}` : `#${h.anchor}`;
            } else {
              href = (href || "") + (href.includes("#") ? "" : `#${h.anchor}`);
            }
          }
          const fk = h.fieldKey ? ` data-field-key="${esc(h.fieldKey)}"` : "";
          html += `<a class="gs-item" href="${esc(href || "#")}"${fk} data-category="${esc(h.category)}"><strong>${esc(h.title)}</strong><span class="gs-sub">${esc(h.subtitle || "")}</span></a>`;
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
            if (window.DataDictionaryUI?.navigateTo) {
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
    setTimeout(consumePendingNav, 0);
    setTimeout(consumePendingNav, 400);
  }

  window.GlobalSearch = { mount, init, consumePendingNav };
  document.addEventListener("DOMContentLoaded", init);
})();
