/**
 * 跃动体育 · 角色动态导航
 */
window.DashNav = (function () {
  "use strict";

  let dashboards = [];
  let roles = {};

  async function initConfig() {
    const [dRes, rRes] = await Promise.all([
      fetch("config/dashboards.json").then((r) => r.json()),
      fetch("config/roles.json").then((r) => r.json()),
    ]);
    dashboards = dRes.dashboards || [];
    roles = rRes.roles || {};
    return { dashboards, roles, defaultRole: rRes.default_role || "finance_bp" };
  }

  function getRoleConfig(roleId) {
    return roles[roleId] || roles.finance_bp;
  }

  function allowedDashboards(roleId) {
    const cfg = getRoleConfig(roleId);
    const ids = cfg.dashboards || [];
    return dashboards.filter((d) => ids.includes(d.id));
  }

  function renderNav(container, roleId, activeId, onSelect) {
    const list = allowedDashboards(roleId);
    const roleLabel = getRoleConfig(roleId).label || roleId;
    container.innerHTML = `
      <div class="dash-nav-role">
        <label>角色
          <select id="role-select">${Object.entries(roles).map(([k, v]) =>
            `<option value="${k}" ${k === roleId ? "selected" : ""}>${v.label}</option>`
          ).join("")}</select>
        </label>
        <span class="role-hint">${roleLabel} · ${list.length} 个看板</span>
      </div>
      <nav class="dash-nav-tabs" aria-label="看板导航">
        ${list.map((d) =>
          `<button type="button" class="dash-nav-tab ${d.id === activeId ? "active" : ""}"
            data-dashboard="${d.id}" title="${d.description || ""}">${d.icon || ""} ${d.title}</button>`
        ).join("")}
      </nav>`;

    container.querySelector("#role-select")?.addEventListener("change", (e) => {
      const newRole = e.target.value;
      DashState.save({ role: newRole });
      const first = getRoleConfig(newRole).dashboards[0];
      onSelect(first, true);
    });

    container.querySelectorAll(".dash-nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => onSelect(btn.dataset.dashboard, false));
    });
  }

  function getDashboardMeta(id) {
    return dashboards.find((d) => d.id === id);
  }

  return { initConfig, renderNav, getDashboardMeta, allowedDashboards, getRoleConfig };
})();
