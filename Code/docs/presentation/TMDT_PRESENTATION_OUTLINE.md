# Dàn ý trình chiếu dự án Trà Sữa Ngon

## Thông tin chung

- Đề tài: Website thương mại điện tử Trà Sữa Ngon.
- Thời lượng mặc định: 14 phút 45 giây, bao gồm 3 phút 30 giây demo.
- Hỏi đáp: 3 phút.
- Số nhóm: `[CẦN BỔ SUNG]`.
- Thành viên và tỷ lệ đóng góp: `[CẦN BỔ SUNG]`.
- Phạm vi kiểm chứng: đề bài `TMDT_CASE STUDY (1).pdf` và source tại `D:\TMDT`.
- Trạng thái triển khai: chạy local, chưa có website production công khai.

## Nguyên tắc trình bày

- Dùng tỷ lệ 16:9, nền trắng ngà, xanh trà làm màu chính và cam ấm cho điểm nhấn.
- Mỗi slide chỉ giữ một ý chính và tối đa 3 đến 5 ý ngắn trên màn hình.
- Ưu tiên ảnh giao diện thật, sơ đồ hiện có và dữ liệu test đã được ghi nhận.
- Không trình bày QR mô phỏng như một giao dịch thật.
- Không đưa mật khẩu, token, API key, cookie hoặc dữ liệu cá nhân thật lên slide.
- Nội dung gắn nhãn `[CẦN BỔ SUNG]` phải được hoàn thiện hoặc giữ nguyên trạng thái thiếu khi thuyết trình.

### Slide 1 — Website thương mại điện tử Trà Sữa Ngon

- Mục tiêu: Giới thiệu nhanh đề tài và nhóm thực hiện.
- Thông điệp chính: Nhóm xây dựng một website đặt trà sữa trực tuyến bằng tiếng Việt.
- Nội dung trên slide:
  - Website thương mại điện tử Trà Sữa Ngon.
  - Môn học: `[CẦN BỔ SUNG]`.
  - Nhóm: `[CẦN BỔ SUNG]`.
  - Thành viên: `[CẦN BỔ SUNG]`.
  - Giảng viên và thời gian thực hiện: `[CẦN BỔ SUNG]`.
- Hình ảnh hoặc biểu đồ đề xuất: Ảnh hero website đặt toàn màn hình, phủ lớp màu nhẹ để tiêu đề dễ đọc.
- Bằng chứng cần lấy từ dự án: `.impeccable/review/tablet-1024.png` hoặc chụp mới phần hero từ trang chủ.
- Người trình bày: `[CẦN BỔ SUNG: người mở đầu]`.
- Thời lượng: 20 giây.
- Ghi chú thuyết trình: Giới thiệu tên đề tài, tên nhóm và mục tiêu tổng quát. Không đọc toàn bộ danh sách thành viên nếu thông tin đã hiển thị rõ.

### Slide 2 — Bài toán và mục tiêu

- Mục tiêu: Giải thích nhu cầu mà sản phẩm hướng tới.
- Thông điệp chính: Website giúp khách chọn món, tùy chỉnh ly và tạo đơn trong một luồng rõ ràng trên nhiều kích thước màn hình.
- Nội dung trên slide:
  - Khách hàng cần xem menu và giá trước khi đặt món.
  - Mỗi ly có thể thay đổi size, đường, đá và topping.
  - Giỏ hàng phải giữ đúng lựa chọn và tính đúng tổng tiền.
  - Nhân viên cần theo dõi và xử lý đơn trong khu vực quản trị.
- Hình ảnh hoặc biểu đồ đề xuất: Một ảnh sản phẩm lớn bên phải, bốn nhu cầu chính đặt thành các dòng ngắn bên trái.
- Bằng chứng cần lấy từ dự án: `PRODUCT.md`, `app/components/TeaShop.tsx`, `app/data/products.ts`.
- Người trình bày: `[CẦN BỔ SUNG: người mở đầu]`.
- Thời lượng: 35 giây.
- Ghi chú thuyết trình: Nêu đây là thương hiệu hư cấu phục vụ bài tập. Không đưa số liệu thị trường vì source và đề bài không cung cấp dữ liệu khảo sát.

### Slide 3 — Phạm vi và trạng thái hiện tại

- Mục tiêu: Cho người nghe biết chính xác hệ thống đã làm được gì.
- Thông điệp chính: Luồng mua hàng và vận hành đơn đã hoạt động ở local, nhưng một số yêu cầu của đề bài vẫn còn thiếu.
- Nội dung trên slide:
  - Đã có trang chủ, menu, tùy chỉnh món, giỏ hàng và checkout.
  - Đã có API tạo đơn, D1 local và quản trị đơn hàng.
  - Thanh toán COD và QR chỉ phục vụ mô phỏng.
  - `[CẦN BỔ SUNG]` Liên hệ, feedback, Google Maps, đánh giá và chính sách.
  - `[CẦN BỔ SUNG]` Giá khuyến mại và triển khai công khai.
- Hình ảnh hoặc biểu đồ đề xuất: Bảng hai cột “Đã có” và “Cần bổ sung”, dùng dấu kiểm và nhãn trạng thái rõ ràng.
- Bằng chứng cần lấy từ dự án: `README.md`, `docs/REPORT_FACT_CHECK.md`, cấu trúc route trong `app/`.
- Người trình bày: `[CẦN BỔ SUNG: người mở đầu]`.
- Thời lượng: 40 giây.
- Ghi chú thuyết trình: Nhấn mạnh nhóm trình bày theo trạng thái thật của source. Geoapify chỉ gợi ý địa chỉ, không phải Google Maps. Đăng nhập hiện chỉ dành cho quản trị viên.

