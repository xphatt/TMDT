# Hướng dẫn dùng source từ GitHub

Thư mục này là ứng dụng hoàn chỉnh của dự án **Trà Sữa Ngon**. Nội dung được giữ cùng một project để storefront, API nội bộ, D1 local và admin dùng chung contract nghiệp vụ.

## Cài đặt

```powershell
cd TraSuaNgon
npm ci
Copy-Item .env.example .env.local
npm run db:migrate:local
npm run dev
```

Biến môi trường mẫu:

```dotenv
GEOAPIFY_API_KEY=
SITE_URL=http://localhost:3000
```

Không commit `.env.local`. Khi chưa có Geoapify key, người dùng vẫn có thể nhập địa chỉ thủ công.

## Kiểm tra trước khi tạo Pull Request

```powershell
npm run lint
npm run typecheck
npm test
```

`npm test` đã bao gồm production build và 13 test Node/integration/regression.

## Dữ liệu và thanh toán

- Menu, topping và giá lấy từ dữ liệu nội bộ.
- Cart lưu trong `localStorage`.
- Đơn hàng và admin dùng Cloudflare D1; local state nằm trong `.wrangler/` và không được commit.
- Chỉ có COD và QR mô phỏng. QR không tự chuyển thành `paid`.
- VNPay, MoMo và ZaloPay mới chỉ có seam `PaymentProvider`, chưa tích hợp thật.

Xem [`README.md`](README.md), [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) và [`docs/qa/TEST_RESULTS.md`](docs/qa/TEST_RESULTS.md) để biết chi tiết.
