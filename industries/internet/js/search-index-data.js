/** 互联网通用 · 全局搜索索引（方法论 / 数仓 / 看板） */
(function () {
  const base = {
    dashboard: "../internet_dashboard.html#",
    methodology: "methodology.html",
    architecture: "architecture.html#dd-",
  };

  const dashboards = [
    ["overview", "活跃总览", "MAU DAU 活跃"],
    ["launcher", "开机活跃", "开机 只开机"],
    ["vod", "点播活跃", "VV UV 点播"],
    ["live", "直播活跃", "直播 频道"],
    ["series", "内容·剧集", "剧集 完播 题材"],
    ["episode", "内容·单集与行为", "单集 行为"],
    ["quality", "完播与QoS", "完播 卡顿 首帧"],
    ["lifecycle", "用户生命周期", "开户 激活 流失"],
    ["retention", "用户留存", "D1 D7 D30 同期群"],
    ["device", "设备流转", "STB Speaker 双端"],
    ["funnel", "商业化漏斗", "曝光 点击 确认"],
    ["order", "订购与分成", "订购 分成 MAU结算"],
    ["path", "用户行为路径", "Sankey 路径 流失"],
    ["revenue", "收入结构深度分析", "ARPU LTV 套餐"],
    ["activity", "营销活动复盘", "ROI 活动"],
    ["health", "业务健康度", "红黄绿灯 健康分"],
    ["tags", "用户标签画像", "标签 画像"],
  ];

  const tables = (window.DATA_DICTIONARY || []).map((t) => ({
    category: "table",
    title: t.name,
    subtitle: `${t.layer} · ${t.purpose || ""}`,
    keywords: `${t.name} ${t.layer} ${t.purpose} ${(t.fields || []).map((f) => f.name).join(" ")} 数仓 internet_analytics`,
    url: base.architecture + t.name,
    anchor: `dd-${t.name}`,
  }));

  const playbooks = (window.PLAYBOOKS || []).map((p) => ({
    category: "playbook",
    title: p.title,
    subtitle: p.desc,
    keywords: `${p.title} ${p.desc} ${(p.keywords || []).join(" ")} 方法论`,
    url: base.methodology,
    anchor: p.id,
  }));

  const methods = [];
  const box = window.ANALYSIS_TOOLBOX;
  (box?.categories || []).forEach((cat) => {
    (cat.methods || []).forEach((m) => {
      methods.push({
        category: "method",
        title: m.title,
        subtitle: cat.name,
        keywords: `${m.title} ${m.explain || ""} ${m.businessQuestion || ""} 分析方法`,
        url: base.methodology,
        anchor: `toolbox-${m.id}`,
      });
    });
  });

  const pages = [
    { category: "page", title: "数据展示", subtitle: "17 主题看板", keywords: "看板 数据展示 dashboard", url: "../internet_dashboard.html" },
    { category: "page", title: "分析方法论", subtitle: "六层框架", keywords: "方法论 六层 playbook", url: base.methodology },
    { category: "page", title: "数仓架构", subtitle: "OTT 雪花模型", keywords: "数仓 ODS DWD DWS ADS 架构", url: "architecture.html" },
    { category: "page", title: "导出 PDF", subtitle: "17看板报告", keywords: "PDF 报告", url: "../pdf/report.html" },
  ];

  window.SEARCH_INDEX = [
    ...pages,
    ...dashboards.map(([id, title, kw]) => ({
      category: "dashboard",
      title,
      subtitle: "主题看板",
      keywords: `${title} ${kw} 看板`,
      url: base.dashboard + id,
    })),
    ...tables,
    ...playbooks,
    ...methods,
  ];
})();
