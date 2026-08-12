# 数据字典 · Master-Detail 改造方案

> 文档版本：v1.0 · 2026-08-10  
> 状态：方案设计（待实施）  
> 关联：`architecture.html#data-dictionary-section`、`data-dictionary.js`、`data-dictionary-data.js`

---

## 1. 改造目标

将现有「纵向手风琴列表」数据字典，升级为 **左树（数仓五层）+ 右详情（表 / 字段 / 口径 / 血缘）** 的 Master-Detail 布局，并打通全局搜索、看板引用与指标口径。

### 1.1 要解决的问题

| 现状痛点 | 改造后 |
|----------|--------|
| 29+ 表纵向堆叠，定位慢 | 左侧按 ODS→ADS 分层折叠，一屏可见全貌 |
| 展开多张表后页面极长 | 仅右侧渲染当前选中表，页面高度稳定 |
| 字段「业务含义」与「指标口径/SQL」分离 | 度量字段可展开口径抽屉，链到 `04_指标口径字典` |
| 与看板/方法论弱连接 | 表详情展示「被哪些看板/API 消费」 |
| 双击交互未定义 | **统一单击**（见 §3.2） |

### 1.2 不在本次范围

- 不用 **分析方法论 L1–L5** 作为左侧主树（语义与表一对多冲突，见 §2.2）
- 不做独立重型产品（如完整 DataHub 克隆）
- 不改动数仓 DDL / ETL（仅前端 + 生成脚本 + 可选 JSON 口径）
- 首期不做写回/在线编辑字典（只读展示）

---

## 2. 信息架构

### 2.1 左侧：数仓五层树

```
ODS (8)
├── ods_orders
├── ods_payment
└── …
DIM (5)
├── dim_brand
└── …
DWD (3)
DWS (4)
ADS (9)
```

层级顺序固定：`["ODS", "DIM", "DWD", "DWS", "ADS"]`（与 Kimball 五层、DDL 分文件一致）。

每层节点显示：`层名 + 表数量`；层默认 **ODS/DWD 展开**，其余折叠（可配置）。

### 2.2 为何不用「分析五层 L1–L5」

| 维度 | 数仓五层 | 分析 L1–L5 |
|------|----------|------------|
| 节点类型 | 表 / 视图 | 分析问题 / Playbook |
| 与表关系 | 一对多（一层多表） | 多对多（一表服务多层问题） |
| 用户心智 | 「数据在哪」 | 「怎么分析」 |
| 合适入口 | 架构页 / 字典 | `anomaly.html` 方法论 |

**桥接方式（Phase 3）**：在右侧表详情增加「相关分析问题」链接，数据来自 `PLAYBOOKS` 中 SQL 引用的表名反向索引，而非把表挂到 L1 节点下。

### 2.3 右侧：详情区结构

选中 **表** 时：

```
┌─ dws_sales_daily ─────────────────────────────┐
│ [DWS] [table] · 20 字段 · 质量达标            │
│ 用途 / 来源 / 下游 / 表级血缘                 │
│ 消费看板：经营总览 · 杜邦 · …（链接）          │
├───────────────────────────────────────────────┤
│ 字段名 │ 类型 │ 角色 │ 业务含义 │ 口径        │
│ net_revenue │ DECIMAL │ 度量 │ 净收入 │ [查看]  │
│ …                                             │
└───────────────────────────────────────────────┘
```

选中 **字段** 时（单击行，非双击）：

- 行高亮
- 下方 **字段详情抽屉**（或右栏内嵌 panel）展示：
  - 业务含义 / 业务口径（若有 `caliber_id`）
  - 技术口径 / SQL 片段（来自指标字典 JSON）
  - 字段血缘 `FIELD_LINEAGE[key]`
  - 引用该字段的看板 KPI（若有）

空态：「请从左侧选择一张表」。

---

## 3. 交互规范

### 3.1 布局线框

