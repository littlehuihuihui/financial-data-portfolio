/**
 * 跃动体育 · PDF 三页报告
 * P1 经营监控看板 | P2 分析方法论 | P3 数据仓库与管道架构
 */

(function () {
  "use strict";

  const ROW1_KEYS = ["gmv", "net_revenue", "gross_profit", "net_profit"];
  const ROW2_KEYS = ["gross_margin", "expense_rate", "inventory_turnover_days", "return_rate"];

  const KPI_LABELS = {
    gmv: "商品交易总额",
    net_revenue: "净收入",
    gross_profit: "毛利润",
    net_profit: "净利润(估算)",
    gross_margin: "毛利率",
    expense_rate: "费用率",
    inventory_turnover_days: "库存周转天数",
    return_rate: "退货率",
  };

  const CHART = {
    primary: "#1a5276",
    secondary: "#2c3e50",
    up: "#27ae60",
    down: "#e74c3c",
    palette: ["#1a5276", "#2874a6", "#5499c7", "#2c3e50", "#5d6d7e", "#7f8c8d"],
    grid: "rgba(44, 62, 80, 0.12)",
    text: "#2c3e50",
  };

  let rawData = null;
  let orderExportData = null;
  let trendChart = null;
  let channelChart = null;

  const CHANNEL_PALETTE = {
    抖音: "#1a5276",
    天猫: "#2874a6",
    线下直营: "#5499c7",
    其他: "#95a5a6",
  };

  const peakValleyPlugin = {
    id: "peakValleyLabels",
    afterDatasetsDraw(chart) {
      const values = chart.data.datasets[0]?.data || [];
      if (!values.length) return;
      const maxVal = Math.max(...values);
      const minVal = Math.min(...values);
      const maxIdx = values.indexOf(maxVal);
      const minIdx = values.indexOf(minVal);
      const meta = chart.getDatasetMeta(0);
      const { ctx } = chart;
      ctx.save();
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      [
        { idx: maxIdx, text: `峰值 ${maxVal}万`, color: CHART.up },
        { idx: minIdx, text: `谷值 ${minVal}万`, color: CHART.down },
      ].forEach(({ idx, text, color }) => {
        const pt = meta.data[idx];
        if (!pt) return;
        ctx.fillStyle = color;
        ctx.fillText(text, pt.x, pt.y - 10);
      });
      ctx.restore();
    },
  };

  function formatYi(val) {
    return (val / 1e8).toFixed(2) + "亿";
  }

  function formatMoney(num) {
    if (num == null || isNaN(num)) return "—";
    return Number(num).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatExportAmount(num) {
    return formatMoney(num);
  }

  function resolveApiBase() {
    if (window.API_BASE_URL) return window.API_BASE_URL;
    if (window.location.protocol.startsWith("http")) {
      return window.location.origin;
    }
    return "http://127.0.0.1:5000";
  }

  const KPI_NAME_TO_KEY = {
    GMV: "gmv",
    净收入: "net_revenue",
    毛利: "gross_profit",
    毛利率: "gross_margin",
    费用率: "expense_rate",
    库存周转天数: "inventory_turnover_days",
    退货率: "return_rate",
    "净利（估算）": "net_profit",
  };

  function kpiFormat(unit, value) {
    if (unit === "%") return "百分比";
    if (unit === "天") return "天";
    if (Math.abs(Number(value)) >= 1e8) return "亿";
    return "元";
  }

  function buildReportFromApi(overview, monthId) {
    const monthLabel = `${String(monthId).slice(0, 4)}-${String(monthId).slice(4, 6)}`;
    const cards = {};
    (overview.kpi_cards || []).forEach((c) => {
      const key = KPI_NAME_TO_KEY[c.kpi_name];
      if (!key) return;
      cards[key] = {
        label: c.kpi_name,
        current: Number(c.kpi_value),
        mom_change: c.mom_pct,
        yoy_change: c.yoy_pct,
        format: kpiFormat(c.unit, c.kpi_value),
      };
    });
    const drill = {
      revenue_by_brand: (overview.brand_ranking || []).map((r) => ({
        brand: r.brand_name,
        revenue: r.net_revenue,
        gross_margin: r.gross_margin_pct,
        yoy: r.yoy_growth_pct,
      })),
      revenue_by_channel: (overview.channel_structure || []).map((r) => ({
        channel: r.channel_name,
        revenue: r.net_revenue,
      })),
      store_top5: (overview.store_top5 || []).map((s) => ({
        name: s.store_name,
        region: s.region,
        revenue: s.revenue,
        pingxiao: s.pingxiao,
        profit: s.profit,
      })),
    };
    return {
      meta: {
        current_month: monthLabel,
        generated_from: ["MySQL API /api/dashboard_overview"],
        months: (overview.monthly_trend || []).map((t) => t.order_month),
        brands: ["全部", "跃动Pro", "跃动Life", "跃动Go"],
      },
      monthly_trend: (overview.monthly_trend || []).map((t) => ({
        month: t.order_month,
        gmv: t.gmv,
        net_revenue: t.net_revenue,
      })),
      trends_by_brand: { 全部: overview.monthly_trend || [] },
      monthly: {
        [monthLabel]: { kpi_cards: cards, drill_data: drill },
      },
    };
  }

  async function tryLoadFromApi() {
    const base = resolveApiBase();
    try {
      const health = await fetch(`${base}/api/health`);
      if (!health.ok) return null;
      const month = "202606";
      const res = await fetch(`${base}/api/dashboard_overview?month=${month}`);
      const json = await res.json();
      if (!json.ok) return null;
      return buildReportFromApi(json.data, month);
    } catch {
      return null;
    }
  }

  async function loadOrderExportLive() {
    const base = resolveApiBase();
    const params = new URLSearchParams({
      date_from: "2026-06-01",
      date_to: "2026-06-30",
      brand: "全部",
      channel: "全部",
      category: "全部",
      type: "orders",
    });
    const res = await fetch(`${base}/api/query_detail?${params}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "明细 API 失败");
    return {
      meta: {
        source_table: "dwd_sales_wide",
        export_view: "dwd_sales_wide",
        default_date_from: "2026-06-01",
        default_date_to: "2026-06-30",
        brands: ["全部", "跃动Pro", "跃动Life", "跃动Go"],
        channels: ["全部", "抖音", "天猫", "线下直营", "其他"],
        categories: ["全部", "鞋类", "服装", "配件"],
      },
      orders: (json.data.rows || []).map((r) => ({
        order_id: r.order_id,
        order_date: String(r.order_date).slice(0, 10),
        brand: r.brand_name,
        channel: r.channel_name,
        channel_group: r.channel_name,
        category: r.category_name,
        category_group: r.category_name,
        actual_amount: r.payment_amount,
        cost: r.cost,
        is_returned: Number(r.return_flag) === 1 ? "是" : "否",
      })),
    };
  }

  function isRateKpi(key) {
    return ["gross_margin", "expense_rate", "return_rate", "inventory_turnover_days"].includes(key);
  }

  function changeCompact(key, change) {
    if (change == null) return "";
    const suffix = isRateKpi(key) ? "pp" : "%";
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    const cls = change > 0 ? "up" : change < 0 ? "down" : "";
    const sign = change > 0 ? "+" : "";
    return `<span class="${cls}">${arrow}${sign}${change}${suffix}</span>`;
  }

  function momParen(key, change) {
    if (change == null) return "";
    const suffix = isRateKpi(key) ? "pp" : "%";
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    const sign = change > 0 ? "+" : "";
    return `(环比${arrow}${sign}${change}${suffix})`;
  }

  function changeHtml(key, change, isMom) {
    if (change == null) return "";
    const isRate = isRateKpi(key);
    const suffix = isRate ? "pp" : "%";
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    const cls = change > 0 ? "up" : change < 0 ? "down" : "";
    const sign = change > 0 ? "+" : "";
    const label = isMom ? "环比" : "同比";
    return `<span class="${cls}">${arrow}${sign}${change}${suffix} (${label})</span>`;
  }

  function formatKpiValue(key, kpi) {
    const v = kpi.current;
    if (kpi.format === "亿") return formatYi(v);
    if (kpi.format === "百分比") return v.toFixed(1) + "%";
    if (kpi.format === "天") return v.toFixed(1) + "天";
    return String(v);
  }

  function formatTableYoy(yoy) {
    if (yoy == null) return "—";
    const cls = yoy > 0 ? "val-up" : yoy < 0 ? "val-down" : "";
    const sign = yoy > 0 ? "+" : "";
    const arrow = yoy > 0 ? "↑" : yoy < 0 ? "↓" : "";
    return `<span class="${cls}">${arrow}${sign}${yoy}%</span>`;
  }

  function toWan(yuan) {
    return Math.round(yuan / 10000);
  }

  async function loadData() {
    if (window.SUMMARY_DATA) return window.SUMMARY_DATA;
    const live = await tryLoadFromApi();
    if (live) return live;
    const res = await fetch("data/summary.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function getBundle(month) {
    return rawData.monthly[month] || null;
  }

  function renderKpiCards(month) {
    const bundle = getBundle(month);
    if (!bundle) return;
    const cards = bundle.kpi_cards;

    function buildCardRow1(key) {
      const kpi = cards[key];
      const label = KPI_LABELS[key] || kpi.label;
      const value = formatKpiValue(key, kpi);
      const yoy = changeCompact(key, kpi.yoy_change);
      const mom = changeCompact(key, kpi.mom_change);
      return `
        <div class="kpi-card">
          <div class="kpi-card-label">${label}</div>
          <div class="kpi-card-value">${value}</div>
          <div class="kpi-card-changes">${yoy} ${mom}</div>
        </div>`;
    }

    function buildCardRow2(key) {
      const kpi = cards[key];
      const label = KPI_LABELS[key] || kpi.label;
      const value = formatKpiValue(key, kpi);
      const yoy = changeCompact(key, kpi.yoy_change);
      let valueLine = value;
      let subLine = "";

      if (key === "gross_margin") {
        if (kpi.current >= 50 && kpi.current <= 58) {
          valueLine += ' <span class="kpi-card-status">🟢</span>';
        }
        valueLine += ` ${yoy}`;
        subLine = '<div class="kpi-card-sub">(正常区间：50%~58%)</div>';
      } else {
        valueLine += ` ${yoy}`;
        subLine = `<div class="kpi-card-sub">${momParen(key, kpi.mom_change)}</div>`;
      }

      return `
        <div class="kpi-card">
          <div class="kpi-card-label">${label}</div>
          <div class="kpi-card-value">${valueLine}</div>
          ${subLine}
        </div>`;
    }

    document.getElementById("kpi-row-1").innerHTML = ROW1_KEYS.map(buildCardRow1).join("");
    document.getElementById("kpi-row-2").innerHTML = ROW2_KEYS.map(buildCardRow2).join("");

    const foot = document.getElementById("p1-footnote");
    if (foot) {
      const src = rawData.meta?.generated_from?.includes("MySQL API")
        ? "MySQL 实时 API · 7 看板模块"
        : "MySQL 汇总视图";
      foot.textContent = `分析月份：${month} · 数据来源：${src} · 明细导出支持 CSV 格式`;
    }
  }

  function groupChannelsForChart(channels) {
    const groups = { 抖音: 0, 天猫: 0, 线下直营: 0, 其他: 0 };
    const direct = new Set(["抖音", "天猫", "线下直营"]);
    channels.forEach((c) => {
      const g = direct.has(c.channel) ? c.channel : "其他";
      groups[g] += c.revenue;
    });
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([channel, revenue]) => ({ channel, revenue }));
  }

  function renderBrandTable(month) {
    const tbody = document.getElementById("brand-table-body");
    const rows = [...(getBundle(month)?.drill_data?.revenue_by_brand || [])]
      .sort((a, b) => b.revenue - a.revenue);
    if (!tbody) return;

    tbody.innerHTML = rows.length
      ? rows.map((r) => `
        <tr>
          <td>${r.brand}</td>
          <td class="num">${formatMoney(r.revenue)}</td>
          <td class="num">${r.gross_margin.toFixed(1)}%</td>
          <td class="num">${formatTableYoy(r.yoy)}</td>
        </tr>`).join("")
      : '<tr><td colspan="4">暂无数据</td></tr>';
  }

  function renderStoreTable(month) {
    const tbody = document.getElementById("store-table-body");
    const stores = getBundle(month)?.drill_data?.store_top5 || [];
    if (!tbody) return;

    tbody.innerHTML = stores.length
      ? stores.map((s) => `
        <tr>
          <td>${s.name}</td>
          <td>${s.region}</td>
          <td class="num">${formatMoney(s.revenue)}</td>
          <td class="num">${s.pingxiao.toFixed(0)}</td>
          <td class="num">${formatMoney(s.profit)}</td>
        </tr>`).join("")
      : '<tr><td colspan="5">暂无数据</td></tr>';
  }

  function getTrendData() {
    if (rawData.trends_by_brand?.["全部"]?.length) {
      return rawData.trends_by_brand["全部"].slice(-12);
    }
    if (rawData.monthly_trend?.length) return rawData.monthly_trend.slice(-12);
    const months = (rawData.meta?.months || []).slice(-12);
    return months.map((m) => {
      const kpis = rawData.monthly[m]?.kpi_cards;
      return {
        month: m,
        gmv: kpis?.gmv?.current || 0,
        net_revenue: kpis?.net_revenue?.current || 0,
      };
    });
  }

  function renderCharts(month) {
    if (typeof Chart === "undefined") return;

    const trend = getTrendData();
    const trendEl = document.getElementById("trendChart");
    if (trendEl) {
      if (trendChart) trendChart.destroy();
      trendChart = new Chart(trendEl, {
        type: "line",
        data: {
          labels: trend.map((d) => d.month),
          datasets: [{
            label: "净收入",
            data: trend.map((d) => toWan(d.net_revenue)),
            borderColor: CHART.primary,
            backgroundColor: "rgba(26, 82, 118, 0.08)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.2,
            pointRadius: 3,
            pointBackgroundColor: CHART.primary,
          }],
        },
        options: {
          responsive: true,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => items[0]?.label || "",
                label: (ctx) => `净收入：${ctx.parsed.y} 万`,
              },
            },
          },
          scales: {
            x: {
              type: "category",
              ticks: { font: { size: 9 }, color: CHART.text },
              grid: { color: CHART.grid },
              title: { display: true, text: "月份 (YYYY-MM)", font: { size: 9 }, color: CHART.text },
            },
            y: {
              ticks: { font: { size: 9 }, color: CHART.text, callback: (v) => v + "万" },
              grid: { color: CHART.grid },
              title: { display: true, text: "净收入", font: { size: 9 }, color: CHART.text },
            },
          },
        },
        plugins: [peakValleyPlugin],
      });
    }

    const grouped = groupChannelsForChart(
      getBundle(month)?.drill_data?.revenue_by_channel || []
    );
    const channelEl = document.getElementById("channelChart");
    if (channelEl) {
      if (channelChart) channelChart.destroy();
      channelChart = new Chart(channelEl, {
        type: "doughnut",
        data: {
          labels: grouped.map((c) => c.channel),
          datasets: [{
            data: grouped.map((c) => c.revenue),
            backgroundColor: grouped.map((c) => CHANNEL_PALETTE[c.channel] || CHART.secondary),
            borderWidth: 2,
            borderColor: "#fff",
          }],
        },
        options: {
          responsive: true,
          animation: false,
          cutout: "58%",
          plugins: {
            legend: {
              position: "right",
              labels: { font: { size: 9 }, color: CHART.text, boxWidth: 10 },
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                  const pct = ((ctx.raw / total) * 100).toFixed(1);
                  return ` ${ctx.label}: ${formatMoney(ctx.raw)} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }
  }

  async function loadOrderExport() {
    if (window.ORDER_EXPORT_DATA) return window.ORDER_EXPORT_DATA;
    try {
      return await loadOrderExportLive();
    } catch {
      const res = await fetch("data/order_export.json");
      if (!res.ok) throw new Error("order_export.json 未找到，请运行 build_summary_json.py 或 app.py");
      return res.json();
    }
  }

  function getExportFilters() {
    return {
      dateFrom: document.getElementById("export-date-from")?.value || "",
      dateTo: document.getElementById("export-date-to")?.value || "",
      brand: document.getElementById("export-brand")?.value || "全部",
      channel: document.getElementById("export-channel")?.value || "全部",
      category: document.getElementById("export-category")?.value || "全部",
    };
  }

  function filterExportOrders(filters) {
    if (!orderExportData?.orders) return [];
    return orderExportData.orders.filter((row) => {
      if (filters.dateFrom && row.order_date < filters.dateFrom) return false;
      if (filters.dateTo && row.order_date > filters.dateTo) return false;
      if (filters.brand !== "全部" && row.brand !== filters.brand) return false;
      if (filters.channel !== "全部" && row.channel_group !== filters.channel) return false;
      if (filters.category !== "全部" && row.category_group !== filters.category) return false;
      return true;
    });
  }

  function renderExportPreview() {
    const tbody = document.getElementById("export-preview-body");
    const countEl = document.getElementById("export-preview-count");
    if (!tbody) return;

    const filtered = filterExportOrders(getExportFilters());
    const preview = filtered.slice(0, 8);

    if (countEl) {
      countEl.textContent = filtered.length
        ? `（共 ${filtered.length} 条，预览前 ${preview.length} 条）`
        : "（无匹配数据）";
    }

    tbody.innerHTML = preview.length
      ? preview.map((r) => `
        <tr>
          <td>${r.order_id}</td>
          <td>${r.order_date}</td>
          <td>${r.brand}</td>
          <td>${r.channel}</td>
          <td>${r.category}</td>
          <td class="num">${formatExportAmount(r.actual_amount)}</td>
          <td class="num">${formatExportAmount(r.cost)}</td>
          <td>${r.is_returned}</td>
        </tr>`).join("")
      : '<tr><td colspan="8" class="loading-msg">当前筛选条件下无数据</td></tr>';
  }

  function downloadExportCsv() {
    const filtered = filterExportOrders(getExportFilters());
    if (!filtered.length) {
      alert("当前筛选条件下没有可导出的数据");
      return;
    }
    const headers = ["订单编号", "日期", "品牌", "渠道", "品类", "实付金额", "成本", "退货标记"];
    const rows = filtered.map((r) => [
      r.order_id,
      r.order_date,
      r.brand,
      r.channel,
      r.category,
      r.actual_amount,
      r.cost,
      r.is_returned,
    ]);
    const csv = [headers, ...rows]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `跃动体育订单明细_${getExportFilters().dateFrom}_${getExportFilters().dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function initExportModule() {
    const meta = orderExportData?.meta;
    if (meta) {
      const from = document.getElementById("export-date-from");
      const to = document.getElementById("export-date-to");
      if (from) from.value = meta.default_date_from;
      if (to) to.value = meta.default_date_to;
    }

    ["export-date-from", "export-date-to", "export-brand", "export-channel", "export-category"]
      .forEach((id) => {
        document.getElementById(id)?.addEventListener("change", renderExportPreview);
      });

    document.getElementById("btn-export-csv")?.addEventListener("click", downloadExportCsv);
    renderExportPreview();
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
      alert("PDF 库未加载，请使用「打印 / 另存为 PDF」或运行 run_export.bat");
      return;
    }

    const originalText = btn.textContent;
    btn.textContent = "正在生成…";
    btn.disabled = true;
    document.body.classList.add("pdf-exporting");

    const backups = replaceCanvasesWithImages();
    const month = rawData?.meta?.current_month || "report";
    const filename = `跃动体育财务监控体系报告_${month}.pdf`;
    const root = document.getElementById("report-content");

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    try {
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            scrollY: 0,
            windowWidth: root.scrollWidth,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: {
            mode: ["css", "legacy"],
            avoid: [".kpi-card", ".framework-layer-pdf", ".guide-block", "tr", "table"],
          },
        })
        .from(root)
        .save();
    } finally {
      restoreCanvases(backups);
      document.body.classList.remove("pdf-exporting");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  function bindToolbar() {
    document.getElementById("btn-download-pdf")?.addEventListener("click", downloadPdf);
    document.getElementById("btn-print")?.addEventListener("click", () => window.print());
  }

  function highlightNav() {
    const map = { "page-p0": -1, "page-p1": 0, "page-p2": 1, "page-p2b": 1, "page-p3": 2 };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = map[entry.target.id];
          if (idx == null) return;
          document.querySelectorAll(".module-nav a, .module-nav-inline a").forEach((a) => {
            const href = a.getAttribute("href") || "";
            const pageIdx = map[href.replace("#", "")];
            if (idx === -1) {
              a.classList.remove("active");
              return;
            }
            a.classList.toggle("active", pageIdx === idx);
          });
        });
      },
      { rootMargin: "-35% 0px -45% 0px" }
    );
    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  async function init() {
    bindToolbar();
    try {
      rawData = await loadData();
      const month = rawData.meta.current_month || "2026-06";
      renderKpiCards(month);
      renderBrandTable(month);
      renderStoreTable(month);
      renderCharts(month);

      try {
        orderExportData = await loadOrderExport();
        initExportModule();
      } catch (exportErr) {
        const tbody = document.getElementById("export-preview-body");
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="8" class="loading-msg">${exportErr.message}</td></tr>`;
        }
      }

      highlightNav();

      window.REPORT_READY = true;
      document.dispatchEvent(new Event("reportready"));

      if (new URLSearchParams(window.location.search).get("auto") === "1") {
        setTimeout(downloadPdf, 1000);
      }
    } catch (err) {
      document.getElementById("report-content").innerHTML =
        `<div class="loading-msg">数据加载失败：${err.message}<br>请先运行 python data/build_summary_json.py</div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
