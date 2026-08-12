# 多行业数据平台 · 样式优化建议

> 文档版本：v1.0 · 2026-08-10  
> 适用范围：`portfolio/` 主工程（入口页 + 零售 / 互联网 / 制造业三模块）  
> 技术栈：静态 HTML + 原生 CSS + ECharts 5 · 无 React/Vue/Tailwind

---

## 1. 现状概览

### 1.1 页面层级

| 层级 | 代表文件 | 当前风格关键词 |
|------|----------|----------------|
| **平台入口** | `portfolio/index.html` | 赛博/Data Nexus：网格背景、扫描线、Orbitron 标题、青紫渐变 |
| **看板 Shell** | `*/retail_dashboard.html` 等 | 深色商务：蓝灰面板、KPI 卡片、ECharts |
| **方法论** | `pages/anomaly.html` | 独立 inline CSS，五层色带（L1–L5） |
| **数仓架构** | `pages/architecture.html` + `dw-architecture.css` | 与 `style.css` 混用，偏文档型 |
| **PDF 报告** | `pages/report.html` + `report.css` | 打印友好，与屏幕看板分离 |

### 1.2 样式文件分布

```
portfolio/
├── index.html                    # 样式全部 inline（~190 行）
└── industries/{retail,internet,manufacturing}/
    ├── css/
    │   ├── style.css             # 三份几乎相同（~1400 行）
    │   ├── dashboard.css         # 三份几乎相同（~650 行）
    │   ├── platform-features.css # 三份完全相同（~890 行）
    │   ├── shell.css / dw-architecture.css / report.css …
    └── js/dashboard-core.js      # 各行业独立 THEME.palette
```

另有 `retail-finance-analysis/docs/` 下遗留副本，与 `portfolio/industries/retail/` 并行，存在**双源维护**风险。

---

## 2. 主要问题诊断

### 2.1 视觉语言割裂（高优先级）

**入口页 vs 行业页是两套完全不同的设计体系：**

| 维度 | 平台入口 `index.html` | 行业模块 `style.css` / `dashboard.css` |
|------|----------------------|----------------------------------------|
| 主色 | `#22d3ee` 青、`#a78bfa` 紫 | `#4da3ff` 蓝 |
| 背景 | `#030712` + 网格/光晕/扫描线 | `#0a0e1a` / `#0f1419` 纯色深灰 |
| 标题字体 | Orbitron | 系统 sans-serif |
| 装饰 | 强科技感动效 | 克制阴影 + 边框 |
| 品牌名 | 「多行业数据平台 · Data Nexus」 | 零售仍用「跃动体育」（CSS 注释三行业均为「跃动体育」） |

用户从入口点击进入行业模块后，会产生**「换了一个产品」**的跳跃感，削弱「统一平台」的定位。

### 2.2 设计 Token 碎片化（高优先级）

当前至少存在 **4 套 `:root` 变量命名**，互不继承：

```css
/* index.html */
--bg0, --cyan, --violet, --emerald …

/* style.css */
--bg, --primary, --card-bg, --text-secondary …

/* dashboard.css (.page-dashboard) */
--dash-bg, --dash-card, --dash-accent, --dash-accent2 …

/* anomaly.html inline */
--l1 … --l5, --surface, --sql-bg …
```

同一语义（如「次要文字色」）在不同文件中分别为 `#64748b`、`#8892a4`、`#8b95a8`、`#94a3b8`，肉眼接近但维护时无法统一替换。

### 2.3 CSS 重复与注释过时（中优先级）

- `style.css`、`dashboard.css`、`platform-features.css` 在三个行业目录**逐字复制**，任何全局改动需改 3 处。
- 文件头注释统一写「跃动体育 · 深色科技风」，与互联网/制造业品牌不符。
- 大量硬编码色值（如 `#141b2d`、`#2d3a4f`）未引用变量，散落在 `dashboard.css`、`shell.css`、`dw-architecture.css` 中。

### 2.4 图表主题与 UI 脱节（中优先级）

各行业 `dashboard-core.js` 中 `THEME.palette` 独立定义，且与 CSS 主色不一致：

