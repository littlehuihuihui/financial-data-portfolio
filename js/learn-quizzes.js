/**
 * 章末小测（前端门禁）。答案仅存于此，不追求防作弊，服务自学校准。
 * requireLab: 需先粘贴对应 LAB_TOKEN
 */
window.LEARN_QUIZZES = {
  "00": {
    passScore: 2,
    questions: [
      {
        q: "本教材权威 OTT DDL 文件是？",
        choices: ["01_ddl.sql（历史）", "ott_ddl.sql", "任意 seed 脚本", "只用前端 JSON"],
        answer: 1,
      },
      {
        q: "正确学习顺序是？",
        choices: ["先狂点实验台", "先理论与对照题，再实验台验证", "只背缩写", "只跑靶场不看 DDL"],
        answer: 1,
      },
      {
        q: "SOURCES.md 的作用是？",
        choices: ["美化排版", "规定证据来源、防表名幻觉", "替代 MySQL", "零售专用"],
        answer: 1,
      },
    ],
  },
  "01": {
    passScore: 3,
    questions: [
      {
        q: "禁止哪条调用？",
        choices: ["ADS←DWS", "DWS←DWD", "ADS←ODS", "DWD←DIM"],
        answer: 2,
      },
      {
        q: "dws_act_user_active_1d 主键是？",
        choices: ["(mac)", "(snapshot_date, mac)", "(log_id)", "(userid, dt)"],
        answer: 1,
      },
      {
        q: "OTT dim_device 主键是？",
        choices: ["device_sk", "mac", "userid", "model_id"],
        answer: 1,
      },
      {
        q: "v_dau_overview 的 FROM 表是？",
        choices: ["ods_log_launcher_di", "dwd_act_launcher_di", "dws_act_user_active_1d", "dim_device"],
        answer: 2,
      },
    ],
  },
  "02": {
    passScore: 2,
    questions: [
      {
        q: "dwd_act_launcher_di 粒度（COMMENT）？",
        choices: ["一日一设备", "一次开机行为", "一月一用户", "未声明"],
        answer: 1,
      },
      {
        q: "毛利率更适合放哪一层？",
        choices: ["ODS", "DWD 并 SUM", "ADS（分子分母在 DWS）", "DIM"],
        answer: 2,
      },
      {
        q: "dws_trade_cashier_funnel_1d 主键含？",
        choices: ["仅 snapshot_date", "snapshot_date+device_type+src_type", "log_id", "mac"],
        answer: 1,
      },
    ],
  },
  "03": {
    passScore: 3,
    questions: [
      {
        q: "OTT 开机日志日期列名是？",
        choices: ["dt", "event_date", "biz_dt", "p_date"],
        answer: 1,
      },
      {
        q: "total_dau 精确定义？",
        choices: ["COUNT(*)", "COUNT(DISTINCT mac)", "COUNT(DISTINCT userid)", "SUM(launcher_cnt)"],
        answer: 1,
      },
      {
        q: "seed_ott 原始日志大约覆盖？",
        choices: ["全历史", "近 3 天", "仅 1 小时", "无日志"],
        answer: 1,
      },
      {
        q: "演示灌数常见形态？",
        choices: ["只用 Airflow", "ODS 与 DWD 可并行写入（seed）", "必须手写 Flink", "ADS 写回 ODS"],
        answer: 1,
      },
    ],
  },
  "04": {
    passScore: 2,
    questions: [
      {
        q: "v_dau_overview 边的 engine（etl-lineage）？",
        choices: ["spark", "view", "flink", "kafka"],
        answer: 1,
      },
      {
        q: "排障建议顺序起点？",
        choices: ["先改 DIM 主键", "从 ADS 指标现象向上游", "先 DROP DATABASE", "先改前端颜色"],
        answer: 1,
      },
      {
        q: "同业务日对齐应看？",
        choices: ["统一虚构 dt 列", "各表真实日期列（event_date/snapshot_date/op_date）", "只用 ingested_at", "不用日期"],
        answer: 1,
      },
    ],
  },
  "05": {
    passScore: 2,
    questions: [
      {
        q: "比率类指标通常算在？",
        choices: ["ODS", "DWD 并 SUM", "ADS（原子在 DWS）", "DIM"],
        answer: 2,
      },
      {
        q: "监控文档中 DAU 落点？",
        choices: ["ods_log_launcher_di", "dws_act_user_active_1d", "dim_date", "仅前端 JSON"],
        answer: 1,
      },
      {
        q: "口径变更最少要做？",
        choices: ["只改看板标题", "影响评估+是否回刷+说明", "删掉旧表", "改 CSS"],
        answer: 1,
      },
    ],
  },
  "07": {
    passScore: 2,
    questions: [
      {
        q: "表级血缘回答不了？",
        choices: ["谁依赖谁", "字段是否含税等字段语义", "调度大概形态", "code_path 指向"],
        answer: 1,
      },
      {
        q: "对照 code_path 的正确做法？",
        choices: ["信面板文案即可", "打开文件确认对象存在", "改前端骗过自检", "删除边"],
        answer: 1,
      },
    ],
  },
  "08": {
    passScore: 2,
    questions: [
      {
        q: "不合格设计典型问题？",
        choices: ["复用 dwd_vod_play_di", "ADS 直读 ODS + 粒度混乱", "写 DQ", "标注拟新增"],
        answer: 1,
      },
      {
        q: "题 A 完播可优先用哪一字段？",
        choices: ["device_sk", "is_finish", "dt", "is_current"],
        answer: 1,
      },
    ],
  },
  "09": {
    passScore: 2,
    requireLab: "dau",
    questions: [
      {
        q: "DAU 靶场独立库名？",
        choices: ["internet_analytics", "learn_lab_dau", "mysql", "portfolio_metadata"],
        answer: 1,
      },
      {
        q: "修复后期望 ads_dau？",
        choices: ["8", "4", "3", "0"],
        answer: 2,
      },
      {
        q: "DQ5 在 broken 仍可能通过是因为？",
        choices: ["数据全对", "ADS 与错误 DWS 仍勾稽一致", "MySQL bug", "未跑 DQ"],
        answer: 1,
      },
    ],
  },
  "10": {
    passScore: 2,
    requireLab: "vod",
    questions: [
      {
        q: "完播靶场 ADS 视图名（教材拟新增）？",
        choices: ["v_dau_overview", "v_vod_finish_rate", "v_funnel", "v_ltv"],
        answer: 1,
      },
      {
        q: "修复后 S001 finish_rate_pct？",
        choices: ["57.14", "66.67", "100", "0"],
        answer: 1,
      },
      {
        q: "dws 层完播次数列名（OTT DDL）？",
        choices: ["finish_cnt", "is_finish", "complete_only", "done_vv"],
        answer: 0,
      },
    ],
  },
  E1: {
    passScore: 2,
    questions: [
      {
        q: "OTT dim_device 是 SCD2 拉链表吗？",
        choices: ["是", "否，当前态 mac 主键", "不确定所以算是", "只有零售才是"],
        answer: 1,
      },
      {
        q: "需要「当时维属性」时更合适？",
        choices: ["只 SCD1", "SCD2 或事实退化/快照", "删历史", "改 ADS 颜色"],
        answer: 1,
      },
    ],
  },
  E2: {
    passScore: 2,
    questions: [
      {
        q: "开机事实主要事件时间列？",
        choices: ["ingested_at 唯一", "event_time/event_date", "只有 snapshot_date", "无时间"],
        answer: 1,
      },
      {
        q: "v_dau_overview 是？",
        choices: ["物化表", "VIEW", "Kafka topic", "CSV"],
        answer: 1,
      },
    ],
  },
  E3: {
    passScore: 2,
    questions: [
      {
        q: "DWS 按日幂等常用？",
        choices: ["只 INSERT 追加", "DELETE 业务日 + INSERT", "DROP DATABASE", "改主键为 NULL"],
        answer: 1,
      },
      {
        q: "ODS AUTO_INCREMENT 盲目重灌风险？",
        choices: ["无风险", "行数翻倍", "自动幂等", "自动去重"],
        answer: 1,
      },
    ],
  },
  E4: {
    passScore: 2,
    questions: [
      {
        q: "仅 ADS↔DWS 勾稽够不够？",
        choices: ["够，永远正确", "不够，坏数据也可一致错", "只需 ODS 行数", "不需要 DQ"],
        answer: 1,
      },
      {
        q: "靶场 DQ 结果表？",
        choices: ["v_dau_overview", "lab_dq_result", "dim_device", "seed_ott"],
        answer: 1,
      },
    ],
  },
  E5: {
    passScore: 2,
    questions: [
      {
        q: "分区裁剪主要收益？",
        choices: ["少扫无关分区", "取消主键", "让 ADS 读 ODS", "去掉 DQ"],
        answer: 0,
      },
      {
        q: "数据倾斜常见表现？",
        choices: ["所有任务均匀", "个别 key 过大拖慢", "视图变表", "端口变化"],
        answer: 1,
      },
    ],
  },
  E6: {
    passScore: 2,
    questions: [
      {
        q: "CDC 更贴近？",
        choices: ["只全量每日重建", "捕获变更增量同步", "只改前端", "只写 Markdown"],
        answer: 1,
      },
      {
        q: "本作品集主流演示形态？",
        choices: ["完整生产 CDC", "批式/种子灌数演示", "仅 Flink", "仅手工 Excel"],
        answer: 1,
      },
    ],
  },
  E7: {
    passScore: 2,
    questions: [
      {
        q: "数据契约最少应含？",
        choices: ["只表名", "粒度/字段/SLA/责任人等", "只颜色主题", "只端口号"],
        answer: 1,
      },
      {
        q: "契约破坏时优先？",
        choices: ["静默改下游", "告警/阻断并沟通变更", "删上游", "改浏览器缓存"],
        answer: 1,
      },
    ],
  },
  FS0: {
    passScore: 2,
    questions: [
      {
        q: "作品集 UI 主入口端口？",
        choices: ["5000", "5100", "3306", "8080 必须"],
        answer: 1,
      },
      {
        q: "教材专用进程端口？",
        choices: ["5001", "5101", "5002", "80"],
        answer: 1,
      },
      {
        q: "互联网 API 默认端口？",
        choices: ["5000", "5001", "5100", "5101"],
        answer: 1,
      },
    ],
  },
  FS1: {
    passScore: 2,
    questions: [
      {
        q: "portfolio_app 不做哪件事？",
        choices: ["静态托管", "元数据 API", "行业 API 代理", "替代 MySQL 存储全部事实"],
        answer: 3,
      },
      {
        q: "learn_app 相对 portfolio_app？",
        choices: ["多了代理", "主要静态+重定向课表", "只连 5002", "无静态"],
        answer: 1,
      },
    ],
  },
  FS2: {
    passScore: 2,
    questions: [
      {
        q: "同名 dashboard 分流关键靠？",
        choices: ["只靠心情", "Referer 行业路径等", "随机端口", "删掉零售"],
        answer: 1,
      },
      {
        q: "代理失败常见表现？",
        choices: ["永远 200", "502 / 前端回退", "自动建表", "改 DDL"],
        answer: 1,
      },
    ],
  },
  FS3: {
    passScore: 2,
    questions: [
      {
        q: "纯静态托管时前端常？",
        choices: ["必须连 MySQL", "demo JSON 回退", "只能白屏", "改 ott_ddl"],
        answer: 1,
      },
      {
        q: "从 KPI 反查链路终点常是？",
        choices: ["随便一张 ODS", "ADS/API 字段再对 DWS", "只 CSS", "只端口"],
        answer: 1,
      },
    ],
  },

  "11": {
    passScore: 2,
    requireLab: "funnel",
    questions: [
      { q: "漏斗靶场库名？", choices: ["internet_analytics", "learn_lab_funnel", "learn_lab_dau", "portfolio_metadata"], answer: 1 },
      { q: "现网 v_funnel 聚合粒度？", choices: ["按秒", "按月（DATE_FORMAT）", "无聚合", "仅 ODS"], answer: 1 },
      { q: "非法步骤示例？", choices: ["expose", "hack", "confirm", "click"], answer: 1 }
    ]
  },
  FS4: {
    passScore: 2,
    questions: [
      { q: "GitHub Pages 下行业 API？", choices: ["一定可用", "通常不可用，走 demo 回退", "自动起 Flask", "必须 5101"], answer: 1 },
      { q: "靶场 MySQL 在哪跑？", choices: ["只靠 Pages", "本机", "只需 CDN", "不需要"], answer: 1 }
    ]
  },
  FS5: {
    passScore: 2,
    questions: [
      { q: "平台健康检查路径？", choices: ["/api/health", "/healthz", "/status.html", "/mysql"], answer: 0 },
      { q: "代理失败常见状态？", choices: ["永远 200", "502 等", "自动修 DDL", "改端口无感"], answer: 1 }
    ]
  },
  FS6: {
    passScore: 2,
    requireLab: "front",
    questions: [
      { q: "前端靶场应改？", choices: ["生产 loaders.js 直接提交", "独立 kpi-map-lab 页", "ott_ddl.sql", "seed_ott.py"], answer: 1 },
      { q: "通过后 TOKEN 前缀？", choices: ["LAB_TOKEN 或 FRONT_TOKEN", "MYSQL_TOKEN", "GIT_TOKEN", "无"], answer: 0 }
    ]
  },

};
