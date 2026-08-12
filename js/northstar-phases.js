/**
 * 分阶段北极星 · 共用渲染
 * 数据：window.NORTHSTAR_PHASES（各行业 northstar-phases-data.js）
 * 挂载：#northstar-phases
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
    return window.NORTHSTAR_PHASES || null;
  }

  function selectedId(data) {
    const saved = window.DashState?.load?.()?.nsPhase;
    if (saved && data.phases.some((p) => p.id === saved)) return saved;
    return data.currentPhaseId || data.phases[0]?.id;
  }

  function phaseById(data, id) {
    return data.phases.find((p) => p.id === id) || data.phases[0];
  }

  function render(root, data, activeId) {
    const phase = phaseById(data, activeId);
    const ns = phase.northstar || {};
    const steps = data.phases
      .map((p, i) => {
        const active = p.id === phase.id ? "is-active" : "";
        const done = data.phases.findIndex((x) => x.id === phase.id) > i ? "is-done" : "";
        return `
          <button type="button" class="ns-phase-step ${active} ${done}" data-phase-id="${esc(p.id)}" title="${esc(p.goal || "")}">
            <span class="ns-phase-idx">P${i + 1}</span>
            <span class="ns-phase-name">${esc(p.name)}</span>
            <span class="ns-phase-metric">${esc(p.northstar?.name || "")}</span>
          </button>`;
      })
      .join('<span class="ns-phase-arrow" aria-hidden="true">→</span>');

    root.innerHTML = `
      <div class="ns-phases-panel">
        <div class="ns-phases-head">
          <div>
            <h2 class="ns-phases-title">分阶段北极星</h2>
            <p class="ns-phases-sub">${esc(data.subtitle || "北极星随项目阶段演进，不是一成不变的单一 KPI。")}</p>
          </div>
          <div class="ns-phases-current-tag">当前阶段 · ${esc(phase.name)}</div>
        </div>
        <div class="ns-phase-track" role="tablist" aria-label="项目阶段">${steps}</div>
        <div class="ns-phase-detail">
          <div class="ns-star-card">
            <div class="ns-star-label"><span class="kpi-role kpi-role-northstar">北极星</span>${esc(ns.name || "")}</div>
            <div class="ns-star-value">${esc(ns.value_display || "—")}${ns.unit ? `<span class="ns-star-unit">${esc(ns.unit)}</span>` : ""}</div>
            <div class="ns-star-formula">${esc(ns.formula || "")}</div>
          </div>
          <div class="ns-phase-meta">
            <div class="ns-meta-block">
              <h3>为什么换北极星</h3>
              <p>${esc(phase.why || "")}</p>
            </div>
            <div class="ns-meta-block">
              <h3>本阶段目标</h3>
              <p>${esc(phase.goal || "")}</p>
            </div>
            <div class="ns-meta-block">
              <h3>围栏（不可击穿）</h3>
              <ul class="ns-guard-list">
                ${(phase.guardrails || []).map((g) => `<li>${esc(g)}</li>`).join("") || "<li>—</li>"}
              </ul>
            </div>
            <div class="ns-meta-block">
              <h3>主看看板</h3>
              <p>${esc(phase.focus_dashboards || "—")}</p>
            </div>
          </div>
        </div>
      </div>`;
  }

  function bind(root, data) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".ns-phase-step");
      if (!btn) return;
      const id = btn.dataset.phaseId;
      window.DashState?.save?.({ nsPhase: id });
      render(root, data, id);
      window.dispatchEvent(new CustomEvent("northstar-phase-change", { detail: { id, phase: phaseById(data, id) } }));
    });
  }

  function mount(selector) {
    const data = getData();
    const root = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!root || !data?.phases?.length) return null;
    const id = selectedId(data);
    render(root, data, id);
    if (!root.dataset.nsBound) {
      bind(root, data);
      root.dataset.nsBound = "1";
    }
    return { data, activeId: id };
  }

  window.NorthstarPhases = { mount, getData };
})();
