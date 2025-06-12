// src/pages/Dashboard/DashboardPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SummaryCard from '@/components/dashboard/SummaryCard';
import { get as apiGet } from '@/services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Package, 
  Server, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

interface PaginatedResponseWithTotal {
  total: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'subscription' | 'node' | 'system';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [userCount, setUserCount] = useState<number | string>('--');
  const [groupCount, setGroupCount] = useState<number | string>('--');
  const [planCount, setPlanCount] = useState<number | string>('--');
  const [nodeCount, setNodeCount] = useState<number | string>('--');

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock recent activities
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user',
      message: 'New user registered: user@example.com',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'subscription',
      message: 'Subscription approved for Premium Plan',
      timestamp: '5 minutes ago',
      status: 'success'
    },
    {
      id: '3',
      type: 'node',
      message: 'Node "US-West-1" health check failed',
      timestamp: '10 minutes ago',
      status: 'error'
    },
    {
      id: '4',
      type: 'system',
      message: 'Daily backup completed successfully',
      timestamp: '1 hour ago',
      status: 'info'
    }
  ]);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setErrorStats(null);
    try {
      const [
        usersResponse,
        groupsResponse,
        plansResponse,
        nodesResponse
      ] = await Promise.all([
        apiGet<PaginatedResponseWithTotal>('/admin/users?per_page=1'),
        apiGet<PaginatedResponseWithTotal>('/admin/user-groups?per_page=1'),
        apiGet<PaginatedResponseWithTotal>('/admin/plans?per_page=1'),
        apiGet<PaginatedResponseWithTotal>('/admin/nodes?per_page=1'),
      ]);

      setUserCount(usersResponse.data.total);
      setGroupCount(groupsResponse.data.total);
      setPlanCount(plansResponse.data.total);
      setNodeCount(nodesResponse.data.total);
      setLastUpdated(new Date());

    } catch (err: any) {
      console.error("Failed to fetch dashboard stats:", err);
      setErrorStats(err.message || 'Failed to load summary data.');
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'subscription': return Package;
      case 'node': return Server;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or manage user accounts',
      href: '/users',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Configure Nodes',
      description: 'Add new nodes or manage existing ones',
      href: '/nodes',
      icon: Server,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Create Plans',
      description: 'Set up subscription plans and pricing',
      href: '/plans',
      icon: Package,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'User Groups',
      description: 'Organize users into groups',
      href: '/user-groups',
      icon: UserCheck,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Welcome back, {user?.email}! Here's what's happening with your system.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <p className="text-sm text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button 
            onClick={fetchDashboardStats} 
            variant="outline" 
            size="sm"
            disabled={isLoadingStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {errorStats && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="ml-3 text-sm text-red-800 dark:text-red-200">
              Error loading statistics: {errorStats}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard 
          title="Total Users" 
          value={userCount} 
          isLoading={isLoadingStats}
          icon={Users}
          trend="+12%"
          trendDirection="up"
        />
        <SummaryCard 
          title="User Groups" 
          value={groupCount} 
          isLoading={isLoadingStats}
          icon={UserCheck}
          trend="+5%"
          trendDirection="up"
        />
        <SummaryCard 
          title="Active Plans" 
          value={planCount} 
          isLoading={isLoadingStats}
          icon={Package}
          trend="0%"
          trendDirection="neutral"
        />
        <SummaryCard 
          title="Server Nodes" 
          value={nodeCount} 
          isLoading={isLoadingStats}
          icon={Server}
          trend="+2"
          trendDirection="up"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {activity.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Node Health</span>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  1 Issue
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">99.9%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className="group relative overflow-hidden rounded-lg border p-6 hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;