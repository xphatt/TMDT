# Kế hoạch kiểm kê và dọn dẹp file — Trà Sữa Ngon

Ngày lập: 2026-09-13  
Phạm vi: `D:\TMDT`  
Trạng thái: **GIAI ĐOẠN 1 — CHỈ KIỂM KÊ, CHƯA DỌN DẸP**

## 1. Kết luận trước khi thao tác

`D:\TMDT` tồn tại và đúng là project “Trà Sữa Ngon”: `package.json` có tên `tra-sua-ngon-storefront`, README mô tả đúng hệ thống, source chính nằm trong `app/`, backend/API dùng Vinext/Cloudflare Workers và dữ liệu D1 nằm sau adapter Drizzle.

Không có file nào bị xóa, di chuyển hoặc đổi tên trong giai đoạn này. File duy nhất được tạo là kế hoạch hiện tại.

Có một rủi ro cấu trúc phải giải quyết trước mọi thao tác Git:

- `D:\TMDT` **không phải Git worktree**.
- Git worktree duy nhất nằm lồng tại `D:\TMDT\repository`.
- Worktree lồng đang ở branch `main`, local ref báo `behind 2` so với `origin/main`, có `README.md` đã sửa và có `.env.example`, `.gitignore`, `GITHUB_PUSH_GUIDE.md`, `docs/` chưa được theo dõi.
- Remote là `https://github.com/xphatt/TMDT.git`.
- Trạng thái `behind 2` dựa trên remote-tracking ref hiện có; giai đoạn này không fetch/pull nên chưa xác minh trạng thái mới nhất trên GitHub.
- `repository/` hiện chỉ chứa README/tài liệu, không chứa source runtime ở `D:\TMDT\app`.

**Không được tự chuyển `.git`, chép source vào `repository/`, xóa `repository/` hoặc push trước khi người dùng chọn cây nào là canonical.**

## 2. Stack và convention thực tế

| Thành phần | Kết quả kiểm kê |
| --- | --- |
| Framework | React 19.2.6 + TypeScript 5.9.3 + Vinext 1.0.0-beta.2 + Vite 8.0.13 |
| Runtime/backend | Cloudflare Worker qua `worker/index.ts`; API handlers trong `app/api/` |
| Database | Cloudflare D1/SQLite; schema `db/schema.ts`; migration trong `drizzle/` |
| ORM | Drizzle ORM 0.45.2; Drizzle Kit 0.31.10 |
| Package manager | npm; `package-lock.json` lockfileVersion 3 |
| Node yêu cầu | `>=22.13.0`; môi trường kiểm tra Node v24.15.0, npm 11.12.1 |
| Source convention | Vinext App Router dùng `app/`; không đổi sang `src/` |
| Static assets | `public/`; các ảnh đang được `app/data/products.ts` và layout tham chiếu |
| Test | Node test runner: `tests/rendered-html.test.mjs`, `tests/ui-regression.test.mjs` |
| Lint | ESLint flat config; đã ignore build/cache chính |
| TypeScript | strict, bundler resolution, incremental; alias `@/*` trỏ root |
| Deployment config | `wrangler.jsonc`, `vite.config.ts`, `.openai/hosting.json`; không đổi starter/framework |
| Environment | Chỉ có `.env.example`; không thấy `.env` hoặc `.env.local` trong các cây không sinh tự động |

## 3. Git status ban đầu

| Cây | Branch | Trạng thái | Remote | Đánh giá |
| --- | --- | --- | --- | --- |
| `D:\TMDT` | Không có | `fatal: not a git repository` | Không có | Source runtime chưa nằm trực tiếp trong Git worktree. |
| `D:\TMDT\repository` | `main` | `main...origin/main [behind 2]`; `M README.md`; 4 nhóm untracked | `origin` → `https://github.com/xphatt/TMDT.git` | CẦN XÁC NHẬN; bảo toàn `.git` và mọi file chưa commit. |

Git ban đầu gặp cảnh báo dubious ownership do sandbox chạy bằng tài khoản khác chủ file. Kiểm kê dùng `git -c safe.directory=D:/TMDT/repository` cho từng lệnh đọc; không sửa global Git config.

## 4. Trạng thái build/test trước dọn dẹp

| Lệnh | Kết quả | Lỗi tồn tại trước dọn |
| --- | --- | --- |
| `npm run lint` | PASS, exit 0 | Không có lỗi lint. |
| `npm run typecheck` | PASS, exit 0 | Không có lỗi TypeScript. |
| `npm test` | PASS, exit 0 | 13/13 test pass, 0 fail/skipped. |
| `npm run build` | PASS, được chạy trong `npm test` | Có thông báo Vinext rằng một số route chưa được static analyzer phân loại; đây là cảnh báo thông tin, build vẫn hoàn tất. |
| `npm ls --depth=0` | Exit 0 | Có 3 package extraneous trong `node_modules`: `@emnapi/runtime`, `react-loading-skeleton`, `tslib`. Không sửa package/dependency ở giai đoạn này. |

