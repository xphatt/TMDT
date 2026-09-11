# Kết quả kiểm thử

Ngày hoàn tất: 2026-09-10
Phạm vi: source hiện tại tại `D:\TMDT`; không deploy, không dùng dữ liệu production.

## Tổng quan trước và sau

| Hạng mục | Trước sửa | Sau sửa |
| --- | --- | --- |
| Lint | Đạt trước khi sinh browser profile | Đạt, exit 0; đã loại output/cache khỏi phạm vi |
| Typecheck | Đạt, exit 0 | Đạt, exit 0 |
| Build | Đạt, 17 route/API | Đạt, 17 route/API |
| Automated test | 11/11 đạt | 13/13 đạt |
| UI regression mới | 0/2 đạt ở lần chạy đỏ | 2/2 đạt ở lần chạy xanh |
| Lỗi P1/P2 mở | 4 UI ở baseline; thêm 1 lỗi tooling phát hiện trong regression | 0 |
| HTTP local | `/`, `/admin/login`, `/api/menu` trả 200 | Vẫn trả 200 |
| HTTP LAN từ máy phát triển | Chưa ghi nhận ở baseline | `http://192.168.1.13:3000/` trả 200 |

## Lệnh kiểm tra cuối

| Lệnh | Kết quả |
| --- | --- |
| `npm run lint` | Đạt, exit 0 |
| `npm run typecheck` | Đạt, exit 0 |
| `npm test` | Đạt, exit 0; lệnh bao gồm production build |
| `node --test tests/ui-regression.test.mjs` | Đạt 2/2 sau sửa |
| Tìm conflict marker trong source/config/docs | Không phát hiện |
| Tìm `console.log`, `console.debug`, `debugger` trong source | Không phát hiện |

Vinext vẫn in cảnh báo phân loại route do static analysis chưa nhận diện đầy đủ việc dùng `headers()`/`cookies()`; build hoàn tất và không có route nào mất khỏi manifest.

## Luồng khách hàng

| Kịch bản | Kết quả | Bằng chứng |
| --- | --- | --- |
| Loading catalogue | Đạt | Skeleton xuất hiện trước dữ liệu |
| Xem 12 sản phẩm | Đạt | `/api/menu` dùng catalogue nội bộ |
| Tìm kiếm không có kết quả | Đạt | Empty state và nút đặt lại hiển thị |
| Lọc Trà sữa | Đạt | Còn 3 sản phẩm phù hợp |
| Sắp xếp giá tăng dần | Đạt | `Trà Sữa Đường Đen` đứng đầu |
| Validation tùy chọn bắt buộc | Đạt | Summary xuất hiện và focus đúng |
| Giá tùy chọn | Đạt | Size L + topping + số lượng 2 tính 106.000₫ |
| Cart persistence | Đạt | Reload vẫn giữ giỏ trong `localStorage` |
| Tăng/giảm số lượng | Đạt | Tổng cập nhật 145.000₫ → 92.000₫ → 145.000₫ |
| Checkout bỏ trống | Đạt | Lỗi thân thiện, có focus summary |
| Geoapify thiếu key | Đạt | Có error state, không lộ key, vẫn nhập tay được |
| Gợi ý Việt Nam | Đạt bằng integration mock | Lọc `countrycode:vn`, tối đa 5, trả trường tối giản |
| Geoapify empty/failure | Đạt bằng integration mock và runtime thiếu key | Empty/error không khóa nhập thủ công |
| QR mô phỏng | Đạt | Tạo đơn pending/simulation-only; không thành `paid` |
| COD | Đạt bằng integration test | Tạo đơn, xác nhận nội bộ và audit; không tự thu tiền |
| Trang thành công | Đạt | Mã và chi tiết đơn mô phỏng hiển thị |

Không gọi Geoapify thật vì không có `GEOAPIFY_API_KEY`; kết quả hợp lệ Việt Nam được kiểm bằng mock ở ranh giới server, không giả là kiểm thử vendor live.

## Luồng quản trị

| Kịch bản | Kết quả |
| --- | --- |
| Route admin yêu cầu đăng nhập | Đạt |
| Sai thông tin đăng nhập | Thông báo chung, không tiết lộ tài khoản |
| Rate limiting | Đạt automated test |
| Đăng nhập admin local | Đạt với tài khoản QA tạm |
| Dashboard và danh sách đơn | Đạt |
| Tìm/lọc empty state | Đạt |
| Xem chi tiết và đổi pending → preparing | Đạt |
| Audit history | Đạt |
| Drawer mobile, Escape, trả focus | Đạt sau sửa |
| Vùng chạm mobile | Đạt 44px sau sửa |

Tài khoản, phiên và đơn QA tạm đã được xóa khỏi D1 local sau kiểm thử; truy vấn xác minh đều trả số lượng 0. Không thao tác D1 remote.

## Accessibility

- Không thiếu `alt`, tên accessible của button, nhãn form hoặc ID duy nhất trên storefront đã render.
- Thứ bậc heading và landmark chính hợp lệ trong phiên kiểm tra.
- Kiểm tra tính toán contrast cho text trực tiếp trên trang chủ không phát hiện mẫu dưới ngưỡng WCAG AA.
- Focus visible của lựa chọn sản phẩm, focus lỗi checkout và focus drawer admin đã được xác minh bằng bàn phím.
- CSS có hỗ trợ `prefers-reduced-motion`.
- Zoom 200% và screen reader thực tế chưa kiểm tra; có hướng dẫn thủ công riêng.

## Responsive và trình duyệt

- Chromium tương tác: đạt ở 320, 360, 390, 412, 768, 1024, 1366 và 1920 CSS px.
- Sweep 21 chiều rộng từ 320 đến 1920, bước 80px: không overflow ngang storefront.
- Chrome và Edge cài thật, headless: render DOM đạt tại 1366×768 và 1920×1080.
- Firefox, Safari/WebKit và thiết bị vật lý: chưa kiểm tra trực tiếp. Xem `DEVICE_BROWSER_MATRIX.md`.

## Runtime, network và hiệu năng

- Console Chromium cuối: không có error/warning của ứng dụng.
- Dev server khởi động lạnh cuối không còn cảnh báo optimize dependency sau khi thêm `optimizeDeps.exclude`. Cảnh báo renderer từng thấy trong phiên HMR dài không tái hiện ở cold start.
- `/`, `/admin/login`, `/api/menu` và URL LAN đều trả HTTP 200.
- Loading và error UI đã được kiểm; không có công cụ network throttling để xác minh trên Slow 3G.
- Lighthouse không được cài trong môi trường, vì vậy không tạo hoặc suy diễn điểm số.
- Kích thước asset build quan sát: PNG khoảng 6.387.750 byte, JS 487.533 byte, CSS 64.666 byte, font 27.748 byte. Ảnh UI dùng optimizer/lazy loading; vẫn nên đo LCP trên thiết bị thật.

## Secret và cấu hình

- Automated test xác nhận `GEOAPIFY_API_KEY` không xuất hiện trong client bundle.
- `.env*` bị ignore, ngoại trừ `.env.example`; `.env.example` chỉ chứa giá trị rỗng hoặc localhost development.
- Không phát hiện password, token hoặc API key thật trong source được kiểm tra.
