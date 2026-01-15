import { Suspense } from "react";

import { RequireAuth } from "@/components/auth/RequireAuth";
import TodoDashboard from "@/components/todo-dashboard/TodoDashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <RequireAuth>
        <TodoDashboard />
      </RequireAuth>
    </Suspense>
  );
}
