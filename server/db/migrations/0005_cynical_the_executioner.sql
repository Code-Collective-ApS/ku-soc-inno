ALTER TABLE "category_tags" DROP CONSTRAINT "category_tags_tag_unique";--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_title_unique" UNIQUE("title");