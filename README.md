# 多行业数据平台

> 本地目录与对外品牌统一为「多行业数据平台」（原工作区名「财务数据分析」已弃用）。

统一入口、行业隔离、版本治理与跨行业同步的完整框架。

## 目录结构

```
portfolio/
├── index.html                    # 平台入口 · 行业选择页
├── portfolio_app.py              # 元数据 API + 静态资源 + 行业 API 代理
├── requirements.txt
├── README.md
├── scripts/
│   └── init_metadata_db.py       # 一键初始化元数据库
├── portfolio_metadata/
│   └── ddl/
│       ├── 01_industry_catalog.sql
│       ├── 02_version_history.sql
│       ├── 03_change_log.sql
│       ├── 04_sync_log.sql
│       ├── 05_views.sql
│       ├── 06_stored_procedures.sql
│       └── 07_init_data.sql
└── industries/
    └── retail/                   # 零售财务（首个行业）
        ├── retail_dashboard.html
        ├── app.py
        ├── css/ js/ dashboards/ config/ pages/
        ├── sql/ etl/
        └── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd portfolio
pip install -r requirements.txt
```

### 2. 初始化元数据库

```bash
python scripts/init_metadata_db.py
```

或在 DBeaver 中按顺序执行 `portfolio_metadata/ddl/01` ~ `07`。

### 3. 启动服务

```bash
# 终端 1 · 零售行业 API（数据库 retail_finance）
cd ../retail-finance-analysis && python app.py

# 终端 2 · 平台入口（数据库 portfolio_metadata）
python portfolio_app.py
```

浏览器访问：**http://127.0.0.1:5100/**

### 4. 查询所有行业状态

```sql
USE portfolio_metadata;
SELECT * FROM v_industry_status ORDER BY industry_id;
```

---

## 一、新增一个行业的完整步骤

以新增「互联网」行业为例：

### 步骤 1 · 复制行业文件夹

```bash
cp -r industries/retail industries/internet
```

### 步骤 2 · 修改行业内容

| 修改项 | 说明 |
|--------|------|
| 看板标题 / 品牌名 | 修改 `internet_dashboard.html` 及页面文案 |
| 数据库连接 | 新建 `internet_finance` 库，修改 `app.py` 中 `DB_NAME` |
| SQL / ETL | 在 `sql/`、`etl/` 下维护行业专属脚本 |
| 配置 | 更新 `config/dashboards.json` 看板列表 |

建议将 `retail_dashboard.html` 重命名为 `internet_dashboard.html`。

### 步骤 3 · 创建业务数据库

```sql
CREATE DATABASE internet_finance DEFAULT CHARSET utf8mb4;
-- 执行该行业 DDL + 初始化数据
```

### 步骤 4 · 注册元数据

```sql
USE portfolio_metadata;

INSERT INTO industry_catalog (
    industry_code, industry_name, database_name, folder_path,
    entry_file, current_version, status
) VALUES (
    'internet', '互联网财务', 'internet_finance',
    '/industries/internet/', 'internet_dashboard.html', 'v1.0.0', 'active'
);

INSERT INTO version_history (industry_id, version_tag, release_notes, status)
SELECT industry_id, 'v1.0.0', '互联网财务初始版本', 'active'
FROM industry_catalog WHERE industry_code = 'internet';

INSERT INTO change_log (industry_id, component_type, component_name, change_type, new_value, change_reason)
SELECT industry_id, 'platform', 'industry_bootstrap', 'add', 'internet_finance', '新增互联网行业'
FROM industry_catalog WHERE industry_code = 'internet';
```

### 步骤 5 · 配置 API 代理（可选）

当前 `portfolio_app.py` 默认将业务 API 代理到零售后端（`RETAIL_API_BASE`）。
多行业并存时，可扩展为按 `Referer` 或路径前缀路由到不同端口。

### 步骤 6 · 验证

刷新 http://127.0.0.1:5100/ ，确认新行业卡片出现且可点击进入。

---

## 版本配置快照（看板 / 方法论 / 导航）

迭代零售作品集功能后，需同步 `portfolio_metadata.version_history.config_json`：

```bash
cd portfolio
python scripts/export_portfolio_config.py --version v2.0 --notes "完整版作品集配置"
python scripts/apply_version_sql.py --version v2.0 --notes "完整版作品集配置"
```

