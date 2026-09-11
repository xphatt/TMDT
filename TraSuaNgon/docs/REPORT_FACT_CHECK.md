# Bảng kiểm chứng báo cáo tiểu luận Trà Sữa Ngon

Ngày khảo sát: 07/09/2026
Phạm vi: source runtime chính tại `D:\TMDT`, không dùng các bản sao trong `deliverables/` làm bằng chứng duy nhất.

## Quy ước trạng thái

- **Đã kiểm chứng từ source:** có tệp, cấu hình hoặc mã thực thi trực tiếp.
- **Đã kiểm chứng từ test/tài liệu:** có test và báo cáo kết quả lưu trong repository; không chạy lại trong lượt biên soạn vì yêu cầu chỉ ghi vào `docs`.
- **Chưa được triển khai:** không tìm thấy route, component, schema hoặc service tương ứng.
- **Cần bổ sung:** thông tin tổ chức hoặc hạ tầng không có trong source.

## Bảng kiểm chứng

| Nội dung | Bằng chứng trong dự án | Trạng thái | Được đưa vào báo cáo |
|---|---|---|---|
| Tên sản phẩm “Trà Sữa Ngon” | `README.md`, `PRODUCT.md`, metadata và UI | Đã kiểm chứng từ source | Có |
| Trường, khoa, môn, giảng viên, lớp, nhóm, thành viên | Không có trong repository | Cần bổ sung | Có dưới dạng trường chờ |
| Framework UI | `package.json`: React 19.2.6, React DOM 19.2.6 | Đã kiểm chứng từ source | Có |
| Ngôn ngữ | `package.json`, file `.ts`/`.tsx`: TypeScript 5.9.3 | Đã kiểm chứng từ source | Có |
| App/build framework | `package.json`: Vinext 1.0.0-beta.2, Vite 8.0.13 | Đã kiểm chứng từ source | Có |
| Runtime production dự kiến | `worker/index.ts`, `vite.config.ts`, `wrangler.jsonc` | Đã kiểm chứng từ source | Có, ghi là dự kiến |
| Cloudflare D1 | `.openai/hosting.json`, `db/schema.ts`, `drizzle/` | Đã kiểm chứng từ source | Có |
| Drizzle ORM | `package.json`, `db/schema.ts`, `drizzle.config.ts` | Đã kiểm chứng từ source | Có |
| Starter Sites | `.openai/hosting.json`, plugin Sites trong `vite.config.ts` | Đã kiểm chứng từ source | Có ở phần cấu hình |
| Tailwind CSS | Có dev dependency nhưng UI dùng `globals.css`/`admin.css` tùy chỉnh | Đã kiểm chứng từ source | Có ghi rõ giới hạn |
| Trang chủ | `app/components/TeaShop.tsx`: `HomeView` | Đã kiểm chứng từ source | Có |
| Catalogue | `TeaShop.tsx`: `MenuView`; `app/data/products.ts` | Đã kiểm chứng từ source | Có |
| Tìm kiếm, lọc, sắp xếp | State/query/sort trong `MenuView` | Đã kiểm chứng từ source | Có |
| Loading và empty state catalogue | Timer 420 ms, skeleton và empty state trong `MenuView` | Đã kiểm chứng từ source | Có |
| Chi tiết sản phẩm | `TeaShop.tsx`: `ProductView` | Đã kiểm chứng từ source | Có |
| Tùy chỉnh size, đường, đá, topping | `ProductView`, type trong `app/types.ts` | Đã kiểm chứng từ source | Có |
| Validation lựa chọn bắt buộc | Validation summary và focus trong `ProductView` | Đã kiểm chứng từ source | Có |
| Số lượng 1–20 | UI stepper và `order-service.ts` dòng kiểm tra quantity | Đã kiểm chứng từ source | Có |
| Giỏ hàng thêm/sửa/xóa | `CartView`, state trong `TeaShop` | Đã kiểm chứng từ source | Có |
| Giữ giỏ sau refresh | `app/lib/storage.ts`, khóa `tra-sua-ngon:cart:v1` | Đã kiểm chứng từ source | Có |
| Snapshot đơn local | `storage.ts`, khóa `tra-sua-ngon:orders:v1`, tối đa 10 | Đã kiểm chứng từ source | Có, phân biệt với D1 |
| D1 là nguồn đơn cho admin | `D1OrderRepository`, resolver và docs | Đã kiểm chứng từ source | Có |
| Memory repository | `order-repository-resolver.ts`, chỉ khi `ORDER_STORAGE=memory` | Đã kiểm chứng từ source | Có, ghi dùng cho test |
| Form giao hàng | `CheckoutView` có họ tên, điện thoại, địa chỉ, ghi chú | Đã kiểm chứng từ source | Có |
| Geoapify qua backend | `/api/address-suggestions`, `server/address-suggestions.ts` | Đã kiểm chứng từ source | Có |
| Lọc Việt Nam và giới hạn 5 | `countrycode:vn`, `limit=5` | Đã kiểm chứng từ source | Có |
| Timeout Geoapify | Mặc định 6.000 ms | Đã kiểm chứng từ source | Có |
| Debounce frontend | `TeaShop.tsx`: `setTimeout(..., 350)` | Đã kiểm chứng từ source | Có |
| Manual address fallback | State/message/input không bị khóa khi API lỗi | Đã kiểm chứng từ source | Có |
| API key server-side | `GEOAPIFY_API_KEY` qua runtime env; không public prefix | Đã kiểm chứng từ source/test | Có |
| Số sản phẩm | `products.ts`: 12 mục | Đã kiểm chứng từ source | Có |
| Cơ cấu sản phẩm | 9 đồ uống, 3 topping bán riêng | Đã kiểm chứng từ source | Có |
| Topping tùy chọn | `toppings`: 5 mục | Đã kiểm chứng từ source | Có |
| Giá đồ uống | 38.000–46.000 đồng | Đã kiểm chứng từ source | Có |
| Giá toàn catalogue | 7.000–46.000 đồng | Đã kiểm chứng từ source | Có |
| Phụ phí size L | `app/data/pricing.ts`: 7.000 đồng | Đã kiểm chứng từ source | Có |
| Phí giao hàng | `app/data/pricing.ts`: 18.000 đồng | Đã kiểm chứng từ source | Có |
| Server tính lại giá | `order-service.ts`: tìm dữ liệu nội bộ và tính unitPrice/subtotal | Đã kiểm chứng từ source/test | Có |
| Giới hạn dòng đơn | 1–50 dòng | Đã kiểm chứng từ source | Có |
| Validation khách | Tên ≥ 2, phone regex VN, address ≥ 10; giới hạn chuỗi | Đã kiểm chứng từ source/test | Có |
| Mã đơn | Prefix `TSN`, timestamp rút gọn và UUID | Đã kiểm chứng từ source | Có |
| Trạng thái đơn mới | `pending`, `version: 1` | Đã kiểm chứng từ source/test | Có |
| COD | Provider `cash_on_delivery`, payment `unpaid` | Đã kiểm chứng từ source/test | Có |
| QR mô phỏng | Provider `mock_qr`, `simulation_only` | Đã kiểm chứng từ source/test | Có |
| QR không tự paid | `confirmSimulation` giữ `simulation_only`; integration test | Đã kiểm chứng từ source/test | Có |
| PaymentProvider seam | Interface và hai adapter trong `payment-provider.ts` | Đã kiểm chứng từ source | Có |
| Cổng VNPay/MoMo/ZaloPay | Không có provider/API thật | Chưa được triển khai | Có ở hướng phát triển |
| Xác nhận COD nội bộ | API cod-confirmation và service admin | Đã kiểm chứng từ source/test | Có |
| Điều kiện xác nhận COD | Cash, unpaid, order delivering/completed, admin role | Đã kiểm chứng từ source/test | Có |
| Trang thành công và mã đơn | `SuccessView` trong `TeaShop.tsx` | Đã kiểm chứng từ source/browser report | Có |
| Khách theo dõi trạng thái đơn | Không có route/component/API lookup công khai | Chưa được triển khai | Có, ghi rõ |
| Customer authentication | Không có schema/page/service | Chưa được triển khai | Có, ghi rõ |
| Admin pages | `/admin`, `/admin/login`, `/admin/orders`, `/admin/orders/:id` | Đã kiểm chứng từ source | Có |
| Dashboard | Component, route và query service | Đã kiểm chứng từ source/test | Có |
| Search/filter/sort/page admin | `parseOrderListQuery`, `listAdminOrders` | Đã kiểm chứng từ source/test | Có |
| Role admin/operator | `AdminRole`, `requireAdminRole` | Đã kiểm chứng từ source/test | Có |
| Operator read-only | Mutation route dùng `adminOnly: true` | Đã kiểm chứng từ source/test | Có |
| State machine | `allowedTransitions` có 7 trạng thái | Đã kiểm chứng từ source/test | Có |
| Optimistic concurrency | `expectedVersion`, cột `version`, lỗi 409 | Đã kiểm chứng từ source/test | Có |
| Lý do hủy/từ chối | 5–300 ký tự | Đã kiểm chứng từ source/test | Có |
| Lịch sử trạng thái | Bảng `order_status_history` và transaction update | Đã kiểm chứng từ source/test | Có |
| Audit log | Bảng `admin_audit_logs`, before/after/request ID | Đã kiểm chứng từ source/test | Có |
| Password hashing | PBKDF2-SHA256, 310.000 vòng, salt 16 byte, hash 32 byte | Đã kiểm chứng từ source | Có |
| Dummy password work | `consumeDummyPasswordWork` | Đã kiểm chứng từ source | Có |
| Login rate limit | 5 lần/15 phút, block 15 phút | Đã kiểm chứng từ source/test | Có |
| Session | 8 giờ, token 32 byte, hash SHA-256 trong D1 | Đã kiểm chứng từ source/test | Có |
| Cookie security | HttpOnly session, SameSite=Lax, Secure khi HTTPS | Đã kiểm chứng từ source | Có |
| CSRF/origin | Header CSRF, cookie hash và same-origin check | Đã kiểm chứng từ source/test | Có |
| Admin security headers | no-store, no-referrer, nosniff, DENY | Đã kiểm chứng từ source | Có |
| Network fingerprint | Hash, không lưu raw IP trong audit | Đã kiểm chứng từ source | Có |
| Số bảng database | 9 bảng trong `db/schema.ts` | Đã kiểm chứng từ source | Có |
| Migration | `drizzle/0000_material_maestro.sql` | Đã kiểm chứng từ source/test report | Có |
| Seed database | Không có seed file; admin tạo tương tác | Chưa được triển khai | Có, ghi không có seed |
| Tồn kho | Không có module/schema | Chưa được triển khai | Có ở hạn chế/hướng phát triển |
| Khuyến mãi | `discountAmount` hiện mặc định 0, không có rule/module | Chưa được triển khai | Có ở hạn chế/hướng phát triển |
| Quản lý sản phẩm admin | Không có page/API/schema catalogue | Chưa được triển khai | Có ở hạn chế |
| Thông báo đơn | Không có email/SMS/push service | Chưa được triển khai | Có ở hướng phát triển |
| Backup/restore | Không có script/runbook | Chưa được triển khai | Có |
| Monitoring production | Không có cấu hình cảnh báo/observability | Chưa được triển khai | Có |
| Design system | `DESIGN.md`, tokens trong `globals.css` | Đã kiểm chứng từ source | Có |
| Responsive layout | CSS media query và báo cáo 16 viewport | Đã kiểm chứng từ source/test report | Có |
| Accessibility | Labels, legends, ARIA, focus, reduced motion | Đã kiểm chứng từ source/test report | Có |
| Chromium storefront | `docs/RESPONSIVE_TEST_REPORT.md`, 24/08/2026 | Đã kiểm chứng từ test/tài liệu | Có |
| Chromium admin login | `docs/ADMIN_TEST_REPORT.md`, 30/08/2026 | Đã kiểm chứng từ test/tài liệu | Có |
| Browser admin sau login | Không có credential/session cho browser QA | Chưa kiểm tra trực tiếp | Có, ghi giới hạn |
| Firefox/Safari/Edge/Chrome độc lập | Báo cáo ghi chưa có môi trường | Chưa kiểm tra trực tiếp | Có |
| Integration tests | `tests/rendered-html.test.mjs`: 11 test | Đã kiểm chứng từ source | Có |
| Kết quả 11/11 | `docs/ADMIN_TEST_REPORT.md` | Đã kiểm chứng từ test/tài liệu | Có, ghi ngày |
| Lint/typecheck/build pass | `docs/ADMIN_TEST_REPORT.md` | Đã kiểm chứng từ test/tài liệu | Có, ghi ngày |
| Unit tests | Không có suite unit riêng | Chưa được triển khai | Có |
| E2E đa browser | Không có suite | Chưa được triển khai | Có |
| Production deploy | README và production docs ghi chưa deploy | Chưa được triển khai | Có |
| D1 production | `wrangler.jsonc` dùng ID placeholder | Chưa được triển khai | Có |
| Domain/DNS/TLS | Không có bằng chứng xác minh host production | Cần bổ sung | Có |
| Local URL | `SITE_URL` mặc định `http://localhost:3000` | Đã kiểm chứng từ source | Có |
| LAN binding | `vite.config.ts`: `host: "0.0.0.0"` | Đã kiểm chứng từ source | Có |
| `CONTEXT.md` | Không tồn tại ở root | Cần bổ sung nếu nhóm muốn tài liệu bối cảnh riêng | Có trong phụ lục |
| Ảnh giao diện storefront | `.impeccable/review/tablet-768.png`, `tablet-1024.png` | Đã kiểm chứng, không có PII | Có |
| Ảnh admin login | `.impeccable/review/desktop.png`, `mobile.png` | Đã kiểm chứng, không có PII | Có |
| Ảnh dashboard/list/detail admin | Không có ảnh an toàn hiện hữu | Chưa kiểm tra/chụp trực tiếp | Không |
| Ảnh tracking khách | Chức năng không tồn tại | Chưa được triển khai | Không |

