/**
 * 互联网 · 看板核心工具
 */
window.DashCore = (function () {
  "use strict";

  const THEME = {
    accent: "#8e44ad",
    palette: ["#8e44ad", "#9b59b6", "#af7ac5", "#27ae60", "#e67e22", "#7f8c8d"],
    muted: "#8b95a8",
    text: "#e8edf5",
  };
  const charts = {};
  let DATA_SOURCE = "internet_analytics · MySQL ADS/DWS";
  let usingDemo = false;

  function preferDemo() {
    if (window.DEMO_MODE === true) return true;
    if (window.DEMO_MODE === false) return false;
    const host = location.hostname || "";
    return host.endsWith("github.io") || location.protocol === "file:";
  }

  function apiBase() {
    if (window.API_BASE_URL) return window.API_BASE_URL;
    if (preferDemo()) return "";
    if (window.location.protocol.startsWith("http")) return window.location.origin;
    return "http://127.0.0.1:5001";
  }

  function demoFileName(path) {
    return String(path || "").replace(/^\/?api\//, "").replace(/\//g, "_") + ".json";
  }

  async function loadDemo(path) {
    const url = new URL("data/demo/" + demoFileName(path), location.href);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`演示数据缺失: ${demoFileName(path)}`);
    const json = await res.json();
    usingDemo = true;
    DATA_SOURCE = "静态演示数据 · GitHub Pages";
    if (json && typeof json === "object" && "data" in json) return json.data;
    return json;
  }

  const apiCache = new Map();
  function apiCacheKey(path, params) {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v != null && v !== "") q.set(k, String(v));
      });
    }
    const qs = q.toString();
    return qs ? `${path}?${qs}` : path;
  }
  function clearApiCache() {
    apiCache.clear();
  }

  async function api(path, params) {
    const key = apiCacheKey(path, params);
    if (apiCache.has(key)) return apiCache.get(key);

    const store = (data) => {
      apiCache.set(key, data);
      return data;
    };

    if (preferDemo()) return store(await loadDemo(path));
    try {
      const url = new URL(apiBase() + path);
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v != null && v !== "") url.searchParams.set(k, v);
        });
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "API error");
      usingDemo = false;
      DATA_SOURCE = "internet_analytics · MySQL ADS/DWS";
      return store(json.data);
    } catch (err) {
      try {
        return store(await loadDemo(path));
      } catch {
        throw err;
      }
    }
  }

  function fmtNum(n, digits) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const v = Number(n);
    if (Math.abs(v) >= 1e8) return (v / 1e8).toFixed(2) + "亿";
    if (Math.abs(v) >= 1e4) return (v / 1e4).toFixed(2) + "万";
    return v.toLocaleString("zh-CN", { maximumFractionDigits: digits ?? 2 });
  }

  function fmtPctDelta(n) {
    if (n == null || Number.isNaN(Number(n))) return "";
    const v = Number(n);
    const arrow = v > 0 ? "↑" : v < 0 ? "↓" : "→";
    const cls = v > 0 ? "up" : v < 0 ? "down" : "";
    const sign = v > 0 ? "+" : "";
    return `<span class="delta ${cls}">${arrow}${sign}${v.toFixed(2)}%</span>`;
  }

  function monthLabel(id) {
    const s = String(id);
    return s.length === 6 ? `${s.slice(0, 4)}-${s.slice(4, 6)}` : s;
  }

  function initChart(id) {
    if (typeof echarts === "undefined") {
      console.warn("ECharts 尚未加载:", id);
      return null;
    }
    if (charts[id]) {
      charts[id].dispose();
      delete charts[id];
    }
    const dom = document.getElementById(id);
    if (!dom) return null;
    charts[id] = echarts.init(dom);
    return charts[id];
  }

  let echartsLoading = null;
  function ensureEcharts() {
    if (typeof window.echarts !== "undefined") return Promise.resolve();
    if (echartsLoading) return echartsLoading;
    echartsLoading = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-echarts-cdn]");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("ECharts 加载失败")));
        return;
      }
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js";
      s.dataset.echartsCdn = "1";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("ECharts 加载失败"));
      document.head.appendChild(s);
    });
    return echartsLoading;
  }

  function renderKpiGrid(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!items?.length) {
      el.innerHTML = '<div class="empty-hint">暂无数据</div>';
      return;
    }
    const ROLE_LABEL = {
      northstar: "北极星",
      guardrail: "围栏",
      core: "核心",
      leading: "先导",
    };
    el.innerHTML = items.map((c) => {
      const raw = c.value ?? c.kpi_value;
      const val = (raw == null || raw === "")
        ? "—"
        : (c.unit === "%"
          ? Number(raw).toFixed(2) + "%"
          : fmtNum(raw));
      const mom = c.mom_pct != null ? `环比 ${fmtPctDelta(c.mom_pct)}` : "";
      const yoy = c.yoy_pct != null ? `同比 ${fmtPctDelta(c.yoy_pct)}` : "";
      const sub = c.sub ? `<div class="kpi-sub">${c.sub}</div>` : "";
      const role = c.role || "";
      const roleTag = ROLE_LABEL[role]
        ? `<span class="kpi-role kpi-role-${role}">${ROLE_LABEL[role]}</span>`
        : "";
      const roleClass = role ? ` kpi-card-${role}` : "";
      return `<div class="kpi-card${roleClass}"><div class="name">${roleTag}${c.name ?? c.kpi_name}</div><div class="value">${val}</div><div class="kpi-delta">${mom} ${yoy}</div>${sub}</div>`;
    }).join("");
  }

  function renderTable(tbodyId, rows, cols) {
    const tb = document.getElementById(tbodyId);
    if (!tb) return;
    if (!rows?.length) {
      tb.innerHTML = '<tr><td colspan="99" class="empty-hint">暂无数据</td></tr>';
      return;
    }
    tb.innerHTML = rows.map((r) =>
      `<tr>${cols.map((c) => {
        let v = r[c.key];
        if (c.fmt === "num") v = fmtNum(v);
        if (c.fmt === "pct") v = v == null ? "—" : v + "%";
        return `<td class="${c.align === "right" ? "num" : ""}">${v ?? "—"}</td>`;
      }).join("")}</tr>`
    ).join("");
  }

  function exportTableCsv(tableOrTbody, filename) {
    const table = tableOrTbody?.closest?.("table") || tableOrTbody;
    if (!table) return;
    const rows = [...table.querySelectorAll("tr")].map((tr) =>
      [...tr.children].map((td) => `"${String(td.innerText).replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function bindExportButtons(root) {
    (root || document).querySelectorAll("[data-export-table]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-export-table");
        const el = document.getElementById(id);
        exportTableCsv(el, btn.getAttribute("data-export-name") || `${id}.csv`);
      };
    });
  }

  function bindChartNav(chart, opts) {
    if (!chart || !opts?.getNav) return;
    chart.off("click");
    chart.on("click", (params) => {
      const nav = opts.getNav(params);
      if (!nav?.dashboard) return;
      const patch = {};
      if (nav.channel) patch.channel = nav.channel;
      if (window.DashState) DashState.save(patch);
      if (typeof opts.onNavigate === "function") opts.onNavigate(nav.dashboard);
      else {
        location.hash = nav.dashboard;
        window.dispatchEvent(new Event("hashchange"));
      }
    });
  }

  function setLineChart(chart, x, series, opts) {
    if (!chart) return;
    chart.setOption({
      color: THEME.palette,
      tooltip: { trigger: "axis" },
      legend: { data: series.map((s) => s.name), textStyle: { color: THEME.muted } },
      grid: { left: 48, right: 16, bottom: 32, top: 40, containLabel: true },
      xAxis: { type: "category", data: x, axisLabel: { color: THEME.muted, rotate: opts?.rotate || 0 } },
      yAxis: { type: "value", axisLabel: { color: THEME.muted, formatter: (v) => fmtNum(v) } },
      series: series.map((s) => ({
        name: s.name, type: "line", smooth: true, data: s.data,
      })),
    });
  }

  function setBarChart(chart, x, series, opts) {
    if (!chart) return;
    chart.setOption({
      color: THEME.palette,
      tooltip: { trigger: "axis" },
      legend: { textStyle: { color: THEME.muted } },
      grid: { left: 48, right: 16, bottom: 32, top: 40, containLabel: true },
      xAxis: { type: "category", data: x, axisLabel: { color: THEME.muted } },
      yAxis: { type: "value", axisLabel: { color: THEME.muted } },
      series: series.map((s) => ({ name: s.name, type: "bar", data: s.data, barMaxWidth: opts?.barMaxWidth ?? 32 })),
    });
  }

  function setDonut(chart, rows, nameKey, valueKey) {
    if (!chart || !rows?.length) return;
    chart.setOption({
      color: THEME.palette,
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      series: [{
        type: "pie",
        radius: ["42%", "68%"],
        label: { color: THEME.text, fontSize: 11 },
        data: rows.map((r) => ({ name: r[nameKey], value: r[valueKey] })),
      }],
    });
  }

  /** 自注册看板加载器（被看板HTML中的<script>调用） */
  const _selfReg = {};
  function reg(id, loaderFn) {
    _selfReg[id] = loaderFn;
  }
  function getSelfReg(id) { return _selfReg[id]; }

  function resizeAll() {
    Object.values(charts).forEach((c) => c.resize());
  }

  function statusFooter(title, month) {
    return `${title} · ${monthLabel(month)} · 来源 ${DATA_SOURCE} · 更新 ${new Date().toLocaleTimeString()}`;
  }

  return {
    api, clearApiCache, fmtNum, fmtPct: fmtPctDelta, monthLabel, initChart, ensureEcharts, renderKpiGrid, renderTable,
    setLineChart, setBarChart, setDonut, resizeAll, charts,
    exportTableCsv, bindExportButtons, bindChartNav, statusFooter, THEME,
    get DATA_SOURCE() { return DATA_SOURCE; },
    get usingDemo() { return usingDemo; },
    preferDemo,
    reg, getSelfReg,
  };
})();
