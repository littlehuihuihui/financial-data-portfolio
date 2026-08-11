/**
 * 数据字典 · Master-Detail Core（三行业共用）
 * 路径：portfolio/js/data-dictionary-core.js
 * 行业页请引用本文件；各 industry/js/data-dictionary.js 仅为薄封装。
 */

(function () {
  "use strict";

  const LAYER_ORDER = ["ODS", "DIM", "DWD", "DWS", "ADS", "APP"];
  const LAYER_LABELS = {
    ODS: "ODS", DIM: "DIM", DWD: "DWD", DWS: "DWS", ADS: "ADS", APP: "应用层",
  };
  function layerColor(layer) {
    try {
      const key = `--layer-${String(layer || "").toLowerCase()}`;
      const v = getComputedStyle(document.documentElement).getPropertyValue(key).trim();
      if (v) return v;
    } catch (_) { /* ignore */ }
    return ({
      ODS: "#64748b", DIM: "#6366f1", DWD: "#14b8a6", DWS: "#f59e0b", ADS: "#8b5cf6", APP: "#f472b6",
    })[layer] || "#6b7280";
  }

  function tableNameCn(t) {
    if (!t) return "";
    return String(t.name_cn || t.title_cn || t.cn_name || "").trim();
  }

  /** 展示名：英文表名 + 中文名 */
  function tableDisplayName(t) {
    if (!t) return "";
    if (t.isApp) return t.title || t.name || "";
    const cn = tableNameCn(t);
    if (cn && cn !== t.name) return `${t.name}（${cn}）`;
    return t.name || "";
  }

  function fieldNameCn(f) {
    if (!f) return "";
    const cn = String(f.name_cn || f.cn_name || f.label_cn || "").trim();
    if (cn) return cn;
    const biz = String(f.business || f.desc || "").trim();
    // 业务含义已是中文时，作为中文名展示
    if (biz && /[\u4e00-\u9fff]/.test(biz) && biz !== f.name) return biz;
    return "";
  }

  /** 当前行业架构数据（用于血缘跳转） */
  function currentArchIndustry() {
    const key = document.body?.dataset?.industry || window.DATA_DICTIONARY_INDUSTRY || "retail";
    const data = window.DW_ARCHITECTURE_DATA || {};
    return data[key] || data.retail || data.manufacturing || data.internet || null;
  }

  /** 拼出血缘链：上游 → 本表 → 下游（优先表自带 lineage，再合并架构 flows） */
  function resolveLineageChain(table) {
    if (!table || table.isApp) return [];
    const name = table.name;
    const raw = (table.lineage || []).filter((n) => n && n !== "Web看板");
    if (raw.length > 1) return raw;

    const industry = currentArchIndustry();
    const flows = industry?.flows || [];
    const upstream = [];
    const downstream = [];
    flows.forEach((f) => {
      if (f.to === name && f.from && !upstream.includes(f.from)) upstream.push(f.from);
      if (f.from === name && f.to && !downstream.includes(f.to)) downstream.push(f.to);
    });
    (table.downstream || []).forEach((d) => {
      if (d && d !== "Web看板" && !downstream.includes(d)) downstream.push(d);
    });
    const chain = [...upstream, name, ...downstream.filter((d) => d !== name)];
    const seen = new Set();
    const uniq = chain.filter((x) => x && !seen.has(x) && seen.add(x));
    if (uniq.length > 1) return uniq;
    if (raw.length) return raw;
    return [name];
  }

  function findTableLoose(tables, appTables, raw) {
    const key = String(raw || "").trim();
    if (!key) return null;
    const lower = key.toLowerCase();
    const pool = [...(tables || []), ...(appTables || [])];
    let hit = pool.find((t) => t.name === key);
    if (hit) return hit;
    hit = pool.find((t) => String(t.name).toLowerCase() === lower);
    if (hit) return hit;
    hit = pool.find((t) => tableNameCn(t) === key || String(t.purpose || "") === key);
    if (hit) return hit;
    hit = pool.find((t) => {
      const cn = tableNameCn(t);
      const purpose = String(t.purpose || t.summary || "");
      return (cn && (cn.includes(key) || key.includes(cn)))
        || (purpose && purpose.includes(key));
    });
    return hit || null;
  }

  function tableSummary(t) {
    if (!t) return "";
    const base = String(t.summary || t.purpose || t.description || "").trim();
    if (t.isApp) return base;
    const bits = [];
    if (base) bits.push(base);
    if (t.source && t.source !== "-") bits.push("来源 " + t.source);
    const down = t.downstream || [];
    if (down.length) bits.push("下游 " + down.slice(0, 3).join("、") + (down.length > 3 ? "…" : ""));
    const dash = (t.used_by_dashboards || []).map(d => d.title || d.id).filter(Boolean);
    if (dash.length) bits.push("支撑看板 " + dash.slice(0, 3).join("、") + (dash.length > 3 ? "…" : ""));
    return bits.join(" · ") || base;
  }

  /** 全文检索：表名 / 用途 / 字段名 / 业务含义 / 口径 / 看板 */
  function matchFullText(table, kw) {
    if (!kw) return true;
    const blob = [
      table.name, tableNameCn(table), table.layer, table.type, table.purpose, table.summary, table.source,
      table.title, table.api, table.description,
      ...(table.lineage || []),
      ...(table.downstream || []),
      ...((table.used_by_dashboards || []).map(d => [d.title, d.id, d.description].filter(Boolean).join(" "))),
      ...((table.fields || []).flatMap(f => [f.name, f.name_cn, f.type, f.role, f.desc, f.business, f.technical, f.caliber_id])),
      ...((table.adsViews || []).map(v => v.name || v)),
    ].filter(Boolean).join(" ").toLowerCase();
    return blob.includes(kw);
  }

  function buildAppLayerItems() {
    const dashCfg = window.INDUSTRY_DASHBOARDS || [];
    const adsTables = (window.DATA_DICTIONARY || []).filter(t => t.layer === "ADS");
    return dashCfg.map(d => {
      const views = adsTables.filter(t =>
        (t.used_by_dashboards || []).some(x => (x.id || x) === d.id)
      );
      return {
        name: `app:${d.id}`,
        layer: "APP",
        type: "dashboard",
        isApp: true,
        title: d.title || d.id,
        purpose: d.description || "主题看板",
        summary: d.description || "主题看板",
        api: d.api || "",
        href: d.href || "#",
        field_count: 0,
        fields: [],
        adsViews: views.map(v => ({ name: v.name, purpose: v.purpose })),
        used_by_dashboards: [{ id: d.id, title: d.title, href: d.href }],
      };
    });
  }

  const ROLE_LABELS = {
    pk: "主键", bk: "业务键", dim_key: "维度键", measure: "度量",
    audit: "审计", attr: "属性", status: "状态", hierarchy: "层级",
  };

  const ROLE_COLORS = {
    pk: "#ef4444",
    bk: "#f59e0b",
    dim_key: "#3b82f6",
    measure: "#10b981",
    audit: "#6b7280",
    attr: "#8b5cf6",
    status: "#ec4899",
    hierarchy: "#06b6d4"
  };

  function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function buildLayerTree(tables) {
    const map = {};
    LAYER_ORDER.forEach(l => map[l] = []);
    tables.forEach(t => {
      if (t.layer === "APP") return;
      if (!map[t.layer]) map[t.layer] = [];
      map[t.layer].push(t);
    });
    map.APP = buildAppLayerItems();
    LAYER_ORDER.forEach(l => {
      if (map[l] && l !== "APP") {
        map[l].sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    return map;
  }

  class DataDictionaryUI {
    constructor(rootId, options = {}) {
      this.root = document.getElementById(rootId);
      if (!this.root) return;

      this.options = {
        // 默认展开各层，便于发现「点击层名可折叠」
        defaultLayerOpen: LAYER_ORDER.slice(),
        showOverview: false,
        showAdsApplicationMap: false,
        compact: false,
        ...options
      };

      this.state = {
        tables: window.DATA_DICTIONARY || [],
        selectedTable: null,
        selectedField: null,
        filter: "",
        openLayers: new Set(this.options.defaultLayerOpen),
        fieldDrawerOpen: false,
        adsMapOpen: false,
      };

      this.layerTree = buildLayerTree(this.state.tables);
      this.init();
    }

    init() {
      this.render();
      this.bindEvents();
      this.parseHash();
      this.checkSessionStorage();
    }

    render() {
      const totalTables = this.state.tables.length;
      const totalFields = this.state.tables.reduce((sum, t) => sum + (t.field_count || 0), 0);

      this.root.innerHTML = `
        <div class="dd-toolbar">
          <div class="dd-toolbar-left">
            <div class="dd-stats">
              <span class="dd-stat-num">${totalTables}</span>
              <span class="dd-stat-label">表</span>
              <span class="dd-stat-sep">·</span>
              <span class="dd-stat-num">${totalFields}</span>
              <span class="dd-stat-label">字段</span>
            </div>
          </div>
          <div class="dd-toolbar-right">
            <div class="dd-search-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" class="dd-search-input" placeholder="全文搜索：表名、用途、字段、业务含义…" />
            </div>
          </div>
        </div>
        <div class="dd-shell">
          <div class="dd-tree">
            ${this.renderTree()}
          </div>
          <div class="dd-detail">
            ${this.renderDetail()}
          </div>
        </div>
      `;
    }

    renderTree() {
      const filter = this.state.filter.trim().toLowerCase();
      let html = "";

      LAYER_ORDER.forEach(layer => {
        const tables = this.layerTree[layer] || [];
        const filteredTables = filter
          ? tables.filter(t => matchFullText(t, filter))
          : tables;

        if (filteredTables.length === 0 && !(layer === "APP" && !filter && tables.length === 0)) {
          if (filter || tables.length === 0) {
            if (filter && filteredTables.length === 0) return;
            if (!filter && tables.length === 0) return;
          }
        }
        if (!filter && tables.length === 0) return;
        if (filter && filteredTables.length === 0) return;

        const isOpen = this.state.openLayers.has(layer);
        const color = layerColor(layer);
        const label = LAYER_LABELS[layer] || layer;

        html += `
          <div class="dd-tree-layer ${isOpen ? "is-open" : ""}" data-layer="${layer}">
            <button type="button" class="dd-tree-layer-header" aria-expanded="${isOpen ? "true" : "false"}">
              <span class="dd-tree-layer-toggle" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </span>
              <span class="dd-tree-layer-dot" style="background: ${color}"></span>
              <span class="dd-tree-layer-name">${esc(label)}</span>
              <span class="dd-tree-layer-count">${filteredTables.length}</span>
            </button>
            <div class="dd-tree-tables">
              ${filteredTables.map(t => this.renderTreeItem(t)).join("")}
            </div>
          </div>
        `;
      });

      if (filter && !html) {
        html = `<div class="dd-tree-empty">未找到匹配项（可搜表名、用途、字段、业务含义）</div>`;
      }

      return html;
    }

    renderTreeItem(table) {
      const isActive = this.state.selectedTable && this.state.selectedTable.name === table.name;
      const color = layerColor(table.layer);
      const title = tableDisplayName(table);
      const cn = table.isApp ? "" : tableNameCn(table);
      const summary = tableSummary(table);
      const meta = table.isApp
        ? (table.adsViews?.length ? table.adsViews.map(v => v.name).join(" · ") : "看板")
        : `${table.fields?.length || table.field_count || 0} 字段`;

      return `
        <div class="dd-tree-table ${isActive ? 'is-active' : ''}"
             data-table="${esc(table.name)}"
             id="dd-${esc(table.name)}">
          <span class="dd-tree-table-dot" style="background: ${color}"></span>
          <div class="dd-tree-table-main">
            <span class="dd-tree-table-name">${esc(table.isApp ? title : table.name)}</span>
            ${(!table.isApp && cn) ? `<span class="dd-tree-table-cn">${esc(cn)}</span>` : ""}
            ${summary ? `<span class="dd-tree-table-summary" title="${esc(summary)}">${esc(summary)}</span>` : ""}
          </div>
          <span class="dd-tree-table-fields">${esc(meta)}</span>
        </div>
      `;
    }

    renderDetail() {
      const table = this.state.selectedTable;

      if (!table) {
        return `
          <div class="dd-detail-empty">
            <div class="dd-detail-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
            </div>
            <div class="dd-detail-empty-title">请从左侧选择一张表</div>
            <div class="dd-detail-empty-desc">点击左侧树节点查看表详情和字段定义</div>
          </div>
        `;
      }

      const color = layerColor(table.layer);

      const cn = tableNameCn(table);
      const titleMain = table.isApp ? (table.title || table.name) : table.name;
      return `
        <div class="dd-detail-header">
          <div class="dd-detail-title-row">
            <h3 class="dd-detail-title">${esc(titleMain)}${(!table.isApp && cn) ? `<span class="dd-detail-title-cn">（${esc(cn)}）</span>` : ""}</h3>
            <div class="dd-detail-badges">
              <span class="dd-layer-badge dd-layer-${esc(table.layer)}" style="background: ${color}20; color: ${color}; border-color: ${color}40">${esc(table.layer)}</span>
              <span class="dd-type-badge">${esc(table.type)}</span>
            </div>
          </div>
          <div class="dd-detail-purpose">${esc(table.isApp ? (table.title || table.name) : table.purpose || table.name)}</div>
        </div>

        <div class="dd-detail-summary-card">
          <div class="dd-detail-summary-label">表梗概</div>
          <div class="dd-detail-summary-text">${esc(tableSummary(table) || "暂无用途说明")}</div>
          ${table.isApp && table.api ? `<div class="dd-detail-summary-meta">API：<code>${esc(table.api)}</code></div>` : ""}
          ${table.isApp && table.adsViews?.length ? `<div class="dd-detail-summary-meta">ADS 视图：${table.adsViews.map(v => `<button type="button" class="dd-ads-view-link" data-view="${esc(v.name)}">${esc(v.name)}</button>`).join(" · ")}</div>` : ""}
          ${table.isApp && table.href ? `<div class="dd-detail-summary-meta"><a class="dd-ads-dash-link" href="${esc(table.href)}">打开看板 ↗</a></div>` : ""}
        </div>

        <div class="dd-detail-meta">
          <div class="dd-meta-item">
            <span class="dd-meta-label">字段数</span>
            <span class="dd-meta-value">${table.fields?.length || table.field_count || 0}</span>
          </div>
          <div class="dd-meta-item">
            <span class="dd-meta-label">数据来源</span>
            <span class="dd-meta-value">${esc(table.source || '-')}</span>
          </div>
          <div class="dd-meta-item">
            <span class="dd-meta-label">下游表</span>
            <span class="dd-meta-value">${(table.downstream || []).length} 个</span>
          </div>
        </div>

        ${(() => {
          const chain = resolveLineageChain(table);
          if (!chain.length) return "";
          return `
        <div class="dd-detail-section">
          <div class="dd-detail-section-title">数据血缘 <span class="dd-lineage-hint">点击节点跳转</span></div>
          <div class="dd-lineage">
            ${chain.map((n, i) => {
              const isSelf = n === table.name;
              const known = !!findTableLoose(this.state.tables, this.layerTree.APP, n);
              const tip = isSelf ? "当前表" : (known ? "点击查看该表" : "字典中暂无此表");
              return `
              ${i ? '<span class="dd-lineage-arrow">→</span>' : ""}
              <button type="button"
                class="dd-lineage-node ${isSelf ? "is-self" : ""} ${known && !isSelf ? "is-link" : "is-muted"}"
                data-table="${esc(n)}"
                ${isSelf || !known ? "disabled" : ""}
                title="${esc(tip)}">${esc(n)}</button>`;
            }).join("")}
          </div>
        </div>`;
        })()}

        ${table.isApp ? "" : this.renderAdsViewMeta(table)}
        ${table.isApp ? "" : this.renderDashboardLinks(table)}
        ${table.isApp ? "" : `
        <div class="dd-detail-section dd-detail-actions">
          <button type="button" class="dd-graph-focus-btn" data-table="${esc(table.name)}">在知识图谱中聚焦</button>
        </div>`}

        ${table.isApp ? "" : `<div class="dd-detail-section">
          <div class="dd-detail-section-title">字段列表（${(table.fields || []).length}）</div>
          <div class="dd-fields-table-wrap">
            <table class="dd-fields-table">
              <thead>
                <tr>
                  <th style="width: 22%">字段名</th>
                  <th style="width: 16%">中文名</th>
                  <th style="width: 12%">类型</th>
                  <th style="width: 10%">角色</th>
                  <th>业务含义</th>
                  <th style="width: 8%">口径</th>
                </tr>
              </thead>
              <tbody>
                ${(table.fields || []).length
                  ? (table.fields || []).map(f => this.renderFieldRow(f)).join("")
                  : `<tr><td colspan="6" class="dd-fields-empty">暂无字段定义（可从 DDL 重新生成字典）</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>`}

        ${this.state.fieldDrawerOpen && this.state.selectedField && !table.isApp ? `
        <div class="dd-field-drawer is-open">
          <div class="dd-field-drawer-header">
            <span class="dd-field-drawer-title">字段详情</span>
            <button class="dd-field-drawer-close" type="button">×</button>
          </div>
          <div class="dd-field-drawer-body">
            ${this.renderFieldDetail(this.state.selectedField)}
          </div>
        </div>
        ` : ''}
      `;
    }

    renderDashboardLinks(table) {
      const items = table.used_by_dashboards || [];
      if (!items.length) return "";
      const industry = document.body?.dataset?.industry || "retail";
      const dashEntry = industry === "retail" ? "../retail_dashboard.html"
        : industry === "internet" ? "../internet_dashboard.html"
        : "../manufacturing_dashboard.html";
      return `
        <div class="dd-detail-section">
          <div class="dd-detail-section-title">关联看板（${items.length}）</div>
          <div class="dd-dashboard-links">
            ${items.map(d => {
              const title = d.title || d.id || d;
              const id = typeof d === "object" ? (d.id || "") : String(d);
              const href = (typeof d === "object" && d.href) ? d.href
                : `${dashEntry}#${encodeURIComponent(id)}`;
              return `<a class="dd-dashboard-chip" href="${esc(href)}" title="${esc(id)}">${esc(title)}</a>`;
            }).join("")}
          </div>
        </div>`;
    }

    /** 应用层看板 ↔ ADS 视图映射（原架构页静态表格并入字典） */
    renderAdsApplicationMap() {
      const dashCfg = window.INDUSTRY_DASHBOARDS || [];
      const adsTables = this.state.tables.filter(t => t.layer === "ADS");
      if (!dashCfg.length && !adsTables.length) return "";

      const rows = dashCfg.map(d => {
        const views = adsTables.filter(t =>
          (t.used_by_dashboards || []).some(x => (x.id || x) === d.id)
        );
        const primary = views[0];
        const viewNames = views.map(v => v.name).join(" · ") || "—";
        return {
          id: d.id,
          title: d.title || d.id,
          api: d.api || "—",
          views: viewNames,
          purpose: primary?.purpose || d.description || "—",
          href: d.href || "#",
          viewTable: primary?.name || null,
        };
      });

      return `
        <details class="dd-ads-map-panel" id="dd-ads-application-map">
          <summary>应用层 · 看板与 ADS 视图映射 <span class="dd-ads-map-hint">（${rows.length} 看板 · 点击行可定位 ADS 视图）</span></summary>
          <div class="dd-ads-map-body">
            <p class="dd-ads-map-desc">主题看板通过 Flask API 查询 DWS/ADS；点视图名或行可在下方字典中查看字段口径与血缘。</p>
            <div class="table-wrap table-scroll-wrap">
              <table class="data-table dd-ads-map-table">
                <thead><tr><th>看板</th><th>API</th><th>ADS 视图 / 对象</th><th>业务场景</th></tr></thead>
                <tbody>
                  ${rows.map(r => `
                    <tr class="dd-ads-map-row" data-view="${esc(r.viewTable || "")}" data-dash="${esc(r.id)}">
                      <td><a href="${esc(r.href)}" class="dd-ads-dash-link">${esc(r.title)}</a></td>
                      <td><code>${esc(r.api)}</code></td>
                      <td>${r.viewTable
                        ? `<button type="button" class="dd-ads-view-link" data-view="${esc(r.viewTable)}">${esc(r.views)}</button>`
                        : esc(r.views)}</td>
                      <td>${esc(r.purpose)}</td>
                    </tr>`).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </details>`;
    }

    renderAdsViewMeta(table) {
      if (table.layer !== "ADS") return "";
      const dashCfg = window.INDUSTRY_DASHBOARDS || [];
      const linked = dashCfg.filter(d =>
        (table.used_by_dashboards || []).some(x => (x.id || x) === d.id)
      );
      if (!linked.length) return "";
      return `
        <div class="dd-detail-section dd-ads-view-meta">
          <div class="dd-detail-section-title">应用层 · 看板消费</div>
          <ul class="dd-ads-view-meta-list">
            ${linked.map(d => `
              <li><strong>${esc(d.title)}</strong>
                ${d.api ? `<code>${esc(d.api)}</code>` : ""}
                ${d.description ? `<span class="dd-ads-meta-desc">${esc(d.description)}</span>` : ""}
              </li>`).join("")}
          </ul>
        </div>`;
    }

    /** 解析字段对应的指标口径（caliber_id → 字段名兜底） */
    resolveCaliber(field) {
      const store = window.METRIC_CALIBER;
      if (!store || !field) return null;
      if (field.caliber_id && store[field.caliber_id]) return store[field.caliber_id];
      const name = String(field.name || "").toLowerCase();
      if (store[name]) return store[name];
      const aliases = {
        order_amount: "revenue",
        sales_amount: "revenue",
        total_revenue: "revenue",
        gmv: "revenue",
        payment_amount: "revenue",
        cost_amount: "cost_of_goods_sold",
        avg_order_value: "average_order_value",
        order_count: "transaction_count",
        net_margin: "net_profit_margin",
        inventory_amount: "inventory_value",
      };
      const aid = aliases[name];
      if (aid && store[aid]) return store[aid];
      return null;
    }

    renderFieldRow(field) {
      const isSelected = this.state.selectedField && this.state.selectedField.name === field.name;
      const roleColor = ROLE_COLORS[field.role] || "#6b7280";
      const caliber = this.resolveCaliber(field);
      const cn = fieldNameCn(field);
      const biz = field.business || field.desc || "-";

      return `
        <tr class="dd-field-row ${isSelected ? 'is-selected' : ''}" data-field="${esc(field.name)}">
          <td><code class="dd-field-name">${esc(field.name)}</code></td>
          <td><span class="dd-field-cn">${esc(cn || "—")}</span></td>
          <td><span class="dd-field-type">${esc(field.type || "—")}</span></td>
          <td><span class="dd-field-role" style="background: ${roleColor}20; color: ${roleColor}">${esc(ROLE_LABELS[field.role] || field.role || "—")}</span></td>
          <td>${esc(biz)}</td>
          <td>${caliber ? `<span class="dd-caliber-badge" title="${esc(caliber.label)}">有</span>` : '<span class="dd-caliber-none">—</span>'}</td>
        </tr>
      `;
    }

    renderFieldDetail(field) {
      const roleColor = ROLE_COLORS[field.role] || "#6b7280";
      const caliber = this.resolveCaliber(field);
      const cn = fieldNameCn(field);
      let caliberHtml = '';
      if (caliber) {
        caliberHtml = `
          <div class="dd-field-caliber">
            <div class="dd-field-caliber-header">
              <span class="dd-field-caliber-icon">📐</span>
              <span class="dd-field-caliber-title">指标口径</span>
              <span class="dd-field-caliber-name">${esc(caliber.label)}</span>
            </div>
            <div class="dd-field-caliber-grid">
              ${caliber.business ? `
              <div class="dd-field-caliber-item">
                <div class="dd-field-caliber-label">业务口径</div>
                <div class="dd-field-caliber-value">${esc(caliber.business)}</div>
              </div>
              ` : ''}
              ${caliber.technical ? `
              <div class="dd-field-caliber-item">
                <div class="dd-field-caliber-label">技术口径</div>
                <div class="dd-field-caliber-value dd-caliber-sql">${esc(caliber.technical)}</div>
              </div>
              ` : ''}
              ${caliber.source_table ? `
              <div class="dd-field-caliber-item">
                <div class="dd-field-caliber-label">数据来源</div>
                <div class="dd-field-caliber-value"><code>${esc(caliber.source_table)}</code></div>
              </div>
              ` : ''}
              ${caliber.exclude_rules && caliber.exclude_rules !== '-' ? `
              <div class="dd-field-caliber-item">
                <div class="dd-field-caliber-label">排除规则</div>
                <div class="dd-field-caliber-value">${esc(caliber.exclude_rules)}</div>
              </div>
              ` : ''}
              ${caliber.refresh ? `
              <div class="dd-field-caliber-item">
                <div class="dd-field-caliber-label">刷新频率</div>
                <div class="dd-field-caliber-value">${esc(caliber.refresh)}</div>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      }

      return `
        <div class="dd-field-detail-name">
          <code>${esc(field.name)}</code>
          ${cn ? `<span class="dd-field-cn-badge">${esc(cn)}</span>` : ""}
          <span class="dd-field-role" style="background: ${roleColor}20; color: ${roleColor}">${esc(ROLE_LABELS[field.role] || field.role)}</span>
        </div>
        <div class="dd-field-detail-grid">
          ${cn ? `
          <div class="dd-field-detail-item">
            <div class="dd-field-detail-label">中文名</div>
            <div class="dd-field-detail-value">${esc(cn)}</div>
          </div>` : ""}
          <div class="dd-field-detail-item">
            <div class="dd-field-detail-label">类型</div>
            <div class="dd-field-detail-value">${esc(field.type)}</div>
          </div>
          <div class="dd-field-detail-item">
            <div class="dd-field-detail-label">业务含义</div>
            <div class="dd-field-detail-value">${esc(field.business || field.desc || '-')}</div>
          </div>
          ${field.desc && field.desc !== field.business ? `
          <div class="dd-field-detail-item">
            <div class="dd-field-detail-label">描述</div>
            <div class="dd-field-detail-value">${esc(field.desc)}</div>
          </div>
          ` : ''}
        </div>
        ${caliberHtml}
      `;
    }

    bindEvents() {
      const root = this.root;

      root.addEventListener('click', (e) => {
        // 层展开/折叠
        const layerHeader = e.target.closest('.dd-tree-layer-header');
        if (layerHeader) {
          e.preventDefault();
          const layerEl = layerHeader.closest('.dd-tree-layer');
          const layer = layerEl?.dataset?.layer;
          if (!layer) return;
          if (this.state.openLayers.has(layer)) this.state.openLayers.delete(layer);
          else this.state.openLayers.add(layer);
          this.updateTree();
          return;
        }

        // 血缘跳转
        const lineageNode = e.target.closest('.dd-lineage-node.is-link');
        if (lineageNode?.dataset?.table) {
          e.preventDefault();
          this.selectTable(lineageNode.dataset.table);
          return;
        }

        // 选中表
        const tableItem = e.target.closest('.dd-tree-table');
        if (tableItem) {
          const tableName = tableItem.dataset.table;
          this.selectTable(tableName);
          return;
        }

        // 选中字段
        const fieldRow = e.target.closest('.dd-field-row');
        if (fieldRow) {
          const fieldName = fieldRow.dataset.field;
          this.selectField(fieldName);
          return;
        }

        // 关闭字段抽屉
        if (e.target.closest('.dd-field-drawer-close')) {
          this.closeFieldDrawer();
          return;
        }

        // 在知识图谱中聚焦
        const graphBtn = e.target.closest('.dd-graph-focus-btn');
        if (graphBtn) {
          const tableName = graphBtn.dataset.table;
          window.openArchInteractive?.("dw-graph-section");
          if (window.__dwGraph?.focusNode) {
            setTimeout(() => {
              window.__dwGraph.focusNode(tableName);
              document.getElementById("dw-graph-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 120);
          } else {
            location.hash = `dw-graph-section?focus=${encodeURIComponent(tableName || "")}`;
            document.getElementById("dw-graph-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }

        const adsViewBtn = e.target.closest('.dd-ads-view-link');
        if (adsViewBtn?.dataset.view) {
          this.selectTable(adsViewBtn.dataset.view);
          this.state.openLayers.add("ADS");
          this.updateTree();
          return;
        }

        const adsRow = e.target.closest('.dd-ads-map-row');
        if (adsRow && !e.target.closest('a.dd-ads-dash-link')) {
          const view = adsRow.dataset.view;
          if (view) {
            e.preventDefault();
            this.selectTable(view);
            this.state.openLayers.add("ADS");
            this.updateTree();
            this.root.querySelector('.dd-detail')?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          return;
        }
      });

      // 搜索：有关键词时自动展开命中层，清空后保持当前展开态
      const searchInput = root.querySelector('.dd-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.state.filter = e.target.value;
          const q = this.state.filter.trim().toLowerCase();
          if (q) {
            LAYER_ORDER.forEach((layer) => {
              const tables = this.layerTree[layer] || [];
              if (tables.some((t) => matchFullText(t, q))) this.state.openLayers.add(layer);
            });
          }
          this.updateTree();
        });
      }

      // hash变化
      window.addEventListener('hashchange', () => {
        this.parseHash();
      });

      // ESC关闭抽屉
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.fieldDrawerOpen) {
          this.closeFieldDrawer();
        }
      });
    }

    updateTree() {
      const treeEl = this.root.querySelector('.dd-tree');
      if (treeEl) {
        treeEl.innerHTML = this.renderTree();
      }
    }

    updateDetail() {
      const detailEl = this.root.querySelector('.dd-detail');
      if (detailEl) {
        detailEl.innerHTML = this.renderDetail();
      }
    }

    selectTable(name) {
      let table = findTableLoose(this.state.tables, this.layerTree.APP, name);
      if (!table) return false;

      this.state.selectedTable = table;
      this.state.selectedField = null;
      this.state.fieldDrawerOpen = false;

      // 展开该表所在层，并刷新树选中态
      if (table.layer) this.state.openLayers.add(table.layer);
      this.updateTree();

      this.root.querySelectorAll('.dd-tree-table').forEach(el => {
        el.classList.toggle('is-active', el.dataset.table === table.name);
      });

      const activeItem = this.root.querySelector(`.dd-tree-table.is-active`);
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.updateDetail();
      this.updateHash();

      const detailEl = this.root.querySelector('.dd-detail');
      if (detailEl) detailEl.scrollTop = 0;
      return true;
    }

    selectField(fieldName) {
      if (!this.state.selectedTable) return;

      const field = this.state.selectedTable.fields.find(f => f.name === fieldName);
      if (!field) return;

      this.state.selectedField = field;
      this.state.fieldDrawerOpen = true;

      // 行高亮不必整页重渲
      this.root.querySelectorAll('.dd-field-row').forEach(el => {
        el.classList.toggle('is-selected', el.dataset.field === fieldName);
      });

      const drawer = this.root.querySelector('.dd-field-drawer');
      if (drawer) {
        drawer.classList.add('is-open');
        const body = drawer.querySelector('.dd-field-drawer-body');
        if (body) body.innerHTML = this.renderFieldDetail(field);
      } else {
        this.updateDetail();
      }
      this.updateHash();
    }

    closeFieldDrawer() {
      this.state.fieldDrawerOpen = false;
      this.state.selectedField = null;
      this.updateDetail();
    }

    updateHash() {
      if (!this.state.selectedTable) return;
      let hash = `dict/${this.state.selectedTable.name}`;
      if (this.state.selectedField) {
        hash += `/${this.state.selectedField.name}`;
      }
      if (location.hash !== `#${hash}`) {
        history.replaceState(null, '', `#${hash}`);
      }
    }

    parseHash() {
      const hash = location.hash.slice(1);
      if (!hash) return;

      // 新格式：dict/tableName
      if (hash.startsWith('dict/')) {
        const parts = hash.slice(5).split('/');
        const tableName = parts[0];
        const fieldName = parts[1];

        if (tableName) {
          this.selectTable(tableName);
          if (fieldName) {
            setTimeout(() => this.selectField(fieldName), 100);
          }
        }
        return;
      }

      // 旧格式：dd-tableName
      if (hash.startsWith('dd-')) {
        const tableName = hash.slice(3);
        this.selectTable(tableName);
        return;
      }
    }

    checkSessionStorage() {
      try {
        const dictNav = sessionStorage.getItem('dictNav');
        if (dictNav) {
          const { table, field } = JSON.parse(dictNav);
          sessionStorage.removeItem('dictNav');

          if (table) {
            // 滚动到数据字典区域
            const section = document.getElementById('data-dictionary-section');
            if (section) {
              section.scrollIntoView({ behavior: 'smooth' });
            }

            setTimeout(() => {
              this.selectTable(table);
              if (field) {
                setTimeout(() => this.selectField(field), 100);
              }
            }, 500);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 公开API
    selectTableByName(name) {
      return this.selectTable(name);
    }

    selectFieldByName(tableName, fieldName) {
      this.selectTable(tableName);
      setTimeout(() => this.selectField(fieldName), 100);
    }

    highlightField(fieldKey) {
      // fieldKey格式：tableName.fieldName
      const parts = fieldKey.split('.');
      if (parts.length >= 2) {
        this.selectFieldByName(parts[0], parts[1]);
      } else if (parts.length === 1) {
        this.selectTable(parts[0]);
      }
    }

    /** 滚动到字典区并选中表/字段（全景图、全局搜索共用） */
    navigateTo(tableName, fieldName) {
      const section = document.getElementById('data-dictionary-section');
      if (section) {
        if (section.tagName === 'DETAILS') section.open = true;
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const run = () => {
        const ok = this.selectTable(tableName);
        if (ok && fieldName) {
          setTimeout(() => this.selectField(fieldName), 80);
        }
        return ok;
      };
      // 等滚动启动后再选中，避免视觉跳动
      return new Promise((resolve) => {
        setTimeout(() => resolve(run()), 320);
      });
    }

    filter(keyword) {
      this.state.filter = keyword;
      const searchInput = this.root.querySelector('.dd-search-input');
      if (searchInput) {
        searchInput.value = keyword;
      }
      this.updateTree();
    }

    getState() {
      return {
        table: this.state.selectedTable?.name,
        field: this.state.selectedField?.name,
        layer: this.state.selectedTable?.layer
      };
    }
  }

  // 暴露到全局
  window.DataDictionaryUI = {
    render(rootId, options) {
      return new DataDictionaryUI(rootId, options);
    }
  };

})();
