/**
 * 数据分析答疑 UI · 常见问题合集
 * DataFaq.mount(root, { industry })
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getData() {
    return window.DATA_FAQ_DATA || { categories: [], faqs: [], examples: {} };
  }

  function exampleText(industry, key) {
    if (!industry || !key) return "";
    return getData().examples?.[industry]?.[key] || "";
  }

  function parasHtml(text) {
    if (text == null || text === "") return "";
    const parts = Array.isArray(text) ? text : [text];
    return parts.map((p) => `<p>${esc(p)}</p>`).join("");
  }

  function listHtml(list) {
    if (!list?.length) return "";
    return `<ul class="dfaq-list">${list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
  }

  function sqlHtml(sql) {
    if (!sql) return "";
    const blocks = Array.isArray(sql) ? sql : [sql];
    return blocks
      .map((block) => {
        if (typeof block === "string") {
          return `<pre class="dfaq-sql"><code>${esc(block.trim())}</code></pre>`;
        }
        const title = block.title ? `<p class="dfaq-sql-title">${esc(block.title)}</p>` : "";
        return `${title}<pre class="dfaq-sql"><code>${esc(String(block.code || "").trim())}</code></pre>`;
      })
      .join("");
  }

  function answerHtml(item, industry) {
    const ex = exampleText(industry, item.exampleKey);
    return `
      <div class="dfaq-a">
        ${parasHtml(item.a)}
        ${listHtml(item.list)}
        ${sqlHtml(item.sql)}
        ${item.note ? `<p class="dfaq-note">${esc(item.note)}</p>` : ""}
        ${ex ? `<aside class="dfaq-example"><strong>本行业例子</strong><p>${esc(ex)}</p></aside>` : ""}
      </div>`;
  }

  function filterFaqs(faqs, cat, query) {
    const q = (query || "").trim().toLowerCase();
    return faqs.filter((item) => {
      if (cat && cat !== "all" && item.cat !== cat) return false;
      if (!q) return true;
      const sqlBits = []
        .concat(item.sql || [])
        .map((s) => (typeof s === "string" ? s : `${s.title || ""} ${s.code || ""}`));
      const hay = [item.q, item.a, item.note, ...(item.list || []), ...sqlBits]
        .flat()
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  function catLabel(categories, id) {
    return categories.find((c) => c.id === id)?.label || id;
  }

  function renderList(host, state) {
    const data = getData();
    const items = filterFaqs(data.faqs, state.cat, state.query);
    const listEl = host.querySelector(".dfaq-list-wrap");
    const countEl = host.querySelector(".dfaq-count");
    if (countEl) {
      countEl.textContent = items.length ? `共 ${items.length} 题` : "无匹配问题";
    }
    if (!listEl) return;

    if (!items.length) {
      listEl.innerHTML = `<p class="dfaq-empty">没有匹配的问题，试试切换分类或清空搜索。</p>`;
      return;
    }

    listEl.innerHTML = items
      .map((item, idx) => {
        const open = state.openId === item.id ? " open" : "";
        return `
        <details class="dfaq-item" data-faq-id="${esc(item.id)}"${open}>
          <summary class="dfaq-summary">
            <span class="dfaq-item-cat">${esc(catLabel(data.categories, item.cat))}</span>
            <span class="dfaq-item-q">${esc(item.q)}</span>
          </summary>
          ${answerHtml(item, state.industry)}
        </details>`;
      })
      .join("");

    listEl.querySelectorAll(".dfaq-item").forEach((det) => {
      det.addEventListener("toggle", () => {
        if (det.open) {
          state.openId = det.dataset.faqId;
          listEl.querySelectorAll(".dfaq-item").forEach((other) => {
            if (other !== det) other.open = false;
          });
        } else if (state.openId === det.dataset.faqId) {
          state.openId = "";
        }
      });
    });
  }

  function mount(root, opts) {
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el) return null;
    const data = getData();
    const state = {
      industry: opts?.industry || document.body?.dataset?.industry || "",
      cat: opts?.category || "all",
      query: "",
      openId: "",
    };

    const cats = (data.categories || []).length
      ? data.categories
      : [{ id: "all", label: "全部问题" }];

    el.classList.add("dfaq-root");
    el.innerHTML = `
      <p class="dfaq-lead">按主题浏览常见问题。MySQL / 窗口函数 / JOIN / EXPLAIN 等已按「能讲清楚」展开：先讲为什么，再给写法与示例 SQL，最后补坑位。可搜索关键字定位。</p>
      <div class="dfaq-controls">
        <div class="dfaq-cats" role="tablist" aria-label="问题分类">
          ${cats
            .map(
              (c) =>
                `<button type="button" class="dfaq-cat${c.id === state.cat ? " is-active" : ""}" data-cat="${esc(c.id)}" role="tab" aria-selected="${c.id === state.cat ? "true" : "false"}">${esc(c.label)}</button>`
            )
            .join("")}
        </div>
        <div class="dfaq-search-row">
          <label class="dfaq-search-label" for="dfaq-search">搜索</label>
          <input type="search" id="dfaq-search" class="dfaq-search" placeholder="例如：ODS、窗口函数、人机协同、DQC…" autocomplete="off">
          <span class="dfaq-count" aria-live="polite"></span>
        </div>
      </div>
      <div class="dfaq-list-wrap"></div>`;

    const search = el.querySelector(".dfaq-search");
    el.querySelectorAll(".dfaq-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.cat = btn.dataset.cat;
        state.openId = "";
        el.querySelectorAll(".dfaq-cat").forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderList(el, state);
      });
    });
    search?.addEventListener("input", () => {
      state.query = search.value;
      state.openId = "";
      renderList(el, state);
    });

    renderList(el, state);
    return { el, state, remount: (next) => {
      if (next?.industry != null) state.industry = next.industry;
      renderList(el, state);
    } };
  }

  window.DataFaq = { mount, getData };
})();
