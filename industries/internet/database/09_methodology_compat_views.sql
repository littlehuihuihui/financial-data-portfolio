-- 分析方法论 SQL 兼容视图（互联网）
USE internet_analytics;

CREATE OR REPLACE VIEW dim_genre AS
SELECT genre_id, genre_name FROM dim_content_genre;

CREATE OR REPLACE VIEW dim_category AS
SELECT category_id, category_name FROM dim_content_category;
