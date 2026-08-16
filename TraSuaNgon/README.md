# Trà Sữa Ngon

Website thương mại điện tử responsive bằng tiếng Việt cho thương hiệu trà sữa hư cấu `Trà Sữa Ngon`. Dự án chạy trên starter Sites/Vinext với React 19 và TypeScript.

## Chạy local

Yêu cầu Node.js `22.13.0` trở lên.

```bash
npm ci
npm run test
npm run dev
```

Mở địa chỉ được in trong terminal, mặc định là [http://localhost:3000](http://localhost:3000).

Kiểm tra production build:

```bash
npm run build
npm run lint
```

## Cấu hình Geoapify

Sao chép `.env.example` thành `.env.local`, sau đó điền secret do bạn tự tạo trên Geoapify:

```dotenv
GEOAPIFY_API_KEY=
```

Không đặt key trong code frontend. Route server đọc key ở runtime và chỉ trả về dữ liệu địa chỉ tối giản. `.env*` được ignore, riêng `.env.example` được phép lưu cùng source.

## Luồng chính

- Trang chủ với hero, danh mục, sản phẩm bán chạy, lợi ích và câu chuyện thương hiệu.
- Catalogue có tìm kiếm, lọc danh mục, sắp xếp và empty state.
- Chi tiết món cho phép chọn size, đường, đá, topping và số lượng; giá cập nhật theo lựa chọn.
- Giỏ hàng có tăng, giảm, xoá và tự lưu trên thiết bị.
- Checkout có validation tiếng Việt, autocomplete địa chỉ Việt Nam với debounce, tiền mặt và QR mô phỏng.
- Backend đối chiếu sản phẩm, topping và giá nội bộ, tạo đơn `pending`, sau đó xác nhận thành `confirmed` mà không đánh dấu `paid`.
- Trang thành công lưu bản sao tối đa 10 đơn gần nhất trên thiết bị để người dùng xem lại trong môi trường local.

## Cấu trúc

```text
app/
  api/address-suggestions/  Proxy Geoapify phía server
  api/menu/                 Catalogue và pricing nội bộ dạng JSON
  api/orders/               Tạo và xác nhận đơn mô phỏng
  components/TeaShop.tsx  Toàn bộ các surface và tương tác mua hàng
  data/products.ts        Catalogue, danh mục, topping và định dạng giá nội bộ
  data/pricing.ts         Phụ phí size và phí giao hàng mẫu
  lib/checkout-api.ts     Client adapter cho autocomplete và order API
  lib/storage.ts          Adapter localStorage cho cart và đơn mô phỏng
  server/orders/          Order service và repository adapter
  server/payments/        PaymentProvider cho COD và QR mô phỏng
  types.ts                Kiểu dữ liệu sản phẩm, cart và checkout
  globals.css             Design tokens, component styles và responsive rules
  layout.tsx              Metadata, social preview và ngôn ngữ tài liệu
public/images/            Ảnh sản phẩm, nguyên liệu và social card đã tạo
PRODUCT.md                Bối cảnh sản phẩm lâu dài
DESIGN.md                 Hệ thống nhận diện được ghi lại sau kiểm thử
docs/PAYMENT_PROVIDERS.md Hướng dẫn seam tích hợp cổng thanh toán thật
```

Catalogue và giá nằm trong `app/data`, không lấy từ FakeStoreAPI hoặc Open Food Facts. Backend luôn tính lại giá từ nguồn nội bộ thay vì tin `unitPrice` do frontend gửi lên.

## API nội bộ

- `GET /api/menu`
- `GET /api/address-suggestions?q=<dia-chi>`
- `POST /api/orders`
- `POST /api/orders/:id/confirm`

Endpoint địa chỉ gọi Geoapify Address Autocomplete với `filter=countrycode:vn`, `limit=5` và chỉ trả `label`, `province`, `district`, `latitude`, `longitude`. Khi thiếu key, sai key, timeout hoặc không có kết quả, checkout vẫn cho nhập địa chỉ thủ công.

## Dữ liệu cục bộ

- Giỏ hàng: `tra-sua-ngon:cart:v1`
- Đơn mô phỏng: `tra-sua-ngon:orders:v1`

Giỏ hàng là draft theo thiết bị nên tiếp tục dùng localStorage. Backend mock tạo và xác nhận đơn qua `OrderRepository`; adapter hiện tại lưu tối đa 100 đơn trong memory của process local. Bản sao receipt được lưu vào localStorage sau khi server xác nhận.

**Cần xác nhận trước khi triển khai thật:** chọn database và chính sách lưu dữ liệu đơn. Project chưa bật D1 và không thay đổi schema trong lần tích hợp này, vì vậy order memory không bền qua restart hoặc nhiều Worker isolate.

## Giới hạn thanh toán

Checkout chỉ là mô phỏng. Dự án không tích hợp cổng thanh toán, không tạo giao dịch và không thu tiền. Mã QR chỉ là hình minh hoạ trong giao diện và không được dùng để chuyển khoản thật.

`PaymentProvider` hiện có hai adapter: `cash_on_delivery` luôn giữ `unpaid`, còn `mock_qr` luôn giữ `simulation_only`. Hướng tích hợp VNPay, MoMo và ZaloPay được mô tả trong `docs/PAYMENT_PROVIDERS.md`.

## Accessibility và responsive

- Nhãn form hiển thị đầy đủ, lỗi liên kết bằng `aria-describedby` và có validation summary.
- Focus keyboard rõ, skip link, touch target tối thiểu khoảng 44px.
- Contrast theo mục tiêu WCAG AA và trạng thái không chỉ dựa vào màu.
- Motion tắt khi người dùng bật `prefers-reduced-motion`.
- Không dùng `h-screen`; layout dùng nội dung tự nhiên và `min-height` ổn định.
- Breakpoint kiểm tra mục tiêu: 360px, 768px, 1024px và 1440px.

## Kiểm thử đã thực hiện

- Production build, 8 integration test và lint chạy thành công trên Windows.
- Test bao phủ Geoapify hợp lệ tại Việt Nam, tối đa 5 kết quả, empty, lỗi mạng, thiếu key, sai key, validation địa chỉ, internal pricing, topping, COD, QR mô phỏng và secret scan trên frontend bundle.
- Luồng từ catalogue, cấu hình món, giỏ hàng, tải lại trang, checkout đến xác nhận đơn đã được kiểm tra trên trình duyệt Chromium tích hợp của Codex.
- Giao diện đã được kiểm tra trực tiếp ở 360px, 768px, 1024px và 1440px; không phát hiện tràn ngang hoặc lỗi console.
- Các control dùng HTML native, có thứ tự DOM hợp lý, skip link và focus ring 3px. Lớp điều khiển của trình duyệt tích hợp không ghi nhận ổn định một traversal bàn phím tự động hoàn chỉnh, nên cần chạy thêm regression keyboard thủ công trước khi phát hành thật.
- Firefox, Safari, Edge và bản Chrome độc lập chưa có sẵn để kiểm tra trực tiếp trong môi trường này. Source dùng HTML, CSS và Web API tiêu chuẩn để giữ khả năng tương thích rộng.

## Hình ảnh

Ảnh trong `public/images` được tạo riêng cho thương hiệu hư cấu bằng built-in ImageGen. Prompt nguyên văn được lưu cạnh mỗi ảnh trong file `.json`. Không dùng logo hoặc ảnh của thương hiệu có thật.

Display face được self-host từ font Noto Sans có sẵn trong starter. Icon mũi tên, xác nhận và bốn danh mục dùng cùng component SVG nét mảnh nội bộ, không phát sinh dependency mới.

## Triển khai

Dự án được yêu cầu chạy local. Không có bước publish hoặc deploy tự động trong quy trình này.