- 配置 JSON：`portfolio_metadata/config/portfolio_config_<version>.json`
- INSERT 参考：`portfolio_metadata/sql/insert_version_<version>.sql`
- 若 `version_history` 尚无 `config_json` 列，仅执行一次 `portfolio_metadata/ddl/09_alter_version_history_config.sql`（**不要重复建表**）

当前零售行业版本：**v2.0**（14 看板 + 五层框架 + 第六层 19 方法 + 31 分析场景）

---

## 二、版本回滚操作步骤

### 场景

零售行业需要回退到 `v1.0.0`。

### 步骤

```sql
USE portfolio_metadata;

-- 1. 确认目标版本存在
SELECT * FROM version_history
WHERE industry_id = (SELECT industry_id FROM industry_catalog WHERE industry_code = 'retail');

-- 2. 执行回滚
CALL sp_rollback('retail', 'v1.0.0');

-- 3. 验证
SELECT industry_code, current_version, updated_at
FROM industry_catalog WHERE industry_code = 'retail';

SELECT * FROM change_log
WHERE industry_id = (SELECT industry_id FROM industry_catalog WHERE industry_code = 'retail')
ORDER BY created_at DESC LIMIT 5;
```

### 存储过程行为

`sp_rollback(industry_code, target_version)` 会：

1. 验证行业和目标版本是否存在
2. 将 `industry_catalog.current_version` 更新为目标版本
3. 将原 active 版本标记为 `stable`，目标版本标记为 `active`
4. 写入 `change_log` 记录
5. 返回 `result` / `message`

> 实际代码文件回滚需配合 Git 标签或备份目录手动执行；元数据层记录版本状态与审计轨迹。

---

## 三、批量修改（跨行业同步）操作步骤

### 场景

在零售行业修改了「退货率清洗」ETL 逻辑，需同步到互联网、制造业。

### 步骤

```sql
USE portfolio_metadata;

-- 1. 查询目标行业 ID
SELECT industry_id, industry_code FROM industry_catalog WHERE status = 'active';

-- 假设 internet=2, manufacturing=3
CALL sp_sync_change(
    'retail',
    JSON_ARRAY(2, 3),
    'etl',
    '统一退货率清洗规则：退货金额 > GMV*0.25 标记异常'
);

-- 2. 查看同步任务
SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 5;

-- 3. 查看各行业待同步变更
SELECT * FROM change_log
WHERE change_reason LIKE '%待同步修改%'
ORDER BY created_at DESC;

-- 4. 实际代码合并完成后，更新同步状态
UPDATE sync_log SET status = 'completed', completed_at = NOW()
WHERE sync_id = 1;
```

### 存储过程行为

`sp_sync_change(source, targets, component_type, description)` 会：

1. 在 `sync_log` 创建 `pending` 状态任务
2. 为每个目标行业写入 `change_log`（标记待同步）
3. 返回 `sync_id` 与目标数量

---

## 元数据库表说明

| 表/视图 | 用途 |
|---------|------|
| `industry_catalog` | 行业注册目录（库名、路径、入口文件、当前版本） |
| `version_history` | 版本历史（active / stable / deprecated） |
| `change_log` | 组件级变更审计 |
| `sync_log` | 跨行业批量同步任务 |
| `v_industry_status` | 行业状态一览（版本、最后变更、同步状态） |

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `DB_HOST` | 127.0.0.1 | MySQL 主机 |
| `DB_USER` | root | 数据库用户 |
| `DB_PASSWORD` | 123456 | 密码 |
| `DB_METADATA_NAME` | portfolio_metadata | 元数据库名 |
| `PORTFOLIO_PORT` | 5100 | 平台端口 |
| `RETAIL_API_PORT` | 5000 | 零售 API 端口 |
| `RETAIL_API_BASE` | http://127.0.0.1:5000 | API 代理目标 |

## 与现有零售系统的关系

| 组件 | 位置 |
|------|------|
| 平台框架 | `portfolio/`（本目录） |
| 零售后端 | `../retail-finance-analysis/` |
| 零售前端入口 | `portfolio/industries/retail/` |

零售看板前端已迁移至 `industries/retail/`，Python/SQL/ETL 仍集中在 `retail-finance-analysis`，通过 README 索引关联，避免双份维护。
