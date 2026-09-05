# 全栈 FS5 · 可观测与联调 Checklist

> **证据**：`portfolio_app.py` `/api/health`、代理 502；前端 loaders 回退。

## 1. 健康检查

```text
GET http://127.0.0.1:5100/api/health
```

元数据库不可用时返回非 OK（见 health 实现）。静态页仍可能打开。

## 2. 联调清单（复制打勾）

- [ ] 5000/5001/5002/5100 均 LISTENING  
- [ ] `/api/health` 可访问  
- [ ] 从互联网页打开，Network 里 `/api/dashboard_*` 状态码  
- [ ] 若 502：对应行业 API 是否未启动？Referer 是否含 `/industries/internet/`？  
- [ ] 关掉 5001 再开看板：是否落入 demo / 错误提示？  
- [ ] 教材 5101：`/pages/learn.html` 与 `/learn/00-map.md` 均 200  

## 3. 常见故障树

| 现象 | 先查 |
|------|------|
| 整站打不开 | 5100 进程 / 防火墙 |
| 页面有、图无数 | 行业 API / 代理 / demo |
| 教材白屏课文 | 是否 file://；md fetch 失败 |
| 靶场连不上 | MySQL 账号与 seed_ott 是否一致 |

## 4. 练习

故意停掉一个行业 API，记录看板与 Network 面板现象各一句话。
