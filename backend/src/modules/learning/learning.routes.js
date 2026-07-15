import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/requireAuth.js";
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  listLecturers,
  createLecturer,
  setLecturerStatus,
  enrollInCourse,
  unlockCoursePath,
  getMyLearning,
  listCourseStudents,
  getLearningOverview,
} from "./learning.controller.js";

const router = Router();

// Public catalog — anyone can browse courses and lessons.
router.get("/courses", listCourses);
router.get("/courses/:id", getCourse);

// Content management. requireRole gates the roles; per-course ownership for
// lecturers is enforced inside the controller.
router.post("/courses", requireAuth, requireRole("admin", "staff", "lecturer"), createCourse);
router.put("/courses/:id", requireAuth, requireRole("admin", "staff", "lecturer"), updateCourse);
router.delete("/courses/:id", requireAuth, requireRole("admin", "staff", "lecturer"), deleteCourse);

// Lecturer accounts (Learning admin panel).
router.get("/lecturers", requireAuth, requireRole("admin", "staff", "lecturer"), listLecturers);
router.post("/lecturers", requireAuth, requireRole("admin", "staff"), createLecturer);
router.put("/lecturers/:id/status", requireAuth, requireRole("admin", "staff"), setLecturerStatus);

// Admin reporting. Roster is also open to lecturers (own courses only,
// enforced in the controller); the overview is staff-only.
router.get("/courses/:id/students", requireAuth, requireRole("admin", "staff", "lecturer"), listCourseStudents);
router.get("/overview", requireAuth, requireRole("admin", "staff"), getLearningOverview);

// Learner actions.
router.post("/courses/:id/enroll", requireAuth, enrollInCourse);
router.post("/courses/:id/unlock", requireAuth, unlockCoursePath);
router.get("/me", requireAuth, getMyLearning);

export default router;
