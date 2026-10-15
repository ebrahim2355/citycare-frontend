import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} cannot be longer than ${max} characters`).optional().or(z.literal(""));

export const emailSchema = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address"));

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Add at least one letter")
  .regex(/[0-9]/, "Add at least one number");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Use 7 to 15 digits, for example +8801712345678")
  .optional()
  .or(z.literal(""));

export const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name cannot be longer than 80 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please type the password again"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match",
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please type the password again"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please type the password again"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords do not match",
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ["newPassword"],
    message: "The new password must be different from the current one",
  });

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  address: optionalText(200, "Address"),
  avatarUrl: z.url("Enter a full image link that starts with https://").optional().or(z.literal("")),
});

export const CONTACT_TOPICS = [
  { value: "GENERAL", label: "General question" },
  { value: "COMPLAINT_HELP", label: "Help with a complaint" },
  { value: "PAYMENT", label: "Payment or refund" },
  { value: "ACCOUNT", label: "My account" },
  { value: "FEEDBACK", label: "Feedback and ideas" },
] as const;

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  topic: z.enum(["GENERAL", "COMPLAINT_HELP", "PAYMENT", "ACCOUNT", "FEEDBACK"], "Choose a topic"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(120, "Subject cannot be longer than 120 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message cannot be longer than 2000 characters"),
});

export const TRACKING_CODE_PATTERN = /^CC-\d{6}-[A-Z0-9]{6}$/i;

export const trackSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Enter your tracking code")
    .regex(TRACKING_CODE_PATTERN, "A tracking code looks like CC-261017-AB12CD"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type ContactValues = z.infer<typeof contactSchema>;
export type TrackValues = z.infer<typeof trackSchema>;
