
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';

interface GoogleMapsPageProps {
  onClose: () => void;
}

interface SearchResult {
    text: string;
    sources: any[];
}

export const GoogleMapsPage: React.FC<GoogleMapsPageProps> = ({ onClose }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationError(null);
            },
            () => {
                setLocationError(t('chatbot.locationError'));
            }
        );
    }, [t]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        if (!userLocation && !locationError) {
            // Still waiting for location
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const config: any = {
                tools: [{ googleMaps: {} }],
            };
            if(userLocation){
                config.toolConfig = {
                    retrievalConfig: {
                        latLng: userLocation
                    }
                }
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: query,
                config,
            });

            const text = response.text;
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setResult({ text, sources });

        } catch (err) {
            console.error(err);
            setError(t('chatbot.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-[var(--bg-medium)] rounded-lg shadow-lg border border-[var(--border-color)] flex flex-col overflow-hidden wavy-background max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                        <Icon name="google_pin" className="h-6 w-6" />
                        <h2 className="text-xl font-bold font-orbitron">{t('googleMaps.title')}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white">
                        <Icon name="x_mark" className="h-6 w-6" />
                    </button>
                </header>

                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('googleMaps.placeholder')}
                            className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-gray-200 placeholder:text-gray-500"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !query.trim() || !!locationError}
                            className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all flex-shrink-0 text-white"
                        >
                            <Icon name="spark" className="h-6 w-6" />
                        </button>
                    </form>
                    {locationError && <p className="text-red-500 text-xs mt-2 text-center">{locationError}</p>}
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    {isLoading && (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-12 h-12 rounded-full border-4 border-blue-500/50 border-t-blue-500 animate-spin"></div>
                        </div>
                    )}
                    {error && <div className="text-center text-red-500">{error}</div>}
                    {result && (
                        <div>
                            <p className="whitespace-pre-wrap text-gray-200">{result.text}</p>
                            {result.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-semibold text-gray-400 mb-2">{t('chatbot.sources')}</h4>
                                    <div className="flex flex-col space-y-2">
                                        {result.sources.map((chunk, i) => {
                                            const source = chunk.maps;
                                            if (!source) return null;
                                            return (
                                                <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-2 p-2 bg-white/5 rounded-md">
                                                    <Icon name="google_pin" className="h-4 w-4 flex-shrink-0" />
                                                    <span>{source.title}</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};