/**

 * 第六层·分析方法工具箱 · 分类渲染 + ECharts

 */

(function () {

  "use strict";



  function esc(s) {

    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  }



  function allMethods() {

    const box = window.ANALYSIS_TOOLBOX;

    if (!box) return [];

    if (Array.isArray(box)) return box.map((m, i) => ({ ...m, _idx: i }));

    return (box.categories || []).flatMap((cat) =>

      (cat.methods || []).map((m) => ({ ...m, category: cat.name, categoryId: cat.id }))

    );

  }



  function metaBlock(label, text) {
    return `<div class="toolbox-meta-block"><dt>${esc(label)}</dt><dd>${esc(text || "—")}</dd></div>`;
  }

  function renderMethodCard(item, idx) {
    const chartId = `toolbox-chart-${idx}`;
    const alias = item.aliases ? `（${esc(item.aliases)}）` : "";
    const definition = item.definition || item.what || item.explain || "—";
    const principle = item.principle || "—";
    const applicable = item.applicable || item.when || "—";
    const purpose = item.purpose || "—";
    const steps = item.steps || item.how || "—";
    const outputs = item.outputsAndPitfalls || "—";
    const vsOther = item.vsOtherMethods || "—";
    const boundaries = item.boundaries || "—";

    return `
      <article class="toolbox-card" id="toolbox-${esc(item.id)}">
        <header class="toolbox-card-head">
          <h3>${esc(item.title)}${alias}</h3>
          <dl class="toolbox-meta">
            ${metaBlock("1. 定义与别名：", definition)}
            ${metaBlock("2. 核心思想与原理：", principle)}
            ${metaBlock("3. 适用场景与不适用场景：", applicable)}
            ${metaBlock("4. 分析目的：", purpose)}
            ${metaBlock("5. 操作步骤：", steps)}
            ${metaBlock("6. 输出物与常见误区：", outputs)}
            ${metaBlock("7. 和其他方法的区别：", vsOther)}
            ${metaBlock("8. 边界条件与失效情形：", boundaries)}
            ${metaBlock("业务问题：", item.businessQuestion || "—")}
            ${metaBlock("作品集应用示例：", item.portfolio || "—")}
          </dl>
        </header>
        <div class="toolbox-chart-body" id="${chartId}-wrap">
          <div class="toolbox-chart" id="${chartId}"></div>
        </div>
      </article>`;
  }



  function renderCategory(cat, startIdx) {

    const methods = cat.methods || [];

    const cards = methods.map((m, i) => renderMethodCard(m, startIdx + i)).join("");

    return `

      <section class="toolbox-category" id="toolbox-cat-${esc(cat.id)}">

        <header class="toolbox-category-head">

          <h3>${esc(cat.name)}</h3>

          ${cat.tagline ? `<p>${esc(cat.tagline)}</p>` : ""}

        </header>

        <div class="toolbox-grid">${cards}</div>

      </section>`;

  }



  function initChart(item, idx) {

    const wrap = document.getElementById(`toolbox-chart-${idx}-wrap`);

    const el = document.getElementById(`toolbox-chart-${idx}`);

    if (!wrap) return;

    const d = item.data || {};

    const type = item.chartType;



    if (!type || type === "none" || typeof echarts === "undefined") {

      if (el) wrap.innerHTML = `<p class="toolbox-no-chart">本方法以结构化分析为主，详见上方文字说明。</p>`;

      return;

    }



    if (type === "abc-table") {

      wrap.innerHTML = `

        <table class="toolbox-table">

          <thead><tr><th>对象</th><th>收入占比%</th><th>分类</th><th>管理策略</th></tr></thead>

          <tbody>${d.rows.map((r) => `<tr><td>${esc(r.item)}</td><td>${r.share}</td><td class="cls-${r.cls.toLowerCase()}">${r.cls}</td><td>${esc(r.policy)}</td></tr>`).join("")}</tbody>

        </table>`;

      return;

    }



    if (type === "rca-tree") {

      wrap.innerHTML = `<ol class="toolbox-rca-list">${d.nodes.map((n) => `<li>${esc(n)}</li>`).join("")}</ol>`;

      return;

    }



    if (type === "drill-table") {

      wrap.innerHTML = `

        <table class="toolbox-table">

          <thead><tr><th>下钻层级</th><th>维度值</th><th>指标</th></tr></thead>

          <tbody>${d.rows.map((r) => `<tr><td>${esc(r.level)}</td><td>${esc(r.dim)}</td><td>${esc(r.metric)}</td></tr>`).join("")}</tbody>

        </table>`;

      return;

    }



    if (type === "cohort-heatmap") {

      const header = `<tr><th>首购月</th>${d.months.map((m) => `<th>${esc(m)}</th>`).join("")}</tr>`;

      const body = d.cohorts.map((c, i) =>

        `<tr><td>${esc(c)}</td>${d.values[i].map((v) => `<td class="${v >= 40 ? "cls-a" : ""}">${v}%</td>`).join("")}</tr>`

      ).join("");

      wrap.innerHTML = `<table class="toolbox-table"><thead>${header}</thead><tbody>${body}</tbody></table>`;

      return;

    }



    if (type === "compare-table") {

      wrap.innerHTML = `

        <table class="toolbox-table">

          <thead><tr><th>指标</th><th>本期值</th><th>同比</th><th>环比</th><th>定基比(vs ${esc(d.basePeriod)})</th></tr></thead>

          <tbody><tr>

            <td>${esc(d.metric)}</td><td>${d.current.toLocaleString()} 万</td>

            <td class="cls-a">+${d.yoy}%</td><td class="cls-b">+${d.mom}%</td><td>${d.baseRatio}%</td>

          </tr></tbody>

        </table>`;

      return;

    }



    if (type === "dupont") {

      wrap.innerHTML = `

        <div class="toolbox-dupont">

          <p class="toolbox-dupont-formula">ROE ${d.roe}% = 净利率 ${d.margin}% × 周转 ${d.turnover} × 杠杆 ${d.leverage}</p>

          <p class="toolbox-dupont-drag">主要拖累：${esc(d.drag)}</p>

        </div>`;

      return;

    }



    if (!el) return;

    const ch = echarts.init(el);



    if (type === "pareto") {
      const vals = d.values || [];
      const maxBar = Math.max(...vals, 1);
      ch.setOption({
        color: ["#3b82f6", "#f472b6"],
        backgroundColor: "transparent",
        grid: { left: 52, right: 52, top: 48, bottom: 40, containLabel: false },
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "rgba(148, 163, 184, 0.35)",
          borderWidth: 1,
          textStyle: { color: "#e2e8f0", fontSize: 12 },
          axisPointer: { type: "shadow", shadowStyle: { color: "rgba(59, 130, 246, 0.08)" } },
          formatter(params) {
            const bar = params.find((p) => p.seriesType === "bar");
            const line = params.find((p) => p.seriesType === "line");
            const name = (bar || line || {}).axisValueLabel || "";
            let html = `<div style="font-weight:600;margin-bottom:4px">${name}</div>`;
            if (bar) html += `贡献：<b style="color:#93c5fd">${Number(bar.data).toLocaleString()}</b><br/>`;
            if (line) html += `累计：<b style="color:#f9a8d4">${line.data}%</b>`;
            return html;
          },
        },
        legend: {
          top: 8,
          right: 8,
          itemWidth: 12,
          itemHeight: 8,
          textStyle: { color: "#94a3b8", fontSize: 11 },
          data: [
            { name: "贡献值", icon: "roundRect" },
            { name: "累计占比", icon: "circle" },
          ],
        },
        xAxis: {
          type: "category",
          data: d.labels,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: "rgba(148,163,184,0.35)" } },
          axisLabel: { color: "#94a3b8", fontSize: 11, interval: 0 },
        },
        yAxis: [
          {
            type: "value",
            name: "贡献",
            nameTextStyle: { color: "#64748b", fontSize: 11, padding: [0, 0, 0, 8] },
            splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)", type: "dashed" } },
            axisLabel: { color: "#64748b", fontSize: 11 },
            axisLine: { show: false },
            max: Math.ceil(maxBar * 1.15),
          },
          {
            type: "value",
            name: "累计%",
            min: 0,
            max: 100,
            nameTextStyle: { color: "#64748b", fontSize: 11 },
            splitLine: { show: false },
            axisLabel: { color: "#64748b", fontSize: 11, formatter: "{value}%" },
            axisLine: { show: false },
          },
        ],
        series: [
          {
            name: "贡献值",
            type: "bar",
            data: vals,
            barMaxWidth: 36,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "#60a5fa" },
                  { offset: 1, color: "#1d4ed8" },
                ],
              },
              shadowBlur: 8,
              shadowColor: "rgba(37, 99, 235, 0.35)",
              shadowOffsetY: 4,
            },
            emphasis: {
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: "#93c5fd" },
                    { offset: 1, color: "#2563eb" },
                  ],
                },
              },
            },
          },
          {
            name: "累计占比",
            type: "line",
            yAxisIndex: 1,
            data: d.cumulative,
            smooth: 0.25,
            symbol: "circle",
            symbolSize: 9,
            showSymbol: true,
            lineStyle: { width: 3, color: "#f472b6", shadowBlur: 6, shadowColor: "rgba(244,114,182,0.45)" },
            itemStyle: {
              color: "#f9a8d4",
              borderColor: "#be185d",
              borderWidth: 2,
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(244,114,182,0.28)" },
                  { offset: 1, color: "rgba(244,114,182,0.02)" },
                ],
              },
            },
            markLine: {
              silent: true,
              symbol: "none",
              label: {
                formatter: "80% 分界",
                color: "#fbbf24",
                fontSize: 10,
                position: "insideEndTop",
              },
              lineStyle: { type: "dashed", color: "rgba(251, 191, 36, 0.85)", width: 1.5 },
              data: [{ yAxis: 80 }],
            },
          },
        ],
        animationDuration: 700,
        animationEasing: "cubicOut",
      });
    } else if (type === "bcg") {

      ch.setOption({

        tooltip: { formatter: (p) => `${p.data[2]}<br>份额${p.data[0]}% 增长${p.data[1]}%` },

        xAxis: { name: "份额%", type: "value", splitLine: { lineStyle: { type: "dashed" } } },

        yAxis: { name: "增长%", type: "value", splitLine: { lineStyle: { type: "dashed" } } },

        series: [{

          type: "scatter", symbolSize: 48,

          data: d.points.map((p) => [p.x, p.y, p.name, p.quadrant]),

          itemStyle: { color: (params) => ({ 明星: "#22c55e", 金牛: "#3b82f6", 问题: "#eab308", 瘦狗: "#94a3b8" }[params.data[3]] || "#64748b") },

          label: { show: true, formatter: (p) => p.data[2], position: "top", fontSize: 10, color: "#e2e8f0" },

        }],

      });

    } else if (type === "waterfall") {

      const vals = d.steps.map((s) => s.value);

      ch.setOption({

        tooltip: { trigger: "axis" },

        xAxis: { type: "category", data: d.steps.map((s) => s.name), axisLabel: { color: "#94a3b8" } },

        yAxis: { type: "value", name: "万元" },

        series: [{

          type: "bar",

          data: vals,

          itemStyle: {

            color: (p) => (p.dataIndex === 0 || p.dataIndex === vals.length - 1 ? "#3b82f6" : p.value >= 0 ? "#22c55e" : "#ef4444"),

          },

        }],

      });

    } else if (type === "funnel") {

      ch.setOption({

        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },

        series: [{

          type: "funnel", left: "10%", width: "80%",

          data: d.steps.map((s) => ({ name: `${s.name} ${s.rate}%`, value: s.value })),

          label: { color: "#e2e8f0" },

        }],

      });

    } else if (type === "ma" || type === "wma" || type === "es") {

      const months = d.months;

      const series = [];

      if (d.actual) series.push({ name: "实际", type: "line", data: d.actual, itemStyle: { color: "#3b82f6" } });

      if (d.ma3) series.push({ name: "3月MA", type: "line", data: d.ma3, lineStyle: { type: "dashed" }, itemStyle: { color: "#22c55e" } });

      if (d.wma3) series.push({ name: "加权MA", type: "line", data: d.wma3, itemStyle: { color: "#eab308" } });

      if (d.wma) series.push({ name: `WMA(${d.weights || ""})`, type: "line", data: d.wma, itemStyle: { color: "#eab308" } });

      if (d.es) series.push({ name: `指数平滑(α=${d.alpha || 0.3})`, type: "line", data: d.es, itemStyle: { color: "#f472b6" } });

      ch.setOption({

        tooltip: { trigger: "axis" },

        legend: { textStyle: { color: "#94a3b8" } },

        xAxis: { type: "category", data: months, axisLabel: { color: "#94a3b8", rotate: 30 } },

        yAxis: { type: "value", name: "万元" },

        series,

      });

    } else if (type === "seasonal") {

      ch.setOption({

        tooltip: { trigger: "axis" },

        xAxis: { type: "category", data: d.months },

        yAxis: { type: "value", name: "指数", min: 0.5, max: 1.4 },

        series: [{

          type: "bar", data: d.index,

          itemStyle: { color: (p) => (p.value >= 1 ? "#22c55e" : "#64748b") },

          markLine: { data: [{ yAxis: 1, name: "均值" }] },

        }],

      });

    } else if (type === "scatter") {

      ch.setOption({

        title: { text: `r = ${d.r}`, left: "center", textStyle: { color: "#94a3b8", fontSize: 12 } },

        tooltip: { trigger: "item" },

        xAxis: { name: "广告费(万)", type: "value" },

        yAxis: { name: "收入(万)", type: "value" },

        series: [{

          type: "scatter", symbolSize: 36,

          data: d.points.map((p) => [p.ad, p.revenue, p.channel]),

          label: { show: true, formatter: (p) => p.data[2], position: "top", fontSize: 10 },

          itemStyle: { color: "#8b5cf6" },

        }],

      });

    } else if (type === "roi-bar") {

      ch.setOption({

        tooltip: { trigger: "axis" },

        legend: { data: ["ROI", "行业基准"], textStyle: { color: "#94a3b8" } },

        xAxis: { type: "category", data: d.items.map((i) => i.name) },

        yAxis: { type: "value", name: "ROI" },

        series: [

          { name: "ROI", type: "bar", data: d.items.map((i) => i.roi), itemStyle: { color: "#3b82f6" } },

          { name: "行业基准", type: "line", data: d.items.map((i) => i.bench), itemStyle: { color: "#94a3b8" } },

        ],

      });

    } else if (type === "cvp") {

      ch.setOption({

        tooltip: { trigger: "axis" },

        xAxis: { type: "category", data: ["保本点", "实际收入"] },

        yAxis: { type: "value", name: "万元" },

        series: [{

          type: "bar",

          data: [d.breakEven, d.actual],

          itemStyle: { color: (p) => (p.dataIndex === 0 ? "#94a3b8" : p.value >= d.breakEven ? "#22c55e" : "#ef4444") },

          markLine: { data: [{ yAxis: d.breakEven, name: "盈亏平衡" }] },

        }],

        graphic: [{

          type: "text", left: "center", top: 20,

          style: { text: `安全边际 ${d.safetyPct}% · 固定成本 ${d.fixed}万 · 毛利率 ${d.marginPct}%`, fill: "#94a3b8", fontSize: 12 },

        }],

      });

    } else if (type === "tornado") {

      ch.setOption({

        tooltip: { trigger: "axis" },

        xAxis: { type: "value", name: "利润影响(万)" },

        yAxis: { type: "category", data: d.factors.map((f) => f.name) },

        series: [{

          type: "bar",

          data: d.factors.map((f) => f.impact),

          itemStyle: { color: (p) => (p.value >= 0 ? "#22c55e" : "#ef4444") },

        }],

      });

    } else if (type === "marginal") {

      ch.setOption({

        tooltip: { trigger: "axis" },

        xAxis: { type: "category", data: d.scenarios.map((s) => s.action), axisLabel: { rotate: 20, fontSize: 10 } },

        yAxis: { type: "value", name: "增量利润(万)" },

        series: [{

          type: "bar",

          data: d.scenarios.map((s) => s.deltaProfit),

          itemStyle: { color: (p) => (p.value >= 0 ? "#22c55e" : "#ef4444") },

        }],

      });

    }



    window.addEventListener("resize", () => ch.resize());

  }



  function render(rootId) {

    const root = document.getElementById(rootId);

    const box = window.ANALYSIS_TOOLBOX;

    if (!root || !box) return;



    let html = "";

    let methods = [];



    if (Array.isArray(box)) {

      html = `<div class="toolbox-grid">${box.map((m, i) => renderMethodCard(m, i)).join("")}</div>`;

      methods = box;

    } else {

      const lead = box.intro || box.opening;

      html = lead ? `<p class="toolbox-intro">${esc(lead)}</p>` : "";

      let idx = 0;

      html += (box.categories || []).map((cat) => {

        const block = renderCategory(cat, idx);

        idx += (cat.methods || []).length;

        return block;

      }).join("");

      methods = allMethods();

    }



    root.innerHTML = html;

    requestAnimationFrame(() => {

      methods.forEach((item, idx) => initChart(item, idx));

    });

  }



  function renderMethodDetail(rootId, methodId) {

    const root = document.getElementById(rootId);

    const box = window.ANALYSIS_TOOLBOX;

    if (!root || !box) return;

    const methods = allMethods();

    const idx = methods.findIndex((m) => m.id === methodId);

    const item = methods[idx];

    if (!item) return;

    const layerTitle = box.layerTitle || "第六层：分析方法工具箱";

    const layerQ = box.layerQuestion || "用什么方法？";

    root.innerHTML = `

      <div class="detail-inner toolbox-detail-inner">

        <header class="detail-head">

          <span class="detail-badge" style="background:#ec489922;color:#ec4899">第六层</span>

          <h2>${esc(layerTitle)} —— "${esc(layerQ)}"</h2>

          <p class="biz-q">${esc(item.category || "6 个小类 · 19 种方法")}</p>

        </header>

        <div class="toolbox-detail-body">${renderMethodCard(item, idx)}</div>

      </div>`;

    requestAnimationFrame(() => initChart(item, idx));

  }



  window.AnalysisToolboxUI = { render, renderMethodDetail, allMethods };

})();

