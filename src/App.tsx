import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import type { AppSettings } from './types';
import './App.css';

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  level: 'N4',
  mode: 'Free Talk'
};

function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('japanese_coach_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('japanese_coach_settings', JSON.stringify(settings));
  }, [settings]);

  // Force open settings if API key is missing on first load
  useEffect(() => {
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
    }
  }, []);

  return (
    <>
      <ChatInterface
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </>
  );
}

export default App;
