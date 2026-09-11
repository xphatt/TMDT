# Audit trước khi sửa

Ngày kiểm tra: 2026-09-10
Phạm vi: storefront, checkout, API nội bộ, admin, responsive, accessibility, build và dữ liệu local.

## Trạng thái dự án

- Framework: React 19 + TypeScript, Vinext/Vite; server build tương thích Cloudflare Worker.
- Dữ liệu: catalogue nội bộ; giỏ hàng ở `localStorage`; đơn hàng và admin ở D1 local.
- Lệnh chuẩn: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`.
- `D:\TMDT` không phải Git working tree. Bản Git lồng tại `D:\TMDT\repository` đang có thay đổi tài liệu chưa commit và không được chỉnh sửa trong đợt QA này.
- Không có `.env` hoặc `.env.local` tại root; chỉ có `.env.example` không chứa secret.
- Không cài dependency, không thay API contract, schema hoặc cấu hình production.

## Kết quả baseline

| Hạng mục | Kết quả trước sửa | Bằng chứng |
| --- | --- | --- |
| Lint | Đạt | `npm run lint`, exit 0 |
| TypeScript | Đạt | `npm run typecheck`, exit 0 |
| Build | Đạt | `npm run build`, đủ 17 route/API |
| Integration | Đạt 11/11 | `npm test` |
| Runtime storefront | Đạt | `/`, `/api/menu` trả 200 |
| Runtime admin login | Đạt | `/admin/login` trả 200 |
| Console trình duyệt | Đạt | Không có log error/warning của ứng dụng trong Chromium nội bộ |
| Secret scan | Đạt | Test bundle không có `GEOAPIFY_API_KEY`; `.env*` được ignore trừ `.env.example` |

## Ma trận thực thi trước sửa

- Chromium nội bộ: kiểm tra viewport 320, 360, 390, 412, 768, 1024, 1366 và 1920 CSS px; không có horizontal overflow ở storefront.
- Google Chrome headless: render DOM thành công ở 1366×768 và 1920×1080.
- Microsoft Edge headless: render DOM thành công ở 1366×768 và 1920×1080.
- Firefox: không được cài trên máy.
- Safari/WebKit: không có runtime WebKit trên Windows hiện tại.
- Thiết bị vật lý iPhone, Android và iPad: chưa kiểm tra trực tiếp; chỉ mô phỏng viewport.

## Lỗi tái hiện được

| ID | Mức độ | Phạm vi | Bằng chứng trước sửa | Nguyên nhân |
| --- | --- | --- | --- | --- |
| QA-001 | P1 | Chi tiết sản phẩm | Tab bàn phím đặt focus vào radio ẩn 13×13, `opacity: 0`; label 194×69 không có outline | CSS chỉ style `:focus-visible` trên input đã bị ẩn |
| QA-002 | P2 | Checkout | Sau submit form trống, summary xuất hiện nhưng focus vẫn ở nút xác nhận | `focus()` chạy đồng bộ trước khi React render summary |
| QA-003 | P1 | Admin mobile | Menu báo đóng nhưng link “Tổng quan” nằm ngoài màn hình vẫn nhận focus; `aria-controls` trỏ tới ID không tồn tại | Drawer chỉ dùng transform, không đổi visibility/pointer tree; aside thiếu ID |
| QA-004 | P2 | Admin mobile | Link thương hiệu cao 24px và link quay lại cao 20px | Hai action link chưa có chiều cao chạm tối thiểu 44px |
| QA-005 | P3 | Dev server | Vinext báo client dependency được optimize không nhất quán | Cảnh báo từ Vinext beta; chưa gây runtime error và không sửa dependency trong phạm vi này |
| QA-006 | P3 | Giỏ hàng | Việc chuẩn hóa khóa món gọi `sort()` trực tiếp trên state topping | `Array.prototype.sort()` thay đổi chính mảng được React quản lý |
| QA-007 | P2 | Tooling | Sau khi tạo browser profile kiểm thử trong `.wrangler`, lint quét cả mã extension sinh tự động và chạy kéo dài | ESLint global ignore chưa bao gồm `.wrangler`, `.vinext` và `node_modules` |

## Điểm sức khỏe trước sửa

| Dimension | Điểm / 4 | Nhận định |
| --- | ---: | --- |
| Accessibility | 2 | Có semantic, nhãn, contrast và reduced motion tốt; còn hai lỗi focus quan trọng |
| Performance | 3 | Ảnh đi qua image optimizer; không có Lighthouse/throttle để tạo điểm chuẩn |
| Responsive | 3 | Storefront không overflow; admin có drawer focus và hai touch target nhỏ |
| Theming | 4 | Token jade/paper/mandarin nhất quán, không có gradient tím hoặc glassmorphism |
| Implementation integrity | 4 | Luồng và ngôn ngữ đặc thù sản phẩm, API/data/payment seam rõ |
| **Tổng** | **16/20** | **Good — cần sửa focus và mobile admin trước phát hành** |

## Điểm đang làm tốt

- Heading, landmark, form label, alt text và tên accessible đều đầy đủ trên storefront đã render.
- Contrast tự động trên text trực tiếp không phát hiện mẫu dưới ngưỡng WCAG AA.
- Control storefront quan trọng đạt tối thiểu 44px ở các viewport đã đo.
- Loading, empty, address API error, manual address fallback, QR mô phỏng và thành công đơn hàng đều hoạt động.
- Backend tính lại giá, từ chối dữ liệu catalogue lạ và không đánh dấu QR là `paid`.
