# Manifest dọn dẹp — Trà Sữa Ngon

Ngày thực hiện: 13/09/2026  
Phê duyệt: `DEL-A02` đến `DEL-A11`; giữ `DEL-A01 node_modules`; tạm hoãn `MOVE-B01` đến `MOVE-B06`; giữ `repository/.git` và `deliverables`; chỉ cách ly report cũ, không xóa vĩnh viễn.

## Quy ước hash

- File: SHA-256 trực tiếp trên nội dung file trước thao tác.
- Thư mục: tree SHA-256 của danh sách file sắp theo đường dẫn tương đối, mỗi dòng có dạng `relative-path|byte-size|file-sha256`.
- Thư mục rỗng dùng SHA-256 của chuỗi rỗng.

## Target xóa đã duyệt

| ID | Đường dẫn cũ | Kích thước | SHA-256 trước thao tác | Hành động | Đường dẫn mới | Lý do | Khả năng khôi phục | Trạng thái |
|---|---|---:|---|---|---|---|---|---|
| DEL-A02 | `D:\TMDT\.npm-cache` | 117.954.430 B / 941 file | `7063CFEA40E8F47EBB0B8127243CF396C4AE3A3D5A556AE642CF1EFF5602513C` | Xóa cache | Không có | Cache npm | npm tải lại khi cài dependency | Đã hoàn tất |
| DEL-A03 | `D:\TMDT\dist` | 8.199.461 B / 159 file | `2502F22D40129A85CEB41A8071D21953F8019CF996EB0033A716AEB18D15882C` | Xóa build output | Không có | Có thể tái tạo | `npm run build` | Đã hoàn tất |
| DEL-A04 | `D:\TMDT\.next` | 4.247 B / 1 file | `57047BAAD32E0779F2BCABA42396496E90E04F0F6687C2D6DAF978D270582182` | Xóa cache | Không có | Output framework | Dev/build tái tạo | Đã hoàn tất |
| DEL-A05 | `D:\TMDT\.vinext` | 147 B / 1 file | `BCAA82426E6DBB28BF4A05C8C21B18DB027457EDA22F20D6230DD112B1ED989A` | Xóa cache | Không có | Dev lock/cache | `npm run dev` tái tạo | Đã hoàn tất |
| DEL-A06 | `D:\TMDT\tsconfig.tsbuildinfo` | 257.250 B | `097F13C1CE21D213566F1070B9673FDB967BC570223A859180994B4103BAA494` | Xóa cache | Không có | TypeScript incremental cache | `npm run typecheck` tái tạo | Đã hoàn tất |
| DEL-A07a | `D:\TMDT\.dev-server.stderr.log` | 204 B | `2CF9CA32F3F3A03CC01F8BCEC366A4A401174A85FC063B81E9D8FAAAE09F5CAC` | Xóa log | Không có | Runtime log cũ | Tự sinh khi redirect stderr | Đã hoàn tất |
| DEL-A07b | `D:\TMDT\.dev-server.stdout.log` | 432 B | `16016BC22CE7AFD94A6D3635079BE21AC428683A571B40B0B2FC9782F0EE7E75` | Xóa log | Không có | Runtime log cũ | Tự sinh khi redirect stdout | Đã hoàn tất |
| DEL-A08 | `D:\TMDT\docs\__pycache__` | 3.111 B / 1 file | `656BA23130BC8AAFFDE56E9BC94014D93AF6F4286289CB1E1780E1C60E7E60C6` | Xóa cache | Không có | Python bytecode | Python tự sinh lại | Đã hoàn tất |
| DEL-A09 | `D:\TMDT\tmp` | 0 B / 0 file | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | Xóa thư mục rỗng | Không có | Không chứa dữ liệu | Tạo lại khi cần | Đã hoàn tất |
| DEL-A10a | `D:\TMDT\.wrangler\qa-chrome-profile` | 6.724.292 B / 145 file | `16C665AA387D38818002D75C7E8955001B574A124F5EE2B9DAD13FA86D53F832` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10b | `D:\TMDT\.wrangler\qa-chrome-profile-1366` | 6.691.310 B / 147 file | `4C45B90EC4D42BD96B1AFCD5077C912CC88064C1BC6F5ED7C88067B5CE17BB43` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10c | `D:\TMDT\.wrangler\qa-chrome-profile-1920` | 31.498.180 B / 569 file | `6F28B211E9E7E37BA24D69F576E4742AA404BD862542FAE5CBCA280D06963E38` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10d | `D:\TMDT\.wrangler\qa-chrome-profile-escalated` | 31.741.536 B / 616 file | `DA0EF3326FF529352A91804C7F272C456532899F7DD9FAC8D55CD0C483900765` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10e | `D:\TMDT\.wrangler\qa-edge-profile` | 16.301.241 B / 190 file | `831FB4865A23D05893021FB17359473B63E6C2DCFF97F44CC048E60EC095C9F2` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10f | `D:\TMDT\.wrangler\qa-edge-profile-1366` | 16.323.981 B / 190 file | `A1AF46486FE4075EB3C0D351438D8F1C226918A10322F366A3139404BCD24A6D` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10g | `D:\TMDT\.wrangler\qa-edge-profile-1920` | 33.616.512 B / 652 file | `ED62E3FC77922C9F89726360DD949B3876921FE6FAACEFA044FFB4624CD820A8` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A10h | `D:\TMDT\.wrangler\qa-edge-profile-escalated` | 22.444.214 B / 421 file | `21C41FA59D2810C9ED68B4F163E6259E8DE51DACDB269AE340DE3DC9C9336CD8` | Xóa QA profile | Không có | Profile trình duyệt cũ | QA tạo profile mới | Đã hoàn tất |
| DEL-A11a | `D:\TMDT\.wrangler\qa-chrome-1366-escalated.log` | 228 B | `3C2AF637D9351E308B11DDA4489D8391014E07509B7A53BA7BB549AE008B44B8` | Xóa output QA | Không có | Log cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11b | `D:\TMDT\.wrangler\qa-chrome-1366.html` | 46.534 B | `F237B95FCC929712122B2ECBFA500341F75E633F08FA5D686C70062E63BFB45A` | Xóa output QA | Không có | HTML cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11c | `D:\TMDT\.wrangler\qa-chrome-1366.log` | 2.825 B | `84403B862A525DC7542436DD74D4D0726F89ECA3F1ED9014F3AB95AF05A37358` | Xóa output QA | Không có | Log cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11d | `D:\TMDT\.wrangler\qa-chrome-1920.html` | 46.538 B | `DD81B6BACE730D3362C80EE8AADFF3CF4FE0E30AFDB180BA9E77D6AB7ADD5FF1` | Xóa output QA | Không có | HTML cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11e | `D:\TMDT\.wrangler\qa-chrome-1920.log` | 0 B | `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855` | Xóa output QA | Không có | Log rỗng | QA tái tạo | Đã hoàn tất |
| DEL-A11f | `D:\TMDT\.wrangler\qa-edge-1366-escalated.log` | 337 B | `F84E76C9B9DFBF7A39415850334B6140BEF6432C96CAA051F6B5EF3A4302B96F` | Xóa output QA | Không có | Log cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11g | `D:\TMDT\.wrangler\qa-edge-1366.html` | 46.550 B | `CEDBEAC87D858040C23EA1D69684F7BC5006606E758B9C8DDA14751B39F87743` | Xóa output QA | Không có | HTML cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11h | `D:\TMDT\.wrangler\qa-edge-1366.log` | 3.417 B | `241AB9593B2756489442246A27033484A21F1FFC998C6DB5F116A52438B6AA7A` | Xóa output QA | Không có | Log cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11i | `D:\TMDT\.wrangler\qa-edge-1920.html` | 46.526 B | `6E22C57DABAB3023E7CBEC02E11F5444F7B4ADD10018F0B262DD0C4F22DA4373` | Xóa output QA | Không có | HTML cũ | QA tái tạo | Đã hoàn tất |
| DEL-A11j | `D:\TMDT\.wrangler\qa-edge-1920.log` | 674 B | `E430FFACA383DA98B589D0D57EC055DA53F1E9444BC518743AD2FF434611BF80` | Xóa output QA | Không có | Log cũ | QA tái tạo | Đã hoàn tất |

