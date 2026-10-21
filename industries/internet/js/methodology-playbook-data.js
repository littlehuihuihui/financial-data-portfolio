/* 广东移动 OTT · 用户增长数据分析方法论 · 六层框架 */
const LAYERS = [
  { id: "l1", name: "描述性分析", short: "第一层", question: "现在是什么状况？", color: "#3b82f6",
    categories: ["活跃概况类", "用户结构类", "渠道获客类", "产品使用类", "内容分析类"] },
  { id: "l2", name: "诊断性分析", short: "第二层", question: "为什么会这样？", color: "#8b5cf6",
    categories: ["活跃异常类", "留存异常类", "渠道效率类", "流失转化类", "内容质量类"] },
  { id: "l3", name: "预测性分析", short: "第三层", question: "接下来会怎样？", color: "#06b6d4",
    categories: ["DAU预测类", "LTV预测类", "渠道预测类", "收入预测类", "流失预测类"] },
  { id: "l4", name: "评估性分析", short: "第四层", question: "做得怎么样？", color: "#f59e0b",
    categories: ["获客效率类", "活动效果类", "产品效果类", "实验评估类", "体验评估类"] },
  { id: "l5", name: "优化决策", short: "第五层", question: "应该怎么做？", color: "#22c55e",
    categories: ["投放优化类", "用户挽回类", "产品优先级类", "渠道组合类", "定价优化类"] },
];

