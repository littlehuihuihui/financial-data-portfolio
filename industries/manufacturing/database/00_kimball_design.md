# 制造业 · Kimball 四步设计（权威）

## BP1 生产执行
1. **业务过程**：工单开工→完工→交付  
2. **粒度**：一行 = 一张生产工单（order_id）  
3. **维度**：日期、工厂、产线、产品  
4. **事实**：plan_qty、actual_qty、plan_hours、actual_hours、delivered_on_time  

## BP2 质量检验
1. **业务过程**：抽检/终检结果登记  
2. **粒度**：一行 = 一次质检（inspect_id）  
3. **维度**：日期、产线、产品、缺陷类型  
4. **事实**：total/pass/defect/scrap_qty、is_rework  

## BP3 物料库存与供应
1. **业务过程**：原料库存盘点与采购到货  
2. **粒度**：库存快照 = 日×物料；供应 = 日×供应商  
3. **维度**：日期、物料、供应商  
4. **事实**：on_hand、usage、purchase_amount、otd  

## BP4 设备运行
1. **业务过程**：设备日运行与停机  
2. **粒度**：一行 = 日×设备  
3. **维度**：日期、设备、产线  
4. **事实**：availability/performance/quality/oee、downtime  

## BP5 人工报工
1. **业务过程**：按工单报工  
2. **粒度**：一行 = 报工记录；汇总粒度 = 月  
3. **维度**：日期、产线、工单  
4. **事实**：plan/actual_hours、labor_cost  

## 分层流向
ODS → DWD → DWS → ADS；禁止 ADS 直读 ODS。
