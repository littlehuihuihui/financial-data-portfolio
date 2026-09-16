window.DashNav = (function () {
  "use strict";
  let dashboards = [], roles = {}, defaultRole = "operation_lead";

  // 历史角色 id → 现行 id（避免 localStorage 残留导致整页白屏）
  const ROLE_ALIASES = {
    growth_lead: "user_growth",
    growth: "user_growth",
  };

  function resolveRoleId(roleId) {
    const aliased = ROLE_ALIASES[roleId] || roleId;
    if (aliased && roles[aliased]) return aliased;
    if (roles[defaultRole]) return defaultRole;
    return Object.keys(roles)[0] || defaultRole;
  }

  async function initConfig() {
    const [dRes, rRes] = await Promise.all([
      fetch("config/dashboards.json").then((r) => r.json()),
      fetch("config/roles.json").then((r) => r.json()),
    ]);
    dashboards = dRes.dashboards || [];
    roles = rRes.roles || {};
    defaultRole = rRes.default_role || "operation_lead";
    return { dashboards, roles, defaultRole };
  }

  function getRoleConfig(roleId) {
    const id = resolveRoleId(roleId);
    return roles[id] || {
      label: "运营负责人",
      dashboards: dashboards.map((d) => d.id),
      row_filters: {},
    };
  }

  function allowedDashboards(roleId) {
    const ids = getRoleConfig(roleId).dashboards || [];
    return dashboards.filter((d) => ids.includes(d.id));
  }

  function renderNav(container, roleId, activeId, onSelect) {
    const resolved = resolveRoleId(roleId);
    if (resolved !== roleId && window.DashState?.save) {
      DashState.save({ role: resolved });
    }
    const list = allowedDashboards(resolved);
    const cfg = getRoleConfig(resolved);
    container.innerHTML = `
      <div class="dash-nav-role">
        <label>角色 <select id="role-select">${Object.entries(roles).map(([k, v]) =>
          `<option value="${k}" ${k === resolved ? "selected" : ""}>${v.label}</option>`).join("")}</select></label>
        <span class="role-hint">${cfg.label || resolved} · ${list.length} 个看板</span>
      </div>
      <nav class="dash-nav-tabs">${list.map((d) =>
        `<button type="button" class="dash-nav-tab ${d.id === activeId ? "active" : ""}" data-dashboard="${d.id}">${d.icon || ""} ${d.title}</button>`
      ).join("")}</nav>`;
    container.querySelector("#role-select")?.addEventListener("change", (e) => {
      DashState.save({ role: e.target.value });
      const first = getRoleConfig(e.target.value).dashboards[0];
      onSelect(first, true);
    });
    container.querySelectorAll(".dash-nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => onSelect(btn.dataset.dashboard, false));
    });
  }

  function getDashboardMeta(id) { return dashboards.find((d) => d.id === id); }
  return { initConfig, renderNav, getDashboardMeta, allowedDashboards, getRoleConfig, resolveRoleId };
})();
