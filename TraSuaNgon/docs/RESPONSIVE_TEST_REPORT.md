# Báo cáo kiểm tra responsive và trải nghiệm mua hàng

Ngày kiểm tra: 2026-08-24
Môi trường trực tiếp: Codex In-app Browser, Chromium engine, Windows
URL kiểm tra: `http://localhost:3000`

## Phạm vi

Kiểm tra trang chủ, menu mobile, catalogue, chi tiết sản phẩm, validation tuỳ chọn, giỏ hàng, checkout, địa chỉ, QR mô phỏng và trang đặt hàng thành công. Mỗi viewport được đo `documentElement.scrollWidth` so với `clientWidth`, đồng thời quét các control đang hiển thị có vùng bấm nhỏ hơn 44×44px.

## Kết quả viewport

| Nhóm | Kích thước kiểm tra | Tràn ngang | Touch target hiển thị | Kết quả |
| --- | --- | --- | --- | --- |
| Mobile nhỏ | 320×568 | Không | Không có control dưới 44px | Đạt |
| Mobile | 360×800 | Không | Không có control dưới 44px | Đạt |
| Mobile | 375×812 | Không | Không có control dưới 44px | Đạt |
| Mobile | 390×844 | Không | Không có control dưới 44px | Đạt |
| Mobile lớn | 412×915 | Không | Không có control dưới 44px | Đạt |
| Mobile lớn | 430×932 | Không | Không có control dưới 44px | Đạt |
| Tablet dọc | 768×1024 | Không | Không có control dưới 44px | Đạt |
| Tablet dọc | 820×1180 | Không | Không có control dưới 44px | Đạt |
| Tablet lớn dọc | 1024×1366 | Không | Không có control dưới 44px | Đạt |
| Tablet ngang | 1024×768 | Không | Không có control dưới 44px | Đạt |
| Tablet lớn ngang | 1366×1024 | Không | Không có control dưới 44px | Đạt |
| Laptop | 1280×800 | Không | Không có control dưới 44px | Đạt |
| Laptop | 1366×768 | Không | Không có control dưới 44px | Đạt |
| Desktop | 1440×900 | Không | Không có control dưới 44px | Đạt |
| Desktop | 1536×864 | Không | Không có control dưới 44px | Đạt |
| Desktop lớn | 1920×1080 | Không | Không có control dưới 44px | Đạt |

Radio thanh toán native có kích thước hình vẽ 20×20px nhưng toàn bộ `label` tương ứng là vùng bấm 355px rộng và 77–96px cao ở viewport 390px; vì vậy thao tác chạm thực tế đạt yêu cầu.

## Luồng mua hàng đã kiểm tra

1. Mở catalogue từ CTA `Đặt ngay` trên mobile.
2. Mở `Trà Sữa Đường Đen`; bấm thêm khi chưa chọn và nhận đủ ba lỗi size, đường, đá.
3. Chọn size L, 50% đường, ít đá và trân châu trắng; giá cập nhật từ 39.000đ lên 54.000đ.
4. Thêm giỏ; tùy chọn, topping, số lượng và giá hiển thị đúng.
5. Mở checkout; submit rỗng hiển thị validation summary và giữ dữ liệu.
6. Nhập địa chỉ khi không có `GEOAPIFY_API_KEY`; UI hiển thị lỗi cấu hình thân thiện và vẫn cho nhập thủ công.
7. Chọn `Chuyển khoản/QR mô phỏng`; QR và cảnh báo không thanh toán thật hiển thị đúng.
8. Tạo đơn `pending`, xác nhận nội bộ và hiển thị trang thành công; tổng mẫu 72.000đ gồm 54.000đ tiền món và 18.000đ phí giao hàng.
9. Cart trở về 0 sau thành công; console không ghi nhận warning hoặc error.
10. Menu mobile tại 320px mở đúng, `aria-expanded=true`, không gây tràn ngang.

## Accessibility và hành vi mobile

- Viewport có `viewport-fit=cover`; layout, footer và toast sử dụng safe-area inset.
- Input và textarea checkout render ở 16px, tránh zoom tự động trên iOS.
- Focus ring dùng `:focus-visible`; form có label hiển thị và lỗi liên kết bằng ARIA.
- `prefers-reduced-motion: reduce` tắt animation/transition và smooth scrolling.
- Ảnh sản phẩm có `sizes`, alt text; ảnh trang trí có alt rỗng.
- Không dùng `h-screen`; layout dùng chiều cao nội dung và `100dvh` cho min-height tổng.

## Lỗi tìm thấy và đã sửa

- `min-width: 320px` trên `html/body` tạo tràn 15px khi scrollbar Chromium chiếm chỗ tại viewport 320px; đã gỡ và kiểm tra lại đạt.
- Wordmark, nút tên sản phẩm và wordmark footer có chiều cao vùng bấm dưới 44px; đã đặt min-height/display phù hợp và kiểm tra lại đạt.
- Một số control trạng thái/footer còn 34–42px; đã đồng nhất tối thiểu 44px.
- Vinext beta bỏ qua `viewportFit` trong Metadata API; thẻ viewport được chuyển sang markup `<head>` tiêu chuẩn và có integration test bảo vệ.

## Môi trường chưa thể kiểm tra trực tiếp

Firefox, Safari, Edge và Chrome độc lập không có trong phiên kiểm thử này nên chưa được xác nhận trực tiếp. Source chỉ dùng HTML/CSS/Web API tiêu chuẩn và có fallback safe-area, nhưng nhóm nên chạy smoke test thủ công trên Safari iOS/macOS, Firefox và Edge trước khi phát hành production.
