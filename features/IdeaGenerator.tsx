
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';

export const IdeaGenerator: React.FC = () => {
  const { t } = useLanguage();
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setIdeas('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: topic,
        config: {
            systemInstruction: t('ideaGenerator.systemInstruction'),
        }
      });
      
      setIdeas(response.text);

    } catch (err) {
      console.error(err);
      setError(t('ideaGenerator.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-color)] wavy-background">
      <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron gradient-text">{t('ideaGenerator.title')}</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">{t('ideaGenerator.description')}</p>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4 mb-6">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t('ideaGenerator.placeholder')}
          className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none text-gray-200 placeholder:text-gray-500"
          rows={3}
          disabled={isLoading}
        />
        <button 
            type="submit" 
            disabled={isLoading || !topic.trim()} 
            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:self-center px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold text-white"
        >
            {isLoading ? (
                <>
                 <div className="w-5 h-5 rounded-full border-2 border-white/50 border-t-white animate-spin"></div>
                 <span>Generating...</span>
                </>
            ) : (
                <>
                  <Icon name="spark" className="h-5 w-5" />
                  <span>{t('ideaGenerator.generate')}</span>
                </>
            )}
        </button>
      </form>

      <div className="flex-1 overflow-y-auto bg-black/20 rounded-lg p-4 border border-[var(--border-color)]">
        {error && <div className="text-center text-red-500">{error}</div>}
        {ideas && (
          <div 
            className="prose prose-invert prose-p:text-gray-300 prose-headings:text-gray-100 prose-strong:text-white prose-li:marker:text-blue-400"
            dangerouslySetInnerHTML={{ __html: ideas.replace(/\n/g, '<br />') }}
          />
        )}
      </div>
       <style>{`
        textarea { scrollbar-width: none; }
        .prose { max-width: none; }
      `}</style>
    </div>
  );
};