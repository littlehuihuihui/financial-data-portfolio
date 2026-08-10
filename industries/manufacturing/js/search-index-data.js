/** 制造业 · 全局搜索索引 */
(function () {
  const base = {
    dashboard: "../manufacturing_dashboard.html#",
    methodology: "methodology.html",
    architecture: "architecture.html",
  };
  const dashboards = [
    ["production","生产总览","产量 产能 交付"],["delivery","交付分析","准时交付 OTD"],
    ["quality","质量分析","良品率 FPY"],["scrap-rework","报废与返工","报废率"],
    ["process-yield","工序良率","工序"],["equipment","设备OEE","OEE 故障"],
    ["downtime","停机损失","停机"],["capacity","产能负荷","瓶颈 加权"],
    ["cost","成本分析","单位成本"],["supply","供应链分析","采购 供应商"],
    ["supplier-score","供应商评分","OTD 加权"],["material","物料周转","库存"],
    ["bom-variance","领料差异","BOM"],["labor","人工效率","工时"],
  ];
  window.SEARCH_INDEX = [
    { category: "page", title: "数据展示", subtitle: "14主题看板", keywords: "看板", url: "../manufacturing_dashboard.html" },
    { category: "page", title: "分析方法论", subtitle: "六层框架", keywords: "方法论", url: "methodology.html" },
    { category: "page", title: "数仓架构", subtitle: "31对象", keywords: "数仓 ODS ADS", url: "architecture.html" },
    ...dashboards.map(([id,t,kw]) => ({ category: "dashboard", title: t, subtitle: "制造业看板", keywords: `${t} ${kw}`, url: base.dashboard + id })),
    ...(window.DATA_DICTIONARY || []).map((t) => ({
      category: "table",
      title: t.name,
      subtitle: t.layer,
      keywords: `${t.name} ${t.layer} 数仓`,
      url: base.architecture,
      anchor: `dict/${t.name}`,
    })),
    ...(window.PLAYBOOKS || []).map((p) => ({ category: "playbook", title: p.title, subtitle: p.desc, keywords: `${p.title} ${(p.keywords||[]).join(' ')}`, url: base.methodology, anchor: p.id })),
  ];
})();
