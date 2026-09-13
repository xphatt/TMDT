# Ghi nhận kiểm thử runtime

- Thời điểm: 2026-09-13 (Asia/Saigon)
- Môi trường: Codex in-app browser (Chromium), development server Vinext tại `http://localhost:3000`.
- Đây là giả lập viewport trên máy Windows, không phải thiết bị vật lý.
- Không gửi đơn hàng, không đăng nhập bằng tài khoản thật và không thay đổi D1. Luồng ghi đơn được kiểm tra bằng repository bộ nhớ trong test tự động.

## Responsive storefront

Do Windows host scale 120%, viewport override được hiệu chỉnh để `window.innerWidth`/`window.innerHeight` khớp CSS pixel mục tiêu. Sai số duy nhất là iPhone cao 845 px thay vì 844 px.

| Thiết bị | CSS viewport đo được | Cuộn ngang | Menu phù hợp breakpoint | Target nhỏ trên trang chủ | Ảnh đang nhìn thấy bị lỗi |
| --- | ---: | --- | --- | ---: | ---: |
| Mobile nhỏ | 320×568 | Không | Menu mobile | 0 | 0 |
| Android | 360×800 | Không | Menu mobile | 0 | 0 |
| iPhone | 390×845 | Không | Menu mobile | 0 | 0 |
| Mobile lớn | 412×915 | Không | Menu mobile | 0 | 0 |
| iPad dọc | 768×1024 | Không | Menu mobile do scrollbar làm vùng layout dưới breakpoint | 0 | 0 |
| iPad ngang | 1024×768 | Không | Điều hướng desktop | 0 | 0 |
| Laptop | 1366×768 | Không | Điều hướng desktop | 0 | 0 |
| Desktop | 1920×1080 | Không | Điều hướng desktop | 0 | 0 |

Checkout tại 320×568: `innerWidth=320`, `scrollWidth=302`, không cuộn ngang; form rộng 282 px và nút xác nhận hiện diện. Hai radio 20×20 px nằm trong label có vùng chạm 295×77 và 295×96 px. Trang `/admin/login` không cuộn ngang, không cắt chữ và có form ở 320×568, 768×1024 và 1366×768.

## Luồng chức năng đã thao tác

| Kiểm tra | Kết quả runtime |
| --- | --- |
| Tìm `ĐƯỜNG ĐEN` | 1 kết quả: Trà Sữa Đường Đen; không phân biệt hoa thường. |
| Tìm `@#$` | 0 kết quả và hiện empty state “Chưa tìm thấy món phù hợp”. |
| Từ khóa trống | 12 món sau khi xóa giá trị bằng bàn phím. |
| Lọc Trà sữa + tìm `oolong` | 1 kết quả: Trà Sữa Oolong Nướng. |
| Sắp xếp giá tăng | Bốn giá đầu: 7.000, 7.000, 9.000, 38.000 đồng. |
| Sắp xếp giá giảm | Bốn giá đầu: 46.000, 45.000, 44.000, 43.000 đồng; select hiển thị `price-desc`. |
| Thêm món khi thiếu tùy chọn | Hiện ba lỗi size, đường và đá; focus chuyển vào summary lỗi. |
| Tính giá món | Oolong 42.000 + size L 7.000 + trân châu 7.000 = 56.000; số lượng 2 = 112.000 đồng. |
| Giỏ hàng | Tổng 39.000 + 112.000 = 151.000 đồng; tăng món 39.000 từ 1 lên 2 làm tổng thành 190.000 đồng; giảm lại về 151.000 đồng. |
| Refresh | Snapshot SSR ban đầu hiện 0, sau hydration giỏ khôi phục đúng 3 đơn vị và 151.000 đồng. |
| Checkout | Phí giao hàng mẫu 18.000, tổng 169.000; submit rỗng hiện lỗi họ tên, số điện thoại, địa chỉ. |
| Geoapify thiếu key | Sau debounce hiện “Gợi ý địa chỉ chưa được cấu hình. Bạn vẫn có thể nhập địa chỉ thủ công.” |
| Admin không đăng nhập | `/admin` chuyển 307 đến `/admin/login?returnTo=%2Fadmin`; API dashboard trả 401. |
| Console | Không ghi nhận warning/error trên trang đăng nhập admin trong lượt kiểm thử. |

## Giới hạn runtime

- Không kiểm thử trên thiết bị vật lý.
- Không có phiên Firefox, Safari/WebKit hoặc Edge trong lượt audit; chỉ Chromium giả lập.
- Không thử đăng nhập thật để tránh thay đổi số lần đăng nhập D1; test xác thực dùng repository/binding thử nghiệm của bộ test.
- Không gửi checkout để tránh ghi dữ liệu vào D1; việc tạo/xác nhận đơn được xác minh bằng test `order API recalculates internal prices and confirms without paid status`.
- Không thể kiểm thử gợi ý Geoapify thật vì `GEOAPIFY_API_KEY` chưa cấu hình; trạng thái thiếu cấu hình và fallback nhập tay đã được xác minh.
- Ảnh chụp storefront mobile và admin mobile đã được quan sát trực tiếp trong phiên computer-use; API hiện tại không cung cấp đường dẫn lưu ảnh vào repository, nên bằng chứng tái lập dùng bảng đo DOM ở trên và các log HTTP trong cùng thư mục.