| 行业 | palette 首色 | CSS `--primary` / `--dash-accent` |
|------|-------------|-----------------------------------|
| 零售 | `#1a5276`（深蓝） | `#4da3ff` / `#1a5276` |
| 互联网 | `#8e44ad`（紫） | `#4da3ff`（与 UI 无关） |
| 制造业 | `#e67e22`（橙） | `#4da3ff`（与 UI 无关） |

入口页行业卡片已定义差异化 accent（零售绿青、互联网紫青、制造琥珀绿），但**行业内部页面未承接**该差异化，三行业 Shell 外观几乎一致。

### 2.5 导航与布局不一致（中优先级）

- 看板页：`dashboard-header` + `dash-nav-wrap`（双 sticky 层，top: 0 / 56px）
- 架构/ERP 页：`top-nav` + `nav-inner-with-search`
- 方法论页：inline 样式 + 简化 `.nav-tab`

三处 Tab 的 padding、圆角（6px / 8px / 20px）、active 态（白底半透明 vs 纯色 `--l1`）均不统一。

### 2.6 响应式与可用性（中低优先级）

- 看板 header 含品牌 + 全局搜索 + 4 个 Tab，768px 以下易换行堆叠，搜索框 `max-width: 300px` 占满首屏。
- `dash-nav-tabs` 在窄屏可横向滚动（`shell.css` 已处理），但 `dashboard-header` 未做同等处理。
- 全站仅深色主题，无 `prefers-color-scheme` 或高对比模式。
- KPI/表格依赖颜色表达涨跌（绿/红），色觉障碍用户可能难以区分（建议增加 ↑↓ 符号，部分页面已有 `delta.up/down`）。

### 2.7 字体加载策略（低优先级）

- 入口页通过 Google Fonts 加载 Orbitron + JetBrains Mono；行业页不加载，仅在 `platform-features.css` 的 SQL/代码块使用 JetBrains（可能 fallback 到 Consolas）。
- 国内/GitHub Pages 静态部署时，Google Fonts 偶发慢或不可用。

---

## 3. 优化目标

1. **一套平台视觉语言**：入口 → 行业 → 看板 → 方法论，过渡自然，用户感知为「同一产品下的三个模块」。
2. **可维护的设计系统**：单一 Token 源 + 行业 accent 扩展，减少 3× 重复维护。
3. **行业可识别、平台可统一**：共享骨架，差异化 accent / 图表色 / 卡片顶线。
4. **数据阅读优先**：看板区弱化装饰、强化 KPI 层级、表格与图表对齐。
5. **渐进式落地**：不推翻现有 HTML 结构，优先 Token 抽取与 CSS 合并，避免大规模重写。

---

## 4. 设计系统建议

### 4.1 建立共享 Token 文件

建议新增 **`portfolio/css/design-tokens.css`**（或 `portfolio/shared/css/tokens.css`），作为全平台唯一变量源：

```css
:root {
  /* ── 平台基础（Platform Core） ── */
  --color-bg-base:     #0a0f1e;
  --color-bg-elevated: #141b2d;
  --color-bg-sunken:   #0d1220;
  --color-border:      #1e2a4a;
  --color-border-focus:#4da3ff;

  --color-text-primary:   #e8edf5;
  --color-text-secondary: #8892a4;
  --color-text-muted:     #64748b;

  --color-primary:   #4da3ff;
  --color-success:   #22c55e;
  --color-warning:   #fbbf24;
  --color-danger:    #ef4444;

  /* ── 间距 & 圆角 ── */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --nav-height: 56px;

  /* ── 字体 ── */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
               "Microsoft YaHei", sans-serif;
  --font-display: "Orbitron", var(--font-sans);      /* 仅平台级标题 */
  --font-mono: "JetBrains Mono", Consolas, monospace; /* 指标/代码/SQL */

  /* ── 阴影 ── */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.35);
  --shadow-glow-primary: 0 0 20px rgba(77, 163, 255, 0.25);
}

/* ── 行业 Accent（覆盖层） ── */
[data-industry="retail"] {
  --color-accent:       #34d399;
  --color-accent-alt:   #22d3ee;
  --chart-palette:      #1a5276, #2874a6, #5499c7, #27ae60, #e67e22, #7f8c8d;
}
[data-industry="internet"] {
  --color-accent:       #a78bfa;
  --color-accent-alt:   #22d3ee;
  --chart-palette:      #8e44ad, #9b59b6, #af7ac5, #27ae60, #e67e22, #7f8c8d;
}
[data-industry="manufacturing"] {
  --color-accent:       #fbbf24;
  --color-accent-alt:   #34d399;
  --chart-palette:      #e67e22, #d35400, #f39c12, #27ae60, #2980b9, #7f8c8d;
}
```

