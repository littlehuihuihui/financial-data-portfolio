import pymysql
import requests

c = pymysql.connect(host="127.0.0.1", user="root", password="123456", charset="utf8mb4")
cur = c.cursor()
cur.execute("USE internet_analytics")
cur.execute("SELECT * FROM v_funnel WHERE snapshot_month='2026-07'")
print("v_funnel", cur.fetchall())
cur.execute(
    "SELECT event_action, COUNT(*) FROM dwd_device_operation_wide "
    "WHERE DATE_FORMAT(event_date,'%Y-%m')='2026-07' GROUP BY event_action"
)
print("actions", cur.fetchall())
cur.execute(
    "SELECT funnel_step, COUNT(*) FROM dwd_device_operation_wide "
    "WHERE DATE_FORMAT(event_date,'%Y-%m')='2026-07' GROUP BY funnel_step"
)
print("funnel_step", cur.fetchall())
cur.execute("SELECT COUNT(*) FROM dwd_event_wide WHERE DATE_FORMAT(event_date,'%Y-%m')='2026-07'")
print("dwd_event_wide count", cur.fetchone())
c.close()

for ep in ["/api/dashboard_funnel?month=202607", "/api/dashboard_product?month=202607"]:
    try:
        r = requests.get("http://127.0.0.1:5001" + ep, timeout=5)
        print(ep, r.status_code, r.json())
    except Exception as e:
        print(ep, "ERR", e)
