window.ER_DIAGRAM = {
  title: "OTT 大屏视频 · 实体关系图",
  description:
    "OTT 雪花模型（<code>database/ott_ddl.sql</code>）：按层拆成三张图，避免一张图实体过多导致表名挤在一起。可切换「维度雪花 / ODS→DWD / DWS→ADS」；支持缩放与滚动查看完整表名。",
  legend: [
    "<strong>雪花维度</strong>：上级 dim → 下级 dim",
    "<strong>事实关联</strong>：dim → dwd_*_di",
    "<strong>日汇总</strong>：dwd → dws_*_1d → v_*",
  ],
  views: [
    {
      id: "dim",
      name: "① 维度雪花",
      mermaid: `
erDiagram
    dim_province ||--|{ dim_region : province_id
    dim_region ||--o{ dim_device : region_id
    dim_region ||--o{ dim_user : region_id
    dim_user_package ||--o{ dim_user : pkg_id
    dim_content_category ||--o{ dim_content_series : category_id
    dim_content_genre ||--o{ dim_content_series : genre_id
    dim_content_cp ||--o{ dim_content_series : cp_id
    dim_content_series ||--|{ dim_content_episode : series_id
    dim_channel_category ||--o{ dim_live_channel : channel_cat_id
    dim_device_type ||--o{ dim_device_model : device_type_id
    dim_device_model ||--o{ dim_device : model_id
    dim_firmware ||--o{ dim_device : fw_id
    dim_month ||--o{ dim_date : month_id
    dim_week ||--o{ dim_date : week_id
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DWD",
      mermaid: `
erDiagram
    ods_log_launcher_di ||--o{ dwd_act_launcher_di : ETL
    ods_log_vod_di ||--o{ dwd_vod_play_di : ETL
    ods_log_live_di ||--o{ dwd_live_play_di : ETL
    ods_log_cashier_di ||--o{ dwd_trade_cashier_di : ETL
    ods_order_di ||--o{ dwd_trade_order_di : ETL
    dim_device ||--o{ dwd_act_launcher_di : mac
    dim_device ||--o{ dwd_vod_play_di : mac
    dim_device ||--o{ dwd_live_play_di : mac
    dim_content_episode ||--o{ dwd_vod_play_di : episode_id
    dim_live_channel ||--o{ dwd_live_play_di : channel_id
    dim_user ||--o{ dwd_trade_order_di : userid
    dim_date ||--o{ dwd_vod_play_di : play_date
`,
    },
    {
      id: "dws_ads",
      name: "③ DWS→ADS",
      mermaid: `
erDiagram
    dwd_act_launcher_di ||--o{ dws_act_user_active_1d : aggregate
    dwd_vod_play_di ||--o{ dws_content_episode_play_1d : aggregate
    dwd_vod_play_di ||--o{ dws_content_series_play_1d : aggregate
    dwd_live_play_di ||--o{ dws_content_live_play_1d : aggregate
    dwd_trade_cashier_di ||--o{ dws_trade_cashier_funnel_1d : aggregate
    dwd_trade_order_di ||--o{ dws_trade_order_1d : aggregate
    dws_act_user_active_1d ||--o{ v_dau_overview : ADS
    dws_user_retention_1d ||--o{ v_retention_decomposition : ADS
    dws_trade_order_1d ||--o{ v_ltv : ADS
`,
    },
  ],
  // 兼容旧渲染：默认展示维度雪花
  mermaid: `
erDiagram
    dim_province ||--|{ dim_region : province_id
    dim_region ||--o{ dim_device : region_id
    dim_region ||--o{ dim_user : region_id
    dim_user_package ||--o{ dim_user : pkg_id
    dim_content_category ||--o{ dim_content_series : category_id
    dim_content_genre ||--o{ dim_content_series : genre_id
    dim_content_cp ||--o{ dim_content_series : cp_id
    dim_content_series ||--|{ dim_content_episode : series_id
    dim_channel_category ||--o{ dim_live_channel : channel_cat_id
    dim_device_type ||--o{ dim_device_model : device_type_id
    dim_device_model ||--o{ dim_device : model_id
    dim_firmware ||--o{ dim_device : fw_id
    dim_month ||--o{ dim_date : month_id
    dim_week ||--o{ dim_date : week_id
`,
};
