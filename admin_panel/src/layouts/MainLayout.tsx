// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Package, 
  Server, 
  LayoutDashboard,
  LogOut,
  FileText,
  BarChart3,
  Menu,
  Bell,
  Settings,
  ChevronDown,
  Activity,
  Shield,
  Database
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  console.log('🏗️ MainLayout rendering...');
  console.log('Current user:', user);
  console.log('Current location:', location.pathname);

  const navigationGroups = [
    {
      title: "Overview",
      items: [
        { 
          name: 'Dashboard', 
          href: '/', 
          icon: LayoutDashboard,
          description: 'System overview & analytics',
          color: 'from-blue-500 to-blue-600'
        }
      ]
    },
    {
      title: "User Management",
      items: [
        { 
          name: 'Users', 
          href: '/users', 
          icon: Users,
          description: 'Manage user accounts',
          color: 'from-emerald-500 to-emerald-600'
        },
        { 
          name: 'User Groups', 
          href: '/user-groups', 
          icon: UserCheck,
          description: 'Organize users into groups',
          color: 'from-teal-500 to-teal-600'
        }
      ]
    },
    {
      title: "Service Management",
      items: [
        { 
          name: 'Plans', 
          href: '/plans', 
          icon: Package,
          description: 'Subscription plans',
          color: 'from-purple-500 to-purple-600'
        },
        { 
          name: 'Nodes', 
          href: '/nodes', 
          icon: Server,
          description: 'Proxy server nodes',
          color: 'from-orange-500 to-orange-600'
        },
        { 
          name: 'Subscriptions', 
          href: '/subscriptions', 
          icon: FileText,
          description: 'User subscriptions',
          color: 'from-pink-500 to-pink-600'
        }
      ]
    },
    {
      title: "Analytics",
      items: [
        { 
          name: 'Traffic', 
          href: '/traffic', 
          icon: BarChart3,
          description: 'Traffic analytics',
          color: 'from-indigo-500 to-indigo-600'
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-lg transition-all duration-300">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 shadow-lg transform hover:scale-105 transition-transform duration-200">
              <Shield className="h-6 w-6 text-white animate-pulse-slow" />
            </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Xray Manager
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* System Status Indicators */}
          <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">API</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20">
                <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">DB</span>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50 dark:hover:bg-slate-800">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 px-3 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {user?.email ? getInitials(user.email) : 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.email}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.role?.name || 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-white/20">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-blue-50 dark:hover:bg-slate-800">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-blue-50 dark:hover:bg-slate-800">
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${
          sidebarCollapsed ? 'w-16' : 'w-72'
        } transition-all duration-300 ease-in-out border-r border-white/20 bg-white/50 backdrop-blur-xl dark:bg-slate-900/50 min-h-[calc(100vh-4rem)] sticky top-16 shadow-lg`}>
          <nav className="p-4 space-y-6">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.title} className="space-y-2">
                {!sidebarCollapsed && (
                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}
                {groupIndex > 0 && sidebarCollapsed && (
                  <div className="h-px bg-slate-200 dark:bg-slate-700 mx-2" />
                )}
                
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            active
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02] hover:scale-[1.03]'
                              : 'text-slate-700 hover:bg-white/80 hover:text-slate-900 hover:shadow-md dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 hover:scale-[1.01]'
                          }`}
                      >
                        <div className={`p-2 rounded-lg transition-colors ${
                          active 
                            ? 'bg-white/20' 
                            : `bg-gradient-to-br ${item.color} text-white group-hover:shadow-md`
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {!sidebarCollapsed && (
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{item.name}</div>
                            <div className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        {active && !sidebarCollapsed && (
                          <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 transition-all duration-300">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;