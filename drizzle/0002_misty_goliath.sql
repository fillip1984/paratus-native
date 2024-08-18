CREATE TABLE `todo` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`text` text NOT NULL,
	`complete` integer DEFAULT false
);
