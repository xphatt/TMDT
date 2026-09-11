# Ma trận thiết bị và trình duyệt

Ngày kiểm tra: 2026-09-10
URL: `http://localhost:3000` và URL LAN do Vite in trong terminal.

## Cách đọc kết quả

- **Thực tế tương tác**: mở trang, thao tác luồng và đo layout trong Chromium của Codex.
- **Thực tế smoke**: dùng binary Chrome/Edge cài trên Windows ở chế độ headless để xác nhận DOM render; không thay thế kiểm thử tương tác đầy đủ.
- **Mô phỏng viewport**: thay đổi kích thước CSS pixel trên máy tính; không phải thiết bị vật lý.
- **Chưa kiểm tra**: runtime hoặc thiết bị không có trong môi trường hiện tại. Không suy diễn kết quả.

## Ma trận bắt buộc

| Kích thước | Trình duyệt yêu cầu | Môi trường thực tế | Phạm vi | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 360×800 | Chromium/WebKit | Chromium tương tác, viewport mô phỏng | Storefront, menu, sản phẩm, cart, checkout, admin login/drawer/orders | Đạt trên Chromium | WebKit chưa có runtime |
| 390×844 | WebKit/Safari emulation | Chromium tương tác, viewport mô phỏng | Storefront và admin responsive | Đạt tương đương layout trên Chromium | Safari/WebKit chưa kiểm tra |
| 412×915 | Chromium | Chromium tương tác, viewport mô phỏng | Storefront và admin responsive | Đạt | Không overflow ngang |
| 768×1024 | WebKit | Chromium tương tác, viewport mô phỏng | Tablet portrait | Đạt tương đương layout trên Chromium | WebKit chưa kiểm tra |
| 1024×768 | WebKit | Chromium tương tác, viewport mô phỏng | Tablet landscape/admin breakpoint | Đạt tương đương layout trên Chromium | Sidebar admin hiển thị đúng ở desktop breakpoint; WebKit chưa kiểm tra |
| 1366×768 | Chrome | Chrome cài thật, headless | Render DOM storefront | Đạt smoke | Có thương hiệu và landmark `main` |
| 1366×768 | Edge | Edge cài thật, headless | Render DOM storefront | Đạt smoke | Có thương hiệu và landmark `main` |
| 1366×768 | Firefox | Không có Firefox | — | Chưa kiểm tra | Cần kiểm tra thủ công |
| 1920×1080 | Chrome | Chrome cài thật, headless | Render DOM storefront | Đạt smoke | Có thương hiệu và landmark `main` |
| 1920×1080 | Edge | Edge cài thật, headless | Render DOM storefront | Đạt smoke | Có thương hiệu và landmark `main` |
| 1920×1080 | Firefox | Không có Firefox | — | Chưa kiểm tra | Cần kiểm tra thủ công |

## Kiểm tra bổ sung

| Phạm vi | Kết quả |
| --- | --- |
| Storefront tại 320, 360, 390, 412, 768, 1024, 1366, 1920 CSS px | Không overflow ngang; control chính dùng được bằng touch |
| Admin tại 360, 390, 412, 768 CSS px | Drawer đóng được loại khỏi accessibility tree; mở drawer chuyển focus vào điều hướng |
| Admin tại 1024, 1366, 1920 CSS px | Sidebar hiển thị; không overflow ngang |
| Sweep liên tục 320–1920, bước 80px (21 kích thước) | Không phát hiện overflow ngang trên storefront |
| LAN `http://192.168.1.13:3000/` trong phiên kiểm tra | HTTP 200 từ máy phát triển |
| iPhone/Android/iPad vật lý | Chưa kiểm tra |
| Safari/macOS, Safari/iOS, Firefox | Chưa có môi trường để kiểm tra trực tiếp |

## Kết luận

Responsive và các breakpoint chính đạt trên Chromium; Chrome và Edge render được ở hai kích thước desktop. Trước khi phát hành, nhóm vẫn cần chạy checklist trong `MANUAL_DEVICE_TEST.md` trên Safari/WebKit, Firefox và ít nhất một điện thoại cùng một iPad vật lý.
