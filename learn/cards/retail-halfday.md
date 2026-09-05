# 对照设计卡 · 零售（半日）

> 表名须可在 `portfolio/industries/retail/database/kimball_design/` grep。

## 选题（二选一）

A. 门店日销售异常（基于 `ods_order_item` → `fact_order_item` → `dws_sales_d`）  
B. 退货率监控（`ods_return_item` / `fact_return` / `dws_return_d`）

## 90 分钟模板

1. **20min** 打开对应 `01_ods.sql`/`03_dwd.sql`/`04_dws.sql`，抄 COMMENT 粒度  
2. **25min** 写 Kimball 四步（本卡主题）  
3. **25min** 写 ODS→DWD→DWS 各 8～15 行 MySQL 骨架（列名来自 DDL）  
4. **20min** 写 3 条 DQ + 1 个 ADS 比率指标（禁直读 ODS）

## 交付

一页 Markdown：过程/粒度/表清单/伪 SQL/DQ/开放问题。  
对照互联网：哪些纪律相同？哪些时钟（日/月）不同？
