"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Vinext client navigation is more stable with native anchors. */

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { AdminPrincipal } from "../../server/auth/admin-auth";
import { adminFetch } from "../admin-client";

const DESIGN_CONTRACT = "ADMIN-OPERATE-20260830 | THESIS: Một sổ điều phối quầy trà cho thấy việc cần làm trước số liệu trang trí. OWN-WORLD: Giấy lạnh, jade đậm, đường kẻ sổ và cam chỉ dành cho quyết định. STORY: Quản trị viên đọc nhịp đơn, mở đúng đơn và cập nhật có kiểm soát. FIRST VIEWPORT: Thanh điều hướng hẹp, tiêu đề thao tác, dữ liệu thật và hành động chính trong tầm nhìn. FORM: Nhật ký vận hành theo ca. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md";

export function AdminShell({
  active,
  principal,
  children,
}: {
  active: "dashboard" | "orders";
  principal: AdminPrincipal;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function toggleMenu() {
    setMenuOpen((current) => {
      const next = !current;
      if (next) {
        window.setTimeout(() => sidebarRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 0);
      }
      return next;
    });
  }

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await adminFetch<{ ok: boolean }>("/api/admin/auth/logout", { method: "POST" });
      window.location.assign("/admin/login");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="admin-shell" data-design-contract={DESIGN_CONTRACT}>
      <a className="admin-skip-link" href="#admin-main">Bỏ qua điều hướng</a>
      <aside ref={sidebarRef} className={`admin-sidebar ${menuOpen ? "is-open" : ""}`} id="admin-navigation" aria-label="Điều hướng quản trị">
        <div className="admin-brand">
          <span aria-hidden="true">TSN</span>
          <div><strong>Trà Sữa Ngon</strong><small>Quản trị vận hành</small></div>
        </div>
        <nav>
          <a className={active === "dashboard" ? "is-active" : ""} href="/admin" aria-current={active === "dashboard" ? "page" : undefined}>
            Tổng quan
          </a>
          <a className={active === "orders" ? "is-active" : ""} href="/admin/orders" aria-current={active === "orders" ? "page" : undefined}>
            Đơn hàng
          </a>
          <a href="/" target="_blank" rel="noreferrer">Mở cửa hàng</a>
        </nav>
        <div className="admin-account">
          <div><strong>{principal.displayName}</strong><small>{principal.role === "admin" ? "Quản trị viên" : "Nhân viên vận hành"}</small></div>
          <button type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}</button>
        </div>
      </aside>
      <div className="admin-mobile-bar">
        <a href="/admin" className="admin-mobile-brand">TSN Admin</a>
        <button ref={menuButtonRef} type="button" aria-expanded={menuOpen} aria-controls="admin-navigation" onClick={toggleMenu}>
          {menuOpen ? "Đóng menu" : "Mở menu"}
        </button>
      </div>
      <main id="admin-main" className="admin-main">{children}</main>
      {menuOpen && <button className="admin-menu-scrim" type="button" aria-label="Đóng menu" onClick={closeMenu} />}
    </div>
  );
}
