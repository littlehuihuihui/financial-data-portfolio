window.DashState = (function () {
  "use strict";
  const KEY = "manufacturing_dashboard_state";
  const defaults = { role: "plant_manager", month: "202607", factory: "全部", dashboard: "production" };
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed.dashboard === "dau" || parsed.role === "growth_lead") {
        parsed.dashboard = "production";
        parsed.role = "plant_manager";
      }
      return { ...defaults, ...parsed };
    } catch { return { ...defaults }; }
  }
  function save(partial) {
    const next = { ...load(), ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("dashstatechange", { detail: next }));
    return next;
  }
  function applyRowFilters(meta, roleConfig) {
    const filters = roleConfig?.row_filters || {};
    const factories = meta.factories || ["全部"];
    let factory = load().factory || "全部";
    if (filters.factory?.length === 1 && factories.includes(filters.factory[0])) factory = filters.factory[0];
    return { factory };
  }
  return { load, save, defaults, applyRowFilters, KEY };
})();
