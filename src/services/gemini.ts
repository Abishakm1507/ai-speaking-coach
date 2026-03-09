import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { AppSettings, Message } from '../types';

export const GEMINI_MODEL = 'gemini-2.5-flash';

const RESPONSE_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        transcription: { type: SchemaType.STRING, description: "Exact transcription of what the user said in Japanese" },
        transcriptionEnglish: { type: SchemaType.STRING, description: "English translation of the user's speech" },
        reply: { type: SchemaType.STRING, description: "Natural conversational response in Japanese with a follow-up question" },
        replyEnglish: { type: SchemaType.STRING, description: "English translation of the AI's reply" },
        correction: { type: SchemaType.STRING, description: "Grammar or particle corrections if needed, otherwise empty" },
        improvement: { type: SchemaType.STRING, description: "More natural native-speaker version of the user's sentence, or empty if no improvement needed" },
        explanation: { type: SchemaType.STRING, description: "Brief explanation in English of any corrections or improvements made" },
    },
    required: ["transcription", "transcriptionEnglish", "reply", "replyEnglish"]
} as any;

export const generateResponse = async (
    audioBase64: string,
    history: Message[],
    settings: AppSettings,
    textInput?: string
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
      You are a supportive and encouraging Japanese Speaking Coach.

      CRITICAL OUTPUT RULES:
      - ALL Japanese text MUST be written in HIRAGANA ONLY.
      - DO NOT use kanji.
      - English is allowed ONLY in the explanation field.

      Current Mode: ${settings.mode}
      Target Level: ${settings.level}
      
      Your task:
      1. Listen to the user's audio input.
      2. Transcribe exactly what they said in Japanese.
      3. Provide an English translation of the user's speech.
      4. Reply naturally to them in Japanese to keep the conversation going.
      5. Provide an English translation of your reply.
      6. Provide an improved version of their sentence when needed (grammar, particles, natural phrasing).
      7. Explain your correction/suggestion briefly in English.
      
      Conversation Style:
      - Be supportive and encouraging like a friendly coach
      - Begin replies with natural Japanese reactions when appropriate (e.g., そうなんですね, いいですね, なるほど, すごいですね)
      - Always include a follow-up question to continue the conversation
      - Keep replies appropriate for the learner's ${settings.level} level
      - Encourage the learner when their sentence is correct
      - If the user speaks English, translate it to Japanese and continue in Japanese
      
      Important:
      - The 'improvement' field should contain a more natural 'native-speaker' version of what they tried to say
      - Only provide an improvement if the original sentence needs correction or could be more natural
      - If the sentence is already good, you can leave improvement empty or the same as transcription
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
                { role: 'model', parts: [{ text: 'Understood. I am ready to help you practice Japanese. Please speak or type your message.' }] },
                ...chatHistory
            ] as any[],
        });

        let messageParts: any[] = [];
        
        if (textInput) {
            // For text input, send the text directly
            messageParts = [{ text: `User typed: ${textInput}` }];
        } else {
            // For audio input, send the audio
            messageParts = [{
                inlineData: {
                    mimeType: 'audio/webm', // Assumes hook records webm
                    data: audioBase64
                }
            }];
        }

        const result = await chat.sendMessage(messageParts);

        const responseText = result.response.text();
        return JSON.parse(responseText);

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};