## Target cách ly đã duyệt

| ID | Đường dẫn cũ | Kích thước | SHA-256 trước thao tác | Hành động | Đường dẫn mới | Lý do | Khả năng khôi phục | Trạng thái |
|---|---|---:|---|---|---|---|---|---|
| Q-C03a | `docs/report-assets/rendered-pages` | 10.169.622 B / 52 file | `EAFDC92D6818787AF6AA47E1B6190CC74CB7E92F106C15CA83114B26C6D0AAE5` | Di chuyển | `docs/maintenance/quarantine/report-history/rendered-pages` | Bộ render cũ; giữ nguyên v8 | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03b | `docs/report-assets/qa-contact` | 9.727.508 B / 6 file | `113315E99CF29FDC13C4561D9AE2FB52D86EC5ACB296144E63D004DD423A8C90` | Di chuyển | `docs/maintenance/quarantine/report-history/qa-contact` | Bộ ảnh QA cũ; giữ nguyên v8 | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03c | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview.pdf` | 1.390.496 B | `81976CFF346CEBB20E662C83A175452701F4C4F3AF574F6F3CEAE632FE849E97` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03d | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v2.pdf` | 1.390.526 B | `F7B9F8A06B135F46D671B7317443630645F220360324CED1E1B3D0F858159CB7` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v2.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03e | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v3.pdf` | 1.390.432 B | `D4DF371C31BCCCE12F6DDC6F7D21D9C5CFE664FFE4CF120DBF7A617242FD6421` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v3.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03f | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v4.pdf` | 1.353.743 B | `15A0213C1D0C52C590574B0A84A7F667802CC039C6AFFAA915DC407FBEF11D68` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v4.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03g | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v5.pdf` | 1.327.927 B | `4735B33AE79F915C6D33129414C0530AE9445870D260EF0C3F9A8ACC52410CA2` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v5.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03h | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v6.pdf` | 1.317.735 B | `2A587795DF45726427573C34B1217119FC4E3DFD3B36AFCFE0D3D34BD0EB9A7B` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v6.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |
| Q-C03i | `docs/report-assets/Bao_Cao_Tieu_Luan_TMDT-preview-v7.pdf` | 1.315.766 B | `5DEEBBAE5FF342800DF495189EDB7ECBA407E9AE2F9F306CCADDF1948F816090` | Di chuyển | `docs/maintenance/quarantine/report-history/Bao_Cao_Tieu_Luan_TMDT-preview-v7.pdf` | Preview cũ | Di chuyển ngược về path cũ | Đã hoàn tất |

