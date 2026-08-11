-- =====================================================
-- EVENT PHOTO GALLERY LINK
-- =====================================================
-- Separate from event_images (010) — that's the poster/cover gallery shown
-- before/during the event. This is an outbound link (e.g. a Google Drive
-- folder) staff add *after* the event for the full photo dump, which isn't
-- practical to re-upload image-by-image through the admin editor.
-- NULL until staff set it; the detail page shows a "coming soon" placeholder
-- in the meantime (only once the event has ended).

ALTER TABLE events ADD COLUMN gallery_url TEXT;
