import LoginForm from "@/components/LoginForm";
import { RedirectIfAuth } from "@/components/auth/RedirectIfAuth";

export default function HomePage() {
  return (
    <RedirectIfAuth>
      <LoginForm />
    </RedirectIfAuth>
  );
}
