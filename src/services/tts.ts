export const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.error('Web Speech API not supported');
            resolve(); // Don't crash app
            return;
        }

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;

        // Try to select a good Japanese voice
        const voices = window.speechSynthesis.getVoices();
        const jaVoice = voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP');

        if (jaVoice) {
            utterance.voice = jaVoice;
        }

        utterance.onend = () => {
            resolve();
        };

        utterance.onerror = (e) => {
            console.error('TTS Error:', e);
            resolve(); // Resolve anyway to continue flow
        };

        window.speechSynthesis.speak(utterance);
    });
};

export const cancelSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
};

// Pre-load voices (chrome requires this)
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
}
