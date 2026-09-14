CREATE TABLE `payment_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`environment` text NOT NULL,
	`merchant_reference` text NOT NULL,
	`provider_transaction_id` text,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'VND' NOT NULL,
	`checkout_url` text,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payment_attempts_provider_merchant_ref` ON `payment_attempts` (`provider`,`merchant_reference`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payment_attempts_provider_transaction` ON `payment_attempts` (`provider`,`provider_transaction_id`);
--> statement-breakpoint
CREATE INDEX `idx_payment_attempts_order_created` ON `payment_attempts` (`order_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `idx_payment_attempts_status_updated` ON `payment_attempts` (`status`,`updated_at`);
--> statement-breakpoint
CREATE TABLE `payment_webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_event_id` text NOT NULL,
	`payment_attempt_id` text,
	`payload_hash` text NOT NULL,
	`signature_valid` integer NOT NULL,
	`processing_status` text NOT NULL,
	`failure_code` text,
	`received_at` text NOT NULL,
	`processed_at` text,
	FOREIGN KEY (`payment_attempt_id`) REFERENCES `payment_attempts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_payment_webhook_provider_event` ON `payment_webhook_events` (`provider`,`provider_event_id`);
--> statement-breakpoint
CREATE INDEX `idx_payment_webhook_attempt_received` ON `payment_webhook_events` (`payment_attempt_id`,`received_at`);
