// src/components/users/UserForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, type UserFormValues } from '@/lib/validators/userValidator'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

// Define a type for available roles (ID and Name)
export interface RoleOption {
  id: number;
  name:string;
}

interface UserFormProps {
  onSubmit: (values: UserFormValues) => Promise<void>;
  initialData?: Partial<UserFormValues>; // For pre-filling form in edit mode
  isEditMode?: boolean;
  isLoading?: boolean;
  availableRoles?: RoleOption[]; // To populate the Role select field
}

const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false,
  availableRoles = []
}) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema), // Using the base schema
    defaultValues: initialData || {
      email: '',
      password: '',
      password_confirmation: '',
      role_id: undefined, // Or a default role_id if applicable
      is_active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // The note about dynamic schema adjustment in the prompt was insightful.
  // Forcing password requirement on create mode is better handled in submit logic
  // or by using a different schema for create vs edit if complexity grows.
  // The current schema `userFormSchema` makes password optional.

  const handleSubmit = async (values: UserFormValues) => {
    // For create mode, ensure password is provided
    if (!isEditMode && (!values.password || values.password.length < 8)) {
      form.setError("password", { type: "manual", message: "Password is required and must be at least 8 characters for new users." });
      // Also check confirmation if password is set
      if (values.password && values.password.length >=8 && values.password !== values.password_confirmation) {
        form.setError("password_confirmation", { type: "manual", message: "Passwords do not match."});
      }
      if (form.formState.errors.password || form.formState.errors.password_confirmation) {
        return;
      }
    }
    // If in edit mode and password is provided, ensure confirmation matches
    if (isEditMode && values.password && values.password.length > 0) {
        if (values.password.length < 8) {
            form.setError("password", { type: "manual", message: "Password must be at least 8 characters."});
            return;
        }
        if (values.password !== values.password_confirmation) {
            form.setError("password_confirmation", { type: "manual", message: "Passwords do not match."});
            return;
        }
    }


    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@example.com" {...field} disabled={isLoading || isEditMode} />
                {/* Email typically not editable or handled with care */}
              </FormControl>
              {isEditMode && <FormDescription>Email cannot be changed after creation.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional rendering for password fields */}
        {/* For create mode OR if explicitly wanting to show password fields in edit (e.g. via a button) */}
        {/* For this version, always show in create, hide in edit unless a "change password" state is true */}
        {!isEditMode && (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
         {isEditMode && (
            <FormDescription>
                To change password for an existing user, a separate "Change Password" form or feature should be used.
                Password fields are not shown here for editing user details.
            </FormDescription>
         )}

        <FormField
          control={form.control}
          name="role_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : null)}
                // Ensure defaultValue is a string if field.value is number
                defaultValue={field.value?.toString()}
                value={field.value?.toString()} // Controlled component needs value prop too
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableRoles.map(role => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                  {availableRoles.length === 0 && <SelectItem value="" disabled>No roles available</SelectItem>}
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
                <FormDescription>
                  Inactive users cannot log in.
                </FormDescription>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (isEditMode ? 'Saving Changes...' : 'Creating User...') : (isEditMode ? 'Save Changes' : 'Create User')}
        </Button>
      </form>
    </Form>
  );
};

export default UserForm;