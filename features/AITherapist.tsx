
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LiveConversationUI } from '../components/LiveConversationUI';

export const AITherapist: React.FC = () => {
    const { t } = useLanguage();
    
    const systemInstruction = t('aiTherapist.systemInstruction');
    const examplePrompts = t('aiTherapist.examplePrompts').split('\n');

    return (
        <LiveConversationUI 
            title={t('aiTherapist.title')}
            description={t('aiTherapist.description')}
            systemInstruction={systemInstruction}
            examplePrompts={examplePrompts}
        />
    );
};