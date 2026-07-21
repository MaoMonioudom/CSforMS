-- =====================================================
-- WORKSPACE BOOKING: SEED DESKS
-- =====================================================
-- The `workspaces` / `workspace_bookings` tables (System_Full_DB.sql,
-- section 11) were defined but never actually used — the request/approval
-- UI was backed by a hardcoded list in the frontend (localStorage) instead.
-- Seeds the same 5 desks that were hardcoded, so switching the UI over to
-- the real tables doesn't change what members see.
--
-- workspace_type doubles as the display "zone" (Quiet Zone/Collaboration
-- Zone/Standing Zone) here rather than a desk/bench/room category — there's
-- no separate zone column, and it's a free-text VARCHAR with no CHECK
-- constraint, so this is a deliberate repurposing, not a workaround.

INSERT INTO workspaces (workspace_name, workspace_type, capacity, status) VALUES
  ('Quiet Desk 1',    'Quiet Zone',         1, 'available'),
  ('Quiet Desk 2',    'Quiet Zone',         1, 'available'),
  ('Collab Bench 1',  'Collaboration Zone', 1, 'available'),
  ('Collab Bench 2',  'Collaboration Zone', 1, 'available'),
  ('Standing Desk 1', 'Standing Zone',      1, 'available');
