# internet_analytics 数仓（广东移动 OTT）

## 权威 DDL

| 文件 | 说明 |
|------|------|
| `ott_ddl.sql` | OTT 雪花模型 ODS/DIM/DWD/DWS + fact_* 别名 |
| `04_ott_ads_views.sql` | ADS 看板/方法论视图（**以后台此文件为准**） |
| `01_ddl.sql` / `02_ads.sql` | 历史通用增长模型（库中可能并存，看板已切 OTT） |

## ADS 视图（04）

v_dau_overview · v_lifecycle / v_user_lifecycle · v_retention_decomposition · v_user_retention · v_user_segment · v_channel_attribution · v_ab_experiment · v_funnel · v_ltv · v_rfm · v_channel_analysis · v_user_portrait

## 初始化

```bash
cd portfolio/industries/internet/database
# 建表 + 灌数（见 seed_ott.py）
python seed_ott.py
# 应用 ADS 视图
mysql ... < 04_ott_ads_views.sql
# 或：python internet-analytics/_apply_ads_views.py
```

## 样例数据

2026-04-16 ~ 2026-07-15 · STB/Speaker · 点播/直播/收银台/订购
