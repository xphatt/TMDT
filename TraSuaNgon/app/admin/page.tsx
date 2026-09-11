import { requireAdminPage } from "../server/auth/admin-request";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminShell } from "./components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const principal = await requireAdminPage("/admin");
  return <AdminShell active="dashboard" principal={principal}><AdminDashboard /></AdminShell>;
}
