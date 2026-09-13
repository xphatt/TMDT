# Kế hoạch dọn dẹp an toàn — Trà Sữa Ngon

Ngày kiểm kê: 13/09/2026  
Phạm vi: `D:\TMDT`  
Trạng thái: **GIAI ĐOẠN 1 — CHỈ KIỂM KÊ, CHƯA XÓA HOẶC DI CHUYỂN**

## 1. Kết luận kiểm kê

`D:\TMDT` tồn tại và đúng là dự án “Trà Sữa Ngon”. `package.json` định danh `tra-sua-ngon-storefront`; source chính nằm trong `app/`, API dùng App Router, Worker entry nằm ở `worker/index.ts`, database dùng D1/Drizzle trong `db/` và `drizzle/`.

Không có file nào bị xóa, di chuyển hoặc đổi tên trong giai đoạn này. File nội dung duy nhất được chủ động tạo là `docs/maintenance/CLEANUP_PLAN.md`; các lệnh baseline bắt buộc có thể làm mới build/cache tái tạo như `dist/` và `tsconfig.tsbuildinfo` nhưng không sửa source hay dữ liệu nghiệp vụ.

Rủi ro cần giải quyết trước mọi thao tác Git:

- `D:\TMDT` không phải Git worktree.
- Git worktree duy nhất nằm lồng tại `D:\TMDT\repository`.
- `repository/` chỉ có README/tài liệu, chưa có source runtime trong `D:\TMDT\app`.
- `repository/` đang ở `main`, local ref báo `behind 2` so với `origin/main`, có `README.md` đã sửa và nhiều file untracked.
- Không được chuyển `.git`, ghi đè `repository/README.md`, chép source vào worktree hoặc xóa `repository/` trước khi người dùng chọn cây canonical.

## 2. Framework, package manager và Git

| Hạng mục | Kết quả |
|---|---|
| Framework | React 19.2.6, TypeScript 5.9.3, Vinext 1.0.0-beta.2, Vite 8.0.13 |
| Backend | Cloudflare Worker; route handler trong `app/api/` |
| Database | Cloudflare D1/SQLite; Drizzle ORM 0.45.2 |
| Package manager | npm; `package-lock.json` lockfileVersion 3 |
| Node yêu cầu | `>=22.13.0` |
| Build | `npm run build` → `vinext build` |
| Test | `npm test`: 5 unit + 18 integration/rendered/UI test |
| Git root | Không có tại `D:\TMDT` |
| Git lồng | `D:\TMDT\repository\.git` |
| Remote | `origin https://github.com/xphatt/TMDT.git` |
| Git status lồng | `main...origin/main [behind 2]`; `M README.md`; untracked `.env.example`, `.gitignore`, `GITHUB_PUSH_GUIDE.md`, `docs/` |

Kiểm tra Git dùng `git -c safe.directory=D:/TMDT/repository` cho từng lệnh đọc để tránh sửa global Git config. Không fetch/pull nên trạng thái `behind 2` chỉ phản ánh remote-tracking ref hiện có.

`npm ls --depth=0` báo ba package extraneous trong `node_modules`: `@emnapi/runtime`, `react-loading-skeleton`, `tslib`. Không đề xuất gỡ riêng từng package. Nếu người dùng duyệt tái tạo `node_modules`, `npm ci` sẽ đồng bộ theo lockfile an toàn hơn.

## 3. Baseline trước dọn

| Lệnh | Kết quả | Ghi chú |
|---|---|---|
| `npm run lint` | PASS, exit 0 | Không tắt rule hoặc bỏ qua source |
| `npm run typecheck` | PASS, exit 0 | `tsc --noEmit` |
| `npm test` | PASS, 23/23 | 5 unit và 18 integration/rendered/UI; không fail/skipped |
| `npm run build` | PASS, exit 0 | Chạy riêng sau test; build đủ storefront, Admin và API |

Vinext ghi thông báo một số route chưa được static analyzer phân loại; đây là thông tin của Vinext beta, không làm build thất bại.

## 4. Phạm vi quét

