import { PolicyPage } from "../../components/PolicyPage";

export default function ShippingPolicyPage() {
  return <PolicyPage title="Chính sách vận chuyển" summary="Thông tin mẫu về phí, phạm vi và cách xử lý giao hàng trong phiên bản đồ án.">
    <section><h2>Phí giao hàng</h2><p>Checkout hiện dùng phí giao hàng mẫu 18.000đ cho mỗi đơn. Đây là dữ liệu mô phỏng và cần được thay bằng biểu phí đã phê duyệt trước khi kinh doanh thật.</p></section>
    <section><h2>Phạm vi và thời gian dự kiến</h2><p>Phạm vi giao hàng và thời gian dự kiến chưa được cấu hình vì dự án chưa có địa chỉ cửa hàng được xác nhận. Người dùng vẫn có thể nhập địa chỉ để trình diễn luồng đặt hàng local.</p></section>
    <section><h2>Khi giao hàng không thành công</h2><p>Nhóm vận hành cần liên hệ qua số điện thoại trong đơn, ghi nhận lý do và cập nhật trạng thái phù hợp. Không hiển thị thông tin giao hàng ra khu vực công khai.</p></section>
    <section><h2>Hỗ trợ</h2><p>Dùng biểu mẫu Liên hệ trên website và cung cấp mã đơn. Phản hồi sẽ được lưu trong khu vực quản trị nội bộ để xử lý.</p></section>
  </PolicyPage>;
}
