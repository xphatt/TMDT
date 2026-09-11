# Báo cáo lỗi

Ngày kiểm tra: 2026-09-10

| ID | Thiết bị/Trình duyệt | Bước tái hiện | Kết quả thực tế | Kết quả mong đợi | Mức độ | Nguyên nhân | File đã sửa | Trạng thái |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| QA-001 | 360×800, Chromium, bàn phím | Mở chi tiết món, nhấn Tab đến nhóm size/đường/đá | Focus nằm trên radio ẩn 13×13; ô lựa chọn nhìn thấy không có outline | Toàn bộ ô lựa chọn đang focus có viền rõ, đạt yêu cầu bàn phím | P1 | CSS chỉ áp dụng focus cho input đã ẩn | `app/globals.css`, `tests/ui-regression.test.mjs` | Đã sửa và xác minh trình duyệt |
| QA-002 | 360×800, Chromium | Vào checkout, để trống trường bắt buộc, nhấn xác nhận | Tóm tắt lỗi xuất hiện nhưng focus vẫn ở nút submit | Focus chuyển tới tóm tắt lỗi sau khi React render | P2 | `focus()` chạy đồng bộ trước khi phần tử lỗi tồn tại | `app/components/TeaShop.tsx`, `tests/ui-regression.test.mjs` | Đã sửa và xác minh trình duyệt |
| QA-003 | 360×800, Chromium, bàn phím/screen-reader tree | Đóng drawer admin rồi nhấn Tab | Link ngoài màn hình vẫn nhận focus; `aria-controls` trỏ ID không tồn tại | Drawer đóng không nằm trong accessibility/pointer tree; mở/đóng quản lý focus đúng | P1 | Drawer chỉ translate; thiếu visibility, pointer state, ID và focus management | `app/admin/components/AdminShell.tsx`, `app/admin/admin.css`, `tests/ui-regression.test.mjs` | Đã sửa và xác minh trình duyệt |
| QA-004 | 360×800, Chromium, touch emulation | Đo link “TSN Admin” và “Về cửa hàng” | Chiều cao lần lượt 24px và 20px | Vùng chạm tối thiểu 44px | P2 | Link chưa có min-height và căn giữa nội dung | `app/admin/admin.css`, `tests/ui-regression.test.mjs` | Đã sửa; hai vùng chạm đo được 44px |
| QA-005 | Dev server, Windows | Chạy `npm run dev`, gọi `/api/menu` | Vinext cảnh báo dependency client được optimize không nhất quán | Dev server không cảnh báo | P3 | Client shim bị pre-bundle không đồng nhất giữa các môi trường Vite/RSC | `vite.config.ts` | Đã sửa; khởi động lạnh và gọi route không còn cảnh báo |
| QA-006 | Mọi thiết bị, static review | Thêm món có nhiều topping | Chưa tái hiện lỗi giao diện, nhưng `sort()` có thể thay đổi trực tiếp mảng state | Chuẩn hóa khóa trên bản sao bất biến | P3 | Dùng `selectedToppings.sort()` trên state React | `app/components/TeaShop.tsx`, `tests/ui-regression.test.mjs` | Đã sửa và kiểm tra |
| QA-007 | Tooling, Windows | Tạo profile browser QA trong `.wrangler`, chạy lint | ESLint quét mã extension sinh tự động, phát cảnh báo Babel và chạy kéo dài | Lint chỉ quét source được quản lý | P2 | Thiếu global ignore cho output/cache | `eslint.config.mjs` | Đã sửa; lint lại exit 0 trong 19 giây cùng typecheck |
| QA-008 | Dev HMR dài, Chromium nội bộ | Sửa nóng nhiều file UI trong khi nhiều renderer QA đang mở | Log server từng báo `multiple renderers concurrently rendering the same context provider` | HMR không phát cảnh báo renderer | P3 | Chỉ xuất hiện trong phiên Vinext HMR dài; không tái hiện sau khởi động lạnh | Không sửa riêng | Theo dõi; cold start, build và test đều sạch |

## Vấn đề chưa đóng

- QA-008 chưa tái hiện trên khởi động lạnh sau khi cập nhật cấu hình optimize; không nâng Vinext trong đợt này vì đó là thay dependency cần nhóm duyệt.
- Ảnh PNG nguồn có tổng dung lượng khoảng 6,39 MB; giao diện dùng image optimizer và lazy loading, nhưng cần đo Lighthouse/throttled network trên môi trường có công cụ trước khi chốt ngân sách hiệu năng.
- Bộ dò `impeccable` báo 155 advisory: 73 cỡ chữ, 63 màu, 18 bán kính và 1 grid background chưa được ghi đầy đủ trong design sidecar. Đây là drift tài liệu/tokens đã tồn tại, không phải lỗi runtime; không đại tu nhận diện trong vòng sửa lỗi tối thiểu này.
