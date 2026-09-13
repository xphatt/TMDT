import { AdminReviews } from "../components/AdminReviews";
import { AdminShell } from "../components/AdminShell";
import { requireAdminPage } from "../../server/auth/admin-request";

export default async function AdminReviewsPage() {
  const principal = await requireAdminPage("/admin/reviews");
  return <AdminShell active="reviews" principal={principal}><AdminReviews role={principal.role} /></AdminShell>;
}
