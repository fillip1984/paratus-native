CREATE TABLE `note` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`body` text NOT NULL,
	`activity_id` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `note_activity_id_unique` ON `note` (`activity_id`);