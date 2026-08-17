/* 方法论页交互 · 六层框架 + 三层回答结构 */
(function () {
  "use strict";

  const sidebar = document.getElementById("sidebar");
  const detailPanel = document.getElementById("detail-panel");
  const searchInput = document.getElementById("search-input");
  const searchMeta = document.getElementById("search-meta");
  const mobileToggle = document.getElementById("mobile-toggle");

  let activeId = "q01";
  let activeToolboxId = null;
  let collapsedLayers = new Set();

  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  }

  // ===== 看板目录（config/dashboards.json）=====
  let dashCatalog = [];

  function industryCode() {
    return document.body?.dataset?.industry || "retail";
  }

  function stripRefLabel(name) {
    return String(name || "")
      .trim()
      .replace(/（[^）]*）/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/看板$/g, "")
      .replace(/视图$/g, "")
      .replace(/表$/g, "")
      .trim();
  }

  function tableToken(name) {
    const cleaned = stripRefLabel(name);
    const token = cleaned.split(/[\s,，、]+/)[0] || "";
    return token;
  }

  function isTableOrViewName(name) {
    const t = tableToken(name);
    return /^(ods_|dim_|dwd_|dws_|v_|fact_|ads_)/i.test(t);
  }

  function matchDashboard(name) {
    const n = stripRefLabel(name).toLowerCase();
    if (!n) return null;
    const list = dashCatalog.length
      ? dashCatalog
      : (window.INDUSTRY_DASHBOARDS || []);
    const exactId = list.find((d) => String(d.id || "").toLowerCase() === n);
    if (exactId) return exactId;
    const exactTitle = list.find((d) => String(d.title || "").toLowerCase() === n);
    if (exactTitle) return exactTitle;
    const fuzzy = list.find((d) => {
      const title = String(d.title || "").toLowerCase();
      const id = String(d.id || "").toLowerCase();
      return (title && (title.includes(n) || n.includes(title))) ||
        (id && (id.includes(n) || n.includes(id)));
    });
    return fuzzy || null;
  }

  async function loadDashCatalog() {
    try {
      const res = await fetch("../config/dashboards.json", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.dashboards || []);
      dashCatalog = list;
      const ind = industryCode();
      window.INDUSTRY_DASHBOARDS = list.map((d) => ({
        id: d.id,
        title: d.title,
        href: `../${ind}_dashboard.html#${d.id}`,
      }));
    } catch (e) {
      console.warn("[methodology] dashboards.json load failed", e);
    }
  }

  // ===== 看板 / 视图 → 页面 URL =====
  function getDashboardHref(name) {
    const ind = industryCode();
    const base = `../${ind}_dashboard.html`;
    const token = tableToken(name);

    if (isTableOrViewName(name)) {
      return `architecture.html#dict/${encodeURIComponent(token)}`;
    }

    const dash = matchDashboard(name);
    if (dash?.id) return `${base}#${dash.id}`;
    if (dash?.href) return dash.href;

    const n = String(name || "").toLowerCase();
    if (n.includes("总览") || n.includes("overview") || n.includes("概览")) return `${base}#overview`;
    if (n.includes("生产")) return `${base}#production`;
    if (n.includes("质量") || n.includes("良品") || n.includes("缺陷")) return `${base}#quality`;
    if (n.includes("交付") || n.includes("准时") || n.includes("otd")) return `${base}#delivery`;
    if (n.includes("设备") || n.includes("oee") || n.includes("停机")) return `${base}#equipment`;
    if (n.includes("产能") || n.includes("负荷")) return `${base}#capacity`;
    if (n.includes("成本") || n.includes("cost")) return `${base}#cost`;
    if (n.includes("活跃") || n.includes("dau") || n.includes("mau")) return `${base}#overview`;
    if (n.includes("点播") || n.includes("vod")) return `${base}#vod`;
    if (n.includes("直播") || n.includes("live")) return `${base}#live`;
    if (n.includes("留存") || n.includes("retention")) return `${base}#retention`;
    if (n.includes("收入") || n.includes("付费") || n.includes("ltv")) return `${base}#revenue`;
    return base;
  }

  // ===== 关联项 → 知识图谱节点 id（星点）=====
  function resolveKgNodeId(name, playbookId) {
    const raw = String(name || "").trim();
    if (!raw) return playbookId ? `pb:${playbookId}` : "";
    if (/^(dash|tbl|pb|metric|tool):/i.test(raw)) return raw;

    const token = tableToken(raw);
    if (isTableOrViewName(raw)) return `tbl:${token}`;

    const dash = matchDashboard(raw);
    if (dash?.id) return `dash:${dash.id}`;

    // 中文名未命中配置时，仍尝试用清理后的英文 id
    if (/^[a-z][a-z0-9_-]*$/i.test(token)) return `dash:${token.toLowerCase()}`;
    return playbookId ? `pb:${playbookId}` : "";
  }

  function getKnowledgeGraphHref(p, refName) {
    const nodeId = refName
      ? resolveKgNodeId(refName, p?.id)
      : (p?.id ? `pb:${p.id}` : resolveKgNodeId(p?.dashboards?.[0], p?.id));
    if (!nodeId) return "platform-graph.html";
    return `platform-graph.html?node=${encodeURIComponent(nodeId)}`;
  }

  function classifyRef(name, playbookId) {
    const label = String(name || "").trim();
    const nodeId = resolveKgNodeId(label, playbookId);
    const pageHref = getDashboardHref(label);
    const kind = isTableOrViewName(label) ? "view" : (matchDashboard(label) ? "dashboard" : "ref");
    return { label, nodeId, pageHref, kind };
  }

  function toolboxMethodTitle(id) {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories || !id) return "";
    for (const cat of box.categories) {
      const m = (cat.methods || []).find((x) => x.id === id);
      if (m) return m.title;
    }
    return "";
  }

  function toolboxMethodCount() {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories) return 0;
    return box.categories.reduce((n, c) => n + (c.methods?.length || 0), 0);
  }

  function renderToolboxSidebar(kw, counter) {
    const box = window.ANALYSIS_TOOLBOX;
    if (!box?.categories) return "";
    const catHtml = box.categories.map((cat) => {
      const methods = (cat.methods || []).filter((m) => {
        const hay = `${m.title} ${m.explain || ""} ${m.businessQuestion || ""} ${m.aliases || ""}`.toLowerCase();
        const match = !kw || hay.includes(kw);
        if (match) counter.count += 1;
        return match;
      });
      if (!methods.length) return "";
      const btns = methods.map((m) => `
        <button class="q-card toolbox-nav-card${m.id === activeToolboxId ? " active" : ""}" data-toolbox-id="${esc(m.id)}" type="button">
          <span class="q-title">${esc(m.title)}</span>
          <span class="q-desc">${esc(m.businessQuestion || "")}</span>
        </button>`).join("");
      return `<div class="cat-label">${esc(cat.name)}</div>${btns}`;
    }).join("");
    const collapsed = collapsedLayers.has("l6");
    return `
      <div class="layer-block${collapsed ? " collapsed" : ""}" data-layer="l6">
        <div class="layer-header" data-toggle="l6">
          <span class="layer-dot" style="background:#ec4899"></span>
          <span>第六层 · 用什么方法？ <em class="layer-count">(${toolboxMethodCount()})</em></span>
          <span class="chevron">▼</span>
        </div>
        <div class="layer-items">${catHtml || '<p style="color:var(--text3);font-size:12px;padding:8px">无匹配方法</p>'}</div>
      </div>`;
  }

  function renderSidebar(filter = "") {
    const kw = filter.trim().toLowerCase();
    let visibleCount = 0;
    const toolboxCounter = { count: 0 };
    const layersHtml = LAYERS.map(layer => {
      const items = PLAYBOOKS.filter(p => p.layer === layer.id);
      const cards = items.map(p => {
        const hay = (p.title + p.desc + p.bizQuestion + p.keywords.join(" ")).toLowerCase();
        const match = !kw || hay.includes(kw);
        if (match) visibleCount++;
        const cats = layer.categories || [];
        return { ...p, match, cat: p.category || "" };
      });

      const grouped = {};
      cards.forEach(c => {
        const key = c.cat || "default";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(c);
      });

      const catHtml = Object.entries(grouped).map(([cat, list]) => {
        const visible = list.filter(c => c.match);
        if (!visible.length) return "";
        const catLabel = cat !== "default" ? `<div class="cat-label">${esc(cat)}</div>` : "";
        const btns = visible.map(p => `
          <button class="q-card${p.id === activeId && !activeToolboxId ? " active" : ""}" data-id="${p.id}" type="button">
            <span class="q-title">${esc(p.title)}</span>
            <span class="q-desc">${esc(p.desc)}</span>
          </button>`).join("");
        return catLabel + btns;
      }).join("");

      const collapsed = collapsedLayers.has(layer.id);
      const count = items.length;
      return `
        <div class="layer-block${collapsed ? " collapsed" : ""}" data-layer="${layer.id}">
          <div class="layer-header" data-toggle="${layer.id}">
            <span class="layer-dot" style="background:${layer.color}"></span>
            <span>${esc(layer.short)} · ${esc(layer.question)} <em class="layer-count">(${count})</em></span>
            <span class="chevron">▼</span>
          </div>
          <div class="layer-items">${catHtml || '<p style="color:var(--text3);font-size:12px;padding:8px">无匹配问题</p>'}</div>
        </div>`;
    }).join("");

    sidebar.innerHTML = layersHtml + renderToolboxSidebar(kw, toolboxCounter);
    visibleCount += toolboxCounter.count;

    searchMeta.textContent = kw
      ? `搜索「${filter}」匹配 ${visibleCount} / ${PLAYBOOKS.length + toolboxMethodCount()} 项`
      : `共 ${PLAYBOOKS.length} 个分析问题 + ${toolboxMethodCount()} 种方法 · 当前：${
          activeToolboxId ? toolboxMethodTitle(activeToolboxId) : (PLAYBOOKS.find((p) => p.id === activeId)?.title || "")
        }`;

    sidebar.querySelectorAll(".q-card[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        selectPlaybook(btn.dataset.id);
        sidebar.classList.remove("open");
      });
    });
    sidebar.querySelectorAll("[data-toolbox-id]").forEach((btn) => {
      btn.addEventListener("click", () => selectToolboxMethod(btn.dataset.toolbox-id));
    });
    sidebar.querySelectorAll(".layer-header").forEach(h => {
      h.addEventListener("click", () => {
        const id = h.dataset.toggle;
        if (collapsedLayers.has(id)) collapsedLayers.delete(id);
        else collapsedLayers.add(id);
        renderSidebar(searchInput.value);
      });
    });
  }

  function renderCriteria(rows) {
    if (!rows || !rows.length) return "";
    const cls = { ok: "cell-ok", warn: "cell-warn", bad: "cell-bad" };
    const body = rows.map(r => `
      <tr>
        <td>${esc(r.dim)}</td>
        <td class="${cls.ok}">${esc(r.ok)}</td>
        <td class="${cls.warn}">${esc(r.warn)}</td>
        <td class="${cls.bad}">${esc(r.bad)}</td>
      </tr>`).join("");
    return `
      <table class="criteria-table">
        <thead><tr><th>维度</th><th>正常</th><th>关注</th><th>异常</th></tr></thead>
        <tbody>${body}</tbody>
      </table>`;
  }

  // ===== 三层框架：数据校验步骤 =====
  function renderDataValidationSteps(steps) {
    return steps.map((s, i) => `
      <div class="step-block">
        <div class="step-head">校验 ${i + 1}：${esc(s.title)}</div>
        <div class="step-body">
          ${s.desc ? `<p class="step-desc">${esc(s.desc)}</p>` : ""}
          ${s.sql ? `
            <div class="sql-wrap">
              <div class="sql-label">📊 SQL 取数</div>
              <pre class="sql-block">${esc(s.sql.trim())}</pre>
            </div>` : ""}
          ${s.judge ? `
            <div class="judge-wrap">
              <div class="judge-label">⚖️ 判断标准</div>
              <p class="judge-text">${esc(s.judge)}</p>
            </div>` : ""}
          ${s.output ? `<p class="step-output"><strong>输出：</strong>${esc(s.output)}</p>` : ""}
        </div>
      </div>`).join("");
  }

  // ===== 三层框架：业务归因（从steps和criteria提取） =====
  function renderBusinessAttribution(p) {
    const { steps, criteria } = p;
    // 从steps的judge里提取归因要点
    const attributionPoints = [];
    steps.forEach((s, i) => {
      if (s.judge) {
        attributionPoints.push({
          title: s.title,
          point: s.judge
        });
      }
    });

    const criteriaHtml = criteria && criteria.length ? renderCriteria(criteria) : "";

    const pointsHtml = attributionPoints.length ? `
      <div class="attribution-points">
        ${attributionPoints.map((p, i) => `
          <div class="attribution-item">
            <span class="attribution-num">${i + 1}</span>
            <div class="attribution-content">
              <div class="attribution-title">${esc(p.title)}</div>
              <div class="attribution-desc">${esc(p.point)}</div>
            </div>
          </div>
        `).join("")}
      </div>
    ` : '<p class="empty-hint">暂无归因要点</p>';

    return `
      <div class="attribution-wrap">
        <div class="attribution-intro">
          <p>基于数据校验结果，从以下维度进行业务归因分析：</p>
        </div>
        ${pointsHtml}
        ${criteriaHtml ? `
          <div class="criteria-wrap">
            <div class="criteria-title">📋 判断标准矩阵</div>
            ${criteriaHtml}
          </div>
        ` : ""}
      </div>
    `;
  }

  // ===== 三层框架：策略输出 =====
  function renderStrategyOutput(p) {
    const dashboardsHtml = p.dashboards && p.dashboards.length ? `
      <div class="dash-section">
        <div class="dash-section-title">📊 关联看板 / 视图</div>
        <div class="dash-links">
          ${p.dashboards.map((d) => {
            const ref = classifyRef(d, p.id);
            const pageLabel = ref.kind === "view" ? "打开字典" : "打开看板";
            const kgHref = getKnowledgeGraphHref(p, d);
            return `<div class="dash-link-row">
              <div class="dash-link-main">
                <span class="dash-link-icon">→</span>
                <span class="dash-link-text">${esc(ref.label)}</span>
              </div>
              <div class="dash-link-actions">
                <a href="${esc(ref.pageHref)}" class="dash-action" target="_blank" rel="noopener">${pageLabel}</a>
                <a href="${esc(kgHref)}" class="dash-action dash-action-kg" target="_blank" rel="noopener" title="在知识图谱中定位该星点">图谱星点</a>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    ` : "";

    const kgHref = getKnowledgeGraphHref(p);

    return `
      <div class="strategy-wrap">
        <div class="strategy-section">
          <div class="strategy-section-title">📄 产出物</div>
          <ul class="output-list">${(p.outputs || []).map(o => `<li>${esc(o)}</li>`).join("")}</ul>
        </div>
        <div class="strategy-section">
          <div class="strategy-section-title">🎯 下一步行动</div>
          <ul class="next-list">${(p.nextSteps || []).map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        </div>
        ${dashboardsHtml}
        <div class="kg-section">
          <div class="kg-section-title">🕸️ 知识图谱</div>
          <a href="${esc(kgHref)}" class="kg-link" target="_blank" rel="noopener">
            <span class="kg-link-icon">🌐</span>
            <span class="kg-link-text">以本场景为中心打开辐射星点图（pb:${esc(p.id || "")}）</span>
            <span class="kg-link-arrow">→</span>
          </a>
        </div>
      </div>
    `;
  }

  function renderDetail(p) {
    if (!p) return;
    const layer = LAYERS.find(l => l.id === p.layer);
    const color = layer?.color || "#3b82f6";

    detailPanel.innerHTML = `
      <div class="detail-inner">
        <header class="detail-head">
          <span class="detail-badge" style="background:${color}22;color:${color}">${esc(layer?.name || "")}</span>
          <h2>📌 ${esc(p.title)}</h2>
          <p class="biz-q">业务问：「${esc(p.bizQuestion)}」</p>
        </header>

        <!-- 触发条件 -->
        <section class="section trigger-section" style="--accent:${color}">
          <h3 class="section-title">⚡ 触发场景</h3>
          <ul class="trigger-list">${(p.triggers || []).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        </section>

        <!-- 三层框架 -->
        <div class="three-layer-framework">

          <!-- 第一层：数据校验 -->
          <section class="section layer-section layer-1" style="--accent:#3b82f6">
            <div class="layer-header-bar">
              <span class="layer-number">01</span>
              <div class="layer-header-content">
                <h3 class="section-title">数据校验</h3>
                <p class="layer-subtitle">公式 · SQL取数 · 判断标准</p>
              </div>
            </div>
            <div class="layer-body">
              ${renderDataValidationSteps(p.steps)}
            </div>
          </section>

          <!-- 第二层：业务归因 -->
          <section class="section layer-section layer-2" style="--accent:#8b5cf6">
            <div class="layer-header-bar">
              <span class="layer-number">02</span>
              <div class="layer-header-content">
                <h3 class="section-title">业务归因</h3>
                <p class="layer-subtitle">原因分析 · 诊断逻辑</p>
              </div>
            </div>
            <div class="layer-body">
              ${renderBusinessAttribution(p)}
            </div>
          </section>

          <!-- 第三层：策略输出 -->
          <section class="section layer-section layer-3" style="--accent:#22c55e">
            <div class="layer-header-bar">
              <span class="layer-number">03</span>
              <div class="layer-header-content">
                <h3 class="section-title">策略输出</h3>
                <p class="layer-subtitle">产出物 · 行动建议 · 关联工具</p>
              </div>
            </div>
            <div class="layer-body">
              ${renderStrategyOutput(p)}
            </div>
          </section>

        </div>
      </div>`;

    // 注入三层框架样式
    injectThreeLayerStyles();
  }

  // ===== 注入三层框架样式 =====
  function injectThreeLayerStyles() {
    if (document.getElementById("three-layer-styles")) return;
    const style = document.createElement("style");
    style.id = "three-layer-styles";
    style.textContent = `
      .three-layer-framework {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .layer-section {
        border-left: 3px solid var(--accent);
        background: linear-gradient(135deg, rgba(15,23,42,0.6) 0%, rgba(30,41,59,0.4) 100%);
        border-radius: 0 12px 12px 0;
        overflow: hidden;
      }
      .layer-header-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 18px;
        background: rgba(15,23,42,0.5);
        border-bottom: 1px solid rgba(71,85,105,0.3);
      }
      .layer-number {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: var(--accent);
        color: #fff;
        font-size: 18px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "JetBrains Mono", Consolas, monospace;
        flex-shrink: 0;
      }
      .layer-header-content .section-title {
        margin: 0;
        font-size: 16px;
        color: #f1f5f9;
      }
      .layer-subtitle {
        margin: 2px 0 0;
        font-size: 12px;
        color: #94a3b8;
      }
      .layer-body {
        padding: 16px 18px;
      }

      /* 数据校验层样式 */
      .step-block {
        margin-bottom: 16px;
        background: rgba(15,23,42,0.4);
        border: 1px solid rgba(71,85,105,0.3);
        border-radius: 10px;
        overflow: hidden;
      }
      .step-block:last-child { margin-bottom: 0; }
      .step-head {
        padding: 10px 14px;
        background: rgba(59,130,246,0.1);
        border-bottom: 1px solid rgba(59,130,246,0.2);
        font-weight: 600;
        font-size: 13px;
        color: #93c5fd;
      }
      .step-body { padding: 12px 14px; }
      .step-desc {
        margin: 0 0 10px;
        font-size: 13px;
        color: #cbd5e1;
        line-height: 1.6;
      }
      .sql-wrap {
        margin-bottom: 10px;
      }
      .sql-label {
        font-size: 11px;
        font-weight: 600;
        color: #60a5fa;
        margin-bottom: 6px;
      }
      .sql-block {
        background: rgba(15,23,42,0.8);
        border: 1px solid rgba(59,130,246,0.2);
        border-radius: 6px;
        padding: 12px;
        font-size: 11px;
        line-height: 1.6;
        color: #93c5fd;
        overflow-x: auto;
        margin: 0;
        font-family: "JetBrains Mono", Consolas, monospace;
      }
      .judge-wrap {
        background: rgba(251,191,36,0.08);
        border: 1px solid rgba(251,191,36,0.2);
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .judge-label {
        font-size: 11px;
        font-weight: 600;
        color: #fbbf24;
        margin-bottom: 4px;
      }
      .judge-text {
        margin: 0;
        font-size: 12px;
        color: #fde68a;
        line-height: 1.5;
      }
      .step-output {
        margin: 0;
        font-size: 12px;
        color: #94a3b8;
      }
      .step-output strong { color: #cbd5e1; }

      /* 业务归因层样式 */
      .attribution-wrap { padding: 4px 0; }
      .attribution-intro {
        margin-bottom: 14px;
        font-size: 13px;
        color: #cbd5e1;
        line-height: 1.6;
      }
      .attribution-points {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 16px;
      }
      .attribution-item {
        display: flex;
        gap: 10px;
        padding: 10px 12px;
        background: rgba(139,92,246,0.08);
        border: 1px solid rgba(139,92,246,0.2);
        border-radius: 8px;
      }
      .attribution-num {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: rgba(139,92,246,0.2);
        color: #c4b5fd;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-family: "JetBrains Mono", Consolas, monospace;
      }
      .attribution-content { flex: 1; min-width: 0; }
      .attribution-title {
        font-size: 13px;
        font-weight: 600;
        color: #ddd6fe;
        margin-bottom: 3px;
      }
      .attribution-desc {
        font-size: 12px;
        color: #a78bfa;
        line-height: 1.5;
      }
      .criteria-wrap {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid rgba(139,92,246,0.2);
      }
      .criteria-title {
        font-size: 13px;
        font-weight: 600;
        color: #ddd6fe;
        margin-bottom: 10px;
      }
      .empty-hint {
        color: #64748b;
        font-size: 12px;
        text-align: center;
        padding: 20px;
      }

      /* 策略输出层样式 */
      .strategy-wrap {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .strategy-section {
        background: rgba(15,23,42,0.4);
        border: 1px solid rgba(34,197,94,0.2);
        border-radius: 10px;
        padding: 14px;
      }
      .strategy-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #86efac;
        margin-bottom: 10px;
      }
      .output-list, .next-list {
        margin: 0;
        padding-left: 20px;
        color: #bbf7d0;
        font-size: 13px;
        line-height: 1.8;
      }
      .dash-section {
        background: rgba(15,23,42,0.4);
        border: 1px solid rgba(34,197,94,0.2);
        border-radius: 10px;
        padding: 14px;
      }
      .dash-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #86efac;
        margin-bottom: 10px;
      }
      .dash-links {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .dash-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.15);
        border-radius: 6px;
        text-decoration: none;
        color: #86efac;
        font-size: 12px;
        transition: all 0.2s;
      }
      .dash-link:hover {
        background: rgba(34,197,94,0.15);
        border-color: rgba(34,197,94,0.3);
        transform: translateX(2px);
      }
      .dash-link-icon {
        color: #22c55e;
        font-weight: bold;
      }
      .dash-link-text { flex: 1; }
      .dash-link-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 12px;
        background: rgba(34,197,94,0.08);
        border: 1px solid rgba(34,197,94,0.15);
        border-radius: 6px;
      }
      .dash-link-main {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        flex: 1 1 160px;
        color: #86efac;
        font-size: 12px;
      }
      .dash-link-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .dash-action {
        text-decoration: none;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(34,197,94,0.35);
        color: #bbf7d0;
        background: rgba(15,23,42,0.45);
        white-space: nowrap;
      }
      .dash-action:hover {
        border-color: rgba(34,197,94,0.65);
        background: rgba(34,197,94,0.18);
      }
      .dash-action-kg {
        border-color: rgba(56,189,248,0.45);
        color: #7dd3fc;
      }
      .dash-action-kg:hover {
        border-color: rgba(56,189,248,0.75);
        background: rgba(14,116,144,0.25);
      }

      .kg-section {
        background: linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(59,130,246,0.1) 100%);
        border: 1px solid rgba(34,197,94,0.25);
        border-radius: 10px;
        padding: 14px;
      }
      .kg-section-title {
        font-size: 13px;
        font-weight: 600;
        color: #86efac;
        margin-bottom: 10px;
      }
      .kg-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        background: rgba(15,23,42,0.5);
        border: 1px solid rgba(34,197,94,0.2);
        border-radius: 8px;
        text-decoration: none;
        color: #e2e8f0;
        transition: all 0.2s;
      }
      .kg-link:hover {
        background: rgba(34,197,94,0.1);
        border-color: rgba(34,197,94,0.4);
        transform: translateX(2px);
      }
      .kg-link-icon { font-size: 18px; }
      .kg-link-text { flex: 1; font-size: 13px; font-weight: 500; }
      .kg-link-arrow { color: #22c55e; font-size: 16px; }

      /* 触发条件样式调整 */
      .trigger-section {
        background: rgba(15,23,42,0.4);
        border: 1px solid rgba(71,85,105,0.3);
        border-radius: 10px;
        padding: 14px 18px;
      }
      .trigger-section .section-title {
        margin-top: 0;
        font-size: 14px;
      }
      .trigger-list {
        margin: 8px 0 0;
        padding-left: 20px;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.8;
      }

      /* 响应式 */
      @media (max-width: 768px) {
        .layer-header-bar {
          padding: 12px 14px;
        }
        .layer-body {
          padding: 12px 14px;
        }
        .layer-number {
          width: 32px;
          height: 32px;
          font-size: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function selectPlaybook(id) {
    activeId = id;
    activeToolboxId = null;
    const p = PLAYBOOKS.find(x => x.id === id);
    renderSidebar(searchInput.value);
    renderDetail(p);
    history.replaceState(null, "", `#${id}`);
  }

  function selectToolboxMethod(id) {
    activeToolboxId = id;
    renderSidebar(searchInput.value);
    if (window.AnalysisToolboxUI?.renderMethodDetail) {
      window.AnalysisToolboxUI.renderMethodDetail("detail-panel", id);
    }
    history.replaceState(null, "", `#toolbox-${id}`);
    sidebar.classList.remove("open");
  }

  searchInput.addEventListener("input", () => renderSidebar(searchInput.value));
  mobileToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

  function normalizeMethodHash(raw) {
    let hash = String(raw || "").replace(/^#/, "");
    if (hash.startsWith("playbook/")) hash = hash.slice(9);
    return hash;
  }

  function applyMethodHash() {
    const hash = normalizeMethodHash(location.hash);
    if (hash.startsWith("toolbox-")) {
      activeToolboxId = hash.slice(8);
      selectToolboxMethod(activeToolboxId);
      return true;
    }
    if (hash && PLAYBOOKS.some((p) => p.id === hash)) {
      selectPlaybook(hash);
      return true;
    }
    return false;
  }

  function initPage() {
    if (!applyMethodHash()) {
      renderSidebar();
      selectPlaybook(activeId);
    }
  }

  window.addEventListener("hashchange", () => {
    applyMethodHash();
  });

  async function boot() {
    await loadDashCatalog();
    initPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
