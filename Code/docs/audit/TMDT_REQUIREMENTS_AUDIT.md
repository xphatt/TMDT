# Kiểm định yêu cầu dự án Trà Sữa Ngon

Ngày kiểm định: 2026-09-13  
Phạm vi: `D:\TMDT`  
Chế độ: audit chỉ đọc đối với source; không deploy, không ghi D1, không thanh toán thật, không commit/push.

## Kết luận điều hành

**Kết luận duy nhất: `CHƯA ĐẦY ĐỦ`.**

Dự án chạy tốt ở local, build production thành công và luồng cốt lõi menu → tùy chỉnh → giỏ → checkout mô phỏng đã có nhiều biện pháp an toàn. Tuy nhiên, đề kiểm định yêu cầu thêm các nhóm chưa tồn tại: liên hệ/feedback, khuyến mãi, chính sách, Google Maps, đánh giá/bình luận và phần lớn chức năng quản trị catalogue. Chưa có deployment công khai. Vì vậy dự án chưa đủ điều kiện nộp theo toàn bộ 13 nhóm yêu cầu.

| Chỉ số | Kết quả |
| --- | ---: |
| Tổng số nhóm yêu cầu | 13 |
| PASS | 1 |
| PARTIAL | 7 |
| FAIL | 5 |
| NOT TESTED / NEEDS CONFIG ở cấp nhóm | 0 |
| NOT DEPLOYED ở cấp nhóm | 0 (ghi nhận là tiểu trạng thái của REQ-13) |
| P0 | 0 |
| P1 | 10 vấn đề chính |

> `NEEDS CONFIG` vẫn xuất hiện ở tiểu mục Geoapify và `NOT DEPLOYED` ở tiểu mục production. Trạng thái tổng của REQ-04 và REQ-13 là `PARTIAL` vì trong mỗi nhóm vẫn có phần đã chạy đạt.

## Bảng kiểm định chính

