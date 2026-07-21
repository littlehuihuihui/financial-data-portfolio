/* 方法论页交互 · 六层框架 */
(function () {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const detailPanel = document.getElementById("detail-panel");
  const searchInput = document.getElementById("search-input");
  const searchMeta = document.getElementById("search-meta");
  const mobileToggle = document.getElementById("mobile-toggle");

  let activeId = "q01";
  let activeToolboxId = null;
  let collapsedLayers = new Set();

  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  function toolboxMethodTitle(id) {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories || !id) return "";
    for (const cat of box.categories) {
      const m = (cat.methods || []).find((x) => x.id === id);
      if (m) return m.title;
    }
    return "";
  }

  function toolboxMethodCount() {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories) return 0;
    return box.categories.reduce((n, c) => n + (c.methods?.length || 0), 0);
  }

  function renderToolboxSidebar(kw, counter) {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories) return "";
    const catHtml = box.categories.map((cat) => {
      const methods = (cat.methods || []).filter((m) => {
        const hay = `${m.title} ${m.explain || ""} ${m.businessQuestion || ""} ${m.aliases || ""}`.toLowerCase();
        const match = !kw || hay.includes(kw);
        if (match) counter.count += 1;
        return match;
      });
      if (!methods.length) return "";
      const btns = methods.map((m) => `
        <button class="q-card toolbox-nav-card${m.id === activeToolboxId ? " active" : ""}" data-toolbox-id="${esc(m.id)}" type="button">
          <span class="q-title">${esc(m.title)}</span>
          <span class="q-desc">${esc(m.businessQuestion || "")}</span>
        </button>`).join("");
      return `<div class="cat-label">${esc(cat.name)}</div>${btns}`;
    }).join("");
    const collapsed = collapsedLayers.has("l6");
    return `
      <div class="layer-block${collapsed ? " collapsed" : ""}" data-layer="l6">
        <div class="layer-header" data-toggle="l6">
          <span class="layer-dot" style="background:#ec4899"></span>
          <span>第六层 · 用什么方法？ <em class="layer-count">(${toolboxMethodCount()})</em></span>
          <span class="chevron">▼</span>
        </div>
        <div class="layer-items">${catHtml || '<p style="color:var(--text3);font-size:12px;padding:8px">无匹配方法</p>'}</div>
      </div>`;
  }

  function renderSidebar(filter = "") {
    const kw = filter.trim().toLowerCase();
    let visibleCount = 0;
    const toolboxCounter = { count: 0 };
    const layersHtml = LAYERS.map(layer => {
      const items = PLAYBOOKS.filter(p => p.layer === layer.id);
      const cards = items.map(p => {
        const hay = (p.title + p.desc + p.bizQuestion + p.keywords.join(" ")).toLowerCase();
        const match = !kw || hay.includes(kw);
        if (match) visibleCount++;
        const cats = layer.categories || [];
        return { ...p, match, cat: p.category || "" };
      });

      const grouped = {};
      cards.forEach(c => {
        const key = c.cat || "default";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(c);
      });

      const catHtml = Object.entries(grouped).map(([cat, list]) => {
        const visible = list.filter(c => c.match);
        if (!visible.length) return "";
        const catLabel = cat !== "default" ? `<div class="cat-label">${esc(cat)}</div>` : "";
        const btns = visible.map(p => `
          <button class="q-card${p.id === activeId && !activeToolboxId ? " active" : ""}" data-id="${p.id}" type="button">
            <span class="q-title">${esc(p.title)}</span>
            <span class="q-desc">${esc(p.desc)}</span>
          </button>`).join("");
        return catLabel + btns;
      }).join("");

      const collapsed = collapsedLayers.has(layer.id);
      const count = items.length;
      return `
        <div class="layer-block${collapsed ? " collapsed" : ""}" data-layer="${layer.id}">
          <div class="layer-header" data-toggle="${layer.id}">
            <span class="layer-dot" style="background:${layer.color}"></span>
            <span>${esc(layer.short)} · ${esc(layer.question)} <em class="layer-count">(${count})</em></span>
            <span class="chevron">▼</span>
          </div>
          <div class="layer-items">${catHtml || '<p style="color:var(--text3);font-size:12px;padding:8px">无匹配问题</p>'}</div>
        </div>`;
    }).join("");

    sidebar.innerHTML = layersHtml + renderToolboxSidebar(kw, toolboxCounter);
    visibleCount += toolboxCounter.count;

    searchMeta.textContent = kw
      ? `搜索「${filter}」匹配 ${visibleCount} / ${PLAYBOOKS.length + toolboxMethodCount()} 项`
      : `共 ${PLAYBOOKS.length} 个分析问题 + ${toolboxMethodCount()} 种方法 · 当前：${
          activeToolboxId ? toolboxMethodTitle(activeToolboxId) : (PLAYBOOKS.find((p) => p.id === activeId)?.title || "")
        }`;

    sidebar.querySelectorAll(".q-card[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        selectPlaybook(btn.dataset.id);
        sidebar.classList.remove("open");
      });
    });
    sidebar.querySelectorAll("[data-toolbox-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectToolboxMethod(btn.dataset.toolboxId));
    });
    sidebar.querySelectorAll(".layer-header").forEach(h => {
      h.addEventListener("click", () => {
        const id = h.dataset.toggle;
        if (collapsedLayers.has(id)) collapsedLayers.delete(id);
        else collapsedLayers.add(id);
        renderSidebar(searchInput.value);
      });
    });
  }

  function renderCriteria(rows) {
    if (!rows || !rows.length) return "";
    const cls = { ok: "cell-ok", warn: "cell-warn", bad: "cell-bad" };
    const body = rows.map(r => `
      <tr>
        <td>${esc(r.dim)}</td>
        <td class="${cls.ok}">${esc(r.ok)}</td>
        <td class="${cls.warn}">${esc(r.warn)}</td>
        <td class="${cls.bad}">${esc(r.bad)}</td>
      </tr>`).join("");
    return `
      <table class="criteria-table">
        <thead><tr><th>维度</th><th>正常</th><th>关注</th><th>异常</th></tr></thead>
        <tbody>${body}</tbody>
      </table>`;
  }

  function renderSteps(steps) {
    return steps.map((s, i) => `
      <div class="step-block">
        <div class="step-head">Step ${i + 1}：${esc(s.title)}</div>
        <div class="step-body">
          ${s.desc ? `<p>${esc(s.desc)}</p>` : ""}
          ${s.sql ? `<pre class="sql-block">${esc(s.sql.trim())}</pre>` : ""}
          ${s.judge ? `<p class="step-label"><strong>判断：</strong>${esc(s.judge)}</p>` : ""}
          ${s.output ? `<p class="step-label"><strong>预期输出：</strong>${esc(s.output)}</p>` : ""}
        </div>
      </div>`).join("");
  }

  function renderDetail(p) {
    if (!p) return;
    const layer = LAYERS.find(l => l.id === p.layer);
    detailPanel.innerHTML = `
      <div class="detail-inner">
        <header class="detail-head">
          <span class="detail-badge" style="background:${layer.color}22;color:${layer.color}">${esc(layer.name)}</span>
          <h2>📌 ${esc(p.title)}</h2>
          <p class="biz-q">业务问：「${esc(p.bizQuestion)}」</p>
        </header>

        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">触发条件</h3>
          <ul class="trigger-list">${p.triggers.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        </section>

        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">分析步骤</h3>
          ${renderSteps(p.steps)}
        </section>

        ${p.criteria && p.criteria.length ? `
        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">判断标准汇总</h3>
          ${renderCriteria(p.criteria)}
        </section>` : ""}

        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">产出物</h3>
          <ul class="output-list">${p.outputs.map(o => `<li>${esc(o)}</li>`).join("")}</ul>
        </section>

        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">下一步建议</h3>
          <ul class="next-list">${p.nextSteps.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        </section>

        <section class="section" style="--accent:${layer.color}">
          <h3 class="section-title">关联看板 / 视图</h3>
          <div class="dash-tags">${p.dashboards.map(d => `<span class="dash-tag">${esc(d)}</span>`).join("")}</div>
        </section>
      </div>`;
  }

  function selectPlaybook(id) {
    activeId = id;
    activeToolboxId = null;
    const p = PLAYBOOKS.find(x => x.id === id);
    renderSidebar(searchInput.value);
    renderDetail(p);
    history.replaceState(null, "", `#${id}`);
  }

  function selectToolboxMethod(id) {
    activeToolboxId = id;
    renderSidebar(searchInput.value);
    if (window.AnalysisToolboxUI?.renderMethodDetail) {
      window.AnalysisToolboxUI.renderMethodDetail("detail-panel", id);
    }
    history.replaceState(null, "", `#toolbox-${id}`);
    sidebar.classList.remove("open");
  }

  searchInput.addEventListener("input", () => renderSidebar(searchInput.value));
  mobileToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  function initPage() {
    const hash = location.hash.replace("#", "");
    if (hash.startsWith("toolbox-")) {
      activeToolboxId = hash.slice(8);
    } else if (hash && PLAYBOOKS.some((p) => p.id === hash)) {
      activeId = hash;
    }
    renderSidebar();
    if (activeToolboxId) {
      selectToolboxMethod(activeToolboxId);
    } else {
      selectPlaybook(activeId);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
