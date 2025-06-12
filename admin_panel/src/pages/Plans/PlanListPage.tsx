// src/pages/Plans/PlanListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import PlanTable, { PlanData } from '@/components/plans/PlanTable'; // Import PlanTable and PlanData
import PlanForm, { UserGroupOption } from '@/components/plans/PlanForm'; // Import UserGroupOption
import { PlanFormValues } from '@/lib/validators/planValidator';
import { get as apiGet, post as apiPost, put as apiPut, del as apiDel } from '@/services/api'; // Ensure apiPut is here
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

interface PaginatedPlansResponse {
  data: PlanData[];
  // ... other pagination fields
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Type for raw user group data from API, assuming it has at least id and name
interface ApiUserGroup {
  id: number;
  name: string;
  // other fields if present
}

// Define a type for the paginated API response for UserGroups, if applicable
// Assuming /admin/user-groups (apiResource) returns paginated data by default.
interface PaginatedApiUserGroupsResponse {
  data: ApiUserGroup[];
  // other pagination fields if needed
}


const PlanListPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For plans list
  const [error, setError] = useState<string | null>(null); // For plans list

  const [availableUserGroups, setAvailableUserGroups] = useState<UserGroupOption[]>([]); // New state for user groups
  const [groupsLoading, setGroupsLoading] = useState(false); // New state for groups loading
  const [groupsError, setGroupsError] = useState<string | null>(null); // New state for groups error

