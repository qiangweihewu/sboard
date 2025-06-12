// src/components/user_groups/UserGroupForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userGroupFormSchema, type UserGroupFormValues } from '@/lib/validators/userGroupValidator'; // Adjust path if needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface UserGroupFormProps {
  onSubmit: (values: UserGroupFormValues) => Promise<void>;
  initialData?: Partial<UserGroupFormValues>;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const UserGroupForm: React.FC<UserGroupFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false
}) => {
  const form = useForm<UserGroupFormValues>({
    resolver: zodResolver(userGroupFormSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = async (values: UserGroupFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Premium Users, Testers" {...field} disabled={isLoading} />
              </FormControl>
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
              <FormControl>
                <Textarea
                  placeholder="A brief description of the user group."
                  className="resize-none" // Optional: disable resizing
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                This will help you remember the purpose of this group.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (isEditMode ? 'Saving Changes...' : 'Creating Group...') : (isEditMode ? 'Save Changes' : 'Create Group')}
        </Button>
      </form>
    </Form>
  );
};

export default UserGroupForm;