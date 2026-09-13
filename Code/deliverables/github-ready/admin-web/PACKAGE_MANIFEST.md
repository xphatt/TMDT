# Package manifest — Admin

| File/thư mục | Được đưa vào | Lý do | Ghi chú |
|---|---:|---|---|
| `app/admin` | Có | Login, dashboard, danh sách và chi tiết đơn | Responsive, noindex |
| `app/api/admin` | Có | API xác thực và vận hành đơn | Session, CSRF, role, rate limit |
| `app/server/admin`, `app/server/auth` | Có | Business rules quản trị và bảo mật | Không dùng localStorage |
| `app/server/orders/order-types.ts`, `app/server/payments/payment-provider.ts` | Có | Kiểu trạng thái dùng tại ranh giới module | Giữ contract hiện có |
| `db/`, `drizzle/` | Có | D1 schema và migration | Phải đồng bộ với storefront-web |
| `scripts/create-admin.ts`, `scripts/migrate-local.ts` | Có | Khởi tạo local an toàn | Không thao tác production |
| `.openai/hosting.json`, `vite.config.ts`, `wrangler.jsonc` | Có | Giữ capability Sites/Cloudflare hiện tại | Chưa deploy |
| `package.json`, `package-lock.json` | Có | Dependency tái lập | Không thêm dependency |
| `docs/`, `DESIGN.md`, `PRODUCT.md` | Có | Hướng dẫn admin, API, database và payment seam | Báo cáo cũ gắn đường dẫn máy đã loại |
| Catalogue UI, cart, checkout, Geoapify, API tạo đơn | Không | Thuộc storefront | Có trong storefront-web |
| Ảnh sản phẩm và font storefront | Không | Admin không tham chiếu | Chỉ giữ favicon |
| `.env`, secret, database local | Không | Bảo mật và dữ liệu máy cá nhân | Chỉ có `.env.example` |
| `node_modules`, `.next`, `.vinext`, `dist`, `.wrangler`, cache, log | Không | Có thể sinh lại | Được `.gitignore` bảo vệ |