Route build hiện có: `/`, `/admin`, `/admin/login`, `/admin/orders`, `/admin/orders/:id`, address/menu/order APIs và admin auth/dashboard/order APIs. Build thành công xác nhận import/route runtime chính đang hợp lệ trước dọn.

## 5. Phạm vi kiểm kê và thống kê

- Tổng cộng: **25.682 file**, **801.402.391 byte**, khoảng **764,28 MiB**.
- Đã quét SHA-256 cho **433 file không thuộc dependency/build/cache/.git**.
- Phát hiện **89 nhóm nội dung trùng SHA-256**, gồm **196 file instance**.
- Dung lượng lặp lý thuyết trong các nhóm SHA-256: **8.336.441 byte**. Không đồng nghĩa có thể xóa vì phần lớn là gói bàn giao `deliverables/` có chủ đích.
- Có **130 nhóm trùng tên file**. Phần lớn `route.ts`, `page.tsx`, `layout.tsx`, `index.ts` là convention hợp lệ của App Router/module và không phải file rác.
- Không phát hiện conflict marker `<<<<<<<`, `=======`, `>>>>>>>` trong source/tài liệu văn bản sau khi loại trừ dependency/build/cache/binary.
- `.gitignore` đã bảo vệ `node_modules`, cache/build, `.env*`, log, Python cache và `*.tsbuildinfo`; `.env.example` được cho phép theo dõi.

Mọi file con được bao phủ bởi một hàng subtree trong bảng dưới. Các cây sinh tự động được tổng hợp theo thư mục để kế hoạch có thể kiểm tra được mà không tạo bảng 25.682 dòng; trước Giai đoạn 2, manifest phải mở rộng thành từng target tuyệt đối được xác nhận.

## 6. Bảng phân loại toàn bộ cây dự án

