# Package Manifest

| File/thư mục | Được đưa vào | Lý do | Ghi chú |
|---|---|---|---|
| `app/` | Có | Storefront, admin, API route và server adapters | Source runtime chính |
| `db/`, `drizzle/` | Có | Schema và migration D1 | Không chứa database local |
| `worker/` | Có | Entry Vinext/Cloudflare Worker | Được `vite.config.ts` tham chiếu |
| `scripts/` | Có | Migrate D1 local và tạo admin local | Không thao tác remote |
| `tests/` | Có | Integration và UI regression test | `npm test` sử dụng |
| `public/favicon.svg` | Có | Favicon runtime | Asset được dùng |
| `public/fonts/tsn-display.ttf` | Có | Font thương hiệu | CSS tham chiếu |
| `public/images/*.png` | Có | Hero, sản phẩm, giới thiệu và social card | Source/UI tham chiếu |
| `.openai/hosting.json` | Có | Binding Sites hiện tại | Giữ nguyên starter |
| `package.json`, `package-lock.json` | Có | Dependency và lock file | Dùng `npm ci` |
| Các file `*.config.*`, `tsconfig.json`, `wrangler.jsonc` | Có | Build, lint, TypeScript, D1 và dev server | Không chứa secret thật |
| `.env.example` | Có | Tên biến môi trường mẫu | Giá trị key để trống |
| `.gitignore` | Có | Chặn secret, cache và build output | Áp dụng trong thư mục project |
| `README.md`, `README_GITHUB.md`, `PRODUCT.md`, `DESIGN.md` | Có | Hướng dẫn và bối cảnh sản phẩm/thiết kế | Không chứa credential |
| `docs/*.md`, `docs/qa/` | Có | API, database, admin, domain và QA | Tài liệu nhóm |
| Báo cáo học thuật và asset được báo cáo tham chiếu | Có | Giữ báo cáo có thể đọc/tái tạo | Chỉ giữ bản preview cuối và sơ đồ cần thiết |
| `examples/` | Có | Ví dụ capability D1 của starter | Không phải route runtime chính |
| `.env`, `.env.local` | Không | Có thể chứa secret | Bị ignore |
| `node_modules/` | Không | Dependency tái tạo từ lock file | Bị ignore |
| `.next/`, `.vinext/`, `dist/`, `.wrangler/`, `.npm-cache/` | Không | Build/cache/database local | Bị ignore |
| `deliverables/`, ZIP, log và browser profile | Không | Bản sao hoặc output máy local | Không cần để build/run |
| `.impeccable/` | Không | Mock/review artifact nội bộ | `DESIGN.md` vẫn được giữ |
| Các bản PDF preview cũ và ảnh render từng trang | Không | Output trung gian, trùng bản cuối | Có thể tái tạo bằng script tài liệu |

## Xác nhận

Gói trong repository chứa đủ source, lock file, cấu hình, asset runtime và tài liệu cần thiết để chạy `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` và `npm run dev` mà không phụ thuộc đường dẫn máy gốc.
