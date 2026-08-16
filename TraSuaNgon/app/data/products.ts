import type { CategoryId, Product, ToppingOption } from "../types";

export const categories: Array<{ id: "all" | CategoryId; label: string; description: string }> = [
  { id: "all", label: "Tất cả", description: "Toàn bộ món đang có" },
  { id: "milk-tea", label: "Trà sữa", description: "Đậm trà, béo vừa" },
  { id: "fruit-tea", label: "Trà trái cây", description: "Tươi mát, thơm quả" },
  { id: "macchiato", label: "Macchiato", description: "Lớp kem mịn, vị trà rõ" },
  { id: "topping", label: "Topping", description: "Thêm vui cho từng ly" },
];

export const toppings: ToppingOption[] = [
  { id: "pearl", name: "Trân châu đen", price: 7000 },
  { id: "white-pearl", name: "Trân châu trắng", price: 8000 },
  { id: "pudding", name: "Pudding trứng", price: 9000 },
  { id: "jelly", name: "Thạch nha đam", price: 7000 },
  { id: "cream", name: "Kem sữa", price: 10000 },
];

export const products: Product[] = [
  { id: "p1", slug: "tra-sua-duong-den", name: "Trà Sữa Đường Đen", category: "milk-tea", price: 39000, description: "Trà Assam đậm vị, sữa tươi và đường đen nấu chậm.", ingredients: "Trà Assam, sữa tươi, đường đen", tags: ["Bán chạy"], popularity: 98, image: "/images/hero-brown-sugar.png", imagePosition: "50% 50%", tone: "milk" },
  { id: "p2", slug: "tra-sua-oolong-nuong", name: "Trà Sữa Oolong Nướng", category: "milk-tea", price: 42000, description: "Hương oolong rang nhẹ, hậu trà sâu và béo thanh.", ingredients: "Trà oolong, sữa, đường mía", tags: [], popularity: 88, image: "/images/product-lineup.png", imagePosition: "15% 50%", tone: "milk" },
  { id: "p3", slug: "tra-sua-khoai-mon", name: "Trà Sữa Khoai Môn", category: "milk-tea", price: 43000, description: "Khoai môn bùi mịn quyện cùng nền trà lài dịu.", ingredients: "Trà lài, khoai môn, sữa", tags: ["Mới"], popularity: 75, image: "/images/product-lineup.png", imagePosition: "92% 50%", tone: "purple" },
  { id: "p4", slug: "tra-dao-cam-sa", name: "Trà Đào Cam Sả", category: "fruit-tea", price: 42000, description: "Đào thơm, cam mọng và sả tươi cho vị chua ngọt sáng.", ingredients: "Trà đen, đào, cam, sả", tags: ["Bán chạy"], popularity: 94, image: "/images/product-lineup.png", imagePosition: "38% 50%", tone: "orange" },
  { id: "p5", slug: "tra-vai-hoa-nhai", name: "Trà Vải Hoa Nhài", category: "fruit-tea", price: 44000, description: "Vải giòn ngọt trên nền trà nhài thơm trong trẻo.", ingredients: "Trà nhài, vải, chanh vàng", tags: ["Mới"], popularity: 81, image: "/images/product-lineup.png", imagePosition: "37% 50%", tone: "orange" },
  { id: "p6", slug: "tra-chanh-day", name: "Trà Chanh Dây", category: "fruit-tea", price: 38000, description: "Chanh dây tươi, trà xanh và một chút mật ong.", ingredients: "Trà xanh, chanh dây, mật ong", tags: [], popularity: 78, image: "/images/product-lineup.png", imagePosition: "40% 50%", tone: "orange" },
  { id: "p7", slug: "matcha-macchiato", name: "Matcha Macchiato", category: "macchiato", price: 45000, description: "Matcha thanh đắng phủ kem sữa mằn mặn, mịn nhẹ.", ingredients: "Matcha, sữa tươi, kem sữa", tags: ["Bán chạy"], popularity: 91, image: "/images/product-lineup.png", imagePosition: "66% 50%", tone: "green" },
  { id: "p8", slug: "oolong-macchiato", name: "Oolong Macchiato", category: "macchiato", price: 43000, description: "Trà oolong thơm rang và lớp kem sữa đánh mới.", ingredients: "Trà oolong, kem sữa", tags: [], popularity: 73, image: "/images/product-lineup.png", imagePosition: "62% 50%", tone: "green" },
  { id: "p9", slug: "tra-xanh-nho", name: "Trà Xanh Nho", category: "fruit-tea", price: 46000, description: "Nho xanh giòn, trà xanh mát và thạch nha đam.", ingredients: "Trà xanh, nho, nha đam", tags: ["Mới"], popularity: 84, image: "/images/product-lineup.png", imagePosition: "65% 50%", tone: "green" },
  { id: "t1", slug: "tran-chau-den", name: "Trân Châu Đen", category: "topping", price: 7000, description: "Nấu mới mỗi ngày, dai mềm và thơm đường nâu.", ingredients: "Bột năng, đường nâu", tags: ["Bán chạy"], popularity: 97, image: "/images/about-tea.png", imagePosition: "72% 55%", tone: "milk" },
  { id: "t2", slug: "pudding-trung", name: "Pudding Trứng", category: "topping", price: 9000, description: "Mềm mịn, ngọt dịu, hợp với mọi nền trà sữa.", ingredients: "Trứng, sữa, vani", tags: [], popularity: 70, image: "/images/about-tea.png", imagePosition: "50% 55%", tone: "orange" },
  { id: "t3", slug: "thach-nha-dam", name: "Thạch Nha Đam", category: "topping", price: 7000, description: "Giòn mát, vị thanh, dùng ngon với trà trái cây.", ingredients: "Nha đam, đường phèn", tags: [], popularity: 68, image: "/images/about-tea.png", imagePosition: "35% 55%", tone: "green" }
];

export const formatVnd = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
