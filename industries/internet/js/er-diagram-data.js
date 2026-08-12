window.ER_DIAGRAM = {
  tableCn: {
    dim_province: "省份",
    dim_region: "地市",
    dim_device: "设备",
    dim_user: "用户",
    dim_date: "日期",
    dim_content_series: "剧集",
    dim_content_episode: "单集",
    dim_live_channel: "直播频道",
    ods_log_launcher_di: "开机日志",
    ods_log_vod_di: "点播日志",
    ods_log_live_di: "直播日志",
    ods_log_cashier_di: "收银台日志",
    ods_order_di: "订购单",
    dwd_act_launcher_di: "开机明细",
    dwd_vod_play_di: "点播明细",
    dwd_live_play_di: "直播明细",
    dwd_trade_cashier_di: "收银明细",
    dwd_trade_order_di: "订购明细",
    dws_act_user_active_1d: "日活汇总",
    dws_content_episode_play_1d: "单集播放日汇总",
    dws_content_series_play_1d: "剧集播放日汇总",
    dws_content_live_play_1d: "直播播放日汇总",
    dws_trade_cashier_funnel_1d: "收银漏斗日汇总",
    dws_trade_order_1d: "订购日汇总",
    dws_user_retention_1d: "留存日汇总",
    v_dau_overview: "DAU总览",
    v_retention_decomposition: "留存分解",
    v_ltv: "LTV"
  },
  title: "OTT 大屏视频 · 实体关系图",
  description:
    "OTT 雪花模型（<code>database/ott_ddl.sql</code>）：按数仓分层<strong>自左而右</strong>排布，拆成「维度雪花 / ODS→DWD / DWS→ADS」三张图。",
  legend: [
    "<strong>布局</strong>：左→右分层列（维度/ODS → DWD → DWS → ADS）",
    "<strong>雪花维度</strong>：上级 dim → 下级 dim",
    "<strong>日汇总</strong>：dwd → dws_*_1d → v_*",
  ],
  views: [
    {
      id: "dim",
      name: "① 维度雪花",
      mermaid: `
flowchart LR
  subgraph GEO["地域维度"]
    direction TB
    dim_province["dim_province<br/>省份"]
    dim_region["dim_region<br/>地市"]
    dim_province -->|province_id| dim_region
  end
  subgraph DEVICE["设备维度"]
    direction TB
    dim_device_type["dim_device_type"]
    dim_device_model["dim_device_model"]
    dim_firmware["dim_firmware"]
    dim_device["dim_device<br/>设备"]
    dim_device_type -->|device_type_id| dim_device_model
    dim_device_model -->|model_id| dim_device
    dim_firmware -->|fw_id| dim_device
    dim_region -->|region_id| dim_device
  end
  subgraph USER["用户维度"]
    direction TB
    dim_user_package["dim_user_package"]
    dim_user["dim_user<br/>用户"]
    dim_user_package -->|pkg_id| dim_user
    dim_region -->|region_id| dim_user
  end
  subgraph CONTENT["内容维度"]
    direction TB
    dim_content_category["dim_content_category"]
    dim_content_genre["dim_content_genre"]
    dim_content_cp["dim_content_cp"]
    dim_content_series["dim_content_series<br/>剧集"]
    dim_content_episode["dim_content_episode<br/>单集"]
    dim_channel_category["dim_channel_category"]
    dim_live_channel["dim_live_channel<br/>直播频道"]
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
    dim_date["dim_date<br/>日期"]
    dim_month -->|month_id| dim_date
    dim_week -->|week_id| dim_date
  end
`,
    },
    {
      id: "ods_dwd",
      name: "② ODS→DWD",
      mermaid: `
flowchart LR
  subgraph ODS["ODS 原始层"]
    direction TB
    ods_log_launcher_di["ods_log_launcher_di<br/>开机日志"]
    ods_log_vod_di["ods_log_vod_di<br/>点播日志"]
    ods_log_live_di["ods_log_live_di<br/>直播日志"]
    ods_log_cashier_di["ods_log_cashier_di<br/>收银台日志"]
    ods_order_di["ods_order_di<br/>订购单"]
  end
  subgraph DIM["DIM 关联维度"]
    direction TB
    dim_device["dim_device<br/>设备"]
    dim_user["dim_user<br/>用户"]
    dim_content_episode["dim_content_episode<br/>单集"]
    dim_live_channel["dim_live_channel<br/>直播频道"]
    dim_date["dim_date<br/>日期"]
  end
  subgraph DWD["DWD 明细层"]
    direction TB
    dwd_act_launcher_di["dwd_act_launcher_di<br/>开机明细"]
    dwd_vod_play_di["dwd_vod_play_di<br/>点播明细"]
    dwd_live_play_di["dwd_live_play_di<br/>直播明细"]
    dwd_trade_cashier_di["dwd_trade_cashier_di<br/>收银明细"]
    dwd_trade_order_di["dwd_trade_order_di<br/>订购明细"]
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
flowchart LR
  subgraph DWD["DWD 明细层"]
    direction TB
    dwd_act_launcher_di["dwd_act_launcher_di<br/>开机明细"]
    dwd_vod_play_di["dwd_vod_play_di<br/>点播明细"]
    dwd_live_play_di["dwd_live_play_di<br/>直播明细"]
    dwd_trade_cashier_di["dwd_trade_cashier_di<br/>收银明细"]
    dwd_trade_order_di["dwd_trade_order_di<br/>订购明细"]
  end
  subgraph DWS["DWS 日汇总"]
    direction TB
    dws_act_user_active_1d["dws_act_user_active_1d<br/>日活汇总"]
    dws_content_episode_play_1d["dws_content_episode_play_1d<br/>单集播放日汇总"]
    dws_content_series_play_1d["dws_content_series_play_1d<br/>剧集播放日汇总"]
    dws_content_live_play_1d["dws_content_live_play_1d<br/>直播播放日汇总"]
    dws_trade_cashier_funnel_1d["dws_trade_cashier_funnel_1d<br/>收银漏斗日汇总"]
    dws_trade_order_1d["dws_trade_order_1d<br/>订购日汇总"]
    dws_user_retention_1d["dws_user_retention_1d<br/>留存日汇总"]
  end
  subgraph ADS["ADS 应用层"]
    direction TB
    v_dau_overview["v_dau_overview<br/>DAU总览"]
    v_retention_decomposition["v_retention_decomposition<br/>留存分解"]
    v_ltv["v_ltv<br/>LTV"]
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
flowchart LR
  dim_province["dim_province<br/>省份"] --> dim_region["dim_region<br/>地市"]
  dim_region --> dim_device["dim_device<br/>设备"]
  dim_region --> dim_user["dim_user<br/>用户"]
`,
};
