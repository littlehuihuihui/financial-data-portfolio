# 仓库对照题 · 标准答与常见错答（P2d）

使用：先闭卷做各章「仓库对照题」，再核对本节。  
**仍以打开文件为准**；若仓库变更与本文冲突，以 DDL/脚本原文为准并提 issue。

---

## 00 / 00b

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| 权威 DDL | `ott_ddl.sql` + ADS `04_ott_ads_views.sql` | 把历史 `01_ddl.sql` 当唯一权威 |
| 分层流向 | ODS→DWD→DWS→ADS，禁 ADS 直读 ODS | 「看板随便查 ODS」 |
| 三层现实 | A 灌数 / B 规范 / C 靶场 | 三者混为一谈 |

## 01

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| DWS 日活 PK | `(snapshot_date, mac)` | `(mac)` 或臆造 `dt` |
| DAU 视图 FROM | `dws_act_user_active_1d` | `ods_log_launcher_di` |
| 零售 ODS 例 | `ods_order_item`（kimball_design） | 编造 `ods_orders_wide` |

## 02

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| 收银 DWD 粒度 | 一次埋点 | 「一日一用户」 |
| 漏斗 DWS PK | `(snapshot_date, device_type, src_type)` | 只有 date |
| 毛利率位置 | ADS（或 DWS 存分子分母） | 写入 DWD 再 SUM 率 |

## 03

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| total_dau | `COUNT(DISTINCT mac)` | `COUNT(*)` / `device_id` |
| LOG_DAYS | 2026-07-13~15 | 「三个月明细都在」 |
| 维关联键 | `mac` | `device_sk`（本库无） |

## 04

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| inet_ads_dau | engine=view，实时，`04_ott_ads_views.sql` | 当成每日 Spark 作业 |
| seed 边 | 演示灌数，非独立调度 SQL | 「生产 Airflow 已上」 |

## 05

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| DAU 监控落点 | `dws_act_user_active_1d` | 只写「活跃看板」无表名 |
| STB DAU | `COUNT(DISTINCT CASE WHEN device_type='STB' THEN mac END)` | 过滤写在 ODS |

## 09 / 10 靶场

| 题 | 标准答 | 常见错答 |
|----|--------|----------|
| DAU 修复后 | ads_dau=3 | 等于 ODS 行数 8 |
| VOD S001 | vv=3, finish=2, rate=66.67 | 用 broken 的 57.14 当最终 |
| TOKEN | 控制台 `LAB_TOKEN=...` | 自己编造字符串 |

## 08 作业

合格：复用真表 + 拟新增显式标注 + ADS 不读 ODS。  
不合格：见 `08-sample-fail.md`。
