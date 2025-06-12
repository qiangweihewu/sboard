// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UserListPage from './pages/Users/UserListPage';
import UserGroupListPage from './pages/UserGroups/UserGroupListPage';
import PlanListPage from './pages/Plans/PlanListPage'; // Import PlanListPage
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './router/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
     return <div>Application Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}> {/* Nest routes that use MainLayout */}
            <Route
              path="/"
              element={<DashboardPage />}
            />
            <Route
              path="/users"
              element={<UserListPage />}
            />
            <Route
              path="/user-groups"
              element={<UserGroupListPage />}
            />
            <Route
              path="/plans" // New route for Plan Management
              element={<PlanListPage />}
            />
            {/* Add other protected routes here, e.g., /nodes */}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
