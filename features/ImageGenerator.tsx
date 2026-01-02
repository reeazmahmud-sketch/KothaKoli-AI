
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';

export const ImageGenerator: React.FC = () => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: '1:1',
                },
            });

            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            const url = `data:image/png;base64,${base64ImageBytes}`;
            setImageUrl(url);

        } catch (err) {
            console.error(err);
            setError(t('imageGenerator.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (examplePrompt: string) => {
        setPrompt(examplePrompt);
    };

    const examplePrompts = t('imageGenerator.examples').split('\n');

    return (
        <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-color)] wavy-background">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron gradient-text">{t('imageGenerator.title')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('imageGenerator.description')}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                {/* Controls and Examples */}
                <div className="flex flex-col gap-4 md:w-1/3 overflow-y-auto">
                    <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('imageGenerator.placeholder')}
                            className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none text-gray-200 placeholder:text-gray-500"
                            rows={4}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !prompt.trim()}
                            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold text-white"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 rounded-full border-2 border-white/50 border-t-white animate-spin"></div>
                                    <span>{t('imageGenerator.generating')}</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="spark" className="h-5 w-5" />
                                    <span>{t('imageGenerator.generate')}</span>
                                </>
                            )}
                        </button>
                    </form>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-gray-400">{t('imageGenerator.try_examples')}</h3>
                        {examplePrompts.map((example, index) => (
                            <button key={index} onClick={() => handleExampleClick(example)} className="text-left p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors">
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Display */}
                <div className="flex-1 bg-black/20 rounded-lg border border-[var(--border-color)] flex items-center justify-center p-4 min-h-[256px]">
                    {isLoading && <div className="w-16 h-16 rounded-full border-4 border-blue-500/50 border-t-blue-500 animate-spin"></div>}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {imageUrl && <img src={imageUrl} alt={prompt} className="max-w-full max-h-full object-contain rounded-md" />}
                    {!isLoading && !error && !imageUrl && <Icon name="image" className="w-24 h-24 text-gray-700" />}
                </div>
            </div>
        </div>
    );
};