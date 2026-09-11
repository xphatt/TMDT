# Kế hoạch triển khai website quản trị — Trà Sữa Ngon

Ngày khảo sát: 2026-08-30
Workspace: `D:\TMDT`
Trạng thái: **Đã triển khai và kiểm thử local — chờ checkpoint production**

## 0. Trạng thái sau phê duyệt

Ngày 2026-08-30, người dùng đã duyệt D1, đăng nhập admin nội bộ và quy trình trạng thái/COD theo kế hoạch. Implementation local hiện có:

- D1 schema và migration cho order, item/topping snapshot, payment, admin, session, login rate limit, history và audit.
- Customer order API dùng D1 làm nguồn dữ liệu chính; memory Adapter chỉ còn phục vụ test có chủ đích.
- Auth server-side bằng PBKDF2/Web Crypto, session token chỉ lưu dạng hash, cookie `HttpOnly`, CSRF, SameSite, expiry, logout/revoke và rate limit.
- API dashboard/list/detail/state transition/COD và audit.
- UI `/admin/login`, `/admin`, `/admin/orders`, `/admin/orders/:id` responsive.
- Integration test D1 tạm thời bao phủ storefront, authentication, authorization, expiry, transition, COD và audit.

Chưa tạo D1/tài khoản admin production và chưa deploy. Hostname workers.dev thật vẫn cần chốt trước khi cấu hình production.

## 1. Phạm vi và kết luận khảo sát

Phần dưới giữ lại kết quả khảo sát trước triển khai để truy vết quyết định. Schema/auth/D1 đã được triển khai local sau khi checkpoint được duyệt; dependency không thay đổi và chưa deploy.

Kết luận chính:

- Dự án là storefront React 19/TypeScript chạy trên Vinext/Vite, có Cloudflare Worker entry riêng.
- Dữ liệu menu và bảng giá là dữ liệu nội bộ trong source.
- Giỏ hàng và tối đa 10 biên nhận gần nhất được lưu trong `localStorage` của từng trình duyệt.
- Trước checkpoint, đơn chỉ nằm trong memory repository. Sau phê duyệt, D1 trở thành source of truth; memory Adapter chỉ bật rõ cho test cô lập.
- D1/Drizzle hiện có binding `DB`, schema và migration cộng thêm đã kiểm tra local.
- Admin nội bộ hiện có user/session/rate-limit/role/audit server-side; tài khoản local được tạo bằng script tương tác, không hard-code.
- QR vẫn chỉ mô phỏng. COD chỉ thành `paid` sau thao tác xác nhận thủ công của role `admin` khi đơn đang giao hoặc hoàn tất.
- Production D1, tài khoản production và deploy vẫn là checkpoint riêng.

## 2. Kiến trúc hiện tại

### 2.1 Công nghệ và lệnh vận hành

| Hạng mục | Hiện trạng |
| --- | --- |
| UI/runtime | React `19.2.6`, React DOM `19.2.6`, TypeScript `5.9.3` |
| Framework | Vinext `1.0.0-beta.2`, Vite `8.0.13` |
| Cloudflare | `@cloudflare/vite-plugin`, Wrangler, entry `worker/index.ts` |
| Database toolkit | Drizzle ORM/Kit; schema SQLite/D1 và migration cộng thêm |
| Package manager | npm, có `package-lock.json` lockfile v3 |
| Development | `npm run dev` |
| Build | `npm run build` |
| Production local | `npm run start` |
| Lint | `npm run lint` |
| Test | `npm test` — build rồi chạy Node test runner |

### 2.2 Module, Interface và Seam hiện có

Các thuật ngữ dưới đây theo hướng thiết kế deep module: Module che giấu Implementation sau Interface; Seam là ranh giới có thể thay Adapter mà không làm lan thay đổi ra toàn hệ thống.

