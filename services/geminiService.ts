import { GoogleGenAI } from "@google/genai";
import { Message, SessionMode, UserRole } from '../types';

// Initialize the client
// API Key is strictly from process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a draft response for the Admin to use.
 * This supports the HITL (Human-in-the-Loop) model by acting as a force multiplier.
 */
export const generateDraftResponse = async (
  history: Message[],
  subject: string,
  context: string,
  mode: SessionMode
): Promise<string> => {
  try {
    const modelId = 'gemini-3-flash-preview';

    let systemInstruction = `You are an expert academic tutor named "Prof. Elena Rodriguez" inside VarsiVault. 
    Subject: ${subject}. 
    Context provided by student: "${context}".
    
    Your goal is to draft a response for a student. 
    `;

    if (mode === SessionMode.INTERACTIVE) {
      systemInstruction += `
      MODE: INTERACTIVE GUIDE.
      DO NOT give the full solution. 
      Provide pedagogical hints, ask guiding questions, and nudge the student toward the answer.
      Be encouraging but rigorous.
      `;
    } else {
      systemInstruction += `
      MODE: FULL SOLUTION.
      Provide a comprehensive, step-by-step derivation of the solution.
      Explain every step clearly. Use formatting for readability.
      `;
    }

    // Filter out system messages and drafts for the prompt
    const chatHistory = history
      .filter(m => !m.isDraft && m.role !== UserRole.SYSTEM)
      .map(m => ({
        role: m.role === UserRole.STUDENT ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // If no history, it's the start
    const lastMessage = chatHistory.length > 0 ? chatHistory.pop() : { role: 'user', parts: [{ text: "Hello, I need help." }] };
    
    // Construct prompt
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: systemInstruction,
      },
      history: chatHistory.length > 0 ? chatHistory : undefined
    });

    // The message is the last user input
    // Safe cast because we constructed it above
    const userMsg = lastMessage?.parts[0]?.text || "Hello";

    const result = await chat.sendMessage({
      message: userMsg
    });

    return result.text || "Unable to generate draft.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating AI draft. Please write response manually.";
  }
};