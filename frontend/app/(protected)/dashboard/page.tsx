import { RequireAuth } from "@/components/auth/RequireAuth";
import TodoDashboard from "@/components/todos/TodoDashboard"; // ajusta ruta real

export default function DashboardPage() {
  return (
    <RequireAuth>
      <TodoDashboard />
    </RequireAuth>
  );
}