```
┌──────────────────────────────────────────────────────────┐
│ 工具栏：搜索 │ 层级筛选 │ 统计「12表·186字段」│ 折叠总览   │
├─────────────┬────────────────────────────────────────────┤
│  240px 树   │  详情区（flex:1, min-height: 480px）        │
│             │                                            │
│  ODS ▼      │  （表头 + meta + 字段表 + 字段抽屉）         │
│    ods_*    │                                            │
│  DIM ▶      │                                            │
│  …          │                                            │
└─────────────┴────────────────────────────────────────────┘
```

- 桌面：`grid-template-columns: 240px 1fr`，间距 16px
- `<900px`：树改为顶部横向 **层 Tab + 表下拉**，详情占满宽（见 §5.3）

### 3.2 操作映射（禁止双击）

| 用户操作 | 行为 |
|----------|------|
| 单击层名 | 展开/折叠该层下表列表 |
| 单击表名 | 右侧渲染表详情；URL hash 更新 `#dict/dws_sales_daily` |
| 单击字段行 | 高亮 + 打开字段抽屉（口径/血缘） |
| 搜索输入 | 过滤树（匹配表名、字段名、purpose）；无匹配时树空态提示 |
| 全局搜索跳入 | 读取 `sessionStorage` / hash，自动选中表并高亮字段 |
| Esc | 关闭字段抽屉 |

键盘：`↑↓` 在同级表间移动，`Enter` 选中（可选 Phase 2）。

### 3.3 URL 与深链

```
architecture.html#data-dictionary-section
architecture.html#dict/dws_sales_daily
architecture.html#dict/dws_sales_daily/net_revenue
```

- 改造 `search-index-data.js`：`anchor` 从 `dd-${name}` 改为 `dict/${name}` 或保留旧 anchor 兼容映射
- `global-search.js` 已有 `highlightFieldKey` → 扩展为 `dictNavigate({ table, field })`

---

## 4. 数据模型

### 4.1 现有结构（保持不变）

`data-dictionary-data.js` 中每张表：

```javascript
{
  name: "dws_sales_daily",
  layer: "DWS",
  type: "table",
  purpose: "日销售汇总",
  source: "sql6_portfolio_model",
  downstream: ["v_overview", "v_dupont"],
  lineage: ["ods_orders", "dwd_sales_wide", "dws_sales_daily"],
  field_count: 20,
  fields: [
    { name, type, desc, business, role }
  ]
}
```

生成脚本：

- 零售：`retail-finance-analysis/scripts/generate_sql6_dictionary_js.py`
- 互联网：`portfolio/industries/internet/database/gen_ott_data_dict.py`
- 制造：待对齐（当前有 `data-dictionary-data.js`，需确认生成脚本）

### 4.2 Phase 2 扩展字段（可选，向后兼容）

**表级：**

```javascript
{
  used_by_dashboards: ["overview", "dupont"],  // 看板 id
  used_by_apis: ["/api/overview/kpi"],        // 可选
  quality_status: "达标"                       // 与 overview 对齐
}
```

**字段级：**

```javascript
{
  name: "net_revenue",
  caliber_id: "net_revenue",   // 对应 METRIC_CALIBER 主键
  nullable: false,
  unit: "元"
}
```

**新增独立文件 `metric-caliber-data.js`（零售试点）：**

```javascript
window.METRIC_CALIBER = {
  net_revenue: {
    label: "净收入",
    business: "扣除退货后的确认销售收入",
    technical: "SUM(net_amount) WHERE order_status <> 'cancelled'",
    source_table: "dws_sales_daily",
    exclude_rules: "排除作废订单、内部往来",
    refresh: "T+1"
  }
};
```

来源：`portfolio/industries/retail/docs/04_指标口径字典.md` → 新增 `scripts/export_metric_caliber.py` 导出 JSON/JS（不必 Phase 1 全量，先覆盖 Top20 度量字段）。

### 4.3 层树构建逻辑（前端）