- Toàn cây: **25.760 file**, **801.742.251 byte**, khoảng **764,60 MiB**.
- Source chính: `app/` có 83 file; `tests/` có 4 file; `public/` có 13 file.
- Quét SHA-256 cho 477 file sau khi loại dependency, `.git`, cache Wrangler/npm và build output.
- Phát hiện 80 nhóm trùng SHA-256, 175 file instance; phần dữ liệu lặp lý thuyết khoảng 7,92 MiB.
- Kiểm tra 42 file Markdown: **0 link local bị hỏng**.
- Build xác nhận import và route chính hợp lệ.
- Không phát hiện conflict marker `<<<<<<<`, `=======`, `>>>>>>>` trong source/tài liệu ngoài dependency/cache/build.
- Chỉ thấy `.env.example`; không thấy `.env` hoặc `.env.local` ngoài cây sinh tự động.
- Không thấy file `.db`, `.sqlite`, `.sqlite3` hoặc database dump ngoài `.wrangler/state`.

Các cây dependency/cache được tổng hợp theo thư mục thay vì liệt kê 25.760 hàng. Trước Giai đoạn 2, manifest phải ghi từng target tuyệt đối được người dùng duyệt; không dùng wildcard để xóa.

## 5. Bảng phân loại

| ID | Đường dẫn | Kích thước | Đang được dùng | Phân loại | Hành động đề xuất | Lý do | Rủi ro |
|---|---|---:|---|---|---|---|---|
| INV-001 | `app/` | 347.134 B / 83 file | Có; source, route và component được build | Giữ nguyên | Giữ nguyên | Source chính của storefront/Admin/API | Rất cao nếu thay đổi |
| INV-002 | `db/` | 10.069 B / 2 file | Có; D1/Drizzle | Giữ nguyên | Giữ nguyên | Schema và binding database | Rất cao |
| INV-003 | `drizzle/` | 38.413 B / 4 file | Có; migration local/test | Giữ nguyên | Giữ nguyên | Lịch sử migration và metadata | Rất cao |
| INV-004 | `worker/` | 2.195 B / 1 file | Có; `wrangler.jsonc` trỏ tới | Giữ nguyên | Giữ nguyên | Worker entry | Rất cao |
| INV-005 | `tests/` | 37.646 B / 4 file | Có; `npm test` | Giữ nguyên | Giữ nguyên | 23 test đang PASS | Cao |
| INV-006 | `public/` | 6.424.798 B / 13 file | Có; ảnh/font/favicon được build | Giữ nguyên/Cần xác nhận | Giữ asset thương hiệu; xem INV-007 | Asset runtime và provenance | Cao |
| INV-007 | `public/file.svg`, `public/globe.svg`, `public/window.svg` | 1.817 B / 3 file | Không thấy runtime reference; chỉ được báo cáo cũ nhắc tới | CẦN XÁC NHẬN | Có thể xóa sau duyệt | Asset generic starter không dùng; tiết kiệm rất ít | Thấp, nhưng là source asset |
| INV-008 | 4 file `public/images/*.json` | 6.765 B / 4 file | Không dùng runtime trực tiếp | Giữ nguyên | Giữ | Metadata/prompt nguồn của ảnh thương hiệu, phục vụ provenance | Thấp |
| INV-009 | `scripts/` | 6.128 B / 2 file | Có qua `db:migrate:local`, `admin:create` | Giữ nguyên | Giữ nguyên | Script vận hành an toàn | Rất cao |
| INV-010 | `.openai/hosting.json` | 34 B | Có bởi build config | Giữ nguyên | Giữ nguyên | Cấu hình starter hiện hữu | Cao |
| INV-011 | `package.json`, `package-lock.json` | 361.307 B | Có; dependency/scripts | Giữ nguyên | Giữ nguyên | Contract cài đặt có thể tái lập | Rất cao |
| INV-012 | `README.md`, `PRODUCT.md`, `DESIGN.md` | 32.254 B | Có; tài liệu chính | Giữ nguyên | Giữ nguyên | Product/design/runbook | Cao |
| INV-013 | `vite.config.ts`, `wrangler.jsonc`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `tsconfig.json`, `drizzle.config.ts`, `next-env.d.ts` | 4.871 B | Có bởi build/lint/typecheck/deploy | Giữ nguyên | Giữ nguyên | Cấu hình framework | Rất cao |
| INV-014 | `.env.example` | 182 B | Có; README/test tham chiếu | Giữ nguyên | Giữ nguyên | Chỉ tên biến, không có secret | Cao |
| INV-015 | `.gitignore` | 579 B | Có cho canonical Git tương lai | Giữ nguyên/cập nhật sau duyệt | Thêm `/tmp/` nếu DEL-A09 được duyệt | Đã ignore env, dependency, cache, output và log | Thấp |
| INV-016 | `node_modules/` | 420.038.938 B / 21.107 file | Cần để chạy local, không phải source | Có thể tái tạo | Đề xuất xóa cuối cùng nếu mục tiêu là giải phóng dung lượng hoặc đóng gói Git | `npm ci` tái tạo từ lockfile | Thấp cho dữ liệu; project tạm không chạy tới khi cài lại |
| INV-017 | `.npm-cache/` | 117.954.430 B / 941 file | Không import | Có thể tái tạo | Đề xuất xóa | npm tải lại khi cần | Thấp |
| INV-018 | `dist/` | 8.199.461 B / 159 file | Build output hiện tại | Có thể tái tạo | Đề xuất xóa | `npm run build` tái tạo | Thấp |
| INV-019 | `.next/` | 4.247 B / 1 file | Cache/type output | Có thể tái tạo | Đề xuất xóa | Dev/build tái tạo | Thấp |
| INV-020 | `.vinext/` | 147 B / 1 file | Lock/cache dev | Có thể tái tạo | Đề xuất xóa | Dev server tái tạo | Thấp |
| INV-021 | `tsconfig.tsbuildinfo` | 257.250 B | Cache incremental | Có thể tái tạo | Đề xuất xóa | `npm run typecheck` tái tạo | Thấp |
| INV-022 | `.dev-server.stderr.log`, `.dev-server.stdout.log` | 636 B / 2 file | Không | Có thể tái tạo | Đề xuất xóa | Runtime log cũ, đã ignore | Thấp |
| INV-023 | `docs/__pycache__/` | 3.111 B / 1 file | Không | Có thể tái tạo | Đề xuất xóa | Python bytecode, đã ignore | Thấp |
| INV-024 | `tmp/` | 0 B / 0 file | Không | Có thể tái tạo | Đề xuất xóa thư mục rỗng | Không chứa dữ liệu | Thấp |
| INV-025 | `app/_sites-preview/` | 0 B / 0 file | Không thấy import | CẦN XÁC NHẬN | Có thể xóa nếu không còn preview Sites | Thư mục rỗng nhưng thuộc convention công cụ | Thấp |
| INV-026 | `.wrangler/state/` | 364.704 B / 7 file | Có; chứa D1 local/order/admin/test state | Giữ nguyên tuyệt đối | Không xóa | Dữ liệu local không thể coi là cache vô hại | Rất cao |
| INV-027 | 8 thư mục `.wrangler/qa-*-profile*` được liệt kê tại DEL-A10 | 165.341.266 B / 2.930 file | Không dùng runtime/docs | Có thể tái tạo, có browser state | Đề xuất xóa đúng từng path sau duyệt | Profile Chromium/Edge của QA cũ | Trung bình |
| INV-028 | 10 file `.wrangler/qa-*.html`, `.wrangler/qa-*.log` tại DEL-A11 | 193.629 B / 10 file | Không thấy reference | Có thể tái tạo | Đề xuất xóa đúng từng file | Output QA cũ | Thấp |
| INV-029 | Phần còn lại của `.wrangler/` | khoảng 39.861 B ngoài state/profile/output | Có thể được Wrangler dùng | Giữ nguyên | Không dọn trong lượt này | Tiết kiệm không đáng kể, dễ xóa nhầm metadata | Trung bình |
| INV-030 | `.impeccable/` | 7.472.584 B / 16 file | Có; script báo cáo và docs tham chiếu ảnh review | Giữ nguyên | Giữ nguyên | Mock, surface brief, design sidecar và bằng chứng review | Cao |
| INV-031 | `deliverables/github-ready/` | 14.221.370 B / 135 file | Không import runtime; là gói bàn giao đã được yêu cầu trước đây | CẦN XÁC NHẬN | Giữ, đưa ra kho artifact, hoặc tái sinh từ source mới | Chứa hai bản source tách và hai ZIP; hiện đã cũ so với root | Cao |
| INV-032 | Hai ZIP trong `deliverables/github-ready/releases/` | 6.660.268 B | Có thể là file bàn giao | CẦN XÁC NHẬN | Không xóa khi chưa xác nhận đã bàn giao/backup | ZIP được yêu cầu trong tác vụ trước | Cao |
| INV-033 | `repository/.git/` | khoảng 6,26 MiB | Có; lịch sử Git duy nhất | Giữ nguyên tuyệt đối | Không di chuyển/xóa | Remote chính thức và toàn bộ lịch sử | Tối quan trọng |
| INV-034 | `repository/README.md` | 4.663 B | Git báo modified | File chưa commit | Giữ nguyên | Không ghi đè | Cao |
| INV-035 | `repository/.env.example`, `.gitignore`, `GITHUB_PUSH_GUIDE.md`, `docs/` | khoảng 32,5 KiB / 9 file | Git báo untracked | File chưa commit | Giữ nguyên | Người dùng/nhóm có thể đang chuẩn bị commit | Cao |
| INV-036 | `docs/` | 53.782.519 B / 184 file | Có; README/script/report liên kết | Giữ nguyên/Cần xác nhận | Chỉ sắp xếp sau duyệt | Tài liệu, bằng chứng và deliverable học thuật | Cao |
| INV-037 | `docs/audit/`, `docs/qa/`, `docs/completion/`, `docs/demo/`, `docs/deployment/`, `docs/presentation/`, `docs/maintenance/` | Tài liệu hiện hành | Có; 0 link local hỏng | Giữ nguyên | Giữ | Truy vết chất lượng, demo và triển khai | Trung bình |
| INV-038 | `docs/report-assets/rendered-pages/` | 10.169.622 B / 52 file | Không thấy link hiện hành; có bản v8 | CẦN XÁC NHẬN | Cách ly trước, chỉ xóa sau xác nhận lần hai | Bộ render báo cáo cũ | Trung bình |
| INV-039 | `docs/report-assets/qa-contact/` | 9.727.508 B / 6 file | Không thấy link hiện hành; có bản v8 | CẦN XÁC NHẬN | Cách ly trước, chỉ xóa sau xác nhận lần hai | Ảnh QA báo cáo cũ | Trung bình |
| INV-040 | `preview.pdf`, `preview-v2.pdf` đến `preview-v7.pdf` | 9.486.625 B / 7 file | Script hiện trỏ v8; fact-check nhắc final | CẦN XÁC NHẬN | Cách ly trước, giữ v8/final | Lịch sử biên tập có thể cần cho bài nộp | Trung bình |
| INV-041 | `preview-v8.pdf`, `preview-final.pdf`, `rendered-pages-v8/`, `qa-contact-v8/` | khoảng 21,22 MiB | Có; script/fact-check tham chiếu | Giữ nguyên | Giữ | Bản báo cáo/bằng chứng hiện hành | Cao |
| INV-042 | `docs/Bao_Cao_Tieu_Luan_TMDT.docx`, `.md`, diagram, fact-check | Deliverable học thuật | Có | Giữ nguyên | Giữ | File cần nộp, không được tự xóa | Cao |
| INV-043 | Ba Python script trong `docs/` | 35.064 B | Có; tạo/render/scrub báo cáo | Giữ nguyên hoặc di chuyển sau duyệt | Đề xuất `scripts/reporting/` nếu nhóm muốn chuẩn hóa | Phải cập nhật mọi path và lệnh | Trung bình |
| INV-044 | `examples/d1/` | 2.137 B / 2 file | Không được runtime import | CẦN XÁC NHẬN | Giữ hoặc chuyển `docs/examples/d1/` | Ví dụ starter có thể phục vụ đào tạo | Trung bình |
| INV-045 | `docs/audit/evidence/*.log` | Bằng chứng audit nhỏ | Có ý nghĩa truy vết | Giữ nguyên | Không xóa chỉ vì đuôi `.log` | Là báo cáo cần nộp, khác runtime log | Trung bình |

