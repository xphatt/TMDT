# Kết quả kiểm thử cuối

Ngày chạy cuối: 13/09/2026  
Môi trường: Windows, Node.js 22+, Vinext/Vite, Cloudflare Workers/D1 local, Chromium tích hợp.

## Kết quả lệnh

| Lệnh | Kết quả | Phạm vi |
|---|---|---|
| `npm run lint` | PASS | ESLint toàn project, không tắt rule |
| `npm run typecheck` | PASS | TypeScript `tsc --noEmit` |
| `npm run test:unit` | PASS — 5/5 | Feedback, promotion, review, admin permission, server totals/demo guard |
| `npm run build` | PASS | Production bundle Workers/Vite |
| `npm test` | PASS — 23/23 tổng cộng | 5 unit + 13 test cũ + 5 integration mới |
| `npm run db:migrate:local` | PASS | Migration `0001` chỉ trên D1 local/test |

Không xóa, bỏ qua hoặc thay thế 13 test nền. Build được chạy trong chính chuỗi `npm test` và chạy lại độc lập theo checklist cuối.

## Luồng chức năng

| Luồng | Kết quả | Bằng chứng |
|---|---|---|
| Feedback invalid → valid → gửi lặp | PASS | Server trả validation; cùng `clientRequestId` trả cùng bản ghi; Admin API yêu cầu session |
| Review tạo/đọc/sửa-xóa sai chủ/moderation | PASS | D1 persistence, aggregate 5.0/1, request sai owner trả 403, Admin ẩn được |
| Catalogue/promotion Admin | PASS | Anonymous `/api/admin/catalogue` trả 401; Admin tạo product/promotion; `/api/menu` trả 41.000đ thay vì 50.000đ |
| Giá đơn phía Server | PASS | Client cố gửi `unitPrice: 1`, đơn vẫn dùng 41.000đ; tổng hai món + ship = 100.000đ |
| Checkout timeout + retry | PASS | Lần đầu đúng thông báo 503, nút Thử lại, form/cart giữ nguyên; retry tạo đơn `TSN86800637BB7` |
| Không tạo đơn trùng | PASS | D1 local: idempotency key `4c67f588-0f62-4b96-89fb-3f06e5bf6b4a` có `order_count = 1` |
| Production demo guard | PASS | Production bundle bỏ qua `DEMO_MODE=true`; order vẫn xử lý theo luồng bình thường |
| Health check | PASS | `/api/health` trả `status=ok`, `database=connected`; không chứa tên/key Geoapify |
| Admin anonymous access | PASS | API catalogue/feedback/review/order từ chối request không có session |

## Responsive và console

Một vòng tổng hợp và một vòng xác nhận được thực hiện bằng Chromium giả lập. Browser backend áp dụng device scale của máy Windows; phép kiểm tra dùng `scrollWidth > clientWidth` tại từng override và đều trả `false`.

| Viewport yêu cầu | Storefront không tràn ngang | Header/Footer | Trạng thái |
|---:|---:|---:|---|
| 320×568 | Có | Có | PASS |
| 360×800 | Có | Có | PASS |
| 390×844 | Có | Có | PASS |
| 412×915 | Có | Có | PASS |
| 768×1024 | Có | Có | PASS |
| 1024×768 | Có | Có | PASS |
| 1366×768 | Có | Có | PASS |
| 1920×1080 | Có | Có | PASS |

Contact, policy và Admin login được kiểm tra thêm ở mobile/desktop: có form/tiêu đề, không tràn ngang. Console sau lượt xác nhận: `0` warning, `0` error.

Đây là giả lập viewport, không phải thiết bị vật lý. Firefox/WebKit và trình duyệt độc lập ngoài Chromium chưa có connector khả dụng nên được ghi `NOT TESTED`, không suy diễn thành PASS.

## Accessibility/UX hardening

- Form có label, `aria-invalid`, liên kết lỗi, validation summary và live status.
- Trạng thái loading/empty/error/success có copy rõ; retry không làm mất ngữ cảnh.
- Touch target, focus ring và `prefers-reduced-motion` tiếp tục dùng design system hiện có.
- Impeccable detector được chạy một lần sau khi hoàn thiện UI. Kết quả chỉ nêu advisory về token màu/cỡ chữ/radius chưa được ghi đầy đủ vào `DESIGN.md`; không có lỗi chặn build hay accessibility mới.

## Kết luận

- P0: 0.
- P1 chưa xử lý: 0 trong phạm vi source/local.
- Google Maps: `NEEDS CONFIG` do chưa có địa chỉ thật.
- Public deployment: `NOT DEPLOYED`; source ở trạng thái `READY FOR DEPLOYMENT`.
- Kết luận kỹ thuật: các chức năng còn thiếu trong phạm vi được phép đã hoàn thiện; hai đầu việc phụ thuộc người dùng là địa chỉ cửa hàng và phê duyệt nền tảng/production.

