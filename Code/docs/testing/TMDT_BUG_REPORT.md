# Báo cáo lỗi và khoảng trống — TMDT Trà Sữa Ngon

> Đây là danh sách lỗi tại thời điểm audit ngày 13/09/2026. Trạng thái xử lý mới nhất ngày 14/09/2026 nằm tại [`GITHUB_RELEASE_READINESS.md`](GITHUB_RELEASE_READINESS.md); không dùng bảng lịch sử bên dưới làm trạng thái phát hành hiện tại.

## 1. Tổng hợp

| Mức độ | Số lượng |
|---|---:|
| P0 | 0 |
| P1 | 6 |
| P2 | 6 |
| P3 | 2 |
| Tổng | 14 |

Không phát hiện lỗi P0 trong phạm vi kiểm tra. Sáu mục P1 hiện chủ yếu chặn bàn giao/đánh giá hơn là làm sập ứng dụng local.

## 2. Danh sách lỗi

| ID | Mức | Khu vực | Mô tả và bước tái hiện | Bằng chứng/ảnh hưởng | Đề xuất |
|---|---|---|---|---|---|
| TMDT-001 | P1 | Git/repository | Chạy kiểm tra Git tại `D:\TMDT` không thấy repo; repo thật ở `D:\TMDT\repository`. `git ls-files` trong repo chỉ trả `README.md`. | Toàn bộ `app`, `worker`, `tests`, config và migration không được version-control trong repo nộp bài; có nguy cơ mất source và không chứng minh tiến độ. | Chuẩn hóa một repository duy nhất và add có chọn lọc source/test/config/docs; kiểm tra secret/build/cache trước commit. Không làm trong audit này. |
| TMDT-002 | P1 | Deployment | README xác nhận chưa public deploy; không có URL production/HTTPS. | Không thể xác minh production, TLS, binding D1 và hành vi sau deploy; chặn mục triển khai. | Cấu hình Cloudflare/D1 thật qua secret/binding, deploy staging, smoke test HTTPS và ghi URL trong README. |
| TMDT-003 | P1 | Map/store config | Mở khu vực liên hệ/cửa hàng; UI báo `STORE_ADDRESS` chưa cấu hình và không có link Maps. | Người dùng không có địa chỉ/chỉ đường; yêu cầu bản đồ chưa hoàn tất. | Cấu hình `STORE_ADDRESS` và API key theo cơ chế environment/secret; không hard-code bí mật. |
| TMDT-004 | P1 | Demo evidence | Tìm trong README/docs không thấy link video demo. | Thiếu artifact bàn giao nếu rubric yêu cầu video có âm thanh/chú thích. | Quay demo đầy đủ luồng chính và lỗi; thêm URL Public/Unlisted vào README. |
| TMDT-005 | P1 | Performance QA | Không tìm thấy script/test performance trong source/tests. Phiên audit chỉ chạy harness tạm. | Không tái chạy được benchmark; thiếu cấu hình máy, CPU/RAM và evidence chuẩn. | Thêm script benchmark không phá dữ liệu, hai mức tải, threshold, machine profile và lưu log/chart. |
| TMDT-006 | P1 | Runtime config | Server đang chạy port 3000 trả 503 `demo_checkout_timeout` cho `POST /api/orders {}`; server port 3001 với demo tắt trả 400 `invalid_order`. | Nếu dùng cấu hình port 3000 để demo luồng mua bình thường, checkout có thể bị cố ý lỗi; dễ bị hiểu là hệ thống hỏng. | Tách rõ profile normal/error-demo; mặc định normal, chỉ bật error scenario trong kịch bản demo lỗi và hiển thị banner môi trường. |
| TMDT-007 | P2 | Search/i18n | Vào menu, tìm `đào` có 1 kết quả; tìm `dao` có 0. Source chỉ lowercase bằng locale, không normalize/bỏ dấu. | Người dùng gõ tiếng Việt không dấu không tìm được món. | Chuẩn hóa Unicode NFD và bỏ combining marks cho cả query và searchable text; thêm unit/UI tests cho có dấu/không dấu. |
| TMDT-008 | P2 | Admin UI QA | `/admin` redirect login đúng nhưng không có test credential để đăng nhập và thao tác dashboard/CRUD bằng browser. | Backend có integration test nhưng responsive, focus, error/empty state của màn admin authenticated chưa được xác nhận. | Cấp tài khoản test giả lập an toàn hoặc seed fixture riêng; chạy regression browser rồi xóa/rotate credential test theo quy trình. |
| TMDT-009 | P2 | Cross-browser | Chỉ có Codex In-app Browser. Chrome, Edge, Firefox và Safari/WebKit độc lập chưa chạy. | Có thể bỏ sót khác biệt layout, cookie, image optimization và form validation theo engine. | Chạy matrix browser mục tiêu ở mobile/desktop; lưu ảnh và console/network evidence. |
| TMDT-010 | P2 | Product images | Nhiều sản phẩm dùng chung `product-lineup.png`/`about-tea.png`; file nguồn khoảng 1,45–1,94 MB và không thấy fallback lỗi ảnh rõ ràng. | Tính nhận diện sản phẩm thấp; tăng tải ảnh và có thể để trống khi asset lỗi. | Tạo asset theo sản phẩm, tối ưu WebP/AVIF, giữ dimensions/sizes và thêm fallback không gây layout shift. |
| TMDT-011 | P2 | Documentation | Báo cáo `docs/Bao_Cao_Tieu_Luan_TMDT.md` vẫn ghi chưa có unit suite, trong khi hiện tại có 5 unit test và tổng 23 test pass. | Tài liệu mâu thuẫn với source/kết quả thật, giảm độ tin cậy hồ sơ. | Cập nhật số test, lệnh chạy, phạm vi chưa test và ngày kiểm chứng; không phóng đại cross-browser/performance. |
| TMDT-012 | P2 | Contribution evidence | Repo có 5 commit và tất cả cùng một tác giả. | Không chứng minh được đóng góp cá nhân nếu rubric yêu cầu mỗi thành viên commit bằng tài khoản riêng. | Từ các thay đổi tiếp theo, mỗi thành viên commit phần mình với message mô tả; không rewrite lịch sử giả tạo. |
| TMDT-013 | P3 | Design system | Detector ghi nhận 73 font-size, 63 màu, 18 radius ngoài token và 1 admin grid background. | Design-token drift làm UI khó bảo trì; chưa thấy ảnh hưởng chức năng trực tiếp. | Sau khi xử lý P1/P2, gom typography/color/radius về token đã định nghĩa và regression visual. |
| TMDT-014 | P3 | Runtime observability | Source scan không thấy logger runtime chung; hiện có audit log nghiệp vụ admin. | Khó điều tra lỗi kết nối/runtime ngoài các thao tác admin; không phải blocker local. | Thiết kế structured logging có request id, error class, latency; tuyệt đối không log secret/PII nhạy cảm. |

