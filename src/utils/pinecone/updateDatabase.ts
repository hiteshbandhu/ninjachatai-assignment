import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import getRandomNamespace from "./getRandomNamespace"; // Fixed import statement

export default async function updateDatabase(embeddings: any, splits: any) {
    const namespace = getRandomNamespace();
    const pinecone = new PineconeClient();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

    const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex : pineconeIndex,
    maxConcurrency: 5,
    namespace : namespace
    });

    try{
    // Index chunks
        console.log("Adding to Database . . . .")
        await vectorStore.addDocuments(splits)
        console.log(`Added to Database with namespace : ${namespace}`)
        return {namespace}
    }
    catch(err){
        return Error(`Error : ${err}`)
    }
}
