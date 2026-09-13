# Kết quả kiểm thử dự án TMDT — Trà Sữa Ngon

## 1. Kết luận tổng quan

**Kết luận: CHƯA ĐẦY ĐỦ để bàn giao cuối cùng.**

Phần ứng dụng chạy được và nền tảng kỹ thuật tốt: lint, typecheck, build và toàn bộ 23 test hiện có đều pass; storefront, giỏ hàng, validation, API và security controls chính có bằng chứng. Các điểm chặn bàn giao nằm ở Git/repository, deployment/video demo, cấu hình bản đồ và bằng chứng performance/cross-browser có thể tái chạy.

| Trạng thái | Số nhóm |
|---|---:|
| PASS | 6 |
| PARTIAL | 5 |
| NEEDS CONFIG | 1 |
| NOT DEPLOYED | 1 |
| Tổng | 13 |

### Thống kê test case

| Trạng thái | Số test case |
|---|---:|
| PASS | 52 |
| PARTIAL | 4 |
| FAIL | 3 |
| NOT TESTED | 2 |
| NEEDS CONFIG | 1 |
| NOT DEPLOYED | 1 |
| Tổng | 63 |

## 2. Kết quả theo 13 nhóm yêu cầu

| STT | Nhóm | Trạng thái | Bằng chứng chính | Việc còn thiếu |
|---:|---|---|---|---|
| 1 | Lọc và tìm kiếm sản phẩm | PARTIAL | Menu có 12 sản phẩm; lọc Trà sữa còn 3; tìm `đào` trả đúng 1; empty state hoạt động | Tìm `dao` không trả kết quả; cần hỗ trợ tìm không dấu |
| 2 | Sắp xếp | PASS | Giá tăng/giảm và tên A–Z cho kết quả đúng | Không có lỗi chặn được ghi nhận |
| 3 | Đăng nhập/đăng xuất | PARTIAL | `/admin` redirect login; API admin trả 401; rate-limit/session/CSRF có test và source evidence | Không có credential test nên chưa chạy login/logout UI hợp lệ; không thấy luồng tài khoản khách hàng nếu yêu cầu đó áp dụng |
| 4 | Giỏ hàng/checkout | PASS | Tùy chọn bắt buộc, topping, số lượng, xóa item, tổng 39.000 + 18.000 = 57.000, lỗi form và server-owned total đều đúng | Không tạo đơn thật trên D1 theo ràng buộc audit chỉ đọc |
| 5 | Hình ảnh | PARTIAL | Asset gốc và URL tối ưu trả 200; ảnh có alt/sizes | Asset nguồn 1,1–1,9 MB, nhiều sản phẩm dùng chung ảnh/crop; chưa có fallback ảnh lỗi rõ ràng |
| 6 | Responsive/accessibility | PARTIAL | Storefront và admin login không overflow tại 8 viewport; không thấy control dưới 44 px; skip link/focus/accessible names có bằng chứng | Chưa kiểm admin sau login và chưa chạy browser engine độc lập |
| 7 | Liên hệ/feedback | PASS | Validation tiếng Việt hoạt động; integration test xác minh persistence, idempotency và admin protection | Không gửi feedback thật để tránh thay đổi D1 |
| 8 | Khuyến mãi | PASS | CRUD/catalogue/promotion và server-owned totals được integration test | Browser UI admin chưa được thao tác vì thiếu credential |
| 9 | Chính sách | PASS | Ba route đổi trả, bảo hành, vận chuyển trả nội dung đúng, không overflow | Không có lỗi chặn được ghi nhận |
| 10 | Bản đồ/thông tin cửa hàng | NEEDS CONFIG | UI xử lý an toàn khi thiếu cấu hình | `STORE_ADDRESS` chưa được cấu hình nên chưa có link bản đồ thực tế |
| 11 | Đánh giá sản phẩm | PASS | Validation 1–5 sao, persistence, aggregate, ownership và moderation đều có test | Không ghi review thật vào D1 |
| 12 | Quản trị | PARTIAL | Auth, dashboard API, order workflow, status history và audit có integration/source evidence | Chưa browser-test dashboard và CRUD sau đăng nhập |
| 13 | Build/deployment | NOT DEPLOYED | Dev runtime khỏe; production build pass | Không có public URL/HTTPS; cấu hình Wrangler dùng D1 id mẫu; README xác nhận chưa public deploy |

