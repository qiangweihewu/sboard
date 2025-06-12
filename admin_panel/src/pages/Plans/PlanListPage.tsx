// src/pages/Plans/PlanListPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import PlanTable, { PlanData } from '@/components/plans/PlanTable';
import PlanForm, { UserGroupOption } from '@/components/plans/PlanForm';
import { PlanFormValues } from '@/lib/validators/planValidator';
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

interface PaginatedPlansResponse {
  data: PlanData[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

interface ApiUserGroup {
  id: number;
  name: string;
}

interface PaginatedApiUserGroupsResponse {
  data: ApiUserGroup[];
}

const PlanListPage: React.FC = () => {
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableUserGroups, setAvailableUserGroups] = useState<UserGroupOption[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const [isAddPlanDialogOpen, setIsAddPlanDialogOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);

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

  const fetchUserGroupsForSelect = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
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
    fetchUserGroupsForSelect();
  }, [fetchPlans, fetchUserGroupsForSelect]);

  const handleAddPlanSubmit = async (values: PlanFormValues) => {
    setFormSubmitting(true);
    try {
      const payload = {
        ...values,
        duration_days: Number(values.duration_days),
        traffic_limit_gb: Number(values.traffic_limit_gb),
        device_limit: Number(values.device_limit),
        price: values.price !== null && values.price !== undefined ? Number(values.price) : null,
        target_user_group_id: values.target_user_group_id ? Number(values.target_user_group_id) : null,
      };

      await apiPost('/admin/plans', payload);
      setIsAddPlanDialogOpen(false);
      fetchPlans();
      console.log("Plan created successfully");
      alert("Plan created successfully!");
    } catch (err: any) {
      console.error("Failed to create plan:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to create plan.";
      alert("Error creating plan: " + errorMessage);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditPlanSubmit = async (values: PlanFormValues) => {
    if (!editingPlan) return;
    setFormSubmitting(true);
    try {
        const payload = {
            ...values,
            duration_days: Number(values.duration_days),
            traffic_limit_gb: Number(values.traffic_limit_gb),
            device_limit: Number(values.device_limit),
            price: values.price !== null && values.price !== undefined ? Number(values.price) : null,
            target_user_group_id: values.target_user_group_id ? Number(values.target_user_group_id) : null,
        };

        await apiPut(`/admin/plans/${editingPlan.id}`, payload);
        setIsEditPlanDialogOpen(false);
        setEditingPlan(null);
        fetchPlans();
        console.log("Plan updated successfully");
        alert("Plan updated successfully!");
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
        fetchPlans();
        console.log("Plan deleted successfully");
        alert("Plan deleted successfully!");
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Plan</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new plan.
                {groupsError && <span className='text-red-500 block mt-2'>Could not load user groups for selection. Form submission might fail.</span>}
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={handleAddPlanSubmit}
              isEditMode={false}
              isLoading={formSubmitting || groupsLoading}
              availableUserGroups={availableUserGroups}
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
          onDelete={openDeletePlanConfirmationDialog}
        />
      )}

      {editingPlan && (
         <Dialog open={isEditPlanDialogOpen} onOpenChange={(isOpen) => {
             setIsEditPlanDialogOpen(isOpen);
             if (!isOpen) setEditingPlan(null);
         }}>
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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