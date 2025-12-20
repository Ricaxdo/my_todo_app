import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <RedirectIfAuth>
      <SignupForm />
    </RedirectIfAuth>
  );
}
