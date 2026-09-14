## python

# Python (python-root)

  - 学习路径 py-learning-path [?] 扇区=practice
    - 教程宪法 py-constitution-sec [?] 章节
      - 统一样例与课模板 py-constitution [?] 叶
    - 路线清单 py-roadmap [?] 章节
      - 初级清单 py-path-junior [?] 叶
      - 中级清单 py-path-mid [??] 叶
      - 高级清单 py-path-senior [???] 叶
    - 练习场 py-practice-field [??] 章节
      - 初级练习 py-drill-junior [?] 叶
      - 中级练习 py-drill-mid [??] 叶
  - pandas 数据表 py-pandas [?] 扇区=foundation
    - 表结构与筛选 py-frame [?] 章节
      - DataFrame 基础 py-dataframe [?] 叶
      - 筛选与赋值 py-filter [?] 叶
    - 清洗与聚合 py-clean-agg [??] 章节
      - 缺失与类型 py-na [?] 叶
      - groupby 聚合 py-group [??] 叶
      - merge 关联 py-merge [??] 叶
      - 透视与变形 py-pivot [??] 叶
      - transform 与 rolling py-transform [???] 叶
      - 时间索引 py-datetime [??] 叶
    - 读写与落地 py-io [?] 章节
      - read_csv / to_csv py-read-csv [?] 叶
      - to_sql / read_sql py-to-sql [??] 叶
      - Parquet 列存文件 py-parquet [???] 叶
  - 可视化 py-viz [??] 扇区=advanced
    - 常用图 py-plot [??] 章节
      - 折线趋势 py-line [??] 叶
      - 柱状对比 py-bar [??] 叶
      - Seaborn 分布 py-seaborn [??] 叶
  - 生态与加速 py-stack [???] 扇区=advanced
    - 核心库 py-core-libs [???] 章节
      - NumPy 向量化 py-numpy [??] 叶
      - DuckDB 内嵌 SQL py-duckdb [???] 叶
      - Polars 直觉 py-polars [???] 叶
      - sklearn 基线 py-sklearn [???] 叶
      - Streamlit 小应用 py-streamlit [???] 叶
    - 工程化 py-eng [???] 章节
      - 性能与内存 py-perf [???] 叶
      - 可复现环境 py-repro [???] 叶

叶节点数: 27

---

## dwh

# 数据仓库 (dwh-root)

  - 学习路径 dwh-learning-path [?] 扇区=practice
    - 教程宪法 dwh-constitution-sec [?] 章节
      - 统一样例与课模板 dwh-constitution [?] 叶
    - 路线清单 dwh-roadmap [?] 章节
      - 初级清单 dwh-path-junior [?] 叶
      - 中级清单 dwh-path-mid [??] 叶
      - 高级清单 dwh-path-senior [???] 叶
    - 练习场 dwh-practice-field [??] 章节
      - 初级练习 dwh-drill-junior [?] 叶
      - 中级练习 dwh-drill-mid [??] 叶
  - 仓是什么 dwh-why [?] 扇区=foundation
    - 定位与边界 dwh-ssot-sec [?] 章节
      - 仓是干什么的 dwh-what [?] 叶
      - SSOT 单一事实来源 dwh-ssot [?] 叶
    - 主题域与集市 dwh-domain-sec [??] 章节
      - 主题域划分 dwh-subject-domain [??] 叶
      - 仓库与集市 dwh-mart-vs-wh [??] 叶
  - 数仓分层 dwh-layer [?] 扇区=foundation
    - 层级职责 dwh-layers [?] 章节
      - ODS 贴源 dwh-ods [?] 叶
      - DWD 明细 dwh-dwd [??] 叶
      - DWS 汇总 dwh-dws [??] 叶
      - ADS 应用 dwh-ads [??] 叶
  - 维度建模 dwh-model [??] 扇区=advanced
    - 粒度与总线 dwh-grain-bus [??] 章节
      - 事实粒度 dwh-grain [??] 叶
      - 总线矩阵 dwh-bus-matrix [??] 叶
    - 模型形态 dwh-schema-styles [??] 章节
      - 星型模型 dwh-star-schema [??] 叶
      - 雪花模型 dwh-snowflake [??] 叶
      - 星系/星座模型 dwh-constellation [???] 叶
    - 方法论与选型 dwh-method-styles [???] 章节
      - 何时用星型/雪花/星系 dwh-schema-choose [??] 叶
      - Kimball 与 Inmon dwh-kimball-inmon [???] 叶
      - Data Vault 直觉 dwh-datavault [???] 叶
    - 星型构件 dwh-star [??] 章节
      - 事实表 dwh-fact [??] 叶
      - 维度表 dwh-dim [??] 叶
      - 代理键 dwh-surrogate-key [???] 叶
      - 事实表类型 dwh-fact-types [??] 叶
      - 宽表与指标表 dwh-wide-vs-metric [??] 叶
      - 一致性维度 dwh-conformed-dim [??] 叶
    - 缓慢变化维 dwh-scd-sec [???] 章节
      - SCD1 覆盖 dwh-scd1 [??] 叶
      - SCD2 拉链表 dwh-scd2 [???] 叶
      - SCD3 保留前值 dwh-scd3 [???] 叶
  - 加工与质量 dwh-pipeline [???] 扇区=practice
    - 调度与回刷 dwh-schedule-sec [???] 章节
      - 调度与依赖 dwh-schedule [???] 叶
      - 装载顺序 dwh-load-order [???] 叶
      - 回刷与重跑 dwh-backfill [???] 叶
    - 增量与分区 dwh-incr-sec [???] 章节
      - 增量策略 dwh-incremental [???] 叶
      - 分区与裁剪 dwh-partition [???] 叶
    - 质量与对账 dwh-dq-sec [???] 章节
      - 对账质检 dwh-reconcile [???] 叶

叶节点数: 37

---
