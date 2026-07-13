import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";
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
import AdminWorkspace from "./admin/community/pages/AdminWorkspace";
import AdminLearningDashboard from "./admin/learning/pages/AdminDashboard";
import AdminCourses from "./admin/learning/adminSide/AdminCourses";
import AdminCourseEditor from "./admin/learning/adminSide/AdminCourseEditor";
import AdminLecturers from "./admin/learning/adminSide/AdminLecturers";
import { ScrollToTop } from "./components/ScrollToTop";
import { AppFooter } from "./components/AppFooter";
import HubLandingPage from "./hub/LandingPage";
import HubAboutPage from "./hub/AboutPage";
import AuthPage from "./hub/AuthPage";
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

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

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
      <CursorEffect />
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
          <Route path="*" element={<NotFoundPage />} />
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
            <Route path="workspace" element={<AdminWorkspace />} />
            <Route path="learning" element={<AdminLearningDashboard />} />
            <Route path="learning/courses" element={<AdminCourses />} />
            <Route path="learning/courses/new" element={<AdminCourseEditor />} />
            <Route path="learning/courses/:id/edit" element={<AdminCourseEditor />} />
            <Route path="learning/lecturers" element={<AdminLecturers />} />
            <Route path="inventory/*" element={<InventoryAdminArea />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
    </InventoryProvider>
    </AuthProvider>
  );
}
