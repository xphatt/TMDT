# Kiểm kê URL và cấu hình môi trường

Ngày cập nhật: 2026-08-30
Development: `http://localhost:3000`
Production dự kiến: `https://<worker-name>.<account-subdomain>.workers.dev`

Không dùng domain tùy chỉnh trong checkpoint hiện tại. Hostname production chính xác chỉ được điền sau khi nhóm xác nhận Cloudflare account và Worker name; project chưa tự deploy.

| File | Giá trị hiện tại | Mục đích | Có cần đổi không | Giá trị đề xuất |
| --- | --- | --- | --- | --- |
| `.env.example` | `SITE_URL=http://localhost:3000` | Origin local mẫu | Không | Giữ cho development |
| `app/server/site-config.ts` | Fallback `http://localhost:3000` | Nguồn canonical/OG/sitemap | Production: có | Inject hostname `workers.dev` thật qua `SITE_URL` |
| `app/layout.tsx` | URL tương đối qua `metadataBase` | Canonical, Open Graph, social card | Không hard-code | Tiếp tục dùng resolver tập trung |
| `app/robots.ts`, `app/sitemap.ts` | Dùng `SITE_URL` | SEO metadata routes | Không | Cùng origin với runtime |
| `app/server/address-suggestions.ts` | `https://api.geoapify.com/...` | API vendor phía server | Không | Giữ HTTPS; key chỉ ở server |
| `app/chatgpt-auth.ts` | `https://app.local` | Origin giả để kiểm tra return path của compatibility helper | Không | Không phải public origin; helper hiện không dùng cho admin nội bộ |
| `.wrangler/**` | Local runtime URL/log | Dữ liệu dev tool | Không | Luôn loại khỏi Git |

## Quy ước

- `SITE_URL` chỉ chấp nhận origin HTTP/HTTPS và bỏ path/trailing slash.
- Khi thiếu hoặc sai, resolver dùng localhost an toàn; production phải inject URL `workers.dev` rõ ràng để tránh xuất metadata localhost.
- Preview/staging dùng URL thật do Cloudflare cấp; không tạo URL giả định.
- `GEOAPIFY_API_KEY` không được public, log hoặc đưa vào frontend bundle.
- Không có cấu hình DNS/custom-domain trong phạm vi hiện tại.
