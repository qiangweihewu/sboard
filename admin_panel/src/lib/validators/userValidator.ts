// src/lib/validators/userValidator.ts
import * as z from 'zod';

export const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }).optional().or(z.literal('')), // Optional for edit, required for create
  password_confirmation: z.string().optional().or(z.literal('')),
  role_id: z.coerce.number().positive({ message: "Role is required." }).optional().nullable(), // Coerce to number, optional for some cases or if default is handled
  is_active: z.boolean().default(true).optional(),
}).refine(data => {
   // If password is provided, password_confirmation must match.
   // This refine is only effective if both fields are part of the same form submission step.
   if (data.password && data.password_confirmation) {
       return data.password === data.password_confirmation;
   }
   // If password is provided but not confirmation (or vice versa in a more complex form),
   // that might be caught by making `password_confirmation` required when `password` is present.
   // For this schema, if only one is provided, this refine passes.
   // The current zod schema makes both optional.
   // If password is set, and confirmation is empty string, it's fine by this refine.
   // This refine is primarily for *mismatch*, not for presence.
   if (data.password && !data.password_confirmation && data.password.length > 0) {
    // This case might imply password_confirmation should be required.
    // However, the schema makes it optional. Refine won't make it required.
    // This logic is better handled by making fields conditionally required in the object definition or form logic.
    return true; // Let it pass, requiredness is separate.
   }
   return true;
}, {
   message: "Passwords do not match.",
   path: ["password_confirmation"], // Error attached to password_confirmation field
});

export type UserFormValues = z.infer<typeof userFormSchema>;
