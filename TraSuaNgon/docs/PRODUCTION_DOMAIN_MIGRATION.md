# Chuẩn bị Cloudflare Workers production

Ngày cập nhật: 2026-08-30
Development: `http://localhost:3000`
Production dự kiến: `https://<worker-name>.<account-subdomain>.workers.dev`

## Stack và runtime

- React 19 + TypeScript trên Vinext/Vite.
- Frontend, storefront API và admin API dùng chung Worker entry tại `worker/index.ts`.
- Dữ liệu đơn hàng/admin dùng Cloudflare D1 qua binding `DB`.
- Lệnh local: `npm run dev`; build: `npm run build`; local runtime: `npm run start`.
- `wrangler.jsonc` là cấu hình Cloudflare Workers/D1 độc lập.
- File tương thích `.openai/hosting.json` và plugin Sites vẫn còn vì đây là starter hiện hữu; không có lệnh Sites/deploy nào được gọi. Việc gỡ dependency này cần phê duyệt riêng.

## Phân tách môi trường

| Môi trường | `SITE_URL` | D1 | Quy tắc |
| --- | --- | --- | --- |
| Development | `http://localhost:3000` hoặc bỏ trống | `DB --local` | Fallback localhost |
| Preview/Staging | URL `workers.dev` preview thật | D1 preview riêng | Inject rõ, không dùng dữ liệu production |
| Production | Hostname `workers.dev` thật | D1 production | Inject qua Worker variable; không fallback ngầm |

Ví dụ local trong `.env.local`:

```dotenv
SITE_URL=http://localhost:3000
GEOAPIFY_API_KEY=
```

Production cần cấu hình bằng Wrangler/Cloudflare dashboard sau khi được duyệt:

```dotenv
SITE_URL=https://<worker-name>.<account-subdomain>.workers.dev
GEOAPIFY_API_KEY=<secret-do-cloudflare-quan-ly>
```

Không commit `.env.local`, API key, password hoặc token.

## Trình tự production an toàn — chưa thực hiện

1. Xác nhận Cloudflare account, Worker name và hostname `workers.dev`.
2. Tạo D1 production riêng, cập nhật `database_id` thật trong cấu hình được quản lý.
3. Đặt `SITE_URL`; lưu `GEOAPIFY_API_KEY` bằng secret manager.
4. Chạy `npm run lint`, `npm run typecheck`, `npm test`.
5. Xem trước migration D1, backup dữ liệu nếu đã có, rồi mới migrate remote sau phê duyệt.
6. Deploy Worker bằng Wrangler sau phê duyệt riêng.
7. Kiểm tra HTTPS, canonical/OG, `robots.txt`, `sitemap.xml`, Geoapify và luồng đặt/admin trên hostname thật.

## Trạng thái

- Source local và build: sẵn sàng.
- Local D1 migration: đã kiểm tra.
- Preview/production Worker, D1 remote và secret: chưa tạo.
- Deploy: chưa thực hiện theo ràng buộc người dùng.
