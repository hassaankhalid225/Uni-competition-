import { z } from "zod";

// Empty form fields arrive as "" — treat them as "not provided".
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional()
  .transform((v) => v ?? null)
  .refine((v) => v === null || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with http:// or https://");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.email("Enter a valid email").trim().toLowerCase().max(120),
  password: z.string().min(8, "At least 8 characters").max(100),
});

export const emailSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });

export const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

export const clubRequestSchema = z.object({
  name: z.string().trim().min(3, "At least 3 characters").max(60),
  description: z.string().trim().min(10, "Describe the club in a sentence or two").max(300),
  reason: z.string().trim().min(10, "Tell admins why this club should exist").max(500),
});

export const reviewRequestSchema = z.object({
  requestId: z.uuid(),
  decision: z.enum(["approved", "rejected"]),
  note: optionalText(300),
});

export const postSchema = z
  .object({
    clubId: z.uuid(),
    title: z.string().trim().min(3, "At least 3 characters").max(150),
    body: optionalText(10_000),
    linkUrl: optionalUrl,
  });

export const commentSchema = z.object({
  postId: z.uuid(),
  parentId: z.uuid().nullable().optional().transform((v) => v ?? null),
  body: z.string().trim().min(1, "Write something first").max(5_000),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(150),
  body: z.string().trim().min(3, "Write the announcement").max(10_000),
  linkUrl: optionalUrl,
});

export const eventSchema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(120),
  description: z.string().trim().min(3, "Add a short description").max(2_000),
  venue: z.string().trim().min(2, "Where is it happening?").max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
});

export const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "text/plain": "txt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/zip": "zip",
};
