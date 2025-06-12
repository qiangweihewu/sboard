// src/components/nodes/NodeForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  AddNodeFormValues, 
  EditNodeFormValues
} from '@/lib/validators/nodeValidator';
import { addNodeFormSchema, editNodeFormSchema } from '@/lib/validators/nodeValidator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // For config_url if it's long
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
import * as z from 'zod'; // Import z for schema inference in component

interface NodeFormProps {
  onSubmit: (values: AddNodeFormValues | EditNodeFormValues) => Promise<void>;
  initialData?: Partial<AddNodeFormValues | EditNodeFormValues>;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const NodeForm: React.FC<NodeFormProps> = ({
  onSubmit,
  initialData,
  isEditMode = false,
  isLoading = false
}) => {
  const currentSchema = isEditMode ? editNodeFormSchema : addNodeFormSchema;
  type CurrentFormValues = z.infer<typeof currentSchema>;

  const form = useForm<CurrentFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: initialData || (isEditMode
      ? { name: '', tags: '', is_active: true }
      : { config_url: '', name: '', tags: '', is_active: true }
    ) as CurrentFormValues, // Cast to CurrentFormValues
  });

  useEffect(() => {
    if (initialData) {
       const preparedInitialData = {
           ...initialData,
           tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
       };
      form.reset(preparedInitialData as CurrentFormValues); // Cast to CurrentFormValues
    } else {
      // Reset to default based on mode if initialData is not present (e.g. opening "add" form after "edit")
      form.reset((isEditMode
        ? { name: '', tags: '', is_active: true }
        : { config_url: '', name: '', tags: '', is_active: true }
      ) as CurrentFormValues); // Cast to CurrentFormValues
    }
  }, [initialData, form, isEditMode]);

  const handleSubmit = async (values: CurrentFormValues) => {
    const submissionValues = {
      ...values,
      // Ensure tags is an array of strings, even if input is empty string
      tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    };
    await onSubmit(submissionValues as AddNodeFormValues | EditNodeFormValues); // Cast for the onSubmit prop
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {!isEditMode && (
          <FormField
            control={form.control}
            name="config_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Node Configuration URL/String</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="vless://... or vmess://..."
                    className="resize-y min-h-[100px]"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Paste the full node configuration string (e.g., from V2RayN, Clash, etc.).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEditMode ? "Node Name" : "Node Name (Optional for Add)"}</FormLabel>
              <FormControl>
                <Input placeholder="E.g., My US Server, Japan Gaming Node" {...field} disabled={isLoading} />
              </FormControl>
              {!isEditMode && <FormDescription>
                If adding and left blank, name might be derived from config URL.
              </FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional, comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., VIP, streaming, gaming" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Separate multiple tags with commas.
              </FormDescription>
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
                  Inactive nodes will not be used.
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
          {isLoading ? (isEditMode ? 'Saving Changes...' : 'Adding Node...') : (isEditMode ? 'Save Changes' : 'Add Node')}
        </Button>
      </form>
    </Form>
  );
};

export default NodeForm;