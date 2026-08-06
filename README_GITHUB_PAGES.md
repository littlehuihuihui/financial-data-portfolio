# 多行业数据作品集 · GitHub Pages

静态作品集入口：打开本仓库 Pages 根路径的 `index.html`。

本地工程目录已统一为：`D:\cursor\多行业数据平台\portfolio`（原「财务数据分析」）。

## 在线地址

配置 Pages（Settings → Pages → Deploy from branch → `main` / `/`）后访问：

`https://littlehuihuihui.github.io/financial-data-portfolio/`

> 仓库若仍为 `financial-data-portfolio`，可在 GitHub 设置中重命名为 `multi-industry-data-platform`，并同步更新 Pages 地址与本地 `push-ssh.ps1`。

## 演示模式说明

- GitHub Pages / 本地 `file://` 下自动启用 `DEMO_MODE`
- 看板数据来自各行业 `industries/*/data/demo/*.json`（样例默认值，非实时数仓）
- 本地连 MySQL + Flask 时仍可走真实 API（非 github.io 时优先请求后端）

## 本地静态预览

```bash
cd portfolio   # 或本仓库根目录
python -m http.server 8080
```

浏览器打开：http://127.0.0.1:8080/
