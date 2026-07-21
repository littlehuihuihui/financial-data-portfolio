window.DashNav = (function () {
  "use strict";
  let dashboards = [], roles = {};
  async function initConfig() {
    const [dRes, rRes] = await Promise.all([
      fetch("config/dashboards.json").then((r) => r.json()),
      fetch("config/roles.json").then((r) => r.json()),
    ]);
    dashboards = dRes.dashboards || [];
    roles = rRes.roles || {};
    return { dashboards, roles, defaultRole: rRes.default_role || "growth_lead" };
  }
  function getRoleConfig(roleId) { return roles[roleId] || roles.growth_lead; }
  function allowedDashboards(roleId) {
    const ids = getRoleConfig(roleId).dashboards || [];
    return dashboards.filter((d) => ids.includes(d.id));
  }
  function renderNav(container, roleId, activeId, onSelect) {
    const list = allowedDashboards(roleId);
    container.innerHTML = `
      <div class="dash-nav-role">
        <label>角色 <select id="role-select">${Object.entries(roles).map(([k, v]) =>
          `<option value="${k}" ${k === roleId ? "selected" : ""}>${v.label}</option>`).join("")}</select></label>
        <span class="role-hint">${getRoleConfig(roleId).label} · ${list.length} 个看板</span>
      </div>
      <nav class="dash-nav-tabs">${list.map((d) =>
        `<button type="button" class="dash-nav-tab ${d.id === activeId ? "active" : ""}" data-dashboard="${d.id}">${d.icon || ""} ${d.title}</button>`
      ).join("")}</nav>`;
    container.querySelector("#role-select")?.addEventListener("change", (e) => {
      DashState.save({ role: e.target.value });
      onSelect(getRoleConfig(e.target.value).dashboards[0], true);
    });
    container.querySelectorAll(".dash-nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => onSelect(btn.dataset.dashboard, false));
    });
  }
  function getDashboardMeta(id) { return dashboards.find((d) => d.id === id); }
  return { initConfig, renderNav, getDashboardMeta, allowedDashboards, getRoleConfig };
})();
