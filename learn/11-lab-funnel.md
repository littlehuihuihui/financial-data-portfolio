# 第 11 章 · 靶场③：收银漏斗（弄坏再修好）

> **证据**：`learn/lab/funnel/` 对齐 `ott_ddl.sql` 收银表；现网 ADS 为 `v_funnel`（**按月**聚合，见 `04_ott_ads_views.sql`）。  
> 靶场 ADS `v_cashier_funnel_day` 为**日粒度教学视图**，勿与现网月视图混称「已上线同一对象」。

## 命令

```bash
cd portfolio
.\venv\Scripts\python.exe learn\lab\run_lab.py --suite funnel
```

TOKEN：`dnexus-lab-funnel-v1-PASS`

## 期望

- broken：`FAIL`（空 mac / 非法 step=`hack` / TEST）  
- fixed：`PASS`；STB+video 四步齐全，`click_rate=100`

## 门禁

小测 + 粘贴 funnel TOKEN。
