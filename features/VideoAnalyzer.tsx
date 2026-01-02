
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';

export const VideoAnalyzer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col items-center justify-center bg-[var(--bg-medium)] rounded-lg p-6 text-center shadow-lg border border-[var(--border-color)] relative overflow-hidden wavy-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(74,144,226,0.1)_0,_transparent_50%)]"></div>
        <Icon name="video_library" className="w-24 h-24 text-blue-400 mb-6" style={{ filter: 'drop-shadow(0 0 10px var(--glow-color))' }} />
      <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron text-glow" style={{ "--glow-color": 'var(--glow-color)'} as any}>{t('videoAnalyzer.title')}</h1>
      <p className="text-gray-400 max-w-md relative z-10">{t('videoAnalyzer.description')}</p>
    </div>
  );
};
