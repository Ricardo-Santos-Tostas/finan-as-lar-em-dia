CREATE TABLE `local_finance_categories` (
	`id` varchar(128) NOT NULL,
	`label` varchar(32) NOT NULL,
	`type` enum('expense') NOT NULL DEFAULT 'expense',
	`color` varchar(16) NOT NULL,
	`icon` varchar(8) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `local_finance_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `local_finance_categories_label_uq` UNIQUE(`label`)
);
--> statement-breakpoint
CREATE TABLE `local_finance_transactions` (
	`id` varchar(36) NOT NULL,
	`description` varchar(80) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`category_id` varchar(128) NOT NULL,
	`date` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `local_finance_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `local_finance_transactions_date_idx` ON `local_finance_transactions` (`date`);