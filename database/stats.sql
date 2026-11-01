-- database/stats.sql

/* ─────────────────────────────────────────────────────────────
   STATS
   Totals shown on History (both roles) and on each card in Manage cards.
   Only paid orders count. Money rules match the app:
     earned (holder) = holder_share
     saved (requester) = order_amount - (actual_amount_paid + holder_share)
     discount % = (order_amount - actual_amount_paid) / order_amount
   "This month" and "last month" use Pakistan time.
   ───────────────────────────────────────────────────────────── */


-- One row per card the user owns, including cards with no orders yet.
CREATE OR REPLACE FUNCTION get_card_stats(
  p_user_id VARCHAR(36)
) RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(s ORDER BY s.created_at DESC, s.card_id), '[]'::json)
    FROM (
      SELECT
        c.id AS card_id,
        c.created_at,
        COALESCE(SUM(t.holder_share), 0)::INT AS earned,
        COUNT(t.id)::INT AS orders,
        COALESCE(
          ROUND(AVG(
            (t.order_amount - t.actual_amount_paid)::NUMERIC * 100 / NULLIF(t.order_amount, 0)
          ))::INT,
          0
        ) AS avg_discount
      FROM cards c
      LEFT JOIN transactions t
        ON t.card_id = c.id
        AND t.card_holder_id = p_user_id
        AND t.txn_status = 'paid'
        AND t.actual_amount_paid IS NOT NULL
      WHERE c.user_id = p_user_id
      GROUP BY c.id, c.created_at
    ) s
  );
END;
$$ LANGUAGE plpgsql;


-- Totals for both roles: all time, this month, last month.
CREATE OR REPLACE FUNCTION get_user_stats(
  p_user_id VARCHAR(36)
) RETURNS JSON AS $$
DECLARE
  v_this_start BIGINT;
  v_last_start BIGINT;
BEGIN
  v_this_start := (
    extract(epoch FROM (date_trunc('month', now() AT TIME ZONE 'Asia/Karachi') AT TIME ZONE 'Asia/Karachi')) * 1000
  )::BIGINT;
  v_last_start := (
    extract(epoch FROM ((date_trunc('month', now() AT TIME ZONE 'Asia/Karachi') - INTERVAL '1 month') AT TIME ZONE 'Asia/Karachi')) * 1000
  )::BIGINT;

  RETURN (
    SELECT json_build_object(
      'holder', json_build_object(
        'earned_all', COALESCE(SUM(t.holder_share) FILTER (WHERE t.card_holder_id = p_user_id), 0)::INT,
        'earned_month', COALESCE(SUM(t.holder_share) FILTER (
          WHERE t.card_holder_id = p_user_id AND t.updated_at >= v_this_start
        ), 0)::INT,
        'earned_last_month', COALESCE(SUM(t.holder_share) FILTER (
          WHERE t.card_holder_id = p_user_id AND t.updated_at >= v_last_start AND t.updated_at < v_this_start
        ), 0)::INT,
        'orders_all', COUNT(*) FILTER (WHERE t.card_holder_id = p_user_id)::INT,
        'orders_month', COUNT(*) FILTER (
          WHERE t.card_holder_id = p_user_id AND t.updated_at >= v_this_start
        )::INT
      ),
      'requester', json_build_object(
        'saved_all', COALESCE(SUM(t.order_amount - (t.actual_amount_paid + t.holder_share)) FILTER (
          WHERE t.requester_id = p_user_id
        ), 0)::INT,
        'saved_month', COALESCE(SUM(t.order_amount - (t.actual_amount_paid + t.holder_share)) FILTER (
          WHERE t.requester_id = p_user_id AND t.updated_at >= v_this_start
        ), 0)::INT,
        'saved_last_month', COALESCE(SUM(t.order_amount - (t.actual_amount_paid + t.holder_share)) FILTER (
          WHERE t.requester_id = p_user_id AND t.updated_at >= v_last_start AND t.updated_at < v_this_start
        ), 0)::INT,
        'orders_all', COUNT(*) FILTER (WHERE t.requester_id = p_user_id)::INT,
        'orders_month', COUNT(*) FILTER (
          WHERE t.requester_id = p_user_id AND t.updated_at >= v_this_start
        )::INT
      )
    )
    FROM transactions t
    WHERE t.txn_status = 'paid'
    AND t.actual_amount_paid IS NOT NULL
    AND t.holder_share IS NOT NULL
    AND (t.requester_id = p_user_id OR t.card_holder_id = p_user_id)
  );
END;
$$ LANGUAGE plpgsql;
