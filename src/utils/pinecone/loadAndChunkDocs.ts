import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export default async function chunkAndEmbed(path: string) {
    const loader = new PDFLoader(path)
    const docs = await loader.load()

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap : 200
    })
    const allSplits = await splitter.splitDocuments(docs);
    return allSplits
}