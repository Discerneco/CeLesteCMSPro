CREATE TABLE `post_autosaves` (
	`post_id` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`slug` text,
	`content` text,
	`excerpt` text,
	`meta_data` text,
	`featured_image_id` text,
	`status` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`post_id`, `user_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);