## 6. File trùng SHA-256

| Cụm | Bản trùng chính xác | Bản đề xuất giữ | Kết luận |
|---|---|---|---|
| DUP-01 | 4 PNG sản phẩm/social trong root và `deliverables/github-ready/storefront-web/public/images/` | Root `public/images/`; giữ bản export nếu còn cần package độc lập | Trùng có chủ đích, không tự xóa |
| DUP-02 | `package-lock.json` root và storefront export | Mỗi package giữ lockfile của nó | Không xóa lockfile |
| DUP-03 | Font, favicon, DESIGN/PRODUCT/config/migration lặp trong root và hai package export | Root là canonical runtime; export cần file riêng nếu còn phát hành độc lập | CẦN XÁC NHẬN package export |
| DUP-04 | Nhiều module storefront/Admin root trùng snapshot export | Root `app/` | Export là snapshot bàn giao, không phải module runtime trùng nhiệm vụ |
| DUP-05 | `.impeccable/review/{tablet-1024,tablet-768,desktop,mobile}.png` trùng 4 ảnh trong `docs/report-assets/` | Giữ cả hai hiện tại | Script/tài liệu dùng hai vai trò khác nhau |
| DUP-06 | Sáu trang render 001, 002, 014, 015, 017, 019 giống giữa bộ cũ và v8 | Giữ trọn bộ v8 | Không xóa từng ảnh rời làm bộ cũ thiếu trang; xử lý theo cả bộ sau duyệt |
| DUP-07 | `source-hashes-before.csv` và `source-hashes-after.csv` giống nhau | Giữ cả hai | Sự giống nhau là bằng chứng audit source không đổi |

