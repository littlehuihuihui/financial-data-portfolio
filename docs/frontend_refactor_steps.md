# 前端改造 · 分步实施顺序

> 版本：v1.1 · 2026-08-10  
> 依据：总方案 + 当前进度（零售字典 Master-Detail Phase 1 已落地）  
> 原则：**先止血可见、再统一骨架、后扩展三行业与深度能力**

---

## 0. 当前基线（已完成）

| 项 | 状态 |
|----|------|
| 方案文档 4 份 | ✅ 已写 |
| 零售数据字典 Master-Detail（左树+右详情+`#dict/`） | ✅ 已落地 |
| **Step 1 全景图急救** | ✅ 已落地（三行业：卡片 CSS、layer/focus/full、ADS 紫、藏行业切换） |
| **Step 2 全景图 → 字典闭环** | ✅ 已落地（零售 MD 完整；互联网/制造走 openTable 兼容） |
| **Step 3 Design Tokens 试点** | ✅ 已落地（`portfolio/css/design-tokens.css` + `landing.css`；零售 style/dashboard/字典/图表读 Token） |
| **Step 4 字典 Core + 三行业同步** | ✅ 已落地（`portfolio/js/data-dictionary-core.js` + `portfolio/css/data-dictionary.css`；三行业架构页 MD 字典；零售页导航文案修复） |
| **Step 5 全景图四列 + DIM 侧栏** | ✅ 已落地（主四列 ODS/DWD/DWS/ADS；DIM 可折叠侧栏+category；工具栏合并；图例 Popover；内嵌详情；fitView；focus 总线连线；三行业同步） |
| **Step 6 口径 / 看板 / 图谱联动** | ✅ 已落地（`export_metric_caliber.py`→35 指标；字段抽屉 business+technical；`used_by_dashboards`；全景→图谱 focusNode；`dictionary.html` 全屏页） |
| **Step 7 CSS 合并 + 回归 + 版本** | ✅ 已落地（`portfolio/css` 公共层；行业薄 `@import` + `industry-overrides.css`；smoke 脚本；零售 v3.16 / 互联网 v2.12 / 制造 v1.12） |
| **Step 8 平台复盘改造** | ✅ 已落地（8a–8e：配色链、架构去 OTT、三行业字典/搜索/口径、dashboard-base + methodology-shell + JS 上提；零售 v3.17 / 互联网 v2.13 / 制造 v1.13；详见 `platform_step8_refactor_plan.md`） |

下文步骤从 **下一步该做什么** 开始编号。

---

## 总览（先后一句话）

```
Step 1  全景图急救（半天见效）
   ↓
Step 2  零售架构页打通：全景图 → 字典（闭环）
   ↓
Step 3  Design Tokens 试点（零售 + 入口）
   ↓
Step 4  字典 Core 抽取 + 三行业同步
   ↓
Step 5  全景图结构美化（四列 + DIM 侧栏）
   ↓
Step 6  口径 / 搜索 / 图谱深度联动
   ↓
Step 7  CSS 全面合并 + 回归 + 版本元数据
   ↓
Step 8  平台复盘：串文清理 + 能力对齐 + CSS/JS 再合并
```

**为什么先全景图、后 Token？**  
字典零售已可用；全景图仍是架构页「第一眼」且有明确 Bug，先修能立刻改善演示观感。Token 放在闭环之后，避免一边改色一边改布局互相打架。

---

## Step 8 · 平台复盘改造（已完成）

详见 [`platform_step8_refactor_plan.md`](./platform_step8_refactor_plan.md)。

| # | 阶段 | 结果 |
|---|------|------|
| 8a | 色彩急救 | Token 语义 alias + 全页 `platform-shell.css` |
| 8b | 架构静态区 | 零售/制造去 OTT；Accordion；描述改为四列+DIM |
| 8c | 能力对齐 | 三行业全屏字典 / 搜索 / metric-caliber |
| 8d | 工程合并 | `dashboard-base.css`、`methodology-shell.css`、JS 上提 |
| 8e | 元数据 | index 44；smoke 串文；v3.17 / v2.13 / v1.13 |

**验收：** `python portfolio/scripts/smoke_frontend_regression.py` → errors=0。

---

## Step 1 · 全景图急救（约 0.5–1 天）

**目标：** 打开架构页不再「糊卡片 + 满屏线」。

| # | 动作 | 主要文件 |
|---|------|----------|
| 1.1 | 补齐 `.dw-arch-table-name-cn` / `-en` 样式 | `retail/css/dw-architecture.css` |
| 1.2 | `drawFlows` 增加模式：默认 `layer`（仅 ODS→DWD→DWS→ADS） | `retail/js/dw-architecture.js` |
| 1.3 | 选中表时切 `focus`（只画上下游） | 同上 |
| 1.4 | ADS 层色由红改为紫/青 | `retail/js/dw-architecture-data.js` |
| 1.5 | 零售架构页隐藏跨行业切换 Tab | `dw-architecture.js` 选项 / `architecture.html` |

