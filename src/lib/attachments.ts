import "server-only";
import { db, attachments } from "@/lib/db";
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_BYTES } from "@/lib/validation";

type SaveResult = { ok: true; id: string | null } | { ok: false; error: string };

/** Validates and stores an optional uploaded file from a form. Returns its id (or null if none). */
export async function saveAttachment(file: FormDataEntryValue | null, userId: string): Promise<SaveResult> {
  if (!(file instanceof File) || file.size === 0) return { ok: true, id: null };
  if (file.size > MAX_ATTACHMENT_BYTES) return { ok: false, error: "File must be 4 MB or smaller." };
  if (!ALLOWED_ATTACHMENT_TYPES[file.type])
    return { ok: false, error: "Allowed: images (PNG, JPG, WebP, GIF), PDF, TXT, DOCX, PPTX, ZIP." };

  const data = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120) || "file";
  const [row] = await db
    .insert(attachments)
    .values({ uploadedBy: userId, fileName, mimeType: file.type, sizeBytes: file.size, data })
    .returning({ id: attachments.id });
  return { ok: true, id: row.id };
}
