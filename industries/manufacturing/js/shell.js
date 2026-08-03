(function () {
  "use strict";
  const contentEl = () => document.getElementById("dashboard-content");
  const statusEl = () => document.getElementById("status-bar");
  const DATA_END_YEAR = 2026;
  const DATA_END_MONTH = 7;
  let meta = { factories: ["全部"], default_month: 202607 };
  let roleConfig = {};

  function setStatus(msg, err) {
    const el = statusEl();
    if (el) { el.textContent = msg; el.className = "dashboard-status-bar " + (err ? "error" : "ok"); }
  }

  function parseHash() {
    return (location.hash || "").replace("#", "") || DashState.load().dashboard || "production";
  }

  function buildMonthOptions(current) {
    const opts = [];
    for (let y = DATA_END_YEAR; y >= 2024; y--) {
      for (let m = 12; m >= 1; m--) {
        if (y === DATA_END_YEAR && m > DATA_END_MONTH) continue;
        const id = `${y}${String(m).padStart(2, "0")}`;
        opts.push(`<option value="${id}" ${id === current ? "selected" : ""}>${y}-${String(m).padStart(2, "0")}</option>`);
      }
    }
    return opts.join("");
  }

  function optionList(arr, current) {
    return (arr || []).map((v) => `<option value="${v}" ${v === current ? "selected" : ""}>${v}</option>`).join("");
  }

  function renderFilters(dashboardId) {
    const dash = DashNav.getDashboardMeta(dashboardId);
    const state = DashState.load();
    const filters = dash?.filters || [];
    const rf = DashState.applyRowFilters(meta, roleConfig);
    const el = document.getElementById("dash-filters");
    el.innerHTML = `
      ${filters.includes("month") ? `<label>分析月份 <select id="filter-month">${buildMonthOptions(state.month)}</select></label>` : ""}
      ${filters.includes("factory") ? `<label>工厂 <select id="filter-factory">${optionList(meta.factories, rf.factory || state.factory)}</select></label>` : ""}
      <button type="button" class="btn-dash" id="btn-refresh">刷新</button>`;
    const locked = roleConfig.row_filters?.factory?.length === 1;
    if (locked) document.getElementById("filter-factory")?.setAttribute("disabled", "disabled");
    document.getElementById("filter-month")?.addEventListener("change", (e) => {
      DashState.save({ month: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("filter-factory")?.addEventListener("change", (e) => {
      DashState.save({ factory: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("btn-refresh")?.addEventListener("click", () => loadDashboard(dashboardId));
  }

  async function loadDashboard(id, switchRole) {
    const dash = DashNav.getDashboardMeta(id);
    if (!dash) {
      contentEl().innerHTML = `<div class="empty-hint error">看板「${id}」不存在，请从上方导航选择。</div>`;
      setStatus("看板不存在: " + id, true);
      return;
    }
    DashState.save({ dashboard: id });
    if (!switchRole) updateHash(id);
    DashNav.renderNav(document.getElementById("dash-nav"), DashState.load().role, id, loadDashboard);
    renderFilters(id);
    contentEl().innerHTML = '<div class="empty-hint">加载中…</div>';
    try {
      const html = await fetch(dash.file).then((r) => r.text());
      contentEl().innerHTML = html;
      const state = { ...DashState.load(), ...DashState.applyRowFilters(meta, roleConfig) };
      await DashLoaders.load(id, state);
      DashCore.bindExportButtons(contentEl());
      setStatus(DashCore.statusFooter(dash.title, state.month));
    } catch (e) {
      contentEl().innerHTML = `<div class="empty-hint error">${e.message}</div>`;
      setStatus(e.message, true);
    }
  }

  function updateHash(id) {
    if (location.hash.replace("#", "") !== id) history.pushState({ dashboard: id }, "", `#${id}`);
  }

  async function boot() {
    try {
      const cfg = await DashNav.initConfig();
      const state = DashState.load();
      roleConfig = DashNav.getRoleConfig(state.role || cfg.defaultRole);
      try {
        meta = await DashCore.api("/api/meta");
      } catch {
        meta = { factories: ["全部", "华南工厂", "华东工厂", "华北工厂"], default_month: 202607 };
      }
      const onHash = () => {
        const id = parseHash();
        if (DashNav.getDashboardMeta(id)) loadDashboard(id);
      };
      await loadDashboard(parseHash());
      window.addEventListener("popstate", onHash);
      window.addEventListener("hashchange", onHash);
      window.addEventListener("dash-refresh", () => loadDashboard(parseHash()));
      window.addEventListener("resize", () => DashCore.resizeAll());
    } catch (e) {
      setStatus("初始化失败: " + e.message, true);
    }
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