| Module | Interface công khai | Implementation hiện tại | Seam/nhận xét |
| --- | --- | --- | --- |
| Catalogue/Pricing | `products`, `toppings`, `deliveryFee`, `sizeSurcharge` | File TypeScript nội bộ | Đây là nguồn giá chuẩn; API đơn hàng đã tính lại giá phía server, không tin `unitPrice` từ client. |
| Order | `createPendingOrder`, `confirmSimulatedOrder` | `order-service.ts` | Service tính giá từ dữ liệu nội bộ và lấy Adapter qua resolver. |
| Order repository | `OrderRepository.create/findById/update` | D1 Adapter mặc định; memory Adapter khi bật rõ | Admin query service cung cấp list/filter/page; mutation dùng optimistic version. |
| Payment | `PaymentProvider.prepare/confirmSimulation` | COD và mock QR Adapter | Seam tốt để giữ luồng thanh toán mô phỏng và bổ sung provider thật sau này mà không đổi core order flow. |
| Address | `/api/address-suggestions` | Backend gọi Geoapify | API key nằm server-side; không liên quan trực tiếp đến admin. |
| Browser storage | `loadCart/saveCart/saveOrder` | `localStorage` | Chỉ phù hợp cho trải nghiệm khách hàng cùng thiết bị; không được dùng làm nguồn dữ liệu admin. |
| Worker runtime | `worker.fetch` | Vinext app-router + image optimization | Phù hợp Cloudflare Workers; `Env` đã khai báo `DB` nhưng binding chưa tồn tại. |
| Database | `getD1()`, `getDb()` | Raw prepared D1 cho nghiệp vụ; Drizzle helper cho extension | Binding `DB`; schema/migration đã kiểm tra local. |
| Auth helper | `getChatGPTUser/requireChatGPTUser` | Tin các header `oai-authenticated-*` | Không được import; không phải authentication của ứng dụng, không có role admin, và không dùng được làm bảo vệ admin trên Workers độc lập. |

### 2.3 Luồng đơn hàng hiện tại

1. Khách chọn sản phẩm/topping; cart được lưu ở `localStorage` với key `tra-sua-ngon:cart:v1`.
2. `POST /api/orders` nhận customer/items, kiểm tra đầu vào và tính lại toàn bộ giá từ catalogue nội bộ.
3. Server tạo mã đơn và ghi `pending` vào D1; memory repository chỉ dùng khi test bật rõ Adapter đó.
4. `POST /api/orders/:id/confirm` đổi đơn sang `confirmed` và xác nhận luồng mô phỏng.
5. Frontend lưu biên nhận vào `localStorage` với key `tra-sua-ngon:orders:v1`.

Hệ quả:

- Cart/biên nhận vẫn còn sau khi đóng và mở lại cùng trình duyệt, trừ khi người dùng xóa dữ liệu trình duyệt.
- Đơn server không bền vững qua restart/redeploy và không bảo đảm nhìn thấy giữa nhiều Worker isolate.
- Admin không thể lấy danh sách đơn tin cậy từ dữ liệu browser của khách.
- Biên nhận browser hiện chứa họ tên, số điện thoại và địa chỉ; đây là rủi ro riêng tư cần giảm thiểu khi đã có backend bền vững.

### 2.4 API và trạng thái hiện có

| Endpoint | Mục đích | Nguồn dữ liệu/trạng thái |
| --- | --- | --- |
| `GET /api/menu` | Trả catalogue nội bộ | File TypeScript |
| `GET /api/address-suggestions?q=...` | Gợi ý địa chỉ Việt Nam | Geoapify qua backend |
| `POST /api/orders` | Tạo đơn `pending` | Memory repository |
| `POST /api/orders/:id/confirm` | Xác nhận đơn mô phỏng | Memory repository |

Trạng thái đơn hiện chỉ có `pending` và `confirmed`. Trạng thái thanh toán chỉ có:

- `unpaid` cho COD;
- `simulation_only` cho QR mô phỏng.

Không có giao dịch thật, webhook, mã giao dịch thật hoặc hành vi tự đánh dấu `paid`.

### 2.5 Hạ tầng Cloudflare và cấu hình domain