## 3. Lệnh đã chạy

| Lệnh/kiểm tra | Kết quả |
|---|---|
| `node --version` | PASS — v24.15.0 |
| `npm --version` | PASS — 11.12.1 |
| `npm run lint` | PASS — exit code 0 |
| `npm run typecheck` | PASS — exit code 0 |
| `npm run test:unit` | PASS — 5/5 |
| `npm test` | PASS — 23/23; production build thành công |
| `GET /api/health` | PASS — HTTP 200, database reported connected |
| `GET /api/menu` | PASS — HTTP 200 |
| `GET /api/admin/orders` không auth | PASS — HTTP 401 |
| `GET /api/admin/dashboard` không auth | PASS — HTTP 401 |
| `POST /api/feedback` dữ liệu sai/XSS | PASS — HTTP 400, không ghi dữ liệu |
| `GET /api/address?q=ab` | PASS — HTTP 400 |
| Route không tồn tại | PASS — HTTP 404 |
| Asset ảnh gốc và URL tối ưu | PASS — HTTP 200 |
| `GET /admin` không auth | PASS — HTTP 307 đến login |
| Server phụ port 3001, demo mode tắt, `POST /api/orders {}` | PASS — HTTP 400 `invalid_order`; server do audit tạo đã được dừng |

## 4. Kết quả test tự động

| Nhóm | Số test | Kết quả |
|---|---:|---|
| Unit | 5 | PASS |
| Render/integration/UI | 18 | PASS |
| Tổng | 23 | PASS |

Các test hiện có bao phủ validation/persistence feedback; review và ownership/moderation; promotion/catalogue; server-owned order totals; idempotency; health/storefront/robots/sitemap/menu; Geoapify error handling; admin auth, rate limit, order workflow, audit; keyboard focus, checkout errors, closed drawer focusability và touch target.

## 5. Smoke test runtime và API