| ID | Yêu cầu | Trạng thái | Bằng chứng | Phần đã có | Phần còn thiếu | Mức độ ưu tiên |
| -- | ------- | ---------- | ---------- | ---------- | -------------- | -------------- |
| REQ-01 | Lọc và tìm kiếm | PASS | `app/components/TeaShop.tsx:182-188`; `evidence/manual-runtime-observations.md` | Tìm tên/mô tả không phân biệt hoa thường; từ khóa trống/ký tự đặc biệt; lọc danh mục; kết hợp lọc+tìm; empty state; 12 sản phẩm không trùng. | Ô tìm không diễn giải tên danh mục thành từ khóa, nhưng danh mục đã có bộ lọc độc lập nên không chặn yêu cầu. | — |
| REQ-02 | Sắp xếp | PARTIAL | `app/components/TeaShop.tsx:13,188,205-209`; runtime trong `evidence/manual-runtime-observations.md` | Phổ biến, giá tăng, giá giảm; vẫn hoạt động sau lọc/tìm; select hiển thị trạng thái. | Không có sắp xếp theo tên. Có tag “Mới” nhưng không có trường ngày để sắp xếp mới nhất. | P1 |
| REQ-03 | Đăng nhập và đăng xuất | PARTIAL | `app/server/auth/admin-auth.ts:135-193,205-255`; `app/server/auth/admin-request.ts:28-90,105-109`; `tests/rendered-html.test.mjs:307`; `evidence/runtime-api-checks.txt` | Admin login thật trên D1, hash mật khẩu, rate limit, session 8 giờ, cookie HttpOnly/SameSite/Secure khi HTTPS, CSRF, role admin/operator, logout revoke, route/API admin được chặn. | Không có đăng nhập/đăng xuất khách hàng hoặc route tài khoản người dùng thường. Không thực hiện login D1 thật trong lượt audit để không thay đổi dữ liệu/attempt counter. | P1 |
| REQ-04 | Giỏ hàng và thanh toán | PARTIAL | `app/components/TeaShop.tsx:237-293,304-316,323-462,492-523`; `app/server/orders/order-service.ts:52-117,124-130`; `tests/rendered-html.test.mjs:197,248`; runtime manual | Tùy chỉnh size/đường/đá/topping; quantity 1–20; thêm/xóa/tăng/giảm; tính dòng/tổng; localStorage; validation; COD và QR mô phỏng; backend tính lại giá; đơn pending rồi confirmed nội bộ; không tự paid; UI chống double-click trong lúc submit. | Chưa có trang khách xem lại trạng thái/lịch sử; API tạo đơn chưa có idempotency key chống hai request create đồng thời; chưa kiểm thử checkout khi mất mạng bằng browser; Geoapify thật `NEEDS CONFIG`. | P1 |
| REQ-05 | Ảnh sản phẩm | PARTIAL | `app/data/products.ts:20-31`; `app/components/TeaShop.tsx:75-76,115-116,146`; `evidence/production-runtime-checks.txt`; `evidence/asset-and-secret-audit.txt` | Mọi sản phẩm có path ảnh/alt; Next Image có width/height/sizes và lazy mặc định cho ảnh ngoài màn hình; bốn asset trả HTTP 200 ở production server; không méo trong quan sát runtime. | Không có fallback `onError`; bốn PNG nguồn tổng khoảng 6,39 MB và nhiều sản phẩm dùng crop chung, cần tối ưu/đánh giá độ nét trên thiết bị thật. | P2 |
| REQ-06 | Responsive | PARTIAL | `app/globals.css:34-42,91-94,162,292-406`; `app/admin/admin.css:33-37,126,254-338`; `tests/ui-regression.test.mjs:10,28`; `evidence/manual-runtime-observations.md` | 8 viewport bắt buộc trên Chromium giả lập không cuộn ngang; header/menu, ảnh, checkout và admin login dùng được; focus rõ; vùng chạm chính ≥44 px hoặc label bao radio. | Chưa kiểm thử thiết bị vật lý, Firefox, Safari/WebKit và Edge trong lượt audit; chưa kiểm thử phóng chữ 200% toàn luồng. | P2 |
| REQ-07 | Liên hệ và feedback | FAIL | `app/components/TeaShop.tsx:12,477`; route table trong `evidence/npm-test.log`; schema exports `db/schema.ts:3-117` | Chỉ có hotline mẫu trong footer. | Không có trang/form liên hệ, validation, lưu/gửi feedback, chống gửi lặp hoặc admin feedback. | P1 |
| REQ-08 | Khuyến mãi, giá mới và giá cũ | FAIL | `app/data/products.ts:19-31`; `app/server/orders/order-service.ts:54-72`; `db/schema.ts:3-117` | Giá hiện hành nội bộ và backend tính lại giá, không tin giá client. | Không có old price/new price, discount percent, ngày bắt đầu/kết thúc, khuyến mãi hết hạn hay UI/admin quản lý khuyến mãi. | P1 |
| REQ-09 | Chính sách đổi trả, bảo hành và vận chuyển | FAIL | `app/components/TeaShop.tsx:12,316,477`; route table trong `evidence/npm-test.log` | Checkout hiển thị phí giao hàng mẫu 18.000 đồng và footer có hotline mẫu. | Không có nội dung/route riêng cho đổi trả, bảo hành hoặc lý do không áp dụng, phạm vi/thời gian giao, giao thất bại và điều khoản hỗ trợ. | P1 |
| REQ-10 | Google Maps | FAIL | `app/components/TeaShop.tsx:12,477`; route table trong `evidence/npm-test.log` | Không có. | Không có iframe/link Google Maps, vị trí cửa hàng, title accessibility hoặc fallback địa chỉ. | P1 |
| REQ-11 | Đánh giá sản phẩm và bình luận | FAIL | `app/components/TeaShop.tsx:12`; schema chỉ có 9 nhóm bảng tại `db/schema.ts:3,28,41,49,67,81,96,104,117`; route table trong `evidence/npm-test.log` | Không có. | Thiếu sao, bình luận, validation, lưu/hiển thị, trung bình/số lượt, sanitize/XSS, quyền sửa/xóa và empty state. | P1 |
| REQ-12 | Trang quản trị | PARTIAL | `app/admin/page.tsx:1-9`; `app/admin/orders/page.tsx:1-8`; `app/admin/orders/[id]/page.tsx:1-10`; `app/admin/components/AdminDashboard.tsx:8-69`; `app/admin/components/AdminOrderDetail.tsx:76-121`; `tests/rendered-html.test.mjs:307,334` | Auth/role thật; dashboard; danh sách/tìm/lọc đơn; chi tiết, tổng tiền/phương thức; state machine; xác nhận COD; audit history; confirm dialog; API bị chặn với khách. | Không có CRUD sản phẩm, danh mục, giá/khuyến mãi, ảnh; không có feedback/review management; không có thao tác xóa sản phẩm để kiểm tra confirm. | P1 |
| REQ-13 | Xây dựng và triển khai | PARTIAL | `package.json` scripts; `README.md:7-17,35-67,184`; `evidence/lint.log`; `evidence/typecheck.log`; `evidence/npm-test.log`; `evidence/production-runtime-checks.txt`; `evidence/public-deployment-check.txt` | Dev HTTP 200; lint/type-check pass; build pass; 13/13 tests pass; production server local trả 200 cho storefront/menu/assets; README và `.env.example` đầy đủ; site URL tách bằng env. | Production public `NOT DEPLOYED`; `trasuangon.com` không resolve trong kiểm tra; chưa xác minh HTTPS/refresh route/asset/API trên host công khai. Root `D:\TMDT` cũng không phải Git worktree nên không thể đối chiếu commit hiện hành trực tiếp. | P1 |

