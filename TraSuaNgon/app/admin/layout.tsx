import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: "Quản trị | Trà Sữa Ngon",
  description: "Khu vực quản trị đơn hàng Trà Sữa Ngon.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
