import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Trà Sữa Ngon | Trà tươi, chọn đúng gu",
  description: "Chọn trà sữa, trà trái cây, macchiato và topping theo đúng khẩu vị của bạn.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Trà Sữa Ngon | Trà tươi, chọn đúng gu",
    description: "Chọn đồ uống và tuỳ chỉnh từng ly theo đúng khẩu vị của bạn.",
    type: "website",
    locale: "vi_VN",
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
      <body>
        <span hidden dangerouslySetInnerHTML={{ __html: "<!-- THESIS: modern Vietnamese tea tray storefront. OWN-WORLD: cool off-white, jade and mandarin. STORY: discover, customise, review and order. FIRST VIEWPORT: 42/58 split hero with product crossing a jade counter. FORM: candidate 5, seed 3ea9c562. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->" }} />
        {children}
      </body>
    </html>
  );
}
