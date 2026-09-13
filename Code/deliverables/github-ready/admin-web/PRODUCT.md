# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 và TypeScript trên Vinext/Vite, build thành Cloudflare Worker-compatible ESM. Project giữ các file compatibility của starter hiện hữu, nhưng mục tiêu vận hành là Wrangler + Cloudflare Workers/D1 và chưa deploy.

## Users

Khách hàng Việt Nam dùng điện thoại, máy tính bảng hoặc máy tính để chọn đồ uống, tuỳ chỉnh size, đường, đá, topping và đặt giao nhanh.

## Product Purpose

`Trà Sữa Ngon` là cửa hàng trà sữa trực tuyến bằng tiếng Việt. Thành công nghĩa là người dùng có thể tìm món, hiểu giá, tuỳ chỉnh chính xác, thêm vào giỏ và hoàn tất đơn mô phỏng nhanh, không nhầm trạng thái.

## Positioning

Trải nghiệm mua trà sữa thân thiện, có cảm giác thủ công hiện đại, đặt trọng tâm vào thành phần rõ ràng và khả năng tuỳ chỉnh từng ly.

## Operating Context

Luồng khách gồm trang chủ, danh mục, chi tiết sản phẩm, giỏ hàng, gợi ý địa chỉ Việt Nam, thanh toán mô phỏng và xác nhận đơn. Giỏ hàng là draft cục bộ; đơn hàng bền vững qua D1. Luồng nội bộ gồm login admin, dashboard, sổ đơn, chi tiết, chuyển trạng thái, xác nhận COD và audit.

## Capabilities and Constraints

- Tìm kiếm, lọc danh mục và sắp xếp sản phẩm mẫu bằng tiếng Việt.
- Chọn size, mức đường, mức đá, topping và số lượng; giá thay đổi theo lựa chọn.
- Quản lý giỏ hàng và checkout có validation thân thiện.
- Gợi ý địa chỉ qua Geoapify proxy phía server, có debounce và nhập tay dự phòng.
- Hỗ trợ tiền mặt khi nhận hàng và giao diện chuyển khoản/QR mô phỏng.
- API khách tạo đơn `pending`; admin vận hành state machine có kiểm soát và optimistic version.
- Có đăng nhập admin nội bộ, session D1, phân quyền `admin`/`operator`, CSRF và rate limit; chưa có auth khách hàng.
- Không có cổng thanh toán thật hoặc thu tiền tự động. Chỉ admin role được đánh dấu COD `paid` sau khi đang giao/hoàn tất; QR luôn `simulation_only`.
- Dữ liệu, repository và payment provider được tách thành layer riêng để có thể thay bằng D1 và VNPay, MoMo hoặc ZaloPay sau này.
- D1 là source of truth cho đơn hàng/admin; memory Adapter chỉ bật rõ bằng `ORDER_STORAGE=memory` cho test cô lập.
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
