/**
 * 数据字典 · 可折叠表 + 字段血缘 + 字段统计总览
 */
(function () {
  "use strict";

  const ROLE_LABELS = {
    pk: "主键", bk: "业务键", dim_key: "维度键", measure: "度量",
    audit: "审计", attr: "属性", status: "状态", hierarchy: "层级",
  };

  function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function lineageHtml(chain) {
    return (chain || []).map((n, i) =>
      `${i ? '<span class="dd-lineage-arrow">→</span>' : ""}<span class="dd-lineage-node">${esc(n)}</span>`
    ).join("");
  }

  function downstreamText(t) {
    const d = t.downstream;
    if (Array.isArray(d)) return d.join("、");
    return String(d ?? "");
  }

  function renderOverview() {
    const rows = window.WAREHOUSE_FIELD_OVERVIEW || [];
    if (!rows.length) return "";

    const byLayer = {};
    rows.forEach((r) => {
      byLayer[r.layer] = byLayer[r.layer] || { total: 0, ok: 0, tables: 0 };
      byLayer[r.layer].tables += 1;
      byLayer[r.layer].total += r.field_count;
      if (r.quality_status === "达标") byLayer[r.layer].ok += 1;
    });

    const summary = Object.entries(byLayer).map(([layer, s]) =>
      `<span class="dd-overview-chip dd-layer-${esc(layer)}">${esc(layer)} ${s.tables}表 · ${s.total}字段 · ${s.ok}/${s.tables}达标</span>`
    ).join("");

    const tbody = rows.map((r) => `
      <tr class="${r.quality_status === "达标" ? "dd-row-ok" : "dd-row-warn"}">
        <td><span class="dd-layer-badge dd-layer-${esc(r.layer)}">${esc(r.layer)}</span></td>
        <td><code>${esc(r.table_name)}</code></td>
        <td class="dd-num">${r.field_count}</td>
        <td>${esc(r.target_range)}</td>
        <td>${esc(r.quality_status)}</td>
      </tr>`).join("");

    return `
      <div class="dd-overview-panel">
        <h4>数仓字段统计总览 <span class="dd-overview-meta">（对应 <code>v_warehouse_field_overview</code>）</span></h4>
        <div class="dd-overview-chips">${summary}</div>
        <div class="table-wrap dd-overview-table-wrap">
          <table class="dd-fields-table dd-overview-table">
            <thead><tr><th>层级</th><th>表/视图</th><th>字段数</th><th>目标范围</th><th>质量</th></tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </div>
      </div>`;
  }

  function renderTable(t, openByDefault) {
    const fc = t.field_count || (t.fields || []).length;
    const fields = (t.fields || []).map((f) => {
      const fk = `${t.name}.${f.name}`;
      const role = ROLE_LABELS[f.role] || f.role || "";
      return `<tr>
        <td><span class="dd-field-link" data-field-key="${esc(fk)}">${esc(f.name)}</span></td>
        <td>${esc(f.type)}</td>
        <td><span class="dd-role-tag dd-role-${esc(f.role || "attr")}">${esc(role)}</span></td>
        <td>${esc(f.desc)}</td>
      </tr>`;
    }).join("");

    return `
      <div class="dd-table-item${openByDefault ? " open" : ""}" id="dd-${esc(t.name)}" data-layer="${esc(t.layer)}">
        <div class="dd-table-head" role="button" tabindex="0" aria-expanded="${openByDefault}">
          <span class="dd-layer-badge dd-layer-${esc(t.layer.replace(/&/g, ""))}">${esc(t.layer)}</span>
          <span class="dd-table-name">${esc(t.name)}</span>
          <span class="dd-field-count-badge">${fc} 字段</span>
          <span class="dd-table-purpose">${esc(t.purpose)}</span>
          <span class="dd-chevron">▶</span>
        </div>
        <div class="dd-table-body">
          <dl class="dd-meta-grid">
            <div><dt>用途</dt><dd>${esc(t.purpose)}</dd></div>
            <div><dt>数据来源</dt><dd>${esc(t.source)}</dd></div>
            <div><dt>下游依赖</dt><dd>${esc(downstreamText(t))}</dd></div>
            <div><dt>对象类型</dt><dd>${esc(t.type || "table")} · ${fc} 字段</dd></div>
          </dl>
          <p><strong>表级血缘</strong></p>
          <div class="dd-lineage-flow">${lineageHtml(t.lineage)}</div>
          <table class="dd-fields-table">
            <thead><tr><th>字段名</th><th>类型</th><th>角色</th><th>业务含义</th></tr></thead>
            <tbody>${fields}</tbody>
          </table>
        </div>
      </div>`;
  }

  function render(rootId) {
    const root = document.getElementById(rootId);
    if (!root || !window.DATA_DICTIONARY) return;

    root.innerHTML = `
      ${renderOverview()}
      <div class="dd-toolbar">
        <input type="search" class="dd-field-search" id="dd-filter" placeholder="筛选表名或字段…">
        <select id="dd-layer-filter">
          <option value="">全部层级</option>
          <option value="ODS">ODS</option>
          <option value="DWD">DWD</option>
          <option value="DWS">DWS</option>
          <option value="ADS">ADS</option>
        </select>
        <span class="dd-toolbar-count" id="dd-count"></span>
      </div>
      <div id="field-lineage-panel" class="dd-field-lineage-panel" aria-live="polite"></div>
      <div id="dd-list"></div>`;

    const list = root.querySelector("#dd-list");
    const panel = root.querySelector("#field-lineage-panel");
    const countEl = root.querySelector("#dd-count");

    function draw(filter, layer) {
      const kw = (filter || "").toLowerCase();
      const items = window.DATA_DICTIONARY.filter((t) => {
        if (layer && t.layer !== layer) return false;
        if (!kw) return true;
        const hay = (t.name + t.purpose + (t.fields || []).map((f) => f.name + f.business + f.role).join(" ")).toLowerCase();
        return hay.includes(kw);
      });
      list.innerHTML = items.map((t) => renderTable(t, false)).join("");
      const totalFields = items.reduce((s, t) => s + (t.field_count || (t.fields || []).length), 0);
      countEl.textContent = `${items.length} 张表/视图 · ${totalFields} 个字段`;
      bindEvents();
    }

    function showFieldLineage(key) {
      const path = window.FIELD_LINEAGE?.[key];
      if (!path) {
        panel.classList.remove("show");
        panel.innerHTML = `<span class="dd-no-lineage">暂无「${esc(key)}」的预置血缘路径；可在 <code>field_lineage</code> 表补充。</span>`;
        panel.classList.add("show");
        return;
      }
      panel.innerHTML = `<strong>字段血缘 · ${esc(key)}</strong><div class="dd-lineage-flow" style="margin-top:8px">${lineageHtml(path)}</div>`;
      panel.classList.add("show");
      panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function bindEvents() {
      list.querySelectorAll(".dd-table-head").forEach((head) => {
        head.addEventListener("click", () => {
          head.parentElement.classList.toggle("open");
        });
      });
      list.querySelectorAll(".dd-field-link").forEach((el) => {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          showFieldLineage(el.dataset.fieldKey);
        });
      });
    }

    root.querySelector("#dd-filter").addEventListener("input", (e) => {
      draw(e.target.value, root.querySelector("#dd-layer-filter").value);
    });
    root.querySelector("#dd-layer-filter").addEventListener("change", (e) => {
      draw(root.querySelector("#dd-filter").value, e.target.value);
    });

    draw("", "");

    return {
      highlightField: showFieldLineage,
      openTable: (name) => {
        const el = document.getElementById(`dd-${name}`);
        if (el) { el.classList.add("open"); el.scrollIntoView({ behavior: "smooth" }); }
      },
    };
  }

  window.DataDictionaryUI = { render };
})();
