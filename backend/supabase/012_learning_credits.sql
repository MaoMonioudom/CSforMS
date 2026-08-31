-- =====================================================
-- LEARNING: CHARGE CREDITS INSTEAD OF MOCK USD CHECKOUT
-- =====================================================
-- The interactive path was gated behind a mock USD checkout (no real
-- payment provider ever existed). Replacing it with the credit wallet
-- already used by membership/inventory: interactive_price now holds a
-- whole number of credits, and unlocking spends from memberships.credits
-- via the shared adjustCredits() helper instead of just recording a paid
-- amount.

-- credits are always whole numbers (memberships.credits is INTEGER), and
-- NUMERIC(10,2) invited fractional-dollar values that no longer make sense.
ALTER TABLE courses ALTER COLUMN interactive_price TYPE INTEGER USING ROUND(interactive_price)::INTEGER;
ALTER TABLE courses ADD CONSTRAINT courses_interactive_price_nonnegative CHECK (interactive_price IS NULL OR interactive_price >= 0);

ALTER TABLE course_unlocks ALTER COLUMN price_paid TYPE INTEGER USING ROUND(price_paid)::INTEGER;

-- adjustCredits() logs every spend against credit_transactions.source_type;
-- 'learning' didn't exist yet because unlocks never touched the wallet.
ALTER TABLE credit_transactions DROP CONSTRAINT credit_transactions_source_type_check;
ALTER TABLE credit_transactions ADD CONSTRAINT credit_transactions_source_type_check
    CHECK (source_type IN ('event', 'inventory', 'membership', 'learning'));
