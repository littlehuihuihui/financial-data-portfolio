# 全栈导读 FS0 · 本作品集技术栈地图（有据）

> **轨**：全栈选修。先建立「五进程 + 静态前端 + 元数据」心智模型。  
> **证据**：`portfolio/五个服务怎么开.txt`、`portfolio_app.py`、`learn_app.py`、各行业 `app.py`。

## 1. 运行时拓扑（本地）

| 端口 | 进程 | 入口文件 |
|------|------|----------|
| 5000 | 零售 API | `retail-finance-analysis/app.py` |
| 5001 | 互联网 API | `internet-analytics/app.py` |
| 5002 | 制造业 API | `manufacturing-analytics/app.py` |
| 5100 | 平台入口（静态+元数据+代理） | `portfolio/portfolio_app.py` |
| 5101 | 教材入口（静态） | `portfolio/learn_app.py` |

浏览器日常看 **5100**；教材可用 **5101**。

## 2. 请求怎么走

1. 打开 `http://127.0.0.1:5100/industries/internet/...html`  
2. 前端 `loaders.js` 等请求 `/api/...`  
3. `portfolio_app.py` 的 `proxy_industry_api` 按 **Referer** 或路由集合转发到 5000/5001/5002  

> **证据**：`portfolio_app.py` · `_resolve_api_base` / `INTERNET_API_ROOTS` / `MANUFACTURING_API_ROOTS`。

## 3. 全栈学习顺序（建议）

`FS0 → FS1（平台 Flask）→ FS2（行业 API + 代理）→ FS3（前端壳与数据加载）→ 回到 DE 主线把口径接到看板`

## 4. 仓库对照

1. 打开 `五个服务怎么开.txt`，默写五端口。  
2. 在 `portfolio_app.py` 找到 `static_folder` 与 `/api/<path:subpath>`。  
3. 说明：为何只开 5000 不够看作品集 UI。
