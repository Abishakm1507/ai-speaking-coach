import { useRef, useEffect } from 'react';
import { Settings, Trash2, AlertCircle } from 'lucide-react';
import type { AppSettings } from '../types';
import { useConversation } from '../hooks/useConversation';
import { useRecorder } from '../hooks/useRecorder';
import { MessageBubble } from './MessageBubble';
import { AudioRecorder } from './AudioRecorder';
import './ChatInterface.css';

interface ChatInterfaceProps {
    settings: AppSettings;
    onOpenSettings: () => void;
}

export const ChatInterface = ({ settings, onOpenSettings }: ChatInterfaceProps) => {
    const { messages, isProcessing, processUserAudio, clearHistory, error: convoError } = useConversation(settings);
    const { isRecording, startRecording, stopRecording, permission, error: recorderError } = useRecorder();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isProcessing]);

    const handleToggleRecording = async () => {
        if (isRecording) {
            try {
                const audioBase64 = await stopRecording();
                await processUserAudio(audioBase64);
            } catch (e) {
                console.error("Recording stop failed", e);
            }
        } else {
            await startRecording();
        }
    };

    return (
        <div className="chat-interface">
            <header className="chat-header">
                <div className="header-left">
                    <h1>AI Japanese Coach</h1>
                    <div className="badge-group">
                        <span className="badge">{settings.mode}</span>
                        <span className="badge level">{settings.level}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" onClick={clearHistory} title="Clear Conversation">
                        <Trash2 size={18} />
                    </button>
                    <button className="icon-btn" onClick={onOpenSettings} title="Settings">
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            <div className="messages-area">
                {messages.length === 0 && (
                    <div className="welcome-placeholder">
                        <span className="welcome-icon">👋</span>
                        <h2>こんにちは!</h2>
                        <p>I'm your AI Speaking Coach. Ready to practice Japanese?</p>
                        {!settings.apiKey && (
                            <div className="api-warning">
                                <AlertCircle size={20} />
                                <span>Please set your Gemini API Key in Settings to start.</span>
                            </div>
                        )}
                        <p className="hint">Tap the microphone to start speaking.</p>
                    </div>
                )}

                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {convoError && (
                    <div className="error-banner">
                        <AlertCircle size={16} /> {convoError}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="controls-area">
                <AudioRecorder
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    onToggleRecording={handleToggleRecording}
                    permissionError={recorderError || (permission === false ? 'Microphone access denied' : null)}
                />
            </div>
        </div>
    );
};
