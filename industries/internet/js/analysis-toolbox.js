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
        <header class="toolbox-card-head toolbox-card-head-title">
          <h3>${esc(item.title)}${alias}</h3>
          <p class="toolbox-chart-caption">演示图表（作品集示例数据）</p>
        </header>
        <div class="toolbox-chart-body" id="${chartId}-wrap">
          <div class="toolbox-chart" id="${chartId}"></div>
        </div>
        <div class="toolbox-card-head">
          <dl class="toolbox-meta">
            ${metaBlock("1. 定义与别名：", definition)}
            ${metaBlock("2. 核心思想与原理：", principle)}
            ${metaBlock("3. 适用场景与不适用场景：", applicable)}
            ${metaBlock("4. 分析目的：", purpose)}
            ${metaBlock("5. 操作步骤：", steps)}
            ${metaBlock("6. 输出物与常见误区：", outputs)}
            ${metaBlock("7. 和其他方法的区别：", vsOther)}
            ${metaBlock("8. 边界条件与失效情形：", boundaries)}
            ${metaBlock("常问什么：", item.businessQuestion || "—")}
            ${metaBlock("落地例子（本站怎么用）：", item.portfolio || "—")}
          </dl>
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
      const heatClass = (v) => {
        if (v >= 55) return "heat-5";
        if (v >= 45) return "heat-4";
        if (v >= 35) return "heat-3";
        if (v >= 25) return "heat-2";
        return "heat-1";
      };
      const header = `<tr><th>首购月</th>${d.months.map((m) => `<th>${esc(m)}</th>`).join("")}</tr>`;
      const body = d.cohorts.map((c, i) =>
        `<tr><td>${esc(c)}</td>${d.values[i].map((v) => `<td class="heat-cell ${heatClass(v)}">${v}%</td>`).join("")}</tr>`
      ).join("");
      wrap.innerHTML = `<table class="toolbox-table toolbox-heatmap"><thead>${header}</thead><tbody>${body}</tbody></table>`;
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
      const L = d.labels || { total: "ROE", a: "净利率", b: "周转", c: "杠杆" };
      wrap.innerHTML = `
        <div class="toolbox-dupont">
          <p class="toolbox-dupont-formula">${esc(L.total)} ${d.roe}% = ${esc(L.a)} ${d.margin}% × ${esc(L.b)} ${d.turnover}${d.turnoverSuffix || ""} × ${esc(L.c)} ${d.leverage}${d.leverageSuffix || ""}</p>
          <p class="toolbox-dupont-drag">主要拖累：${esc(d.drag)}</p>
        </div>`;
      return;
    }



    if (!el) return;
    const ch = echarts.init(el);

    const tipBase = {
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderColor: "rgba(148, 163, 184, 0.35)",
      borderWidth: 1,
      textStyle: { color: "#e2e8f0", fontSize: 12 },
    };
    const splitDash = { lineStyle: { color: "rgba(148,163,184,0.12)", type: "dashed" } };
    const axisLineSoft = { lineStyle: { color: "rgba(148,163,184,0.35)" } };
    const labelMuted = { color: "#94a3b8", fontSize: 11 };
    const nameMuted = { color: "#64748b", fontSize: 11 };
    const anim = { animationDuration: 700, animationEasing: "cubicOut" };
    const gridPad = { left: 52, right: 36, top: 48, bottom: 44, containLabel: false };
    const barGrad = (c0, c1) => ({
      type: "linear", x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [{ offset: 0, color: c0 }, { offset: 1, color: c1 }],
    });
    const legendSoft = {
      top: 8, right: 8, itemWidth: 12, itemHeight: 8,
      textStyle: { color: "#94a3b8", fontSize: 11 },
    };

    if (type === "pareto") {
      const vals = d.values || [];
      const maxBar = Math.max(...vals, 1);
      ch.setOption({
        color: ["#3b82f6", "#f472b6"],
        backgroundColor: "transparent",
        grid: gridPad,
        tooltip: {
          ...tipBase,
          trigger: "axis",
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
          ...legendSoft,
          data: [
            { name: "贡献值", icon: "roundRect" },
            { name: "累计占比", icon: "circle" },
          ],
        },
        xAxis: {
          type: "category", data: d.labels, axisTick: { show: false },
          axisLine: axisLineSoft, axisLabel: { ...labelMuted, interval: 0 },
        },
        yAxis: [
          {
            type: "value", name: "贡献", nameTextStyle: { ...nameMuted, padding: [0, 0, 0, 8] },
            splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
            max: Math.ceil(maxBar * 1.15),
          },
          {
            type: "value", name: "累计%", min: 0, max: 100,
            nameTextStyle: nameMuted, splitLine: { show: false },
            axisLabel: { ...nameMuted, formatter: "{value}%" }, axisLine: { show: false },
          },
        ],
        series: [
          {
            name: "贡献值", type: "bar", data: vals, barMaxWidth: 36,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: barGrad("#60a5fa", "#1d4ed8"),
              shadowBlur: 8, shadowColor: "rgba(37, 99, 235, 0.35)", shadowOffsetY: 4,
            },
            emphasis: { itemStyle: { color: barGrad("#93c5fd", "#2563eb") } },
          },
          {
            name: "累计占比", type: "line", yAxisIndex: 1, data: d.cumulative,
            smooth: 0.25, symbol: "circle", symbolSize: 9, showSymbol: true,
            lineStyle: { width: 3, color: "#f472b6", shadowBlur: 6, shadowColor: "rgba(244,114,182,0.45)" },
            itemStyle: { color: "#f9a8d4", borderColor: "#be185d", borderWidth: 2 },
            areaStyle: {
              color: {
                type: "linear", x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: "rgba(244,114,182,0.28)" },
                  { offset: 1, color: "rgba(244,114,182,0.02)" },
                ],
              },
            },
            markLine: {
              silent: true, symbol: "none",
              label: { formatter: "80% 分界", color: "#fbbf24", fontSize: 10, position: "insideEndTop" },
              lineStyle: { type: "dashed", color: "rgba(251, 191, 36, 0.85)", width: 1.5 },
              data: [{ yAxis: 80 }],
            },
          },
        ],
        ...anim,
      });
    } else if (type === "bcg") {
      const qColor = { 明星: "#22c55e", 金牛: "#3b82f6", 问题: "#eab308", 瘦狗: "#94a3b8" };
      ch.setOption({
        backgroundColor: "transparent",
        grid: { left: 56, right: 28, top: 36, bottom: 48 },
        tooltip: {
          ...tipBase,
          formatter: (p) => {
            const [x, y, name, q] = p.data;
            return `<b>${name}</b><br/>象限：${q}<br/>份额 ${x}% · 增长 ${y}%`;
          },
        },
        xAxis: {
          name: "相对市场份额 %", nameLocation: "middle", nameGap: 28, nameTextStyle: nameMuted,
          type: "value", splitLine: splitDash, axisLabel: nameMuted, axisLine: axisLineSoft,
        },
        yAxis: {
          name: "市场增长率 %", nameTextStyle: nameMuted,
          type: "value", splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "scatter",
          symbolSize: (val) => 28 + Math.min(24, Math.abs(val[1]) * 0.6),
          data: d.points.map((p) => [p.x, p.y, p.name, p.quadrant]),
          itemStyle: {
            color: (params) => qColor[params.data[3]] || "#64748b",
            shadowBlur: 10, shadowColor: "rgba(0,0,0,0.35)", opacity: 0.92,
            borderColor: "rgba(255,255,255,0.25)", borderWidth: 1,
          },
          label: {
            show: true, formatter: (p) => p.data[2], position: "top",
            fontSize: 11, color: "#e2e8f0", distance: 6,
          },
          markLine: {
            silent: true, symbol: "none",
            lineStyle: { type: "dashed", color: "rgba(148,163,184,0.45)", width: 1 },
            data: [{ xAxis: 10 }, { yAxis: 10 }],
            label: { show: false },
          },
        }],
        ...anim,
      });
    } else if (type === "waterfall") {
      const vals = d.steps.map((s) => s.value);
      const n = vals.length;
      ch.setOption({
        backgroundColor: "transparent",
        grid: gridPad,
        tooltip: {
          ...tipBase, trigger: "axis",
          axisPointer: { type: "shadow", shadowStyle: { color: "rgba(148,163,184,0.08)" } },
          formatter: (params) => {
            const p = params[0];
            const sign = p.value >= 0 ? "+" : "";
            return `<b>${p.axisValueLabel}</b><br/>变动：<b style="color:${p.value >= 0 ? "#86efac" : "#fca5a5"}">${sign}${Number(p.value).toLocaleString()}</b> 万`;
          },
        },
        xAxis: {
          type: "category", data: d.steps.map((s) => s.name),
          axisTick: { show: false }, axisLine: axisLineSoft,
          axisLabel: { ...labelMuted, interval: 0, rotate: n > 6 ? 25 : 0 },
        },
        yAxis: {
          type: "value", name: "万元", nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "bar", data: vals, barMaxWidth: 40,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: (p) => {
              if (p.dataIndex === 0 || p.dataIndex === n - 1) return barGrad("#60a5fa", "#1d4ed8");
              return p.value >= 0 ? barGrad("#4ade80", "#15803d") : barGrad("#f87171", "#b91c1c");
            },
            shadowBlur: 8, shadowColor: "rgba(0,0,0,0.25)", shadowOffsetY: 3,
          },
          label: {
            show: true, position: "top", fontSize: 10, color: "#94a3b8",
            formatter: (p) => (p.value >= 0 ? `+${p.value}` : `${p.value}`),
          },
        }],
        ...anim,
      });
    } else if (type === "funnel") {
      const colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f472b6"];
      ch.setOption({
        backgroundColor: "transparent",
        tooltip: {
          ...tipBase, trigger: "item",
          formatter: (p) => `${p.name}<br/>规模：<b>${Number(p.value).toLocaleString()}</b>`,
        },
        series: [{
          type: "funnel", left: "8%", top: 24, bottom: 16, width: "70%",
          minSize: "18%", maxSize: "100%", sort: "descending", gap: 4,
          data: d.steps.map((s, i) => ({
            name: `${s.name} ${s.rate}%`,
            value: s.value,
            itemStyle: {
              color: colors[i % colors.length],
              borderColor: "rgba(15,23,42,0.6)", borderWidth: 2,
              shadowBlur: 8, shadowColor: "rgba(0,0,0,0.3)",
            },
          })),
          label: {
            color: "#e2e8f0", fontSize: 12, position: "inside",
            formatter: "{b}",
          },
          labelLine: { length: 16, lineStyle: { color: "rgba(148,163,184,0.4)" } },
          emphasis: { label: { fontSize: 13, fontWeight: 600 } },
        }],
        ...anim,
      });
    } else if (type === "ma" || type === "wma" || type === "es") {
      const months = d.months;
      const series = [];
      if (d.actual) {
        series.push({
          name: "实际", type: "line", data: d.actual, smooth: 0.2,
          symbol: "circle", symbolSize: 7,
          lineStyle: { width: 3, color: "#60a5fa" },
          itemStyle: { color: "#93c5fd", borderColor: "#1d4ed8", borderWidth: 2 },
          areaStyle: {
            color: {
              type: "linear", x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59,130,246,0.22)" },
                { offset: 1, color: "rgba(59,130,246,0.02)" },
              ],
            },
          },
        });
      }
      if (d.ma3) {
        series.push({
          name: "3月MA", type: "line", data: d.ma3, smooth: 0.2,
          symbol: "none",
          lineStyle: { width: 2.5, type: [6, 4], color: "#22c55e" },
          itemStyle: { color: "#22c55e" },
        });
      }
      if (d.wma3) {
        series.push({
          name: "加权MA", type: "line", data: d.wma3, smooth: 0.2,
          symbol: "diamond", symbolSize: 8,
          lineStyle: { width: 2.5, color: "#eab308" },
          itemStyle: { color: "#fbbf24", borderColor: "#a16207", borderWidth: 1 },
        });
      }
      if (d.wma) {
        series.push({
          name: `WMA(${d.weights || ""})`, type: "line", data: d.wma, smooth: 0.2,
          symbol: "diamond", symbolSize: 8,
          lineStyle: { width: 2.5, color: "#eab308" },
          itemStyle: { color: "#fbbf24", borderColor: "#a16207", borderWidth: 1 },
        });
      }
      if (d.es) {
        series.push({
          name: `指数平滑(α=${d.alpha || 0.3})`, type: "line", data: d.es, smooth: 0.25,
          symbol: "circle", symbolSize: 6,
          lineStyle: { width: 2.5, color: "#f472b6" },
          itemStyle: { color: "#f9a8d4", borderColor: "#be185d", borderWidth: 1 },
        });
      }
      ch.setOption({
        backgroundColor: "transparent",
        grid: { ...gridPad, bottom: 52 },
        tooltip: { ...tipBase, trigger: "axis", axisPointer: { type: "cross", crossStyle: { color: "#64748b" } } },
        legend: legendSoft,
        xAxis: {
          type: "category", data: months, axisTick: { show: false },
          axisLine: axisLineSoft, axisLabel: { ...labelMuted, rotate: 30 },
        },
        yAxis: {
          type: "value", name: "万元", nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series,
        ...anim,
      });
    } else if (type === "seasonal") {
      ch.setOption({
        backgroundColor: "transparent",
        grid: gridPad,
        tooltip: {
          ...tipBase, trigger: "axis",
          formatter: (params) => {
            const p = params[0];
            const tag = p.value >= 1 ? "旺季偏强" : "淡季偏弱";
            return `<b>${p.axisValueLabel}</b><br/>指数 <b>${p.value}</b>（${tag}）`;
          },
        },
        xAxis: {
          type: "category", data: d.months, axisTick: { show: false },
          axisLine: axisLineSoft, axisLabel: labelMuted,
        },
        yAxis: {
          type: "value", name: "季节指数", min: 0.5, max: 1.4,
          nameTextStyle: nameMuted, splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "bar", data: d.index, barMaxWidth: 28,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: (p) => (p.value >= 1 ? barGrad("#4ade80", "#15803d") : barGrad("#94a3b8", "#475569")),
            shadowBlur: 6, shadowColor: "rgba(0,0,0,0.2)", shadowOffsetY: 2,
          },
          markLine: {
            silent: true, symbol: "none",
            label: { formatter: "均值=1", color: "#fbbf24", fontSize: 10, position: "insideEndTop" },
            lineStyle: { type: "dashed", color: "rgba(251,191,36,0.9)", width: 1.5 },
            data: [{ yAxis: 1 }],
          },
        }],
        ...anim,
      });
    } else if (type === "scatter") {
      const xName = d.xName || "广告费(万)";
      const yName = d.yName || "收入(万)";
      ch.setOption({
        backgroundColor: "transparent",
        grid: { left: 56, right: 28, top: 44, bottom: 48 },
        title: {
          text: d.r != null ? `相关系数 r = ${d.r}` : (d.title || ""),
          left: "center", top: 8,
          textStyle: { color: "#94a3b8", fontSize: 12, fontWeight: 500 },
        },
        tooltip: {
          ...tipBase, trigger: "item",
          formatter: (p) => {
            const [x, y, name] = p.data;
            return `<b>${name}</b><br/>${xName} ${x} · ${yName} ${y}`;
          },
        },
        xAxis: {
          name: xName, nameLocation: "middle", nameGap: 28, nameTextStyle: nameMuted,
          type: "value", splitLine: splitDash, axisLabel: nameMuted, axisLine: axisLineSoft,
        },
        yAxis: {
          name: yName, nameTextStyle: nameMuted,
          type: "value", splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "scatter", symbolSize: 42,
          data: d.points.map((p) => [p.ad, p.revenue, p.channel]),
          label: {
            show: true, formatter: (p) => p.data[2], position: "top",
            fontSize: 10, color: "#e2e8f0", distance: 4,
          },
          itemStyle: {
            color: {
              type: "radial", x: 0.35, y: 0.35, r: 0.75,
              colorStops: [
                { offset: 0, color: "#c4b5fd" },
                { offset: 1, color: "#6d28d9" },
              ],
            },
            shadowBlur: 12, shadowColor: "rgba(109, 40, 217, 0.45)",
            borderColor: "rgba(255,255,255,0.3)", borderWidth: 1,
          },
          emphasis: { scale: 1.15 },
        }],
        ...anim,
      });
    } else if (type === "roi-bar") {
      const barName = d.barName || "ROI";
      const lineName = d.lineName || "行业基准";
      const yName = d.yName || "ROI";
      ch.setOption({
        backgroundColor: "transparent",
        grid: gridPad,
        tooltip: {
          ...tipBase, trigger: "axis",
          axisPointer: { type: "shadow", shadowStyle: { color: "rgba(59,130,246,0.08)" } },
        },
        legend: {
          ...legendSoft,
          data: [
            { name: barName, icon: "roundRect" },
            { name: lineName, icon: "circle" },
          ],
        },
        xAxis: {
          type: "category", data: d.items.map((i) => i.name),
          axisTick: { show: false }, axisLine: axisLineSoft, axisLabel: labelMuted,
        },
        yAxis: {
          type: "value", name: yName, nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [
          {
            name: barName, type: "bar", data: d.items.map((i) => i.roi), barMaxWidth: 36,
            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color: barGrad("#60a5fa", "#1d4ed8"),
              shadowBlur: 8, shadowColor: "rgba(37,99,235,0.3)", shadowOffsetY: 3,
            },
          },
          {
            name: lineName, type: "line", data: d.items.map((i) => i.bench),
            smooth: 0.2, symbol: "circle", symbolSize: 8,
            lineStyle: { width: 2.5, type: [5, 4], color: "#fbbf24" },
            itemStyle: { color: "#fde68a", borderColor: "#b45309", borderWidth: 2 },
          },
        ],
        ...anim,
      });
    } else if (type === "cvp") {
      ch.setOption({
        backgroundColor: "transparent",
        grid: { ...gridPad, top: 56 },
        tooltip: {
          ...tipBase, trigger: "axis",
          formatter: (params) => {
            const p = params[0];
            return `<b>${p.axisValueLabel}</b><br/>${Number(p.value).toLocaleString()} 万`;
          },
        },
        xAxis: {
          type: "category", data: ["保本点", "实际收入"],
          axisTick: { show: false }, axisLine: axisLineSoft, axisLabel: labelMuted,
        },
        yAxis: {
          type: "value", name: "万元", nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "bar", data: [d.breakEven, d.actual], barMaxWidth: 64,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: (p) => {
              if (p.dataIndex === 0) return barGrad("#94a3b8", "#475569");
              return p.value >= d.breakEven ? barGrad("#4ade80", "#15803d") : barGrad("#f87171", "#b91c1c");
            },
            shadowBlur: 10, shadowColor: "rgba(0,0,0,0.28)", shadowOffsetY: 4,
          },
          label: {
            show: true, position: "top", color: "#cbd5e1", fontSize: 12,
            formatter: (p) => Number(p.value).toLocaleString(),
          },
          markLine: {
            silent: true, symbol: "none",
            label: { formatter: "盈亏平衡", color: "#fbbf24", fontSize: 10, position: "insideEndTop" },
            lineStyle: { type: "dashed", color: "rgba(251,191,36,0.85)", width: 1.5 },
            data: [{ yAxis: d.breakEven }],
          },
        }],
        graphic: [{
          type: "text", left: "center", top: 14,
          style: {
            text: `安全边际 ${d.safetyPct}%  ·  固定成本 ${d.fixed}万  ·  毛利率 ${d.marginPct}%`,
            fill: "#94a3b8", fontSize: 12,
          },
        }],
        ...anim,
      });
    } else if (type === "tornado") {
      ch.setOption({
        backgroundColor: "transparent",
        grid: { left: 88, right: 36, top: 28, bottom: 36 },
        tooltip: {
          ...tipBase, trigger: "axis",
          axisPointer: { type: "shadow", shadowStyle: { color: "rgba(148,163,184,0.08)" } },
          formatter: (params) => {
            const p = params[0];
            const sign = p.value >= 0 ? "+" : "";
            return `<b>${p.axisValueLabel}</b><br/>利润影响：<b style="color:${p.value >= 0 ? "#86efac" : "#fca5a5"}">${sign}${p.value}</b> 万`;
          },
        },
        xAxis: {
          type: "value", name: "利润影响(万)", nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: axisLineSoft,
        },
        yAxis: {
          type: "category", data: d.factors.map((f) => f.name),
          axisTick: { show: false }, axisLine: { show: false }, axisLabel: labelMuted,
        },
        series: [{
          type: "bar", data: d.factors.map((f) => f.impact), barMaxWidth: 22,
          itemStyle: {
            borderRadius: 4,
            color: (p) => (p.value >= 0 ? barGrad("#4ade80", "#15803d") : barGrad("#f87171", "#b91c1c")),
            shadowBlur: 6, shadowColor: "rgba(0,0,0,0.25)",
          },
          label: {
            show: true, position: "right", fontSize: 10, color: "#94a3b8",
            formatter: (p) => (p.value >= 0 ? `+${p.value}` : `${p.value}`),
          },
        }],
        ...anim,
      });
    } else if (type === "marginal") {
      ch.setOption({
        backgroundColor: "transparent",
        grid: { ...gridPad, bottom: 56 },
        tooltip: {
          ...tipBase, trigger: "axis",
          formatter: (params) => {
            const p = params[0];
            const sign = p.value >= 0 ? "+" : "";
            return `<b>${p.axisValueLabel}</b><br/>增量利润：<b style="color:${p.value >= 0 ? "#86efac" : "#fca5a5"}">${sign}${p.value}</b> 万`;
          },
        },
        xAxis: {
          type: "category", data: d.scenarios.map((s) => s.action),
          axisTick: { show: false }, axisLine: axisLineSoft,
          axisLabel: { ...labelMuted, rotate: 20, fontSize: 10 },
        },
        yAxis: {
          type: "value", name: "增量利润(万)", nameTextStyle: nameMuted,
          splitLine: splitDash, axisLabel: nameMuted, axisLine: { show: false },
        },
        series: [{
          type: "bar", data: d.scenarios.map((s) => s.deltaProfit), barMaxWidth: 40,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: (p) => (p.value >= 0 ? barGrad("#4ade80", "#15803d") : barGrad("#f87171", "#b91c1c")),
            shadowBlur: 8, shadowColor: "rgba(0,0,0,0.25)", shadowOffsetY: 3,
          },
          label: {
            show: true, position: "top", fontSize: 10, color: "#94a3b8",
            formatter: (p) => (p.value >= 0 ? `+${p.value}` : `${p.value}`),
          },
        }],
        ...anim,
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

