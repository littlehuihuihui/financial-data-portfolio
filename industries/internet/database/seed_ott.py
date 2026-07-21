#!/usr/bin/env python3
"""广东移动 OTT 视频平台 · 造数（雪花模型）
- 建表(ott_ddl.sql) + 雪花维度 + ODS元数据
- DWS 汇总造 3 个月(2026-04-16~07-15)；原始日志(ODS+DWD)仅近 3 天(07-13~07-15,含action)
- 口径：1万mac(STB65%/Speaker35%,约10%双端)，日活2-3k，月活4-5k
"""
from __future__ import annotations
import logging
import random
from calendar import monthrange
from datetime import date, datetime, timedelta
from pathlib import Path

import pymysql

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("seed_ott")

DDL_DIR = Path(__file__).resolve().parent
BATCH = "OTT202607"
START = date(2026, 4, 16)
END = date(2026, 7, 15)
LOG_DAYS = [date(2026, 7, 13), date(2026, 7, 14), date(2026, 7, 15)]

REGIONS = [("GZ", "广州"), ("SZ", "深圳"), ("FS", "佛山"), ("DG", "东莞"), ("ZH", "珠海"), ("HZ", "惠州")]
GENRES = [("G01", "都市"), ("G02", "古装"), ("G03", "悬疑"), ("G04", "亲子"),
          ("G05", "科普"), ("G06", "冒险"), ("G07", "搞笑"), ("G08", "音乐")]
CATEGORIES = [("C01", "影视", "vod"), ("C02", "综艺", "vod"), ("C03", "动漫", "vod")]
CPS = [("CP1", "爱奇艺", "第三方"), ("CP2", "自制", "自制"), ("CP3", "芒果", "第三方"), ("CP4", "优酷", "第三方")]
CHAN_CATS = [("CC1", "少儿"), ("CC2", "卫视"), ("CC3", "影视"), ("CC4", "新闻")]
CHANNELS = [("CH01", "卡通少儿", "CC1"), ("CH02", "动画王国", "CC1"), ("CH03", "湖南卫视", "CC2"),
            ("CH04", "浙江卫视", "CC2"), ("CH05", "江苏卫视", "CC2"), ("CH06", "电影频道", "CC3"),
            ("CH07", "剧场频道", "CC3"), ("CH08", "新闻频道", "CC4"), ("CH09", "财经频道", "CC4"),
            ("CH10", "少儿动漫", "CC1")]
DEV_TYPES = [("DT1", "STB"), ("DT2", "Speaker")]
MODELS = [("M01", "魔百盒X1", "DT1"), ("M02", "魔百盒4K", "DT1"), ("M03", "魔百盒Pro", "DT1"),
          ("M04", "小豚音箱Mini", "DT2"), ("M05", "小豚音箱Pro", "DT2")]
FIRMWARES = [("F1", "v1.2.0"), ("F2", "v2.1.0"), ("F3", "v3.0.1")]
PACKAGES = [("PK1", "影视会员月卡", 15.0, "单月"), ("PK2", "影视会员连续包月", 12.0, "连续包月"),
            ("PK3", "影视会员年卡", 128.0, "包年"), ("PK4", "少儿动漫包", 9.0, "连续包月")]
PAY_TYPES = ["连续包月", "单月", "包年"]
VOD_ACTIONS = ["play", "pause", "ff", "rewind", "seek", "stop"]
LAUNCHER_ACTIONS = ["boot", "home", "click", "search"]

N_MAC = 10000
STB_RATIO = 0.65
DUAL_RATIO = 0.10


def db():
    return pymysql.connect(host="127.0.0.1", port=3306, user="root", password="123456",
                           charset="utf8mb4", autocommit=False)


def run_sql_file(cur, path: Path):
    sql = path.read_text(encoding="utf-8")
    stmts, buf = [], []
    for line in sql.splitlines():
        s = line.strip()
        if s.startswith("--") or not s:
            continue
        buf.append(line)
        if s.endswith(";"):
            stmts.append("\n".join(buf).strip().rstrip(";"))
            buf = []
    for st in stmts:
        if st:
            cur.execute(st)


def daterange(a, b):
    d = a
    while d <= b:
        yield d
        d += timedelta(days=1)


