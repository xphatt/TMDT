# Trà Sữa Ngon — gói tách GitHub

Thư mục này chứa hai web độc lập được tách từ project hiện tại mà không sửa project gốc:

- `storefront-web/`: website khách hàng, menu, tuỳ chỉnh đồ uống, giỏ hàng, checkout, Geoapify và tạo đơn.
- `admin-web/`: website quản lý, đăng nhập nội bộ, dashboard, xử lý trạng thái đơn, xác nhận COD và audit log.

Mỗi thư mục có `package.json`, lockfile, cấu hình Vinext/Cloudflare, README và manifest riêng nên có thể đưa vào hai repository GitHub khác nhau. Nếu muốn giữ chung repository `xphatt/TMDT`, hãy giữ nguyên hai thư mục con này.

## Cấu trúc bàn giao

```text
github-ready/
├── storefront-web/     Source website khách hàng
├── admin-web/          Source website quản lý
├── docs/               Kiến trúc và kết quả kiểm tra
├── releases/           Hai ZIP dùng để gửi hoặc giải nén
├── .gitignore
└── README.md
```

## Chạy hai web cùng lúc

Mở hai terminal:

```bash
cd storefront-web
npm ci
npm run db:migrate:local
npm run dev
```

```bash
cd admin-web
npm ci
npm run admin:create
npm run dev
```

- Cửa hàng: `http://localhost:3000`
- Quản lý: `http://localhost:3001/admin/login`

Hai web dùng chung dữ liệu D1 local qua thư mục `../.tra-sua-ngon-local-state/`. Không đưa thư mục này lên GitHub.

## Ranh giới triển khai

Production cần hai Worker name riêng nhưng phải bind cùng một D1 database. `database_id` trong hai file `wrangler.jsonc` hiện là placeholder và phải được thay bằng cùng một D1 ID sau khi nhóm tạo tài nguyên Cloudflare. Không có deployment, tài khoản cloud hay secret nào được tạo trong gói này.

Xem [kiến trúc tách module](docs/SPLIT_ARCHITECTURE.md) và [báo cáo kiểm tra](docs/VALIDATION_REPORT.md) trước khi thay API hoặc schema.

Hai file nén nằm trong `releases/`. Khi push GitHub, nên giải nén và push source thay vì commit file ZIP.
