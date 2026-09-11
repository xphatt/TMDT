# Test Plan — Trà Sữa Ngon

Ngày cập nhật: 2026-08-30
Trạng thái: **Đã triển khai test integration local; browser QA đang được hoàn tất**
Production dự kiến: `https://<worker-name>.<account-subdomain>.workers.dev`

## 1. Test seam hiện tại

| Module | Public seam | Adapter/runtime |
| --- | --- | --- |
| Storefront | Worker HTTP + browser UI | Vinext/React |
| Catalogue/pricing | `GET /api/menu`, create order | Dữ liệu TypeScript nội bộ; server tính lại giá |
| Address | `GET /api/address-suggestions?q=...` | Geoapify server adapter; fetch stub trong test |
| Orders | Customer API và admin API | D1 repository; memory chỉ khi bật rõ cho test |
| Authentication | Login/session/logout HTTP, cookie/CSRF | D1 session + PBKDF2/Web Crypto |
| Admin operation | Dashboard/list/detail/status/COD API | D1 query service + optimistic version |
| Payment | `PaymentProvider` | COD + QR mô phỏng; không gọi cổng thật |
| Metadata | HTML, robots, sitemap | `SITE_URL` server-side |

Test chỉ đi qua interface công khai hoặc Worker HTTP. D1 test là database tạm thời do Miniflare cấp, không truy cập database production.

## 2. Ma trận bắt buộc

| Nhóm | Trường hợp | Kết quả mong đợi |
| --- | --- | --- |
| Storefront | HTML/menu/assets | 200, nội dung thương hiệu đúng, không broken asset |
| Địa chỉ | query Việt Nam hợp lệ | Tối đa 5 kết quả tối giản, countrycode VN ở upstream |
| Địa chỉ | query trống/không kết quả | Validation hoặc empty state rõ, vẫn nhập tay |
| Địa chỉ | thiếu/sai key hoặc upstream lỗi | Lỗi thân thiện; không lộ key |
| Order | sản phẩm/size/topping hợp lệ | D1 ghi snapshot; tổng tiền do server tính |
| Order | item/topping lạ hoặc amount giả | 400; không tin giá client |
| Auth | thiếu session | Trang redirect login; API 401 |
| Auth | sai mật khẩu lặp lại | Lỗi chung và rate limit tạm thời |
| Auth | login đúng | Cookie session HttpOnly + cookie CSRF, session D1 |
| Auth | session hết hạn/revoked | 401 hoặc redirect login |
| Auth | logout | Session bị revoke và cookie bị xóa |
| Authorization | operator đọc | Được xem dữ liệu |
| Authorization | operator mutate | 403 |
| Admin list | search/filter/sort/page | Query server-side; metadata phân trang đúng |
| Status | transition hợp lệ | Order/version/history/audit cùng cập nhật |
| Status | transition sai hoặc version cũ | 409, không tạo history/audit giả |
| COD | cash + delivering/completed | Admin xác nhận `paid`, ghi amount/audit |
| COD | bank/QR hoặc trạng thái sớm | 409; không đổi payment |
| QR mô phỏng | mọi luồng nội bộ | Không tự đổi thành `paid` |
| Security | CSRF/origin sai | 403 |
| Security | bundle/source scan | Không có key/token/password thật |
| Responsive | 390/768/1366/1920 | Không overflow; menu, table/list và form dùng được |
| Accessibility | keyboard/focus/labels/status | Focus rõ; semantic control; trạng thái không chỉ dựa màu |
| Build | lint/typecheck/test/build | Exit code 0 |

## 3. Lệnh kiểm tra local

```bash
npm run db:migrate:local
npm run lint
npm run typecheck
npm test
npm run dev
```

`npm test` tự build rồi chạy integration suite. Không gọi Geoapify thật, không migrate D1 remote, không deploy và không tạo thanh toán thật.

## 4. Browser matrix

- Chromium trong Codex: kiểm tra trực tiếp login/admin shell, responsive và console.
- Firefox: chỉ đánh đạt khi có browser/runtime khả dụng và chạy trực tiếp.
- Safari/Edge: dùng HTML/CSS tiêu chuẩn; nếu không có runtime thì ghi chưa kiểm tra trực tiếp, không suy đoán là pass.
- Mọi visual regression quan trọng lưu trong `.impeccable/review/`; đây là evidence local, không phải asset production.

## 5. Điều kiện dừng phát hành

Không phát hành khi còn một trong các lỗi sau: build/typecheck/lint fail; auth bypass; mutation thiếu CSRF/role check; giá dựa vào client; QR thành `paid`; migration production chưa duyệt; secret lọt bundle/Git; hostname/D1 production chưa xác nhận.
