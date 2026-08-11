/**
 * 数仓分层全景图 · 互联网 · OTT 增长分析（同步自字典）
 */
window.DW_ARCHITECTURE_DATA = {
  internet: {
    name: "互联网 · OTT 增长分析",
    description: "开机/点播/直播/订购 · 用户增长与变现",
    layers: [
  {
    "id": "ods",
    "name": "ODS",
    "fullName": "操作数据层",
    "color": "#64748b",
    "desc": "开机/点播/直播/订购 · 用户增长与变现"
  },
  {
    "id": "dim",
    "name": "DIM",
    "fullName": "维度层",
    "color": "#6366f1",
    "desc": "开机/点播/直播/订购 · 用户增长与变现"
  },
  {
    "id": "dwd",
    "name": "DWD",
    "fullName": "明细宽表层",
    "color": "#14b8a6",
    "desc": "开机/点播/直播/订购 · 用户增长与变现"
  },
  {
    "id": "dws",
    "name": "DWS",
    "fullName": "汇总数据层",
    "color": "#f59e0b",
    "desc": "开机/点播/直播/订购 · 用户增长与变现"
  },
  {
    "id": "ads",
    "name": "ADS",
    "fullName": "应用数据层",
    "color": "#8b5cf6",
    "desc": "开机/点播/直播/订购 · 用户增长与变现"
  }
],
    tables: [
  {
    "id": "dim_province",
    "name": "dim_province",
    "name_cn": "省份",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·省份（雪花上级维）",
    "fieldCount": 2,
    "category": "DIM"
  },
  {
    "id": "dim_region",
    "name": "dim_region",
    "name_cn": "地市",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·地市（雪花，挂 dim_province）",
    "fieldCount": 4,
    "category": "DIM"
  },
  {
    "id": "dim_content_genre",
    "name": "dim_content_genre",
    "name_cn": "题材",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·题材（雪花末级）",
    "fieldCount": 2,
    "category": "DIM"
  },
  {
    "id": "dim_content_category",
    "name": "dim_content_category",
    "name_cn": "内容类型",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·内容类型",
    "fieldCount": 3,
    "category": "DIM"
  },
  {
    "id": "dim_content_cp",
    "name": "dim_content_cp",
    "name_cn": "内容提供方",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·内容提供方",
    "fieldCount": 3,
    "category": "DIM"
  },
  {
    "id": "dim_content_series",
    "name": "dim_content_series",
    "name_cn": "剧集",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·剧集（雪花，挂 category/genre/cp）",
    "fieldCount": 9,
    "category": "DIM"
  },
  {
    "id": "dim_content_episode",
    "name": "dim_content_episode",
    "name_cn": "单集",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·单集（雪花，挂 series）",
    "fieldCount": 5,
    "category": "DIM"
  },
  {
    "id": "dim_channel_category",
    "name": "dim_channel_category",
    "name_cn": "直播频道大类",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·直播频道大类",
    "fieldCount": 2,
    "category": "DIM"
  },
  {
    "id": "dim_live_channel",
    "name": "dim_live_channel",
    "name_cn": "直播频道",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·直播频道（雪花，挂 channel_category）",
    "fieldCount": 3,
    "category": "DIM"
  },
  {
    "id": "dim_device_type",
    "name": "dim_device_type",
    "name_cn": "端类型",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·端类型",
    "fieldCount": 2,
    "category": "DIM"
  },
  {
    "id": "dim_device_model",
    "name": "dim_device_model",
    "name_cn": "设备型号",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·设备型号（雪花，挂 device_type）",
    "fieldCount": 3,
    "category": "DIM"
  },
  {
    "id": "dim_firmware",
    "name": "dim_firmware",
    "name_cn": "固件版本",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·固件版本",
    "fieldCount": 2,
    "category": "DIM"
  },
  {
    "id": "dim_device",
    "name": "dim_device",
    "name_cn": "设备",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·设备（雪花，挂 model/firmware/region）",
    "fieldCount": 7,
    "category": "DIM"
  },
  {
    "id": "dim_user_package",
    "name": "dim_user_package",
    "name_cn": "套餐",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·套餐",
    "fieldCount": 4,
    "category": "DIM"
  },
  {
    "id": "dim_user",
    "name": "dim_user",
    "name_cn": "用户",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·用户（雪花，挂 region/package）",
    "fieldCount": 6,
    "category": "DIM"
  },
  {
    "id": "dim_month",
    "name": "dim_month",
    "name_cn": "月",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·月（雪花上级）",
    "fieldCount": 4,
    "category": "DIM"
  },
  {
    "id": "dim_week",
    "name": "dim_week",
    "name_cn": "周",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·周（雪花上级）",
    "fieldCount": 5,
    "category": "DIM"
  },
  {
    "id": "dim_date",
    "name": "dim_date",
    "name_cn": "日期",
    "layer": "dim",
    "type": "table",
    "purpose": "DIM·日期（雪花，挂 week/month）",
    "fieldCount": 8,
    "category": "DIM"
  },
  {
    "id": "ods_device_info_df",
    "name": "ods_device_info_df",
    "name_cn": "设备信息·全量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·设备信息·全量",
    "fieldCount": 7,
    "category": "ODS"
  },
  {
    "id": "ods_content_series_df",
    "name": "ods_content_series_df",
    "name_cn": "剧集元数据·全量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·剧集元数据·全量",
    "fieldCount": 9,
    "category": "ODS"
  },
  {
    "id": "ods_content_episode_df",
    "name": "ods_content_episode_df",
    "name_cn": "单集元数据·全量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·单集元数据·全量",
    "fieldCount": 6,
    "category": "ODS"
  },
  {
    "id": "ods_live_channel_df",
    "name": "ods_live_channel_df",
    "name_cn": "直播频道元数据·全量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·直播频道元数据·全量",
    "fieldCount": 4,
    "category": "ODS"
  },
  {
    "id": "ods_log_launcher_di",
    "name": "ods_log_launcher_di",
    "name_cn": "开机日志·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·开机日志·增量（近3天）",
    "fieldCount": 9,
    "category": "ODS"
  },
  {
    "id": "ods_log_vod_di",
    "name": "ods_log_vod_di",
    "name_cn": "点播日志·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·点播日志·增量（近3天，含action）",
    "fieldCount": 15,
    "category": "ODS"
  },
  {
    "id": "ods_log_live_di",
    "name": "ods_log_live_di",
    "name_cn": "直播日志·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·直播日志·增量（近3天）",
    "fieldCount": 9,
    "category": "ODS"
  },
  {
    "id": "ods_log_cashier_di",
    "name": "ods_log_cashier_di",
    "name_cn": "收银台日志·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·收银台日志·增量（近3天）",
    "fieldCount": 11,
    "category": "ODS"
  },
  {
    "id": "ods_user_register_di",
    "name": "ods_user_register_di",
    "name_cn": "开户·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·开户·增量",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_user_unsubscribe_di",
    "name": "ods_user_unsubscribe_di",
    "name_cn": "退订·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·退订·增量",
    "fieldCount": 8,
    "category": "ODS"
  },
  {
    "id": "ods_order_di",
    "name": "ods_order_di",
    "name_cn": "订购/退订明细·增量",
    "layer": "ods",
    "type": "table",
    "purpose": "ODS·订购/退订明细·增量",
    "fieldCount": 11,
    "category": "ODS"
  },
  {
    "id": "dwd_act_launcher_di",
    "name": "dwd_act_launcher_di",
    "name_cn": "开机事实·粒度=一次开机行为",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·开机事实·粒度=一次开机行为（mac为主，userid变则记录变）",
    "fieldCount": 8,
    "category": "DWD"
  },
  {
    "id": "dwd_vod_play_di",
    "name": "dwd_vod_play_di",
    "name_cn": "点播播放事实·粒度=一次播放",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·点播播放事实·粒度=一次播放",
    "fieldCount": 18,
    "category": "DWD"
  },
  {
    "id": "dwd_live_play_di",
    "name": "dwd_live_play_di",
    "name_cn": "直播播放事实·粒度=一次观看",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·直播播放事实·粒度=一次观看",
    "fieldCount": 9,
    "category": "DWD"
  },
  {
    "id": "dwd_trade_cashier_di",
    "name": "dwd_trade_cashier_di",
    "name_cn": "收银台漏斗事实·粒度=一次埋点",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·收银台漏斗事实·粒度=一次埋点",
    "fieldCount": 11,
    "category": "DWD"
  },
  {
    "id": "dwd_trade_order_di",
    "name": "dwd_trade_order_di",
    "name_cn": "订购/退订事实",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·订购/退订事实",
    "fieldCount": 11,
    "category": "DWD"
  },
  {
    "id": "dwd_user_status_di",
    "name": "dwd_user_status_di",
    "name_cn": "用户状态日快照·粒度=日×userid",
    "layer": "dwd",
    "type": "table",
    "purpose": "DWD·用户状态日快照·粒度=日×userid",
    "fieldCount": 9,
    "category": "DWD"
  },
  {
    "id": "dws_act_user_active_1d",
    "name": "dws_act_user_active_1d",
    "name_cn": "用户日活跃·mac粒度",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·用户日活跃·mac粒度",
    "fieldCount": 13,
    "category": "DWS"
  },
  {
    "id": "dws_content_series_play_1d",
    "name": "dws_content_series_play_1d",
    "name_cn": "剧集日播放·series粒度",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·剧集日播放·series粒度",
    "fieldCount": 11,
    "category": "DWS"
  },
  {
    "id": "dws_content_episode_play_1d",
    "name": "dws_content_episode_play_1d",
    "name_cn": "单集日播放·episode粒度",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·单集日播放·episode粒度",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_content_live_play_1d",
    "name": "dws_content_live_play_1d",
    "name_cn": "直播频道日播放",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·直播频道日播放",
    "fieldCount": 7,
    "category": "DWS"
  },
  {
    "id": "dws_trade_cashier_funnel_1d",
    "name": "dws_trade_cashier_funnel_1d",
    "name_cn": "收银台漏斗日汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·收银台漏斗日汇总",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_trade_order_1d",
    "name": "dws_trade_order_1d",
    "name_cn": "订购/分成日汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·订购/分成日汇总",
    "fieldCount": 8,
    "category": "DWS"
  },
  {
    "id": "dws_user_lifecycle_1d",
    "name": "dws_user_lifecycle_1d",
    "name_cn": "用户生命周期日汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·用户生命周期日汇总",
    "fieldCount": 9,
    "category": "DWS"
  },
  {
    "id": "dws_user_retention_1d",
    "name": "dws_user_retention_1d",
    "name_cn": "留存同期群日汇总",
    "layer": "dws",
    "type": "table",
    "purpose": "DWS·留存同期群日汇总",
    "fieldCount": 7,
    "category": "DWS"
  },
  {
    "id": "v_dau_overview",
    "name": "v_dau_overview",
    "name_cn": "日活总览",
    "layer": "ads",
    "type": "view",
    "purpose": "v_dau_overview 分析视图（日活总览）",
    "fieldCount": 7,
    "category": "ADS"
  },
  {
    "id": "v_lifecycle",
    "name": "v_lifecycle",
    "name_cn": "生命周期",
    "layer": "ads",
    "type": "view",
    "purpose": "v_lifecycle 分析视图（生命周期）",
    "fieldCount": 9,
    "category": "ADS"
  },
  {
    "id": "v_user_lifecycle",
    "name": "v_user_lifecycle",
    "name_cn": "用户生命周期",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_lifecycle 分析视图（用户生命周期）",
    "fieldCount": 0,
    "category": "ADS"
  },
  {
    "id": "v_retention_decomposition",
    "name": "v_retention_decomposition",
    "name_cn": "留存分解",
    "layer": "ads",
    "type": "view",
    "purpose": "v_retention_decomposition 分析视图（留存分解）",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_user_retention",
    "name": "v_user_retention",
    "name_cn": "用户留存",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_retention 分析视图（用户留存）",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_user_segment",
    "name": "v_user_segment",
    "name_cn": "用户分群",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_segment 分析视图（用户分群）",
    "fieldCount": 5,
    "category": "ADS"
  },
  {
    "id": "v_channel_attribution",
    "name": "v_channel_attribution",
    "name_cn": "渠道归因",
    "layer": "ads",
    "type": "view",
    "purpose": "v_channel_attribution 分析视图（渠道归因）",
    "fieldCount": 9,
    "category": "ADS"
  },
  {
    "id": "v_ab_experiment",
    "name": "v_ab_experiment",
    "name_cn": "AB实验",
    "layer": "ads",
    "type": "view",
    "purpose": "v_ab_experiment 分析视图（AB实验）",
    "fieldCount": 12,
    "category": "ADS"
  },
  {
    "id": "v_funnel",
    "name": "v_funnel",
    "name_cn": "转化漏斗",
    "layer": "ads",
    "type": "view",
    "purpose": "v_funnel 分析视图（转化漏斗）",
    "fieldCount": 9,
    "category": "ADS"
  },
  {
    "id": "v_ltv",
    "name": "v_ltv",
    "name_cn": "用户LTV",
    "layer": "ads",
    "type": "view",
    "purpose": "v_ltv 分析视图（用户LTV）",
    "fieldCount": 5,
    "category": "ADS"
  },
  {
    "id": "v_rfm",
    "name": "v_rfm",
    "name_cn": "RFM分群",
    "layer": "ads",
    "type": "view",
    "purpose": "v_rfm 分析视图（RFM分群）",
    "fieldCount": 7,
    "category": "ADS"
  },
  {
    "id": "v_channel_analysis",
    "name": "v_channel_analysis",
    "name_cn": "渠道分析",
    "layer": "ads",
    "type": "view",
    "purpose": "v_channel_analysis 分析视图（渠道分析）",
    "fieldCount": 10,
    "category": "ADS"
  },
  {
    "id": "v_user_portrait",
    "name": "v_user_portrait",
    "name_cn": "用户画像",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_portrait 分析视图（用户画像）",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_user_path",
    "name": "v_user_path",
    "name_cn": "用户路径",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_path 分析视图（用户路径）",
    "fieldCount": 11,
    "category": "ADS"
  },
  {
    "id": "v_user_path_session",
    "name": "v_user_path_session",
    "name_cn": "会话路径",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_path_session 分析视图（会话路径）",
    "fieldCount": 13,
    "category": "ADS"
  },
  {
    "id": "v_top_paths",
    "name": "v_top_paths",
    "name_cn": "热门路径",
    "layer": "ads",
    "type": "view",
    "purpose": "v_top_paths 分析视图（热门路径）",
    "fieldCount": 7,
    "category": "ADS"
  },
  {
    "id": "v_revenue_structure",
    "name": "v_revenue_structure",
    "name_cn": "收入结构",
    "layer": "ads",
    "type": "view",
    "purpose": "v_revenue_structure 分析视图（收入结构）",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_plan_analysis",
    "name": "v_plan_analysis",
    "name_cn": "套餐分析",
    "layer": "ads",
    "type": "view",
    "purpose": "v_plan_analysis 分析视图（套餐分析）",
    "fieldCount": 13,
    "category": "ADS"
  },
  {
    "id": "v_plan_ltv",
    "name": "v_plan_ltv",
    "name_cn": "套餐LTV",
    "layer": "ads",
    "type": "view",
    "purpose": "v_plan_ltv 分析视图（套餐LTV）",
    "fieldCount": 5,
    "category": "ADS"
  },
  {
    "id": "v_arpu_trend",
    "name": "v_arpu_trend",
    "name_cn": "ARPU趋势",
    "layer": "ads",
    "type": "view",
    "purpose": "v_arpu_trend 分析视图（ARPU趋势）",
    "fieldCount": 4,
    "category": "ADS"
  },
  {
    "id": "v_activity_summary",
    "name": "v_activity_summary",
    "name_cn": "活跃汇总",
    "layer": "ads",
    "type": "view",
    "purpose": "v_activity_summary 分析视图（活跃汇总）",
    "fieldCount": 18,
    "category": "ADS"
  },
  {
    "id": "v_activity_daily_trend",
    "name": "v_activity_daily_trend",
    "name_cn": "活跃日趋势",
    "layer": "ads",
    "type": "view",
    "purpose": "v_activity_daily_trend 分析视图（活跃日趋势）",
    "fieldCount": 11,
    "category": "ADS"
  },
  {
    "id": "v_health_dashboard",
    "name": "v_health_dashboard",
    "name_cn": "健康度看板",
    "layer": "ads",
    "type": "view",
    "purpose": "v_health_dashboard 分析视图（健康度看板）",
    "fieldCount": 12,
    "category": "ADS"
  },
  {
    "id": "v_health_group_summary",
    "name": "v_health_group_summary",
    "name_cn": "健康度分组",
    "layer": "ads",
    "type": "view",
    "purpose": "v_health_group_summary 分析视图（健康度分组）",
    "fieldCount": 7,
    "category": "ADS"
  },
  {
    "id": "v_user_tag_overview",
    "name": "v_user_tag_overview",
    "name_cn": "用户标签总览",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_tag_overview 分析视图（用户标签总览）",
    "fieldCount": 8,
    "category": "ADS"
  },
  {
    "id": "v_user_tag_detail",
    "name": "v_user_tag_detail",
    "name_cn": "用户标签明细",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_tag_detail 分析视图（用户标签明细）",
    "fieldCount": 0,
    "category": "ADS"
  },
  {
    "id": "v_user_tag_by_category",
    "name": "v_user_tag_by_category",
    "name_cn": "标签分类汇总",
    "layer": "ads",
    "type": "view",
    "purpose": "v_user_tag_by_category 分析视图（标签分类汇总）",
    "fieldCount": 8,
    "category": "ADS"
  }
],
    flows: [
  {
    "from": "dim_province",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_region",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_content_genre",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_content_category",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_content_cp",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_content_series",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_content_episode",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "dim_channel_category",
    "to": "dwd_act_launcher_di",
    "label": "维度关联",
    "dashed": true
  },
  {
    "from": "ods_device_info_df",
    "to": "dwd_act_launcher_di",
    "label": "ETL清洗"
  },
  {
    "from": "ods_content_series_df",
    "to": "dwd_vod_play_di",
    "label": "ETL清洗"
  },
  {
    "from": "ods_content_episode_df",
    "to": "dwd_live_play_di",
    "label": "ETL清洗"
  },
  {
    "from": "ods_live_channel_df",
    "to": "dwd_trade_cashier_di",
    "label": "ETL清洗"
  },
  {
    "from": "ods_log_launcher_di",
    "to": "dwd_trade_order_di",
    "label": "ETL清洗"
  },
  {
    "from": "ods_log_vod_di",
    "to": "dwd_user_status_di",
    "label": "ETL清洗"
  },
  {
    "from": "dwd_act_launcher_di",
    "to": "dws_act_user_active_1d",
    "label": "日聚合"
  },
  {
    "from": "dwd_vod_play_di",
    "to": "dws_content_series_play_1d",
    "label": "日聚合"
  },
  {
    "from": "dwd_live_play_di",
    "to": "dws_content_episode_play_1d",
    "label": "日聚合"
  },
  {
    "from": "dwd_trade_cashier_di",
    "to": "dws_content_live_play_1d",
    "label": "日聚合"
  },
  {
    "from": "dwd_trade_order_di",
    "to": "dws_trade_cashier_funnel_1d",
    "label": "日聚合"
  },
  {
    "from": "dwd_user_status_di",
    "to": "dws_trade_order_1d",
    "label": "日聚合"
  },
  {
    "from": "dws_act_user_active_1d",
    "to": "v_dau_overview",
    "label": "指标封装"
  },
  {
    "from": "dws_content_series_play_1d",
    "to": "v_lifecycle",
    "label": "指标封装"
  },
  {
    "from": "dws_content_episode_play_1d",
    "to": "v_user_lifecycle",
    "label": "指标封装"
  },
  {
    "from": "dws_content_live_play_1d",
    "to": "v_retention_decomposition",
    "label": "指标封装"
  },
  {
    "from": "dws_trade_cashier_funnel_1d",
    "to": "v_user_retention",
    "label": "指标封装"
  },
  {
    "from": "dws_trade_order_1d",
    "to": "v_user_segment",
    "label": "指标封装"
  },
  {
    "from": "dws_user_lifecycle_1d",
    "to": "v_channel_attribution",
    "label": "指标封装"
  },
  {
    "from": "dws_user_retention_1d",
    "to": "v_ab_experiment",
    "label": "指标封装"
  }
],
    dashboards: [
  {
    "id": "overview",
    "name": "活跃总览",
    "api": "/api/dashboard_overview",
    "tables": []
  },
  {
    "id": "launcher",
    "name": "开机活跃",
    "api": "/api/dashboard_launcher",
    "tables": []
  },
  {
    "id": "vod",
    "name": "点播活跃",
    "api": "/api/dashboard_vod",
    "tables": []
  },
  {
    "id": "live",
    "name": "直播活跃",
    "api": "/api/dashboard_live",
    "tables": []
  },
  {
    "id": "series",
    "name": "内容·剧集",
    "api": "/api/dashboard_series",
    "tables": []
  },
  {
    "id": "episode",
    "name": "内容·单集与行为",
    "api": "/api/dashboard_episode",
    "tables": []
  },
  {
    "id": "quality",
    "name": "完播与QoS",
    "api": "/api/dashboard_quality",
    "tables": []
  },
  {
    "id": "lifecycle",
    "name": "用户生命周期",
    "api": "/api/dashboard_lifecycle",
    "tables": []
  },
  {
    "id": "retention",
    "name": "用户留存",
    "api": "/api/dashboard_retention",
    "tables": []
  },
  {
    "id": "device",
    "name": "设备流转",
    "api": "/api/dashboard_device",
    "tables": []
  },
  {
    "id": "funnel",
    "name": "商业化漏斗",
    "api": "/api/dashboard_funnel",
    "tables": []
  },
  {
    "id": "order",
    "name": "订购与分成",
    "api": "/api/dashboard_order",
    "tables": []
  },
  {
    "id": "path",
    "name": "用户行为路径",
    "api": "/api/dashboard_path",
    "tables": []
  },
  {
    "id": "revenue",
    "name": "收入结构深度分析",
    "api": "/api/dashboard_revenue",
    "tables": []
  },
  {
    "id": "activity",
    "name": "营销活动复盘",
    "api": "/api/dashboard_activity",
    "tables": []
  },
  {
    "id": "health",
    "name": "业务健康度",
    "api": "/api/dashboard_health",
    "tables": []
  },
  {
    "id": "tags",
    "name": "用户标签画像",
    "api": "/api/dashboard_tags",
    "tables": []
  }
]
  }
};
