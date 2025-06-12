// src/pages/Nodes/NodeListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import NodeTable, { type NodeData } from '@/components/nodes/NodeTable';
import NodeForm from '@/components/nodes/NodeForm';
import type { AddNodeFormValues, EditNodeFormValues } from '@/lib/validators/nodeValidator';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface PaginatedNodesResponse {
  data: NodeData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const NodeListPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isEditNodeDialogOpen, setIsEditNodeDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);

  const [isDeleteNodeDialogOpen, setIsDeleteNodeDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<NodeData | null>(null);
  const [deleteNodeSubmitting, setDeleteNodeSubmitting] = useState(false);

  const fetchNodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<PaginatedNodesResponse>('/admin/nodes');
      setNodes(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch nodes:", err);
      setError(err.message || 'Failed to fetch nodes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const handleAddNodeSubmit = async (values: AddNodeFormValues) => {
    setFormSubmitting(true);
    try {
      const payload = {
        ...values,
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : values.tags || [],
      };

      await apiPost('/admin/nodes', payload);
      setIsAddNodeDialogOpen(false);
      fetchNodes();
      console.log("Node added successfully via config URL");
      alert("Node added successfully!");
    } catch (err: any) {
      console.error("Failed to add node:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to add node.";
      if (err.response?.data?.errors?.config_url) {
        alert("Error adding node: " + err.response.data.errors.config_url.join(' '));
      } else if (err.response?.data?.errors) {
        const firstErrorField = Object.keys(err.response.data.errors)[0];
        alert("Error adding node: " + err.response.data.errors[firstErrorField].join(' '));
      }
      else {
        alert("Error adding node: " + errorMessage);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditNodeSubmit = async (values: EditNodeFormValues) => {
    if (!editingNode) return;
    setFormSubmitting(true);
    try {
        const payload = {
            name: values.name,
            is_active: values.is_active,
            tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : values.tags || [],
        };

        await apiPut(`/admin/nodes/${editingNode.id}`, payload);
        setIsEditNodeDialogOpen(false);
        setEditingNode(null);
        fetchNodes();
        console.log("Node updated successfully");
        alert("Node updated successfully!");
    } catch (err: any) {
        console.error("Failed to update node:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update node.";
        alert("Error updating node: " + errorMessage);
    } finally {
        setFormSubmitting(false);
    }
  };

  const openEditNodeDialog = (node: NodeData) => {
    setEditingNode(node);
    setIsEditNodeDialogOpen(true);
  };

  const openDeleteNodeConfirmationDialog = (node: NodeData) => {
    setNodeToDelete(node);
    setIsDeleteNodeDialogOpen(true);
  };

  const confirmDeleteNode = async () => {
    if (!nodeToDelete) return;
    setDeleteNodeSubmitting(true);
    try {
        await apiDel(`/admin/nodes/${nodeToDelete.id}`);
        setIsDeleteNodeDialogOpen(false);
        setNodeToDelete(null);
        fetchNodes();
        console.log("Node deleted successfully");
        alert("Node deleted successfully!");
    } catch (err: any) {
        console.error("Failed to delete node:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete node.";
        alert("Error deleting node: " + errorMessage);
    } finally {
        setDeleteNodeSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Node Management</h1>
        <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Node</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Node</DialogTitle>
              <DialogDescription>
                Paste the node configuration URL (e.g., VLESS or VMess URI) below.
              </DialogDescription>
            </DialogHeader>
            <NodeForm
              onSubmit={handleAddNodeSubmit as any}
              isEditMode={false}
              isLoading={formSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading nodes...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <NodeTable
          nodes={nodes}
          onEdit={openEditNodeDialog}
          onDelete={openDeleteNodeConfirmationDialog}
        />
      )}

      {editingNode && (
         <Dialog open={isEditNodeDialogOpen} onOpenChange={(isOpen) => {
             setIsEditNodeDialogOpen(isOpen);
             if (!isOpen) setEditingNode(null);
         }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Node: {editingNode.name}</DialogTitle>
                <DialogDescription>Update the node's editable details below.</DialogDescription>
              </DialogHeader>
              <NodeForm
                onSubmit={handleEditNodeSubmit as any}
                isEditMode={true}
                initialData={{
                    name: editingNode.name,
                    tags: editingNode.tags || [],
                    is_active: editingNode.is_active,
                }}
                isLoading={formSubmitting}
              />
            </DialogContent>
         </Dialog>
      )}

      {nodeToDelete && (
        <AlertDialog open={isDeleteNodeDialogOpen} onOpenChange={setIsDeleteNodeDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete the node "{nodeToDelete.name}" ({nodeToDelete.address}:{nodeToDelete.port})?
                This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNodeToDelete(null)} disabled={deleteNodeSubmitting}>
                Cancel
            </AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeleteNode}
                disabled={deleteNodeSubmitting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
                {deleteNodeSubmitting ? 'Deleting...' : 'Delete Node'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default NodeListPage;