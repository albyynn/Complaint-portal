import { neon } from '@neondatabase/serverless';

// Configure Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Simple in-memory cache for user lookups (5 minute TTL)
const userCache = new Map<string, { user: User | null; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'consultant';
    branch?: string;
    password: string;
}

export interface Complaint {
    id: string;
    userId?: string;
    branch: string;
    category: string;
    urgency: string;
    subject: string;
    message: string;
    isAnonymous: boolean;
    studentName?: string;
    studentEmail?: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    createdAt: string;
    attachments: string[];
    notes: Note[];
}

export interface Note {
    id: string;
    author: string;
    message: string;
    visibleToStudent: boolean;
    date: string;
}

// USER OPERATIONS
export async function getUsers(): Promise<User[]> {
    try {
        const rows = await sql`
            SELECT id, name, email, role, branch, password 
            FROM users
        `;
        return rows as User[];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        // Check cache first
        const cached = userCache.get(email);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.user;
        }

        const rows = await sql`
            SELECT id, name, email, role, branch, password 
            FROM users 
            WHERE email = ${email} 
            LIMIT 1
        `;
        const user = rows[0] as User || null;

        // Cache the result
        userCache.set(email, { user, timestamp: Date.now() });

        return user;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return null;
    }
}

export async function saveUser(user: User): Promise<User> {
    try {
        await sql`
            INSERT INTO users (id, name, email, password, role, branch)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${user.password}, ${user.role}, ${user.branch || null})
            ON CONFLICT (email) DO UPDATE
            SET name = ${user.name}, password = ${user.password}, role = ${user.role}, branch = ${user.branch || null}
        `;

        // Invalidate cache for this email
        userCache.delete(user.email);

        return user;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
    }
}

// COMPLAINT OPERATIONS
export async function getComplaints(): Promise<Complaint[]> {
    try {
        const rows = await sql`
            SELECT *, 
                   attachments::text as attachments_json,
                   notes::text as notes_json
            FROM complaints 
            ORDER BY created_at DESC
        `;

        return rows.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            branch: row.branch,
            category: row.category,
            urgency: row.urgency,
            subject: row.subject,
            message: row.message,
            isAnonymous: row.is_anonymous,
            studentName: row.student_name,
            studentEmail: row.student_email,
            status: row.status,
            createdAt: row.created_at,
            attachments: JSON.parse(row.attachments_json || '[]'),
            notes: JSON.parse(row.notes_json || '[]')
        })) as Complaint[];
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
    }
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
    try {
        const rows = await sql`
            SELECT *, 
                   attachments::text as attachments_json,
                   notes::text as notes_json
            FROM complaints 
            WHERE id = ${id} 
            LIMIT 1
        `;

        if (rows.length === 0) return null;

        const row = rows[0] as any;
        return {
            id: row.id,
            userId: row.user_id,
            branch: row.branch,
            category: row.category,
            urgency: row.urgency,
            subject: row.subject,
            message: row.message,
            isAnonymous: row.is_anonymous,
            studentName: row.student_name,
            studentEmail: row.student_email,
            status: row.status,
            createdAt: row.created_at,
            attachments: JSON.parse(row.attachments_json || '[]'),
            notes: JSON.parse(row.notes_json || '[]')
        } as Complaint;
    } catch (error) {
        console.error('Error fetching complaint by ID:', error);
        return null;
    }
}

export async function saveComplaint(complaint: Complaint): Promise<Complaint> {
    try {
        const attachmentsJson = JSON.stringify(complaint.attachments || []);
        const notesJson = JSON.stringify(complaint.notes || []);

        await sql`
            INSERT INTO complaints (
                id, user_id, branch, category, urgency, subject, message,
                is_anonymous, student_name, student_email, status,
                created_at, attachments, notes
            )
            VALUES (
                ${complaint.id}, ${complaint.userId || null}, ${complaint.branch},
                ${complaint.category}, ${complaint.urgency}, ${complaint.subject},
                ${complaint.message}, ${complaint.isAnonymous}, ${complaint.studentName || null},
                ${complaint.studentEmail || null}, ${complaint.status}, ${complaint.createdAt},
                ${attachmentsJson}::jsonb, ${notesJson}::jsonb
            )
        `;

        return complaint;
    } catch (error) {
        console.error('Error saving complaint:', error);
        throw error;
    }
}

export async function updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    try {
        // First get existing complaint
        const existing = await getComplaintById(id);
        if (!existing) return null;

        // Merge updates
        const updated = { ...existing, ...updates };
        const notesJson = JSON.stringify(updated.notes || []);

        await sql`
            UPDATE complaints
            SET status = ${updated.status},
                notes = ${notesJson}::jsonb
            WHERE id = ${id}
        `;

        return updated;
    } catch (error) {
        console.error('Error updating complaint:', error);
        return null;
    }
}

export async function deleteComplaint(id: string): Promise<boolean> {
    try {
        await sql`DELETE FROM complaints WHERE id = ${id}`;
        return true;
    } catch (error) {
        console.error('Error deleting complaint:', error);
        return false;
    }
}
