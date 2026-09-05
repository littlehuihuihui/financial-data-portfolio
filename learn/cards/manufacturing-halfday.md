# 对照设计卡 · 制造（半日）

> 表名须可在 `portfolio/industries/manufacturing/database/` grep。

## 选题（二选一）

A. 产线日产量（`ods_production_order` → `dwd_production_wide` → `dws_production_daily`）  
B. 质检不良（`ods_quality_inspection` → `dwd_quality_wide` → `dws_quality_daily` / `dws_defect_daily`）

## 90 分钟模板

1. **20min** 打开 `01_ods.sql`/`03_dwd.sql`/`04_dws.sql`，抄字段与 COMMENT  
2. **25min** Kimball 四步  
3. **25min** 层间骨架（注意工单状态过滤是否在 DWD）  
4. **20min** DQ（产量非负、不良≤产量等）+ ADS 良率/OEE 类比率落点说明

## 交付

一页 Markdown + 「与 OTT 日活链路对照表」三行（跳跃/时钟/典型脏数据）。
