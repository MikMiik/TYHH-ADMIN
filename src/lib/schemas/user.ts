import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ tên.")
    .min(2, "Họ tên phải có ít nhất 2 ký tự.")
    .max(100, "Họ tên không được quá 100 ký tự."),

  username: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên đăng nhập.")
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
    .max(50, "Tên đăng nhập không được quá 50 ký tự.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới."
    ),

  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu.")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
    .max(128, "Mật khẩu không được quá 128 ký tự.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
    ),

  role: z
    .enum(["admin", "teacher", "user"])
    .refine((val) => ["admin", "teacher", "user"].includes(val), {
      message: "Vai trò không hợp lệ. Chỉ được chọn: admin, teacher, user.",
    }),
  
  roleIds: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất một vai trò.")
    .optional(),

  // Optional fields
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^0\d{9,10}$/.test(val),
      "Số điện thoại không hợp lệ."
    ),

  yearOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const year = parseInt(val);
      const currentYear = new Date().getFullYear();
      return !isNaN(year) && year >= 1900 && year <= currentYear;
    }, `Năm sinh phải là số từ 1900 đến ${new Date().getFullYear()}.`),

  city: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 100,
      "Tên thành phố không được quá 100 ký tự."
    ),

  school: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 200,
      "Tên trường học không được quá 200 ký tự."
    ),

  facebook: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      "Link Facebook không hợp lệ."
    ),
  avatar: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// Schema for form state (all fields as strings for form inputs)
export const createUserFormSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.enum(["admin", "teacher", "user"]),
  roleIds: z.array(z.number()).optional(),
  phone: z.string(),
  yearOfBirth: z.string(),
  city: z.string(),
  school: z.string(),
  facebook: z.string(),
  avatar: z.string(),
});

export type CreateUserForm = z.infer<typeof createUserFormSchema>;

// Edit User Schema - password is optional
export const editUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ tên.")
      .min(2, "Họ tên phải có ít nhất 2 ký tự.")
      .max(100, "Họ tên không được quá 100 ký tự."),

    username: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập tên đăng nhập.")
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự.")
      .max(50, "Tên đăng nhập không được quá 50 ký tự.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới."
      ),

    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email.")
      .email("Email không hợp lệ."),

    // Password is optional for edit
    password: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim() === "") return true; // Allow empty password (keep current)
        return val.length >= 8 && val.length <= 128;
      }, "Mật khẩu phải có ít nhất 8 ký tự và không quá 128 ký tự.")
      .refine((val) => {
        if (!val || val.trim() === "") return true; // Allow empty password
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(val);
      }, "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."),

    confirmPassword: z.string().optional(),

    role: z
      .enum(["admin", "teacher", "user"])
      .refine((val) => ["admin", "teacher", "user"].includes(val), {
        message: "Vai trò không hợp lệ. Chỉ được chọn: admin, teacher, user.",
      })
      .optional(),

    roleIds: z
      .array(z.number())
      .min(1, "Vui lòng chọn ít nhất một vai trò.")
      .optional(),

    activeKey: z.boolean(),

    // Optional fields
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^0\d{9,10}$/.test(val),
        "Số điện thoại không hợp lệ."
      ),

    yearOfBirth: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        return !isNaN(year) && year >= 1900 && year <= currentYear;
      }, `Năm sinh phải là số từ 1900 đến ${new Date().getFullYear()}.`),

    city: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length <= 100,
        "Tên thành phố không được quá 100 ký tự."
      ),

    school: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length <= 200,
        "Tên trường học không được quá 200 ký tự."
      ),

    facebook: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^https?:\/\//.test(val),
        "Link Facebook không hợp lệ."
      ),
    avatar: z.string().optional(),
  })
  .refine(
    (data) => {
      // If password is provided, confirmPassword must match
      if (data.password && data.password.trim() !== "") {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Mật khẩu xác nhận không khớp.",
      path: ["confirmPassword"],
    }
  );

export type EditUserFormData = z.infer<typeof editUserSchema>;

// Schema for form state (all fields as strings for form inputs)
export const editUserFormSchema = z.object({
  name: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  role: z.enum(["admin", "teacher", "user"]).optional(),
  roleIds: z.array(z.number()).optional(),
  activeKey: z.boolean(),
  phone: z.string(),
  yearOfBirth: z.string(),
  city: z.string(),
  school: z.string(),
  facebook: z.string(),
  avatar: z.string(),
});

export type EditUserForm = z.infer<typeof editUserFormSchema>;
