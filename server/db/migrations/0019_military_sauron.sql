ALTER TABLE "solutions" DROP CONSTRAINT "solutions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "solutions" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;