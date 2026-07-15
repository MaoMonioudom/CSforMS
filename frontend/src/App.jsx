import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from "react-router-dom";
import { TopNav } from "./components/TopNav";
import { CursorEffect } from "./components/community/CursorEffect";
import HomePage from "./pages/community/HomePage";
import EventsPage from "./pages/community/EventsPage";
import EventDetailPage from "./pages/community/EventDetailPage";
import CollaborationPage from "./pages/community/CollaborationPage";
import CollabDetailPage from "./pages/community/CollabDetailPage";
import CommunityPage from "./pages/community/CommunityPage";
import CommunityDetailPage from "./pages/community/CommunityDetailPage";
import AdminLayout from "./admin/layouts/AdminLayout";
import AdminGuard from "./admin/components/AdminGuard";
import InventoryAdminArea from "./admin/inventory/InventoryAdminArea";
import { InventoryProvider } from "./lib/inventory/InventoryContext";
import AdminDashboard from "./admin/community/pages/AdminDashboard";
import AdminEvents from "./admin/community/pages/AdminEvents";
import AdminCollaboration from "./admin/community/pages/AdminCollaboration";
import AdminCommunity from "./admin/community/pages/AdminCommunity";
import AdminUsers from "./admin/community/pages/AdminUsers";
import AdminMembership from "./admin/community/pages/AdminMembership";
import AdminWorkspace from "./admin/community/pages/AdminWorkspace";
import AdminLearningDashboard from "./admin/learning/pages/AdminDashboard";
import AdminCourses from "./admin/learning/adminSide/AdminCourses";
import AdminCourseEditor from "./admin/learning/adminSide/AdminCourseEditor";
import AdminLecturers from "./admin/learning/adminSide/AdminLecturers";
import LecturerLayout from "./admin/layouts/LecturerLayout";
import LecturerDashboard from "./admin/learning/lecturersSide/LecturerDashboard";
import LecturerCourseEditor from "./admin/learning/lecturersSide/LecturerCourseEditor";
import { ScrollToTop } from "./components/ScrollToTop";
import { AppFooter } from "./components/AppFooter";
import HubLandingPage from "./hub/LandingPage";
import HubAboutPage from "./hub/AboutPage";
import AuthPage from "./hub/AuthPage";
import ForgotPasswordPage from "./hub/ForgotPasswordPage";
import ResetPasswordPage from "./hub/ResetPasswordPage";
import CompleteSignupPage from "./hub/CompleteSignupPage";
import MicrosoftCallbackPage from "./hub/MicrosoftCallbackPage";
import ProfilePage from "./hub/ProfilePage";
import NotificationsPage from "./hub/NotificationsPage";
import MembershipPage from "./hub/MembershipPage";
import CreditsPage from "./hub/CreditsPage";
import WorkspacePage from "./hub/WorkspacePage";
import LearningHomePage from "./pages/learning/Home";
import LearningCoursesPage from "./pages/learning/CoursesPage";
import LearningCourseDetail from "./pages/learning/CourseDetail";
import LearningLessonDetail from "./pages/learning/LessonDetail";
import LearningAbout from "./pages/learning/About";
import LearningContact from "./pages/learning/Contact";
import InventoryApp from "./pages/inventory/InventoryApp";
import { AuthProvider } from "./hub/AuthContext";
import NotFound from "./pages/NotFound";

function UserLayout() {
  return (
    <>
      <CursorEffect />
      <TopNav />
      <Outlet />
      <AppFooter />
    </>
  );
}

// learning-scope carries the parchment/navy/gold tokens (see index.css) —
// scoped so it doesn't touch the hub's ink/font-display values elsewhere.
function LearningLayout() {
  return (
    <div className="learning-scope">
      <TopNav />
      <Outlet />
      <AppFooter />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <InventoryProvider>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Hub landing — default root, standalone (no TopNav/Footer) */}
        <Route path="/" element={<HubLandingPage />} />
        <Route path="/hub/about" element={<HubAboutPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/complete-signup" element={<CompleteSignupPage />} />
        <Route path="/auth/callback" element={<MicrosoftCallbackPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        {/* Inventory module (MakerVault) — self-contained app with its own auth */}
        <Route path="/inventory/*" element={<InventoryApp />} />

        {/* Community spaces — TopNav + Footer */}
        <Route element={<UserLayout />}>
          <Route path="/community" element={<HomePage />} />
          <Route path="/community/eventspace" element={<EventsPage />} />
          <Route path="/community/eventspace/:eventId" element={<EventDetailPage />} />
          <Route path="/community/collabspace" element={<CollaborationPage />} />
          <Route path="/community/collabspace/:postId" element={<CollabDetailPage />} />
          <Route path="/community/communityspace" element={<CommunityPage />} />
          <Route path="/community/communityspace/:postId" element={<CommunityDetailPage />} />
        </Route>

        {/* Learning spaces — TopNav + Footer, scoped to the library theme */}
        <Route element={<LearningLayout />}>
          <Route path="/learning" element={<LearningHomePage />} />
          <Route path="/learning/courses" element={<LearningCoursesPage />} />
          <Route path="/learning/course/:id" element={<LearningCourseDetail />} />
          <Route path="/learning/:id/lessons/:lessonId" element={<LearningLessonDetail />} />
          <Route path="/learning/about" element={<LearningAbout />} />
          <Route path="/learning/contact" element={<LearningContact />} />
        </Route>

        {/* Admin: guard checks Admin/Staff role first, layout is the shared shell */}
        <Route path="/admin" element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="collaboration" element={<AdminCollaboration />} />
            <Route path="community" element={<AdminCommunity />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="membership" element={<AdminMembership />} />
            <Route path="workspace" element={<AdminWorkspace />} />
            <Route path="learning" element={<AdminLearningDashboard />} />
            <Route path="learning/courses" element={<AdminCourses />} />
            <Route path="learning/courses/new" element={<AdminCourseEditor />} />
            <Route path="learning/courses/:id/edit" element={<AdminCourseEditor />} />
            <Route path="learning/lecturers" element={<AdminLecturers />} />
            <Route path="inventory/*" element={<InventoryAdminArea />} />
          </Route>
        </Route>

        {/* Lecturer: same guard as /admin (Admin/Staff/Lecturer), own sidebar + layout */}
        <Route path="/lecturer" element={<AdminGuard />}>
          <Route element={<LecturerLayout />}>
            <Route index element={<Navigate to="learning/courses" replace />} />
            <Route path="learning/courses" element={<LecturerDashboard />} />
            <Route path="learning/courses/new" element={<LecturerCourseEditor />} />
            <Route path="learning/courses/:id/edit" element={<LecturerCourseEditor />} />
          </Route>
        </Route>

        {/* Catch-all — NotFound uses the library theme's CSS tokens
            (--color-navy-deep etc.), so it needs LearningLayout's wrapper. */}
        <Route element={<LearningLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </InventoryProvider>
    </AuthProvider>
  );
}
