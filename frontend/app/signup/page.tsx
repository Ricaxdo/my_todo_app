import { RedirectIfAuth } from "@/components/RedirectIfAuth";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <RedirectIfAuth>
      <SignupForm />
    </RedirectIfAuth>
  );
}
