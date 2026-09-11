# Tóm tắt sửa lỗi

Ngày hoàn tất: 2026-09-10

## Thay đổi mã nguồn

| File | Thay đổi | Kết quả |
| --- | --- | --- |
| `app/globals.css` | Chuyển focus-visible từ radio ẩn sang label lựa chọn nhìn thấy | Người dùng bàn phím thấy rõ size/đường/đá/topping đang focus |
| `app/components/TeaShop.tsx` | Đợi React render trước khi focus summary; sort bản sao topping | Validation có focus đúng; không mutate state |
| `app/admin/components/AdminShell.tsx` | Bổ sung ID drawer, refs, focus khi mở, Escape/close trả focus | `aria-controls` hợp lệ và navigation bàn phím nhất quán |
| `app/admin/admin.css` | Drawer đóng dùng visibility/pointer state; link mobile tối thiểu 44px | Link ngoài màn hình không còn focusable; thao tác touch rõ hơn |
| `eslint.config.mjs` | Ignore `.vinext`, `.wrangler`, `node_modules` | Lint không quét build/cache/browser profile |
| `vite.config.ts` | Không pre-bundle client shim Vinext bị dùng qua nhiều môi trường | Cold-start dev server không còn cảnh báo optimize không nhất quán |
| `.gitignore` | Ignore Python cache và TypeScript build info | Giảm nguy cơ đưa cache máy cá nhân vào gói/Git |
| `package.json` | Chạy thêm UI regression test trong `npm test` | Regression được kiểm cùng build/integration |
| `tests/ui-regression.test.mjs` | Thêm contract test cho focus, drawer, vùng chạm và state bất biến | 2/2 test đạt sau sửa |

## Tài liệu tạo mới

- `docs/qa/AUDIT_BEFORE_FIX.md`
- `docs/qa/DEVICE_BROWSER_MATRIX.md`
- `docs/qa/BUG_REPORT.md`
- `docs/qa/TEST_RESULTS.md`
- `docs/qa/FIX_SUMMARY.md`
- `docs/qa/MANUAL_DEVICE_TEST.md`

## So sánh hành vi

| Hành vi | Trước | Sau |
| --- | --- | --- |
| Radio tùy chọn nhận focus | Outline nằm trên input ẩn | Outline bao quanh ô lựa chọn |
| Checkout lỗi | Focus ở nút submit | Focus vào summary `role="alert"` |
| Admin drawer đóng | Link off-screen vẫn nhận Tab | Drawer rời accessibility/pointer tree |
| Admin drawer mở/đóng | Không quản lý focus | Mở vào link đầu; Escape/đóng trả về nút menu |
| Link admin mobile | 20–24px | 44px |
| Chuẩn hóa topping | Mutate state bằng `sort()` | Sort bản sao |
| Lint có browser profile | Quét `.wrangler` | Bỏ qua output/cache |

## Điểm sức khỏe sau sửa

| Dimension | Điểm / 4 | Nhận định |
| --- | ---: | --- |
| Accessibility | 4 | Các lỗi focus/touch đã đóng; screen reader và zoom vật lý còn là bước manual |
| Performance | 3 | Build gọn về JS/CSS nhưng ảnh nguồn còn lớn; chưa có Lighthouse/throttle |
| Responsive | 4 | Không overflow trong ma trận Chromium và sweep 320–1920 |
| Theming | 4 | Giữ nguyên nhận diện jade/paper/mandarin |
| Implementation integrity | 4 | Không đổi API/schema/business rule; thêm regression coverage |
| **Tổng** | **19/20** | **Strong — còn xác nhận đa trình duyệt/thiết bị thật và đo hiệu năng** |

## Giới hạn được giữ nguyên

- Không đổi API contract, schema D1, catalogue, giá, quy tắc trạng thái hoặc luồng thanh toán.
- Không cài/nâng dependency.
- Không thêm cổng thanh toán thật, không đánh dấu QR mô phỏng là `paid`.
- Không thay firewall, DNS, hosting hoặc production data.
- Không commit, push hoặc deploy.

## Việc cần theo dõi

1. Chạy Safari/WebKit, Firefox, screen reader, zoom 200% và Slow 3G theo checklist thủ công.
2. Đo Lighthouse trên build production khi công cụ có sẵn; ưu tiên LCP và ảnh hero/product.
3. Theo dõi cảnh báo renderer nếu tái xuất hiện trong phiên HMR dài; chỉ nâng Vinext sau khi nhóm duyệt dependency change.
4. Đồng bộ lại design sidecar với `DESIGN.md` nếu nhóm muốn biến các advisory token thành quy tắc bắt buộc.
