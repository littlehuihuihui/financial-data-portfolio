/**
 * 跃动体育 · 看板筛选状态共享（localStorage）
 */
window.DashState = (function () {
  "use strict";
  const KEY = "yuedong_dashboard_state";

  const defaults = {
    role: "finance_bp",
    month: "202606",
    brand: "全部",
    channel: "全部",
    dashboard: "overview",
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  }

  function save(partial) {
    const next = { ...load(), ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("dashstatechange", { detail: next }));
    return next;
  }

  function applyRowFilters(meta, roleConfig) {
    const filters = roleConfig?.row_filters || {};
    const brands = meta.brands || ["全部"];
    const channels = meta.channels || ["全部"];
    let brand = load().brand;
    let channel = load().channel;
    if (filters.brand?.length === 1) {
      const allowed = filters.brand[0];
      if (brands.includes(allowed)) brand = allowed;
    }
    if (filters.channel?.length === 1) {
      const allowed = filters.channel[0];
      if (channels.includes(allowed)) channel = allowed;
    }
    return { brand, channel };
  }

  return { load, save, defaults, applyRowFilters, KEY };
})();
