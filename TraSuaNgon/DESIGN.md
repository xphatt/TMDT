---
version: alpha
name: "Trà Sữa Ngon"
description: "Một quầy trà Việt hiện đại, thủ công và rõ ràng cho từng lựa chọn."
colors:
  paper: "#f8f7f2"
  surface: "#fffef9"
  jade-950: "#073f30"
  jade-900: "#0b513c"
  jade-700: "#28715a"
  jade-150: "#dce8dc"
  tea-100: "#ecf0df"
  ink: "#10251e"
  muted: "#52655d"
  line: "#cdd9d1"
  orange: "#c64a0a"
  orange-hover: "#a83b06"
  focus: "#f1792f"
typography:
  display:
    fontFamily: '"TSN Display", "Trebuchet MS", sans-serif'
    fontSize: "clamp(3.7rem, 5.3vw, 5.15rem)"
    fontWeight: 900
    lineHeight: 0.96
    letterSpacing: "-0.065em"
  headline:
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif'
    fontSize: "clamp(2.2rem, 4.2vw, 4rem)"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.04em"
  product-title:
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif'
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif'
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif'
    fontSize: "0.75rem"
    fontWeight: 900
rounded:
  field: "10px"
  tray: "14px"
  surface: "16px"
  hero: "18px"
  pill: "999px"
spacing:
  micro: "8px"
  compact: "12px"
  control: "16px"
  content: "24px"
  gutter: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "#fffaf4"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.orange-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.jade-950}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "50px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jade-950}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  filter-chip-selected:
    backgroundColor: "{colors.jade-900}"
    textColor: "{colors.surface}"
  text-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "52px"
  product-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "24px"
  choice-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jade-950}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "60px"
  choice-tile-selected:
    backgroundColor: "{colors.tea-100}"
    textColor: "{colors.jade-950}"
  navigation:
    backgroundColor: "rgb(255 254 249 / 0.96)"
    textColor: "{colors.jade-950}"
    rounded: "{rounded.surface}"
    padding: "0 18px 0 24px"
    height: "72px"
  stepper:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.jade-950}"
    rounded: "{rounded.pill}"
    height: "44px"
    width: "134px"
  ingredient-counter:
    backgroundColor: "{colors.jade-950}"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "18px 28px"
---

# Design System: Trà Sữa Ngon

## Overview

**Creative North Star: "Quầy Trà Ngọc Thủ Công"**

Trà Sữa Ngon mang cảm giác của một quầy trà Việt hiện đại được dựng từ giấy ngà lạnh, đá ngọc xanh và gỗ ấm. Hệ thống thân thiện, tươi và thủ công, nhưng mọi chi tiết vẫn phục vụ việc đọc giá, chọn tuỳ chỉnh và hoàn tất đơn nhanh trên màn hình cảm ứng.

Thị giác có nhịp rộng và giàu hình ảnh ở các điểm kể chuyện, sau đó trở nên gọn, đều và trực dụng trong các luồng vận hành. Quầy nguyên liệu jade, các vòng ly mảnh và chấm trân châu thưa là dấu hiệu nhận diện; đường viền nhẹ và mảng màu phẳng giữ giao diện sạch. Hệ thống loại bỏ gradient tím kiểu AI, glassmorphism, shadow nặng và các dãy card đồng hạng lặp lại.

**Key Characteristics:**

- Nền giấy ngà lạnh với bề mặt trắng kem, tạo độ ấm mà không ngả vàng.
- Jade đậm dựng cấu trúc, xanh trà tạo lớp dịu, cam quýt dành cho hành động quyết định.
- Display tròn, nặng và sít chữ cho thương hiệu; body rõ ràng, dễ đọc cho thao tác.
- Bố cục quầy trà bất đối xứng, xen các mảng ảnh lớn với cụm điều khiển chặt chẽ.
- Trạng thái chọn, focus, lỗi và giảm chuyển động luôn hiển thị rõ.

## Colors

Bảng màu lấy jade làm khung, giấy và trà nhạt làm nền, chỉ dùng cam quýt để tạo một điểm hành động ấm và rõ.

### Primary

- **Ngọc Rừng Sâu** (`colors.jade-950`): tiêu đề lớn, footer và các mảng thương hiệu có độ tương phản cao.
- **Ngọc Quầy Trà** (`colors.jade-900`): trạng thái chọn, huy hiệu giỏ hàng, nền kể chuyện và điều khiển chính không mang tính CTA.
- **Lá Trà Sáng** (`colors.jade-700`): liên kết hover, nhãn trạng thái và chi tiết phụ có tính tương tác.

### Secondary

