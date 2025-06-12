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
  RefreshCw,
  Zap,
  Globe,
  Database,
  Wifi,
  Shield,
  BarChart3
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

  // Enhanced recent activities with more realistic data
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
      message: 'Premium Plan subscription approved',
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
    },
    {
      id: '5',
      type: 'subscription',
      message: 'Traffic limit warning for user@test.com',
      timestamp: '2 hours ago',
      status: 'warning'
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
      case 'success': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'Add, edit, or manage user accounts',
      href: '/users',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      stats: userCount
    },
    {
      title: 'Configure Nodes',
      description: 'Add new nodes or manage existing ones',
      href: '/nodes',
      icon: Server,
      color: 'from-orange-500 to-orange-600',
      stats: nodeCount
    },
    {
      title: 'Create Plans',
      description: 'Set up subscription plans and pricing',
      href: '/plans',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      stats: planCount
    },
    {
      title: 'User Groups',
      description: 'Organize users into groups',
      href: '/user-groups',
      icon: UserCheck,
      color: 'from-teal-500 to-teal-600',
      stats: groupCount
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between animate-slide-down">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 bg-clip-text text-transparent dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 animate-fade-in">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg animate-slide-up">
            Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">{user?.email}</span>! Here's what's happening with your system.
          </p>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 dark:text-green-400 font-medium">System Online</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Secure</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 px-4 py-3 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 shadow-lg">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <Button 
            onClick={fetchDashboardStats} 
            variant="outline" 
            size="sm"
            disabled={isLoadingStats}
            className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 hover:scale-105 transition-all duration-300 btn-modern shadow-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Error Alert */}
      {errorStats && (
        <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-6 dark:border-red-800 dark:from-red-950 dark:to-pink-950 shadow-lg animate-slide-up">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50 animate-pulse">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-semibold text-red-800 dark:text-red-200">Error loading statistics</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{errorStats}</p>
            </div>
            <Button 
              onClick={fetchDashboardStats}
              variant="outline"
              size="sm"
              className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid with staggered animation */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
          <SummaryCard 
            title="Total Users" 
            value={userCount} 
            isLoading={isLoadingStats}
            icon={Users}
            trend="+12%"
            trendDirection="up"
            description="vs last month"
          />
        </div>
        <div className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <SummaryCard 
            title="User Groups" 
            value={groupCount} 
            isLoading={isLoadingStats}
            icon={UserCheck}
            trend="+5%"
            trendDirection="up"
            description="vs last month"
          />
        </div>
        <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
          <SummaryCard 
            title="Active Plans" 
            value={planCount} 
            isLoading={isLoadingStats}
            icon={Package}
            trend="0%"
            trendDirection="neutral"
            description="no change"
          />
        </div>
        <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <SummaryCard 
            title="Server Nodes" 
            value={nodeCount} 
            isLoading={isLoadingStats}
            icon={Server}
            trend="+2"
            trendDirection="up"
            description="new this week"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enhanced Recent Activity */}
        <div className="lg:col-span-2 animate-slide-up" style={{animationDelay: '0.5s'}}>
          <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 card-modern">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg animate-pulse-slow">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
                    <CardDescription className="text-base">Latest system events and user actions</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 px-3 py-1 animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                      index === 0 ? 'bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}>
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {activity.message}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.timestamp}
                          </span>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced System Status */}
        <div className="space-y-6">
          <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl card-modern">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg animate-pulse-slow">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">System Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">API Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium">Node Health</span>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    1 Issue
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Uptime</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">99.9%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div className="animate-slide-up" style={{animationDelay: '0.7s'}}>
            <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl card-modern">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg animate-pulse-slow">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">CPU Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{width: '23%'}}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Memory</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full" style={{width: '67%'}}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Storage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-slate-700">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="animate-slide-up" style={{animationDelay: '0.8s'}}>
        <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl card-modern">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg animate-pulse-slow">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
                <CardDescription className="text-base">Common administrative tasks and shortcuts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="group relative overflow-hidden rounded-xl border border-white/20 p-6 hover:shadow-xl transition-all duration-500 hover:scale-[1.03] bg-white/50 backdrop-blur-sm hover:bg-white/70 btn-modern"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {action.stats}
                        </Badge>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    
                    {/* Decorative gradient */}
                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} opacity-10 rounded-full -translate-y-10 translate-x-10 group-hover:opacity-20 transition-opacity`} />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
