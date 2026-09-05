# 全栈 FS6 · 前端小靶场：KPI 字段映射

> **证据对齐**：互联网 `loaders.js` 中 `overview` 使用 `d.dau_trend` 的 `snapshot_date` / `dau` 等字段。  
> 本靶场用**独立页**练习映射，不修改生产 `loaders.js`（避免误提交）。

## 1. 打开

用 5100/5101 打开：

`http://127.0.0.1:5101/learn/lab-frontend/kpi-map-lab.html`

（或 `:5100/learn/lab-frontend/kpi-map-lab.html`）

## 2. 任务

1. 右侧是模拟 API JSON（只读）。  
2. 左侧编辑 `mapping.json` 文本：把 KPI 绑定到正确路径。  
3. 点「校验」：全部 PASS 后显示  

`FRONT_TOKEN=dnexus-lab-front-v1-PASS`

4. 粘贴到本课页面解锁（与 SQL 靶场相同机制）。

## 3. 正确映射（先别看）

:::answer 参考
- dau: `dau_trend[-1].dau` 或校验器约定的 `$.dau_trend.0.dau` 形式见页面说明  
- 以实验室页面内建期望为准
:::
