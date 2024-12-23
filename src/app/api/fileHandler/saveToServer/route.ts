import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'File not provided' }, { status: 400 });
    }

    const uniqueId = Date.now();
    const fileName = `${uniqueId}-${file.name}`;
    const documentsFolder = path.join(process.cwd(), 'documents');
    const filePath = path.join(documentsFolder, fileName);

    // Ensure the documents folder exists
    if (!fs.existsSync(documentsFolder)) {
        fs.mkdirSync(documentsFolder, { recursive: true });
    }

    try {
        // Convert the File object to a Buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        
        // Ensure the filePath is a valid string before returning
        if (typeof filePath !== 'string') {
            throw new Error('File path is not a valid string');
        }

        return NextResponse.json({ path: filePath }, { status: 200 });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Error saving file' }, { status: 500 });
    }
}
