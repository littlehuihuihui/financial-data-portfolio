(function () {
  "use strict";
  const contentEl = () => document.getElementById("dashboard-content");
  const statusEl = () => document.getElementById("status-bar");
  const DATA_END_YEAR = 2026;
  const DATA_END_MONTH = 7;
  let meta = { channels: ["全部"], default_month: 202607 };
  let roleConfig = {};

  function setStatus(msg, err) {
    const el = statusEl();
    if (el) { el.textContent = msg; el.className = "dashboard-status-bar " + (err ? "error" : "ok"); }
  }

  function parseHash() {
    return (location.hash || "").replace("#", "") || DashState.load().dashboard || "overview";
  }

  function buildMonthOptions(current) {
    const opts = [];
    const months = ["202607", "202606", "202605", "202604"];
    months.forEach((id) => {
      const lbl = `${id.slice(0, 4)}-${id.slice(4, 6)}`;
      opts.push(`<option value="${id}" ${id === current ? "selected" : ""}>${lbl}</option>`);
    });
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
      ${filters.includes("channel") ? `<label>渠道 <select id="filter-channel">${optionList(meta.channels, rf.channel || state.channel)}</select></label>` : ""}
      <button type="button" class="btn-dash" id="btn-refresh">刷新</button>`;
    document.getElementById("filter-month")?.addEventListener("change", (e) => {
      DashState.save({ month: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("filter-channel")?.addEventListener("change", (e) => {
      DashState.save({ channel: e.target.value });
      loadDashboard(dashboardId);
    });
    document.getElementById("btn-refresh")?.addEventListener("click", () => loadDashboard(dashboardId));
  }

  async function loadDashboard(id, switchRole) {
    const dash = DashNav.getDashboardMeta(id);
    if (!dash) { setStatus("看板不存在", true); return; }
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
      const hint = DashCore.preferDemo?.() || DashCore.usingDemo
        ? `<br><small>请确认 <code>data/demo</code> 演示数据已部署。</small>`
        : (/Failed to fetch|NetworkError|ECONNREFUSED|Load failed/i.test(String(e.message || e))
          ? `<br><small>请先运行互联网 API（端口 5001），或在 GitHub Pages 使用演示数据。</small>`
          : "");
      contentEl().innerHTML = `<div class="empty-hint error">加载失败：${e.message || e}${hint}</div>`;
      setStatus(DashCore.usingDemo ? "静态演示模式" : "API 未连接或查询失败", true);
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
        meta = { channels: ["全部", "自然搜索", "应用商店", "信息流广告", "社交裂变"], default_month: 202607 };
      }
      const onHash = () => {
        const id = parseHash();
        if (DashNav.getDashboardMeta(id)) loadDashboard(id);
      };
      await loadDashboard(parseHash());
      window.NorthstarPhases?.mount?.("#northstar-phases");
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
