window.DashState = (function () {
  "use strict";
  const KEY = "internet_dashboard_state";
  const defaults = { role: "operation_lead", month: "202607", channel: "全部", dashboard: "overview" };
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
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
    const channels = meta.channels || ["全部"];
    let channel = load().channel;
    if (filters.channel?.length === 1 && channels.includes(filters.channel[0])) channel = filters.channel[0];
    return { channel };
  }
  return { load, save, defaults, applyRowFilters, KEY };
})();
