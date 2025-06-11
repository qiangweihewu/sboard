// src/pages/Users/UserListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import UserTable, { UserData } from '@/components/users/UserTable';
import UserForm, { RoleOption } from '@/components/users/UserForm';
import { UserFormValues } from '@/lib/validators/userValidator';
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
  // AlertDialogTrigger, // We might not use AlertDialogTrigger directly here
} from "@/components/ui/alert-dialog"; // Import AlertDialog components

interface PaginatedUsersResponse {
  data: UserData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const availableRoles: RoleOption[] = [
  { id: 1, name: 'SUPER_ADMIN' },
  { id: 2, name: 'ADMIN' },
  { id: 3, name: 'USER' },
];

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // For delete confirmation
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null); // User to be deleted

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false); // For delete operation

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<PaginatedUsersResponse>('/admin/users');
      setUsers(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch users:", err);
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUserSubmit = async (values: UserFormValues) => {
    setFormSubmitting(true);
    try {
      const dataToSubmit = { ...values, role_id: values.role_id ? Number(values.role_id) : null };
      await apiPost('/admin/users', dataToSubmit);
      setIsAddUserDialogOpen(false);
      fetchUsers();
      console.log("User created successfully");
    } catch (err: any) {
      console.error("Failed to create user:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create user.";
      alert("Error creating user: " + errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditUserSubmit = async (values: UserFormValues) => {
    if (!editingUser) return;
    setFormSubmitting(true);
    try {
        const { password, password_confirmation, ...dataToUpdate } = values;
        const updatePayload: Partial<UserFormValues> = {
            email: dataToUpdate.email,
            role_id: dataToUpdate.role_id ? Number(dataToUpdate.role_id) : null,
            is_active: dataToUpdate.is_active,
        };
        await apiPut(`/admin/users/${editingUser.id}`, updatePayload);
        setIsEditUserDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
        console.log("User updated successfully");
    } catch (err: any) {
        console.error("Failed to update user:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update user.";
        alert("Error updating user: " + errorMessage);
    } finally {
        setFormSubmitting(false);
    }
  };

  const openEditDialog = (user: UserData) => {
    const formInitialData: Partial<UserFormValues> = {
      email: user.email,
      role_id: user.role?.id,
      is_active: user.is_active,
    };
    setEditingUser(user);
    setIsEditUserDialogOpen(true);
  };

  // New functions for delete
  const openDeleteConfirmationDialog = (user: UserData) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteSubmitting(true);
    try {
      await apiDel(`/admin/users/${userToDelete.id}`);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh user list
      console.log("User deleted successfully");
      // Add toast notification here if desired
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete user.";
      alert("Error deleting user: " + errorMessage); // Simple alert for now
      // Add toast notification for error if desired
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        {/* Add User Dialog Trigger - existing */}
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
               <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
               <DialogHeader>
                 <DialogTitle>Add New User</DialogTitle>
                 <DialogDescription>Fill in the details to create a new user.</DialogDescription>
               </DialogHeader>
               <UserForm
                 onSubmit={handleAddUserSubmit}
                 isEditMode={false}
                 isLoading={formSubmitting}
                 availableRoles={availableRoles}
               />
            </DialogContent>
        </Dialog>
      </div>

      {isLoading && <p>Loading users...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (
        <UserTable
          users={users}
          onEdit={openEditDialog}
          onDelete={openDeleteConfirmationDialog} // Connect UserTable's onDelete
        />
      )}

      {/* Edit User Dialog - existing */}
      {editingUser && (
         <Dialog open={isEditUserDialogOpen} onOpenChange={(isOpen) => {
             setIsEditUserDialogOpen(isOpen);
             if (!isOpen) setEditingUser(null);
         }}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Edit User: {editingUser.email}</DialogTitle>
                <DialogDescription>Update the user's details below.</DialogDescription>
              </DialogHeader>
              <UserForm
                onSubmit={handleEditUserSubmit}
                isEditMode={true}
                initialData={{
                    email: editingUser.email,
                    role_id: editingUser.role?.id,
                    is_active: editingUser.is_active,
                }}
                isLoading={formSubmitting}
                availableRoles={availableRoles}
              />
            </DialogContent>
         </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
      {userToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user "{userToDelete.email}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)} disabled={deleteSubmitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} disabled={deleteSubmitting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {deleteSubmitting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default UserListPage;
