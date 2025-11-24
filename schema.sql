-- Run this in your Neon SQL Editor to create the tables

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    branch TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    branch TEXT,
    category TEXT,
    urgency TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    student_name TEXT,
    student_email TEXT,
    status TEXT DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachments JSONB DEFAULT '[]',
    notes JSONB DEFAULT '[]'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_student_email ON complaints(student_email);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, name, email, password, role, branch)
VALUES 
    ('admin-1', 'Admin User', 'admin@brototype.com', 'admin123', 'admin', NULL),
    ('consultant-1', 'Consultant User', 'consultant@brototype.com', 'admin123', 'consultant', 'Kochi')
ON CONFLICT (email) DO NOTHING;