## Môi trường và lệnh đã chạy

| Kiểm tra | Kết quả | Bằng chứng |
| --- | --- | --- |
| `npm run lint` | PASS, exit 0 | `evidence/lint.log` |
| `npm run typecheck` | PASS, exit 0 | `evidence/typecheck.log` |
| `npm test` | PASS, production build thành công; 13/13 test pass | `evidence/npm-test.log` |
| Development server | PASS, `/` HTTP 200 tại `localhost:3000` | `evidence/home-response-headers.txt`, `evidence/dev-server.log` |
| Production server local | PASS tại port 3100; `/`, `/api/menu` và 4 ảnh HTTP 200; `/admin` 307 | `evidence/production-runtime-checks.txt` |
| Admin protection | PASS, `/admin` 307; dashboard API 401 khi không có session | `evidence/runtime-api-checks.txt` |
| Geoapify chưa cấu hình | EXPECTED/NEEDS CONFIG, API trả 503 có mã an toàn và UI cho nhập tay | `evidence/runtime-api-checks.txt`, runtime manual |
| Public domain | NOT DEPLOYED, DNS lookup/curl không resolve `trasuangon.com` trong môi trường audit | `evidence/public-deployment-check.txt`; README xác nhận local-only tại `README.md:184` |
| Source integrity | PASS, 54 file trong `app/`, `db/`, `tests/` có hash trước/sau giống nhau | `evidence/source-integrity-check.txt` |
| Secret/client bundle | PASS trong phạm vi kiểm tra: chỉ `.env.example`, `.env*` bị ignore, không thấy identifier Geoapify trong client bundle | `evidence/asset-and-secret-audit.txt`; test tại `tests/rendered-html.test.mjs:288` |

## Phân tích chi tiết theo yêu cầu

### REQ-01 — Lọc và tìm kiếm

- Source chuẩn hóa `trim()` và `toLocaleLowerCase("vi")`, sau đó tìm trong tên+mô tả (`TeaShop.tsx:182-185`).
- Runtime: `ĐƯỜNG ĐEN` trả đúng một món; `@#$` trả 0 và empty state; xóa từ khóa trả đủ 12 món; lọc Trà sữa + `oolong` trả đúng Trà Sữa Oolong Nướng.
- Mảng được clone bằng `filter()` rồi `sort()`, không phát hiện trùng/mất sản phẩm ở dữ liệu 12 món.

### REQ-02 — Sắp xếp

- Runtime chứng minh thứ tự giá tăng `7k, 7k, 9k, 38k` và giảm `46k, 45k, 44k, 43k`.
- “Phổ biến” dùng trường `popularity`; trạng thái select hiển thị đúng.
- Thiếu lựa chọn tên là sai khác trực tiếp với đề. Tag “Mới” không đủ để khẳng định thứ tự mới nhất vì không có timestamp.

### REQ-03 — Authentication/authorization

- Đây không phải UI mô phỏng: admin dùng D1, PBKDF2 hash, token ngẫu nhiên được hash trong DB, rate-limit và khóa tạm.
- Cookie session HttpOnly/SameSite=Lax; Secure bật khi HTTPS; mutation yêu cầu same-origin + CSRF.
- `requireAdminPage` redirect route và `requireAdminRequest` chặn API; kiểm tra runtime nhận 307/401.
- Phần khách hàng không tồn tại, nên nhóm tổng thể chỉ PARTIAL.

### REQ-04 — Cart/order/payment

