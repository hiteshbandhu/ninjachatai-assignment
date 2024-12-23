import { getFileTrackerEntries } from "@/utils/db/dbUtils";

export async function GET(request: Request) {
    try {
        const filenames = await getFileTrackerEntries();
        return new Response(JSON.stringify(filenames), { status: 200 });
    } catch (error) {
        console.error('Error fetching file entries:', error);
        return new Response('Error fetching file entries', { status: 500 });
    }
}
