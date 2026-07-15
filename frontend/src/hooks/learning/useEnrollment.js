import { useCallback, useEffect, useState } from "react";
import { getToken } from "../../lib/api/client";
import { learningApi } from "../../lib/api/learning";

/**
 * Whether the signed-in user is enrolled in a course, plus an enroll()
 * action. Guests are never enrolled — enrollment lives server-side
 * (course_enrollments) so the admin dashboard counts real students.
 */
export function useEnrollment(courseId) {
  const id = Number(courseId);
  const signedIn = Boolean(getToken());
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!signedIn || !id) return;
    learningApi
      .myLearning()
      .then(({ enrolledCourseIds }) => setEnrolled(enrolledCourseIds.includes(id)))
      .catch(() => {
        /* backend down or token invalid — leave as not enrolled */
      });
  }, [signedIn, id]);

  const enroll = useCallback(async () => {
    if (!signedIn || !id) return false;
    setEnrolling(true);
    try {
      await learningApi.enroll(id);
      setEnrolled(true);
      return true;
    } catch {
      return false;
    } finally {
      setEnrolling(false);
    }
  }, [signedIn, id]);

  return { signedIn, enrolled, enrolling, enroll, setEnrolled };
}