| ID | Đường dẫn | Kích thước | Phân loại | Lý do | Đang được sử dụng | Hành động đề xuất | Rủi ro |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| INV-001 | `.impeccable/` | 7,13 MiB / 16 file | B — dữ liệu thiết kế | Chứa config, approved comp, surface brief và screenshot review. | Có; docs và script báo cáo tham chiếu ảnh review. | Giữ nguyên. | Cao nếu xóa mock/brief; mất nguồn thiết kế và bằng chứng. |
| INV-002 | `.next/` | 2.388 B / 1 file | A — tái tạo | Output/cache framework. | Không phải source; build có thể tạo lại. | Đề xuất xóa sau xác nhận. | Thấp. |
| INV-003 | `.npm-cache/` | 112,49 MiB / 941 file | A — tái tạo | Cache npm local. | Không được import. | Đề xuất xóa sau xác nhận. | Thấp; lần cài sau chậm hơn. |
| INV-004 | `.openai/hosting.json` | 34 B | B — cấu hình | Cấu hình Sites/D1 hiện hữu. | Có bởi capability Sites/hosting. | Giữ nguyên. | Cao nếu sửa/xóa vì có thể đổi hosting contract. |
| INV-005 | `.vinext/` | 147 B / 1 file | A — tái tạo | Cache/output Vinext. | Không phải source. | Đề xuất xóa sau xác nhận. | Thấp. |
| INV-006 | `.wrangler/state/` | 0,43 MiB / 9 file | B — dữ liệu quan trọng | Có SQLite D1 local và metadata Miniflare. | Có khi chạy local DB/admin/order. | Giữ nguyên; không xóa cả `.wrangler/`. | **Rất cao**: mất dữ liệu D1 local. |
| INV-007 | `.wrangler/qa-*-profile*/` | 157,68 MiB / 2.930 file | A — test cache, nhưng có thể chứa browser state | 8 profile Chromium/Edge do QA tạo; không được source/docs tham chiếu. | Không dùng runtime; chỉ phục vụ phiên browser cũ. | Đề xuất xóa đúng 8 path sau xác nhận. | Trung bình vì browser profile có thể chứa state kiểm thử; cần manifest hash/path. |
| INV-008 | `.wrangler/qa-*.html`, `.wrangler/qa-*.log` | 0,18 MiB / 10 file | A — output QA | HTML/log chụp phiên cũ; không có reference. | Không. | Đề xuất xóa đúng file sau xác nhận. | Thấp. |
| INV-009 | `.wrangler/deploy`, `local-runtime`, `registry`, `xdg` | 0,02 MiB / 11 file | A/B hỗn hợp | Runtime metadata nhỏ; chưa cần dọn để tiết kiệm dung lượng. | Có thể được Wrangler dùng. | Giữ nguyên. | Trung bình nếu xóa nhầm runtime metadata. |
| INV-010 | `app/` | 0,22 MiB / 50 file | B — source chính | Storefront, admin, API, auth, order, payment adapter. | Có; toàn bộ build route/import xác nhận. | Giữ nguyên; không di chuyển entry point/route. | Rất cao. |
| INV-011 | `db/` | 6.395 B / 2 file | B — database source | D1 schema và binding. | Có bởi order/admin runtime và Drizzle. | Giữ nguyên. | Rất cao. |
| INV-012 | `deliverables/` | 13,56 MiB / 135 file | C — bản bàn giao trùng có chủ đích | Hai bản web tách riêng, ZIP release, manifest và validation report. | Không import vào runtime chính; tài liệu học thuật nhắc đây là gói bàn giao. | CẦN XÁC NHẬN: giữ, chuyển sang kho artifact ngoài canonical Git, hoặc chỉ giữ ZIP/manifest. | Cao; có thể là sản phẩm bàn giao người dùng cần. |
| INV-013 | `dist/` | 7,63 MiB / 124 file | A — tái tạo | Production build output Vinext. | Không phải source; `npm run build` tái tạo. | Đề xuất xóa sau khi ghi lệnh tái tạo. | Thấp. |
| INV-014 | `docs/` | 51,24 MiB / 178 file | B/C — tài liệu và output báo cáo | Có guide, audit, QA, báo cáo Word/PDF, ảnh, script. | Có; README, báo cáo Markdown và script tham chiếu chéo. | Giữ nội dung; đề xuất sắp xếp có cập nhật link sau xác nhận. | Cao nếu di chuyển thiếu link/assets. |
| INV-015 | `docs/__pycache__/` | 3.111 B / 1 file | A — tái tạo | Python bytecode. | Không. | Đề xuất xóa. | Thấp. |
| INV-016 | `docs/report-assets/rendered-pages/` | 9,70 MiB / 52 file | C — output báo cáo cũ | Bản render không hậu tố; script hiện trỏ bản `-v8`. | Không thấy reference trực tiếp hiện hành. | CẦN XÁC NHẬN trước khi cách ly/xóa. | Trung bình; là bằng chứng trực quan cũ. |
| INV-017 | `docs/report-assets/qa-contact/` | 9,28 MiB / 6 file | C — ảnh QA báo cáo cũ | Có bản `qa-contact-v8` mới hơn. | Không thấy reference hiện hành. | CẦN XÁC NHẬN trước khi cách ly/xóa. | Trung bình. |
| INV-018 | 7 PDF `preview.pdf`, `preview-v2`…`preview-v7` | 9,04 MiB | B/C — báo cáo PDF cũ | Có `preview-v8` và `preview-final` mới hơn; file report không tự xóa. | Không thấy link hiện hành; script trỏ v8, fact-check nhắc final. | CẦN XÁC NHẬN trước khi cách ly/xóa. | Trung bình; có thể cần lịch sử biên tập. |
| INV-019 | `docs/report-assets/rendered-pages-v8/`, `qa-contact-v8/`, `preview-v8.pdf`, `preview-final.pdf` | 29,57 MiB | B — báo cáo hiện hành | V8 được script preview sử dụng; final được fact-check ghi nhận. | Có. | Giữ nguyên cho tới khi chủ tài liệu chọn một bản canonical. | Cao. |
| INV-020 | `docs/audit/`, `docs/qa/`, test reports | 0,19 MiB / 27 file | B — bằng chứng kiểm thử | Báo cáo hiện hành, log và matrix. | Có để truy vết chất lượng. | Giữ; có thể gom vào `docs/testing/` sau xác nhận. | Trung bình nếu làm hỏng link. |
| INV-021 | `docs/presentation/` | 38.166 B / 1 file | B — tài liệu trình bày | Outline hiện hành, tham chiếu source/asset. | Có. | Giữ nguyên. | Thấp. |
| INV-022 | Báo cáo học thuật `.docx`, `.md`, `REPORT_FACT_CHECK.md`, diagram/asset | 50,93 MiB / 138 file | B — deliverable | Tài liệu do nhóm tạo, không phải cache đơn thuần. | Có; Markdown nhúng diagram/assets. | Giữ; chỉ sắp xếp sau xác nhận và cập nhật toàn bộ link. | Cao. |
| INV-023 | `docs/build_academic_report.py`, `render_report_preview.py`, `scrub_report_metadata.py` | 0,03 MiB / 3 file | B — script | Tạo/render/scrub báo cáo. | Có; tham chiếu `docs/report-assets`. | Đề xuất chuyển `scripts/reporting/` sau xác nhận, cập nhật path. | Trung bình. |
| INV-024 | `drizzle/` | 0,03 MiB / 3 file | B — migration | Migration SQL, journal, snapshot. | Có bởi Drizzle/Wrangler. | Giữ nguyên. | Rất cao. |
| INV-025 | `examples/d1/` | 2.137 B / 2 file | C — starter example | Không được runtime import; báo cáo xác định là ví dụ starter. | Không dùng nghiệp vụ chính. | CẦN XÁC NHẬN giữ làm tài liệu hay chuyển `docs/examples/`; không tự xóa. | Trung bình. |
| INV-026 | `node_modules/` | 400,58 MiB / 21.107 file | A — tái tạo | Dependency đã cài; lockfile đầy đủ. | Cần để chạy local nhưng không push Git. | Đề xuất xóa cuối quy trình nếu mục tiêu là gói Git/dung lượng; tái tạo bằng `npm ci`. | Thấp cho source; website không chạy cho tới khi cài lại. |
| INV-027 | `public/` | 6,13 MiB / 13 file | B — asset sản phẩm | Font, favicon và ảnh/metadata đang được source dùng. | Có; build/runtime đã xác nhận path. | Giữ nguyên. | Rất cao. |
| INV-028 | `repository/.git/` | 6,26 MiB / 115 file | B — Git history | Lịch sử/refs/remote duy nhất. | Có; là metadata Git duy nhất trong `D:\TMDT`. | Giữ tuyệt đối. | **Tối quan trọng**. |
| INV-029 | `repository/README.md` | 4.663 B | B — file đã sửa chưa commit | Git báo modified. | Có trong worktree. | Giữ nguyên; không overwrite bằng README root. | Cao. |
| INV-030 | `repository/.env.example`, `.gitignore`, `GITHUB_PUSH_GUIDE.md`, `docs/` | 32.533 B / 9 file | B — untracked | Chưa commit; người dùng/nhóm có thể cần. | Có trong working copy, chưa được Git theo dõi. | Giữ nguyên; CẦN XÁC NHẬN canonical Git. | Cao. |
| INV-031 | `scripts/` | 6.128 B / 2 file | B — operational scripts | Migrate local và tạo admin an toàn. | Có qua package scripts. | Giữ nguyên. | Rất cao. |
| INV-032 | `tests/` | 24.522 B / 2 file | B — test | 13 test đang pass. | Có qua `npm test`. | Giữ nguyên. | Cao. |
| INV-033 | `tmp/` | 0 B / 0 file | A — thư mục tạm rỗng | Không có file/reference. | Không. | Đề xuất xóa thư mục rỗng và thêm `/tmp/` vào `.gitignore` nếu nhóm tiếp tục dùng tên này. | Thấp. |
| INV-034 | `worker/` | 2.195 B / 1 file | B — entry point | `wrangler.jsonc` trỏ `worker/index.ts`. | Có. | Giữ nguyên. | Rất cao. |
| INV-035 | `.dev-server.stderr.log`, `.dev-server.stdout.log` | 636 B | A — runtime log | Log cũ, đã được `.gitignore` bảo vệ. | Không. | Đề xuất xóa đúng 2 file. | Thấp. |
| INV-036 | `.env.example` | 130 B | B — env mẫu | Chỉ có tên biến, không có Geoapify key thật. | Có bởi README/test. | Giữ nguyên và tiếp tục cho phép commit. | Cao nếu xóa. |
| INV-037 | `.gitignore` | 579 B | B — cấu hình | Đã ignore dependency/build/cache/log/env/coverage. | Có cho canonical repo tương lai. | Giữ; chỉ cân nhắc thêm `/tmp/` sau xác nhận. | Thấp. |
| INV-038 | `DESIGN.md`, `PRODUCT.md` | 17.708 B | B — product/design truth | Định nghĩa thương hiệu và scope. | Có bởi quy trình thiết kế/audit. | Giữ nguyên. | Cao. |
| INV-039 | `drizzle.config.ts` | 155 B | B — DB config | Trỏ schema/migration. | Có bởi Drizzle. | Giữ nguyên. | Rất cao. |
| INV-040 | `eslint.config.mjs` | 1.106 B | B — lint config | Lint đang pass. | Có. | Giữ nguyên. | Cao. |
| INV-041 | `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs` | 435 B | B — framework config | Vinext/Next compatibility và CSS pipeline. | Có khi typecheck/build. | Giữ nguyên. | Cao. |
| INV-042 | `package.json`, `package-lock.json` | 361.158 B | B — dependency contract | Scripts và phiên bản dependency hiện hành. | Có; npm/build/test dùng trực tiếp. | Giữ nguyên; không chỉnh dependency. | Rất cao. |
| INV-043 | `README.md` | 11.364 B | B — tài liệu chính | Hướng dẫn run/env/admin/deployment và link docs. | Có. | Giữ; cập nhật link chỉ nếu docs được di chuyển. | Cao. |
| INV-044 | `tsconfig.json` | 671 B | B — TS config | Typecheck đang pass. | Có. | Giữ; chưa đề xuất thay exclude trong lượt này. | Cao. |
| INV-045 | `tsconfig.tsbuildinfo` | 245.494 B | A — tái tạo | Cache incremental TypeScript, đã ignore. | Không phải source. | Đề xuất xóa. | Thấp. |
| INV-046 | `vite.config.ts`, `wrangler.jsonc` | 2.569 B | B — build/deploy config | Tạo Vinext/Cloudflare build và D1 binding. | Có. | Giữ nguyên. | Rất cao. |

