export interface Message {
    id: string;
    role: 'user' | 'ai';
    text?: string;
    audio?: string; // base64, for user messages if we want to play them back? Or just keep text.
    timestamp: number;

    // AI Response fields
    original?: string; // What the AI 'heard' or the user's text (Japanese)
    reply?: string; // AI reply in Japanese
    correction?: string;
    improvement?: string;
    explanation?: string;
    
    // English translations
    userTranscriptionEnglish?: string; // English translation of user's speech
    aiReplyEnglish?: string; // English translation of AI reply
}

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
export type ConversationMode = 'Free Talk' | 'Teacher' | 'Business' | 'Interview';

export interface AppSettings {
    apiKey: string;
    level: JLPTLevel;
    mode: ConversationMode;
}
