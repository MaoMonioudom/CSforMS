import { api } from "./client";

/**
 * Learning module endpoints. The backend returns courses in the same
 * camelCase shape data/courses.js established (lessons nested), so
 * responses can be handed straight to the existing components.
 */
export const learningApi = {
  listCourses: () => api.get("/api/learning/courses").then((r) => r.data),
  getCourse: (id) => api.get(`/api/learning/courses/${id}`).then((r) => r.data),
  createCourse: (course) => api.post("/api/learning/courses", course).then((r) => r.data),
  updateCourse: (id, course) => api.put(`/api/learning/courses/${id}`, course).then((r) => r.data),
  deleteCourse: (id) => api.del(`/api/learning/courses/${id}`),

  listLecturers: () => api.get("/api/learning/lecturers").then((r) => r.data),
  createLecturer: ({ name, email, password }) =>
    api.post("/api/learning/lecturers", { name, email, password }).then((r) => r.data),
  setLecturerActive: (id, active) =>
    api.put(`/api/learning/lecturers/${id}/status`, { active }).then((r) => r.data),

  enroll: (courseId) => api.post(`/api/learning/courses/${courseId}/enroll`),
  unlock: (courseId) => api.post(`/api/learning/courses/${courseId}/unlock`),
  rate: (courseId, stars) =>
    api.post(`/api/learning/courses/${courseId}/rate`, { stars }).then((r) => r.data),
  myLearning: () => api.get("/api/learning/me").then((r) => r.data),

  // Admin reporting.
  courseStudents: (courseId) =>
    api.get(`/api/learning/courses/${courseId}/students`).then((r) => r.data),
  overview: () => api.get("/api/learning/overview").then((r) => r.data),
};
