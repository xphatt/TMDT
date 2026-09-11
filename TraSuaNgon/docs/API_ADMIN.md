# API quản trị

Base path: `/api/admin`

Mọi response có `cache-control: no-store`. Endpoint protected yêu cầu cookie session hợp lệ; mutation yêu cầu thêm `Origin` cùng origin, header `x-csrf-token` và role phù hợp.

## Error envelope

```json
{
  "error": {
    "code": "invalid_query",
    "message": "Thông báo phục hồi bằng tiếng Việt.",
    "fields": {
      "field": "Lỗi theo trường nếu có."
    }
  }
}
```

Mã HTTP chính: `400` input, `401` thiếu/hết session, `403` role/CSRF, `404` không thấy đơn, `409` transition/version/payment conflict, `429` rate limit, `500` lỗi nội bộ đã che chi tiết.

## Authentication

### `POST /api/admin/auth/login`

Body:

```json
{
  "loginName": "admin.local",
  "password": "mật khẩu do người dùng nhập"
}
```

Thành công `200` đặt session cookie `HttpOnly` và CSRF cookie, trả principal tối thiểu:

```json
{
  "admin": {
    "id": "uuid",
    "loginName": "admin.local",
    "displayName": "Quản trị viên",
    "role": "admin"
  },
  "expiresAt": "2026-08-31T06:00:00.000Z"
}
```

Không trả password hash, token hoặc CSRF token trong JSON. Lỗi credential dùng thông báo chung; quá nhiều lần thử trả `429` và `Retry-After`.

### `GET /api/admin/auth/session`

Trả principal và expiry cho session hiện tại.

### `POST /api/admin/auth/logout`

Yêu cầu session + CSRF. Revoke session và xóa cookie.

## Dashboard

### `GET /api/admin/dashboard`

Query tùy chọn:

- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`

Response:

```json
{
  "dashboard": {
    "totalOrders": 12,
    "newOrders": 3,
    "processingOrders": 4,
    "completedOrders": 4,
    "cancelledOrders": 1,
    "totalValue": 812000,
    "amountPaid": 224000,
    "amountOutstanding": 588000,
    "codOrders": 7,
    "mockQrOrders": 5
  }
}
```

Tiền là số nguyên VND.

## Danh sách đơn

### `GET /api/admin/orders`

Query:

- `page`: số nguyên từ 1.
- `pageSize`: 1–100, mặc định 20.
- `q`: mã đơn, tên khách hoặc số điện thoại; tối đa 100 ký tự.
- `status`: `pending`, `confirmed`, `preparing`, `delivering`, `completed`, `cancelled`, `rejected`.
- `paymentStatus`: `unpaid`, `simulation_only`, `paid`.
- `paymentMethod`: `cash`, `bank`.
- `from`, `to`: `YYYY-MM-DD`.
- `sort`: `created-desc`, `created-asc`, `total-desc`, `total-asc`.

Response có `items`, `page`, `pageSize`, `totalItems`, `totalPages`. Danh sách không trả địa chỉ hoặc ghi chú khách hàng.

## Chi tiết đơn

### `GET /api/admin/orders/:id`

Trả:

- Summary và `version`.
- Customer snapshot.
- Items/toppings snapshot.
- Subtotal, discount, shipping, total.
- Payment amount due/paid/outstanding.
- Transaction reference đã che bớt.
- History và tối đa 50 audit entries gần nhất.

Không trả network fingerprint, session hoặc credential.

## Cập nhật trạng thái

### `PATCH /api/admin/orders/:id/status`

Yêu cầu role `admin`, CSRF và version hiện tại.

```json
{
  "toStatus": "preparing",
  "reason": "Đã chuyển phiếu cho quầy pha chế.",
  "expectedVersion": 2
}
```

Backend kiểm tra state machine. Hủy/từ chối cần lý do tối thiểu 5 ký tự. Thành công trả detail mới; version conflict trả `409`.

## Xác nhận COD

### `POST /api/admin/orders/:id/payments/cod-confirmation`

```json
{
  "expectedVersion": 4,
  "note": "Đã đối soát tiền mặt với người giao hàng."
}
```

Chỉ role `admin`; chỉ COD `unpaid` và đơn `delivering`/`completed`. Backend tự lấy `amount_due`, đặt `amount_paid` bằng số đó và ghi audit. Endpoint không nhận amount/payment status/transaction reference từ client.

QR mô phỏng không được endpoint này xử lý và không thể thành `paid`.