## 7. Phân tích file trùng

### 7.1 Trùng nội dung SHA-256

Các nhóm sau giải thích toàn bộ 89 nhóm hash trùng theo nguồn gốc:

| Cụm | File trùng chính xác | Bản đang dùng | Đánh giá |
| --- | --- | --- | --- |
| DUP-01 | `public/images/{about-tea,product-lineup,hero-brown-sugar,og}.png` và 4 JSON metadata trùng bản trong `deliverables/github-ready/storefront-web/public/images/` | Bản root `public/` | Trùng có chủ đích để gói storefront chạy độc lập. Không xóa nếu còn cần deliverable. |
| DUP-02 | `public/fonts/tsn-display.ttf`, `public/favicon.svg` trùng bản storefront; favicon cũng trùng bản admin | Bản root `public/` | Trùng có chủ đích trong gói bàn giao. |
| DUP-03 | Root storefront source trùng bản export: `app/page.tsx`, `layout.tsx`, `types.ts`, `robots.ts`, `sitemap.ts`, `data/pricing.ts`, `data/products.ts`, `lib/checkout-api.ts`, `lib/storage.ts`, address/menu/order APIs, address service, runtime/site config, order repository/resolver/service/types, payment provider, D1 schema/index, migration/meta | Bản root `app/`, `db/`, `drizzle/` | Root là runtime chính; export là snapshot tách riêng. |
| DUP-04 | Root admin source trùng bản export: `admin-client.ts`, AdminDashboard/LoginForm/OrderDetail/Orders, admin layout, auth login/logout/session, dashboard/order APIs, admin-http/orders, admin auth/request/password, order types, payment provider, D1 schema/index, worker | Bản root | Trùng có chủ đích trong admin handoff. |
| DUP-05 | Config/tài liệu chung trùng 2–3 bản: `DESIGN.md`, `PRODUCT.md`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, `.openai/hosting.json`, `PAYMENT_PROVIDERS.md`, migration snapshot/journal | Bản root | Không xóa riêng lẻ khỏi package độc lập nếu package vẫn được giữ. |
| DUP-06 | `package-lock.json` root trùng storefront export; hai export có một số config giống nhau | Theo từng project/package | Lockfile là bắt buộc; không coi là rác khi package độc lập. |
| DUP-07 | `.impeccable/review/tablet-768.png`, `tablet-1024.png`, `desktop.png`, `mobile.png` trùng `docs/report-assets/storefront-768.png`, `storefront-1024.png`, `admin-login-desktop.png`, `admin-login-mobile.png` | Cả hai phía đang được tài liệu/script tham chiếu | CẦN XÁC NHẬN trước khi hợp nhất; không xóa bản nguồn thiết kế. |
| DUP-08 | 6 cặp page render giống hệt giữa `rendered-pages/` và `rendered-pages-v8/`: page 001, 002, 014, 015, 017, 019 | `rendered-pages-v8/` là output script hiện hành | Chỉ một phần của hai bộ giống hash; không được xóa từng page rời làm bộ render thiếu trang. |
| DUP-09 | `docs/audit/evidence/source-hashes-before.csv` và `source-hashes-after.csv` giống hệt | Cả hai là bằng chứng audit | Trùng có ý nghĩa: chứng minh source không đổi; giữ. |

