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
      { id: "ods", name: "ODS", fullName: "操作数据层", color: "#64748b", desc: "原始日志/单据级，一行一次操作或一条主数据" },
      { id: "dim", name: "DIM", fullName: "维度层", color: "#6366f1", desc: "主数据实体，一行一个设备/用户/产品线/渠道/日期" },
      { id: "dwd", name: "DWD", fullName: "明细宽表层", color: "#14b8a6", desc: "清洗后的明细，一行一次操作或一行一用户/一会话" },
      { id: "dws", name: "DWS", fullName: "汇总数据层", color: "#f59e0b", desc: "按日×主题预聚合，日汇总表" },
      { id: "ads", name: "ADS", fullName: "应用数据层", color: "#8b5cf6", desc: "看板指标切片，视图封装指标口径" }
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
      { id: "ods", name: "ODS", fullName: "操作数据层", color: "#64748b", desc: "贴源层，MES/QMS/ERP/WMS原始数据" },
      { id: "dim", name: "DIM", fullName: "维度层", color: "#6366f1", desc: "一致性维度，产品/产线/供应商/物料/日期" },
      { id: "dwd", name: "DWD", fullName: "明细宽表层", color: "#14b8a6", desc: "事实宽表，生产/质量/供应链明细" },
      { id: "dws", name: "DWS", fullName: "汇总数据层", color: "#f59e0b", desc: "日/月汇总，生产/质量/设备/成本" },
      { id: "ads", name: "ADS", fullName: "应用数据层", color: "#8b5cf6", desc: "看板视图，CMEI综合指数等应用指标" }
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

  // ==================== 零售财务（sql6 · 同步自字典） ====================
  retail: {
    name: "零售 · 财务分析",
    description: "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路",
    layers: [
  {
    "id": "ods",
    "name": "ODS",
    "fullName": "操作数据层",
    "color": "#64748b",
    "desc": "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路"
  },
  {
    "id": "dim",
    "name": "DIM",
    "fullName": "维度层",
    "color": "#6366f1",
    "desc": "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路"
  },
  {
    "id": "dwd",
    "name": "DWD",
    "fullName": "明细宽表层",
    "color": "#14b8a6",
    "desc": "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路"
  },
  {
    "id": "dws",
    "name": "DWS",
    "fullName": "汇总数据层",
    "color": "#f59e0b",
    "desc": "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路"
  },
  {
    "id": "ads",
    "name": "ADS",
    "fullName": "应用数据层",
    "color": "#8b5cf6",
    "desc": "sql6 Kimball 五层 · 订单/支付/库存/费用/预算全链路"
  }
],
    tables: [
  {
    "id": "ods_orders",
    "name": "ods_orders",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "订单表",
    "fieldCount": 20,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "业务库 · ERP/OMS 订单",
    "sourceType": "业务库"
  },
  {
    "id": "ods_payment",
    "name": "ods_payment",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "支付流水表",
    "fieldCount": 11,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "支付中台 / 收银流水",
    "sourceType": "业务库"
  },
  {
    "id": "ods_purchase",
    "name": "ods_purchase",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "采购表",
    "fieldCount": 16,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "采购/供应链系统",
    "sourceType": "业务库"
  },
  {
    "id": "ods_inventory",
    "name": "ods_inventory",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "库存流水表",
    "fieldCount": 14,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "WMS / 进销存",
    "sourceType": "业务库"
  },
  {
    "id": "ods_expense",
    "name": "ods_expense",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "费用表",
    "fieldCount": 12,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "费控 / 财务总账",
    "sourceType": "业务库"
  },
  {
    "id": "ods_store_pnl",
    "name": "ods_store_pnl",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "门店损益表",
    "fieldCount": 11,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "门店损益月报（ERP）",
    "sourceType": "业务库"
  },
  {
    "id": "ods_ad_cost",
    "name": "ods_ad_cost",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "广告费用表",
    "fieldCount": 11,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "第三方广告平台导出",
    "sourceType": "第三方文件"
  },
  {
    "id": "ods_budget",
    "name": "ods_budget",
    "name_cn": "",
    "layer": "ods",
    "type": "table",
    "purpose": "预算表",
    "fieldCount": 9,
    "category": "ODS",
    "schedule": "T+1 灌入",
    "sourceSystem": "预算编制表 / 财务BP",
    "sourceType": "业务库"
  },
  {
    "id": "dim_brand",
    "name": "dim_brand",
    "name_cn": "",
    "layer": "dim",
    "type": "table",
    "purpose": "品牌维度表",
    "fieldCount": 9,
    "category": "DIM",
    "schedule": "T+1"
  },
  {
    "id": "dim_channel",
    "name": "dim_channel",
    "name_cn": "",
    "layer": "dim",
    "type": "table",
    "purpose": "渠道维度表",
    "fieldCount": 10,
    "category": "DIM",
    "schedule": "T+1"
  },
  {
    "id": "dim_category",
    "name": "dim_category",
    "name_cn": "",
    "layer": "dim",
    "type": "table",
    "purpose": "品类维度表",
    "fieldCount": 8,
    "category": "DIM",
    "schedule": "T+1"
  },
  {
    "id": "dim_store",
    "name": "dim_store",
    "name_cn": "",
    "layer": "dim",
    "type": "table",
    "purpose": "门店维度表",
    "fieldCount": 10,
    "category": "DIM",
    "schedule": "T+1"
  },
  {
    "id": "dim_date",
    "name": "dim_date",
    "name_cn": "",
    "layer": "dim",
    "type": "table",
    "purpose": "日期维度表",
    "fieldCount": 12,
    "category": "DIM",
    "schedule": "T+1"
  },
  {
    "id": "dwd_sales_wide",
    "name": "dwd_sales_wide",
    "name_cn": "",
    "layer": "dwd",
    "type": "table",
    "purpose": "销售宽表",
    "fieldCount": 25,
    "category": "DWD",
    "schedule": "T+1"
  },
  {
    "id": "dwd_expense_wide",
    "name": "dwd_expense_wide",
    "name_cn": "",
    "layer": "dwd",
    "type": "table",
    "purpose": "费用宽表",
    "fieldCount": 13,
    "category": "DWD",
    "schedule": "T+1"
  },
  {
    "id": "dwd_inventory_wide",
    "name": "dwd_inventory_wide",
    "name_cn": "",
    "layer": "dwd",
    "type": "table",
    "purpose": "库存宽表",
    "fieldCount": 19,
    "category": "DWD",
    "schedule": "T+1"
  },
  {
    "id": "dws_sales_daily",
    "name": "dws_sales_daily",
    "name_cn": "",
    "layer": "dws",
    "type": "table",
    "purpose": "日销售汇总",
    "fieldCount": 10,
    "category": "DWS",
    "schedule": "T+1"
  },
  {
    "id": "dws_sales_monthly",
    "name": "dws_sales_monthly",
    "name_cn": "",
    "layer": "dws",
    "type": "table",
    "purpose": "月销售汇总",
    "fieldCount": 8,
    "category": "DWS",
    "schedule": "T+1"
  },
  {
    "id": "dws_expense_monthly",
    "name": "dws_expense_monthly",
    "name_cn": "",
    "layer": "dws",
    "type": "table",
    "purpose": "月费用汇总",
    "fieldCount": 6,
    "category": "DWS",
    "schedule": "T+1"
  },
  {
    "id": "dws_inventory_daily",
    "name": "dws_inventory_daily",
    "name_cn": "",
    "layer": "dws",
    "type": "table",
    "purpose": "日库存汇总",
    "fieldCount": 7,
    "category": "DWS",
    "schedule": "T+1"
  },
  {
    "id": "dws_store_daily",
    "name": "dws_store_daily",
    "name_cn": "",
    "layer": "dws",
    "type": "table",
    "purpose": "日门店汇总·快照表",
    "fieldCount": 6,
    "category": "DWS",
    "schedule": "T+1"
  },
  {
    "id": "v_overview",
    "name": "v_overview",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "经营总览 KPI",
    "fieldCount": 5,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_brand",
    "name": "v_brand",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "品牌分析",
    "fieldCount": 4,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_channel",
    "name": "v_channel",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "渠道分析",
    "fieldCount": 3,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_income_statement",
    "name": "v_income_statement",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "利润表视图",
    "fieldCount": 4,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_dupont",
    "name": "v_dupont",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "杜邦 ROE 分解",
    "fieldCount": 7,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_balance_sheet",
    "name": "v_balance_sheet",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "资产负债表视图",
    "fieldCount": 12,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_cashflow",
    "name": "v_cashflow",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "现金流量视图",
    "fieldCount": 5,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_cashflow_statement",
    "name": "v_cashflow_statement",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "现金流量表视图",
    "fieldCount": 2,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_tax_analysis",
    "name": "v_tax_analysis",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "税务分析视图",
    "fieldCount": 4,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_budget",
    "name": "v_budget",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "预算执行",
    "fieldCount": 1,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "v_inventory",
    "name": "v_inventory",
    "name_cn": "",
    "layer": "ads",
    "type": "view",
    "purpose": "库存周转监控",
    "fieldCount": 5,
    "category": "ADS",
    "schedule": "实时（视图）"
  },
  {
    "id": "dws_asset_monthly",
    "name": "dws_asset_monthly",
    "name_cn": "资产月汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "资产/负债月汇总（资产负债表上游）",
    "fieldCount": 12,
    "category": "财务汇总",
    "schedule": "T+1"
  },
  {
    "id": "dws_cashflow_monthly",
    "name": "dws_cashflow_monthly",
    "name_cn": "现金流月汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "经营/投资/筹资现金流月汇总",
    "fieldCount": 14,
    "category": "财务汇总",
    "schedule": "T+1"
  },
  {
    "id": "dws_tax_monthly",
    "name": "dws_tax_monthly",
    "name_cn": "税务月汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "销项/进项/应纳税额月汇总",
    "fieldCount": 10,
    "category": "财务汇总",
    "schedule": "T+1"
  },
  {
    "id": "dws_budget_monthly",
    "name": "dws_budget_monthly",
    "name_cn": "预算月汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "预算执行月汇总",
    "fieldCount": 10,
    "category": "财务汇总",
    "schedule": "T+1"
  }
],
    flows: [
  {
    "from": "ods_orders",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_orders",
    "to": "dws_sales_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_orders",
    "to": "dws_sales_monthly",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_orders",
    "to": "v_overview",
    "label": "指标封装"
  },
  {
    "from": "dwd_sales_wide",
    "to": "dws_sales_daily",
    "label": "血缘"
  },
  {
    "from": "ods_payment",
    "to": "v_cashflow",
    "label": "指标封装"
  },
  {
    "from": "ods_purchase",
    "to": "dwd_inventory_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_inventory",
    "to": "dwd_inventory_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_inventory",
    "to": "dws_inventory_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_inventory",
    "to": "v_inventory",
    "label": "指标封装"
  },
  {
    "from": "dwd_inventory_wide",
    "to": "dws_inventory_daily",
    "label": "血缘"
  },
  {
    "from": "ods_expense",
    "to": "dwd_expense_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_expense",
    "to": "dws_expense_monthly",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_expense",
    "to": "v_budget",
    "label": "指标封装"
  },
  {
    "from": "dwd_expense_wide",
    "to": "dws_expense_monthly",
    "label": "血缘"
  },
  {
    "from": "ods_store_pnl",
    "to": "dws_store_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_ad_cost",
    "to": "dws_expense_monthly",
    "label": "ETL/聚合"
  },
  {
    "from": "ods_budget",
    "to": "v_budget",
    "label": "指标封装"
  },
  {
    "from": "dim_brand",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_brand",
    "to": "dwd_expense_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_channel",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_channel",
    "to": "dwd_expense_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_category",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_category",
    "to": "dwd_inventory_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_store",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_store",
    "to": "dws_store_daily",
    "label": "ETL/聚合"
  },
  {
    "from": "dim_date",
    "to": "dwd_sales_wide",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_sales_wide",
    "to": "dws_sales_monthly",
    "label": "ETL/聚合"
  },
  {
    "from": "dwd_sales_wide",
    "to": "v_brand",
    "label": "指标封装"
  },
  {
    "from": "dwd_sales_wide",
    "to": "v_channel",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_daily",
    "to": "dws_sales_monthly",
    "label": "血缘"
  },
  {
    "from": "dwd_expense_wide",
    "to": "v_budget",
    "label": "指标封装"
  },
  {
    "from": "dws_expense_monthly",
    "to": "v_budget",
    "label": "血缘"
  },
  {
    "from": "dwd_inventory_wide",
    "to": "v_inventory",
    "label": "指标封装"
  },
  {
    "from": "dws_inventory_daily",
    "to": "v_inventory",
    "label": "血缘"
  },
  {
    "from": "dws_sales_daily",
    "to": "v_overview",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_daily",
    "to": "v_dupont",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_monthly",
    "to": "v_overview",
    "label": "血缘"
  },
  {
    "from": "dws_sales_monthly",
    "to": "v_brand",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_monthly",
    "to": "v_channel",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_monthly",
    "to": "v_income_statement",
    "label": "指标封装"
  },
  {
    "from": "dws_sales_monthly",
    "to": "v_dupont",
    "label": "指标封装"
  },
  {
    "from": "v_overview",
    "to": "v_brand",
    "label": "血缘"
  },
  {
    "from": "dws_inventory_daily",
    "to": "v_dupont",
    "label": "指标封装"
  },
  {
    "from": "v_inventory",
    "to": "v_dupont",
    "label": "血缘"
  },
  {
    "from": "dws_asset_monthly",
    "to": "v_balance_sheet",
    "label": "指标封装",
    "schedule": "实时"
  },
  {
    "from": "dws_cashflow_monthly",
    "to": "v_cashflow",
    "label": "指标封装",
    "schedule": "实时"
  },
  {
    "from": "v_cashflow",
    "to": "v_cashflow_statement",
    "label": "指标封装",
    "schedule": "实时"
  },
  {
    "from": "dws_tax_monthly",
    "to": "v_tax_analysis",
    "label": "指标封装",
    "schedule": "实时"
  },
  {
    "from": "dws_budget_monthly",
    "to": "v_budget",
    "label": "指标封装",
    "schedule": "实时"
  },
  {
    "from": "dws_expense_monthly",
    "to": "v_income_statement",
    "label": "指标封装",
    "schedule": "实时"
  }
],
    dashboards: [
  {
    "id": "overview",
    "name": "经营总览",
    "api": "/api/dashboard_overview",
    "tables": [
      "ods_orders",
      "dim_date",
      "dwd_sales_wide",
      "dws_sales_daily"
    ]
  },
  {
    "id": "brand",
    "name": "品牌分析",
    "api": "/api/dashboard_brand",
    "tables": [
      "dim_brand",
      "dim_category",
      "dwd_sales_wide",
      "dws_sales_daily"
    ]
  },
  {
    "id": "channel",
    "name": "渠道分析",
    "api": "/api/dashboard_channel",
    "tables": [
      "ods_ad_cost",
      "dim_channel",
      "dwd_sales_wide",
      "dws_sales_daily"
    ]
  },
  {
    "id": "financial",
    "name": "三大报表",
    "api": "/api/dashboard_financial",
    "tables": [
      "ods_store_pnl",
      "dws_sales_monthly",
      "dws_expense_monthly",
      "v_income_statement"
    ]
  },
  {
    "id": "dupont",
    "name": "杜邦分析",
    "api": "/api/dashboard_dupont",
    "tables": [
      "dws_sales_monthly",
      "dws_inventory_daily",
      "v_dupont"
    ]
  },
  {
    "id": "cashflow",
    "name": "现金流分析",
    "api": "/api/dashboard_cashflow",
    "tables": [
      "ods_payment",
      "v_cashflow",
      "v_cashflow_statement"
    ]
  },
  {
    "id": "tax",
    "name": "税务分析",
    "api": "/api/dashboard_tax",
    "tables": [
      "v_tax_analysis"
    ]
  },
  {
    "id": "inventory",
    "name": "库存分析",
    "api": "/api/dashboard_inventory",
    "tables": [
      "ods_inventory",
      "dim_category",
      "dwd_inventory_wide",
      "dws_inventory_daily"
    ]
  },
  {
    "id": "budget",
    "name": "预算执行",
    "api": "/api/dashboard_budget",
    "tables": [
      "ods_expense",
      "ods_ad_cost",
      "ods_budget",
      "dwd_expense_wide"
    ]
  },
  {
    "id": "store",
    "name": "门店分析",
    "api": "/api/dashboard_store",
    "tables": [
      "ods_store_pnl",
      "dim_store",
      "dws_sales_daily",
      "dws_store_daily"
    ]
  },
  {
    "id": "profit-quality",
    "name": "利润质量",
    "api": "/api/dashboard_profit_quality",
    "tables": [
      "v_income_statement",
      "v_cashflow"
    ]
  },
  {
    "id": "cvp",
    "name": "本量利分析",
    "api": "/api/dashboard_cvp",
    "tables": [
      "dwd_sales_wide",
      "dws_sales_monthly"
    ]
  },
  {
    "id": "quality",
    "name": "数据质量监控大盘",
    "api": "/api/dashboard_quality",
    "tables": [
      "ods_orders",
      "ods_payment",
      "ods_inventory",
      "ods_expense"
    ]
  }
]
  }
};
