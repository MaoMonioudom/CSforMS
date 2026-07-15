-- =====================================================
-- Links a user row to a Microsoft (Azure AD) identity so "Continue with
-- Microsoft" and the Microsoft-verified password-reset flow can find/link
-- accounts.
-- =====================================================

ALTER TABLE users
    ADD COLUMN microsoft_id VARCHAR(255) UNIQUE,
    ADD COLUMN microsoft_linked_at TIMESTAMP;
