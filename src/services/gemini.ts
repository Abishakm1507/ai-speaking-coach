import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AppSettings, Message } from '../types';

export const GEMINI_MODEL = 'gemini-2.5-flash';

const RESPONSE_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        transcription: { type: SchemaType.STRING, description: "Transcription of what the user said in Japanese" },
        reply: { type: SchemaType.STRING, description: "Natural response to the user in Japanese" },
        correction: { type: SchemaType.STRING, description: "Correction of the user's Japanese (if needed), otherwise null or empty" },
        improvement: { type: SchemaType.STRING, description: "A more natural 'native-speaker' version of the user's sentence" },
        explanation: { type: SchemaType.STRING, description: "Brief explanation in English of the correction or improvement" },
    },
    required: ["transcription", "reply", "improvement", "explanation"]
} as any;

export const generateResponse = async (
    audioBase64: string,
    history: Message[],
    settings: AppSettings
) => {
    try {
        const genAI = new GoogleGenerativeAI(settings.apiKey);
        const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: RESPONSE_SCHEMA
            }
        });

        // specific system prompt based on mode and level
        const systemPrompt = `
      You are a friendly but strict Japanese Speaking Coach.

      CRITICAL OUTPUT RULES:
      - ALL Japanese text MUST be written in HIRAGANA ONLY.
      - DO NOT use kanji.
      - English is allowed ONLY in the explanation field.

      Current Mode: ${settings.mode}
      Target Level: ${settings.level}
      
      Your task:
      1. Listen to the user's audio input.
      2. Transcribe exactly what they said (Japanese).
      3. Reply naturally to them in Japanese to keep the conversation going.
      4. Correct any grammar/particle mistakes.
      5. Provide a more natural 'Native' version of what they tried to say.
      6. Explain your correction/suggestion briefly in English.
      
      Important:
      - Always keep your Japanese reply at the ${settings.level} level.
      - If the user speaks English, simply translate it to Japanese in the 'correction' field and reply in Japanese.
      - Ensure the 'reply' includes a follow-up question.
    `;

        // Construct history
        // We only send recent history to keep it focused, or all of it. 
        // We represent previous turns as text to save bandwidth, assuming we have transcriptions.
        // If we don't have transcription for a previous user turn (rare), we skip it or put placeholder.

        const chatHistory = history.map(msg => {
            if (msg.role === 'user') {
                return {
                    role: 'user',
                    parts: [{ text: msg.original || '(Audio)' }],
                };
            } else {
                return {
                    role: 'model',
                    parts: [{
                        text: JSON.stringify({
                            reply: msg.reply,
                        })
                    }],
                };
            }
        });

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I am ready to help you practice Japanese. Please speak.' }] },
                ...chatHistory
            ] as any[],
        });

        const result = await chat.sendMessage([
            {
                inlineData: {
                    mimeType: 'audio/webm', // Assumes hook records webm
                    data: audioBase64
                }
            }
        ]);

        const responseText = result.response.text();
        return JSON.parse(responseText);

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};
