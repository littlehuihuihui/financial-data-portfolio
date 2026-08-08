window.ER_DIAGRAM = {
  title: "OTT 大屏视频 · 实体关系图",
  description:
    "OTT 雪花模型（<code>database/ott_ddl.sql</code>）：按数仓分层<strong>自上而下</strong>排布，拆成「维度雪花 / ODS→DWD / DWS→ADS」三张图。",
  legend: [
    "<strong>布局</strong>：上层维度/原始 → 中层明细 → 下层汇总/应用",
    "<strong>雪花维度</strong>：上级 dim → 下级 dim",
    "<strong>日汇总</strong>：dwd → dws_*_1d → v_*",
  ],
  views: [
    {
      id: "dim",
      name: "① 维度雪花",
      mermaid: `
flowchart TB
  subgraph GEO["地域维度"]
    direction TB
    dim_province["dim_province"]
    dim_region["dim_region"]
    dim_province -->|province_id| dim_region
  end
  subgraph DEVICE["设备维度"]
    direction TB
    dim_device_type["dim_device_type"]
    dim_device_model["dim_device_model"]
    dim_firmware["dim_firmware"]
    dim_device["dim_device"]
    dim_device_type -->|device_type_id| dim_device_model
    dim_device_model -->|model_id| dim_device
    dim_firmware -->|fw_id| dim_device
    dim_region -->|region_id| dim_device
  end
  subgraph USER["用户维度"]
    direction TB
    dim_user_package["dim_user_package"]
    dim_user["dim_user"]
    dim_user_package -->|pkg_id| dim_user
    dim_region -->|region_id| dim_user
  end
  subgraph CONTENT["内容维度"]
    direction TB
    dim_content_category["dim_content_category"]
    dim_content_genre["dim_content_genre"]
    dim_content_cp["dim_content_cp"]
    dim_content_series["dim_content_series"]
    dim_content_episode["dim_content_episode"]
    dim_channel_category["dim_channel_category"]
    dim_live_channel["dim_live_channel"]
    dim_content_category -->|category_id| dim_content_series
    dim_content_genre -->|genre_id| dim_content_series
    dim_content_cp -->|cp_id| dim_content_series
    dim_content_series -->|series_id| dim_content_episode
    dim_channel_category -->|channel_cat_id| dim_live_channel
  end
  subgraph TIME["时间维度"]
    direction TB
    dim_month["dim_month"]
    dim_week["dim_week"]
    dim_date["dim_date"]
    dim_month -->|month_id| dim_date
    dim_week -->|week_id| dim_date
  end
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DWD",
      mermaid: `
flowchart TB
  subgraph ODS["ODS 原始层"]
    direction LR
    ods_log_launcher_di["ods_log_launcher_di"]
    ods_log_vod_di["ods_log_vod_di"]
    ods_log_live_di["ods_log_live_di"]
    ods_log_cashier_di["ods_log_cashier_di"]
    ods_order_di["ods_order_di"]
  end
  subgraph DIM["DIM 关联维度"]
    direction LR
    dim_device["dim_device"]
    dim_user["dim_user"]
    dim_content_episode["dim_content_episode"]
    dim_live_channel["dim_live_channel"]
    dim_date["dim_date"]
  end
  subgraph DWD["DWD 明细层"]
    direction LR
    dwd_act_launcher_di["dwd_act_launcher_di"]
    dwd_vod_play_di["dwd_vod_play_di"]
    dwd_live_play_di["dwd_live_play_di"]
    dwd_trade_cashier_di["dwd_trade_cashier_di"]
    dwd_trade_order_di["dwd_trade_order_di"]
  end
  ods_log_launcher_di -->|ETL| dwd_act_launcher_di
  ods_log_vod_di -->|ETL| dwd_vod_play_di
  ods_log_live_di -->|ETL| dwd_live_play_di
  ods_log_cashier_di -->|ETL| dwd_trade_cashier_di
  ods_order_di -->|ETL| dwd_trade_order_di
  dim_device -->|mac| dwd_act_launcher_di
  dim_device -->|mac| dwd_vod_play_di
  dim_device -->|mac| dwd_live_play_di
  dim_content_episode -->|episode_id| dwd_vod_play_di
  dim_live_channel -->|channel_id| dwd_live_play_di
  dim_user -->|userid| dwd_trade_order_di
  dim_date -->|play_date| dwd_vod_play_di
`,
    },
    {
      id: "dws_ads",
      name: "③ DWS→ADS",
      mermaid: `
flowchart TB
  subgraph DWD["DWD 明细层"]
    direction LR
    dwd_act_launcher_di["dwd_act_launcher_di"]
    dwd_vod_play_di["dwd_vod_play_di"]
    dwd_live_play_di["dwd_live_play_di"]
    dwd_trade_cashier_di["dwd_trade_cashier_di"]
    dwd_trade_order_di["dwd_trade_order_di"]
  end
  subgraph DWS["DWS 日汇总"]
    direction LR
    dws_act_user_active_1d["dws_act_user_active_1d"]
    dws_content_episode_play_1d["dws_content_episode_play_1d"]
    dws_content_series_play_1d["dws_content_series_play_1d"]
    dws_content_live_play_1d["dws_content_live_play_1d"]
    dws_trade_cashier_funnel_1d["dws_trade_cashier_funnel_1d"]
    dws_trade_order_1d["dws_trade_order_1d"]
    dws_user_retention_1d["dws_user_retention_1d"]
  end
  subgraph ADS["ADS 应用层"]
    direction LR
    v_dau_overview["v_dau_overview"]
    v_retention_decomposition["v_retention_decomposition"]
    v_ltv["v_ltv"]
  end
  dwd_act_launcher_di -->|aggregate| dws_act_user_active_1d
  dwd_vod_play_di -->|aggregate| dws_content_episode_play_1d
  dwd_vod_play_di -->|aggregate| dws_content_series_play_1d
  dwd_live_play_di -->|aggregate| dws_content_live_play_1d
  dwd_trade_cashier_di -->|aggregate| dws_trade_cashier_funnel_1d
  dwd_trade_order_di -->|aggregate| dws_trade_order_1d
  dws_act_user_active_1d -->|ADS| v_dau_overview
  dws_user_retention_1d -->|ADS| v_retention_decomposition
  dws_trade_order_1d -->|ADS| v_ltv
`,
    },
  ],
  mermaid: `
flowchart TB
  dim_province["dim_province"] --> dim_region["dim_region"]
  dim_region --> dim_device["dim_device"]
  dim_region --> dim_user["dim_user"]
`,
};
