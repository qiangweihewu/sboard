// src/components/user_groups/UserGroupTable.tsx
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

// Define a type for the user group data expected by this table
export interface UserGroupData {
  id: number;
  name: string;
  description?: string | null; // Description can be optional
  created_at: string; // Or Date
  // users_count?: number; // For future enhancement
}

interface UserGroupTableProps {
  userGroups: UserGroupData[];
  onEdit: (group: UserGroupData) => void;
  onDelete: (group: UserGroupData) => void;
}

const UserGroupTable: React.FC<UserGroupTableProps> = ({ userGroups, onEdit, onDelete }) => {
  if (!userGroups || userGroups.length === 0) {
    return <p>No user groups found.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of user groups.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userGroups.map((group) => (
          <TableRow key={group.id}>
            <TableCell className="font-medium">{group.id}</TableCell>
            <TableCell>{group.name}</TableCell>
            <TableCell>{group.description || 'N/A'}</TableCell>
            <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(group)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(group)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserGroupTable;