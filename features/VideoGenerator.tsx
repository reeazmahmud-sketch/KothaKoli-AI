
import React, { useState, useEffect } from 'react';
// Fix: Import GenerateVideosOperation for correct type usage with the video generation API.
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';

// Fix: Removed custom VideosOperation type; will use GenerateVideosOperation from the SDK.

export const VideoGenerator: React.FC = () => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [apiKeySelected, setApiKeySelected] = useState(false);
    
    // Check for API key on mount
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race condition and allow user to proceed.
            // If the key is invalid, the API call will fail and we'll handle it.
            setApiKeySelected(true);
        }
    };
    
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        const loadingMessages = t('videoGenerator.loadingMessages').split('\n');
        setLoadingMessage(loadingMessages[0]);

        try {
            // Re-create the AI instance right before the call to ensure the latest key is used.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Fix: Use the imported GenerateVideosOperation type.
            let operation: GenerateVideosOperation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });

            let messageIndex = 1;
            const messageInterval = setInterval(() => {
                setLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
                messageIndex++;
            }, 8000);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                // Fix: The 'operation' parameter now correctly matches the expected 'GenerateVideosOperation' type.
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }
            
            clearInterval(messageInterval);
            setLoadingMessage(t('videoGenerator.loadingComplete'));
            
            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            } else {
                 throw new Error(t('videoGenerator.error'));
            }

        } catch (err: any) {
            console.error(err);
            let errorMessage = err.message || t('videoGenerator.error');
            // Specific check for API key error
            if (err.message && err.message.includes("Requested entity was not found.")) {
                errorMessage = t('videoGenerator.apiKeyError');
                setApiKeySelected(false); // Force re-selection
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    const handleExampleClick = (examplePrompt: string) => {
        setPrompt(examplePrompt);
    };

    const examplePrompts = t('videoGenerator.examples').split('\n');
    
    if (!apiKeySelected) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[var(--bg-medium)] rounded-lg p-6 text-center shadow-lg border border-[var(--border-color)] wavy-background">
                <Icon name="video_spark" className="w-24 h-24 text-blue-400 mb-6" style={{ filter: 'drop-shadow(0 0 10px var(--glow-color))' }} />
                <h1 className="text-2xl font-bold text-gray-100 mb-2 font-orbitron">{t('videoGenerator.selectKeyTitle')}</h1>
                <p className="text-gray-400 max-w-md mb-6">{t('videoGenerator.selectKeyDescription')}</p>
                <button onClick={handleSelectKey} className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg font-semibold text-white">
                    {t('videoGenerator.selectKeyButton')}
                </button>
                 <p className="text-xs text-gray-500 mt-4">
                    {t('videoGenerator.billingInfo')} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{t('videoGenerator.learnMore')}</a>
                </p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-color)] wavy-background">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron gradient-text">{t('videoGenerator.title')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('videoGenerator.description')}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                <div className="flex flex-col gap-4 md:w-1/3 overflow-y-auto">
                    <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('videoGenerator.placeholder')}
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
                                    <span>{t('videoGenerator.generating')}</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="spark" className="h-5 w-5" />
                                    <span>{t('videoGenerator.generate')}</span>
                                </>
                            )}
                        </button>
                    </form>
                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-gray-400">{t('videoGenerator.try_examples')}</h3>
                        {examplePrompts.map((example, index) => (
                            <button key={index} onClick={() => handleExampleClick(example)} className="text-left p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors">
                                {example}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-black/20 rounded-lg border border-[var(--border-color)] flex items-center justify-center p-4 min-h-[256px]">
                    {isLoading && (
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-500/50 border-t-blue-500 animate-spin mx-auto"></div>
                            <p className="mt-4 text-gray-300">{loadingMessage}</p>
                        </div>
                    )}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {videoUrl && (
                        <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-md" />
                    )}
                    {!isLoading && !error && !videoUrl && <Icon name="video_spark" className="w-24 h-24 text-gray-700" />}
                </div>
            </div>
        </div>
    );
};