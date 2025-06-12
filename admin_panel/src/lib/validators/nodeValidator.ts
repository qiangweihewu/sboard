// src/lib/validators/nodeValidator.ts
import * as z from 'zod';

export const addNodeFormSchema = z.object({
  config_url: z.string().min(1, { message: "Configuration URL/string is required." })
    .refine(val => val.startsWith('vless://') || val.startsWith('vmess://') || val.startsWith('ss://') || val.startsWith('trojan://'), {
        message: "Must be a valid VLESS, VMess, Shadowsocks, or Trojan URI."
    }),
  name: z.string().max(255).optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')), // Comma-separated string
  is_active: z.boolean().default(true).optional(),
});
export type AddNodeFormValues = z.infer<typeof addNodeFormSchema>;

export const editNodeFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }).max(255),
  tags: z.string().optional().or(z.literal('')), // Comma-separated string
  is_active: z.boolean().default(true).optional(),
});
export type EditNodeFormValues = z.infer<typeof editNodeFormSchema>;