# 零售财务 · 行业模块

跃动体育零售财务数据分析系统，作为多行业平台的第一个行业实例。

## 目录说明

| 目录/文件 | 说明 |
|-----------|------|
| `retail_dashboard.html` | 行业入口 · 13 个主题看板 SPA |
| `css/` | 看板样式 |
| `js/` | 看板脚本（state / loaders / shell） |
| `dashboards/` | 各看板 HTML 片段 |
| `config/` | 看板与角色配置 JSON |
| `pages/` | 分析方法论、ERP、架构、PDF 报告等附属页面 |
| `sql/` | SQL 脚本索引（实际文件见后端仓库） |
| `etl/` | ETL 脚本索引（实际文件见后端仓库） |
| `app.py` | 启动零售行业 Flask API |

## 数据库

- 库名：`retail_finance`
- 元数据注册：`portfolio_metadata.industry_catalog`（`industry_code = retail`）

## 启动方式

**方式 A · 通过平台统一入口（推荐）**

```bash
# 终端 1：零售 API
cd portfolio/industries/retail
python app.py

# 终端 2：平台入口（含 API 代理）
cd portfolio
python portfolio_app.py
```

浏览器打开 http://127.0.0.1:5100/ → 点击「零售财务」

**方式 B · 仅零售看板**

```bash
cd portfolio/industries/retail
python app.py
# 浏览器 http://127.0.0.1:5000/industries/retail/retail_dashboard.html
```

## 后端代码位置

完整 Python 后端、数仓 DDL、ETL 脚本位于同级目录：

```
../../retail-finance-analysis/
├── app.py
├── queries.py
├── sql2/
├── ddl/
└── scripts/
```

本目录 `sql/` 与 `etl/` 为索引说明，避免重复维护两份代码。

## 版本

当前版本：`v2.0`（见 `portfolio_metadata.version_history`，配置快照含 14 看板 / 五层+第六层 / 31 场景）
