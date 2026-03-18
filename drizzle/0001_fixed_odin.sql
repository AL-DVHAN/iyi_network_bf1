CREATE TABLE `ban_appeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`banId` int NOT NULL,
	`eaUsername` varchar(128) NOT NULL,
	`message` text NOT NULL,
	`contactEmail` varchar(320),
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `ban_appeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ban_list` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eaUsername` varchar(128) NOT NULL,
	`reason` text NOT NULL,
	`bannedBy` int,
	`bannedByName` varchar(128),
	`banType` enum('permanent','temporary') NOT NULL DEFAULT 'permanent',
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ban_list_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `challenge_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challengeId` int NOT NULL,
	`userId` int NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	`proofUrl` text,
	CONSTRAINT `challenge_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`stripeSessionId` varchar(256),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'TRY',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`durationDays` int DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `donations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`guestName` varchar(128),
	`guestEmail` varchar(320),
	`type` enum('suggestion','complaint','report','other') NOT NULL,
	`subject` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`attachmentUrls` json DEFAULT ('[]'),
	`discordSent` boolean NOT NULL DEFAULT false,
	`status` enum('open','in_review','resolved','closed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eaUsername` varchar(128) NOT NULL,
	`month` varchar(7) NOT NULL,
	`kills` int DEFAULT 0,
	`deaths` int DEFAULT 0,
	`playtimeHours` int DEFAULT 0,
	`score` int DEFAULT 0,
	`kd` decimal(6,2),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pro_tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemType` enum('weapon','vehicle') NOT NULL,
	`itemName` varchar(256) NOT NULL,
	`authorId` int NOT NULL,
	`authorName` varchar(128),
	`content` text NOT NULL,
	`likes` int NOT NULL DEFAULT 0,
	`isApproved` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pro_tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `server_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playerCount` int DEFAULT 0,
	`maxPlayers` int DEFAULT 64,
	`queueCount` int DEFAULT 0,
	`currentMap` varchar(256),
	`mapImage` text,
	`team1Score` int DEFAULT 0,
	`team2Score` int DEFAULT 0,
	`team1Name` varchar(128),
	`team2Name` varchar(128),
	`activeAdmin` varchar(128),
	`hasAdmin` boolean DEFAULT false,
	`serverName` varchar(256),
	`gameMode` varchar(64),
	`roundTime` int DEFAULT 0,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `server_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`type` enum('kills','revives','playtime','headshots','wins','custom') NOT NULL,
	`targetValue` int NOT NULL,
	`rewardPoints` int NOT NULL DEFAULT 100,
	`rewardBadge` varchar(128),
	`weekStart` timestamp NOT NULL,
	`weekEnd` timestamp NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `eaUsername` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `eaVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `eaPlatform` enum('pc','xbox','ps4') DEFAULT 'pc';--> statement-breakpoint
ALTER TABLE `users` ADD `isDonator` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `donatorBadge` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `nameColor` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `donatorExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `points` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `badges` json DEFAULT ('[]');