import { updateFileTimestamp } from '@/utils/db/dbUtils'; 
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { fileName }: { fileName: string } = await request.json();

        if (!fileName) {
            return NextResponse.json(
                { error: 'Filename is required' },
                { status: 400 }
            );
        }

        const success: boolean = await updateFileTimestamp(fileName);

        if (success) {
            return NextResponse.json(
                { message: 'Timestamp updated successfully' },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: 'Failed to update timestamp' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in updateTimestamp endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}