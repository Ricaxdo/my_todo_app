import { RequireAuth } from "@/components/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <div>Dashboard</div>
    </RequireAuth>
  );
}
