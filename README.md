# Trà Sữa Ngon — Website thương mại điện tử

Website bán trà sữa responsive bằng tiếng Việt, gồm storefront cho khách hàng và trang quản trị nội bộ. Source chính nằm trong thư mục [`Code/`](Code/); các lệnh ở repository root sẽ tự chuyển tiếp vào thư mục này.

## Thành viên nhóm

| TT | Họ tên | Email |
|---:|---|---|
| 1 | Phạm Huy Hoàng | [Hoangph0957@ut.edu.vn](mailto:Hoangph0957@ut.edu.vn) |
| 2 | Đỗ Huỳnh Bình Khôi | [Dhbkhoi@gmail.com](mailto:Dhbkhoi@gmail.com) |
| 3 | Nguyễn Huy Phú | [phunh310003@ut.edu.vn](mailto:phunh310003@ut.edu.vn) |
| 4 | Nguyễn Đặng Xuân Phát | [nguyendangxuanphat@gmail.com](mailto:nguyendangxuanphat@gmail.com) |
| 5 | Tiêu Đình Bảo Khoa | [khoa79074@gmail.com](mailto:khoa79074@gmail.com) |
| 6 | Trần Tuấn Khang | [08trantuankhang@gmail.com](mailto:08trantuankhang@gmail.com) |

## Chức năng

- Tìm kiếm tiếng Việt có dấu/không dấu, lọc danh mục và sắp xếp sản phẩm.
- Tùy chỉnh size, đường, đá, topping; lưu giỏ hàng trên thiết bị.
- Checkout COD hoặc QR mô phỏng; backend kiểm tra lại giá và chống tạo đơn trùng.
- Geoapify autocomplete cho địa chỉ Việt Nam qua API server-side.
- Khuyến mãi, feedback, đánh giá/bình luận và các trang chính sách.
- Đăng nhập quản trị, catalogue, khuyến mãi, đơn hàng, COD, feedback và kiểm duyệt đánh giá.
- Giao diện responsive, điều hướng bàn phím, focus rõ và hỗ trợ reduced motion.

## Công nghệ

- React 19, TypeScript, Vinext và Vite.
- Cloudflare Workers, D1 và Drizzle ORM.
- CSS tùy chỉnh; không phụ thuộc UI framework.
- Node.js 22.13.0 trở lên.

## Cài đặt và chạy local

Yêu cầu Node.js `22.13.0` trở lên. Từ thư mục gốc `TMDT`, chạy:

```bash
git clone https://github.com/xphatt/TMDT.git
cd TMDT
npm run setup
npm run db:migrate:local
npm run dev
```

`npm run setup` cài đúng dependency từ lockfile trong `Code/`. Khi terminal hiện dòng `Local`, mở [http://localhost:3000](http://localhost:3000). Giữ terminal này chạy trong lúc sử dụng website.

Bạn vẫn có thể chạy trực tiếp từ `Code/` bằng `npm ci`, `npm run db:migrate:local` và `npm run dev`.

Để dùng trên điện thoại cùng Wi-Fi, mở địa chỉ `Network` được terminal in ra; không dùng `localhost` trên điện thoại.

Tạo admin local bằng lệnh tương tác:

```bash
npm run admin:create
```

Sau đó đăng nhập tại [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Biến môi trường

Trong `Code/`, sao chép `.env.example` thành `.env.local`:

```dotenv
GEOAPIFY_API_KEY=
SITE_URL=http://localhost:3000
STORE_ADDRESS=
DEMO_MODE=false
DEMO_ERROR_SCENARIO=
```

- Không commit `.env` hoặc `.env.local`.
- `GEOAPIFY_API_KEY` chỉ được đọc ở backend.
- `STORE_ADDRESS` cần địa chỉ cửa hàng đã xác nhận để bật liên kết Google Maps.
- Hai biến `DEMO_*` chỉ dùng cho local/test và phải tắt ở production.

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
```

Kết quả xác nhận gần nhất: lint PASS, type-check PASS, production build PASS và 26/26 test PASS.

## Cấu trúc repository

```text
TMDT/
├── README.md                 Trang giới thiệu và hướng dẫn nhanh
└── Code/
    ├── app/                  Storefront, Admin, API và nghiệp vụ server
    ├── db/                   Schema D1/Drizzle
    ├── drizzle/              Migration database
    ├── public/               Ảnh, font và asset tĩnh
    ├── scripts/              Migration local và tạo admin
    ├── tests/                Unit, integration, rendered và UI regression
    ├── docs/                 Tài liệu kỹ thuật, QA và triển khai
    ├── worker/               Cloudflare Worker entry
    ├── .env.example          Mẫu biến môi trường, không chứa secret
    ├── package.json          Scripts và dependency
    └── README.md             Tài liệu kỹ thuật đầy đủ
```

## Tài liệu

- [README kỹ thuật](Code/README.md)
- [Hướng dẫn quản trị](Code/docs/ADMIN_GUIDE.md)
- [API quản trị](Code/docs/API_ADMIN.md)
- [Cấu trúc database](Code/docs/DATABASE_SCHEMA.md)
- [Payment Provider](Code/docs/PAYMENT_PROVIDERS.md)
- [Kiểm tra sẵn sàng GitHub](Code/docs/testing/GITHUB_RELEASE_READINESS.md)
- [Kết quả kiểm thử cuối](Code/docs/completion/FINAL_TEST_RESULTS.md)
- [Kế hoạch triển khai public](Code/docs/deployment/PUBLIC_DEPLOYMENT_PLAN.md)

## Giới hạn

- COD và QR hiện chỉ là mô phỏng; dự án không thu tiền thật.
- VNPay, MoMo và ZaloPay chưa được kết nối, nhưng đã có seam `PaymentProvider` để mở rộng.
- Production D1, domain, DNS và HTTPS chưa được cấu hình trong repository.
- Google Maps ở trạng thái cần cấu hình cho đến khi nhóm cung cấp `STORE_ADDRESS`.

## Giấy phép

Dự án được thực hiện cho mục đích học tập.
