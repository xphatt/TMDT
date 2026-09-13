# Kết quả dọn dẹp repository — Trà Sữa Ngon

Ngày hoàn tất: 13/09/2026  
Phạm vi: `D:\TMDT`  
Quyết định được áp dụng: xóa `DEL-A02`–`DEL-A11`, giữ `DEL-A01`, hoãn `MOVE-B01`–`MOVE-B06`, giữ `repository/.git` và `deliverables`, chỉ cách ly report cũ.

## 1. Kết luận

Đợt dọn dẹp đã hoàn tất đúng danh sách được duyệt. Source sản phẩm, dữ liệu D1 local, dependency đã cài, Git history và gói bàn giao đều còn nguyên. Không commit, push, deploy, đổi dependency, đổi schema hoặc thay đổi hợp đồng API.

Kết quả định lượng:

- Trước dọn dẹp: 25.760 file, 801.742.251 byte.
- Sau dọn dẹp (đã tính cả ba tài liệu bảo trì): 21.717 file, 509.834.041 byte.
- Dung lượng giảm thực tế: 291.908.210 byte (278,39 MiB).
- Report cũ đã cách ly: 9 target, khoảng 28,02 MiB; chưa xóa vĩnh viễn.

## 2. Mục đã xóa

| Nhóm | Target | Lý do | Khôi phục |
|---|---|---|---|
| Cache npm | `.npm-cache/` | Cache tải dependency, không phải source | npm tự tải lại khi cài dependency |
| Build/cache framework | `dist/`, `.next/`, `.vinext/`, `tsconfig.tsbuildinfo` | Output có thể tái tạo | Chạy lại typecheck/build/dev tương ứng |
| Log dev | `.dev-server.stderr.log`, `.dev-server.stdout.log` | Log runtime cũ | Tự sinh khi redirect output |
| Cache tài liệu | `docs/__pycache__/` | Python bytecode | Python tự sinh lại |
| Thư mục tạm | `tmp/` | Rỗng tại thời điểm kiểm kê | Tạo lại khi cần; đã thêm `/tmp/` vào `.gitignore` |
| Profile QA | 8 thư mục `qa-*-profile*` đã liệt kê trong manifest | Browser profile dùng một lần | Công cụ QA tạo profile mới |
| Output QA | 10 file `qa-*.html`/`qa-*.log` đã liệt kê trong manifest | Kết quả chạy cũ, có thể tái tạo | Chạy lại kiểm thử QA |

Tổng cộng có 27 target chi tiết bị xóa. Danh sách đường dẫn, kích thước và SHA-256 trước thao tác nằm trong `CLEANUP_MANIFEST.md`.

## 3. Mục đã chuyển vào cách ly

Tất cả target dưới đây được chuyển từ `docs/report-assets/` sang `docs/maintenance/quarantine/report-history/`:

| Target | Trạng thái |
|---|---|
| `rendered-pages/` | Đã cách ly; bản `rendered-pages-v8/` mới hơn vẫn giữ tại vị trí chính |
| `qa-contact/` | Đã cách ly; bản `qa-contact-v8/` mới hơn vẫn giữ tại vị trí chính |
| `Bao_Cao_Tieu_Luan_TMDT-preview.pdf` | Đã cách ly |
| `Bao_Cao_Tieu_Luan_TMDT-preview-v2.pdf` đến `preview-v7.pdf` | Đã cách ly |

Hash sau khi chuyển khớp 9/9 target với manifest. Không có target cách ly nào bị xóa vĩnh viễn.

## 4. Xử lý file trùng

Audit phát hiện 80 nhóm nội dung trùng trong phạm vi quét, gồm 175 bản thể và khoảng 7,92 MiB dung lượng lý thuyết. Không xóa bản trùng trong source hoặc `deliverables/` vì chưa có phê duyệt xác định cây canonical. Chỉ các phiên bản report cũ đã được duyệt mới được đưa vào cách ly.

Hai gói trong `deliverables/` vẫn khác source gốc hiện tại:

- Storefront export thiếu 59 file so với `app/` gốc và có 11 file khác nội dung.
- Admin export thiếu 6 file và có 6 file khác nội dung.

Vì vậy, hai gói này được giữ nguyên để tránh ghi đè hoặc mất dữ liệu bàn giao.

## 5. Mục được giữ lại