- `worker/index.ts` là Worker entry và chuyển request sang Vinext app router.
- `vite.config.ts` đang dùng cả Cloudflare Vite plugin lẫn `@openai/sites-vite-plugin`.
- `.openai/hosting.json` khai báo logical D1 binding `DB`; R2 không dùng.
- Chưa có source config Wrangler chuẩn như `wrangler.jsonc`/`wrangler.toml` để xác định worker name, `workers.dev`, D1 binding và migrations.
- `app/server/site-config.ts` fallback localhost; production phải inject hostname `workers.dev` thật sau khi được xác nhận.
- Chưa biết tên Worker và account subdomain thật, nên không được đoán URL production.
- Workspace hiện không có metadata `.git`; vì vậy không thể xác minh Git status/history/remote ngay tại `D:\TMDT`.

Wrangler config và D1 local đã được duyệt. Việc gỡ Sites compatibility dependency, tạo D1 remote hoặc deploy vẫn cần xác nhận riêng.

## 3. Khoảng trống so với yêu cầu admin

| Khoảng trống | Ảnh hưởng | Mức độ |
| --- | --- | --- |
| Không có database dùng chung | Không thể quản lý đơn thật, thống kê hoặc audit tin cậy | Chặn triển khai |
| Không có auth/role/session | `/admin` và API quản trị không thể được bảo vệ | Chặn triển khai |
| Repository chỉ có create/find/update | Thiếu list, search, filter, pagination và transaction | Cao |
| Order status quá ngắn | Không thể phản ánh chuẩn bị/giao/hoàn tất/hủy | Cao |
| Không có payment record độc lập | Khó quản lý COD, số tiền đã thu/còn thiếu và provider sau này | Cao |
| Không có history/audit log | Không truy vết ai thay đổi đơn và khi nào | Cao |
| PII nằm trong biên nhận localStorage | Rủi ro trên thiết bị dùng chung/XSS | Cao |
| Không có CSRF/rate limit | Login và mutation admin dễ bị lạm dụng | Cao |
| `chatgpt-auth.ts` không dùng và không phù hợp | Có thể gây hiểu nhầm rằng dự án đã có auth | Trung bình |
| Compatibility plugin cũ còn trong build | Có thể gây hiểu nhầm nền tảng deploy | Trung bình; chưa gỡ vì chưa được duyệt dependency |
| Chưa có test admin/component/E2E | Không đủ bằng chứng cho luồng quản trị và responsive | Trung bình |

## 4. Kiến trúc đề xuất

Mục tiêu là tạo các Module có Interface hẹp nhưng đủ sâu, giữ logic nghiệp vụ server-side và đặt D1/auth/payment sau các Seam rõ ràng.

### 4.1 Order Module

Interface đề xuất:

```ts
interface OrderRepository {
  create(input: NewOrder, tx?: Transaction): Promise<Order>;
  getById(id: string): Promise<Order | null>;
  list(query: OrderListQuery): Promise<Paginated<OrderSummary>>;
  updateStatus(command: UpdateOrderStatus, actor: AdminActor): Promise<Order>;
  confirmCod(command: ConfirmCodPayment, actor: AdminActor): Promise<Order>;
}
```

- `OrderService` giữ validation, quy tắc chuyển trạng thái và tính tiền.
- `D1OrderRepository` là Adapter cho production/dev database.
- API khách hàng và API admin cùng gọi `OrderService`; không nhân đôi quy tắc giá/trạng thái.
- Status update, payment update, history và audit phải chạy trong cùng transaction.
- Dùng optimistic concurrency qua `updatedAt` hoặc `version` để tránh hai admin ghi đè nhau.

### 4.2 Admin Auth Module

Interface đề xuất:

```ts
interface AdminAuthService {
  login(credentials: AdminCredentials, context: RequestContext): Promise<AdminSession>;
  getSession(request: Request): Promise<AdminPrincipal | null>;
  requireRole(request: Request, roles: AdminRole[]): Promise<AdminPrincipal>;
  logout(request: Request): Promise<void>;
}
```

Implementation đề xuất không có dependency mới:

