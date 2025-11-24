import { NextResponse } from 'next/server';
import { getComplaints, saveComplaint, Complaint } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    const complaints = await getComplaints();
    return NextResponse.json(complaints);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.branch || !body.category || !body.subject || !body.message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newComplaint: Complaint = {
            id: uuidv4(),
            userId: body.userId,
            branch: body.branch,
            category: body.category,
            urgency: body.urgency || 'Normal',
            subject: body.subject,
            message: body.message,
            isAnonymous: body.isAnonymous || false,
            studentName: body.isAnonymous ? undefined : body.studentName,
            studentEmail: body.isAnonymous ? undefined : body.studentEmail,
            status: 'Open',
            createdAt: new Date().toISOString(),
            attachments: body.attachments || [],
            notes: []
        };

        await saveComplaint(newComplaint);
        return NextResponse.json(newComplaint, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create complaint' },
            { status: 500 }
        );
    }
}