  // Placeholders for dialog states and form submission states (will be used in later steps)
  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false);
  // const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  // const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Add new states for edit dialog
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);

  // Add new states for delete dialog
  const [isDeletePlanDialogOpen, setIsDeletePlanDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanData | null>(null);
  const [deletePlanSubmitting, setDeletePlanSubmitting] = useState(false);


  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiGet<PaginatedPlansResponse>('/admin/plans');
      setPlans(response.data.data);
    } catch (err: any) {
      console.error("Failed to fetch plans:", err);
      setError(err.message || 'Failed to fetch plans.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // New function to fetch user groups
  const fetchUserGroupsForSelect = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      // Using PaginatedApiUserGroupsResponse as /admin/user-groups is an apiResource
      const response = await apiGet<PaginatedApiUserGroupsResponse>('/admin/user-groups');
      setAvailableUserGroups(response.data.data.map(group => ({ id: group.id, name: group.name })));

    } catch (err: any) {
      console.error("Failed to fetch user groups for form:", err);
      setGroupsError(err.message || 'Failed to fetch user groups.');
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchUserGroupsForSelect(); // Fetch user groups on component mount
  }, [fetchPlans, fetchUserGroupsForSelect]);


  const handleAddPlanSubmit = async (values: PlanFormValues) => {
    setFormSubmitting(true);
    try {
      // Prepare payload: Zod schema uses coerce for numbers,
      // but ensure they are numbers if API is strict.
      // node_selection_criteria is already validated as JSON string by Zod.
      const payload = {
        ...values,
        duration_days: Number(values.duration_days),
        traffic_limit_gb: Number(values.traffic_limit_gb),
        device_limit: Number(values.device_limit),
        price: values.price !== null && values.price !== undefined ? Number(values.price) : null,
        target_user_group_id: values.target_user_group_id ? Number(values.target_user_group_id) : null,
      };

      await apiPost('/admin/plans', payload);
      setIsAddPlanDialogOpen(false); // Close dialog on success
      fetchPlans(); // Refresh plan list
      console.log("Plan created successfully");
      // Replace with toast: toast({ title: "Plan Created", description: "New plan added successfully." });
      alert("Plan created successfully!"); // Temporary feedback
    } catch (err: any) {
      console.error("Failed to create plan:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create plan.";
      // Replace with toast: toast({ variant: "destructive", title: "Error", description: errorMessage });
      alert("Error creating plan: " + errorMessage); // Simple alert for now
      // Optionally, if API returns field-specific errors (e.g., err.response.data.errors),
      // you could pass them back to the form using form.setError() from react-hook-form,
      // but that requires passing the form instance or setError function down.
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditPlanSubmit = async (values: PlanFormValues) => {
    if (!editingPlan) return;
    setFormSubmitting(true);
    try {
        // Prepare payload, similar to add, ensuring numeric types
        const payload = {
            ...values,
            duration_days: Number(values.duration_days),
            traffic_limit_gb: Number(values.traffic_limit_gb),
            device_limit: Number(values.device_limit),
            price: values.price !== null && values.price !== undefined ? Number(values.price) : null,
            target_user_group_id: values.target_user_group_id ? Number(values.target_user_group_id) : null,
            // node_selection_criteria is already a string from the form, validated as JSON
        };

        await apiPut(`/admin/plans/${editingPlan.id}`, payload);
        setIsEditPlanDialogOpen(false);
        setEditingPlan(null);
        fetchPlans(); // Refresh plan list
        console.log("Plan updated successfully");
        alert("Plan updated successfully!"); // Temporary feedback
    } catch (err: any) {
        console.error("Failed to update plan:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to update plan.";
        alert("Error updating plan: " + errorMessage);
    } finally {
        setFormSubmitting(false);
    }
  };

  const openEditPlanDialog = (plan: PlanData) => {
    setEditingPlan(plan);
    setIsEditPlanDialogOpen(true);
  };

  // Placeholders for Edit/Delete Plan (will be implemented in later steps)
  // const handleEditPlan = (plan: PlanData) => { // This is replaced by openEditPlanDialog effectively
  //   console.log('Edit plan action triggered:', plan);
  // };
  // const handleDeletePlan = (plan: PlanData) => { // This is replaced by openDeletePlanConfirmationDialog
  //  console.log('Delete plan action triggered:', plan);
  // };

  const openDeletePlanConfirmationDialog = (plan: PlanData) => {
    setPlanToDelete(plan);
    setIsDeletePlanDialogOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    setDeletePlanSubmitting(true);
    try {
        await apiDel(`/admin/plans/${planToDelete.id}`);
        setIsDeletePlanDialogOpen(false);
        setPlanToDelete(null);
        fetchPlans(); // Refresh plan list
        console.log("Plan deleted successfully");
        alert("Plan deleted successfully!"); // Temporary feedback
    } catch (err: any) {
        console.error("Failed to delete plan:", err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to delete plan.";
        alert("Error deleting plan: " + errorMessage);
    } finally {
        setDeletePlanSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Plan Management (套餐管理)</h1>
        <Dialog open={isAddPlanDialogOpen} onOpenChange={setIsAddPlanDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={groupsLoading}>Add New Plan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg"> {/* Adjusted width for potentially longer form */}
            <DialogHeader>
              <DialogTitle>Add New Plan</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new plan.
                {groupsError && <span className='text-red-500 block mt-2'>Could not load user groups for selection. Form submission might fail.</span>}
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={handleAddPlanSubmit} // Placeholder
              isEditMode={false}
              isLoading={formSubmitting || groupsLoading}
              availableUserGroups={availableUserGroups} // Pass fetched user groups
            />
          </DialogContent>
        </Dialog>
      </div>

      {(isLoading || groupsLoading) && <p>Loading data...</p>}
      {error && <p className="text-red-500">Error fetching plans: {error}</p>}
      {groupsError && !error && <p className="text-red-500">Error fetching user groups: {groupsError}</p>}

      {!isLoading && !error && (
        <PlanTable
          plans={plans}
          onEdit={openEditPlanDialog}
          onDelete={openDeletePlanConfirmationDialog} // Connect onDelete
        />
      )}

      {/* Edit Plan Dialog - existing */}
      {editingPlan && (
         <Dialog open={isEditPlanDialogOpen} onOpenChange={(isOpen) => {
             setIsEditPlanDialogOpen(isOpen);
             if (!isOpen) setEditingPlan(null);
         }}>
            {/* ... (DialogContent for Edit Plan - keep existing) ... */}
             <DialogContent className="sm:max-w-lg">
               <DialogHeader>
                 <DialogTitle>Edit Plan: {editingPlan.name}</DialogTitle>
                 <DialogDescription>Update the plan's details below.
                     {groupsError && <span className='text-red-500 block mt-2'>Could not load user groups for selection.</span>}
                 </DialogDescription>
               </DialogHeader>
               <PlanForm
                 onSubmit={handleEditPlanSubmit}
                 isEditMode={true}
                 initialData={{
                     name: editingPlan.name,
                     description: editingPlan.description || '',
                     duration_days: editingPlan.duration_days,
                     traffic_limit_gb: editingPlan.traffic_limit_gb,
                     device_limit: editingPlan.device_limit,
                     price: editingPlan.price !== null && editingPlan.price !== undefined ? Number(editingPlan.price) : undefined,
                     node_selection_criteria: typeof editingPlan.node_selection_criteria === 'object'
                         ? JSON.stringify(editingPlan.node_selection_criteria, null, 2)
                         : editingPlan.node_selection_criteria || '{"tags":[]}',
                     target_user_group_id: editingPlan.target_user_group_id !== null && editingPlan.target_user_group_id !== undefined ? Number(editingPlan.target_user_group_id) : undefined,
                     is_active: editingPlan.is_active,
                 }}
                 isLoading={formSubmitting || groupsLoading}
                 availableUserGroups={availableUserGroups}
               />
            </DialogContent>
         </Dialog>
      )}

      {/* Delete Plan Confirmation Dialog */}
      {planToDelete && (
        <AlertDialog open={isDeletePlanDialogOpen} onOpenChange={setIsDeletePlanDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
                Are you sure you want to delete the plan "{planToDelete.name}"?
                This action cannot be undone and might affect existing user subscriptions.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToDelete(null)} disabled={deletePlanSubmitting}>
                Cancel
            </AlertDialogCancel>
            <AlertDialogAction
                onClick={confirmDeletePlan}
                disabled={deletePlanSubmitting}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground" // Standard destructive styling
            >
                {deletePlanSubmitting ? 'Deleting...' : 'Delete Plan'}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default PlanListPage;
