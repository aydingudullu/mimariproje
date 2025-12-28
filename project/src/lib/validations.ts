/**
 * Mimariproje.com - Form Validation Schemas
 * Zod ile form validation şemaları
 */

import { z } from "zod";

// Common validation patterns
const emailSchema = z
  .string()
  .email("Geçerli bir e-posta adresi giriniz")
  .min(1, "E-posta adresi gereklidir");

const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
  );

const phoneSchema = z
  .string()
  .regex(
    /^(\+90|0)?[5][0-9]{9}$/,
    "Geçerli bir Türkiye telefon numarası giriniz (örn: 05xxxxxxxxx)"
  )
  .optional()
  .or(z.literal(""));

const priceSchema = z
  .number()
  .positive("Fiyat pozitif bir sayı olmalıdır")
  .min(1, "Minimum fiyat 1 TL olmalıdır");

// Authentication Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Şifre gereklidir"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
    user_type: z.enum(["individual", "company"], {
      required_error: "Kullanıcı tipi seçiniz",
    }),
    first_name: z
      .string()
      .min(2, "Ad en az 2 karakter olmalıdır")
      .optional()
      .or(z.literal("")),
    last_name: z
      .string()
      .min(2, "Soyad en az 2 karakter olmalıdır")
      .optional()
      .or(z.literal("")),
    company_name: z
      .string()
      .min(2, "Şirket adı en az 2 karakter olmalıdır")
      .optional()
      .or(z.literal("")),
    profession: z.string().optional().or(z.literal("")),
    phone: phoneSchema,
    location: z.string().optional().or(z.literal("")),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: "Kullanım şartlarını kabul etmelisiniz",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.user_type === "individual") {
        return data.first_name && data.first_name.length >= 2;
      }
      return true;
    },
    {
      message: "Bireysel hesap için ad gereklidir",
      path: ["first_name"],
    }
  )
  .refine(
    (data) => {
      if (data.user_type === "individual") {
        return data.last_name && data.last_name.length >= 2;
      }
      return true;
    },
    {
      message: "Bireysel hesap için soyad gereklidir",
      path: ["last_name"],
    }
  )
  .refine(
    (data) => {
      if (data.user_type === "company") {
        return data.company_name && data.company_name.length >= 2;
      }
      return true;
    },
    {
      message: "Kurumsal hesap için şirket adı gereklidir",
      path: ["company_name"],
    }
  );

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token gereklidir"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// Project Schemas
export const projectSchema = z.object({
  title: z
    .string()
    .min(5, "Başlık en az 5 karakter olmalıdır")
    .max(100, "Başlık en fazla 100 karakter olabilir"),
  description: z
    .string()
    .min(20, "Açıklama en az 20 karakter olmalıdır")
    .max(2000, "Açıklama en fazla 2000 karakter olabilir"),
  category: z.string().min(1, "Kategori seçiniz"),
  price: priceSchema,
  location: z.string().optional().or(z.literal("")),
  area: z
    .string()
    .regex(/^\d+$/, "Alan sadece sayı olabilir")
    .optional()
    .or(z.literal("")),
  style: z.string().optional().or(z.literal("")),
});

// Job Schemas
export const jobSchema = z
  .object({
    title: z
      .string()
      .min(5, "Başlık en az 5 karakter olmalıdır")
      .max(100, "Başlık en fazla 100 karakter olabilir"),
    description: z
      .string()
      .min(20, "Açıklama en az 20 karakter olmalıdır")
      .max(2000, "Açıklama en fazla 2000 karakter olabilir"),
    category: z.string().min(1, "Kategori seçiniz"),
    budget_min: priceSchema,
    budget_max: priceSchema,
    location: z.string().optional().or(z.literal("")),
    deadline: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.budget_max >= data.budget_min, {
    message: "Maksimum bütçe minimum bütçeden küçük olamaz",
    path: ["budget_max"],
  });

export const jobApplicationSchema = z.object({
  cover_letter: z
    .string()
    .min(50, "Kapak mektubu en az 50 karakter olmalıdır")
    .max(1000, "Kapak mektubu en fazla 1000 karakter olabilir"),
  proposed_price: priceSchema,
  estimated_duration: z.string().min(1, "Tahmini süre gereklidir"),
});

// Message Schemas
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "Mesaj içeriği gereklidir")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
  message_type: z.enum(["text", "image", "file"]).default("text"),
  file_url: z.string().optional(),
});

