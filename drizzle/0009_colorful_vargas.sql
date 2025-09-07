CREATE TABLE `plugin_installations` (
	`id` text PRIMARY KEY NOT NULL,
	`plugin_id` text NOT NULL,
	`user_id` text NOT NULL,
	`site_id` text,
	`version` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`config` text,
	`installed_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_used_at` integer,
	FOREIGN KEY (`plugin_id`) REFERENCES `plugins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plugin_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`plugin_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`review` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`plugin_id`) REFERENCES `plugins`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plugins` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`version` text NOT NULL,
	`author` text NOT NULL,
	`author_email` text,
	`author_url` text,
	`homepage` text,
	`repository` text,
	`category` text DEFAULT 'other' NOT NULL,
	`tags` text NOT NULL,
	`features` text NOT NULL,
	`price` text DEFAULT 'Free' NOT NULL,
	`is_premium` integer DEFAULT false NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`downloads` integer DEFAULT 0 NOT NULL,
	`min_version` text,
	`max_version` text,
	`dependencies` text NOT NULL,
	`config` text,
	`manifest` text,
	`files` text,
	`permissions` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plugins_slug_unique` ON `plugins` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sites` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`domain` text,
	`description` text,
	`default_template_id` text,
	`settings` text,
	`build_status` text DEFAULT 'idle',
	`last_build_at` integer,
	`build_log` text,
	`is_default` integer DEFAULT false NOT NULL,
	`generation_mode` text DEFAULT 'dynamic' NOT NULL,
	`optimization_settings` text,
	`deployment_settings` text,
	`languages` text NOT NULL,
	`default_language` text DEFAULT 'en' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`default_template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_sites`("id", "name", "slug", "domain", "description", "default_template_id", "settings", "build_status", "last_build_at", "build_log", "is_default", "generation_mode", "optimization_settings", "deployment_settings", "languages", "default_language", "created_at", "updated_at") SELECT "id", "name", "slug", "domain", "description", "default_template_id", "settings", "build_status", "last_build_at", "build_log", "is_default", "generation_mode", "optimization_settings", "deployment_settings", "languages", "default_language", "created_at", "updated_at" FROM `sites`;--> statement-breakpoint
DROP TABLE `sites`;--> statement-breakpoint
ALTER TABLE `__new_sites` RENAME TO `sites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `sites_slug_unique` ON `sites` (`slug`);