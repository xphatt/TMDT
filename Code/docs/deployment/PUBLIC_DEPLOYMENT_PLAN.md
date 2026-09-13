# Kế hoạch triển khai công khai

Trạng thái: **SOURCE READY FOR DEPLOYMENT — NOT DEPLOYED**  
Ngày lập: 13/09/2026.

## Kiến trúc và nền tảng đề xuất

Dự án không phải static-only: route server xử lý authentication, catalogue, feedback, review, order, health và D1. Nền tảng phù hợp nhất là **Cloudflare Workers + D1**, vì source đã có Worker entry, `wrangler.jsonc`, Vinext/Vite Cloudflare plugin và D1 binding. GitHub Pages không phù hợp nếu không tách/host toàn bộ backend ở nơi khác.

Không dùng OpenAI Sites. Không dùng `trasuangon.com` vì chưa có bằng chứng người dùng sở hữu domain. Giai đoạn đầu nên dùng hostname `workers.dev` thực tế do Cloudflare cấp; chỉ thêm custom domain sau khi người dùng xác nhận quyền sở hữu.

## Pipeline đề xuất

| Bước | Lệnh/thao tác | Ghi chú |
|---|---|---|
| Cài đặt | `npm ci` | Dùng lockfile hiện tại; Node.js ≥ 22.13 |
| Kiểm tra | `npm run lint && npm run typecheck && npm test` | Bắt buộc trước deploy |
| Build | `npm run build` | Production bundle |
| D1 | `npx wrangler d1 migrations apply DB --remote` | Chỉ sau phê duyệt database production và backup |
| Deploy | `npx wrangler deploy` | Chỉ sau khi người dùng chọn Cloudflare và đăng nhập |
| Health | `GET https://<hostname-thật>/api/health` | Mong đợi HTTP 200, `status=ok`, `database=connected` |
| Smoke test | menu → cart → checkout mock; admin auth; feedback/review | Không dùng giao dịch thật |

Workers là serverless nên không có lệnh `start` production thường trú. `npm run dev` chỉ dành cho local; production được Cloudflare chạy từ bundle deploy.

## Biến môi trường/binding

| Tên | Loại | Production |
|---|---|---|
| `SITE_URL` | biến công khai server | URL `workers.dev` hoặc custom domain thực tế |
| `GEOAPIFY_API_KEY` | secret | đặt bằng secret manager/Wrangler, không commit |
| `STORE_ADDRESS` | cấu hình | địa chỉ đã được chủ dự án xác nhận |
| `DB` | D1 binding | database production riêng, không dùng local DB |
| `DEMO_MODE` | demo flag | không đặt hoặc `false` |
| `DEMO_ERROR_SCENARIO` | demo flag | không đặt |

`.env.example` chỉ chứa tên biến, không chứa secret thật. `.env`/`.env.local`, `.wrangler` state, log và build output phải tiếp tục nằm ngoài Git.

## Tách môi trường

- Development: `http://localhost:3000`, D1 local, có thể bật demo lỗi.
- Preview/Staging: Worker/D1 riêng, hostname do nền tảng cấp; không dùng dữ liệu production.
- Production: hostname thật được người dùng xác nhận, D1 production, demo flags tắt.

## Rollback

1. Tạm ngừng thay đổi dữ liệu và ghi lại version/commit đang lỗi.
2. Trong Cloudflare, rollback Worker về deployment version gần nhất đã smoke-test.
3. Không tự rollback schema bằng cách xóa bảng/cột. Với migration additive, tạo migration sửa tiến tương thích ngược.
4. Kiểm tra `/api/health`, `/api/menu`, route trực tiếp, asset, đăng nhập Admin và một order mô phỏng.
5. Nếu lỗi liên quan D1, khôi phục từ backup/PITR theo quy trình Cloudflare đã được nhóm phê duyệt.

## Cổng phê duyệt bắt buộc

Phải dừng và xin xác nhận trước khi đăng nhập Cloudflare, tạo Worker/D1 production, áp migration remote, nhập secret, publish, nối custom domain hoặc đổi DNS. Các giá trị cần người dùng cung cấp:

1. Tài khoản/zone Cloudflare được phép dùng.
2. Worker name và hostname `workers.dev` thực tế.
3. Địa chỉ cửa hàng đã xác nhận.
4. Geoapify key production đã giới hạn và lưu qua secret manager.
5. Quyết định có dùng custom domain hay không và bằng chứng quyền sở hữu domain.