- **Sương Ngọc** (`colors.jade-150`): hoạ tiết vòng ly và điểm trang trí xanh rất nhạt.
- **Nước Trà Non** (`colors.tea-100`): nền ảnh sản phẩm, trạng thái chọn nhẹ và hover của điều khiển phụ.

### Tertiary

- **Quýt Chín** (`colors.orange`): hành động chính và một điểm nhấn trân châu trong trạng thái trống.
- **Vỏ Quýt Rang** (`colors.orange-hover`): trạng thái hover của CTA chính.
- **Ánh Quýt** (`colors.focus`): vòng focus chung, luôn tách khỏi cả nền sáng lẫn jade.

### Neutral

- **Giấy Lạnh** (`colors.paper`): nền trang chung.
- **Men Kem** (`colors.surface`): card, trường nhập và các bề mặt nổi bằng màu.
- **Mực Trà** (`colors.ink`): nội dung chính và số liệu.
- **Mực Lá Nhạt** (`colors.muted`): mô tả, metadata và nội dung hỗ trợ.
- **Chỉ Ngọc** (`colors.line`): viền một pixel và divider.

**The One Mandarin Rule.** Cam quýt chỉ đánh dấu hành động quyết định hoặc một điểm nhấn trạng thái nhỏ; không dùng nó để phủ cả section hay cạnh tranh với jade.

**The Jade Structure Rule.** Jade mang cấu trúc, trạng thái chọn và nhận diện; không biến mọi bề mặt thành một mảng xanh đặc.

## Typography

**Display Font:** TSN Display với Trebuchet MS dự phòng
**Body Font:** Trebuchet MS với Segoe UI dự phòng
**Label Font:** Trebuchet MS với Segoe UI dự phòng

**Character:** Display có dáng tròn, đậm, hơi thủ công và dùng khoảng cách chữ âm để tạo wordmark chắc. Body giữ nhịp mở, ít kiểu chữ và ưu tiên khả năng quét nhanh trên tiếng Việt.

### Hierarchy

- **Display** (`typography.display`): dành cho hero và tiêu đề trang có vai trò nhận diện mạnh.
- **Headline** (`typography.headline`): dẫn section kể chuyện và các mốc điều hướng lớn.
- **Product Title** (`typography.product-title`): tên món trong card, đủ đậm để đi cùng ảnh và giá.
- **Body** (`typography.body`): mô tả, hướng dẫn và nội dung biểu mẫu; dòng đọc thường giới hạn khoảng 58 đến 62 ký tự.
- **Label** (`typography.label`): tag, nhãn điều khiển và metadata ngắn, dùng trọng lượng rất đậm thay vì viết hoa toàn bộ.

**The Heavy Headline Rule.** Display và tiêu đề dùng trọng lượng 900 cùng tracking âm; body không bắt chước độ nén đó.

## Layout

Hệ thống dùng hai khung desktop: header và hero tối đa 1400px, nội dung chính tối đa 1250px. Gutter mặc định là 16px mỗi bên, giảm còn 10px trên mobile. Khoảng cách section rộng, thường từ 76px đến 132px, trong khi nhóm điều khiển dùng nhịp 8px, 12px, 16px và 24px.

Desktop ưu tiên bất đối xứng: hero chia gần 48/52, sản phẩm nổi bật rộng hơn các món hỗ trợ, hình nguồn trà đi cạnh nội dung. Catalogue dùng ba cột, tablet dùng hai cột, còn mobile dưới 768px chuyển toàn bộ luồng sang một cột. Ở mobile, filter chip cuộn ngang, ảnh sản phẩm nằm trước cấu hình, cart và checkout trở thành luồng tuyến tính. Điều hướng chuyển sang menu gọn ở 850px trở xuống, và mọi control tương tác giữ chiều cao tối thiểu 44px.

## Elevation & Depth

Hệ thống phẳng theo mặc định. Chiều sâu chủ yếu đến từ tương phản giữa Giấy Lạnh, Men Kem và jade, cùng viền Chỉ Ngọc một pixel. Shadow xanh khuếch tán chỉ xuất hiện ở header, menu nổi, toast và vật thể cần tách khỏi nền; inset shadow được dành cho quầy nguyên liệu và khay gỗ để gợi vật liệu thật.

**The Flat by Default Rule.** Card nội dung đứng yên bằng màu và viền; shadow chỉ dành cho lớp nổi, phản hồi trạng thái hoặc vật thể có vai trò sân khấu.

## Shapes