- Server tra menu nội bộ và tính lại `unitPrice`, subtotal, delivery fee; dữ liệu giá client không được tin (`order-service.ts:54-72,97-117`).
- Payment adapter phân biệt COD `unpaid` và QR `simulation_only`; không tự đánh dấu `paid` (`payment-provider.ts:3-62`).
- Confirm order lặp lại với đơn `confirmed` trả cùng đơn (`order-service.ts:124`), nhưng create chưa nhận idempotency key. UI giữ `pendingOrderId` sau create và disable nút lúc submit, giảm rủi ro nhưng không bảo vệ hai request create đồng thời.
- Không gửi đơn browser vì giới hạn audit cấm thay đổi DB. Test dùng adapter bộ nhớ đã xác nhận create/confirm và server-side price.

### REQ-05 — Ảnh

- 12 sản phẩm đều có ảnh; ảnh runtime và production local không 404.
- Next Image đặt kích thước và `sizes`, nên duy trì tỷ lệ và tối ưu response; ảnh ngoài hero không có `priority` nên dùng lazy mặc định.
- `ProductPicture` không có error fallback. Asset gốc từ 1,16–1,94 MB mỗi PNG; cần chuyển WebP/AVIF hoặc giảm kích thước nguồn.

### REQ-06 — Responsive/accessibility

- Chromium giả lập đủ 8 viewport; không cuộn ngang. Checkout mobile và admin login cũng không overflow.
- Có skip link, landmark, label, `aria-live`, role alert, focus-visible 3 px và reduced motion.
- Chưa đo contrast bằng công cụ browser chuyên dụng; chưa kiểm thử thiết bị/vòng lặp bàn phím toàn bộ, screen reader, phóng chữ 200% và browser ngoài Chromium.

### REQ-07 đến REQ-11 — Các module thiếu

Build route table chỉ có storefront SPA state, admin đơn hàng và API menu/address/orders/auth/admin-orders. `View` chỉ gồm `home/menu/product/cart/checkout/success`; schema không có contact, promotion, review hoặc catalogue. Vì vậy các nhóm này là thiếu triển khai, không phải chỉ thiếu cấu hình.

### REQ-12 — Admin

Phần order operations là triển khai thật và được test tốt: dashboard, search/filter/sort, detail, transition có version, COD confirmation và audit. Tuy nhiên phạm vi quản trị chỉ có order; thiếu 6 cụm quản trị mà đề yêu cầu (product/category/price-promo/image/feedback/review).

### REQ-13 — Build/deploy

- Development và production build local đều hoạt động.
- `SITE_URL` mặc định local và phải override trên hosting; `.env.example` không chứa secret.
- Không có bằng chứng public deployment. README nói rõ project local-only và domain không resolve tại thời điểm kiểm tra; do đó deployment là `NOT DEPLOYED`.

## Audit kỹ thuật giao diện theo Impeccable

### Implementation integrity verdict

**PASS có điều kiện:** hệ thống thể hiện nhận diện sản phẩm riêng (jade/paper/orange, chữ Trà Sữa Ngon, ngôn ngữ và luồng gọi món Việt Nam), không phải template có thể thay nhãn tùy ý. Tuy nhiên implementation bị lệch design token lặp lại và phạm vi storefront thiếu nhiều surface bắt buộc.

| # | Dimension | Score | Key Finding |
|---|-----------|------:|-------------|
| 1 | Accessibility | 3/4 | Label, focus, alert, reduced motion tốt; chưa đo contrast/screen reader/zoom 200%. |
| 2 | Performance | 2/4 | Next Image tốt nhưng PNG nguồn lớn, dùng lại crop và thiếu fallback lỗi ảnh. |
| 3 | Responsive Design | 3/4 | 8 viewport giả lập không overflow; thiếu browser/thiết bị vật lý. |
| 4 | Theming | 2/4 | Có token nhưng detector thấy nhiều literal lệch palette/type/radius. |
| 5 | Implementation Integrity | 2/4 | Bản sắc rõ nhưng 155 finding lặp lại và một nền lưới mang dấu hiệu generated UI. |
| **Total** | | **12/20** | **Acceptable — significant work needed** |

Detector `evidence/impeccable-detector.json` ghi 155 finding đều mang severity `advisory`: 73 font-size ngoài ramp, 63 màu ngoài palette, 18 radius ngoài scale và 1 nền grid trang admin. Đây là cảnh báo kỹ thuật cần xác minh/chuẩn hóa, không phải 155 lỗi chức năng hoặc 155 WCAG failures.

### Vấn đề giao diện có tác động

