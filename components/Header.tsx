
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from './Icon';

interface HeaderProps {
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="fixed top-0 left-0 right-0 flex-shrink-0 flex items-center justify-between p-4 h-20 border-b border-[var(--border-color)] bg-[var(--bg-medium)]/80 backdrop-blur-md z-50">
             {/* Left Spacer to balance the right-side buttons */}
            <div className="flex-1"></div>
            
            <h1 className="text-2xl font-bold font-orbitron gradient-text text-center px-4">
                {t('app.title')}
            </h1>

             {/* Right-side buttons */}
            <div className="flex-1 flex items-center justify-end gap-2">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                    title={t('chatbot.toggleLanguage')}
                    className="w-16 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/5 font-bold text-sm"
                >
                    {language === 'en' ? 'BN' : 'EN'}
                </button>
                <button
                    onClick={onLogout}
                    title={t('login.logout')}
                    className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-white/5"
                >
                    <Icon name="logout" className="h-6 w-6" />
                </button>
            </div>
        </header>
    );
}