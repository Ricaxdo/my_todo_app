import LoginForm from "@/components/LoginForm";
import { RedirectIfAuth } from "@/components/RedirectIfAuth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Focus",
  description: "Sign in to access your tasks.",
};

export default function LoginPage() {
  return (
    <RedirectIfAuth>
      <LoginForm />
    </RedirectIfAuth>
  );
}
