# Package manifest — Storefront

| File/thư mục | Được đưa vào | Lý do | Ghi chú |
|---|---:|---|---|
| `app/components`, `app/data`, `app/lib`, `app/types.ts` | Có | UI mua hàng, catalogue, cart và API adapter | Không chứa module admin |
| `app/api/menu`, `app/api/orders`, `app/api/address-suggestions` | Có | API phục vụ storefront | Geoapify chỉ gọi phía server |
| `app/server/orders`, `app/server/payments` | Có | Tính giá và tạo đơn tin cậy phía server | Thanh toán chỉ mô phỏng |
| `db/`, `drizzle/` | Có | D1 schema và migration | Phải đồng bộ với admin-web |
| `public/fonts`, `public/images`, `public/favicon.svg` | Có | Asset thực sự được source tham chiếu | JSON cạnh ảnh lưu provenance |
| `.openai/hosting.json`, `vite.config.ts`, `wrangler.jsonc` | Có | Giữ capability Sites/Cloudflare hiện tại | Chưa deploy |
| `package.json`, `package-lock.json` | Có | Dependency tái lập | Không thêm dependency |
| `docs/`, `DESIGN.md`, `PRODUCT.md` | Có | Tài liệu storefront và quyết định sản phẩm | Tài liệu admin đã loại |
| `app/admin`, `app/api/admin`, `app/server/admin`, `app/server/auth` | Không | Thuộc web quản lý | Có trong admin-web |
| `.env`, `.env.local`, secret | Không | Bảo mật | Chỉ có `.env.example` |
| `node_modules`, `.next`, `.vinext`, `dist`, `.wrangler`, cache, log | Không | Có thể sinh lại | Được `.gitignore` bảo vệ |
