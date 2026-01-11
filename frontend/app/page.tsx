import LoginForm from "@/components/auth/login/LoginForm";
import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";

export default function HomePage() {
  return (
    <RedirectIfAuth>
      <LoginForm />
    </RedirectIfAuth>
  );
}
