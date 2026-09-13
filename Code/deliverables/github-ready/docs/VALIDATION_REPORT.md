# Báo cáo kiểm tra gói tách

Ngày kiểm tra: 2026-09-07

## Kết quả

| Gói | Build | Typecheck | Lint | Test |
|---|---:|---:|---:|---:|
| `storefront-web` | Đạt | Đạt | Đạt | 3/3 đạt |
| `admin-web` | Đạt | Đạt | Đạt | 3/3 đạt |

Các lệnh đã chạy:

```bash
npm run typecheck
npm run lint
npm test
```

Storefront build chỉ có route cửa hàng, menu, địa chỉ và order. Admin build chỉ có route `/admin`, `/api/admin/*`, root redirect và robots noindex.

## Kiểm tra đóng gói

- Không có `.git`, `.env`, `.env.local`, secret, database local, `node_modules`, cache, log hoặc build output trong ZIP cuối.
- Không có conflict marker.
- Import và asset path đã được xác nhận qua build production của từng gói.
- `GEOAPIFY_API_KEY` chỉ tồn tại dưới dạng tên biến trống trong `.env.example` của storefront và được đọc ở server.
- `database_id` vẫn là UUID placeholder toàn số 0; chưa có tài nguyên cloud hay deployment nào được tạo.
- Không sửa, xóa hoặc di chuyển file source gốc hay working copy `repository/`; toàn bộ kết quả nằm trong `D:\TMDT\deliverables\github-ready`.

## Cần xác nhận trước production

1. Tạo một D1 production và điền cùng `database_id` vào hai `wrangler.jsonc`.
2. Chọn hai hostname/Worker name riêng, đặt `SITE_URL` tương ứng.
3. Đặt `STOREFRONT_URL` cho admin và Geoapify secret cho storefront.
4. Chạy migration có backup, tạo admin production theo quy trình được phê duyệt.
5. Chạy lại integration end-to-end khi cả hai deployment cùng trỏ vào D1 production/staging.
