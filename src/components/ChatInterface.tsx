import { useRef, useEffect, useState } from 'react';
import { Settings, Trash2, AlertCircle, Send } from 'lucide-react';
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
    const [textInput, setTextInput] = useState('');

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

    const handleSendText = async () => {
        if (!textInput.trim()) return;
        
        const trimmedText = textInput.trim();
        setTextInput('');
        
        // For text input, we'll treat it as if it was transcribed
        // We need to modify processUserAudio to handle text input
        await processUserAudio('', trimmedText); // Pass empty audio and the text
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
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
                    <button onClick={clearHistory} title="Clear Conversation" className="clear-btn">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={onOpenSettings} title="Settings" className="settings-btn">
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
                <div className="audio-recorder-container">
                    <AudioRecorder
                        isRecording={isRecording}
                        isProcessing={isProcessing}
                        onToggleRecording={handleToggleRecording}
                        permissionError={recorderError || (permission === false ? 'Microphone access denied' : null)}
                    />
                </div>
                <div className="text-input-container">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message in Japanese..."
                        className="text-input"
                        rows={1}
                        disabled={isProcessing}
                    />
                    <button 
                        className="send-btn" 
                        onClick={handleSendText}
                        disabled={!textInput.trim() || isProcessing}
                        aria-label="Send message"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
