/**
 * 全局搜索索引 · sql6 数据字典 + 13 主题看板 + 六层方法论 + 工具箱
 * 构建时机：DOMContentLoaded（确保 ANALYSIS_TOOLBOX / PLAYBOOKS 已加载）
 */
(function () {
  "use strict";

  const DASHBOARD_METRICS = {
    overview: ["净收入", "毛利率", "GMV", "退货率", "库存周转天数"],
    brand: ["品牌收入", "品类毛利率", "品牌占比"],
    channel: ["ROAS", "渠道收入", "广告费", "退货率"],
    financial: ["净利润", "资产负债表", "现金流量表"],
    dupont: ["ROE", "净利率", "资产周转", "权益乘数"],
    cashflow: ["经营现金流", "净现比"],
    tax: ["税负率"],
    inventory: ["周转天数", "库龄", "滞销SKU"],
    budget: ["达成率", "预算偏差"],
    store: ["坪效", "门店Top10"],
    "profit-quality": ["净现比"],
    cvp: ["盈亏平衡", "安全边际"],
    quality: ["质量评分", "对账"],
  };

  const DASHBOARD_FALLBACK = [
    { id: "overview", title: "经营总览", description: "8个核心KPI + 趋势 + 渠道占比 + 品牌排名 + 门店Top5" },
    { id: "brand", title: "品牌分析", description: "品牌KPI + 渠道占比 + 品类毛利率 + 趋势" },
    { id: "channel", title: "渠道分析", description: "渠道KPI + 日趋势 + 散点图 + 广告效率" },
    { id: "financial", title: "三大报表", description: "利润表 + 资产负债表 + 现金流量表 + 三表勾稽" },
    { id: "dupont", title: "杜邦分析", description: "ROE拆解 + 同比归因 + 趋势 + 品牌对比" },
    { id: "cashflow", title: "现金流分析", description: "三类型现金流 + 净现比 + 差异拆解 + 资金缺口" },
    { id: "tax", title: "税务分析", description: "税负KPI + 行业对比 + 风险预警" },
    { id: "inventory", title: "库存分析", description: "库存KPI + 库龄结构 + 周转对比 + 滞销SKU" },
    { id: "budget", title: "预算执行", description: "渠道/品牌预算达成 + 超预算预警 + 费用明细" },
    { id: "store", title: "门店分析", description: "门店KPI + Top10排名 + 健康度散点 + 异常预警" },
    { id: "profit-quality", title: "利润质量", description: "净现比 + 利润vs现金流 + 差异拆解" },
    { id: "cvp", title: "本量利分析", description: "盈亏平衡 + 安全边际 + 敏感性分析" },
    { id: "quality", title: "数据质量监控大盘", description: "DQC门禁 · 每日阻断量 · 脏数据分布 · 对账" },
  ];

  const SITE_PAGES = [
    {
      title: "数据展示",
      subtitle: "站点 · 13 主题看板 + 角色切换",
      keywords: "数据展示 看板 shell retail_dashboard dashboard",
      pathKey: "dashboard",
    },
    {
      title: "分析方法论",
      subtitle: "站点 · 六层框架 · 31 分析问题",
      keywords: "分析方法论 六层框架 五层 分析路径 playbook anomaly",
      pathKey: "anomaly",
    },
    {
      title: "数仓架构",
      subtitle: "站点 · sql6 · 数据源选型 · ERP 映射对账 · 29 对象字典",
      keywords: "数仓架构 sql6 ODS DIM DWD DWS ADS 数据字典 血缘 architecture ERP 数据源 Hive ClickHouse 选型",
      pathKey: "architecture",
    },
    {
      title: "知识图谱",
      subtitle: "站点 · 平台辐射图 · 看板/方法/数仓/指标",
      keywords: "知识图谱 辐射图 platform-graph 血缘 关系图",
      pathKey: "knowledge_graph",
    },
    {
      title: "业务数据来源（架构页）",
      subtitle: "站点 · 架构页答疑区 · ERP/POS/WMS 等",
      keywords: "ERP 数据源 ODS 对账 ods_orders ods_payment 原始数据 业务数据来源",
      pathKey: "erp",
    }
  ];

  const SQL6_HIGHLIGHTS = [
    { name: "ods_orders", layer: "ODS", purpose: "订单原始落地" },
    { name: "dwd_sales_wide", layer: "DWD", purpose: "销售宽表明细" },
    { name: "dws_sales_daily", layer: "DWS", purpose: "销售日汇总" },
    { name: "dws_sales_monthly", layer: "DWS", purpose: "销售月汇总" },
    { name: "v_overview", layer: "ADS", purpose: "经营总览视图" },
    { name: "v_dupont", layer: "ADS", purpose: "杜邦分析视图" },
    { name: "v_inventory_monitor", layer: "ADS", purpose: "库存监控视图" },
  ];

  function resolvePaths() {
    const cfg = window.SEARCH_INDEX_CONFIG || {};
    if (cfg.paths) return cfg.paths;

    const path = (location.pathname || "").replace(/\\/g, "/");
    const inPortfolioPages = /\/pages\/[^/]+\.html$/i.test(path);
    const inPortfolio = path.includes("/industries/retail/");

    if (inPortfolioPages && inPortfolio) {
      return {
        dashboard: "../retail_dashboard.html",
        architecture: "architecture.html",
        anomaly: "anomaly.html",
        knowledge_graph: "platform-graph.html",
        erp: "architecture.html#erp-datasource",
        report: "report.html",
      };
    }
    if (inPortfolio) {
      return {
        dashboard: "retail_dashboard.html",
        architecture: "pages/architecture.html",
        anomaly: "pages/anomaly.html",
        knowledge_graph: "pages/platform-graph.html",
        erp: "pages/architecture.html#erp-datasource",
        report: "pages/report.html",
      };
    }
    return {
      dashboard: "shell.html",
      architecture: "architecture.html",
      anomaly: "anomaly.html",
      knowledge_graph: "platform-graph.html",
      erp: "architecture.html#erp-datasource",
      report: "report.html",
    };
  }

  function getDashboards() {
    const cfg = window.DASHBOARD_CONFIG && window.DASHBOARD_CONFIG.dashboards;
    return (cfg && cfg.length ? cfg : DASHBOARD_FALLBACK).map((d) => ({
      id: d.id,
      title: d.title,
      metrics: DASHBOARD_METRICS[d.id] || [],
      description: d.description || d.core_content || "",
    }));
  }

  function buildIndex() {
    const paths = resolvePaths();
    const items = [];

    SITE_PAGES.forEach((p) => {
      items.push({
        category: "page",
        title: p.title,
        subtitle: p.subtitle,
        keywords: `${p.title} ${p.keywords}`,
        url: paths[p.pathKey],
        anchor: "",
      });
    });

    getDashboards().forEach((d) => {
      const dashUrl = `${paths.dashboard}#${d.id}`;
      items.push({
        category: "dashboard",
        title: d.title,
        subtitle: `看板 · ${d.metrics.join("、") || d.description}`,
        keywords: `${d.title} ${d.id} ${d.metrics.join(" ")} ${d.description} 看板 KPI`,
        url: dashUrl,
        anchor: "",
      });
      d.metrics.forEach((m) => {
        items.push({
          category: "metric",
          title: m,
          subtitle: `指标 · ${d.title}看板`,
          keywords: `${m} ${d.title} KPI 指标 ${d.id}`,
          url: dashUrl,
          anchor: "",
        });
      });
    });

    items.push({
      category: "dashboard",
      title: "报告导出（P0-P3）",
      subtitle: "看板 · PDF 完整经营监控报告",
      keywords: "报告导出 P0 P1 P2 P3 PDF report 第14个看板",
      url: paths.report,
      anchor: "",
    });

    const dictNames = new Set((window.DATA_DICTIONARY || []).map((t) => t.name));
    (window.DATA_DICTIONARY || []).forEach((t) => {
      items.push({
        category: "table",
        title: t.name,
        subtitle: `${t.layer} · ${t.purpose}`,
        keywords: `${t.name} ${t.layer} ${t.purpose} ${t.source} ${(Array.isArray(t.downstream) ? t.downstream.join(" ") : t.downstream || "")} sql6`,
        url: paths.architecture,
        anchor: `dict/${t.name}`,
      });
      (t.fields || []).forEach((f) => {
        const fk = `${t.name}.${f.name}`;
        items.push({
          category: "field",
          title: fk,
          subtitle: `${f.type} · ${f.business}`,
          keywords: `${fk} ${f.desc} ${f.business} ${t.name} ${t.layer}`,
          url: paths.architecture,
          anchor: `dict/${t.name}/${f.name}`,
          fieldKey: fk,
        });
      });
      if (t.lineage) {
        items.push({
          category: "lineage",
          title: t.name,
          subtitle: `血缘 · ${t.lineage.join(" → ")}`,
          keywords: `${t.name} 血缘 lineage ${t.lineage.join(" ")}`,
          url: paths.architecture,
          anchor: `dict/${t.name}`,
        });
      }
    });

    SQL6_HIGHLIGHTS.forEach((h) => {
      if (dictNames.has(h.name)) return;
      items.push({
        category: "table",
        title: h.name,
        subtitle: `${h.layer} · ${h.purpose}`,
        keywords: `${h.name} ${h.layer} ${h.purpose} sql6 数仓`,
        url: paths.architecture,
        anchor: `dict/${h.name}`,
      });
    });

    Object.entries(window.FIELD_LINEAGE || {}).forEach(([key, path]) => {
      items.push({
        category: "lineage",
        title: key,
        subtitle: `字段血缘 · ${path.join(" → ")}`,
        keywords: `${key} 字段血缘 ${path.join(" ")}`,
        url: paths.architecture,
        anchor: "field-lineage-panel",
        fieldKey: key,
      });
    });

    (window.LAYERS || []).forEach((layer) => {
      items.push({
        category: "playbook",
        title: layer.name,
        subtitle: `${layer.short || ""} · ${layer.question || ""}`,
        keywords: `${layer.name} ${layer.short} ${layer.question} ${(layer.categories || []).join(" ")} 方法论 六层框架`,
        url: paths.anomaly,
        anchor: "",
      });
    });

    (window.PLAYBOOKS || []).forEach((q) => {
      items.push({
        category: "playbook",
        title: q.title,
        subtitle: `${q.category || ""} · ${q.bizQuestion || q.desc || ""}`,
        keywords: `${q.title} ${q.id} ${(q.keywords || []).join(" ")} ${q.bizQuestion || ""} ${q.desc || ""} ${q.layer || ""} ${q.category || ""}`,
        url: paths.anomaly,
        anchor: q.id,
      });
    });

    const toolbox = window.ANALYSIS_TOOLBOX;
    const methods = toolbox && toolbox.categories
      ? toolbox.categories.flatMap((c) => (c.methods || []).map((m) => ({ ...m, categoryName: c.name })))
      : (Array.isArray(toolbox) ? toolbox : []);

    items.push({
      category: "method",
      title: (toolbox && toolbox.layerTitle) || "第六层：分析方法工具箱",
      subtitle: "6 小类 · 19 种分析方法",
      keywords: "第六层 工具箱 帕累托 ABC 波士顿 根因 归因 下钻 漏斗 杜邦 ROI CVP 敏感性 边际",
      url: paths.anomaly,
      anchor: methods[0] ? `toolbox-${methods[0].id}` : "",
    });

    methods.forEach((m) => {
      items.push({
        category: "method",
        title: m.title,
        subtitle: `${m.categoryName || "分析方法"} · ${m.aliases || ""}`,
        keywords: `${m.title} ${m.aliases || ""} ${m.businessQuestion || ""} ${m.portfolio || ""} ${m.id}`,
        url: paths.anomaly,
        anchor: `toolbox-${m.id}`,
      });
    });

    return items;
  }

  function initSearchIndex() {
    window.SEARCH_INDEX = buildIndex();
  }

  window.rebuildSearchIndex = initSearchIndex;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearchIndex);
  } else {
    initSearchIndex();
  }
})();