```javascript
const LAYER_ORDER = ["ODS", "DIM", "DWD", "DWS", "ADS"];

function buildLayerTree(tables) {
  const map = Object.fromEntries(LAYER_ORDER.map((l) => [l, []]));
  tables.forEach((t) => {
    if (!map[t.layer]) map[t.layer] = [];
    map[t.layer].push(t);
  });
  LAYER_ORDER.forEach((l) => map[l].sort((a, b) => a.name.localeCompare(b.name)));
  return map;
}
```

---

## 5. 前端实现

### 5.1 文件变更清单

| 操作 | 路径 | 说明 |
|------|------|------|
| **重构** | `portfolio/industries/*/js/data-dictionary.js` | 三行业先改 retail，验证后复制 |
| **合并** | `portfolio/css/data-dictionary.css` | 从 `platform-features.css` 抽出 dd-*，三行业共引 |
| **保留** | `data-dictionary-data.js` | 仍由 Python 生成，Phase 1 不改 schema |
| **微调** | `search-index-data.js` | 更新 anchor / fieldKey 导航 |
| **微调** | `global-search.js` | 统一 `dictNavigate` API |
| **微调** | `dw-architecture.js` | 点击分层图节点 → `DataDictionaryUI.selectTable(name)` |
| **可选** | `pages/dictionary.html` | Phase 3 全屏字典（架构页嵌入同一组件） |

**推荐目录结构（Phase 2 合并）：**

```
portfolio/
├── css/
│   └── data-dictionary.css      # 新：Master-Detail 样式
├── js/
│   └── data-dictionary-core.js  # 新：共享渲染逻辑（三行业引用）
└── industries/retail/js/
    └── data-dictionary.js       # 薄封装：render(rootId) + 行业配置
```

Phase 1 可仅在 `retail/js/data-dictionary.js` 内改，验证后再抽到 `portfolio/js/`。

### 5.2 核心 API 设计

```javascript
window.DataDictionaryUI = {
  render(rootId, options?) → {
    selectTable(name: string): void,
    selectField(table: string, field: string): void,
    highlightField(fieldKey: string): void,  // 兼容 "table.field"
    filter(keyword: string): void,
    getState(): { table, field, layer },
  }
};
```

`options`：

```javascript
{
  defaultLayerOpen: ["ODS", "DWD"],
  showOverview: true,      // 顶部字段统计总览可折叠
  compact: false,          // 嵌入架构页 vs 全屏页
}
```

### 5.3 CSS 类名规范

```css
.dd-shell { display: grid; grid-template-columns: 240px 1fr; gap: 16px; min-height: 480px; }
.dd-tree { overflow-y: auto; max-height: 70vh; border-right: 1px solid var(--card-border); }
.dd-tree-layer { /* 层标题 */ }
.dd-tree-layer.is-open .dd-tree-tables { display: block; }
.dd-tree-table { /* 表项 */ }
.dd-tree-table.is-active { background: var(--primary-soft); border-left: 3px solid var(--primary); }
.dd-detail { overflow-y: auto; }
.dd-detail-empty { /* 未选表 */ }
.dd-field-row.is-selected { /* 选中字段 */ }
.dd-field-drawer { /* 字段口径抽屉 */ }
.dd-field-drawer.is-open { ... }

@media (max-width: 900px) {
  .dd-shell { grid-template-columns: 1fr; }
  .dd-tree { max-height: none; border-right: none; /* 改为 layer tabs */ }
}
```

复用现有 token：`.dd-layer-ODS` … `.dd-layer-ADS`、`.dd-role-*`、`.dd-lineage-*`（**补充 `.dd-layer-DIM`**，当前 CSS 缺 DIM 徽章样式）。

### 5.4 渲染伪代码

```javascript
function render(rootId) {
  const state = { table: null, field: null, filter: "", layerFilter: "" };
  // 1. 挂载 shell：toolbar + tree + detail
  // 2. drawTree() → 按 buildLayerTree 过滤
  // 3. selectTable(name) → renderDetail(table) + hash + active class
  // 4. selectField(t, f) → 行高亮 + renderFieldDrawer
  // 5. 监听 hashchange / 初始 hash 解析
  // 6. 保留 renderOverview() 作为可折叠顶栏
  return { selectTable, selectField, highlightField, ... };
}
```

