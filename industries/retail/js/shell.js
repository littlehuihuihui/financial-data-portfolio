/**
 * 跃动体育 · 看板 Shell（SPA 路由 + 状态共享）
 */
(function () {
  "use strict";

  const contentEl = () => document.getElementById("dashboard-content");
  const statusEl = () => document.getElementById("status-bar");
  const navEl = () => document.getElementById("dash-nav");
  const filtersEl = () => document.getElementById("dash-filters");

  let meta = { brands: ["全部"], channels: ["全部"], default_month: 202606 };
  let roleConfig = {};

  function setStatus(msg, err) {
    const el = statusEl();
    if (!el) return;
    el.textContent = msg;
    el.className = "dashboard-status-bar " + (err ? "error" : "ok");
  }

  function parseHash() {
    const h = (location.hash || "").replace("#", "");
    return h || DashState.load().dashboard || "overview";
  }

  function updateHash(id) {
    if (location.hash.replace("#", "") !== id) {
      history.pushState({ dashboard: id }, "", `#${id}`);
    }
  }

  function renderFilters(dashboardId) {
    const dash = DashNav.getDashboardMeta(dashboardId);
    const state = DashState.load();
    const filters = dash?.filters || ["month"];
    const rf = DashState.applyRowFilters(meta, roleConfig);

    filtersEl().innerHTML = `
      ${filters.includes("month") ? `<label>分析月份
        <select id="filter-month">${buildMonthOptions(state.month)}</select></label>` : ""}
      ${filters.includes("brand") ? `<label>品牌
        <select id="filter-brand">${optionList(meta.brands, rf.brand)}</select></label>` : ""}
      ${filters.includes("channel") ? `<label>渠道
        <select id="filter-channel">${optionList(meta.channels, rf.channel)}</select></label>` : ""}
      <button type="button" class="btn-dash" id="btn-refresh">刷新</button>`;

    const lockedBrand = roleConfig.row_filters?.brand?.length === 1;
    const lockedChannel = roleConfig.row_filters?.channel?.length === 1;
    if (lockedBrand) document.getElementById("filter-brand")?.setAttribute("disabled", "disabled");
    if (lockedChannel) document.getElementById("filter-channel")?.setAttribute("disabled", "disabled");

    document.getElementById("filter-month")?.addEventListener("change", (e) => {
      DashState.save({ month: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("filter-brand")?.addEventListener("change", (e) => {
      DashState.save({ brand: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("filter-channel")?.addEventListener("change", (e) => {
      DashState.save({ channel: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("btn-refresh")?.addEventListener("click", () => loadDashboard(dashboardId));
  }

  function maxAvailableMonth() {
    const dm = Number(meta.default_month) || 202606;
    return String(dm);
  }

  function clampMonth(month) {
    const max = maxAvailableMonth();
    const cur = String(month || max);
    return cur > max ? max : cur;
  }

  function buildMonthOptions(current) {
    const opts = [];
    const maxId = maxAvailableMonth();
    const endY = Number(maxId.slice(0, 4));
    const endM = Number(maxId.slice(4, 6));
    for (let y = endY; y >= 2024; y--) {
      for (let m = 12; m >= 1; m--) {
        if (y === endY && m > endM) continue;
        const id = `${y}${String(m).padStart(2, "0")}`;
        opts.push(`<option value="${id}" ${id === current ? "selected" : ""}>${y}-${String(m).padStart(2, "0")}</option>`);
      }
    }
    return opts.join("");
  }

  function optionList(arr, current) {
    return (arr || []).map((v) => `<option value="${v}" ${v === current ? "selected" : ""}>${v}</option>`).join("");
  }

  async function fetchDashboardHtml(dashboardId) {
    const dash = DashNav.getDashboardMeta(dashboardId);
    if (!dash?.file) throw new Error("看板配置缺失");
    const res = await fetch(dash.file);
    if (!res.ok) throw new Error(`加载看板模板失败: ${dash.file}`);
    return res.text();
  }

  async function loadDashboard(dashboardId) {
    const dash = DashNav.getDashboardMeta(dashboardId);
    if (!dash) {
      setStatus("无权限或看板不存在", true);
      return;
    }
    DashState.save({ dashboard: dashboardId });
    updateHash(dashboardId);
    renderFilters(dashboardId);
    setStatus(`加载 ${dash.title}…`);

    try {
      const html = await fetchDashboardHtml(dashboardId);
      contentEl().innerHTML = html;
      const state = { ...DashState.load(), ...DashState.applyRowFilters(meta, roleConfig) };
      await DashLoaders.load(dashboardId, state);
      DashCore.bindExportButtons(contentEl());
      setStatus(DashCore.statusFooter(dash.title, state.month));
    } catch (err) {
      console.error(err);
      const demoHint = DashCore.preferDemo?.() || DashCore.usingDemo
        ? "请确认 data/demo 演示数据已部署。"
        : "请确认已运行 app.py 且数仓 ADS 可用；静态站将自动使用演示数据。";
      contentEl().innerHTML = `<div class="empty-hint">加载失败：${err.message}<br>${demoHint}</div>`;
      setStatus(err.message, true);
    }
  }

  function switchDashboard(id, roleChanged) {
    const state = DashState.load();
    if (roleChanged) {
      DashNav.renderNav(navEl(), state.role, id, switchDashboard);
      roleConfig = DashNav.getRoleConfig(state.role);
    }
    loadDashboard(id);
  }

  async function boot() {
    const cfg = await DashNav.initConfig();
    const params = new URLSearchParams(location.search);
    const roleFromUrl = params.get("role");
    const state = DashState.load();
    if (roleFromUrl && DashNav.getRoleConfig(roleFromUrl)) {
      DashState.save({ role: roleFromUrl });
    }

    try {
      meta = await DashCore.api("/api/meta");
      const clamped = clampMonth(DashState.load().month || meta.default_month);
      DashState.save({ month: clamped });
      if (DashCore.usingDemo) setStatus("静态演示模式 · 图表为默认样例数据");
    } catch {
      setStatus(DashCore.preferDemo?.()
        ? "演示数据未加载 · 请检查 data/demo/meta.json"
        : "API 未连接 · 请先运行 app.py（或使用 GitHub Pages 演示模式）", true);
    }

    const currentRole = DashState.load().role || cfg.defaultRole;
    roleConfig = DashNav.getRoleConfig(currentRole);
    let dashId = parseHash();
    if (!roleConfig.dashboards.includes(dashId)) {
      dashId = roleConfig.dashboards[0];
    }

    DashNav.renderNav(navEl(), currentRole, dashId, switchDashboard);
    window.NorthstarPhases?.mount?.("#northstar-phases");
    await loadDashboard(dashId);

    const onHash = () => {
      const id = parseHash();
      if (roleConfig.dashboards.includes(id)) loadDashboard(id);
    };
    window.addEventListener("popstate", onHash);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("dash-refresh", () => loadDashboard(parseHash()));
    window.addEventListener("resize", () => DashCore.resizeAll());
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
