
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types';
import { Icon } from '../components/Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { LiveConversationUI } from '../components/LiveConversationUI';

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: any) => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

type GroundingSource = 'none' | 'search' | 'maps';
type ConversationMode = 'text' | 'voice';

const CHAT_HISTORY_KEY = 'kathakoli_chat_history';

// Fix: Add props interface to align with type definitions in constants.ts
interface ChatbotProps {
    openOverlay?: (overlay: 'search' | 'maps') => void;
}

export const Chatbot: React.FC<ChatbotProps> = () => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const [groundingSource, setGroundingSource] = useState<GroundingSource>('none');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const useRefrecognitionRef = useRef<SpeechRecognition | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [mode, setMode] = useState<ConversationMode>('text'); // Changed default to text for better landing experience
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamAbortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history from localStorage on initial render
  useEffect(() => {
    try {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory)) {
                setMessages(parsedHistory);
            }
        }
    } catch (error) {
        console.error("Failed to load chat history from localStorage:", error);
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } else {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
  }, [messages]);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };
  
  const handleClearChat = () => {
    if (window.confirm(t('chatbot.clearChatConfirmation'))) {
        setMessages([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);
  
  useEffect(() => () => window.speechSynthesis.cancel(), []);

  useEffect(() => {
    if (groundingSource === 'maps' && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => { setError(t('chatbot.locationError')); setGroundingSource('none'); }
      );
    }
  }, [groundingSource, userLocation, t]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) { console.warn("Speech recognition not supported."); return; }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => { console.error('Speech recognition error', event.error); setError(`${t('chatbot.speechError')}: ${event.error}`); setIsListening(false); };
    recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            else interimTranscript += event.results[i][0].transcript;
        }
        setInput(finalTranscript + interimTranscript);
    };
    
    useRefrecognitionRef.current = recognition;
    return () => recognition.stop();
  }, [language, t]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
        if (e.key.toLowerCase() === 'm') setIsTtsEnabled(p => !p);
      };
      
      const handleVoiceShortcut = (e: KeyboardEvent) => {
         if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleToggleListening();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keydown', handleVoiceShortcut);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keydown', handleVoiceShortcut);
      };
  }, []);

  const handleToggleListening = () => {
      if (!useRefrecognitionRef.current) return;
      if (isListening) useRefrecognitionRef.current.stop();
      else { setInput(''); useRefrecognitionRef.current.start(); }
  };
  
  const handleStopGenerating = () => {
    streamAbortControllerRef.current?.abort();
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    window.speechSynthesis.cancel();
    streamAbortControllerRef.current = new AbortController();

    const userMessage: ChatMessage = { role: 'user', text: input };
    const modelMessagePlaceholder: ChatMessage = { role: 'model', text: '' };
    setMessages(prev => [...prev, userMessage, modelMessagePlaceholder]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = useThinkingMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
      const config: any = { signal: streamAbortControllerRef.current.signal };
      const tools: any[] = [];
      const toolConfig: any = {};
      
      if (language === 'bn') config.systemInstruction = "You are a helpful assistant. Respond directly in Bengali. Do not use greetings like 'নমস্কার' unless the user greets you first.";
      else config.systemInstruction = "You are a helpful assistant. If the user says 'hello' and nothing else, you must reply with the single word 'হ্যালো'. For all other requests, respond in English.";

      if (groundingSource === 'search') tools.push({ googleSearch: {} });
      else if (groundingSource === 'maps' && userLocation) { tools.push({ googleMaps: {} }); toolConfig.retrievalConfig = { latLng: userLocation }; }

      if (tools.length > 0) config.tools = tools;
      if (Object.keys(toolConfig).length > 0) config.toolConfig = toolConfig;
      if (useThinkingMode) config.thinkingConfig = { thinkingBudget: 32768 };

      const responseStream = await ai.models.generateContentStream({ model: modelName, contents: userMessage.text, ... (Object.keys(config).length > 0 && { config }) });

      let fullResponseText = '';
      let groundingChunks: any[] = [];

      for await (const chunk of responseStream) {
        fullResponseText += chunk.text;
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            groundingChunks = chunk.candidates[0].groundingMetadata.groundingChunks;
        }
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: fullResponseText, groundingChunks };
            return newMessages;
        });
      }
      
      if (isTtsEnabled && fullResponseText) {
          const utterance = new SpeechSynthesisUtterance(fullResponseText);
          utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
          window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log("Stream aborted by user.");
      } else {
        console.error(err);
        setError(t('chatbot.error'));
      }
    } finally {
      setIsLoading(false);
      streamAbortControllerRef.current = null;
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    if (textareaRef.current) {
        textareaRef.current.focus();
    }
  };
  
  const liveSystemInstruction = language === 'en' ? "You are a friendly and helpful conversational AI assistant. If the user says 'hello' and nothing else, you must reply with the single word 'হ্যালো'. For all other messages, reply in English." : t('liveConversation.systemInstruction');

  // Fix: Explicitly cast t('chatbot.exampleQuestions') as any to access the array if it exists.
  const exampleQuestionsArr = (t('chatbot.exampleQuestions') as any);
  const examples = Array.isArray(exampleQuestionsArr) ? exampleQuestionsArr : [];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg border border-[var(--border-color)] overflow-hidden wavy-background">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-[var(--border-color)] text-sm">
          <div className="flex-1">
             {/* Spacer */}
          </div>
          
          <div className="flex-1 flex justify-center items-center gap-2">
            <button
                onClick={() => setMode('text')}
                className={`px-4 py-2 rounded-md transition-colors ${mode === 'text' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
            >
                {t('chatbot.textMode')}
            </button>
            <button
                onClick={() => setMode('voice')}
                className={`px-4 py-2 rounded-md transition-colors ${mode === 'voice' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
            >
                {t('chatbot.voiceMode')}
            </button>
          </div>

          <div className="flex-1 flex justify-end items-center gap-2">
            {/* Grounding */}
            <div className="group relative flex items-center bg-black/20 rounded-md p-1 border border-[var(--border-color)]">
                <span className="text-xs text-gray-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-xs group-hover:mr-2">
                  {t('chatbot.grounding')}:
                </span>
                {(['none', 'search', 'maps'] as GroundingSource[]).map(source => (
                    <button key={source} onClick={() => setGroundingSource(source)} title={source === 'none' ? 'Default' : source === 'search' ? 'Google Search' : 'Google Maps'} className={`p-1 rounded-md transition-colors ${groundingSource === source ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                        <Icon name={source === 'none' ? 'spark' : source === 'search' ? 'google' : 'google_pin'} className="h-5 w-5"/>
                    </button>
                ))}
            </div>
            <button onClick={handleClearChat} title={t('chatbot.clearChat')} className="p-1 rounded-md transition-colors text-gray-400 hover:bg-white/5 hover:text-white">
                <Icon name="trash" className="h-5 w-5" />
            </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
            {mode === 'text' ? (
              <>
                  {messages.length === 0 && !isLoading ? (
                       <div className="flex-1 flex flex-col justify-center items-center p-4 max-w-4xl mx-auto w-full">
                            <Icon name="voice_chat" className="h-16 w-16 text-blue-500/30 mb-4" />
                            <h2 className="text-2xl font-bold mb-2 gradient-text text-center">{t('chatbot.emptyStateTitle')}</h2>
                            <p className="text-gray-400 mb-8 text-center">{t('chatbot.emptyStateSubtitle')}</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                {examples.map((example: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => handleExampleClick(example)}
                                        className="text-left p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group flex items-start gap-3 active:scale-[0.98]"
                                    >
                                        <Icon name="spark" className="h-4 w-4 text-purple-400 opacity-50 group-hover:opacity-100 flex-shrink-0 mt-1" />
                                        <span className="text-sm text-gray-300 group-hover:text-white leading-tight">{example}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                  ) : (
                       <div className="flex-1 p-4 overflow-y-auto space-y-6">
                          {messages.map((msg, index) => {
                            const isStreaming = msg.role === 'model' && index === messages.length - 1 && isLoading;
                            return (
                                <div key={index} className={`flex gap-3 items-start group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  {msg.role === 'user' ? (
                                    <>
                                      <div className={`max-w-xl p-4 rounded-xl shadow-md text-gray-200 bg-gray-700/50`}>
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                      </div>
                                      <button onClick={() => handleCopyMessage(msg.text, index)} title={t('chatbot.copyMessage')} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-gray-300 self-center">
                                        <Icon name={copiedMessageIndex === index ? 'check' : 'clipboard'} className="h-4 w-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <Icon name="spark" className="h-8 w-8 flex-shrink-0 mt-1" />
                                      <div className={`max-w-xl p-4 rounded-xl shadow-md text-gray-200 bg-gray-800/50 ${isStreaming ? 'streaming-border-pulse' : 'border border-transparent'}`}>
                                        <p className="whitespace-pre-wrap">{msg.text}{isStreaming ? <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span> : ''}</p>
                                        {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-white/10">
                                              <h4 className="text-xs font-semibold text-gray-500 mb-1">{t('chatbot.sources')}</h4>
                                              <div className="flex flex-col space-y-1">{msg.groundingChunks.map((chunk, i) => { const source = chunk.web || chunk.maps; if (!source) return null; return (<a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1.5"><Icon name={chunk.web ? 'google' : 'google_pin'} className="h-4 w-4 flex-shrink-0" /><span>{source.title}</span></a>)})}</div>
                                          </div>
                                        )}
                                      </div>
                                      <div className="w-8 flex-shrink-0 flex items-center justify-center self-center">
                                        {isStreaming ? (
                                          <button onClick={handleStopGenerating} title={t('chatbot.stopGenerating')} className="text-red-500 hover:text-red-400 transition-colors">
                                            <Icon name="stop_circle" className="h-6 w-6" />
                                          </button>
                                        ) : (
                                          <button onClick={() => handleCopyMessage(msg.text, index)} title={t('chatbot.copyMessage')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-300">
                                            <Icon name={copiedMessageIndex === index ? 'check' : 'clipboard'} className="h-5 w-5" />
                                          </button>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                            )})}
                          <div ref={messagesEndRef} />
                      </div>
                  )}
                {error && <div className="p-4 text-center text-red-500 text-sm">{error}</div>}
                <div className="p-4 border-t border-[var(--border-color)] bg-black/10">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setUseThinkingMode(p => !p)}
                        title={t('chatbot.thinkingMode')}
                        className={`p-3 rounded-lg transition-colors flex-shrink-0 ${useThinkingMode ? 'text-purple-400 bg-purple-900/50' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Icon name="network_intelligence" className="h-6 w-6"/>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTtsEnabled(p => !p)}
                        title={t(isTtsEnabled ? 'chatbot.disableTts' : 'chatbot.enableTts')}
                        className={`p-3 rounded-lg transition-colors flex-shrink-0 ${isTtsEnabled ? 'text-purple-400 bg-purple-900/50' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Icon name={isTtsEnabled ? 'speaker_wave' : 'speaker_x_mark'} className="h-6 w-6" />
                    </button>
                    <textarea 
                        ref={textareaRef}
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder={t('chatbot.placeholder')} 
                        className="w-full bg-gray-800 p-3 rounded-lg border border-[var(--border-color)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all resize-none text-gray-200 placeholder:text-gray-500" 
                        rows={1} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSendMessage(e); }}} 
                    />
                    <button type="button" onClick={handleToggleListening} className={`p-3 rounded-lg transition-colors flex-shrink-0 text-white ${isListening ? 'bg-red-500 animate-pulse-glow-alt' : 'bg-purple-600 hover:bg-purple-700'}`} style={{ "--glow-color-alt": 'hsl(0, 100%, 50%)'} as any} aria-label={isListening ? 'Stop listening' : 'Start listening'}><Icon name="microphone" className={`h-6 w-6`} /></button>
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all flex-shrink-0 text-white"><Icon name="send" className="h-6 w-6" /></button>
                  </form>
                </div>
             </>
            ) : (<div className="flex-1 overflow-hidden"><LiveConversationUI title={t('liveConversation.title')} description={t('liveConversation.description')} systemInstruction={liveSystemInstruction} /></div>)}
             <style>{`textarea { scrollbar-width: none; }`}</style>
        </div>
      </div>
    </div>
  );
};