## Nguồn nội bộ chính

- `README.md`, `PRODUCT.md`, `DESIGN.md`
- `package.json`, `package-lock.json`, `.env.example`, `.gitignore`
- `app/components/TeaShop.tsx`, `app/data/*`, `app/lib/*`, `app/types.ts`
- `app/api/*`, `app/server/*`, `app/admin/*`
- `db/schema.ts`, `drizzle/0000_material_maestro.sql`
- `vite.config.ts`, `worker/index.ts`, `wrangler.jsonc`, `.openai/hosting.json`
- `tests/rendered-html.test.mjs`
- `docs/ADMIN_TEST_REPORT.md`, `docs/RESPONSIVE_TEST_REPORT.md`, `docs/TEST_PLAN.md`
- `docs/API_ADMIN.md`, `docs/DATABASE_SCHEMA.md`, `docs/PAYMENT_PROVIDERS.md`

## Giới hạn của lần biên soạn

Không chạy lại server, build, lint, type check hoặc test trong lần biên soạn vì yêu cầu an toàn chỉ cho phép tạo/chỉnh sửa trong `docs`; các lệnh trên có thể ghi cache/build ngoài thư mục này. Báo cáo dùng kết quả test đã được lưu trong repository và phân biệt rõ với kiểm tra source ở lượt hiện tại. Không gọi Geoapify thật, không dùng API key, không tạo dữ liệu D1 mới và không đăng nhập bằng tài khoản thật.

