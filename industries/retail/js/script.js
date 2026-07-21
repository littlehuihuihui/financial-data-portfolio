/**
 * 跃动体育 · 作品集共用交互脚本
 * 支持：shell.html（数据展示）、anomaly.html（分析方法论）、architecture.html
 */

(function () {
  "use strict";

  // ===========================================================================
  // 常量
  // ===========================================================================

  const KPI_ORDER = [
    "gmv",
    "net_revenue",
    "gross_profit",
    "gross_margin",
    "net_profit",
    "expense_rate",
    "inventory_turnover_days",
    "return_rate",
  ];

  const REVENUE_KPIS = new Set([
    "gmv",
    "net_revenue",
    "gross_profit",
    "gross_margin",
  ]);

  /** Chart.js 深色主题配色 */
  const CHART_THEME = {
    accent: "#4da3ff",
    gmv: "#4a5568",
    text: "#e0e6f0",
    textMuted: "#8892a4",
    grid: "rgba(136, 146, 164, 0.15)",
    tooltipBg: "#141b2d",
    tooltipBorder: "#1e2a4a",
  };

  let trendChartInstance = null;
  let channelChartInstance = null;

  // ===========================================================================
  // 全局状态
  // ===========================================================================

  const state = {
    rawData: null,
    month: "2026-06",
    brand: "全部",
    selectedKpi: null,
    drillLevel: "overview", // overview | brand | channel | category | expense | inventory
    drillStack: [],
    currentBrand: null,
    currentChannel: null,
  };

  // DOM 元素缓存（按页面存在性惰性获取）
  const els = {};

  function cacheElements() {
    els.kpiGrid = document.getElementById("kpi-grid");
    els.breadcrumb = document.getElementById("breadcrumb");
    els.detailTitle = document.getElementById("detail-title");
    els.detailTableHead = document.getElementById("detail-table-head");
    els.detailTableBody = document.getElementById("detail-table-body");
    els.definitionText = document.getElementById("definition-text");
    els.definitionLabel = document.getElementById("definition-label");
    els.monthSelect = document.getElementById("month-select");
    els.brandSelect = document.getElementById("brand-select");
    els.mainContent = document.getElementById("main-content");
    els.storeSection = document.getElementById("store-section");
    els.trendChart = document.getElementById("trendChart");
    els.channelChart = document.getElementById("channelChart");
  }

  // ===========================================================================
  // 数据加载
  // ===========================================================================

  async function loadData() {
    // 优先使用 summary.js 注入的全局变量（支持 file:// 直接打开）
    if (window.SUMMARY_DATA) {
      state.rawData = window.SUMMARY_DATA;
      state.month = state.rawData.meta.current_month || "2026-06";
      return state.rawData;
    }

    // GitHub Pages / 本地 http.server 走 fetch
    try {
      const res = await fetch("data/summary.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.rawData = await res.json();
      state.month = state.rawData.meta.current_month || "2026-06";
      return state.rawData;
    } catch (err) {
      if (window.location.protocol === "file:") {
        throw new Error(
          "本地文件模式无法 fetch 数据。请先运行 python data/build_summary_json.py，" +
          "并确认 index.html 已引入 data/summary.js；或使用 run_docs.bat 启动本地服务器。"
        );
      }
      throw err;
    }
  }

  function getActiveBundle() {
    const monthData = state.rawData.monthly[state.month];
    if (!monthData) return null;
    if (state.brand === "全部") {
      return {
        kpi_cards: monthData.kpi_cards,
        drill_data: monthData.drill_data,
      };
    }
    return monthData.by_brand[state.brand] || {
      kpi_cards: monthData.kpi_cards,
      drill_data: monthData.drill_data,
    };
  }

  // ===========================================================================
  // 格式化工具
  // ===========================================================================

  /** 格式化 KPI 展示值（亿 / 百分比 / 天） */
  function formatValue(kpi) {
    const v = kpi.current;
    if (kpi.format === "亿") return (v / 1e8).toFixed(2) + "亿";
    if (kpi.format === "百分比") return v.toFixed(1) + "%";
    if (kpi.format === "天") return v.toFixed(1) + "天";
    return String(v);
  }

  function formatMoney(num) {
    if (num == null || isNaN(num)) return "—";
    if (Math.abs(num) >= 1e8) return (num / 1e8).toFixed(2) + "亿";
    if (Math.abs(num) >= 1e4) return (num / 1e4).toFixed(2) + "万";
    return num.toFixed(2);
  }

  function formatChange(kpiKey, change) {
    if (change == null) return { text: "—", cls: "flat" };
    const isRate = ["gross_margin", "expense_rate", "return_rate", "inventory_turnover_days"].includes(kpiKey);
    const suffix = isRate ? "pp" : "%";
    const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    const cls = change > 0 ? "up" : change < 0 ? "down" : "flat";
    const sign = change > 0 ? "+" : "";
    return { text: `${arrow} ${sign}${change}${suffix}`, cls };
  }

  function formatTableYoy(yoy) {
    if (yoy == null) return '<span class="flat">—</span>';
    const cls = yoy > 0 ? "val-up" : yoy < 0 ? "val-down" : "";
    const sign = yoy > 0 ? "+" : "";
    const arrow = yoy > 0 ? "↑" : yoy < 0 ? "↓" : "";
    return `<span class="${cls}">${arrow} ${sign}${yoy}%</span>`;
  }

  /** 元 → 万元（图表用） */
  function toWan(yuan) {
    return Math.round(yuan / 10000);
  }

  // ===========================================================================
  // Chart.js 图表
  // ===========================================================================

  /** 柱状图顶部占比标注插件 */
  const barSharePlugin = {
    id: "barShareLabels",
    afterDatasetsDraw(chart) {
      const { ctx, data } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;
      const values = data.datasets[0].data;
      const total = values.reduce((s, v) => s + v, 0);
      ctx.save();
      ctx.font = "11px sans-serif";
      ctx.fillStyle = CHART_THEME.textMuted;
      ctx.textAlign = "center";
      meta.data.forEach((bar, i) => {
        const pct = total ? ((values[i] / total) * 100).toFixed(1) : "0";
        ctx.fillText(`${pct}%`, bar.x, bar.y - 6);
      });
      ctx.restore();
    },
  };

  function getBaseChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600 },
      plugins: {
        legend: {
          labels: {
            color: CHART_THEME.text,
            font: { size: 12 },
            boxWidth: 12,
            padding: 16,
          },
        },
        tooltip: {
          backgroundColor: CHART_THEME.tooltipBg,
          borderColor: CHART_THEME.tooltipBorder,
          borderWidth: 1,
          titleColor: CHART_THEME.text,
          bodyColor: CHART_THEME.textMuted,
          padding: 10,
        },
      },
      scales: {
        x: {
          ticks: { color: CHART_THEME.textMuted, font: { size: 11 } },
          grid: { color: CHART_THEME.grid, drawBorder: false },
          border: { display: false },
        },
        y: {
          ticks: {
            color: CHART_THEME.textMuted,
            font: { size: 11 },
            callback: (v) => v + "万",
          },
          grid: { color: CHART_THEME.grid, drawBorder: false },
          border: { display: false },
        },
      },
    };
  }

  /** 获取近12个月趋势数据 */
  function getTrendData() {
    const brand = state.brand || "全部";
    const fromBrand = state.rawData?.trends_by_brand?.[brand];
    if (fromBrand?.length) return fromBrand;
    if (state.rawData?.monthly_trend?.length) return state.rawData.monthly_trend;

    // 兜底：从 monthly 聚合
    const months = (state.rawData?.meta?.months || []).slice(-12);
    return months.map((m) => {
      const bundle = state.rawData.monthly[m];
      const kpis = brand === "全部"
        ? bundle?.kpi_cards
        : bundle?.by_brand?.[brand]?.kpi_cards;
      return {
        month: m,
        gmv: kpis?.gmv?.current || 0,
        net_revenue: kpis?.net_revenue?.current || 0,
      };
    });
  }

  /** 渲染月度收入趋势折线图 */
  function renderTrendChart() {
    if (!els.trendChart || typeof Chart === "undefined") return;

    const trend = getTrendData();
    const labels = trend.map((d) => d.month);
    const netData = trend.map((d) => toWan(d.net_revenue));
    const gmvData = trend.map((d) => toWan(d.gmv));

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(els.trendChart, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "净收入",
            data: netData,
            borderColor: CHART_THEME.accent,
            backgroundColor: "rgba(77, 163, 255, 0.1)",
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: CHART_THEME.accent,
            pointHoverRadius: 5,
            tension: 0.35,
            fill: true,
          },
          {
            label: "GMV",
            data: gmvData,
            borderColor: CHART_THEME.gmv,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 2,
            pointBackgroundColor: CHART_THEME.gmv,
            tension: 0.35,
            fill: false,
          },
        ],
      },
      options: getBaseChartOptions(),
    });
  }

  /** 渲染各渠道收入柱状图 */
  function renderChannelChart() {
    if (!els.channelChart || typeof Chart === "undefined") return;

    const channels = getActiveBundle()?.drill_data?.revenue_by_channel || [];
    const labels = channels.map((c) => c.channel);
    const values = channels.map((c) => toWan(c.revenue));

    if (channelChartInstance) {
      channelChartInstance.destroy();
    }

    const ctx = els.channelChart.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "#4da3ff");
    gradient.addColorStop(1, "#1a5fb4");

    channelChartInstance = new Chart(els.channelChart, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "净收入（万元）",
            data: values,
            backgroundColor: gradient,
            borderColor: "rgba(77, 163, 255, 0.6)",
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        ...getBaseChartOptions(),
        plugins: {
          ...getBaseChartOptions().plugins,
          legend: { display: false },
        },
      },
      plugins: [barSharePlugin],
    });
  }

  /** 筛选器切换时更新图表 */
  function updateCharts() {
    renderTrendChart();
    renderChannelChart();
  }

  // ===========================================================================
  // KPI 指标卡
  // ===========================================================================

  function renderKPICards() {
    if (!els.kpiGrid) return;
    const bundle = getActiveBundle();
    if (!bundle) return;

    const { kpi_cards } = bundle;
    els.kpiGrid.innerHTML = KPI_ORDER.map((key) => {
      const kpi = kpi_cards[key];
      const yoy = formatChange(key, kpi.yoy_change);
      const mom = formatChange(key, kpi.mom_change);
      const selected = state.selectedKpi === key ? " selected" : "";
      return `
        <div class="kpi-card${selected}" data-kpi="${key}" role="button" tabindex="0">
          <div class="kpi-label">${kpi.label}</div>
          <div class="kpi-value">${formatValue(kpi)}</div>
          <div class="kpi-changes">
            <div class="kpi-change ${yoy.cls}">同比 ${yoy.text}</div>
            <div class="kpi-change ${mom.cls}">环比 ${mom.text}</div>
          </div>
        </div>`;
    }).join("");

    els.kpiGrid.querySelectorAll(".kpi-card").forEach((card) => {
      card.addEventListener("click", () => onKpiCardClick(card.dataset.kpi));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKpiCardClick(card.dataset.kpi);
        }
      });
    });
  }

  function onKpiCardClick(kpiKey) {
    state.selectedKpi = kpiKey;
    state.drillStack = [];
    state.drillLevel = "overview";
    state.currentBrand = null;
    state.currentChannel = null;

    const bundle = getActiveBundle();
    const kpi = bundle.kpi_cards[kpiKey];

    if (els.definitionLabel) els.definitionLabel.textContent = kpi.full_name + " · 口径说明";
    if (els.definitionText) els.definitionText.textContent = kpi.definition;

    applyKpiDrill(kpiKey);
    renderKPICards();
    renderBreadcrumb();
    renderCurrentDrill();
    renderStoreRanking();
  }

  function applyKpiDrill(kpiKey) {
    if (REVENUE_KPIS.has(kpiKey) || kpiKey === "net_profit") {
      state.drillLevel = "brand";
      state.drillStack = [{ level: "brand", label: "品牌收入" }];
    } else if (kpiKey === "return_rate") {
      state.drillLevel = "channel";
      state.drillStack = [{ level: "channel", label: "渠道退货" }];
    } else if (kpiKey === "expense_rate") {
      state.drillLevel = "expense";
      state.drillStack = [{ level: "expense", label: "费用分类" }];
    } else if (kpiKey === "inventory_turnover_days") {
      state.drillLevel = "inventory";
      state.drillStack = [{ level: "inventory", label: "库存周转" }];
    }
  }

  // ===========================================================================
  // 面包屑导航
  // ===========================================================================

  function renderBreadcrumb() {
    if (!els.breadcrumb) return;

    const items = [{ label: "总览", index: -1 }];
    state.drillStack.forEach((frame, i) => {
      items.push({ label: frame.label, index: i });
    });

    els.breadcrumb.innerHTML = items
      .map((item, i) => {
        const sep = i > 0 ? '<span class="breadcrumb-sep">›</span>' : "";
        const isLast = i === items.length - 1;
        if (isLast) {
          return `${sep}<span class="breadcrumb-item current">${item.label}</span>`;
        }
        return `${sep}<span class="breadcrumb-item" data-index="${item.index}">${item.label}</span>`;
      })
      .join("");

    els.breadcrumb.querySelectorAll(".breadcrumb-item[data-index]").forEach((el) => {
      el.addEventListener("click", () => goToLevel(parseInt(el.dataset.index, 10)));
    });
  }

  /** 点击面包屑返回指定层级 */
  function goToLevel(index) {
    if (index < 0) {
      state.currentBrand = null;
      state.currentChannel = null;
      state.drillStack = [];
      if (state.selectedKpi) {
        applyKpiDrill(state.selectedKpi);
      } else {
        state.drillLevel = "overview";
      }
    } else {
      state.drillStack = state.drillStack.slice(0, index + 1);
      const frame = state.drillStack[index];
      state.drillLevel = frame.level;
      if (frame.level === "brand") {
        state.currentBrand = null;
        state.currentChannel = null;
      } else if (frame.level === "channel") {
        state.currentChannel = null;
      }
    }
    renderBreadcrumb();
    renderCurrentDrill();
  }

  // ===========================================================================
  // 下钻渲染调度
  // ===========================================================================

  function renderCurrentDrill() {
    if (!els.detailTableBody) return;

    if (!state.selectedKpi && state.drillLevel === "overview") {
      if (els.detailTitle) els.detailTitle.textContent = "各品牌收入排名";
      renderBrandRevenue();
      return;
    }

    switch (state.drillLevel) {
      case "brand":
        if (els.detailTitle) els.detailTitle.textContent = "各品牌收入排名";
        renderBrandRevenue();
        break;
      case "channel":
        if (state.currentBrand) {
          if (els.detailTitle) els.detailTitle.textContent = `${state.currentBrand} · 渠道收入`;
          renderChannelRevenue(state.currentBrand);
        } else {
          if (els.detailTitle) els.detailTitle.textContent = "各渠道退货情况";
          renderAllChannelRevenue();
        }
        break;
      case "category":
        if (els.detailTitle) {
          els.detailTitle.textContent = `${state.currentBrand} · ${state.currentChannel} · 品类收入`;
        }
        renderCategoryRevenue(state.currentBrand, state.currentChannel);
        break;
      case "expense":
        if (els.detailTitle) els.detailTitle.textContent = "费用分类汇总";
        renderExpenseBreakdown();
        break;
      case "inventory":
        if (els.detailTitle) els.detailTitle.textContent = "各品牌库存周转";
        renderInventoryTable();
        break;
      default:
        if (els.detailTitle) els.detailTitle.textContent = "各品牌收入排名";
        renderBrandRevenue();
    }
  }

  // ===========================================================================
  // 表格渲染函数
  // ===========================================================================

  /** 渲染品牌收入表格 */
  function renderBrandRevenue() {
    const rows = getActiveBundle().drill_data.revenue_by_brand;
    const hierarchy = getActiveBundle().drill_data.drill_hierarchy;
    const canDrill = REVENUE_KPIS.has(state.selectedKpi) || state.selectedKpi === "net_profit" || !state.selectedKpi;

    els.detailTableHead.innerHTML = `
      <tr>
        <th>品牌</th>
        <th class="num">净收入</th>
        <th class="num">毛利率</th>
        <th class="num">同比</th>
        <th></th>
      </tr>`;

    if (!rows.length) {
      els.detailTableBody.innerHTML = '<tr><td colspan="5" class="empty-hint">暂无数据</td></tr>';
      return;
    }

    els.detailTableBody.innerHTML = rows.map((row) => {
      const hasChildren = canDrill && hierarchy[row.brand]?.channels?.length;
      return `
        <tr>
          <td>${row.brand}</td>
          <td class="num">${formatMoney(row.revenue)}</td>
          <td class="num">${row.gross_margin.toFixed(1)}%</td>
          <td class="num">${formatTableYoy(row.yoy)}</td>
          <td>
            <button class="drill-btn" data-brand="${row.brand}" ${hasChildren ? "" : "disabled"}>
              查看渠道明细 →
            </button>
          </td>
        </tr>`;
    }).join("");

    els.detailTableBody.querySelectorAll(".drill-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        drillToChannel(btn.dataset.brand);
      });
    });
  }

  /** 下钻到指定品牌的渠道收入 */
  function drillToChannel(brand) {
    state.currentBrand = brand;
    state.currentChannel = null;
    state.drillLevel = "channel";
    state.drillStack = [
      { level: "brand", label: "品牌收入" },
      { level: "channel", label: brand },
    ];
    renderBreadcrumb();
    renderCurrentDrill();
  }

  /** 渲染全渠道汇总（退货率等指标用） */
  function renderAllChannelRevenue() {
    const rows = getActiveBundle().drill_data.revenue_by_channel;

    els.detailTableHead.innerHTML = `
      <tr>
        <th>渠道</th>
        <th class="num">净收入</th>
        <th class="num">毛利率</th>
        <th class="num">退货率</th>
        <th class="num">同比</th>
        <th></th>
      </tr>`;

    if (!rows.length) {
      els.detailTableBody.innerHTML = '<tr><td colspan="6" class="empty-hint">暂无数据</td></tr>';
      return;
    }

    els.detailTableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.channel}</td>
        <td class="num">${formatMoney(row.revenue)}</td>
        <td class="num">${row.gross_margin.toFixed(1)}%</td>
        <td class="num">${row.return_rate.toFixed(1)}%</td>
        <td class="num">${formatTableYoy(row.yoy)}</td>
        <td><button class="drill-btn" disabled>—</button></td>
      </tr>`).join("");
  }

  /** 渲染渠道收入表格 */
  function renderChannelRevenue(brand) {
    const hierarchy = getActiveBundle().drill_data.drill_hierarchy;
    const rows = hierarchy[brand]?.channels || [];

    els.detailTableHead.innerHTML = `
      <tr>
        <th>渠道</th>
        <th class="num">净收入</th>
        <th class="num">毛利率</th>
        <th class="num">退货率</th>
        <th class="num">同比</th>
        <th></th>
      </tr>`;

    if (!rows.length) {
      els.detailTableBody.innerHTML = '<tr><td colspan="6" class="empty-hint">暂无数据</td></tr>';
      return;
    }

    els.detailTableBody.innerHTML = rows.map((row) => {
      const hasCat = row.categories && row.categories.length > 0;
      return `
        <tr>
          <td>${row.channel}</td>
          <td class="num">${formatMoney(row.revenue)}</td>
          <td class="num">${row.gross_margin.toFixed(1)}%</td>
          <td class="num">${row.return_rate.toFixed(1)}%</td>
          <td class="num">${formatTableYoy(row.yoy)}</td>
          <td>
            <button class="drill-btn" data-channel="${row.channel}" ${hasCat ? "" : "disabled"}>
              查看品类明细 →
            </button>
          </td>
        </tr>`;
    }).join("");

    els.detailTableBody.querySelectorAll(".drill-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        drillToCategory(brand, btn.dataset.channel);
      });
    });
  }

  /** 下钻到品类 */
  function drillToCategory(brand, channel) {
    state.currentBrand = brand;
    state.currentChannel = channel;
    state.drillLevel = "category";
    state.drillStack = [
      { level: "brand", label: "品牌收入" },
      { level: "channel", label: brand },
      { level: "category", label: channel },
    ];
    renderBreadcrumb();
    renderCurrentDrill();
  }

  /** 渲染品类收入表格 */
  function renderCategoryRevenue(brand, channel) {
    const hierarchy = getActiveBundle().drill_data.drill_hierarchy;
    const ch = hierarchy[brand]?.channels?.find((c) => c.channel === channel);
    const rows = ch?.categories || [];

    els.detailTableHead.innerHTML = `
      <tr>
        <th>品类</th>
        <th class="num">净收入</th>
        <th class="num">毛利率</th>
        <th class="num">退货率</th>
        <th class="num">同比</th>
        <th></th>
      </tr>`;

    els.detailTableBody.innerHTML = rows.length
      ? rows.map((row) => `
        <tr>
          <td>${row.category}</td>
          <td class="num">${formatMoney(row.revenue)}</td>
          <td class="num">${row.gross_margin.toFixed(1)}%</td>
          <td class="num">${row.return_rate.toFixed(1)}%</td>
          <td class="num">${formatTableYoy(row.yoy)}</td>
          <td><button class="drill-btn" disabled>已到最细</button></td>
        </tr>`).join("")
      : '<tr><td colspan="6" class="empty-hint">暂无数据</td></tr>';
  }

  /** 渲染费用分类表格 */
  function renderExpenseBreakdown() {
    const rows = getActiveBundle().drill_data.expense_breakdown;

    els.detailTableHead.innerHTML = `
      <tr>
        <th>费用科目</th>
        <th class="num">金额</th>
        <th class="num">占比</th>
        <th class="num">同比</th>
        <th></th>
      </tr>`;

    els.detailTableBody.innerHTML = rows.map((row) => `
      <tr>
        <td>${row.category}</td>
        <td class="num">${formatMoney(row.amount)}</td>
        <td class="num">${row.ratio.toFixed(1)}%</td>
        <td class="num">${formatTableYoy(row.yoy)}</td>
        <td><button class="drill-btn" disabled>—</button></td>
      </tr>`).join("");
  }

  /** 渲染库存周转表格 */
  function renderInventoryTable() {
    const rows = getActiveBundle().drill_data.inventory_by_brand || [];

    els.detailTableHead.innerHTML = `
      <tr>
        <th>品牌</th>
        <th class="num">周转天数</th>
        <th class="num">库存成本</th>
        <th></th>
      </tr>`;

    els.detailTableBody.innerHTML = rows.length
      ? rows.map((row) => `
        <tr>
          <td>${row.brand}</td>
          <td class="num">${row.turnover_days.toFixed(1)}天</td>
          <td class="num">${formatMoney(row.inventory_cost)}</td>
          <td><button class="drill-btn" disabled>—</button></td>
        </tr>`).join("")
      : '<tr><td colspan="4" class="empty-hint">暂无库存快照</td></tr>';
  }

  /** 渲染门店排名表格 */
  function renderStoreRanking() {
    if (!els.mainContent) return;

    let section = document.getElementById("store-section");
    const stores = getActiveBundle()?.drill_data?.store_top5 || [];

    if (!stores.length) {
      if (section) section.remove();
      return;
    }

    if (!section) {
      section = document.createElement("section");
      section.id = "store-section";
      section.className = "detail-section";
      section.setAttribute("aria-label", "门店排名");
      els.mainContent.appendChild(section);
    }

    section.innerHTML = `
      <h3 class="detail-table-title">直营门店收入 Top5</h3>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>门店</th>
              <th>区域</th>
              <th class="num">收入</th>
              <th class="num">坪效</th>
              <th class="num">利润</th>
            </tr>
          </thead>
          <tbody>
            ${stores.map((s) => `
              <tr>
                <td>${s.name}</td>
                <td>${s.region}</td>
                <td class="num">${formatMoney(s.revenue)}</td>
                <td class="num">${s.pingxiao.toFixed(0)}</td>
                <td class="num">${formatMoney(s.profit)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  // ===========================================================================
  // 筛选器
  // ===========================================================================

  function initFilters() {
    if (!els.monthSelect || !els.brandSelect) return;

    const { months, brands } = state.rawData.meta;
    els.monthSelect.innerHTML = months
      .map((m) => `<option value="${m}"${m === state.month ? " selected" : ""}>${m}</option>`)
      .join("");
    els.brandSelect.innerHTML = brands
      .map((b) => `<option value="${b}"${b === state.brand ? " selected" : ""}>${b}</option>`)
      .join("");

    els.monthSelect.addEventListener("change", () => {
      state.month = els.monthSelect.value;
      syncExportDatesToMonth(state.month);
      renderExportPreview();
      resetDrill();
      renderDataPage();
    });

    els.brandSelect.addEventListener("change", () => {
      state.brand = els.brandSelect.value;
      resetDrill();
      renderDataPage();
    });
  }

  function resetDrill() {
    state.drillStack = [];
    state.currentBrand = null;
    state.currentChannel = null;
    state.drillLevel = state.selectedKpi ? "brand" : "overview";
    if (state.selectedKpi) applyKpiDrill(state.selectedKpi);
  }

  function renderDataPage() {
    renderKPICards();
    if (state.selectedKpi) {
      const kpi = getActiveBundle().kpi_cards[state.selectedKpi];
      if (els.definitionLabel) els.definitionLabel.textContent = kpi.full_name + " · 口径说明";
      if (els.definitionText) els.definitionText.textContent = kpi.definition;
    }
    updateCharts();
    renderBreadcrumb();
    renderCurrentDrill();
    renderStoreRanking();
  }

  // ===========================================================================
  // 明细数据导出（订单级 CSV）
  // ===========================================================================

  let orderExportData = null;

  async function loadOrderExport() {
    if (orderExportData) return orderExportData;
    const res = await fetch("data/order_export.json");
    if (!res.ok) throw new Error("order_export.json 未找到，请运行 python data/build_summary_json.py");
    orderExportData = await res.json();
    return orderExportData;
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

  function formatExportAmount(num) {
    if (num >= 10000) return (num / 10000).toFixed(2) + "万";
    return Number(num).toFixed(2);
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
      : '<tr><td colspan="8" class="empty-hint">当前筛选条件下无数据</td></tr>';
  }

  function downloadExportCsv() {
    const filters = getExportFilters();
    const filtered = filterExportOrders(filters);
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
    a.download = `跃动体育订单明细_${filters.dateFrom}_${filters.dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function syncExportDatesToMonth(month) {
    if (!month || !/^\d{4}-\d{2}$/.test(month)) return;
    const from = document.getElementById("export-date-from");
    const to = document.getElementById("export-date-to");
    if (from) from.value = `${month}-01`;
    if (to) {
      const [y, m] = month.split("-").map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      to.value = `${month}-${String(lastDay).padStart(2, "0")}`;
    }
  }

  function initExportModule() {
    const section = document.getElementById("export-section");
    if (!section) return;

    const meta = orderExportData?.meta;
    if (meta) {
      const from = document.getElementById("export-date-from");
      const to = document.getElementById("export-date-to");
      if (from) from.value = meta.default_date_from;
      if (to) to.value = meta.default_date_to;
    }

    if (state.month) syncExportDatesToMonth(state.month);

    ["export-date-from", "export-date-to", "export-brand", "export-channel", "export-category"]
      .forEach((id) => {
        document.getElementById(id)?.addEventListener("change", renderExportPreview);
      });

    document.getElementById("btn-export-csv")?.addEventListener("click", downloadExportCsv);
    renderExportPreview();
  }

  // ===========================================================================
  // 异常卡片展开/折叠
  // ===========================================================================

  function initAnomalyCards() {
    document.querySelectorAll(".anomaly-card").forEach((card) => {
      const header = card.querySelector(".anomaly-header");
      if (!header) return;

      const toggle = () => {
        const expanded = card.classList.toggle("expanded");
        header.setAttribute("aria-expanded", expanded ? "true" : "false");
      };

      header.addEventListener("click", toggle);
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  // ===========================================================================
  // 页面初始化
  // ===========================================================================

  async function initDataPage() {
    try {
      await loadData();
      initFilters();
      renderDataPage();
      try {
        await loadOrderExport();
        initExportModule();
      } catch (exportErr) {
        const tbody = document.getElementById("export-preview-body");
        if (tbody) {
          tbody.innerHTML = `<tr><td colspan="8" class="empty-hint">${exportErr.message}</td></tr>`;
        }
      }
    } catch (err) {
      if (els.mainContent) {
        els.mainContent.innerHTML = `
          <div class="error-box">
            数据加载失败：${err.message}<br>
            请运行 <code>python data/build_summary_json.py</code>，并通过本地服务器访问页面。
          </div>`;
      }
    }
  }

  function init() {
    cacheElements();
    const body = document.body;

    if (body.classList.contains("page-data")) {
      initDataPage();
    }

    if (body.classList.contains("page-methodology")) {
      return;
    }
    if (body.classList.contains("page-anomaly")) {
      initAnomalyCards();
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  // 暴露关键函数供调试（可选）
  window.YuedongApp = {
    formatValue,
    renderKPICards,
    renderTrendChart,
    renderChannelChart,
    updateCharts,
    renderBrandRevenue,
    renderChannelRevenue,
    renderExpenseBreakdown,
    renderStoreRanking,
    drillToChannel,
    goToLevel,
  };
})();
