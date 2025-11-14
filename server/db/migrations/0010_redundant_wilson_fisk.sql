ALTER TABLE "file_uploads" ALTER COLUMN "mime_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_attachments" ALTER COLUMN "solution_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_attachments" ALTER COLUMN "file_upload_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_illustrations" ALTER COLUMN "solution_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_illustrations" ALTER COLUMN "file_upload_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_pdfs" ALTER COLUMN "solution_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_pdfs" ALTER COLUMN "file_upload_id" SET NOT NULL;