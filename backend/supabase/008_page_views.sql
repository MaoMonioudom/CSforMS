-- =====================================================
-- SITE ANALYTICS: PAGE VIEWS
-- =====================================================
-- Real visit tracking for the admin Dashboard, replacing the fabricated
-- Math.sin/Math.cos "Platform Activity" chart that used to live on
-- AdminUsers.jsx (deleted — there was no real data behind it).
--
-- user_id is nullable — guests get tracked too (path/viewed_at only),
-- logged-in visits also carry who it was for a later members-vs-guests
-- breakdown if that's wanted.

CREATE TABLE page_views (
    view_id SERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    user_id INTEGER,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- The only access pattern right now is "everything since some cutoff date".
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
