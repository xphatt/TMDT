# Kế hoạch hoàn thiện chức năng — Trà Sữa Ngon

Ngày xác minh: 2026-09-13  
Phạm vi: `D:\TMDT`  
Nguyên tắc: giữ Vinext/React/Cloudflare Worker/D1, không cài dependency, không deploy, không thay đổi API cũ theo hướng không tương thích.

## Baseline đã chạy lại

| Hạng mục | Kết quả | Bằng chứng |
|---|---|---|
| Lint | PASS | `npm run lint`, exit code 0 |
| Type-check | PASS | `npm run typecheck`, exit code 0 |
| 13 automated test hiện hữu | PASS | `npm test`, 13 pass, 0 fail |
| Production build | PASS | `npm run build`, Vinext build hoàn tất |
| Git status | CẦN LƯU Ý | `D:\TMDT` không phải worktree; `D:\TMDT\repository` là Git worktree, nhánh `main` chậm hơn `origin/main` 2 commit và có thay đổi chưa commit |

## Ma trận triển khai

| ID | Chức năng | Hiện trạng xác minh | Phần thiếu | File liên quan | Cách triển khai | Rủi ro |
|---|---|---|---|---|---|---|
| CMP-01 | Liên hệ và feedback | Chỉ có hotline mẫu trong footer | Form, validation hai phía, lưu D1, chống gửi trùng, admin xem/xử lý | `app/components/TeaShop.tsx`, API mới, `db/schema.ts` | Thêm bảng `feedback`, service validation và request id duy nhất; thêm Contact view và Admin inbox | Thấp; migration chỉ thêm bảng |
| CMP-02 | Khuyến mãi | Giá nội bộ có backend đối chiếu nhưng chưa có giá cũ/mới | Thời hạn, active, hiển thị nhất quán, CRUD admin | `app/data`, order service, menu API, admin catalogue | Tạo module pricing thuần, bảng `promotions`, promotion mẫu có thời hạn; server resolve giá tại thời điểm đặt | Trung bình; phải giữ giá p1 của test cũ |
| CMP-03 | Chính sách | Chưa có route | Ba trang, footer/checkout links, nội dung đồ án có cảnh báo duyệt lại | Route mới dưới `app/chinh-sach` | Dùng component đọc chung, semantic HTML, nội dung nguyên bản và không cam kết pháp lý quá mức | Thấp |
| CMP-04 | Google Maps | Chưa có địa chỉ được xác nhận | Cấu hình địa chỉ và fallback | `.env.example`, API store-info, Contact view | Đọc `STORE_ADDRESS`; chỉ tạo Google Maps URL khi được cấu hình, không API key, không bịa địa chỉ | Thấp; trạng thái cuối NEEDS CONFIG nếu biến trống |
| CMP-05 | Đánh giá/bình luận | Chưa có | Lưu D1, 1–5 sao, trung bình, chống trùng, ownership, moderation | Product view, API mới, admin moderation, schema | Owner token ngẫu nhiên theo thiết bị, chỉ lưu SHA-256 phía server; React escape output; giới hạn độ dài và trạng thái visible/hidden | Trung bình; không thay thế customer auth thật |
| CMP-06 | Admin catalogue | Admin hiện chỉ quản lý đơn | CRUD sản phẩm, danh mục, topping, giá/khuyến mãi, ảnh; feedback/review | `/admin/catalogue`, `/admin/feedback`, `/admin/reviews`, API admin mới | Mở rộng AdminShell; mọi API yêu cầu session + role `admin` + CSRF cho mutation; xác nhận trước ẩn/xóa | Trung bình; giữ catalogue mặc định làm fallback khi D1 chưa migrate |
| CMP-07 | Checkout idempotency và lỗi demo | UI giữ form khi lỗi nhưng chưa có 503 demo/idempotency create | Chế độ lỗi mặc định tắt, nút Thử lại, không tạo trùng | order API/service/repository, checkout client | `clientRequestId` duy nhất; D1 unique index; 503 chỉ khi non-production và hai biến demo khớp | Trung bình; migration thêm cột nullable tương thích ngược |
| CMP-08 | Test mới | Có 13 test cũ | Unit/integration/UI assertions cho feature mới | `tests/` và package scripts | Thêm test riêng, giữ nguyên 13 test cũ; migration harness đọc toàn bộ SQL theo thứ tự | Thấp |
| CMP-09 | Responsive/a11y | 8 viewport Chromium giả lập đã PASS | Xác nhận UI mới, focus/error/long text | CSS storefront/admin | Mở rộng token/component hiện hữu, touch target ≥44px, overflow-wrap, reduced motion; tối đa hai vòng visual QA | Thấp |
| CMP-10 | Deployment | Local only | Kế hoạch hosting, env, health, rollback | `docs/deployment/PUBLIC_DEPLOYMENT_PLAN.md` | Đề xuất Cloudflare Workers + D1 phù hợp kiến trúc; dừng trước login/publish/D1 production/DNS | Không deploy theo phạm vi hiện tại |

## Seam và thứ tự thực hiện

1. **Domain rules:** validation feedback/review, promotion window, tổng tiền và quyền admin nằm trong module thuần để unit test.
2. **Persistence:** migration bổ sung bảng/cột, không xóa/đổi tên bảng cũ; D1 là source of truth, dữ liệu mặc định là fallback cho test/dev chưa migrate.
3. **Public API:** giữ nguyên contract menu/order hiện có và chỉ thêm field/endpoint tương thích.
4. **Admin API:** server auth + CSRF + `adminOnly` trước mọi mutation.
5. **UI:** thêm surface vào hệ thống màu jade/cam hiện hữu; giữ flow mua hàng cốt lõi.
6. **Verification:** chạy unit/integration, 13 test cũ, lint, type-check, production build, browser QA tổng hợp và một vòng xác nhận.

## Điểm dừng bắt buộc

Không cần xin xác nhận để tạo migration tương thích ngược và chạy trên D1 local/test. Phải dừng trước khi cài dependency, migrate database dùng chung/production, đăng nhập hosting, deploy, cấu hình DNS, tạo admin production, commit hoặc push.