**落地方式：** 各行业根 `<html>` 或 `<body>` 增加 `data-industry="retail"`；现有 `--bg`、`--dash-bg` 等逐步 alias 到新 Token，过渡期双写即可。

### 4.2 统一视觉方向：「深色专业 + 轻科技」

建议在「入口赛博风」与「行业商务风」之间取折中：

| 元素 | 建议 |
|------|------|
| 背景 | 保留入口的** subtle 网格**（opacity ≤ 0.03），行业页可取消扫描线 |
| 主色 | 平台级 `#4da3ff`；行业 accent 用于顶栏下划线、KPI 高亮、卡片顶线 |
| 标题 | 平台/行业名用 `--font-display`（Orbitron）；正文与 KPI 用 `--font-sans` |
| 数字 | KPI 值、统计数用 `--font-mono` + `font-variant-numeric: tabular-nums` |
| 卡片 | 统一 `border-radius: var(--radius-lg)`；hover 轻微 `translateY(-2px)`，避免入口页 -4px 过强 |
| 动效 | 仅入口 badge pulse + 卡片 hover；看板区禁止装饰性动画 |

### 4.3 五层方法论色（L1–L5）标准化

`anomaly.html` 的层色已有良好语义，建议升格为平台常量，与监控框架文档对齐：

| 层 | 变量 | 色值 | 用途 |
|----|------|------|------|
| L1 描述 | `--layer-l1` | `#3b82f6` | 总览/趋势 |
| L2 诊断 | `--layer-l2` | `#8b5cf6` | 维度拆解 |
| L3 归因 | `--layer-l3` | `#06b6d4` | 因果/路径 |
| L4 预测 | `--layer-l4` | `#f59e0b` | 预警/情景 |
| L5 决策 | `--layer-l5` | `#22c55e` | 行动建议 |
| L6 工具箱 | `--layer-l6` | `#f472b6` | 分析方法（已有 `--l6`） |

侧栏导航仍仅展示 L1–L5（与现有规则一致），L6 仅在页底与 PDF P2c 露出。

### 4.4 图表主题统一

在共享 `chart-theme.js` 中从 CSS 变量读取 palette（或通过 `getComputedStyle`），保证 ECharts 与 UI accent 一致：

```javascript
const THEME = {
  background: "transparent",
  text: getCss("--color-text-primary"),
  muted: getCss("--color-text-secondary"),
  palette: getCss("--chart-palette").split(",").map(s => s.trim()),
  grid: { borderColor: getCss("--color-border") },
};
```

---

## 5. 分模块优化建议

### 5.1 平台入口 `index.html`

| 项 | 现状 | 建议 |
|----|------|------|
| 样式组织 | 全部 inline | 抽出 `portfolio/css/landing.css`，入口 HTML 只保留结构 |
| 与行业衔接 | 风格差异大 | 卡片 hover 光晕保留；行业页顶栏增加与卡片同色 `--accent-line` 细线 |
| 字体 | 依赖 Google Fonts | 增加 `font-display: swap`；备选本地 woff2 或系统字体 fallback |
| 状态 pill | 三色点 | 与行业页统一 success/warning/danger Token |
| 无障碍 | 链接仅靠颜色 | footer 链接增加 `underline-offset` hover 态 |

### 5.2 看板 Shell（`*_dashboard.html`）