**验收：** 首屏可见泳道；默认连线 ≤5 条；卡片用途/表名层级清晰。

**不做：** 四列重构、DIM 侧栏（留给 Step 5）。

---

## Step 2 · 零售架构页闭环（约 0.5–1 天）

**目标：** 「点全景图表 → 字典选中同一张表」一条路径跑通。

| # | 动作 | 主要文件 |
|---|------|----------|
| 2.1 | 全景图侧栏「在数据字典中查看」调用已有 `DataDictionaryUI.selectTable` | `dw-architecture.js` + `architecture.html` |
| 2.2 | 跳转后滚动到 `#data-dictionary-section` | 同上 |
| 2.3 | 确认全局搜索 → `#dict/表名` 仍可用 | `global-search.js` / `search-index` |
| 2.4 | 架构页 section 文案与锚点导航检查 | `architecture.html` |

**验收：** 点任意表 → 字典左树高亮、右侧出详情；刷新 hash 状态不丢。

**依赖：** Step 1 建议先做完（否则演示时先看到坏全景图）。

---

## Step 3 · Design Tokens 试点（约 1–2 天）

**目标：** 有一份可引用的统一变量源，零售 + 入口开始吃。

| # | 动作 | 主要文件 |
|---|------|----------|
| 3.1 | 新建 `portfolio/css/design-tokens.css` | 新建 |
| 3.2 | 入口 `index.html` 样式外迁 `landing.css`，引用 Tokens | `portfolio/css/`、`index.html` |
| 3.3 | 零售 `style.css` / `dashboard.css` 用 alias 映射旧变量 | `retail/css/` |
| 3.4 | 字典 / 全景图层色改读 Token（含 DIM badge） | `data-dictionary.css`、`dw-architecture.css` |
| 3.5 | 零售 `dashboard-core.js` palette 对齐 Token | `retail/js/dashboard-core.js` |

**验收：** 改一处 `--color-primary`，零售顶栏 + 字典选中态同步变。

**不做：** 一次合并三行业全部 CSS（留给 Step 7）。

---

## Step 4 · 字典 Core + 三行业同步（约 2–3 天）

**目标：** 互联网、制造与零售同一套字典交互。

| # | 动作 | 主要文件 |
|---|------|----------|
| 4.1 | 抽 `portfolio/js/data-dictionary-core.js` | 新建；零售改为薄封装 |
| 4.2 | 抽 `portfolio/css/data-dictionary.css`（或共享引用） | 从 retail 上提 |
| 4.3 | 互联网 `architecture.html` + data-dictionary 对齐 | `industries/internet/` |
| 4.4 | 制造同上 | `industries/manufacturing/` |
| 4.5 | 各行业全景图 Step 1 补丁同步（简线 + 卡片 CSS + 藏行业切换） | 三份 `dw-architecture.*` |
| 4.6 | Impact Sync：`retail-finance-analysis/docs/shared/` 若仍有副本则对齐 | 副本路径 |

**验收：** 三行业架构页字典交互一致；全景图急救效果三行业一致。

---

## Step 5 · 全景图结构美化（约 2–3 天）✅

**目标：** 主链路可读，DIM 不再拖垮布局。

| # | 动作 | 主要文件 | 状态 |
|---|------|----------|------|
| 5.1 | 主流程四列：ODS / DWD / DWS / ADS | `dw-architecture.js` | ✅ |
| 5.2 | DIM 改为侧栏 + category 分组折叠 | 同上 + CSS | ✅ |
| 5.3 | 层间总线式连线（focus 模式） | `drawFlows` | ✅ |
| 5.4 | 工具栏合并为一行；图例进 Popover | CSS + JS | ✅ |
| 5.5 | 详情改为画布旁内嵌 panel（非全屏遮罩） | CSS + JS | ✅ |
| 5.6 | `fitView()` 默认缩放到四列可见 | JS | ✅ |

**验收：** 1080p 首屏可见四列层头；DIM 不撑破页面高度。

**依赖：** Step 1–2 完成后再动结构，避免返工。

---

## Step 6 · 口径与深度联动（约 2–3 天）✅

**目标：** 「字段 → 业务/技术口径 → 看板」可查。

