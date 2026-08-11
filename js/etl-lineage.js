/**
 * ETL 调度与 A→B 变换边 · 共用渲染
 * 数据：window.ETL_LINEAGE（各行业 etl-lineage-data.js）
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function engineLabel(e) {
    return ({ python: "Python", sql: "SQL", view: "视图", manual: "说明" })[e] || e || "—";
  }

  /** 默认仓库（行业 data.repo 可覆盖） */
  const DEFAULT_REPO = {
    baseUrl: "https://github.com/littlehuihuihui/financial-data-portfolio",
    branch: "main",
    provider: "github",
    // 发布仓根目录即原 portfolio/ 内容
    stripPrefix: "portfolio/",
    rewrites: {
      "retail-finance-analysis/scripts/": "industries/retail/scripts/",
      "retail-finance-analysis/sql6_portfolio_model/": "industries/retail/sql6_portfolio_model/",
    },
  };

  function normalizeCodePath(repo, codePath) {
    let p = String(codePath || "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
    if (!p || p === "—") return "";
    const strip = repo.stripPrefix || "";
    if (strip && p.startsWith(strip)) p = p.slice(strip.length);
    const rewrites = repo.rewrites || {};
    Object.keys(rewrites).forEach((from) => {
      if (p.startsWith(from)) p = rewrites[from] + p.slice(from.length);
    });
    return p;
  }

  /**
   * @returns {string|null}
   */
  function buildRepoFileUrl(repo, codePath, edge) {
    if (!repo || !repo.baseUrl) return null;
    const path = normalizeCodePath(repo, codePath);
    if (!path) return null;
    const base = String(repo.baseUrl).replace(/\/+$/, "");
    const branch = encodeURIComponent(repo.branch || "main");
    const encodedPath = path
      .split("/")
      .map((seg) => encodeURIComponent(seg))
      .join("/");
    const provider = (repo.provider || "github").toLowerCase();
    let url =
      provider === "gitlab"
        ? `${base}/-/blob/${branch}/${encodedPath}`
        : `${base}/blob/${branch}/${encodedPath}`;
    const start = edge && (edge.line_start || edge.lineStart);
    const end = edge && (edge.line_end || edge.lineEnd);
    if (start) {
      url += end && Number(end) !== Number(start) ? `#L${start}-L${end}` : `#L${start}`;
    }
    return url;
  }

  function renderCodePath(edge, repo) {
    const raw = edge.code_path || "—";
    const url = buildRepoFileUrl(repo, raw, edge);
    if (!url) {
      return `<code class="etl-code-path">${esc(raw)}</code>`;
    }
    return (
      `<a class="etl-code-path etl-code-path-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">` +
      `<code>${esc(raw)}</code></a>` +
      `<a class="etl-repo-open" href="${esc(url)}" target="_blank" rel="noopener noreferrer">在仓库中打开</a>`
    );
  }

  class EtlLineageUI {
    constructor(rootId) {
      this.root = document.getElementById(rootId);
      if (!this.root) return;
      this.data = window.ETL_LINEAGE || { jobs: [], edges: [], note: "" };
      this.repo = Object.assign({}, DEFAULT_REPO, this.data.repo || {});
      this.state = {
        filter: "",
        engine: "all",
        layer: "all",
        selectedId: (this.data.edges && this.data.edges[0] && this.data.edges[0].id) || null,
      };
      this.render();
      this.bind();
    }

    filteredEdges() {
      const q = this.state.filter.trim().toLowerCase();
      return (this.data.edges || []).filter((e) => {
        if (this.state.engine !== "all" && e.engine !== this.state.engine) return false;
        if (this.state.layer !== "all") {
          if (e.layer_from !== this.state.layer && e.layer_to !== this.state.layer) return false;
        }
        if (!q) return true;
        const blob = [
          e.from_table, e.to_table, e.job_name, e.code_path, e.entry,
          e.computation, e.sql_excerpt, e.engine, e.grain,
        ].join(" ").toLowerCase();
        return blob.includes(q);
      });
    }

    selectedEdge() {
      const list = this.filteredEdges();
      let edge = list.find((e) => e.id === this.state.selectedId);
      if (!edge) edge = list[0] || null;
      if (edge) this.state.selectedId = edge.id;
      return edge;
    }

    renderJobs() {
      const jobs = this.data.jobs || [];
      if (!jobs.length) return "<p class='etl-empty'>暂无调度任务</p>";
      return `
        <div class="table-wrap">
          <table class="data-table etl-jobs-table">
            <thead><tr><th>任务</th><th>执行频率</th><th>说明</th></tr></thead>
            <tbody>
              ${jobs.map((j) => `
                <tr>
                  <td>${esc(j.name)}</td>
                  <td>${esc(j.schedule)}</td>
                  <td>${esc(j.description)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>`;
    }

    renderList(edges) {
      if (!edges.length) {
        return `<div class="etl-edge-empty">无匹配变换边</div>`;
      }
      return edges.map((e) => {
        const active = e.id === this.state.selectedId ? "is-active" : "";
        return `
          <button type="button" class="etl-edge-item ${active}" data-edge-id="${esc(e.id)}">
            <span class="etl-edge-pair"><code>${esc(e.from_table)}</code><span class="etl-arrow">→</span><code>${esc(e.to_table)}</code></span>
            <span class="etl-edge-meta">
              <span class="etl-engine-tag etl-engine-${esc(e.engine)}">${esc(engineLabel(e.engine))}</span>
              <span class="etl-layer-tag">${esc(e.layer_from)}→${esc(e.layer_to)}</span>
            </span>
          </button>`;
      }).join("");
    }

    renderDetail(edge) {
      if (!edge) {
        return `<div class="etl-detail-empty">请选择左侧 A→B 变换边</div>`;
      }
      return `
        <div class="etl-detail-header">
          <h5 class="etl-detail-title"><code>${esc(edge.from_table)}</code> → <code>${esc(edge.to_table)}</code></h5>
          <div class="etl-detail-badges">
            <span class="etl-engine-tag etl-engine-${esc(edge.engine)}">${esc(engineLabel(edge.engine))}</span>
            <span class="etl-layer-tag">${esc(edge.layer_from)} → ${esc(edge.layer_to)}</span>
          </div>
        </div>
        <dl class="etl-detail-dl">
          <dt>调度任务</dt><dd>${esc(edge.job_name || "—")} · ${esc(edge.schedule || "—")}</dd>
          <dt>目标粒度</dt><dd>${esc(edge.grain || "—")}</dd>
          <dt>代码路径</dt>
          <dd>${renderCodePath(edge, this.repo)}
            ${edge.entry ? `<div class="etl-entry">入口：<code>${esc(edge.entry)}</code></div>` : ""}
          </dd>
          <dt>怎么计算</dt><dd class="etl-computation">${esc(edge.computation || "—")}</dd>
          <dt>逻辑摘要</dt>
          <dd>${edge.sql_excerpt
            ? `<pre class="etl-sql-excerpt">${esc(edge.sql_excerpt)}</pre>`
            : "—"}</dd>
        </dl>
        <p class="etl-detail-hint">完整实现以仓库文件为准；本面板只记录落点与口径摘要，便于溯源。</p>`;
    }

    renderUsage() {
      const u = this.data.usage || {};
      const trace = u.trace || "看板指标异常时，从 ADS 定位维度 → 下钻 DWS → 回查 DWD → 对比 ODS；上表可查看对应 A→B 的代码落点。";
      const impact = u.impact || "改 ETL 或口径前查下游看板；变更后按调度任务重跑灌数并回归 API。";
      return `
        <h4>血缘应用：问题溯源与变更影响</h4>
        <p class="lineage-usage"><strong>问题溯源</strong>：${esc(trace)}</p>
        <p class="lineage-usage"><strong>变更影响</strong>：${esc(impact)}</p>`;
    }

    render() {
      const edges = this.filteredEdges();
      const edge = this.selectedEdge();
      this.root.innerHTML = `
        <h4>ETL调度策略</h4>
        ${this.renderJobs()}
        ${this.data.note ? `<p class="etl-impl-note">${esc(this.data.note)}</p>` : ""}

        <h4>表级变换（A → B）</h4>
        <p class="etl-section-desc">选择一条边查看：代码在哪个文件、入口是什么、如何从 A 算到 B。</p>
        <div class="etl-toolbar">
          <input type="search" class="etl-search" placeholder="搜索表名 / 路径 / 计算说明…" value="${esc(this.state.filter)}" />
          <select class="etl-filter-engine" aria-label="引擎">
            <option value="all"${this.state.engine === "all" ? " selected" : ""}>全部引擎</option>
            <option value="python"${this.state.engine === "python" ? " selected" : ""}>Python</option>
            <option value="sql"${this.state.engine === "sql" ? " selected" : ""}>SQL</option>
            <option value="view"${this.state.engine === "view" ? " selected" : ""}>视图</option>
          </select>
          <select class="etl-filter-layer" aria-label="层级">
            <option value="all"${this.state.layer === "all" ? " selected" : ""}>全部层级</option>
            ${["ODS", "DIM", "DWD", "DWS", "ADS"].map((l) =>
              `<option value="${l}"${this.state.layer === l ? " selected" : ""}>${l}</option>`
            ).join("")}
          </select>
        </div>
        <div class="etl-master-detail">
          <div class="etl-edge-list">${this.renderList(edges)}</div>
          <div class="etl-edge-detail">${this.renderDetail(edge)}</div>
        </div>

        ${this.renderUsage()}
      `;
    }

    bind() {
      this.root.addEventListener("input", (e) => {
        if (e.target.classList.contains("etl-search")) {
          this.state.filter = e.target.value;
          this.render();
        }
      });
      this.root.addEventListener("change", (e) => {
        if (e.target.classList.contains("etl-filter-engine")) {
          this.state.engine = e.target.value;
          this.render();
        }
        if (e.target.classList.contains("etl-filter-layer")) {
          this.state.layer = e.target.value;
          this.render();
        }
      });
      this.root.addEventListener("click", (e) => {
        const item = e.target.closest(".etl-edge-item");
        if (!item) return;
        this.state.selectedId = item.dataset.edgeId;
        this.render();
      });
    }
  }

  window.EtlLineageUI = {
    render(rootId) {
      return new EtlLineageUI(rootId);
    },
  };
})();
