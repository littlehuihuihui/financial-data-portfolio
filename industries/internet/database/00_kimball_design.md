# 互联网 · Kimball 四步设计（权威）

## BP1 设备/用户行为
1. **业务过程**：访问→注册→激活→付费漏斗行为  
2. **粒度**：一行 = 一次设备操作事件  
3. **维度**：日期、渠道、产品线、事件动作、用户/设备  
4. **事实**：event_count、duration_sec、funnel_step  

## BP2 用户增长与留存
1. **业务过程**：新增与 cohort 留存  
2. **粒度**：日 × 渠道 × 产品线（活跃）；cohort_date × day_offset（留存）  
3. **维度**：日期、渠道、产品线  
4. **事实**：dau、new_users、retained_users、retention_rate  

## BP3 投放获客
1. **业务过程**：渠道投放花费与获客  
2. **粒度**：日 × 渠道  
3. **维度**：日期、渠道  
4. **事实**：spend、new_users、cac、roi  

## BP4 付费与 LTV/RFM
1. **业务过程**：订阅/支付与用户价值评估  
2. **粒度**：支付日×渠道×产品线；用户价值快照 = 用户当前态  
3. **维度**：日期、渠道、产品线、用户分层  
4. **事实**：pay_amount、ltv、recency、frequency、monetary  

## 分层流向
ODS → DWD → DWS → ADS；漏斗/LTV/RFM/生命周期必须经 DWS，禁止 ADS 直读 DWD/ODS。
