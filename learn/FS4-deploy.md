# 全栈 FS4 · 部署：本机五进程 vs GitHub Pages

> **证据**：`portfolio/五个服务怎么开.txt`、`README_GITHUB_PAGES.md`、`index.html` 中 `github.io` 分支。

## 1. 本机（功能完整）

- 五个进程：5000/5001/5002/5100/5101  
- 可连 MySQL、代理真实行业 API、跑靶场库  

## 2. GitHub Pages（静态展示）

- 只托管 `portfolio/` 静态文件  
- **无** Flask 代理、**无**本机 API → 前端走 demo JSON 回退  
- 教材 Markdown 仍可经静态服务读取；靶场 MySQL **需本机**  

> **证据**：`README_GITHUB_PAGES.md` 建议 `python -m http.server`；`index.html` 对 `github.io` 调整 API 提示。

## 3. 选型

| 目标 | 用 |
|------|----|
| 面试演示看板+API | 本机 All Services |
| 外链作品集门面 | Pages + 写明「完整能力需本地」 |
| 靶场 TOKEN | 仅本机 MySQL |

## 4. 练习

1. 写出 Pages 下「打不开行业 API」时用户应看到的降级行为（对照 index 文案）。  
2. 列一张「Pages 能演示 / 不能演示」表（至少各 3 项）。
