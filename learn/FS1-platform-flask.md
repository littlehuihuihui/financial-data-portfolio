# 全栈 FS1 · 平台 Flask 与静态托管

> **证据**：`portfolio/portfolio_app.py`、`learn_app.py`。

## 1. 平台职责

`portfolio_app.py` 同时做三件事：

1. **静态资源**：`Flask(..., static_folder=ROOT, static_url_path="")`  
2. **元数据 API**：`/api/health`、`/api/industries` 等（连 `portfolio_metadata`）  
3. **行业 API 反向代理**：`/api/<path>` → 5000/5001/5002  

教材进程 `learn_app.py` **只做静态 + `/` 重定向到课表**，不代理行业 API。

## 2. 环境变量（实档默认）

见 `_metadata_config` / `RETAIL_API_BASE` 等：`DB_*`、`PORTFOLIO_PORT`、`LEARN_PORT`、各 `*_API_BASE`。

## 3. 练习

1. 画出「浏览器 → 5100 → 静态 HTML」与「浏览器 → 5100/api → 5001」两条路径。  
2. 若元数据库宕机：哪些页面仍可用？（静态 HTML/JS 演示回退）——对照 `index.html` 健康检查文案。  
3. 对比 `learn_app` 与 `portfolio_app` 的路由差异（有无 proxy）。
