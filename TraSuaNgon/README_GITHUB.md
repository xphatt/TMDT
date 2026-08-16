# Trà Sữa Ngon — Gói bàn giao GitHub

Đây là bản sao tối giản của website thương mại điện tử `Trà Sữa Ngon`, được chuẩn bị để review, gửi qua ZIP hoặc đưa vào một Git repository. Project nguồn không bị thay đổi.

## Yêu cầu

- Node.js `22.13.0` trở lên.
- npm đi kèm Node.js.
- Geoapify API key chỉ cần khi muốn nhận gợi ý địa chỉ thật.

## Cài dependency

Mở terminal tại thư mục `github-ready` và chạy:

```powershell
npm ci
```

`package-lock.json` đã được giữ lại để cài đúng phiên bản dependency.

## Cấu hình môi trường

Tạo `.env.local` từ `.env.example`:

```powershell
Copy-Item .env.example .env.local
```

Sau đó điền key trên máy cá nhân:

```dotenv
GEOAPIFY_API_KEY=
```

Không commit `.env.local`. Khi chưa có key hoặc Geoapify lỗi, checkout vẫn cho phép nhập địa chỉ thủ công.

## Chạy local

```powershell
npm run dev
```

Mở URL được in trong terminal. Port có thể thay đổi nếu port mặc định đang được sử dụng.

## Kiểm tra

```powershell
npm run lint
npm run test
npm run build
```

Lưu ý: `npm test` đã chạy production build trước khi chạy integration test, nên chạy thêm `npm run build` là bước xác nhận độc lập cuối.

## Thanh toán và dữ liệu

- Menu, topping và giá dùng dữ liệu nội bộ.
- Cart và receipt mô phỏng dùng local storage.
- Order API dùng memory repository trong môi trường local.
- Chỉ có COD và QR mô phỏng; project không thu tiền và không đánh dấu đơn là `paid`.
- Geoapify được gọi phía server qua `GEOAPIFY_API_KEY`.

## File cố ý không đưa vào

- `.env`, `.env.local`, API key, token, password và credential.
- `.git/` và working copy Git lồng.
- `node_modules/`, `.next/`, `.vinext/`, `dist/`, `.wrangler/`, `.npm-cache/`.
- Log, database local, ZIP, backup và file tạm.
- Design review artifact trong `.impeccable/`.
- Prompt JSON của ảnh và SVG starter không được source tham chiếu.

Danh sách đầy đủ nằm trong [PACKAGE_MANIFEST.md](PACKAGE_MANIFEST.md).

## Mục cần nhóm xác nhận

`db/`, `drizzle/`, `examples/`, `drizzle.config.ts` và `app/chatgpt-auth.ts` được giữ để tránh loại nhầm capability starter. Chúng có thể được loại trong một thay đổi riêng sau khi nhóm xác nhận không dùng D1, Drizzle hoặc authentication và build/test vẫn pass.
