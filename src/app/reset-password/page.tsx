import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthHeading } from "@/components/auth/auth-heading";
import { ResetPasswordForm } from "./reset-form";

export const metadata = { title: "Set a new password" };

// Reached from the link in the password-reset email; /auth/callback has already signed the
// user in with a short-lived recovery session.
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  return (
    <AuthShell>
      <AuthHeading eyebrow="Reset password" title="Set a new password.">
        {user ? `For ${user.email}` : null}
      </AuthHeading>
      {user ? (
        <ResetPasswordForm />
      ) : (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          This reset link is invalid or has expired.{" "}
          <Link href="/forgot-password" className="font-medium underline">
            Request a new one
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