| Target | Lý do giữ |
|---|---|
| `node_modules/` | Người dùng duyệt giữ `DEL-A01`; không cài lại dependency |
| `.wrangler/state/` | Chứa trạng thái D1 local; tránh mất dữ liệu phát triển |
| `repository/.git/` và toàn bộ `repository/` | Bảo toàn Git history và thay đổi chưa commit |
| `deliverables/` | Gói bàn giao được yêu cầu giữ nguyên |
| `app/`, `db/`, `drizzle/`, `public/`, `scripts/`, `tests/`, `worker/` | Source, asset, migration, test và runtime chính |
| `.openai/`, `.impeccable/` | Cấu hình/công cụ của dự án, không thuộc danh sách xóa |
| `public/*.svg`, `app/_sites-preview/` | Chưa có phê duyệt xử lý; giữ nguyên an toàn |

## 6. Cấu trúc sau dọn dẹp

```text
D:\TMDT\
├── .impeccable/
├── .openai/
├── .wrangler/                 # giữ state D1; đã bỏ profile/output QA cũ
├── app/
├── db/
├── deliverables/
├── docs/
│   ├── maintenance/
│   │   ├── CLEANUP_PLAN.md
│   │   ├── CLEANUP_MANIFEST.md
│   │   ├── CLEANUP_RESULT.md
│   │   └── quarantine/report-history/
│   └── report-assets/         # giữ bản v8/final và bằng chứng đang dùng
├── drizzle/
├── examples/
├── node_modules/
├── public/
├── repository/                # Git worktree lồng, không sửa
├── scripts/
├── tests/
├── worker/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── các file cấu hình build/runtime
```

Không tạo thư mục module rỗng. Các đề xuất di chuyển `MOVE-B01`–`MOVE-B06` được hoãn nguyên trạng.

## 7. Kết quả kiểm tra

| Kiểm tra | Baseline trước dọn | Sau dọn | Kết quả |
|---|---|---|---|
| Lint | `npm run lint` đạt | `npm run lint` đạt | PASS |
| TypeScript | `npm run typecheck` đạt | `npm run typecheck` đạt | PASS |
| Unit/integration/UI | 23/23 test đạt | 23/23 test đạt | PASS |
| Production build | `npm run build` đạt | `npm run build` đạt | PASS |
| Liên kết Markdown nội bộ | 0 link hỏng | 0 link hỏng | PASS |
| Conflict marker | Không phát hiện | Không phát hiện | PASS |
| Hash target cách ly | N/A | Khớp 9/9 | PASS |
| Import/path | Không có lỗi build | Không có lỗi build | PASS |

Build và test sau dọn dẹp đã tái tạo `dist/`, `.next/` và `tsconfig.tsbuildinfo`. Ba output này được xóa lại theo đúng phê duyệt sau khi kiểm tra thành công; do đó cây bàn giao cuối không chứa build output.

## 8. Trạng thái Git cuối

`D:\TMDT` không phải Git worktree. Git worktree duy nhất được phát hiện là `D:\TMDT\repository`, nhánh `main`, đang báo `behind 2` so với `origin/main` và giữ nguyên các thay đổi đã có trước đợt dọn:

```text
## main...origin/main [behind 2]
 M README.md
?? .env.example
?? .gitignore
?? GITHUB_PUSH_GUIDE.md
?? docs/
```

Không file nào trong `repository/` bị ghi đè, di chuyển hoặc xóa. Không tạo commit và không push.

## 9. Điểm còn cần nhóm xác nhận

1. Chọn cây canonical: source gốc `D:\TMDT` hay Git worktree lồng `D:\TMDT\repository`.
2. Quyết định có đồng bộ lại hai gói `deliverables/` với source hiện tại hay giữ như snapshot lịch sử.
3. Xác minh ba dependency npm đang được báo `extraneous`: `@emnapi/runtime`, `react-loading-skeleton`, `tslib`. Chưa gỡ vì thay đổi dependency không thuộc phạm vi duyệt.
4. Quyết định tương lai cho SVG generic trong `public/` và `app/_sites-preview/`; hiện vẫn giữ nguyên.
5. Chỉ xóa vĩnh viễn quarantine sau khi nhóm xác nhận bản v8/final đã đủ làm bằng chứng lưu trữ.

## 10. Khôi phục

- Report cũ: chuyển từng target từ `docs/maintenance/quarantine/report-history/` về đúng tên trong `docs/report-assets/`, sau đó đối chiếu SHA-256 trong `CLEANUP_MANIFEST.md`.
- Build/cache: chạy `npm run typecheck`, `npm run build` hoặc `npm run dev` để tái tạo.
- Cache npm: npm sẽ tải lại khi chạy quy trình cài dependency; `node_modules/` hiện vẫn còn nguyên nên không cần cài lại chỉ vì đợt dọn này.

Không có phương án khôi phục trực tiếp cho log/profile QA đã xóa; đây là output tái tạo được và đã được định danh bằng hash trước thao tác trong manifest.
