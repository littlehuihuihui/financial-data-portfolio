-- =============================================================================
-- DIM 未知维行初始化（sk=-1），满足「维度 NULL → -1」运行期约定
-- =============================================================================
USE retail_kimball;

INSERT IGNORE INTO dim_date (date_sk, date_id, year_num, quarter_num, month_num, week_of_year, day_of_week, is_weekend, is_holiday, month_label)
VALUES (-1, '1970-01-01', 0, 0, 0, 0, 0, 'N', 'N', '1970-01');

INSERT IGNORE INTO dim_region (region_sk, region_bk, province_code, province_name, city_code, city_name, district_name, city_tier, zone_name, region_status)
VALUES (-1, '-1', '-1', 'UNKNOWN', '-1', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'ACTIVE');

INSERT IGNORE INTO dim_channel (channel_sk, channel_code, channel_name, channel_type, platform_name, is_paid_channel, owner_dept, parent_channel_sk, channel_status)
VALUES (-1, '-1', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'N', 'UNKNOWN', -1, 'ACTIVE');

INSERT IGNORE INTO dim_payment_method (pay_method_sk, pay_method_code, pay_method_name, pay_vendor, pay_channel_type, fee_rate_pct, is_installment, settle_cycle, pay_method_status)
VALUES (-1, '-1', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 0, 'N', 'NA', 'ACTIVE');

INSERT IGNORE INTO dim_member (member_sk, member_id, register_date, gender, age_group, city_tier, member_level, member_status, first_channel_sk, lifecycle_stage, is_paid_member)
VALUES (-1, -1, '1970-01-01', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', -1, 'UNKNOWN', 'N');

INSERT IGNORE INTO dim_product (product_sk, sku_id, spu_id, product_name, brand_name, category_l1, category_l2, category_l3, list_price, cost_std, product_status)
VALUES (-1, -1, -1, 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', 0, 0, 'OFF');

INSERT IGNORE INTO dim_store (store_sk, store_id, store_name, store_type, region_sk, area_sqm, open_date, manager_name, store_status)
VALUES (-1, -1, 'UNKNOWN', 'UNKNOWN', -1, 0, '1970-01-01', '', 'CLOSED');

INSERT IGNORE INTO dim_promotion (promo_sk, promo_id, promo_name, promo_type, discount_mode, start_date, end_date, budget_amount, promo_status)
VALUES (-1, -1, 'UNKNOWN', 'UNKNOWN', 'UNKNOWN', '1970-01-01', '1970-01-01', 0, 'ENDED');

INSERT IGNORE INTO dim_expense_type (expense_type_sk, expense_type_code, expense_type_name, expense_category, is_variable, gl_account, owner_dept, expense_type_status, is_unknown)
VALUES (-1, '-1', 'UNKNOWN', 'UNKNOWN', 'N', '-1', 'UNKNOWN', 'ACTIVE', 1);
