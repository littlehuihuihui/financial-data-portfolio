window.DashState = (function () {
  "use strict";
  const KEY = "internet_dashboard_state";
  const defaults = { role: "operation_lead", month: "202607", channel: "全部", dashboard: "overview" };
  const ROLE_ALIASES = { growth_lead: "user_growth", growth: "user_growth" };
  const VALID_ROLES = new Set(["operation_lead", "content_ops", "user_growth", "commercial"]);

  function normalize(parsed) {
    const next = { ...parsed };
    if (ROLE_ALIASES[next.role]) next.role = ROLE_ALIASES[next.role];
    if (next.role && !VALID_ROLES.has(next.role)) next.role = defaults.role;
    if (!next.dashboard) next.dashboard = defaults.dashboard;
    return next;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...defaults, ...normalize(parsed) };
    } catch {
      return { ...defaults };
    }
  }

  function save(partial) {
    const next = normalize({ ...load(), ...partial });
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("dashstatechange", { detail: next }));
    return next;
  }

  function applyRowFilters(meta, roleConfig) {
    const filters = roleConfig?.row_filters || {};
    const channels = meta.channels || ["全部"];
    let channel = load().channel;
    if (filters.channel?.length === 1 && channels.includes(filters.channel[0])) channel = filters.channel[0];
    return { channel };
  }

  return { load, save, defaults, applyRowFilters, KEY };
})();
