// src/pages/Traffic/TrafficOverviewPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { get as apiGet } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TrafficStats {
  total_traffic: number;
  active_users: number;
  top_users: Array<{
    user: {
      id: number;
      email: string;
    };
    total_traffic: number;
    total_gb: number;
  }>;
  node_usage: Array<{
    node: {
      id: number;
      name: string;
    };
    total_traffic: number;
    total_gb: number;
    unique_users: number;
  }>;
  daily_traffic: Array<{
    date: string;
    total_traffic: number;
    total_gb: number;
  }>;
}

const TrafficOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<TrafficStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');

  const fetchTrafficStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<TrafficStats>(`/admin/traffic/overview?period=${period}`);
      setStats(response.data);
    } catch (err: any) {
      console.error("Failed to fetch traffic stats:", err);
      setError(err.message || 'Failed to fetch traffic statistics.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrafficStats();
  }, [fetchTrafficStats]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Traffic Overview</h1>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchTrafficStats} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && <p>Loading traffic statistics...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Traffic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(stats.total_traffic)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.active_users}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average per User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.active_users > 0 
                    ? formatBytes(stats.total_traffic / stats.active_users)
                    : '0 B'
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Users */}
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Total Traffic</TableHead>
                    <TableHead>GB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.top_users.map((userStat, index) => (
                    <TableRow key={userStat.user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span>{userStat.user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatBytes(userStat.total_traffic)}</TableCell>
                      <TableCell>{userStat.total_gb} GB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Node Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Node Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node</TableHead>
                    <TableHead>Total Traffic</TableHead>
                    <TableHead>Unique Users</TableHead>
                    <TableHead>Average per User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.node_usage.map((nodeStat) => (
                    <TableRow key={nodeStat.node.id}>
                      <TableCell className="font-medium">
                        {nodeStat.node.name}
                      </TableCell>
                      <TableCell>{formatBytes(nodeStat.total_traffic)}</TableCell>
                      <TableCell>{nodeStat.unique_users}</TableCell>
                      <TableCell>
                        {nodeStat.unique_users > 0
                          ? formatBytes(nodeStat.total_traffic / nodeStat.unique_users)
                          : '0 B'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Daily Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Traffic Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Traffic</TableHead>
                    <TableHead>GB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.daily_traffic.map((dailyStat) => (
                    <TableRow key={dailyStat.date}>
                      <TableCell>{dailyStat.date}</TableCell>
                      <TableCell>{formatBytes(dailyStat.total_traffic)}</TableCell>
                      <TableCell>{dailyStat.total_gb} GB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TrafficOverviewPage;