### Slide 4 — Kiến trúc hệ thống

- Mục tiêu: Giải thích các lớp chính và cách chúng trao đổi dữ liệu.
- Thông điệp chính: Storefront và admin dùng chung ứng dụng React, gọi API server và lưu dữ liệu vận hành trong D1.
- Nội dung trên slide:
  - Giao diện: React 19 và TypeScript trên Vinext/Vite.
  - API: menu, gợi ý địa chỉ, đặt hàng và quản trị.
  - Nghiệp vụ: order service, admin service và auth service.
  - Dữ liệu: catalogue TypeScript, localStorage và Cloudflare D1 local.
  - Dịch vụ ngoài: Geoapify qua proxy phía server.
- Hình ảnh hoặc biểu đồ đề xuất: Dùng sơ đồ kiến trúc hiện có, cắt phần lề thừa nhưng không làm mất nhãn.
- Bằng chứng cần lấy từ dự án: `docs/report-assets/architecture.png`, `vite.config.ts`, `worker/index.ts`, `app/server/`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách kiến trúc]`.
- Thời lượng: 45 giây.
- Ghi chú thuyết trình: Giải thích catalogue nằm trong source, giỏ hàng nằm trên thiết bị và đơn hàng nằm trong D1. Cloudflare Workers là môi trường hướng tới, chưa phải môi trường production đã triển khai.

### Slide 5 — Mô hình dữ liệu

- Mục tiêu: Trình bày dữ liệu thực sự tồn tại trong database.
- Thông điệp chính: D1 tập trung vào đơn hàng, thanh toán, tài khoản quản trị và lịch sử vận hành.
- Nội dung trên slide:
  - Đơn hàng gồm `orders`, `order_items` và `order_item_toppings`.
  - Thanh toán được lưu riêng trong `payments`.
  - Xác thực dùng `admin_users`, `admin_sessions` và `admin_login_attempts`.
  - Vận hành dùng `order_status_history` và `admin_audit_logs`.
  - Catalogue và giỏ hàng chưa được lưu thành bảng D1.
- Hình ảnh hoặc biểu đồ đề xuất: Dùng ERD hiện có, phóng lớn các bảng chính và giảm phần chữ phụ.
- Bằng chứng cần lấy từ dự án: `docs/report-assets/erd.png`, `db/schema.ts`, `drizzle/0000_material_maestro.sql`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách dữ liệu]`.
- Thời lượng: 45 giây.
- Ghi chú thuyết trình: Source có 9 bảng D1. Không thêm bảng sản phẩm, danh mục, khách hàng, đánh giá hoặc feedback vào sơ đồ vì các bảng đó chưa tồn tại.

### Slide 6 — Hành trình mua hàng

- Mục tiêu: Kết nối các chức năng thành một trải nghiệm liền mạch.
- Thông điệp chính: Khách đi từ khám phá sản phẩm tới nhận mã đơn qua một quy trình ngắn và có xử lý lỗi.
- Nội dung trên slide:
  1. Xem menu và tìm món.
  2. Chọn size, đường, đá và topping.
  3. Kiểm tra giỏ hàng.
  4. Nhập thông tin giao nhận.
  5. Chọn COD hoặc QR mô phỏng.
  6. Nhận mã đơn TSN.
- Hình ảnh hoặc biểu đồ đề xuất: Sơ đồ tuyến tính sáu bước, đặt một ảnh giao diện nhỏ tại bước chọn món và bước checkout.
- Bằng chứng cần lấy từ dự án: `docs/report-assets/order-flow.png`, `app/components/TeaShop.tsx`, `app/server/orders/order-service.ts`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách storefront]`.
- Thời lượng: 35 giây.
- Ghi chú thuyết trình: Server kiểm tra lại sản phẩm và tính lại giá trước khi ghi đơn. Khi Geoapify lỗi, người dùng vẫn nhập địa chỉ thủ công.

### Slide 7 — Danh mục, tìm kiếm, lọc và sắp xếp

- Mục tiêu: Chứng minh nhóm chức năng khám phá sản phẩm trong đề bài.
- Thông điệp chính: Menu hỗ trợ tìm kiếm tiếng Việt, lọc danh mục, sắp xếp theo giá và trạng thái không có kết quả.
- Nội dung trên slide:
  - Catalogue có 12 mục, gồm 9 đồ uống và 3 topping bán riêng.
  - Tìm kiếm theo tên và mô tả sản phẩm.
  - Lọc theo trà sữa, trà trái cây, macchiato và topping.
  - Sắp xếp theo độ phổ biến hoặc giá tăng, giảm.
  - Có loading skeleton và empty state.
- Hình ảnh hoặc biểu đồ đề xuất: Một ảnh chụp menu đang lọc và một ảnh nhỏ của trạng thái không có kết quả.
- Bằng chứng cần lấy từ dự án: `app/components/TeaShop.tsx` phần `MenuView`, `app/data/products.ts`, `tests/rendered-html.test.mjs`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách storefront]`.
- Thời lượng: 45 giây.
- Ghi chú thuyết trình: Demo một từ khóa ngắn, chọn danh mục và đổi thứ tự giá. Không gọi catalogue là dữ liệu database vì dữ liệu hiện nằm trong file TypeScript.

### Slide 8 — Chi tiết sản phẩm và tính giá

