-- Lab Services: what shows up as a bookable service card on the Lab Service
-- page (Document Printing, 3D Printing, CNC machines, and whatever staff add
-- later). Previously hardcoded in frontend/src/lib/inventory/data.js and
-- derived by category/name-matching in ServicePage.jsx — this table replaces
-- both, so it's editable from Manage Stock instead of requiring a code change.
--
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists lab_services (
  service_id serial primary key,
  name varchar not null,
  description text,
  pricing_type varchar not null check (pricing_type in ('per_page', 'material_hourly', 'hourly')),
  linked_item_id integer references inventory_items(item_id) on delete set null,
  config jsonb not null default '{}'::jsonb,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);

-- Seed: Document Printing — same A4/A3 × B&W/Color rates that were
-- previously hardcoded as PAPER_PRICING in data.js, now editable in the UI.
insert into lab_services (name, description, pricing_type, config, sort_order)
select 'Document Printing', 'Epson PX-M730F — A4/A3, B&W or Color, per page', 'per_page',
       '{"A4":{"bw":2,"color":4},"A3":{"bw":4,"color":8}}'::jsonb, 0
where not exists (select 1 from lab_services where name = 'Document Printing');

-- Seed: 3D Printing — linked to whichever "CNC Machines" category item has
-- "bambu" in its name (same match ServicePage.jsx used to do in code).
insert into lab_services (name, description, pricing_type, linked_item_id, sort_order)
select '3D Printing', 'Filament weight + machine time', 'material_hourly', ii.item_id, 1
from inventory_items ii
join categories c on c.category_id = ii.category_id
where c.category_name = 'CNC Machines' and ii.item_name ilike '%bambu%'
  and not exists (select 1 from lab_services where name = '3D Printing')
limit 1;

-- Seed: one hourly service per remaining "CNC Machines" item (everything
-- except the Bambu printer already claimed above) — same as the old
-- automatic "every CNC-category item becomes a service card" behavior.
insert into lab_services (name, description, pricing_type, linked_item_id, sort_order)
select ii.item_name, coalesce(ii.description, 'CNC machine time, billed per hour'), 'hourly', ii.item_id,
       2 + row_number() over (order by ii.item_name)
from inventory_items ii
join categories c on c.category_id = ii.category_id
where c.category_name = 'CNC Machines'
  and ii.item_id not in (select linked_item_id from lab_services where linked_item_id is not null);
