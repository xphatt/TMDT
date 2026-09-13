# Test cases kiểm định Trà Sữa Ngon

Ngày chạy: 2026-09-13. Các case ghi `PASS` đã được quan sát runtime, thực thi trong test tự động hoặc kiểm tra response/build thực tế. Các case chỉ có source nhưng chưa thao tác end-to-end được ghi `PARTIAL`/`NOT TESTED`, không nâng thành PASS.

| TC ID | Yêu cầu | Tiền điều kiện | Bước kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng |
| ----- | ------- | -------------- | ------------- | ---------------- | --------------- | ---------- | ---------- |
| TC-01-01 | REQ-01 Có ô tìm kiếm | Menu đã tải | Mở thực đơn | Có searchbox có label | Có “Tìm theo tên” | PASS | Route `/`; `app/components/TeaShop.tsx:200-202`; `evidence/manual-runtime-observations.md` |
| TC-01-02 | REQ-01 Không phân biệt hoa thường | Menu đã tải | Nhập `ĐƯỜNG ĐEN` | Trả đúng món | 1 kết quả Trà Sữa Đường Đen | PASS | `app/components/TeaShop.tsx:182-185`; runtime manual |
| TC-01-03 | REQ-01 Từ khóa trống | Đang có từ khóa | Ctrl+A, Backspace | Hiện toàn bộ menu | Hiện 12 món | PASS | Runtime manual |
| TC-01-04 | REQ-01 Ký tự đặc biệt/empty state | Menu đã tải | Nhập `@#$` | Không crash; empty state rõ | 0 món, hiện “Chưa tìm thấy món phù hợp” | PASS | Runtime manual |
| TC-01-05 | REQ-01 Kết hợp lọc+tìm | Menu đã tải | Chọn Trà sữa, nhập `oolong` | Chỉ món phù hợp cả hai điều kiện | 1 món Trà Sữa Oolong Nướng | PASS | `app/components/TeaShop.tsx:184-188`; runtime manual |
| TC-01-06 | REQ-01 Không trùng/mất dữ liệu | API/menu hoạt động | So số món all/filter/result | 12 món duy nhất, kết quả đúng | API trả 12 id duy nhất; UI all trả 12 | PASS | `evidence/runtime-api-checks.txt`; runtime manual |
| TC-02-01 | REQ-02 Giá tăng dần | Menu all | Chọn Giá thấp đến cao | Giá không giảm | 7k, 7k, 9k, 38k ở đầu | PASS | Runtime manual; `TeaShop.tsx:188,208` |
| TC-02-02 | REQ-02 Giá giảm dần | Menu all | Chọn Giá cao đến thấp | Giá không tăng | 46k, 45k, 44k, 43k ở đầu | PASS | Runtime manual; `TeaShop.tsx:188,209` |
| TC-02-03 | REQ-02 Theo tên | Menu all | Kiểm tra lựa chọn sort | Có A→Z/Z→A hoặc tên | Không có lựa chọn tên | FAIL | `app/components/TeaShop.tsx:13,205-209` |
| TC-02-04 | REQ-02 Phổ biến | Menu all | Chọn mặc định Phổ biến | Dùng dữ liệu popularity | Mặc định “Phổ biến”; sort theo popularity giảm | PASS | `app/data/products.ts:20-31`; `TeaShop.tsx:188` |
| TC-02-05 | REQ-02 Mới nhất | Có sản phẩm tag Mới | Kiểm tra sort theo ngày | Có trường ngày và lựa chọn mới nhất nếu hỗ trợ | Có tag Mới nhưng không timestamp/sort newest | PARTIAL | `app/data/products.ts:22,24,28`; `TeaShop.tsx:13` |
| TC-02-06 | REQ-02 Sort khi lọc/tìm | Kết quả đã lọc | Đổi price sort | Không mất filter/query, select hiện trạng thái | Sort vẫn đổi trạng thái; kết quả một món giữ nguyên | PASS | Runtime manual |
| TC-03-01 | REQ-03 Giao diện login | Server chạy | Mở `/admin/login` | Form username/password | Có form, password type và nút disabled khi rỗng | PASS | `app/admin/components/AdminLoginForm.tsx:11-45`; screenshot phiên audit |
| TC-03-02 | REQ-03 Validate input | Form login | Gửi thiếu trường/payload quá dài | Từ chối rõ | UI required/disabled; API kiểm tra empty và max length | PASS | `AdminLoginForm.tsx:39-45`; `app/api/admin/auth/login/route.ts:14-17` |
| TC-03-03 | REQ-03 Sai tài khoản/mật khẩu | Repository test memory | Gửi credential sai 5 lần | 401 cùng thông báo, sau đó rate-limit | 5×401, lần 6 trả 429; không lộ tồn tại account | PASS | Test `tests/rendered-html.test.mjs:307`; `evidence/npm-test.log` |
| TC-03-04 | REQ-03 Login thành công/session | Admin test tồn tại trong memory D1 | Login, gọi session | Cookie/session hợp lệ, role đúng | Nhận session+CSRF cookie; session 200 role admin | PASS | Test `tests/rendered-html.test.mjs:334`; `evidence/npm-test.log` |
| TC-03-05 | REQ-03 Refresh/expiry | Có session test | Gọi session, đặt expiry quá khứ | Session sống qua request; expiry bị chặn | Session hợp lệ trước expiry, 401 sau expiry | PASS | `tests/rendered-html.test.mjs:334`; `admin-auth.ts:205-227` |
| TC-03-06 | REQ-03 Logout | Có session test | POST logout rồi gọi session | Revoke và 401 | Logout 200, session cũ 401 | PASS | `tests/rendered-html.test.mjs:334`; `admin-auth.ts:238-240` |
| TC-03-07 | REQ-03 Phân quyền route/API | Không auth/operator | Mở `/admin`; gọi API; operator mutation | Redirect/401/403 | `/admin` 307; API 401; operator mutation 403 | PASS | `evidence/runtime-api-checks.txt`; test lines 307,334 |
| TC-03-08 | REQ-03 Không lưu/log password/token | Source và bundle có sẵn | Audit auth/log | Không hard-code/log secret; token hash ở DB | Password state chỉ ở form; PBKDF2; token hash; không thấy log credential | PASS | `app/server/auth/password.ts:45-90`; `admin-auth.ts:170-186`; asset/secret audit |
| TC-03-09 | REQ-03 User login/logout | Storefront | Tìm route/UI tài khoản khách | Có user auth nếu đề yêu cầu | Không có user account/login/logout | FAIL | Build route table `evidence/npm-test.log`; `TeaShop.tsx:12` |
| TC-04-01 | REQ-04 Chọn sản phẩm/tùy chọn | Menu tải | Mở Oolong; bỏ trống rồi submit; chọn L/50%/ít đá/trân châu | Lỗi bắt buộc rồi giá cập nhật | Hiện 3 lỗi; giá 56k/ly | PASS | Runtime manual; `TeaShop.tsx:249-293` |
| TC-04-02 | REQ-04 Số lượng product | Detail hợp lệ | Tăng lên 2 | Giá dòng nhân 2; giới hạn 20 | 56k×2 =112k; code clamp 1–20 | PASS | Runtime manual; `TeaShop.tsx:288-290` |
| TC-04-03 | REQ-04 Thêm giỏ/tính tổng | Có món 39k | Thêm 2 Oolong 56k | Tổng 151k | Header 3 đơn vị; subtotal 151k | PASS | Runtime manual |
| TC-04-04 | REQ-04 Tăng/giảm trong giỏ | Giỏ 151k | Tăng món 39k rồi giảm | 190k rồi về 151k | Đúng | PASS | Runtime manual; `TeaShop.tsx:521` |
| TC-04-05 | REQ-04 Xóa sản phẩm | Giỏ có nhiều món | Nhấn Xóa món | Dòng bị xóa, tổng giảm | Không thao tác vì xóa dữ liệu local qua UI cần tách khỏi audit; handler có trong UI | NOT TESTED | `app/components/TeaShop.tsx:308-314` |
| TC-04-06 | REQ-04 Quantity 0/âm/quá lớn API | API test | Gửi quantity 0, -1, 21 | 400, không tạo đơn | Validation 1–20 có trong server nhưng chưa có test runtime riêng | NOT TESTED | `app/server/orders/order-service.ts:57-58` |
| TC-04-07 | REQ-04 Refresh cart | Giỏ đã có dữ liệu | Reload và chờ hydration | Giỏ khôi phục | SSR ban đầu 0, sau hydration khôi phục 3 đơn vị/151k | PASS | Runtime manual; `TeaShop.tsx:492-498`; `storage.ts:6-16` |
| TC-04-08 | REQ-04 Form giao hàng | Cart có món | Submit trống | Lỗi thân thiện, focus summary | Hiện lỗi name/phone/address; focus summary | PASS | Runtime manual; `TeaShop.tsx:398-407,445-455` |
| TC-04-09 | REQ-04 Address loading/error/manual | Thiếu Geo key | Nhập 123 Nguyễn, chờ debounce | Loading→error, vẫn nhập tay | Đúng; API 503 code an toàn | PASS | Runtime manual; `evidence/runtime-api-checks.txt`; `TeaShop.tsx:343-359` |
| TC-04-10 | REQ-04 Geo gợi ý Việt Nam thật | `GEOAPIFY_API_KEY` hợp lệ | Nhập địa chỉ Việt Nam | Tối đa 5 kết quả VN | Chưa cấu hình key; logic mock test pass | NEEDS CONFIG | Test `tests/rendered-html.test.mjs:120,158`; `.env.example:2` |
| TC-04-11 | REQ-04 Giá client bị sửa | Memory adapter test | Gửi giá giả/unknown item | Backend dùng catalogue nội bộ/từ chối | Server tính lại giá; unknown item 400 | PASS | Tests lines 197,248; `order-service.ts:54-72` |
| TC-04-12 | REQ-04 Tạo/lưu/xác nhận đơn | Memory D1 test | POST create rồi confirm | pending→confirmed; không paid | Pass; COD unpaid, QR simulation_only | PASS | `tests/rendered-html.test.mjs:197,334`; `payment-provider.ts:21-55` |
| TC-04-13 | REQ-04 Double click/duplicate | Checkout hợp lệ | Nhấn xác nhận liên tục/retry create | Chỉ một order | Nút disabled và UI giữ pendingOrderId, nhưng create API không có idempotency key | PARTIAL | `TeaShop.tsx:410-437,462`; `checkout-api.ts:56-68` |
| TC-04-14 | REQ-04 Payment fail/cancel | Mock-only | Mô phỏng gateway fail/cancel | Trạng thái rõ, không paid | Không có gateway/sandbox; QR chỉ simulation_only | N/A | `payment-provider.ts:39-55`; UI note `TeaShop.tsx:462` |
| TC-04-15 | REQ-04 Xem trạng thái đơn phía khách | Có order | Mở lịch sử/tra cứu | Hiện order/status | Chỉ có success tức thời; không có view history/status | FAIL | `TeaShop.tsx:12,473`; `storage.ts:18-25` |
| TC-05-01 | REQ-05 Có ảnh từng sản phẩm | API menu | Duyệt 12 sản phẩm | Mỗi item có image | 12/12 có path ảnh | PASS | `app/data/products.ts:20-31`; runtime API log |
| TC-05-02 | REQ-05 Không 404 dev/prod | Build/start thành công | GET 4 path ảnh dùng chung | HTTP 200 | Cả 4 trả 200 ở production local | PASS | `evidence/production-runtime-checks.txt` |
| TC-05-03 | REQ-05 Tỷ lệ/alt | Storefront hiển thị | Quan sát DOM/ảnh | Không méo; alt mô tả | Next Image có width/height/sizes; alt theo product; quan sát không méo | PASS | `TeaShop.tsx:75-76,115-116,146`; runtime manual |
| TC-05-04 | REQ-05 Fallback lỗi ảnh | Làm path ảnh lỗi | Quan sát fallback | Có ảnh/khối thay thế | Không có `onError`/fallback | FAIL | `app/components/TeaShop.tsx:75-76` |
| TC-05-05 | REQ-05 Lazy-load | Trang home/menu dài | Kiểm tra ảnh ngoài viewport | Ảnh không priority được lazy-load | Product/source image không priority; hero priority | PASS | `TeaShop.tsx:76,115-116,146`; runtime visible images 0 broken |
| TC-05-06 | REQ-05 Dung lượng tối ưu | Asset source | Đo kích thước | Dung lượng hợp lý | PNG 1,16–1,94 MB/file, tổng ~6,39 MB | PARTIAL | `evidence/asset-and-secret-audit.txt` |
| TC-06-01 | REQ-06 8 viewport storefront | Dev server + Chromium | Giả lập 320×568, 360×800, 390×844, 412×915, 768×1024, 1024×768, 1366×768, 1920×1080 | Không overflow; menu/ảnh/header/footer dùng được | Không overflow; đúng mobile/desktop navigation; không broken visible image | PASS | `evidence/manual-runtime-observations.md` |
| TC-06-02 | REQ-06 Checkout mobile | Giỏ có món | Mở checkout tại 320×568 | Form/nút trong màn hình, không scroll ngang | `innerWidth=320`, `scrollWidth=302`, form 282, submit hiện | PASS | Runtime manual |
| TC-06-03 | REQ-06 Admin responsive | Không auth | Mở login tại 320,768,1366 | Không tràn/cắt; form dùng được | Không overflow/cắt chữ tại cả 3 | PASS | Runtime manual; screenshot phiên audit |
| TC-06-04 | REQ-06 Touch target | Mobile | Đo button/link/label | Vùng tương tác phù hợp | Trang chủ không có target hiển thị <40; radio 20×20 nằm trong label 295×77/96 | PASS | Runtime manual; `globals.css:38-42,91-94,162` |
| TC-06-05 | REQ-06 Keyboard/focus | UI + tests | Tab/focus lỗi checkout | Focus rõ, không trap | CSS focus 3px; test focus/drawer pass | PASS | `globals.css:34`; `tests/ui-regression.test.mjs:10,28` |
| TC-06-06 | REQ-06 Không phụ thuộc hover | Source/runtime | Kiểm tra button/radio/filter | Click/touch và keyboard hoạt động | Controls native/button/label; hover không phải đường duy nhất | PASS | `TeaShop.tsx:200-293,445-462` |
| TC-06-07 | REQ-06 Reduced motion | OS reduce | Audit CSS | Animation được tắt/giảm | Có nhánh reduce | PASS | `app/globals.css:406`; `app/admin/admin.css:338` |
| TC-06-08 | REQ-06 Thiết bị vật lý | Có mobile/iPad thật | Chạy E2E/touch thật | Hoạt động thực tế | Không có thiết bị vật lý trong môi trường | NOT TESTED | Giới hạn môi trường; runtime manual |
| TC-06-09 | REQ-06 Browser matrix | Firefox/Safari/Edge | Chạy cùng suite | Không khác biệt nghiêm trọng | Chỉ Chromium in-app được chạy trong lượt audit | NOT TESTED | Runtime manual |
| TC-06-10 | REQ-06 Zoom/text scaling | Browser | Zoom 200%, dùng toàn luồng | Không cắt/tràn | Chưa chạy | NOT TESTED | Giới hạn kiểm thử |
| TC-07-01 | REQ-07 Trang/form liên hệ | Storefront | Duyệt route/footer/menu | Có trang/form | Không có | FAIL | `TeaShop.tsx:12,477`; build route table |
| TC-07-02 | REQ-07 Validate contact | Form contact | Email/phone/content sai | Hiện lỗi | Không có form | FAIL | Route/source inventory |
| TC-07-03 | REQ-07 Lưu/gửi feedback | Backend/storage | Gửi feedback | Có nơi nhận thật | Không có API/table | FAIL | `db/schema.ts:3-117`; build route table |
| TC-07-04 | REQ-07 Chống lặp/rỗng/PII | Endpoint feedback | Gửi lặp/rỗng | Từ chối, không lộ PII | Không có endpoint | FAIL | Build route table |
| TC-08-01 | REQ-08 Dữ liệu promo/old-new price | Catalogue | Audit model | Có old/new/discount | Chỉ có một `price` và tags | FAIL | `app/data/products.ts:19-31`; `app/types.ts:1-12` |
| TC-08-02 | REQ-08 Hiển thị giá cũ/mới | Sản phẩm promo | Mở card/detail | Giá cũ phân biệt, giá mới nhỏ hơn | Không có UI | FAIL | `TeaShop.tsx:75-83,232-293` |
| TC-08-03 | REQ-08 Discount percent | Promo active | So phép tính | Đúng phần trăm | Không có | FAIL | Catalogue/model audit |
| TC-08-04 | REQ-08 Ngày hiệu lực/hết hạn | Promo có lịch | Trước/trong/sau kỳ | Chỉ áp dụng đúng kỳ | Không có trường ngày/promo engine | FAIL | `app/data/products.ts:19-31`; `db/schema.ts:3-117` |
| TC-08-05 | REQ-08 Giá checkout an toàn | Cart/order | Chỉnh giá client | Server dùng giá hiện hành | Backend tính lại từ catalogue | PASS | `order-service.ts:54-72`; test line 197 |
| TC-09-01 | REQ-09 Đổi trả/bảo hành | Storefront/footer | Tìm link/nội dung | Có nội dung riêng | Không có | FAIL | `TeaShop.tsx:12,477` |
| TC-09-02 | REQ-09 Vận chuyển/phí/phạm vi | Checkout/policy | Kiểm tra nội dung | Phí, phạm vi, ETA rõ | Chỉ có phí mẫu 18k; thiếu phạm vi/ETA | PARTIAL | `TeaShop.tsx:462`; `app/data/pricing.ts` |
| TC-09-03 | REQ-09 Giao thất bại/hỗ trợ | Policy/footer | Tìm quy trình | Có tình huống và contact | Không có; hotline chỉ là mẫu | FAIL | `TeaShop.tsx:477` |
| TC-10-01 | REQ-10 Map/link hợp lệ | Storefront | Tìm iframe/link maps | Có map/link thật | Không có | FAIL | `TeaShop.tsx:12,477`; build route table |
| TC-10-02 | REQ-10 Vị trí/title/fallback | Map tồn tại | Tắt iframe/API | Có title+địa chỉ/link fallback | Không áp dụng do map không tồn tại | FAIL | Source inventory |
| TC-10-03 | REQ-10 Key bảo mật | Map API | Audit key | Không hard-code | Không dùng Maps API/key | N/A | `.env.example`; source inventory |
| TC-11-01 | REQ-11 Chọn sao/bình luận | Detail sản phẩm | Tìm form review | Có rating/comment | Không có | FAIL | `TeaShop.tsx:12,232-293` |
| TC-11-02 | REQ-11 Validation/empty/length | Review form | Gửi rỗng/quá dài | Lỗi rõ | Không có | FAIL | Route/source inventory |
| TC-11-03 | REQ-11 Lưu/refresh | Backend/storage | Gửi rồi reload | Review còn lại | Không có API/table/storage | FAIL | `db/schema.ts:3-117`; `storage.ts:1-25` |
| TC-11-04 | REQ-11 Average/count | Có nhiều review | Tính lại | Điểm/lượt đúng | Không có | FAIL | Model/schema audit |
| TC-11-05 | REQ-11 Sanitize/XSS | Review form | Gửi HTML/script | Escape/sanitize | Không có module để kiểm tra | FAIL | Route/source inventory |
| TC-11-06 | REQ-11 Quyền sửa/xóa | Có review | User khác sửa/xóa | Bị chặn | Không có | FAIL | Route/source inventory |
| TC-12-01 | REQ-12 Admin auth/role | Không auth/operator/admin test | Mở/call API/mutation | 307/401/403 theo quyền | Đúng | PASS | Runtime API; tests lines 307,334 |
| TC-12-02 | REQ-12 Dashboard | Admin session test | GET dashboard | Có tổng quan | Component/API tổng đơn, trạng thái, tiền | PASS | `AdminDashboard.tsx:8-69`; build routes |
| TC-12-03 | REQ-12 Order list/detail | Admin session test | Search/list/open detail | Dữ liệu order đầy đủ | Test search/detail pass | PASS | Test line 334; `AdminOrders.tsx:90-114` |
| TC-12-04 | REQ-12 Payment/tổng tiền | Order COD test | Mở detail | Tổng, paid/outstanding, method đúng | Test amountPaid/outstanding/COD pass | PASS | Test line 334; `AdminOrderDetail.tsx:112-158` |
| TC-12-05 | REQ-12 Update trạng thái | Order confirmed | Gửi transition hợp lệ/sai | State machine chặn sai | Invalid 409; valid preparing→delivering→completed | PASS | Test line 334; `AdminOrderDetail.tsx:18-19,76-87` |
| TC-12-06 | REQ-12 Confirm thao tác nguy hiểm | Có state mutation | Mở dialog | Có bước xác nhận | Dùng `<dialog>` trước mutation | PASS | `AdminOrderDetail.tsx:38,76-87`; `admin.css:220-224` |
| TC-12-07 | REQ-12 CRUD sản phẩm/ảnh | Admin | Tìm route/UI/API | Có add/edit/delete/image | Không có | FAIL | Build route table `evidence/npm-test.log` |
| TC-12-08 | REQ-12 Category/price/promo | Admin | Tìm module | Có quản lý | Không có | FAIL | Build route table; schema exports |
| TC-12-09 | REQ-12 Feedback/reviews | Admin | Tìm module | Có list/moderation | Không có | FAIL | Build route table; schema exports |
| TC-13-01 | REQ-13 Lint | Dependencies có sẵn | `npm run lint` | Exit 0 | Exit 0 | PASS | `evidence/lint.log` |
| TC-13-02 | REQ-13 Type-check | Dependencies có sẵn | `npm run typecheck` | Exit 0 | Exit 0 | PASS | `evidence/typecheck.log` |
| TC-13-03 | REQ-13 Production build/test | Dependencies có sẵn | `npm test` | Build/test pass | Build pass, 13/13 test pass | PASS | `evidence/npm-test.log` |
| TC-13-04 | REQ-13 Dev runtime | Build/source có sẵn | Start dev, GET `/` | HTTP 200 | HTTP 200 | PASS | `evidence/dev-server.log`; `home-response-headers.txt` |
| TC-13-05 | REQ-13 Production runtime local | Build thành công | `vinext start` port 3100; GET route/API/assets | 200/redirect hợp lệ | `/`, menu, 4 ảnh 200; admin 307 | PASS | `evidence/production-runtime-checks.txt` |
| TC-13-06 | REQ-13 README/env | Repository files | Audit hướng dẫn/env | Có run/build/env, không secret | Có; key để trống; `.env*` ignored | PASS | `README.md:7-67`; `.env.example:1-3`; asset/secret audit |
| TC-13-07 | REQ-13 Tách environment | Dev/preview/prod | Audit site URL | Dev local, prod override, preview theo host | SITE_URL env và fallback local; chưa có preview URL cụ thể | PARTIAL | `README.md:15-17,67`; `app/server/site-config.ts:1-13` |
| TC-13-08 | REQ-13 Public deployment/HTTPS | Domain production | Resolve/GET `https://trasuangon.com` | DNS+HTTPS+app hoạt động | DNS không resolve trong audit; README xác nhận local-only | NOT DEPLOYED | `evidence/public-deployment-check.txt`; `README.md:184` |
| TC-13-09 | REQ-13 Direct refresh production public | Deployment tồn tại | Mở route sâu và reload | Không 404 | Không thể kiểm tra vì chưa deploy | NOT TESTED | Public deployment thiếu |
| TC-13-10 | REQ-13 Secret trong bundle/Git | Build có sẵn | Scan client/env/Git | Không có key; env ignored | Client bundle không có identifier; chỉ `.env.example`; root không phải Git worktree nên phần Git history chưa xác minh | PARTIAL | `evidence/asset-and-secret-audit.txt`; test line 288 |

## Tóm tắt test execution

- Automated: 13 PASS, 0 FAIL (`evidence/npm-test.log`).
- Build/lint/type-check: tất cả exit 0.
- Runtime API: menu 200, address thiếu config 503 an toàn, admin dashboard không auth 401, admin page 307.
- Browser: Chromium in-app; 8 viewport storefront giả lập, checkout 320 px và admin login 3 viewport.
- Không kiểm thử thật: thiết bị vật lý, Firefox/Safari/Edge, zoom 200%, browser delete-cart, D1 checkout browser và public production vì giới hạn an toàn/cấu hình.
- Không có giao dịch thật; QR chỉ là `simulation_only`, COD test chỉ chạy trong adapter/database bộ nhớ của test.
