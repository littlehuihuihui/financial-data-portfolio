/**
 * 数仓答疑 UI · DataFaq.mount(root, { industry })
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
    return window.DATA_FAQ_DATA || { layers: [], tech: [], examples: {} };
  }

  function findItem(id) {
    const d = getData();
    return d.layers.find((x) => x.id === id) || d.tech.find((x) => x.id === id) || null;
  }

  function exampleText(industry, itemId) {
    if (!industry) return "";
    const ex = getData().examples?.[industry] || {};
    return ex[itemId] || "";
  }

  function renderChips(items, groupLabel) {
    const btns = items
      .map(
        (it) =>
          `<button type="button" class="dfaq-chip" data-faq-id="${esc(it.id)}" data-faq-kind="${esc(it.kind)}">${esc(it.label)}</button>`
      )
      .join("");
    return `<div class="dfaq-group"><h3 class="dfaq-group-title">${esc(groupLabel)}</h3><div class="dfaq-chip-row">${btns}</div></div>`;
  }

  function blocksHtml(blocks) {
    if (!blocks?.length) return "<p class='dfaq-empty'>暂无内容</p>";
    return blocks
      .map(
        (b) =>
          `<section class="dfaq-block"><h4>${esc(b.h)}</h4><p>${esc(b.p)}</p></section>`
      )
      .join("");
  }

  function interviewHtml(list) {
    if (!list?.length) return "<p class='dfaq-empty'>暂无面试题</p>";
    return list
      .map(
        (qa) =>
          `<section class="dfaq-qa"><h4>Q · ${esc(qa.q)}</h4><p><strong>A ·</strong> ${esc(qa.a)}</p></section>`
      )
      .join("");
  }

  function openDialog(host, item, industry) {
    let dlg = host.querySelector(".dfaq-dialog");
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "dfaq-dialog";
      host.appendChild(dlg);
    }
    const ex = exampleText(industry, item.id);
    dlg.innerHTML = `
      <div class="dfaq-dialog-inner">
        <header class="dfaq-dialog-head">
          <div>
            <p class="dfaq-dialog-kicker">${esc(item.kind === "layer" ? "数仓分层" : "技术栈")}</p>
            <h2 id="dfaq-dialog-title">${esc(item.title)}</h2>
            <p class="dfaq-dialog-tagline">${esc(item.tagline || "")}</p>
          </div>
          <button type="button" class="dfaq-close" aria-label="关闭">×</button>
        </header>
        <div class="dfaq-tabs" role="tablist">
          <button type="button" class="dfaq-tab is-active" data-tab="beginner" role="tab" aria-selected="true">基础</button>
          <button type="button" class="dfaq-tab" data-tab="advanced" role="tab" aria-selected="false">进阶</button>
          <button type="button" class="dfaq-tab" data-tab="interview" role="tab" aria-selected="false">面试常见问</button>
        </div>
        <div class="dfaq-panels">
          <div class="dfaq-panel is-active" data-panel="beginner">${blocksHtml(item.beginner)}</div>
          <div class="dfaq-panel" data-panel="advanced">${blocksHtml(item.advanced)}</div>
          <div class="dfaq-panel" data-panel="interview">${interviewHtml(item.interview)}</div>
        </div>
        ${ex ? `<aside class="dfaq-example"><strong>本行业例子</strong><p>${esc(ex)}</p></aside>` : ""}
      </div>`;

    dlg.querySelector(".dfaq-close")?.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) dlg.close();
    });
    dlg.querySelectorAll(".dfaq-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const name = tab.dataset.tab;
        dlg.querySelectorAll(".dfaq-tab").forEach((t) => {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        dlg.querySelectorAll(".dfaq-panel").forEach((p) => {
          p.classList.toggle("is-active", p.dataset.panel === name);
        });
      });
    });

    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function mount(root, opts) {
    const el = typeof root === "string" ? document.querySelector(root) : root;
    if (!el) return null;
    const industry = opts?.industry || document.body?.dataset?.industry || "";
    const data = getData();

    el.classList.add("dfaq-root");
    el.innerHTML = `
      <p class="dfaq-lead">点击芯片打开答疑弹框：基础 / 进阶 / 面试常见问。分层用通俗技术语言说明「这一层干什么」；技术栈结合作品集落地与常见考点。</p>
      ${renderChips(data.layers, "数仓分层")}
      ${renderChips(data.tech, "落地技术栈")}
      <div class="dfaq-dialog-host"></div>`;

    const host = el.querySelector(".dfaq-dialog-host");
    el.addEventListener("click", (e) => {
      const btn = e.target.closest(".dfaq-chip");
      if (!btn) return;
      const item = findItem(btn.dataset.faqId);
      if (!item) return;
      openDialog(host, item, industry);
    });

    return { el, industry };
  }

  window.DataFaq = { mount, findItem, getData };
})();
