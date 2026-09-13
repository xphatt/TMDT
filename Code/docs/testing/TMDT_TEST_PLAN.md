# Kế hoạch kiểm thử dự án TMDT — Trà Sữa Ngon

## 1. Thông tin tài liệu

| Thuộc tính | Giá trị |
|---|---|
| Dự án | Website thương mại điện tử Trà Sữa Ngon |
| Source được kiểm tra | `D:\TMDT` |
| Môi trường phát triển | `http://localhost:3000` |
| Ngày kiểm tra | 2026-09-13 |
| Phạm vi | Kiểm thử chỉ đọc; không sửa source, không cài dependency, không đổi database/schema, không deploy, không commit/push |
| Kết luận dự kiến | Đánh giá mức sẵn sàng chức năng, UI, bảo mật, hiệu năng, build và bàn giao |

## 2. Mục tiêu

- Xác minh các chức năng mua hàng, quản trị, nội dung và tương tác người dùng hoạt động đúng.
- Kiểm tra khả năng xử lý dữ liệu không hợp lệ, lỗi mạng, phân quyền và các rủi ro bảo mật phổ biến.
- Đánh giá responsive, accessibility, trạng thái loading/empty/error và tính nhất quán của giao diện.
- Xác minh lint, typecheck, unit test, integration test và production build.
- Kiểm tra khả năng bàn giao qua Git, cấu hình triển khai, tài liệu và bằng chứng kiểm thử.

## 3. Phạm vi và giới hạn

### Trong phạm vi

- Storefront, menu, tìm kiếm/lọc/sắp xếp, tùy chọn sản phẩm, giỏ hàng, checkout.
- Feedback, review, khuyến mãi, chính sách, thông tin cửa hàng và quản trị.
- API công khai và API quản trị; xác thực, CSRF, session, validation, idempotency.
- Responsive desktop/mobile, keyboard focus, touch target, overflow và tiếng Việt.
- Lint, typecheck, unit/integration/UI test, build và smoke test runtime.
- Kiểm tra Git, `.gitignore`, README, cấu hình deployment và bằng chứng demo.

### Ngoài phạm vi hoặc bị giới hạn

- Không tạo đơn hàng/feedback/review thật trên D1 đang chạy để tránh thay đổi dữ liệu.
- Không thực hiện thanh toán thật.
- Không có tài khoản kiểm thử hợp lệ nên không thao tác UI quản trị sau đăng nhập.
- Không có Chrome, Edge, Firefox, Safari/WebKit độc lập trong môi trường; browser UI chỉ chạy bằng Codex In-app Browser.
- Không deploy lên hạ tầng công khai.
- Không sửa lỗi hoặc bổ sung test vào source trong đợt audit này.

## 4. Môi trường kiểm thử

| Thành phần | Cấu hình |
|---|---|
| Hệ điều hành | Windows |
| Node.js | v24.15.0 |
| npm | 11.12.1 |
| Frontend | React 19.2.6, TypeScript 5.9.3, Vinext 1.0.0-beta.2, Vite 8.0.13 |
| Backend/runtime | Cloudflare Workers, Wrangler 4.92.0, D1/Drizzle |
| URL runtime | `http://127.0.0.1:3000` |
| Browser UI | Codex In-app Browser |
| Viewport | 320×568, 360×800, 390×844, 412×915, 768×1024, 1024×768, 1366×768, 1920×1080 |

## 5. Tiêu chí trạng thái

| Trạng thái | Ý nghĩa |
|---|---|
| PASS | Có bằng chứng chức năng đáp ứng yêu cầu trong phạm vi kiểm tra |
| PARTIAL | Phần chính đạt nhưng còn khoảng trống hoặc chưa kiểm tra được toàn bộ |
| FAIL | Có lỗi tái hiện được làm yêu cầu không đạt |
| NEEDS CONFIG | Source có hỗ trợ nhưng thiếu cấu hình môi trường cần thiết |
| NOT TESTED | Không đủ môi trường, dữ liệu hoặc quyền để kiểm tra |
| NOT DEPLOYED | Chưa có bản chạy công khai để xác minh production |

## 6. Tiêu chí mức độ lỗi

| Mức | Định nghĩa |
|---|---|
| P0 | Mất dữ liệu, lộ bí mật nghiêm trọng, hệ thống hoàn toàn không dùng được hoặc có sự cố production khẩn cấp |
| P1 | Chặn demo/bàn giao, chức năng cốt lõi không dùng được, thiếu artifact bắt buộc hoặc rủi ro cấu hình lớn |
| P2 | Chức năng phụ/UX/khả năng tương thích chưa đầy đủ nhưng có đường đi thay thế |
| P3 | Cải tiến chất lượng, nhất quán, tài liệu hoặc maintainability; không chặn luồng chính |

