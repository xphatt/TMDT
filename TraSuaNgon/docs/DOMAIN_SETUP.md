# Cấu hình hostname `workers.dev`

Project không dùng custom domain ở checkpoint hiện tại. Canonical, Open Graph, social card, `robots.txt` và `sitemap.xml` đều lấy origin từ `app/server/site-config.ts`.

## Chạy local

Tạo `.env.local` từ `.env.example`:

```dotenv
GEOAPIFY_API_KEY=
SITE_URL=http://localhost:3000
```

Sau đó:

```bash
npm ci
npm run db:migrate:local
npm run dev
```

Không commit `.env.local`. `.gitignore` loại trừ `.env*`, ngoại trừ `.env.example`.

## Cấu hình production — cần xác nhận

Sau khi có hostname Worker thật, đặt:

```dotenv
SITE_URL=https://<worker-name>.<account-subdomain>.workers.dev
```

`GEOAPIFY_API_KEY` phải được lưu bằng Cloudflare secret, không đặt trong source, frontend bundle, tài liệu hoặc log. D1 production phải là database riêng và được bind với tên `DB`.

## Checklist sau khi deploy được duyệt

- Hostname `workers.dev` trả HTTPS hợp lệ.
- HTML trang chủ và admin login không chứa origin localhost trong metadata production.
- `/robots.txt` trỏ đến sitemap cùng hostname.
- `/sitemap.xml` chỉ chứa URL production.
- `/images/og.png` tải được và metadata social đúng.
- `/api/address-suggestions` hoạt động với secret server-side, kể cả trạng thái thiếu/sai key.
- D1 production đã chạy đúng migration và không dùng dữ liệu local.
- Không có localhost, API key, password hoặc token trong frontend bundle/Git.

Xem thêm [`PRODUCTION_DOMAIN_MIGRATION.md`](PRODUCTION_DOMAIN_MIGRATION.md) cho trình tự phát hành.
