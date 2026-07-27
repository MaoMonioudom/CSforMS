-- =====================================================
-- ATOMIC EVENT REGISTRATION
-- =====================================================
-- Fixes a real race condition: eventRegistrations.routes.js's POST
-- /:id/register handler used to check "started?" / "cancelled?" /
-- "full?" and then insert as 3 separate round trips from Node. Two
-- requests for the same event arriving close enough together could both
-- pass the capacity check before either had inserted, over-filling the
-- event (the same "2/1 registered" bug the app-level fix solved for the
-- sequential case, but still possible for truly concurrent clicks).
--
-- This function does the same checks, but as ONE database transaction —
-- `FOR UPDATE` locks the event row, so a second concurrent call for the
-- same event blocks until the first one finishes (commit or rollback)
-- instead of reading a stale, pre-insert count.
--
-- All registration business rules now live here, not duplicated in the
-- Express handler — this codebase has already been bitten once by
-- SQL/app-code drift (inventory tables, notifications, tags), so the
-- route just calls this and translates the result.

CREATE OR REPLACE FUNCTION register_for_event(p_event_id INTEGER, p_user_id INTEGER)
RETURNS event_registrations
LANGUAGE plpgsql
AS $$
DECLARE
  v_event   events%ROWTYPE;
  v_existing event_registrations%ROWTYPE;
  v_count   INTEGER;
  v_result  event_registrations%ROWTYPE;
BEGIN
  -- Locks this event's row for the duration of the transaction — a
  -- concurrent call for the SAME event waits here; calls for other
  -- events are unaffected.
  SELECT * INTO v_event FROM events WHERE event_id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_event.status = 'cancelled' THEN
    RAISE EXCEPTION 'EVENT_CANCELLED';
  END IF;

  -- start_date is stored as a naive UTC timestamp (see normalizeTimestamps.js's
  -- comment on this exact convention) — compare against now() converted to
  -- the same naive-UTC shape, not the session's local timezone.
  IF v_event.start_date <= (now() AT TIME ZONE 'UTC') THEN
    RAISE EXCEPTION 'EVENT_STARTED';
  END IF;

  -- Re-registering (e.g. a retried request) shouldn't be blocked by
  -- capacity — the user already holds a spot, not taking a new one.
  SELECT * INTO v_existing FROM event_registrations
    WHERE event_id = p_event_id AND user_id = p_user_id;
  IF FOUND AND v_existing.participant_status = 'registered' THEN
    RETURN v_existing;
  END IF;

  IF v_event.max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM event_registrations
      WHERE event_id = p_event_id AND participant_status = 'registered';
    IF v_count >= v_event.max_participants THEN
      RAISE EXCEPTION 'EVENT_FULL';
    END IF;
  END IF;

  INSERT INTO event_registrations (event_id, user_id, participant_status)
  VALUES (p_event_id, p_user_id, 'registered')
  ON CONFLICT (user_id, event_id) DO UPDATE SET participant_status = 'registered'
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;
