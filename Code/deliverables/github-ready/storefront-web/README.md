# Trà Sữa Ngon — Storefront

Website khách hàng của Trà Sữa Ngon, xây bằng React 19, TypeScript, Vinext/Vite và Cloudflare Workers/D1.

## Chức năng

- Duyệt, tìm kiếm, lọc và sắp xếp menu nội bộ.
- Tuỳ chỉnh size, đường, đá, topping và số lượng.
- Giỏ hàng lưu trên thiết bị bằng localStorage.
- Checkout có validation và gợi ý địa chỉ Việt Nam qua proxy Geoapify phía server.
- Tạo đơn `pending`, xác nhận COD hoặc QR mô phỏng; không thu tiền thật.

Khu vực quản trị và `/api/admin/*` đã được loại khỏi gói này.

## Chạy local

Yêu cầu Node.js `22.13.0` trở lên.

```bash
npm ci
copy .env.example .env.local
npm run db:migrate:local
npm run dev
```

Mở `http://localhost:3000`. Điền `GEOAPIFY_API_KEY` trong `.env.local` nếu cần autocomplete; không có key thì người dùng vẫn nhập địa chỉ thủ công.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` tự build rồi chạy smoke test cho trang cửa hàng, menu, tạo đơn COD và lỗi Geoapify an toàn.

## Dữ liệu dùng chung với admin

Khi `storefront-web/` và `admin-web/` nằm cạnh nhau, D1 local được lưu tại `../.tra-sua-ngon-local-state/`. Chạy migration một lần từ một trong hai gói. Production cần cấu hình cùng D1 `database_id` cho cả hai Worker.

## Biến môi trường

| Biến | Bắt buộc | Mục đích |
|---|---:|---|
| `SITE_URL` | Có ở production | Canonical URL của storefront |
| `GEOAPIFY_API_KEY` | Chỉ khi dùng autocomplete | Secret chỉ đọc ở server |

Không commit `.env`, `.env.local`, D1 local, `node_modules`, `dist`, `.wrangler` hoặc log.

## Tài liệu

- [Payment provider](docs/PAYMENT_PROVIDERS.md)
- [Domain setup](docs/DOMAIN_SETUP.md)
- [Responsive report](docs/RESPONSIVE_TEST_REPORT.md)
- [Package manifest](PACKAGE_MANIFEST.md)