| 项 | 建议 |
|----|------|
| Header | 单行过高时：品牌缩短为「零售财务 · 看板」；搜索收进 🔍 图标按钮（≤768px） |
| 双 sticky | 合并为单层：顶栏固定 + 看板 Tab 在其下方，`scroll-padding-top` 防止锚点被挡 |
| KPI 卡片 | 统一结构：`label` → `value`（mono 大号）→ `delta`（带 ↑↓ 符号 + 颜色） |
| 监控标签 | `北极星/围栏/核心` 图例使用统一 badge 组件（`.badge-polar`, `.badge-fence`, `.badge-core`） |
| 空态/加载 | `.empty-hint` 增加 skeleton 占位，避免白屏闪烁 |

### 5.3 方法论页 `anomaly.html`

| 项 | 建议 |
|----|------|
| inline CSS | 迁移至 `css/methodology.css`，变量引用 `design-tokens.css` |
| 布局 | 左侧层导航 + 右侧详情，窄屏改为顶部横向层 Tab（与 `platform-features` 工具箱侧栏规则一致） |
| 问题卡片 | 统一 `.q-card` 与看板 `.kpi-card` 的 border/shadow Token |
| SQL 块 | 已有 `--sql-bg`，统一用 `--font-mono` + 行号可选 |

### 5.4 数仓架构页

| 项 | 建议 |
|----|------|
| `dw-architecture.css` | 硬编码 `#4da3ff` → `var(--color-primary)` |
| 分层色带 | ODS/DIM/DWD/DWS/ADS 五色与数仓文档一致，写入 Token |
| 知识图谱 | `dw-knowledge-graph.css` 节点色与分层色带联动 |

### 5.5 PDF 报告 `report.css`

| 项 | 建议 |
|----|------|
| 屏幕预览 | 增加 `@media screen` 纸张阴影，模拟 A4 |
| 打印 | 保持现有 `@media print`；图表转静态图时确保对比度 ≥ 4.5:1 |
| 品牌 | 页眉统一「多行业数据平台 · {行业名}」，弱化「跃动体育」单一品牌 |

### 5.6 平台扩展功能 `platform-features.css`

| 项 | 建议 |
|----|------|
| 三份副本 | 合并为 `portfolio/css/platform-features.css` 单文件 |
| 全局搜索 | 下拉层 z-index 与 sticky nav 协调（当前 500 vs 200，合理） |
| 工具箱 L6 | 粉色 `--layer-l6` 与 L1–L5 视觉权重区分，避免与 danger 红混淆 |

---

## 6. 组件级规范（建议类名）

便于后续 CSS 合并后，HTML 增量改造可参照：

```
.layout-top-nav          /* 统一顶栏容器 */
.layout-top-nav__brand   /* 行业名 */
.layout-top-nav__tabs    /* Tab 组 */
.layout-top-nav__actions /* 搜索 / 导出 */

.card                    /* 通用卡片 */
.card--kpi               /* KPI 专用 */
.card--chart             /* 图表容器 min-height */

.badge                   /* 标签 */
.badge--polar | --fence | --core | --leading

.text-mono               /* 数字/代码 */
.text-delta--up | --down /* 涨跌 */

.table-data              /* 替代 scattered .data-table 微调 */
```

---

## 7. 响应式断点建议

统一断点，避免 768 / 800 / 900 混用：

| 断点 | 用途 |
|------|------|
| `≥1280px` | 看板 chart-row 两列、KPI 4 列 |
| `768px–1279px` | KPI 2 列、图表单列 |
| `<768px` | 顶栏折叠搜索、Tab 横滑、表格横向 scroll |
| `print` | 报告/PDF 专用 |

---

## 8. 实施路线图

### Phase 1 · 基础统一（1–2 天，低风险）

- [ ] 新建 `design-tokens.css`，入口页 + 零售模块试点引用
- [ ] 修正 CSS 注释与页面 title 中的「跃动体育」→ 按行业显示正确品牌
- [ ] `dashboard-core.js` palette 改为读取 CSS 变量（先改 retail）
- [ ] 统一 `--dash-*` 与 `--bg` / `--card-bg` 的 alias

### Phase 2 · CSS 合并（2–3 天，中风险）