## Target được bảo vệ

| Target | Quyết định |
|---|---|
| `D:\TMDT\node_modules` | Giữ nguyên theo phê duyệt |
| `D:\TMDT\repository\.git` và toàn bộ `repository/` | Giữ nguyên; không ghi đè file chưa commit |
| `D:\TMDT\deliverables` | Giữ nguyên |
| `D:\TMDT\.wrangler\state` | Giữ nguyên dữ liệu D1 local |
| `app/`, `db/`, `drizzle/`, `public/`, `scripts/`, `tests/`, `worker/` | Giữ nguyên |
| `MOVE-B01` đến `MOVE-B06` | Tạm hoãn |

## Hướng dẫn khôi phục

- Cache/build đã xóa: chạy `npm ci` nếu thiếu dependency, `npm run typecheck`, `npm run build` và `npm run dev` khi cần.
- Report cách ly: chuyển đúng target trong `docs/maintenance/quarantine/report-history/` về `docs/report-assets/`; kiểm tra hash với bảng trên.
- Không xóa vĩnh viễn thư mục cách ly trong lượt này.

## Kết quả thực hiện

- Đã xóa đúng 27 target chi tiết thuộc phạm vi `DEL-A02` đến `DEL-A11`; không mở rộng sang target chưa được duyệt.
- Đã chuyển 9 target report cũ (28,02 MiB) vào `docs/maintenance/quarantine/report-history/`; kiểm tra lại SHA-256 đạt 9/9, không có sai lệch.
- Dung lượng thực tế giảm tại cây dự án sau khi đã tính cả ba tài liệu bảo trì: 291.908.210 byte (278,39 MiB).
- Sau dọn dẹp, cây `D:\TMDT` có 21.717 file, tổng dung lượng 509.834.041 byte.
- `npm run lint`, `npm run typecheck`, `npm run build` và `npm test` đều đạt; tổng kiểm thử: 23/23 test đạt.
- Build/test đã tái tạo `dist/`, `.next` và `tsconfig.tsbuildinfo`; ba target này được xóa lại sau khi xác minh thành công.
- Kiểm tra liên kết Markdown: 0 liên kết nội bộ hỏng. Kiểm tra conflict marker: 0 kết quả.
- `node_modules`, `.wrangler/state`, `repository/.git`, `deliverables` và toàn bộ source nghiệp vụ được giữ nguyên.
- `.gitignore` được bổ sung `/tmp/` để thư mục tạm đã duyệt không quay lại Git.
- Trạng thái Git lồng trong `repository/` không thay đổi trong quá trình dọn dẹp.
