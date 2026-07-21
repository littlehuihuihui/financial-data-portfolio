# 制造业 · 生产运营数据分析作品集

独立行业模块，数据库 `manufacturing_analytics`，API 端口 **5002**。

## 快速启动

```bat
portfolio\一键启动.bat
```

浏览器：`http://127.0.0.1:5100/industries/manufacturing/manufacturing_dashboard.html`

仅制造业 API：`portfolio\启动制造业API.bat` → `http://127.0.0.1:5002/`

## 数仓（31 对象）

| 层级 | 数量 | 说明 |
|------|------|------|
| ODS | 8 | 工单、产线、质检、物料、库存、供应商、设备、工时 |
| DIM | 5 | 产品、产线、供应商、物料、日期 |
| DWD | 3 | 生产/质量/供应链宽表 |
| DWS | 5 | 生产/质量/供应链/设备/成本汇总 |
| ADS | 10 | 10 个主题分析视图 |

灌数：`cd database && python seed_manufacturing_data.py`

## PDF 报告导出

| 方式 | 说明 |
|------|------|
| 浏览器 | 打开 `pdf/report.html` → 点击「下载 PDF」（需 API :5002 运行） |
| 命令行 | `cd pdf && python export_manufacturing.py --month 202607` |

报告结构：封面 · 10 项核心 KPI · 看板数据表 · 异常诊断 · 5 条优化建议 · 数仓/方法论摘要。


生产总览 · 质量分析 · 供应链 · 设备OEE · 成本 · 产能利用率 · 不良分析 · 物料周转 · 人工效率 · 生产成本财务

## 方法论

六层框架 + 制造业工具箱（柏拉图/OEE/SPC/5Why/供应商评分卡等），见 `pages/methodology.html`

## 元数据注册

```sql
source portfolio_metadata/sql/insert_version_manufacturing_v1_0.sql
```
