# 全栈 FS2 · 行业 API、CORS 与代理分流

> **证据**：`internet-analytics/app.py`（及零售/制造）、`portfolio_app.py` 代理逻辑。

## 1. 为什么拆三个 API

行业看板指标不同、库不同；拆进程避免路由同名冲突。  
同名接口（如部分 `dashboard_*`）靠 **Referer 路径** 分流，而不是只靠路径前缀。

> **证据**：`portfolio_app.py` 注释：「跨行业同名接口必须靠 Referer 分流」。

## 2. 前端如何带上行业上下文

从 `/industries/internet/...` 打开页面时，Referer 含该路径，代理选 `INTERNET_API_BASE`。

## 3. 练习

1. 在 `portfolio_app.py` 列出 `INTERNET_API_ROOTS` 中任意 3 个根名。  
2. 故意只启动 5100、不启动 5001：打开互联网看板，观察失败/回退行为（记现象，勿改代码也可）。  
3. 说明 CORS 在平台侧如何配置（`flask_cors` + `CORS_ORIGINS`）。
