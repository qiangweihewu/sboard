// src/pages/Subscriptions/SubscriptionListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { get as apiGet, post as apiPost } from '@/services/api';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubscriptionData {
  id: number;
  user_id: number;
  plan_id: number;
  start_date?: string;
  end_date?: string;
  total_traffic_gb: number;
  used_traffic_gb: number;
  current_device_count: number;
  speed_limit_mbps?: number | null; // Add speed_limit_mbps
  subscription_token?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  created_at: string;
  user: {
    id: number;
    email: string;
  };
  plan: {
    id: number;
    name: string;
  };
}

interface PaginatedSubscriptionsResponse {
  data: SubscriptionData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const SubscriptionListPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : '';
      const response = await apiGet<PaginatedSubscriptionsResponse>(`/admin/subscriptions${params}`);
      setSubscriptions(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch subscriptions:", err);
      setError(err.message || 'Failed to fetch subscriptions.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Active</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="secondary">Pending</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Expired</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const openApproveDialog = (subscription: SubscriptionData) => {
    setSelectedSubscription(subscription);
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (subscription: SubscriptionData) => {
    setSelectedSubscription(subscription);
    setIsRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubscription) return;
    
    setIsProcessing(true);
    try {
      await apiPost(`/admin/subscriptions/${selectedSubscription.id}/approve`, {});
      setIsApproveDialogOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
      alert('Subscription approved successfully!');
    } catch (err: any) {
      console.error("Failed to approve subscription:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to approve subscription.";
      alert("Error: " + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubscription) return;
    
    setIsProcessing(true);
    try {
      await apiPost(`/admin/subscriptions/${selectedSubscription.id}/reject`, {});
      setIsRejectDialogOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
      alert('Subscription rejected successfully!');
    } catch (err: any) {
      console.error("Failed to reject subscription:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to reject subscription.";
      alert("Error: " + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchSubscriptions} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && <p>Loading subscriptions...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <Table>
          <TableCaption>A list of all user subscriptions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Traffic Usage</TableHead>
              <TableHead>Speed Limit</TableHead> {/* Add Speed Limit column header */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell className="font-medium">{subscription.id}</TableCell>
                <TableCell>{subscription.user.email}</TableCell>
                <TableCell>{subscription.plan.name}</TableCell>
                <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                <TableCell>{formatDate(subscription.start_date)}</TableCell>
                <TableCell>{formatDate(subscription.end_date)}</TableCell>
                <TableCell>
                  {subscription.used_traffic_gb} / {subscription.total_traffic_gb} GB
                </TableCell>
                <TableCell>{subscription.speed_limit_mbps ? `${subscription.speed_limit_mbps} Mbps` : 'N/A'}</TableCell> {/* Display speed limit */}
                <TableCell>
                  <div className="flex space-x-2">
                    {subscription.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => openApproveDialog(subscription)}
                          disabled={isProcessing}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(subscription)}
                          disabled={isProcessing}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {subscription.status === 'ACTIVE' && subscription.subscription_token && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = `${window.location.origin}/api/subscribe/${subscription.subscription_token}`;
                          navigator.clipboard.writeText(url);
                          alert('Subscription URL copied to clipboard!');
                        }}
                      >
                        Copy URL
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Approve Dialog */}
      {selectedSubscription && (
        <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve the subscription for {selectedSubscription.user.email} 
                to plan "{selectedSubscription.plan.name}"? This will activate the subscription immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSubscription(null)} disabled={isProcessing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? 'Approving...' : 'Approve'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reject Dialog */}
      {selectedSubscription && (
        <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Subscription</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject the subscription request for {selectedSubscription.user.email} 
                to plan "{selectedSubscription.plan.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedSubscription(null)} disabled={isProcessing}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReject} 
                disabled={isProcessing}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SubscriptionListPage;
