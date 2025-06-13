// src/lib/validators/userValidator.ts
import * as z from 'zod';

export const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  role_id: z.coerce.number().positive({ message: "Role is required." }).optional().nullable(),
  is_active: z.boolean().default(true).optional(),
  remark: z.string().max(255, { message: "Remark must be at most 255 characters." }).optional().or(z.literal('')),
  used_traffic: z.coerce.number().min(0, { message: "Used traffic cannot be negative." }).optional().nullable(),
  total_traffic: z.coerce.number().min(0, { message: "Total traffic cannot be negative." }).optional().nullable(),
  expire_at: z.string().datetime({ message: "Invalid date format." }).optional().or(z.literal('')),
  plan_id: z.coerce.number().positive({ message: "Plan is required." }).optional().nullable(),
  speed_limit: z.coerce.number().min(0, { message: "Speed limit cannot be negative." }).optional().nullable(),
  device_limit: z.coerce.number().min(0, { message: "Device limit cannot be negative." }).optional().nullable(),
}).refine(data => {
   if (data.password && data.password_confirmation) {
       return data.password === data.password_confirmation;
   }
   if (data.password && !data.password_confirmation && data.password.length > 0) {
    return true;
   }
   return true;
}, {
   message: "Passwords do not match.",
   path: ["password_confirmation"],
});

export interface UserFormValues extends z.infer<typeof userFormSchema> {}