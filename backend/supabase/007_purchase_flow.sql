-- 007 — Purchase-approval flow + staff borrow notes.
-- Run this in the Supabase SQL editor before deploying the matching code.

-- 1. Student self-purchases now go through staff approval (like borrows):
--    the cart creates a pending 'purchase' request, and credits/stock are
--    only deducted when staff approve it in Request Management.
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_request_type_check;
ALTER TABLE requests ADD CONSTRAINT requests_request_type_check
    CHECK (request_type IN ('borrow', 'purchase', 'credit_topup', 'printing', '3d_printing'));

-- 2. Staff counter borrows can now carry the student's borrow purpose.
ALTER TABLE borrow_transactions ADD COLUMN IF NOT EXISTS note TEXT;
