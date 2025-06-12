// src/components/nodes/NodeTable.tsx
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

// Define a type for the node data expected by this table
// This should align with the Node model from the backend
export interface NodeData {
  id: number;
  name: string;
  type: string; // e.g., VLESS, VMESS
  address: string;
  port: number;
  is_active: boolean;
  tags?: string[] | null; // Assuming tags are stored as an array of strings
  protocol_specific_config?: any; // For display if needed, or just for info
  created_at: string; // Or Date
  // status_verified_at?: string | null; // For future health checks
  // last_error_message?: string | null; // For future health checks
}

interface NodeTableProps {
  nodes: NodeData[];
  onEdit: (node: NodeData) => void;
  onDelete: (node: NodeData) => void;
  // onTestNode?: (node: NodeData) => void; // For future
}

const NodeTable: React.FC<NodeTableProps> = ({ nodes, onEdit, onDelete /*, onTestNode */ }) => {
  if (!nodes || nodes.length === 0) {
    return <p>No nodes found.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of configured nodes.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Port</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow key={node.id}>
            <TableCell className="font-medium">{node.id}</TableCell>
            <TableCell>{node.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{node.type.toUpperCase()}</Badge>
            </TableCell>
            <TableCell>{node.address}</TableCell>
            <TableCell>{node.port}</TableCell>
            <TableCell>
              {node.is_active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </TableCell>
            <TableCell>
              {node.tags && node.tags.length > 0
                ? node.tags.map(tag => <Badge key={tag} variant="secondary" className="mr-1 mb-1">{tag}</Badge>)
                : 'N/A'}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {/* <Button variant="ghost" size="sm" onClick={() => onTestNode && onTestNode(node)}>Test</Button> */}
              <Button variant="outline" size="sm" onClick={() => onEdit(node)}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(node)}>
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NodeTable;
