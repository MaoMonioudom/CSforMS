import bcrypt from "bcrypt";
import { supabaseAdmin, assertSupabaseConfigured } from "../../config/supabaseClient.js";
import { uniqueUserNameFromEmail } from "../../shared/userAccounts.js";

const SALT_ROUNDS = 10;
const STAFF_ROLES = ["admin", "staff"];

// Everything the frontend course shape needs in one query: instructor name
// via the FK to users, lessons nested, and the enrollment count (the
// "students" number is derived, never stored).
const COURSE_SELECT = `
  *,
  instructor:users(user_id, full_name),
  lessons(*),
  course_enrollments(count)
`;

// ---------------------------------------------------------------------------
// Mappers — the API speaks the frontend's camelCase course shape (the one
// data/courses.js established), so no page or component needs to change
// how it reads a course.

function toFrontendLesson(row) {
  return {
    id: row.lesson_id,
    title: row.title,
    duration: row.duration || "",
    type: row.lesson_type || "video",
    body: row.body || "",
    points: row.points || [],
  };
}

function toFrontendCourse(row) {
  const lessons = [...(row.lessons || [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(toFrontendLesson);
  return {
    id: row.course_id,
    title: row.title,
    subtitle: row.subtitle || "",
    category: row.category || "",
    coverColor: row.cover_color || undefined,
    spineColor: row.spine_color || undefined,
    level: row.level || "Beginner",
    duration: row.duration || "",
    students: row.course_enrollments?.[0]?.count ?? 0,
    rating: row.rating != null ? Number(row.rating) : 0,
    paths: row.paths?.length ? row.paths : ["basic"],
    interactivePrice: row.interactive_price != null ? Number(row.interactive_price) : undefined,
    description: row.description || "",
    instructor: row.instructor?.full_name || "",
    instructorId: row.instructor?.user_id ?? row.instructor_id ?? null,
    tags: row.tags || [],
    lessons,
  };
}

function toCourseRow(payload) {
  return {
    title: payload.title,
    subtitle: payload.subtitle || null,
    description: payload.description || null,
    category: payload.category || null,
    level: payload.level || "Beginner",
    duration: payload.duration || null,
    cover_color: payload.coverColor || null,
    spine_color: payload.spineColor || null,
    paths: Array.isArray(payload.paths) && payload.paths.length ? payload.paths : ["basic"],
    interactive_price: payload.interactivePrice ?? null,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    instructor_id: payload.instructorId || null,
  };
}

function toLessonRows(courseId, lessons) {
  return (Array.isArray(lessons) ? lessons : []).map((l, i) => ({
    course_id: courseId,
    sort_order: i,
    title: l.title || "Untitled lesson",
    duration: l.duration || null,
    lesson_type: l.type || "video",
    body: l.body || null,
    points: Array.isArray(l.points) ? l.points : [],
  }));
}

async function fetchCourse(courseId) {
  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(COURSE_SELECT)
    .eq("course_id", courseId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Lecturers may only touch their own courses; admin/staff may touch any.
function canEditCourse(user, courseRow) {
  if (STAFF_ROLES.includes(user.role)) return true;
  return user.role === "lecturer" && courseRow.instructor_id === user.user_id;
}

// ---------------------------------------------------------------------------
// Courses

// Catalog reads go through the service-role client (like every other module
// here): the learning tables have RLS enabled with no anon policies, so the
// anon-key client sees zero rows. The API is the trust boundary — these two
// endpoints only ever return the public course shape.
export async function listCourses(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select(COURSE_SELECT)
      .order("course_id");
    if (error) throw error;
    res.json({ data: data.map(toFrontendCourse) });
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req, res, next) {
  if (!assertSupabaseConfigured(res)) return;
  try {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select(COURSE_SELECT)
      .eq("course_id", req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Course not found" });
    res.json({ data: toFrontendCourse(data) });
  } catch (err) {
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    if (!req.body?.title?.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    const row = toCourseRow(req.body);
    // A lecturer always creates courses under their own name, no matter
    // what instructorId the client sent.
    if (req.user.role === "lecturer") row.instructor_id = req.user.user_id;

    const { data: created, error } = await supabaseAdmin
      .from("courses")
      .insert(row)
      .select("course_id")
      .single();
    if (error) throw error;

    const lessonRows = toLessonRows(created.course_id, req.body.lessons);
    if (lessonRows.length) {
      const { error: lessonError } = await supabaseAdmin.from("lessons").insert(lessonRows);
      if (lessonError) throw lessonError;
    }

    res.status(201).json({ data: toFrontendCourse(await fetchCourse(created.course_id)) });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const courseId = req.params.id;
    const { data: existing, error: findError } = await supabaseAdmin
      .from("courses")
      .select("course_id, instructor_id")
      .eq("course_id", courseId)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user, existing)) {
      return res.status(403).json({ error: "You can only edit your own courses" });
    }

    const row = toCourseRow(req.body);
    if (req.user.role === "lecturer") row.instructor_id = req.user.user_id;
    row.updated_at = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("courses")
      .update(row)
      .eq("course_id", courseId);
    if (updateError) throw updateError;

    // The editor always submits the full lesson list, so replacing them
    // wholesale is simpler than diffing.
    if (Array.isArray(req.body.lessons)) {
      const { error: clearError } = await supabaseAdmin
        .from("lessons")
        .delete()
        .eq("course_id", courseId);
      if (clearError) throw clearError;
      const lessonRows = toLessonRows(Number(courseId), req.body.lessons);
      if (lessonRows.length) {
        const { error: lessonError } = await supabaseAdmin.from("lessons").insert(lessonRows);
        if (lessonError) throw lessonError;
      }
    }

    res.json({ data: toFrontendCourse(await fetchCourse(courseId)) });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const { data: existing, error: findError } = await supabaseAdmin
      .from("courses")
      .select("course_id, instructor_id")
      .eq("course_id", req.params.id)
      .maybeSingle();
    if (findError) throw findError;
    if (!existing) return res.status(404).json({ error: "Course not found" });
    if (!canEditCourse(req.user, existing)) {
      return res.status(403).json({ error: "You can only delete your own courses" });
    }

    const { error } = await supabaseAdmin.from("courses").delete().eq("course_id", req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Lecturers — thin admin API over users with role 'lecturer', shaped the way
// the AdminLecturers page and course editor expect ({ id, name, email, active }).

function toFrontendLecturer(row) {
  return {
    id: row.user_id,
    name: row.full_name,
    email: row.email,
    active: row.status === "active",
  };
}

export async function listLecturers(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("user_id, full_name, email, status")
      .eq("role", "lecturer")
      .order("user_id");
    if (error) throw error;
    res.json({ data: data.map(toFrontendLecturer) });
  } catch (err) {
    next(err);
  }
}

export async function createLecturer(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("users")
      .select("user_id")
      .eq("email", email)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const user_name = await uniqueUserNameFromEmail(email);
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .insert({ full_name: name, email, user_name, password_hash, role: "lecturer" })
      .select("user_id, full_name, email, status")
      .single();
    if (error) throw error;

    res.status(201).json({ data: toFrontendLecturer(user) });
  } catch (err) {
    next(err);
  }
}

export async function setLecturerStatus(req, res, next) {
  try {
    const { active } = req.body || {};
    if (typeof active !== "boolean") {
      return res.status(400).json({ error: "active (boolean) is required" });
    }
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .update({ status: active ? "active" : "inactive", updated_at: new Date().toISOString() })
      .eq("user_id", req.params.id)
      .eq("role", "lecturer")
      .select("user_id, full_name, email, status")
      .maybeSingle();
    if (error) throw error;
    if (!user) return res.status(404).json({ error: "Lecturer not found" });
    res.json({ data: toFrontendLecturer(user) });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// Enrollment + path unlocks (the mock "purchase")

export async function enrollInCourse(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const { error } = await supabaseAdmin
      .from("course_enrollments")
      .upsert(
        { course_id: courseId, user_id: req.user.user_id },
        { onConflict: "course_id,user_id", ignoreDuplicates: true }
      );
    if (error) throw error;
    res.status(201).json({ data: { courseId } });
  } catch (err) {
    next(err);
  }
}

export async function unlockCoursePath(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    const { data: course, error: findError } = await supabaseAdmin
      .from("courses")
      .select("course_id, paths, interactive_price")
      .eq("course_id", courseId)
      .maybeSingle();
    if (findError) throw findError;
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!course.paths?.includes("interactive")) {
      return res.status(400).json({ error: "This course has no interactive path" });
    }

    // Mock checkout: no payment provider yet, so this just records the
    // unlock at today's price. Swap in a real payment flow later.
    const { error } = await supabaseAdmin
      .from("course_unlocks")
      .upsert(
        {
          course_id: courseId,
          user_id: req.user.user_id,
          path: "interactive",
          price_paid: course.interactive_price,
        },
        { onConflict: "course_id,user_id,path", ignoreDuplicates: true }
      );
    if (error) throw error;
    res.status(201).json({ data: { courseId, path: "interactive" } });
  } catch (err) {
    next(err);
  }
}

// Everything learning-related about the current user in one call, so the
// frontend hooks can hydrate on page load.
export async function getMyLearning(req, res, next) {
  try {
    const [enrollments, unlocks] = await Promise.all([
      supabaseAdmin.from("course_enrollments").select("course_id").eq("user_id", req.user.user_id),
      supabaseAdmin.from("course_unlocks").select("course_id").eq("user_id", req.user.user_id),
    ]);
    if (enrollments.error) throw enrollments.error;
    if (unlocks.error) throw unlocks.error;
    res.json({
      data: {
        enrolledCourseIds: enrollments.data.map((r) => r.course_id),
        unlockedCourseIds: unlocks.data.map((r) => r.course_id),
      },
    });
  } catch (err) {
    next(err);
  }
}
