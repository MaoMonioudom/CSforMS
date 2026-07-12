import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
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
import InventoryAdminArea from "./admin/inventory/InventoryAdminArea";
import { InventoryProvider } from "./lib/inventory/InventoryContext";
import AdminCommunityDashboard from "./admin/community/pages/AdminDashboard";
import AdminEvents from "./admin/community/pages/AdminEvents";
import AdminCollaboration from "./admin/community/pages/AdminCollaboration";
import AdminCommunity from "./admin/community/pages/AdminCommunity";
import AdminUsers from "./admin/community/pages/AdminUsers";
import AdminWorkspace from "./admin/community/pages/AdminWorkspace";
import AdminLearningDashboard from "./admin/learning/pages/AdminDashboard";
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
import LearningLandingPage from "./pages/learning/LandingPage";
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
        <Route path="/learning" element={<LearningLandingPage />} />
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

        {/* Admin layout: shared, resizable sidebar across community, inventory, and learning */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/community" replace />} />

          <Route path="community">
            <Route index element={<AdminCommunityDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="collaboration" element={<AdminCollaboration />} />
            <Route path="posts" element={<AdminCommunity />} />
          </Route>

          {/* Inventory admin — InventoryAdminArea owns its own full route tree
              (dashboard, requests, borrows, manage, payments, services, users, catalog)
              plus the auth gate, so it's mounted as a single wildcard branch. */}
          <Route path="inventory/*" element={<InventoryAdminArea />} />

          <Route path="learning">
            <Route index element={<AdminLearningDashboard />} />
          </Route>

          {/* Cross-module — not scoped to a single space */}
          <Route path="users" element={<AdminUsers />} />
          <Route path="workspace" element={<AdminWorkspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </InventoryProvider>
    </AuthProvider>
  );
}
