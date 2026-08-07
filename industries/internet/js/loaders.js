/** 广东移动 OTT · 视频活跃分析看板加载 */
window.DashLoaders = (function () {
  "use strict";
  const { api, renderKpiGrid, renderTable, initChart, setLineChart, setBarChart, setDonut, fmtNum } = DashCore;

  function p(state) { return { month: state.month }; }

  async function overview(state) {
    const d = await api("/api/dashboard_overview", p(state));
    const mau = d.mau || {}, w = d.windows || [], cp = d.compose || {};
    const findW = (n) => (w.find((x) => x.name === n) || {}).users || 0;
    renderKpiGrid("db-kpi", [
      { name: "有效MAU(合计)", value: mau.total, role: "northstar", sub: "冲量时须守住留存/完播/LTV/CAC 围栏" },
      { name: "STB MAU", value: mau.stb, role: "core" },
      { name: "Speaker MAU", value: mau.speaker, role: "core" },
      { name: "本日DAU", value: findW("本日"), role: "core" },
      { name: "近30天活跃", value: findW("近30天"), role: "leading" },
    ]);
    setLineChart(initChart("db-chart-dau"), d.dau_trend?.map((r) => r.snapshot_date) || [],
      [{ name: "DAU", data: d.dau_trend?.map((r) => r.dau) || [] },
       { name: "STB", data: d.dau_trend?.map((r) => r.dau_stb) || [] },
       { name: "Speaker", data: d.dau_trend?.map((r) => r.dau_speaker) || [] }]);
    setDonut(initChart("db-chart-compose"), [
      { name: "点播活跃", value: cp.vod_active || 0 },
      { name: "直播活跃", value: cp.live_active || 0 },
      { name: "只开机", value: cp.only_launcher || 0 },
    ], "name", "value");
    const mt = d.mau_trend || [];
    const months = [...new Set(mt.map((r) => r.month_label))].sort();
    const pick = (t) => months.map((m) => (mt.find((r) => r.month_label === m && r.device_type === t) || {}).mau || 0);
    setLineChart(initChart("db-chart-mau"), months,
      [{ name: "STB", data: pick("STB") }, { name: "Speaker", data: pick("Speaker") }]);
    renderTable("db-table-window", w, [{ key: "name" }, { key: "users", fmt: "num", align: "right" }]);
  }

  async function launcher(state) {
    const d = await api("/api/dashboard_launcher", p(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "开机设备数(本月)", value: k.boot_users },
      { name: "开机次数(本月)", value: k.boot_cnt },
      { name: "只开机占比", value: k.only_launcher_pct, unit: "%" },
      { name: "在线时长(时)", value: k.online_hours },
    ]);
    setLineChart(initChart("db-chart-boot-trend"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "开机次数", data: d.trend?.map((r) => r.boot_cnt) || [] },
       { name: "开机设备数", data: d.trend?.map((r) => r.boot_users) || [] }]);
    setBarChart(initChart("db-chart-boot-type"), d.by_type?.map((r) => r.device_type) || [],
      [{ name: "开机设备数", data: d.by_type?.map((r) => r.boot_users) || [] }]);
    renderTable("db-table-window", d.windows, [
      { key: "name" }, { key: "boot_users", fmt: "num", align: "right" }, { key: "boot_cnt", fmt: "num", align: "right" }]);
  }

  async function vod(state) {
    const d = await api("/api/dashboard_vod", p(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "点播UV(本月)", value: k.uv },
      { name: "点播VV(本月)", value: k.vv },
      { name: "播放时长(时)", value: k.play_hours },
      { name: "人均VV", value: k.vv_per_uv },
      { name: "人均时长(分)", value: k.min_per_uv },
    ]);
    setLineChart(initChart("db-chart-vod-trend"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "VV", data: d.trend?.map((r) => r.vv) || [] }, { name: "UV", data: d.trend?.map((r) => r.uv) || [] }]);
    setBarChart(initChart("db-chart-vod-type"), d.by_type?.map((r) => r.device_type) || [],
      [{ name: "UV", data: d.by_type?.map((r) => r.uv) || [] }, { name: "VV", data: d.by_type?.map((r) => r.vv) || [] }]);
    renderTable("db-table-window", d.windows, [
      { key: "name" }, { key: "uv", fmt: "num", align: "right" }, { key: "vv", fmt: "num", align: "right" },
      { key: "play_hours", align: "right" }]);
  }

  async function live(state) {
    const d = await api("/api/dashboard_live", p(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "直播UV(本月)", value: k.uv }, { name: "直播时长(时)", value: k.play_hours },
      { name: "频道数", value: d.channels?.length },
    ]);
    setBarChart(initChart("db-chart-channel"), d.channels?.slice(0, 10).map((r) => r.channel_name) || [],
      [{ name: "VV", data: d.channels?.slice(0, 10).map((r) => r.vv) || [] }]);
    setDonut(initChart("db-chart-channel-cat"), d.channels || [], "channel_name", "uv");
    renderTable("db-table-channel", d.channels, [
      { key: "channel_name" }, { key: "channel_cat_name" },
      { key: "vv", fmt: "num", align: "right" }, { key: "uv", fmt: "num", align: "right" },
      { key: "play_hours", align: "right" }]);
  }

  async function series(state) {
    const d = await api("/api/dashboard_series", p(state));
    renderKpiGrid("db-kpi", [
      { name: "在播剧集数", value: d.top?.length },
      { name: "Top剧集VV", value: d.top?.[0]?.vv },
      { name: "Top剧集完播率", value: d.top?.[0]?.finish_rate, unit: "%" },
    ]);
    setDonut(initChart("db-chart-category"), d.by_category || [], "category_name", "vv");
    setBarChart(initChart("db-chart-genre"), d.by_genre?.map((r) => r.genre_name) || [],
      [{ name: "题材渗透率%", data: d.by_genre?.map((r) => r.penetration_pct) || [] }]);
    renderTable("db-table-series", d.top, [
      { key: "series_name" }, { key: "category_name" }, { key: "genre_name" },
      { key: "vv", fmt: "num", align: "right" }, { key: "uv", fmt: "num", align: "right" },
      { key: "play_hours", align: "right" }, { key: "finish_rate", align: "right" }]);
  }

  async function episode(state) {
    const d = await api("/api/dashboard_episode", p(state));
    renderKpiGrid("db-kpi", [
      { name: "在播单集数", value: d.top?.length },
      { name: "Top单集VV", value: d.top?.[0]?.vv },
    ]);
    setBarChart(initChart("db-chart-action"), d.action_dist?.map((r) => r.action) || [],
      [{ name: "行为次数", data: d.action_dist?.map((r) => r.cnt) || [] }]);
    setBarChart(initChart("db-chart-complete"), d.complete_dist?.map((r) => r.bucket) || [],
      [{ name: "播放数", data: d.complete_dist?.map((r) => r.cnt) || [] }]);
    renderTable("db-table-episode", d.top, [
      { key: "series_name" }, { key: "episode_no" }, { key: "episode_name" },
      { key: "vv", fmt: "num", align: "right" }, { key: "uv", fmt: "num", align: "right" },
      { key: "finish_cnt", fmt: "num", align: "right" }]);
  }

  async function quality() {
    const d = await api("/api/dashboard_quality");
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "平均完成度", value: k.avg_complete_rate, unit: "%" },
      { name: "完播率", value: k.finish_rate, unit: "%" },
      { name: "平均首帧(ms)", value: k.avg_first_frame_ms },
      { name: "卡顿占比", value: k.stall_rate, unit: "%" },
    ]);
    setBarChart(initChart("db-chart-qos-type"), d.by_type?.map((r) => r.device_type) || [],
      [{ name: "完成度%", data: d.by_type?.map((r) => r.avg_complete_rate) || [] },
       { name: "首帧ms", data: d.by_type?.map((r) => r.avg_first_frame_ms) || [] }]);
    renderTable("db-table-qos", d.series, [
      { key: "series_name" }, { key: "plays", fmt: "num", align: "right" },
      { key: "avg_complete_rate", align: "right" }, { key: "finish_rate", align: "right" },
      { key: "avg_first_frame_ms", align: "right" }]);
  }

  async function lifecycle(state) {
    const d = await api("/api/dashboard_lifecycle", p(state));
    const k = d.kpi || {};
    renderKpiGrid("db-kpi", [
      { name: "新增开户(本月)", value: k.new_register },
      { name: "新增激活(本月)", value: k.new_activate },
      { name: "沉默用户", value: k.silent_cnt },
      { name: "累计流失", value: k.churn_cnt },
      { name: "日均活跃", value: k.avg_active },
    ]);
    setLineChart(initChart("db-chart-lifecycle"), d.trend?.map((r) => r.snapshot_date) || [],
      [{ name: "新增开户", data: d.trend?.map((r) => r.new_register) || [] },
       { name: "新增激活", data: d.trend?.map((r) => r.new_activate) || [] },
       { name: "活跃用户", data: d.trend?.map((r) => r.active_users) || [] }]);
    setDonut(initChart("db-chart-status"), d.status || [], "user_status", "cnt");
  }

  async function retention(state) {
    const d = await api("/api/dashboard_retention", p(state));
    renderKpiGrid("db-kpi", (d.trend || []).map((r) => ({ name: `D${r.day_offset}留存`, value: r.retention_rate, unit: "%" })));
    setLineChart(initChart("db-chart-retention"), d.trend?.map((r) => `D${r.day_offset}`) || [],
      [{ name: "留存率%", data: d.trend?.map((r) => r.retention_rate) || [] }]);
    renderTable("db-table-retention", d.matrix, [
      { key: "cohort_date" }, { key: "day_offset" },
      { key: "cohort_users", fmt: "num", align: "right" }, { key: "retention_rate", align: "right" }]);
  }

  async function device(state) {
    const d = await api("/api/dashboard_device", p(state));
    const dual = d.dual || {};
    renderKpiGrid("db-kpi", [
      { name: "设备总数", value: d.type_dist?.reduce((s, r) => s + Number(r.device_cnt || 0), 0) },
      { name: "双端用户", value: dual.dual_users },
      { name: "活跃用户总数", value: dual.total_users },
    ]);
    setDonut(initChart("db-chart-devtype"), d.type_dist || [], "device_type_name", "device_cnt");
    setBarChart(initChart("db-chart-model"), d.model_dist?.map((r) => r.model_name) || [],
      [{ name: "设备数", data: d.model_dist?.map((r) => r.device_cnt) || [] }]);
    setDonut(initChart("db-chart-fw"), d.fw_dist || [], "fw_version", "device_cnt");
    renderTable("db-table-region", d.region, [
      { key: "region_name" }, { key: "active_mac", fmt: "num", align: "right" }]);
  }

  async function funnel(state) {
    const d = await api("/api/dashboard_funnel", p(state));
    const f = d.funnel || {};
    renderKpiGrid("db-kpi", [
      { name: "曝光", value: f.expose }, { name: "点击", value: f.click },
      { name: "验证", value: f.verify }, { name: "确认订购", value: f.confirm },
    ]);
    setBarChart(initChart("db-chart-funnel"), ["曝光", "点击", "验证", "确认"],
      [{ name: "人次", data: [f.expose, f.click, f.verify, f.confirm] }]);
    setBarChart(initChart("db-chart-funnel-src"), d.by_src?.map((r) => r.src_type) || [],
      [{ name: "点击→验证转化%", data: d.by_src?.map((r) => r.click2verify_pct) || [] }]);
    renderTable("db-table-funnel-src", d.by_src, [
      { key: "src_type" }, { key: "expose", fmt: "num", align: "right" }, { key: "click", fmt: "num", align: "right" },
      { key: "verify", fmt: "num", align: "right" }, { key: "confirm", fmt: "num", align: "right" },
      { key: "click2verify_pct", align: "right" }]);
  }

  async function order(state) {
    const d = await api("/api/dashboard_order", p(state));
    const k = d.kpi || {}, ms = d.mau_settle || {};
    renderKpiGrid("db-kpi", [
      { name: "订购数(本月)", value: k.order_cnt },
      { name: "退订数(本月)", value: k.unsub_cnt },
      { name: "CP分成(演示30%)", value: k.revenue_share },
      { name: "MAU结算收入(演示·元)", value: ms.revenue },
    ]);
    setBarChart(initChart("db-chart-paytype"), d.by_paytype?.map((r) => r.pay_type) || [],
      [{ name: "订购数", data: d.by_paytype?.map((r) => r.order_cnt) || [] },
       { name: "分成", data: d.by_paytype?.map((r) => r.revenue_share) || [] }]);
    setDonut(initChart("db-chart-ordersrc"), d.by_src || [], "src_type", "order_cnt");
    renderTable("db-table-paytype", d.by_paytype, [
      { key: "pay_type" }, { key: "order_cnt", fmt: "num", align: "right" },
      { key: "unsub_cnt", fmt: "num", align: "right" }, { key: "order_amount", fmt: "num", align: "right" },
      { key: "revenue_share", fmt: "num", align: "right" }]);
  }

  // ==================== 13 用户行为路径 ====================
  async function path(state) {
    const d = await api("/api/dashboard_path", p(state));
    const ov = d.overview || [];
    const drop = d.drop_off || [];
    const totalTrans = ov.reduce((s, r) => s + (Number(r.trans_cnt) || 0), 0);
    renderKpiGrid("db-kpi", [
      { name: "路径转移总次数", value: totalTrans },
      { name: "页面转移对数", value: ov.length, sub: ov.length ? "Top1: " + ov[0].prev_page + "→" + ov[0].next_page : "" },
      { name: "最大流失页面", value: drop.length ? drop[0].sess_cnt : 0, sub: drop.length ? drop[0].prev_page : "—" },
    ]);
    renderTable("db-table-path", ov, [
      { key: "prev_page" }, { key: "next_page" }, { key: "product_line" },
      { key: "user_cnt", fmt: "num" }, { key: "trans_cnt", fmt: "num" }, { key: "sess_cnt", fmt: "num" },
    ]);
    renderTable("db-table-drop", drop, [
      { key: "prev_page" }, { key: "user_cnt", fmt: "num" }, { key: "sess_cnt", fmt: "num" },
    ]);
    try {
      const chart1 = initChart("db-chart-sankey");
      if (chart1 && ov.length) {
        const nameSet = new Set();
        const linkMap = {};
        ov.forEach((r) => {
          const src = r.prev_page || "未知";
          const tgt = r.next_page || "未知";
          if (src === tgt) return;
          nameSet.add(src);
          nameSet.add(tgt);
          const k = src + "\0" + tgt;
          linkMap[k] = (linkMap[k] || 0) + (Number(r.trans_cnt) || 0);
        });
        const nodes = [...nameSet].map((name) => ({ name }));
        const links = Object.entries(linkMap)
          .map(([k, value]) => {
            const [source, target] = k.split("\0");
            return { source, target, value };
          })
          .filter((l) => l.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 40);
        chart1.setOption({
          tooltip: {
            trigger: "item",
            formatter(p) {
              if (p.dataType === "edge") return `${p.data.source} → ${p.data.target}<br/>转移 ${fmtNum(p.data.value)}`;
              return `${p.name}`;
            },
          },
          series: [{
            type: "sankey",
            emphasis: { focus: "adjacency" },
            nodeAlign: "justify",
            nodeGap: 12,
            layoutIterations: 32,
            data: nodes,
            links,
            lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.45 },
            itemStyle: { borderWidth: 0 },
            label: { color: "#e8edf5", fontSize: 11 },
          }],
        });
      }
    } catch (e) { console.warn("sankey chart error:", e); }
    try {
      const chart2 = initChart("db-chart-path-bar");
      if (chart2 && ov.length) {
        const top = [...ov].sort((a, b) => (Number(b.trans_cnt) || 0) - (Number(a.trans_cnt) || 0)).slice(0, 15).reverse();
        chart2.setOption({
          tooltip: { trigger: "axis" },
          grid: { left: 12, right: 48, bottom: 20, top: 10, containLabel: true },
          xAxis: { type: "value", axisLabel: { color: "#8b95a8" } },
          yAxis: {
            type: "category",
            data: top.map((r) => `${r.prev_page} → ${r.next_page}`),
            axisLabel: { color: "#8b95a8", width: 140, overflow: "truncate" },
          },
          series: [{
            type: "bar",
            data: top.map((r) => Number(r.trans_cnt) || 0),
            itemStyle: { color: "#8e44ad" },
            label: { show: true, position: "right", color: "#e8edf5", formatter: (p) => fmtNum(p.value) },
          }],
        });
      }
    } catch (e) { console.warn("path-bar chart error:", e); }
    try {
      const chart3 = initChart("db-chart-dropoff");
      if (chart3 && drop.length) {
        const rows = [...drop].reverse();
        chart3.setOption({
          tooltip: { trigger: "axis" },
          grid: { left: 12, right: 48, bottom: 20, top: 10, containLabel: true },
          xAxis: { type: "value", name: "会话数", axisLabel: { color: "#8b95a8" } },
          yAxis: { type: "category", data: rows.map((r) => r.prev_page), axisLabel: { color: "#8b95a8" } },
          series: [{
            type: "bar",
            data: rows.map((r) => Number(r.sess_cnt) || 0),
            itemStyle: { color: "#e74c3c" },
            label: { show: true, position: "right", color: "#e8edf5", formatter: (p) => fmtNum(p.value) },
          }],
        });
      }
    } catch (e) { console.warn("drop-off chart error:", e); }
  }

  // ==================== 14 收入结构深度分析 ====================
  async function revenue(state) {
    const d = await api("/api/dashboard_revenue", p(state));
    const struc = d.structure || [];
    const plans = d.plan_analysis || [];
    const arpu = d.arpu_trend || [];
    const totalAmt = struc.reduce((s,r)=>s+(r.order_amount||0),0);
    const totalOrders = struc.reduce((s,r)=>s+(r.order_cnt||0),0);
    renderKpiGrid("db-kpi", [
      {name:'月订购总金额', value: totalAmt},
      {name:'月总订单', value: totalOrders},
      {name:'套餐种类', value: plans.length},
      {name:'平均客单价', value: totalAmt/totalOrders||0},
    ]);
    // Pie
    const c1 = initChart('db-chart-plan-struct');
    if(c1 && plans.length){
      c1.setOption({
        tooltip:{trigger:'item', formatter:'{b}: ¥{c} ({d}%)'},
        series:[{type:'pie', radius:['30%','60%'],
          data:plans.map(r=>({name:r.plan_type,value:r.order_amount})),
          label:{formatter:'{b}\n{d}%'}}]
      });
    }
    // Unsub bar
    const c4 = initChart('db-chart-unsub');
    if(c4 && plans.length){
      c4.setOption({
        tooltip:{trigger:'axis'}, grid:{left:50,right:20,bottom:30,top:10,containLabel:true},
        xAxis:{type:'category', data:plans.map(r=>r.plan_type)},
        yAxis:{type:'value', name:'%', max:100},
        series:[
          {type:'bar', name:'退订率', data:plans.map(r=>r.unsub_rate), itemStyle:{color:'#e74c3c'}},
          {type:'bar', name:'续费率', data:plans.map(r=>Math.max(0,100-(r.unsub_rate||0))), itemStyle:{color:'#27ae60'}}
        ]
      });
    }
    // ARPU trend
    const c3 = initChart('db-chart-arpu');
    if(c3 && arpu.length){
      const recent=arpu.slice(-12);
      const months=recent.map(r=>r.snapshot_month);
      c3.setOption({
        tooltip:{trigger:'axis'}, legend:{data:['ARPU','ARPPU'],textStyle:{color:'#e8edf5'}},
        grid:{left:60,right:20,bottom:30,top:30,containLabel:true},
        xAxis:{type:'category', data:months}, yAxis:{type:'value', name:'元'},
        series:[
          {type:'line', name:'ARPU', data:recent.map(r=>r.arpu||0), smooth:true, symbol:'circle'},
          {type:'line', name:'ARPPU', data:recent.map(r=>r.arppu||0), smooth:true, symbol:'diamond'}
        ]
      });
    }
    renderTable('db-table-plan', plans,
      [{key:'plan_type'},{key:'order_cnt',fmt:'num'},{key:'unsub_cnt',fmt:'num'},{key:'order_amount',fmt:'num'},{key:'revenue_share',fmt:'num'},{key:'new_user_cnt',fmt:'num'},{key:'renewal_cnt',fmt:'num'},{key:'unsub_rate'},{key:'avg_order_price',fmt:'num'}]);
    renderTable('db-table-arpu', arpu.slice(-12),
      [{key:'snapshot_month'},{key:'arppu',fmt:'num'},{key:'total_active_users',fmt:'num'},{key:'arpu',fmt:'num'}]);
  }

  // ==================== 15 营销活动复盘 ====================
  async function activity(state) {
    const d = await api('/api/dashboard_activity');
    const acts = d.activities || [];
    if(!acts.length) { renderKpiGrid('db-kpi',[{name:'暂无数据',value:'—'}]); return; }
    const totalReach = acts.reduce((s,r)=>s+(r.total_reach_users||0),0);
    const totalOrders = acts.reduce((s,r)=>s+(r.total_orders||0),0);
    renderKpiGrid('db-kpi', [
      {name:'活动总数', value: acts.length},
      {name:'累计触达', value: totalReach},
      {name:'累计订单', value: totalOrders},
    ]);
    const c1 = initChart('db-chart-activity-roi');
    if(c1){
      c1.setOption({
        tooltip:{trigger:'axis'}, grid:{left:120,right:20,bottom:30,top:10,containLabel:true},
        xAxis:{type:'value', name:'ROI'}, yAxis:{type:'category', data:acts.map(r=>r.activity_name)},
        series:[{type:'bar', data:acts.map(r=>r.roi_ratio||0),
          itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:'#e74c3c'},{offset:1,color:'#27ae60'}])},
          label:{show:true, position:'right', formatter:function(p){return p.value.toFixed(2);}}}]
      });
    }
    const c2 = initChart('db-chart-activity-type');
    if(c2){
      const typeMap={};
      acts.forEach(r=>{typeMap[r.activity_type]=(typeMap[r.activity_type]||0)+1;});
      const data=Object.entries(typeMap).map(([k,v])=>({name:k,value:v}));
      c2.setOption({
        tooltip:{trigger:'item', formatter:'{b}: {c}个 ({d}%)'},
        series:[{type:'pie', radius:['30%','60%'], data:data, label:{formatter:'{b}\n{d}%'}}]
      });
    }
    renderTable('db-table-activity', acts,
      [{key:'activity_name'},{key:'activity_type'},{key:'start_date'},{key:'end_date'},
       {key:'budget_amount',fmt:'num'},{key:'total_reach_users',fmt:'num'},{key:'total_participate_users',fmt:'num'},
       {key:'total_orders',fmt:'num'},{key:'total_order_amount',fmt:'num'},{key:'total_revenue_share',fmt:'num'},
       {key:'roi_ratio'},{key:'participate_rate_pct'}]);
  }

  // ==================== 16 业务健康度仪表盘 ====================
  async function health(state) {
    const d = await api('/api/dashboard_health');
    const metrics = d.metrics || [];
    const summary = d.summary || [];
    if(!metrics.length) { renderKpiGrid('db-kpi',[{name:'暂无数据',value:'—'}]); return; }
    const greenCnt = metrics.filter(r=>r.status==='green').length;
    const yellowCnt = metrics.filter(r=>r.status==='yellow').length;
    const redCnt = metrics.filter(r=>r.status==='red').length;
    const total = metrics.length;
    renderKpiGrid('db-kpi', [
      {name:'综合健康分', value: total ? Math.round(greenCnt/total*100) : 0, unit:'%', sub:'OK '+greenCnt+' / WARN '+yellowCnt+' / ALERT '+redCnt},
      {name:'正常指标', value: greenCnt, sub:'/'+total},
      {name:'需关注', value: yellowCnt+redCnt},
    ]);
    const c1 = initChart('db-chart-health-score');
    if(c1 && summary.length){
      c1.setOption({
        tooltip:{trigger:'axis'}, grid:{left:80,right:20,bottom:30,top:10,containLabel:true},
        xAxis:{type:'value', max:100, name:'健康分%'}, yAxis:{type:'category', data:summary.map(r=>r.metric_group)},
        series:[{type:'bar', data:summary.map(r=>r.health_score_pct||0),
          itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[
            {offset:0,color:'#e74c3c'},{offset:0.5,color:'#f39c12'},{offset:1,color:'#27ae60'}])},
          label:{show:true, position:'right', formatter:function(p){return p.value+'%';}}}]
      });
    }
    const c2 = initChart('db-chart-health-status');
    if(c2){
      c2.setOption({
        tooltip:{trigger:'item', formatter:'{b}: {c}个 ({d}%)'},
        series:[{type:'pie', radius:['30%','60%'], data:[
          {name:'OK 正常',value:greenCnt, itemStyle:{color:'#27ae60'}},
          {name:'WARN 关注',value:yellowCnt, itemStyle:{color:'#f39c12'}},
          {name:'ALERT 告警',value:redCnt, itemStyle:{color:'#e74c3c'}}
        ], label:{formatter:'{b}\n{d}%'}}]
      });
    }
    renderTable('db-table-health', metrics,
      [{key:'metric_group'},{key:'metric_name'},{key:'metric_value',fmt:'num'},{key:'metric_unit'},
       {key:'baseline_value',fmt:'num'},{key:'status_icon'}]);
    renderTable('db-table-hsum', summary,
      [{key:'metric_group'},{key:'metric_count',fmt:'num'},{key:'green_count',fmt:'num'},{key:'yellow_count',fmt:'num'},{key:'red_count',fmt:'num'},{key:'health_score_pct'}]);
  }

  // ==================== 17 用户标签画像 ====================
  async function tags(state) {
    const d = await api("/api/dashboard_tags");
    const ov = d.overview || [];
    const byCat = d.by_category || [];
    if (!ov.length) { renderKpiGrid("db-kpi", [{ name: "暂无数据", value: "—" }]); return; }
    const totalUsers = ov.reduce((s, r) => s + (Number(r.user_count) || 0), 0);
    const catCount = [...new Set(ov.map((r) => r.tag_category).filter(Boolean))].length;
    const tagCodes = [...new Set(ov.map((r) => r.tag_code).filter(Boolean))].length;
    renderKpiGrid("db-kpi", [
      { name: "标签取值数", value: ov.length },
      { name: "标签维度", value: tagCodes, sub: catCount + " 个分类" },
      { name: "标签覆盖人次", value: totalUsers },
    ]);
    const c1 = initChart("db-chart-tag-category");
    if (c1) {
      const catMap = {};
      ov.forEach((r) => {
        const cat = r.tag_category || "未分类";
        catMap[cat] = (catMap[cat] || 0) + (Number(r.user_count) || 0);
      });
      const data = Object.entries(catMap).map(([name, value]) => ({ name, value }));
      c1.setOption({
        color: DashCore.THEME.palette,
        tooltip: { trigger: "item", formatter: "{b}: {c}人次 ({d}%)" },
        legend: { bottom: 0, textStyle: { color: "#8b95a8", fontSize: 11 } },
        series: [{
          type: "pie",
          radius: ["34%", "58%"],
          center: ["50%", "44%"],
          data,
          label: { show: false },
          avoidLabelOverlap: true,
        }],
      });
    }
    const c2 = initChart("db-chart-tag-coverage");
    if (c2) {
      const src = (byCat.length ? byCat : ov)
        .slice()
        .sort((a, b) => (Number(b.user_count) || 0) - (Number(a.user_count) || 0))
        .slice(0, 12)
        .reverse();
      c2.setOption({
        tooltip: {
          trigger: "axis",
          formatter(params) {
            const p = params[0];
            const row = src[p.dataIndex];
            if (!row) return "";
            return `${row.tag_category} · ${row.tag_name}<br/>${row.tag_value}: ${fmtNum(row.user_count)}`;
          },
        },
        grid: { left: 12, right: 56, bottom: 20, top: 10, containLabel: true },
        xAxis: { type: "value", name: "覆盖用户", axisLabel: { color: "#8b95a8" } },
        yAxis: {
          type: "category",
          data: src.map((r) => `${r.tag_name}=${r.tag_value}`),
          axisLabel: { color: "#8b95a8", width: 120, overflow: "truncate" },
        },
        series: [{
          type: "bar",
          data: src.map((r) => Number(r.user_count) || 0),
          itemStyle: { color: "#8e44ad" },
          label: { show: true, position: "right", color: "#e8edf5", formatter: (p) => fmtNum(p.value) },
        }],
      });
    }
    renderTable("db-table-tags", ov, [
      { key: "tag_category" }, { key: "tag_code" }, { key: "tag_name" },
      { key: "user_count", fmt: "num" }, { key: "tag_value" }, { key: "tag_source" },
    ]);
    renderTable("db-table-tag-cat", byCat, [
      { key: "tag_category" }, { key: "tag_code" }, { key: "tag_name" }, { key: "tag_type" },
      { key: "tag_value" }, { key: "user_count", fmt: "num" }, { key: "category_share_pct", fmt: "pct" },
    ]);
  }

  const registry = { overview, launcher, vod, live, series, episode, quality, lifecycle, retention, device, funnel, order, path, revenue, activity, health, tags };
  return {
    load(id, state) {
      const fn = registry[id];
      if (!fn) throw new Error("未知看板: " + id);
      return fn(state);
    },
  };
})();