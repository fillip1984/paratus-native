CREATE TABLE `day` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`selected` integer
);
--> statement-breakpoint
ALTER TABLE routine ADD `startDate` text NOT NULL;--> statement-breakpoint
ALTER TABLE routine ADD `fromTime` text NOT NULL;--> statement-breakpoint
ALTER TABLE routine ADD `toTime` text NOT NULL;--> statement-breakpoint
ALTER TABLE routine ADD `endDate` text;--> statement-breakpoint
ALTER TABLE routine ADD `neverEnds` integer DEFAULT false;