const PLAYBOOKS = [
  /* ===== L1 描述性 (6) · 对齐完善版口径/阈值/SQL ===== */
  /* 口径速查：K01活跃=当日开机或播放MAC；K02 MAU=月内≥1天K01去重MAC（跨端合计须全局去重）；
     K03付费=当月订购userid（不可与MAC直接相除）；K04只开机=有开机无点播无直播；
     K05点播渗透=月内点播去重MAC/月活去重MAC；K06完播率=完播次数/播放次数(加权)；K07地市=region映射，空=未知 */
  {
    id: "q01", layer: "l1", category: "活跃概况类", title: "DAU/MAU 趋势总览",
    desc: "掌握 OTT 整体活跃水位、端型结构与月度波动；SQL 参数化，排除补数/埋点后再判异", bizQuestion: "这个月日活和月活怎么样？端型结构有没有异常变化？",
    keywords: ["DAU", "MAU", "日活", "月活", "STB", "Speaker", "只开机"],
    triggers: ["每周增长例会前需准备活跃简报", "管理层询问「最近用户还活跃吗」", "暑期档/版本发布后需复盘活跃变化", "大版本灰度后需核对埋点是否正常"],
    criteria: [
      { dim: "DAU 7日环比降幅", ok: "≤10%", warn: "单日>10%", bad: "连续7日>10% → L2 DAU下滑诊断" },
      { dim: "只开机占比", ok: "≤35%", warn: "逐周上升", bad: ">35% 持续上升 → q04" },
      { dim: "DAU/MAU 比值", ok: "稳定", warn: "MAU增DAU不增", bad: "比值明显下降 → q05" },
    ],
    steps: [
      { title: "数据质量前置（行数检查）", desc: "分析前先确认 v_dau_overview 日期覆盖完整；某日 row_cnt 异常低或为 0 时先联系数据团队补数，再做分析。",
        sql: "SELECT snapshot_date, COUNT(*) AS row_cnt\nFROM internet_analytics.v_dau_overview\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY snapshot_date\nORDER BY snapshot_date;",
        judge: "存在缺口日或全日为 0 → 停止出结论，先补数", output: "数据质量检查清单" },
      { title: "DAU 趋势与结构", desc: "口径 K01。参数 :start_date/:end_date（示例近3个月）。补充 only_launcher 占比；常见误判先排除①数据延迟/补数②口径变更③灰度埋点异常。",
        sql: "SELECT snapshot_date, total_dau, dau_stb, dau_speaker,\n  vod_active, live_active, only_launcher,\n  ROUND(only_launcher / NULLIF(total_dau, 0) * 100, 2) AS only_launcher_pct\nFROM internet_analytics.v_dau_overview\nWHERE snapshot_date BETWEEN :start_date AND :end_date\nORDER BY snapshot_date;",
        judge: "7日移动环比=(当日DAU-7日前DAU)/7日前DAU；连续7日环比降幅>10%标注「DAU异常下滑」。only_launcher_pct 逐周上升且>35%同步标注「只开机占比异常」。",
        output: "DAU 折线图（STB/Speaker + only_launcher 副轴）+ 异常日期清单" },
      { title: "MAU 端型对比（全局去重）", desc: "口径 K02。合计须全局 COUNT(DISTINCT mac)；分行之和≠合计时差额为跨端用户，须脚注说明。可用方式 B 单独算跨端 MAC 数。",
        sql: "SELECT device_type, COUNT(DISTINCT mac) AS mau\nFROM internet_analytics.dws_act_user_active_1d\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY device_type\nUNION ALL\nSELECT '合计（全局去重）', COUNT(DISTINCT mac)\nFROM internet_analytics.dws_act_user_active_1d\nWHERE snapshot_date BETWEEN :month_start AND :month_end;\n\n-- 方式B：跨端用户数\nSELECT COUNT(*) AS cross_device_mac_cnt FROM (\n  SELECT mac FROM internet_analytics.dws_act_user_active_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY mac HAVING COUNT(DISTINCT device_type) > 1\n) t;",
        judge: "若 分行之和-全局合计 >合计的5%，跨端占比高，端型归属可能重叠",
        output: "MAU 端型对比表（含跨端脚注）" },
    ],
    outputs: ["DAU/MAU 周报一页纸（含口径脚注 K01/K02）", "活跃异常标注清单", "数据质量说明"],
    nextSteps: ["DAU 7日环比降>10%且已排除数据问题 → 「DAU 下滑诊断」", "only_launcher_pct>35%且持续上升 → 「产品功能使用」", "MAU 增长但 DAU 不增（DAU/MAU 下降） → 「活跃结构分析」"],
    dashboards: ["活跃总览", "overview", "v_dau_overview"],
  },
  {
    id: "q02", layer: "l1", category: "用户结构类", title: "用户画像（端/地市）",
    desc: "把核心用户拆成端型×地市×付费切片；活跃=MAC(K01)、付费=userid(K03)，禁止混用相除解释人均付费", bizQuestion: "核心用户是谁？广深与 STB/Speaker 各占多少？谁活跃但不付费？",
    keywords: ["画像", "端型", "地市", "STB", "Speaker", "区域", "用户结构", "付费率", "口径"],
    triggers: ["制定区域运营策略前", "端型改版需确认目标用户", "付费率偏低需定位人群", "面试被问「怎么拆用户画像」"],
    criteria: [
      { dim: "广深活跃占比", ok: "≥40%", warn: "接近40%或「未知」地市升", bad: "<40% → 单列说明并查渠道" },
      { dim: "高活低付费切片", ok: "无明显大盘", warn: "付费率<8%且MAC≥1000", bad: "进入付费转化诊断" },
    ],
    steps: [
      { title: "先写问题卡（停用条件）", desc: "决策=本次画像服务于投放加码/端型改版/区域运营/付费转化哪一项；人群口径：活跃=K01、付费=K03、地市=K07；成功标准须可量化（如识别3个高活低付费切片且各≥1000用户）。写不清决策或未区分 MAC/userid → 停止出报告。",
        judge: "问题卡缺「决策」或口径未区分 MAC/userid → 停",
        output: "问题卡：决策 / 人群口径 / 成功标准" },
      { title: "端型×地市分布（分列标注口径）", desc: "v_user_portrait 中 user_count 为活跃 MAC，paid_* 为 userid 口径；输出必须分列并脚注，禁止把付费率当作「活跃MAC付费率」直接解读。",
        sql: "SELECT device_type, city_tier,\n  user_count AS active_mac_cnt,          -- K01\n  paid_count AS paid_userid_cnt,         -- K03\n  paid_rate_pct,\n  CONCAT('活跃口径=MAC；付费口径=userid') AS caliber_note\nFROM internet_analytics.v_user_portrait\nORDER BY active_mac_cnt DESC;",
        output: "端型×地市柱状图 + 付费率热力（含口径脚注）" },
      { title: "地市活跃占比与核心城验证", desc: "口径 K01+K07。空值记「未知」单独列示不并入其他；广深合计<40%时检查是否被「未知」稀释。",
        sql: "SELECT IFNULL(r.region_name, '未知') AS region_name,\n  COUNT(DISTINCT a.mac) AS uv,\n  ROUND(COUNT(DISTINCT a.mac) / SUM(COUNT(DISTINCT a.mac)) OVER() * 100, 2) AS share_pct\nFROM internet_analytics.dws_act_user_active_1d a\nLEFT JOIN internet_analytics.dim_region r ON a.region_id = r.region_id\nWHERE a.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY IFNULL(r.region_name, '未知')\nORDER BY uv DESC;",
        judge: "广深合计占比 <40% → 报告单列「核心地市占比变化」",
        output: "地市占比饼图 / 排名表" },
      { title: "高活跃低付费切片", desc: "user_count 为活跃 MAC；付费率阈值 <8% 且 MAC≥1000。估算待攻坚规模时注意 paid_rate 分母是 userid，est 为近似。",
        sql: "SELECT device_type, city_tier,\n  user_count AS active_mac_cnt,\n  paid_count AS paid_userid_cnt,\n  paid_rate_pct,\n  ROUND(user_count * (1 - paid_rate_pct/100)) AS est_unpaid_active_mac\nFROM internet_analytics.v_user_portrait\nWHERE user_count >= 1000 AND paid_rate_pct < 8\nORDER BY user_count DESC\nLIMIT 20;",
        judge: "付费率 <8% 且活跃 MAC≥1000 → 列入待攻坚",
        output: "待攻坚人群清单 Top20（含估算规模）" },
      { title: "沉淀结论与动作", desc: "三段式：事实（占比/付费率）→ 含义（基本盘/机会盘）→ 动作（区域投放/端型运营/转 L2）。报告须含口径脚注与触发阈值。",
        output: "一页纸画像结论 + 下一跳" },
    ],
    outputs: ["用户画像报告（含 K01/K03/K07 口径）", "区域/端型运营建议", "待攻坚人群清单"],
    nextSteps: ["某地市活跃占比环比降>20% → 「渠道获客分布」", "Speaker 付费率 < STB 付费率的 50% → 「付费转化下降诊断」", "该地市/端型只开机>35% → 「产品功能使用」"],
    dashboards: ["活跃总览", "overview", "v_user_portrait", "用户标签画像", "tags"],
  },
  {
    id: "q03", layer: "l1", category: "渠道获客类", title: "渠道获客分布（入口 launcher/video）",
    desc: "收银台入口订购量/金额结构 + 入口质量（客单价、端型×地市、新老拆分）；仅看结构占比无法支撑「入口质量差」下一跳", bizQuestion: "用户主要从哪个入口来？入口质量如何？",
    keywords: ["渠道", "获客", "launcher", "video", "入口", "归因", "客单价", "新老"],
    triggers: ["月度投放复盘", "新增订购结构突变", "入口改版效果初评"],
    criteria: [
      { dim: "入口客单价环比", ok: "稳定", warn: "降幅接近15%", bad: "环比降>15% → L2 CAC诊断" },
      { dim: "新订单占比", ok: "≥20%", warn: "偏低", bad: "<20% → L2 渠道质量诊断" },
    ],
    steps: [
      { title: "入口订购量与金额占比", desc: "同时看 order_share 与 amount_share；订单占比高但金额占比低 → 低客单价入口。",
        sql: "SELECT touch_point,\n  SUM(attributed_orders) AS orders,\n  SUM(attributed_amount) AS amount,\n  ROUND(SUM(attributed_orders) / SUM(SUM(attributed_orders)) OVER() * 100, 2) AS order_share_pct,\n  ROUND(SUM(attributed_amount) / SUM(SUM(attributed_amount)) OVER() * 100, 2) AS amount_share_pct\nFROM internet_analytics.v_channel_attribution\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY touch_point\nORDER BY orders DESC;",
        output: "入口来源堆叠图（量+金额）" },
      { title: "入口×端型/地市交叉（质量）", desc: "比较各切片 avg_order_value；某入口在特定端型/地市客单价显著偏低 → 标注质量待查。若视图无 region_id 则退化为入口×端型。",
        sql: "SELECT touch_point, device_type,\n  IFNULL(r.region_name, '未知') AS region_name,\n  SUM(attributed_orders) AS orders,\n  ROUND(SUM(attributed_amount) / NULLIF(SUM(attributed_orders), 0), 2) AS avg_order_value\nFROM internet_analytics.v_channel_attribution c\nLEFT JOIN internet_analytics.dim_region r ON c.region_id = r.region_id\nWHERE c.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY touch_point, device_type, IFNULL(r.region_name, '未知')\nORDER BY orders DESC;",
        judge: "切片客单价显著偏低 → 质量待查",
        output: "入口×端型×地市质量矩阵" },
      { title: "新老用户拆分（获客 vs 复购）", desc: "若 v_channel_attribution 含 is_first_order（或等价首购标识）则执行；字段缺失时在报告注明「暂无法拆新老」，勿伪造。",
        sql: "SELECT touch_point,\n  SUM(CASE WHEN is_first_order = 1 THEN attributed_orders ELSE 0 END) AS new_orders,\n  SUM(CASE WHEN is_first_order = 0 THEN attributed_orders ELSE 0 END) AS repeat_orders,\n  ROUND(SUM(CASE WHEN is_first_order = 1 THEN attributed_orders ELSE 0 END)\n    / NULLIF(SUM(attributed_orders), 0) * 100, 2) AS new_order_pct\nFROM internet_analytics.v_channel_attribution\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY touch_point;",
        judge: "新订单占比 <20% → 获客能力弱，转渠道质量诊断",
        output: "新老订单拆分表" },
    ],
    outputs: ["渠道获客结构图", "入口质量矩阵", "新老订单拆分表"],
    nextSteps: ["某入口 avg_order_value 环比降>15% → 「CAC/获客效率上升诊断」", "某入口新订单占比<20% → 「渠道质量下降诊断」", "某地市单入口订单集中度>60% → 回「用户画像」查该地市结构"],
    dashboards: ["订购与分成", "order", "v_channel_attribution"],
  },
  {
    id: "q04", layer: "l1", category: "产品使用类", title: "产品功能使用（点播/直播/开机）",
    desc: "功能渗透须按「月去重 MAC」计算（K05），禁止用日明细行数 COUNT(*) 当分母；行业参考：点播月活渗透约74%–81%，直播约38%–41%", bizQuestion: "用户在产品里做什么？功能使用深度如何？",
    keywords: ["点播", "直播", "开机", "VV", "时长", "功能渗透", "只开机"],
    triggers: ["版本迭代评审", "某功能渗透率异常", "只开机用户占比上升"],
    criteria: [
      { dim: "只开机月占比", ok: "≤35%", warn: "接近35%", bad: ">35% → 流失诊断" },
      { dim: "点播月活渗透", ok: "约74%–81%", warn: "<70%", bad: "显著低于行业下限 → q06" },
    ],
    steps: [
      { title: "功能渗透率（用户月粒度，非行维度）", desc: "先按 MAC 聚到月：MAX(行为标记) 得是否用过该功能，再 / 月活 MAC。原错误 SUM(flag)/COUNT(*) 在日表上算的是「活跃天占比」而非用户渗透。只开机：MAX 偏宽松；严格月只开机用 MIN(is_only_launcher)=1。",
        sql: "WITH user_month AS (\n  SELECT mac,\n    MAX(device_type) AS device_type,\n    MAX(is_vod_active) AS is_vod_user,\n    MAX(is_live_active) AS is_live_user,\n    MAX(is_only_launcher) AS is_only_launcher_user,\n    AVG(vod_play_cnt) AS avg_daily_vod_cnt,\n    SUM(vod_play_dur) AS monthly_vod_dur_sec\n  FROM internet_analytics.dws_act_user_active_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY mac\n)\nSELECT COUNT(*) AS monthly_active_mac,\n  ROUND(SUM(is_vod_user) / COUNT(*) * 100, 2) AS vod_penetration_pct,\n  ROUND(SUM(is_live_user) / COUNT(*) * 100, 2) AS live_penetration_pct,\n  ROUND(SUM(is_only_launcher_user) / COUNT(*) * 100, 2) AS only_launcher_pct,\n  ROUND(AVG(avg_daily_vod_cnt), 2) AS avg_daily_vod_play_cnt,\n  ROUND(AVG(monthly_vod_dur_sec) / 60, 1) AS avg_monthly_vod_minutes\nFROM user_month;",
        judge: "only_launcher_pct>35% 标注流失风险；点播渗透显著低于行业下限（约70%）需关注。渗透高≠用得多，须同时看人均次数/时长。",
        output: "功能渗透 KPI 卡片（脚注：渗透=月内有过该行为的去重MAC/月活去重MAC）" },
      { title: "端型功能差异（同口径）", desc: "STB vs Speaker 对比；同 MAC 跨端时 device_type 取法需业务约定（此处 MAX 为演示口径）。",
        sql: "WITH user_month AS (\n  SELECT mac, MAX(device_type) AS device_type,\n    MAX(is_vod_active) AS is_vod_user,\n    MAX(is_live_active) AS is_live_user,\n    SUM(vod_play_dur) AS monthly_vod_dur_sec\n  FROM internet_analytics.dws_act_user_active_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY mac\n)\nSELECT device_type, COUNT(*) AS active_mac,\n  ROUND(SUM(is_vod_user) / COUNT(*) * 100, 2) AS vod_penetration_pct,\n  ROUND(SUM(is_live_user) / COUNT(*) * 100, 2) AS live_penetration_pct,\n  ROUND(AVG(monthly_vod_dur_sec) / 60, 1) AS avg_monthly_vod_minutes\nFROM user_month\nGROUP BY device_type;",
        judge: "Speaker 点播渗透显著低于 STB → 端型功能适配问题（转 L2）",
        output: "端型功能对比表" },
    ],
    outputs: ["功能渗透报告（K05 口径）", "端型差异说明"],
    nextSteps: ["vod_penetration_pct 显著低于行业下限（<70%） → 「内容题材分布」", "only_launcher_pct>35% → 「用户流失诊断」", "Speaker 点播渗透显著低于 STB → 端型功能适配诊断（L2）"],
    dashboards: ["开机活跃", "launcher", "点播活跃", "vod", "直播活跃", "live"],
  },
  {
    id: "q05", layer: "l1", category: "活跃概况类", title: "活跃结构分析",
    desc: "高/中/低活跃、沉默与流失结构；确认 segment 口径是 MAC 还是 userid；approx_net_growth 未文档化时仅作趋势参考", bizQuestion: "活跃用户结构健康吗？沉默与流失占比是否上升？",
    keywords: ["活跃结构", "沉默", "流失", "分群", "用户状态", "净增"],
    triggers: ["月活增长但有效活跃停滞", "沉默用户占比上升", "生命周期净增转负"],
    criteria: [
      { dim: "沉默占比环比", ok: "稳定", warn: "升幅接近5pp", bad: "环比升>5pp → 流失诊断" },
      { dim: "approx_net_growth", ok: "非连续为负", warn: "偶发为负", bad: "连续7日<0（须先确认近似口径）" },
    ],
    steps: [
      { title: "用户状态分布", desc: "最新快照活跃/沉默/流失结构。若 user_count 与 q02 活跃 MAC 不一致，报告须说明「用户状态表采用 XX 口径」。",
        sql: "SELECT segment_name, user_count,\n  ROUND(user_count / SUM(user_count) OVER() * 100, 2) AS share_pct,\n  avg_days_since_active\nFROM internet_analytics.v_user_segment\nWHERE snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_user_segment)\nORDER BY user_count DESC;",
        output: "活跃结构饼图" },
      { title: "生命周期净增趋势", desc: "开户/激活/沉默/流失日趋势。approx_net_growth 需确认是否含回流/重复激活；口径未文档化则不作结论性判断。",
        sql: "SELECT snapshot_date, new_register, new_activate, silent_cnt, churn_cnt,\n  active_users, approx_net_growth\nFROM internet_analytics.v_lifecycle\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nORDER BY snapshot_date;",
        judge: "approx_net_growth 连续7日<0 → 标注；先确认近似来源。new_activate 连续7日下降 → 留存诊断。",
        output: "生命周期趋势折线（含7日移动平均）" },
    ],
    outputs: ["活跃结构报告", "净增趋势图（含口径说明）"],
    nextSteps: ["沉默用户占比环比升>5pp → 「用户流失诊断」", "new_activate 连续7日下降 → 「留存下降诊断」", "活跃中只开机占比同步上升 → 「产品功能使用」"],
    dashboards: ["用户生命周期", "lifecycle", "v_user_segment", "v_lifecycle"],
  },
  {
    id: "q06", layer: "l1", category: "内容分析类", title: "内容题材分布",
    desc: "题材 VV/UV 与加权完播率（K06=完播次数/播放次数）；大 VV 剧集主导结果，看典型水平须改用中位数或分题材 TopN 再平均", bizQuestion: "用户在看什么内容？哪些题材/品类表现好？",
    keywords: ["题材", "剧集", "VV", "完播率", "genre", "品类", "加权完播"],
    triggers: ["内容运营排期前", "某题材完播率异常", "暑期档内容策略调整"],
    criteria: [
      { dim: "题材完播 vs 品类均值", ok: "接近均值", warn: "偏低", bad: "VV高且完播<品类均值50% → L2完播诊断" },
    ],
    steps: [
      { title: "题材 VV/UV 排行（加权完播）", desc: "报告必须注明完播口径为加权完播率；若看「典型剧集完播」应另算中位数或 TopN 均值。",
        sql: "SELECT g.genre_name,\n  SUM(s.vv) AS total_vv, SUM(s.uv) AS total_uv,\n  SUM(s.finish_cnt) AS total_finish,\n  ROUND(SUM(s.finish_cnt) / NULLIF(SUM(s.vv), 0) * 100, 2) AS weighted_finish_rate_pct\nFROM internet_analytics.dws_content_series_play_1d s\nJOIN internet_analytics.dim_genre g ON s.genre_id = g.genre_id\nWHERE s.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY g.genre_name\nORDER BY total_vv DESC;",
        judge: "标注 K06 加权完播；未映射 genre_id 计入「未分类」不丢弃",
        output: "题材播放排行表" },
      { title: "品类渗透（排期决策）", desc: "行业参考：大屏观看率 TOP3 多为电视剧/综艺/电影；少儿、纪录片常表现高粘性。品类 VV 占比显著偏离时在排期建议中标注。",
        sql: "SELECT c.category_name, SUM(s.vv) AS vv, SUM(s.uv) AS uv,\n  ROUND(SUM(s.vv) / SUM(SUM(s.vv)) OVER() * 100, 2) AS vv_share_pct\nFROM internet_analytics.dws_content_series_play_1d s\nJOIN internet_analytics.dim_category c ON s.category_id = c.category_id\nWHERE s.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY c.category_name\nORDER BY vv DESC;",
        output: "品类渗透饼图" },
    ],
    outputs: ["内容题材分布报告（含完播口径说明）", "排期建议清单"],
    nextSteps: ["某题材 VV 高但完播率 <同品类均值50% → 「完播率异常诊断」", "电视剧/综艺 VV 占比下降且 only_launcher 上升 → 回「产品功能使用」确认功能是否同步降"],
    dashboards: ["内容·剧集", "series", "dws_content_series_play_1d"],
  },

  /* ===== L2 诊断性 (7) · 对齐完善版全文（含 q09–q13 增补步骤） ===== */
  /* L2 口径：K08区间降幅；K09诊断基线；K10 CAC=花费/新客；K11 LTV；K12 ROI=分成/花费；
     K13加权完播；K14沉默N/流失M；K15误触率。每场景先做：数据质量、口径/版本确认、基线定义。 */
  {
    id: "q07", layer: "l2", category: "活跃异常类", title: "DAU 下滑诊断",
    desc: "用区间降幅（K08）拆端型/地市/功能渗透；禁止用 LAG 日差冒充两周降幅", bizQuestion: "为什么日活下降了？是端型、地市还是功能渗透导致？",
    keywords: ["DAU", "下滑", "诊断", "端型", "地市", "区间降幅"],
    triggers: ["DAU 连续 7 日环比降幅 >10%", "大促后活跃未回补", "某端型 DAU 骤降"],
    criteria: [
      { dim: "单端型14日区间降幅", ok: "≥-15%", warn: "接近-15%", bad: "<-15% → 首要怀疑" },
      { dim: "地市区间降幅", ok: "≥-20% 或占比小", warn: "降幅大但量小", bad: "<-20% 且占全量>5%" },
      { dim: "只开机占比", ok: "≤35% 平稳", warn: "上升", bad: ">35% 持续升 → q11" },
    ],
    steps: [
      { title: "前置：数据质量/口径/基线", desc: "查目标月每日行数；确认埋点/端型/地市口径与大版本灰度；声明基线类型（K09 A/B/C）。缺数或口径变更须先写外生因素。",
        sql: "SELECT snapshot_date, COUNT(*) AS row_cnt\nFROM internet_analytics.v_dau_overview\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY snapshot_date\nORDER BY snapshot_date;",
        judge: "某日 row_cnt=0 或显著低于前后日（如<50%）→ 停诊，先补数",
        output: "数据质量 + 外生因素 + 基线声明" },
      { title: "端型 DAU 区间降幅（K08）", desc: "近14天均值 vs 前14天均值的相对变化；禁止 LAG 日差冒充两周降幅。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, 'STB' AS device_type, dau_stb AS dau\n  FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND :as_of\n  UNION ALL\n  SELECT snapshot_date, 'Speaker', dau_speaker\n  FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND :as_of\n)\nSELECT device_type,\n  ROUND(AVG(CASE WHEN snapshot_date >= DATE_SUB(:as_of, INTERVAL 13 DAY) THEN dau END), 0) AS dau_last14_avg,\n  ROUND(AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END), 0) AS dau_prev14_avg,\n  ROUND(\n    (AVG(CASE WHEN snapshot_date >= DATE_SUB(:as_of, INTERVAL 13 DAY) THEN dau END)\n   - AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END))\n   / NULLIF(AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END), 0) * 100, 2) AS interval_change_pct\nFROM daily\nGROUP BY device_type;",
        judge: "单端型 interval_change_pct < -15% → 首要怀疑对象",
        output: "端型区间降幅表（含 last14/prev14 均值）" },
      { title: "地市维度拆解", desc: "按地市算区间降幅；原标题含地市但无 SQL。",
        sql: "WITH daily_city AS (\n  SELECT a.snapshot_date, IFNULL(r.region_name, '未知') AS region_name, COUNT(DISTINCT a.mac) AS dau\n  FROM internet_analytics.dws_act_user_active_1d a\n  LEFT JOIN internet_analytics.dim_region r ON a.region_id = r.region_id\n  WHERE a.snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND :as_of\n  GROUP BY a.snapshot_date, IFNULL(r.region_name, '未知')\n)\nSELECT region_name,\n  ROUND(AVG(CASE WHEN snapshot_date >= DATE_SUB(:as_of, INTERVAL 13 DAY) THEN dau END), 0) AS last14_avg,\n  ROUND(AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END), 0) AS prev14_avg,\n  ROUND(\n    (AVG(CASE WHEN snapshot_date >= DATE_SUB(:as_of, INTERVAL 13 DAY) THEN dau END)\n   - AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END))\n   / NULLIF(AVG(CASE WHEN snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND DATE_SUB(:as_of, INTERVAL 14 DAY) THEN dau END), 0) * 100, 2) AS interval_change_pct\nFROM daily_city\nGROUP BY region_name\nORDER BY interval_change_pct ASC;",
        judge: "地市区间降幅<-20% 且绝对量占全量>5% → 地市主因嫌疑",
        output: "地市区间降幅排序表" },
      { title: "功能渗透变化", desc: "区分「DAU 降」与「只开机升」。",
        sql: "SELECT snapshot_date,\n  ROUND(vod_active / NULLIF(total_dau, 0) * 100, 2) AS vod_pct,\n  ROUND(live_active / NULLIF(total_dau, 0) * 100, 2) AS live_pct,\n  ROUND(only_launcher / NULLIF(total_dau, 0) * 100, 2) AS only_launcher_pct\nFROM internet_analytics.v_dau_overview\nWHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 27 DAY) AND :as_of\nORDER BY snapshot_date;",
        judge: "only_launcher↑且vod↓ → 功能侧，转 L1 q04 再转 q11；only_launcher 平稳但 DAU 降 → 设备侧，转设备流转看板",
        output: "功能渗透变化表" },
    ],
    outputs: ["DAU 下滑根因报告（含前置三件事、端型/地市/功能、基线声明）", "优先排查清单（按降幅绝对值排序）"],
    nextSteps: ["单端型区间降幅>15%且排除缺数 → 「设备流转」看板", "某地市区间降幅>20%且占比>5% → 「渠道获客分布」", "only_launcher_pct>35%且持续上升 → 「用户流失诊断」", "三组拆解均无显著变化 → 回前置2排查口径/灰度"],
    dashboards: ["活跃总览", "overview", "设备流转", "device"],
  },
  {
    id: "q08", layer: "l2", category: "留存异常类", title: "留存下降诊断",
    desc: "D7 相对基线 diff；拆端型×版本×渠道；先排除 cohort 结构变化", bizQuestion: "为什么留存变差了？是端型、版本还是渠道导致？",
    keywords: ["留存", "D7", "同期群", "cohort", "版本", "基线"],
    triggers: ["D7 留存连续两周下滑", "新版本上线后留存异动", "Speaker 端留存显著低于 STB"],
    criteria: [
      { dim: "D7 相对基线", ok: "diff≥-5pct", warn: "接近-5pct", bad: "diff<-5pct → 渠道留存异常" },
      { dim: "端型 D7 差", ok: "≤10pct", warn: "接近10pct", bad: ">10pct → 端型嫌疑" },
      { dim: "版本 D7 差", ok: "≤8pct", warn: "接近8pct", bad: ">8pct → 版本嫌疑" },
    ],
    steps: [
      { title: "前置：cohort 结构检查", desc: "新客占比/渠道结构变化会导致整体留存率「假恶化」。",
        sql: "SELECT cohort_date, channel_code, COUNT(DISTINCT mac) AS cohort_size\nFROM internet_analytics.v_user_retention\nWHERE cohort_date >= DATE_SUB(:as_of, INTERVAL 90 DAY)\nGROUP BY cohort_date, channel_code;",
        judge: "结构同步大变 → 先写结构变化说明，不直接下留存恶化结论",
        output: "cohort 结构表" },
      { title: "留存基线对照（K09）", desc: "当期 D7 vs 近3月基线。",
        sql: "WITH base AS (\n  SELECT channel_code, AVG(retention_rate) AS baseline_d7\n  FROM internet_analytics.v_user_retention\n  WHERE day_offset = 7\n    AND cohort_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n  GROUP BY channel_code\n),\ncur AS (\n  SELECT channel_code, AVG(retention_rate) AS cur_d7\n  FROM internet_analytics.v_user_retention\n  WHERE day_offset = 7 AND cohort_date BETWEEN :month_start AND :month_end\n  GROUP BY channel_code\n)\nSELECT c.channel_code, c.cur_d7, b.baseline_d7, ROUND(c.cur_d7 - b.baseline_d7, 2) AS diff_pct\nFROM cur c LEFT JOIN base b ON c.channel_code = b.channel_code\nORDER BY diff_pct ASC;",
        judge: "diff_pct < -5pct → 该渠道留存异常",
        output: "渠道 D7 vs 基线对照表" },
      { title: "端型×版本×渠道拆解", desc: "若无 app_version 字段不得下版本结论。",
        sql: "SELECT retention_bucket, device_type,\n  IFNULL(app_version, '未知') AS app_version,\n  IFNULL(channel_code, '未知') AS channel_code,\n  ROUND(AVG(retention_rate), 2) AS avg_rate, COUNT(*) AS sample_cnt\nFROM internet_analytics.v_retention_decomposition\nWHERE cohort_date BETWEEN :month_start AND :month_end\nGROUP BY retention_bucket, device_type, IFNULL(app_version, '未知'), IFNULL(channel_code, '未知')\nORDER BY retention_bucket, avg_rate ASC;",
        judge: "端型差>10pct→端型嫌疑；版本差>8pct→版本嫌疑；渠道差>10pct→渠道嫌疑",
        output: "疑似端型/版本/渠道清单" },
    ],
    outputs: ["留存诊断结论（含结构说明、基线声明、三组嫌疑排序）", "疑似端型/版本/渠道清单"],
    nextSteps: ["某端型留存异常且功能渗透同步降 → 「产品功能使用」", "某版本留存异常且卡顿率升 → 「完播率异常诊断」", "某渠道留存异常且 LTV/CAC<1 → 「渠道质量下降诊断」", "留存降但 cohort 结构也变 → 先写结构变化说明"],
    dashboards: ["用户留存", "retention", "v_user_retention", "v_retention_decomposition"],
  },
  {
    id: "q09", layer: "l2", category: "渠道效率类", title: "CAC/获客效率上升诊断",
    desc: "成本侧诊断（K10）；含 CAC 变化归因（成本效应 vs 新客效应）；无成本表时不得称 CAC", bizQuestion: "为什么获客越来越贵？",
    keywords: ["CAC", "获客成本", "投放花费", "新客", "成本归因"],
    triggers: ["CAC 月环比上升 >15%", "某入口订购量下滑但单成本增加", "video 入口误触率上升"],
    criteria: [
      { dim: "CAC vs 客单价", ok: "≤客单价50%", warn: "接近", bad: ">客单价50% 标红" },
      { dim: "花费/分成", ok: "≤1", warn: "接近1", bad: ">1 效率倒挂" },
      { dim: "CAC 月环比", ok: "≤15%", warn: "接近15%", bad: ">15% 进调整清单" },
    ],
    steps: [
      { title: "前置：成本字段可用性", desc: "花费=dwd_marketing_cost_1d；新客=dws_channel_new_user_1d；订购/分成=v_channel_analysis。成本缺失则改称「分成效率诊断」。",
        judge: "成本表无数据 → 停用 CAC 标题",
        output: "成本可用性确认" },
      { title: "入口 CAC 排行（K10）", desc: "CAC=投放花费/新客数。",
        sql: "WITH cost AS (\n  SELECT channel_code, SUM(cost_amount) AS total_cost\n  FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nnewu AS (\n  SELECT channel_code, SUM(new_user_cnt) AS new_users\n  FROM internet_analytics.dws_channel_new_user_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nrev AS (\n  SELECT channel_name AS channel_code, SUM(platform_share_amount) AS total_share,\n    SUM(order_users) AS total_orders, SUM(gmv_amount) AS total_gmv\n  FROM internet_analytics.v_channel_analysis\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY channel_name\n)\nSELECT c.channel_code, c.total_cost, n.new_users,\n  ROUND(c.total_cost / NULLIF(n.new_users, 0), 2) AS cac,\n  r.total_share, r.total_orders,\n  ROUND(r.total_share / NULLIF(r.total_orders, 0), 2) AS share_per_order,\n  ROUND(c.total_cost / NULLIF(r.total_share, 0), 2) AS cost_to_share_ratio,\n  ROUND(r.total_gmv / NULLIF(r.total_orders, 0), 2) AS avg_order_value\nFROM cost c\nLEFT JOIN newu n ON c.channel_code = n.channel_code\nLEFT JOIN rev r ON c.channel_code = r.channel_code\nORDER BY cac DESC;",
        judge: "cac > avg_order_value*0.5 → 标红；cost_to_share_ratio>1 → 投放倒挂",
        output: "CAC 对比表" },
      { title: "CAC 月环比", desc: "当期 vs 上月 CAC 相对变化。",
        sql: "WITH cur AS (\n  SELECT channel_code, SUM(cost_amount) AS cost, SUM(new_user_cnt) AS users FROM (\n    SELECT channel_code, cost_amount, NULL AS new_user_cnt FROM internet_analytics.dwd_marketing_cost_1d WHERE stat_date BETWEEN :month_start AND :month_end\n    UNION ALL\n    SELECT channel_code, NULL, new_user_cnt FROM internet_analytics.dws_channel_new_user_1d WHERE stat_date BETWEEN :month_start AND :month_end\n  ) t GROUP BY channel_code\n),\nprev AS (\n  SELECT channel_code, SUM(cost_amount) AS cost, SUM(new_user_cnt) AS users FROM (\n    SELECT channel_code, cost_amount, NULL AS new_user_cnt FROM internet_analytics.dwd_marketing_cost_1d WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 1 MONTH) AND DATE_SUB(:month_end, INTERVAL 1 MONTH)\n    UNION ALL\n    SELECT channel_code, NULL, new_user_cnt FROM internet_analytics.dws_channel_new_user_1d WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 1 MONTH) AND DATE_SUB(:month_end, INTERVAL 1 MONTH)\n  ) t GROUP BY channel_code\n)\nSELECT c.channel_code,\n  ROUND(c.cost / NULLIF(c.users, 0), 2) AS cac_cur,\n  ROUND(p.cost / NULLIF(p.users, 0), 2) AS cac_prev,\n  ROUND((c.cost/NULLIF(c.users,0) - p.cost/NULLIF(p.users,0)) / NULLIF(p.cost/NULLIF(p.users,0), 0) * 100, 2) AS cac_mom_pct\nFROM cur c LEFT JOIN prev p ON c.channel_code = p.channel_code\nORDER BY cac_mom_pct DESC;",
        judge: "cac_mom_pct >15% → 进入投放调整清单",
        output: "CAC 月环比表" },
      { title: "成本上升归因拆解", desc: "CAC变化拆为成本效应 vs 新客效应。",
        sql: "WITH cur AS (\n  SELECT channel_code, SUM(cost_amount) AS cost, SUM(new_user_cnt) AS users FROM (\n    SELECT channel_code, cost_amount, NULL AS new_user_cnt FROM internet_analytics.dwd_marketing_cost_1d WHERE stat_date BETWEEN :month_start AND :month_end\n    UNION ALL\n    SELECT channel_code, NULL, new_user_cnt FROM internet_analytics.dws_channel_new_user_1d WHERE stat_date BETWEEN :month_start AND :month_end\n  ) t GROUP BY channel_code\n),\nprev AS (\n  SELECT channel_code, SUM(cost_amount) AS cost, SUM(new_user_cnt) AS users FROM (\n    SELECT channel_code, cost_amount, NULL AS new_user_cnt FROM internet_analytics.dwd_marketing_cost_1d WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 1 MONTH) AND DATE_SUB(:month_end, INTERVAL 1 MONTH)\n    UNION ALL\n    SELECT channel_code, NULL, new_user_cnt FROM internet_analytics.dws_channel_new_user_1d WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 1 MONTH) AND DATE_SUB(:month_end, INTERVAL 1 MONTH)\n  ) t GROUP BY channel_code\n)\nSELECT c.channel_code,\n  ROUND((c.cost / NULLIF(c.users,0)) - (p.cost / NULLIF(p.users,0)), 2) AS cac_delta,\n  ROUND((c.cost - p.cost) / NULLIF(p.users,0), 2) AS cost_effect,\n  ROUND(p.cost * (1/NULLIF(c.users,0) - 1/NULLIF(p.users,0)), 2) AS user_effect\nFROM cur c LEFT JOIN prev p ON c.channel_code = p.channel_code\nORDER BY cac_delta DESC;",
        judge: "cost_effect 绝对值>user_effect → 成本驱动谈价；user_effect 主导 → 新客转化降，转 q10",
        output: "CAC 变化归因拆解表" },
    ],
    outputs: ["CAC 对比表", "CAC 月环比", "CAC 变化归因拆解", "高成本低效入口清单"],
    nextSteps: ["cac_mom_pct>15%且客单价未同步升 → 「投放预算分配优化」", "cost_to_share_ratio>1 且持续2月 → 「渠道质量下降诊断」", "video 误触导致验证成本升 → 「付费转化下降诊断」", "user_effect 主导 → 「付费转化下降诊断」"],
    dashboards: ["订购与分成", "order", "v_channel_analysis"],
  },
  {
    id: "q10", layer: "l2", category: "流失转化类", title: "付费转化下降诊断",
    desc: "主表 dws_trade_cashier_funnel_1d；含误触基线对照与失败原因归因（字段可用时）", bizQuestion: "转化卡在哪一步？是入口误触、验证还是确认？",
    keywords: ["漏斗", "转化", "误触", "收银台", "click2verify"],
    triggers: ["付费转化率周环比下降", "video 入口点击高但验证低", "活动期曝光多但确认少"],
    criteria: [
      { dim: "click→verify vs 基线", ok: "差≥-3pct", warn: "接近", bad: "低于基线>3pct → 瓶颈" },
      { dim: "误触率 vs 基线", ok: "差≤5pct", warn: "接近", bad: "高于基线>5pct → 误触入口" },
    ],
    steps: [
      { title: "前置：漏斗表口径约定", desc: "v_funnel 与日漏斗表口径不同，不得混用基线。主表用 expose/click/verify/purchase。",
        output: "口径约定备忘" },
      { title: "漏斗转化 + 基线对照", desc: "四环节转化；click2verify 与基线 diff。",
        sql: "WITH cur AS (\n  SELECT src_type, SUM(expose_cnt) AS expose, SUM(click_cnt) AS click,\n    SUM(verify_cnt) AS verify, SUM(purchase_cnt) AS purchase\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type = 'ALL' AND snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY src_type\n),\nbase AS (\n  SELECT src_type, SUM(verify_cnt)/NULLIF(SUM(click_cnt),0)*100 AS baseline_click2verify_pct\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type = 'ALL' AND snapshot_date BETWEEN :baseline_start AND :baseline_end\n  GROUP BY src_type\n)\nSELECT c.src_type, c.expose, c.click, c.verify, c.purchase,\n  ROUND(c.click/NULLIF(c.expose,0)*100,2) AS expose2click_pct,\n  ROUND(c.verify/NULLIF(c.click,0)*100,2) AS click2verify_pct,\n  ROUND(c.purchase/NULLIF(c.verify,0)*100,2) AS verify2purchase_pct,\n  ROUND(b.baseline_click2verify_pct,2) AS baseline_click2verify_pct,\n  ROUND(c.verify/NULLIF(c.click,0)*100 - b.baseline_click2verify_pct,2) AS diff_click2verify_pct\nFROM cur c LEFT JOIN base b ON c.src_type = b.src_type\nORDER BY diff_click2verify_pct ASC;",
        judge: "diff_click2verify_pct<-3pct → 漏斗瓶颈；verify2purchase 低于基线>3pct → 确认环节问题",
        output: "漏斗瓶颈诊断表" },
      { title: "误触监控 + 基线（K15）", desc: "misclick_pct=1-verify/click，对比基线。",
        sql: "WITH cur AS (\n  SELECT src_type, SUM(click_cnt) AS click, SUM(verify_cnt) AS verify,\n    ROUND((1-SUM(verify_cnt)/NULLIF(SUM(click_cnt),0))*100,2) AS misclick_pct\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type='ALL' AND snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY src_type\n),\nbase AS (\n  SELECT src_type, ROUND((1-SUM(verify_cnt)/NULLIF(SUM(click_cnt),0))*100,2) AS baseline_misclick_pct\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type='ALL' AND snapshot_date BETWEEN :baseline_start AND :baseline_end\n  GROUP BY src_type\n)\nSELECT c.src_type, c.click, c.verify, c.misclick_pct, b.baseline_misclick_pct,\n  ROUND(c.misclick_pct - b.baseline_misclick_pct, 2) AS misclick_diff_pct\nFROM cur c LEFT JOIN base b ON c.src_type = b.src_type\nORDER BY misclick_diff_pct DESC;",
        judge: "misclick_diff_pct >5pct → 误触入口，联动收银台改版/A/B",
        output: "误触入口清单" },
      { title: "漏斗流失归因（可选）", desc: "若含 verify_fail_reason 则拆失败原因；字段缺失则跳过并注明。",
        sql: "SELECT src_type, verify_fail_reason,\n  SUM(click_cnt) AS click, SUM(verify_cnt) AS verify,\n  SUM(click_cnt)-SUM(verify_cnt) AS lost_cnt,\n  ROUND((SUM(click_cnt)-SUM(verify_cnt))/NULLIF(SUM(click_cnt),0)*100,2) AS lost_pct\nFROM internet_analytics.dws_trade_cashier_funnel_1d\nWHERE device_type='ALL' AND snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY src_type, verify_fail_reason\nORDER BY lost_cnt DESC;",
        judge: "验证超时占比>30% → 技术侧排查验证服务；字段缺失则注明待补",
        output: "漏斗流失归因表（若可用）" },
    ],
    outputs: ["漏斗瓶颈诊断", "误触入口清单", "漏斗流失归因表（若字段可用）"],
    nextSteps: ["diff_click2verify_pct<-3pct 且集中 video → 「A/B 测试效果评估」", "verify2purchase 低于基线>3pct → 收银台/支付排查", "misclick_diff_pct>5pct → 收银台改版 + A/B", "验证超时占比>30% → 技术侧排查"],
    dashboards: ["商业化漏斗", "funnel", "v_funnel"],
  },
  {
    id: "q11", layer: "l2", category: "流失转化类", title: "用户流失诊断",
    desc: "确认 K14；RFM 最新快照；补流失前行为特征对比（流失 vs 留存）", bizQuestion: "用户为什么走了？沉默与流失规模、特征如何？",
    keywords: ["流失", "沉默", "churn", "RFM", "只开机", "行为特征"],
    triggers: ["沉默用户占比上升", "churn_cnt 连续 7 日上升", "只开机用户占比 >35%"],
    criteria: [
      { dim: "churn vs 基线", ok: "差≤20%", warn: "接近20%", bad: ">20% 紧急响应" },
      { dim: "只开机占比", ok: "≤35%", warn: "接近", bad: ">35% → 联动功能/内容" },
    ],
    steps: [
      { title: "前置：沉默/流失定义（K14）", desc: "默认沉默=连续7天无活跃、流失=连续30天；未确认前结论标「口径待确认」。",
        judge: "定义未写入文档 → 不下风险结论",
        output: "口径声明" },
      { title: "流失规模 vs 基线", desc: "当月日均 churn vs 近3月基线。",
        sql: "WITH cur AS (\n  SELECT DATE_FORMAT(snapshot_date,'%Y-%m') AS ym,\n    AVG(silent_cnt) AS avg_silent, AVG(churn_cnt) AS avg_churn, AVG(approx_net_growth) AS avg_net_growth\n  FROM internet_analytics.v_lifecycle\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY DATE_FORMAT(snapshot_date,'%Y-%m')\n),\nbase AS (\n  SELECT AVG(churn_cnt) AS baseline_churn FROM internet_analytics.v_lifecycle\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n)\nSELECT c.ym, c.avg_silent, c.avg_churn, c.avg_net_growth,\n  ROUND(b.baseline_churn,2) AS baseline_churn,\n  ROUND((c.avg_churn - b.baseline_churn)/NULLIF(b.baseline_churn,0)*100,2) AS churn_diff_pct\nFROM cur c CROSS JOIN base b;",
        judge: "churn_diff_pct >20% → 紧急响应",
        output: "流失 vs 基线表" },
      { title: "流失风险分群（最新快照）", desc: "必须带 MAX(snapshot_date)，禁止无 WHERE 全表 COUNT。",
        sql: "SELECT rfm_segment, COUNT(DISTINCT mac) AS users,\n  ROUND(AVG(days_since_last_active), 1) AS avg_days_since_active\nFROM internet_analytics.v_rfm\nWHERE snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\nGROUP BY rfm_segment\nORDER BY users DESC;",
        judge: "映射规则未确认前只出分布，不下高/中/低风险结论",
        output: "RFM 分布表" },
      { title: "流失前行为特征对比", desc: "流失 vs 留存用户在流失前30天的功能使用差异。",
        sql: "WITH churn_users AS (\n  SELECT DISTINCT mac FROM internet_analytics.v_rfm\n  WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\n    AND rfm_segment IN ('流失风险','一般/流失')\n),\nstay_users AS (\n  SELECT DISTINCT mac FROM internet_analytics.v_rfm\n  WHERE snapshot_date=(SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\n    AND rfm_segment NOT IN ('流失风险','一般/流失')\n),\nbehavior AS (\n  SELECT a.mac,\n    MAX(CASE WHEN c.mac IS NOT NULL THEN 1 ELSE 0 END) AS is_churn,\n    MAX(a.is_vod_active) AS is_vod_user,\n    MAX(a.is_live_active) AS is_live_user,\n    MAX(a.is_only_launcher) AS is_only_launcher_user,\n    SUM(a.vod_play_dur)/60 AS total_vod_minutes,\n    COUNT(DISTINCT a.snapshot_date) AS active_days\n  FROM internet_analytics.dws_act_user_active_1d a\n  LEFT JOIN churn_users c ON a.mac=c.mac\n  WHERE a.snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 30 DAY) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n  GROUP BY a.mac\n)\nSELECT is_churn, COUNT(*) AS users,\n  ROUND(AVG(is_vod_user)*100,2) AS vod_penetration_pct,\n  ROUND(AVG(is_live_user)*100,2) AS live_penetration_pct,\n  ROUND(AVG(is_only_launcher_user)*100,2) AS only_launcher_pct,\n  ROUND(AVG(total_vod_minutes),1) AS avg_vod_minutes,\n  ROUND(AVG(active_days),1) AS avg_active_days\nFROM behavior GROUP BY is_churn;",
        judge: "only_launcher 差>10pct→功能流失型；vod_minutes 差>50%→内容不匹配；active_days 差>30%→低粘性挽回ROI低",
        output: "流失前行为特征对比表" },
    ],
    outputs: ["流失诊断报告", "流失前行为特征对比表", "高风险规模估算"],
    nextSteps: ["churn_diff_pct>20% 且集中某端型/地市 → 「用户挽回策略优化」", "只开机>35% 且沉默同步升 → 「产品功能使用」+「完播率异常诊断」", "高风险>总活跃10%且映射已确认 → 「用户流失预测」", "vod_minutes 差>50% → 「内容题材分布」"],
    dashboards: ["用户生命周期", "lifecycle", "v_lifecycle", "v_rfm"],
  },
  {
    id: "q12", layer: "l2", category: "渠道效率类", title: "渠道质量下降诊断",
    desc: "价值侧：LTV/CAC/ROI + 入口留存质量；与 q09 共用成本表；禁止 conversion_rate 冒充 ROI", bizQuestion: "哪个入口带来的用户质量差了？",
    keywords: ["渠道质量", "LTV", "CAC", "ROI", "留存"],
    triggers: ["某入口新增多但留存差", "launcher 入口 LTV 低于 video", "渠道评分卡红灯"],
    criteria: [
      { dim: "LTV/CAC", ok: "≥1", warn: "接近1", bad: "<1 标红" },
      { dim: "ROI", ok: "≥1", warn: "接近1", bad: "<1 投放倒挂" },
      { dim: "双重红灯", ok: "否", warn: "单项红", bad: "LTV/CAC<1 且 D7低于均值>10pct" },
    ],
    steps: [
      { title: "前置：LTV 窗口与成本窗口一致", desc: "K11 观察窗口与成本归因窗口对齐；v_ltv 写全库名。",
        output: "窗口对齐确认" },
      { title: "入口 LTV 对比", desc: "补库名；按渠道汇总。",
        sql: "SELECT channel_name, SUM(order_count) AS order_count, SUM(total_gmv) AS total_gmv,\n  ROUND(AVG(avg_order_value),2) AS avg_order_value,\n  ROUND(AVG(avg_platform_share),2) AS avg_platform_share,\n  ROUND(SUM(total_gmv)/NULLIF(SUM(order_count),0),2) AS gmv_per_order\nFROM internet_analytics.v_ltv\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY channel_name ORDER BY total_gmv DESC;",
        output: "入口 LTV 排行" },
      { title: "LTV/CAC 与 ROI（K10/K11/K12）", desc: "ROI=分成/花费，不是转化率。",
        sql: "WITH ltv AS (\n  SELECT channel_name AS channel_code, SUM(total_gmv) AS total_gmv,\n    SUM(avg_platform_share) AS total_share, COUNT(DISTINCT mac) AS user_cnt\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY channel_name\n),\ncost AS (\n  SELECT channel_code, SUM(cost_amount) AS total_cost FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nnewu AS (\n  SELECT channel_code, SUM(new_user_cnt) AS new_users FROM internet_analytics.dws_channel_new_user_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n)\nSELECT l.channel_code, l.user_cnt, n.new_users,\n  ROUND(l.total_share/NULLIF(l.user_cnt,0),2) AS ltv_per_user,\n  ROUND(c.total_cost/NULLIF(n.new_users,0),2) AS cac,\n  ROUND((l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0),2) AS ltv_cac_ratio,\n  ROUND(l.total_share/NULLIF(c.total_cost,0),2) AS roi,\n  ROUND(l.total_gmv/NULLIF(l.user_cnt,0),2) AS gmv_per_user\nFROM ltv l LEFT JOIN cost c ON l.channel_code=c.channel_code LEFT JOIN newu n ON l.channel_code=n.channel_code\nORDER BY ltv_cac_ratio ASC;",
        judge: "ltv_cac_ratio<1 → 标红；roi<1 → 投放倒挂",
        output: "渠道质量对比表（LTV/CAC/ROI）" },
      { title: "入口留存质量对比", desc: "财务侧之外补 D7/D30 留存，区分「该收缩」与「该谈价」。",
        sql: "SELECT r.channel_code,\n  ROUND(AVG(CASE WHEN r.day_offset=7 THEN r.retention_rate END),2) AS d7_retention,\n  ROUND(AVG(CASE WHEN r.day_offset=30 THEN r.retention_rate END),2) AS d30_retention,\n  COUNT(DISTINCT r.cohort_date) AS cohort_cnt\nFROM internet_analytics.v_user_retention r\nWHERE r.cohort_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND :month_end\nGROUP BY r.channel_code\nORDER BY d7_retention ASC;",
        judge: "D7低于全渠道均值>10pct 且 LTV/CAC<1 → 双重红灯优先收缩；D7正常但 LTV/CAC<1 → 谈价而非收缩",
        output: "入口留存质量表 + 双重红灯清单" },
    ],
    outputs: ["渠道质量诊断（LTV/CAC/ROI + D7/D30）", "低效入口收缩建议", "双重红灯渠道清单"],
    nextSteps: ["ltv_cac_ratio<1 且 D7低于均值>10pct → 「渠道组合优化」", "ltv_cac_ratio<1 但留存正常 → 「定价策略优化」", "roi<1 且持续2月 → 「投放预算分配优化」", "归因口径存疑 → 工具箱「渠道归因分析」"],
    dashboards: ["订购与分成", "order", "v_ltv", "v_channel_analysis"],
  },
  {
    id: "q13", layer: "l2", category: "内容质量类", title: "完播率异常诊断",
    desc: "整体完播 vs 基线；VV Top50 低完播清单；题材对比；QoS 指标联动（表可用时）", bizQuestion: "为什么完播率下降了？内容问题还是 QoS？",
    keywords: ["完播率", "QoS", "卡顿", "加权完播", "题材"],
    triggers: ["整体完播率月环比下降 >5pct", "某题材完播率骤降", "首帧/卡顿投诉上升"],
    criteria: [
      { dim: "整体完播 vs 基线", ok: "差≥-5pct", warn: "接近", bad: "<-5pct → 进诊" },
      { dim: "剧集完播(Top50 VV)", ok: "≥30%", warn: "接近30%", bad: "<30% 列入排查" },
      { dim: "卡顿率环比", ok: "≤+2pct", warn: "接近", bad: ">+2pct 且完播降 → QoS" },
    ],
    steps: [
      { title: "前置：完播口径声明（K13）", desc: "加权完播=finish_cnt/vv；剧集平均完播另列；两者不得混读。",
        output: "完播口径脚注" },
      { title: "整体完播率 vs 基线", desc: "当期加权完播 vs 近3月月均值。",
        sql: "WITH cur AS (\n  SELECT ROUND(SUM(finish_cnt)/NULLIF(SUM(vv),0)*100,2) AS finish_rate_pct\n  FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n),\nbase AS (\n  SELECT DATE_FORMAT(snapshot_date,'%Y-%m') AS ym,\n    ROUND(SUM(finish_cnt)/NULLIF(SUM(vv),0)*100,2) AS finish_rate_pct\n  FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n  GROUP BY DATE_FORMAT(snapshot_date,'%Y-%m')\n)\nSELECT c.finish_rate_pct AS cur_finish_rate,\n  ROUND(AVG(b.finish_rate_pct),2) AS baseline_finish_rate,\n  ROUND(c.finish_rate_pct - AVG(b.finish_rate_pct),2) AS diff_pct\nFROM cur c CROSS JOIN base b\nGROUP BY c.finish_rate_pct;",
        judge: "diff_pct < -5pct → 整体完播异常，进入低完播清单",
        output: "整体完播 vs 基线" },
      { title: "低完播剧集（VV Top50）", desc: "HAVING 用 SUM(vv)；加权与平均完播分列。",
        sql: "WITH top50 AS (\n  SELECT series_id FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY series_id ORDER BY SUM(vv) DESC LIMIT 50\n)\nSELECT s.series_id, se.series_name, SUM(s.vv) AS vv,\n  ROUND(SUM(s.finish_cnt)/NULLIF(SUM(s.vv),0)*100,2) AS weighted_finish_rate_pct,\n  ROUND(AVG(s.complete_rate_avg),2) AS avg_series_complete_rate,\n  ROUND(SUM(s.finish_cnt)/NULLIF(SUM(s.vv),0)*100 - AVG(s.complete_rate_avg),2) AS weighted_vs_avg_gap\nFROM internet_analytics.dws_content_series_play_1d s\nJOIN internet_analytics.dim_content_series se ON s.series_id=se.series_id\nJOIN top50 t ON s.series_id=t.series_id\nWHERE s.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY s.series_id, se.series_name\nHAVING SUM(s.vv) >= 100\nORDER BY weighted_finish_rate_pct ASC\nLIMIT 20;",
        judge: "加权完播<30% 且在 Top50 → 列入排查；weighted_vs_avg_gap 绝对值>15pct → 看单集分布",
        output: "低完播剧集清单（加权+平均分列）" },
      { title: "题材完播对比", desc: "区分内容问题 vs QoS 嫌疑。",
        sql: "SELECT g.genre_name, SUM(s.vv) AS vv, SUM(s.finish_cnt) AS finish,\n  ROUND(SUM(s.finish_cnt)/NULLIF(SUM(s.vv),0)*100,2) AS weighted_finish_rate_pct\nFROM internet_analytics.dws_content_series_play_1d s\nJOIN internet_analytics.dim_genre g ON s.genre_id=g.genre_id\nWHERE s.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY g.genre_name\nORDER BY weighted_finish_rate_pct ASC;",
        judge: "题材完播低且卡顿环比升>2pct → QoS；完播低但卡顿平稳 → 内容问题",
        output: "题材完播对比表" },
      { title: "QoS 指标联动（可选）", desc: "若存在 dws_qos_play_quality_1d 则查首帧/卡顿/失败率；表不存在则注明无法区分内容/QoS。",
        sql: "SELECT DATE_FORMAT(snapshot_date,'%Y-%m') AS ym,\n  ROUND(AVG(first_frame_ms),0) AS avg_first_frame_ms,\n  ROUND(AVG(stutter_rate_pct),2) AS avg_stutter_rate_pct,\n  ROUND(AVG(play_fail_rate_pct),2) AS avg_play_fail_rate_pct\nFROM internet_analytics.dws_qos_play_quality_1d\nWHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND :month_end\nGROUP BY DATE_FORMAT(snapshot_date,'%Y-%m')\nORDER BY ym;",
        judge: "卡顿率环比升>2pct 且完播同步降 → QoS；QoS 平稳但完播降 → 内容运营",
        output: "QoS 指标趋势（若可用）" },
    ],
    outputs: ["整体完播趋势 vs 基线", "低完播剧集清单", "题材完播对比", "QoS 指标趋势（若可用）"],
    nextSteps: ["卡顿率环比升>2pct 且完播降 → 「完播与QoS」看板", "QoS 平稳但完播降 → 内容运营/排期调整", "完播低且 only_launcher 升 → 回 L1「产品功能使用」", "某题材完播低但其他正常 → 题材级内容排查"],
    dashboards: ["完播与QoS", "quality", "内容·剧集", "series"],
  },

  /* ===== L3 预测性 (5) · 对齐完善版（三条红线/MAPE/残差区间/前置四件事） ===== */
  /* L3 红线：①无回测不预测（须 walk-forward MAPE）；②无区间不预测；③无假设不预测。
     MAPE≤15% 可用于经营计划；15%–25% 仅趋势参考；>25% 不得用于决策。
     区间=点估计±k×残差标准差（k默认1.5，经营计划建议k=2）。前置：数据质量/口径/平稳性/方法选择。 */
  {
    id: "q14", layer: "l3", category: "DAU预测类", title: "下月 DAU 预测",
    desc: "区分 MA7（平稳）与线性趋势；区间用残差标准差而非全期 STDDEV；必做 MAPE 回测", bizQuestion: "下个月日活大概多少？区间是多少？",
    keywords: ["DAU", "预测", "MA7", "线性趋势", "MAPE", "残差"],
    triggers: ["月度经营计划编制", "暑期档资源排期", "DAU 异常波动后需预测回补"],
    criteria: [
      { dim: "回测 MAPE", ok: "≤15% 可用于计划", warn: "15%–25% 仅趋势参考", bad: ">15% 不得写入经营计划" },
      { dim: "残差/均值", ok: "≤10%", warn: ">10% 不确定性高", bad: "区间过宽需提示" },
    ],
    steps: [
      { title: "前置四件事", desc: "数据质量；DAU 口径(K01)与是否分端预测；近90日异常点；平稳则 MA7，有趋势则线性外推。",
        judge: "有明显趋势时不得只用 MA7",
        output: "方法选择说明 + 异常点清单" },
      { title: "近90日基线与残差波动", desc: "修正：区间用 MA7 残差标准差 residual_std_ma7，不用全期 STDDEV。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, total_dau FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n),\nma AS (\n  SELECT snapshot_date, total_dau,\n    AVG(total_dau) OVER (ORDER BY snapshot_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7\n  FROM daily\n)\nSELECT ROUND(AVG(total_dau),0) AS avg_dau_90d, ROUND(STDDEV(total_dau),0) AS std_dau_90d,\n  MIN(total_dau) AS min_dau, MAX(total_dau) AS max_dau,\n  ROUND(STDDEV(total_dau - ma7),0) AS residual_std_ma7, ROUND(AVG(ma7),0) AS avg_ma7\nFROM ma;",
        judge: "residual_std_ma7/avg_ma7>10% → 提示不确定性高；有线性趋势 → 转步骤2b",
        output: "基线统计 + residual_std_ma7" },
      { title: "MA7 外推（平稳场景）", desc: "点估计=基准日 ma7；区间=ma7±1.5×residual_std_ma7（经营计划可用 k=2）。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, total_dau FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 29 DAY) AND :as_of\n),\nma AS (\n  SELECT snapshot_date, total_dau,\n    AVG(total_dau) OVER (ORDER BY snapshot_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7\n  FROM daily\n)\nSELECT snapshot_date, total_dau, ROUND(ma7,0) AS ma7_dau FROM ma ORDER BY snapshot_date;",
        output: "MA7 序列 + 点估计/区间说明" },
      { title: "线性趋势外推（有趋势场景）", desc: "近90日最小二乘；点估计=intercept+slope×t；区间用 residual_std_linear。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, total_dau,\n    DATEDIFF(snapshot_date, DATE_SUB(:as_of, INTERVAL 89 DAY)) AS t\n  FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n)\nSELECT\n  ROUND((AVG(t*total_dau)-AVG(t)*AVG(total_dau))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0),2) AS slope,\n  ROUND(AVG(total_dau)-((AVG(t*total_dau)-AVG(t)*AVG(total_dau))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*AVG(t),2) AS intercept,\n  ROUND(STDDEV(total_dau-(AVG(total_dau)+((AVG(t*total_dau)-AVG(t)*AVG(total_dau))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*(t-AVG(t)))),0) AS residual_std_linear\nFROM daily;",
        output: "slope/intercept/residual_std_linear" },
      { title: "回测校验 MAPE（必做）", desc: "walk-forward：近窗拟合预测，报告 MAPE。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, total_dau FROM internet_analytics.v_dau_overview\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n),\nma AS (\n  SELECT snapshot_date, total_dau,\n    AVG(total_dau) OVER (ORDER BY snapshot_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7\n  FROM daily\n)\nSELECT ROUND(AVG(ABS(total_dau-ma7)/NULLIF(total_dau,0))*100,2) AS mape_pct\nFROM ma WHERE snapshot_date >= DATE_SUB(:as_of, INTERVAL 30 DAY);",
        judge: "MAPE>15% → 仅趋势参考，不得写入经营计划；≤15% 可用于计划",
        output: "MAPE + 是否可用于经营计划" },
    ],
    outputs: ["下月 DAU 点估计+区间（含k与残差来源）", "端型拆分预测", "回测 MAPE 与可用性结论", "假设与失效条件"],
    nextSteps: ["预测区间下限低于经营目标>10%且MAPE≤15% → 「投放预算分配优化」", "上限高于目标且残差大 → 验证内容排期+情景分析", "MAPE>15% → 不进入预算决策，先补数据/换方法"],
    dashboards: ["活跃总览", "overview", "v_dau_overview"],
  },
  {
    id: "q15", layer: "l3", category: "LTV预测类", title: "LTV/ARPU 预测（订购客单）",
    desc: "补库名与时间过滤；按 cohort 衰减外推；MAPE>20% 不得用于加码绝对判断", bizQuestion: "这批用户长期值多少钱？",
    keywords: ["LTV", "ARPU", "cohort", "衰减", "MAPE"],
    triggers: ["评估新入口是否值得加码", "会员/连续包月策略调整前", "渠道试投结束"],
    criteria: [
      { dim: "LTV 回测 MAPE", ok: "≤20%", warn: "接近20%", bad: ">20% 仅排序参考" },
      { dim: "LTV下限/CAC", ok: ">1 且 MAPE≤20%", warn: "接近1", bad: "≤1 不加码" },
    ],
    steps: [
      { title: "前置四件事", desc: "确认 K11 观察窗口；cohort 定义；v_ltv 口径。窗口未定不得称终身价值。",
        output: "窗口与 cohort 定义声明" },
      { title: "入口 LTV 现状", desc: "补 internet_analytics.v_ltv 与时间过滤。",
        sql: "SELECT channel_name, SUM(order_count) AS order_count, SUM(total_gmv) AS total_gmv,\n  ROUND(AVG(avg_order_value),2) AS avg_order_value,\n  ROUND(AVG(avg_platform_share),2) AS avg_platform_share,\n  ROUND(SUM(total_gmv)/NULLIF(SUM(order_count),0),2) AS gmv_per_order\nFROM internet_analytics.v_ltv\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY channel_name ORDER BY total_gmv DESC;",
        output: "入口 LTV 现状表" },
      { title: "cohort 客单趋势", desc: "按 cohort_month×入口看 ARPU 衰减，支撑「这批用户」外推。",
        sql: "SELECT cohort_month, channel_name, COUNT(DISTINCT mac) AS cohort_users,\n  ROUND(SUM(order_amount)/NULLIF(COUNT(DISTINCT mac),0),2) AS arpu_cohort,\n  ROUND(SUM(revenue_share)/NULLIF(COUNT(DISTINCT mac),0),2) AS arpu_share_cohort\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL'\n  AND cohort_month BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\nGROUP BY cohort_month, channel_name\nORDER BY cohort_month, channel_name;",
        judge: "老 cohort ARPU 逐月衰减明显 → 须用衰减曲线而非固定 ARPU",
        output: "cohort ARPU 趋势表" },
      { title: "LTV 外推（衰减曲线）", desc: "按 month_offset 准备累计 ARPU；应用层拟合 a×offset^(-b) 外推至窗口终点。",
        sql: "SELECT cohort_month, channel_name, month_offset,\n  SUM(revenue_share)/NULLIF(COUNT(DISTINCT mac),0) AS arpu_at_offset\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL'\n  AND cohort_month BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\nGROUP BY cohort_month, channel_name, month_offset\nORDER BY cohort_month, channel_name, month_offset;",
        output: "衰减曲线拟合输入 + LTV 点估计/区间（应用层）" },
      { title: "回测校验", desc: "前3个月 cohort 拟合，预测后3个月 ARPU，算 MAPE。",
        judge: "MAPE>20% → 仅排序参考，不得用于是否加码的绝对判断",
        output: "MAPE + 可用性结论" },
    ],
    outputs: ["入口 LTV 预测区间（含 cohort/窗口假设）", "ARPU 基准/乐观/悲观情景", "回测 MAPE 与可用性结论"],
    nextSteps: ["LTV区间下限/CAC>1且MAPE≤20% → 「渠道质量下降诊断」", "LTV对定价敏感 → 「定价策略优化」", "MAPE>20% → 仅渠道排序，不用于加码决策"],
    dashboards: ["订购与分成", "order", "v_ltv"],
  },
  {
    id: "q16", layer: "l3", category: "渠道预测类", title: "渠道效果预测",
    desc: "统一用日漏斗表口径；先做曝光CV稳定性检验；订购外推含月份天数与星期效应；必做 MAPE", bizQuestion: "各入口下月能带来多少订购？",
    keywords: ["渠道", "订购预测", "CV", "星期效应", "MAPE"],
    triggers: ["季度渠道预算评审", "新入口试投评估", "入口改版效果预判"],
    criteria: [
      { dim: "曝光 CV", ok: "≤30%", warn: ">30% 假设不稳", bad: "不得单点外推" },
      { dim: "回测 MAPE", ok: "≤15%", warn: "15%–25%", bad: ">15% 不进预算评审" },
    ],
    steps: [
      { title: "前置四件事", desc: "统一用 dws_trade_cashier_funnel_1d；试投不足30天不预测；单列已知活动/改版。",
        judge: "试投期<30天 → 延长试投，不做预测",
        output: "口径约定 + 外生变量清单" },
      { title: "入口历史转化基线", desc: "近3完整月 expose→purchase；禁止用 v_funnel.product_line 冒充 src_type。",
        sql: "SELECT src_type, SUM(expose_cnt) AS expose, SUM(click_cnt) AS click,\n  SUM(verify_cnt) AS verify, SUM(purchase_cnt) AS purchase,\n  ROUND(SUM(purchase_cnt)/NULLIF(SUM(expose_cnt),0)*100,4) AS cvr_expose2purchase_pct,\n  ROUND(SUM(purchase_cnt)/NULLIF(SUM(click_cnt),0)*100,2) AS cvr_click2purchase_pct\nFROM internet_analytics.dws_trade_cashier_funnel_1d\nWHERE device_type='ALL'\n  AND snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\nGROUP BY src_type;",
        judge: "CVR 月波动>20% → 须用区间；某入口显著偏低 → 单独标注",
        output: "入口转化基线表" },
      { title: "曝光/转化稳定性（CV）", desc: "替代原「假设曝光维持均值」未验证。",
        sql: "SELECT src_type,\n  ROUND(AVG(expose_cnt),0) AS avg_daily_expose, ROUND(STDDEV(expose_cnt),0) AS std_daily_expose,\n  ROUND(STDDEV(expose_cnt)/NULLIF(AVG(expose_cnt),0)*100,2) AS cv_expose_pct,\n  ROUND(AVG(confirm_cnt),0) AS avg_daily_confirm, ROUND(STDDEV(confirm_cnt),0) AS std_daily_confirm,\n  ROUND(STDDEV(confirm_cnt)/NULLIF(AVG(confirm_cnt),0)*100,2) AS cv_confirm_pct\nFROM internet_analytics.dws_trade_cashier_funnel_1d\nWHERE device_type='ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 29 DAY) AND :as_of\nGROUP BY src_type;",
        judge: "CV>30% → 维持均值假设不成立，改用星期因子或区间预测",
        output: "稳定性检验表" },
      { title: "下月订购外推（天数+星期）", desc: "修正日均×30；用 dim_date 星期分布 × 历史 dow 均值。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, src_type, SUM(confirm_cnt) AS confirm\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type='ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 59 DAY) AND :as_of\n  GROUP BY snapshot_date, src_type\n),\ndow AS (\n  SELECT src_type, DAYOFWEEK(snapshot_date) AS dow, AVG(confirm) AS avg_confirm_dow\n  FROM daily GROUP BY src_type, DAYOFWEEK(snapshot_date)\n),\nnext_month AS (\n  SELECT src_type, d.day_of_week AS dow, COUNT(*) AS days_cnt\n  FROM (SELECT DISTINCT src_type FROM daily) s\n  CROSS JOIN (\n    SELECT date_key, day_of_week FROM internet_analytics.dim_date\n    WHERE date_key BETWEEN :next_month_start AND :next_month_end\n  ) d\n  GROUP BY src_type, d.day_of_week\n)\nSELECT n.src_type, ROUND(SUM(n.days_cnt*d.avg_confirm_dow),0) AS forecast_monthly_confirm,\n  ROUND(STDDEV(d.avg_confirm_dow),0) AS dow_std\nFROM next_month n JOIN dow d ON n.src_type=d.src_type AND n.dow=d.dow\nGROUP BY n.src_type;",
        output: "下月订购点估计（区间用残差×sqrt天数）" },
      { title: "回测 MAPE", desc: "前60天预测后30天。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, src_type, SUM(confirm_cnt) AS confirm\n  FROM internet_analytics.dws_trade_cashier_funnel_1d\n  WHERE device_type='ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n  GROUP BY snapshot_date, src_type\n),\nma30 AS (\n  SELECT src_type, snapshot_date, confirm,\n    AVG(confirm) OVER (PARTITION BY src_type ORDER BY snapshot_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS ma30\n  FROM daily\n)\nSELECT src_type, ROUND(AVG(ABS(confirm-ma30)/NULLIF(confirm,0))*100,2) AS mape_pct\nFROM ma30 WHERE snapshot_date >= DATE_SUB(:as_of, INTERVAL 30 DAY)\nGROUP BY src_type;",
        judge: "MAPE>15% → 该入口仅趋势参考，不进预算评审",
        output: "分入口 MAPE" },
    ],
    outputs: ["下月各入口订购点估计+区间", "曝光稳定性与假设失效条件", "回测 MAPE", "入口优先级（贡献×置信度）"],
    nextSteps: ["预测贡献占比<5%且CV>30% → 「渠道组合优化」", "贡献环比升>20%且MAPE≤15% → 「投放预算分配优化」", "试投<30天 → 不做预测延长试投", "MAPE>15% → 不进预算评审"],
    dashboards: ["商业化漏斗", "funnel", "v_funnel", "v_channel_attribution"],
  },
  {
    id: "q17", layer: "l3", category: "流失预测类", title: "用户流失预测",
    desc: "MA7仅趋势参考；RFM须最新快照；线性/MA7外推+区间；高风险阈值需业务校准", bizQuestion: "下个月大概流失多少人？哪些人最可能流失？",
    keywords: ["流失", "预测", "RFM", "MAPE", "高风险"],
    triggers: ["沉默用户占比持续上升", "续订率下滑预警", "挽回预算编制"],
    criteria: [
      { dim: "回测 MAPE", ok: "≤15%", warn: "15%–25%", bad: ">15% 不进挽回预算" },
      { dim: "高风险占比", ok: "已业务校准", warn: "沿用15%经验值须标注", bad: "未校准不进预算" },
    ],
    steps: [
      { title: "前置四件事", desc: "确认 K14；v_rfm 快照过滤；churn_cnt 定义；高风险阈值待校准。",
        output: "定义与阈值声明" },
      { title: "流失趋势 MA7（≠预测）", desc: "平滑历史趋势，预测在步骤3。",
        sql: "SELECT snapshot_date, silent_cnt, churn_cnt,\n  ROUND(AVG(churn_cnt) OVER (ORDER BY snapshot_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW),0) AS ma7_churn\nFROM internet_analytics.v_lifecycle\nWHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 29 DAY) AND :as_of\nORDER BY snapshot_date;",
        output: "流失趋势+MA7参考线" },
      { title: "高风险规模（最新快照）", desc: "修正无 WHERE 虚高；占比=高风险/总活跃，标注阈值待校准。",
        sql: "SELECT rfm_segment, COUNT(DISTINCT mac) AS users,\n  ROUND(AVG(days_since_last_active),1) AS avg_days_since_active\nFROM internet_analytics.v_rfm\nWHERE snapshot_date=(SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\n  AND rfm_segment IN ('流失风险','一般/流失')\nGROUP BY rfm_segment;\n\nSELECT COUNT(DISTINCT mac) AS total_active\nFROM internet_analytics.dws_act_user_active_1d\nWHERE snapshot_date BETWEEN :month_start AND :month_end;",
        judge: "占比>15%且连续2月上升 → 启动挽回预算编制（阈值须业务校准）",
        output: "高风险规模与占比" },
      { title: "下月流失外推+区间", desc: "有趋势用线性，否则 MA7；点估计×下月天数；区间含 sqrt(天数)。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, churn_cnt,\n    DATEDIFF(snapshot_date, DATE_SUB(:as_of, INTERVAL 89 DAY)) AS t\n  FROM internet_analytics.v_lifecycle\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n)\nSELECT\n  ROUND((AVG(t*churn_cnt)-AVG(t)*AVG(churn_cnt))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0),4) AS slope,\n  ROUND(AVG(churn_cnt)-((AVG(t*churn_cnt)-AVG(t)*AVG(churn_cnt))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*AVG(t),2) AS intercept,\n  ROUND(STDDEV(churn_cnt-(AVG(churn_cnt)+((AVG(t*churn_cnt)-AVG(t)*AVG(churn_cnt))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*(t-AVG(t)))),0) AS residual_std_linear\nFROM daily;\n\n-- MA7 备选\nWITH daily AS (\n  SELECT snapshot_date, churn_cnt FROM internet_analytics.v_lifecycle\n  WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 29 DAY) AND :as_of\n),\nma AS (\n  SELECT snapshot_date, churn_cnt,\n    AVG(churn_cnt) OVER (ORDER BY snapshot_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7\n  FROM daily\n)\nSELECT ROUND(AVG(ma7),0) AS ma7_avg, ROUND(STDDEV(churn_cnt-ma7),0) AS residual_std_ma7 FROM ma;",
        judge: "|slope|/均值>1%/天 → 用线性；否则用 MA7",
        output: "下月流失点估计+区间" },
      { title: "回测 MAPE + 阈值校准", desc: "MAPE>15%仅趋势参考；高风险占比阈值标注待业务校准。",
        judge: "MAPE>15% → 不进挽回预算",
        output: "MAPE + 阈值校准说明" },
    ],
    outputs: ["下月流失点估计+区间", "高风险规模与占比（含阈值说明）", "挽回优先级人群规模", "假设与失效条件"],
    nextSteps: ["预测流失下限>挽回预算可覆盖规模 → 「用户挽回策略优化」", "流失升且 L2 已定位根因 → 回对应 L2 复核", "高风险阈值未校准 → 先校准再进预算", "MAPE>15% → 仅趋势参考"],
    dashboards: ["用户生命周期", "lifecycle", "v_lifecycle", "v_rfm"],
  },
  {
    id: "q18", layer: "l3", category: "收入预测类", title: "分成收入预测",
    desc: "确认 revenue_share 口径；分成率稳定性；天数+星期外推；三情景；MAPE 回测", bizQuestion: "下月分成收入大概多少？区间是多少？",
    keywords: ["分成", "收入预测", "情景", "星期效应", "MAPE"],
    triggers: ["月度财务结算前", "内容采购成本评估", "套餐定价调整前"],
    criteria: [
      { dim: "分成率波动", ok: "≤2pct", warn: ">2pct 须拆套餐", bad: "不稳定不可整体外推" },
      { dim: "回测 MAPE", ok: "≤15%", warn: "15%–25%", bad: ">15% 不进财务预算" },
    ],
    steps: [
      { title: "前置四件事", desc: "确认 revenue_share 方向；下月天数/活动/调价；结算延迟；套餐结构稳定性。",
        output: "口径与外生变量声明" },
      { title: "近3月分成趋势", desc: "含 share_rate_pct。",
        sql: "SELECT DATE_FORMAT(snapshot_date,'%Y-%m') AS month,\n  SUM(order_cnt) AS orders, ROUND(SUM(order_amount),0) AS order_amount,\n  ROUND(SUM(revenue_share),0) AS revenue_share,\n  ROUND(SUM(revenue_share)/NULLIF(SUM(order_amount),0)*100,2) AS share_rate_pct\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL'\n  AND snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\nGROUP BY DATE_FORMAT(snapshot_date,'%Y-%m')\nORDER BY month;",
        judge: "share_rate 月波动>2pct → 须分套餐/品类拆解",
        output: "分成趋势表" },
      { title: "分成率稳定性检验", desc: "按入口看 share_rate 波动。",
        sql: "SELECT src_type,\n  ROUND(SUM(revenue_share)/NULLIF(SUM(order_amount),0)*100,2) AS share_rate_pct,\n  ROUND(STDDEV(revenue_share/NULLIF(order_amount,0))*100,2) AS share_rate_std_pct\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\nGROUP BY src_type;",
        judge: "share_rate_std_pct>2pct → 分套餐拆解后再预测",
        output: "分成率稳定性表" },
      { title: "下月分成外推（天数+星期）", desc: "修正日均×30；用 dim_date × dow 均值。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, SUM(order_cnt) AS orders, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 59 DAY) AND :as_of\n  GROUP BY snapshot_date\n),\ndow AS (\n  SELECT DAYOFWEEK(snapshot_date) AS dow, AVG(share) AS avg_share_dow FROM daily GROUP BY DAYOFWEEK(snapshot_date)\n),\nnext_month AS (\n  SELECT d.day_of_week AS dow, COUNT(*) AS days_cnt FROM internet_analytics.dim_date d\n  WHERE d.date_key BETWEEN :next_month_start AND :next_month_end\n  GROUP BY d.day_of_week\n)\nSELECT ROUND(SUM(n.days_cnt*d.avg_share_dow),0) AS forecast_monthly_share,\n  ROUND(STDDEV(d.avg_share_dow),0) AS dow_std\nFROM next_month n JOIN dow d ON n.dow=d.dow;",
        output: "分成点估计（区间用残差×sqrt天数）" },
      { title: "情景分析（基准/乐观/悲观）", desc: "乐观须用历史活动 lift，无数据则不得臆造；悲观用历史最差环比。",
        sql: "SELECT\n  ROUND(AVG(CASE WHEN is_activity=1 THEN revenue_share END),0) AS avg_activity_share,\n  ROUND(AVG(CASE WHEN is_activity=0 THEN revenue_share END),0) AS avg_normal_share,\n  ROUND(AVG(CASE WHEN is_activity=1 THEN revenue_share END)/NULLIF(AVG(CASE WHEN is_activity=0 THEN revenue_share END),0),2) AS activity_lift_ratio\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 180 DAY) AND :as_of;",
        judge: "无历史活动数据 → 乐观情景按基准+0%（不臆造）",
        output: "三情景对比表（含假设）" },
      { title: "回测 MAPE", desc: "前60天预测后30天。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 89 DAY) AND :as_of\n  GROUP BY snapshot_date\n),\nma30 AS (\n  SELECT snapshot_date, share,\n    AVG(share) OVER (ORDER BY snapshot_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS ma30\n  FROM daily\n)\nSELECT ROUND(AVG(ABS(share-ma30)/NULLIF(share,0))*100,2) AS mape_pct\nFROM ma30 WHERE snapshot_date >= DATE_SUB(:as_of, INTERVAL 30 DAY);",
        judge: "MAPE>15% → 不进入财务预算",
        output: "MAPE + 可用性结论" },
    ],
    outputs: ["下月分成点估计+区间", "三情景对比表", "回测 MAPE", "套餐/品类贡献拆解"],
    nextSteps: ["预测下限低于财务目标>10%且MAPE≤15% → 「定价策略优化」", "分成率月波动>2pct → 先拆套餐再预测", "MAPE>15% → 不进财务预算", "某套餐贡献环比降>20% → 内容采购成本评估"],
    dashboards: ["订购与分成", "order", "dws_trade_order_1d"],
  },

  /* ===== L4 评估性 (5) · 对齐完善版（评估四原则/K16-K22/前置四件事/效应量+显著性） ===== */
  /* L4 四原则：①有对照才有评估；②有效应量才下结论；③有不确定性才可信；④有业务含义才算完成。
     口径：K16评估基线；K17效应量；K18显著性(α=0.05)；K19最小样本量；K20增量/反事实；K21活动成本；K22代理有效性。
     前置：基线定义 / 反事实方法 / 口径一致 / 样本与功效。报告须含效应量+不确定性+业务含义+局限声明。 */
  {
    id: "q19", layer: "l4", category: "获客效率类", title: "渠道获客效率评估",
    desc: "同窗口计算 LTV/CAC 并分级；补窗口敏感性与样本充足性，避免无 CAC 却套用 LTV/CAC 阈值", bizQuestion: "各入口投放划不划算？该加码、维持还是收缩？",
    keywords: ["CAC", "LTV", "ROI", "评估", "获客效率", "窗口敏感性"],
    triggers: ["季度预算评审", "新入口试投结束", "渠道评分卡定期复盘"],
    criteria: [
      { dim: "LTV/CAC", ok: ">3 加码", warn: "1–3 维持", bad: "<1 收缩" },
      { dim: "窗口敏感性", ok: "±30%内评级稳健", warn: "偏离>30%仅参考", bad: "样本不足不进决策" },
    ],
    steps: [
      { title: "评估前置四件事", desc: "LTV与CAC同观察窗口；反事实用同渠道历史或同类均值并注明参照系；CAC=花费/新客(K10)，LTV=窗口分成/用户(K11)；试投<30天或新客不足标样本不足。",
        judge: "窗口不一致则结论无效",
        output: "基线/反事实/口径/样本声明" },
      { title: "LTV/CAC 比率（修正无 CAC）", desc: "合并 v_ltv、dwd_marketing_cost_1d、dws_channel_new_user_1d；同窗口计算并分级。",
        sql: "WITH ltv AS (\n  SELECT channel_name AS channel_code, SUM(avg_platform_share) AS total_share, COUNT(DISTINCT mac) AS user_cnt\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY channel_name\n),\ncost AS (\n  SELECT channel_code, SUM(cost_amount) AS total_cost FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nnewu AS (\n  SELECT channel_code, SUM(new_user_cnt) AS new_users FROM internet_analytics.dws_channel_new_user_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n)\nSELECT l.channel_code, l.user_cnt, n.new_users,\n  ROUND(l.total_share/NULLIF(l.user_cnt,0),2) AS ltv_per_user,\n  ROUND(c.total_cost/NULLIF(n.new_users,0),2) AS cac,\n  ROUND((l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0),2) AS ltv_cac_ratio,\n  CASE\n    WHEN (l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0) < 1 THEN '收缩'\n    WHEN (l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0) > 3 THEN '加码'\n    ELSE '维持' END AS rating\nFROM ltv l\nLEFT JOIN cost c ON l.channel_code=c.channel_code\nLEFT JOIN newu n ON l.channel_code=n.channel_code\nORDER BY ltv_cac_ratio ASC;",
        judge: "<1 收缩；1–3 维持；>3 加码",
        output: "渠道效率评估表" },
      { title: "窗口敏感性", desc: "近1月 vs 近3月 LTV，偏离>30%标窗口敏感。",
        sql: "WITH ltv_1m AS (\n  SELECT channel_name AS channel_code, SUM(avg_platform_share)/NULLIF(COUNT(DISTINCT mac),0) AS ltv_1m\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 1 MONTH) AND :month_end GROUP BY channel_name\n),\nltv_3m AS (\n  SELECT channel_name AS channel_code, SUM(avg_platform_share)/NULLIF(COUNT(DISTINCT mac),0) AS ltv_3m\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND :month_end GROUP BY channel_name\n)\nSELECT a.channel_code, ROUND(a.ltv_1m,2) AS ltv_1m, ROUND(b.ltv_3m,2) AS ltv_3m,\n  ROUND(a.ltv_1m/NULLIF(b.ltv_3m,0),2) AS window_sensitivity\nFROM ltv_1m a JOIN ltv_3m b ON a.channel_code=b.channel_code\nORDER BY window_sensitivity ASC;",
        judge: "|window_sensitivity-1|>0.3 → 窗口敏感，结论仅供参考",
        output: "窗口敏感性表" },
      { title: "样本充足性（K19）", desc: "新客量门槛：<100不足；<500效力有限。",
        sql: "SELECT channel_code, SUM(new_user_cnt) AS new_users,\n  CASE WHEN SUM(new_user_cnt)<100 THEN '样本不足'\n       WHEN SUM(new_user_cnt)<500 THEN '样本偏少，结论效力有限'\n       ELSE '样本充足' END AS sample_flag\nFROM internet_analytics.dws_channel_new_user_1d\nWHERE stat_date BETWEEN :month_start AND :month_end\nGROUP BY channel_code;",
        judge: "样本不足渠道不进入预算决策",
        output: "样本充足性标注" },
    ],
    outputs: ["渠道效率评估表（LTV/CAC/评级/敏感性/样本）", "投放评级清单（加码/维持/收缩）", "评估结论三要素"],
    nextSteps: ["评级=加码且敏感性±30%内且样本充足 → 「投放预算分配优化」", "评级=收缩且连续2季度 → 「渠道组合优化」", "敏感性超±30% → 延长窗口后重评，不进入决策", "样本不足 → 延长试投，不进入预算决策"],
    dashboards: ["订购与分成", "order", "v_ltv", "v_channel_analysis"],
  },
  {
    id: "q20", layer: "l4", category: "实验评估类", title: "A/B 测试效果评估",
    desc: "最小样本量 + 分流有效性 + 两比例 z 检验 + 95% CI；禁止用「差异>2pct且样本>1000」拍脑袋显著", bizQuestion: "改版实验有没有效？能不能全量？",
    keywords: ["A/B", "实验", "显著性", "z检验", "置信区间", "MDE"],
    triggers: ["收银台 UI 改版上线", "launcher 引导策略 A/B 测试结束", "video 误触优化实验"],
    criteria: [
      { dim: "显著性", ok: "|z|>1.96 且 CI下界>0", warn: "接近边界", bad: "不显著或样本不足" },
      { dim: "分流", ok: "与设计比偏离≤5pct", warn: "接近5pct", bad: ">5pct 先查分流" },
    ],
    steps: [
      { title: "评估前置四件事", desc: "control=基线、treatment=评估组；确认无串组污染；指标/窗口/过滤一致；先算最小样本量再看是否达标。",
        output: "实验设计与功效声明" },
      { title: "最小样本量与分流有效性", desc: "两比例检验 n 公式（α=0.05,power=0.8）；检查流量占比与设计分流比。",
        sql: "SELECT compare_name, variant,\n  COUNT(DISTINCT mac) AS users,\n  ROUND(COUNT(DISTINCT mac)/SUM(COUNT(DISTINCT mac)) OVER (PARTITION BY compare_name)*100,2) AS traffic_share_pct\nFROM internet_analytics.v_ab_experiment\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY compare_name, variant;",
        judge: "与设计分流比偏离>5pct → 先查分流逻辑；样本未达最小量 → 不得下结论",
        output: "分流有效性 + 最小样本量核对" },
      { title: "实验组 vs 对照组 + z 检验", desc: "汇总 confirm/sample，输出绝对差与 z_score。",
        sql: "WITH agg AS (\n  SELECT compare_name, variant, SUM(sample_size) AS n, SUM(confirm_cnt) AS confirm\n  FROM internet_analytics.v_ab_experiment\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY compare_name, variant\n),\npivot AS (\n  SELECT compare_name,\n    MAX(CASE WHEN variant='control' THEN n END) AS n_ctrl,\n    MAX(CASE WHEN variant='control' THEN confirm END) AS x_ctrl,\n    MAX(CASE WHEN variant='treatment' THEN n END) AS n_trt,\n    MAX(CASE WHEN variant='treatment' THEN confirm END) AS x_trt\n  FROM agg GROUP BY compare_name\n)\nSELECT compare_name, n_ctrl, x_ctrl, ROUND(x_ctrl/NULLIF(n_ctrl,0)*100,2) AS cvr_ctrl_pct,\n  n_trt, x_trt, ROUND(x_trt/NULLIF(n_trt,0)*100,2) AS cvr_trt_pct,\n  ROUND((x_trt/NULLIF(n_trt,0)-x_ctrl/NULLIF(n_ctrl,0))*100,2) AS abs_diff_pct,\n  ROUND((x_trt/NULLIF(n_trt,0)-x_ctrl/NULLIF(n_ctrl,0))/SQRT(\n    (x_trt+x_ctrl)/NULLIF(n_trt+n_ctrl,0)*(1-(x_trt+x_ctrl)/NULLIF(n_trt+n_ctrl,0))*(1/NULLIF(n_trt,0)+1/NULLIF(n_ctrl,0))\n  ),2) AS z_score\nFROM pivot;",
        judge: "|z|>1.96 → 显著；≤1.96 → 不显著，不得下有效结论；须同时报效应量与样本量",
        output: "A/B 对比表（含z）" },
      { title: "95% 置信区间", desc: "两比例差 CI≈diff±1.96×SE；决策看 CI 下界是否仍有业务意义。",
        judge: "CI下界≤0 → 不能排除无效果；下界>0且业务增量达标 → 可全量",
        output: "95% CI + 全量/回滚建议" },
    ],
    outputs: ["A/B 对比表（样本量/CVR/绝对差/z/CI）", "分流有效性结论", "全量/回滚/延长建议"],
    nextSteps: ["p<0.05且CI下界>0且业务增量达标 → 全量发布", "p≥0.05或CI含0 → 「增长实验设计」重规划", "分流不通过 → 修复分流后重跑", "样本未达最小量 → 延长实验，不得下结论"],
    dashboards: ["商业化漏斗", "funnel", "v_ab_experiment"],
  },
  {
    id: "q21", layer: "l4", category: "产品效果类", title: "产品功能效果评估（内容）",
    desc: "参数化前后窗口；大盘对照算超额 VV；点播渗透按去重 MAC（禁止行数分母）", bizQuestion: "这次内容/功能改版效果好吗？该不该加推？",
    keywords: ["内容", "VV", "完播", "渗透", "超额变化", "DID"],
    triggers: ["新剧集上线后 7 日", "推荐算法调整后", "暑期档内容包发布"],
    criteria: [
      { dim: "超额 VV", ok: ">10%且完播未降", warn: ">0但完播降", bad: "≤0 不加推" },
      { dim: "渗透与超额", ok: "同向", warn: "接近", bad: "反方向挤占" },
    ],
    steps: [
      { title: "评估前置四件事", desc: "改版前同长度窗口作基线，优先 DID；须排除大盘季节性；完播口径(K13)前后一致；单剧集VV过低需合并题材。",
        output: "窗口/反事实/口径/样本声明" },
      { title: "目标剧集前后对比 + 大盘超额", desc: "分别算 pre/post 完播；excess=剧集增速-大盘增速。",
        sql: "WITH series_period AS (\n  SELECT s.series_id,\n    SUM(CASE WHEN s.snapshot_date BETWEEN :pre_start AND :pre_end THEN s.vv ELSE 0 END) AS vv_pre,\n    SUM(CASE WHEN s.snapshot_date BETWEEN :post_start AND :post_end THEN s.vv ELSE 0 END) AS vv_post,\n    SUM(CASE WHEN s.snapshot_date BETWEEN :pre_start AND :pre_end THEN s.finish_cnt ELSE 0 END) AS fin_pre,\n    SUM(CASE WHEN s.snapshot_date BETWEEN :post_start AND :post_end THEN s.finish_cnt ELSE 0 END) AS fin_post\n  FROM internet_analytics.dws_content_series_play_1d s\n  WHERE s.snapshot_date BETWEEN :pre_start AND :post_end\n  GROUP BY s.series_id\n),\nmarket AS (\n  SELECT SUM(CASE WHEN snapshot_date BETWEEN :pre_start AND :pre_end THEN vv ELSE 0 END) AS mkt_vv_pre,\n    SUM(CASE WHEN snapshot_date BETWEEN :post_start AND :post_end THEN vv ELSE 0 END) AS mkt_vv_post\n  FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN :pre_start AND :post_end\n)\nSELECT sp.series_id, se.series_name, sp.vv_pre, sp.vv_post,\n  ROUND((sp.vv_post-sp.vv_pre)/NULLIF(sp.vv_pre,0)*100,2) AS vv_change_pct,\n  ROUND(sp.fin_pre/NULLIF(sp.vv_pre,0)*100,2) AS finish_rate_pre_pct,\n  ROUND(sp.fin_post/NULLIF(sp.vv_post,0)*100,2) AS finish_rate_post_pct,\n  ROUND((sp.fin_post/NULLIF(sp.vv_post,0)-sp.fin_pre/NULLIF(sp.vv_pre,0))*100,2) AS finish_rate_diff_pct,\n  ROUND((m.mkt_vv_post-m.mkt_vv_pre)/NULLIF(m.mkt_vv_pre,0)*100,2) AS market_vv_change_pct,\n  ROUND(((sp.vv_post-sp.vv_pre)/NULLIF(sp.vv_pre,0)*100)-((m.mkt_vv_post-m.mkt_vv_pre)/NULLIF(m.mkt_vv_pre,0)*100),2) AS excess_vv_change_pct\nFROM series_period sp\nJOIN internet_analytics.dim_content_series se ON sp.series_id=se.series_id\nCROSS JOIN market m\nWHERE sp.vv_pre>0 OR sp.vv_post>0\nORDER BY sp.vv_post DESC LIMIT 50;",
        judge: "excess>0 → 跑赢大盘；≤0 → 不得归因改版；完播差<-3pct → 查内容/推荐",
        output: "内容效果评估表" },
      { title: "点播渗透（去重 MAC）", desc: "修正行数分母：按 MAC 月内是否点播活跃算渗透差。",
        sql: "WITH user_month AS (\n  SELECT mac,\n    MAX(CASE WHEN DATE_FORMAT(snapshot_date,'%Y-%m')=DATE_FORMAT(:pre_end,'%Y-%m') THEN is_vod_active ELSE 0 END) AS vod_pre,\n    MAX(CASE WHEN DATE_FORMAT(snapshot_date,'%Y-%m')=DATE_FORMAT(:post_end,'%Y-%m') THEN is_vod_active ELSE 0 END) AS vod_post\n  FROM internet_analytics.dws_act_user_active_1d\n  WHERE snapshot_date BETWEEN :pre_start AND :post_end\n  GROUP BY mac\n)\nSELECT ROUND(AVG(vod_pre)*100,2) AS vod_penetration_pre_pct,\n  ROUND(AVG(vod_post)*100,2) AS vod_penetration_post_pct,\n  ROUND((AVG(vod_post)-AVG(vod_pre))*100,2) AS vod_penetration_diff_pct\nFROM user_month;",
        judge: "渗透差与超额同向 → 整体正贡献；反方向 → 可能挤占其他内容",
        output: "点播渗透变化" },
    ],
    outputs: ["内容效果评估表（含大盘/超额）", "改版效应结论", "加推/调整建议"],
    nextSteps: ["excess>10%且完播未降 → 「产品优先级优化」加推", "excess>0但完播降>3pct → 「完播率异常诊断」", "excess≤0 → 不加推，排查大盘因素", "渗透与超额反方向 → 检查内容挤占"],
    dashboards: ["内容·剧集", "series", "点播活跃", "vod"],
  },
  {
    id: "q22", layer: "l4", category: "活动效果类", title: "活动 ROI 评估（订购分成）",
    desc: "ROI=增量分成/活动成本(K21)；反事实趋势外推拆增量；禁止把分成率当 ROI", bizQuestion: "这次活动 ROI 怎么样？下轮要不要继续做？",
    keywords: ["ROI", "活动", "增量分成", "反事实", "套餐"],
    triggers: ["暑期促销结束后", "连续包月优惠活动复盘", "月度分成结算前"],
    criteria: [
      { dim: "活动 ROI", ok: ">1.2 可放大", warn: "0.8–1.2 维持", bad: "<0.8 复盘" },
      { dim: "增量分成", ok: ">0", warn: "接近0", bad: "≤0 活动无效" },
    ],
    steps: [
      { title: "评估前置四件事", desc: "活动期 vs 基线期同长度；须增量拆分；revenue_share=平台分成；成本取 dwd_activity_cost_1d；订单<500标样本偏少。",
        output: "基线/反事实/口径/样本声明" },
      { title: "活动期 vs 基线期", desc: "参数化窗口；对比订单/分成/分成率（分成率≠ROI）。",
        sql: "WITH base AS (\n  SELECT SUM(order_cnt) AS orders, SUM(order_amount) AS amount, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN :base_start AND :base_end\n),\nact AS (\n  SELECT SUM(order_cnt) AS orders, SUM(order_amount) AS amount, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN :act_start AND :act_end\n)\nSELECT b.orders AS base_orders, a.orders AS act_orders,\n  ROUND((a.orders-b.orders)/NULLIF(b.orders,0)*100,2) AS orders_change_pct,\n  b.share AS base_share, a.share AS act_share,\n  ROUND((a.share-b.share)/NULLIF(b.share,0)*100,2) AS share_change_pct,\n  ROUND(b.share/NULLIF(b.amount,0)*100,2) AS base_share_rate_pct,\n  ROUND(a.share/NULLIF(a.amount,0)*100,2) AS act_share_rate_pct\nFROM base b CROSS JOIN act a;",
        judge: "订单增但分成未增 → 低分成套餐拉量；分成率降>2pct → 查套餐结构",
        output: "活动期 vs 基线对比表" },
      { title: "增量拆分（反事实趋势外推）", desc: "基线期拟合线性趋势外推活动期；incremental=实际-反事实。",
        sql: "WITH daily AS (\n  SELECT snapshot_date, SUM(order_cnt) AS orders, SUM(revenue_share) AS share,\n    DATEDIFF(snapshot_date, :base_start) AS t\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN :base_start AND :act_end\n  GROUP BY snapshot_date\n),\nfit AS (\n  SELECT\n    (AVG(t*orders)-AVG(t)*AVG(orders))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0) AS slope_orders,\n    AVG(orders)-((AVG(t*orders)-AVG(t)*AVG(orders))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*AVG(t) AS intercept_orders,\n    (AVG(t*share)-AVG(t)*AVG(share))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0) AS slope_share,\n    AVG(share)-((AVG(t*share)-AVG(t)*AVG(share))/NULLIF(AVG(t*t)-AVG(t)*AVG(t),0))*AVG(t) AS intercept_share\n  FROM daily WHERE snapshot_date BETWEEN :base_start AND :base_end\n)\nSELECT\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN orders ELSE 0 END),0) AS actual_orders,\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN (f.intercept_orders+f.slope_orders*t) ELSE 0 END),0) AS counterfactual_orders,\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN orders ELSE 0 END)\n    -SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN (f.intercept_orders+f.slope_orders*t) ELSE 0 END),0) AS incremental_orders,\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN share ELSE 0 END),0) AS actual_share,\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN (f.intercept_share+f.slope_share*t) ELSE 0 END),0) AS counterfactual_share,\n  ROUND(SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN share ELSE 0 END)\n    -SUM(CASE WHEN snapshot_date BETWEEN :act_start AND :act_end THEN (f.intercept_share+f.slope_share*t) ELSE 0 END),0) AS incremental_share\nFROM daily d CROSS JOIN fit f\nWHERE d.snapshot_date BETWEEN :act_start AND :act_end;",
        judge: "incremental_share≤0 → 无增量分成，活动无效",
        output: "增量订单/分成" },
      { title: "活动 ROI（增量分成/成本）", desc: "ROI=incremental_share/活动成本；成本表缺失则注明待补、不得硬下 ROI 结论。",
        sql: "SELECT SUM(cost_amount) AS total_cost\nFROM internet_analytics.dwd_activity_cost_1d\nWHERE stat_date BETWEEN :act_start AND :act_end AND activity_id=:activity_id;\n-- activity_roi = incremental_share / NULLIF(total_cost,0)",
        judge: "ROI<0.8 复盘；0.8–1.2 维持；>1.2 可放大",
        output: "活动 ROI" },
      { title: "套餐结构贡献（含基线）", desc: "活动期 vs 基线期按 pay_type 对比。",
        sql: "WITH base AS (\n  SELECT pay_type, SUM(order_cnt) AS orders, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN :base_start AND :base_end GROUP BY pay_type\n),\nact AS (\n  SELECT pay_type, SUM(order_cnt) AS orders, SUM(revenue_share) AS share\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN :act_start AND :act_end GROUP BY pay_type\n)\nSELECT a.pay_type, b.orders AS base_orders, a.orders AS act_orders,\n  ROUND((a.orders-b.orders)/NULLIF(b.orders,0)*100,2) AS orders_change_pct,\n  b.share AS base_share, a.share AS act_share,\n  ROUND((a.share-b.share)/NULLIF(b.share,0)*100,2) AS share_change_pct\nFROM act a LEFT JOIN base b ON a.pay_type=b.pay_type\nORDER BY a.orders DESC;",
        judge: "订单高但分成低 → 调优惠；分成显著正 → 加大该套餐推广",
        output: "套餐贡献对比" },
    ],
    outputs: ["活动 ROI 评估表", "套餐结构贡献对比", "评估结论三要素"],
    nextSteps: ["ROI<0.8且增量分成为正 → 「定价策略优化」", "ROI<0.8且增量分成≤0 → 下轮不做", "ROI>1.2且某套餐突出 → 加大该套餐推广", "反事实不可用 → 标评估效力有限，不进入决策"],
    dashboards: ["订购与分成", "order", "dws_trade_order_1d"],
  },
  {
    id: "q23", layer: "l4", category: "体验评估类", title: "用户满意度评估（完播/QoS 代理）",
    desc: "主指标加权完播(K13)；修正行为 SQL；联动 QoS；无相关性证据不得称满意度(K22)", bizQuestion: "用户满意度怎么样？体验在变好还是变差？",
    keywords: ["满意度", "完播率", "QoS", "卡顿", "代理有效性"],
    triggers: ["QoS 投诉上升", "完播率月环比下降", "NPS 调研前需数据支撑"],
    criteria: [
      { dim: "加权完播", ok: "≥45%且较基线未降>5pct", warn: "接近阈值", bad: "<45%或降>5pct" },
      { dim: "卡顿环比", ok: "平稳", warn: "升≈2pct", bad: ">2pct 且完播降" },
    ],
    steps: [
      { title: "评估前置四件事", desc: "近3月或上月作基线并声明；排除内容排期干扰；K22：无 NPS-完播相关性则只能称观看体验相关指标；须分题材看。",
        output: "基线/代理有效性声明" },
      { title: "加权完播 vs 基线", desc: "主指标=加权完播；非加权剧集均值仅参考。",
        sql: "WITH cur AS (\n  SELECT ROUND(SUM(finish_cnt)/NULLIF(SUM(vv),0)*100,2) AS weighted_finish_rate_pct,\n    ROUND(AVG(complete_rate_avg),2) AS avg_series_complete_rate, SUM(vv) AS total_vv\n  FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n),\nbase AS (\n  SELECT ROUND(SUM(finish_cnt)/NULLIF(SUM(vv),0)*100,2) AS baseline_weighted_finish_rate_pct\n  FROM internet_analytics.dws_content_series_play_1d\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n)\nSELECT c.weighted_finish_rate_pct, c.avg_series_complete_rate, c.total_vv,\n  b.baseline_weighted_finish_rate_pct,\n  ROUND(c.weighted_finish_rate_pct-b.baseline_weighted_finish_rate_pct,2) AS diff_pct\nFROM cur c CROSS JOIN base b;",
        judge: "加权完播<45%或diff<-5pct → 关注；加权与非加权差>10pct → 分剧集看",
        output: "满意度代理 KPI" },
      { title: "播放行为分布", desc: "查 dwd_vod_play_di 的 pause/seek/stop；表不存在则注明待补并跳过。",
        sql: "SELECT DATE_FORMAT(snapshot_date,'%Y-%m') AS ym,\n  SUM(CASE WHEN event_type='play' THEN 1 ELSE 0 END) AS play_cnt,\n  SUM(CASE WHEN event_type='pause' THEN 1 ELSE 0 END) AS pause_cnt,\n  SUM(CASE WHEN event_type='seek' THEN 1 ELSE 0 END) AS seek_cnt,\n  SUM(CASE WHEN event_type='stop' THEN 1 ELSE 0 END) AS stop_cnt,\n  ROUND(SUM(CASE WHEN event_type='pause' THEN 1 ELSE 0 END)/NULLIF(SUM(CASE WHEN event_type='play' THEN 1 ELSE 0 END),0),2) AS pause_per_play,\n  ROUND(SUM(CASE WHEN event_type='seek' THEN 1 ELSE 0 END)/NULLIF(SUM(CASE WHEN event_type='play' THEN 1 ELSE 0 END),0),2) AS seek_per_play,\n  ROUND(SUM(CASE WHEN event_type='stop' THEN 1 ELSE 0 END)/NULLIF(SUM(CASE WHEN event_type='play' THEN 1 ELSE 0 END),0),2) AS stop_per_play\nFROM internet_analytics.dwd_vod_play_di\nWHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND :month_end\nGROUP BY DATE_FORMAT(snapshot_date,'%Y-%m') ORDER BY ym;",
        judge: "pause/seek/stop per play 环比升>20% → 体验或流失前兆",
        output: "播放行为分布" },
      { title: "QoS 联动", desc: "若存在 dws_qos_play_quality_1d 则对比首帧/卡顿/失败率；否则注明无法区分内容/体验。",
        sql: "WITH cur AS (\n  SELECT ROUND(AVG(first_frame_ms),0) AS avg_first_frame_ms,\n    ROUND(AVG(stutter_rate_pct),2) AS avg_stutter_rate_pct,\n    ROUND(AVG(play_fail_rate_pct),2) AS avg_play_fail_rate_pct\n  FROM internet_analytics.dws_qos_play_quality_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n),\nbase AS (\n  SELECT ROUND(AVG(first_frame_ms),0) AS base_first_frame_ms,\n    ROUND(AVG(stutter_rate_pct),2) AS base_stutter_rate_pct,\n    ROUND(AVG(play_fail_rate_pct),2) AS base_play_fail_rate_pct\n  FROM internet_analytics.dws_qos_play_quality_1d\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n)\nSELECT c.avg_first_frame_ms, b.base_first_frame_ms,\n  ROUND(c.avg_first_frame_ms-b.base_first_frame_ms,0) AS diff_first_frame_ms,\n  c.avg_stutter_rate_pct, b.base_stutter_rate_pct,\n  ROUND(c.avg_stutter_rate_pct-b.base_stutter_rate_pct,2) AS diff_stutter_pct,\n  c.avg_play_fail_rate_pct, b.base_play_fail_rate_pct,\n  ROUND(c.avg_play_fail_rate_pct-b.base_play_fail_rate_pct,2) AS diff_play_fail_pct\nFROM cur c CROSS JOIN base b;",
        judge: "卡顿升>2pct且完播降 → QoS；首帧升>20% → 关注体验；QoS平稳完播降 → 转q13",
        output: "QoS diff" },
      { title: "代理有效性（K22）", desc: "有 NPS-完播相关性(如r>0.5)才可称满意度代理；否则改称观看体验相关指标。",
        output: "代理有效性说明" },
    ],
    outputs: ["满意度代理 KPI（加权完播+基线+diff）", "播放行为分布（若可用）", "QoS 三项+diff", "代理有效性说明", "体验改进优先级"],
    nextSteps: ["卡顿/首帧恶化且完播降 → 「完播与QoS」看板", "QoS平稳但完播降 → 「完播率异常诊断」", "pause/seek/stop环比升>20% → 播放行为专项排查", "无相关性证据 → 表述改为观看体验相关指标"],
    dashboards: ["完播与QoS", "quality", "内容·单集与行为", "episode"],
  },

  /* ===== L5 优化性 (5) · 对齐完善版（决策五原则/K23-K30/前置四件事/边际效率+方案集） ===== */
  /* L5 五原则：①有目标函数才优化；②有约束才可执行；③有方案集才叫选择；④有验证才闭环；⑤有风险与失效条件才完整。
     口径：K23目标函数；K24约束；K25边际效率；K26方案集；K27挽回ROI；K28优先级得分；K29价格弹性；K30验证与回滚。
     前置：目标函数 / 约束条件 / 方案集(≥2+维持现状) / 验证与回滚。资源分配必须用边际而非平均。 */
  {
    id: "q24", layer: "l5", category: "投放优化类", title: "投放预算分配优化（入口流量）",
    desc: "按 LTV/CAC 与边际 ROI 倾斜分配；约束下三方案对比，禁止用平均效率拍占比", bizQuestion: "预算应该怎么分配？加码哪个入口、收缩哪个、加多少？",
    keywords: ["预算", "分配", "边际ROI", "入口", "流量", "灰度"],
    triggers: ["季度预算调整", "某入口 LTV/CAC >3 需加码", "video 误触导致浪费"],
    criteria: [
      { dim: "边际 ROI", ok: ">1.5 可加码", warn: "1–1.5 小幅倾斜", bad: "<1 不加码" },
      { dim: "预期增量/成本", ok: ">1.5 可执行", warn: "接近1.5", bad: "<1.5 维持现状" },
    ],
    steps: [
      { title: "决策前置四件事", desc: "目标=最大化总增量分成或总LTV/CAC；约束=总预算/单入口上下限/依赖度≤60%；方案≥维持现状+边际倾斜+保守倾斜；验证=小流量灰度，回滚条件边际ROI<1。",
        output: "目标/约束/方案集/验证声明" },
      { title: "入口效率排序（补 CAC）", desc: "同窗口合并 v_ltv、成本、新客，按 LTV/CAC 排序。",
        sql: "WITH ltv AS (\n  SELECT channel_name AS channel_code, SUM(avg_platform_share) AS total_share, COUNT(DISTINCT mac) AS user_cnt\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY channel_name\n),\ncost AS (\n  SELECT channel_code, SUM(cost_amount) AS total_cost FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nnewu AS (\n  SELECT channel_code, SUM(new_user_cnt) AS new_users FROM internet_analytics.dws_channel_new_user_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n)\nSELECT l.channel_code, l.user_cnt, n.new_users,\n  ROUND(l.total_share/NULLIF(l.user_cnt,0),2) AS ltv_per_user,\n  ROUND(c.total_cost/NULLIF(n.new_users,0),2) AS cac,\n  ROUND((l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0),2) AS ltv_cac_ratio,\n  ROUND(c.total_cost/NULLIF(l.total_share,0),2) AS cost_to_share_ratio\nFROM ltv l\nLEFT JOIN cost c ON l.channel_code=c.channel_code\nLEFT JOIN newu n ON l.channel_code=n.channel_code\nORDER BY ltv_cac_ratio DESC;",
        output: "入口效率排序表" },
      { title: "边际效率估计（K25）", desc: "近6月分月花费/分成，用环比增量估 marginal_roi；分配用边际而非平均。",
        sql: "WITH monthly AS (\n  SELECT channel_code, DATE_FORMAT(stat_date,'%Y-%m') AS ym, SUM(cost_amount) AS cost\n  FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\n  GROUP BY channel_code, DATE_FORMAT(stat_date,'%Y-%m')\n),\nrev AS (\n  SELECT channel_name AS channel_code, DATE_FORMAT(snapshot_date,'%Y-%m') AS ym, SUM(avg_platform_share) AS share\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\n  GROUP BY channel_name, DATE_FORMAT(snapshot_date,'%Y-%m')\n),\njoined AS (\n  SELECT m.channel_code, m.ym, m.cost, r.share,\n    LAG(m.cost) OVER (PARTITION BY m.channel_code ORDER BY m.ym) AS prev_cost,\n    LAG(r.share) OVER (PARTITION BY m.channel_code ORDER BY m.ym) AS prev_share\n  FROM monthly m LEFT JOIN rev r ON m.channel_code=r.channel_code AND m.ym=r.ym\n)\nSELECT channel_code,\n  ROUND(AVG((share-prev_share)/NULLIF(cost-prev_cost,0)),2) AS marginal_roi_avg,\n  ROUND(AVG(share/NULLIF(cost,0)),2) AS avg_roi\nFROM joined WHERE prev_cost IS NOT NULL AND cost>prev_cost\nGROUP BY channel_code ORDER BY marginal_roi_avg DESC;",
        judge: "marginal_roi<1 → 不加码；明显低于avg_roi → 接近饱和；高于avg_roi → 仍有加码空间",
        output: "边际效率表" },
      { title: "预算分配算法（约束倾斜）", desc: "方案A维持现状；B按边际ROI权重分配并截断依赖度上限；C仅对边际ROI>1.5小幅加码。",
        sql: "SELECT touch_point, SUM(attributed_orders) AS orders,\n  ROUND(SUM(attributed_orders)/SUM(SUM(attributed_orders)) OVER()*100,2) AS current_share_pct,\n  ROUND(SUM(attributed_amount)/NULLIF(SUM(attributed_orders),0),2) AS avg_order_value\nFROM internet_analytics.v_channel_attribution\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY touch_point;",
        judge: "须满足单入口依赖度≤60%及预算上下限；预期增量分成=ΣΔ预算×边际ROI",
        output: "三方案对比 + 当前占比基线" },
      { title: "验证与回滚（K30）", desc: "方案B先10%流量灰度2–4周；边际ROI<1或CAC环比升>15% → 回滚方案A。",
        output: "灰度计划 + 回滚条件" },
    ],
    outputs: ["入口效率排序表", "边际效率表", "三方案对比（预算比例/预期增量/风险）", "推荐方案+验证+回滚"],
    nextSteps: ["预期增量/成本>1.5且验证通过 → 执行灰度", "灰度期边际ROI<1或CAC环比升>15% → 回滚方案A", "某入口LTV/CAC<1且边际ROI<1 → 「渠道组合优化」", "预期增量/成本<1.5 → 维持现状"],
    dashboards: ["订购与分成", "order", "商业化漏斗", "funnel"],
  },
  {
    id: "q25", layer: "l5", category: "用户挽回类", title: "用户挽回策略优化",
    desc: "RFM 最新快照分层；分层策略矩阵 + 挽回 ROI；分层对照验证，禁止无日期 COUNT 虚高", bizQuestion: "怎么挽回流失用户？挽回值不值？先挽回谁？",
    keywords: ["挽回", "RFM", "挽回ROI", "触达", "分层对照"],
    triggers: ["沉默用户占比 >20%", "churn_cnt 连续上升", "续订率下滑"],
    criteria: [
      { dim: "挽回 ROI", ok: ">1 可扩大", warn: "接近1", bad: "<1 不启动大规模" },
      { dim: "历史挽回成功率", ok: ">15% 优先", warn: "5–15%", bad: "<5% 低成本或放弃" },
    ],
    steps: [
      { title: "决策前置四件事", desc: "目标=最大化挽回增量留存价值或挽回ROI；约束=触达预算/频次/合规；方案≥不挽回+只高价值+分层全量；验证=分层随机对照。",
        output: "目标/约束/方案集/验证声明" },
      { title: "RFM 分层分布（补快照日期）", desc: "仅取最新 snapshot_date，COUNT DISTINCT mac。",
        sql: "SELECT rfm_segment, COUNT(DISTINCT mac) AS users,\n  ROUND(COUNT(DISTINCT mac)/SUM(COUNT(DISTINCT mac)) OVER()*100,2) AS share_pct,\n  ROUND(AVG(days_since_last_active),1) AS avg_days_since_active\nFROM internet_analytics.v_rfm\nWHERE snapshot_date=(SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\nGROUP BY rfm_segment ORDER BY users DESC;",
        output: "RFM 分层分布表" },
      { title: "分层策略 + 历史挽回成功率", desc: "高价值沉默→人工/权益；一般沉默→push；流失风险→内容推荐；用历史30日再激活率估 ROI。",
        sql: "WITH hist AS (\n  SELECT r.mac, r.rfm_segment,\n    MAX(CASE WHEN a.snapshot_date > r.snapshot_date THEN 1 ELSE 0 END) AS reactivated\n  FROM internet_analytics.v_rfm r\n  LEFT JOIN internet_analytics.dws_act_user_active_1d a\n    ON r.mac=a.mac AND a.snapshot_date BETWEEN r.snapshot_date + INTERVAL 1 DAY AND r.snapshot_date + INTERVAL 30 DAY\n  WHERE r.snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND DATE_SUB(:month_start, INTERVAL 1 DAY)\n  GROUP BY r.mac, r.rfm_segment\n)\nSELECT rfm_segment, COUNT(*) AS users, ROUND(AVG(reactivated)*100,2) AS reactivation_rate_pct\nFROM hist GROUP BY rfm_segment;",
        judge: "成功率<5% → 大概率ROI<1不大规模触达；>15% → 优先且可用更高成本",
        output: "分层策略矩阵 + 成功率" },
      { title: "分层人群清单", desc: "按分层输出名单与策略，上限由触达预算决定（禁止随意 LIMIT 100）。",
        sql: "SELECT mac AS user_id, rfm_segment, days_since_last_active,\n  CASE WHEN rfm_segment='高价值沉默' THEN '人工/权益召回'\n       WHEN rfm_segment='一般沉默' THEN 'push/短信'\n       WHEN rfm_segment='流失风险' THEN '内容推荐/push'\n       ELSE '低成本触达或放弃' END AS strategy\nFROM internet_analytics.v_rfm\nWHERE snapshot_date=(SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\n  AND rfm_segment IN ('高价值沉默','一般沉默','流失风险')\nORDER BY CASE rfm_segment WHEN '高价值沉默' THEN 1 WHEN '一般沉默' THEN 2 ELSE 3 END,\n  days_since_last_active DESC;",
        output: "分层人群清单" },
      { title: "挽回实验设计（K30）", desc: "层内随机触达 vs 不触达；观察30日增量留存/分成；退订升>5pct或投诉升>2pct立即停止。",
        output: "实验设计 + 回滚条件" },
    ],
    outputs: ["RFM 分层分布", "分层策略矩阵", "挽回 ROI 估算", "人群清单 + 实验设计"],
    nextSteps: ["某层挽回ROI>1且实验有效 → 扩大该层触达", "某层ROI<1 → 不启动或仅低成本", "触达后退订/投诉超阈值 → 立即停止", "L3预测下月流失升>20% → 扩大预算前先复核ROI"],
    dashboards: ["用户生命周期", "lifecycle", "v_rfm"],
  },
  {
    id: "q26", layer: "l5", category: "产品优先级类", title: "产品优先级优化",
    desc: "RICE/四象限 + 去重 MAC 渗透缺口 + 战略权重；三方案对比与验证闭环", bizQuestion: "先做哪个功能/内容？资源有限怎么取舍？",
    keywords: ["优先级", "RICE", "渗透缺口", "战略权重", "roadmap"],
    triggers: ["季度产品 roadmap 评审", "资源有限需取舍", "某功能渗透低但战略重要"],
    criteria: [
      { dim: "渗透缺口", ok: "缺口大且战略权重大", warn: "中等", bad: "缺口小或投入过高" },
      { dim: "预期增量/成本", ok: ">1.5", warn: "接近", bad: "<1.5 维持现状" },
    ],
    steps: [
      { title: "决策前置四件事", desc: "目标=单位投入增量价值(VV/完播/渗透×战略权重)；约束=人力/采购预算/上线窗；方案含维持现状；验证=内容用L4超额、功能用A/B。",
        output: "目标/约束/方案集/验证声明" },
      { title: "内容价值矩阵 + RICE 输入", desc: "VV/UV/加权完播/品类；RICE=(Reach×Impact×Confidence)/Effort。",
        sql: "SELECT s.series_id, se.series_name, g.genre_name,\n  SUM(s.vv) AS vv, SUM(s.uv) AS uv,\n  ROUND(SUM(s.finish_cnt)/NULLIF(SUM(s.vv),0)*100,2) AS weighted_finish_rate_pct,\n  ROUND(AVG(s.complete_rate_avg),2) AS avg_series_complete_rate\nFROM internet_analytics.dws_content_series_play_1d s\nJOIN internet_analytics.dim_content_series se ON s.series_id=se.series_id\nJOIN internet_analytics.dim_genre g ON s.genre_id=g.genre_id\nWHERE s.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY s.series_id, se.series_name, g.genre_name\nORDER BY vv DESC LIMIT 50;",
        judge: "高VV低完播→优化体验；低VV高完播→加推；双高→维持复用；双低→下架",
        output: "内容价值矩阵" },
      { title: "功能渗透缺口（去重 MAC）", desc: "禁止行数分母；按 MAC 月内 MAX 活跃标志算渗透。",
        sql: "WITH user_month AS (\n  SELECT mac, MAX(is_vod_active) AS is_vod_user, MAX(is_live_active) AS is_live_user,\n    MAX(is_only_launcher) AS is_only_launcher_user\n  FROM internet_analytics.dws_act_user_active_1d\n  WHERE snapshot_date BETWEEN :month_start AND :month_end\n  GROUP BY mac\n)\nSELECT COUNT(*) AS monthly_active_mac,\n  ROUND(SUM(is_vod_user)/COUNT(*)*100,2) AS vod_penetration_pct,\n  ROUND(SUM(is_live_user)/COUNT(*)*100,2) AS live_penetration_pct,\n  ROUND(SUM(is_only_launcher_user)/COUNT(*)*100,2) AS only_launcher_pct\nFROM user_month;",
        judge: "点播<70%/直播<38% → 功能缺口提优先级；only_launcher>35% → 优先引导开机到播放",
        output: "功能渗透缺口表" },
      { title: "功能 RICE + 战略权重（K28）", desc: "priority≈缺口×战略权重/人天；权重与投入由业务维表维护。",
        sql: "SELECT feature_name, penetration_pct, (benchmark_pct-penetration_pct) AS gap_pct,\n  strategic_weight, effort_person_days,\n  ROUND((benchmark_pct-penetration_pct)*strategic_weight/NULLIF(effort_person_days,0),2) AS priority_score\nFROM (\n  SELECT 'vod' AS feature_name, 0 AS penetration_pct, 80 AS benchmark_pct, 3 AS strategic_weight, 20 AS effort_person_days\n  UNION ALL SELECT 'live', 0, 40, 2, 15\n  UNION ALL SELECT 'launcher_guide', 0, 30, 3, 10\n) t;",
        output: "RICE/优先级得分表" },
      { title: "三方案对比与验证", desc: "A维持roadmap；B按RICE TopN；C战略优先；内容→L4 q21，功能→L4 q20。",
        output: "推荐方案 + 验证/回滚" },
    ],
    outputs: ["内容价值矩阵", "功能渗透缺口", "RICE打分表", "三方案对比与验证"],
    nextSteps: ["含内容加推且增量/成本>1.5 → 「产品功能效果评估」", "体验优化且完播低 → 「完播率异常诊断」", "缺口大且战略权重大 → 「A/B测试效果评估」", "RICE争议大 → 先小规模实验再排序"],
    dashboards: ["内容·剧集", "series", "点播活跃", "vod", "直播活跃", "live"],
  },
  {
    id: "q27", layer: "l5", category: "渠道组合类", title: "渠道组合优化",
    desc: "多触点协同 + LTV/CAC/D7/依赖度；分散依赖与收缩低效三方案，灰度验证", bizQuestion: "入口怎么组合最优？单入口依赖是否过高？",
    keywords: ["渠道组合", "协同", "依赖度", "LTV/CAC", "D7"],
    triggers: ["单入口依赖度过高", "多渠道触点需协同", "归因模型切换评估"],
    criteria: [
      { dim: "依赖度", ok: "≤60%", warn: "接近60%", bad: ">60% 触发分散" },
      { dim: "LTV/CAC×D7", ok: ">2且留存高", warn: "1–2", bad: "<1且留存低收缩" },
    ],
    steps: [
      { title: "决策前置四件事", desc: "目标=最大化总分成/组合LTV/CAC并控依赖度；约束=依赖度≤60%/保底预算/合同；方案≥维持+分散+收缩低效；验证=分地区灰度。",
        output: "目标/约束/方案集/验证声明" },
      { title: "入口贡献与协同", desc: "multi_touch vs single_touch 的 ARPU/人均订单。",
        sql: "WITH user_touch AS (\n  SELECT mac, COUNT(DISTINCT touch_point) AS touch_cnt,\n    MAX(CASE WHEN touch_point='launcher' THEN 1 ELSE 0 END) AS has_launcher,\n    MAX(CASE WHEN touch_point='video' THEN 1 ELSE 0 END) AS has_video\n  FROM internet_analytics.v_channel_attribution\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY mac\n),\nuser_order AS (\n  SELECT mac, SUM(attributed_amount) AS amount, SUM(attributed_orders) AS orders\n  FROM internet_analytics.v_channel_attribution\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY mac\n)\nSELECT CASE WHEN t.touch_cnt=1 THEN 'single_touch' ELSE 'multi_touch' END AS touch_group,\n  COUNT(DISTINCT t.mac) AS users,\n  ROUND(SUM(o.amount)/NULLIF(COUNT(DISTINCT t.mac),0),2) AS arpu,\n  ROUND(SUM(o.orders)/NULLIF(COUNT(DISTINCT t.mac),0),2) AS orders_per_user\nFROM user_touch t LEFT JOIN user_order o ON t.mac=o.mac\nGROUP BY CASE WHEN t.touch_cnt=1 THEN 'single_touch' ELSE 'multi_touch' END;",
        judge: "multi_touch ARPU高>20% → 有协同；≤single → 查归因口径",
        output: "协同分析表" },
      { title: "组合效率（补 CAC/D7/依赖度）", desc: "同窗口 LTV/CAC + D7 留存 + 分成依赖度。",
        sql: "WITH ltv AS (\n  SELECT channel_name AS channel_code, SUM(avg_platform_share) AS total_share, COUNT(DISTINCT mac) AS user_cnt\n  FROM internet_analytics.v_ltv\n  WHERE snapshot_date BETWEEN :month_start AND :month_end GROUP BY channel_name\n),\ncost AS (\n  SELECT channel_code, SUM(cost_amount) AS total_cost FROM internet_analytics.dwd_marketing_cost_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nnewu AS (\n  SELECT channel_code, SUM(new_user_cnt) AS new_users FROM internet_analytics.dws_channel_new_user_1d\n  WHERE stat_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n),\nretention AS (\n  SELECT channel_code, ROUND(AVG(CASE WHEN day_offset=7 THEN retention_rate END),2) AS d7_retention\n  FROM internet_analytics.v_user_retention\n  WHERE cohort_date BETWEEN :month_start AND :month_end GROUP BY channel_code\n)\nSELECT l.channel_code, l.user_cnt, n.new_users,\n  ROUND(l.total_share/NULLIF(l.user_cnt,0),2) AS ltv_per_user,\n  ROUND(c.total_cost/NULLIF(n.new_users,0),2) AS cac,\n  ROUND((l.total_share/NULLIF(l.user_cnt,0))/NULLIF(c.total_cost/NULLIF(n.new_users,0),0),2) AS ltv_cac_ratio,\n  r.d7_retention,\n  ROUND(l.total_share/SUM(l.total_share) OVER()*100,2) AS dependency_pct\nFROM ltv l\nLEFT JOIN cost c ON l.channel_code=c.channel_code\nLEFT JOIN newu n ON l.channel_code=n.channel_code\nLEFT JOIN retention r ON l.channel_code=r.channel_code\nORDER BY ltv_cac_ratio DESC;",
        judge: "LTV/CAC>2且D7高→加大；<1且D7低→收缩；dependency>60%→分散",
        output: "组合效率对比表" },
      { title: "组合方案 + 验证", desc: "A维持；B高依赖降10pct匀给次优；C低效入口降至保底；灰度4周，总分成降>10%或依赖仍>60%回滚。",
        output: "三方案对比 + 灰度/回滚" },
    ],
    outputs: ["协同分析表", "组合效率对比表", "三方案对比", "预期收益/风险/验证"],
    nextSteps: ["推荐方案预算落地 → 「投放预算分配优化」", "multi_touch ARPU高>20% → 组合投放实验(L4 q20)", "依赖仍>60%或总分成降>10% → 回滚重评", "归因存疑 → 工具箱「渠道归因分析」"],
    dashboards: ["订购与分成", "order", "v_channel_attribution", "v_ltv"],
  },
  {
    id: "q28", layer: "l5", category: "定价优化类", title: "定价策略优化",
    desc: "套餐结构风险 + 价格弹性系数 + 利润模型；必须 A/B，禁止只看客单趋势当弹性", bizQuestion: "套餐价格怎么定？结构怎么调？该不该降价/加权益？",
    keywords: ["定价", "弹性", "套餐", "毛利", "退订", "A/B"],
    triggers: ["客单下降或续订率下滑", "竞品定价调整", "新套餐上线评估"],
    criteria: [
      { dim: "退订率", ok: "≤15%", warn: "接近15%", bad: ">15% 需复盘" },
      { dim: "|弹性|", ok: ">1 可考虑降价拉量", warn: "≈1", bad: "<1 降价不划算→加权益" },
    ],
    steps: [
      { title: "决策前置四件事", desc: "目标=总收入或总利润(分成-内容成本-让利)；约束=最低价/成本率/竞品带/退订上限；方案≥维持现价+降价X%+加权益不降价；验证必须A/B。",
        output: "目标/约束/方案集/验证声明" },
      { title: "套餐结构分析", desc: "补收入占比/结构风险；参数化窗口。",
        sql: "SELECT pay_type, SUM(order_cnt) AS orders, SUM(unsub_cnt) AS unsub,\n  ROUND(SUM(order_amount),0) AS amount, ROUND(SUM(revenue_share),0) AS share,\n  ROUND(SUM(order_amount)/NULLIF(SUM(order_cnt),0),2) AS avg_price,\n  ROUND(SUM(unsub_cnt)/NULLIF(SUM(order_cnt),0)*100,2) AS unsub_rate_pct,\n  ROUND(SUM(revenue_share)/SUM(SUM(revenue_share)) OVER()*100,2) AS share_contribution_pct\nFROM internet_analytics.dws_trade_order_1d\nWHERE src_type<>'ALL' AND snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY pay_type ORDER BY orders DESC;",
        judge: "收入占比>50%→结构风险；退订>15%→复盘；均价降>10%且订单未升→降价未拉量",
        output: "套餐结构表" },
      { title: "价格弹性估计（K29）", desc: "elasticity=订购量变化率/价格变化率；仅取价格变动>5%时点。",
        sql: "WITH price_change AS (\n  SELECT pay_type, snapshot_date, SUM(order_cnt) AS orders,\n    SUM(order_amount)/NULLIF(SUM(order_cnt),0) AS avg_price\n  FROM internet_analytics.dws_trade_order_1d\n  WHERE src_type<>'ALL' AND snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 12 MONTH) AND :month_end\n  GROUP BY pay_type, snapshot_date\n),\nlagged AS (\n  SELECT pay_type, snapshot_date, orders, avg_price,\n    LAG(orders) OVER (PARTITION BY pay_type ORDER BY snapshot_date) AS prev_orders,\n    LAG(avg_price) OVER (PARTITION BY pay_type ORDER BY snapshot_date) AS prev_price\n  FROM price_change\n)\nSELECT pay_type,\n  ROUND(AVG((orders-prev_orders)/NULLIF(prev_orders,0)/NULLIF((avg_price-prev_price)/NULLIF(prev_price,0),0)),2) AS elasticity\nFROM lagged\nWHERE prev_price IS NOT NULL AND ABS((avg_price-prev_price)/NULLIF(prev_price,0))>0.05\nGROUP BY pay_type;",
        judge: "|e|>1 → 降价能拉量但需算收入；|e|<1 → 降价不划算；e>0 → 数据异常排查",
        output: "价格弹性表" },
      { title: "套餐利润模型", desc: "毛利≈分成×(1-内容成本率)；成本率来自业务维表 dim_pay_type_cost。",
        sql: "SELECT o.pay_type, SUM(o.revenue_share) AS revenue_share, SUM(o.order_amount) AS order_amount,\n  ROUND(SUM(o.revenue_share)/NULLIF(SUM(o.order_amount),0)*100,2) AS share_rate_pct,\n  MAX(c.content_cost_rate_pct) AS content_cost_rate_pct,\n  ROUND(SUM(o.revenue_share)*(1-MAX(c.content_cost_rate_pct)/100),0) AS gross_profit\nFROM internet_analytics.dws_trade_order_1d o\nLEFT JOIN internet_analytics.dim_pay_type_cost c ON o.pay_type=c.pay_type\nWHERE o.src_type<>'ALL' AND o.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY o.pay_type ORDER BY gross_profit DESC;",
        judge: "毛利占比低订单高→低利润拉量需上调或降权益；毛利高订单少→可加大推广",
        output: "套餐利润模型" },
      { title: "定价方案 + A/B（K30）", desc: "A维持；B对|e|>1降价；C对|e|<1加权益不降价；必须A/B；退订升>5pct或毛利降>10%回滚。",
        output: "三方案对比 + A/B与回滚" },
    ],
    outputs: ["套餐结构表", "价格弹性表", "利润模型", "三方案对比 + A/B验证"],
    nextSteps: ["推荐方案进A/B → 「A/B测试效果评估」", "预期收入变化 → 「分成收入预测」", "退订升>5pct或毛利降>10% → 回滚重评", "结构风险>50% → 设计套餐分散方案"],
    dashboards: ["订购与分成", "order", "dws_trade_order_1d"],
  },
];


