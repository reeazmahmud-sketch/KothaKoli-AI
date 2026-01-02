
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../translations';

interface TranslatableTooltipProps {
  children: React.ReactNode;
  translationKey: string;
  targetLang: Language;
  className?: string;
}

export const TranslatableTooltip: React.FC<TranslatableTooltipProps> = ({ children, translationKey, targetLang, className = '' }) => {
    const { getTranslation } = useLanguage();
    const translatedText = getTranslation(targetLang, translationKey);
    
    return (
        <span className={`group relative inline-block ${className}`}>
            {children}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs hidden group-hover:block bg-[var(--bg-dark)] text-[var(--text-light)] text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap shadow-lg border border-[var(--border-color)] z-10">
                {translatedText}
            </span>
        </span>
    );
}