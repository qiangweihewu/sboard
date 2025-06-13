// src/components/users/UserTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Shadcn UI Table components
import { Button } from "@/components/ui/button"; // For action buttons
import { Badge } from "@/components/ui/badge"; // To display status, potentially add 'badge' component

// Define a type for the user data expected by this table
// This should align with the User model from the backend, including role information
export interface UserData {
  id: number;
  email: string;
  is_active: boolean;
  role?: { // Assuming role is eager-loaded or part of the user object
    id: number;
    name: string;
  };
  created_at: string; // Or Date
  remark?: string;
  used_traffic?: number | null;
  total_traffic?: number | null;
  expire_at?: string | null;
  plan_id?: number | null;
  speed_limit?: number | null;
  device_limit?: number | null;
  active_subscriptions?: Array<{
    id: number;
    start_date: string;
    end_date: string;
    total_traffic: number; // Changed from total_traffic_gb
    used_traffic: number; // Changed from used_traffic_gb
    speed_limit: number | null; // Changed from speed_limit_mbps
    device_limit: number | null; // Changed from current_device_count
    plan: {
      id: number;
      name: string;
    };
  }>;
  // Add other fields as necessary
}

interface UserTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  if (!users || users.length === 0) {
    return <p>No users found.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of registered users.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Remark</TableHead><TableHead>Subscription Plan</TableHead><TableHead>Traffic Used</TableHead><TableHead>Traffic Total</TableHead><TableHead>Expires At</TableHead><TableHead>Speed Limit</TableHead><TableHead>Device Limit</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role ? user.role.name : 'N/A'}</TableCell>
            <TableCell>
              {user.is_active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {/* Note: Shadcn Badge default variant might need specific styling or use 'outline', 'secondary' etc.
                  The default 'default' variant is primary colored. 'secondary' or custom might be better for status.
                  If 'Badge' component is not added yet, this will cause an error.
              */}
        </TableCell>
        <TableCell>{user.remark || 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 ? user.active_subscriptions[0].plan.name : 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 ? `${(user.active_subscriptions[0].used_traffic / (1024 * 1024 * 1024)).toFixed(2)} GB` : 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 ? `${(user.active_subscriptions[0].total_traffic / (1024 * 1024 * 1024)).toFixed(2)} GB` : 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 ? new Date(user.active_subscriptions[0].end_date).toLocaleDateString() : 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 && user.active_subscriptions[0].speed_limit !== null ? `${user.active_subscriptions[0].speed_limit} Mbps` : 'N/A'}</TableCell>
        <TableCell>{user.active_subscriptions && user.active_subscriptions.length > 0 ? `${user.active_subscriptions[0].device_limit}` : 'N/A'}</TableCell>
        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
        <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(user)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;