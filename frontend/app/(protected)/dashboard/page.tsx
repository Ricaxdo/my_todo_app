import { RequireAuth } from "@/components/auth/RequireAuth";
import TodoDashboard from "@/components/todo-dashboard/TodoDashboard"; // ajusta ruta real

export default function DashboardPage() {
  return (
    <RequireAuth>
      <TodoDashboard />
    </RequireAuth>
  );
}
