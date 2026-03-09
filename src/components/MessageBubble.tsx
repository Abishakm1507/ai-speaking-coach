import type { Message } from '../types';
import { Play } from 'lucide-react';
import { speak } from '../services/tts';
import './MessageBubble.css';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
    const isUser = message.role === 'user';

    const handlePlayAudio = () => {
        if (message.reply) {
            speak(message.reply);
        }
    };

    if (isUser) {
        return (
            <div className="message-container user">
                <div className="bubble user-bubble">
                    <p>{message.text || message.original || '(Audio)'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="message-container ai">
            <div className="bubble ai-bubble">
                {/* User Speech Section */}
                <div className="section transcription-section">
                    <span className="label">You said</span>
                    <p className="japanese-text">{message.original}</p>
                    {message.userTranscriptionEnglish && (
                        <p className="english-text">{message.userTranscriptionEnglish}</p>
                    )}
                </div>

                {/* Reply Section */}
                <div className="section reply-section">
                    <div className="reply-header">
                        <span className="label">AI Reply</span>
                        <button className="play-btn" onClick={handlePlayAudio} aria-label="Play audio">
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>
                    <p className="japanese-text">{message.reply}</p>
                    {message.aiReplyEnglish && (
                        <p className="english-text">{message.aiReplyEnglish}</p>
                    )}
                </div>

                {/* Suggestion Section */}
                {(message.improvement || message.correction) && (
                    <div className="section suggestion-section">
                        <span className="label">Suggestion</span>
                        <p className="japanese-text">{message.improvement || message.correction}</p>
                    </div>
                )}

                {/* Explanation Section (if needed) */}
                {message.explanation && (
                    <div className="section explanation-section">
                        <span className="label">📝 Explanation</span>
                        <p className="explanation-text">{message.explanation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
