/**
 * 跃动体育 · 12看板数据加载器
 */
window.DashLoaders = (function () {
  "use strict";
  const { api, fmtNum, fmtPct, renderKpiGrid, renderTable, initChart, setLineChart, setBarChart, setDonut, setScatter, monthLabel } = DashCore;

  function params(state) {
    const p = { month: state.month };
    if (state.brand && state.brand !== "全部") p.brand = state.brand;
    if (state.channel && state.channel !== "全部") p.channel = state.channel;
    return p;
  }

  async function overview(state) {
    const d = await api("/api/dashboard_overview", params(state));
    renderKpiGrid("db-kpi", d.kpi_cards);
    const trend = initChart("db-chart-trend");
    if (trend && d.monthly_trend?.length) {
      setLineChart(trend, d.monthly_trend.map((r) => r.order_month), [
        { name: "净收入", data: d.monthly_trend.map((r) => r.net_revenue) },
        { name: "GMV", data: d.monthly_trend.map((r) => r.gmv) },
        { name: "毛利", data: d.monthly_trend.map((r) => r.gross_profit) },
      ]);
    }
    setDonut(initChart("db-chart-channel"), d.channel_structure, "channel_name", "net_revenue");
    renderTable("db-brand-rank", d.brand_ranking, [
      { key: "brand_name" }, { key: "net_revenue", fmt: "num", align: "right" },
      { key: "gross_margin_pct", fmt: "pct", align: "right" }, { key: "yoy_growth_pct", fmt: "pct", align: "right" },
    ]);
    renderTable("db-store-top", d.store_top5, [
      { key: "store_name" }, { key: "region" }, { key: "revenue", fmt: "num", align: "right" },
      { key: "pingxiao", fmt: "num", align: "right" }, { key: "profit", fmt: "num", align: "right" },
    ]);
  }

  async function brand(state) {
    const d = await api("/api/dashboard_brand", params(state));
    const b = d.brand_kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "净收入", value: b.net_revenue, unit: "元" },
      { name: "毛利率", value: b.gross_margin_pct, unit: "%" },
      { name: "同比增速", value: b.yoy_growth_pct, unit: "%" },
      { name: "收入占比", value: b.revenue_share_pct, unit: "%" },
    ]);
    setDonut(initChart("db-chart-mix"), d.channel_revenue, "channel_name", "net_revenue");
    setBarChart(initChart("db-chart-margin"),
      d.category_margin?.map((r) => r.category_name) || [],
      [{ name: "毛利率%", data: d.category_margin?.map((r) => r.gross_margin_pct) || [] }],
      { barMaxWidth: 18 }
    );
    setLineChart(initChart("db-chart-trend"), d.monthly_trend?.map((r) => r.order_month) || [], [
      { name: "净收入", data: d.monthly_trend?.map((r) => r.net_revenue) || [] },
    ]);
  }

  async function channel(state) {
    const d = await api("/api/dashboard_channel", params(state));
    renderTable("db-channel-kpi", d.channel_kpi, [
      { key: "channel_name" }, { key: "net_revenue", fmt: "num", align: "right" },
      { key: "gross_margin_pct", fmt: "pct", align: "right" }, { key: "return_rate_pct", fmt: "pct", align: "right" },
    ]);
    const daily = d.daily_trend || [];
    const dates = [...new Set(daily.map((r) => r.order_date))].sort();
    const channels = [...new Set(daily.map((r) => r.channel_name))];
    const series = channels.map((ch) => ({
      name: ch,
      data: dates.map((dt) => {
        const row = daily.find((r) => r.order_date === dt && r.channel_name === ch);
        return row ? row.net_revenue : 0;
      }),
    }));
    setLineChart(initChart("db-chart-daily"), dates, series, { rotate: 45 });
    setScatter(initChart("db-chart-scatter"), d.channel_scatter, "net_revenue", "gross_profit", "channel_name");
    setDonut(initChart("db-chart-expense"), d.expense_breakdown, "expense_type", "expense_amount");
    const adRows = (d.ad_efficiency || []).filter((r) => r.roas != null && Number(r.ad_expense) > 0);
    const roasDom = document.getElementById("db-chart-roas");
    if (adRows.length) {
      if (roasDom) roasDom.classList.remove("chart-empty");
      setBarChart(initChart("db-chart-roas"),
        adRows.map((r) => r.channel_name),
        [{ name: "ROAS", data: adRows.map((r) => r.roas) }],
        { barMaxWidth: 18 }
      );
    } else if (roasDom) {
      const c = initChart("db-chart-roas");
      if (c) c.dispose();
      roasDom.innerHTML = '<div class="empty-hint" style="padding:4rem 1rem">暂无广告费数据（需 dws_expense_monthly 广告费 或 ods_ad_cost）</div>';
    }
  }

  async function financial(state) {
    const d = await api("/api/dashboard_financial", params(state));
    renderTable("db-income", d.income, [
      { key: "brand_name" }, { key: "channel_name" }, { key: "revenue", fmt: "num", align: "right" },
      { key: "gross_profit", fmt: "num", align: "right" }, { key: "net_profit", fmt: "num", align: "right" },
    ]);
    renderTable("db-balance", d.balance, [
      { key: "brand_name" }, { key: "total_assets", fmt: "num", align: "right" },
      { key: "total_liabilities", fmt: "num", align: "right" }, { key: "equity", fmt: "num", align: "right" },
    ]);
    renderTable("db-cashflow-stmt", d.cashflow, [
      { key: "brand_name" }, { key: "operating_cashflow", fmt: "num", align: "right" },
      { key: "investing_cashflow", fmt: "num", align: "right" }, { key: "net_cashflow", fmt: "num", align: "right" },
    ]);
    renderTable("db-recon", d.reconciliation, [
      { key: "brand_name" }, { key: "cash_to_profit_ratio", fmt: "raw", align: "right" },
      { key: "balance_check", fmt: "raw" }, { key: "balance_equation_gap", fmt: "num", align: "right" },
    ]);
  }

  async function dupont(state) {
    const d = await api("/api/dashboard_dupont", params(state));
    renderTable("db-dupont-current", d.current, [
      { key: "brand_name" }, { key: "roe", fmt: "pct", align: "right" },
      { key: "net_profit_margin", fmt: "pct", align: "right" }, { key: "asset_turnover", fmt: "raw", align: "right" },
      { key: "equity_multiplier", fmt: "raw", align: "right" }, { key: "roe_drag_factor", fmt: "raw" },
    ]);
    const brands = [...new Set((d.trend || []).map((r) => r.brand_name))];
    const months = [...new Set((d.trend || []).map((r) => monthLabel(r.month_id)))].sort();
    const series = brands.map((b) => ({
      name: b,
      data: months.map((m) => {
        const row = d.trend.find((r) => r.brand_name === b && monthLabel(r.month_id) === m);
        return row ? row.roe : null;
      }),
    }));
    setLineChart(initChart("db-chart-roe-trend"), months, series);
    setBarChart(initChart("db-chart-roe-compare"),
      d.current?.map((r) => r.brand_name) || [],
      [{ name: "ROE%", data: d.current?.map((r) => r.roe) || [] }],
      { barMaxWidth: 18 }
    );
  }

  async function cashflow(state) {
    const d = await api("/api/dashboard_cashflow", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "经营现金流", value: k.operating_cashflow },
      { name: "投资现金流", value: k.investing_cashflow },
      { name: "筹资现金流", value: k.financing_cashflow },
      { name: "净现比", value: k.profit_to_cash_ratio, sub: "经营现金流/净利润" },
    ]);
    setLineChart(initChart("db-chart-cf-trend"),
      d.trend?.map((r) => monthLabel(r.month_id)) || [],
      [
        { name: "净利润", data: d.trend?.map((r) => r.net_profit) || [] },
        { name: "经营现金流", data: d.trend?.map((r) => r.operating_cashflow) || [] },
      ]
    );
    renderTable("db-gap", d.gap_breakdown, [
      { key: "brand_name" }, { key: "net_profit", fmt: "num", align: "right" },
      { key: "operating_cashflow", fmt: "num", align: "right" }, { key: "gap_reason", fmt: "raw" },
    ]);
    renderTable("db-forecast", d.forecast, [
      { key: "forecast_period", fmt: "raw" }, { key: "cumulative_balance", fmt: "num", align: "right" },
      { key: "gap_amount", fmt: "num", align: "right" }, { key: "status", fmt: "raw" },
    ]);
    renderTable("db-bank", d.bank_balances, [
      { key: "bank_account", fmt: "raw" }, { key: "closing_balance", fmt: "num", align: "right" },
      { key: "available_days", fmt: "raw", align: "right" }, { key: "fund_status", fmt: "raw" },
    ]);
  }

  async function tax(state) {
    const d = await api("/api/dashboard_tax", params(state));
    renderTable("db-tax-items", d.items, [
      { key: "brand_name" }, { key: "tax_type" }, { key: "effective_tax_rate", fmt: "pct", align: "right" },
      { key: "industry_avg_tax_rate", fmt: "pct", align: "right" }, { key: "tax_burden_status", fmt: "raw" },
    ]);
    setBarChart(initChart("db-chart-tax"),
      d.items?.map((r) => `${r.brand_name}-${r.tax_type}`) || [],
      [
        { name: "实际税负%", data: d.items?.map((r) => r.effective_tax_rate) || [] },
        { name: "行业平均%", data: d.items?.map((r) => r.industry_avg_tax_rate) || [] },
      ]
    );
    setLineChart(initChart("db-chart-tax-trend"),
      [...new Set(d.trend?.map((r) => monthLabel(r.month_id)) || [])],
      [{ name: "增值税负率%", data: d.trend?.map((r) => r.effective_tax_rate) || [] }]
    );
  }

  async function inventory(state) {
    const d = await api("/api/dashboard_inventory", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "库存成本", value: k.total_inventory_cost },
      { name: "平均周转天数", value: k.avg_turnover_days, unit: "天" },
      { name: "库存数量", value: k.total_qty },
      { name: "SKU数", value: k.sku_count },
    ]);
    setDonut(initChart("db-chart-age"), d.age_structure, "age_bucket", "inventory_cost");
    setBarChart(initChart("db-chart-turnover"),
      d.brand_turnover?.map((r) => r.brand_name) || [],
      [{ name: "周转天数", data: d.brand_turnover?.map((r) => r.avg_turnover_days) || [] }],
      { barMaxWidth: 18 }
    );
    renderTable("db-slow-sku", d.slow_sku, [
      { key: "brand_name" }, { key: "category_name" }, { key: "turnover_days", fmt: "raw", align: "right" },
      { key: "inventory_cost", fmt: "num", align: "right" },
    ]);
  }

  async function budget(state) {
    const d = await api("/api/dashboard_budget", params(state));
    setBarChart(initChart("db-chart-budget-ch"),
      d.by_channel?.map((r) => r.channel_name) || [],
      [
        { name: "预算", data: d.by_channel?.map((r) => r.budget_amount) || [] },
        { name: "实际", data: d.by_channel?.map((r) => r.actual_amount) || [] },
      ]
    );
    setBarChart(initChart("db-chart-budget-br"),
      d.by_brand?.map((r) => r.brand_name) || [],
      [
        { name: "达成率%", data: d.by_brand?.map((r) => r.achievement_rate) || [] },
      ],
      { barMaxWidth: 18 }
    );
    renderTable("db-budget-alerts", d.alerts, [
      { key: "brand_name" }, { key: "channel_name" }, { key: "expense_type" },
      { key: "variance_rate", fmt: "pct", align: "right" }, { key: "alert_level", fmt: "raw" },
    ]);
    renderTable("db-budget-detail", d.detail, [
      { key: "brand_name" }, { key: "channel_name" }, { key: "expense_type" },
      { key: "budget_amount", fmt: "num", align: "right" }, { key: "actual_amount", fmt: "num", align: "right" },
      { key: "achievement_rate", fmt: "pct", align: "right" },
    ]);
  }

  async function store(state) {
    const d = await api("/api/dashboard_store", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "门店数", value: k.store_count },
      { name: "月总收入", value: k.total_revenue },
      { name: "月总利润", value: k.total_profit },
      { name: "亏损门店", value: k.loss_store_count, sub: `平均坪效 ${fmtNum(k.avg_pingxiao)}` },
    ]);
    renderTable("db-store-top", d.top10, [
      { key: "revenue_rank", fmt: "raw", align: "right" }, { key: "store_name" }, { key: "region" },
      { key: "revenue", fmt: "num", align: "right" }, { key: "profit", fmt: "num", align: "right" },
      { key: "pingxiao", fmt: "num", align: "right" },
    ]);
    setScatter(initChart("db-chart-store-health"), d.scatter, "pingxiao", "profit", "store_name");
    renderTable("db-store-alerts", d.alerts, [
      { key: "store_name" }, { key: "region" }, { key: "revenue", fmt: "num", align: "right" },
      { key: "profit", fmt: "num", align: "right" }, { key: "alert_tag", fmt: "raw" },
    ]);
  }

  async function profitQuality(state) {
    const d = await api("/api/dashboard_profit_quality", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "平均净现比", value: k.avg_cash_ratio },
      { name: "净利润合计", value: k.total_net_profit },
      { name: "经营现金流", value: k.total_operating_cashflow },
      { name: "危险品牌数", value: k.danger_count },
    ]);
    setLineChart(initChart("db-chart-pq-trend"),
      d.trend?.map((r) => monthLabel(r.month_id)) || [],
      [
        { name: "净利润", data: d.trend?.map((r) => r.net_profit) || [] },
        { name: "经营现金流", data: d.trend?.map((r) => r.operating_cashflow) || [] },
      ]
    );
    renderTable("db-pq-brand", d.by_brand, [
      { key: "brand_name" }, { key: "cash_ratio", fmt: "raw", align: "right" },
      { key: "cash_ratio_status", fmt: "raw" }, { key: "gap_reason", fmt: "raw" },
    ]);
    setBarChart(initChart("db-chart-pq-bench"),
      d.benchmark?.map((r) => r.brand_name) || [],
      [
        { name: "我方净现比", data: d.benchmark?.map((r) => r.our_cash_ratio) || [] },
        { name: "行业平均", data: d.benchmark?.map((r) => r.industry_avg_cash_ratio) || [] },
      ]
    );
  }

  async function cvp(state) {
    const d = await api("/api/dashboard_cvp", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "边际贡献率", value: k.avg_contribution_margin_rate, unit: "%" },
      { name: "盈亏平衡收入", value: k.avg_breakeven_revenue },
      { name: "安全边际率", value: k.avg_safety_margin, unit: "%" },
      { name: "当期收入", value: k.total_revenue },
    ]);
    setBarChart(initChart("db-chart-cvp-brand"),
      d.by_brand?.map((r) => r.brand_name) || [],
      [{ name: "安全边际%", data: d.by_brand?.map((r) => r.safety_margin) || [] }]
    );
    setBarChart(initChart("db-chart-cvp-channel"),
      d.by_channel?.map((r) => r.channel_name) || [],
      [{ name: "边际贡献率%", data: d.by_channel?.map((r) => r.contribution_margin_rate) || [] }]
    );
    renderTable("db-cvp-sensitivity", d.sensitivity, [
      { key: "brand_name" }, { key: "channel_name" }, { key: "revenue", fmt: "num", align: "right" },
      { key: "breakeven_revenue", fmt: "num", align: "right" }, { key: "current_safety_margin", fmt: "pct", align: "right" },
    ]);
  }

  async function quality() {
    const d = await api("/api/dashboard_quality");
    const latest = d.latest_score ?? 100;
    renderKpiGrid("db-kpi", [
      { name: "质量评分", value: latest },
      { name: "PASS率", value: d.pass_rate, unit: "%" },
      { name: "未解决异常", value: d.open_count },
      { name: "最近检查", value: d.last_check, sub: "ODS↔DWD↔DWS" },
    ]);
    const summary = d.summary || [];
    setLineChart(initChart("db-chart-quality"),
      summary.map((r) => r.check_date).reverse(),
      [{ name: "质量评分", data: summary.map((r) => r.quality_score).reverse() }]
    );
    renderTable("db-quality-recon", d.reconciliation, [
      { key: "table_name", fmt: "raw" }, { key: "check_type", fmt: "raw" },
      { key: "expected_value", fmt: "raw", align: "right" }, { key: "actual_value", fmt: "raw", align: "right" },
      { key: "status", fmt: "raw" },
    ]);
    renderTable("db-quality-issues", d.open_issues, [
      { key: "log_date", fmt: "raw" }, { key: "source_table", fmt: "raw" },
      { key: "error_type", fmt: "raw" }, { key: "severity", fmt: "raw" },
    ]);
  }

  const registry = {
    overview, brand, channel, financial, dupont, cashflow, tax, inventory,
    budget, store, "profit-quality": profitQuality, cvp, quality,
  };

  async function load(id, state) {
    const fn = registry[id];
    if (!fn) throw new Error(`未知看板: ${id}`);
    await fn(state);
    DashCore.resizeAll();
  }

  return { load, registry };
})();