- [ ] `platform-features.css` 三合一 → `portfolio/css/`
- [ ] `style.css` / `dashboard.css` 抽公共部分 → `portfolio/css/base.css` + `dashboard-shell.css`
- [ ] 行业目录仅保留 `industry-overrides.css`（accent + 少量差异）
- [ ] `anomaly.html` inline 样式外迁

### Phase 3 · 体验增强（3–5 天，可选）

- [ ] 入口与行业页背景/grid 视觉桥接
- [ ] 看板 header 响应式折叠
- [ ] KPI skeleton、统一 badge 组件
- [ ] 图表 tooltip / legend 样式 ECharts 全局 registerTheme
- [ ] 字体 self-host 或国内 CDN 镜像

### Phase 4 · 质量与无障碍（持续）

- [ ] Contrast 检测（WebAIM）关键文字/背景组合
- [ ] `:focus-visible` 键盘焦点环（当前 select/button 部分缺失）
- [ ] 涨跌指标强制「符号 + 颜色」双编码

---

## 9. 优先级矩阵

| 优先级 | 项目 | 收益 | 成本 |
|--------|------|------|------|
| **P0** | 设计 Token 单源 + 行业 accent | 维护成本 ↓↓↓，一致性 ↑↑ | 低 |
| **P0** | 品牌文案统一（跃动体育 / 多行业平台） | 专业度 ↑↑ | 极低 |
| **P1** | CSS 三行业 dedupe | 后续迭代速度 ↑↑ | 中 |
| **P1** | 图表 palette 与 Token 联动 | 视觉一致性 ↑↑ | 低 |
| **P1** | 导航/Tab 组件统一 | 体验连贯 ↑ | 中 |
| **P2** | 入口 ↔ 行业视觉桥接 | 平台感 ↑ | 中 |
| **P2** | 方法论页样式外迁 | 可维护性 ↑ | 低 |
| **P3** | 亮色主题 / 高对比模式 | 受众覆盖 ↑ | 高 |
| **P3** | 动效与装饰精简 | 看板可读性 ↑ | 低 |

---

## 10. 不建议做的事

1. **整体换肤为亮色**：当前用户群（数据/财务 BP）偏深色看板习惯，全量亮色 ROI 低。
2. **引入重型 UI 框架**（Bootstrap / Ant Design）：静态 HTML 体量大，迁移成本远高于 CSS 整理。
3. **入口页大幅削弱科技感**：入口承担「作品集门面」功能，保持适度差异化合理，但需与内页有色彩/字体锚点连接。
4. **每行业完全独立设计**：违背「多行业数据平台」统一入口定位；差异化应限制在 accent + 图表 + 文案。

---

## 11. 参考锚点（实施时对照）

| 文件 | 说明 |
|------|------|
| `portfolio/index.html` | 入口视觉、行业卡片 accent 定义 |
| `portfolio/industries/retail/css/style.css` | 行业页主样式（三行业同源） |
| `portfolio/industries/retail/css/dashboard.css` | 看板 scoped 变量 |
| `portfolio/industries/retail/pages/anomaly.html` | 五层色 + 方法论布局 |
| `portfolio/industries/retail/js/dashboard-core.js` | ECharts THEME |
| `portfolio/docs/monitoring_framework_cross_industry.md` | 北极星/围栏/核心语义（与 badge 样式对齐） |

---

## 12. 小结

多行业数据平台在**功能架构**上已具备统一入口、三行业隔离、六层方法论与扩展工具箱，但**视觉与样式工程**仍停留在「零售项目复制三份 + 入口单独设计」阶段。  

**最高 ROI 的优化路径**是：建立 `design-tokens.css` → 合并重复 CSS → 行业 accent 与图表联动 → 统一导航与品牌文案。  

按 Phase 1–2 实施后，预计 CSS 维护量减少约 **60%**，用户从入口进入任一行业时的视觉断裂感可明显减弱，且无需改动数仓、看板 API 或业务逻辑。

---

*本文档为样式层建议，不涉及数仓/看板指标/元数据版本同步；若实施看板导航或配置文件变更，须按 `.cursor/rules/portfolio-version-sync.mdc` 另行走版本导出流程。*