Các file cùng tên nhưng khác nội dung đã được phân biệt. Ví dụ `route.ts` và `page.tsx` lặp tên theo App Router, `README.md` mô tả các package khác nhau, `schema.ts` trong `examples/d1` khác schema production. Không đề xuất xóa theo tên.

### 7.2 File mới hơn và file đang được tham chiếu

- `deliverables/github-ready/*` có timestamp 2026-09-07 và là snapshot bàn giao, trong khi source root có một số file cập nhật đến 2026-09-10. Vì vậy export có thể đã cũ so với runtime root dù nhiều file còn trùng hash.
- `docs/render_report_preview.py` trỏ `preview-v8.pdf` và `rendered-pages-v8/`.
- `docs/REPORT_FACT_CHECK.md` ghi `preview-final.pdf` là tệp xem trước cuối.
- `docs/build_academic_report.py` đọc ảnh từ `.impeccable/review/` và chép sang `docs/report-assets/`.
- `docs/Bao_Cao_Tieu_Luan_TMDT.md` nhúng diagram/ảnh trong `docs/report-assets/` và nhắc `deliverables/`, `examples/d1`, `repository/` theo mục đích tài liệu.
- Runtime không import `deliverables/`, `repository/`, `examples/d1/` hoặc `docs/`.

## 8. Bốn danh sách hành động