window.ANALYSIS_TOOLBOX = {
  layerTitle: "第六层 · 分析工具箱",
  layerQuestion: "用什么方法？",
  intro: "L6 是按方法组织的工具库（15 法），挂靠 L1–L5 场景使用：选方法→冻结口径→执行 SQL→对照量化标准→因果结论须 ab/experiment-design 验证；资源分配须结合 marginal-roi。每种方法含教材体 + 可执行 SQL + 量化判断 + 常见误用。示例数据仅作演示，非业务基准。",
  usageRules: "①因果问题优先 ab/experiment-design；②资源分配必须用边际 ROI；③输出附口径脚注+截止日+样本量；④观察方法不能单独证因果；⑤示例数据非真实基准。",
  decisionTree: "用户是谁→persona→segment/rfm；哪一步走了→funnel→path/retention；转化低→funnel+path→ab；渠道值不值→ltv+scorecard→marginal-roi/attribution；活动有没有效→ab→attribution；加投多少→marginal-roi→scorecard；谁快流失→churn→rfm/lifecycle；增长卡在哪→northstar→funnel/retention。",
  comboTips: "渠道评估：ltv+channel-scorecard+marginal-roi；转化诊断：funnel+path+ab；流失挽回：churn+rfm+experiment-design；增长归因：northstar+attribution+ab。",
  categories: [
    { id: "portrait", name: "用户理解", methods: [
      { id: "persona", title: "用户画像分析", aliases: "用户画像 / 人口属性 / 端型地市分布",
        aliases: "用户画像 / 人口属性 / 端型地市分布",

        explain: "按端型（STB/Speaker）、地市、设备型号等维度交叉分析用户规模与行为特征，识别核心人群。",

        what: "用户画像分析按端型、地市、设备等属性交叉描述用户是谁、规模多大、行为偏好如何。 也叫人口属性分析、端型地市分布分析，是运营与投放前的基础描述方法。",

        when: "适用：内容、运营、投放策略制定前，需要回答「核心用户是谁」。 不适用：关键维度缺失、样本偏差极大，或隐私合规不允许使用某些属性时。",

        purpose: "让策略对准真实主力用户与潜力人群，避免为「平均用户」设计产品和活动，提高触达与内容匹配效率。",

        how: "①选定画像维度与活跃口径并冻结（活跃口径 K01：当日有开机或播放的 MAC）。②拉活跃快照做交叉统计并对账总量（分端型之和 vs 全局去重，差额为跨端用户）。③比较各人群渗透、贡献与关键行为。④定义核心/潜力人群包与排除规则。⑤同步给运营与投放系统。⑥按月跟踪人群结构变化并复盘策略是否仍匹配。",

        definition: "用户画像分析按端型、地市、设备等属性交叉描述用户是谁、规模多大、行为偏好如何。 也叫人口属性分析、端型地市分布分析，是运营与投放前的基础描述方法。",

        principle: "用可解释的维度组合刻画主力人群，比较不同人群的渗透、贡献与行为差异，形成可运营的人群定义。 读表重点看：谁贡献最大、谁渗透最低、结构是否在漂移。",

        applicable: "适用：内容、运营、投放策略制定前，需要回答「核心用户是谁」。 不适用：关键维度缺失、样本偏差极大，或隐私合规不允许使用某些属性时。",

        steps: "①选定画像维度与活跃口径并冻结（活跃口径 K01：当日有开机或播放的 MAC）。②拉活跃快照做交叉统计并对账总量（分端型之和 vs 全局去重，差额为跨端用户）。③比较各人群渗透、贡献与关键行为。④定义核心/潜力人群包与排除规则。⑤同步给运营与投放系统。⑥按月跟踪人群结构变化并复盘策略是否仍匹配。",

        outputsAndPitfalls: "输出物：画像交叉表、核心人群定义、策略含义。 常见误区：维度过多无法执行；把设备分布直接当兴趣偏好；口径变更却不重刷历史。",

        vsOtherMethods: "和 segment 比：画像偏描述属性，分群偏策略分层与动作。 和 rfm 比：RFM 偏价值行为近况，画像偏人口/端属性。 和帕累托比：可对人群贡献再做帕累托，决定先服务哪类人。",

        boundaries: "隐私与合规限制某些属性。端型或地市口径变更会导致历史不可比。 样本若偏某一渠道导入，画像会系统性偏离真实大盘。",

        businessQuestion: "我们的核心 OTT 用户是谁？广深占比多少？谁更愿意付费？",

        portfolio: "（示例值，非真实基准）2026-07 示例：STB 占 MAU 约 62%，Speaker 约 38%；广州+深圳合计约 48%； 点播渗透率 STB 约 72% vs Speaker 约 54%。见 v_user_portrait 与活跃总览看板。",

        servesLayers: "L1 描述、L2 诊断、L5 分群",

        sql: "-- 参数：:month_start, :month_end\nSELECT device_type,\n       city_tier,\n       COUNT(DISTINCT mac)                                   AS active_mac_cnt,\n       ROUND(COUNT(DISTINCT mac) / SUM(COUNT(DISTINCT mac)) OVER() * 100, 2) AS share_pct,\n       ROUND(COUNT(DISTINCT mac) / NULLIF(SUM(COUNT(DISTINCT mac)) OVER (PARTITION BY device_type), 0) * 100, 2) AS within_device_share_pct\nFROM internet_analytics.v_user_portrait\nGROUP BY device_type, city_tier\nORDER BY active_mac_cnt DESC;\n\n-- 核心城占比校验（广深是否仍为基本盘）\nSELECT IFNULL(r.region_name, '未知') AS region_name,\n       COUNT(DISTINCT a.mac) AS uv,\n       ROUND(COUNT(DISTINCT a.mac) / SUM(COUNT(DISTINCT a.mac)) OVER() * 100, 2) AS share_pct\nFROM internet_analytics.dws_act_user_active_1d a\nLEFT JOIN internet_analytics.dim_region r ON a.region_id = r.region_id\nWHERE a.snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY IFNULL(r.region_name, '未知')\nORDER BY uv DESC;",

        judgeCriteria: "- 核心地市（广深）合计占比 <40% → 需单列说明，检查是否\"未知\"地市稀释； - 某端型或地市渗透率低于大盘 10pct 以上 → 列为潜力人群； - 各维度分项之和与全局去重差 >5% → 跨端用户占比高，端型归属需谨慎解释。",

        misuseScenes: "- 只看分端型之和，不做全局去重对账，导致 MAU 虚高； - 用画像结论直接指导投放，未先确认该人群在 v_channel_attribution 中的入口归属。",

        chartType: "pareto",
        data: {"labels": ["STB·广州", "STB·深圳", "Speaker·广州", "STB·其他", "Speaker·其他"], "values": [1280, 960, 720, 860, 1180], "cumulative": [26, 45, 59, 76, 100]}},
      { id: "lifecycle", title: "生命周期分析", aliases: "生命周期 / 五阶段 / 用户旅程",
        aliases: "生命周期 / 五阶段 / 用户旅程",

        explain: "将用户划分为新注册→激活→活跃→沉默→流失五阶段，跟踪各阶段规模与迁移率，识别增长瓶颈。",

        what: "生命周期分析把用户划入新注册→激活→活跃→沉默→流失等阶段，观察各阶段规模、净增与迁移。 也叫五阶段/用户旅程状态分析，用于定位增长卡点。",

        when: "适用：净增转负、激活变差、沉默池堆积，需要匹配阶段动作。 不适用：阶段规则未统一或频繁改口径，导致结构不可比时。",

        purpose: "定位增长瓶颈所处阶段，并为拉新、激活、促活、挽回匹配不同动作与成功指标。",

        how: "①书面定义各阶段规则与统计日（沉默=连续 N 天无活跃，流失=连续 M 天无活跃，N<M，K14）。②统计阶段人数、占比与净增。③观察关键迁移（激活→活跃、活跃→沉默等）。④对瓶颈阶段制定策略与负责人。⑤纳入看板日/周跟踪。⑥复盘策略后阶段结构是否改善。",

        definition: "生命周期分析把用户划入新注册→激活→活跃→沉默→流失等阶段，观察各阶段规模、净增与迁移。 也叫五阶段/用户旅程状态分析，用于定位增长卡点。",

        principle: "阶段规则定义「人在哪」；迁移与净增说明增长卡在拉新、激活还是挽回。 读图先看结构占比，再看净增与阶段间流转，避免把沉默与流失混用。",

        applicable: "适用：净增转负、激活变差、沉默池堆积，需要匹配阶段动作。 不适用：阶段规则未统一或频繁改口径，导致结构不可比时。",

        steps: "①书面定义各阶段规则与统计日（沉默=连续 N 天无活跃，流失=连续 M 天无活跃，N<M，K14）。②统计阶段人数、占比与净增。③观察关键迁移（激活→活跃、活跃→沉默等）。④对瓶颈阶段制定策略与负责人。⑤纳入看板日/周跟踪。⑥复盘策略后阶段结构是否改善。",

        outputsAndPitfalls: "输出物：阶段结构表、迁移说明、阶段策略。 常见误区：规则朝令夕改；把沉默当流失；只看存量不看净增与流转。",

        vsOtherMethods: "和 retention 比：留存看回访曲线，生命周期看状态库存。 和 churn 比：预警偏个体打分，生命周期偏整体结构。 和 segment 比：生命周期是状态框架，分群可在阶段内再切。",

        boundaries: "跨端 ID 不通会造成重复计数。规则过严或过松会扭曲阶段占比。 活动日会短暂抬高激活，需与日常基线分开看。",

        businessQuestion: "用户处在哪个生命周期阶段？净增为什么转负？",

        portfolio: "（示例值，非真实基准）2026-07 示例：日激活约 85 人，沉默约 1,240 人，周 churn 约 32 人；approx_net_growth 近 7 日均值为正。 见 v_lifecycle 与用户生命周期看板。",

        servesLayers: "L1 描述、L2 诊断、L3 预测",

        sql: "-- 参数：:month_start, :month_end\nSELECT DATE_FORMAT(snapshot_date, '%Y-%m') AS ym,\n       AVG(new_register)      AS avg_new_register,\n       AVG(new_activate)      AS avg_new_activate,\n       AVG(silent_cnt)        AS avg_silent,\n       AVG(churn_cnt)         AS avg_churn,\n       AVG(active_users)      AS avg_active_users,\n       AVG(approx_net_growth) AS avg_net_growth\nFROM internet_analytics.v_lifecycle\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY DATE_FORMAT(snapshot_date, '%Y-%m')\nORDER BY ym;\n\n-- 阶段结构（最新快照）\nSELECT segment_name, user_count,\n       ROUND(user_count / SUM(user_count) OVER() * 100, 2) AS share_pct,\n       ROUND(AVG(avg_days_since_active), 1) AS avg_days_since_active\nFROM internet_analytics.v_user_segment\nWHERE snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_user_segment)\nGROUP BY segment_name, user_count\nORDER BY user_count DESC;",

        judgeCriteria: "- approx_net_growth 连续 7 日 <0 → 标注生命周期异常（需先确认 approx 口径）； - 沉默占比环比升 >5pct → 阶段结构恶化，联动 churn/rfm； - 某阶段人数周环比波动 >15% → 检查阶段规则是否被临时活动扭曲。",

        misuseScenes: "- 用活动期数据算阶段结构，把活动拉新误当自然激活； - 阶段规则未写入文档就下\"沉默池扩大\"结论。",

        chartType: "funnel",
        data: {"steps": [{"name": "新注册", "value": 520, "rate": 100}, {"name": "激活", "value": 390, "rate": 75}, {"name": "活跃留存", "value": 280, "rate": 54}, {"name": "深度活跃", "value": 160, "rate": 31}]}},
      { id: "segment", title: "用户分群分析", aliases: "分群 / 用户分层 / 状态分群",
        aliases: "分群 / 用户分层 / 状态分群",

        explain: "按活跃状态、端型、行为标签等维度将用户划分为可运营的分群，配套差异化策略。",

        what: "用户分群把用户按状态、价值或行为分成可运营群组，并配套差异化策略与成功指标。 也叫用户分层、状态分群；目标是可执行，而不是仅有聚类标签。",

        when: "适用：运营资源有限，需要差别触达与预算分配。 不适用：人群切得过碎无法运营，或触达系统无法按群投放时。",

        purpose: "提高触达效率与 ROI，把有限运营资源投到最值得的人群，并能量化每群效果。",

        how: "①选定分群规则（状态/价值/行为）并冻结口径。②计算各群规模、价值与成本。③为每群编写策略与成功指标。④落地到触达系统并记录曝光。⑤复盘转化与成本。⑥按月迭代分群边界，合并无效细群。",

        definition: "用户分群把用户按状态、价值或行为分成可运营群组，并配套差异化策略与成功指标。 也叫用户分层、状态分群；目标是可执行，而不是仅有聚类标签。",

        principle: "好的分群每群都有：规模、价值、策略、成功指标与复盘节奏。 先保证运营系统能按群触达，再追求精细；过碎的群无法闭环。",

        applicable: "适用：运营资源有限，需要差别触达与预算分配。 不适用：人群切得过碎无法运营，或触达系统无法按群投放时。",

        steps: "①选定分群规则（状态/价值/行为）并冻结口径。②计算各群规模、价值与成本。③为每群编写策略与成功指标。④落地到触达系统并记录曝光。⑤复盘转化与成本。⑥按月迭代分群边界，合并无效细群。",

        outputsAndPitfalls: "输出物：分群字典、策略表、效果复盘。 常见误区：分群过细；有标签无策略；不复盘导致群定义腐化。",

        vsOtherMethods: "和 persona 比：分群重动作与资源分配。 和 rfm 比：RFM 是一种常用分群框架。 和 lifecycle 比：生命周期给阶段骨架，分群在阶段内再切运营包。",

        boundaries: "策略系统无法按群投放时，分群无法闭环。 规则依赖的标签延迟过大，会导致触达名单过时。",

        businessQuestion: "哪些用户群值得重点运营？各群规模多大？",

        portfolio: "（示例值，非真实基准）2026-07 示例快照：活跃 / 沉默 / 流失三群规模约 4,200 / 1,240 / 560；双端用户约 10%。 见 v_user_segment 与设备流转看板。",

        servesLayers: "L1 描述、L5 优化",

        sql: "-- 参数：:month_start, :month_end\nSELECT s.segment_name,\n       COUNT(DISTINCT s.mac) AS users,\n       ROUND(COUNT(DISTINCT s.mac) / SUM(COUNT(DISTINCT s.mac)) OVER() * 100, 2) AS share_pct,\n       ROUND(AVG(s.avg_days_since_active), 1) AS avg_days_since_active,\n       -- 关联价值（近 3 月分成），用于判断\"哪群值得投\"\n       ROUND(SUM(l.share_3m) / NULLIF(COUNT(DISTINCT s.mac), 0), 2) AS arpu_share_3m\nFROM internet_analytics.v_user_segment s\nLEFT JOIN (\n    SELECT mac, SUM(avg_platform_share) AS share_3m\n    FROM internet_analytics.v_ltv\n    WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 3 MONTH) AND :month_end\n    GROUP BY mac\n) l ON s.mac = l.mac\nWHERE s.snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_user_segment)\nGROUP BY s.segment_name\nORDER BY users DESC;",

        judgeCriteria: "- 某分群规模 <总活跃 1% → 过碎，合并或放弃； - 某分群 arpu_share_3m 高于大盘 2 倍且规模 >5% → 高价值优先运营； - 某分群规模 >30% 且 arpu_share_3m 低于大盘 50% → 低效人群，控制触达成本。",

        misuseScenes: "- 分群后不做效果复盘，导致群定义半年后已不匹配业务； - 分群只按属性切（端型/地市），不结合价值（arpu），无法指导预算。 ================================================================================ 本文件结束（第 1 部分） ================================================================================ 文件名：L6_第2部分_增长分析5法.txt ================================================================================ 互联网行业 · 分析方法论 · 第六层（分析工具箱）· 完善版 · 第 2 部分 ================================================================================ 本文件内容：分类二「增长分析」5 法（retention / rfm / funnel / ltv / northstar） ================================================================================ ================================================================================ 分类二 · 增长分析 · 5 法 ================================================================================",

        chartType: "abc-table",
        data: {"rows": [{"item": "双端高活", "share": 10, "cls": "A", "policy": "会员权益 · 专属内容"}, {"item": "STB 活跃", "share": 52, "cls": "A", "policy": "点播加推 · 日触达"}, {"item": "Speaker 活跃", "share": 20, "cls": "B", "policy": "场景化推荐"}, {"item": "沉默可挽回", "share": 12, "cls": "B", "policy": "内容券 · 分批 push"}, {"item": "流失长尾", "share": 6, "cls": "C", "policy": "月审视 · 低成本触达"}]}},
    ]},
    { id: "growth", name: "增长分析", methods: [
      { id: "retention", title: "留存分析", aliases: "留存 / 同期群 / Cohort / N日留存",
        aliases: "留存 / 同期群 / Cohort / N日留存",

        explain: "按首次活跃日期分组，跟踪各 cohort 在 D1/D7/D30 的留存曲线，评估获客质量变化。",

        what: "留存分析按首次活跃批次跟踪用户在后续第 N 日是否回访，评估获客质量与产品粘性。 也叫同期群留存、N 日留存；常用 D1/D7/D30 窗口。",

        when: "适用：拉新多但活跃不稳、改版后看长期质量。 不适用：没有首次活跃日期，或关键窗口尚未结束就下正式结论时。",

        purpose: "判断是「进来就走」还是「留下来」，并指导获客结构与体验改进优先级。",

        how: "①定义首活、回访口径与窗口并冻结。②生成 cohort 曲线或热力图。③比较关键窗口并拆端型/渠道。④定位掉队节点与差批次。⑤形成获客或体验改进动作。⑥改后复盘留存是否抬升。",

        definition: "留存分析按首次活跃批次跟踪用户在后续第 N 日是否回访，评估获客质量与产品粘性。 也叫同期群留存、N 日留存；常用 D1/D7/D30 窗口。",

        principle: "用 cohort 留存曲线或热力图比较不同批次质量；再拆端型/渠道解释差异，定位掉队节点。 比较时必须确认窗口已成熟，避免半截曲线误判。",

        applicable: "适用：拉新多但活跃不稳、改版后看长期质量。 不适用：没有首次活跃日期，或关键窗口尚未结束就下正式结论时。",

        steps: "①定义首活、回访口径与窗口并冻结。②生成 cohort 曲线或热力图。③比较关键窗口并拆端型/渠道。④定位掉队节点与差批次。⑤形成获客或体验改进动作。⑥改后复盘留存是否抬升。",

        outputsAndPitfalls: "输出物：留存曲线/热力图、对比结论、改进建议。 常见误区：窗口未满比较；口径中途变更；把季节波动当成产品效果。",

        vsOtherMethods: "和 lifecycle 比：留存看回访曲线，生命周期看状态库存。 和 funnel 比：漏斗是当次转化链，留存是跨日回访。 和 ltv 比：留存是行为粘性，LTV 是货币化结果。",

        boundaries: "强季节、版本强干扰时需对照实验或差分。跨端身份未打通会造成假留存或假流失。",

        businessQuestion: "新用户留得住吗？哪批 cohort 质量更好？",

        portfolio: "（示例值，非真实基准）2026-07 示例：某注册 cohort 的 D1 / D7 / D30 留存约 38% / 22% / 14%； STB 的 D7 约 25% vs Speaker 约 16%。见 v_user_retention 与用户留存看板。",

        servesLayers: "L2 诊断、L3 预测、L4 评估",

        sql: "-- 参数：:cohort_start, :cohort_end\n-- 留存矩阵（cohort × day_offset × 渠道）\nSELECT cohort_date, day_offset, channel_code,\n       COUNT(DISTINCT mac) AS cohort_users,\n       ROUND(AVG(retention_rate), 4) AS avg_retention_rate\nFROM internet_analytics.v_user_retention\nWHERE cohort_date BETWEEN :cohort_start AND :cohort_end\n  AND day_offset IN (1, 7, 14, 30)\nGROUP BY cohort_date, day_offset, channel_code\nORDER BY cohort_date, day_offset, channel_code;\n\n-- 端型 × 窗口对比（定位哪端掉队）\nSELECT retention_bucket, device_type,\n       ROUND(AVG(retention_rate), 4) AS avg_rate,\n       COUNT(*) AS sample_cnt\nFROM internet_analytics.v_retention_decomposition\nWHERE cohort_date BETWEEN :cohort_start AND :cohort_end\nGROUP BY retention_bucket, device_type\nORDER BY retention_bucket, device_type;",

        judgeCriteria: "- 当期 D7 留存 vs 近 3 月同渠道基线差 < -5pct → 异常（继承 L2 q08）； - 单端型 D7 留存低于另一端点 >10pct → 端型问题嫌疑； - cohort 样本 <500 的批次结论标\"样本偏少\"，不单独下结论。",

        misuseScenes: "- 用未成熟 cohort 的 D30 与成熟 cohort 直接对比； - 未区分新客/老客 cohort，整体留存率受结构变化干扰（L2 q08 已强调）。",

        chartType: "cohort-heatmap",
        data: {"months": ["D1", "D7", "D14", "D30"], "cohorts": ["07-01 批", "07-08 批", "07-15 批", "07-22 批"], "values": [[42, 26, 18, 14], [40, 24, 17, 13], [38, 22, 16, 12], [36, 20, 15, 11]]}},
      { id: "rfm", title: "RFM 分层分析", aliases: "RFM / 最近频次金额 / 价值分层",
        aliases: "RFM / 最近频次金额 / 价值分层",

        explain: "以最近活跃（R）、使用频次（F）、订购金额（M）三维将用户分为高价值/潜力/流失风险等层级。",

        what: "RFM 用最近活跃（R）、频次（F）、金额（M）三维给用户分层，区分高价值、潜力与流失风险人群。 是精准运营与挽回的常用价值分层框架。",

        when: "适用：精准运营、挽回、会员分层。 不适用：几乎无交易或行为金额、三维指标大量缺失时。",

        purpose: "把运营动作对准价值与风险，提高续订/点播/挽回效率，避免对所有人同一套话术。",

        how: "①定义 R/F/M 口径与观察窗。②计算并分箱，合成层级。③统计各层规模与价值。④为每层定策略与成功指标。⑤落地触达并记录。⑥回测效果，调整分箱或策略。",

        definition: "RFM 用最近活跃（R）、频次（F）、金额（M）三维给用户分层，区分高价值、潜力与流失风险人群。 是精准运营与挽回的常用价值分层框架。",

        principle: "先对 R/F/M 分箱，再合成层级并匹配运营动作；分层要能落到触达名单，并持续回测转化与误伤。 淡旺季会改变 R 的含义，宜用相对分位或分季节阈值。",

        applicable: "适用：精准运营、挽回、会员分层。 不适用：几乎无交易或行为金额、三维指标大量缺失时。",

        steps: "①定义 R/F/M 口径与观察窗。②计算并分箱，合成层级。③统计各层规模与价值。④为每层定策略与成功指标。⑤落地触达并记录。⑥回测效果，调整分箱或策略。",

        outputsAndPitfalls: "输出物：分层表、触达名单、回测报告。 常见误区：分层过复杂无法运营；只分层不触达；阈值从不随季节调整。",

        vsOtherMethods: "和 ltv 比：RFM 是近况分层，LTV 是长期价值估计。 和 churn 比：可共用信号，目标分别是分层运营与即时预警。 和 segment 比：RFM 是一种标准化分群框架。",

        boundaries: "业务淡旺季会改变 R 的含义。金额口径含退订/退款未处理时，高价值层会失真。",

        businessQuestion: "谁值得重点运营？谁需要挽回？",

        portfolio: "（示例值，非真实基准）2026-07 示例：高价值活跃约 8%，流失风险约 22%； 优先对\"沉默 >30 天且历史点播 >10 次\"的用户 push 挽回。见 v_rfm。",

        servesLayers: "L2 诊断、L5 挽回",

        sql: "-- 参数：:as_of（最新快照日）\n-- 分层规模与价值（必须带快照日期，避免日快照 COUNT 虚高）\nSELECT r.rfm_segment,\n       COUNT(DISTINCT r.mac) AS users,\n       ROUND(COUNT(DISTINCT r.mac) / SUM(COUNT(DISTINCT r.mac)) OVER() * 100, 2) AS share_pct,\n       ROUND(AVG(r.days_since_last_active), 1) AS avg_recency_days,\n       ROUND(SUM(l.share_3m) / NULLIF(COUNT(DISTINCT r.mac), 0), 2) AS arpu_share_3m\nFROM internet_analytics.v_rfm r\nLEFT JOIN (\n    SELECT mac, SUM(avg_platform_share) AS share_3m\n    FROM internet_analytics.v_ltv\n    WHERE snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 3 MONTH) AND :as_of\n    GROUP BY mac\n) l ON r.mac = l.mac\nWHERE r.snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\nGROUP BY r.rfm_segment\nORDER BY users DESC;",

        judgeCriteria: "- 高价值层规模 <5% 且 arpu_share_3m 高于大盘 2 倍 → 优先保护； - 流失风险层规模 >20% 且环比升 >5pct → 启动挽回评估（q25）； - 分层阈值需按季节/大盘分位校准，不得固定用绝对天数。",

        misuseScenes: "- v_rfm 无快照日期过滤，把历史所有快照都算进去，用户数严重虚高（L2 q11 同一错误）； - 分层后直接全量触达，无对照，无法判断挽回是否有效（应走 experiment-design）。",

        chartType: "abc-table",
        data: {"rows": [{"item": "高价值活跃", "share": 8, "cls": "A", "policy": "专属运营 · 续订关怀"}, {"item": "潜力成长", "share": 18, "cls": "B", "policy": "内容加推 · 套餐引导"}, {"item": "一般活跃", "share": 36, "cls": "B", "policy": "常规触达"}, {"item": "流失风险", "share": 22, "cls": "C", "policy": "优先挽回"}, {"item": "低活长尾", "share": 16, "cls": "C", "policy": "低成本维系"}]}},
      { id: "funnel", title: "漏斗分析", aliases: "转化漏斗 / 收银台漏斗 / 步骤流失",
        aliases: "转化漏斗 / 收银台漏斗 / 步骤流失",

        explain: "将曝光→点击→验证→确认绘制为漏斗，分析各步骤留存率与流失率，识别转化瓶颈。",

        what: "漏斗分析把用户或订单路径拆成有序步骤，计算每步转化率与流失率，找出流失最严重的环节。 OTT 场景常用于曝光→点击→验证→确认订购的收银台链路。",

        when: "适用：转化链路长且整体转化不达标。 不适用：步骤定义混乱、跨端口径不一致，或关键步骤不可观测时。",

        purpose: "把优化与实验火力对准流失最大的一步，而不是平均优化整条链路。",

        how: "①定义步骤与进入规则并冻结窗口。②统计各步人数并对账。③计算转化与流失（率+量）。④按入口/端型拆解瓶颈。⑤对瓶颈步立项改造或 A/B。⑥对比改后漏斗，确认瓶颈是否下移。",

        definition: "漏斗分析把用户或订单路径拆成有序步骤，计算每步转化率与流失率，找出流失最严重的环节。 OTT 场景常用于曝光→点击→验证→确认订购的收银台链路。",

        principle: "步骤必须有序且口径一致。核心看步间转化与流失绝对量，定位瓶颈步，再按入口/端型拆解是否局部问题。 既看比率也看基数，避免误判小流量步骤。",

        applicable: "适用：转化链路长且整体转化不达标。 不适用：步骤定义混乱、跨端口径不一致，或关键步骤不可观测时。",

        steps: "①定义步骤与进入规则并冻结窗口。②统计各步人数并对账。③计算转化与流失（率+量）。④按入口/端型拆解瓶颈。⑤对瓶颈步立项改造或 A/B。⑥对比改后漏斗，确认瓶颈是否下移。",

        outputsAndPitfalls: "输出物：漏斗图、瓶颈说明、拆维表、实验结论。 常见误区：步骤跳跃统计；只看转化率不看基数；改完不复测。",

        vsOtherMethods: "和 path 比：漏斗是聚合步骤，路径看序列细节。 和 ab 比：漏斗找问题步骤，实验验证改法。 和 retention 比：留存看时间回访，漏斗看当次转化链。",

        boundaries: "支付等外部步骤不可控时，瓶颈可能无法被产品侧单独修复。 归因窗口不同会导致漏斗不可比。",

        businessQuestion: "从曝光到订购，哪一步流失最多？",

        portfolio: "（示例值，非真实基准）2026-07 示例收银台：launcher 曝光→点击约 25%、点击→验证约 80%、验证→确认约 20%； video 点击→验证约 45%（误触偏高）。见 v_funnel 与商业化漏斗看板。",

        servesLayers: "L2 诊断、L4 评估",

        sql: "-- 参数：:month_start, :month_end\nWITH cur AS (\n    SELECT src_type,\n           SUM(expose_cnt)   AS expose,\n           SUM(click_cnt)    AS click,\n           SUM(verify_cnt)   AS verify,\n           SUM(purchase_cnt) AS purchase\n    FROM internet_analytics.dws_trade_cashier_funnel_1d\n    WHERE device_type = 'ALL'\n      AND snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY src_type\n)\nSELECT src_type, expose, click, verify, purchase,\n       ROUND(click   / NULLIF(expose, 0)   * 100, 2) AS expose2click_pct,\n       ROUND(verify  / NULLIF(click, 0)    * 100, 2) AS click2verify_pct,\n       ROUND(purchase/ NULLIF(verify, 0)   * 100, 2) AS verify2purchase_pct,\n       ROUND(purchase/ NULLIF(expose, 0)   * 100, 2) AS expose2purchase_pct,\n       (click - verify)    AS click_to_verify_lost,\n       (verify - purchase) AS verify_to_purchase_lost\nFROM cur\nORDER BY click_to_verify_lost DESC;",

        judgeCriteria: "- 某步流失量（绝对数）最大且该步转化率低于基线 >3pct → 该步为瓶颈（继承 L2 q10）； - 某步基数 <100 → 比率不稳定，不单独下结论； - 瓶颈步改后，该步转化率提升且下游未恶化 → 瓶颈下移，进入下一步优化。",

        misuseScenes: "- 用 v_funnel（visit/signup/activate/purchase）回答\"点击→验证\"问题，字段对不上（L2 q10 已修正）； - 只报转化率不报流失绝对量，导致优化了基数很小的步骤。",

        chartType: "funnel",
        data: {"steps": [{"name": "Launcher 曝光", "value": 12800, "rate": 100}, {"name": "点击", "value": 3200, "rate": 25}, {"name": "验证", "value": 2560, "rate": 20}, {"name": "确认订购", "value": 512, "rate": 4}]}},
      { id: "ltv", title: "LTV 分析", aliases: "LTV / 终身价值 / LTV/CAC / ARPU",
        aliases: "LTV / 终身价值 / LTV/CAC / ARPU",

        explain: "估算用户在整个生命周期内的订购金额与分成贡献，并与获客成本（CAC）对比评估长期 ROI。",

        what: "LTV 估算用户在生命周期内的订购/分成贡献，并常与获客成本 CAC 比较是否回本。 也叫终身价值分析；常用 LTV/CAC 作为渠道与定价尺子。",

        when: "适用：渠道质量、定价、会员策略评估。 不适用：生命周期过短不可观测，或 CAC 无法归集时。",

        purpose: "避免只看短期转化忽略长期价值，支持渠道取舍、预算与定价决策。",

        how: "①定义生命周期、收入口径与 CAC 口径（K10/K11）。②分入口/套餐估计 LTV。③计算 LTV/CAC 并设内部基准。④对低比值渠道收缩，对高价值加码。⑤滚动更新估计。⑥复盘实际回本是否符合预测。",

        definition: "LTV 估算用户在生命周期内的订购/分成贡献，并常与获客成本 CAC 比较是否回本。 也叫终身价值分析；常用 LTV/CAC 作为渠道与定价尺子。",

        principle: "按入口、套餐或端型估计生命周期贡献，明确观测期与收入口径，再计算 LTV/CAC。 观测期不够时只能称「早期 LTV」，不能当成熟结论。",

        applicable: "适用：渠道质量、定价、会员策略评估。 不适用：生命周期过短不可观测，或 CAC 无法归集时。",

        steps: "①定义生命周期、收入口径与 CAC 口径（K10/K11）。②分入口/套餐估计 LTV。③计算 LTV/CAC 并设内部基准。④对低比值渠道收缩，对高价值加码。⑤滚动更新估计。⑥复盘实际回本是否符合预测。",

        outputsAndPitfalls: "输出物：LTV 表、LTV/CAC、渠道建议。 常见误区：观测期不够当成熟 LTV；CAC 口径不全；忽略退订与退款。",

        vsOtherMethods: "和 ROI 比：ROI 常短周期活动，LTV 更长。 和 retention 比：留存是行为粘性，LTV 是货币化结果。 和 channel-scorecard 比：LTV/CAC 是核心维度之一，评分卡还含留存与体验。",

        boundaries: "退订高、续费模式变化时，历史 LTV 不能外推。 渠道归因变化会使 CAC 与 LTV 匹配错位。",

        businessQuestion: "用户长期值多少钱？投放回本了吗？",

        portfolio: "（示例值，非真实基准）2026-07 示例：launcher LTV 约 15.2 元、CAC 约 8.5 元（LTV/CAC≈1.8）； video LTV 约 12.8 元、CAC 约 11.2 元（LTV/CAC≈1.1）。见 v_ltv 与 v_channel_analysis。",

        servesLayers: "L3 预测、L4 评估、L5 优化",

        sql: "-- 参数：:month_start, :month_end（LTV 与 CAC 必须同窗口）\nWITH ltv AS (\n    SELECT channel_name AS channel_code,\n           SUM(avg_platform_share) AS total_share,\n           COUNT(DISTINCT mac)     AS user_cnt\n    FROM internet_analytics.v_ltv\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY channel_name\n),\ncost AS (\n    SELECT channel_code, SUM(cost_amount) AS total_cost\n    FROM internet_analytics.dwd_marketing_cost_1d\n    WHERE stat_date BETWEEN :month_start AND :month_end\n    GROUP BY channel_code\n),\nnewu AS (\n    SELECT channel_code, SUM(new_user_cnt) AS new_users\n    FROM internet_analytics.dws_channel_new_user_1d\n    WHERE stat_date BETWEEN :month_start AND :month_end\n    GROUP BY channel_code\n)\nSELECT l.channel_code,\n       l.user_cnt,\n       n.new_users,\n       ROUND(l.total_share / NULLIF(l.user_cnt, 0), 2) AS ltv_per_user,\n       ROUND(c.total_cost / NULLIF(n.new_users, 0), 2) AS cac,\n       ROUND((l.total_share / NULLIF(l.user_cnt, 0))\n             / NULLIF(c.total_cost / NULLIF(n.new_users, 0), 0), 2) AS ltv_cac_ratio\nFROM ltv l\nLEFT JOIN cost c ON l.channel_code = c.channel_code\nLEFT JOIN newu n ON l.channel_code = n.channel_code\nORDER BY ltv_cac_ratio DESC;",

        judgeCriteria: "- LTV/CAC <1 → 收缩；1–3 → 维持；>3 → 加码（继承 L2 q12、L4 q19）； - 观测期 <3 个月 → 只能称\"早期 LTV\"，不得用于最终加码决策； - 样本新客 <100 → 标\"样本不足\"，不进入预算决策。",

        misuseScenes: "- 用 platform_share_amount / order_users 冒充 CAC（L2 q09 已修正）； - 不同窗口的 LTV 与 CAC 直接相除，比率无意义。",

        chartType: "roi-bar",
        data: {"barName": "LTV/CAC", "lineName": "目标线", "yName": "LTV/CAC", "items": [{"name": "launcher", "roi": 1.8, "bench": 1.5}, {"name": "video", "roi": 1.1, "bench": 1.5}, {"name": "搜索", "roi": 1.6, "bench": 1.5}, {"name": "活动页", "roi": 1.3, "bench": 1.5}]}},
      { id: "northstar", title: "北极星指标拆解", aliases: "北极星 / 指标拆解 / OKR 树",
        aliases: "北极星 / 指标拆解 / OKR 树",

        explain: "将核心北极星指标（如有效 MAU）拆解为 DAU、端型渗透、功能使用、留存等子指标，定位驱动因素。",

        what: "北极星指标拆解把核心指标拆成可管理的子指标树，定位增长驱动与拖累，并映射到团队责任。 也叫指标树、OKR 拆解，用于对齐目标与例会管理。",

        when: "适用：北极星波动且团队对驱动说法不一。 不适用：北极星定义本身仍有争议、尚未冻结时。",

        purpose: "把增长目标对齐到可执行子指标与责任人，减少例会上空泛争论「大盘不好」。",

        how: "①确认并冻结北极星定义（如有效 MAU = 月内至少 1 天有开机或播放的去重 MAC）。②画出拆解树与勾稽关系。③量化各分支贡献与变化。④找出主驱动与主拖累。⑤纳入例会与负责人。⑥业务模式变化时复审拆解是否仍成立。",

        definition: "北极星指标拆解把核心指标拆成可管理的子指标树，定位增长驱动与拖累，并映射到团队责任。 也叫指标树、OKR 拆解，用于对齐目标与例会管理。",

        principle: "用乘法或加法关系把北极星拆到团队可负责的子指标，并量化各分支贡献。 拆解深度以「能管、能复盘」为限，过深会失去管理意义。",

        applicable: "适用：北极星波动且团队对驱动说法不一。 不适用：北极星定义本身仍有争议、尚未冻结时。",

        steps: "①确认并冻结北极星定义（如有效 MAU = 月内至少 1 天有开机或播放的去重 MAC）。②画出拆解树与勾稽关系。③量化各分支贡献与变化。④找出主驱动与主拖累。⑤纳入例会与负责人。⑥业务模式变化时复审拆解是否仍成立。",

        outputsAndPitfalls: "输出物：指标树、责任矩阵、例会解读口径。 常见误区：拆解过深无法管理；不可加总的指标硬加；有树无责任人。",

        vsOtherMethods: "和 attribution 比：归因解释一次变化贡献，北极星拆解是常态管理体系。 和下钻比：下钻偏一次性诊断，拆解偏持续管理。 和帕累托比：可对拖累因子再做帕累托排优先级。",

        boundaries: "业务模式变化后旧拆解会失效，需重构。子指标若不可周更，树会变成墙面装饰。",

        businessQuestion: "有效 MAU 怎么拆？增长靠哪个子指标？",

        portfolio: "（示例值，非真实基准）2026-07 示例：有效 MAU 约 4,800（STB + Speaker 分端型之和需与全局去重对账）； 驱动指标：点播渗透、直播渗透、只开机占比（需压降）。见 v_dau_overview 与活跃总览看板。",

        servesLayers: "L1 描述、L5 目标对齐",

        sql: "-- 参数：:month_start, :month_end\n-- 有效 MAU 拆解：端型 × 功能渗透\nWITH user_month AS (\n    SELECT mac,\n           MAX(device_type) AS device_type,\n           MAX(is_vod_active)    AS is_vod_user,\n           MAX(is_live_active)   AS is_live_user,\n           MAX(is_only_launcher) AS is_only_launcher_user\n    FROM internet_analytics.dws_act_user_active_1d\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY mac\n)\nSELECT device_type,\n       COUNT(*) AS effective_mau,\n       ROUND(SUM(is_vod_user)          / COUNT(*) * 100, 2) AS vod_penetration_pct,\n       ROUND(SUM(is_live_user)         / COUNT(*) * 100, 2) AS live_penetration_pct,\n       ROUND(SUM(is_only_launcher_user)/ COUNT(*) * 100, 2) AS only_launcher_pct\nFROM user_month\nGROUP BY device_type\nUNION ALL\nSELECT '合计（全局去重）',\n       COUNT(*),\n       ROUND(SUM(is_vod_user)          / COUNT(*) * 100, 2),\n       ROUND(SUM(is_live_user)         / COUNT(*) * 100, 2),\n       ROUND(SUM(is_only_launcher_user)/ COUNT(*) * 100, 2)\nFROM user_month;",

        judgeCriteria: "- 某分支对北极星变化的贡献 >50% → 该分支为主驱动/主拖累，例会优先讨论； - 子指标无法周更 → 该分支从指标树中移除或改为月更； - 分端型之和与全局去重差 >5% → 跨端用户占比高，拆解需注明。",

        misuseScenes: "- 用行数分母（COUNT(*)）算渗透率，得到的是\"活跃天数中点播天数占比\"而非用户渗透率（L1 q04 已修正）； - 北极星定义未冻结就开始拆解，各团队各算各的。 ================================================================================ 本文件结束（第 2 部分） ================================================================================ 文件名：L6_第3部分_归因实验与运营优化及总结.txt ================================================================================ 互联网行业 · 分析方法论 · 第六层（分析工具箱）· 完善版 · 第 3 部分 ================================================================================ 本文件内容：分类三「归因与实验」3 法（attribution / ab / experiment-design） + 分类四「运营优化」4 法（churn / marginal-roi / channel-scorecard / path） + 跨方法通用规则 + 总结表 + 方法索引 ================================================================================ ================================================================================ 分类三 · 归因与实验 · 3 法 ================================================================================",

        chartType: "pareto",
        data: {"labels": ["STB 贡献", "Speaker 贡献", "直播渗透", "搜索转化"], "values": [3100, 1700, 800, 400], "cumulative": [52, 80, 93, 100]}},
    ]},
    { id: "attribution", name: "归因与实验", methods: [
      { id: "attribution", title: "渠道归因分析", aliases: "归因 / 末次点击 / 线性归因 / 时间衰减",
        aliases: "归因 / 末次点击 / 线性归因 / 时间衰减",

        explain: "将订购转化归功于 launcher/video 等入口触点，支持末次点击、线性分配、时间衰减等多种归因模型。",

        what: "渠道归因分析将转化结果归到 launcher/video 等入口触点，支持末次点击、线性、时间衰减等模型， 量化「订购分别由谁带来」。用于入口预算与复盘解释。",

        when: "适用：多入口共同影响订购，需要解释贡献并调预算。 不适用：只有单触点，或触点日志缺失无法建模时。",

        purpose: "把订购变化解释到入口，支持针对性加投、优化或收缩，而不是凭感觉争功。",

        how: "①选定归因模型、窗口与总指标。②清洗触点与转化并对账。③输出各入口贡献表/图。④对比多模型差异并标注风险。⑤对头部入口继续看质量（留存/LTV）。⑥沉淀月报口径，下期同规则复盘。",

        definition: "渠道归因分析将转化结果归到 launcher/video 等入口触点，支持末次点击、线性、时间衰减等模型， 量化「订购分别由谁带来」。用于入口预算与复盘解释。",

        principle: "先固定模型与窗口，再把转化分配到触点并比较模型差异。 关键是触点定义不重叠、口径一致；单一末次归因会系统性低估辅助入口。",

        applicable: "适用：多入口共同影响订购，需要解释贡献并调预算。 不适用：只有单触点，或触点日志缺失无法建模时。",

        steps: "①选定归因模型、窗口与总指标。②清洗触点与转化并对账。③输出各入口贡献表/图。④对比多模型差异并标注风险。⑤对头部入口继续看质量（留存/LTV）。⑥沉淀月报口径，下期同规则复盘。",

        outputsAndPitfalls: "输出物：归因贡献表、模型说明、预算建议。 常见误区：只信末次点击；窗口乱改；把归因当唯一真相忽略体验问题。",

        vsOtherMethods: "和 RCA 比：归因给贡献结构，RCA 追机制原因。 和 channel-scorecard 比：归因看贡献量，评分卡看综合质量。 和 ab 比：归因偏观察，实验偏因果。",

        boundaries: "多触点旅程很长时，简单规则归因偏差大。活动叠加热点未剥离会被事件主导。 口径变更当期不宜严格对比。",

        businessQuestion: "这笔订购应该归功于哪个入口？",

        portfolio: "（示例值，非真实基准）2026-07 示例末次归因：launcher 约 62% 订购、video 约 38%； 线性模型 launcher 约 58%。见 v_channel_attribution。",

        servesLayers: "L2 诊断、L4 评估、L5 预算",

        sql: "-- 参数：:month_start, :month_end\n-- 多模型对比：末次 vs 线性（同一批数据）\nWITH touch AS (\n    SELECT mac, touch_point, attribution_model,\n           SUM(attributed_orders) AS orders,\n           SUM(attributed_amount) AS amount,\n           SUM(attributed_revenue_share) AS share\n    FROM internet_analytics.v_channel_attribution\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY mac, touch_point, attribution_model\n)\nSELECT touch_point, attribution_model,\n       SUM(orders) AS orders,\n       ROUND(SUM(orders) / SUM(SUM(orders)) OVER (PARTITION BY attribution_model) * 100, 2) AS order_share_pct,\n       ROUND(SUM(share), 0) AS share_amount\nFROM touch\nGROUP BY touch_point, attribution_model\nORDER BY attribution_model, orders DESC;\n\n-- 归因稳定性：各入口在不同模型下的份额差异\nSELECT touch_point,\n       MAX(CASE WHEN attribution_model = 'last_click' THEN order_share_pct END) AS last_click_share_pct,\n       MAX(CASE WHEN attribution_model = 'linear'     THEN order_share_pct END) AS linear_share_pct,\n       ROUND(MAX(CASE WHEN attribution_model = 'last_click' THEN order_share_pct END)\n           - MAX(CASE WHEN attribution_model = 'linear'     THEN order_share_pct END), 2) AS model_gap_pct\nFROM (\n    SELECT touch_point, attribution_model,\n           ROUND(SUM(attributed_orders) / SUM(SUM(attributed_orders)) OVER (PARTITION BY attribution_model) * 100, 2) AS order_share_pct\n    FROM internet_analytics.v_channel_attribution\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY touch_point, attribution_model\n) t\nGROUP BY touch_point\nORDER BY model_gap_pct DESC;",

        judgeCriteria: "- 某入口末次 vs 线性份额差 >15pct → 该入口被单一模型系统性高估/低估，需在报告中并列说明； - 多触点用户占比 >30% → 简单末次归因偏差大，必须做多模型对比； - 归因口径变更当期 → 不与历史严格对比，只做同期横向对比。",

        misuseScenes: "- 只用末次点击做预算决策，导致辅助入口被砍，长期转化下降； - 归因窗口与 LTV/CAC 窗口不一致，贡献与效率对不上。",

        chartType: "pareto",
        data: {"labels": ["launcher", "video", "搜索", "活动页", "其他"], "values": [320, 196, 88, 52, 28], "cumulative": [47, 75, 88, 95, 100]}},
      { id: "ab", title: "A/B 测试分析", aliases: "A/B 测试 / 实验 / 显著性检验",
        aliases: "A/B 测试 / 实验 / 显著性检验",

        explain: "对比实验组与对照组的核心指标（CTR/CVR/留存），通过样本量与 p 值判断改版是否显著有效。",

        what: "A/B 测试通过随机分组对比实验组与对照组，用统计显著性与业务成功线判断改动是否有效。 也叫对照实验、显著性检验，是上线前的因果验证手段。",

        when: "适用：改版准备全量前要证据。 不适用：无法随机分流、样本量明显不足，或强网络效应导致组间污染时。",

        purpose: "降低错误全量风险，用可审计的证据决定是否推广改动。",

        how: "①写假设、核心指标、护栏与成功线。②估算样本与周期。③完成分流与埋点校验。④按计划分析效果与显著性。⑤决策全量/迭代/回滚。⑥沉淀实验档案供复用。",

        definition: "A/B 测试通过随机分组对比实验组与对照组，用统计显著性与业务成功线判断改动是否有效。 也叫对照实验、显著性检验，是上线前的因果验证手段。",

        principle: "随机化提高因果解释力；需足够样本、预注册核心指标与成功标准，并设置护栏指标， 再决定全量、迭代或回滚。",

        applicable: "适用：改版准备全量前要证据。 不适用：无法随机分流、样本量明显不足，或强网络效应导致组间污染时。",

        steps: "①写假设、核心指标、护栏与成功线。②估算样本与周期。③完成分流与埋点校验。④按计划分析效果与显著性。⑤决策全量/迭代/回滚。⑥沉淀实验档案供复用。",

        outputsAndPitfalls: "输出物：实验报告、决策与档案。 常见误区：偷看数据提前停；指标过多；无护栏导致体验劣化却当成功。",

        vsOtherMethods: "和 attribution 比：实验因果更强。 和 funnel 比：漏斗找问题步骤，A/B 验证解法。 和 experiment-design 比：设计是开跑前功课，A/B 是执行与判定。",

        boundaries: "分流被污染、季节强干扰或样本量不足时结论不可靠。 多重比较未校正会抬高假阳性。",

        businessQuestion: "收银台改版有没有效？能否全量？",

        portfolio: "（示例值，非真实基准）launcher 引导实验示例：treatment CVR 约 18.2% vs control 约 15.8%（+2.4pct，样本约 3,200，p<0.05）， 建议全量。见 v_ab_experiment。",

        servesLayers: "L4 评估、L5 验证",

        sql: "-- 参数：:month_start, :month_end\n-- 分组汇总 + 两比例 z 检验\nWITH agg AS (\n    SELECT compare_name, variant,\n           SUM(sample_size) AS n,\n           SUM(confirm_cnt) AS confirm\n    FROM internet_analytics.v_ab_experiment\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n    GROUP BY compare_name, variant\n),\npivot AS (\n    SELECT compare_name,\n           MAX(CASE WHEN variant = 'control'   THEN n END)       AS n_ctrl,\n           MAX(CASE WHEN variant = 'control'   THEN confirm END) AS x_ctrl,\n           MAX(CASE WHEN variant = 'treatment' THEN n END)       AS n_trt,\n           MAX(CASE WHEN variant = 'treatment' THEN confirm END) AS x_trt\n    FROM agg\n    GROUP BY compare_name\n)\nSELECT compare_name,\n       n_ctrl, x_ctrl, ROUND(x_ctrl / NULLIF(n_ctrl,0) * 100, 2) AS cvr_ctrl_pct,\n       n_trt,  x_trt,  ROUND(x_trt  / NULLIF(n_trt,0)  * 100, 2) AS cvr_trt_pct,\n       ROUND((x_trt/NULLIF(n_trt,0) - x_ctrl/NULLIF(n_ctrl,0)) * 100, 2) AS abs_diff_pct,\n       ROUND(\n         (x_trt/NULLIF(n_trt,0) - x_ctrl/NULLIF(n_ctrl,0))\n         / SQRT(\n             (x_trt + x_ctrl) / NULLIF(n_trt + n_ctrl, 0)\n             * (1 - (x_trt + x_ctrl) / NULLIF(n_trt + n_ctrl, 0))\n             * (1/NULLIF(n_trt,0) + 1/NULLIF(n_ctrl,0))\n           ), 2) AS z_score\nFROM pivot;\n\n-- 分流有效性检查\nSELECT compare_name, variant,\n       COUNT(DISTINCT mac) AS users,\n       ROUND(COUNT(DISTINCT mac) / SUM(COUNT(DISTINCT mac)) OVER (PARTITION BY compare_name) * 100, 2) AS traffic_share_pct\nFROM internet_analytics.v_ab_experiment\nWHERE snapshot_date BETWEEN :month_start AND :month_end\nGROUP BY compare_name, variant;",

        judgeCriteria: "- |z_score| >1.96 → p<0.05，差异显著；≤1.96 → 不显著，不得下\"有效\"结论； - 分流占比与设计比偏离 >5pct → 分流可能有偏，先查分流逻辑； - 样本未达最小样本量（按 MDE 计算）→ 结论标\"样本不足\"。",

        misuseScenes: "- 只报\"CVR 提升 2pct\"不报样本量与 p 值，结论不可审计； - 无护栏指标，转化升但退订也升，全量后整体变差。",

        chartType: "roi-bar",
        data: {"barName": "CVR%", "lineName": "对照基线", "yName": "CVR %", "items": [{"name": "对照组", "roi": 15.8, "bench": 15.8}, {"name": "实验组", "roi": 18.2, "bench": 15.8}]}},
      { id: "experiment-design", title: "增长实验设计", aliases: "实验设计 / 假设验证 / 最小可行实验",
        aliases: "实验设计 / 假设验证 / 最小可行实验",

        explain: "从业务假设出发，设计对照实验的样本量、周期、核心指标与成功标准，避免无效实验。",

        what: "增长实验设计是在开跑前明确假设、指标、样本、周期与成功/失败标准，保证实验可判定。 也叫最小可行实验设计，是 A/B 的前置工作。",

        when: "适用：想法多资源少，或历史上无效实验多。 不适用：已有强制上线、完全没有实验空间时（应改为灰度观察并降低结论强度）。",

        purpose: "提高实验命中率与可解释性，减少无效开发和事后扯皮。",

        how: "①写一句话假设与业务价值。②定核心指标与护栏指标。③估算样本量与周期（两比例检验，α=0.05，power=0.8）。④写成功/失败/停实标准。⑤评审通过后再开发上线。⑥实验结束后对照设计书归档。【可执行 SQL / 公式】-- 最小样本量（每组），两比例检验：-- n = (z_{1-α/2} + z_{power})^2 × [p1(1-p1) + p2(1-p2)] / (p1-p2)^2-- z_{1-α/2}=1.96（双侧 α=0.05），z_{power}=0.84（power=0.8）-- 示例：p1=15.8%，p2=18.2%（MDE=2.4pct）→ 每组约 3,000+-- 历史实验命中率统计（用于评审资源分配）SELECT compare_name,COUNT(*) AS variants,SUM(CASE WHEN abs_diff_pct > 0 AND z_score > 1.96 THEN 1 ELSE 0 END) AS significant_positive,ROUND(SUM(CASE WHEN abs_diff_pct > 0 AND z_score > 1.96 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS hit_rate_pctFROM internet_analytics.v_ab_experimentWHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_endGROUP BY compare_name;",

        definition: "增长实验设计是在开跑前明确假设、指标、样本、周期与成功/失败标准，保证实验可判定。 也叫最小可行实验设计，是 A/B 的前置工作。",

        principle: "先设计后开跑：唯一核心指标、护栏指标、样本量与停实规则写清，避免「跑了才知道看什么」。 想法多资源少时，用设计评审淘汰低价值实验。",

        applicable: "适用：想法多资源少，或历史上无效实验多。 不适用：已有强制上线、完全没有实验空间时（应改为灰度观察并降低结论强度）。",

        steps: "①写一句话假设与业务价值。②定核心指标与护栏指标。③估算样本量与周期（两比例检验，α=0.05，power=0.8）。④写成功/失败/停实标准。⑤评审通过后再开发上线。⑥实验结束后对照设计书归档。【可执行 SQL / 公式】-- 最小样本量（每组），两比例检验：-- n = (z_{1-α/2} + z_{power})^2 × [p1(1-p1) + p2(1-p2)] / (p1-p2)^2-- z_{1-α/2}=1.96（双侧 α=0.05），z_{power}=0.84（power=0.8）-- 示例：p1=15.8%，p2=18.2%（MDE=2.4pct）→ 每组约 3,000+-- 历史实验命中率统计（用于评审资源分配）SELECT compare_name,COUNT(*) AS variants,SUM(CASE WHEN abs_diff_pct > 0 AND z_score > 1.96 THEN 1 ELSE 0 END) AS significant_positive,ROUND(SUM(CASE WHEN abs_diff_pct > 0 AND z_score > 1.96 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS hit_rate_pctFROM internet_analytics.v_ab_experimentWHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_endGROUP BY compare_name;",

        outputsAndPitfalls: "输出物：实验设计书、评审记录。 常见误区：指标含糊；无护栏；样本不足仍强行下因果结论。",

        vsOtherMethods: "是 ab 的前置工作。 和敏感性比：设计是真实世界验证计划，敏感性是纸面推演。 和 funnel 比：漏斗提出问题，实验设计决定如何验证解法。",

        boundaries: "无法满足样本量时应改度量、延长周期或放弃强因果结论，而不是假装显著。",

        businessQuestion: "下一个实验该怎么设计？",

        portfolio: "（示例值，非真实基准）假设「video 入口减少误触可提升验证率 5pct」：需每组样本约 2,000+，周期约 14 天， 核心指标 click→verify，成功标准 +3pct 且 p<0.05。参考 v_ab_experiment 历史口径。",

        servesLayers: "L4 评估前置、L5 方案验证",

        judgeCriteria: "- 每组样本未达计算值 → 延长实验或降低 MDE，不得强行下结论； - 核心指标 >1 个 → 需多重比较校正，否则假阳性升高； - 无护栏指标 → 设计不通过评审。",

        misuseScenes: "- 先跑实验再想指标，事后挑一个显著的指标汇报（p-hacking）； - 实验周期覆盖大促，外生因素污染结论。 ================================================================================ 分类四 · 运营优化 · 4 法 ================================================================================",

        chartType: "drill-table",
        data: {"rows": [{"level": "假设", "dim": "减少 video 误触", "metric": "验证率 +5pct"}, {"level": "核心指标", "dim": "click→verify", "metric": "成功线 +3pct"}, {"level": "样本量", "dim": "每组 ≥2,000", "metric": "周期 14 天"}, {"level": "护栏", "dim": "投诉率/误触率", "metric": "不劣于对照"}, {"level": "决策", "dim": "p<0.05 且达标", "metric": "全量 / 迭代"}]}},
    ]},
    { id: "ops", name: "运营优化", methods: [
      { id: "churn", title: "流失预警分析", aliases: "流失预警 / 沉默监控 / Churn Score",
        aliases: "流失预警 / 沉默监控 / Churn Score",

        explain: "基于沉默天数、只开机行为、播放衰减等信号，对即将流失的用户进行评分与预警。",

        what: "流失预警用沉默天数、行为衰减等信号给用户打风险分，提前提取将流失人群并分级触达。 也叫沉默监控、Churn Score，目标是前移挽回窗口。",

        when: "适用：沉默池扩大、续订下滑，需要主动挽回。 不适用：几乎无行为日志，或无法触达时。",

        purpose: "前移挽回窗口，降低用高成本新客替代老客的代价，并能量化挽回 ROI。",

        how: "①定义风险规则/模型与分级（K14 沉默/流失定义需先确认）。②定期产出风险名单并对账规模。③匹配分级策略与话术。④执行触达并记录。⑤回测精度与挽回效果，调参。⑥监控误伤与投诉，设置护栏。",

        definition: "流失预警用沉默天数、行为衰减等信号给用户打风险分，提前提取将流失人群并分级触达。 也叫沉默监控、Churn Score，目标是前移挽回窗口。",

        principle: "把规则或模型产出的风险名单分等级触达，并回测精度、挽回效果与误伤。 阈值过严会骚扰；过松会错过挽回窗口。",

        applicable: "适用：沉默池扩大、续订下滑，需要主动挽回。 不适用：几乎无行为日志，或无法触达时。",

        steps: "①定义风险规则/模型与分级（K14 沉默/流失定义需先确认）。②定期产出风险名单并对账规模。③匹配分级策略与话术。④执行触达并记录。⑤回测精度与挽回效果，调参。⑥监控误伤与投诉，设置护栏。",

        outputsAndPitfalls: "输出物：风险名单、触达记录、回测报告。 常见误区：阈值过严骚扰；只预警不动作；不区分季节性沉默。",

        vsOtherMethods: "和 rfm 比：可共用信号，预警更强调即时风险。 和 lifecycle 比：生命周期看结构，预警看个体。 和 retention 比：留存总结历史，预警面向未来干预。",

        boundaries: "季节性沉默被当流失会误报，需结合业务日历。 触达通道容量有限时，必须按风险与价值排序。",

        businessQuestion: "谁即将流失？规模多大？",

        portfolio: "（示例值，非真实基准）2026-07 示例：沉默 >30 天约 1,240 人，其中只开机无点播约 680 人（最高风险）； 建议分 3 批 push + 内容券触达，并保留 10% 不触达对照以评估挽回效果。 见 v_rfm 与 v_user_segment。",

        servesLayers: "L2 诊断、L3 预测、L5 挽回",

        sql: "-- 参数：:as_of（最新快照日）\n-- 风险分层 + 历史挽回成功率（用于判断是否值得触达）\nWITH risk AS (\n    SELECT mac, rfm_segment, days_since_last_active,\n           CASE\n             WHEN days_since_last_active BETWEEN 7 AND 29 THEN '沉默预警'\n             WHEN days_since_last_active >= 30                THEN '流失风险'\n             ELSE '活跃'\n           END AS risk_level\n    FROM internet_analytics.v_rfm\n    WHERE snapshot_date = (SELECT MAX(snapshot_date) FROM internet_analytics.v_rfm)\n),\nhist AS (\n    SELECT r.mac, r.rfm_segment,\n           MAX(CASE WHEN a.snapshot_date > r.snapshot_date THEN 1 ELSE 0 END) AS reactivated\n    FROM internet_analytics.v_rfm r\n    LEFT JOIN internet_analytics.dws_act_user_active_1d a\n           ON r.mac = a.mac\n          AND a.snapshot_date BETWEEN r.snapshot_date + INTERVAL 1 DAY\n                                  AND r.snapshot_date + INTERVAL 30 DAY\n    WHERE r.snapshot_date BETWEEN DATE_SUB(:as_of, INTERVAL 6 MONTH)\n                              AND DATE_SUB(:as_of, INTERVAL 1 DAY)\n    GROUP BY r.mac, r.rfm_segment\n)\nSELECT risk.risk_level,\n       COUNT(DISTINCT risk.mac) AS users,\n       ROUND(AVG(h.reactivated) * 100, 2) AS hist_reactivation_rate_pct\nFROM risk\nLEFT JOIN hist h ON risk.mac = h.mac\nGROUP BY risk.risk_level\nORDER BY users DESC;",

        judgeCriteria: "- 流失风险层规模 >总活跃 15% 且环比升 >5pct → 启动挽回评估（继承 L3 q17，阈值需业务校准）； - 某层历史挽回成功率 <5% → 该层挽回 ROI 大概率 <1，不启动大规模触达； - 触达后退订/投诉率升 >5pct → 立即停止该层触达。",

        misuseScenes: "- 无对照全量触达，无法区分\"挽回效果\"与\"自然回流\"； - 风险名单不结合价值（arpu），把高成本触达用在低价值人群。",

        chartType: "scatter",
        data: {"r": 0.71, "xName": "沉默天数", "yName": "流失风险分", "points": [{"ad": 12, "revenue": 18, "channel": "低风险"}, {"ad": 28, "revenue": 42, "channel": "中风险"}, {"ad": 45, "revenue": 72, "channel": "高风险A"}, {"ad": 52, "revenue": 88, "channel": "高风险B"}, {"ad": 35, "revenue": 55, "channel": "可观察"}]}},
      { id: "marginal-roi", title: "边际 ROI 分析", aliases: "边际 ROI / 增量收益 / 预算边际",
        aliases: "边际 ROI / 增量收益 / 预算边际",

        explain: "评估每增加一单位入口流量/投放预算带来的增量订购与分成，识别收益递减拐点。",

        what: "边际 ROI 分析评估再增加一单位流量或预算带来的增量回报，识别收益递减拐点。 是 ROI 的边际版，用于决定「还能加投多少」。",

        when: "适用：总 ROI 尚可但怀疑继续加投不划算。 不适用：无法分档估计增量，或档位过粗看不清拐点时。",

        purpose: "防止在递减区盲目加投，把流量/预算上限设在拐点之前。",

        how: "①按入口分档估计分段投入与回报。②计算各档边际 ROI 并画曲线。③标注递减拐点与目标线。④设定流量/预算上限建议。⑤执行后回测真实边际。⑥环境变化时滚动重估。",

        definition: "边际 ROI 分析评估再增加一单位流量或预算带来的增量回报，识别收益递减拐点。 是 ROI 的边际版，用于决定「还能加投多少」。",

        principle: "按流量分位或预算档位估计分段 ROI，找到明显下降或跌破目标线的区间作为上限参考。 总 ROI 好看不等于边际仍划算。",

        applicable: "适用：总 ROI 尚可但怀疑继续加投不划算。 不适用：无法分档估计增量，或档位过粗看不清拐点时。",

        steps: "①按入口分档估计分段投入与回报。②计算各档边际 ROI 并画曲线。③标注递减拐点与目标线。④设定流量/预算上限建议。⑤执行后回测真实边际。⑥环境变化时滚动重估。",

        outputsAndPitfalls: "输出物：边际曲线、建议上限、回测。 常见误区：用平均 ROI 决策加投；档位过粗；不回测。",

        vsOtherMethods: "是 ROI 的边际版。 和帕累托比：帕累托选对象，边际 ROI 定加码幅度。 和 channel-scorecard 比：边际管加投节奏，评分卡管综合质量。",

        boundaries: "分档过粗会看不清拐点。外部竞价环境变化会使历史边际失效，需按周或活动期重估。",

        businessQuestion: "再加投 10% 流量，还能赚多少？",

        portfolio: "（示例值，非真实基准）launcher 示例：前 60% 流量 ROI 约 2.1，60–80% 降至约 1.4，>80% 仅约 0.9（边际递减）； 建议流量上限设在 75% 附近。见 v_channel_analysis 日粒度拆解。",

        servesLayers: "L5 优化",

        sql: "-- 参数：:month_start, :month_end（近 6 个月月度数据，分档看边际）\nWITH monthly AS (\n    SELECT channel_code,\n           DATE_FORMAT(stat_date, '%Y-%m') AS ym,\n           SUM(cost_amount) AS cost\n    FROM internet_analytics.dwd_marketing_cost_1d\n    WHERE stat_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\n    GROUP BY channel_code, DATE_FORMAT(stat_date, '%Y-%m')\n),\nrev AS (\n    SELECT channel_name AS channel_code,\n           DATE_FORMAT(snapshot_date, '%Y-%m') AS ym,\n           SUM(avg_platform_share) AS share\n    FROM internet_analytics.v_ltv\n    WHERE snapshot_date BETWEEN DATE_SUB(:month_start, INTERVAL 6 MONTH) AND :month_end\n    GROUP BY channel_name, DATE_FORMAT(snapshot_date, '%Y-%m')\n),\njoined AS (\n    SELECT m.channel_code, m.ym, m.cost, r.share,\n           LAG(m.cost)  OVER (PARTITION BY m.channel_code ORDER BY m.ym) AS prev_cost,\n           LAG(r.share) OVER (PARTITION BY m.channel_code ORDER BY m.ym) AS prev_share\n    FROM monthly m\n    LEFT JOIN rev r ON m.channel_code = r.channel_code AND m.ym = r.ym\n)\nSELECT channel_code,\n       ROUND(AVG((share - prev_share) / NULLIF(cost - prev_cost, 0)), 2) AS marginal_roi_avg,\n       ROUND(AVG(share / NULLIF(cost, 0)), 2)                           AS avg_roi\nFROM joined\nWHERE prev_cost IS NOT NULL AND cost > prev_cost\nGROUP BY channel_code\nORDER BY marginal_roi_avg DESC;",

        judgeCriteria: "- 边际 ROI <1 → 该渠道不再追加预算（继承 L5 q24）； - 边际 ROI 明显低于平均 ROI → 已接近饱和，加预算边际递减； - 边际 ROI 高于平均 ROI → 仍有加码空间。",

        misuseScenes: "- 用平均 ROI 2.1 决定继续加投，忽略边际已降到 0.9； - 分档只按总量均分，不看每档的实际投入产出。",

        chartType: "marginal",
        data: {"scenarios": [{"action": "流量 0–40%", "deltaProfit": 2.4}, {"action": "流量 40–60%", "deltaProfit": 2.1}, {"action": "流量 60–80%", "deltaProfit": 1.4}, {"action": "流量 >80%", "deltaProfit": -0.3}]}},
      { id: "channel-scorecard", title: "渠道质量评分卡", aliases: "渠道评分卡 / 入口质量 / 渠道 KPI",
        aliases: "渠道评分卡 / 入口质量 / 渠道 KPI",

        explain: "将 CAC、LTV、留存、转化率、分成 ROI 等指标加权汇总为渠道综合评分，支持投放决策。",

        what: "渠道质量评分卡把 CAC、LTV、留存、转化、ROI 等指标加权合成综合分，用于入口/渠道排名与预算取舍。 也叫入口质量评分卡。",

        when: "适用：多入口并行，需周/月做取舍。 不适用：关键指标无法齐备，或权重完全无法达成共识时。",

        purpose: "用一张表对齐渠道质量，减少单指标片面决策（只看转化或只看 ROI）。",

        how: "①选定指标、权重与标准化方法并评审。②按期打分排名。③对低分入口拆低分项诊断。④形成加投/维持/收缩建议。⑤执行预算调整。⑥复盘排名是否与业务结果一致，必要时调权重。",

        definition: "渠道质量评分卡把 CAC、LTV、留存、转化、ROI 等指标加权合成综合分，用于入口/渠道排名与预算取舍。 也叫入口质量评分卡。",

        principle: "先选指标与权重并标准化，再汇总排名；对低分项做诊断，形成预算调整。 权重必须透明并可解释，否则结果难落地。",

        applicable: "适用：多入口并行，需周/月做取舍。 不适用：关键指标无法齐备，或权重完全无法达成共识时。",

        steps: "①选定指标、权重与标准化方法并评审。②按期打分排名。③对低分入口拆低分项诊断。④形成加投/维持/收缩建议。⑤执行预算调整。⑥复盘排名是否与业务结果一致，必要时调权重。",

        outputsAndPitfalls: "输出物：评分卡、诊断说明、预算建议。 常见误区：权重黑箱；只排名不行动；短期波动导致排名抖动却不做平滑。",

        vsOtherMethods: "和单一 ROI 比：更全面。 和帕累托比：评分卡是多维质量，帕累托是单维贡献。 和 ltv 比：LTV/CAC 常是评分卡核心输入之一。",

        boundaries: "权重缺乏共识时结果难落地。短期波动大会导致排名抖动，需平滑或拉长窗口。",

        businessQuestion: "各入口综合质量如何排名？",

        portfolio: "（示例值，非真实基准）2026-07 示例评分卡：launcher 综合分较高（LTV/CAC≈1.8、D7 留存≈25%）； video 综合分较低（误触偏高、LTV/CAC≈1.1）。见 v_channel_analysis + v_ltv 综合。",

        servesLayers: "L4 评估、L5 优化",

        sql: "-- 参数：:month_start, :month_end\n-- 指标汇总（评分在应用层做 min-max 标准化 + 加权）\nWITH base AS (\n    SELECT l.channel_name AS channel_code,\n           ROUND(l.total_share / NULLIF(l.user_cnt, 0), 2) AS ltv_per_user,\n           ROUND(c.total_cost / NULLIF(n.new_users, 0), 2) AS cac,\n           ROUND((l.total_share / NULLIF(l.user_cnt, 0))\n                 / NULLIF(c.total_cost / NULLIF(n.new_users, 0), 0), 2) AS ltv_cac_ratio,\n           r.d7_retention,\n           f.cvr_pct\n    FROM (\n        SELECT channel_name, SUM(avg_platform_share) AS total_share, COUNT(DISTINCT mac) AS user_cnt\n        FROM internet_analytics.v_ltv\n        WHERE snapshot_date BETWEEN :month_start AND :month_end\n        GROUP BY channel_name\n    ) l\n    LEFT JOIN (\n        SELECT channel_code, SUM(cost_amount) AS total_cost\n        FROM internet_analytics.dwd_marketing_cost_1d\n        WHERE stat_date BETWEEN :month_start AND :month_end\n        GROUP BY channel_code\n    ) c ON l.channel_name = c.channel_code\n    LEFT JOIN (\n        SELECT channel_code, SUM(new_user_cnt) AS new_users\n        FROM internet_analytics.dws_channel_new_user_1d\n        WHERE stat_date BETWEEN :month_start AND :month_end\n        GROUP BY channel_code\n    ) n ON l.channel_name = n.channel_code\n    LEFT JOIN (\n        SELECT channel_code, ROUND(AVG(CASE WHEN day_offset = 7 THEN retention_rate END), 4) AS d7_retention\n        FROM internet_analytics.v_user_retention\n        WHERE cohort_date BETWEEN :month_start AND :month_end\n        GROUP BY channel_code\n    ) r ON l.channel_name = r.channel_code\n    LEFT JOIN (\n        SELECT src_type AS channel_code,\n               ROUND(SUM(purchase_cnt) / NULLIF(SUM(click_cnt), 0) * 100, 2) AS cvr_pct\n        FROM internet_analytics.dws_trade_cashier_funnel_1d\n        WHERE device_type = 'ALL'\n          AND snapshot_date BETWEEN :month_start AND :month_end\n        GROUP BY src_type\n    ) f ON l.channel_name = f.channel_code\n)\nSELECT * FROM base ORDER BY ltv_cac_ratio DESC;\n\n-- 应用层：对各指标 min-max 标准化后按权重求和，得到综合分与排名。",

        judgeCriteria: "- 综合分排名末位且 LTV/CAC <1 → 收缩建议； - 某项指标（如 D7 留存）显著低于同分渠道均值 → 该入口低分项诊断； - 排名在两个月内大幅抖动 → 拉长窗口或平滑后再下结论。",

        misuseScenes: "- 权重由单一部门拍定，其他团队不认，评分卡无法落地； - 只排名不追低分项，不知道\"为什么低\"。",

        chartType: "drill-table",
        data: {"rows": [{"level": "launcher", "dim": "综合 82 分", "metric": "LTV/CAC 1.8 · D7 25%"}, {"level": "搜索", "dim": "综合 74 分", "metric": "LTV/CAC 1.6 · D7 22%"}, {"level": "活动页", "dim": "综合 65 分", "metric": "LTV/CAC 1.3 · D7 18%"}, {"level": "video", "dim": "综合 58 分", "metric": "LTV/CAC 1.1 · 误触高"}]}},
      { id: "path", title: "行为路径分析", aliases: "行为路径 / 用户旅程 / 序列分析",
        aliases: "行为路径 / 用户旅程 / 序列分析",

        explain: "追踪用户从开机→点播/直播→收银台→订购的行为序列，识别高频路径与流失节点。",

        what: "行为路径分析追踪用户关键动作序列，识别高频路径与主要流失节点。 也叫用户旅程序列分析；在漏斗步骤过粗时用来看中间细节。",

        when: "适用：转化差且漏斗步太粗，需要定位中间流失节点。 不适用：事件埋点不全或版本不一致时。",

        purpose: "找到可改的中间节点，而不是只知道总转化低却无从下手。",

        how: "①定义关键事件与会话规则。②统计 Top 路径与转移矩阵。③标注流失最大的边。④形成改版或实验方案。⑤上线后对比路径与转化。⑥沉淀典型路径进体验复盘。",

        definition: "行为路径分析追踪用户关键动作序列，识别高频路径与主要流失节点。 也叫用户旅程序列分析；在漏斗步骤过粗时用来看中间细节。",

        principle: "统计 Top 路径与步骤转移，找到流失最大的边，再针对性改页面或流程，并对比改后路径变化。 既要看高频路径，也要警惕低频但高损失路径。",

        applicable: "适用：转化差且漏斗步太粗，需要定位中间流失节点。 不适用：事件埋点不全或版本不一致时。",

        steps: "①定义关键事件与会话规则。②统计 Top 路径与转移矩阵。③标注流失最大的边。④形成改版或实验方案。⑤上线后对比路径与转化。⑥沉淀典型路径进体验复盘。",

        outputsAndPitfalls: "输出物：路径图、流失边、改版建议。 常见误区：路径过长无法阅读；忽略低频高损路径；埋点版本混用。",

        vsOtherMethods: "和 funnel 比：路径更细。 和 persona 比：路径是行为过程不是属性。 和 ab 比：路径找改点，实验验证改法。",

        boundaries: "埋点版本不一致会导致假路径。隐私最小化后某些序列不可用。 会话切分规则变化会使历史不可比。",

        businessQuestion: "用户典型路径是什么？在哪一步离开？",

        portfolio: "（示例值，非真实基准）2026-07 示例典型路径：开机 → 点播 → 剧集详情 → 收银台曝光 → 确认； 最大流失在\"详情 → 收银台\"这一步。见 dws_act_user_active_1d + dws_trade_cashier_funnel_1d。",

        servesLayers: "L2 诊断、L4 评估",

        sql: "-- 参数：:month_start, :month_end\n-- 步骤转移矩阵（相邻事件对）\nWITH events AS (\n    SELECT mac, event_time, event_type,\n           LEAD(event_type) OVER (PARTITION BY mac ORDER BY event_time) AS next_event\n    FROM internet_analytics.dwd_user_event_di\n    WHERE snapshot_date BETWEEN :month_start AND :month_end\n      AND event_type IN ('launch','vod_play','live_play','detail','cashier_expose','confirm')\n)\nSELECT event_type AS from_event,\n       next_event AS to_event,\n       COUNT(*) AS transition_cnt,\n       ROUND(COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY event_type) * 100, 2) AS transition_pct\nFROM events\nWHERE next_event IS NOT NULL\nGROUP BY event_type, next_event\nORDER BY from_event, transition_cnt DESC;\n\n-- Top 路径（需应用层拼接序列，SQL 给出会话内事件序列）\nSELECT mac, event_time, event_type\nFROM internet_analytics.dwd_user_event_di\nWHERE snapshot_date BETWEEN :month_start AND :month_end\n  AND event_type IN ('launch','vod_play','live_play','detail','cashier_expose','confirm')\nORDER BY mac, event_time;",

        judgeCriteria: "- 某转移的流失率（1 - transition_pct）最高且 transition_cnt 足够大 → 最大流失边，优先改； - 低频（<1% 会话）但高损失（流失 >80%）的路径也需关注，可能是特定人群问题； - 改版后该转移的 transition_pct 显著提升 → 改版有效（需 A/B 或前后对比验证）。",

        misuseScenes: "- 事件埋点版本混用（如新增字段但旧版本未打点），路径不可比； - 只看 Top1 路径，忽略低频但高损失的异常路径。 ================================================================================",

        chartType: "funnel",
        data: {"steps": [{"name": "开机", "value": 10000, "rate": 100}, {"name": "点播", "value": 6800, "rate": 68}, {"name": "剧集详情", "value": 4500, "rate": 45}, {"name": "收银台曝光", "value": 1200, "rate": 12}, {"name": "确认订购", "value": 240, "rate": 2.4}]}},
    ]},
  ],
};

window.LAYERS = LAYERS;
window.PLAYBOOKS = PLAYBOOKS;