**向后兼容：**

- 保留 DOM id `dd-${tableName}` 在树节点上，旧链接 `#dd-ods_orders` 重定向到 `#dict/ods_orders`
- `openTable(name)` 方法保留，内部调用 `selectTable(name)`

---

## 6. 集成点

### 6.1 全局搜索

`search-index-data.js` 表/字段条目：

```javascript
{
  url: paths.architecture,
  anchor: "",  // 改用 query-less hash
  hash: `dict/${t.name}`,           // 新
  fieldKey: `${t.name}.${f.name}`,
}
```

`global-search.js` 点击字段：

```javascript
sessionStorage.setItem("dictNav", JSON.stringify({ table, field }));
// architecture 页 load 后 DataDictionaryUI 读取并 selectField
```

### 6.2 数仓架构分层图

`dw-architecture.js` 已有 `DATA_DICTIONARY.find` 逻辑；扩展为：

```javascript
onLayerNodeClick(tableName) {
  document.getElementById("data-dictionary-section")?.scrollIntoView();
  window.DataDictionaryUI?.selectTable(tableName);
}
```

### 6.3 知识图谱

`dw-knowledge-graph.js` 节点双击/单击 → 同上 `selectTable`。

### 6.4 PDF 报告

`report.html` 保持静态摘要；文案更新为：

> 完整交互字典（Master-Detail · 字段口径）见 `architecture.html#data-dictionary-section`

无需 Phase 1 改 PDF 版式。

### 6.5 看板反查（Phase 2）

在 `dashboards.json` 或 `dashboard-core.js` 增加可选字段：

```json
{ "id": "overview", "primary_tables": ["dws_sales_daily", "v_overview"] }
```

生成脚本写入 `used_by_dashboards`；字典表详情渲染为链接：`retail_dashboard.html#overview`。

---

## 7. 分阶段实施

### Phase 1 · Master-Detail 壳（2–3 天）— 零售试点

- [ ] 重构 `retail/js/data-dictionary.js`：左树 + 右详情
- [ ] 补充 `.dd-layer-DIM` 样式；`data-dictionary.css` 从 platform-features 拆分（或先在 retail 引新文件）
- [ ] URL hash `#dict/{table}/{field?}` + 旧 anchor 兼容
- [ ] 更新 `retail/search-index-data.js`、`global-search.js` 导航
- [ ] `architecture.html` 区块文案微调
- [ ] 自测：搜索跳转、字段血缘、层筛选、移动端 Tab 降级

**验收标准：**

- 选表后页面不再纵向展开全部表
- 从顶栏搜索「dws_sales_daily」能直达并选中
- 无 JS 控制台错误；三行业 retail 架构页字典可用

### Phase 2 · 三行业同步 + 口径（3–4 天）

- [ ] 抽 `portfolio/js/data-dictionary-core.js`，retail/internet/manufacturing 薄封装
- [ ] `platform-features.css` 中 dd-* 迁移至 `portfolio/css/data-dictionary.css`（三行业 HTML 加 link）
- [ ] 零售：`export_metric_caliber.py` + `metric-caliber-data.js`（Top20 度量）
- [ ] 字段抽屉展示 business + technical 口径
- [ ] `generate_sql6_dictionary_js.py` 增加 `used_by_dashboards`（从 DOWNSTREAM + dashboards.json 推导）

**同步副本（Impact Sync）：**

- `retail-finance-analysis/docs/shared/data-dictionary.js`（若存在需对齐）
- 互联网/制造 `architecture.html` 同一组件

### Phase 3 · 联动增强（可选，2–3 天）

- [ ] `pages/dictionary.html` 全屏页（仅字典 + 顶栏），架构页用「全屏打开」链出
- [ ] PLAYBOOKS 反向索引 → 表详情「相关分析问题」
- [ ] 看板侧栏「数据字典」抽屉（调用同一 `DataDictionaryUI`，`compact: true`）
- [ ] `dw-architecture` / 知识图谱点击联动

