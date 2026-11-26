import Link from "next/link";
import { AuthHeading } from "@/components/auth/auth-heading";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading eyebrow="Create account" title="Join your department.">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">
          Sign in
        </Link>
      </AuthHeading>
      <RegisterForm />
    </>
  );
}
