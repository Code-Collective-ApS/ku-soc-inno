DROP INDEX "search_index";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "forgot_password_requested_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "search_index" ON "cases" USING gin ((
    setweight(to_tsvector('danish', "title"), 'A') ||
    setweight(to_tsvector('danish', "challenge_description"), 'B') ||
    setweight(to_tsvector('danish', "importance_description"), 'C')
  ));
