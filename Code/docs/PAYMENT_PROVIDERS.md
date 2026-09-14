# Payment Providers

Checkout hiện chỉ hỗ trợ `cash` và `bank` mô phỏng. Không provider nào tạo giao dịch hoặc đánh dấu đơn là `paid`.

## Seam hiện tại

`app/server/payments/payment-provider.ts` định nghĩa `PaymentProvider` với hai bước:

1. `prepare(orderId)` tạo hướng dẫn thanh toán an toàn cho một đơn `pending`.
2. `confirmSimulation(instruction)` xác nhận luồng nội bộ mà không xác nhận tiền thật.

Adapter hiện có:

- `cash_on_delivery`: `paymentStatus` luôn là `unpaid`.
- `mock_qr`: `paymentStatus` luôn là `simulation_only`.

Order service tự tính lại giá từ `app/data`, tạo đơn `pending`, rồi endpoint confirm chuyển order thành `confirmed`. Order status và payment status là hai state machine độc lập.

`app/server/payments/online-payment.ts` bổ sung seam dùng chung cho thanh toán online:

- `OnlinePaymentGateway.prepare()` chỉ nhận số tiền nguyên VND đã được server tính.
- `OnlinePaymentGateway.verifyWebhook()` phải xác minh raw payload và chữ ký theo tài liệu chính thức của provider.
- `applyVerifiedPaymentEvent()` từ chối chữ ký sai, order/reference/transaction không khớp, sai tiền, sai tiền tệ và callback đến sai thứ tự.
- Event ID đã xử lý được xem là callback trùng và không ghi nhận tiền lần hai.
- Trạng thái `paid` không thể bị hạ bởi callback đến muộn; `failed`, `cancelled`, `expired` chỉ cho phép tạo một attempt mới khi người dùng thử lại.
- Return/redirect của trình duyệt không đi qua hàm cập nhật trạng thái; trang kết quả sau này phải đọc attempt từ server.

Migration `0002_online_payment_foundation.sql` tạo hai bảng dùng chung:

- `payment_attempts`: gắn attempt với order, provider, môi trường, số tiền VND, merchant reference, provider transaction và trạng thái.
- `payment_webhook_events`: chỉ lưu hash payload và kết quả xử lý; không lưu raw body nhạy cảm. Unique provider/event ID chống xử lý trùng.

Các bảng này chưa được route production sử dụng cho tới khi có provider sandbox cụ thể.

## Tách môi trường

Adapter được chọn phải mặc định `sandbox` trong local/staging và từ chối chạy nếu cấu hình không đầy đủ. Production phải dùng bộ credential riêng trong secret store của Cloudflare, hostname HTTPS cố định và webhook public. Không dùng credential sandbox ở production hoặc ngược lại.

Tên biến môi trường cụ thể chỉ được thêm sau khi chọn provider và đối chiếu tài liệu chính thức hiện hành. Giá trị secret không được ghi vào `.env.example`, source, log hoặc trao đổi trong chat.

## Cần xác nhận trước khi tích hợp thật

- Nhà cung cấp và môi trường sandbox được chọn.
- Merchant ID, secret, certificate hoặc public key được cấp chính thức.
- Return URL, IPN/webhook URL và domain production cố định.
- Quy tắc hết hạn, huỷ, retry, hoàn tiền và đối soát.
- Database bền vững cho order, payment attempt và webhook event (schema local đã chuẩn bị; D1 remote chưa tạo).
- Chính sách idempotency, audit log và bảo vệ dữ liệu khách hàng.

## Thêm VNPay, MoMo hoặc ZaloPay

1. Tạo adapter mới implement `PaymentProvider`; không đặt SDK hoặc secret trong component React.
2. Mở rộng payment method bằng migration và API version có kế hoạch, không sửa ngầm contract đang chạy.
3. Tạo payment attempt ở backend và gửi frontend duy nhất URL hoặc payload công khai cần thiết.
4. Xác minh chữ ký callback hoặc webhook ở backend bằng raw payload theo tài liệu chính thức của provider.
5. Dùng idempotency key theo order và provider transaction ID để chống callback lặp.
6. Chỉ chuyển `paymentStatus` sang `paid` sau khi backend xác minh callback thành công; không tin return URL từ trình duyệt.
7. Giữ order `pending` hoặc `confirmed` tách biệt payment status để xử lý COD, timeout và thanh toán thất bại rõ ràng.
8. Lưu secret trong runtime environment của nền tảng, không đưa vào `.env.example`, log, response hoặc frontend bundle.

Không thêm SDK cho đến khi provider, account sandbox, API contract và yêu cầu nghiệp vụ đã được xác nhận.
