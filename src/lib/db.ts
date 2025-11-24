import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'consultant';
    branch?: string;
    password?: string;
}

// In-memory cache
let usersCache: User[] | null = null;
let complaintsCache: Complaint[] | null = null;

async function ensureFile(filePath: string, defaultData: any) {
    try {
        await fs.access(filePath);
    } catch {
        await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
}

export async function getUsers(): Promise<User[]> {
    if (usersCache) return usersCache;

    await ensureFile(USERS_FILE, []);
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    usersCache = JSON.parse(data);
    return usersCache!;
}

export async function saveUser(user: User) {
    const users = await getUsers();
    users.push(user);
    // Update cache
    usersCache = users;
    // Write to file asynchronously to not block response
    fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    return user;
}

export async function getUserByEmail(email: string) {
    const users = await getUsers();
    return users.find((u) => u.email === email) || null;
}

export async function getComplaints(): Promise<Complaint[]> {
    if (complaintsCache) return complaintsCache;

    // Only check file if cache is empty
    try {
        await fs.access(COMPLAINTS_FILE);
    } catch {
        await fs.writeFile(COMPLAINTS_FILE, '[]');
        complaintsCache = [];
        return [];
    }

    const data = await fs.readFile(COMPLAINTS_FILE, 'utf-8');
    let complaints = JSON.parse(data) as Complaint[];

    // Sort by createdAt descending (newest first)
    complaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    complaintsCache = complaints;
    return complaintsCache!;
}

export async function saveComplaint(complaint: Complaint) {
    // Ensure cache is loaded
    if (!complaintsCache) {
        await getComplaints();
    }

    // Update cache immediately
    complaintsCache!.unshift(complaint);

    // Fire-and-forget write (don't await)
    fs.writeFile(COMPLAINTS_FILE, JSON.stringify(complaintsCache, null, 2)).catch(err => {
        console.error("Failed to write complaints file:", err);
    });

    return complaint;
}

export async function updateComplaint(id: string, updates: Partial<Complaint>) {
    // Ensure cache is loaded
    if (!complaintsCache) {
        await getComplaints();
    }

    const index = complaintsCache!.findIndex((c) => c.id === id);
    if (index === -1) return null;

    complaintsCache![index] = { ...complaintsCache![index], ...updates };

    // Fire-and-forget write
    fs.writeFile(COMPLAINTS_FILE, JSON.stringify(complaintsCache, null, 2)).catch(err => {
        console.error("Failed to write complaints file:", err);
    });

    return complaintsCache![index];
}

export async function deleteComplaint(id: string) {
    // Ensure cache is loaded
    if (!complaintsCache) {
        await getComplaints();
    }

    const index = complaintsCache!.findIndex((c) => c.id === id);
    if (index === -1) return false;

    // Safety check
    const initialLength = complaintsCache!.length;
    complaintsCache!.splice(index, 1);

    if (initialLength > 1 && complaintsCache!.length === 0) {
        console.error("CRITICAL ERROR: Deletion wiped all complaints! Aborting save.");
        // Restore from file to be safe? Or just fail.
        // For now, just return false and don't write.
        return false;
    }

    // Fire-and-forget write
    fs.writeFile(COMPLAINTS_FILE, JSON.stringify(complaintsCache, null, 2)).catch(err => {
        console.error("Failed to write complaints file:", err);
    });

    return true;
}

export async function getComplaintById(id: string) {
    const complaints = await getComplaints();
    return complaints.find((c) => c.id === id) || null;
}