- Mục tiêu: Chứng minh ảnh sản phẩm, tùy chỉnh món và cách tính giá.
- Thông điệp chính: Mỗi lựa chọn ảnh hưởng trực tiếp tới giá, còn server tính lại giá để không tin dữ liệu từ trình duyệt.
- Nội dung trên slide:
  - Sản phẩm có ảnh, tên, mô tả, thành phần và giá gốc.
  - Khách chọn size M hoặc L, mức đường và mức đá.
  - Có 5 loại topping tùy chọn.
  - Size L cộng 7.000 đồng, topping cộng theo từng loại.
  - `[CẦN BỔ SUNG]` Chưa có giá cũ, giá mới hoặc quy tắc khuyến mại.
- Hình ảnh hoặc biểu đồ đề xuất: Ảnh chụp trang chi tiết sau khi đã chọn size L và topping, kèm phép tính giá mẫu ngắn.
- Bằng chứng cần lấy từ dự án: `app/data/products.ts`, `app/data/pricing.ts`, `app/components/TeaShop.tsx` phần `ProductView`, `app/server/orders/order-service.ts`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách storefront]`.
- Thời lượng: 50 giây.
- Ghi chú thuyết trình: Nhãn “Mới” và “Bán chạy” chỉ là tag sản phẩm. Chúng không thay thế yêu cầu hiển thị giá cũ, giá mới và khuyến mại.

### Slide 9 — Giỏ hàng và thanh toán mô phỏng

- Mục tiêu: Chứng minh luồng giỏ hàng, checkout và tạo đơn.
- Thông điệp chính: Khách quản lý giỏ, nhập thông tin giao nhận và tạo đơn an toàn mà không thực hiện giao dịch tài chính thật.
- Nội dung trên slide:
  - Thêm món, tăng giảm số lượng và xóa món.
  - Giỏ hàng được giữ trong localStorage sau khi tải lại trang.
  - Checkout kiểm tra họ tên, số điện thoại và địa chỉ.
  - Phí giao hàng mẫu là 18.000 đồng.
  - COD ở trạng thái chưa thu, QR luôn ở trạng thái mô phỏng.
- Hình ảnh hoặc biểu đồ đề xuất: Ghép một ảnh giỏ hàng và một ảnh checkout. Cảnh báo “QR mô phỏng” phải đọc được.
- Bằng chứng cần lấy từ dự án: `app/lib/storage.ts`, `app/components/TeaShop.tsx`, `app/server/payments/payment-provider.ts`, `app/api/orders/`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách checkout]`.
- Thời lượng: 55 giây.
- Ghi chú thuyết trình: Backend từ chối sản phẩm hoặc topping lạ và tự tính tổng từ catalogue nội bộ. QR không tạo giao dịch và không chuyển sang trạng thái đã thanh toán.

### Slide 10 — Tiện ích hỗ trợ khách hàng

- Mục tiêu: Đối chiếu trung thực các yêu cầu hỗ trợ khách hàng trong đề bài.
- Thông điệp chính: Source mới hỗ trợ nhập địa chỉ và phí giao hàng, còn các tiện ích liên hệ và tạo niềm tin chưa được triển khai.
- Nội dung trên slide:
  - Đã có gợi ý địa chỉ Việt Nam qua Geoapify và nhập tay dự phòng.
  - `[CẦN BỔ SUNG]` Trang liên hệ và biểu mẫu feedback.
  - `[CẦN BỔ SUNG]` Chính sách đổi trả, bảo hành và vận chuyển.
  - `[CẦN BỔ SUNG]` Google Maps hoặc bản đồ cửa hàng.
  - `[CẦN BỔ SUNG]` Đánh giá sản phẩm và bình luận.
- Hình ảnh hoặc biểu đồ đề xuất: Bảng trạng thái một trang, mỗi yêu cầu có nhãn “Đã có” hoặc “Cần bổ sung”.
- Bằng chứng cần lấy từ dự án: `app/server/address-suggestions.ts`, `app/api/address-suggestions/route.ts`, kết quả tìm kiếm source không có route hoặc component tương ứng cho các mục còn thiếu.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách phân tích yêu cầu]`.
- Thời lượng: 45 giây.
- Ghi chú thuyết trình: Không gọi Geoapify là Google Maps. Với sản phẩm đồ uống, phần bảo hành có thể giải thích là không áp dụng và thay bằng cam kết xử lý món sai, đổ vỡ hoặc chất lượng không đạt, nhưng nội dung đó phải được bổ sung vào website trước khi tuyên bố đã hoàn thành.

### Slide 11 — Đăng nhập và bảo vệ phiên quản trị

- Mục tiêu: Chứng minh yêu cầu đăng nhập, đăng xuất và phân quyền đang tồn tại ở khu vực admin.
- Thông điệp chính: Admin có xác thực phía server, phiên D1, chống thử sai và kiểm soát quyền thao tác.
- Nội dung trên slide:
  - Có đăng nhập, kiểm tra phiên và đăng xuất quản trị.
  - Hai vai trò là `admin` và `operator`.
  - Phiên kéo dài 8 giờ và token chỉ lưu dưới dạng hash trong D1.
  - Mutation yêu cầu cùng nguồn, CSRF token và vai trò admin.
  - `[CẦN BỔ SUNG]` Chưa có đăng nhập hoặc đăng xuất khách hàng.
- Hình ảnh hoặc biểu đồ đề xuất: Ảnh trang đăng nhập admin trên desktop hoặc mobile, kèm sơ đồ ba bước xác thực ngắn.
- Bằng chứng cần lấy từ dự án: `.impeccable/review/admin-login-desktop.png`, `.impeccable/review/admin-login-mobile.png`, `app/server/auth/`, `app/api/admin/auth/`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách backend và bảo mật]`.
- Thời lượng: 50 giây.
- Ghi chú thuyết trình: Password dùng PBKDF2-SHA256 với salt và 310.000 vòng. Hệ thống giới hạn 5 lần thử trong 15 phút và có thể khóa 15 phút. Không hiển thị credential demo trên slide.

