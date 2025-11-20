ALTER TABLE "predefined_solution_cats" ADD COLUMN "solution_id" integer;--> statement-breakpoint
ALTER TABLE "predefined_solution_cats" ADD CONSTRAINT "predefined_solution_cats_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" DROP COLUMN "solution_category";