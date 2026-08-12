# Step 8 · 多行业平台改造方案（复盘 + 路线图）

> 版本：v1.1 · 2026-08-10 · **已完成**  
> 背景：Step 1–7 已完成交互数仓（全景图 / 字典 / 图谱 / 口径）与 CSS 分层；复盘发现**静态文档串文**、**三行业能力不对等**、**Token/壳层引用链断裂**三类问题。

---

## 1. 现状诊断（摘要）

### 1.1 做得好的

| 模块 | 状态 |
|------|------|
| 全景图四列 + DIM 侧栏 | ✅ Step 5 |
| 字典 Master-Detail + 口径抽屉 + 看板链 | ✅ Step 6（零售） |
| 全景 → 字典 / 图谱 focus | ✅ |
| 公共 CSS 上提 `portfolio/css/` | ✅ Step 7 方向正确 |

### 1.2 必须修（P0）→ 已修

1. ✅ **零售 / 制造 `architecture.html` 下半段 OTT 串文** → 已换 sql6 / 制造专用 ADS·ETL·分层·技术栈；`<details>` 折叠
2. ✅ **字体色 / 背景色混乱** → Token 语义 alias + 全页直引 `platform-shell.css`
3. ✅ **看板数量 / 版本号** → index 主题看板 **44**；零售 **v3.17** / 互联网 **v2.13** / 制造 **v1.13**

### 1.3 应对齐（P1）→ 已齐

- ✅ 互联网 / 制造：全屏 `dictionary.html`、全局搜索、`metric-caliber-data.js`
- ✅ 制造 `shell.css` 薄封装；顶栏含数据字典 Tab
- ✅ 字典详情「在知识图谱中聚焦」

### 1.4 可合并（P2）→ 已落地

- ✅ `dashboard-base.css` + 行业 5 行 `@import`
- ✅ `dw-architecture.js` / `global-search.js` → `portfolio/js/`
- ✅ `methodology-shell.css` 取代方法论页内联 ~250 行

---

## 2–6. 分阶段交付（执行结果）

| 阶段 | 交付 | 状态 |
|------|------|------|
| **8a 色彩急救** | Token alias + link 链 + 方法论去内联色 | ✅ |
| **8b 架构静态区** | 零售/制造文案正确；Accordion；全景描述四列+DIM | ✅ |
| **8c 能力对齐** | 搜索 / 字典 / 口径三行业 | ✅ |
| **8d CSS/JS 合并** | dashboard-base、methodology-shell、JS 上提 | ✅ |
| **8e 元数据** | index 44；smoke 串文检测；v3.17/v2.13/v1.13 | ✅ |

辅助脚本：`scripts/fix_architecture_static_sections.py`、`scripts/apply_step8_batch.py`

---

## 7. 验收清单

- [x] 任意页面：深色底 + 浅字（shell/token 链）
- [x] 语义色走 Token（`--text` / `--primary` 等）
- [x] 零售 / 制造架构页无 `seed_ott` / `v_dau_overview` / `internet_analytics`
- [x] **应用层 ADS 映射已并入数据字典**（折叠面板 `dd-ads-application-map`；架构页静态 ADS 块已移除）
- [x] 三行业 dashboard 均有全局搜索
- [x] 看板数 / 版本号与 metadata 对齐
- [x] `smoke_frontend_regression.py` errors=0（含串文 + 能力对齐）

---

## 8. 删减 / 保留

**已删/薄化：** 三份重复 `dw-architecture.js`/`global-search.js`（stub）；架构页 OTT 幽灵段落；方法论内联大段 CSS；制造全景数据文件中的跨行业键。

**保留：** 三份行业 `dw-architecture-data.js` / `dashboard.json`；`report.css` 行业差异。
