/**
 * 数仓知识图谱 · 力导向关系图
 * 功能：力导向布局 + 节点拖拽 + 上下游高亮 + 缩放平移 + 搜索定位 + 分层筛选
 */
class DWKnowledgeGraph {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('DWKnowledgeGraph: container not found', containerId);
      return;
    }

    this.data = window.DW_ARCHITECTURE_DATA || {};
    this.currentIndustry = options.defaultIndustry || 'internet';
    this.selectedTable = null;
    this.highlightedNodes = new Set();
    this.searchKeyword = '';
    
    // 筛选状态
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
    
    // 分层颜色（与 architecture layers / 图例一致；勿再硬编码另一套）
    this.layerColors = {
      ods: '#64748b',
      dim: '#6366f1',
      dwd: '#14b8a6',
      dws: '#f59e0b',
      ads: '#8b5cf6'
    };

    this.chart = null;
    this.init();
  }

  /** 节点/图例/筛选点统一取色 */
  getLayerColor(layerId) {
    const industry = this.data[this.currentIndustry];
    const layer = industry?.layers?.find(l => l.id === layerId);
    if (layer?.color) return layer.color;
    return this.layerColors[layerId] || '#6b7280';
  }


  init() {
    this.render();
    this.loadECharts();
  }

  render() {
    const industry = this.data[this.currentIndustry];
    if (!industry) {
      this.container.innerHTML = '<div style="padding:40px;text-align:center;color:#8892a4;">未找到行业数据</div>';
      return;
    }

    const totalTables = industry.tables.length;
    const totalFlows = industry.flows.length;

    this.container.innerHTML = `
      <div class="dw-graph-wrapper">
        <!-- 顶部控制栏 -->
        <div class="dw-graph-header">
          <div class="dw-graph-title">
            <span class="dw-graph-title-icon">🕸️</span>
            <span class="dw-graph-title-text">数仓知识图谱</span>
            <span class="dw-graph-subtitle">${industry.name}</span>
            <span class="dw-graph-stats">${totalTables} 节点 · ${totalFlows} 关系</span>
          </div>
          <div class="dw-graph-controls">
            <div class="dw-graph-industry-switch">
              ${Object.keys(this.data).map(key => `
                <button class="dw-graph-industry-btn ${key === this.currentIndustry ? 'active' : ''}" data-industry="${key}">
                  ${this.data[key].name.split('·')[0]?.trim() || key}
                </button>
              `).join('')}
            </div>
            <div class="dw-graph-search">
              <input type="text" class="dw-graph-search-input" placeholder="搜索表名..." value="${this.searchKeyword}">
              <span class="dw-graph-search-icon">🔍</span>
            </div>
            <button class="dw-graph-reset-btn" title="重置视图">
              ↻ 重置
            </button>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="dw-graph-filters">
          <div class="dw-graph-filter-group">
            <span class="dw-graph-filter-label">分层筛选：</span>
            ${industry.layers.map(layer => `
              <label class="dw-graph-filter-checkbox">
                <input type="checkbox" data-layer-filter="${layer.id}" ${this.layerFilter.has(layer.id) ? 'checked' : ''}>
                <span class="dw-graph-filter-dot" style="background:${layer.color}"></span>
                <span>${layer.name} ${layer.fullName}</span>
              </label>
            `).join('')}
          </div>
          <div class="dw-graph-legend-tip">
            💡 拖拽节点调整位置 · 滚轮缩放 · 点击节点查看上下游
          </div>
        </div>

        <!-- 图谱区域 -->
        <div class="dw-graph-canvas" id="dwGraphCanvas"></div>

        <!-- 侧边栏详情 -->
        <div class="dw-graph-sidebar" id="dwGraphSidebar">
          <div class="dw-graph-sidebar-overlay" id="dwGraphSidebarOverlay"></div>
          <div class="dw-graph-sidebar-panel" id="dwGraphSidebarPanel">
            <div class="dw-graph-sidebar-header">
              <button class="dw-graph-sidebar-close" id="dwGraphSidebarClose">×</button>
              <div id="dwGraphSidebarContent">
                <div style="padding:40px;text-align:center;color:#8892a4;">点击节点查看详情</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  loadECharts() {
    // 检查ECharts是否已加载
    if (window.echarts) {
      this.initChart();
      return;
    }

    // 动态加载ECharts
    const script = document.createElement('script');
    script.src = '../js/echarts.min.js';
    script.onload = () => {
      this.initChart();
    };
    script.onerror = () => {
      console.error('DWKnowledgeGraph: ECharts load failed');
      const canvas = document.getElementById('dwGraphCanvas');
      if (canvas) {
        canvas.innerHTML = '<div style="padding:60px;text-align:center;color:#8892a4;">ECharts加载失败</div>';
      }
    };
    document.head.appendChild(script);
  }

  initChart() {
    const canvas = document.getElementById('dwGraphCanvas');
    if (!canvas || !window.echarts) return;

    this.chart = echarts.init(canvas, null, { renderer: 'canvas' });
    this.updateChart();

    // 窗口resize
    window.addEventListener('resize', () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => {
        this.chart?.resize();
      }, 200);
    });

    // 点击事件
    this.chart.on('click', (params) => {
      if (params.dataType === 'node') {
        this.selectTable(params.data.id);
      }
    });
  }

  updateChart() {
    if (!this.chart) return;

    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    // 过滤表
    const filteredTables = industry.tables.filter(t => 
      this.layerFilter.has(t.layer)
    );
    const filteredTableIds = new Set(filteredTables.map(t => t.id));

    // 过滤连线（只保留两端都在筛选后的表中的连线）
    const filteredFlows = industry.flows.filter(f => 
      filteredTableIds.has(f.from) && filteredTableIds.has(f.to)
    );

    // 构建节点
    const nodes = filteredTables.map(table => {
      const isSelected = this.selectedTable === table.id;
      const isHighlighted = this.highlightedNodes.has(table.id);
      const isDimmed = this.highlightedNodes.size > 0 && !isHighlighted;
      
      const color = this.getLayerColor(table.layer);
      
      return {
        id: table.id,
        name: table.name,
        category: table.layer.toUpperCase(),
        symbolSize: table.type === 'view' ? 40 : 50,
        itemStyle: {
          color: color,
          borderColor: isSelected ? '#fff' : isHighlighted ? color : 'rgba(255,255,255,0.1)',
          borderWidth: isSelected ? 3 : isHighlighted ? 2 : 1,
          shadowBlur: isSelected ? 20 : isHighlighted ? 15 : 0,
          shadowColor: color,
          opacity: isDimmed ? 0.2 : 1
        },
        label: {
          show: true,
          position: 'bottom',
          fontSize: 10,
          color: isDimmed ? '#444' : '#b0b8c8',
          formatter: table.name.length > 18 ? table.name.slice(0, 16) + '...' : table.name
        },
        tableData: table
      };
    });

    // 构建连线
    const links = filteredFlows.map(flow => {
      const isHighlighted = this.selectedTable && 
        (flow.from === this.selectedTable || flow.to === this.selectedTable);
      const isDimmed = this.highlightedNodes.size > 0 && 
        !this.highlightedNodes.has(flow.from) && 
        !this.highlightedNodes.has(flow.to);

      return {
        source: flow.from,
        target: flow.to,
        lineStyle: {
          color: flow.dashed ? '#6b7280' : '#4da3ff',
          width: isHighlighted ? 2 : 1,
          opacity: isDimmed ? 0.1 : flow.dashed ? 0.3 : 0.4,
          type: flow.dashed ? 'dashed' : 'solid',
          curveness: 0.2
        },
        label: {
          show: isHighlighted && flow.label,
          formatter: flow.label,
          fontSize: 10,
          color: '#4da3ff'
        },
        flowData: flow
      };
    });

    // 分类（图例）
    const categories = industry.layers
      .filter(l => this.layerFilter.has(l.id))
      .map(layer => ({
        name: layer.name,
        itemStyle: { color: layer.color }
      }));

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(13, 18, 32, 0.95)',
        borderColor: '#1e2a4a',
        borderWidth: 1,
        textStyle: {
          color: '#e0e6f0',
          fontSize: 12
        },
        formatter: (params) => {
          if (params.dataType === 'node') {
            const table = params.data.tableData;
            return `
              <div style="font-weight:600;margin-bottom:6px;color:${this.getLayerColor(table.layer)}">${table.name}</div>
              <div style="color:#8892a4;font-size:11px;line-height:1.6;">
                <div>分层：${table.layer.toUpperCase()}</div>
                <div>类型：${table.type === 'view' ? '视图' : '表'}</div>
                <div>字段：${table.fieldCount} 个</div>
                <div>分类：${table.category}</div>
                <div style="margin-top:4px;color:#b0b8c8;">${table.purpose}</div>
              </div>
            `;
          } else if (params.dataType === 'edge') {
            const flow = params.data.flowData;
            return `
              <div style="font-weight:600;margin-bottom:4px;">${flow.label || '数据流向'}</div>
              <div style="color:#8892a4;font-size:11px;">
                ${flow.from} → ${flow.to}
              </div>
            `;
          }
          return '';
        }
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: 20,
        top: 20,
        textStyle: {
          color: '#8892a4',
          fontSize: 12
        },
        itemWidth: 12,
        itemHeight: 12,
        data: categories.map(c => c.name)
      },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true, // 开启缩放和平移
        draggable: true, // 节点可拖拽
        focusNodeAdjacency: false, // 关闭默认的邻接高亮，用自定义的
        categories: categories,
        data: nodes,
        links: links,
        force: {
          repulsion: 300, // 斥力
          gravity: 0.1, // 向心力
          edgeLength: [100, 200], // 边长度
          layoutAnimation: true
        },
        emphasis: {
          focus: 'none',
          itemStyle: {
            shadowBlur: 20
          }
        },
        lineStyle: {
          curveness: 0.2
        },
        label: {
          position: 'bottom',
          fontSize: 10
        },
        edgeLabel: {
          fontSize: 10
        }
      }]
    };

    this.chart.setOption(option, true);
  }

  bindEvents() {
    // 行业切换
    this.container.querySelectorAll('.dw-graph-industry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const industry = e.target.dataset.industry;
        if (industry !== this.currentIndustry) {
          this.switchIndustry(industry);
        }
      });
    });

    // 搜索
    const searchInput = this.container.querySelector('.dw-graph-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchKeyword = e.target.value;
        this.handleSearch();
      });
    }

    // 重置按钮
    const resetBtn = this.container.querySelector('.dw-graph-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetView());
    }

    // 分层筛选
    this.container.querySelectorAll('[data-layer-filter]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const layer = e.target.dataset.layerFilter;
        if (e.target.checked) {
          this.layerFilter.add(layer);
        } else {
          this.layerFilter.delete(layer);
        }
        this.selectedTable = null;
        this.highlightedNodes.clear();
        this.closeSidebar();
        this.updateChart();
      });
    });

    // 侧边栏关闭
    const closeBtn = this.container.querySelector('#dwGraphSidebarClose');
    const overlay = this.container.querySelector('#dwGraphSidebarOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeSidebar());
    if (overlay) overlay.addEventListener('click', () => this.closeSidebar());
  }

  switchIndustry(industry) {
    this.currentIndustry = industry;
    this.selectedTable = null;
    this.highlightedNodes.clear();
    this.searchKeyword = '';
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
    this.render();
    this.loadECharts();
  }

  handleSearch() {
    const keyword = this.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      this.clearHighlights();
      return;
    }

    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    // 找到匹配的表
    const matched = industry.tables.find(t =>
      t.name.toLowerCase().includes(keyword) ||
      t.purpose.toLowerCase().includes(keyword)
    );

    if (matched) {
      this.selectTable(matched.id);
      
      // 定位到节点
      if (this.chart) {
        this.chart.dispatchAction({
          type: 'focusNodeAdjacency',
          seriesIndex: 0,
          dataIndex: matched.id
        });
      }
    }
  }

  selectTable(tableId) {
    this.selectedTable = tableId;
    this.highlightUpstreamDownstream(tableId);
    this.showSidebar(tableId);
    this.updateChart();
  }

  /** Step6：外部跳转聚焦（表 id 或 name） */
  focusNode(tableIdOrName) {
    if (!tableIdOrName) return false;
    const industry = this.data[this.currentIndustry];
    if (!industry) return false;
    const key = String(tableIdOrName);
    const table = industry.tables.find(t => t.id === key || t.name === key);
    if (!table) return false;
    this.selectTable(table.id);
    const section = document.getElementById('dw-graph-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  highlightUpstreamDownstream(tableId) {
    this.highlightedNodes.clear();
    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    const related = new Set([tableId]);

    // 递归找上游
    const findUpstream = (id, depth = 0) => {
      if (depth > 5) return; // 防止死循环
      industry.flows.forEach(f => {
        if (f.to === id && !related.has(f.from)) {
          related.add(f.from);
          findUpstream(f.from, depth + 1);
        }
      });
    };

    // 递归找下游
    const findDownstream = (id, depth = 0) => {
      if (depth > 5) return;
      industry.flows.forEach(f => {
        if (f.from === id && !related.has(f.to)) {
          related.add(f.to);
          findDownstream(f.to, depth + 1);
        }
      });
    };

    findUpstream(tableId);
    findDownstream(tableId);

    this.highlightedNodes = related;
  }

  clearHighlights() {
    this.selectedTable = null;
    this.highlightedNodes.clear();
    this.updateChart();
  }

  resetView() {
    this.selectedTable = null;
    this.searchKeyword = '';
    this.highlightedNodes.clear();
    this.closeSidebar();
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);

    const searchInput = this.container.querySelector('.dw-graph-search-input');
    if (searchInput) searchInput.value = '';

    this.render();
    this.loadECharts();
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

    const sidebar = this.container.querySelector('#dwGraphSidebar');
    const content = this.container.querySelector('#dwGraphSidebarContent');

    content.innerHTML = `
      <div class="dw-graph-detail">
        <div class="dw-graph-detail-header">
          <div class="dw-graph-detail-layer-badge" style="background: ${layer?.color}">
            ${layer?.name}
          </div>
          <div class="dw-graph-detail-type-badge">
            ${table.type === 'view' ? '视图' : '表'}
          </div>
        </div>
        <h3 class="dw-graph-detail-name">${table.name}</h3>
        <p class="dw-graph-detail-purpose">${table.purpose}</p>

        <div class="dw-graph-detail-meta">
          <div class="dw-graph-detail-meta-item">
            <span class="dw-graph-detail-meta-label">字段数</span>
            <span class="dw-graph-detail-meta-value">${table.fieldCount}</span>
          </div>
          <div class="dw-graph-detail-meta-item">
            <span class="dw-graph-detail-meta-label">分类</span>
            <span class="dw-graph-detail-meta-value">${table.category}</span>
          </div>
          <div class="dw-graph-detail-meta-item">
            <span class="dw-graph-detail-meta-label">分层</span>
            <span class="dw-graph-detail-meta-value">${layer?.fullName}</span>
          </div>
        </div>

        <!-- 上游来源 -->
        ${upstream.length > 0 ? `
          <div class="dw-graph-detail-section">
            <h4 class="dw-graph-detail-section-title">
              <span class="dw-graph-detail-section-icon">↑</span>
              上游来源（${upstream.length}）
            </h4>
            <div class="dw-graph-detail-rel-list">
              ${upstream.map(u => `
                <div class="dw-graph-detail-rel-item" data-table-id="${u.from}">
                  <div class="dw-graph-detail-rel-name">${u.table?.name || u.from}</div>
                  <div class="dw-graph-detail-rel-label">${u.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 下游依赖 -->
        ${downstream.length > 0 ? `
          <div class="dw-graph-detail-section">
            <h4 class="dw-graph-detail-section-title">
              <span class="dw-graph-detail-section-icon">↓</span>
              下游依赖（${downstream.length}）
            </h4>
            <div class="dw-graph-detail-rel-list">
              ${downstream.map(d => `
                <div class="dw-graph-detail-rel-item" data-table-id="${d.to}">
                  <div class="dw-graph-detail-rel-name">${d.table?.name || d.to}</div>
                  <div class="dw-graph-detail-rel-label">${d.label}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 关联看板 -->
        ${dashboards.length > 0 ? `
          <div class="dw-graph-detail-section">
            <h4 class="dw-graph-detail-section-title">
              <span class="dw-graph-detail-section-icon">📊</span>
              关联看板（${dashboards.length}）
            </h4>
            <div class="dw-graph-detail-dashboard-list">
              ${dashboards.map(d => `
                <div class="dw-graph-detail-dashboard-item">
                  <span class="dw-graph-detail-dashboard-icon">◆</span>
                  ${d.name}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 字段列表 -->
        <div class="dw-graph-detail-section">
          <h4 class="dw-graph-detail-section-title">
            <span class="dw-graph-detail-section-icon">📋</span>
            字段列表（${dictFields.length || table.fieldCount}）
          </h4>
          ${dictFields.length > 0 ? `
            <div class="dw-graph-detail-fields-search">
              <input type="text" class="dw-graph-fields-search-input" placeholder="搜索字段...">
            </div>
            <div class="dw-graph-detail-fields-list">
              ${dictFields.map(f => `
                <div class="dw-graph-field-item">
                  <div class="dw-graph-field-name">${f.name}</div>
                  <div class="dw-graph-field-type">${f.type}</div>
                  <div class="dw-graph-field-desc">${f.desc || f.business || ''}</div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="dw-graph-detail-fields-note">
              共 ${table.fieldCount} 个字段，完整字段请查看数据字典
            </div>
          `}
        </div>
      </div>
    `;

    // 绑定上下游点击跳转
    content.querySelectorAll('.dw-graph-detail-rel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.tableId;
        if (targetId) {
          this.selectTable(targetId);
        }
      });
    });

    // 绑定字段搜索
    const fieldsSearch = content.querySelector('.dw-graph-fields-search-input');
    if (fieldsSearch) {
      fieldsSearch.addEventListener('input', (e) => {
        const keyword = e.target.value.toLowerCase();
        content.querySelectorAll('.dw-graph-field-item').forEach(item => {
          const name = item.querySelector('.dw-graph-field-name')?.textContent?.toLowerCase() || '';
          const desc = item.querySelector('.dw-graph-field-desc')?.textContent?.toLowerCase() || '';
          item.style.display = (name.includes(keyword) || desc.includes(keyword)) ? '' : 'none';
        });
      });
    }

    sidebar.classList.add('open');
  }

  getFieldsFromDictionary(tableName) {
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
    const sidebar = this.container.querySelector('#dwGraphSidebar');
    if (sidebar) sidebar.classList.remove('open');
    this.selectedTable = null;
    this.clearHighlights();
  }

  getTable(tableId) {
    const industry = this.data[this.currentIndustry];
    if (!industry) return null;
    return industry.tables.find(t => t.id === tableId);
  }

  destroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }
}

// 暴露到全局
window.DWKnowledgeGraph = DWKnowledgeGraph;





