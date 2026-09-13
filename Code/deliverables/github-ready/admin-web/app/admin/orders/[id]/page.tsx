import { requireAdminPage } from "../../../server/auth/admin-request";
import { storefrontUrl } from "../../../server/site-config";
import { AdminOrderDetail } from "../../components/AdminOrderDetail";
import { AdminShell } from "../../components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const principal = await requireAdminPage(`/admin/orders/${encodeURIComponent(id)}`);
  return <AdminShell active="orders" principal={principal} storefrontUrl={storefrontUrl}><AdminOrderDetail orderId={id} role={principal.role} /></AdminShell>;
}
