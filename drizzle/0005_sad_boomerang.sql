CREATE TABLE `sites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`description` text,
	`default_template_id` text,
	`settings` text,
	`build_status` text DEFAULT 'idle',
	`last_build_at` integer,
	`build_log` text,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`default_template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `template_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`component_name` text NOT NULL,
	`schema` text,
	`preview_image` text,
	`category` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`advanced_config` text,
	`visual_builder_state` text,
	`type` text DEFAULT 'page',
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);--> statement-breakpoint
ALTER TABLE `pages` ADD `template_id` text REFERENCES templates(id);--> statement-breakpoint
ALTER TABLE `pages` ADD `sections_data` text;