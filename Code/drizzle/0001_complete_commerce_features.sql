ALTER TABLE `orders` ADD `idempotency_key` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_idempotency_key` ON `orders` (`idempotency_key`);
--> statement-breakpoint
CREATE TABLE `catalogue_categories` (
  `id` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text NOT NULL,
  `sort_order` integer DEFAULT 0 NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `catalogue_products` (
  `id` text PRIMARY KEY NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `category_id` text NOT NULL,
  `base_price` integer NOT NULL,
  `description` text NOT NULL,
  `ingredients` text NOT NULL,
  `tags_json` text DEFAULT '[]' NOT NULL,
  `popularity` integer DEFAULT 0 NOT NULL,
  `image` text NOT NULL,
  `image_position` text DEFAULT '50% 50%' NOT NULL,
  `tone` text DEFAULT 'milk' NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_catalogue_products_slug` ON `catalogue_products` (`slug`);
--> statement-breakpoint
CREATE INDEX `idx_catalogue_products_category` ON `catalogue_products` (`category_id`);
--> statement-breakpoint
CREATE TABLE `catalogue_toppings` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `price` integer NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `promotions` (
  `id` text PRIMARY KEY NOT NULL,
  `product_id` text NOT NULL,
  `label` text NOT NULL,
  `sale_price` integer NOT NULL,
  `starts_at` text NOT NULL,
  `ends_at` text NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_promotions_product` ON `promotions` (`product_id`);
--> statement-breakpoint
CREATE INDEX `idx_promotions_window` ON `promotions` (`is_active`,`starts_at`,`ends_at`);
--> statement-breakpoint
CREATE TABLE `feedback` (
  `id` text PRIMARY KEY NOT NULL,
  `full_name` text NOT NULL,
  `contact` text NOT NULL,
  `subject` text NOT NULL,
  `message` text NOT NULL,
  `status` text DEFAULT 'new' NOT NULL,
  `client_request_id` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_feedback_client_request` ON `feedback` (`client_request_id`);
--> statement-breakpoint
CREATE INDEX `idx_feedback_status_created` ON `feedback` (`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `reviews` (
  `id` text PRIMARY KEY NOT NULL,
  `product_id` text NOT NULL,
  `reviewer_name` text NOT NULL,
  `rating` integer NOT NULL,
  `comment` text NOT NULL,
  `owner_token_hash` text NOT NULL,
  `status` text DEFAULT 'visible' NOT NULL,
  `client_request_id` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reviews_client_request` ON `reviews` (`client_request_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_reviews_owner_product` ON `reviews` (`owner_token_hash`,`product_id`);
--> statement-breakpoint
CREATE INDEX `idx_reviews_product_status` ON `reviews` (`product_id`,`status`,`created_at`);
--> statement-breakpoint
INSERT INTO `catalogue_categories` (`id`,`label`,`description`,`sort_order`,`is_active`,`updated_at`) VALUES
('milk-tea','Trà sữa','Đậm trà, béo vừa',1,1,'2026-09-13T00:00:00.000Z'),
('fruit-tea','Trà trái cây','Tươi mát, thơm quả',2,1,'2026-09-13T00:00:00.000Z'),
('macchiato','Macchiato','Lớp kem mịn, vị trà rõ',3,1,'2026-09-13T00:00:00.000Z'),
('topping','Topping','Thêm vui cho từng ly',4,1,'2026-09-13T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO `catalogue_toppings` (`id`,`name`,`price`,`is_active`,`updated_at`) VALUES
('pearl','Trân châu đen',7000,1,'2026-09-13T00:00:00.000Z'),
('white-pearl','Trân châu trắng',8000,1,'2026-09-13T00:00:00.000Z'),
('pudding','Pudding trứng',9000,1,'2026-09-13T00:00:00.000Z'),
('jelly','Thạch nha đam',7000,1,'2026-09-13T00:00:00.000Z'),
('cream','Kem sữa',10000,1,'2026-09-13T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO `catalogue_products` (`id`,`slug`,`name`,`category_id`,`base_price`,`description`,`ingredients`,`tags_json`,`popularity`,`image`,`image_position`,`tone`,`is_active`,`created_at`,`updated_at`) VALUES
('p1','tra-sua-duong-den','Trà Sữa Đường Đen','milk-tea',39000,'Trà Assam đậm vị, sữa tươi và đường đen nấu chậm.','Trà Assam, sữa tươi, đường đen','["Bán chạy"]',98,'/images/hero-brown-sugar.png','50% 50%','milk',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p2','tra-sua-oolong-nuong','Trà Sữa Oolong Nướng','milk-tea',42000,'Hương oolong rang nhẹ, hậu trà sâu và béo thanh.','Trà oolong, sữa, đường mía','[]',88,'/images/product-lineup.png','15% 50%','milk',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p3','tra-sua-khoai-mon','Trà Sữa Khoai Môn','milk-tea',43000,'Khoai môn bùi mịn quyện cùng nền trà lài dịu.','Trà lài, khoai môn, sữa','["Mới"]',75,'/images/product-lineup.png','92% 50%','purple',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p4','tra-dao-cam-sa','Trà Đào Cam Sả','fruit-tea',42000,'Đào thơm, cam mọng và sả tươi cho vị chua ngọt sáng.','Trà đen, đào, cam, sả','["Bán chạy"]',94,'/images/product-lineup.png','38% 50%','orange',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p5','tra-vai-hoa-nhai','Trà Vải Hoa Nhài','fruit-tea',44000,'Vải giòn ngọt trên nền trà nhài thơm trong trẻo.','Trà nhài, vải, chanh vàng','["Mới"]',81,'/images/product-lineup.png','37% 50%','orange',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p6','tra-chanh-day','Trà Chanh Dây','fruit-tea',38000,'Chanh dây tươi, trà xanh và một chút mật ong.','Trà xanh, chanh dây, mật ong','[]',78,'/images/product-lineup.png','40% 50%','orange',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p7','matcha-macchiato','Matcha Macchiato','macchiato',45000,'Matcha thanh đắng phủ kem sữa mằn mặn, mịn nhẹ.','Matcha, sữa tươi, kem sữa','["Bán chạy"]',91,'/images/product-lineup.png','66% 50%','green',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p8','oolong-macchiato','Oolong Macchiato','macchiato',43000,'Trà oolong thơm rang và lớp kem sữa đánh mới.','Trà oolong, kem sữa','[]',73,'/images/product-lineup.png','62% 50%','green',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('p9','tra-xanh-nho','Trà Xanh Nho','fruit-tea',46000,'Nho xanh giòn, trà xanh mát và thạch nha đam.','Trà xanh, nho, nha đam','["Mới"]',84,'/images/product-lineup.png','65% 50%','green',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('t1','tran-chau-den','Trân Châu Đen','topping',7000,'Nấu mới mỗi ngày, dai mềm và thơm đường nâu.','Bột năng, đường nâu','["Bán chạy"]',97,'/images/about-tea.png','72% 55%','milk',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('t2','pudding-trung','Pudding Trứng','topping',9000,'Mềm mịn, ngọt dịu, hợp với mọi nền trà sữa.','Trứng, sữa, vani','[]',70,'/images/about-tea.png','50% 55%','orange',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z'),
('t3','thach-nha-dam','Thạch Nha Đam','topping',7000,'Giòn mát, vị thanh, dùng ngon với trà trái cây.','Nha đam, đường phèn','[]',68,'/images/about-tea.png','35% 55%','green',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO `promotions` (`id`,`product_id`,`label`,`sale_price`,`starts_at`,`ends_at`,`is_active`,`created_at`,`updated_at`) VALUES
('promo-tra-dao-2026','p4','Ưu đãi mùa trà',37000,'2026-01-01T00:00:00.000Z','2027-12-31T23:59:59.999Z',1,'2026-09-13T00:00:00.000Z','2026-09-13T00:00:00.000Z');
--> statement-breakpoint
PRAGMA optimize;
