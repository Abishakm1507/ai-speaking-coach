import { useState, useCallback } from 'react';
import type { Message, AppSettings } from '../types';
import { generateResponse } from '../services/gemini';
import { speak } from '../services/tts';

export const useConversation = (settings: AppSettings) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processUserAudio = useCallback(async (audioBase64: string, textInput?: string) => {
        setIsProcessing(true);
        setError(null);

        // Create temporary user message
        const tempUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            timestamp: Date.now(),
            original: textInput || 'Processing audio...',
            audio: audioBase64 || undefined
        };

        // Optimistically add user message (or wait for transcription?)
        // Let's wait for transcription from Gemini to update the text, but show the bubble.
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            if (!settings.apiKey) {
                throw new Error('Please set your Gemini API Key in settings');
            }

            // Call Gemini
            const response = await generateResponse(audioBase64, messages, settings, textInput);

            // Update User Message with transcription
            setMessages(prev => prev.map(m =>
                m.id === tempUserMsg.id
                    ? { ...m, original: response.transcription || '(Audio)' }
                    : m
            ));

            // Add AI Message
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                timestamp: Date.now(),
                original: response.transcription, // Include transcription in AI message
                reply: response.reply,
                correction: response.correction,
                improvement: response.improvement,
                explanation: response.explanation,
                userTranscriptionEnglish: response.transcriptionEnglish,
                aiReplyEnglish: response.replyEnglish,
            };

            setMessages(prev => [...prev, aiMsg]);

            // Speak reply
            if (response.reply) {
                await speak(response.reply);
            }

        } catch (err: any) {
            console.error('Conversation Error:', err);
            setError(err.message || 'Failed to process conversation');
            // Remove the temp message if it failed completely? Or mark as error.
            setMessages(prev => prev.map(m =>
                m.id === tempUserMsg.id
                    ? { ...m, original: 'Error: ' + (err.message || 'Could not understand') }
                    : m
            ));
        } finally {
            setIsProcessing(false);
        }
    }, [messages, settings]);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        isProcessing,
        processUserAudio,
        clearHistory,
        error
    };
};