### Slide 12 — Quản trị và vận hành đơn hàng

- Mục tiêu: Trình bày phần quản trị đã hoạt động và giới hạn hiện tại.
- Thông điệp chính: Admin theo dõi, tìm kiếm và chuyển trạng thái đơn có kiểm soát, nhưng chưa quản lý catalogue hoặc nội dung hỗ trợ.
- Nội dung trên slide:
  - Dashboard tổng hợp số đơn, giá trị đơn và tình trạng thanh toán.
  - Sổ đơn hỗ trợ tìm kiếm, lọc, sắp xếp và phân trang.
  - Chi tiết đơn có sản phẩm, khách nhận, thanh toán và lịch sử.
  - State machine kiểm soát chuyển trạng thái và ghi audit log.
  - `[CẦN BỔ SUNG]` Quản lý sản phẩm, danh mục, khuyến mại và feedback.
- Hình ảnh hoặc biểu đồ đề xuất: Ảnh dashboard hoặc danh sách đơn chiếm phần lớn slide. Có thể đặt state machine nhỏ ở góc phải.
- Bằng chứng cần lấy từ dự án: `app/admin/`, `app/api/admin/`, `app/server/admin/admin-orders.ts`, `docs/report-assets/order-state-machine.png`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách admin]`.
- Thời lượng: 55 giây.
- Ghi chú thuyết trình: Chức năng admin sau đăng nhập đã có integration test. `[CẦN BỔ SUNG]` Ảnh dashboard, danh sách và chi tiết đơn từ một phiên local an toàn trước ngày thuyết trình.

### Slide 13 — Responsive và khả năng tiếp cận

- Mục tiêu: Chứng minh website dùng được trên nhiều kích thước màn hình.
- Thông điệp chính: Storefront đã được kiểm tra trên nhiều độ rộng, có menu mobile, vùng chạm đủ lớn và trạng thái focus rõ.
- Nội dung trên slide:
  - Giao diện thích ứng từ 320 px đến 1920 px.
  - Không ghi nhận tràn ngang trong lần quét responsive gần nhất.
  - Control chính có vùng chạm tối thiểu khoảng 44 px.
  - Form có label, thông báo lỗi và focus keyboard.
  - Hỗ trợ `prefers-reduced-motion`.
- Hình ảnh hoặc biểu đồ đề xuất: Cùng một màn hình đặt trên ba khung mobile, tablet và desktop. Không dùng quá ba ảnh nhỏ.
- Bằng chứng cần lấy từ dự án: `.impeccable/review/tablet-768.png`, `.impeccable/review/tablet-1024.png`, `docs/qa/TEST_RESULTS.md`, `tests/ui-regression.test.mjs`, `app/globals.css`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách UI và QA]`.
- Thời lượng: 40 giây.
- Ghi chú thuyết trình: Báo cáo gần nhất ghi nhận kiểm tra tương tác trên Chromium ở tám kích thước chính và quét 21 chiều rộng. Firefox, Safari, thiết bị vật lý, zoom 200% và screen reader thật vẫn chưa được kiểm tra đầy đủ.

### Slide 14 — Kiểm thử và kết quả

- Mục tiêu: Trình bày kết quả có bằng chứng và các khoảng trống kiểm thử.
- Thông điệp chính: Build, lint, typecheck và 13 test đã đạt theo báo cáo ngày 10/09/2026, nhưng phạm vi đa trình duyệt và production vẫn chưa hoàn tất.
- Nội dung trên slide:
  - `npm run lint`: đạt.
  - `npm run typecheck`: đạt.
  - `npm test`: đạt 13/13, có production build.
  - Luồng storefront, order, auth và admin đã có integration test.
  - `[CHƯA KIỂM THỬ]` Firefox, Safari, thiết bị vật lý và production smoke.
- Hình ảnh hoặc biểu đồ đề xuất: Bảng kết quả bốn dòng hoặc ảnh terminal đã che đường dẫn cá nhân và thông tin nhạy cảm.
- Bằng chứng cần lấy từ dự án: `docs/qa/TEST_RESULTS.md`, `tests/rendered-html.test.mjs`, `tests/ui-regression.test.mjs`, `docs/audit/evidence/`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách QA]`.
- Thời lượng: 50 giây.
- Ghi chú thuyết trình: Không đổi kết quả tài liệu thành tuyên bố “đã kiểm tra mọi trình duyệt”. Bộ test hiện có gồm 11 integration test và 2 UI regression test. Repository chưa có unit test suite tách biệt.

### Slide 15 — Trạng thái triển khai

- Mục tiêu: Phân biệt build thành công với triển khai production.
- Thông điệp chính: Dự án chạy local và có cấu hình hướng tới Cloudflare Workers/D1, nhưng chưa có URL public được xác minh.
- Nội dung trên slide:
  - Local development dùng `http://localhost:3000`.
  - Có thể mở qua địa chỉ LAN trong cùng mạng tin cậy.
  - Production dự kiến dùng Cloudflare Workers và D1.
  - `[CHƯA TRIỂN KHAI CÔNG KHAI]` D1 remote, secret, admin production và hostname.
  - `[CHƯA KIỂM THỬ]` DNS, TLS, redirect và smoke test production.
