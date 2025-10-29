ALTER TABLE "file_uploads" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;
