import { z } from "zod";

// Schema cho tạo livestream mới
export const createLivestreamSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề livestream không được để trống.")
    .min(3, "Tiêu đề livestream phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề livestream không được quá 255 ký tự."),
  
  courseId: z
    .number()
    .int("ID khóa học phải là số nguyên.")
    .positive("ID khóa học phải là số dương."),
  
  courseOutlineId: z
    .number()
    .int("ID outline khóa học phải là số nguyên.")
    .positive("ID outline khóa học phải là số dương."),
});

// Schema cho cập nhật livestream
export const updateLivestreamSchema = z.object({
  title: z
    .string()
    .min(3, "Tiêu đề livestream phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề livestream không được quá 255 ký tự.")
    .optional(),
  
  courseId: z
    .number()
    .int("ID khóa học phải là số nguyên.")
    .positive("ID khóa học phải là số dương.")
    .optional(),
  
  courseOutlineId: z
    .number()
    .int("ID outline khóa học phải là số nguyên.")
    .positive("ID outline khóa học phải là số dương.")
    .optional(),
});

// Type definitions từ schema
export type CreateLivestreamData = z.infer<typeof createLivestreamSchema>;
export type UpdateLivestreamData = z.infer<typeof updateLivestreamSchema>;

// Helper function để validate từng field riêng lẻ
export const validateLivestreamField = (
  fieldName: keyof CreateLivestreamData | keyof UpdateLivestreamData,
  value: unknown
) => {
  // Tạo schema cho từng field riêng lẻ
  const fieldSchemas = {
    title: z.string().min(3).max(255),
    courseId: z.number().int().positive(),
    courseOutlineId: z.number().int().positive(), 
    url: z.string().url().optional().or(z.literal("")),
  };

  const fieldSchema = fieldSchemas[fieldName as keyof typeof fieldSchemas];
  if (!fieldSchema) {
    return { success: false, error: { issues: [{ message: "Field không hợp lệ" }] } };
  }

  return fieldSchema.safeParse(value);
};

// Schema cho form search/filter
export const livestreamFilterSchema = z.object({
  search: z.string().optional(),
  courseId: z.number().int().positive().optional(),
  courseOutlineId: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export type LivestreamFilterData = z.infer<typeof livestreamFilterSchema>;