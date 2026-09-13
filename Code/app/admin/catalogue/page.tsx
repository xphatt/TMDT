import { AdminCatalogue } from "../components/AdminCatalogue";
import { AdminShell } from "../components/AdminShell";
import { requireAdminPage } from "../../server/auth/admin-request";

export default async function AdminCataloguePage() {
  const principal = await requireAdminPage("/admin/catalogue");
  return <AdminShell active="catalogue" principal={principal}><AdminCatalogue role={principal.role} /></AdminShell>;
}
