/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is more stable with native anchors. */
import { redirect } from "next/navigation";
import { getAdminPagePrincipal } from "../../server/auth/admin-request";
import { AdminLoginForm } from "../components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const principal = await getAdminPagePrincipal();
  if (principal) redirect("/admin");
  const { returnTo = "/admin" } = await searchParams;
  return (
    <main className="admin-login-page">
      <section className="admin-login-brand" aria-labelledby="admin-login-title">
        <a href="/" className="admin-login-wordmark">Trà Sữa Ngon</a>
        <div><h1 id="admin-login-title">Vào ca,<br />đọc đúng nhịp đơn.</h1><p>Khu vực riêng cho người vận hành. Mọi cập nhật trạng thái và xác nhận COD đều được ghi lại.</p></div>
        <small>Không dùng tài khoản khách hàng · Không lưu mật khẩu trên trình duyệt</small>
      </section>
      <section className="admin-login-panel" aria-label="Đăng nhập quản trị">
        <div><h2>Đăng nhập quản trị</h2><p>Dùng tài khoản được tạo qua quy trình vận hành an toàn.</p></div>
        <AdminLoginForm returnTo={returnTo} />
        <a className="admin-back-store" href="/">Quay lại cửa hàng</a>
      </section>
    </main>
  );
}
