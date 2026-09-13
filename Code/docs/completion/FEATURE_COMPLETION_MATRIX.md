# Ma trận hoàn thiện chức năng

Ngày xác minh: 13/09/2026  
Phạm vi: source và dữ liệu local/test trong `D:\TMDT`; không deploy, không dùng thanh toán thật.

| ID | Yêu cầu | Trước | Sau | Bằng chứng | Test | Trạng thái |
|---|---|---|---|---|---|---|
| CMP-01 | Liên hệ và feedback | FAIL | Form bốn trường, validation Client/Server, chống gửi trùng, lưu D1, Admin xem và đổi trạng thái | `app/components/ContactView.tsx`, `app/api/feedback/route.ts`, `app/server/engagement/engagement-service.ts`, `app/admin/feedback/` | `completion-unit`: feedback validation; `completion-integration`: feedback persistence/admin auth | PASS |
| CMP-02 | Khuyến mãi, giá cũ/giá mới | FAIL | Promotion có thời gian hiệu lực, trạng thái, giá sale; giá hiển thị thống nhất; Server tính lại giá đơn | `app/data/promotions.ts`, `app/server/catalogue/catalogue-service.ts`, `app/server/orders/order-service.ts`, migration `0001` | Unit promotion active/expired; integration catalogue/promotion/server pricing | PASS |
| CMP-03 | Chính sách | FAIL | Ba route riêng, link footer/checkout, ngày cập nhật và cảnh báo cần duyệt trước kinh doanh thật | `app/chinh-sach/`, `app/components/PolicyPage.tsx` | Browser route vận chuyển + responsive; rendered build routes | PASS |
| CMP-04 | Google Maps | FAIL | API store-info chỉ tạo URL Maps khi có địa chỉ cấu hình; có fallback và không bịa địa chỉ | `app/api/store-info/route.ts`, `app/components/ContactView.tsx`, `.env.example` | Browser kiểm tra contact; source/test build | NEEDS CONFIG |
| CMP-05 | Đánh giá và bình luận | FAIL | 1–5 sao, validation, trung bình/tổng lượt, persistence, quyền sửa/xóa theo owner token, Admin moderation | `app/components/ReviewSection.tsx`, `app/api/reviews/`, `app/server/engagement/engagement-service.ts`, `app/admin/reviews/` | Unit review validation/average; integration ownership/moderation | PASS |
| CMP-06 | Quản trị catalogue | PARTIAL | Tìm/lọc/sắp xếp; tạo/sửa/ẩn sản phẩm; danh mục, topping, promotion; API bảo vệ server + CSRF | `app/admin/catalogue/`, `app/api/admin/catalogue/`, `app/api/admin/categories/`, `app/api/admin/toppings/`, `app/api/admin/promotions/` | Integration CRUD + từ chối anonymous; typecheck/build | PASS |
| CMP-07 | Admin feedback/review | FAIL | Surface vận hành mới và API moderation có xác thực server | `app/admin/feedback/`, `app/admin/reviews/`, `app/server/admin/admin-http.ts` | Integration admin auth/moderation | PASS |
| CMP-08 | Lỗi checkout trình diễn | FAIL | Development-only 503 một lần theo request ID, retry dùng cùng ID, giữ form/cart, không tạo trùng | `app/api/orders/route.ts`, `app/components/TeaShop.tsx`, `app/lib/checkout-api.ts`, `vite.config.ts` | Browser: lỗi → thử lại → thành công; D1 `COUNT(*) = 1`; production guard test | PASS |
| CMP-09 | Health check | Chưa có | `/api/health` kiểm tra binding D1, không trả secret | `app/api/health/route.ts` | Integration health endpoint | PASS |
| CMP-10 | Responsive/accessibility | PARTIAL | UI mới dùng label, focus/error/status rõ; không tràn ngang ở 8 viewport mô phỏng | `app/globals.css`, `app/admin/admin.css`; Chromium browser evidence | 320×568 đến 1920×1080, console warning/error rỗng | PASS |
| CMP-11 | Triển khai công khai | NOT DEPLOYED | Source/build/health/rollback plan sẵn sàng; chưa tạo D1 production, hostname hay DNS | `docs/deployment/PUBLIC_DEPLOYMENT_PLAN.md` | Production build | READY FOR DEPLOYMENT |

## Seam kiến trúc đã giữ rõ

- `app/data` là fallback nội bộ; `CatalogueService` là seam thay dữ liệu bằng D1/API.
- `OrderService` sở hữu việc đối chiếu giá, không tin `unitPrice` từ trình duyệt.
- `PaymentProvider` giữ COD và QR mô phỏng tách khỏi luồng đặt hàng, sẵn sàng thêm adapter thật sau này.
- `EngagementService` gom validation, persistence và quyền sở hữu feedback/review.
- Tất cả API Admin kiểm tra session ở Server; mutation yêu cầu CSRF.

## Blocker còn lại

- `[CẦN CUNG CẤP ĐỊA CHỈ CỬA HÀNG]`: đặt `STORE_ADDRESS` mới có thể bật liên kết Google Maps chính xác.
- Chưa có môi trường public được người dùng phê duyệt. Trạng thái trung thực là `SOURCE READY FOR DEPLOYMENT`, không phải `DEPLOYED`.
- Firefox, Safari/WebKit, Edge độc lập và thiết bị thật chưa được kiểm thử trực tiếp trong môi trường hiện tại.

