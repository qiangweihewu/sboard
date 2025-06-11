// src/pages/UserGroups/UserGroupListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import UserGroupTable, { UserGroupData } from '@/components/user_groups/UserGroupTable';
import UserGroupForm from '@/components/user_groups/UserGroupForm';
import { UserGroupFormValues } from '@/lib/validators/userGroupValidator';
import { get as apiGet, post as apiPost, put as apiPut } from '@/services/api'; // Add apiPut
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false); // New state
  const [editingGroup, setEditingGroup] = useState<UserGroupData | null>(null); // New state

  const [formSubmitting, setFormSubmitting] = useState(false);

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
      fetchUserGroups(); // Refresh user group list
      console.log("User group updated successfully");
      // Add toast notification here if desired
    } catch (err: any) {
      console.error("Failed to update user group:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update user group.";
      alert("Error updating user group: " + errorMessage); // Simple alert for now
    } finally {
      setFormSubmitting(false);
    }
  };

  const openEditGroupDialog = (group: UserGroupData) => {
    setEditingGroup(group);
    setIsEditGroupDialogOpen(true);
  };

  const handleDeleteGroup = (group: UserGroupData) => {
    console.log('Delete group action triggered:', group);
    // TODO: Implement logic for delete confirmation and API call for user groups
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
          onEdit={openEditGroupDialog} // Connect UserGroupTable's onEdit
          onDelete={handleDeleteGroup}
        />
      )}

      {/* Edit User Group Dialog */}
      {editingGroup && (
        <Dialog open={isEditGroupDialogOpen} onOpenChange={(isOpen) => {
            setIsEditGroupDialogOpen(isOpen);
            if (!isOpen) setEditingGroup(null); // Clear editing group when dialog closes
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Group: {editingGroup.name}</DialogTitle>
              <DialogDescription>Update the user group's details below.</DialogDescription>
            </DialogHeader>
            <UserGroupForm
              onSubmit={handleEditGroupSubmit}
              isEditMode={true}
              initialData={{ // Pass existing data to the form
                  name: editingGroup.name,
                  description: editingGroup.description || '',
              }}
              isLoading={formSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserGroupListPage;
