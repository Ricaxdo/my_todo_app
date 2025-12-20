import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div>Dashboard</div>
    </RequireAuth>
  );
}
