/**
 * 数仓分层全景图 · 数据配置
 * 三个行业共用一套组件，数据分开维护
 */
window.DW_ARCHITECTURE_DATA = {
  // ==================== 互联网 OTT ====================
  internet: {
    name: "互联网 · OTT大屏视频",
    description: "设备操作日志为底座，覆盖 Launcher / 点播 / 直播 / 收银台四大产品线",
    layers: [
      { id: "ods", name: "ODS", fullName: "操作数据层", color: "#6b7280", desc: "原始日志/单据级，一行一次操作或一条主数据" },
      { id: "dim", name: "DIM", fullName: "维度层", color: "#3b82f6", desc: "主数据实体，一行一个设备/用户/产品线/渠道/日期" },
      { id: "dwd", name: "DWD", fullName: "明细宽表层", color: "#10b981", desc: "清洗后的明细，一行一次操作或一行一用户/一会话" },
      { id: "dws", name: "DWS", fullName: "汇总数据层", color: "#f59e0b", desc: "按日×主题预聚合，日汇总表" },
      { id: "ads", name: "ADS", fullName: "应用数据层", color: "#ef4444", desc: "看板指标切片，视图封装指标口径" }
    ],
    tables: [
      // ODS
      { id: "ods_log_launcher_di", name: "ods_log_launcher_di", layer: "ods", type: "table", purpose: "桌面开机/点击原始日志", fieldCount: 12, category: "行为日志" },
      { id: "ods_log_vod_di", name: "ods_log_vod_di", layer: "ods", type: "table", purpose: "点播播放原始日志", fieldCount: 15, category: "行为日志" },
      { id: "ods_log_live_di", name: "ods_log_live_di", layer: "ods", type: "table", purpose: "直播频道原始日志", fieldCount: 10, category: "行为日志" },
      { id: "ods_log_cashier_di", name: "ods_log_cashier_di", layer: "ods", type: "table", purpose: "收银台操作原始日志", fieldCount: 12, category: "行为日志" },
      { id: "ods_order_di", name: "ods_order_di", layer: "ods", type: "table", purpose: "订购订单原始数据", fieldCount: 14, category: "交易数据" },
      { id: "ods_user_register_di", name: "ods_user_register_di", layer: "ods", type: "table", purpose: "用户注册数据", fieldCount: 8, category: "用户数据" },
      { id: "ods_user_unsubscribe_di", name: "ods_user_unsubscribe_di", layer: "ods", type: "table", purpose: "用户退订数据", fieldCount: 8, category: "用户数据" },
      { id: "ods_content_series_df", name: "ods_content_series_df", layer: "ods", type: "table", purpose: "剧集主数据", fieldCount: 10, category: "内容数据" },
      { id: "ods_content_episode_df", name: "ods_content_episode_df", layer: "ods", type: "table", purpose: "单集主数据", fieldCount: 8, category: "内容数据" },
      { id: "ods_live_channel_df", name: "ods_live_channel_df", layer: "ods", type: "table", purpose: "直播频道主数据", fieldCount: 8, category: "内容数据" },
      { id: "ods_device_info_df", name: "ods_device_info_df", layer: "ods", type: "table", purpose: "设备档案主数据", fieldCount: 10, category: "设备数据" },

      // DIM
      { id: "dim_date", name: "dim_date", layer: "dim", type: "table", purpose: "日期维度（雪花，挂week/month）", fieldCount: 9, category: "时间维度" },
      { id: "dim_device", name: "dim_device", layer: "dim", type: "table", purpose: "设备维度（雪花，挂model/firmware/region）", fieldCount: 8, category: "设备维度" },
      { id: "dim_user", name: "dim_user", layer: "dim", type: "table", purpose: "用户维度（雪花，挂region/package）", fieldCount: 8, category: "用户维度" },
      { id: "dim_content_series", name: "dim_content_series", layer: "dim", type: "table", purpose: "剧集维度（雪花，挂category/genre/cp）", fieldCount: 10, category: "内容维度" },
      { id: "dim_content_episode", name: "dim_content_episode", layer: "dim", type: "table", purpose: "单集维度（雪花，挂series）", fieldCount: 6, category: "内容维度" },
      { id: "dim_live_channel", name: "dim_live_channel", layer: "dim", type: "table", purpose: "直播频道维度（雪花，挂channel_category）", fieldCount: 4, category: "内容维度" },
      { id: "dim_region", name: "dim_region", layer: "dim", type: "table", purpose: "地域维度（地市）", fieldCount: 5, category: "地域维度" },
      { id: "dim_device_type", name: "dim_device_type", layer: "dim", type: "table", purpose: "端类型维度", fieldCount: 3, category: "设备维度" },
      { id: "dim_device_model", name: "dim_device_model", layer: "dim", type: "table", purpose: "设备型号维度", fieldCount: 4, category: "设备维度" },
      { id: "dim_firmware", name: "dim_firmware", layer: "dim", type: "table", purpose: "固件版本维度", fieldCount: 3, category: "设备维度" },
      { id: "dim_user_package", name: "dim_user_package", layer: "dim", type: "table", purpose: "套餐维度", fieldCount: 5, category: "用户维度" },
      { id: "dim_content_category", name: "dim_content_category", layer: "dim", type: "table", purpose: "内容类型维度", fieldCount: 4, category: "内容维度" },
      { id: "dim_content_genre", name: "dim_content_genre", layer: "dim", type: "table", purpose: "题材维度", fieldCount: 3, category: "内容维度" },
      { id: "dim_content_cp", name: "dim_content_cp", layer: "dim", type: "table", purpose: "内容提供方维度", fieldCount: 4, category: "内容维度" },
      { id: "dim_channel_category", name: "dim_channel_category", layer: "dim", type: "table", purpose: "频道大类维度", fieldCount: 3, category: "内容维度" },
      { id: "dim_province", name: "dim_province", layer: "dim", type: "table", purpose: "省份维度", fieldCount: 2, category: "地域维度" },
      { id: "dim_week", name: "dim_week", layer: "dim", type: "table", purpose: "周维度", fieldCount: 5, category: "时间维度" },
      { id: "dim_month", name: "dim_month", layer: "dim", type: "table", purpose: "月维度", fieldCount: 4, category: "时间维度" },

      // DWD
      { id: "dwd_act_launcher_di", name: "dwd_act_launcher_di", layer: "dwd", type: "table", purpose: "桌面活跃明细宽表", fieldCount: 18, category: "行为明细" },
      { id: "dwd_vod_play_di", name: "dwd_vod_play_di", layer: "dwd", type: "table", purpose: "点播播放明细宽表", fieldCount: 22, category: "行为明细" },
      { id: "dwd_live_play_di", name: "dwd_live_play_di", layer: "dwd", type: "table", purpose: "直播播放明细宽表", fieldCount: 16, category: "行为明细" },
      { id: "dwd_trade_cashier_di", name: "dwd_trade_cashier_di", layer: "dwd", type: "table", purpose: "收银台交易明细宽表", fieldCount: 20, category: "交易明细" },
      { id: "dwd_trade_order_di", name: "dwd_trade_order_di", layer: "dwd", type: "table", purpose: "订购订单明细宽表", fieldCount: 18, category: "交易明细" },
      { id: "dwd_user_status_di", name: "dwd_user_status_di", layer: "dwd", type: "table", purpose: "用户状态日快照宽表", fieldCount: 15, category: "用户明细" },

      // DWS
      { id: "dws_act_user_active_1d", name: "dws_act_user_active_1d", layer: "dws", type: "table", purpose: "用户日活跃汇总", fieldCount: 12, category: "活跃汇总" },
      { id: "dws_content_series_play_1d", name: "dws_content_series_play_1d", layer: "dws", type: "table", purpose: "剧集日播放汇总", fieldCount: 15, category: "内容汇总" },
      { id: "dws_content_episode_play_1d", name: "dws_content_episode_play_1d", layer: "dws", type: "table", purpose: "单集日播放汇总", fieldCount: 14, category: "内容汇总" },
      { id: "dws_content_live_play_1d", name: "dws_content_live_play_1d", layer: "dws", type: "table", purpose: "直播频道日播放汇总", fieldCount: 12, category: "内容汇总" },
      { id: "dws_trade_cashier_funnel_1d", name: "dws_trade_cashier_funnel_1d", layer: "dws", type: "table", purpose: "收银台漏斗日汇总", fieldCount: 10, category: "交易汇总" },
      { id: "dws_trade_order_1d", name: "dws_trade_order_1d", layer: "dws", type: "table", purpose: "订购订单日汇总", fieldCount: 12, category: "交易汇总" },
      { id: "dws_user_lifecycle_1d", name: "dws_user_lifecycle_1d", layer: "dws", type: "table", purpose: "用户生命周期日汇总", fieldCount: 10, category: "用户汇总" },
      { id: "dws_user_retention_1d", name: "dws_user_retention_1d", layer: "dws", type: "table", purpose: "用户留存日汇总（同期群）", fieldCount: 8, category: "用户汇总" },

      // ADS
      { id: "v_dau_overview", name: "v_dau_overview", layer: "ads", type: "view", purpose: "DAU总览视图", fieldCount: 7, category: "活跃看板" },
      { id: "v_lifecycle", name: "v_lifecycle", layer: "ads", type: "view", purpose: "用户生命周期视图", fieldCount: 8, category: "用户看板" },
      { id: "v_retention_decomposition", name: "v_retention_decomposition", layer: "ads", type: "view", purpose: "留存分解视图", fieldCount: 8, category: "用户看板" },
      { id: "v_user_segment", name: "v_user_segment", layer: "ads", type: "view", purpose: "用户分群视图", fieldCount: 5, category: "用户看板" },
      { id: "v_channel_attribution", name: "v_channel_attribution", layer: "ads", type: "view", purpose: "渠道归因视图", fieldCount: 10, category: "渠道看板" },
      { id: "v_ltv", name: "v_ltv", layer: "ads", type: "view", purpose: "用户LTV视图", fieldCount: 6, category: "价值看板" },
      { id: "v_funnel", name: "v_funnel", layer: "ads", type: "view", purpose: "转化漏斗视图", fieldCount: 5, category: "转化看板" },
      { id: "v_rfm", name: "v_rfm", layer: "ads", type: "view", purpose: "RFM用户价值视图", fieldCount: 7, category: "价值看板" },
      { id: "v_product_line_analysis", name: "v_product_line_analysis", layer: "ads", type: "view", purpose: "产品线分析视图", fieldCount: 12, category: "综合看板" },
      { id: "v_ab_experiment", name: "v_ab_experiment", layer: "ads", type: "view", purpose: "AB实验视图", fieldCount: 8, category: "实验看板" }
    ],
    flows: [
      // ODS → DWD
      { from: "ods_log_launcher_di", to: "dwd_act_launcher_di", label: "ETL清洗" },
      { from: "ods_log_vod_di", to: "dwd_vod_play_di", label: "ETL清洗" },
      { from: "ods_log_live_di", to: "dwd_live_play_di", label: "ETL清洗" },
      { from: "ods_log_cashier_di", to: "dwd_trade_cashier_di", label: "ETL清洗" },
      { from: "ods_order_di", to: "dwd_trade_order_di", label: "ETL清洗" },
      { from: "ods_user_register_di", to: "dwd_user_status_di", label: "ETL清洗" },
      { from: "ods_user_unsubscribe_di", to: "dwd_user_status_di", label: "ETL清洗" },

      // DIM → DWD（维度关联）
      { from: "dim_device", to: "dwd_act_launcher_di", label: "维度关联", dashed: true },
      { from: "dim_device", to: "dwd_vod_play_di", label: "维度关联", dashed: true },
      { from: "dim_device", to: "dwd_live_play_di", label: "维度关联", dashed: true },
      { from: "dim_user", to: "dwd_trade_order_di", label: "维度关联", dashed: true },
      { from: "dim_content_episode", to: "dwd_vod_play_di", label: "维度关联", dashed: true },
      { from: "dim_live_channel", to: "dwd_live_play_di", label: "维度关联", dashed: true },
      { from: "dim_date", to: "dwd_act_launcher_di", label: "维度关联", dashed: true },
      { from: "dim_date", to: "dwd_vod_play_di", label: "维度关联", dashed: true },

      // DWD → DWS
      { from: "dwd_act_launcher_di", to: "dws_act_user_active_1d", label: "日聚合" },
      { from: "dwd_vod_play_di", to: "dws_content_series_play_1d", label: "日聚合" },
      { from: "dwd_vod_play_di", to: "dws_content_episode_play_1d", label: "日聚合" },
      { from: "dwd_live_play_di", to: "dws_content_live_play_1d", label: "日聚合" },
      { from: "dwd_trade_cashier_di", to: "dws_trade_cashier_funnel_1d", label: "日聚合" },
      { from: "dwd_trade_order_di", to: "dws_trade_order_1d", label: "日聚合" },
      { from: "dwd_user_status_di", to: "dws_user_lifecycle_1d", label: "日聚合" },
      { from: "dwd_user_status_di", to: "dws_user_retention_1d", label: "同期群" },

      // DWS → ADS
      { from: "dws_act_user_active_1d", to: "v_dau_overview", label: "指标封装" },
      { from: "dws_user_lifecycle_1d", to: "v_lifecycle", label: "指标封装" },
      { from: "dws_user_retention_1d", to: "v_retention_decomposition", label: "指标封装" },
      { from: "dwd_user_status_di", to: "v_user_segment", label: "指标封装" },
      { from: "dws_trade_order_1d", to: "v_channel_attribution", label: "指标封装" },
      { from: "dws_trade_order_1d", to: "v_ltv", label: "指标封装" },
      { from: "dws_trade_cashier_funnel_1d", to: "v_funnel", label: "指标封装" },
      { from: "dws_trade_order_1d", to: "v_rfm", label: "指标封装" },
      { from: "dws_act_user_active_1d", to: "v_product_line_analysis", label: "指标封装" },
      { from: "dws_trade_cashier_funnel_1d", to: "v_ab_experiment", label: "指标封装" }
    ],
    dashboards: [
      { id: "overview", name: "活跃总览", tables: ["v_dau_overview", "dws_act_user_active_1d"] },
      { id: "launcher", name: "开机活跃", tables: ["dwd_act_launcher_di", "dws_act_user_active_1d"] },
      { id: "vod", name: "点播活跃", tables: ["dwd_vod_play_di", "dws_content_series_play_1d"] },
      { id: "live", name: "直播活跃", tables: ["dwd_live_play_di", "dws_content_live_play_1d"] },
      { id: "series", name: "内容·剧集", tables: ["dws_content_series_play_1d"] },
      { id: "episode", name: "内容·单集", tables: ["dws_content_episode_play_1d"] },
      { id: "lifecycle", name: "用户生命周期", tables: ["v_lifecycle", "dws_user_lifecycle_1d"] },
      { id: "retention", name: "用户留存", tables: ["v_retention_decomposition", "dws_user_retention_1d"] },
      { id: "funnel", name: "商业化漏斗", tables: ["v_funnel", "dws_trade_cashier_funnel_1d"] },
      { id: "order", name: "订购与分成", tables: ["v_channel_attribution", "dws_trade_order_1d"] },
      { id: "revenue", name: "收入结构", tables: ["v_ltv", "v_rfm", "dws_trade_order_1d"] },
      { id: "tags", name: "用户标签画像", tables: ["v_user_segment", "dwd_user_status_di"] }
    ]
  },

  // ==================== 制造业 ====================
  manufacturing: {
    name: "制造业 · 智能工厂",
    description: "生产/质量/设备/供应链/成本五大主题，MES/QMS/ERP/WMS多系统融合",
    layers: [
      { id: "ods", name: "ODS", fullName: "操作数据层", color: "#6b7280", desc: "贴源层，MES/QMS/ERP/WMS原始数据" },
      { id: "dim", name: "DIM", fullName: "维度层", color: "#3b82f6", desc: "一致性维度，产品/产线/供应商/物料/日期" },
      { id: "dwd", name: "DWD", fullName: "明细宽表层", color: "#10b981", desc: "事实宽表，生产/质量/供应链明细" },
      { id: "dws", name: "DWS", fullName: "汇总数据层", color: "#f59e0b", desc: "日/月汇总，生产/质量/设备/成本" },
      { id: "ads", name: "ADS", fullName: "应用数据层", color: "#ef4444", desc: "看板视图，CMEI综合指数等应用指标" }
    ],
    tables: [
      // ODS
      { id: "ods_production_order", name: "ods_production_order", layer: "ods", type: "table", purpose: "生产工单·增量表", fieldCount: 16, category: "生产数据" },
      { id: "ods_production_line", name: "ods_production_line", layer: "ods", type: "table", purpose: "产线主数据·全量表", fieldCount: 11, category: "主数据" },
      { id: "ods_quality_inspection", name: "ods_quality_inspection", layer: "ods", type: "table", purpose: "质检记录·增量表", fieldCount: 14, category: "质量数据" },
      { id: "ods_material", name: "ods_material", layer: "ods", type: "table", purpose: "物料主数据·全量表", fieldCount: 11, category: "主数据" },
      { id: "ods_inventory_material", name: "ods_inventory_material", layer: "ods", type: "table", purpose: "物料库存·日快照表", fieldCount: 12, category: "库存数据" },
      { id: "ods_supplier", name: "ods_supplier", layer: "ods", type: "table", purpose: "供应商·全量表", fieldCount: 10, category: "主数据" },
      { id: "ods_equipment", name: "ods_equipment", layer: "ods", type: "table", purpose: "设备台账·全量表", fieldCount: 11, category: "设备数据" },
      { id: "ods_labor", name: "ods_labor", layer: "ods", type: "table", purpose: "人工工时·增量表", fieldCount: 13, category: "人力数据" },

      // DIM
      { id: "dim_product", name: "dim_product", layer: "dim", type: "table", purpose: "产品维度·全量", fieldCount: 10, category: "产品维度" },
      { id: "dim_production_line", name: "dim_production_line", layer: "dim", type: "table", purpose: "产线维度·全量", fieldCount: 10, category: "产线维度" },
      { id: "dim_supplier", name: "dim_supplier", layer: "dim", type: "table", purpose: "供应商维度·全量", fieldCount: 10, category: "供应商维度" },
      { id: "dim_material", name: "dim_material", layer: "dim", type: "table", purpose: "物料维度·全量", fieldCount: 10, category: "物料维度" },
      { id: "dim_date", name: "dim_date", layer: "dim", type: "table", purpose: "日期维度·全量", fieldCount: 11, category: "时间维度" },

      // DWD
      { id: "dwd_production_wide", name: "dwd_production_wide", layer: "dwd", type: "table", purpose: "生产事实宽表·粒度=工单", fieldCount: 22, category: "生产明细" },
      { id: "dwd_quality_wide", name: "dwd_quality_wide", layer: "dwd", type: "table", purpose: "质量事实宽表·粒度=质检单", fieldCount: 19, category: "质量明细" },
      { id: "dwd_supply_wide", name: "dwd_supply_wide", layer: "dwd", type: "table", purpose: "供应链事实宽表·粒度=日×物料×供应商", fieldCount: 18, category: "供应链明细" },

      // DWS
      { id: "dws_production_daily", name: "dws_production_daily", layer: "dws", type: "table", purpose: "日生产汇总·快照表", fieldCount: 10, category: "生产汇总" },
      { id: "dws_quality_daily", name: "dws_quality_daily", layer: "dws", type: "table", purpose: "日质量汇总·快照表", fieldCount: 12, category: "质量汇总" },
      { id: "dws_supply_daily", name: "dws_supply_daily", layer: "dws", type: "table", purpose: "日供应汇总·快照表", fieldCount: 9, category: "供应链汇总" },
      { id: "dws_equipment_daily", name: "dws_equipment_daily", layer: "dws", type: "table", purpose: "日设备汇总·快照表", fieldCount: 11, category: "设备汇总" },
      { id: "dws_cost_monthly", name: "dws_cost_monthly", layer: "dws", type: "table", purpose: "月成本汇总·快照表", fieldCount: 10, category: "成本汇总" },
      { id: "dws_material_daily", name: "dws_material_daily", layer: "dws", type: "table", purpose: "日物料周转·快照表", fieldCount: 10, category: "物料汇总" },
      { id: "dws_labor_monthly", name: "dws_labor_monthly", layer: "dws", type: "table", purpose: "月人工效率·快照表", fieldCount: 10, category: "人力汇总" },
      { id: "dws_defect_daily", name: "dws_defect_daily", layer: "dws", type: "table", purpose: "日缺陷汇总·快照表", fieldCount: 10, category: "质量汇总" },

      // ADS
      { id: "v_production_overview", name: "v_production_overview", layer: "ads", type: "view", purpose: "生产总览视图", fieldCount: 6, category: "生产看板" },
      { id: "v_quality_analysis", name: "v_quality_analysis", layer: "ads", type: "view", purpose: "质量分析视图", fieldCount: 6, category: "质量看板" },
      { id: "v_supply_chain", name: "v_supply_chain", layer: "ads", type: "view", purpose: "供应链视图", fieldCount: 6, category: "供应链看板" },
      { id: "v_equipment_oee", name: "v_equipment_oee", layer: "ads", type: "view", purpose: "设备OEE视图", fieldCount: 8, category: "设备看板" },
      { id: "v_cost_analysis", name: "v_cost_analysis", layer: "ads", type: "view", purpose: "成本分析视图", fieldCount: 8, category: "成本看板" },
      { id: "v_capacity_utilization", name: "v_capacity_utilization", layer: "ads", type: "view", purpose: "产能利用率视图", fieldCount: 6, category: "生产看板" },
      { id: "v_manufacturing_finance", name: "v_manufacturing_finance", layer: "ads", type: "view", purpose: "制造财务视图", fieldCount: 9, category: "财务看板" },
      { id: "v_cmei_daily", name: "v_cmei_daily", layer: "ads", type: "view", purpose: "CMEI综合制造效率指数", fieldCount: 5, category: "综合看板" }
    ],
    flows: [
      // ODS → DWD
      { from: "ods_production_order", to: "dwd_production_wide", label: "ETL清洗" },
      { from: "ods_quality_inspection", to: "dwd_quality_wide", label: "ETL清洗" },
      { from: "ods_inventory_material", to: "dwd_supply_wide", label: "ETL清洗" },
      { from: "ods_material", to: "dwd_supply_wide", label: "ETL清洗" },
      { from: "ods_supplier", to: "dwd_supply_wide", label: "ETL清洗" },

      // DIM → DWD
      { from: "dim_product", to: "dwd_production_wide", label: "维度关联", dashed: true },
      { from: "dim_production_line", to: "dwd_production_wide", label: "维度关联", dashed: true },
      { from: "dim_product", to: "dwd_quality_wide", label: "维度关联", dashed: true },
      { from: "dim_production_line", to: "dwd_quality_wide", label: "维度关联", dashed: true },
      { from: "dim_material", to: "dwd_supply_wide", label: "维度关联", dashed: true },
      { from: "dim_supplier", to: "dwd_supply_wide", label: "维度关联", dashed: true },
      { from: "dim_date", to: "dwd_production_wide", label: "维度关联", dashed: true },
      { from: "dim_date", to: "dwd_quality_wide", label: "维度关联", dashed: true },

      // DWD → DWS
      { from: "dwd_production_wide", to: "dws_production_daily", label: "日聚合" },
      { from: "dwd_quality_wide", to: "dws_quality_daily", label: "日聚合" },
      { from: "dwd_quality_wide", to: "dws_defect_daily", label: "日聚合" },
      { from: "dwd_supply_wide", to: "dws_supply_daily", label: "日聚合" },
      { from: "dwd_supply_wide", to: "dws_material_daily", label: "日聚合" },
      { from: "dwd_production_wide", to: "dws_cost_monthly", label: "月聚合" },
      { from: "ods_labor", to: "dws_labor_monthly", label: "月聚合" },
      { from: "ods_equipment", to: "dws_equipment_daily", label: "日聚合" },

      // DWS → ADS
      { from: "dws_production_daily", to: "v_production_overview", label: "指标封装" },
      { from: "dws_quality_daily", to: "v_quality_analysis", label: "指标封装" },
      { from: "dws_supply_daily", to: "v_supply_chain", label: "指标封装" },
      { from: "dws_equipment_daily", to: "v_equipment_oee", label: "指标封装" },
      { from: "dws_cost_monthly", to: "v_cost_analysis", label: "指标封装" },
      { from: "dws_production_daily", to: "v_capacity_utilization", label: "指标封装" },
      { from: "dws_cost_monthly", to: "v_manufacturing_finance", label: "指标封装" },
      { from: "dws_production_daily", to: "v_cmei_daily", label: "指标封装" },
      { from: "dws_quality_daily", to: "v_cmei_daily", label: "指标封装" },
      { from: "dws_equipment_daily", to: "v_cmei_daily", label: "指标封装" }
    ],
    dashboards: [
      { id: "production", name: "生产总览", tables: ["v_production_overview", "dws_production_daily"] },
      { id: "quality", name: "质量管理", tables: ["v_quality_analysis", "dws_quality_daily", "dws_defect_daily"] },
      { id: "delivery", name: "交付管理", tables: ["dws_production_daily"] },
      { id: "equipment", name: "设备管理", tables: ["v_equipment_oee", "dws_equipment_daily"] },
      { id: "cost", name: "成本分析", tables: ["v_cost_analysis", "dws_cost_monthly"] },
      { id: "supply", name: "供应链", tables: ["v_supply_chain", "dws_supply_daily"] },
      { id: "material", name: "物料周转", tables: ["dws_material_daily"] },
      { id: "labor", name: "人工效率", tables: ["dws_labor_monthly"] },
      { id: "cmei", name: "CMEI综合指数", tables: ["v_cmei_daily"] }
    ]
  },

  // ==================== 零售财务 ====================
  retail: {
    name: "零售 · 财务分析",
    description: "销售/支付/会员/库存/费用/预算七大主题，Kimball维度建模",
    layers: [
      { id: "ods", name: "ODS", fullName: "数据引入层", color: "#6b7280", desc: "贴源层，OMS/支付/CRM/ERP/WMS原始数据" },
      { id: "dim", name: "DIM", fullName: "公共维度层", color: "#3b82f6", desc: "一致性维度，日期/地区/渠道/会员/商品/门店" },
      { id: "dwd", name: "DWD", fullName: "明细事实层", color: "#10b981", desc: "事实表，订单/支付/退货/注册/库存/费用/预算" },
      { id: "dws", name: "DWS", fullName: "汇总数据层", color: "#f59e0b", desc: "日/月汇总，销售/支付/会员/库存/费用" },
      { id: "ads", name: "ADS", fullName: "应用数据层", color: "#ef4444", desc: "看板视图，经营总览/渠道分析/财务分析" }
    ],
    tables: [
      // ODS
      { id: "ods_order_item", name: "ods_order_item", layer: "ods", type: "table", purpose: "订单行贴源表·增量", fieldCount: 20, category: "交易数据" },
      { id: "ods_payment", name: "ods_payment", layer: "ods", type: "table", purpose: "支付流水贴源表·增量", fieldCount: 14, category: "支付数据" },
      { id: "ods_return_item", name: "ods_return_item", layer: "ods", type: "table", purpose: "退货明细贴源表·增量", fieldCount: 15, category: "售后数据" },
      { id: "ods_member", name: "ods_member", layer: "ods", type: "table", purpose: "会员主数据贴源表·全量", fieldCount: 13, category: "会员数据" },
      { id: "ods_product", name: "ods_product", layer: "ods", type: "table", purpose: "商品SKU贴源表·全量", fieldCount: 12, category: "商品数据" },
      { id: "ods_store", name: "ods_store", layer: "ods", type: "table", purpose: "门店仓贴源表·全量", fieldCount: 13, category: "门店数据" },
      { id: "ods_inventory_txn", name: "ods_inventory_txn", layer: "ods", type: "table", purpose: "库存事务贴源表·增量", fieldCount: 14, category: "库存数据" },
      { id: "ods_channel", name: "ods_channel", layer: "ods", type: "table", purpose: "渠道主数据贴源表·全量", fieldCount: 11, category: "渠道数据" },
      { id: "ods_payment_method", name: "ods_payment_method", layer: "ods", type: "table", purpose: "支付方式贴源表·全量", fieldCount: 11, category: "支付数据" },
      { id: "ods_promotion", name: "ods_promotion", layer: "ods", type: "table", purpose: "促销活动贴源表·全量", fieldCount: 12, category: "营销数据" },
      { id: "ods_expense", name: "ods_expense", layer: "ods", type: "table", purpose: "费用明细贴源表·增量", fieldCount: 13, category: "财务数据" },
      { id: "ods_budget", name: "ods_budget", layer: "ods", type: "table", purpose: "预算编制贴源表·全量", fieldCount: 12, category: "财务数据" },

      // DIM
      { id: "dim_date", name: "dim_date", layer: "dim", type: "table", purpose: "日期维度", fieldCount: 12, category: "时间维度" },
      { id: "dim_region", name: "dim_region", layer: "dim", type: "table", purpose: "地区维度", fieldCount: 11, category: "地域维度" },
      { id: "dim_channel", name: "dim_channel", layer: "dim", type: "table", purpose: "渠道维度", fieldCount: 11, category: "渠道维度" },
      { id: "dim_payment_method", name: "dim_payment_method", layer: "dim", type: "table", purpose: "支付方式维度", fieldCount: 11, category: "支付维度" },
      { id: "dim_member", name: "dim_member", layer: "dim", type: "table", purpose: "会员维度", fieldCount: 14, category: "会员维度" },
      { id: "dim_product", name: "dim_product", layer: "dim", type: "table", purpose: "商品维度", fieldCount: 14, category: "商品维度" },
      { id: "dim_store", name: "dim_store", layer: "dim", type: "table", purpose: "门店仓维度", fieldCount: 12, category: "门店维度" },
      { id: "dim_promotion", name: "dim_promotion", layer: "dim", type: "table", purpose: "促销维度", fieldCount: 11, category: "营销维度" },
      { id: "dim_expense_type", name: "dim_expense_type", layer: "dim", type: "table", purpose: "费用类型维度", fieldCount: 11, category: "财务维度" },

      // DWD (fact_*)
      { id: "fact_order_item", name: "fact_order_item", layer: "dwd", type: "table", purpose: "订单行事实表·粒度=订单行", fieldCount: 20, category: "销售明细" },
      { id: "fact_payment", name: "fact_payment", layer: "dwd", type: "table", purpose: "支付流水事实表·粒度=支付单", fieldCount: 18, category: "支付明细" },
      { id: "fact_return", name: "fact_return", layer: "dwd", type: "table", purpose: "退货行事实表·粒度=退货明细行", fieldCount: 19, category: "售后明细" },
      { id: "fact_member_register", name: "fact_member_register", layer: "dwd", type: "table", purpose: "会员注册事实表·粒度=一次注册", fieldCount: 16, category: "会员明细" },
      { id: "fact_inventory_txn", name: "fact_inventory_txn", layer: "dwd", type: "table", purpose: "库存事务事实表·粒度=库存事务明细", fieldCount: 18, category: "库存明细" },
      { id: "fact_expense", name: "fact_expense", layer: "dwd", type: "table", purpose: "费用发生事实表·粒度=费用行", fieldCount: 17, category: "财务明细" },
      { id: "fact_budget", name: "fact_budget", layer: "dwd", type: "table", purpose: "预算编制事实表·粒度=预算行", fieldCount: 17, category: "财务明细" },

      // DWS
      { id: "dws_sales_d", name: "dws_sales_d", layer: "dws", type: "table", purpose: "销售日汇总·日×渠道×门店", fieldCount: 9, category: "销售汇总" },
      { id: "dws_payment_d", name: "dws_payment_d", layer: "dws", type: "table", purpose: "支付日汇总·日×渠道×支付方式", fieldCount: 9, category: "支付汇总" },
      { id: "dws_return_d", name: "dws_return_d", layer: "dws", type: "table", purpose: "退货日汇总·日×渠道×商品", fieldCount: 9, category: "售后汇总" },
      { id: "dws_member_snapshot_d", name: "dws_member_snapshot_d", layer: "dws", type: "table", purpose: "会员日快照·日×会员", fieldCount: 10, category: "会员汇总" },
      { id: "dws_inventory_d", name: "dws_inventory_d", layer: "dws", type: "table", purpose: "库存日汇总·日×仓×商品", fieldCount: 9, category: "库存汇总" },
      { id: "dws_channel_acq_d", name: "dws_channel_acq_d", layer: "dws", type: "table", purpose: "渠道获客日汇总·日×渠道", fieldCount: 7, category: "渠道汇总" },
      { id: "dws_expense_m", name: "dws_expense_m", layer: "dws", type: "table", purpose: "费用月汇总·月×渠道×费用类型", fieldCount: 10, category: "财务汇总" },
      { id: "dws_budget_m", name: "dws_budget_m", layer: "dws", type: "table", purpose: "预算vs实际月汇总·月×渠道×费用类型", fieldCount: 10, category: "财务汇总" },

      // ADS
      { id: "v_ads_ops_overview", name: "v_ads_ops_overview", layer: "ads", type: "view", purpose: "经营总览视图", fieldCount: 6, category: "经营看板" },
      { id: "v_ads_channel_analysis", name: "v_ads_channel_analysis", layer: "ads", type: "view", purpose: "渠道分析视图", fieldCount: 9, category: "渠道看板" },
      { id: "v_ads_member_portrait", name: "v_ads_member_portrait", layer: "ads", type: "view", purpose: "会员画像视图", fieldCount: 8, category: "会员看板" },
      { id: "v_ads_inventory_monitor", name: "v_ads_inventory_monitor", layer: "ads", type: "view", purpose: "库存监控视图", fieldCount: 9, category: "库存看板" },
      { id: "v_ads_return_analysis", name: "v_ads_return_analysis", layer: "ads", type: "view", purpose: "退货分析视图", fieldCount: 7, category: "售后看板" },
      { id: "v_ads_payment_structure", name: "v_ads_payment_structure", layer: "ads", type: "view", purpose: "支付结构视图", fieldCount: 8, category: "支付看板" },
      { id: "v_ads_expense_structure", name: "v_ads_expense_structure", layer: "ads", type: "view", purpose: "费用结构视图", fieldCount: 9, category: "财务看板" },
      { id: "v_ads_budget_achievement", name: "v_ads_budget_achievement", layer: "ads", type: "view", purpose: "预算达成视图", fieldCount: 8, category: "财务看板" }
    ],
    flows: [
      // ODS → DWD
      { from: "ods_order_item", to: "fact_order_item", label: "ETL清洗" },
      { from: "ods_payment", to: "fact_payment", label: "ETL清洗" },
      { from: "ods_return_item", to: "fact_return", label: "ETL清洗" },
      { from: "ods_member", to: "fact_member_register", label: "ETL清洗" },
      { from: "ods_inventory_txn", to: "fact_inventory_txn", label: "ETL清洗" },
      { from: "ods_expense", to: "fact_expense", label: "ETL清洗" },
      { from: "ods_budget", to: "fact_budget", label: "ETL清洗" },

      // DIM → DWD
      { from: "dim_date", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_member", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_product", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_channel", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_store", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_promotion", to: "fact_order_item", label: "维度关联", dashed: true },
      { from: "dim_date", to: "fact_payment", label: "维度关联", dashed: true },
      { from: "dim_payment_method", to: "fact_payment", label: "维度关联", dashed: true },
      { from: "dim_date", to: "fact_expense", label: "维度关联", dashed: true },
      { from: "dim_expense_type", to: "fact_expense", label: "维度关联", dashed: true },

      // DWD → DWS
      { from: "fact_order_item", to: "dws_sales_d", label: "日聚合" },
      { from: "fact_payment", to: "dws_payment_d", label: "日聚合" },
      { from: "fact_return", to: "dws_return_d", label: "日聚合" },
      { from: "fact_member_register", to: "dws_member_snapshot_d", label: "日快照" },
      { from: "fact_order_item", to: "dws_member_snapshot_d", label: "日快照" },
      { from: "fact_inventory_txn", to: "dws_inventory_d", label: "日聚合" },
      { from: "fact_order_item", to: "dws_channel_acq_d", label: "日聚合" },
      { from: "fact_member_register", to: "dws_channel_acq_d", label: "日聚合" },
      { from: "fact_expense", to: "dws_expense_m", label: "月聚合" },
      { from: "fact_budget", to: "dws_budget_m", label: "月聚合" },
      { from: "fact_expense", to: "dws_budget_m", label: "月聚合" },

      // DWS → ADS
      { from: "dws_sales_d", to: "v_ads_ops_overview", label: "指标封装" },
      { from: "dws_channel_acq_d", to: "v_ads_channel_analysis", label: "指标封装" },
      { from: "dws_member_snapshot_d", to: "v_ads_member_portrait", label: "指标封装" },
      { from: "dws_inventory_d", to: "v_ads_inventory_monitor", label: "指标封装" },
      { from: "dws_return_d", to: "v_ads_return_analysis", label: "指标封装" },
      { from: "dws_payment_d", to: "v_ads_payment_structure", label: "指标封装" },
      { from: "dws_expense_m", to: "v_ads_expense_structure", label: "指标封装" },
      { from: "dws_budget_m", to: "v_ads_budget_achievement", label: "指标封装" }
    ],
    dashboards: [
      { id: "overview", name: "经营总览", tables: ["v_ads_ops_overview", "dws_sales_d"] },
      { id: "channel", name: "渠道分析", tables: ["v_ads_channel_analysis", "dws_channel_acq_d"] },
      { id: "member", name: "会员画像", tables: ["v_ads_member_portrait", "dws_member_snapshot_d"] },
      { id: "inventory", name: "库存监控", tables: ["v_ads_inventory_monitor", "dws_inventory_d"] },
      { id: "return", name: "退货分析", tables: ["v_ads_return_analysis", "dws_return_d"] },
      { id: "payment", name: "支付结构", tables: ["v_ads_payment_structure", "dws_payment_d"] },
      { id: "expense", name: "费用结构", tables: ["v_ads_expense_structure", "dws_expense_m"] },
      { id: "budget", name: "预算达成", tables: ["v_ads_budget_achievement", "dws_budget_m"] }
    ]
  }
};
