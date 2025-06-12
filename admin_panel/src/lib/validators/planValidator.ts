// src/lib/validators/planValidator.ts
import * as z from 'zod';

export const planFormSchema = z.object({
  name: z.string().min(1, { message: "Plan name is required." }).max(255),
  description: z.string().max(1000, { message: "Description must not exceed 1000 characters." }).optional().or(z.literal('')),
  duration_days: z.coerce.number().int().positive({ message: "Duration must be a positive number of days." }),
  traffic_limit_gb: z.coerce.number().positive({ message: "Traffic limit must be a positive number." }),
  device_limit: z.coerce.number().int().nonnegative({ message: "Device limit must be zero or a positive number." }),
  price: z.coerce.number().nonnegative({ message: "Price must be zero or a positive number." }).optional().nullable(),
  node_selection_criteria: z.string().min(1, {message: "Node selection criteria (JSON) is required."})
    .refine((data) => {
      try {
        JSON.parse(data);
        return true;
      } catch (e) {
        return false;
      }
    }, { message: "Node selection criteria must be valid JSON." }),
  target_user_group_id: z.coerce.number().positive({ message: "Target user group must be a positive number."}).optional().nullable(),
  is_active: z.boolean().default(true).optional(),
});

export interface PlanFormValues extends z.infer<typeof planFormSchema> {}