// src/pages/UserGroups/UserGroupListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import UserGroupTable, { UserGroupData } from '@/components/user_groups/UserGroupTable';
import UserGroupForm from '@/components/user_groups/UserGroupForm';
import { UserGroupFormValues } from '@/lib/validators/userGroupValidator';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel } from '@/services/api'; // Add apiDel
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
  // AlertDialogTrigger, // Not used directly here
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface PaginatedUserGroupsResponse {
  data: UserGroupData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const UserGroupListPage: React.FC = () => {
  const [userGroups, setUserGroups] = useState<UserGroupData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddGroupDialogOpen, setIsAddGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroupData | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // For delete confirmation
  const [groupToDelete, setGroupToDelete] = useState<UserGroupData | null>(null); // Group to be deleted

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false); // For delete operation

  const fetchUserGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<PaginatedUserGroupsResponse>('/admin/user-groups');
      setUserGroups(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch user groups:", err);
      setError(err.message || 'Failed to fetch user groups.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserGroups();
  }, [fetchUserGroups]);

  const handleAddGroupSubmit = async (values: UserGroupFormValues) => {
    setFormSubmitting(true);
    try {
      await apiPost('/admin/user-groups', values);
      setIsAddGroupDialogOpen(false);
      fetchUserGroups();
      console.log("User group created successfully");
    } catch (err: any) {
      console.error("Failed to create user group:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create user group.";
      alert("Error creating user group: " + errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditGroupSubmit = async (values: UserGroupFormValues) => {
    if (!editingGroup) return;
    setFormSubmitting(true);
    try {
      await apiPut(`/admin/user-groups/${editingGroup.id}`, values);
      setIsEditGroupDialogOpen(false);
      setEditingGroup(null);
      fetchUserGroups();
      console.log("User group updated successfully");
    } catch (err: any) {
      console.error("Failed to update user group:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update user group.";
      alert("Error updating user group: " + errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditGroupDialog = (group: UserGroupData) => {
    setEditingGroup(group);
    setIsEditGroupDialogOpen(true);
  };

  // Updated handleDeleteGroup to openDeleteConfirmationDialog
  const openDeleteConfirmationDialog = (group: UserGroupData) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    setDeleteSubmitting(true);
    try {
      await apiDel(`/admin/user-groups/${groupToDelete.id}`);
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
      fetchUserGroups(); // Refresh user group list
      console.log("User group deleted successfully");
      // Add toast notification here if desired
    } catch (err: any) {
      console.error("Failed to delete user group:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete user group.";
      alert("Error deleting user group: " + errorMessage); // Simple alert for now
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Group Management</h1>
        {/* Add User Group Dialog Trigger - existing */}
        <Dialog open={isAddGroupDialogOpen} onOpenChange={setIsAddGroupDialogOpen}>
            <DialogTrigger asChild>
               <Button>Add New User Group</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                 <DialogTitle>Add New User Group</DialogTitle>
                 <DialogDescription>Fill in the details to create a new user group.</DialogDescription>
               </DialogHeader>
               <UserGroupForm
                 onSubmit={handleAddGroupSubmit}
                 isEditMode={false}
                 isLoading={formSubmitting}
               />
            </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading user groups...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <UserGroupTable
          userGroups={userGroups}
          onEdit={openEditGroupDialog}
          onDelete={openDeleteConfirmationDialog} // Connect UserGroupTable's onDelete
        />
      )}

      {/* Edit User Group Dialog - existing */}
      {editingGroup && (
         <Dialog open={isEditGroupDialogOpen} onOpenChange={(isOpen) => {
             setIsEditGroupDialogOpen(isOpen);
             if (!isOpen) setEditingGroup(null);
         }}>
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit User Group: {editingGroup.name}</DialogTitle>
                  <DialogDescription>Update the user group's details below.</DialogDescription>
                </DialogHeader>
                <UserGroupForm
                  onSubmit={handleEditGroupSubmit}
                  isEditMode={true}
                  initialData={{
                      name: editingGroup.name,
                      description: editingGroup.description || '',
                  }}
                  isLoading={formSubmitting}
                />
            </DialogContent>
         </Dialog>
      )}

      {/* Delete User Group Confirmation Dialog */}
      {groupToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user group "{groupToDelete.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setGroupToDelete(null)} disabled={deleteSubmitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteGroup} disabled={deleteSubmitting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {deleteSubmitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default UserGroupListPage;
