(function () {
  const API = location.protocol.startsWith("http") ? "" : "http://127.0.0.1:5000";

  const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 2 }));
  const monthToId = (v) => parseInt(v.replace("-", ""), 10);

  async function loadMapping() {
    const res = await fetch(API + "/api/erp/mapping");
    const json = await res.json();
    if (!json.ok) return;
    const stats = {};
    (json.data.ods_stats || []).forEach((r) => { stats[r.tbl] = r.cnt; });
    const tbody = document.querySelector("#mapping-table tbody");
    tbody.innerHTML = json.data.mapping.map((m) => {
      const cnt = stats[m.ods] != null ? stats[m.ods] : "—";
      return `<tr><td>${m.module}</td><td><code>${m.erp_table}</code></td><td><code>${m.ods}</code></td><td><code>${m.dwd}</code></td><td>${m.freq}</td><td>${cnt}</td></tr>`;
    }).join("");
  }

  function renderRecon(data) {
    const badge = document.getElementById("recon-status");
    badge.textContent = "对账状态：" + data.overall_status;
    badge.style.color = data.overall_status === "异常" ? "#f87171" : "#34d399";

    const tbody = document.querySelector("#recon-table tbody");
    tbody.innerHTML = (data.items || []).map((r) => {
      const cls = r.status === "异常" ? "row-alert" : "";
      return `<tr class="${cls}"><td>${r.reconcile_type}</td><td>${fmt(r.erp_amount)}</td><td>${fmt(r.dw_amount)}</td><td>${r.variance_rate}</td><td>${r.status}</td></tr>`;
    }).join("");

    const bar = echarts.init(document.getElementById("chart-recon-bar"));
    bar.setOption({
      title: { text: "本月对账差异率", left: "center", textStyle: { color: "#94a3b8", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: (data.items || []).map((r) => r.reconcile_type), axisLabel: { color: "#94a3b8" } },
      yAxis: { type: "value", name: "%", axisLabel: { color: "#94a3b8" } },
      series: [{
        type: "bar",
        data: (data.items || []).map((r) => ({
          value: r.variance_rate,
          itemStyle: { color: r.status === "异常" ? "#ef4444" : "#22c55e" },
        })),
      }],
      grid: { left: 48, right: 16, bottom: 32, top: 40, containLabel: true },
      backgroundColor: "transparent",
    });

    const trend = echarts.init(document.getElementById("chart-recon-trend"));
    const types = [...new Set((data.trend || []).map((r) => r.reconcile_type))];
    trend.setOption({
      title: { text: "近6个月对账差异率趋势", left: "center", textStyle: { color: "#94a3b8", fontSize: 13 } },
      tooltip: { trigger: "axis" },
      legend: { data: types, textStyle: { color: "#94a3b8" }, bottom: 0 },
      xAxis: { type: "category", data: [...new Set((data.trend || []).map((r) => r.month_id))], axisLabel: { color: "#94a3b8" } },
      yAxis: { type: "value", name: "%", axisLabel: { color: "#94a3b8" } },
      series: types.map((t) => ({
        name: t, type: "line", smooth: true,
        data: (data.trend || []).filter((r) => r.reconcile_type === t).map((r) => r.variance_rate),
      })),
      grid: { left: 48, right: 16, bottom: 48, top: 40 },
      backgroundColor: "transparent",
    });
    window.addEventListener("resize", () => { bar.resize(); trend.resize(); });
  }

  async function loadRecon() {
    const m = monthToId(document.getElementById("recon-month").value);
    const res = await fetch(API + "/api/erp/reconciliation?month=" + m);
    const json = await res.json();
    if (json.ok) renderRecon(json.data);
  }

  document.getElementById("btn-refresh-recon").addEventListener("click", loadRecon);
  document.getElementById("export-balance").addEventListener("click", function (e) {
    const m = monthToId(document.getElementById("recon-month").value);
    this.href = API + "/api/erp/export_balance?month=" + m;
  });

  loadMapping();
  loadRecon();
})();
