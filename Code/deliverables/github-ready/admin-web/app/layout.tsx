import type { Metadata } from "next";
import { siteUrl } from "./server/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Quản trị | Trà Sữa Ngon",
  description: "Khu vực quản trị đơn hàng Trà Sữa Ngon.",
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#073f30" />
      </head>
      <body>{children}</body>
    </html>
  );
}
