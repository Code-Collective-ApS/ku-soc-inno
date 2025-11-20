CREATE TABLE "solution_cats" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "solution_cats_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"solution_category" varchar NOT NULL,
	"solution_id" integer
);
--> statement-breakpoint
DROP TABLE "predefined_solution_cats" CASCADE;--> statement-breakpoint
ALTER TABLE "solution_cats" ADD CONSTRAINT "solution_cats_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE no action ON UPDATE no action;