Trùng tên `route.ts`, `page.tsx`, `layout.tsx`, `index.ts` là convention App Router/module, không phải file rác. Không có đề xuất xóa theo tên đơn thuần.

### Độ mới của package bàn giao

- Root `app/`: 83 file.
- `storefront-web/app`: 24 file; thiếu 59 path so với root và 11 path cùng tên đã khác nội dung. Một phần thiếu là Admin có chủ đích, nhưng feedback, health, review, policy, promotion và catalogue service mới cũng chưa có.
- Root `app/admin`: 18 file.
- `admin-web/app/admin`: 12 file; thiếu 6 path và 6 path khác nội dung.

Vì vậy không nên push hai ZIP cũ như bản mới nhất. Nếu giữ deliverable, khuyến nghị tái sinh sau khi chọn kiến trúc tách package; không sao chép đè tự động trong lượt dọn.

## 7. Danh sách đề xuất xóa — chỉ sau xác nhận

| ID duyệt | Target chính chính xác | Dung lượng | Cách tái tạo/khôi phục |
|---|---|---:|---|
| DEL-A01 | `D:\TMDT\node_modules` | 420.038.938 B | `npm ci` |
| DEL-A02 | `D:\TMDT\.npm-cache` | 117.954.430 B | npm tải cache lại khi cài |
| DEL-A03 | `D:\TMDT\dist` | 8.199.461 B | `npm run build` |
| DEL-A04 | `D:\TMDT\.next` | 4.247 B | `npm run dev` hoặc build |
| DEL-A05 | `D:\TMDT\.vinext` | 147 B | `npm run dev` |
| DEL-A06 | `D:\TMDT\tsconfig.tsbuildinfo` | 257.250 B | `npm run typecheck` |
| DEL-A07 | `D:\TMDT\.dev-server.stderr.log` và `.dev-server.stdout.log` | 636 B | Log tự sinh nếu redirect output |
| DEL-A08 | `D:\TMDT\docs\__pycache__` | 3.111 B | Python tự sinh bytecode |
| DEL-A09 | `D:\TMDT\tmp` | 0 B | Tạo lại khi cần; hiện rỗng |
| DEL-A10 | `D:\TMDT\.wrangler\qa-chrome-profile`; `qa-chrome-profile-1366`; `qa-chrome-profile-1920`; `qa-chrome-profile-escalated`; `qa-edge-profile`; `qa-edge-profile-1366`; `qa-edge-profile-1920`; `qa-edge-profile-escalated` | 165.341.266 B | QA browser tạo profile mới; không đụng `.wrangler/state` |
| DEL-A11 | 10 file `.wrangler/qa-chrome-1366-escalated.log`, `qa-chrome-1366.html`, `qa-chrome-1366.log`, `qa-chrome-1920.html`, `qa-chrome-1920.log`, `qa-edge-1366-escalated.log`, `qa-edge-1366.html`, `qa-edge-1366.log`, `qa-edge-1920.html`, `qa-edge-1920.log` | 193.629 B | Output QA có thể tái tạo |

