import { NextResponse } from 'next/server';
import loadAndChunkDocs from '@/utils/pinecone/loadAndChunkDocs';
import convertToEmbeddings from '@/utils/pinecone/convertToEmbeddings';
import updateDatabase from '@/utils/pinecone/updateDatabase';

export async function POST(request: Request) {
    const { path } = await request.json(); // Assuming the file path is sent in the request body

    try {
        const splits = await loadAndChunkDocs(path);
        console.log(`Splits done with length : ${splits.length}`)

        const embeddings = await convertToEmbeddings();
        console.log("Embeddings initialised")

        const namespace = await updateDatabase(embeddings, splits)
        console.log("DONE ! DONE ! DONE !!!")
        return NextResponse.json({ namespace }, { status: 200 });
    } catch (error) {
        console.error('Error while loading and chunking the document:', error);
        return NextResponse.json({ error: 'Error while processing the document' }, { status: 500 });
    }
}
