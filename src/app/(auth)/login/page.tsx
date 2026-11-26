import Link from "next/link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <>
      <AuthHeading eyebrow="Sign in" title="Welcome back.">
        New to Campus Connect?{" "}
        <Link href="/register" className="font-medium text-accent underline-offset-4 hover:underline">
          Create an account
        </Link>
      </AuthHeading>
      {error === "link" && (
        <p role="alert" className="mb-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          That link is invalid or has expired. Please try again.
        </p>
      )}
      <LoginForm />
    </>
  );
}
