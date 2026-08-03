# 广东移动 OTT · 视频活跃分析作品集

框架对齐零售财务（六层方法论 · Web 看板 · PDF · 数仓）。

## 目录结构

```
industries/internet/
├── internet_dashboard.html     # 12 看板 SPA 入口
├── app.py                      # API 启动器 → internet-analytics/
├── config/                     # dashboards.json · roles.json
├── dashboard/                  # 01-overview … 12-order
├── database/
│   ├── ott_ddl.sql             # OTT 权威 DDL
│   ├── 04_ott_ads_views.sql    # ADS 视图
│   └── seed_ott.py
├── pages/                      # methodology · architecture
├── pdf/                        # P0–P3 报告（与 HTML 同步）
└── js/                         # loaders · methodology-playbook-data（28问+15法）
```

## 快速启动

```bash
cd portfolio/industries/internet/database
python seed_ott.py
# 应用 ADS：mysql < 04_ott_ads_views.sql

cd ../../../../internet-analytics
python app.py   # :5001

# 看板：internet_dashboard.html
# PDF：pdf/report.html 或 python pdf/export_internet.py --month 202607
```

## 12 个看板

| # | 看板 | 核心内容 | 主要角色 |
|---|------|---------|---------|
| 1 | 活跃总览 | 有效MAU · DAU趋势 · 活跃构成 · 多时间窗 | 运营负责人 |
| 2 | 开机活跃 | 开机次数/设备 · 只开机占比 · 端对比 | 用户增长 |
| 3 | 点播活跃 | VV/UV/时长 · 人均指标 | 内容运营 |
| 4 | 直播活跃 | 观看次数/人数 · 频道分布 | 内容运营 |
| 5 | 内容·剧集 | 剧集VV/UV/完播 · 题材渗透 | 内容运营 |
| 6 | 内容·单集与行为 | 单集排名 · action/完成度 | 内容运营 |
| 7 | 完播与QoS | 完播率/完成度/首帧/卡顿 | 内容运营 |
| 8 | 用户生命周期 | 开户/激活/沉默/流失 | 用户增长 |
| 9 | 用户留存 | D1/D7/D30 · 同期群 | 用户增长 |
| 10 | 设备流转 | STB↔Speaker · 型号/固件 | 用户增长 |
| 11 | 商业化漏斗 | 曝光→确认 · 入口对比 | 商业化运营 |
| 12 | 订购与分成 | 订购/退订 · 分成 · MAU结算 | 商业化运营 |

## 方法论

- **28** 个分析问题（描述6 · 诊断7 · 预测5 · 评估5 · 优化5）
- **15** 种第六层分析方法工具箱
- 交互页：`pages/methodology.html`
