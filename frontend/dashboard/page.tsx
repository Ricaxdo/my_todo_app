import { redirect } from "next/navigation";

export default function DashboardPage() {
  const isLoggedIn = false; // v0: luego vendrá de /users/me

  if (!isLoggedIn) redirect("/login");

  return <div className="p-6">Dashboard (v0)</div>;
}
