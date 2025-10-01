import { z } from "zod";

// Schema cho tạo course mới
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề khóa học không được để trống.")
    .min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề khóa học không được quá 255 ký tự."),
  
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự.")
    .optional(),
  
  teacherId: z
    .number()
    .int("ID giáo viên phải là số nguyên.")
    .positive("ID giáo viên phải là số dương.")
    .optional(),
  
  price: z
    .number()
    .min(0, "Giá khóa học phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá khóa học không được quá 999,999,999.99.")
    .optional(),
  
  discount: z
    .number()
    .min(0, "Giá giảm giá phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá giảm giá không được quá 999,999,999.99.")
    .optional(),
  
  isFree: z
    .boolean()
    .optional()
    .default(false),
  
  purpose: z
    .string()
    .max(255, "Mục đích khóa học không được quá 255 ký tự.")
    .optional(),
  
  group: z
    .string()
    .max(255, "Nhóm/danh mục khóa học không được quá 255 ký tự.")
    .regex(/^[a-zA-Z0-9\sÀ-ỹ\-_.,()&]*$/u, "Nhóm khóa học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự đặc biệt thông thường.")
    .optional(),
  
  content: z
    .string()
    .max(10000, "Nội dung khóa học không được quá 10,000 ký tự.")
    .optional(),
  
  thumbnail: z
    .string()
    .max(255, "Đường dẫn thumbnail không được quá 255 ký tự.")
    .optional(),
  
  introVideo: z
    .string()
    .max(255, "Đường dẫn video giới thiệu không được quá 255 ký tự.")
    .optional(),
}).refine(
  (data) => {
    // Nếu khóa học miễn phí thì không được có giá
    if (data.isFree && data.price && data.price > 0) {
      return false;
    }
    return true;
  },
  {
    message: "Khóa học miễn phí không được có giá.",
    path: ["price"],
  }
).refine(
  (data) => {
    // Giá giảm giá phải nhỏ hơn giá gốc
    if (data.discount && data.price && data.discount >= data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Giá giảm giá phải nhỏ hơn giá gốc.",
    path: ["discount"],
  }
);

// Schema cho cập nhật course (tất cả fields đều optional)
export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề khóa học không được quá 255 ký tự.")
    .optional(),
  
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự.")
    .optional(),
  
  teacherId: z
    .number()
    .int("ID giáo viên phải là số nguyên.")
    .positive("ID giáo viên phải là số dương.")
    .optional(),
  
  price: z
    .number()
    .min(0, "Giá khóa học phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá khóa học không được quá 999,999,999.99.")
    .optional(),
  
  discount: z
    .number()
    .min(0, "Giá giảm giá phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá giảm giá không được quá 999,999,999.99.")
    .optional(),
  
  isFree: z
    .boolean()
    .optional(),
  
  purpose: z
    .string()
    .max(255, "Mục đích khóa học không được quá 255 ký tự.")
    .optional(),
  
  group: z
    .string()
    .max(255, "Nhóm/danh mục khóa học không được quá 255 ký tự.")
    .regex(/^[a-zA-Z0-9\sÀ-ỹ\-_.,()&]*$/u, "Nhóm khóa học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự đặc biệt thông thường.")
    .optional(),
  
  content: z
    .string()
    .max(10000, "Nội dung khóa học không được quá 10,000 ký tự.")
    .optional(),
  
  thumbnail: z
    .string()
    .max(255, "Đường dẫn thumbnail không được quá 255 ký tự.")
    .optional(),
  
  introVideo: z
    .string()
    .max(255, "Đường dẫn video giới thiệu không được quá 255 ký tự.")
    .optional(),
}).refine(
  (data) => {
    // Nếu khóa học miễn phí thì không được có giá
    if (data.isFree && data.price && data.price > 0) {
      return false;
    }
    return true;
  },
  {
    message: "Khóa học miễn phí không được có giá.",
    path: ["price"],
  }
).refine(
  (data) => {
    // Giá giảm giá phải nhỏ hơn giá gốc
    if (data.discount && data.price && data.discount >= data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Giá giảm giá phải nhỏ hơn giá gốc.",
    path: ["discount"],
  }
);

// Schema cho inline editing (single field update)
export const updateCourseFieldSchema = z.object({
  title: z
    .string()
    .min(3, "Tiêu đề khóa học phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề khóa học không được quá 255 ký tự.")
    .optional(),
  
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự.")
    .optional(),
  
  purpose: z
    .string()
    .max(255, "Mục đích khóa học không được quá 255 ký tự.")
    .optional(),
  
  content: z
    .string()
    .max(10000, "Nội dung khóa học không được quá 10,000 ký tự.")
    .optional(),
  
  group: z
    .string()
    .max(255, "Nhóm/danh mục khóa học không được quá 255 ký tự.")
    .regex(/^[a-zA-Z0-9\sÀ-ỹ\-_.,()&]*$/u, "Nhóm khóa học chỉ được chứa chữ cái, số, khoảng trắng và các ký tự đặc biệt thông thường.")
    .optional(),
  
  price: z
    .number()
    .min(0, "Giá khóa học phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá khóa học không được quá 999,999,999.99.")
    .optional(),
  
  discount: z
    .number()
    .min(0, "Giá giảm giá phải lớn hơn hoặc bằng 0.")
    .max(999999999.99, "Giá giảm giá không được quá 999,999,999.99.")
    .optional(),
  
  thumbnail: z
    .string()
    .max(255, "Đường dẫn thumbnail không được quá 255 ký tự.")
    .optional(),
  
  introVideo: z
    .string()
    .max(255, "Đường dẫn video giới thiệu không được quá 255 ký tự.")
    .optional(),
});

// Schema cho course outline
export const createCourseOutlineSchema = z.object({
  title: z
    .string()
    .min(1, "Tiêu đề outline không được để trống.")
    .min(3, "Tiêu đề outline phải có ít nhất 3 ký tự.")
    .max(255, "Tiêu đề outline không được quá 255 ký tự."),
});

export const updateCourseOutlineSchema = createCourseOutlineSchema.partial();

// Helper function để validate single field
export const validateCourseField = (fieldName: keyof UpdateCourseFieldData, value: unknown) => {
  const fieldSchema = updateCourseFieldSchema.pick({ [fieldName]: true } as Record<keyof UpdateCourseFieldData, true>);
  return fieldSchema.safeParse({ [fieldName]: value });
};

// Type exports
export type CreateCourseData = z.infer<typeof createCourseSchema>;
export type UpdateCourseData = z.infer<typeof updateCourseSchema>;
export type UpdateCourseFieldData = z.infer<typeof updateCourseFieldSchema>;
export type CreateCourseOutlineData = z.infer<typeof createCourseOutlineSchema>;
export type UpdateCourseOutlineData = z.infer<typeof updateCourseOutlineSchema>;