- Port 3000 đã có process chạy trước audit; audit không dừng hoặc thay đổi process đó.
- Health endpoint trả `status=ok` và `database=connected`.
- Server hiện tại đang bật kịch bản demo lỗi checkout: payload đơn hàng không hợp lệ nhận HTTP 503 `demo_checkout_timeout` thay vì validation thông thường.
- Một server tạm ở port 3001 với demo mode tắt được dùng để xác minh validation chuẩn trả HTTP 400; process tạm đã được dừng.
- Header quản trị quan sát được: `Cache-Control: no-store`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`.

## 6. Kết quả UI và nghiệp vụ

### Danh mục, lọc, tìm kiếm và sắp xếp

- Menu hiển thị 12 sản phẩm.
- Lọc `Trà sữa` hiển thị 3 sản phẩm.
- Tìm `đào` hiển thị `Trà Đào Cam Sả`.
- Tìm `dao` hiển thị 0 sản phẩm: tìm kiếm chưa bỏ dấu tiếng Việt.
- Tìm `!!!` hiển thị empty state `Chưa tìm thấy món phù hợp`.
- Kết hợp từ `oolong` và bộ lọc trả đúng một sản phẩm.
- Giá tăng dần: 39.000, 42.000, 43.000; giá giảm dần đảo ngược; tên A–Z đúng.

### Cấu hình sản phẩm và giỏ hàng

- Không chọn size/đường/đá: UI báo `Vui lòng chọn size/mức đường/mức đá.`.
- Chọn size M, đường 50%, đá vừa, topping trân châu đen, số lượng 2: tổng item 92.000 đồng.
- Giảm 2 → 1: còn 46.000 đồng; giảm 1 → 0: item được xóa và xuất hiện empty state.
- Một sản phẩm 39.000 đồng cộng phí giao 18.000 đồng cho tổng 57.000 đồng.
- Form checkout trống/sai hiển thị validation summary và chuyển focus tới vùng lỗi.

### Liên hệ, review và chính sách

- Form liên hệ trống hiển thị lỗi tiếng Việt theo trường.
- Form review thiếu tên/số sao/nội dung báo lỗi rõ ràng.
- Ba trang chính sách có heading/nội dung và không bị overflow.
- Khu vực cửa hàng báo thiếu `STORE_ADDRESS`; không tạo link bản đồ giả.

## 7. Responsive và accessibility

### Storefront

| Viewport | Overflow ngang | Control dưới 44 px | Kết quả |
|---|---:|---:|---|
| 320×568 | Không | 0 | PASS |
| 360×800 | Không | 0 | PASS |
| 390×844 | Không | 0 | PASS |
| 412×915 | Không | 0 | PASS |
| 768×1024 | Không | 0 | PASS |
| 1024×768 | Không | 0 | PASS |
| 1366×768 | Không | 0 | PASS |
| 1920×1080 | Không | 0 | PASS |

### Admin login

| Viewport | Overflow ngang | Control dưới 44 px | Kết quả |
|---|---:|---:|---|
| 320×568 | Không | 0 | PASS |
| 360×800 | Không | 0 | PASS |
| 390×844 | Không | 0 | PASS |
| 412×915 | Không | 0 | PASS |
| 768×1024 | Không | 0 | PASS |
| 1024×768 | Không | 0 | PASS |
| 1366×768 | Không | 0 | PASS |
| 1920×1080 | Không | 0 | PASS |

Accessibility tree ghi nhận skip link, heading có cấu trúc, button có accessible name và ảnh có alt. Automated test cũng xác minh keyboard focus, drawer đóng không còn focusable và touch target. Chưa có audit WCAG tự động đầy đủ hoặc screen reader thực tế.

## 8. Hiệu năng tạm thời

Endpoint: `GET /api/menu` trên local runtime.

| Mức tải | Tổng thời gian | Throughput | p50 | p95 | Max | Lỗi |
|---|---:|---:|---:|---:|---:|---:|
| 50 request, concurrency 5 | 647,90 ms | 77,17 req/s | 57,42 ms | 81,34 ms | 104,18 ms | 0 |
| 200 request, concurrency 20 | 1.819,76 ms | 109,90 req/s | 180,70 ms | 194,45 ms | 203,16 ms | 0 |

Đây là harness tạm trong phiên audit, không phải benchmark được lưu trong repository. Kết quả chưa có CPU/RAM, cấu hình phần cứng chi tiết hoặc môi trường production nên không dùng làm SLA.

## 9. Security review

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| API admin khi chưa auth | PASS | HTTP 401 |
| Session storage | PASS theo source/test | Token băm; cookie HttpOnly; Secure trên HTTPS |
| CSRF/same-origin | PASS theo source/test | Mutation admin yêu cầu token/origin |
| Password | PASS theo source | PBKDF2, độ dài tối thiểu 12, dummy verification |
| Brute force | PASS theo test/source | Có rate limiting/login attempts |
| Server-owned pricing | PASS | Integration test tính lại giá từ catalog |
| Idempotency | PASS | Order/feedback có request id hoặc unique handling |
| Security headers | PASS | DENY frame, nosniff, no-referrer, no-store |
| Secret scan | PASS trong test hiện có | Không phát hiện secret thật được hard-code |
| Logging sự kiện | PARTIAL | Có audit log nghiệp vụ admin; không thấy logger runtime chung cho kết nối/lỗi hệ thống |

Không thực hiện pentest phá hoại, credential stuffing, fuzzing tải cao hoặc truy cập hạ tầng production.

## 10. Git, cấu trúc bàn giao và deployment

- `D:\TMDT` không phải Git repository.
- Git repository thực tế là `D:\TMDT\repository`, nhánh `main`.
- Repository này chỉ track 1 file: `README.md`; source trong `app/`, `worker/`, `tests/`, cấu hình và migration không nằm trong lịch sử Git đó.
- Worktree repository có README sửa đổi và nhiều file chưa track.
- Lịch sử hiện có 5 commit, đều của một tác giả; chưa có bằng chứng đóng góp của nhiều thành viên nếu môn học yêu cầu.
- `.gitignore` ở root có rule hợp lý cho env, dependency cache, build, Wrangler và log, nhưng không nằm trong repository thực tế.
- README xác nhận chưa public deployment; không có URL production/HTTPS.
- Không tìm thấy link video demo trong README/docs.
- `wrangler` dùng database id mẫu, cần cấu hình môi trường triển khai trước khi deploy.

## 11. UI design audit

Detector thiết kế hiện có ghi nhận 155 cảnh báo tư vấn: 73 font-size ngoài ramp, 63 màu ngoài palette, 18 radius ngoài scale và 1 nền grid admin. Đây là design-token drift, không đồng nghĩa 155 lỗi chức năng hoặc 155 lỗi WCAG. Kiểm tra trực quan ghi nhận hierarchy và thao tác chính rõ ràng; các cảnh báo nên được gom về token sau khi xử lý các lỗi bàn giao P1.

## 12. Giới hạn và quyết định kiểm thử

- Không có Chrome/Edge/Firefox/Safari/WebKit độc lập; kết quả responsive là của browser tích hợp.
- Không có credential admin kiểm thử, nên UI dashboard/CRUD sau login chưa được xác minh thủ công.
- Không gửi dữ liệu hợp lệ tới order, feedback hoặc review của runtime đang chạy để không thay đổi D1.
- Ảnh ở ngoài viewport có thể báo `naturalWidth=0` do lazy loading; URL ảnh đã được kiểm tra trực tiếp và trả HTTP 200 nên không coi đó là ảnh hỏng.
- Không dừng process port 3000 vì process đó không do audit tạo.

## 13. Quyết định phát hành

**NO-GO cho bàn giao cuối cùng; GO có điều kiện cho demo local kỹ thuật.**

Trước khi bàn giao cần tối thiểu: đưa toàn bộ source/test/config vào đúng Git repository; cấu hình địa chỉ/bản đồ; tắt kịch bản lỗi demo trong cấu hình chạy bình thường; bổ sung benchmark tái chạy được; kiểm tra browser mục tiêu và admin authenticated UI; public deploy HTTPS; cập nhật README/báo cáo và thêm video demo.

## Phụ lục A — Bảng kết quả từng test case

| TC ID | Yêu cầu | Tiền điều kiện | Bước kiểm thử | Mong đợi | Thực tế | Trạng thái | Bằng chứng |
|---|---|---|---|---|---|---|---|
| CAT-01 | Mở thực đơn | Server local khỏe | Mở menu | Có sản phẩm, không lỗi API | Có 12 sản phẩm | PASS | UI `/`; `GET /api/menu` 200; `app/data/products.ts:20` |
| CAT-02 | Lọc danh mục | Menu đã tải | Chọn Trà sữa | Chỉ sản phẩm đúng loại | Còn 3 sản phẩm | PASS | UI `/`; `app/components/TeaShop.tsx:191` |
| CAT-03 | Tìm có dấu | Menu đã tải | Nhập `đào` | Trả sản phẩm liên quan | Trả Trà Đào Cam Sả | PASS | UI `/` |
| CAT-04 | Tìm không dấu | Menu đã tải | Nhập `dao` | Tương đương `đào` | Không có kết quả | FAIL | UI `/`; `app/components/TeaShop.tsx:192`, `:196` |
| CAT-05 | Empty search | Menu đã tải | Nhập `!!!` | Empty state rõ | Hiện `Chưa tìm thấy món phù hợp` | PASS | UI `/` |
| CAT-06 | Tìm + lọc | Menu đã tải | Lọc Trà sữa, tìm `oolong` | Giao hai điều kiện | Còn đúng một món | PASS | UI `/`; `app/components/TeaShop.tsx:191-197` |
| SORT-01 | Giá tăng | Có kết quả | Chọn giá tăng | Thấp đến cao | 39k, 42k, 43k | PASS | UI `/` |
| SORT-02 | Giá giảm | Có kết quả | Chọn giá giảm | Cao đến thấp | Đảo đúng thứ tự | PASS | UI `/` |
| SORT-03 | Tên A–Z | Có kết quả | Chọn tên A–Z | Tên tăng dần | Đường Đen, Khoai Môn, Oolong | PASS | UI `/` |
| AUTH-01 | Route admin | Chưa auth | Mở `/admin` | Redirect login | HTTP 307 đúng | PASS | `GET /admin`; `app/server/auth/admin-request.ts:12` |
| AUTH-02 | API admin | Chưa auth | GET orders/dashboard | HTTP 401 | Cả hai trả 401 | PASS | `/api/admin/orders`, `/api/admin/dashboard` |
| AUTH-03 | Login/logout hợp lệ | Cần credential test | Login, refresh, logout | Session tạo/hủy đúng | Không có credential để chạy UI | NOT TESTED | Giới hạn môi trường; `docs/Bao_Cao_Tieu_Luan_TMDT.md:581` |
| AUTH-04 | Sai mật khẩu/rate limit | D1 test fixture | Chạy auth integration | Lỗi an toàn và khóa tạm | Test pass | PASS | `npm test`; `app/server/auth/admin-auth.ts:150-184` |
| CART-01 | Tùy chọn bắt buộc | Mở product config | Add khi bỏ trống | Báo size/đường/đá | Báo đúng | PASS | UI `/`; `app/components/TeaShop.tsx:266-269` |
| CART-02 | Thêm cấu hình đầy đủ | Chọn M/50%/vừa/topping | Add qty 2 | Giỏ đúng cấu hình/giá | 92.000 đồng | PASS | UI `/`; `app/components/TeaShop.tsx:274`, `:288` |
| CART-03 | Tăng/giảm | Có item qty 2 | Giảm còn 1 | Tổng cập nhật | Còn 46.000 đồng | PASS | UI `/`; `app/components/TeaShop.tsx:328` |
| CART-04 | Không số âm/xóa | Có item qty 1 | Giảm một lần | Xóa item | Item bị xóa, có empty state | PASS | UI `/`; `app/components/TeaShop.tsx:552` |
| CART-05 | Lưu giỏ | Browser có localStorage | Refresh/đọc storage | Giỏ được phục hồi | Adapter đọc/ghi có test | PASS | `app/lib/storage.ts:8-15`; `npm test` |
| ORDER-01 | Validate checkout | Có item | Submit form trống/sai | Lỗi và focus | Summary lỗi nhận focus | PASS | UI `/`; `app/components/TeaShop.tsx:420-423` |
| ORDER-02 | Payload sai | Demo mode tắt | POST `{}` | HTTP 400 | 400 `invalid_order` | PASS | Runtime port 3001; `app/server/orders/order-service.ts:40-48` |
| ORDER-03 | Chống sửa giá | Test fixture | Gửi giá client bị sửa | Server tính lại | Integration pass | PASS | `npm test`; `app/server/orders/order-service.ts:48-82` |
| ORDER-04 | Chống đơn trùng | Có request id | Gửi lặp | Trả cùng đơn | Integration pass | PASS | `npm test`; `app/server/orders/order-service.ts:99-104`, `:133-134` |
| ORDER-05 | Không paid giả | Payment mock | Tạo/xác nhận | Không tự paid | Integration pass | PASS | `npm test`; `app/components/TeaShop.tsx:478-489` |
| IMG-01 | Ảnh/alt | Menu tải | Quan sát + GET asset | Hiện ảnh, không 404 | Ảnh hiện, asset 200 | PASS | `/images/product-lineup.png`; `app/components/TeaShop.tsx:86` |
| IMG-02 | Image optimizer | Build/runtime khỏe | GET URL tối ưu | HTTP 200 | HTTP 200 | PASS | Runtime smoke |
| IMG-03 | Fallback ảnh lỗi | Source sẵn có | Review component | Có fallback | Không thấy `onError` fallback rõ | PARTIAL | `app/components/TeaShop.tsx:86` |
| RESP-01 | Storefront 8 viewport | Browser tích hợp | Đo 8 kích thước | Không overflow, touch ổn | Cả 8 đạt | PASS | `evidence/VIEWPORT_RESULTS.json` |
| RESP-02 | Admin login 8 viewport | Chưa auth | Đo 8 kích thước | Không overflow, touch ổn | Cả 8 đạt | PASS | `evidence/VIEWPORT_RESULTS.json` |
| RESP-03 | Admin authenticated | Credential test | Mở dashboard/CRUD đa viewport | Không overflow | Không có credential | NOT TESTED | Giới hạn môi trường |
| A11Y-01 | Keyboard/focus | Browser/test runner | Tab và submit lỗi | Focus rõ, đúng vùng | Skip link/focus test đạt | PASS | `npm test`; `app/components/TeaShop.tsx:423`, `:536` |
| A11Y-02 | Touch target | 8 viewport | Đo controls | Không control nhỏ | 0 control dưới 44 px | PASS | `evidence/VIEWPORT_RESULTS.json` |
| A11Y-03 | Semantic names | Trang đã render | Đọc accessibility tree | Heading/button/image có tên | Cấu trúc có tên rõ | PASS | Browser accessibility tree; `app/components/TeaShop.tsx:300-302` |
| FEED-01 | Feedback sai/trống | Form liên hệ | Submit trống | Lỗi tiếng Việt | Lỗi theo trường | PASS | UI `/`; `app/domain/completion-rules.ts:25` |
| FEED-02 | Feedback persistence | D1 test fixture | Chạy integration | Lưu/idempotent/admin đọc | Test pass | PASS | `npm test`; `app/server/engagement/engagement-service.ts:33-45` |
| PROMO-01 | Giá promotion | Catalog fixture | Chạy promotion/order tests | Giá cũ/mới và total đúng | Test pass | PASS | `npm test`; `app/data/promotions.ts:21-22`; `app/components/TeaShop.tsx:39-42` |
| PROMO-02 | Admin promotion CRUD | Admin test fixture | Chạy API integration | CRUD có auth/CSRF | API pass; UI chưa thao tác | PARTIAL | `npm test`; `app/api/admin/promotions/route.ts:14-15` |
| POLICY-01 | Đổi trả | Server khỏe | Mở route | Nội dung Việt, không overflow | Đạt | PASS | `/chinh-sach/doi-tra` |
| POLICY-02 | Bảo hành | Server khỏe | Mở route | Nội dung Việt, không overflow | Đạt | PASS | `/chinh-sach/bao-hanh` |
| POLICY-03 | Vận chuyển | Server khỏe | Mở route | Nội dung Việt, không overflow | Đạt | PASS | `/chinh-sach/van-chuyen`; `app/components/TeaShop.tsx:478` |
| MAP-01 | Bản đồ/chỉ đường | Cần STORE_ADDRESS | Mở liên hệ | Địa chỉ + Maps hoạt động | Thiếu cấu hình, không có link | NEEDS CONFIG | `.env.example:4`; `README.md:72` |
| MAP-02 | Fallback thiếu config | STORE_ADDRESS trống | Mở liên hệ | Không crash, báo rõ | Báo chưa cấu hình | PASS | UI `/`; `README.md:72` |
| REVIEW-01 | Review validation | Mở form | Submit thiếu/sai | Báo lỗi | Báo tên/sao/nội dung | PASS | UI `/`; `app/domain/completion-rules.ts:52-74` |
| REVIEW-02 | Ownership/persistence | D1 test fixture | Create/update/delete | Chỉ chủ sở hữu sửa/xóa | Test pass | PASS | `npm test`; `app/server/engagement/engagement-service.ts:106-128` |
| REVIEW-03 | Admin moderation | Admin fixture | Chạy moderation API | Auth/CSRF, aggregate đúng | API pass; UI chưa thao tác | PARTIAL | `npm test`; `app/api/admin/reviews/[id]/route.ts:7-19` |
| ADMIN-01 | Chặn user thường | Chưa auth | Mở route/API | Redirect/401 | Đúng | PASS | `/admin`; `/api/admin/dashboard` |
| ADMIN-02 | Order workflow | D1 test fixture | Search/transition/COD/audit | Dữ liệu/history đúng | Integration pass | PASS | `npm test`; `app/api/admin/orders/[id]/status/route.ts:12-29` |
| ADMIN-03 | Admin CRUD tổng thể | Admin fixture/credential | API + browser | CRUD và UI đầy đủ | API/source đạt, browser chưa chạy | PARTIAL | `npm test`; `app/api/admin/` |
| SEC-01 | XSS input | Local runtime | POST feedback nguy hiểm/sai | Từ chối, không thực thi | HTTP 400 | PASS | `/api/feedback`; `app/domain/completion-rules.ts:25` |
| SEC-02 | Cookie/session | Source/test | Review auth | HttpOnly/Secure/SameSite | Có triển khai | PASS | `app/server/auth/admin-request.ts:12-77` |
| SEC-03 | CSRF/origin | Admin mutation | Chạy integration/review route | Thiếu token bị từ chối | Có kiểm tra | PASS | `npm test`; `app/server/auth/admin-auth.ts:246-247` |
| SEC-04 | Security headers | Chưa auth | GET admin | Header bảo vệ | Đủ header đã liệt kê | PASS | Runtime HTTP; `worker/index.ts:37-43` |
| SEC-05 | Secret scan | Source/build | Chạy test scan | Không secret thật | Test pass | PASS | `npm test`; `.gitignore` root |
| ERR-01 | Route 404 | Server khỏe | GET route giả | 404, không crash | HTTP 404 | PASS | Runtime smoke |
| ERR-02 | Lỗi mạng/timeout | Demo error mode | Gọi checkout lỗi | Lỗi rõ, UI thử lại được | 503 scenario + UI error test pass | PASS | Runtime :3000; `npm test`; `app/components/TeaShop.tsx:451` |
| PERF-01 | Tải mức 1 | Local server | 50 req, c=5 | Không lỗi, có metrics | 0 lỗi; 77,17 req/s | PASS | `evidence/RUNTIME_EVIDENCE.md` |
| PERF-02 | Tải mức 2 | Local server | 200 req, c=20 | Không lỗi, có metrics | 0 lỗi; 109,90 req/s | PASS | `evidence/RUNTIME_EVIDENCE.md` |
| BUILD-01 | Lint | Dependency có sẵn | `npm run lint` | Exit 0 | Exit 0 | PASS | CLI 2026-09-13 |
| BUILD-02 | Typecheck | Dependency có sẵn | `npm run typecheck` | Exit 0 | Exit 0 | PASS | CLI 2026-09-13 |
| BUILD-03 | Tests | Dependency có sẵn | `npm test` | Tất cả pass | 23/23 pass | PASS | CLI 2026-09-13 |
| BUILD-04 | Production build | Dependency có sẵn | Build trong `npm test` | Build thành công | Thành công | PASS | CLI 2026-09-13 |
| DEPLOY-01 | Public deploy | Cần production env | Kiểm README/config/URL | HTTPS public hoạt động | Chưa triển khai | NOT DEPLOYED | `README.md:17`, `:225` |
| GIT-01 | Source trong Git | Source tại D:\TMDT | Git status/ls-files | Track source/test/config | Repo con chỉ track README | FAIL | `evidence/RUNTIME_EVIDENCE.md` |
| DOC-01 | Hồ sơ bàn giao | README/docs hiện có | Tìm video, đối chiếu số test | Đủ và nhất quán | Thiếu video; báo cáo ghi số test cũ | FAIL | `docs/Bao_Cao_Tieu_Luan_TMDT.md:617`, `:765`; `README.md:190` |
