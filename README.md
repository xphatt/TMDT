# Trà Sữa Ngon | Website Thương Mại Điện Tử

Website thương mại điện tử dành cho thương hiệu **Trà Sữa Ngon**, giúp khách hàng khám phá menu, tùy chỉnh đồ uống, thêm vào giỏ hàng và đặt hàng trực tuyến.

## Mục tiêu dự án

- Xây dựng website bán trà sữa thân thiện, hiện đại và dễ sử dụng.
- Hoạt động tốt trên điện thoại, tablet, laptop và PC.
- Hỗ trợ quy trình mua hàng: xem sản phẩm → tùy chỉnh → giỏ hàng → thanh toán → xác nhận đơn.
- Tạo giao diện có bản sắc riêng, phù hợp khách hàng Việt Nam.

## Chức năng chính

### Khách hàng

- Xem danh sách sản phẩm theo danh mục.
- Tìm kiếm và lọc sản phẩm.
- Xem chi tiết đồ uống.
- Tùy chỉnh size, lượng đường, lượng đá và topping.
- Thêm, chỉnh sửa số lượng hoặc xóa sản phẩm trong giỏ hàng.
- Nhập thông tin giao hàng.
- Gợi ý địa chỉ giao hàng tại Việt Nam.
- Chọn phương thức thanh toán:
  - Thanh toán khi nhận hàng.
  - Chuyển khoản/QR mô phỏng.
- Xác nhận đơn hàng và nhận mã đơn.
- Xem trạng thái đơn hàng mô phỏng.

### Quản lý dữ liệu

- Quản lý danh sách sản phẩm.
- Quản lý danh mục, giá bán và topping.
- Lưu thông tin giỏ hàng.
- Lưu đơn hàng và trạng thái đơn.
- Chuẩn bị cấu trúc để tích hợp database và cổng thanh toán thật sau này.

## Công nghệ dự kiến

| Thành phần | Công nghệ |
|---|---|
| Frontend | React / Next.js |
| Ngôn ngữ | TypeScript |
| Styling | Tailwind CSS hoặc CSS Modules |
| Quản lý trạng thái | React Context, Zustand hoặc Local Storage |
| Gợi ý địa chỉ | Geoapify Address Autocomplete API |
| Dữ liệu ban đầu | Local JSON hoặc Local Storage |
| Thanh toán | Mô phỏng COD và QR |
| Database tương lai | MySQL hoặc PostgreSQL |
| Thanh toán thật tương lai | VNPay, MoMo hoặc ZaloPay |

> Công nghệ sẽ được cập nhật lại theo source code thực tế sau khi hoàn thiện project.

## Cấu trúc thư mục

```text
src/
├── app/ hoặc pages/       # Trang và route
├── components/            # Component tái sử dụng
├── features/              # Nghiệp vụ sản phẩm, giỏ hàng, thanh toán
├── data/                  # Dữ liệu sản phẩm mẫu
├── services/              # Gọi API và xử lý dữ liệu
├── types/                 # Kiểu dữ liệu TypeScript
├── hooks/                 # Custom hooks
├── styles/                # Style toàn cục và design tokens
└── utils/                 # Hàm tiện ích

public/
└── images/                # Ảnh sản phẩm và tài nguyên tĩnh
```

## Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <repository-url>
cd TMDT
```

### 2. Cài dependency

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env.local` từ `.env.example`:

```bash
GEOAPIFY_API_KEY=your_geoapify_api_key
```

> Không commit file `.env` hoặc `.env.local` lên GitHub.

### 4. Chạy môi trường phát triển

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị trong terminal, thường là:

```text
http://localhost:3000
```

### 5. Build production

```bash
npm run build
npm run start
```

## Luồng đặt hàng

```text
Chọn sản phẩm
      ↓
Tùy chỉnh size, đường, đá, topping
      ↓
Thêm vào giỏ hàng
      ↓
Nhập thông tin giao hàng
      ↓
Chọn phương thức thanh toán
      ↓
Xác nhận đơn hàng
      ↓
Nhận mã đơn và thông tin đơn hàng
```

## Tích hợp API

### Geoapify

- Geoapify được dùng để gợi ý địa chỉ giao hàng khi khách hàng nhập địa chỉ.
- API key được lưu trong biến môi trường.
- Không đưa API key vào frontend source code.
- Khi API lỗi, khách hàng vẫn có thể nhập địa chỉ thủ công.

### Thanh toán

Phiên bản hiện tại sử dụng thanh toán mô phỏng:

- Thanh toán khi nhận hàng.
- Chuyển khoản/QR mô phỏng.

Các cổng thanh toán thật như VNPay, MoMo hoặc ZaloPay sẽ chỉ được tích hợp khi có tài khoản sandbox, API key và yêu cầu nghiệp vụ chính thức.

## Responsive và Accessibility

Website được thiết kế để hoạt động tốt tại các kích thước:

- Mobile: từ 360px.
- Tablet: từ 768px.
- Laptop: từ 1024px.
- Desktop: từ 1440px.

Tiêu chuẩn trải nghiệm:

- Điều hướng bằng bàn phím.
- Focus state rõ ràng.
- Màu sắc đủ độ tương phản.
- Form có validation.
- Có trạng thái loading, empty và error.
- Hỗ trợ tiếng Việt có dấu.

## Bảo mật

- Không lưu API key, password hoặc token trong source code.
- Không commit file môi trường lên GitHub.
- Không xử lý thanh toán thật ở frontend.
- Trạng thái thanh toán thật phải được xác minh tại backend qua callback/webhook.
- Dữ liệu giỏ hàng và đơn hàng phải được kiểm tra trước khi lưu.

## Hướng phát triển

- Đăng ký và đăng nhập tài khoản khách hàng.
- Trang quản trị sản phẩm và đơn hàng.
- Database thật cho sản phẩm, khách hàng và đơn hàng.
- Tích hợp VNPay, MoMo hoặc ZaloPay.
- Tích hợp đơn vị vận chuyển.
- Theo dõi trạng thái đơn hàng.
- Đánh giá sản phẩm và mã giảm giá.


## License

Dự án được thực hiện cho mục đích học tập.
