-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE,

    full_name VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),

    password_hash TEXT NOT NULL,
    profile_img_url TEXT,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('user', 'staff', 'admin'))
        DEFAULT 'user',

    bio TEXT,

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('active', 'inactive'))
        DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- =====================================================
-- 2. MEMBERSHIPS
-- =====================================================

CREATE TABLE memberships (
    membership_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    membership_status VARCHAR(20) NOT NULL
        CHECK (membership_status IN ('active', 'inactive', 'expired'))
        DEFAULT 'inactive',

    credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),

    start_date DATE NOT NULL,
    expired_date DATE NOT NULL,

    approved_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =====================================================
-- 3. ACHIEVEMENTS
-- =====================================================

CREATE TABLE achievements (
    achievement_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    user_achievement_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,

    UNIQUE (user_id, achievement_id)
);

-- =====================================================
-- 4. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    message TEXT NOT NULL,
    notification_type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =====================================================
-- 5. EVENTS
-- =====================================================

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),

    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    max_participants INTEGER,
    credit_reward INTEGER DEFAULT 0,

    created_by INTEGER,

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'))
        DEFAULT 'upcoming',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE event_registrations (
    registration_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,

    participant_status VARCHAR(20) DEFAULT 'registered'
        CHECK (participant_status IN ('registered', 'cancelled')),

    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,

    UNIQUE (user_id, event_id)
);

CREATE TABLE attendances (
    attendance_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,

    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,

    UNIQUE (user_id, event_id)
);

CREATE TABLE credit_transactions (
    transaction_id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL,

    transaction_type VARCHAR(10)
        CHECK (transaction_type IN ('earn', 'spend')),

    source_type VARCHAR(20)
        CHECK (source_type IN ('event', 'inventory', 'membership')),

    source_id INTEGER,

    amount INTEGER NOT NULL CHECK (amount > 0),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (membership_id) REFERENCES memberships(membership_id) ON DELETE CASCADE
);

-- =====================================================
-- 6. COMMUNITY SYSTEM
-- =====================================================

