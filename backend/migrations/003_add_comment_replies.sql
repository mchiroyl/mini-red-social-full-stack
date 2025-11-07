-- Add support for comment replies (nested comments)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES comments(id) ON DELETE CASCADE;

-- Add index for faster queries on replies
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
