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
    this.dimRailCollapsed = options.dimRailCollapsed === true;
    this.legendOpen = false;
    this.openDimCategories = new Set();
    
    // 筛选状态
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
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

  init() {
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => {
      this.fitView();
      this.drawFlows();
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
            <span class="dw-arch-title-text">数仓分层全景图</span>
            <span class="dw-arch-subtitle">${industry.name}</span>
            <span class="dw-arch-stats">${visibleTables}/${totalTables} 表 · ${totalFlows} 流向</span>
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
              ${industry.layers.map(layer => `
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
              <button type="button" class="dw-arch-legend-btn" data-legend-toggle title="图例">ⓘ</button>
              <div class="dw-arch-legend-pop ${this.legendOpen ? 'open' : ''}" id="dwArchLegendPop">
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-line"></span>数据流向</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-line dashed"></span>维度关联</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-ods,#64748b)"></span>ODS</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-dim,#6366f1)"></span>DIM（侧栏）</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-dwd,#14b8a6)"></span>DWD</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-dws,#f59e0b)"></span>DWS</div>
                <div class="dw-arch-legend-item"><span class="dw-arch-legend-dot" style="background:var(--layer-ads,#8b5cf6)"></span>ADS</div>
                <p class="dw-arch-legend-tip">主链路 ODS→DWD→DWS→ADS · DIM 在左侧 · 点表看上下游</p>
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
          ${this.layerFilter.has('dim') ? this.renderDimRail(industry, dimLayer) : ''}
          <div class="dw-arch-main-col">
            <div class="dw-arch-canvas" id="dwArchCanvas">
              <div class="dw-arch-canvas-inner" id="dwArchCanvasInner" style="transform: translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale}); transform-origin: 0 0;">
                <svg class="dw-arch-flows-svg" id="dwArchFlowsSvg">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#4da3ff" opacity="0.6"/>
                    </marker>
                    <marker id="arrowhead-dim" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" opacity="0.4"/>
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
                  <div class="dw-arch-detail-empty">点击主链路或 DIM 侧栏中的表卡片查看详情</div>
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

  renderTableCard(table, layer) {
    const isHighlighted = this.highlightedTables.has(table.id);
    const isSelected = this.selectedTable === table.id;
    const matchesSearch = !this.searchKeyword ||
      table.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      (table.purpose || '').toLowerCase().includes(this.searchKeyword.toLowerCase());

    return `
      <div class="dw-arch-table-card ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${!matchesSearch ? 'dimmed' : ''}"
           data-table-id="${table.id}"
           data-layer="${layer.id}"
           style="--layer-color: ${layer.color}">
        <div class="dw-arch-table-name-cn">${table.purpose}</div>
        <div class="dw-arch-table-name-en">${table.name}</div>
        <div class="dw-arch-table-meta">
          <span class="dw-arch-table-field-count">${table.fieldCount} 字段</span>
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
  }

  switchIndustry(industry) {
    this.currentIndustry = industry;
    this.selectedTable = null;
    this.highlightedTables.clear();
    this.searchKeyword = '';
    this.flowMode = 'layer';
    this.openDimCategories = new Set();
    this._dimCatsInit = false;
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
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
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
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
        </div>
        <h3 class="dw-arch-detail-name">${table.name}</h3>
        <p class="dw-arch-detail-purpose">${table.purpose}</p>

        <div class="dw-arch-detail-meta">
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">字段数</span>
            <span class="dw-arch-detail-meta-value">${table.fieldCount}</span>
          </div>
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">分类</span>
            <span class="dw-arch-detail-meta-value">${table.category}</span>
          </div>
          <div class="dw-arch-detail-meta-item">
            <span class="dw-arch-detail-meta-label">分层</span>
            <span class="dw-arch-detail-meta-value">${layer?.fullName}</span>
          </div>
        </div>

        <!-- 表详细说明 -->
        <div class="dw-arch-detail-section">
          <h4 class="dw-arch-detail-section-title">
            <span class="dw-arch-detail-section-icon">📝</span>
            表说明
          </h4>
          <div class="dw-arch-detail-desc">
            ${table.description || table.purpose}
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
                  <div class="dw-arch-detail-rel-name">${u.table?.name || u.from}</div>
                  <div class="dw-arch-detail-rel-label">${u.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

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
                  <div class="dw-arch-detail-rel-name">${d.table?.name || d.to}</div>
                  <div class="dw-arch-detail-rel-label">${d.label}</div>
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
                  ${d.name}
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
                    <span class="dw-arch-field-name">${f.name}</span>
                    <span class="dw-arch-field-type">${f.type}</span>
                  </div>
                  <div class="dw-arch-field-desc">${f.desc || f.business || f.comment || '暂无说明'}</div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="dw-arch-detail-fields-note">
              共 ${table.fieldCount} 个字段，完整字段请查看数据字典
            </div>
          `}
        </div>

        <!-- 在数据字典中查看 -->
        <div class="dw-arch-detail-action">
          <button type="button" class="dw-arch-open-dict-btn" data-table-name="${table.name}">
            <span class="dw-arch-btn-icon">📖</span>
            在数据字典中查看
          </button>
          <button type="button" class="dw-arch-open-graph-btn" data-table-id="${table.id}" data-table-name="${table.name}">
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
          // 滚动到目标卡片
          const targetCard = this.container.querySelector(`[data-table-id="${targetId}"]`);
          if (targetCard) {
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
    });

    // 绑定字段搜索
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

    // 绑定"在数据字典中查看"按钮
    const openDictBtn = content.querySelector('.dw-arch-open-dict-btn');
    if (openDictBtn) {
      openDictBtn.addEventListener('click', (e) => {
        const tableName = e.currentTarget.dataset.tableName;
        this.navigateToDictionary(tableName);
      });
    }

    const openGraphBtn = content.querySelector('.dw-arch-open-graph-btn');
    if (openGraphBtn) {
      openGraphBtn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.tableId || e.currentTarget.dataset.tableName;
        this.navigateToGraph(id);
      });
    }

    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
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

  /** Step6：全景图 → 知识图谱 focusNode */
  navigateToGraph(tableIdOrName) {
    if (!tableIdOrName) return;
    this.closeSidebar();
    setTimeout(() => {
      window.openArchInteractive?.("dw-graph-section");
      const graph = window.__dwGraph;
      if (graph?.focusNode) {
        setTimeout(() => graph.focusNode(tableIdOrName), 120);
        return;
      }
      const section = document.getElementById('dw-graph-section');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
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
      content.innerHTML = '<div class="dw-arch-detail-empty">点击主链路或 DIM 侧栏中的表卡片查看详情</div>';
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
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';

    svg.querySelectorAll('path, text, rect').forEach(p => p.remove());

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
      const cardRect = card.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      cardPositions[tableId] = {
        left: cardRect.left - svgRect.left,
        right: cardRect.right - svgRect.left,
        top: cardRect.top - svgRect.top,
        bottom: cardRect.bottom - svgRect.top,
        centerX: (cardRect.left + cardRect.right) / 2 - svgRect.left,
        centerY: (cardRect.top + cardRect.bottom) / 2 - svgRect.top,
        width: cardRect.width,
        height: cardRect.height
      };
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
      const r = lane.getBoundingClientRect();
      const svgR = svg.getBoundingClientRect();
      laneBusX[id] = {
        left: r.left - svgR.left,
        right: r.right - svgR.left,
        mid: (r.left + r.right) / 2 - svgR.left,
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
        d = `M ${startX} ${startY} L ${busX} ${startY} L ${busX} ${endY} L ${endX} ${endY}`;
      } else {
        const dx = endX - startX;
        const controlOffset = Math.min(Math.abs(dx) * 0.5, 120);
        d = `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
      }

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');

      if (flow.dashed) {
        path.setAttribute('stroke', isHighlighted ? '#6b7280' : 'rgba(107, 114, 128, 0.35)');
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('stroke-width', isHighlighted ? '2' : '1.5');
        path.setAttribute('marker-end', 'url(#arrowhead-dim)');
      } else {
        path.setAttribute('stroke', isHighlighted ? '#4da3ff' : 'rgba(77, 163, 255, 0.3)');
        path.setAttribute('stroke-width', isHighlighted ? '2.5' : '1.5');
        path.setAttribute('marker-end', 'url(#arrowhead)');
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

  /** 默认模式：层间主箭头 ODS→DWD→DWS→ADS（DIM 不入主链路） */
  drawLayerSpine(svg, industry) {
    const MAIN = ['ods', 'dwd', 'dws', 'ads'];
    const svgRect = svg.getBoundingClientRect();
    const laneBoxes = MAIN.map(id => {
      if (!this.layerFilter.has(id)) return null;
      const lane = this.container.querySelector(`.dw-arch-lane[data-layer="${id}"]`);
      if (!lane) return null;
      const r = lane.getBoundingClientRect();
      const layerMeta = industry.layers.find(l => l.id === id);
      return {
        id,
        color: layerMeta?.color || '#4da3ff',
        left: r.left - svgRect.left,
        right: r.right - svgRect.left,
        centerY: r.top - svgRect.top + Math.min(r.height * 0.35, 120),
      };
    }).filter(Boolean);

    for (let i = 0; i < laneBoxes.length - 1; i++) {
      const from = laneBoxes[i];
      const to = laneBoxes[i + 1];
      const startX = from.right;
      const endX = to.left;
      const startY = from.centerY;
      const endY = to.centerY;
      const mid = (startX + endX) / 2;
      const gap = endX - startX;
      if (gap < 8) continue;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d',
        `M ${startX} ${startY} C ${mid} ${startY}, ${mid} ${endY}, ${endX} ${endY}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(77, 163, 255, 0.55)');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('marker-end', 'url(#arrowhead)');
      path.classList.add('dw-arch-flow-line', 'dw-arch-flow-spine');
      svg.appendChild(path);

      const label = `${from.id.toUpperCase()}→${to.id.toUpperCase()}`;
      const labelX = mid;
      const labelY = (startY + endY) / 2 - 10;
      const tw = label.length * 7.5;
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', labelX - tw / 2 - 6);
      bg.setAttribute('y', labelY - 11);
      bg.setAttribute('width', tw + 12);
      bg.setAttribute('height', '16');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', 'rgba(10, 14, 26, 0.85)');
      bg.setAttribute('stroke', 'rgba(77, 163, 255, 0.35)');
      svg.appendChild(bg);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', labelX);
      text.setAttribute('y', labelY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', '#7dd3fc');
      text.setAttribute('font-size', '10px');
      text.setAttribute('font-weight', '600');
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