### 8.1 Đề xuất xóa an toàn — chỉ sau khi người dùng xác nhận

| ID xác nhận | Target chính xác | Dung lượng | Lệnh tái tạo/ghi chú |
| --- | --- | ---: | --- |
| DEL-A01 | `D:\TMDT\node_modules` | 400,58 MiB | `npm ci`; nên xóa cuối cùng sau regression test nếu muốn giải phóng ổ đĩa. |
| DEL-A02 | `D:\TMDT\.npm-cache` | 112,49 MiB | npm tự tải lại cache khi cài dependency. |
| DEL-A03 | `D:\TMDT\dist` | 7,63 MiB | `npm run build`. |
| DEL-A04 | `D:\TMDT\.next` | 2.388 B | `npm run dev`/`npm run build`. |
| DEL-A05 | `D:\TMDT\.vinext` | 147 B | `npm run dev`/`npm run build`. |
| DEL-A06 | `D:\TMDT\tsconfig.tsbuildinfo` | 0,23 MiB | `npm run typecheck`. |
| DEL-A07 | `D:\TMDT\.dev-server.stderr.log`; `D:\TMDT\.dev-server.stdout.log` | 636 B | Runtime log cũ; tự sinh khi redirect output. |
| DEL-A08 | `D:\TMDT\docs\__pycache__` | 3.111 B | Python tự tạo lại bytecode. |
| DEL-A09 | `D:\TMDT\tmp` | 0 B | Thư mục rỗng; đề xuất thêm `/tmp/` vào `.gitignore`. |
| DEL-A10 | 8 thư mục `.wrangler/qa-chrome-profile`, `qa-chrome-profile-1366`, `qa-chrome-profile-1920`, `qa-chrome-profile-escalated`, `qa-edge-profile`, `qa-edge-profile-1366`, `qa-edge-profile-1920`, `qa-edge-profile-escalated` | 157,68 MiB | Browser QA tạo lại profile mới. Không chạm `.wrangler/state`. |
| DEL-A11 | 10 file `.wrangler/qa-chrome-1366-escalated.log`, `qa-chrome-1366.html`, `qa-chrome-1366.log`, `qa-chrome-1920.html`, `qa-chrome-1920.log`, `qa-edge-1366-escalated.log`, `qa-edge-1366.html`, `qa-edge-1366.log`, `qa-edge-1920.html`, `qa-edge-1920.log` | 0,18 MiB | Output QA cũ. Giai đoạn 2 phải resolve từng absolute path, không dùng glob để xóa. |

Tổng tối đa của DEL-A01 đến DEL-A11: **711.779.697 byte ≈ 678,81 MiB**. Nếu giữ `node_modules` để tiếp tục development ngay, dung lượng giải phóng còn khoảng **278,23 MiB**.

### 8.2 Đề xuất chuyển vị trí — tất cả cần xác nhận và regression test

| ID xác nhận | Hiện tại | Vị trí đề xuất | Lý do | Cập nhật bắt buộc | Rủi ro |
| --- | --- | --- | --- | --- | --- |
| MOVE-B01 | `docs/qa/`, `docs/audit/`, `ADMIN_TEST_REPORT.md`, `RESPONSIVE_TEST_REPORT.md`, `TEST_PLAN.md` | `docs/testing/` theo các nhánh `qa/`, `audit/` | Gom tài liệu test. | README và mọi Markdown link. | Trung bình. |
| MOVE-B02 | `DOMAIN_SETUP.md`, `PRODUCTION_DOMAIN_MIGRATION.md`, `URL_AUDIT.md` | `docs/deployment/` | Gom hướng dẫn triển khai/domain. | README và link chéo. | Thấp–trung bình. |
| MOVE-B03 | `ADMIN_GUIDE.md`, `ADMIN_IMPLEMENTATION_PLAN.md`, `API_ADMIN.md`, `DATABASE_SCHEMA.md`, `PAYMENT_PROVIDERS.md` | `docs/architecture/` hoặc `docs/admin/` theo quyết định nhóm | Giảm 14 file lẻ ở root docs. | README, báo cáo, guide. | Trung bình. |
| MOVE-B04 | `Bao_Cao_Tieu_Luan_TMDT.*`, `REPORT_FACT_CHECK.md`, `report-assets/` | `docs/report/` | Nhóm báo cáo học thuật và asset. | Mọi image link trong Markdown và Python path. | Cao do 138 file/50,93 MiB. |
| MOVE-B05 | Ba Python script trong `docs/` | `scripts/reporting/` | Script hỗ trợ nên ở `scripts/`. | Hằng `ROOT`, `DOCS`, `ASSETS`, README/câu lệnh. | Trung bình. |