- Hình ảnh hoặc biểu đồ đề xuất: Sơ đồ ba môi trường “Local”, “LAN”, “Production dự kiến”. Chỉ Local và LAN được đánh dấu đã kiểm chứng.
- Bằng chứng cần lấy từ dự án: `README.md`, `.env.example`, `vite.config.ts`, `wrangler.jsonc`, `docs/PRODUCTION_DOMAIN_MIGRATION.md`.
- Người trình bày: `[CẦN BỔ SUNG: người phụ trách triển khai]`.
- Thời lượng: 40 giây.
- Ghi chú thuyết trình: `wrangler.jsonc` vẫn dùng database ID placeholder. Không đưa URL giả hoặc mã QR dẫn tới domain chưa hoạt động.

### Slide 16 — Phân công và bài nộp

- Mục tiêu: Xác nhận trách nhiệm của thành viên và cách đóng gói sản phẩm.
- Thông điệp chính: Nhóm cần công khai phần việc, tỷ lệ tham gia và nộp đủ ba thành phần trong một file ZIP.
- Nội dung trên slide:
  - Thành viên, phần việc và tỷ lệ: `[CẦN BỔ SUNG]`.
  - Tổng tỷ lệ tham gia phải bằng 100%.
  - Bài nộp gồm source code, báo cáo Word và file trình chiếu.
  - Tất cả được gộp vào một file ZIP.
  - Tên file: `TMDT_NHOM_[SỐ_NHÓM].zip`.
- Hình ảnh hoặc biểu đồ đề xuất: Bảng phân công ngắn ở hai phần ba slide, sơ đồ đóng gói ba tệp ở phần còn lại.
- Bằng chứng cần lấy từ dự án: PDF đề bài, `docs/Bao_Cao_Tieu_Luan_TMDT.docx`, source tại `D:\TMDT`.
- Người trình bày: `[CẦN BỔ SUNG: trưởng nhóm]`.
- Thời lượng: 35 giây.
- Ghi chú thuyết trình: Chỉ một người đại diện nộp bài. Báo cáo Word phải có danh sách thành viên và tỷ lệ tham gia. Không tự đặt tỷ lệ trước khi cả nhóm xác nhận.

### Slide 17 — Demo và kết luận

- Mục tiêu: Chứng minh luồng cốt lõi bằng một phiên demo ngắn và kết thúc bài trình bày.
- Thông điệp chính: Website nối được trải nghiệm chọn món với quy trình quản trị đơn trong môi trường local.
- Nội dung trên slide:
  - Tìm, lọc và sắp xếp một sản phẩm.
  - Tùy chỉnh món, thêm giỏ và tạo đơn thử nghiệm.
  - Đăng nhập admin và kiểm tra đơn vừa tạo.
  - Minh họa responsive và một trường hợp lỗi.
  - Cảm ơn và mời đặt câu hỏi.
- Hình ảnh hoặc biểu đồ đề xuất: Một ảnh trang chủ cùng danh sách bốn chặng demo. Giữ slide này hiển thị trước và sau khi demo.
- Bằng chứng cần lấy từ dự án: Website local, tài khoản admin demo do nhóm tự tạo, dữ liệu thử nghiệm không chứa thông tin thật.
- Người trình bày: `[CẦN BỔ SUNG: người demo]`.
- Thời lượng: 3 phút 30 giây.
- Ghi chú thuyết trình: Theo đúng kịch bản chi tiết bên dưới. Nếu demo trực tiếp lỗi, chuyển sang video quay sẵn và vẫn nói rõ đây là môi trường local.

## Bảng đối chiếu yêu cầu đề bài

| Yêu cầu | Slide | Trạng thái trong source | Bằng chứng chính |
|---|---:|---|---|
| Lọc và tìm kiếm | 7 | Đã triển khai | `TeaShop.tsx`, `products.ts` |
| Sắp xếp sản phẩm | 7 | Đã triển khai | `MenuView`, các mode `popular`, `price-asc`, `price-desc` |
| Đăng nhập và đăng xuất | 11 | Đã triển khai cho admin | `app/api/admin/auth/`, `app/server/auth/` |
| Tài khoản khách hàng | 3, 11 | `[CẦN BỔ SUNG]` | Không có page, schema hoặc service tương ứng |
| Giỏ hàng | 9 | Đã triển khai | `CartView`, `app/lib/storage.ts` |
| Thanh toán | 9 | Đã triển khai dưới dạng mô phỏng | `PaymentProvider`, COD và `mock_qr` |
| Ảnh sản phẩm | 1, 7, 8 | Đã triển khai | `public/images/`, `ProductPicture` |
| Responsive | 13 | Đã triển khai và có báo cáo | `app/globals.css`, `docs/qa/TEST_RESULTS.md` |
| Liên hệ và feedback | 10 | `[CẦN BỔ SUNG]` | Không có route, component hoặc bảng dữ liệu tương ứng |
| Khuyến mại, giá mới và giá cũ | 3, 8, 10 | `[CẦN BỔ SUNG]` | Chỉ có tag “Mới”, `discountAmount` luôn bằng 0 |
| Chính sách đổi trả | 10 | `[CẦN BỔ SUNG]` | Không có trang hoặc nội dung chính sách |
| Chính sách bảo hành | 10 | `[CẦN BỔ SUNG]` | Không có trang hoặc nội dung chính sách |
| Chính sách vận chuyển | 9, 10 | Đáp ứng một phần | Có phí giao hàng mẫu, chưa có trang chính sách |
| Google Maps | 10 | `[CẦN BỔ SUNG]` | Geoapify autocomplete không phải Google Maps |
| Đánh giá và bình luận | 10 | `[CẦN BỔ SUNG]` | Không có UI, API hoặc bảng dữ liệu |
| Trang quản trị | 11, 12 | Đáp ứng một phần | Có auth, dashboard và quản lý đơn. Chưa quản lý catalogue hoặc feedback |
| Xây dựng website | 2 đến 14 | Đã có bản chạy local | React, API, D1 local và test |
| Triển khai website | 15 | `[CHƯA TRIỂN KHAI CÔNG KHAI]` | Config còn placeholder, không có URL production được xác minh |
| Source code trong bài nộp | 16 | Bắt buộc | PDF đề bài |
| Báo cáo Word trong bài nộp | 16 | Bắt buộc | PDF đề bài |
| File trình chiếu trong bài nộp | 16 | Bắt buộc | PDF đề bài |
| Gộp thành file ZIP | 16 | Bắt buộc | PDF đề bài |
| Danh sách nhóm và tỷ lệ tham gia | 16 | `[CẦN BỔ SUNG]` | PDF đề bài và thông tin nhóm chưa được cung cấp |

