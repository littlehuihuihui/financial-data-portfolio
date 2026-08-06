/**
 * 制造业 · P0–P3 PDF 报告（对齐 14 主题看板 / manufacturing_analytics）
 */
(function () {
  "use strict";

  const params = new URLSearchParams(location.search);
  const MONTH = params.get("month") || "202607";
  const MONTH_LABEL = `${MONTH.slice(0, 4)}-${MONTH.slice(4, 6)}`;

  const CHART = {
    primary: "#1a5276",
    palette: ["#1a5276", "#2874a6", "#5499c7", "#e74c3c", "#f59e0b", "#2c3e50"],
    grid: "rgba(44, 62, 80, 0.12)",
    text: "#2c3e50",
  };

  let trendChart = null;
  let defectChart = null;
  let capacityChart = null;
  let costChart = null;

  function apiBase() {
    const q = params.get("api");
    if (q) return q.replace(/\/$/, "");
    if (window.API_BASE_URL) return window.API_BASE_URL.replace(/\/$/, "");
    if (location.protocol.startsWith("http") && location.port !== "8772") return location.origin;
    return "http://127.0.0.1:5002";
  }

  async function api(path) {
    const url = `${apiBase()}${path}${path.includes("?") ? "&" : "?"}month=${MONTH}`;
    const res = await fetch(url);
    let json;
    try {
      json = await res.json();
    } catch {
      throw new Error(`API ${path} 返回非 JSON（HTTP ${res.status}）`);
    }
    if (!res.ok || !json.ok) {
      throw new Error(json.error || `API ${path} failed (HTTP ${res.status})`);
    }
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
    return Number(n).toLocaleString("zh-CN", { maximumFractionDigits: digits });
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function countToolboxMethods() {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box) return 0;
    return (box.categories || []).reduce((n, c) => n + (c.methods || []).length, 0);
  }

  function renderToolboxPdf() {
    const root = document.getElementById("toolbox-pdf-root");
    const box = window.ANALYSIS_TOOLBOX;
    if (!root || !box) return;

    const total = countToolboxMethods();
    const opening =
      `<p class="toolbox-opening-pdf">分析方法工具箱是前五层分析的补充，按<strong>质量 / 设备与产能 / 成本与供应链</strong>三类组织，共 <strong>${total} 种</strong>制造业可复用方法。每种方法按教材体展开（定义/原理/适用/目的/步骤/输出与误区/方法对比/边界）；交互图表示例见 <code>../pages/methodology.html</code>。</p>`;

    const cats = (box.categories || [])
      .map((cat) => {
        const items = (cat.methods || [])
          .map(
            (m) =>
              `<div class="pdf-toolbox-item">
                <strong>${esc(m.title)}</strong>
                <p><b>1. 定义与别名：</b>${esc(m.definition || m.what || m.explain || "")}</p>
                <p><b>2. 核心思想与原理：</b>${esc(m.principle || "—")}</p>
                <p><b>3. 适用与不适用：</b>${esc(m.applicable || m.when || "—")}</p>
                <p><b>4. 分析目的：</b>${esc(m.purpose || "—")}</p>
                <p><b>5. 操作步骤：</b>${esc(m.steps || m.how || "—")}</p>
                <p><b>6. 输出物与常见误区：</b>${esc(m.outputsAndPitfalls || "—")}</p>
                <p><b>7. 和其他方法的区别：</b>${esc(m.vsOtherMethods || "—")}</p>
                <p><b>8. 边界条件与失效情形：</b>${esc(m.boundaries || "—")}</p>
                <p><b>常问什么：</b>${esc(m.businessQuestion || "—")}</p>
                <p><b>落地例子：</b>${esc(m.portfolio || "—")}</p>
              </div>`
          )
          .join("");
        return `<h3 class="pdf-toolbox-cat">${esc(cat.name)}</h3><div class="pdf-toolbox-grid">${items}</div>`;
      })
      .join("");

    root.innerHTML = opening + cats;
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
        if (c.fmt === "pct") v = v != null ? Number(v).toFixed(2) + "%" : "—";
        else if (c.fmt === "num") v = fmt(v, c.digits ?? 0);
        return `<td class="${c.align === "right" ? "num" : ""}">${v ?? "—"}</td>`;
      }).join("")}</tr>`
    ).join("");
  }

  function renderKpiRows(prod, qual, supply, equip, cost) {
    const pk = prod.kpi || {};
    const qk = qual.kpi || {};
    const sk = supply.kpi || {};
    const ek = equip.kpi || {};
    const ck = cost.kpi || {};
    const row1 = [
      { label: "产量", value: fmt(pk.output_qty, 0) },
      { label: "产能利用率(加权)", value: fmt(pk.capacity_util_pct) + "%" },
      { label: "良品率", value: fmt(pk.yield_rate_pct ?? qk.yield_rate_pct) + "%" },
      { label: "准时交付率", value: fmt(pk.on_time_delivery_pct) + "%" },
    ];
    const row2 = [
      { label: "OEE(加权)", value: fmt(ek.oee_pct) + "%" },
      { label: "单位成本", value: fmt(pk.unit_cost ?? ck.unit_cost) + " 元" },
      { label: "供应商准时率", value: fmt(sk.supplier_otd_pct) + "%" },
      { label: "库存周转天数", value: fmt(sk.inventory_turnover_days, 1) + " 天" },
      { label: "FPY(一次通过)", value: fmt(qk.first_pass_pct) + "%" },
    ];
    const card = (c) =>
      `<div class="kpi-card"><div class="kpi-card-label">${c.label}</div><div class="kpi-card-value">${c.value}</div></div>`;
    document.getElementById("kpi-row-1").innerHTML = row1.map(card).join("");
    document.getElementById("kpi-row-2").innerHTML = row2.map(card).join("");
    document.getElementById("cost-structure-hint").textContent =
      `成本结构（${MONTH_LABEL}）：材料 ${fmt(ck.material_pct)}% · 人工 ${fmt(ck.labor_pct)}% · 制造费用 ${fmt(ck.overhead_pct)}%`;
    const foot = document.getElementById("p1-footnote");
    if (foot) foot.textContent = `分析月份：${MONTH_LABEL} · 数据来源：MySQL API · manufacturing_analytics · 14 看板`;
  }

  function renderExtraKpis(delivery, scrap, process, downtime, capacity, bom, supplier, labor) {
    const card = (c) =>
      `<div class="kpi-card"><div class="kpi-card-label">${c.label}</div><div class="kpi-card-value">${c.value}</div></div>`;
    const dk = delivery.kpi || {};
    const sk = scrap.kpi || {};
    const pk = process.kpi || {};
    const tk = downtime.kpi || {};
    const ck = capacity.kpi || {};
    const bk = bom.kpi || {};
    const uk = supplier.kpi || {};
    const lk = labor.kpi || {};
    const row = [
      { label: "交付OTD", value: fmt(dk.otd_pct) + "%" },
      { label: "报废率", value: fmt(sk.scrap_rate_pct) + "%" },
      { label: "工序良率", value: fmt(pk.process_yield_pct) + "%" },
      { label: "停机小时", value: fmt(tk.downtime_hours, 1) },
      { label: "产能(加权)", value: fmt(ck.capacity_util_pct) + "%" },
      { label: "超领金额", value: fmt(bk.variance_amount) },
      { label: "供应商加权OTD", value: fmt(uk.avg_otd_pct) + "%" },
      { label: "工时达成", value: fmt(lk.hours_achievement_pct) + "%" },
    ];
    const el = document.getElementById("kpi-row-extra");
    if (el) el.innerHTML = row.map(card).join("");
    const hint = document.getElementById("extra-kpi-hint");
    if (hint) {
      const alerts = [
        sk.alert_level && `报废 ${sk.alert_level}`,
        pk.alert_level && `工序 ${pk.alert_level}`,
        tk.alert_level && `停机 ${tk.alert_level}`,
        ck.alert_level && `产能 ${ck.alert_level}`,
        bk.alert_level && `领料 ${bk.alert_level}`,
        uk.alert_level && `供应商 ${uk.alert_level}`,
      ].filter(Boolean);
      hint.textContent = `扩展看板 KPI（${MONTH_LABEL}）· alert_level：${alerts.join(" · ") || "正常"} · 实领/应领 ${fmt(bk.consume_vs_plan_pct)}%`;
    }
  }

  function mergeMonthlyTrend(prod, qual) {
    const byMonth = {};
    (prod.trend || []).forEach((r) => {
      const m = String(r.snapshot_date || "").slice(0, 7);
      if (!m) return;
      byMonth[m] = { month: m, output: r.output_qty, cap: r.capacity_util_pct };
    });
    (qual.trend || []).forEach((r) => {
      const m = String(r.snapshot_date || "").slice(0, 7);
      if (byMonth[m]) byMonth[m].yield = r.yield_rate_pct;
    });
    return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }

  function destroyCharts() {
    [trendChart, defectChart, capacityChart, costChart].forEach((c) => c?.destroy());
    trendChart = defectChart = capacityChart = costChart = null;
  }

  function renderCharts(prod, qual, defect, capacity, cost) {
    destroyCharts();
    const months = mergeMonthlyTrend(prod, qual);
    const tc = document.getElementById("trendChart");
    if (tc && months.length) {
      trendChart = new Chart(tc, {
        type: "line",
        data: {
          labels: months.map((r) => r.month),
          datasets: [
            { label: "产量", data: months.map((r) => Number(r.output) || 0), borderColor: CHART.primary, tension: 0.3, yAxisID: "y" },
            { label: "产能利用率%", data: months.map((r) => Number(r.cap) || 0), borderColor: "#2874a6", tension: 0.3, yAxisID: "y1" },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { position: "left", grid: { color: CHART.grid } },
            y1: { position: "right", grid: { drawOnChartArea: false } },
          },
        },
      });
    }

    const pareto = (defect.pareto || []).slice(0, 6);
    const dc = document.getElementById("defectChart");
    if (dc && pareto.length) {
      defectChart = new Chart(dc, {
        type: "bar",
        data: {
          labels: pareto.map((r) => r.defect_type),
          datasets: [{ label: "不良数量", data: pareto.map((r) => Number(r.defect_qty) || 0), backgroundColor: CHART.palette }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    const lines = (capacity.lines || prod.line_share || []).slice(0, 8);
    const cap = document.getElementById("capacityChart");
    if (cap && lines.length) {
      capacityChart = new Chart(cap, {
        type: "bar",
        data: {
          labels: lines.map((r) => r.line_code || r.line_name),
          datasets: [{ label: "产能利用率%", data: lines.map((r) => Number(r.capacity_util_pct) || 0), backgroundColor: CHART.primary }],
        },
        options: { indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    }

    const ck = cost.kpi || {};
    const cc = document.getElementById("costChart");
    if (cc && ck.material_pct != null) {
      costChart = new Chart(cc, {
        type: "doughnut",
        data: {
          labels: ["材料", "人工", "制造费用"],
          datasets: [{
            data: [ck.material_pct, ck.labor_pct, ck.overhead_pct].map(Number),
            backgroundColor: ["#1a5276", "#2874a6", "#5499c7"],
          }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } },
      });
    }
  }

  function fillExtendedTables(delivery, scrap, process, downtime, capacity, bom, supplier, material, labor) {
    fillTable("tbl-delivery-late", (delivery.late_orders || []).slice(0, 6), [
      { key: "order_id" }, { key: "product_name" },
      { key: "overdue_days", align: "right", fmt: "num", digits: 0 },
      { key: "alert_level" },
    ]);
    fillTable("tbl-scrap-line", (scrap.by_line || []).slice(0, 6), [
      { key: "line_name" },
      { key: "scrap_rate_pct", align: "right", fmt: "num" },
      { key: "rework_qty", align: "right", fmt: "num", digits: 0 },
      { key: "alert_level" },
    ]);
    fillTable("tbl-process-step", (process.by_step || []).slice(0, 8), [
      { key: "process_step" },
      { key: "input_qty", align: "right", fmt: "num", digits: 0 },
      { key: "yield_pct", align: "right", fmt: "num" },
      { key: "alert_level" },
    ]);
    fillTable("tbl-scrap-defect", (scrap.by_defect || []).slice(0, 6), [
      { key: "defect_type" }, { key: "severity" },
      { key: "scrap_qty", align: "right", fmt: "num", digits: 0 },
      { key: "alert_level" },
    ]);
    fillTable("tbl-downtime-reason", (downtime.by_reason || []).slice(0, 6), [
      { key: "downtime_reason" },
      { key: "hours", align: "right", fmt: "num", digits: 1 },
      { key: "failure_count", align: "right", fmt: "num", digits: 0 },
    ]);
    fillTable("tbl-downtime-equip", (downtime.by_equip || []).slice(0, 6), [
      { key: "equipment_name" },
      { key: "downtime_hours", align: "right", fmt: "num", digits: 1 },
      { key: "oee_pct", align: "right", fmt: "num" },
      { key: "alert_level" },
    ]);
    fillTable("tbl-capacity-lines", (capacity.lines || []).slice(0, 8), [
      { key: "line_name" },
      { key: "capacity_util_pct", align: "right", fmt: "num" },
      { key: "load_vs_design_pct", align: "right", fmt: "num" },
      { key: "alert_level" },
    ], "暂无产线负荷数据");
    fillTable("tbl-bom", (bom.by_material || []).slice(0, 8), [
      { key: "material_name" },
      { key: "plan_qty", align: "right", fmt: "num", digits: 1 },
      { key: "actual_qty", align: "right", fmt: "num", digits: 1 },
      { key: "variance_amount", align: "right", fmt: "num" },
      { key: "alert_level" },
    ]);
    fillTable("tbl-supplier-score", (supplier.detail || []).slice(0, 8), [
      { key: "supplier_name" }, { key: "supplier_level" },
      { key: "otd_pct", align: "right", fmt: "num" },
      { key: "score", align: "right", fmt: "num", digits: 1 },
      { key: "alert_level" },
    ]);
    const mlRows = [];
    (material.slow_moving || []).slice(0, 4).forEach((r) => {
      mlRows.push({
        obj: r.material_name || r.material_code,
        metric: "周转天",
        val: r.turnover_days,
        alert_level: r.alert_level,
      });
    });
    (labor.line_detail || []).slice(0, 4).forEach((r) => {
      mlRows.push({
        obj: r.line_name || r.line_code,
        metric: "人工成本",
        val: r.labor_cost,
        alert_level: r.alert_level || "—",
      });
    });
    fillTable("tbl-material-labor", mlRows, [
      { key: "obj" }, { key: "metric" },
      { key: "val", align: "right", fmt: "num" },
      { key: "alert_level" },
    ]);
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
    const root = document.getElementById("report-content");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    try {
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename: `制造业生产运营监控体系报告_${MONTH_LABEL}.pdf`,
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0, windowWidth: root.scrollWidth },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: [".kpi-card", ".framework-layer-pdf", ".pdf-toolbox-item", "tr", "table"] },
      }).from(root).save();
    } finally {
      restoreCanvases(backups);
      document.body.classList.remove("pdf-exporting");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  function highlightNav() {
    const map = { "page-p0": -1, "page-p1": 0, "page-p2": 1, "page-p2b": 1, "page-p2c": 1, "page-p3": 2 };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = map[entry.target.id];
          if (idx == null) return;
          document.querySelectorAll(".module-nav a, .module-nav-inline a").forEach((a) => {
            const pageIdx = map[(a.getAttribute("href") || "").replace("#", "")];
            if (idx === -1) { a.classList.remove("active"); return; }
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
    document.getElementById("btn-download-pdf")?.addEventListener("click", downloadPdf);
    document.getElementById("btn-print")?.addEventListener("click", () => window.print());
    renderToolboxPdf();
    try {
      const [prod, qual, supply, equip, cost] = await Promise.all([
        api("/api/dashboard_production"),
        api("/api/dashboard_quality"),
        api("/api/dashboard_supply"),
        api("/api/dashboard_equipment"),
        api("/api/dashboard_cost"),
      ]);
      const [
        defect, capacity, delivery, scrap, process,
        downtime, bom, supplier, material, labor,
      ] = await Promise.all([
        apiOptional("/api/dashboard_defect", {
          pareto: qual.pareto || [],
          defect_trend: qual.defect_trend || [],
          defect_category: qual.defect_category || [],
        }),
        apiOptional("/api/dashboard_capacity", {
          lines: prod.line_share || [],
          kpi: { capacity_util_pct: prod.kpi?.capacity_util_pct },
        }),
        apiOptional("/api/dashboard_delivery", { kpi: {}, late_orders: [] }),
        apiOptional("/api/dashboard_scrap_rework", { kpi: {}, by_line: [], by_defect: [] }),
        apiOptional("/api/dashboard_process_yield", { kpi: {}, by_step: [], by_line: [] }),
        apiOptional("/api/dashboard_downtime", { kpi: {}, by_reason: [], by_equip: [] }),
        apiOptional("/api/dashboard_bom_variance", { kpi: {}, by_material: [], by_line: [] }),
        apiOptional("/api/dashboard_supplier_score", { kpi: {}, detail: [] }),
        apiOptional("/api/dashboard_material", { materials: [], slow_moving: [] }),
        apiOptional("/api/dashboard_labor", { kpi: {}, line_detail: [] }),
      ]);

      window.REPORT_DATA = {
        meta: { current_month: MONTH_LABEL, industry: "manufacturing", boards: 14 },
      };

      renderKpiRows(prod, qual, supply, equip, cost);
      renderExtraKpis(delivery, scrap, process, downtime, capacity, bom, supplier, labor);
      renderCharts(prod, qual, defect, capacity, cost);

      fillTable("tbl-lines", (prod.line_share || []).slice(0, 6), [
        { key: "line_code" }, { key: "capacity_util_pct", align: "right", fmt: "num" },
        { key: "output_qty", align: "right", fmt: "num", digits: 0 },
      ]);
      fillTable("tbl-suppliers", (supply.suppliers || []).slice(0, 6), [
        { key: "supplier_code" }, { key: "otd_pct", align: "right", fmt: "num" },
        { key: "purchase_amount", align: "right", fmt: "num" },
      ]);
      fillTable("tbl-oee", (equip.oee_rank || []).slice(0, 8), [
        { key: "equipment_code" }, { key: "oee_pct", align: "right", fmt: "num" },
      ]);
      const qt = (qual.trend || []).slice(-6);
      fillTable("tbl-quality-trend", qt.map((r) => ({
        month: String(r.snapshot_date || "").slice(0, 7),
        yield: r.yield_rate_pct,
        first_pass: r.first_pass_pct,
      })), [
        { key: "month" }, { key: "yield", align: "right", fmt: "num" },
        { key: "first_pass", align: "right", fmt: "num" },
      ]);

      fillExtendedTables(delivery, scrap, process, downtime, capacity, bom, supplier, material, labor);

      const y = parseFloat(qual.kpi?.yield_rate_pct);
      if (!Number.isNaN(y) && y < 90) {
        document.getElementById("diagnosis-list")?.insertAdjacentHTML("afterbegin",
          `<li><strong>${MONTH_LABEL}</strong> 良品率 ${y}% 低于 90% 警戒线（FPY ${fmt(qual.kpi?.first_pass_pct)}%）</li>`);
      }
      const scrapRate = parseFloat(scrap.kpi?.scrap_rate_pct);
      if (!Number.isNaN(scrapRate) && scrapRate >= 1.5) {
        document.getElementById("diagnosis-list")?.insertAdjacentHTML("beforeend",
          `<li>报废率 ${scrapRate}%（${scrap.kpi?.alert_level || "—"}），建议下钻报废与返工 / 工序良率看板</li>`);
      }
      const bomPct = parseFloat(bom.kpi?.consume_vs_plan_pct);
      if (!Number.isNaN(bomPct) && bomPct > 103) {
        document.getElementById("diagnosis-list")?.insertAdjacentHTML("beforeend",
          `<li>领料实领/应领 ${bomPct}%（${bom.kpi?.alert_level || "—"}），超领金额 ${fmt(bom.kpi?.variance_amount)} 元</li>`);
      }

      highlightNav();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      window.REPORT_READY = true;
      document.dispatchEvent(new Event("reportready"));
      if (params.get("auto") === "1") setTimeout(downloadPdf, 1000);
    } catch (err) {
      document.getElementById("report-content")?.insertAdjacentHTML("afterbegin",
        `<div class="loading-msg">数据加载失败：${err.message}<br>请先启动制造业 API（端口 5002）后刷新。</div>`);
      window.REPORT_READY = true;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
