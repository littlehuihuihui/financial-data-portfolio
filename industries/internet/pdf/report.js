/**
 * 广东移动 OTT · P0–P3 PDF 报告（与 HTML 17 看板 / internet_analytics 同步）
 */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const MONTH = params.get("month") || "202607";
  const MONTH_LABEL = `${MONTH.slice(0, 4)}-${MONTH.slice(4, 6)}`;

  const CHART = {
    primary: "#8e44ad",
    secondary: "#9b59b6",
    palette: ["#8e44ad", "#9b59b6", "#bb8fce", "#5b2c6f", "#7d3c98", "#d2b4de"],
    grid: "rgba(44, 62, 80, 0.12)",
    text: "#2c3e50",
  };

  let trendChart = null;
  let composeChart = null;
  let funnelChart = null;
  let orderChart = null;

  function apiBase() {
    const q = params.get("api");
    if (q) return q.replace(/\/$/, "");
    if (window.API_BASE_URL) return window.API_BASE_URL.replace(/\/$/, "");
    if (location.protocol.startsWith("http") && location.port !== "8771") return location.origin;
    return "http://127.0.0.1:5001";
  }

  async function api(path) {
    const url = `${apiBase()}${path}${path.includes("?") ? "&" : "?"}month=${MONTH}`;
    const res = await fetch(url);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || `API ${path} failed`);
    return json.data;
  }

  async function apiOptional(path, fallback = {}) {
    try {
      return await api(path);
    } catch (err) {
      console.warn("[report]", path, err.message);
      return fallback;
    }
  }

  function fmt(n, digits = 2) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    const v = Number(n);
    if (Math.abs(v) >= 1e4) return (v / 1e4).toFixed(2) + "万";
    return v.toLocaleString("zh-CN", { maximumFractionDigits: digits });
  }

  function pct(v) {
    if (v == null || Number.isNaN(Number(v))) return "—";
    return Number(v).toFixed(2) + "%";
  }

  function fillTable(tbodyId, rows, cols, emptyMsg) {
    const tb = document.getElementById(tbodyId);
    if (!tb) return;
    if (!rows?.length) {
      tb.innerHTML = `<tr><td colspan="99">${emptyMsg || "暂无数据"}</td></tr>`;
      return;
    }
    tb.innerHTML = rows.map((r) =>
      `<tr>${cols.map((c) => {
        let v = r[c.key];
        if (c.fmt === "pct") v = pct(v);
        else if (c.fmt === "num") v = fmt(v, c.digits ?? 0);
        return `<td class="${c.align === "right" ? "num" : ""}">${v ?? "—"}</td>`;
      }).join("")}</tr>`
    ).join("");
  }

  function buildRetentionRows(matrix) {
    const rows = matrix || [];
    const cohorts = [...new Set(rows.map((r) => String(r.cohort_date).slice(0, 10)))].sort().slice(-4);
    return cohorts.map((c) => {
      const pick = (d) => rows.find((r) => String(r.cohort_date).startsWith(c) && Number(r.day_offset) === d);
      return {
        cohort: c,
        d1: pick(1)?.retention_rate,
        d7: pick(7)?.retention_rate,
        d30: pick(30)?.retention_rate,
      };
    });
  }

  function renderKpiRows(overview, lifecycle, retention, order, quality) {
    const mau = overview.mau || {};
    const lk = lifecycle.kpi || {};
    const ok = order.kpi || {};
    const ms = order.mau_settle || {};
    const qk = quality.kpi || {};
    const ret = (retention.trend || [])[0] || {};
    const row1 = [
      { label: "有效MAU(合计)", value: fmt(mau.total, 0) },
      { label: "STB MAU", value: fmt(mau.stb, 0) },
      { label: "Speaker MAU", value: fmt(mau.speaker, 0) },
      { label: "日均活跃", value: fmt(lk.avg_active, 0) },
    ];
    const row2 = [
      { label: "本月订购数", value: fmt(ok.order_cnt, 0) },
      { label: "CP分成(演示30%)", value: fmt(ok.revenue_share) },
      { label: "MAU结算收入", value: fmt(ms.revenue) },
      { label: "完播率", value: pct(qk.finish_rate) },
      { label: `D${ret.day_offset || 1}留存`, value: pct(ret.retention_rate) },
    ];
    const card = (c) =>
      `<div class="kpi-card"><div class="kpi-card-label">${c.label}</div><div class="kpi-card-value">${c.value}</div></div>`;
    document.getElementById("kpi-row-1").innerHTML = row1.map(card).join("");
    document.getElementById("kpi-row-2").innerHTML = row2.map(card).join("");
    const foot = document.getElementById("p1-footnote");
    if (foot) {
      foot.textContent = `分析月份：${MONTH_LABEL} · 数据来源：MySQL API · internet_analytics · dws_act_user_active_1d / dws_trade_* / dws_user_*`;
    }
  }

  function destroyCharts() {
    [trendChart, composeChart, funnelChart, orderChart].forEach((c) => c?.destroy());
    trendChart = composeChart = funnelChart = orderChart = null;
  }

  function renderCharts(overview, funnel, order) {
    destroyCharts();
    const trend = overview.dau_trend || [];
    const labels = trend.map((r) => String(r.snapshot_date).slice(5, 10));
    const tc = document.getElementById("trendChart");
    if (tc && labels.length) {
      trendChart = new Chart(tc, {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "DAU", data: trend.map((r) => Number(r.dau) || 0), borderColor: CHART.primary, tension: 0.3, fill: false },
            { label: "STB", data: trend.map((r) => Number(r.dau_stb) || 0), borderColor: CHART.palette[2], tension: 0.3, fill: false },
            { label: "Speaker", data: trend.map((r) => Number(r.dau_speaker) || 0), borderColor: CHART.palette[4], tension: 0.3, fill: false },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
          scales: {
            x: { grid: { color: CHART.grid }, ticks: { color: CHART.text, maxTicksLimit: 10 } },
            y: { grid: { color: CHART.grid }, ticks: { color: CHART.text } },
          },
        },
      });
    }

    const cp = overview.compose || {};
    const cc = document.getElementById("composeChart");
    if (cc) {
      composeChart = new Chart(cc, {
        type: "doughnut",
        data: {
          labels: ["点播活跃", "直播活跃", "只开机"],
          datasets: [{
            data: [Number(cp.vod_active) || 0, Number(cp.live_active) || 0, Number(cp.only_launcher) || 0],
            backgroundColor: CHART.palette,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
        },
      });
    }

    const f = funnel.funnel || {};
    const fc = document.getElementById("funnelChart");
    if (fc && (f.expose || f.click)) {
      funnelChart = new Chart(fc, {
        type: "bar",
        data: {
          labels: ["曝光", "点击", "验证", "确认订购"],
          datasets: [{
            label: "人次",
            data: [f.expose, f.click, f.verify, f.confirm].map(Number),
            backgroundColor: CHART.palette,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: CHART.grid } } },
        },
      });
    }

    const pay = order.by_paytype || [];
    const oc = document.getElementById("orderChart");
    if (oc && pay.length) {
      orderChart = new Chart(oc, {
        type: "doughnut",
        data: {
          labels: pay.map((r) => r.pay_type),
          datasets: [{
            data: pay.map((r) => Number(r.order_cnt) || 0),
            backgroundColor: CHART.palette,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 10 } } } },
        },
      });
    }
  }

  function replaceCanvasesWithImages() {
    const backups = [];
    document.querySelectorAll("canvas").forEach((canvas) => {
      const img = document.createElement("img");
      img.src = canvas.toDataURL("image/png", 1.0);
      img.style.width = "100%";
      img.style.maxHeight = "200px";
      backups.push({ canvas, parent: canvas.parentNode, img });
      canvas.parentNode.replaceChild(img, canvas);
    });
    return backups;
  }

  function restoreCanvases(backups) {
    backups.forEach(({ canvas, parent, img }) => {
      if (img.parentNode === parent) parent.replaceChild(canvas, img);
    });
  }

  async function downloadPdf() {
    const btn = document.getElementById("btn-download-pdf");
    if (!window.html2pdf) {
      alert("PDF 库未加载，请使用「打印 / 另存为 PDF」或运行 export_internet.py");
      return;
    }
    const originalText = btn.textContent;
    btn.textContent = "正在生成…";
    btn.disabled = true;
    document.body.classList.add("pdf-exporting");
    const backups = replaceCanvasesWithImages();
    const root = document.getElementById("report-content");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `互联网OTT视频活跃分析报告_${MONTH_LABEL}.pdf`,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, windowWidth: root.scrollWidth },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".kpi-card", ".framework-layer-pdf", ".guide-block", "tr", "table"] },
      }).from(root).save();
    } finally {
      restoreCanvases(backups);
      document.body.classList.remove("pdf-exporting");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  function fillPlaybookTable() {
    const body = document.getElementById("playbook-body");
    if (!body || !window.PLAYBOOKS) return;
    const layerName = { l1: "描述性", l2: "诊断性", l3: "预测性", l4: "评估性", l5: "优化性" };
    body.innerHTML = window.PLAYBOOKS.map((p, i) =>
      `<tr><td>${i + 1}</td><td>${layerName[p.layer] || p.layer}</td><td>${p.title}</td><td>${p.bizQuestion || ""}</td><td>${(p.dashboards || []).slice(0, 2).join(" · ")}</td></tr>`
    ).join("");
  }

  function fillToolboxSummary() {
    const el = document.getElementById("toolbox-summary");
    if (!el || !window.ANALYSIS_TOOLBOX) return;
    const methods = (window.ANALYSIS_TOOLBOX.categories || []).flatMap((c) => c.methods || []);
    el.innerHTML = methods.map((m) =>
      `<tr><td>${m.title}</td><td>${m.aliases || "—"}</td><td>${m.definition || m.what || m.explain || ""}</td><td>${m.applicable || m.when || "—"}</td><td>${m.purpose || "—"}</td><td>${m.vsOtherMethods || "—"}</td><td>${m.boundaries || "—"}</td><td>${m.businessQuestion || ""}</td></tr>`
    ).join("");
  }

  function fillExtendedInternetTables(live, episode, device, pathData, revenue, activity, health, tags) {
    fillTable("tbl-live", (live.channels || []).slice(0, 8), [
      { key: "channel_name" },
      { key: "uv", align: "right", fmt: "num" },
      { key: "vv", align: "right", fmt: "num" },
    ]);
    fillTable("tbl-episode", (episode.top || []).slice(0, 8).map((r) => ({
      episode_name: r.episode_name || `${r.series_name || ""}#${r.episode_no || ""}`,
      vv: r.vv,
      uv: r.uv,
      finish_rate: r.finish_rate != null ? r.finish_rate
        : (r.vv ? (Number(r.finish_cnt || 0) / Number(r.vv) * 100) : null),
    })), [
      { key: "episode_name" },
      { key: "vv", align: "right", fmt: "num" },
      { key: "uv", align: "right", fmt: "num" },
      { key: "finish_rate", align: "right", fmt: "pct" },
    ]);
    const typeDist = device.type_dist || [];
    const typeTotal = typeDist.reduce((s, r) => s + (Number(r.device_cnt) || 0), 0);
    fillTable("tbl-device", typeDist.slice(0, 8).map((r) => {
      const n = Number(r.device_cnt) || 0;
      return {
        device_type: r.device_type_name || r.device_type || "—",
        cnt: n,
        share: typeTotal ? (n / typeTotal * 100) : null,
      };
    }), [
      { key: "device_type" },
      { key: "cnt", align: "right", fmt: "num" },
      { key: "share", align: "right", fmt: "pct" },
    ]);
    const dual = device.dual || {};
    const dualHint = document.getElementById("device-dual-hint");
    if (dualHint) {
      dualHint.textContent =
        `双端用户：${fmt(dual.dual_users, 0)} · 活跃用户总数 ${fmt(dual.total_users, 0)}`;
    }
    const drop = pathData.drop_off || [];
    const dropMax = Math.max(...drop.map((r) => Number(r.sess_cnt) || 0), 1);
    fillTable("tbl-path", drop.slice(0, 8).map((r) => ({
      step: r.prev_page,
      enter: r.user_cnt,
      drop: r.sess_cnt,
      drop_rate: dropMax ? (Number(r.sess_cnt) || 0) / dropMax * 100 : null,
    })), [
      { key: "step" },
      { key: "enter", align: "right", fmt: "num" },
      { key: "drop", align: "right", fmt: "num" },
      { key: "drop_rate", align: "right", fmt: "pct" },
    ]);
    const plans = revenue.plan_analysis || [];
    fillTable("tbl-revenue", plans.slice(0, 8).map((r) => ({
      name: r.plan_type,
      order_cnt: r.order_cnt,
      revenue: r.order_amount,
      arpu: r.avg_order_price,
    })), [
      { key: "name" },
      { key: "order_cnt", align: "right", fmt: "num" },
      { key: "revenue", align: "right", fmt: "num" },
      { key: "arpu", align: "right", fmt: "num" },
    ]);
    fillTable("tbl-activity", (activity.activities || []).slice(0, 8), [
      { key: "activity_name" },
      { key: "total_reach_users", align: "right", fmt: "num" },
      { key: "total_orders", align: "right", fmt: "num" },
      { key: "roi_ratio", align: "right", fmt: "num" },
    ]);
    fillTable("tbl-health", (health.metrics || []).slice(0, 10).map((r) => ({
      metric_name: r.metric_name || r.metric_group,
      metric_value: r.metric_value,
      status: r.status_icon || r.status || "—",
      score: r.health_score_pct ?? r.baseline_value,
    })), [
      { key: "metric_name" },
      { key: "metric_value", align: "right", fmt: "num" },
      { key: "status" },
      { key: "score", align: "right", fmt: "num" },
    ]);
    const tagRows = (tags.by_category || tags.overview || []).slice(0, 10);
    fillTable("tbl-tags", tagRows.map((r) => ({
      tag_category: r.tag_category,
      tag_name: r.tag_name || r.tag_code,
      user_count: r.user_count,
      share: r.category_share_pct,
    })), [
      { key: "tag_category" },
      { key: "tag_name" },
      { key: "user_count", align: "right", fmt: "num" },
      { key: "share", align: "right", fmt: "pct" },
    ]);
  }

  async function init() {
    document.getElementById("btn-download-pdf")?.addEventListener("click", downloadPdf);
    document.getElementById("btn-print")?.addEventListener("click", () => window.print());
    try {
      const [overview, launcher, vod, lifecycle, retention, funnel, order, quality, series] = await Promise.all([
        api("/api/dashboard_overview"),
        api("/api/dashboard_launcher"),
        api("/api/dashboard_vod"),
        api("/api/dashboard_lifecycle"),
        api("/api/dashboard_retention"),
        api("/api/dashboard_funnel"),
        api("/api/dashboard_order"),
        api("/api/dashboard_quality"),
        api("/api/dashboard_series"),
      ]);
      const [live, episode, device, pathData, revenue, activity, health, tags] = await Promise.all([
        apiOptional("/api/dashboard_live", { kpi: {}, channels: [] }),
        apiOptional("/api/dashboard_episode", { top: [] }),
        apiOptional("/api/dashboard_device", { type_dist: [], dual: {} }),
        apiOptional("/api/dashboard_path", { overview: [], drop_off: [] }),
        apiOptional("/api/dashboard_revenue", { structure: [], plan_analysis: [] }),
        apiOptional("/api/dashboard_activity", { activities: [] }),
        apiOptional("/api/dashboard_health", { metrics: [], summary: [] }),
        apiOptional("/api/dashboard_tags", { overview: [], by_category: [] }),
      ]);

      window.REPORT_DATA = {
        meta: { current_month: MONTH_LABEL, industry: "internet-ott", boards: 17 },
        overview, lifecycle, retention, funnel, order, quality,
      };

      renderKpiRows(overview, lifecycle, retention, order, quality);
      renderCharts(overview, funnel, order);

      fillTable("tbl-windows", overview.windows || [], [
        { key: "name" }, { key: "users", align: "right", fmt: "num" },
      ]);
      fillTable("tbl-retention", buildRetentionRows(retention.matrix), [
        { key: "cohort" },
        { key: "d1", align: "right", fmt: "pct" },
        { key: "d7", align: "right", fmt: "pct" },
        { key: "d30", align: "right", fmt: "pct" },
      ]);
      fillTable("tbl-vod", (vod.by_type || []), [
        { key: "device_type" },
        { key: "uv", align: "right", fmt: "num" },
        { key: "vv", align: "right", fmt: "num" },
      ]);
      fillTable("tbl-series", (series.top || []).slice(0, 8), [
        { key: "series_name" },
        { key: "vv", align: "right", fmt: "num" },
        { key: "uv", align: "right", fmt: "num" },
        { key: "finish_rate", align: "right", fmt: "pct" },
      ]);
      fillTable("tbl-order", order.by_paytype || [], [
        { key: "pay_type" },
        { key: "order_cnt", align: "right", fmt: "num" },
        { key: "order_amount", align: "right", fmt: "num" },
        { key: "revenue_share", align: "right", fmt: "num" },
      ]);
      fillTable("tbl-launcher", launcher.by_type || [], [
        { key: "device_type" },
        { key: "boot_users", align: "right", fmt: "num" },
        { key: "boot_cnt", align: "right", fmt: "num" },
      ]);
      fillExtendedInternetTables(live, episode, device, pathData, revenue, activity, health, tags);

      const diagnosis = document.getElementById("diagnosis-list");
      if (diagnosis) {
        const onlyPct = Number(launcher.kpi?.only_launcher_pct);
        const finish = Number(quality.kpi?.finish_rate);
        const items = [];
        if (!Number.isNaN(onlyPct) && onlyPct > 35) {
          items.push(`<li><strong>${MONTH_LABEL}</strong> 只开机占比 ${pct(onlyPct)} 偏高，建议拆端对比点播渗透（开机活跃 / 点播活跃看板）</li>`);
        }
        if (!Number.isNaN(finish) && finish < 40) {
          items.push(`<li>完播率 ${pct(finish)} 低于经验阈值，优先排查卡顿与首帧（完播与QoS / 内容剧集）</li>`);
        }
        const redCnt = (health.metrics || []).filter((r) => r.status === "red").length;
        if (redCnt > 0) {
          items.push(`<li>业务健康度：${redCnt} 项红灯，见健康度看板与一页纸摘要</li>`);
        }
        items.push("<li>留存：对比 v_retention_decomposition 的 D1/D7/D30，定位端类型差异</li>");
        items.push("<li>商业化：收银台漏斗 + 收入结构 / 活动复盘，评估入口与套餐 LTV</li>");
        items.push("<li>增长：行为路径流失 + 用户标签画像，定位关键步骤与人群覆盖</li>");
        diagnosis.innerHTML = items.join("");
      }

      fillPlaybookTable();
      fillToolboxSummary();

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      window.REPORT_READY = true;
      document.dispatchEvent(new Event("reportready"));
      if (params.get("auto") === "1") setTimeout(downloadPdf, 1000);
    } catch (err) {
      document.getElementById("report-content")?.insertAdjacentHTML("afterbegin",
        `<div class="loading-msg">数据加载失败：${err.message}<br>请先启动互联网 API（端口 5001）后刷新本页。</div>`);
      window.REPORT_READY = true;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