## Tổng thời lượng dự kiến

| Slide | Thời lượng |
|---:|---:|
| 1 | 00:20 |
| 2 | 00:35 |
| 3 | 00:40 |
| 4 | 00:45 |
| 5 | 00:45 |
| 6 | 00:35 |
| 7 | 00:45 |
| 8 | 00:50 |
| 9 | 00:55 |
| 10 | 00:45 |
| 11 | 00:50 |
| 12 | 00:55 |
| 13 | 00:40 |
| 14 | 00:50 |
| 15 | 00:40 |
| 16 | 00:35 |
| 17, gồm demo | 03:30 |
| **Tổng thuyết trình và demo** | **14:45** |
| **Hỏi đáp** | **03:00** |
| **Tổng phiên** | **17:45** |

Nếu giảng viên chỉ cho 12 phút, rút slide 4 và 5 còn tổng cộng 60 giây, slide 11 và 12 còn tổng cộng 70 giây, demo còn 3 phút. Không bỏ slide 3 hoặc slide 10 vì hai slide này giúp phân biệt chức năng đã có với yêu cầu còn thiếu.

## Phân chia slide cho thành viên

Thông tin thành viên chưa được cung cấp. Bảng dưới đây là khung phân công theo vai trò, không phải tỷ lệ đóng góp đã xác nhận.

| Vai trò trình bày | Họ tên | Slide | Nội dung phụ trách | Tỷ lệ tham gia |
|---|---|---|---|---|
| A. Mở đầu và tổng hợp | `[CẦN BỔ SUNG]` | 1 đến 3, 16 | Bài toán, phạm vi, phân công và bài nộp | `[CẦN BỔ SUNG]` |
| B. Kiến trúc và dữ liệu | `[CẦN BỔ SUNG]` | 4 đến 6 | Kiến trúc, database và hành trình mua hàng | `[CẦN BỔ SUNG]` |
| C. Storefront và checkout | `[CẦN BỔ SUNG]` | 7 đến 10 | Catalogue, tùy chỉnh, giỏ hàng và phần còn thiếu | `[CẦN BỔ SUNG]` |
| D. Admin, QA và demo | `[CẦN BỔ SUNG]` | 11 đến 15, 17 | Xác thực, admin, responsive, test, triển khai và demo | `[CẦN BỔ SUNG]` |
| **Tổng** |  |  |  | **100% sau khi nhóm xác nhận** |

- `[CẦN XÁC NHẬN]` Số thành viên thực tế của nhóm.
- Nếu nhóm không có bốn người, gộp hoặc tách các vai trò trước khi ghi tên.
- Tỷ lệ trong báo cáo phản ánh đóng góp thực tế, không chỉ số slide được nói.
- Người demo nên là người hiểu cả storefront lẫn admin và có thể xử lý tình huống khi dữ liệu local chưa sẵn sàng.

## Kịch bản demo 3 phút 30 giây

### Chuẩn bị trước demo

- Chạy database migration local theo hướng dẫn dự án trước buổi thuyết trình.
- Tạo tài khoản admin demo bằng quy trình `npm run admin:create`.
- Dùng dữ liệu tên, số điện thoại và địa chỉ thử nghiệm.
- Mở sẵn hai tab: storefront và `/admin/login`.
- Chọn phương thức COD để có thể minh họa xác nhận thu tiền trong admin sau khi chuyển đơn tới trạng thái phù hợp.
- Không dùng thông tin ngân hàng thật và không quét QR mô phỏng.

### Trình tự demo

| Thời gian | Thao tác | Điều cần nói |
|---:|---|---|
| 00:00 đến 00:15 | Mở trang chủ | Giới thiệu nhanh giao diện và menu chính. |
| 00:15 đến 00:40 | Mở menu, tìm “trà”, lọc “Trà sữa”, sắp xếp giá tăng dần | Chứng minh tìm kiếm, lọc và sắp xếp hoạt động cùng nhau. |
| 00:40 đến 01:10 | Mở Trà Sữa Đường Đen, bấm thêm khi chưa chọn | Cho thấy lỗi bắt buộc đối với size, đường và đá. |
| 01:10 đến 01:35 | Chọn size L, 50% đường, ít đá và trân châu trắng | Giá thay đổi theo size và topping. |
| 01:35 đến 01:55 | Thêm vào giỏ, tăng rồi giảm số lượng | Tổng tiền cập nhật và giỏ được lưu trên thiết bị. |
| 01:55 đến 02:25 | Mở checkout, nhập dữ liệu thử nghiệm và chọn COD | Form có validation. Phí giao hàng mẫu được cộng vào tổng. |
| 02:25 đến 02:40 | Xác nhận đơn và ghi lại mã TSN | Đơn được tạo và xác nhận nội bộ, chưa có giao dịch tài chính thật. |
| 02:40 đến 03:10 | Chuyển sang admin, đăng nhập và tìm mã đơn | Chứng minh admin đọc dữ liệu từ D1 và xem được chi tiết đơn. |
| 03:10 đến 03:25 | Mở responsive mode ở 390 px | Chứng minh menu và bố cục checkout thích ứng trên mobile. |
| 03:25 đến 03:30 | Quay lại slide 17 | Kết luận và mời giảng viên đặt câu hỏi. |