Tổng DEL-A01 đến DEL-A11: **711.993.115 B ≈ 679,01 MiB**. Nếu giữ `node_modules` để tiếp tục development ngay, phần còn lại giải phóng khoảng **278,43 MiB**.

## 8. Đề xuất di chuyển/sắp xếp — cần duyệt riêng

| ID duyệt | Hiện tại | Vị trí đề xuất | Lý do | Rủi ro/việc phải cập nhật |
|---|---|---|---|---|
| MOVE-B01 | `docs/ADMIN_GUIDE.md`, `ADMIN_IMPLEMENTATION_PLAN.md`, `API_ADMIN.md`, `DATABASE_SCHEMA.md` | `docs/admin/` | Gom tài liệu vận hành Admin | Cập nhật README và link chéo |
| MOVE-B02 | `docs/DOMAIN_SETUP.md`, `PRODUCTION_DOMAIN_MIGRATION.md`, `URL_AUDIT.md` | `docs/deployment/` | Gom tài liệu triển khai/domain | Kiểm tra link Markdown sau move |
| MOVE-B03 | `docs/PAYMENT_PROVIDERS.md` | `docs/architecture/PAYMENT_PROVIDERS.md` | Đặt seam payment cạnh kiến trúc | Cập nhật README và tài liệu API |
| MOVE-B04 | `docs/Bao_Cao_Tieu_Luan_TMDT.*`, `REPORT_FACT_CHECK.md`, `report-assets/` | `docs/report/` | Gom báo cáo học thuật và asset | Rủi ro cao: cập nhật hàng trăm image path và ba Python script |
| MOVE-B05 | `docs/build_academic_report.py`, `render_report_preview.py`, `scrub_report_metadata.py` | `scripts/reporting/` | Script hỗ trợ không nên nằm cạnh tài liệu | Cập nhật hằng path và hướng dẫn chạy |
| MOVE-B06 | `examples/d1/` | `docs/examples/d1/` | Nếu chỉ dùng làm tài liệu starter | Không làm nếu framework/tool còn đọc `examples/` |

