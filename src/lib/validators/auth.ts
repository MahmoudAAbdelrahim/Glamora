import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم طويل جدًا"),

  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صحيح")
    .max(150, "البريد الإلكتروني طويل جدًا"),

  phone: z
    .string()
    .trim()
    .min(10, "رقم الهاتف غير صحيح")
    .max(20, "رقم الهاتف غير صحيح"),

  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .max(100, "كلمة المرور طويلة جدًا"),

  address: z
    .object({
      governorate: z.string().trim().max(100).optional(),
      city: z.string().trim().max(100).optional(),
      area: z.string().trim().max(100).optional(),
      street: z.string().trim().max(150).optional(),
      building: z.string().trim().max(50).optional(),
      floor: z.string().trim().max(50).optional(),
      apartment: z.string().trim().max(50).optional(),
      postalCode: z.string().trim().max(20).optional(),
      notes: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صحيح"),

  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;