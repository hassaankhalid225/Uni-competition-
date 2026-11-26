import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mb-8 mt-2 text-sm text-ink-muted">
        New here?{" "}
        <Link href="/register" className="font-medium text-accent underline-offset-2 hover:underline">
          Create a student account
        </Link>
      </p>
      <LoginForm />
    </>
  );
}
