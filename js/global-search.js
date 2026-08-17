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
    // 架构页内嵌字典：深链应落在 architecture，而不是跳到独立 dictionary（避免 #dict/ 无法打开折叠区）
    if (/architecture\.html/i.test(location.pathname)) return null;
    if (/\/pages\//i.test(location.pathname)) return "architecture.html";
    return "pages/architecture.html";
  }

  function kgPageUrl() {
    if (/platform-graph\.html/i.test(location.pathname)) return null;
    if (/\/pages\//i.test(location.pathname)) return "platform-graph.html";
    return "pages/platform-graph.html";
  }

  function openDictOnArchitecture(table, field, fieldKey) {
    try {
      sessionStorage.setItem("dictNav", JSON.stringify({ table, field: field || null }));
      if (fieldKey) sessionStorage.setItem("highlightFieldKey", fieldKey);
    } catch (_) { /* ignore */ }
    if (typeof window.openArchInteractive === "function") {
      window.openArchInteractive("data-dictionary-section");
      setTimeout(() => window.GlobalSearch?.consumePendingNav?.(), 80);
      setTimeout(() => window.GlobalSearch?.consumePendingNav?.(), 450);
      return true;
    }
    if (window.DataDictionaryUI?.navigateTo) {
      window.DataDictionaryUI.navigateTo(table, field || undefined);
      return true;
    }
    return false;
  }

  function searchDictionaryFulltext(kw) {
    const tables = window.DATA_DICTIONARY || [];
    const hits = [];
    const seen = new Set();
      tables.forEach((t) => {
      const tableBlob = [t.name, t.name_cn, t.purpose, t.summary, t.source, ...(t.lineage || [])]
        .filter(Boolean).join(" ").toLowerCase();
      if (tableBlob.includes(kw) && !seen.has(t.name)) {
        seen.add(t.name);
        hits.push({
          category: "table",
          title: t.name_cn ? `${t.name}（${t.name_cn}）` : t.name,
          subtitle: t.purpose || t.layer || "表",
          url: "",
          anchor: `dict/${t.name}`,
          fieldKey: "",
          keywords: tableBlob,
          tableName: t.name,
        });
      }
      (t.fields || []).forEach((f) => {
        const fieldBlob = [f.name, f.desc, f.business, f.technical, f.type, f.role, t.name_cn]
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
          tableName: t.name,
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
          const tn = h.tableName ? ` data-table-name="${esc(h.tableName)}"` : "";
          html += `<a class="gs-item" href="${esc(href || "#")}"${fk}${tn} data-category="${esc(h.category)}"><strong>${esc(h.title)}</strong><span class="gs-sub">${esc(h.subtitle || "")}</span></a>`;
          // 表类结果附带「知识图谱」入口，避免只能落到字典
          if (cat === "table" && (h.tableName || (h.anchor || "").startsWith("dict/"))) {
            const tbl = h.tableName || String(h.anchor || "").replace(/^dict\//, "").split("/")[0];
            const kg = kgPageUrl();
            const kgHref = kg
              ? `${kg}?node=${encodeURIComponent("tbl:" + tbl)}`
              : `?node=${encodeURIComponent("tbl:" + tbl)}`;
            html += `<a class="gs-item gs-item-kg" href="${esc(kgHref)}" data-category="lineage" data-table-name="${esc(tbl)}"><strong>知识图谱 · ${esc(tbl)}</strong><span class="gs-sub">定位到平台知识图谱节点</span></a>`;
          }
        });
      });
      results.innerHTML = html;
      results.classList.add("open");

      results.querySelectorAll(".gs-item").forEach((a) => {
        a.addEventListener("click", (e) => {
          const cat = a.dataset.category;
          const fk = a.dataset.fieldKey || "";
          const href = a.getAttribute("href") || "";
          const { table: fromHref, field } = parseDictTarget(href, fk);
          const table = a.dataset.tableName || fromHref;

          if (a.classList.contains("gs-item-kg") && table) {
            if (/platform-graph\.html/i.test(location.pathname)) {
              e.preventDefault();
              const api = window.__platformKgApi;
              if (api?.enterFocus) api.enterFocus("tbl:" + table, true);
              else location.search = "?node=" + encodeURIComponent("tbl:" + table);
              results.classList.remove("open");
            }
            return;
          }

          // 方法论页内：点对点切场景卡 / 工具箱（不整页重载）
          if ((cat === "playbook" || cat === "method") && /methodology\.html|anomaly\.html/i.test(location.pathname)) {
            e.preventDefault();
            let h = (href.split("#")[1] || "").replace(/^playbook\//, "");
            if (h) location.hash = h;
            results.classList.remove("open");
            return;
          }

          if ((cat === "table" || cat === "field" || cat === "lineage") && table && !a.classList.contains("gs-item-kg")) {
            if (/architecture\.html/i.test(location.pathname)) {
              e.preventDefault();
              openDictOnArchitecture(table, field, fk);
              results.classList.remove("open");
              return;
            }
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
