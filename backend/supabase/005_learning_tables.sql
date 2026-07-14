-- =====================================================
-- LEARNING MODULE
-- =====================================================
-- Real tables replacing the frontend's localStorage course store
-- (frontend/src/data/courseStore.js). Follows the System_Full_DB
-- conventions: SERIAL PKs, integer FKs to users(user_id).
--
-- NOTE: this drops the legacy `courses` table created by
-- 001_profiles_and_courses.sql — that one was built for Supabase Auth
-- (uuid PK, RLS on auth.uid()) which the app no longer uses, and it is
-- missing every field the learning frontend needs. It currently holds a
-- single test row ("Intro to 3D Printing") which will be deleted.

DROP TABLE IF EXISTS public.courses CASCADE;

-- =====================================================
-- COURSES
-- =====================================================

CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,

    -- The lecturer teaching this course (users.role = 'lecturer').
    instructor_id INTEGER,

    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    category VARCHAR(100),

    level VARCHAR(20)
        CHECK (level IN ('Beginner', 'Intermediate', 'Advanced'))
        DEFAULT 'Beginner',

    duration VARCHAR(50),

    -- Book-styling used by the library UI (hex colors).
    cover_color VARCHAR(20),
    spine_color VARCHAR(20),

    -- Which learning paths this course offers. Values match the frontend
    -- tokens so no mapping layer is needed.
    paths TEXT[] NOT NULL DEFAULT '{basic}'
        CHECK (paths <@ ARRAY['basic', 'stepByStep', 'interactive']),

    -- Price (USD) of the interactive path; NULL when not offered/free.
    interactive_price NUMERIC(10,2),

    tags TEXT[] NOT NULL DEFAULT '{}',

    -- Placeholder until a real reviews feature exists; seeded courses
    -- carry their demo rating, new courses start at 0.
    rating NUMERIC(2,1) NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =====================================================
-- LESSONS
-- =====================================================

CREATE TABLE lessons (
    lesson_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,

    -- Position within the course; the editor re-writes all lessons on
    -- save, so this is just the array index.
    sort_order INTEGER NOT NULL DEFAULT 0,

    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50),

    lesson_type VARCHAR(20)
        CHECK (lesson_type IN ('video', 'reading', 'lab', 'project'))
        DEFAULT 'video',

    -- Lesson content as HTML (rendered by the BookReader).
    body TEXT,

    -- Key-takeaway bullet points shown on the lesson page.
    points TEXT[] NOT NULL DEFAULT '{}',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- =====================================================
-- ENROLLMENTS
-- =====================================================
-- One row per user per course; the "students" number on course cards is
-- COUNT(*) of this table, not a stored counter.

CREATE TABLE course_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    UNIQUE (course_id, user_id)
);

-- =====================================================
-- PATH UNLOCKS (mock purchases)
-- =====================================================
-- Records that a user unlocked a paid path on a course. No real payment
-- yet — the checkout modal is a mock; when a payment provider is added,
-- link rows here to invoices/payments.

CREATE TABLE course_unlocks (
    unlock_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    path VARCHAR(20) NOT NULL DEFAULT 'interactive'
        CHECK (path IN ('interactive')),

    -- Price at the moment of unlock, so later price changes don't rewrite
    -- history.
    price_paid NUMERIC(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    UNIQUE (course_id, user_id, path)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);

CREATE INDEX idx_lessons_course ON lessons(course_id, sort_order);

CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);

CREATE INDEX idx_unlocks_user ON course_unlocks(user_id);