### Phase 4 · 元数据（若改导航/配置）

若新增 `dictionary.html` 进站点导航或改 `dashboards.json` 结构：

```bash
cd portfolio
python scripts/export_portfolio_config.py --version v3.3 --notes "数据字典 Master-Detail"
python scripts/apply_version_sql.py --version v3.3 --notes "数据字典 Master-Detail"
```

---

## 8. 测试清单

| # | 场景 | 预期 |
|---|------|------|
| 1 | 打开架构页字典区 | 左树 ODS 展开，右侧空态 |
| 2 | 单击 `dws_sales_daily` | 右侧表元数据 + 字段表 |
| 3 | 单击字段 `net_revenue` | 抽屉展示含义 + 血缘（若有） |
| 4 | 顶栏搜索字段名 | 跳转架构页并选中表+字段 |
| 5 | 筛选框输入 `dim_` | 树只显示匹配表 |
| 6 | 层下拉选 ADS | 树只显示 ADS 层 |
| 7 | 复制 URL `#dict/dws_sales_daily` | 刷新后状态恢复 |
| 8 | 宽度 375px | 层 Tab + 表选择可用，详情可读 |
| 9 | 旧链接 `#dd-ods_orders` | 仍能定位到 ods_orders |
| 10 | 无 DATA_DICTIONARY | 优雅空态，不抛错 |

---

## 9. 风险与对策

| 风险 | 对策 |
|------|------|
| 三份 `data-dictionary.js` 再次分叉 | Phase 2 必须抽 core，行业目录只留 10 行配置 |
| 口径 Markdown 与 JS 双维护 | 口径以 Markdown 为源，脚本导出；字段只存 `caliber_id` |
| 架构页过长，字典仍在底部 | Phase 3 全屏页 + 架构页锚点导航保留 |
| `platform-features.css` 拆分遗漏 | grep `dd-` 确认全部迁移 |
| DIM 层样式缺失 | Phase 1 补 `.dd-layer-DIM { background: #312e81; color: #c4b5fd; }` |

---

## 10. 工作量估算

| 阶段 | 人天 | 产出 |
|------|------|------|
| Phase 1 | 2–3 | 零售 Master-Detail 可用 |
| Phase 2 | 3–4 | 三行业统一 + 口径试点 |
| Phase 3 | 2–3 | 全屏页 + 看板/方法论联动 |
| **合计** | **7–10** | 生产级字典体验 |

---

## 11. 实施顺序建议

```
Phase 1 retail 试点
    → 设计评审（树宽、抽屉 vs 底栏）
    → Phase 2 抽 core + 三行业复制
    → 口径 JSON 导出（零售 Top20）
    → Phase 3 按反馈做全屏/看板抽屉
```

**建议第一步**：只改 `portfolio/industries/retail/js/data-dictionary.js` + 新增 `retail/css/data-dictionary.css`，不动数仓与 API，1 天内可出可点击原型。

---

## 12. 附录：与现有文件对照

| 文件 | 当前职责 | 改造后 |
|------|----------|--------|
| `data-dictionary.js` | 手风琴 render + filter | Master-Detail 控制器 |
| `data-dictionary-data.js` | 表/字段静态数据 | 不变（Phase 2 扩展可选字段） |
| `platform-features.css` § dd-* | 字典样式 | 迁至 `data-dictionary.css` |
| `global-search.js` | fieldKey → highlightField | + dictNav 表级跳转 |
| `search-index-data.js` | anchor: `dd-${name}` | hash: `dict/${name}` |
| `generate_sql6_dictionary_js.py` | DDL → JS | Phase 2 + dashboards 反查 |
| `04_指标口径字典.md` | 文档口径 | Phase 2 导出 `metric-caliber-data.js` |

---

*本文档为前端改造方案；实施时若变更站点导航或行业配置，须同步 `portfolio_metadata` 版本快照（见 `.cursor/rules/portfolio-version-sync.mdc`）。*
