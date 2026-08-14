/**
 * 数仓分层全景图 · 交互式组件
 * 功能：分层泳道 + 可点击表卡片 + SVG流向连线 + 侧边栏详情 + 行业切换 + 搜索
 *      + 字段数据复用 + 连线防重叠 + 分层筛选 + 表类型筛选 + 缩放拖拽 + 导出图片
 *      + 键盘快捷键 + 统计计数 + 流动动画
 */
class DWArchitecture {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('DWArchitecture: container not found', containerId);
      return;
    }

    this.data = window.DW_ARCHITECTURE_DATA || {};
    this.currentIndustry = options.defaultIndustry || 'internet';
    this.showIndustrySwitch = options.showIndustrySwitch !== false;
    this.selectedTable = null;
    this.searchKeyword = '';
    this.highlightedTables = new Set();
    /** 连线模式：layer 层间主箭头 | focus 选中表上下游 | full 全量血缘 */
    this.flowMode = options.flowMode || 'layer';
    /** 左侧 DIM 侧栏：默认关闭（主链路仅 ODS→DWD→DWS→ADS） */
    this.showDimRail = options.showDimRail === true;
    this.dimRailCollapsed = options.dimRailCollapsed === true;
    this.legendOpen = false;
    this.openDimCategories = new Set();
    
    // 筛选状态（无侧栏时不含 dim，避免「筛了但不显示」）
    this.layerFilter = this.defaultLayerFilter();
    this.typeFilter = new Set(['table', 'view']);
    
    // 缩放状态
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.init();
  }

  defaultLayerFilter() {
    return this.showDimRail
      ? new Set(['ods', 'dim', 'dwd', 'dws', 'ads'])
      : new Set(['ods', 'dwd', 'dws', 'ads']);
  }

  init() {
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => {
      this.fitView();
      /* 等 transform 生效后再量坐标，避免线错位 */
      requestAnimationFrame(() => this.drawFlows());
    });
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this.drawFlows(), 200);
    });
    
    this._keyHandler = (e) => this.handleKeydown(e);
    document.addEventListener('keydown', this._keyHandler);
  }

  destroy() {
    document.removeEventListener('keydown', this._keyHandler);
  }

  render() {
    const industry = this.data[this.currentIndustry];
    if (!industry) {
      this.container.innerHTML = '<div style="padding:40px;text-align:center;color:#8892a4;">未找到行业数据</div>';
      return;
    }

    const totalTables = industry.tables.length;
    const totalFlows = industry.flows.length;
    const visibleTables = industry.tables.filter(t =>
      this.layerFilter.has(t.layer) && this.typeFilter.has(t.type)
    ).length;
    const MAIN = ['ods', 'dwd', 'dws', 'ads'];
    const dimLayer = industry.layers.find(l => l.id === 'dim');

    this.container.innerHTML = `
      <div class="dw-arch-wrapper dw-arch-v2">
        <div class="dw-arch-header">
          <div class="dw-arch-title">
            <span class="dw-arch-title-icon">◆</span>
            <span class="dw-arch-title-text">分层全景</span>
            <span class="dw-arch-subtitle">${industry.name}</span>
            <span class="dw-arch-stats">${visibleTables}/${totalTables} 表 · ${totalFlows} 流向</span>
            <span class="dw-arch-flow-chip" title="默认简线：层间主方向 ODS→DWD→DWS→ADS">ODS→DWD→DWS→ADS</span>
          </div>
          <div class="dw-arch-controls">
            ${this.showIndustrySwitch ? `
            <div class="dw-arch-industry-switch">
              ${Object.keys(this.data).map(key => `
                <button type="button" class="dw-arch-industry-btn ${key === this.currentIndustry ? 'active' : ''}" data-industry="${key}">
                  ${this.data[key].name.split('·')[0]?.trim() || key}
                </button>
              `).join('')}
            </div>` : ''}
            <div class="dw-arch-search">
              <input type="text" class="dw-arch-search-input" placeholder="搜索表名/用途… (Ctrl+F)" value="${this.searchKeyword}">
              <span class="dw-arch-search-icon">🔍</span>
            </div>
            <div class="dw-arch-filter-chips" title="分层筛选">
              ${industry.layers.filter(layer => this.showDimRail || layer.id !== 'dim').map(layer => `
                <label class="dw-arch-chip ${this.layerFilter.has(layer.id) ? 'on' : ''}">
                  <input type="checkbox" data-layer-filter="${layer.id}" ${this.layerFilter.has(layer.id) ? 'checked' : ''} hidden>
                  <span class="dw-arch-filter-dot" style="background:${layer.color}"></span>${layer.name}
                </label>
              `).join('')}
              <label class="dw-arch-chip ${this.typeFilter.has('table') ? 'on' : ''}">
                <input type="checkbox" data-type-filter="table" ${this.typeFilter.has('table') ? 'checked' : ''} hidden>表
              </label>
              <label class="dw-arch-chip ${this.typeFilter.has('view') ? 'on' : ''}">
                <input type="checkbox" data-type-filter="view" ${this.typeFilter.has('view') ? 'checked' : ''} hidden>视图
              </label>
            </div>
            <button type="button" class="dw-arch-flow-mode-btn ${this.flowMode === 'full' ? 'active' : ''}" data-flow-toggle="full" title="显示全部表级血缘">
              ${this.flowMode === 'full' ? '简线' : '全量血缘'}
            </button>
            <div class="dw-arch-zoom-controls">
              <button type="button" class="dw-arch-zoom-btn" data-zoom="out" title="缩小">−</button>
              <span class="dw-arch-zoom-level">${Math.round(this.scale * 100)}%</span>
              <button type="button" class="dw-arch-zoom-btn" data-zoom="in" title="放大">+</button>
              <button type="button" class="dw-arch-zoom-btn" data-zoom="fit" title="适应视图">⤢</button>
              <button type="button" class="dw-arch-zoom-btn" data-zoom="reset" title="重置">⟲</button>
            </div>
            <div class="dw-arch-legend-wrap">
              <button type="button" class="dw-arch-legend-btn" data-legend-toggle title="图例与读线说明">ⓘ</button>
              <div class="dw-arch-legend-pop ${this.legendOpen ? 'open' : ''}" id="dwArchLegendPop">
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-line"></span>层间主流向（简线）</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-line dashed"></span>维度关联</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-ods,#64748b)"></span>ODS 贴源</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-dwd,#14b8a6)"></span>DWD 明细</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-dws,#f59e0b)"></span>DWS 汇总</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-ads,#8b5cf6)"></span>ADS 应用</div>
                <p class="dw-arch-legend-tip">简线 = 层间左→右主方向，不是表对表。点表看上下游；「全量血缘」展开表级连线。DIM 见数据字典。</p>
              </div>
            </div>
            <button type="button" class="dw-arch-more-btn" data-more-toggle title="更多">⋯</button>
            <div class="dw-arch-more-menu" id="dwArchMoreMenu" hidden>
              <button type="button" class="dw-arch-export-btn" data-action="export">导出说明</button>
              <button type="button" class="dw-arch-reset-btn" data-action="reset">重置视图</button>
            </div>
          </div>
        </div>

        <div class="dw-arch-body">
          ${this.showDimRail && this.layerFilter.has('dim') ? this.renderDimRail(industry, dimLayer) : ''}
          <div class="dw-arch-main-col">
            <div class="dw-arch-canvas" id="dwArchCanvas">
              <div class="dw-arch-canvas-inner" id="dwArchCanvasInner" style="transform: translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}); transform-origin: 0 0;">
                <svg class="dw-arch-flows-svg" id="dwArchFlowsSvg">
                  <defs>
                    <filter id="arrow-glow" x="-80%" y="-80%" width="260%" height="260%">
                      <feGaussianBlur stdDeviation="2.2" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    <filter id="arrow-soft" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3.5" result="blur"/>
                      <feMerge>
                        <feMergeNode in="blur"/>
                      </feMerge>
                    </filter>
                    <linearGradient id="spine-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
                      <stop offset="45%" stop-color="#22d3ee" stop-opacity="1"/>
                      <stop offset="100%" stop-color="#67e8f9" stop-opacity="1"/>
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="16" markerHeight="12" refX="14" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                      <path d="M1 1 L14 6 L1 11 L3.5 6 Z" fill="#67e8f9" stroke="#e0f2fe" stroke-width="0.8" stroke-linejoin="round"/>
                    </marker>
                    <marker id="arrowhead-dim" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                      <path d="M1 1 L11 5 L1 9 L2.8 5 Z" fill="#94a3b8" opacity="0.9" stroke="#cbd5e1" stroke-width="0.5" stroke-linejoin="round"/>
                    </marker>
                  </defs>
                </svg>
                <div class="dw-arch-lanes dw-arch-lanes-main">
                  ${MAIN.filter(id => this.layerFilter.has(id)).map(id => {
                    const layer = industry.layers.find(l => l.id === id);
                    if (!layer) return '';
                    return this.renderMainLane(industry, layer);
                  }).join('')}
                </div>
              </div>
            </div>
            <aside class="dw-arch-detail-inline" id="dwArchSidebar">
              <div class="dw-arch-sidebar-panel" id="dwArchSidebarPanel">
                <button type="button" class="dw-arch-sidebar-close" id="dwArchSidebarClose" title="关闭">×</button>
                <div id="dwArchSidebarContent">
                  <div class="dw-arch-detail-empty">点击主链路中的表卡片查看详情</div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    `;
  }

  renderDimRail(industry, dimLayer) {
    const tables = industry.tables.filter(t =>
      t.layer === 'dim' && this.typeFilter.has(t.type)
    );
    const groups = this.groupByCategory(tables);
    const color = dimLayer?.color || 'var(--layer-dim,#6366f1)';
    const collapsed = this.dimRailCollapsed;

    if (!this._dimCatsInit && groups.length) {
      this.openDimCategories = new Set([groups[0][0]]);
      this._dimCatsInit = true;
    }

    return `
      <aside class="dw-arch-dim-rail ${collapsed ? 'is-collapsed' : ''}" data-layer="dim">
        <div class="dw-arch-dim-rail-head" style="border-color:${color}">
          <button type="button" class="dw-arch-dim-toggle" data-dim-toggle title="${collapsed ? '展开 DIM' : '折叠 DIM'}">
            ${collapsed ? '▶' : '◀'}
          </button>
          <div class="dw-arch-dim-titles">
            <span class="dw-arch-lane-name" style="color:${color}">DIM</span>
            ${!collapsed ? `<span class="dw-arch-lane-fullname">${dimLayer?.fullName || '维度层'}</span>` : ''}
            <span class="dw-arch-lane-count">${tables.length}</span>
          </div>
        </div>
        ${collapsed ? '' : `
        <div class="dw-arch-dim-rail-body">
          <p class="dw-arch-dim-hint">维度挂载 · 不占主链路</p>
          ${groups.map(([cat, list]) => {
            const isOpen = this.openDimCategories.has(cat);
            return `
              <div class="dw-arch-dim-group ${isOpen ? 'is-open' : ''}" data-dim-cat="${this.escAttr(cat)}">
                <button type="button" class="dw-arch-dim-group-head" data-dim-cat-toggle="${this.escAttr(cat)}">
                  <span>${this.escHtml(cat)}</span>
                  <span class="dw-arch-lane-count">${list.length}</span>
                </button>
                <div class="dw-arch-dim-group-body">
                  ${list.map(t => this.renderTableCard(t, dimLayer || { id: 'dim', color })).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>`}
      </aside>`;
  }

  renderMainLane(industry, layer) {
    const layerTables = industry.tables.filter(t =>
      t.layer === layer.id && this.typeFilter.has(t.type)
    );
    return `
      <div class="dw-arch-lane dw-arch-lane-main" data-layer="${layer.id}" style="--lane-tint:${layer.color}">
        <div class="dw-arch-lane-header" style="border-left-color: ${layer.color}">
          <div class="dw-arch-lane-title-row">
            <span class="dw-arch-lane-name" style="color: ${layer.color}">${layer.name}</span>
            <span class="dw-arch-lane-fullname">${layer.fullName}</span>
            <span class="dw-arch-lane-count">${layerTables.length}</span>
          </div>
          <div class="dw-arch-lane-desc">${layer.desc}</div>
        </div>
        <div class="dw-arch-lane-tables" id="dwArchLane_${layer.id}">
          ${layerTables.map(table => this.renderTableCard(table, layer)).join('')}
        </div>
      </div>`;
  }

  groupByCategory(tables) {
    const map = new Map();
    tables.forEach(t => {
      const cat = t.category || '其他';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(t);
    });
    return Array.from(map.entries());
  }

  escHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  escAttr(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /** 调度周期：表字段 → ETL 边 → 层默认 */
  resolveSchedule(table) {
    if (!table) return '';
    if (table.schedule) return table.schedule;
    const etl = window.ETL_LINEAGE;
    if (etl?.edges?.length) {
      const hit = etl.edges.find((e) => e.to_table === table.name || e.to_table === table.id);
      if (hit?.schedule) return hit.schedule;
    }
    const defaults = { ods: 'T+1 灌入', dim: 'T+1', dwd: 'T+1', dws: 'T+1', ads: '实时' };
    return defaults[table.layer] || 'T+1';
  }

  scheduleBadgeClass(schedule) {
    const s = String(schedule || '');
    if (/实时|流式|秒级/.test(s)) return 'is-realtime';
    if (/按需|重建/.test(s)) return 'is-ondemand';
    return 'is-batch';
  }

  getMetricsForTable(tableName) {
    const cal = window.METRIC_CALIBER;
    if (!cal || typeof cal !== 'object') return [];
    return Object.entries(cal)
      .filter(([, m]) => m && (m.source_table === tableName || (m.source_tables || []).includes(tableName)))
      .slice(0, 6)
      .map(([id, m]) => ({ id, ...m }));
  }

  renderTableCard(table, layer) {
    const isHighlighted = this.highlightedTables.has(table.id);
    const isSelected = this.selectedTable === table.id;
    const matchesSearch = !this.searchKeyword ||
      table.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      (table.purpose || '').toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      (table.sourceSystem || '').toLowerCase().includes(this.searchKeyword.toLowerCase());

    const schedule = this.resolveSchedule(table);
    const srcType = table.sourceType || '';
    const srcSys = table.sourceSystem || '';

    return `
      <div class="dw-arch-table-card ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${!matchesSearch ? 'dimmed' : ''}"
           data-table-id="${table.id}"
           data-layer="${layer.id}"
           style="--layer-color: ${layer.color}">
        <div class="dw-arch-table-name-cn">${this.escHtml(table.purpose || table.name_cn || table.name)}</div>
        <div class="dw-arch-table-name-en">${this.escHtml(table.name)}</div>
        ${srcSys ? `<div class="dw-arch-table-source" title="${this.escAttr(srcSys)}"><span class="dw-arch-source-type">${this.escHtml(srcType || '数据源')}</span> ${this.escHtml(srcSys)}</div>` : ''}
        <div class="dw-arch-table-meta">
          <span class="dw-arch-table-field-count">${table.fieldCount} 字段</span>
          ${schedule ? `<span class="dw-arch-schedule-badge ${this.scheduleBadgeClass(schedule)}" title="ETL 调度周期">${this.escHtml(schedule)}</span>` : ''}
          <span class="dw-arch-table-type-dot ${table.type}" title="${table.type === 'view' ? '视图' : '表'}"></span>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.dw-arch-industry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const industry = e.target.dataset.industry;
        if (industry !== this.currentIndustry) {
          this.switchIndustry(industry);
        }
      });
    });

    const searchInput = this.container.querySelector('.dw-arch-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        this.handleSearch();
      });
    }

    const resetBtn = this.container.querySelector('.dw-arch-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetView());
    }

    const flowToggle = this.container.querySelector('[data-flow-toggle]');
    if (flowToggle) {
      flowToggle.addEventListener('click', () => {
        if (this.flowMode === 'full') {
          this.flowMode = this.selectedTable ? 'focus' : 'layer';
        } else {
          this.flowMode = 'full';
        }
        this.refresh({ keepTransform: true });
      });
    }

    const exportBtn = this.container.querySelector('.dw-arch-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportImage());
    }

    const legendBtn = this.container.querySelector('[data-legend-toggle]');
    const legendPop = this.container.querySelector('#dwArchLegendPop');
    if (legendBtn && legendPop) {
      legendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.legendOpen = !this.legendOpen;
        legendPop.classList.toggle('open', this.legendOpen);
      });
    }

    const moreBtn = this.container.querySelector('[data-more-toggle]');
    const moreMenu = this.container.querySelector('#dwArchMoreMenu');
    if (moreBtn && moreMenu) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.hidden = !moreMenu.hidden;
      });
    }

    const dimToggle = this.container.querySelector('[data-dim-toggle]');
    if (dimToggle) {
      dimToggle.addEventListener('click', () => {
        this.dimRailCollapsed = !this.dimRailCollapsed;
        this.refresh({ keepTransform: true });
      });
    }

    this.container.querySelectorAll('[data-dim-cat-toggle]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.dimCatToggle;
        if (this.openDimCategories.has(cat)) this.openDimCategories.delete(cat);
        else this.openDimCategories.add(cat);
        this.refresh({ keepTransform: true });
      });
    });

    this.container.querySelectorAll('.dw-arch-zoom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleZoom(e.currentTarget.dataset.zoom);
      });
    });

    this.container.querySelectorAll('[data-layer-filter]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const layer = e.target.dataset.layerFilter;
        if (e.target.checked) this.layerFilter.add(layer);
        else this.layerFilter.delete(layer);
        const chip = e.target.closest('.dw-arch-chip');
        if (chip) chip.classList.toggle('on', e.target.checked);
        this.refresh({ keepTransform: true });
      });
    });

    this.container.querySelectorAll('[data-type-filter]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const type = e.target.dataset.typeFilter;
        if (e.target.checked) this.typeFilter.add(type);
        else this.typeFilter.delete(type);
        const chip = e.target.closest('.dw-arch-chip');
        if (chip) chip.classList.toggle('on', e.target.checked);
        this.refresh({ keepTransform: true });
      });
    });

    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.addEventListener('click', (e) => {
        this.selectTable(e.currentTarget.dataset.tableId);
      });
    });

    const closeBtn = this.container.querySelector('#dwArchSidebarClose');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSidebar());

    const canvas = this.container.querySelector('#dwArchCanvas');
    if (canvas) {
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoomAt(e.offsetX, e.offsetY, delta);
      }, { passive: false });

      canvas.addEventListener('mousedown', (e) => {
        if (e.target.closest('.dw-arch-table-card')) return;
        this.isDragging = true;
        this.dragStartX = e.clientX - this.translateX;
        this.dragStartY = e.clientY - this.translateY;
        canvas.style.cursor = 'grabbing';
      });

      if (!this._docDragBound) {
        this._docDragBound = true;
        document.addEventListener('mousemove', (e) => {
          if (!this.isDragging) return;
          this.translateX = e.clientX - this.dragStartX;
          this.translateY = e.clientY - this.dragStartY;
          this.updateTransform();
        });
        document.addEventListener('mouseup', () => {
          if (this.isDragging) {
            this.isDragging = false;
            const c = this.container.querySelector('#dwArchCanvas');
            if (c) c.style.cursor = 'grab';
          }
        });
        document.addEventListener('click', () => {
          const menu = this.container.querySelector('#dwArchMoreMenu');
          if (menu) menu.hidden = true;
          if (this.legendOpen) {
            this.legendOpen = false;
            this.container.querySelector('#dwArchLegendPop')?.classList.remove('open');
          }
        });
      }
    }
  }

  refresh(opts = {}) {
    const selected = this.selectedTable;
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => {
      if (!opts.keepTransform) this.fitView();
      requestAnimationFrame(() => {
        this.drawFlows();
        if (selected) {
          this.selectedTable = selected;
          this.showSidebar(selected);
          this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.tableId === selected);
            card.classList.toggle('highlighted', this.highlightedTables.has(card.dataset.tableId));
          });
        }
      });
    });
  }

  switchIndustry(industry) {
    this.currentIndustry = industry;
    this.selectedTable = null;
    this.highlightedTables.clear();
    this.searchKeyword = '';
    this.flowMode = 'layer';
    this.openDimCategories = new Set();
    this._dimCatsInit = false;
    this.layerFilter = this.defaultLayerFilter();
    this.typeFilter = new Set(['table', 'view']);
    this.refresh();
  }

  handleSearch() {
    const keyword = this.searchKeyword.toLowerCase();
    const cards = this.container.querySelectorAll('.dw-arch-table-card');

    cards.forEach(card => {
      const tableId = card.dataset.tableId;
      const table = this.getTable(tableId);
      if (!table) return;

      const matches = !keyword ||
        table.name.toLowerCase().includes(keyword) ||
        table.purpose.toLowerCase().includes(keyword);

      card.classList.toggle('dimmed', !matches);
    });

    // 搜索时高亮上下游
    if (keyword) {
      const matchedTables = this.data[this.currentIndustry].tables.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        t.purpose.toLowerCase().includes(keyword)
      );
      if (matchedTables.length > 0 && matchedTables.length <= 5) {
        this.highlightUpstreamDownstream(matchedTables[0].id);
      }
    } else {
      this.clearHighlights();
    }
  }

  selectTable(tableId) {
    this.selectedTable = tableId;
    if (this.flowMode !== 'full') this.flowMode = 'focus';
    this.highlightUpstreamDownstream(tableId);

    // 更新卡片选中状态
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.tableId === tableId);
    });

    // 显示侧边栏
    this.showSidebar(tableId);

    // 重绘连线（高亮选中的连线）
    this.drawFlows();
  }

  highlightUpstreamDownstream(tableId) {
    this.highlightedTables.clear();
    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    // 收集所有相关表
    const related = new Set([tableId]);

    // 上游
    industry.flows.forEach(f => {
      if (f.to === tableId) related.add(f.from);
    });

    // 下游
    industry.flows.forEach(f => {
      if (f.from === tableId) related.add(f.to);
    });

    this.highlightedTables = related;

    // 更新卡片高亮
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.classList.toggle('highlighted', this.highlightedTables.has(card.dataset.tableId));
    });
  }

  clearHighlights() {
    this.highlightedTables.clear();
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.classList.remove('highlighted');
    });
    this.drawFlows();
  }

  resetView() {
    this.selectedTable = null;
    this.searchKeyword = '';
    this.flowMode = 'layer';
    this.clearHighlights();
    this.closeSidebar();
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.layerFilter = this.defaultLayerFilter();
    this.typeFilter = new Set(['table', 'view']);

    const searchInput = this.container.querySelector('.dw-arch-search-input');
    if (searchInput) searchInput.value = '';

    this.refresh();
  }

  handleZoom(action) {
    switch (action) {
      case 'in':
        this.scale = Math.min(this.scale + 0.1, 2);
        break;
      case 'out':
        this.scale = Math.max(this.scale - 0.1, 0.3);
        break;
      case 'fit':
        this.fitView();
        requestAnimationFrame(() => this.drawFlows());
        return;
      case 'reset':
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        break;
    }
    this.updateTransform();
    this.updateZoomLevel();
    requestAnimationFrame(() => this.drawFlows());
  }

  /** 默认缩放到主四列可见 */
  fitView() {
    const canvas = this.container.querySelector('#dwArchCanvas');
    const lanes = this.container.querySelector('.dw-arch-lanes-main');
    if (!canvas || !lanes) {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
      this.updateZoomLevel();
      return;
    }

    const pad = 24;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const lw = Math.max(lanes.scrollWidth, 1);
    const lh = Math.max(lanes.scrollHeight, 1);
    const scaleX = (cw - pad * 2) / lw;
    const scaleY = (ch - pad * 2) / Math.min(lh, ch * 1.4);
    this.scale = Math.max(0.35, Math.min(1, Math.min(scaleX, scaleY)));
    this.translateX = Math.max(pad, (cw - lw * this.scale) / 2);
    this.translateY = pad;
    this.updateTransform();
    this.updateZoomLevel();
  }

  zoomAt(x, y, delta) {
    const newScale = Math.max(0.3, Math.min(2, this.scale + delta));
    const scaleRatio = newScale / this.scale;
    
    // 以鼠标位置为中心缩放
    this.translateX = x - (x - this.translateX) * scaleRatio;
    this.translateY = y - (y - this.translateY) * scaleRatio;
    this.scale = newScale;
    
    this.updateTransform();
    this.updateZoomLevel();
  }

  updateTransform() {
    const inner = this.container.querySelector('#dwArchCanvasInner');
    if (inner) {
      inner.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
  }

  updateZoomLevel() {
    const levelEl = this.container.querySelector('.dw-arch-zoom-level');
    if (levelEl) {
      levelEl.textContent = Math.round(this.scale * 100) + '%';
    }
  }

  showSidebar(tableId) {
    const table = this.getTable(tableId);
    const industry = this.data[this.currentIndustry];
    if (!table || !industry) return;

    const layer = industry.layers.find(l => l.id === table.layer);
    const upstream = industry.flows.filter(f => f.to === tableId).map(f => ({
      ...f,
      table: this.getTable(f.from)
    }));
    const downstream = industry.flows.filter(f => f.from === tableId).map(f => ({
      ...f,
      table: this.getTable(f.to)
    }));
    const dashboards = industry.dashboards.filter(d =>
      d.tables.includes(tableId)
    );
    const schedule = this.resolveSchedule(table);
    const metrics = this.getMetricsForTable(table.name);
    const processPath = this.buildProcessPath(tableId, upstream, downstream);

    // 尝试从数据字典获取字段
    const dictFields = this.getFieldsFromDictionary(table.name);

    const sidebar = this.container.querySelector('#dwArchSidebar');
    const content = this.container.querySelector('#dwArchSidebarContent');

    content.innerHTML = `
      <div class="dw-arch-detail">
        <div class="dw-arch-detail-header">
          <div class="dw-arch-detail-layer-badge" style="background: ${layer?.color}">
            ${layer?.name}
          </div>
          <div class="dw-arch-detail-type-badge">
            ${table.type === 'view' ? '视图' : '表'}
          </div>
          ${schedule ? `<div class="dw-arch-detail-schedule-badge ${this.scheduleBadgeClass(schedule)}">${this.escHtml(schedule)}</div>` : ''}
        </div>
        <h3 class="dw-arch-detail-name">${this.escHtml(table.name)}</h3>
        <p class="dw-arch-detail-purpose">${this.escHtml(table.purpose || '')}</p>

        <div class="dw-arch-detail-meta">
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">字段数</span>
            <span class="dw-arch-detail-meta-value">${table.fieldCount}</span>
          </div>
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">分类</span>
            <span class="dw-arch-detail-meta-value">${this.escHtml(table.category || '')}</span>
          </div>
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">分层</span>
            <span class="dw-arch-detail-meta-value">${layer?.fullName || ''}</span>
          </div>
          ${table.sourceSystem ? `
          <div class="dw-arch-detail-meta-item dw-arch-detail-meta-wide">
            <span class="dw-arch-detail-meta-label">数据源</span>
            <span class="dw-arch-detail-meta-value">${this.escHtml(table.sourceType ? table.sourceType + ' · ' : '')}${this.escHtml(table.sourceSystem)}</span>
          </div>` : ''}
        </div>

        <!-- 加工链路 -->
        <div class="dw-arch-detail-section">
          <h4 class="dw-arch-detail-section-title">
            <span class="dw-arch-detail-section-icon">⛓</span>
            数据怎么加工来的
          </h4>
          <div class="dw-arch-detail-desc dw-arch-process-path">
            ${processPath}
          </div>
        </div>

        <!-- 表详细说明 -->
        <div class="dw-arch-detail-section">
          <h4 class="dw-arch-detail-section-title">
            <span class="dw-arch-detail-section-icon">📝</span>
            表说明
          </h4>
          <div class="dw-arch-detail-desc">
            ${this.escHtml(table.description || table.purpose || '')}
          </div>
        </div>

        <!-- 上游来源 -->
        ${upstream.length > 0 ? `
          <div class="dw-arch-detail-section">
            <h4 class="dw-arch-detail-section-title">
              <span class="dw-arch-detail-section-icon">↑</span>
              上游来源（${upstream.length}）
            </h4>
            <div class="dw-arch-detail-rel-list">
              ${upstream.map(u => `
                <div class="dw-arch-detail-rel-item" data-table-id="${u.from}">
                  <div class="dw-arch-detail-rel-name">${this.escHtml(u.table?.name || u.from)}</div>
                  <div class="dw-arch-detail-rel-label">${this.escHtml(u.label || '')}${u.schedule ? ' · ' + this.escHtml(u.schedule) : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="dw-arch-detail-section">
            <h4 class="dw-arch-detail-section-title">
              <span class="dw-arch-detail-section-icon">↑</span>
              上游来源
            </h4>
            <div class="dw-arch-detail-desc">${table.layer === 'ods'
              ? 'ODS 为贴源层，上游为外部数据源（见上方「数据源」）。'
              : '暂无已登记的上游边；可在 ETL 血缘中查看表级变换。'}</div>
          </div>
        `}

        <!-- 下游依赖 -->
        ${downstream.length > 0 ? `
          <div class="dw-arch-detail-section">
            <h4 class="dw-arch-detail-section-title">
              <span class="dw-arch-detail-section-icon">↓</span>
              下游依赖（${downstream.length}）
            </h4>
            <div class="dw-arch-detail-rel-list">
              ${downstream.map(d => `
                <div class="dw-arch-detail-rel-item" data-table-id="${d.to}">
                  <div class="dw-arch-detail-rel-name">${this.escHtml(d.table?.name || d.to)}</div>
                  <div class="dw-arch-detail-rel-label">${this.escHtml(d.label || '')}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 关键指标口径 -->
        ${metrics.length > 0 ? `
          <div class="dw-arch-detail-section">
            <h4 class="dw-arch-detail-section-title">
              <span class="dw-arch-detail-section-icon">📐</span>
              关键指标口径（${metrics.length}）
            </h4>
            <div class="dw-arch-caliber-list">
              ${metrics.map(m => `
                <div class="dw-arch-caliber-item">
                  <div class="dw-arch-caliber-label">${this.escHtml(m.label || m.id)}</div>
                  <div class="dw-arch-caliber-biz">${this.escHtml(m.business || '')}</div>
                  ${m.technical ? `<div class="dw-arch-caliber-tech"><code>${this.escHtml(m.technical)}</code></div>` : ''}
                  <div class="dw-arch-caliber-meta">刷新：${this.escHtml(m.refresh || '—')}${m.exclude_rules && m.exclude_rules !== '-' ? ' · 排除：' + this.escHtml(m.exclude_rules) : ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 关联看板 -->
        ${dashboards.length > 0 ? `
          <div class="dw-arch-detail-section">
            <h4 class="dw-arch-detail-section-title">
              <span class="dw-arch-detail-section-icon">📊</span>
              关联看板（${dashboards.length}）
            </h4>
            <div class="dw-arch-detail-dashboard-list">
              ${dashboards.map(d => `
                <div class="dw-arch-detail-dashboard-item">
                  <span class="dw-arch-detail-dashboard-icon">◆</span>
                  ${this.escHtml(d.name)}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 字段列表 -->
        <div class="dw-arch-detail-section">
          <h4 class="dw-arch-detail-section-title">
            <span class="dw-arch-detail-section-icon">📋</span>
            字段列表（${dictFields.length || table.fieldCount}）
          </h4>
          ${dictFields.length > 0 ? `
            <div class="dw-arch-detail-fields-search">
              <input type="text" class="dw-arch-fields-search-input" placeholder="搜索字段...">
            </div>
            <div class="dw-arch-detail-fields-list">
              ${dictFields.map(f => `
                <div class="dw-arch-field-item">
                  <div class="dw-arch-field-header">
                    <span class="dw-arch-field-name">${this.escHtml(f.name)}</span>
                    <span class="dw-arch-field-type">${this.escHtml(f.type)}</span>
                  </div>
                  <div class="dw-arch-field-desc">${this.escHtml(f.desc || f.business || f.comment || '暂无说明')}</div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="dw-arch-detail-fields-note">
              共 ${table.fieldCount} 个字段，完整字段请查看数据字典
            </div>
          `}
        </div>

        <!-- 跳转动作 -->
        <div class="dw-arch-detail-action">
          <button type="button" class="dw-arch-open-etl-btn" data-table-name="${this.escAttr(table.name)}">
            <span class="dw-arch-btn-icon">⚙</span>
            查看表级变换（ETL）
          </button>
          <button type="button" class="dw-arch-open-dict-btn" data-table-name="${this.escAttr(table.name)}">
            <span class="dw-arch-btn-icon">📖</span>
            在数据字典中查看
          </button>
          <button type="button" class="dw-arch-open-graph-btn" data-table-id="${this.escAttr(table.id)}" data-table-name="${this.escAttr(table.name)}">
            <span class="dw-arch-btn-icon">🕸</span>
            在知识图谱中聚焦
          </button>
        </div>
      </div>
    `;

    // 绑定上下游点击跳转
    content.querySelectorAll('.dw-arch-detail-rel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.tableId;
        if (targetId) {
          this.selectTable(targetId);
          const targetCard = this.container.querySelector(`[data-table-id="${targetId}"]`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });

    const fieldsSearch = content.querySelector('.dw-arch-fields-search-input');
    if (fieldsSearch) {
      fieldsSearch.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        content.querySelectorAll('.dw-arch-field-item').forEach(item => {
          const name = item.querySelector('.dw-arch-field-name')?.textContent?.toLowerCase() || '';
          const desc = item.querySelector('.dw-arch-field-desc')?.textContent?.toLowerCase() || '';
          item.style.display = (name.includes(keyword) || desc.includes(keyword)) ? '' : 'none';
        });
      });
    }

    const openDictBtn = content.querySelector('.dw-arch-open-dict-btn');
    if (openDictBtn) {
      openDictBtn.addEventListener('click', (e) => {
        this.navigateToDictionary(e.currentTarget.dataset.tableName);
      });
    }

    const openGraphBtn = content.querySelector('.dw-arch-open-graph-btn');
    if (openGraphBtn) {
      openGraphBtn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.tableId || e.currentTarget.dataset.tableName;
        this.navigateToGraph(id);
      });
    }

    const openEtlBtn = content.querySelector('.dw-arch-open-etl-btn');
    if (openEtlBtn) {
      openEtlBtn.addEventListener('click', (e) => {
        this.navigateToEtl(e.currentTarget.dataset.tableName);
      });
    }

    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
  }

  buildProcessPath(tableId, upstream, downstream) {
    const table = this.getTable(tableId);
    if (!table) return '—';
    if (table.layer === 'ods') {
      const src = table.sourceSystem || '外部业务系统 / 文件 / 埋点';
      return `<strong>采集</strong>：${this.escHtml(src)} → <code>${this.escHtml(table.name)}</code>（贴源 ODS）→ 再经 DWD 清洗宽表、DWS 汇总、ADS 指标封装。`;
    }
    const ups = upstream.length
      ? upstream.map(u => `<code>${this.escHtml(u.from)}</code>`).join(' + ')
      : '（上游待登记）';
    const label = upstream[0]?.label || 'ETL/聚合';
    let html = `${ups} <span class="dw-arch-path-arrow">—${this.escHtml(label)}→</span> <code>${this.escHtml(table.name)}</code>`;
    if (downstream.length) {
      html += ` <span class="dw-arch-path-arrow">→</span> ${downstream.slice(0, 3).map(d => `<code>${this.escHtml(d.to)}</code>`).join('、')}`;
      if (downstream.length > 3) html += ` 等 ${downstream.length} 个下游`;
    }
    html += `<br><span class="dw-arch-path-hint">点击下方「查看表级变换」可跳到 ETL A→B 明细与代码落点。</span>`;
    return html;
  }

  /** 跳转到架构页 ETL 表级变换，并按表名筛选 */
  navigateToEtl(tableName) {
    if (!tableName) return;
    const onArch = !!document.getElementById('etl-lineage-section') || !!document.getElementById('etl-lineage-root');
    if (onArch) {
      const sec = document.getElementById('etl-lineage-section');
      if (sec && sec.tagName === 'DETAILS') sec.open = true;
      const runFocus = () => {
        const ui = window.__etlLineageUI || window.EtlLineageUI?.instance;
        if (ui?.focusTable) ui.focusTable(tableName);
      };
      if (typeof window.openArchInteractive === 'function') {
        Promise.resolve(window.openArchInteractive('etl-lineage-section')).then(runFocus);
      } else {
        runFocus();
      }
      (sec || document.getElementById('etl-lineage-root'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const url = new URL('architecture.html', window.location.href);
    url.hash = 'etl-lineage-section';
    url.searchParams.set('etlTable', tableName);
    window.location.href = url.pathname + url.search + url.hash;
  }

  /** Step2：关闭侧栏 → 滚动到字典 → 选中同名表 */
  navigateToDictionary(tableName, fieldName) {
    if (!tableName) return;
    this.closeSidebar();

    const go = () => {
      const ui = window.DataDictionaryUI;
      if (ui?.navigateTo) {
        return ui.navigateTo(tableName, fieldName);
      }
      const section = document.getElementById('data-dictionary-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        if (ui?.selectTable) {
          ui.selectTable(tableName);
          if (fieldName && ui.selectField) ui.selectField(tableName, fieldName);
        } else if (ui?.openTable) {
          // 旧版手风琴字典
          ui.openTable(tableName);
          if (fieldName && ui.highlightField) {
            ui.highlightField(`${tableName}.${fieldName}`);
          }
        } else {
          location.hash = fieldName
            ? `dict/${tableName}/${fieldName}`
            : `dict/${tableName}`;
        }
      }, 320);
    };

    setTimeout(go, 120);
  }

  /** Step6：全景图 → 平台知识图谱辐射图 */
  navigateToGraph(tableIdOrName) {
    if (!tableIdOrName) return;
    this.closeSidebar();
    const raw = String(tableIdOrName).trim();
    const nodeId = /^(tbl|dash|metric|pb):/i.test(raw) ? raw : `tbl:${raw}`;
    setTimeout(() => {
      window.open(`platform-graph.html?node=${encodeURIComponent(nodeId)}`, "_blank", "noopener");
    }, 80);
  }

  getFieldsFromDictionary(tableName) {
    // 尝试从全局数据字典获取字段
    if (window.DATA_DICTIONARY && Array.isArray(window.DATA_DICTIONARY)) {
      const dictTable = window.DATA_DICTIONARY.find(t => 
        t.name === tableName || 
        t.name.toLowerCase() === tableName.toLowerCase()
      );
      if (dictTable && dictTable.fields) {
        return dictTable.fields;
      }
    }
    return [];
  }

  closeSidebar() {
    const sidebar = this.container.querySelector('#dwArchSidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
      sidebar.setAttribute('aria-hidden', 'true');
    }
    const content = this.container.querySelector('#dwArchSidebarContent');
    if (content) {
      content.innerHTML = '<div class="dw-arch-detail-empty">点击主链路中的表卡片查看详情</div>';
    }
    this.selectedTable = null;
    if (this.flowMode === 'focus') this.flowMode = 'layer';
    this.clearHighlights();
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.classList.remove('selected');
    });
    this.drawFlows();
  }

  getTable(tableId) {
    const industry = this.data[this.currentIndustry];
    if (!industry) return null;
    return industry.tables.find(t => t.id === tableId);
  }

  /** 画布有 CSS scale 时，把屏幕矩形换算成 SVG 本地坐标 */
  rectInSvg(el, svg) {
    const s = this.scale || 1;
    const a = el.getBoundingClientRect();
    const b = svg.getBoundingClientRect();
    return {
      left: (a.left - b.left) / s,
      right: (a.right - b.left) / s,
      top: (a.top - b.top) / s,
      bottom: (a.bottom - b.top) / s,
      centerX: ((a.left + a.right) / 2 - b.left) / s,
      centerY: ((a.top + a.bottom) / 2 - b.top) / s,
      width: a.width / s,
      height: a.height / s,
    };
  }

  drawFlows() {
    const svg = this.container.querySelector('#dwArchFlowsSvg');
    const canvas = this.container.querySelector('#dwArchCanvas');
    const inner = this.container.querySelector('#dwArchCanvasInner');
    if (!svg || !canvas || !inner) return;

    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    // SVG 与画布内容同尺寸，避免缩放/滚动后连线裁切
    const w = Math.max(inner.scrollWidth, canvas.clientWidth, 1);
    const h = Math.max(inner.scrollHeight, canvas.clientHeight, 1);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';

    svg.querySelectorAll('path, text, rect, circle, polygon, g.dw-arch-flow-node, linearGradient[id^="spine-grad-"]').forEach(p => p.remove());

    const mode = this.flowMode === 'full'
      ? 'full'
      : (this.selectedTable ? 'focus' : 'layer');

    if (mode === 'layer') {
      this.drawLayerSpine(svg, industry);
      return;
    }

    const cardPositions = {};
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      const tableId = card.dataset.tableId;
      cardPositions[tableId] = this.rectInSvg(card, svg);
    });

    let flows = industry.flows.filter(f =>
      cardPositions[f.from] && cardPositions[f.to]
    );

    if (mode === 'focus' && this.selectedTable) {
      flows = flows.filter(f =>
        f.from === this.selectedTable || f.to === this.selectedTable
      );
      if (!flows.length) this.drawLayerSpine(svg, industry);
    }

    const laneBusX = {};
    this.container.querySelectorAll('.dw-arch-lane-main').forEach(lane => {
      const id = lane.dataset.layer;
      const r = this.rectInSvg(lane, svg);
      laneBusX[id] = {
        left: r.left,
        right: r.right,
        mid: r.centerX,
      };
    });

    const fromCount = {};
    const toCount = {};
    flows.forEach(flow => {
      fromCount[flow.from] = (fromCount[flow.from] || 0) + 1;
      toCount[flow.to] = (toCount[flow.to] || 0) + 1;
    });

    const fromIndex = {};
    const toIndex = {};

    flows.forEach(flow => {
      const fromPos = cardPositions[flow.from];
      const toPos = cardPositions[flow.to];
      if (!fromPos || !toPos) return;

      const fIdx = fromIndex[flow.from] || 0;
      const tIdx = toIndex[flow.to] || 0;
      const fTotal = fromCount[flow.from] || 1;
      const tTotal = toCount[flow.to] || 1;
      const offsetStep = 8;
      const fromOffset = (fIdx - (fTotal - 1) / 2) * offsetStep;
      const toOffset = (tIdx - (tTotal - 1) / 2) * offsetStep;
      fromIndex[flow.from] = fIdx + 1;
      toIndex[flow.to] = tIdx + 1;

      const isHighlighted = this.selectedTable &&
        (flow.from === this.selectedTable || flow.to === this.selectedTable);

      const fromTable = this.getTable(flow.from);
      const toTable = this.getTable(flow.to);
      const startX = fromPos.right;
      const startY = fromPos.centerY + fromOffset;
      const endX = toPos.left;
      const endY = toPos.centerY + toOffset;

      let d;
      const useBus = mode === 'focus' && !flow.dashed && fromTable && toTable
        && fromTable.layer !== toTable.layer
        && laneBusX[fromTable.layer] && laneBusX[toTable.layer];

      if (useBus) {
        const busX = (laneBusX[fromTable.layer].right + laneBusX[toTable.layer].left) / 2;
        d = this.buildRoundedBusPath(startX, startY, busX, endX, endY, 10);
      } else {
        const dx = endX - startX;
        const controlOffset = Math.min(Math.abs(dx) * 0.45, 100);
        d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');

      if (flow.dashed) {
        path.setAttribute('stroke', isHighlighted ? '#94a3b8' : 'rgba(148, 163, 184, 0.4)');
        path.setAttribute('stroke-dasharray', '5,6');
        path.setAttribute('stroke-width', isHighlighted ? '2' : '1.6');
        path.setAttribute('marker-end', 'url(#arrowhead-dim)');
      } else {
        if (isHighlighted) {
          const halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          halo.setAttribute('d', d);
          halo.setAttribute('fill', 'none');
          halo.setAttribute('stroke', 'rgba(34, 211, 238, 0.22)');
          halo.setAttribute('stroke-width', '8');
          halo.setAttribute('stroke-linecap', 'round');
          halo.setAttribute('stroke-linejoin', 'round');
          halo.setAttribute('filter', 'url(#arrow-soft)');
          halo.classList.add('dw-arch-flow-halo');
          svg.appendChild(halo);
        }
        path.setAttribute('stroke', isHighlighted ? 'url(#spine-grad)' : 'rgba(34, 211, 238, 0.5)');
        path.setAttribute('stroke-width', isHighlighted ? '2.8' : '2');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        if (isHighlighted) path.setAttribute('filter', 'url(#arrow-glow)');
      }

      if (isHighlighted && !flow.dashed) {
        path.classList.add('dw-arch-flow-animated');
      }

      path.classList.add('dw-arch-flow-line');
      path.dataset.from = flow.from;
      path.dataset.to = flow.to;
      svg.appendChild(path);

      if (isHighlighted && flow.label) {
        const labelX = useBus
          ? (laneBusX[fromTable.layer].right + laneBusX[toTable.layer].left) / 2
          : (startX + endX) / 2;
        const labelY = (startY + endY) / 2 - 8;
        const textWidth = flow.label.length * 12;
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('x', labelX - textWidth / 2 - 6);
        bgRect.setAttribute('y', labelY - 12);
        bgRect.setAttribute('width', textWidth + 12);
        bgRect.setAttribute('height', '18');
        bgRect.setAttribute('rx', '4');
        bgRect.setAttribute('fill', 'rgba(10, 14, 26, 0.9)');
        bgRect.setAttribute('stroke', 'rgba(77, 163, 255, 0.5)');
        svg.appendChild(bgRect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#4da3ff');
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', '500');
        text.textContent = flow.label;
        svg.appendChild(text);
      }
    });
  }

  /** 正交总线路径：圆角折线，避免直角生硬 */
  buildRoundedBusPath(startX, startY, busX, endX, endY, radius = 10) {
    const r = Math.min(radius, Math.abs(busX - startX) / 2, Math.abs(endY - startY) / 2, Math.abs(endX - busX) / 2);
    if (r < 2 || Math.abs(endY - startY) < 4) {
      return `M ${startX} ${startY} L ${busX} ${startY} L ${busX} ${endY} L ${endX} ${endY}`;
    }
    const yDir = endY >= startY ? 1 : -1;
    return [
      `M ${startX} ${startY}`,
      `L ${busX - r} ${startY}`,
      `Q ${busX} ${startY} ${busX} ${startY + r * yDir}`,
      `L ${busX} ${endY - r * yDir}`,
      `Q ${busX} ${endY} ${busX + r} ${endY}`,
      `L ${endX} ${endY}`,
    ].join(' ');
  }

  /** 默认模式：列头之间水平主轨 ODS→DWD→DWS→ADS（一眼能读懂左→右） */
  drawLayerSpine(svg, industry) {
    const MAIN = ['ods', 'dwd', 'dws', 'ads'];
    const VERB = {
      'ods|dwd': '清洗关联',
      'dwd|dws': '主题汇总',
      'dws|ads': '看板取数',
    };
    const LAYER_COLOR = {
      ods: '#64748b',
      dwd: '#14b8a6',
      dws: '#f59e0b',
      ads: '#8b5cf6',
    };
    const laneBoxes = MAIN.map(id => {
      if (!this.layerFilter.has(id)) return null;
      const lane = this.container.querySelector(`.dw-arch-lane[data-layer="${id}"]`);
      if (!lane) return null;
      const header = lane.querySelector('.dw-arch-lane-header') || lane;
      const r = this.rectInSvg(lane, svg);
      const hr = this.rectInSvg(header, svg);
      const layerMeta = industry.layers.find(l => l.id === id);
      return {
        id,
        color: layerMeta?.color || LAYER_COLOR[id] || '#22d3ee',
        left: r.left,
        right: r.right,
        /* 锚在列头垂直中线，水平穿列间距，对准列边缘 */
        railY: hr.top + hr.height / 2,
      };
    }).filter(Boolean);

    for (let i = 0; i < laneBoxes.length - 1; i++) {
      const from = laneBoxes[i];
      const to = laneBoxes[i + 1];
      const startX = from.right;
      const endX = to.left;
      const y = (from.railY + to.railY) / 2;
      const mid = (startX + endX) / 2;
      const gap = endX - startX;
      if (gap < 8) continue;

      const d = `M ${startX} ${y} L ${endX} ${y}`;

      /* 锚点：线从列右缘点出发、对准下一列左缘点 */
      const mkDot = (cx, fill) => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', cx);
        c.setAttribute('cy', y);
        c.setAttribute('r', '4');
        c.setAttribute('fill', fill);
        c.setAttribute('stroke', '#e0f2fe');
        c.setAttribute('stroke-width', '1.2');
        c.classList.add('dw-arch-flow-node');
        svg.appendChild(c);
      };
      mkDot(startX, from.color);
      mkDot(endX, to.color);

      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      halo.setAttribute('d', d);
      halo.setAttribute('fill', 'none');
      halo.setAttribute('stroke', from.color);
      halo.setAttribute('stroke-opacity', '0.22');
      halo.setAttribute('stroke-width', '10');
      halo.setAttribute('stroke-linecap', 'round');
      halo.setAttribute('filter', 'url(#arrow-soft)');
      halo.classList.add('dw-arch-flow-halo');
      svg.appendChild(halo);

      const gradId = `spine-grad-${from.id}-${to.id}`;
      let grad = svg.querySelector(`#${gradId}`);
      if (!grad) {
        grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', gradId);
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', from.color);
        const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s2.setAttribute('offset', '100%');
        s2.setAttribute('stop-color', to.color);
        grad.appendChild(s1);
        grad.appendChild(s2);
        svg.querySelector('defs')?.appendChild(grad);
      }
      grad.setAttribute('x1', startX);
      grad.setAttribute('y1', y);
      grad.setAttribute('x2', endX);
      grad.setAttribute('y2', y);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', `url(#${gradId})`);
      path.setAttribute('stroke-width', '3.2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.setAttribute('filter', 'url(#arrow-glow)');
      path.classList.add('dw-arch-flow-line', 'dw-arch-flow-spine', 'dw-arch-flow-animated');
      svg.appendChild(path);

      const verb = VERB[`${from.id}|${to.id}`] || '流转';
      const label = `${from.id.toUpperCase()} → ${to.id.toUpperCase()} · ${verb}`;
      const labelY = y - 14;
      const tw = Math.max(label.length * 7.2, 96);
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', mid - tw / 2 - 8);
      bg.setAttribute('y', labelY - 11);
      bg.setAttribute('width', tw + 16);
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '10');
      bg.setAttribute('fill', 'rgba(2, 10, 24, 0.92)');
      bg.setAttribute('stroke', `${to.color}aa`);
      bg.setAttribute('stroke-width', '1');
      svg.appendChild(bg);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', mid);
      text.setAttribute('y', labelY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#e2e8f0');
      text.setAttribute('font-size', '11px');
      text.setAttribute('font-weight', '700');
      text.setAttribute('letter-spacing', '0.04em');
      text.textContent = label;
      svg.appendChild(text);
    }
  }

  handleKeydown(e) {
    // ESC 关闭侧边栏
    if (e.key === 'Escape') {
      this.closeSidebar();
    }
    
    // Ctrl+F 聚焦搜索
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      const searchInput = this.container.querySelector('.dw-arch-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // +/- 缩放
    if (e.key === '+' || e.key === '=') {
      this.handleZoom('in');
    }
    if (e.key === '-') {
      this.handleZoom('out');
    }
    
    // 0 重置缩放
    if (e.key === '0') {
      this.handleZoom('reset');
    }
  }

  exportImage() {
    // 简单的导出功能：提示用户可以用截图，或者未来可以集成html2canvas
    alert('导出功能：可以使用浏览器截图功能（Ctrl+Shift+A 或 Win+Shift+S）截取当前全景图。\n\n完整的PNG导出功能需要额外的库支持，后续可以集成。');
  }
}

// 暴露到全局
window.DWArchitecture = DWArchitecture;



