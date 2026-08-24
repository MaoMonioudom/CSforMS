/**
 * One-off import: rows 173-213 of "Makerspace Inventory 2026 - DB Import v2.xlsx"
 * (Robocon electronics tail of CAT3 + all of CAT4 consumables/raw materials)
 * into the live inventory_items table, including uploading each item's photo
 * to the item-images storage bucket.
 *
 * The manifest (item fields + base64 photo data) is pre-built by a separate
 * script from the source spreadsheet — see MANIFEST_PATH below. Kept out of
 * the repo since it embeds ~12MB of photo data.
 *
 * Usage (from backend/):  node scripts/seedInventoryImport2026.js [manifestPath]
 *
 * Idempotent: skips any item whose name already exists in inventory_items
 * (case-insensitive), so it's safe to re-run after a partial failure.
 */
import "dotenv/config";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const MANIFEST_PATH =
  process.argv[2] || "./import_manifest.json";

function normalizeRoom(raw) {
  const r = raw.toLowerCase();
  if (r.includes("makerspace")) return "Makerspace Room";
  if (r.includes("mechanic")) return "Mechanic Room";
  return raw;
}

// Mirrors frontend/src/lib/inventory/api.js resolveLocation() so imported
// rows use the exact same location_items shape the app's own UI creates.
async function resolveLocationId(locationStr, locationCache) {
  const parts = locationStr.split(" - ");
  const room = normalizeRoom(parts[0].trim());
  const zone = parts[1]?.trim() || null;

  if (!zone) {
    const hit = locationCache.find((l) => l.location_name === room && !l._imported);
    if (hit) return hit.location_id;
    console.warn(`  ! no existing location row for room "${room}" with no zone — leaving location_id null`);
    return null;
  }

  const existing = locationCache.find((l) => l.shelf_code === zone);
  if (existing) return existing.location_id;

  const zonePrefix = zone.match(/^[A-Za-z]+/)?.[0] || zone;
  const { data, error } = await db
    .from("location_items")
    .insert({ location_name: room, zone_name: `Zone ${zonePrefix}`, shelf_code: zone })
    .select("location_id, location_name, zone_name, shelf_code")
    .single();
  if (error) throw error;
  data._imported = true;
  locationCache.push(data);
  console.log(`  created location: ${room} / ${data.zone_name} / ${zone}`);
  return data.location_id;
}

async function uploadImage(item) {
  if (!item.image) return null;
  const buffer = Buffer.from(item.image.base64, "base64");
  const ext = `.${item.image.extension}`;
  const path = `items/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const contentType = ext === ".jpeg" || ext === ".jpg" ? "image/jpeg" : `image/${item.image.extension}`;

  const { error } = await db.storage.from("item-images").upload(path, buffer, { contentType, upsert: false });
  if (error) {
    console.warn(`  ! image upload failed for "${item.name}": ${error.message}`);
    return null;
  }
  const { data } = db.storage.from("item-images").getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const items = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  console.log(`Loaded ${items.length} items from manifest.`);

  const { data: categories, error: catErr } = await db.from("categories").select("category_id, category_name");
  if (catErr) throw catErr;
  const { data: locations, error: locErr } = await db
    .from("location_items")
    .select("location_id, location_name, zone_name, shelf_code");
  if (locErr) throw locErr;
  const { data: existingItems, error: itemErr } = await db.from("inventory_items").select("item_name");
  if (itemErr) throw itemErr;
  const existingNames = new Set(existingItems.map((i) => i.item_name.trim().toLowerCase()));

  let created = 0, skipped = 0, failed = 0;

  for (const item of items) {
    const key = item.name.trim().toLowerCase();
    if (existingNames.has(key)) {
      console.log(`skip (already exists): ${item.name}`);
      skipped++;
      continue;
    }

    const category = categories.find((c) => c.category_name === item.category);
    if (!category) {
      console.warn(`! no category "${item.category}" for "${item.name}" — skipping`);
      failed++;
      continue;
    }

    let location_id;
    try {
      location_id = await resolveLocationId(item.location, locations);
    } catch (err) {
      console.warn(`! location resolution failed for "${item.name}": ${err.message}`);
      failed++;
      continue;
    }

    const image_url = await uploadImage(item);

    const { data: createdItem, error } = await db
      .from("inventory_items")
      .insert({
        item_name: item.name,
        description: item.description,
        is_returnable: item.is_returnable,
        unit_credit: Number(item.credits) || 0,
        current_stock: Number(item.stock) || 0,
        min_stock: Number(item.min_stock) || 0,
        status: item.status === "available" ? "available" : "unavailable",
        category_id: category.category_id,
        location_id,
        image_url,
      })
      .select("item_id")
      .single();

    if (error) {
      console.warn(`! insert failed for "${item.name}": ${error.message}`);
      failed++;
      continue;
    }

    existingNames.add(key);
    console.log(`created: ${item.name} (item_id ${createdItem.item_id}${image_url ? ", with photo" : ""})`);
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (already existed), failed ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
