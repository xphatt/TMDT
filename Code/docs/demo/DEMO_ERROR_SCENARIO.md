# Demo lỗi kết nối khi đặt hàng

## Mục tiêu

Trình diễn cách website xử lý một lỗi kết nối tạm thời mà không mất giỏ hàng, không xóa dữ liệu form, không thu tiền và không tạo đơn trùng. Kịch bản chỉ hoạt động trong development/test.

## Bật kịch bản

Trong PowerShell tại `D:\TMDT`:

```powershell
$env:DEMO_MODE='true'
$env:DEMO_ERROR_SCENARIO='checkout_timeout'
npm run dev
```

Hoặc đặt hai biến này trong `.env.local`. Không commit `.env.local`.

## Tắt kịch bản

Dừng dev server do bạn đang chạy, xóa hai biến khỏi shell/`.env.local`, rồi chạy lại:

```powershell
Remove-Item Env:DEMO_MODE -ErrorAction SilentlyContinue
Remove-Item Env:DEMO_ERROR_SCENARIO -ErrorAction SilentlyContinue
npm run dev
```

Giá trị mặc định trong `.env.example` là `DEMO_MODE=false`. Production bundle kiểm tra `import.meta.env.DEV` và luôn bỏ qua tình huống demo.

## Các bước trình diễn

1. Chọn một món, cấu hình size/đường/đá/topping và thêm vào giỏ.
2. Mở checkout, nhập họ tên, số điện thoại Việt Nam và địa chỉ hợp lệ.
3. Bấm **Xác nhận đơn**.
4. Lần đầu với request ID này, API trả HTTP 503 và giao diện hiển thị: “Không thể gửi đơn hàng lúc này. Vui lòng kiểm tra kết nối và thử lại.”
5. Chỉ vào phần form và biểu tượng giỏ để chứng minh dữ liệu vẫn còn; nút **Thử lại** xuất hiện ngay trong khối lỗi.
6. Bấm **Thử lại**. Cùng request ID được dùng lại; handler demo chỉ lỗi một lần nên đơn được tạo và xác nhận nội bộ.
7. Trang thành công hiện mã đơn; giỏ hàng về 0.

## Kết quả mong đợi

- Lần đầu trả 503, không tạo order và không đánh dấu thanh toán thành công.
- Form, lựa chọn thanh toán và cart React/localStorage không bị reset.
- Retry gửi cùng `clientRequestId`.
- Unique index `orders.idempotency_key` và repository lookup bảo đảm nhiều lần retry vẫn quy về một đơn.
- QR vẫn là `simulation_only`; COD chưa được đánh dấu đã thu tiền.

## Bằng chứng phiên kiểm thử 13/09/2026

| Trạng thái | Quan sát thực tế |
|---|---|
| Lỗi | Chromium mobile 390×844 hiển thị đúng câu lỗi, nút **Thử lại**, họ tên `Nguyễn Demo`, địa chỉ nhập tay và cart vẫn có 1 món; không tràn ngang. |
| Retry thành công | Cùng màn hình tạo đơn `TSN86800637BB7`, tổng mẫu 55.000đ, COD, giỏ hàng 0; không có giao dịch thật. |
| Dữ liệu | Query D1 local theo idempotency key trả `order_count = 1`. |

Hai ảnh chụp viewport của trạng thái lỗi và thành công đã được ghi nhận trực tiếp trong phiên kiểm thử bằng browser connector của Codex. Connector hiện tại hiển thị ảnh trong task nhưng không cung cấp đường dẫn xuất file nhị phân vào repository; vì vậy tài liệu không tạo đường dẫn ảnh giả hoặc dùng ảnh dàn dựng. Khi cần nộp ảnh rời, chạy lại bảy bước trên và dùng công cụ chụp màn hình của hệ điều hành để lưu vào `docs/demo/evidence/`.

## Câu thuyết trình ngắn

> “Đây là lỗi 503 có kiểm soát chỉ bật trong development. Giao diện giữ nguyên dữ liệu để khách thử lại, còn backend dùng request ID duy nhất nên dù người dùng bấm lại nhiều lần cũng chỉ có một đơn. Production bỏ qua hoàn toàn cờ demo và website không thực hiện thanh toán thật.”

