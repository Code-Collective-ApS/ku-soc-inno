CREATE INDEX IF NOT EXISTS "search_index" ON "cases" USING gin ((setweight(to_tsvector('danish', "title"), 'A') ||
    setweight(to_tsvector('danish', "challenge_description"), 'B') ||
    setweight(to_tsvector('danish', "importance_description"), 'C')));