Không đề xuất di chuyển `app/`, `db/`, `drizzle/`, `public/`, `tests/`, `worker/`, migration, route hay API. Việc gom docs chỉ nên làm sau khi cây Git canonical được chốt để rename được Git ghi nhận và review.

## 9. File cần quyết định hoặc cách ly

| ID duyệt | Nội dung | Khuyến nghị |
|---|---|---|
| CONF-C01 | Chọn Git canonical: root hay `repository/` | Khuyến nghị bảo toàn `repository/.git`, fetch/pull theo phê duyệt, sau đó lập kế hoạch đưa source root vào worktree bằng copy có manifest; không chuyển `.git` thủ công |
| CONF-C02 | `deliverables/github-ready` giữ source unpacked, ZIP hay cả hai | Hiện gói đã cũ; giữ nguyên cho tới khi người dùng chọn tái sinh hoặc lưu artifact ngoài repo |
| CONF-C03 | Bộ report cũ `rendered-pages/`, `qa-contact/`, preview trước v8 | Khuyến nghị chuyển vào `docs/maintenance/quarantine/report-history/` nếu được duyệt; chỉ xóa vĩnh viễn sau xác nhận lần hai. Dung lượng 28,02 MiB |
| CONF-C04 | Ba SVG starter không dùng | Có thể xóa sau duyệt; không ảnh hưởng ảnh sản phẩm |
| CONF-C05 | `app/_sites-preview/` rỗng | Có thể xóa nếu xác nhận không dùng Sites preview |
| CONF-C06 | `examples/d1/` | Giữ nếu dùng đào tạo; chuyển theo MOVE-B06 nếu chỉ là tài liệu |
| CONF-C07 | Có xóa `node_modules` ngay không | Giữ nếu tiếp tục code; xóa nếu đóng gói/push và chạy `npm ci` khi cần |
| CONF-C08 | Có thực hiện MOVE-B01 đến MOVE-B05 không | Khuyến nghị tạm hoãn tới khi CONF-C01 được quyết định |

## 10. Cây hiện tại

```text
D:\TMDT
├── .impeccable/
├── .next/
├── .npm-cache/
├── .openai/
├── .vinext/
├── .wrangler/
│   ├── state/
│   ├── qa-chrome-profile*/
│   ├── qa-edge-profile*/
│   └── QA HTML/log
├── app/
├── db/
├── deliverables/github-ready/
├── dist/
├── docs/
│   ├── audit/
│   ├── completion/
│   ├── demo/
│   ├── deployment/
│   ├── maintenance/
│   ├── presentation/
│   ├── qa/
│   └── report-assets/
├── drizzle/
├── examples/d1/
├── node_modules/
├── public/
├── repository/
│   ├── .git/
│   ├── docs/
│   └── README/config/guide chưa commit đầy đủ
├── scripts/
├── tests/
├── tmp/
├── worker/
├── .env.example
├── .gitignore
├── DESIGN.md
├── PRODUCT.md
├── README.md
├── package.json
├── package-lock.json
└── framework/database configs
```

