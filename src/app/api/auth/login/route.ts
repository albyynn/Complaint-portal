import { NextResponse } from 'next/server';
import { User, getUserByEmail } from '@/lib/db';

// Mock users for prototype (Admin/Consultant)
const MOCK_ADMINS: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@brototype.com', role: 'admin', password: 'admin123' },
    { id: '2', name: 'Consultant User', email: 'consultant@brototype.com', role: 'consultant', branch: 'Kochi', password: 'admin123' },
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 1. Check Mock Admins
        const adminUser = MOCK_ADMINS.find(u => u.email === email && u.password === password);
        if (adminUser) {
            const { password: _, ...safeUser } = adminUser;
            return NextResponse.json({ user: safeUser });
        }

        // 2. Check Registered Students
        const dbUser = await getUserByEmail(email);
        if (dbUser && dbUser.password === password) {
            const { password: _, ...safeUser } = dbUser;
            return NextResponse.json({ user: safeUser });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
