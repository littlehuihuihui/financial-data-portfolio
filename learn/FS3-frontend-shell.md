# 全栈 FS3 · 前端壳、加载器与演示数据

> **证据**：`portfolio/industries/*/js/shell.js`、`loaders.js`、`dashboard-core.js`；`index.html` 静态托管分支。

## 1. 结构

- **壳**：顶栏/侧栏导航（`shell.js` + 行业 CSS）  
- **页**：dashboard HTML + 图表容器  
- **加载**：`loaders.js` 拉 `/api/...` 或本地 `data/demo/*.json` 回退  

GitHub Pages 等纯静态场景会走本地回退（见 `index.html` 中 `github.io` 判断逻辑）。

## 2. 与数仓的衔接点

看板 KPI ↔ ADS 视图/API 字段 ↔ 口径文档。  
全栈同学要会：**从卡片反查 API → 反查 SQL/视图 → 反查 DWS**（结合第 05/P2e）。

## 3. 练习

1. 打开互联网 `loaders.js`，找到一处 `dashboard_` 请求名。  
2. 在对应行业后端或 demo JSON 中定位同名数据。  
3. 写 5 行：若 API 500，前端应如何降级（对照现有回退）。
