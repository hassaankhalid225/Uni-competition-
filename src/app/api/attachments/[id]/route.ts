import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, attachments } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";

// Streams an uploaded file from Postgres. Only signed-in users can download attachments.
export async function GET(_req: Request, ctx: RouteContext<"/api/attachments/[id]">) {
  if (!(await getCurrentUser())) return new Response("Unauthorized", { status: 401 });
  const id = z.uuid().safeParse((await ctx.params).id);
  if (!id.success) return new Response("Not found", { status: 404 });

  const [file] = await db.select().from(attachments).where(eq(attachments.id, id.data));
  if (!file) return new Response("Not found", { status: 404 });

  const inline = file.mimeType.startsWith("image/") || file.mimeType === "application/pdf";
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.sizeBytes),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(file.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
