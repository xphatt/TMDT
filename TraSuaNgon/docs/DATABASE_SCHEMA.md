# Database schema — Trà Sữa Ngon

Database mục tiêu là Cloudflare D1 (SQLite). Drizzle định nghĩa schema trong `db/schema.ts`; migration được lưu trong `drizzle/`.

Migration hiện tại: `0000_material_maestro.sql`.

## Nguyên tắc

- Tiền dùng `INTEGER` theo VND, không dùng floating point.
- Giá/tổng được server tính từ catalogue nội bộ.
- Order item và topping lưu snapshot tên/giá tại thời điểm mua.
- Payment tách khỏi order để giữ Seam cho provider tương lai.
- History và audit là append-only qua ứng dụng.
- Không lưu số thẻ, CVV, mật khẩu thuần hoặc session token thuần.
- Foreign key dùng cascade cho dữ liệu con của order/session; admin đã ngừng hoạt động có thể được set null trong history/audit nhưng nội dung sự kiện vẫn còn.

## Bảng

### `orders`

Order header, customer snapshot, subtotal/discount/shipping/total, status, timestamp và `version` chống ghi đè. Index theo `order_code`, `created_at`, `(order_status, created_at)` và `phone`.

### `order_items`

Snapshot product, unit price, size, sugar, ice, quantity và line total. Index theo `order_id`.

### `order_item_toppings`

Snapshot topping cho từng item. Index theo `order_item_id`.

### `payments`

Một payment hiện hành cho mỗi order, được bảo vệ bằng unique index `order_id`.

Các field chính:

- `payment_method`: `cash` hoặc `bank`.
- `provider`: `cash_on_delivery` hoặc `mock_qr`.
- `payment_status`: `unpaid`, `simulation_only`, `paid`.
- `amount_due`, `amount_paid`: số nguyên VND.
- `transaction_reference`: nullable; QR hiện chỉ chứa mã mô phỏng.
- `paid_at`: chỉ có khi COD được admin xác nhận.

### `order_status_history`

Lưu `from_status`, `to_status`, admin actor nullable, lý do và thời gian. Storefront/system event có actor null.

### `admin_users`

Tên đăng nhập unique, display name, password hash, role, active flag, failed attempts/lock, timestamps. Password hash có format version hóa:

```text
pbkdf2-sha256$<iterations>$<salt-base64url>$<digest-base64url>
```

### `admin_sessions`

Chỉ lưu SHA-256 hash của session token và CSRF token, cùng expiry/revoke. Cookie thuần chỉ nằm trong browser.

### `admin_login_attempts`

Rate limit cho cả tài khoản tồn tại và không tồn tại. Key là SHA-256 của login đã chuẩn hóa kết hợp network fingerprint; không lưu IP thuần.

### `admin_audit_logs`

Actor, action, entity, before/after JSON đã giới hạn, request ID, network fingerprint đã hash và timestamp. Không trả fingerprint qua API admin.

## State machine

```text
pending -> confirmed | cancelled | rejected
confirmed -> preparing | cancelled
preparing -> delivering | cancelled
delivering -> completed | cancelled
completed, cancelled, rejected -> terminal
```

## Migration local

```bash
npm run db:generate
npm run db:migrate:local
```

`db:generate` chỉ chạy khi schema thay đổi và migration mới phải được review. `db:migrate:local` không tác động D1 remote.

## Production checkpoint

Chưa tạo hoặc migrate D1 production. Trước khi chạy remote phải:

1. Điền database ID thật trong cấu hình môi trường được duyệt.
2. Backup database và review SQL migration.
3. Chạy preview/smoke test.
4. Có phê duyệt riêng cho migration production và tài khoản admin đầu tiên.
