CREATE TABLE `admin_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`before_json` text,
	`after_json` text,
	`request_id` text,
	`network_fingerprint` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_admin_audit_logs_entity` ON `admin_audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_logs_admin_id` ON `admin_audit_logs` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_admin_audit_logs_created_at` ON `admin_audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `admin_login_attempts` (
	`key_hash` text PRIMARY KEY NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`window_started_at` text NOT NULL,
	`blocked_until` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_admin_login_attempts_updated_at` ON `admin_login_attempts` (`updated_at`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`csrf_token_hash` text NOT NULL,
	`admin_id` text NOT NULL,
	`created_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_sessions_token_hash` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_admin_id` ON `admin_sessions` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_admin_sessions_expires_at` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`login_name` text NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`last_login_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admin_users_login_name` ON `admin_users` (`login_name`);--> statement-breakpoint
CREATE TABLE `order_item_toppings` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text NOT NULL,
	`topping_id` text NOT NULL,
	`topping_name` text NOT NULL,
	`unit_price` integer NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_order_item_toppings_item_id` ON `order_item_toppings` (`order_item_id`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_name` text NOT NULL,
	`unit_price` integer NOT NULL,
	`size` text NOT NULL,
	`sugar` text NOT NULL,
	`ice` text NOT NULL,
	`quantity` integer NOT NULL,
	`line_total` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_order_items_order_id` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`actor_admin_id` text,
	`reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_order_status_history_order_id` ON `order_status_history` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_order_status_history_created_at` ON `order_status_history` (`created_at`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_code` text NOT NULL,
	`customer_id` text,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`delivery_address` text NOT NULL,
	`subtotal` integer NOT NULL,
	`discount_amount` integer DEFAULT 0 NOT NULL,
	`shipping_fee` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`order_status` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`confirmed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_orders_order_code` ON `orders` (`order_code`);--> statement-breakpoint
CREATE INDEX `idx_orders_created_at` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_status_created_at` ON `orders` (`order_status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_orders_phone` ON `orders` (`phone`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`payment_method` text NOT NULL,
	`provider` text NOT NULL,
	`payment_status` text NOT NULL,
	`amount_due` integer NOT NULL,
	`amount_paid` integer DEFAULT 0 NOT NULL,
	`transaction_reference` text,
	`message` text NOT NULL,
	`paid_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payments_order_id` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `idx_payments_status_method` ON `payments` (`payment_status`,`payment_method`);--> statement-breakpoint
PRAGMA optimize;
