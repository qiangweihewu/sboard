// src/pages/Dashboard/DashboardPage.tsx
import React, { useEffect, useState, useCallback } from 'react'; // Added useEffect, useState, useCallback
import { useAuth } from '@/contexts/AuthContext';
import SummaryCard from '@/components/dashboard/SummaryCard'; // Assuming SummaryCard is ready
import { get as apiGet } from '@/services/api'; // For API calls
import { Link } from 'react-router-dom'; // Import Link
// import { Button } from '@/components/ui/button'; // Not strictly needed if Link is styled directly

// Define a generic type for paginated API responses that include a 'total'
interface PaginatedResponseWithTotal {
  total: number;
  // Other pagination fields like data, current_page etc., are not strictly needed here
  // but might be present in the actual response.
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [userCount, setUserCount] = useState<number | string>('--');
  const [groupCount, setGroupCount] = useState<number | string>('--');
  const [planCount, setPlanCount] = useState<number | string>('--');
  const [nodeCount, setNodeCount] = useState<number | string>('--');

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setErrorStats(null);
    try {
      // Fetch all stats concurrently
      const [
        usersResponse,
        groupsResponse,
        plansResponse,
        nodesResponse
      ] = await Promise.all([
        apiGet<PaginatedResponseWithTotal>('/admin/users?per_page=1'), // Fetch only 1 item to get total efficiently
        apiGet<PaginatedResponseWithTotal>('/admin/user-groups?per_page=1'),
        apiGet<PaginatedResponseWithTotal>('/admin/plans?per_page=1'),
        apiGet<PaginatedResponseWithTotal>('/admin/nodes?per_page=1'),
      ]);

      setUserCount(usersResponse.data.total);
      setGroupCount(groupsResponse.data.total);
      setPlanCount(plansResponse.data.total);
      setNodeCount(nodesResponse.data.total);

    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setErrorStats(err.message || 'Failed to load summary data.');
      // Set counts to error state or keep as '--'
      setUserCount('Error');
      setGroupCount('Error');
      setPlanCount('Error');
      setNodeCount('Error');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        {user ? (
          <p className="text-xl text-muted-foreground">
            Welcome back, {user.email}!
          </p>
        ) : (
          <p className="text-xl text-muted-foreground">
            Welcome to the Admin Dashboard.
          </p>
        )}
      </div>

      <section aria-labelledby="summary-stats-heading">
        <h2 id="summary-stats-heading" className="text-2xl font-semibold mb-4 sr-only">
          Summary Statistics
        </h2>
        {errorStats && <p className="text-red-500 mb-4">Error loading statistics: {errorStats}</p>}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SummaryCard title="Total Users" value={userCount} isLoading={isLoadingStats} />
          <SummaryCard title="Total User Groups" value={groupCount} isLoading={isLoadingStats} />
          <SummaryCard title="Total Plans" value={planCount} isLoading={isLoadingStats} />
          <SummaryCard title="Total Nodes" value={nodeCount} isLoading={isLoadingStats} />
        </div>
      </section>

      {/* ... (Quick Actions section remains the same) ... */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-2xl font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"> {/* Adjusted to lg:grid-cols-4 for 4 items */}
          <Link to="/users" className="block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground hover:bg-accent">
            <h3 className="text-lg font-medium mb-1">Manage Users</h3>
            <p className="text-sm text-muted-foreground">View, add, edit, or delete users.</p>
          </Link>

          <Link to="/nodes" className="block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground hover:bg-accent">
            <h3 className="text-lg font-medium mb-1">Manage Nodes</h3>
            <p className="text-sm text-muted-foreground">Add new nodes or manage existing ones.</p>
          </Link>

          <Link to="/plans" className="block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground hover:bg-accent">
            <h3 className="text-lg font-medium mb-1">Manage Plans</h3>
            <p className="text-sm text-muted-foreground">Create and configure subscription plans.</p>
          </Link>

          <Link to="/user-groups" className="block p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground hover:bg-accent">
            <h3 className="text-lg font-medium mb-1">Manage User Groups</h3>
            <p className="text-sm text-muted-foreground">Organize users into groups.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
