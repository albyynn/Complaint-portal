import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function initDatabase() {
    try {
        console.log('Creating tables...');

        // Create users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                branch TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✓ Users table created');

        // Create complaints table
        await sql`
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
            )
        `;
        console.log('✓ Complaints table created');

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_complaints_student_email ON complaints(student_email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC)`;
        console.log('✓ Indexes created');

        // Insert default users
        await sql`
            INSERT INTO users (id, name, email, password, role, branch)
            VALUES 
                ('admin-1', 'Admin User', 'admin@brototype.com', 'admin123', 'admin', NULL),
                ('consultant-1', 'Consultant User', 'consultant@brototype.com', 'admin123', 'consultant', 'Kochi')
            ON CONFLICT (email) DO NOTHING
        `;
        console.log('✓ Default admin users created');

        console.log('\n✅ Database initialized successfully!');
        console.log('\nYou can now:');
        console.log('- Log in with: admin@brototype.com / admin123');
        console.log('- Or register a new student account');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