## 3. Các mục đã kiểm tra và không ghi nhận lỗi chặn

- Lint, TypeScript, production build và 23/23 test pass.
- API health trả 200 và database reported connected.
- API admin từ chối truy cập chưa xác thực bằng 401.
- Server tính lại giá; client không thể tự quyết giá đơn.
- Validation feedback/review/order từ chối dữ liệu sai; idempotency được kiểm thử.
- Session token được băm; cookie HttpOnly, Secure trên HTTPS; có CSRF/same-origin/rate-limit.
- Storefront và admin login không overflow tại 8 viewport; controls chính đạt ngưỡng chạm đã kiểm tra.
- Các route chính sách, asset ảnh và URL tối ưu ảnh trả nội dung thành công.

## 4. Thứ tự sửa đề xuất

1. Đưa toàn bộ source/test/config/docs vào đúng Git repository và xác minh `.gitignore`/secret scan.
2. Tách cấu hình chạy bình thường khỏi `demo_checkout_timeout`; đảm bảo demo mặc định không tự gây lỗi.
3. Cấu hình địa chỉ cửa hàng và bản đồ bằng environment/secret.
4. Tạo performance/stress test tái chạy được với hai mức tải và lưu evidence.
5. Cấp fixture/credential test an toàn và chạy browser regression toàn bộ admin.
6. Chạy matrix Chrome, Edge, Firefox và Safari/WebKit hoặc ghi nhận giới hạn chính thức.
7. Deploy staging/production HTTPS, smoke test D1 binding và ghi URL.
8. Quay video demo, thêm link vào README và đồng bộ báo cáo hiện trạng test.
9. Hỗ trợ tìm tiếng Việt không dấu và thêm regression test.
10. Tối ưu/fallback ảnh sản phẩm; sau đó mới xử lý design-token drift và logging.

