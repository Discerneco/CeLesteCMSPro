ALTER TABLE `sites` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `sites_slug_unique` ON `sites` (`slug`);