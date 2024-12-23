import { insertFileTrackerEntry, initializeDatabase } from "@/utils/db/dbUtils"

export async function POST(request: Request) {
    const { filename, namespace } = await request.json();

    if (!filename || !namespace) {
        return new Response('Filename and namespace are required', { status: 400 });
    }

    try {
        await initializeDatabase(); // Initialize the database if not there
        await insertFileTrackerEntry(filename, namespace);
        return new Response('File entry saved successfully', { status: 200 });
    } catch (error) {
        console.error('Error saving file entry:', error);
        return new Response('Error saving file entry', { status: 500 });
    }
}
