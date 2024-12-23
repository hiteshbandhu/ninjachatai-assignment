import { OpenAIEmbeddings } from "@langchain/openai"

export default async function convertToEmbeddings() {
    const embeddings = new OpenAIEmbeddings({
        model : "text-embedding-3-small"
    })
    return embeddings
}
