import { requireAdminPage } from "../../server/auth/admin-request";
import { AdminOrders } from "../components/AdminOrders";
import { AdminShell } from "../components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const principal = await requireAdminPage("/admin/orders");
  return <AdminShell active="orders" principal={principal}><AdminOrders /></AdminShell>;
}