| # | 动作 | 主要文件 | 状态 |
|---|------|----------|------|
| 6.1 | 脚本从 `04_指标口径字典.md` 导出 `metric-caliber-data.js` | `portfolio/scripts/export_metric_caliber.py` | ✅ 35 指标 |
| 6.2 | 字典字段抽屉展示 business + technical + 排除规则 | `data-dictionary-core.js` + CSS | ✅ |
| 6.3 | 表级 `used_by_dashboards`（生成脚本扩展） | `generate_sql6_dictionary_js.py` | ✅ 31 表有看板链 |
| 6.4 | 全景图 → 知识图谱 `focusNode` | `dw-architecture.js` + `dw-knowledge-graph.js` | ✅ |
| 6.5 | `pages/dictionary.html` 全屏字典页 | 零售新建；架构页「全屏打开」 | ✅ |

**验收：** 度量字段可看到 SQL/排除规则摘要；表详情有看板链接。

**用法：**
```bash
python portfolio/scripts/export_metric_caliber.py --industry retail
python retail-finance-analysis/scripts/generate_sql6_dictionary_js.py
```

---

## Step 7 · 工程收尾（约 1–2 天）✅

**目标：** 可维护、可发布。

| # | 动作 | 主要文件 | 状态 |
|---|------|----------|------|
| 7.1 | `platform-features` / `style` 等公共部分上提 | `portfolio/css/platform-*.css`、`dw-*.css` | ✅ |
| 7.2 | 行业目录薄 `@import` + `industry-overrides.css` | 三行业 `css/` | ✅ |
| 7.3 | 静态回归自检 | `scripts/smoke_frontend_regression.py` | ✅ errors=0 |
| 7.4 | 元数据版本 | 零售 **v3.16** · 互联网 **v2.12** · 制造 **v1.12** | ✅ |

**验收：** 单处改 Token 三行业生效；静态站可演示；版本号已递增。

**CSS 约定：** 见 `portfolio/css/README.md`。

**回归命令：**
```bash
cd portfolio
python scripts/smoke_frontend_regression.py
python scripts/export_portfolio_config.py --industry retail --version v3.16 --notes "..."
python scripts/apply_version_sql.py --industry retail --version v3.16 --notes "..."
```

---

## 依赖关系（简图）

```
[已完成] 零售字典 MD
              │
    ┌─────────┴─────────┐
    ▼                   ▼
 Step 1 全景图急救     （可并行准备 Token 草稿）
    │
    ▼
 Step 2 全景→字典闭环
    │
    ▼
 Step 3 Design Tokens 试点
    │
    ├──────────────┐
    ▼              ▼
 Step 4 三行业同步   Step 5 全景图四列
    │              │
    └──────┬───────┘
           ▼
      Step 6 口径联动
           ▼
      Step 7 合并+回归+版本
```

Step 4 与 Step 5 在 Step 3 之后可 **部分并行**（不同人改字典同步 vs 全景图布局）。

---

## 节奏建议（按演示优先级）

| 里程碑 | 包含步骤 | 适合场景 |
|--------|----------|----------|
| **M1 可演示架构页** | Step 1 + 2 | 本周就要给人看架构 |
| **M2 平台感成型** | + Step 3 | 入口与内页不割裂 |
| **M3 三行业齐** | + Step 4 | 作品集完整度 |
| **M4 专业级** | + Step 5 + 6 | 面试/交付加分 |
| **M5 可发布** | + Step 7 | 上线 / Pages 更新 |

---

## 每步「做完再走」的检查口

1. **Step 1 后：** 全景图默认不乱线、卡片可读  
2. **Step 2 后：** 点表能进字典  
3. **Step 3 后：** Token 一处改色生效  
4. **Step 4 后：** 三个行业字典交互一致  
5. **Step 5 后：** 首屏四列清晰  
6. **Step 6 后：** 关键度量有口径  
7. **Step 7 后：** 回归通过 + 元数据版本（如需要）

---

## 明确往后放 / 不做

| 项 | 原因 |
|----|------|
| 分析 L1–L5 当字典左树 | 与表多对多，语义错 |
| 默认画全量血缘 | 演示观感差 |
| 引入 React/UI 框架 | 成本高、与静态站不匹配 |
| 亮色主题 | ROI 低，放更后 |
| 未做完 Step 1–2 就改四列布局 | 易返工 |

---

## 建议你现在选的第一步

**直接开工 Step 1（全景图急救）** → 再 Step 2（闭环）。  
字典零售已可用，补这两步后，架构页就是「能看、能点、能查」的完整演示面。

子文档对照：

- Step 1 / 5 → `dw_architecture_visual_refactor.md`
- Step 2 / 4 / 6 → `data_dictionary_refactor_plan.md`
- Step 3 / 7 → `ui_style_optimization.md`
- 总览 → `platform_frontend_refactor_master.md`