// Profile Schemas
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  company_name: z
    .string()
    .min(2, "Şirket adı en az 2 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  phone: phoneSchema,
  location: z.string().optional().or(z.literal("")),
  bio: z
    .string()
    .max(500, "Biyografi en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Mevcut şifre gereklidir"),
    new_password: passwordSchema,
    confirm_password: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Yeni şifreler eşleşmiyor",
    path: ["confirm_password"],
  });

// Contact Schemas
export const contactSchema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  email: emailSchema,
  subject: z
    .string()
    .min(5, "Konu en az 5 karakter olmalıdır")
    .max(100, "Konu en fazla 100 karakter olabilir"),
  message: z
    .string()
    .min(20, "Mesaj en az 20 karakter olmalıdır")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
});

// Search Schemas
export const searchSchema = z.object({
  query: z.string().min(1, "Arama terimi gereklidir"),
  category: z.string().optional(),
  location: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
});

// File Upload Schemas
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Dosya boyutu 5MB'dan küçük olmalıdır"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Sadece JPG, PNG ve WebP formatları desteklenir"
    ),
});

export const multipleFileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "En az bir dosya seçmelisiniz")
    .max(10, "En fazla 10 dosya yükleyebilirsiniz")
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      "Her dosya 5MB'dan küçük olmalıdır"
    )
    .refine(
      (files) =>
        files.every((file) =>
          ["image/jpeg", "image/png", "image/webp"].includes(file.type)
        ),
      "Sadece JPG, PNG ve WebP formatları desteklenir"
    ),
});

// Type exports for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type JobFormData = z.infer<typeof jobSchema>;
export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type FileUploadFormData = z.infer<typeof fileUploadSchema>;
export type MultipleFileUploadFormData = z.infer<
  typeof multipleFileUploadSchema
>;

// Utility functions
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: "Validation failed" } };
  }
};

// Form field error helper
export const getFieldError = (
  errors: Record<string, string> | undefined,
  fieldName: string
): string | undefined => {
  return errors?.[fieldName];
};

// Category options
export const PROJECT_CATEGORIES = [
  { value: "residential", label: "Konut Projeleri" },
  { value: "commercial", label: "Ticari Projeler" },
  { value: "industrial", label: "Endüstriyel Projeler" },
  { value: "landscape", label: "Peyzaj Projeleri" },
  { value: "interior", label: "İç Mimarlık" },
  { value: "renovation", label: "Renovasyon" },
  { value: "urban_planning", label: "Kentsel Planlama" },
  { value: "other", label: "Diğer" },
];

export const JOB_CATEGORIES = [
  { value: "architectural_design", label: "Mimari Tasarım" },
  { value: "interior_design", label: "İç Mimarlık" },
  { value: "landscape_design", label: "Peyzaj Tasarımı" },
  { value: "structural_engineering", label: "Yapı Mühendisliği" },
  { value: "project_management", label: "Proje Yönetimi" },
  { value: "3d_modeling", label: "3D Modelleme" },
  { value: "technical_drawing", label: "Teknik Çizim" },
  { value: "consultation", label: "Danışmanlık" },
  { value: "other", label: "Diğer" },
];

export const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Şanlıurfa",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
  "Diyarbakır",
  "Hatay",
  "Manisa",
  "Kayseri",
  "Samsun",
  "Balıkesir",
  "Kahramanmaraş",
  "Van",
  "Aydın",
  "Denizli",
  "Sakarya",
  "Muğla",
  "Tekirdağ",
  "Trabzon",
  "Elazığ",
  "Erzurum",
  "Malatya",
  "Afyonkarahisar",
  "Tokat",
];

export const PROFESSIONS = [
  "Mimar",
  "İç Mimar",
  "Peyzaj Mimarı",
  "Şehir Plancısı",
  "İnşaat Mühendisi",
  "Yapı Mühendisi",
  "Proje Yöneticisi",
  "3D Modelleme Uzmanı",
  "Teknik Ressam",
  "Mimarlık Öğrencisi",
  "Diğer",
];
