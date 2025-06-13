// src/components/plans/PlanTable.tsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Shadcn UI Table components
import { Button } from "@/components/ui/button"; // For action buttons
import { Badge } from "@/components/ui/badge";   // For status

// Define a type for the plan data expected by this table
// This should align with the Plan model from the backend
export interface PlanData {
  id: number;
  name: string;
  description?: string | null;
  duration_days: number;
  traffic_limit_gb: number; // Assuming backend sends as number
  device_limit: number;
  speed_limit_mbps?: number | null; // Add speed_limit_mbps
  price?: number | string | null; // Price can be number or string (e.g., "10.00")
  is_active: boolean;
  node_selection_criteria: any; // JSON, can be more specific later
  target_user_group_id?: number | null;
  target_user_group?: { // If eager loaded
    id: number;
    name: string;
  } | null;
  created_at: string; // Or Date
}

interface PlanTableProps {
  plans: PlanData[];
  onEdit: (plan: PlanData) => void;
  onDelete: (plan: PlanData) => void;
}

const PlanTable: React.FC<PlanTableProps> = ({ plans, onEdit, onDelete }) => {
  if (!plans || plans.length === 0) {
    return <p>No plans found.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of available subscription plans.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Duration (Days)</TableHead>
          <TableHead>Traffic (GB)</TableHead>
          <TableHead>Devices</TableHead>
          <TableHead>Speed Limit (Mbps)</TableHead> {/* Add Speed Limit column header */}
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id}>
            <TableCell className="font-medium">{plan.id}</TableCell>
            <TableCell>{plan.name}</TableCell>
            <TableCell>{plan.duration_days}</TableCell>
            <TableCell>{plan.traffic_limit_gb}</TableCell>
            <TableCell>{plan.device_limit}</TableCell>
            <TableCell>{plan.speed_limit_mbps ? `${plan.speed_limit_mbps} Mbps` : 'N/A'}</TableCell> {/* Display speed limit */}
            <TableCell>{plan.price ? `$${Number(plan.price).toFixed(2)}` : 'N/A'}</TableCell>
            <TableCell>
              {plan.is_active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(plan)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PlanTable;