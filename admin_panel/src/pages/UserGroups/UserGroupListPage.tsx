// src/pages/UserGroups/UserGroupListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import UserGroupTable, { UserGroupData } from '@/components/user_groups/UserGroupTable';
import UserGroupForm from '@/components/user_groups/UserGroupForm';
import { UserGroupFormValues } from '@/lib/validators/userGroupValidator';
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<UserGroupData | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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
      fetchUserGroups();
      console.log("User group deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete user group:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete user group.";
      alert("Error deleting user group: " + errorMessage);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Group Management</h1>
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
          onDelete={openDeleteConfirmationDialog}
        />
      )}

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