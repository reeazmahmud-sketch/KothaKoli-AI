import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';
import { Icon } from '../components/Icon';
import { fileToBase64 } from '../utils/fileUtils';

export const ImageAnalyzer: React.FC = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!selectedImage || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedImage);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = language === 'bn' 
        ? "এই ছবিটি বিস্তারিতভাবে বিশ্লেষণ করুন। আপনি যা দেখছেন তা বর্ণনা করুন, যেকোনো বস্তু শনাক্ত করুন, কোনো লেখা থাকলে তা পড়ুন এবং যেকোনো আকর্ষণীয় অন্তর্দৃষ্টি প্রদান করুন। উত্তরটি সরাসরি বাংলা ভাষায় দিন।"
        : "Analyze this image in detail. Describe what you see, identify any objects, read any text, and provide any interesting insights. Respond directly in English.";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: selectedImage.type } },
            { text: prompt }
          ]
        }
      });

      setAnalysis(response.text || '');
    } catch (err) {
      console.error(err);
      setError(t('imageAnalyzer.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-medium)] rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 border border-[var(--border-color)] wavy-background overflow-hidden">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2 font-orbitron gradient-text">{t('imageAnalyzer.title')}</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{t('imageAnalyzer.description')}</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Left Side: Upload & Preview */}
        <div className="flex flex-col gap-4 md:w-1/2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              flex-1 min-h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 cursor-pointer transition-all
              ${previewUrl ? 'border-purple-500/50 bg-purple-500/5' : 'border-gray-700 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/5'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded-lg shadow-lg" />
            ) : (
              <>
                <Icon name="image" className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-500 text-sm text-center">{t('imageAnalyzer.placeholder')}</p>
              </>
            )}
          </div>

          <div className="flex gap-2">
             <button
              onClick={handleAnalyze}
              disabled={!selectedImage || isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg hover:from-blue-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all font-semibold text-white"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/50 border-t-white animate-spin"></div>
                  <span>{t('imageAnalyzer.analyzing')}</span>
                </>
              ) : (
                <>
                  <Icon name="document_scanner" className="h-5 w-5" />
                  <span>{t('imageAnalyzer.analyze')}</span>
                </>
              )}
            </button>
            {selectedImage && (
              <button 
                onClick={handleClear}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <Icon name="trash" className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Results */}
        <div className="flex-1 flex flex-col bg-black/20 rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)] bg-white/5 flex items-center justify-between">
            <h3 className="text-sm font-bold font-orbitron text-gray-300 tracking-wider uppercase flex items-center gap-2">
              <Icon name="spark" className="h-4 w-4 text-blue-400" />
              {t('imageAnalyzer.resultTitle')}
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            {error && <p className="text-red-500 text-center">{error}</p>}
            {analysis ? (
              <div className="prose prose-invert max-w-none animate-fade-in">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis}</p>
              </div>
            ) : !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                <Icon name="document_scanner" className="w-12 h-12 mb-2" />
                <p className="text-sm italic">{language === 'bn' ? 'ফলাফল এখানে প্রদর্শিত হবে' : 'Results will appear here'}</p>
              </div>
            )}
            {isLoading && (
               <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                  <p className="text-xs text-blue-400/80 animate-pulse font-orbitron">{t('imageAnalyzer.analyzing')}</p>
               </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};