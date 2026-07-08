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
import AdminLayout from "./admin/community/layouts/AdminLayout";
import AdminDashboard from "./admin/community/pages/AdminDashboard";
import AdminEvents from "./admin/community/pages/AdminEvents";
import AdminCollaboration from "./admin/community/pages/AdminCollaboration";
import AdminCommunity from "./admin/community/pages/AdminCommunity";
import AdminUsers from "./admin/community/pages/AdminUsers";
import { ScrollToTop } from "./components/ScrollToTop";
import { AppFooter } from "./components/AppFooter";
import HubLandingPage from "./hub/LandingPage";
import HubAboutPage from "./hub/AboutPage";
import AuthPage from "./hub/AuthPage";
import ProfilePage from "./hub/ProfilePage";
import NotificationsPage from "./hub/NotificationsPage";
import LearningLandingPage from "./pages/learning/LandingPage";
import InventoryLandingPage from "./pages/inventory/LandingPage";
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
        <Route path="/learning" element={<LearningLandingPage />} />
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
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin layout: sidebar only, no TopNav/Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="collaboration" element={<AdminCollaboration />} />
          <Route path="community" element={<AdminCommunity />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