- D1 lưu admin và session.
- Web Crypto PBKDF2-HMAC-SHA-256 dùng salt ngẫu nhiên riêng cho từng mật khẩu; tham số hash được version hóa để nâng cấp sau này.
- Session token ngẫu nhiên mạnh chỉ gửi một lần cho browser; database chỉ lưu hash của token.
- Cookie `HttpOnly`, `Secure` ở production, `SameSite=Lax`, TTL hữu hạn; revoke khi logout và có cơ chế rotation.
- Login báo lỗi chung, không tiết lộ tài khoản có tồn tại.
- Rate limit theo tài khoản và fingerprint/IP đã chuẩn hóa; khóa tạm thời sau nhiều lần sai.
- Mutation dùng CSRF token ràng buộc với session và kiểm tra `Origin`/`Host`.
- Mọi admin API kiểm tra session và role ở server. Ẩn nút trên UI không phải là authorization.

Phương án thay thế là Cloudflare Access trước `/admin`, nhưng phương án này không tự tạo trải nghiệm `/admin/login` theo đúng yêu cầu. Cần nhóm chọn giữa Access và app-owned auth trước khi code.

### 4.3 Admin Query Module

- Chịu trách nhiệm dashboard aggregate, danh sách đơn, filter và pagination.
- Không để UI tự tải toàn bộ đơn rồi tổng hợp.
- Chỉ trả DTO tối thiểu cho danh sách; detail endpoint mới trả item, payment và history.
- Filter/search dùng query có index và giới hạn `pageSize` tối đa 100.

### 4.4 Payment Module

- Giữ `PaymentProvider` hiện có làm Seam.
- Tách payment record khỏi customer checkout snapshot.
- COD và QR mô phỏng vẫn không thu tiền.
- Không thêm trạng thái `paid` cho QR mô phỏng.
- VNPay/MoMo/ZaloPay sau này được thêm bằng Adapter mới, webhook verifier và idempotency key; core order service không phụ thuộc SDK cụ thể.

### 4.5 Audit Module

- API append-only: `record(event)` và query theo order/admin/thời gian.
- Không cung cấp update/delete log trong ứng dụng.
- Ghi actor, action, entity, before/after đã lọc dữ liệu nhạy cảm, timestamp và request metadata tối thiểu.
- Không ghi password, session token, CSRF token hoặc secret vào log.

## 5. Data model đề xuất — chưa triển khai

Tất cả số tiền lưu bằng số nguyên VND, không dùng floating point. Thời gian lưu UTC ISO-8601 hoặc Unix epoch nhất quán.

### `admin_users`

- `id`, `login_name` hoặc `email` unique
- `password_hash`, `password_algorithm`, `password_params`
- `role`: `admin` hoặc `operator` ở bản đầu
- `is_active`, `failed_attempts`, `locked_until`
- `created_at`, `updated_at`, `last_login_at`

### `admin_sessions`

- `id`, `token_hash` unique, `admin_id`
- `csrf_token_hash`
- `created_at`, `last_seen_at`, `expires_at`, `revoked_at`
- Index cho `admin_id`, `expires_at`

### `orders`

- `id`, `order_code` unique
- `customer_id` nullable; hiện chưa có hệ thống tài khoản khách
- Snapshot: `customer_name`, `phone`, `email` nullable, `delivery_address`, `note`
- `subtotal`, `discount_amount` mặc định 0, `shipping_fee`, `total_amount`
- `order_status`, `created_at`, `updated_at`, `confirmed_at` nullable, `version`
- Index cho `order_code`, `created_at`, `order_status`, `phone`

Không thêm email vào checkout khách ở migration đầu nếu UI hiện không thu thập; chỉ để nullable nhằm tránh phá contract hiện có.

### `order_items`

- `id`, `order_id`, `product_id`
- Snapshot: `product_name`, `unit_price`
- `size`, `sugar`, `ice`, `quantity`, `line_total`
- Index cho `order_id`

### `order_item_toppings`

- `id`, `order_item_id`, `topping_id`
- Snapshot: `topping_name`, `unit_price`
- Index cho `order_item_id`