## 5. Trạng thái phát hành

- Demo local có kiểm soát: **Có thể**, với demo mode được cấu hình đúng và giải thích rõ các phần chưa kiểm tra.
- Bàn giao cuối kỳ/production: **Chưa nên**, cho đến khi TMDT-001 đến TMDT-006 được xử lý hoặc được người chịu trách nhiệm chấp nhận bằng văn bản.

## Phụ lục — Bảng lỗi theo mẫu kiểm thử

| Bug ID | Chức năng | Bước tái hiện | Mong đợi | Thực tế | Mức độ | File liên quan | Bằng chứng |
|---|---|---|---|---|---|---|---|
| TMDT-001 | Git/repository | Tại `D:\TMDT`, tìm repo; vào `repository` chạy `git ls-files` | Một repo track source/test/config/docs | Root không là repo; repo con chỉ track README | P1 | `D:\TMDT\repository` | `evidence/RUNTIME_EVIDENCE.md` |
| TMDT-002 | Deployment | Đọc README và cấu hình production | Có URL public HTTPS chạy được | Chưa deploy, không có URL | P1 | `README.md` | `README.md:17`, `:225` |
| TMDT-003 | Maps | Mở khu vực cửa hàng khi chạy local | Có địa chỉ chữ và link Maps | Báo thiếu STORE_ADDRESS | P1 | `.env.example`, `README.md` | `.env.example:4`; `README.md:72` |
| TMDT-004 | Video demo | Tìm URL video trong README/docs | Có link Public/Unlisted | Không tìm thấy | P1 | `README.md`, `docs/` | Source/document scan 2026-09-13 |
| TMDT-005 | Performance | Tìm script benchmark trong tests/scripts | Có kịch bản 2 mức tải tái chạy được | Chỉ có phép đo tạm của audit | P1 | `tests/`, `scripts/` | `evidence/RUNTIME_EVIDENCE.md` |
| TMDT-006 | Checkout config | POST order sai tới port 3000 và server demo-off 3001 | Normal profile trả validation; error profile tách biệt | 3000 trả demo timeout 503; 3001 trả invalid 400 | P1 | `README.md`, cấu hình runtime | Runtime smoke 2026-09-13 |
| TMDT-007 | Tìm kiếm | Tìm `đào`, sau đó `dao` | Hai truy vấn tương đương | `đào` có 1, `dao` có 0 | P2 | `app/components/TeaShop.tsx` | `TeaShop.tsx:192`, `:196` |
| TMDT-008 | Admin UI | Mở login và thử tiến tới dashboard | Có fixture/credential cho regression | Không có credential test | P2 | `app/admin/`, `docs/` | `docs/Bao_Cao_Tieu_Luan_TMDT.md:581` |
| TMDT-009 | Cross-browser | Kiểm inventory browser | Có Chrome/Edge/Firefox/WebKit | Chỉ có browser tích hợp | P2 | N/A | Giới hạn môi trường audit |
| TMDT-010 | Ảnh sản phẩm | Liệt kê kích thước asset và review component | Ảnh riêng, tối ưu, có fallback | Asset lớn/dùng lại; chưa thấy fallback rõ | P2 | `public/images/`, `app/components/TeaShop.tsx` | HTTP 200; `TeaShop.tsx:86` |
| TMDT-011 | Tài liệu test | So sánh báo cáo với `npm test` | Số test/phạm vi hiện tại khớp | Báo cáo nói chưa có unit suite | P2 | `docs/Bao_Cao_Tieu_Luan_TMDT.md` | Dòng 617, 765; CLI 23/23 |
| TMDT-012 | Đóng góp Git | Xem log tác giả | Có bằng chứng thành viên theo rubric | 5 commit cùng một tác giả | P2 | `D:\TMDT\repository\.git` | Git log 2026-09-13 |
| TMDT-013 | Design system | Chạy detector audit UI | Giá trị bám token hệ thống | 155 cảnh báo advisory | P3 | `app/**/*.css`, `app/**/*.tsx` | `docs/audit/evidence/impeccable-detector.json` |
| TMDT-014 | Observability | Quét logger runtime | Có structured runtime logs an toàn | Chỉ thấy audit log nghiệp vụ; thiếu logger chung | P3 | `app/`, `worker/` | Source scan 2026-09-13 |