Không đề xuất di chuyển `app/`, `db/`, `drizzle/`, `public/`, `tests/`, `worker/`, migration hoặc route/API.

### 8.3 Đề xuất giữ nguyên

- `app/`, `db/`, `drizzle/`, `public/`, `scripts/`, `tests/`, `worker/`.
- `.openai/hosting.json`, `wrangler.jsonc`, `vite.config.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `drizzle.config.ts`.
- `package.json`, `package-lock.json`, `.env.example`, `.gitignore`, `README.md`, `PRODUCT.md`, `DESIGN.md`.
- `.wrangler/state/` và mọi SQLite/D1 local.
- `.impeccable/mocks/`, `.impeccable/surfaces/`, `.impeccable/review/` trong lúc tài liệu còn tham chiếu.
- Toàn bộ file chưa commit trong `repository/` và toàn bộ `repository/.git/`.
- Báo cáo, Word, PDF, ảnh sản phẩm, test, migration, seed/config không được xóa chỉ vì không có import runtime.

### 8.4 Cần người dùng xác nhận

| ID xác nhận | Quyết định cần chọn | Khuyến nghị |
| --- | --- | --- |
| CONF-C01 | Cây Git canonical là `D:\TMDT` hay `D:\TMDT\repository`? | Khuyến nghị giữ lịch sử trong `repository/.git`, trước tiên đồng bộ/fetch theo phê duyệt, sau đó lập kế hoạch đưa source runtime vào đúng worktree bằng copy có manifest; không di chuyển `.git` thủ công. |
| CONF-C02 | Giữ cả thư mục source unpacked và 2 ZIP trong `deliverables/github-ready`, hay chỉ giữ một dạng? | Nếu ZIP đã bàn giao và có checksum, có thể giữ ZIP+manifest ngoài canonical source repo; không quyết định thay người dùng. |
| CONF-C03 | Có giữ lịch sử report preview cũ: `rendered-pages/`, `qa-contact/`, `preview.pdf`, `preview-v2` đến `preview-v7`? | Khuyến nghị cách ly trước, giữ `preview-v8`, `preview-final`, `rendered-pages-v8`, `qa-contact-v8`; tiềm năng thêm **28,02 MiB**. |
| CONF-C04 | `examples/d1/` còn cần làm ví dụ starter không? | Nếu không dùng đào tạo, chuyển sang `docs/examples/d1/`; không xóa source mẫu khi chưa xác nhận. |
| CONF-C05 | Có thực hiện MOVE-B01 đến MOVE-B05 không? | Khuyến nghị chỉ làm sau khi Git canonical được chốt để mọi rename được Git ghi nhận và link được review. |
| CONF-C06 | Có xóa `node_modules` sau kiểm tra không? | Nếu đang tiếp tục code ngay, giữ; nếu chuẩn bị upload/GitHub, xóa và dùng `npm ci` khi cần. |
| CONF-C07 | Có cho phép xóa 8 browser profile QA không? | Khuyến nghị xóa sau manifest; không chứa source nhưng có thể chứa browser state cũ. |
| CONF-C08 | Ba package extraneous trong `node_modules` có phải do thử nghiệm thủ công? | Không gỡ riêng. Xóa/recreate `node_modules` bằng `npm ci` sẽ là cách an toàn sau xác nhận. |

## 9. Cây thư mục trước khi dọn

```text
D:\TMDT
├── .impeccable/
├── .next/
├── .npm-cache/
├── .openai/
├── .vinext/
├── .wrangler/
│   ├── state/                  # chứa D1 local, phải giữ
│   ├── qa-*-profile*/          # 8 browser profile cũ
│   └── qa-*.html + qa-*.log
├── app/                        # source runtime chính
├── db/
├── deliverables/github-ready/ # hai source export + hai ZIP
├── dist/
├── docs/
│   ├── __pycache__/
│   ├── audit/
│   ├── presentation/
│   ├── qa/
│   ├── report-assets/
│   └── 14 tài liệu/script ở root docs
├── drizzle/
├── examples/d1/
├── node_modules/
├── public/
├── repository/
│   ├── .git/                   # Git history duy nhất
│   ├── docs/
│   └── README/config/guide chưa đồng bộ với source root
├── scripts/
├── tests/
├── tmp/
├── worker/
├── .dev-server.stderr.log
├── .dev-server.stdout.log
├── .env.example
├── .gitignore
├── DESIGN.md
├── PRODUCT.md
├── README.md
├── package.json
├── package-lock.json
└── framework/build/database configs
```

## 10. Cây dự kiến sau dọn

Cây này chỉ mô tả DEL-A được duyệt và MOVE-B được duyệt; **không giả định quyết định Git CONF-C01**.

```text
D:\TMDT
├── .impeccable/
├── .openai/
├── .wrangler/
│   ├── state/                  # bảo toàn D1 local
│   ├── deploy/
│   ├── local-runtime/
│   ├── registry/
│   └── xdg/
├── app/
├── db/
├── deliverables/              # giữ/chuyển theo CONF-C02
├── docs/
│   ├── architecture/          # nếu MOVE-B03 được duyệt
│   ├── deployment/            # nếu MOVE-B02 được duyệt
│   ├── presentation/
│   ├── report/                # nếu MOVE-B04 được duyệt
│   └── testing/               # nếu MOVE-B01 được duyệt
├── drizzle/
├── examples/                  # giữ/chuyển theo CONF-C04
├── public/
├── repository/                # giữ nguyên cho tới CONF-C01
├── scripts/
│   └── reporting/             # nếu MOVE-B05 được duyệt
├── tests/
├── worker/
├── .env.example
├── .gitignore
├── DESIGN.md
├── PRODUCT.md
├── README.md
├── package.json
├── package-lock.json
└── framework/build/database configs
```

Các thư mục `node_modules/`, `dist/`, `.next/`, `.vinext/` không xuất hiện trong cây sạch vì có thể tái tạo. Khi cần chạy lại, `npm ci` và `npm run build` sẽ tạo chúng; không đưa chúng vào Git.

## 11. Ước tính dung lượng giải phóng

| Phạm vi | Dung lượng ước tính |
| --- | ---: |
| DEL-A01 đến DEL-A11 | 678,81 MiB |
| Nếu giữ `node_modules` | 278,23 MiB |
| Report preview cũ CONF-C03, chỉ khi được duyệt | thêm 28,02 MiB |
| Trùng SHA-256 lý thuyết | 7,95 MiB; phần lớn nằm trong deliverable nên không tự cộng vào mức an toàn |
| Tối đa gồm DEL-A và report cũ được duyệt | khoảng 706,83 MiB |

## 12. Kế hoạch Giai đoạn 2 sau xác nhận

1. Đọc lại trạng thái Git và xác minh tuyệt đối mọi target.
2. Tạo `docs/maintenance/FILE_CLEANUP_MANIFEST.md` với path, byte, SHA-256, action, old/new path, lý do và timestamp.
3. Không thao tác `.wrangler/state`, `repository/.git`, source, DB, migration, test, asset sản phẩm hoặc file chưa commit.
4. Với report cũ/file chưa chắc chắn, ưu tiên chuyển vào thư mục cách ly đã được người dùng đặt tên; không xóa vĩnh viễn.
5. Thực hiện từng ID đã được duyệt, không dùng glob rộng cho xóa.
6. Nếu có MOVE-B, dùng Git-aware move chỉ sau khi canonical worktree được chốt; cập nhật toàn bộ import, Markdown link, Python path và README.
7. Chạy lại lint, type-check, 13 test, production build và smoke route/asset.
8. So sánh với baseline ở mục 4. Nếu có lỗi mới, dừng và khôi phục target liên quan.
9. Cập nhật manifest và tạo `docs/maintenance/FILE_CLEANUP_RESULT.md`.
10. Không commit/push/deploy nếu không có yêu cầu riêng.

## 13. Cổng xác nhận bắt buộc

**DỪNG TẠI ĐÂY. Chưa được thực hiện Giai đoạn 2.**

Để phê duyệt an toàn, người dùng cần trả lời bằng danh sách ID cụ thể. Mẫu xác nhận khuyến nghị:

```text
Tôi duyệt DEL-A02 đến DEL-A11; giữ DEL-A01 node_modules.
Tạm hoãn MOVE-B01 đến MOVE-B05.
CONF-C01: chọn repository/ làm Git canonical, chưa đồng ý copy/move source.
CONF-C02: giữ deliverables.
CONF-C03: cách ly report cũ, chưa xóa vĩnh viễn.
```

Nếu câu trả lời chỉ là “đồng ý” nhưng không giải quyết CONF-C01/CONF-C02/CONF-C03, Giai đoạn 2 chỉ được phép xử lý các target DEL-A được nêu rõ; không được suy diễn quyền thay đổi Git, deliverable hoặc báo cáo.