Tách topping thành bảng giúp query/audit rõ hơn JSON và giữ được tên/giá tại thời điểm đặt hàng.

### `payments`

- `id`, `order_id`
- `method`: `cash` hoặc `bank` ở bản đầu
- `provider`: `cash_on_delivery` hoặc `mock_qr`
- `status`: giữ `unpaid`/`simulation_only` cho behavior hiện tại
- `amount_due`, `amount_paid` mặc định 0
- `transaction_reference` nullable; QR mô phỏng phải được đánh dấu rõ
- `paid_at` nullable, `created_at`, `updated_at`
- Index/unique theo quy tắc một payment hiện hành cho một order

### `order_status_history`

- `id`, `order_id`, `from_status`, `to_status`
- `actor_admin_id` nullable cho sự kiện hệ thống
- `reason` nullable, `created_at`

### `admin_audit_logs`

- `id`, `admin_id`, `action`, `entity_type`, `entity_id`
- `before_json`, `after_json` đã lọc field nhạy cảm
- `request_id`, `network_fingerprint` nullable
- `created_at`

### Quy tắc migration

- Migration chỉ có thay đổi cộng thêm ở bước đầu; không drop/rename dữ liệu cũ.
- D1 local và production dùng migration giống nhau nhưng database khác nhau.
- Migration phải có kiểm tra rollback/restore hợp lý; không chạy production khi chưa có backup và phê duyệt riêng.
- Không seed password hoặc admin credential vào source. Admin đầu tiên phải được tạo qua công cụ vận hành an toàn, sau phê duyệt.

## 6. Vòng đời đơn hàng đề xuất

Hiện tại chỉ có `pending -> confirmed`. Vòng đời mở rộng đề xuất:

```text
pending -> confirmed -> preparing -> delivering -> completed
   |           |            |
   +--------> cancelled <----+
   +--------> rejected
```

Quy tắc cần xác nhận trước khi code:

- `cancelled` có được phép khi đã `preparing` hoặc `delivering` không.
- `rejected` khác `cancelled` về người thực hiện và lý do như thế nào.
- Có cho phép mở lại đơn ở trạng thái terminal không; khuyến nghị không ở bản đầu.
- COD chỉ được ghi nhận đã thu khi admin thao tác riêng hay tự động khi `completed`.
- Nếu xác nhận COD thủ công, cần role nào và có bắt buộc nhập người nhận tiền/ghi chú không.

Khuyến nghị: QR mô phỏng luôn `simulation_only`; COD chỉ chuyển `unpaid -> paid` bằng hành động admin được audit sau khi chính sách thu tiền được phê duyệt. Không gắn `paid` tự động chỉ vì order đã `completed`.

## 7. API admin đề xuất

Tất cả response dùng `cache-control: no-store` và error envelope nhất quán. Tất cả endpoint `/api/admin/*` yêu cầu session server-side; mutation yêu cầu CSRF và role phù hợp.

### Authentication

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| `POST` | `/api/admin/auth/login` | Xác thực, tạo session và cookie |
| `POST` | `/api/admin/auth/logout` | Revoke session và xóa cookie |
| `GET` | `/api/admin/auth/session` | Trả principal tối thiểu cho UI |

