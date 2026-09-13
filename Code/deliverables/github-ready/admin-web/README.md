# Trà Sữa Ngon — Admin

Website quản lý nội bộ của Trà Sữa Ngon, xây bằng React 19, TypeScript, Vinext/Vite và Cloudflare Workers/D1.

## Chức năng

- Đăng nhập bằng session cookie server-side, rate limit và CSRF.
- Dashboard, tìm kiếm/lọc/phân trang đơn hàng.
- Xem chi tiết, cập nhật trạng thái theo transition hợp lệ.
- Xác nhận COD khi đúng giai đoạn và ghi audit log.
- Chặn index qua metadata và `robots.txt`.

UI catalogue, cart, checkout và API tạo đơn khách hàng đã được loại khỏi gói này.

## Chạy local

Đặt thư mục này cạnh `storefront-web/`, sau đó:

```bash
npm ci
copy .env.example .env.local
npm run db:migrate:local
npm run admin:create
npm run dev
```

Mở `http://localhost:3001/admin/login`. Script `admin:create` chỉ ghi password hash vào D1 local và không hỗ trợ `--remote`.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` tự build rồi kiểm tra redirect, bảo vệ route/API admin, trang đăng nhập và robots.

## Dữ liệu dùng chung với storefront

Hai gói dùng chung D1 local tại `../.tra-sua-ngon-local-state/`. Production phải bind Worker admin và Worker storefront vào cùng một D1 `database_id`; không tạo hai database độc lập nếu muốn admin nhìn thấy đơn từ storefront.

## Biến môi trường

| Biến | Bắt buộc | Mục đích |
|---|---:|---|
| `SITE_URL` | Có ở production | Origin của web admin |
| `STOREFRONT_URL` | Có ở production | Link mở cửa hàng từ giao diện admin |

Không có API key Geoapify trong gói admin. Không commit `.env`, D1 local, `node_modules`, build output, `.wrangler` hoặc log.

## Tài liệu

- [Hướng dẫn quản trị](docs/ADMIN_GUIDE.md)
- [API quản trị](docs/API_ADMIN.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
- [Package manifest](PACKAGE_MANIFEST.md)
