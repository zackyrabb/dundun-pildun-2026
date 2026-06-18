import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./layouts/MainLayout";
import AppLayout from "./components/AppLayout";

import Login from "./pages/Login";
import CheckOnboarding from "./pages/CheckOnboarding";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import FavoriteTeams from "./pages/FavoriteTeams";
import Dashboard from "./pages/Dashboard";
import Teams from "./pages/Teams";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Predictions from "./pages/Predictions";
import Leaderboard from "./pages/Leaderboard";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMatches from "./pages/admin/AdminMatches";
import AdminMatchForm from "./pages/admin/AdminMatchForm";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminTeamForm from "./pages/admin/AdminTeamForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/check-onboarding" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route 
          path="/check-onboarding" 
          element={<CheckOnboarding />} />

          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorite-teams"
            element={
              <ProtectedRoute>
                <FavoriteTeams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Matches />
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches/:id"
            element={
              <ProtectedRoute>
                <MatchDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predictions"
            element={
              <ProtectedRoute>
                <Predictions />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <UserDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/matches"
            element={
              <AdminRoute>
                <AdminMatches />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/matches/new"
            element={
              <AdminRoute>
                <AdminMatchForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/matches/:id/edit"
            element={
              <AdminRoute>
                <AdminMatchForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/teams"
            element={
              <AdminRoute>
                <AdminTeams />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/teams/new"
            element={
              <AdminRoute>
                <AdminTeamForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/teams/:id/edit"
            element={
              <AdminRoute>
                <AdminTeamForm />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
            }
          />

          <Route
            path="/admin/users/:id"
            element={
              <AdminRoute>
                <AdminUserDetail />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </AppLayout>
  );
}
