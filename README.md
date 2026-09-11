# Trà Sữa Ngon

Website thương mại điện tử tiếng Việt cho thương hiệu hư cấu **Trà Sữa Ngon**. Source chạy được nằm trong thư mục [`TraSuaNgon/`](TraSuaNgon/).

## Chức năng

- Duyệt, tìm kiếm và lọc menu nội bộ.
- Tùy chỉnh size, đường, đá, topping và lưu giỏ hàng local.
- Checkout với COD hoặc QR mô phỏng; không thu tiền thật.
- Proxy gợi ý địa chỉ Việt Nam qua Geoapify ở phía server.
- Trang quản trị nội bộ cho đơn hàng, trạng thái, COD và audit log.
- Responsive cho mobile, tablet và desktop; có hỗ trợ bàn phím và reduced motion.

## Chạy local

Yêu cầu Node.js `22.13.0` trở lên.

```powershell
git clone https://github.com/xphatt/TMDT.git
cd TMDT\TraSuaNgon
npm ci
Copy-Item .env.example .env.local
npm run db:migrate:local
npm run dev
```

Mặc định website chạy tại `http://localhost:3000`. Xem hướng dẫn đầy đủ, cấu hình môi trường, admin và giới hạn thanh toán trong [`TraSuaNgon/README.md`](TraSuaNgon/README.md).

## Kiểm tra

```powershell
cd TraSuaNgon
npm run lint
npm run typecheck
npm test
```

Bộ kiểm tra hiện có 13 test cho storefront, menu nội bộ, Geoapify adapter, đơn hàng, thanh toán mô phỏng, admin và regression accessibility.

## Bảo mật

- Không commit `.env`, `.env.local`, token, password hoặc API key.
- `GEOAPIFY_API_KEY` chỉ được đọc phía server.
- Không tích hợp hoặc thu tiền thật trong phiên bản này.
- Dữ liệu D1 local và build output không được đưa vào Git.

## Thành viên nhóm

| TT | Họ Tên | Email |
|---|---|---|
| 1 | Phạm Huy Hoàng | Hoangph0957@ut.edu.vn |
| 2 | Đỗ Huỳnh Bình Khôi | Dhbkhoi@gmail.com |
| 3 | Nguyễn Huy Phú | phunh310003@ut.edu.vn |
| 4 | Nguyễn Đặng Xuân Phát | nguyendangxuanphat@gmail.com |
| 5 | Tiêu Đình Bảo Khoa | khoa79074@gmail.com |
| 6 | Trần Tuấn Khang | 08trantuankhang@gmail.com |

## License

Dự án được thực hiện cho mục đích học tập. Chưa có file license riêng.
