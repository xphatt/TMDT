# Kiến trúc sau khi tách

## Module

| Module | Trách nhiệm | Không sở hữu |
|---|---|---|
| `storefront-web` | Trải nghiệm mua hàng, catalogue nội bộ, cart localStorage, checkout, tạo/xác nhận đơn mô phỏng | Đăng nhập admin, dashboard, cập nhật trạng thái vận hành |
| `admin-web` | Đăng nhập nội bộ, đọc và vận hành đơn, state transition, xác nhận COD, audit | Catalogue UI, cart, autocomplete địa chỉ, tạo đơn khách hàng |
| D1 schema | Hợp đồng dữ liệu giữa hai deployment | UI và logic trình bày |

## Interface

- Storefront ghi đơn qua `POST /api/orders` và xác nhận luồng mô phỏng qua `POST /api/orders/:id/confirm`.
- Admin chỉ truy cập dữ liệu qua `/api/admin/*` có session, CSRF, role và rate limit.
- Hai deployment dùng cùng migration trong `drizzle/` và cùng D1 binding tên `DB`.
- `PaymentProvider` vẫn là interface mở rộng cho VNPay/MoMo/ZaloPay; bản hiện tại chỉ có COD và QR mô phỏng.

## Seam

Seam giữa hai web là D1 schema, không phải import source xuyên repository. Mỗi gói có bản migration giống nhau để có thể cài độc lập; mọi thay đổi schema sau này phải được áp dụng đồng thời cho cả hai gói trong cùng pull request. Không để admin gọi localStorage của storefront và không để storefront import module auth/admin.

Trong development, cả hai cấu hình Cloudflare dùng `../.tra-sua-ngon-local-state/`. Trong production, cả hai `wrangler.jsonc` phải dùng cùng `database_id`. Nếu nhóm muốn loại bỏ bản migration lặp lại, bước kế tiếp phù hợp là chuyển sang monorepo workspace có package migration dùng chung; không nên dùng symlink vì gây lỗi khi clone hoặc giải nén trên Windows.
