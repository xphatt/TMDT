import { requireAdminPage } from "../../../server/auth/admin-request";
import { AdminOrderDetail } from "../../components/AdminOrderDetail";
import { AdminShell } from "../../components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await requireAdminPage(`/admin/orders/${encodeURIComponent(id)}`);
  return <AdminShell active="orders" principal={principal}><AdminOrderDetail orderId={id} role={principal.role} /></AdminShell>;
}
