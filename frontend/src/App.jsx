import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import AdminCommunityDashboard from "./admin/community/pages/AdminDashboard";
import AdminEvents from "./admin/community/pages/AdminEvents";
import AdminCollaboration from "./admin/community/pages/AdminCollaboration";
import AdminCommunity from "./admin/community/pages/AdminCommunity";
import AdminUsers from "./admin/community/pages/AdminUsers";
import AdminWorkspace from "./admin/community/pages/AdminWorkspace";
import AdminInventoryDashboard from "./admin/inventory/pages/AdminDashboard";
//import AdminLearningDashboard from "./admin/learning/pages/AdminDashboard";
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
import InventoryLandingPage from "./pages/inventory/LandingPage";
import { AuthProvider } from "./hub/AuthContext";
import LearningHomePage from "./pages/learning/Home";
import CoursesPage from "./pages/learning/CoursesPage";
import CourseDetail from "./pages/learning/CourseDetail";
import LessonDetail from "./pages/learning/LessonDetail";
import About from "./pages/learning/About";
import Contact from "./pages/learning/Contact";
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

export default function App() {
  return (
    <AuthProvider>
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
        <Route path="/inventory" element={<InventoryLandingPage />} />

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

        {/* Learning — TopNav + Footer */}
        <Route element={<UserLayout />}>
          <Route path="/learning" element={<LearningHomePage />} />
          <Route path="/learning/courses" element={<CoursesPage />} />
          <Route path="/learning/course/:id" element={<CourseDetail />} />
          <Route path="/learning/:id/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/learning/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin layout: shared sidebar across community, inventory, and learning */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/community" replace />} />

          <Route path="community">
            <Route index element={<AdminCommunityDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="collaboration" element={<AdminCollaboration />} />
            <Route path="posts" element={<AdminCommunity />} />
          </Route>

          <Route path="inventory">
            <Route index element={<AdminInventoryDashboard />} />
          </Route>

          <Route path="learning">
            <Route index element={<AdminLearningDashboard />} />
          </Route>

          {/* Cross-module — not scoped to a single space */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="workspace" element={<AdminWorkspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
