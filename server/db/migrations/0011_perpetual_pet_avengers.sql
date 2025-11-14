CREATE TABLE "predefined_case_org_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "predefined_case_org_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_type" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predefined_case_sectors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "predefined_case_sectors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"case_sector" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cases" ADD COLUMN "sector" varchar NOT NULL;