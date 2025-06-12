// src/lib/validators/userGroupValidator.ts
import * as z from 'zod';

export const userGroupFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).max(255, { message: "Name must not exceed 255 characters." }),
  description: z.string().max(1000, { message: "Description must not exceed 1000 characters." }).optional().or(z.literal('')),
});

export interface UserGroupFormValues extends z.infer<typeof userGroupFormSchema> {}