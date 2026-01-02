
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LiveConversationUI } from '../components/LiveConversationUI';

export const LiveConversation: React.FC = () => {
    const { t, language } = useLanguage();
    
    let systemInstruction = t('liveConversation.systemInstruction');

    if (language === 'en') {
      systemInstruction = "You are a friendly and helpful conversational AI assistant. If the user says 'hello' and nothing else, you must reply with the single word 'হ্যালো'. For all other messages, reply in English.";
    }

    return (
        <LiveConversationUI 
            title={t('liveConversation.title')}
            description={t('liveConversation.description')}
            systemInstruction={systemInstruction}
        />
    );
};