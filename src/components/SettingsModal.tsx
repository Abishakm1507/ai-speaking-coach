import { useState, useEffect } from 'react';
import { X, Save, Lock } from 'lucide-react';
import type { AppSettings, ConversationMode, JLPTLevel } from '../types';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
}

const MODES: ConversationMode[] = ['Free Talk', 'Teacher', 'Business', 'Interview'];
const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const SettingsModal = ({ isOpen, onClose, settings, onSave }: SettingsModalProps) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="icon-btn"><X size={24} /></button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>
                            <Lock size={16} style={{ marginRight: 8 }} />
                            Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={localSettings.apiKey}
                            onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                            placeholder="Enter your Gemini API Key"
                        />
                        <small>Stored locally in your browser. Not sent to any server.</small>
                    </div>

                    <div className="form-group">
                        <label>Mode</label>
                        <div className="pill-selector">
                            {MODES.map(m => (
                                <button
                                    key={m}
                                    className={localSettings.mode === m ? 'active' : ''}
                                    onClick={() => setLocalSettings({ ...localSettings, mode: m })}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Difficulty Level</label>
                        <div className="pill-selector">
                            {LEVELS.map(l => (
                                <button
                                    key={l}
                                    className={localSettings.level === l ? 'active' : ''}
                                    onClick={() => setLocalSettings({ ...localSettings, level: l })}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="save-btn" onClick={handleSave}>
                        <Save size={18} /> Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
