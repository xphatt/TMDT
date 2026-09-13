# Kiểm tra sẵn sàng GitHub — Trà Sữa Ngon

Ngày xác nhận: 14/09/2026
Phạm vi: source tại `D:\TMDT\Code`, môi trường local, không deploy và không thực hiện thanh toán thật.

## Kết luận

**Đã vượt kiểm tra kỹ thuật để đưa lên GitHub.** Source không còn merge conflict, build production thành công và 26/26 test tự động đạt. Mười một trong mười hai nhóm chức năng có bằng chứng chạy thực tế hoặc integration test. Google Maps đã có implementation và fallback nhưng cần địa chỉ cửa hàng thật trong `STORE_ADDRESS` để hoạt động đầy đủ.

## Ma trận chức năng

| # | Chức năng | Trạng thái | Bằng chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Lọc, tìm kiếm | PASS | `app/components/TeaShop.tsx`, test chuẩn hóa tiếng Việt, UI tìm `dao` trả một món | Hỗ trợ có dấu/không dấu, danh mục, empty state và kết hợp bộ lọc |
| 2 | Sắp xếp | PASS | `app/components/TeaShop.tsx`; phổ biến, giá tăng/giảm, tên A–Z | Select có nhãn hiển thị trạng thái |
| 3 | Đăng nhập, đăng xuất | PASS | `/admin/login`, API session/logout và test bảo vệ admin | Quản trị nội bộ; không có tài khoản khách hàng trong phạm vi hiện tại |
| 4 | Giỏ hàng, thanh toán | PASS | UI tùy chỉnh món → giỏ → checkout; integration test server-owned pricing/idempotency | COD và QR chỉ mô phỏng, không thu tiền thật |
| 5 | Ảnh sản phẩm | PASS | `app/data/products.ts`, `public/images/`, Chromium và source test fallback | Ảnh chính tải được; handler fallback được xác minh ở source, chưa giả lập request ảnh lỗi |
| 6 | Responsive | PASS | Chromium giả lập 320×568, 360×800, 390×844, 412×915, 768×1024, 1024×768, 1366×768, 1920×1080 | Không overflow ngang; không có control tương tác dưới 44px |
| 7 | Liên hệ, feedback | PASS | `/api/feedback`, `ContactView.tsx`, integration test persistence/idempotency/admin auth | Dữ liệu local/test lưu D1 |
| 8 | Khuyến mãi, giá mới/giá cũ | PASS | `promotions.ts`, `catalogue-service.ts`, integration test promotion và server total | Server tính lại giá thanh toán |
| 9 | Đổi trả, bảo hành, vận chuyển | PASS | Ba route trong `/chinh-sach/*` | Có link từ footer và checkout |
| 10 | Google Maps | NEEDS CONFIG | `/api/store-info`, `ContactView.tsx`, `.env.example` | Cần điền địa chỉ thật vào `STORE_ADDRESS` |
| 11 | Đánh giá, bình luận | PASS | `/api/reviews`, `ReviewSection.tsx`, integration test ownership/moderation/average | Có validation, D1 và quản trị nội dung |
| 12 | Trang quản trị | PASS | `/admin`, `/api/admin/*`, integration test auth, catalogue, đơn, COD, audit | Route/API từ chối người chưa xác thực; mutation có CSRF và phân quyền |

## Lỗi đã sửa

| Lỗi | Cách xử lý | Regression |
|---|---|---|
| Tìm kiếm không dấu không khớp tiếng Việt | Chuẩn hóa Unicode, bỏ dấu kết hợp và chuyển `đ/Đ` thành `d` | Unit test `dao`/`Trà Đào Cam Sả` |
| Ảnh lỗi chưa có fallback rõ ràng | Handler chuyển sang asset local và chặn vòng lặp fallback | Source regression test |
| Chưa có test trực tiếp cho giỏ hàng local | Thêm localStorage adapter test qua ranh giới reload | Unit test lưu và phục hồi cart |
| `.vite/` và file khóa tạm Word có thể xuất hiện trong Git status | Bổ sung rule `.gitignore` | `git check-ignore` xác nhận |
| Tài liệu ghi 23 test | Đồng bộ README và báo cáo lên 26 test | `npm test`: 7 unit + 19 integration/rendered/UI |

## Kết quả kỹ thuật

| Kiểm tra | Kết quả |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 26/26, gồm production build |
| `/api/health` | HTTP 200, database connected |
| `/admin` khi chưa đăng nhập | HTTP 307 tới login |
| `/api/admin/dashboard` khi chưa đăng nhập | HTTP 401 |
| Console trình duyệt | 0 warning, 0 error trong lượt UI cuối |

## Git và bảo mật

- Source phát hành nằm trong `Code/`; README root dẫn tới đúng thư mục này.
- `.env`, dependency, build output, Wrangler state, `.vite` và file Word tạm bị ignore trong `Code/.gitignore`.
- `.env.example` chỉ chứa tên biến và giá trị local/mẫu, không chứa API key thật.
- Test production xác nhận Geoapify secret không xuất hiện trong frontend bundle.
- Không đưa file Word báo cáo, cache, log hoặc output cục bộ vào commit phát hành.

## Việc cần cấu hình ngoài môi trường hiện tại

1. Điền địa chỉ cửa hàng đã xác nhận vào `STORE_ADDRESS` để bật Google Maps.
2. Giữ `GEOAPIFY_API_KEY` trong secret/environment của hosting, không commit `.env.local`.
3. Chạy smoke test trên Chrome, Edge, Firefox và Safari/WebKit độc lập khi có thiết bị tương ứng; lượt này dùng Chromium tích hợp và viewport giả lập.
4. Production cần D1 binding thật, domain và HTTPS; trạng thái hiện tại là source sẵn sàng, chưa deploy.