## 7. Danh sách test case

| ID | Nhóm | Kịch bản | Kết quả mong đợi | Phương pháp |
|---|---|---|---|---|
| CAT-01 | Danh mục | Mở trang thực đơn | Hiển thị đầy đủ sản phẩm, không lỗi API | UI + API |
| CAT-02 | Danh mục | Lọc theo loại Trà sữa | Chỉ còn sản phẩm đúng loại | UI |
| CAT-03 | Danh mục | Tìm từ có dấu `đào` | Trả đúng sản phẩm liên quan | UI |
| CAT-04 | Danh mục | Tìm tương đương không dấu `dao` | Kết quả tương đương tìm có dấu | UI |
| CAT-05 | Danh mục | Tìm ký tự không khớp | Hiển thị empty state rõ ràng | UI |
| CAT-06 | Danh mục | Kết hợp lọc và tìm kiếm | Danh sách thỏa đồng thời hai điều kiện | UI |
| SORT-01 | Sắp xếp | Giá tăng dần | Thứ tự giá từ thấp đến cao | UI |
| SORT-02 | Sắp xếp | Giá giảm dần | Thứ tự giá từ cao đến thấp | UI |
| SORT-03 | Sắp xếp | Tên A–Z | Thứ tự tên đúng theo lựa chọn | UI |
| AUTH-01 | Xác thực | Truy cập `/admin` khi chưa đăng nhập | Chuyển đến trang đăng nhập | UI + HTTP |
| AUTH-02 | Xác thực | Gửi API admin khi chưa đăng nhập | HTTP 401, không lộ dữ liệu | API |
| AUTH-03 | Xác thực | Đăng nhập đúng, đăng xuất | Tạo/hủy session an toàn | UI |
| AUTH-04 | Xác thực | Sai mật khẩu nhiều lần | Giới hạn tần suất và phản hồi an toàn | Automated test + source review |
| CART-01 | Sản phẩm | Thêm khi chưa chọn tùy chọn bắt buộc | Báo lỗi size/đường/đá | UI |
| CART-02 | Sản phẩm | Thêm size, đường, đá, topping, số lượng | Giá và cấu hình vào giỏ chính xác | UI |
| CART-03 | Giỏ hàng | Tăng/giảm số lượng | Tổng tiền cập nhật; không có số âm | UI |
| CART-04 | Giỏ hàng | Giảm từ 1 | Xóa sản phẩm, hiển thị empty state | UI |
| CART-05 | Giỏ hàng | Tải lại ứng dụng | Giỏ hàng được khôi phục từ local storage | Source + automated test |
| ORDER-01 | Checkout | Gửi form trống | Báo lỗi từng trường và focus vào vùng lỗi | UI |
| ORDER-02 | Checkout | Dữ liệu không hợp lệ | API trả lỗi rõ, không ghi đơn | API + automated test |
| ORDER-03 | Checkout | Client tự sửa giá | Server tính lại giá theo catalog | Automated integration |
| ORDER-04 | Checkout | Gửi lại cùng request id | Idempotency ngăn tạo đơn trùng | Automated integration |
| ORDER-05 | Checkout | Tạo đơn hợp lệ | Đơn ở trạng thái phù hợp, không tự coi là đã thanh toán | Automated integration |
| IMG-01 | Hình ảnh | Tải ảnh sản phẩm và asset gốc | HTTP 200, ảnh hiển thị và có alt | HTTP + UI + source review |
| IMG-02 | Hình ảnh | URL tối ưu hóa ảnh | HTTP 200 | HTTP |
| IMG-03 | Hình ảnh | Ảnh lỗi | Có fallback hợp lý, không phá layout | Source review |
| RESP-01 | Responsive | Storefront ở 8 viewport | Không tràn ngang, nội dung và controls dùng được | UI metrics |
| RESP-02 | Responsive | Admin login ở 8 viewport | Không tràn ngang, controls dùng được | UI metrics |
| RESP-03 | Responsive | Admin sau đăng nhập | Bảng/form không tràn, thao tác được | UI |
| A11Y-01 | Accessibility | Điều hướng bằng bàn phím | Focus rõ, skip link và thứ tự focus hợp lý | UI + automated test |
| A11Y-02 | Accessibility | Touch target | Controls chính tối thiểu khoảng 44×44 px | UI metrics + automated test |
| A11Y-03 | Accessibility | Semantic/accessible name | Heading, button, image có tên/alt phù hợp | Accessibility tree |
| FEED-01 | Liên hệ | Gửi form trống/sai | Báo lỗi tiếng Việt theo trường | UI |
| FEED-02 | Liên hệ | Gửi feedback hợp lệ | Lưu dữ liệu, hỗ trợ idempotency, admin đọc được | Automated integration |
| PROMO-01 | Khuyến mãi | Áp dụng logic khuyến mãi | Tổng tiền do server quyết định | Automated integration |
| PROMO-02 | Khuyến mãi | Admin CRUD khuyến mãi | Có auth/CSRF và audit phù hợp | Automated integration + source review |
| POLICY-01 | Chính sách | Mở đổi trả | Có nội dung, heading và không overflow | UI + HTTP |
| POLICY-02 | Chính sách | Mở bảo hành | Có nội dung, heading và không overflow | UI + HTTP |
| POLICY-03 | Chính sách | Mở vận chuyển | Có nội dung, heading và không overflow | UI + HTTP |
| MAP-01 | Bản đồ | Tải thông tin cửa hàng | Hiển thị địa chỉ và link bản đồ khi đã cấu hình | UI + API |
| MAP-02 | Bản đồ | Thiếu cấu hình địa chỉ | Hiển thị trạng thái cấu hình thiếu, không crash | UI |
| REVIEW-01 | Đánh giá | Gửi dữ liệu thiếu/sai số sao | Báo lỗi rõ, không ghi dữ liệu | UI + automated test |
| REVIEW-02 | Đánh giá | Tạo/sửa/xóa đánh giá của chủ sở hữu | Ownership token được kiểm tra | Automated integration + source review |
| REVIEW-03 | Đánh giá | Admin kiểm duyệt | Yêu cầu auth/CSRF, cập nhật aggregate đúng | Automated integration |
| ADMIN-01 | Quản trị | Dashboard khi chưa auth | HTTP 401/redirect | API + UI |
| ADMIN-02 | Quản trị | Quản lý đơn hàng | Chuyển trạng thái hợp lệ, lưu history/audit | Automated integration |
| ADMIN-03 | Quản trị | Quản lý catalog/feedback/review/promotion | CRUD và phân quyền đúng | Automated integration + source review |
| SEC-01 | Bảo mật | Payload XSS/HTML trong form | Validation/rejection; không thực thi script | API + source review |
| SEC-02 | Bảo mật | Session cookie | HttpOnly, Secure trên HTTPS, SameSite phù hợp | Source review |
| SEC-03 | Bảo mật | CSRF và same-origin | Mutation admin bị từ chối khi thiếu token/origin | Automated test + source review |
| SEC-04 | Bảo mật | Security headers | DENY frame, nosniff, no-referrer, no-store cho admin | HTTP |
| SEC-05 | Bảo mật | Secret scan | Không có secret thật trong source/test | Automated test + scan |
| ERR-01 | Xử lý lỗi | API không tồn tại | HTTP 404, không crash | HTTP |
| ERR-02 | Xử lý lỗi | Lỗi timeout demo | UI/API trả lỗi rõ và có thể thử lại | Runtime smoke + automated UI test |
| PERF-01 | Hiệu năng | 50 request, concurrency 5 | Không lỗi; ghi throughput và percentile latency | Temporary load harness |
| PERF-02 | Hiệu năng | 200 request, concurrency 20 | Không lỗi; ghi throughput và percentile latency | Temporary load harness |
| BUILD-01 | Chất lượng | ESLint | Không có lỗi lint | CLI |
| BUILD-02 | Chất lượng | TypeScript | Không có lỗi kiểu | CLI |
| BUILD-03 | Chất lượng | Unit/integration/UI tests | Tất cả test hiện có pass | CLI |
| BUILD-04 | Chất lượng | Production build | Build thành công, đủ route | CLI |
| DEPLOY-01 | Triển khai | Public URL/HTTPS | Có URL production truy cập được | Config + documentation review |
| GIT-01 | Bàn giao | Git status, tracked files, history | Source/config/test nằm đúng repo; `.gitignore` được track | Git inspection |
| DOC-01 | Tài liệu | README, báo cáo, video demo | Hướng dẫn chạy và link demo đầy đủ, không mâu thuẫn | Document review |

## 8. Điều kiện hoàn thành

- Không có lỗi P0 hoặc P1 chưa xử lý trước khi demo/bàn giao.
- Lint, typecheck, test và production build pass.
- Luồng mua hàng và quản trị chính có bằng chứng kiểm thử, gồm ít nhất một lỗi mạng/dữ liệu sai.
- Có benchmark tái chạy được với thông tin máy và ít nhất hai mức tải.
- Có kiểm thử các browser mục tiêu hoặc ghi rõ giới hạn được giảng viên/chủ dự án chấp nhận.
- Source, test, cấu hình mẫu và tài liệu đều nằm trong Git repository đúng cấu trúc.
- Có public deployment HTTPS và link video demo nếu đây là yêu cầu bàn giao.
