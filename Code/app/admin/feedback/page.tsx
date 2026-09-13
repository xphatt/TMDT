import { AdminFeedback } from "../components/AdminFeedback";
import { AdminShell } from "../components/AdminShell";
import { requireAdminPage } from "../../server/auth/admin-request";

export default async function AdminFeedbackPage() {
  const principal = await requireAdminPage("/admin/feedback");
  return <AdminShell active="feedback" principal={principal}><AdminFeedback role={principal.role} /></AdminShell>;
}
