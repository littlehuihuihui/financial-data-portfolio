# 工程专题 E4 · DQ 门禁实战（对齐靶场）

## 1. 门禁放在哪一层

| 层 | 典型规则 | 靶场对应 |
|----|----------|----------|
| ODS/入仓 | 空值、时间合法、体积波动 | 脏数据设计来源 |
| DWD | 主键/业务键、维关联、禁测流量 | DQ1–DQ4 |
| DWS | 与明细勾稽、非负 | DQ5 与 ADS 勾稽 |
| ADS | 与 DWS 定义一致（视图常自动） | `v_dau_overview` |

## 2. 靶场五条（源码）

> **证据**：`learn/lab/03_dq_checks.sql`（以文件为准，下表为摘要）

1. DWD.`mac` 空值 = 0  
2. 无未来 `event_date`  
3. 无 `userid='TEST'`  
4. `mac` ∈ `dim_device`  
5. ADS.`total_dau` = 当日 DWS `COUNT(DISTINCT mac)`

## 3. 与监控文档的关系

> **证据**：`docs/monitoring_framework_internet.md` 将 DAU / 有效活跃落到 `dws_act_user_active_1d`。  

DQ 不是另起炉灶：门禁应保护**口径承诺**的那张表。

## 4. 排障顺序（与第 04 章一致）

ADS 异常 → 看 DWS 当日行 → 抽 DWD 样本 → 对 ODS 原始 → 查作业日志/批次。

## 5. 作业

1. 跑 `run_lab.py`，把 broken 阶段每条 `detail` 抄下来。  
2. 新增一条你自己的 DQ（例如 `action` 必须属于 boot/home/click/search），改 `03_dq_checks.sql` 并跑通。  
3. 说明：为何 DQ5 在 broken 阶段仍可能 `passed=1`？（坏数据一致地错）

:::answer 要点
3. ADS 是视图，与错误 DWS 勾稽仍相等；勾稽不能代替「业务正确性」规则。
:::
