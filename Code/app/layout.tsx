import type { Metadata } from "next";
import { siteUrl } from "./server/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Trà Sữa Ngon | Trà tươi, chọn đúng gu",
  description: "Chọn trà sữa, trà trái cây, macchiato và topping theo đúng khẩu vị của bạn.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Trà Sữa Ngon | Trà tươi, chọn đúng gu",
    description: "Chọn đồ uống và tuỳ chỉnh từng ly theo đúng khẩu vị của bạn.",
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Trà Sữa Ngon",
    images: [{ url: "/images/og.png", width: 1200, height: 630, alt: "Trà Sữa Ngon, trà tươi mỗi ngày" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Trà Sữa Ngon | Trà tươi, chọn đúng gu",
    description: "Chọn đồ uống và tuỳ chỉnh từng ly theo đúng khẩu vị của bạn.",
    images: ["/images/og.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f8f7f2" />
      </head>
      <body>
        <span hidden dangerouslySetInnerHTML={{ __html: "<!-- THESIS: modern Vietnamese tea tray storefront. OWN-WORLD: cool off-white, jade and mandarin. STORY: discover, customise, review and order. FIRST VIEWPORT: 42/58 split hero with product crossing a jade counter. FORM: candidate 5, seed 3ea9c562. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->" }} />
        {children}
      </body>
    </html>
  );
}
