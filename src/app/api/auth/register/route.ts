import { NextResponse } from 'next/server';
import { saveUser, getUserByEmail, User } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        // In a real app, hash the password!
        // For prototype, we're storing it plain (or just ignoring it for the mock object)
        // We'll store it in the user object for the mock login to work against
        const newUser: User & { password?: string } = {
            id: uuidv4(),
            name,
            email,
            role: 'student',
            // Storing password for prototype auth check
            password
        };

        await saveUser(newUser);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}
