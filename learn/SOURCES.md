# 教材证据与反幻觉规范（强制）

本教材所有**表名、字段名、视图定义、文件路径、灌数行为**必须以仓库实档为准。  
禁止凭印象编造 `device_sk`、`is_current`、`dt` 分区列等「看起来像数仓」但本仓库不存在的对象。

## 1. 权威来源（互联网主线）

| 主题 | 权威路径 |
|------|----------|
| OTT 表结构 | `portfolio/industries/internet/database/ott_ddl.sql` |
| ADS 视图 | `portfolio/industries/internet/database/04_ott_ads_views.sql` |
| Kimball 声明 | `portfolio/industries/internet/database/00_kimball_design.md` |
| 灌数脚本 | `portfolio/industries/internet/database/seed_ott.py` |
| 库说明 | `portfolio/industries/internet/database/README.md` |
| ETL 面板数据 | `portfolio/industries/internet/js/etl-lineage-data.js` |
| ER 标签 | `portfolio/industries/internet/js/er-diagram-data.js` |
| 监控/指标说明 | `portfolio/industries/internet/docs/monitoring_framework_internet.md` |

## 2. 对照行业（仅作迁移题，非主线深挖）

| 行业 | 权威路径 |
|------|----------|
| 零售 ODS/DWD/DWS | `portfolio/industries/retail/database/kimball_design/` |
| 零售财务扩展 | `portfolio/industries/retail/sql6_portfolio_model/` |
| 制造 ODS/DWD/DWS | `portfolio/industries/manufacturing/database/01_ods.sql` 等 |

## 3. 必须向学员诚实说明的事实

1. **演示灌数 ≠ 生产调度 ETL**  
   `seed_ott.py` 的 `seed_raw_logs` 会**并行写入** ODS 日志与 DWD 明细（见脚本内 `INSERT INTO ods_log_*` 与 `INSERT INTO dwd_*`）。  
   ETL 面板中部分边标注 `synthetic` / `generate-into-DWD`（见 `etl-lineage-data.js`）。  
   教材「层间 SQL 范式」教的是**规范加工形态**；靶场 `learn/lab/` 用独立库演练规范链路，**不声称**与 `seed_ott.py` 字节级相同。

2. **`dim_device` 不是 SCD2 拉链表**  
   `ott_ddl.sql` 中 `dim_device` 以 `mac` 为主键，注释为雪花当前维，**无** `valid_from` / `is_current` 字段。  
   SCD2 专题使用**教学示意表**（仅存在于 `learn/lab/`），并明确标注「非 OTT 生产 DDL」。

3. **ADS 禁止直读 ODS**  
   见 `04_ott_ads_views.sql` 文件头注释，以及 `00_kimball_design.md`「分层流向」。

4. **日活口径字段**  
   `v_dau_overview.total_dau = COUNT(DISTINCT mac)`，来源 `dws_act_user_active_1d`（见 `04_ott_ads_views.sql`）。

## 4. 写作检查清单（改教材前必过）

- [ ] 表名能否在 `ott_ddl.sql` / 对照行业 DDL 中 `grep` 到？  
- [ ] 字段名是否与 CREATE TABLE 一致？  
- [ ] 若写 SQL 方言：正文标注「MySQL 8 可跑」或「逻辑骨架」？  
- [ ] 若讲作品集实现：是否引用 `seed_ott.py` / `etl-lineage-data.js` 的真实行为？  
- [ ] 不确定时：写「仓库未收录，以下为通用范式」，**禁止**写成作品集已实现。

## 5. 引用格式（课文内）

每章关键断言旁使用：

> **证据**：`相对仓库根的路径` · 对象名 · （可选：行号区间或函数名）

## 6. P2/P3 扩展索引

| 能力 | 路径 |
|------|------|
| 三层现实 | `learn/00b-three-realities.md` |
| DAU 靶场 | `learn/lab/` · TOKEN `dnexus-lab-dau-v1-PASS` |
| 完播靶场 | `learn/lab/vod/` · TOKEN `dnexus-lab-vod-v1-PASS`（ADS 拟新增） |
| 对照详答 | `learn/ANSWERS-对照题.md` |
| 看板桥 | `learn/P2e-dashboard-bridge.md` |
| 七日历 / 术语 | `CALENDAR-7D.md` / `GLOSSARY.md` |
| 对照卡 | `learn/cards/*` |
| 中级 E5–E7 | 性能 / CDC / 契约 |
