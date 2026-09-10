CREATE TABLE `stripe_events` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_household_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`household_id` text NOT NULL,
	`token` text NOT NULL,
	`invited_email` text,
	`invited_by` text NOT NULL,
	`expires_at` integer NOT NULL,
	`accepted_at` integer,
	`accepted_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`household_id`) REFERENCES `households`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`accepted_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_household_invites`("id", "household_id", "token", "invited_email", "invited_by", "expires_at", "accepted_at", "accepted_by", "created_at") SELECT "id", "household_id", "token", "invited_email", "invited_by", "expires_at", "accepted_at", "accepted_by", "created_at" FROM `household_invites`;--> statement-breakpoint
DROP TABLE `household_invites`;--> statement-breakpoint
ALTER TABLE `__new_household_invites` RENAME TO `household_invites`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `household_invites_token_unique` ON `household_invites` (`token`);--> statement-breakpoint
CREATE INDEX `idx_household_invites_household` ON `household_invites` (`household_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_level_created_at` ON `audit_logs` (`level`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_created_at` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_source` ON `audit_logs` (`source`);--> statement-breakpoint
CREATE INDEX `idx_household_members_user` ON `household_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subscriptions_stripe_customer` ON `subscriptions` (`stripe_customer_id`);