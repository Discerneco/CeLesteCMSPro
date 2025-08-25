PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`excerpt` text,
	`featured_image_id` text,
	`author_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`published_at` integer,
	`trashed_at` integer,
	`trashed_by` text,
	`meta_data` text,
	FOREIGN KEY (`featured_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`trashed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pages`("id", "title", "slug", "content", "excerpt", "featured_image_id", "author_id", "status", "created_at", "updated_at", "published_at", "trashed_at", "trashed_by", "meta_data") SELECT "id", "title", "slug", "content", "excerpt", "featured_image_id", "author_id", "status", "created_at", "updated_at", "published_at", "trashed_at", "trashed_by", "meta_data" FROM `pages`;--> statement-breakpoint
DROP TABLE `pages`;--> statement-breakpoint
ALTER TABLE `__new_pages` RENAME TO `pages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);