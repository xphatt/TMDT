# Package Manifest

Gói này được tạo bằng thao tác sao chép có chọn lọc, không sửa, di chuyển hoặc xóa file trong project gốc.

| File/thư mục | Được đưa vào | Lý do | Ghi chú |
|---|---|---|---|
| `app/` | Có | Source trang, UI, dữ liệu, client adapter và API nội bộ | `app/chatgpt-auth.ts` chưa được import; giữ lại và đánh dấu Cần xác nhận vì có thể thuộc starter |
| `worker/` | Có | Entry Cloudflare/Vinext được `vite.config.ts` tham chiếu | Bắt buộc cho cấu hình build hiện tại |
| `tests/` | Có | Integration test hiện có | Script `npm test` sử dụng trực tiếp |
| `public/favicon.svg` | Có | Metadata trong `app/layout.tsx` tham chiếu | Asset runtime |
| `public/fonts/tsn-display.ttf` | Có | `app/globals.css` tham chiếu bằng `@font-face` | Asset runtime |
| `public/images/about-tea.png` | Có | UI, CSS và dữ liệu sản phẩm tham chiếu | Asset runtime |
| `public/images/hero-brown-sugar.png` | Có | UI, CSS và dữ liệu sản phẩm tham chiếu | Asset runtime |
| `public/images/product-lineup.png` | Có | Dữ liệu sản phẩm tham chiếu | Asset runtime |
| `public/images/og.png` | Có | Open Graph và Twitter metadata tham chiếu | Social preview runtime |
| `.openai/hosting.json` | Có | Cấu hình Sites hiện tại | Giữ nguyên starter, D1 và R2 đang tắt |
| `package.json` | Có | Manifest dependency và script | Yêu cầu Node.js từ `22.13.0` |
| `package-lock.json` | Có | Khóa phiên bản dependency | Dùng `npm ci` thay vì tạo lock file mới |
| `vite.config.ts` | Có | Cấu hình Vinext, Sites và Cloudflare | Bắt buộc cho build |
| `tsconfig.json` | Có | Cấu hình TypeScript | Bắt buộc cho type checking/build |
| `next.config.ts` | Có | Cấu hình tương thích Next/Vinext | Giữ nguyên |
| `next-env.d.ts` | Có | Khai báo type framework | Giữ nguyên |
| `eslint.config.mjs` | Có | Cấu hình lint | Script `npm run lint` sử dụng |
| `postcss.config.mjs` | Có | Cấu hình CSS/PostCSS | Bắt buộc cho style build |
| `drizzle.config.ts` | Có | Cấu hình schema generation hiện có | Cần xác nhận vì D1 chưa bật |
| `db/` | Có | Database adapter/schema starter | Cần xác nhận; runtime commerce hiện dùng memory repository |
| `drizzle/` | Có | Metadata migration starter | Cần xác nhận; không thay schema |
| `examples/` | Có | Ví dụ D1 được comment trong `db/schema.ts` tham chiếu | Cần xác nhận; không phải route runtime chính |
| `README.md` | Có | Hướng dẫn chạy và giới hạn dự án | Giữ nguyên tài liệu gốc |
| `README_GITHUB.md` | Có | Hướng dẫn riêng cho gói GitHub | File mới chỉ tồn tại trong bản sao |
| `PRODUCT.md` | Có | Bối cảnh và phạm vi sản phẩm | Tài liệu cần thiết |
| `DESIGN.md` | Có | Design system và quyết định giao diện | Tài liệu cần thiết |
| `docs/` | Có | Tài liệu payment provider và seam tích hợp | Không chứa secret |
| `.env.example` | Có | Khai báo `GEOAPIFY_API_KEY` với giá trị rỗng | Không sao chép `.env` hoặc `.env.local` |
| `.gitignore` | Có | Chặn secret, dependency, cache, log và build output | Bản dành riêng cho gói bàn giao |
| `.impeccable/` | Không | Design mock/review artifact không được runtime hoặc tài liệu bàn giao cần trực tiếp | Có thể lưu ở artifact storage riêng |
| `public/images/*.json` | Không | Prompt sidecar không được source tham chiếu | Ảnh PNG tương ứng vẫn được giữ |
| `public/file.svg`, `public/globe.svg`, `public/window.svg` | Không | SVG starter không được source tham chiếu | Không ảnh hưởng build/runtime |
| `node_modules/` | Không | Dependency đã cài, kích thước lớn và tái tạo bằng lock file | Chạy `npm ci` trong bản sao |
| `.next/`, `.vinext/`, `dist/` | Không | Build output có thể tái tạo | Không đưa lên Git |
| `.wrangler/`, `.npm-cache/` | Không | Cache và state máy local | Không đưa lên Git |
| `.env`, `.env.local` | Không | Có thể chứa secret | Bị `.gitignore` chặn |
| `.git/` | Không | Không trộn lịch sử Git vào gói ZIP | Người nhận tự clone hoặc init theo quy trình nhóm |
| `repository/` | Không | Working copy Git lồng được tạo cho tác vụ tài liệu trước đó | Không thuộc source website runtime |

## Kết luận

Gói giữ source và cấu hình cần để chạy project theo trạng thái hiện có. Các capability starter chưa chắc cần được giữ thay vì xóa, đúng nguyên tắc an toàn; nhóm có thể loại chúng trong thay đổi riêng sau khi xác minh import, build và nhu cầu triển khai.
