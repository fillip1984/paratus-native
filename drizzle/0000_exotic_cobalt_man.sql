CREATE TABLE `activity` (
	`id` integer PRIMARY KEY NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`complete` integer DEFAULT false,
	`skipped` integer DEFAULT false,
	`routine_id` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `bloodPressureReading` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`systolic` integer NOT NULL,
	`diastolic` integer NOT NULL,
	`pulse` integer,
	`activity_id` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `routine` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`startDate` integer NOT NULL,
	`fromTime` text NOT NULL,
	`toTime` text NOT NULL,
	`endDate` integer,
	`repeat` integer DEFAULT false,
	`repeatEnds` integer DEFAULT false,
	`repeatCadence` text,
	`onComplete` text DEFAULT 'None' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scheduledDay` (
	`id` integer PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`selected` integer DEFAULT false NOT NULL,
	`routine_id` integer NOT NULL,
	FOREIGN KEY (`routine_id`) REFERENCES `routine`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weighIn` (
	`id` integer PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`weight` real NOT NULL,
	`bodyFatPercentage` real,
	`activity_id` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weightGoal` (
	`id` integer PRIMARY KEY NOT NULL,
	`weight` real NOT NULL,
	`activity_id` integer NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bloodPressureReading_activity_id_unique` ON `bloodPressureReading` (`activity_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `weighIn_activity_id_unique` ON `weighIn` (`activity_id`);