## Kiểm tra tài liệu đầu ra

| Hạng mục | Kết quả |
|---|---|
| Mở và phân trang bằng Microsoft Word 2021 | Thành công, 50 trang vật lý |
| Độ dài nội dung chính | 33 trang từ Chương 1 đến hết Tài liệu tham khảo; phụ lục 5 trang |
| Khổ và lề | A4; trái 3 cm; phải, trên, dưới 2 cm |
| Font và giãn dòng thân bài | Times New Roman 13 pt; 1,5 dòng |
| Mục lục | Trường TOC thật, đã cập nhật số trang và có thể cập nhật lại trong Word |
| Header/footer | Có từ trang sau bìa; trang bìa không hiện số |
| Bảng và hình | 15 bảng; 11 hình inline, không có floating anchor |
| Kiểm tra trực quan | Đã raster hóa và xem đủ 50 trang; không thấy chữ cắt, bảng tràn, hình sai tỉ lệ hoặc trang trắng bất thường |
| Accessibility audit của DOCX | 0 lỗi mức cao, 0 mức trung bình; 10 cảnh báo thấp vì URL tài liệu tham khảo hiển thị nguyên văn theo yêu cầu trích dẫn |
| Metadata cá nhân | Creator và lastModifiedBy để trống; đã loại 2.424 thuộc tính `rsid` |
| Tệp xem trước cuối | `report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-final.pdf` |
