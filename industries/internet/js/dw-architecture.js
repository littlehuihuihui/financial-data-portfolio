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
    this.selectedTable = null;
    this.searchKeyword = '';
    this.highlightedTables = new Set();
    
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
    // 延迟绘制连线，等待 DOM 渲染完成
    requestAnimationFrame(() => this.drawFlows());
    // 监听窗口大小变化，重绘连线
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this.drawFlows(), 200);
    });
    
    // 绑定键盘快捷键
    this._keyHandler = (e) => this.handleKeydown(e);
    document.addEventListener('keydown', this._keyHandler);
  }

  destroy() {
    document.removeEventListener('keydown', this._keyHandler);
  }

  render() {const industry = this.data[this.currentIndustry];
    if (!industry) {
      this.container.innerHTML = '<div style="padding:40px;text-align:center;color:#8892a4;">未找到行业数据</div>';
      return;
    }

    // 统计
    const totalTables = industry.tables.length;
    const totalFlows = industry.flows.length;
    const visibleTables = industry.tables.filter(t => 
      this.layerFilter.has(t.layer) && this.typeFilter.has(t.type)
    ).length;

    this.container.innerHTML = `
      <div class="dw-arch-wrapper">
        <!-- 顶部控制栏 -->
        <div class="dw-arch-header">
          <div class="dw-arch-title">
            <span class="dw-arch-title-icon">◆</span>
            <span class="dw-arch-title-text">数仓分层全景图</span>
            <span class="dw-arch-subtitle">${industry.name}</span>
            <span class="dw-arch-stats">${visibleTables}/${totalTables} 表 · ${totalFlows} 流向</span>
          </div>
          <div class="dw-arch-controls">
            <div class="dw-arch-industry-switch">
              ${Object.keys(this.data).map(key => `
                <button class="dw-arch-industry-btn ${key === this.currentIndustry ? 'active' : ''}" data-industry="${key}">
                  ${this.data[key].name.split('·')[0]?.trim() || key}
                </button>
              `).join('')}
            </div>
            <div class="dw-arch-search">
              <input type="text" class="dw-arch-search-input" placeholder="搜索表名/用途... (Ctrl+F)" value="${this.searchKeyword}">
              <span class="dw-arch-search-icon">🔍</span>
            </div>
            <div class="dw-arch-zoom-controls">
              <button class="dw-arch-zoom-btn" data-zoom="out" title="缩小">−</button>
              <span class="dw-arch-zoom-level">${Math.round(this.scale * 100)}%</span>
              <button class="dw-arch-zoom-btn" data-zoom="in" title="放大">+</button>
              <button class="dw-arch-zoom-btn" data-zoom="reset" title="重置缩放">⟲</button>
            </div>
            <button class="dw-arch-export-btn" title="导出为PNG图片">
              📷 导出
            </button>
            <button class="dw-arch-reset-btn" title="重置视图">
              ↻ 重置
            </button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="dw-arch-filters">
          <div class="dw-arch-filter-group">
            <span class="dw-arch-filter-label">分层：</span>
            ${industry.layers.map(layer => `
              <label class="dw-arch-filter-checkbox">
                <input type="checkbox" data-layer-filter="${layer.id}" ${this.layerFilter.has(layer.id) ? 'checked' : ''}>
                <span class="dw-arch-filter-dot" style="background:${layer.color}"></span>
                <span>${layer.name}</span>
              </label>
            `).join('')}
          </div>
          <div class="dw-arch-filter-group">
            <span class="dw-arch-filter-label">类型：</span>
            <label class="dw-arch-filter-checkbox">
              <input type="checkbox" data-type-filter="table" ${this.typeFilter.has('table') ? 'checked' : ''}>
              <span>表</span>
            </label>
            <label class="dw-arch-filter-checkbox">
              <input type="checkbox" data-type-filter="view" ${this.typeFilter.has('view') ? 'checked' : ''}>
              <span>视图</span>
            </label>
          </div>
        </div>

        <!-- 图例 -->
        <div class="dw-arch-legend">
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-line"></span>
            <span>数据流向（ETL/聚合）</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-line dashed"></span>
            <span>维度关联</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-dot" style="background:#6b7280"></span>
            <span>ODS 贴源层</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-dot" style="background:#3b82f6"></span>
            <span>DIM 维度层</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-dot" style="background:#10b981"></span>
            <span>DWD 明细层</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-dot" style="background:#f59e0b"></span>
            <span>DWS 汇总层</span>
          </div>
          <div class="dw-arch-legend-item">
            <span class="dw-arch-legend-dot" style="background:#ef4444"></span>
            <span>ADS 应用层</span>
          </div>
          <div class="dw-arch-legend-tip">💡 提示：滚轮缩放，拖拽平移，点击表卡片查看详情</div>
        </div>

        <!-- 主画布区域 -->
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
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#4da3ff;stop-opacity:0.2" />
                  <stop offset="100%" style="stop-color:#4da3ff;stop-opacity:0.6" />
                </linearGradient>
              </defs>
            </svg>

            <div class="dw-arch-lanes">
              ${industry.layers.filter(l => this.layerFilter.has(l.id)).map(layer => {
                const layerTables = industry.tables.filter(t => 
                  t.layer === layer.id && this.typeFilter.has(t.type)
                );
                return `
                  <div class="dw-arch-lane" data-layer="${layer.id}">
                    <div class="dw-arch-lane-header" style="border-left-color: ${layer.color}">
                      <div class="dw-arch-lane-title-row">
                        <span class="dw-arch-lane-name" style="color: ${layer.color}">${layer.name}</span>
                        <span class="dw-arch-lane-fullname">${layer.fullName}</span>
                        <span class="dw-arch-lane-count">${layerTables.length} 张表</span>
                      </div>
                      <div class="dw-arch-lane-desc">${layer.desc}</div>
                    </div>
                    <div class="dw-arch-lane-tables" id="dwArchLane_${layer.id}">
                      ${layerTables.map(table => this.renderTableCard(table, layer)).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- 侧边栏详情 -->
        <div class="dw-arch-sidebar" id="dwArchSidebar">
          <div class="dw-arch-sidebar-overlay" id="dwArchSidebarOverlay"></div>
          <div class="dw-arch-sidebar-panel" id="dwArchSidebarPanel">
            <div class="dw-arch-sidebar-header">
              <button class="dw-arch-sidebar-close" id="dwArchSidebarClose">×</button>
              <div id="dwArchSidebarContent">
                <div style="padding:40px;text-align:center;color:#8892a4;">点击左侧表卡片查看详情</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderTableCard(table, layer) {
    const isHighlighted = this.highlightedTables.has(table.id);
    const isSelected = this.selectedTable === table.id;
    const matchesSearch = !this.searchKeyword || 
      table.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
      table.purpose.toLowerCase().includes(this.searchKeyword.toLowerCase());

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
    // 行业切换
    this.container.querySelectorAll('.dw-arch-industry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const industry = e.target.dataset.industry;
        if (industry !== this.currentIndustry) {
          this.switchIndustry(industry);
        }
      });
    });

    // 搜索
    const searchInput = this.container.querySelector('.dw-arch-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        this.handleSearch();
      });
    }

    // 重置按钮
    const resetBtn = this.container.querySelector('.dw-arch-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetView());
    }

    // 导出按钮
    const exportBtn = this.container.querySelector('.dw-arch-export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportImage());
    }

    // 缩放控制
    this.container.querySelectorAll('.dw-arch-zoom-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.zoom;
        this.handleZoom(action);
      });
    });

    // 分层筛选
    this.container.querySelectorAll('[data-layer-filter]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const layer = e.target.dataset.layerFilter;
        if (e.target.checked) {
          this.layerFilter.add(layer);
        } else {
          this.layerFilter.delete(layer);
        }
        this.refresh();
      });
    });

    // 类型筛选
    this.container.querySelectorAll('[data-type-filter]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const type = e.target.dataset.typeFilter;
        if (e.target.checked) {
          this.typeFilter.add(type);
        } else {
          this.typeFilter.delete(type);
        }
        this.refresh();
      });
    });

    // 表卡片点击
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const tableId = e.currentTarget.dataset.tableId;
        this.selectTable(tableId);
      });
    });

    // 侧边栏关闭
    const closeBtn = this.container.querySelector('#dwArchSidebarClose');
    const overlay = this.container.querySelector('#dwArchSidebarOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSidebar());
    if (overlay) overlay.addEventListener('click', () => this.closeSidebar());

    // 画布缩放（滚轮）
    const canvas = this.container.querySelector('#dwArchCanvas');
    if (canvas) {
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoomAt(e.offsetX, e.offsetY, delta);
      }, { passive: false });

      // 画布拖拽
      canvas.addEventListener('mousedown', (e) => {
        if (e.target.closest('.dw-arch-table-card')) return;
        this.isDragging = true;
        this.dragStartX = e.clientX - this.translateX;
        this.dragStartY = e.clientY - this.translateY;
        canvas.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        this.translateX = e.clientX - this.dragStartX;
        this.translateY = e.clientY - this.dragStartY;
        this.updateTransform();
      });

      document.addEventListener('mouseup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          canvas.style.cursor = 'grab';
        }
      });
    }
  }

  refresh() {
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => this.drawFlows());
  }

  switchIndustry(industry) {
    this.currentIndustry = industry;
    this.selectedTable = null;
    this.highlightedTables.clear();
    this.searchKeyword = '';
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
    this.typeFilter = new Set(['table', 'view']);
    this.render();
    this.bindEvents();
    requestAnimationFrame(() => this.drawFlows());
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
    switch(action) {
      case 'in':
        this.scale = Math.min(this.scale + 0.1, 2);
        break;
      case 'out':
        this.scale = Math.max(this.scale - 0.1, 0.3);
        break;
      case 'reset':
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        break;
    }
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

    sidebar.classList.add('open');
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
    if (sidebar) sidebar.classList.remove('open');
    this.selectedTable = null;
    this.clearHighlights();
    this.container.querySelectorAll('.dw-arch-table-card').forEach(card => {
      card.classList.remove('selected');
    });
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

    // 获取画布尺寸
    const canvasRect = canvas.getBoundingClientRect();
    svg.setAttribute('width', canvasRect.width);
    svg.setAttribute('height', canvasRect.height);
    svg.style.width = canvasRect.width + 'px';
    svg.style.height = canvasRect.height + 'px';

    // 清空现有连线
    const existingPaths = svg.querySelectorAll('path, text, rect');
    existingPaths.forEach(p => p.remove());

    // 获取所有卡片位置
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

    // 计算每条线的偏移量（防重叠）
    // 按 from 表分组，记录每个 from 有几条线
    const fromCount = {};
    const toCount = {};
    
    industry.flows.forEach(flow => {
      if (!cardPositions[flow.from] || !cardPositions[flow.to]) return;
      fromCount[flow.from] = (fromCount[flow.from] || 0) + 1;
      toCount[flow.to] = (toCount[flow.to] || 0) + 1;
    });

    // 记录每个 from 已经画了几条线
    const fromIndex = {};
    const toIndex = {};

    // 绘制每条连线
    industry.flows.forEach(flow => {
      const fromPos = cardPositions[flow.from];
      const toPos = cardPositions[flow.to];
      if (!fromPos || !toPos) return;

      // 计算偏移量（防重叠）
      const fIdx = fromIndex[flow.from] || 0;
      const tIdx = toIndex[flow.to] || 0;
      const fTotal = fromCount[flow.from] || 1;
      const tTotal = toCount[flow.to] || 1;
      
      // 垂直偏移，每条线错开一点
      const offsetStep = 8;
      const fromOffset = (fIdx - (fTotal - 1) / 2) * offsetStep;
      const toOffset = (tIdx - (tTotal - 1) / 2) * offsetStep;

      fromIndex[flow.from] = fIdx + 1;
      toIndex[flow.to] = tIdx + 1;

      const isHighlighted = this.selectedTable &&
        (flow.from === this.selectedTable || flow.to === this.selectedTable);

      const isDimmed = this.highlightedTables.size > 0 &&
        !this.highlightedTables.has(flow.from) &&
        !this.highlightedTables.has(flow.to);

      // 计算起点和终点
      // 从右边缘出发，到左边缘进入（横向流动）
      const startX = fromPos.right;
      const startY = fromPos.centerY + fromOffset;
      const endX = toPos.left;
      const endY = toPos.centerY + toOffset;

      // 贝塞尔曲线控制点
      const dx = endX - startX;
      const controlOffset = Math.min(Math.abs(dx) * 0.5, 120);
      const cp1x = startX + controlOffset;
      const cp1y = startY;
      const cp2x = endX - controlOffset;
      const cp2y = endY;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const d = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');

      if (flow.dashed) {
        path.setAttribute('stroke', isHighlighted ? '#6b7280' : 'rgba(107, 114, 128, 0.3)');
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('stroke-width', isHighlighted ? '2' : '1.5');
        path.setAttribute('marker-end', 'url(#arrowhead-dim)');
      } else {
        path.setAttribute('stroke', isHighlighted ? '#4da3ff' : 'rgba(77, 163, 255, 0.25)');
        path.setAttribute('stroke-width', isHighlighted ? '2.5' : '1.5');
        path.setAttribute('marker-end', 'url(#arrowhead)');
      }

      if (isDimmed) {
        path.setAttribute('opacity', '0.15');
      }

      // 流动动画（高亮时）
      if (isHighlighted && !flow.dashed) {
        path.classList.add('dw-arch-flow-animated');
      }

      path.classList.add('dw-arch-flow-line');
      path.dataset.from = flow.from;
      path.dataset.to = flow.to;

      svg.appendChild(path);

      // 连线标签（只在高亮时显示）
      if (isHighlighted && flow.label) {
        const labelX = (startX + endX) / 2;
        const labelY = (startY + endY) / 2 - 8;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#4da3ff');
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', '500');
        text.textContent = flow.label;

        // 背景矩形
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = flow.label.length * 12;
        bgRect.setAttribute('x', labelX - textWidth / 2 - 6);
        bgRect.setAttribute('y', labelY - 12);
        bgRect.setAttribute('width', textWidth + 12);
        bgRect.setAttribute('height', '18');
        bgRect.setAttribute('rx', '4');
        bgRect.setAttribute('fill', 'rgba(10, 14, 26, 0.9)');
        bgRect.setAttribute('stroke', 'rgba(77, 163, 255, 0.5)');

        svg.appendChild(bgRect);
        svg.appendChild(text);
      }
    });
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



