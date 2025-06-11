// src/pages/Users/UserListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import UserTable, { UserData } from '@/components/users/UserTable';
import UserForm, { RoleOption } from '@/components/users/UserForm'; // RoleOption is already defined in UserForm
import { UserFormValues } from '@/lib/validators/userValidator';
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

interface PaginatedUsersResponse {
  data: UserData[];
  // ... other pagination fields
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Remove the hardcoded availableRoles from here

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For users list
  const [error, setError] = useState<string | null>(null); // For users list

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]); // New state for roles
  const [rolesLoading, setRolesLoading] = useState(false); // New state for roles loading
  const [rolesError, setRolesError] = useState<string | null>(null); // New state for roles error

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

  // New function to fetch roles
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    setRolesError(null);
    try {
      // Assuming the Role model in backend has 'id' and 'name'
      const response = await apiGet<RoleOption[]>('/admin/roles');
      setAvailableRoles(response.data);
    } catch (err: any) {
      console.error("Failed to fetch roles:", err);
      setRolesError(err.message || 'Failed to fetch roles.');
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles on component mount
  }, [fetchUsers, fetchRoles]);

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
      fetchUsers();
      console.log("User deleted successfully");
    } catch (err: any)
      {
      console.error("Failed to delete user:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete user.";
      alert("Error deleting user: " + errorMessage);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={rolesLoading}>Add New User</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Fill in the details to create a new user. {rolesError && <span className='text-red-500'>Could not load roles.</span>}</DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={handleAddUserSubmit}
              isEditMode={false}
              isLoading={formSubmitting || rolesLoading} // Disable form if roles are loading
              availableRoles={availableRoles} // Pass fetched roles
            />
          </DialogContent>
        </Dialog>
      </div>

      {(isLoading || rolesLoading) && <p>Loading data...</p>} {/* Combined loading state */}
      {error && <p className="text-red-500">Error fetching users: {error}</p>}
      {rolesError && !error && <p className="text-red-500">Error fetching roles: {rolesError}</p>} {/* Show roles error if user error isn't already shown */}

      {!isLoading && !error && (
        <UserTable
          users={users}
          onEdit={openEditDialog}
          onDelete={openDeleteConfirmationDialog}
        />
      )}

      {editingUser && (
         <Dialog open={isEditUserDialogOpen} onOpenChange={(isOpen) => {
             setIsEditUserDialogOpen(isOpen);
             if (!isOpen) setEditingUser(null);
         }}>
           <DialogContent className="sm:max-w-[525px]">
             <DialogHeader>
               <DialogTitle>Edit User: {editingUser.email}</DialogTitle>
               <DialogDescription>Update the user's details below. {rolesError && <span className='text-red-500'>Could not load roles.</span>}</DialogDescription>
             </DialogHeader>
             <UserForm
               onSubmit={handleEditUserSubmit}
               isEditMode={true}
               initialData={{
                   email: editingUser.email,
                   role_id: editingUser.role?.id,
                   is_active: editingUser.is_active,
               }}
               isLoading={formSubmitting || rolesLoading} // Disable form if roles are loading
               availableRoles={availableRoles} // Pass fetched roles
             />
           </DialogContent>
         </Dialog>
      )}

      {/* Delete User Confirmation Dialog - keep existing */}
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
