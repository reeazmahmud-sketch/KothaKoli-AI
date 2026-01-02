
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';
import { decode, decodeAudioData } from '../utils/audioUtils';

const VOICES = [
    { id: 'Puck', gender: 'male', accent: 'Standard' },
    { id: 'Charon', gender: 'male', accent: 'Deep' },
    { id: 'Kore', gender: 'female', accent: 'Standard' },
    { id: 'Fenrir', gender: 'male', accent: 'Deep 2' },
    { id: 'Zephyr', gender: 'male', accent: 'Friendly' }
];

const TTS_PREFS_KEY = 'kathakoli_tts_prefs';

export const TextToSpeech: React.FC = () => {
    const { t, language } = useLanguage();
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedVoice, setSelectedVoice] = useState(language === 'bn' ? 'Kore' : 'Puck');
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isFirstRun = useRef(true);
    const animationFrameRef = useRef<number | null>(null);
    
    // Load preferences from localStorage on mount
    useEffect(() => {
        try {
            const savedPrefs = localStorage.getItem(TTS_PREFS_KEY);
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                if (prefs.voice && VOICES.some(v => v.id === prefs.voice)) setSelectedVoice(prefs.voice);
                if (typeof prefs.rate === 'number') setRate(prefs.rate);
                if (typeof prefs.pitch === 'number') setPitch(prefs.pitch);
            }
        } catch (err) {
            console.error("Failed to load TTS preferences:", err);
        }
    }, []);

    // Save preferences to localStorage whenever they change
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const prefs = { voice: selectedVoice, rate, pitch };
        localStorage.setItem(TTS_PREFS_KEY, JSON.stringify(prefs));
    }, [selectedVoice, rate, pitch]);

    useEffect(() => {
        const savedPrefs = localStorage.getItem(TTS_PREFS_KEY);
        if (!savedPrefs) {
            setSelectedVoice(language === 'bn' ? 'Kore' : 'Puck');
        }
    }, [language]);

    const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;
        
        // Create futuristic gradient for the waveform
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.5, '#9013FE');
        gradient.addColorStop(1, '#4A90E2');
        ctx.strokeStyle = gradient;
        
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(drawWaveform);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(drawWaveform);
        } else {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            // Clear canvas when not playing
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setIsPlaying(false);

        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            if (audioContext.state === 'suspended') {
                 await audioContext.resume();
            }

            // Setup analyser if not exists
            if (!analyserRef.current) {
                analyserRef.current = audioContext.createAnalyser();
                analyserRef.current.fftSize = 2048;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    audioContext,
                    24000,
                    1,
                );
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.playbackRate.value = rate;
                source.detune.value = pitch;
                
                // Connect source -> analyser -> destination
                source.connect(analyserRef.current);
                analyserRef.current.connect(audioContext.destination);
                
                source.onended = () => setIsPlaying(false);
                
                source.start();
                setIsPlaying(true);
            } else {
                throw new Error(t('textToSpeech.error'));
            }

        } catch (err) {
            console.error(err);
            setError(t('textToSpeech.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (exampleText: string) => {
        setText(exampleText);
    };

    const examplePrompts = t('textToSpeech.examples').split('\n');
    const currentVoice = VOICES.find(v => v.id === selectedVoice);

    return (
        <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-color)] wavy-background overflow-hidden">
            <style>{`
                input[type=range] {
                  -webkit-appearance: none;
                  appearance: none;
                  background: transparent;
                  cursor: pointer;
                  width: 100%;
                }
                
                input[type=range]:focus {
                  outline: none;
                }

                input[type=range]::-webkit-slider-runnable-track {
                  height: 6px;
                  background: var(--bg-dark);
                  border: 1px solid var(--border-color);
                  border-radius: 4px;
                }
                input[type=range]::-moz-range-track {
                  height: 6px;
                  background: var(--bg-dark);
                  border: 1px solid var(--border-color);
                  border-radius: 4px;
                }

                input[type=range]::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  margin-top: -7px;
                  height: 20px;
                  width: 20px;
                  background: var(--accent-gradient);
                  border-radius: 50%;
                  border: 2px solid var(--bg-medium);
                  box-shadow: 0 0 5px rgba(144, 19, 254, 0.5);
                }
                input[type=range]::-moz-range-thumb {
                  height: 16px;
                  width: 16px;
                  background: var(--accent-gradient);
                  border-radius: 50%;
                  border: 2px solid var(--bg-medium);
                  box-shadow: 0 0 5px rgba(144, 19, 254, 0.5);
                }

                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 10px;
                }
            `}</style>
            
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron gradient-text">{t('textToSpeech.title')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">{t('textToSpeech.description')}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto gap-6 overflow-hidden">
                 
                {/* Visual Feedback Area */}
                <div className="relative h-24 bg-black/40 rounded-xl border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
                    <canvas 
                        ref={canvasRef} 
                        width={800} 
                        height={100} 
                        className="w-full h-full opacity-80"
                    />
                    {!isPlaying && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-600 text-xs font-orbitron tracking-widest uppercase opacity-40">
                             Wait for generation...
                        </div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center gap-3">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-6 bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-1.5 h-8 bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-10 bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-1.5 h-8 bg-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-1.5 h-6 bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                </div>

                 <form onSubmit={handleGenerate} className="flex flex-col gap-6">
                    <div className="relative group">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={t('textToSpeech.placeholder')}
                            className="w-full bg-gray-800/80 p-4 rounded-xl border border-[var(--border-color)] focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none transition-all resize-none text-gray-200 placeholder:text-gray-500 min-h-[160px] custom-scrollbar"
                            disabled={isLoading}
                        />
                        <div className="absolute bottom-3 right-3 text-[10px] text-gray-500 font-orbitron">
                            {text.length} CHARS
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Custom Voice Selection Dropdown */}
                        <div className="md:col-span-5 relative">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('textToSpeech.voice')}</label>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] flex items-center justify-between group hover:border-blue-500/50 transition-all text-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon name={currentVoice?.gender === 'female' ? 'female' : 'male'} className="h-4 w-4 text-purple-400" />
                                    <span className="font-medium">{t(`textToSpeech.voices.${selectedVoice.toLowerCase()}`)}</span>
                                </div>
                                <Icon name="chevron_down" className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute bottom-full mb-2 left-0 right-0 z-50 bg-gray-900 border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                                        {VOICES.map(voice => (
                                            <button
                                                key={voice.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVoice(voice.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`
                                                    w-full flex items-center justify-between p-3 transition-colors text-left
                                                    ${selectedVoice === voice.id ? 'bg-purple-600/20 text-white' : 'hover:bg-white/5 text-gray-400'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon name={voice.gender === 'female' ? 'female' : 'male'} className={`h-4 w-4 ${selectedVoice === voice.id ? 'text-purple-400' : 'text-gray-500'}`} />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">{t(`textToSpeech.voices.${voice.id.toLowerCase()}`)}</span>
                                                        <span className="text-[10px] opacity-60 uppercase tracking-tighter">{voice.accent}</span>
                                                    </div>
                                                </div>
                                                {selectedVoice === voice.id && <Icon name="check" className="h-4 w-4 text-purple-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="md:col-span-7 grid grid-cols-2 gap-4">
                             <div className="bg-black/20 p-3 rounded-xl border border-[var(--border-color)]">
                                 <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('textToSpeech.rate')} ({rate.toFixed(1)}x)</label>
                                 <input
                                    type="range"
                                    min="0.5"
                                    max="2"
                                    step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(parseFloat(e.target.value))}
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>
                             <div className="bg-black/20 p-3 rounded-xl border border-[var(--border-color)]">
                                 <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('textToSpeech.pitch')} ({pitch >= 0 ? '+' : ''}{pitch / 100})</label>
                                 <input
                                    type="range"
                                    min="-1200"
                                    max="1200"
                                    step="100"
                                    value={pitch}
                                    onChange={(e) => setPitch(parseInt(e.target.value, 10))}
                                    className="w-full"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading || !text.trim()}
                        className="group relative flex items-center justify-center gap-3 w-full sm:w-auto sm:self-center px-10 py-4 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl hover:from-blue-500 hover:to-purple-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed transition-all font-bold text-white shadow-xl hover:shadow-purple-500/20 active:scale-95 overflow-hidden"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                                <span>{t('textToSpeech.generating')}</span>
                            </>
                        ) : (
                            <>
                                <Icon name="play_circle" className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                <span>{t('textToSpeech.generate')}</span>
                            </>
                        )}
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}
                </form>

                 <div className="flex flex-col gap-3 mt-4">
                    <h3 className="text-[10px] font-bold text-gray-500 text-center uppercase tracking-widest">{t('textToSpeech.try_examples')}</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {examplePrompts.map((example, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleExampleClick(example)} 
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-gray-400 text-xs transition-all"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
