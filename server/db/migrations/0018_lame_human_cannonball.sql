ALTER TABLE "cases" DROP CONSTRAINT "cases_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cases" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_cats" ALTER COLUMN "solution_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;