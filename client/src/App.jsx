import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import HowItWorks from "./pages/HowItWorks";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import CreateRoom from "./pages/CreateRoom";
import BrowseRooms from "./pages/BrowseRooms";
import RoomDetail from "./pages/RoomDetail";
import LiveFeed from "./pages/LiveFeed";
import JarsView from "./pages/JarsView";
import RoomWall from "./pages/RoomWall";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import MediaView from "./pages/MediaView";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// Protected route wrapper — redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="min-h-screen bg-slate-50 flex items-center justify-center">
        <div class="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected: require login */}
      <Route path="/create" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
      <Route path="/rooms" element={<ProtectedRoute><BrowseRooms /></ProtectedRoute>} />
      <Route path="/rooms/:code" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
      <Route path="/rooms/:code/feed" element={<ProtectedRoute><LiveFeed /></ProtectedRoute>} />
      <Route path="/rooms/:code/jars" element={<ProtectedRoute><JarsView /></ProtectedRoute>} />
      <Route path="/rooms/:code/wall" element={<ProtectedRoute><RoomWall /></ProtectedRoute>} />
      <Route path="/rooms/:code/media" element={<ProtectedRoute><MediaView /></ProtectedRoute>} />
      <Route path="/rooms/:code/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/rooms/:code/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
