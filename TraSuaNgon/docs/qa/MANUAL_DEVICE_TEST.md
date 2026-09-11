# Hướng dẫn kiểm thử thiết bị thật

Checklist này dành cho điện thoại, tablet, Safari/WebKit và Firefox chưa có trong môi trường QA tự động.

## 1. Chuẩn bị local

Yêu cầu Node.js từ `22.13.0`, máy phát triển và thiết bị cùng mạng Wi-Fi riêng đáng tin cậy.

```powershell
cd TraSuaNgon
npm ci
Copy-Item .env.example .env.local
npm run db:migrate:local
npm run dev
```

- Giữ `SITE_URL=http://localhost:3000` cho development.
- `GEOAPIFY_API_KEY` có thể để trống để kiểm fallback nhập tay. Nếu kiểm API thật, chỉ đặt key trong `.env.local`, không chụp màn hình/log giá trị và không commit.
- Terminal sẽ in `Local` và `Network`, ví dụ `http://192.168.1.13:3000/`.
- Trên điện thoại dùng URL `Network`, không dùng `localhost` vì nó trỏ về chính điện thoại.
- Nếu Windows hỏi quyền, người dùng tự cho phép Node.js trên **Private network**. Không bật Public network, không port-forward router và không mở dev server ra Internet.

## 2. Ma trận cần chạy

| Thiết bị/runtime | Viewport tham chiếu | Trình duyệt |
| --- | --- | --- |
| Android nhỏ | 360×800 | Chrome |
| iPhone hiện đại | 390×844 | Safari |
| Android lớn | 412×915 | Chrome/Edge |
| iPad portrait | 768×1024 | Safari |
| iPad landscape | 1024×768 | Safari |
| Laptop | 1366×768 | Chrome, Edge, Firefox |
| Desktop | 1920×1080 | Chrome, Edge, Firefox |

Ngoài các mốc trên, kéo liên tục chiều rộng từ 320 đến 1920px trong DevTools để tìm breakpoint nhảy, text bị cắt hoặc overflow ngang.

## 3. Checklist storefront

1. Mở trang chủ; xác nhận hero, logo, ảnh, CTA và menu mobile không nhảy layout bất thường.
2. Nhấn `Đặt ngay`; tìm một tên có kết quả và một tên không tồn tại.
3. Lọc từng danh mục; sắp xếp phổ biến, giá tăng và giá giảm.
4. Mở sản phẩm; thử thêm khi chưa chọn size/đường/đá và kiểm focus/announcement lỗi.
5. Chọn nhiều topping, đổi size, tăng số lượng; đối chiếu giá hiển thị và giá trong cart.
6. Reload; xác nhận cart còn trong `localStorage`.
7. Tăng, giảm và xóa từng dòng; kiểm empty state và CTA quay lại menu.
8. Checkout bỏ trống; kiểm lỗi đặt gần field và summary nhận focus.
9. Gõ địa chỉ nhanh liên tục; kiểm debounce, loading, empty, error và lựa chọn gợi ý.
10. Tắt mạng hoặc để key trống; xác nhận vẫn nhập địa chỉ tay và không mất dữ liệu form.
11. Đặt COD; xác nhận trang thành công, mã đơn và tổng tiền.
12. Đặt QR mô phỏng; xác nhận có nhãn mô phỏng và đơn không được hiển thị là đã thanh toán.

## 4. Checklist admin

Tạo admin local nếu chưa có:

```powershell
npm run admin:create
```

Script nhập mật khẩu ẩn và chỉ làm việc với D1 local.

1. Mở `/admin/login`; thử sai một lần, sau đó đăng nhập đúng.
2. Trên mobile, mở drawer: focus phải vào `Tổng quan`; nhấn Escape: drawer đóng và focus về nút menu.
3. Khi drawer đóng, Tab không được đi vào link ngoài màn hình.
4. Kiểm dashboard, danh sách đơn, tìm kiếm, lọc không có kết quả và reset.
5. Mở chi tiết đơn; thử transition hợp lệ. Không sửa dữ liệu production.
6. Với COD, chỉ xác nhận thu tiền khi nghiệp vụ thực tế cho phép; QR mô phỏng không được chuyển sang `paid`.
7. Kiểm audit history hiển thị người thao tác, thời gian và trạng thái trước/sau.

## 5. Accessibility thủ công

- Chỉ dùng bàn phím: Tab, Shift+Tab, Enter, Space, Escape; không được mắc kẹt focus.
- Bật zoom trình duyệt 200%; nội dung vẫn đọc được, không cần cuộn ngang ở viewport 320px.
- Bật `Reduce motion` của hệ điều hành; chuyển động không được gây cản trở.
- Chạy VoiceOver trên iOS/macOS hoặc NVDA trên Windows: landmark, heading, nhãn field, lỗi và trạng thái menu phải được đọc đúng.
- Kiểm high contrast/forced colors nếu trình duyệt hỗ trợ.
- Đảm bảo mọi action touch quan trọng có vùng chạm xấp xỉ tối thiểu 44×44px.

## 6. Hiệu năng và mạng yếu

1. Build bằng `npm run build`, sau đó dùng môi trường preview production phù hợp của project nếu nhóm có quy trình nội bộ.
2. Trong DevTools chọn Slow 3G và Disable cache; reload ba lần.
3. Ghi lại LCP, CLS, INP/TBT và request ảnh lớn. Không báo điểm Lighthouse nếu run thất bại.
4. Xác nhận skeleton/loading xuất hiện, lỗi mạng có nội dung dễ hiểu và retry/reload không làm nhân đôi đơn.

## 7. Mẫu ghi lỗi

```text
Thiết bị / OS / trình duyệt phiên bản:
Kích thước hoặc orientation:
URL và thời gian:
Bước tái hiện:
Kết quả thực tế:
Kết quả mong đợi:
Ảnh/video/console/network:
Mức độ P0/P1/P2/P3:
```

Kết thúc phiên bằng `Ctrl+C` trong terminal chạy dev server. Không commit `.env.local`, `.wrangler`, `dist`, `.next`, `.vinext`, log hoặc profile trình duyệt.