# ---------------------------- 维度与元数据 ----------------------------
def build_content():
    """生成剧集与单集。返回 series[list], episodes[list]。"""
    series, episodes = [], []
    sid = 0
    kids_genres = ["G04", "G05", "G06", "G07"]
    for cat_id, cat_name, _ in CATEGORIES:
        n = 16 if cat_name == "影视" else (10 if cat_name == "综艺" else 14)
        for _ in range(n):
            sid += 1
            scode = f"S{sid:03d}"
            is_kids = 1 if cat_name == "动漫" else 0
            genre = random.choice(kids_genres) if is_kids else random.choice([g[0] for g in GENRES[:3]] + ["G08"])
            cp = "CP1" if random.random() < 0.55 else random.choice(["CP2", "CP3", "CP4"])
            total_ep = random.choice([12, 20, 24, 30, 40]) if cat_name != "综艺" else random.choice([8, 10, 12])
            name = f"{cat_name}剧集{sid:03d}"
            series.append((scode, name, cat_id, genre, cp, total_ep, is_kids, random.choice([2023, 2024, 2025, 2026])))
            for ep in range(1, total_ep + 1):
                episodes.append((f"{scode}E{ep:02d}", scode, ep, f"第{ep}集", random.choice([1500, 2400, 2700, 3000])))
    return series, episodes


