# 看板对照教程（P2e）

目标：把 **靶场结论** 与 **作品集看板/ADS** 对齐理解，而不是要求两个库数字相等。

## 1. 日活（对应第 09 章靶场）

| 步骤 | 做什么 | 证据 |
|------|--------|------|
| 1 | 跑通 `python learn/lab/run_lab.py`（DAU） | 得 `ads_dau=3` + TOKEN |
| 2 | 打开 `04_ott_ads_views.sql` 读 `v_dau_overview` | 确认也是 `COUNT(DISTINCT mac)` |
| 3 | 实验台 ETL 搜 `v_dau_overview` | `code_path` 指向 04 文件，schedule=实时 |
| 4 | 打开互联网看板「活跃」类卡片 | 数字来自 `internet_analytics` 演示数据，**不必等于 3** |
| 5 | 书面一句 | 「靶场证明口径算法；看板证明产品消费」 |

## 2. 完播率（对应第 10 章靶场）

| 步骤 | 做什么 | 证据 |
|------|--------|------|
| 1 | `python learn/lab/run_lab.py --suite vod` | S001 完播率 66.67% |
| 2 | 在 `ott_ddl.sql` 确认 `dws_content_series_play_1d.finish_cnt` | 真列 |
| 3 | 在 `04_ott_ads_views.sql` **搜索** `finish` / `v_vod` | **现网无** `v_vod_finish_rate` |
| 4 | 结论 | 靶场 ADS 是教材**拟新增**；上线需按 08 作业走评审 |

## 3. 不要做的事

- 把靶场数据 `INSERT` 进 `internet_analytics` 却不说明（污染演示库）  
- 因看板数字≠3 就改 `v_dau_overview` 定义「凑数」  
- 宣称「完播率视图已在 04 文件中」——与实档不符

## 4. 可选进阶

若本地已 `seed_ott.py`：用 SQL 查

```sql
USE internet_analytics;
SELECT * FROM v_dau_overview ORDER BY snapshot_date DESC LIMIT 7;
```

对照监控文档中的 DAU 落点描述（`monitoring_framework_internet.md`）。
