-- =====================================================
-- EVENT IMAGES + REGISTRATION MODE
-- =====================================================
-- Events used to carry exactly one image (events.image_url). Staff now
-- need a gallery — an event may have several photos/poster images, one
-- of which is the "cover" shown on cards. event_images mirrors the
-- lessons table's shape (parent FK + sort_order, rewritten wholesale on
-- every save from the admin editor) rather than diffed in place.
--
-- events.image_url is kept (not dropped) as the legacy single-image
-- column — the backend keeps writing it as a copy of the first/cover
-- image so anything still reading it directly doesn't break.

CREATE TABLE event_images (
    image_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,

    image_url TEXT NOT NULL,

    -- Position within the event; index 0 is the cover image shown on
    -- cards/thumbnails. The editor re-writes all images on save, so this
    -- is just the array index (same convention as lessons.sort_order).
    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE INDEX idx_event_images_event ON event_images(event_id, sort_order);

-- Per-event registration mode: NULL (default) means registration stays
-- in-app via register_for_event(); when set, the event links out to an
-- external form instead (e.g. an outside org running its own signup).
-- Capacity/registrant tracking still applies either way — see the
-- admin-only manual-registrant endpoint added alongside this migration.
ALTER TABLE events ADD COLUMN registration_url TEXT;
