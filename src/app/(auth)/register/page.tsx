import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Join Campus Connect</h1>
      <p className="mb-8 mt-2 text-sm text-ink-muted">
        For CS Department students. Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
      <RegisterForm />
    </>
  );
}
