-- Create quiz_progress table for Professor Playtime Quiz Factory

CREATE TABLE IF NOT EXISTS quiz_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    quiz_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only access their own progress
CREATE POLICY "Users can access own progress" ON quiz_progress
    FOR ALL USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_quiz_progress_user_id ON quiz_progress(user_id);
CREATE INDEX idx_quiz_progress_timestamp ON quiz_progress(timestamp DESC);

-- Grant permissions
GRANT ALL ON quiz_progress TO authenticated;
GRANT ALL ON quiz_progress TO anon;
