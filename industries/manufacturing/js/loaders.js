/** 制造业 · 看板数据加载 */
window.DashLoaders = (function () {
  "use strict";
  const { api, renderKpiGrid, renderTable, initChart, setLineChart, setBarChart, setDonut } = DashCore;

  function params(state) {
    const p = { month: state.month };
    if (state.factory && state.factory !== "全部") p.factory = state.factory;
    return p;
  }

  const ALERT_COL = { key: "alert_level", fmt: "tag" };

  async function production(state) {
    const d = await api("/api/dashboard_production", params(state));
    const k = d.kpi || {};
    const kpis = [
      { name: "月产量", value: k.output_qty, role: "core" },
      { name: "产能利用率", value: k.capacity_util_pct, unit: "%", role: "core" },
      { name: "良品率", value: k.yield_rate_pct, unit: "%", role: "guardrail", sub: "围栏：冲产能不得牺牲良品率" },
      { name: "单位成本", value: k.unit_cost, role: "guardrail", sub: "围栏：成本失控不认假好 CMEI" },
      { name: "准时交付率", value: k.on_time_delivery_pct, unit: "%", role: "core" },
    ];
    if (k.cmei_pct != null && k.cmei_pct !== "") {
      kpis.unshift({
        name: "CMEI",
        value: k.cmei_pct,
        unit: "%",
        role: "core",
        sub: "FPY×40% + OEE×35% + OTD×25%",
      });
    }
    renderKpiGrid("db-kpi", window.NorthstarPhases?.applyKpiRoles
      ? window.NorthstarPhases.applyKpiRoles(kpis)
      : kpis.map((c) => (c.name === "CMEI" ? { ...c, role: "northstar" } : c)));
    setLineChart(initChart("db-chart-output-trend"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "产量", data: d.trend?.map((r) => r.output_qty) || [] },
       { name: "产能利用率%", data: d.trend?.map((r) => r.capacity_util_pct) || [] }]);
    setBarChart(initChart("db-chart-line-share"), d.line_share?.map((r) => r.line_code) || [],
      [{ name: "产量", data: d.line_share?.map((r) => r.output_qty) || [] }]);
    renderTable("db-table-line", d.line_detail, [
      { key: "line_name" }, { key: "factory_name" },
      { key: "output_qty", fmt: "num", align: "right" },
      { key: "capacity_util_pct", align: "right" },
      { key: "otd_pct", align: "right" },
      { key: "plan_achieve_pct", align: "right" },
    ]);
  }

  async function delivery(state) {
    const d = await api("/api/dashboard_delivery", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", window.NorthstarPhases?.applyKpiRoles?.([
      { name: "准时交付率", value: k.otd_pct, unit: "%" },
      { name: "逾期工单", value: k.late_count },
      { name: "计划达成率", value: k.plan_achieve_pct, unit: "%" },
      { name: "平均交付周期(天)", value: k.avg_lead_days },
      { name: "工单数", value: k.order_count },
    ]) || [
      { name: "准时交付率", value: k.otd_pct, unit: "%" },
      { name: "逾期工单", value: k.late_count },
      { name: "计划达成率", value: k.plan_achieve_pct, unit: "%" },
      { name: "平均交付周期(天)", value: k.avg_lead_days },
      { name: "工单数", value: k.order_count },
    ]);
    setLineChart(initChart("db-chart-otd-trend"), d.trend?.map((r) => r.month_label) || [],
      [{ name: "准时交付率%", data: d.trend?.map((r) => r.otd_pct) || [] },
       { name: "计划达成率%", data: d.trend?.map((r) => r.plan_achieve_pct) || [] }]);
    setBarChart(initChart("db-chart-wip"), d.wip?.map((r) => r.process_step) || [],
      [{ name: "在制品数量", data: d.wip?.map((r) => r.wip_qty) || [] }]);
    renderTable("db-table-late", d.late_orders, [
      { key: "order_id" }, { key: "product_name" }, { key: "line_name" },
      { key: "due_date" },
      { key: "overdue_days", align: "right" },
      { key: "plan_qty", fmt: "num", align: "right" },
      { key: "actual_qty", fmt: "num", align: "right" },
      { key: "shortage_qty", fmt: "num", align: "right" },
      ALERT_COL,
    ]);
  }

  async function quality(state) {
    const d = await api("/api/dashboard_quality", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", window.NorthstarPhases?.applyKpiRoles?.([
      { name: "良品率", value: k.yield_rate_pct, unit: "%" },
      { name: "不良率", value: k.defect_rate_pct, unit: "%" },
      { name: "报废率", value: k.scrap_rate_pct, unit: "%" },
      { name: "一次通过率", value: k.first_pass_pct, unit: "%" },
    ]) || [
      { name: "良品率", value: k.yield_rate_pct, unit: "%" },
      { name: "不良率", value: k.defect_rate_pct, unit: "%" },
      { name: "报废率", value: k.scrap_rate_pct, unit: "%" },
      { name: "一次通过率", value: k.first_pass_pct, unit: "%" },
    ]);
    setLineChart(initChart("db-chart-quality-trend"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "良品率%", data: d.trend?.map((r) => r.yield_rate_pct) || [] }]);
    setBarChart(initChart("db-chart-defect-pareto"), d.pareto?.map((r) => r.defect_type) || [],
      [{ name: "不良数", data: d.pareto?.map((r) => r.defect_qty) || [] }]);
    setDonut(initChart("db-chart-defect-category"), d.defect_category || [], "defect_category", "defect_qty");
    renderTable("db-table-quality-line", d.line_detail, [
      { key: "line_name" },
      { key: "yield_rate_pct", align: "right" },
      { key: "defect_rate_pct", align: "right" },
      { key: "scrap_rate_pct", align: "right" },
      { key: "first_pass_pct", align: "right" },
      ALERT_COL,
    ]);
  }

  async function equipment(state) {
    const d = await api("/api/dashboard_equipment", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", window.NorthstarPhases?.applyKpiRoles?.([
      { name: "OEE", value: k.oee_pct, unit: "%" },
      { name: "停机时长", value: k.downtime_hours },
      { name: "故障次数", value: k.failure_count },
    ]) || [
      { name: "OEE", value: k.oee_pct, unit: "%" },
      { name: "停机时长", value: k.downtime_hours },
      { name: "故障次数", value: k.failure_count },
    ]);
    setBarChart(initChart("db-chart-oee-bar"), d.oee_rank?.map((r) => r.equipment_code) || [],
      [{ name: "OEE%", data: d.oee_rank?.map((r) => r.oee_pct) || [] }]);
    setDonut(initChart("db-chart-downtime"), d.downtime || [], "downtime_reason", "hours");
    renderTable("db-table-equipment", d.detail, [
      { key: "equipment_name" }, { key: "line_code" }, { key: "factory_name" },
      { key: "oee_pct", align: "right" },
      { key: "availability_pct", align: "right" },
      { key: "downtime_hours", align: "right" },
      { key: "failure_count", align: "right" },
      ALERT_COL,
    ]);
  }

  async function cost(state) {
    const d = await api("/api/dashboard_cost", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "总生产成本", value: k.total_cost },
      { name: "单位成本", value: k.unit_cost },
      { name: "材料占比", value: k.material_pct, unit: "%" },
      { name: "人工占比", value: k.labor_pct, unit: "%" },
    ]);
    setLineChart(initChart("db-chart-cost-trend"), d.trend?.map((r) => r.snapshot_month) || [],
      [{ name: "总成本", data: d.trend?.map((r) => r.total_cost) || [] },
       { name: "单位成本", data: d.trend?.map((r) => r.unit_cost) || [] }]);
    setDonut(initChart("db-chart-cost-structure"), [
      { name: "材料", value: k.material_pct ?? 0 },
      { name: "人工", value: k.labor_pct ?? 0 },
      { name: "制造费用", value: k.overhead_pct ?? 0 },
    ], "name", "value");
    renderTable("db-table-cost-product", d.products, [
      { key: "product_name" },
      { key: "output_qty", fmt: "num", align: "right" },
      { key: "unit_cost", align: "right" },
      { key: "material_cost", fmt: "num", align: "right" },
      { key: "labor_cost", fmt: "num", align: "right" },
      { key: "overhead_cost", fmt: "num", align: "right" },
    ]);
  }

  async function supply(state) {
    const d = await api("/api/dashboard_supply", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "采购金额", value: k.purchase_amount },
      { name: "库存周转天数", value: k.inventory_turnover_days },
      { name: "供应商准时率", value: k.supplier_otd_pct, unit: "%" },
    ]);
    setBarChart(initChart("db-chart-supplier-otd"), d.suppliers?.map((r) => r.supplier_code) || [],
      [{ name: "准时率%", data: d.suppliers?.map((r) => r.otd_pct) || [] }]);
    setBarChart(initChart("db-chart-inventory"), d.suppliers?.slice(0, 8).map((r) => r.supplier_code) || [],
      [{ name: "采购额", data: d.suppliers?.slice(0, 8).map((r) => r.purchase_amount) || [] }]);
    renderTable("db-table-supplier", d.detail, [
      { key: "supplier_name" },
      { key: "otd_pct", align: "right" },
      { key: "purchase_amount", fmt: "num", align: "right" },
      { key: "turnover_days", align: "right" },
      ALERT_COL,
    ]);
  }

  async function material(state) {
    const d = await api("/api/dashboard_material", params(state));
    renderKpiGrid("db-kpi", [
      { name: "物料种类", value: d.materials?.length },
      { name: "呆滞物料", value: d.slow_moving?.length },
      { name: "预警条数", value: d.alerts?.length },
    ]);
    setBarChart(initChart("db-chart-turnover"), d.materials?.slice(0, 12).map((r) => r.material_code) || [],
      [{ name: "周转天数", data: d.materials?.slice(0, 12).map((r) => r.turnover_days) || [] }]);
    setBarChart(initChart("db-chart-consumption"), d.consumption?.map((r) => r.material_name) || [],
      [{ name: "领料金额", data: d.consumption?.map((r) => r.consume_amount) || [] }]);
    renderTable("db-table-slow", d.slow_moving, [
      { key: "material_code" }, { key: "material_name" },
      { key: "turnover_days", align: "right" },
      { key: "safety_stock", fmt: "num", align: "right" },
      ALERT_COL,
    ]);
  }

  async function labor(state) {
    const d = await api("/api/dashboard_labor", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "工时达成率", value: k.hours_achievement_pct, unit: "%" },
      { name: "人工成本", value: k.labor_cost },
      { name: "工单数", value: k.order_count },
    ]);
    setLineChart(initChart("db-chart-labor-efficiency"), d.trend?.map((r) => r.snapshot_month) || [],
      [{ name: "工时达成%", data: d.trend?.map((r) => r.hours_achievement_pct) || [] }]);
    setBarChart(initChart("db-chart-labor-line"), d.line_detail?.map((r) => r.line_name) || [],
      [{ name: "人工成本", data: d.line_detail?.map((r) => r.labor_cost) || [] }]);
    renderTable("db-table-labor-line", d.line_detail, [
      { key: "line_name" },
      { key: "actual_hours", align: "right" },
      { key: "hours_achievement_pct", align: "right" },
      { key: "labor_cost", fmt: "num", align: "right" },
    ]);
  }

  async function capacity(state) {
    const d = await api("/api/dashboard_capacity", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "产能利用率", value: k.capacity_util_pct, unit: "%" },
      { name: "产量", value: k.output_qty },
      { name: "计划量", value: k.plan_qty },
      { name: "计划达成率", value: k.plan_achieve_pct, unit: "%" },
    ]);
    setBarChart(initChart("db-chart-capacity-bar"), d.lines?.map((r) => r.line_name || r.line_code) || [],
      [{ name: "利用率%", data: d.lines?.map((r) => r.capacity_util_pct) || [] },
       { name: "负荷vs设计%", data: d.lines?.map((r) => r.load_vs_design_pct) || [] }]);
    setLineChart(initChart("db-chart-capacity-trend"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "产能利用率%", data: d.trend?.map((r) => r.capacity_util_pct) || [] }]);
    renderTable("db-table-capacity", d.lines, [
      { key: "line_name" }, { key: "factory_name" },
      { key: "output_qty", fmt: "num", align: "right" },
      { key: "design_capacity_daily", fmt: "num", align: "right" },
      { key: "capacity_util_pct", align: "right" },
      { key: "load_vs_design_pct", align: "right" },
      ALERT_COL,
    ]);
  }

  async function scrapRework(state) {
    const d = await api("/api/dashboard_scrap_rework", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "报废率", value: k.scrap_rate_pct, unit: "%" },
      { name: "返工率", value: k.rework_rate_pct, unit: "%" },
      { name: "报废数量", value: k.scrap_qty },
      { name: "返工数量", value: k.rework_qty },
    ]);
    setBarChart(initChart("db-chart-scrap-line"), d.by_line?.map((r) => r.line_name) || [],
      [{ name: "报废数", data: d.by_line?.map((r) => r.scrap_qty) || [] },
       { name: "返工数", data: d.by_line?.map((r) => r.rework_qty) || [] }]);
    setBarChart(initChart("db-chart-scrap-defect"), d.by_defect?.map((r) => r.defect_type) || [],
      [{ name: "报废数", data: d.by_defect?.map((r) => r.scrap_qty) || [] }]);
    renderTable("db-table-scrap-line", d.by_line, [
      { key: "line_name" },
      { key: "scrap_qty", fmt: "num", align: "right" },
      { key: "rework_qty", fmt: "num", align: "right" },
      { key: "scrap_rate_pct", align: "right" },
      ALERT_COL,
    ]);
  }

  async function processYield(state) {
    const d = await api("/api/dashboard_process_yield", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "工序良率", value: k.process_yield_pct, unit: "%" },
      { name: "工序不良率", value: k.process_defect_pct, unit: "%" },
      { name: "投入量", value: k.input_qty },
      { name: "合格量", value: k.good_qty },
    ]);
    setBarChart(initChart("db-chart-process-step"), d.by_step?.map((r) => r.process_step) || [],
      [{ name: "良率%", data: d.by_step?.map((r) => r.yield_pct) || [] }]);
    setBarChart(initChart("db-chart-process-line"), d.by_line?.map((r) => r.line_code) || [],
      [{ name: "良率%", data: d.by_line?.map((r) => r.yield_pct) || [] }]);
    renderTable("db-table-process-step", d.by_step, [
      { key: "process_step" },
      { key: "input_qty", fmt: "num", align: "right" },
      { key: "good_qty", fmt: "num", align: "right" },
      { key: "defect_qty", fmt: "num", align: "right" },
      { key: "yield_pct", align: "right" },
      ALERT_COL,
    ]);
  }

  async function downtime(state) {
    const d = await api("/api/dashboard_downtime", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "停机时长(小时)", value: k.downtime_hours },
      { name: "故障次数", value: k.failure_count },
      { name: "时间开动率", value: k.availability_pct, unit: "%" },
      { name: "设备数", value: k.equipment_count },
    ]);
    setDonut(initChart("db-chart-downtime-reason"), d.by_reason || [], "downtime_reason", "hours");
    setBarChart(initChart("db-chart-downtime-equip"), d.by_equip?.map((r) => r.equipment_name) || [],
      [{ name: "停机小时", data: d.by_equip?.map((r) => r.downtime_hours) || [] }]);
    renderTable("db-table-downtime", d.by_equip, [
      { key: "equipment_name" },
      { key: "downtime_hours", align: "right" },
      { key: "failure_count", align: "right" },
      { key: "oee_pct", align: "right" },
      ALERT_COL,
    ]);
  }

  async function bomVariance(state) {
    const d = await api("/api/dashboard_bom_variance", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "超领数量", value: k.variance_qty },
      { name: "超领金额", value: k.variance_amount },
      { name: "实领/应领", value: k.consume_vs_plan_pct, unit: "%" },
      { name: "领料金额", value: k.consume_amount },
    ]);
    setBarChart(initChart("db-chart-bom-material"), d.by_material?.slice(0, 10).map((r) => r.material_name) || [],
      [{ name: "超领金额", data: d.by_material?.slice(0, 10).map((r) => r.variance_amount) || [] }]);
    setBarChart(initChart("db-chart-bom-line"), d.by_line?.map((r) => r.line_code) || [],
      [{ name: "超领金额", data: d.by_line?.map((r) => r.variance_amount) || [] }]);
    renderTable("db-table-bom", d.by_material, [
      { key: "material_code" }, { key: "material_name" },
      { key: "plan_qty", align: "right" },
      { key: "actual_qty", align: "right" },
      { key: "variance_qty", align: "right" },
      { key: "variance_amount", fmt: "num", align: "right" },
      ALERT_COL,
    ]);
  }

  async function supplierScore(state) {
    const d = await api("/api/dashboard_supplier_score", params(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "加权OTD", value: k.avg_otd_pct, unit: "%" },
      { name: "采购金额", value: k.purchase_amount },
      { name: "供应商数", value: k.supplier_count },
    ]);
    setBarChart(initChart("db-chart-supplier-score"), d.detail?.map((r) => r.supplier_name) || [],
      [{ name: "综合评分", data: d.detail?.map((r) => r.score) || [] },
       { name: "OTD%", data: d.detail?.map((r) => r.otd_pct) || [] }]);
    setBarChart(initChart("db-chart-supplier-wide"), d.from_wide?.map((r) => r.supplier_name) || [],
      [{ name: "明细OTD%", data: d.from_wide?.map((r) => r.otd_pct) || [] }]);
    renderTable("db-table-supplier-score", d.detail, [
      { key: "supplier_name" }, { key: "supplier_level" },
      { key: "otd_pct", align: "right" },
      { key: "score", align: "right" },
      { key: "purchase_amount", fmt: "num", align: "right" },
      { key: "turnover_days", align: "right" },
      ALERT_COL,
    ]);
  }

  const registry = {
    production, delivery, quality, equipment, cost, supply, material, labor,
    capacity,
    "scrap-rework": scrapRework,
    "process-yield": processYield,
    downtime,
    "bom-variance": bomVariance,
    "supplier-score": supplierScore,
  };
  return {
    load(id, state) {
      const fn = registry[id];
      if (!fn) throw new Error("未知看板: " + id);
      return fn(state);
    },
  };
})();
