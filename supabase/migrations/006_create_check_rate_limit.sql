-- Migration 006: atomic rate-limit check for quote submissions.
-- Prerequisite: migration 005 (public.rate_limits) has been applied.
-- The caller must pass the lowercase HMAC-SHA256 hash of
-- identifier || ':' || action, never a raw IP address.

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier_hash TEXT,
  p_action TEXT,
  p_max_count INTEGER,
  p_window_minutes INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_window INTERVAL;
  v_limit public.rate_limits%ROWTYPE;
  v_reset_at TIMESTAMPTZ;
  v_allowed BOOLEAN;
BEGIN
  IF p_identifier_hash IS NULL OR p_identifier_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'p_identifier_hash must be a lowercase HMAC-SHA256 hex digest';
  END IF;

  IF p_action IS NULL OR length(p_action) < 1 OR length(p_action) > 100 THEN
    RAISE EXCEPTION 'p_action must contain between 1 and 100 characters';
  END IF;

  IF p_max_count IS NULL OR p_max_count < 1 OR p_max_count > 100000 THEN
    RAISE EXCEPTION 'p_max_count is outside the permitted range';
  END IF;

  IF p_window_minutes IS NULL OR p_window_minutes < 1 OR p_window_minutes > 10080 THEN
    RAISE EXCEPTION 'p_window_minutes is outside the permitted range';
  END IF;

  v_window := p_window_minutes * INTERVAL '1 minute';

  INSERT INTO public.rate_limits AS current_limit (
    identifier_hash,
    action,
    attempts,
    window_started_at,
    blocked_until
  )
  VALUES (
    p_identifier_hash,
    p_action,
    1,
    v_now,
    NULL
  )
  ON CONFLICT (identifier_hash, action)
  DO UPDATE SET
    attempts = CASE
      WHEN current_limit.window_started_at + v_window <= v_now THEN 1
      WHEN current_limit.blocked_until > v_now THEN current_limit.attempts
      ELSE current_limit.attempts + 1
    END,
    window_started_at = CASE
      WHEN current_limit.window_started_at + v_window <= v_now THEN v_now
      ELSE current_limit.window_started_at
    END,
    blocked_until = CASE
      WHEN current_limit.window_started_at + v_window <= v_now THEN NULL
      WHEN current_limit.blocked_until > v_now THEN current_limit.blocked_until
      WHEN current_limit.attempts + 1 > p_max_count THEN current_limit.window_started_at + v_window
      ELSE NULL
    END
  RETURNING * INTO v_limit;

  v_reset_at := v_limit.window_started_at + v_window;
  v_allowed := v_limit.attempts <= p_max_count
    AND (v_limit.blocked_until IS NULL OR v_limit.blocked_until <= v_now);

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'count', v_limit.attempts,
    'limit', p_max_count,
    'remaining', greatest(p_max_count - v_limit.attempts, 0),
    'resetAt', v_reset_at
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;

COMMENT ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) IS
  'Atomically increments and checks one rate_limits counter. '
  'Accepts only an HMAC-SHA256 identifier hash and is executable only by service_role.';

-- Keep counters for at least the longest window accepted by check_rate_limit.
-- Migration 005's default one-hour cleanup interval must not erase a daily
-- counter before its own window expires.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits(
  p_window_hours INTEGER DEFAULT 1
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_retention_hours INTEGER;
  v_deleted INTEGER;
BEGIN
  IF p_window_hours IS NULL OR p_window_hours <= 0 THEN
    RAISE EXCEPTION 'p_window_hours must be greater than zero';
  END IF;

  v_retention_hours := greatest(p_window_hours, 168);

  DELETE FROM public.rate_limits
  WHERE window_started_at < clock_timestamp() - (v_retention_hours * INTERVAL '1 hour')
    AND (blocked_until IS NULL OR blocked_until < clock_timestamp());

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits(INTEGER) TO service_role;
