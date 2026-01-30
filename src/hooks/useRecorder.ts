import { useState, useRef, useCallback } from 'react';

export interface RecorderState {
    isRecording: boolean;
    permission: boolean | null;
    error: string | null;
}

export const useRecorder = () => {
    const [state, setState] = useState<RecorderState>({
        isRecording: false,
        permission: null,
        error: null,
    });

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            if (!navigator.mediaDevices) {
                throw new Error('MediaDevices API not supported');
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm', // Or 'audio/mp4' if supported, webm is safer for web
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setState(prev => ({ ...prev, isRecording: true, permission: true, error: null }));

        } catch (err: any) {
            console.error('Error starting recording:', err);
            setState(prev => ({
                ...prev,
                isRecording: false,
                permission: false,
                error: err.message || 'Could not access microphone'
            }));
        }
    }, []);

    const stopRecording = useCallback((): Promise<string> => {
        return new Promise((resolve, reject) => {
            const mediaRecorder = mediaRecorderRef.current;
            if (!mediaRecorder) {
                return reject(new Error('No media recorder initialized'));
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(base64String);
                };
                reader.onerror = (error) => {
                    reject(error);
                };

                // Stop all tracks
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.stop();
            setState(prev => ({ ...prev, isRecording: false }));
        });
    }, []);

    return {
        ...state,
        startRecording,
        stopRecording,
    };
};
