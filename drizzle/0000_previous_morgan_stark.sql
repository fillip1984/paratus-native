CREATE TABLE `routine` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`startDate` text NOT NULL,
	`fromTime` text NOT NULL,
	`toTime` text NOT NULL,
	`endDate` text,
	`repeat` integer DEFAULT false,
	`repeatEnds` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `scheduledDays` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`selected` integer DEFAULT false NOT NULL,
	`routine_id` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade
);