- **[P2] Design token drift:** `app/globals.css` và `app/admin/admin.css`; tác động là khó duy trì giao diện nhất quán. Khuyến nghị gom literal hợp lệ thành token và thay giá trị lệch bằng token; lệnh phù hợp: `/impeccable polish`.
- **[P2] Asset nguồn lớn/không fallback:** `TeaShop.tsx:75-76`, `public/images/*.png`; mạng chậm có thể thấy vùng ảnh trống, ảnh lỗi không có phương án thay thế. Khuyến nghị tối ưu WebP/AVIF và thêm fallback có alt; lệnh: `/impeccable optimize`.
- **[P2] Chưa chứng minh đủ accessibility matrix:** cần chạy contrast, zoom 200%, screen reader và Firefox/Safari; lệnh: `/impeccable harden`.

Điểm tích cực cần giữ: focus state rõ, nút/label vùng chạm lớn, validation summary nhận focus, trạng thái loading/empty/error bằng tiếng Việt, reduced-motion và phân biệt rõ thanh toán mô phỏng.

## Lỗi và thiếu sót ưu tiên

### P0

Không phát hiện P0 trong phạm vi đã chạy. Ứng dụng build/chạy; backend không tin giá client; admin route/API bị chặn; không có thanh toán production.

### P1

1. Thiếu sắp xếp theo tên.
2. Thiếu tài khoản/phiên người dùng thường nếu REQ-03 áp dụng cả khách hàng.
3. Thiếu idempotency key cho create order và trang khách xem lại trạng thái đơn.
4. Thiếu liên hệ/feedback end-to-end.
5. Thiếu mô hình và UI khuyến mãi/giá cũ/giá mới.
6. Thiếu chính sách đổi trả/bảo hành/vận chuyển.
7. Thiếu Google Maps hoặc link/fallback địa chỉ cửa hàng.
8. Thiếu đánh giá và bình luận end-to-end.
9. Admin thiếu product/category/price-promo/image/feedback/review management.
10. Chưa deploy công khai/HTTPS; domain production chưa resolve.

## Chức năng bắt buộc còn thiếu và thứ tự hoàn thiện

1. Hoàn thiện mô hình dữ liệu/API và Admin CRUD cho sản phẩm, danh mục, ảnh, giá và khuyến mãi; vẫn phải giữ server là nguồn giá tin cậy.
2. Thêm idempotency key cho create order và trang tra cứu/trạng thái đơn dành cho khách.
3. Thêm đánh giá/bình luận có sanitize, quyền sửa/xóa và moderation admin.
4. Thêm liên hệ/feedback có persistence/rate limit và quản lý admin.
5. Bổ sung nội dung chính sách đã được chủ dự án/pháp lý phê duyệt; không tự bịa điều khoản.
6. Thêm địa chỉ cửa hàng + link/iframe Google Maps có fallback và title.
7. Thêm name sort; quyết định có cần customer auth hay checkout guest là chuẩn nghiệp vụ.
8. Tối ưu ảnh/fallback, chuẩn hóa design token, chạy accessibility/browser/device matrix.
9. Cấu hình Geoapify cho môi trường test và chạy test địa chỉ Việt Nam thật.
10. Sau khi các mục trên đạt, thiết lập hosting/DNS/HTTPS và chạy lại smoke/E2E trên public URL. Không deploy trong audit này.

## Tính toàn vẹn và giới hạn

- Chỉ các file trong `docs/audit/` được tạo.
- Hash 54 file source/test trước và sau giống nhau; không sửa source sản phẩm.
- Không cài dependency, không thay schema/database, không tạo tài khoản, không gửi đơn thật, không deploy/đổi DNS và không dùng payment production.
- Trình duyệt thực tế chỉ là Chromium in-app browser; mọi thiết bị trong bảng là giả lập.
- Hãy xem danh sách test chi tiết tại `TMDT_TEST_CASES.md` và log tái lập trong `evidence/`.

## Hành động Impeccable được đề xuất

1. **[P2] `/impeccable optimize`**: giảm dung lượng ảnh nguồn và bổ sung ảnh fallback cho product card/detail.
2. **[P2] `/impeccable harden`**: kiểm tra contrast, zoom 200%, screen reader, browser matrix và trạng thái network lỗi.
3. **[P2] `/impeccable polish`**: chuẩn hóa 154 literal font/color/radius vào design token và đánh giá lại nền grid admin.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/impeccable audit` after fixes to see your score improve.
