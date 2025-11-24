import { NextResponse } from 'next/server';
import { getComplaintById, updateComplaint, deleteComplaint } from '@/lib/db';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const complaint = await getComplaintById(params.id);

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json(complaint, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error) {
        console.error('Error in GET /api/complaints/[id]:', error);
        return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const updated = await updateComplaint(params.id, body);

        if (!updated) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error in PATCH /api/complaints/[id]:', error);
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const success = await deleteComplaint(params.id);

        if (!success) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/complaints/[id]:', error);
        return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
    }
}
