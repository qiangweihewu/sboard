// src/pages/Nodes/NodeListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import NodeTable, { NodeData } from '@/components/nodes/NodeTable'; // Import NodeTable and NodeData
import NodeForm from '@/components/nodes/NodeForm'; // Import NodeForm
import { AddNodeFormValues, EditNodeFormValues } from '@/lib/validators/nodeValidator'; // Import form values type, add EditNodeFormValues
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel } from '@/services/api'; // Import apiPost, ensure apiPut, add apiDel
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
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface PaginatedNodesResponse {
  data: NodeData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  // Add other pagination fields if needed
}

const NodeListPage: React.FC = () => {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For list loading
  const [error, setError] = useState<string | null>(null); // For list loading

  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false); // For form submission

  // Add new states for edit dialog
  const [isEditNodeDialogOpen, setIsEditNodeDialogOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeData | null>(null);

  // Add new states for delete dialog
  const [isDeleteNodeDialogOpen, setIsDeleteNodeDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<NodeData | null>(null);
  const [deleteNodeSubmitting, setDeleteNodeSubmitting] = useState(false);

  const fetchNodes = useCallback(async (/* page: number = 1 */) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<PaginatedNodesResponse>('/admin/nodes');
      setNodes(response.data.data); // Assuming backend returns data in a 'data' property for pagination
      // setTotalPages(response.data.last_page);
      // setCurrentPage(response.data.current_page);
    } catch (err: any) {
      console.error("Failed to fetch nodes:", err);
      setError(err.message || 'Failed to fetch nodes.');
    } finally {
      setIsLoading(false);
    }
  }, []); // Add dependencies like currentPage if used

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  const handleAddNodeSubmit = async (values: AddNodeFormValues) => {
    setFormSubmitting(true);
    try {
      // The NodeForm already converts tags string to array before calling onSubmit if it was implemented that way.
      // AddNodeFormValues defines tags as string (comma-separated).
      // The backend NodeController's store method (from previous step) expects tags as an array.
      // So, we must ensure tags are converted to an array here if they are a string from the form values.
      const payload = {
        ...values,
        // NodeForm's handleSubmit already converts comma-separated string to array.
        // If values.tags is already string[], this is fine. If it's string, NodeForm should handle it.
        // For safety, if NodeForm's onSubmit passes the raw string value for tags:
        tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : values.tags || [],
      };

      await apiPost('/admin/nodes', payload);
      setIsAddNodeDialogOpen(false); // Close dialog on success
      fetchNodes(); // Refresh node list
      console.log("Node added successfully via config URL");
      alert("Node added successfully!"); // Temporary feedback
    } catch (err: any) {
      console.error("Failed to add node:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to add node.";
      // Check for validation errors from backend if err.response.data.errors exists
      if (err.response?.data?.errors?.config_url) {
        alert("Error adding node: " + err.response.data.errors.config_url.join(' '));
      } else if (err.response?.data?.errors) { // Generic way to show first validation error
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

  const handleEditNodeSubmit = async (values: EditNodeFormValues) => { // Type is EditNodeFormValues
    if (!editingNode) return;
    setFormSubmitting(true);
    try {
        // NodeForm already converts tags string to array before calling onSubmit.
        // So 'values.tags' here should be string[] if NodeForm's handleSubmit was correctly typed.
        // However, the EditNodeFormValues type has 'tags' as string.
        // Let's ensure the payload matches what the API expects (tags as array).
        const payload = {
            name: values.name,
            is_active: values.is_active,
            // NodeForm's handleSubmit already converts comma-separated string to array.
            // If values.tags is already string[], this is fine. If it's string, NodeForm should handle it.
            // For safety, if NodeForm's onSubmit passes the raw string value for tags:
            tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : values.tags || [],
        };
        // If NodeForm's onSubmit already prepared tags as array, this re-split is redundant but safe.

        await apiPut(`/admin/nodes/${editingNode.id}`, payload);
        setIsEditNodeDialogOpen(false);
        setEditingNode(null);
        fetchNodes(); // Refresh node list
        console.log("Node updated successfully");
        alert("Node updated successfully!"); // Temporary feedback
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

  // const handleDeleteNode = (node: NodeData) => { // This is replaced by openDeleteNodeConfirmationDialog
  //   console.log('Delete node action triggered:', node);
  //   // TODO: Implement logic for delete confirmation and API call for nodes
  // };

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
        fetchNodes(); // Refresh node list
        console.log("Node deleted successfully");
        alert("Node deleted successfully!"); // Temporary feedback
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
          <DialogContent className="sm:max-w-md"> {/* Adjust width as needed */}
            <DialogHeader>
              <DialogTitle>Add New Node</DialogTitle>
              <DialogDescription>
                Paste the node configuration URL (e.g., VLESS or VMess URI) below.
              </DialogDescription>
            </DialogHeader>
            <NodeForm
              onSubmit={handleAddNodeSubmit as any} // Cast due to AddNodeFormValues vs EditNodeFormValues in NodeForm
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
          onDelete={openDeleteNodeConfirmationDialog} // Connect onDelete
        />
      )}

      {/* Edit Node Dialog - existing */}
      {editingNode && (
         <Dialog open={isEditNodeDialogOpen} onOpenChange={(isOpen) => {
             setIsEditNodeDialogOpen(isOpen);
             if (!isOpen) setEditingNode(null);
         }}>
            {/* ... (DialogContent for Edit Node - keep existing) ... */}
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

      {/* Delete Node Confirmation Dialog */}
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" // Standard destructive styling
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
