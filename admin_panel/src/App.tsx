// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './router/ProtectedRoute'; // Import ProtectedRoute
import { useAuth } from './contexts/AuthContext'; // To check auth for initial redirect

function App() {
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state for root redirect logic

  if (isLoading) {
     return <div>Application Loading...</div>; // Or a proper spinner component
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          {/* Add other protected routes here, e.g., /users, /settings */}
          {/* These will also be wrapped by MainLayout if structured this way */}
        </Route>

        {/* Catch-all for undefined routes */}
        {/* Redirect to dashboard if logged in, else to login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