Ngôn ngữ hình khối mềm nhưng có kỷ luật. Trường nhập và choice tile dùng góc 10px, khay danh mục dùng 14px, hầu hết card và bề mặt dùng 16px, còn hero dùng 18px ở cạnh trên. Pill 999px chỉ áp dụng cho button, filter chip, cart control và stepper.

Viền luôn mảnh, thường là một pixel màu Chỉ Ngọc. Chấm trân châu và swatch nguyên liệu dùng hình tròn; category tile dùng góc cắt nhẹ để gợi nhãn gỗ thủ công. Không trộn radius ngẫu nhiên trong cùng một họ component.

## Components

### Buttons

- **Shape:** pill hoàn toàn (`rounded.pill`), cao 50px và đủ rộng cho thao tác chạm.
- **Primary:** nền Quýt Chín, chữ kem sáng, padding ngang 24px và trọng lượng 900.
- **Hover / Focus / Active:** hover chuyển sang Vỏ Quýt Rang; active hạ 1px và co nhẹ; focus dùng outline Ánh Quýt 3px với offset 3px.
- **Secondary:** nền trong suốt, viền Ngọc Quầy Trà và chữ Ngọc Rừng Sâu; hover nhận nền Nước Trà Non.

### Chips

- **Style:** chip lọc cao 44px, pill, nền Men Kem, chữ Ngọc Rừng Sâu và viền Chỉ Ngọc.
- **State:** chip được chọn đổi đồng thời nền và viền sang Ngọc Quầy Trà, chữ sang Men Kem; danh sách chip cuộn ngang trên mobile.

### Cards / Containers

- **Corner Style:** bề mặt chính dùng góc 16px.
- **Background:** Men Kem trên nền Giấy Lạnh, đôi khi dùng Nước Trà Non sau ảnh sản phẩm.
- **Shadow Strategy:** phẳng ở trạng thái nghỉ, dựa vào viền một pixel; chỉ ảnh bên trong phóng nhẹ khi hover.
- **Internal Padding:** card nội dung dùng nhịp từ 18px đến 30px; summary dùng 24px.

### Inputs / Fields

- **Style:** nền Men Kem, chữ Mực Trà, viền xanh xám một pixel, góc 10px, cao tối thiểu 52px và padding 12px 14px.
- **Focus:** nhận outline Ánh Quýt toàn cục; chữ gợi ý giữ đủ tương phản bằng Mực Lá Nhạt.
- **Error / Disabled:** lỗi đổi viền sang đỏ đất và thêm inset line; button disabled chuyển xám xanh và bỏ cursor hành động.

### Navigation

Header là một hàng Men Kem gần đặc, cao tối thiểu 72px, góc 16px và shadow xanh rất nhẹ. Wordmark dùng TSN Display đậm ở bên trái, link nằm giữa, còn giỏ hàng là pill có badge jade. Dưới 850px, link desktop biến mất và menu mobile mở thành một panel dọc có control cao ít nhất 48px.

### Choice Tiles

Radio tile dùng góc 10px, chiều cao tối thiểu 60px và nội dung căn giữa. Trạng thái chọn dùng nền Nước Trà Non, viền Ngọc Quầy Trà và một inset line cùng màu, không dựa vào màu đơn lẻ để báo trạng thái.

### Ingredient Counter

Quầy nguyên liệu là signature component: một dải jade có ba nhóm thông tin, swatch tròn, divider trắng mờ và lớp inset tạo cảm giác mặt quầy. Trên mobile, dải này trở thành một panel dọc nằm chồng nhẹ lên sân khấu sản phẩm.

## Do's and Don'ts

### Do:

- **Do** dùng jade để dựng thứ bậc, trạng thái chọn và nhận diện xuyên suốt luồng mua hàng.
- **Do** giữ CTA chính màu cam quýt hiếm, rõ và có nhãn hành động cụ thể.
- **Do** xen một bề mặt hình ảnh lớn với các nhóm thông tin gọn thay vì lặp các card bằng nhau.
- **Do** giữ control chạm cao ít nhất 44px, focus nhìn thấy rõ và hỗ trợ reduced motion.
- **Do** dùng trạng thái lỗi, trống, loading và xác nhận có hướng dẫn trực tiếp.

### Don't:

- **Don't** dùng gradient tím kiểu AI, glassmorphism hoặc shadow đen nặng.
- **Don't** phủ cam lên section lớn hay dùng nhiều CTA cam cạnh tranh trong cùng một vùng.
- **Don't** biến mọi nội dung thành card hoặc lặp ba card đồng hạng như một công thức mặc định.
- **Don't** dùng pill cho card, trường nhập hoặc container nội dung.
- **Don't** đưa bằng chứng thương mại, testimonial hoặc số liệu không có nguồn vào giao diện.
