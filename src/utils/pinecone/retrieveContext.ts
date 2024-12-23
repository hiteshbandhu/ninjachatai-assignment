import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { getLatestFileEntryNamespace } from "../db/dbUtils";
import convertToEmbeddings from "./convertToEmbeddings";

async function init(){
    try {
        console.log("Getting namespace from local storage...");
        const namespace = await getLatestFileEntryNamespace();
        
        console.log("Initializing Pinecone client...");
        const pinecone = new PineconeClient();
        
        console.log("Getting Pinecone index...");
        const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
        
        console.log("Converting to embeddings...");
        const embeddings = await convertToEmbeddings();

        console.log("Creating Pinecone store...");
        const vectorStore = new PineconeStore(embeddings, {
            pineconeIndex: pineconeIndex,
            maxConcurrency: 5,
            namespace: namespace
        });
        
        console.log("Pinecone store created successfully.");
        return vectorStore;
    } catch (error) {
        console.error("Error initializing Pinecone store:", error);
        throw error; // Rethrow the error after logging
    }
}

export default async function retrieveContext(query: any) {
    try {
        console.log("Initializing vector store...");
        const vectorStore = await init();
        
        console.log("EXECUTING THE TOOL !");
        const retrievedDocs = await vectorStore.similaritySearch(query);
        
        console.log("Documents retrieved successfully.");
        return retrievedDocs;
    } catch (error) {
        console.error("Error retrieving context:", error);
        throw error; // Rethrow the error after logging
    }
}