## 11. Cây dự kiến sau dọn

Cây này chỉ áp dụng cho các DEL/MOVE được duyệt. `repository/` và `deliverables/` vẫn giữ nguyên cho tới khi CONF-C01/C02 được quyết định.

```text
D:\TMDT
├── .impeccable/
├── .openai/
├── .wrangler/
│   ├── state/
│   ├── deploy/
│   ├── local-runtime/
│   ├── registry/
│   └── xdg/
├── app/
├── db/
├── deliverables/
├── docs/
│   ├── admin/
│   ├── architecture/
│   ├── audit/
│   ├── completion/
│   ├── demo/
│   ├── deployment/
│   ├── maintenance/
│   ├── presentation/
│   ├── qa/
│   └── report/
├── drizzle/
├── examples/
├── public/
├── repository/
├── scripts/
│   └── reporting/
├── tests/
├── worker/
├── .env.example
├── .gitignore
├── DESIGN.md
├── PRODUCT.md
├── README.md
├── package.json
├── package-lock.json
└── framework/database configs
```

`node_modules`, `dist`, `.next`, `.vinext`, npm cache, TypeScript build cache và QA browser profile không xuất hiện trong cây dự kiến vì có thể tái tạo. Nếu DEL-A01 được duyệt, chạy `npm ci` trước lần development tiếp theo.

## 12. Kiểm tra tham chiếu trước đề xuất

- Production build đã resolve 404 client modules, 138 server modules, 402 RSC modules, 179 client modules và 144 SSR modules.
- 42 file Markdown được kiểm tra đường dẫn tương đối: không có link local hỏng.
- Runtime không import `deliverables/`, `repository/`, `examples/d1/` hoặc `docs/`.
- `docs/render_report_preview.py` dùng bản preview/render v8.
- `docs/build_academic_report.py` đọc ảnh `.impeccable/review/` và ghi vào `docs/report-assets/`.
- README tham chiếu script `create-admin.ts`, `migrate-local.ts` và tài liệu trong `docs/`.
- Asset PNG/font/favicon đang xuất hiện trong production build.
- Bốn JSON ảnh không dùng runtime nhưng được giữ làm metadata nguồn.

## 13. Quy trình Giai đoạn 2 sau duyệt

1. Đọc lại Git status và xác minh từng target tuyệt đối vẫn nằm trong `D:\TMDT`.
2. Tạo `docs/maintenance/CLEANUP_MANIFEST.md` trước thao tác, gồm path cũ, byte, SHA-256, hành động, path mới, lý do và khả năng khôi phục.
3. Chỉ xử lý ID được người dùng ghi rõ.
4. Không chạm `.git`, `.wrangler/state`, source, DB, migration, test, asset thương hiệu hoặc file chưa commit.
5. Với CONF-C03, chỉ chuyển sang cách ly; không xóa vĩnh viễn trong cùng lượt.
6. Với move docs, cập nhật mọi link Markdown/Python/README rồi chạy lại bộ kiểm tra link.
7. Chạy lint, type-check, 23 test, production build và kiểm tra route/asset.
8. Nếu xuất hiện lỗi mới, dừng và khôi phục từ manifest/cách ly.
9. Cập nhật manifest với kết quả và hướng dẫn khôi phục.
10. Không commit, push, deploy hoặc thay đổi remote.

## 14. Cổng xác nhận bắt buộc

**DỪNG TẠI ĐÂY. CHƯA ĐƯỢC THỰC HIỆN GIAI ĐOẠN 2.**

Mẫu xác nhận an toàn:

```text
Tôi duyệt DEL-A02 đến DEL-A11; giữ DEL-A01 node_modules.
Tạm hoãn MOVE-B01 đến MOVE-B06.
CONF-C01: chọn repository/ làm Git canonical, chưa cho phép copy source.
CONF-C02: giữ deliverables và ZIP hiện tại.
CONF-C03: cách ly report cũ, chưa xóa vĩnh viễn.
```

Nếu người dùng chỉ trả lời “đồng ý”, không được suy diễn quyền thay đổi Git, deliverable, báo cáo hoặc local database. Giai đoạn 2 chỉ bắt đầu khi danh sách ID được phê duyệt rõ ràng.
