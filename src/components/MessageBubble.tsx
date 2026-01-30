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
                {/* Reply Section */}
                <div className="section reply-section">
                    <div className="reply-header">
                        <span className="label">AI Reply</span>
                        <button className="play-btn" onClick={handlePlayAudio} aria-label="Play audio">
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>
                    <p className="japanese-text">{message.reply}</p>
                </div>

                {/* Correction Section (Conditional) */}
                {message.correction && message.correction.length > 5 && message.correction !== "null" && (
                    <div className="section correction-section">
                        <span className="label">💡 Correction</span>
                        <p className="japanese-text">{message.correction}</p>
                    </div>
                )}

                {/* Improvement Section */}
                {message.improvement && (
                    <div className="section improvement-section">
                        <span className="label">✨ Natural Version</span>
                        <p className="japanese-text">{message.improvement}</p>
                    </div>
                )}

                {/* Explanation Section */}
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
