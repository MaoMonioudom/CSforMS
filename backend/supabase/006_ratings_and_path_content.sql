-- =====================================================
-- LEARNING: STUDENT RATINGS + PER-PATH LESSON CONTENT
-- =====================================================
-- Run after 005_learning_tables.sql.
--
-- 1. course_ratings — one 1–5 star rating per enrolled student per course.
--    The course's displayed rating becomes AVG(stars) when ratings exist;
--    the old courses.rating column stays as the seed/fallback value shown
--    until the first real rating arrives.
--
-- 2. courses.ai_agent_url — link to the external AI agent embedded in the
--    Interactive path's guide panel (empty = keep the built-in demo chat).
--
-- 3. lessons.steps_body / lessons.interactive_body — separate content per
--    learning path. steps_body: one step per line (checklist). interactive_body:
--    optional; falls back to the basic body when empty.

CREATE TABLE course_ratings (
    rating_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    UNIQUE (course_id, user_id)
);

CREATE INDEX idx_ratings_course ON course_ratings(course_id);

-- Match the other learning tables: RLS on, no anon policies — all access
-- goes through the API's service-role client.
ALTER TABLE course_ratings ENABLE ROW LEVEL SECURITY;

ALTER TABLE courses ADD COLUMN ai_agent_url VARCHAR(500);

ALTER TABLE lessons ADD COLUMN steps_body TEXT;
ALTER TABLE lessons ADD COLUMN interactive_body TEXT;
