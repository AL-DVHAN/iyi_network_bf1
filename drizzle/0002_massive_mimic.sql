CREATE TABLE `clan_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eaUsername` varchar(128) NOT NULL,
	`displayName` varchar(128),
	`platform` enum('pc','xbox','ps4') DEFAULT 'pc',
	`kd` decimal(6,2) DEFAULT 0,
	`playtimeHours` int DEFAULT 0,
	`kills` int DEFAULT 0,
	`deaths` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clan_members_id` PRIMARY KEY(`id`),
	CONSTRAINT `clan_members_eaUsername_unique` UNIQUE(`eaUsername`)
);
