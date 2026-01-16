ALTER TABLE "cases" ADD COLUMN "removed_at" timestamp;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "removed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "removed_at" timestamp;