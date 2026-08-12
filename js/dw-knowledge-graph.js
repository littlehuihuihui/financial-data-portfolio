/**
 * 数仓知识图谱 · 力导向关系图（三行业共用）
 * 功能：力导向 + 拖拽 + 上下游高亮 + 缩放 + 搜索 + 分层筛选
 *      + 看板节点可开关 + 侧栏跳转数据展示
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
    this.selectedKind = null; // 'table' | 'dashboard'
    this.highlightedNodes = new Set();
    this.searchKeyword = '';
    
    // 筛选状态
    this.layerFilter = new Set(['ods', 'dim', 'dwd', 'dws', 'ads']);
    /** 看板消费节点：默认关闭，避免冲淡表血缘 */
    this.showDashboards = options.showDashboards === true;
    
    // 分层颜色（与 architecture layers / 图例一致）
    this.layerColors = {
      ods: '#64748b',
      dim: '#6366f1',
      dwd: '#14b8a6',
      dws: '#f59e0b',
      ads: '#8b5cf6',
      dashboard: '#f472b6',
    };

    this.chart = null;
    this.init();
  }

  /** 节点/图例/筛选点统一取色 */
  getLayerColor(layerId) {
    if (layerId === 'dashboard') return this.layerColors.dashboard;
    const industry = this.data[this.currentIndustry];
    const layer = industry?.layers?.find(l => l.id === layerId);
    if (layer?.color) return layer.color;
    return this.layerColors[layerId] || '#6b7280';
  }

  dashNodeId(dashId) {
    return `dash:${dashId}`;
  }

  isDashNode(id) {
    return String(id || '').startsWith('dash:');
  }

  /** 数据展示页入口（相对当前 pages/ 或 architecture 页） */
  dashboardHref(dashId) {
    const map = {
      retail: '../retail_dashboard.html',
      manufacturing: '../manufacturing_dashboard.html',
      internet: '../internet_dashboard.html',
    };
    // architecture.html 也在 pages/ 下，相对路径相同
    const base = map[this.currentIndustry] || '../retail_dashboard.html';
    return `${base}#${encodeURIComponent(dashId)}`;
  }

  /** 看板未登记 tables 时，用 ADS 视图兜底关联 */
  resolveDashboardTables(dash) {
    if (dash.tables?.length) {
      return dash.tables.map((id) => this.getTable(id)).filter(Boolean);
    }
    const FALLBACK = {
      manufacturing: {
        production: ['v_production_overview', 'v_cmei_daily'],
        delivery: ['v_production_overview'],
        quality: ['v_quality_analysis', 'v_defect_analysis'],
        'scrap-rework': ['v_defect_analysis', 'v_quality_analysis'],
        'process-yield': ['v_quality_analysis'],
        equipment: ['v_equipment_oee'],
        downtime: ['v_equipment_oee'],
        capacity: ['v_capacity_utilization'],
        cost: ['v_cost_analysis', 'v_manufacturing_finance'],
        supply: ['v_supply_chain'],
        'supplier-score': ['v_supply_chain'],
        material: ['v_material_turnover'],
        'bom-variance': ['v_material_turnover'],
        labor: ['v_labor_efficiency'],
      },
      internet: {
        overview: ['v_dau_overview'],
        launcher: ['v_dau_overview'],
        vod: ['v_dau_overview'],
        live: ['v_dau_overview'],
        retention: ['v_user_retention', 'v_retention_decomposition'],
        lifecycle: ['v_lifecycle', 'v_user_lifecycle'],
        funnel: ['v_funnel'],
        ltv: ['v_ltv'],
        channel: ['v_channel_analysis', 'v_channel_attribution'],
        ab: ['v_ab_experiment'],
        content: ['v_dau_overview'],
        path: ['v_user_path', 'v_top_paths'],
        revenue: ['v_revenue_structure'],
        arpu: ['v_arpu_trend'],
        health: ['v_health_dashboard'],
        portrait: ['v_user_portrait'],
        segment: ['v_user_segment'],
        rfm: ['v_rfm'],
      },
    };
    const ids = FALLBACK[this.currentIndustry]?.[dash.id] || [];
    return ids.map((id) => this.getTable(id)).filter(Boolean);
  }

  getDashboards() {
    const industry = this.data[this.currentIndustry];
    return industry?.dashboards || [];
  }

  getDashboard(dashId) {
    return this.getDashboards().find((d) => d.id === dashId) || null;
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
    const dashCount = (industry.dashboards || []).length;

    this.container.innerHTML = `
      <div class="dw-graph-wrapper">
        <!-- 顶部控制栏 -->
        <div class="dw-graph-header">
          <div class="dw-graph-title">
            <span class="dw-graph-title-icon">🕸️</span>
            <span class="dw-graph-title-text">数仓知识图谱</span>
            <span class="dw-graph-subtitle">${industry.name}</span>
            <span class="dw-graph-stats">${totalTables} 表 · ${totalFlows} 血缘${dashCount ? ` · ${dashCount} 看板` : ''}</span>
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
              <input type="text" class="dw-graph-search-input" placeholder="搜索表名 / 看板..." value="${this.searchKeyword}">
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
            <label class="dw-graph-filter-checkbox dw-graph-filter-dash">
              <input type="checkbox" data-dash-toggle ${this.showDashboards ? 'checked' : ''}>
              <span class="dw-graph-filter-dot" style="background:${this.layerColors.dashboard}"></span>
              <span>看板节点</span>
            </label>
          </div>
          <div class="dw-graph-legend-tip">
            拖拽调位 · 滚轮缩放 · 点表看上下游 · 开「看板节点」看 ADS→看板消费 · 侧栏可跳转数据展示
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
        this.selectNode(params.data.id, params.data.nodeKind || 'table');
      }
    });
  }


  updateChart() {
    if (!this.chart) return;

    const industry = this.data[this.currentIndustry];
    if (!industry) return;

    const filteredTables = industry.tables.filter(t => this.layerFilter.has(t.layer));
    const filteredTableIds = new Set(filteredTables.map(t => t.id));
    const filteredFlows = industry.flows.filter(f =>
      filteredTableIds.has(f.from) && filteredTableIds.has(f.to)
    );

    const nodes = filteredTables.map(table => {
      const isSelected = this.selectedTable === table.id;
      const isHighlighted = this.highlightedNodes.has(table.id);
      const isDimmed = this.highlightedNodes.size > 0 && !isHighlighted;
      const color = this.getLayerColor(table.layer);
      return {
        id: table.id,
        name: table.name,
        category: table.layer.toUpperCase(),
        nodeKind: 'table',
        symbolSize: table.type === 'view' ? 40 : 50,
        itemStyle: {
          color,
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

    const links = filteredFlows.map(flow => {
      const isHighlighted = this.selectedTable &&
        (flow.from === this.selectedTable || flow.to === this.selectedTable);
      const isDimmed = this.highlightedNodes.size > 0 &&
        !this.highlightedNodes.has(flow.from) && !this.highlightedNodes.has(flow.to);
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

    if (this.showDashboards) {
      const dashColor = this.getLayerColor('dashboard');
      (industry.dashboards || []).forEach(dash => {
        const nid = this.dashNodeId(dash.id);
        const related = this.resolveDashboardTables(dash)
          .map(tb => tb.id)
          .filter(id => filteredTableIds.has(id));
        const isSelected = this.selectedTable === nid;
        const isHighlighted = this.highlightedNodes.has(nid);
        const isDimmed = this.highlightedNodes.size > 0 && !isHighlighted;
        nodes.push({
          id: nid,
          name: dash.name,
          category: '看板',
          nodeKind: 'dashboard',
          symbol: 'diamond',
          symbolSize: 44,
          itemStyle: {
            color: dashColor,
            borderColor: isSelected ? '#fff' : isHighlighted ? dashColor : 'rgba(255,255,255,0.15)',
            borderWidth: isSelected ? 3 : isHighlighted ? 2 : 1,
            shadowBlur: isSelected || isHighlighted ? 16 : 0,
            shadowColor: dashColor,
            opacity: isDimmed ? 0.2 : 1
          },
          label: {
            show: true,
            position: 'bottom',
            fontSize: 10,
            color: isDimmed ? '#444' : '#fbcfe8',
            formatter: dash.name.length > 14 ? dash.name.slice(0, 12) + '…' : dash.name
          },
          dashData: dash
        });
        related.forEach(tid => {
          const edgeHi = this.selectedTable === nid || this.selectedTable === tid ||
            (this.highlightedNodes.has(nid) && this.highlightedNodes.has(tid));
          links.push({
            source: tid,
            target: nid,
            lineStyle: {
              color: dashColor,
              width: edgeHi ? 2 : 1.2,
              opacity: isDimmed && !edgeHi ? 0.08 : 0.45,
              type: 'dashed',
              curveness: 0.25
            },
            label: { show: !!edgeHi, formatter: '消费', fontSize: 10, color: dashColor },
            flowData: { from: tid, to: nid, label: '看板消费', dashed: true }
          });
        });
      });
    }

    const categories = industry.layers
      .filter(l => this.layerFilter.has(l.id))
      .map(layer => ({ name: layer.name, itemStyle: { color: layer.color } }));
    if (this.showDashboards) {
      categories.push({ name: '看板', itemStyle: { color: this.getLayerColor('dashboard') } });
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(13, 18, 32, 0.95)',
        borderColor: '#1e2a4a',
        borderWidth: 1,
        textStyle: { color: '#e0e6f0', fontSize: 12 },
        formatter: (params) => {
          if (params.dataType === 'node') {
            if (params.data.nodeKind === 'dashboard') {
              const d = params.data.dashData;
              const n = this.resolveDashboardTables(d).length;
              return `<div style="font-weight:600;margin-bottom:6px;color:${this.getLayerColor('dashboard')}">📊 ${d.name}</div>
                <div style="color:#8892a4;font-size:11px;line-height:1.6;">
                  <div>类型：看板（消费节点）</div><div>关联表：${n} 个</div>
                  <div style="margin-top:4px;color:#b0b8c8;">点击侧栏可跳转数据展示</div></div>`;
            }
            const table = params.data.tableData;
            return `<div style="font-weight:600;margin-bottom:6px;color:${this.getLayerColor(table.layer)}">${table.name}</div>
              <div style="color:#8892a4;font-size:11px;line-height:1.6;">
                <div>分层：${table.layer.toUpperCase()}</div>
                <div>类型：${table.type === 'view' ? '视图' : '表'}</div>
                <div>字段：${table.fieldCount} 个</div>
                <div>分类：${table.category}</div>
                <div style="margin-top:4px;color:#b0b8c8;">${table.purpose}</div></div>`;
          }
          if (params.dataType === 'edge') {
            const flow = params.data.flowData;
            return `<div style="font-weight:600;margin-bottom:4px;">${flow.label || '数据流向'}</div>
              <div style="color:#8892a4;font-size:11px;">${flow.from} → ${flow.to}</div>`;
          }
          return '';
        }
      },
      legend: {
        show: true, orient: 'vertical', right: 20, top: 20,
        textStyle: { color: '#8892a4', fontSize: 12 },
        itemWidth: 12, itemHeight: 12,
        data: categories.map(c => c.name)
      },
      series: [{
        type: 'graph', layout: 'force', roam: true, draggable: true,
        focusNodeAdjacency: false, categories, data: nodes, links,
        force: {
          repulsion: this.showDashboards ? 260 : 300,
          gravity: 0.1,
          edgeLength: this.showDashboards ? [80, 180] : [100, 200],
          layoutAnimation: true
        },
        emphasis: { focus: 'none', itemStyle: { shadowBlur: 20 } },
        lineStyle: { curveness: 0.2 },
        label: { position: 'bottom', fontSize: 10 },
        edgeLabel: { fontSize: 10 }
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

    // 看板节点开关
    const dashToggle = this.container.querySelector('[data-dash-toggle]');
    if (dashToggle) {
      dashToggle.addEventListener('change', (e) => {
        this.showDashboards = !!e.target.checked;
        this.selectedTable = null;
        this.selectedKind = null;
        this.highlightedNodes.clear();
        this.closeSidebar();
        this.updateChart();
      });
    }

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

    const matchedTable = industry.tables.find(tb =>
      tb.name.toLowerCase().includes(keyword) ||
      (tb.purpose || '').toLowerCase().includes(keyword)
    );
    if (matchedTable) {
      this.selectNode(matchedTable.id, 'table');
      return;
    }
    const matchedDash = (industry.dashboards || []).find(d =>
      d.name.toLowerCase().includes(keyword) || d.id.toLowerCase().includes(keyword)
    );
    if (matchedDash) {
      if (!this.showDashboards) {
        this.showDashboards = true;
        const box = this.container.querySelector('[data-dash-toggle]');
        if (box) box.checked = true;
        this.updateChart();
      }
      this.selectNode(this.dashNodeId(matchedDash.id), 'dashboard');
    }
  }

  selectNode(nodeId, kind) {
    this.selectedTable = nodeId;
    this.selectedKind = kind || (this.isDashNode(nodeId) ? 'dashboard' : 'table');
    if (this.selectedKind === 'dashboard') {
      this.highlightDashboard(nodeId);
      this.showDashboardSidebar(nodeId);
    } else {
      this.highlightUpstreamDownstream(nodeId);
      this.showSidebar(nodeId);
    }
    this.updateChart();
  }

  selectTable(tableId) {
    this.selectNode(tableId, 'table');
  }

  /** Step6：外部跳转聚焦（表 id 或 name） */
  focusNode(tableIdOrName) {
    if (!tableIdOrName) return false;
    const industry = this.data[this.currentIndustry];
    if (!industry) return false;
    const key = String(tableIdOrName);
    const table = industry.tables.find(t => t.id === key || t.name === key);
    if (!table) return false;
    this.selectNode(table.id, 'table');
    const section = document.getElementById('dw-graph-section');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }

  highlightDashboard(dashNodeId) {
    const dashId = String(dashNodeId).replace(/^dash:/, '');
    const dash = this.getDashboard(dashId);
    const related = new Set([dashNodeId]);
    if (dash) {
      this.resolveDashboardTables(dash).forEach(tb => related.add(tb.id));
    }
    this.highlightedNodes = related;
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

    if (this.showDashboards) {
      (industry.dashboards || []).forEach(d => {
        const linked = this.resolveDashboardTables(d).some(tb => tb.id === tableId);
        if (linked) related.add(this.dashNodeId(d.id));
      });
    }

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
    this.showDashboards = false;
    this.selectedKind = null;

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
    const dashboards = (industry.dashboards || []).filter(d =>
      this.resolveDashboardTables(d).some(tb => tb.id === tableId) ||
      (d.tables || []).includes(tableId)
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

        <!-- 关联看板（可跳转） -->
        ${dashboards.length > 0 ? `
          <div class="dw-graph-detail-section">
            <h4 class="dw-graph-detail-section-title">
              <span class="dw-graph-detail-section-icon">📊</span>
              关联看板（${dashboards.length}）
            </h4>
            <div class="dw-graph-detail-dashboard-list">
              ${dashboards.map(d => `
                <a class="dw-graph-detail-dashboard-item dw-graph-dash-link" href="${this.dashboardHref(d.id)}" target="_blank" rel="noopener">
                  <span class="dw-graph-detail-dashboard-icon">◆</span>
                  <span>${d.name}</span>
                  <span class="dw-graph-dash-go">打开 →</span>
                </a>
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


  showDashboardSidebar(dashNodeId) {
    const dashId = String(dashNodeId).replace(/^dash:/, '');
    const dash = this.getDashboard(dashId);
    const industry = this.data[this.currentIndustry];
    if (!dash || !industry) return;
    const related = this.resolveDashboardTables(dash);
    const href = this.dashboardHref(dash.id);
    const sidebar = this.container.querySelector('#dwGraphSidebar');
    const content = this.container.querySelector('#dwGraphSidebarContent');
    content.innerHTML = `
      <div class="dw-graph-detail">
        <div class="dw-graph-detail-header">
          <div class="dw-graph-detail-layer-badge" style="background:${this.getLayerColor('dashboard')}">看板</div>
          <div class="dw-graph-detail-type-badge">消费节点</div>
        </div>
        <h3 class="dw-graph-detail-name">${dash.name}</h3>
        <p class="dw-graph-detail-purpose">数据展示主题看板 · 从表/ADS 消费取数</p>
        <div class="dw-graph-detail-section">
          <a class="dw-graph-open-dash-btn" href="${href}" target="_blank" rel="noopener">打开数据展示「${dash.name}」→</a>
        </div>
        <div class="dw-graph-detail-section">
          <h4 class="dw-graph-detail-section-title">
            <span class="dw-graph-detail-section-icon">↑</span>
            关联表（${related.length}）
          </h4>
          <div class="dw-graph-detail-rel-list">
            ${related.length ? related.map(tb => `
              <div class="dw-graph-detail-rel-item" data-table-id="${tb.id}">
                <div class="dw-graph-detail-rel-name">${tb.name}</div>
                <div class="dw-graph-detail-rel-label">${(tb.layer || '').toUpperCase()} · ${tb.purpose || ''}</div>
              </div>`).join('') : '<div class="dw-graph-detail-fields-note">暂无登记关联表</div>'}
          </div>
        </div>
      </div>`;
    content.querySelectorAll('.dw-graph-detail-rel-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetId = e.currentTarget.dataset.tableId;
        if (targetId) this.selectNode(targetId, 'table');
      });
    });
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





