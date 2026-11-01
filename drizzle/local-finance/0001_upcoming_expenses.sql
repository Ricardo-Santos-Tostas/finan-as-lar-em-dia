ALTER TABLE `local_finance_transactions` MODIFY COLUMN `type` enum('income','expense','upcoming') NOT NULL;
