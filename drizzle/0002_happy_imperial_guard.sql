ALTER TABLE `posts` ADD `trashed_at` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `trashed_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_by` text;