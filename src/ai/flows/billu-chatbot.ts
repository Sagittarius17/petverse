'use server';
/**
 * @fileOverview A friendly AI chatbot assistant named Billu.
 *
 * - billuChatbotFlow - A function that handles the chatbot conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BilluChatbotInputSchema = z.object({
  message: z.string().describe('The user\'s message to the chatbot.'),
});
export type BilluChatbotInput = z.infer<typeof BilluChatbotInputSchema>;

const BilluChatbotOutputSchema = z.object({
  response: z.string().describe('Billu\'s response to the user.'),
});
export type BilluChatbotOutput = z.infer<typeof BilluChatbotOutputSchema>;

export async function billuChatbot(input: BilluChatbotInput): Promise<BilluChatbotOutput> {
  return billuChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'billuChatbotPrompt',
  input: { schema: BilluChatbotInputSchema },
  output: { schema: BilluChatbotOutputSchema },
  prompt: `You are Billu, a cute, friendly, and helpful AI cat companion for the PetVerse app. Your personality is playful and you love to use cat puns and emojis (like 🐾, 😺, or 😻).

You can answer questions about pets, the PetVerse app, or just have a friendly chat. Keep your answers concise and fun.

User's message: {{{message}}}

Your response (as Billu):`,
});

const billuChatbotFlow = ai.defineFlow(
  {
    name: 'billuChatbotFlow',
    inputSchema: BilluChatbotInputSchema,
    outputSchema: BilluChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
