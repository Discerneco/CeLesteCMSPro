ALTER TABLE `sites` ADD `languages` text DEFAULT '["en"]' NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `default_language` text DEFAULT 'en' NOT NULL;