### Trường hợp lỗi bắt buộc

- Ưu tiên lỗi thiếu size, đường và đá vì dễ tái hiện, không phụ thuộc mạng.
- Phương án thứ hai là tìm một từ khóa không tồn tại để hiển thị empty state.
- Không dùng lỗi Geoapify làm trường hợp chính vì kết quả phụ thuộc cấu hình `GEOAPIFY_API_KEY` và mạng.
- Nếu admin chưa có dữ liệu, tạo đơn storefront trước rồi mới mở sổ đơn.

## Danh sách ảnh chụp cần chuẩn bị

| STT | Ảnh cần có | Trạng thái hiện tại | Slide sử dụng |
|---:|---|---|---:|
| 1 | Hero trang chủ desktop | Có ảnh tại `.impeccable/review/tablet-1024.png`, nên chụp mới nếu giao diện đã đổi | 1, 2 |
| 2 | Menu với từ khóa, danh mục và sắp xếp đang áp dụng | `[CẦN BỔ SUNG]` | 7 |
| 3 | Empty state khi không có sản phẩm phù hợp | `[CẦN BỔ SUNG]` | 7, 17 |
| 4 | Chi tiết sản phẩm trước khi chọn tùy chỉnh | `[CẦN BỔ SUNG]` | 8 |
| 5 | Chi tiết sản phẩm sau khi chọn size L và topping | `[CẦN BỔ SUNG]` | 8 |
| 6 | Validation thiếu size, đường và đá | `[CẦN BỔ SUNG]` | 8, 17 |
| 7 | Giỏ hàng có ít nhất một món | `[CẦN BỔ SUNG]` | 9 |
| 8 | Checkout COD với dữ liệu thử nghiệm | `[CẦN BỔ SUNG]` | 9 |
| 9 | QR mô phỏng và cảnh báo không thanh toán thật | `[CẦN BỔ SUNG]` | 9 |
| 10 | Trang tạo đơn thành công có mã TSN | `[CẦN BỔ SUNG]` | 9, 17 |
| 11 | Trang đăng nhập admin desktop | Có tại `.impeccable/review/admin-login-desktop.png` | 11 |
| 12 | Trang đăng nhập admin mobile | Có tại `.impeccable/review/admin-login-mobile.png` | 11, 13 |
| 13 | Dashboard admin với dữ liệu thử nghiệm | `[CẦN BỔ SUNG]` | 12 |
| 14 | Sổ đơn đang tìm mã đơn vừa tạo | `[CẦN BỔ SUNG]` | 12, 17 |
| 15 | Chi tiết đơn, lịch sử trạng thái và audit | `[CẦN BỔ SUNG]` | 12 |
| 16 | Cùng một màn hình ở 390 px, 768 px và 1366 px | `[CẦN BỔ SUNG]`, có thể dùng ảnh tablet sẵn có làm một phần | 13 |
| 17 | Kết quả test hoặc terminal đã che dữ liệu nhạy cảm | `[CẦN BỔ SUNG]`, có log văn bản trong `docs/audit/evidence/` | 14 |
| 18 | Sơ đồ kiến trúc | Có tại `docs/report-assets/architecture.png` | 4 |
| 19 | ERD | Có tại `docs/report-assets/erd.png` | 5 |
| 20 | Luồng đặt hàng và state machine | Có tại `docs/report-assets/order-flow.png` và `order-state-machine.png` | 6, 12 |

## Danh sách nội dung cần bổ sung

### Ưu tiên cao để đáp ứng đề bài

- `[CẦN BỔ SUNG]` Trang liên hệ và luồng lưu hoặc gửi feedback.
- `[CẦN BỔ SUNG]` Giá cũ, giá mới và quy tắc khuyến mại thực sự.
- `[CẦN BỔ SUNG]` Trang chính sách đổi trả, vận chuyển và cách xử lý yêu cầu bảo hành đối với đồ uống.
- `[CẦN BỔ SUNG]` Google Maps hoặc bản đồ vị trí cửa hàng.
- `[CẦN BỔ SUNG]` Đánh giá sản phẩm và bình luận, gồm UI, API và dữ liệu.
- `[CẦN BỔ SUNG]` Làm rõ yêu cầu đăng nhập có bắt buộc cho khách hàng hay đăng nhập admin đã đủ. Source hiện chỉ có auth admin.
- `[CẦN BỔ SUNG]` Chức năng admin quản lý sản phẩm, danh mục, giá, khuyến mại và phản hồi nếu giảng viên yêu cầu phạm vi quản trị đầy đủ.
- `[CẦN BỔ SUNG]` Triển khai website lên môi trường công khai, cấu hình D1 remote, secret, admin production và smoke test.

### Thông tin nhóm và bằng chứng trình bày

