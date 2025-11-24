import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export interface Complaint {
    id: string;
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

    await ensureFile(COMPLAINTS_FILE, []);
    const data = await fs.readFile(COMPLAINTS_FILE, 'utf-8');
    complaintsCache = JSON.parse(data);
    return complaintsCache!;
}

export async function saveComplaint(complaint: Complaint) {
    const complaints = await getComplaints();
    complaints.push(complaint);
    // Update cache
    complaintsCache = complaints;
    // Write to file asynchronously
    fs.writeFile(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
    return complaint;
}

export async function updateComplaint(id: string, updates: Partial<Complaint>) {
    const complaints = await getComplaints();
    const index = complaints.findIndex((c) => c.id === id);
    if (index === -1) return null;

    complaints[index] = { ...complaints[index], ...updates };
    // Update cache
    complaintsCache = complaints;
    // Write to file asynchronously
    fs.writeFile(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
    return complaints[index];
}

export async function getComplaintById(id: string) {
    const complaints = await getComplaints();
    return complaints.find((c) => c.id === id) || null;
}
