ALTER TABLE `variants` ADD `on_hand` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `variants` ADD `reserved` integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX `variants_on_hand_idx` ON `variants` (`on_hand`);--> statement-breakpoint
CREATE INDEX `variants_reserved_idx` ON `variants` (`reserved`);