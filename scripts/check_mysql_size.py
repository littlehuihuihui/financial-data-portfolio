#!/usr/bin/env python3
"""查看 MySQL 各库占用空间。"""
import pymysql

conn = pymysql.connect(host="127.0.0.1", user="root", password="123456", charset="utf8mb4")
cur = conn.cursor()

cur.execute(
    """
    SELECT table_schema,
           ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb,
           COUNT(*) AS obj_count
    FROM information_schema.tables
    WHERE table_schema NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')
    GROUP BY table_schema
    ORDER BY size_mb DESC
    """
)
rows = cur.fetchall()
total = sum(r[1] or 0 for r in rows)

print("=== MySQL database sizes ===")
for db, mb, cnt in rows:
    gb = mb / 1024
    extra = f" ({gb:.2f} GB)" if gb >= 1 else ""
    print(f"  {db:28} {mb:>10.2f} MB{extra}  objects={cnt}")
print("-" * 55)
print(f"  {'TOTAL (user databases)':28} {total:>10.2f} MB  ({total/1024:.2f} GB)")

portfolio_dbs = ("retail_finance", "internet_analytics", "manufacturing_analytics", "portfolio_metadata")
cur.execute(
    """
    SELECT table_schema, table_name,
           ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb,
           table_rows
    FROM information_schema.tables
    WHERE table_schema IN %s AND table_type = 'BASE TABLE'
    ORDER BY (data_length + index_length) DESC
    LIMIT 15
    """,
    (portfolio_dbs,),
)
print("\n=== Top 15 tables (portfolio) ===")
for schema, name, mb, est_rows in cur.fetchall():
    print(f"  {schema}.{name:42} {mb:>8.2f} MB  rows~{est_rows or 0}")

conn.close()
