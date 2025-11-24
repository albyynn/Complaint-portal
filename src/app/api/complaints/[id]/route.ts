import { NextResponse } from 'next/server';
import { getComplaintById, updateComplaint } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const complaint = await getComplaintById(id);
    if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }
    return NextResponse.json(complaint);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await updateComplaint(id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update complaint' },
            { status: 500 }
        );
    }
}