CREATE TABLE community_posts (
    post_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE post_comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE post_votes (
    vote_id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    vote_type VARCHAR(10)
        CHECK (vote_type IN ('upvote', 'downvote')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES community_posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

    UNIQUE (post_id, user_id)
);

-- =====================================================
-- 7. INVENTORY SYSTEM
-- =====================================================

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location_items (
    location_id SERIAL PRIMARY KEY,
    location_name VARCHAR(100),
    zone_name VARCHAR(100),
    shelf_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    item_id SERIAL PRIMARY KEY,

    category_id INTEGER,
    location_id INTEGER,

    is_returnable BOOLEAN DEFAULT TRUE,

    item_name VARCHAR(255) NOT NULL,
    description TEXT,

    current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),

    status VARCHAR(20)
        CHECK (status IN ('available', 'unavailable'))
        DEFAULT 'available',

    unit_credit INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES location_items(location_id) ON DELETE SET NULL
);

CREATE TABLE borrow_transactions (
    borrow_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,

    quantity_borrow INTEGER NOT NULL CHECK (quantity_borrow > 0),

    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,

    approved_by INTEGER,

    status VARCHAR(20)
        CHECK (status IN ('borrowed', 'returned', 'overdue'))
        DEFAULT 'borrowed',

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE return_transactions (
    return_id SERIAL PRIMARY KEY,
    borrow_id INTEGER NOT NULL,

    quantity_returned INTEGER DEFAULT 1 CHECK (quantity_returned > 0),

    is_damaged BOOLEAN DEFAULT FALSE,
    notes TEXT,

    received_by INTEGER,
    return_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (borrow_id) REFERENCES borrow_transactions(borrow_id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE item_additions (
    item_add_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,

    quantity_added INTEGER NOT NULL CHECK (quantity_added > 0),
    unit_price INTEGER,
    notes TEXT,

    added_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE maintenance_logs (
    maintenance_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,

    reported_by INTEGER,
    quantity_damaged INTEGER DEFAULT 1,

    notes TEXT,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =====================================================
-- 8. COMMERCE SYSTEM
-- =====================================================

CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    total_credit INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0,

    status VARCHAR(20)
        CHECK (status IN ('pending', 'paid', 'cancelled'))
        DEFAULT 'pending',

    payment_method VARCHAR(20),

    verified_by INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE purchase_items (
    purchase_item_id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,

    item_id INTEGER,

    quantity INTEGER DEFAULT 1,
    unit_price INTEGER DEFAULT 0,
    subtotal INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(item_id) ON DELETE SET NULL
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,

    transaction_id TEXT,
    payment_method VARCHAR(20),

    amount_paid INTEGER DEFAULT 0,

    payment_status VARCHAR(20)
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled'))
        DEFAULT 'pending',

    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE
);

-- =====================================================
-- 9. COLLABORATION SYSTEM
-- =====================================================
-- Just a "find team" post board — no join/apply workflow, no membership
-- tracking. The poster states the project, the roles they need, and how
-- big the team currently is; other students see it and reach out directly
-- via the contact info. Nothing here tracks who actually joined.

CREATE TABLE collaboration_posts (
    collab_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    project_title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    short_pitch TEXT,
    description TEXT,

    post_type VARCHAR(20) NOT NULL
        CHECK (post_type IN ('recruiting', 'looking_for_team'))
        DEFAULT 'recruiting',

    -- Both are just numbers the poster sets/updates themselves — not
    -- derived from any membership table.
    team_size_current INTEGER DEFAULT 1,
    team_size_target INTEGER,

    contact_email VARCHAR(255),
    contact_discord VARCHAR(100),
    contact_telegram VARCHAR(100),

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('open', 'closed'))
        DEFAULT 'open',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Roles a post is recruiting for (e.g. "Frontend Developer", "ML Engineer").
CREATE TABLE collaboration_roles (
    role_id SERIAL PRIMARY KEY,
    collab_id INTEGER NOT NULL,

    role_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (collab_id) REFERENCES collaboration_posts(collab_id) ON DELETE CASCADE
);

-- =====================================================
-- 10. TAGS (shared across events, posts, collaboration)
-- =====================================================
-- One flat table for every module instead of a vocabulary table + a
-- junction per entity — no canonical tag list, no FK on entity_id (it
-- points at a different parent table depending on entity_type, so the
-- database can't enforce it; cleanup on delete is handled by the app).
-- Reading tags for one item is a single indexed lookup, no join needed.
--
-- entity_type/entity_id say what the tag is attached to:
--   'event'         -> events.event_id
--   'post'          -> community_posts.post_id
--   'collaboration' -> collaboration_posts.collab_id (this is the
--                      skills[] list on the frontend)

CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,

    entity_type VARCHAR(20) NOT NULL
        CHECK (entity_type IN ('event', 'post', 'collaboration')),
    entity_id INTEGER NOT NULL,

    -- Store lowercase so "React" and "react" don't fragment into separate
    -- tags without needing a lookup table to enforce it.
    tag_name VARCHAR(50) NOT NULL
        CHECK (tag_name = lower(tag_name)),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Stops the same tag being attached twice to the same item.
    UNIQUE (entity_type, entity_id, tag_name)
);

-- =====================================================
-- 11. WORKSPACE BOOKING SYSTEM
-- =====================================================
-- The "request a personal working space" idea we discussed — modeled
-- separately from inventory_items because a desk/room is a time-slot
-- booking, not countable stock. Reuses location_items rather than
-- inventing a second location concept.

CREATE TABLE workspaces (
    workspace_id SERIAL PRIMARY KEY,

    workspace_name VARCHAR(100) NOT NULL,
    workspace_type VARCHAR(50), -- 'desk', 'bench', 'private_room', ...
    location_id INTEGER,
    capacity INTEGER DEFAULT 1,

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('available', 'unavailable'))
        DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (location_id) REFERENCES location_items(location_id) ON DELETE SET NULL
);

CREATE TABLE workspace_bookings (
    booking_id SERIAL PRIMARY KEY,
    workspace_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed'))
        DEFAULT 'pending',

    approved_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- =====================================================
-- 12. SCHEMA PATCHES — gap fixes on existing tables
-- =====================================================
-- Inventory (inventory_items, borrow_transactions) is left untouched for
-- now, on purpose — not ready to revisit that yet.

-- Event cards/polaroids show a cover photo; events had no column for one.
ALTER TABLE events ADD COLUMN image_url TEXT;

-- =====================================================
-- INDEXES (GLOBAL)
-- =====================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(membership_status);

CREATE INDEX idx_events_status ON events(status);

CREATE INDEX idx_inventory_stock ON inventory_items(current_stock);

CREATE INDEX idx_posts_created ON community_posts(created_at);
CREATE INDEX idx_votes_post ON post_votes(post_id);

CREATE INDEX idx_collab_status ON collaboration_posts(status);

-- "get tags for this item" — the common read, e.g. rendering a card.
CREATE INDEX idx_tags_entity ON tags(entity_type, entity_id);
-- "find everything tagged X" / trending tags — works without a vocabulary
-- table because tag_name is normalized to lowercase on the way in.
CREATE INDEX idx_tags_name ON tags(tag_name);

CREATE INDEX idx_workspace_bookings_workspace ON workspace_bookings(workspace_id);
CREATE INDEX idx_workspace_bookings_status ON workspace_bookings(status);
