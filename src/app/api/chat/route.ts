import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import retrieveContext from '@/utils/pinecone/retrieveContext';
import { getRandomNumber } from '@/utils/pinecone/randomNumber';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    system: `You are a helpful assistant who has a tool which provide can provide information from a document the user uploaded. Use the getInformation tool whenever the user asks about the document. You won't answer anything by your own.
    Only respond to questions using information from tool calls except of Greetings !

    You also have a random number tool you can use !

    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => retrieveContext(question),
      }),
      getRandom: tool({
        description: `get a random number if user requires.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async () => getRandomNumber(),
      }),
    },
  });

  return result.toDataStreamResponse();
}