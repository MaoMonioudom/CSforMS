-- =====================================================
-- 003 — Inventory workflow gap-fill (ADDITIVE ONLY)
-- Creates the two tables the inventory UI needs that System_Full_DB.sql
-- doesn't have (requests approval queue, 3D filaments) and adds a few
-- nullable columns to existing inventory tables. No existing table is
-- renamed, altered in type, or dropped — other modules are unaffected.
-- =====================================================

-- 3D printing filament stock (per-material credit rate)
CREATE TABLE IF NOT EXISTS filaments (
    filament_id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,          -- 'PLA', 'PETG', 'ABS', ...
    color VARCHAR(50),
    hex VARCHAR(9),                      -- swatch shown in the UI

    stock_grams INTEGER NOT NULL DEFAULT 0 CHECK (stock_grams >= 0),
    rate INTEGER NOT NULL DEFAULT 4,     -- credits charged per gram

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('available', 'unavailable'))
        DEFAULT 'available',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student → staff approval queue. borrow_transactions only records
-- *approved* borrows; this table holds everything still pending:
-- borrow carts, credit top-ups, document printing, and 3D print jobs.
CREATE TABLE IF NOT EXISTS requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,

    request_type VARCHAR(20) NOT NULL
        CHECK (request_type IN ('borrow', 'credit_topup', 'printing', '3d_printing')),

    status VARCHAR(20) NOT NULL
        CHECK (status IN ('pending', 'approved', 'denied'))
        DEFAULT 'pending',

    -- borrow fields
    item_id INTEGER REFERENCES inventory_items(item_id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    due_date DATE,

    -- credit_topup fields
    amount_usd NUMERIC(10,2),

    -- printing / 3d_printing fields
    credits INTEGER,                     -- charge (computed at approval for 3D)
    pages INTEGER,                       -- printing only
    grams INTEGER,                       -- 3d only, staff fills at weigh-in
    filament_id INTEGER REFERENCES filaments(filament_id) ON DELETE SET NULL,

    note TEXT,
    order_id VARCHAR(100),               -- groups one multi-item cart checkout

    approved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user   ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_order  ON requests(order_id);

-- Lazy due-date/overdue alerts are regenerated on every notifications
-- fetch — the unique dedup key is what makes that idempotent.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dedup_key VARCHAR(255);
DO $$ BEGIN
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_dedup UNIQUE (user_id, dedup_key);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
END $$;

-- Low-stock warning threshold shown in the admin inventory manager.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 0;

-- Item photo (public URL in the 'item-images' storage bucket).
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Groups the borrow rows created from one cart checkout / counter sale.
ALTER TABLE borrow_transactions ADD COLUMN IF NOT EXISTS order_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_borrow_tx_user   ON borrow_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_tx_status ON borrow_transactions(status);

-- What an invoice was for (labels the admin Payments page):
-- 'item_purchase' | 'credit_topup' | 'membership' | 'printing' | '3d_printing' | 'fee'
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(30);

-- Lets staff mark a damage report as repaired.
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
ALTER TABLE maintenance_logs ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL;

-- =====================================================
-- Seeds — starter rows so the UI isn't empty. Safe to edit/re-run
-- individually; skip this section if you already have your own data.
-- =====================================================

INSERT INTO categories (category_name, description) VALUES
    ('Electronic Equipment',  'Oscilloscopes, power supplies, soldering stations'),
    ('Electronic Components', 'Sensors, ICs, resistors, dev boards'),
    ('CNC Machines',          'CNC routers, laser cutters, 3D printers'),
    ('Mechanical Tools',      'Hand tools, drills, saws'),
    ('Fasteners & Hardware',  'Screws, bolts, brackets'),
    ('Digital Devices',       'Laptops, tablets, cameras'),
    ('Raw Materials',         'Wood, acrylic, metal stock'),
    ('Electronic Tools',      'Multimeters, crimpers, wire strippers')
ON CONFLICT (category_name) DO NOTHING;

INSERT INTO location_items (location_name, zone_name, shelf_code) VALUES
    ('Makerspace Room', 'Zone A', 'A1'),
    ('Makerspace Room', 'Zone A', 'A2'),
    ('Makerspace Room', 'Zone B', 'B1'),
    ('Mechanic Room',   'Zone C', 'C1');

INSERT INTO filaments (name, color, hex, stock_grams, rate) VALUES
    ('PLA',  'White',  '#f5f5f5', 5000, 4),
    ('PLA',  'Black',  '#222222', 5000, 4),
    ('PETG', 'Clear',  '#d8ecf3', 3000, 5),
    ('ABS',  'Gray',   '#8a8f98', 2000, 6);
