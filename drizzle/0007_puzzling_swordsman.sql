ALTER TABLE `sites` ADD `generation_mode` text DEFAULT 'dynamic' NOT NULL;--> statement-breakpoint
ALTER TABLE `sites` ADD `optimization_settings` text;--> statement-breakpoint
ALTER TABLE `sites` ADD `deployment_settings` text;