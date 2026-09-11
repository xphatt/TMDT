# Báo cáo kiểm thử admin local

Ngày kiểm tra: 2026-08-30
Môi trường: Windows, Node.js local, Vinext dev, Cloudflare Miniflare/D1 local, Codex in-app Chromium.

## Kết quả tự động

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run db:migrate:local` | Đạt; migration local idempotent và chạy `PRAGMA optimize` |
| `npm run lint` | Đạt |
| `npm run typecheck` | Đạt |
| `npm test` | Đạt 11/11; lệnh tự build trước khi chạy test |
| Production build | Đạt; có 4 admin pages và 8 admin/auth endpoints |

Integration suite bao phủ: D1 order persistence, internal pricing, Geoapify success/empty/error/missing key, login sai/rate limit, login đúng/session, session expired/logout, role operator, search/list/detail, status state machine, optimistic version conflict, COD, history và audit.

## Browser QA

| Viewport | Kết quả |
| --- | --- |
| 390×844 | Không tràn ngang; input 52px, CTA/link chính 44px; nút đăng nhập nằm trong first viewport |
| 768×1024 | Layout xếp dọc; CTA hiển thị trong viewport; không tràn ngang |
| 1366×900 | Split layout 54/46 cân đối; form 430px; không scroll dọc/ngang |
| 1920×1080 | Hai vùng phủ đủ viewport; không tràn ngang |

Các kiểm tra trực tiếp khác:

- `/admin` khi chưa có session redirect tới `/admin/login?returnTo=%2Fadmin`.
- DOM có một form, label/textbox/button semantic và nút bị disabled khi dữ liệu chưa đủ.
- Có rule `:focus-visible`, reduced-motion và touch target tối thiểu cho các thao tác chính.
- Không có error/warning console sau reload cuối.
- Trong QA đã phát hiện `next/link` gây lỗi hydration với Vinext dev; đã quay về native anchor có chủ đích và giữ lint exception ở phạm vi file.

Ảnh bằng chứng:

- `.impeccable/review/mobile.png`
- `.impeccable/review/desktop.png`

## Phạm vi chưa kiểm tra trực tiếp

- Dashboard/list/detail sau đăng nhập chưa được mở bằng browser vì không đưa password hoặc session test vào browser tự động. Luồng tương ứng đã chạy qua Worker HTTP + D1 integration test; cần smoke test thủ công sau khi chủ dự án tự tạo và nhập credential local.
- Firefox, Safari, Edge và Chrome độc lập không có runtime khả dụng trong workspace. Source dùng HTML/CSS/Web API tiêu chuẩn, nhưng các môi trường này chưa được đánh dấu pass trực tiếp.
- Production Worker/D1, hostname `workers.dev`, secret và migration remote chưa được tạo hoặc kiểm tra vì chưa được phê duyệt.