### Dashboard và đơn hàng

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard?from=&to=` | Số đơn/doanh thu mô phỏng/thống kê trạng thái từ D1 |
| `GET` | `/api/admin/orders?page=&pageSize=&q=&status=&paymentStatus=&paymentMethod=&from=&to=&sort=` | Search/filter/sort/pagination server-side |
| `GET` | `/api/admin/orders/:id` | Chi tiết đơn, items, payment và history |
| `PATCH` | `/api/admin/orders/:id/status` | Chuyển trạng thái theo state machine |
| `POST` | `/api/admin/orders/:id/payments/cod-confirmation` | Ghi nhận COD, chỉ sau khi chốt nghiệp vụ |
| `GET` | `/api/admin/orders/:id/history` | Lịch sử trạng thái/audit liên quan |

Yêu cầu implementation:

- `q` được giới hạn độ dài và tìm theo order code/phone/name bằng query parameterized.
- `pageSize` có default và tối đa 100.
- Amount, product snapshot và totals luôn lấy/tính ở server.
- Status update dùng transaction và kiểm tra version để chống lost update.
- Endpoint update idempotent khi phù hợp; COD confirmation phải chống gửi lặp.
- Không trả password hash, token hash, CSRF secret hoặc raw request metadata ra client.

## 8. Luồng authentication và authorization

1. Người dùng mở `/admin`.
2. Server đọc cookie và gọi `requireRole`; thiếu/sai/hết hạn thì redirect `/admin/login?returnTo=...` với return path được kiểm tra nội bộ.
3. Login xác thực rate limit, trạng thái tài khoản và password hash.
4. Server tạo token/CSRF ngẫu nhiên, chỉ lưu hash trong D1 và đặt cookie an toàn.
5. Admin API kiểm tra session, expiry, revoke và role trên từng request.
6. Mutation kiểm tra CSRF/Origin, thực hiện transaction và ghi audit.
7. Logout revoke session trước khi xóa cookie.

Không tái sử dụng `app/chatgpt-auth.ts` cho admin vì helper đó phụ thuộc header của môi trường khác, hiện không được import và không có role/session storage của ứng dụng.

## 9. Kế hoạch UI admin

### Route

- `/admin/login`: form đăng nhập, loading, lỗi chung, khóa tạm thời và focus management.
- `/admin`: dashboard từ dữ liệu D1 thật; khi chưa có đơn hiển thị empty state, không tạo số liệu giả.
- `/admin/orders`: danh sách có search, filter, sort, pagination và URL query state.
- `/admin/orders/:id`: customer snapshot, items/topping, tiền, payment, timeline và action cập nhật.

### Hướng thiết kế

- Giữ token thương hiệu trà/ngọc/cam và typography từ `DESIGN.md`, nhưng chuyển sang giao diện vận hành có mật độ thông tin cao hơn.
- Không tái sử dụng bố cục marketing hoặc card trang chủ cho bảng quản trị.
- Desktop dùng table có cột ưu tiên rõ; mobile dùng row stack có nhãn, không ép table ngang khó chạm.
- Status dùng cả chữ lẫn màu/icon; không phụ thuộc màu đơn độc.
- Action phá vỡ luồng như hủy/từ chối/ghi nhận tiền phải có confirmation dialog và mô tả hệ quả.
- Loading, empty, error, stale/conflict state đều có hành động phục hồi.
- Focus rõ, target chạm tối thiểu, label form đầy đủ, hỗ trợ keyboard và `prefers-reduced-motion`.

## 10. File dự kiến thay đổi/thêm sau khi được duyệt

Đây là danh sách dự kiến, chưa phải thay đổi đã thực hiện.

| File/thư mục | Hành động dự kiến | Lý do/rủi ro |
| --- | --- | --- |
| `db/schema.ts` | Thêm schema D1 | Thay đổi schema; cần phê duyệt |
| `drizzle/*.sql` | Sinh migration cộng thêm | Không chạy production khi chưa duyệt riêng |
| `app/server/orders/order-repository.ts` | Mở rộng Interface, bỏ singleton memory khỏi production path | Phải giữ API customer hoạt động |
| `app/server/orders/d1-order-repository.ts` | Thêm D1 Adapter | Nguồn dữ liệu dùng chung |
| `app/server/orders/order-service.ts` | Thêm state machine/transaction | Rủi ro phá contract nếu không giữ DTO tương thích |
| `app/server/auth/*` | Thêm auth/session/role/CSRF/rate limit Module | Phần bảo mật quan trọng |
| `app/server/admin/*` | Thêm query/audit services | Không được để client truy cập DB trực tiếp |
| `app/server/payments/*` | Tách persistence và COD command | Giữ QR mô phỏng, không thu tiền thật |
| `app/api/admin/**` | Thêm admin API routes | Bắt buộc bảo vệ server-side |
| `app/admin/**` | Thêm login/dashboard/orders pages | Không thay storefront khách hàng |
| `app/components/admin/**` | Thêm component admin | Tách khỏi `TeaShop.tsx` để tăng Locality |
| `app/styles/admin.css` hoặc CSS đồng vị trí | Style giao diện vận hành | Tái dùng token, không làm rò style storefront |
| `worker/index.ts` | Đồng bộ `Env`/binding nếu cần | Không chứa secret |
| `wrangler.jsonc` | Thêm cấu hình Workers/D1 chuẩn | Cần worker name, database IDs và duyệt deploy |
| `vite.config.ts` | Gỡ/disable Sites plugin, giữ Vinext + Cloudflare | Thay đổi build config; cần duyệt |
| `package.json`, `package-lock.json` | Chỉ sửa nếu duyệt gỡ Sites hoặc thêm tooling | Không tự đổi dependency |
| `.env.example` | Thêm tên biến không-secret nếu cần | Không ghi giá trị thật |
| `app/server/site-config.ts` | Fallback localhost; production inject workers.dev đã xác nhận | Chưa biết hostname thật |
| `tests/**` | Thêm test database/auth/admin/regression | Có thể cần phê duyệt dependency E2E |
| `README.md`, `PRODUCT.md`, `CONTEXT.md`, `docs/*` | Cập nhật kiến trúc/vận hành/security | Chỉ phản ánh trạng thái đã triển khai |

`app/components/TeaShop.tsx`, catalogue và customer routes chỉ thay đổi khi cần nối persistence mới; không redesign hoặc thay thế customer UI.

## 11. Kế hoạch Cloudflare Workers/D1

Sau khi được duyệt:

1. Chốt worker name, account subdomain và URL `https://<worker>.<subdomain>.workers.dev`.
2. Tạo D1 local/preview/production tách biệt; binding tên `DB`.
3. Thêm Wrangler config chuẩn và secrets qua Wrangler/Cloudflare, không commit secret.
4. Chạy migration local, test, sau đó mới xin duyệt migration production.
5. Nếu nhóm duyệt thay đổi dependency, gỡ compatibility plugin của starter khỏi build config/package.
6. Cập nhật canonical/site URL sang hostname Workers thật; giữ `http://localhost:3000` cho development.
7. Deploy preview trước, chạy smoke/security/customer regression, rồi mới xin duyệt production deploy.

Không dùng custom domain, không gọi dịch vụ Sites và không deploy trong checkpoint hiện tại.

## 12. Rủi ro bảo mật và biện pháp

| Rủi ro | Biện pháp bắt buộc |
| --- | --- |
| Mất/không đồng bộ đơn do memory repository | D1 là source of truth; transaction và migration có kiểm soát |
| Truy cập trái phép admin | Session server-side, role checks trên mọi API, cookie an toàn |
| Brute-force/credential stuffing | Rate limit, lock tạm, lỗi chung, audit |
| CSRF trên mutation | CSRF token + Origin/Host validation + SameSite cookie |
| XSS đánh cắp dữ liệu | Escape output, không render HTML tùy ý, CSP/security headers phù hợp |
| Tamper giá/tổng tiền | Recompute ở server; client amount chỉ để hiển thị |
| Lost update giữa admin | Transaction + version/updatedAt conflict response |
| Lặp xác nhận COD | Idempotency/unique constraint + audit |
| Lộ PII qua localStorage/log | Giảm biên nhận local, không log full address/phone/token, quy định retention |
| Lộ secret trong bundle/Git | Chỉ binding/server env; secret scan trong test/CI |
| Migration mất dữ liệu | Migration cộng thêm, backup, dry-run và approval riêng |
| QR mô phỏng bị hiểu là thanh toán thật | Giữ `simulation_only`, copy rõ ràng, không có `paid` tự động |

## 13. Kế hoạch kiểm thử

### Hiện trạng đã chạy tại checkpoint

- `npm run lint`: **đạt**, exit code 0.
- `npm test`: **đạt**, build thành công và 11/11 integration test pass ở lần kiểm tra gần nhất trước vòng QA cuối.
- Build có đầy đủ storefront, API khách hàng, admin pages và admin API.
- Test hiện đã kiểm giá phía server, Geoapify, order mô phỏng và secret không lọt client bundle.

### Bắt buộc bổ sung khi triển khai

**Database/order**

- Tạo đơn ghi D1 và vẫn đọc được sau restart.
- Tổng tiền/topping/size được server tính lại.
- List/search/filter/date range/pagination đúng và có index phù hợp.
- Transaction rollback đầy đủ nếu history/audit/payment ghi lỗi.
- Hai request cập nhật cùng lúc trả conflict hợp lý.

**Authentication/security**

- Login đúng/sai, tài khoản disabled/locked, session hết hạn/revoked.
- Cookie flags ở production; localhost vẫn phát triển được.
- Mọi admin API trả 401/403 đúng khi thiếu session/role.
- CSRF/Origin sai bị chặn; GET không mutate.
- Rate limit không cho brute force nhưng không khóa nhầm vô thời hạn.
- Secret/password/token/hash không xuất hiện trong client bundle hoặc log.

**Order operation**

- Chỉ chuyển trạng thái theo state machine.
- Hành động lặp idempotent hoặc trả conflict rõ.
- COD confirmation theo đúng role/quy tắc đã duyệt và có audit.
- QR mô phỏng không bao giờ thành `paid`.
- Audit/history hiển thị đúng actor/time/before/after.

**UI/accessibility/responsive**

- Login, dashboard, list, detail, dialog, loading/empty/error/conflict.
- Keyboard/focus/labels/contrast/status không phụ thuộc màu.
- Viewport 360, 768, 1024, 1440 px.
- Chrome/Chromium và Firefox; Safari/Edge dùng HTML/CSS chuẩn, ghi rõ môi trường chưa test trực tiếp.

**Regression khách hàng**

- Browse, customize, cart persistence, address suggestion, checkout và success.
- API contract customer cũ vẫn hợp lệ hoặc có compatibility mapping.
- Không thay giao diện storefront ngoài thay đổi cần thiết cho persistence/privacy.

**Cloudflare**

- Wrangler local với D1 local, preview database và production database tách biệt.
- Smoke test workers.dev, headers/cookie/canonical/robots/sitemap.
- Không có custom-domain cũ hoặc secret trong production bundle/config; compatibility plugin chỉ gỡ sau phê duyệt dependency.

## 14. Xác nhận và checkpoint còn lại

Đã được duyệt và triển khai local:

1. Cloudflare D1 làm source of truth cho đơn hàng.
2. App-owned admin login bằng D1 session + Web Crypto PBKDF2.
3. State machine `pending -> confirmed -> preparing -> delivering -> completed`, cùng nhánh `cancelled/rejected` đã mô tả.
4. Chỉ role `admin` xác nhận COD khi đơn `delivering` hoặc `completed`; QR mô phỏng không thành `paid`.
5. Không cài dependency mới.

Cần xác nhận riêng trước production:

1. Worker name, account subdomain và hostname workers.dev thật.
2. D1 production database ID, backup và chạy migration remote.
3. Tạo tài khoản admin production đầu tiên.
4. Gỡ/disable phần tương thích OpenAI Sites còn lại trong build config/package nếu nhóm muốn chuyển hoàn toàn sang Wrangler độc lập.
5. Deployment công khai và chính sách retention PII/audit.

## 15. Điều kiện bắt đầu và hoàn thành giai đoạn sau

Sau khi các xác nhận trên được chốt, triển khai theo thứ tự:

1. D1 schema/migration local và D1 repository.
2. Auth/session/role/CSRF/rate limit.
3. Admin query/API/audit/state machine.
4. Admin UI responsive/accessibility.
5. Test đầy đủ và customer regression.
6. Cập nhật tài liệu/Cloudflare config.
7. Xin duyệt riêng trước migration production, tạo admin production và deploy.

Implementation local đã hoàn tất phần D1, authentication, API, UI và test. Production vẫn **bị chặn có chủ đích** cho đến khi database ID, hostname, tài khoản admin production và deployment được duyệt riêng.
