import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  thumbnail: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  vip: z.boolean().default(false),
  livestreamId: z.number().optional(),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  thumbnail: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  vip: z.boolean().optional(),
  livestreamId: z.number().optional(),
});

export type CreateDocumentData = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentData = z.infer<typeof updateDocumentSchema>;