def seed_dims(cur, series, episodes):
    cur.execute("INSERT INTO dim_province (province_id,province_name) VALUES ('GD','广东')")
    cur.executemany("INSERT INTO dim_region (region_id,region_name,province_id) VALUES (%s,%s,'GD')", REGIONS)
    cur.executemany("INSERT INTO dim_content_genre (genre_id,genre_name) VALUES (%s,%s)", GENRES)
    cur.executemany("INSERT INTO dim_content_category (category_id,category_name,media_type) VALUES (%s,%s,%s)", CATEGORIES)
    cur.executemany("INSERT INTO dim_content_cp (cp_id,cp_name,cp_type) VALUES (%s,%s,%s)", CPS)
    cur.executemany("""INSERT INTO dim_content_series
        (series_id,series_name,category_id,genre_id,cp_id,total_episodes,is_kids,release_year)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", series)
    cur.executemany("""INSERT INTO dim_content_episode
        (episode_id,series_id,episode_no,episode_name,duration_sec) VALUES (%s,%s,%s,%s,%s)""", episodes)
    cur.executemany("INSERT INTO dim_channel_category (channel_cat_id,channel_cat_name) VALUES (%s,%s)", CHAN_CATS)
    cur.executemany("INSERT INTO dim_live_channel (channel_id,channel_name,channel_cat_id) VALUES (%s,%s,%s)", CHANNELS)
    cur.executemany("INSERT INTO dim_device_type (device_type_id,device_type_name) VALUES (%s,%s)", DEV_TYPES)
    cur.executemany("INSERT INTO dim_device_model (model_id,model_name,device_type_id) VALUES (%s,%s,%s)", MODELS)
    cur.executemany("INSERT INTO dim_firmware (fw_id,fw_version) VALUES (%s,%s)", FIRMWARES)
    cur.executemany("INSERT INTO dim_user_package (pkg_id,pkg_name,pkg_price,pay_cycle) VALUES (%s,%s,%s,%s)", PACKAGES)
    # 时间维（雪花 date->week->month）
    months, weeks = {}, {}
    drows = []
    for d in daterange(START - timedelta(days=40), END):
        iso = d.isocalendar()
        wk = f"{iso[0]}-W{iso[1]:02d}"
        mid = d.strftime("%Y-%m")
        months.setdefault(mid, (mid, d.year, d.month, mid))
        if wk not in weeks:
            wstart = d - timedelta(days=d.weekday())
            weeks[wk] = (wk, wstart, wstart + timedelta(days=6), iso[0], iso[1])
        drows.append((d, wk, mid, d.year, d.month, d.day, d.weekday(), 1 if d.weekday() >= 5 else 0))
    cur.executemany("INSERT INTO dim_month (month_id,year_num,month_num,month_label) VALUES (%s,%s,%s,%s)", list(months.values()))
    cur.executemany("INSERT INTO dim_week (week_id,week_start,week_end,year_num,week_of_year) VALUES (%s,%s,%s,%s,%s)", list(weeks.values()))
    cur.executemany("""INSERT INTO dim_date (date_id,week_id,month_id,year_num,month_num,day_num,weekday,is_weekend)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", drows)


def seed_devices_users(cur):
    """生成 1万 mac + 用户，返回 macs 列表[(mac,device_type,region_id,userid)]。"""
    macs, users, dev_ods = [], {}, []
    reg_ids = [r[0] for r in REGIONS]
    stb_models = [m[0] for m in MODELS if m[2] == "DT1"]
    spk_models = [m[0] for m in MODELS if m[2] == "DT2"]
    dim_dev, dim_usr, ods_reg = [], [], []
    uid_seq = 0
    for i in range(1, N_MAC + 1):
        mac = f"MAC{i:06d}"
        is_stb = random.random() < STB_RATIO
        dtype = "STB" if is_stb else "Speaker"
        model = random.choice(stb_models if is_stb else spk_models)
        fw = random.choice([f[0] for f in FIRMWARES])
        region = random.choice(reg_ids)
        # userid：约10%双端设备复用已有 userid，其余新开户
        if uid_seq > 0 and random.random() < DUAL_RATIO:
            userid = f"U{random.randint(1, uid_seq):06d}"
        else:
            uid_seq += 1
            userid = f"U{uid_seq:06d}"
        first_active = START + timedelta(days=random.randint(-30, 80))
        if first_active > END:
            first_active = END - timedelta(days=random.randint(0, 60))
        macs.append((mac, dtype, region, userid))
        dim_dev.append((mac, model, fw, region, "DT1" if is_stb else "DT2", first_active, "活跃"))
        dev_ods.append((mac, model, dtype, random.choice([f[1] for f in FIRMWARES]), region, first_active, BATCH))
    # 用户维（去重 userid）
    seen = {}
    for mac, dtype, region, userid in macs:
        if userid not in seen:
            pkg = random.choice([p[0] for p in PACKAGES])
            reg_date = START + timedelta(days=random.randint(-60, 80))
            if reg_date > END:
                reg_date = END - timedelta(days=random.randint(0, 80))
            phone = f"13{random.randint(0,9)}{random.randint(10000000,99999999)}"
            seen[userid] = (userid, phone, region, pkg, reg_date, "正常")
    dim_usr = list(seen.values())
    ods_reg = [(u[0], u[1], "", u[2], u[3], datetime.combine(u[4], datetime.min.time()), u[4], BATCH) for u in dim_usr]
    cur.executemany("""INSERT INTO dim_device (mac,model_id,fw_id,region_id,device_type_id,first_active_date,device_status)
        VALUES (%s,%s,%s,%s,%s,%s,%s)""", dim_dev)
    cur.executemany("""INSERT INTO dim_user (userid,phone,region_id,pkg_id,register_date,user_status)
        VALUES (%s,%s,%s,%s,%s,%s)""", dim_usr)
    cur.executemany("""INSERT INTO ods_device_info_df (mac,model_name,device_type,fw_version,region_id,first_active_date,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s)""", dev_ods)
    cur.executemany("""INSERT INTO ods_user_register_di (userid,phone,mac,region_id,pkg_id,register_time,register_date,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", ods_reg)
    return macs, {u[0]: u for u in dim_usr}


def seed_ods_meta(cur, series, episodes):
    cat_map = {c[0]: c[1] for c in CATEGORIES}
    genre_map = {g[0]: g[1] for g in GENRES}
    cp_map = {c[0]: c[1] for c in CPS}
    chcat_map = {c[0]: c[1] for c in CHAN_CATS}
    cur.executemany("""INSERT INTO ods_content_series_df
        (series_id,series_name,category_name,genre_name,cp_name,total_episodes,is_kids,release_year,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        [(s[0], s[1], cat_map[s[2]], genre_map[s[3]], cp_map[s[4]], s[5], s[6], s[7], BATCH) for s in series])
    cur.executemany("""INSERT INTO ods_content_episode_df (episode_id,series_id,episode_no,episode_name,duration_sec,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s)""", [(e[0], e[1], e[2], e[3], e[4], BATCH) for e in episodes])
    cur.executemany("""INSERT INTO ods_live_channel_df (channel_id,channel_name,channel_cat_name,etl_batch_id)
        VALUES (%s,%s,%s,%s)""", [(c[0], c[1], chcat_map[c[2]], BATCH) for c in CHANNELS])


# ---------------------------- 活跃（DWS mac日活，90天） ----------------------------
def seed_activity(cur, macs):
    """返回 day_active: {date: [ (mac,dtype,userid,is_vod,is_live,only_launcher,launcher_cnt,vod_cnt,vod_dur,live_dur) ]}
    及 first_active_map: {mac: date}。"""
    universe = random.sample(macs, 5500)  # 活跃宇宙，其余为潜在沉默
    tiers = {}
    for m in universe:
        r = random.random()
        tiers[m[0]] = 0.62 if r < 0.35 else (0.32 if r < 0.75 else 0.12)
    day_active, first_active = {}, {}
    rows = []
    for d in daterange(START, END):
        target = random.randint(2000, 3000)
        pool = [m for m in universe if random.random() < tiers[m[0]]]
        if len(pool) > target:
            pool = random.sample(pool, target)
        recs = []
        for (mac, dtype, region, userid) in pool:
            is_vod = 1 if random.random() < 0.70 else 0
            is_live = 1 if random.random() < 0.30 else 0
            only_launcher = 1 if (not is_vod and not is_live) else 0
            launcher_cnt = random.randint(1, 5)
            vod_cnt = random.randint(1, 6) if is_vod else 0
            vod_dur = sum(random.randint(300, 2600) for _ in range(vod_cnt)) if is_vod else 0
            live_dur = random.randint(600, 5400) if is_live else 0
            recs.append((mac, dtype, userid, is_vod, is_live, only_launcher, launcher_cnt, vod_cnt, vod_dur, live_dur, region))
            rows.append((d, mac, userid, dtype, region, only_launcher, is_vod, is_live, launcher_cnt, vod_cnt, vod_dur, live_dur, BATCH))
            if mac not in first_active:
                first_active[mac] = d
        day_active[d] = recs
    for i in range(0, len(rows), 5000):
        cur.executemany("""INSERT INTO dws_act_user_active_1d
            (snapshot_date,mac,userid,device_type,region_id,is_only_launcher,is_vod_active,is_live_active,
             launcher_cnt,vod_play_cnt,vod_play_dur,live_play_dur,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", rows[i:i + 5000])
    log.info("dws_act_user_active_1d rows=%d", len(rows))
    return day_active, first_active


# ---------------------------- 内容播放（剧集/单集/直播） ----------------------------
def seed_content(cur, day_active, series, episodes):
    weights = {s[0]: random.random() ** 2 + 0.05 for s in series}  # zipf-ish 热度
    kids = {s[0]: s[6] for s in series}
    scat = {s[0]: s[2] for s in series}
    sgenre = {s[0]: s[3] for s in series}
    eps_by_series = {}
    for e in episodes:
        eps_by_series.setdefault(e[1], []).append(e)
    ser_rows, epi_rows, live_rows = [], [], []
    for d, recs in day_active.items():
        vod_uv = sum(r[3] for r in recs)
        live_uv = sum(r[4] for r in recs)
        if vod_uv > 0:
            wsum = sum(weights.values())
            for s in series:
                sid = s[0]
                uv = int(vod_uv * weights[sid] / wsum)
                if uv <= 0:
                    continue
                vv = int(uv * random.uniform(1.2, 2.6))
                avg_dur = random.randint(900, 2400)
                play_dur = vv * avg_dur
                finish = int(vv * random.uniform(0.35, 0.75))
                comp = round(finish / vv * 100 if vv else 0, 2)
                ser_rows.append((d, sid, scat[sid], sgenre[sid], kids[sid], vv, uv, play_dur, finish, comp, BATCH))
                # 单集：该剧集取前若干集分摊
                eps = sorted(eps_by_series.get(sid, []), key=lambda x: x[2])[:6]
                if eps:
                    ep_uv = max(1, uv // len(eps))
                    for e in eps:
                        evv = int(ep_uv * random.uniform(1.0, 1.8))
                        epi_rows.append((d, e[0], sid, evv, ep_uv, evv * random.randint(800, 2200),
                                         int(evv * random.uniform(0.3, 0.7)), BATCH))
        if live_uv > 0:
            for c in CHANNELS:
                uv = int(live_uv * random.uniform(0.04, 0.18))
                if uv <= 0:
                    continue
                vv = int(uv * random.uniform(1.1, 2.0))
                live_rows.append((d, c[0], c[2], vv, uv, vv * random.randint(600, 3000), BATCH))
    for i in range(0, len(ser_rows), 5000):
        cur.executemany("""INSERT INTO dws_content_series_play_1d
            (snapshot_date,series_id,category_id,genre_id,is_kids,vv,uv,play_dur,finish_cnt,complete_rate_avg,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ser_rows[i:i + 5000])
    for i in range(0, len(epi_rows), 5000):
        cur.executemany("""INSERT INTO dws_content_episode_play_1d
            (snapshot_date,episode_id,series_id,vv,uv,play_dur,finish_cnt,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", epi_rows[i:i + 5000])
    for i in range(0, len(live_rows), 5000):
        cur.executemany("""INSERT INTO dws_content_live_play_1d
            (snapshot_date,channel_id,channel_cat_id,vv,uv,play_dur,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s)""", live_rows[i:i + 5000])
    log.info("content rows series=%d episode=%d live=%d", len(ser_rows), len(epi_rows), len(live_rows))


# ---------------------------- 商业化漏斗 ----------------------------
def seed_funnel(cur, day_active):
    rows = []
    for d, recs in day_active.items():
        base = len(recs)
        for dtype in ["STB", "Speaker"]:
            for src in ["video", "launcher"]:
                expose = int(base * random.uniform(0.15, 0.30) * (0.6 if dtype == "STB" else 0.4)
                             * (0.6 if src == "video" else 0.4))
                click = int(expose * random.uniform(0.20, 0.35))
                # 小孩误触：video 来源 click->verify 流失更高
                v_rate = random.uniform(0.35, 0.5) if src == "video" else random.uniform(0.55, 0.72)
                verify = int(click * v_rate)
                confirm = int(verify * random.uniform(0.75, 0.9))
                rows.append((d, dtype, src, expose, click, verify, confirm, BATCH))
    # ALL/ALL 汇总
    agg = {}
    for r in rows:
        k = r[0]
        a = agg.setdefault(k, [0, 0, 0, 0])
        a[0] += r[3]; a[1] += r[4]; a[2] += r[5]; a[3] += r[6]
    all_rows = [(d, "ALL", "ALL", v[0], v[1], v[2], v[3], BATCH) for d, v in agg.items()]
    cur.executemany("""INSERT INTO dws_trade_cashier_funnel_1d
        (snapshot_date,device_type,src_type,expose_cnt,click_cnt,verify_cnt,confirm_cnt,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", rows + all_rows)
    log.info("funnel rows=%d", len(rows) + len(all_rows))
    return agg  # {date:[e,c,v,confirm]}


# ---------------------------- 订购/退订/分成 ----------------------------
def seed_orders(cur, funnel_agg, macs, users):
    dwd_order, ods_order, ods_unsub = [], [], []
    dws = {}
    mac_user = {m[0]: m[3] for m in macs}
    order_seq, unsub_seq = 0, 0
    for d, v in funnel_agg.items():
        confirm = v[3]
        n_orders = confirm  # 确认成功即订购
        for _ in range(n_orders):
            order_seq += 1
            mac = random.choice(macs)
            pay = random.choices(PAY_TYPES, weights=[0.5, 0.3, 0.2])[0]
            src = random.choice(["video", "launcher"])
            fee = {"连续包月": 12.0, "单月": 15.0, "包年": 128.0}[pay]
            share_rate = {"连续包月": 0.25, "单月": 0.30, "包年": 0.35}[pay]
            rshare = round(fee * share_rate, 2)
            oid = f"ORD{d.strftime('%Y%m%d')}{order_seq:05d}"
            ot = datetime.combine(d, datetime.min.time()) + timedelta(seconds=random.randint(0, 86399))
            dwd_order.append((oid, mac[3], mac[0], "order", src, "-1", pay, fee, rshare, ot, d))
            ods_order.append((oid, mac[3], mac[0], "order", src, "-1", pay, fee, ot, d, BATCH))
            k = (d, pay, src)
            a = dws.setdefault(k, [0, 0, 0.0, 0.0])
            a[0] += 1; a[2] += fee; a[3] += rshare
        # 退订（少量）
        n_unsub = int(n_orders * random.uniform(0.05, 0.15))
        for _ in range(n_unsub):
            unsub_seq += 1
            mac = random.choice(macs)
            pay = random.choice(PAY_TYPES)
            src = random.choice(["video", "launcher"])
            oid = f"UNS{d.strftime('%Y%m%d')}{unsub_seq:05d}"
            ot = datetime.combine(d, datetime.min.time()) + timedelta(seconds=random.randint(0, 86399))
            dwd_order.append((oid, mac[3], mac[0], "unsub", src, "-1", pay, 0.0, 0.0, ot, d))
            ods_unsub.append((mac[3], "", mac[0], ot, d, random.choice(["资费", "内容", "误订", "其他"]), BATCH))
            k = (d, pay, src)
            a = dws.setdefault(k, [0, 0, 0.0, 0.0])
            a[1] += 1
    for i in range(0, len(dwd_order), 5000):
        cur.executemany("""INSERT INTO dwd_trade_order_di
            (order_id,userid,mac,op_type,src_type,series_id,pay_type,fee,revenue_share,op_time,op_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", dwd_order[i:i + 5000])
    for i in range(0, len(ods_order), 5000):
        cur.executemany("""INSERT INTO ods_order_di
            (order_id,userid,mac,op_type,src_type,series_id,pay_type,fee,op_time,op_date,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", ods_order[i:i + 5000])
    for i in range(0, len(ods_unsub), 5000):
        cur.executemany("""INSERT INTO ods_user_unsubscribe_di
            (userid,phone,mac,unsub_time,unsub_date,reason,etl_batch_id) VALUES (%s,%s,%s,%s,%s,%s,%s)""", ods_unsub[i:i + 5000])
    dws_rows = [(d, pay, src, v[0], v[1], round(v[2], 2), round(v[3], 2), BATCH) for (d, pay, src), v in dws.items()]
    cur.executemany("""INSERT INTO dws_trade_order_1d
        (snapshot_date,pay_type,src_type,order_cnt,unsub_cnt,order_amount,revenue_share,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", dws_rows)
    log.info("orders dwd=%d dws=%d unsub=%d", len(dwd_order), len(dws_rows), len(ods_unsub))
    # 返回退订用户集合（用于流失/状态）
    churn_users = {u[0] for u in ods_unsub}
    return churn_users


# ---------------------------- 用户生命周期 ----------------------------
def seed_lifecycle(cur, day_active, first_active, users, churn_users):
    reg_by_day = {}
    for u in users.values():
        reg_by_day[u[4]] = reg_by_day.get(u[4], 0) + 1
    firstact_by_day = {}
    for mac, d in first_active.items():
        firstact_by_day[d] = firstact_by_day.get(d, 0) + 1
    # churn_users 为退订用户集合；按日累计（seed 中无退订日期时，按活跃日序渐进释放）
    churn_list = list(churn_users)
    days_sorted = sorted(day_active.keys())
    rows = []
    total_users = len(users)
    for idx, d in enumerate(days_sorted):
        recs = day_active[d]
        active = len(recs)
        stb = sum(1 for r in recs if r[1] == "STB")
        spk = active - stb
        new_reg = reg_by_day.get(d, 0)
        new_act = firstact_by_day.get(d, 0)
        # 累计流失 ≈ 按日序比例释放退订用户（可追溯：ods 退订人数）
        cum_churn = int(len(churn_list) * (idx + 1) / max(1, len(days_sorted)))
        # 沉默 ≈ 总用户 − 当日活跃 − 累计流失（非随机比例）
        silent = max(total_users - active - cum_churn, 0)
        rows.append((d, new_reg, new_act, silent, cum_churn, active, stb, spk, BATCH))
    cur.executemany("""INSERT INTO dws_user_lifecycle_1d
        (snapshot_date,new_register,new_activate,silent_cnt,churn_cnt,active_users,active_stb,active_speaker,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", rows)
    log.info("lifecycle rows=%d", len(rows))


# ---------------------------- 留存同期群 ----------------------------
def seed_retention(cur, day_active, first_active):
    active_by_mac = {}
    for d, recs in day_active.items():
        for r in recs:
            active_by_mac.setdefault(r[0], set()).add(d)
    cohorts = {}
    for mac, fd in first_active.items():
        cohorts.setdefault(fd, []).append(mac)
    rows = []
    for cdate, cmacs in cohorts.items():
        n = len(cmacs)
        if n < 20:
            continue
        for off in [1, 3, 7, 14, 30]:
            tgt = cdate + timedelta(days=off)
            if tgt > END:
                continue
            retained = sum(1 for m in cmacs if tgt in active_by_mac.get(m, set()))
            rows.append((cdate, off, "ALL", n, retained, round(retained / n * 100, 2), BATCH))
    cur.executemany("""INSERT INTO dws_user_retention_1d
        (cohort_date,day_offset,device_type,cohort_users,retained_users,retention_rate,etl_batch_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s)""", rows)
    log.info("retention rows=%d", len(rows))


# ---------------------------- 用户状态快照（END 日） ----------------------------
def seed_user_status(cur, day_active, first_active, users, churn_users):
    last_active = {}
    for d, recs in day_active.items():
        for r in recs:
            uid = r[2]
            if uid not in last_active or d > last_active[uid]:
                last_active[uid] = d
    rows = []
    for uid, u in users.items():
        if uid in churn_users:
            status = "churned"
        elif uid in last_active and (END - last_active[uid]).days <= 30:
            status = "active"
        else:
            status = "silent"
        la = last_active.get(uid)
        dsa = (END - la).days if la else 999
        rows.append((END, uid, u[1], "", status, u[4], la, dsa, BATCH))
    for i in range(0, len(rows), 5000):
        cur.executemany("""INSERT INTO dwd_user_status_di
            (snapshot_date,userid,phone,mac,user_status,register_date,last_active_date,days_since_active,etl_batch_id)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", rows[i:i + 5000])
    log.info("user_status rows=%d", len(rows))


# ---------------------------- 近3天原始日志 + DWD（含 action） ----------------------------
def seed_raw_logs(cur, day_active, series, episodes):
    eps_by_series = {}
    for e in episodes:
        eps_by_series.setdefault(e[1], []).append(e)
    series_ids = [s[0] for s in series]
    cat_map = {s[0]: s[2] for s in series}
    genre_map = {s[0]: s[3] for s in series}
    kids_map = {s[0]: s[6] for s in series}
    chan_ids = [c[0] for c in CHANNELS]
    chan_cat = {c[0]: c[2] for c in CHANNELS}
    l_lch, l_vod, l_live, l_cash = [], [], [], []
    d_lch, d_vod, d_live, d_cash = [], [], [], []
    pid = 0
    for d in LOG_DAYS:
        for (mac, dtype, userid, is_vod, is_live, only_launcher, launcher_cnt, vod_cnt, vod_dur, live_dur, region) in day_active.get(d, []):
            base_dt = datetime.combine(d, datetime.min.time())
            # 开机日志 2-4 条
            for _ in range(random.randint(2, 4)):
                pid += 1
                t = base_dt + timedelta(seconds=random.randint(0, 86399))
                act = random.choice(LAUNCHER_ACTIONS)
                l_lch.append((mac, userid, dtype, region, random.choice([f[1] for f in FIRMWARES]), act, t, d))
                d_lch.append((pid, mac, userid, dtype, region, act, t, d))
            # 点播日志（每次播放拆多条 action）
            if is_vod:
                for _ in range(max(1, vod_cnt)):
                    sid = random.choice(series_ids)
                    eps = eps_by_series.get(sid, [])
                    if not eps:
                        continue
                    ep = random.choice(eps)
                    vdur = ep[4]
                    watched = random.randint(120, vdur)
                    is_fin = 1 if watched >= vdur * 0.9 else 0
                    comp = round(min(100, watched / vdur * 100), 2)
                    ffm = random.randint(200, 1200)
                    stall = random.randint(0, 1500)
                    # 每次播放 3-6 条 action
                    seq_actions = ["play"] + random.choices(["pause", "ff", "rewind", "seek"], k=random.randint(2, 4)) + ["stop"]
                    for ai, act in enumerate(seq_actions):
                        pid += 1
                        t = base_dt + timedelta(seconds=random.randint(0, 86399))
                        pos = int(watched * (ai + 1) / len(seq_actions))
                        pdur = watched if act == "stop" else int(watched * random.uniform(0.1, 0.9))
                        l_vod.append((mac, userid, dtype, sid, ep[0], act, pos, pdur, vdur, is_fin if act == "stop" else 0, ffm, stall, t, d))
                        d_vod.append((pid, mac, userid, dtype, sid, ep[0], cat_map[sid], genre_map[sid], kids_map[sid],
                                      act, pdur, vdur, comp, is_fin if act == "stop" else 0, ffm, stall, t, d))
            # 直播日志
            if is_live:
                for _ in range(random.randint(1, 3)):
                    pid += 1
                    ch = random.choice(chan_ids)
                    t = base_dt + timedelta(seconds=random.randint(0, 86399))
                    dur = random.randint(300, 3600)
                    l_live.append((mac, userid, dtype, ch, "play", dur, t, d))
                    d_live.append((pid, mac, userid, dtype, ch, chan_cat[ch], dur, t, d))
            # 收银台（偶发）
            if random.random() < 0.12:
                pid += 1
                sid = random.choice(series_ids)
                src = random.choice(["video", "launcher"])
                pay = random.choice(PAY_TYPES)
                fee = {"连续包月": 12.0, "单月": 15.0, "包年": 128.0}[pay]
                step = random.choices(["expose", "click", "verify", "confirm"], weights=[0.5, 0.25, 0.15, 0.1])[0]
                t = base_dt + timedelta(seconds=random.randint(0, 86399))
                l_cash.append((mac, userid, dtype, step, src, sid, fee, pay, t, d))
                d_cash.append((pid, mac, userid, dtype, step, src, sid, fee, pay, t, d))

    def bulk(sql, data):
        for i in range(0, len(data), 5000):
            cur.executemany(sql, data[i:i + 5000])

    bulk("""INSERT INTO ods_log_launcher_di (mac,userid,device_type,region_id,fw_version,action,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", l_lch)
    bulk("""INSERT INTO ods_log_vod_di (mac,userid,device_type,series_id,episode_id,action,pos_sec,play_dur_sec,video_dur_sec,is_finish,first_frame_ms,stall_ms,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", l_vod)
    bulk("""INSERT INTO ods_log_live_di (mac,userid,device_type,channel_id,action,play_dur_sec,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", l_live)
    bulk("""INSERT INTO ods_log_cashier_di (mac,userid,device_type,funnel_step,src_type,series_id,fee,pay_type,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", l_cash)
    bulk("""INSERT INTO dwd_act_launcher_di (log_id,mac,userid,device_type,region_id,action,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s)""", d_lch)
    bulk("""INSERT INTO dwd_vod_play_di (play_id,mac,userid,device_type,series_id,episode_id,category_id,genre_id,is_kids,action,play_dur_sec,video_dur_sec,complete_rate,is_finish,first_frame_ms,stall_ms,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", d_vod)
    bulk("""INSERT INTO dwd_live_play_di (play_id,mac,userid,device_type,channel_id,channel_cat_id,play_dur_sec,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""", d_live)
    bulk("""INSERT INTO dwd_trade_cashier_di (log_id,mac,userid,device_type,funnel_step,src_type,series_id,fee,pay_type,event_time,event_date)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""", d_cash)
    log.info("raw logs launcher=%d vod=%d live=%d cashier=%d", len(l_lch), len(l_vod), len(l_live), len(l_cash))


def main():
    random.seed(20260715)
    conn = db()
    try:
        cur = conn.cursor()
        log.info("running DDL...")
        run_sql_file(cur, DDL_DIR / "ott_ddl.sql")
        series, episodes = build_content()
        log.info("seeding dims...")
        seed_dims(cur, series, episodes)
        seed_ods_meta(cur, series, episodes)
        macs, users = seed_devices_users(cur)
        log.info("seeding activity...")
        day_active, first_active = seed_activity(cur, macs)
        seed_content(cur, day_active, series, episodes)
        funnel_agg = seed_funnel(cur, day_active)
        churn_users = seed_orders(cur, funnel_agg, macs, users)
        seed_lifecycle(cur, day_active, first_active, users, churn_users)
        seed_retention(cur, day_active, first_active)
        seed_user_status(cur, day_active, first_active, users, churn_users)
        seed_raw_logs(cur, day_active, series, episodes)
        conn.commit()
        log.info("OTT internet_analytics seeded OK")
    except Exception:
        conn.rollback()
        log.exception("seed failed")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()
