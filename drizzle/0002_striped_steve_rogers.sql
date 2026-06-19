CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`event` varchar(128) NOT NULL,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apiUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(16) NOT NULL,
	`tokensUsed` int NOT NULL DEFAULT 0,
	`responseTime` int NOT NULL DEFAULT 0,
	`status` int NOT NULL DEFAULT 200,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cachedResponses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hash` varchar(64) NOT NULL,
	`query` text NOT NULL,
	`response` text NOT NULL,
	`model` varchar(128) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`hitCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cachedResponses_id` PRIMARY KEY(`id`),
	CONSTRAINT `cachedResponses_hash_unique` UNIQUE(`hash`)
);
--> statement-breakpoint
CREATE TABLE `evolutionHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`capabilityId` int,
	`action` varchar(128) NOT NULL,
	`oldValue` json,
	`newValue` json,
	`result` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evolutionHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningModels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(64) NOT NULL,
	`data` json NOT NULL,
	`accuracy` varchar(32),
	`trainedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learningModels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(64) NOT NULL,
	`model` varchar(128) NOT NULL,
	`apiKey` varchar(512) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`priority` int NOT NULL DEFAULT 1,
	`costPerToken` varchar(32),
	`maxTokens` int NOT NULL DEFAULT 4096,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llmConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `researchSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(255) NOT NULL,
	`status` enum('active','completed','failed') NOT NULL DEFAULT 'active',
	`findings` json,
	`sources` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `researchSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` varchar(64) NOT NULL,
	`status` enum('active','cancelled','expired') NOT NULL DEFAULT 'active',
	`stripeSubscriptionId` varchar(255),
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`renewalDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
