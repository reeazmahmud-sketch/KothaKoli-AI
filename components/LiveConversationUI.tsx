
import React, { useState, useRef, useEffect } from 'react';
// Fix: Removed 'LiveSession' as it is not an exported member of the module.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import type { TranscriptionMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from './Icon';
import { decode, decodeAudioData, encode } from '../utils/audioUtils';

// Fix: Add a global declaration for `webkitAudioContext` to support older browsers
// without causing TypeScript errors. This resolves the error on lines 50 and 51.
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

interface LiveConversationUIProps {
    title: string;
    description: string;
    systemInstruction: string;
    examplePrompts?: string[];
}

type Status = "disconnected" | "connecting" | "connected" | "error" | "not-allowed" | "no-speech" | "service-not-allowed";

export const LiveConversationUI: React.FC<LiveConversationUIProps> = ({ title, description, systemInstruction, examplePrompts }) => {
    const { t, language } = useLanguage();
    const [status, setStatus] = useState<Status>("disconnected");
    const [transcript, setTranscript] = useState<TranscriptionMessage[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    
    // Fix: Use 'any' for the session ref type as 'LiveSession' is not exported from the SDK.
    const sessionRef = useRef<any | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const isMutedRef = useRef(isMuted);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const userAnalyserRef = useRef<AnalyserNode | null>(null);
    const modelAnalyserRef = useRef<AnalyserNode | null>(null);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [transcript]);

    const draw = () => {
        if (!canvasRef.current) {
            requestAnimationFrame(draw);
            return;
        };
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
             requestAnimationFrame(draw);
            return;
        }

        requestAnimationFrame(draw);

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        
        const drawWave = (analyser: AnalyserNode, color: string) => {
            if (!analyser) return;
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);

            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.beginPath();
            const sliceWidth = width * 1.0 / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.lineTo(width, height / 2);
            ctx.stroke();
        }

        if (userAnalyserRef.current) drawWave(userAnalyserRef.current, '#9013FE'); // purple
        if (modelAnalyserRef.current) drawWave(modelAnalyserRef.current, '#4A90E2'); // blue
    };
    
    useEffect(() => {
        // Set canvas dimensions based on its container
        const resizeCanvas = () => {
            if(canvasRef.current) {
                canvasRef.current.width = canvasRef.current.offsetWidth;
                canvasRef.current.height = canvasRef.current.offsetHeight;
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const animationFrameId = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    const startConversation = async () => {
        setStatus("connecting");
        setTranscript([]);
        nextStartTimeRef.current = 0;

        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e: any) {
            console.error('Microphone access denied:', e);
            setStatus(e.name === 'NotAllowedError' ? 'not-allowed' : 'error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

        userAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
        modelAnalyserRef.current = outputAudioContextRef.current.createAnalyser();

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setStatus("connected");
                    const source = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                    const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        
                        const l = inputData.length;
                        const int16 = new Int16Array(l);
                        for (let i = 0; i < l; i++) {
                            int16[i] = inputData[i] * 32768;
                        }

                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(userAnalyserRef.current!);
                    userAnalyserRef.current!.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    processorRef.current = scriptProcessor;
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                        // Fix: Cast transcription object to 'any' to access 'isFinal' property, which is not in the official type definitions, and ensure it's a boolean.
                        const transcription = message.serverContent.outputTranscription as any;
                        const text = transcription.text;
                        const isFinal = !!transcription.isFinal;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === 'model' && !last.isFinal) {
                                last.text += text;
                                last.isFinal = isFinal;
                                return [...prev];
                            }
                            return [...prev, { role: 'model', text, isFinal }];
                        });
                    } else if (message.serverContent?.inputTranscription) {
                         // Fix: Cast transcription object to 'any' to access 'isFinal' property and ensure it's a boolean.
                        const transcription = message.serverContent.inputTranscription as any;
                        const text = transcription.text;
                        const isFinal = !!transcription.isFinal;
                        setTranscript(prev => {
                            const last = prev[prev.length - 1];
                            if (last && last.role === 'user' && !last.isFinal) {
                                last.text += text;
                                last.isFinal = isFinal;
                                return [...prev];
                            }
                            return [...prev, { role: 'user', text, isFinal }];
                        });
                    }

                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (audioData && !isMutedRef.current) {
                        const outCtx = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                        const audioBuffer = await decodeAudioData(decode(audioData), outCtx, 24000, 1);
                        const source = outCtx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(modelAnalyserRef.current!);
                        modelAnalyserRef.current!.connect(outCtx.destination);
                        source.addEventListener('ended', () => sourcesRef.current.delete(source));
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error", e);
                    setStatus("error");
                    stopConversation();
                },
                onclose: () => {
                    // This is called when the session is closed gracefully.
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        sessionRef.current = await sessionPromise;
    };

    const stopConversation = () => {
        setStatus("disconnected");
        sessionRef.current?.close();
        sessionRef.current = null;

        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;

        processorRef.current?.disconnect();
        processorRef.current = null;
        
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        userAnalyserRef.current = null;
        modelAnalyserRef.current = null;
    };

    useEffect(() => {
        return () => {
            if (sessionRef.current) {
                stopConversation();
            }
        };
    }, []);

    const isLive = status === 'connecting' || status === 'connected';

    return (
        <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg border border-[var(--border-color)] wavy-background">
            <div className="text-center p-4 border-b border-[var(--border-color)]">
                <h1 className="text-2xl font-bold text-gray-100 mb-1 font-orbitron gradient-text">{title}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-sm">{description}</p>
            </div>
            
            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                 {transcript.length === 0 && !isLive && examplePrompts && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Conversation Starters</h3>
                        <div className="space-y-3 text-center">
                            {examplePrompts.map((prompt, i) => (
                                <p key={i} className="text-gray-400 italic">"{prompt}"</p>
                            ))}
                        </div>
                    </div>
                )}
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    {transcript.map((msg, index) => (
                        <div 
                            key={index}
                            className={`flex gap-4 items-start transition-opacity duration-300 ${!msg.isFinal ? 'opacity-60' : ''} ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'model' && <Icon name="spark" className="h-8 w-8 flex-shrink-0 mt-1" />}
                            <div className={`max-w-2xl p-4 rounded-xl shadow-md relative text-gray-200 ${msg.role === 'user' ? 'bg-gray-700/50' : 'bg-gray-800/50'}`}>
                                <p className={`text-xs font-bold mb-2 tracking-wider uppercase ${msg.role === 'user' ? 'text-purple-400' : 'text-blue-400'}`}>
                                    {msg.role === 'user' ? t('liveConversation.you') : t('liveConversation.ai')}
                                </p>
                                <p className="text-gray-200 text-base whitespace-pre-wrap leading-relaxed">
                                    {msg.text || '...'}
                                </p>
                            </div>
                            {msg.role === 'user' && <div className="h-8 w-8 rounded-full bg-purple-600/80 flex items-center justify-center flex-shrink-0 mt-1 text-white" style={{boxShadow: '0 0 8px var(--glow-color-alt)'}}><span className="font-bold">U</span></div>}
                        </div>
                    ))}
                </div>
                <div ref={transcriptEndRef} />
            </div>

            <div className="p-4 border-t border-[var(--border-color)] flex flex-col items-center gap-3 bg-black/20">
                <canvas ref={canvasRef} className="w-full h-16" />
                <div className="flex items-center gap-6">
                     <button
                        onClick={() => setIsMuted(prev => !prev)}
                        className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 transition-colors"
                        aria-label={t(isMuted ? 'liveConversation.unmute' : 'liveConversation.mute')}
                        title={t(isMuted ? 'liveConversation.unmute' : 'liveConversation.mute')}
                    >
                        <Icon name={isMuted ? 'speaker_x_mark' : 'speaker_wave'} className="h-6 w-6" />
                    </button>
                    <button
                        onClick={isLive ? stopConversation : startConversation}
                        className={`group relative flex items-center justify-center w-24 h-24 rounded-full text-lg font-bold transition-all duration-300 border-4 ${
                            isLive 
                            ? 'border-red-500/80 bg-red-500/50 animate-pulse-glow-alt'
                            : 'bg-transparent border-blue-500 hover:animate-pulse-glow'
                        } text-white`}
                        style={{ "--glow-color": 'var(--glow-color)', "--glow-color-alt": 'hsl(0, 100%, 50%)'} as any}
                        aria-label={isLive ? t('liveConversation.stop') : t('liveConversation.start')}
                    >
                        <Icon name={isLive ? 'stop_circle' : 'microphone'} className="h-10 w-10 z-10" />
                    </button>
                    <div className="w-16 h-16 flex items-center justify-center text-sm text-gray-400">
                      {status === 'connected' ? <span className="text-green-500 font-semibold">{t('liveConversation.listening')}</span> : <span>{t(`liveConversation.status.${status}`)}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
