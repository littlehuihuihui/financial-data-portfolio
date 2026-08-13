/**
 * 分阶段北极星 · 共用渲染（紧凑筛选栏版）
 * 数据：window.NORTHSTAR_PHASES（各行业 northstar-phases-data.js）
 * 挂载：#northstar-phases
 * 切换阶段会派发 northstar-phase-change，并由壳层跳转主看看板、重标 KPI。
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

  function getActivePhase() {
    const data = getData();
    if (!data?.phases?.length) return null;
    return phaseById(data, selectedId(data));
  }

  function nameMatch(cardName, target) {
    const a = String(cardName || "").replace(/\s+/g, "").toLowerCase();
    const b = String(target || "").replace(/\s+/g, "").toLowerCase();
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
  }

  /** 按当前阶段重标 KPI 角色（北极星 / 围栏） */
  function applyKpiRoles(cards) {
    const phase = getActivePhase();
    const list = Array.isArray(cards) ? cards : [];
    if (!phase) return list.map((c) => ({ ...c }));

    const nsName = phase.northstar?.name || "";
    const aliases = phase.northstar?.aliases || [];
    const guards = phase.guardrails || [];
    const isNs = (name) =>
      (nsName && nameMatch(name, nsName)) || aliases.some((a) => nameMatch(name, a));

    return list.map((c) => {
      const name = c.name || c.kpi_name || "";
      let role = c.role;
      if (isNs(name)) {
        role = "northstar";
      } else if (guards.some((g) => nameMatch(name, g) || String(g).includes(name))) {
        role = "guardrail";
      } else if (role === "northstar") {
        role = "core";
      }
      return role ? { ...c, role } : { ...c };
    });
  }

  function render(root, data, activeId) {
    const phase = phaseById(data, activeId);
    const ns = phase.northstar || {};
    const valueText = `${ns.value_display || "—"}${ns.unit || ""}`;
    const opts = data.phases
      .map((p, i) => {
        const sel = p.id === phase.id ? "selected" : "";
        return `<option value="${esc(p.id)}" ${sel}>P${i + 1} ${esc(p.name)} · ${esc(p.northstar?.name || "")}</option>`;
      })
      .join("");

    root.innerHTML = `
      <div class="ns-toolbar" data-phase-id="${esc(phase.id)}">
        <label class="ns-toolbar-label">北极星阶段
          <select id="ns-phase-select" aria-label="分阶段北极星">${opts}</select>
        </label>
        <div class="ns-toolbar-star" title="${esc(ns.formula || "")}">
          <span class="kpi-role kpi-role-northstar">北极星</span>
          <strong class="ns-toolbar-name">${esc(ns.name || "—")}</strong>
          <em class="ns-toolbar-value">${esc(valueText)}</em>
        </div>
        <details class="ns-toolbar-more">
          <summary>阶段说明</summary>
          <div class="ns-toolbar-popover">
            <p><b>为什么换</b> ${esc(phase.why || "—")}</p>
            <p><b>本阶段目标</b> ${esc(phase.goal || "—")}</p>
            <p><b>围栏</b> ${(phase.guardrails || []).map(esc).join(" · ") || "—"}</p>
            <p><b>主看看板</b> ${esc(phase.focus_dashboards || "—")}</p>
          </div>
        </details>
      </div>`;
  }

  function bind(root, data) {
    root.addEventListener("change", (e) => {
      const sel = e.target.closest("#ns-phase-select");
      if (!sel) return;
      const id = sel.value;
      const phase = phaseById(data, id);
      window.DashState?.save?.({ nsPhase: id });
      render(root, data, id);
      window.dispatchEvent(
        new CustomEvent("northstar-phase-change", {
          detail: {
            id,
            phase,
            primary_dashboard: phase.primary_dashboard || null,
            focus_ids: phase.focus_ids || [],
          },
        })
      );
    });
  }

  function patchDashboardContext(scope) {
    const phase = getActivePhase();
    if (!phase) return;
    const root = scope || document;
    const legend = root.querySelector?.(".monitor-legend") || document.querySelector(".monitor-legend");
    if (legend) {
      const ns = phase.northstar?.name || "—";
      const guards = (phase.guardrails || []).slice(0, 3).join("、") || "—";
      legend.innerHTML = `
        <span><strong>北极星</strong> 当前阶段「${esc(phase.name)}」= ${esc(ns)}</span>
        <span><strong>围栏</strong> ${esc(guards)}</span>
        <span><strong>主看</strong> ${esc(phase.focus_dashboards || "—")}</span>`;
    }
    const desc = root.querySelector?.(".dashboard-page-desc") || document.querySelector(".dashboard-page-desc");
    if (desc && desc.dataset.nsBase == null) {
      desc.dataset.nsBase = desc.textContent || "";
    }
    if (desc) {
      const base = desc.dataset.nsBase || "";
      const tip = `当前北极星阶段：${phase.name}（${phase.northstar?.name || "—"}）。`;
      desc.textContent = tip + (base ? " " + base.replace(/^页顶可切换.*?；/, "") : "");
    }
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
    return { data, activeId: id, phase: phaseById(data, id) };
  }

  window.NorthstarPhases = {
    mount,
    getData,
    getActivePhase,
    applyKpiRoles,
    patchDashboardContext,
  };
})();