- `[CẦN BỔ SUNG]` Số nhóm, tên môn, giảng viên, lớp và thời gian thực hiện.
- `[CẦN BỔ SUNG]` Danh sách thành viên, phần việc và tỷ lệ tham gia có tổng bằng 100%.
- `[CẦN BỔ SUNG]` Ảnh dashboard, danh sách đơn và chi tiết đơn sau khi đăng nhập.
- `[CẦN BỔ SUNG]` Video demo dự phòng dài không quá 4 phút.
- `[CẦN XÁC NHẬN]` Thời lượng chính thức do giảng viên quy định.

### Khoảng trống kiểm thử đã biết

- `[CHƯA KIỂM THỬ]` Firefox và Safari.
- `[CHƯA KIỂM THỬ]` Thiết bị vật lý trong báo cáo gần nhất.
- `[CHƯA KIỂM THỬ]` Zoom 200% và screen reader thật.
- `[CHƯA KIỂM THỬ]` Production smoke, DNS, TLS và D1 remote.
- `[CHƯA TRIỂN KHAI]` Unit test suite tách biệt và end-to-end automation đa trình duyệt.

## Checklist trước khi trình chiếu

### Nội dung

- [ ] Điền số nhóm, môn học, giảng viên và thông tin thành viên.
- [ ] Kiểm tra tổng tỷ lệ tham gia bằng 100%.
- [ ] Giữ đúng trạng thái “mô phỏng” đối với COD và QR.
- [ ] Không tuyên bố website đã deploy nếu chưa có URL public được kiểm tra.
- [ ] Cập nhật bảng yêu cầu nếu nhóm bổ sung chức năng sau ngày lập dàn ý.
- [ ] Mỗi slide có tối đa 3 đến 5 ý hiển thị chính.
- [ ] Tất cả số liệu đều có đường dẫn bằng chứng trong source hoặc tài liệu QA.

### Hình ảnh và bố cục

- [ ] Ảnh chụp rõ, cùng tỷ lệ và không lộ dữ liệu thật.
- [ ] Font thân bài đủ lớn để đọc từ cuối lớp.
- [ ] Không nhồi nhiều ảnh nhỏ trên một slide.
- [ ] Sơ đồ kiến trúc và ERD đọc được khi trình chiếu toàn màn hình.
- [ ] Các nhãn `[CẦN BỔ SUNG]` còn lại đã được nhóm xem xét.
- [ ] Màu chữ có độ tương phản tốt trên nền.

### Demo

- [ ] Database local đã migration thành công.
- [ ] Tài khoản admin demo đã được tạo và đăng nhập thử.
- [ ] Website storefront và admin mở được trên máy trình chiếu.
- [ ] Dữ liệu thử nghiệm không chứa thông tin cá nhân thật.
- [ ] Đã tập luồng demo trong 3 phút 30 giây.
- [ ] Đã chuẩn bị video quay màn hình dự phòng.
- [ ] Đã tắt thông báo hệ điều hành và đóng các tab không liên quan.
- [ ] Người demo biết cách quay lại slide 17 sau khi kết thúc.

### Hỏi đáp

- [ ] Giải thích được vì sao server tính lại giá.
- [ ] Giải thích được sự khác nhau giữa localStorage và D1.
- [ ] Giải thích được QR mô phỏng không phải thanh toán thật.
- [ ] Nêu được chức năng nào còn thiếu so với đề bài.
- [ ] Nêu được lý do production chưa sẵn sàng.
- [ ] Mỗi thành viên chuẩn bị ít nhất một câu trả lời thuộc phần mình phụ trách.

## Checklist đóng gói bài nộp

- [ ] Source code đã loại file secret và dữ liệu cá nhân thật.
- [ ] Có file báo cáo Word `.docx` mở được.
- [ ] Báo cáo có danh sách thành viên, phần trăm tham gia và ghi chú cần thiết.
- [ ] Có file trình chiếu cuối cùng.
- [ ] Các font hoặc media cần thiết đã được nhúng hoặc đi kèm đúng cách.
- [ ] Chỉ giữ các sản phẩm cần nộp, không đóng gói cache hoặc dependency không cần thiết nếu giảng viên không yêu cầu.
- [ ] Ba thành phần source code, báo cáo Word và trình chiếu nằm trong cùng một file ZIP.
- [ ] Tên ZIP đúng mẫu `TMDT_NHOM_[SỐ_NHÓM].zip`.
- [ ] Đã giải nén thử vào một thư mục khác và kiểm tra mọi file mở được.
- [ ] Đã kiểm tra source có hướng dẫn chạy local và file `.env.example` không chứa secret.
- [ ] Một người đại diện nhóm nộp lên đúng hệ thống course.
- [ ] Đã đối chiếu hạn nộp và tải lại file từ hệ thống để xác nhận bản nộp không hỏng.

## Nguồn kiểm chứng chính

- Đề bài: `D:\Download\TMDT_CASE STUDY (1).pdf`.
- Tổng quan dự án: `README.md`, `PRODUCT.md`, `DESIGN.md`.
- Storefront: `app/components/TeaShop.tsx`, `app/data/products.ts`, `app/data/pricing.ts`.
- Checkout và đơn hàng: `app/lib/`, `app/server/orders/`, `app/server/payments/`.
- Admin và xác thực: `app/admin/`, `app/api/admin/`, `app/server/admin/`, `app/server/auth/`.
- Database: `db/schema.ts`, `drizzle/0000_material_maestro.sql`.
- Kiểm thử: `tests/`, `docs/qa/TEST_RESULTS.md`, `docs/RESPONSIVE_TEST_REPORT.md`, `docs/ADMIN_TEST_REPORT.md`.
- Triển khai: `.env.example`, `vite.config.ts`, `wrangler.jsonc`, `worker/index.ts`, `docs/PRODUCTION_DOMAIN_MIGRATION.md`.

