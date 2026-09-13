# Hướng dẫn quản trị Trà Sữa Ngon

## Phạm vi

Khu vực quản trị chạy tại `/admin` và dùng cùng D1 với API đặt hàng của storefront. Cart vẫn là draft cục bộ; đơn đã gửi thành công mới là dữ liệu vận hành.

Thanh toán trong bản này không kết nối cổng thật:

- COD bắt đầu ở trạng thái `unpaid` và chỉ admin có thể xác nhận đã thu.
- QR/chuyển khoản luôn là `simulation_only`; không được chuyển thành `paid`.

## Chuẩn bị local

Yêu cầu Node.js 22.13 trở lên.

```bash
npm ci
npm run db:migrate:local
npm run admin:create
npm run dev
```

`npm run admin:create` chỉ hỗ trợ D1 local. Tên đăng nhập dùng `a-z`, `0-9`, `.`, `_`, `-`; mật khẩu có 12–200 ký tự và được nhập ẩn. Script ghi PBKDF2 hash vào D1, không ghi mật khẩu thật vào source, command line hay tài liệu.

Mở:

- Storefront: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Đăng nhập và phiên làm việc

- Phiên có thời hạn 8 giờ.
- Session token nằm trong cookie `HttpOnly`; CSRF token riêng được ràng buộc với session.
- Production HTTPS sẽ bật cờ cookie `Secure`.
- Sau nhiều lần thử sai, hệ thống khóa tạm theo tài khoản và dấu vết mạng đã hash.
- Đăng xuất revoke session trong D1 trước khi xóa cookie.

Nếu bị chuyển về trang login, phiên đã hết hạn hoặc bị revoke. Đăng nhập lại; không sửa cookie hoặc gọi API trực tiếp để bỏ qua.

## Dashboard

Trang `/admin` đọc dữ liệu thật từ D1 và hiển thị:

- Tổng đơn trong kỳ.
- Đơn chờ xác nhận, đang xử lý, hoàn tất, hủy/từ chối.
- Tổng giá trị đơn, số đã thu COD và số còn phải thu.
- Số đơn COD và QR mô phỏng.

Bộ lọc ngày dựa trên ngày tạo đơn. Khi chưa có dữ liệu, số liệu bằng 0 và giao diện nói rõ trạng thái trống; không sinh biểu đồ hoặc số liệu giả.

## Danh sách đơn

Trang `/admin/orders` hỗ trợ:

- Tìm theo mã đơn, tên khách hoặc số điện thoại.
- Lọc trạng thái đơn, trạng thái thanh toán và phương thức.
- Sắp xếp theo thời gian hoặc tổng tiền.
- Phân trang server-side, tối đa 100 dòng/request; UI dùng 20 dòng/trang.

Trên mobile, mỗi dòng bảng chuyển thành một cụm nhãn–giá trị, giữ đủ thao tác chính.

## Chi tiết và cập nhật đơn

Trang `/admin/orders/:id` hiển thị snapshot khách hàng, món/topping, tiền, payment, lịch sử trạng thái và audit.

Vòng đời hợp lệ:

```text
pending -> confirmed -> preparing -> delivering -> completed
   |           |            |
   +--------> cancelled <----+
   +--------> rejected
```

Quy tắc:

- Không chuyển lùi hoặc mở lại trạng thái kết thúc.
- Hủy/từ chối bắt buộc lý do tối thiểu 5 ký tự.
- Update dùng `version`; nếu admin khác vừa cập nhật, UI yêu cầu tải lại thay vì ghi đè.
- Chỉ role `admin` được mutate; `operator` chỉ xem.
- Mọi state transition được ghi history và audit.

## Xác nhận COD

Nút “Xác nhận đã thu COD” chỉ xuất hiện khi:

- Phương thức là COD.
- Payment đang `unpaid`.
- Đơn ở `delivering` hoặc `completed`.
- Tài khoản có role `admin`.

Sau khi xác nhận, backend đặt `amount_paid = amount_due`, `payment_status = paid`, ghi `paid_at` và audit. Client không có endpoint sửa trực tiếp số tiền hoặc transaction reference.

## Biến môi trường

Tạo `.env.local` từ `.env.example`:

```dotenv
GEOAPIFY_API_KEY=
SITE_URL=http://localhost:3000
```

Không cần biến chứa mật khẩu admin. Tài khoản và session nằm trong D1. Production phải đặt `SITE_URL` thành hostname Workers thực tế và nạp Geoapify key qua secret manager của Cloudflare.

## Kiểm thử

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` build production và chạy integration test với D1 tạm thời bằng runtime Cloudflare local. Test bao phủ storefront, pricing, auth, rate limit, session expiry, authorization, pagination/search, state transition, COD và audit.

## Dữ liệu tuyệt đối không commit

- `.env`, `.env.local`, `.dev.vars`.
- Mật khẩu, session token, CSRF token, API key.
- `.wrangler/` và database local.
- Log, output build, database dump hoặc credential export.

## Production

Chưa có tài khoản admin production và chưa deploy. Trước production cần phê duyệt riêng cho:

1. D1 database ID thật và migration production có backup.
2. Worker name/account subdomain và `SITE_URL` workers.dev thật.
3. Cách tạo/tạm khóa/thu hồi tài khoản admin production.
4. Secret Geoapify và chính sách retention PII/audit.
