/**
 * Seeds the learning tables from the frontend's demo course data.
 *
 * Prerequisite: run supabase/005_learning_tables.sql in the Supabase SQL
 * editor first.
 *
 * Usage (from backend/):  node scripts/seedLearning.js
 *
 * Idempotent-ish: refuses to run if any courses already exist, and reuses
 * lecturer accounts whose email already exists.
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";
import { courses as SEED_COURSES } from "../../frontend/src/data/courses.js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Demo lecturer accounts for the seed instructors. All share the password
// below — demo data only, change or remove for production.
const LECTURER_PASSWORD = "lecturer123";

function emailFor(name) {
  // "Dr. Sarah Chen" -> "sarah.chen@makerspace.edu" (titles stripped)
  const cleaned = name
    .replace(/^(Dr\.|Prof\.)\s*/i, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop accents (Müller -> Muller)
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${cleaned}@makerspace.edu`;
}

async function ensureLecturer(name) {
  const email = emailFor(name);
  const { data: existing, error: findError } = await db
    .from("users")
    .select("user_id, full_name")
    .eq("email", email)
    .maybeSingle();
  if (findError) throw findError;
  if (existing) {
    console.log(`  lecturer exists: ${name} <${email}> (user_id ${existing.user_id})`);
    return existing.user_id;
  }

  const user_name = email.split("@")[0].replace(/[^a-zA-Z0-9_.]/g, "");
  const password_hash = await bcrypt.hash(LECTURER_PASSWORD, 10);
  const { data: created, error } = await db
    .from("users")
    .insert({ full_name: name, email, user_name, password_hash, role: "lecturer" })
    .select("user_id")
    .single();
  if (error) throw error;
  console.log(`  created lecturer: ${name} <${email}> (user_id ${created.user_id})`);
  return created.user_id;
}

async function main() {
  const { count, error: countError } = await db
    .from("courses")
    .select("course_id", { count: "exact", head: true });
  if (countError) {
    console.error(
      "Could not read the courses table — did you run supabase/005_learning_tables.sql?\n",
      countError.message
    );
    process.exit(1);
  }
  if (count > 0) {
    console.log(`courses table already has ${count} rows — nothing to do.`);
    return;
  }

  console.log("Creating lecturer accounts…");
  const lecturerIds = {}; // "lect-1" -> user_id
  for (const course of SEED_COURSES) {
    if (course.instructorId && !(course.instructorId in lecturerIds)) {
      lecturerIds[course.instructorId] = await ensureLecturer(course.instructor);
    }
  }

  console.log("Inserting courses…");
  for (const course of SEED_COURSES) {
    const { data: created, error } = await db
      .from("courses")
      .insert({
        title: course.title,
        subtitle: course.subtitle || null,
        description: course.description || null,
        category: course.category || null,
        level: course.level || "Beginner",
        duration: course.duration || null,
        cover_color: course.coverColor || null,
        spine_color: course.spineColor || null,
        paths: course.paths?.length ? course.paths : ["basic"],
        interactive_price: course.interactivePrice ?? null,
        tags: course.tags || [],
        rating: course.rating ?? 0,
        instructor_id: lecturerIds[course.instructorId] ?? null,
      })
      .select("course_id")
      .single();
    if (error) throw error;

    const lessonRows = (course.lessons || []).map((l, i) => ({
      course_id: created.course_id,
      sort_order: i,
      title: l.title,
      duration: l.duration || null,
      lesson_type: l.type || "video",
      body: l.body || null,
      points: l.points || [],
    }));
    if (lessonRows.length) {
      const { error: lessonError } = await db.from("lessons").insert(lessonRows);
      if (lessonError) throw lessonError;
    }
    console.log(`  ${course.title} (course_id ${created.course_id}, ${lessonRows.length} lessons)`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
