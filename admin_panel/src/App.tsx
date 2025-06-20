// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import TestPage from './pages/TestPage';
import UserListPage from './pages/Users/UserListPage';
import UserGroupListPage from './pages/UserGroups/UserGroupListPage';
import PlanListPage from './pages/Plans/PlanListPage';
import NodeListPage from './pages/Nodes/NodeListPage';
import SubscriptionListPage from './pages/Subscriptions/SubscriptionListPage';
import TrafficOverviewPage from './pages/Traffic/TrafficOverviewPage';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './router/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // 添加调试日志
  console.log('🔍 App component rendering...');
  console.log('Auth state:', { isAuthenticated, isLoading });

  if (isLoading) {
     console.log('⏳ Application is loading...');
     return <div>Application Loading...</div>;
  }

  console.log('🎯 App component ready, rendering routes');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/test" element={<TestPage />} />
            <Route path="/users" element={<UserListPage />} />
            <Route path="/user-groups" element={<UserGroupListPage />} />
            <Route path="/plans" element={<PlanListPage />} />
            <Route path="/nodes" element={<NodeListPage />} />
            <Route path="/subscriptions" element={<SubscriptionListPage />} />
            <Route path="/traffic" element={<TrafficOverviewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;