// src/components/plans/PlanForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planFormSchema, type PlanFormValues } from '@/lib/validators/planValidator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define a type for available user groups (ID and Name)
export interface UserGroupOption {
  id: number;
  name: string;
}

interface PlanFormProps {
  onSubmit: (values: PlanFormValues) => Promise<void>;
  initialData?: Partial<PlanFormValues>;
  isEditMode?: boolean;
  isLoading?: boolean;
  availableUserGroups?: UserGroupOption[];
}

const PlanForm: React.FC<PlanFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false,
  availableUserGroups = []
}) => {
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: initialData ? { // Pre-process initialData for form compatibility
        ...initialData,
        node_selection_criteria: typeof initialData.node_selection_criteria === 'object'
            ? JSON.stringify(initialData.node_selection_criteria, null, 2)
            : initialData.node_selection_criteria || '{"tags": ["default"]}',
        price: initialData.price !== null && initialData.price !== undefined ? Number(initialData.price) : undefined,
        target_user_group_id: initialData.target_user_group_id !== null && initialData.target_user_group_id !== undefined ? Number(initialData.target_user_group_id) : undefined,
        duration_days: initialData.duration_days || 30,
        traffic_limit_gb: initialData.traffic_limit_gb || 100,
        device_limit: initialData.device_limit || 3,
        is_active: initialData.is_active === undefined ? true : initialData.is_active,

    } : { // Default values for create mode
        name: '',
        description: '',
        duration_days: 30,
        traffic_limit_gb: 100,
        device_limit: 3,
        price: undefined,
        node_selection_criteria: '{"tags": ["default"]}',
        target_user_group_id: undefined,
        is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      const preparedInitialData = {
        ...initialData,
        node_selection_criteria: typeof initialData.node_selection_criteria === 'object'
          ? JSON.stringify(initialData.node_selection_criteria, null, 2)
          : initialData.node_selection_criteria || '{"tags": ["default"]}',
        price: initialData.price !== null && initialData.price !== undefined ? Number(initialData.price) : undefined,
        target_user_group_id: initialData.target_user_group_id !== null && initialData.target_user_group_id !== undefined ? Number(initialData.target_user_group_id) : undefined,
      };
      form.reset(preparedInitialData);
    } else { // Reset to default create values if initialData becomes null (e.g. dialog closes and reopens for create)
        form.reset({
            name: '',
            description: '',
            duration_days: 30,
            traffic_limit_gb: 100,
            device_limit: 3,
            price: undefined,
            node_selection_criteria: '{"tags": ["default"]}',
            target_user_group_id: undefined,
            is_active: true,
        });
    }
  }, [initialData, form]);

  const handleSubmit = async (values: PlanFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1"> {/* Added max-h and overflow for scroll */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan Name</FormLabel>
              <FormControl><Input placeholder="E.g., Basic, Premium, VIP" {...field} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Details about the plan..." className="resize-none" {...field} disabled={isLoading} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
             control={form.control}
             name="duration_days"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Duration (Days)</FormLabel>
                 <FormControl><Input type="number" placeholder="30" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} disabled={isLoading} /></FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="traffic_limit_gb"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Traffic Limit (GB)</FormLabel>
                 <FormControl><Input type="number" placeholder="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} disabled={isLoading} /></FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
             control={form.control}
             name="device_limit"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Device Limit</FormLabel>
                 <FormControl><Input type="number" placeholder="3" {...field} onChange={e => field.onChange(parseInt(e.target.value,10))} disabled={isLoading} /></FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
           <FormField
             control={form.control}
             name="price"
             render={({ field }) => (
               <FormItem>
                 <FormLabel>Price (Optional)</FormLabel>
                 <FormControl><Input type="number" placeholder="10.00" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} value={field.value ?? ''} disabled={isLoading} /></FormControl>
                 <FormMessage />
               </FormItem>
             )}
           />
        </div>
        <FormField
          control={form.control}
          name="node_selection_criteria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Node Selection Criteria (JSON)</FormLabel>
              <FormControl><Textarea placeholder='{"tags": ["US"], "country": "JP"}' {...field} rows={4} disabled={isLoading} /></FormControl>
              <FormDescription>Enter a valid JSON object. E.g., {"{\"tags\": [\"vip\"]}"}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_user_group_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target User Group (Optional)</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : null)}
                value={field.value?.toString() ?? ""} // Ensure value is string or empty string for Select
                disabled={isLoading || availableUserGroups.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user group (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None</SelectItem> {/* Explicit None option */}
                  {availableUserGroups.map(group => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name}
                    </SelectItem>
                  ))}
                  {/* This might be redundant if "None" is always an option or if the list can be empty */}
                  {/* {availableUserGroups.length === 0 && <SelectItem value="" disabled>No user groups available</SelectItem>} */}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active Status</FormLabel>
                <FormDescription>Inactive plans cannot be subscribed to.</FormDescription>
              </div>
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} /></FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (isEditMode ? 'Saving Changes...' : 'Creating Plan...') : (isEditMode ? 'Save Changes' : 'Create Plan')}
        </Button>
      </form>
    </Form>
  );
};

export default PlanForm;