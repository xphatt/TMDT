# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 và TypeScript trên starter Sites/Vinext. Người dùng đã giao quyền chọn stack phù hợp với starter và xác nhận cài đúng dependency đi kèm starter.

## Users

Khách hàng Việt Nam dùng điện thoại, máy tính bảng hoặc máy tính để chọn đồ uống, tuỳ chỉnh size, đường, đá, topping và đặt giao nhanh.

## Product Purpose

`Trà Sữa Ngon` là cửa hàng trà sữa trực tuyến bằng tiếng Việt. Thành công nghĩa là người dùng có thể tìm món, hiểu giá, tuỳ chỉnh chính xác, thêm vào giỏ và hoàn tất đơn mô phỏng nhanh, không nhầm trạng thái.

## Positioning

Trải nghiệm mua trà sữa thân thiện, có cảm giác thủ công hiện đại, đặt trọng tâm vào thành phần rõ ràng và khả năng tuỳ chỉnh từng ly.

## Operating Context

Luồng chính gồm trang chủ, danh mục, chi tiết sản phẩm, giỏ hàng, gợi ý địa chỉ Việt Nam, thanh toán mô phỏng và xác nhận đơn. Giỏ hàng là draft cục bộ; order lifecycle đi qua API nội bộ và lưu một receipt cục bộ sau khi xác nhận.

## Capabilities and Constraints

- Tìm kiếm, lọc danh mục và sắp xếp sản phẩm mẫu bằng tiếng Việt.
- Chọn size, mức đường, mức đá, topping và số lượng; giá thay đổi theo lựa chọn.
- Quản lý giỏ hàng và checkout có validation thân thiện.
- Gợi ý địa chỉ qua Geoapify proxy phía server, có debounce và nhập tay dự phòng.
- Hỗ trợ tiền mặt khi nhận hàng và giao diện chuyển khoản/QR mô phỏng.
- API nội bộ tạo đơn `pending`, xác nhận thành `confirmed` và không tạo trạng thái `paid`.
- Không có authentication, cổng thanh toán thật hoặc thu tiền thật.
- Dữ liệu, repository và payment provider được tách thành layer riêng để có thể thay bằng D1 và VNPay, MoMo hoặc ZaloPay sau này.
- Order repository hiện là memory adapter cho local; persistence bền vững cần xác nhận trước khi đổi schema.
- Chỉ chạy local, không publish hoặc deploy.

## Brand Commitments

- Tên: `Trà Sữa Ngon`.
- Tiếng Việt, tươi trẻ, sạch sẽ, thân thiện, thủ công hiện đại.
- Nền sáng trung tính, xanh ngọc hoặc xanh trà làm chủ đạo, một màu ấm cho CTA.
- Tránh AI-purple gradient, glassmorphism, shadow nặng, ba card giống nhau và nhận diện của thương hiệu có thật.
- Logo chữ đơn giản, pattern trân châu hoặc trà tiết chế, typography dễ đọc, hình đồ uống hấp dẫn.

## Evidence on Hand

Không có logo, ảnh sản phẩm, ảnh social, testimonial, số liệu vận hành hoặc tuyên bố chứng thực thật được cung cấp. Nội dung thương mại phải được ghi rõ là dữ liệu mẫu và không được bịa đặt bằng chứng.

## Product Principles

- Hoàn tất đơn nhanh trên màn hình cảm ứng nhỏ.
- Giá và tuỳ chọn luôn rõ trước khi thêm vào giỏ.
- Trạng thái loading, empty, validation và error phải hữu ích, không làm người dùng đoán.
- Bản sắc thương hiệu hỗ trợ việc mua hàng, không cản trở thao tác.
- Giữ catalogue, pricing, repository và payment adapter dễ thay bằng hạ tầng thật.

## Accessibility & Inclusion

Đáp ứng WCAG AA cho contrast, focus, nhãn form và thao tác bàn phím; hỗ trợ `prefers-reduced-motion`; mục tiêu responsive 360px, 768px, 1024px và 1440px; dùng HTML/CSS tiêu chuẩn tương thích Chromium, Firefox, Safari và Edge.
