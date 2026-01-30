import { Mic, Square, Loader } from 'lucide-react';
import './AudioRecorder.css';

interface AudioRecorderProps {
    isRecording: boolean;
    isProcessing: boolean;
    onToggleRecording: () => void;
    permissionError: string | null;
}

export const AudioRecorder = ({
    isRecording,
    isProcessing,
    onToggleRecording,
    permissionError
}: AudioRecorderProps) => {

    return (
        <div className="recorder-container">
            {permissionError && (
                <div className="error-message">
                    {permissionError}
                </div>
            )}

            <button
                className={`record-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
                onClick={onToggleRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <Loader className="spin" size={28} />
                ) : isRecording ? (
                    <Square size={28} fill="white" />
                ) : (
                    <Mic size={28} />
                )}
            </button>

            <span className="status-text">
                {isProcessing ? 'AI is thinking...' : isRecording ? 'Recording...' : 'Tap Mic to Start'}
            </span>
        </div>
    );
};
